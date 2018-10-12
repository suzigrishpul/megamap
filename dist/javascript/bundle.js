"use strict";
//API :AIzaSyBujKTRw5uIXp_NHZgjYVDtBy1dbyNuGEM

var AutocompleteManager = function ($) {
  //Initialization...

  return function (target) {

    var API_KEY = "AIzaSyBujKTRw5uIXp_NHZgjYVDtBy1dbyNuGEM";
    var targetItem = typeof target == "string" ? document.querySelector(target) : target;
    var queryMgr = QueryManager();
    var geocoder = new google.maps.Geocoder();

    return {
      $target: $(targetItem),
      target: targetItem,
      forceSearch: function forceSearch(q) {
        geocoder.geocode({ address: q }, function (results, status) {
          if (results[0]) {
            var geometry = results[0].geometry;
            queryMgr.updateViewport(geometry.viewport);
            $(targetItem).val(results[0].formatted_address);
          }
          // var geometry = datum.geometry;
          // queryMgr.updateViewport(geometry.viewport);
        });
      },
      initialize: function initialize() {
        $(targetItem).typeahead({
          hint: true,
          highlight: true,
          minLength: 4,
          classNames: {
            menu: 'tt-dropdown-menu'
          }
        }, {
          name: 'search-results',
          display: function display(item) {
            return item.formatted_address;
          },
          limit: 10,
          source: function source(q, sync, async) {
            geocoder.geocode({ address: q }, function (results, status) {
              async(results);
            });
          }
        }).on('typeahead:selected', function (obj, datum) {
          if (datum) {

            var geometry = datum.geometry;
            queryMgr.updateViewport(geometry.viewport);
            //  map.fitBounds(geometry.bounds? geometry.bounds : geometry.viewport);
          }
        });
      }
    };

    return {};
  };
}(jQuery);
"use strict";

var Helper = function ($) {
  return {
    refSource: function refSource(url, ref, src) {
      // Jun 13 2018 — Fix for source and referrer
      if (ref || src) {
        if (url.indexOf("?") >= 0) {
          url = url + "&referrer=" + (ref || "") + "&source=" + (src || "");
        } else {
          url = url + "?referrer=" + (ref || "") + "&source=" + (src || "");
        }
      }

      return url;
    }
  };
}(jQuery);
"use strict";

var LanguageManager = function ($) {
  //keyValue

  //targets are the mappings for the language
  return function () {
    var language = void 0;
    var dictionary = {};
    var $targets = $("[data-lang-target][data-lang-key]");

    var updatePageLanguage = function updatePageLanguage() {

      var targetLanguage = dictionary.rows.filter(function (i) {
        return i.lang === language;
      })[0];

      $targets.each(function (index, item) {

        var targetAttribute = $(item).data('lang-target');
        var langTarget = $(item).data('lang-key');

        switch (targetAttribute) {
          case 'text':

            $("[data-lang-key=\"" + langTarget + "\"]").text(targetLanguage[langTarget]);
            if (langTarget == "more-search-options") {}
            break;
          case 'value':
            $(item).val(targetLanguage[langTarget]);
            break;
          default:
            $(item).attr(targetAttribute, targetLanguage[langTarget]);
            break;
        }
      });
    };

    return {
      language: language,
      targets: $targets,
      dictionary: dictionary,
      initialize: function initialize(lang) {

        return $.ajax({
          // url: 'https://gsx2json.com/api?id=1O3eByjL1vlYf7Z7am-_htRTQi73PafqIfNBdLmXe8SM&sheet=1',
          url: '/data/lang.json',
          dataType: 'json',
          success: function success(data) {
            dictionary = data;
            language = lang;
            updatePageLanguage();

            $(document).trigger('trigger-language-loaded');

            $("#language-opts").multiselect('select', lang);
          }
        });
      },
      refresh: function refresh() {
        updatePageLanguage(language);
      },
      updateLanguage: function updateLanguage(lang) {

        language = lang;
        updatePageLanguage();
      },
      getTranslation: function getTranslation(key) {
        var targetLanguage = dictionary.rows.filter(function (i) {
          return i.lang === language;
        })[0];
        return targetLanguage[key];
      }
    };
  };
}(jQuery);
'use strict';

/* This loads and manages the list! */

var ListManager = function ($) {
  return function (options) {
    var targetList = options.targetList || "#events-list";
    // June 13 `18 – referrer and source
    var referrer = options.referrer,
        source = options.source;


    var $target = typeof targetList === 'string' ? $(targetList) : targetList;
    var d3Target = typeof targetList === 'string' ? d3.select(targetList) : targetList;

    var renderEvent = function renderEvent(item) {
      var referrer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      var m = moment(new Date(item.start_datetime));
      m = m.utc().subtract(m.utcOffset(), 'm');
      var date = m.format("dddd MMM DD, h:mma");
      var url = item.url.match(/^https{0,1}:/) ? item.url : "//" + item.url;
      // let superGroup = window.slugify(item.supergroup);
      url = Helper.refSource(url, referrer, source);

      //<li class='${window.slugify(item.event_type)} events event-obj' data-lat='${item.lat}' data-lng='${item.lng}'>
      return '\n\n        <div class="type-event type-action">\n          <ul class="event-types-list">\n            <li class=\'tag-' + item.event_type + ' tag\'>' + item.event_type + '</li>\n          </ul>\n          <h2 class="event-title"><a href="' + url + '" target=\'_blank\'>' + item.title + '</a></h2>\n          <div class="event-date date">' + date + '</div>\n          <div class="event-address address-area">\n            <p>' + item.venue + '</p>\n          </div>\n          <div class="call-to-action">\n            <a href="' + url + '" target=\'_blank\' class="btn btn-secondary">RSVP</a>\n          </div>\n        </div>\n      ';
    };

    var renderGroup = function renderGroup(item) {
      var referrer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      var url = item.website.match(/^https{0,1}:/) ? item.website : "//" + item.website;
      var superGroup = window.slugify(item.supergroup);

      url = Helper.refSource(url, referrer, source);

      //<li class='${item.event_type} ${superGroup} group-obj' data-lat='${item.lat}' data-lng='${item.lng}'>
      return '\n        <div class="type-group group-obj">\n          <ul class="event-types-list">\n            <li class="tag tag-' + item.supergroup + '">' + item.supergroup + '</li>\n          </ul>\n          <h2><a href="' + url + '" target=\'_blank\'>' + item.name + '</a></h2>\n          <div class="group-details-area">\n            <div class="group-location location">' + item.location + '</div>\n            <div class="group-description">\n              <p>' + item.description + '</p>\n            </div>\n          </div>\n          <div class="call-to-action">\n            <a href="' + url + '" target=\'_blank\' class="btn btn-secondary">Get Involved</a>\n          </div>\n        </div>\n      ';
    };

    return {
      $list: $target,
      updateFilter: function updateFilter(p) {
        if (!p) return;

        // Remove Filters

        $target.removeProp("class");
        $target.addClass(p.filter ? p.filter.join(" ") : '');

        // $target.find('li').hide();

        if (p.filter) {
          p.filter.forEach(function (fil) {
            $target.find('li.' + fil).show();
          });
        }
      },
      updateBounds: function updateBounds(bound1, bound2, filters) {
        // const bounds = [p.bounds1, p.bounds2];

        //
        // $target.find('ul li.event-obj, ul li.group-obj').each((ind, item)=> {
        //
        //   let _lat = $(item).data('lat'),
        //       _lng = $(item).data('lng');
        //
        //   const mi10 = 0.1449;
        //
        //   if (bound1[0] <= _lat && bound2[0] >= _lat && bound1[1] <= _lng && bound2[1] >= _lng) {
        //
        //     $(item).addClass('within-bound');
        //   } else {
        //     $(item).removeClass('within-bound');
        //   }
        // });
        //
        // let _visible = $target.find('ul li.event-obj.within-bound, ul li.group-obj.within-bound').length;

        var data = window.EVENTS_DATA.data.filter(function (item) {
          var type = item.event_type ? item.event_type.toLowerCase() : '';
          return filters && (filters.length == 0 /* If it's in filter */
          ? true : filters.includes(type != 'group' ? type : window.slugify(item.supergroup))) && /* If it's in bounds */
          bound1[0] <= item.lat && bound2[0] >= item.lat && bound1[1] <= item.lng && bound2[1] >= item.lng;
        });

        var listContainer = d3Target.select("ul");
        listContainer.selectAll("li.org-list-item").remove();
        listContainer.selectAll("li.org-list-item").data(data, function (item) {
          return item.event_type == 'group' ? item.website : item.url;
        }).enter().append('li').attr("class", function (item) {
          return item.event_type != 'group' ? 'org-list-item events event-obj' : 'org-list-item group-obj';
        }).html(function (item) {
          return item.event_type != 'group' ? renderEvent(item, referrer, source) : renderGroup(item);
        });

        if (data.length == 0) {
          // The list is empty
          $target.addClass("is-empty");
        } else {
          $target.removeClass("is-empty");
        }
      },
      populateList: function populateList(hardFilters) {
        //using window.EVENT_DATA
        var keySet = !hardFilters.key ? [] : hardFilters.key.split(',');
        // var $eventList = window.EVENTS_DATA.data.map(item => {
        //   if (keySet.length == 0) {
        //     return item.event_type && item.event_type.toLowerCase() == 'group' ? renderGroup(item) : renderEvent(item, referrer, source);
        //   } else if (keySet.length > 0 && item.event_type != 'group' && keySet.includes(item.event_type)) {
        //     return renderEvent(item, referrer, source);
        //   } else if (keySet.length > 0 && item.event_type == 'group' && keySet.includes(item.supergroup)) {
        //     return renderGroup(item, referrer, source)
        //   }
        //   return null;
        // })

        // const eventType = item.event_type ? item.event_type.toLowerCase() : null;
        // const initialData = window.EVENTS_DATA.data.filter(item => keySet.length == 0
        //                                         ? true
        //                                         : keySet.includes(item.event_type != 'group' ? item.event_type : window.slugify(item.supergroup)));
        // const listContainer = d3Target.select("ul");
        // listContainer.selectAll("li")
        //   .data(initialData, (item) => item ? item.url : '')
        //   .enter()
        //   .append('li')
        //     .attr("class", (item) => item.event_type != 'group' ? 'events event-obj' : 'group-obj')
        //     .html((item) => item.event_type != 'group' ? renderEvent(item, referrer, source) : renderGroup(item))
        //   .exit();
        // .remove();
        // console.log(listContainer);
        // $target.find('ul li').remove();
        // $target.find('ul').append($eventList);
      }
    };
  };
}(jQuery);
'use strict';

var MapManager = function ($) {
  var LANGUAGE = 'en';

  var popup = new mapboxgl.Popup({
    closeOnClick: false
  });

  var renderEvent = function renderEvent(item) {
    var referrer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;


    var m = moment(new Date(item.start_datetime));
    m = m.utc().subtract(m.utcOffset(), 'm');

    var date = m.format("dddd MMM DD, h:mma");
    var url = item.url.match(/^https{0,1}:/) ? item.url : "//" + item.url;

    url = Helper.refSource(url, referrer, source);

    var superGroup = window.slugify(item.supergroup);
    return '\n    <div class=\'popup-item ' + item.event_type + ' ' + superGroup + '\' data-lat=\'' + item.lat + '\' data-lng=\'' + item.lng + '\'>\n      <div class="type-event">\n        <ul class="event-types-list">\n          <li class="tag tag-' + item.event_type + '">' + (item.event_type || 'Action') + '</li>\n        </ul>\n        <h2 class="event-title"><a href="' + url + '" target=\'_blank\'>' + item.title + '</a></h2>\n        <div class="event-date">' + date + '</div>\n        <div class="event-address address-area">\n          <p>' + item.venue + '</p>\n        </div>\n        <div class="call-to-action">\n          <a href="' + url + '" target=\'_blank\' class="btn btn-secondary">RSVP</a>\n        </div>\n      </div>\n    </div>\n    ';
  };

  var renderGroup = function renderGroup(item) {
    var referrer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;


    var url = item.website.match(/^https{0,1}:/) ? item.website : "//" + item.website;

    url = Helper.refSource(url, referrer, source);

    var superGroup = window.slugify(item.supergroup);
    return '\n    <li>\n      <div class="type-group group-obj ' + superGroup + '">\n        <ul class="event-types-list">\n          <li class="tag tag-' + item.supergroup + ' ' + superGroup + '">' + item.supergroup + '</li>\n        </ul>\n        <div class="group-header">\n          <h2><a href="' + url + '" target=\'_blank\'>' + item.name + '</a></h2>\n          <div class="group-location location">' + item.location + '</div>\n        </div>\n        <div class="group-details-area">\n          <div class="group-description">\n            <p>' + item.description + '</p>\n          </div>\n        </div>\n        <div class="call-to-action">\n          <a href="' + url + '" target=\'_blank\' class="btn btn-secondary">Get Involved</a>\n        </div>\n      </div>\n    </li>\n    ';
  };

  var renderAnnotationPopup = function renderAnnotationPopup(item) {
    return '\n    <div class=\'popup-item annotation\' data-lat=\'' + item.lat + '\' data-lng=\'' + item.lng + '\'>\n      <div class="type-event">\n        <ul class="event-types-list">\n          <li class="tag tag-annotation">Annotation</li>\n        </ul>\n        <h2 class="event-title">' + item.name + '</h2>\n        <div class="event-address address-area">\n          <p>' + item.description + '</p>\n        </div>\n      </div>\n    </div>\n    ';
  };

  var renderAnnotationsGeoJson = function renderAnnotationsGeoJson(list) {
    return list.map(function (item) {
      var rendered = renderAnnotationPopup(item);
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
      };
    });
  };

  var renderGeojson = function renderGeojson(list) {
    var ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var src = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    return list.map(function (item) {
      // rendered eventType
      var rendered = void 0;

      if (item.event_type && item.event_type.toLowerCase() == 'group') {
        rendered = renderGroup(item, ref, src);
      } else {
        rendered = renderEvent(item, ref, src);
      }

      // format check
      if (isNaN(parseFloat(parseFloat(item.lng)))) {
        item.lng = item.lng.substring(1);
      }
      if (isNaN(parseFloat(parseFloat(item.lat)))) {
        item.lat = item.lat.substring(1);
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
      };
    });
  };

  var getEventGeojson = function getEventGeojson(targets) {
    var referrer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    return {
      "type": "FeatureCollection",
      "features": targets.sort(function (x, y) {
        return d3.descending(new Date(x.start_datetime), new Date(y.start_datetime));
      }).map(function (item) {
        return {
          "type": "Feature",
          "properties": {
            "id": item.lng + '-' + item.lat,
            "description": renderEvent(item, referrer, source),
            "is_past": new Date(item.start_datetime) < new Date() ? 'yes' : 'no'
          },
          "geometry": {
            "type": "Point",
            "coordinates": [item.lng, item.lat]
          }
        };
      })
    };
  };
  var getGroupGeojson = function getGroupGeojson(targets) {
    var referrer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    return {
      "type": "FeatureCollection",
      "features": targets.map(function (item) {
        return {
          "type": "Feature",
          "properties": {
            "id": item.lng + '-' + item.lat,
            "description": renderGroup(item)
          },
          "geometry": {
            "type": "Point",
            "coordinates": [item.lng, item.lat]
          }
        };
      })
    };
  };

  return function (options) {
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

    var referrer = options.referrer,
        source = options.source;

    // if (!L.Browser.mobile) {
    //   map.scrollWheelZoom.disable();
    // }

    LANGUAGE = options.lang || 'en';

    if (options.onMove) {
      map.on('dragend', function (event) {

        var bnd = map.getBounds();
        var sw = [bnd._sw.lat, bnd._sw.lng];
        var ne = [bnd._ne.lat, bnd._ne.lng];
        options.onMove(sw, ne);
      }).on('zoomend', function (event) {
        if (map.getZoom() <= 4) {
          $("#map").addClass("zoomed-out");
        } else {
          $("#map").removeClass("zoomed-out");
        }

        var bnd = map.getBounds();
        var sw = [bnd._sw.lat, bnd._sw.lng];
        var ne = [bnd._ne.lat, bnd._ne.lng];
        options.onMove(sw, ne);
      });
    }

    // map.fireEvent('zoomend');

    // L.tileLayer('https://api.mapbox.com/styles/v1/matthew350/cja41tijk27d62rqod7g0lx4b/tiles/256/{z}/{x}/{y}?access_token=' + accessToken, {
    //     attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors • <a href="//350.org">350.org</a>'
    // }).addTo(map);

    // console.log(window.queries['twilight-zone'], window.queries['twilight-zone'] === "true");
    if (window.queries['twilight-zone']) {
      L.terminator().addTo(map);
    }

    var geocoder = null;
    return {
      $map: map,
      initialize: function initialize(callback) {
        geocoder = new google.maps.Geocoder();
        if (callback && typeof callback === 'function') {
          callback();
        }
      },
      setBounds: function setBounds(bounds1, bounds2) {

        // const bounds = [bounds1, bounds2];
        var bounds = [bounds1.reverse(), bounds2.reverse()]; // mapbox
        map.fitBounds(bounds, { animate: false });
      },
      setCenter: function setCenter(center) {
        var zoom = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

        if (!center || !center[0] || center[0] == "" || !center[1] || center[1] == "") return;
        map.setView(center, zoom);
      },
      getBounds: function getBounds() {

        var bnd = map.getBounds();
        var sw = [bnd._sw.lat, bnd._sw.lng];
        var ne = [bnd._ne.lat, bnd._ne.lng];

        return [sw, ne];
      },
      // Center location by geocoded
      getCenterByLocation: function getCenterByLocation(location, callback) {

        geocoder.geocode({ address: location }, function (results, status) {

          if (callback && typeof callback === 'function') {
            callback(results[0]);
          }
        });
      },
      triggerZoomEnd: function triggerZoomEnd() {
        // map.fireEvent('zoomend');
      },
      zoomOutOnce: function zoomOutOnce() {
        map.zoomOut(1);
      },
      zoomUntilHit: function zoomUntilHit() {
        var $this = undefined;
        map.zoomOut(1);
        var intervalHandler = null;
        intervalHandler = setInterval(function () {
          var _visible = $(document).find('ul li.event-obj, ul li.group-obj').length;
          if (_visible == 0) {
            map.zoomOut(1);
          } else {
            clearInterval(intervalHandler);
          }
        }, 200);
      },
      refreshMap: function refreshMap() {
        //  map.invalidateSize(false);
        // map._onResize();
        // map.fireEvent('zoomend');


      },
      filterMap: function filterMap(filters) {

        // TODO mapbox this.
        $("#map").find(".event-item-popup").hide();
        if (!filters) return;
        filters.forEach(function (item) {
          $("#map").find(".event-item-popup." + item.toLowerCase()).show();
        });
      },
      plotPoints: function plotPoints(list, hardFilters, groups) {
        var keySet = !hardFilters.key ? [] : hardFilters.key.split(',');
        if (keySet.length > 0) {
          list = list.filter(function (item) {
            return keySet.includes(item.event_type);
          });
        }

        // Color the map

        var _loop = function _loop(i) {
          var group = groups[i];
          var targets = list.filter(function (item) {
            return item.event_type == "group" ? item.supergroup == group.supergroup : item.event_type == window.slugify(group.supergroup);
          });

          // item.categories == "blockwalk";
          if (i == "Events") {
            var geojson = getEventGeojson(targets, referrer, source);
            map.addLayer({
              "id": "events",
              "type": "circle",
              "source": {
                "type": "geojson",
                "data": geojson
              },
              "paint": {
                "circle-radius": ["interpolate", ["linear"], ["zoom"], 8, 3, 13, 6],
                "circle-color": ['case', ['==', ['get', 'is_past'], 'yes'], "#BBBBBB", "#40d7d4"],
                "circle-opacity": 0.9,
                "circle-stroke-width": 2,
                "circle-stroke-color": "white",
                "circle-stroke-opacity": 1
              }
            });
          } else {
            var _geojson = getGroupGeojson(targets, group, referrer, source);
            var icon = null;
            if (i == "Local Groups") {
              icon = "/img/group.png";
            } else if (i == "Regional Hubs") {
              icon = "/img/flag.png";
            }
            map.loadImage(icon, function (error, groupIcon) {

              map.addImage(window.slugify(i) + '-icon', groupIcon);
              map.addLayer({
                "id": window.slugify(i),
                "type": "symbol",
                "source": {
                  "type": "geojson",
                  "data": _geojson
                },
                "layout": {
                  'icon-allow-overlap': true,
                  'icon-ignore-placement': true,
                  'text-ignore-placement': true,
                  'text-allow-overlap': true,
                  "icon-image": window.slugify(i) + '-icon',
                  "icon-size": ["interpolate", ["linear"], ["zoom"], 4, 0.09, 9, 0.15]
                }
              });
            });
          }

          map.on("click", window.slugify(i), function (e) {
            var coordinates = e.features[0].geometry.coordinates.slice();
            var description = e.features[0].properties.description;
            popup.setLngLat(coordinates).setHTML(description).addTo(map);
          });
        };

        for (var i in groups) {
          _loop(i);
        }
      },
      _oldPlotPoints: function _oldPlotPoints(list, hardFilters, groups) {
        var keySet = !hardFilters.key ? [] : hardFilters.key.split(',');
        if (keySet.length > 0) {
          list = list.filter(function (item) {
            return keySet.includes(item.event_type);
          });
        }
        var geojson = {
          type: "FeatureCollection",
          features: renderGeojson(list, referrer, source)
        };
        var eventsLayer = L.geoJSON(geojson, {
          pointToLayer: function pointToLayer(feature, latlng) {
            // Icons for markers
            var eventType = feature.properties.eventProperties.event_type;
            // If no supergroup, it's an event.
            var supergroup = groups[feature.properties.eventProperties.supergroup] ? feature.properties.eventProperties.supergroup : "Events";
            var slugged = window.slugify(supergroup);
            var iconUrl = void 0;
            var isPast = new Date(feature.properties.eventProperties.start_datetime) < new Date();
            if (eventType == "Action") {
              iconUrl = isPast ? "/img/past-event.png" : "/img/event.png";
            } else {
              iconUrl = groups[supergroup] ? groups[supergroup].iconurl || "/img/event.png" : "/img/event.png";
            }

            var smallIcon = L.icon({
              iconUrl: iconUrl,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
              className: slugged + ' event-item-popup ' + (isPast && eventType == "Action" ? "event-past-event" : "")
            });

            var geojsonMarkerOptions = {
              icon: smallIcon
            };
            return L.marker(latlng, geojsonMarkerOptions);
          },

          onEachFeature: function onEachFeature(feature, layer) {
            if (feature.properties && feature.properties.popupContent) {
              layer.bindPopup(feature.properties.popupContent);
            }
          }
        });

        eventsLayer.addTo(map);
        // eventsLayer.bringToBack();


        // Add Annotations
        if (window.queries.annotation) {
          var annotations = !window.EVENTS_DATA.annotations ? [] : window.EVENTS_DATA.annotations.filter(function (item) {
            return item.type === window.queries.annotation;
          });

          var annotIcon = L.icon({
            iconUrl: "/img/annotation.png",
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            className: 'annotation-popup'
          });
          var annotMarkers = annotations.map(function (item) {
            return L.marker([item.lat, item.lng], { icon: annotIcon }).bindPopup(renderAnnotationPopup(item));
          });
          // annotLayer.bringToFront();

          // const annotLayerGroup = ;

          var annotLayerGroup = map.addLayer(L.featureGroup(annotMarkers));
          // annotLayerGroup.bringToFront();
          // annotMarkers.forEach(item => {
          //   item.addTo(map);
          //   item.bringToFront();
          // })
        }
      },
      update: function update(p) {
        if (!p || !p.lat || !p.lng) return;

        map.setView(L.latLng(p.lat, p.lng), 10);
      }
    };
  };
}(jQuery);
'use strict';

