document.addEventListener('DOMContentLoaded', function () {
	console.log("popup-loaded");
    getData();
});

function getData() {
    chrome.storage.sync.get("data", function (result) {
        var parsed = JSON.parse( result.data );

        var articleInfo = parsed.articleInfo;
        // var habitInfo = parsed.habitInfo;

        var data = []
        console.log("init graph");

        for (var category in articleInfo) {                    // load data into array
            // console.log(category, " ", articleInfo[category]['count']);
            data.push({
                label: category,
                count: (articleInfo[category]['count'])      // transform count to show less-read sections
            })

            console.log ("data ", data)
        }

        // check to see if anything has been read
        if (data.every(isZero)){        
            $('#logo').hide();      // if nothing is read, show onboarding
            $('#go-profile').hide();
            onboarding();
        } else {        
            initGraph(data);            // otherwise, show graph
            showProfile(profile);
            listen();
        }
    });
}

function isZero(value, index, ar){      // checking count values
    console.log(value.label, " ", value.count);
    if (value.label != "other" && value.count == 1){
        return true;
    } else if (value.label == "other" && value.count == 0) {
        return true;
    } else if (value.label == "other" && value.count > 0) {
        return false;
    } else {
        return false;
    }
}

function onboarding(){          // init onboarding

    $('#chart').append(" <div id='onboarding'> </div> <div id='onboard-text'></div> <div id='slide-up'> \> \> \> </div>")
    $('#onboarding').css("background-image", "url(img/onboarding01.png)");
    $('#onboarding').css("background-size", "80%");
    $('#onboard-text').html('<p>The news that you consume makes up your view of the world</p><p>Round helps you see the full picture</p>');
    listen();
}

function slideChange(slide){    // change onboarding slides on click
    switch(slide){
        case 1:
            $('#onboarding').css("background-image", "url(img/onboarding01.png)");
            $('#onboarding').css("background-size", "80%");
            $('#onboard-text').html('<p>The news that you consume makes up your view of the world.</p><p>Round helps you see the full picture.</p>');
            break;
        case 2: 
            $('#onboarding').css("background-position", "75% 50%");
            $('#onboarding').css("background-size", "contain");
            $('#onboarding').css("background-image", "url(img/onboarding02.png)");
            $('#onboard-text').html('<p>Round works in the background, taking notes when you read the news.</p>');
            break;
        case 3: 
            $('#onboarding').css("background-position", "center center");
            $('#onboarding').css("background-image", "url(img/onboarding03.png)");
            $('#onboard-text').html('<p>If Round notices that you haven\'t seen something important, it\'ll let you know!</p>');
            break;
        case 4: 
            $('#onboarding').css("background-image", "url(img/onboarding04.png)");
            $('#onboard-text').html('<p>Your reading profile prioritises the topic areas that you might have overlooked</p><p>If you need some help catching up, click on a topic for the latest articles.</p>');
            break;
        case 5: 
            $('#onboarding').css("background-image", "url(img/onboarding05.png)");
            $('#slide-up').text("Help me out here!").css("font-style", "italic");
            $('#onboard-text').html('<p>Let\'s get started!</p> <p>Read articles as you would normally, or start with some suggestions.</p>');
            break;
    }
}

var slide = 1;
var profile = false;

function listen(){      //  event listeners

    $('#slide-up').on('click', function(){      // change slide button
        if (slide < 5) {                        // going through 5 slides
            slide ++;
            slideChange(slide);
         } else {                               // on last slide, button calls rss for recommendations
            callRSS({"site": "nyt", "category": "MostViewed"});
            callRSS({"site": "bf", "category": "index"});
         }
    })

    $('.rss-wrapper').off('click').on('click', function(){   // on article click, open new tab with link
        console.log("clicked link: ", $(this).attr('id'))
        chrome.tabs.create({url: $(this).attr('id')});
    });

    $('#close-rss').off('click').on('click', function(){     // close rss box
        $('#rss').empty();
        $('#rss').hide();
    });

    $('#go-profile').off('click').on('click', function(){
        console.log("profile")
        profile = !profile;
        showProfile(profile);
    });
}

function showProfile(show){
    if (show == true) {
        $('#chart').hide();
        $('#rss').hide();
        $('#profile').show();
        // $('#go-profile').show();
        $('#go-profile').attr("src", "img/chart.png");
    } else {
        $('#profile').hide();
        $('#chart').show();
        $('#go-profile').show().attr("src", "img/profile.png");
    }
}


