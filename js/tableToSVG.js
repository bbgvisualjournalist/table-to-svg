//Function loops through a table and returns JSON —— There should be/is a way to do this with just D3. :/ 
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
  //create the JSON from the table
  var tableJSON= createJSON(sourceTable);
  console.log(tableJSON);


  //Check and set the options
  var defaultOptions={"type":"column", "graph":"Miles", "height":200, "showTable":true};
  if (options){
    //Check individual options
    if (!options.type){options.type=defaultOptions.type};
    if (!options.graph){options.graph=defaultOptions.graph};
    if (!options.height){options.height=defaultOptions.height; console.log("You can set the height of the chart by adding -- 'height': #### -- to the options parameter")};
    if (typeof options.showTable === 'undefined'){options.showTable = true;console.log("You can hide the original table by adding a value of -- 'showTable': false -- to the options parameter");};
  }else{
    options = typeof options !== 'undefined' ? options : defaultOptions;
    console.log("No option parameters set, so we'll just use the default settings :)")
  }


  //set the variables
  var margin = {top: 20, left: 10, bottom: 10, right: 10}
    , width = parseInt(d3.select(targetChart).style('width'))
    , width = width - margin.left - margin.right
    , height = options.height
    , barPadding = 20
    , padding = 20
    , setResize = false;


  //Creat the yScale
  var yScale=d3.scale.linear()
  	.domain([0,d3.max(tableJSON, function(d){return d[graphingVariable]})])
    .range([height,0]);

  var yAxis=d3.svg.axis()
  	.scale(yScale)
  	.orient('left')
  	.ticks(5);


  //create the SVG
  var newSVG = d3.select(targetChart).append('svg')
    .attr("id", label)
    .style('width', (width + margin.left + margin.right) + 'px')
    .append('g')
    .attr('transform', 'translate(' + [margin.left, margin.top] + ')');

  var g = newSVG.selectAll('g')
        .data(tableJSON)
        .enter()
        .append('g')


  function verticalBars(){
    g.append("rect")
      .attr('width',width / tableJSON.length - barPadding)/*Makes the bar widths scale based on the number of bars */
      .attr('height',function(d){return height-yScale(d[graphingVariable]);})/*height scaled based on yScale */
      .attr('x',function(d,i){return i*(width/tableJSON.length)+padding; /*Number of bars spaced evenly across the width of the SVG */})
      .attr('y',function(d){return yScale(d[graphingVariable]);/*y position scaled based on the new yScale (solves for SVG positioning)*/})
      .classed('bar',true)
      .on("mouseover", function(){d3.select(this).style("fill", "#C00");})
      .on("mouseout", function(){d3.select(this).style("fill", "#900");})
      .on("mousedown", animate)
      .each(function(d) {
          if(!setResize){
            d3.select(window).on('resize', resize);
            setResize=true;//This is a hacked solution to waiting until the chart has been created before calling the resize function. Might be better on the newSVG secgtion.
          }
        });

    g.append('text')
      .text(function(d){return d[graphingVariable] + ' '/*+graphingVariable*/})
      .attr('x',function (d, i){return i * (width/tableJSON.length)+(width/tableJSON.length-barPadding)/2+padding;})//Center the labels
      .attr('y',function (d){return yScale(d[graphingVariable])-5})
      .attr('text-anchor','middle')
      .classed('barvalues', true);

    g.append('text')
        .text(function(d){return d[label] + ''})
        .attr('x',function (d, i){return i * (width/tableJSON.length)+(width/tableJSON.length-barPadding)/2+padding;})//Center the labels
        .attr('y',height+20)
        .attr('text-anchor','middle')
        .classed('barlabels', true)

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


    if(!options.showTable){
      $(sourceTable).css({'position':'absolute','left':'-9999px'}); //preferable to 'display':'none' because it's still readable by screen readers.
    }
  }

  //Create the graph depending on what type of chart is set in the options
  if (options.type=="column"){verticalBars()} else{console.log("Sorry, we don't currently support "+options.type+" charts.")};



  //Adding the y-axis
  newSVG.append('g')
  	.attr('class', 'axis')
  	.attr('transform','translate('+padding+',0)')
  	.call(yAxis);
  //============





  function resize() {
    console.log('resizing');
    width = parseInt(d3.select(targetChart).style('width'), 10);
    width = width - margin.left - margin.right;

    d3.select(newSVG.node().parentNode)
      .style('width', (width + margin.left + margin.right) + 'px');

    newSVG.selectAll('rect')
      .attr('width', width / tableJSON.length - barPadding)
      .attr('x',function (d,i){return i*(width/tableJSON.length)+padding; })
      
    newSVG.selectAll('.barlabels')
      .attr('x',function (d, i){return i * (width/tableJSON.length)+(width/tableJSON.length-barPadding)/2+padding;})//Center the labels
    newSVG.selectAll('.barvalues')
      .attr('x',function (d, i){return i * (width/tableJSON.length)+(width/tableJSON.length-barPadding)/2+padding;})//Center the labels
  }
}
//http://stackoverflow.com/questions/7169370/d3-js-and-document-onready
