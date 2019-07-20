API_KEY = System.getenv('API_KEY');
// Store endpoints of API links
var queryURL = "/crime/2018";
var aggURL = "/aggregate";
var districtsJSON = "/static/js/Neighborhood_Clusters.geojson";
var electionJSON = "/static/js/election_districts.geojson";

// Query API for heatmap and district line data
d3.json(queryURL, function(data) {
  d3.json(districtsJSON, function(data2) {
    d3.json(electionJSON, function (data3) {
      heatMap(data.features, data2.features, data3.features);
    })
  }) 
});

// Query API for aggregated data to build Plotly time series
d3.json(aggURL, function(data) {
  creatTimeSeries(data);
});

// Main function to create geoJSON layers for mapping
function heatMap(crimeData, districtsData, electionData) {

  // Custom map icon for full moon nights
  var wolficon = L.icon({
    iconUrl: 'static/js/werewolf.png',
    iconSize:     [30, 50],
    iconAnchor:   [22, 94],
    popupAnchor:  [-3, -76]
    }
  );

  // Style for district shapes
  function Style() {
    return {
        color: "blue",
        fillOpacity: 0,
    };
  }

  // Create geoJSON layer for crime data
  var crimeLayer = L.geoJSON(crimeData, {
    pointToLayer: function (feature) {
      // Use custom wolf icon on full moon days
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

    // Bind popup displaying the Offense type and Date of offense
    onEachFeature: function (feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.offense + "</h3><hr><p>" + new Date(feature.properties.report_date) + "</p>");
    }
  });

  // Create geoJSON layer for DC neighborhoods
  var districts = L.geoJSON(districtsData, {
    style: function(feature) {
        return Style(feature.geometry.rings)
    },
    onEachFeature: function (feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.NAME + "</h3><hr><p>" + feature.properties.NBH_NAMES + "</p>");
    }
  });

  // Create geoJSON layer for DC voting districts
  var election = L.geoJSON(electionData, {
    style: function(feature) {
        return Style(feature)
    },
    onEachFeature: function (feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.DISTRICT + "</h3>");
    }
  });

  // Feed layers onto the map
  createMap(crimeLayer, districts, election);
};

