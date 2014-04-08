table-to-svg
============

Converts an HTML table to JSON that is rendered as a responsive D3 SVG chart.

The idea here is that if your phone doesn't support SVG/JavaScript you still have access to the data in a light, accessible form. The idea for this came from Filament Group's book on [progressive enhancements](http://filamentgroup.com/dwpe/)

## Creating the chart
Here's the function to create the chart:
createChart('#runningTable', "#chart", 'Miles', "Sport", true, 150);

The function parameters are:
* sourceTable
* target div where you'll build the chart
* column you want to graph
* labels for each bar
* Do you want to show(true) or hide(false) the old chart
* optional height parameter

Here's the [working example](http://54.243.239.169/brian/storytelling/tableToSVG.html).

## Next steps
I was thinking about a few different for going forward:
* Include optional parameters for things like graph type and size by passing the parameters [via an object](http://stackoverflow.com/a/457589/1349055). There would be required parameters and then an optional object that you could pass additional parameters.
* Or maybe we put the options in the HTML table tags and automate the whole thing? So it automatically creates a chart for tables with a specific attribute or data type.
* Add some media query styling for the charts
* At the moment the resize function doesn't work for multiple charts on the page.
* I'm using jQuery to create the JSON but I'm pretty sure you can do this with just D3.
