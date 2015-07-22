/**
 * Draw a profit bar chart in the "barchart" div.
 * @param   {Array}  barchart_data List of bar data
 */
var draw_bar_graph = function (barchart_data) {
    // Set general bar height
    var barHeight = 28;

    // Set chart area based on div width and room for three bars
    var barchart = d3.select(".barchart")
        .attr("width", document.getElementById("graph-div").offsetWidth)
        .attr("height", barHeight * 3);

    // Scaling function for fitting data into barchart area
    var x = d3.scale.linear()
        .domain([0, Math.max(barchart_data[0].total, barchart_data[1].total)])
        .range([0, document.getElementById("graph-div").offsetWidth - 30]);

    // Calculate offset for the third ("profit/loss") bar
    var transX = Math.min(x(barchart_data[0].total),x(barchart_data[1].total));

    // Set starting positions for all bars and id for third bar
    var bar = barchart.selectAll("g")
        .data(barchart_data)
        .enter().append("g")
        // Shift each bar
        .attr("transform", function(d, i) {
            if (i==2) return "translate(" + transX + "," + barHeight + ")";
            return "translate(0," + i * barHeight + ")";
        })
        .attr("id", function(d, i) {
            return i==2? "profit-bar" : "";
        })

    // Add rect graphic element for each data index (total of three)
    bar.append("rect")
        .attr("width", function(d) { return x(Math.abs(Math.round(d.total))) - 3; })
        .attr("height", barHeight - 1);

    bar.append("text")
        .attr("x", 5)
        .attr("y", barHeight / 2)
        .attr("dy", ".40em")
        .text(function (d) {
            return d.prod_name + '  $' + Math.round(d.total).toString();
        });

    var bar = barchart.selectAll("g")
        .data(barchart_data)
        .transition().duration(500)
        // Shift each bar
        .attr("transform", function(d, i) {
            if (i==2) {
                if (Math.round(d.total) < 0) {
                    return "translate(" + transX + "," + 0 + ")";
                } else {
                    return "translate(" + transX + "," + barHeight + ")";
                }
            }
            return "translate(0," + i * barHeight + ")";
        })

    bar.select("rect")
//            .transition().duration(500)
        .attr("width", function(d) {
            if (Math.round(d.total) < 0) {
                d3.select(this).classed("negative-color", true);
                d3.select(this).classed("positive-color", false);
            } else {
                d3.select(this).classed("negative-color", false);
                d3.select(this).classed("positive-color", true);
            }
            return x(Math.abs(Math.round(d.total))) - 3;
        });

    bar.select("text")
        .text(function (d) {
            return d.prod_name + ' $' + Math.round(d.total).toString();
        });
};
