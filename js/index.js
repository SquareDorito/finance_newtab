let period_dict = {}
period_dict['Y'] = 365*24*60*60 // seconds in a year
period_dict['M'] = 31*24*60*60 // seconds in a month
period_dict['W'] = 7*24*60*60 // seconds in a week
period_dict['D'] = 24*60*60 // seconds in a week

let light_grey = "#D3D3D3";
let dark_grey = "#373737";
let grey = "#6f6f6f";
let almost_black = "#060D13";
let orange = "#FF8900";
let blue = "#4682B4";
let red = '#c0392b';
let green = '#03a678';
let primary_color = grey;

$(document).ready(function () {
    console.log("ready!");
    let period = 'Y'
    let now = new Date().getTime() / 1000 | 0;
    let old = now - period_dict[period];
    let dark_mode = false;
    if(dark_mode){
        primary_color = light_grey;
    }
    // Raw JS
    let url = "https://finnhub.io/api/v1/stock/candle?symbol=AAPL&resolution=D&from="+old.toString()+"&to="+now.toString()+"&token=brhub4vrh5r807v5kllg";
    $.ajax({
        url: url,
        type: "GET",
        data: { symbol: "AAPL", interval: "D", period: period },
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