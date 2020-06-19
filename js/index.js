// globals

let period_dict = {}
period_dict['1Y'] = 365*24*60*60 // seconds in a year
period_dict['1M'] = 31*24*60*60 // seconds in a month
period_dict['1W'] = 7*24*60*60 // seconds in a week
period_dict['1D'] = 24*60*60 // seconds in a week

let resolution_dict = {}
resolution_dict['M']  = 1000*31*24*60*60 // ms in a month
resolution_dict['W']  = 1000*7*24*60*60 // ms in a week
resolution_dict['D']  = 1000*24*60*60 // ms in a week
resolution_dict['60'] = 60*1000 // ms in a week
resolution_dict['30'] = 30*1000 // ms in a week
resolution_dict['15'] = 15*1000 // ms in a week
resolution_dict['5']  = 5*1000 // ms in 5 seconds
resolution_dict['1']  = 1000 // ms in a second

let margin_dict = {}
margin_dict[0] = { top: 40, right: 25, bottom: 40, left: 45 }
margin_dict[1] = { top: 50, right: 25, bottom: 40, left: 55 }

let light_grey = "#D3D3D3";
let dark_grey = "#373737";
let grey = "#6f6f6f";
let almost_black = "#060D13";
let orange = "#FF8900";
let blue = "#4682B4";
let red = '#c0392b';
let green = '#03a678';
let medium_grey= "#a5a5a5";
let primary_color = grey;
let dark_mode = false;
if(dark_mode){
    primary_color = light_grey;
}
let numLayouts = 2;
let layoutSymbolNum = [1, 4]
let global_resolution = 'D';
let chart_types = ['Candle', 'Line']

let layout_dict = {};
layout_dict[1] = ['quadrant top-left', 'quadrant top-right', 'quadrant bottom-left', 'quadrant bottom-right'];
let layout_size_dict = {};
layout_size_dict[0] = ['']
layout_size_dict[1] = ['small', 'small', 'small', 'small']

function generateLayoutHTML(layout_id){
    var strings = ['<div class="layout hidden" id="layout'+layout_id+'">']
    for(let i=0; i<layoutSymbolNum[layout_id]; i++){
        me = layout_id+"-"+i;
        if(layout_id in layout_dict){
            strings.push('<div class="'+layout_dict[layout_id][i]+'">');
        }
        // container
        strings.push('<div class="container" id="container'+me+'">');
        // topbar generation
        strings.push('<div class="topbar '+layout_size_dict[layout_id][i]+'">');
        strings.push('<div class="control">');
        strings.push('<input type="text" class="symbol" id="'+me+'" value="" maxlength="4"/>');
        strings.push('<div class="spacer"></div>');
        strings.push('<div class="label">Interval:</div>');
        strings.push('<a class="button active" href="#">1Y</a>');
        strings.push('<a class="button" href="#">1M</a>');
        strings.push('<a class="button" href="#">1W</a>');
        strings.push('<a class="button" href="#">1D</a>');
        strings.push('<div class="spacer"></div>');
        strings.push('<div class="label">Resolution:</div>');
        strings.push('<a class="button" href="#">1</a>');
        strings.push('<a class="button" href="#">5</a>');
        strings.push('<a class="button" href="#">30</a>');
        strings.push('<a class="button" href="#">60</a>');
        strings.push('<a class="button active" href="#">D</a>');
        strings.push('<div class="chart-type-group" id="'+me+'">');
        strings.push('<div class="spacer"></div>');
        strings.push('<div class="label">Type:</div>');
        strings.push('<a class="chart-type button" id="Candle'+me+'" href="#">Candle</a>');
        strings.push('<a class="chart-type button" id="Line'+me+'" href="#">Line</a>');
        strings.push('</div>'); // chart-type-group
        strings.push('</div>'); // control
        strings.push('<div class="stats">');
        strings.push('<div id="date-label" class="label">&nbsp;</div>');
        strings.push('<div id="o-label" class="label">O:</div>');
        strings.push('<div id="h-label" class="label">H:</div>');
        strings.push('<div id="l-label" class="label">L:</div>');
        strings.push('<div id="c-label" class="label">C:</div>');
        strings.push('</div>'); // stats
        strings.push('</div>'); // toolbar
        strings.push('<div class="chart" id="chart'+me+'"></div>');
        strings.push('</div>'); // container
        if(layout_id in layout_dict){
            strings.push('</div>'); // quadrant
        }
    }
    strings.push('</div>'); // layout
    var html = strings.join("\n");
    $('.main').append(html);
}


let defaultSymbols = ['AAPL', 'AMZN', 'GOOG', 'MSFT']

function getAndStoreData(symbol, symbol_id, layout_id, period, resolution) {
    let now = new Date().getTime() / 1000 | 0;
    let old = now - period_dict[period];
    let url = "https://finnhub.io/api/v1/stock/candle?symbol="+symbol+"&resolution=" + resolution + "&from=" + old.toString() + "&to=" + now.toString() + "&token=brhub4vrh5r807v5kllg";
    $.ajax({
        url: url,
        type: "GET",
        success: function (resp) {
            data = reformatData(resp);
            var data_dict = {}
            data_dict[symbol] = data
            chrome.storage.local.set(data_dict, function () {
                createChart(data, layout_id, symbol_id, "candle");
            });
        },
        error: function (e, s, t) {
            console.log("Error with _get_data");
        }
    });
}

