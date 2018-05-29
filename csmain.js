var parseDate = d3.time.format("%Y-%m-%d").parse;
var TPeriod = "3M";
var TDays = {
    "1M": 21,
    "3M": 63,
    "6M": 126,
    "1Y": 252,
    "2Y": 504,
    "4Y": 1008
};
var TIntervals = {
    "1M": "day",
    "3M": "day",
    "6M": "day",
    "1Y": "week",
    "2Y": "week",
    "4Y": "month"
};
var TFormat = {
    "day": "%d",
    "week": "%d %b '%y",
    "month": "%b '%y"
};
var genRaw, genData;
var ema12, ema26 = [];
var startDate = "2018-05-01T00:00:00";
var endDate = "2018-05-27T00:00:00";
var period = "1w";
var endDomain = Date.parse(endDate);
var startDomain = Date.parse(startDate);
if (period == "1w") {
    var timestamp = 1000 * 60 * 60 * 24 * 7;
    startDomain = endDomain - timestamp;
}
(function() {
    var url = "https://dev.decryptz.com/api/v1/charts/dashboard?symbol=btc&interval=day&startDate=2018-04-01%2000:00:00&endDate=2018-05-28%2000:00:00";
    d3.json(url, function(error, data) {
        // d3.json("api_data2.json",function(error,data){        
        data.forEach(function(d) {
            d.Date = Date.parse(d.Date);
            d.Low = +d.Low;
            d.High = +d.High;
            d.Open = +d.Open;
            d.Close = +d.Close;
            d.Volume = +d.Volume;
            d.PV = +d.PV;
            d.PS = +d.PS;
            d.NV = +d.NV;
            d.TV = +d.TV;
        })
        genRaw = data;
        ema12 = calcema(12, genRaw);
        ema26 = calcema(26, genRaw);
        mainjs();
    });

    $('#linechart_select').change(function() {
        $('svg g.linechart_wrapper').remove();
        var chart = linechart().mname($(this).val().toLowerCase()).margin(0).MValue($(this).val());
        d3.select("#chart1").datum(genData).call(chart);
        d3.select('#chart1').selectAll('path').on('mouseover', function(d, i) {
            d3.select(this).style('stroke-width', '4px');
        }).on('mouseout', function(d, i) {
            d3.select(this).style('stroke-width', '2px');
        });
    });

}());

function toSlice(data) {
    return data.slice(-TDays[TPeriod]);
}

function mainjs() {
    var toPress = function() {
        genData = (TIntervals[TPeriod] != "day") ? dataCompress(toSlice(genRaw), TIntervals[TPeriod]) : toSlice(genRaw);
    };
    toPress();
    displayAll();    
}

function displayAll() {    
    displayCS();
    displayGen(genData.length - 1);
}

function displayCS() {
    var chart = cschart().Bheight(460);
    d3.select("#chart1").call(chart);

    var chart = barchart().mname("volume").margin(380).MValue("Volume");
    d3.select("#chart1").datum(genData).call(chart);

    var chart = linechart().mname("ps").margin(0).MValue("PS");
    d3.select("#chart1").datum(genData).call(chart);

    var chart = linechart().mname("pv").margin(0).MValue("PV");
    d3.select("#chart1").datum(genData).call(chart);

    var chart = linechart().mname("nv").margin(0).MValue("NV");
    d3.select("#chart1").datum(genData).call(chart);

    var chart = linechart().mname("tv").margin(0).MValue("TV");
    d3.select("#chart1").datum(genData).call(chart);

    var chart = emachart().mname("ema12").margin(0);
    d3.select("#chart1").datum(ema12).call(chart);

    var chart = emachart().mname("ema26").margin(0);
    d3.select("#chart1").datum(ema26).call(chart);

    if (genData[0].hasOwnProperty('IP')) {
        var chart = linechart().mname("ip").margin(0).MValue("IP");
        d3.select("#chart1").datum(genData).call(chart);
    }

    hoverAll();
}

