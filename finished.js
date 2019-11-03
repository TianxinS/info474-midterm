'use strict';

(function() {

    let data = "no data";
    let svgContainer = ""; // keep SVG reference in global scope

    // load data and make scatter plot after window loads
    window.onload = function() {
        svgContainer = d3.select('body')
        .append('svg')
        .attr('width', 1000)
        .attr('height', 1000);
        // d3.csv is basically fetch but it can be be passed a csv file as a parameter
        d3.csv("./pokemon.csv")
        .then((data) => makeScatterPlot(data));

    }

    // make scatter plot with trend line
    function makeScatterPlot(csvData) {
        data = csvData // assign data as global variable

        // Legendary filter
        var dropDown2 = d3.select("#filter2").append("select")
            .attr("name", "Legendary");

        // Generation filter
        var dropDown1 = d3.select("#filter1").append("select")
        .attr("name", "Generation");

        // legendary options
        var defaultOption2 = dropDown2.append("option")
            .text("(Default)")
            .attr("value", "default")
            .classed("default", true)
            .enter();

        var allOption2 = dropDown2.append("option")
            .data(data)
            .text("All")
            .attr("value", "select")
            .enter();

        var options2 = dropDown2.selectAll("option.legendary")
            .data(d3.map(data, function(d){return d.Legendary;}).keys())
            .enter()
            .append("option")
            .classed("selector", true)
            .text(function (d) { return d; })
            .attr("value", function (d) { return d; });

        // generation options
        var defaultOption1 = dropDown1.append("option")
            .text("(Default)")
            .attr("value", "default")
            .classed("default", true)
            .enter();

        var allOption1 = dropDown1.append("option")
            .data(data)
            .text("All")
            .attr("value", "select")
            .enter();

        var options1 = dropDown1.selectAll("option.generation")
            .data(d3.map(data, function(d){return d.Generation;}).keys())
            .enter()
            .append("option")
            .classed("generation", true)
            .text(function (d) { return d; })
            .attr("value", function (d) { return d; });

        dropDown2.on("change", function() {
            // var selected2 = this.value;
            state.selected2 = this.value;

            // render(filterLegendary(selected2,data));
            addFn(filterFn,data);
        });

        function filterLegendary(selected2, data){
            
            if (state.selected2 === "select"){
                return data;
            }

            else{
                var fArr = data.filter(function(ele, index){
                    if(state.selected2 == ele.Legendary){
                        return true;
                    }
                })
                return fArr;
            }
        }
        
        // generation change
        dropDown1.on("change", function() {
         
            // var selected1 = this.value;
            state.selected1 = this.value;

            // render(filterGeneration(selected1,data));
            addFn(filterFn,data);
        });

        function filterGeneration(selected1, data){
            
                if (state.selected1 === "select"){
                    return data;
                }
    
                else{
                    var sArr = data.filter(function(ele, index){
                        if(state.selected1 == ele.Generation){
                            return true;
                        }
                    })
                    return sArr;
                }
            }


        var filterFn = {
            selected2: filterLegendary,
            selected1: filterGeneration
        }

        var state = {
            selected2: 'all',
            selected1: 'all'
        }

        function addFn(obj, arr){
            var lastArr = arr;
            for(var prop in obj){
                lastArr = obj[prop](state[prop], lastArr);
                // console.log(lastArr);
            }
            

            // draw the axes and ticks
            function findScatter(x, y) {
                // return x value from a row of data
                let xValue = function(d) { return +d[x]; }
                // console.log(xValue)

                // function to scale x value
                let xScale = d3.scaleLinear()
                .domain([20 - 10, 230 + 10]) // give domain buffer room
                .range([50, 600]);

                // xMap returns a scaled x value from a row of data
                let xMap = function(d) { return xScale(xValue(d)); };
                
                // console.log(xMap)

                // plot x-axis at bottom of SVG
                let xAxis = d3.axisBottom().scale(xScale);
                svgContainer.select("#chart").append("g")
                    .attr('transform', 'translate(0, 500)')
                    .call(xAxis);

                // return y value from a row of data
                let yValue = function(d) { return +d[y]}

                // function to scale y
                let yScale = d3.scaleLinear()
                    .domain([780 + 20, 180 - 30]) // give domain buffer
                    .range([50, 500]);

                // yMap returns a scaled y value from a row of data
                let yMap = function (d) { return yScale(yValue(d)); };

                // plot y-axis at the left of SVG
                let yAxis = d3.axisLeft().scale(yScale);
                svgContainer.select("chart").append('g')
                    .attr('transform', 'translate(50, 0)')
                    .call(yAxis);

                // return mapping and scaling functions
                return {
                    x: xMap,
                    y: yMap,
                };
            }

            // draw axes and return scaling + mapping functions
            let maps = findScatter("Sp. Def", "Total");

            // plot all the data points on the SVG
            // and add tooltip functionality
            function plotData(map) {

                svgContainer.selectAll("circle").remove()

                // mapping functions
                let xMap = map.x;
                let yMap = map.y;

                // make tooltip
                let div = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

                function colors(color) {
                    if (color == "Bug") { return "#4E79A7"; } 
                    else if (color == "Dark") { return "#A0CBE8"; }
                    else if (color == "Electric") { return "#F28E2B"; }
                    else if (color == "Fairy") { return "#FFBE&D"; }
                    else if (color == "Fighting") { return "#59A14F"; }
                    else if (color == "Fire") { return "#8CD17D"; }
                    else if (color == "Ghost") { return "#B6992D"; }
                    else if (color == "Grass") { return "#499894"; }
                    else if (color == "Ground") { return "#86BCB6"; }
                    else if (color == "Ice") { return "#86BCB6"; }
                    else if (color == "Normal") { return "#E15759"; }
                    else if (color == "Poison") { return "#FF9D9A"; }
                    else if (color == "Psychic") { return "#79706E"; }
                    else if (color == "Steel") { return "#BAB0AC"; }
                    else if (color == "Water") { return "#D37295"; }
                    else { return "#9F9F9F"; }
                }

                // append data to SVG and plot as points
                svgContainer.selectAll('.dot')
                    .data(lastArr)
                    .enter()
                    .append('circle')
                    .attr('cx', xMap)
                    .attr('cy', yMap)
                    .attr('r', 7)
                    .attr('stroke', "#4286f4")
                    .style("fill", function(d) { return colors(d["Type 1"]); })
                        // add tooltips
                        .on("mouseover", function(d){
                            div.transition()
                                .duration(200)
                                .style("opacity", .9);
                            div.html(d['Name'] + "<br/>" + d['Type 1'] + "<br/>" + d['Type 2'])
                                .style("left", (d3.event.pageX) + "px")
                                .style("top", (d3.event.pageY - 28) + "px")
                        })
                        .on("mouseout", function(d){
                            div.transition()
                                .duration(500)
                                .style("opacity", 0)
                        })
                    .attr({
                            id: function(d) { return d.Generation; }
                        });

            }

            // plot data as points and add tooltip functionality
            plotData(maps);

        }
    
        // get arrays of Sp.Def data and total data
        let sp_def_data = data.map((row) => parseInt(row['Sp. Def']));
        let total_data = data.map((row) => parseInt(row["Total"]));

        // find data limits
        let axesLimits = findMinMax(sp_def_data, total_data);
        console.log(axesLimits)
        // draw axes and return scaling + mapping functions
        drawAxes(axesLimits, "Sp. Def", "Total");

        // draw title and axes labels
        makeLabels();

        // create legends
        const color = [
            {type: "Bug", color: "#4E79A7"},
            {type: "Dark", color: "#A0CBE8"},
            {type: "Electric", color: "#F28E2B"},
            {type: "Fairy", color: "#FFBE&D"},
            {type: "Fighting", color: "#59A14F"},
            {type: "Fire", color: "#8CD17D"},
            {type: "Ghost", color: "#B6992D"},
            {type: "Grass", color: "#499894"},
            {type: "Ground", color: "#86BCB6"},
            {type: "Ice", color: "#86BCB6"},
            {type: "Normal", color: "#E15759"},
            {type: "Poison", color: "#FF9D9A"},
            {type: "Psychic", color: "#79706E"},
            {type: "Steel", color: "#BAB0AC"},
            {type: "Water", color: "#D37295"}
        ]

        var barHeight = 30;
        var legend = svgContainer.selectAll(".legend")
            .data(color)
            .enter().append("g");

        legend.append("rect")
            .attr("class", "rect")
            .attr("r", 5)
            .attr('x', 650)
            .attr('y', 50)
            .attr('width', 20)          
            .attr('height', 20)          
            .attr('transform', function(d, i) {            
                return "translate(0," + i * barHeight + ")";          
            })
            .style("fill", function(d) { return d.color; });

        legend.append("text")
            .attr("x", 675)
            .attr("y", 65)
            .attr('transform', function(d, i) {            
                return "translate(0," + i * barHeight + ")";          
            })
            .text(function (d) { return d.type; })
            .style("font-size", "12px"); 

        d3.select("#chart").remove()
        svgContainer.selectAll('.dot').exit().remove()

        // make title and axes labels
        function makeLabels() {
            // plot new title
            d3.select('#title').remove()
                svgContainer.append('text')
                .attr('x', 180)
                .attr('y', 40)
                .attr('id', "title")
                .style('font-size', '14pt')
                .text("Pokemon: Special Defense vs Total Stats");
            
            svgContainer.append('text')
                .attr('x', 300)
                .attr('y', 540)
                .style('font-size', '10pt')
                .text('Sp.Def');

            svgContainer.append('text')
                .attr('transform', 'translate(15, 300)rotate(-90)')
                .style('font-size', '10pt')
                .text('Total');
        }

        // draw the axes and ticks
        function drawAxes(limits, x, y) {
            // return x value from a row of data
            let xValue = function(d) { return +d[x]; }
            // console.log(xValue)

            // function to scale x value
            let xScale = d3.scaleLinear()
                .domain([limits.xMin - 10, limits.xMax + 10]) // give domain buffer room
                .range([50, 600]);

            // xMap returns a scaled x value from a row of data
            let xMap = function(d) { return xScale(xValue(d)); };

            // console.log(xMap)

            // plot x-axis at bottom of SVG
            let xAxis = d3.axisBottom().scale(xScale);
            svgContainer.append("g")
                .attr('transform', 'translate(0, 500)')
                .call(xAxis);

            // råeturn y value from a row of data
            let yValue = function(d) { return +d[y]}

            // function to scale y
            let yScale = d3.scaleLinear()
                .domain([limits.yMax + 20, limits.yMin - 30]) // give domain buffer
                .range([50, 500]);

            // yMap returns a scaled y value from a row of data
            let yMap = function (d) { return yScale(yValue(d)); };

            // plot y-axis at the left of SVG
            let yAxis = d3.axisLeft().scale(yScale);
            svgContainer.append('g')
                .attr('transform', 'translate(50, 0)')
                .call(yAxis);

            // return mapping and scaling functions
            return {
                x: xMap,
                y: yMap,
                xScale: xScale,
                yScale: yScale
            };
        }

        // find min and max for arrays of x and y
        function findMinMax(x, y) {

            // get min/max x values
            let xMin = d3.min(x);
            let xMax = d3.max(x);

            // get min/max y values
            let yMin = d3.min(y);
            let yMax = d3.max(y);

            // return formatted min/max data as an object
            return {
            xMin : xMin,
            xMax : xMax,
            yMin : yMin,
            yMax : yMax
            }
        }

        // format numbers
        function numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    }

})();