var QueryManager = function ($) {
  return function () {
    var targetForm = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "form#filters-form";

    var $target = typeof targetForm === 'string' ? $(targetForm) : targetForm;
    var lat = null;
    var lng = null;

    var previous = {};

    $target.on('submit', function (e) {
      e.preventDefault();
      lat = $target.find("input[name=lat]").val();
      lng = $target.find("input[name=lng]").val();

      var form = $.deparam($target.serialize());

      window.location.hash = $.param(form);
    });

    $(document).on('change', 'select#filter-items', function () {
      $target.trigger('submit');
    });

    return {
      initialize: function initialize(callback) {
        if (window.location.hash.length > 0) {
          var params = $.deparam(window.location.hash.substring(1));
          $target.find("input[name=lang]").val(params.lang);
          $target.find("input[name=lat]").val(params.lat);
          $target.find("input[name=lng]").val(params.lng);
          $target.find("input[name=bound1]").val(params.bound1);
          $target.find("input[name=bound2]").val(params.bound2);
          $target.find("input[name=loc]").val(params.loc);
          $target.find("input[name=key]").val(params.key);

          if (params.filter) {
            $target.find("#filter-items option").removeProp("selected");
            params.filter.forEach(function (item) {
              $target.find("#filter-items option[value='" + item + "']").prop("selected", true);
            });
          }
        }

        if (callback && typeof callback === 'function') {
          callback();
        }
      },
      getParameters: function getParameters() {
        var parameters = $.deparam($target.serialize());
        // parameters['location'] ;

        for (var key in parameters) {
          if (!parameters[key] || parameters[key] == "") {
            delete parameters[key];
          }
        }

        return parameters;
      },
      updateLocation: function updateLocation(lat, lng) {
        $target.find("input[name=lat]").val(lat);
        $target.find("input[name=lng]").val(lng);
        // $target.trigger('submit');
      },
      updateViewport: function updateViewport(viewport) {

        // Average it if less than 10mi radius
        if (Math.abs(viewport.f.b - viewport.f.f) < .15 || Math.abs(viewport.b.b - viewport.b.f) < .15) {
          var fAvg = (viewport.f.b + viewport.f.f) / 2;
          var bAvg = (viewport.b.b + viewport.b.f) / 2;
          viewport.f = { b: fAvg - .08, f: fAvg + .08 };
          viewport.b = { b: bAvg - .08, f: bAvg + .08 };
        }
        var bounds = [[viewport.f.b, viewport.b.b], [viewport.f.f, viewport.b.f]];

        $target.find("input[name=bound1]").val(JSON.stringify(bounds[0]));
        $target.find("input[name=bound2]").val(JSON.stringify(bounds[1]));
        $target.trigger('submit');
      },
      updateViewportByBound: function updateViewportByBound(sw, ne) {

        var bounds = [sw, ne]; ////////


        $target.find("input[name=bound1]").val(JSON.stringify(bounds[0]));
        $target.find("input[name=bound2]").val(JSON.stringify(bounds[1]));
        $target.trigger('submit');
      },
      triggerSubmit: function triggerSubmit() {
        $target.trigger('submit');
      }
    };
  };
}(jQuery);
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var autocompleteManager = void 0;
var mapManager = void 0;

window.DEFAULT_ICON = "/img/event.png";
window.slugify = function (text) {
  return !text ? text : text.toString().toLowerCase().replace(/\s+/g, '-') // Replace spaces with -
  .replace(/[^\w\-]+/g, '') // Remove all non-word chars
  .replace(/\-\-+/g, '-') // Replace multiple - with single -
  .replace(/^-+/, '') // Trim - from start of text
  .replace(/-+$/, '');
}; // Trim - from end of text

var getQueryString = function getQueryString() {
  var queryStringKeyValue = window.parent.location.search.replace('?', '').split('&');
  var qsJsonObject = {};
  if (queryStringKeyValue != '') {
    for (var i = 0; i < queryStringKeyValue.length; i++) {
      qsJsonObject[queryStringKeyValue[i].split('=')[0]] = queryStringKeyValue[i].split('=')[1];
    }
  }
  return qsJsonObject;
};