function hoverAll() {
    d3.select("#chart1").select(".bands").selectAll("rect")
        .on("mouseover", function(d, i) {
            d3.select(this).classed("hoved", true);
            d3.select(".stick" + i).classed("hoved", true);
            d3.select(".candle" + i).classed("hoved", true);
            d3.select(".volume" + i).classed("hoved", true);
            d3.select(".sigma" + i).classed("hoved", true);
            displayGen(i);
        })
        .on("mouseout", function(d, i) {
            d3.select(this).classed("hoved", false);
            d3.select(".stick" + i).classed("hoved", false);
            d3.select(".candle" + i).classed("hoved", false);
            d3.select(".volume" + i).classed("hoved", false);
            d3.select(".sigma" + i).classed("hoved", false);
            displayGen(genData.length - 1);
        });

    d3.select('#chart1').selectAll('path').on('mouseover', function(d, i) {
        d3.select(this).style('stroke-width', '4px');
    }).on('mouseout', function(d, i) {
        d3.select(this).style('stroke-width', '2px');
    });
}

function calcema(period, data) {
    var index = 0;
    var isum = d3.sum(data, function(d) {
        ++index;
        if (index <= period) {
            return d.Close
        }
    });
    var isma = isum / period;
    var multiplier = (2 / (period + 1));
    var emares = [];

    var tmp = new Object;
    tmp['Date'] = data[0]['Date'];
    tmp['ema'] = isma;

    emares.push(tmp);

    for (var i = 1; i < data.length; i++) {
        var tmp_arr = new Object;
        tmp_arr['Date'] = data[i]['Date'];
        var tmp_ema = (data[i]['Close'] - emares[i - 1]['ema']) * multiplier + emares[i - 1]['ema'];
        tmp_arr['ema'] = tmp_ema;
        emares.push(tmp_arr);
    }

    return emares;
}

function displayGen(mark) {
    // var header      = csheader();
    // d3.select("#infobar").datum(genData.slice(mark)[0]).call(header);
}

$('.custom-control-input').change(function() {
    if ($(this).val() != "implied_price") {
        var clicked = $(this).val();
        var tmpStr = '.ema_chart.ema_chart_wrapper_' + clicked;
        $(tmpStr).toggle();
    } else {
        $('.linechart_wrapper.ip').toggle();
    }
})

$('input[type=radio][name=view]').change(function() {
    var interval = '';
    $('#period').html('');
    if ($(this).val() == '1m') {
        $('#period').append('<option value="1h">1h</option>');
        $('#period').append('<option value="3h">3h</option>');
        $('#period').append('<option value="6h">6h</option>');
        $('#period').append('<option value="1d">1d</option>');
        $('.implied_price').css('display', 'none');
        interval = "minute";
    } else if ($(this).val() == "1h") {
        $('#period').append('<option value="1d">1d</option>');
        $('#period').append('<option value="1w">1w</option>');
        $('#period').append('<option value="2w">2w</option>');
        $('#period').append('<option value="1m">1m</option>');
        $('.implied_price').css('display', 'none');
        interval = "hour";
    } else if ($(this).val() == "1d") {
        $('#period').append('<option value="1w">1w</option>');
        $('#period').append('<option value="1m">1m</option>');
        $('#period').append('<option value="6m">6m</option>');
        $('#period').append('<option value="1y">1y</option>');
        $('.implied_price').css('display', 'inline-block');
        interval = "day";
    }
    if (interval == 'minute') {
        startDate = "2018-05-25T00:00:00";
    } else if (interval == 'hour') {
        startDate = "2018-04-01T00:00:00";
    } else if (interval == 'day') {
        startDate = "2018-04-01T00:00:00";
    }
    var url = "https://dev.decryptz.com/api/v1/charts/dashboard?symbol=btc&interval=" + interval + "&startDate=" + startDate + "&endDate=" + endDate;

    d3.json(url, function(error, data) {
        $('#chart1').empty();
        // d3.json("api_data2.json",function(error,data){        
        data.forEach(function(d) {
            d.Date = Date.parse(d.Date);
            d.Low = +d.Low;
            d.High = +d.High;
            d.Open = +d.Open;
            d.Close = +d.Close;
            d.Volume = +d.Volume;
            d.PV = +d.PV;
            d.PS = +d.PS;
            d.NV = +d.NV;
            d.TV = +d.TV;
        })
        genRaw = data;
        ema12 = calcema(12, genRaw);
        ema26 = calcema(26, genRaw);
        mainjs();
    });
});