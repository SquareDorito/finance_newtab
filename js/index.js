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
let period = 'Y'
let now = new Date().getTime() / 1000 | 0;
let old = now - period_dict[period];
let resolution = 'D'
let dark_mode = false;
if(dark_mode){
    primary_color = light_grey;
}

$(document).ready(function () {
    console.log("ready!");
    $(document).keyup(function(e) {
        if(e.keyCode==27){
            console.log("escape!");
            $(".sidebar").toggleClass("hidden");
            $(".main").toggleClass("hidden");
        }
    });
    // Raw JS
    let url = "https://finnhub.io/api/v1/stock/candle?symbol=AAPL&resolution="+resolution+"&from="+old.toString()+"&to="+now.toString()+"&token=brhub4vrh5r807v5kllg";
    $.ajax({
        url: url,
        type: "GET",
        data: { symbol: "AAPL", resolution: "D", period: period },
        success: function (resp) {
            // createLineChart(reformatData(resp), dark_mode);
            createCandlestickChart(reformatData(resp));
        },
        error: function (e, s, t) {
            console.log("Error with _get_data");
        }
    });
    
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
            date: new Date(data['t'][i] * 1000),
            high: data['h'][i],
            low: data['l'][i],
            open: data['o'][i],
            close: data['c'][i],
            volume: data['v'][i]
        }
    }
    return new_data
}