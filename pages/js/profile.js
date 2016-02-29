//pie chart showing umbrella categories and amount read of each
// var pieChart = $('#umbrella-pie-chart');
// var pieChartW = pieChart.width() - 15;
// var pieChartH = pieChart.height() - 15;
// var pieChartR = Math.min(pieChartW, pieChartH)/2; 
// var pieChartColor = d3.scale.category20b();

// function makeGraph(){
// 	(function(d3) {
//     'use strict';

//     var dataset = [
//       { label: 'Abulia', count: 10 }, 
//       { label: 'Betelgeuse', count: 20 },
//       { label: 'Cantaloupe', count: 30 },
//       { label: 'Dijkstra', count: 40 }
//     ];

//     var chart = $('#umbrella-pie-chart')

//     var width = 140;
//     var height = 140;
//     var radius = Math.min(width, height) / 2;

//     var color = d3.scale.category20b();

//     var svg = d3.select('#umbrella-pie-chart')
//       .append('svg')
//       .attr('width', width)
//       .attr('height', height)
//       .append('g')
//       .attr('transform', 'translate(' + (width / 2) + 
//         ',' + (height / 2) + ')');

//     var arc = d3.svg.arc()
//       .outerRadius(radius);

//     var pie = d3.layout.pie()
//       .value(function(d) { return d.count; })
//       .sort(null);

//     var path = svg.selectAll('path')
//       .data(pie(dataset))
//       .enter()
//       .append('path')
//       .attr('d', arc)
//       .attr('fill', function(d, i) { 
//         return color(d.data.label);
//       });

//   })(window.d3);
// }

function init () {
   console.log("profile opened");

	// makeGraph();
}

$(document).ready(init);