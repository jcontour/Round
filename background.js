var value = 0;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.directive) {
        case "article-click":
            var url;

            chrome.tabs.query({active: true}, function(tab){
                    url = tab[0].url;
                    console.log(url);
            })

            // execute the content script
            // chrome.tabs.executeScript(null, { // defaults to the current tab
            //     file: "contentscript.js", // script to inject into page and run in sandbox
            //     // allFrames: true // This injects script into iframes in the page and doesn't work before 4.0.266.0.
            // });

            console.log("article button clicked");
            value ++;
            sendResponse({value: value}); // sending back response
            break;

        case "profile-click":
            // execute the content script
            chrome.tabs.executeScript(null, { // defaults to the current tab
                file: "contentscript.js", // script to inject into page and run in sandbox
                // allFrames: true // This injects script into iframes in the page and doesn't work before 4.0.266.0.
            });
            console.log("profile button clicked");
            sendResponse({data: "this is profile data!!"}); // sending back response to sender
            break;
        default:
            // helps debug when request directive doesn't match
            alert("Unmatched request of '" + request + "' from script to background.js from " + sender);
        }
    }
);