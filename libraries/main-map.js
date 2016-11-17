//specifices the bounding box coordinates
var zoomCoord = [[33.8,8.1,91.9,38.1],[27.0,14.4,59.4,37.4],[-126.8,23.9,-65.5,50.1], [-128.1,9.5,63.3,50.7]];

//specifies which countries to highlight
var highlights = [["India", "Afghanistan", "Iran", "Qatar", "Iraq", "United Arab Emirates", "Saudi Arabia", "Kuwait"], 
					["Afghanistan", "Iran", "Qatar", "Iraq", "United Arab Emirates", "Saudi Arabia", "Kuwait"], 
					["United States of America"], 
					["Afghanistan", "Iran", "Qatar", "Iraq", "United Arab Emirates", "Saudi Arabia", "Kuwait", "United States of America"]];
var len = zoomCoord.length; 
var zoomIndex = 0; 

var map; 
var featureElement; 

//load geojson data using d3 -> each element defines a path for a country with long, lat cooridnates
d3.json("data/countries.geojson", function(err, geo){
	initMap(geo);
});

function initMap(geo){
	mapboxgl.accessToken = 'pk.eyJ1IjoiYXZpa2FuYXJ1bGEiLCJhIjoiY2l0dDZwNGJ5MDAwYTMwbjJrMTdqaHc2MyJ9.wojo_GFOo5GTGlk3zHk37g'; 

	//create a new map using mapbox-gl 
	map = new mapboxgl.Map({
		container: 'map',  //add this map to the div with id = "map"
		style: 'mapbox://styles/mapbox/light-v9', 
		center: [0,0],
		zoom: 2, 
		interactive: false //user cannot zoom scrool or drag the map 
	}); 

	//get the div container with the map in it
	var container = map.getCanvasContainer();

	//append an svg layer on top of the map container
	var svg = d3.select(container).append("svg");


	//d3.geo.path() is a helper class for generating SVG Path instructions from GeoJSON data
		//the function generates the SVG Path instructions for you -> check here for more info https://www.dashingd3js.com/lessons/d3-geo-path
		//example of path instruction that draws a triangle d="M 100 100 L 300 100 L 200 300 z" 
		//using this helper, we don't have to define our on path instructions
		//you need these instructions to pass into featureElement's "d" attribute to create an outline for each country

	//we need to project the paths onto the map, so we use .projection(mapboxProjection);
	//.projection returns a new array with [x,y] coordinates of each point projected onto the map; 
	var path = d3.geo.path().projection(mapboxProjection); 

	//create a path element to append to the svg layer
	featureElement = svg.selectAll("path")
			.data(geo.features)
			.enter()
			//append the path
			.append("path")
			//set attributes
			.attr("stroke-width", "2px")
			.attr("fill", "none")
			//pass the instructions to draw the path
			.attr("d", path)
			.attr("opacity", 0);


	//redefine the instructions for path
	function render() {
		featureElement.attr("d", path);
	}

	//change the points coordinates when map moves
	map.on("viewreset", function() {
		render()
	})

	map.on("move", function() {
		render()
	})

	//project points onto the map 
	//https://www.mapbox.com/help/define-projection/
	function mapboxProjection(lonlat) {
	  var p = map.project(new mapboxgl.LngLat(lonlat[0], lonlat[1]))
	  return [p.x, p.y];
	}

	//call nextChapter whenever next button is clicked
	d3.select("#nextChapter").on("click", nextChapter);

}

function nextChapter(){

	//reset all geometries to opacity 0 
	featureElement.attr("opacity", 0);

	//zoom to fit specified bounding box coordinate
	map.fitBounds([
		[zoomCoord[zoomIndex][0], zoomCoord[zoomIndex][1]], 
		[zoomCoord[zoomIndex][2], zoomCoord[zoomIndex][3]]
	]);

	//which countries are we highlighting
	var focus = highlights[zoomIndex];

	//return 0 opacity if we're hiding the element, otherwise return 0.75 opacity
	featureElement.transition().duration(2500).attr("opacity", function(d,i){
		if(focus.indexOf(d.properties.name) != -1){
			return 0.75;
		}
		else{
			return 0; 
		}	
	})
	//return stroke color according country name
	.attr("stroke", function(d){
		if(d.properties.name === "India"){
			return "purple"; 
		}
		else if(d.properties.name === "United States of America"){
			return "red"; 
		}
		else{
			return "#8B4513"; 
		}
	});

	//incremet to get next chapter's bounding box coordinate
	zoomIndex = (zoomIndex+1) % len;
}






