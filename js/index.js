// globals

let interval_dict = {}
interval_dict['1Y'] = 365*24*60*60 // seconds in a year
interval_dict['1M'] = 31*24*60*60 // seconds in a month
interval_dict['1W'] = 7*24*60*60 // seconds in a week
interval_dict['1D'] = 24*60*60 // seconds in a week

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
        strings.push('<div class="loader-container hidden" id="loader'+me+'"><div class="loader"></div></div>');
        // container
        strings.push('<div class="container" id="container'+me+'">');
        // topbar generation
        strings.push('<div class="topbar '+layout_size_dict[layout_id][i]+'">');
        strings.push('<div class="control">');
        strings.push('<input type="text" class="symbol" id="'+me+'" value="" maxlength="4"/>');
        strings.push('<div class="spacer"></div>');
        strings.push('<div class="button-group" id="'+me+'">');
        strings.push('<div class="label">Interval:</div>');
        strings.push('<a class="button interval" id="interval1D-'+me+'" href="#">1D</a>');
        strings.push('<a class="button interval" id="interval1W-'+me+'" href="#">1W</a>');
        strings.push('<a class="button interval" id="interval1M-'+me+'" href="#">1M</a>');
        strings.push('<a class="button interval" id="interval1Y-'+me+'" href="#">1Y</a>');
        strings.push('</div>'); // button-group
        strings.push('<div class="spacer"></div>');
        strings.push('<div class="button-group" id="'+me+'">');
        strings.push('<div class="label">Resolution:</div>');
        strings.push('<a class="button resolution" id="resolution1-'+me+'" href="#">1</a>');
        strings.push('<a class="button resolution" id="resolution5-'+me+'" href="#">5</a>');
        strings.push('<a class="button resolution" id="resolution30-'+me+'" href="#">30</a>');
        strings.push('<a class="button resolution" id="resolution60-'+me+'" href="#">60</a>');
        strings.push('<a class="button resolution" id="resolutionD-'+me+'" href="#">D</a>');
        strings.push('</div>'); // button-group
        strings.push('<div class="spacer"></div>');
        strings.push('<div class="button-group" id="'+me+'">');
        strings.push('<div class="label">Type:</div>');
        strings.push('<a class="button chart-type" id="Candle'+me+'" href="#">Candle</a>');
        strings.push('<a class="button chart-type" id="Line'+me+'" href="#">Line</a>');
        strings.push('</div>'); // button-group
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

