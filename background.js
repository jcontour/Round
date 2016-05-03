// -------------------------------------------
//          CHROME LISTENERS
// -------------------------------------------

chrome.runtime.onInstalled.addListener(function (details) {
    if(details.reason == 'install') { initStorage() };
});


// chrome.runtime.onStartup.addListener(function(){
//     var default_data = initData();
//     chrome.storage.sync.get({data: default_data}, function(result) {
//         console.log("data ", result);
//         // If "data" wasn't present in storage, result.data is a copy of default_data
//         // Otherwise, result.data is a copy of the actual stored value
//         chrome.storage.sync.set(result); // To save the default, if not saved
//     });
// });


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.directive) {
            case "metadata":
                console.log("receiving metadata");
                // console.log(request)
                console.log(request.isArticle);
                if (request.isArticle) {
                    getTime(request.metadata, true);
                } else {
                    console.log("not article")
                    getTime(request.metadata, false);
                };
                break;
            case "get-url":
                chrome.tabs.query({ active: true, currentWindow: true }, function(tab) {
                    // console.log("current url: ", tab[0].url);
                    sendResponse(tab[0].url);
                });
                return true;
                break;
            case "popup-open":
                sendResponse("hello");
                break;
            case "reset-icon":
                changeIcon("normal");
                break;
            case "onboarding-false":
                onboardingFalse();
                break;
            default:
                // for debugging
                alert("BG.JS MESSAGE OOPS");
                // alert("Unmatched request of '" + request + "' from script to background.js from " + sender);
        }
    }
);


// -------------------------------------------
//          OTHER FUNCTIONS
// -------------------------------------------

var currArticleState = false;
var prevArticleState = false;
var currTime = 0;
var prevTime = 0;
var timeSpent = 0;
var currArticleInfo, prevArticleInfo;

function getTime(data, isArticle) {

    prevArticleInfo = currArticleInfo;          // saving data
    currArticleInfo = data;

    prevArticleState = currArticleState;        // saving state
    currArticleState = isArticle;

    prevTime = currTime;                        // getting time
    currTime = Date.now();

    if (prevArticleState) {                     // if previous page was an article, save the info
        timeSpent = Math.ceil((currTime - prevTime) / 1000); // calculate time spent in seconds
        // console.log("spent ", timeSpent, " seconds on ", prevArticleInfo);
        saveData(prevArticleInfo, timeSpent);
    }

    if (currArticleState) {                     // automatically add current article into data, time will be logged on page change
        saveData(currArticleInfo, 0);
    }
}


function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// -------------------------------------------
//          HABIT FUNCTIONS
// -------------------------------------------

var feedback = 0;

function parseHabits(info, numRead) {           // function to check reading habits, is user good or need to be reminded of topic?
    console.log("checking habits...");
    console.log(numRead, " articles read");

    var interval = 10;

    if (numRead % interval == 0) {              // check every ten articles

        var rounded = []
        var over = []
        var under = []

        for (var category in info['articleInfo']) { // load data into array
            if (category != "other") {
                if (((info['articleInfo'][category]['count'] - 1) / totalRead) * 100 >= 7 && ((info['articleInfo'][category]['count'] - 1) / totalRead) * 100 <= 17) {
                    rounded.push({
                        label: category,
                        percentage: (((info['articleInfo'][category]['count'] - 1) / totalRead) * 100)
                    })
                } else if (((info['articleInfo'][category]['count'] - 1) / totalRead) * 100 > 17) {
                    over.push({
                        label: category,
                        percentage: (((info['articleInfo'][category]['count'] - 1) / totalRead) * 100)
                    })
                } else if (((info['articleInfo'][category]['count'] - 1) / totalRead) * 100 < 7) {
                    under.push({
                        label: category,
                        percentage: (((info['articleInfo'][category]['count'] - 1) / totalRead) * 100)
                    })
                }
            }
        }

        // console.log("rounded ", rounded)
        // console.log("over ", over)
        // console.log("under ", under);

        if (rounded.length >= 6) {
            changeIcon("pos");
            // console.log("you're doing great")
            feedback = 1;
        } else if (under.length >= 4) {
            changeIcon("neg");
            // console.log("you're missing out on ", under[getRandom(0, under.length)].label);
            feedback = 2;

        } else if (over.length >= 3) {
            changeIcon("normal");
            // console.log("you are super caught up on ", over[getRandom(0, under.length)].label, "!")
            // if (under.length > 0) {
            //     // console.log("Why don't you read some ", under[getRandom(0, under.length)].label, "?");
            // }
            feedback = 0;
        } else {
            changeIcon("normal");
            feedback = 0;
        }

        return { rounded: rounded, over: over, under: under, feedback: feedback }
    
    } else {

        changeIcon("normal");
        feedback = 0;
        return { rounded: null, over: null, under: null, feedback: feedback }
    
    }
}

