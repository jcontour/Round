var source  = chrome.extension.getURL ("/pages/profile.html");
// var closesource = chrome.extension.getURL ("/pages/img/close.png");

disableScroll = function(){ $('body').css('overflow', 'hidden'); };
enableScroll = function(){ $('body').css('overflow','scroll'); };

buildProfile = function(){

	$("body").prepend("<div id='overlay'> <div id='profile-wrapper'> <iframe id='iframe-content' src=" + source + "> </iframe> </div> </div>");
	
	$("#overlay").css({
		"position": "absolute", 
		"top": $(document).scrollTop(), 
		"left": "0px", 
		"width": "100%", 
		"height": "100%", 
		"background-color": "rgba(0,0,0,.8)", 
		"z-index": "10000"
	});

	$("#profile-wrapper").css({
		"position": "absolute", 
		"top": "100px", 
		"left": "calc(50% - 520px)", 
		"width": "1040px", 
		"height": "581px", 
		"padding": "10px"
	});

	$("#iframe-content").css({
		"width": "100%",
		"height": "100%",
		"border": "none"
	})

	// $("#close").css({

	// })

	disableScroll();

}

buildProfile();

$("#overlay").click(function(){
	$("#overlay").remove()
	enableScroll();
});

$("#close").click(function(){
	$("#overlay").remove()
	enableScroll();
});
