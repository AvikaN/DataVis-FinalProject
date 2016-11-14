var zoomCoord = [[33.8,8.1,91.9,38.1],[27.0,14.4,59.4,37.4],[-126.8,23.9,-65.5,50.1], [-128.1,9.5,63.3,50.7]];
var highlights = [["India", "Afghanistan", "Iran", "Qatar", "Iraq", "United Arab Emirates", "Saudi Arabia", "Kuwait"], 
					["Afghanistan", "Iran", "Qatar", "Iraq", "United Arab Emirates", "Saudi Arabia", "Kuwait"], 
					["United States of America"], 
					["Afghanistan", "Iran", "Qatar", "Iraq", "United Arab Emirates", "Saudi Arabia", "Kuwait", "United States of America"]];
var len = zoomCoord.length; 
var zoomIndex = 0; 
//change zoom value and zoom coordinates 
//you have one svg layer right? 

//get all the geojson data for every region
var map; 
var featureElement; 

d3.json("data/countries.geojson", function(err, geo){
	initMap(geo);
});

function initMap(geo){
	console.log("hello"); 
	mapboxgl.accessToken = 'pk.eyJ1IjoiYXZpa2FuYXJ1bGEiLCJhIjoiY2l0dDZwNGJ5MDAwYTMwbjJrMTdqaHc2MyJ9.wojo_GFOo5GTGlk3zHk37g'; 

	//setup mapbox-gl 
	map = new mapboxgl.Map({
		container: 'map',  //container id
		style: 'mapbox://styles/mapbox/light-v9', 
		center: [0,0],
		zoom: 2
	}); 

	//might want to disable zoom control 
	map.scrollZoom.disable()
	map.addControl(new mapboxgl.Navigation());

	map.on('load', function(){
		map.addSource('countries', {
			'type' : 'geojson', 
			'data' : 'data/countries.geojson'
		});

		//add a layer showing the countries
		map.addLayer({
			'id' : 'countries-layer', 
			'type' : 'fill', 
			'source' : 'countries', 
			'paint' : {
				'fill-color' : 'rgba(0,0,0,0)', 
				'fill-outline-color' : 'rgba(0,0,0,0)'
			}
		});

	});

	
	var container = map.getCanvasContainer();
	var svg = d3.select(container).append("svg");

	var path = d3.geo.path().projection(mapboxProjection); 

	featureElement = svg.selectAll("path")
			.data(geo.features)
			.enter()
			.append("path")
			.attr("stroke-width", "2px")
			.attr("stroke", function(data){ 
				return "orange"; 
			})
			.attr("fill", "none")
			.attr("opacity", 0);


	var vp = getVP();
	var d3Projection = getD3(); 


	function render() {
		vp = getVP();
		d3Projection = getD3();
		featureElement.attr("d", path);
	}

	map.on("viewreset", function() {
		render()
	})

	map.on("move", function() {
		render()
	})

	render()

	function getVP() {
		var bbox = document.body.getBoundingClientRect();
		var center = map.getCenter();
		var zoom = map.getZoom();
		var vp = ViewportMercator({
		    longitude: center.lng,
		    latitude: center.lat,
		    zoom: zoom,
		    width: bbox.width,
		    height: bbox.height,
		})
		return vp;
	}

	function getD3() {
		var bbox = document.body.getBoundingClientRect();
		var center = map.getCenter();
		var zoom = map.getZoom();
		  // 512 is hardcoded tile size, might need to be 256 or changed to suit your map config
		var scale = (512) * 0.5 / PI * pow(2, zoom);

		var d3projection = d3.geo.mercator()
		    .center([center.lng, center.lat])
		    .translate([bbox.width/2, bbox.height/2])
		    .scale(scale);

		return d3projection;
	}

	function mapboxProjection(lonlat) {
	  var p = map.project(new mapboxgl.LngLat(lonlat[0], lonlat[1]))
	  return [p.x, p.y];
	}

	d3.select("#nextChapter").on("click", nextChapter);
}

function nextChapter(){

	featureElement.attr("opacity", 0);



	map.fitBounds([
		[zoomCoord[zoomIndex][0], zoomCoord[zoomIndex][1]], 
		[zoomCoord[zoomIndex][2], zoomCoord[zoomIndex][3]]
	]);

	var focus = highlights[zoomIndex];

	featureElement.transition().duration(2500).attr("opacity", function(d,i){
		if(focus.indexOf(d.properties.name) != -1){
			return 0.75;
		}
		else{
			return 0; 
		}	
	})
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

	zoomIndex = (zoomIndex+1) % len;
}






