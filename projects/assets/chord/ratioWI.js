//http://projects.delimited.io/experiments/chord-transitions/demos/trade.html
var matrix=
[[0.934195797, 0.02587349, 0.00657464, 0.0, 0.0, 0.00698304, 0.02664687], [0.38786184, 0.61213816, 0.0, 0.0, 0.0, 0.0, 0.0], [0.649122807, 0.0, 0.350877193, 0.0, 0.0, 0.0, 0.0], [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], [0.851074896, 0.0, 0.0, 0.0, 0.0, 0.050104022, 0.098821082], [0.798599064, 0.0, 0.0, 0.0, 0.0, 0.0342051, 0.167195836]]

var NameProvider=['White','Black','Native American','Asian','Pacific Islander','Other','Hispanic']

var colors = ["#EC1D25","#69B40F","#C4C4C4","#C8125C","#008FC8","#10218B","#134B24"];


	
/*/////////////////////*/
// Initialize Chord //
/*/////////////////////*/

//Create responsive chord diagram
var margin = {top: 40, right: 35, bottom: 100, left: 35},
    width = 850 - margin.left - margin.right,
    height = 1350 - margin.top - margin.bottom,
    innerRadius = Math.min(width, height) * .29,
    outerRadius = innerRadius * 1.04;

//Create SVG to hold the chart
var svg = d3.select('#chordContainer')
	.append('svg')
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + width + " " + height)
    .classed("svg-content", true)
    .append('g')
    .attr('transform',"translate(" + (margin.left + width/2.5) + "," + (margin.top + height/4) + ")");

//Give matrix to chord
var chart = d3.chord()
	.padAngle(0.05)
	.sortSubgroups(d3.descending)
	(matrix);

//Add the arcs to the outside of the chord
svg 
	.datum(chart)
	.append('g')
	.selectAll('g')
	.data(function(d) {return d.groups;})
	.enter()
  .append('g')
  .attr("class", function(d) {return "group " + NameProvider[d.index];})
	.append('path')
    .style('fill', function(d,i){return colors[i]})
		.style('stroke','black')
		.attr("d", d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
    )


// Add the links between groups
svg
  .datum(chart)
  .append("g")
  .selectAll("path")
  .data(function(d) { return d; })
  .enter()
  .append("path")
    .attr("d", d3.ribbon()
      .radius(innerRadius-5)
    )
    .attr("class", function(d,i) { return "chord " + 'a' + i})
    .style("fill", function(d){ return(colors[d.source.index]) }) // colors depend on the source group. Change to target otherwise.
		.style("stroke", "black")
    .style("opacity",'.6')
  
	
		
/*/////////////////////*/
// Initialize Ticks //
/*/////////////////////*/
// Group object uses each group of the data.groups object
var group = svg
  .datum(chart)
  .append("g")
  .selectAll("g")
  .data(function(d) { return d.groups; })
  .enter()

group
  .selectAll(".group-tick")
  .data(function(d) { return groupTicks(d, .1); })    // Controls the number of ticks: one tick each 25 here.
  .enter()
  .append("g")
    .attr("transform", function(d) { return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + (innerRadius + 12) + ",0)"; })
  .append("line")              
    .attr("x2", 6)
    .attr("stroke","gray")

// Add the labels of a few ticks:
group
  .selectAll(".group-tick-label")
  .data(function(d) { return groupTicks(d, .1); })
  .enter()
  .append("g")
    .attr("transform", function(d) { return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + (innerRadius + 12) + ",0)"; })
  .append("text")
    .attr("x", 8)
    .attr("dy", ".35em")
    .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180) translate(-16)" : null; })
    .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
    .text(function(d) { return parseInt(d.value*100)+ '%' })
    .style("font-size", 9)
    .style('color','red')


