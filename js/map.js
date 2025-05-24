var map = L.map('map').setView([31.2323437, 121.4691024], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


function style(feature) {
  const districtName = feature.properties.name;
  return {
    fillColor: getColor(districtName, selectedFilters),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

// Popup binding function
function onEachFeature(feature, layer) {
  if (feature.properties && feature.properties.name) {
    layer.bindPopup(`<strong>${feature.properties.name}</strong>`);
  }
}

let geojsonLayer;

fetch('js/shanghai.geojson')
  .then(response => response.json())
  .then(data => {
    geojsonLayer = L.geoJSON(data, {
      style: style,
      onEachFeature: function (feature, layer) {
        layer.bindPopup(feature.properties.name);
      }
    }).addTo(map);
  });



const data = {
  "浦东新区": { overallRank: 9.055555556, factors: { popDensity: 10, hDensity: 10, rehDensity: 10, GDP: 12, edu: 9, health: 13 } },
  "黄浦区": { overallRank: 7.861111111, factors: { popDensity: 3, hDensity: 1.5, rehDensity: 3, GDP: 16, edu: 12, health: 1 } }, 
  "徐汇区": { overallRank: 8.527777778, factors: { popDensity: 5, hDensity: 4.5, rehDensity: 5, GDP: 15, edu: 11, health: 3 } },
    "长宁区": { overallRank: 8.5, factors: { popDensity: 7, hDensity: 6, rehDensity: 6, GDP: 14, edu: 15, health: 4 } },
    "静安区": { overallRank: 6.916666667, factors: { popDensity: 2, hDensity: 1.5, rehDensity: 2, GDP: 13, edu: 9 , health: 2 } },
    "普陀区": { overallRank: 5.527777778, factors: { popDensity: 4, hDensity: 4.5, rehDensity: 4, GDP: 4, edu: 13, health: 6 } },
    "虹口区": { overallRank: 6.277777778, factors: { popDensity: 1, hDensity: 3, rehDensity: 1, GDP: 11, edu: 7, health: 5 } },
    "杨浦区": { overallRank: 8, factors: { popDensity: 6, hDensity: 7, rehDensity: 7, GDP: 10, edu: 14, health: 7 } },
    "闵行区": { overallRank: 7.888888889, factors: { popDensity: 9, hDensity: 8, rehDensity: 9, GDP: 5, edu: 5, health: 11 } },
    "宝山区": { overallRank: 7.277777778, factors: { popDensity: 8, hDensity: 9, rehDensity: 8, GDP: 2, edu: 1, health: 12 } },
    "嘉定区": { overallRank: 9.833333333, factors: { popDensity: 11, hDensity: 11, rehDensity: 11, GDP: 9, edu: 4, health: 10 } },
    "金山区": { overallRank: 11.55555556, factors: { popDensity: 15, hDensity: 15, rehDensity: 15, GDP: 8, edu: 7, health: 8 } },
    "松江区": { overallRank: 8.75, factors: { popDensity: 12, hDensity: 12.5, rehDensity: 12, GDP: 3, edu: 1, health: 16 } },
    "青浦区": { overallRank: 10.38888889, factors: { popDensity: 13, hDensity: 13, rehDensity: 14, GDP: 6, edu: 5, health: 11 } },
    "奉贤区": { overallRank: 10.36111111, factors: { popDensity: 14, hDensity: 13.5, rehDensity: 13, GDP: 7, edu: 3, health: 15 } },
    "崇明区": { overallRank: 9.611111111, factors: { popDensity: 16, hDensity: 16, rehDensity: 16, GDP: 1, edu: 16, health: 11 } }
};  

function getColor(districtName, selectedFactors) {
    const district = data[districtName];
  // Default to overallRank if no filter selected
  let avgRank;
  if (!selectedFactors || selectedFactors.length === 0) {
    avgRank = district.overallRank;
  } else {
    const sum = selectedFactors.reduce((acc, factor) => acc + district.factors[factor], 0);
    avgRank = sum / selectedFactors.length;
  }

  // Color scale (Oranges_r for reversed depth)
  const breaks = [5, 6, 7, 8, 9, 10, 11, 12];
  if (avgRank <= breaks[0]) return "#7f2704";
  if (avgRank <= breaks[1]) return "#a23503";
  if (avgRank <= breaks[2]) return "#d94801";
  if (avgRank <= breaks[3]) return "#fa8331";
  if (avgRank <= breaks[4]) return "#fd9a4e";
  if (avgRank <= breaks[5]) return "#fdcb9b";
  if (avgRank <= breaks[6]) return "#feeddc";
  return "#fff5eb";
}

let selectedFilters = [];

function getSelectedFactorsFromUI() {
  const checkboxes = document.querySelectorAll('.factor-checkbox');
  return Array.from(checkboxes)
              .filter(checkbox => checkbox.checked)
              .map(checkbox => checkbox.value);
}

function updateMapWithFilters() {
  selectedFilters = getSelectedFactorsFromUI();
  geojsonLayer.setStyle(style); // Reapply style with new filters
}

// Add event listener to each checkbox
document.querySelectorAll('.factor-checkbox').forEach(checkbox => {
  checkbox.addEventListener('change', updateMapWithFilters);
});

