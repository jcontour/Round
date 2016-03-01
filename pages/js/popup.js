function switchToOverview(){
	console.log("show overview");
	if ($('#profile').hasClass("active")){
		$('#overview').removeClass('inactive').addClass('active');
		$('#profile').removeClass('active').addClass('inactive');
	}
}

function switchToProfile(){
	console.log("show profile");
	if ($('#overview').hasClass("active")){
		$('#profile').removeClass('inactive').addClass('active');
		$('#overview').removeClass('active').addClass('inactive');
	}
}

document.addEventListener('DOMContentLoaded', function () {
	console.log("loaded");

    chrome.runtime.sendMessage({directive: "open"}, function(response) {
        showArticles(response);
        // console.log(response)
        // this.close(); // close the popup when the background finishes processing request
    });

    document.getElementById('toggle-profile').addEventListener('click', switchToProfile);
    document.getElementById('toggle-overview').addEventListener('click', switchToOverview);
    // makeGraph();
})




//appending articles to popup overview
function showArticles(response){
  var result = [];
    $.each(response, function(i, e) {
      if ($.inArray(e, result) == -1) result.push(e);
    });
  for (var i = 0; i < result.length; i ++){
    $('#overview').append("<p>" + result[i] + "</p>")
  }
}

// pie chart showing umbrella categories and amount read of each
var pieChart = $('#overview');
var pieChartW = 100;
var pieChartH = 100;
var pieChartR = Math.min(pieChartW, pieChartH)/2; 
var pieChartColor = d3.scale.category20b();

function makeGraph(){
	(function(d3) {
    'use strict';

    var dataset = [
      { label: 'Abulia', count: 10 }, 
      { label: 'Betelgeuse', count: 20 },
      { label: 'Cantaloupe', count: 30 },
      { label: 'Dijkstra', count: 40 }
    ];

    var chart = $('#umbrella-pie-chart')

    var width = 140;
    var height = 140;
    var radius = Math.min(width, height) / 2;

    var color = d3.scale.category20b();

    var svg = d3.select('#overview')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(' + (width / 2) + 
        ',' + (height / 2) + ')');

    var arc = d3.svg.arc()
      .outerRadius(radius);

    var pie = d3.layout.pie()
      .value(function(d) { return d.count; })
      .sort(null);

    var path = svg.selectAll('path')
      .data(pie(dataset))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', function(d, i) { 
        return color(d.data.label);
      });

  })(window.d3);
}