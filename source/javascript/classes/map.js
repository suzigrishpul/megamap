

const MapManager = (($) => {
  let LANGUAGE = 'en';

  const popup = new mapboxgl.Popup({
    closeOnClick: false
  });

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

  const renderAnnotationPopup = (item) => {
    return `
    <div class='popup-item annotation' data-lat='${item.lat}' data-lng='${item.lng}'>
      <div class="type-event">
        <ul class="event-types-list">
          <li class="tag tag-annotation">Annotation</li>
        </ul>
        <h2 class="event-title">${item.name}</h2>
        <div class="event-address address-area">
          <p>${item.description}</p>
        </div>
      </div>
    </div>
    `;
  }


  const renderAnnotationsGeoJson = (list) => {
    return list.map((item) => {
      const rendered = renderAnnotationPopup(item);
      return {
        "type": "Feature",
        geometry: {
          type: "Point",
          coordinates: [item.lng, item.lat]
        },
        properties: {
          annotationProps: item,
          popupContent: rendered
        }
      }
    })
  }

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

  const getEventGeojson = (targets, referrer=null, source=null) => {
          return ({
              "type": "FeatureCollection",
              "features": targets
                            .sort((x,y) => d3.descending(new Date(x.start_datetime), new Date(y.start_datetime)))
                            .map(item => (
                              {
                                "type": "Feature",
                                "properties": {
                                  "id": `${item.lng}-${item.lat}`,
                                  "description":  renderEvent(item, referrer, source),
                                  "is_past": new Date(item.start_datetime) < new Date() ? 'yes' : 'no'
                                },
                                "geometry": {
                                  "type": "Point",
                                  "coordinates": [item.lng, item.lat]
                                }
                              })
                            )
            });
        };
  const getGroupGeojson = (targets, referrer=null, source=null) => {
    return {
          "type": "FeatureCollection",
          "features": targets
                        .map(item => (
                          {
                            "type": "Feature",
                            "properties": {
                              "id": `${item.lng}-${item.lat}`,
                              "description":  renderGroup(item)
                            },
                            "geometry": {
                              "type": "Point",
                              "coordinates": [item.lng, item.lat]
                            }
                          })
                        )
        };
  };

  return (options) => {
    var accessToken = 'pk.eyJ1IjoibWF0dGhldzM1MCIsImEiOiJaTVFMUkUwIn0.wcM3Xc8BGC6PM-Oyrwjnhg';
    var map = L.map('map-proper', { dragging: !L.Browser.mobile }).setView([34.88593094075317, 5.097656250000001], 2);


    mapboxgl.accessToken = 'pk.eyJ1IjoibWF0dGhldzM1MCIsImEiOiJaTVFMUkUwIn0.wcM3Xc8BGC6PM-Oyrwjnhg';
    map = new mapboxgl.Map({
      container: 'map-proper',
      style: 'mapbox://styles/matthew350/cja41tijk27d62rqod7g0lx4b',
      doubleClickZoom: false,
      center: [34.88593094075317, 5.097656250000001],
      zoom: 1.5
    });

    let {referrer, source} = options;

    // if (!L.Browser.mobile) {
    //   map.scrollWheelZoom.disable();
    // }

    LANGUAGE = options.lang || 'en';

    if (options.onMove) {
      map.on('dragend', (event) => {

        const bnd = map.getBounds();
        let sw = [bnd._sw.lat, bnd._sw.lng];
        let ne = [bnd._ne.lat, bnd._ne.lng];
        options.onMove(sw, ne);
      }).on('zoomend', (event) => {
        if (map.getZoom() <= 4) {
          $("#map").addClass("zoomed-out");
        } else {
          $("#map").removeClass("zoomed-out");
        }

        const bnd = map.getBounds();
        let sw = [bnd._sw.lat, bnd._sw.lng];
        let ne = [bnd._ne.lat, bnd._ne.lng];
        options.onMove(sw, ne);
      })

    }

    // map.fireEvent('zoomend');

    // L.tileLayer('https://api.mapbox.com/styles/v1/matthew350/cja41tijk27d62rqod7g0lx4b/tiles/256/{z}/{x}/{y}?access_token=' + accessToken, {
    //     attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors • <a href="//350.org">350.org</a>'
    // }).addTo(map);

    // console.log(window.queries['twilight-zone'], window.queries['twilight-zone'] === "true");
    if(window.queries['twilight-zone']) {
      L.terminator().addTo(map)
    }

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

        // const bounds = [bounds1, bounds2];
        const bounds = [bounds1.reverse(), bounds2.reverse()]; // mapbox
        map.fitBounds(bounds, { animate: false});
      },
      setCenter: (center, zoom = 10) => {
        if (!center || !center[0] || center[0] == ""
              || !center[1] || center[1] == "") return;
        map.setView(center, zoom);
      },
      getBounds: () => {

        const bnd = map.getBounds()
        let sw = [bnd._sw.lat, bnd._sw.lng];
        let ne = [bnd._ne.lat, bnd._ne.lng];

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
        // map.fireEvent('zoomend');
      },
      zoomOutOnce: () => {
        map.zoomOut(1);
      },
      zoomUntilHit: () => {
        var $this = this;
        map.zoomOut(1);
        let intervalHandler = null;
        intervalHandler = setInterval(() => {
          var _visible = $(document).find('ul li.event-obj, ul li.group-obj').length;
          if (_visible == 0) {
            map.zoomOut(1);
          } else {
            clearInterval(intervalHandler);
          }
        }, 200);
      },
      refreshMap: () => {
        //  map.invalidateSize(false);
        // map._onResize();
        // map.fireEvent('zoomend');


      },
      filterMap: (filters) => {

        // TODO mapbox this.
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

        // Color the map
        for (let i in groups) {
          const group = groups[i];
          const targets = list.filter(item =>
                                              item.event_type == "group"
                                                ? item.supergroup == group.supergroup
                                                : item.event_type == window.slugify(group.supergroup));



            // item.categories == "blockwalk";
          if (i == "Events") {
            const geojson =getEventGeojson(targets, referrer, source);
            map.addLayer({
              "id": "events",
              "type": "circle",
              "source": {
                "type": "geojson",
                "data": geojson
              },
              "paint": {
                "circle-radius": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    8,
                    3,
                    13,
                    6
                ],
                "circle-color": ['case',
                                    ['==', ['get', 'is_past'], 'yes'],
                                    "#BBBBBB",
                                    "#40d7d4"
                                ],
                "circle-opacity": 0.9,
                "circle-stroke-width": 2,
                "circle-stroke-color": "white",
                "circle-stroke-opacity": 1
              }
            });
          } else {
            const geojson = getGroupGeojson(targets, group, referrer, source);
            let icon = null;
            if (i == "Local Groups") {
              icon = "/img/group.png";
            } else if ( i == "Regional Hubs") {
              icon = "/img/flag.png";
            }
            map.loadImage(icon, (error,groupIcon) => {

              map.addImage(`${window.slugify(i)}-icon`, groupIcon);
              map.addLayer({
                "id": window.slugify(i),
                "type": "symbol",
                "source": {
                  "type": "geojson",
                  "data": geojson
                },
                "layout": {
                  'icon-allow-overlap': true,
                  'icon-ignore-placement': true,
                  'text-ignore-placement': true,
                  'text-allow-overlap': true,
                  "icon-image": `${window.slugify(i)}-icon`,
                  "icon-size": [
                      "interpolate",
                      ["linear"],
                      ["zoom"],
                      4,
                      0.09,
                      9,
                      0.15
                  ]
                }
              })
            });
          }

          map.on("click", window.slugify(i), (e) => {
            var coordinates = e.features[0].geometry.coordinates.slice();
            var description = e.features[0].properties.description;
            popup.setLngLat(coordinates)
                  .setHTML(description)
                  .addTo(map)
          });
        }
      },
      _oldPlotPoints: (list, hardFilters, groups) => {
        const keySet = !hardFilters.key ? [] : hardFilters.key.split(',');
        if (keySet.length > 0) {
          list = list.filter((item) => keySet.includes(item.event_type))
        }
        const geojson = {
          type: "FeatureCollection",
          features: renderGeojson(list, referrer, source)
        };
        const eventsLayer = L.geoJSON(geojson, {
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
          }
        });

        eventsLayer.addTo(map);
        // eventsLayer.bringToBack();


        // Add Annotations
        if (window.queries.annotation) {
          const annotations = !window.EVENTS_DATA.annotations ? [] : window.EVENTS_DATA.annotations.filter((item)=>item.type===window.queries.annotation);

          const annotIcon =  L.icon({
            iconUrl: "/img/annotation.png",
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            className: 'annotation-popup'
          });
          const annotMarkers = annotations.map(item => {
              return L.marker([item.lat, item.lng], {icon: annotIcon})
                        .bindPopup(renderAnnotationPopup(item));
              });
          // annotLayer.bringToFront();

          // const annotLayerGroup = ;

          const annotLayerGroup = map.addLayer(L.featureGroup(annotMarkers));
          // annotLayerGroup.bringToFront();
          // annotMarkers.forEach(item => {
          //   item.addTo(map);
          //   item.bringToFront();
          // })
        }
      },
      update: (p) => {
        if (!p || !p.lat || !p.lng ) return;

        map.setView(L.latLng(p.lat, p.lng), 10);
      }
    };
  }
})(jQuery);
