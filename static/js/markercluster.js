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
// var url = "https://maps2.dcgis.dc.gov/dcgis/rest/services/FEEDS/MPD/MapServer/0/query?where=1%3D1&outFields=LATITUDE,LONGITUDE&outSR=4326&f=json";
// var url = "https://data.cityofnewyork.us/resource/fhrw-4uyv.json"

// Grab the data with d3
d3.json(url, function(response) {

  // Create a new marker cluster group


  var markers = L.markerClusterGroup({
    // polygonOptions: {fillColor: "red"}
  });
  console.log(response)
  // Loop through data
  for (var i = 0; i < response.features.length; i++) {

    // Set the data location property to a variable
    var location = response.features[i].geometry;

    // var lat = response[i].features.geometry.x
    // var long = response[i].features.geometry.y

    // Check for location property
    if (location) {
      // Add a new marker to the cluster group and bind a pop-up
      markers.addLayer(L.marker([location.coordinates[0], location.coordinates[1]])
        .bindPopup("<h3>" + response.features[i].properties.offense + "<hr>Report Date: "
        + response.features[i].properties.report_date + "</h3><hr>"));
        // .bindPopup(response.features[i].properties.offense))
        // .bindPopup(response.features[i].properties.report_date);
    }

  }

  // Add our marker cluster layer to the map
  myMap.addLayer(markers);
});