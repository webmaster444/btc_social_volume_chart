function cschart() {

    var margin = {
            top: 0,
            right: 50,
            bottom: 40,
            left: 5
        },
        width = 920,
        height = 440,
        Bheight = 460;

    function csrender(selection) {
        selection.each(function() {

            var x = d3.time.scale()
                .domain([startDomain, endDomain])
                .range([width / genData.length / 2, width - width / genData.length / 2]);            

            var zoom = d3.behavior.zoom()
                .x(x)
                .xExtent(d3.extent(genData, function(d) {
                    return d.Date
                }))
                .on("zoom", zoomed);

            var interval = TIntervals[TPeriod];

            var minimal = d3.min(genData, function(d) {
                return d.Low;
            });
            var maximal = d3.max(genData, function(d) {
                return d.High;
            });

            var extRight = width + margin.right            

            var y = d3.scale.linear()
                .rangeRound([height, 0]);

            var parseDate = d3.time.format(TFormat[interval]);      

            var xAxis = d3.svg.axis()
                .scale(x);            

            var yAxis = d3.svg.axis()
                .scale(y)
                .ticks(Math.floor(height / 50));

            y.domain([minimal, maximal]).nice();

            // var valueline = d3.svg.line()
            //   .x(function(d) { return x(d.Date) + barwidth/2; })
            //   .y(function(d) { console.log(y(d['PV']));return y(d['PV']); });

            var barwidth = width / genData.length;
            var candlewidth = Math.floor(d3.min([barwidth * 0.8, 13]) / 2) * 2 + 1;
            var delta = Math.round((barwidth - candlewidth) / 2);

            d3.select(this).select("svg").remove();
            var svg = d3.select(this).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", Bheight + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            svg.append("g")
                .attr("class", "axis xaxis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis.orient("bottom"));
            // .outerTickSize(0));

            svg.append("g")
                .attr("class", "axis yaxis")
                .attr("transform", "translate(" + width + ",0)")
                .call(yAxis.orient("right").tickSize(0));

            svg.append("g")
                .attr("class", "axis grid")
                .attr("transform", "translate(" + width + ",0)")
                .call(yAxis.orient("left").tickFormat("").tickSize(width));
            // .outerTickSize(0));

            var bands = svg.selectAll(".bands")
                .data([genData])
                .enter().append("g")
                .attr("class", "bands");

            bands.selectAll("rect")
                .data(function(d) {
                    return d;
                })
                .enter().append("rect")
                .attr("x", function(d) {
                    return x(d.Date) + Math.floor(barwidth / 2);
                })
                .attr("y", 0)
                .attr("height", Bheight)
                .attr("width", 1)
                .attr("class", function(d, i) {
                    return "band" + i;
                })
                .style("stroke-width", Math.floor(barwidth));

            var stick = svg.selectAll(".sticks")
                .data([genData])
                .enter().append("g")
                .attr("class", "sticks");

            stick.selectAll("rect")
                .data(function(d) {
                    return d;
                })
                .enter().append("rect")
                .attr("x", function(d) {
                    return x(d.Date) + Math.floor(barwidth / 2);
                })
                .attr("y", function(d) {
                    return y(d.High);
                })
                .attr("class", function(d, i) {
                    return "stick stick" + i;
                })
                .attr("height", function(d) {
                    return y(d.Low) - y(d.High);
                })
                .attr("width", 1)
                .classed("rise", function(d) {
                    return (d.Close > d.Open);
                })
                .classed("fall", function(d) {
                    return (d.Open > d.Close);
                });

            var candle = svg.selectAll(".candles")
                .data([genData])
                .enter().append("g")
                .attr("class", "candles");

            candle.selectAll("rect")
                .data(function(d) {
                    return d;
                })
                .enter().append("rect")
                .attr("x", function(d) {
                    return x(d.Date) + delta;
                })
                .attr("y", function(d) {
                    return y(d3.max([d.Open, d.Close]));
                })
                .attr("class", function(d, i) {
                    return "candle candle" + i;
                })
                .attr("height", function(d) {
                    return y(d3.min([d.Open, d.Close])) - y(d3.max([d.Open, d.Close]));
                })
                .attr("width", candlewidth)
                .classed("rise", function(d) {
                    return (d.Close > d.Open);
                })
                .classed("fall", function(d) {
                    return (d.Open > d.Close);
                });

            var indicator_g = svg.append('g').attr('class', 'indicator_g').attr('transform', "translate(" + (width) + "," + (y(genData[genData.length - 1].Close) - 7) + ")");

            indicator_g.append('svg').attr('viewBox', "0 0 65 15").attr("enable-background", "new 0 0 65 15").attr('xml:space', "preserve");
            indicator_g.append('path').attr("d", "M65.1,0H11C8.2,0,6.8,0.7,4.5,2.7L0,7.2l4.3,4.6c0,0,3,3.2,6.5,3.2H65L65.1,0L65.1,0z").attr('class', 'ohlc_indicator');
            indicator_g.append('text').attr('x', 12).attr('y', 0).attr('dy', '1em').text(genData[genData.length - 1].Close.toFixed(0));

            var rect = d3.select("#chart1 svg").append("svg:rect")
                .attr("class", "pane")
                .attr("width", width)
                .attr("height", height)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .call(zoom);

            function zoomed() {
                svg.select(".xaxis").call(xAxis);
                svg.selectAll('.candle').data(genData).attr("x", function(d) {
                    return x(d.Date) + delta
                });
                svg.selectAll('.stick').data(genData).attr("x", function(d) {
                    return x(d.Date) + Math.floor(barwidth / 2)
                });

                d3.selectAll('.volume').data(genData).attr("x", function(d) {
                    return x(d.Date) + delta
                });

                // d3.selectAll(".line")
                //      // set the new data
                //     .attr("d", valueline(genData));
            }

        });
    } // csrender


    csrender.Bheight = function(value) {
        if (!arguments.length) return Bheight;
        Bheight = value;
        return csrender;
    };

    return csrender;
} // cschart