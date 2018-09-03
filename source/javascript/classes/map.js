

const MapManager = (($) => {
  let LANGUAGE = 'en';

  const renderEvent = (item, referrer = null, source = null) => {

    let m = moment(new Date(item.start_datetime));
    m = m.utc().subtract(m.utcOffset(), 'm');

    var date = m.format("dddd MMM DD, h:mma");
    let url = item.url.match(/^https{0,1}:/) ? item.url : "//" + item.url;

    url = Helper.refSource(url, referrer, source);

    let superGroup = window.slugify(item.supergroup);
    return `
    <div class='popup-item ${item.event_type} ${superGroup}' data-lat='${item.lat}' data-lng='${item.lng}'>
      <div class="type-event">
        <ul class="event-types-list">
          <li class="tag tag-${item.event_type}">${item.event_type || 'Action'}</li>
        </ul>
        <h2 class="event-title"><a href="${url}" target='_blank'>${item.title}</a></h2>
        <div class="event-date">${date}</div>
        <div class="event-address address-area">
          <p>${item.venue}</p>
        </div>
        <div class="call-to-action">
          <a href="${url}" target='_blank' class="btn btn-secondary">RSVP</a>
        </div>
      </div>
    </div>
    `
  };

  const renderGroup = (item, referrer = null, source = null) => {

    let url = item.website.match(/^https{0,1}:/) ? item.website : "//" + item.website;

    url = Helper.refSource(url, referrer, source);

    let superGroup = window.slugify(item.supergroup);
    return `
    <li>
      <div class="type-group group-obj ${superGroup}">
        <ul class="event-types-list">
          <li class="tag tag-${item.supergroup} ${superGroup}">${item.supergroup}</li>
        </ul>
        <div class="group-header">
          <h2><a href="${url}" target='_blank'>${item.name}</a></h2>
          <div class="group-location location">${item.location}</div>
        </div>
        <div class="group-details-area">
          <div class="group-description">
            <p>${item.description}</p>
          </div>
        </div>
        <div class="call-to-action">
          <a href="${url}" target='_blank' class="btn btn-secondary">Get Involved</a>
        </div>
      </div>
    </li>
    `
  };

  const renderGeojson = (list, ref = null, src = null) => {
    return list.map((item) => {
      // rendered eventType
      let rendered;

      if (item.event_type && item.event_type.toLowerCase() == 'group') {
        rendered = renderGroup(item, ref, src);

      } else {
        rendered = renderEvent(item, ref, src);
      }

      // format check
      if (isNaN(parseFloat(parseFloat(item.lng)))) {
        item.lng = item.lng.substring(1)
      }
      if (isNaN(parseFloat(parseFloat(item.lat)))) {
        item.lat = item.lat.substring(1)
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

  return (options) => {
    var accessToken = 'pk.eyJ1IjoibWF0dGhldzM1MCIsImEiOiJaTVFMUkUwIn0.wcM3Xc8BGC6PM-Oyrwjnhg';
    var map = L.map('map', { dragging: !L.Browser.mobile }).setView([34.88593094075317, 5.097656250000001], 2);

    let {referrer, source} = options;

    if (!L.Browser.mobile) {
      map.scrollWheelZoom.disable();
    }

    LANGUAGE = options.lang || 'en';

    if (options.onMove) {
      map.on('dragend', (event) => {


        let sw = [map.getBounds()._southWest.lat, map.getBounds()._southWest.lng];
        let ne = [map.getBounds()._northEast.lat, map.getBounds()._northEast.lng];
        options.onMove(sw, ne);
      }).on('zoomend', (event) => {
        if (map.getZoom() <= 4) {
          $("#map").addClass("zoomed-out");
        } else {
          $("#map").removeClass("zoomed-out");
        }

        let sw = [map.getBounds()._southWest.lat, map.getBounds()._southWest.lng];
        let ne = [map.getBounds()._northEast.lat, map.getBounds()._northEast.lng];
        options.onMove(sw, ne);
      })
    }

    // map.fireEvent('zoomend');

    L.tileLayer('https://api.mapbox.com/styles/v1/matthew350/cja41tijk27d62rqod7g0lx4b/tiles/256/{z}/{x}/{y}?access_token=' + accessToken, {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors • <a href="//350.org">350.org</a>'
    }).addTo(map);

    let geocoder = null;
    return {
      $map: map,
      initialize: (callback) => {
        geocoder = new google.maps.Geocoder();
        if (callback && typeof callback === 'function') {
            callback();
        }
      },
      setBounds: (bounds1, bounds2) => {

        const bounds = [bounds1, bounds2];
        map.fitBounds(bounds, { animate: false});
      },
      setCenter: (center, zoom = 10) => {
        if (!center || !center[0] || center[0] == ""
              || !center[1] || center[1] == "") return;
        map.setView(center, zoom);
      },
      getBounds: () => {

        let sw = [map.getBounds()._southWest.lat, map.getBounds()._southWest.lng];
        let ne = [map.getBounds()._northEast.lat, map.getBounds()._northEast.lng];

        return [sw, ne];
      },
      // Center location by geocoded
      getCenterByLocation: (location, callback) => {

        geocoder.geocode({ address: location }, function (results, status) {

          if (callback && typeof callback === 'function') {
            callback(results[0])
          }
        });
      },
      triggerZoomEnd: () => {
        map.fireEvent('zoomend');
      },
      zoomOutOnce: () => {
        map.zoomOut(1);
      },
      zoomUntilHit: () => {
        var $this = this;
        map.zoomOut(1);
        let intervalHandler = null;
        intervalHandler = setInterval(() => {
          var _visible = $(document).find('ul li.event-obj.within-bound, ul li.group-obj.within-bound').length;
          if (_visible == 0) {
            map.zoomOut(1);
          } else {
            clearInterval(intervalHandler);
          }
        }, 200);
      },
      refreshMap: () => {
        map.invalidateSize(false);
        // map._onResize();
        // map.fireEvent('zoomend');


      },
      filterMap: (filters) => {

        $("#map").find(".event-item-popup").hide();


        if (!filters) return;

        filters.forEach((item) => {

          $("#map").find(".event-item-popup." + item.toLowerCase()).show();
        })
      },
      plotPoints: (list, hardFilters, groups) => {
        const keySet = !hardFilters.key ? [] : hardFilters.key.split(',');

        if (keySet.length > 0) {
          list = list.filter((item) => keySet.includes(item.event_type))
        }


        const geojson = {
          type: "FeatureCollection",
          features: renderGeojson(list, referrer, source)
        };


        L.geoJSON(geojson, {
            pointToLayer: (feature, latlng) => {
              // Icons for markers
              const eventType = feature.properties.eventProperties.event_type;

              // If no supergroup, it's an event.
              const supergroup = groups[feature.properties.eventProperties.supergroup] ? feature.properties.eventProperties.supergroup : "Events";
              const slugged = window.slugify(supergroup);



              let iconUrl;
              const isPast = new Date(feature.properties.eventProperties.start_datetime) < new Date();
              if (eventType == "Action") {
                iconUrl = isPast ? "/img/past-event.png" : "/img/event.png";
              } else {
                iconUrl = groups[supergroup] ? groups[supergroup].iconurl || "/img/event.png"  : "/img/event.png" ;
              }



              const smallIcon =  L.icon({
                iconUrl: iconUrl,
                iconSize: [18, 18],
                iconAnchor: [9, 9],
                className: slugged + ' event-item-popup ' + (isPast&&eventType == "Action"?"event-past-event":"")
              });


              var geojsonMarkerOptions = {
                icon: smallIcon,
              };
              return L.marker(latlng, geojsonMarkerOptions);
            },

          onEachFeature: (feature, layer) => {
            if (feature.properties && feature.properties.popupContent) {
              layer.bindPopup(feature.properties.popupContent);
            }

            const isPast = new Date(feature.properties.eventProperties.start_datetime) < new Date();
            const eventType = feature.properties.eventProperties.event_type;
            // console.log(feature, isPast&&eventType == "Action")
            if (!(isPast&&eventType == "Action")) {
              console.log(layer, layer._bringToFront);
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
