function createCandlestickChart(cs_data, layout_id, chart_id) {

    cs_data = cs_data.map(function (d) {
        d.date = new Date(d.date * 1000);
        return d;
    });

    identity = layout_id+"-"+chart_id;

    const candleChart = data => {
        const margin = { top: 50, right: 25, bottom: 40, left: 55 };
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
            return d['low'];
        });

        const yMax = d3.max(data, d => {
            return d['high'];
        });
        // scale using range
        xMin = new Date(xMin - resolution_dict[global_resolution]);
        xMax = new Date(xMax + resolution_dict[global_resolution]);
        const xScale = d3
            .scaleTime()
            .domain([xMin, xMax])
            .range([0, width]);

        const yScale = d3
            .scaleLinear()
            .domain([yMin - 5, yMax])
            .range([height, 0]);

        // add chart SVG to the page
        // console.log('#chart'+layout_id+"-"+chart_id);
        // console.log(width + margin['left'] + margin['right']);\
        $('#chart'+identity).empty();

        const svg = d3
            .select('#chart'+identity)
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
            // .style('stroke', primary_color)
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

        // svg.append("g")			
        //   .attr("class", "grid")
        //   .call(d3.axisLeft(yScale).ticks(5)
        //       .tickSize(-width)
        //       .tickFormat("")
        //   )

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
        const yMinVolume = d3.min(data, d => {
            return Math.min(d['volume']);
        });

        const yMaxVolume = d3.max(data, d => {
            return Math.max(d['volume']);
        });

        const yVolumeScale = d3
            .scaleLinear()
            .domain([yMinVolume, yMaxVolume])
            .range([height, height * (3 / 4)]);

        let volumes = svg
            .append('g')
            .attr('class', 'volumes')

        let xBand = d3.scaleBand().domain(d3.range(-1, data.length)).range([0, width]).padding(0.4)

        volumes
            .selectAll()
            .data(data)
            .enter()
            .append('rect')
            .attr('x', d => xScale(d.date) - (xBand.bandwidth() / 2))
            .attr('y', d => {
                return yVolumeScale(d['volume']);
            })
            .attr('class', 'volume')
            .attr("id", (_, i) => { return "volume" + i; })
            .attr('fill', (d, i) => {
                // if (i === 0) {
                //     return '#03a678';
                // } else {
                return medium_grey;
                // return volData[i - 1].close > d.close ? '#c0392b' : '#03a678'; // green bar if price is rising during that period, and red when price  is falling
                // }
            })
            .attr('width', xBand.bandwidth())
            .attr('height', d => {
                return height - yVolumeScale(d['volume']);
            });

        let candles = svg
            .append('g')
            .attr('class', 'candles')
        candles
            .selectAll()
            .data(data)
            .enter()
            .append("rect")
            .attr('x', d => xScale(d.date) - (xBand.bandwidth() / 2))
            .attr("class", "candle")
            .attr("id", (_, i) => { return "candle" + i; })
            .attr('y', d => yScale(Math.max(d.open, d.close)))
            .attr('width', xBand.bandwidth())
            .attr('height', d => (d.open === d.close) ? 1 : yScale(Math.min(d.open, d.close)) - yScale(Math.max(d.open, d.close)))
            .attr("fill", d => (d.open === d.close) ? primary_color : (d.open > d.close) ? red : green)

        // draw high and low
        let stems = svg
            .append('g')
            .attr('class', 'stems')
        stems
            .selectAll()
            .data(data)
            .enter()
            .append("line")
            .attr("class", "stem")
            .attr("x1", d => xScale(d.date))
            .attr("x2", d => xScale(d.date))
            .attr("y1", d => yScale(d.high))
            .attr("y2", d => yScale(d.low))
            .attr("id", (_, i) => { return "stem" + i; })
            .attr("stroke", d => (d.open === d.close) ? primary_color : (d.open > d.close) ? red : green);
        // testing axis for volume
        /*
        svg.append('g').call(d3.axisLeft(yVolumeScale));
        */
        let bands = svg
            .append('g')
            .attr('class', 'bands')
        bands
            .selectAll()
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "band")
            .attr('x', d => xScale(d.date))
            .attr("y", 0)
            .attr("height", height)
            .attr("width", 1)
            .attr("id", (_, i) => { return "band" + identity + "-" + i; })
            .style("stroke-width", xBand.bandwidth());

        let this_container = d3.select("#container"+identity);
        
        function default_data(data) {
            l = data.length - 1
            this_container.select("#date-label").html(data[l].date.toLocaleDateString());
            this_container.select("#o-label").html("O: " + data[l].open);
            this_container.select("#h-label").html("H: " + data[l].high);
            this_container.select("#l-label").html("L: " + data[l].low);
            this_container.select("#c-label").html("C: " + data[l].close);
        }

        default_data(data);
        this_container.selectAll(".bands").selectAll(".band")
            .on("mouseover", function (_, i) {
                d3.select(this).classed("hoved", true);
                this_container.select("#stem" + i).classed("hoved", true);
                this_container.select("#candle" + i).classed("hoved", true);
                this_container.select("#volume" + i).classed("hoved", true);
                this_container.select("#date-label").html(data[i].date.toLocaleDateString())
                this_container.select("#o-label").html("O: " + data[i].open);
                this_container.select("#h-label").html("H: " + data[i].high);
                this_container.select("#l-label").html("L: " + data[i].low);
                this_container.select("#c-label").html("C: " + data[i].close);
            })
            .on("mouseout", function (_, i) {
                d3.select(this).classed("hoved", false);
                this_container.select("#stem" + i).classed("hoved", false);
                this_container.select("#candle" + i).classed("hoved", false);
                this_container.select("#volume" + i).classed("hoved", false);
                default_data(data);
            });
    };

    

    candleChart(cs_data);
}