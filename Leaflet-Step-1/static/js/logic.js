// Store our API endpoint as queryUrl.
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(url).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data);
});


function createFeatures(data) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function markerstyle(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      color: "#98ee00",
      fillColor: chooseColor(feature.geometry.coordinates[2]),
      radius: feature.properties.mag * 3,
      weight: 1
    };
  }

  function pointToLayer(feature, latlng) {
    return L.circleMarker(latlng);
  }

  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>Magnitude ${feature.properties.mag}</p><p>Depth ${feature.geometry.coordinates[2]}</p>`);
  }


  function chooseColor(depth) {
    switch (true) {
      case depth > 90: return "#de2d26";
      case depth >= 70: return "#e95d26";
      case depth >= 50: return "#ee9c00";
      case depth >= 30: return "#d4ee00";
      case depth >= 10: return "#98ee00";
      default: "#98ee00";
    }
  }


  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(data, {
    onEachFeature: onEachFeature,
    style: markerstyle,
    pointToLayer: pointToLayer
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);

}



function createMap(earthquakes) {

  // Create the base layers.
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });



  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });



  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({
    position: "bottomright"
  });

  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "legend");


    var grades = [-10, 10, 30, 50, 70, 90];
    var colors = [
      "#98ee00",
      "#d4ee00",
      "#eecc00",
      "#ee9c00",
      "#e95d26",
      "#de2d26"
    ];

    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i> "
        + grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  }; legend.addTo(myMap);

}