group
  //Add labels of groups
	.append('text')
	.each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
  .attr("dy", ".5em")
  .attr("class", "titles")
  .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
  .attr("transform", function(d) {
		return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
		+ "translate(" + (innerRadius + 55) + ")"
		+ (d.angle > Math.PI ? "rotate(180)" : "");
  })
  .attr('opacity', 1)
  .text(function(d,i) { return NameProvider[i]; })

  


// Returns an array of tick angles and values for a given group and step.
function groupTicks(d, step) {
  var k = (d.endAngle - d.startAngle) / d.value;
  return d3.range(0, d.value, step).map(function(value) {
    return {value: value, angle: value * k + d.startAngle};
  });
}

/*/////////////////////*/
// MOUSEOVER FUNCTIONS //
/*/////////////////////*/

 //Function: create dynamic labels//
 function setLabel(source, target) {
	//Create label content as HTML string
	var labelAttribute = '<h1>' + 'Percent of total ' + NameProvider[source['index']] + ' neighborhood travels to ' + NameProvider[source['subindex']] + ' neighborhoods: <i>' + formatNumber(source['value']) + '</i></h1><br>' +'<h1>' + 'Percent of total ' + NameProvider[target['index']] + ' neighborhood travels to ' + NameProvider[target['subindex']] + ' neighborhoods: <i>' + formatNumber(target['value']) + '</i></h1>';
	//Create detailed label in html page 
	var infolabel = d3.select('body')
			.append('div')
			//Define class, ID, and add it to HTML
			.attr('class', 'infolabel')
			.attr('id', NameProvider[source['index']][0] + NameProvider[source['subindex']][0] + '_label')
      .html(labelAttribute);
};

//Format numbers
function formatNumber(num) {
	if (num==0){
		return 'No Data'
	} else{
  return (num*100).toFixed(1) + '%'
}
}

//Function: move label where mouse moves//
function moveLabel() {
    //Determine width of label
    var labelWidth = d3.select('.infolabel')
        //Use node() to get the first element in this selection
        .node()
        //Return an object containing the sie of the label
        .getBoundingClientRect()
        //Examine width to determine how much to shift the mouse over
        .width;

    //Use coordinates of mousemove event to set label coordinates with offsets from wherever event is
    var x1 = d3.event.pageX + 10,
        y1 = d3.event.pageY - 55,
        x2 = d3.event.pageX - labelWidth - 10,
        //Used to switch vertical sides
        y2 = d3.event.pageY + 25;
    //Test for overflow horizontally (If the event x coordinate is greater than the width of the window and label buffer)
    var x = d3.event.pageX > window.innerWidth - labelWidth - 20 ? x2 : x1;
    //Test for overflow vertically (Is the Y coordinate less than the distance between mouse and upper-left label)
    var y = d3.event.pageY < 75 ? y2 : y1;
    //Select the infolabel currently mousing over
    d3.select(".infolabel")
        .style("left", x + "px")
        .style("top", y + "px");
};

//Function: Fade Groups of Chords by filtering chords that are being highlighted 
function fade(opacity) {
	return function(d, i) {
	  svg.selectAll("path.chord")
		  .filter(function(d) { return d.source.index != i && d.target.index != i; })
		  .transition()
		  .style("stroke-opacity", opacity)
		  .style("fill-opacity", opacity);
	};
  };

//Function: Highlight Specific Inner Chords
function highlight(i,opacity) {
	  d3.selectAll('path.chord')
      .filter(function(d,f) { console.log(f); return f != i ==true })
      .transition()
		  .style("stroke-opacity", opacity)
		  .style("fill-opacity", opacity);

  };



//Makes all titles of NameProviders event listeners 
d3.selectAll('.titles')
  .on('mouseover', fade(0))
  .on('mouseout', fade(1))

d3.selectAll('.chord')
    .on('mouseover', function(d,i){highlight(i,0.2); setLabel(d.source, d.target)
    })

    .on('mouseout', function(d,i){highlight(i,1); d3.select(".infolabel")
    .remove();
    })

    //Create event listener that controls label
    .on("mousemove", moveLabel);
