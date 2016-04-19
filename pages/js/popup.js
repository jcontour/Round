document.addEventListener('DOMContentLoaded', function () {
	console.log("popup-loaded");
    chrome.runtime.sendMessage({directive: "popup-open"}, function(response) {
        getData(response);
    });
});

// --------------------------------------------------------------------------------------
//          INIT
// --------------------------------------------------------------------------------------

function getData(doShowOnboarding) {

    if (doShowOnboarding) {
        $('#logo').hide();
        $('#go-profile').hide();
        $('#go-help').hide();
        onboarding();
    } else {
        chrome.storage.sync.get("data", function (result) {
            var parsed = JSON.parse( result.data );

            var articleInfo = parsed.articleInfo;
            var habitInfo = parsed.habitInfo;

            console.log("habitinfo ", habitInfo);

            var data = []
            console.log("init graph");

            for (var category in articleInfo) {                    // load data into array
                // console.log(category, " ", articleInfo[category]['count']);
                data.push({
                    label: category,
                    count: (articleInfo[category]['count'])      // transform count to show less-read sections
                })
                // console.log ("data ", data)
            }
            initPieChart(data);            // otherwise, show graph

            // var barChartData = []
            // for (date in habitInfo['readPerDay']){
            //     barChartData.push({topic: date : date, count: habitInfo['readPerDay'][date]});
            // }

            // initBarChart(barChartData);

            // var myChart = new Chart();
            // myChart.setup(barChartData);

            showProfile(profile);
            showFeedback(habitInfo);
            listen();
        });

    }
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

// --------------------------------------------------------------------------------------
//          ONBOARDING STUFF
// --------------------------------------------------------------------------------------

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
            $('#onboarding').css("background-position", "50% 50%"); 
            $('#onboarding').css("background-image", "url(img/onboarding04.png)");
            $('#onboard-text').html('<p>The popup displays your reading habits, and highlights the areas you might have missed.</p> <p>If you need some help catching up, click on the slice for the latest articles.</p>');
            break;
        case 4: 
            $('#onboarding').css("background-image", "url(img/onboarding05.png)");
            $('#slide-up').text("Help me out here!").css("font-style", "italic");
            $('#onboard-text').html('<p>Let\'s get started!</p> <p>Read articles as you would normally, or start with some suggestions.</p>');
            break;
    }
}


// --------------------------------------------------------------------------------------
//          LISTENERS
// --------------------------------------------------------------------------------------

var slide = 1;
var profile = false;
var help = false;