// Creates a Plotly TimeSeries displaying aggregate data for each day
function creatTimeSeries(data) {
  var crimeTrace = {
    x: data.date,
    y: normalize(data.crime_count),
    mode: 'line',
    name: 'Crime',
    hoverinfo: 'text',
    hovertext: data.crime_count.map(d => d + ' Crimes')
  };

  var lunarTrace = {
    x: data.date,
    y: data.lunar_illum,
    mode: 'line',
    name: 'Lunar Illum',
    hoverinfo: 'text',
    hovertext: data.lunar_illum.map(d => Math.round(d * 100, 0) + '%')
  };

  var avgTrace = {
    x: data.date,
    y: normalize(data.temp_avg),
    type: 'scatter',
    mode: 'line',
    name: 'Avg Temp',
    hoverinfo: 'text',
    hovertext: data.temp_avg.map(d => d + ' °F')
  };
  
  var maxTrace = {
    x: data.date,
    y: normalize(data.temp_max),
    type: 'scatter',
    mode: 'markers',
    name: 'Max Temp',
    visible: 'legendonly',
    hoverinfo: 'text',
    hovertext: data.temp_max.map(d => d + ' °F')
  };
  
  var minTrace = {
    x: data.date,
    y: normalize(data.temp_min),
    type: 'scatter',
    mode: 'markers',
    name: 'Min Temp',
    visible: 'legendonly',
    hoverinfo: 'text',
    hovertext: data.temp_min.map(d => d + ' °F')
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

// Helper function
function normalize(data) {
  var max = Math.max(...data);
  var min = Math.min(...data);
  return data.map(x => (x-min)/(max-min));
}

// Main function to create and animate the map
function createMap(crimeLayer, districts, election) {

  // Define street map layer
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.streets",
      accessToken: API_KEY
  });

  // Define dark map layer
  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.dark",
      accessToken: API_KEY
  });

  // Define light map layer
  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Define satellite map layer
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
    "Districts": districts,
    "Election Districts": election,
  };

  // Variable to ensure our TimeDimension Player starts on Jan 1, 2018
  var startTime = new Date();
  startTime.setUTCDate(1,0,0,0);

  // Create our map, giving it the light basemap and district layers to display on load
  // Adds the TimeDimension to the map, allowing layers to be displayed over time
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



  // Extend several TimeDimension built-in functions to better fit our project
  L.TimeDimension.Layer.GeoJson.GeometryCollection = L.TimeDimension.Layer.GeoJson.extend({
    
    // Do not modify features. Just return the feature if it intersects the time interval
    _getFeatureBetweenDates: function(feature, minTime, maxTime) {
      var time = new Date(feature.properties.report_date);
        if (time > maxTime || time < minTime) {
            return null;
        }
        return feature;
    },

    // Fires on a new layer loading
    _update: function(d) {
      // **** Begin default _update code
      if (!this._map)
          return;
      if (!this._loaded) {
          return;
      }

      var time = this._timeDimension.getCurrentTime();

      var maxTime = this._timeDimension.getCurrentTime(),
          minTime = 0;
      if (this._duration) {
          var date = new Date(maxTime);
          L.TimeDimension.Util.subtractTimeDuration(date, this._duration, true);
          minTime = date.getTime();
      }

      // new coordinates:
      var layer = L.geoJson(null, this._baseLayer.options);
      var layers = this._baseLayer.getLayers();
      for (var i = 0, l = layers.length; i < l; i++) {
          var feature = this._getFeatureBetweenDates(layers[i].feature, minTime, maxTime);
          if (feature) {
              layer.addData(feature);
              if (this._addlastPoint && feature.geometry.type == "LineString") {
                  if (feature.geometry.coordinates.length > 0) {
                      var properties = feature.properties;
                      properties.last = true;
                      layer.addData({
                          type: 'Feature',
                          properties: properties,
                          geometry: {
                              type: 'Point',
                              coordinates: feature.geometry.coordinates[feature.geometry.coordinates.length - 1]
                          }
                      });
                  }
              }
          }
      }

      if (this._currentLayer) {
          this._map.removeLayer(this._currentLayer);
      }
      if (layer.getLayers().length) {
          layer.addTo(this._map);
          this._currentLayer = layer;
      }
      // **** End default _update code

      // Custom control for the Plotly graph
      // Checks current date that the TimeDimension is showing and updates the Plotly
      // xaxis rangeslider and the position of a vertical line to denote the current date
      var newDate = new Date(d.time);
      var start = new Date(newDate);
        start.setDate(newDate.getDate() - 14);
        start = start.toISOString().slice(0, 10);
      var end = new Date(newDate);
        end.setDate(newDate.getDate() + 15);
        end = end.toISOString().slice(0, 10);
      newDate = newDate.toISOString().slice(0, 10);
      var newRange = ['2018-01-01', '2018-01-30'];

      if (newDate.localeCompare('2018-01-15') >= 0) {
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

  // Extend the _getDisplayDateFormat function to display the date format 'Mmm dd, yyyy' on the player
  L.Control.TimeDimensionCustom = L.Control.TimeDimension.extend({
    _getDisplayDateFormat: function(date){
      var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      date.setDate(date.getDate() + 1);
      return month[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
    }
  });

  // and the Custom TimeDimension Player Control to the map
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

  // Begin TimeDimension playing of crime layers on the map
  geoJsonTimeLayer = L.timeDimension.layer.geoJson.geometryCollection(crimeLayer, {
    // updateTimeDimension: true,
    updateTimeDimensionMode: 'replace',
    duration: 'P1D',
  }).addTo(myMap);
};