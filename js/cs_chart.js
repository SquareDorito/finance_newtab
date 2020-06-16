const createCandlestickChart = data => {
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
        return d['low'];
    });

    const yMax = d3.max(data, d => {
        return d['high'];
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
        .style('stroke', primary_color)
        .style('color', primary_color)
        .call(d3.axisBottom(xScale));

    svg
        .append('g')
        .attr('id', 'yAxis')
        .attr('class', 'axis')
        .attr('transform', `translate(${width}, 0)`)
        .style("font-size", "15px")
        .style("font-weight", "100")
        .style('stroke', primary_color)
        .style('color', primary_color)
        .call(d3.axisRight(yScale));

    // renders close price line chart and moving average line chart
    let xBand = d3.scaleBand().domain(d3.range(-1, data.length)).range([0, width]).padding(0.3)
    svg
        .selectAll()
        .data(data)
        .enter()
        .append("rect")
        .attr('x', d => xScale(d.date) - xBand.bandwidth())
        .attr("class", "candle")
        .attr('y', d => yScale(Math.max(d.open, d.close)))
        .attr('width', xBand.bandwidth())
        .attr('height', d => (d.open === d.close) ? 1 : yScale(Math.min(d.open, d.close))-yScale(Math.max(d.open, d.close)))
        .attr("fill", d => (d.open === d.close) ? "silver" : (d.open > d.close) ? red : green)
		
    // draw high and low
    svg
        .selectAll()
        .data(data)
        .enter()
        .append("line")
        .attr("class", "stem")
        .attr("x1", d => xScale(d.date) - xBand.bandwidth()/2)
        .attr("x2", d => xScale(d.date) - xBand.bandwidth()/2)
        .attr("y1", d => yScale(d.high))
        .attr("y2", d => yScale(d.low))
        .attr("stroke", d => (d.open === d.close) ? "white" : (d.open > d.close) ? red : green);

    var keys = ['Price', 'EMA-25', 'EMA-50']
    var colors = [primary_color, orange, blue]
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
            .style('fill', primary_color)
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
        .attr('x', d => xScale(d.date) - xBand.bandwidth())
        .attr('y', d => {
            return yVolumeScale(d['volume']);
        })
        .attr('class', 'vol')
        .attr('fill', (d, i) => {
            if (i === 0) {
                return '#03a678';
            } else {
                return light_grey;
                // return volData[i - 1].close > d.close ? '#c0392b' : '#03a678'; // green bar if price is rising during that period, and red when price  is falling
            }
        })
        .attr('width', xBand.bandwidth()*0.8)
        .attr('height', d => {
            return height - yVolumeScale(d['volume']);
        });
    // testing axis for volume
    /*
    svg.append('g').call(d3.axisLeft(yVolumeScale));
    */
};