$(document).ready(function () {
    console.log("ready!");
    // generate HTML for the layouts
    for(var i=0; i<numLayouts; i++){
        generateLayoutHTML(i);
    }
    // pressing esc toggles menu
    $(document).keyup(function(e) {
        if(e.keyCode==27){
            $(".sidebar").toggleClass("hidden");
            $(".main").toggleClass("hidden");
        }
    });
    // change symbol of chart
    $('.symbol').on('keypress', function (e) {
        if (e.which === 13) {
            //Disable textbox to prevent multiple submit
            $(this).attr("disabled", "disabled");
            // $(this).val()
            var identity = $(this).attr('id');
            $('#chart' + identity).empty();
            $('#loader' + identity).removeClass('hidden');
            var currSymbol = $(this).val();
            var layout_id = identity.split("-")[0]
            var chart_id = identity.split("-")[1]

            chrome.storage.local.get(identity, function (data) {
                if (typeof data[identity] === "undefined") {
                    // this shouldn't happen
                    currSymbol = defaultSymbols[i];
                    var data_dict = {}
                    data_dict[identity] = {
                        symbol: currSymbol,
                        chart_type: "Candle",
                        resolution: "D",
                        interval: "1Y"
                    }
                    chrome.storage.local.set(data_dict, function () {
                        handleChart(data_dict[identity], layout_id, chart_id);
                    });
                } else {
                    data[identity]["symbol"] = currSymbol;
                    chrome.storage.local.set(data, function () {
                        handleChart(data[identity], layout_id, chart_id);
                    });
                }
            });
            $(this).removeAttr("disabled");
        }
    });
    // change candle/line chart type on click
    $(".chart-type").click(function(e) {
        if($(this).hasClass('active')){
            return;
        }
        var new_type = $(this).html();
        var identity = $(this).parent().attr('id');
        $('#chart' + identity).empty();
        $('#loader' + identity).removeClass('hidden');
        var layout_id = identity.split("-")[0];
        var chart_id = identity.split("-")[1];

        chrome.storage.local.get(identity, function (data) {
            if (typeof data[identity] === "undefined") {
                // this shouldn't happen
                currSymbol = defaultSymbols[i];
                var data_dict = {}
                data_dict[identity] = {
                    symbol: currSymbol,
                    chart_type: new_type,
                    resolution: "D",
                    interval: "1Y"
                }
                chrome.storage.local.set(data_dict, function () {
                    handleChart(data_dict[identity], layout_id, chart_id);
                });
            } else {
                data[identity]["chart_type"] = new_type;
                chrome.storage.local.set(data, function () {
                    handleChart(data[identity], layout_id, chart_id);
                });
            }
        });
    });
    // change layout on menu button press
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
    // change interval on button press
    $(".button.interval").click(function(e) {
        if(!$(this).hasClass("active")){
            var new_interval = $(this).html();
            var identity = $(this).parent().attr('id');
            $('#chart' + identity).empty();
            $('#loader' + identity).removeClass('hidden');
            var layout_id = identity.split("-")[0];
            var chart_id = identity.split("-")[1];
            chrome.storage.local.get(identity, function (data) {
                if (typeof data[identity] === "undefined") {
                    // this shouldn't happen
                    currSymbol = defaultSymbols[i];
                    var data_dict = {}
                    data_dict[identity] = {
                        symbol: currSymbol,
                        chart_type: "Candle",
                        resolution: "D",
                        interval: new_interval
                    }
                    chrome.storage.local.set(data_dict, function () {
                        handleChart(data_dict[identity], layout_id, chart_id);
                    });
                } else {
                    data[identity]["interval"] = new_interval;
                    chrome.storage.local.set(data, function () {
                        handleChart(data[identity], layout_id, chart_id);
                    });
                }
            });

        }
    });

    // change interval on button press
    $(".button.resolution").click(function(e) {
        if(!$(this).hasClass("active")){
            var new_res = $(this).html();
            var identity = $(this).parent().attr('id');
            $('#chart' + identity).empty();
            $('#loader' + identity).removeClass('hidden');
            var layout_id = identity.split("-")[0];
            var chart_id = identity.split("-")[1];
            chrome.storage.local.get(identity, function (data) {
                if (typeof data[identity] === "undefined") {
                    // this shouldn't happen
                    currSymbol = defaultSymbols[i];
                    var data_dict = {}
                    data_dict[identity] = {
                        symbol: currSymbol,
                        chart_type: "Candle",
                        resolution: new_res,
                        interval: "1Y"
                    }
                    chrome.storage.local.set(data_dict, function () {
                        handleChart(data_dict[identity], layout_id, chart_id);
                    });
                } else {
                    data[identity]["resolution"] = new_res;
                    chrome.storage.local.set(data, function () {
                        handleChart(data[identity], layout_id, chart_id);
                    });
                }
            });

        }
    });
    
    // generate charts in layout
    chrome.storage.local.get("layout", function (data) {
        if (typeof data["layout"] === "undefined") {
            chrome.storage.local.set({ layout: 0 }, function () {
                handleLayout(0);
            });
        } else {
            handleLayout(data["layout"]);
        }
    });
});

