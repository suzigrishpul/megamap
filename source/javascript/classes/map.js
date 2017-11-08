
const MapManager = (($) => {

  const renderEvent = (item) => {
    var date = moment(item.start_datetime).format("dddd • MMM DD h:mma");
    return `
    <div class='popup-item ${item.event_type}' data-lat='${item.lat}' data-lng='${item.lng}'>
      <div class="type-event">
        <ul class="event-types-list">
          <li>${item.event_type}</li>
        </ul>
        <h2><a href="//${item.url}" target='_blank'>${item.title}</a></h2>
        <h4>${date}</h4>
        <div class="address-area">
          <p>${item.venue}</p>
        </div>
        <div class="call-to-action">
          <a href="//${item.url}" target='_blank' class="btn btn-primary">RSVP</a>
        </div>
      </div>
    </div>
    `
  };

  const renderGroup = (item) => {
    return `
    <div class='popup-item ${item.event_type}' data-lat='${item.lat}' data-lng='${item.lng}'>
      <div class="type-group">
        <h2><a href="/" target='_blank'>${item.title || `Group`}</a></h2>
        <div class="group-details-area">
          <p>Colorado, USA</p>
          <p>${item.details || `350 Colorado is working locally to help build the global
             350.org movement to solve the climate crisis and transition
             to a clean, renewable energy future.`}
          </p>
        </div>
        <div class="call-to-action">
          <a href="//${item.url}" target='_blank' class="btn btn-primary">Get Involved</a>
        </div>
      </div>
    </div>
    `
  };

  const renderGeojson = (list) => {
    return list.map((item) => {
      return {
        "type": "Feature",
        geometry: {
          type: "Point",
          coordinates: [item.lng, item.lat]
        },
        properties: {
          eventProperties: item,
          popupContent: item.event_type.toLowerCase() ==='group' ? renderGroup(item) : renderEvent(item)
        }
      }
    })
  }

  return () => {
    var map = L.map('map').setView([34.88593094075317, 5.097656250000001], 2);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors • <a href="//350.org">350.org</a>'
    }).addTo(map);

    // map.fitBounds([ [[40.7216015197085, -73.85174698029152], [40.7242994802915, -73.8490490197085]] ]);
    return {
      $map: map,
      setBounds: (bounds1, bounds2) => {
        const bounds = [bounds1, bounds2];
        map.fitBounds(bounds);
      },
      setCenter: (center, zoom = 10) => {
        if (!center || !center[0] || center[0] == ""
              || !center[1] || center[1] == "") return;
        map.setView(center, zoom);
      },
      plotPoints: (list) => {
        console.log(list);
        const geojson = {
          type: "FeatureCollection",
          features: renderGeojson(list)
        };

        console.log(JSON.stringify(geojson));

        L.geoJSON(geojson, {
            pointToLayer: (feature, latlng) => {
              console.log(feature, latlng);
              var geojsonMarkerOptions = {
                  radius: 8,
                  fillColor: feature.properties.eventProperties.event_type === 'Group' ? "#40D7D4" : "#0F81E8",
                  color: "white",
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 0.8
              };
              return L.circleMarker(latlng, geojsonMarkerOptions);
            },

          onEachFeature: (feature, layer) => {
            if (feature.properties && feature.properties.popupContent) {
              layer.bindPopup(feature.properties.popupContent);
            }
          }
        }).addTo(map);

      },
      update: (p) => {
        if (!p || !p.lat || !p.lng ) return;

        map.setView(L.latLng(p.lat, p.lng), 10);
      }
    };
  }
})(jQuery);
