  function draw_scatter_plot(){
    var margin = {top: 30, right: 50, bottom: 30, left: 20},
        width = window.innerWidth * 3 / 10 - margin.left - margin.right - 10,
        height = window.innerHeight * 3 / 5 - margin.top - margin.bottom;

    var svg = d3.select("#scatter_plot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

      d3.csv("static/data/PCA.csv").then(function (data) {

        //x os
        var x = d3.scaleLinear()
            .domain([-10, 10])
            .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
        //y os
        var y = d3.scaleLinear()
            .domain([-4, 4])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        //tooltip
        var tooltip = d3.select("#scatter_plot")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("padding", "10px")
            .style("position", "absolute")

        var mouseover = function (event, d) {
            tooltip
                .style("opacity", "0.9")
            this.parentNode.parentNode.appendChild(this.parentNode);
            this.parentNode.parentNode.parentNode.appendChild(this.parentNode.parentNode);
            d3.select(this).classed("highlighted", true)
            d3.select(this).style('stroke', 'black');

            countryInput = d3.select('#scatter_country');
            countryInput.property("value", d.Countries.replaceAll(" ", "_"))

            select_id = "#heat_" + d.Countries.replaceAll(" ", "_")

            d3.selectAll(select_id).style('stroke', 'black').style("stroke-width", "2")
        }
        var mousemove = function (event, d) {
            tooltip
                .html("The selected country is: " + d.Countries)
                .style("left", (event.pageX) + 10 + "px")
                .style("top", (event.pageY) + "px")
        }

        var mouseleave = function (event, d) {
            tooltip
                .style("opacity", 0)
            this.parentNode.parentNode.appendChild(this.parentNode);
            this.parentNode.parentNode.parentNode.appendChild(this.parentNode.parentNode);
            d3.select(this).style('stroke', '');

            countryInput = d3.select('#scatter_country');
            previously_Selected_Country = countryInput.property("value")
            d3.selectAll("#heat_" + previously_Selected_Country).classed("highlighted", false).style('stroke', '');
            countryInput.property("value", "none")
        }

        const myColor = d3.scaleSequential()
            .interpolator(d3.interpolateRdBu).domain([-5, 5])
        
        svg.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return x(d.pc_1);
            })
            .attr("cy", function (d) {
                return y(d.pc_2);
            })
            .attr("r", 5)
            .style("fill", function (d) {
                return myColor(d.pc_2)
            })
            .attr("id", function (d) {
                return "scatter_" + d.Countries.replaceAll(" ", "_")
            })
            .style("opacity", 0.8)
            .style("stroke", "white")
            .style("margin", "2px")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
    });

}