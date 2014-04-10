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
function createChart(type, sourceTable, targetChart, graphingVariable, label, options){

  //CREATE THE JSON FROM THE TABLE --------------------------------------------------------
  var tableJSON= createJSON(sourceTable);
  console.log(tableJSON);
  //console.log(tableJSON[0].Miles);


  //DEFINE THE VARIABLES --------------------------------------------------------

  //Check and set the options
  var defaultOptions={"height":200, "showTable":true, "barHeight": 30, "padding": 10, "paddingLabels": 80, "ticks": 4, "xAxis":true};
  if (options){
    //if (!type){type=defaulttype; console.log("Currently supporting 'bar', 'column' and 'donut'(?) charts")};
    if (!options.height){options.height=defaultOptions.height; console.log("You can set the height of the chart by adding -- 'height': #### -- to the options parameter")};
    if (typeof options.showTable === 'undefined'){options.showTable = true;console.log("You can hide the original table by adding a value of -- 'showTable': false -- to the options parameter");};
    if (!options.barHeight){options.barHeight=defaultOptions.barHeight};
    if (!options.padding){options.padding=defaultOptions.padding};
    if (!options.paddingLabels){options.paddingLabels=defaultOptions.paddingLabels};
    if (typeof options.xAxis === 'undefined'){options.xAxis = true;console.log("You can hide the xAxis by adding -- 'xAxis': false -- to the options parameter");};
    if (!options.ticks){options.ticks=defaultOptions.ticks; console.log("You can set the approximate number of ticks in the axis by adding 'ticks':5")};
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
    , paddingLeftLabels = options.paddingLabels //arbitrary
    , setResize = false;

if (type=='bar'){
  height=tableJSON.length*options.barHeight;
  console.log('Automatically setting the height to '+height+" pixels (because of the amount of data).");
}

//The old JSON was saving numbers as strings. Needed to convert them to strings.
//console.log("Max value: "+ d3.max(tableJSON, function(d){return d[graphingVariable]}));//parseFloat(d.r) ??
//console.log("Max value: "+ d3.max(tableJSON, function(d){return parseFloat( d[graphingVariable] )})  );//parseFloat(d.r) ??


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
  var g = newSVG.selectAll('g')
    .data(tableJSON)
    .enter()
    .append('g')


  var hoverColor=function(){d3.select(this).style("fill-opacity", .8);}
  var offColor=function(){d3.select(this).style("fill-opacity", 1);}
  //var hoverColor=function(){d3.select(this).style("fill", "#C00");}
  //var offColor=function(){d3.select(this).style("fill", "#900");}


  //DEFINE THE DIFFERENT TYPES OF CHARTS--------------------------------------------------------
  

  //Donut chart ----------------------------------------------------------------
  function donut(){
    //http://jsfiddle.net/gregfedorov/Qh9X5/9/
    var dataset = {
      apples: [53245, 28479, 19697, 24037, 40245],
    };
    //dataset=tableJSON.Miles

    var radius = Math.min(width, height) / 2;
    var color = d3.scale.category20();

    var pie = d3.layout.pie()
      .sort(null);

    var arc = d3.svg.arc()
        .innerRadius(radius - 100)
        .outerRadius(radius - 50);


    newSVG.append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var path = newSVG.selectAll("path")
      .data(pie(dataset.apples))//.data(pie(tableJSON.Miles)) 
      .enter().append("path")
      .attr("fill", function(d, i) { return color(i); })
      .attr("d", arc);
    /*

    var color = d3.scale.ordinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(radius - 70);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.population; });

    newSVG.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


    tableJSON.forEach(function(d) {
      d.Miles = +d.Miles;
      console.log(d.Miles);
    });

    var gPie = newSVG.selectAll(".arc")
        .data(pie(tableJSON))
      .enter().append("g")
        .attr("class", "arc");

    gPie.append("path")
        .attr("d", arc)
        .style("fill", function(d) { return color(d.data.age); });

    */


      console.log('Time to make the donuts.');
    }



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

    newSVG.selectAll('rect')
      .attr('width',rectW)
      .attr('x',rectXpos)
      
    newSVG.selectAll('.barlabels')
      .attr('x',barLabelsX)//Center the labels
    newSVG.selectAll('.barvalues')
      .attr('x',barValuesX)//Center the labels

    //I'll need to adjust the xAxis for horizontal charts
    //http://eyeseast.github.io/visible-data/2013/08/28/responsive-charts-with-d3/
    if(type=='bar'&&options.xAxis){
      width = parseInt(d3.select(targetChart).style('width'))
      width = width - margin.left - margin.right

      xScale.range([paddingLeftLabels,width-padding]);
      d3.select(targetChart).select('g').call(xAxis.orient('bottom'));
    }
  }

  //Create the graph depending on what type of chart is set in the options--------------------------------------------------------
  if (type=="column"){
    verticalBars()
  } else if (type=="bar"){
    horizontalBars()
  } else if(type=="donut"){
    donut();
  } else {
    console.log("Sorry, we don't currently support "+type+" charts.")
  };
}

/*
Known issues:
* limit label widths (or hide labels) below a certain point

Things I fixed:
* Moved the graph 'type' from the optional parameters to the required section
*/

