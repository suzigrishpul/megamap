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
    $("#show-hide-list-container");
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9oZWxwZXIuanMiLCJjbGFzc2VzL2xhbmd1YWdlLmpzIiwiY2xhc3Nlcy9saXN0LmpzIiwiY2xhc3Nlcy9tYXAuanMiLCJjbGFzc2VzL3F1ZXJ5LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIkF1dG9jb21wbGV0ZU1hbmFnZXIiLCIkIiwidGFyZ2V0IiwiQVBJX0tFWSIsInRhcmdldEl0ZW0iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJxdWVyeU1nciIsIlF1ZXJ5TWFuYWdlciIsImdlb2NvZGVyIiwiZ29vZ2xlIiwibWFwcyIsIkdlb2NvZGVyIiwiJHRhcmdldCIsImZvcmNlU2VhcmNoIiwicSIsImdlb2NvZGUiLCJhZGRyZXNzIiwicmVzdWx0cyIsInN0YXR1cyIsImdlb21ldHJ5IiwidXBkYXRlVmlld3BvcnQiLCJ2aWV3cG9ydCIsInZhbCIsImZvcm1hdHRlZF9hZGRyZXNzIiwiaW5pdGlhbGl6ZSIsInR5cGVhaGVhZCIsImhpbnQiLCJoaWdobGlnaHQiLCJtaW5MZW5ndGgiLCJjbGFzc05hbWVzIiwibWVudSIsIm5hbWUiLCJkaXNwbGF5IiwiaXRlbSIsImxpbWl0Iiwic291cmNlIiwic3luYyIsImFzeW5jIiwib24iLCJvYmoiLCJkYXR1bSIsImpRdWVyeSIsIkhlbHBlciIsInJlZlNvdXJjZSIsInVybCIsInJlZiIsInNyYyIsImluZGV4T2YiLCJMYW5ndWFnZU1hbmFnZXIiLCJsYW5ndWFnZSIsImRpY3Rpb25hcnkiLCIkdGFyZ2V0cyIsInVwZGF0ZVBhZ2VMYW5ndWFnZSIsInRhcmdldExhbmd1YWdlIiwicm93cyIsImZpbHRlciIsImkiLCJsYW5nIiwiZWFjaCIsImluZGV4IiwidGFyZ2V0QXR0cmlidXRlIiwiZGF0YSIsImxhbmdUYXJnZXQiLCJ0ZXh0IiwiYXR0ciIsInRhcmdldHMiLCJhamF4IiwiZGF0YVR5cGUiLCJzdWNjZXNzIiwidHJpZ2dlciIsIm11bHRpc2VsZWN0IiwicmVmcmVzaCIsInVwZGF0ZUxhbmd1YWdlIiwiZ2V0VHJhbnNsYXRpb24iLCJrZXkiLCJMaXN0TWFuYWdlciIsIm9wdGlvbnMiLCJ0YXJnZXRMaXN0IiwicmVmZXJyZXIiLCJyZW5kZXJFdmVudCIsIm0iLCJtb21lbnQiLCJEYXRlIiwic3RhcnRfZGF0ZXRpbWUiLCJ1dGMiLCJzdWJ0cmFjdCIsInV0Y09mZnNldCIsImRhdGUiLCJmb3JtYXQiLCJtYXRjaCIsIndpbmRvdyIsInNsdWdpZnkiLCJldmVudF90eXBlIiwibGF0IiwibG5nIiwidGl0bGUiLCJ2ZW51ZSIsInJlbmRlckdyb3VwIiwid2Vic2l0ZSIsInN1cGVyR3JvdXAiLCJzdXBlcmdyb3VwIiwibG9jYXRpb24iLCJkZXNjcmlwdGlvbiIsIiRsaXN0IiwidXBkYXRlRmlsdGVyIiwicCIsInJlbW92ZVByb3AiLCJhZGRDbGFzcyIsImpvaW4iLCJmaW5kIiwiaGlkZSIsImZvckVhY2giLCJmaWwiLCJzaG93IiwidXBkYXRlQm91bmRzIiwiYm91bmQxIiwiYm91bmQyIiwiaW5kIiwiX2xhdCIsIl9sbmciLCJtaTEwIiwicmVtb3ZlQ2xhc3MiLCJfdmlzaWJsZSIsImxlbmd0aCIsInBvcHVsYXRlTGlzdCIsImhhcmRGaWx0ZXJzIiwia2V5U2V0Iiwic3BsaXQiLCIkZXZlbnRMaXN0IiwiRVZFTlRTX0RBVEEiLCJtYXAiLCJ0b0xvd2VyQ2FzZSIsImluY2x1ZGVzIiwicmVtb3ZlIiwiYXBwZW5kIiwiTWFwTWFuYWdlciIsIkxBTkdVQUdFIiwicmVuZGVyQW5ub3RhdGlvblBvcHVwIiwicmVuZGVyQW5ub3RhdGlvbnNHZW9Kc29uIiwibGlzdCIsInJlbmRlcmVkIiwidHlwZSIsImNvb3JkaW5hdGVzIiwicHJvcGVydGllcyIsImFubm90YXRpb25Qcm9wcyIsInBvcHVwQ29udGVudCIsInJlbmRlckdlb2pzb24iLCJpc05hTiIsInBhcnNlRmxvYXQiLCJzdWJzdHJpbmciLCJldmVudFByb3BlcnRpZXMiLCJhY2Nlc3NUb2tlbiIsIkwiLCJkcmFnZ2luZyIsIkJyb3dzZXIiLCJtb2JpbGUiLCJzZXRWaWV3Iiwic2Nyb2xsV2hlZWxab29tIiwiZGlzYWJsZSIsIm9uTW92ZSIsImV2ZW50Iiwic3ciLCJnZXRCb3VuZHMiLCJfc291dGhXZXN0IiwibmUiLCJfbm9ydGhFYXN0IiwiZ2V0Wm9vbSIsInRpbGVMYXllciIsImF0dHJpYnV0aW9uIiwiYWRkVG8iLCJxdWVyaWVzIiwidGVybWluYXRvciIsIiRtYXAiLCJjYWxsYmFjayIsInNldEJvdW5kcyIsImJvdW5kczEiLCJib3VuZHMyIiwiYm91bmRzIiwiZml0Qm91bmRzIiwiYW5pbWF0ZSIsInNldENlbnRlciIsImNlbnRlciIsInpvb20iLCJnZXRDZW50ZXJCeUxvY2F0aW9uIiwidHJpZ2dlclpvb21FbmQiLCJmaXJlRXZlbnQiLCJ6b29tT3V0T25jZSIsInpvb21PdXQiLCJ6b29tVW50aWxIaXQiLCIkdGhpcyIsImludGVydmFsSGFuZGxlciIsInNldEludGVydmFsIiwiY2xlYXJJbnRlcnZhbCIsInJlZnJlc2hNYXAiLCJpbnZhbGlkYXRlU2l6ZSIsImZpbHRlck1hcCIsImZpbHRlcnMiLCJwbG90UG9pbnRzIiwiZ3JvdXBzIiwiZ2VvanNvbiIsImZlYXR1cmVzIiwiZXZlbnRzTGF5ZXIiLCJnZW9KU09OIiwicG9pbnRUb0xheWVyIiwiZmVhdHVyZSIsImxhdGxuZyIsImV2ZW50VHlwZSIsInNsdWdnZWQiLCJpY29uVXJsIiwiaXNQYXN0IiwiaWNvbnVybCIsInNtYWxsSWNvbiIsImljb24iLCJpY29uU2l6ZSIsImljb25BbmNob3IiLCJjbGFzc05hbWUiLCJnZW9qc29uTWFya2VyT3B0aW9ucyIsIm1hcmtlciIsIm9uRWFjaEZlYXR1cmUiLCJsYXllciIsImJpbmRQb3B1cCIsImFubm90YXRpb24iLCJhbm5vdGF0aW9ucyIsImFubm90SWNvbiIsImNvbnNvbGUiLCJsb2ciLCJhbm5vdE1hcmtlcnMiLCJhbm5vdExheWVyR3JvdXAiLCJhZGRMYXllciIsImZlYXR1cmVHcm91cCIsInVwZGF0ZSIsImxhdExuZyIsInRhcmdldEZvcm0iLCJwcmV2aW91cyIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImZvcm0iLCJkZXBhcmFtIiwic2VyaWFsaXplIiwiaGFzaCIsInBhcmFtIiwicGFyYW1zIiwibG9jIiwicHJvcCIsImdldFBhcmFtZXRlcnMiLCJwYXJhbWV0ZXJzIiwidXBkYXRlTG9jYXRpb24iLCJNYXRoIiwiYWJzIiwiZiIsImIiLCJmQXZnIiwiYkF2ZyIsIkpTT04iLCJzdHJpbmdpZnkiLCJ1cGRhdGVWaWV3cG9ydEJ5Qm91bmQiLCJ0cmlnZ2VyU3VibWl0IiwiYXV0b2NvbXBsZXRlTWFuYWdlciIsIm1hcE1hbmFnZXIiLCJERUZBVUxUX0lDT04iLCJ0b1N0cmluZyIsInJlcGxhY2UiLCJnZXRRdWVyeVN0cmluZyIsInF1ZXJ5U3RyaW5nS2V5VmFsdWUiLCJwYXJlbnQiLCJzZWFyY2giLCJxc0pzb25PYmplY3QiLCJncm91cCIsIndpZHRoIiwiY3NzIiwiYnVpbGRGaWx0ZXJzIiwiZW5hYmxlSFRNTCIsInRlbXBsYXRlcyIsImJ1dHRvbiIsImxpIiwiZHJvcFJpZ2h0Iiwib25Jbml0aWFsaXplZCIsIm9uRHJvcGRvd25TaG93Iiwic2V0VGltZW91dCIsIm9uRHJvcGRvd25IaWRlIiwib3B0aW9uTGFiZWwiLCJ1bmVzY2FwZSIsImh0bWwiLCJvcHRpb25DbGFzcyIsInNlbGVjdGVkQ2xhc3MiLCJidXR0b25DbGFzcyIsIm9uQ2hhbmdlIiwib3B0aW9uIiwiY2hlY2tlZCIsInNlbGVjdCIsInF1ZXJ5TWFuYWdlciIsImluaXRQYXJhbXMiLCJsYW5ndWFnZU1hbmFnZXIiLCJsaXN0TWFuYWdlciIsImluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayIsInJlc3VsdCIsImhlaWdodCIsInBhcnNlIiwiY29weSIsImNvcHlUZXh0IiwiZ2V0RWxlbWVudEJ5SWQiLCJleGVjQ29tbWFuZCIsIm9wdCIsImVtcHR5IiwidmFsdWVUZXh0IiwidHJhbnNsYXRpb24iLCJ0b2dnbGVDbGFzcyIsImtleUNvZGUiLCJfcXVlcnkiLCJvbGRVUkwiLCJvcmlnaW5hbEV2ZW50Iiwib2xkSGFzaCIsIndoZW4iLCJ0aGVuIiwiZG9uZSIsImNhY2hlIiwiY2FtcGFpZ24iLCJyZWR1Y2UiLCJkaWN0Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOztBQUNBLElBQU1BLHNCQUF1QixVQUFTQyxDQUFULEVBQVk7QUFDdkM7O0FBRUEsU0FBTyxVQUFDQyxNQUFELEVBQVk7O0FBRWpCLFFBQU1DLFVBQVUseUNBQWhCO0FBQ0EsUUFBTUMsYUFBYSxPQUFPRixNQUFQLElBQWlCLFFBQWpCLEdBQTRCRyxTQUFTQyxhQUFULENBQXVCSixNQUF2QixDQUE1QixHQUE2REEsTUFBaEY7QUFDQSxRQUFNSyxXQUFXQyxjQUFqQjtBQUNBLFFBQUlDLFdBQVcsSUFBSUMsT0FBT0MsSUFBUCxDQUFZQyxRQUFoQixFQUFmOztBQUVBLFdBQU87QUFDTEMsZUFBU1osRUFBRUcsVUFBRixDQURKO0FBRUxGLGNBQVFFLFVBRkg7QUFHTFUsbUJBQWEscUJBQUNDLENBQUQsRUFBTztBQUNsQk4saUJBQVNPLE9BQVQsQ0FBaUIsRUFBRUMsU0FBU0YsQ0FBWCxFQUFqQixFQUFpQyxVQUFVRyxPQUFWLEVBQW1CQyxNQUFuQixFQUEyQjtBQUMxRCxjQUFJRCxRQUFRLENBQVIsQ0FBSixFQUFnQjtBQUNkLGdCQUFJRSxXQUFXRixRQUFRLENBQVIsRUFBV0UsUUFBMUI7QUFDQWIscUJBQVNjLGNBQVQsQ0FBd0JELFNBQVNFLFFBQWpDO0FBQ0FyQixjQUFFRyxVQUFGLEVBQWNtQixHQUFkLENBQWtCTCxRQUFRLENBQVIsRUFBV00saUJBQTdCO0FBQ0Q7QUFDRDtBQUNBO0FBRUQsU0FURDtBQVVELE9BZEk7QUFlTEMsa0JBQVksc0JBQU07QUFDaEJ4QixVQUFFRyxVQUFGLEVBQWNzQixTQUFkLENBQXdCO0FBQ1pDLGdCQUFNLElBRE07QUFFWkMscUJBQVcsSUFGQztBQUdaQyxxQkFBVyxDQUhDO0FBSVpDLHNCQUFZO0FBQ1ZDLGtCQUFNO0FBREk7QUFKQSxTQUF4QixF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aUMsVUFBQ0MsSUFBRCxFQUFPN1IsSUFBUCxFQUFjO0FBQUU2UixpQkFBSzdSLEtBQUttRSxVQUFWLElBQXdCbkUsSUFBeEIsQ0FBOEIsT0FBTzZSLElBQVA7QUFBYyxXQUE3RixFQUErRixFQUEvRjtBQUg0QixTQUF4QztBQUtOO0FBQ005VCxVQUFFSSxRQUFGLEVBQVlpRSxPQUFaLENBQW9CLHNCQUFwQixFQUE0Q2dMLFVBQTVDO0FBQ0E7O0FBRUE7QUFDQWlDLG1CQUFXLFlBQU07QUFDZixjQUFJN0ssSUFBSXlMLGFBQWE5QyxhQUFiLEVBQVI7O0FBRUFwUCxZQUFFSSxRQUFGLEVBQVlpRSxPQUFaLENBQW9CLG9CQUFwQixFQUEwQ29DLENBQTFDO0FBQ0F6RyxZQUFFSSxRQUFGLEVBQVlpRSxPQUFaLENBQW9CLG9CQUFwQixFQUEwQ29DLENBQTFDOztBQUVBekcsWUFBRUksUUFBRixFQUFZaUUsT0FBWixDQUFvQiw0QkFBcEIsRUFBa0RvQyxDQUFsRDtBQUNBekcsWUFBRUksUUFBRixFQUFZaUUsT0FBWixDQUFvQiw4QkFBcEIsRUFBb0RvQyxDQUFwRDtBQUVELFNBVEQsRUFTRyxHQVRIO0FBVUQ7QUF2REUsS0FBUDtBQXlEQyxHQS9ETDtBQW1FRCxDQWxiRCxFQWtiR2hFLE1BbGJIIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuLy9BUEkgOkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVxuY29uc3QgQXV0b2NvbXBsZXRlTWFuYWdlciA9IChmdW5jdGlvbigkKSB7XG4gIC8vSW5pdGlhbGl6YXRpb24uLi5cblxuICByZXR1cm4gKHRhcmdldCkgPT4ge1xuXG4gICAgY29uc3QgQVBJX0tFWSA9IFwiQUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXCI7XG4gICAgY29uc3QgdGFyZ2V0SXRlbSA9IHR5cGVvZiB0YXJnZXQgPT0gXCJzdHJpbmdcIiA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KSA6IHRhcmdldDtcbiAgICBjb25zdCBxdWVyeU1nciA9IFF1ZXJ5TWFuYWdlcigpO1xuICAgIHZhciBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICR0YXJnZXQ6ICQodGFyZ2V0SXRlbSksXG4gICAgICB0YXJnZXQ6IHRhcmdldEl0ZW0sXG4gICAgICBmb3JjZVNlYXJjaDogKHEpID0+IHtcbiAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IHEgfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuICAgICAgICAgIGlmIChyZXN1bHRzWzBdKSB7XG4gICAgICAgICAgICBsZXQgZ2VvbWV0cnkgPSByZXN1bHRzWzBdLmdlb21ldHJ5O1xuICAgICAgICAgICAgcXVlcnlNZ3IudXBkYXRlVmlld3BvcnQoZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgJCh0YXJnZXRJdGVtKS52YWwocmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHZhciBnZW9tZXRyeSA9IGRhdHVtLmdlb21ldHJ5O1xuICAgICAgICAgIC8vIHF1ZXJ5TWdyLnVwZGF0ZVZpZXdwb3J0KGdlb21ldHJ5LnZpZXdwb3J0KTtcblxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBpbml0aWFsaXplOiAoKSA9PiB7XG4gICAgICAgICQodGFyZ2V0SXRlbSkudHlwZWFoZWFkKHtcbiAgICAgICAgICAgICAgICAgICAgaGludDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBtaW5MZW5ndGg6IDQsXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICBtZW51OiAndHQtZHJvcGRvd24tbWVudSdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3NlYXJjaC1yZXN1bHRzJyxcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogKGl0ZW0pID0+IGl0ZW0uZm9ybWF0dGVkX2FkZHJlc3MsXG4gICAgICAgICAgICAgICAgICAgIGxpbWl0OiAxMCxcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiBmdW5jdGlvbiAocSwgc3luYywgYXN5bmMpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IHEgfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBhc3luYyhyZXN1bHRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKS5vbigndHlwZWFoZWFkOnNlbGVjdGVkJywgZnVuY3Rpb24gKG9iaiwgZGF0dW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoZGF0dW0pXG4gICAgICAgICAgICAgICAgICAgIHtcblxuICAgICAgICAgICAgICAgICAgICAgIHZhciBnZW9tZXRyeSA9IGRhdHVtLmdlb21ldHJ5O1xuICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5TWdyLnVwZGF0ZVZpZXdwb3J0KGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICAgICAgICAgICAvLyAgbWFwLmZpdEJvdW5kcyhnZW9tZXRyeS5ib3VuZHM/IGdlb21ldHJ5LmJvdW5kcyA6IGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuXG5cbiAgICByZXR1cm4ge1xuXG4gICAgfVxuICB9XG5cbn0oalF1ZXJ5KSk7XG4iLCJjb25zdCBIZWxwZXIgPSAoKCQpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVmU291cmNlOiAodXJsLCByZWYsIHNyYykgPT4ge1xuICAgICAgICAvLyBKdW4gMTMgMjAxOCDigJQgRml4IGZvciBzb3VyY2UgYW5kIHJlZmVycmVyXG4gICAgICAgIGlmIChyZWYgfHwgc3JjKSB7XG4gICAgICAgICAgaWYgKHVybC5pbmRleE9mKFwiP1wiKSA+PSAwKSB7XG4gICAgICAgICAgICB1cmwgPSBgJHt1cmx9JnJlZmVycmVyPSR7cmVmfHxcIlwifSZzb3VyY2U9JHtzcmN8fFwiXCJ9YDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXJsID0gYCR7dXJsfT9yZWZlcnJlcj0ke3JlZnx8XCJcIn0mc291cmNlPSR7c3JjfHxcIlwifWA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgIH1cbiAgICB9O1xufSkoalF1ZXJ5KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTGFuZ3VhZ2VNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIC8va2V5VmFsdWVcblxuICAvL3RhcmdldHMgYXJlIHRoZSBtYXBwaW5ncyBmb3IgdGhlIGxhbmd1YWdlXG4gIHJldHVybiAoKSA9PiB7XG4gICAgbGV0IGxhbmd1YWdlO1xuICAgIGxldCBkaWN0aW9uYXJ5ID0ge307XG4gICAgbGV0ICR0YXJnZXRzID0gJChcIltkYXRhLWxhbmctdGFyZ2V0XVtkYXRhLWxhbmcta2V5XVwiKTtcblxuICAgIGNvbnN0IHVwZGF0ZVBhZ2VMYW5ndWFnZSA9ICgpID0+IHtcblxuICAgICAgbGV0IHRhcmdldExhbmd1YWdlID0gZGljdGlvbmFyeS5yb3dzLmZpbHRlcigoaSkgPT4gaS5sYW5nID09PSBsYW5ndWFnZSlbMF07XG5cbiAgICAgICR0YXJnZXRzLmVhY2goKGluZGV4LCBpdGVtKSA9PiB7XG5cbiAgICAgICAgbGV0IHRhcmdldEF0dHJpYnV0ZSA9ICQoaXRlbSkuZGF0YSgnbGFuZy10YXJnZXQnKTtcbiAgICAgICAgbGV0IGxhbmdUYXJnZXQgPSAkKGl0ZW0pLmRhdGEoJ2xhbmcta2V5Jyk7XG5cblxuXG5cbiAgICAgICAgc3dpdGNoKHRhcmdldEF0dHJpYnV0ZSkge1xuICAgICAgICAgIGNhc2UgJ3RleHQnOlxuXG4gICAgICAgICAgICAkKChgW2RhdGEtbGFuZy1rZXk9XCIke2xhbmdUYXJnZXR9XCJdYCkpLnRleHQodGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgaWYgKGxhbmdUYXJnZXQgPT0gXCJtb3JlLXNlYXJjaC1vcHRpb25zXCIpIHtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAndmFsdWUnOlxuICAgICAgICAgICAgJChpdGVtKS52YWwodGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICQoaXRlbSkuYXR0cih0YXJnZXRBdHRyaWJ1dGUsIHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgbGFuZ3VhZ2UsXG4gICAgICB0YXJnZXRzOiAkdGFyZ2V0cyxcbiAgICAgIGRpY3Rpb25hcnksXG4gICAgICBpbml0aWFsaXplOiAobGFuZykgPT4ge1xuXG4gICAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICAgIC8vIHVybDogJ2h0dHBzOi8vZ3N4Mmpzb24uY29tL2FwaT9pZD0xTzNlQnlqTDF2bFlmN1o3YW0tX2h0UlRRaTczUGFmcUlmTkJkTG1YZThTTSZzaGVldD0xJyxcbiAgICAgICAgICB1cmw6ICcvZGF0YS9sYW5nLmpzb24nLFxuICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgc3VjY2VzczogKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGRpY3Rpb25hcnkgPSBkYXRhO1xuICAgICAgICAgICAgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgICAgICAgICAgdXBkYXRlUGFnZUxhbmd1YWdlKCk7XG5cbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtbG9hZGVkJyk7XG5cbiAgICAgICAgICAgICQoXCIjbGFuZ3VhZ2Utb3B0c1wiKS5tdWx0aXNlbGVjdCgnc2VsZWN0JywgbGFuZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICByZWZyZXNoOiAoKSA9PiB7XG4gICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZShsYW5ndWFnZSk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTGFuZ3VhZ2U6IChsYW5nKSA9PiB7XG5cbiAgICAgICAgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UoKTtcbiAgICAgIH0sXG4gICAgICBnZXRUcmFuc2xhdGlvbjogKGtleSkgPT4ge1xuICAgICAgICBsZXQgdGFyZ2V0TGFuZ3VhZ2UgPSBkaWN0aW9uYXJ5LnJvd3MuZmlsdGVyKChpKSA9PiBpLmxhbmcgPT09IGxhbmd1YWdlKVswXTtcbiAgICAgICAgcmV0dXJuIHRhcmdldExhbmd1YWdlW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG59KShqUXVlcnkpO1xuIiwiLyogVGhpcyBsb2FkcyBhbmQgbWFuYWdlcyB0aGUgbGlzdCEgKi9cblxuY29uc3QgTGlzdE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuIChvcHRpb25zKSA9PiB7XG4gICAgbGV0IHRhcmdldExpc3QgPSBvcHRpb25zLnRhcmdldExpc3QgfHwgXCIjZXZlbnRzLWxpc3RcIjtcbiAgICAvLyBKdW5lIDEzIGAxOCDigJMgcmVmZXJyZXIgYW5kIHNvdXJjZVxuICAgIGxldCB7cmVmZXJyZXIsIHNvdXJjZX0gPSBvcHRpb25zO1xuXG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRMaXN0ID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0TGlzdCkgOiB0YXJnZXRMaXN0O1xuXG4gICAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSwgcmVmZXJyZXIgPSBudWxsLCBzb3VyY2UgPSBudWxsKSA9PiB7XG4gICAgICBsZXQgbSA9IG1vbWVudChuZXcgRGF0ZShpdGVtLnN0YXJ0X2RhdGV0aW1lKSk7XG4gICAgICBtID0gbS51dGMoKS5zdWJ0cmFjdChtLnV0Y09mZnNldCgpLCAnbScpO1xuICAgICAgdmFyIGRhdGUgPSBtLmZvcm1hdChcImRkZGQgTU1NIERELCBoOm1tYVwiKTtcbiAgICAgIGxldCB1cmwgPSBpdGVtLnVybC5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLnVybCA6IFwiLy9cIiArIGl0ZW0udXJsO1xuICAgICAgLy8gbGV0IHN1cGVyR3JvdXAgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuICAgICAgdXJsID0gSGVscGVyLnJlZlNvdXJjZSh1cmwsIHJlZmVycmVyLCBzb3VyY2UpO1xuXG4gICAgICByZXR1cm4gYFxuICAgICAgPGxpIGNsYXNzPScke3dpbmRvdy5zbHVnaWZ5KGl0ZW0uZXZlbnRfdHlwZSl9IGV2ZW50cyBldmVudC1vYmonIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnQgdHlwZS1hY3Rpb25cIj5cbiAgICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgICA8bGkgY2xhc3M9J3RhZy0ke2l0ZW0uZXZlbnRfdHlwZX0gdGFnJz4ke2l0ZW0uZXZlbnRfdHlwZX08L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPGgyIGNsYXNzPVwiZXZlbnQtdGl0bGVcIj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZX08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtZGF0ZSBkYXRlXCI+JHtkYXRlfTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1hZGRyZXNzIGFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgICAgPHA+JHtpdGVtLnZlbnVlfTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPlJTVlA8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSwgcmVmZXJyZXIgPSBudWxsLCBzb3VyY2UgPSBudWxsKSA9PiB7XG4gICAgICBsZXQgdXJsID0gaXRlbS53ZWJzaXRlLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0ud2Vic2l0ZSA6IFwiLy9cIiArIGl0ZW0ud2Vic2l0ZTtcbiAgICAgIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcblxuICAgICAgdXJsID0gSGVscGVyLnJlZlNvdXJjZSh1cmwsIHJlZmVycmVyLCBzb3VyY2UpO1xuXG4gICAgICByZXR1cm4gYFxuICAgICAgPGxpIGNsYXNzPScke2l0ZW0uZXZlbnRfdHlwZX0gJHtzdXBlckdyb3VwfSBncm91cC1vYmonIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXAgZ3JvdXAtb2JqXCI+XG4gICAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgICAgPGxpIGNsYXNzPVwidGFnIHRhZy0ke2l0ZW0uc3VwZXJncm91cH1cIj4ke2l0ZW0uc3VwZXJncm91cH08L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPGgyPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLm5hbWV9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWxvY2F0aW9uIGxvY2F0aW9uXCI+JHtpdGVtLmxvY2F0aW9ufTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPkdldCBJbnZvbHZlZDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICAgYFxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgJGxpc3Q6ICR0YXJnZXQsXG4gICAgICB1cGRhdGVGaWx0ZXI6IChwKSA9PiB7XG4gICAgICAgIGlmKCFwKSByZXR1cm47XG5cbiAgICAgICAgLy8gUmVtb3ZlIEZpbHRlcnNcblxuICAgICAgICAkdGFyZ2V0LnJlbW92ZVByb3AoXCJjbGFzc1wiKTtcbiAgICAgICAgJHRhcmdldC5hZGRDbGFzcyhwLmZpbHRlciA/IHAuZmlsdGVyLmpvaW4oXCIgXCIpIDogJycpXG5cbiAgICAgICAgJHRhcmdldC5maW5kKCdsaScpLmhpZGUoKTtcblxuICAgICAgICBpZiAocC5maWx0ZXIpIHtcbiAgICAgICAgICBwLmZpbHRlci5mb3JFYWNoKChmaWwpPT57XG4gICAgICAgICAgICAkdGFyZ2V0LmZpbmQoYGxpLiR7ZmlsfWApLnNob3coKTtcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdXBkYXRlQm91bmRzOiAoYm91bmQxLCBib3VuZDIpID0+IHtcblxuICAgICAgICAvLyBjb25zdCBib3VuZHMgPSBbcC5ib3VuZHMxLCBwLmJvdW5kczJdO1xuXG5cbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCBsaS5ldmVudC1vYmosIHVsIGxpLmdyb3VwLW9iaicpLmVhY2goKGluZCwgaXRlbSk9PiB7XG5cbiAgICAgICAgICBsZXQgX2xhdCA9ICQoaXRlbSkuZGF0YSgnbGF0JyksXG4gICAgICAgICAgICAgIF9sbmcgPSAkKGl0ZW0pLmRhdGEoJ2xuZycpO1xuXG4gICAgICAgICAgY29uc3QgbWkxMCA9IDAuMTQ0OTtcblxuICAgICAgICAgIGlmIChib3VuZDFbMF0gPD0gX2xhdCAmJiBib3VuZDJbMF0gPj0gX2xhdCAmJiBib3VuZDFbMV0gPD0gX2xuZyAmJiBib3VuZDJbMV0gPj0gX2xuZykge1xuXG4gICAgICAgICAgICAkKGl0ZW0pLmFkZENsYXNzKCd3aXRoaW4tYm91bmQnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJChpdGVtKS5yZW1vdmVDbGFzcygnd2l0aGluLWJvdW5kJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgX3Zpc2libGUgPSAkdGFyZ2V0LmZpbmQoJ3VsIGxpLmV2ZW50LW9iai53aXRoaW4tYm91bmQsIHVsIGxpLmdyb3VwLW9iai53aXRoaW4tYm91bmQnKS5sZW5ndGg7XG4gICAgICAgIGlmIChfdmlzaWJsZSA9PSAwKSB7XG4gICAgICAgICAgLy8gVGhlIGxpc3QgaXMgZW1wdHlcbiAgICAgICAgICAkdGFyZ2V0LmFkZENsYXNzKFwiaXMtZW1wdHlcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHRhcmdldC5yZW1vdmVDbGFzcyhcImlzLWVtcHR5XCIpO1xuICAgICAgICB9XG5cbiAgICAgIH0sXG4gICAgICBwb3B1bGF0ZUxpc3Q6IChoYXJkRmlsdGVycykgPT4ge1xuICAgICAgICAvL3VzaW5nIHdpbmRvdy5FVkVOVF9EQVRBXG4gICAgICAgIGNvbnN0IGtleVNldCA9ICFoYXJkRmlsdGVycy5rZXkgPyBbXSA6IGhhcmRGaWx0ZXJzLmtleS5zcGxpdCgnLCcpO1xuXG4gICAgICAgIHZhciAkZXZlbnRMaXN0ID0gd2luZG93LkVWRU5UU19EQVRBLmRhdGEubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgIGlmIChrZXlTZXQubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLmV2ZW50X3R5cGUgJiYgaXRlbS5ldmVudF90eXBlLnRvTG93ZXJDYXNlKCkgPT0gJ2dyb3VwJyA/IHJlbmRlckdyb3VwKGl0ZW0pIDogcmVuZGVyRXZlbnQoaXRlbSwgcmVmZXJyZXIsIHNvdXJjZSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXlTZXQubGVuZ3RoID4gMCAmJiBpdGVtLmV2ZW50X3R5cGUgIT0gJ2dyb3VwJyAmJiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5ldmVudF90eXBlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlbmRlckV2ZW50KGl0ZW0sIHJlZmVycmVyLCBzb3VyY2UpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2V5U2V0Lmxlbmd0aCA+IDAgJiYgaXRlbS5ldmVudF90eXBlID09ICdncm91cCcgJiYga2V5U2V0LmluY2x1ZGVzKGl0ZW0uc3VwZXJncm91cCkpIHtcbiAgICAgICAgICAgIHJldHVybiByZW5kZXJHcm91cChpdGVtLCByZWZlcnJlciwgc291cmNlKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIH0pXG4gICAgICAgICR0YXJnZXQuZmluZCgndWwgbGknKS5yZW1vdmUoKTtcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCcpLmFwcGVuZCgkZXZlbnRMaXN0KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiXG5cbmNvbnN0IE1hcE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgbGV0IExBTkdVQUdFID0gJ2VuJztcblxuICBjb25zdCByZW5kZXJFdmVudCA9IChpdGVtLCByZWZlcnJlciA9IG51bGwsIHNvdXJjZSA9IG51bGwpID0+IHtcblxuICAgIGxldCBtID0gbW9tZW50KG5ldyBEYXRlKGl0ZW0uc3RhcnRfZGF0ZXRpbWUpKTtcbiAgICBtID0gbS51dGMoKS5zdWJ0cmFjdChtLnV0Y09mZnNldCgpLCAnbScpO1xuXG4gICAgdmFyIGRhdGUgPSBtLmZvcm1hdChcImRkZGQgTU1NIERELCBoOm1tYVwiKTtcbiAgICBsZXQgdXJsID0gaXRlbS51cmwubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS51cmwgOiBcIi8vXCIgKyBpdGVtLnVybDtcblxuICAgIHVybCA9IEhlbHBlci5yZWZTb3VyY2UodXJsLCByZWZlcnJlciwgc291cmNlKTtcblxuICAgIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9J3BvcHVwLWl0ZW0gJHtpdGVtLmV2ZW50X3R5cGV9ICR7c3VwZXJHcm91cH0nIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5ldmVudF90eXBlfVwiPiR7aXRlbS5ldmVudF90eXBlIHx8ICdBY3Rpb24nfTwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxoMiBjbGFzcz1cImV2ZW50LXRpdGxlXCI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1kYXRlXCI+JHtkYXRlfTwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtYWRkcmVzcyBhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+UlNWUDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSwgcmVmZXJyZXIgPSBudWxsLCBzb3VyY2UgPSBudWxsKSA9PiB7XG5cbiAgICBsZXQgdXJsID0gaXRlbS53ZWJzaXRlLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0ud2Vic2l0ZSA6IFwiLy9cIiArIGl0ZW0ud2Vic2l0ZTtcblxuICAgIHVybCA9IEhlbHBlci5yZWZTb3VyY2UodXJsLCByZWZlcnJlciwgc291cmNlKTtcblxuICAgIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICByZXR1cm4gYFxuICAgIDxsaT5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwIGdyb3VwLW9iaiAke3N1cGVyR3JvdXB9XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5zdXBlcmdyb3VwfSAke3N1cGVyR3JvdXB9XCI+JHtpdGVtLnN1cGVyZ3JvdXB9PC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWhlYWRlclwiPlxuICAgICAgICAgIDxoMj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS5uYW1lfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1sb2NhdGlvbiBsb2NhdGlvblwiPiR7aXRlbS5sb2NhdGlvbn08L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGVzY3JpcHRpb25cIj5cbiAgICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9saT5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyQW5ub3RhdGlvblBvcHVwID0gKGl0ZW0pID0+IHtcbiAgICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9J3BvcHVwLWl0ZW0gYW5ub3RhdGlvbicgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnRcIj5cbiAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctYW5ub3RhdGlvblwiPkFubm90YXRpb248L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8aDIgY2xhc3M9XCJldmVudC10aXRsZVwiPiR7aXRlbS5uYW1lfTwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1hZGRyZXNzIGFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgYDtcbiAgfVxuXG5cbiAgY29uc3QgcmVuZGVyQW5ub3RhdGlvbnNHZW9Kc29uID0gKGxpc3QpID0+IHtcbiAgICByZXR1cm4gbGlzdC5tYXAoKGl0ZW0pID0+IHtcbiAgICAgIGNvbnN0IHJlbmRlcmVkID0gcmVuZGVyQW5ub3RhdGlvblBvcHVwKGl0ZW0pO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgIHR5cGU6IFwiUG9pbnRcIixcbiAgICAgICAgICBjb29yZGluYXRlczogW2l0ZW0ubG5nLCBpdGVtLmxhdF1cbiAgICAgICAgfSxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIGFubm90YXRpb25Qcm9wczogaXRlbSxcbiAgICAgICAgICBwb3B1cENvbnRlbnQ6IHJlbmRlcmVkXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgY29uc3QgcmVuZGVyR2VvanNvbiA9IChsaXN0LCByZWYgPSBudWxsLCBzcmMgPSBudWxsKSA9PiB7XG4gICAgcmV0dXJuIGxpc3QubWFwKChpdGVtKSA9PiB7XG4gICAgICAvLyByZW5kZXJlZCBldmVudFR5cGVcbiAgICAgIGxldCByZW5kZXJlZDtcblxuICAgICAgaWYgKGl0ZW0uZXZlbnRfdHlwZSAmJiBpdGVtLmV2ZW50X3R5cGUudG9Mb3dlckNhc2UoKSA9PSAnZ3JvdXAnKSB7XG4gICAgICAgIHJlbmRlcmVkID0gcmVuZGVyR3JvdXAoaXRlbSwgcmVmLCBzcmMpO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZW5kZXJlZCA9IHJlbmRlckV2ZW50KGl0ZW0sIHJlZiwgc3JjKTtcbiAgICAgIH1cblxuICAgICAgLy8gZm9ybWF0IGNoZWNrXG4gICAgICBpZiAoaXNOYU4ocGFyc2VGbG9hdChwYXJzZUZsb2F0KGl0ZW0ubG5nKSkpKSB7XG4gICAgICAgIGl0ZW0ubG5nID0gaXRlbS5sbmcuc3Vic3RyaW5nKDEpXG4gICAgICB9XG4gICAgICBpZiAoaXNOYU4ocGFyc2VGbG9hdChwYXJzZUZsb2F0KGl0ZW0ubGF0KSkpKSB7XG4gICAgICAgIGl0ZW0ubGF0ID0gaXRlbS5sYXQuc3Vic3RyaW5nKDEpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICB0eXBlOiBcIlBvaW50XCIsXG4gICAgICAgICAgY29vcmRpbmF0ZXM6IFtpdGVtLmxuZywgaXRlbS5sYXRdXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBldmVudFByb3BlcnRpZXM6IGl0ZW0sXG4gICAgICAgICAgcG9wdXBDb250ZW50OiByZW5kZXJlZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAob3B0aW9ucykgPT4ge1xuICAgIHZhciBhY2Nlc3NUb2tlbiA9ICdway5leUoxSWpvaWJXRjBkR2hsZHpNMU1DSXNJbUVpT2lKYVRWRk1Va1V3SW4wLndjTTNYYzhCR0M2UE0tT3lyd2puaGcnO1xuICAgIHZhciBtYXAgPSBMLm1hcCgnbWFwLXByb3BlcicsIHsgZHJhZ2dpbmc6ICFMLkJyb3dzZXIubW9iaWxlIH0pLnNldFZpZXcoWzM0Ljg4NTkzMDk0MDc1MzE3LCA1LjA5NzY1NjI1MDAwMDAwMV0sIDIpO1xuXG4gICAgbGV0IHtyZWZlcnJlciwgc291cmNlfSA9IG9wdGlvbnM7XG5cbiAgICBpZiAoIUwuQnJvd3Nlci5tb2JpbGUpIHtcbiAgICAgIG1hcC5zY3JvbGxXaGVlbFpvb20uZGlzYWJsZSgpO1xuICAgIH1cblxuICAgIExBTkdVQUdFID0gb3B0aW9ucy5sYW5nIHx8ICdlbic7XG5cbiAgICBpZiAob3B0aW9ucy5vbk1vdmUpIHtcbiAgICAgIG1hcC5vbignZHJhZ2VuZCcsIChldmVudCkgPT4ge1xuXG5cbiAgICAgICAgbGV0IHN3ID0gW21hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW21hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubG5nXTtcbiAgICAgICAgb3B0aW9ucy5vbk1vdmUoc3csIG5lKTtcbiAgICAgIH0pLm9uKCd6b29tZW5kJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChtYXAuZ2V0Wm9vbSgpIDw9IDQpIHtcbiAgICAgICAgICAkKFwiI21hcFwiKS5hZGRDbGFzcyhcInpvb21lZC1vdXRcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJChcIiNtYXBcIikucmVtb3ZlQ2xhc3MoXCJ6b29tZWQtb3V0XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHN3ID0gW21hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW21hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubG5nXTtcbiAgICAgICAgb3B0aW9ucy5vbk1vdmUoc3csIG5lKTtcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gbWFwLmZpcmVFdmVudCgnem9vbWVuZCcpO1xuXG4gICAgTC50aWxlTGF5ZXIoJ2h0dHBzOi8vYXBpLm1hcGJveC5jb20vc3R5bGVzL3YxL21hdHRoZXczNTAvY2phNDF0aWprMjdkNjJycW9kN2cwbHg0Yi90aWxlcy8yNTYve3p9L3t4fS97eX0/YWNjZXNzX3Rva2VuPScgKyBhY2Nlc3NUb2tlbiwge1xuICAgICAgICBhdHRyaWJ1dGlvbjogJyZjb3B5OyA8YSBocmVmPVwiaHR0cDovL29zbS5vcmcvY29weXJpZ2h0XCI+T3BlblN0cmVldE1hcDwvYT4gY29udHJpYnV0b3JzIOKAoiA8YSBocmVmPVwiLy8zNTAub3JnXCI+MzUwLm9yZzwvYT4nXG4gICAgfSkuYWRkVG8obWFwKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKHdpbmRvdy5xdWVyaWVzWyd0d2lsaWdodC16b25lJ10sIHdpbmRvdy5xdWVyaWVzWyd0d2lsaWdodC16b25lJ10gPT09IFwidHJ1ZVwiKTtcbiAgICBpZih3aW5kb3cucXVlcmllc1sndHdpbGlnaHQtem9uZSddKSB7XG4gICAgICBMLnRlcm1pbmF0b3IoKS5hZGRUbyhtYXApXG4gICAgfVxuXG4gICAgbGV0IGdlb2NvZGVyID0gbnVsbDtcbiAgICByZXR1cm4ge1xuICAgICAgJG1hcDogbWFwLFxuICAgICAgaW5pdGlhbGl6ZTogKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG4gICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBzZXRCb3VuZHM6IChib3VuZHMxLCBib3VuZHMyKSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW2JvdW5kczEsIGJvdW5kczJdO1xuICAgICAgICBtYXAuZml0Qm91bmRzKGJvdW5kcywgeyBhbmltYXRlOiBmYWxzZX0pO1xuICAgICAgfSxcbiAgICAgIHNldENlbnRlcjogKGNlbnRlciwgem9vbSA9IDEwKSA9PiB7XG4gICAgICAgIGlmICghY2VudGVyIHx8ICFjZW50ZXJbMF0gfHwgY2VudGVyWzBdID09IFwiXCJcbiAgICAgICAgICAgICAgfHwgIWNlbnRlclsxXSB8fCBjZW50ZXJbMV0gPT0gXCJcIikgcmV0dXJuO1xuICAgICAgICBtYXAuc2V0VmlldyhjZW50ZXIsIHpvb20pO1xuICAgICAgfSxcbiAgICAgIGdldEJvdW5kczogKCkgPT4ge1xuXG4gICAgICAgIGxldCBzdyA9IFttYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxuZ107XG4gICAgICAgIGxldCBuZSA9IFttYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxuZ107XG5cbiAgICAgICAgcmV0dXJuIFtzdywgbmVdO1xuICAgICAgfSxcbiAgICAgIC8vIENlbnRlciBsb2NhdGlvbiBieSBnZW9jb2RlZFxuICAgICAgZ2V0Q2VudGVyQnlMb2NhdGlvbjogKGxvY2F0aW9uLCBjYWxsYmFjaykgPT4ge1xuXG4gICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBsb2NhdGlvbiB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG5cbiAgICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXN1bHRzWzBdKVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgdHJpZ2dlclpvb21FbmQ6ICgpID0+IHtcbiAgICAgICAgbWFwLmZpcmVFdmVudCgnem9vbWVuZCcpO1xuICAgICAgfSxcbiAgICAgIHpvb21PdXRPbmNlOiAoKSA9PiB7XG4gICAgICAgIG1hcC56b29tT3V0KDEpO1xuICAgICAgfSxcbiAgICAgIHpvb21VbnRpbEhpdDogKCkgPT4ge1xuICAgICAgICB2YXIgJHRoaXMgPSB0aGlzO1xuICAgICAgICBtYXAuem9vbU91dCgxKTtcbiAgICAgICAgbGV0IGludGVydmFsSGFuZGxlciA9IG51bGw7XG4gICAgICAgIGludGVydmFsSGFuZGxlciA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICB2YXIgX3Zpc2libGUgPSAkKGRvY3VtZW50KS5maW5kKCd1bCBsaS5ldmVudC1vYmoud2l0aGluLWJvdW5kLCB1bCBsaS5ncm91cC1vYmoud2l0aGluLWJvdW5kJykubGVuZ3RoO1xuICAgICAgICAgIGlmIChfdmlzaWJsZSA9PSAwKSB7XG4gICAgICAgICAgICBtYXAuem9vbU91dCgxKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbEhhbmRsZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgMjAwKTtcbiAgICAgIH0sXG4gICAgICByZWZyZXNoTWFwOiAoKSA9PiB7XG4gICAgICAgIG1hcC5pbnZhbGlkYXRlU2l6ZShmYWxzZSk7XG4gICAgICAgIC8vIG1hcC5fb25SZXNpemUoKTtcbiAgICAgICAgLy8gbWFwLmZpcmVFdmVudCgnem9vbWVuZCcpO1xuXG5cbiAgICAgIH0sXG4gICAgICBmaWx0ZXJNYXA6IChmaWx0ZXJzKSA9PiB7XG5cbiAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwXCIpLmhpZGUoKTtcblxuXG4gICAgICAgIGlmICghZmlsdGVycykgcmV0dXJuO1xuXG4gICAgICAgIGZpbHRlcnMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuXG4gICAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwLlwiICsgaXRlbS50b0xvd2VyQ2FzZSgpKS5zaG93KCk7XG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgcGxvdFBvaW50czogKGxpc3QsIGhhcmRGaWx0ZXJzLCBncm91cHMpID0+IHtcbiAgICAgICAgY29uc3Qga2V5U2V0ID0gIWhhcmRGaWx0ZXJzLmtleSA/IFtdIDogaGFyZEZpbHRlcnMua2V5LnNwbGl0KCcsJyk7XG5cbiAgICAgICAgaWYgKGtleVNldC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgbGlzdCA9IGxpc3QuZmlsdGVyKChpdGVtKSA9PiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5ldmVudF90eXBlKSlcbiAgICAgICAgfVxuXG5cbiAgICAgICAgY29uc3QgZ2VvanNvbiA9IHtcbiAgICAgICAgICB0eXBlOiBcIkZlYXR1cmVDb2xsZWN0aW9uXCIsXG4gICAgICAgICAgZmVhdHVyZXM6IHJlbmRlckdlb2pzb24obGlzdCwgcmVmZXJyZXIsIHNvdXJjZSlcbiAgICAgICAgfTtcblxuXG4gICAgICAgIGNvbnN0IGV2ZW50c0xheWVyID0gTC5nZW9KU09OKGdlb2pzb24sIHtcbiAgICAgICAgICAgIHBvaW50VG9MYXllcjogKGZlYXR1cmUsIGxhdGxuZykgPT4ge1xuICAgICAgICAgICAgICAvLyBJY29ucyBmb3IgbWFya2Vyc1xuICAgICAgICAgICAgICBjb25zdCBldmVudFR5cGUgPSBmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLmV2ZW50X3R5cGU7XG5cbiAgICAgICAgICAgICAgLy8gSWYgbm8gc3VwZXJncm91cCwgaXQncyBhbiBldmVudC5cbiAgICAgICAgICAgICAgY29uc3Qgc3VwZXJncm91cCA9IGdyb3Vwc1tmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLnN1cGVyZ3JvdXBdID8gZmVhdHVyZS5wcm9wZXJ0aWVzLmV2ZW50UHJvcGVydGllcy5zdXBlcmdyb3VwIDogXCJFdmVudHNcIjtcbiAgICAgICAgICAgICAgY29uc3Qgc2x1Z2dlZCA9IHdpbmRvdy5zbHVnaWZ5KHN1cGVyZ3JvdXApO1xuXG5cblxuICAgICAgICAgICAgICBsZXQgaWNvblVybDtcbiAgICAgICAgICAgICAgY29uc3QgaXNQYXN0ID0gbmV3IERhdGUoZmVhdHVyZS5wcm9wZXJ0aWVzLmV2ZW50UHJvcGVydGllcy5zdGFydF9kYXRldGltZSkgPCBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgICBpZiAoZXZlbnRUeXBlID09IFwiQWN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBpY29uVXJsID0gaXNQYXN0ID8gXCIvaW1nL3Bhc3QtZXZlbnQucG5nXCIgOiBcIi9pbWcvZXZlbnQucG5nXCI7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWNvblVybCA9IGdyb3Vwc1tzdXBlcmdyb3VwXSA/IGdyb3Vwc1tzdXBlcmdyb3VwXS5pY29udXJsIHx8IFwiL2ltZy9ldmVudC5wbmdcIiAgOiBcIi9pbWcvZXZlbnQucG5nXCIgO1xuICAgICAgICAgICAgICB9XG5cblxuXG4gICAgICAgICAgICAgIGNvbnN0IHNtYWxsSWNvbiA9ICBMLmljb24oe1xuICAgICAgICAgICAgICAgIGljb25Vcmw6IGljb25VcmwsXG4gICAgICAgICAgICAgICAgaWNvblNpemU6IFsxOCwgMThdLFxuICAgICAgICAgICAgICAgIGljb25BbmNob3I6IFs5LCA5XSxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IHNsdWdnZWQgKyAnIGV2ZW50LWl0ZW0tcG9wdXAgJyArIChpc1Bhc3QmJmV2ZW50VHlwZSA9PSBcIkFjdGlvblwiP1wiZXZlbnQtcGFzdC1ldmVudFwiOlwiXCIpXG4gICAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgICAgdmFyIGdlb2pzb25NYXJrZXJPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIGljb246IHNtYWxsSWNvbixcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgcmV0dXJuIEwubWFya2VyKGxhdGxuZywgZ2VvanNvbk1hcmtlck9wdGlvbnMpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgIG9uRWFjaEZlYXR1cmU6IChmZWF0dXJlLCBsYXllcikgPT4ge1xuICAgICAgICAgICAgaWYgKGZlYXR1cmUucHJvcGVydGllcyAmJiBmZWF0dXJlLnByb3BlcnRpZXMucG9wdXBDb250ZW50KSB7XG4gICAgICAgICAgICAgIGxheWVyLmJpbmRQb3B1cChmZWF0dXJlLnByb3BlcnRpZXMucG9wdXBDb250ZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY29uc3QgaXNQYXN0ID0gbmV3IERhdGUoZmVhdHVyZS5wcm9wZXJ0aWVzLmV2ZW50UHJvcGVydGllcy5zdGFydF9kYXRldGltZSkgPCBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgLy8gY29uc3QgZXZlbnRUeXBlID0gZmVhdHVyZS5wcm9wZXJ0aWVzLmV2ZW50UHJvcGVydGllcy5ldmVudF90eXBlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgZXZlbnRzTGF5ZXIuYWRkVG8obWFwKTtcbiAgICAgICAgLy8gZXZlbnRzTGF5ZXIuYnJpbmdUb0JhY2soKTtcblxuXG4gICAgICAgIC8vIEFkZCBBbm5vdGF0aW9uc1xuICAgICAgICBpZiAod2luZG93LnF1ZXJpZXMuYW5ub3RhdGlvbikge1xuICAgICAgICAgIGNvbnN0IGFubm90YXRpb25zID0gIXdpbmRvdy5FVkVOVFNfREFUQS5hbm5vdGF0aW9ucyA/IFtdIDogd2luZG93LkVWRU5UU19EQVRBLmFubm90YXRpb25zLmZpbHRlcigoaXRlbSk9Pml0ZW0udHlwZT09PXdpbmRvdy5xdWVyaWVzLmFubm90YXRpb24pO1xuXG4gICAgICAgICAgY29uc3QgYW5ub3RJY29uID0gIEwuaWNvbih7XG4gICAgICAgICAgICBpY29uVXJsOiBcIi9pbWcvYW5ub3RhdGlvbi5wbmdcIixcbiAgICAgICAgICAgIGljb25TaXplOiBbMjIsIDIyXSxcbiAgICAgICAgICAgIGljb25BbmNob3I6IFsxMSwgMTRdLFxuICAgICAgICAgICAgY2xhc3NOYW1lOiAnYW5ub3RhdGlvbi1wb3B1cCdcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhyZW5kZXJBbm5vdGF0aW9uUG9wdXApO1xuICAgICAgICAgIGNvbnN0IGFubm90TWFya2VycyA9IGFubm90YXRpb25zLm1hcChpdGVtID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIEwubWFya2VyKFtpdGVtLmxhdCwgaXRlbS5sbmddLCB7aWNvbjogYW5ub3RJY29ufSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5iaW5kUG9wdXAocmVuZGVyQW5ub3RhdGlvblBvcHVwKGl0ZW0pKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gYW5ub3RMYXllci5icmluZ1RvRnJvbnQoKTtcblxuICAgICAgICAgIGNvbnNvbGUubG9nKGFubm90TWFya2Vycyk7XG5cbiAgICAgICAgICAvLyBjb25zdCBhbm5vdExheWVyR3JvdXAgPSA7XG5cbiAgICAgICAgICBjb25zdCBhbm5vdExheWVyR3JvdXAgPSBtYXAuYWRkTGF5ZXIoTC5mZWF0dXJlR3JvdXAoYW5ub3RNYXJrZXJzKSk7XG4gICAgICAgICAgY29uc29sZS5sb2coYW5ub3RMYXllckdyb3VwKTtcbiAgICAgICAgICAvLyBhbm5vdExheWVyR3JvdXAuYnJpbmdUb0Zyb250KCk7XG4gICAgICAgICAgLy8gYW5ub3RNYXJrZXJzLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgLy8gICBpdGVtLmFkZFRvKG1hcCk7XG4gICAgICAgICAgLy8gICBpdGVtLmJyaW5nVG9Gcm9udCgpO1xuICAgICAgICAgIC8vIH0pXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB1cGRhdGU6IChwKSA9PiB7XG4gICAgICAgIGlmICghcCB8fCAhcC5sYXQgfHwgIXAubG5nICkgcmV0dXJuO1xuXG4gICAgICAgIG1hcC5zZXRWaWV3KEwubGF0TG5nKHAubGF0LCBwLmxuZyksIDEwKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiY29uc3QgUXVlcnlNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIHJldHVybiAodGFyZ2V0Rm9ybSA9IFwiZm9ybSNmaWx0ZXJzLWZvcm1cIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0Rm9ybSA9PT0gJ3N0cmluZycgPyAkKHRhcmdldEZvcm0pIDogdGFyZ2V0Rm9ybTtcbiAgICBsZXQgbGF0ID0gbnVsbDtcbiAgICBsZXQgbG5nID0gbnVsbDtcblxuICAgIGxldCBwcmV2aW91cyA9IHt9O1xuXG4gICAgJHRhcmdldC5vbignc3VibWl0JywgKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGxhdCA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwoKTtcbiAgICAgIGxuZyA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwoKTtcblxuICAgICAgdmFyIGZvcm0gPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG5cbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJC5wYXJhbShmb3JtKTtcbiAgICB9KVxuXG4gICAgJChkb2N1bWVudCkub24oJ2NoYW5nZScsICdzZWxlY3QjZmlsdGVyLWl0ZW1zJywgKCkgPT4ge1xuICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICB9KVxuXG5cbiAgICByZXR1cm4ge1xuICAgICAgaW5pdGlhbGl6ZTogKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdmFyIHBhcmFtcyA9ICQuZGVwYXJhbSh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkpXG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYW5nXVwiKS52YWwocGFyYW1zLmxhbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwocGFyYW1zLmxhdCk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChwYXJhbXMubG5nKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKHBhcmFtcy5ib3VuZDEpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwocGFyYW1zLmJvdW5kMik7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sb2NdXCIpLnZhbChwYXJhbXMubG9jKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWtleV1cIikudmFsKHBhcmFtcy5rZXkpO1xuXG4gICAgICAgICAgaWYgKHBhcmFtcy5maWx0ZXIpIHtcbiAgICAgICAgICAgICR0YXJnZXQuZmluZChcIiNmaWx0ZXItaXRlbXMgb3B0aW9uXCIpLnJlbW92ZVByb3AoXCJzZWxlY3RlZFwiKTtcbiAgICAgICAgICAgIHBhcmFtcy5maWx0ZXIuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiI2ZpbHRlci1pdGVtcyBvcHRpb25bdmFsdWU9J1wiICsgaXRlbSArIFwiJ11cIikucHJvcChcInNlbGVjdGVkXCIsIHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBnZXRQYXJhbWV0ZXJzOiAoKSA9PiB7XG4gICAgICAgIHZhciBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuICAgICAgICAvLyBwYXJhbWV0ZXJzWydsb2NhdGlvbiddIDtcblxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBwYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgaWYgKCAhcGFyYW1ldGVyc1trZXldIHx8IHBhcmFtZXRlcnNba2V5XSA9PSBcIlwiKSB7XG4gICAgICAgICAgICBkZWxldGUgcGFyYW1ldGVyc1trZXldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJhbWV0ZXJzO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZUxvY2F0aW9uOiAobGF0LCBsbmcpID0+IHtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChsYXQpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKGxuZyk7XG4gICAgICAgIC8vICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlVmlld3BvcnQ6ICh2aWV3cG9ydCkgPT4ge1xuXG4gICAgICAgIC8vIEF2ZXJhZ2UgaXQgaWYgbGVzcyB0aGFuIDEwbWkgcmFkaXVzXG4gICAgICAgIGlmIChNYXRoLmFicyh2aWV3cG9ydC5mLmIgLSB2aWV3cG9ydC5mLmYpIDwgLjE1IHx8IE1hdGguYWJzKHZpZXdwb3J0LmIuYiAtIHZpZXdwb3J0LmIuZikgPCAuMTUpIHtcbiAgICAgICAgICBsZXQgZkF2ZyA9ICh2aWV3cG9ydC5mLmIgKyB2aWV3cG9ydC5mLmYpIC8gMjtcbiAgICAgICAgICBsZXQgYkF2ZyA9ICh2aWV3cG9ydC5iLmIgKyB2aWV3cG9ydC5iLmYpIC8gMjtcbiAgICAgICAgICB2aWV3cG9ydC5mID0geyBiOiBmQXZnIC0gLjA4LCBmOiBmQXZnICsgLjA4IH07XG4gICAgICAgICAgdmlld3BvcnQuYiA9IHsgYjogYkF2ZyAtIC4wOCwgZjogYkF2ZyArIC4wOCB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtbdmlld3BvcnQuZi5iLCB2aWV3cG9ydC5iLmJdLCBbdmlld3BvcnQuZi5mLCB2aWV3cG9ydC5iLmZdXTtcblxuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1swXSkpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1sxXSkpO1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZVZpZXdwb3J0QnlCb3VuZDogKHN3LCBuZSkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtzdywgbmVdOy8vLy8vLy8vXG5cblxuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1swXSkpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1sxXSkpO1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHRyaWdnZXJTdWJtaXQ6ICgpID0+IHtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJsZXQgYXV0b2NvbXBsZXRlTWFuYWdlcjtcbmxldCBtYXBNYW5hZ2VyO1xuXG53aW5kb3cuREVGQVVMVF9JQ09OID0gXCIvaW1nL2V2ZW50LnBuZ1wiO1xud2luZG93LnNsdWdpZnkgPSAodGV4dCkgPT4gIXRleHQgPyB0ZXh0IDogdGV4dC50b1N0cmluZygpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxzKy9nLCAnLScpICAgICAgICAgICAvLyBSZXBsYWNlIHNwYWNlcyB3aXRoIC1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvW15cXHdcXC1dKy9nLCAnJykgICAgICAgLy8gUmVtb3ZlIGFsbCBub24td29yZCBjaGFyc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXC1cXC0rL2csICctJykgICAgICAgICAvLyBSZXBsYWNlIG11bHRpcGxlIC0gd2l0aCBzaW5nbGUgLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9eLSsvLCAnJykgICAgICAgICAgICAgLy8gVHJpbSAtIGZyb20gc3RhcnQgb2YgdGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8tKyQvLCAnJyk7ICAgICAgICAgICAgLy8gVHJpbSAtIGZyb20gZW5kIG9mIHRleHRcblxuY29uc3QgZ2V0UXVlcnlTdHJpbmcgPSAoKSA9PiB7XG4gICAgdmFyIHF1ZXJ5U3RyaW5nS2V5VmFsdWUgPSB3aW5kb3cucGFyZW50LmxvY2F0aW9uLnNlYXJjaC5yZXBsYWNlKCc/JywgJycpLnNwbGl0KCcmJyk7XG4gICAgdmFyIHFzSnNvbk9iamVjdCA9IHt9O1xuICAgIGlmIChxdWVyeVN0cmluZ0tleVZhbHVlICE9ICcnKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcXVlcnlTdHJpbmdLZXlWYWx1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcXNKc29uT2JqZWN0W3F1ZXJ5U3RyaW5nS2V5VmFsdWVbaV0uc3BsaXQoJz0nKVswXV0gPSBxdWVyeVN0cmluZ0tleVZhbHVlW2ldLnNwbGl0KCc9JylbMV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHFzSnNvbk9iamVjdDtcbn07XG5cbihmdW5jdGlvbigkKSB7XG4gIC8vIExvYWQgdGhpbmdzXG5cbiAgd2luZG93LnF1ZXJpZXMgPSAgJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyaW5nKDEpKTtcbiAgdHJ5IHtcbiAgICBpZiAoKCF3aW5kb3cucXVlcmllcy5ncm91cCB8fCAoIXdpbmRvdy5xdWVyaWVzLnJlZmVycmVyICYmICF3aW5kb3cucXVlcmllcy5zb3VyY2UpKSAmJiB3aW5kb3cucGFyZW50KSB7XG4gICAgICB3aW5kb3cucXVlcmllcyA9IHtcbiAgICAgICAgZ3JvdXA6IGdldFF1ZXJ5U3RyaW5nKCkuZ3JvdXAsXG4gICAgICAgIHJlZmVycmVyOiBnZXRRdWVyeVN0cmluZygpLnJlZmVycmVyLFxuICAgICAgICBzb3VyY2U6IGdldFF1ZXJ5U3RyaW5nKCkuc291cmNlLFxuICAgICAgICBcInR3aWxpZ2h0LXpvbmVcIjogd2luZG93LnF1ZXJpZXNbJ3R3aWxpZ2h0LXpvbmUnXSxcbiAgICAgICAgXCJhbm5vdGF0aW9uXCI6IHdpbmRvdy5xdWVyaWVzWydhbm5vdGF0aW9uJ10sXG4gICAgICAgIFwiZnVsbC1tYXBcIjogd2luZG93LnF1ZXJpZXNbJ2Z1bGwtbWFwJ11cbiAgICAgIH07XG4gICAgfVxuICB9IGNhdGNoKGUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiwgZSk7XG4gIH1cblxuICBpZiAod2luZG93LnF1ZXJpZXNbJ2Z1bGwtbWFwJ10pIHtcbiAgICBpZiAoJCh3aW5kb3cpLndpZHRoKCkgPCA2MDApIHtcbiAgICAgIC8vICQoXCIjZXZlbnRzLWxpc3QtY29udGFpbmVyXCIpLmhpZGUoKTtcbiAgICAgICQoXCJib2R5XCIpLmFkZENsYXNzKFwibWFwLXZpZXdcIik7XG4gICAgICAvLyAkKFwiLmZpbHRlci1hcmVhXCIpLmhpZGUoKTtcbiAgICAgIC8vICQoXCJzZWN0aW9uI21hcFwiKS5jc3MoXCJoZWlnaHRcIiwgXCJjYWxjKDEwMCUgLSA2NHB4KVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJChcImJvZHlcIikuYWRkQ2xhc3MoXCJmaWx0ZXItY29sbGFwc2VkXCIpO1xuICAgICAgLy8gJChcIiNldmVudHMtbGlzdC1jb250YWluZXJcIikuaGlkZSgpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAkKFwiI3Nob3ctaGlkZS1saXN0LWNvbnRhaW5lclwiKVxuICB9XG5cblxuICBpZiAod2luZG93LnF1ZXJpZXMuZ3JvdXApIHtcbiAgICAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykucGFyZW50KCkuY3NzKFwib3BhY2l0eVwiLCBcIjBcIik7XG4gIH1cbiAgY29uc3QgYnVpbGRGaWx0ZXJzID0gKCkgPT4geyQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5tdWx0aXNlbGVjdCh7XG4gICAgICBlbmFibGVIVE1MOiB0cnVlLFxuICAgICAgdGVtcGxhdGVzOiB7XG4gICAgICAgIGJ1dHRvbjogJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwibXVsdGlzZWxlY3QgZHJvcGRvd24tdG9nZ2xlXCIgZGF0YS10b2dnbGU9XCJkcm9wZG93blwiPjxzcGFuIGRhdGEtbGFuZy10YXJnZXQ9XCJ0ZXh0XCIgZGF0YS1sYW5nLWtleT1cIm1vcmUtc2VhcmNoLW9wdGlvbnNcIj48L3NwYW4+IDxzcGFuIGNsYXNzPVwiZmEgZmEtY2FyZXQtZG93blwiPjwvc3Bhbj48L2J1dHRvbj4nLFxuICAgICAgICBsaTogJzxsaT48YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPjxsYWJlbD48L2xhYmVsPjwvYT48L2xpPidcbiAgICAgIH0sXG4gICAgICBkcm9wUmlnaHQ6IHRydWUsXG4gICAgICBvbkluaXRpYWxpemVkOiAoKSA9PiB7XG5cbiAgICAgIH0sXG4gICAgICBvbkRyb3Bkb3duU2hvdzogKCkgPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwibW9iaWxlLXVwZGF0ZS1tYXAtaGVpZ2h0XCIpO1xuICAgICAgICB9LCAxMCk7XG5cbiAgICAgIH0sXG4gICAgICBvbkRyb3Bkb3duSGlkZTogKCkgPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwibW9iaWxlLXVwZGF0ZS1tYXAtaGVpZ2h0XCIpO1xuICAgICAgICB9LCAxMCk7XG4gICAgICB9LFxuICAgICAgb3B0aW9uTGFiZWw6IChlKSA9PiB7XG4gICAgICAgIC8vIGxldCBlbCA9ICQoICc8ZGl2PjwvZGl2PicgKTtcbiAgICAgICAgLy8gZWwuYXBwZW5kKCgpICsgXCJcIik7XG5cbiAgICAgICAgcmV0dXJuIHVuZXNjYXBlKCQoZSkuYXR0cignbGFiZWwnKSkgfHwgJChlKS5odG1sKCk7XG4gICAgICB9LFxuICAgIH0pO1xuICB9O1xuICBidWlsZEZpbHRlcnMoKTtcblxuXG4gICQoJ3NlbGVjdCNsYW5ndWFnZS1vcHRzJykubXVsdGlzZWxlY3Qoe1xuICAgIGVuYWJsZUhUTUw6IHRydWUsXG4gICAgb3B0aW9uQ2xhc3M6ICgpID0+ICdsYW5nLW9wdCcsXG4gICAgc2VsZWN0ZWRDbGFzczogKCkgPT4gJ2xhbmctc2VsJyxcbiAgICBidXR0b25DbGFzczogKCkgPT4gJ2xhbmctYnV0JyxcbiAgICBkcm9wUmlnaHQ6IHRydWUsXG4gICAgb3B0aW9uTGFiZWw6IChlKSA9PiB7XG4gICAgICAvLyBsZXQgZWwgPSAkKCAnPGRpdj48L2Rpdj4nICk7XG4gICAgICAvLyBlbC5hcHBlbmQoKCkgKyBcIlwiKTtcblxuICAgICAgcmV0dXJuIHVuZXNjYXBlKCQoZSkuYXR0cignbGFiZWwnKSkgfHwgJChlKS5odG1sKCk7XG4gICAgfSxcbiAgICBvbkNoYW5nZTogKG9wdGlvbiwgY2hlY2tlZCwgc2VsZWN0KSA9PiB7XG5cbiAgICAgIGNvbnN0IHBhcmFtZXRlcnMgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuICAgICAgcGFyYW1ldGVyc1snbGFuZyddID0gb3B0aW9uLnZhbCgpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItcmVzZXQtbWFwJywgcGFyYW1ldGVycyk7XG5cbiAgICB9XG4gIH0pXG5cbiAgLy8gMS4gZ29vZ2xlIG1hcHMgZ2VvY29kZVxuXG4gIC8vIDIuIGZvY3VzIG1hcCBvbiBnZW9jb2RlICh2aWEgbGF0L2xuZylcbiAgY29uc3QgcXVlcnlNYW5hZ2VyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgICAgIHF1ZXJ5TWFuYWdlci5pbml0aWFsaXplKCk7XG5cbiAgY29uc3QgaW5pdFBhcmFtcyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG5cblxuXG4gIGNvbnN0IGxhbmd1YWdlTWFuYWdlciA9IExhbmd1YWdlTWFuYWdlcigpO1xuXG4gIGNvbnN0IGxpc3RNYW5hZ2VyID0gTGlzdE1hbmFnZXIoe1xuICAgIHJlZmVycmVyOiB3aW5kb3cucXVlcmllcy5yZWZlcnJlcixcbiAgICBzb3VyY2U6IHdpbmRvdy5xdWVyaWVzLnNvdXJjZVxuICB9KTtcblxuXG4gIG1hcE1hbmFnZXIgPSBNYXBNYW5hZ2VyKHtcbiAgICBvbk1vdmU6IChzdywgbmUpID0+IHtcbiAgICAgIC8vIFdoZW4gdGhlIG1hcCBtb3ZlcyBhcm91bmQsIHdlIHVwZGF0ZSB0aGUgbGlzdFxuICAgICAgcXVlcnlNYW5hZ2VyLnVwZGF0ZVZpZXdwb3J0QnlCb3VuZChzdywgbmUpO1xuICAgICAgLy91cGRhdGUgUXVlcnlcbiAgICB9LFxuICAgIHJlZmVycmVyOiB3aW5kb3cucXVlcmllcy5yZWZlcnJlcixcbiAgICBzb3VyY2U6IHdpbmRvdy5xdWVyaWVzLnNvdXJjZVxuICB9KTtcblxuICB3aW5kb3cuaW5pdGlhbGl6ZUF1dG9jb21wbGV0ZUNhbGxiYWNrID0gKCkgPT4ge1xuXG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlciA9IEF1dG9jb21wbGV0ZU1hbmFnZXIoXCJpbnB1dFtuYW1lPSdsb2MnXVwiKTtcbiAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICAgIGlmIChpbml0UGFyYW1zLmxvYyAmJiBpbml0UGFyYW1zLmxvYyAhPT0gJycgJiYgKCFpbml0UGFyYW1zLmJvdW5kMSAmJiAhaW5pdFBhcmFtcy5ib3VuZDIpKSB7XG4gICAgICBtYXBNYW5hZ2VyLmluaXRpYWxpemUoKCkgPT4ge1xuICAgICAgICBtYXBNYW5hZ2VyLmdldENlbnRlckJ5TG9jYXRpb24oaW5pdFBhcmFtcy5sb2MsIChyZXN1bHQpID0+IHtcbiAgICAgICAgICBxdWVyeU1hbmFnZXIudXBkYXRlVmlld3BvcnQocmVzdWx0Lmdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGlmKGluaXRQYXJhbXMubGF0ICYmIGluaXRQYXJhbXMubG5nKSB7XG4gICAgbWFwTWFuYWdlci5zZXRDZW50ZXIoW2luaXRQYXJhbXMubGF0LCBpbml0UGFyYW1zLmxuZ10pO1xuICB9XG5cbiAgLyoqKlxuICAqIExpc3QgRXZlbnRzXG4gICogVGhpcyB3aWxsIHRyaWdnZXIgdGhlIGxpc3QgdXBkYXRlIG1ldGhvZFxuICAqL1xuICAkKGRvY3VtZW50KS5vbignbW9iaWxlLXVwZGF0ZS1tYXAtaGVpZ2h0JywgKGV2ZW50KSA9PiB7XG4gICAgLy9UaGlzIGNoZWNrcyBpZiB3aWR0aCBpcyBmb3IgbW9iaWxlXG4gICAgaWYgKCQod2luZG93KS53aWR0aCgpIDwgNjAwKSB7XG4gICAgICBzZXRUaW1lb3V0KCgpPT4ge1xuICAgICAgICAkKFwiI21hcFwiKS5oZWlnaHQoJChcIiNldmVudHMtbGlzdFwiKS5oZWlnaHQoKSk7XG4gICAgICAgIG1hcE1hbmFnZXIucmVmcmVzaE1hcCgpO1xuICAgICAgfSwgMTApO1xuICAgIH1cbiAgfSlcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICBsaXN0TWFuYWdlci5wb3B1bGF0ZUxpc3Qob3B0aW9ucy5wYXJhbXMpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcblxuICAgIGxpc3RNYW5hZ2VyLnVwZGF0ZUZpbHRlcihvcHRpb25zKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICBsZXQgYm91bmQxLCBib3VuZDI7XG5cbiAgICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMuYm91bmQxIHx8ICFvcHRpb25zLmJvdW5kMikge1xuICAgICAgW2JvdW5kMSwgYm91bmQyXSA9IG1hcE1hbmFnZXIuZ2V0Qm91bmRzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJvdW5kMSA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDEpO1xuICAgICAgYm91bmQyID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMik7XG4gICAgfVxuXG4gICAgbGlzdE1hbmFnZXIudXBkYXRlQm91bmRzKGJvdW5kMSwgYm91bmQyKVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1yZXNldC1tYXAnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICB2YXIgY29weSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3B0aW9ucykpO1xuICAgIGRlbGV0ZSBjb3B5WydsbmcnXTtcbiAgICBkZWxldGUgY29weVsnbGF0J107XG4gICAgZGVsZXRlIGNvcHlbJ2JvdW5kMSddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDInXTtcblxuICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJC5wYXJhbShjb3B5KTtcblxuXG4gICAgJChkb2N1bWVudCkudHJpZ2dlcihcInRyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlXCIsIGNvcHkpO1xuICAgICQoXCJzZWxlY3QjZmlsdGVyLWl0ZW1zXCIpLm11bHRpc2VsZWN0KCdkZXN0cm95Jyk7XG4gICAgYnVpbGRGaWx0ZXJzKCk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sb2FkLWdyb3VwcycsIHsgZ3JvdXBzOiB3aW5kb3cuRVZFTlRTX0RBVEEuZ3JvdXBzIH0pO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwidHJpZ2dlci1sYW5ndWFnZS11cGRhdGVcIiwgY29weSk7XG4gICAgfSwgMTAwMCk7XG4gIH0pO1xuXG5cbiAgLyoqKlxuICAqIE1hcCBFdmVudHNcbiAgKi9cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIC8vIG1hcE1hbmFnZXIuc2V0Q2VudGVyKFtvcHRpb25zLmxhdCwgb3B0aW9ucy5sbmddKTtcbiAgICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMuYm91bmQxIHx8ICFvcHRpb25zLmJvdW5kMikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBib3VuZDEgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQxKTtcbiAgICB2YXIgYm91bmQyID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMik7XG5cbiAgICBtYXBNYW5hZ2VyLnNldEJvdW5kcyhib3VuZDEsIGJvdW5kMik7XG4gICAgLy8gbWFwTWFuYWdlci50cmlnZ2VyWm9vbUVuZCgpO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBtYXBNYW5hZ2VyLnRyaWdnZXJab29tRW5kKCk7XG4gICAgfSwgMTApO1xuXG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsIFwiI2NvcHktZW1iZWRcIiwgKGUpID0+IHtcbiAgICB2YXIgY29weVRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVtYmVkLXRleHRcIik7XG4gICAgY29weVRleHQuc2VsZWN0KCk7XG4gICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJDb3B5XCIpO1xuICB9KTtcblxuICAvLyAzLiBtYXJrZXJzIG9uIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtcGxvdCcsIChlLCBvcHQpID0+IHtcblxuICAgIG1hcE1hbmFnZXIucGxvdFBvaW50cyhvcHQuZGF0YSwgb3B0LnBhcmFtcywgb3B0Lmdyb3Vwcyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJyk7XG4gIH0pXG5cbiAgLy8gbG9hZCBncm91cHNcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sb2FkLWdyb3VwcycsIChlLCBvcHQpID0+IHtcbiAgICAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykuZW1wdHkoKTtcbiAgICBvcHQuZ3JvdXBzLmZvckVhY2goKGl0ZW0pID0+IHtcblxuICAgICAgbGV0IHNsdWdnZWQgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuICAgICAgbGV0IHZhbHVlVGV4dCA9IGxhbmd1YWdlTWFuYWdlci5nZXRUcmFuc2xhdGlvbihpdGVtLnRyYW5zbGF0aW9uKTtcbiAgICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5hcHBlbmQoYFxuICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0nJHtzbHVnZ2VkfSdcbiAgICAgICAgICAgICAgc2VsZWN0ZWQ9J3NlbGVjdGVkJ1xuICAgICAgICAgICAgICBsYWJlbD1cIjxzcGFuIGRhdGEtbGFuZy10YXJnZXQ9J3RleHQnIGRhdGEtbGFuZy1rZXk9JyR7aXRlbS50cmFuc2xhdGlvbn0nPiR7dmFsdWVUZXh0fTwvc3Bhbj48aW1nIHNyYz0nJHtpdGVtLmljb251cmwgfHwgd2luZG93LkRFRkFVTFRfSUNPTn0nIC8+XCI+XG4gICAgICAgICAgICA8L29wdGlvbj5gKVxuICAgIH0pO1xuXG4gICAgLy8gUmUtaW5pdGlhbGl6ZVxuICAgIHF1ZXJ5TWFuYWdlci5pbml0aWFsaXplKCk7XG4gICAgLy8gJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KCdkZXN0cm95Jyk7XG4gICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KCdyZWJ1aWxkJyk7XG5cbiAgICBtYXBNYW5hZ2VyLnJlZnJlc2hNYXAoKTtcblxuXG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sYW5ndWFnZS11cGRhdGUnKTtcblxuICB9KVxuXG4gIC8vIEZpbHRlciBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLWZpbHRlcicsIChlLCBvcHQpID0+IHtcbiAgICBpZiAob3B0KSB7XG4gICAgICBtYXBNYW5hZ2VyLmZpbHRlck1hcChvcHQuZmlsdGVyKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZScsIChlLCBvcHQpID0+IHtcblxuICAgIGlmIChvcHQpIHtcblxuICAgICAgbGFuZ3VhZ2VNYW5hZ2VyLnVwZGF0ZUxhbmd1YWdlKG9wdC5sYW5nKTtcbiAgICB9IGVsc2Uge1xuXG4gICAgICBsYW5ndWFnZU1hbmFnZXIucmVmcmVzaCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGFuZ3VhZ2UtbG9hZGVkJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5tdWx0aXNlbGVjdCgncmVidWlsZCcpO1xuICB9KVxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24jc2hvdy1oaWRlLW1hcCcsIChlLCBvcHQpID0+IHtcbiAgICAkKCdib2R5JykudG9nZ2xlQ2xhc3MoJ21hcC12aWV3JylcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbi5idG4ubW9yZS1pdGVtcycsIChlLCBvcHQpID0+IHtcbiAgICAkKCcjZW1iZWQtYXJlYScpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgKGUsIG9wdCkgPT4ge1xuICAgIC8vdXBkYXRlIGVtYmVkIGxpbmVcbiAgICB2YXIgY29weSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3B0KSk7XG4gICAgZGVsZXRlIGNvcHlbJ2xuZyddO1xuICAgIGRlbGV0ZSBjb3B5WydsYXQnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQxJ107XG4gICAgZGVsZXRlIGNvcHlbJ2JvdW5kMiddO1xuXG4gICAgJCgnI2VtYmVkLWFyZWEgaW5wdXRbbmFtZT1lbWJlZF0nKS52YWwoJ2h0dHBzOi8vbmV3LW1hcC4zNTAub3JnIycgKyAkLnBhcmFtKGNvcHkpKTtcbiAgfSk7XG5cblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uI3pvb20tb3V0JywgKGUsIG9wdCkgPT4ge1xuXG4gICAgLy8gbWFwTWFuYWdlci56b29tT3V0T25jZSgpO1xuICAgIG1hcE1hbmFnZXIuem9vbVVudGlsSGl0KCk7XG4gIH0pO1xuXG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJyNzaG93LWhpZGUtbGlzdC1jb250YWluZXInLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnYm9keScpLnRvZ2dsZUNsYXNzKCdmaWx0ZXItY29sbGFwc2VkJyk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7IG1hcE1hbmFnZXIucmVmcmVzaE1hcCgpIH0sIDYwMClcbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIChlKSA9PiB7XG4gICAgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCk7XG4gIH0pO1xuXG4gIC8qKlxuICBGaWx0ZXIgQ2hhbmdlc1xuICAqL1xuICAkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiLnNlYXJjaC1idXR0b24gYnV0dG9uXCIsIChlKSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJzZWFyY2guZm9yY2Utc2VhcmNoLWxvY2F0aW9uXCIpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oXCJrZXl1cFwiLCBcImlucHV0W25hbWU9J2xvYyddXCIsIChlKSA9PiB7XG4gICAgaWYgKGUua2V5Q29kZSA9PSAxMykge1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcignc2VhcmNoLmZvcmNlLXNlYXJjaC1sb2NhdGlvbicpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3NlYXJjaC5mb3JjZS1zZWFyY2gtbG9jYXRpb24nLCAoKSA9PiB7XG4gICAgbGV0IF9xdWVyeSA9ICQoXCJpbnB1dFtuYW1lPSdsb2MnXVwiKS52YWwoKTtcbiAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmZvcmNlU2VhcmNoKF9xdWVyeSk7XG4gICAgLy8gU2VhcmNoIGdvb2dsZSBhbmQgZ2V0IHRoZSBmaXJzdCByZXN1bHQuLi4gYXV0b2NvbXBsZXRlP1xuICB9KTtcblxuICAkKHdpbmRvdykub24oXCJoYXNoY2hhbmdlXCIsIChldmVudCkgPT4ge1xuICAgIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICBpZiAoaGFzaC5sZW5ndGggPT0gMCkgcmV0dXJuO1xuICAgIGNvbnN0IHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oaGFzaC5zdWJzdHJpbmcoMSkpO1xuICAgIGNvbnN0IG9sZFVSTCA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQub2xkVVJMO1xuICAgIGNvbnN0IG9sZEhhc2ggPSAkLmRlcGFyYW0ob2xkVVJMLnN1YnN0cmluZyhvbGRVUkwuc2VhcmNoKFwiI1wiKSsxKSk7XG5cbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicsIHBhcmFtZXRlcnMpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgcGFyYW1ldGVycyk7XG5cbiAgICAvLyBTbyB0aGF0IGNoYW5nZSBpbiBmaWx0ZXJzIHdpbGwgbm90IHVwZGF0ZSB0aGlzXG4gICAgaWYgKG9sZEhhc2guYm91bmQxICE9PSBwYXJhbWV0ZXJzLmJvdW5kMSB8fCBvbGRIYXNoLmJvdW5kMiAhPT0gcGFyYW1ldGVycy5ib3VuZDIpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG5cbiAgICBpZiAob2xkSGFzaC5sb2cgIT09IHBhcmFtZXRlcnMubG9jKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG5cbiAgICAvLyBDaGFuZ2UgaXRlbXNcbiAgICBpZiAob2xkSGFzaC5sYW5nICE9PSBwYXJhbWV0ZXJzLmxhbmcpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgfVxuICB9KVxuXG4gIC8vIDQuIGZpbHRlciBvdXQgaXRlbXMgaW4gYWN0aXZpdHktYXJlYVxuXG4gIC8vIDUuIGdldCBtYXAgZWxlbWVudHNcblxuICAvLyA2LiBnZXQgR3JvdXAgZGF0YVxuXG4gIC8vIDcuIHByZXNlbnQgZ3JvdXAgZWxlbWVudHNcblxuICAkLndoZW4oKCk9Pnt9KVxuICAgIC50aGVuKCgpID0+e1xuICAgICAgcmV0dXJuIGxhbmd1YWdlTWFuYWdlci5pbml0aWFsaXplKGluaXRQYXJhbXNbJ2xhbmcnXSB8fCAnZW4nKTtcbiAgICB9KVxuICAgIC5kb25lKChkYXRhKSA9PiB7fSlcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICAkLmFqYXgoe1xuICAgICAgICAgIHVybDogJ2h0dHBzOi8vbmV3LW1hcC4zNTAub3JnL291dHB1dC8zNTBvcmctd2l0aC1hbm5vdGF0aW9uLmpzLmd6JywgLy8nfCoqREFUQV9TT1VSQ0UqKnwnLFxuICAgICAgICAgIC8vIHVybDogJy9kYXRhL3Rlc3QuanMnLCAvLyd8KipEQVRBX1NPVVJDRSoqfCcsXG4gICAgICAgICAgZGF0YVR5cGU6ICdzY3JpcHQnLFxuICAgICAgICAgIGNhY2hlOiB0cnVlLFxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICAvLyB3aW5kb3cuRVZFTlRTX0RBVEEgPSBkYXRhO1xuICAgICAgICAgICAgLy9KdW5lIDE0LCAyMDE4IOKAkyBDaGFuZ2VzXG4gICAgICAgICAgICBpZih3aW5kb3cucXVlcmllcy5ncm91cCkge1xuICAgICAgICAgICAgICB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YSA9IHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhLmZpbHRlcigoaSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBpLmNhbXBhaWduID09IHdpbmRvdy5xdWVyaWVzLmdyb3VwXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL0xvYWQgZ3JvdXBzXG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxvYWQtZ3JvdXBzJywgeyBncm91cHM6IHdpbmRvdy5FVkVOVFNfREFUQS5ncm91cHMgfSk7XG5cblxuICAgICAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuXG4gICAgICAgICAgICB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgIGl0ZW1bJ2V2ZW50X3R5cGUnXSA9ICFpdGVtLmV2ZW50X3R5cGUgPyAnQWN0aW9uJyA6IGl0ZW0uZXZlbnRfdHlwZTtcblxuICAgICAgICAgICAgICBpZiAoaXRlbS5zdGFydF9kYXRldGltZSAmJiAhaXRlbS5zdGFydF9kYXRldGltZS5tYXRjaCgvWiQvKSkge1xuICAgICAgICAgICAgICAgIGl0ZW0uc3RhcnRfZGF0ZXRpbWUgPSBpdGVtLnN0YXJ0X2RhdGV0aW1lICsgXCJaXCI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICAvLyAgIHJldHVybiBuZXcgRGF0ZShhLnN0YXJ0X2RhdGV0aW1lKSAtIG5ldyBEYXRlKGIuc3RhcnRfZGF0ZXRpbWUpO1xuICAgICAgICAgICAgLy8gfSlcblxuXG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtdXBkYXRlJywgeyBwYXJhbXM6IHBhcmFtZXRlcnMgfSk7XG4gICAgICAgICAgICAvLyAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtcGxvdCcsIHtcbiAgICAgICAgICAgICAgICBkYXRhOiB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YSxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHBhcmFtZXRlcnMsXG4gICAgICAgICAgICAgICAgZ3JvdXBzOiB3aW5kb3cuRVZFTlRTX0RBVEEuZ3JvdXBzLnJlZHVjZSgoZGljdCwgaXRlbSk9PnsgZGljdFtpdGVtLnN1cGVyZ3JvdXBdID0gaXRlbTsgcmV0dXJuIGRpY3Q7IH0sIHt9KVxuICAgICAgICAgICAgfSk7XG4gICAgICAvLyB9KTtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgcGFyYW1ldGVycyk7XG4gICAgICAgICAgICAvL1RPRE86IE1ha2UgdGhlIGdlb2pzb24gY29udmVyc2lvbiBoYXBwZW4gb24gdGhlIGJhY2tlbmRcblxuICAgICAgICAgICAgLy9SZWZyZXNoIHRoaW5nc1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgIGxldCBwID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuICAgICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwKTtcbiAgICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJywgcCk7XG5cbiAgICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwKTtcbiAgICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci1ieS1ib3VuZCcsIHApO1xuXG4gICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuXG5cbn0pKGpRdWVyeSk7XG4iXX0=
