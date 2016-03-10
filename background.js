//when url changes
chrome.tabs.onUpdated.addListener(function(info) {
    // check what url is
    chrome.tabs.query({active: true}, function(tab){
        // parse url
        url = tab[0].url;
        // console.log(url);
        // console.log(url)
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
                console.log(a.pathname);
                console.log("requesting metadata");
                chrome.tabs.executeScript(null, { // defaults to the current tab
                    file: "getmeta.js", // script to inject into page and run in sandbox
                });
            }
        }
    })
});

// listen for messages
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
                rssCall('Technology');
            break;

        default:
            // for debugging
            alert("Unmatched request of '" + request + "' from script to background.js from " + sender);
        }
    }
);

// make ajax call to rss feed
function rssCall(category){
    var feed = 'http://rss.nytimes.com/services/xml/rss/nyt/' + category + '.xml';
    console.log("getting feed: ", feed);
    $.ajax(feed, {
        accepts:{
            xml:"application/rss+xml"
        },
        dataType:"xml",
        success:function(data) {
            // limiting to 5 results
            $(data).find("item:lt(5)").each(function (i) { // or "item" or whatever suits your feed
                var el = $(this);
                console.log("------------------------");
                console.log("title      : " + el.find("title").text());
                console.log("link       : " + el.find("link").text());
            });
        }   
    });
};

// -------------------------------------------
//          STORAGE FUNCTIONS
// -------------------------------------------

initStorage();

function saveData(data){
    // metadata formatted as: headline, category, keywords, url

    // retrieve data from storage
    chrome.storage.sync.get("data", function (result) {
        // take a string retreived from storage
        // parse back into a javascript OBJECT
        var info = JSON.parse( result.data );
        console.log(info);

        var category = data.category;
        console.log("category: ", category);

        var keywords = data.keywords;
        keywords = keywords.split(",");
        console.log("keywords: ", keywords);

        info[category]['count'] ++;
        info[category]['read'].push(data.url);
        for (var i in keywords) {
            info[category]['keywords'].push(keywords[i]);
        }

        console.log(info[category]);
        
        var strData = JSON.stringify( info );
        chrome.storage.sync.set({"data": strData}, function() { 
            console.log("saved");
        });

    });

}


function initStorage(){
    var info = {
        "world": {
            count: 0,
            read: [],
            keywords: [],
            recommendation: []
        },
        "us": {
            count: 0,
            read: [],
            keywords: [],
            recommendation: []
        },
        "politics": {
            count: 0,
            read: [],
            keywords: [],
            recommendation: []
        },
        "nyregion": {
            count: 0,
            read: [],
            keywords: [],
            recommendation: []
        },
        "business": {
            count: 0,
            read: [],
            keywords: [],
            recommendation: []
        },
        "opinion": {
            count: 0,
            read: [],
            keywords: [],
            recommendation: []
        },
        "tech" : {
            count: 0,
            read: [],
            keywords: [],
            recommendation: []
        },
        "science" : {
            count: 0,
            read: [],
            keywords: [],
            recommendation: []
        },
        "health" : {
            count: 0,
            read: [],
            keywords: [],
            recommendation: []
        },
        "sports" : {
            count: 0,
            read: [],
            keywords: [],
            recommendation: []
        },
        "arts" : {
            count: 0,
            read: [],
            keywords: [],
            recommendation: []
        },
        "style" : {
            count: 0,
            read: [],
            keywords: [],
            recommendation: []
        },
        "food" : {
            count: 0,
            read: [],
            keywords: [],
            recommendation: []
        },
        "travel" : {
            count: 0,
            read: [],
            keywords: [],
            recommendation: []
        },
        "upshot": {
            count: 0,
            read: [],
            keywords: [],
            recommendation: []
        }
    }

    // var info = {
    //     topics: {
    //         "world": 0,
    //         "us": 0,
    //         "politics": 0,
    //         "nyregion": 0,
    //         "business": 0,
    //         "opinion": 0,
    //         "tech" : 0,
    //         "science" : 0,
    //         "health" : 0,
    //         "sports" : 0,
    //         "arts" : 0,
    //         "style" : 0,
    //         "food" : 0,
    //         "travel" : 0,
    //         "upshot": 0
    //     }, read: {
    //         articles: {
    //             "world": [],
    //             "us": [],
    //             "politics": [],
    //             "nyregion": [],
    //             "business": [],
    //             "opinion": [],
    //             "tech" : [],
    //             "science" : [],
    //             "health" : [],
    //             "sports" : [],
    //             "arts" : [],
    //             "style" : [],
    //             "food" : [],
    //             "travel" : [],
    //             "upshot": []
    //         }, keywords: []
    //     },
    //     shouldread: {
    //         "world": [],
    //         "us": [],
    //         "politics": [],
    //         "nyregion": [],
    //         "business": [],
    //         "opinion": [],
    //         "tech" : [],
    //         "science" : [],
    //         "health" : [],
    //         "sports" : [],
    //         "arts" : [],
    //         "style" : [],
    //         "food" : [],
    //         "travel" : [],
    //         "upshot": []
    //     }
    // }

    var data = JSON.stringify( info );

    chrome.storage.sync.set({"data": data}, function() { 
        console.log("saved ", data); 
    });
}


// storage event listener
chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
      var storageChange = changes[key];
      console.log('Storage key "%s" in namespace "%s" changed. ' +
                  'Old value was "%s", new value is "%s".',
                  key,
                  namespace,
                  storageChange.oldValue,
                  storageChange.newValue);
    }
});