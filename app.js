// Initialize the map
const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -5
  });
  
  const bounds = [[0, 0], [1000, 1000]];
  map.fitBounds(bounds);
  
  const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmaWVyIjoiRVhUUkFLVU5FIiwidmVyc2lvbiI6InYyLjIuMCIsInJlc2V0X2RhdGUiOiIyMDI0LTEwLTA2IiwiaWF0IjoxNzI4NjM0NDgzLCJzdWIiOiJhZ2VudC10b2tlbiJ9.ds8W7Ztb-bkxARktjFW19nu3d3ZQNhpsl1WtPsX-d6qczbZJld9stiBwpcTfRlX1lUnJyFbS5Y9sEzMuacqt3DNk-SskSgu-JfdPuvdG26xouY-5qNioe_T2ACO1tjHTVBzOLbYQzehrShHw6Po2iA_hTo5rAzhCF7YyH4UcONobAnJdculvvWMuihNSg8-RLD3NJCll37QZaV8TYI38jSU8wfSFZovMInBGfsjgJ16waXoJp9ZxAKT29dyi2dzaeUIgEDO7kWulQ6xk1xJ7OboifVWujMpDPOe4_fRWdQZG86CnB7tG2NW061AjFQ_3jB4LHGdAjZtfzw2POBKgOA';
  
  // Layers
  const systemsLayer = L.layerGroup().addTo(map);
  const waypointsLayer = L.layerGroup().addTo(map);
  const shipsLayer = L.layerGroup().addTo(map);
  
  // Fetch and display systems
  fetch('https://api.spacetraders.io/v2/systems', {
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    }
  })
    .then(response => response.json())
    .then(data => {
      data.data.forEach(system => {
        addSystemToMap(system);
        addWaypointsToMap(system.symbol);
      });
    })
    .catch(error => console.error('Error fetching systems:', error));
  
  // Fetch and display player's ships
  fetch('https://api.spacetraders.io/v2/my/ships', {
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    }
  })
    .then(response => response.json())
    .then(data => {
      data.data.forEach(ship => {
        addShipToMap(ship);
      });
    })
    .catch(error => console.error('Error fetching ships:', error));
  
  function addSystemToMap(system) {
    const x = system.x + 500;
    const y = system.y + 500;
  
    const marker = L.circleMarker([y, x], {
      radius: 5,
      color: 'cyan'
    }).addTo(systemsLayer);
  
    marker.bindPopup(`
      <b>${system.symbol}</b><br>
      Type: ${system.type}<br>
      Coordinates: (${system.x}, ${system.y})
    `);
  }
  
  function addWaypointsToMap(systemSymbol) {
    fetch(`https://api.spacetraders.io/v2/systems/${systemSymbol}/waypoints`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    })
      .then(response => response.json())
      .then(data => {
        data.data.forEach(waypoint => {
          const x = waypoint.x + 500;
          const y = waypoint.y + 500;
  
          const marker = L.circleMarker([y, x], {
            radius: 3,
            color: 'yellow'
          }).addTo(waypointsLayer);
  
          marker.bindPopup(`
            <b>${waypoint.symbol}</b><br>
            Type: ${waypoint.type}<br>
            Coordinates: (${waypoint.x}, ${waypoint.y})
          `);
        });
      })
      .catch(error => console.error('Error fetching waypoints:', error));
  }
  
  function addShipToMap(ship) {
    const systemSymbol = ship.nav.systemSymbol;
    const waypointSymbol = ship.nav.waypointSymbol;
  
    // Fetch the waypoint data to get the ship's precise location
    fetch(`https://api.spacetraders.io/v2/systems/${systemSymbol}/waypoints/${waypointSymbol}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    })
      .then(response => response.json())
      .then(waypointData => {
        const x = waypointData.data.x + 500;
        const y = waypointData.data.y + 500;
  
        const shipIcon = L.icon({
          iconUrl: 'images/space-ship-icon.png', // Replace with your ship icon path
          iconSize: [25, 25],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12]
        });
  
        const marker = L.marker([y, x], { icon: shipIcon }).addTo(shipsLayer);
  
        marker.bindPopup(`
          <b>Ship: ${ship.symbol}</b><br>
          Role: ${ship.registration.role}<br>
          Location: ${systemSymbol} - ${waypointSymbol}
        `);
      })
      .catch(error => console.error('Error fetching waypoint data:', error));
  }
  
  // Layers control
  const overlays = {
    "Systems": systemsLayer,
    "Waypoints": waypointsLayer,
    "Ships": shipsLayer
  };
  
  L.control.layers(null, overlays).addTo(map);
  