(function ($) {
  // Load things

  window.queries = $.deparam(window.location.search.substring(1));
  try {
    if ((!window.queries.group || !window.queries.referrer && !window.queries.source) && window.parent) {
      window.queries = {
        group: getQueryString().group,
        referrer: getQueryString().referrer,
        source: getQueryString().source,
        "twilight-zone": window.queries['twilight-zone'],
        "annotation": window.queries['annotation'],
        "full-map": window.queries['full-map'],
        "lang": window.queries['lang']
      };
    }
  } catch (e) {
    console.log("Error: ", e);
  }

  if (window.queries['full-map']) {
    if ($(window).width() < 600) {
      // $("#events-list-container").hide();
      $("body").addClass("map-view");
      // $(".filter-area").hide();
      // $("section#map").css("height", "calc(100% - 64px)");
    } else {
      $("body").addClass("filter-collapsed");
      // $("#events-list-container").hide();
    }
  } else {
    $("#show-hide-list-container").hide();
  }

  if (window.queries.group) {
    $('select#filter-items').parent().css("opacity", "0");
  }
  var buildFilters = function buildFilters() {
    $('select#filter-items').multiselect({
      enableHTML: true,
      templates: {
        button: '<button type="button" class="multiselect dropdown-toggle" data-toggle="dropdown"><span data-lang-target="text" data-lang-key="more-search-options"></span> <span class="fa fa-caret-down"></span></button>',
        li: '<li><a href="javascript:void(0);"><label></label></a></li>'
      },
      dropRight: true,
      onInitialized: function onInitialized() {},
      onDropdownShow: function onDropdownShow() {
        setTimeout(function () {
          $(document).trigger("mobile-update-map-height");
        }, 10);
      },
      onDropdownHide: function onDropdownHide() {
        setTimeout(function () {
          $(document).trigger("mobile-update-map-height");
        }, 10);
      },
      optionLabel: function optionLabel(e) {
        // let el = $( '<div></div>' );
        // el.append(() + "");

        return unescape($(e).attr('label')) || $(e).html();
      }
    });
  };
  buildFilters();

  $('select#language-opts').multiselect({
    enableHTML: true,
    optionClass: function optionClass() {
      return 'lang-opt';
    },
    selectedClass: function selectedClass() {
      return 'lang-sel';
    },
    buttonClass: function buttonClass() {
      return 'lang-but';
    },
    dropRight: true,
    optionLabel: function optionLabel(e) {
      // let el = $( '<div></div>' );
      // el.append(() + "");

      return unescape($(e).attr('label')) || $(e).html();
    },
    onChange: function onChange(option, checked, select) {

      var parameters = queryManager.getParameters();
      parameters['lang'] = option.val();
      $(document).trigger('trigger-update-embed', parameters);
      $(document).trigger('trigger-reset-map', parameters);
    }
  });

  // 1. google maps geocode

  // 2. focus map on geocode (via lat/lng)
  var queryManager = QueryManager();
  queryManager.initialize();

  var initParams = queryManager.getParameters();

  var languageManager = LanguageManager();

  var listManager = ListManager({
    referrer: window.queries.referrer,
    source: window.queries.source
  });

  mapManager = MapManager({
    onMove: function onMove(sw, ne) {
      // When the map moves around, we update the list
      queryManager.updateViewportByBound(sw, ne);
      //update Query
    },
    referrer: window.queries.referrer,
    source: window.queries.source
  });

  window.initializeAutocompleteCallback = function () {

    autocompleteManager = AutocompleteManager("input[name='loc']");
    autocompleteManager.initialize();

    if (initParams.loc && initParams.loc !== '' && !initParams.bound1 && !initParams.bound2) {
      mapManager.initialize(function () {
        mapManager.getCenterByLocation(initParams.loc, function (result) {
          queryManager.updateViewport(result.geometry.viewport);
        });
      });
    }
  };

  if (initParams.lat && initParams.lng) {
    mapManager.setCenter([initParams.lat, initParams.lng]);
  }

  /***
  * List Events
  * This will trigger the list update method
  */
  $(document).on('mobile-update-map-height', function (event) {
    //This checks if width is for mobile
    if ($(window).width() < 600) {
      setTimeout(function () {
        $("#map").height($("#events-list").height());
        mapManager.refreshMap();
      }, 10);
    }
  });
  $(document).on('trigger-list-update', function (event, options) {
    listManager.populateList(options.params);
  });

  $(document).on('trigger-list-filter-update', function (event, options) {

    listManager.updateFilter(options);
  });

  $(document).on('trigger-list-filter', function (event, options) {
    var bound1 = void 0,
        bound2 = void 0;

    if (!options || !options.bound1 || !options.bound2) {
      var _mapManager$getBounds = mapManager.getBounds();

      var _mapManager$getBounds2 = _slicedToArray(_mapManager$getBounds, 2);

      bound1 = _mapManager$getBounds2[0];
      bound2 = _mapManager$getBounds2[1];
    } else {
      bound1 = JSON.parse(options.bound1);
      bound2 = JSON.parse(options.bound2);
    }

    listManager.updateBounds(bound1, bound2, options.filter);
  });

  $(document).on('trigger-reset-map', function (event, options) {
    var copy = JSON.parse(JSON.stringify(options));
    delete copy['lng'];
    delete copy['lat'];
    delete copy['bound1'];
    delete copy['bound2'];

    window.location.hash = $.param(copy);

    $(document).trigger("trigger-language-update", copy);
    $("select#filter-items").multiselect('destroy');
    buildFilters();
    $(document).trigger('trigger-load-groups', { groups: window.EVENTS_DATA.groups });
    setTimeout(function () {

      $(document).trigger("trigger-language-update", copy);
    }, 1000);
  });

  /***
  * Map Events
  */
  $(document).on('trigger-map-update', function (event, options) {
    // mapManager.setCenter([options.lat, options.lng]);
    if (!options || !options.bound1 || !options.bound2) {
      return;
    }

    var bound1 = JSON.parse(options.bound1);
    var bound2 = JSON.parse(options.bound2);

    mapManager.setBounds(bound1, bound2);
    // mapManager.triggerZoomEnd();

    // setTimeout(() => {
    //   mapManager.triggerZoomEnd();
    // }, 10);
  });

  $(document).on('click', "#copy-embed", function (e) {
    var copyText = document.getElementById("embed-text");
    copyText.select();
    document.execCommand("Copy");
  });

  // 3. markers on map
  $(document).on('trigger-map-plot', function (e, opt) {

    mapManager.plotPoints(opt.data, opt.params, opt.groups);
    $(document).trigger('trigger-map-filter');
  });

  // load groups

  $(document).on('trigger-load-groups', function (e, opt) {
    $('select#filter-items').empty();
    opt.groups.forEach(function (item) {

      var slugged = window.slugify(item.supergroup);
      var valueText = languageManager.getTranslation(item.translation);
      $('select#filter-items').append('\n            <option value=\'' + slugged + '\'\n              selected=\'selected\'\n              label="<span data-lang-target=\'text\' data-lang-key=\'' + item.translation + '\'>' + valueText + '</span><img src=\'' + (item.iconurl || window.DEFAULT_ICON) + '\' />">\n            </option>');
    });

    // Re-initialize
    queryManager.initialize();
    // $('select#filter-items').multiselect('destroy');
    $('select#filter-items').multiselect('rebuild');

    mapManager.refreshMap();

    $(document).trigger('trigger-language-update');
  });

  // Filter map
  $(document).on('trigger-map-filter', function (e, opt) {
    if (opt) {
      mapManager.filterMap(opt.filter);
    }
  });

  $(document).on('trigger-language-update', function (e, opt) {

    if (window.queries.lang) {
      languageManager.updateLanguage(window.queries.lang);
    } else if (opt) {
      languageManager.updateLanguage(opt.lang);
    } else {

      languageManager.refresh();
    }
  });

  $(document).on('trigger-language-loaded', function (e, opt) {
    $('select#filter-items').multiselect('rebuild');
  });

  $(document).on('click', 'button#show-hide-map', function (e, opt) {
    $('body').toggleClass('map-view');
  });

  $(document).on('click', 'button.btn.more-items', function (e, opt) {
    $('#embed-area').toggleClass('open');
  });

  $(document).on('trigger-update-embed', function (e, opt) {
    //update embed line
    var copy = JSON.parse(JSON.stringify(opt));
    delete copy['lng'];
    delete copy['lat'];
    delete copy['bound1'];
    delete copy['bound2'];

    $('#embed-area input[name=embed]').val('https://new-map.350.org#' + $.param(copy));
  });

  $(document).on('click', 'button#zoom-out', function (e, opt) {

    // mapManager.zoomOutOnce();
    mapManager.zoomUntilHit();
  });

  $(document).on('click', '#show-hide-list-container', function (e, opt) {
    $('body').toggleClass('filter-collapsed');
    setTimeout(function () {
      mapManager.refreshMap();
    }, 600);
  });

  $(window).on("resize", function (e) {
    mapManager.refreshMap();
  });

  /**
  Filter Changes
  */
  $(document).on("click", ".search-button button", function (e) {
    e.preventDefault();
    $(document).trigger("search.force-search-location");
    return false;
  });

  $(document).on("keyup", "input[name='loc']", function (e) {
    if (e.keyCode == 13) {
      $(document).trigger('search.force-search-location');
    }
  });

  $(document).on('search.force-search-location', function () {
    var _query = $("input[name='loc']").val();
    autocompleteManager.forceSearch(_query);
    // Search google and get the first result... autocomplete?
  });

  $(window).on("hashchange", function (event) {
    var hash = window.location.hash;
    if (hash.length == 0) return;
    var parameters = $.deparam(hash.substring(1));
    var oldURL = event.originalEvent.oldURL;
    var oldHash = $.deparam(oldURL.substring(oldURL.search("#") + 1));

    // $(document).trigger('trigger-list-filter-update', parameters);
    $(document).trigger('trigger-map-filter', parameters);
    $(document).trigger('trigger-update-embed', parameters);

    $(document).trigger('trigger-list-filter', parameters);
    // // So that change in filters will not update this
    // if (oldHash.bound1 !== parameters.bound1 || oldHash.bound2 !== parameters.bound2) {
    //   $(document).trigger('trigger-list-filter', parameters);
    // }

    if (oldHash.loc !== parameters.loc) {
      $(document).trigger('trigger-map-update', parameters);
    }

    // Change items
    if (oldHash.lang !== parameters.lang) {
      $(document).trigger('trigger-language-update', parameters);
    }
  });

  // 4. filter out items in activity-area

  // 5. get map elements

  // 6. get Group data

  // 7. present group elements

  $.when(function () {}).then(function () {
    return languageManager.initialize(initParams['lang'] || 'en');
  }).done(function (data) {}).then(function () {
    $.ajax({
      url: 'https://new-map.350.org/output/350org-with-annotation.js.gz', //'|**DATA_SOURCE**|',
      // url: '/data/test.js', //'|**DATA_SOURCE**|',
      dataType: 'script',
      cache: true,
      success: function success(data) {
        // window.EVENTS_DATA = data;
        //June 14, 2018 – Changes
        if (window.queries.group) {
          window.EVENTS_DATA.data = window.EVENTS_DATA.data.filter(function (i) {
            return i.campaign == window.queries.group;
          });
        }

        //Load groups
        $(document).trigger('trigger-load-groups', { groups: window.EVENTS_DATA.groups });

        var parameters = queryManager.getParameters();

        window.EVENTS_DATA.data.forEach(function (item) {
          item['event_type'] = item.event_type !== 'group' ? 'events' : item.event_type; //!item.event_type ? 'Event' : item.event_type;

          if (item.start_datetime && !item.start_datetime.match(/Z$/)) {
            item.start_datetime = item.start_datetime + "Z";
          }
        });

        // window.EVENTS_DATA.data.sort((a, b) => {
        //   return new Date(a.start_datetime) - new Date(b.start_datetime);
        // })


        $(document).trigger('trigger-list-update', { params: parameters });
        // $(document).trigger('trigger-list-filter-update', parameters);
        $(document).trigger('trigger-map-plot', {
          data: window.EVENTS_DATA.data,
          params: parameters,
          groups: window.EVENTS_DATA.groups.reduce(function (dict, item) {
            dict[item.supergroup] = item;return dict;
          }, {})
        });
        // });
        $(document).trigger('trigger-update-embed', parameters);
        //TODO: Make the geojson conversion happen on the backend

        //Refresh things
        setTimeout(function () {
          var p = queryManager.getParameters();

          $(document).trigger('trigger-map-update', p);
          $(document).trigger('trigger-map-filter', p);

          $(document).trigger('trigger-list-filter', p);
        }, 100);
      }
    });
  });
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9oZWxwZXIuanMiLCJjbGFzc2VzL2xhbmd1YWdlLmpzIiwiY2xhc3Nlcy9saXN0LmpzIiwiY2xhc3Nlcy9tYXAuanMiLCJjbGFzc2VzL3F1ZXJ5LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIkF1dG9jb21wbGV0ZU1hbmFnZXIiLCIkIiwidGFyZ2V0IiwiQVBJX0tFWSIsInRhcmdldEl0ZW0iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJxdWVyeU1nciIsIlF1ZXJ5TWFuYWdlciIsImdlb2NvZGVyIiwiZ29vZ2xlIiwibWFwcyIsIkdlb2NvZGVyIiwiJHRhcmdldCIsImZvcmNlU2VhcmNoIiwicSIsImdlb2NvZGUiLCJhZGRyZXNzIiwicmVzdWx0cyIsInN0YXR1cyIsImdlb21ldHJ5IiwidXBkYXRlVmlld3BvcnQiLCJ2aWV3cG9ydCIsInZhbCIsImZvcm1hdHRlZF9hZGRyZXNzIiwiaW5pdGlhbGl6ZSIsInR5cGVhaGVhZCIsImhpbnQiLCJoaWdobGlnaHQiLCJtaW5MZW5ndGgiLCJjbGFzc05hbWVzIiwibWVudSIsIm5hbWUiLCJkaXNwbGF5IiwiaXRlbSIsImxpbWl0Iiwic291cmNlIiwic3luYyIsImFzeW5jIiwib24iLCJvYmoiLCJkYXR1bSIsImpRdWVyeSIsIkhlbHBlciIsInJlZlNvdXJjZSIsInVybCIsInJlZiIsInNyYyIsImluZGV4T2YiLCJMYW5ndWFnZU1hbmFnZXIiLCJsYW5ndWFnZSIsImRpY3Rpb25hcnkiLCIkdGFyZ2V0cyIsInVwZGF0ZVBhZ2VMYW5ndWFnZSIsInRhcmdldExhbmd1YWdlIiwicm93cyIsImZpbHRlciIsImkiLCJsYW5nIiwiZWFjaCIsImluZGV4IiwidGFyZ2V0QXR0cmlidXRlIiwiZGF0YSIsImxhbmdUYXJnZXQiLCJ0ZXh0IiwiYXR0ciIsInRhcmdldHMiLCJhamF4IiwiZGF0YVR5cGUiLCJzdWNjZXNzIiwidHJpZ2dlciIsIm11bHRpc2VsZWN0IiwicmVmcmVzaCIsInVwZGF0ZUxhbmd1YWdlIiwiZ2V0VHJhbnNsYXRpb24iLCJrZXkiLCJMaXN0TWFuYWdlciIsIm9wdGlvbnMiLCJ0YXJnZXRMaXN0IiwicmVmZXJyZXIiLCJkM1RhcmdldCIsImQzIiwic2VsZWN0IiwicmVuZGVyRXZlbnQiLCJtIiwibW9tZW50IiwiRGF0ZSIsInN0YXJ0X2RhdGV0aW1lIiwidXRjIiwic3VidHJhY3QiLCJ1dGNPZmZzZXQiLCJkYXRlIiwiZm9ybWF0IiwibWF0Y2giLCJldmVudF90eXBlIiwidGl0bGUiLCJ2ZW51ZSIsInJlbmRlckdyb3VwIiwid2Vic2l0ZSIsInN1cGVyR3JvdXAiLCJ3aW5kb3ciLCJzbHVnaWZ5Iiwic3VwZXJncm91cCIsImxvY2F0aW9uIiwiZGVzY3JpcHRpb24iLCIkbGlzdCIsInVwZGF0ZUZpbHRlciIsInAiLCJyZW1vdmVQcm9wIiwiYWRkQ2xhc3MiLCJqb2luIiwiZm9yRWFjaCIsImZpbCIsImZpbmQiLCJzaG93IiwidXBkYXRlQm91bmRzIiwiYm91bmQxIiwiYm91bmQyIiwiZmlsdGVycyIsIkVWRU5UU19EQVRBIiwidHlwZSIsInRvTG93ZXJDYXNlIiwibGVuZ3RoIiwiaW5jbHVkZXMiLCJsYXQiLCJsbmciLCJsaXN0Q29udGFpbmVyIiwic2VsZWN0QWxsIiwicmVtb3ZlIiwiZW50ZXIiLCJhcHBlbmQiLCJodG1sIiwicmVtb3ZlQ2xhc3MiLCJwb3B1bGF0ZUxpc3QiLCJoYXJkRmlsdGVycyIsImtleVNldCIsInNwbGl0IiwiTWFwTWFuYWdlciIsIkxBTkdVQUdFIiwicG9wdXAiLCJtYXBib3hnbCIsIlBvcHVwIiwiY2xvc2VPbkNsaWNrIiwicmVuZGVyQW5ub3RhdGlvblBvcHVwIiwicmVuZGVyQW5ub3RhdGlvbnNHZW9Kc29uIiwibGlzdCIsIm1hcCIsInJlbmRlcmVkIiwiY29vcmRpbmF0ZXMiLCJwcm9wZXJ0aWVzIiwiYW5ub3RhdGlvblByb3BzIiwicG9wdXBDb250ZW50IiwicmVuZGVyR2VvanNvbiIsImlzTmFOIiwicGFyc2VGbG9hdCIsInN1YnN0cmluZyIsImV2ZW50UHJvcGVydGllcyIsImdldEV2ZW50R2VvanNvbiIsInNvcnQiLCJ4IiwieSIsImRlc2NlbmRpbmciLCJnZXRHcm91cEdlb2pzb24iLCJhY2Nlc3NUb2tlbiIsIkwiLCJkcmFnZ2luZyIsIkJyb3dzZXIiLCJtb2JpbGUiLCJzZXRWaWV3IiwiTWFwIiwiY29udGFpbmVyIiwic3R5bGUiLCJkb3VibGVDbGlja1pvb20iLCJjZW50ZXIiLCJ6b29tIiwib25Nb3ZlIiwiZXZlbnQiLCJibmQiLCJnZXRCb3VuZHMiLCJzdyIsIl9zdyIsIm5lIiwiX25lIiwiZ2V0Wm9vbSIsInF1ZXJpZXMiLCJ0ZXJtaW5hdG9yIiwiYWRkVG8iLCIkbWFwIiwiY2FsbGJhY2siLCJzZXRCb3VuZHMiLCJib3VuZHMxIiwiYm91bmRzMiIsImJvdW5kcyIsInJldmVyc2UiLCJmaXRCb3VuZHMiLCJhbmltYXRlIiwic2V0Q2VudGVyIiwiZ2V0Q2VudGVyQnlMb2NhdGlvbiIsInRyaWdnZXJab29tRW5kIiwiem9vbU91dE9uY2UiLCJ6b29tT3V0Iiwiem9vbVVudGlsSGl0IiwiJHRoaXMiLCJpbnRlcnZhbEhhbmRsZXIiLCJzZXRJbnRlcnZhbCIsIl92aXNpYmxlIiwiY2xlYXJJbnRlcnZhbCIsInJlZnJlc2hNYXAiLCJmaWx0ZXJNYXAiLCJoaWRlIiwicGxvdFBvaW50cyIsImdyb3VwcyIsImdyb3VwIiwiZ2VvanNvbiIsImFkZExheWVyIiwiaWNvbiIsImxvYWRJbWFnZSIsImVycm9yIiwiZ3JvdXBJY29uIiwiYWRkSW1hZ2UiLCJlIiwiZmVhdHVyZXMiLCJzbGljZSIsInNldExuZ0xhdCIsInNldEhUTUwiLCJfb2xkUGxvdFBvaW50cyIsImV2ZW50c0xheWVyIiwiZ2VvSlNPTiIsInBvaW50VG9MYXllciIsImZlYXR1cmUiLCJsYXRsbmciLCJldmVudFR5cGUiLCJzbHVnZ2VkIiwiaWNvblVybCIsImlzUGFzdCIsImljb251cmwiLCJzbWFsbEljb24iLCJpY29uU2l6ZSIsImljb25BbmNob3IiLCJjbGFzc05hbWUiLCJnZW9qc29uTWFya2VyT3B0aW9ucyIsIm1hcmtlciIsIm9uRWFjaEZlYXR1cmUiLCJsYXllciIsImJpbmRQb3B1cCIsImFubm90YXRpb24iLCJhbm5vdGF0aW9ucyIsImFubm90SWNvbiIsImFubm90TWFya2VycyIsImFubm90TGF5ZXJHcm91cCIsImZlYXR1cmVHcm91cCIsInVwZGF0ZSIsImxhdExuZyIsInRhcmdldEZvcm0iLCJwcmV2aW91cyIsInByZXZlbnREZWZhdWx0IiwiZm9ybSIsImRlcGFyYW0iLCJzZXJpYWxpemUiLCJoYXNoIiwicGFyYW0iLCJwYXJhbXMiLCJsb2MiLCJwcm9wIiwiZ2V0UGFyYW1ldGVycyIsInBhcmFtZXRlcnMiLCJ1cGRhdGVMb2NhdGlvbiIsIk1hdGgiLCJhYnMiLCJmIiwiYiIsImZBdmciLCJiQXZnIiwiSlNPTiIsInN0cmluZ2lmeSIsInVwZGF0ZVZpZXdwb3J0QnlCb3VuZCIsInRyaWdnZXJTdWJtaXQiLCJhdXRvY29tcGxldGVNYW5hZ2VyIiwibWFwTWFuYWdlciIsIkRFRkFVTFRfSUNPTiIsInRvU3RyaW5nIiwicmVwbGFjZSIsImdldFF1ZXJ5U3RyaW5nIiwicXVlcnlTdHJpbmdLZXlWYWx1ZSIsInBhcmVudCIsInNlYXJjaCIsInFzSnNvbk9iamVjdCIsImNvbnNvbGUiLCJsb2ciLCJ3aWR0aCIsImNzcyIsImJ1aWxkRmlsdGVycyIsImVuYWJsZUhUTUwiLCJ0ZW1wbGF0ZXMiLCJidXR0b24iLCJsaSIsImRyb3BSaWdodCIsIm9uSW5pdGlhbGl6ZWQiLCJvbkRyb3Bkb3duU2hvdyIsInNldFRpbWVvdXQiLCJvbkRyb3Bkb3duSGlkZSIsIm9wdGlvbkxhYmVsIiwidW5lc2NhcGUiLCJvcHRpb25DbGFzcyIsInNlbGVjdGVkQ2xhc3MiLCJidXR0b25DbGFzcyIsIm9uQ2hhbmdlIiwib3B0aW9uIiwiY2hlY2tlZCIsInF1ZXJ5TWFuYWdlciIsImluaXRQYXJhbXMiLCJsYW5ndWFnZU1hbmFnZXIiLCJsaXN0TWFuYWdlciIsImluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayIsInJlc3VsdCIsImhlaWdodCIsInBhcnNlIiwiY29weSIsImNvcHlUZXh0IiwiZ2V0RWxlbWVudEJ5SWQiLCJleGVjQ29tbWFuZCIsIm9wdCIsImVtcHR5IiwidmFsdWVUZXh0IiwidHJhbnNsYXRpb24iLCJ0b2dnbGVDbGFzcyIsImtleUNvZGUiLCJfcXVlcnkiLCJvbGRVUkwiLCJvcmlnaW5hbEV2ZW50Iiwib2xkSGFzaCIsIndoZW4iLCJ0aGVuIiwiZG9uZSIsImNhY2hlIiwiY2FtcGFpZ24iLCJyZWR1Y2UiLCJkaWN0Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOztBQUNBLElBQU1BLHNCQUF1QixVQUFTQyxDQUFULEVBQVk7QUFDdkM7O0FBRUEsU0FBTyxVQUFDQyxNQUFELEVBQVk7O0FBRWpCLFFBQU1DLFVBQVUseUNBQWhCO0FBQ0EsUUFBTUMsYUFBYSxPQUFPRixNQUFQLElBQWlCLFFBQWpCLEdBQTRCRyxTQUFTQyxhQUFULENBQXVCSixNQUF2QixDQUE1QixHQUE2REEsTUFBaEY7QUFDQSxRQUFNSyxXQUFXQyxjQUFqQjtBQUNBLFFBQUlDLFdBQVcsSUFBSUMsT0FBT0MsSUFBUCxDQUFZQyxRQUFoQixFQUFmOztBQUVBLFdBQU87QUFDTEMsZUFBU1osRUFBRUcsVUFBRixDQURKO0FBRUxGLGNBQVFFLFVBRkg7QUFHTFUsbUJBQWEscUJBQUNDLENBQUQsRUFBTztBQUNsQk4saUJBQVNPLE9BQVQsQ0FBaUIsRUFBRUMsU0FBU0YsQ0FBWCxFQUFqQixFQUFpQyxVQUFVRyxPQUFWLEVBQW1CQyxNQUFuQixFQUEyQjtBQUMxRCxjQUFJRCxRQUFRLENBQVIsQ0FBSixFQUFnQjtBQUNkLGdCQUFJRSxXQUFXRixRQUFRLENBQVIsRUFBV0UsUUFBMUI7QUFDQWIscUJBQVNjLGNBQVQsQ0FBd0JELFNBQVNFLFFBQWpDO0FBQ0FyQixjQUFFRyxVQUFGLEVBQWNtQixHQUFkLENBQWtCTCxRQUFRLENBQVIsRUFBV00saUJBQTdCO0FBQ0Q7QUFDRDtB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RUE7QUFDQWtDLG1CQUFXLFlBQU07QUFDZixjQUFJaE0sSUFBSTBNLGFBQWE3QyxhQUFiLEVBQVI7O0FBRUF2USxZQUFFSSxRQUFGLEVBQVlpRSxPQUFaLENBQW9CLG9CQUFwQixFQUEwQ3FDLENBQTFDO0FBQ0ExRyxZQUFFSSxRQUFGLEVBQVlpRSxPQUFaLENBQW9CLG9CQUFwQixFQUEwQ3FDLENBQTFDOztBQUVBMUcsWUFBRUksUUFBRixFQUFZaUUsT0FBWixDQUFvQixxQkFBcEIsRUFBMkNxQyxDQUEzQztBQUVELFNBUkQsRUFRRyxHQVJIO0FBU0Q7QUF0REUsS0FBUDtBQXdEQyxHQTlETDtBQWtFRCxDQXBiRCxFQW9iR2pFLE1BcGJIIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuLy9BUEkgOkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVxuY29uc3QgQXV0b2NvbXBsZXRlTWFuYWdlciA9IChmdW5jdGlvbigkKSB7XG4gIC8vSW5pdGlhbGl6YXRpb24uLi5cblxuICByZXR1cm4gKHRhcmdldCkgPT4ge1xuXG4gICAgY29uc3QgQVBJX0tFWSA9IFwiQUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXCI7XG4gICAgY29uc3QgdGFyZ2V0SXRlbSA9IHR5cGVvZiB0YXJnZXQgPT0gXCJzdHJpbmdcIiA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KSA6IHRhcmdldDtcbiAgICBjb25zdCBxdWVyeU1nciA9IFF1ZXJ5TWFuYWdlcigpO1xuICAgIHZhciBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICR0YXJnZXQ6ICQodGFyZ2V0SXRlbSksXG4gICAgICB0YXJnZXQ6IHRhcmdldEl0ZW0sXG4gICAgICBmb3JjZVNlYXJjaDogKHEpID0+IHtcbiAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IHEgfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuICAgICAgICAgIGlmIChyZXN1bHRzWzBdKSB7XG4gICAgICAgICAgICBsZXQgZ2VvbWV0cnkgPSByZXN1bHRzWzBdLmdlb21ldHJ5O1xuICAgICAgICAgICAgcXVlcnlNZ3IudXBkYXRlVmlld3BvcnQoZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgJCh0YXJnZXRJdGVtKS52YWwocmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHZhciBnZW9tZXRyeSA9IGRhdHVtLmdlb21ldHJ5O1xuICAgICAgICAgIC8vIHF1ZXJ5TWdyLnVwZGF0ZVZpZXdwb3J0KGdlb21ldHJ5LnZpZXdwb3J0KTtcblxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBpbml0aWFsaXplOiAoKSA9PiB7XG4gICAgICAgICQodGFyZ2V0SXRlbSkudHlwZWFoZWFkKHtcbiAgICAgICAgICAgICAgICAgICAgaGludDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBtaW5MZW5ndGg6IDQsXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICBtZW51OiAndHQtZHJvcGRvd24tbWVudSdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3NlYXJjaC1yZXN1bHRzJyxcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogKGl0ZW0pID0+IGl0ZW0uZm9ybWF0dGVkX2FkZHJlc3MsXG4gICAgICAgICAgICAgICAgICAgIGxpbWl0OiAxMCxcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiBmdW5jdGlvbiAocSwgc3luYywgYXN5bmMpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IHEgfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBhc3luYyhyZXN1bHRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKS5vbigndHlwZWFoZWFkOnNlbGVjdGVkJywgZnVuY3Rpb24gKG9iaiwgZGF0dW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoZGF0dW0pXG4gICAgICAgICAgICAgICAgICAgIHtcblxuICAgICAgICAgICAgICAgICAgICAgIHZhciBnZW9tZXRyeSA9IGRhdHVtLmdlb21ldHJ5O1xuICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5TWdyLnVwZGF0ZVZpZXdwb3J0KGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICAgICAgICAgICAvLyAgbWFwLmZpdEJvdW5kcyhnZW9tZXRyeS5ib3VuZHM/IGdlb21ldHJ5LmJvdW5kcyA6IGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuXG5cbiAgICByZXR1cm4ge1xuXG4gICAgfVxuICB9XG5cbn0oalF1ZXJ5KSk7XG4iLCJjb25zdCBIZWxwZXIgPSAoKCQpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVmU291cmNlOiAodXJsLCByZWYsIHNyYykgPT4ge1xuICAgICAgICAvLyBKdW4gMTMgMjAxOCDigJQgRml4IGZvciBzb3VyY2UgYW5kIHJlZmVycmVyXG4gICAgICAgIGlmIChyZWYgfHwgc3JjKSB7XG4gICAgICAgICAgaWYgKHVybC5pbmRleE9mKFwiP1wiKSA+PSAwKSB7XG4gICAgICAgICAgICB1cmwgPSBgJHt1cmx9JnJlZmVycmVyPSR7cmVmfHxcIlwifSZzb3VyY2U9JHtzcmN8fFwiXCJ9YDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXJsID0gYCR7dXJsfT9yZWZlcnJlcj0ke3JlZnx8XCJcIn0mc291cmNlPSR7c3JjfHxcIlwifWA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgIH1cbiAgICB9O1xufSkoalF1ZXJ5KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTGFuZ3VhZ2VNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIC8va2V5VmFsdWVcblxuICAvL3RhcmdldHMgYXJlIHRoZSBtYXBwaW5ncyBmb3IgdGhlIGxhbmd1YWdlXG4gIHJldHVybiAoKSA9PiB7XG4gICAgbGV0IGxhbmd1YWdlO1xuICAgIGxldCBkaWN0aW9uYXJ5ID0ge307XG4gICAgbGV0ICR0YXJnZXRzID0gJChcIltkYXRhLWxhbmctdGFyZ2V0XVtkYXRhLWxhbmcta2V5XVwiKTtcblxuICAgIGNvbnN0IHVwZGF0ZVBhZ2VMYW5ndWFnZSA9ICgpID0+IHtcblxuICAgICAgbGV0IHRhcmdldExhbmd1YWdlID0gZGljdGlvbmFyeS5yb3dzLmZpbHRlcigoaSkgPT4gaS5sYW5nID09PSBsYW5ndWFnZSlbMF07XG5cbiAgICAgICR0YXJnZXRzLmVhY2goKGluZGV4LCBpdGVtKSA9PiB7XG5cbiAgICAgICAgbGV0IHRhcmdldEF0dHJpYnV0ZSA9ICQoaXRlbSkuZGF0YSgnbGFuZy10YXJnZXQnKTtcbiAgICAgICAgbGV0IGxhbmdUYXJnZXQgPSAkKGl0ZW0pLmRhdGEoJ2xhbmcta2V5Jyk7XG5cblxuXG5cbiAgICAgICAgc3dpdGNoKHRhcmdldEF0dHJpYnV0ZSkge1xuICAgICAgICAgIGNhc2UgJ3RleHQnOlxuXG4gICAgICAgICAgICAkKChgW2RhdGEtbGFuZy1rZXk9XCIke2xhbmdUYXJnZXR9XCJdYCkpLnRleHQodGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgaWYgKGxhbmdUYXJnZXQgPT0gXCJtb3JlLXNlYXJjaC1vcHRpb25zXCIpIHtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAndmFsdWUnOlxuICAgICAgICAgICAgJChpdGVtKS52YWwodGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICQoaXRlbSkuYXR0cih0YXJnZXRBdHRyaWJ1dGUsIHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgbGFuZ3VhZ2UsXG4gICAgICB0YXJnZXRzOiAkdGFyZ2V0cyxcbiAgICAgIGRpY3Rpb25hcnksXG4gICAgICBpbml0aWFsaXplOiAobGFuZykgPT4ge1xuXG4gICAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICAgIC8vIHVybDogJ2h0dHBzOi8vZ3N4Mmpzb24uY29tL2FwaT9pZD0xTzNlQnlqTDF2bFlmN1o3YW0tX2h0UlRRaTczUGFmcUlmTkJkTG1YZThTTSZzaGVldD0xJyxcbiAgICAgICAgICB1cmw6ICcvZGF0YS9sYW5nLmpzb24nLFxuICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgc3VjY2VzczogKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGRpY3Rpb25hcnkgPSBkYXRhO1xuICAgICAgICAgICAgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgICAgICAgICAgdXBkYXRlUGFnZUxhbmd1YWdlKCk7XG5cbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtbG9hZGVkJyk7XG5cbiAgICAgICAgICAgICQoXCIjbGFuZ3VhZ2Utb3B0c1wiKS5tdWx0aXNlbGVjdCgnc2VsZWN0JywgbGFuZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICByZWZyZXNoOiAoKSA9PiB7XG4gICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZShsYW5ndWFnZSk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTGFuZ3VhZ2U6IChsYW5nKSA9PiB7XG5cbiAgICAgICAgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UoKTtcbiAgICAgIH0sXG4gICAgICBnZXRUcmFuc2xhdGlvbjogKGtleSkgPT4ge1xuICAgICAgICBsZXQgdGFyZ2V0TGFuZ3VhZ2UgPSBkaWN0aW9uYXJ5LnJvd3MuZmlsdGVyKChpKSA9PiBpLmxhbmcgPT09IGxhbmd1YWdlKVswXTtcbiAgICAgICAgcmV0dXJuIHRhcmdldExhbmd1YWdlW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG59KShqUXVlcnkpO1xuIiwiLyogVGhpcyBsb2FkcyBhbmQgbWFuYWdlcyB0aGUgbGlzdCEgKi9cblxuY29uc3QgTGlzdE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuIChvcHRpb25zKSA9PiB7XG4gICAgbGV0IHRhcmdldExpc3QgPSBvcHRpb25zLnRhcmdldExpc3QgfHwgXCIjZXZlbnRzLWxpc3RcIjtcbiAgICAvLyBKdW5lIDEzIGAxOCDigJMgcmVmZXJyZXIgYW5kIHNvdXJjZVxuICAgIGxldCB7cmVmZXJyZXIsIHNvdXJjZX0gPSBvcHRpb25zO1xuXG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRMaXN0ID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0TGlzdCkgOiB0YXJnZXRMaXN0O1xuICAgIGNvbnN0IGQzVGFyZ2V0ID0gdHlwZW9mIHRhcmdldExpc3QgPT09ICdzdHJpbmcnID8gZDMuc2VsZWN0KHRhcmdldExpc3QpIDogdGFyZ2V0TGlzdDtcblxuICAgIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0sIHJlZmVycmVyID0gbnVsbCwgc291cmNlID0gbnVsbCkgPT4ge1xuICAgICAgbGV0IG0gPSBtb21lbnQobmV3IERhdGUoaXRlbS5zdGFydF9kYXRldGltZSkpO1xuICAgICAgbSA9IG0udXRjKCkuc3VidHJhY3QobS51dGNPZmZzZXQoKSwgJ20nKTtcbiAgICAgIHZhciBkYXRlID0gbS5mb3JtYXQoXCJkZGRkIE1NTSBERCwgaDptbWFcIik7XG4gICAgICBsZXQgdXJsID0gaXRlbS51cmwubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS51cmwgOiBcIi8vXCIgKyBpdGVtLnVybDtcbiAgICAgIC8vIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICAgIHVybCA9IEhlbHBlci5yZWZTb3VyY2UodXJsLCByZWZlcnJlciwgc291cmNlKTtcblxuICAgICAgLy88bGkgY2xhc3M9JyR7d2luZG93LnNsdWdpZnkoaXRlbS5ldmVudF90eXBlKX0gZXZlbnRzIGV2ZW50LW9iaicgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgcmV0dXJuIGBcblxuICAgICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudCB0eXBlLWFjdGlvblwiPlxuICAgICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICAgIDxsaSBjbGFzcz0ndGFnLSR7aXRlbS5ldmVudF90eXBlfSB0YWcnPiR7aXRlbS5ldmVudF90eXBlfTwvbGk+XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgICA8aDIgY2xhc3M9XCJldmVudC10aXRsZVwiPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1kYXRlIGRhdGVcIj4ke2RhdGV9PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWFkZHJlc3MgYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+UlNWUDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICBgXG4gICAgfTtcblxuICAgIGNvbnN0IHJlbmRlckdyb3VwID0gKGl0ZW0sIHJlZmVycmVyID0gbnVsbCwgc291cmNlID0gbnVsbCkgPT4ge1xuICAgICAgbGV0IHVybCA9IGl0ZW0ud2Vic2l0ZS5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLndlYnNpdGUgOiBcIi8vXCIgKyBpdGVtLndlYnNpdGU7XG4gICAgICBsZXQgc3VwZXJHcm91cCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG5cbiAgICAgIHVybCA9IEhlbHBlci5yZWZTb3VyY2UodXJsLCByZWZlcnJlciwgc291cmNlKTtcblxuICAgICAgLy88bGkgY2xhc3M9JyR7aXRlbS5ldmVudF90eXBlfSAke3N1cGVyR3JvdXB9IGdyb3VwLW9iaicgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgcmV0dXJuIGBcbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXAgZ3JvdXAtb2JqXCI+XG4gICAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgICAgPGxpIGNsYXNzPVwidGFnIHRhZy0ke2l0ZW0uc3VwZXJncm91cH1cIj4ke2l0ZW0uc3VwZXJncm91cH08L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPGgyPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLm5hbWV9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWxvY2F0aW9uIGxvY2F0aW9uXCI+JHtpdGVtLmxvY2F0aW9ufTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPkdldCBJbnZvbHZlZDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICBgXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAkbGlzdDogJHRhcmdldCxcbiAgICAgIHVwZGF0ZUZpbHRlcjogKHApID0+IHtcbiAgICAgICAgaWYoIXApIHJldHVybjtcblxuICAgICAgICAvLyBSZW1vdmUgRmlsdGVyc1xuXG4gICAgICAgICR0YXJnZXQucmVtb3ZlUHJvcChcImNsYXNzXCIpO1xuICAgICAgICAkdGFyZ2V0LmFkZENsYXNzKHAuZmlsdGVyID8gcC5maWx0ZXIuam9pbihcIiBcIikgOiAnJylcblxuICAgICAgICAvLyAkdGFyZ2V0LmZpbmQoJ2xpJykuaGlkZSgpO1xuXG4gICAgICAgIGlmIChwLmZpbHRlcikge1xuICAgICAgICAgIHAuZmlsdGVyLmZvckVhY2goKGZpbCk9PntcbiAgICAgICAgICAgICR0YXJnZXQuZmluZChgbGkuJHtmaWx9YCkuc2hvdygpO1xuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB1cGRhdGVCb3VuZHM6IChib3VuZDEsIGJvdW5kMiwgZmlsdGVycykgPT4ge1xuICAgICAgICAvLyBjb25zdCBib3VuZHMgPSBbcC5ib3VuZHMxLCBwLmJvdW5kczJdO1xuXG4gICAgICAgIC8vXG4gICAgICAgIC8vICR0YXJnZXQuZmluZCgndWwgbGkuZXZlbnQtb2JqLCB1bCBsaS5ncm91cC1vYmonKS5lYWNoKChpbmQsIGl0ZW0pPT4ge1xuICAgICAgICAvL1xuICAgICAgICAvLyAgIGxldCBfbGF0ID0gJChpdGVtKS5kYXRhKCdsYXQnKSxcbiAgICAgICAgLy8gICAgICAgX2xuZyA9ICQoaXRlbSkuZGF0YSgnbG5nJyk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgY29uc3QgbWkxMCA9IDAuMTQ0OTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gICBpZiAoYm91bmQxWzBdIDw9IF9sYXQgJiYgYm91bmQyWzBdID49IF9sYXQgJiYgYm91bmQxWzFdIDw9IF9sbmcgJiYgYm91bmQyWzFdID49IF9sbmcpIHtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gICAgICQoaXRlbSkuYWRkQ2xhc3MoJ3dpdGhpbi1ib3VuZCcpO1xuICAgICAgICAvLyAgIH0gZWxzZSB7XG4gICAgICAgIC8vICAgICAkKGl0ZW0pLnJlbW92ZUNsYXNzKCd3aXRoaW4tYm91bmQnKTtcbiAgICAgICAgLy8gICB9XG4gICAgICAgIC8vIH0pO1xuICAgICAgICAvL1xuICAgICAgICAvLyBsZXQgX3Zpc2libGUgPSAkdGFyZ2V0LmZpbmQoJ3VsIGxpLmV2ZW50LW9iai53aXRoaW4tYm91bmQsIHVsIGxpLmdyb3VwLW9iai53aXRoaW4tYm91bmQnKS5sZW5ndGg7XG5cbiAgICAgICAgY29uc3QgZGF0YSA9IHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhLmZpbHRlcigoaXRlbSk9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0eXBlID0gaXRlbS5ldmVudF90eXBlID8gaXRlbS5ldmVudF90eXBlLnRvTG93ZXJDYXNlKCkgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpbHRlcnMgJiYgKGZpbHRlcnMubGVuZ3RoID09IDAgLyogSWYgaXQncyBpbiBmaWx0ZXIgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyB0cnVlIDogZmlsdGVycy5pbmNsdWRlcyh0eXBlICE9ICdncm91cCcgPyB0eXBlIDogd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIC8qIElmIGl0J3MgaW4gYm91bmRzICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChib3VuZDFbMF0gPD0gaXRlbS5sYXQgJiYgYm91bmQyWzBdID49IGl0ZW0ubGF0ICYmIGJvdW5kMVsxXSA8PSBpdGVtLmxuZyAmJiBib3VuZDJbMV0gPj0gaXRlbS5sbmcpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGxpc3RDb250YWluZXIgPSBkM1RhcmdldC5zZWxlY3QoXCJ1bFwiKTtcbiAgICAgICAgbGlzdENvbnRhaW5lci5zZWxlY3RBbGwoXCJsaS5vcmctbGlzdC1pdGVtXCIpLnJlbW92ZSgpO1xuICAgICAgICBsaXN0Q29udGFpbmVyLnNlbGVjdEFsbChcImxpLm9yZy1saXN0LWl0ZW1cIilcbiAgICAgICAgICAuZGF0YShkYXRhLCAoaXRlbSkgPT4gaXRlbS5ldmVudF90eXBlID09ICdncm91cCcgPyBpdGVtLndlYnNpdGUgOiBpdGVtLnVybClcbiAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgIC5hcHBlbmQoJ2xpJylcbiAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgKGl0ZW0pID0+IGl0ZW0uZXZlbnRfdHlwZSAhPSAnZ3JvdXAnID8gJ29yZy1saXN0LWl0ZW0gZXZlbnRzIGV2ZW50LW9iaicgOiAnb3JnLWxpc3QtaXRlbSBncm91cC1vYmonKVxuICAgICAgICAgICAgLmh0bWwoKGl0ZW0pID0+IGl0ZW0uZXZlbnRfdHlwZSAhPSAnZ3JvdXAnID8gcmVuZGVyRXZlbnQoaXRlbSwgcmVmZXJyZXIsIHNvdXJjZSkgOiByZW5kZXJHcm91cChpdGVtKSk7XG5cblxuICAgICAgICBpZiAoZGF0YS5sZW5ndGggPT0gMCkge1xuICAgICAgICAgIC8vIFRoZSBsaXN0IGlzIGVtcHR5XG4gICAgICAgICAgJHRhcmdldC5hZGRDbGFzcyhcImlzLWVtcHR5XCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICR0YXJnZXQucmVtb3ZlQ2xhc3MoXCJpcy1lbXB0eVwiKTtcbiAgICAgICAgfVxuXG4gICAgICB9LFxuICAgICAgcG9wdWxhdGVMaXN0OiAoaGFyZEZpbHRlcnMpID0+IHtcbiAgICAgICAgLy91c2luZyB3aW5kb3cuRVZFTlRfREFUQVxuICAgICAgICBjb25zdCBrZXlTZXQgPSAhaGFyZEZpbHRlcnMua2V5ID8gW10gOiBoYXJkRmlsdGVycy5rZXkuc3BsaXQoJywnKTtcbiAgICAgICAgLy8gdmFyICRldmVudExpc3QgPSB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YS5tYXAoaXRlbSA9PiB7XG4gICAgICAgIC8vICAgaWYgKGtleVNldC5sZW5ndGggPT0gMCkge1xuICAgICAgICAvLyAgICAgcmV0dXJuIGl0ZW0uZXZlbnRfdHlwZSAmJiBpdGVtLmV2ZW50X3R5cGUudG9Mb3dlckNhc2UoKSA9PSAnZ3JvdXAnID8gcmVuZGVyR3JvdXAoaXRlbSkgOiByZW5kZXJFdmVudChpdGVtLCByZWZlcnJlciwgc291cmNlKTtcbiAgICAgICAgLy8gICB9IGVsc2UgaWYgKGtleVNldC5sZW5ndGggPiAwICYmIGl0ZW0uZXZlbnRfdHlwZSAhPSAnZ3JvdXAnICYmIGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKSB7XG4gICAgICAgIC8vICAgICByZXR1cm4gcmVuZGVyRXZlbnQoaXRlbSwgcmVmZXJyZXIsIHNvdXJjZSk7XG4gICAgICAgIC8vICAgfSBlbHNlIGlmIChrZXlTZXQubGVuZ3RoID4gMCAmJiBpdGVtLmV2ZW50X3R5cGUgPT0gJ2dyb3VwJyAmJiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5zdXBlcmdyb3VwKSkge1xuICAgICAgICAvLyAgICAgcmV0dXJuIHJlbmRlckdyb3VwKGl0ZW0sIHJlZmVycmVyLCBzb3VyY2UpXG4gICAgICAgIC8vICAgfVxuICAgICAgICAvLyAgIHJldHVybiBudWxsO1xuICAgICAgICAvLyB9KVxuXG4gICAgICAgIC8vIGNvbnN0IGV2ZW50VHlwZSA9IGl0ZW0uZXZlbnRfdHlwZSA/IGl0ZW0uZXZlbnRfdHlwZS50b0xvd2VyQ2FzZSgpIDogbnVsbDtcbiAgICAgICAgLy8gY29uc3QgaW5pdGlhbERhdGEgPSB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YS5maWx0ZXIoaXRlbSA9PiBrZXlTZXQubGVuZ3RoID09IDBcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdHJ1ZVxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5ldmVudF90eXBlICE9ICdncm91cCcgPyBpdGVtLmV2ZW50X3R5cGUgOiB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApKSk7XG4gICAgICAgIC8vIGNvbnN0IGxpc3RDb250YWluZXIgPSBkM1RhcmdldC5zZWxlY3QoXCJ1bFwiKTtcbiAgICAgICAgLy8gbGlzdENvbnRhaW5lci5zZWxlY3RBbGwoXCJsaVwiKVxuICAgICAgICAvLyAgIC5kYXRhKGluaXRpYWxEYXRhLCAoaXRlbSkgPT4gaXRlbSA/IGl0ZW0udXJsIDogJycpXG4gICAgICAgIC8vICAgLmVudGVyKClcbiAgICAgICAgLy8gICAuYXBwZW5kKCdsaScpXG4gICAgICAgIC8vICAgICAuYXR0cihcImNsYXNzXCIsIChpdGVtKSA9PiBpdGVtLmV2ZW50X3R5cGUgIT0gJ2dyb3VwJyA/ICdldmVudHMgZXZlbnQtb2JqJyA6ICdncm91cC1vYmonKVxuICAgICAgICAvLyAgICAgLmh0bWwoKGl0ZW0pID0+IGl0ZW0uZXZlbnRfdHlwZSAhPSAnZ3JvdXAnID8gcmVuZGVyRXZlbnQoaXRlbSwgcmVmZXJyZXIsIHNvdXJjZSkgOiByZW5kZXJHcm91cChpdGVtKSlcbiAgICAgICAgLy8gICAuZXhpdCgpO1xuICAgICAgICAgIC8vIC5yZW1vdmUoKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2cobGlzdENvbnRhaW5lcik7XG4gICAgICAgIC8vICR0YXJnZXQuZmluZCgndWwgbGknKS5yZW1vdmUoKTtcbiAgICAgICAgLy8gJHRhcmdldC5maW5kKCd1bCcpLmFwcGVuZCgkZXZlbnRMaXN0KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiXG5cbmNvbnN0IE1hcE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgbGV0IExBTkdVQUdFID0gJ2VuJztcblxuICBjb25zdCBwb3B1cCA9IG5ldyBtYXBib3hnbC5Qb3B1cCh7XG4gICAgY2xvc2VPbkNsaWNrOiBmYWxzZVxuICB9KTtcblxuICBjb25zdCByZW5kZXJFdmVudCA9IChpdGVtLCByZWZlcnJlciA9IG51bGwsIHNvdXJjZSA9IG51bGwpID0+IHtcblxuICAgIGxldCBtID0gbW9tZW50KG5ldyBEYXRlKGl0ZW0uc3RhcnRfZGF0ZXRpbWUpKTtcbiAgICBtID0gbS51dGMoKS5zdWJ0cmFjdChtLnV0Y09mZnNldCgpLCAnbScpO1xuXG4gICAgdmFyIGRhdGUgPSBtLmZvcm1hdChcImRkZGQgTU1NIERELCBoOm1tYVwiKTtcbiAgICBsZXQgdXJsID0gaXRlbS51cmwubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS51cmwgOiBcIi8vXCIgKyBpdGVtLnVybDtcblxuICAgIHVybCA9IEhlbHBlci5yZWZTb3VyY2UodXJsLCByZWZlcnJlciwgc291cmNlKTtcblxuICAgIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9J3BvcHVwLWl0ZW0gJHtpdGVtLmV2ZW50X3R5cGV9ICR7c3VwZXJHcm91cH0nIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5ldmVudF90eXBlfVwiPiR7aXRlbS5ldmVudF90eXBlIHx8ICdBY3Rpb24nfTwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxoMiBjbGFzcz1cImV2ZW50LXRpdGxlXCI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1kYXRlXCI+JHtkYXRlfTwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtYWRkcmVzcyBhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+UlNWUDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSwgcmVmZXJyZXIgPSBudWxsLCBzb3VyY2UgPSBudWxsKSA9PiB7XG5cbiAgICBsZXQgdXJsID0gaXRlbS53ZWJzaXRlLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0ud2Vic2l0ZSA6IFwiLy9cIiArIGl0ZW0ud2Vic2l0ZTtcblxuICAgIHVybCA9IEhlbHBlci5yZWZTb3VyY2UodXJsLCByZWZlcnJlciwgc291cmNlKTtcblxuICAgIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICByZXR1cm4gYFxuICAgIDxsaT5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwIGdyb3VwLW9iaiAke3N1cGVyR3JvdXB9XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5zdXBlcmdyb3VwfSAke3N1cGVyR3JvdXB9XCI+JHtpdGVtLnN1cGVyZ3JvdXB9PC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWhlYWRlclwiPlxuICAgICAgICAgIDxoMj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS5uYW1lfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1sb2NhdGlvbiBsb2NhdGlvblwiPiR7aXRlbS5sb2NhdGlvbn08L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGVzY3JpcHRpb25cIj5cbiAgICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9saT5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyQW5ub3RhdGlvblBvcHVwID0gKGl0ZW0pID0+IHtcbiAgICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9J3BvcHVwLWl0ZW0gYW5ub3RhdGlvbicgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnRcIj5cbiAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctYW5ub3RhdGlvblwiPkFubm90YXRpb248L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8aDIgY2xhc3M9XCJldmVudC10aXRsZVwiPiR7aXRlbS5uYW1lfTwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1hZGRyZXNzIGFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgYDtcbiAgfVxuXG5cbiAgY29uc3QgcmVuZGVyQW5ub3RhdGlvbnNHZW9Kc29uID0gKGxpc3QpID0+IHtcbiAgICByZXR1cm4gbGlzdC5tYXAoKGl0ZW0pID0+IHtcbiAgICAgIGNvbnN0IHJlbmRlcmVkID0gcmVuZGVyQW5ub3RhdGlvblBvcHVwKGl0ZW0pO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgIHR5cGU6IFwiUG9pbnRcIixcbiAgICAgICAgICBjb29yZGluYXRlczogW2l0ZW0ubG5nLCBpdGVtLmxhdF1cbiAgICAgICAgfSxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIGFubm90YXRpb25Qcm9wczogaXRlbSxcbiAgICAgICAgICBwb3B1cENvbnRlbnQ6IHJlbmRlcmVkXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgY29uc3QgcmVuZGVyR2VvanNvbiA9IChsaXN0LCByZWYgPSBudWxsLCBzcmMgPSBudWxsKSA9PiB7XG4gICAgcmV0dXJuIGxpc3QubWFwKChpdGVtKSA9PiB7XG4gICAgICAvLyByZW5kZXJlZCBldmVudFR5cGVcbiAgICAgIGxldCByZW5kZXJlZDtcblxuICAgICAgaWYgKGl0ZW0uZXZlbnRfdHlwZSAmJiBpdGVtLmV2ZW50X3R5cGUudG9Mb3dlckNhc2UoKSA9PSAnZ3JvdXAnKSB7XG4gICAgICAgIHJlbmRlcmVkID0gcmVuZGVyR3JvdXAoaXRlbSwgcmVmLCBzcmMpO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZW5kZXJlZCA9IHJlbmRlckV2ZW50KGl0ZW0sIHJlZiwgc3JjKTtcbiAgICAgIH1cblxuICAgICAgLy8gZm9ybWF0IGNoZWNrXG4gICAgICBpZiAoaXNOYU4ocGFyc2VGbG9hdChwYXJzZUZsb2F0KGl0ZW0ubG5nKSkpKSB7XG4gICAgICAgIGl0ZW0ubG5nID0gaXRlbS5sbmcuc3Vic3RyaW5nKDEpXG4gICAgICB9XG4gICAgICBpZiAoaXNOYU4ocGFyc2VGbG9hdChwYXJzZUZsb2F0KGl0ZW0ubGF0KSkpKSB7XG4gICAgICAgIGl0ZW0ubGF0ID0gaXRlbS5sYXQuc3Vic3RyaW5nKDEpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICB0eXBlOiBcIlBvaW50XCIsXG4gICAgICAgICAgY29vcmRpbmF0ZXM6IFtpdGVtLmxuZywgaXRlbS5sYXRdXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBldmVudFByb3BlcnRpZXM6IGl0ZW0sXG4gICAgICAgICAgcG9wdXBDb250ZW50OiByZW5kZXJlZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGdldEV2ZW50R2VvanNvbiA9ICh0YXJnZXRzLCByZWZlcnJlcj1udWxsLCBzb3VyY2U9bnVsbCkgPT4ge1xuICAgICAgICAgIHJldHVybiAoe1xuICAgICAgICAgICAgICBcInR5cGVcIjogXCJGZWF0dXJlQ29sbGVjdGlvblwiLFxuICAgICAgICAgICAgICBcImZlYXR1cmVzXCI6IHRhcmdldHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc29ydCgoeCx5KSA9PiBkMy5kZXNjZW5kaW5nKG5ldyBEYXRlKHguc3RhcnRfZGF0ZXRpbWUpLCBuZXcgRGF0ZSh5LnN0YXJ0X2RhdGV0aW1lKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChpdGVtID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInByb3BlcnRpZXNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaWRcIjogYCR7aXRlbS5sbmd9LSR7aXRlbS5sYXR9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRlc2NyaXB0aW9uXCI6ICByZW5kZXJFdmVudChpdGVtLCByZWZlcnJlciwgc291cmNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlzX3Bhc3RcIjogbmV3IERhdGUoaXRlbS5zdGFydF9kYXRldGltZSkgPCBuZXcgRGF0ZSgpID8gJ3llcycgOiAnbm8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZ2VvbWV0cnlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjb29yZGluYXRlc1wiOiBbaXRlbS5sbmcsIGl0ZW0ubGF0XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICBjb25zdCBnZXRHcm91cEdlb2pzb24gPSAodGFyZ2V0cywgcmVmZXJyZXI9bnVsbCwgc291cmNlPW51bGwpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVDb2xsZWN0aW9uXCIsXG4gICAgICAgICAgXCJmZWF0dXJlc1wiOiB0YXJnZXRzXG4gICAgICAgICAgICAgICAgICAgICAgICAubWFwKGl0ZW0gPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicHJvcGVydGllc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlkXCI6IGAke2l0ZW0ubG5nfS0ke2l0ZW0ubGF0fWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRlc2NyaXB0aW9uXCI6ICByZW5kZXJHcm91cChpdGVtKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJnZW9tZXRyeVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJQb2ludFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjb29yZGluYXRlc1wiOiBbaXRlbS5sbmcsIGl0ZW0ubGF0XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgfTtcbiAgfTtcblxuICByZXR1cm4gKG9wdGlvbnMpID0+IHtcbiAgICB2YXIgYWNjZXNzVG9rZW4gPSAncGsuZXlKMUlqb2liV0YwZEdobGR6TTFNQ0lzSW1FaU9pSmFUVkZNVWtVd0luMC53Y00zWGM4QkdDNlBNLU95cndqbmhnJztcbiAgICB2YXIgbWFwID0gTC5tYXAoJ21hcC1wcm9wZXInLCB7IGRyYWdnaW5nOiAhTC5Ccm93c2VyLm1vYmlsZSB9KS5zZXRWaWV3KFszNC44ODU5MzA5NDA3NTMxNywgNS4wOTc2NTYyNTAwMDAwMDFdLCAyKTtcblxuXG4gICAgbWFwYm94Z2wuYWNjZXNzVG9rZW4gPSAncGsuZXlKMUlqb2liV0YwZEdobGR6TTFNQ0lzSW1FaU9pSmFUVkZNVWtVd0luMC53Y00zWGM4QkdDNlBNLU95cndqbmhnJztcbiAgICBtYXAgPSBuZXcgbWFwYm94Z2wuTWFwKHtcbiAgICAgIGNvbnRhaW5lcjogJ21hcC1wcm9wZXInLFxuICAgICAgc3R5bGU6ICdtYXBib3g6Ly9zdHlsZXMvbWF0dGhldzM1MC9jamE0MXRpamsyN2Q2MnJxb2Q3ZzBseDRiJyxcbiAgICAgIGRvdWJsZUNsaWNrWm9vbTogZmFsc2UsXG4gICAgICBjZW50ZXI6IFszNC44ODU5MzA5NDA3NTMxNywgNS4wOTc2NTYyNTAwMDAwMDFdLFxuICAgICAgem9vbTogMS41XG4gICAgfSk7XG5cbiAgICBsZXQge3JlZmVycmVyLCBzb3VyY2V9ID0gb3B0aW9ucztcblxuICAgIC8vIGlmICghTC5Ccm93c2VyLm1vYmlsZSkge1xuICAgIC8vICAgbWFwLnNjcm9sbFdoZWVsWm9vbS5kaXNhYmxlKCk7XG4gICAgLy8gfVxuXG4gICAgTEFOR1VBR0UgPSBvcHRpb25zLmxhbmcgfHwgJ2VuJztcblxuICAgIGlmIChvcHRpb25zLm9uTW92ZSkge1xuICAgICAgbWFwLm9uKCdkcmFnZW5kJywgKGV2ZW50KSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm5kID0gbWFwLmdldEJvdW5kcygpO1xuICAgICAgICBsZXQgc3cgPSBbYm5kLl9zdy5sYXQsIGJuZC5fc3cubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW2JuZC5fbmUubGF0LCBibmQuX25lLmxuZ107XG4gICAgICAgIG9wdGlvbnMub25Nb3ZlKHN3LCBuZSk7XG4gICAgICB9KS5vbignem9vbWVuZCcsIChldmVudCkgPT4ge1xuICAgICAgICBpZiAobWFwLmdldFpvb20oKSA8PSA0KSB7XG4gICAgICAgICAgJChcIiNtYXBcIikuYWRkQ2xhc3MoXCJ6b29tZWQtb3V0XCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICQoXCIjbWFwXCIpLnJlbW92ZUNsYXNzKFwiem9vbWVkLW91dFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJuZCA9IG1hcC5nZXRCb3VuZHMoKTtcbiAgICAgICAgbGV0IHN3ID0gW2JuZC5fc3cubGF0LCBibmQuX3N3LmxuZ107XG4gICAgICAgIGxldCBuZSA9IFtibmQuX25lLmxhdCwgYm5kLl9uZS5sbmddO1xuICAgICAgICBvcHRpb25zLm9uTW92ZShzdywgbmUpO1xuICAgICAgfSlcblxuICAgIH1cblxuICAgIC8vIG1hcC5maXJlRXZlbnQoJ3pvb21lbmQnKTtcblxuICAgIC8vIEwudGlsZUxheWVyKCdodHRwczovL2FwaS5tYXBib3guY29tL3N0eWxlcy92MS9tYXR0aGV3MzUwL2NqYTQxdGlqazI3ZDYycnFvZDdnMGx4NGIvdGlsZXMvMjU2L3t6fS97eH0ve3l9P2FjY2Vzc190b2tlbj0nICsgYWNjZXNzVG9rZW4sIHtcbiAgICAvLyAgICAgYXR0cmlidXRpb246ICcmY29weTsgPGEgaHJlZj1cImh0dHA6Ly9vc20ub3JnL2NvcHlyaWdodFwiPk9wZW5TdHJlZXRNYXA8L2E+IGNvbnRyaWJ1dG9ycyDigKIgPGEgaHJlZj1cIi8vMzUwLm9yZ1wiPjM1MC5vcmc8L2E+J1xuICAgIC8vIH0pLmFkZFRvKG1hcCk7XG5cbiAgICAvLyBjb25zb2xlLmxvZyh3aW5kb3cucXVlcmllc1sndHdpbGlnaHQtem9uZSddLCB3aW5kb3cucXVlcmllc1sndHdpbGlnaHQtem9uZSddID09PSBcInRydWVcIik7XG4gICAgaWYod2luZG93LnF1ZXJpZXNbJ3R3aWxpZ2h0LXpvbmUnXSkge1xuICAgICAgTC50ZXJtaW5hdG9yKCkuYWRkVG8obWFwKVxuICAgIH1cblxuICAgIGxldCBnZW9jb2RlciA9IG51bGw7XG4gICAgcmV0dXJuIHtcbiAgICAgICRtYXA6IG1hcCxcbiAgICAgIGluaXRpYWxpemU6IChjYWxsYmFjaykgPT4ge1xuICAgICAgICBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgc2V0Qm91bmRzOiAoYm91bmRzMSwgYm91bmRzMikgPT4ge1xuXG4gICAgICAgIC8vIGNvbnN0IGJvdW5kcyA9IFtib3VuZHMxLCBib3VuZHMyXTtcbiAgICAgICAgY29uc3QgYm91bmRzID0gW2JvdW5kczEucmV2ZXJzZSgpLCBib3VuZHMyLnJldmVyc2UoKV07IC8vIG1hcGJveFxuICAgICAgICBtYXAuZml0Qm91bmRzKGJvdW5kcywgeyBhbmltYXRlOiBmYWxzZX0pO1xuICAgICAgfSxcbiAgICAgIHNldENlbnRlcjogKGNlbnRlciwgem9vbSA9IDEwKSA9PiB7XG4gICAgICAgIGlmICghY2VudGVyIHx8ICFjZW50ZXJbMF0gfHwgY2VudGVyWzBdID09IFwiXCJcbiAgICAgICAgICAgICAgfHwgIWNlbnRlclsxXSB8fCBjZW50ZXJbMV0gPT0gXCJcIikgcmV0dXJuO1xuICAgICAgICBtYXAuc2V0VmlldyhjZW50ZXIsIHpvb20pO1xuICAgICAgfSxcbiAgICAgIGdldEJvdW5kczogKCkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGJuZCA9IG1hcC5nZXRCb3VuZHMoKVxuICAgICAgICBsZXQgc3cgPSBbYm5kLl9zdy5sYXQsIGJuZC5fc3cubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW2JuZC5fbmUubGF0LCBibmQuX25lLmxuZ107XG5cbiAgICAgICAgcmV0dXJuIFtzdywgbmVdO1xuICAgICAgfSxcbiAgICAgIC8vIENlbnRlciBsb2NhdGlvbiBieSBnZW9jb2RlZFxuICAgICAgZ2V0Q2VudGVyQnlMb2NhdGlvbjogKGxvY2F0aW9uLCBjYWxsYmFjaykgPT4ge1xuXG4gICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBsb2NhdGlvbiB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG5cbiAgICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXN1bHRzWzBdKVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgdHJpZ2dlclpvb21FbmQ6ICgpID0+IHtcbiAgICAgICAgLy8gbWFwLmZpcmVFdmVudCgnem9vbWVuZCcpO1xuICAgICAgfSxcbiAgICAgIHpvb21PdXRPbmNlOiAoKSA9PiB7XG4gICAgICAgIG1hcC56b29tT3V0KDEpO1xuICAgICAgfSxcbiAgICAgIHpvb21VbnRpbEhpdDogKCkgPT4ge1xuICAgICAgICB2YXIgJHRoaXMgPSB0aGlzO1xuICAgICAgICBtYXAuem9vbU91dCgxKTtcbiAgICAgICAgbGV0IGludGVydmFsSGFuZGxlciA9IG51bGw7XG4gICAgICAgIGludGVydmFsSGFuZGxlciA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICB2YXIgX3Zpc2libGUgPSAkKGRvY3VtZW50KS5maW5kKCd1bCBsaS5ldmVudC1vYmosIHVsIGxpLmdyb3VwLW9iaicpLmxlbmd0aDtcbiAgICAgICAgICBpZiAoX3Zpc2libGUgPT0gMCkge1xuICAgICAgICAgICAgbWFwLnpvb21PdXQoMSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxIYW5kbGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIDIwMCk7XG4gICAgICB9LFxuICAgICAgcmVmcmVzaE1hcDogKCkgPT4ge1xuICAgICAgICAvLyAgbWFwLmludmFsaWRhdGVTaXplKGZhbHNlKTtcbiAgICAgICAgLy8gbWFwLl9vblJlc2l6ZSgpO1xuICAgICAgICAvLyBtYXAuZmlyZUV2ZW50KCd6b29tZW5kJyk7XG5cblxuICAgICAgfSxcbiAgICAgIGZpbHRlck1hcDogKGZpbHRlcnMpID0+IHtcblxuICAgICAgICAvLyBUT0RPIG1hcGJveCB0aGlzLlxuICAgICAgICAkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXBcIikuaGlkZSgpO1xuICAgICAgICBpZiAoIWZpbHRlcnMpIHJldHVybjtcbiAgICAgICAgZmlsdGVycy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwLlwiICsgaXRlbS50b0xvd2VyQ2FzZSgpKS5zaG93KCk7XG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgcGxvdFBvaW50czogKGxpc3QsIGhhcmRGaWx0ZXJzLCBncm91cHMpID0+IHtcbiAgICAgICAgY29uc3Qga2V5U2V0ID0gIWhhcmRGaWx0ZXJzLmtleSA/IFtdIDogaGFyZEZpbHRlcnMua2V5LnNwbGl0KCcsJyk7XG4gICAgICAgIGlmIChrZXlTZXQubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGxpc3QgPSBsaXN0LmZpbHRlcigoaXRlbSkgPT4ga2V5U2V0LmluY2x1ZGVzKGl0ZW0uZXZlbnRfdHlwZSkpXG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb2xvciB0aGUgbWFwXG4gICAgICAgIGZvciAobGV0IGkgaW4gZ3JvdXBzKSB7XG4gICAgICAgICAgY29uc3QgZ3JvdXAgPSBncm91cHNbaV07XG4gICAgICAgICAgY29uc3QgdGFyZ2V0cyA9IGxpc3QuZmlsdGVyKGl0ZW0gPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmV2ZW50X3R5cGUgPT0gXCJncm91cFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGl0ZW0uc3VwZXJncm91cCA9PSBncm91cC5zdXBlcmdyb3VwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGl0ZW0uZXZlbnRfdHlwZSA9PSB3aW5kb3cuc2x1Z2lmeShncm91cC5zdXBlcmdyb3VwKSk7XG5cblxuXG4gICAgICAgICAgICAvLyBpdGVtLmNhdGVnb3JpZXMgPT0gXCJibG9ja3dhbGtcIjtcbiAgICAgICAgICBpZiAoaSA9PSBcIkV2ZW50c1wiKSB7XG4gICAgICAgICAgICBjb25zdCBnZW9qc29uID1nZXRFdmVudEdlb2pzb24odGFyZ2V0cywgcmVmZXJyZXIsIHNvdXJjZSk7XG4gICAgICAgICAgICBtYXAuYWRkTGF5ZXIoe1xuICAgICAgICAgICAgICBcImlkXCI6IFwiZXZlbnRzXCIsXG4gICAgICAgICAgICAgIFwidHlwZVwiOiBcImNpcmNsZVwiLFxuICAgICAgICAgICAgICBcInNvdXJjZVwiOiB7XG4gICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiZ2VvanNvblwiLFxuICAgICAgICAgICAgICAgIFwiZGF0YVwiOiBnZW9qc29uXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIFwicGFpbnRcIjoge1xuICAgICAgICAgICAgICAgIFwiY2lyY2xlLXJhZGl1c1wiOiBbXG4gICAgICAgICAgICAgICAgICAgIFwiaW50ZXJwb2xhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgW1wibGluZWFyXCJdLFxuICAgICAgICAgICAgICAgICAgICBbXCJ6b29tXCJdLFxuICAgICAgICAgICAgICAgICAgICA4LFxuICAgICAgICAgICAgICAgICAgICAzLFxuICAgICAgICAgICAgICAgICAgICAxMyxcbiAgICAgICAgICAgICAgICAgICAgNlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgXCJjaXJjbGUtY29sb3JcIjogWydjYXNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFsnPT0nLCBbJ2dldCcsICdpc19wYXN0J10sICd5ZXMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiI0JCQkJCQlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIjNDBkN2Q0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBcImNpcmNsZS1vcGFjaXR5XCI6IDAuOSxcbiAgICAgICAgICAgICAgICBcImNpcmNsZS1zdHJva2Utd2lkdGhcIjogMixcbiAgICAgICAgICAgICAgICBcImNpcmNsZS1zdHJva2UtY29sb3JcIjogXCJ3aGl0ZVwiLFxuICAgICAgICAgICAgICAgIFwiY2lyY2xlLXN0cm9rZS1vcGFjaXR5XCI6IDFcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGdlb2pzb24gPSBnZXRHcm91cEdlb2pzb24odGFyZ2V0cywgZ3JvdXAsIHJlZmVycmVyLCBzb3VyY2UpO1xuICAgICAgICAgICAgbGV0IGljb24gPSBudWxsO1xuICAgICAgICAgICAgaWYgKGkgPT0gXCJMb2NhbCBHcm91cHNcIikge1xuICAgICAgICAgICAgICBpY29uID0gXCIvaW1nL2dyb3VwLnBuZ1wiO1xuICAgICAgICAgICAgfSBlbHNlIGlmICggaSA9PSBcIlJlZ2lvbmFsIEh1YnNcIikge1xuICAgICAgICAgICAgICBpY29uID0gXCIvaW1nL2ZsYWcucG5nXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtYXAubG9hZEltYWdlKGljb24sIChlcnJvcixncm91cEljb24pID0+IHtcblxuICAgICAgICAgICAgICBtYXAuYWRkSW1hZ2UoYCR7d2luZG93LnNsdWdpZnkoaSl9LWljb25gLCBncm91cEljb24pO1xuICAgICAgICAgICAgICBtYXAuYWRkTGF5ZXIoe1xuICAgICAgICAgICAgICAgIFwiaWRcIjogd2luZG93LnNsdWdpZnkoaSksXG4gICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwic3ltYm9sXCIsXG4gICAgICAgICAgICAgICAgXCJzb3VyY2VcIjoge1xuICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiZ2VvanNvblwiLFxuICAgICAgICAgICAgICAgICAgXCJkYXRhXCI6IGdlb2pzb25cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFwibGF5b3V0XCI6IHtcbiAgICAgICAgICAgICAgICAgICdpY29uLWFsbG93LW92ZXJsYXAnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgJ2ljb24taWdub3JlLXBsYWNlbWVudCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAndGV4dC1pZ25vcmUtcGxhY2VtZW50JzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICd0ZXh0LWFsbG93LW92ZXJsYXAnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgXCJpY29uLWltYWdlXCI6IGAke3dpbmRvdy5zbHVnaWZ5KGkpfS1pY29uYCxcbiAgICAgICAgICAgICAgICAgIFwiaWNvbi1zaXplXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICBcImludGVycG9sYXRlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgW1wibGluZWFyXCJdLFxuICAgICAgICAgICAgICAgICAgICAgIFtcInpvb21cIl0sXG4gICAgICAgICAgICAgICAgICAgICAgNCxcbiAgICAgICAgICAgICAgICAgICAgICAwLjA5LFxuICAgICAgICAgICAgICAgICAgICAgIDksXG4gICAgICAgICAgICAgICAgICAgICAgMC4xNVxuICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG1hcC5vbihcImNsaWNrXCIsIHdpbmRvdy5zbHVnaWZ5KGkpLCAoZSkgPT4ge1xuICAgICAgICAgICAgdmFyIGNvb3JkaW5hdGVzID0gZS5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlcy5zbGljZSgpO1xuICAgICAgICAgICAgdmFyIGRlc2NyaXB0aW9uID0gZS5mZWF0dXJlc1swXS5wcm9wZXJ0aWVzLmRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgcG9wdXAuc2V0TG5nTGF0KGNvb3JkaW5hdGVzKVxuICAgICAgICAgICAgICAgICAgLnNldEhUTUwoZGVzY3JpcHRpb24pXG4gICAgICAgICAgICAgICAgICAuYWRkVG8obWFwKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgX29sZFBsb3RQb2ludHM6IChsaXN0LCBoYXJkRmlsdGVycywgZ3JvdXBzKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleVNldCA9ICFoYXJkRmlsdGVycy5rZXkgPyBbXSA6IGhhcmRGaWx0ZXJzLmtleS5zcGxpdCgnLCcpO1xuICAgICAgICBpZiAoa2V5U2V0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsaXN0ID0gbGlzdC5maWx0ZXIoKGl0ZW0pID0+IGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGdlb2pzb24gPSB7XG4gICAgICAgICAgdHlwZTogXCJGZWF0dXJlQ29sbGVjdGlvblwiLFxuICAgICAgICAgIGZlYXR1cmVzOiByZW5kZXJHZW9qc29uKGxpc3QsIHJlZmVycmVyLCBzb3VyY2UpXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGV2ZW50c0xheWVyID0gTC5nZW9KU09OKGdlb2pzb24sIHtcbiAgICAgICAgICAgIHBvaW50VG9MYXllcjogKGZlYXR1cmUsIGxhdGxuZykgPT4ge1xuICAgICAgICAgICAgICAvLyBJY29ucyBmb3IgbWFya2Vyc1xuICAgICAgICAgICAgICBjb25zdCBldmVudFR5cGUgPSBmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLmV2ZW50X3R5cGU7XG4gICAgICAgICAgICAgIC8vIElmIG5vIHN1cGVyZ3JvdXAsIGl0J3MgYW4gZXZlbnQuXG4gICAgICAgICAgICAgIGNvbnN0IHN1cGVyZ3JvdXAgPSBncm91cHNbZmVhdHVyZS5wcm9wZXJ0aWVzLmV2ZW50UHJvcGVydGllcy5zdXBlcmdyb3VwXSA/IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuc3VwZXJncm91cCA6IFwiRXZlbnRzXCI7XG4gICAgICAgICAgICAgIGNvbnN0IHNsdWdnZWQgPSB3aW5kb3cuc2x1Z2lmeShzdXBlcmdyb3VwKTtcbiAgICAgICAgICAgICAgbGV0IGljb25Vcmw7XG4gICAgICAgICAgICAgIGNvbnN0IGlzUGFzdCA9IG5ldyBEYXRlKGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuc3RhcnRfZGF0ZXRpbWUpIDwgbmV3IERhdGUoKTtcbiAgICAgICAgICAgICAgaWYgKGV2ZW50VHlwZSA9PSBcIkFjdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgaWNvblVybCA9IGlzUGFzdCA/IFwiL2ltZy9wYXN0LWV2ZW50LnBuZ1wiIDogXCIvaW1nL2V2ZW50LnBuZ1wiO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGljb25VcmwgPSBncm91cHNbc3VwZXJncm91cF0gPyBncm91cHNbc3VwZXJncm91cF0uaWNvbnVybCB8fCBcIi9pbWcvZXZlbnQucG5nXCIgIDogXCIvaW1nL2V2ZW50LnBuZ1wiIDtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNvbnN0IHNtYWxsSWNvbiA9ICBMLmljb24oe1xuICAgICAgICAgICAgICAgIGljb25Vcmw6IGljb25VcmwsXG4gICAgICAgICAgICAgICAgaWNvblNpemU6IFsxOCwgMThdLFxuICAgICAgICAgICAgICAgIGljb25BbmNob3I6IFs5LCA5XSxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IHNsdWdnZWQgKyAnIGV2ZW50LWl0ZW0tcG9wdXAgJyArIChpc1Bhc3QmJmV2ZW50VHlwZSA9PSBcIkFjdGlvblwiP1wiZXZlbnQtcGFzdC1ldmVudFwiOlwiXCIpXG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgIHZhciBnZW9qc29uTWFya2VyT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBpY29uOiBzbWFsbEljb24sXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJldHVybiBMLm1hcmtlcihsYXRsbmcsIGdlb2pzb25NYXJrZXJPcHRpb25zKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICBvbkVhY2hGZWF0dXJlOiAoZmVhdHVyZSwgbGF5ZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChmZWF0dXJlLnByb3BlcnRpZXMgJiYgZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCkge1xuICAgICAgICAgICAgICBsYXllci5iaW5kUG9wdXAoZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBldmVudHNMYXllci5hZGRUbyhtYXApO1xuICAgICAgICAvLyBldmVudHNMYXllci5icmluZ1RvQmFjaygpO1xuXG5cbiAgICAgICAgLy8gQWRkIEFubm90YXRpb25zXG4gICAgICAgIGlmICh3aW5kb3cucXVlcmllcy5hbm5vdGF0aW9uKSB7XG4gICAgICAgICAgY29uc3QgYW5ub3RhdGlvbnMgPSAhd2luZG93LkVWRU5UU19EQVRBLmFubm90YXRpb25zID8gW10gOiB3aW5kb3cuRVZFTlRTX0RBVEEuYW5ub3RhdGlvbnMuZmlsdGVyKChpdGVtKT0+aXRlbS50eXBlPT09d2luZG93LnF1ZXJpZXMuYW5ub3RhdGlvbik7XG5cbiAgICAgICAgICBjb25zdCBhbm5vdEljb24gPSAgTC5pY29uKHtcbiAgICAgICAgICAgIGljb25Vcmw6IFwiL2ltZy9hbm5vdGF0aW9uLnBuZ1wiLFxuICAgICAgICAgICAgaWNvblNpemU6IFs0MCwgNDBdLFxuICAgICAgICAgICAgaWNvbkFuY2hvcjogWzIwLCAyMF0sXG4gICAgICAgICAgICBjbGFzc05hbWU6ICdhbm5vdGF0aW9uLXBvcHVwJ1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNvbnN0IGFubm90TWFya2VycyA9IGFubm90YXRpb25zLm1hcChpdGVtID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIEwubWFya2VyKFtpdGVtLmxhdCwgaXRlbS5sbmddLCB7aWNvbjogYW5ub3RJY29ufSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5iaW5kUG9wdXAocmVuZGVyQW5ub3RhdGlvblBvcHVwKGl0ZW0pKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gYW5ub3RMYXllci5icmluZ1RvRnJvbnQoKTtcblxuICAgICAgICAgIC8vIGNvbnN0IGFubm90TGF5ZXJHcm91cCA9IDtcblxuICAgICAgICAgIGNvbnN0IGFubm90TGF5ZXJHcm91cCA9IG1hcC5hZGRMYXllcihMLmZlYXR1cmVHcm91cChhbm5vdE1hcmtlcnMpKTtcbiAgICAgICAgICAvLyBhbm5vdExheWVyR3JvdXAuYnJpbmdUb0Zyb250KCk7XG4gICAgICAgICAgLy8gYW5ub3RNYXJrZXJzLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgLy8gICBpdGVtLmFkZFRvKG1hcCk7XG4gICAgICAgICAgLy8gICBpdGVtLmJyaW5nVG9Gcm9udCgpO1xuICAgICAgICAgIC8vIH0pXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB1cGRhdGU6IChwKSA9PiB7XG4gICAgICAgIGlmICghcCB8fCAhcC5sYXQgfHwgIXAubG5nICkgcmV0dXJuO1xuXG4gICAgICAgIG1hcC5zZXRWaWV3KEwubGF0TG5nKHAubGF0LCBwLmxuZyksIDEwKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiY29uc3QgUXVlcnlNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIHJldHVybiAodGFyZ2V0Rm9ybSA9IFwiZm9ybSNmaWx0ZXJzLWZvcm1cIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0Rm9ybSA9PT0gJ3N0cmluZycgPyAkKHRhcmdldEZvcm0pIDogdGFyZ2V0Rm9ybTtcbiAgICBsZXQgbGF0ID0gbnVsbDtcbiAgICBsZXQgbG5nID0gbnVsbDtcblxuICAgIGxldCBwcmV2aW91cyA9IHt9O1xuXG4gICAgJHRhcmdldC5vbignc3VibWl0JywgKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGxhdCA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwoKTtcbiAgICAgIGxuZyA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwoKTtcblxuICAgICAgdmFyIGZvcm0gPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG5cbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJC5wYXJhbShmb3JtKTtcbiAgICB9KVxuXG4gICAgJChkb2N1bWVudCkub24oJ2NoYW5nZScsICdzZWxlY3QjZmlsdGVyLWl0ZW1zJywgKCkgPT4ge1xuICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICB9KVxuXG5cbiAgICByZXR1cm4ge1xuICAgICAgaW5pdGlhbGl6ZTogKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdmFyIHBhcmFtcyA9ICQuZGVwYXJhbSh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkpXG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYW5nXVwiKS52YWwocGFyYW1zLmxhbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwocGFyYW1zLmxhdCk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChwYXJhbXMubG5nKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKHBhcmFtcy5ib3VuZDEpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwocGFyYW1zLmJvdW5kMik7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sb2NdXCIpLnZhbChwYXJhbXMubG9jKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWtleV1cIikudmFsKHBhcmFtcy5rZXkpO1xuXG4gICAgICAgICAgaWYgKHBhcmFtcy5maWx0ZXIpIHtcbiAgICAgICAgICAgICR0YXJnZXQuZmluZChcIiNmaWx0ZXItaXRlbXMgb3B0aW9uXCIpLnJlbW92ZVByb3AoXCJzZWxlY3RlZFwiKTtcbiAgICAgICAgICAgIHBhcmFtcy5maWx0ZXIuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiI2ZpbHRlci1pdGVtcyBvcHRpb25bdmFsdWU9J1wiICsgaXRlbSArIFwiJ11cIikucHJvcChcInNlbGVjdGVkXCIsIHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBnZXRQYXJhbWV0ZXJzOiAoKSA9PiB7XG4gICAgICAgIHZhciBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuICAgICAgICAvLyBwYXJhbWV0ZXJzWydsb2NhdGlvbiddIDtcblxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBwYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgaWYgKCAhcGFyYW1ldGVyc1trZXldIHx8IHBhcmFtZXRlcnNba2V5XSA9PSBcIlwiKSB7XG4gICAgICAgICAgICBkZWxldGUgcGFyYW1ldGVyc1trZXldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJhbWV0ZXJzO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZUxvY2F0aW9uOiAobGF0LCBsbmcpID0+IHtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChsYXQpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKGxuZyk7XG4gICAgICAgIC8vICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlVmlld3BvcnQ6ICh2aWV3cG9ydCkgPT4ge1xuXG4gICAgICAgIC8vIEF2ZXJhZ2UgaXQgaWYgbGVzcyB0aGFuIDEwbWkgcmFkaXVzXG4gICAgICAgIGlmIChNYXRoLmFicyh2aWV3cG9ydC5mLmIgLSB2aWV3cG9ydC5mLmYpIDwgLjE1IHx8IE1hdGguYWJzKHZpZXdwb3J0LmIuYiAtIHZpZXdwb3J0LmIuZikgPCAuMTUpIHtcbiAgICAgICAgICBsZXQgZkF2ZyA9ICh2aWV3cG9ydC5mLmIgKyB2aWV3cG9ydC5mLmYpIC8gMjtcbiAgICAgICAgICBsZXQgYkF2ZyA9ICh2aWV3cG9ydC5iLmIgKyB2aWV3cG9ydC5iLmYpIC8gMjtcbiAgICAgICAgICB2aWV3cG9ydC5mID0geyBiOiBmQXZnIC0gLjA4LCBmOiBmQXZnICsgLjA4IH07XG4gICAgICAgICAgdmlld3BvcnQuYiA9IHsgYjogYkF2ZyAtIC4wOCwgZjogYkF2ZyArIC4wOCB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtbdmlld3BvcnQuZi5iLCB2aWV3cG9ydC5iLmJdLCBbdmlld3BvcnQuZi5mLCB2aWV3cG9ydC5iLmZdXTtcblxuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1swXSkpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1sxXSkpO1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZVZpZXdwb3J0QnlCb3VuZDogKHN3LCBuZSkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtzdywgbmVdOy8vLy8vLy8vXG5cblxuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1swXSkpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1sxXSkpO1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHRyaWdnZXJTdWJtaXQ6ICgpID0+IHtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJsZXQgYXV0b2NvbXBsZXRlTWFuYWdlcjtcbmxldCBtYXBNYW5hZ2VyO1xuXG53aW5kb3cuREVGQVVMVF9JQ09OID0gXCIvaW1nL2V2ZW50LnBuZ1wiO1xud2luZG93LnNsdWdpZnkgPSAodGV4dCkgPT4gIXRleHQgPyB0ZXh0IDogdGV4dC50b1N0cmluZygpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxzKy9nLCAnLScpICAgICAgICAgICAvLyBSZXBsYWNlIHNwYWNlcyB3aXRoIC1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvW15cXHdcXC1dKy9nLCAnJykgICAgICAgLy8gUmVtb3ZlIGFsbCBub24td29yZCBjaGFyc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXC1cXC0rL2csICctJykgICAgICAgICAvLyBSZXBsYWNlIG11bHRpcGxlIC0gd2l0aCBzaW5nbGUgLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9eLSsvLCAnJykgICAgICAgICAgICAgLy8gVHJpbSAtIGZyb20gc3RhcnQgb2YgdGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8tKyQvLCAnJyk7ICAgICAgICAgICAgLy8gVHJpbSAtIGZyb20gZW5kIG9mIHRleHRcblxuY29uc3QgZ2V0UXVlcnlTdHJpbmcgPSAoKSA9PiB7XG4gICAgdmFyIHF1ZXJ5U3RyaW5nS2V5VmFsdWUgPSB3aW5kb3cucGFyZW50LmxvY2F0aW9uLnNlYXJjaC5yZXBsYWNlKCc/JywgJycpLnNwbGl0KCcmJyk7XG4gICAgdmFyIHFzSnNvbk9iamVjdCA9IHt9O1xuICAgIGlmIChxdWVyeVN0cmluZ0tleVZhbHVlICE9ICcnKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcXVlcnlTdHJpbmdLZXlWYWx1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcXNKc29uT2JqZWN0W3F1ZXJ5U3RyaW5nS2V5VmFsdWVbaV0uc3BsaXQoJz0nKVswXV0gPSBxdWVyeVN0cmluZ0tleVZhbHVlW2ldLnNwbGl0KCc9JylbMV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHFzSnNvbk9iamVjdDtcbn07XG5cbihmdW5jdGlvbigkKSB7XG4gIC8vIExvYWQgdGhpbmdzXG5cbiAgd2luZG93LnF1ZXJpZXMgPSAgJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyaW5nKDEpKTtcbiAgdHJ5IHtcbiAgICBpZiAoKCF3aW5kb3cucXVlcmllcy5ncm91cCB8fCAoIXdpbmRvdy5xdWVyaWVzLnJlZmVycmVyICYmICF3aW5kb3cucXVlcmllcy5zb3VyY2UpKSAmJiB3aW5kb3cucGFyZW50KSB7XG4gICAgICB3aW5kb3cucXVlcmllcyA9IHtcbiAgICAgICAgZ3JvdXA6IGdldFF1ZXJ5U3RyaW5nKCkuZ3JvdXAsXG4gICAgICAgIHJlZmVycmVyOiBnZXRRdWVyeVN0cmluZygpLnJlZmVycmVyLFxuICAgICAgICBzb3VyY2U6IGdldFF1ZXJ5U3RyaW5nKCkuc291cmNlLFxuICAgICAgICBcInR3aWxpZ2h0LXpvbmVcIjogd2luZG93LnF1ZXJpZXNbJ3R3aWxpZ2h0LXpvbmUnXSxcbiAgICAgICAgXCJhbm5vdGF0aW9uXCI6IHdpbmRvdy5xdWVyaWVzWydhbm5vdGF0aW9uJ10sXG4gICAgICAgIFwiZnVsbC1tYXBcIjogd2luZG93LnF1ZXJpZXNbJ2Z1bGwtbWFwJ10sXG4gICAgICAgIFwibGFuZ1wiOiB3aW5kb3cucXVlcmllc1snbGFuZyddXG4gICAgICB9O1xuICAgIH1cbiAgfSBjYXRjaChlKSB7XG4gICAgY29uc29sZS5sb2coXCJFcnJvcjogXCIsIGUpO1xuICB9XG5cbiAgaWYgKHdpbmRvdy5xdWVyaWVzWydmdWxsLW1hcCddKSB7XG4gICAgaWYgKCQod2luZG93KS53aWR0aCgpIDwgNjAwKSB7XG4gICAgICAvLyAkKFwiI2V2ZW50cy1saXN0LWNvbnRhaW5lclwiKS5oaWRlKCk7XG4gICAgICAkKFwiYm9keVwiKS5hZGRDbGFzcyhcIm1hcC12aWV3XCIpO1xuICAgICAgLy8gJChcIi5maWx0ZXItYXJlYVwiKS5oaWRlKCk7XG4gICAgICAvLyAkKFwic2VjdGlvbiNtYXBcIikuY3NzKFwiaGVpZ2h0XCIsIFwiY2FsYygxMDAlIC0gNjRweClcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgICQoXCJib2R5XCIpLmFkZENsYXNzKFwiZmlsdGVyLWNvbGxhcHNlZFwiKTtcbiAgICAgIC8vICQoXCIjZXZlbnRzLWxpc3QtY29udGFpbmVyXCIpLmhpZGUoKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgJChcIiNzaG93LWhpZGUtbGlzdC1jb250YWluZXJcIikuaGlkZSgpO1xuICB9XG5cblxuICBpZiAod2luZG93LnF1ZXJpZXMuZ3JvdXApIHtcbiAgICAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykucGFyZW50KCkuY3NzKFwib3BhY2l0eVwiLCBcIjBcIik7XG4gIH1cbiAgY29uc3QgYnVpbGRGaWx0ZXJzID0gKCkgPT4geyQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5tdWx0aXNlbGVjdCh7XG4gICAgICBlbmFibGVIVE1MOiB0cnVlLFxuICAgICAgdGVtcGxhdGVzOiB7XG4gICAgICAgIGJ1dHRvbjogJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwibXVsdGlzZWxlY3QgZHJvcGRvd24tdG9nZ2xlXCIgZGF0YS10b2dnbGU9XCJkcm9wZG93blwiPjxzcGFuIGRhdGEtbGFuZy10YXJnZXQ9XCJ0ZXh0XCIgZGF0YS1sYW5nLWtleT1cIm1vcmUtc2VhcmNoLW9wdGlvbnNcIj48L3NwYW4+IDxzcGFuIGNsYXNzPVwiZmEgZmEtY2FyZXQtZG93blwiPjwvc3Bhbj48L2J1dHRvbj4nLFxuICAgICAgICBsaTogJzxsaT48YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPjxsYWJlbD48L2xhYmVsPjwvYT48L2xpPidcbiAgICAgIH0sXG4gICAgICBkcm9wUmlnaHQ6IHRydWUsXG4gICAgICBvbkluaXRpYWxpemVkOiAoKSA9PiB7XG5cbiAgICAgIH0sXG4gICAgICBvbkRyb3Bkb3duU2hvdzogKCkgPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwibW9iaWxlLXVwZGF0ZS1tYXAtaGVpZ2h0XCIpO1xuICAgICAgICB9LCAxMCk7XG5cbiAgICAgIH0sXG4gICAgICBvbkRyb3Bkb3duSGlkZTogKCkgPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwibW9iaWxlLXVwZGF0ZS1tYXAtaGVpZ2h0XCIpO1xuICAgICAgICB9LCAxMCk7XG4gICAgICB9LFxuICAgICAgb3B0aW9uTGFiZWw6IChlKSA9PiB7XG4gICAgICAgIC8vIGxldCBlbCA9ICQoICc8ZGl2PjwvZGl2PicgKTtcbiAgICAgICAgLy8gZWwuYXBwZW5kKCgpICsgXCJcIik7XG5cbiAgICAgICAgcmV0dXJuIHVuZXNjYXBlKCQoZSkuYXR0cignbGFiZWwnKSkgfHwgJChlKS5odG1sKCk7XG4gICAgICB9LFxuICAgIH0pO1xuICB9O1xuICBidWlsZEZpbHRlcnMoKTtcblxuXG4gICQoJ3NlbGVjdCNsYW5ndWFnZS1vcHRzJykubXVsdGlzZWxlY3Qoe1xuICAgIGVuYWJsZUhUTUw6IHRydWUsXG4gICAgb3B0aW9uQ2xhc3M6ICgpID0+ICdsYW5nLW9wdCcsXG4gICAgc2VsZWN0ZWRDbGFzczogKCkgPT4gJ2xhbmctc2VsJyxcbiAgICBidXR0b25DbGFzczogKCkgPT4gJ2xhbmctYnV0JyxcbiAgICBkcm9wUmlnaHQ6IHRydWUsXG4gICAgb3B0aW9uTGFiZWw6IChlKSA9PiB7XG4gICAgICAvLyBsZXQgZWwgPSAkKCAnPGRpdj48L2Rpdj4nICk7XG4gICAgICAvLyBlbC5hcHBlbmQoKCkgKyBcIlwiKTtcblxuICAgICAgcmV0dXJuIHVuZXNjYXBlKCQoZSkuYXR0cignbGFiZWwnKSkgfHwgJChlKS5odG1sKCk7XG4gICAgfSxcbiAgICBvbkNoYW5nZTogKG9wdGlvbiwgY2hlY2tlZCwgc2VsZWN0KSA9PiB7XG5cbiAgICAgIGNvbnN0IHBhcmFtZXRlcnMgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuICAgICAgcGFyYW1ldGVyc1snbGFuZyddID0gb3B0aW9uLnZhbCgpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItcmVzZXQtbWFwJywgcGFyYW1ldGVycyk7XG5cbiAgICB9XG4gIH0pXG5cbiAgLy8gMS4gZ29vZ2xlIG1hcHMgZ2VvY29kZVxuXG4gIC8vIDIuIGZvY3VzIG1hcCBvbiBnZW9jb2RlICh2aWEgbGF0L2xuZylcbiAgY29uc3QgcXVlcnlNYW5hZ2VyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgICAgIHF1ZXJ5TWFuYWdlci5pbml0aWFsaXplKCk7XG5cbiAgY29uc3QgaW5pdFBhcmFtcyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG5cblxuXG4gIGNvbnN0IGxhbmd1YWdlTWFuYWdlciA9IExhbmd1YWdlTWFuYWdlcigpO1xuXG4gIGNvbnN0IGxpc3RNYW5hZ2VyID0gTGlzdE1hbmFnZXIoe1xuICAgIHJlZmVycmVyOiB3aW5kb3cucXVlcmllcy5yZWZlcnJlcixcbiAgICBzb3VyY2U6IHdpbmRvdy5xdWVyaWVzLnNvdXJjZVxuICB9KTtcblxuXG4gIG1hcE1hbmFnZXIgPSBNYXBNYW5hZ2VyKHtcbiAgICBvbk1vdmU6IChzdywgbmUpID0+IHtcbiAgICAgIC8vIFdoZW4gdGhlIG1hcCBtb3ZlcyBhcm91bmQsIHdlIHVwZGF0ZSB0aGUgbGlzdFxuICAgICAgcXVlcnlNYW5hZ2VyLnVwZGF0ZVZpZXdwb3J0QnlCb3VuZChzdywgbmUpO1xuICAgICAgLy91cGRhdGUgUXVlcnlcbiAgICB9LFxuICAgIHJlZmVycmVyOiB3aW5kb3cucXVlcmllcy5yZWZlcnJlcixcbiAgICBzb3VyY2U6IHdpbmRvdy5xdWVyaWVzLnNvdXJjZVxuICB9KTtcblxuICB3aW5kb3cuaW5pdGlhbGl6ZUF1dG9jb21wbGV0ZUNhbGxiYWNrID0gKCkgPT4ge1xuXG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlciA9IEF1dG9jb21wbGV0ZU1hbmFnZXIoXCJpbnB1dFtuYW1lPSdsb2MnXVwiKTtcbiAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICAgIGlmIChpbml0UGFyYW1zLmxvYyAmJiBpbml0UGFyYW1zLmxvYyAhPT0gJycgJiYgKCFpbml0UGFyYW1zLmJvdW5kMSAmJiAhaW5pdFBhcmFtcy5ib3VuZDIpKSB7XG4gICAgICBtYXBNYW5hZ2VyLmluaXRpYWxpemUoKCkgPT4ge1xuICAgICAgICBtYXBNYW5hZ2VyLmdldENlbnRlckJ5TG9jYXRpb24oaW5pdFBhcmFtcy5sb2MsIChyZXN1bHQpID0+IHtcbiAgICAgICAgICBxdWVyeU1hbmFnZXIudXBkYXRlVmlld3BvcnQocmVzdWx0Lmdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGlmKGluaXRQYXJhbXMubGF0ICYmIGluaXRQYXJhbXMubG5nKSB7XG4gICAgbWFwTWFuYWdlci5zZXRDZW50ZXIoW2luaXRQYXJhbXMubGF0LCBpbml0UGFyYW1zLmxuZ10pO1xuICB9XG5cbiAgLyoqKlxuICAqIExpc3QgRXZlbnRzXG4gICogVGhpcyB3aWxsIHRyaWdnZXIgdGhlIGxpc3QgdXBkYXRlIG1ldGhvZFxuICAqL1xuICAkKGRvY3VtZW50KS5vbignbW9iaWxlLXVwZGF0ZS1tYXAtaGVpZ2h0JywgKGV2ZW50KSA9PiB7XG4gICAgLy9UaGlzIGNoZWNrcyBpZiB3aWR0aCBpcyBmb3IgbW9iaWxlXG4gICAgaWYgKCQod2luZG93KS53aWR0aCgpIDwgNjAwKSB7XG4gICAgICBzZXRUaW1lb3V0KCgpPT4ge1xuICAgICAgICAkKFwiI21hcFwiKS5oZWlnaHQoJChcIiNldmVudHMtbGlzdFwiKS5oZWlnaHQoKSk7XG4gICAgICAgIG1hcE1hbmFnZXIucmVmcmVzaE1hcCgpO1xuICAgICAgfSwgMTApO1xuICAgIH1cbiAgfSlcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICBsaXN0TWFuYWdlci5wb3B1bGF0ZUxpc3Qob3B0aW9ucy5wYXJhbXMpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcblxuICAgIGxpc3RNYW5hZ2VyLnVwZGF0ZUZpbHRlcihvcHRpb25zKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC1maWx0ZXInLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICBsZXQgYm91bmQxLCBib3VuZDI7XG5cbiAgICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMuYm91bmQxIHx8ICFvcHRpb25zLmJvdW5kMikge1xuICAgICAgW2JvdW5kMSwgYm91bmQyXSA9IG1hcE1hbmFnZXIuZ2V0Qm91bmRzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJvdW5kMSA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDEpO1xuICAgICAgYm91bmQyID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMik7XG4gICAgfVxuXG4gICAgbGlzdE1hbmFnZXIudXBkYXRlQm91bmRzKGJvdW5kMSwgYm91bmQyLCBvcHRpb25zLmZpbHRlcik7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLXJlc2V0LW1hcCcsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIHZhciBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHRpb25zKSk7XG4gICAgZGVsZXRlIGNvcHlbJ2xuZyddO1xuICAgIGRlbGV0ZSBjb3B5WydsYXQnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQxJ107XG4gICAgZGVsZXRlIGNvcHlbJ2JvdW5kMiddO1xuXG4gICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAkLnBhcmFtKGNvcHkpO1xuXG5cbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwidHJpZ2dlci1sYW5ndWFnZS11cGRhdGVcIiwgY29weSk7XG4gICAgJChcInNlbGVjdCNmaWx0ZXItaXRlbXNcIikubXVsdGlzZWxlY3QoJ2Rlc3Ryb3knKTtcbiAgICBidWlsZEZpbHRlcnMoKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxvYWQtZ3JvdXBzJywgeyBncm91cHM6IHdpbmRvdy5FVkVOVFNfREFUQS5ncm91cHMgfSk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG5cbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJ0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZVwiLCBjb3B5KTtcbiAgICB9LCAxMDAwKTtcbiAgfSk7XG5cblxuICAvKioqXG4gICogTWFwIEV2ZW50c1xuICAqL1xuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgLy8gbWFwTWFuYWdlci5zZXRDZW50ZXIoW29wdGlvbnMubGF0LCBvcHRpb25zLmxuZ10pO1xuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGJvdW5kMSA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDEpO1xuICAgIHZhciBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcblxuICAgIG1hcE1hbmFnZXIuc2V0Qm91bmRzKGJvdW5kMSwgYm91bmQyKTtcbiAgICAvLyBtYXBNYW5hZ2VyLnRyaWdnZXJab29tRW5kKCk7XG5cbiAgICAvLyBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAvLyAgIG1hcE1hbmFnZXIudHJpZ2dlclpvb21FbmQoKTtcbiAgICAvLyB9LCAxMCk7XG5cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgXCIjY29weS1lbWJlZFwiLCAoZSkgPT4ge1xuICAgIHZhciBjb3B5VGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW1iZWQtdGV4dFwiKTtcbiAgICBjb3B5VGV4dC5zZWxlY3QoKTtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZChcIkNvcHlcIik7XG4gIH0pO1xuXG4gIC8vIDMuIG1hcmtlcnMgb24gbWFwXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC1wbG90JywgKGUsIG9wdCkgPT4ge1xuXG4gICAgbWFwTWFuYWdlci5wbG90UG9pbnRzKG9wdC5kYXRhLCBvcHQucGFyYW1zLCBvcHQuZ3JvdXBzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInKTtcbiAgfSlcblxuICAvLyBsb2FkIGdyb3Vwc1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxvYWQtZ3JvdXBzJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5lbXB0eSgpO1xuICAgIG9wdC5ncm91cHMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuXG4gICAgICBsZXQgc2x1Z2dlZCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG4gICAgICBsZXQgdmFsdWVUZXh0ID0gbGFuZ3VhZ2VNYW5hZ2VyLmdldFRyYW5zbGF0aW9uKGl0ZW0udHJhbnNsYXRpb24pO1xuICAgICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLmFwcGVuZChgXG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPScke3NsdWdnZWR9J1xuICAgICAgICAgICAgICBzZWxlY3RlZD0nc2VsZWN0ZWQnXG4gICAgICAgICAgICAgIGxhYmVsPVwiPHNwYW4gZGF0YS1sYW5nLXRhcmdldD0ndGV4dCcgZGF0YS1sYW5nLWtleT0nJHtpdGVtLnRyYW5zbGF0aW9ufSc+JHt2YWx1ZVRleHR9PC9zcGFuPjxpbWcgc3JjPScke2l0ZW0uaWNvbnVybCB8fCB3aW5kb3cuREVGQVVMVF9JQ09OfScgLz5cIj5cbiAgICAgICAgICAgIDwvb3B0aW9uPmApXG4gICAgfSk7XG5cbiAgICAvLyBSZS1pbml0aWFsaXplXG4gICAgcXVlcnlNYW5hZ2VyLmluaXRpYWxpemUoKTtcbiAgICAvLyAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykubXVsdGlzZWxlY3QoJ2Rlc3Ryb3knKTtcbiAgICAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykubXVsdGlzZWxlY3QoJ3JlYnVpbGQnKTtcblxuICAgIG1hcE1hbmFnZXIucmVmcmVzaE1hcCgpO1xuXG5cbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZScpO1xuXG4gIH0pXG5cbiAgLy8gRmlsdGVyIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtZmlsdGVyJywgKGUsIG9wdCkgPT4ge1xuICAgIGlmIChvcHQpIHtcbiAgICAgIG1hcE1hbmFnZXIuZmlsdGVyTWFwKG9wdC5maWx0ZXIpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgKGUsIG9wdCkgPT4ge1xuXG4gICAgaWYgKHdpbmRvdy5xdWVyaWVzLmxhbmcpIHtcbiAgICAgIGxhbmd1YWdlTWFuYWdlci51cGRhdGVMYW5ndWFnZSh3aW5kb3cucXVlcmllcy5sYW5nKTtcbiAgICB9IGVsc2UgaWYgKG9wdCkge1xuICAgICAgbGFuZ3VhZ2VNYW5hZ2VyLnVwZGF0ZUxhbmd1YWdlKG9wdC5sYW5nKTtcbiAgICB9IGVsc2Uge1xuXG4gICAgICBsYW5ndWFnZU1hbmFnZXIucmVmcmVzaCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGFuZ3VhZ2UtbG9hZGVkJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5tdWx0aXNlbGVjdCgncmVidWlsZCcpO1xuICB9KVxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24jc2hvdy1oaWRlLW1hcCcsIChlLCBvcHQpID0+IHtcbiAgICAkKCdib2R5JykudG9nZ2xlQ2xhc3MoJ21hcC12aWV3JylcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbi5idG4ubW9yZS1pdGVtcycsIChlLCBvcHQpID0+IHtcbiAgICAkKCcjZW1iZWQtYXJlYScpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgKGUsIG9wdCkgPT4ge1xuICAgIC8vdXBkYXRlIGVtYmVkIGxpbmVcbiAgICB2YXIgY29weSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3B0KSk7XG4gICAgZGVsZXRlIGNvcHlbJ2xuZyddO1xuICAgIGRlbGV0ZSBjb3B5WydsYXQnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQxJ107XG4gICAgZGVsZXRlIGNvcHlbJ2JvdW5kMiddO1xuXG4gICAgJCgnI2VtYmVkLWFyZWEgaW5wdXRbbmFtZT1lbWJlZF0nKS52YWwoJ2h0dHBzOi8vbmV3LW1hcC4zNTAub3JnIycgKyAkLnBhcmFtKGNvcHkpKTtcbiAgfSk7XG5cblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uI3pvb20tb3V0JywgKGUsIG9wdCkgPT4ge1xuXG4gICAgLy8gbWFwTWFuYWdlci56b29tT3V0T25jZSgpO1xuICAgIG1hcE1hbmFnZXIuem9vbVVudGlsSGl0KCk7XG4gIH0pO1xuXG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJyNzaG93LWhpZGUtbGlzdC1jb250YWluZXInLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnYm9keScpLnRvZ2dsZUNsYXNzKCdmaWx0ZXItY29sbGFwc2VkJyk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7IG1hcE1hbmFnZXIucmVmcmVzaE1hcCgpIH0sIDYwMClcbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIChlKSA9PiB7XG4gICAgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCk7XG4gIH0pO1xuXG4gIC8qKlxuICBGaWx0ZXIgQ2hhbmdlc1xuICAqL1xuICAkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiLnNlYXJjaC1idXR0b24gYnV0dG9uXCIsIChlKSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJzZWFyY2guZm9yY2Utc2VhcmNoLWxvY2F0aW9uXCIpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oXCJrZXl1cFwiLCBcImlucHV0W25hbWU9J2xvYyddXCIsIChlKSA9PiB7XG4gICAgaWYgKGUua2V5Q29kZSA9PSAxMykge1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcignc2VhcmNoLmZvcmNlLXNlYXJjaC1sb2NhdGlvbicpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3NlYXJjaC5mb3JjZS1zZWFyY2gtbG9jYXRpb24nLCAoKSA9PiB7XG4gICAgbGV0IF9xdWVyeSA9ICQoXCJpbnB1dFtuYW1lPSdsb2MnXVwiKS52YWwoKTtcbiAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmZvcmNlU2VhcmNoKF9xdWVyeSk7XG4gICAgLy8gU2VhcmNoIGdvb2dsZSBhbmQgZ2V0IHRoZSBmaXJzdCByZXN1bHQuLi4gYXV0b2NvbXBsZXRlP1xuICB9KTtcblxuICAkKHdpbmRvdykub24oXCJoYXNoY2hhbmdlXCIsIChldmVudCkgPT4ge1xuICAgIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICBpZiAoaGFzaC5sZW5ndGggPT0gMCkgcmV0dXJuO1xuICAgIGNvbnN0IHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oaGFzaC5zdWJzdHJpbmcoMSkpO1xuICAgIGNvbnN0IG9sZFVSTCA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQub2xkVVJMO1xuICAgIGNvbnN0IG9sZEhhc2ggPSAkLmRlcGFyYW0ob2xkVVJMLnN1YnN0cmluZyhvbGRVUkwuc2VhcmNoKFwiI1wiKSsxKSk7XG5cbiAgICAvLyAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicsIHBhcmFtZXRlcnMpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgcGFyYW1ldGVycyk7XG5cbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyJywgcGFyYW1ldGVycyk7XG4gICAgLy8gLy8gU28gdGhhdCBjaGFuZ2UgaW4gZmlsdGVycyB3aWxsIG5vdCB1cGRhdGUgdGhpc1xuICAgIC8vIGlmIChvbGRIYXNoLmJvdW5kMSAhPT0gcGFyYW1ldGVycy5ib3VuZDEgfHwgb2xkSGFzaC5ib3VuZDIgIT09IHBhcmFtZXRlcnMuYm91bmQyKSB7XG4gICAgLy8gICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyJywgcGFyYW1ldGVycyk7XG4gICAgLy8gfVxuXG4gICAgaWYgKG9sZEhhc2gubG9jICE9PSBwYXJhbWV0ZXJzLmxvYykge1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgfVxuXG4gICAgLy8gQ2hhbmdlIGl0ZW1zXG4gICAgaWYgKG9sZEhhc2gubGFuZyAhPT0gcGFyYW1ldGVycy5sYW5nKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgIH1cbiAgfSlcblxuICAvLyA0LiBmaWx0ZXIgb3V0IGl0ZW1zIGluIGFjdGl2aXR5LWFyZWFcblxuICAvLyA1LiBnZXQgbWFwIGVsZW1lbnRzXG5cbiAgLy8gNi4gZ2V0IEdyb3VwIGRhdGFcblxuICAvLyA3LiBwcmVzZW50IGdyb3VwIGVsZW1lbnRzXG5cbiAgJC53aGVuKCgpPT57fSlcbiAgICAudGhlbigoKSA9PntcbiAgICAgIHJldHVybiBsYW5ndWFnZU1hbmFnZXIuaW5pdGlhbGl6ZShpbml0UGFyYW1zWydsYW5nJ10gfHwgJ2VuJyk7XG4gICAgfSlcbiAgICAuZG9uZSgoZGF0YSkgPT4ge30pXG4gICAgLnRoZW4oKCkgPT4ge1xuICAgICAgJC5hamF4KHtcbiAgICAgICAgICB1cmw6ICdodHRwczovL25ldy1tYXAuMzUwLm9yZy9vdXRwdXQvMzUwb3JnLXdpdGgtYW5ub3RhdGlvbi5qcy5neicsIC8vJ3wqKkRBVEFfU09VUkNFKip8JyxcbiAgICAgICAgICAvLyB1cmw6ICcvZGF0YS90ZXN0LmpzJywgLy8nfCoqREFUQV9TT1VSQ0UqKnwnLFxuICAgICAgICAgIGRhdGFUeXBlOiAnc2NyaXB0JyxcbiAgICAgICAgICBjYWNoZTogdHJ1ZSxcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgLy8gd2luZG93LkVWRU5UU19EQVRBID0gZGF0YTtcbiAgICAgICAgICAgIC8vSnVuZSAxNCwgMjAxOCDigJMgQ2hhbmdlc1xuICAgICAgICAgICAgaWYod2luZG93LnF1ZXJpZXMuZ3JvdXApIHtcbiAgICAgICAgICAgICAgd2luZG93LkVWRU5UU19EQVRBLmRhdGEgPSB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YS5maWx0ZXIoKGkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaS5jYW1wYWlnbiA9PSB3aW5kb3cucXVlcmllcy5ncm91cFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9Mb2FkIGdyb3Vwc1xuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sb2FkLWdyb3VwcycsIHsgZ3JvdXBzOiB3aW5kb3cuRVZFTlRTX0RBVEEuZ3JvdXBzIH0pO1xuXG5cbiAgICAgICAgICAgIHZhciBwYXJhbWV0ZXJzID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuICAgICAgICAgICAgd2luZG93LkVWRU5UU19EQVRBLmRhdGEuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICBpdGVtWydldmVudF90eXBlJ10gPSBpdGVtLmV2ZW50X3R5cGUgIT09ICdncm91cCcgPyAnZXZlbnRzJyA6IGl0ZW0uZXZlbnRfdHlwZTsgLy8haXRlbS5ldmVudF90eXBlID8gJ0V2ZW50JyA6IGl0ZW0uZXZlbnRfdHlwZTtcblxuICAgICAgICAgICAgICBpZiAoaXRlbS5zdGFydF9kYXRldGltZSAmJiAhaXRlbS5zdGFydF9kYXRldGltZS5tYXRjaCgvWiQvKSkge1xuICAgICAgICAgICAgICAgIGl0ZW0uc3RhcnRfZGF0ZXRpbWUgPSBpdGVtLnN0YXJ0X2RhdGV0aW1lICsgXCJaXCI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICAvLyAgIHJldHVybiBuZXcgRGF0ZShhLnN0YXJ0X2RhdGV0aW1lKSAtIG5ldyBEYXRlKGIuc3RhcnRfZGF0ZXRpbWUpO1xuICAgICAgICAgICAgLy8gfSlcblxuXG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtdXBkYXRlJywgeyBwYXJhbXM6IHBhcmFtZXRlcnMgfSk7XG4gICAgICAgICAgICAvLyAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtcGxvdCcsIHtcbiAgICAgICAgICAgICAgICBkYXRhOiB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YSxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHBhcmFtZXRlcnMsXG4gICAgICAgICAgICAgICAgZ3JvdXBzOiB3aW5kb3cuRVZFTlRTX0RBVEEuZ3JvdXBzLnJlZHVjZSgoZGljdCwgaXRlbSk9PnsgZGljdFtpdGVtLnN1cGVyZ3JvdXBdID0gaXRlbTsgcmV0dXJuIGRpY3Q7IH0sIHt9KVxuICAgICAgICAgICAgfSk7XG4gICAgICAvLyB9KTtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgcGFyYW1ldGVycyk7XG4gICAgICAgICAgICAvL1RPRE86IE1ha2UgdGhlIGdlb2pzb24gY29udmVyc2lvbiBoYXBwZW4gb24gdGhlIGJhY2tlbmRcblxuICAgICAgICAgICAgLy9SZWZyZXNoIHRoaW5nc1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgIGxldCBwID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuICAgICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwKTtcbiAgICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJywgcCk7XG5cbiAgICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlcicsIHApO1xuXG4gICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuXG5cbn0pKGpRdWVyeSk7XG4iXX0=
