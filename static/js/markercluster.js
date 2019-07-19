// Creating map object
var myMap = L.map("map", {
  center: [38.889931, -77.009003],
  zoom: 11
});

// Adding tile layer to the map
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
}).addTo(myMap);

// Store API query variables
var url = "http://127.0.0.1:5000/crime/2018"


// Grab the data with d3
d3.json(url, function(response) {

    
  var wolficon = L.icon({
    iconUrl: 'static/js/werewolf.png',
    iconSize:     [40, 60],
    iconAnchor:   [22, 94],
    popupAnchor:  [-3, -76]
    }
  );


  var markers = L.markerClusterGroup({
    // polygonOptions: {fillColor: "red"}
  });

  // Loop through data
  for (var i = 0; i < response.features.length; i++) {

    // Set the data location property to a variable
    var location = response.features[i];

    // Check for location property
    if (location) {
      // Add a new marker to the cluster group and bind a pop-up
      if (location.properties.weather.lunar_illum >= .98) {
        markers.addLayer(L.marker(location.geometry.coordinates, {icon: wolficon}))
        }
        markers.addLayer(L.circleMarker(location.geometry.coordinates, {
          stroke: false,
          fillColor: "Red",
          fillOpacity: 1,
          radius: 10
        }));
        markers.bindPopup("<h3>" + response.features[i].properties.offense + "<hr>Report Date: "
        + response.features[i].properties.report_date + "</h3><hr>");

    }

  }

  // Add our marker cluster layer to the map
  myMap.addLayer(markers);
});