function listen(){      //  event listeners

    $('#slide-up').on('click', function(){      // change slide button
        if (slide < 4) {                        // going through 5 slides
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

    $('#go-help').off('click').on('click', function(){
        console.log("help")
        help = !help;
        showHelp(help);
    });

    $('#ok').off('click').on('click', function(){     // close rss box
        $('#feedback-wrapper').fadeOut();
        chrome.runtime.sendMessage({directive: "reset-icon"});
    });
}

function showProfile(show){
    if (show == true) {
        $('#chart').hide();
        $('#rss').hide();
        $('#go-help').hide();
        $('#profile').show();
        $('#go-profile').attr("src", "img/chart.png");
    } else {
        $('#profile').hide();
        $('#chart').show();
        $('#go-help').show();
        $('#go-profile').show().attr("src", "img/profile.png");
        listen();
    }
}

function showHelp(show){
    if (show == true) {
        $('#chart').hide();
        $('#rss').hide();
        $('#go-profile').hide();
        $('#help').show();
        // $('#go-profile').show();
        $('#go-help').attr("src", "img/chart.png");
    } else {
        $('#help').hide();
        $('#chart').show();
        $('#go-profile').show();
        $('#go-help').show().attr("src", "img/help.png");
        listen();
    }
}

// --------------------------------------------------------------------------------------
//         FEEDBACK STUFF
// --------------------------------------------------------------------------------------

function getRandom(min, max) {
    var num = Math.floor(Math.random() * (max));
    console.log("random num ", num);
    return num;
}

function showFeedback(habitInfo){
    console.log("feedback showing ", habitInfo.feedback.feedback);

    if (habitInfo.totalRead > 3) {
        switch (habitInfo.feedback.feedback) {
            case 0:
                // do nothing
            break;
            case 1:
                console.log("feedback : ", habitInfo.feedback.feedback);
                $('#feedback-text').text("You\'re doing great!")
                $('#feedback-wrapper').show();
                listen();
            break;
            case 2:
                console.log("feedback : ", habitInfo.feedback.feedback);
                $('#feedback-text').text("You could catch up on")
                $('#category-rec').text(habitInfo.feedback.under[getRandom(0, habitInfo.feedback.under.length)].label)
                $('#feedback-wrapper').show();
                listen();
            break;
        }
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

// --------------------------------------------------------------------------------------
//          RSS FUNCTIONS
// --------------------------------------------------------------------------------------

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

// --------------------------------------------------------------------------------------
//          PIE CHART
// --------------------------------------------------------------------------------------

function initPieChart(json) {

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

function initBarChart(data){
    console.log("bar chart data ", data);

    // Set the dimensions of the canvas / graph
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = 320 - margin.left - margin.right,
        height = 120 - margin.top - margin.bottom;
 
    var parseDate = d3.time.format("%Y %m %d").parse;
     
    // var x = d3.time.scale().range([0, width]);
    // var y = d3.scale.linear().range([height, 0]);

    var x = d3.scale.ordinal()
        // .range([0, width]);
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]);
     
    // Define the axes
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        // .ticks(5)
        ;
     
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        // .ticks(10, "%");
        // .ticks(5)
        ;
     
    // Define the line
    // var valueline = d3.svg.line()
    //     .x(function(d) { return x(d.date); })
    //     .y(function(d) { return y(d.count); });
    
    // Adds the svg canvas
    var svg = d3.select("#per-day-chart")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Get the data
        data.forEach(function(d) {
            d.date = parseDate(d.date);
            d.count = +d.count;
        });
     
        // Scale the range of the data
        x.domain(data.map(function(d) { return d.date; }));
        y.domain([0, d3.max(data, function(d) { return d.count; })]);
     
        // append the bars
        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.date); })
            .attr("width", x.rangeBand())
            .attr("y", function(d) { return y(d.count); })
            .attr("height", function(d) { return height - y(d.count); });
     
        // Add the X Axis
        svg.append("g")     
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            ;
     
        // // Add the Y Axis
        svg.append("g")     
            .attr("class", "y axis")
            .call(yAxis)
            ;
}

// --------------------------------------------------------------------------------------
//          LINE GRAPH
// --------------------------------------------------------------------------------------

var topics = [politics, world, usa, sports];

var data = [];

for (var i = 0; i < topics.length; i ++){
  data.push(topics[i]);
}

var Chart = function(){

  var obj = {};

  var margin = { top: 20, right: 80, bottom: 30, left: 50 };
  var width = window.innerWidth - margin.left - margin.right;
  var height = window.innerHeight - margin.top - margin.bottom;
  var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
          return d.topic;
      })
      ;                 
  var svg, chart;
  var xScale, yScale;
  var xAxis, yAxis;
  var x, y;
  // var color;

  obj.setup = function(dataset){
    svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      // .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        // .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        // .style("text-anchor", "end")
        // .text("Temperature (ºF)")
        ;

    obj.update(dataset);
  }

  // obj.updateData = function(dataset){
  //   obj.update(dataset);
  // }

  obj.update = function(dataset){
    var parseDate = d3.time.format("%Y %m %d").parse;
    dataset.forEach(function (kv) {
      kv.counts.forEach(function (d) {
        d.date = parseDate(d.date);
      });
    });

    var minX = d3.min(data, function (kv) { return d3.min(kv.counts, function (d) { return d.date; }) });
    var maxX = d3.max(data, function (kv) { return d3.max(kv.counts, function (d) { return d.date; }) });
    var minY = d3.min(data, function (kv) { return d3.min(kv.counts, function (d) { return d.count; }) });
    var maxY = d3.max(data, function (kv) { return d3.max(kv.counts, function (d) { return d.count; }) });  

    var color = d3.scale.category10();
    color.domain(data.map(function (d) { return d.topic; }));

    xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

    x = d3.time.scale()
      .range([0, width])
      .domain([minX, maxX]);

    y = d3.scale.linear()
      .range([height, 0])
      .domain([minY, maxY]);

    var line = d3.svg.line()
      .interpolate("cardinal")
      .x(function (d) {
      return x(d.date);
    })
      .y(function (d) {
      return y(d.count);
    });

    var topic = svg.selectAll(".topic")
      .data(data);

    var topicEnter = topic.enter()
      .append("g")
      .attr("class", "topic")
      // .attr("id", function(d){ return d.topic + "line"; })
      ;

    topicEnter.append("path")
      .attr("class", "line")
      .attr("d", function (d) {
      return line(d.counts);
    })
      .style("stroke", function (d) {
      return color(d.topic);
    });

    topicEnter.append("text")
      .datum(function (d) {
      return {
        name: d.topic,
        date: d.counts[d.counts.length - 1].date,
        value: d.counts[d.counts.length - 1].count
        };
      })
      .attr("transform", function (d) {
        return "translate(" + x(d.date) + "," + y(d.value) + ")";
      })
      .attr("x", 3)
      .attr("dy", ".35em")
      .text(function (d) {
        // console.log(d.name)
        return d.name;
    });

    var lineInteraction = topicEnter
      .on('mouseover', function(d, i){
        d3.select(this)
        .attr('stroke', 'black')
      })
      .on('mouseout', function(d, i){
        d3.select(this)
        .attr('stroke', function(d){
          return color(d.topic);
        })
      })
      ;
      
  }

  return obj;
}
