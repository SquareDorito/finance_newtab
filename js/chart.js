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

const movingAverage = (data, numberOfPricePoints) => {
    return data.map((row, index, total) => {
        const start = Math.max(0, index - numberOfPricePoints);
        const end = index;
        const subset = total.slice(start, end + 1);
        const sum = subset.reduce((a, b) => {
            return a + b['close'];
        }, 0);

        return {
            date: row['date'],
            average: sum / subset.length
        };
    });
};

// credits: https://brendansudol.com/writing/responsive-d3
const responsivefy = svg => {
    // get container + svg aspect ratio
    const container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style('width')),
        height = parseInt(svg.style('height')),
        aspect = width / height;

    // get width of container and resize svg to fit it
    const resize = () => {
        var targetWidth = parseInt(container.style('width'));
        svg.attr('width', targetWidth);
        svg.attr('height', Math.round(targetWidth / aspect));
    };

    // add viewBox and preserveAspectRatio properties,
    // and call resize so that svg resizes on inital page load
    svg
        .attr('viewBox', '0 0 ' + width + ' ' + height)
        .attr('perserveAspectRatio', 'xMinYMid')
        .call(resize);

    // to register multiple listeners for same event type,
    // you need to add namespace, i.e., 'click.foo'
    // necessary if you call invoke this function for multiple svgs
    // api docs: https://github.com/mbostock/d3/wiki/Selections#on
    d3.select(window).on('resize.' + container.attr('id'), resize);
};

