// Create map object
// JSON URL for earthquakes in 1 day and plates 
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
var platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

// Perform a GET request to the query URL for earthquake data 
d3.json(queryUrl, function(data) {
  createFeatures(data.features);
});

// Create fault line layer 
var faultlines = new L.layerGroup();
// Perform a GET request to the plate URL for tectonic plates data
d3.json(platesUrl, function(platesData) {
  L.geoJSON(platesData, {
              weight: 2,
              color: 'orange',
              fillOpacity: 0
           })
  .addTo(faultlines);
})

// Define a function for marker color 
function markerColor(mag) {
  if (mag > 5 ) {
    return "Red"
  }
  else if (mag > 4) {
    return "Orange"
  }
  else if (mag > 3) { 
    return "SandyBrown"
  }
  else if (mag > 2) {
    return "Khaki"
  }
  else if (mag > 1) {
    return "GreenYellow"
  }
  else {
    return "Chartreuse"
  }
}

function createFeatures(earthquakeData) {

// Define a function we want to run once for each feature in the features array
// Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "</h3><hr><p> Magnitude: " + feature.properties.mag + "</p>")
  }

// Define a function to add the radius and color of the circles 
  function onEachLayer(feature) {
    return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
    radius: feature.properties.mag * 3,
    fillOpacity: 1,
    color: markerColor(feature.properties.mag),
  });
}

// Create a GeoJSON layer containing the features array on the earthquakeData object
// Run the onEachFeature and onEachLayer functions once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
// pointToLayer changes the pinpoint to a layer
    pointToLayer: onEachLayer
  });

// Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

// Define map layers
  var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 256,
    maxZoom: 18,
    id: "mapbox/satellite-streets-v11",
    accessToken: API_KEY
  });

  var outdoorsmap= L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "outdoors-v10",
    accessToken: API_KEY
  });

  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
  });

// Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": satellitemap,
    "Grayscale": lightmap,
    "Outdoors": outdoorsmap,
  };

// Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines": faultlines
  };
  
//   create map

  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
  });

// Create a layer control, pass in our baseMaps and overlayMaps and add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


// Create a legend to display information about earthquake magnitudes
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

// loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + markerColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};
legend.addTo(myMap)
}