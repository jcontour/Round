// -------------------------------------------
//          MESSAGE LISTENERS
// -------------------------------------------

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.directive) {
            case "metadata":
                console.log("receiving metadata");
                // console.log(request)
                console.log(request.isArticle);
                if (request.isArticle){
                    getTime(request.metadata, true);
                } else {
                   console.log("not article") 
                   getTime(request.metadata, false);
                };
            break;
            case "get-url":
                chrome.tabs.query( { active: true, currentWindow: true}, function(tab){
                    console.log("current url: ", tab[0].url);
                    sendResponse(tab[0].url);
                });
                return true;
            break;
            case "popup-open":
                sendResponse(showOnboarding);
                showOnboarding = false;
            break;
            case "reset-icon":
                changeIcon("normal");
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

var showOnboarding = true;

var currArticleState = false;
var prevArticleState = false;
var currTime = 0;
var prevTime = 0;
var timeSpent = 0;
var currArticleInfo, prevArticleInfo;

function getTime(data, isArticle){

    prevArticleInfo = currArticleInfo;      // saving data
    currArticleInfo = data;

    prevArticleState = currArticleState;    // saving state
    currArticleState = isArticle;

    prevTime = currTime;                    // getting time
    currTime = Date.now();

    if (prevArticleState) {                                     // if previous page was an article, save the info
        timeSpent = Math.ceil((currTime - prevTime)/1000);      // calculate time spent in seconds
        console.log("spent ", timeSpent, " seconds on ", prevArticleInfo);
        saveData(prevArticleInfo, timeSpent);
    }

    if (currArticleState){                  // automatically add current article into data, time will be logged on page change
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

function parseHabits(info, numRead){                 // function to check reading habits, is user good or need to be reminded of topic?
    console.log("checking habits...");
    console.log(numRead, " articles read");
        
    var interval = 10;

    if (numRead % interval == 0){  // check every ten articles
        
        var rounded = []
        var over = []
        var under = []

        for (var category in info['articleInfo']) {                    // load data into array
            if (category != "other"){
                if (((info['articleInfo'][category]['count'] - 1)/totalRead)*100 >= 7 && ((info['articleInfo'][category]['count'] - 1)/totalRead)*100 <= 17) {
                    rounded.push({
                        label: category,
                        percentage: (((info['articleInfo'][category]['count'] - 1)/totalRead)*100)
                    })
                } else if (((info['articleInfo'][category]['count'] - 1)/totalRead)*100 > 17){
                    over.push({
                        label: category,
                        percentage: (((info['articleInfo'][category]['count'] - 1)/totalRead)*100)
                    })
                } else if (((info['articleInfo'][category]['count'] - 1)/totalRead)*100 < 7){
                    under.push({
                        label: category,
                        percentage: (((info['articleInfo'][category]['count'] - 1)/totalRead)*100)
                    })
                }
            }
        }

        console.log("rounded ", rounded)
        console.log("over ", over)
        console.log("under ", under);

        if (rounded.length >= 6) {
            changeIcon("pos");
            console.log("you're doing great")
            feedback = 1;
        } 

        else if (under.length >= 4) {
            changeIcon("neg");
            console.log("you're missing out on ", under[getRandom(0, under.length)].label);
            feedback = 2;

        }

        else if (over.length >= 3){
            changeIcon("normal");
            console.log("you are super caught up on ", over[getRandom(0, under.length)].label, "!")
            if (under.length > 0){
                console.log("Why don't you read some ", under[getRandom(0, under.length)].label, "?");
            }
            feedback = 0;
        }

        else {
            changeIcon("normal");
            feedback = 0;
        }

        return {rounded: rounded, over: over, under: under, feedback: feedback}
    }
}

function changeIcon(icon){
    console.log("changing icon");

    switch (icon) {
        case "normal":
            chrome.browserAction.setIcon({path:"images/icon_38.png"});
        break;
        case "neg":
            chrome.browserAction.setIcon({path:"images/icon_neg_38.png"});
        break;
        case "pos":
            chrome.browserAction.setIcon({path:"images/icon_pos_38.png"});
        break;
    default:
       chrome.browserAction.setIcon({path:"images/icon_38.png"});
    }
}

// -------------------------------------------
//          STORAGE FUNCTIONS
// -------------------------------------------

function getData(callback){
    console.log("getting data");
    chrome.storage.sync.get("data", function (result) {
        var info = JSON.parse( result.data );
        callback(result);
    });
}

var totalRead = 0;

function saveData(data, timeSpent){
    // metadata formatted as: headline, category, keywords, url

    // retrieve data from storage
    chrome.storage.sync.get("data", function (result) {
        // take a string retreived from storage
        // parse back into a javascript OBJECT
        var info = JSON.parse( result.data );

        // var totalRead = info['habitInfo']['totalRead'];

        // category of article
        var category = data.category.toLowerCase();
        console.log("category: ", category);

        // check page category against storage categories
        var categories = ["world", "usa", "politics", "business", "tech", "science", "health", "opinion", "sports", "culture"];
        if (category == "us" || category == "usnews" ){
            category = "usa";
        } else if ( category ==  "books" || category == "tvandmovies" || category == "uk" || category == "movies" || category == "music" || category == "arts" || category == "style" || category == "lgbt" || category == "community" || category == "food") {
            category = "culture";
        } else if (category == "technology") {
            category = "tech";
        } else if (category == "uknews") {
            category = "world";
        } else if (categories.indexOf(category) == -1) { 
            console.log("category set as other");
            category = "other";
        }

        // getting keyword array
        var keywords = data.keywords;
        keywords = keywords.split(",");

        // if (data.url in info[category]['read']) {       // if article read already, add timespent to existing log
        if (info['articleInfo'][category]['read'].indexOf(data.url) == -1){
            // console.log("article not read ")
            console.log("adding to: ", category)
            info['articleInfo'][category]['count'] ++;
            info['articleInfo'][category]['read'].push(data.url);
            // info[category]['timeSpent'] += timeSpent;
            for (var i in keywords) {
                info['articleInfo'][category]['keywords'].push(keywords[i]);
            }
            totalRead ++;                    
        } else {                                        // if not read, add it log
            // console.log("article read ");
            console.log("adding ", timeSpent, " to log");
            info['articleInfo'][category]['timeSpent'] += timeSpent;
        }

        var habits = parseHabits(info, totalRead);
        console.log("habit data ", habits);
        info['habitInfo']['feedback'] = habits;
        info['habitInfo']['totalRead'] = totalRead;

        var today = new Date;
        var date = today.getFullYear() + " " + today.getMonth() + " " + today.getDate();
        console.log('today ', date);

        if (info['habitInfo']['readPerDay'].hasOwnProperty(date)){
            info['habitInfo']['readPerDay'][date] ++;
        } else {
            info['habitInfo']['readPerDay'][date] = 1;
        }
        
        console.log("habit info being saved ", info['habitInfo']);

        // convert back into JSON and save
        var strData = JSON.stringify( info );
        chrome.storage.sync.set({"data": strData}, function() { 
            // console.log("saved data", strData);
        });
    });
}


function initStorage(){
    var info = {
        articleInfo : {
            "world": {
                count: 1,
                read: [],
                keywords: [],
                timeSpent: 0
            },
            "usa": {
                count: 1,
                read: [],
                keywords: [],
                timeSpent: 0
            },
            "politics": {
                count: 1,
                read: [],
                keywords: [],
                timeSpent: 0
            },
            "business": {
                count: 1,
                read: [],
                keywords: [],
                timeSpent: 0
            },
            "tech" : {
                count: 1,
                read: [],
                keywords: [],
                timeSpent: 0
            },
            "science" : {
                count: 1,
                read: [],
                keywords: [],
                timeSpent: 0
            },
            "health" : {
                count: 1,
                read: [],
                keywords: [],
                timeSpent: 0
            },
            "opinion": {
                count: 1,
                read: [],
                keywords: [],
                timeSpent: 0
            },
            "sports" : {
                count: 1,
                read: [],
                keywords: [],
                timeSpent: 0
            },
            "culture" : {
                count: 1,
                read: [],
                keywords: [],
                timeSpent: 0,
                subCategories : {}
            },
            "other" : {
                count: 0,
                read: [],
                keywords: [],
                timeSpent: 0,
                subCategories : {}
            }
        },
        habitInfo: {
            totalRead : 0,
            feedback : {},
            readPerDay : {
                "2016 3 8" : 2,
                "2016 3 9" : 6,
                "2016 3 10" : 4,
                "2016 3 11" : 7,
            }
        }
    }

    var data = JSON.stringify( info );

    chrome.storage.sync.set({"data": data}, function() { 
        // console.log("saved ", data); 
    });
}

initStorage();

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