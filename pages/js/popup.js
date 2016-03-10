document.addEventListener('DOMContentLoaded', function () {
	console.log("loaded");
    //when popup opens, send message to background
    chrome.runtime.sendMessage({directive: "popup-open"}, function(response) {

    });
})