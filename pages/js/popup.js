document.addEventListener('DOMContentLoaded', function () {
	console.log("popup-loaded");
    getData();
    //when popup opens, send message to background
    chrome.runtime.sendMessage({directive: "popup-open"}, function(response) {
        // console.log(response);
    });

    $('.rsslink').on('click', function(){
        console.log("clicked link: ", $(this).attr('id'))
     // chrome.tabs.create({url: $(this).attr('href')});
     // return false;
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
    else if (category == "other"){ category = "MostShared" }


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
            $(data).find("item:lt(5)").each(function (i) { // or "item" or whatever suits your feed
                var el = $(this);
                console.log("------------------------");
                console.log("title      : " + el.find("title").text());
                var text = el.find("title").text();
                console.log("link       : " + el.find("link").text());
                var link = el.find("link").text();
                appendRss(text, link);
            });
        }   
    });
};

function appendRss(text, link){
    $('#rss').empty();
    $('#rss').append("<div class='rsslink' id=" + link + ">" + text + "</div>");
}

function getData() {
    chrome.storage.sync.get("data", function (result) {
        var data = JSON.parse( result.data );
        console.log(data);
        initGraph(data);
    });
}

function initGraph(json) {
    var dataSet = []
    for (var category in json) {
        console.log(category, " ", json[category]['count']);
        dataSet.push({
            label: category,
            count: json[category]['count']
        })
    }

    console.log(dataSet);

    var max = d3.max( dataSet, function(d) { return d['count'] });
    var min = d3.min( dataSet, function(d) { return d['count'] });


    var canvasWidth = 300, //width
      canvasHeight = 300,   //height
      outerRadius = 150,   //radius
      color = d3.scale.linear()
            .domain([min, max])
            .range(['blue', 'beige']);
      // color = d3.scale.category20c()

    
    var vis = d3.select("#chart")
      .append("svg:svg") //create the SVG element inside the <body>
        .data([dataSet]) //associate our data with the document
        .attr("width", canvasWidth) //set the width of the canvas
        .attr("height", canvasHeight) //set the height of the canvas
        .append("svg:g") //make a group to hold our pie chart
        .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")") // relocate center of pie to 'outerRadius,outerRadius'

    // This will create <path> elements for us using arc data...
    var arc = d3.svg.arc()
      .outerRadius(outerRadius);

    var pie = d3.layout.pie() //this will create arc data for us given a list of values
      .value(function(d) { return d.count; }) // Binding each value to the pie
      .sort( function(d) { return null; } );

    // Select all <g> elements with class slice (there aren't any yet)
    var arcs = vis.selectAll("g.slice")
      // Associate the generated pie data (an array of arcs, each having startAngle,
      // endAngle and value properties) 
      .data(pie)
      // This will create <g> elements for every "extra" data element that should be associated
      // with a selection. The result is creating a <g> for every object in the data array
      .enter()
      // Create a group to hold each slice (we will have a <path> and a <text>
      // element associated with each slice)
      .append("svg:g")
      .attr("class", "slice")    //allow us to style things in the slices (like text)

    arcs.append("svg:path")
      //set the color for each slice to be chosen from the color function defined above
      // .attr("fill", function(d, i) { return color(d['count']) } )
      .attr("fill", "#00C189" )
      //this creates the actual SVG path using the associated data (pie) with the arc drawing function
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

    // Add a label to each arc slice...
    // arcs.append("svg:text")
    //   .attr("transform", function(d) { //set the label's origin to the center of the arc
    //     //we have to make sure to set these before calling arc.centroid
    //     d.outerRadius = outerRadius + 50; // Set Outer Coordinate
    //     d.innerRadius = outerRadius + 45; // Set Inner Coordinate
    //     return "translate(" + arc.centroid(d) + ")";
    //   })
    //   .attr("text-anchor", "left") //center the text on it's origin
    //   .style("fill", "Purple")
    //   .style("font", "bold 12px Arial")
    //   .text(function(d, i) { return dataSet[i].label; }); //get the label from our original data array

    // Add a count value to the larger arcs, translated to the arc centroid and rotated.
    arcs.filter(function(d) { return d.endAngle - d.startAngle > .2; }).append("svg:text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("transform", function(d) { //set the label's origin to the center of the arc
        //we have to make sure to set these before calling arc.centroid
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

