function linechart() {

  var margin = {top: 300, right: 30, bottom: 10, left: 5 },
      width = 620, height = 430, mname = "mbar1";  
  
  var MValue = "PV";

  function linerender(selection) {    
    selection.each(function(data) {
  
      var x = d3.scale.ordinal()
          .rangeBands([0, width]);
      
      var y = d3.scale.linear()
          .rangeRound([height, 0]);
      
      var xAxis = d3.svg.axis()
          .scale(x)
          .tickFormat(d3.time.format(TFormat[TIntervals[TPeriod]]));
      
      var yAxis = d3.svg.axis()
          .scale(y)
          .ticks(Math.floor(height/50));
      
      var svg = d3.select(this).select("svg")
         .append("g")
         .attr('class','linechart_wrapper')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
      x.domain(data.map(function(d) { return d.Date; }));
      // y.domain([0, d3.max(data, function(d) { return d[MValue]; })]).nice();
      y.domain(d3.extent(data, function(d) { return d[MValue]; })).nice();

  
      var xtickdelta   = Math.ceil(60/(width/data.length))
      xAxis.tickValues(x.domain().filter(function(d, i) { return !((i+Math.floor(xtickdelta/2)) % xtickdelta); }));
  
      svg.append("g")
          .attr("class", "axis yaxis")
          .attr("transform", "translate(" + width + ",0)")
          .call(yAxis.orient("right").tickFormat("").tickSize(0));
  
//      svg.append("g")
//          .attr("class", "axis yaxis")
//          .attr("transform", "translate(0,0)")
//          .call(yAxis.orient("left"));
  
      var barwidth    = x.rangeBand();
      var fillwidth   = (Math.floor(barwidth*0.9)/2)*2+1;
      var bardelta    = Math.round((barwidth-fillwidth)/2);
  
  var valueline = d3.svg.line()
  .x(function(d) { return x(d.Date) + bardelta; })
  .y(function(d) { return y(d[MValue]); });

      // var mbar = svg.selectAll("."+mname+"bar")
      //     .data([data])
      //   .enter().append("g")
      //     .attr("class", mname+"bar");
  
    svg.append("path")  
    .attr("class", "line")
    .attr("d", valueline(data));

      // mbar.selectAll("rect")
      //     .data(function(d) { return d; })
      //   .enter().append("rect")
      //     .attr("class", mname+"fill")
      //     .attr("x", function(d) { return x(d.Date) + bardelta; })
      //     .attr("y", function(d) { return y(d[MValue]); })
      //     .attr("class", function(d, i) { return mname+i; })
      //     .attr("height", function(d) { return y(0) - y(d[MValue]); })
      //     .attr("width", fillwidth);
    });
  } // linerender
  linerender.mname = function(value) {
          	if (!arguments.length) return mname;
          	mname = value;
          	return linerender;
      	};

  linerender.margin = function(value) {
          	if (!arguments.length) return margin.top;
          	margin.top = value;
          	return linerender;
      	};

  linerender.MValue = function(value) {
          	if (!arguments.length) return MValue;
          	MValue = value;
          	return linerender;
      	};

return linerender;
} // linechart