function createLineChart(line_data, layout_id, chart_id) {

    identity = layout_id + "-" + chart_id;

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

    const lineChart = data => {
        const margin = margin_dict[layout_id];
        const width = window.innerWidth - margin.left - margin.right; // Use the window's width
        const height = window.innerHeight - margin.top - margin.bottom; // Use the window's height

        // find data range
        let xMin = d3.min(data, d => {
            return d['date'];
        });

        let xMax = d3.max(data, d => {
            return d['date'];
        });

        const yMin = d3.min(data, d => {
            return d['close'];
        });

        const yMax = d3.max(data, d => {
            return d['close'];
        });

        xMin = new Date(xMin - resolution_dict[global_resolution]);
        xMax = new Date(xMax + resolution_dict[global_resolution]);
        // scale using range
        const xScale = d3
            .scaleTime()
            .domain([xMin, xMax])
            .range([0, width]);

        const yScale = d3
            .scaleLinear()
            .domain([yMin - 5, yMax])
            .range([height, 0]);

        $('#chart' + identity).empty();
        // add chart SVG to the page
        const svg = d3
            .select('#chart' + identity)
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
            .style("font-weight", "100")
            .style('color', primary_color)
            .call(d3.axisBottom(xScale));

        svg
            .append('g')
            .attr('id', 'yAxis')
            .attr('class', 'axis')
            .style("font-weight", "100")
            .style('color', primary_color)
            .call(d3.axisLeft(yScale).ticks(Math.floor(height / 50)));

        svg
            .append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(yScale)
                .tickSize(-width, 0, 0)
                .tickFormat("")
            )
        // volume bars
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

        let xBand = d3.scaleBand().domain(d3.range(-1, data.length)).range([0, width]).padding(0.3)
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
                    return volData[i - 1].close > d.close ? red : green; // green bar if price is rising during that period, and red when price  is falling
                }
            })
            .attr('width', xBand.bandwidth())
            .attr('height', d => {
                return height - yVolumeScale(d['volume']);
            });


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
            .attr('stroke', primary_color)
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

        let this_container = d3.select("#container" + identity);

        svg
            .append('rect')
            .attr('class', 'overlay')
            .attr('width', width)
            .attr('height', height)
            .on('mouseover', () => focus.style('display', null))
            .on('mouseout', () => focus.style('display', 'none'))
            .on('mousemove', generateCrosshair);
        
        this_container.select('.overlay').style('fill', 'none');
        this_container.select('.overlay').style('pointer-events', 'all');

        this_container.selectAll('.focus line').style('fill', 'none');
        this_container.selectAll('.focus line').style('stroke', primary_color);
        this_container.selectAll('.focus line').style('stroke-width', '1px');
        this_container.selectAll('.focus line').style('stroke-dasharray', '3 3');

        var keys = ['Price', 'EMA-25', 'EMA-50']
        var colors = [primary_color, orange, blue]
        var size = 12;
        var yShift = 20;
        var xShift = 30;
        svg.selectAll('legendDots')
            .data(keys)
            .enter()
            .append("rect")
            .attr("width", size)
            .attr("height", size)
            .style("fill", function (_, i) { return colors[i] })
            .attr('transform', (_, i) => {
                return `translate(${xShift}, ${yShift + i * 20})`;
            });
        svg.selectAll("legendLabels")
            .data(keys)
            .enter()
            .append("text")
            .style("fill", function (_, i) { return colors[i] })
            .text(function (d) { return d })
            .attr("text-anchor", "left")
            .attr("class", "legend-text")
            .style("alignment-baseline", "middle")
            .attr('transform', (_, i) => {
                return `translate(${20+xShift}, ${8 + yShift + (i * 20)})`;
            });

        function updateData(data_point) {
            this_container.select("#date-label").html(shortenedDateString(data_point.date))
            this_container.select("#o-label").html("O: " + data_point.open.toFixed(2));
            this_container.select("#h-label").html("H: " + data_point.high.toFixed(2));
            this_container.select("#l-label").html("L: " + data_point.low.toFixed(2));
            this_container.select("#c-label").html("C: " + data_point.close.toFixed(2));
        }
        updateData(data[data.length-1]);
        
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
                .attr('x2', -xScale(currentPoint['date']))
                .attr('y1', 0)
                .attr('y2', 0);

            focus
                .select('line.y')
                .attr('x1', 0)
                .attr('x2', 0)
                .attr('y1', 0)
                .attr('y2', height - yScale(currentPoint['close']));

            updateData(currentPoint);
        }
    };
    lineChart(line_data);    
}