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

function saveData(data, timeSpent){
    // metadata formatted as: headline, category, keywords, url

    // retrieve data from storage
    chrome.storage.sync.get("data", function (result) {
        // take a string retreived from storage
        // parse back into a javascript OBJECT
        var info = JSON.parse( result.data );

        // category of article
        var category = data.category.toLowerCase();
        console.log("category: ", category);

        // check page category against storage categories
        var categories = ["world", "usa", "politics", "business", "tech", "science", "health", "opinion", "sports", "culture"];
        if (category == "us" || category == "usnews" ){
            category = "usa";
        } else if ( category ==  "books" || category == "uk" || category == "movies" || category == "music" || category == "arts" || category == "style" || category == "lgbt" || category == "community" || category == "food") {
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
        if (info[category]['read'].indexOf(data.url) == -1){
            console.log("article not read")
            console.log("adding to: ", category)
            info[category]['count'] ++;
            info[category]['read'].push(data.url);
            // info[category]['timeSpent'] += timeSpent;
            for (var i in keywords) {
                info[category]['keywords'].push(keywords[i]);
            }                    
        } else {                                        // if not read, add it log
            console.log("article read already");
            console.log("adding ", timeSpent, " to log");
            info[category]['timeSpent'] += timeSpent;    
        }
        
        // convert back into JSON and save
        var strData = JSON.stringify( info );
        chrome.storage.sync.set({"data": strData}, function() { 
            console.log("saved data", strData);
        });
    });
}


function initStorage(){
    var info = {
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
            timeSpent: 0
        },
        "other" : {
            count: 1,
            read: [],
            keywords: [],
            timeSpent: 0
        }, 
    }

    var data = JSON.stringify( info );

    chrome.storage.sync.set({"data": data}, function() { 
        console.log("saved ", data); 
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