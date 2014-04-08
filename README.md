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
* An object with optional parameters for 'height', 'type' and 'showTable' (Do you want to show(true) or hide(false) the old chart)

Here's the [working example](http://54.243.239.169/brian/storytelling/tableToSVG.html).

## Next steps
I was thinking about a few different options for going forward:
* Add support for horizontal bar charts
* Add support for [Grouped bar charts](http://bl.ocks.org/mbostock/3887051)
* Add support for scatter plots.
* Add some media query styling for the charts
* At the moment the resize function doesn't work for multiple charts on the page.
* I'm using jQuery to create the JSON but I'm pretty sure you can do this with just D3.
