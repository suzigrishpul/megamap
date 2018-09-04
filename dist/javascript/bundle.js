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
    var map = L.map('map-proper', { dragging: !L.Browser.mobile }).setView([34.88593094075317, 5.097656250000001], 2);

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
            iconSize: [22, 22],
            iconAnchor: [11, 14],
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9oZWxwZXIuanMiLCJjbGFzc2VzL2xhbmd1YWdlLmpzIiwiY2xhc3Nlcy9saXN0LmpzIiwiY2xhc3Nlcy9tYXAuanMiLCJjbGFzc2VzL3F1ZXJ5LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIkF1dG9jb21wbGV0ZU1hbmFnZXIiLCIkIiwidGFyZ2V0IiwiQVBJX0tFWSIsInRhcmdldEl0ZW0iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJxdWVyeU1nciIsIlF1ZXJ5TWFuYWdlciIsImdlb2NvZGVyIiwiZ29vZ2xlIiwibWFwcyIsIkdlb2NvZGVyIiwiJHRhcmdldCIsImZvcmNlU2VhcmNoIiwicSIsImdlb2NvZGUiLCJhZGRyZXNzIiwicmVzdWx0cyIsInN0YXR1cyIsImdlb21ldHJ5IiwidXBkYXRlVmlld3BvcnQiLCJ2aWV3cG9ydCIsInZhbCIsImZvcm1hdHRlZF9hZGRyZXNzIiwiaW5pdGlhbGl6ZSIsInR5cGVhaGVhZCIsImhpbnQiLCJoaWdobGlnaHQiLCJtaW5MZW5ndGgiLCJjbGFzc05hbWVzIiwibWVudSIsIm5hbWUiLCJkaXNwbGF5IiwiaXRlbSIsImxpbWl0Iiwic291cmNlIiwic3luYyIsImFzeW5jIiwib24iLCJvYmoiLCJkYXR1bSIsImpRdWVyeSIsIkhlbHBlciIsInJlZlNvdXJjZSIsInVybCIsInJlZiIsInNyYyIsImluZGV4T2YiLCJMYW5ndWFnZU1hbmFnZXIiLCJsYW5ndWFnZSIsImRpY3Rpb25hcnkiLCIkdGFyZ2V0cyIsInVwZGF0ZVBhZ2VMYW5ndWFnZSIsInRhcmdldExhbmd1YWdlIiwicm93cyIsImZpbHRlciIsImkiLCJsYW5nIiwiZWFjaCIsImluZGV4IiwidGFyZ2V0QXR0cmlidXRlIiwiZGF0YSIsImxhbmdUYXJnZXQiLCJ0ZXh0IiwiYXR0ciIsInRhcmdldHMiLCJhamF4IiwiZGF0YVR5cGUiLCJzdWNjZXNzIiwidHJpZ2dlciIsIm11bHRpc2VsZWN0IiwicmVmcmVzaCIsInVwZGF0ZUxhbmd1YWdlIiwiZ2V0VHJhbnNsYXRpb24iLCJrZXkiLCJMaXN0TWFuYWdlciIsIm9wdGlvbnMiLCJ0YXJnZXRMaXN0IiwicmVmZXJyZXIiLCJyZW5kZXJFdmVudCIsIm0iLCJtb21lbnQiLCJEYXRlIiwic3RhcnRfZGF0ZXRpbWUiLCJ1dGMiLCJzdWJ0cmFjdCIsInV0Y09mZnNldCIsImRhdGUiLCJmb3JtYXQiLCJtYXRjaCIsIndpbmRvdyIsInNsdWdpZnkiLCJldmVudF90eXBlIiwibGF0IiwibG5nIiwidGl0bGUiLCJ2ZW51ZSIsInJlbmRlckdyb3VwIiwid2Vic2l0ZSIsInN1cGVyR3JvdXAiLCJzdXBlcmdyb3VwIiwibG9jYXRpb24iLCJkZXNjcmlwdGlvbiIsIiRsaXN0IiwidXBkYXRlRmlsdGVyIiwicCIsInJlbW92ZVByb3AiLCJhZGRDbGFzcyIsImpvaW4iLCJmaW5kIiwiaGlkZSIsImZvckVhY2giLCJmaWwiLCJzaG93IiwidXBkYXRlQm91bmRzIiwiYm91bmQxIiwiYm91bmQyIiwiaW5kIiwiX2xhdCIsIl9sbmciLCJtaTEwIiwicmVtb3ZlQ2xhc3MiLCJfdmlzaWJsZSIsImxlbmd0aCIsInBvcHVsYXRlTGlzdCIsImhhcmRGaWx0ZXJzIiwia2V5U2V0Iiwic3BsaXQiLCIkZXZlbnRMaXN0IiwiRVZFTlRTX0RBVEEiLCJtYXAiLCJ0b0xvd2VyQ2FzZSIsImluY2x1ZGVzIiwicmVtb3ZlIiwiYXBwZW5kIiwiTWFwTWFuYWdlciIsIkxBTkdVQUdFIiwicmVuZGVyQW5ub3RhdGlvblBvcHVwIiwicmVuZGVyQW5ub3RhdGlvbnNHZW9Kc29uIiwibGlzdCIsInJlbmRlcmVkIiwidHlwZSIsImNvb3JkaW5hdGVzIiwicHJvcGVydGllcyIsImFubm90YXRpb25Qcm9wcyIsInBvcHVwQ29udGVudCIsInJlbmRlckdlb2pzb24iLCJpc05hTiIsInBhcnNlRmxvYXQiLCJzdWJzdHJpbmciLCJldmVudFByb3BlcnRpZXMiLCJhY2Nlc3NUb2tlbiIsIkwiLCJkcmFnZ2luZyIsIkJyb3dzZXIiLCJtb2JpbGUiLCJzZXRWaWV3Iiwic2Nyb2xsV2hlZWxab29tIiwiZGlzYWJsZSIsIm9uTW92ZSIsImV2ZW50Iiwic3ciLCJnZXRCb3VuZHMiLCJfc291dGhXZXN0IiwibmUiLCJfbm9ydGhFYXN0IiwiZ2V0Wm9vbSIsInRpbGVMYXllciIsImF0dHJpYnV0aW9uIiwiYWRkVG8iLCJxdWVyaWVzIiwidGVybWluYXRvciIsIiRtYXAiLCJjYWxsYmFjayIsInNldEJvdW5kcyIsImJvdW5kczEiLCJib3VuZHMyIiwiYm91bmRzIiwiZml0Qm91bmRzIiwiYW5pbWF0ZSIsInNldENlbnRlciIsImNlbnRlciIsInpvb20iLCJnZXRDZW50ZXJCeUxvY2F0aW9uIiwidHJpZ2dlclpvb21FbmQiLCJmaXJlRXZlbnQiLCJ6b29tT3V0T25jZSIsInpvb21PdXQiLCJ6b29tVW50aWxIaXQiLCIkdGhpcyIsImludGVydmFsSGFuZGxlciIsInNldEludGVydmFsIiwiY2xlYXJJbnRlcnZhbCIsInJlZnJlc2hNYXAiLCJpbnZhbGlkYXRlU2l6ZSIsImZpbHRlck1hcCIsImZpbHRlcnMiLCJwbG90UG9pbnRzIiwiZ3JvdXBzIiwiZ2VvanNvbiIsImZlYXR1cmVzIiwiZXZlbnRzTGF5ZXIiLCJnZW9KU09OIiwicG9pbnRUb0xheWVyIiwiZmVhdHVyZSIsImxhdGxuZyIsImV2ZW50VHlwZSIsInNsdWdnZWQiLCJpY29uVXJsIiwiaXNQYXN0IiwiaWNvbnVybCIsInNtYWxsSWNvbiIsImljb24iLCJpY29uU2l6ZSIsImljb25BbmNob3IiLCJjbGFzc05hbWUiLCJnZW9qc29uTWFya2VyT3B0aW9ucyIsIm1hcmtlciIsIm9uRWFjaEZlYXR1cmUiLCJsYXllciIsImJpbmRQb3B1cCIsImFubm90YXRpb24iLCJhbm5vdGF0aW9ucyIsImFubm90SWNvbiIsImNvbnNvbGUiLCJsb2ciLCJhbm5vdE1hcmtlcnMiLCJhbm5vdExheWVyR3JvdXAiLCJhZGRMYXllciIsImZlYXR1cmVHcm91cCIsInVwZGF0ZSIsImxhdExuZyIsInRhcmdldEZvcm0iLCJwcmV2aW91cyIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImZvcm0iLCJkZXBhcmFtIiwic2VyaWFsaXplIiwiaGFzaCIsInBhcmFtIiwicGFyYW1zIiwibG9jIiwicHJvcCIsImdldFBhcmFtZXRlcnMiLCJwYXJhbWV0ZXJzIiwidXBkYXRlTG9jYXRpb24iLCJNYXRoIiwiYWJzIiwiZiIsImIiLCJmQXZnIiwiYkF2ZyIsIkpTT04iLCJzdHJpbmdpZnkiLCJ1cGRhdGVWaWV3cG9ydEJ5Qm91bmQiLCJ0cmlnZ2VyU3VibWl0IiwiYXV0b2NvbXBsZXRlTWFuYWdlciIsIm1hcE1hbmFnZXIiLCJERUZBVUxUX0lDT04iLCJ0b1N0cmluZyIsInJlcGxhY2UiLCJnZXRRdWVyeVN0cmluZyIsInF1ZXJ5U3RyaW5nS2V5VmFsdWUiLCJwYXJlbnQiLCJzZWFyY2giLCJxc0pzb25PYmplY3QiLCJncm91cCIsIndpZHRoIiwiY3NzIiwiYnVpbGRGaWx0ZXJzIiwiZW5hYmxlSFRNTCIsInRlbXBsYXRlcyIsImJ1dHRvbiIsImxpIiwiZHJvcFJpZ2h0Iiwib25Jbml0aWFsaXplZCIsIm9uRHJvcGRvd25TaG93Iiwic2V0VGltZW91dCIsIm9uRHJvcGRvd25IaWRlIiwib3B0aW9uTGFiZWwiLCJ1bmVzY2FwZSIsImh0bWwiLCJvcHRpb25DbGFzcyIsInNlbGVjdGVkQ2xhc3MiLCJidXR0b25DbGFzcyIsIm9uQ2hhbmdlIiwib3B0aW9uIiwiY2hlY2tlZCIsInNlbGVjdCIsInF1ZXJ5TWFuYWdlciIsImluaXRQYXJhbXMiLCJsYW5ndWFnZU1hbmFnZXIiLCJsaXN0TWFuYWdlciIsImluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayIsInJlc3VsdCIsImhlaWdodCIsInBhcnNlIiwiY29weSIsImNvcHlUZXh0IiwiZ2V0RWxlbWVudEJ5SWQiLCJleGVjQ29tbWFuZCIsIm9wdCIsImVtcHR5IiwidmFsdWVUZXh0IiwidHJhbnNsYXRpb24iLCJ0b2dnbGVDbGFzcyIsImtleUNvZGUiLCJfcXVlcnkiLCJvbGRVUkwiLCJvcmlnaW5hbEV2ZW50Iiwib2xkSGFzaCIsIndoZW4iLCJ0aGVuIiwiZG9uZSIsImNhY2hlIiwiY2FtcGFpZ24iLCJyZWR1Y2UiLCJkaWN0Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOztBQUNBLElBQU1BLHNCQUF1QixVQUFTQyxDQUFULEVBQVk7QUFDdkM7O0FBRUEsU0FBTyxVQUFDQyxNQUFELEVBQVk7O0FBRWpCLFFBQU1DLFVBQVUseUNBQWhCO0FBQ0EsUUFBTUMsYUFBYSxPQUFPRixNQUFQLElBQWlCLFFBQWpCLEdBQTRCRyxTQUFTQyxhQUFULENBQXVCSixNQUF2QixDQUE1QixHQUE2REEsTUFBaEY7QUFDQSxRQUFNSyxXQUFXQyxjQUFqQjtBQUNBLFFBQUlDLFdBQVcsSUFBSUMsT0FBT0MsSUFBUCxDQUFZQyxRQUFoQixFQUFmOztBQUVBLFdBQU87QUFDTEMsZUFBU1osRUFBRUcsVUFBRixDQURKO0FBRUxGLGNBQVFFLFVBRkg7QUFHTFUsbUJBQWEscUJBQUNDLENBQUQsRUFBTztBQUNsQk4saUJBQVNPLE9BQVQsQ0FBaUIsRUFBRUMsU0FBU0YsQ0FBWCxFQUFqQixFQUFpQyxVQUFVRyxPQUFWLEVBQW1CQyxNQUFuQixFQUEyQjtBQUMxRCxjQUFJRCxRQUFRLENBQVIsQ0FBSixFQUFnQjtBQUNkLGdCQUFJRSxXQUFXRixRQUFRLENBQVIsRUFBV0UsUUFBMUI7QUFDQWIscUJBQVNjLGNBQVQsQ0FBd0JELFNBQVNFLFFBQWpDO0FBQ0FyQixjQUFFRyxVQUFGLEVBQWNtQixHQUFkLENBQWtCTCxRQUFRLENBQVIsRUFBV00saUJBQTdCO0FBQ0Q7QUFDRDtBQUNBO0FBRUQsU0FURDtBQVVELE9BZEk7QUFlTEMsa0JBQVksc0JBQU07QUFDaEJ4QixVQUFFRyxVQUFGLEVBQWNzQixTQUFkLENBQXdCO0FBQ1pDLGdCQUFNLElBRE07QUFFWkMscUJBQVcsSUFGQztBQUdaQyxxQkFBVyxDQUhDO0FBSVpDLHNCQUFZO0FBQ1ZDLGtCQUFNO0FBREk7QUFKQSxTQUF4QixF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MEJ1SCxNQUExQixDQUFpQyxVQUFDQyxJQUFELEVBQU83UixJQUFQLEVBQWM7QUFBRTZSLGlCQUFLN1IsS0FBS21FLFVBQVYsSUFBd0JuRSxJQUF4QixDQUE4QixPQUFPNlIsSUFBUDtBQUFjLFdBQTdGLEVBQStGLEVBQS9GO0FBSDRCLFNBQXhDO0FBS047QUFDTTlULFVBQUVJLFFBQUYsRUFBWWlFLE9BQVosQ0FBb0Isc0JBQXBCLEVBQTRDZ0wsVUFBNUM7QUFDQTs7QUFFQTtBQUNBaUMsbUJBQVcsWUFBTTtBQUNmLGNBQUk3SyxJQUFJeUwsYUFBYTlDLGFBQWIsRUFBUjs7QUFFQXBQLFlBQUVJLFFBQUYsRUFBWWlFLE9BQVosQ0FBb0Isb0JBQXBCLEVBQTBDb0MsQ0FBMUM7QUFDQXpHLFlBQUVJLFFBQUYsRUFBWWlFLE9BQVosQ0FBb0Isb0JBQXBCLEVBQTBDb0MsQ0FBMUM7O0FBRUF6RyxZQUFFSSxRQUFGLEVBQVlpRSxPQUFaLENBQW9CLDRCQUFwQixFQUFrRG9DLENBQWxEO0FBQ0F6RyxZQUFFSSxRQUFGLEVBQVlpRSxPQUFaLENBQW9CLDhCQUFwQixFQUFvRG9DLENBQXBEO0FBRUQsU0FURCxFQVNHLEdBVEg7QUFVRDtBQXZERSxLQUFQO0FBeURDLEdBL0RMO0FBbUVELENBbGJELEVBa2JHaEUsTUFsYkgiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vL0FQSSA6QUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXG5jb25zdCBBdXRvY29tcGxldGVNYW5hZ2VyID0gKGZ1bmN0aW9uKCQpIHtcbiAgLy9Jbml0aWFsaXphdGlvbi4uLlxuXG4gIHJldHVybiAodGFyZ2V0KSA9PiB7XG5cbiAgICBjb25zdCBBUElfS0VZID0gXCJBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cIjtcbiAgICBjb25zdCB0YXJnZXRJdGVtID0gdHlwZW9mIHRhcmdldCA9PSBcInN0cmluZ1wiID8gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpIDogdGFyZ2V0O1xuICAgIGNvbnN0IHF1ZXJ5TWdyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgdmFyIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgJHRhcmdldDogJCh0YXJnZXRJdGVtKSxcbiAgICAgIHRhcmdldDogdGFyZ2V0SXRlbSxcbiAgICAgIGZvcmNlU2VhcmNoOiAocSkgPT4ge1xuICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogcSB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG4gICAgICAgICAgaWYgKHJlc3VsdHNbMF0pIHtcbiAgICAgICAgICAgIGxldCBnZW9tZXRyeSA9IHJlc3VsdHNbMF0uZ2VvbWV0cnk7XG4gICAgICAgICAgICBxdWVyeU1nci51cGRhdGVWaWV3cG9ydChnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAkKHRhcmdldEl0ZW0pLnZhbChyZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gdmFyIGdlb21ldHJ5ID0gZGF0dW0uZ2VvbWV0cnk7XG4gICAgICAgICAgLy8gcXVlcnlNZ3IudXBkYXRlVmlld3BvcnQoZ2VvbWV0cnkudmlld3BvcnQpO1xuXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGluaXRpYWxpemU6ICgpID0+IHtcbiAgICAgICAgJCh0YXJnZXRJdGVtKS50eXBlYWhlYWQoe1xuICAgICAgICAgICAgICAgICAgICBoaW50OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1pbkxlbmd0aDogNCxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICAgIG1lbnU6ICd0dC1kcm9wZG93bi1tZW51J1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnc2VhcmNoLXJlc3VsdHMnLFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAoaXRlbSkgPT4gaXRlbS5mb3JtYXR0ZWRfYWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgbGltaXQ6IDEwLFxuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IGZ1bmN0aW9uIChxLCBzeW5jLCBhc3luYyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogcSB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFzeW5jKHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApLm9uKCd0eXBlYWhlYWQ6c2VsZWN0ZWQnLCBmdW5jdGlvbiAob2JqLCBkYXR1bSkge1xuICAgICAgICAgICAgICAgICAgICBpZihkYXR1bSlcbiAgICAgICAgICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgICAgICAgdmFyIGdlb21ldHJ5ID0gZGF0dW0uZ2VvbWV0cnk7XG4gICAgICAgICAgICAgICAgICAgICAgcXVlcnlNZ3IudXBkYXRlVmlld3BvcnQoZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgICAgIC8vICBtYXAuZml0Qm91bmRzKGdlb21ldHJ5LmJvdW5kcz8gZ2VvbWV0cnkuYm91bmRzIDogZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG5cblxuICAgIHJldHVybiB7XG5cbiAgICB9XG4gIH1cblxufShqUXVlcnkpKTtcbiIsImNvbnN0IEhlbHBlciA9ICgoJCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICByZWZTb3VyY2U6ICh1cmwsIHJlZiwgc3JjKSA9PiB7XG4gICAgICAgIC8vIEp1biAxMyAyMDE4IOKAlCBGaXggZm9yIHNvdXJjZSBhbmQgcmVmZXJyZXJcbiAgICAgICAgaWYgKHJlZiB8fCBzcmMpIHtcbiAgICAgICAgICBpZiAodXJsLmluZGV4T2YoXCI/XCIpID49IDApIHtcbiAgICAgICAgICAgIHVybCA9IGAke3VybH0mcmVmZXJyZXI9JHtyZWZ8fFwiXCJ9JnNvdXJjZT0ke3NyY3x8XCJcIn1gO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1cmwgPSBgJHt1cmx9P3JlZmVycmVyPSR7cmVmfHxcIlwifSZzb3VyY2U9JHtzcmN8fFwiXCJ9YDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdXJsO1xuICAgICAgfVxuICAgIH07XG59KShqUXVlcnkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBMYW5ndWFnZU1hbmFnZXIgPSAoKCQpID0+IHtcbiAgLy9rZXlWYWx1ZVxuXG4gIC8vdGFyZ2V0cyBhcmUgdGhlIG1hcHBpbmdzIGZvciB0aGUgbGFuZ3VhZ2VcbiAgcmV0dXJuICgpID0+IHtcbiAgICBsZXQgbGFuZ3VhZ2U7XG4gICAgbGV0IGRpY3Rpb25hcnkgPSB7fTtcbiAgICBsZXQgJHRhcmdldHMgPSAkKFwiW2RhdGEtbGFuZy10YXJnZXRdW2RhdGEtbGFuZy1rZXldXCIpO1xuXG4gICAgY29uc3QgdXBkYXRlUGFnZUxhbmd1YWdlID0gKCkgPT4ge1xuXG4gICAgICBsZXQgdGFyZ2V0TGFuZ3VhZ2UgPSBkaWN0aW9uYXJ5LnJvd3MuZmlsdGVyKChpKSA9PiBpLmxhbmcgPT09IGxhbmd1YWdlKVswXTtcblxuICAgICAgJHRhcmdldHMuZWFjaCgoaW5kZXgsIGl0ZW0pID0+IHtcblxuICAgICAgICBsZXQgdGFyZ2V0QXR0cmlidXRlID0gJChpdGVtKS5kYXRhKCdsYW5nLXRhcmdldCcpO1xuICAgICAgICBsZXQgbGFuZ1RhcmdldCA9ICQoaXRlbSkuZGF0YSgnbGFuZy1rZXknKTtcblxuXG5cblxuICAgICAgICBzd2l0Y2godGFyZ2V0QXR0cmlidXRlKSB7XG4gICAgICAgICAgY2FzZSAndGV4dCc6XG5cbiAgICAgICAgICAgICQoKGBbZGF0YS1sYW5nLWtleT1cIiR7bGFuZ1RhcmdldH1cIl1gKSkudGV4dCh0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBpZiAobGFuZ1RhcmdldCA9PSBcIm1vcmUtc2VhcmNoLW9wdGlvbnNcIikge1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd2YWx1ZSc6XG4gICAgICAgICAgICAkKGl0ZW0pLnZhbCh0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgJChpdGVtKS5hdHRyKHRhcmdldEF0dHJpYnV0ZSwgdGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICBsYW5ndWFnZSxcbiAgICAgIHRhcmdldHM6ICR0YXJnZXRzLFxuICAgICAgZGljdGlvbmFyeSxcbiAgICAgIGluaXRpYWxpemU6IChsYW5nKSA9PiB7XG5cbiAgICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgICAgLy8gdXJsOiAnaHR0cHM6Ly9nc3gyanNvbi5jb20vYXBpP2lkPTFPM2VCeWpMMXZsWWY3WjdhbS1faHRSVFFpNzNQYWZxSWZOQmRMbVhlOFNNJnNoZWV0PTEnLFxuICAgICAgICAgIHVybDogJy9kYXRhL2xhbmcuanNvbicsXG4gICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgZGljdGlvbmFyeSA9IGRhdGE7XG4gICAgICAgICAgICBsYW5ndWFnZSA9IGxhbmc7XG4gICAgICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UoKTtcblxuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sYW5ndWFnZS1sb2FkZWQnKTtcblxuICAgICAgICAgICAgJChcIiNsYW5ndWFnZS1vcHRzXCIpLm11bHRpc2VsZWN0KCdzZWxlY3QnLCBsYW5nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHJlZnJlc2g6ICgpID0+IHtcbiAgICAgICAgdXBkYXRlUGFnZUxhbmd1YWdlKGxhbmd1YWdlKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVMYW5ndWFnZTogKGxhbmcpID0+IHtcblxuICAgICAgICBsYW5ndWFnZSA9IGxhbmc7XG4gICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZSgpO1xuICAgICAgfSxcbiAgICAgIGdldFRyYW5zbGF0aW9uOiAoa2V5KSA9PiB7XG4gICAgICAgIGxldCB0YXJnZXRMYW5ndWFnZSA9IGRpY3Rpb25hcnkucm93cy5maWx0ZXIoKGkpID0+IGkubGFuZyA9PT0gbGFuZ3VhZ2UpWzBdO1xuICAgICAgICByZXR1cm4gdGFyZ2V0TGFuZ3VhZ2Vba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbn0pKGpRdWVyeSk7XG4iLCIvKiBUaGlzIGxvYWRzIGFuZCBtYW5hZ2VzIHRoZSBsaXN0ISAqL1xuXG5jb25zdCBMaXN0TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKG9wdGlvbnMpID0+IHtcbiAgICBsZXQgdGFyZ2V0TGlzdCA9IG9wdGlvbnMudGFyZ2V0TGlzdCB8fCBcIiNldmVudHMtbGlzdFwiO1xuICAgIC8vIEp1bmUgMTMgYDE4IOKAkyByZWZlcnJlciBhbmQgc291cmNlXG4gICAgbGV0IHtyZWZlcnJlciwgc291cmNlfSA9IG9wdGlvbnM7XG5cbiAgICBjb25zdCAkdGFyZ2V0ID0gdHlwZW9mIHRhcmdldExpc3QgPT09ICdzdHJpbmcnID8gJCh0YXJnZXRMaXN0KSA6IHRhcmdldExpc3Q7XG5cbiAgICBjb25zdCByZW5kZXJFdmVudCA9IChpdGVtLCByZWZlcnJlciA9IG51bGwsIHNvdXJjZSA9IG51bGwpID0+IHtcbiAgICAgIGxldCBtID0gbW9tZW50KG5ldyBEYXRlKGl0ZW0uc3RhcnRfZGF0ZXRpbWUpKTtcbiAgICAgIG0gPSBtLnV0YygpLnN1YnRyYWN0KG0udXRjT2Zmc2V0KCksICdtJyk7XG4gICAgICB2YXIgZGF0ZSA9IG0uZm9ybWF0KFwiZGRkZCBNTU0gREQsIGg6bW1hXCIpO1xuICAgICAgbGV0IHVybCA9IGl0ZW0udXJsLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0udXJsIDogXCIvL1wiICsgaXRlbS51cmw7XG4gICAgICAvLyBsZXQgc3VwZXJHcm91cCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG4gICAgICB1cmwgPSBIZWxwZXIucmVmU291cmNlKHVybCwgcmVmZXJyZXIsIHNvdXJjZSk7XG5cbiAgICAgIHJldHVybiBgXG4gICAgICA8bGkgY2xhc3M9JyR7d2luZG93LnNsdWdpZnkoaXRlbS5ldmVudF90eXBlKX0gZXZlbnRzIGV2ZW50LW9iaicgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudCB0eXBlLWFjdGlvblwiPlxuICAgICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICAgIDxsaSBjbGFzcz0ndGFnLSR7aXRlbS5ldmVudF90eXBlfSB0YWcnPiR7aXRlbS5ldmVudF90eXBlfTwvbGk+XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgICA8aDIgY2xhc3M9XCJldmVudC10aXRsZVwiPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1kYXRlIGRhdGVcIj4ke2RhdGV9PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWFkZHJlc3MgYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+UlNWUDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICAgYFxuICAgIH07XG5cbiAgICBjb25zdCByZW5kZXJHcm91cCA9IChpdGVtLCByZWZlcnJlciA9IG51bGwsIHNvdXJjZSA9IG51bGwpID0+IHtcbiAgICAgIGxldCB1cmwgPSBpdGVtLndlYnNpdGUubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS53ZWJzaXRlIDogXCIvL1wiICsgaXRlbS53ZWJzaXRlO1xuICAgICAgbGV0IHN1cGVyR3JvdXAgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuXG4gICAgICB1cmwgPSBIZWxwZXIucmVmU291cmNlKHVybCwgcmVmZXJyZXIsIHNvdXJjZSk7XG5cbiAgICAgIHJldHVybiBgXG4gICAgICA8bGkgY2xhc3M9JyR7aXRlbS5ldmVudF90eXBlfSAke3N1cGVyR3JvdXB9IGdyb3VwLW9iaicgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ncm91cCBncm91cC1vYmpcIj5cbiAgICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5zdXBlcmdyb3VwfVwiPiR7aXRlbS5zdXBlcmdyb3VwfTwvbGk+XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0ubmFtZX08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtbG9jYXRpb24gbG9jYXRpb25cIj4ke2l0ZW0ubG9jYXRpb259PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGVzY3JpcHRpb25cIj5cbiAgICAgICAgICAgICAgPHA+JHtpdGVtLmRlc2NyaXB0aW9ufTwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+R2V0IEludm9sdmVkPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAkbGlzdDogJHRhcmdldCxcbiAgICAgIHVwZGF0ZUZpbHRlcjogKHApID0+IHtcbiAgICAgICAgaWYoIXApIHJldHVybjtcblxuICAgICAgICAvLyBSZW1vdmUgRmlsdGVyc1xuXG4gICAgICAgICR0YXJnZXQucmVtb3ZlUHJvcChcImNsYXNzXCIpO1xuICAgICAgICAkdGFyZ2V0LmFkZENsYXNzKHAuZmlsdGVyID8gcC5maWx0ZXIuam9pbihcIiBcIikgOiAnJylcblxuICAgICAgICAkdGFyZ2V0LmZpbmQoJ2xpJykuaGlkZSgpO1xuXG4gICAgICAgIGlmIChwLmZpbHRlcikge1xuICAgICAgICAgIHAuZmlsdGVyLmZvckVhY2goKGZpbCk9PntcbiAgICAgICAgICAgICR0YXJnZXQuZmluZChgbGkuJHtmaWx9YCkuc2hvdygpO1xuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB1cGRhdGVCb3VuZHM6IChib3VuZDEsIGJvdW5kMikgPT4ge1xuXG4gICAgICAgIC8vIGNvbnN0IGJvdW5kcyA9IFtwLmJvdW5kczEsIHAuYm91bmRzMl07XG5cblxuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsIGxpLmV2ZW50LW9iaiwgdWwgbGkuZ3JvdXAtb2JqJykuZWFjaCgoaW5kLCBpdGVtKT0+IHtcblxuICAgICAgICAgIGxldCBfbGF0ID0gJChpdGVtKS5kYXRhKCdsYXQnKSxcbiAgICAgICAgICAgICAgX2xuZyA9ICQoaXRlbSkuZGF0YSgnbG5nJyk7XG5cbiAgICAgICAgICBjb25zdCBtaTEwID0gMC4xNDQ5O1xuXG4gICAgICAgICAgaWYgKGJvdW5kMVswXSA8PSBfbGF0ICYmIGJvdW5kMlswXSA+PSBfbGF0ICYmIGJvdW5kMVsxXSA8PSBfbG5nICYmIGJvdW5kMlsxXSA+PSBfbG5nKSB7XG5cbiAgICAgICAgICAgICQoaXRlbSkuYWRkQ2xhc3MoJ3dpdGhpbi1ib3VuZCcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKGl0ZW0pLnJlbW92ZUNsYXNzKCd3aXRoaW4tYm91bmQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBfdmlzaWJsZSA9ICR0YXJnZXQuZmluZCgndWwgbGkuZXZlbnQtb2JqLndpdGhpbi1ib3VuZCwgdWwgbGkuZ3JvdXAtb2JqLndpdGhpbi1ib3VuZCcpLmxlbmd0aDtcbiAgICAgICAgaWYgKF92aXNpYmxlID09IDApIHtcbiAgICAgICAgICAvLyBUaGUgbGlzdCBpcyBlbXB0eVxuICAgICAgICAgICR0YXJnZXQuYWRkQ2xhc3MoXCJpcy1lbXB0eVwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkdGFyZ2V0LnJlbW92ZUNsYXNzKFwiaXMtZW1wdHlcIik7XG4gICAgICAgIH1cblxuICAgICAgfSxcbiAgICAgIHBvcHVsYXRlTGlzdDogKGhhcmRGaWx0ZXJzKSA9PiB7XG4gICAgICAgIC8vdXNpbmcgd2luZG93LkVWRU5UX0RBVEFcbiAgICAgICAgY29uc3Qga2V5U2V0ID0gIWhhcmRGaWx0ZXJzLmtleSA/IFtdIDogaGFyZEZpbHRlcnMua2V5LnNwbGl0KCcsJyk7XG5cbiAgICAgICAgdmFyICRldmVudExpc3QgPSB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YS5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgaWYgKGtleVNldC5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0uZXZlbnRfdHlwZSAmJiBpdGVtLmV2ZW50X3R5cGUudG9Mb3dlckNhc2UoKSA9PSAnZ3JvdXAnID8gcmVuZGVyR3JvdXAoaXRlbSkgOiByZW5kZXJFdmVudChpdGVtLCByZWZlcnJlciwgc291cmNlKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtleVNldC5sZW5ndGggPiAwICYmIGl0ZW0uZXZlbnRfdHlwZSAhPSAnZ3JvdXAnICYmIGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyRXZlbnQoaXRlbSwgcmVmZXJyZXIsIHNvdXJjZSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXlTZXQubGVuZ3RoID4gMCAmJiBpdGVtLmV2ZW50X3R5cGUgPT0gJ2dyb3VwJyAmJiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5zdXBlcmdyb3VwKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlbmRlckdyb3VwKGl0ZW0sIHJlZmVycmVyLCBzb3VyY2UpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgfSlcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCBsaScpLnJlbW92ZSgpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsJykuYXBwZW5kKCRldmVudExpc3QpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJcblxuY29uc3QgTWFwTWFuYWdlciA9ICgoJCkgPT4ge1xuICBsZXQgTEFOR1VBR0UgPSAnZW4nO1xuXG4gIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0sIHJlZmVycmVyID0gbnVsbCwgc291cmNlID0gbnVsbCkgPT4ge1xuXG4gICAgbGV0IG0gPSBtb21lbnQobmV3IERhdGUoaXRlbS5zdGFydF9kYXRldGltZSkpO1xuICAgIG0gPSBtLnV0YygpLnN1YnRyYWN0KG0udXRjT2Zmc2V0KCksICdtJyk7XG5cbiAgICB2YXIgZGF0ZSA9IG0uZm9ybWF0KFwiZGRkZCBNTU0gREQsIGg6bW1hXCIpO1xuICAgIGxldCB1cmwgPSBpdGVtLnVybC5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLnVybCA6IFwiLy9cIiArIGl0ZW0udXJsO1xuXG4gICAgdXJsID0gSGVscGVyLnJlZlNvdXJjZSh1cmwsIHJlZmVycmVyLCBzb3VyY2UpO1xuXG4gICAgbGV0IHN1cGVyR3JvdXAgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuICAgIHJldHVybiBgXG4gICAgPGRpdiBjbGFzcz0ncG9wdXAtaXRlbSAke2l0ZW0uZXZlbnRfdHlwZX0gJHtzdXBlckdyb3VwfScgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnRcIj5cbiAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctJHtpdGVtLmV2ZW50X3R5cGV9XCI+JHtpdGVtLmV2ZW50X3R5cGUgfHwgJ0FjdGlvbid9PC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPGgyIGNsYXNzPVwiZXZlbnQtdGl0bGVcIj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZX08L2E+PC9oMj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWRhdGVcIj4ke2RhdGV9PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1hZGRyZXNzIGFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgIDxwPiR7aXRlbS52ZW51ZX08L3A+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5SU1ZQPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICAgIGBcbiAgfTtcblxuICBjb25zdCByZW5kZXJHcm91cCA9IChpdGVtLCByZWZlcnJlciA9IG51bGwsIHNvdXJjZSA9IG51bGwpID0+IHtcblxuICAgIGxldCB1cmwgPSBpdGVtLndlYnNpdGUubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS53ZWJzaXRlIDogXCIvL1wiICsgaXRlbS53ZWJzaXRlO1xuXG4gICAgdXJsID0gSGVscGVyLnJlZlNvdXJjZSh1cmwsIHJlZmVycmVyLCBzb3VyY2UpO1xuXG4gICAgbGV0IHN1cGVyR3JvdXAgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuICAgIHJldHVybiBgXG4gICAgPGxpPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXAgZ3JvdXAtb2JqICR7c3VwZXJHcm91cH1cIj5cbiAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctJHtpdGVtLnN1cGVyZ3JvdXB9ICR7c3VwZXJHcm91cH1cIj4ke2l0ZW0uc3VwZXJncm91cH08L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtaGVhZGVyXCI+XG4gICAgICAgICAgPGgyPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLm5hbWV9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWxvY2F0aW9uIGxvY2F0aW9uXCI+JHtpdGVtLmxvY2F0aW9ufTwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXNjcmlwdGlvblwiPlxuICAgICAgICAgICAgPHA+JHtpdGVtLmRlc2NyaXB0aW9ufTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPkdldCBJbnZvbHZlZDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2xpPlxuICAgIGBcbiAgfTtcblxuICBjb25zdCByZW5kZXJBbm5vdGF0aW9uUG9wdXAgPSAoaXRlbSkgPT4ge1xuICAgIHJldHVybiBgXG4gICAgPGRpdiBjbGFzcz0ncG9wdXAtaXRlbSBhbm5vdGF0aW9uJyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudFwiPlxuICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgPGxpIGNsYXNzPVwidGFnIHRhZy1hbm5vdGF0aW9uXCI+QW5ub3RhdGlvbjwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxoMiBjbGFzcz1cImV2ZW50LXRpdGxlXCI+JHtpdGVtLm5hbWV9PC9oMj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWFkZHJlc3MgYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgPHA+JHtpdGVtLmRlc2NyaXB0aW9ufTwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgO1xuICB9XG5cblxuICBjb25zdCByZW5kZXJBbm5vdGF0aW9uc0dlb0pzb24gPSAobGlzdCkgPT4ge1xuICAgIHJldHVybiBsaXN0Lm1hcCgoaXRlbSkgPT4ge1xuICAgICAgY29uc3QgcmVuZGVyZWQgPSByZW5kZXJBbm5vdGF0aW9uUG9wdXAoaXRlbSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICAgIGdlb21ldHJ5OiB7XG4gICAgICAgICAgdHlwZTogXCJQb2ludFwiLFxuICAgICAgICAgIGNvb3JkaW5hdGVzOiBbaXRlbS5sbmcsIGl0ZW0ubGF0XVxuICAgICAgICB9LFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgYW5ub3RhdGlvblByb3BzOiBpdGVtLFxuICAgICAgICAgIHBvcHVwQ29udGVudDogcmVuZGVyZWRcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBjb25zdCByZW5kZXJHZW9qc29uID0gKGxpc3QsIHJlZiA9IG51bGwsIHNyYyA9IG51bGwpID0+IHtcbiAgICByZXR1cm4gbGlzdC5tYXAoKGl0ZW0pID0+IHtcbiAgICAgIC8vIHJlbmRlcmVkIGV2ZW50VHlwZVxuICAgICAgbGV0IHJlbmRlcmVkO1xuXG4gICAgICBpZiAoaXRlbS5ldmVudF90eXBlICYmIGl0ZW0uZXZlbnRfdHlwZS50b0xvd2VyQ2FzZSgpID09ICdncm91cCcpIHtcbiAgICAgICAgcmVuZGVyZWQgPSByZW5kZXJHcm91cChpdGVtLCByZWYsIHNyYyk7XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlbmRlcmVkID0gcmVuZGVyRXZlbnQoaXRlbSwgcmVmLCBzcmMpO1xuICAgICAgfVxuXG4gICAgICAvLyBmb3JtYXQgY2hlY2tcbiAgICAgIGlmIChpc05hTihwYXJzZUZsb2F0KHBhcnNlRmxvYXQoaXRlbS5sbmcpKSkpIHtcbiAgICAgICAgaXRlbS5sbmcgPSBpdGVtLmxuZy5zdWJzdHJpbmcoMSlcbiAgICAgIH1cbiAgICAgIGlmIChpc05hTihwYXJzZUZsb2F0KHBhcnNlRmxvYXQoaXRlbS5sYXQpKSkpIHtcbiAgICAgICAgaXRlbS5sYXQgPSBpdGVtLmxhdC5zdWJzdHJpbmcoMSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgIHR5cGU6IFwiUG9pbnRcIixcbiAgICAgICAgICBjb29yZGluYXRlczogW2l0ZW0ubG5nLCBpdGVtLmxhdF1cbiAgICAgICAgfSxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIGV2ZW50UHJvcGVydGllczogaXRlbSxcbiAgICAgICAgICBwb3B1cENvbnRlbnQ6IHJlbmRlcmVkXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIChvcHRpb25zKSA9PiB7XG4gICAgdmFyIGFjY2Vzc1Rva2VuID0gJ3BrLmV5SjFJam9pYldGMGRHaGxkek0xTUNJc0ltRWlPaUphVFZGTVVrVXdJbjAud2NNM1hjOEJHQzZQTS1PeXJ3am5oZyc7XG4gICAgdmFyIG1hcCA9IEwubWFwKCdtYXAtcHJvcGVyJywgeyBkcmFnZ2luZzogIUwuQnJvd3Nlci5tb2JpbGUgfSkuc2V0VmlldyhbMzQuODg1OTMwOTQwNzUzMTcsIDUuMDk3NjU2MjUwMDAwMDAxXSwgMik7XG5cbiAgICBsZXQge3JlZmVycmVyLCBzb3VyY2V9ID0gb3B0aW9ucztcblxuICAgIGlmICghTC5Ccm93c2VyLm1vYmlsZSkge1xuICAgICAgbWFwLnNjcm9sbFdoZWVsWm9vbS5kaXNhYmxlKCk7XG4gICAgfVxuXG4gICAgTEFOR1VBR0UgPSBvcHRpb25zLmxhbmcgfHwgJ2VuJztcblxuICAgIGlmIChvcHRpb25zLm9uTW92ZSkge1xuICAgICAgbWFwLm9uKCdkcmFnZW5kJywgKGV2ZW50KSA9PiB7XG5cblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuICAgICAgICBvcHRpb25zLm9uTW92ZShzdywgbmUpO1xuICAgICAgfSkub24oJ3pvb21lbmQnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKG1hcC5nZXRab29tKCkgPD0gNCkge1xuICAgICAgICAgICQoXCIjbWFwXCIpLmFkZENsYXNzKFwiem9vbWVkLW91dFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkKFwiI21hcFwiKS5yZW1vdmVDbGFzcyhcInpvb21lZC1vdXRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuICAgICAgICBvcHRpb25zLm9uTW92ZShzdywgbmUpO1xuICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBtYXAuZmlyZUV2ZW50KCd6b29tZW5kJyk7XG5cbiAgICBMLnRpbGVMYXllcignaHR0cHM6Ly9hcGkubWFwYm94LmNvbS9zdHlsZXMvdjEvbWF0dGhldzM1MC9jamE0MXRpamsyN2Q2MnJxb2Q3ZzBseDRiL3RpbGVzLzI1Ni97en0ve3h9L3t5fT9hY2Nlc3NfdG9rZW49JyArIGFjY2Vzc1Rva2VuLCB7XG4gICAgICAgIGF0dHJpYnV0aW9uOiAnJmNvcHk7IDxhIGhyZWY9XCJodHRwOi8vb3NtLm9yZy9jb3B5cmlnaHRcIj5PcGVuU3RyZWV0TWFwPC9hPiBjb250cmlidXRvcnMg4oCiIDxhIGhyZWY9XCIvLzM1MC5vcmdcIj4zNTAub3JnPC9hPidcbiAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgLy8gY29uc29sZS5sb2cod2luZG93LnF1ZXJpZXNbJ3R3aWxpZ2h0LXpvbmUnXSwgd2luZG93LnF1ZXJpZXNbJ3R3aWxpZ2h0LXpvbmUnXSA9PT0gXCJ0cnVlXCIpO1xuICAgIGlmKHdpbmRvdy5xdWVyaWVzWyd0d2lsaWdodC16b25lJ10pIHtcbiAgICAgIEwudGVybWluYXRvcigpLmFkZFRvKG1hcClcbiAgICB9XG5cbiAgICBsZXQgZ2VvY29kZXIgPSBudWxsO1xuICAgIHJldHVybiB7XG4gICAgICAkbWFwOiBtYXAsXG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHNldEJvdW5kczogKGJvdW5kczEsIGJvdW5kczIpID0+IHtcblxuICAgICAgICBjb25zdCBib3VuZHMgPSBbYm91bmRzMSwgYm91bmRzMl07XG4gICAgICAgIG1hcC5maXRCb3VuZHMoYm91bmRzLCB7IGFuaW1hdGU6IGZhbHNlfSk7XG4gICAgICB9LFxuICAgICAgc2V0Q2VudGVyOiAoY2VudGVyLCB6b29tID0gMTApID0+IHtcbiAgICAgICAgaWYgKCFjZW50ZXIgfHwgIWNlbnRlclswXSB8fCBjZW50ZXJbMF0gPT0gXCJcIlxuICAgICAgICAgICAgICB8fCAhY2VudGVyWzFdIHx8IGNlbnRlclsxXSA9PSBcIlwiKSByZXR1cm47XG4gICAgICAgIG1hcC5zZXRWaWV3KGNlbnRlciwgem9vbSk7XG4gICAgICB9LFxuICAgICAgZ2V0Qm91bmRzOiAoKSA9PiB7XG5cbiAgICAgICAgbGV0IHN3ID0gW21hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW21hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubG5nXTtcblxuICAgICAgICByZXR1cm4gW3N3LCBuZV07XG4gICAgICB9LFxuICAgICAgLy8gQ2VudGVyIGxvY2F0aW9uIGJ5IGdlb2NvZGVkXG4gICAgICBnZXRDZW50ZXJCeUxvY2F0aW9uOiAobG9jYXRpb24sIGNhbGxiYWNrKSA9PiB7XG5cbiAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IGxvY2F0aW9uIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcblxuICAgICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlc3VsdHNbMF0pXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyWm9vbUVuZDogKCkgPT4ge1xuICAgICAgICBtYXAuZmlyZUV2ZW50KCd6b29tZW5kJyk7XG4gICAgICB9LFxuICAgICAgem9vbU91dE9uY2U6ICgpID0+IHtcbiAgICAgICAgbWFwLnpvb21PdXQoMSk7XG4gICAgICB9LFxuICAgICAgem9vbVVudGlsSGl0OiAoKSA9PiB7XG4gICAgICAgIHZhciAkdGhpcyA9IHRoaXM7XG4gICAgICAgIG1hcC56b29tT3V0KDEpO1xuICAgICAgICBsZXQgaW50ZXJ2YWxIYW5kbGVyID0gbnVsbDtcbiAgICAgICAgaW50ZXJ2YWxIYW5kbGVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgIHZhciBfdmlzaWJsZSA9ICQoZG9jdW1lbnQpLmZpbmQoJ3VsIGxpLmV2ZW50LW9iai53aXRoaW4tYm91bmQsIHVsIGxpLmdyb3VwLW9iai53aXRoaW4tYm91bmQnKS5sZW5ndGg7XG4gICAgICAgICAgaWYgKF92aXNpYmxlID09IDApIHtcbiAgICAgICAgICAgIG1hcC56b29tT3V0KDEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSGFuZGxlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAyMDApO1xuICAgICAgfSxcbiAgICAgIHJlZnJlc2hNYXA6ICgpID0+IHtcbiAgICAgICAgbWFwLmludmFsaWRhdGVTaXplKGZhbHNlKTtcbiAgICAgICAgLy8gbWFwLl9vblJlc2l6ZSgpO1xuICAgICAgICAvLyBtYXAuZmlyZUV2ZW50KCd6b29tZW5kJyk7XG5cblxuICAgICAgfSxcbiAgICAgIGZpbHRlck1hcDogKGZpbHRlcnMpID0+IHtcblxuICAgICAgICAkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXBcIikuaGlkZSgpO1xuXG5cbiAgICAgICAgaWYgKCFmaWx0ZXJzKSByZXR1cm47XG5cbiAgICAgICAgZmlsdGVycy5mb3JFYWNoKChpdGVtKSA9PiB7XG5cbiAgICAgICAgICAkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXAuXCIgKyBpdGVtLnRvTG93ZXJDYXNlKCkpLnNob3coKTtcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICBwbG90UG9pbnRzOiAobGlzdCwgaGFyZEZpbHRlcnMsIGdyb3VwcykgPT4ge1xuICAgICAgICBjb25zdCBrZXlTZXQgPSAhaGFyZEZpbHRlcnMua2V5ID8gW10gOiBoYXJkRmlsdGVycy5rZXkuc3BsaXQoJywnKTtcblxuICAgICAgICBpZiAoa2V5U2V0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsaXN0ID0gbGlzdC5maWx0ZXIoKGl0ZW0pID0+IGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKVxuICAgICAgICB9XG5cblxuICAgICAgICBjb25zdCBnZW9qc29uID0ge1xuICAgICAgICAgIHR5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgICAgICAgICBmZWF0dXJlczogcmVuZGVyR2VvanNvbihsaXN0LCByZWZlcnJlciwgc291cmNlKVxuICAgICAgICB9O1xuXG5cbiAgICAgICAgY29uc3QgZXZlbnRzTGF5ZXIgPSBMLmdlb0pTT04oZ2VvanNvbiwge1xuICAgICAgICAgICAgcG9pbnRUb0xheWVyOiAoZmVhdHVyZSwgbGF0bG5nKSA9PiB7XG4gICAgICAgICAgICAgIC8vIEljb25zIGZvciBtYXJrZXJzXG4gICAgICAgICAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuZXZlbnRfdHlwZTtcblxuICAgICAgICAgICAgICAvLyBJZiBubyBzdXBlcmdyb3VwLCBpdCdzIGFuIGV2ZW50LlxuICAgICAgICAgICAgICBjb25zdCBzdXBlcmdyb3VwID0gZ3JvdXBzW2ZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuc3VwZXJncm91cF0gPyBmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLnN1cGVyZ3JvdXAgOiBcIkV2ZW50c1wiO1xuICAgICAgICAgICAgICBjb25zdCBzbHVnZ2VkID0gd2luZG93LnNsdWdpZnkoc3VwZXJncm91cCk7XG5cblxuXG4gICAgICAgICAgICAgIGxldCBpY29uVXJsO1xuICAgICAgICAgICAgICBjb25zdCBpc1Bhc3QgPSBuZXcgRGF0ZShmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLnN0YXJ0X2RhdGV0aW1lKSA8IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICAgIGlmIChldmVudFR5cGUgPT0gXCJBY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIGljb25VcmwgPSBpc1Bhc3QgPyBcIi9pbWcvcGFzdC1ldmVudC5wbmdcIiA6IFwiL2ltZy9ldmVudC5wbmdcIjtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpY29uVXJsID0gZ3JvdXBzW3N1cGVyZ3JvdXBdID8gZ3JvdXBzW3N1cGVyZ3JvdXBdLmljb251cmwgfHwgXCIvaW1nL2V2ZW50LnBuZ1wiICA6IFwiL2ltZy9ldmVudC5wbmdcIiA7XG4gICAgICAgICAgICAgIH1cblxuXG5cbiAgICAgICAgICAgICAgY29uc3Qgc21hbGxJY29uID0gIEwuaWNvbih7XG4gICAgICAgICAgICAgICAgaWNvblVybDogaWNvblVybCxcbiAgICAgICAgICAgICAgICBpY29uU2l6ZTogWzE4LCAxOF0sXG4gICAgICAgICAgICAgICAgaWNvbkFuY2hvcjogWzksIDldLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogc2x1Z2dlZCArICcgZXZlbnQtaXRlbS1wb3B1cCAnICsgKGlzUGFzdCYmZXZlbnRUeXBlID09IFwiQWN0aW9uXCI/XCJldmVudC1wYXN0LWV2ZW50XCI6XCJcIilcbiAgICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgICB2YXIgZ2VvanNvbk1hcmtlck9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgaWNvbjogc21hbGxJY29uLFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICByZXR1cm4gTC5tYXJrZXIobGF0bG5nLCBnZW9qc29uTWFya2VyT3B0aW9ucyk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgb25FYWNoRmVhdHVyZTogKGZlYXR1cmUsIGxheWVyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZmVhdHVyZS5wcm9wZXJ0aWVzICYmIGZlYXR1cmUucHJvcGVydGllcy5wb3B1cENvbnRlbnQpIHtcbiAgICAgICAgICAgICAgbGF5ZXIuYmluZFBvcHVwKGZlYXR1cmUucHJvcGVydGllcy5wb3B1cENvbnRlbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjb25zdCBpc1Bhc3QgPSBuZXcgRGF0ZShmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLnN0YXJ0X2RhdGV0aW1lKSA8IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICAvLyBjb25zdCBldmVudFR5cGUgPSBmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLmV2ZW50X3R5cGU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBldmVudHNMYXllci5hZGRUbyhtYXApO1xuICAgICAgICAvLyBldmVudHNMYXllci5icmluZ1RvQmFjaygpO1xuXG5cbiAgICAgICAgLy8gQWRkIEFubm90YXRpb25zXG4gICAgICAgIGlmICh3aW5kb3cucXVlcmllcy5hbm5vdGF0aW9uKSB7XG4gICAgICAgICAgY29uc3QgYW5ub3RhdGlvbnMgPSAhd2luZG93LkVWRU5UU19EQVRBLmFubm90YXRpb25zID8gW10gOiB3aW5kb3cuRVZFTlRTX0RBVEEuYW5ub3RhdGlvbnMuZmlsdGVyKChpdGVtKT0+aXRlbS50eXBlPT09d2luZG93LnF1ZXJpZXMuYW5ub3RhdGlvbik7XG5cbiAgICAgICAgICBjb25zdCBhbm5vdEljb24gPSAgTC5pY29uKHtcbiAgICAgICAgICAgIGljb25Vcmw6IFwiL2ltZy9hbm5vdGF0aW9uLnBuZ1wiLFxuICAgICAgICAgICAgaWNvblNpemU6IFsyMiwgMjJdLFxuICAgICAgICAgICAgaWNvbkFuY2hvcjogWzExLCAxNF0sXG4gICAgICAgICAgICBjbGFzc05hbWU6ICdhbm5vdGF0aW9uLXBvcHVwJ1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNvbnNvbGUubG9nKHJlbmRlckFubm90YXRpb25Qb3B1cCk7XG4gICAgICAgICAgY29uc3QgYW5ub3RNYXJrZXJzID0gYW5ub3RhdGlvbnMubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gTC5tYXJrZXIoW2l0ZW0ubGF0LCBpdGVtLmxuZ10sIHtpY29uOiBhbm5vdEljb259KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmJpbmRQb3B1cChyZW5kZXJBbm5vdGF0aW9uUG9wdXAoaXRlbSkpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyBhbm5vdExheWVyLmJyaW5nVG9Gcm9udCgpO1xuXG4gICAgICAgICAgY29uc29sZS5sb2coYW5ub3RNYXJrZXJzKTtcblxuICAgICAgICAgIC8vIGNvbnN0IGFubm90TGF5ZXJHcm91cCA9IDtcblxuICAgICAgICAgIGNvbnN0IGFubm90TGF5ZXJHcm91cCA9IG1hcC5hZGRMYXllcihMLmZlYXR1cmVHcm91cChhbm5vdE1hcmtlcnMpKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhhbm5vdExheWVyR3JvdXApO1xuICAgICAgICAgIC8vIGFubm90TGF5ZXJHcm91cC5icmluZ1RvRnJvbnQoKTtcbiAgICAgICAgICAvLyBhbm5vdE1hcmtlcnMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAvLyAgIGl0ZW0uYWRkVG8obWFwKTtcbiAgICAgICAgICAvLyAgIGl0ZW0uYnJpbmdUb0Zyb250KCk7XG4gICAgICAgICAgLy8gfSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHVwZGF0ZTogKHApID0+IHtcbiAgICAgICAgaWYgKCFwIHx8ICFwLmxhdCB8fCAhcC5sbmcgKSByZXR1cm47XG5cbiAgICAgICAgbWFwLnNldFZpZXcoTC5sYXRMbmcocC5sYXQsIHAubG5nKSwgMTApO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJjb25zdCBRdWVyeU1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRGb3JtID0gXCJmb3JtI2ZpbHRlcnMtZm9ybVwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRGb3JtID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0Rm9ybSkgOiB0YXJnZXRGb3JtO1xuICAgIGxldCBsYXQgPSBudWxsO1xuICAgIGxldCBsbmcgPSBudWxsO1xuXG4gICAgbGV0IHByZXZpb3VzID0ge307XG5cbiAgICAkdGFyZ2V0Lm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgbGF0ID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbCgpO1xuICAgICAgbG5nID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbCgpO1xuXG4gICAgICB2YXIgZm9ybSA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcblxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAkLnBhcmFtKGZvcm0pO1xuICAgIH0pXG5cbiAgICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJ3NlbGVjdCNmaWx0ZXItaXRlbXMnLCAoKSA9PiB7XG4gICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgIH0pXG5cblxuICAgIHJldHVybiB7XG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgcGFyYW1zID0gJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSlcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhbmddXCIpLnZhbChwYXJhbXMubGFuZyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChwYXJhbXMubGF0KTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKHBhcmFtcy5sbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwocGFyYW1zLmJvdW5kMSk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChwYXJhbXMuYm91bmQyKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxvY11cIikudmFsKHBhcmFtcy5sb2MpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9a2V5XVwiKS52YWwocGFyYW1zLmtleSk7XG5cbiAgICAgICAgICBpZiAocGFyYW1zLmZpbHRlcikge1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiI2ZpbHRlci1pdGVtcyBvcHRpb25cIikucmVtb3ZlUHJvcChcInNlbGVjdGVkXCIpO1xuICAgICAgICAgICAgcGFyYW1zLmZpbHRlci5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIjZmlsdGVyLWl0ZW1zIG9wdGlvblt2YWx1ZT0nXCIgKyBpdGVtICsgXCInXVwiKS5wcm9wKFwic2VsZWN0ZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGdldFBhcmFtZXRlcnM6ICgpID0+IHtcbiAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG4gICAgICAgIC8vIHBhcmFtZXRlcnNbJ2xvY2F0aW9uJ10gO1xuXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHBhcmFtZXRlcnMpIHtcbiAgICAgICAgICBpZiAoICFwYXJhbWV0ZXJzW2tleV0gfHwgcGFyYW1ldGVyc1trZXldID09IFwiXCIpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBwYXJhbWV0ZXJzW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtZXRlcnM7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTG9jYXRpb246IChsYXQsIGxuZykgPT4ge1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKGxhdCk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwobG5nKTtcbiAgICAgICAgLy8gJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVWaWV3cG9ydDogKHZpZXdwb3J0KSA9PiB7XG5cbiAgICAgICAgLy8gQXZlcmFnZSBpdCBpZiBsZXNzIHRoYW4gMTBtaSByYWRpdXNcbiAgICAgICAgaWYgKE1hdGguYWJzKHZpZXdwb3J0LmYuYiAtIHZpZXdwb3J0LmYuZikgPCAuMTUgfHwgTWF0aC5hYnModmlld3BvcnQuYi5iIC0gdmlld3BvcnQuYi5mKSA8IC4xNSkge1xuICAgICAgICAgIGxldCBmQXZnID0gKHZpZXdwb3J0LmYuYiArIHZpZXdwb3J0LmYuZikgLyAyO1xuICAgICAgICAgIGxldCBiQXZnID0gKHZpZXdwb3J0LmIuYiArIHZpZXdwb3J0LmIuZikgLyAyO1xuICAgICAgICAgIHZpZXdwb3J0LmYgPSB7IGI6IGZBdmcgLSAuMDgsIGY6IGZBdmcgKyAuMDggfTtcbiAgICAgICAgICB2aWV3cG9ydC5iID0geyBiOiBiQXZnIC0gLjA4LCBmOiBiQXZnICsgLjA4IH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYm91bmRzID0gW1t2aWV3cG9ydC5mLmIsIHZpZXdwb3J0LmIuYl0sIFt2aWV3cG9ydC5mLmYsIHZpZXdwb3J0LmIuZl1dO1xuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlVmlld3BvcnRCeUJvdW5kOiAoc3csIG5lKSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW3N3LCBuZV07Ly8vLy8vLy9cblxuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdHJpZ2dlclN1Ym1pdDogKCkgPT4ge1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSkoalF1ZXJ5KTtcbiIsImxldCBhdXRvY29tcGxldGVNYW5hZ2VyO1xubGV0IG1hcE1hbmFnZXI7XG5cbndpbmRvdy5ERUZBVUxUX0lDT04gPSBcIi9pbWcvZXZlbnQucG5nXCI7XG53aW5kb3cuc2x1Z2lmeSA9ICh0ZXh0KSA9PiAhdGV4dCA/IHRleHQgOiB0ZXh0LnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHMrL2csICctJykgICAgICAgICAgIC8vIFJlcGxhY2Ugc3BhY2VzIHdpdGggLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9bXlxcd1xcLV0rL2csICcnKSAgICAgICAvLyBSZW1vdmUgYWxsIG5vbi13b3JkIGNoYXJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcLVxcLSsvZywgJy0nKSAgICAgICAgIC8vIFJlcGxhY2UgbXVsdGlwbGUgLSB3aXRoIHNpbmdsZSAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL14tKy8sICcnKSAgICAgICAgICAgICAvLyBUcmltIC0gZnJvbSBzdGFydCBvZiB0ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLy0rJC8sICcnKTsgICAgICAgICAgICAvLyBUcmltIC0gZnJvbSBlbmQgb2YgdGV4dFxuXG5jb25zdCBnZXRRdWVyeVN0cmluZyA9ICgpID0+IHtcbiAgICB2YXIgcXVlcnlTdHJpbmdLZXlWYWx1ZSA9IHdpbmRvdy5wYXJlbnQubG9jYXRpb24uc2VhcmNoLnJlcGxhY2UoJz8nLCAnJykuc3BsaXQoJyYnKTtcbiAgICB2YXIgcXNKc29uT2JqZWN0ID0ge307XG4gICAgaWYgKHF1ZXJ5U3RyaW5nS2V5VmFsdWUgIT0gJycpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBxdWVyeVN0cmluZ0tleVZhbHVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBxc0pzb25PYmplY3RbcXVlcnlTdHJpbmdLZXlWYWx1ZVtpXS5zcGxpdCgnPScpWzBdXSA9IHF1ZXJ5U3RyaW5nS2V5VmFsdWVbaV0uc3BsaXQoJz0nKVsxXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcXNKc29uT2JqZWN0O1xufTtcblxuKGZ1bmN0aW9uKCQpIHtcbiAgLy8gTG9hZCB0aGluZ3NcblxuICB3aW5kb3cucXVlcmllcyA9ICAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHJpbmcoMSkpO1xuICB0cnkge1xuICAgIGlmICgoIXdpbmRvdy5xdWVyaWVzLmdyb3VwIHx8ICghd2luZG93LnF1ZXJpZXMucmVmZXJyZXIgJiYgIXdpbmRvdy5xdWVyaWVzLnNvdXJjZSkpICYmIHdpbmRvdy5wYXJlbnQpIHtcbiAgICAgIHdpbmRvdy5xdWVyaWVzID0ge1xuICAgICAgICBncm91cDogZ2V0UXVlcnlTdHJpbmcoKS5ncm91cCxcbiAgICAgICAgcmVmZXJyZXI6IGdldFF1ZXJ5U3RyaW5nKCkucmVmZXJyZXIsXG4gICAgICAgIHNvdXJjZTogZ2V0UXVlcnlTdHJpbmcoKS5zb3VyY2UsXG4gICAgICAgIFwidHdpbGlnaHQtem9uZVwiOiB3aW5kb3cucXVlcmllc1sndHdpbGlnaHQtem9uZSddLFxuICAgICAgICBcImFubm90YXRpb25cIjogd2luZG93LnF1ZXJpZXNbJ2Fubm90YXRpb24nXSxcbiAgICAgICAgXCJmdWxsLW1hcFwiOiB3aW5kb3cucXVlcmllc1snZnVsbC1tYXAnXVxuICAgICAgfTtcbiAgICB9XG4gIH0gY2F0Y2goZSkge1xuICAgIGNvbnNvbGUubG9nKFwiRXJyb3I6IFwiLCBlKTtcbiAgfVxuXG4gIGlmICh3aW5kb3cucXVlcmllc1snZnVsbC1tYXAnXSkge1xuICAgIGlmICgkKHdpbmRvdykud2lkdGgoKSA8IDYwMCkge1xuICAgICAgLy8gJChcIiNldmVudHMtbGlzdC1jb250YWluZXJcIikuaGlkZSgpO1xuICAgICAgJChcImJvZHlcIikuYWRkQ2xhc3MoXCJtYXAtdmlld1wiKTtcbiAgICAgIC8vICQoXCIuZmlsdGVyLWFyZWFcIikuaGlkZSgpO1xuICAgICAgLy8gJChcInNlY3Rpb24jbWFwXCIpLmNzcyhcImhlaWdodFwiLCBcImNhbGMoMTAwJSAtIDY0cHgpXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKFwiYm9keVwiKS5hZGRDbGFzcyhcImZpbHRlci1jb2xsYXBzZWRcIik7XG4gICAgICAvLyAkKFwiI2V2ZW50cy1saXN0LWNvbnRhaW5lclwiKS5oaWRlKCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgICQoXCIjc2hvdy1oaWRlLWxpc3QtY29udGFpbmVyXCIpLmhpZGUoKTtcbiAgfVxuXG5cbiAgaWYgKHdpbmRvdy5xdWVyaWVzLmdyb3VwKSB7XG4gICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLnBhcmVudCgpLmNzcyhcIm9wYWNpdHlcIiwgXCIwXCIpO1xuICB9XG4gIGNvbnN0IGJ1aWxkRmlsdGVycyA9ICgpID0+IHskKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykubXVsdGlzZWxlY3Qoe1xuICAgICAgZW5hYmxlSFRNTDogdHJ1ZSxcbiAgICAgIHRlbXBsYXRlczoge1xuICAgICAgICBidXR0b246ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cIm11bHRpc2VsZWN0IGRyb3Bkb3duLXRvZ2dsZVwiIGRhdGEtdG9nZ2xlPVwiZHJvcGRvd25cIj48c3BhbiBkYXRhLWxhbmctdGFyZ2V0PVwidGV4dFwiIGRhdGEtbGFuZy1rZXk9XCJtb3JlLXNlYXJjaC1vcHRpb25zXCI+PC9zcGFuPiA8c3BhbiBjbGFzcz1cImZhIGZhLWNhcmV0LWRvd25cIj48L3NwYW4+PC9idXR0b24+JyxcbiAgICAgICAgbGk6ICc8bGk+PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIj48bGFiZWw+PC9sYWJlbD48L2E+PC9saT4nXG4gICAgICB9LFxuICAgICAgZHJvcFJpZ2h0OiB0cnVlLFxuICAgICAgb25Jbml0aWFsaXplZDogKCkgPT4ge1xuXG4gICAgICB9LFxuICAgICAgb25Ecm9wZG93blNob3c6ICgpID0+IHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcihcIm1vYmlsZS11cGRhdGUtbWFwLWhlaWdodFwiKTtcbiAgICAgICAgfSwgMTApO1xuXG4gICAgICB9LFxuICAgICAgb25Ecm9wZG93bkhpZGU6ICgpID0+IHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcihcIm1vYmlsZS11cGRhdGUtbWFwLWhlaWdodFwiKTtcbiAgICAgICAgfSwgMTApO1xuICAgICAgfSxcbiAgICAgIG9wdGlvbkxhYmVsOiAoZSkgPT4ge1xuICAgICAgICAvLyBsZXQgZWwgPSAkKCAnPGRpdj48L2Rpdj4nICk7XG4gICAgICAgIC8vIGVsLmFwcGVuZCgoKSArIFwiXCIpO1xuXG4gICAgICAgIHJldHVybiB1bmVzY2FwZSgkKGUpLmF0dHIoJ2xhYmVsJykpIHx8ICQoZSkuaHRtbCgpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfTtcbiAgYnVpbGRGaWx0ZXJzKCk7XG5cblxuICAkKCdzZWxlY3QjbGFuZ3VhZ2Utb3B0cycpLm11bHRpc2VsZWN0KHtcbiAgICBlbmFibGVIVE1MOiB0cnVlLFxuICAgIG9wdGlvbkNsYXNzOiAoKSA9PiAnbGFuZy1vcHQnLFxuICAgIHNlbGVjdGVkQ2xhc3M6ICgpID0+ICdsYW5nLXNlbCcsXG4gICAgYnV0dG9uQ2xhc3M6ICgpID0+ICdsYW5nLWJ1dCcsXG4gICAgZHJvcFJpZ2h0OiB0cnVlLFxuICAgIG9wdGlvbkxhYmVsOiAoZSkgPT4ge1xuICAgICAgLy8gbGV0IGVsID0gJCggJzxkaXY+PC9kaXY+JyApO1xuICAgICAgLy8gZWwuYXBwZW5kKCgpICsgXCJcIik7XG5cbiAgICAgIHJldHVybiB1bmVzY2FwZSgkKGUpLmF0dHIoJ2xhYmVsJykpIHx8ICQoZSkuaHRtbCgpO1xuICAgIH0sXG4gICAgb25DaGFuZ2U6IChvcHRpb24sIGNoZWNrZWQsIHNlbGVjdCkgPT4ge1xuXG4gICAgICBjb25zdCBwYXJhbWV0ZXJzID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcbiAgICAgIHBhcmFtZXRlcnNbJ2xhbmcnXSA9IG9wdGlvbi52YWwoKTtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgcGFyYW1ldGVycyk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXJlc2V0LW1hcCcsIHBhcmFtZXRlcnMpO1xuXG4gICAgfVxuICB9KVxuXG4gIC8vIDEuIGdvb2dsZSBtYXBzIGdlb2NvZGVcblxuICAvLyAyLiBmb2N1cyBtYXAgb24gZ2VvY29kZSAodmlhIGxhdC9sbmcpXG4gIGNvbnN0IHF1ZXJ5TWFuYWdlciA9IFF1ZXJ5TWFuYWdlcigpO1xuICAgICAgICBxdWVyeU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuXG4gIGNvbnN0IGluaXRQYXJhbXMgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuXG5cblxuICBjb25zdCBsYW5ndWFnZU1hbmFnZXIgPSBMYW5ndWFnZU1hbmFnZXIoKTtcblxuICBjb25zdCBsaXN0TWFuYWdlciA9IExpc3RNYW5hZ2VyKHtcbiAgICByZWZlcnJlcjogd2luZG93LnF1ZXJpZXMucmVmZXJyZXIsXG4gICAgc291cmNlOiB3aW5kb3cucXVlcmllcy5zb3VyY2VcbiAgfSk7XG5cblxuICBtYXBNYW5hZ2VyID0gTWFwTWFuYWdlcih7XG4gICAgb25Nb3ZlOiAoc3csIG5lKSA9PiB7XG4gICAgICAvLyBXaGVuIHRoZSBtYXAgbW92ZXMgYXJvdW5kLCB3ZSB1cGRhdGUgdGhlIGxpc3RcbiAgICAgIHF1ZXJ5TWFuYWdlci51cGRhdGVWaWV3cG9ydEJ5Qm91bmQoc3csIG5lKTtcbiAgICAgIC8vdXBkYXRlIFF1ZXJ5XG4gICAgfSxcbiAgICByZWZlcnJlcjogd2luZG93LnF1ZXJpZXMucmVmZXJyZXIsXG4gICAgc291cmNlOiB3aW5kb3cucXVlcmllcy5zb3VyY2VcbiAgfSk7XG5cbiAgd2luZG93LmluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayA9ICgpID0+IHtcblxuICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIgPSBBdXRvY29tcGxldGVNYW5hZ2VyKFwiaW5wdXRbbmFtZT0nbG9jJ11cIik7XG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlci5pbml0aWFsaXplKCk7XG5cbiAgICBpZiAoaW5pdFBhcmFtcy5sb2MgJiYgaW5pdFBhcmFtcy5sb2MgIT09ICcnICYmICghaW5pdFBhcmFtcy5ib3VuZDEgJiYgIWluaXRQYXJhbXMuYm91bmQyKSkge1xuICAgICAgbWFwTWFuYWdlci5pbml0aWFsaXplKCgpID0+IHtcbiAgICAgICAgbWFwTWFuYWdlci5nZXRDZW50ZXJCeUxvY2F0aW9uKGluaXRQYXJhbXMubG9jLCAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgcXVlcnlNYW5hZ2VyLnVwZGF0ZVZpZXdwb3J0KHJlc3VsdC5nZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBpZihpbml0UGFyYW1zLmxhdCAmJiBpbml0UGFyYW1zLmxuZykge1xuICAgIG1hcE1hbmFnZXIuc2V0Q2VudGVyKFtpbml0UGFyYW1zLmxhdCwgaW5pdFBhcmFtcy5sbmddKTtcbiAgfVxuXG4gIC8qKipcbiAgKiBMaXN0IEV2ZW50c1xuICAqIFRoaXMgd2lsbCB0cmlnZ2VyIHRoZSBsaXN0IHVwZGF0ZSBtZXRob2RcbiAgKi9cbiAgJChkb2N1bWVudCkub24oJ21vYmlsZS11cGRhdGUtbWFwLWhlaWdodCcsIChldmVudCkgPT4ge1xuICAgIC8vVGhpcyBjaGVja3MgaWYgd2lkdGggaXMgZm9yIG1vYmlsZVxuICAgIGlmICgkKHdpbmRvdykud2lkdGgoKSA8IDYwMCkge1xuICAgICAgc2V0VGltZW91dCgoKT0+IHtcbiAgICAgICAgJChcIiNtYXBcIikuaGVpZ2h0KCQoXCIjZXZlbnRzLWxpc3RcIikuaGVpZ2h0KCkpO1xuICAgICAgICBtYXBNYW5hZ2VyLnJlZnJlc2hNYXAoKTtcbiAgICAgIH0sIDEwKTtcbiAgICB9XG4gIH0pXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgbGlzdE1hbmFnZXIucG9wdWxhdGVMaXN0KG9wdGlvbnMucGFyYW1zKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG5cbiAgICBsaXN0TWFuYWdlci51cGRhdGVGaWx0ZXIob3B0aW9ucyk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLWJ5LWJvdW5kJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgbGV0IGJvdW5kMSwgYm91bmQyO1xuXG4gICAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLmJvdW5kMSB8fCAhb3B0aW9ucy5ib3VuZDIpIHtcbiAgICAgIFtib3VuZDEsIGJvdW5kMl0gPSBtYXBNYW5hZ2VyLmdldEJvdW5kcygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBib3VuZDEgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQxKTtcbiAgICAgIGJvdW5kMiA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDIpO1xuICAgIH1cblxuICAgIGxpc3RNYW5hZ2VyLnVwZGF0ZUJvdW5kcyhib3VuZDEsIGJvdW5kMilcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItcmVzZXQtbWFwJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgdmFyIGNvcHkgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9wdGlvbnMpKTtcbiAgICBkZWxldGUgY29weVsnbG5nJ107XG4gICAgZGVsZXRlIGNvcHlbJ2xhdCddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDEnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQyJ107XG5cbiAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICQucGFyYW0oY29weSk7XG5cblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJ0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZVwiLCBjb3B5KTtcbiAgICAkKFwic2VsZWN0I2ZpbHRlci1pdGVtc1wiKS5tdWx0aXNlbGVjdCgnZGVzdHJveScpO1xuICAgIGJ1aWxkRmlsdGVycygpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbG9hZC1ncm91cHMnLCB7IGdyb3Vwczogd2luZG93LkVWRU5UU19EQVRBLmdyb3VwcyB9KTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcblxuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcihcInRyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlXCIsIGNvcHkpO1xuICAgIH0sIDEwMDApO1xuICB9KTtcblxuXG4gIC8qKipcbiAgKiBNYXAgRXZlbnRzXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICAvLyBtYXBNYW5hZ2VyLnNldENlbnRlcihbb3B0aW9ucy5sYXQsIG9wdGlvbnMubG5nXSk7XG4gICAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLmJvdW5kMSB8fCAhb3B0aW9ucy5ib3VuZDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgdmFyIGJvdW5kMiA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDIpO1xuXG4gICAgbWFwTWFuYWdlci5zZXRCb3VuZHMoYm91bmQxLCBib3VuZDIpO1xuICAgIC8vIG1hcE1hbmFnZXIudHJpZ2dlclpvb21FbmQoKTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgbWFwTWFuYWdlci50cmlnZ2VyWm9vbUVuZCgpO1xuICAgIH0sIDEwKTtcblxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCBcIiNjb3B5LWVtYmVkXCIsIChlKSA9PiB7XG4gICAgdmFyIGNvcHlUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbWJlZC10ZXh0XCIpO1xuICAgIGNvcHlUZXh0LnNlbGVjdCgpO1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiQ29weVwiKTtcbiAgfSk7XG5cbiAgLy8gMy4gbWFya2VycyBvbiBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXBsb3QnLCAoZSwgb3B0KSA9PiB7XG5cbiAgICBtYXBNYW5hZ2VyLnBsb3RQb2ludHMob3B0LmRhdGEsIG9wdC5wYXJhbXMsIG9wdC5ncm91cHMpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicpO1xuICB9KVxuXG4gIC8vIGxvYWQgZ3JvdXBzXG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbG9hZC1ncm91cHMnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLmVtcHR5KCk7XG4gICAgb3B0Lmdyb3Vwcy5mb3JFYWNoKChpdGVtKSA9PiB7XG5cbiAgICAgIGxldCBzbHVnZ2VkID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICAgIGxldCB2YWx1ZVRleHQgPSBsYW5ndWFnZU1hbmFnZXIuZ2V0VHJhbnNsYXRpb24oaXRlbS50cmFuc2xhdGlvbik7XG4gICAgICAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykuYXBwZW5kKGBcbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9JyR7c2x1Z2dlZH0nXG4gICAgICAgICAgICAgIHNlbGVjdGVkPSdzZWxlY3RlZCdcbiAgICAgICAgICAgICAgbGFiZWw9XCI8c3BhbiBkYXRhLWxhbmctdGFyZ2V0PSd0ZXh0JyBkYXRhLWxhbmcta2V5PScke2l0ZW0udHJhbnNsYXRpb259Jz4ke3ZhbHVlVGV4dH08L3NwYW4+PGltZyBzcmM9JyR7aXRlbS5pY29udXJsIHx8IHdpbmRvdy5ERUZBVUxUX0lDT059JyAvPlwiPlxuICAgICAgICAgICAgPC9vcHRpb24+YClcbiAgICB9KTtcblxuICAgIC8vIFJlLWluaXRpYWxpemVcbiAgICBxdWVyeU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuICAgIC8vICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5tdWx0aXNlbGVjdCgnZGVzdHJveScpO1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5tdWx0aXNlbGVjdCgncmVidWlsZCcpO1xuXG4gICAgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCk7XG5cblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJyk7XG5cbiAgfSlcblxuICAvLyBGaWx0ZXIgbWFwXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCAoZSwgb3B0KSA9PiB7XG4gICAgaWYgKG9wdCkge1xuICAgICAgbWFwTWFuYWdlci5maWx0ZXJNYXAob3B0LmZpbHRlcik7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sYW5ndWFnZS11cGRhdGUnLCAoZSwgb3B0KSA9PiB7XG5cbiAgICBpZiAob3B0KSB7XG5cbiAgICAgIGxhbmd1YWdlTWFuYWdlci51cGRhdGVMYW5ndWFnZShvcHQubGFuZyk7XG4gICAgfSBlbHNlIHtcblxuICAgICAgbGFuZ3VhZ2VNYW5hZ2VyLnJlZnJlc2goKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxhbmd1YWdlLWxvYWRlZCcsIChlLCBvcHQpID0+IHtcbiAgICAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykubXVsdGlzZWxlY3QoJ3JlYnVpbGQnKTtcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uI3Nob3ctaGlkZS1tYXAnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnYm9keScpLnRvZ2dsZUNsYXNzKCdtYXAtdmlldycpXG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24uYnRuLm1vcmUtaXRlbXMnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnI2VtYmVkLWFyZWEnKS50b2dnbGVDbGFzcygnb3BlbicpO1xuICB9KVxuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIChlLCBvcHQpID0+IHtcbiAgICAvL3VwZGF0ZSBlbWJlZCBsaW5lXG4gICAgdmFyIGNvcHkgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9wdCkpO1xuICAgIGRlbGV0ZSBjb3B5WydsbmcnXTtcbiAgICBkZWxldGUgY29weVsnbGF0J107XG4gICAgZGVsZXRlIGNvcHlbJ2JvdW5kMSddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDInXTtcblxuICAgICQoJyNlbWJlZC1hcmVhIGlucHV0W25hbWU9ZW1iZWRdJykudmFsKCdodHRwczovL25ldy1tYXAuMzUwLm9yZyMnICsgJC5wYXJhbShjb3B5KSk7XG4gIH0pO1xuXG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbiN6b29tLW91dCcsIChlLCBvcHQpID0+IHtcblxuICAgIC8vIG1hcE1hbmFnZXIuem9vbU91dE9uY2UoKTtcbiAgICBtYXBNYW5hZ2VyLnpvb21VbnRpbEhpdCgpO1xuICB9KTtcblxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcjc2hvdy1oaWRlLWxpc3QtY29udGFpbmVyJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ2JvZHknKS50b2dnbGVDbGFzcygnZmlsdGVyLWNvbGxhcHNlZCcpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4geyBtYXBNYW5hZ2VyLnJlZnJlc2hNYXAoKSB9LCA2MDApXG4gIH0pO1xuXG4gICQod2luZG93KS5vbihcInJlc2l6ZVwiLCAoZSkgPT4ge1xuICAgIG1hcE1hbmFnZXIucmVmcmVzaE1hcCgpO1xuICB9KTtcblxuICAvKipcbiAgRmlsdGVyIENoYW5nZXNcbiAgKi9cbiAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIi5zZWFyY2gtYnV0dG9uIGJ1dHRvblwiLCAoZSkgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwic2VhcmNoLmZvcmNlLXNlYXJjaC1sb2NhdGlvblwiKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKFwia2V5dXBcIiwgXCJpbnB1dFtuYW1lPSdsb2MnXVwiLCAoZSkgPT4ge1xuICAgIGlmIChlLmtleUNvZGUgPT0gMTMpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3NlYXJjaC5mb3JjZS1zZWFyY2gtbG9jYXRpb24nKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdzZWFyY2guZm9yY2Utc2VhcmNoLWxvY2F0aW9uJywgKCkgPT4ge1xuICAgIGxldCBfcXVlcnkgPSAkKFwiaW5wdXRbbmFtZT0nbG9jJ11cIikudmFsKCk7XG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlci5mb3JjZVNlYXJjaChfcXVlcnkpO1xuICAgIC8vIFNlYXJjaCBnb29nbGUgYW5kIGdldCB0aGUgZmlyc3QgcmVzdWx0Li4uIGF1dG9jb21wbGV0ZT9cbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKFwiaGFzaGNoYW5nZVwiLCAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgaWYgKGhhc2gubGVuZ3RoID09IDApIHJldHVybjtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKGhhc2guc3Vic3RyaW5nKDEpKTtcbiAgICBjb25zdCBvbGRVUkwgPSBldmVudC5vcmlnaW5hbEV2ZW50Lm9sZFVSTDtcbiAgICBjb25zdCBvbGRIYXNoID0gJC5kZXBhcmFtKG9sZFVSTC5zdWJzdHJpbmcob2xkVVJMLnNlYXJjaChcIiNcIikrMSkpO1xuXG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCBwYXJhbWV0ZXJzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuXG4gICAgLy8gU28gdGhhdCBjaGFuZ2UgaW4gZmlsdGVycyB3aWxsIG5vdCB1cGRhdGUgdGhpc1xuICAgIGlmIChvbGRIYXNoLmJvdW5kMSAhPT0gcGFyYW1ldGVycy5ib3VuZDEgfHwgb2xkSGFzaC5ib3VuZDIgIT09IHBhcmFtZXRlcnMuYm91bmQyKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLWJ5LWJvdW5kJywgcGFyYW1ldGVycyk7XG4gICAgfVxuXG4gICAgaWYgKG9sZEhhc2gubG9nICE9PSBwYXJhbWV0ZXJzLmxvYykge1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgfVxuXG4gICAgLy8gQ2hhbmdlIGl0ZW1zXG4gICAgaWYgKG9sZEhhc2gubGFuZyAhPT0gcGFyYW1ldGVycy5sYW5nKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgIH1cbiAgfSlcblxuICAvLyA0LiBmaWx0ZXIgb3V0IGl0ZW1zIGluIGFjdGl2aXR5LWFyZWFcblxuICAvLyA1LiBnZXQgbWFwIGVsZW1lbnRzXG5cbiAgLy8gNi4gZ2V0IEdyb3VwIGRhdGFcblxuICAvLyA3LiBwcmVzZW50IGdyb3VwIGVsZW1lbnRzXG5cbiAgJC53aGVuKCgpPT57fSlcbiAgICAudGhlbigoKSA9PntcbiAgICAgIHJldHVybiBsYW5ndWFnZU1hbmFnZXIuaW5pdGlhbGl6ZShpbml0UGFyYW1zWydsYW5nJ10gfHwgJ2VuJyk7XG4gICAgfSlcbiAgICAuZG9uZSgoZGF0YSkgPT4ge30pXG4gICAgLnRoZW4oKCkgPT4ge1xuICAgICAgJC5hamF4KHtcbiAgICAgICAgICB1cmw6ICdodHRwczovL25ldy1tYXAuMzUwLm9yZy9vdXRwdXQvMzUwb3JnLXdpdGgtYW5ub3RhdGlvbi5qcy5neicsIC8vJ3wqKkRBVEFfU09VUkNFKip8JyxcbiAgICAgICAgICAvLyB1cmw6ICcvZGF0YS90ZXN0LmpzJywgLy8nfCoqREFUQV9TT1VSQ0UqKnwnLFxuICAgICAgICAgIGRhdGFUeXBlOiAnc2NyaXB0JyxcbiAgICAgICAgICBjYWNoZTogdHJ1ZSxcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgLy8gd2luZG93LkVWRU5UU19EQVRBID0gZGF0YTtcbiAgICAgICAgICAgIC8vSnVuZSAxNCwgMjAxOCDigJMgQ2hhbmdlc1xuICAgICAgICAgICAgaWYod2luZG93LnF1ZXJpZXMuZ3JvdXApIHtcbiAgICAgICAgICAgICAgd2luZG93LkVWRU5UU19EQVRBLmRhdGEgPSB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YS5maWx0ZXIoKGkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaS5jYW1wYWlnbiA9PSB3aW5kb3cucXVlcmllcy5ncm91cFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9Mb2FkIGdyb3Vwc1xuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sb2FkLWdyb3VwcycsIHsgZ3JvdXBzOiB3aW5kb3cuRVZFTlRTX0RBVEEuZ3JvdXBzIH0pO1xuXG5cbiAgICAgICAgICAgIHZhciBwYXJhbWV0ZXJzID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuICAgICAgICAgICAgd2luZG93LkVWRU5UU19EQVRBLmRhdGEuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICBpdGVtWydldmVudF90eXBlJ10gPSAhaXRlbS5ldmVudF90eXBlID8gJ0FjdGlvbicgOiBpdGVtLmV2ZW50X3R5cGU7XG5cbiAgICAgICAgICAgICAgaWYgKGl0ZW0uc3RhcnRfZGF0ZXRpbWUgJiYgIWl0ZW0uc3RhcnRfZGF0ZXRpbWUubWF0Y2goL1okLykpIHtcbiAgICAgICAgICAgICAgICBpdGVtLnN0YXJ0X2RhdGV0aW1lID0gaXRlbS5zdGFydF9kYXRldGltZSArIFwiWlwiO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gd2luZG93LkVWRU5UU19EQVRBLmRhdGEuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgLy8gICByZXR1cm4gbmV3IERhdGUoYS5zdGFydF9kYXRldGltZSkgLSBuZXcgRGF0ZShiLnN0YXJ0X2RhdGV0aW1lKTtcbiAgICAgICAgICAgIC8vIH0pXG5cblxuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LXVwZGF0ZScsIHsgcGFyYW1zOiBwYXJhbWV0ZXJzIH0pO1xuICAgICAgICAgICAgLy8gJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXBsb3QnLCB7XG4gICAgICAgICAgICAgICAgZGF0YTogd2luZG93LkVWRU5UU19EQVRBLmRhdGEsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiBwYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICAgIGdyb3Vwczogd2luZG93LkVWRU5UU19EQVRBLmdyb3Vwcy5yZWR1Y2UoKGRpY3QsIGl0ZW0pPT57IGRpY3RbaXRlbS5zdXBlcmdyb3VwXSA9IGl0ZW07IHJldHVybiBkaWN0OyB9LCB7fSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgLy8gfSk7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgLy9UT0RPOiBNYWtlIHRoZSBnZW9qc29uIGNvbnZlcnNpb24gaGFwcGVuIG9uIHRoZSBiYWNrZW5kXG5cbiAgICAgICAgICAgIC8vUmVmcmVzaCB0aGluZ3NcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICBsZXQgcCA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG5cbiAgICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcCk7XG4gICAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicsIHApO1xuXG4gICAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcCk7XG4gICAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCBwKTtcblxuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cblxuXG59KShqUXVlcnkpO1xuIl19
