disableScroll = function(){ $('body').css('overflow', 'hidden'); };
enableScroll = function(){ $('body').css('overflow','scroll'); };

overlay = function(){
	console.log("building profile");

	$("body").prepend("<div id='overlay'> </div>");
	
	$("#overlay").css({
		"position": "absolute", 
		"top": $(document).scrollTop(), 
		"left": "0px", 
		"width": "100%", 
		"height": "100%", 
		"background-color": "rgba(0,0,0,.8)", 
		"z-index": "10000",
		"display": "none"
	});

	$('#overlay').fadeIn("fast");

	disableScroll();

}

overlay();
console.log("made overlay");

$("#overlay").click(function(){
	$("#overlay").remove()
	enableScroll();
});
