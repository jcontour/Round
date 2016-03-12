// -------------------------------------------
//          TRACKING FUNCTIONS
// -------------------------------------------

//when url changes
chrome.tabs.onUpdated.addListener(function(info) {
    // check what url is
    chrome.tabs.query({active: true, currentWindow: true}, function(tab){
        // parse url
        url = tab[0].url;

        var a = $('<a>', { href:url } )[0];
        // are we on nytimes
        console.log(a.hostname);
        // parse url
        if (a.hostname == "www.nytimes.com"){
            var path = a.pathname;
            var splitpath = path.split("/");
            splitpath.shift();
            // checking if first value in array is a four digit number (specific to how nytimes formats article urls)
            if ( !isNaN(splitpath[0]) && splitpath[0].length == 4) {
                // console.log(a.pathname);
                // console.log("requesting metadata");
                chrome.tabs.executeScript(null, { // defaults to the current tab
                    file: "getmeta.js", // script to inject into page and run in sandbox
                });
            }
        } 
    })
});

// -------------------------------------------
//          ON MESSAGE FUNCTIONS
// -------------------------------------------

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.directive) {
            case "metadata":
                console.log("receiving metadata");
                console.log(request.metadata);
                saveData(request.metadata);
            break;
            case "popup-open":
                console.log("popup open");
                getData(function(data){
                    console.log("got data: ", data);
                    sendResponse("hello");          // THIS RESPONSE IS NOT SENDING  <-----------------------------------------------------!!!!!
                });
            break;

        default:
            // for debugging
            alert("BG.JS MESSAGE OOPS");
            // alert("Unmatched request of '" + request + "' from script to background.js from " + sender);
        }
    }
);

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

function saveData(data){
    // metadata formatted as: headline, category, keywords, url

    // retrieve data from storage
    chrome.storage.sync.get("data", function (result) {
        // take a string retreived from storage
        // parse back into a javascript OBJECT
        var info = JSON.parse( result.data );

        // category of article
        var category = data.category;
        console.log("category: ", category);

        // check against storage categories
        var categories = ["world", "us", "politics", "nyregion", "business", "opinion", "tech", "science", "health", "sports", "arts", "fashion"];
        if (categories.indexOf(category) == -1) { 
            console.log("category set as other");
            category = "other"; 
        }

        // getting keyword array
        var keywords = data.keywords;
        keywords = keywords.split(",");

        // if it hasn't been read already
        // add it to the storage
        if (info[category]['read'].indexOf(data.url) == -1){
            console.log("adding to: ", category)
            info[category]['count'] ++;
            info[category]['read'].push(data.url);
            for (var i in keywords) {
                info[category]['keywords'].push(keywords[i]);
            }
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
            count: 0.5,
            read: [],
            keywords: [],
            recommendation: []
        },
        "us": {
            count: 0.5,
            read: [],
            keywords: [],
            recommendation: []
        },
        "politics": {
            count: 0.5,
            read: [],
            keywords: [],
            recommendation: []
        },
        "nyregion": {
            count: 0.5,
            read: [],
            keywords: [],
            recommendation: []
        },
        "business": {
            count: 0.5,
            read: [],
            keywords: [],
            recommendation: []
        },
        "opinion": {
            count: 0.5,
            read: [],
            keywords: [],
            recommendation: []
        },
        "tech" : {
            count: 0.5,
            read: [],
            keywords: [],
            recommendation: []
        },
        "science" : {
            count: 0.5,
            read: [],
            keywords: [],
            recommendation: []
        },
        "health" : {
            count: 0.5,
            read: [],
            keywords: [],
            recommendation: []
        },
        "sports" : {
            count: 0.5,
            read: [],
            keywords: [],
            recommendation: []
        },
        "arts" : {
            count: 0.5,
            read: [],
            keywords: [],
            recommendation: []
        },
        "fashion" : {
            count: 0.5,
            read: [],
            keywords: [],
            recommendation: []
        },
        "other": {
            count: 0,
            read: [],
            keywords: [],
            recommendation: []
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