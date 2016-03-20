console.log("getting buzzfeed metadata");
// getting page metadata
var headline = $('meta[name=title]').attr("content");
var category = $('meta[property="article:section"]').attr("content");
var keywords = $('meta[name="news_keywords"]').attr("content");
var url = $('meta[property="og:url"]').attr("content");

var metadata = {
    headline: headline,
    category: category,
    keywords: keywords,
    url: url
};

chrome.runtime.sendMessage({directive: "metadata", metadata: metadata});