function handleLayout(layout) {
    // toggle current layout here
    // setup layout buttons
    $("#layout" + layout).toggleClass("hidden");
    $(".layout-options .button#"+layout).toggleClass("active");
    // now get current symbols and plot
    for (let i = 0; i < layoutSymbolNum[layout]; i++) {
        chrome.storage.local.get("symbol" + i, function (data) {
            if (typeof data["symbol" + i] === "undefined") {
                var currSymbol = defaultSymbols[i];
                var data_dict = {}
                data_dict["symbol" + i] = currSymbol
                chrome.storage.local.set(data_dict, function () {
                    handleChart(currSymbol, layout, i);
                });
            } else {
                var currSymbol = data["symbol" + i];
                handleChart(currSymbol, layout, i);
            }
        });
    }
}

function handleChart(symbol, layout_id, chart_id) {
    $(".symbol#"+layout_id+"-"+chart_id).val(symbol);
    chrome.storage.local.get(symbol, function(data) {
        if(typeof data[symbol] === "undefined"){
            getAndStoreData(symbol, chart_id, layout_id, "1Y", "D");
        }else{
            chrome.storage.local.get("chart-type"+chart_id, function(data2) {
                chart_type = data2["chart-type"+chart_id]
                if(typeof  chart_type=== "undefined"){
                    var data_dict = {}
                    data_dict["chart-type" + chart_id] = "Candle"
                    chrome.storage.local.set(data_dict, function () {
                        createChart(data[symbol], layout_id, chart_id, "Candle");
                    });
                } else {
                    createChart(data[symbol], layout_id, chart_id, chart_type);
                }
            });
        }
    });
}

$(document).ready(function () {
    console.log("ready!");
    for(var i=0; i<numLayouts; i++){
        generateLayoutHTML(i);
    }
    $(document).keyup(function(e) {
        if(e.keyCode==27){
            $(".sidebar").toggleClass("hidden");
            $(".main").toggleClass("hidden");
        }
    });
    $('.symbol').on('keypress', function (e) {
        if (e.which === 13) {
            //Disable textbox to prevent multiple submit
            $(this).attr("disabled", "disabled");
            // $(this).val()
            var identity = $(this).attr('id').split("-");
            layout_id = identity[0];
            chart_id = identity[1];
            var currSymbol = $(this).val();
            var data_dict = {}
            data_dict["symbol" + chart_id] = currSymbol
            chrome.storage.local.set(data_dict, function () {
                handleChart(currSymbol, layout_id, chart_id);
            });
            //Enable the textbox again if needed.
            $(this).removeAttr("disabled");
        }
    });
    $(".chart-type").click(function(e) {
        if($(this).hasClass('active')){
            return;
        }
        var new_type = $(this).html();
        var data_dict = {}
        var identity = $(this).parent().attr('id');
        var layout_id = identity.split("-")[0];
        var chart_id = identity.split("-")[1];
        data_dict["chart-type" + chart_id] = new_type;
        chrome.storage.local.set(data_dict, function () {
            chrome.storage.local.get("symbol" + chart_id, function (data) {
                handleChart(data["symbol"+chart_id], layout_id, chart_id, new_type);
            });
        }); 
    });
    // Raw JS
    chrome.storage.local.get("layout", function (data) {
        if (typeof data["layout"] === "undefined") {
            chrome.storage.local.set({ layout: 0 }, function () {
                handleLayout(0);
            });
        } else {
            handleLayout(data["layout"]);
        }
    });

    $(".layout-options .button").click(function(e) {
        if(!$(this).hasClass("active")){
            for(var i=0;i<numLayouts;i++){
                // remove active from other buttons
                if($(".layout-options .button#"+i).hasClass("active")){
                    $(".layout-options .button#"+i).toggleClass("active");
                    $("#layout" + i).toggleClass("hidden");
                }
            }
            // now switch the layout
            new_layout = parseInt(e.target.id);
            chrome.storage.local.set({ layout: new_layout}, function () {
                handleLayout(new_layout);
            });
        }
    });
});

function reformatData(data) {
    let len = data['c'].length;
    let new_data = new Array(len);
    for (var i = 0; i < len; i++) {
        new_data[i] = {
            date: data['t'][i],
            high: data['h'][i],
            low: data['l'][i],
            open: data['o'][i],
            close: data['c'][i],
            volume: data['v'][i]
        }
    }
    return new_data
}

function createChart(data, layout_id, chart_id, type) {
    var identity = layout_id+"-"+chart_id;
    for(let chart_type of chart_types){
        $('#'+chart_type+identity).removeClass('active');
    }
    $('#'+type+layout_id+"-"+chart_id).addClass('active');
    data = data.map(function (d) {
        d.date = new Date(d.date * 1000);
        return d;
    });
    if(type=="Candle"){
        createCandlestickChart(data, layout_id, chart_id);
    }else if(type=="Line"){
        createLineChart(data, layout_id, chart_id);
    }
}