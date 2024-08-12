import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import Draw from 'ol/interaction/Draw';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import axios from 'axios';
import Modify from 'ol/interaction/Modify';


const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: fromLonLat([35, 39]),
    zoom: 6.5
  })
});

fetchPointsAndAddMarkers();



const AddPoint = document.getElementById("btn1");
const Pquery = document.getElementById("btn2");
const AddPolygon = document.getElementById("btn3");
const PolygonQuery = document.getElementById("btn4");

let draw;

async function sendPointToDatabase(name, lat, lon) {
  const wkt = `POINT(${lon} ${lat})`; 

  const pointData = {
      name: name,
      wkt: wkt
  };

  if (id) {
    // Update existing point
    await axios.put(`https://localhost:7245/api/Point/${id}`, pointData);
  } else {
    // Create new point
    await axios.post('https://localhost:7245/api/Point', pointData);
  }

}

async function fetchPoints(){
 try{
   const response = await axios.get('https://localhost:7245/api/Point/GetAllJSON');
   if (response.status === 200) {
    const data = response.data.data; // Access the 'data' field in the response

    console.log("Data fetched:", data); // Log the data to verify its structure

    return data;
  } else {
    console.error(`Failed to fetch data: ${response.status}`);
    return [];
  }
} catch (error) {
  console.error('Error fetching data:', error);
  return [];
}
}

async function fetchPointsAndAddMarkers() {
  try {
    const points = await fetchPoints();
    
    points.forEach(point => {
      // Extract coordinates from WKT format
      const wkt = point.wkt;

      // Check if WKT is a valid POINT type
      if (wkt && wkt.startsWith('POINT')) {
        const wktCoords = wkt.match(/\(([^)]+)\)/);
        
        if (wktCoords && wktCoords[1]) {
          const coords = wktCoords[1].split(' ');
          const lon = parseFloat(coords[0]);
          const lat = parseFloat(coords[1]);

          if (!isNaN(lat) && !isNaN(lon)) {
            // Add marker to the map
            addMarker(lat, lon, false);
          } else {
            console.error(`Invalid coordinates: ${coords}`);
          }
        } else {
          console.error(`Failed to parse coordinates from WKT: ${wkt}`);
        }
      } 
    });
  } catch (error) {
    console.error('Error fetching and adding points:', error);
  }
}




/*async function updatePointInDatabase(id, lat, lon) {
  const response = await axios({
    method: 'PUT',
    url:'https://localhost:7245/api/Point/${id}',
  });
}*/

let markers = [];

let vectorSource = new VectorSource();

// Function to add a marker to the map
function addMarker(lat, lon, askName = true) {

  console.log(`Adding marker at Latitude: ${lat}, Longitude: ${lon}`);

  const iconFeature = new Feature({
    geometry: new Point(fromLonLat([lon, lat])),
  });

  const iconStyle = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: 'Assets/pin.png', 
      scale: 0.1
    }),
  });

  iconFeature.setStyle(iconStyle);

  vectorSource.addFeature(iconFeature);

  const vectorLayer = new VectorLayer({
    source: vectorSource,
  });

  map.addLayer(vectorLayer);
 
// Generate an ID for the marker
const markerId = Math.floor(Math.random() * 1000000);

// Store the feature and ID
markers.push({ id: markerId, feature: iconFeature });



  if(askName){
  const name = prompt("Enter a name for this point:");
  if (name) {
        // Send the point to the backend with the name
        sendPointToDatabase(name, lat, lon);
    } else {
        alert("No name entered. The point was not saved to the database.");
    }
  }
}


function removeMarkerFromMap(pointId) {
  // Find and remove the corresponding marker layer
  const markerIndex = markers.findIndex(marker => marker.id === pointId);
  if (markerIndex > -1) {
    const marker = markers[markerIndex];
    map.removeLayer(marker.layer);
    markers.splice(markerIndex, 1); // Remove from list
  }
}


const modify = new Modify({ source: vectorSource }); 
map.addInteraction(modify);


modify.on('modifyend', async function (event) {
  event.features.forEach(async function (feature) {
    const newCoordinates = feature.getGeometry().getCoordinates();
    const [newLon, newLat] = toLonLat(newCoordinates); 

    // Find the marker ID
    const marker = markers.find(marker => marker.feature === feature);
    if (marker && marker.id) {
      try {
        await sendPointToDatabase(marker.name, newLat, newLon, marker.id);
      } catch (error) {
        console.error('Error updating point:', error);
      }
    }
  });
});


const polygonStyle = new Style({
  fill: new Fill({
    color: 'rgba(21, 126, 236, 0.5)', 
  }),
  stroke: new Stroke({
    color: '#157DEC', 
    width: 2, 
  }),
});

