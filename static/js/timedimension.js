
// Store endpoint of API link
var queryURL = "http://127.0.0.1:5000/crime/2018";

// Use d3 to access API endpoint
d3.json(queryURL, function(data) {
    heatMap(data.features);
});

function heatMap(crimeData) {
  var coords = []

  var wolficon = L.icon({
    iconUrl: 'static/js/wolf.png',
    iconSize:     [38, 95],
    // shadowSize:   [50, 64],
    iconAnchor:   [22, 94],
    // shadowAnchor: [4, 62],
    popupAnchor:  [-3, -76]
    }
);

  var crimeLayer = L.geoJSON(crimeData, {
    pointToLayer: function (feature) {
      if (feature.properties.weather.lunar_illum >= .98) {
        return L.marker(feature.geometry.coordinates, {icon: wolficon})
        }
        return L.marker(feature.geometry.coordinates, {
          stroke: false,
          fillColor: "Red",
          fillOpacity: 1,
          radius: 50
        });
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
// console.log(crimeLayer)
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
//           dateArray.push(crimeDate.report_date)
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
      // Crime: crimeLayer,
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [38.889931, -77.009003],
      zoom: 12,
      timeDimension: true,
      timeDimensionOptions: {
        timeInterval : "2018-01-01/2018-12-31",
        period: "P1D",
        autoPlay: true
      },
      timeDimensionControl: true,
      timeDimensionControlOptions: {
        loopButton: true,
        autoPlay: true,
        minSpeed: 1,
        maxSpeed: 5,
        speedStep: 1
      },
      layers: [darkmap]
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
    var time = new Date(feature.properties.report_date);
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
  // updateTimeDimension: true,
  updateTimeDimensionMode: 'replace',
  duration: 'P1D',
  }).addTo(myMap);
}