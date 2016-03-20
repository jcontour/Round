document.addEventListener('DOMContentLoaded', function () {
	console.log("popup-loaded");
    getData();
});


function getRSS(category){
    // convert category to rss version
    switch (category) {
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
            callRSS([{"site": "nyt", "category": "Opinion"}, {"site": "bf", "category": "ideas"}]);
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
            callRSS([{"site": "nyt", "category": "Fashion"}, {"site": "bf", "category": "tvandmovies"}]);
            break;
        case "other":
            callRSS([{"site": "nyt", "category": "MostViewed"}, {"site": "bf", "category": "longform"}]);
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

        // make ajax call to rss feed
        if (call[i].site == "nyt") {
            feed = 'http://rss.nytimes.com/services/xml/rss/nyt/' + call[i].category + '.xml';
        } else if (call[i].site == "bf") {
            feed = 'http://www.buzzfeed.com/' + call[i].category + '.xml'
        }
        // console.log("getting feed: ", feed);
        $.ajax(feed, {
            accepts:{
                xml:"application/rss+xml"
            },
            dataType:"xml",
            success:function(data) {
                // limiting to 5 results
                $(data).find("item:lt(2)").each(function (i) { // or "item" or whatever suits your feed
                    var el = $(this);
                    console.log("------------------------");
                    console.log("title      : " + el.find("title").text());
                    var text = el.find("title").text();
                    console.log("link       : " + el.find("link").text());
                    var link = el.find("link").text();
                    // rssItems.push({text: text, link: link})
                    // appendRss({text: text, link: link})
                    $('#rss').append("<div class='rss-wrapper' id=" + link + ">" + text + "</div>");
                    // $('#rss').append("<div class='rss-wrapper' id=" + link + "> <div class='rss-id'>" + call[i].site + "</div> <div class='rss-link'>" + text + "</div> </div>");
                });
                $('#rss').css("display", "inline-block");
                listen();
            }   
        });
    }
}

function slideChange(slide){
    switch(slide){
        case 1:
            console.log("slide 1");
            $('#onboarding').css("background-image", "url(img/onboarding01.png)");
            $('#onboard-text').html('<p>The news that you consume makes up your view of the world.</p><p>Round helps you see the full picture.</p>');
            break;
        case 2: 
            console.log("slide 2");
            $('#onboarding').css("background-position", "75% 50%");
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
            $('#onboard-text').html('<p>Your reading profile prioritises the topic areas that you might have overlooked</p><p>If you need some help catching up, click on the slice for the latest articles.</p>');
            break;
        case 5: 
            console.log('slide 5');
            $('#onboarding').css("background-image", " ");
            $('#onboard-text').html('<p>Let\'s get started!</p>');
            break;
    }
}

function listen(){

    $('#slide-up').on('click', function(){
        console.log('slide ', slide);
        slide ++;
        if (slide > 5) { slide = 1; }
        slideChange(slide);
    })

    $('.rss-wrapper').on('click', function(){
        console.log("clicked link: ", $(this).attr('id'))
        chrome.tabs.create({url: $(this).attr('id')});
    });

    $('#close-rss').on('click', function(){
        $('#rss').hide();
        console.log("close");
    });
}

function getData() {
    chrome.storage.sync.get("data", function (result) {
        var data = JSON.parse( result.data );
        console.log(data);
        initGraph(data);
    });
}

function isZero(value, index, ar){
    if (value.count == 1 || value.count == "Infinity"){
        return true;
    } else {
        return false;
    }
}

var slide = 1;

function onboarding(){

    $('#chart').append(" <div id='onboarding'> </div> <div id='onboard-text'></div> <div id='slide-up'>\> </div>")
    $('#onboarding').css("background-image", "url(img/onboarding01.png)");
    $('#onboard-text').html('<p>The news that you consume makes up your view of the world</p><p>Round helps you see the full picture</p>');
    listen();
}

function initGraph(json) {

    var data = []
    console.log("init graph");

    for (var category in json) {
        console.log(category, " ", json[category]['count']);
        data.push({
            label: category,
            count: (1/json[category]['count'])
        })
    }

    // check to see if anything has been read
    if (data.every(isZero)){        //if nothing is read, show onboarding
            $('#logo').hide();
            onboarding();
    } else {        

        $('#chart').empty;

        var dataSet = data;

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

        // console.log(data);

        // var max = d3.max( data, function(d) { return d['count'] });
        // var min = d3.min( data, function(d) { return d['count'] });


        // var width = 300, //width
        //     height = 300,   //height
        //     radius = Math.min(width, height) / 2,
        //     innerRadius = 50;

        // var pie = d3.layout.pie()
        //     .sort(null)
        //     // .value(function(d){     //length of arc
        //     //     return d['count']
        //     // })
        //     .value(function(d){ return 1 });

        // var arc = d3.svg.arc()
        //     .innerRadius(innerRadius)
        //     .outerRadius(function (d) { 
        //         return (radius - innerRadius) * (d['data']['count'] / max) + innerRadius; 
        //     });

        // var outlineArc = d3.svg.arc()
        //     .innerRadius(innerRadius)
        //     .outerRadius(radius);

        // var svg = d3.select("#chart").append("svg")
        //     .attr("width", width)
        //     .attr("height", height)
        //     .append("g")
        //     .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        // var path = svg.selectAll(".solidArc")
        //     .data(pie(data))
        //     .enter().append("path")
        //     .attr("fill", "#00C189")
        //     .attr("class", "solidArc")
        //     // .attr("stroke", "white")
        //     .attr("d", arc)
        //     // .on('mouseover', function(d){
        //     //     $(this).attr("fill", "#E3594B");
        //     //   })
        //     // .on('mouseout', function(d){
        //     //     $(this).attr("fill", "#00C189");
        //     // })

        // var outerPath = svg.selectAll(".outlineArc")
        //     .data(pie(data))
        //     .enter().append("path")
        //     .attr("fill", "none")
        //     .attr("class", "outlineArc")
        //     .attr("d", outlineArc)
        //     .on('mouseover', function(d){
        //         $(this).attr("fill", "#E3594B");
        //       })
        //     .on('mouseout', function(d){
        //         $(this).attr("fill", "none");
        //     })
        //     // adding text labels
        //     .append("svg:text")
        //     .attr("dy", ".35em")
        //     .attr("text-anchor", "middle")
        //     .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")rotate(" + angle(d) + ")"; })
        //     // .attr("transform", function(d) { //set the label's origin to the center of the arc
        //     // d.outerRadius = radius; // Set Outer Coordinate
        //     // d.innerRadius = radius/2; // Set Inner Coordinate
        //     //     return "translate(" + arc.centroid(d) + ")rotate(" + angle(d) + ")";
        //     // })
        //     .style("fill", "White")
        //     .style("font", "bold 12px Arial")
        //     .text(function(d) { return d['data']['label']; });

        // // Computes the angle of an arc, converting from radians to degrees.
        // function angle(d) {
        //   var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
        //   return a > 90 ? a - 180 : a;
        // }        
    }
}

