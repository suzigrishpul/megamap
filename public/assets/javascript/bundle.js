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

    var renderEvent = function renderEvent(item) {
      var referrer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      var m = moment(new Date(item.start_datetime));
      m = m.utc().subtract(m.utcOffset(), 'm');
      var date = m.format("dddd MMM DD, h:mma");
      var url = item.url.match(/^https{0,1}:/) ? item.url : "//" + item.url;
      // let superGroup = window.slugify(item.supergroup);
      url = Helper.refSource(url, referrer, source);

      return '\n      <li class=\'' + window.slugify(item.event_type) + ' events event-obj\' data-lat=\'' + item.lat + '\' data-lng=\'' + item.lng + '\'>\n        <div class="type-event type-action">\n          <ul class="event-types-list">\n            <li class=\'tag-' + item.event_type + ' tag\'>' + item.event_type + '</li>\n          </ul>\n          <h2 class="event-title"><a href="' + url + '" target=\'_blank\'>' + item.title + '</a></h2>\n          <div class="event-date date">' + date + '</div>\n          <div class="event-address address-area">\n            <p>' + item.venue + '</p>\n          </div>\n          <div class="call-to-action">\n            <a href="' + url + '" target=\'_blank\' class="btn btn-secondary">RSVP</a>\n          </div>\n        </div>\n      </li>\n      ';
    };

    var renderGroup = function renderGroup(item) {
      var referrer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      var url = item.website.match(/^https{0,1}:/) ? item.website : "//" + item.website;
      var superGroup = window.slugify(item.supergroup);

      url = Helper.refSource(url, referrer, source);

      return '\n      <li class=\'' + item.event_type + ' ' + superGroup + ' group-obj\' data-lat=\'' + item.lat + '\' data-lng=\'' + item.lng + '\'>\n        <div class="type-group group-obj">\n          <ul class="event-types-list">\n            <li class="tag tag-' + item.supergroup + '">' + item.supergroup + '</li>\n          </ul>\n          <h2><a href="' + url + '" target=\'_blank\'>' + item.name + '</a></h2>\n          <div class="group-details-area">\n            <div class="group-location location">' + item.location + '</div>\n            <div class="group-description">\n              <p>' + item.description + '</p>\n            </div>\n          </div>\n          <div class="call-to-action">\n            <a href="' + url + '" target=\'_blank\' class="btn btn-secondary">Get Involved</a>\n          </div>\n        </div>\n      </li>\n      ';
    };

    return {
      $list: $target,
      updateFilter: function updateFilter(p) {
        if (!p) return;

        // Remove Filters

        $target.removeProp("class");
        $target.addClass(p.filter ? p.filter.join(" ") : '');

        $target.find('li').hide();

        if (p.filter) {
          p.filter.forEach(function (fil) {
            $target.find('li.' + fil).show();
          });
        }
      },
      updateBounds: function updateBounds(bound1, bound2) {

        // const bounds = [p.bounds1, p.bounds2];


        $target.find('ul li.event-obj, ul li.group-obj').each(function (ind, item) {

          var _lat = $(item).data('lat'),
              _lng = $(item).data('lng');

          var mi10 = 0.1449;

          if (bound1[0] <= _lat && bound2[0] >= _lat && bound1[1] <= _lng && bound2[1] >= _lng) {

            $(item).addClass('within-bound');
          } else {
            $(item).removeClass('within-bound');
          }
        });

        var _visible = $target.find('ul li.event-obj.within-bound, ul li.group-obj.within-bound').length;
        if (_visible == 0) {
          // The list is empty
          $target.addClass("is-empty");
        } else {
          $target.removeClass("is-empty");
        }
      },
      populateList: function populateList(hardFilters) {
        //using window.EVENT_DATA
        var keySet = !hardFilters.key ? [] : hardFilters.key.split(',');

        var $eventList = window.EVENTS_DATA.data.map(function (item) {
          if (keySet.length == 0) {
            return item.event_type && item.event_type.toLowerCase() == 'group' ? renderGroup(item) : renderEvent(item, referrer, source);
          } else if (keySet.length > 0 && item.event_type != 'group' && keySet.includes(item.event_type)) {
            return renderEvent(item, referrer, source);
          } else if (keySet.length > 0 && item.event_type == 'group' && keySet.includes(item.supergroup)) {
            return renderGroup(item, referrer, source);
          }

          return null;
        });
        $target.find('ul li').remove();
        $target.find('ul').append($eventList);
      }
    };
  };
}(jQuery);
'use strict';

