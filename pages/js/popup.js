function articleHandler(e) {
    chrome.runtime.sendMessage({directive: "article-click"}, function(response) {
    	$("body").append("<p>" + response.value + "</p>");
        // this.close(); // close the popup when the background finishes processing request
    });
}

function profileHandler(e) {
    chrome.runtime.sendMessage({directive: "profile-click"}, function(response) {
        // this.close(); // close the popup when the background finishes processing request
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('article').addEventListener('click', articleHandler);
    document.getElementById('profile').addEventListener('click', profileHandler);
})