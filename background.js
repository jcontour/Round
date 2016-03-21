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
        getMeta(a.hostname, url, a);
    })
});

// calling content script to get page metadata
function getMeta(hostname, url, a){

    switch (hostname) {
        case "www.nytimes.com":
            console.log("nyt");

            var path = a.pathname;
            var splitpath = path.split("/");
            splitpath.shift();
            // checking if first value in array is a four digit number (specific to how nytimes formats article urls)
            if ( !isNaN(splitpath[0]) && splitpath[0].length == 4) {
                // console.log(a.pathname);
                console.log("requesting nyt metadata");
                chrome.tabs.executeScript(null, { // defaults to the current tab
                    file: "getnytmeta.js", // script to inject into page and run in sandbox
                });
            }
        break;
        case "www.buzzfeed.com":
            console.log("buzzfeed");

            var path = a.pathname;
            var splitpath = path.split("/");
            splitpath.shift();
            if ( splitpath.length == 2 ) {
                // console.log(a.pathname);
                console.log("requesting buzzfeed metadata");
                chrome.tabs.executeScript(null, {
                    file: "getbfmeta.js", 
                });
            }            
        break;
        default:
            console.log("not in site list");
    }
}

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
        var category = data.category.toLowerCase();
        console.log("category: ", category);

        // check against storage categories
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

        // if it hasn't been read already
        // add it to the storage
        if (info[category]['read'].indexOf(data.url) == -1){
            console.log("adding to: ", category)
            info[category]['count'] ++;
            info[category]['read'].push(data.url);
            if ( category !== data.category.toLowerCase() ) {
                info[category]['subcategories'].push(data.category.toLowerCase());
            }
            // for (var i in keywords) {
            //     info[category]['keywords'].push(keywords[i]);
            // }
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
            subcategories: []
        },
        "usa": {
            count: 1,
            read: [],
            subcategories: []
        },
        "politics": {
            count: 1,
            read: [],
            subcategories: []
        },
        "business": {
            count: 1,
            read: [],
            subcategories: []
        },
        "tech" : {
            count: 1,
            read: [],
            subcategories: []
        },
        "science" : {
            count: 1,
            read: [],
            subcategories: []
        },
        "health" : {
            count: 1,
            read: [],
            subcategories: []
        },
        "opinion": {
            count: 1,
            read: [],
            subcategories: []
        },
        "sports" : {
            count: 1,
            read: [],
            subcategories: []
        },
        "culture" : {
            count: 1,
            read: [],
            subcategories: []
        },
        "other" : {
            count: 1,
            read: [],
            subcategories: []
        }
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