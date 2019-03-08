mapboxgl.accessToken = 'pk.eyJ1IjoiZ3JhZmEiLCJhIjoiY2lvZjU0NnRqMDB0cnVwbTM3MmZjeGxxZiJ9.HG76QROZVWnTf9jQ9ZKWDw';
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/light-v9', // stylesheet location
    center: [-122.67773866653444,45.52245801087795], // starting position [lng, lat]
    zoom: 11.5 // starting zoom
});

map.on('load', function () {
    map.addLayer({
			"id": "locations",
			"type": "symbol",
			"source": {
					type: 'vector',
					url: 'mapbox://grafa.cjsz5wor900fi45muprgr1x9s-5fcb6'
			},
			"source-layer": "mowsf",
			"layout": {
				"icon-image": "circle-15",
				"text-field": "{name}",
				"text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
				"text-offset": [0, 0.6],
				"text-anchor": "top"
			}
		});
	
	// When a click event occurs on a feature in the locations layer,paas the
	// location of the feature, with description HTML from its properties.
	map.on('click', 'locations', function (e) {
		var coordinates = e.features[0].geometry.coordinates.slice();
		var id = e.features[0].properties.id;
		var description = e.features[0].properties.name;
		renderListings(id,description,coordinates)
		document.getElementById("calcButton").style.display='block';
	});

	// Change the cursor to a pointer when the mouse is over the places layer.
	map.on('mouseenter', 'locations', function () {
			map.getCanvas().style.cursor = 'pointer';
	});

	// Change it back to a pointer when it leaves.
	map.on('mouseleave', 'locations', function () {
			map.getCanvas().style.cursor = '';
	});
});

function renderListings(id,description,coordinates) {
	var node = document.createElement("li");
	
	node.innerHTML = 	'<div class="list-group-item">' + 
						'<span class="badge">' + id + '</span>' + 
						'<span class="glyphicon glyphicon-move" aria-hidden="true"></span>' + 
						'<span class="listing">' + description + '</span>' + 
						'<div id="feature-listing" class="listing">' + coordinates + '</div></div>';
	
	document.getElementById('listWithHandle').appendChild(node);
}

var pts = document.getElementsByClassName('list-group-item');

function calcRoute() {
	var waypoints = [];

	for (let i = 0; i < pts.length; i++) {
		waypoints.push(pts[i].children[3].innerText);		
	}
	var coords = waypoints.join(';');
	return coords;
}


function drawRoute(coords) {
	let url = 'https://api.mapbox.com/optimized-trips/v1/mapbox/driving/' + coords + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;
	var req = new XMLHttpRequest();
	req.responseType = 'json';
	req.open('GET', url, true);
	req.onload  = function() {
		var jsonResponse = req.response;
		console.log(url);	
		var coords = jsonResponse.trips[0].geometry;
		addRoute(coords); // add the route to the map
		var tripInstructions = [];
		var legs = jsonResponse.trips[0].legs;
		
		for(var i = 0; i < legs.length; i++) {
			var step = legs[i];
			for(var j = 0; j < step.steps.length; j++) {
				tripInstructions.push('<li>' + step.steps[j].maneuver.instruction + '</li>');
				results.innerHTML = tripInstructions.join('');
			}
		}
	};
	req.send();
}


// adds the route as a layer on the map
function addRoute (coords) {
	// check if the route is already loaded
	if (map.getSource('route')) {
		map.getSource('route').setData(coords);
	} else{
	  map.addLayer({
			"id": "route",
			"type": "line",
			"source": {
				"type": "geojson",
				"data": {
					"type": "Feature",
					"properties": {},
					"geometry": coords
				}
			},
			"layout": {
				"line-join": "round",
				"line-cap": "round"
			},
			"paint": {
				"line-color": "#3b9ddd",
				"line-width": 8,
				"line-opacity": 0.8
			}
	  });
	};
}
  