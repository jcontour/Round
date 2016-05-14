chrome.runtime.sendMessage({directive: "get-url"}, function(response) {
    console.log("url response ------------------ ", response);
    getMeta(response);
});

function getMeta(url){

    // parse url
    var a = $('<a>', { href:url } )[0];
    // check site
    console.log("host: ", a.hostname);
    var hostname = a.hostname;

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
                nyt(function(metadata){
                    console.log(metadata);
                    chrome.runtime.sendMessage({directive: "metadata", metadata: metadata, isArticle: true});
                })
            } else {
                chrome.runtime.sendMessage({directive: "metadata", isArticle: false});
            }
        break;
        // case "well.blogs.nytimes.com":
        //     console.log("nyt");

        //     var path = a.pathname;
        //     var splitpath = path.split("/");
        //     splitpath.shift();
        //     // checking if first value in array is a four digit number (specific to how nytimes formats article urls)
        //     if ( !isNaN(splitpath[0]) && splitpath[0].length == 5) {
        //         // console.log(a.pathname);
        //         console.log("requesting nyt metadata");
        //         nyt(function(metadata){
        //             console.log(metadata);
        //             chrome.runtime.sendMessage({directive: "metadata", metadata: metadata, isArticle: true});
        //         })
        //     } else {
        //         chrome.runtime.sendMessage({directive: "metadata", isArticle: false});
        //     }
        // break
        case "www.buzzfeed.com":
            console.log("buzzfeed");

            var path = a.pathname;
            var splitpath = path.split("/");
            splitpath.shift();
            if ( splitpath.length == 2 ) {
                // console.log(a.pathname);
                console.log("requesting buzzfeed metadata");
                buzzfeed(function(metadata){
                    console.log(metadata);
                    chrome.runtime.sendMessage({directive: "metadata", metadata: metadata, isArticle: true});
                }) 
            } else {
                chrome.runtime.sendMessage({directive: "metadata", isArticle: false});
            }            
        break;
        default:
            console.log("not in site list");
            chrome.runtime.sendMessage({directive: "metadata", isArticle: false});
    }
}


function nyt(callback){
    console.log("getting nyt metadata");
    // getting page metadata
    var headline = $('meta[name=hdl]').attr("content");
    var category = $('meta[name=CG]').attr("content");

    if (category == "us" && $('meta[name=SCG]').attr("content") == "politics") {
        category = "politics"
    }
    // var keywords = $('meta[name=keywords]').attr("content");
    var url = $('meta[property="og:url"]').attr("content");

    var metadata = {
        site: "nyt",
        headline: headline,
        category: category,
        // keywords: keywords,
        url: url
    };

    callback(metadata);
}

function buzzfeed(callback){
    console.log("getting buzzfeed metadata");
    // getting page metadata
    var headline = $('meta[name=title]').attr("content");
    var category = $('meta[property="article:section"]').attr("content");
    // var keywords = $('meta[name="news_keywords"]').attr("content");
    var url = $('meta[property="og:url"]').attr("content");

    var metadata = {
        site: "buzzfeed",
        headline: headline,
        category: category,
        // keywords: keywords,
        url: url
    };

    callback(metadata);
}