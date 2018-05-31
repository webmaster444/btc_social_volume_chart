var genRaw, genData;
var ema12, ema26 = [];
var startDate = "2018-04-01T00:00:00";
var endDate = "2018-05-27T00:00:00";
var period = "1w";
var endDomain = Date.parse(endDate);
var startDomain = Date.parse(startDate);
var timestampduration = 0;
var interval='hour';
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
    "minute": "%m %h %d",
    "hour": "%H %d"
};

var TCount = {
    "1w": 7,
    "1m": 30,
    "2w": 14,
    "1d": 24
}
changeDomain(period);
function changeDomain(period){
    if (period == "1w") {
        timestampduration = 1000 * 60 * 60 * 24 * 8;    
    }else if(period =='1m'){
        timestampduration = 1000 * 60 * 60 * 24 * 30;
    }else if (period =='2w'){
        timestampduration = 1000 * 60 * 60 * 24 * 14;
    }else if (period =='3m'){
        timestampduration = 1000 * 60 * 60 * 24 * 30 * 3;
    }else if(period == '6m'){
        timestampduration = 1000 * 60 * 60 * 24 * 30 * 6;
    }else if(period =='1y'){
        timestampduration = 1000 * 60 * 60 * 24 * 365;
    }
    startDomain = endDomain - timestampduration;
    return startDomain;
}
(function() {
    var url = "https://dev.decryptz.com/api/v1/charts/dashboard?symbol=btc&interval=day&startDate="+startDate+"&endDate="+endDate;
    d3.json(url, function(error, data) {        
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
      $('.linechart_wrapper').hide();
      var tmpClass = "."+$(this).val().toLowerCase() +".linechart_wrapper";
      $(tmpClass).show();
    });

}());


function mainjs() {
    genData = genRaw;
    displayAll();    
}

function displayAll() {    
    displayCS();
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
    $('#period').html('');
    $('#radioes2 label').removeClass('active');
    if ($(this).val() == '1m') {
        $('#period').append('<option value="1h">1h</option>');
        $('#period').append('<option value="3h" selected>3h</option>');
        $('#period').append('<option value="6h">6h</option>');
        $('#period').append('<option value="1d">1d</option>');
        $('.implied_price').css('display', 'none');
        interval = "minute";
    } else if ($(this).val() == "1h") {
        $('#period').append('<option value="1d">1d</option>');
        $('#period').append('<option value="1w" selected>1w</option>');
        $('#period').append('<option value="2w">2w</option>');
        $('#period').append('<option value="1m">1m</option>');
        $('.implied_price').css('display', 'none');
        interval = "hour";
    } else if ($(this).val() == "1d") {
        $('#period').append('<option value="1w">1w</option>');
        $('#period').append('<option value="1m" selected>1m</option>');
        $('#period').append('<option value="6m">6m</option>');
        $('#period').append('<option value="1y">1y</option>');
        $('.implied_price').css('display', 'inline-block');
        interval = "day";
    }
    $(this).parent().addClass('active');
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

document.getElementById('chart1').onwheel = function(){ return false; }