const initialiseChart = data => {
    let light_grey = "#D3D3D3";
    let orange = "#FF8900";
    let blue = "#4682B4";
    data = data.filter(
        row => row['high'] && row['low'] && row['close'] && row['open']
    );

    thisYearStartDate = new Date(2018, 0, 1);

    // filter out data based on time period
    data = data.filter(row => {
        if (row['date']) {
            return row['date'] >= thisYearStartDate;
        }
    });

    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = window.innerWidth - margin.left - margin.right; // Use the window's width
    const height = window.innerHeight - margin.top - margin.bottom; // Use the window's height

    // find data range
    const xMin = d3.min(data, d => {
        return d['date'];
    });

    const xMax = d3.max(data, d => {
        return d['date'];
    });

    const yMin = d3.min(data, d => {
        return d['close'];
    });

    const yMax = d3.max(data, d => {
        return d['close'];
    });

    // scale using range
    const xScale = d3
        .scaleTime()
        .domain([xMin, xMax])
        .range([0, width]);

    const yScale = d3
        .scaleLinear()
        .domain([yMin - 5, yMax])
        .range([height, 0]);

    // add chart SVG to the page
    const svg = d3
        .select('#chart')
        .append('svg')
        .attr('width', width + margin['left'] + margin['right'])
        .attr('height', height + margin['top'] + margin['bottom'])
        .call(responsivefy)
        .append('g')
        .attr('transform', `translate(${margin['left']}, ${margin['top']})`);

    // create the axes component
    svg
        .append('g')
        .attr('id', 'xAxis')
        .attr('class', 'axis')
        .attr('transform', `translate(0, ${height})`)
        .style("font-size", "15px")
        .style("font-weight", "100")
        .call(d3.axisBottom(xScale));

    svg
        .append('g')
        .attr('id', 'yAxis')
        .attr('class', 'axis')
        .attr('transform', `translate(${width}, 0)`)
        .style("font-size", "15px")
        .style("font-weight", "100")
        .call(d3.axisRight(yScale));

    // renders close price line chart and moving average line chart

    // generates lines when called
    const line = d3
        .line()
        .x(d => {
            return xScale(d['date']);
        })
        .y(d => {
            return yScale(d['close']);
        });

    const movingAverageLine = d3
        .line()
        .x(d => {
            return xScale(d['date']);
        })
        .y(d => {
            return yScale(d['average']);
        })
        .curve(d3.curveBasis);

    const movingAverageLine2 = d3
        .line()
        .x(d => {
            return xScale(d['date']);
        })
        .y(d => {
            return yScale(d['average']);
        })
        .curve(d3.curveBasis);

    svg
        .append('path')
        .data([data]) // binds data to the line
        .style('fill', 'none')
        .attr('id', 'priceChart')
        .attr('stroke', light_grey)
        .attr('stroke-width', '1.5')
        .attr('d', line);

    // calculates simple moving average over 50 days
    const movingAverageData = movingAverage(data, 50);
    svg
        .append('path')
        .data([movingAverageData])
        .style('fill', 'none')
        .attr('id', 'movingAverageLine')
        .attr('stroke', orange)
        .attr('d', movingAverageLine);

    // calculates simple moving average over 50 days
    const movingAverageData2 = movingAverage(data, 25);
    svg
        .append('path')
        .data([movingAverageData2])
        .style('fill', 'none')
        .attr('id', 'movingAverageLine')
        .attr('stroke', blue)
        .attr('d', movingAverageLine2);

    // renders x and y crosshair
    const focus = svg
        .append('g')
        .attr('class', 'focus')
        .style('display', 'none');

    focus.append('line').classed('x', true);
    focus.append('line').classed('y', true);
    focus.append('circle')
        .attr('r', 4)
        .style('fill', '#c0392b');

    svg
        .append('rect')
        .attr('class', 'overlay')
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', () => focus.style('display', null))
        .on('mouseout', () => focus.style('display', 'none'))
        .on('mousemove', generateCrosshair);

    d3.select('.overlay').style('fill', 'none');
    d3.select('.overlay').style('pointer-events', 'all');

    d3.selectAll('.focus line').style('fill', 'none');
    d3.selectAll('.focus line').style('stroke', light_grey);
    d3.selectAll('.focus line').style('stroke-width', '1px');
    d3.selectAll('.focus line').style('stroke-dasharray', '3 3');

    var keys = ['Price', 'EMA-25', 'EMA-50']
    var colors = [light_grey, orange, blue]
    var size = 12;
    svg.selectAll('legendDots')
        .data(keys)
        .enter()
        .append("rect")
            .attr("width", size)
            .attr("height", size)
            .style("fill", function(_, i){ return colors[i]})
        .attr('transform', (_, i) => {
            return `translate(0, ${i * 20})`;
        });
    svg.selectAll("legendLabels")
        .data(keys)
        .enter()
        .append("text")
            .style("fill", function(_,i){ return colors[i]})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
        .attr('transform', (_, i) => {
            return `translate(20, ${8+(i * 20)})`;
        });

    //returs insertion point
    const bisectDate = d3.bisector(d => d.date).left;

    /* mouseover function to generate crosshair */
    function generateCrosshair() {
        //returns corresponding value from the domain
        const correspondingDate = xScale.invert(d3.mouse(this)[0]);
        //gets insertion point
        const i = bisectDate(data, correspondingDate, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        const currentPoint =
            correspondingDate - d0['date'] > d1['date'] - correspondingDate ? d1 : d0;
        focus.attr(
            'transform',
            `translate(${xScale(currentPoint['date'])}, ${yScale(
                currentPoint['close']
            )})`
        );

        focus
            .select('line.x')
            .attr('x1', 0)
            .attr('x2', width - xScale(currentPoint['date']))
            .attr('y1', 0)
            .attr('y2', 0);

        focus
            .select('line.y')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', height - yScale(currentPoint['close']));

        // updates the legend to display the date, open, close, high, low, and volume of the selected mouseover area
        updateLegends(currentPoint);
    }
    
    /* Legends */
    const updateLegends = currentData => {
        d3.selectAll('.lineLegend').remove();

        const legendKeys = Object.keys(data[0]);
        const lineLegend = svg
            .selectAll('.lineLegend')
            .data(legendKeys)
            .enter()
            .append('g')
            .attr('class', 'lineLegend')
            .attr('transform', (d, i) => {
                return `translate(0, ${i * 20})`;
            });
        lineLegend
            .append('text')
            .text(d => {
                if (d === 'date') {
                    return `${d}: ${currentData[d].toLocaleDateString()}`;
                } else if (
                    d === 'high' ||
                    d === 'low' ||
                    d === 'open' ||
                    d === 'close'
                ) {
                    return `${d}: ${currentData[d].toFixed(2)}`;
                } else {
                    return `${d}: ${currentData[d]}`;
                }
            })
            .style('fill', light_grey)
            .attr('transform', 'translate(0,100)'); //align texts with boxes
    };

    /* Volume series bars */
    const volData = data.filter(d => d['volume'] !== null && d['volume'] !== 0);

    const yMinVolume = d3.min(volData, d => {
        return Math.min(d['volume']);
    });

    const yMaxVolume = d3.max(volData, d => {
        return Math.max(d['volume']);
    });

    const yVolumeScale = d3
        .scaleLinear()
        .domain([yMinVolume, yMaxVolume])
        .range([height, height * (3 / 4)]);

    svg
        .selectAll()
        .data(volData)
        .enter()
        .append('rect')
        .attr('x', d => {
            return xScale(d['date']);
        })
        .attr('y', d => {
            return yVolumeScale(d['volume']);
        })
        .attr('class', 'vol')
        .attr('fill', (d, i) => {
            if (i === 0) {
                return '#03a678';
            } else {
                return volData[i - 1].close > d.close ? '#c0392b' : '#03a678'; // green bar if price is rising during that period, and red when price  is falling
            }
        })
        .attr('width', 1)
        .attr('height', d => {
            return height - yVolumeScale(d['volume']);
        });
    // testing axis for volume
    /*
    svg.append('g').call(d3.axisLeft(yVolumeScale));
    */
};