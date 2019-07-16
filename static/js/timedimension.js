
// Store endpoint of API link
var queryURL = "http://127.0.0.1:5000/crime/2018";

// Use d3 to access API endpoint
d3.json(queryURL, function(data) {
    heatMap(data.features);
});

function heatMap(crimeData) {
  var coords = []
  var crimeLayer = L.geoJSON(crimeData, {
    pointToLayer: function (feature) {
        return L.circleMarker(feature.geometry.coordinates);
    },
    onEachFeature: function (feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place + "<hr>Magnitude: "
        + +feature.properties.mag + "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
        coords.push(feature.geometry.coordinates)
    },
    coordsToLatLng: function (coords) {
      return new L.heatLayer(coords);
      }
});
console.log(crimeLayer)
createMap(crimeLayer);
}
// function heatMap(response) {
//     // console.log(response)

//     var heatArray = [];
//     var dateArray = [];

//     for (var i = 0; i < response.length; i++) {
//         var location = response[i].geometry;
//         var crimeDate = response[i].properties;

//         if(crimeDate) {
//           dateArray.push(crimeDate.reportdate)
//         }
    
//         if (location) {
//           heatArray.push([location.coordinates[0], location.coordinates[1]]);
//         }
//     }
//     // console.log(dateArray);
//     // console.log(heatArray);
//     var crime = L.heatLayer(heatArray, {
//     radius: 20,
//     blur: 40
//     })
//     // console.log(crime)

//     var crimeLayer = {heat: crime, date: dateArray}
//     console.log(crimeLayer);
  
  
//     // Sending our earthquakes layer to the createMap function
//     createMap(crimeLayer.heat);
// }

function createMap(crimeLayer) {

    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });
  
    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    var satmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets-satellite",
        accessToken: API_KEY
    });
  
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Street Map": streetmap,
      "Dark Map": darkmap,
      "Satellite Map": satmap
    };
  
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Crime: crimeLayer,
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [38.889931, -77.009003],
      zoom: 12,
      timeDimension: true,
      timeDimensionOptions: {
        timeInterval : "2018-01-01/2018-12-31",
        period: "P2D",
        autoPlay: true
      },
      timeDimensionControl: true,
      timeDimensionControlOptions: {
        loopButton: true,
        autoPlay: true
      },
      layers: [streetmap, crimeLayer]
    });
  
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);



L.TimeDimension.Layer.GeoJson.GeometryCollection = L.TimeDimension.Layer.GeoJson.extend({
  // Do not modify features. Just return the feature if it intersects the time interval
  _getFeatureBetweenDates: function(feature, minTime, maxTime) {
    var time = new Date(feature.properties.reportdate);
      if (time > maxTime || time < minTime) {
          return null;
      }
      return feature;
  }
});

var timeLayer = L.timeDimension.layer.geoJson.geometryCollection = function(layer, options) {
  return new L.TimeDimension.Layer.GeoJson.GeometryCollection(layer, options);
};


geoJsonTimeLayer = L.timeDimension.layer.geoJson.geometryCollection(crimeLayer, {
  updateTimeDimension: true,
  updateTimeDimensionMode: 'replace',
  duration: 'PT1H',
  }).addTo(myMap);
}