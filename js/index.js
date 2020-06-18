// globals

let period_dict = {}
period_dict['Y'] = 365*24*60*60 // seconds in a year
period_dict['M'] = 31*24*60*60 // seconds in a month
period_dict['W'] = 7*24*60*60 // seconds in a week
period_dict['D'] = 24*60*60 // seconds in a week
let resolution_dict = {}
resolution_dict['M']  = 1000*31*24*60*60 // ms in a month
resolution_dict['W']  = 1000*7*24*60*60 // ms in a week
resolution_dict['D']  = 1000*24*60*60 // ms in a week
resolution_dict['60'] = 60*1000 // ms in a week
resolution_dict['30'] = 30*1000 // ms in a week
resolution_dict['15'] = 15*1000 // ms in a week
resolution_dict['5']  = 5*1000 // ms in 5 seconds
resolution_dict['1']  = 1000 // ms in a second

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

let defaultSymbols = ['AAPL', 'AMZN', 'GOOG', 'MSFT']

function getAndStoreCandleData(symbol, symbol_id, layout_id, period, resolution) {
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
                createCandlestickChart(data, layout_id, symbol_id);
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
    $("#symbol"+layout_id+"-"+chart_id).html(symbol);
    chrome.storage.local.get(symbol, function(data) {
        if(typeof data[symbol] === "undefined"){
            getAndStoreCandleData(symbol, chart_id, layout_id, "Y", "D");
        }else{
            createCandlestickChart(data[symbol], layout_id, chart_id);
        }
    });
}

$(document).ready(function () {
    console.log("ready!");
    $(document).keyup(function(e) {
        if(e.keyCode==27){
            $(".sidebar").toggleClass("hidden");
            $(".main").toggleClass("hidden");
        }
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
    // for (let symbol of symbols) {
    //     chrome.storage.local.get(symbol, function(data) {
    //         if(typeof data[symbol] === "undefined"){
    //             getAndStoreCandleData(symbol, "Y", "D");
    //         }else{
    //             // console.log(data[symbol]);
    //         }
    //     });
    // }
    // Code with Flask server
    // $.ajax({
    //     url: "http://127.0.0.1:5000/_get_data/",
    //     type: "POST",
    //     data: { symbol: "AAPL", interval: "D", period: "Y" },
    //     success: function (resp) {
    //         plot(resp['data']);
    //     },
    //     error: function (e, s, t) {
    //         console.log("Error with _get_data");
    //     }
    // });
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