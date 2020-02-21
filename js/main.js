/* Main JavaScript sheet for MLB Travel by Michael Vetter */

var initialLocation = [40, -98.5];
var initialZoom = 5;

//Create the map
var map = L.map("mapDiv",{
    center: initialLocation,
    zoom: initialZoom,
    scrollWheelZoom: false
});

//Add CartoDB base tilelayer
var CartoDB_Voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
}).addTo(map);

//Add ESRI base tilelayer
var esri = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
        attribution:
        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
    }
);

//Create the base maps
var baseLayers = {
    Grayscale: CartoDB_Voyager,
    Imagery: esri
};

//Add the base maps to the map so the user can decide
L.control.layers(baseLayers).addTo(map);

//Add team points to the map
$.ajax("data/stadiums.geojson",{
    dataType: "json",
    success: function(response){
        var featureLayer = L.geoJson(response, {
            pointToLayer: function(feature, latlng){
                return L.marker(latlng,{
                    opacity: 0
                })
            },
            onEachFeature: function (feature, layer){
                layer.on("click", function(e){
                    d3.select("." + feature.properties.Team).style("opacity", "1");

                    //Get total length of path
                    var totalLength = d3.select("." + feature.properties.Team).node().getTotalLength();

                    d3.select("." + feature.properties.Team)
                        .attr("stroke-dasharray", "50" + " " + totalLength)
                        .attr("stroke-dashoffset", totalLength)
                        .style("stroke-width", "3")
                        .transition()
                        .duration(75000)
                        .ease(d3.easeLinear)
                        .attr("stroke-dashoffset", 0)
                        .on("end", function(){
                            d3.select(this)
                                .transition()
                                .duration(0.2)
                                .style("opacity", "0");
                        });

                    pulsePoint(feature);
                })
            }
        }).addTo(map);
    }
});

//Add svg to map
// L.svg().addTo(map);

//Create the overlay pane
var svgOverlay = d3.select(map.getPanes().overlayPane).append("svg");
// var svgOverlay = d3.select("#mapDiv").select("svg")
var height = 600, width = 650;
var g = svgOverlay.append("g").attr("class", "pane");

//Load travel geojson
var travelData = "data/travel.geojson";
var loadData = d3.json(travelData, function(error, collection){
    if (error) throw error;

    function projectPoint(x, y){
        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
    }
    var transform = d3.geoTransform({point: projectPoint});
    var path = d3.geoPath().projection(transform);

    //Create the paths
    var feature = g.selectAll("path")
        .data(collection.features)
        .enter()
        .append("path")
        .attr("class", function(d){
            return d.properties.Team;
        })
        .attr("opacity", 0)
        .attr("d", path);

    //Reset SVG when map is panned
    map.on("moveend", reset);
    reset();
    function reset(){
        var bounds = path.bounds(collection),
            topLeft = bounds[0]+10,
            bottomRight = bounds[1];

        svgOverlay.attr("width", bottomRight[0] - topLeft[0] + 250)
            .attr("height", topLeft[1] - bottomRight[1] + 1875)
            .style("left", topLeft[0] + "px")
            .style("top",topLeft[1] + "px")
            .style("background", "none")
            .style("opacity", "1");

        g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
        feature.attr("d", path);
    }
});

var stadiumData = "data/teams.geojson";
d3.json(stadiumData, function(error, collection){
    if (error) throw error;

    const points = g.selectAll("circle")
        .data(collection.features)
        .enter()
        .append("circle")
        .attr("class", function(d){
            return d.properties.Team + "Point";
        })
        .attr("r", 5)
        .attr("cx", function(d){
            return map.latLngToLayerPoint([d.geometry.coordinates[1], d.geometry.coordinates[0]]).x
        })
        .attr("cy", function(d){
            return map.latLngToLayerPoint([d.geometry.coordinates[1], d.geometry.coordinates[0]]).y
        })
        .attr("opacity", 1);

    map.on("moveend", update);

    function update(){
        points.attr("cx", function(d){
            return map.latLngToLayerPoint([d.geometry.coordinates[1], d.geometry.coordinates[0]]).x
        })
        .attr("cy", function(d){
            return map.latLngToLayerPoint([d.geometry.coordinates[1], d.geometry.coordinates[0]]).y
        })
    }
});

//Function to pulse the dots based on the selected team
function pulsePoint(feature){
    if (feature.properties.Team === "Diamondbacks"){
        d3.select("." + feature.properties.Team + "Point")
            .transition()
            .duration(600)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.First + "Point")
            .transition()
            .delay(2000)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.Second + "Point")
            .transition()
            .delay(5750)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r",5);
        d3.select("." + feature.properties.Three + "Point")
            .transition()
            .delay(7000)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.Four + "Point")
            .transition()
            .delay(10000)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.Five + "Point")
            .transition()
            .delay(10750)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.Six + "Point")
            .transition()
            .delay(13880)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.Seven + "Point")
            .transition()
            .delay(17650)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.Eight + "Point")
            .transition()
            .delay(18990)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.Nine + "Point")
            .transition()
            .delay(21750)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.Ten + "Point")
            .transition()
            .delay(26050)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r",5);
        d3.select("." + feature.properties.Eleven + "Point")
            .transition()
            .delay(27850)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.Twelve + "Point")
            .transition()
            .delay(30950)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.Thirteen + "Point")
            .transition()
            .delay(31300)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.Fourteen + "Point")
            .transition()
            .delay(32550)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.Fifteen + "Point")
            .transition()
            .delay(34200)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.Sixteen + "Point")
            .transition()
            .delay(34350)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.Seventeen + "Point")
            .transition()
            .delay(35000)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.Eighteen + "Point")
            .transition()
            .delay(39100)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r",5);
        d3.select("." + feature.properties.Nineteen + "Point")
            .transition()
            .delay(41250)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.Twenty + "Point")
            .transition()
            .delay(43250)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.TwentyOne + "Point")
            .transition()
            .delay(44250)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.TwentyTwo + "Point")
            .transition()
            .delay(46250)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.TwentyThree + "Point")
            .transition()
            .delay(49075)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.TwentyFour + "Point")
            .transition()
            .delay(50400)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.TwentyFive + "Point")
            .transition()
            .delay(51500)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.TwentySix + "Point")
            .transition()
            .delay(53500)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r",5);
        d3.select("." + feature.properties.TwentySeven + "Point")
            .transition()
            .delay(55650)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.TwentyEight + "Point")
            .transition()
            .delay(59250)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.TwentyNine + "Point")
            .transition()
            .delay(59800)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.Thirty + "Point")
            .transition()
            .delay(60500)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.ThirtyOne + "Point")
            .transition()
            .delay(64000)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.ThirtyTwo + "Point")
            .transition()
            .delay(66000)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.ThirtyThree + "Point")
            .transition()
            .delay(69650)
            .duration(500)
            .attr("r", 10)
            .transition()
            .duration(200)
            .attr("r", 5);
        d3.select("." + feature.properties.ThirtyFour + "Point")
            .transition()
            .delay(70000)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.ThirtyFive + "Point")
            .transition()
            .delay(70250)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.ThirtySix + "Point")
            .transition()
            .delay(70750)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.ThirtySeven + "Point")
            .transition()
            .delay(72250)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
        d3.select("." + feature.properties.ThirtyEight + "Point")
            .transition()
            .delay(74250)
            .duration(1000)
            .attr("r", 10)
            .transition()
            .duration(600)
            .attr("r", 5);
    }
}
