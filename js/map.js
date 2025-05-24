var map = L.map('map').setView([31.2323437, 121.4691024], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


function style(feature) {
  const districtName = feature.properties.name;
  return {
    fillColor: getColor(districtName),
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



let data = {};
let weights = {};

Promise.all([
  fetch('js/rankings.json').then(res => res.json()),
  fetch('js/weights.json').then(res => res.json())
]).then(([rankingData, weightData]) => {
  data = rankingData;
  weights = weightData;
});


// function rankToColor(avgRank) {
//   const breaks = [5, 6, 7, 8, 9, 10, 11, 12];
//   if (avgRank <= breaks[0]) return "#7f2704";
//   if (avgRank <= breaks[1]) return "#a23503";
//   if (avgRank <= breaks[2]) return "#d94801";
//   if (avgRank <= breaks[3]) return "#fa8331";
//   if (avgRank <= breaks[4]) return "#fd9a4e";
//   if (avgRank <= breaks[5]) return "#fdcb9b";
//   if (avgRank <= breaks[6]) return "#feeddc";
//   return "#fff5eb";
// }

// function getColor(districtName) {
//   const district = data[districtName];
//   let weightedSum = 0;
//   let totalWeight = 0;

//   // First, compute the total weight including subweights
//   for (const factor in weights) {
//     const factorWeight = weights[factor];

//     if (typeof factorWeight === 'number') {
//       totalWeight += factorWeight;
//     } else if (typeof factorWeight === 'object') {
//       totalWeight += factorWeight.weight;
//     }
//   }

//   // Now apply normalized weights
//   for (const factor in weights) {
//     const factorWeight = weights[factor];

//     if (typeof factorWeight === 'number') {
//       const value = district.factors[factor] || 0;
//       const normWeight = factorWeight / totalWeight;
//       weightedSum += value * normWeight;
//     } else if (typeof factorWeight === 'object') {
//       const compositeWeight = factorWeight.weight;
//       const subweights = factorWeight.subweights;

//       // Normalize subweights
//       let subWeightSum = 0;
//       for (const sub in subweights) {
//         subWeightSum += subweights[sub];
//       }

//       let compositeValue = 0;
//       if (subWeightSum > 0) {
//         for (const sub in subweights) {
//           const subVal = district.factors[factor]?.[sub] || 0;
//           const subWeight = subweights[sub];
//           compositeValue += subVal * (subWeight / subWeightSum);  // normalize subweights
//         }
//       }

//       const normWeight = compositeWeight / totalWeight;
//       weightedSum += compositeValue * normWeight;
//     }
//   }

//   return rankToColor(weightedSum); // still use your breakpoints
// }


// function updateMapWithFilters() {
//   geojsonLayer.setStyle(style); // Reapply style with new filters
// }

function getColorScoreOnly(districtName) {
  const district = data[districtName];
  let weightedSum = 0;
  let totalWeight = 0;

  for (const factor in weights) {
    const factorWeight = weights[factor];

    if (typeof factorWeight === 'number') {
      weightedSum += (district.factors[factor] || 0) * factorWeight;
      totalWeight += factorWeight;
    } else if (typeof factorWeight === 'object') {
      const subweights = factorWeight.subweights;
      const compositeWeight = factorWeight.weight;
      let compositeValue = 0, subWeightSum = 0;

      for (const sub in subweights) {
        compositeValue += (district.factors[factor]?.subfactors?.[sub] || 0) * subweights[sub];
        subWeightSum += subweights[sub];
      }

      if (subWeightSum > 0) compositeValue /= subWeightSum;
      weightedSum += compositeValue * compositeWeight;
      totalWeight += compositeWeight;
    }
  }
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}
let quantileThresholds = [];

function updateMapWithFilters() {
  const scores = Object.keys(data).map(getColorScoreOnly).sort((a, b) => a - b);
  const n = scores.length;

  quantileThresholds = [];
  const steps = 8;
  for (let i = 1; i < steps; i++) {
    const index = Math.floor((i / steps) * n);
    quantileThresholds.push(scores[index]);
  }

  geojsonLayer.setStyle(style);  // refresh styles
}

function rankToColor(score) {
  if (score <= quantileThresholds[0]) return "#fff5eb";
  if (score <= quantileThresholds[1]) return "#feeddc";
  if (score <= quantileThresholds[2]) return "#fdcb9b";
  if (score <= quantileThresholds[3]) return "#fd9a4e";
  if (score <= quantileThresholds[4]) return "#fa8331";
  if (score <= quantileThresholds[5]) return "#d94801";
  if (score <= quantileThresholds[6]) return "#a23503";
  return "#7f2704";
}

function getColor(districtName) {
  const score = getColorScoreOnly(districtName);
  return rankToColor(score);
}

function updateWeight(factor, value, isComposite = false) {
  if (isComposite) {
    weights[factor].weight = parseFloat(value);
  } else {
    weights[factor] = parseFloat(value);
  }
  updateMapWithFilters();
}

function updateSubWeight(factor, subfactor, value) {
  weights[factor].subweights[subfactor] = parseFloat(value);
  updateMapWithFilters();
}

