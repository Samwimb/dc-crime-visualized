API_KEY = "pk.eyJ1IjoiZGMtY3JpbWUtYXBwIiwiYSI6ImNqeWF0eGxjZTAyYzAzbXFtbjloaG9yYWIifQ.fO2HGOd4tD6oI7JTwHQRZw";
// Store endpoint of API link
var queryURL = "/crime/2018";
var districtsJSON = "/static/js/Neighborhood_Clusters.geojson"
var electionJSON = "/static/js/election_districts.geojson"


// Use d3 to access API endpoint
d3.json(queryURL, function(data) {
  d3.json(districtsJSON, function(data2) {
    d3.json(electionJSON, function (data3) {
      console.log(data);
      heatMap(data.features, data2.features, data3.features);
    })
  }) 
});



function heatMap(crimeData, districtsData, electionData) {
  var coords = []

  var wolficon = L.icon({
    iconUrl: 'static/js/werewolf.png',
    iconSize:     [30, 50],
    iconAnchor:   [22, 94],
    popupAnchor:  [-3, -76]
    }
  );

  function Style() {
    return {
        color: "blue",
        fillOpacity: 0,
    };
  }

  var crimeLayer = L.geoJSON(crimeData, {
    pointToLayer: function (feature) {
      return L.circle(feature.geometry.coordinates, {
        stroke: false,
        fillColor: "Red",
        fillOpacity: .3,
        radius: 125
      });
      if (feature.properties.weather.lunar_illum >= .98) {
        return L.marker(feature.geometry.coordinates, {icon: wolficon})
        }
        return L.circle(feature.geometry.coordinates, {
          stroke: false,
          fillColor: "Red",
          fillOpacity: 1,
          radius: 125
        });
      },
    onEachFeature: function (feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.offense + "<hr>Report Date: "
        + feature.properties.report_date + "</h3><hr>");
        coords.push(feature.geometry.coordinates)
    },
  });
  // console.log(crimeLayer);

  var districts = L.geoJSON(districtsData, {
    style: function(feature) {
        return Style(feature.geometry.rings)
    },
    onEachFeature: function (feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.NAME + "</h3><hr><p>" + feature.properties.NBH_NAMES + "</p>");
    }
  });

  var election = L.geoJSON(electionData, {
    style: function(feature) {
        return Style(feature)
    },
    onEachFeature: function (feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.DISTRICT + "</h3>");
    }
  });
// console.log(crimeLayer)
createMap(crimeLayer, districts, election);
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

function createMap(crimeLayer, districts, election) {

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

    var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.light",
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
      "Satellite Map": satmap,
      "Light Map": lightmap
    };
  
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      // Crime: crimeLayer,
      "Districts": districts,
      "Election Districts": election,
    };
    var startTime = new Date();
    startTime.setUTCDate(1,0,0,0);

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [38.889931, -77.009003],
      zoom: 12,
      timeDimension: true,
      timeDimensionOptions: {
        timeInterval : "2018-01-01/2018-12-31",
        period: "P1D",
        autoPlay: true,
        currentTime: startTime
      },
      timeDimensionControl: true,
      timeDimensionControlOptions: {
        loopButton: true,
        autoPlay: true,
        minSpeed: 1,
        maxSpeed: 5,
        speedStep: 1,
        playerOptions: {
          startOver: true
        }
      },
      layers: [lightmap, districts]
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
  duration: 'P1M',
  }).addTo(myMap);
}
