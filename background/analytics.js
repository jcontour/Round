// chrome.tabs.getSelected(null,function(tab) {
//     var url = tab.url;
//     console.log(url);
// });

// chrome.tabs.query({active: true}, function(tab){
// 	console.log(tab[0].url);
// })

chrome.tabs.onActivated.addListener(function(info) {
	chrome.tabs.query({active: true}, function(tab){
		var url = tab[0].url;
		console.log(url);
	})
});