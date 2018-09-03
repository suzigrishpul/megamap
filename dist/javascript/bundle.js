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

          var annotIcon = L.icon({
            iconUrl: "/img/annotation.png",
            iconSize: [50, 50],
            iconAnchor: [25, 25],
            className: 'annotation-popup'
          });
          console.log(renderAnnotationPopup);
          var annotMarkers = annotations.map(function (item) {
            return L.marker([item.lat, item.lng], { icon: annotIcon }).bindPopup(renderAnnotationPopup(item));
          });
          // annotLayer.bringToFront();

          console.log(annotMarkers);

          // const annotLayerGroup = ;

          var annotLayerGroup = map.addLayer(L.featureGroup(annotMarkers));
          console.log(annotLayerGroup);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9oZWxwZXIuanMiLCJjbGFzc2VzL2xhbmd1YWdlLmpzIiwiY2xhc3Nlcy9saXN0LmpzIiwiY2xhc3Nlcy9tYXAuanMiLCJjbGFzc2VzL3F1ZXJ5LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIkF1dG9jb21wbGV0ZU1hbmFnZXIiLCIkIiwidGFyZ2V0IiwiQVBJX0tFWSIsInRhcmdldEl0ZW0iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJxdWVyeU1nciIsIlF1ZXJ5TWFuYWdlciIsImdlb2NvZGVyIiwiZ29vZ2xlIiwibWFwcyIsIkdlb2NvZGVyIiwiJHRhcmdldCIsImZvcmNlU2VhcmNoIiwicSIsImdlb2NvZGUiLCJhZGRyZXNzIiwicmVzdWx0cyIsInN0YXR1cyIsImdlb21ldHJ5IiwidXBkYXRlVmlld3BvcnQiLCJ2aWV3cG9ydCIsInZhbCIsImZvcm1hdHRlZF9hZGRyZXNzIiwiaW5pdGlhbGl6ZSIsInR5cGVhaGVhZCIsImhpbnQiLCJoaWdobGlnaHQiLCJtaW5MZW5ndGgiLCJjbGFzc05hbWVzIiwibWVudSIsIm5hbWUiLCJkaXNwbGF5IiwiaXRlbSIsImxpbWl0Iiwic291cmNlIiwic3luYyIsImFzeW5jIiwib24iLCJvYmoiLCJkYXR1bSIsImpRdWVyeSIsIkhlbHBlciIsInJlZlNvdXJjZSIsInVybCIsInJlZiIsInNyYyIsImluZGV4T2YiLCJMYW5ndWFnZU1hbmFnZXIiLCJsYW5ndWFnZSIsImRpY3Rpb25hcnkiLCIkdGFyZ2V0cyIsInVwZGF0ZVBhZ2VMYW5ndWFnZSIsInRhcmdldExhbmd1YWdlIiwicm93cyIsImZpbHRlciIsImkiLCJsYW5nIiwiZWFjaCIsImluZGV4IiwidGFyZ2V0QXR0cmlidXRlIiwiZGF0YSIsImxhbmdUYXJnZXQiLCJ0ZXh0IiwiYXR0ciIsInRhcmdldHMiLCJhamF4IiwiZGF0YVR5cGUiLCJzdWNjZXNzIiwidHJpZ2dlciIsIm11bHRpc2VsZWN0IiwicmVmcmVzaCIsInVwZGF0ZUxhbmd1YWdlIiwiZ2V0VHJhbnNsYXRpb24iLCJrZXkiLCJMaXN0TWFuYWdlciIsIm9wdGlvbnMiLCJ0YXJnZXRMaXN0IiwicmVmZXJyZXIiLCJyZW5kZXJFdmVudCIsIm0iLCJtb21lbnQiLCJEYXRlIiwic3RhcnRfZGF0ZXRpbWUiLCJ1dGMiLCJzdWJ0cmFjdCIsInV0Y09mZnNldCIsImRhdGUiLCJmb3JtYXQiLCJtYXRjaCIsIndpbmRvdyIsInNsdWdpZnkiLCJldmVudF90eXBlIiwibGF0IiwibG5nIiwidGl0bGUiLCJ2ZW51ZSIsInJlbmRlckdyb3VwIiwid2Vic2l0ZSIsInN1cGVyR3JvdXAiLCJzdXBlcmdyb3VwIiwibG9jYXRpb24iLCJkZXNjcmlwdGlvbiIsIiRsaXN0IiwidXBkYXRlRmlsdGVyIiwicCIsInJlbW92ZVByb3AiLCJhZGRDbGFzcyIsImpvaW4iLCJmaW5kIiwiaGlkZSIsImZvckVhY2giLCJmaWwiLCJzaG93IiwidXBkYXRlQm91bmRzIiwiYm91bmQxIiwiYm91bmQyIiwiaW5kIiwiX2xhdCIsIl9sbmciLCJtaTEwIiwicmVtb3ZlQ2xhc3MiLCJfdmlzaWJsZSIsImxlbmd0aCIsInBvcHVsYXRlTGlzdCIsImhhcmRGaWx0ZXJzIiwia2V5U2V0Iiwic3BsaXQiLCIkZXZlbnRMaXN0IiwiRVZFTlRTX0RBVEEiLCJtYXAiLCJ0b0xvd2VyQ2FzZSIsImluY2x1ZGVzIiwicmVtb3ZlIiwiYXBwZW5kIiwiTWFwTWFuYWdlciIsIkxBTkdVQUdFIiwicmVuZGVyQW5ub3RhdGlvblBvcHVwIiwicmVuZGVyQW5ub3RhdGlvbnNHZW9Kc29uIiwibGlzdCIsInJlbmRlcmVkIiwidHlwZSIsImNvb3JkaW5hdGVzIiwicHJvcGVydGllcyIsImFubm90YXRpb25Qcm9wcyIsInBvcHVwQ29udGVudCIsInJlbmRlckdlb2pzb24iLCJpc05hTiIsInBhcnNlRmxvYXQiLCJzdWJzdHJpbmciLCJldmVudFByb3BlcnRpZXMiLCJhY2Nlc3NUb2tlbiIsIkwiLCJkcmFnZ2luZyIsIkJyb3dzZXIiLCJtb2JpbGUiLCJzZXRWaWV3Iiwic2Nyb2xsV2hlZWxab29tIiwiZGlzYWJsZSIsIm9uTW92ZSIsImV2ZW50Iiwic3ciLCJnZXRCb3VuZHMiLCJfc291dGhXZXN0IiwibmUiLCJfbm9ydGhFYXN0IiwiZ2V0Wm9vbSIsInRpbGVMYXllciIsImF0dHJpYnV0aW9uIiwiYWRkVG8iLCJxdWVyaWVzIiwidGVybWluYXRvciIsIiRtYXAiLCJjYWxsYmFjayIsInNldEJvdW5kcyIsImJvdW5kczEiLCJib3VuZHMyIiwiYm91bmRzIiwiZml0Qm91bmRzIiwiYW5pbWF0ZSIsInNldENlbnRlciIsImNlbnRlciIsInpvb20iLCJnZXRDZW50ZXJCeUxvY2F0aW9uIiwidHJpZ2dlclpvb21FbmQiLCJmaXJlRXZlbnQiLCJ6b29tT3V0T25jZSIsInpvb21PdXQiLCJ6b29tVW50aWxIaXQiLCIkdGhpcyIsImludGVydmFsSGFuZGxlciIsInNldEludGVydmFsIiwiY2xlYXJJbnRlcnZhbCIsInJlZnJlc2hNYXAiLCJpbnZhbGlkYXRlU2l6ZSIsImZpbHRlck1hcCIsImZpbHRlcnMiLCJwbG90UG9pbnRzIiwiZ3JvdXBzIiwiZ2VvanNvbiIsImZlYXR1cmVzIiwiZXZlbnRzTGF5ZXIiLCJnZW9KU09OIiwicG9pbnRUb0xheWVyIiwiZmVhdHVyZSIsImxhdGxuZyIsImV2ZW50VHlwZSIsInNsdWdnZWQiLCJpY29uVXJsIiwiaXNQYXN0IiwiaWNvbnVybCIsInNtYWxsSWNvbiIsImljb24iLCJpY29uU2l6ZSIsImljb25BbmNob3IiLCJjbGFzc05hbWUiLCJnZW9qc29uTWFya2VyT3B0aW9ucyIsIm1hcmtlciIsIm9uRWFjaEZlYXR1cmUiLCJsYXllciIsImJpbmRQb3B1cCIsImFubm90YXRpb24iLCJhbm5vdGF0aW9ucyIsImFubm90SWNvbiIsImNvbnNvbGUiLCJsb2ciLCJhbm5vdE1hcmtlcnMiLCJhbm5vdExheWVyR3JvdXAiLCJhZGRMYXllciIsImZlYXR1cmVHcm91cCIsInVwZGF0ZSIsImxhdExuZyIsInRhcmdldEZvcm0iLCJwcmV2aW91cyIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImZvcm0iLCJkZXBhcmFtIiwic2VyaWFsaXplIiwiaGFzaCIsInBhcmFtIiwicGFyYW1zIiwibG9jIiwicHJvcCIsImdldFBhcmFtZXRlcnMiLCJwYXJhbWV0ZXJzIiwidXBkYXRlTG9jYXRpb24iLCJNYXRoIiwiYWJzIiwiZiIsImIiLCJmQXZnIiwiYkF2ZyIsIkpTT04iLCJzdHJpbmdpZnkiLCJ1cGRhdGVWaWV3cG9ydEJ5Qm91bmQiLCJ0cmlnZ2VyU3VibWl0IiwiYXV0b2NvbXBsZXRlTWFuYWdlciIsIm1hcE1hbmFnZXIiLCJERUZBVUxUX0lDT04iLCJ0b1N0cmluZyIsInJlcGxhY2UiLCJnZXRRdWVyeVN0cmluZyIsInF1ZXJ5U3RyaW5nS2V5VmFsdWUiLCJwYXJlbnQiLCJzZWFyY2giLCJxc0pzb25PYmplY3QiLCJncm91cCIsIndpZHRoIiwiY3NzIiwiYnVpbGRGaWx0ZXJzIiwiZW5hYmxlSFRNTCIsInRlbXBsYXRlcyIsImJ1dHRvbiIsImxpIiwiZHJvcFJpZ2h0Iiwib25Jbml0aWFsaXplZCIsIm9uRHJvcGRvd25TaG93Iiwic2V0VGltZW91dCIsIm9uRHJvcGRvd25IaWRlIiwib3B0aW9uTGFiZWwiLCJ1bmVzY2FwZSIsImh0bWwiLCJvcHRpb25DbGFzcyIsInNlbGVjdGVkQ2xhc3MiLCJidXR0b25DbGFzcyIsIm9uQ2hhbmdlIiwib3B0aW9uIiwiY2hlY2tlZCIsInNlbGVjdCIsInF1ZXJ5TWFuYWdlciIsImluaXRQYXJhbXMiLCJsYW5ndWFnZU1hbmFnZXIiLCJsaXN0TWFuYWdlciIsImluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayIsInJlc3VsdCIsImhlaWdodCIsInBhcnNlIiwiY29weSIsImNvcHlUZXh0IiwiZ2V0RWxlbWVudEJ5SWQiLCJleGVjQ29tbWFuZCIsIm9wdCIsImVtcHR5IiwidmFsdWVUZXh0IiwidHJhbnNsYXRpb24iLCJ0b2dnbGVDbGFzcyIsImtleUNvZGUiLCJfcXVlcnkiLCJvbGRVUkwiLCJvcmlnaW5hbEV2ZW50Iiwib2xkSGFzaCIsIndoZW4iLCJ0aGVuIiwiZG9uZSIsImNhY2hlIiwiY2FtcGFpZ24iLCJyZWR1Y2UiLCJkaWN0Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOztBQUNBLElBQU1BLHNCQUF1QixVQUFTQyxDQUFULEVBQVk7QUFDdkM7O0FBRUEsU0FBTyxVQUFDQyxNQUFELEVBQVk7O0FBRWpCLFFBQU1DLFVBQVUseUNBQWhCO0FBQ0EsUUFBTUMsYUFBYSxPQUFPRixNQUFQLElBQWlCLFFBQWpCLEdBQTRCRyxTQUFTQyxhQUFULENBQXVCSixNQUF2QixDQUE1QixHQUE2REEsTUFBaEY7QUFDQSxRQUFNSyxXQUFXQyxjQUFqQjtBQUNBLFFBQUlDLFdBQVcsSUFBSUMsT0FBT0MsSUFBUCxDQUFZQyxRQUFoQixFQUFmOztBQUVBLFdBQU87QUFDTEMsZUFBU1osRUFBRUcsVUFBRixDQURKO0FBRUxGLGNBQVFFLFVBRkg7QUFHTFUsbUJBQWEscUJBQUNDLENBQUQsRUFBTztBQUNsQk4saUJBQVNPLE9BQVQsQ0FBaUIsRUFBRUMsU0FBU0YsQ0FBWCxFQUFqQixFQUFpQyxVQUFVRyxPQUFWLEVBQW1CQyxNQUFuQixFQUEyQjtBQUMxRCxjQUFJRCxRQUFRLENBQVIsQ0FBSixFQUFnQjtBQUNkLGdCQUFJRSxXQUFXRixRQUFRLENBQVIsRUFBV0UsUUFBMUI7QUFDQWIscUJBQVNjLGNBQVQsQ0FBd0JELFNBQVNFLFFBQWpDO0FBQ0FyQixjQUFFRyxVQUFGLEVBQWNtQixHQUFkLENBQWtCTCxRQUFRLENBQVIsRUFBV00saUJBQTdCO0FBQ0Q7QUFDRDtBQUNBO0FBRUQsU0FURDtBQVVELE9BZEk7QUFlTEMsa0JBQVksc0JBQU07QUFDaEJ4QixVQUFFRyxVQUFGLEVBQWNzQixTQUFkLENBQXdCO0FBQ1pDLGdCQUFNLElBRE07QUFFWkMscUJBQVcsSUFGQztBQUdaQyxxQkFBVyxDQUhDO0FBSVpDLHNCQUFZO0FBQ1ZDLGtCQUFNO0FBREk7QUFKQSxTQUF4QixF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QTRDZ0wsVUFBNUM7QUFDQTs7QUFFQTtBQUNBaUMsbUJBQVcsWUFBTTtBQUNmLGNBQUk3SyxJQUFJeUwsYUFBYTlDLGFBQWIsRUFBUjs7QUFFQXBQLFlBQUVJLFFBQUYsRUFBWWlFLE9BQVosQ0FBb0Isb0JBQXBCLEVBQTBDb0MsQ0FBMUM7QUFDQXpHLFlBQUVJLFFBQUYsRUFBWWlFLE9BQVosQ0FBb0Isb0JBQXBCLEVBQTBDb0MsQ0FBMUM7O0FBRUF6RyxZQUFFSSxRQUFGLEVBQVlpRSxPQUFaLENBQW9CLDRCQUFwQixFQUFrRG9DLENBQWxEO0FBQ0F6RyxZQUFFSSxRQUFGLEVBQVlpRSxPQUFaLENBQW9CLDhCQUFwQixFQUFvRG9DLENBQXBEO0FBRUQsU0FURCxFQVNHLEdBVEg7QUFVRDtBQXZERSxLQUFQO0FBeURDLEdBL0RMO0FBbUVELENBMWFELEVBMGFHaEUsTUExYUgiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vL0FQSSA6QUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXG5jb25zdCBBdXRvY29tcGxldGVNYW5hZ2VyID0gKGZ1bmN0aW9uKCQpIHtcbiAgLy9Jbml0aWFsaXphdGlvbi4uLlxuXG4gIHJldHVybiAodGFyZ2V0KSA9PiB7XG5cbiAgICBjb25zdCBBUElfS0VZID0gXCJBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cIjtcbiAgICBjb25zdCB0YXJnZXRJdGVtID0gdHlwZW9mIHRhcmdldCA9PSBcInN0cmluZ1wiID8gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpIDogdGFyZ2V0O1xuICAgIGNvbnN0IHF1ZXJ5TWdyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgdmFyIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgJHRhcmdldDogJCh0YXJnZXRJdGVtKSxcbiAgICAgIHRhcmdldDogdGFyZ2V0SXRlbSxcbiAgICAgIGZvcmNlU2VhcmNoOiAocSkgPT4ge1xuICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogcSB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG4gICAgICAgICAgaWYgKHJlc3VsdHNbMF0pIHtcbiAgICAgICAgICAgIGxldCBnZW9tZXRyeSA9IHJlc3VsdHNbMF0uZ2VvbWV0cnk7XG4gICAgICAgICAgICBxdWVyeU1nci51cGRhdGVWaWV3cG9ydChnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAkKHRhcmdldEl0ZW0pLnZhbChyZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gdmFyIGdlb21ldHJ5ID0gZGF0dW0uZ2VvbWV0cnk7XG4gICAgICAgICAgLy8gcXVlcnlNZ3IudXBkYXRlVmlld3BvcnQoZ2VvbWV0cnkudmlld3BvcnQpO1xuXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGluaXRpYWxpemU6ICgpID0+IHtcbiAgICAgICAgJCh0YXJnZXRJdGVtKS50eXBlYWhlYWQoe1xuICAgICAgICAgICAgICAgICAgICBoaW50OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1pbkxlbmd0aDogNCxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICAgIG1lbnU6ICd0dC1kcm9wZG93bi1tZW51J1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnc2VhcmNoLXJlc3VsdHMnLFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAoaXRlbSkgPT4gaXRlbS5mb3JtYXR0ZWRfYWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgbGltaXQ6IDEwLFxuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IGZ1bmN0aW9uIChxLCBzeW5jLCBhc3luYyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogcSB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFzeW5jKHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApLm9uKCd0eXBlYWhlYWQ6c2VsZWN0ZWQnLCBmdW5jdGlvbiAob2JqLCBkYXR1bSkge1xuICAgICAgICAgICAgICAgICAgICBpZihkYXR1bSlcbiAgICAgICAgICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgICAgICAgdmFyIGdlb21ldHJ5ID0gZGF0dW0uZ2VvbWV0cnk7XG4gICAgICAgICAgICAgICAgICAgICAgcXVlcnlNZ3IudXBkYXRlVmlld3BvcnQoZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgICAgIC8vICBtYXAuZml0Qm91bmRzKGdlb21ldHJ5LmJvdW5kcz8gZ2VvbWV0cnkuYm91bmRzIDogZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG5cblxuICAgIHJldHVybiB7XG5cbiAgICB9XG4gIH1cblxufShqUXVlcnkpKTtcbiIsImNvbnN0IEhlbHBlciA9ICgoJCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICByZWZTb3VyY2U6ICh1cmwsIHJlZiwgc3JjKSA9PiB7XG4gICAgICAgIC8vIEp1biAxMyAyMDE4IOKAlCBGaXggZm9yIHNvdXJjZSBhbmQgcmVmZXJyZXJcbiAgICAgICAgaWYgKHJlZiB8fCBzcmMpIHtcbiAgICAgICAgICBpZiAodXJsLmluZGV4T2YoXCI/XCIpID49IDApIHtcbiAgICAgICAgICAgIHVybCA9IGAke3VybH0mcmVmZXJyZXI9JHtyZWZ8fFwiXCJ9JnNvdXJjZT0ke3NyY3x8XCJcIn1gO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1cmwgPSBgJHt1cmx9P3JlZmVycmVyPSR7cmVmfHxcIlwifSZzb3VyY2U9JHtzcmN8fFwiXCJ9YDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdXJsO1xuICAgICAgfVxuICAgIH07XG59KShqUXVlcnkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBMYW5ndWFnZU1hbmFnZXIgPSAoKCQpID0+IHtcbiAgLy9rZXlWYWx1ZVxuXG4gIC8vdGFyZ2V0cyBhcmUgdGhlIG1hcHBpbmdzIGZvciB0aGUgbGFuZ3VhZ2VcbiAgcmV0dXJuICgpID0+IHtcbiAgICBsZXQgbGFuZ3VhZ2U7XG4gICAgbGV0IGRpY3Rpb25hcnkgPSB7fTtcbiAgICBsZXQgJHRhcmdldHMgPSAkKFwiW2RhdGEtbGFuZy10YXJnZXRdW2RhdGEtbGFuZy1rZXldXCIpO1xuXG4gICAgY29uc3QgdXBkYXRlUGFnZUxhbmd1YWdlID0gKCkgPT4ge1xuXG4gICAgICBsZXQgdGFyZ2V0TGFuZ3VhZ2UgPSBkaWN0aW9uYXJ5LnJvd3MuZmlsdGVyKChpKSA9PiBpLmxhbmcgPT09IGxhbmd1YWdlKVswXTtcblxuICAgICAgJHRhcmdldHMuZWFjaCgoaW5kZXgsIGl0ZW0pID0+IHtcblxuICAgICAgICBsZXQgdGFyZ2V0QXR0cmlidXRlID0gJChpdGVtKS5kYXRhKCdsYW5nLXRhcmdldCcpO1xuICAgICAgICBsZXQgbGFuZ1RhcmdldCA9ICQoaXRlbSkuZGF0YSgnbGFuZy1rZXknKTtcblxuXG5cblxuICAgICAgICBzd2l0Y2godGFyZ2V0QXR0cmlidXRlKSB7XG4gICAgICAgICAgY2FzZSAndGV4dCc6XG5cbiAgICAgICAgICAgICQoKGBbZGF0YS1sYW5nLWtleT1cIiR7bGFuZ1RhcmdldH1cIl1gKSkudGV4dCh0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBpZiAobGFuZ1RhcmdldCA9PSBcIm1vcmUtc2VhcmNoLW9wdGlvbnNcIikge1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd2YWx1ZSc6XG4gICAgICAgICAgICAkKGl0ZW0pLnZhbCh0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgJChpdGVtKS5hdHRyKHRhcmdldEF0dHJpYnV0ZSwgdGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICBsYW5ndWFnZSxcbiAgICAgIHRhcmdldHM6ICR0YXJnZXRzLFxuICAgICAgZGljdGlvbmFyeSxcbiAgICAgIGluaXRpYWxpemU6IChsYW5nKSA9PiB7XG5cbiAgICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgICAgLy8gdXJsOiAnaHR0cHM6Ly9nc3gyanNvbi5jb20vYXBpP2lkPTFPM2VCeWpMMXZsWWY3WjdhbS1faHRSVFFpNzNQYWZxSWZOQmRMbVhlOFNNJnNoZWV0PTEnLFxuICAgICAgICAgIHVybDogJy9kYXRhL2xhbmcuanNvbicsXG4gICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgZGljdGlvbmFyeSA9IGRhdGE7XG4gICAgICAgICAgICBsYW5ndWFnZSA9IGxhbmc7XG4gICAgICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UoKTtcblxuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sYW5ndWFnZS1sb2FkZWQnKTtcblxuICAgICAgICAgICAgJChcIiNsYW5ndWFnZS1vcHRzXCIpLm11bHRpc2VsZWN0KCdzZWxlY3QnLCBsYW5nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHJlZnJlc2g6ICgpID0+IHtcbiAgICAgICAgdXBkYXRlUGFnZUxhbmd1YWdlKGxhbmd1YWdlKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVMYW5ndWFnZTogKGxhbmcpID0+IHtcblxuICAgICAgICBsYW5ndWFnZSA9IGxhbmc7XG4gICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZSgpO1xuICAgICAgfSxcbiAgICAgIGdldFRyYW5zbGF0aW9uOiAoa2V5KSA9PiB7XG4gICAgICAgIGxldCB0YXJnZXRMYW5ndWFnZSA9IGRpY3Rpb25hcnkucm93cy5maWx0ZXIoKGkpID0+IGkubGFuZyA9PT0gbGFuZ3VhZ2UpWzBdO1xuICAgICAgICByZXR1cm4gdGFyZ2V0TGFuZ3VhZ2Vba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbn0pKGpRdWVyeSk7XG4iLCIvKiBUaGlzIGxvYWRzIGFuZCBtYW5hZ2VzIHRoZSBsaXN0ISAqL1xuXG5jb25zdCBMaXN0TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKG9wdGlvbnMpID0+IHtcbiAgICBsZXQgdGFyZ2V0TGlzdCA9IG9wdGlvbnMudGFyZ2V0TGlzdCB8fCBcIiNldmVudHMtbGlzdFwiO1xuICAgIC8vIEp1bmUgMTMgYDE4IOKAkyByZWZlcnJlciBhbmQgc291cmNlXG4gICAgbGV0IHtyZWZlcnJlciwgc291cmNlfSA9IG9wdGlvbnM7XG5cbiAgICBjb25zdCAkdGFyZ2V0ID0gdHlwZW9mIHRhcmdldExpc3QgPT09ICdzdHJpbmcnID8gJCh0YXJnZXRMaXN0KSA6IHRhcmdldExpc3Q7XG5cbiAgICBjb25zdCByZW5kZXJFdmVudCA9IChpdGVtLCByZWZlcnJlciA9IG51bGwsIHNvdXJjZSA9IG51bGwpID0+IHtcbiAgICAgIGxldCBtID0gbW9tZW50KG5ldyBEYXRlKGl0ZW0uc3RhcnRfZGF0ZXRpbWUpKTtcbiAgICAgIG0gPSBtLnV0YygpLnN1YnRyYWN0KG0udXRjT2Zmc2V0KCksICdtJyk7XG4gICAgICB2YXIgZGF0ZSA9IG0uZm9ybWF0KFwiZGRkZCBNTU0gREQsIGg6bW1hXCIpO1xuICAgICAgbGV0IHVybCA9IGl0ZW0udXJsLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0udXJsIDogXCIvL1wiICsgaXRlbS51cmw7XG4gICAgICAvLyBsZXQgc3VwZXJHcm91cCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG4gICAgICB1cmwgPSBIZWxwZXIucmVmU291cmNlKHVybCwgcmVmZXJyZXIsIHNvdXJjZSk7XG5cbiAgICAgIHJldHVybiBgXG4gICAgICA8bGkgY2xhc3M9JyR7d2luZG93LnNsdWdpZnkoaXRlbS5ldmVudF90eXBlKX0gZXZlbnRzIGV2ZW50LW9iaicgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudCB0eXBlLWFjdGlvblwiPlxuICAgICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICAgIDxsaSBjbGFzcz0ndGFnLSR7aXRlbS5ldmVudF90eXBlfSB0YWcnPiR7aXRlbS5ldmVudF90eXBlfTwvbGk+XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgICA8aDIgY2xhc3M9XCJldmVudC10aXRsZVwiPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1kYXRlIGRhdGVcIj4ke2RhdGV9PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWFkZHJlc3MgYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+UlNWUDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICAgYFxuICAgIH07XG5cbiAgICBjb25zdCByZW5kZXJHcm91cCA9IChpdGVtLCByZWZlcnJlciA9IG51bGwsIHNvdXJjZSA9IG51bGwpID0+IHtcbiAgICAgIGxldCB1cmwgPSBpdGVtLndlYnNpdGUubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS53ZWJzaXRlIDogXCIvL1wiICsgaXRlbS53ZWJzaXRlO1xuICAgICAgbGV0IHN1cGVyR3JvdXAgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuXG4gICAgICB1cmwgPSBIZWxwZXIucmVmU291cmNlKHVybCwgcmVmZXJyZXIsIHNvdXJjZSk7XG5cbiAgICAgIHJldHVybiBgXG4gICAgICA8bGkgY2xhc3M9JyR7aXRlbS5ldmVudF90eXBlfSAke3N1cGVyR3JvdXB9IGdyb3VwLW9iaicgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ncm91cCBncm91cC1vYmpcIj5cbiAgICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5zdXBlcmdyb3VwfVwiPiR7aXRlbS5zdXBlcmdyb3VwfTwvbGk+XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0ubmFtZX08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtbG9jYXRpb24gbG9jYXRpb25cIj4ke2l0ZW0ubG9jYXRpb259PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGVzY3JpcHRpb25cIj5cbiAgICAgICAgICAgICAgPHA+JHtpdGVtLmRlc2NyaXB0aW9ufTwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+R2V0IEludm9sdmVkPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAkbGlzdDogJHRhcmdldCxcbiAgICAgIHVwZGF0ZUZpbHRlcjogKHApID0+IHtcbiAgICAgICAgaWYoIXApIHJldHVybjtcblxuICAgICAgICAvLyBSZW1vdmUgRmlsdGVyc1xuXG4gICAgICAgICR0YXJnZXQucmVtb3ZlUHJvcChcImNsYXNzXCIpO1xuICAgICAgICAkdGFyZ2V0LmFkZENsYXNzKHAuZmlsdGVyID8gcC5maWx0ZXIuam9pbihcIiBcIikgOiAnJylcblxuICAgICAgICAkdGFyZ2V0LmZpbmQoJ2xpJykuaGlkZSgpO1xuXG4gICAgICAgIGlmIChwLmZpbHRlcikge1xuICAgICAgICAgIHAuZmlsdGVyLmZvckVhY2goKGZpbCk9PntcbiAgICAgICAgICAgICR0YXJnZXQuZmluZChgbGkuJHtmaWx9YCkuc2hvdygpO1xuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB1cGRhdGVCb3VuZHM6IChib3VuZDEsIGJvdW5kMikgPT4ge1xuXG4gICAgICAgIC8vIGNvbnN0IGJvdW5kcyA9IFtwLmJvdW5kczEsIHAuYm91bmRzMl07XG5cblxuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsIGxpLmV2ZW50LW9iaiwgdWwgbGkuZ3JvdXAtb2JqJykuZWFjaCgoaW5kLCBpdGVtKT0+IHtcblxuICAgICAgICAgIGxldCBfbGF0ID0gJChpdGVtKS5kYXRhKCdsYXQnKSxcbiAgICAgICAgICAgICAgX2xuZyA9ICQoaXRlbSkuZGF0YSgnbG5nJyk7XG5cbiAgICAgICAgICBjb25zdCBtaTEwID0gMC4xNDQ5O1xuXG4gICAgICAgICAgaWYgKGJvdW5kMVswXSA8PSBfbGF0ICYmIGJvdW5kMlswXSA+PSBfbGF0ICYmIGJvdW5kMVsxXSA8PSBfbG5nICYmIGJvdW5kMlsxXSA+PSBfbG5nKSB7XG5cbiAgICAgICAgICAgICQoaXRlbSkuYWRkQ2xhc3MoJ3dpdGhpbi1ib3VuZCcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKGl0ZW0pLnJlbW92ZUNsYXNzKCd3aXRoaW4tYm91bmQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBfdmlzaWJsZSA9ICR0YXJnZXQuZmluZCgndWwgbGkuZXZlbnQtb2JqLndpdGhpbi1ib3VuZCwgdWwgbGkuZ3JvdXAtb2JqLndpdGhpbi1ib3VuZCcpLmxlbmd0aDtcbiAgICAgICAgaWYgKF92aXNpYmxlID09IDApIHtcbiAgICAgICAgICAvLyBUaGUgbGlzdCBpcyBlbXB0eVxuICAgICAgICAgICR0YXJnZXQuYWRkQ2xhc3MoXCJpcy1lbXB0eVwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkdGFyZ2V0LnJlbW92ZUNsYXNzKFwiaXMtZW1wdHlcIik7XG4gICAgICAgIH1cblxuICAgICAgfSxcbiAgICAgIHBvcHVsYXRlTGlzdDogKGhhcmRGaWx0ZXJzKSA9PiB7XG4gICAgICAgIC8vdXNpbmcgd2luZG93LkVWRU5UX0RBVEFcbiAgICAgICAgY29uc3Qga2V5U2V0ID0gIWhhcmRGaWx0ZXJzLmtleSA/IFtdIDogaGFyZEZpbHRlcnMua2V5LnNwbGl0KCcsJyk7XG5cbiAgICAgICAgdmFyICRldmVudExpc3QgPSB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YS5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgaWYgKGtleVNldC5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0uZXZlbnRfdHlwZSAmJiBpdGVtLmV2ZW50X3R5cGUudG9Mb3dlckNhc2UoKSA9PSAnZ3JvdXAnID8gcmVuZGVyR3JvdXAoaXRlbSkgOiByZW5kZXJFdmVudChpdGVtLCByZWZlcnJlciwgc291cmNlKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtleVNldC5sZW5ndGggPiAwICYmIGl0ZW0uZXZlbnRfdHlwZSAhPSAnZ3JvdXAnICYmIGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyRXZlbnQoaXRlbSwgcmVmZXJyZXIsIHNvdXJjZSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXlTZXQubGVuZ3RoID4gMCAmJiBpdGVtLmV2ZW50X3R5cGUgPT0gJ2dyb3VwJyAmJiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5zdXBlcmdyb3VwKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlbmRlckdyb3VwKGl0ZW0sIHJlZmVycmVyLCBzb3VyY2UpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgfSlcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCBsaScpLnJlbW92ZSgpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsJykuYXBwZW5kKCRldmVudExpc3QpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJcblxuY29uc3QgTWFwTWFuYWdlciA9ICgoJCkgPT4ge1xuICBsZXQgTEFOR1VBR0UgPSAnZW4nO1xuXG4gIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0sIHJlZmVycmVyID0gbnVsbCwgc291cmNlID0gbnVsbCkgPT4ge1xuXG4gICAgbGV0IG0gPSBtb21lbnQobmV3IERhdGUoaXRlbS5zdGFydF9kYXRldGltZSkpO1xuICAgIG0gPSBtLnV0YygpLnN1YnRyYWN0KG0udXRjT2Zmc2V0KCksICdtJyk7XG5cbiAgICB2YXIgZGF0ZSA9IG0uZm9ybWF0KFwiZGRkZCBNTU0gREQsIGg6bW1hXCIpO1xuICAgIGxldCB1cmwgPSBpdGVtLnVybC5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLnVybCA6IFwiLy9cIiArIGl0ZW0udXJsO1xuXG4gICAgdXJsID0gSGVscGVyLnJlZlNvdXJjZSh1cmwsIHJlZmVycmVyLCBzb3VyY2UpO1xuXG4gICAgbGV0IHN1cGVyR3JvdXAgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuICAgIHJldHVybiBgXG4gICAgPGRpdiBjbGFzcz0ncG9wdXAtaXRlbSAke2l0ZW0uZXZlbnRfdHlwZX0gJHtzdXBlckdyb3VwfScgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnRcIj5cbiAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctJHtpdGVtLmV2ZW50X3R5cGV9XCI+JHtpdGVtLmV2ZW50X3R5cGUgfHwgJ0FjdGlvbid9PC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPGgyIGNsYXNzPVwiZXZlbnQtdGl0bGVcIj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZX08L2E+PC9oMj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWRhdGVcIj4ke2RhdGV9PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1hZGRyZXNzIGFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgIDxwPiR7aXRlbS52ZW51ZX08L3A+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5SU1ZQPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICAgIGBcbiAgfTtcblxuICBjb25zdCByZW5kZXJHcm91cCA9IChpdGVtLCByZWZlcnJlciA9IG51bGwsIHNvdXJjZSA9IG51bGwpID0+IHtcblxuICAgIGxldCB1cmwgPSBpdGVtLndlYnNpdGUubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS53ZWJzaXRlIDogXCIvL1wiICsgaXRlbS53ZWJzaXRlO1xuXG4gICAgdXJsID0gSGVscGVyLnJlZlNvdXJjZSh1cmwsIHJlZmVycmVyLCBzb3VyY2UpO1xuXG4gICAgbGV0IHN1cGVyR3JvdXAgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuICAgIHJldHVybiBgXG4gICAgPGxpPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXAgZ3JvdXAtb2JqICR7c3VwZXJHcm91cH1cIj5cbiAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctJHtpdGVtLnN1cGVyZ3JvdXB9ICR7c3VwZXJHcm91cH1cIj4ke2l0ZW0uc3VwZXJncm91cH08L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtaGVhZGVyXCI+XG4gICAgICAgICAgPGgyPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLm5hbWV9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWxvY2F0aW9uIGxvY2F0aW9uXCI+JHtpdGVtLmxvY2F0aW9ufTwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXNjcmlwdGlvblwiPlxuICAgICAgICAgICAgPHA+JHtpdGVtLmRlc2NyaXB0aW9ufTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPkdldCBJbnZvbHZlZDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2xpPlxuICAgIGBcbiAgfTtcblxuICBjb25zdCByZW5kZXJBbm5vdGF0aW9uUG9wdXAgPSAoaXRlbSkgPT4ge1xuICAgIHJldHVybiBgXG4gICAgPGRpdiBjbGFzcz0ncG9wdXAtaXRlbSBhbm5vdGF0aW9uJyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudFwiPlxuICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgPGxpIGNsYXNzPVwidGFnIHRhZy1hbm5vdGF0aW9uXCI+QW5ub3RhdGlvbjwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxoMiBjbGFzcz1cImV2ZW50LXRpdGxlXCI+JHtpdGVtLm5hbWV9PC9oMj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWFkZHJlc3MgYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgPHA+JHtpdGVtLmRlc2NyaXB0aW9ufTwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgO1xuICB9XG5cblxuICBjb25zdCByZW5kZXJBbm5vdGF0aW9uc0dlb0pzb24gPSAobGlzdCkgPT4ge1xuICAgIHJldHVybiBsaXN0Lm1hcCgoaXRlbSkgPT4ge1xuICAgICAgY29uc3QgcmVuZGVyZWQgPSByZW5kZXJBbm5vdGF0aW9uUG9wdXAoaXRlbSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICAgIGdlb21ldHJ5OiB7XG4gICAgICAgICAgdHlwZTogXCJQb2ludFwiLFxuICAgICAgICAgIGNvb3JkaW5hdGVzOiBbaXRlbS5sbmcsIGl0ZW0ubGF0XVxuICAgICAgICB9LFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgYW5ub3RhdGlvblByb3BzOiBpdGVtLFxuICAgICAgICAgIHBvcHVwQ29udGVudDogcmVuZGVyZWRcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBjb25zdCByZW5kZXJHZW9qc29uID0gKGxpc3QsIHJlZiA9IG51bGwsIHNyYyA9IG51bGwpID0+IHtcbiAgICByZXR1cm4gbGlzdC5tYXAoKGl0ZW0pID0+IHtcbiAgICAgIC8vIHJlbmRlcmVkIGV2ZW50VHlwZVxuICAgICAgbGV0IHJlbmRlcmVkO1xuXG4gICAgICBpZiAoaXRlbS5ldmVudF90eXBlICYmIGl0ZW0uZXZlbnRfdHlwZS50b0xvd2VyQ2FzZSgpID09ICdncm91cCcpIHtcbiAgICAgICAgcmVuZGVyZWQgPSByZW5kZXJHcm91cChpdGVtLCByZWYsIHNyYyk7XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlbmRlcmVkID0gcmVuZGVyRXZlbnQoaXRlbSwgcmVmLCBzcmMpO1xuICAgICAgfVxuXG4gICAgICAvLyBmb3JtYXQgY2hlY2tcbiAgICAgIGlmIChpc05hTihwYXJzZUZsb2F0KHBhcnNlRmxvYXQoaXRlbS5sbmcpKSkpIHtcbiAgICAgICAgaXRlbS5sbmcgPSBpdGVtLmxuZy5zdWJzdHJpbmcoMSlcbiAgICAgIH1cbiAgICAgIGlmIChpc05hTihwYXJzZUZsb2F0KHBhcnNlRmxvYXQoaXRlbS5sYXQpKSkpIHtcbiAgICAgICAgaXRlbS5sYXQgPSBpdGVtLmxhdC5zdWJzdHJpbmcoMSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgIHR5cGU6IFwiUG9pbnRcIixcbiAgICAgICAgICBjb29yZGluYXRlczogW2l0ZW0ubG5nLCBpdGVtLmxhdF1cbiAgICAgICAgfSxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIGV2ZW50UHJvcGVydGllczogaXRlbSxcbiAgICAgICAgICBwb3B1cENvbnRlbnQ6IHJlbmRlcmVkXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIChvcHRpb25zKSA9PiB7XG4gICAgdmFyIGFjY2Vzc1Rva2VuID0gJ3BrLmV5SjFJam9pYldGMGRHaGxkek0xTUNJc0ltRWlPaUphVFZGTVVrVXdJbjAud2NNM1hjOEJHQzZQTS1PeXJ3am5oZyc7XG4gICAgdmFyIG1hcCA9IEwubWFwKCdtYXAnLCB7IGRyYWdnaW5nOiAhTC5Ccm93c2VyLm1vYmlsZSB9KS5zZXRWaWV3KFszNC44ODU5MzA5NDA3NTMxNywgNS4wOTc2NTYyNTAwMDAwMDFdLCAyKTtcblxuICAgIGxldCB7cmVmZXJyZXIsIHNvdXJjZX0gPSBvcHRpb25zO1xuXG4gICAgaWYgKCFMLkJyb3dzZXIubW9iaWxlKSB7XG4gICAgICBtYXAuc2Nyb2xsV2hlZWxab29tLmRpc2FibGUoKTtcbiAgICB9XG5cbiAgICBMQU5HVUFHRSA9IG9wdGlvbnMubGFuZyB8fCAnZW4nO1xuXG4gICAgaWYgKG9wdGlvbnMub25Nb3ZlKSB7XG4gICAgICBtYXAub24oJ2RyYWdlbmQnLCAoZXZlbnQpID0+IHtcblxuXG4gICAgICAgIGxldCBzdyA9IFttYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxuZ107XG4gICAgICAgIGxldCBuZSA9IFttYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxuZ107XG4gICAgICAgIG9wdGlvbnMub25Nb3ZlKHN3LCBuZSk7XG4gICAgICB9KS5vbignem9vbWVuZCcsIChldmVudCkgPT4ge1xuICAgICAgICBpZiAobWFwLmdldFpvb20oKSA8PSA0KSB7XG4gICAgICAgICAgJChcIiNtYXBcIikuYWRkQ2xhc3MoXCJ6b29tZWQtb3V0XCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICQoXCIjbWFwXCIpLnJlbW92ZUNsYXNzKFwiem9vbWVkLW91dFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzdyA9IFttYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxuZ107XG4gICAgICAgIGxldCBuZSA9IFttYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxuZ107XG4gICAgICAgIG9wdGlvbnMub25Nb3ZlKHN3LCBuZSk7XG4gICAgICB9KVxuICAgIH1cblxuICAgIC8vIG1hcC5maXJlRXZlbnQoJ3pvb21lbmQnKTtcblxuICAgIEwudGlsZUxheWVyKCdodHRwczovL2FwaS5tYXBib3guY29tL3N0eWxlcy92MS9tYXR0aGV3MzUwL2NqYTQxdGlqazI3ZDYycnFvZDdnMGx4NGIvdGlsZXMvMjU2L3t6fS97eH0ve3l9P2FjY2Vzc190b2tlbj0nICsgYWNjZXNzVG9rZW4sIHtcbiAgICAgICAgYXR0cmlidXRpb246ICcmY29weTsgPGEgaHJlZj1cImh0dHA6Ly9vc20ub3JnL2NvcHlyaWdodFwiPk9wZW5TdHJlZXRNYXA8L2E+IGNvbnRyaWJ1dG9ycyDigKIgPGEgaHJlZj1cIi8vMzUwLm9yZ1wiPjM1MC5vcmc8L2E+J1xuICAgIH0pLmFkZFRvKG1hcCk7XG5cbiAgICAvLyBjb25zb2xlLmxvZyh3aW5kb3cucXVlcmllc1sndHdpbGlnaHQtem9uZSddLCB3aW5kb3cucXVlcmllc1sndHdpbGlnaHQtem9uZSddID09PSBcInRydWVcIik7XG4gICAgaWYod2luZG93LnF1ZXJpZXNbJ3R3aWxpZ2h0LXpvbmUnXSkge1xuICAgICAgTC50ZXJtaW5hdG9yKCkuYWRkVG8obWFwKVxuICAgIH1cblxuICAgIGxldCBnZW9jb2RlciA9IG51bGw7XG4gICAgcmV0dXJuIHtcbiAgICAgICRtYXA6IG1hcCxcbiAgICAgIGluaXRpYWxpemU6IChjYWxsYmFjaykgPT4ge1xuICAgICAgICBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgc2V0Qm91bmRzOiAoYm91bmRzMSwgYm91bmRzMikgPT4ge1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtib3VuZHMxLCBib3VuZHMyXTtcbiAgICAgICAgbWFwLmZpdEJvdW5kcyhib3VuZHMsIHsgYW5pbWF0ZTogZmFsc2V9KTtcbiAgICAgIH0sXG4gICAgICBzZXRDZW50ZXI6IChjZW50ZXIsIHpvb20gPSAxMCkgPT4ge1xuICAgICAgICBpZiAoIWNlbnRlciB8fCAhY2VudGVyWzBdIHx8IGNlbnRlclswXSA9PSBcIlwiXG4gICAgICAgICAgICAgIHx8ICFjZW50ZXJbMV0gfHwgY2VudGVyWzFdID09IFwiXCIpIHJldHVybjtcbiAgICAgICAgbWFwLnNldFZpZXcoY2VudGVyLCB6b29tKTtcbiAgICAgIH0sXG4gICAgICBnZXRCb3VuZHM6ICgpID0+IHtcblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuXG4gICAgICAgIHJldHVybiBbc3csIG5lXTtcbiAgICAgIH0sXG4gICAgICAvLyBDZW50ZXIgbG9jYXRpb24gYnkgZ2VvY29kZWRcbiAgICAgIGdldENlbnRlckJ5TG9jYXRpb246IChsb2NhdGlvbiwgY2FsbGJhY2spID0+IHtcblxuICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogbG9jYXRpb24gfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuXG4gICAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2socmVzdWx0c1swXSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHRyaWdnZXJab29tRW5kOiAoKSA9PiB7XG4gICAgICAgIG1hcC5maXJlRXZlbnQoJ3pvb21lbmQnKTtcbiAgICAgIH0sXG4gICAgICB6b29tT3V0T25jZTogKCkgPT4ge1xuICAgICAgICBtYXAuem9vbU91dCgxKTtcbiAgICAgIH0sXG4gICAgICB6b29tVW50aWxIaXQ6ICgpID0+IHtcbiAgICAgICAgdmFyICR0aGlzID0gdGhpcztcbiAgICAgICAgbWFwLnpvb21PdXQoMSk7XG4gICAgICAgIGxldCBpbnRlcnZhbEhhbmRsZXIgPSBudWxsO1xuICAgICAgICBpbnRlcnZhbEhhbmRsZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgdmFyIF92aXNpYmxlID0gJChkb2N1bWVudCkuZmluZCgndWwgbGkuZXZlbnQtb2JqLndpdGhpbi1ib3VuZCwgdWwgbGkuZ3JvdXAtb2JqLndpdGhpbi1ib3VuZCcpLmxlbmd0aDtcbiAgICAgICAgICBpZiAoX3Zpc2libGUgPT0gMCkge1xuICAgICAgICAgICAgbWFwLnpvb21PdXQoMSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxIYW5kbGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIDIwMCk7XG4gICAgICB9LFxuICAgICAgcmVmcmVzaE1hcDogKCkgPT4ge1xuICAgICAgICBtYXAuaW52YWxpZGF0ZVNpemUoZmFsc2UpO1xuICAgICAgICAvLyBtYXAuX29uUmVzaXplKCk7XG4gICAgICAgIC8vIG1hcC5maXJlRXZlbnQoJ3pvb21lbmQnKTtcblxuXG4gICAgICB9LFxuICAgICAgZmlsdGVyTWFwOiAoZmlsdGVycykgPT4ge1xuXG4gICAgICAgICQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cFwiKS5oaWRlKCk7XG5cblxuICAgICAgICBpZiAoIWZpbHRlcnMpIHJldHVybjtcblxuICAgICAgICBmaWx0ZXJzLmZvckVhY2goKGl0ZW0pID0+IHtcblxuICAgICAgICAgICQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cC5cIiArIGl0ZW0udG9Mb3dlckNhc2UoKSkuc2hvdygpO1xuICAgICAgICB9KVxuICAgICAgfSxcbiAgICAgIHBsb3RQb2ludHM6IChsaXN0LCBoYXJkRmlsdGVycywgZ3JvdXBzKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleVNldCA9ICFoYXJkRmlsdGVycy5rZXkgPyBbXSA6IGhhcmRGaWx0ZXJzLmtleS5zcGxpdCgnLCcpO1xuXG4gICAgICAgIGlmIChrZXlTZXQubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGxpc3QgPSBsaXN0LmZpbHRlcigoaXRlbSkgPT4ga2V5U2V0LmluY2x1ZGVzKGl0ZW0uZXZlbnRfdHlwZSkpXG4gICAgICAgIH1cblxuXG4gICAgICAgIGNvbnN0IGdlb2pzb24gPSB7XG4gICAgICAgICAgdHlwZTogXCJGZWF0dXJlQ29sbGVjdGlvblwiLFxuICAgICAgICAgIGZlYXR1cmVzOiByZW5kZXJHZW9qc29uKGxpc3QsIHJlZmVycmVyLCBzb3VyY2UpXG4gICAgICAgIH07XG5cblxuICAgICAgICBjb25zdCBldmVudHNMYXllciA9IEwuZ2VvSlNPTihnZW9qc29uLCB7XG4gICAgICAgICAgICBwb2ludFRvTGF5ZXI6IChmZWF0dXJlLCBsYXRsbmcpID0+IHtcbiAgICAgICAgICAgICAgLy8gSWNvbnMgZm9yIG1hcmtlcnNcbiAgICAgICAgICAgICAgY29uc3QgZXZlbnRUeXBlID0gZmVhdHVyZS5wcm9wZXJ0aWVzLmV2ZW50UHJvcGVydGllcy5ldmVudF90eXBlO1xuXG4gICAgICAgICAgICAgIC8vIElmIG5vIHN1cGVyZ3JvdXAsIGl0J3MgYW4gZXZlbnQuXG4gICAgICAgICAgICAgIGNvbnN0IHN1cGVyZ3JvdXAgPSBncm91cHNbZmVhdHVyZS5wcm9wZXJ0aWVzLmV2ZW50UHJvcGVydGllcy5zdXBlcmdyb3VwXSA/IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuc3VwZXJncm91cCA6IFwiRXZlbnRzXCI7XG4gICAgICAgICAgICAgIGNvbnN0IHNsdWdnZWQgPSB3aW5kb3cuc2x1Z2lmeShzdXBlcmdyb3VwKTtcblxuXG5cbiAgICAgICAgICAgICAgbGV0IGljb25Vcmw7XG4gICAgICAgICAgICAgIGNvbnN0IGlzUGFzdCA9IG5ldyBEYXRlKGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuc3RhcnRfZGF0ZXRpbWUpIDwgbmV3IERhdGUoKTtcbiAgICAgICAgICAgICAgaWYgKGV2ZW50VHlwZSA9PSBcIkFjdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgaWNvblVybCA9IGlzUGFzdCA/IFwiL2ltZy9wYXN0LWV2ZW50LnBuZ1wiIDogXCIvaW1nL2V2ZW50LnBuZ1wiO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGljb25VcmwgPSBncm91cHNbc3VwZXJncm91cF0gPyBncm91cHNbc3VwZXJncm91cF0uaWNvbnVybCB8fCBcIi9pbWcvZXZlbnQucG5nXCIgIDogXCIvaW1nL2V2ZW50LnBuZ1wiIDtcbiAgICAgICAgICAgICAgfVxuXG5cblxuICAgICAgICAgICAgICBjb25zdCBzbWFsbEljb24gPSAgTC5pY29uKHtcbiAgICAgICAgICAgICAgICBpY29uVXJsOiBpY29uVXJsLFxuICAgICAgICAgICAgICAgIGljb25TaXplOiBbMTgsIDE4XSxcbiAgICAgICAgICAgICAgICBpY29uQW5jaG9yOiBbOSwgOV0sXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBzbHVnZ2VkICsgJyBldmVudC1pdGVtLXBvcHVwICcgKyAoaXNQYXN0JiZldmVudFR5cGUgPT0gXCJBY3Rpb25cIj9cImV2ZW50LXBhc3QtZXZlbnRcIjpcIlwiKVxuICAgICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICAgIHZhciBnZW9qc29uTWFya2VyT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBpY29uOiBzbWFsbEljb24sXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJldHVybiBMLm1hcmtlcihsYXRsbmcsIGdlb2pzb25NYXJrZXJPcHRpb25zKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICBvbkVhY2hGZWF0dXJlOiAoZmVhdHVyZSwgbGF5ZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChmZWF0dXJlLnByb3BlcnRpZXMgJiYgZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCkge1xuICAgICAgICAgICAgICBsYXllci5iaW5kUG9wdXAoZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNvbnN0IGlzUGFzdCA9IG5ldyBEYXRlKGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuc3RhcnRfZGF0ZXRpbWUpIDwgbmV3IERhdGUoKTtcbiAgICAgICAgICAgIC8vIGNvbnN0IGV2ZW50VHlwZSA9IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuZXZlbnRfdHlwZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGV2ZW50c0xheWVyLmFkZFRvKG1hcCk7XG4gICAgICAgIC8vIGV2ZW50c0xheWVyLmJyaW5nVG9CYWNrKCk7XG5cblxuICAgICAgICAvLyBBZGQgQW5ub3RhdGlvbnNcbiAgICAgICAgaWYgKHdpbmRvdy5xdWVyaWVzLmFubm90YXRpb24pIHtcbiAgICAgICAgICBjb25zdCBhbm5vdGF0aW9ucyA9ICF3aW5kb3cuRVZFTlRTX0RBVEEuYW5ub3RhdGlvbnMgPyBbXSA6IHdpbmRvdy5FVkVOVFNfREFUQS5hbm5vdGF0aW9ucy5maWx0ZXIoKGl0ZW0pPT5pdGVtLnR5cGU9PT13aW5kb3cucXVlcmllcy5hbm5vdGF0aW9uKTtcblxuICAgICAgICAgIGNvbnN0IGFubm90SWNvbiA9ICBMLmljb24oe1xuICAgICAgICAgICAgaWNvblVybDogXCIvaW1nL2Fubm90YXRpb24ucG5nXCIsXG4gICAgICAgICAgICBpY29uU2l6ZTogWzUwLCA1MF0sXG4gICAgICAgICAgICBpY29uQW5jaG9yOiBbMjUsIDI1XSxcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ2Fubm90YXRpb24tcG9wdXAnXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgY29uc29sZS5sb2cocmVuZGVyQW5ub3RhdGlvblBvcHVwKTtcbiAgICAgICAgICBjb25zdCBhbm5vdE1hcmtlcnMgPSBhbm5vdGF0aW9ucy5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBMLm1hcmtlcihbaXRlbS5sYXQsIGl0ZW0ubG5nXSwge2ljb246IGFubm90SWNvbn0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuYmluZFBvcHVwKHJlbmRlckFubm90YXRpb25Qb3B1cChpdGVtKSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIGFubm90TGF5ZXIuYnJpbmdUb0Zyb250KCk7XG5cbiAgICAgICAgICBjb25zb2xlLmxvZyhhbm5vdE1hcmtlcnMpO1xuXG4gICAgICAgICAgLy8gY29uc3QgYW5ub3RMYXllckdyb3VwID0gO1xuXG4gICAgICAgICAgY29uc3QgYW5ub3RMYXllckdyb3VwID0gbWFwLmFkZExheWVyKEwuZmVhdHVyZUdyb3VwKGFubm90TWFya2VycykpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGFubm90TGF5ZXJHcm91cCk7XG4gICAgICAgICAgLy8gYW5ub3RMYXllckdyb3VwLmJyaW5nVG9Gcm9udCgpO1xuICAgICAgICAgIC8vIGFubm90TWFya2Vycy5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgIC8vICAgaXRlbS5hZGRUbyhtYXApO1xuICAgICAgICAgIC8vICAgaXRlbS5icmluZ1RvRnJvbnQoKTtcbiAgICAgICAgICAvLyB9KVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdXBkYXRlOiAocCkgPT4ge1xuICAgICAgICBpZiAoIXAgfHwgIXAubGF0IHx8ICFwLmxuZyApIHJldHVybjtcblxuICAgICAgICBtYXAuc2V0VmlldyhMLmxhdExuZyhwLmxhdCwgcC5sbmcpLCAxMCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsImNvbnN0IFF1ZXJ5TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldEZvcm0gPSBcImZvcm0jZmlsdGVycy1mb3JtXCIpID0+IHtcbiAgICBjb25zdCAkdGFyZ2V0ID0gdHlwZW9mIHRhcmdldEZvcm0gPT09ICdzdHJpbmcnID8gJCh0YXJnZXRGb3JtKSA6IHRhcmdldEZvcm07XG4gICAgbGV0IGxhdCA9IG51bGw7XG4gICAgbGV0IGxuZyA9IG51bGw7XG5cbiAgICBsZXQgcHJldmlvdXMgPSB7fTtcblxuICAgICR0YXJnZXQub24oJ3N1Ym1pdCcsIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBsYXQgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKCk7XG4gICAgICBsbmcgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKCk7XG5cbiAgICAgIHZhciBmb3JtID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuXG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICQucGFyYW0oZm9ybSk7XG4gICAgfSlcblxuICAgICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnc2VsZWN0I2ZpbHRlci1pdGVtcycsICgpID0+IHtcbiAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgfSlcblxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGluaXRpYWxpemU6IChjYWxsYmFjaykgPT4ge1xuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2gubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHZhciBwYXJhbXMgPSAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpKVxuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGFuZ11cIikudmFsKHBhcmFtcy5sYW5nKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKHBhcmFtcy5sYXQpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwocGFyYW1zLmxuZyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChwYXJhbXMuYm91bmQxKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKHBhcmFtcy5ib3VuZDIpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG9jXVwiKS52YWwocGFyYW1zLmxvYyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1rZXldXCIpLnZhbChwYXJhbXMua2V5KTtcblxuICAgICAgICAgIGlmIChwYXJhbXMuZmlsdGVyKSB7XG4gICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIjZmlsdGVyLWl0ZW1zIG9wdGlvblwiKS5yZW1vdmVQcm9wKFwic2VsZWN0ZWRcIik7XG4gICAgICAgICAgICBwYXJhbXMuZmlsdGVyLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICAgICR0YXJnZXQuZmluZChcIiNmaWx0ZXItaXRlbXMgb3B0aW9uW3ZhbHVlPSdcIiArIGl0ZW0gKyBcIiddXCIpLnByb3AoXCJzZWxlY3RlZFwiLCB0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZ2V0UGFyYW1ldGVyczogKCkgPT4ge1xuICAgICAgICB2YXIgcGFyYW1ldGVycyA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcbiAgICAgICAgLy8gcGFyYW1ldGVyc1snbG9jYXRpb24nXSA7XG5cbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gcGFyYW1ldGVycykge1xuICAgICAgICAgIGlmICggIXBhcmFtZXRlcnNba2V5XSB8fCBwYXJhbWV0ZXJzW2tleV0gPT0gXCJcIikge1xuICAgICAgICAgICAgZGVsZXRlIHBhcmFtZXRlcnNba2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyYW1ldGVycztcbiAgICAgIH0sXG4gICAgICB1cGRhdGVMb2NhdGlvbjogKGxhdCwgbG5nKSA9PiB7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwobGF0KTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChsbmcpO1xuICAgICAgICAvLyAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZVZpZXdwb3J0OiAodmlld3BvcnQpID0+IHtcblxuICAgICAgICAvLyBBdmVyYWdlIGl0IGlmIGxlc3MgdGhhbiAxMG1pIHJhZGl1c1xuICAgICAgICBpZiAoTWF0aC5hYnModmlld3BvcnQuZi5iIC0gdmlld3BvcnQuZi5mKSA8IC4xNSB8fCBNYXRoLmFicyh2aWV3cG9ydC5iLmIgLSB2aWV3cG9ydC5iLmYpIDwgLjE1KSB7XG4gICAgICAgICAgbGV0IGZBdmcgPSAodmlld3BvcnQuZi5iICsgdmlld3BvcnQuZi5mKSAvIDI7XG4gICAgICAgICAgbGV0IGJBdmcgPSAodmlld3BvcnQuYi5iICsgdmlld3BvcnQuYi5mKSAvIDI7XG4gICAgICAgICAgdmlld3BvcnQuZiA9IHsgYjogZkF2ZyAtIC4wOCwgZjogZkF2ZyArIC4wOCB9O1xuICAgICAgICAgIHZpZXdwb3J0LmIgPSB7IGI6IGJBdmcgLSAuMDgsIGY6IGJBdmcgKyAuMDggfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBib3VuZHMgPSBbW3ZpZXdwb3J0LmYuYiwgdmlld3BvcnQuYi5iXSwgW3ZpZXdwb3J0LmYuZiwgdmlld3BvcnQuYi5mXV07XG5cbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMF0pKTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMV0pKTtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVWaWV3cG9ydEJ5Qm91bmQ6IChzdywgbmUpID0+IHtcblxuICAgICAgICBjb25zdCBib3VuZHMgPSBbc3csIG5lXTsvLy8vLy8vL1xuXG5cbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMF0pKTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMV0pKTtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyU3VibWl0OiAoKSA9PiB7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59KShqUXVlcnkpO1xuIiwibGV0IGF1dG9jb21wbGV0ZU1hbmFnZXI7XG5sZXQgbWFwTWFuYWdlcjtcblxud2luZG93LkRFRkFVTFRfSUNPTiA9IFwiL2ltZy9ldmVudC5wbmdcIjtcbndpbmRvdy5zbHVnaWZ5ID0gKHRleHQpID0+ICF0ZXh0ID8gdGV4dCA6IHRleHQudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xccysvZywgJy0nKSAgICAgICAgICAgLy8gUmVwbGFjZSBzcGFjZXMgd2l0aCAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1teXFx3XFwtXSsvZywgJycpICAgICAgIC8vIFJlbW92ZSBhbGwgbm9uLXdvcmQgY2hhcnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwtXFwtKy9nLCAnLScpICAgICAgICAgLy8gUmVwbGFjZSBtdWx0aXBsZSAtIHdpdGggc2luZ2xlIC1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXi0rLywgJycpICAgICAgICAgICAgIC8vIFRyaW0gLSBmcm9tIHN0YXJ0IG9mIHRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvLSskLywgJycpOyAgICAgICAgICAgIC8vIFRyaW0gLSBmcm9tIGVuZCBvZiB0ZXh0XG5cbmNvbnN0IGdldFF1ZXJ5U3RyaW5nID0gKCkgPT4ge1xuICAgIHZhciBxdWVyeVN0cmluZ0tleVZhbHVlID0gd2luZG93LnBhcmVudC5sb2NhdGlvbi5zZWFyY2gucmVwbGFjZSgnPycsICcnKS5zcGxpdCgnJicpO1xuICAgIHZhciBxc0pzb25PYmplY3QgPSB7fTtcbiAgICBpZiAocXVlcnlTdHJpbmdLZXlWYWx1ZSAhPSAnJykge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHF1ZXJ5U3RyaW5nS2V5VmFsdWUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHFzSnNvbk9iamVjdFtxdWVyeVN0cmluZ0tleVZhbHVlW2ldLnNwbGl0KCc9JylbMF1dID0gcXVlcnlTdHJpbmdLZXlWYWx1ZVtpXS5zcGxpdCgnPScpWzFdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBxc0pzb25PYmplY3Q7XG59O1xuXG4oZnVuY3Rpb24oJCkge1xuICAvLyBMb2FkIHRoaW5nc1xuXG4gIHdpbmRvdy5xdWVyaWVzID0gICQuZGVwYXJhbSh3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cmluZygxKSk7XG4gIHRyeSB7XG4gICAgaWYgKCghd2luZG93LnF1ZXJpZXMuZ3JvdXAgfHwgKCF3aW5kb3cucXVlcmllcy5yZWZlcnJlciAmJiAhd2luZG93LnF1ZXJpZXMuc291cmNlKSkgJiYgd2luZG93LnBhcmVudCkge1xuICAgICAgd2luZG93LnF1ZXJpZXMgPSB7XG4gICAgICAgIGdyb3VwOiBnZXRRdWVyeVN0cmluZygpLmdyb3VwLFxuICAgICAgICByZWZlcnJlcjogZ2V0UXVlcnlTdHJpbmcoKS5yZWZlcnJlcixcbiAgICAgICAgc291cmNlOiBnZXRRdWVyeVN0cmluZygpLnNvdXJjZSxcbiAgICAgICAgXCJ0d2lsaWdodC16b25lXCI6IHdpbmRvdy5xdWVyaWVzWyd0d2lsaWdodC16b25lJ10sXG4gICAgICAgIFwiYW5ub3RhdGlvblwiOiB3aW5kb3cucXVlcmllc1snYW5ub3RhdGlvbiddLFxuICAgICAgICBcImZ1bGwtbWFwXCI6IHdpbmRvdy5xdWVyaWVzWydmdWxsLW1hcCddXG4gICAgICB9O1xuICAgIH1cbiAgfSBjYXRjaChlKSB7XG4gICAgY29uc29sZS5sb2coXCJFcnJvcjogXCIsIGUpO1xuICB9XG5cbiAgaWYgKHdpbmRvdy5xdWVyaWVzWydmdWxsLW1hcCddKSB7XG4gICAgaWYgKCQod2luZG93KS53aWR0aCgpIDwgNjAwKSB7XG4gICAgICAvLyAkKFwiI2V2ZW50cy1saXN0LWNvbnRhaW5lclwiKS5oaWRlKCk7XG4gICAgICAkKFwiYm9keVwiKS5hZGRDbGFzcyhcIm1hcC12aWV3XCIpO1xuICAgICAgJChcIi5maWx0ZXItYXJlYVwiKS5oaWRlKCk7XG4gICAgICAkKFwic2VjdGlvbiNtYXBcIikuY3NzKFwiaGVpZ2h0XCIsIFwiY2FsYygxMDAlIC0gNjRweClcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgICQoXCIjZXZlbnRzLWxpc3QtY29udGFpbmVyXCIpLmhpZGUoKTtcbiAgICB9XG4gIH1cblxuXG4gIGlmICh3aW5kb3cucXVlcmllcy5ncm91cCkge1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5wYXJlbnQoKS5jc3MoXCJvcGFjaXR5XCIsIFwiMFwiKTtcbiAgfVxuICBjb25zdCBidWlsZEZpbHRlcnMgPSAoKSA9PiB7JCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KHtcbiAgICAgIGVuYWJsZUhUTUw6IHRydWUsXG4gICAgICB0ZW1wbGF0ZXM6IHtcbiAgICAgICAgYnV0dG9uOiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJtdWx0aXNlbGVjdCBkcm9wZG93bi10b2dnbGVcIiBkYXRhLXRvZ2dsZT1cImRyb3Bkb3duXCI+PHNwYW4gZGF0YS1sYW5nLXRhcmdldD1cInRleHRcIiBkYXRhLWxhbmcta2V5PVwibW9yZS1zZWFyY2gtb3B0aW9uc1wiPjwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJmYSBmYS1jYXJldC1kb3duXCI+PC9zcGFuPjwvYnV0dG9uPicsXG4gICAgICAgIGxpOiAnPGxpPjxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCI+PGxhYmVsPjwvbGFiZWw+PC9hPjwvbGk+J1xuICAgICAgfSxcbiAgICAgIGRyb3BSaWdodDogdHJ1ZSxcbiAgICAgIG9uSW5pdGlhbGl6ZWQ6ICgpID0+IHtcblxuICAgICAgfSxcbiAgICAgIG9uRHJvcGRvd25TaG93OiAoKSA9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJtb2JpbGUtdXBkYXRlLW1hcC1oZWlnaHRcIik7XG4gICAgICAgIH0sIDEwKTtcblxuICAgICAgfSxcbiAgICAgIG9uRHJvcGRvd25IaWRlOiAoKSA9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJtb2JpbGUtdXBkYXRlLW1hcC1oZWlnaHRcIik7XG4gICAgICAgIH0sIDEwKTtcbiAgICAgIH0sXG4gICAgICBvcHRpb25MYWJlbDogKGUpID0+IHtcbiAgICAgICAgLy8gbGV0IGVsID0gJCggJzxkaXY+PC9kaXY+JyApO1xuICAgICAgICAvLyBlbC5hcHBlbmQoKCkgKyBcIlwiKTtcblxuICAgICAgICByZXR1cm4gdW5lc2NhcGUoJChlKS5hdHRyKCdsYWJlbCcpKSB8fCAkKGUpLmh0bWwoKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH07XG4gIGJ1aWxkRmlsdGVycygpO1xuXG5cbiAgJCgnc2VsZWN0I2xhbmd1YWdlLW9wdHMnKS5tdWx0aXNlbGVjdCh7XG4gICAgZW5hYmxlSFRNTDogdHJ1ZSxcbiAgICBvcHRpb25DbGFzczogKCkgPT4gJ2xhbmctb3B0JyxcbiAgICBzZWxlY3RlZENsYXNzOiAoKSA9PiAnbGFuZy1zZWwnLFxuICAgIGJ1dHRvbkNsYXNzOiAoKSA9PiAnbGFuZy1idXQnLFxuICAgIGRyb3BSaWdodDogdHJ1ZSxcbiAgICBvcHRpb25MYWJlbDogKGUpID0+IHtcbiAgICAgIC8vIGxldCBlbCA9ICQoICc8ZGl2PjwvZGl2PicgKTtcbiAgICAgIC8vIGVsLmFwcGVuZCgoKSArIFwiXCIpO1xuXG4gICAgICByZXR1cm4gdW5lc2NhcGUoJChlKS5hdHRyKCdsYWJlbCcpKSB8fCAkKGUpLmh0bWwoKTtcbiAgICB9LFxuICAgIG9uQ2hhbmdlOiAob3B0aW9uLCBjaGVja2VkLCBzZWxlY3QpID0+IHtcblxuICAgICAgY29uc3QgcGFyYW1ldGVycyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gICAgICBwYXJhbWV0ZXJzWydsYW5nJ10gPSBvcHRpb24udmFsKCk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1yZXNldC1tYXAnLCBwYXJhbWV0ZXJzKTtcblxuICAgIH1cbiAgfSlcblxuICAvLyAxLiBnb29nbGUgbWFwcyBnZW9jb2RlXG5cbiAgLy8gMi4gZm9jdXMgbWFwIG9uIGdlb2NvZGUgKHZpYSBsYXQvbG5nKVxuICBjb25zdCBxdWVyeU1hbmFnZXIgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICAgICAgcXVlcnlNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICBjb25zdCBpbml0UGFyYW1zID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuXG5cbiAgY29uc3QgbGFuZ3VhZ2VNYW5hZ2VyID0gTGFuZ3VhZ2VNYW5hZ2VyKCk7XG5cbiAgY29uc3QgbGlzdE1hbmFnZXIgPSBMaXN0TWFuYWdlcih7XG4gICAgcmVmZXJyZXI6IHdpbmRvdy5xdWVyaWVzLnJlZmVycmVyLFxuICAgIHNvdXJjZTogd2luZG93LnF1ZXJpZXMuc291cmNlXG4gIH0pO1xuXG5cbiAgbWFwTWFuYWdlciA9IE1hcE1hbmFnZXIoe1xuICAgIG9uTW92ZTogKHN3LCBuZSkgPT4ge1xuICAgICAgLy8gV2hlbiB0aGUgbWFwIG1vdmVzIGFyb3VuZCwgd2UgdXBkYXRlIHRoZSBsaXN0XG4gICAgICBxdWVyeU1hbmFnZXIudXBkYXRlVmlld3BvcnRCeUJvdW5kKHN3LCBuZSk7XG4gICAgICAvL3VwZGF0ZSBRdWVyeVxuICAgIH0sXG4gICAgcmVmZXJyZXI6IHdpbmRvdy5xdWVyaWVzLnJlZmVycmVyLFxuICAgIHNvdXJjZTogd2luZG93LnF1ZXJpZXMuc291cmNlXG4gIH0pO1xuXG4gIHdpbmRvdy5pbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2sgPSAoKSA9PiB7XG5cbiAgICBhdXRvY29tcGxldGVNYW5hZ2VyID0gQXV0b2NvbXBsZXRlTWFuYWdlcihcImlucHV0W25hbWU9J2xvYyddXCIpO1xuICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuXG4gICAgaWYgKGluaXRQYXJhbXMubG9jICYmIGluaXRQYXJhbXMubG9jICE9PSAnJyAmJiAoIWluaXRQYXJhbXMuYm91bmQxICYmICFpbml0UGFyYW1zLmJvdW5kMikpIHtcbiAgICAgIG1hcE1hbmFnZXIuaW5pdGlhbGl6ZSgoKSA9PiB7XG4gICAgICAgIG1hcE1hbmFnZXIuZ2V0Q2VudGVyQnlMb2NhdGlvbihpbml0UGFyYW1zLmxvYywgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIHF1ZXJ5TWFuYWdlci51cGRhdGVWaWV3cG9ydChyZXN1bHQuZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgaWYoaW5pdFBhcmFtcy5sYXQgJiYgaW5pdFBhcmFtcy5sbmcpIHtcbiAgICBtYXBNYW5hZ2VyLnNldENlbnRlcihbaW5pdFBhcmFtcy5sYXQsIGluaXRQYXJhbXMubG5nXSk7XG4gIH1cblxuICAvKioqXG4gICogTGlzdCBFdmVudHNcbiAgKiBUaGlzIHdpbGwgdHJpZ2dlciB0aGUgbGlzdCB1cGRhdGUgbWV0aG9kXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCdtb2JpbGUtdXBkYXRlLW1hcC1oZWlnaHQnLCAoZXZlbnQpID0+IHtcbiAgICAvL1RoaXMgY2hlY2tzIGlmIHdpZHRoIGlzIGZvciBtb2JpbGVcbiAgICBpZiAoJCh3aW5kb3cpLndpZHRoKCkgPCA2MDApIHtcbiAgICAgIHNldFRpbWVvdXQoKCk9PiB7XG4gICAgICAgICQoXCIjbWFwXCIpLmhlaWdodCgkKFwiI2V2ZW50cy1saXN0XCIpLmhlaWdodCgpKTtcbiAgICAgICAgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCk7XG4gICAgICB9LCAxMCk7XG4gICAgfVxuICB9KVxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnBvcHVsYXRlTGlzdChvcHRpb25zLnBhcmFtcyk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuXG4gICAgbGlzdE1hbmFnZXIudXBkYXRlRmlsdGVyKG9wdGlvbnMpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlci1ieS1ib3VuZCcsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxldCBib3VuZDEsIGJvdW5kMjtcblxuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICBbYm91bmQxLCBib3VuZDJdID0gbWFwTWFuYWdlci5nZXRCb3VuZHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgICBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcbiAgICB9XG5cbiAgICBsaXN0TWFuYWdlci51cGRhdGVCb3VuZHMoYm91bmQxLCBib3VuZDIpXG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLXJlc2V0LW1hcCcsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIHZhciBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHRpb25zKSk7XG4gICAgZGVsZXRlIGNvcHlbJ2xuZyddO1xuICAgIGRlbGV0ZSBjb3B5WydsYXQnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQxJ107XG4gICAgZGVsZXRlIGNvcHlbJ2JvdW5kMiddO1xuXG4gICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAkLnBhcmFtKGNvcHkpO1xuXG5cbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwidHJpZ2dlci1sYW5ndWFnZS11cGRhdGVcIiwgY29weSk7XG4gICAgJChcInNlbGVjdCNmaWx0ZXItaXRlbXNcIikubXVsdGlzZWxlY3QoJ2Rlc3Ryb3knKTtcbiAgICBidWlsZEZpbHRlcnMoKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxvYWQtZ3JvdXBzJywgeyBncm91cHM6IHdpbmRvdy5FVkVOVFNfREFUQS5ncm91cHMgfSk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG5cbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJ0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZVwiLCBjb3B5KTtcbiAgICB9LCAxMDAwKTtcbiAgfSk7XG5cblxuICAvKioqXG4gICogTWFwIEV2ZW50c1xuICAqL1xuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgLy8gbWFwTWFuYWdlci5zZXRDZW50ZXIoW29wdGlvbnMubGF0LCBvcHRpb25zLmxuZ10pO1xuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGJvdW5kMSA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDEpO1xuICAgIHZhciBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcblxuICAgIG1hcE1hbmFnZXIuc2V0Qm91bmRzKGJvdW5kMSwgYm91bmQyKTtcbiAgICAvLyBtYXBNYW5hZ2VyLnRyaWdnZXJab29tRW5kKCk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIG1hcE1hbmFnZXIudHJpZ2dlclpvb21FbmQoKTtcbiAgICB9LCAxMCk7XG5cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgXCIjY29weS1lbWJlZFwiLCAoZSkgPT4ge1xuICAgIHZhciBjb3B5VGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW1iZWQtdGV4dFwiKTtcbiAgICBjb3B5VGV4dC5zZWxlY3QoKTtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZChcIkNvcHlcIik7XG4gIH0pO1xuXG4gIC8vIDMuIG1hcmtlcnMgb24gbWFwXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC1wbG90JywgKGUsIG9wdCkgPT4ge1xuXG4gICAgbWFwTWFuYWdlci5wbG90UG9pbnRzKG9wdC5kYXRhLCBvcHQucGFyYW1zLCBvcHQuZ3JvdXBzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInKTtcbiAgfSlcblxuICAvLyBsb2FkIGdyb3Vwc1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxvYWQtZ3JvdXBzJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5lbXB0eSgpO1xuICAgIG9wdC5ncm91cHMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuXG4gICAgICBsZXQgc2x1Z2dlZCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG4gICAgICBsZXQgdmFsdWVUZXh0ID0gbGFuZ3VhZ2VNYW5hZ2VyLmdldFRyYW5zbGF0aW9uKGl0ZW0udHJhbnNsYXRpb24pO1xuICAgICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLmFwcGVuZChgXG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPScke3NsdWdnZWR9J1xuICAgICAgICAgICAgICBzZWxlY3RlZD0nc2VsZWN0ZWQnXG4gICAgICAgICAgICAgIGxhYmVsPVwiPHNwYW4gZGF0YS1sYW5nLXRhcmdldD0ndGV4dCcgZGF0YS1sYW5nLWtleT0nJHtpdGVtLnRyYW5zbGF0aW9ufSc+JHt2YWx1ZVRleHR9PC9zcGFuPjxpbWcgc3JjPScke2l0ZW0uaWNvbnVybCB8fCB3aW5kb3cuREVGQVVMVF9JQ09OfScgLz5cIj5cbiAgICAgICAgICAgIDwvb3B0aW9uPmApXG4gICAgfSk7XG5cbiAgICAvLyBSZS1pbml0aWFsaXplXG4gICAgcXVlcnlNYW5hZ2VyLmluaXRpYWxpemUoKTtcbiAgICAvLyAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykubXVsdGlzZWxlY3QoJ2Rlc3Ryb3knKTtcbiAgICAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykubXVsdGlzZWxlY3QoJ3JlYnVpbGQnKTtcblxuICAgIG1hcE1hbmFnZXIucmVmcmVzaE1hcCgpO1xuXG5cbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZScpO1xuXG4gIH0pXG5cbiAgLy8gRmlsdGVyIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtZmlsdGVyJywgKGUsIG9wdCkgPT4ge1xuICAgIGlmIChvcHQpIHtcbiAgICAgIG1hcE1hbmFnZXIuZmlsdGVyTWFwKG9wdC5maWx0ZXIpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgKGUsIG9wdCkgPT4ge1xuXG4gICAgaWYgKG9wdCkge1xuXG4gICAgICBsYW5ndWFnZU1hbmFnZXIudXBkYXRlTGFuZ3VhZ2Uob3B0LmxhbmcpO1xuICAgIH0gZWxzZSB7XG5cbiAgICAgIGxhbmd1YWdlTWFuYWdlci5yZWZyZXNoKCk7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sYW5ndWFnZS1sb2FkZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KCdyZWJ1aWxkJyk7XG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbiNzaG93LWhpZGUtbWFwJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ2JvZHknKS50b2dnbGVDbGFzcygnbWFwLXZpZXcnKVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uLmJ0bi5tb3JlLWl0ZW1zJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJyNlbWJlZC1hcmVhJykudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgLy91cGRhdGUgZW1iZWQgbGluZVxuICAgIHZhciBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHQpKTtcbiAgICBkZWxldGUgY29weVsnbG5nJ107XG4gICAgZGVsZXRlIGNvcHlbJ2xhdCddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDEnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQyJ107XG5cbiAgICAkKCcjZW1iZWQtYXJlYSBpbnB1dFtuYW1lPWVtYmVkXScpLnZhbCgnaHR0cHM6Ly9uZXctbWFwLjM1MC5vcmcjJyArICQucGFyYW0oY29weSkpO1xuICB9KTtcblxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24jem9vbS1vdXQnLCAoZSwgb3B0KSA9PiB7XG5cbiAgICAvLyBtYXBNYW5hZ2VyLnpvb21PdXRPbmNlKCk7XG5cbiAgICBtYXBNYW5hZ2VyLnpvb21VbnRpbEhpdCgpO1xuICB9KVxuXG4gICQod2luZG93KS5vbihcInJlc2l6ZVwiLCAoZSkgPT4ge1xuICAgIG1hcE1hbmFnZXIucmVmcmVzaE1hcCgpO1xuICB9KTtcblxuICAvKipcbiAgRmlsdGVyIENoYW5nZXNcbiAgKi9cbiAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIi5zZWFyY2gtYnV0dG9uIGJ1dHRvblwiLCAoZSkgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwic2VhcmNoLmZvcmNlLXNlYXJjaC1sb2NhdGlvblwiKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKFwia2V5dXBcIiwgXCJpbnB1dFtuYW1lPSdsb2MnXVwiLCAoZSkgPT4ge1xuICAgIGlmIChlLmtleUNvZGUgPT0gMTMpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3NlYXJjaC5mb3JjZS1zZWFyY2gtbG9jYXRpb24nKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdzZWFyY2guZm9yY2Utc2VhcmNoLWxvY2F0aW9uJywgKCkgPT4ge1xuICAgIGxldCBfcXVlcnkgPSAkKFwiaW5wdXRbbmFtZT0nbG9jJ11cIikudmFsKCk7XG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlci5mb3JjZVNlYXJjaChfcXVlcnkpO1xuICAgIC8vIFNlYXJjaCBnb29nbGUgYW5kIGdldCB0aGUgZmlyc3QgcmVzdWx0Li4uIGF1dG9jb21wbGV0ZT9cbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKFwiaGFzaGNoYW5nZVwiLCAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgaWYgKGhhc2gubGVuZ3RoID09IDApIHJldHVybjtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKGhhc2guc3Vic3RyaW5nKDEpKTtcbiAgICBjb25zdCBvbGRVUkwgPSBldmVudC5vcmlnaW5hbEV2ZW50Lm9sZFVSTDtcbiAgICBjb25zdCBvbGRIYXNoID0gJC5kZXBhcmFtKG9sZFVSTC5zdWJzdHJpbmcob2xkVVJMLnNlYXJjaChcIiNcIikrMSkpO1xuXG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCBwYXJhbWV0ZXJzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuXG4gICAgLy8gU28gdGhhdCBjaGFuZ2UgaW4gZmlsdGVycyB3aWxsIG5vdCB1cGRhdGUgdGhpc1xuICAgIGlmIChvbGRIYXNoLmJvdW5kMSAhPT0gcGFyYW1ldGVycy5ib3VuZDEgfHwgb2xkSGFzaC5ib3VuZDIgIT09IHBhcmFtZXRlcnMuYm91bmQyKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLWJ5LWJvdW5kJywgcGFyYW1ldGVycyk7XG4gICAgfVxuXG4gICAgaWYgKG9sZEhhc2gubG9nICE9PSBwYXJhbWV0ZXJzLmxvYykge1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgfVxuXG4gICAgLy8gQ2hhbmdlIGl0ZW1zXG4gICAgaWYgKG9sZEhhc2gubGFuZyAhPT0gcGFyYW1ldGVycy5sYW5nKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgIH1cbiAgfSlcblxuICAvLyA0LiBmaWx0ZXIgb3V0IGl0ZW1zIGluIGFjdGl2aXR5LWFyZWFcblxuICAvLyA1LiBnZXQgbWFwIGVsZW1lbnRzXG5cbiAgLy8gNi4gZ2V0IEdyb3VwIGRhdGFcblxuICAvLyA3LiBwcmVzZW50IGdyb3VwIGVsZW1lbnRzXG5cbiAgJC53aGVuKCgpPT57fSlcbiAgICAudGhlbigoKSA9PntcbiAgICAgIHJldHVybiBsYW5ndWFnZU1hbmFnZXIuaW5pdGlhbGl6ZShpbml0UGFyYW1zWydsYW5nJ10gfHwgJ2VuJyk7XG4gICAgfSlcbiAgICAuZG9uZSgoZGF0YSkgPT4ge30pXG4gICAgLnRoZW4oKCkgPT4ge1xuICAgICAgJC5hamF4KHtcbiAgICAgICAgICB1cmw6ICdodHRwczovL25ldy1tYXAuMzUwLm9yZy9vdXRwdXQvMzUwb3JnLXdpdGgtYW5ub3RhdGlvbi5qcy5neicsIC8vJ3wqKkRBVEFfU09VUkNFKip8JyxcbiAgICAgICAgICAvLyB1cmw6ICcvZGF0YS90ZXN0LmpzJywgLy8nfCoqREFUQV9TT1VSQ0UqKnwnLFxuICAgICAgICAgIGRhdGFUeXBlOiAnc2NyaXB0JyxcbiAgICAgICAgICBjYWNoZTogdHJ1ZSxcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgLy8gd2luZG93LkVWRU5UU19EQVRBID0gZGF0YTtcbiAgICAgICAgICAgIC8vSnVuZSAxNCwgMjAxOCDigJMgQ2hhbmdlc1xuICAgICAgICAgICAgaWYod2luZG93LnF1ZXJpZXMuZ3JvdXApIHtcbiAgICAgICAgICAgICAgd2luZG93LkVWRU5UU19EQVRBLmRhdGEgPSB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YS5maWx0ZXIoKGkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaS5jYW1wYWlnbiA9PSB3aW5kb3cucXVlcmllcy5ncm91cFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9Mb2FkIGdyb3Vwc1xuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sb2FkLWdyb3VwcycsIHsgZ3JvdXBzOiB3aW5kb3cuRVZFTlRTX0RBVEEuZ3JvdXBzIH0pO1xuXG5cbiAgICAgICAgICAgIHZhciBwYXJhbWV0ZXJzID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuICAgICAgICAgICAgd2luZG93LkVWRU5UU19EQVRBLmRhdGEuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICBpdGVtWydldmVudF90eXBlJ10gPSAhaXRlbS5ldmVudF90eXBlID8gJ0FjdGlvbicgOiBpdGVtLmV2ZW50X3R5cGU7XG5cbiAgICAgICAgICAgICAgaWYgKGl0ZW0uc3RhcnRfZGF0ZXRpbWUgJiYgIWl0ZW0uc3RhcnRfZGF0ZXRpbWUubWF0Y2goL1okLykpIHtcbiAgICAgICAgICAgICAgICBpdGVtLnN0YXJ0X2RhdGV0aW1lID0gaXRlbS5zdGFydF9kYXRldGltZSArIFwiWlwiO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gd2luZG93LkVWRU5UU19EQVRBLmRhdGEuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgLy8gICByZXR1cm4gbmV3IERhdGUoYS5zdGFydF9kYXRldGltZSkgLSBuZXcgRGF0ZShiLnN0YXJ0X2RhdGV0aW1lKTtcbiAgICAgICAgICAgIC8vIH0pXG5cblxuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LXVwZGF0ZScsIHsgcGFyYW1zOiBwYXJhbWV0ZXJzIH0pO1xuICAgICAgICAgICAgLy8gJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXBsb3QnLCB7XG4gICAgICAgICAgICAgICAgZGF0YTogd2luZG93LkVWRU5UU19EQVRBLmRhdGEsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiBwYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICAgIGdyb3Vwczogd2luZG93LkVWRU5UU19EQVRBLmdyb3Vwcy5yZWR1Y2UoKGRpY3QsIGl0ZW0pPT57IGRpY3RbaXRlbS5zdXBlcmdyb3VwXSA9IGl0ZW07IHJldHVybiBkaWN0OyB9LCB7fSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgLy8gfSk7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgLy9UT0RPOiBNYWtlIHRoZSBnZW9qc29uIGNvbnZlcnNpb24gaGFwcGVuIG9uIHRoZSBiYWNrZW5kXG5cbiAgICAgICAgICAgIC8vUmVmcmVzaCB0aGluZ3NcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICBsZXQgcCA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG5cbiAgICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcCk7XG4gICAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicsIHApO1xuXG4gICAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcCk7XG4gICAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCBwKTtcblxuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cblxuXG59KShqUXVlcnkpO1xuIl19
