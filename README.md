table-to-svg
============

Converts an HTML table to JSON that is rendered as a responsive D3 SVG chart.

The idea here is that if your phone doesn't support SVG/JavaScript you still have access to the data in a light, accessible form. The idea for this came from Filament Group's book on [progressive enhancements](http://filamentgroup.com/dwpe/)

## Creating the chart
Here's the function to create the chart:
createChart('#runningTable', "#chart", "Miles", "Sport", {"type":"bar", "showTable": true, "barHeight":50, "ticks":4, "xAxis": true, "paddingLabels":100});

The function parameters are:
* sourceTable
* target div where you'll build the chart
* column you want to graph
* labels for each bar
* An object with optional parameters for 'height', 'type' ('bar' or 'column'), 'showTable' (Do you want to show(true) or hide(false) the old chart), 'barHeight' for horizontal bar charts, 'ticks' which determines the approximate number of ticks on the axis, 'xAxis' do you want to show (true) or hide (false), and 'paddingLabels' to adjust where the horizontal bars start based on the bar labels.

Here's a [horizontal bar chart example](http://54.243.239.169/brian/storytelling/tableToSVG_bar.html) and a [vertical bar chart example](http://54.243.239.169/brian/storytelling/tableToSVG.html).

## Next steps
Bugs, features and optimizations:
* Add support for [Grouped bar charts](http://bl.ocks.org/mbostock/3887051)
* Add support for pie charts.
* Add support for scatter plots.
* Add some media query styling for the charts
* At the moment the resize function doesn't work for multiple charts on the page.
* I'm using jQuery to create the JSON but I'm pretty sure you can do this with just D3.
* limit label widths (or hide labels) below a certain point
