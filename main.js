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

  const response = await axios.post('https://localhost:7245/api/Point', pointData);
}

/*async function updatePointInDatabase(id, lat, lon) {
  const response = await axios({
    method: 'PUT',
    url:'https://localhost:7245/api/Point/${id}',
  });
}*/


// Function to add a marker to the map
function addMarker(lat, lon) {

  console.log(`Adding marker at Latitude: ${lat}, Longitude: ${lon}`);

  const iconFeature = new Feature({
    geometry: new Point(fromLonLat([lon, lat])),
    id: pointID
  });

  const iconStyle = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: 'Assets/pin.png', 
      scale: 0.1
    }),
  });

  iconFeature.setStyle(iconStyle);

  const vectorSource = new VectorSource({
    features: [iconFeature],
  });

  const vectorLayer = new VectorLayer({
    source: vectorSource,
  });

  map.addLayer(vectorLayer);
  const name = prompt("Enter a name for this point:");
  if (name) {
        // Send the point to the backend with the name
        sendPointToDatabase(name, lat, lon);
    } else {
        alert("No name entered. The point was not saved to the database.");
    }
}


/*const modify = new Modify({ source: vectorSource }); 
map.addInteraction(modify);


modify.on('modifyend', function (event) {
  event.features.forEach(function (feature) {
      const newCoordinates = feature.getGeometry().getCoordinates();
      const [newLon, newLat] = toLonLat(newCoordinates);  // Convert to LonLat if needed

      updatePointInDatabase(feature.getId(), newLat, newLon);
  });
});
*/


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


 
Pquery.addEventListener('click', async function(){
 
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
    content: `
    <div id="data-table-container" style="padding: 15px;">
      <table id="data-table" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th></th>
            <th>ID</th>
            <th>Name</th>
            <th>Wkt</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="data-table-body">
          <!-- Rows -->
        </tbody>
      </table>
    </div>
  `,
  callback: function () {
    fetchAndDisplayData();
  }

    
  });
  
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


