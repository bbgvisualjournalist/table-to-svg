//The chartArray stores all of the information used to create (and recreate) each charts
var chartArray=[];
var currentChartNumber=0;


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




//====REBUILD THE ChART====================
function rebuildCharts(){
  waitForFinalEvent(function(){
    for (i=0;i<chartArray.length;i++){
      d3.select(chartArray[i].options.svgID).remove();//Loop through and destroy the [i] chart (just the SVG)

      var typeOfChart = chartArray[i].type
        , sourceTable = chartArray[i].sourceTable
        , dataColumn = chartArray[i].graphingVariable
        , options = chartArray[i].options;

      createChart(typeOfChart, sourceTable, dataColumn, options);
    }
  }, 500, "some unique string");
}



//Wait for the window resize to 'end' before executing a function---------------
var waitForFinalEvent = (function () {
  var timers = {};
  return function (callback, ms, uniqueId) {
    if (!uniqueId) {
      uniqueId = "Don't call this twice without a uniqueId";
    }
    if (timers[uniqueId]) {
      clearTimeout (timers[uniqueId]);
    }
    timers[uniqueId] = setTimeout(callback, ms);
  };
})();





//Creating a D3 SVG chart===================================================================================

function createChart(type, sourceTable, graphingVariable, options){
  //CREATE THE JSON FROM THE TABLE --------------------------------------------------------
  var tableJSON= createJSON(sourceTable);
  console.log(tableJSON);



  //DEFINE THE VARIABLES --------------------------------------------------------
  //Check and set the options
  var defaultOptions={"labels":""
    , "targetDiv":""
    , "height":200
    , "showTable":false
    , "barHeight": 30
    , "padding": 15
    , "paddingLabels": 80
    , "ticks": 4
    , "xAxis":true
    , "colorScale": ["#D4451D", "#FF6C0C", "#FFB819", "#95D600"]
    , "donutHole": 55
    , "decimalPlaces": ""
    , "addComma": false
    , "prefix": ""
    , "suffix": ""
    , "clicked": ""
    , "addLegend": false
  };
  if (options){
    if (! options.labels ) {options.labels = defaultOptions.labels};
    if (! options.targetDiv ) {options.targetDiv = defaultOptions.targetDiv;};
    if (! options.height ) {options.height = defaultOptions.height; console.log("You can set the height of the chart by adding -- 'height': #### -- to the options parameter")};
    if (typeof options.showTable === 'undefined') {options.showTable = true; console.log("You can hide the original table by adding a value of -- 'showTable': false -- to the options parameter");};
    if (! options.barHeight ) {options.barHeight = defaultOptions.barHeight};
    if (! options.padding ) {options.padding = defaultOptions.padding};
    if (! options.paddingLabels ) {options.paddingLabels = defaultOptions.paddingLabels};
    if (typeof options.xAxis === 'undefined' ) {options.xAxis = true; console.log("You can hide the xAxis by adding -- 'xAxis': false -- to the options parameter");};
    if (! options.ticks ) {options.ticks=defaultOptions.ticks; console.log("You can set the approximate number of ticks in the axis by adding 'ticks':5")};
    if (! options.colorScale ) {options.colorScale = defaultOptions.colorScale; console.log("You can set the colorScale")};
    if (! options.donutHole ) {options.donutHole = defaultOptions.donutHole;};

    if (! options.decimalPlaces ) {options.decimalPlaces=defaultOptions.decimalPlaces;};
    if (typeof options.addComma === 'undefined' ) {console.log('you can add commas to numbers.'); options.addComma = defaultOptions.addComma};
    if (! options.prefix ) {options.prefix=defaultOptions.prefix};
    if (! options.suffix ) {options.suffix=defaultOptions.suffix};

    if (! options.clicked ) {options.clicked = defaultOptions.clicked};
    if (typeof options.addLegend === 'undefined' ) {console.log('you can add a legend.'); options.addLegend = defaultOptions.addLegend};


  }else{
    options = typeof options !== 'undefined' ? options : defaultOptions;
    console.log("No option parameters set, so we'll just use the default settings :)")
  }

  if (!options.showTable){
    $(sourceTable).css( {'position':'absolute','left':'-9999px'} ); //preferable to 'display':'none' because it's still readable by screen readers.
  }



  //If no targetDiv is set in the options, insert the chart after the table.
  var targetChart;
  if ( options.targetDiv == "" ){
    var chartID = type + '_chart_' + graphingVariable + currentChartNumber;
    targetChart = '#' + chartID;
    console.log('targetDiv not set. Adding new div' + targetChart + " " + chartID);
    $( sourceTable ).after( "<div id='" + chartID + "' class='graphic'></div>" );
    options.targetDiv = targetChart;//Added to the options so that it will be stored in the chartArray

  }else{
    targetChart = options.targetDiv
  }




  //set the variables — some of these seem redundant and arbitrary
  var margin = {top: 20, left: 10, bottom: 10, right: 30}
    , width = parseInt( d3.select(targetChart).style('width') )
    , width = width - margin.left - margin.right
    , height = options.height
    , barPadding = 10
    , padding = options.padding
    , paddingLeftLabels = 0
    , label = options.labels
    , donutHole = options.donutHole;

  if( options.labels != "" ){paddingLeftLabels = options.paddingLabels};

  if ( type == 'bar' ){
    height = tableJSON.length*options.barHeight;
    console.log('Automatically setting the height to ' + height + " pixels (because of the amount of data).");
  }

  if ( type == 'pie' ){
    donutHole=0;
  }




  //CREATE THE SVG-------------------------------------------------------

  var svgID = 'svg_' + type + '_chart_' + graphingVariable+currentChartNumber;
  options.svgID = '#' + svgID;

  var viz = d3.selectAll(targetChart).append('svg')
    .attr("id", svgID)
    .style('width', (width + margin.left + margin.right) + 'px')
    .style('height', height + margin.top + margin.bottom + padding)
    .append('g')
    .attr('transform', 'translate(' + [margin.left, margin.top] + ')' );

  //Add the <g>groups for the bars
  if ( type == 'bar' || type == 'column' || type == 'scatterplot'){
    var g = viz.selectAll('g')
      .data(tableJSON)
      .enter()
      .append('g')
  }



  //Add the chart creation information to the chartArray for resizing-----------------------------------------------
  var chartInfo = {'type':type
    , 'sourceTable': sourceTable
    , 'graphingVariable': graphingVariable
    , 'options': options}
  

  var check = false; //Check if the current chart has already been pushed to the array?

  for (var i = 0; i < chartArray.length; i++){                       
    if (options.svgID === chartArray[i].options.svgID){
      check = true;
    }
  }

  if (!check){
    chartArray.push(chartInfo);
  }
  



  //CREATE THE DIFFERENT X- and Y-SCALES --------------------------------------------------------

  //Create the yScale
  var yScale = d3.scale.linear()
    .domain( [0, d3.max(tableJSON, function(d){ return d[graphingVariable] } ) ] )
    .range( [height, 0] );

  //Create the xScale
  var xScale = d3.scale.linear()
    .domain([0, d3.max(tableJSON, function(d){ return d[graphingVariable] } ) ] )
    .range([0, width]);




  //CREATE THE X- and Y-AXIS --------------------------------------------------------
  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient('bottom')
    .ticks(options.ticks);

  function addYaxis(){
    viz.append('g')
    .attr('class', 'axis')
    .attr('transform','translate('+padding+',0)')
    .call(yAxis);
  }


  var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient('left')
    .ticks(options.ticks);

  function addXaxis(){
    if (options.xAxis){
      viz.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + height + ')')//moves the axis to the bottom of the graphic
      .call(xAxis);
    }
  }



  
  //ADD LEGEND -------------------------------------------------------------
  function addLegend(){
    var htmlLegend=d3.select(targetChart)

    //Add the div.legend, add a <p> for each swatch/label pair, and add the span with the label.
    htmlLegend
      .append('div')
      .classed('legend',true)
      .selectAll('p')
      .data(tableJSON)
      .enter()
      .append('p')
      .append('span')
      .classed('keyText', true).text(function (d, i){return d[options.labels]})

    //Add the keyBox swatch
    htmlLegend.selectAll('.legend p').insert("span", "span.keyText")
      .style('background-color',function (d, i){ console.log(i + " " + options.colorScale[i]); return options.colorScale[i]})
      .classed('keySwatch', true);
  }




  //Reformat the numbers --------------------------------------------------------
  var reformatTheNumber = false
    , decimalPlaces = options.decimalPlaces
    , addComma=options.addComma
    , addCommaSeparator=""
    , prefix=options.prefix
    , suffix=options.suffix;

  //£ € $ % 
  if ( decimalPlaces >= 0 || prefix != "" || suffix != "" || addComma ){ reformatTheNumber=true; }

  //How many decimal places do you want to include?
  if ( decimalPlaces == "none" ){
    formatDecimals = function (originalNumber){return originalNumber};
  } else if ( decimalPlaces >= 0 ){ 
    if (addComma){addCommaSeparator = ","}
    var styleNumber = addCommaSeparator + "." + decimalPlaces + "f";
    formatDecimals = d3.format(styleNumber);
  }

  //Do you want to add a prefix (e.g. £, €, $) or a suffix (e.g. %)
  if (reformatTheNumber){
    formatNumber = function(originalNumber) {return prefix + formatDecimals(originalNumber) + suffix; }; //currencies
  }else {
    formatNumber = function(originalNumber) {return originalNumber}
  } 


  //DEFINE BASIC HOVER FUNCTIONS -------------------------------------------------------------
  var hoverColor=function (){d3.select(this).style("fill-opacity", .8);}
  var offColor=function (){d3.select(this).style("fill-opacity", 1);}



  //DEFINE THE DIFFERENT TYPES OF CHARTS=======================================

  //Scatterplot chart ---------------------------------------------------------
  function scatterplotChart(){
    yScale.domain( [0,d3.max(tableJSON, function(d){return d[graphingVariable[0] ] } ) ])
    
    var radiusScale=d3.scale.linear()
      .domain( [0,d3.max(tableJSON, function(d){return d[graphingVariable[1] ] } ) ] )
      .range( [0,30] );


    g.append("circle")
      .attr('r',function (d, i){console.log(d[graphingVariable[0]]+" :: "+d[graphingVariable[1]]);return radiusScale(d[graphingVariable[1]])})
      .attr('cx',function(d,i){return i*(width/tableJSON.length)+padding; /*Number of bars spaced evenly across the width of the SVG */})
      .attr('cy',function(d){console.log("yVariable: "+ d[graphingVariable[0]]); return yScale(d[graphingVariable[0]]);/*y position scaled based on the new yScale (solves for SVG positioning)*/})
      .on("mouseover", hoverColor)
      .on("mouseout", offColor)
      //.on("mousedown", function(d, i){console.log(tableJSON[i].Sport+' players run '+d[graphingVariable[0]]+' miles per game.');})

    //optional function that exposes the data 
    var myCircles=d3.selectAll('circle')
    if(options.clicked != ""){
      myCircles.on("mousedown", eval(options.clicked))
    }else{
      //Default click event
    }


    if(options.labels != ""){
      g.append('text')
        .text(function(d){return d[graphingVariable[1] ] } )
        .attr('x',function (d, i){return i * (width/tableJSON.length)+(width/tableJSON.length-barPadding)/2+padding;} )//Center the labels
        .attr('y',height+20)
        .attr('text-anchor','middle')
        //.classed('barlabels', true)
    }

    addYaxis();
    addXaxis();
  }



  //Donut chart ----------------------------------------------------------------
  function donutChart(){

    //var color=d3.scale.category10();
    var color = d3.scale.ordinal()
      .range(options.colorScale);

    //Center the pieChart
    viz.attr("transform", "translate(" + ( ( (width / 2) - (height / 2) )+padding) + "," + 0 + ")");


    var outerRadius = height/2;
    var innerRadius = donutHole;
    var arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)

    viz.data([tableJSON])

    var pie = d3.layout.pie()
      .sort(null)//make this an optional parameter?
      .value(function(d) { return d[graphingVariable]; })


    var arcs = viz.selectAll('g.arc')
      .data(pie)  
      .enter()
      .append('g')
      .on("mouseover", hoverColor)
      .on("mouseout", offColor)
      .classed('arc',true)
      .attr('transform','translate('+outerRadius+", "+outerRadius+")");


    //optional click event that exposes the data
    if(options.clicked != ""){      
      arcs.on("mousedown", eval(options.clicked))
    } else{
      //default mouse click event
      arcs.on("mousedown", function(d, i){ console.log(tableJSON[i].Sport + ' players run ' + d.value + ' miles per game.'); } )
    }


    arcs.append('path')
      .attr('fill', function (d, i){return color(i) } )
      .attr('d', arc)
      .attr("id", function(d, i) {return "arc" + i} )

    if(options.labels!=""){
      arcs.append('title')
        .text(function(d, i){return prefix + d.value + suffix} );
        //.text(function(d, i){return tableJSON[i][options.labels] + prefix +d.value+suffix});
    }

    arcs.append('text')
      .attr('transform', function(d){return "translate(" + arc.centroid(d) + ")"} )
      .attr('text-anchor', 'middle')
      .text(function(d){return d.value;} )
      .classed('barvalues', true);

    if (options.addLegend){
      console.log("add a legend? " + options.addLegend); 
      addLegend();
    };
  }



  //Horizontal bar chart--------------------------------------------------------
  function barChart(){
    xScale.range([paddingLeftLabels,width-padding]);

    g.append("rect")
      .attr('width',function(d){return xScale(d[graphingVariable]) - paddingLeftLabels} )
      .attr('height',height / tableJSON.length - barPadding)
      .attr('x', paddingLeftLabels)
      .attr('y',function(d,i){return i * ( height / tableJSON.length ) + padding} )      
      .classed('bar',true)
      .on("mouseover", hoverColor)
      .on("mouseout", offColor)
      .append('title')
      .text(function(d, i){return formatNumber( d[graphingVariable] ) } );


    //optional function that exposes the data 
    var myRect=d3.selectAll('rect')
    if(options.clicked != ""){
      myRect.on("mousedown", eval(options.clicked) )
    }else{
      //Default click event
    }




    /*
    //Adding an animation for the build 
    //for some reason it isn't respecting the delay(i)
    //if you add this, the starting width should be set to 0, right?
    g.selectAll('rect')
    .transition()
    .delay(function(d, i) {
      console.log(i)
        return i * 100;
    })
    .duration(500)
    .attr('width',function(d){return xScale(d[graphingVariable]) - paddingLeftLabels;});
    //.each("end", functionToAddLabels);  
    */



    //Add the labels
    if(options.labels != ""){
      g.append('text')
        .text(function(d){return d[label] } )
        .attr('x',0)
        .attr('y',function(d,i){return i * ( height / tableJSON.length ) + .5 * ( height / tableJSON.length ) + padding} )
        .classed('barlabels', true);    
    }


    //Add the values
    g.append('text')
      .text(function(d){console.log( d[graphingVariable] ); return formatNumber( d[graphingVariable] ) } )
      .attr('x',function(d){return xScale(d[graphingVariable]) + 5} )
      .attr('y',function(d,i){return i * (height/tableJSON.length) + .5 * ( height / tableJSON.length ) + padding} )
      .classed('barvalues', true);

    //Add the xAxis
    addXaxis();
  }





  //Vertical column chart--------------------------------------------------------
  function columnChart(){
    g.append("rect")
      .attr('width', width / tableJSON.length - barPadding)/*Makes the bar widths scale based on the number of bars */
      .attr('height', function(d){return height - yScale( d[graphingVariable] ) } )/*height scaled based on yScale */
      .attr('x', function(d,i){return i * ( width / tableJSON.length ) + padding} )
      .attr('y', function(d){return yScale(d[graphingVariable] ) } )
      .classed('bar',true)
      .on("mouseover", hoverColor)
      .on("mouseout", offColor)
      .append('title')
      .text(function(d, i){return formatNumber(d[graphingVariable] ) } );


    var myRect = d3.selectAll('rect')
    if(options.clicked != ""){
      //optional user-defined function that exposes the data 
      myRect.on("mousedown", eval(options.clicked))
    }else{
      //Default click event
      myRect.on("mousedown", animate)
    }


    //add the labels
    if(options.labels!=""){
      g.append('text')
          .text(function(d){return d[label] })
          .attr('x',function (d, i){return i * ( width / tableJSON.length ) + ( width / tableJSON.length - barPadding ) / 2 + padding} )//Center the labels
          .attr('y',height+20)
          .attr('text-anchor','middle')
          .classed('barlabels', true)
    }

    //Add the values
    g.append('text')
      .text(function(d){return formatNumber( d[graphingVariable] ) })
      .attr('x',function (d, i){return i * ( width / tableJSON.length ) + ( width / tableJSON.length - barPadding ) / 2 + padding} )//Center the labels
      .attr('y',function (d){return yScale(d[graphingVariable])-5})
      .attr('text-anchor','middle')
      .classed('barvalues', true);

    //Superfluous animation
    function animate(){
      var oldHeight = d3.select(this).attr('height');
      console.log('Reminding myself that i can use animation');
      d3.select(this).transition()
        .duration(1000)
        .attr("height", 10)
        .attr('y',function(d){return height-10})
        .transition()
        .delay(2000)
        .attr("height", oldHeight)
        .attr('y',function(d){return yScale( d[graphingVariable] ) } )
        .each("end", function(d){console.log("You could run more code on completion here.") } );
    }

    //Add the yAxis at the end
    addYaxis();
  }


  //Create the graph depending on what type of chart is set in the options--------------------------------------------------------
  if (type == "column"){
    columnChart()
  } else if (type == "bar"){
    barChart()
  } else if(type == "donut"){
    donutChart();
    console.log('Time to make the donuts.');
  } else if(type == "pie"){
    donutChart();
    console.log('Mmmmm... pie.');
  } else if(type == 'scatterplot'){
    scatterplotChart();
    console.log('scattered');
  } else {
    console.log("Sorry, we don't currently support "+type+" charts.")
  };

  currentChartNumber++
}
window.addEventListener('resize', function(event){
  rebuildCharts();
});




/*
Known issues:
* Should the JSON conversion strip the commas and prefixes/suffixes out of the chart?
* add onclick so that you can find the data via on click.
* Pie Chart values are lost in smaller wedges
* Axis label options
* Should the bar charts be created (or have the option) of being created with just HTML/divs?
* supporting negative numbers on bar charts.



Things I fixed:
* Multiple charts on a page don't resize.
* Added an optional legend that's created as an HTML div that can be positioned with CSS and media queries
*/
