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

    mapboxgl.accessToken = 'pk.eyJ1IjoicmNzY2FzdGlsbG8iLCJhIjoiY2pseDZ2bmp0MDcwYzNwcGp1bjBqNHo4aSJ9.3bD8gQrMAIEqV6yyS-__vg';
    map = new mapboxgl.Map({
      container: 'map-proper',
      style: 'mapbox://styles/rcscastillo/cjmmb2vtclov52rp0sczqomcs',
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
        console.log(bounds);
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
          var _visible = $(document).find('ul li.event-obj.within-bound, ul li.group-obj.within-bound').length;
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
        console.log(list, hardFilters, groups);

        // Color the map

        var _loop = function _loop(i) {
          var group = groups[i];
          var targets = list.filter(function (item) {
            return item.event_type == "group" ? item.supergroup == group.supergroup : item.event_type == window.slugify(group.supergroup);
          });
          console.log(targets);

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
                "circle-radius": 5,
                "circle-color": ['case', ['==', ['get', 'is_past'], 'yes'], "#BBBBBB", "#40d7d4"],
                "circle-opacity": 0.9,
                "circle-stroke-width": 2,
                "circle-stroke-color": "white",
                "circle-stroke-opacity": 1
              }
            });
          } else {
            var _geojson = getGroupGeojson(targets, group, referrer, source);
            map.loadImage(group.iconurl, function (error, groupIcon) {

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
                  "icon-size": 0.15
                }
              });
            });
          }

          map.on("click", window.slugify(i), function (e) {
            console.log("Clicked Events");
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9oZWxwZXIuanMiLCJjbGFzc2VzL2xhbmd1YWdlLmpzIiwiY2xhc3Nlcy9saXN0LmpzIiwiY2xhc3Nlcy9tYXAuanMiLCJjbGFzc2VzL3F1ZXJ5LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIkF1dG9jb21wbGV0ZU1hbmFnZXIiLCIkIiwidGFyZ2V0IiwiQVBJX0tFWSIsInRhcmdldEl0ZW0iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJxdWVyeU1nciIsIlF1ZXJ5TWFuYWdlciIsImdlb2NvZGVyIiwiZ29vZ2xlIiwibWFwcyIsIkdlb2NvZGVyIiwiJHRhcmdldCIsImZvcmNlU2VhcmNoIiwicSIsImdlb2NvZGUiLCJhZGRyZXNzIiwicmVzdWx0cyIsInN0YXR1cyIsImdlb21ldHJ5IiwidXBkYXRlVmlld3BvcnQiLCJ2aWV3cG9ydCIsInZhbCIsImZvcm1hdHRlZF9hZGRyZXNzIiwiaW5pdGlhbGl6ZSIsInR5cGVhaGVhZCIsImhpbnQiLCJoaWdobGlnaHQiLCJtaW5MZW5ndGgiLCJjbGFzc05hbWVzIiwibWVudSIsIm5hbWUiLCJkaXNwbGF5IiwiaXRlbSIsImxpbWl0Iiwic291cmNlIiwic3luYyIsImFzeW5jIiwib24iLCJvYmoiLCJkYXR1bSIsImpRdWVyeSIsIkhlbHBlciIsInJlZlNvdXJjZSIsInVybCIsInJlZiIsInNyYyIsImluZGV4T2YiLCJMYW5ndWFnZU1hbmFnZXIiLCJsYW5ndWFnZSIsImRpY3Rpb25hcnkiLCIkdGFyZ2V0cyIsInVwZGF0ZVBhZ2VMYW5ndWFnZSIsInRhcmdldExhbmd1YWdlIiwicm93cyIsImZpbHRlciIsImkiLCJsYW5nIiwiZWFjaCIsImluZGV4IiwidGFyZ2V0QXR0cmlidXRlIiwiZGF0YSIsImxhbmdUYXJnZXQiLCJ0ZXh0IiwiYXR0ciIsInRhcmdldHMiLCJhamF4IiwiZGF0YVR5cGUiLCJzdWNjZXNzIiwidHJpZ2dlciIsIm11bHRpc2VsZWN0IiwicmVmcmVzaCIsInVwZGF0ZUxhbmd1YWdlIiwiZ2V0VHJhbnNsYXRpb24iLCJrZXkiLCJMaXN0TWFuYWdlciIsIm9wdGlvbnMiLCJ0YXJnZXRMaXN0IiwicmVmZXJyZXIiLCJkM1RhcmdldCIsImQzIiwic2VsZWN0IiwicmVuZGVyRXZlbnQiLCJtIiwibW9tZW50IiwiRGF0ZSIsInN0YXJ0X2RhdGV0aW1lIiwidXRjIiwic3VidHJhY3QiLCJ1dGNPZmZzZXQiLCJkYXRlIiwiZm9ybWF0IiwibWF0Y2giLCJldmVudF90eXBlIiwidGl0bGUiLCJ2ZW51ZSIsInJlbmRlckdyb3VwIiwid2Vic2l0ZSIsInN1cGVyR3JvdXAiLCJ3aW5kb3ciLCJzbHVnaWZ5Iiwic3VwZXJncm91cCIsImxvY2F0aW9uIiwiZGVzY3JpcHRpb24iLCIkbGlzdCIsInVwZGF0ZUZpbHRlciIsInAiLCJyZW1vdmVQcm9wIiwiYWRkQ2xhc3MiLCJqb2luIiwiZm9yRWFjaCIsImZpbCIsImZpbmQiLCJzaG93IiwidXBkYXRlQm91bmRzIiwiYm91bmQxIiwiYm91bmQyIiwiZmlsdGVycyIsIkVWRU5UU19EQVRBIiwidHlwZSIsInRvTG93ZXJDYXNlIiwibGVuZ3RoIiwiaW5jbHVkZXMiLCJsYXQiLCJsbmciLCJsaXN0Q29udGFpbmVyIiwic2VsZWN0QWxsIiwicmVtb3ZlIiwiZW50ZXIiLCJhcHBlbmQiLCJodG1sIiwicmVtb3ZlQ2xhc3MiLCJwb3B1bGF0ZUxpc3QiLCJoYXJkRmlsdGVycyIsImtleVNldCIsInNwbGl0IiwiTWFwTWFuYWdlciIsIkxBTkdVQUdFIiwicG9wdXAiLCJtYXBib3hnbCIsIlBvcHVwIiwiY2xvc2VPbkNsaWNrIiwicmVuZGVyQW5ub3RhdGlvblBvcHVwIiwicmVuZGVyQW5ub3RhdGlvbnNHZW9Kc29uIiwibGlzdCIsIm1hcCIsInJlbmRlcmVkIiwiY29vcmRpbmF0ZXMiLCJwcm9wZXJ0aWVzIiwiYW5ub3RhdGlvblByb3BzIiwicG9wdXBDb250ZW50IiwicmVuZGVyR2VvanNvbiIsImlzTmFOIiwicGFyc2VGbG9hdCIsInN1YnN0cmluZyIsImV2ZW50UHJvcGVydGllcyIsImdldEV2ZW50R2VvanNvbiIsInNvcnQiLCJ4IiwieSIsImRlc2NlbmRpbmciLCJnZXRHcm91cEdlb2pzb24iLCJhY2Nlc3NUb2tlbiIsIkwiLCJkcmFnZ2luZyIsIkJyb3dzZXIiLCJtb2JpbGUiLCJzZXRWaWV3IiwiTWFwIiwiY29udGFpbmVyIiwic3R5bGUiLCJkb3VibGVDbGlja1pvb20iLCJjZW50ZXIiLCJ6b29tIiwib25Nb3ZlIiwiZXZlbnQiLCJibmQiLCJnZXRCb3VuZHMiLCJzdyIsIl9zdyIsIm5lIiwiX25lIiwiZ2V0Wm9vbSIsInF1ZXJpZXMiLCJ0ZXJtaW5hdG9yIiwiYWRkVG8iLCIkbWFwIiwiY2FsbGJhY2siLCJzZXRCb3VuZHMiLCJib3VuZHMxIiwiYm91bmRzMiIsImJvdW5kcyIsInJldmVyc2UiLCJjb25zb2xlIiwibG9nIiwiZml0Qm91bmRzIiwiYW5pbWF0ZSIsInNldENlbnRlciIsImdldENlbnRlckJ5TG9jYXRpb24iLCJ0cmlnZ2VyWm9vbUVuZCIsInpvb21PdXRPbmNlIiwiem9vbU91dCIsInpvb21VbnRpbEhpdCIsIiR0aGlzIiwiaW50ZXJ2YWxIYW5kbGVyIiwic2V0SW50ZXJ2YWwiLCJfdmlzaWJsZSIsImNsZWFySW50ZXJ2YWwiLCJyZWZyZXNoTWFwIiwiZmlsdGVyTWFwIiwiaGlkZSIsInBsb3RQb2ludHMiLCJncm91cHMiLCJncm91cCIsImdlb2pzb24iLCJhZGRMYXllciIsImxvYWRJbWFnZSIsImljb251cmwiLCJlcnJvciIsImdyb3VwSWNvbiIsImFkZEltYWdlIiwiZSIsImZlYXR1cmVzIiwic2xpY2UiLCJzZXRMbmdMYXQiLCJzZXRIVE1MIiwiX29sZFBsb3RQb2ludHMiLCJldmVudHNMYXllciIsImdlb0pTT04iLCJwb2ludFRvTGF5ZXIiLCJmZWF0dXJlIiwibGF0bG5nIiwiZXZlbnRUeXBlIiwic2x1Z2dlZCIsImljb25VcmwiLCJpc1Bhc3QiLCJzbWFsbEljb24iLCJpY29uIiwiaWNvblNpemUiLCJpY29uQW5jaG9yIiwiY2xhc3NOYW1lIiwiZ2VvanNvbk1hcmtlck9wdGlvbnMiLCJtYXJrZXIiLCJvbkVhY2hGZWF0dXJlIiwibGF5ZXIiLCJiaW5kUG9wdXAiLCJhbm5vdGF0aW9uIiwiYW5ub3RhdGlvbnMiLCJhbm5vdEljb24iLCJhbm5vdE1hcmtlcnMiLCJhbm5vdExheWVyR3JvdXAiLCJmZWF0dXJlR3JvdXAiLCJ1cGRhdGUiLCJsYXRMbmciLCJ0YXJnZXRGb3JtIiwicHJldmlvdXMiLCJwcmV2ZW50RGVmYXVsdCIsImZvcm0iLCJkZXBhcmFtIiwic2VyaWFsaXplIiwiaGFzaCIsInBhcmFtIiwicGFyYW1zIiwibG9jIiwicHJvcCIsImdldFBhcmFtZXRlcnMiLCJwYXJhbWV0ZXJzIiwidXBkYXRlTG9jYXRpb24iLCJNYXRoIiwiYWJzIiwiZiIsImIiLCJmQXZnIiwiYkF2ZyIsIkpTT04iLCJzdHJpbmdpZnkiLCJ1cGRhdGVWaWV3cG9ydEJ5Qm91bmQiLCJ0cmlnZ2VyU3VibWl0IiwiYXV0b2NvbXBsZXRlTWFuYWdlciIsIm1hcE1hbmFnZXIiLCJERUZBVUxUX0lDT04iLCJ0b1N0cmluZyIsInJlcGxhY2UiLCJnZXRRdWVyeVN0cmluZyIsInF1ZXJ5U3RyaW5nS2V5VmFsdWUiLCJwYXJlbnQiLCJzZWFyY2giLCJxc0pzb25PYmplY3QiLCJ3aWR0aCIsImNzcyIsImJ1aWxkRmlsdGVycyIsImVuYWJsZUhUTUwiLCJ0ZW1wbGF0ZXMiLCJidXR0b24iLCJsaSIsImRyb3BSaWdodCIsIm9uSW5pdGlhbGl6ZWQiLCJvbkRyb3Bkb3duU2hvdyIsInNldFRpbWVvdXQiLCJvbkRyb3Bkb3duSGlkZSIsIm9wdGlvbkxhYmVsIiwidW5lc2NhcGUiLCJvcHRpb25DbGFzcyIsInNlbGVjdGVkQ2xhc3MiLCJidXR0b25DbGFzcyIsIm9uQ2hhbmdlIiwib3B0aW9uIiwiY2hlY2tlZCIsInF1ZXJ5TWFuYWdlciIsImluaXRQYXJhbXMiLCJsYW5ndWFnZU1hbmFnZXIiLCJsaXN0TWFuYWdlciIsImluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayIsInJlc3VsdCIsImhlaWdodCIsInBhcnNlIiwiY29weSIsImNvcHlUZXh0IiwiZ2V0RWxlbWVudEJ5SWQiLCJleGVjQ29tbWFuZCIsIm9wdCIsImVtcHR5IiwidmFsdWVUZXh0IiwidHJhbnNsYXRpb24iLCJ0b2dnbGVDbGFzcyIsImtleUNvZGUiLCJfcXVlcnkiLCJvbGRVUkwiLCJvcmlnaW5hbEV2ZW50Iiwib2xkSGFzaCIsIndoZW4iLCJ0aGVuIiwiZG9uZSIsImNhY2hlIiwiY2FtcGFpZ24iLCJyZWR1Y2UiLCJkaWN0Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOztBQUNBLElBQU1BLHNCQUF1QixVQUFTQyxDQUFULEVBQVk7QUFDdkM7O0FBRUEsU0FBTyxVQUFDQyxNQUFELEVBQVk7O0FBRWpCLFFBQU1DLFVBQVUseUNBQWhCO0FBQ0EsUUFBTUMsYUFBYSxPQUFPRixNQUFQLElBQWlCLFFBQWpCLEdBQTRCRyxTQUFTQyxhQUFULENBQXVCSixNQUF2QixDQUE1QixHQUE2REEsTUFBaEY7QUFDQSxRQUFNSyxXQUFXQyxjQUFqQjtBQUNBLFFBQUlDLFdBQVcsSUFBSUMsT0FBT0MsSUFBUCxDQUFZQyxRQUFoQixFQUFmOztBQUVBLFdBQU87QUFDTEMsZUFBU1osRUFBRUcsVUFBRixDQURKO0FBRUxGLGNBQVFFLFVBRkg7QUFHTFUsbUJBQWEscUJBQUNDLENBQUQsRUFBTztBQUNsQk4saUJBQVNPLE9BQVQsQ0FBaUIsRUFBRUMsU0FBU0YsQ0FBWCxFQUFqQixFQUFpQyxVQUFVRyxPQUFWLEVBQW1CQyxNQUFuQixFQUEyQjtBQUMxRCxjQUFJRCxRQUFRLENBQVIsQ0FBSixFQUFnQjtBQUNkLGdCQUFJRSxXQUFXRixRQUFRLENBQVIsRUFBV0UsUUFBMUI7QUFDQWIscUJBQVNjLGNBQVQsQ0FBd0JELFNBQVNFLFFBQWpDO0FBQ0FyQixjQUFFRyxVQUFGLEVBQWNtQixHQUFkLENBQWtCTCxRQUFRLENBQVIsRUFBV00saUJBQTdCO0FBQ0Q7QUFDRDtB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Qzs7QUFFQTFHLFlBQUVJLFFBQUYsRUFBWWlFLE9BQVosQ0FBb0IscUJBQXBCLEVBQTJDcUMsQ0FBM0M7QUFFRCxTQVJELEVBUUcsR0FSSDtBQVNEO0FBdERFLEtBQVA7QUF3REMsR0E5REw7QUFrRUQsQ0FwYkQsRUFvYkdqRSxNQXBiSCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbi8vQVBJIDpBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cbmNvbnN0IEF1dG9jb21wbGV0ZU1hbmFnZXIgPSAoZnVuY3Rpb24oJCkge1xuICAvL0luaXRpYWxpemF0aW9uLi4uXG5cbiAgcmV0dXJuICh0YXJnZXQpID0+IHtcblxuICAgIGNvbnN0IEFQSV9LRVkgPSBcIkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVwiO1xuICAgIGNvbnN0IHRhcmdldEl0ZW0gPSB0eXBlb2YgdGFyZ2V0ID09IFwic3RyaW5nXCIgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCkgOiB0YXJnZXQ7XG4gICAgY29uc3QgcXVlcnlNZ3IgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICB2YXIgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcblxuICAgIHJldHVybiB7XG4gICAgICAkdGFyZ2V0OiAkKHRhcmdldEl0ZW0pLFxuICAgICAgdGFyZ2V0OiB0YXJnZXRJdGVtLFxuICAgICAgZm9yY2VTZWFyY2g6IChxKSA9PiB7XG4gICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBxIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICBpZiAocmVzdWx0c1swXSkge1xuICAgICAgICAgICAgbGV0IGdlb21ldHJ5ID0gcmVzdWx0c1swXS5nZW9tZXRyeTtcbiAgICAgICAgICAgIHF1ZXJ5TWdyLnVwZGF0ZVZpZXdwb3J0KGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICQodGFyZ2V0SXRlbSkudmFsKHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyB2YXIgZ2VvbWV0cnkgPSBkYXR1bS5nZW9tZXRyeTtcbiAgICAgICAgICAvLyBxdWVyeU1nci51cGRhdGVWaWV3cG9ydChnZW9tZXRyeS52aWV3cG9ydCk7XG5cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgaW5pdGlhbGl6ZTogKCkgPT4ge1xuICAgICAgICAkKHRhcmdldEl0ZW0pLnR5cGVhaGVhZCh7XG4gICAgICAgICAgICAgICAgICAgIGhpbnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWluTGVuZ3RoOiA0LFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgbWVudTogJ3R0LWRyb3Bkb3duLW1lbnUnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdzZWFyY2gtcmVzdWx0cycsXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IChpdGVtKSA9PiBpdGVtLmZvcm1hdHRlZF9hZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgICBsaW1pdDogMTAsXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogZnVuY3Rpb24gKHEsIHN5bmMsIGFzeW5jKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBxIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXN5bmMocmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICkub24oJ3R5cGVhaGVhZDpzZWxlY3RlZCcsIGZ1bmN0aW9uIChvYmosIGRhdHVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGRhdHVtKVxuICAgICAgICAgICAgICAgICAgICB7XG5cbiAgICAgICAgICAgICAgICAgICAgICB2YXIgZ2VvbWV0cnkgPSBkYXR1bS5nZW9tZXRyeTtcbiAgICAgICAgICAgICAgICAgICAgICBxdWVyeU1nci51cGRhdGVWaWV3cG9ydChnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gIG1hcC5maXRCb3VuZHMoZ2VvbWV0cnkuYm91bmRzPyBnZW9tZXRyeS5ib3VuZHMgOiBnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cblxuXG4gICAgcmV0dXJuIHtcblxuICAgIH1cbiAgfVxuXG59KGpRdWVyeSkpO1xuIiwiY29uc3QgSGVscGVyID0gKCgkKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlZlNvdXJjZTogKHVybCwgcmVmLCBzcmMpID0+IHtcbiAgICAgICAgLy8gSnVuIDEzIDIwMTgg4oCUIEZpeCBmb3Igc291cmNlIGFuZCByZWZlcnJlclxuICAgICAgICBpZiAocmVmIHx8IHNyYykge1xuICAgICAgICAgIGlmICh1cmwuaW5kZXhPZihcIj9cIikgPj0gMCkge1xuICAgICAgICAgICAgdXJsID0gYCR7dXJsfSZyZWZlcnJlcj0ke3JlZnx8XCJcIn0mc291cmNlPSR7c3JjfHxcIlwifWA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVybCA9IGAke3VybH0/cmVmZXJyZXI9JHtyZWZ8fFwiXCJ9JnNvdXJjZT0ke3NyY3x8XCJcIn1gO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB1cmw7XG4gICAgICB9XG4gICAgfTtcbn0pKGpRdWVyeSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IExhbmd1YWdlTWFuYWdlciA9ICgoJCkgPT4ge1xuICAvL2tleVZhbHVlXG5cbiAgLy90YXJnZXRzIGFyZSB0aGUgbWFwcGluZ3MgZm9yIHRoZSBsYW5ndWFnZVxuICByZXR1cm4gKCkgPT4ge1xuICAgIGxldCBsYW5ndWFnZTtcbiAgICBsZXQgZGljdGlvbmFyeSA9IHt9O1xuICAgIGxldCAkdGFyZ2V0cyA9ICQoXCJbZGF0YS1sYW5nLXRhcmdldF1bZGF0YS1sYW5nLWtleV1cIik7XG5cbiAgICBjb25zdCB1cGRhdGVQYWdlTGFuZ3VhZ2UgPSAoKSA9PiB7XG5cbiAgICAgIGxldCB0YXJnZXRMYW5ndWFnZSA9IGRpY3Rpb25hcnkucm93cy5maWx0ZXIoKGkpID0+IGkubGFuZyA9PT0gbGFuZ3VhZ2UpWzBdO1xuXG4gICAgICAkdGFyZ2V0cy5lYWNoKChpbmRleCwgaXRlbSkgPT4ge1xuXG4gICAgICAgIGxldCB0YXJnZXRBdHRyaWJ1dGUgPSAkKGl0ZW0pLmRhdGEoJ2xhbmctdGFyZ2V0Jyk7XG4gICAgICAgIGxldCBsYW5nVGFyZ2V0ID0gJChpdGVtKS5kYXRhKCdsYW5nLWtleScpO1xuXG5cblxuXG4gICAgICAgIHN3aXRjaCh0YXJnZXRBdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjYXNlICd0ZXh0JzpcblxuICAgICAgICAgICAgJCgoYFtkYXRhLWxhbmcta2V5PVwiJHtsYW5nVGFyZ2V0fVwiXWApKS50ZXh0KHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGlmIChsYW5nVGFyZ2V0ID09IFwibW9yZS1zZWFyY2gtb3B0aW9uc1wiKSB7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3ZhbHVlJzpcbiAgICAgICAgICAgICQoaXRlbSkudmFsKHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAkKGl0ZW0pLmF0dHIodGFyZ2V0QXR0cmlidXRlLCB0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGxhbmd1YWdlLFxuICAgICAgdGFyZ2V0czogJHRhcmdldHMsXG4gICAgICBkaWN0aW9uYXJ5LFxuICAgICAgaW5pdGlhbGl6ZTogKGxhbmcpID0+IHtcblxuICAgICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgICAvLyB1cmw6ICdodHRwczovL2dzeDJqc29uLmNvbS9hcGk/aWQ9MU8zZUJ5akwxdmxZZjdaN2FtLV9odFJUUWk3M1BhZnFJZk5CZExtWGU4U00mc2hlZXQ9MScsXG4gICAgICAgICAgdXJsOiAnL2RhdGEvbGFuZy5qc29uJyxcbiAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICBkaWN0aW9uYXJ5ID0gZGF0YTtcbiAgICAgICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZSgpO1xuXG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxhbmd1YWdlLWxvYWRlZCcpO1xuXG4gICAgICAgICAgICAkKFwiI2xhbmd1YWdlLW9wdHNcIikubXVsdGlzZWxlY3QoJ3NlbGVjdCcsIGxhbmcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgcmVmcmVzaDogKCkgPT4ge1xuICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UobGFuZ3VhZ2UpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZUxhbmd1YWdlOiAobGFuZykgPT4ge1xuXG4gICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgdXBkYXRlUGFnZUxhbmd1YWdlKCk7XG4gICAgICB9LFxuICAgICAgZ2V0VHJhbnNsYXRpb246IChrZXkpID0+IHtcbiAgICAgICAgbGV0IHRhcmdldExhbmd1YWdlID0gZGljdGlvbmFyeS5yb3dzLmZpbHRlcigoaSkgPT4gaS5sYW5nID09PSBsYW5ndWFnZSlbMF07XG4gICAgICAgIHJldHVybiB0YXJnZXRMYW5ndWFnZVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxufSkoalF1ZXJ5KTtcbiIsIi8qIFRoaXMgbG9hZHMgYW5kIG1hbmFnZXMgdGhlIGxpc3QhICovXG5cbmNvbnN0IExpc3RNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIHJldHVybiAob3B0aW9ucykgPT4ge1xuICAgIGxldCB0YXJnZXRMaXN0ID0gb3B0aW9ucy50YXJnZXRMaXN0IHx8IFwiI2V2ZW50cy1saXN0XCI7XG4gICAgLy8gSnVuZSAxMyBgMTgg4oCTIHJlZmVycmVyIGFuZCBzb3VyY2VcbiAgICBsZXQge3JlZmVycmVyLCBzb3VyY2V9ID0gb3B0aW9ucztcblxuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0TGlzdCA9PT0gJ3N0cmluZycgPyAkKHRhcmdldExpc3QpIDogdGFyZ2V0TGlzdDtcbiAgICBjb25zdCBkM1RhcmdldCA9IHR5cGVvZiB0YXJnZXRMaXN0ID09PSAnc3RyaW5nJyA/IGQzLnNlbGVjdCh0YXJnZXRMaXN0KSA6IHRhcmdldExpc3Q7XG5cbiAgICBjb25zdCByZW5kZXJFdmVudCA9IChpdGVtLCByZWZlcnJlciA9IG51bGwsIHNvdXJjZSA9IG51bGwpID0+IHtcbiAgICAgIGxldCBtID0gbW9tZW50KG5ldyBEYXRlKGl0ZW0uc3RhcnRfZGF0ZXRpbWUpKTtcbiAgICAgIG0gPSBtLnV0YygpLnN1YnRyYWN0KG0udXRjT2Zmc2V0KCksICdtJyk7XG4gICAgICB2YXIgZGF0ZSA9IG0uZm9ybWF0KFwiZGRkZCBNTU0gREQsIGg6bW1hXCIpO1xuICAgICAgbGV0IHVybCA9IGl0ZW0udXJsLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0udXJsIDogXCIvL1wiICsgaXRlbS51cmw7XG4gICAgICAvLyBsZXQgc3VwZXJHcm91cCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG4gICAgICB1cmwgPSBIZWxwZXIucmVmU291cmNlKHVybCwgcmVmZXJyZXIsIHNvdXJjZSk7XG5cbiAgICAgIC8vPGxpIGNsYXNzPScke3dpbmRvdy5zbHVnaWZ5KGl0ZW0uZXZlbnRfdHlwZSl9IGV2ZW50cyBldmVudC1vYmonIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgIHJldHVybiBgXG5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnQgdHlwZS1hY3Rpb25cIj5cbiAgICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgICA8bGkgY2xhc3M9J3RhZy0ke2l0ZW0uZXZlbnRfdHlwZX0gdGFnJz4ke2l0ZW0uZXZlbnRfdHlwZX08L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPGgyIGNsYXNzPVwiZXZlbnQtdGl0bGVcIj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZX08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtZGF0ZSBkYXRlXCI+JHtkYXRlfTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1hZGRyZXNzIGFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgICAgPHA+JHtpdGVtLnZlbnVlfTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPlJTVlA8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgYFxuICAgIH07XG5cbiAgICBjb25zdCByZW5kZXJHcm91cCA9IChpdGVtLCByZWZlcnJlciA9IG51bGwsIHNvdXJjZSA9IG51bGwpID0+IHtcbiAgICAgIGxldCB1cmwgPSBpdGVtLndlYnNpdGUubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS53ZWJzaXRlIDogXCIvL1wiICsgaXRlbS53ZWJzaXRlO1xuICAgICAgbGV0IHN1cGVyR3JvdXAgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuXG4gICAgICB1cmwgPSBIZWxwZXIucmVmU291cmNlKHVybCwgcmVmZXJyZXIsIHNvdXJjZSk7XG5cbiAgICAgIC8vPGxpIGNsYXNzPScke2l0ZW0uZXZlbnRfdHlwZX0gJHtzdXBlckdyb3VwfSBncm91cC1vYmonIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgIHJldHVybiBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwIGdyb3VwLW9ialwiPlxuICAgICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctJHtpdGVtLnN1cGVyZ3JvdXB9XCI+JHtpdGVtLnN1cGVyZ3JvdXB9PC9saT5cbiAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDxoMj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS5uYW1lfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1sb2NhdGlvbiBsb2NhdGlvblwiPiR7aXRlbS5sb2NhdGlvbn08L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXNjcmlwdGlvblwiPlxuICAgICAgICAgICAgICA8cD4ke2l0ZW0uZGVzY3JpcHRpb259PC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgYFxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgJGxpc3Q6ICR0YXJnZXQsXG4gICAgICB1cGRhdGVGaWx0ZXI6IChwKSA9PiB7XG4gICAgICAgIGlmKCFwKSByZXR1cm47XG5cbiAgICAgICAgLy8gUmVtb3ZlIEZpbHRlcnNcblxuICAgICAgICAkdGFyZ2V0LnJlbW92ZVByb3AoXCJjbGFzc1wiKTtcbiAgICAgICAgJHRhcmdldC5hZGRDbGFzcyhwLmZpbHRlciA/IHAuZmlsdGVyLmpvaW4oXCIgXCIpIDogJycpXG5cbiAgICAgICAgLy8gJHRhcmdldC5maW5kKCdsaScpLmhpZGUoKTtcblxuICAgICAgICBpZiAocC5maWx0ZXIpIHtcbiAgICAgICAgICBwLmZpbHRlci5mb3JFYWNoKChmaWwpPT57XG4gICAgICAgICAgICAkdGFyZ2V0LmZpbmQoYGxpLiR7ZmlsfWApLnNob3coKTtcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdXBkYXRlQm91bmRzOiAoYm91bmQxLCBib3VuZDIsIGZpbHRlcnMpID0+IHtcbiAgICAgICAgLy8gY29uc3QgYm91bmRzID0gW3AuYm91bmRzMSwgcC5ib3VuZHMyXTtcblxuICAgICAgICAvL1xuICAgICAgICAvLyAkdGFyZ2V0LmZpbmQoJ3VsIGxpLmV2ZW50LW9iaiwgdWwgbGkuZ3JvdXAtb2JqJykuZWFjaCgoaW5kLCBpdGVtKT0+IHtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gICBsZXQgX2xhdCA9ICQoaXRlbSkuZGF0YSgnbGF0JyksXG4gICAgICAgIC8vICAgICAgIF9sbmcgPSAkKGl0ZW0pLmRhdGEoJ2xuZycpO1xuICAgICAgICAvL1xuICAgICAgICAvLyAgIGNvbnN0IG1pMTAgPSAwLjE0NDk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgaWYgKGJvdW5kMVswXSA8PSBfbGF0ICYmIGJvdW5kMlswXSA+PSBfbGF0ICYmIGJvdW5kMVsxXSA8PSBfbG5nICYmIGJvdW5kMlsxXSA+PSBfbG5nKSB7XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgICAkKGl0ZW0pLmFkZENsYXNzKCd3aXRoaW4tYm91bmQnKTtcbiAgICAgICAgLy8gICB9IGVsc2Uge1xuICAgICAgICAvLyAgICAgJChpdGVtKS5yZW1vdmVDbGFzcygnd2l0aGluLWJvdW5kJyk7XG4gICAgICAgIC8vICAgfVxuICAgICAgICAvLyB9KTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gbGV0IF92aXNpYmxlID0gJHRhcmdldC5maW5kKCd1bCBsaS5ldmVudC1vYmoud2l0aGluLWJvdW5kLCB1bCBsaS5ncm91cC1vYmoud2l0aGluLWJvdW5kJykubGVuZ3RoO1xuXG4gICAgICAgIGNvbnN0IGRhdGEgPSB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YS5maWx0ZXIoKGl0ZW0pPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdHlwZSA9IGl0ZW0uZXZlbnRfdHlwZSA/IGl0ZW0uZXZlbnRfdHlwZS50b0xvd2VyQ2FzZSgpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWx0ZXJzICYmIChmaWx0ZXJzLmxlbmd0aCA9PSAwIC8qIElmIGl0J3MgaW4gZmlsdGVyICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdHJ1ZSA6IGZpbHRlcnMuaW5jbHVkZXModHlwZSAhPSAnZ3JvdXAnID8gdHlwZSA6IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAvKiBJZiBpdCdzIGluIGJvdW5kcyAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoYm91bmQxWzBdIDw9IGl0ZW0ubGF0ICYmIGJvdW5kMlswXSA+PSBpdGVtLmxhdCAmJiBib3VuZDFbMV0gPD0gaXRlbS5sbmcgJiYgYm91bmQyWzFdID49IGl0ZW0ubG5nKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBsaXN0Q29udGFpbmVyID0gZDNUYXJnZXQuc2VsZWN0KFwidWxcIik7XG4gICAgICAgIGxpc3RDb250YWluZXIuc2VsZWN0QWxsKFwibGkub3JnLWxpc3QtaXRlbVwiKS5yZW1vdmUoKTtcbiAgICAgICAgbGlzdENvbnRhaW5lci5zZWxlY3RBbGwoXCJsaS5vcmctbGlzdC1pdGVtXCIpXG4gICAgICAgICAgLmRhdGEoZGF0YSwgKGl0ZW0pID0+IGl0ZW0uZXZlbnRfdHlwZSA9PSAnZ3JvdXAnID8gaXRlbS53ZWJzaXRlIDogaXRlbS51cmwpXG4gICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAuYXBwZW5kKCdsaScpXG4gICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIChpdGVtKSA9PiBpdGVtLmV2ZW50X3R5cGUgIT0gJ2dyb3VwJyA/ICdvcmctbGlzdC1pdGVtIGV2ZW50cyBldmVudC1vYmonIDogJ29yZy1saXN0LWl0ZW0gZ3JvdXAtb2JqJylcbiAgICAgICAgICAgIC5odG1sKChpdGVtKSA9PiBpdGVtLmV2ZW50X3R5cGUgIT0gJ2dyb3VwJyA/IHJlbmRlckV2ZW50KGl0ZW0sIHJlZmVycmVyLCBzb3VyY2UpIDogcmVuZGVyR3JvdXAoaXRlbSkpO1xuXG5cbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAvLyBUaGUgbGlzdCBpcyBlbXB0eVxuICAgICAgICAgICR0YXJnZXQuYWRkQ2xhc3MoXCJpcy1lbXB0eVwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkdGFyZ2V0LnJlbW92ZUNsYXNzKFwiaXMtZW1wdHlcIik7XG4gICAgICAgIH1cblxuICAgICAgfSxcbiAgICAgIHBvcHVsYXRlTGlzdDogKGhhcmRGaWx0ZXJzKSA9PiB7XG4gICAgICAgIC8vdXNpbmcgd2luZG93LkVWRU5UX0RBVEFcbiAgICAgICAgY29uc3Qga2V5U2V0ID0gIWhhcmRGaWx0ZXJzLmtleSA/IFtdIDogaGFyZEZpbHRlcnMua2V5LnNwbGl0KCcsJyk7XG4gICAgICAgIC8vIHZhciAkZXZlbnRMaXN0ID0gd2luZG93LkVWRU5UU19EQVRBLmRhdGEubWFwKGl0ZW0gPT4ge1xuICAgICAgICAvLyAgIGlmIChrZXlTZXQubGVuZ3RoID09IDApIHtcbiAgICAgICAgLy8gICAgIHJldHVybiBpdGVtLmV2ZW50X3R5cGUgJiYgaXRlbS5ldmVudF90eXBlLnRvTG93ZXJDYXNlKCkgPT0gJ2dyb3VwJyA/IHJlbmRlckdyb3VwKGl0ZW0pIDogcmVuZGVyRXZlbnQoaXRlbSwgcmVmZXJyZXIsIHNvdXJjZSk7XG4gICAgICAgIC8vICAgfSBlbHNlIGlmIChrZXlTZXQubGVuZ3RoID4gMCAmJiBpdGVtLmV2ZW50X3R5cGUgIT0gJ2dyb3VwJyAmJiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5ldmVudF90eXBlKSkge1xuICAgICAgICAvLyAgICAgcmV0dXJuIHJlbmRlckV2ZW50KGl0ZW0sIHJlZmVycmVyLCBzb3VyY2UpO1xuICAgICAgICAvLyAgIH0gZWxzZSBpZiAoa2V5U2V0Lmxlbmd0aCA+IDAgJiYgaXRlbS5ldmVudF90eXBlID09ICdncm91cCcgJiYga2V5U2V0LmluY2x1ZGVzKGl0ZW0uc3VwZXJncm91cCkpIHtcbiAgICAgICAgLy8gICAgIHJldHVybiByZW5kZXJHcm91cChpdGVtLCByZWZlcnJlciwgc291cmNlKVxuICAgICAgICAvLyAgIH1cbiAgICAgICAgLy8gICByZXR1cm4gbnVsbDtcbiAgICAgICAgLy8gfSlcblxuICAgICAgICAvLyBjb25zdCBldmVudFR5cGUgPSBpdGVtLmV2ZW50X3R5cGUgPyBpdGVtLmV2ZW50X3R5cGUudG9Mb3dlckNhc2UoKSA6IG51bGw7XG4gICAgICAgIC8vIGNvbnN0IGluaXRpYWxEYXRhID0gd2luZG93LkVWRU5UU19EQVRBLmRhdGEuZmlsdGVyKGl0ZW0gPT4ga2V5U2V0Lmxlbmd0aCA9PSAwXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHRydWVcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDoga2V5U2V0LmluY2x1ZGVzKGl0ZW0uZXZlbnRfdHlwZSAhPSAnZ3JvdXAnID8gaXRlbS5ldmVudF90eXBlIDogd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKSkpO1xuICAgICAgICAvLyBjb25zdCBsaXN0Q29udGFpbmVyID0gZDNUYXJnZXQuc2VsZWN0KFwidWxcIik7XG4gICAgICAgIC8vIGxpc3RDb250YWluZXIuc2VsZWN0QWxsKFwibGlcIilcbiAgICAgICAgLy8gICAuZGF0YShpbml0aWFsRGF0YSwgKGl0ZW0pID0+IGl0ZW0gPyBpdGVtLnVybCA6ICcnKVxuICAgICAgICAvLyAgIC5lbnRlcigpXG4gICAgICAgIC8vICAgLmFwcGVuZCgnbGknKVxuICAgICAgICAvLyAgICAgLmF0dHIoXCJjbGFzc1wiLCAoaXRlbSkgPT4gaXRlbS5ldmVudF90eXBlICE9ICdncm91cCcgPyAnZXZlbnRzIGV2ZW50LW9iaicgOiAnZ3JvdXAtb2JqJylcbiAgICAgICAgLy8gICAgIC5odG1sKChpdGVtKSA9PiBpdGVtLmV2ZW50X3R5cGUgIT0gJ2dyb3VwJyA/IHJlbmRlckV2ZW50KGl0ZW0sIHJlZmVycmVyLCBzb3VyY2UpIDogcmVuZGVyR3JvdXAoaXRlbSkpXG4gICAgICAgIC8vICAgLmV4aXQoKTtcbiAgICAgICAgICAvLyAucmVtb3ZlKCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGxpc3RDb250YWluZXIpO1xuICAgICAgICAvLyAkdGFyZ2V0LmZpbmQoJ3VsIGxpJykucmVtb3ZlKCk7XG4gICAgICAgIC8vICR0YXJnZXQuZmluZCgndWwnKS5hcHBlbmQoJGV2ZW50TGlzdCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsIlxuXG5jb25zdCBNYXBNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIGxldCBMQU5HVUFHRSA9ICdlbic7XG5cbiAgY29uc3QgcG9wdXAgPSBuZXcgbWFwYm94Z2wuUG9wdXAoe1xuICAgIGNsb3NlT25DbGljazogZmFsc2VcbiAgfSk7XG5cbiAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSwgcmVmZXJyZXIgPSBudWxsLCBzb3VyY2UgPSBudWxsKSA9PiB7XG5cbiAgICBsZXQgbSA9IG1vbWVudChuZXcgRGF0ZShpdGVtLnN0YXJ0X2RhdGV0aW1lKSk7XG4gICAgbSA9IG0udXRjKCkuc3VidHJhY3QobS51dGNPZmZzZXQoKSwgJ20nKTtcblxuICAgIHZhciBkYXRlID0gbS5mb3JtYXQoXCJkZGRkIE1NTSBERCwgaDptbWFcIik7XG4gICAgbGV0IHVybCA9IGl0ZW0udXJsLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0udXJsIDogXCIvL1wiICsgaXRlbS51cmw7XG5cbiAgICB1cmwgPSBIZWxwZXIucmVmU291cmNlKHVybCwgcmVmZXJyZXIsIHNvdXJjZSk7XG5cbiAgICBsZXQgc3VwZXJHcm91cCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG4gICAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPSdwb3B1cC1pdGVtICR7aXRlbS5ldmVudF90eXBlfSAke3N1cGVyR3JvdXB9JyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudFwiPlxuICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgPGxpIGNsYXNzPVwidGFnIHRhZy0ke2l0ZW0uZXZlbnRfdHlwZX1cIj4ke2l0ZW0uZXZlbnRfdHlwZSB8fCAnQWN0aW9uJ308L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8aDIgY2xhc3M9XCJldmVudC10aXRsZVwiPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtZGF0ZVwiPiR7ZGF0ZX08L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWFkZHJlc3MgYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgPHA+JHtpdGVtLnZlbnVlfTwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPlJTVlA8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgYFxuICB9O1xuXG4gIGNvbnN0IHJlbmRlckdyb3VwID0gKGl0ZW0sIHJlZmVycmVyID0gbnVsbCwgc291cmNlID0gbnVsbCkgPT4ge1xuXG4gICAgbGV0IHVybCA9IGl0ZW0ud2Vic2l0ZS5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLndlYnNpdGUgOiBcIi8vXCIgKyBpdGVtLndlYnNpdGU7XG5cbiAgICB1cmwgPSBIZWxwZXIucmVmU291cmNlKHVybCwgcmVmZXJyZXIsIHNvdXJjZSk7XG5cbiAgICBsZXQgc3VwZXJHcm91cCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG4gICAgcmV0dXJuIGBcbiAgICA8bGk+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ncm91cCBncm91cC1vYmogJHtzdXBlckdyb3VwfVwiPlxuICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgPGxpIGNsYXNzPVwidGFnIHRhZy0ke2l0ZW0uc3VwZXJncm91cH0gJHtzdXBlckdyb3VwfVwiPiR7aXRlbS5zdXBlcmdyb3VwfTwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1oZWFkZXJcIj5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0ubmFtZX08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtbG9jYXRpb24gbG9jYXRpb25cIj4ke2l0ZW0ubG9jYXRpb259PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICA8cD4ke2l0ZW0uZGVzY3JpcHRpb259PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+R2V0IEludm9sdmVkPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvbGk+XG4gICAgYFxuICB9O1xuXG4gIGNvbnN0IHJlbmRlckFubm90YXRpb25Qb3B1cCA9IChpdGVtKSA9PiB7XG4gICAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPSdwb3B1cC1pdGVtIGFubm90YXRpb24nIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLWFubm90YXRpb25cIj5Bbm5vdGF0aW9uPC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPGgyIGNsYXNzPVwiZXZlbnQtdGl0bGVcIj4ke2l0ZW0ubmFtZX08L2gyPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtYWRkcmVzcyBhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICA8cD4ke2l0ZW0uZGVzY3JpcHRpb259PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICAgIGA7XG4gIH1cblxuXG4gIGNvbnN0IHJlbmRlckFubm90YXRpb25zR2VvSnNvbiA9IChsaXN0KSA9PiB7XG4gICAgcmV0dXJuIGxpc3QubWFwKChpdGVtKSA9PiB7XG4gICAgICBjb25zdCByZW5kZXJlZCA9IHJlbmRlckFubm90YXRpb25Qb3B1cChpdGVtKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICB0eXBlOiBcIlBvaW50XCIsXG4gICAgICAgICAgY29vcmRpbmF0ZXM6IFtpdGVtLmxuZywgaXRlbS5sYXRdXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBhbm5vdGF0aW9uUHJvcHM6IGl0ZW0sXG4gICAgICAgICAgcG9wdXBDb250ZW50OiByZW5kZXJlZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IHJlbmRlckdlb2pzb24gPSAobGlzdCwgcmVmID0gbnVsbCwgc3JjID0gbnVsbCkgPT4ge1xuICAgIHJldHVybiBsaXN0Lm1hcCgoaXRlbSkgPT4ge1xuICAgICAgLy8gcmVuZGVyZWQgZXZlbnRUeXBlXG4gICAgICBsZXQgcmVuZGVyZWQ7XG5cbiAgICAgIGlmIChpdGVtLmV2ZW50X3R5cGUgJiYgaXRlbS5ldmVudF90eXBlLnRvTG93ZXJDYXNlKCkgPT0gJ2dyb3VwJykge1xuICAgICAgICByZW5kZXJlZCA9IHJlbmRlckdyb3VwKGl0ZW0sIHJlZiwgc3JjKTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVuZGVyZWQgPSByZW5kZXJFdmVudChpdGVtLCByZWYsIHNyYyk7XG4gICAgICB9XG5cbiAgICAgIC8vIGZvcm1hdCBjaGVja1xuICAgICAgaWYgKGlzTmFOKHBhcnNlRmxvYXQocGFyc2VGbG9hdChpdGVtLmxuZykpKSkge1xuICAgICAgICBpdGVtLmxuZyA9IGl0ZW0ubG5nLnN1YnN0cmluZygxKVxuICAgICAgfVxuICAgICAgaWYgKGlzTmFOKHBhcnNlRmxvYXQocGFyc2VGbG9hdChpdGVtLmxhdCkpKSkge1xuICAgICAgICBpdGVtLmxhdCA9IGl0ZW0ubGF0LnN1YnN0cmluZygxKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICAgIGdlb21ldHJ5OiB7XG4gICAgICAgICAgdHlwZTogXCJQb2ludFwiLFxuICAgICAgICAgIGNvb3JkaW5hdGVzOiBbaXRlbS5sbmcsIGl0ZW0ubGF0XVxuICAgICAgICB9LFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgZXZlbnRQcm9wZXJ0aWVzOiBpdGVtLFxuICAgICAgICAgIHBvcHVwQ29udGVudDogcmVuZGVyZWRcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBnZXRFdmVudEdlb2pzb24gPSAodGFyZ2V0cywgcmVmZXJyZXI9bnVsbCwgc291cmNlPW51bGwpID0+IHtcbiAgICAgICAgICByZXR1cm4gKHtcbiAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgICAgICAgICAgICAgXCJmZWF0dXJlc1wiOiB0YXJnZXRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNvcnQoKHgseSkgPT4gZDMuZGVzY2VuZGluZyhuZXcgRGF0ZSh4LnN0YXJ0X2RhdGV0aW1lKSwgbmV3IERhdGUoeS5zdGFydF9kYXRldGltZSkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoaXRlbSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlkXCI6IGAke2l0ZW0ubG5nfS0ke2l0ZW0ubGF0fWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkZXNjcmlwdGlvblwiOiAgcmVuZGVyRXZlbnQoaXRlbSwgcmVmZXJyZXIsIHNvdXJjZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpc19wYXN0XCI6IG5ldyBEYXRlKGl0ZW0uc3RhcnRfZGF0ZXRpbWUpIDwgbmV3IERhdGUoKSA/ICd5ZXMnIDogJ25vJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImdlb21ldHJ5XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJQb2ludFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY29vcmRpbmF0ZXNcIjogW2l0ZW0ubG5nLCBpdGVtLmxhdF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgY29uc3QgZ2V0R3JvdXBHZW9qc29uID0gKHRhcmdldHMsIHJlZmVycmVyPW51bGwsIHNvdXJjZT1udWxsKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgICBcInR5cGVcIjogXCJGZWF0dXJlQ29sbGVjdGlvblwiLFxuICAgICAgICAgIFwiZmVhdHVyZXNcIjogdGFyZ2V0c1xuICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChpdGVtID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInByb3BlcnRpZXNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBgJHtpdGVtLmxuZ30tJHtpdGVtLmxhdH1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkZXNjcmlwdGlvblwiOiAgcmVuZGVyR3JvdXAoaXRlbSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZ2VvbWV0cnlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY29vcmRpbmF0ZXNcIjogW2l0ZW0ubG5nLCBpdGVtLmxhdF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgIH07XG4gIH07XG5cbiAgcmV0dXJuIChvcHRpb25zKSA9PiB7XG4gICAgdmFyIGFjY2Vzc1Rva2VuID0gJ3BrLmV5SjFJam9pYldGMGRHaGxkek0xTUNJc0ltRWlPaUphVFZGTVVrVXdJbjAud2NNM1hjOEJHQzZQTS1PeXJ3am5oZyc7XG4gICAgdmFyIG1hcCA9IEwubWFwKCdtYXAtcHJvcGVyJywgeyBkcmFnZ2luZzogIUwuQnJvd3Nlci5tb2JpbGUgfSkuc2V0VmlldyhbMzQuODg1OTMwOTQwNzUzMTcsIDUuMDk3NjU2MjUwMDAwMDAxXSwgMik7XG5cblxuICAgIG1hcGJveGdsLmFjY2Vzc1Rva2VuID0gJ3BrLmV5SjFJam9pY21OelkyRnpkR2xzYkc4aUxDSmhJam9pWTJwc2VEWjJibXAwTURjd1l6TndjR3AxYmpCcU5IbzRhU0o5LjNiRDhnUXJNQUlFcVY2eXlTLV9fdmcnO1xuICAgIG1hcCA9IG5ldyBtYXBib3hnbC5NYXAoe1xuICAgICAgY29udGFpbmVyOiAnbWFwLXByb3BlcicsXG4gICAgICBzdHlsZTogJ21hcGJveDovL3N0eWxlcy9yY3NjYXN0aWxsby9jam1tYjJ2dGNsb3Y1MnJwMHNjenFvbWNzJyxcbiAgICAgIGRvdWJsZUNsaWNrWm9vbTogZmFsc2UsXG4gICAgICBjZW50ZXI6IFszNC44ODU5MzA5NDA3NTMxNywgNS4wOTc2NTYyNTAwMDAwMDFdLFxuICAgICAgem9vbTogMS41XG4gICAgfSk7XG5cbiAgICBsZXQge3JlZmVycmVyLCBzb3VyY2V9ID0gb3B0aW9ucztcblxuICAgIC8vIGlmICghTC5Ccm93c2VyLm1vYmlsZSkge1xuICAgIC8vICAgbWFwLnNjcm9sbFdoZWVsWm9vbS5kaXNhYmxlKCk7XG4gICAgLy8gfVxuXG4gICAgTEFOR1VBR0UgPSBvcHRpb25zLmxhbmcgfHwgJ2VuJztcblxuICAgIGlmIChvcHRpb25zLm9uTW92ZSkge1xuICAgICAgbWFwLm9uKCdkcmFnZW5kJywgKGV2ZW50KSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm5kID0gbWFwLmdldEJvdW5kcygpO1xuICAgICAgICBsZXQgc3cgPSBbYm5kLl9zdy5sYXQsIGJuZC5fc3cubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW2JuZC5fbmUubGF0LCBibmQuX25lLmxuZ107XG4gICAgICAgIG9wdGlvbnMub25Nb3ZlKHN3LCBuZSk7XG4gICAgICB9KS5vbignem9vbWVuZCcsIChldmVudCkgPT4ge1xuICAgICAgICBpZiAobWFwLmdldFpvb20oKSA8PSA0KSB7XG4gICAgICAgICAgJChcIiNtYXBcIikuYWRkQ2xhc3MoXCJ6b29tZWQtb3V0XCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICQoXCIjbWFwXCIpLnJlbW92ZUNsYXNzKFwiem9vbWVkLW91dFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJuZCA9IG1hcC5nZXRCb3VuZHMoKTtcbiAgICAgICAgbGV0IHN3ID0gW2JuZC5fc3cubGF0LCBibmQuX3N3LmxuZ107XG4gICAgICAgIGxldCBuZSA9IFtibmQuX25lLmxhdCwgYm5kLl9uZS5sbmddO1xuICAgICAgICBvcHRpb25zLm9uTW92ZShzdywgbmUpO1xuICAgICAgfSlcblxuICAgIH1cblxuICAgIC8vIG1hcC5maXJlRXZlbnQoJ3pvb21lbmQnKTtcblxuICAgIC8vIEwudGlsZUxheWVyKCdodHRwczovL2FwaS5tYXBib3guY29tL3N0eWxlcy92MS9tYXR0aGV3MzUwL2NqYTQxdGlqazI3ZDYycnFvZDdnMGx4NGIvdGlsZXMvMjU2L3t6fS97eH0ve3l9P2FjY2Vzc190b2tlbj0nICsgYWNjZXNzVG9rZW4sIHtcbiAgICAvLyAgICAgYXR0cmlidXRpb246ICcmY29weTsgPGEgaHJlZj1cImh0dHA6Ly9vc20ub3JnL2NvcHlyaWdodFwiPk9wZW5TdHJlZXRNYXA8L2E+IGNvbnRyaWJ1dG9ycyDigKIgPGEgaHJlZj1cIi8vMzUwLm9yZ1wiPjM1MC5vcmc8L2E+J1xuICAgIC8vIH0pLmFkZFRvKG1hcCk7XG5cbiAgICAvLyBjb25zb2xlLmxvZyh3aW5kb3cucXVlcmllc1sndHdpbGlnaHQtem9uZSddLCB3aW5kb3cucXVlcmllc1sndHdpbGlnaHQtem9uZSddID09PSBcInRydWVcIik7XG4gICAgaWYod2luZG93LnF1ZXJpZXNbJ3R3aWxpZ2h0LXpvbmUnXSkge1xuICAgICAgTC50ZXJtaW5hdG9yKCkuYWRkVG8obWFwKVxuICAgIH1cblxuICAgIGxldCBnZW9jb2RlciA9IG51bGw7XG4gICAgcmV0dXJuIHtcbiAgICAgICRtYXA6IG1hcCxcbiAgICAgIGluaXRpYWxpemU6IChjYWxsYmFjaykgPT4ge1xuICAgICAgICBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgc2V0Qm91bmRzOiAoYm91bmRzMSwgYm91bmRzMikgPT4ge1xuXG4gICAgICAgIC8vIGNvbnN0IGJvdW5kcyA9IFtib3VuZHMxLCBib3VuZHMyXTtcbiAgICAgICAgY29uc3QgYm91bmRzID0gW2JvdW5kczEucmV2ZXJzZSgpLCBib3VuZHMyLnJldmVyc2UoKV07IC8vIG1hcGJveFxuICAgICAgICBjb25zb2xlLmxvZyhib3VuZHMpO1xuICAgICAgICBtYXAuZml0Qm91bmRzKGJvdW5kcywgeyBhbmltYXRlOiBmYWxzZX0pO1xuICAgICAgfSxcbiAgICAgIHNldENlbnRlcjogKGNlbnRlciwgem9vbSA9IDEwKSA9PiB7XG4gICAgICAgIGlmICghY2VudGVyIHx8ICFjZW50ZXJbMF0gfHwgY2VudGVyWzBdID09IFwiXCJcbiAgICAgICAgICAgICAgfHwgIWNlbnRlclsxXSB8fCBjZW50ZXJbMV0gPT0gXCJcIikgcmV0dXJuO1xuICAgICAgICBtYXAuc2V0VmlldyhjZW50ZXIsIHpvb20pO1xuICAgICAgfSxcbiAgICAgIGdldEJvdW5kczogKCkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGJuZCA9IG1hcC5nZXRCb3VuZHMoKVxuICAgICAgICBsZXQgc3cgPSBbYm5kLl9zdy5sYXQsIGJuZC5fc3cubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW2JuZC5fbmUubGF0LCBibmQuX25lLmxuZ107XG5cbiAgICAgICAgcmV0dXJuIFtzdywgbmVdO1xuICAgICAgfSxcbiAgICAgIC8vIENlbnRlciBsb2NhdGlvbiBieSBnZW9jb2RlZFxuICAgICAgZ2V0Q2VudGVyQnlMb2NhdGlvbjogKGxvY2F0aW9uLCBjYWxsYmFjaykgPT4ge1xuXG4gICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBsb2NhdGlvbiB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG5cbiAgICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXN1bHRzWzBdKVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgdHJpZ2dlclpvb21FbmQ6ICgpID0+IHtcbiAgICAgICAgLy8gbWFwLmZpcmVFdmVudCgnem9vbWVuZCcpO1xuICAgICAgfSxcbiAgICAgIHpvb21PdXRPbmNlOiAoKSA9PiB7XG4gICAgICAgIG1hcC56b29tT3V0KDEpO1xuICAgICAgfSxcbiAgICAgIHpvb21VbnRpbEhpdDogKCkgPT4ge1xuICAgICAgICB2YXIgJHRoaXMgPSB0aGlzO1xuICAgICAgICBtYXAuem9vbU91dCgxKTtcbiAgICAgICAgbGV0IGludGVydmFsSGFuZGxlciA9IG51bGw7XG4gICAgICAgIGludGVydmFsSGFuZGxlciA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICB2YXIgX3Zpc2libGUgPSAkKGRvY3VtZW50KS5maW5kKCd1bCBsaS5ldmVudC1vYmoud2l0aGluLWJvdW5kLCB1bCBsaS5ncm91cC1vYmoud2l0aGluLWJvdW5kJykubGVuZ3RoO1xuICAgICAgICAgIGlmIChfdmlzaWJsZSA9PSAwKSB7XG4gICAgICAgICAgICBtYXAuem9vbU91dCgxKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbEhhbmRsZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgMjAwKTtcbiAgICAgIH0sXG4gICAgICByZWZyZXNoTWFwOiAoKSA9PiB7XG4gICAgICAgIC8vICBtYXAuaW52YWxpZGF0ZVNpemUoZmFsc2UpO1xuICAgICAgICAvLyBtYXAuX29uUmVzaXplKCk7XG4gICAgICAgIC8vIG1hcC5maXJlRXZlbnQoJ3pvb21lbmQnKTtcblxuXG4gICAgICB9LFxuICAgICAgZmlsdGVyTWFwOiAoZmlsdGVycykgPT4ge1xuXG4gICAgICAgIC8vIFRPRE8gbWFwYm94IHRoaXMuXG4gICAgICAgICQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cFwiKS5oaWRlKCk7XG4gICAgICAgIGlmICghZmlsdGVycykgcmV0dXJuO1xuICAgICAgICBmaWx0ZXJzLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXAuXCIgKyBpdGVtLnRvTG93ZXJDYXNlKCkpLnNob3coKTtcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICBwbG90UG9pbnRzOiAobGlzdCwgaGFyZEZpbHRlcnMsIGdyb3VwcykgPT4ge1xuICAgICAgICBjb25zdCBrZXlTZXQgPSAhaGFyZEZpbHRlcnMua2V5ID8gW10gOiBoYXJkRmlsdGVycy5rZXkuc3BsaXQoJywnKTtcbiAgICAgICAgaWYgKGtleVNldC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgbGlzdCA9IGxpc3QuZmlsdGVyKChpdGVtKSA9PiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5ldmVudF90eXBlKSlcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhsaXN0LCBoYXJkRmlsdGVycyxncm91cHMpO1xuXG4gICAgICAgIC8vIENvbG9yIHRoZSBtYXBcbiAgICAgICAgZm9yIChsZXQgaSBpbiBncm91cHMpIHtcbiAgICAgICAgICBjb25zdCBncm91cCA9IGdyb3Vwc1tpXTtcbiAgICAgICAgICBjb25zdCB0YXJnZXRzID0gbGlzdC5maWx0ZXIoaXRlbSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uZXZlbnRfdHlwZSA9PSBcImdyb3VwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gaXRlbS5zdXBlcmdyb3VwID09IGdyb3VwLnN1cGVyZ3JvdXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogaXRlbS5ldmVudF90eXBlID09IHdpbmRvdy5zbHVnaWZ5KGdyb3VwLnN1cGVyZ3JvdXApKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyh0YXJnZXRzKTtcblxuXG5cbiAgICAgICAgICAgIC8vIGl0ZW0uY2F0ZWdvcmllcyA9PSBcImJsb2Nrd2Fsa1wiO1xuICAgICAgICAgIGlmIChpID09IFwiRXZlbnRzXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IGdlb2pzb24gPWdldEV2ZW50R2VvanNvbih0YXJnZXRzLCByZWZlcnJlciwgc291cmNlKTtcbiAgICAgICAgICAgIG1hcC5hZGRMYXllcih7XG4gICAgICAgICAgICAgIFwiaWRcIjogXCJldmVudHNcIixcbiAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiY2lyY2xlXCIsXG4gICAgICAgICAgICAgIFwic291cmNlXCI6IHtcbiAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJnZW9qc29uXCIsXG4gICAgICAgICAgICAgICAgXCJkYXRhXCI6IGdlb2pzb25cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgXCJwYWludFwiOiB7XG4gICAgICAgICAgICAgICAgXCJjaXJjbGUtcmFkaXVzXCI6IDUsXG4gICAgICAgICAgICAgICAgXCJjaXJjbGUtY29sb3JcIjogWydjYXNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFsnPT0nLCBbJ2dldCcsICdpc19wYXN0J10sICd5ZXMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiI0JCQkJCQlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIjNDBkN2Q0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBcImNpcmNsZS1vcGFjaXR5XCI6IDAuOSxcbiAgICAgICAgICAgICAgICBcImNpcmNsZS1zdHJva2Utd2lkdGhcIjogMixcbiAgICAgICAgICAgICAgICBcImNpcmNsZS1zdHJva2UtY29sb3JcIjogXCJ3aGl0ZVwiLFxuICAgICAgICAgICAgICAgIFwiY2lyY2xlLXN0cm9rZS1vcGFjaXR5XCI6IDFcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGdlb2pzb24gPSBnZXRHcm91cEdlb2pzb24odGFyZ2V0cywgZ3JvdXAsIHJlZmVycmVyLCBzb3VyY2UpO1xuICAgICAgICAgICAgbWFwLmxvYWRJbWFnZShncm91cC5pY29udXJsLCAoZXJyb3IsZ3JvdXBJY29uKSA9PiB7XG5cbiAgICAgICAgICAgICAgbWFwLmFkZEltYWdlKGAke3dpbmRvdy5zbHVnaWZ5KGkpfS1pY29uYCwgZ3JvdXBJY29uKTtcbiAgICAgICAgICAgICAgbWFwLmFkZExheWVyKHtcbiAgICAgICAgICAgICAgICBcImlkXCI6IHdpbmRvdy5zbHVnaWZ5KGkpLFxuICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInN5bWJvbFwiLFxuICAgICAgICAgICAgICAgIFwic291cmNlXCI6IHtcbiAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImdlb2pzb25cIixcbiAgICAgICAgICAgICAgICAgIFwiZGF0YVwiOiBnZW9qc29uXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcImxheW91dFwiOiB7XG4gICAgICAgICAgICAgICAgICAnaWNvbi1hbGxvdy1vdmVybGFwJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICdpY29uLWlnbm9yZS1wbGFjZW1lbnQnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgJ3RleHQtaWdub3JlLXBsYWNlbWVudCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAndGV4dC1hbGxvdy1vdmVybGFwJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgIFwiaWNvbi1pbWFnZVwiOiBgJHt3aW5kb3cuc2x1Z2lmeShpKX0taWNvbmAsXG4gICAgICAgICAgICAgICAgICBcImljb24tc2l6ZVwiOiAwLjE1XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbWFwLm9uKFwiY2xpY2tcIiwgd2luZG93LnNsdWdpZnkoaSksIChlKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNsaWNrZWQgRXZlbnRzXCIpXG4gICAgICAgICAgICB2YXIgY29vcmRpbmF0ZXMgPSBlLmZlYXR1cmVzWzBdLmdlb21ldHJ5LmNvb3JkaW5hdGVzLnNsaWNlKCk7XG4gICAgICAgICAgICB2YXIgZGVzY3JpcHRpb24gPSBlLmZlYXR1cmVzWzBdLnByb3BlcnRpZXMuZGVzY3JpcHRpb247XG4gICAgICAgICAgICBwb3B1cC5zZXRMbmdMYXQoY29vcmRpbmF0ZXMpXG4gICAgICAgICAgICAgICAgICAuc2V0SFRNTChkZXNjcmlwdGlvbilcbiAgICAgICAgICAgICAgICAgIC5hZGRUbyhtYXApXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBfb2xkUGxvdFBvaW50czogKGxpc3QsIGhhcmRGaWx0ZXJzLCBncm91cHMpID0+IHtcbiAgICAgICAgY29uc3Qga2V5U2V0ID0gIWhhcmRGaWx0ZXJzLmtleSA/IFtdIDogaGFyZEZpbHRlcnMua2V5LnNwbGl0KCcsJyk7XG4gICAgICAgIGlmIChrZXlTZXQubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGxpc3QgPSBsaXN0LmZpbHRlcigoaXRlbSkgPT4ga2V5U2V0LmluY2x1ZGVzKGl0ZW0uZXZlbnRfdHlwZSkpXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZ2VvanNvbiA9IHtcbiAgICAgICAgICB0eXBlOiBcIkZlYXR1cmVDb2xsZWN0aW9uXCIsXG4gICAgICAgICAgZmVhdHVyZXM6IHJlbmRlckdlb2pzb24obGlzdCwgcmVmZXJyZXIsIHNvdXJjZSlcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZXZlbnRzTGF5ZXIgPSBMLmdlb0pTT04oZ2VvanNvbiwge1xuICAgICAgICAgICAgcG9pbnRUb0xheWVyOiAoZmVhdHVyZSwgbGF0bG5nKSA9PiB7XG4gICAgICAgICAgICAgIC8vIEljb25zIGZvciBtYXJrZXJzXG4gICAgICAgICAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuZXZlbnRfdHlwZTtcbiAgICAgICAgICAgICAgLy8gSWYgbm8gc3VwZXJncm91cCwgaXQncyBhbiBldmVudC5cbiAgICAgICAgICAgICAgY29uc3Qgc3VwZXJncm91cCA9IGdyb3Vwc1tmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLnN1cGVyZ3JvdXBdID8gZmVhdHVyZS5wcm9wZXJ0aWVzLmV2ZW50UHJvcGVydGllcy5zdXBlcmdyb3VwIDogXCJFdmVudHNcIjtcbiAgICAgICAgICAgICAgY29uc3Qgc2x1Z2dlZCA9IHdpbmRvdy5zbHVnaWZ5KHN1cGVyZ3JvdXApO1xuICAgICAgICAgICAgICBsZXQgaWNvblVybDtcbiAgICAgICAgICAgICAgY29uc3QgaXNQYXN0ID0gbmV3IERhdGUoZmVhdHVyZS5wcm9wZXJ0aWVzLmV2ZW50UHJvcGVydGllcy5zdGFydF9kYXRldGltZSkgPCBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgICBpZiAoZXZlbnRUeXBlID09IFwiQWN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBpY29uVXJsID0gaXNQYXN0ID8gXCIvaW1nL3Bhc3QtZXZlbnQucG5nXCIgOiBcIi9pbWcvZXZlbnQucG5nXCI7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWNvblVybCA9IGdyb3Vwc1tzdXBlcmdyb3VwXSA/IGdyb3Vwc1tzdXBlcmdyb3VwXS5pY29udXJsIHx8IFwiL2ltZy9ldmVudC5wbmdcIiAgOiBcIi9pbWcvZXZlbnQucG5nXCIgO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY29uc3Qgc21hbGxJY29uID0gIEwuaWNvbih7XG4gICAgICAgICAgICAgICAgaWNvblVybDogaWNvblVybCxcbiAgICAgICAgICAgICAgICBpY29uU2l6ZTogWzE4LCAxOF0sXG4gICAgICAgICAgICAgICAgaWNvbkFuY2hvcjogWzksIDldLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogc2x1Z2dlZCArICcgZXZlbnQtaXRlbS1wb3B1cCAnICsgKGlzUGFzdCYmZXZlbnRUeXBlID09IFwiQWN0aW9uXCI/XCJldmVudC1wYXN0LWV2ZW50XCI6XCJcIilcbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgdmFyIGdlb2pzb25NYXJrZXJPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIGljb246IHNtYWxsSWNvbixcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgcmV0dXJuIEwubWFya2VyKGxhdGxuZywgZ2VvanNvbk1hcmtlck9wdGlvbnMpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgIG9uRWFjaEZlYXR1cmU6IChmZWF0dXJlLCBsYXllcikgPT4ge1xuICAgICAgICAgICAgaWYgKGZlYXR1cmUucHJvcGVydGllcyAmJiBmZWF0dXJlLnByb3BlcnRpZXMucG9wdXBDb250ZW50KSB7XG4gICAgICAgICAgICAgIGxheWVyLmJpbmRQb3B1cChmZWF0dXJlLnByb3BlcnRpZXMucG9wdXBDb250ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGV2ZW50c0xheWVyLmFkZFRvKG1hcCk7XG4gICAgICAgIC8vIGV2ZW50c0xheWVyLmJyaW5nVG9CYWNrKCk7XG5cblxuICAgICAgICAvLyBBZGQgQW5ub3RhdGlvbnNcbiAgICAgICAgaWYgKHdpbmRvdy5xdWVyaWVzLmFubm90YXRpb24pIHtcbiAgICAgICAgICBjb25zdCBhbm5vdGF0aW9ucyA9ICF3aW5kb3cuRVZFTlRTX0RBVEEuYW5ub3RhdGlvbnMgPyBbXSA6IHdpbmRvdy5FVkVOVFNfREFUQS5hbm5vdGF0aW9ucy5maWx0ZXIoKGl0ZW0pPT5pdGVtLnR5cGU9PT13aW5kb3cucXVlcmllcy5hbm5vdGF0aW9uKTtcblxuICAgICAgICAgIGNvbnN0IGFubm90SWNvbiA9ICBMLmljb24oe1xuICAgICAgICAgICAgaWNvblVybDogXCIvaW1nL2Fubm90YXRpb24ucG5nXCIsXG4gICAgICAgICAgICBpY29uU2l6ZTogWzQwLCA0MF0sXG4gICAgICAgICAgICBpY29uQW5jaG9yOiBbMjAsIDIwXSxcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ2Fubm90YXRpb24tcG9wdXAnXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgY29uc3QgYW5ub3RNYXJrZXJzID0gYW5ub3RhdGlvbnMubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gTC5tYXJrZXIoW2l0ZW0ubGF0LCBpdGVtLmxuZ10sIHtpY29uOiBhbm5vdEljb259KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmJpbmRQb3B1cChyZW5kZXJBbm5vdGF0aW9uUG9wdXAoaXRlbSkpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyBhbm5vdExheWVyLmJyaW5nVG9Gcm9udCgpO1xuXG4gICAgICAgICAgLy8gY29uc3QgYW5ub3RMYXllckdyb3VwID0gO1xuXG4gICAgICAgICAgY29uc3QgYW5ub3RMYXllckdyb3VwID0gbWFwLmFkZExheWVyKEwuZmVhdHVyZUdyb3VwKGFubm90TWFya2VycykpO1xuICAgICAgICAgIC8vIGFubm90TGF5ZXJHcm91cC5icmluZ1RvRnJvbnQoKTtcbiAgICAgICAgICAvLyBhbm5vdE1hcmtlcnMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAvLyAgIGl0ZW0uYWRkVG8obWFwKTtcbiAgICAgICAgICAvLyAgIGl0ZW0uYnJpbmdUb0Zyb250KCk7XG4gICAgICAgICAgLy8gfSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHVwZGF0ZTogKHApID0+IHtcbiAgICAgICAgaWYgKCFwIHx8ICFwLmxhdCB8fCAhcC5sbmcgKSByZXR1cm47XG5cbiAgICAgICAgbWFwLnNldFZpZXcoTC5sYXRMbmcocC5sYXQsIHAubG5nKSwgMTApO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJjb25zdCBRdWVyeU1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRGb3JtID0gXCJmb3JtI2ZpbHRlcnMtZm9ybVwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRGb3JtID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0Rm9ybSkgOiB0YXJnZXRGb3JtO1xuICAgIGxldCBsYXQgPSBudWxsO1xuICAgIGxldCBsbmcgPSBudWxsO1xuXG4gICAgbGV0IHByZXZpb3VzID0ge307XG5cbiAgICAkdGFyZ2V0Lm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgbGF0ID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbCgpO1xuICAgICAgbG5nID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbCgpO1xuXG4gICAgICB2YXIgZm9ybSA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcblxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAkLnBhcmFtKGZvcm0pO1xuICAgIH0pXG5cbiAgICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJ3NlbGVjdCNmaWx0ZXItaXRlbXMnLCAoKSA9PiB7XG4gICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgIH0pXG5cblxuICAgIHJldHVybiB7XG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgcGFyYW1zID0gJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSlcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhbmddXCIpLnZhbChwYXJhbXMubGFuZyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChwYXJhbXMubGF0KTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKHBhcmFtcy5sbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwocGFyYW1zLmJvdW5kMSk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChwYXJhbXMuYm91bmQyKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxvY11cIikudmFsKHBhcmFtcy5sb2MpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9a2V5XVwiKS52YWwocGFyYW1zLmtleSk7XG5cbiAgICAgICAgICBpZiAocGFyYW1zLmZpbHRlcikge1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiI2ZpbHRlci1pdGVtcyBvcHRpb25cIikucmVtb3ZlUHJvcChcInNlbGVjdGVkXCIpO1xuICAgICAgICAgICAgcGFyYW1zLmZpbHRlci5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIjZmlsdGVyLWl0ZW1zIG9wdGlvblt2YWx1ZT0nXCIgKyBpdGVtICsgXCInXVwiKS5wcm9wKFwic2VsZWN0ZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGdldFBhcmFtZXRlcnM6ICgpID0+IHtcbiAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG4gICAgICAgIC8vIHBhcmFtZXRlcnNbJ2xvY2F0aW9uJ10gO1xuXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHBhcmFtZXRlcnMpIHtcbiAgICAgICAgICBpZiAoICFwYXJhbWV0ZXJzW2tleV0gfHwgcGFyYW1ldGVyc1trZXldID09IFwiXCIpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBwYXJhbWV0ZXJzW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtZXRlcnM7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTG9jYXRpb246IChsYXQsIGxuZykgPT4ge1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKGxhdCk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwobG5nKTtcbiAgICAgICAgLy8gJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVWaWV3cG9ydDogKHZpZXdwb3J0KSA9PiB7XG5cbiAgICAgICAgLy8gQXZlcmFnZSBpdCBpZiBsZXNzIHRoYW4gMTBtaSByYWRpdXNcbiAgICAgICAgaWYgKE1hdGguYWJzKHZpZXdwb3J0LmYuYiAtIHZpZXdwb3J0LmYuZikgPCAuMTUgfHwgTWF0aC5hYnModmlld3BvcnQuYi5iIC0gdmlld3BvcnQuYi5mKSA8IC4xNSkge1xuICAgICAgICAgIGxldCBmQXZnID0gKHZpZXdwb3J0LmYuYiArIHZpZXdwb3J0LmYuZikgLyAyO1xuICAgICAgICAgIGxldCBiQXZnID0gKHZpZXdwb3J0LmIuYiArIHZpZXdwb3J0LmIuZikgLyAyO1xuICAgICAgICAgIHZpZXdwb3J0LmYgPSB7IGI6IGZBdmcgLSAuMDgsIGY6IGZBdmcgKyAuMDggfTtcbiAgICAgICAgICB2aWV3cG9ydC5iID0geyBiOiBiQXZnIC0gLjA4LCBmOiBiQXZnICsgLjA4IH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYm91bmRzID0gW1t2aWV3cG9ydC5mLmIsIHZpZXdwb3J0LmIuYl0sIFt2aWV3cG9ydC5mLmYsIHZpZXdwb3J0LmIuZl1dO1xuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlVmlld3BvcnRCeUJvdW5kOiAoc3csIG5lKSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW3N3LCBuZV07Ly8vLy8vLy9cblxuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdHJpZ2dlclN1Ym1pdDogKCkgPT4ge1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSkoalF1ZXJ5KTtcbiIsImxldCBhdXRvY29tcGxldGVNYW5hZ2VyO1xubGV0IG1hcE1hbmFnZXI7XG5cbndpbmRvdy5ERUZBVUxUX0lDT04gPSBcIi9pbWcvZXZlbnQucG5nXCI7XG53aW5kb3cuc2x1Z2lmeSA9ICh0ZXh0KSA9PiAhdGV4dCA/IHRleHQgOiB0ZXh0LnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHMrL2csICctJykgICAgICAgICAgIC8vIFJlcGxhY2Ugc3BhY2VzIHdpdGggLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9bXlxcd1xcLV0rL2csICcnKSAgICAgICAvLyBSZW1vdmUgYWxsIG5vbi13b3JkIGNoYXJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcLVxcLSsvZywgJy0nKSAgICAgICAgIC8vIFJlcGxhY2UgbXVsdGlwbGUgLSB3aXRoIHNpbmdsZSAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL14tKy8sICcnKSAgICAgICAgICAgICAvLyBUcmltIC0gZnJvbSBzdGFydCBvZiB0ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLy0rJC8sICcnKTsgICAgICAgICAgICAvLyBUcmltIC0gZnJvbSBlbmQgb2YgdGV4dFxuXG5jb25zdCBnZXRRdWVyeVN0cmluZyA9ICgpID0+IHtcbiAgICB2YXIgcXVlcnlTdHJpbmdLZXlWYWx1ZSA9IHdpbmRvdy5wYXJlbnQubG9jYXRpb24uc2VhcmNoLnJlcGxhY2UoJz8nLCAnJykuc3BsaXQoJyYnKTtcbiAgICB2YXIgcXNKc29uT2JqZWN0ID0ge307XG4gICAgaWYgKHF1ZXJ5U3RyaW5nS2V5VmFsdWUgIT0gJycpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBxdWVyeVN0cmluZ0tleVZhbHVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBxc0pzb25PYmplY3RbcXVlcnlTdHJpbmdLZXlWYWx1ZVtpXS5zcGxpdCgnPScpWzBdXSA9IHF1ZXJ5U3RyaW5nS2V5VmFsdWVbaV0uc3BsaXQoJz0nKVsxXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcXNKc29uT2JqZWN0O1xufTtcblxuKGZ1bmN0aW9uKCQpIHtcbiAgLy8gTG9hZCB0aGluZ3NcblxuICB3aW5kb3cucXVlcmllcyA9ICAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHJpbmcoMSkpO1xuICB0cnkge1xuICAgIGlmICgoIXdpbmRvdy5xdWVyaWVzLmdyb3VwIHx8ICghd2luZG93LnF1ZXJpZXMucmVmZXJyZXIgJiYgIXdpbmRvdy5xdWVyaWVzLnNvdXJjZSkpICYmIHdpbmRvdy5wYXJlbnQpIHtcbiAgICAgIHdpbmRvdy5xdWVyaWVzID0ge1xuICAgICAgICBncm91cDogZ2V0UXVlcnlTdHJpbmcoKS5ncm91cCxcbiAgICAgICAgcmVmZXJyZXI6IGdldFF1ZXJ5U3RyaW5nKCkucmVmZXJyZXIsXG4gICAgICAgIHNvdXJjZTogZ2V0UXVlcnlTdHJpbmcoKS5zb3VyY2UsXG4gICAgICAgIFwidHdpbGlnaHQtem9uZVwiOiB3aW5kb3cucXVlcmllc1sndHdpbGlnaHQtem9uZSddLFxuICAgICAgICBcImFubm90YXRpb25cIjogd2luZG93LnF1ZXJpZXNbJ2Fubm90YXRpb24nXSxcbiAgICAgICAgXCJmdWxsLW1hcFwiOiB3aW5kb3cucXVlcmllc1snZnVsbC1tYXAnXSxcbiAgICAgICAgXCJsYW5nXCI6IHdpbmRvdy5xdWVyaWVzWydsYW5nJ11cbiAgICAgIH07XG4gICAgfVxuICB9IGNhdGNoKGUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiwgZSk7XG4gIH1cblxuICBpZiAod2luZG93LnF1ZXJpZXNbJ2Z1bGwtbWFwJ10pIHtcbiAgICBpZiAoJCh3aW5kb3cpLndpZHRoKCkgPCA2MDApIHtcbiAgICAgIC8vICQoXCIjZXZlbnRzLWxpc3QtY29udGFpbmVyXCIpLmhpZGUoKTtcbiAgICAgICQoXCJib2R5XCIpLmFkZENsYXNzKFwibWFwLXZpZXdcIik7XG4gICAgICAvLyAkKFwiLmZpbHRlci1hcmVhXCIpLmhpZGUoKTtcbiAgICAgIC8vICQoXCJzZWN0aW9uI21hcFwiKS5jc3MoXCJoZWlnaHRcIiwgXCJjYWxjKDEwMCUgLSA2NHB4KVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJChcImJvZHlcIikuYWRkQ2xhc3MoXCJmaWx0ZXItY29sbGFwc2VkXCIpO1xuICAgICAgLy8gJChcIiNldmVudHMtbGlzdC1jb250YWluZXJcIikuaGlkZSgpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAkKFwiI3Nob3ctaGlkZS1saXN0LWNvbnRhaW5lclwiKS5oaWRlKCk7XG4gIH1cblxuXG4gIGlmICh3aW5kb3cucXVlcmllcy5ncm91cCkge1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5wYXJlbnQoKS5jc3MoXCJvcGFjaXR5XCIsIFwiMFwiKTtcbiAgfVxuICBjb25zdCBidWlsZEZpbHRlcnMgPSAoKSA9PiB7JCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KHtcbiAgICAgIGVuYWJsZUhUTUw6IHRydWUsXG4gICAgICB0ZW1wbGF0ZXM6IHtcbiAgICAgICAgYnV0dG9uOiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJtdWx0aXNlbGVjdCBkcm9wZG93bi10b2dnbGVcIiBkYXRhLXRvZ2dsZT1cImRyb3Bkb3duXCI+PHNwYW4gZGF0YS1sYW5nLXRhcmdldD1cInRleHRcIiBkYXRhLWxhbmcta2V5PVwibW9yZS1zZWFyY2gtb3B0aW9uc1wiPjwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJmYSBmYS1jYXJldC1kb3duXCI+PC9zcGFuPjwvYnV0dG9uPicsXG4gICAgICAgIGxpOiAnPGxpPjxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCI+PGxhYmVsPjwvbGFiZWw+PC9hPjwvbGk+J1xuICAgICAgfSxcbiAgICAgIGRyb3BSaWdodDogdHJ1ZSxcbiAgICAgIG9uSW5pdGlhbGl6ZWQ6ICgpID0+IHtcblxuICAgICAgfSxcbiAgICAgIG9uRHJvcGRvd25TaG93OiAoKSA9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJtb2JpbGUtdXBkYXRlLW1hcC1oZWlnaHRcIik7XG4gICAgICAgIH0sIDEwKTtcblxuICAgICAgfSxcbiAgICAgIG9uRHJvcGRvd25IaWRlOiAoKSA9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJtb2JpbGUtdXBkYXRlLW1hcC1oZWlnaHRcIik7XG4gICAgICAgIH0sIDEwKTtcbiAgICAgIH0sXG4gICAgICBvcHRpb25MYWJlbDogKGUpID0+IHtcbiAgICAgICAgLy8gbGV0IGVsID0gJCggJzxkaXY+PC9kaXY+JyApO1xuICAgICAgICAvLyBlbC5hcHBlbmQoKCkgKyBcIlwiKTtcblxuICAgICAgICByZXR1cm4gdW5lc2NhcGUoJChlKS5hdHRyKCdsYWJlbCcpKSB8fCAkKGUpLmh0bWwoKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH07XG4gIGJ1aWxkRmlsdGVycygpO1xuXG5cbiAgJCgnc2VsZWN0I2xhbmd1YWdlLW9wdHMnKS5tdWx0aXNlbGVjdCh7XG4gICAgZW5hYmxlSFRNTDogdHJ1ZSxcbiAgICBvcHRpb25DbGFzczogKCkgPT4gJ2xhbmctb3B0JyxcbiAgICBzZWxlY3RlZENsYXNzOiAoKSA9PiAnbGFuZy1zZWwnLFxuICAgIGJ1dHRvbkNsYXNzOiAoKSA9PiAnbGFuZy1idXQnLFxuICAgIGRyb3BSaWdodDogdHJ1ZSxcbiAgICBvcHRpb25MYWJlbDogKGUpID0+IHtcbiAgICAgIC8vIGxldCBlbCA9ICQoICc8ZGl2PjwvZGl2PicgKTtcbiAgICAgIC8vIGVsLmFwcGVuZCgoKSArIFwiXCIpO1xuXG4gICAgICByZXR1cm4gdW5lc2NhcGUoJChlKS5hdHRyKCdsYWJlbCcpKSB8fCAkKGUpLmh0bWwoKTtcbiAgICB9LFxuICAgIG9uQ2hhbmdlOiAob3B0aW9uLCBjaGVja2VkLCBzZWxlY3QpID0+IHtcblxuICAgICAgY29uc3QgcGFyYW1ldGVycyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gICAgICBwYXJhbWV0ZXJzWydsYW5nJ10gPSBvcHRpb24udmFsKCk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1yZXNldC1tYXAnLCBwYXJhbWV0ZXJzKTtcblxuICAgIH1cbiAgfSlcblxuICAvLyAxLiBnb29nbGUgbWFwcyBnZW9jb2RlXG5cbiAgLy8gMi4gZm9jdXMgbWFwIG9uIGdlb2NvZGUgKHZpYSBsYXQvbG5nKVxuICBjb25zdCBxdWVyeU1hbmFnZXIgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICAgICAgcXVlcnlNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICBjb25zdCBpbml0UGFyYW1zID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuXG5cbiAgY29uc3QgbGFuZ3VhZ2VNYW5hZ2VyID0gTGFuZ3VhZ2VNYW5hZ2VyKCk7XG5cbiAgY29uc3QgbGlzdE1hbmFnZXIgPSBMaXN0TWFuYWdlcih7XG4gICAgcmVmZXJyZXI6IHdpbmRvdy5xdWVyaWVzLnJlZmVycmVyLFxuICAgIHNvdXJjZTogd2luZG93LnF1ZXJpZXMuc291cmNlXG4gIH0pO1xuXG5cbiAgbWFwTWFuYWdlciA9IE1hcE1hbmFnZXIoe1xuICAgIG9uTW92ZTogKHN3LCBuZSkgPT4ge1xuICAgICAgLy8gV2hlbiB0aGUgbWFwIG1vdmVzIGFyb3VuZCwgd2UgdXBkYXRlIHRoZSBsaXN0XG4gICAgICBxdWVyeU1hbmFnZXIudXBkYXRlVmlld3BvcnRCeUJvdW5kKHN3LCBuZSk7XG4gICAgICAvL3VwZGF0ZSBRdWVyeVxuICAgIH0sXG4gICAgcmVmZXJyZXI6IHdpbmRvdy5xdWVyaWVzLnJlZmVycmVyLFxuICAgIHNvdXJjZTogd2luZG93LnF1ZXJpZXMuc291cmNlXG4gIH0pO1xuXG4gIHdpbmRvdy5pbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2sgPSAoKSA9PiB7XG5cbiAgICBhdXRvY29tcGxldGVNYW5hZ2VyID0gQXV0b2NvbXBsZXRlTWFuYWdlcihcImlucHV0W25hbWU9J2xvYyddXCIpO1xuICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuXG4gICAgaWYgKGluaXRQYXJhbXMubG9jICYmIGluaXRQYXJhbXMubG9jICE9PSAnJyAmJiAoIWluaXRQYXJhbXMuYm91bmQxICYmICFpbml0UGFyYW1zLmJvdW5kMikpIHtcbiAgICAgIG1hcE1hbmFnZXIuaW5pdGlhbGl6ZSgoKSA9PiB7XG4gICAgICAgIG1hcE1hbmFnZXIuZ2V0Q2VudGVyQnlMb2NhdGlvbihpbml0UGFyYW1zLmxvYywgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIHF1ZXJ5TWFuYWdlci51cGRhdGVWaWV3cG9ydChyZXN1bHQuZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgaWYoaW5pdFBhcmFtcy5sYXQgJiYgaW5pdFBhcmFtcy5sbmcpIHtcbiAgICBtYXBNYW5hZ2VyLnNldENlbnRlcihbaW5pdFBhcmFtcy5sYXQsIGluaXRQYXJhbXMubG5nXSk7XG4gIH1cblxuICAvKioqXG4gICogTGlzdCBFdmVudHNcbiAgKiBUaGlzIHdpbGwgdHJpZ2dlciB0aGUgbGlzdCB1cGRhdGUgbWV0aG9kXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCdtb2JpbGUtdXBkYXRlLW1hcC1oZWlnaHQnLCAoZXZlbnQpID0+IHtcbiAgICAvL1RoaXMgY2hlY2tzIGlmIHdpZHRoIGlzIGZvciBtb2JpbGVcbiAgICBpZiAoJCh3aW5kb3cpLndpZHRoKCkgPCA2MDApIHtcbiAgICAgIHNldFRpbWVvdXQoKCk9PiB7XG4gICAgICAgICQoXCIjbWFwXCIpLmhlaWdodCgkKFwiI2V2ZW50cy1saXN0XCIpLmhlaWdodCgpKTtcbiAgICAgICAgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCk7XG4gICAgICB9LCAxMCk7XG4gICAgfVxuICB9KVxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnBvcHVsYXRlTGlzdChvcHRpb25zLnBhcmFtcyk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuXG4gICAgbGlzdE1hbmFnZXIudXBkYXRlRmlsdGVyKG9wdGlvbnMpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlcicsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxldCBib3VuZDEsIGJvdW5kMjtcblxuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICBbYm91bmQxLCBib3VuZDJdID0gbWFwTWFuYWdlci5nZXRCb3VuZHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgICBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcbiAgICB9XG5cbiAgICBsaXN0TWFuYWdlci51cGRhdGVCb3VuZHMoYm91bmQxLCBib3VuZDIsIG9wdGlvbnMuZmlsdGVyKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItcmVzZXQtbWFwJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgdmFyIGNvcHkgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9wdGlvbnMpKTtcbiAgICBkZWxldGUgY29weVsnbG5nJ107XG4gICAgZGVsZXRlIGNvcHlbJ2xhdCddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDEnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQyJ107XG5cbiAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICQucGFyYW0oY29weSk7XG5cblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJ0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZVwiLCBjb3B5KTtcbiAgICAkKFwic2VsZWN0I2ZpbHRlci1pdGVtc1wiKS5tdWx0aXNlbGVjdCgnZGVzdHJveScpO1xuICAgIGJ1aWxkRmlsdGVycygpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbG9hZC1ncm91cHMnLCB7IGdyb3Vwczogd2luZG93LkVWRU5UU19EQVRBLmdyb3VwcyB9KTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcblxuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcihcInRyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlXCIsIGNvcHkpO1xuICAgIH0sIDEwMDApO1xuICB9KTtcblxuXG4gIC8qKipcbiAgKiBNYXAgRXZlbnRzXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICAvLyBtYXBNYW5hZ2VyLnNldENlbnRlcihbb3B0aW9ucy5sYXQsIG9wdGlvbnMubG5nXSk7XG4gICAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLmJvdW5kMSB8fCAhb3B0aW9ucy5ib3VuZDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgdmFyIGJvdW5kMiA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDIpO1xuXG4gICAgbWFwTWFuYWdlci5zZXRCb3VuZHMoYm91bmQxLCBib3VuZDIpO1xuICAgIC8vIG1hcE1hbmFnZXIudHJpZ2dlclpvb21FbmQoKTtcblxuICAgIC8vIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIC8vICAgbWFwTWFuYWdlci50cmlnZ2VyWm9vbUVuZCgpO1xuICAgIC8vIH0sIDEwKTtcblxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCBcIiNjb3B5LWVtYmVkXCIsIChlKSA9PiB7XG4gICAgdmFyIGNvcHlUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbWJlZC10ZXh0XCIpO1xuICAgIGNvcHlUZXh0LnNlbGVjdCgpO1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiQ29weVwiKTtcbiAgfSk7XG5cbiAgLy8gMy4gbWFya2VycyBvbiBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXBsb3QnLCAoZSwgb3B0KSA9PiB7XG5cbiAgICBtYXBNYW5hZ2VyLnBsb3RQb2ludHMob3B0LmRhdGEsIG9wdC5wYXJhbXMsIG9wdC5ncm91cHMpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicpO1xuICB9KVxuXG4gIC8vIGxvYWQgZ3JvdXBzXG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbG9hZC1ncm91cHMnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLmVtcHR5KCk7XG4gICAgb3B0Lmdyb3Vwcy5mb3JFYWNoKChpdGVtKSA9PiB7XG5cbiAgICAgIGxldCBzbHVnZ2VkID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICAgIGxldCB2YWx1ZVRleHQgPSBsYW5ndWFnZU1hbmFnZXIuZ2V0VHJhbnNsYXRpb24oaXRlbS50cmFuc2xhdGlvbik7XG4gICAgICAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykuYXBwZW5kKGBcbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9JyR7c2x1Z2dlZH0nXG4gICAgICAgICAgICAgIHNlbGVjdGVkPSdzZWxlY3RlZCdcbiAgICAgICAgICAgICAgbGFiZWw9XCI8c3BhbiBkYXRhLWxhbmctdGFyZ2V0PSd0ZXh0JyBkYXRhLWxhbmcta2V5PScke2l0ZW0udHJhbnNsYXRpb259Jz4ke3ZhbHVlVGV4dH08L3NwYW4+PGltZyBzcmM9JyR7aXRlbS5pY29udXJsIHx8IHdpbmRvdy5ERUZBVUxUX0lDT059JyAvPlwiPlxuICAgICAgICAgICAgPC9vcHRpb24+YClcbiAgICB9KTtcblxuICAgIC8vIFJlLWluaXRpYWxpemVcbiAgICBxdWVyeU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuICAgIC8vICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5tdWx0aXNlbGVjdCgnZGVzdHJveScpO1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5tdWx0aXNlbGVjdCgncmVidWlsZCcpO1xuXG4gICAgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCk7XG5cblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJyk7XG5cbiAgfSlcblxuICAvLyBGaWx0ZXIgbWFwXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCAoZSwgb3B0KSA9PiB7XG4gICAgaWYgKG9wdCkge1xuICAgICAgbWFwTWFuYWdlci5maWx0ZXJNYXAob3B0LmZpbHRlcik7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sYW5ndWFnZS11cGRhdGUnLCAoZSwgb3B0KSA9PiB7XG5cbiAgICBpZiAod2luZG93LnF1ZXJpZXMubGFuZykge1xuICAgICAgbGFuZ3VhZ2VNYW5hZ2VyLnVwZGF0ZUxhbmd1YWdlKHdpbmRvdy5xdWVyaWVzLmxhbmcpO1xuICAgIH0gZWxzZSBpZiAob3B0KSB7XG4gICAgICBsYW5ndWFnZU1hbmFnZXIudXBkYXRlTGFuZ3VhZ2Uob3B0LmxhbmcpO1xuICAgIH0gZWxzZSB7XG5cbiAgICAgIGxhbmd1YWdlTWFuYWdlci5yZWZyZXNoKCk7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sYW5ndWFnZS1sb2FkZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KCdyZWJ1aWxkJyk7XG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbiNzaG93LWhpZGUtbWFwJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ2JvZHknKS50b2dnbGVDbGFzcygnbWFwLXZpZXcnKVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uLmJ0bi5tb3JlLWl0ZW1zJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJyNlbWJlZC1hcmVhJykudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgLy91cGRhdGUgZW1iZWQgbGluZVxuICAgIHZhciBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHQpKTtcbiAgICBkZWxldGUgY29weVsnbG5nJ107XG4gICAgZGVsZXRlIGNvcHlbJ2xhdCddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDEnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQyJ107XG5cbiAgICAkKCcjZW1iZWQtYXJlYSBpbnB1dFtuYW1lPWVtYmVkXScpLnZhbCgnaHR0cHM6Ly9uZXctbWFwLjM1MC5vcmcjJyArICQucGFyYW0oY29weSkpO1xuICB9KTtcblxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24jem9vbS1vdXQnLCAoZSwgb3B0KSA9PiB7XG5cbiAgICAvLyBtYXBNYW5hZ2VyLnpvb21PdXRPbmNlKCk7XG4gICAgbWFwTWFuYWdlci56b29tVW50aWxIaXQoKTtcbiAgfSk7XG5cblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnI3Nob3ctaGlkZS1saXN0LWNvbnRhaW5lcicsIChlLCBvcHQpID0+IHtcbiAgICAkKCdib2R5JykudG9nZ2xlQ2xhc3MoJ2ZpbHRlci1jb2xsYXBzZWQnKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHsgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCkgfSwgNjAwKVxuICB9KTtcblxuICAkKHdpbmRvdykub24oXCJyZXNpemVcIiwgKGUpID0+IHtcbiAgICBtYXBNYW5hZ2VyLnJlZnJlc2hNYXAoKTtcbiAgfSk7XG5cbiAgLyoqXG4gIEZpbHRlciBDaGFuZ2VzXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgXCIuc2VhcmNoLWJ1dHRvbiBidXR0b25cIiwgKGUpID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcihcInNlYXJjaC5mb3JjZS1zZWFyY2gtbG9jYXRpb25cIik7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbihcImtleXVwXCIsIFwiaW5wdXRbbmFtZT0nbG9jJ11cIiwgKGUpID0+IHtcbiAgICBpZiAoZS5rZXlDb2RlID09IDEzKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCdzZWFyY2guZm9yY2Utc2VhcmNoLWxvY2F0aW9uJyk7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignc2VhcmNoLmZvcmNlLXNlYXJjaC1sb2NhdGlvbicsICgpID0+IHtcbiAgICBsZXQgX3F1ZXJ5ID0gJChcImlucHV0W25hbWU9J2xvYyddXCIpLnZhbCgpO1xuICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuZm9yY2VTZWFyY2goX3F1ZXJ5KTtcbiAgICAvLyBTZWFyY2ggZ29vZ2xlIGFuZCBnZXQgdGhlIGZpcnN0IHJlc3VsdC4uLiBhdXRvY29tcGxldGU/XG4gIH0pO1xuXG4gICQod2luZG93KS5vbihcImhhc2hjaGFuZ2VcIiwgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgIGlmIChoYXNoLmxlbmd0aCA9PSAwKSByZXR1cm47XG4gICAgY29uc3QgcGFyYW1ldGVycyA9ICQuZGVwYXJhbShoYXNoLnN1YnN0cmluZygxKSk7XG4gICAgY29uc3Qgb2xkVVJMID0gZXZlbnQub3JpZ2luYWxFdmVudC5vbGRVUkw7XG4gICAgY29uc3Qgb2xkSGFzaCA9ICQuZGVwYXJhbShvbGRVUkwuc3Vic3RyaW5nKG9sZFVSTC5zZWFyY2goXCIjXCIpKzEpKTtcblxuICAgIC8vICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXInLCBwYXJhbWV0ZXJzKTtcbiAgICAvLyAvLyBTbyB0aGF0IGNoYW5nZSBpbiBmaWx0ZXJzIHdpbGwgbm90IHVwZGF0ZSB0aGlzXG4gICAgLy8gaWYgKG9sZEhhc2guYm91bmQxICE9PSBwYXJhbWV0ZXJzLmJvdW5kMSB8fCBvbGRIYXNoLmJvdW5kMiAhPT0gcGFyYW1ldGVycy5ib3VuZDIpIHtcbiAgICAvLyAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXInLCBwYXJhbWV0ZXJzKTtcbiAgICAvLyB9XG5cbiAgICBpZiAob2xkSGFzaC5sb2MgIT09IHBhcmFtZXRlcnMubG9jKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG5cbiAgICAvLyBDaGFuZ2UgaXRlbXNcbiAgICBpZiAob2xkSGFzaC5sYW5nICE9PSBwYXJhbWV0ZXJzLmxhbmcpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgfVxuICB9KVxuXG4gIC8vIDQuIGZpbHRlciBvdXQgaXRlbXMgaW4gYWN0aXZpdHktYXJlYVxuXG4gIC8vIDUuIGdldCBtYXAgZWxlbWVudHNcblxuICAvLyA2LiBnZXQgR3JvdXAgZGF0YVxuXG4gIC8vIDcuIHByZXNlbnQgZ3JvdXAgZWxlbWVudHNcblxuICAkLndoZW4oKCk9Pnt9KVxuICAgIC50aGVuKCgpID0+e1xuICAgICAgcmV0dXJuIGxhbmd1YWdlTWFuYWdlci5pbml0aWFsaXplKGluaXRQYXJhbXNbJ2xhbmcnXSB8fCAnZW4nKTtcbiAgICB9KVxuICAgIC5kb25lKChkYXRhKSA9PiB7fSlcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICAkLmFqYXgoe1xuICAgICAgICAgIHVybDogJ2h0dHBzOi8vbmV3LW1hcC4zNTAub3JnL291dHB1dC8zNTBvcmctd2l0aC1hbm5vdGF0aW9uLmpzLmd6JywgLy8nfCoqREFUQV9TT1VSQ0UqKnwnLFxuICAgICAgICAgIC8vIHVybDogJy9kYXRhL3Rlc3QuanMnLCAvLyd8KipEQVRBX1NPVVJDRSoqfCcsXG4gICAgICAgICAgZGF0YVR5cGU6ICdzY3JpcHQnLFxuICAgICAgICAgIGNhY2hlOiB0cnVlLFxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICAvLyB3aW5kb3cuRVZFTlRTX0RBVEEgPSBkYXRhO1xuICAgICAgICAgICAgLy9KdW5lIDE0LCAyMDE4IOKAkyBDaGFuZ2VzXG4gICAgICAgICAgICBpZih3aW5kb3cucXVlcmllcy5ncm91cCkge1xuICAgICAgICAgICAgICB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YSA9IHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhLmZpbHRlcigoaSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBpLmNhbXBhaWduID09IHdpbmRvdy5xdWVyaWVzLmdyb3VwXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL0xvYWQgZ3JvdXBzXG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxvYWQtZ3JvdXBzJywgeyBncm91cHM6IHdpbmRvdy5FVkVOVFNfREFUQS5ncm91cHMgfSk7XG5cblxuICAgICAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuXG4gICAgICAgICAgICB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgIGl0ZW1bJ2V2ZW50X3R5cGUnXSA9IGl0ZW0uZXZlbnRfdHlwZSAhPT0gJ2dyb3VwJyA/ICdldmVudHMnIDogaXRlbS5ldmVudF90eXBlOyAvLyFpdGVtLmV2ZW50X3R5cGUgPyAnRXZlbnQnIDogaXRlbS5ldmVudF90eXBlO1xuXG4gICAgICAgICAgICAgIGlmIChpdGVtLnN0YXJ0X2RhdGV0aW1lICYmICFpdGVtLnN0YXJ0X2RhdGV0aW1lLm1hdGNoKC9aJC8pKSB7XG4gICAgICAgICAgICAgICAgaXRlbS5zdGFydF9kYXRldGltZSA9IGl0ZW0uc3RhcnRfZGF0ZXRpbWUgKyBcIlpcIjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgIC8vICAgcmV0dXJuIG5ldyBEYXRlKGEuc3RhcnRfZGF0ZXRpbWUpIC0gbmV3IERhdGUoYi5zdGFydF9kYXRldGltZSk7XG4gICAgICAgICAgICAvLyB9KVxuXG5cbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC11cGRhdGUnLCB7IHBhcmFtczogcGFyYW1ldGVycyB9KTtcbiAgICAgICAgICAgIC8vICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1wbG90Jywge1xuICAgICAgICAgICAgICAgIGRhdGE6IHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhLFxuICAgICAgICAgICAgICAgIHBhcmFtczogcGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgICBncm91cHM6IHdpbmRvdy5FVkVOVFNfREFUQS5ncm91cHMucmVkdWNlKChkaWN0LCBpdGVtKT0+eyBkaWN0W2l0ZW0uc3VwZXJncm91cF0gPSBpdGVtOyByZXR1cm4gZGljdDsgfSwge30pXG4gICAgICAgICAgICB9KTtcbiAgICAgIC8vIH0pO1xuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgIC8vVE9ETzogTWFrZSB0aGUgZ2VvanNvbiBjb252ZXJzaW9uIGhhcHBlbiBvbiB0aGUgYmFja2VuZFxuXG4gICAgICAgICAgICAvL1JlZnJlc2ggdGhpbmdzXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgbGV0IHAgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuXG4gICAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHApO1xuICAgICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCBwKTtcblxuICAgICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyJywgcCk7XG5cbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG5cblxufSkoalF1ZXJ5KTtcbiJdfQ==