function getRSS(category){

    $('#rss').empty();
    $('#rss').append('<div id="close-rss"></div>')

    switch (category) {             // convert call to site specific rss categories
        case "world":
            callRSS({"site": "nyt", "category": "World"}); 
            callRSS({"site": "bf", "category": "world"});
            break;
        case "usa":
            callRSS({"site": "nyt", "category": "US"}); 
            callRSS({"site": "bf", "category": "usnews"});
            break;
        case "politics":
            callRSS({"site": "nyt", "category": "Politics"}); 
            callRSS({"site": "bf", "category": "politics"});
            break;
        case "business":
            callRSS({"site": "nyt", "category": "Business"}); 
            callRSS({"site": "bf", "category": "business"});
            break;
        case "opinion":
            callRSS({"site": "nyt", "category": "Opinion"}); 
            callRSS({"site": "bf", "category": "community"});
            break;
        case "tech":
            callRSS({"site": "nyt", "category": "Technology"}); 
            callRSS({"site": "bf", "category": "technology"});
            break;
        case "science":
            callRSS({"site": "nyt", "category": "Science"}); 
            callRSS({"site": "bf", "category": "science"});
            break;
        case "health":
            callRSS({"site": "nyt", "category": "Health"}); 
            callRSS({"site": "bf", "category": "health"});
            break;
        case "sports":
            callRSS({"site": "nyt", "category": "Sports"}); 
            callRSS({"site": "bf", "category": "sports"});
            break;
        case "culture":
            callRSS({"site": "nyt", "category": "FashionandStyle"}); 
            callRSS({"site": "bf", "category": "culture"});
            break;
        case "other":
            callRSS({"site": "nyt", "category": "MostViewed"}); 
            callRSS({"site": "bf", "category": "index"});
            break;
        default:
            console.log("other category");
    }

};

function callRSS (call) {

    var rssItems = []
        
    if (call.site == "nyt") {
    feed = 'http://rss.nytimes.com/services/xml/rss/nyt/' + call.category + '.xml';
    } else if (call.site == "bf") {
    feed = 'http://www.buzzfeed.com/' + call.category + '.xml'
    }

    $.ajax(feed, {                                     // make ajax call to rss feed
        accepts:{
            xml:"application/rss+xml"
        },
        dataType:"xml",
        success:function(data) {
            // console.log("data: ", data)
            // console.log("site ", call[i].site, " title ", text, " link ", link);
            $(data).find("item:lt(2)").each(function (i) {  // getting two items from each feed 
                var el = $(this);
                console.log("------------------------");
                // console.log("title      : " + el.find("title").text());
                var text = el.find("title").text();
                // console.log("link       : " + el.find("link").text());
                var link = el.find("link").text();
                console.log("site ", call.site, " title ", text, " link ", link);
                $('#rss').append("<div class='rss-wrapper' id=" + link + "><div class='link-source'> " + call.site + "</div> <div class='link-title'> "  + text + "</div></div>");    // appending articles to rss section
                });
            $('#rss').css("display", "inline-block");   // show articles once all are appended
            listen();                                   // listen for clicks
        }   
    });
}

function initGraph(json) {

    $('#chart').empty;

    var dataSet = json;

    var max = d3.max( dataSet, function(d) { return d['count'] });
    var min = d3.min( dataSet, function(d) { return d['count'] });

    var canvasWidth = 300,
      canvasHeight = 300,
      outerRadius = 150
    
    var vis = d3.select("#chart")
      .append("svg:svg")
        .data([dataSet])
        .attr("width", canvasWidth)
        .attr("height", canvasHeight)
        .append("svg:g")
        .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

    var arc = d3.svg.arc()
      .outerRadius(function (d, i) { 
        return outerRadius - (d['data']['count']/max); 
        console.log("radius ", outerRadius)
    });

    var color = d3.scale.linear()
        .domain([0, max])
        .range(["#002419", "#00C189"])
        .interpolate(d3.interpolateHcl)
        ;

    var pie = d3.layout.pie()
      .value( function(d) { return d.count; } )
      .sort( function(d) { return null; } )
      ;

    var arcs = vis.selectAll("g.slice")
      .data(pie)
      .enter()
      .append("svg:g")
      .attr("class", "slice")
      ;

    arcs.append("svg:path")
      // .attr("fill", '#00C189' )
      // .attr("fill", function(d) { return color(d.value) } )
      .attr("fill", function(d){
        // console.log(d.data.label, " ", (d.endAngle - d.startAngle))
        if(d.endAngle - d.startAngle > .24){
            return "#00C189"
        } else {
            return "#E3594B"
        }
      })
      .attr("d", arc)
      .on('click', function(d){ getRSS(d.data.label); })
      ;

    arcs.filter(function(d) { return d.endAngle - d.startAngle > .2; }).append("svg:text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("transform", function(d) { //set the label's origin to the center of the arc
        d.outerRadius = outerRadius; // Set Outer Coordinate
        d.innerRadius = outerRadius*.3; // Set Inner Coordinate
        return "translate(" + arc.centroid(d) + ")rotate(" + angle(d) + ")";
        })
      .style("fill", "White")
      .text(function(d) { return d.data.label; })
      ;

    arcs.on('mouseover', function(){
        d3.select(this)
          .select("text")
          .style("fill", "black")
          .attr("stroke", "black");
      })
      .on('mouseout', function(){
        d3.select(this)
          .select("text")
          .style("fill", "white")
          .attr("stroke", "none");
      });

    // Computes the angle of an arc, converting from radians to degrees.
    function angle(d) {
      var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
      return a > 90 ? a - 180 : a;
    }      
}

