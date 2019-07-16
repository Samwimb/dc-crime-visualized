var myMap = L.map("map", {
    center: [38.889931, -77.009003],
    zoom: 12,
    // timeDimension: true,
    // timeDimensionOptions: {
    //   timeInterval : "2018-01-01/2018-12-31",
    //   period: "P2D",
    //   autoPlay: true
    // },
    // timeDimensionControl: true,
    // timeDimensionControlOptions: {
    //   loopButton: true,
    //   autoPlay: true
    // },
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

d3.json(url, function(crimeData) {
    var coords = []
    var crimeLayer = L.geoJSON(crimeData, {
      pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng);
      },
      onEachFeature: function (feature, layer) {
          layer.bindPopup("<h3>" + feature.properties.place + "<hr>Magnitude: "
          + +feature.properties.mag + "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
          coords.push(feature.geometry.coordinates)
      },
      coordsToLatLng: function (coords) {
        return new L.heatLayer(coords);
        }
  })
  console.log(crimeLayer)
});