console.log("getting metadata");
// getting page metadata
var headline = $('meta[name=hdl]').attr("content");
var category = $('meta[name=CG]').attr("content");
var keywords = $('meta[name=keywords]').attr("content");
var url = $('meta[property="og:url"]').attr("content");

var metadata = {
    headline: headline,
    category: category,
    keywords: keywords,
    url: url
};

chrome.runtime.sendMessage({directive: "metadata", metadata: metadata});