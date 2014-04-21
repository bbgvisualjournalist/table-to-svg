table-to-svg
============

Converts an HTML table to JSON that is rendered as a responsive D3 SVG chart.

The idea here is that if your phone doesn't support SVG/JavaScript you still have access to the data in a light, accessible form. The idea for this came from this book on [progressive enhancements](http://filamentgroup.com/dwpe/) and this article from [A List Apart](http://alistapart.com/article/svg-with-a-little-help-from-raphael#section5)

## Creating the chart
Here's the function to create the chart:
createChart('typeOfChart', '#sourceTable', "dataColumn", {optional parameters});

You can also add optional parameters like
createChart('bar', '#runningTable', "Miles", {"labels":"Sport", "showTable": true, "barHeight":50, "ticks":4, "xAxis": true});

The function parameters are:
* chart type ('bar', 'column', 'pie' or 'donut')
* sourceTable
* column you want to graph
* An object with optional parameters for 'height', 'showTable' (Do you want to show(true) or hide(false) the old chart), 'barHeight' for horizontal bar charts, 'ticks' which determines the approximate number of ticks on the axis, 'xAxis' do you want to show (true) or hide (false).

Here's a [horizontal bar chart](http://54.243.239.169/brian/storytelling/tableToSVG_bar.html), a [vertical bar chart](http://54.243.239.169/brian/storytelling/tableToSVG.html) and a [donut chart](http://54.243.239.169/brian/storytelling/tableToSVG_donut.html).

## Next steps
Bugs, features and optimizations:
* Should the bar charts be created (or have the option) of being created with just HTML/divs?
* Add support for [Grouped bar charts](http://bl.ocks.org/mbostock/3887051)
* Add support for scatter plots.
* I'm using jQuery to create the JSON but I'm pretty sure you can do this with just D3.
* Do we want to be able to call createChart on multiple charts by targeting all &lt;table class'chartThis'&gt;...&lt;/table&gt;?
* Pie Chart values are lost in smaller wedges
* add onclick so that you can find the data via on click.
* Dollar and percentage values in tables (prefix/suffix?)
* Axis label options
* create a key? position key responsively?
* supporting negative numbers on bar charts
