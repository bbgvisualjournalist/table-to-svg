//Function loops through a table and returns JSON —— There's probably a way to do this with D3. :/ 
function createJSON(tableName){
  var myRows = [];
  var headersText = [];

  var tableHeaders=tableName+" th"
    , rowNames = tableName+" tbody tr"
	var $headers = $(tableHeaders);

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
	    myRows[index][headersText[cellIndex]] = $(this).text();
	  });    
	});
  return myRows;
}


/*Creating a D3 SVG chart*/
function createChart(sourceTable, targetChart, graphingVariable, label, options){//graphing Variable='miles run' and labels are things like "Soccer, baseball etc."

  //CREATE THE JSON FROM THE TABLE --------------------------------------------------------
  var tableJSON= createJSON(sourceTable);
  console.log(tableJSON);


  //DEFINE THE VARIABLES --------------------------------------------------------

  //Check and set the options
  var defaultOptions={"type":"column", "height":200, "showTable":true, "padding": 10, "ticks": 5};
  if (options){
    if (!options.type){options.type=defaultOptions.type};
    if (!options.height){options.height=defaultOptions.height; console.log("You can set the height of the chart by adding -- 'height': #### -- to the options parameter")};
    if (typeof options.showTable === 'undefined'){options.showTable = true;console.log("You can hide the original table by adding a value of -- 'showTable': false -- to the options parameter");};
    if (!options.padding){options.padding=defaultOptions.padding};
    if (!options.ticks){options.ticks=defaultOptions.ticks};
  }else{
    options = typeof options !== 'undefined' ? options : defaultOptions;
    console.log("No option parameters set, so we'll just use the default settings :)")
  }
  if(!options.showTable){
    $(sourceTable).css({'position':'absolute','left':'-9999px'}); //preferable to 'display':'none' because it's still readable by screen readers.
  }

  //set the variables — some of these seem redundant and arbitrary
  var margin = {top: 20, left: 10, bottom: 10, right: 10}
    , width = parseInt(d3.select(targetChart).style('width'))
    , width = width - margin.left - margin.right
    , height = options.height
    , barPadding = 20
    , padding = options.padding
    , paddingLeftLabels = 80 //arbitrary
    , setResize = false;

if (options.type=='bar'){
  height=tableJSON.length*50;
  console.log('Automatically setting the height to '+height+" pixels (because of the amount of data");
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
    newSVG.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis);

    //.attr('y', 'height')
  }



  //CREATE THE SVG-------------------------------------------------------
  var newSVG = d3.select(targetChart).append('svg')
    .attr("id", label)
    .style('width', (width + margin.left + margin.right) + 'px')
    .style('height',height+margin.top+margin.bottom+padding)
    .append('g')
    .attr('transform', 'translate(' + [margin.left, margin.top] + ')');

  //Add the <g>groups for the bars
  var g = newSVG.selectAll('g')
    .data(tableJSON)
    .enter()
    .append('g')

//fill-opacity
  var hoverColor=function(){d3.select(this).style("fill-opacity", .8);}
  var offColor=function(){d3.select(this).style("fill-opacity", 1);}
  //var hoverColor=function(){d3.select(this).style("fill", "#C00");}
  //var offColor=function(){d3.select(this).style("fill", "#900");}


  d3.select(this).parentNode
  //DEFINE THE DIFFERENT TYPES OF CHARTS--------------------------------------------------------
  
  //Horizontal bar chart--------------------------------------------------------
  function horizontalBars(){
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
    g.append('text')
      .text(function(d){return d[label]})
      .attr('x',0)
      .attr('y',function(d,i){return i*(height/tableJSON.length)+.5*(height / tableJSON.length)+padding})
      .classed('barlabels', true);    

    //Add the values
    g.append('text')
      .text(function(d){return d[graphingVariable]})
      .attr('x',function(d){return xScale(d[graphingVariable])+5;})
      .attr('y',function(d,i){return i*(height/tableJSON.length)+.5*(height / tableJSON.length)+padding})
      .classed('barvalues', true);

    //Add the xAxis
    addXaxis();
  }





  //Vertical column bar chart--------------------------------------------------------
  function verticalBars(){
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

    //Add the values
    g.append('text')
      .text(function(d){return d[graphingVariable] + ' '/*+graphingVariable*/})
      .attr('x',function (d, i){return i * (width/tableJSON.length)+(width/tableJSON.length-barPadding)/2+padding;})//Center the labels
      .attr('y',function (d){return yScale(d[graphingVariable])-5})
      .attr('text-anchor','middle')
      .classed('barvalues', true);

    //add the labels
    g.append('text')
        .text(function(d){return d[label]})
        .attr('x',function (d, i){return i * (width/tableJSON.length)+(width/tableJSON.length-barPadding)/2+padding;})//Center the labels
        .attr('y',height+20)
        .attr('text-anchor','middle')
        .classed('barlabels', true)

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
  if(options.type=='column'){
    rectXpos=function (d,i){return i*(width/tableJSON.length)+padding}; 
    rectW=function (d){return width / tableJSON.length - barPadding}; 
    barLabelsX=function (d, i){return i * (width/tableJSON.length)+(width/tableJSON.length-barPadding)/2+padding;};
    barValuesX=function (d, i){return i * (width/tableJSON.length)+(width/tableJSON.length-barPadding)/2+padding;};
  }
  if(options.type=='bar'){
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

    newSVG.selectAll('rect')
      .attr('width',rectW)
      .attr('x',rectXpos)
      
    newSVG.selectAll('.barlabels')
      .attr('x',barLabelsX)//Center the labels
    newSVG.selectAll('.barvalues')
      .attr('x',barValuesX)//Center the labels

    //I'll need to adjust the xAxis for horizontal charts
    //http://eyeseast.github.io/visible-data/2013/08/28/responsive-charts-with-d3/
    if(options.type=='bar'){
      width = parseInt(d3.select(targetChart).style('width'))
      width = width - margin.left - margin.right

      xScale.range([paddingLeftLabels,width-padding]);
      d3.select(targetChart).select('g').call(xAxis.orient('bottom'));
    }
  }

  //Create the graph depending on what type of chart is set in the options--------------------------------------------------------
  if (options.type=="column"){
    verticalBars()
  } else if (options.type=="bar"){horizontalBars()
  } else {
    console.log("Sorry, we don't currently support "+options.type+" charts.")
  };
}

/*
Known issues:
resize the horizontal axis on resize
limit label widths (or hide labels) below a certain point
adjust the height of the graphic based on the amoung of variables being graphed 
Adjust the distance between bars based on the height to data ratio'

Things I fixed:
Made the x-axis scale
Made the height of a bar chart scale depending on the number of data points.
Added an optional parameter for ticks
Figured out how to move the xAxis to the bottom
*/

