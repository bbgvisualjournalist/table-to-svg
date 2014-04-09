table-to-svg
============

Converts an HTML table to JSON that is rendered as a responsive D3 SVG chart.

The idea here is that if your phone doesn't support SVG/JavaScript you still have access to the data in a light, accessible form. The idea for this came from Filament Group's book on [progressive enhancements](http://filamentgroup.com/dwpe/)

## Creating the chart
Here's the function to create the chart:
createChart('#runningTable', "#chart", "Miles", "Sport", {"height":100, "type":"bar", "showTable": false);

The function parameters are:
* sourceTable
* target div where you'll build the chart
* column you want to graph
* labels for each bar
* An object with optional parameters for 'height', 'type' ('bar' or 'column') and 'showTable' (Do you want to show(true) or hide(false) the old chart)

Here's a [horizontal bar chart example](http://54.243.239.169/brian/storytelling/tableToSVG_bar.html) and a [vertical bar chart example](http://54.243.239.169/brian/storytelling/tableToSVG.html).

## Next steps
Bugs, features and optimizations:
* Add support for [Grouped bar charts](http://bl.ocks.org/mbostock/3887051)
* Add support for scatter plots.
* Add some media query styling for the charts
* At the moment the resize function doesn't work for multiple charts on the page.
* I'm using jQuery to create the JSON but I'm pretty sure you can do this with just D3.
* Resize the horizontal axis on window resize
* limit label widths (or hide labels) below a certain point
* adjust the height of the graphic based on the amoung of variables being graphed 
* Adjust the distance between bars based on the height to data ratio