// Function to start drawing a polygon
function addPolygon() {
  // Vector source to hold the drawn features
  const source = new VectorSource({wrapX: false});

  // Vector layer to display the drawn polygon
  const vectorLayer = new VectorLayer({
    source: source,
    style: polygonStyle,
  });

  map.addLayer(vectorLayer);


  draw = new Draw({
    source: source,
    type: 'Polygon',
  });

  map.addInteraction(draw);

// Event listener to handle the end of the drawing
draw.on('drawend', function (event) {
  console.log('Polygon drawn:', event.feature.getGeometry().getCoordinates());
  map.removeInteraction(draw); // Removes the interaction after drawing is complete
});
}




AddPoint.addEventListener('click', function(){
  const choice = prompt("Do you wish to add a point on the map or by entering the coordinates? Type 'map' for manual and 'coordinates' for entering coordinates.");

if (choice.toLowerCase() == "map"){
  alert('Click on the map to add a point.');
  map.once('click', function (event) {
    console.log("Map clicked");
    const coordinate = toLonLat(event.coordinate);
    console.log(`Map clicked at Longitude: ${coordinate[0]}, Latitude: ${coordinate[1]}`);
    addMarker(coordinate[1], coordinate[0]);
    

  });

  
}
 else if(choice.toLowerCase()== "coordinates") {
   var lat = parseFloat(prompt("Enter y coordinate (latitude):"));
  var lon = parseFloat(prompt("Enter x coordinate (longitude):"));
  if (!isNaN(lat) && !isNaN(lon)) {
      addMarker(lat, lon);
      

  } else {
      alert("Invalid coordinates. Please enter valid numbers.");
  }
} 
 else {
  alert("Invalid choice. Please enter 'map' or 'coordinates'.");
}


});


function generateTable(data) {
  if (data.length === 0) {
    return '<p>No data available.</p>';
  }

  let tableHTML = `
<style>
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        padding: 10px;
        text-align: left;
      }
      th {
        background-color: #333;
        color: #fff;
      }
      tr:nth-child(even) {
        background-color: #f2f2f2;
      }
      tr:hover {
        background-color: #ddd;
      }
      td:last-child {
        text-align: center;
        border: none;
      }
      .actions-cell {
        display: flex;
        justify-content: space-around;
      }
      .actions-cell button {
        margin: 0;
        padding: 5px 10px;
        border: none;
        border-radius: 3px;
        cursor: pointer;
      }
      
    </style>

    <table border="1" style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>WKT</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
  `;
  data.forEach(point => {
    tableHTML += `
      <tr>
        <td>${point.id}</td>
        <td>${point.name}</td>
        <td>${point.wkt}</td>
        <td>
            <button class="btn-show" data-id="${point.id}">Show</button>
            <button class="btn-update-map" data-id="${point.id}">Update On Map</button>
            <button class="btn-update-coords" data-id="${point.id}">Update with Coordinates</button>
            <button id="deletebtn" class="btn-delete" data-id="${point.id}">Delete</button>
          </td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
  `;

  return tableHTML;
}
 
Pquery.addEventListener('click', async function(){

  const points = await fetchPoints();
  const tableHTML = generateTable(points);

  jsPanel.create( {
    closeOnEscape: true,
    theme: 'dark',
    headerTitle: 'Point Query',
    panelSize: {
        width: () => { return Math.min(800, window.innerWidth*0.9);},
        height: () => { return Math.min(500, window.innerHeight*0.6);}
    },
    animateIn: 'jsPanelFadeIn',
    onwindowresize: true,
    borderRadius:'.5rem',
    content: tableHTML,

  });


  /*panel.getElementById("deletebtn").addEventListener('click', async (event) => {
    console.log('Click event detected');
    if (event.target.classList.contains('btn-delete')) {
      console.log('Delete button clicked');
      const pointId = event.target.dataset.id;
      console.log(`Deleting point with ID: ${pointId}`);
      
      try {
        // Send delete request to the backend
        await axios.delete(`https://localhost:7245/api/Point/${pointId}`);
        
        // Remove point marker from the map
        removeMarkerFromMap(pointId);
        
        // Refresh the points and table
        const updatedPoints = await fetchPoints();
        panel.setContent(generateTable(updatedPoints));
      } catch (error) {
        console.error('Error deleting point:', error);
      }
    }
  });*/

});




AddPolygon.addEventListener('click', function() {
  addPolygon();
});

PolygonQuery.addEventListener('click', function(){
  jsPanel.create( {
    closeOnEscape: true,
    theme: 'dark',
    headerTitle: 'Point Query',
    panelSize: {
        width: () => { return Math.min(800, window.innerWidth*0.9);},
        height: () => { return Math.min(500, window.innerHeight*0.6);}
    },
    animateIn: 'jsPanelFadeIn',
    onwindowresize: true,
    borderRadius:'.5rem',
    content: `<h4>Polygon Name</h4>
    <p>To be polygon wkt data</p>
    <button>Show</button>
    <button>Update</button>
    <button>Delete</button>
    `,

    
  } );
  
});