function handleLayout(layout) {
    // toggle current layout here
    // setup layout buttons
    $("#layout" + layout).toggleClass("hidden");
    $(".layout-options .button#"+layout).toggleClass("active");
    // now get current symbols and plot
    for (let i = 0; i < layoutSymbolNum[layout]; i++) {
        let identity = layout+"-"+i;
        $('#chart' + identity).empty();
        $('#loader' + identity).removeClass('hidden');
        chrome.storage.local.get(identity, function (data) {
            if (typeof data[identity] === "undefined") {
                var currSymbol = defaultSymbols[i];
                var data_dict = {}
                data_dict[identity] = {
                    symbol: currSymbol,
                    chart_type: "Candle",
                    resolution: "D",
                    interval: "1Y"
                }
                chrome.storage.local.set(data_dict, function () {
                    handleChart(data_dict[identity], layout, i);
                });
            } else {
                handleChart(data[identity], layout, i);
            }
        });
    }   
}

function handleChart(data_dict, layout_id, chart_id) {
    var symbol = data_dict["symbol"]
    var res = data_dict["resolution"]
    $(".symbol#"+layout_id+"-"+chart_id).val(symbol);
    chrome.storage.local.get(symbol+"-"+res, function(data) {
        if(typeof data[symbol+"-"+res] === "undefined"){
            // get and store data with resolution
            getAndStoreData(data_dict, layout_id, chart_id);
        } else {
            var tick_data = data[symbol+"-"+res]["data"];
            var time_since = (new Date().getTime()) - data[symbol+'-'+res]["last_time"];
            var cutoff = Math.max(resolution_dict[res], resolution_dict['60']);
            if(time_since>=cutoff){
                // over a miniute ago, 
                getAndStoreData(data_dict, layout_id, chart_id);
            } else {
                createChart(tick_data, data_dict, layout_id, chart_id);
            }
        }
    });
}

function getAndStoreData(data_dict, layout_id, symbol_id) {
    console.log("refreshing data");
    var symbol = data_dict["symbol"]
    var resolution = data_dict["resolution"]
    let now = new Date().getTime() / 1000 | 0;
    let old = now - interval_dict["1Y"];
    let url = "https://finnhub.io/api/v1/stock/candle?symbol="+symbol+"&resolution=" + resolution + "&from=" + old.toString() + "&to=" + now.toString() + "&token=brhub4vrh5r807v5kllg";
    $.ajax({
        url: url,
        type: "GET",
        success: function (resp) {
            data = reformatData(resp);
            var to_store = {}
            var last_time = new Date().getTime(); 
            to_store[symbol+"-"+resolution] = {
                data: data,
                last_time: last_time
            }
            chrome.storage.local.set(to_store, function () {
                createChart(data, data_dict, layout_id, symbol_id);
            });
        },
        error: function (e, s, t) {
            console.log("Error with _get_data");
            // if unable to get data, use old data
            chrome.storage.local.get(symbol+"-"+resolution, function(tick_data) {
                createChart(tick_data[symbol+"-"+resolution]["data"], data_dict, layout_id, symbol_id);
            });
        }
    });
}

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

function createChart(data, data_dict, layout_id, chart_id) {
    var type = data_dict["chart_type"]
    var interval = data_dict["interval"]
    var resolution = data_dict["resolution"]
    var identity = layout_id+"-"+chart_id;
    // adding active to chart_type
    for(let chart_type of chart_types){
        $('#'+chart_type+identity).removeClass('active');
    }
    $('#'+type+identity).addClass('active');
    // adding active to interval
    for(let ival in interval_dict){
        $('#interval'+ival+'-'+identity).removeClass('active');
    }
    $('#interval'+interval+'-'+identity).addClass('active');
    // adding active to resolution
    for(let rval in resolution_dict){
        $('#resolution'+rval+'-'+identity).removeClass('active');
    }
    $('#resolution'+resolution+'-'+identity).addClass('active');
    data = data.map(function (d) {
        d.date = new Date(d.date * 1000);
        return d;
    });
    var last_time = data[data.length-1]['date']
    data = data.filter(d => last_time-d['date']<=1000*interval_dict[interval]);
    if(type=="Candle"){
        createCandlestickChart(data, layout_id, chart_id, resolution);
    }else if(type=="Line"){
        createLineChart(data, layout_id, chart_id, resolution);
    }
    $('#loader'+identity).addClass('hidden');
}