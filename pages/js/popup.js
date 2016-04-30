document.addEventListener('DOMContentLoaded', function () {
	console.log("popup-loaded");
    chrome.runtime.sendMessage({directive: "popup-open"}, function(response) {
        getData(response);
    });
});

// --------------------------------------------------------------------------------------
//          INIT
// --------------------------------------------------------------------------------------

var lineGraphData = []

function getData(res) {

    chrome.storage.sync.get("data", function (result) {
        var parsed = JSON.parse( result.data );

        var articleInfo = parsed.articleInfo;
        var habitInfo = parsed.habitInfo;

        console.log("habitinfo ", habitInfo);

    if (habitInfo.doShowOnboarding == true) {

        $('#logo').hide();
        // $('#go-profile').hide();
        $('#go-help').hide();

        chrome.runtime.sendMessage({directive: "onboarding-false"}, function(response){});
        
        onboarding();

    } else {

            var pieData = []
            console.log("init graph");

            for (var category in articleInfo) {                    // load data into array
                // console.log(category, " ", articleInfo[category]['count']);
                pieData.push({
                    label: category,
                    count: (articleInfo[category]['count'])
                })
                
            }

            initPieChart(pieData);            // otherwise, show graph

            for (var category in articleInfo) { 
                lineGraphData.push({
                    topic: category,
                    countPerDay: (articleInfo[category]['countPerDay'])
                })
            }

            var myChart = new Chart();
            myChart.setup(lineGraphData);

            showProfile(profile, lineGraphData);
            showFeedback(habitInfo);
            listen();
        };

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
        showProfile(profile, lineGraphData);
    });

    $('#go-help').off('click').on('click', function(){
        console.log("help")
        help = !help;
        showHelp(help);
    });

    $('#ok').off('click').on('click', function(){     // close rss box
        $('#feedback-wrapper').hide();
        chrome.runtime.sendMessage({directive: "reset-icon"});
    });

    $('.filter').off('click').on('click', function(){
        console.log(this.id);
        $('.line').hide();
        $('#' + this.id + "-line").show();
        // getRSS(this.id);
    })

    $('#all').off('click').on('click', function(){
        $('.line').show();
    })

    $('#none').off('click').on('click', function(){
        $('.line').hide();
    })

    $('.filter').on('mouseenter', function(){
        var whichLine = "#" + this.id + "-line"
        d3.select(whichLine)
            .style("stroke", "#E3594B");
    })

    $('.filter').on('mouseleave', function(){
        var whichLine = "#" + this.id + "-line"
        d3.select(whichLine)
            .style("stroke", "#00C189");
    })

    $('.line').on('mouseenter', function(){
        var whichFilter = this.id.split('-');
        whichFilter = whichFilter[0];   
        $('#'+whichFilter).css("color", '#E3594B')
        d3.select(this)
            .style("stroke", "#E3594B");
    })

    $('.line').on('mouseleave', function(){
        var whichFilter = this.id.split('-');
        whichFilter = whichFilter[0];
        $('#'+whichFilter).css("color", 'white')
        d3.select(this)
            .style("stroke", "#00C189");
    })
}

