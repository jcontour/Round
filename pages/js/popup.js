document.addEventListener('DOMContentLoaded', function () {
	console.log("popup-loaded");
    getData();
    //when popup opens, send message to background
    chrome.runtime.sendMessage({directive: "popup-open"}, function(response) {
        // console.log(response);
    });
});


function getRSS(category){
    // convert category to rss version
    if (category == "world"){ category = "World" }
    else if (category == "us"){ category = "US" }
    else if (category == "politics"){ category = "Politics" }
    else if (category == "nyregion"){ category = "NYRegion" }
    else if (category == "business"){ category = "Business" }
    else if (category == "opinion"){ category = "Opinion" }
    else if (category == "tech"){ category = "Technology" }
    else if (category == "science"){ category = "Science" }
    else if (category == "health"){ category = "Health" }
    else if (category == "sports"){ category = "Sports" }
    else if (category == "arts"){ category = "Arts" }
    else if (category == "fashion"){ category = "Fashion" }
    else if (category == "other"){ category = "MostViewed" }


    var rssItems = []
    // make ajax call to rss feed
    var feed = 'http://rss.nytimes.com/services/xml/rss/nyt/' + category + '.xml';
    // console.log("getting feed: ", feed);
    $.ajax(feed, {
        accepts:{
            xml:"application/rss+xml"
        },
        dataType:"xml",
        success:function(data) {
            // limiting to 5 results
            $(data).find("item:lt(3)").each(function (i) { // or "item" or whatever suits your feed
                var el = $(this);
                console.log("------------------------");
                console.log("title      : " + el.find("title").text());
                var text = el.find("title").text();
                console.log("link       : " + el.find("link").text());
                var link = el.find("link").text();
                rssItems.push({text: text, link: link})
            });

            appendRss(rssItems);
        }   
    });
};

function appendRss(rssArray){
    $('#rss').empty();
    for (var i = 0; i < rssArray.length; i++){
        $('#rss').append("<div class='rsslink' id=" + rssArray[i].link + ">" + rssArray[i].text + "</div>");
        $('#rss').css("display", "inline-block");
    }
    listen();
}

function listen(){
    $('.rsslink').on('click', function(){
        console.log("clicked link: ", $(this).attr('id'))
        chrome.tabs.create({url: $(this).attr('id')});
    });

    $('#get-article').on('click', function(){
        $('#get-article').css('display', 'none');
        getRSS('other')
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
    if (value.count < 1){
        return true;
    } else {
        return false;
    }
}

function initGraph(json) {
    var data = []
    for (var category in json) {
        console.log(category, " ", json[category]['count']);
        data.push({
            label: category,
            count: json[category]['count']
        })
    }

    // check to see if anything has been read
    if (data.every(isZero)){        //if nothing is read

        $('#chart').append("<div id='get-article'><p>You have not read anything!</p><p> Click for suggestions</p></div>");
        listen();

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