var MapManager = function ($) {
  var LANGUAGE = 'en';

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

  return function (options) {
    var accessToken = 'pk.eyJ1IjoibWF0dGhldzM1MCIsImEiOiJaTVFMUkUwIn0.wcM3Xc8BGC6PM-Oyrwjnhg';
    var map = L.map('map', { dragging: !L.Browser.mobile }).setView([34.88593094075317, 5.097656250000001], 2);

    var referrer = options.referrer,
        source = options.source;


    if (!L.Browser.mobile) {
      map.scrollWheelZoom.disable();
    }

    LANGUAGE = options.lang || 'en';

    if (options.onMove) {
      map.on('dragend', function (event) {

        var sw = [map.getBounds()._southWest.lat, map.getBounds()._southWest.lng];
        var ne = [map.getBounds()._northEast.lat, map.getBounds()._northEast.lng];
        options.onMove(sw, ne);
      }).on('zoomend', function (event) {
        if (map.getZoom() <= 4) {
          $("#map").addClass("zoomed-out");
        } else {
          $("#map").removeClass("zoomed-out");
        }

        var sw = [map.getBounds()._southWest.lat, map.getBounds()._southWest.lng];
        var ne = [map.getBounds()._northEast.lat, map.getBounds()._northEast.lng];
        options.onMove(sw, ne);
      });
    }

    // map.fireEvent('zoomend');

    L.tileLayer('https://api.mapbox.com/styles/v1/matthew350/cja41tijk27d62rqod7g0lx4b/tiles/256/{z}/{x}/{y}?access_token=' + accessToken, {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors • <a href="//350.org">350.org</a>'
    }).addTo(map);

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

        var bounds = [bounds1, bounds2];
        map.fitBounds(bounds, { animate: false });
      },
      setCenter: function setCenter(center) {
        var zoom = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

        if (!center || !center[0] || center[0] == "" || !center[1] || center[1] == "") return;
        map.setView(center, zoom);
      },
      getBounds: function getBounds() {

        var sw = [map.getBounds()._southWest.lat, map.getBounds()._southWest.lng];
        var ne = [map.getBounds()._northEast.lat, map.getBounds()._northEast.lng];

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
        map.fireEvent('zoomend');
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
        map.invalidateSize(false);
        // map._onResize();
        // map.fireEvent('zoomend');

      },
      filterMap: function filterMap(filters) {

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

            // const isPast = new Date(feature.properties.eventProperties.start_datetime) < new Date();
            // const eventType = feature.properties.eventProperties.event_type;
          }
        });

        eventsLayer.addTo(map);
        // eventsLayer.bringToBack();


        // Add Annotations
        if (window.queries.annotation) {
          var annotations = !window.EVENTS_DATA.annotations ? [] : window.EVENTS_DATA.annotations.filter(function (item) {
            return item.type === window.queries.annotation;
          });

          var annotationGeoJson = {
            type: "FeatureCollection",
            features: renderAnnotationsGeoJson(annotations)
          };

          var annotLayer = L.geoJSON(annotationGeoJson, {
            pointToLayer: function pointToLayer(feature, latlng) {
              var iconUrl = "/img/annotation.png";

              var smallIcon = L.icon({
                iconUrl: iconUrl,
                iconSize: [50, 50],
                iconAnchor: [25, 25],
                className: 'annotation-popup'
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
          // annotLayer.bringToFront();
          annotLayer.addTo(map);
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
        "full-map": window.queries['full-map']
      };
    }
  } catch (e) {
    console.log("Error: ", e);
  }

  if (window.queries['full-map']) {
    if ($(window).width() < 600) {
      // $("#events-list-container").hide();
      $("body").addClass("map-view");
      $(".filter-area").hide();
      $("section#map").css("height", "calc(100% - 64px)");
    } else {
      $("#events-list-container").hide();
    }
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

  $(document).on('trigger-list-filter-by-bound', function (event, options) {
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

    listManager.updateBounds(bound1, bound2);
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

    setTimeout(function () {
      mapManager.triggerZoomEnd();
    }, 10);
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

    if (opt) {

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

    $(document).trigger('trigger-list-filter-update', parameters);
    $(document).trigger('trigger-map-filter', parameters);
    $(document).trigger('trigger-update-embed', parameters);

    // So that change in filters will not update this
    if (oldHash.bound1 !== parameters.bound1 || oldHash.bound2 !== parameters.bound2) {
      $(document).trigger('trigger-list-filter-by-bound', parameters);
    }

    if (oldHash.log !== parameters.loc) {
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
      url: 'https://new-map.350.org/output/350org-new-layout.js.gz', //'|**DATA_SOURCE**|',
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
          item['event_type'] = !item.event_type ? 'Action' : item.event_type;

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

          $(document).trigger('trigger-list-filter-update', p);
          $(document).trigger('trigger-list-filter-by-bound', p);
        }, 100);
      }
    });
  });
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9oZWxwZXIuanMiLCJjbGFzc2VzL2xhbmd1YWdlLmpzIiwiY2xhc3Nlcy9saXN0LmpzIiwiY2xhc3Nlcy9tYXAuanMiLCJjbGFzc2VzL3F1ZXJ5LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIkF1dG9jb21wbGV0ZU1hbmFnZXIiLCIkIiwidGFyZ2V0IiwiQVBJX0tFWSIsInRhcmdldEl0ZW0iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJxdWVyeU1nciIsIlF1ZXJ5TWFuYWdlciIsImdlb2NvZGVyIiwiZ29vZ2xlIiwibWFwcyIsIkdlb2NvZGVyIiwiJHRhcmdldCIsImZvcmNlU2VhcmNoIiwicSIsImdlb2NvZGUiLCJhZGRyZXNzIiwicmVzdWx0cyIsInN0YXR1cyIsImdlb21ldHJ5IiwidXBkYXRlVmlld3BvcnQiLCJ2aWV3cG9ydCIsInZhbCIsImZvcm1hdHRlZF9hZGRyZXNzIiwiaW5pdGlhbGl6ZSIsInR5cGVhaGVhZCIsImhpbnQiLCJoaWdobGlnaHQiLCJtaW5MZW5ndGgiLCJjbGFzc05hbWVzIiwibWVudSIsIm5hbWUiLCJkaXNwbGF5IiwiaXRlbSIsImxpbWl0Iiwic291cmNlIiwic3luYyIsImFzeW5jIiwib24iLCJvYmoiLCJkYXR1bSIsImpRdWVyeSIsIkhlbHBlciIsInJlZlNvdXJjZSIsInVybCIsInJlZiIsInNyYyIsImluZGV4T2YiLCJMYW5ndWFnZU1hbmFnZXIiLCJsYW5ndWFnZSIsImRpY3Rpb25hcnkiLCIkdGFyZ2V0cyIsInVwZGF0ZVBhZ2VMYW5ndWFnZSIsInRhcmdldExhbmd1YWdlIiwicm93cyIsImZpbHRlciIsImkiLCJsYW5nIiwiZWFjaCIsImluZGV4IiwidGFyZ2V0QXR0cmlidXRlIiwiZGF0YSIsImxhbmdUYXJnZXQiLCJ0ZXh0IiwiYXR0ciIsInRhcmdldHMiLCJhamF4IiwiZGF0YVR5cGUiLCJzdWNjZXNzIiwidHJpZ2dlciIsIm11bHRpc2VsZWN0IiwicmVmcmVzaCIsInVwZGF0ZUxhbmd1YWdlIiwiZ2V0VHJhbnNsYXRpb24iLCJrZXkiLCJMaXN0TWFuYWdlciIsIm9wdGlvbnMiLCJ0YXJnZXRMaXN0IiwicmVmZXJyZXIiLCJyZW5kZXJFdmVudCIsIm0iLCJtb21lbnQiLCJEYXRlIiwic3RhcnRfZGF0ZXRpbWUiLCJ1dGMiLCJzdWJ0cmFjdCIsInV0Y09mZnNldCIsImRhdGUiLCJmb3JtYXQiLCJtYXRjaCIsIndpbmRvdyIsInNsdWdpZnkiLCJldmVudF90eXBlIiwibGF0IiwibG5nIiwidGl0bGUiLCJ2ZW51ZSIsInJlbmRlckdyb3VwIiwid2Vic2l0ZSIsInN1cGVyR3JvdXAiLCJzdXBlcmdyb3VwIiwibG9jYXRpb24iLCJkZXNjcmlwdGlvbiIsIiRsaXN0IiwidXBkYXRlRmlsdGVyIiwicCIsInJlbW92ZVByb3AiLCJhZGRDbGFzcyIsImpvaW4iLCJmaW5kIiwiaGlkZSIsImZvckVhY2giLCJmaWwiLCJzaG93IiwidXBkYXRlQm91bmRzIiwiYm91bmQxIiwiYm91bmQyIiwiaW5kIiwiX2xhdCIsIl9sbmciLCJtaTEwIiwicmVtb3ZlQ2xhc3MiLCJfdmlzaWJsZSIsImxlbmd0aCIsInBvcHVsYXRlTGlzdCIsImhhcmRGaWx0ZXJzIiwia2V5U2V0Iiwic3BsaXQiLCIkZXZlbnRMaXN0IiwiRVZFTlRTX0RBVEEiLCJtYXAiLCJ0b0xvd2VyQ2FzZSIsImluY2x1ZGVzIiwicmVtb3ZlIiwiYXBwZW5kIiwiTWFwTWFuYWdlciIsIkxBTkdVQUdFIiwicmVuZGVyQW5ub3RhdGlvblBvcHVwIiwicmVuZGVyQW5ub3RhdGlvbnNHZW9Kc29uIiwibGlzdCIsInJlbmRlcmVkIiwidHlwZSIsImNvb3JkaW5hdGVzIiwicHJvcGVydGllcyIsImFubm90YXRpb25Qcm9wcyIsInBvcHVwQ29udGVudCIsInJlbmRlckdlb2pzb24iLCJpc05hTiIsInBhcnNlRmxvYXQiLCJzdWJzdHJpbmciLCJldmVudFByb3BlcnRpZXMiLCJhY2Nlc3NUb2tlbiIsIkwiLCJkcmFnZ2luZyIsIkJyb3dzZXIiLCJtb2JpbGUiLCJzZXRWaWV3Iiwic2Nyb2xsV2hlZWxab29tIiwiZGlzYWJsZSIsIm9uTW92ZSIsImV2ZW50Iiwic3ciLCJnZXRCb3VuZHMiLCJfc291dGhXZXN0IiwibmUiLCJfbm9ydGhFYXN0IiwiZ2V0Wm9vbSIsInRpbGVMYXllciIsImF0dHJpYnV0aW9uIiwiYWRkVG8iLCJxdWVyaWVzIiwidGVybWluYXRvciIsIiRtYXAiLCJjYWxsYmFjayIsInNldEJvdW5kcyIsImJvdW5kczEiLCJib3VuZHMyIiwiYm91bmRzIiwiZml0Qm91bmRzIiwiYW5pbWF0ZSIsInNldENlbnRlciIsImNlbnRlciIsInpvb20iLCJnZXRDZW50ZXJCeUxvY2F0aW9uIiwidHJpZ2dlclpvb21FbmQiLCJmaXJlRXZlbnQiLCJ6b29tT3V0T25jZSIsInpvb21PdXQiLCJ6b29tVW50aWxIaXQiLCIkdGhpcyIsImludGVydmFsSGFuZGxlciIsInNldEludGVydmFsIiwiY2xlYXJJbnRlcnZhbCIsInJlZnJlc2hNYXAiLCJpbnZhbGlkYXRlU2l6ZSIsImZpbHRlck1hcCIsImZpbHRlcnMiLCJwbG90UG9pbnRzIiwiZ3JvdXBzIiwiZ2VvanNvbiIsImZlYXR1cmVzIiwiZXZlbnRzTGF5ZXIiLCJnZW9KU09OIiwicG9pbnRUb0xheWVyIiwiZmVhdHVyZSIsImxhdGxuZyIsImV2ZW50VHlwZSIsInNsdWdnZWQiLCJpY29uVXJsIiwiaXNQYXN0IiwiaWNvbnVybCIsInNtYWxsSWNvbiIsImljb24iLCJpY29uU2l6ZSIsImljb25BbmNob3IiLCJjbGFzc05hbWUiLCJnZW9qc29uTWFya2VyT3B0aW9ucyIsIm1hcmtlciIsIm9uRWFjaEZlYXR1cmUiLCJsYXllciIsImJpbmRQb3B1cCIsImFubm90YXRpb24iLCJhbm5vdGF0aW9ucyIsImFubm90YXRpb25HZW9Kc29uIiwiYW5ub3RMYXllciIsInVwZGF0ZSIsImxhdExuZyIsInRhcmdldEZvcm0iLCJwcmV2aW91cyIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImZvcm0iLCJkZXBhcmFtIiwic2VyaWFsaXplIiwiaGFzaCIsInBhcmFtIiwicGFyYW1zIiwibG9jIiwicHJvcCIsImdldFBhcmFtZXRlcnMiLCJwYXJhbWV0ZXJzIiwidXBkYXRlTG9jYXRpb24iLCJNYXRoIiwiYWJzIiwiZiIsImIiLCJmQXZnIiwiYkF2ZyIsIkpTT04iLCJzdHJpbmdpZnkiLCJ1cGRhdGVWaWV3cG9ydEJ5Qm91bmQiLCJ0cmlnZ2VyU3VibWl0IiwiYXV0b2NvbXBsZXRlTWFuYWdlciIsIm1hcE1hbmFnZXIiLCJERUZBVUxUX0lDT04iLCJ0b1N0cmluZyIsInJlcGxhY2UiLCJnZXRRdWVyeVN0cmluZyIsInF1ZXJ5U3RyaW5nS2V5VmFsdWUiLCJwYXJlbnQiLCJzZWFyY2giLCJxc0pzb25PYmplY3QiLCJncm91cCIsImNvbnNvbGUiLCJsb2ciLCJ3aWR0aCIsImNzcyIsImJ1aWxkRmlsdGVycyIsImVuYWJsZUhUTUwiLCJ0ZW1wbGF0ZXMiLCJidXR0b24iLCJsaSIsImRyb3BSaWdodCIsIm9uSW5pdGlhbGl6ZWQiLCJvbkRyb3Bkb3duU2hvdyIsInNldFRpbWVvdXQiLCJvbkRyb3Bkb3duSGlkZSIsIm9wdGlvbkxhYmVsIiwidW5lc2NhcGUiLCJodG1sIiwib3B0aW9uQ2xhc3MiLCJzZWxlY3RlZENsYXNzIiwiYnV0dG9uQ2xhc3MiLCJvbkNoYW5nZSIsIm9wdGlvbiIsImNoZWNrZWQiLCJzZWxlY3QiLCJxdWVyeU1hbmFnZXIiLCJpbml0UGFyYW1zIiwibGFuZ3VhZ2VNYW5hZ2VyIiwibGlzdE1hbmFnZXIiLCJpbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2siLCJyZXN1bHQiLCJoZWlnaHQiLCJwYXJzZSIsImNvcHkiLCJjb3B5VGV4dCIsImdldEVsZW1lbnRCeUlkIiwiZXhlY0NvbW1hbmQiLCJvcHQiLCJlbXB0eSIsInZhbHVlVGV4dCIsInRyYW5zbGF0aW9uIiwidG9nZ2xlQ2xhc3MiLCJrZXlDb2RlIiwiX3F1ZXJ5Iiwib2xkVVJMIiwib3JpZ2luYWxFdmVudCIsIm9sZEhhc2giLCJ3aGVuIiwidGhlbiIsImRvbmUiLCJjYWNoZSIsImNhbXBhaWduIiwicmVkdWNlIiwiZGljdCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7QUFDQSxJQUFNQSxzQkFBdUIsVUFBU0MsQ0FBVCxFQUFZO0FBQ3ZDOztBQUVBLFNBQU8sVUFBQ0MsTUFBRCxFQUFZOztBQUVqQixRQUFNQyxVQUFVLHlDQUFoQjtBQUNBLFFBQU1DLGFBQWEsT0FBT0YsTUFBUCxJQUFpQixRQUFqQixHQUE0QkcsU0FBU0MsYUFBVCxDQUF1QkosTUFBdkIsQ0FBNUIsR0FBNkRBLE1BQWhGO0FBQ0EsUUFBTUssV0FBV0MsY0FBakI7QUFDQSxRQUFJQyxXQUFXLElBQUlDLE9BQU9DLElBQVAsQ0FBWUMsUUFBaEIsRUFBZjs7QUFFQSxXQUFPO0FBQ0xDLGVBQVNaLEVBQUVHLFVBQUYsQ0FESjtBQUVMRixjQUFRRSxVQUZIO0FBR0xVLG1CQUFhLHFCQUFDQyxDQUFELEVBQU87QUFDbEJOLGlCQUFTTyxPQUFULENBQWlCLEVBQUVDLFNBQVNGLENBQVgsRUFBakIsRUFBaUMsVUFBVUcsT0FBVixFQUFtQkMsTUFBbkIsRUFBMkI7QUFDMUQsY0FBSUQsUUFBUSxDQUFSLENBQUosRUFBZ0I7QUFDZCxnQkFBSUUsV0FBV0YsUUFBUSxDQUFSLEVBQVdFLFFBQTFCO0FBQ0FiLHFCQUFTYyxjQUFULENBQXdCRCxTQUFTRSxRQUFqQztBQUNBckIsY0FBRUcsVUFBRixFQUFjbUIsR0FBZCxDQUFrQkwsUUFBUSxDQUFSLEVBQVdNLGlCQUE3QjtBQUNEO0FBQ0Q7QUFDQTtBQUVELFNBVEQ7QUFVRCxPQWRJO0FBZUxDLGtCQUFZLHNCQUFNO0FBQ2hCeEIsVUFBRUcsVUFBRixFQUFjc0IsU0FBZCxDQUF3QjtBQUNaQyxnQkFBTSxJQURNO0FBRVpDLHFCQUFXLElBRkM7QUFHWkMscUJBQVcsQ0FIQztBQUlaQyxzQkFBWTtBQUNWQyxrQkFBTTtBQURJO0FBSkEsU0FBeEIsRUFRVTtBQUNFQyxnQkFBTSxnQkFEUjtBQUVFQyxtQkFBUyxpQkFB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OEIsT0FBTzBSLElBQVA7QUFBYyxXQUE3RixFQUErRixFQUEvRjtBQUg0QixTQUF4QztBQUtOO0FBQ00zVCxVQUFFSSxRQUFGLEVBQVlpRSxPQUFaLENBQW9CLHNCQUFwQixFQUE0QzJLLFVBQTVDO0FBQ0E7O0FBRUE7QUFDQW1DLG1CQUFXLFlBQU07QUFDZixjQUFJMUssSUFBSXNMLGFBQWFoRCxhQUFiLEVBQVI7O0FBRUEvTyxZQUFFSSxRQUFGLEVBQVlpRSxPQUFaLENBQW9CLG9CQUFwQixFQUEwQ29DLENBQTFDO0FBQ0F6RyxZQUFFSSxRQUFGLEVBQVlpRSxPQUFaLENBQW9CLG9CQUFwQixFQUEwQ29DLENBQTFDOztBQUVBekcsWUFBRUksUUFBRixFQUFZaUUsT0FBWixDQUFvQiw0QkFBcEIsRUFBa0RvQyxDQUFsRDtBQUNBekcsWUFBRUksUUFBRixFQUFZaUUsT0FBWixDQUFvQiw4QkFBcEIsRUFBb0RvQyxDQUFwRDtBQUVELFNBVEQsRUFTRyxHQVRIO0FBVUQ7QUF2REUsS0FBUDtBQXlEQyxHQS9ETDtBQW1FRCxDQTFhRCxFQTBhR2hFLE1BMWFIIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuLy9BUEkgOkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVxuY29uc3QgQXV0b2NvbXBsZXRlTWFuYWdlciA9IChmdW5jdGlvbigkKSB7XG4gIC8vSW5pdGlhbGl6YXRpb24uLi5cblxuICByZXR1cm4gKHRhcmdldCkgPT4ge1xuXG4gICAgY29uc3QgQVBJX0tFWSA9IFwiQUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXCI7XG4gICAgY29uc3QgdGFyZ2V0SXRlbSA9IHR5cGVvZiB0YXJnZXQgPT0gXCJzdHJpbmdcIiA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KSA6IHRhcmdldDtcbiAgICBjb25zdCBxdWVyeU1nciA9IFF1ZXJ5TWFuYWdlcigpO1xuICAgIHZhciBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICR0YXJnZXQ6ICQodGFyZ2V0SXRlbSksXG4gICAgICB0YXJnZXQ6IHRhcmdldEl0ZW0sXG4gICAgICBmb3JjZVNlYXJjaDogKHEpID0+IHtcbiAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IHEgfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuICAgICAgICAgIGlmIChyZXN1bHRzWzBdKSB7XG4gICAgICAgICAgICBsZXQgZ2VvbWV0cnkgPSByZXN1bHRzWzBdLmdlb21ldHJ5O1xuICAgICAgICAgICAgcXVlcnlNZ3IudXBkYXRlVmlld3BvcnQoZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgJCh0YXJnZXRJdGVtKS52YWwocmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHZhciBnZW9tZXRyeSA9IGRhdHVtLmdlb21ldHJ5O1xuICAgICAgICAgIC8vIHF1ZXJ5TWdyLnVwZGF0ZVZpZXdwb3J0KGdlb21ldHJ5LnZpZXdwb3J0KTtcblxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBpbml0aWFsaXplOiAoKSA9PiB7XG4gICAgICAgICQodGFyZ2V0SXRlbSkudHlwZWFoZWFkKHtcbiAgICAgICAgICAgICAgICAgICAgaGludDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBtaW5MZW5ndGg6IDQsXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICBtZW51OiAndHQtZHJvcGRvd24tbWVudSdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3NlYXJjaC1yZXN1bHRzJyxcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogKGl0ZW0pID0+IGl0ZW0uZm9ybWF0dGVkX2FkZHJlc3MsXG4gICAgICAgICAgICAgICAgICAgIGxpbWl0OiAxMCxcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiBmdW5jdGlvbiAocSwgc3luYywgYXN5bmMpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IHEgfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBhc3luYyhyZXN1bHRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKS5vbigndHlwZWFoZWFkOnNlbGVjdGVkJywgZnVuY3Rpb24gKG9iaiwgZGF0dW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoZGF0dW0pXG4gICAgICAgICAgICAgICAgICAgIHtcblxuICAgICAgICAgICAgICAgICAgICAgIHZhciBnZW9tZXRyeSA9IGRhdHVtLmdlb21ldHJ5O1xuICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5TWdyLnVwZGF0ZVZpZXdwb3J0KGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICAgICAgICAgICAvLyAgbWFwLmZpdEJvdW5kcyhnZW9tZXRyeS5ib3VuZHM/IGdlb21ldHJ5LmJvdW5kcyA6IGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuXG5cbiAgICByZXR1cm4ge1xuXG4gICAgfVxuICB9XG5cbn0oalF1ZXJ5KSk7XG4iLCJjb25zdCBIZWxwZXIgPSAoKCQpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVmU291cmNlOiAodXJsLCByZWYsIHNyYykgPT4ge1xuICAgICAgICAvLyBKdW4gMTMgMjAxOCDigJQgRml4IGZvciBzb3VyY2UgYW5kIHJlZmVycmVyXG4gICAgICAgIGlmIChyZWYgfHwgc3JjKSB7XG4gICAgICAgICAgaWYgKHVybC5pbmRleE9mKFwiP1wiKSA+PSAwKSB7XG4gICAgICAgICAgICB1cmwgPSBgJHt1cmx9JnJlZmVycmVyPSR7cmVmfHxcIlwifSZzb3VyY2U9JHtzcmN8fFwiXCJ9YDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXJsID0gYCR7dXJsfT9yZWZlcnJlcj0ke3JlZnx8XCJcIn0mc291cmNlPSR7c3JjfHxcIlwifWA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgIH1cbiAgICB9O1xufSkoalF1ZXJ5KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTGFuZ3VhZ2VNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIC8va2V5VmFsdWVcblxuICAvL3RhcmdldHMgYXJlIHRoZSBtYXBwaW5ncyBmb3IgdGhlIGxhbmd1YWdlXG4gIHJldHVybiAoKSA9PiB7XG4gICAgbGV0IGxhbmd1YWdlO1xuICAgIGxldCBkaWN0aW9uYXJ5ID0ge307XG4gICAgbGV0ICR0YXJnZXRzID0gJChcIltkYXRhLWxhbmctdGFyZ2V0XVtkYXRhLWxhbmcta2V5XVwiKTtcblxuICAgIGNvbnN0IHVwZGF0ZVBhZ2VMYW5ndWFnZSA9ICgpID0+IHtcblxuICAgICAgbGV0IHRhcmdldExhbmd1YWdlID0gZGljdGlvbmFyeS5yb3dzLmZpbHRlcigoaSkgPT4gaS5sYW5nID09PSBsYW5ndWFnZSlbMF07XG5cbiAgICAgICR0YXJnZXRzLmVhY2goKGluZGV4LCBpdGVtKSA9PiB7XG5cbiAgICAgICAgbGV0IHRhcmdldEF0dHJpYnV0ZSA9ICQoaXRlbSkuZGF0YSgnbGFuZy10YXJnZXQnKTtcbiAgICAgICAgbGV0IGxhbmdUYXJnZXQgPSAkKGl0ZW0pLmRhdGEoJ2xhbmcta2V5Jyk7XG5cblxuXG5cbiAgICAgICAgc3dpdGNoKHRhcmdldEF0dHJpYnV0ZSkge1xuICAgICAgICAgIGNhc2UgJ3RleHQnOlxuXG4gICAgICAgICAgICAkKChgW2RhdGEtbGFuZy1rZXk9XCIke2xhbmdUYXJnZXR9XCJdYCkpLnRleHQodGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgaWYgKGxhbmdUYXJnZXQgPT0gXCJtb3JlLXNlYXJjaC1vcHRpb25zXCIpIHtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAndmFsdWUnOlxuICAgICAgICAgICAgJChpdGVtKS52YWwodGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICQoaXRlbSkuYXR0cih0YXJnZXRBdHRyaWJ1dGUsIHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgbGFuZ3VhZ2UsXG4gICAgICB0YXJnZXRzOiAkdGFyZ2V0cyxcbiAgICAgIGRpY3Rpb25hcnksXG4gICAgICBpbml0aWFsaXplOiAobGFuZykgPT4ge1xuXG4gICAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICAgIC8vIHVybDogJ2h0dHBzOi8vZ3N4Mmpzb24uY29tL2FwaT9pZD0xTzNlQnlqTDF2bFlmN1o3YW0tX2h0UlRRaTczUGFmcUlmTkJkTG1YZThTTSZzaGVldD0xJyxcbiAgICAgICAgICB1cmw6ICcvZGF0YS9sYW5nLmpzb24nLFxuICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgc3VjY2VzczogKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGRpY3Rpb25hcnkgPSBkYXRhO1xuICAgICAgICAgICAgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgICAgICAgICAgdXBkYXRlUGFnZUxhbmd1YWdlKCk7XG5cbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtbG9hZGVkJyk7XG5cbiAgICAgICAgICAgICQoXCIjbGFuZ3VhZ2Utb3B0c1wiKS5tdWx0aXNlbGVjdCgnc2VsZWN0JywgbGFuZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICByZWZyZXNoOiAoKSA9PiB7XG4gICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZShsYW5ndWFnZSk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTGFuZ3VhZ2U6IChsYW5nKSA9PiB7XG5cbiAgICAgICAgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UoKTtcbiAgICAgIH0sXG4gICAgICBnZXRUcmFuc2xhdGlvbjogKGtleSkgPT4ge1xuICAgICAgICBsZXQgdGFyZ2V0TGFuZ3VhZ2UgPSBkaWN0aW9uYXJ5LnJvd3MuZmlsdGVyKChpKSA9PiBpLmxhbmcgPT09IGxhbmd1YWdlKVswXTtcbiAgICAgICAgcmV0dXJuIHRhcmdldExhbmd1YWdlW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG59KShqUXVlcnkpO1xuIiwiLyogVGhpcyBsb2FkcyBhbmQgbWFuYWdlcyB0aGUgbGlzdCEgKi9cblxuY29uc3QgTGlzdE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuIChvcHRpb25zKSA9PiB7XG4gICAgbGV0IHRhcmdldExpc3QgPSBvcHRpb25zLnRhcmdldExpc3QgfHwgXCIjZXZlbnRzLWxpc3RcIjtcbiAgICAvLyBKdW5lIDEzIGAxOCDigJMgcmVmZXJyZXIgYW5kIHNvdXJjZVxuICAgIGxldCB7cmVmZXJyZXIsIHNvdXJjZX0gPSBvcHRpb25zO1xuXG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRMaXN0ID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0TGlzdCkgOiB0YXJnZXRMaXN0O1xuXG4gICAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSwgcmVmZXJyZXIgPSBudWxsLCBzb3VyY2UgPSBudWxsKSA9PiB7XG4gICAgICBsZXQgbSA9IG1vbWVudChuZXcgRGF0ZShpdGVtLnN0YXJ0X2RhdGV0aW1lKSk7XG4gICAgICBtID0gbS51dGMoKS5zdWJ0cmFjdChtLnV0Y09mZnNldCgpLCAnbScpO1xuICAgICAgdmFyIGRhdGUgPSBtLmZvcm1hdChcImRkZGQgTU1NIERELCBoOm1tYVwiKTtcbiAgICAgIGxldCB1cmwgPSBpdGVtLnVybC5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLnVybCA6IFwiLy9cIiArIGl0ZW0udXJsO1xuICAgICAgLy8gbGV0IHN1cGVyR3JvdXAgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuICAgICAgdXJsID0gSGVscGVyLnJlZlNvdXJjZSh1cmwsIHJlZmVycmVyLCBzb3VyY2UpO1xuXG4gICAgICByZXR1cm4gYFxuICAgICAgPGxpIGNsYXNzPScke3dpbmRvdy5zbHVnaWZ5KGl0ZW0uZXZlbnRfdHlwZSl9IGV2ZW50cyBldmVudC1vYmonIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnQgdHlwZS1hY3Rpb25cIj5cbiAgICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgICA8bGkgY2xhc3M9J3RhZy0ke2l0ZW0uZXZlbnRfdHlwZX0gdGFnJz4ke2l0ZW0uZXZlbnRfdHlwZX08L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPGgyIGNsYXNzPVwiZXZlbnQtdGl0bGVcIj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZX08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtZGF0ZSBkYXRlXCI+JHtkYXRlfTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1hZGRyZXNzIGFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgICAgPHA+JHtpdGVtLnZlbnVlfTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPlJTVlA8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSwgcmVmZXJyZXIgPSBudWxsLCBzb3VyY2UgPSBudWxsKSA9PiB7XG4gICAgICBsZXQgdXJsID0gaXRlbS53ZWJzaXRlLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0ud2Vic2l0ZSA6IFwiLy9cIiArIGl0ZW0ud2Vic2l0ZTtcbiAgICAgIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcblxuICAgICAgdXJsID0gSGVscGVyLnJlZlNvdXJjZSh1cmwsIHJlZmVycmVyLCBzb3VyY2UpO1xuXG4gICAgICByZXR1cm4gYFxuICAgICAgPGxpIGNsYXNzPScke2l0ZW0uZXZlbnRfdHlwZX0gJHtzdXBlckdyb3VwfSBncm91cC1vYmonIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXAgZ3JvdXAtb2JqXCI+XG4gICAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgICAgPGxpIGNsYXNzPVwidGFnIHRhZy0ke2l0ZW0uc3VwZXJncm91cH1cIj4ke2l0ZW0uc3VwZXJncm91cH08L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPGgyPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLm5hbWV9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWxvY2F0aW9uIGxvY2F0aW9uXCI+JHtpdGVtLmxvY2F0aW9ufTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPkdldCBJbnZvbHZlZDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICAgYFxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgJGxpc3Q6ICR0YXJnZXQsXG4gICAgICB1cGRhdGVGaWx0ZXI6IChwKSA9PiB7XG4gICAgICAgIGlmKCFwKSByZXR1cm47XG5cbiAgICAgICAgLy8gUmVtb3ZlIEZpbHRlcnNcblxuICAgICAgICAkdGFyZ2V0LnJlbW92ZVByb3AoXCJjbGFzc1wiKTtcbiAgICAgICAgJHRhcmdldC5hZGRDbGFzcyhwLmZpbHRlciA/IHAuZmlsdGVyLmpvaW4oXCIgXCIpIDogJycpXG5cbiAgICAgICAgJHRhcmdldC5maW5kKCdsaScpLmhpZGUoKTtcblxuICAgICAgICBpZiAocC5maWx0ZXIpIHtcbiAgICAgICAgICBwLmZpbHRlci5mb3JFYWNoKChmaWwpPT57XG4gICAgICAgICAgICAkdGFyZ2V0LmZpbmQoYGxpLiR7ZmlsfWApLnNob3coKTtcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdXBkYXRlQm91bmRzOiAoYm91bmQxLCBib3VuZDIpID0+IHtcblxuICAgICAgICAvLyBjb25zdCBib3VuZHMgPSBbcC5ib3VuZHMxLCBwLmJvdW5kczJdO1xuXG5cbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCBsaS5ldmVudC1vYmosIHVsIGxpLmdyb3VwLW9iaicpLmVhY2goKGluZCwgaXRlbSk9PiB7XG5cbiAgICAgICAgICBsZXQgX2xhdCA9ICQoaXRlbSkuZGF0YSgnbGF0JyksXG4gICAgICAgICAgICAgIF9sbmcgPSAkKGl0ZW0pLmRhdGEoJ2xuZycpO1xuXG4gICAgICAgICAgY29uc3QgbWkxMCA9IDAuMTQ0OTtcblxuICAgICAgICAgIGlmIChib3VuZDFbMF0gPD0gX2xhdCAmJiBib3VuZDJbMF0gPj0gX2xhdCAmJiBib3VuZDFbMV0gPD0gX2xuZyAmJiBib3VuZDJbMV0gPj0gX2xuZykge1xuXG4gICAgICAgICAgICAkKGl0ZW0pLmFkZENsYXNzKCd3aXRoaW4tYm91bmQnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJChpdGVtKS5yZW1vdmVDbGFzcygnd2l0aGluLWJvdW5kJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgX3Zpc2libGUgPSAkdGFyZ2V0LmZpbmQoJ3VsIGxpLmV2ZW50LW9iai53aXRoaW4tYm91bmQsIHVsIGxpLmdyb3VwLW9iai53aXRoaW4tYm91bmQnKS5sZW5ndGg7XG4gICAgICAgIGlmIChfdmlzaWJsZSA9PSAwKSB7XG4gICAgICAgICAgLy8gVGhlIGxpc3QgaXMgZW1wdHlcbiAgICAgICAgICAkdGFyZ2V0LmFkZENsYXNzKFwiaXMtZW1wdHlcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHRhcmdldC5yZW1vdmVDbGFzcyhcImlzLWVtcHR5XCIpO1xuICAgICAgICB9XG5cbiAgICAgIH0sXG4gICAgICBwb3B1bGF0ZUxpc3Q6IChoYXJkRmlsdGVycykgPT4ge1xuICAgICAgICAvL3VzaW5nIHdpbmRvdy5FVkVOVF9EQVRBXG4gICAgICAgIGNvbnN0IGtleVNldCA9ICFoYXJkRmlsdGVycy5rZXkgPyBbXSA6IGhhcmRGaWx0ZXJzLmtleS5zcGxpdCgnLCcpO1xuXG4gICAgICAgIHZhciAkZXZlbnRMaXN0ID0gd2luZG93LkVWRU5UU19EQVRBLmRhdGEubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgIGlmIChrZXlTZXQubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLmV2ZW50X3R5cGUgJiYgaXRlbS5ldmVudF90eXBlLnRvTG93ZXJDYXNlKCkgPT0gJ2dyb3VwJyA/IHJlbmRlckdyb3VwKGl0ZW0pIDogcmVuZGVyRXZlbnQoaXRlbSwgcmVmZXJyZXIsIHNvdXJjZSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXlTZXQubGVuZ3RoID4gMCAmJiBpdGVtLmV2ZW50X3R5cGUgIT0gJ2dyb3VwJyAmJiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5ldmVudF90eXBlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlbmRlckV2ZW50KGl0ZW0sIHJlZmVycmVyLCBzb3VyY2UpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2V5U2V0Lmxlbmd0aCA+IDAgJiYgaXRlbS5ldmVudF90eXBlID09ICdncm91cCcgJiYga2V5U2V0LmluY2x1ZGVzKGl0ZW0uc3VwZXJncm91cCkpIHtcbiAgICAgICAgICAgIHJldHVybiByZW5kZXJHcm91cChpdGVtLCByZWZlcnJlciwgc291cmNlKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIH0pXG4gICAgICAgICR0YXJnZXQuZmluZCgndWwgbGknKS5yZW1vdmUoKTtcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCcpLmFwcGVuZCgkZXZlbnRMaXN0KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiXG5cbmNvbnN0IE1hcE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgbGV0IExBTkdVQUdFID0gJ2VuJztcblxuICBjb25zdCByZW5kZXJFdmVudCA9IChpdGVtLCByZWZlcnJlciA9IG51bGwsIHNvdXJjZSA9IG51bGwpID0+IHtcblxuICAgIGxldCBtID0gbW9tZW50KG5ldyBEYXRlKGl0ZW0uc3RhcnRfZGF0ZXRpbWUpKTtcbiAgICBtID0gbS51dGMoKS5zdWJ0cmFjdChtLnV0Y09mZnNldCgpLCAnbScpO1xuXG4gICAgdmFyIGRhdGUgPSBtLmZvcm1hdChcImRkZGQgTU1NIERELCBoOm1tYVwiKTtcbiAgICBsZXQgdXJsID0gaXRlbS51cmwubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS51cmwgOiBcIi8vXCIgKyBpdGVtLnVybDtcblxuICAgIHVybCA9IEhlbHBlci5yZWZTb3VyY2UodXJsLCByZWZlcnJlciwgc291cmNlKTtcblxuICAgIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9J3BvcHVwLWl0ZW0gJHtpdGVtLmV2ZW50X3R5cGV9ICR7c3VwZXJHcm91cH0nIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5ldmVudF90eXBlfVwiPiR7aXRlbS5ldmVudF90eXBlIHx8ICdBY3Rpb24nfTwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxoMiBjbGFzcz1cImV2ZW50LXRpdGxlXCI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1kYXRlXCI+JHtkYXRlfTwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtYWRkcmVzcyBhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+UlNWUDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSwgcmVmZXJyZXIgPSBudWxsLCBzb3VyY2UgPSBudWxsKSA9PiB7XG5cbiAgICBsZXQgdXJsID0gaXRlbS53ZWJzaXRlLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0ud2Vic2l0ZSA6IFwiLy9cIiArIGl0ZW0ud2Vic2l0ZTtcblxuICAgIHVybCA9IEhlbHBlci5yZWZTb3VyY2UodXJsLCByZWZlcnJlciwgc291cmNlKTtcblxuICAgIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICByZXR1cm4gYFxuICAgIDxsaT5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwIGdyb3VwLW9iaiAke3N1cGVyR3JvdXB9XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5zdXBlcmdyb3VwfSAke3N1cGVyR3JvdXB9XCI+JHtpdGVtLnN1cGVyZ3JvdXB9PC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWhlYWRlclwiPlxuICAgICAgICAgIDxoMj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS5uYW1lfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1sb2NhdGlvbiBsb2NhdGlvblwiPiR7aXRlbS5sb2NhdGlvbn08L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGVzY3JpcHRpb25cIj5cbiAgICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9saT5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyQW5ub3RhdGlvblBvcHVwID0gKGl0ZW0pID0+IHtcbiAgICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9J3BvcHVwLWl0ZW0gYW5ub3RhdGlvbicgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnRcIj5cbiAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctYW5ub3RhdGlvblwiPkFubm90YXRpb248L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8aDIgY2xhc3M9XCJldmVudC10aXRsZVwiPiR7aXRlbS5uYW1lfTwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1hZGRyZXNzIGFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgYDtcbiAgfVxuXG5cbiAgY29uc3QgcmVuZGVyQW5ub3RhdGlvbnNHZW9Kc29uID0gKGxpc3QpID0+IHtcbiAgICByZXR1cm4gbGlzdC5tYXAoKGl0ZW0pID0+IHtcbiAgICAgIGNvbnN0IHJlbmRlcmVkID0gcmVuZGVyQW5ub3RhdGlvblBvcHVwKGl0ZW0pO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgIHR5cGU6IFwiUG9pbnRcIixcbiAgICAgICAgICBjb29yZGluYXRlczogW2l0ZW0ubG5nLCBpdGVtLmxhdF1cbiAgICAgICAgfSxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIGFubm90YXRpb25Qcm9wczogaXRlbSxcbiAgICAgICAgICBwb3B1cENvbnRlbnQ6IHJlbmRlcmVkXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgY29uc3QgcmVuZGVyR2VvanNvbiA9IChsaXN0LCByZWYgPSBudWxsLCBzcmMgPSBudWxsKSA9PiB7XG4gICAgcmV0dXJuIGxpc3QubWFwKChpdGVtKSA9PiB7XG4gICAgICAvLyByZW5kZXJlZCBldmVudFR5cGVcbiAgICAgIGxldCByZW5kZXJlZDtcblxuICAgICAgaWYgKGl0ZW0uZXZlbnRfdHlwZSAmJiBpdGVtLmV2ZW50X3R5cGUudG9Mb3dlckNhc2UoKSA9PSAnZ3JvdXAnKSB7XG4gICAgICAgIHJlbmRlcmVkID0gcmVuZGVyR3JvdXAoaXRlbSwgcmVmLCBzcmMpO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZW5kZXJlZCA9IHJlbmRlckV2ZW50KGl0ZW0sIHJlZiwgc3JjKTtcbiAgICAgIH1cblxuICAgICAgLy8gZm9ybWF0IGNoZWNrXG4gICAgICBpZiAoaXNOYU4ocGFyc2VGbG9hdChwYXJzZUZsb2F0KGl0ZW0ubG5nKSkpKSB7XG4gICAgICAgIGl0ZW0ubG5nID0gaXRlbS5sbmcuc3Vic3RyaW5nKDEpXG4gICAgICB9XG4gICAgICBpZiAoaXNOYU4ocGFyc2VGbG9hdChwYXJzZUZsb2F0KGl0ZW0ubGF0KSkpKSB7XG4gICAgICAgIGl0ZW0ubGF0ID0gaXRlbS5sYXQuc3Vic3RyaW5nKDEpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICB0eXBlOiBcIlBvaW50XCIsXG4gICAgICAgICAgY29vcmRpbmF0ZXM6IFtpdGVtLmxuZywgaXRlbS5sYXRdXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBldmVudFByb3BlcnRpZXM6IGl0ZW0sXG4gICAgICAgICAgcG9wdXBDb250ZW50OiByZW5kZXJlZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAob3B0aW9ucykgPT4ge1xuICAgIHZhciBhY2Nlc3NUb2tlbiA9ICdway5leUoxSWpvaWJXRjBkR2hsZHpNMU1DSXNJbUVpT2lKYVRWRk1Va1V3SW4wLndjTTNYYzhCR0M2UE0tT3lyd2puaGcnO1xuICAgIHZhciBtYXAgPSBMLm1hcCgnbWFwJywgeyBkcmFnZ2luZzogIUwuQnJvd3Nlci5tb2JpbGUgfSkuc2V0VmlldyhbMzQuODg1OTMwOTQwNzUzMTcsIDUuMDk3NjU2MjUwMDAwMDAxXSwgMik7XG5cbiAgICBsZXQge3JlZmVycmVyLCBzb3VyY2V9ID0gb3B0aW9ucztcblxuICAgIGlmICghTC5Ccm93c2VyLm1vYmlsZSkge1xuICAgICAgbWFwLnNjcm9sbFdoZWVsWm9vbS5kaXNhYmxlKCk7XG4gICAgfVxuXG4gICAgTEFOR1VBR0UgPSBvcHRpb25zLmxhbmcgfHwgJ2VuJztcblxuICAgIGlmIChvcHRpb25zLm9uTW92ZSkge1xuICAgICAgbWFwLm9uKCdkcmFnZW5kJywgKGV2ZW50KSA9PiB7XG5cblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuICAgICAgICBvcHRpb25zLm9uTW92ZShzdywgbmUpO1xuICAgICAgfSkub24oJ3pvb21lbmQnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKG1hcC5nZXRab29tKCkgPD0gNCkge1xuICAgICAgICAgICQoXCIjbWFwXCIpLmFkZENsYXNzKFwiem9vbWVkLW91dFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkKFwiI21hcFwiKS5yZW1vdmVDbGFzcyhcInpvb21lZC1vdXRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuICAgICAgICBvcHRpb25zLm9uTW92ZShzdywgbmUpO1xuICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBtYXAuZmlyZUV2ZW50KCd6b29tZW5kJyk7XG5cbiAgICBMLnRpbGVMYXllcignaHR0cHM6Ly9hcGkubWFwYm94LmNvbS9zdHlsZXMvdjEvbWF0dGhldzM1MC9jamE0MXRpamsyN2Q2MnJxb2Q3ZzBseDRiL3RpbGVzLzI1Ni97en0ve3h9L3t5fT9hY2Nlc3NfdG9rZW49JyArIGFjY2Vzc1Rva2VuLCB7XG4gICAgICAgIGF0dHJpYnV0aW9uOiAnJmNvcHk7IDxhIGhyZWY9XCJodHRwOi8vb3NtLm9yZy9jb3B5cmlnaHRcIj5PcGVuU3RyZWV0TWFwPC9hPiBjb250cmlidXRvcnMg4oCiIDxhIGhyZWY9XCIvLzM1MC5vcmdcIj4zNTAub3JnPC9hPidcbiAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgLy8gY29uc29sZS5sb2cod2luZG93LnF1ZXJpZXNbJ3R3aWxpZ2h0LXpvbmUnXSwgd2luZG93LnF1ZXJpZXNbJ3R3aWxpZ2h0LXpvbmUnXSA9PT0gXCJ0cnVlXCIpO1xuICAgIGlmKHdpbmRvdy5xdWVyaWVzWyd0d2lsaWdodC16b25lJ10pIHtcbiAgICAgIEwudGVybWluYXRvcigpLmFkZFRvKG1hcClcbiAgICB9XG5cbiAgICBsZXQgZ2VvY29kZXIgPSBudWxsO1xuICAgIHJldHVybiB7XG4gICAgICAkbWFwOiBtYXAsXG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHNldEJvdW5kczogKGJvdW5kczEsIGJvdW5kczIpID0+IHtcblxuICAgICAgICBjb25zdCBib3VuZHMgPSBbYm91bmRzMSwgYm91bmRzMl07XG4gICAgICAgIG1hcC5maXRCb3VuZHMoYm91bmRzLCB7IGFuaW1hdGU6IGZhbHNlfSk7XG4gICAgICB9LFxuICAgICAgc2V0Q2VudGVyOiAoY2VudGVyLCB6b29tID0gMTApID0+IHtcbiAgICAgICAgaWYgKCFjZW50ZXIgfHwgIWNlbnRlclswXSB8fCBjZW50ZXJbMF0gPT0gXCJcIlxuICAgICAgICAgICAgICB8fCAhY2VudGVyWzFdIHx8IGNlbnRlclsxXSA9PSBcIlwiKSByZXR1cm47XG4gICAgICAgIG1hcC5zZXRWaWV3KGNlbnRlciwgem9vbSk7XG4gICAgICB9LFxuICAgICAgZ2V0Qm91bmRzOiAoKSA9PiB7XG5cbiAgICAgICAgbGV0IHN3ID0gW21hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW21hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubG5nXTtcblxuICAgICAgICByZXR1cm4gW3N3LCBuZV07XG4gICAgICB9LFxuICAgICAgLy8gQ2VudGVyIGxvY2F0aW9uIGJ5IGdlb2NvZGVkXG4gICAgICBnZXRDZW50ZXJCeUxvY2F0aW9uOiAobG9jYXRpb24sIGNhbGxiYWNrKSA9PiB7XG5cbiAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IGxvY2F0aW9uIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcblxuICAgICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlc3VsdHNbMF0pXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyWm9vbUVuZDogKCkgPT4ge1xuICAgICAgICBtYXAuZmlyZUV2ZW50KCd6b29tZW5kJyk7XG4gICAgICB9LFxuICAgICAgem9vbU91dE9uY2U6ICgpID0+IHtcbiAgICAgICAgbWFwLnpvb21PdXQoMSk7XG4gICAgICB9LFxuICAgICAgem9vbVVudGlsSGl0OiAoKSA9PiB7XG4gICAgICAgIHZhciAkdGhpcyA9IHRoaXM7XG4gICAgICAgIG1hcC56b29tT3V0KDEpO1xuICAgICAgICBsZXQgaW50ZXJ2YWxIYW5kbGVyID0gbnVsbDtcbiAgICAgICAgaW50ZXJ2YWxIYW5kbGVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgIHZhciBfdmlzaWJsZSA9ICQoZG9jdW1lbnQpLmZpbmQoJ3VsIGxpLmV2ZW50LW9iai53aXRoaW4tYm91bmQsIHVsIGxpLmdyb3VwLW9iai53aXRoaW4tYm91bmQnKS5sZW5ndGg7XG4gICAgICAgICAgaWYgKF92aXNpYmxlID09IDApIHtcbiAgICAgICAgICAgIG1hcC56b29tT3V0KDEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSGFuZGxlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAyMDApO1xuICAgICAgfSxcbiAgICAgIHJlZnJlc2hNYXA6ICgpID0+IHtcbiAgICAgICAgbWFwLmludmFsaWRhdGVTaXplKGZhbHNlKTtcbiAgICAgICAgLy8gbWFwLl9vblJlc2l6ZSgpO1xuICAgICAgICAvLyBtYXAuZmlyZUV2ZW50KCd6b29tZW5kJyk7XG5cblxuICAgICAgfSxcbiAgICAgIGZpbHRlck1hcDogKGZpbHRlcnMpID0+IHtcblxuICAgICAgICAkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXBcIikuaGlkZSgpO1xuXG5cbiAgICAgICAgaWYgKCFmaWx0ZXJzKSByZXR1cm47XG5cbiAgICAgICAgZmlsdGVycy5mb3JFYWNoKChpdGVtKSA9PiB7XG5cbiAgICAgICAgICAkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXAuXCIgKyBpdGVtLnRvTG93ZXJDYXNlKCkpLnNob3coKTtcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICBwbG90UG9pbnRzOiAobGlzdCwgaGFyZEZpbHRlcnMsIGdyb3VwcykgPT4ge1xuICAgICAgICBjb25zdCBrZXlTZXQgPSAhaGFyZEZpbHRlcnMua2V5ID8gW10gOiBoYXJkRmlsdGVycy5rZXkuc3BsaXQoJywnKTtcblxuICAgICAgICBpZiAoa2V5U2V0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsaXN0ID0gbGlzdC5maWx0ZXIoKGl0ZW0pID0+IGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKVxuICAgICAgICB9XG5cblxuICAgICAgICBjb25zdCBnZW9qc29uID0ge1xuICAgICAgICAgIHR5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgICAgICAgICBmZWF0dXJlczogcmVuZGVyR2VvanNvbihsaXN0LCByZWZlcnJlciwgc291cmNlKVxuICAgICAgICB9O1xuXG5cbiAgICAgICAgY29uc3QgZXZlbnRzTGF5ZXIgPSBMLmdlb0pTT04oZ2VvanNvbiwge1xuICAgICAgICAgICAgcG9pbnRUb0xheWVyOiAoZmVhdHVyZSwgbGF0bG5nKSA9PiB7XG4gICAgICAgICAgICAgIC8vIEljb25zIGZvciBtYXJrZXJzXG4gICAgICAgICAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuZXZlbnRfdHlwZTtcblxuICAgICAgICAgICAgICAvLyBJZiBubyBzdXBlcmdyb3VwLCBpdCdzIGFuIGV2ZW50LlxuICAgICAgICAgICAgICBjb25zdCBzdXBlcmdyb3VwID0gZ3JvdXBzW2ZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuc3VwZXJncm91cF0gPyBmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLnN1cGVyZ3JvdXAgOiBcIkV2ZW50c1wiO1xuICAgICAgICAgICAgICBjb25zdCBzbHVnZ2VkID0gd2luZG93LnNsdWdpZnkoc3VwZXJncm91cCk7XG5cblxuXG4gICAgICAgICAgICAgIGxldCBpY29uVXJsO1xuICAgICAgICAgICAgICBjb25zdCBpc1Bhc3QgPSBuZXcgRGF0ZShmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLnN0YXJ0X2RhdGV0aW1lKSA8IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICAgIGlmIChldmVudFR5cGUgPT0gXCJBY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIGljb25VcmwgPSBpc1Bhc3QgPyBcIi9pbWcvcGFzdC1ldmVudC5wbmdcIiA6IFwiL2ltZy9ldmVudC5wbmdcIjtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpY29uVXJsID0gZ3JvdXBzW3N1cGVyZ3JvdXBdID8gZ3JvdXBzW3N1cGVyZ3JvdXBdLmljb251cmwgfHwgXCIvaW1nL2V2ZW50LnBuZ1wiICA6IFwiL2ltZy9ldmVudC5wbmdcIiA7XG4gICAgICAgICAgICAgIH1cblxuXG5cbiAgICAgICAgICAgICAgY29uc3Qgc21hbGxJY29uID0gIEwuaWNvbih7XG4gICAgICAgICAgICAgICAgaWNvblVybDogaWNvblVybCxcbiAgICAgICAgICAgICAgICBpY29uU2l6ZTogWzE4LCAxOF0sXG4gICAgICAgICAgICAgICAgaWNvbkFuY2hvcjogWzksIDldLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogc2x1Z2dlZCArICcgZXZlbnQtaXRlbS1wb3B1cCAnICsgKGlzUGFzdCYmZXZlbnRUeXBlID09IFwiQWN0aW9uXCI/XCJldmVudC1wYXN0LWV2ZW50XCI6XCJcIilcbiAgICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgICB2YXIgZ2VvanNvbk1hcmtlck9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgaWNvbjogc21hbGxJY29uLFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICByZXR1cm4gTC5tYXJrZXIobGF0bG5nLCBnZW9qc29uTWFya2VyT3B0aW9ucyk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgb25FYWNoRmVhdHVyZTogKGZlYXR1cmUsIGxheWVyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZmVhdHVyZS5wcm9wZXJ0aWVzICYmIGZlYXR1cmUucHJvcGVydGllcy5wb3B1cENvbnRlbnQpIHtcbiAgICAgICAgICAgICAgbGF5ZXIuYmluZFBvcHVwKGZlYXR1cmUucHJvcGVydGllcy5wb3B1cENvbnRlbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjb25zdCBpc1Bhc3QgPSBuZXcgRGF0ZShmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLnN0YXJ0X2RhdGV0aW1lKSA8IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICAvLyBjb25zdCBldmVudFR5cGUgPSBmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLmV2ZW50X3R5cGU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBldmVudHNMYXllci5hZGRUbyhtYXApO1xuICAgICAgICAvLyBldmVudHNMYXllci5icmluZ1RvQmFjaygpO1xuXG5cbiAgICAgICAgLy8gQWRkIEFubm90YXRpb25zXG4gICAgICAgIGlmICh3aW5kb3cucXVlcmllcy5hbm5vdGF0aW9uKSB7XG4gICAgICAgICAgY29uc3QgYW5ub3RhdGlvbnMgPSAhd2luZG93LkVWRU5UU19EQVRBLmFubm90YXRpb25zID8gW10gOiB3aW5kb3cuRVZFTlRTX0RBVEEuYW5ub3RhdGlvbnMuZmlsdGVyKChpdGVtKT0+aXRlbS50eXBlPT09d2luZG93LnF1ZXJpZXMuYW5ub3RhdGlvbik7XG5cbiAgICAgICAgICBjb25zdCBhbm5vdGF0aW9uR2VvSnNvbiA9IHtcbiAgICAgICAgICAgIHR5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgICAgICAgICAgIGZlYXR1cmVzOiByZW5kZXJBbm5vdGF0aW9uc0dlb0pzb24oYW5ub3RhdGlvbnMpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgYW5ub3RMYXllciA9IEwuZ2VvSlNPTihhbm5vdGF0aW9uR2VvSnNvbiwge1xuICAgICAgICAgICAgICBwb2ludFRvTGF5ZXI6IChmZWF0dXJlLCBsYXRsbmcpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpY29uVXJsID0gXCIvaW1nL2Fubm90YXRpb24ucG5nXCI7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBzbWFsbEljb24gPSAgTC5pY29uKHtcbiAgICAgICAgICAgICAgICAgIGljb25Vcmw6IGljb25VcmwsXG4gICAgICAgICAgICAgICAgICBpY29uU2l6ZTogWzUwLCA1MF0sXG4gICAgICAgICAgICAgICAgICBpY29uQW5jaG9yOiBbMjUsIDI1XSxcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2Fubm90YXRpb24tcG9wdXAnXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgZ2VvanNvbk1hcmtlck9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICBpY29uOiBzbWFsbEljb24sXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gTC5tYXJrZXIobGF0bG5nLCBnZW9qc29uTWFya2VyT3B0aW9ucyk7XG4gICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG9uRWFjaEZlYXR1cmU6IChmZWF0dXJlLCBsYXllcikgPT4ge1xuICAgICAgICAgICAgICBpZiAoZmVhdHVyZS5wcm9wZXJ0aWVzICYmIGZlYXR1cmUucHJvcGVydGllcy5wb3B1cENvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICBsYXllci5iaW5kUG9wdXAoZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyBhbm5vdExheWVyLmJyaW5nVG9Gcm9udCgpO1xuICAgICAgICAgIGFubm90TGF5ZXIuYWRkVG8obWFwKTtcblxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdXBkYXRlOiAocCkgPT4ge1xuICAgICAgICBpZiAoIXAgfHwgIXAubGF0IHx8ICFwLmxuZyApIHJldHVybjtcblxuICAgICAgICBtYXAuc2V0VmlldyhMLmxhdExuZyhwLmxhdCwgcC5sbmcpLCAxMCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsImNvbnN0IFF1ZXJ5TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldEZvcm0gPSBcImZvcm0jZmlsdGVycy1mb3JtXCIpID0+IHtcbiAgICBjb25zdCAkdGFyZ2V0ID0gdHlwZW9mIHRhcmdldEZvcm0gPT09ICdzdHJpbmcnID8gJCh0YXJnZXRGb3JtKSA6IHRhcmdldEZvcm07XG4gICAgbGV0IGxhdCA9IG51bGw7XG4gICAgbGV0IGxuZyA9IG51bGw7XG5cbiAgICBsZXQgcHJldmlvdXMgPSB7fTtcblxuICAgICR0YXJnZXQub24oJ3N1Ym1pdCcsIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBsYXQgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKCk7XG4gICAgICBsbmcgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKCk7XG5cbiAgICAgIHZhciBmb3JtID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuXG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICQucGFyYW0oZm9ybSk7XG4gICAgfSlcblxuICAgICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnc2VsZWN0I2ZpbHRlci1pdGVtcycsICgpID0+IHtcbiAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgfSlcblxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGluaXRpYWxpemU6IChjYWxsYmFjaykgPT4ge1xuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2gubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHZhciBwYXJhbXMgPSAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpKVxuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGFuZ11cIikudmFsKHBhcmFtcy5sYW5nKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKHBhcmFtcy5sYXQpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwocGFyYW1zLmxuZyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChwYXJhbXMuYm91bmQxKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKHBhcmFtcy5ib3VuZDIpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG9jXVwiKS52YWwocGFyYW1zLmxvYyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1rZXldXCIpLnZhbChwYXJhbXMua2V5KTtcblxuICAgICAgICAgIGlmIChwYXJhbXMuZmlsdGVyKSB7XG4gICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIjZmlsdGVyLWl0ZW1zIG9wdGlvblwiKS5yZW1vdmVQcm9wKFwic2VsZWN0ZWRcIik7XG4gICAgICAgICAgICBwYXJhbXMuZmlsdGVyLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICAgICR0YXJnZXQuZmluZChcIiNmaWx0ZXItaXRlbXMgb3B0aW9uW3ZhbHVlPSdcIiArIGl0ZW0gKyBcIiddXCIpLnByb3AoXCJzZWxlY3RlZFwiLCB0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZ2V0UGFyYW1ldGVyczogKCkgPT4ge1xuICAgICAgICB2YXIgcGFyYW1ldGVycyA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcbiAgICAgICAgLy8gcGFyYW1ldGVyc1snbG9jYXRpb24nXSA7XG5cbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gcGFyYW1ldGVycykge1xuICAgICAgICAgIGlmICggIXBhcmFtZXRlcnNba2V5XSB8fCBwYXJhbWV0ZXJzW2tleV0gPT0gXCJcIikge1xuICAgICAgICAgICAgZGVsZXRlIHBhcmFtZXRlcnNba2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyYW1ldGVycztcbiAgICAgIH0sXG4gICAgICB1cGRhdGVMb2NhdGlvbjogKGxhdCwgbG5nKSA9PiB7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwobGF0KTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChsbmcpO1xuICAgICAgICAvLyAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZVZpZXdwb3J0OiAodmlld3BvcnQpID0+IHtcblxuICAgICAgICAvLyBBdmVyYWdlIGl0IGlmIGxlc3MgdGhhbiAxMG1pIHJhZGl1c1xuICAgICAgICBpZiAoTWF0aC5hYnModmlld3BvcnQuZi5iIC0gdmlld3BvcnQuZi5mKSA8IC4xNSB8fCBNYXRoLmFicyh2aWV3cG9ydC5iLmIgLSB2aWV3cG9ydC5iLmYpIDwgLjE1KSB7XG4gICAgICAgICAgbGV0IGZBdmcgPSAodmlld3BvcnQuZi5iICsgdmlld3BvcnQuZi5mKSAvIDI7XG4gICAgICAgICAgbGV0IGJBdmcgPSAodmlld3BvcnQuYi5iICsgdmlld3BvcnQuYi5mKSAvIDI7XG4gICAgICAgICAgdmlld3BvcnQuZiA9IHsgYjogZkF2ZyAtIC4wOCwgZjogZkF2ZyArIC4wOCB9O1xuICAgICAgICAgIHZpZXdwb3J0LmIgPSB7IGI6IGJBdmcgLSAuMDgsIGY6IGJBdmcgKyAuMDggfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBib3VuZHMgPSBbW3ZpZXdwb3J0LmYuYiwgdmlld3BvcnQuYi5iXSwgW3ZpZXdwb3J0LmYuZiwgdmlld3BvcnQuYi5mXV07XG5cbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMF0pKTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMV0pKTtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVWaWV3cG9ydEJ5Qm91bmQ6IChzdywgbmUpID0+IHtcblxuICAgICAgICBjb25zdCBib3VuZHMgPSBbc3csIG5lXTsvLy8vLy8vL1xuXG5cbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMF0pKTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMV0pKTtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyU3VibWl0OiAoKSA9PiB7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59KShqUXVlcnkpO1xuIiwibGV0IGF1dG9jb21wbGV0ZU1hbmFnZXI7XG5sZXQgbWFwTWFuYWdlcjtcblxud2luZG93LkRFRkFVTFRfSUNPTiA9IFwiL2ltZy9ldmVudC5wbmdcIjtcbndpbmRvdy5zbHVnaWZ5ID0gKHRleHQpID0+ICF0ZXh0ID8gdGV4dCA6IHRleHQudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xccysvZywgJy0nKSAgICAgICAgICAgLy8gUmVwbGFjZSBzcGFjZXMgd2l0aCAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1teXFx3XFwtXSsvZywgJycpICAgICAgIC8vIFJlbW92ZSBhbGwgbm9uLXdvcmQgY2hhcnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwtXFwtKy9nLCAnLScpICAgICAgICAgLy8gUmVwbGFjZSBtdWx0aXBsZSAtIHdpdGggc2luZ2xlIC1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXi0rLywgJycpICAgICAgICAgICAgIC8vIFRyaW0gLSBmcm9tIHN0YXJ0IG9mIHRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvLSskLywgJycpOyAgICAgICAgICAgIC8vIFRyaW0gLSBmcm9tIGVuZCBvZiB0ZXh0XG5cbmNvbnN0IGdldFF1ZXJ5U3RyaW5nID0gKCkgPT4ge1xuICAgIHZhciBxdWVyeVN0cmluZ0tleVZhbHVlID0gd2luZG93LnBhcmVudC5sb2NhdGlvbi5zZWFyY2gucmVwbGFjZSgnPycsICcnKS5zcGxpdCgnJicpO1xuICAgIHZhciBxc0pzb25PYmplY3QgPSB7fTtcbiAgICBpZiAocXVlcnlTdHJpbmdLZXlWYWx1ZSAhPSAnJykge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHF1ZXJ5U3RyaW5nS2V5VmFsdWUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHFzSnNvbk9iamVjdFtxdWVyeVN0cmluZ0tleVZhbHVlW2ldLnNwbGl0KCc9JylbMF1dID0gcXVlcnlTdHJpbmdLZXlWYWx1ZVtpXS5zcGxpdCgnPScpWzFdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBxc0pzb25PYmplY3Q7XG59O1xuXG4oZnVuY3Rpb24oJCkge1xuICAvLyBMb2FkIHRoaW5nc1xuXG4gIHdpbmRvdy5xdWVyaWVzID0gICQuZGVwYXJhbSh3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cmluZygxKSk7XG4gIHRyeSB7XG4gICAgaWYgKCghd2luZG93LnF1ZXJpZXMuZ3JvdXAgfHwgKCF3aW5kb3cucXVlcmllcy5yZWZlcnJlciAmJiAhd2luZG93LnF1ZXJpZXMuc291cmNlKSkgJiYgd2luZG93LnBhcmVudCkge1xuICAgICAgd2luZG93LnF1ZXJpZXMgPSB7XG4gICAgICAgIGdyb3VwOiBnZXRRdWVyeVN0cmluZygpLmdyb3VwLFxuICAgICAgICByZWZlcnJlcjogZ2V0UXVlcnlTdHJpbmcoKS5yZWZlcnJlcixcbiAgICAgICAgc291cmNlOiBnZXRRdWVyeVN0cmluZygpLnNvdXJjZSxcbiAgICAgICAgXCJ0d2lsaWdodC16b25lXCI6IHdpbmRvdy5xdWVyaWVzWyd0d2lsaWdodC16b25lJ10sXG4gICAgICAgIFwiYW5ub3RhdGlvblwiOiB3aW5kb3cucXVlcmllc1snYW5ub3RhdGlvbiddLFxuICAgICAgICBcImZ1bGwtbWFwXCI6IHdpbmRvdy5xdWVyaWVzWydmdWxsLW1hcCddXG4gICAgICB9O1xuICAgIH1cbiAgfSBjYXRjaChlKSB7XG4gICAgY29uc29sZS5sb2coXCJFcnJvcjogXCIsIGUpO1xuICB9XG5cbiAgaWYgKHdpbmRvdy5xdWVyaWVzWydmdWxsLW1hcCddKSB7XG4gICAgaWYgKCQod2luZG93KS53aWR0aCgpIDwgNjAwKSB7XG4gICAgICAvLyAkKFwiI2V2ZW50cy1saXN0LWNvbnRhaW5lclwiKS5oaWRlKCk7XG4gICAgICAkKFwiYm9keVwiKS5hZGRDbGFzcyhcIm1hcC12aWV3XCIpO1xuICAgICAgJChcIi5maWx0ZXItYXJlYVwiKS5oaWRlKCk7XG4gICAgICAkKFwic2VjdGlvbiNtYXBcIikuY3NzKFwiaGVpZ2h0XCIsIFwiY2FsYygxMDAlIC0gNjRweClcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgICQoXCIjZXZlbnRzLWxpc3QtY29udGFpbmVyXCIpLmhpZGUoKTtcbiAgICB9XG4gIH1cblxuXG4gIGlmICh3aW5kb3cucXVlcmllcy5ncm91cCkge1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5wYXJlbnQoKS5jc3MoXCJvcGFjaXR5XCIsIFwiMFwiKTtcbiAgfVxuICBjb25zdCBidWlsZEZpbHRlcnMgPSAoKSA9PiB7JCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KHtcbiAgICAgIGVuYWJsZUhUTUw6IHRydWUsXG4gICAgICB0ZW1wbGF0ZXM6IHtcbiAgICAgICAgYnV0dG9uOiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJtdWx0aXNlbGVjdCBkcm9wZG93bi10b2dnbGVcIiBkYXRhLXRvZ2dsZT1cImRyb3Bkb3duXCI+PHNwYW4gZGF0YS1sYW5nLXRhcmdldD1cInRleHRcIiBkYXRhLWxhbmcta2V5PVwibW9yZS1zZWFyY2gtb3B0aW9uc1wiPjwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJmYSBmYS1jYXJldC1kb3duXCI+PC9zcGFuPjwvYnV0dG9uPicsXG4gICAgICAgIGxpOiAnPGxpPjxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCI+PGxhYmVsPjwvbGFiZWw+PC9hPjwvbGk+J1xuICAgICAgfSxcbiAgICAgIGRyb3BSaWdodDogdHJ1ZSxcbiAgICAgIG9uSW5pdGlhbGl6ZWQ6ICgpID0+IHtcblxuICAgICAgfSxcbiAgICAgIG9uRHJvcGRvd25TaG93OiAoKSA9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJtb2JpbGUtdXBkYXRlLW1hcC1oZWlnaHRcIik7XG4gICAgICAgIH0sIDEwKTtcblxuICAgICAgfSxcbiAgICAgIG9uRHJvcGRvd25IaWRlOiAoKSA9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJtb2JpbGUtdXBkYXRlLW1hcC1oZWlnaHRcIik7XG4gICAgICAgIH0sIDEwKTtcbiAgICAgIH0sXG4gICAgICBvcHRpb25MYWJlbDogKGUpID0+IHtcbiAgICAgICAgLy8gbGV0IGVsID0gJCggJzxkaXY+PC9kaXY+JyApO1xuICAgICAgICAvLyBlbC5hcHBlbmQoKCkgKyBcIlwiKTtcblxuICAgICAgICByZXR1cm4gdW5lc2NhcGUoJChlKS5hdHRyKCdsYWJlbCcpKSB8fCAkKGUpLmh0bWwoKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH07XG4gIGJ1aWxkRmlsdGVycygpO1xuXG5cbiAgJCgnc2VsZWN0I2xhbmd1YWdlLW9wdHMnKS5tdWx0aXNlbGVjdCh7XG4gICAgZW5hYmxlSFRNTDogdHJ1ZSxcbiAgICBvcHRpb25DbGFzczogKCkgPT4gJ2xhbmctb3B0JyxcbiAgICBzZWxlY3RlZENsYXNzOiAoKSA9PiAnbGFuZy1zZWwnLFxuICAgIGJ1dHRvbkNsYXNzOiAoKSA9PiAnbGFuZy1idXQnLFxuICAgIGRyb3BSaWdodDogdHJ1ZSxcbiAgICBvcHRpb25MYWJlbDogKGUpID0+IHtcbiAgICAgIC8vIGxldCBlbCA9ICQoICc8ZGl2PjwvZGl2PicgKTtcbiAgICAgIC8vIGVsLmFwcGVuZCgoKSArIFwiXCIpO1xuXG4gICAgICByZXR1cm4gdW5lc2NhcGUoJChlKS5hdHRyKCdsYWJlbCcpKSB8fCAkKGUpLmh0bWwoKTtcbiAgICB9LFxuICAgIG9uQ2hhbmdlOiAob3B0aW9uLCBjaGVja2VkLCBzZWxlY3QpID0+IHtcblxuICAgICAgY29uc3QgcGFyYW1ldGVycyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gICAgICBwYXJhbWV0ZXJzWydsYW5nJ10gPSBvcHRpb24udmFsKCk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1yZXNldC1tYXAnLCBwYXJhbWV0ZXJzKTtcblxuICAgIH1cbiAgfSlcblxuICAvLyAxLiBnb29nbGUgbWFwcyBnZW9jb2RlXG5cbiAgLy8gMi4gZm9jdXMgbWFwIG9uIGdlb2NvZGUgKHZpYSBsYXQvbG5nKVxuICBjb25zdCBxdWVyeU1hbmFnZXIgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICAgICAgcXVlcnlNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICBjb25zdCBpbml0UGFyYW1zID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuXG5cbiAgY29uc3QgbGFuZ3VhZ2VNYW5hZ2VyID0gTGFuZ3VhZ2VNYW5hZ2VyKCk7XG5cbiAgY29uc3QgbGlzdE1hbmFnZXIgPSBMaXN0TWFuYWdlcih7XG4gICAgcmVmZXJyZXI6IHdpbmRvdy5xdWVyaWVzLnJlZmVycmVyLFxuICAgIHNvdXJjZTogd2luZG93LnF1ZXJpZXMuc291cmNlXG4gIH0pO1xuXG5cbiAgbWFwTWFuYWdlciA9IE1hcE1hbmFnZXIoe1xuICAgIG9uTW92ZTogKHN3LCBuZSkgPT4ge1xuICAgICAgLy8gV2hlbiB0aGUgbWFwIG1vdmVzIGFyb3VuZCwgd2UgdXBkYXRlIHRoZSBsaXN0XG4gICAgICBxdWVyeU1hbmFnZXIudXBkYXRlVmlld3BvcnRCeUJvdW5kKHN3LCBuZSk7XG4gICAgICAvL3VwZGF0ZSBRdWVyeVxuICAgIH0sXG4gICAgcmVmZXJyZXI6IHdpbmRvdy5xdWVyaWVzLnJlZmVycmVyLFxuICAgIHNvdXJjZTogd2luZG93LnF1ZXJpZXMuc291cmNlXG4gIH0pO1xuXG4gIHdpbmRvdy5pbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2sgPSAoKSA9PiB7XG5cbiAgICBhdXRvY29tcGxldGVNYW5hZ2VyID0gQXV0b2NvbXBsZXRlTWFuYWdlcihcImlucHV0W25hbWU9J2xvYyddXCIpO1xuICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuXG4gICAgaWYgKGluaXRQYXJhbXMubG9jICYmIGluaXRQYXJhbXMubG9jICE9PSAnJyAmJiAoIWluaXRQYXJhbXMuYm91bmQxICYmICFpbml0UGFyYW1zLmJvdW5kMikpIHtcbiAgICAgIG1hcE1hbmFnZXIuaW5pdGlhbGl6ZSgoKSA9PiB7XG4gICAgICAgIG1hcE1hbmFnZXIuZ2V0Q2VudGVyQnlMb2NhdGlvbihpbml0UGFyYW1zLmxvYywgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIHF1ZXJ5TWFuYWdlci51cGRhdGVWaWV3cG9ydChyZXN1bHQuZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgaWYoaW5pdFBhcmFtcy5sYXQgJiYgaW5pdFBhcmFtcy5sbmcpIHtcbiAgICBtYXBNYW5hZ2VyLnNldENlbnRlcihbaW5pdFBhcmFtcy5sYXQsIGluaXRQYXJhbXMubG5nXSk7XG4gIH1cblxuICAvKioqXG4gICogTGlzdCBFdmVudHNcbiAgKiBUaGlzIHdpbGwgdHJpZ2dlciB0aGUgbGlzdCB1cGRhdGUgbWV0aG9kXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCdtb2JpbGUtdXBkYXRlLW1hcC1oZWlnaHQnLCAoZXZlbnQpID0+IHtcbiAgICAvL1RoaXMgY2hlY2tzIGlmIHdpZHRoIGlzIGZvciBtb2JpbGVcbiAgICBpZiAoJCh3aW5kb3cpLndpZHRoKCkgPCA2MDApIHtcbiAgICAgIHNldFRpbWVvdXQoKCk9PiB7XG4gICAgICAgICQoXCIjbWFwXCIpLmhlaWdodCgkKFwiI2V2ZW50cy1saXN0XCIpLmhlaWdodCgpKTtcbiAgICAgICAgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCk7XG4gICAgICB9LCAxMCk7XG4gICAgfVxuICB9KVxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnBvcHVsYXRlTGlzdChvcHRpb25zLnBhcmFtcyk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuXG4gICAgbGlzdE1hbmFnZXIudXBkYXRlRmlsdGVyKG9wdGlvbnMpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlci1ieS1ib3VuZCcsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxldCBib3VuZDEsIGJvdW5kMjtcblxuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICBbYm91bmQxLCBib3VuZDJdID0gbWFwTWFuYWdlci5nZXRCb3VuZHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgICBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcbiAgICB9XG5cbiAgICBsaXN0TWFuYWdlci51cGRhdGVCb3VuZHMoYm91bmQxLCBib3VuZDIpXG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLXJlc2V0LW1hcCcsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIHZhciBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHRpb25zKSk7XG4gICAgZGVsZXRlIGNvcHlbJ2xuZyddO1xuICAgIGRlbGV0ZSBjb3B5WydsYXQnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQxJ107XG4gICAgZGVsZXRlIGNvcHlbJ2JvdW5kMiddO1xuXG4gICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAkLnBhcmFtKGNvcHkpO1xuXG5cbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwidHJpZ2dlci1sYW5ndWFnZS11cGRhdGVcIiwgY29weSk7XG4gICAgJChcInNlbGVjdCNmaWx0ZXItaXRlbXNcIikubXVsdGlzZWxlY3QoJ2Rlc3Ryb3knKTtcbiAgICBidWlsZEZpbHRlcnMoKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxvYWQtZ3JvdXBzJywgeyBncm91cHM6IHdpbmRvdy5FVkVOVFNfREFUQS5ncm91cHMgfSk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG5cbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJ0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZVwiLCBjb3B5KTtcbiAgICB9LCAxMDAwKTtcbiAgfSk7XG5cblxuICAvKioqXG4gICogTWFwIEV2ZW50c1xuICAqL1xuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgLy8gbWFwTWFuYWdlci5zZXRDZW50ZXIoW29wdGlvbnMubGF0LCBvcHRpb25zLmxuZ10pO1xuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGJvdW5kMSA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDEpO1xuICAgIHZhciBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcblxuICAgIG1hcE1hbmFnZXIuc2V0Qm91bmRzKGJvdW5kMSwgYm91bmQyKTtcbiAgICAvLyBtYXBNYW5hZ2VyLnRyaWdnZXJab29tRW5kKCk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIG1hcE1hbmFnZXIudHJpZ2dlclpvb21FbmQoKTtcbiAgICB9LCAxMCk7XG5cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgXCIjY29weS1lbWJlZFwiLCAoZSkgPT4ge1xuICAgIHZhciBjb3B5VGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW1iZWQtdGV4dFwiKTtcbiAgICBjb3B5VGV4dC5zZWxlY3QoKTtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZChcIkNvcHlcIik7XG4gIH0pO1xuXG4gIC8vIDMuIG1hcmtlcnMgb24gbWFwXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC1wbG90JywgKGUsIG9wdCkgPT4ge1xuXG4gICAgbWFwTWFuYWdlci5wbG90UG9pbnRzKG9wdC5kYXRhLCBvcHQucGFyYW1zLCBvcHQuZ3JvdXBzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInKTtcbiAgfSlcblxuICAvLyBsb2FkIGdyb3Vwc1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxvYWQtZ3JvdXBzJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5lbXB0eSgpO1xuICAgIG9wdC5ncm91cHMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuXG4gICAgICBsZXQgc2x1Z2dlZCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG4gICAgICBsZXQgdmFsdWVUZXh0ID0gbGFuZ3VhZ2VNYW5hZ2VyLmdldFRyYW5zbGF0aW9uKGl0ZW0udHJhbnNsYXRpb24pO1xuICAgICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLmFwcGVuZChgXG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPScke3NsdWdnZWR9J1xuICAgICAgICAgICAgICBzZWxlY3RlZD0nc2VsZWN0ZWQnXG4gICAgICAgICAgICAgIGxhYmVsPVwiPHNwYW4gZGF0YS1sYW5nLXRhcmdldD0ndGV4dCcgZGF0YS1sYW5nLWtleT0nJHtpdGVtLnRyYW5zbGF0aW9ufSc+JHt2YWx1ZVRleHR9PC9zcGFuPjxpbWcgc3JjPScke2l0ZW0uaWNvbnVybCB8fCB3aW5kb3cuREVGQVVMVF9JQ09OfScgLz5cIj5cbiAgICAgICAgICAgIDwvb3B0aW9uPmApXG4gICAgfSk7XG5cbiAgICAvLyBSZS1pbml0aWFsaXplXG4gICAgcXVlcnlNYW5hZ2VyLmluaXRpYWxpemUoKTtcbiAgICAvLyAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykubXVsdGlzZWxlY3QoJ2Rlc3Ryb3knKTtcbiAgICAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykubXVsdGlzZWxlY3QoJ3JlYnVpbGQnKTtcblxuICAgIG1hcE1hbmFnZXIucmVmcmVzaE1hcCgpO1xuXG5cbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZScpO1xuXG4gIH0pXG5cbiAgLy8gRmlsdGVyIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtZmlsdGVyJywgKGUsIG9wdCkgPT4ge1xuICAgIGlmIChvcHQpIHtcbiAgICAgIG1hcE1hbmFnZXIuZmlsdGVyTWFwKG9wdC5maWx0ZXIpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgKGUsIG9wdCkgPT4ge1xuXG4gICAgaWYgKG9wdCkge1xuXG4gICAgICBsYW5ndWFnZU1hbmFnZXIudXBkYXRlTGFuZ3VhZ2Uob3B0LmxhbmcpO1xuICAgIH0gZWxzZSB7XG5cbiAgICAgIGxhbmd1YWdlTWFuYWdlci5yZWZyZXNoKCk7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sYW5ndWFnZS1sb2FkZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KCdyZWJ1aWxkJyk7XG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbiNzaG93LWhpZGUtbWFwJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ2JvZHknKS50b2dnbGVDbGFzcygnbWFwLXZpZXcnKVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uLmJ0bi5tb3JlLWl0ZW1zJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJyNlbWJlZC1hcmVhJykudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgLy91cGRhdGUgZW1iZWQgbGluZVxuICAgIHZhciBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHQpKTtcbiAgICBkZWxldGUgY29weVsnbG5nJ107XG4gICAgZGVsZXRlIGNvcHlbJ2xhdCddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDEnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQyJ107XG5cbiAgICAkKCcjZW1iZWQtYXJlYSBpbnB1dFtuYW1lPWVtYmVkXScpLnZhbCgnaHR0cHM6Ly9uZXctbWFwLjM1MC5vcmcjJyArICQucGFyYW0oY29weSkpO1xuICB9KTtcblxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24jem9vbS1vdXQnLCAoZSwgb3B0KSA9PiB7XG5cbiAgICAvLyBtYXBNYW5hZ2VyLnpvb21PdXRPbmNlKCk7XG5cbiAgICBtYXBNYW5hZ2VyLnpvb21VbnRpbEhpdCgpO1xuICB9KVxuXG4gICQod2luZG93KS5vbihcInJlc2l6ZVwiLCAoZSkgPT4ge1xuICAgIG1hcE1hbmFnZXIucmVmcmVzaE1hcCgpO1xuICB9KTtcblxuICAvKipcbiAgRmlsdGVyIENoYW5nZXNcbiAgKi9cbiAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIi5zZWFyY2gtYnV0dG9uIGJ1dHRvblwiLCAoZSkgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwic2VhcmNoLmZvcmNlLXNlYXJjaC1sb2NhdGlvblwiKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKFwia2V5dXBcIiwgXCJpbnB1dFtuYW1lPSdsb2MnXVwiLCAoZSkgPT4ge1xuICAgIGlmIChlLmtleUNvZGUgPT0gMTMpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3NlYXJjaC5mb3JjZS1zZWFyY2gtbG9jYXRpb24nKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdzZWFyY2guZm9yY2Utc2VhcmNoLWxvY2F0aW9uJywgKCkgPT4ge1xuICAgIGxldCBfcXVlcnkgPSAkKFwiaW5wdXRbbmFtZT0nbG9jJ11cIikudmFsKCk7XG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlci5mb3JjZVNlYXJjaChfcXVlcnkpO1xuICAgIC8vIFNlYXJjaCBnb29nbGUgYW5kIGdldCB0aGUgZmlyc3QgcmVzdWx0Li4uIGF1dG9jb21wbGV0ZT9cbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKFwiaGFzaGNoYW5nZVwiLCAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgaWYgKGhhc2gubGVuZ3RoID09IDApIHJldHVybjtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKGhhc2guc3Vic3RyaW5nKDEpKTtcbiAgICBjb25zdCBvbGRVUkwgPSBldmVudC5vcmlnaW5hbEV2ZW50Lm9sZFVSTDtcbiAgICBjb25zdCBvbGRIYXNoID0gJC5kZXBhcmFtKG9sZFVSTC5zdWJzdHJpbmcob2xkVVJMLnNlYXJjaChcIiNcIikrMSkpO1xuXG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCBwYXJhbWV0ZXJzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuXG4gICAgLy8gU28gdGhhdCBjaGFuZ2UgaW4gZmlsdGVycyB3aWxsIG5vdCB1cGRhdGUgdGhpc1xuICAgIGlmIChvbGRIYXNoLmJvdW5kMSAhPT0gcGFyYW1ldGVycy5ib3VuZDEgfHwgb2xkSGFzaC5ib3VuZDIgIT09IHBhcmFtZXRlcnMuYm91bmQyKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLWJ5LWJvdW5kJywgcGFyYW1ldGVycyk7XG4gICAgfVxuXG4gICAgaWYgKG9sZEhhc2gubG9nICE9PSBwYXJhbWV0ZXJzLmxvYykge1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgfVxuXG4gICAgLy8gQ2hhbmdlIGl0ZW1zXG4gICAgaWYgKG9sZEhhc2gubGFuZyAhPT0gcGFyYW1ldGVycy5sYW5nKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgIH1cbiAgfSlcblxuICAvLyA0LiBmaWx0ZXIgb3V0IGl0ZW1zIGluIGFjdGl2aXR5LWFyZWFcblxuICAvLyA1LiBnZXQgbWFwIGVsZW1lbnRzXG5cbiAgLy8gNi4gZ2V0IEdyb3VwIGRhdGFcblxuICAvLyA3LiBwcmVzZW50IGdyb3VwIGVsZW1lbnRzXG5cbiAgJC53aGVuKCgpPT57fSlcbiAgICAudGhlbigoKSA9PntcbiAgICAgIHJldHVybiBsYW5ndWFnZU1hbmFnZXIuaW5pdGlhbGl6ZShpbml0UGFyYW1zWydsYW5nJ10gfHwgJ2VuJyk7XG4gICAgfSlcbiAgICAuZG9uZSgoZGF0YSkgPT4ge30pXG4gICAgLnRoZW4oKCkgPT4ge1xuICAgICAgJC5hamF4KHtcbiAgICAgICAgICB1cmw6ICdodHRwczovL25ldy1tYXAuMzUwLm9yZy9vdXRwdXQvMzUwb3JnLW5ldy1sYXlvdXQuanMuZ3onLCAvLyd8KipEQVRBX1NPVVJDRSoqfCcsXG4gICAgICAgICAgLy8gdXJsOiAnL2RhdGEvdGVzdC5qcycsIC8vJ3wqKkRBVEFfU09VUkNFKip8JyxcbiAgICAgICAgICBkYXRhVHlwZTogJ3NjcmlwdCcsXG4gICAgICAgICAgY2FjaGU6IHRydWUsXG4gICAgICAgICAgc3VjY2VzczogKGRhdGEpID0+IHtcbiAgICAgICAgICAgIC8vIHdpbmRvdy5FVkVOVFNfREFUQSA9IGRhdGE7XG4gICAgICAgICAgICAvL0p1bmUgMTQsIDIwMTgg4oCTIENoYW5nZXNcbiAgICAgICAgICAgIGlmKHdpbmRvdy5xdWVyaWVzLmdyb3VwKSB7XG4gICAgICAgICAgICAgIHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhID0gd2luZG93LkVWRU5UU19EQVRBLmRhdGEuZmlsdGVyKChpKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGkuY2FtcGFpZ24gPT0gd2luZG93LnF1ZXJpZXMuZ3JvdXBcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vTG9hZCBncm91cHNcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbG9hZC1ncm91cHMnLCB7IGdyb3Vwczogd2luZG93LkVWRU5UU19EQVRBLmdyb3VwcyB9KTtcblxuXG4gICAgICAgICAgICB2YXIgcGFyYW1ldGVycyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG5cbiAgICAgICAgICAgIHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgaXRlbVsnZXZlbnRfdHlwZSddID0gIWl0ZW0uZXZlbnRfdHlwZSA/ICdBY3Rpb24nIDogaXRlbS5ldmVudF90eXBlO1xuXG4gICAgICAgICAgICAgIGlmIChpdGVtLnN0YXJ0X2RhdGV0aW1lICYmICFpdGVtLnN0YXJ0X2RhdGV0aW1lLm1hdGNoKC9aJC8pKSB7XG4gICAgICAgICAgICAgICAgaXRlbS5zdGFydF9kYXRldGltZSA9IGl0ZW0uc3RhcnRfZGF0ZXRpbWUgKyBcIlpcIjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgIC8vICAgcmV0dXJuIG5ldyBEYXRlKGEuc3RhcnRfZGF0ZXRpbWUpIC0gbmV3IERhdGUoYi5zdGFydF9kYXRldGltZSk7XG4gICAgICAgICAgICAvLyB9KVxuXG5cbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC11cGRhdGUnLCB7IHBhcmFtczogcGFyYW1ldGVycyB9KTtcbiAgICAgICAgICAgIC8vICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1wbG90Jywge1xuICAgICAgICAgICAgICAgIGRhdGE6IHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhLFxuICAgICAgICAgICAgICAgIHBhcmFtczogcGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgICBncm91cHM6IHdpbmRvdy5FVkVOVFNfREFUQS5ncm91cHMucmVkdWNlKChkaWN0LCBpdGVtKT0+eyBkaWN0W2l0ZW0uc3VwZXJncm91cF0gPSBpdGVtOyByZXR1cm4gZGljdDsgfSwge30pXG4gICAgICAgICAgICB9KTtcbiAgICAgIC8vIH0pO1xuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgIC8vVE9ETzogTWFrZSB0aGUgZ2VvanNvbiBjb252ZXJzaW9uIGhhcHBlbiBvbiB0aGUgYmFja2VuZFxuXG4gICAgICAgICAgICAvL1JlZnJlc2ggdGhpbmdzXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgbGV0IHAgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuXG4gICAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHApO1xuICAgICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCBwKTtcblxuICAgICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHApO1xuICAgICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLWJ5LWJvdW5kJywgcCk7XG5cbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG5cblxufSkoalF1ZXJ5KTtcbiJdfQ==
