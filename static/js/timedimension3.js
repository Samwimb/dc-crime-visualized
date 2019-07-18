
// Store endpoints of API links
var queryURL = "http://127.0.0.1:5000/crime/2018";
var aggURL = "http://127.0.0.1:5000/aggregate";
var districtsJSON = "/static/js/Neighborhood_Clusters.geojson";
var electionJSON = "/static/js/election_districts.geojson";

// Use d3 to access API endpoint
// d3.json(queryURL, function(data) {
//     heatMap(data.features);
// });
d3.json(queryURL, function(data) {
  d3.json(districtsJSON, function(data2) {
    d3.json(electionJSON, function (data3) {
      heatMap(data.features, data2.features, data3.features);
    })
  }) 
});

d3.json(aggURL, function(data) {
  // console.log(data);
  creatTimeSeries(data);
});

function heatMap(crimeData, districtsData, electionData) {
  var coords = []

  var wolficon = L.icon({
    iconUrl: 'static/js/werewolf.png',
    iconSize:     [38, 95],
    // shadowSize:   [50, 64],
    iconAnchor:   [22, 94],
    // shadowAnchor: [4, 62],
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
      if (feature.properties.weather.lunar_illum >= .98) {
        return L.marker(feature.geometry.coordinates, {icon: wolficon})
        }
        return L.circle(feature.geometry.coordinates, {
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
};

function creatTimeSeries(data) {
  var crimeTrace = {
    x: data.date,
    y: normalize(data.crime_count),
    mode: 'line',
    name: 'Crime'
  };

  var lunarTrace = {
    x: data.date,
    y: data.lunar_illum,
    mode: 'line',
    name: 'Lunar Illum'
  };

  var avgTrace = {
    x: data.date,
    y: normalize(data.temp_avg),
    type: 'scatter',
    mode: 'line',
    name: 'Avg Temp'
  };
  
  var maxTrace = {
    x: data.date,
    y: normalize(data.temp_max),
    type: 'scatter',
    mode: 'markers',
    name: 'Max Temp',
    visible: 'legendonly'
  };
  
  var minTrace = {
    x: data.date,
    y: normalize(data.temp_min),
    type: 'scatter',
    mode: 'markers',
    name: 'Min Temp',
    visible: 'legendonly'
  };

  traces = [crimeTrace, lunarTrace, avgTrace, maxTrace, minTrace];

  var layout = {
    dragmode: 'zoom',
    xaxis: {
      range: ['2018-01-01', '2018-01-31'], 
      rangeslider: {range: ['2018-01-01', '2018-12-31']}, 
      title: 'Date', 
      type: 'date'
    }, 
    yaxis: {
      autorange: true,
      visible: false
    },
    shapes: [{
      type: 'line',
      x0: '2018-01-01',
      x1: '2018-01-01',
      y0: 0,
      y1: 1,
      line: {color: '#ff0000'}
    }]
  };

  Plotly.newPlot('plot', traces, layout);
}

function normalize(data) {
  var max = Math.max(...data);
  var min = Math.min(...data);
  return data.map(x => (x-min)/(max-min));
}

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
      autoPlay: true
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
    },

    _update: function(d) {
      var newDate = new Date(d.time);
      var start = new Date(newDate);
        start.setDate(newDate.getDate() - 15);
        start = start.toISOString().slice(0, 10);
      var end = new Date(newDate);
        end.setDate(newDate.getDate() + 15);
        end = end.toISOString().slice(0, 10);
      newDate = newDate.toISOString().slice(0, 10);
      var newRange = ['2018-01-01', '2018-01-30'];

      if (newDate.localeCompare('2018-01-16') >= 0) {
        newRange = [start, end];
      }

      if (newDate.localeCompare('2018-12-16') >= 0) {
        newRange = ['2018-12-02', '2018-12-31'];
      }
      
      var newLayout = {
        'xaxis.range': newRange,
        'shapes[0].x0': newDate,
        'shapes[0].x1': newDate
      };

      Plotly.relayout('plot', newLayout);
    }
  });

  var timeLayer = L.timeDimension.layer.geoJson.geometryCollection = function(layer, options) {
    return new L.TimeDimension.Layer.GeoJson.GeometryCollection(layer, options);
  };

  L.Control.TimeDimensionCustom = L.Control.TimeDimension.extend({
    _getDisplayDateFormat: function(date){
      var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      date.setDate(date.getDate() + 1);
      return month[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
    }
  });

  var timeDimensionControl = new L.Control.TimeDimensionCustom({
    loopButton: true,
    autoPlay: true,
    minSpeed: 1,
    maxSpeed: 5,
    speedStep: 1,
    timeSliderDragUpdate: true,
    playerOptions: {
        startOver: true
    }
  }).addTo(myMap);

  geoJsonTimeLayer = L.timeDimension.layer.geoJson.geometryCollection(crimeLayer, {
    // updateTimeDimension: true,
    updateTimeDimensionMode: 'replace',
    duration: 'P1D',
    }).addTo(myMap);
};