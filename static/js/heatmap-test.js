var myMap = L.map("map", {
  center: [38.889931, -77.009003],
  zoom: 11,
});

L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
}).addTo(myMap);

var url = "http://127.0.0.1:5000/crime/2018";

d3.json(url, function(response) {

  console.log(response);

  var heatArray = [];

  for (var i = 0; i < response.features.length; i++) {
    var location = response.features[i].geometry;

    if (location) {
      heatArray.push([location.coordinates[0], location.coordinates[1]]);
    }
  }

  var heat = L.heatLayer(heatArray, {
    radius: 20,
    blur: 35
  }).addTo(myMap);
});


// L.TimeDimension.Layer.GeoJson.GeometryCollection = L.TimeDimension.Layer.GeoJson.extend({
//   // Do not modify features. Just return the feature if it intersects the time interval
//   _getFeatureBetweenDates: function(feature, minTime, maxTime) {
//     var time = new Date(feature.properties.report_date);
//       if (time > maxTime || time < minTime) {
//           return null;
//       }
//       return feature;
//   }
// });
// var timeLayer = L.timeDimension.layer.geoJson.geometryCollection = function(layer, options) {
//   return new L.TimeDimension.Layer.GeoJson.GeometryCollection(layer, options);
// };


// geoJsonTimeLayer = L.timeDimension.layer.geoJson.geometryCollection(heat, {
//   updateTimeDimension: true,
//   updateTimeDimensionMode: 'replace',
//   duration: 'PT1H',
//   }).addTo(myMap);
