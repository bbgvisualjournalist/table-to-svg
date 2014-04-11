//Function loops through a table and returns JSON —— There's probably a way to do this with D3. :/ 
//This is saving the numeric data as a string, which is messing up D3. We could use parseFloat(d.r) throughout but it'd be better to fix the JSON.
function createJSON(tableName){
  var myRows = [];
  var headersText = [];

  var tableHeaders=tableName+" th"
    , rowNames = tableName+" tbody tr"
	var $headers = $(tableHeaders);
  var theCellValue = '';

	// Loop through grabbing everything
	var $rows = $(rowNames).each(function(index) {
	  $cells = $(this).find("td");
	  myRows[index] = {};

	  $cells.each(function(cellIndex) {
	    // Set the header text
	    if(headersText[cellIndex] === undefined) {
	      headersText[cellIndex] = $($headers[cellIndex]).text();
	    }
	    // Update the row object with the header/cell combo
      theCellValue = $(this).text();

      if ( isNumber( theCellValue ) == true ){
        theCellValue = parseFloat( theCellValue );
      }

      myRows[ index ][ headersText[ cellIndex ] ] = theCellValue;      
	  });    
	});
  return myRows;
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}



/*Creating a D3 SVG chart*/
function createChart(type, sourceTable, targetChart, graphingVariable, options){

  //CREATE THE JSON FROM THE TABLE --------------------------------------------------------
  var tableJSON= createJSON(sourceTable);
  console.log(tableJSON);
  //console.log(tableJSON[0].Miles);




  //DEFINE THE VARIABLES --------------------------------------------------------

  //Check and set the options
  var defaultOptions={"labels":"", "height":200, "showTable":true, "barHeight": 30, "padding": 15, "paddingLabels": 80, "ticks": 4, "xAxis":true, "colorScale":["#000", "#333", "#666", "#999"], "donutHole": 55};
  if (options){
    if (! options.labels ) {options.labels=defaultOptions.labels};
    if (! options.height ) {options.height=defaultOptions.height; console.log("You can set the height of the chart by adding -- 'height': #### -- to the options parameter")};
    if (typeof options.showTable === 'undefined') {options.showTable = true;console.log("You can hide the original table by adding a value of -- 'showTable': false -- to the options parameter");};
    if (! options.barHeight ) {options.barHeight=defaultOptions.barHeight};
    if (! options.padding ) {options.padding=defaultOptions.padding};
    if (! options.paddingLabels ) {options.paddingLabels=defaultOptions.paddingLabels};
    if (typeof options.xAxis === 'undefined' ) {options.xAxis = true;console.log("You can hide the xAxis by adding -- 'xAxis': false -- to the options parameter");};
    if (! options.ticks ) {options.ticks=defaultOptions.ticks; console.log("You can set the approximate number of ticks in the axis by adding 'ticks':5")};
    if (! options.colorScale ) {options.colorScale=defaultOptions.colorScale; console.log("You can set the colorScale")};
    if (! options.donutHole ) {options.donutHole=defaultOptions.donutHole;};
  }else{
    options = typeof options !== 'undefined' ? options : defaultOptions;
    console.log("No option parameters set, so we'll just use the default settings :)")
  }
  if(!options.showTable){
    $(sourceTable).css({'position':'absolute','left':'-9999px'}); //preferable to 'display':'none' because it's still readable by screen readers.
  }


  //set the variables — some of these seem redundant and arbitrary
  var margin = {top: 20, left: 10, bottom: 10, right: 30}
    , width = parseInt(d3.select(targetChart).style('width'))
    , width = width - margin.left - margin.right
    , height = options.height
    , barPadding = 10
    , padding = options.padding
    , paddingLeftLabels = 0
    , setResize = false
    , label = options.labels
    , donutHole= options.donutHole;

if(options.labels!=""){paddingLeftLabels = options.paddingLabels};

if (type=='bar'){
  height=tableJSON.length*options.barHeight;
  console.log('Automatically setting the height to '+height+" pixels (because of the amount of data).");
}

if (type=='pie'){
  donutHole=0;
}


  //CREATE THE DIFFERENT X- and Y-SCALES --------------------------------------------------------

  //Create the yScale
  var yScale=d3.scale.linear()
    .domain([0,d3.max(tableJSON, function(d){return d[graphingVariable]})])
    .range([height,0]);

  var yAxis=d3.svg.axis()
  	.scale(yScale)
  	.orient('left')
  	.ticks(options.ticks);

  //Create the xScale
  var xScale=d3.scale.linear()
    .domain([0,d3.max(tableJSON, function(d){return d[graphingVariable]})])
    .range([0,width]);

  var xAxis=d3.svg.axis()
    .scale(xScale)
    .orient('bottom')
    .ticks(options.ticks);



  //Adding the y-axis
  function addYaxis(){
    newSVG.append('g')
    .attr('class', 'axis')
    .attr('transform','translate('+padding+',0)')
    .call(yAxis);
  }
  function addXaxis(){
    if (options.xAxis){
      newSVG.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + height + ')')//moves the axis to the bottom of the graphic
      .call(xAxis);
    }
  }

  

  //CREATE THE SVG-------------------------------------------------------
  var newSVG = d3.select(targetChart).append('svg')
    .attr("id", label)
    .style('width', (width + margin.left + margin.right) + 'px')
    .style('height',height+margin.top+margin.bottom+padding)
    .append('g')
    .attr('transform', 'translate(' + [margin.left, margin.top] + ')');

  //Add the <g>groups for the bars
  if(type=='bar'||type=='column'){
    var g = newSVG.selectAll('g')
      .data(tableJSON)
      .enter()
      .append('g')
  }


  var hoverColor=function(){d3.select(this).style("fill-opacity", .8);}
  var offColor=function(){d3.select(this).style("fill-opacity", 1);}
  //var hoverColor=function(){d3.select(this).style("fill", "#C00");}
  //var offColor=function(){d3.select(this).style("fill", "#900");}


  //DEFINE THE DIFFERENT TYPES OF CHARTS--------------------------------------------------------
  

  //Donut chart ----------------------------------------------------------------
  function donutChart(){
    //create a key? position key responsively?
    //make the text visible on value labels
    //add onclick so that you can find the data via on click.
    //From interactive data viz book and http://bl.ocks.org/Guerino1/2295263
    //http://jsfiddle.net/gregfedorov/Qh9X5/9/

    //var color=d3.scale.category10();
    var color = d3.scale.ordinal()
      .range(options.colorScale);

    //Center the pieChart
    newSVG.attr("transform", "translate(" + ((width / 2)-padding*3) + "," + 0 + ")");


    var outerRadius=height/2;
    var innerRadius=donutHole;
    var arc=d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)

    newSVG.data([tableJSON])

    var pie=d3.layout.pie()
      .sort(null)//make this an optional parameter?
      .value(function(d) { return d[graphingVariable]; })


    var arcs=newSVG.selectAll('g.arc')
      .data(pie)  
      .enter()
      .append('g')
      .classed('arc',true)
      .attr('transform','translate('+outerRadius+", "+outerRadius+")");


    arcs.append('path')
      .attr('fill', function (d,i){return color(i)})
      .attr('d', arc)
      .attr("id", function(d, i) { return "arc"+i; })
      .on("mouseover", hoverColor)
      .on("mouseout", offColor)
      .on("mousedown", function(d, i){console.log(tableJSON[i].Sport+' players run '+d.value+' miles per game.');})
      .each(function(d) {
          if(!setResize){
            d3.select(window).on('resize', resize);
            setResize=true;//This is a hacked solution to waiting until the chart has been created before calling the resize function. Might be better on the newSVG secgtion.
            //http://stackoverflow.com/questions/7169370/d3-js-and-document-onready
          }
        });

      //Hardcoded for 'Sport'      .on("mousedown", function(d, i){console.log(d.label+' players run '+d.value+' miles per game.');})


    arcs.append('text')
      .attr('transform',function(d){return "translate("+arc.centroid(d)+")";})
      .attr('text-anchor','middle')
      .text(function(d){return d.value;})
      .classed('barvalues',true)
  }



  //Horizontal bar chart--------------------------------------------------------
  function barChart(){
    xScale.range([paddingLeftLabels,width-padding]);

    g.append("rect")
      .attr('width',function(d){return xScale(d[graphingVariable]) - paddingLeftLabels;})
      .attr('height',height / tableJSON.length - barPadding)
      .attr('x', paddingLeftLabels)
      .attr('y',function(d,i){return i*(height/tableJSON.length)+padding})      
      .classed('bar',true)
      .on("mouseover", hoverColor)
      .on("mouseout", offColor)
      .each(function(d) {
          if(!setResize){
            d3.select(window).on('resize', resize);
            setResize=true;//This is a hacked solution to waiting until the chart has been created before calling the resize function. Might be better on the newSVG secgtion.
          }
        });
    
    //Add the labels
    if(options.labels!=""){
      g.append('text')
        .text(function(d){return d[label]})
        .attr('x',0)
        .attr('y',function(d,i){return i*(height/tableJSON.length)+.5*(height / tableJSON.length)+padding})
        .classed('barlabels', true);    
    }
    //Add the values
    g.append('text')
      .text(function(d){return d[graphingVariable]})
      .attr('x',function(d){return xScale(d[graphingVariable])+5;})
      .attr('y',function(d,i){return i*(height/tableJSON.length)+.5*(height / tableJSON.length)+padding})
      .classed('barvalues', true);

    //Add the xAxis
    addXaxis();
  }





  //Vertical column chart--------------------------------------------------------
  function columnChart(){
    g.append("rect")
      .attr('width',width / tableJSON.length - barPadding)/*Makes the bar widths scale based on the number of bars */
      .attr('height',function(d){return height-yScale(d[graphingVariable]);})/*height scaled based on yScale */
      .attr('x',function(d,i){return i*(width/tableJSON.length)+padding; /*Number of bars spaced evenly across the width of the SVG */})
      .attr('y',function(d){return yScale(d[graphingVariable]);/*y position scaled based on the new yScale (solves for SVG positioning)*/})
      .classed('bar',true)
      .on("mouseover", hoverColor)
      .on("mouseout", offColor)
      .on("mousedown", animate)
      .each(function(d) {
          if(!setResize){
            d3.select(window).on('resize', resize);
            setResize=true;//This is a hacked solution to waiting until the chart has been created before calling the resize function. Might be better on the newSVG secgtion.
            //http://stackoverflow.com/questions/7169370/d3-js-and-document-onready
          }
        });

    //add the labels
    if(options.labels!=""){
      g.append('text')
          .text(function(d){return d[label]})
          .attr('x',function (d, i){return i * (width/tableJSON.length)+(width/tableJSON.length-barPadding)/2+padding;})//Center the labels
          .attr('y',height+20)
          .attr('text-anchor','middle')
          .classed('barlabels', true)
    }

    //Add the values
    g.append('text')
      .text(function(d){return d[graphingVariable] + ' '/*+graphingVariable*/})
      .attr('x',function (d, i){return i * (width/tableJSON.length)+(width/tableJSON.length-barPadding)/2+padding;})//Center the labels
      .attr('y',function (d){return yScale(d[graphingVariable])-5})
      .attr('text-anchor','middle')
      .classed('barvalues', true);

    //Superfluous animation
    function animate(){
      var oldHeight= d3.select(this).attr('height');
      console.log('There is no point to this animation. just reminding myself that i might be able to use animation');
      d3.select(this).transition()
        .duration(1000)
        .attr("height", 10)
        .attr('y',function(d){return height-10;})
        .transition()
        .delay(2000)
        .attr("height", oldHeight)
        .attr('y',function(d){return yScale(d[graphingVariable]);})
        .each("end", function(d){console.log("done. you could execute a second animation that runs on completion here.")});
    }

    //Add the yAxis at the end
    addYaxis();
  }
  //Set the resizing options based on the type of chart-------------------------------
  var rectXpos, rectW, barLabelsX, barValuesX;
  if(type=='column'){
    rectXpos=function (d,i){return i*(width/tableJSON.length)+padding}; 
    rectW=function (d){return width / tableJSON.length - barPadding}; 
    barLabelsX=function (d, i){return i * (width/tableJSON.length)+(width/tableJSON.length-barPadding)/2+padding;};
    barValuesX=function (d, i){return i * (width/tableJSON.length)+(width/tableJSON.length-barPadding)/2+padding;};
  }
  if(type=='bar'){
    rectXpos=paddingLeftLabels;
    rectW=function(d){xScale.range([paddingLeftLabels,width-padding]);return xScale(d[graphingVariable]) - paddingLeftLabels;};//Make this a function to calculate the width
    barLabelsX=0;
    barValuesX=function(d){return xScale(d[graphingVariable])+5;};//Make this a function to calculate the width
  }




  //DEFINE THE RESIZE FUNCTION--------------------------------------------------------
  function resize() {
    console.log('resizing');
    width = parseInt(d3.select(targetChart).style('width'), 10);
    width = width - margin.left - margin.right;

    d3.select(newSVG.node().parentNode)
      .style('width', (width + margin.left + margin.right) + 'px');

    if (type=='column' || type=='bar'){
      newSVG.selectAll('rect')
        .attr('width',rectW)
        .attr('x',rectXpos)
        
      newSVG.selectAll('.barlabels')
        .attr('x',barLabelsX)//Center the labels
      newSVG.selectAll('.barvalues')
        .attr('x',barValuesX)//Center the labels
    }
    //Adjust the xAxis for horizontal bar charts
    if(type=='bar'&&options.xAxis){
      width = parseInt(d3.select(targetChart).style('width'))
      width = width - margin.left - margin.right

      xScale.range([paddingLeftLabels,width-padding]);
      d3.select(targetChart).select('g').call(xAxis.orient('bottom'));
    }
    //Recenter pie or donut charts
    if(type=='donut' || type=='pie'){
      newSVG.attr("transform", "translate(" + ((width / 2)-padding*3) + "," + 0 + ")");
    }
  }

  //Create the graph depending on what type of chart is set in the options--------------------------------------------------------
  if (type=="column"){
    columnChart()
  } else if (type=="bar"){
    barChart()
  } else if(type=="donut"){
    donutChart();
    console.log('Time to make the donuts.');
  } else if(type=="pie"){
    donutChart();
    console.log('Mmmmm... pie.');
  } else {
    console.log("Sorry, we don't currently support "+type+" charts.")
  };
}

/*
Known issues:
* Pie Chart values are lost in smaller wedges
* Hardcoded sports as the label for the piechart click.

Things I fixed:
* Moved the 'labels' from the required parameters to the optional section.
* Renamed chart functions to make them parallel with chart types.
* Added support for donut and pie charts
* Add a colorScale optional parameter (for pie charts and...?)
* Added unique IDs for pie/donut arcs so that they can be styled by CSS.

*/

