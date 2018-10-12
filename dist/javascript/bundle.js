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

window.map = null;

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
    // var map = L.map('map-proper', { dragging: !L.Browser.mobile }).setView([34.88593094075317, 5.097656250000001], 2);


    mapboxgl.accessToken = 'pk.eyJ1IjoibWF0dGhldzM1MCIsImEiOiJaTVFMUkUwIn0.wcM3Xc8BGC6PM-Oyrwjnhg';
    var map;
    window.map = map = new mapboxgl.Map({
      container: 'map-proper',
      style: 'mapbox://styles/matthew350/cja41tijk27d62rqod7g0lx4b',
      doubleClickZoom: false,
      center: [33.09813404798261, 2.7394043304813067],
      zoom: 1.2
      // scrollZoom: false
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
    var main_groups = null;
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
        // if (!filters) return;
        for (var i in main_groups) {
          var group = main_groups[i];
          var slug = window.slugify(i);
          try {
            if (map.getLayer(slug) === undefined) {
              continue;
            }

            if (filters && filters.includes(slug)) {
              map.setLayoutProperty(slug, 'visibility', 'visible');
            } else {
              map.setLayoutProperty(slug, 'visibility', 'none');
            }
          } catch (e) {
            console.log(e);
          }
        }
      },
      plotPoints: function plotPoints(list, hardFilters, groups) {
        main_groups = groups;
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
            var isVisible = hardFilters && hardFilters.filters ? hardFilters.filters.includes("events") : true;
            map.addLayer({
              "id": "events",
              "type": "circle",
              "source": {
                "type": "geojson",
                "data": geojson
              },
              'layout': {
                'visibility': isVisible ? 'visible' : 'none'
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
            var slug = window.slugify(i);
            var _isVisible = hardFilters && hardFilters.filters ? hardFilters.filters.includes(slug) : true;
            map.loadImage(icon, function (error, groupIcon) {
              map.addImage(window.slugify(i) + '-icon', groupIcon);
              map.addLayer({
                "id": slug,
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
                  'visibility': _isVisible ? 'visible' : 'none',
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
          var target_group = decodeURIComponent(window.queries.group);
          console.log(target_group);
          window.EVENTS_DATA.data = window.EVENTS_DATA.data.filter(function (i) {
            return i.campaign == target_group || i.supergroup == target_group;
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9oZWxwZXIuanMiLCJjbGFzc2VzL2xhbmd1YWdlLmpzIiwiY2xhc3Nlcy9saXN0LmpzIiwiY2xhc3Nlcy9tYXAuanMiLCJjbGFzc2VzL3F1ZXJ5LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIkF1dG9jb21wbGV0ZU1hbmFnZXIiLCIkIiwidGFyZ2V0IiwiQVBJX0tFWSIsInRhcmdldEl0ZW0iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJxdWVyeU1nciIsIlF1ZXJ5TWFuYWdlciIsImdlb2NvZGVyIiwiZ29vZ2xlIiwibWFwcyIsIkdlb2NvZGVyIiwiJHRhcmdldCIsImZvcmNlU2VhcmNoIiwicSIsImdlb2NvZGUiLCJhZGRyZXNzIiwicmVzdWx0cyIsInN0YXR1cyIsImdlb21ldHJ5IiwidXBkYXRlVmlld3BvcnQiLCJ2aWV3cG9ydCIsInZhbCIsImZvcm1hdHRlZF9hZGRyZXNzIiwiaW5pdGlhbGl6ZSIsInR5cGVhaGVhZCIsImhpbnQiLCJoaWdobGlnaHQiLCJtaW5MZW5ndGgiLCJjbGFzc05hbWVzIiwibWVudSIsIm5hbWUiLCJkaXNwbGF5IiwiaXRlbSIsImxpbWl0Iiwic291cmNlIiwic3luYyIsImFzeW5jIiwib24iLCJvYmoiLCJkYXR1bSIsImpRdWVyeSIsIkhlbHBlciIsInJlZlNvdXJjZSIsInVybCIsInJlZiIsInNyYyIsImluZGV4T2YiLCJMYW5ndWFnZU1hbmFnZXIiLCJsYW5ndWFnZSIsImRpY3Rpb25hcnkiLCIkdGFyZ2V0cyIsInVwZGF0ZVBhZ2VMYW5ndWFnZSIsInRhcmdldExhbmd1YWdlIiwicm93cyIsImZpbHRlciIsImkiLCJsYW5nIiwiZWFjaCIsImluZGV4IiwidGFyZ2V0QXR0cmlidXRlIiwiZGF0YSIsImxhbmdUYXJnZXQiLCJ0ZXh0IiwiYXR0ciIsInRhcmdldHMiLCJhamF4IiwiZGF0YVR5cGUiLCJzdWNjZXNzIiwidHJpZ2dlciIsIm11bHRpc2VsZWN0IiwicmVmcmVzaCIsInVwZGF0ZUxhbmd1YWdlIiwiZ2V0VHJhbnNsYXRpb24iLCJrZXkiLCJMaXN0TWFuYWdlciIsIm9wdGlvbnMiLCJ0YXJnZXRMaXN0IiwicmVmZXJyZXIiLCJkM1RhcmdldCIsImQzIiwic2VsZWN0IiwicmVuZGVyRXZlbnQiLCJtIiwibW9tZW50IiwiRGF0ZSIsInN0YXJ0X2RhdGV0aW1lIiwidXRjIiwic3VidHJhY3QiLCJ1dGNPZmZzZXQiLCJkYXRlIiwiZm9ybWF0IiwibWF0Y2giLCJldmVudF90eXBlIiwidGl0bGUiLCJ2ZW51ZSIsInJlbmRlckdyb3VwIiwid2Vic2l0ZSIsInN1cGVyR3JvdXAiLCJ3aW5kb3ciLCJzbHVnaWZ5Iiwic3VwZXJncm91cCIsImxvY2F0aW9uIiwiZGVzY3JpcHRpb24iLCIkbGlzdCIsInVwZGF0ZUZpbHRlciIsInAiLCJyZW1vdmVQcm9wIiwiYWRkQ2xhc3MiLCJqb2luIiwiZm9yRWFjaCIsImZpbCIsImZpbmQiLCJzaG93IiwidXBkYXRlQm91bmRzIiwiYm91bmQxIiwiYm91bmQyIiwiZmlsdGVycyIsIkVWRU5UU19EQVRBIiwidHlwZSIsInRvTG93ZXJDYXNlIiwibGVuZ3RoIiwiaW5jbHVkZXMiLCJsYXQiLCJsbmciLCJsaXN0Q29udGFpbmVyIiwic2VsZWN0QWxsIiwicmVtb3ZlIiwiZW50ZXIiLCJhcHBlbmQiLCJodG1sIiwicmVtb3ZlQ2xhc3MiLCJwb3B1bGF0ZUxpc3QiLCJoYXJkRmlsdGVycyIsImtleVNldCIsInNwbGl0IiwibWFwIiwiTWFwTWFuYWdlciIsIkxBTkdVQUdFIiwicG9wdXAiLCJtYXBib3hnbCIsIlBvcHVwIiwiY2xvc2VPbkNsaWNrIiwicmVuZGVyQW5ub3RhdGlvblBvcHVwIiwicmVuZGVyQW5ub3RhdGlvbnNHZW9Kc29uIiwibGlzdCIsInJlbmRlcmVkIiwiY29vcmRpbmF0ZXMiLCJwcm9wZXJ0aWVzIiwiYW5ub3RhdGlvblByb3BzIiwicG9wdXBDb250ZW50IiwicmVuZGVyR2VvanNvbiIsImlzTmFOIiwicGFyc2VGbG9hdCIsInN1YnN0cmluZyIsImV2ZW50UHJvcGVydGllcyIsImdldEV2ZW50R2VvanNvbiIsInNvcnQiLCJ4IiwieSIsImRlc2NlbmRpbmciLCJnZXRHcm91cEdlb2pzb24iLCJhY2Nlc3NUb2tlbiIsIk1hcCIsImNvbnRhaW5lciIsInN0eWxlIiwiZG91YmxlQ2xpY2tab29tIiwiY2VudGVyIiwiem9vbSIsIm9uTW92ZSIsImV2ZW50IiwiYm5kIiwiZ2V0Qm91bmRzIiwic3ciLCJfc3ciLCJuZSIsIl9uZSIsImdldFpvb20iLCJxdWVyaWVzIiwiTCIsInRlcm1pbmF0b3IiLCJhZGRUbyIsIm1haW5fZ3JvdXBzIiwiJG1hcCIsImNhbGxiYWNrIiwic2V0Qm91bmRzIiwiYm91bmRzMSIsImJvdW5kczIiLCJib3VuZHMiLCJyZXZlcnNlIiwiZml0Qm91bmRzIiwiYW5pbWF0ZSIsInNldENlbnRlciIsInNldFZpZXciLCJnZXRDZW50ZXJCeUxvY2F0aW9uIiwidHJpZ2dlclpvb21FbmQiLCJ6b29tT3V0T25jZSIsInpvb21PdXQiLCJ6b29tVW50aWxIaXQiLCIkdGhpcyIsImludGVydmFsSGFuZGxlciIsInNldEludGVydmFsIiwiX3Zpc2libGUiLCJjbGVhckludGVydmFsIiwicmVmcmVzaE1hcCIsImZpbHRlck1hcCIsImhpZGUiLCJncm91cCIsInNsdWciLCJnZXRMYXllciIsInVuZGVmaW5lZCIsInNldExheW91dFByb3BlcnR5IiwiZSIsImNvbnNvbGUiLCJsb2ciLCJwbG90UG9pbnRzIiwiZ3JvdXBzIiwiZ2VvanNvbiIsImlzVmlzaWJsZSIsImFkZExheWVyIiwiaWNvbiIsImxvYWRJbWFnZSIsImVycm9yIiwiZ3JvdXBJY29uIiwiYWRkSW1hZ2UiLCJmZWF0dXJlcyIsInNsaWNlIiwic2V0TG5nTGF0Iiwic2V0SFRNTCIsIl9vbGRQbG90UG9pbnRzIiwiZXZlbnRzTGF5ZXIiLCJnZW9KU09OIiwicG9pbnRUb0xheWVyIiwiZmVhdHVyZSIsImxhdGxuZyIsImV2ZW50VHlwZSIsInNsdWdnZWQiLCJpY29uVXJsIiwiaXNQYXN0IiwiaWNvbnVybCIsInNtYWxsSWNvbiIsImljb25TaXplIiwiaWNvbkFuY2hvciIsImNsYXNzTmFtZSIsImdlb2pzb25NYXJrZXJPcHRpb25zIiwibWFya2VyIiwib25FYWNoRmVhdHVyZSIsImxheWVyIiwiYmluZFBvcHVwIiwiYW5ub3RhdGlvbiIsImFubm90YXRpb25zIiwiYW5ub3RJY29uIiwiYW5ub3RNYXJrZXJzIiwiYW5ub3RMYXllckdyb3VwIiwiZmVhdHVyZUdyb3VwIiwidXBkYXRlIiwibGF0TG5nIiwidGFyZ2V0Rm9ybSIsInByZXZpb3VzIiwicHJldmVudERlZmF1bHQiLCJmb3JtIiwiZGVwYXJhbSIsInNlcmlhbGl6ZSIsImhhc2giLCJwYXJhbSIsInBhcmFtcyIsImxvYyIsInByb3AiLCJnZXRQYXJhbWV0ZXJzIiwicGFyYW1ldGVycyIsInVwZGF0ZUxvY2F0aW9uIiwiTWF0aCIsImFicyIsImYiLCJiIiwiZkF2ZyIsImJBdmciLCJKU09OIiwic3RyaW5naWZ5IiwidXBkYXRlVmlld3BvcnRCeUJvdW5kIiwidHJpZ2dlclN1Ym1pdCIsImF1dG9jb21wbGV0ZU1hbmFnZXIiLCJtYXBNYW5hZ2VyIiwiREVGQVVMVF9JQ09OIiwidG9TdHJpbmciLCJyZXBsYWNlIiwiZ2V0UXVlcnlTdHJpbmciLCJxdWVyeVN0cmluZ0tleVZhbHVlIiwicGFyZW50Iiwic2VhcmNoIiwicXNKc29uT2JqZWN0Iiwid2lkdGgiLCJjc3MiLCJidWlsZEZpbHRlcnMiLCJlbmFibGVIVE1MIiwidGVtcGxhdGVzIiwiYnV0dG9uIiwibGkiLCJkcm9wUmlnaHQiLCJvbkluaXRpYWxpemVkIiwib25Ecm9wZG93blNob3ciLCJzZXRUaW1lb3V0Iiwib25Ecm9wZG93bkhpZGUiLCJvcHRpb25MYWJlbCIsInVuZXNjYXBlIiwib3B0aW9uQ2xhc3MiLCJzZWxlY3RlZENsYXNzIiwiYnV0dG9uQ2xhc3MiLCJvbkNoYW5nZSIsIm9wdGlvbiIsImNoZWNrZWQiLCJxdWVyeU1hbmFnZXIiLCJpbml0UGFyYW1zIiwibGFuZ3VhZ2VNYW5hZ2VyIiwibGlzdE1hbmFnZXIiLCJpbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2siLCJyZXN1bHQiLCJoZWlnaHQiLCJwYXJzZSIsImNvcHkiLCJjb3B5VGV4dCIsImdldEVsZW1lbnRCeUlkIiwiZXhlY0NvbW1hbmQiLCJvcHQiLCJlbXB0eSIsInZhbHVlVGV4dCIsInRyYW5zbGF0aW9uIiwidG9nZ2xlQ2xhc3MiLCJrZXlDb2RlIiwiX3F1ZXJ5Iiwib2xkVVJMIiwib3JpZ2luYWxFdmVudCIsIm9sZEhhc2giLCJ3aGVuIiwidGhlbiIsImRvbmUiLCJjYWNoZSIsInRhcmdldF9ncm91cCIsImRlY29kZVVSSUNvbXBvbmVudCIsImNhbXBhaWduIiwicmVkdWNlIiwiZGljdCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7QUFDQSxJQUFNQSxzQkFBdUIsVUFBU0MsQ0FBVCxFQUFZO0FBQ3ZDOztBQUVBLFNBQU8sVUFBQ0MsTUFBRCxFQUFZOztBQUVqQixRQUFNQyxVQUFVLHlDQUFoQjtBQUNBLFFBQU1DLGFBQWEsT0FBT0YsTUFBUCxJQUFpQixRQUFqQixHQUE0QkcsU0FBU0MsYUFBVCxDQUF1QkosTUFBdkIsQ0FBNUIsR0FBNkRBLE1BQWhGO0FBQ0EsUUFBTUssV0FBV0MsY0FBakI7QUFDQSxRQUFJQyxXQUFXLElBQUlDLE9BQU9DLElBQVAsQ0FBWUMsUUFBaEIsRUFBZjs7QUFFQSxXQUFPO0FBQ0xDLGVBQVNaLEVBQUVHLFVBQUYsQ0FESjtBQUVMRixjQUFRRSxVQUZIO0FBR0xVLG1CQUFhLHFCQUFDQyxDQUFELEVBQU87QUFDbEJOLGlCQUFTTyxPQUFULENBQWlCLEVBQUVDLFNBQVNGLENBQVgsRUFBakIsRUFBaUMsVUFBVUcsT0FBVixFQUFtQkMsTUFBbkIsRUFBMkI7QUFDMUQsY0FBSUQsUUFBUSxDQUFSLENBQUosRUFBZ0I7QUFDZCxnQkFBSUUsV0FBV0YsUUFBUSxDQUFSLEVBQVdFLFFBQTFCO0FBQ0FiLHFCQUFTYyxjQUFULENBQXdCRCxT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LFlBQUVJLFFBQUYsRUFBWWlFLE9BQVosQ0FBb0Isb0JBQXBCLEVBQTBDcUMsQ0FBMUM7O0FBRUExRyxZQUFFSSxRQUFGLEVBQVlpRSxPQUFaLENBQW9CLHFCQUFwQixFQUEyQ3FDLENBQTNDO0FBRUQsU0FSRCxFQVFHLEdBUkg7QUFTRDtBQXpERSxLQUFQO0FBMkRDLEdBakVMO0FBcUVELENBdmJELEVBdWJHakUsTUF2YkgiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vL0FQSSA6QUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXG5jb25zdCBBdXRvY29tcGxldGVNYW5hZ2VyID0gKGZ1bmN0aW9uKCQpIHtcbiAgLy9Jbml0aWFsaXphdGlvbi4uLlxuXG4gIHJldHVybiAodGFyZ2V0KSA9PiB7XG5cbiAgICBjb25zdCBBUElfS0VZID0gXCJBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cIjtcbiAgICBjb25zdCB0YXJnZXRJdGVtID0gdHlwZW9mIHRhcmdldCA9PSBcInN0cmluZ1wiID8gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpIDogdGFyZ2V0O1xuICAgIGNvbnN0IHF1ZXJ5TWdyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgdmFyIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgJHRhcmdldDogJCh0YXJnZXRJdGVtKSxcbiAgICAgIHRhcmdldDogdGFyZ2V0SXRlbSxcbiAgICAgIGZvcmNlU2VhcmNoOiAocSkgPT4ge1xuICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogcSB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG4gICAgICAgICAgaWYgKHJlc3VsdHNbMF0pIHtcbiAgICAgICAgICAgIGxldCBnZW9tZXRyeSA9IHJlc3VsdHNbMF0uZ2VvbWV0cnk7XG4gICAgICAgICAgICBxdWVyeU1nci51cGRhdGVWaWV3cG9ydChnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAkKHRhcmdldEl0ZW0pLnZhbChyZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gdmFyIGdlb21ldHJ5ID0gZGF0dW0uZ2VvbWV0cnk7XG4gICAgICAgICAgLy8gcXVlcnlNZ3IudXBkYXRlVmlld3BvcnQoZ2VvbWV0cnkudmlld3BvcnQpO1xuXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGluaXRpYWxpemU6ICgpID0+IHtcbiAgICAgICAgJCh0YXJnZXRJdGVtKS50eXBlYWhlYWQoe1xuICAgICAgICAgICAgICAgICAgICBoaW50OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1pbkxlbmd0aDogNCxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICAgIG1lbnU6ICd0dC1kcm9wZG93bi1tZW51J1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnc2VhcmNoLXJlc3VsdHMnLFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAoaXRlbSkgPT4gaXRlbS5mb3JtYXR0ZWRfYWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgbGltaXQ6IDEwLFxuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IGZ1bmN0aW9uIChxLCBzeW5jLCBhc3luYyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogcSB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFzeW5jKHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApLm9uKCd0eXBlYWhlYWQ6c2VsZWN0ZWQnLCBmdW5jdGlvbiAob2JqLCBkYXR1bSkge1xuICAgICAgICAgICAgICAgICAgICBpZihkYXR1bSlcbiAgICAgICAgICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgICAgICAgdmFyIGdlb21ldHJ5ID0gZGF0dW0uZ2VvbWV0cnk7XG4gICAgICAgICAgICAgICAgICAgICAgcXVlcnlNZ3IudXBkYXRlVmlld3BvcnQoZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgICAgIC8vICBtYXAuZml0Qm91bmRzKGdlb21ldHJ5LmJvdW5kcz8gZ2VvbWV0cnkuYm91bmRzIDogZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG5cblxuICAgIHJldHVybiB7XG5cbiAgICB9XG4gIH1cblxufShqUXVlcnkpKTtcbiIsImNvbnN0IEhlbHBlciA9ICgoJCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICByZWZTb3VyY2U6ICh1cmwsIHJlZiwgc3JjKSA9PiB7XG4gICAgICAgIC8vIEp1biAxMyAyMDE4IOKAlCBGaXggZm9yIHNvdXJjZSBhbmQgcmVmZXJyZXJcbiAgICAgICAgaWYgKHJlZiB8fCBzcmMpIHtcbiAgICAgICAgICBpZiAodXJsLmluZGV4T2YoXCI/XCIpID49IDApIHtcbiAgICAgICAgICAgIHVybCA9IGAke3VybH0mcmVmZXJyZXI9JHtyZWZ8fFwiXCJ9JnNvdXJjZT0ke3NyY3x8XCJcIn1gO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1cmwgPSBgJHt1cmx9P3JlZmVycmVyPSR7cmVmfHxcIlwifSZzb3VyY2U9JHtzcmN8fFwiXCJ9YDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdXJsO1xuICAgICAgfVxuICAgIH07XG59KShqUXVlcnkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBMYW5ndWFnZU1hbmFnZXIgPSAoKCQpID0+IHtcbiAgLy9rZXlWYWx1ZVxuXG4gIC8vdGFyZ2V0cyBhcmUgdGhlIG1hcHBpbmdzIGZvciB0aGUgbGFuZ3VhZ2VcbiAgcmV0dXJuICgpID0+IHtcbiAgICBsZXQgbGFuZ3VhZ2U7XG4gICAgbGV0IGRpY3Rpb25hcnkgPSB7fTtcbiAgICBsZXQgJHRhcmdldHMgPSAkKFwiW2RhdGEtbGFuZy10YXJnZXRdW2RhdGEtbGFuZy1rZXldXCIpO1xuXG4gICAgY29uc3QgdXBkYXRlUGFnZUxhbmd1YWdlID0gKCkgPT4ge1xuXG4gICAgICBsZXQgdGFyZ2V0TGFuZ3VhZ2UgPSBkaWN0aW9uYXJ5LnJvd3MuZmlsdGVyKChpKSA9PiBpLmxhbmcgPT09IGxhbmd1YWdlKVswXTtcblxuICAgICAgJHRhcmdldHMuZWFjaCgoaW5kZXgsIGl0ZW0pID0+IHtcblxuICAgICAgICBsZXQgdGFyZ2V0QXR0cmlidXRlID0gJChpdGVtKS5kYXRhKCdsYW5nLXRhcmdldCcpO1xuICAgICAgICBsZXQgbGFuZ1RhcmdldCA9ICQoaXRlbSkuZGF0YSgnbGFuZy1rZXknKTtcblxuXG5cblxuICAgICAgICBzd2l0Y2godGFyZ2V0QXR0cmlidXRlKSB7XG4gICAgICAgICAgY2FzZSAndGV4dCc6XG5cbiAgICAgICAgICAgICQoKGBbZGF0YS1sYW5nLWtleT1cIiR7bGFuZ1RhcmdldH1cIl1gKSkudGV4dCh0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBpZiAobGFuZ1RhcmdldCA9PSBcIm1vcmUtc2VhcmNoLW9wdGlvbnNcIikge1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd2YWx1ZSc6XG4gICAgICAgICAgICAkKGl0ZW0pLnZhbCh0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgJChpdGVtKS5hdHRyKHRhcmdldEF0dHJpYnV0ZSwgdGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICBsYW5ndWFnZSxcbiAgICAgIHRhcmdldHM6ICR0YXJnZXRzLFxuICAgICAgZGljdGlvbmFyeSxcbiAgICAgIGluaXRpYWxpemU6IChsYW5nKSA9PiB7XG5cbiAgICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgICAgLy8gdXJsOiAnaHR0cHM6Ly9nc3gyanNvbi5jb20vYXBpP2lkPTFPM2VCeWpMMXZsWWY3WjdhbS1faHRSVFFpNzNQYWZxSWZOQmRMbVhlOFNNJnNoZWV0PTEnLFxuICAgICAgICAgIHVybDogJy9kYXRhL2xhbmcuanNvbicsXG4gICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgZGljdGlvbmFyeSA9IGRhdGE7XG4gICAgICAgICAgICBsYW5ndWFnZSA9IGxhbmc7XG4gICAgICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UoKTtcblxuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sYW5ndWFnZS1sb2FkZWQnKTtcblxuICAgICAgICAgICAgJChcIiNsYW5ndWFnZS1vcHRzXCIpLm11bHRpc2VsZWN0KCdzZWxlY3QnLCBsYW5nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHJlZnJlc2g6ICgpID0+IHtcbiAgICAgICAgdXBkYXRlUGFnZUxhbmd1YWdlKGxhbmd1YWdlKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVMYW5ndWFnZTogKGxhbmcpID0+IHtcblxuICAgICAgICBsYW5ndWFnZSA9IGxhbmc7XG4gICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZSgpO1xuICAgICAgfSxcbiAgICAgIGdldFRyYW5zbGF0aW9uOiAoa2V5KSA9PiB7XG4gICAgICAgIGxldCB0YXJnZXRMYW5ndWFnZSA9IGRpY3Rpb25hcnkucm93cy5maWx0ZXIoKGkpID0+IGkubGFuZyA9PT0gbGFuZ3VhZ2UpWzBdO1xuICAgICAgICByZXR1cm4gdGFyZ2V0TGFuZ3VhZ2Vba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbn0pKGpRdWVyeSk7XG4iLCIvKiBUaGlzIGxvYWRzIGFuZCBtYW5hZ2VzIHRoZSBsaXN0ISAqL1xuXG5jb25zdCBMaXN0TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKG9wdGlvbnMpID0+IHtcbiAgICBsZXQgdGFyZ2V0TGlzdCA9IG9wdGlvbnMudGFyZ2V0TGlzdCB8fCBcIiNldmVudHMtbGlzdFwiO1xuICAgIC8vIEp1bmUgMTMgYDE4IOKAkyByZWZlcnJlciBhbmQgc291cmNlXG4gICAgbGV0IHtyZWZlcnJlciwgc291cmNlfSA9IG9wdGlvbnM7XG5cbiAgICBjb25zdCAkdGFyZ2V0ID0gdHlwZW9mIHRhcmdldExpc3QgPT09ICdzdHJpbmcnID8gJCh0YXJnZXRMaXN0KSA6IHRhcmdldExpc3Q7XG4gICAgY29uc3QgZDNUYXJnZXQgPSB0eXBlb2YgdGFyZ2V0TGlzdCA9PT0gJ3N0cmluZycgPyBkMy5zZWxlY3QodGFyZ2V0TGlzdCkgOiB0YXJnZXRMaXN0O1xuXG4gICAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSwgcmVmZXJyZXIgPSBudWxsLCBzb3VyY2UgPSBudWxsKSA9PiB7XG4gICAgICBsZXQgbSA9IG1vbWVudChuZXcgRGF0ZShpdGVtLnN0YXJ0X2RhdGV0aW1lKSk7XG4gICAgICBtID0gbS51dGMoKS5zdWJ0cmFjdChtLnV0Y09mZnNldCgpLCAnbScpO1xuICAgICAgdmFyIGRhdGUgPSBtLmZvcm1hdChcImRkZGQgTU1NIERELCBoOm1tYVwiKTtcbiAgICAgIGxldCB1cmwgPSBpdGVtLnVybC5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLnVybCA6IFwiLy9cIiArIGl0ZW0udXJsO1xuICAgICAgLy8gbGV0IHN1cGVyR3JvdXAgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuICAgICAgdXJsID0gSGVscGVyLnJlZlNvdXJjZSh1cmwsIHJlZmVycmVyLCBzb3VyY2UpO1xuXG4gICAgICAvLzxsaSBjbGFzcz0nJHt3aW5kb3cuc2x1Z2lmeShpdGVtLmV2ZW50X3R5cGUpfSBldmVudHMgZXZlbnQtb2JqJyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICByZXR1cm4gYFxuXG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50IHR5cGUtYWN0aW9uXCI+XG4gICAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgICAgPGxpIGNsYXNzPSd0YWctJHtpdGVtLmV2ZW50X3R5cGV9IHRhZyc+JHtpdGVtLmV2ZW50X3R5cGV9PC9saT5cbiAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDxoMiBjbGFzcz1cImV2ZW50LXRpdGxlXCI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWRhdGUgZGF0ZVwiPiR7ZGF0ZX08L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtYWRkcmVzcyBhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICAgIDxwPiR7aXRlbS52ZW51ZX08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5SU1ZQPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSwgcmVmZXJyZXIgPSBudWxsLCBzb3VyY2UgPSBudWxsKSA9PiB7XG4gICAgICBsZXQgdXJsID0gaXRlbS53ZWJzaXRlLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0ud2Vic2l0ZSA6IFwiLy9cIiArIGl0ZW0ud2Vic2l0ZTtcbiAgICAgIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcblxuICAgICAgdXJsID0gSGVscGVyLnJlZlNvdXJjZSh1cmwsIHJlZmVycmVyLCBzb3VyY2UpO1xuXG4gICAgICAvLzxsaSBjbGFzcz0nJHtpdGVtLmV2ZW50X3R5cGV9ICR7c3VwZXJHcm91cH0gZ3JvdXAtb2JqJyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICByZXR1cm4gYFxuICAgICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ncm91cCBncm91cC1vYmpcIj5cbiAgICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5zdXBlcmdyb3VwfVwiPiR7aXRlbS5zdXBlcmdyb3VwfTwvbGk+XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0ubmFtZX08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtbG9jYXRpb24gbG9jYXRpb25cIj4ke2l0ZW0ubG9jYXRpb259PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGVzY3JpcHRpb25cIj5cbiAgICAgICAgICAgICAgPHA+JHtpdGVtLmRlc2NyaXB0aW9ufTwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+R2V0IEludm9sdmVkPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICRsaXN0OiAkdGFyZ2V0LFxuICAgICAgdXBkYXRlRmlsdGVyOiAocCkgPT4ge1xuICAgICAgICBpZighcCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIFJlbW92ZSBGaWx0ZXJzXG5cbiAgICAgICAgJHRhcmdldC5yZW1vdmVQcm9wKFwiY2xhc3NcIik7XG4gICAgICAgICR0YXJnZXQuYWRkQ2xhc3MocC5maWx0ZXIgPyBwLmZpbHRlci5qb2luKFwiIFwiKSA6ICcnKVxuXG4gICAgICAgIC8vICR0YXJnZXQuZmluZCgnbGknKS5oaWRlKCk7XG5cbiAgICAgICAgaWYgKHAuZmlsdGVyKSB7XG4gICAgICAgICAgcC5maWx0ZXIuZm9yRWFjaCgoZmlsKT0+e1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKGBsaS4ke2ZpbH1gKS5zaG93KCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHVwZGF0ZUJvdW5kczogKGJvdW5kMSwgYm91bmQyLCBmaWx0ZXJzKSA9PiB7XG4gICAgICAgIC8vIGNvbnN0IGJvdW5kcyA9IFtwLmJvdW5kczEsIHAuYm91bmRzMl07XG5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gJHRhcmdldC5maW5kKCd1bCBsaS5ldmVudC1vYmosIHVsIGxpLmdyb3VwLW9iaicpLmVhY2goKGluZCwgaXRlbSk9PiB7XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgbGV0IF9sYXQgPSAkKGl0ZW0pLmRhdGEoJ2xhdCcpLFxuICAgICAgICAvLyAgICAgICBfbG5nID0gJChpdGVtKS5kYXRhKCdsbmcnKTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gICBjb25zdCBtaTEwID0gMC4xNDQ5O1xuICAgICAgICAvL1xuICAgICAgICAvLyAgIGlmIChib3VuZDFbMF0gPD0gX2xhdCAmJiBib3VuZDJbMF0gPj0gX2xhdCAmJiBib3VuZDFbMV0gPD0gX2xuZyAmJiBib3VuZDJbMV0gPj0gX2xuZykge1xuICAgICAgICAvL1xuICAgICAgICAvLyAgICAgJChpdGVtKS5hZGRDbGFzcygnd2l0aGluLWJvdW5kJyk7XG4gICAgICAgIC8vICAgfSBlbHNlIHtcbiAgICAgICAgLy8gICAgICQoaXRlbSkucmVtb3ZlQ2xhc3MoJ3dpdGhpbi1ib3VuZCcpO1xuICAgICAgICAvLyAgIH1cbiAgICAgICAgLy8gfSk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIGxldCBfdmlzaWJsZSA9ICR0YXJnZXQuZmluZCgndWwgbGkuZXZlbnQtb2JqLndpdGhpbi1ib3VuZCwgdWwgbGkuZ3JvdXAtb2JqLndpdGhpbi1ib3VuZCcpLmxlbmd0aDtcblxuICAgICAgICBjb25zdCBkYXRhID0gd2luZG93LkVWRU5UU19EQVRBLmRhdGEuZmlsdGVyKChpdGVtKT0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBpdGVtLmV2ZW50X3R5cGUgPyBpdGVtLmV2ZW50X3R5cGUudG9Mb3dlckNhc2UoKSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmlsdGVycyAmJiAoZmlsdGVycy5sZW5ndGggPT0gMCAvKiBJZiBpdCdzIGluIGZpbHRlciAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHRydWUgOiBmaWx0ZXJzLmluY2x1ZGVzKHR5cGUgIT0gJ2dyb3VwJyA/IHR5cGUgOiB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgLyogSWYgaXQncyBpbiBib3VuZHMgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGJvdW5kMVswXSA8PSBpdGVtLmxhdCAmJiBib3VuZDJbMF0gPj0gaXRlbS5sYXQgJiYgYm91bmQxWzFdIDw9IGl0ZW0ubG5nICYmIGJvdW5kMlsxXSA+PSBpdGVtLmxuZyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgbGlzdENvbnRhaW5lciA9IGQzVGFyZ2V0LnNlbGVjdChcInVsXCIpO1xuICAgICAgICBsaXN0Q29udGFpbmVyLnNlbGVjdEFsbChcImxpLm9yZy1saXN0LWl0ZW1cIikucmVtb3ZlKCk7XG4gICAgICAgIGxpc3RDb250YWluZXIuc2VsZWN0QWxsKFwibGkub3JnLWxpc3QtaXRlbVwiKVxuICAgICAgICAgIC5kYXRhKGRhdGEsIChpdGVtKSA9PiBpdGVtLmV2ZW50X3R5cGUgPT0gJ2dyb3VwJyA/IGl0ZW0ud2Vic2l0ZSA6IGl0ZW0udXJsKVxuICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgLmFwcGVuZCgnbGknKVxuICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCAoaXRlbSkgPT4gaXRlbS5ldmVudF90eXBlICE9ICdncm91cCcgPyAnb3JnLWxpc3QtaXRlbSBldmVudHMgZXZlbnQtb2JqJyA6ICdvcmctbGlzdC1pdGVtIGdyb3VwLW9iaicpXG4gICAgICAgICAgICAuaHRtbCgoaXRlbSkgPT4gaXRlbS5ldmVudF90eXBlICE9ICdncm91cCcgPyByZW5kZXJFdmVudChpdGVtLCByZWZlcnJlciwgc291cmNlKSA6IHJlbmRlckdyb3VwKGl0ZW0pKTtcblxuXG4gICAgICAgIGlmIChkYXRhLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgLy8gVGhlIGxpc3QgaXMgZW1wdHlcbiAgICAgICAgICAkdGFyZ2V0LmFkZENsYXNzKFwiaXMtZW1wdHlcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHRhcmdldC5yZW1vdmVDbGFzcyhcImlzLWVtcHR5XCIpO1xuICAgICAgICB9XG5cbiAgICAgIH0sXG4gICAgICBwb3B1bGF0ZUxpc3Q6IChoYXJkRmlsdGVycykgPT4ge1xuICAgICAgICAvL3VzaW5nIHdpbmRvdy5FVkVOVF9EQVRBXG4gICAgICAgIGNvbnN0IGtleVNldCA9ICFoYXJkRmlsdGVycy5rZXkgPyBbXSA6IGhhcmRGaWx0ZXJzLmtleS5zcGxpdCgnLCcpO1xuICAgICAgICAvLyB2YXIgJGV2ZW50TGlzdCA9IHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhLm1hcChpdGVtID0+IHtcbiAgICAgICAgLy8gICBpZiAoa2V5U2V0Lmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIC8vICAgICByZXR1cm4gaXRlbS5ldmVudF90eXBlICYmIGl0ZW0uZXZlbnRfdHlwZS50b0xvd2VyQ2FzZSgpID09ICdncm91cCcgPyByZW5kZXJHcm91cChpdGVtKSA6IHJlbmRlckV2ZW50KGl0ZW0sIHJlZmVycmVyLCBzb3VyY2UpO1xuICAgICAgICAvLyAgIH0gZWxzZSBpZiAoa2V5U2V0Lmxlbmd0aCA+IDAgJiYgaXRlbS5ldmVudF90eXBlICE9ICdncm91cCcgJiYga2V5U2V0LmluY2x1ZGVzKGl0ZW0uZXZlbnRfdHlwZSkpIHtcbiAgICAgICAgLy8gICAgIHJldHVybiByZW5kZXJFdmVudChpdGVtLCByZWZlcnJlciwgc291cmNlKTtcbiAgICAgICAgLy8gICB9IGVsc2UgaWYgKGtleVNldC5sZW5ndGggPiAwICYmIGl0ZW0uZXZlbnRfdHlwZSA9PSAnZ3JvdXAnICYmIGtleVNldC5pbmNsdWRlcyhpdGVtLnN1cGVyZ3JvdXApKSB7XG4gICAgICAgIC8vICAgICByZXR1cm4gcmVuZGVyR3JvdXAoaXRlbSwgcmVmZXJyZXIsIHNvdXJjZSlcbiAgICAgICAgLy8gICB9XG4gICAgICAgIC8vICAgcmV0dXJuIG51bGw7XG4gICAgICAgIC8vIH0pXG5cbiAgICAgICAgLy8gY29uc3QgZXZlbnRUeXBlID0gaXRlbS5ldmVudF90eXBlID8gaXRlbS5ldmVudF90eXBlLnRvTG93ZXJDYXNlKCkgOiBudWxsO1xuICAgICAgICAvLyBjb25zdCBpbml0aWFsRGF0YSA9IHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhLmZpbHRlcihpdGVtID0+IGtleVNldC5sZW5ndGggPT0gMFxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyB0cnVlXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUgIT0gJ2dyb3VwJyA/IGl0ZW0uZXZlbnRfdHlwZSA6IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCkpKTtcbiAgICAgICAgLy8gY29uc3QgbGlzdENvbnRhaW5lciA9IGQzVGFyZ2V0LnNlbGVjdChcInVsXCIpO1xuICAgICAgICAvLyBsaXN0Q29udGFpbmVyLnNlbGVjdEFsbChcImxpXCIpXG4gICAgICAgIC8vICAgLmRhdGEoaW5pdGlhbERhdGEsIChpdGVtKSA9PiBpdGVtID8gaXRlbS51cmwgOiAnJylcbiAgICAgICAgLy8gICAuZW50ZXIoKVxuICAgICAgICAvLyAgIC5hcHBlbmQoJ2xpJylcbiAgICAgICAgLy8gICAgIC5hdHRyKFwiY2xhc3NcIiwgKGl0ZW0pID0+IGl0ZW0uZXZlbnRfdHlwZSAhPSAnZ3JvdXAnID8gJ2V2ZW50cyBldmVudC1vYmonIDogJ2dyb3VwLW9iaicpXG4gICAgICAgIC8vICAgICAuaHRtbCgoaXRlbSkgPT4gaXRlbS5ldmVudF90eXBlICE9ICdncm91cCcgPyByZW5kZXJFdmVudChpdGVtLCByZWZlcnJlciwgc291cmNlKSA6IHJlbmRlckdyb3VwKGl0ZW0pKVxuICAgICAgICAvLyAgIC5leGl0KCk7XG4gICAgICAgICAgLy8gLnJlbW92ZSgpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhsaXN0Q29udGFpbmVyKTtcbiAgICAgICAgLy8gJHRhcmdldC5maW5kKCd1bCBsaScpLnJlbW92ZSgpO1xuICAgICAgICAvLyAkdGFyZ2V0LmZpbmQoJ3VsJykuYXBwZW5kKCRldmVudExpc3QpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJ3aW5kb3cubWFwID0gbnVsbDtcblxuY29uc3QgTWFwTWFuYWdlciA9ICgoJCkgPT4ge1xuICBsZXQgTEFOR1VBR0UgPSAnZW4nO1xuXG4gIGNvbnN0IHBvcHVwID0gbmV3IG1hcGJveGdsLlBvcHVwKHtcbiAgICBjbG9zZU9uQ2xpY2s6IGZhbHNlXG4gIH0pO1xuXG4gIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0sIHJlZmVycmVyID0gbnVsbCwgc291cmNlID0gbnVsbCkgPT4ge1xuXG4gICAgbGV0IG0gPSBtb21lbnQobmV3IERhdGUoaXRlbS5zdGFydF9kYXRldGltZSkpO1xuICAgIG0gPSBtLnV0YygpLnN1YnRyYWN0KG0udXRjT2Zmc2V0KCksICdtJyk7XG5cbiAgICB2YXIgZGF0ZSA9IG0uZm9ybWF0KFwiZGRkZCBNTU0gREQsIGg6bW1hXCIpO1xuICAgIGxldCB1cmwgPSBpdGVtLnVybC5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLnVybCA6IFwiLy9cIiArIGl0ZW0udXJsO1xuXG4gICAgdXJsID0gSGVscGVyLnJlZlNvdXJjZSh1cmwsIHJlZmVycmVyLCBzb3VyY2UpO1xuXG4gICAgbGV0IHN1cGVyR3JvdXAgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuICAgIHJldHVybiBgXG4gICAgPGRpdiBjbGFzcz0ncG9wdXAtaXRlbSAke2l0ZW0uZXZlbnRfdHlwZX0gJHtzdXBlckdyb3VwfScgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnRcIj5cbiAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctJHtpdGVtLmV2ZW50X3R5cGV9XCI+JHtpdGVtLmV2ZW50X3R5cGUgfHwgJ0FjdGlvbid9PC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPGgyIGNsYXNzPVwiZXZlbnQtdGl0bGVcIj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZX08L2E+PC9oMj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWRhdGVcIj4ke2RhdGV9PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1hZGRyZXNzIGFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgIDxwPiR7aXRlbS52ZW51ZX08L3A+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5SU1ZQPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICAgIGBcbiAgfTtcblxuICBjb25zdCByZW5kZXJHcm91cCA9IChpdGVtLCByZWZlcnJlciA9IG51bGwsIHNvdXJjZSA9IG51bGwpID0+IHtcblxuICAgIGxldCB1cmwgPSBpdGVtLndlYnNpdGUubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS53ZWJzaXRlIDogXCIvL1wiICsgaXRlbS53ZWJzaXRlO1xuXG4gICAgdXJsID0gSGVscGVyLnJlZlNvdXJjZSh1cmwsIHJlZmVycmVyLCBzb3VyY2UpO1xuXG4gICAgbGV0IHN1cGVyR3JvdXAgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuICAgIHJldHVybiBgXG4gICAgPGxpPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXAgZ3JvdXAtb2JqICR7c3VwZXJHcm91cH1cIj5cbiAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctJHtpdGVtLnN1cGVyZ3JvdXB9ICR7c3VwZXJHcm91cH1cIj4ke2l0ZW0uc3VwZXJncm91cH08L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtaGVhZGVyXCI+XG4gICAgICAgICAgPGgyPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLm5hbWV9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWxvY2F0aW9uIGxvY2F0aW9uXCI+JHtpdGVtLmxvY2F0aW9ufTwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXNjcmlwdGlvblwiPlxuICAgICAgICAgICAgPHA+JHtpdGVtLmRlc2NyaXB0aW9ufTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPkdldCBJbnZvbHZlZDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2xpPlxuICAgIGBcbiAgfTtcblxuICBjb25zdCByZW5kZXJBbm5vdGF0aW9uUG9wdXAgPSAoaXRlbSkgPT4ge1xuICAgIHJldHVybiBgXG4gICAgPGRpdiBjbGFzcz0ncG9wdXAtaXRlbSBhbm5vdGF0aW9uJyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudFwiPlxuICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgPGxpIGNsYXNzPVwidGFnIHRhZy1hbm5vdGF0aW9uXCI+QW5ub3RhdGlvbjwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxoMiBjbGFzcz1cImV2ZW50LXRpdGxlXCI+JHtpdGVtLm5hbWV9PC9oMj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWFkZHJlc3MgYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgPHA+JHtpdGVtLmRlc2NyaXB0aW9ufTwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgO1xuICB9XG5cblxuICBjb25zdCByZW5kZXJBbm5vdGF0aW9uc0dlb0pzb24gPSAobGlzdCkgPT4ge1xuICAgIHJldHVybiBsaXN0Lm1hcCgoaXRlbSkgPT4ge1xuICAgICAgY29uc3QgcmVuZGVyZWQgPSByZW5kZXJBbm5vdGF0aW9uUG9wdXAoaXRlbSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICAgIGdlb21ldHJ5OiB7XG4gICAgICAgICAgdHlwZTogXCJQb2ludFwiLFxuICAgICAgICAgIGNvb3JkaW5hdGVzOiBbaXRlbS5sbmcsIGl0ZW0ubGF0XVxuICAgICAgICB9LFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgYW5ub3RhdGlvblByb3BzOiBpdGVtLFxuICAgICAgICAgIHBvcHVwQ29udGVudDogcmVuZGVyZWRcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBjb25zdCByZW5kZXJHZW9qc29uID0gKGxpc3QsIHJlZiA9IG51bGwsIHNyYyA9IG51bGwpID0+IHtcbiAgICByZXR1cm4gbGlzdC5tYXAoKGl0ZW0pID0+IHtcbiAgICAgIC8vIHJlbmRlcmVkIGV2ZW50VHlwZVxuICAgICAgbGV0IHJlbmRlcmVkO1xuXG4gICAgICBpZiAoaXRlbS5ldmVudF90eXBlICYmIGl0ZW0uZXZlbnRfdHlwZS50b0xvd2VyQ2FzZSgpID09ICdncm91cCcpIHtcbiAgICAgICAgcmVuZGVyZWQgPSByZW5kZXJHcm91cChpdGVtLCByZWYsIHNyYyk7XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlbmRlcmVkID0gcmVuZGVyRXZlbnQoaXRlbSwgcmVmLCBzcmMpO1xuICAgICAgfVxuXG4gICAgICAvLyBmb3JtYXQgY2hlY2tcbiAgICAgIGlmIChpc05hTihwYXJzZUZsb2F0KHBhcnNlRmxvYXQoaXRlbS5sbmcpKSkpIHtcbiAgICAgICAgaXRlbS5sbmcgPSBpdGVtLmxuZy5zdWJzdHJpbmcoMSlcbiAgICAgIH1cbiAgICAgIGlmIChpc05hTihwYXJzZUZsb2F0KHBhcnNlRmxvYXQoaXRlbS5sYXQpKSkpIHtcbiAgICAgICAgaXRlbS5sYXQgPSBpdGVtLmxhdC5zdWJzdHJpbmcoMSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgIHR5cGU6IFwiUG9pbnRcIixcbiAgICAgICAgICBjb29yZGluYXRlczogW2l0ZW0ubG5nLCBpdGVtLmxhdF1cbiAgICAgICAgfSxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIGV2ZW50UHJvcGVydGllczogaXRlbSxcbiAgICAgICAgICBwb3B1cENvbnRlbnQ6IHJlbmRlcmVkXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgY29uc3QgZ2V0RXZlbnRHZW9qc29uID0gKHRhcmdldHMsIHJlZmVycmVyPW51bGwsIHNvdXJjZT1udWxsKSA9PiB7XG4gICAgICAgICAgcmV0dXJuICh7XG4gICAgICAgICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVDb2xsZWN0aW9uXCIsXG4gICAgICAgICAgICAgIFwiZmVhdHVyZXNcIjogdGFyZ2V0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zb3J0KCh4LHkpID0+IGQzLmRlc2NlbmRpbmcobmV3IERhdGUoeC5zdGFydF9kYXRldGltZSksIG5ldyBEYXRlKHkuc3RhcnRfZGF0ZXRpbWUpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKGl0ZW0gPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicHJvcGVydGllc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBgJHtpdGVtLmxuZ30tJHtpdGVtLmxhdH1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGVzY3JpcHRpb25cIjogIHJlbmRlckV2ZW50KGl0ZW0sIHJlZmVycmVyLCBzb3VyY2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaXNfcGFzdFwiOiBuZXcgRGF0ZShpdGVtLnN0YXJ0X2RhdGV0aW1lKSA8IG5ldyBEYXRlKCkgPyAneWVzJyA6ICdubydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJnZW9tZXRyeVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNvb3JkaW5hdGVzXCI6IFtpdGVtLmxuZywgaXRlbS5sYXRdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gIGNvbnN0IGdldEdyb3VwR2VvanNvbiA9ICh0YXJnZXRzLCByZWZlcnJlcj1udWxsLCBzb3VyY2U9bnVsbCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgICAgICAgICBcImZlYXR1cmVzXCI6IHRhcmdldHNcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoaXRlbSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaWRcIjogYCR7aXRlbS5sbmd9LSR7aXRlbS5sYXR9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGVzY3JpcHRpb25cIjogIHJlbmRlckdyb3VwKGl0ZW0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImdlb21ldHJ5XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNvb3JkaW5hdGVzXCI6IFtpdGVtLmxuZywgaXRlbS5sYXRdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICB9O1xuICB9O1xuXG4gIHJldHVybiAob3B0aW9ucykgPT4ge1xuICAgIHZhciBhY2Nlc3NUb2tlbiA9ICdway5leUoxSWpvaWJXRjBkR2hsZHpNMU1DSXNJbUVpT2lKYVRWRk1Va1V3SW4wLndjTTNYYzhCR0M2UE0tT3lyd2puaGcnO1xuICAgIC8vIHZhciBtYXAgPSBMLm1hcCgnbWFwLXByb3BlcicsIHsgZHJhZ2dpbmc6ICFMLkJyb3dzZXIubW9iaWxlIH0pLnNldFZpZXcoWzM0Ljg4NTkzMDk0MDc1MzE3LCA1LjA5NzY1NjI1MDAwMDAwMV0sIDIpO1xuXG5cbiAgICBtYXBib3hnbC5hY2Nlc3NUb2tlbiA9ICdway5leUoxSWpvaWJXRjBkR2hsZHpNMU1DSXNJbUVpT2lKYVRWRk1Va1V3SW4wLndjTTNYYzhCR0M2UE0tT3lyd2puaGcnO1xuICAgIHZhciBtYXA7XG4gICAgd2luZG93Lm1hcCA9IG1hcCA9IG5ldyBtYXBib3hnbC5NYXAoe1xuICAgICAgY29udGFpbmVyOiAnbWFwLXByb3BlcicsXG4gICAgICBzdHlsZTogJ21hcGJveDovL3N0eWxlcy9tYXR0aGV3MzUwL2NqYTQxdGlqazI3ZDYycnFvZDdnMGx4NGInLFxuICAgICAgZG91YmxlQ2xpY2tab29tOiBmYWxzZSxcbiAgICAgIGNlbnRlcjogWzMzLjA5ODEzNDA0Nzk4MjYxLCAyLjczOTQwNDMzMDQ4MTMwNjddLFxuICAgICAgem9vbTogMS4yLFxuICAgICAgLy8gc2Nyb2xsWm9vbTogZmFsc2VcbiAgICB9KTtcblxuICAgIGxldCB7cmVmZXJyZXIsIHNvdXJjZX0gPSBvcHRpb25zO1xuXG4gICAgLy8gaWYgKCFMLkJyb3dzZXIubW9iaWxlKSB7XG4gICAgLy8gICBtYXAuc2Nyb2xsV2hlZWxab29tLmRpc2FibGUoKTtcbiAgICAvLyB9XG5cbiAgICBMQU5HVUFHRSA9IG9wdGlvbnMubGFuZyB8fCAnZW4nO1xuXG4gICAgaWYgKG9wdGlvbnMub25Nb3ZlKSB7XG4gICAgICBtYXAub24oJ2RyYWdlbmQnLCAoZXZlbnQpID0+IHtcblxuICAgICAgICBjb25zdCBibmQgPSBtYXAuZ2V0Qm91bmRzKCk7XG4gICAgICAgIGxldCBzdyA9IFtibmQuX3N3LmxhdCwgYm5kLl9zdy5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbYm5kLl9uZS5sYXQsIGJuZC5fbmUubG5nXTtcbiAgICAgICAgb3B0aW9ucy5vbk1vdmUoc3csIG5lKTtcbiAgICAgIH0pLm9uKCd6b29tZW5kJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChtYXAuZ2V0Wm9vbSgpIDw9IDQpIHtcbiAgICAgICAgICAkKFwiI21hcFwiKS5hZGRDbGFzcyhcInpvb21lZC1vdXRcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJChcIiNtYXBcIikucmVtb3ZlQ2xhc3MoXCJ6b29tZWQtb3V0XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYm5kID0gbWFwLmdldEJvdW5kcygpO1xuICAgICAgICBsZXQgc3cgPSBbYm5kLl9zdy5sYXQsIGJuZC5fc3cubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW2JuZC5fbmUubGF0LCBibmQuX25lLmxuZ107XG4gICAgICAgIG9wdGlvbnMub25Nb3ZlKHN3LCBuZSk7XG4gICAgICB9KVxuXG4gICAgfVxuXG4gICAgLy8gbWFwLmZpcmVFdmVudCgnem9vbWVuZCcpO1xuXG4gICAgLy8gTC50aWxlTGF5ZXIoJ2h0dHBzOi8vYXBpLm1hcGJveC5jb20vc3R5bGVzL3YxL21hdHRoZXczNTAvY2phNDF0aWprMjdkNjJycW9kN2cwbHg0Yi90aWxlcy8yNTYve3p9L3t4fS97eX0/YWNjZXNzX3Rva2VuPScgKyBhY2Nlc3NUb2tlbiwge1xuICAgIC8vICAgICBhdHRyaWJ1dGlvbjogJyZjb3B5OyA8YSBocmVmPVwiaHR0cDovL29zbS5vcmcvY29weXJpZ2h0XCI+T3BlblN0cmVldE1hcDwvYT4gY29udHJpYnV0b3JzIOKAoiA8YSBocmVmPVwiLy8zNTAub3JnXCI+MzUwLm9yZzwvYT4nXG4gICAgLy8gfSkuYWRkVG8obWFwKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKHdpbmRvdy5xdWVyaWVzWyd0d2lsaWdodC16b25lJ10sIHdpbmRvdy5xdWVyaWVzWyd0d2lsaWdodC16b25lJ10gPT09IFwidHJ1ZVwiKTtcbiAgICBpZih3aW5kb3cucXVlcmllc1sndHdpbGlnaHQtem9uZSddKSB7XG4gICAgICBMLnRlcm1pbmF0b3IoKS5hZGRUbyhtYXApXG4gICAgfVxuXG4gICAgbGV0IGdlb2NvZGVyID0gbnVsbDtcbiAgICBsZXQgbWFpbl9ncm91cHMgPSBudWxsO1xuICAgIHJldHVybiB7XG4gICAgICAkbWFwOiBtYXAsXG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHNldEJvdW5kczogKGJvdW5kczEsIGJvdW5kczIpID0+IHtcblxuICAgICAgICAvLyBjb25zdCBib3VuZHMgPSBbYm91bmRzMSwgYm91bmRzMl07XG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtib3VuZHMxLnJldmVyc2UoKSwgYm91bmRzMi5yZXZlcnNlKCldOyAvLyBtYXBib3hcbiAgICAgICAgbWFwLmZpdEJvdW5kcyhib3VuZHMsIHsgYW5pbWF0ZTogZmFsc2V9KTtcbiAgICAgIH0sXG4gICAgICBzZXRDZW50ZXI6IChjZW50ZXIsIHpvb20gPSAxMCkgPT4ge1xuICAgICAgICBpZiAoIWNlbnRlciB8fCAhY2VudGVyWzBdIHx8IGNlbnRlclswXSA9PSBcIlwiXG4gICAgICAgICAgICAgIHx8ICFjZW50ZXJbMV0gfHwgY2VudGVyWzFdID09IFwiXCIpIHJldHVybjtcbiAgICAgICAgbWFwLnNldFZpZXcoY2VudGVyLCB6b29tKTtcbiAgICAgIH0sXG4gICAgICBnZXRCb3VuZHM6ICgpID0+IHtcblxuICAgICAgICBjb25zdCBibmQgPSBtYXAuZ2V0Qm91bmRzKClcbiAgICAgICAgbGV0IHN3ID0gW2JuZC5fc3cubGF0LCBibmQuX3N3LmxuZ107XG4gICAgICAgIGxldCBuZSA9IFtibmQuX25lLmxhdCwgYm5kLl9uZS5sbmddO1xuXG4gICAgICAgIHJldHVybiBbc3csIG5lXTtcbiAgICAgIH0sXG4gICAgICAvLyBDZW50ZXIgbG9jYXRpb24gYnkgZ2VvY29kZWRcbiAgICAgIGdldENlbnRlckJ5TG9jYXRpb246IChsb2NhdGlvbiwgY2FsbGJhY2spID0+IHtcblxuICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogbG9jYXRpb24gfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuXG4gICAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2socmVzdWx0c1swXSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHRyaWdnZXJab29tRW5kOiAoKSA9PiB7XG4gICAgICAgIC8vIG1hcC5maXJlRXZlbnQoJ3pvb21lbmQnKTtcbiAgICAgIH0sXG4gICAgICB6b29tT3V0T25jZTogKCkgPT4ge1xuICAgICAgICBtYXAuem9vbU91dCgxKTtcbiAgICAgIH0sXG4gICAgICB6b29tVW50aWxIaXQ6ICgpID0+IHtcbiAgICAgICAgdmFyICR0aGlzID0gdGhpcztcbiAgICAgICAgbWFwLnpvb21PdXQoMSk7XG4gICAgICAgIGxldCBpbnRlcnZhbEhhbmRsZXIgPSBudWxsO1xuICAgICAgICBpbnRlcnZhbEhhbmRsZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgdmFyIF92aXNpYmxlID0gJChkb2N1bWVudCkuZmluZCgndWwgbGkuZXZlbnQtb2JqLCB1bCBsaS5ncm91cC1vYmonKS5sZW5ndGg7XG4gICAgICAgICAgaWYgKF92aXNpYmxlID09IDApIHtcbiAgICAgICAgICAgIG1hcC56b29tT3V0KDEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSGFuZGxlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAyMDApO1xuICAgICAgfSxcbiAgICAgIHJlZnJlc2hNYXA6ICgpID0+IHtcbiAgICAgICAgLy8gIG1hcC5pbnZhbGlkYXRlU2l6ZShmYWxzZSk7XG4gICAgICAgIC8vIG1hcC5fb25SZXNpemUoKTtcbiAgICAgICAgLy8gbWFwLmZpcmVFdmVudCgnem9vbWVuZCcpO1xuXG5cbiAgICAgIH0sXG4gICAgICBmaWx0ZXJNYXA6IChmaWx0ZXJzKSA9PiB7XG5cbiAgICAgICAgLy8gVE9ETyBtYXBib3ggdGhpcy5cbiAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwXCIpLmhpZGUoKTtcbiAgICAgICAgLy8gaWYgKCFmaWx0ZXJzKSByZXR1cm47XG4gICAgICAgIGZvciAobGV0IGkgaW4gbWFpbl9ncm91cHMpIHtcbiAgICAgICAgICBjb25zdCBncm91cCA9IG1haW5fZ3JvdXBzW2ldO1xuICAgICAgICAgIGNvbnN0IHNsdWcgPSB3aW5kb3cuc2x1Z2lmeShpKTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKG1hcC5nZXRMYXllcihzbHVnKSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZmlsdGVycyAmJiBmaWx0ZXJzLmluY2x1ZGVzKHNsdWcpKSB7XG4gICAgICAgICAgICAgICAgbWFwLnNldExheW91dFByb3BlcnR5KHNsdWcsICd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWFwLnNldExheW91dFByb3BlcnR5KHNsdWcsICd2aXNpYmlsaXR5JywgJ25vbmUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHBsb3RQb2ludHM6IChsaXN0LCBoYXJkRmlsdGVycywgZ3JvdXBzKSA9PiB7XG4gICAgICAgIG1haW5fZ3JvdXBzID0gZ3JvdXBzO1xuICAgICAgICBjb25zdCBrZXlTZXQgPSAhaGFyZEZpbHRlcnMua2V5ID8gW10gOiBoYXJkRmlsdGVycy5rZXkuc3BsaXQoJywnKTtcbiAgICAgICAgaWYgKGtleVNldC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgbGlzdCA9IGxpc3QuZmlsdGVyKChpdGVtKSA9PiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5ldmVudF90eXBlKSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbG9yIHRoZSBtYXBcbiAgICAgICAgZm9yIChsZXQgaSBpbiBncm91cHMpIHtcbiAgICAgICAgICBjb25zdCBncm91cCA9IGdyb3Vwc1tpXTtcbiAgICAgICAgICBjb25zdCB0YXJnZXRzID0gbGlzdC5maWx0ZXIoaXRlbSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uZXZlbnRfdHlwZSA9PSBcImdyb3VwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gaXRlbS5zdXBlcmdyb3VwID09IGdyb3VwLnN1cGVyZ3JvdXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogaXRlbS5ldmVudF90eXBlID09IHdpbmRvdy5zbHVnaWZ5KGdyb3VwLnN1cGVyZ3JvdXApKTtcblxuXG5cbiAgICAgICAgICAgIC8vIGl0ZW0uY2F0ZWdvcmllcyA9PSBcImJsb2Nrd2Fsa1wiO1xuICAgICAgICAgIGlmIChpID09IFwiRXZlbnRzXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IGdlb2pzb24gPWdldEV2ZW50R2VvanNvbih0YXJnZXRzLCByZWZlcnJlciwgc291cmNlKTtcbiAgICAgICAgICAgIGNvbnN0IGlzVmlzaWJsZSA9IGhhcmRGaWx0ZXJzICYmIGhhcmRGaWx0ZXJzLmZpbHRlcnMgPyBoYXJkRmlsdGVycy5maWx0ZXJzLmluY2x1ZGVzKFwiZXZlbnRzXCIpIDogdHJ1ZTtcbiAgICAgICAgICAgIG1hcC5hZGRMYXllcih7XG4gICAgICAgICAgICAgIFwiaWRcIjogXCJldmVudHNcIixcbiAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiY2lyY2xlXCIsXG4gICAgICAgICAgICAgIFwic291cmNlXCI6IHtcbiAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJnZW9qc29uXCIsXG4gICAgICAgICAgICAgICAgXCJkYXRhXCI6IGdlb2pzb25cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgJ2xheW91dCc6IHtcbiAgICAgICAgICAgICAgICAndmlzaWJpbGl0eSc6IGlzVmlzaWJsZSA/ICd2aXNpYmxlJyA6ICdub25lJ1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBcInBhaW50XCI6IHtcbiAgICAgICAgICAgICAgICBcImNpcmNsZS1yYWRpdXNcIjogW1xuICAgICAgICAgICAgICAgICAgICBcImludGVycG9sYXRlXCIsXG4gICAgICAgICAgICAgICAgICAgIFtcImxpbmVhclwiXSxcbiAgICAgICAgICAgICAgICAgICAgW1wiem9vbVwiXSxcbiAgICAgICAgICAgICAgICAgICAgOCxcbiAgICAgICAgICAgICAgICAgICAgMyxcbiAgICAgICAgICAgICAgICAgICAgMTMsXG4gICAgICAgICAgICAgICAgICAgIDZcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFwiY2lyY2xlLWNvbG9yXCI6IFsnY2FzZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbJz09JywgWydnZXQnLCAnaXNfcGFzdCddLCAneWVzJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiNCQkJCQkJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiIzQwZDdkNFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgXCJjaXJjbGUtb3BhY2l0eVwiOiAwLjksXG4gICAgICAgICAgICAgICAgXCJjaXJjbGUtc3Ryb2tlLXdpZHRoXCI6IDIsXG4gICAgICAgICAgICAgICAgXCJjaXJjbGUtc3Ryb2tlLWNvbG9yXCI6IFwid2hpdGVcIixcbiAgICAgICAgICAgICAgICBcImNpcmNsZS1zdHJva2Utb3BhY2l0eVwiOiAxXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBnZW9qc29uID0gZ2V0R3JvdXBHZW9qc29uKHRhcmdldHMsIGdyb3VwLCByZWZlcnJlciwgc291cmNlKTtcbiAgICAgICAgICAgIGxldCBpY29uID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChpID09IFwiTG9jYWwgR3JvdXBzXCIpIHtcbiAgICAgICAgICAgICAgaWNvbiA9IFwiL2ltZy9ncm91cC5wbmdcIjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIGkgPT0gXCJSZWdpb25hbCBIdWJzXCIpIHtcbiAgICAgICAgICAgICAgaWNvbiA9IFwiL2ltZy9mbGFnLnBuZ1wiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgc2x1ZyA9IHdpbmRvdy5zbHVnaWZ5KGkpXG4gICAgICAgICAgICBjb25zdCBpc1Zpc2libGUgPSBoYXJkRmlsdGVycyAmJiBoYXJkRmlsdGVycy5maWx0ZXJzID8gaGFyZEZpbHRlcnMuZmlsdGVycy5pbmNsdWRlcyhzbHVnKSA6IHRydWU7XG4gICAgICAgICAgICBtYXAubG9hZEltYWdlKGljb24sIChlcnJvcixncm91cEljb24pID0+IHtcbiAgICAgICAgICAgICAgbWFwLmFkZEltYWdlKGAke3dpbmRvdy5zbHVnaWZ5KGkpfS1pY29uYCwgZ3JvdXBJY29uKTtcbiAgICAgICAgICAgICAgbWFwLmFkZExheWVyKHtcbiAgICAgICAgICAgICAgICBcImlkXCI6IHNsdWcsXG4gICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwic3ltYm9sXCIsXG4gICAgICAgICAgICAgICAgXCJzb3VyY2VcIjoge1xuICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiZ2VvanNvblwiLFxuICAgICAgICAgICAgICAgICAgXCJkYXRhXCI6IGdlb2pzb25cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFwibGF5b3V0XCI6IHtcbiAgICAgICAgICAgICAgICAgICdpY29uLWFsbG93LW92ZXJsYXAnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgJ2ljb24taWdub3JlLXBsYWNlbWVudCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAndGV4dC1pZ25vcmUtcGxhY2VtZW50JzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICd0ZXh0LWFsbG93LW92ZXJsYXAnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgJ3Zpc2liaWxpdHknOiBpc1Zpc2libGUgPyAndmlzaWJsZScgOiAnbm9uZScsXG4gICAgICAgICAgICAgICAgICBcImljb24taW1hZ2VcIjogYCR7d2luZG93LnNsdWdpZnkoaSl9LWljb25gLFxuICAgICAgICAgICAgICAgICAgXCJpY29uLXNpemVcIjogW1xuICAgICAgICAgICAgICAgICAgICAgIFwiaW50ZXJwb2xhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgICBbXCJsaW5lYXJcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgW1wiem9vbVwiXSxcbiAgICAgICAgICAgICAgICAgICAgICA0LFxuICAgICAgICAgICAgICAgICAgICAgIDAuMDksXG4gICAgICAgICAgICAgICAgICAgICAgOSxcbiAgICAgICAgICAgICAgICAgICAgICAwLjE1XG4gICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbWFwLm9uKFwiY2xpY2tcIiwgd2luZG93LnNsdWdpZnkoaSksIChlKSA9PiB7XG4gICAgICAgICAgICB2YXIgY29vcmRpbmF0ZXMgPSBlLmZlYXR1cmVzWzBdLmdlb21ldHJ5LmNvb3JkaW5hdGVzLnNsaWNlKCk7XG4gICAgICAgICAgICB2YXIgZGVzY3JpcHRpb24gPSBlLmZlYXR1cmVzWzBdLnByb3BlcnRpZXMuZGVzY3JpcHRpb247XG4gICAgICAgICAgICBwb3B1cC5zZXRMbmdMYXQoY29vcmRpbmF0ZXMpXG4gICAgICAgICAgICAgICAgICAuc2V0SFRNTChkZXNjcmlwdGlvbilcbiAgICAgICAgICAgICAgICAgIC5hZGRUbyhtYXApXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBfb2xkUGxvdFBvaW50czogKGxpc3QsIGhhcmRGaWx0ZXJzLCBncm91cHMpID0+IHtcbiAgICAgICAgY29uc3Qga2V5U2V0ID0gIWhhcmRGaWx0ZXJzLmtleSA/IFtdIDogaGFyZEZpbHRlcnMua2V5LnNwbGl0KCcsJyk7XG4gICAgICAgIGlmIChrZXlTZXQubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGxpc3QgPSBsaXN0LmZpbHRlcigoaXRlbSkgPT4ga2V5U2V0LmluY2x1ZGVzKGl0ZW0uZXZlbnRfdHlwZSkpXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZ2VvanNvbiA9IHtcbiAgICAgICAgICB0eXBlOiBcIkZlYXR1cmVDb2xsZWN0aW9uXCIsXG4gICAgICAgICAgZmVhdHVyZXM6IHJlbmRlckdlb2pzb24obGlzdCwgcmVmZXJyZXIsIHNvdXJjZSlcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZXZlbnRzTGF5ZXIgPSBMLmdlb0pTT04oZ2VvanNvbiwge1xuICAgICAgICAgICAgcG9pbnRUb0xheWVyOiAoZmVhdHVyZSwgbGF0bG5nKSA9PiB7XG4gICAgICAgICAgICAgIC8vIEljb25zIGZvciBtYXJrZXJzXG4gICAgICAgICAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuZXZlbnRfdHlwZTtcbiAgICAgICAgICAgICAgLy8gSWYgbm8gc3VwZXJncm91cCwgaXQncyBhbiBldmVudC5cbiAgICAgICAgICAgICAgY29uc3Qgc3VwZXJncm91cCA9IGdyb3Vwc1tmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLnN1cGVyZ3JvdXBdID8gZmVhdHVyZS5wcm9wZXJ0aWVzLmV2ZW50UHJvcGVydGllcy5zdXBlcmdyb3VwIDogXCJFdmVudHNcIjtcbiAgICAgICAgICAgICAgY29uc3Qgc2x1Z2dlZCA9IHdpbmRvdy5zbHVnaWZ5KHN1cGVyZ3JvdXApO1xuICAgICAgICAgICAgICBsZXQgaWNvblVybDtcbiAgICAgICAgICAgICAgY29uc3QgaXNQYXN0ID0gbmV3IERhdGUoZmVhdHVyZS5wcm9wZXJ0aWVzLmV2ZW50UHJvcGVydGllcy5zdGFydF9kYXRldGltZSkgPCBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgICBpZiAoZXZlbnRUeXBlID09IFwiQWN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBpY29uVXJsID0gaXNQYXN0ID8gXCIvaW1nL3Bhc3QtZXZlbnQucG5nXCIgOiBcIi9pbWcvZXZlbnQucG5nXCI7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWNvblVybCA9IGdyb3Vwc1tzdXBlcmdyb3VwXSA/IGdyb3Vwc1tzdXBlcmdyb3VwXS5pY29udXJsIHx8IFwiL2ltZy9ldmVudC5wbmdcIiAgOiBcIi9pbWcvZXZlbnQucG5nXCIgO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY29uc3Qgc21hbGxJY29uID0gIEwuaWNvbih7XG4gICAgICAgICAgICAgICAgaWNvblVybDogaWNvblVybCxcbiAgICAgICAgICAgICAgICBpY29uU2l6ZTogWzE4LCAxOF0sXG4gICAgICAgICAgICAgICAgaWNvbkFuY2hvcjogWzksIDldLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogc2x1Z2dlZCArICcgZXZlbnQtaXRlbS1wb3B1cCAnICsgKGlzUGFzdCYmZXZlbnRUeXBlID09IFwiQWN0aW9uXCI/XCJldmVudC1wYXN0LWV2ZW50XCI6XCJcIilcbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgdmFyIGdlb2pzb25NYXJrZXJPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIGljb246IHNtYWxsSWNvbixcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgcmV0dXJuIEwubWFya2VyKGxhdGxuZywgZ2VvanNvbk1hcmtlck9wdGlvbnMpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgIG9uRWFjaEZlYXR1cmU6IChmZWF0dXJlLCBsYXllcikgPT4ge1xuICAgICAgICAgICAgaWYgKGZlYXR1cmUucHJvcGVydGllcyAmJiBmZWF0dXJlLnByb3BlcnRpZXMucG9wdXBDb250ZW50KSB7XG4gICAgICAgICAgICAgIGxheWVyLmJpbmRQb3B1cChmZWF0dXJlLnByb3BlcnRpZXMucG9wdXBDb250ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGV2ZW50c0xheWVyLmFkZFRvKG1hcCk7XG4gICAgICAgIC8vIGV2ZW50c0xheWVyLmJyaW5nVG9CYWNrKCk7XG5cblxuICAgICAgICAvLyBBZGQgQW5ub3RhdGlvbnNcbiAgICAgICAgaWYgKHdpbmRvdy5xdWVyaWVzLmFubm90YXRpb24pIHtcbiAgICAgICAgICBjb25zdCBhbm5vdGF0aW9ucyA9ICF3aW5kb3cuRVZFTlRTX0RBVEEuYW5ub3RhdGlvbnMgPyBbXSA6IHdpbmRvdy5FVkVOVFNfREFUQS5hbm5vdGF0aW9ucy5maWx0ZXIoKGl0ZW0pPT5pdGVtLnR5cGU9PT13aW5kb3cucXVlcmllcy5hbm5vdGF0aW9uKTtcblxuICAgICAgICAgIGNvbnN0IGFubm90SWNvbiA9ICBMLmljb24oe1xuICAgICAgICAgICAgaWNvblVybDogXCIvaW1nL2Fubm90YXRpb24ucG5nXCIsXG4gICAgICAgICAgICBpY29uU2l6ZTogWzQwLCA0MF0sXG4gICAgICAgICAgICBpY29uQW5jaG9yOiBbMjAsIDIwXSxcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ2Fubm90YXRpb24tcG9wdXAnXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgY29uc3QgYW5ub3RNYXJrZXJzID0gYW5ub3RhdGlvbnMubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gTC5tYXJrZXIoW2l0ZW0ubGF0LCBpdGVtLmxuZ10sIHtpY29uOiBhbm5vdEljb259KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmJpbmRQb3B1cChyZW5kZXJBbm5vdGF0aW9uUG9wdXAoaXRlbSkpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyBhbm5vdExheWVyLmJyaW5nVG9Gcm9udCgpO1xuXG4gICAgICAgICAgLy8gY29uc3QgYW5ub3RMYXllckdyb3VwID0gO1xuXG4gICAgICAgICAgY29uc3QgYW5ub3RMYXllckdyb3VwID0gbWFwLmFkZExheWVyKEwuZmVhdHVyZUdyb3VwKGFubm90TWFya2VycykpO1xuICAgICAgICAgIC8vIGFubm90TGF5ZXJHcm91cC5icmluZ1RvRnJvbnQoKTtcbiAgICAgICAgICAvLyBhbm5vdE1hcmtlcnMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAvLyAgIGl0ZW0uYWRkVG8obWFwKTtcbiAgICAgICAgICAvLyAgIGl0ZW0uYnJpbmdUb0Zyb250KCk7XG4gICAgICAgICAgLy8gfSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHVwZGF0ZTogKHApID0+IHtcbiAgICAgICAgaWYgKCFwIHx8ICFwLmxhdCB8fCAhcC5sbmcgKSByZXR1cm47XG5cbiAgICAgICAgbWFwLnNldFZpZXcoTC5sYXRMbmcocC5sYXQsIHAubG5nKSwgMTApO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJjb25zdCBRdWVyeU1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRGb3JtID0gXCJmb3JtI2ZpbHRlcnMtZm9ybVwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRGb3JtID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0Rm9ybSkgOiB0YXJnZXRGb3JtO1xuICAgIGxldCBsYXQgPSBudWxsO1xuICAgIGxldCBsbmcgPSBudWxsO1xuXG4gICAgbGV0IHByZXZpb3VzID0ge307XG5cbiAgICAkdGFyZ2V0Lm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgbGF0ID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbCgpO1xuICAgICAgbG5nID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbCgpO1xuXG4gICAgICB2YXIgZm9ybSA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcblxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAkLnBhcmFtKGZvcm0pO1xuICAgIH0pXG5cbiAgICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJ3NlbGVjdCNmaWx0ZXItaXRlbXMnLCAoKSA9PiB7XG4gICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgIH0pXG5cblxuICAgIHJldHVybiB7XG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgcGFyYW1zID0gJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSlcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhbmddXCIpLnZhbChwYXJhbXMubGFuZyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChwYXJhbXMubGF0KTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKHBhcmFtcy5sbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwocGFyYW1zLmJvdW5kMSk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChwYXJhbXMuYm91bmQyKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxvY11cIikudmFsKHBhcmFtcy5sb2MpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9a2V5XVwiKS52YWwocGFyYW1zLmtleSk7XG5cbiAgICAgICAgICBpZiAocGFyYW1zLmZpbHRlcikge1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiI2ZpbHRlci1pdGVtcyBvcHRpb25cIikucmVtb3ZlUHJvcChcInNlbGVjdGVkXCIpO1xuICAgICAgICAgICAgcGFyYW1zLmZpbHRlci5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIjZmlsdGVyLWl0ZW1zIG9wdGlvblt2YWx1ZT0nXCIgKyBpdGVtICsgXCInXVwiKS5wcm9wKFwic2VsZWN0ZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGdldFBhcmFtZXRlcnM6ICgpID0+IHtcbiAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG4gICAgICAgIC8vIHBhcmFtZXRlcnNbJ2xvY2F0aW9uJ10gO1xuXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHBhcmFtZXRlcnMpIHtcbiAgICAgICAgICBpZiAoICFwYXJhbWV0ZXJzW2tleV0gfHwgcGFyYW1ldGVyc1trZXldID09IFwiXCIpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBwYXJhbWV0ZXJzW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtZXRlcnM7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTG9jYXRpb246IChsYXQsIGxuZykgPT4ge1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKGxhdCk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwobG5nKTtcbiAgICAgICAgLy8gJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVWaWV3cG9ydDogKHZpZXdwb3J0KSA9PiB7XG5cbiAgICAgICAgLy8gQXZlcmFnZSBpdCBpZiBsZXNzIHRoYW4gMTBtaSByYWRpdXNcbiAgICAgICAgaWYgKE1hdGguYWJzKHZpZXdwb3J0LmYuYiAtIHZpZXdwb3J0LmYuZikgPCAuMTUgfHwgTWF0aC5hYnModmlld3BvcnQuYi5iIC0gdmlld3BvcnQuYi5mKSA8IC4xNSkge1xuICAgICAgICAgIGxldCBmQXZnID0gKHZpZXdwb3J0LmYuYiArIHZpZXdwb3J0LmYuZikgLyAyO1xuICAgICAgICAgIGxldCBiQXZnID0gKHZpZXdwb3J0LmIuYiArIHZpZXdwb3J0LmIuZikgLyAyO1xuICAgICAgICAgIHZpZXdwb3J0LmYgPSB7IGI6IGZBdmcgLSAuMDgsIGY6IGZBdmcgKyAuMDggfTtcbiAgICAgICAgICB2aWV3cG9ydC5iID0geyBiOiBiQXZnIC0gLjA4LCBmOiBiQXZnICsgLjA4IH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYm91bmRzID0gW1t2aWV3cG9ydC5mLmIsIHZpZXdwb3J0LmIuYl0sIFt2aWV3cG9ydC5mLmYsIHZpZXdwb3J0LmIuZl1dO1xuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlVmlld3BvcnRCeUJvdW5kOiAoc3csIG5lKSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW3N3LCBuZV07Ly8vLy8vLy9cblxuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdHJpZ2dlclN1Ym1pdDogKCkgPT4ge1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSkoalF1ZXJ5KTtcbiIsImxldCBhdXRvY29tcGxldGVNYW5hZ2VyO1xubGV0IG1hcE1hbmFnZXI7XG5cbndpbmRvdy5ERUZBVUxUX0lDT04gPSBcIi9pbWcvZXZlbnQucG5nXCI7XG53aW5kb3cuc2x1Z2lmeSA9ICh0ZXh0KSA9PiAhdGV4dCA/IHRleHQgOiB0ZXh0LnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHMrL2csICctJykgICAgICAgICAgIC8vIFJlcGxhY2Ugc3BhY2VzIHdpdGggLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9bXlxcd1xcLV0rL2csICcnKSAgICAgICAvLyBSZW1vdmUgYWxsIG5vbi13b3JkIGNoYXJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcLVxcLSsvZywgJy0nKSAgICAgICAgIC8vIFJlcGxhY2UgbXVsdGlwbGUgLSB3aXRoIHNpbmdsZSAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL14tKy8sICcnKSAgICAgICAgICAgICAvLyBUcmltIC0gZnJvbSBzdGFydCBvZiB0ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLy0rJC8sICcnKTsgICAgICAgICAgICAvLyBUcmltIC0gZnJvbSBlbmQgb2YgdGV4dFxuXG5jb25zdCBnZXRRdWVyeVN0cmluZyA9ICgpID0+IHtcbiAgICB2YXIgcXVlcnlTdHJpbmdLZXlWYWx1ZSA9IHdpbmRvdy5wYXJlbnQubG9jYXRpb24uc2VhcmNoLnJlcGxhY2UoJz8nLCAnJykuc3BsaXQoJyYnKTtcbiAgICB2YXIgcXNKc29uT2JqZWN0ID0ge307XG4gICAgaWYgKHF1ZXJ5U3RyaW5nS2V5VmFsdWUgIT0gJycpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBxdWVyeVN0cmluZ0tleVZhbHVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBxc0pzb25PYmplY3RbcXVlcnlTdHJpbmdLZXlWYWx1ZVtpXS5zcGxpdCgnPScpWzBdXSA9IHF1ZXJ5U3RyaW5nS2V5VmFsdWVbaV0uc3BsaXQoJz0nKVsxXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcXNKc29uT2JqZWN0O1xufTtcblxuKGZ1bmN0aW9uKCQpIHtcbiAgLy8gTG9hZCB0aGluZ3NcblxuICB3aW5kb3cucXVlcmllcyA9ICAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHJpbmcoMSkpO1xuICB0cnkge1xuICAgIGlmICgoIXdpbmRvdy5xdWVyaWVzLmdyb3VwIHx8ICghd2luZG93LnF1ZXJpZXMucmVmZXJyZXIgJiYgIXdpbmRvdy5xdWVyaWVzLnNvdXJjZSkpICYmIHdpbmRvdy5wYXJlbnQpIHtcbiAgICAgIHdpbmRvdy5xdWVyaWVzID0ge1xuICAgICAgICBncm91cDogZ2V0UXVlcnlTdHJpbmcoKS5ncm91cCxcbiAgICAgICAgcmVmZXJyZXI6IGdldFF1ZXJ5U3RyaW5nKCkucmVmZXJyZXIsXG4gICAgICAgIHNvdXJjZTogZ2V0UXVlcnlTdHJpbmcoKS5zb3VyY2UsXG4gICAgICAgIFwidHdpbGlnaHQtem9uZVwiOiB3aW5kb3cucXVlcmllc1sndHdpbGlnaHQtem9uZSddLFxuICAgICAgICBcImFubm90YXRpb25cIjogd2luZG93LnF1ZXJpZXNbJ2Fubm90YXRpb24nXSxcbiAgICAgICAgXCJmdWxsLW1hcFwiOiB3aW5kb3cucXVlcmllc1snZnVsbC1tYXAnXSxcbiAgICAgICAgXCJsYW5nXCI6IHdpbmRvdy5xdWVyaWVzWydsYW5nJ11cbiAgICAgIH07XG4gICAgfVxuICB9IGNhdGNoKGUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiwgZSk7XG4gIH1cblxuICBpZiAod2luZG93LnF1ZXJpZXNbJ2Z1bGwtbWFwJ10pIHtcbiAgICBpZiAoJCh3aW5kb3cpLndpZHRoKCkgPCA2MDApIHtcbiAgICAgIC8vICQoXCIjZXZlbnRzLWxpc3QtY29udGFpbmVyXCIpLmhpZGUoKTtcbiAgICAgICQoXCJib2R5XCIpLmFkZENsYXNzKFwibWFwLXZpZXdcIik7XG4gICAgICAvLyAkKFwiLmZpbHRlci1hcmVhXCIpLmhpZGUoKTtcbiAgICAgIC8vICQoXCJzZWN0aW9uI21hcFwiKS5jc3MoXCJoZWlnaHRcIiwgXCJjYWxjKDEwMCUgLSA2NHB4KVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJChcImJvZHlcIikuYWRkQ2xhc3MoXCJmaWx0ZXItY29sbGFwc2VkXCIpO1xuICAgICAgLy8gJChcIiNldmVudHMtbGlzdC1jb250YWluZXJcIikuaGlkZSgpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAkKFwiI3Nob3ctaGlkZS1saXN0LWNvbnRhaW5lclwiKS5oaWRlKCk7XG4gIH1cblxuXG4gIGlmICh3aW5kb3cucXVlcmllcy5ncm91cCkge1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5wYXJlbnQoKS5jc3MoXCJvcGFjaXR5XCIsIFwiMFwiKTtcbiAgfVxuICBjb25zdCBidWlsZEZpbHRlcnMgPSAoKSA9PiB7JCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KHtcbiAgICAgIGVuYWJsZUhUTUw6IHRydWUsXG4gICAgICB0ZW1wbGF0ZXM6IHtcbiAgICAgICAgYnV0dG9uOiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJtdWx0aXNlbGVjdCBkcm9wZG93bi10b2dnbGVcIiBkYXRhLXRvZ2dsZT1cImRyb3Bkb3duXCI+PHNwYW4gZGF0YS1sYW5nLXRhcmdldD1cInRleHRcIiBkYXRhLWxhbmcta2V5PVwibW9yZS1zZWFyY2gtb3B0aW9uc1wiPjwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJmYSBmYS1jYXJldC1kb3duXCI+PC9zcGFuPjwvYnV0dG9uPicsXG4gICAgICAgIGxpOiAnPGxpPjxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCI+PGxhYmVsPjwvbGFiZWw+PC9hPjwvbGk+J1xuICAgICAgfSxcbiAgICAgIGRyb3BSaWdodDogdHJ1ZSxcbiAgICAgIG9uSW5pdGlhbGl6ZWQ6ICgpID0+IHtcblxuICAgICAgfSxcbiAgICAgIG9uRHJvcGRvd25TaG93OiAoKSA9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJtb2JpbGUtdXBkYXRlLW1hcC1oZWlnaHRcIik7XG4gICAgICAgIH0sIDEwKTtcblxuICAgICAgfSxcbiAgICAgIG9uRHJvcGRvd25IaWRlOiAoKSA9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJtb2JpbGUtdXBkYXRlLW1hcC1oZWlnaHRcIik7XG4gICAgICAgIH0sIDEwKTtcbiAgICAgIH0sXG4gICAgICBvcHRpb25MYWJlbDogKGUpID0+IHtcbiAgICAgICAgLy8gbGV0IGVsID0gJCggJzxkaXY+PC9kaXY+JyApO1xuICAgICAgICAvLyBlbC5hcHBlbmQoKCkgKyBcIlwiKTtcblxuICAgICAgICByZXR1cm4gdW5lc2NhcGUoJChlKS5hdHRyKCdsYWJlbCcpKSB8fCAkKGUpLmh0bWwoKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH07XG4gIGJ1aWxkRmlsdGVycygpO1xuXG5cbiAgJCgnc2VsZWN0I2xhbmd1YWdlLW9wdHMnKS5tdWx0aXNlbGVjdCh7XG4gICAgZW5hYmxlSFRNTDogdHJ1ZSxcbiAgICBvcHRpb25DbGFzczogKCkgPT4gJ2xhbmctb3B0JyxcbiAgICBzZWxlY3RlZENsYXNzOiAoKSA9PiAnbGFuZy1zZWwnLFxuICAgIGJ1dHRvbkNsYXNzOiAoKSA9PiAnbGFuZy1idXQnLFxuICAgIGRyb3BSaWdodDogdHJ1ZSxcbiAgICBvcHRpb25MYWJlbDogKGUpID0+IHtcbiAgICAgIC8vIGxldCBlbCA9ICQoICc8ZGl2PjwvZGl2PicgKTtcbiAgICAgIC8vIGVsLmFwcGVuZCgoKSArIFwiXCIpO1xuXG4gICAgICByZXR1cm4gdW5lc2NhcGUoJChlKS5hdHRyKCdsYWJlbCcpKSB8fCAkKGUpLmh0bWwoKTtcbiAgICB9LFxuICAgIG9uQ2hhbmdlOiAob3B0aW9uLCBjaGVja2VkLCBzZWxlY3QpID0+IHtcblxuICAgICAgY29uc3QgcGFyYW1ldGVycyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gICAgICBwYXJhbWV0ZXJzWydsYW5nJ10gPSBvcHRpb24udmFsKCk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1yZXNldC1tYXAnLCBwYXJhbWV0ZXJzKTtcblxuICAgIH1cbiAgfSlcblxuICAvLyAxLiBnb29nbGUgbWFwcyBnZW9jb2RlXG5cbiAgLy8gMi4gZm9jdXMgbWFwIG9uIGdlb2NvZGUgKHZpYSBsYXQvbG5nKVxuICBjb25zdCBxdWVyeU1hbmFnZXIgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICAgICAgcXVlcnlNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICBjb25zdCBpbml0UGFyYW1zID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuXG5cbiAgY29uc3QgbGFuZ3VhZ2VNYW5hZ2VyID0gTGFuZ3VhZ2VNYW5hZ2VyKCk7XG5cbiAgY29uc3QgbGlzdE1hbmFnZXIgPSBMaXN0TWFuYWdlcih7XG4gICAgcmVmZXJyZXI6IHdpbmRvdy5xdWVyaWVzLnJlZmVycmVyLFxuICAgIHNvdXJjZTogd2luZG93LnF1ZXJpZXMuc291cmNlXG4gIH0pO1xuXG5cbiAgbWFwTWFuYWdlciA9IE1hcE1hbmFnZXIoe1xuICAgIG9uTW92ZTogKHN3LCBuZSkgPT4ge1xuICAgICAgLy8gV2hlbiB0aGUgbWFwIG1vdmVzIGFyb3VuZCwgd2UgdXBkYXRlIHRoZSBsaXN0XG4gICAgICBxdWVyeU1hbmFnZXIudXBkYXRlVmlld3BvcnRCeUJvdW5kKHN3LCBuZSk7XG4gICAgICAvL3VwZGF0ZSBRdWVyeVxuICAgIH0sXG4gICAgcmVmZXJyZXI6IHdpbmRvdy5xdWVyaWVzLnJlZmVycmVyLFxuICAgIHNvdXJjZTogd2luZG93LnF1ZXJpZXMuc291cmNlXG4gIH0pO1xuXG4gIHdpbmRvdy5pbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2sgPSAoKSA9PiB7XG5cbiAgICBhdXRvY29tcGxldGVNYW5hZ2VyID0gQXV0b2NvbXBsZXRlTWFuYWdlcihcImlucHV0W25hbWU9J2xvYyddXCIpO1xuICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuXG4gICAgaWYgKGluaXRQYXJhbXMubG9jICYmIGluaXRQYXJhbXMubG9jICE9PSAnJyAmJiAoIWluaXRQYXJhbXMuYm91bmQxICYmICFpbml0UGFyYW1zLmJvdW5kMikpIHtcbiAgICAgIG1hcE1hbmFnZXIuaW5pdGlhbGl6ZSgoKSA9PiB7XG4gICAgICAgIG1hcE1hbmFnZXIuZ2V0Q2VudGVyQnlMb2NhdGlvbihpbml0UGFyYW1zLmxvYywgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIHF1ZXJ5TWFuYWdlci51cGRhdGVWaWV3cG9ydChyZXN1bHQuZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgaWYoaW5pdFBhcmFtcy5sYXQgJiYgaW5pdFBhcmFtcy5sbmcpIHtcbiAgICBtYXBNYW5hZ2VyLnNldENlbnRlcihbaW5pdFBhcmFtcy5sYXQsIGluaXRQYXJhbXMubG5nXSk7XG4gIH1cblxuICAvKioqXG4gICogTGlzdCBFdmVudHNcbiAgKiBUaGlzIHdpbGwgdHJpZ2dlciB0aGUgbGlzdCB1cGRhdGUgbWV0aG9kXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCdtb2JpbGUtdXBkYXRlLW1hcC1oZWlnaHQnLCAoZXZlbnQpID0+IHtcbiAgICAvL1RoaXMgY2hlY2tzIGlmIHdpZHRoIGlzIGZvciBtb2JpbGVcbiAgICBpZiAoJCh3aW5kb3cpLndpZHRoKCkgPCA2MDApIHtcbiAgICAgIHNldFRpbWVvdXQoKCk9PiB7XG4gICAgICAgICQoXCIjbWFwXCIpLmhlaWdodCgkKFwiI2V2ZW50cy1saXN0XCIpLmhlaWdodCgpKTtcbiAgICAgICAgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCk7XG4gICAgICB9LCAxMCk7XG4gICAgfVxuICB9KVxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnBvcHVsYXRlTGlzdChvcHRpb25zLnBhcmFtcyk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuXG4gICAgbGlzdE1hbmFnZXIudXBkYXRlRmlsdGVyKG9wdGlvbnMpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlcicsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxldCBib3VuZDEsIGJvdW5kMjtcblxuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICBbYm91bmQxLCBib3VuZDJdID0gbWFwTWFuYWdlci5nZXRCb3VuZHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgICBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcbiAgICB9XG5cbiAgICBsaXN0TWFuYWdlci51cGRhdGVCb3VuZHMoYm91bmQxLCBib3VuZDIsIG9wdGlvbnMuZmlsdGVyKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItcmVzZXQtbWFwJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgdmFyIGNvcHkgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9wdGlvbnMpKTtcbiAgICBkZWxldGUgY29weVsnbG5nJ107XG4gICAgZGVsZXRlIGNvcHlbJ2xhdCddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDEnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQyJ107XG5cbiAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICQucGFyYW0oY29weSk7XG5cblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJ0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZVwiLCBjb3B5KTtcbiAgICAkKFwic2VsZWN0I2ZpbHRlci1pdGVtc1wiKS5tdWx0aXNlbGVjdCgnZGVzdHJveScpO1xuICAgIGJ1aWxkRmlsdGVycygpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbG9hZC1ncm91cHMnLCB7IGdyb3Vwczogd2luZG93LkVWRU5UU19EQVRBLmdyb3VwcyB9KTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcblxuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcihcInRyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlXCIsIGNvcHkpO1xuICAgIH0sIDEwMDApO1xuICB9KTtcblxuXG4gIC8qKipcbiAgKiBNYXAgRXZlbnRzXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICAvLyBtYXBNYW5hZ2VyLnNldENlbnRlcihbb3B0aW9ucy5sYXQsIG9wdGlvbnMubG5nXSk7XG4gICAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLmJvdW5kMSB8fCAhb3B0aW9ucy5ib3VuZDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgdmFyIGJvdW5kMiA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDIpO1xuXG4gICAgbWFwTWFuYWdlci5zZXRCb3VuZHMoYm91bmQxLCBib3VuZDIpO1xuICAgIC8vIG1hcE1hbmFnZXIudHJpZ2dlclpvb21FbmQoKTtcblxuICAgIC8vIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIC8vICAgbWFwTWFuYWdlci50cmlnZ2VyWm9vbUVuZCgpO1xuICAgIC8vIH0sIDEwKTtcblxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCBcIiNjb3B5LWVtYmVkXCIsIChlKSA9PiB7XG4gICAgdmFyIGNvcHlUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbWJlZC10ZXh0XCIpO1xuICAgIGNvcHlUZXh0LnNlbGVjdCgpO1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiQ29weVwiKTtcbiAgfSk7XG5cbiAgLy8gMy4gbWFya2VycyBvbiBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXBsb3QnLCAoZSwgb3B0KSA9PiB7XG5cbiAgICBtYXBNYW5hZ2VyLnBsb3RQb2ludHMob3B0LmRhdGEsIG9wdC5wYXJhbXMsIG9wdC5ncm91cHMpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicpO1xuICB9KVxuXG4gIC8vIGxvYWQgZ3JvdXBzXG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbG9hZC1ncm91cHMnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLmVtcHR5KCk7XG4gICAgb3B0Lmdyb3Vwcy5mb3JFYWNoKChpdGVtKSA9PiB7XG5cbiAgICAgIGxldCBzbHVnZ2VkID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICAgIGxldCB2YWx1ZVRleHQgPSBsYW5ndWFnZU1hbmFnZXIuZ2V0VHJhbnNsYXRpb24oaXRlbS50cmFuc2xhdGlvbik7XG4gICAgICAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykuYXBwZW5kKGBcbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9JyR7c2x1Z2dlZH0nXG4gICAgICAgICAgICAgIHNlbGVjdGVkPSdzZWxlY3RlZCdcbiAgICAgICAgICAgICAgbGFiZWw9XCI8c3BhbiBkYXRhLWxhbmctdGFyZ2V0PSd0ZXh0JyBkYXRhLWxhbmcta2V5PScke2l0ZW0udHJhbnNsYXRpb259Jz4ke3ZhbHVlVGV4dH08L3NwYW4+PGltZyBzcmM9JyR7aXRlbS5pY29udXJsIHx8IHdpbmRvdy5ERUZBVUxUX0lDT059JyAvPlwiPlxuICAgICAgICAgICAgPC9vcHRpb24+YClcbiAgICB9KTtcblxuICAgIC8vIFJlLWluaXRpYWxpemVcbiAgICBxdWVyeU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuICAgIC8vICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5tdWx0aXNlbGVjdCgnZGVzdHJveScpO1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5tdWx0aXNlbGVjdCgncmVidWlsZCcpO1xuXG4gICAgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCk7XG5cblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJyk7XG5cbiAgfSlcblxuICAvLyBGaWx0ZXIgbWFwXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCAoZSwgb3B0KSA9PiB7XG4gICAgaWYgKG9wdCkge1xuICAgICAgbWFwTWFuYWdlci5maWx0ZXJNYXAob3B0LmZpbHRlcik7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sYW5ndWFnZS11cGRhdGUnLCAoZSwgb3B0KSA9PiB7XG5cbiAgICBpZiAod2luZG93LnF1ZXJpZXMubGFuZykge1xuICAgICAgbGFuZ3VhZ2VNYW5hZ2VyLnVwZGF0ZUxhbmd1YWdlKHdpbmRvdy5xdWVyaWVzLmxhbmcpO1xuICAgIH0gZWxzZSBpZiAob3B0KSB7XG4gICAgICBsYW5ndWFnZU1hbmFnZXIudXBkYXRlTGFuZ3VhZ2Uob3B0LmxhbmcpO1xuICAgIH0gZWxzZSB7XG5cbiAgICAgIGxhbmd1YWdlTWFuYWdlci5yZWZyZXNoKCk7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sYW5ndWFnZS1sb2FkZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KCdyZWJ1aWxkJyk7XG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbiNzaG93LWhpZGUtbWFwJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ2JvZHknKS50b2dnbGVDbGFzcygnbWFwLXZpZXcnKVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uLmJ0bi5tb3JlLWl0ZW1zJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJyNlbWJlZC1hcmVhJykudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgLy91cGRhdGUgZW1iZWQgbGluZVxuICAgIHZhciBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHQpKTtcbiAgICBkZWxldGUgY29weVsnbG5nJ107XG4gICAgZGVsZXRlIGNvcHlbJ2xhdCddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDEnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQyJ107XG5cbiAgICAkKCcjZW1iZWQtYXJlYSBpbnB1dFtuYW1lPWVtYmVkXScpLnZhbCgnaHR0cHM6Ly9uZXctbWFwLjM1MC5vcmcjJyArICQucGFyYW0oY29weSkpO1xuICB9KTtcblxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24jem9vbS1vdXQnLCAoZSwgb3B0KSA9PiB7XG5cbiAgICAvLyBtYXBNYW5hZ2VyLnpvb21PdXRPbmNlKCk7XG4gICAgbWFwTWFuYWdlci56b29tVW50aWxIaXQoKTtcbiAgfSk7XG5cblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnI3Nob3ctaGlkZS1saXN0LWNvbnRhaW5lcicsIChlLCBvcHQpID0+IHtcbiAgICAkKCdib2R5JykudG9nZ2xlQ2xhc3MoJ2ZpbHRlci1jb2xsYXBzZWQnKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHsgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCkgfSwgNjAwKVxuICB9KTtcblxuICAkKHdpbmRvdykub24oXCJyZXNpemVcIiwgKGUpID0+IHtcbiAgICBtYXBNYW5hZ2VyLnJlZnJlc2hNYXAoKTtcbiAgfSk7XG5cbiAgLyoqXG4gIEZpbHRlciBDaGFuZ2VzXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgXCIuc2VhcmNoLWJ1dHRvbiBidXR0b25cIiwgKGUpID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcihcInNlYXJjaC5mb3JjZS1zZWFyY2gtbG9jYXRpb25cIik7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbihcImtleXVwXCIsIFwiaW5wdXRbbmFtZT0nbG9jJ11cIiwgKGUpID0+IHtcbiAgICBpZiAoZS5rZXlDb2RlID09IDEzKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCdzZWFyY2guZm9yY2Utc2VhcmNoLWxvY2F0aW9uJyk7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignc2VhcmNoLmZvcmNlLXNlYXJjaC1sb2NhdGlvbicsICgpID0+IHtcbiAgICBsZXQgX3F1ZXJ5ID0gJChcImlucHV0W25hbWU9J2xvYyddXCIpLnZhbCgpO1xuICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuZm9yY2VTZWFyY2goX3F1ZXJ5KTtcbiAgICAvLyBTZWFyY2ggZ29vZ2xlIGFuZCBnZXQgdGhlIGZpcnN0IHJlc3VsdC4uLiBhdXRvY29tcGxldGU/XG4gIH0pO1xuXG4gICQod2luZG93KS5vbihcImhhc2hjaGFuZ2VcIiwgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgIGlmIChoYXNoLmxlbmd0aCA9PSAwKSByZXR1cm47XG4gICAgY29uc3QgcGFyYW1ldGVycyA9ICQuZGVwYXJhbShoYXNoLnN1YnN0cmluZygxKSk7XG4gICAgY29uc3Qgb2xkVVJMID0gZXZlbnQub3JpZ2luYWxFdmVudC5vbGRVUkw7XG4gICAgY29uc3Qgb2xkSGFzaCA9ICQuZGVwYXJhbShvbGRVUkwuc3Vic3RyaW5nKG9sZFVSTC5zZWFyY2goXCIjXCIpKzEpKTtcblxuICAgIC8vICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXInLCBwYXJhbWV0ZXJzKTtcbiAgICAvLyAvLyBTbyB0aGF0IGNoYW5nZSBpbiBmaWx0ZXJzIHdpbGwgbm90IHVwZGF0ZSB0aGlzXG4gICAgLy8gaWYgKG9sZEhhc2guYm91bmQxICE9PSBwYXJhbWV0ZXJzLmJvdW5kMSB8fCBvbGRIYXNoLmJvdW5kMiAhPT0gcGFyYW1ldGVycy5ib3VuZDIpIHtcbiAgICAvLyAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXInLCBwYXJhbWV0ZXJzKTtcbiAgICAvLyB9XG5cbiAgICBpZiAob2xkSGFzaC5sb2MgIT09IHBhcmFtZXRlcnMubG9jKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG5cbiAgICAvLyBDaGFuZ2UgaXRlbXNcbiAgICBpZiAob2xkSGFzaC5sYW5nICE9PSBwYXJhbWV0ZXJzLmxhbmcpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgfVxuICB9KVxuXG4gIC8vIDQuIGZpbHRlciBvdXQgaXRlbXMgaW4gYWN0aXZpdHktYXJlYVxuXG4gIC8vIDUuIGdldCBtYXAgZWxlbWVudHNcblxuICAvLyA2LiBnZXQgR3JvdXAgZGF0YVxuXG4gIC8vIDcuIHByZXNlbnQgZ3JvdXAgZWxlbWVudHNcblxuICAkLndoZW4oKCk9Pnt9KVxuICAgIC50aGVuKCgpID0+e1xuICAgICAgcmV0dXJuIGxhbmd1YWdlTWFuYWdlci5pbml0aWFsaXplKGluaXRQYXJhbXNbJ2xhbmcnXSB8fCAnZW4nKTtcbiAgICB9KVxuICAgIC5kb25lKChkYXRhKSA9PiB7fSlcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICAkLmFqYXgoe1xuICAgICAgICAgIHVybDogJ2h0dHBzOi8vbmV3LW1hcC4zNTAub3JnL291dHB1dC8zNTBvcmctd2l0aC1hbm5vdGF0aW9uLmpzLmd6JywgLy8nfCoqREFUQV9TT1VSQ0UqKnwnLFxuICAgICAgICAgIC8vIHVybDogJy9kYXRhL3Rlc3QuanMnLCAvLyd8KipEQVRBX1NPVVJDRSoqfCcsXG4gICAgICAgICAgZGF0YVR5cGU6ICdzY3JpcHQnLFxuICAgICAgICAgIGNhY2hlOiB0cnVlLFxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICAvLyB3aW5kb3cuRVZFTlRTX0RBVEEgPSBkYXRhO1xuICAgICAgICAgICAgLy9KdW5lIDE0LCAyMDE4IOKAkyBDaGFuZ2VzXG5cbiAgICAgICAgICAgIGlmKHdpbmRvdy5xdWVyaWVzLmdyb3VwKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHRhcmdldF9ncm91cCA9IGRlY29kZVVSSUNvbXBvbmVudCh3aW5kb3cucXVlcmllcy5ncm91cCk7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRhcmdldF9ncm91cCk7XG4gICAgICAgICAgICAgIHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhID0gd2luZG93LkVWRU5UU19EQVRBLmRhdGEuZmlsdGVyKChpKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGkuY2FtcGFpZ24gPT0gdGFyZ2V0X2dyb3VwIHx8IGkuc3VwZXJncm91cCA9PSB0YXJnZXRfZ3JvdXA7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL0xvYWQgZ3JvdXBzXG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxvYWQtZ3JvdXBzJywgeyBncm91cHM6IHdpbmRvdy5FVkVOVFNfREFUQS5ncm91cHMgfSk7XG5cblxuICAgICAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuXG4gICAgICAgICAgICB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgIGl0ZW1bJ2V2ZW50X3R5cGUnXSA9IGl0ZW0uZXZlbnRfdHlwZSAhPT0gJ2dyb3VwJyA/ICdldmVudHMnIDogaXRlbS5ldmVudF90eXBlOyAvLyFpdGVtLmV2ZW50X3R5cGUgPyAnRXZlbnQnIDogaXRlbS5ldmVudF90eXBlO1xuXG4gICAgICAgICAgICAgIGlmIChpdGVtLnN0YXJ0X2RhdGV0aW1lICYmICFpdGVtLnN0YXJ0X2RhdGV0aW1lLm1hdGNoKC9aJC8pKSB7XG4gICAgICAgICAgICAgICAgaXRlbS5zdGFydF9kYXRldGltZSA9IGl0ZW0uc3RhcnRfZGF0ZXRpbWUgKyBcIlpcIjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgIC8vICAgcmV0dXJuIG5ldyBEYXRlKGEuc3RhcnRfZGF0ZXRpbWUpIC0gbmV3IERhdGUoYi5zdGFydF9kYXRldGltZSk7XG4gICAgICAgICAgICAvLyB9KVxuXG5cbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC11cGRhdGUnLCB7IHBhcmFtczogcGFyYW1ldGVycyB9KTtcbiAgICAgICAgICAgIC8vICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1wbG90Jywge1xuICAgICAgICAgICAgICAgIGRhdGE6IHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhLFxuICAgICAgICAgICAgICAgIHBhcmFtczogcGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgICBncm91cHM6IHdpbmRvdy5FVkVOVFNfREFUQS5ncm91cHMucmVkdWNlKChkaWN0LCBpdGVtKT0+eyBkaWN0W2l0ZW0uc3VwZXJncm91cF0gPSBpdGVtOyByZXR1cm4gZGljdDsgfSwge30pXG4gICAgICAgICAgICB9KTtcbiAgICAgIC8vIH0pO1xuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgIC8vVE9ETzogTWFrZSB0aGUgZ2VvanNvbiBjb252ZXJzaW9uIGhhcHBlbiBvbiB0aGUgYmFja2VuZFxuXG4gICAgICAgICAgICAvL1JlZnJlc2ggdGhpbmdzXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgbGV0IHAgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuXG4gICAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHApO1xuICAgICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCBwKTtcblxuICAgICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyJywgcCk7XG5cbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG5cblxufSkoalF1ZXJ5KTtcbiJdfQ==