function changeIcon(icon) {
    console.log("changing icon");

    switch (icon) {
        case "normal":
            chrome.browserAction.setIcon({ path: "images/icon_38.png" });
            break;
        case "neg":
            chrome.browserAction.setIcon({ path: "images/icon_neg_38.png" });
            break;
        case "pos":
            chrome.browserAction.setIcon({ path: "images/icon_pos_38.png" });
            break;
        default:
            chrome.browserAction.setIcon({ path: "images/icon_38.png" });
    }
}

// -------------------------------------------
//          STORAGE FUNCTIONS
// -------------------------------------------

function getData(callback) {
    console.log("getting data");
    chrome.storage.sync.get("data", function(result) {
        var info = JSON.parse(result.data);
        callback(result);
    });
}

var totalRead = 0;
var yesterday = null;

function saveData(data, timeSpent) {
    // metadata formatted as: headline, category, keywords, url

    // retrieve data from storage
    chrome.storage.sync.get("data", function(result) {
        // take a string retreived from storage
        // parse back into a javascript OBJECT
        var info = JSON.parse(result.data);

        // var totalRead = info['habitInfo']['totalRead'];
        console.log("info ", info);
        // category of article
        var category = data.category.toLowerCase();
        console.log("category: ", category);

        // check page category against storage categories
        var categories = ["world", "usa", "politics", "business", "tech", "science", "health", "opinion", "sports", "culture"];
        if (category == "us" || category == "usnews") {
            category = "usa";
        } else if (category == "books" || category == "tvandmovies" || category == "uknews" || category == "uk" || category == "movies" || category == "music" || category == "arts" || category == "fashion" || category == "style" || category == "lgbt" || category == "community" || category == "food") {

            // adding subcategories
            if (info['articleInfo']["culture"]["subcategories"].hasOwnProperty(category)) {
                info['articleInfo']["culture"]["subcategories"][category]["count"] ++;
            } else {
                info['articleInfo']["culture"]["subcategories"][category] = {count: 1}
            }

            category = "culture";
        } else if (category == "technology") {
            category = "tech";
        } else if (category == "longform") {
            category = "opinion";
        } else if (categories.indexOf(category) == -1) {
            console.log("category set as other");

            // adding subcategories
            if (info['articleInfo']["other"]["subcategories"].hasOwnProperty(category)) {
                info['articleInfo']["other"]["subcategories"][category]["count"] ++;
            } else {
                info['articleInfo']["other"]["subcategories"][category] = {count: 1}
            }

            category = "other";
        }
        
        articleRead(function(read){
            if (!read) {

                console.log("adding to: ", category)
                
                info['articleInfo'][category]['count']++;
                info['articleInfo'][category]['read'].push({title: data.headline, url: data.url});
                
                totalRead++;
            } else { 

                console.log("adding ", timeSpent, " to log");
                info['articleInfo'][category]['timeSpent'] += timeSpent;
            }
        })

        function articleRead(callback) {
            var articleRead;
            for (var i = 0; i < info['articleInfo'][category]['read'].length; i++) {
                if (info['articleInfo'][category]['read'][i]['title'] == data.headline) {
                    articleRead = true;
                } else {
                    articleRead = false;
                }
            }
            callback(articleRead);
        }

        var habits = parseHabits(info, totalRead);
        console.log("habit data ", habits);
        info['habitInfo']['feedback'] = habits;
        info['habitInfo']['totalRead'] = totalRead;

        // ------------------
        //  checking date for line graph
        // ------------------

        var today = new Date;

        var date = today.getFullYear() + " " + (today.getMonth() + 1) + " " + today.getDate();
        console.log('today ', date);
        console.log('yesterday ', yesterday);

        if (yesterday != date) {
            for (topic in info['articleInfo']){
                console.log("starting new day of reading");
                info['articleInfo'][topic]['countPerDay'].push({ date: date, count: 0 })
                yesterday = date;
            }
        }

        for (var i = 0; i < info['articleInfo'][category]['countPerDay'].length; i++) {
            if (info['articleInfo'][category]['countPerDay'][i]['date'] == date) {
                info['articleInfo'][category]['countPerDay'][i]['count']++;
            }
        }

        function dateCheck(callback) {
            var dateExists;
            for (var i = 0; i < info['articleInfo'][category]['countPerDay'].length; i++) {
                if (info['articleInfo'][category]['countPerDay'][i]['date'] == date) {
                    dateExists = true;
                } else {
                    dateExists = false;
                }
            }
            callback(dateExists);
        }

        // convert back into JSON and save
        var strData = JSON.stringify(info);
        // console.log(strData);
        chrome.storage.sync.set({ "data": strData }, function() {
            // console.log("saved data", strData);
        });
    });
}

