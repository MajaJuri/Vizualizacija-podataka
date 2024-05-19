function draw_heat_map(){
    var margin = {top: 30, right: 40, bottom: 30, left: 350},
            width = window.innerWidth * 7 / 10 - margin.left - margin.right,
            height = window.innerHeight * 3 / 5 - margin.top - margin.bottom;

    var svg = d3.select("#heat_map").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + 100)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("static/data/podaci_2.csv").then(function (data) {
        
        var countries_set = new Set();
        var features_set = new Set();
        for (var i = 1; i < data.length; i++) {
            features_set.add(data[i].variable)
            countries_set.add(data[i].country)
        }
        //console.log(countries_set)
        //console.log(features_set)
        var countries = Array.from(countries_set)
        var features = Array.from(features_set)

        let feature_values = {}
        for (var i = 1; i < data.length; i++) {
            if (data[i].variable in feature_values) {
                feature_values[data[i].variable].push(Number(data[i].value))
            } else {
                feature_values[data[i].variable] = [Number(data[i].value)]
            }
        }
        //console.log(feature_values)

        const x = d3.scaleBand()
            .range([0, width])
            .domain(countries)
            .padding(0.05);
        svg.append("g")
            .style("font-size", 15)
            .attr("transform", ("translate(0, " + height + ")"))
            .call(d3.axisBottom(x).tickSize(0))
            .selectAll("text")
            .attr("transform", "translate(10,0)rotate(70)")
            .style("text-anchor", "start");

        const y = d3.scaleBand()
            .range([height, 0])
            .domain(features)
            .padding(0.05);
        svg.append("g")
            .style("font-size", 15)
            .call(d3.axisLeft(y).tickSize(0))
            .select(".domain")
            .remove()

        //tooltip
        var tooltip = d3.select("#heat_map")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("padding", "10px")
            .style("position", "absolute")

        const mouseover = function (event, d) {
            // oznacavanje celije i pokazivanje tooltipa
            tooltip.style("opacity", "0.9")
            d3.select(this).classed("highlighted", true)
            d3.select(this).style('stroke', 'black').style("stroke-width", 2)

            // postavljanje hidden value-a i oznacavanje te tocke u scatter plot-u
            countryInput = d3.select('#heat_country');
            countryInput.property("value", d.country.replaceAll(" ", "_"))
            select_id = "#scatter_" + d.country.replaceAll(" ", "_")
            d3.selectAll(select_id).style('stroke', 'black');

            // oznacavanje stupca u heat map-u
            select_id = "#heat_" + d.country.replaceAll(" ", "_")
            d3.selectAll(select_id).style('stroke', 'black').style("stroke-width", "2")
            
            // oznacavanje reda u heat map-u
           feature_value = ("heat_" + d.variable.replaceAll(" ", "_"))
            feature_value_search = "[feature=\"" + feature_value + "\"]"
            heat_feature = d3.selectAll("[feature=\"" + feature_value + "\"]")
            heat_feature.style("stroke", "black").style("stroke-width", "2")


            //oznacavanjem reda mijenjamo boje u scatter plot-u
            let colors = {}
            d3.selectAll("[feature=\"" + feature_value + "\"]").each(function(d, i){
                element = d3.select(this)
                scatter_country_id = element.attr("id").replace("heat_", "scatter_")
                colors[scatter_country_id] = element.style("fill")
            })
            //console.log(colors)

            for (country in colors){
                //console.log("#" + country + " => " + colors[country])
                d3.select("#" + country).style("fill", colors[country])
            }
        }

        const mousemove = function (event, d) {
            tooltip
                .html("The \"" + d.variable + "\" in " + d.country + " is: " + d.value)
                .style("left", (event.pageX) + 10 + "px")
                .style("top", (event.pageY) + "px");
            d3.select(this).style("stroke", "black").style("stroke-width", "2")
        }

        const mouseleave = function (event, d) {
            // uklanjanje tooltipa i obruba oko celije
            tooltip.style("opacity", 0)
            d3.select(this).style('stroke', '');
            d3.select(this).classed("highlighted", false)

            // brisanje hidden vrijednosti i micanje oznake iz scatter plot-a
            countryInput = d3.select('#heat_country');
            previously_Selected_Country = countryInput.property("value")
            d3.selectAll("#scatter_" + previously_Selected_Country).classed("highlighted", false).style('stroke', '');
            countryInput.property("value", "none")

            // uklanjanje obruba stupca
            select_id = "#heat_" + d.country.replaceAll(" ", "_")
            d3.selectAll(select_id).style('stroke', '')

            // uklanjanje obruba retka
            feature_value_search = "[feature=\"" + ("heat_" + d.variable.replaceAll(" ", "_")) + "\"]"
            heat_feature = d3.selectAll("[feature=\"" + feature_value + "\"]")
            heat_feature.style("stroke", "")

            //vracamo originalne boje
            d3.selectAll("circle").each(function(d, i){
                element = d3.select(this)
                const clr = d3.scaleSequential().interpolator(d3.interpolateRdBu).domain([-5, 5])
                element.style("fill", function (d) {
                    return clr(d.pc_2)
                })
            })
        }

        function myColor(variable, value) {
            const boja = d3.scaleSequential()
                .interpolator(d3.interpolateRdBu)
                .domain([Math.min.apply(Math, feature_values[variable]), Math.max.apply(Math, feature_values[variable])])
            return boja(value)
        }

        // add the squares
        svg.selectAll()
            .data(data, function (d) {
                return d.country + ':' + d.variable;
            })
            .join("rect")
            .attr("x", function (d) {
                return x(d.country)
            })
            .attr("y", function (d) {
                return y(d.variable)
            })
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", function (d) {
                    let color = myColor(d.variable, d.value)
                    return color;
                }
            )
            .attr("id", function (d) {
                return "heat_" + d.country.replaceAll(" ", "_")
            })
            .attr("feature", function (d) {
                return "heat_" + d.variable.replaceAll(" ", "_")
            })
            .classed("highlightable", true)
            .style("opacity", 0.75)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)


    });
}