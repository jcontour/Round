document.addEventListener('DOMContentLoaded', function () {
	console.log("popup-loaded");
    getData();
});

function getData() {
    chrome.storage.sync.get("data", function (result) {
        var json = JSON.parse( result.data );           // parse data

        var data = []
        console.log("init graph");

        for (var category in json) {                    // load data into array
            console.log(category, " ", json[category]['count']);
            data.push({
                label: category,
                count: (1/json[category]['count'])      // transform count to show less-read sections
            })
        }

        // check to see if anything has been read
        if (data.every(isZero)){        
                $('#logo').hide();      // if nothing is read, show onboarding
                onboarding();
        } else {        
            initGraph(data);            // otherwise, show graph
        }
    });
}

function isZero(value, index, ar){      // checking count values
    if (value.count == 1 || value.count == "Infinity"){
        return true;
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
            console.log("slide 1");
            $('#onboarding').css("background-image", "url(img/onboarding01.png)");
            $('#onboarding').css("background-size", "80%");
            $('#onboard-text').html('<p>The news that you consume makes up your view of the world.</p><p>Round helps you see the full picture.</p>');
            break;
        case 2: 
            console.log("slide 2");
            $('#onboarding').css("background-position", "75% 50%");
            $('#onboarding').css("background-size", "contain");
            $('#onboarding').css("background-image", "url(img/onboarding02.png)");
            $('#onboard-text').html('<p>Round works in the background, taking notes when you read the news.</p>');
            break;
        case 3: 
            console.log("slide 3");
            $('#onboarding').css("background-position", "center center");
            $('#onboarding').css("background-image", "url(img/onboarding03.png)");
            $('#onboard-text').html('<p>If Round notices that you haven\'t seen something important, it\'ll let you know!</p>');
            break;
        case 4: 
            console.log("slide 4");
            $('#onboarding').css("background-image", "url(img/onboarding04.png)");
            $('#onboard-text').html('<p>Your reading profile prioritises the topic areas that you might have overlooked</p><p>If you need some help catching up, click on a topic for the latest articles.</p>');
            break;
        case 5: 
            console.log('slide 5');
            $('#onboarding').css("background-image", "url(img/onboarding05.png)");
            $('#slide-up').text("Help me out here!").css("font-style", "italic");
            $('#onboard-text').html('<p>Let\'s get started!</p> <p>Read articles as you would normally, or start with some suggestions.</p>');
            break;
    }
}

var slide = 1;

function listen(){      //  event listeners

    $('#slide-up').on('click', function(){      // change slide button
        console.log('slide ', slide);
        
        if (slide < 5) {                        // going through 5 slides
            slide ++;
            slideChange(slide);
         } else {                               // on last slide, button calls rss for recommendations
            callRSS([{"site": "nyt", "category": "MostViewed"}, {"site": "bf", "category": "index"}]);
         }
    })

    $('.rss-wrapper').on('click', function(){   // on article click, open new tab with link
        console.log("clicked link: ", $(this).attr('id'))
        chrome.tabs.create({url: $(this).attr('id')});
    });

    $('#close-rss').on('click', function(){     // close rss box
        $('#rss').empty();
        $('#rss').hide();
        console.log("close");
    });
}


function getRSS(category){

    switch (category) {             // convert call to site specific rss categories
        case "world":
            callRSS([{"site": "nyt", "category": "World"}, {"site": "bf", "category": "world"}]);
            break;
        case "usa":
            callRSS([{"site": "nyt", "category": "US"}, {"site": "bf", "category": "usnews"}]);
            break;
        case "politics":
            callRSS([{"site": "nyt", "category": "Politics"}, {"site": "bf", "category": "politics"}]);
            break;
        case "business":
            callRSS([{"site": "nyt", "category": "Business"}, {"site": "bf", "category": "business"}]);
            break;
        case "opinion":
            callRSS([{"site": "nyt", "category": "Opinion"}, {"site": "bf", "category": "community"}]);
            break;
        case "tech":
            callRSS([{"site": "nyt", "category": "Technology"}, {"site": "bf", "category": "technology"}]);
            break;
        case "science":
            callRSS([{"site": "nyt", "category": "Science"}, {"site": "bf", "category": "science"}]);
            break;
        case "health":
            callRSS([{"site": "nyt", "category": "Health"}, {"site": "bf", "category": "health"}]);
            break;
        case "sports":
            callRSS([{"site": "nyt", "category": "Sports"}, {"site": "bf", "category": "sports"}]);
            break;
        case "culture":
            callRSS([{"site": "nyt", "category": "FashionandStyle"}, {"site": "bf", "category": "culture"}]);
            break;
        case "other":
            callRSS([{"site": "nyt", "category": "MostViewed"}, {"site": "bf", "category": "index"}]);
            break;
        default:
            console.log("other category");
    }

};

function callRSS (call) {

    $('#rss').empty();
    $('#rss').append('<div id="close-rss">[ X ]</div>')
    
    var rssItems = []
    var feed;

    for ( var i = 0; i < call.length; i ++) {
        if (call[i].site == "nyt") {
            feed = 'http://rss.nytimes.com/services/xml/rss/nyt/' + call[i].category + '.xml';
        } else if (call[i].site == "bf") {
            feed = 'http://www.buzzfeed.com/' + call[i].category + '.xml'
        }
        // console.log("getting feed: ", feed);
        $.ajax(feed, {                                          // make ajax call to rss feed
            accepts:{
                xml:"application/rss+xml"
            },
            dataType:"xml",
            success:function(data) {
                $(data).find("item:lt(2)").each(function (i) {  // getting two items from each feed 
                    var el = $(this);
                    console.log("------------------------");
                    console.log("title      : " + el.find("title").text());
                    var text = el.find("title").text();
                    console.log("link       : " + el.find("link").text());
                    var link = el.find("link").text();
                    $('#rss').append("<div class='rss-wrapper' id=" + link + ">" + text + "</div>");    // appending articles to rss section
                });
                $('#rss').css("display", "inline-block");   // show articles once all are appended
                listen();                                   // listen for clicks
            }   
        });
    }
}

function initGraph(json) {
    $('#chart').empty;

    var dataSet = json;

    console.log(dataSet);

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
    });


    var pie = d3.layout.pie()
      .value(function(d) { return d.count; })
      .sort( function(d) { return null; } );

    var arcs = vis.selectAll("g.slice")
      .data(pie)
      .enter()
      .append("svg:g")
      .attr("class", "slice")

    arcs.append("svg:path")
      .attr("fill", "#00C189" )
      .attr("d", arc)

      .on('click', function(d){
        console.log(d.data.label);
        getRSS(d.data.label);
      })
      .on('mouseover', function(d){
        $(this).attr("fill", "#E3594B");
      })
      .on('mouseout', function(d){
        $(this).attr("fill", "#00C189");
      })

    arcs.filter(function(d) { return d.endAngle - d.startAngle > .2; }).append("svg:text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("transform", function(d) { //set the label's origin to the center of the arc
        d.outerRadius = outerRadius; // Set Outer Coordinate
        d.innerRadius = outerRadius*.3; // Set Inner Coordinate
        return "translate(" + arc.centroid(d) + ")rotate(" + angle(d) + ")";
      })
      .style("fill", "White")
      .text(function(d) { return d.data.label; });

    // Computes the angle of an arc, converting from radians to degrees.
    function angle(d) {
      var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
      return a > 90 ? a - 180 : a;
    }      
}

