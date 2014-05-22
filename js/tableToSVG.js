//The chartArray stores all of the information used to create (and recreate) each charts
var chartArray = [];
var currentChartNumber = 0;
var showLog = false; //expose this through the options parameter?


//Function loops through a table and returns JSON —— There's probably a way to do this with D3. :/ 
function createJSON(tableName) {
  var myRows = [];
  var headersText = [];

  var tableHeaders = tableName + " th"
    , rowNames = tableName + " tbody tr";
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

      //Remove any prefix/suffix characters: £ € $ % ¢ (it might be nice store and autopopulate the prefix/suffix )
      //theCellValue = theCellValue.replace(/[£€$%¢,]/g,"");
      var tempCellValue = theCellValue.replace(/[£€$%¢,]/g,"");

      if ( isNumber( tempCellValue ) == true ){
        theCellValue = parseFloat( tempCellValue );
      }

      myRows[ index ][ headersText[ cellIndex ] ] = theCellValue;      
	  });    
	});
  return myRows;
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}




//====REBUILD THE ChART AFTER RESIZING====================
function rebuildCharts(){
  waitForFinalEvent(function(){
    for (i=0;i<chartArray.length;i++){
      //console.log(chartArray);
      d3.select(chartArray[i].options.svgID).remove();//Loop through and destroy the [i] chart (just the SVG)

      var legendID=chartArray[i].options.targetDiv + " div.legend"
      d3.select(legendID).remove();//Destroy the [i] chart div.legend

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



//GET HELP IN THE CONSOLE WITH CREATING THE CHART ===================================================================================

function chartHelp(){
  console.log('createChart("typeOfChart", "#sourceTable", "dataColumn", \n{"labels":""\n, "targetDiv":""\n, "height":200\n, "showTable":false //Show (true) or hide (false) the source table\n, "barHeight": 30\n, "padding": 15\n, "ticks": 4 //Set the approximate number of ticks in the axis\n, "xAxis":true //Show (true) or hide (false) the xAxis.\n, "colorScale": ["#D4451D", "#FF6C0C", "#FFB819", "#95D600"] //You can set the color palette for pie charts. \n, "donutHole": 55\n, "decimalPlaces": "none"\n, "addComma": false //You can add commas to numbers.\n, "prefix": ""\n, "suffix": ""\n, "clicked": "" //You can add a custom onClick function by defining it like this: var myFunctionBar = function (d, i){console.log("This is a custom function. "+d.Sport+" players run "+d.Miles+ " "+i)}\n, "addLegend": false //You can add a legend.\n, "donutLabel": "Goals" //A label for the donut hole. This can be a string, "min", "max", "minPercentage" or "maxPercentage"\n, "donutLabelTag": "Goals" //A small label under the donut hole label.\n, "chartLabels": "value" //Defaults to the data values. Other options "percentage" or "both".\n , "showLog": true //Show the console.log statements. Default is false.})')
}



//Creating a D3 SVG chart===================================================================================

function createChart(type, sourceTable, graphingVariable, options){
  //Test if the device/browser supports SVG?
  var supportsSVG = document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
  if(!supportsSVG){
    if (type == 'bar' || type == 'column'){
      //console.log("The browser doesn't support SVG and the chart type will be reset to a table-based bar chart.");
      type = "tableBarChart";
    } else if (type == 'donut' || type == 'pie'){
      //console.log("The browser doesn't support SVG and the chart type will be reset to a table-based stacked bar chart.");
      type = "tableStackedAreaChart";
    };
  };

  //Simple function for being able to quickly turn console logging on/off
  function logger (consoleString){
    if (showLog){console.log(consoleString) };
  };


  //DEFINE THE VARIABLES --------------------------------------------------------
  //Check and set the options
  var defaultOptions={"labels":""
    , "targetDiv":""
    , "height":200
    , "showTable":false
    , "barHeight": 30
    , "padding": 15
    , "paddingLabels": 90
    , "ticks": 4
    , "xAxis":true
    , "colorScale": ["#D4451D", "#FF6C0C", "#FFB819", "#95D600"]
    , "donutHole": 55
    , "addLegend": false
    , "donutLabel": ""
    , "labelSlices": true
    , "decimalPlaces": "none"
    , "addComma": false
    , "prefix": ""
    , "suffix": ""
    , "clicked": ""
    , "donutLabelTag": ""
    , "chartLabels": "value" //Defaults to the data values. Other options "percentage" or "both".
    , "showLog": false
    //, "columnLabels": false //Removed because column labels are based on whether they have .hide class in <th>
  };

  if (options){
    if (! options.labels ) {options.labels = defaultOptions.labels };
    if (! options.targetDiv ) {options.targetDiv = defaultOptions.targetDiv };
    if (! options.height ) {options.height = defaultOptions.height };
    if (typeof options.showTable === 'undefined') {options.showTable = true };
    if (! options.barHeight ) {options.barHeight = defaultOptions.barHeight };
    if (! options.padding ) {options.padding = defaultOptions.padding };
    if (! options.paddingLabels ) {options.paddingLabels = defaultOptions.paddingLabels };
    if (typeof options.xAxis === 'undefined' ) { options.xAxis = true };
    if (! options.ticks ) { options.ticks=defaultOptions.ticks };
    if (! options.colorScale ) { options.colorScale = defaultOptions.colorScale };
    if (! options.donutHole ) { options.donutHole = defaultOptions.donutHole };
    if (typeof options.decimalPlaces === 'undefined' ) { options.decimalPlaces=defaultOptions.decimalPlaces };
    if (typeof options.addComma === 'undefined' ) { options.addComma = defaultOptions.addComma };
    if (! options.prefix ) { options.prefix=defaultOptions.prefix };
    if (! options.suffix ) { options.suffix=defaultOptions.suffix };
    if (! options.clicked ) { options.clicked = defaultOptions.clicked };
    if (typeof options.addLegend === 'undefined' ) { options.addLegend = defaultOptions.addLegend };
    if (! options.donutLabel ) { options.donutLabel=defaultOptions.donutLabel };
    if (! options.donutLabelTag ) {options.donutLabelTag = defaultOptions.donutLabelTag};
    if (typeof options.labelSlices === 'undefined' ) { options.labelSlices = true };
    if (! options.chartLabels ) {options.chartLabels = defaultOptions.chartLabels};
    if (options.showLog == true) {showLog = true };
    //if (typeof options.columnLabels === 'undefined' ) { options.columnLabels = false };
  }else{
    options = typeof options !== 'undefined' ? options : defaultOptions;
    //console.log("No option parameters set, so we'll just use the default settings. Type chartHelp() in the console for a list of the parameters.")
  }


  //CREATE THE JSON FROM THE TABLE --------------------------------------------------------
  var tableJSON= createJSON(sourceTable);
  logger("tableJSON (The JSON created from the target table): ")
  logger(tableJSON)
  logger("")


  if (!options.showTable){
    if( supportsSVG || type == 'bar' || type == 'tableBarChart'){
      $(sourceTable).css( {'position':'absolute','left':'-9999px'} ); //preferable to 'display':'none' because it's still readable by screen readers.
    }
  }

  var graphingVariableName;
  if (graphingVariable instanceof Array) {
    //come up with a better name (because you couldn't use graphingVariable if it was an array)
    graphingVariableName = graphingVariable[0]
  } else {
    graphingVariableName = graphingVariable
  }

  //If no targetDiv is set in the options, insert the chart after the table.
  var targetChart;
  if ( options.targetDiv == "" ){
    var chartID = type + '_chart_' + graphingVariableName + currentChartNumber;
    targetChart = '#' + chartID;
    //console.log('targetDiv not set. Adding new div' + targetChart + " " + chartID);
    $( sourceTable ).after( "<div id='" + chartID + "' class='graphic'></div>" );
    options.targetDiv = targetChart;//Added to the options so that it will be stored in the chartArray
  }else{
    targetChart = options.targetDiv
  }


  //set the variables — some of these seem redundant and arbitrary
  var margin = {top: 20, left: 0, bottom: 10, right: 0}
    , width = parseInt( d3.select(targetChart).style('width') )
    , width = width - margin.left - margin.right
    , height = options.height
    , barPadding = 10
    , padding = options.padding
    , paddingLeftLabels = 0
    , label = options.labels
    , donutHole = options.donutHole;

  if( options.labels != "" ){paddingLeftLabels = options.paddingLabels; /* console.log('pll = '+paddingLeftLabels)*/};

  if ( type == 'bar' || type == 'comparison' ){
    height = tableJSON.length*options.barHeight + 10;
    //console.log('Automatically setting the height to ' + height + " pixels (because of the amount of data).");
  }

  if ( type == 'pie' ){
    donutHole=0;
  }


  //CREATE THE SVG-------------------------------------------------------

  var svgID = 'svg_' + type + '_chart_' + graphingVariableName + currentChartNumber;
  options.svgID = '#' + svgID;

  if ( type == 'bar' || type == 'column' || type == 'scatterplot' || type == 'donut' || type == 'pie'){
    var viz = d3.selectAll(targetChart)
      .append('svg')
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
  } else if (type == 'tableBarChart' || type == 'tableStackedArea'){
    //tableBarChart
    svgID = 'div_'+type + '_chart_' + graphingVariable + currentChartNumber;
    options.svgID = '#' + svgID;
    var viz = d3.selectAll(targetChart)
  } else {
    //comparison chart
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

  if ( graphingVariable instanceof Array) {
    //console.log('this is an array')
  }else{
    //console.log('not an array')
  
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

    function addXaxis(){
      if (options.xAxis){
        viz.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + height + ')')//moves the axis to the bottom of the graphic
        .call(xAxis);
      }
    }



    var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('left')
      .ticks(options.ticks);

    function addYaxis(){
      viz.append('g')
      .attr('class', 'axis')
      .attr('transform','translate('+padding+',0)')
      .call(yAxis);
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
      .style('background-color',function (d, i){ /*console.log(i + " " + options.colorScale[i]);*/ return options.colorScale[i]})
      .classed('keySwatch', true);

    //console.log("CREATE THE LEGEND!")
  }




  //Reformat the numbers --------------------------------------------------------
  var reformatTheNumber = false
    , decimalPlaces = options.decimalPlaces
    , addComma = options.addComma
    , addCommaSeparator = ""
    , prefix = options.prefix
    , suffix = options.suffix;

  //£ € $ % 
  if ( decimalPlaces >= 0 || prefix != "" || suffix != "" || addComma ){ reformatTheNumber=true; }

  //How many decimal places do you want to include?
  if ( decimalPlaces == "none" ){
    formatDecimals = function (originalNumber){return originalNumber};
  } else if ( decimalPlaces >= 0 ){ 
    if (addComma){ addCommaSeparator = "," }
    var styleNumber = addCommaSeparator + "." + decimalPlaces + "f";
    formatDecimals = d3.format(styleNumber);
  }

  //Do you want to add a prefix (e.g. £, €, $) or a suffix (e.g. %)
  if (reformatTheNumber){
    if(decimalPlaces === 'undefined'){
      formatNumber = function(originalNumber) {return prefix + originalNumber + suffix }; //currencies
    }else{
      formatNumber = function(originalNumber) {return prefix + formatDecimals(originalNumber) + suffix }; //currencies
    }
  }else {
    formatNumber = function(originalNumber) {return originalNumber }
  } 


  /*
  //FIND THE MAXIMUM WIDTH FOR A SELECTION----------------------------------------------------
  function maximumWidth(selection){
      var textWidth = [];// an array for storing the width of the labels
      var textBoxes = d3.selectAll(selection)
        .each(function () {
          var textWidthNumber = d3.select(this).style("width");
          textWidthNumber = textWidthNumber.replace("px","");
          textWidthNumber = Number(textWidthNumber);
          textWidth.push(textWidthNumber);
        });

      paddingLeftLabels = Math.max.apply(Math, textWidth) + 7;
      console.log('dkfjalksdjf;a')
    }
  */


  //DEFINE BASIC HOVER FUNCTIONS -------------------------------------------------------------
  var hoverColor=function (){d3.select(this).style("fill-opacity", .8);}
  var offColor=function (){d3.select(this).style("fill-opacity", 1);}



  //DEFINE THE DIFFERENT TYPES OF CHARTS =======================================


  //Comparison chart :: Responsive view? grouped charts with labels? Or Just show the table view below a certain width-----------------
  function comparisonBarChart(){
    if (width > 400){
      //Find the maximum value for creating the scales
      var maxValueArray = [];
      for (var i = 0; i < tableJSON.length; i++) {
        maxValueArray.push(tableJSON[i][graphingVariable[0]]);
        maxValueArray.push(tableJSON[i][graphingVariable[1]]);
      };
      var maxValue = Math.max.apply(Math, maxValueArray);
      if (options.suffix == "%"){maxValue = 100};

      //If sourceTable <th> includes .hide class don't add column labels
      var labelPadding = 0; 
      var hideLabelsSelection = sourceTable + " thead tr th.hide"; //checks to see if you want to hide the labels
      var hideLabels = d3.selectAll(hideLabelsSelection);
      if (hideLabels[0].length == 0){labelPadding = 20};

      //Add the SVG
      var viz = d3.selectAll(targetChart)
        .append('svg')
        .attr("id", svgID)
        //.style('width', (width + margin.left + margin.right) )
        .style('height', height+labelPadding);

      //Add the center column with labels
      viz.append('g')
        .classed('middle', true)
        .attr("transform", "translate(" + width / 2 + ", " + labelPadding*1.5 + ")")
        .selectAll('text')
        .data(tableJSON)
        .enter()
        .append('text')
        .text(function (d, i){return d[label]})
        .attr('y',function(d,i){return i * ( options.barHeight ) + .5 * ( options.barHeight ) } )
        .attr('text-anchor','middle')
        .style('font-weight', 'bold');


      //Determine the width of the center column
      //Firefox defaults text/element widths to auto/100%, which means you can't measure how large/wide they are
      //https://bugzilla.mozilla.org/show_bug.cgi?id=736431
      var testIfAutoWidth=false;
      var middleWidth;
      var columnWidth;
      var textWidth = [];// an array for storing the width of the labels
      var textBoxes = viz.selectAll('text')
        .each(function () {
          var textWidthNumber = d3.select(this).style("width");
          if (textWidthNumber == 'auto'){testIfAutoWidth = true};
          textWidthNumber = textWidthNumber.replace("px", "");
          textWidthNumber = Number(textWidthNumber);
          textWidth.push(textWidthNumber);
        });
      if (testIfAutoWidth){
        //console.log("you're using firefox or another browser that sets 'auto' widths for svg elements."+options.paddingLabels)
        middleWidth = options.paddingLabels;
      }else{
        middleWidth = Math.max.apply(Math, textWidth) + 50;
        columnWidth = (width - middleWidth) / 2;
      }                

      //Create the xScale
      var xScaleComparison = d3.scale.linear()
        .domain([0, maxValue ] )
        .range([0, columnWidth - 40 ] );


      //Add column labels (if the sourceTable doesn't include .hide in the <th>)
      if (hideLabels[0].length == 0){
        viz.append('text')
          .text(graphingVariable[0])
          .attr('y', 20)
          .style('font-weight', 'bold')

        viz.append('text')
          .text(graphingVariable[1])
          .attr('y', 20)
          .attr('x', width)
          .style('font-weight', 'bold')
          .attr('text-anchor','end');
      }

      //Add the left column <g>
      viz.append('g')
        .classed('left', true)
        .attr("transform", "translate(0, " + labelPadding*1.5 + ")")
        .selectAll('g')
        .data(tableJSON)
        .enter()
        .append('g')

      //Add the right column <g>
      viz.append('g')
        .classed('right', true)
        .attr("transform", "translate(" + ((width / 2) + (middleWidth/2)) + ", " + labelPadding*1.5 + ")")
        .selectAll('g')
        .data(tableJSON)
        .enter()
        .append('g');


      //Add the bars and labels to the left column
      var left = viz.selectAll('.left g');

      left.append('rect')
        .classed('bar home', true)
        .style('fill', options.colorScale[0])
        .attr('width', function (d, i){return xScaleComparison(d[graphingVariable[0] ] ) } )
        .attr('height',options.barHeight-barPadding)
        .attr('x', function (d, i){return columnWidth - xScaleComparison( d[graphingVariable[0] ] ) } )
        .attr('y', function (d, i){return i * options.barHeight } );

      left.append('text')
        .attr('x', 0)
        .attr('y',function(d,i){return i * ( options.barHeight ) + .5 * ( options.barHeight ) } )
        .text(function (d, i){return options.prefix + d[graphingVariable[0] ] + options.suffix } );


      //Add the bars and labels to the right column
      var right = viz.selectAll('.right g');

      right.append('rect')
        .classed('bar away', true)
        .style('fill', options.colorScale[1])
        .attr('width', function (d, i){return xScaleComparison(d[graphingVariable[1]]) } )
        .attr('height',options.barHeight - barPadding)
        .attr('y',function(d,i){return i * ( options.barHeight ) } );

      right.append('text')
        .attr('x', columnWidth)
        .attr('y',function(d,i){return i * ( options.barHeight ) + .5 * ( options.barHeight ) } )
        .text(function (d, i){return options.prefix + d[graphingVariable[1]] + options.suffix})
        .attr('text-anchor','end');
    } else {
        //On smaller screens, maybe just show the table
    }
  }



  //tableStackedAreaChart :: for devices/browsers that don't support SVG and have pie/donut charts------------------
  function tableStackedAreaChart(){
    //Building a binary (2-value) stacked bar chart
    if(tableJSON.length == 2) {

        var color = d3.scale.ordinal()
          .range(options.colorScale);

        //...You could probably do this better with a d3.scale
        var barWidthNumber = viz.style('width');
        var paddingValuesRight = 0;

        barWidthNumber = barWidthNumber.replace('px', '');
        barWidthNumber = Number(barWidthNumber);

        //Set the max value based on the data (for scaling)
        var maxValue = d3.max(tableJSON, function(d) { return d[graphingVariable] } )

        //find the total for the data
        var subtotal = 0;
        for (var i = 0; i < tableJSON.length; i++) {
          subtotal += tableJSON[i][graphingVariable];
        };
        //console.log('subtotal: '+subtotal)
        //=========================================

        viz.append('table')
          .attr('id', svgID)
          .classed('tableStackedArea', true)
          .style('width', '100%')
          .append('tr');

        var vizRows = viz.select('tr');

        vizRows.append('td').text(tableJSON[0][options.labels]); //Add left label

        vizRows.append('td')
          .classed('data', true)
          .style('width','100%')
          .style('padding', '0 5px'); //Add the middle section

        vizRows.append('td').text(tableJSON[1][options.labels] ); //Add right label

        var middleCellWidth = d3.select('.data').style("width").replace("px", "");


        viz.selectAll('td.data').selectAll('td').data(tableJSON)
          .enter()
          .append('td')
          .style('width', function(d,i){return d[graphingVariable] / subtotal * middleCellWidth } )
          .style('height', '30px')
          .style('padding', '0 10px')
          .style('bgcolor', function (d, i){return color(i) } )
          .style('background-color', function (d, i){return color(i) } )
          .html(function(d,i){
            //Options for labels
            var chartLabels = options.chartLabels;
            var value = 0;

            if (chartLabels == 'both')
              {value = '<strong>' + Math.round(d[graphingVariable] / subtotal * 100) + '%</strong> (' + d[graphingVariable] + ' ' + tableJSON[i][options.labels] + ')' } 
            else if (chartLabels == 'percentage')
              { value = '<strong>' + Math.round(d[graphingVariable] / subtotal * 100) + '%</strong>'}
            else { value = d[graphingVariable] };

            return value })
    }else{
        //You can build a stacked area chart with a table, but the labels don't work well (v16c)
    }
  }




  //tableBarChart :: for devices/browsers that don't support SVG------------------
  function tableBarChart(){
    //If no labels are set, remove the labelPadding
    if (options.labels != ""){
      paddingLabelsLeft = 80      
    } else {
      paddingLabelsLeft = 0
    }
    var paddingValuesRight = 60


    //Add a div to contain all of the bar chart tables
    var tablesDiv = d3.selectAll(targetChart).append('div')
      .attr("id", svgID)
      .style('width', (width + margin.left + margin.right) + 'px')
      //.style('height', height + margin.top + margin.bottom + padding)


    //...You could probably do this better with a d3.scale
    var barWidthNumber = tablesDiv.style("width");
    barWidthNumber = barWidthNumber.replace("px", "");
    barWidthNumber = Number(barWidthNumber) - paddingLabelsLeft - paddingValuesRight;
    //console.log('textWidthNumber: ' + barWidthNumber)


    //Set the max value based on the data (for scaling)
    var maxValue=d3.max(tableJSON, function(d){ return d[graphingVariable] } )


    //Add a table (with a row) for each line of data
    var tables = tablesDiv.selectAll('table')
      .data(tableJSON)
      .enter()
      .append('table')
      .classed('tableBars', true)
      .append('tr')


    //Add the labels if options.labels is set.
    if (options.labels != ""){
      tables.append('td')
        .classed('labeled',true)
        .text(function (d,i){return d[options.labels] } )
        .style('text-align', 'left')
        .style('width', 5 + 'px'); //This is a temporary width so that you can test the width to find the largest width
    }
    

    //Add and scale the bar, and color it red.
    tables.append('td')
      .classed('bar', true)
      .style('width', function(d,i){return d[graphingVariable] / maxValue * barWidthNumber } )
      .style('bgcolor', '#900')
      .style('background-color', '#900')


    //Add the values to the bars
    tables.append('td')
      .classed('values', true)
      .text(function(d,i){return d[graphingVariable] } )
      .style('text-align', 'left')


    var tableBarID = "#" + svgID + " .labeled";
    var textWidth = [];// an array for storing the width of the labels

    var textBoxes = d3.selectAll(tableBarID)
      .each(function () {
        var textWidthNumber = d3.select(this).style("width");
        textWidthNumber = textWidthNumber.replace("px","");
        textWidthNumber = Number(textWidthNumber);
        textWidth.push(textWidthNumber);
      });

    paddingLeftLabels = Math.max.apply(Math, textWidth) + 7;
    
    if (options.labels != ""){
      d3.selectAll(tableBarID).style('width', paddingLeftLabels + 'px'); //This is a temporary width so that you can test the width to find the largest width
    }
  }



  //Scatterplot chart ---------------------------------------------------------
  function scatterplotChart(){
    yScale.domain( [0,d3.max(tableJSON, function(d){return d[graphingVariable[0] ] } ) ])
    
    var radiusScale=d3.scale.linear()
      .domain( [0,d3.max(tableJSON, function(d){return d[graphingVariable[1] ] } ) ] )
      .range( [0,30] );


    g.append("circle")
      .attr('r',function (d, i){/* console.log(d[graphingVariable[0]]+" :: "+d[graphingVariable[1]]);*/return radiusScale(d[graphingVariable[1]])})
      .attr('cx',function(d,i){return i*(width/tableJSON.length)+padding; /*Number of bars spaced evenly across the width of the SVG */})
      .attr('cy',function(d){/*console.log("yVariable: "+ d[graphingVariable[0]]);*/ return yScale(d[graphingVariable[0]]);/*y position scaled based on the new yScale (solves for SVG positioning)*/})
      .on("mouseover", hoverColor)
      .on("mouseout", offColor)
      //.on("mousedown", function(d, i){console.log(tableJSON[i].Sport+' players run '+d[graphingVariable[0]]+' miles per game.');})

    //optional function that exposes the data 
    var myCircles=d3.selectAll('circle'); //you'll need to make this more specific so there won't be conflicts with multiple charts on page.
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

    var outerRadius = height/2.7;
    var innerRadius = donutHole;

    //Center the pieChart
    viz.attr("transform", "translate(" + ( ( (width / 2) - outerRadius )+padding) + "," + height/4.2 + ")");



    var arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)

    //This larger arc is used for placing the labels
    var arcLarge = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius*2)

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
      arcs.on("mousedown", function(d, i){ alert(options.prefix + d.value + options.suffix + " "+ tableJSON[i][options.labels] + ' '  + ''); } )
    }


    arcs.append('path')
      .attr('fill', function (d, i){return color(i) } )
      .attr('d', arc)
      .attr("id", function(d, i) {return "arc" + i} )

    if(options.labels!=""){
      arcs.append('title')
        .text(function(d, i){return prefix + d.value + suffix + " " + tableJSON[i][options.labels]} );
    }
    if(options.labelSlices){
      arcs.append('text')
        .attr('transform', function(d){/*console.log('arc.centroid(d): '+arc.centroid(d));*/ return "translate(" + arcLarge.centroid(d) + ")"} )
        .append("tspan")
        .text(function(d){return formatNumber( d.value )})
        .attr("dy", 0)
        .attr("x", 0)
        .attr("text-anchor", "middle")
        .attr("class", "donutLabel");

      arcs.select('text')
        .append("tspan")
        .text(function(d, i){return tableJSON[i][options.labels]})
        .attr("dy", '1.1em')
        .attr("x", 0)
        .attr("text-anchor", "middle")
        .attr("class", "donutLabelText");


        /*
        .attr('text-anchor', 'middle')
        .text(function(d){return formatNumber( d.value ) + " " +tableJSON[i][options.labels] } )
        .classed('barvalues', true);
        */
    }

    if (options.addLegend){
      //console.log("add a legend? " + options.addLegend); 
      addLegend();
    };



    //Add optional donut hole label--------------------------------------
    if (options.donutLabel!=""){
      if (options.donutLabel == "max" || options.donutLabel == "min"){
        //Donut hole label == the the maximum/minimum value
        var values=[];
        for (i=0;i<tableJSON.length;i++){
          values.push(tableJSON[i][graphingVariable]);
        }
        var maximumValue = Math[options.donutLabel].apply(Math, values);
        options.donutLabel = options.prefix + maximumValue + options.suffix;
      } else if (options.donutLabel == "maxPercentage" || options.donutLabel == "minPercentage"){
        //Donut hole label == the the maximum/minimum percentage 
        var total = 0;
        for (i = 0; i < tableJSON.length; i++){
          total += tableJSON[i][graphingVariable];
        }
        var valueLimit;
        if (options.donutLabel == "maxPercentage"){ valueLimit = 'max' };
        if (options.donutLabel == "minPercentage"){ valueLimit = 'min' };

        var values=[];
        for (i=0;i<tableJSON.length;i++){
          values.push(tableJSON[i][graphingVariable]);
        }
        var maximumValue = Math[valueLimit].apply(Math, values);
        var percentage = Math.round(maximumValue / total * 100) + "%";

        options.donutLabel = percentage;
      };

      var donutLabelTag = options.donutLabelTag;
      var textOffset = (outerRadius + innerRadius / 4);

      //Add the secondary, smaller donut hole label
      if (donutLabelTag != ""){
        textOffset = (outerRadius + innerRadius / 14)

        viz.append('text')
          .attr('transform', 'translate(' + outerRadius + ", " + (outerRadius + innerRadius / 2.5) + ")")
          .text(donutLabelTag)
          .style('font-size', innerRadius / 4 + 'px')
          .classed('donutLabel', true)
          .attr('text-anchor', 'middle');
      }

      //Add the main donut hole label
      viz.append('text')
        .attr('transform', 'translate(' + outerRadius + ", " + textOffset + ")")
        .text(options.donutLabel)
        .style('font-size', innerRadius / 1.5 + 'px')
        .classed('donutLabel',true)
        .attr('text-anchor', 'middle');
    }
  }



  //Horizontal bar chart--------------------------------------------------------
  function barChart(){
    //Add the labels
    if(options.labels != ""){
      g.append('text')
        .text(function(d){return d[label] } )
        .attr('x',0)
        //.attr('y',function(d,i){return i * ( height / tableJSON.length ) + .5 * ( height / tableJSON.length ) + padding } )
        .attr('y',function(d,i){return i * ( options.barHeight ) + .5 * ( options.barHeight ) + padding } )
        .classed('barlabels', true);    
    }


    //Firefox defaults text/element widths to auto/100%, which means you can't measure how large/wide they are
    //https://bugzilla.mozilla.org/show_bug.cgi?id=736431
    var testIfAutoWidth=false;

    var textWidth = [];// an array for storing the width of the labels
    var textBoxes = g.selectAll('text')
      .each(function () {
        var textWidthNumber = d3.select(this).style("width");
        if (textWidthNumber == 'auto'){testIfAutoWidth=true}
        textWidthNumber = textWidthNumber.replace("px", "");
        textWidthNumber = Number(textWidthNumber);
        textWidth.push(textWidthNumber);
      });
    if (testIfAutoWidth){
      console.log("you're using firefox or another browser that sets 'auto' widths for svg elements."+options.paddingLabels)
      paddingLeftLabels=options.paddingLabels;
    }else{
      paddingLeftLabels = Math.max.apply(Math, textWidth) + 7;
    }

    xScale.range( [paddingLeftLabels, width - padding ]);



    g.append("rect")
      .attr('width',function(d){return xScale(d[graphingVariable] ) - paddingLeftLabels } )
      //.attr('height',height / tableJSON.length - barPadding)
      .attr('height',options.barHeight-barPadding)
      .attr('x', paddingLeftLabels)
      //.attr('y',function(d,i){return i * ( height / tableJSON.length ) + padding } )      
      .attr('y',function(d,i){return i * ( options.barHeight ) + padding } )      
      .classed('bar',true)
      .on("mouseover", hoverColor)
      .on("mouseout", offColor)
      .append('title')
      .text(function(d, i){return formatNumber( d[graphingVariable] ) } );


    //optional function that exposes the data 
    var myRect=g.selectAll('rect')
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


    //Add the values
    g.append('text')
      .text(function(d){return formatNumber( d[graphingVariable] ) } )
      .attr('x',function(d){return xScale( d[graphingVariable] ) + 5} )
      //.attr('y',function(d,i){return i * ( height / tableJSON.length ) + .5 * ( height / tableJSON.length ) + padding} )
      .attr('y',function(d,i){return i * ( options.barHeight ) + .5 * ( options.barHeight ) + padding} )
      .classed('barvalues', true);

    //Add the xAxis
    addXaxis();
  }





  //Vertical column chart--------------------------------------------------------
  function columnChart(){

    g.append('rect')
      .attr('width', width / tableJSON.length - barPadding)/*Makes the bar widths scale based on the number of bars */
      .attr('height', function(d){return height - yScale( d[graphingVariable] ) } )/*height scaled based on yScale */
      .attr('x', function(d,i){return i * ( width / tableJSON.length ) + padding} )
      .attr('y', function(d){return yScale(d[graphingVariable] ) } )     
      //.classed('bar',true)
      .on("mouseover", hoverColor)
      .on("mouseout", offColor)
      .append('title')
      .text(function(d, i){return formatNumber(d[graphingVariable] ) } );


    //var myRect = g.selectAll('rect')
    var myRect = g.select('rect')
    if(options.clicked != ""){
      //optional user-defined function that exposes the data 
      myRect.on("mousedown", eval(options.clicked))
    }else{
      //Default click event
      myRect.on("mousedown", animate)
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
      /*console.log('Reminding myself that i can use animation');*/
      d3.select(this).transition()
        .duration(1000)
        .attr("height", 10)
        .attr('y',function(d){return height-10})
        .transition()
        .delay(2000)
        .attr("height", oldHeight)
        .attr('y',function(d){return yScale( d[graphingVariable] ) } );
        //.each("end", function(d){console.log("You could run more code on completion here.") } );
    }

    //Add the yAxis at the end
    addYaxis();


    //Add the legend---------------------------------
    if (options.addLegend){
      var color = d3.scale.ordinal()
        .range(options.colorScale);
      
      myRect.attr('fill', function (d, i){return color(i) } )
      //console.log("add a legend? " + options.addLegend); 
      addLegend();
    }else{
      myRect.classed('bar',true);

      //add the labels ... should this be here or outside of the addLegend conditional?
      if(options.labels!=""){
        g.append('text')
            .text(function(d){return d[label] })
            .attr('x',function (d, i){return i * (width/tableJSON.length)+(width/tableJSON.length-barPadding)/2+padding;})//Center the labels
            .attr('y',height+20)
            .attr('text-anchor','middle')
            .classed('barlabels', true)
      }
    }

  }


  //Create the graph depending on what type of chart is set in the options--------------------------------------------------------
  if (type == "column"){
    columnChart();
  } else if (type == "bar"){
    barChart();
  } else if (type == "comparison"){
    comparisonBarChart();
  } else if(type == "donut"){
    donutChart();
    logger('Time to make the donuts.');
  } else if(type == "pie"){
    donutChart();
    logger('Mmmmm... pie.');
  } else if(type == 'scatterplot'){
    scatterplotChart();
    logger('scattered');
  } else if(type == 'tableBarChart'){
    tableBarChart();
    logger('table-based chart');
  } else if(type == 'tableStackedArea'){
    tableStackedAreaChart();
    logger('table-based donut chart (aka stacked bar chart)');
  }else {
    console.log("Sorry, we don't currently support "+type+" charts.")
  };

  currentChartNumber++
}
window.addEventListener('resize', function(event){
  rebuildCharts();
});




/*
Known issues:
* Fix the axis for bar charts
* Fix the axis for column charts
* Axis label options
* Pass in an optional color parameter for bars etc.
* Should the bar charts be created (or have the option) of being created with just HTML/divs/tables?
* Trying to add legends to the column chart
* add onclick so that you can find the data via on click.
* supporting negative numbers on bar charts.


Things I fixed:
* Add 'chartLabels' to options.chartLabels
* Add 'logger()' function to turn console.logs on/off for debugging
* Removing extraneous console.logs
* Create a comparison chart
* Can Pie charts fall back to table graphic when there's no SVG? (Works well for 2-value charts)
* Pie Chart values are lost in smaller wedges. 
* Added options.donutLabelTag for a smaller label under options.donutLabel
* Added options.donutLabel for a large number label in the center of the Donut Hole.
* Added options.labelSlices (default true) so that you can turn off the numbers for the slices.
* Removed any prefix/suffix characters from the source table (£ € $ % ¢)
* Automatically size the labels for tableBarChart() If the width is hardcoded, it breaks.

Resources for pie charts
    //From interactive data viz book and http://bl.ocks.org/Guerino1/2295263
    //http://jsfiddle.net/gregfedorov/Qh9X5/9/

    //Need to fix the labels
    //http://stackoverflow.com/questions/19681724/how-to-avoid-labels-overlapping-in-a-d3-js-pie-chart

    //Need to add a key
    //http://bl.ocks.org/ZJONSSON/3918369
*/

