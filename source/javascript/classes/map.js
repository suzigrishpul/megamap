
const MapManager = (($) => {

  const renderEvent = (item) => {
    var date = moment(item.start_datetime).format("dddd MMM DD, h:mma");
    return `
    <div class='popup-item ${item.event_type}' data-lat='${item.lat}' data-lng='${item.lng}'>
      <div class="type-event">
        <ul class="event-types-list">
          <li class="tag tag-${item.event_type}">${item.event_type || 'Action'}</li>
        </ul>
        <h2 class="event-title"><a href="//${item.url}" target='_blank'>${item.title}</a></h2>
        <div class="event-date">${date}</div>
        <div class="event-address address-area">
          <p>${item.venue}</p>
        </div>
        <div class="call-to-action">
          <a href="//${item.url}" target='_blank' class="btn btn-secondary">RSVP</a>
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
          <a href="//${item.url}" target='_blank' class="btn btn-secondary">Get Involved</a>
        </div>
      </div>
    </div>
    `
  };

  const renderGeojson = (list) => {
    return list.map((item) => {
      // rendered eventType
      let rendered;
      if (!item.event_type || !item.event_type.toLowerCase() !== 'group') {
        rendered = renderEvent(item);
      } else {
        rendered = renderGroup(item);
      }

      return {
        "type": "Feature",
        geometry: {
          type: "Point",
          coordinates: [item.lng, item.lat]
        },
        properties: {
          eventProperties: item,
          popupContent: rendered
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
      filterMap: (filters) => {
        console.log("filters >> ", filters);
        $("#map").find(".event-item-popup").hide();
        console.log($("#map").find(".event-item-popup"));

        if (!filters) return;

        filters.forEach((item) => {
          console.log(".event-item-popup." + item.toLowerCase());
          $("#map").find(".event-item-popup." + item.toLowerCase()).show();
        })
      },
      plotPoints: (list) => {

        const geojson = {
          type: "FeatureCollection",
          features: renderGeojson(list)
        };



        L.geoJSON(geojson, {
            pointToLayer: (feature, latlng) => {
              const eventType = feature.properties.eventProperties.event_type;
              var geojsonMarkerOptions = {
                  radius: 8,
                  fillColor:  eventType === 'Group' ? "#40D7D4" : "#0F81E8",
                  color: "white",
                  weight: 2,
                  opacity: 0.5,
                  fillOpacity: 0.8,
                  className: (eventType === 'Group' ? 'groups' : 'events') + ' event-item-popup'
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