function showProfile(show, data){

    console.log("how many days ", data[0].countPerDay.length);

    if (data[0].countPerDay.length >= 2) {
        if (show == true) {
            $('#chart').hide();
            $('#rss').hide();
            $('#go-help').hide();
            $('#profile').show();
            $('#go-profile').attr("src", "img/chart.png");
            listen();
        } else {
            $('#profile').hide();
            $('#chart').show();
            $('#go-help').show();
            $('#go-profile').show().attr("src", "img/profile.png");
            listen();
        }
    } else {
        // $('#go-profile').hide();
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
        showProfile(false, lineGraphData)
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
    // console.log("feedback showing ", habitInfo.feedback.feedback);
    console.log("habitInfo ", habitInfo.feedback);

    if (habitInfo.totalRead > 10) {
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

// --------------------------------------------------------------------------------------
//          RSS FUNCTIONS
// --------------------------------------------------------------------------------------

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

// --------------------------------------------------------------------------------------
//          LINE GRAPH
// --------------------------------------------------------------------------------------


var Chart = function(){

  var obj = {};

  // var margin = { top: 20, right: 80, bottom: 30, left: 50 };
  var width = 300;
  var height = 200;
  // var tip = d3.tip()
  //     .attr('class', 'd3-tip')
  //     .offset([-10, 0])
  //     .html(function(d) {
  //         return d.topic;
  //     })
  //     ;                 
  var svg, chart;
  var xScale, yScale;
  var xAxis, yAxis;
  var x, y;

  obj.setup = function(dataset){


    svg = d3.select("#per-day-chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height+10)
      // .attr("transform", "translate(0," + height + ")")
      ;

      chart = svg.append("g")
      // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("transform", "translate(0, 10)")
      ;

    chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      ;

    chart.append("g")
        .attr("class", "y axis")
        // .attr("transform", "rotate(-90)")
        // .attr("y", 6)
        // .attr("dy", ".71em")
        // .style("text-anchor", "end")
        // .text("Temperature (ºF)")
        ;

    obj.update(dataset);
  }

  obj.update = function(dataset){
    var parseDate = d3.time.format("%Y %m %d").parse;
    dataset.forEach(function (kv) {
        console.log("count per day ", kv.countPerDay)
      kv.countPerDay.forEach(function (d) {

        d.date = parseDate(d.date);
      });
    });

    var minX = d3.min(dataset, function (kv) { return d3.min(kv.countPerDay, function (d) { return d.date; }) });
    var maxX = d3.max(dataset, function (kv) { return d3.max(kv.countPerDay, function (d) { return d.date; }) });
    var minY = d3.min(dataset, function (kv) { return d3.min(kv.countPerDay, function (d) { return d.count; }) });
    var maxY = d3.max(dataset, function (kv) { return d3.max(kv.countPerDay, function (d) { return d.count; }) });  

    // var color = d3.scale.category10();
    // color.domain(dataset.map(function (d) { return d.topic; }));

    x = d3.time.scale()
      .range([0, width])
      .domain([minX, maxX]);

    y = d3.scale.linear()
      .range([height, 0])
      .domain([minY, maxY]);

    xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(5)
      .tickSize(-height, 0, 0)
      .tickFormat("")
      // .style("stroke-dasharray", ("3, 3"))
      ;

    yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(5)
      .tickSize(-width, 0, 0)
      .tickFormat("")
      // .style("stroke-dasharray", ("3, 3")) 
      ;

    chart.select('.x.axis')                 
      // .transition()
      // .duration(2000)
      .call(xAxis)
      ;

    chart.select('.y.axis')
      // .transition()
      // .duration(2000)                    
      .call(yAxis)
      ;

    var line = d3.svg.line()
      .interpolate("monotone")
      .x(function (d) {
      return x(d.date);
    })
      .y(function (d) {
      return y(d.count);
    });



    var topic = svg.selectAll(".topic")
      .data(dataset);

    var topicEnter = topic.enter()
      .append("g")
      .attr("class", "topic")
      .attr("transform", "translate(0, 10)")
      // .attr("id", function(d){ return d.topic + "line"; })
      ;

    topicEnter.append("path")
      .attr("class", "line")
      .attr("id", function(d,i){
        return (d.topic + "-line");
      })
      .attr("fill", "none")
      .attr("d", function (d) {
      return line(d.countPerDay);
    })
      .style("stroke-width", "3")
      .style("stroke", "#00C189")
    //   .on('mouseover', function(d, i){
    //     d3.select(this)
    //     .style('stroke', '#E3594B')
    //   })
    // .on('mouseout', function(d, i){
    //     d3.select(this)
    //     .style('stroke', '#00C189')
    //   })

    // topicEnter.append('circle')
    //     .attr("class", "circle")
    //     .attr('cx', function(d, i){
    //         return x(d.count);
    //         // return d.count;
    //     })
    //     .attr('cy', function(d, i){
    //         // console.log(d.count);
    //         return y(d.date);
    //         // return d.date;
    //     })
    //     .attr('r', 5)
    //     .style("stroke", '#00C189')
    //     .attr("fill", '#0C152E')
    //     ;


    topicEnter.append("svg:text")
      .datum(function (d) {
      return {
        name: d.topic,
        date: d.countPerDay[d.countPerDay.length - 1].date,
        value: d.countPerDay[d.countPerDay.length - 1].count
        };
      })
      .attr("transform", function (d) {
        return "translate(" + x(d.date) + "," + y(d.value) + ")";
      })
      .attr("x", 3)
      .attr("fill", "white")
      .attr("opacity", "0")
      .attr("dy", ".35em")
      .text(function (d) {
        // console.log(d.name)
        return d.name;
    });

    topicEnter.on('mouseover', function(d, i){
        d3.select(this)
        .select("text")
        .attr("opacity", "100")
      })
      .on('mouseout', function(d, i){
        d3.select(this)
        .select("text")
        .attr("opacity", "0")
      })
      ;

    //rearrange data for circles
    // var circleData = [];
    // // console.log(dataset);
    // for (var i = 0; i < dataset.length; i++){
    //     for (var j = 0; j < dataset[i].countPerDay.length; j ++){
    //         circleData.push(dataset[i].countPerDay[j]);
    //     }
    // }

    // circleData.forEach(function(d){
    //     d.count = +d.count;
    //     d.date = parseDate(d.date);
    // })

    // console.log(circleData)

    // var circle = chart.selectAll('circle')
    //     .data(circleData)
    //     .enter()
    //     .append('circle')
    //     ;

    // circle.attr('cx', function(d, i){
    //         // return x(+d.count);
    //         return d.count;
    //     })
    //     .attr('cy', function(d, i){
    //         // console.log(d.count);
    //         // return y(d.date);
    //         return d.date;
    //     })
    //     .attr('r', 5)
    //     .style("stroke", '#00C189')
    //     .attr("fill", '#0C152E')
    //     ;

  }

  return obj;
}