function initStorage() {
    var info = {
        articleInfo: {
            "world": {
                count: 1,
                countPerDay: [
                // {date : "2016 4 17", count: "1"},
                // {date : "2016 4 18", count: "3"},
                // {date : "2016 4 19", count: "4"}
                ],
                read: [],
                timeSpent: 0
            },
            "usa": {
                count: 1,
                countPerDay: [
                // {date : "2016 4 17", count: "2"},
                // {date : "2016 4 18", count: "5"},
                // {date : "2016 4 19", count: "3"}
                ],
                read: [],
                timeSpent: 0
            },
            "politics": {
                count: 1,
                countPerDay: [
                // {date : "2016 4 17", count: "0"},
                // {date : "2016 4 18", count: "1"},
                // {date : "2016 4 19", count: "0"}
                ],
                read: [],
                // keywords: [],
                timeSpent: 0
            },
            "business": {
                count: 1,
                countPerDay: [
                // {date : "2016 4 17", count: "2"},
                // {date : "2016 4 18", count: "1"},
                // {date : "2016 4 19", count: "0"}
                ],
                read: [],
                timeSpent: 0
            },
            "tech": {
                count: 1,
                countPerDay: [
                // {date : "2016 4 17", count: "2"},
                // {date : "2016 4 18", count: "4"},
                // {date : "2016 4 19", count: "5"}
                ],
                read: [],
                timeSpent: 0
            },
            "science": {
                count: 1,
                countPerDay: [
                // {date : "2016 4 17", count: "5"},
                // {date : "2016 4 18", count: "4"},
                // {date : "2016 4 19", count: "4"}
                ],
                read: [],
                timeSpent: 0
            },
            "health": {
                count: 1,
                countPerDay: [
                // {date : "2016 4 17", count: "0"},
                // {date : "2016 4 18", count: "2"},
                // {date : "2016 4 19", count: "1"}
                ],
                read: [],
                timeSpent: 0
            },
            "opinion": {
                count: 1,
                countPerDay: [
                // {date : "2016 4 17", count: "1"},
                // {date : "2016 4 18", count: "1"},
                // {date : "2016 4 19", count: "0"}
                ],
                read: [],
                timeSpent: 0
            },
            "sports": {
                count: 1,
                countPerDay: [
                // {date : "2016 4 17", count: "0"},
                // {date : "2016 4 18", count: "0"},
                // {date : "2016 4 19", count: "1"}
                ],
                read: [],
                timeSpent: 0
            },
            "culture": {
                count: 1,
                countPerDay: [
                // {date : "2016 4 17", count: "3"},
                // {date : "2016 4 18", count: "0"},
                // {date : "2016 4 19", count: "2"}
                ],
                read: [],
                subcategories: {},
                timeSpent: 0,
                subcategories: {}
            },
            "other": {
                count: 0,
                countPerDay: [
                // {date : "2016 4 17", count: "0"},
                // {date : "2016 4 18", count: "5"},
                // {date : "2016 4 19", count: "6"}
                ],
                read: [],
                subcategories: {},
                timeSpent: 0,
                subcategories: {}
            }
        },
        habitInfo: {
            totalRead: 0,
            feedback: {},
            doShowOnboarding: true
        }
    }

    var today = new Date;
    var date = today.getFullYear() + " " + (today.getMonth() + 1) + " " + today.getDate();
    for (topic in info['articleInfo']){
        info['articleInfo'][topic]['countPerDay'].push({ date: date, count: 0 })
        yesterday = date;
    }

    var data = JSON.stringify(info);

    chrome.storage.sync.set({ "data": data }, function() {
        console.log("saved ", data); 
    });
}

function onboardingFalse(){         // do not show onboarding again
    chrome.storage.sync.get("data", function(result) {
        var info = JSON.parse(result.data);
        info.habitInfo.doShowOnboarding = false;
        console.log(info);
        var strData = JSON.stringify(info);
        chrome.storage.sync.set({ "data": strData });
    });
}

// ----------------------------
// storage event listener
// debugging purposes
// ----------------------------

// chrome.storage.onChanged.addListener(function(changes, namespace) {
//     for (key in changes) {
//       var storageChange = changes[key];
//       console.log('Storage key "%s" in namespace "%s" changed. ' +
//                   'Old value was "%s", new value is "%s".',
//                   key,
//                   namespace,
//                   storageChange.oldValue,
//                   storageChange.newValue);
//     }
// });
