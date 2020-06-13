$(document).ready(function () {
    console.log("ready!");
    let now = new Date().getTime() / 1000 | 0;
    let year_ago = now - 31556952
    console.log(now)
    console.log(year_ago)

    $.ajax({
        url: "http://127.0.0.1:5000/_get_data/",
        type: "POST",
        data: { symbol: "AAPL", interval: "D", period: "Y" },
        success: function (resp) {
            plot(resp['data']);
        },
        error: function (e, s, t) {
            console.log("Error with _get_data");
        }
    });
});

var light_grey = "#f7f7f7"
var dark_grey = "#292929"
var my_red = "#ad1a1a"
var my_green = "#1e752e"

function plot(data) {
    let dates = new Array(data['t'].length)
    for(var i=0;i<data['t'].length;i++){
        let temp = new Date(data['t'][i]*1000)
        dates[i] = temp.getFullYear()+"-"+(temp.getMonth()+1)+"-"+temp.getDate()+" "+temp.toLocaleTimeString('it-IT');
    }
    console.log(dates)
    let trace = {
        x: dates,
        close: data['c'],
        high: data['h'],
        low: data['l'],
        open: data['o'],

        // cutomise colors
        increasing: { line: { color: my_green} },
        decreasing: { line: { color: my_red } },

        type: 'candlestick',
        xaxis: 'x',
        yaxis: 'y'
    };
    let plot_data = [trace]
    var layout = {
        showlegend: false,
        xaxis: {
            autorange: true,
            rangeslider: {visible: false},
            color: light_grey
        },
        yaxis: {
            autorange: "visible",
            color: light_grey
        },
        plot_bgcolor:"#060D13",
        paper_bgcolor:"#060D13",
        font: {family: 'Source Sans Pro, sans-serif', size: 12, color: light_grey},
        margin: {l: 40, r: 40, t: 40, b:40, pad: 0, autoexpand: false},
        title: {text: 'AAPL', yref: "paper", y: 1, yanchor: "bottom"},
        titlefont: {size: 20},
        hoverlabel: {bgcolor: dark_grey, bordercolor: dark_grey, font: {family: 'Source Sans Pro, sans-serif', size: 10, color: light_grey}},
        autosize: true,
    };
    var config = {
        responsive: true,
        displayModeBar: false
    }
    // new_plot = document.getElementById('plot_div');
    Plotly.newPlot("plot-top-left", plot_data, layout, config);
    // Plotly.newPlot("plot-top-right", plot_data, layout);
    // Plotly.newPlot("plot-bottom-left", plot_data, layout);
    // Plotly.newPlot("plot-bottom-right", plot_data, layout);
}