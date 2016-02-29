var value = 0;

//when url changes
chrome.tabs.onUpdated.addListener(function(info) {
    // check what url is
    chrome.tabs.query({active: true}, function(tab){
        // parse url
        url = tab[0].url;
        var a = $('<a>', { href:url } )[0];
        // are we on nytimes
        if (a.hostname == "www.nytimes.com"){
            var path = a.pathname;
            var splitpath = path.split("/");
            splitpath.shift();

            // checking if first value in array is a four digit number (specific to how nytimes formats article urls)
            if ( !isNaN(splitpath[0]) && splitpath[0].length == 4) {
                console.log(a.pathname);
            }
        }
    })
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.directive) {
        case "profile-click":
            // execute the content script
            chrome.tabs.executeScript(null, { // defaults to the current tab
                file: "contentscript.js", // script to inject into page and run in sandbox
            });
            sendResponse({}); // sending back response to sender
            break;

        default:
            // helps debug when request directive doesn't match
            alert("Unmatched request of '" + request + "' from script to background.js from " + sender);
        }
    }
);