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
      if (ref && src) {
        if (url.indexOf("?") >= 0) {
          url = url + "&referrer=" + ref + "&source=" + src;
        } else {
          url = url + "?referrer=" + ref + "&source=" + src;
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
"use strict";

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

      console.log(referrer, source, "~~~~");
      var date = moment(item.start_datetime).format("dddd MMM DD, h:mma");
      var url = item.url.match(/^https{0,1}:/) ? item.url : "//" + item.url;
      // let superGroup = window.slugify(item.supergroup);
      url = Helper.refSource(url, referrer, source);

      return "\n      <li class='" + window.slugify(item.event_type) + " events event-obj' data-lat='" + item.lat + "' data-lng='" + item.lng + "'>\n        <div class=\"type-event type-action\">\n          <ul class=\"event-types-list\">\n            <li class='tag-" + item.event_type + " tag'>" + item.event_type + "</li>\n          </ul>\n          <h2 class=\"event-title\"><a href=\"" + url + "\" target='_blank'>" + item.title + "</a></h2>\n          <div class=\"event-date date\">" + date + "</div>\n          <div class=\"event-address address-area\">\n            <p>" + item.venue + "</p>\n          </div>\n          <div class=\"call-to-action\">\n            <a href=\"" + url + "\" target='_blank' class=\"btn btn-secondary\">RSVP</a>\n          </div>\n        </div>\n      </li>\n      ";
    };

    var renderGroup = function renderGroup(item) {
      var referrer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      var url = item.website.match(/^https{0,1}:/) ? item.website : "//" + item.website;
      var superGroup = window.slugify(item.supergroup);

      url = Helper.refSource(url, referrer, source);

      return "\n      <li class='" + item.event_type + " " + superGroup + " group-obj' data-lat='" + item.lat + "' data-lng='" + item.lng + "'>\n        <div class=\"type-group group-obj\">\n          <ul class=\"event-types-list\">\n            <li class=\"tag tag-" + item.supergroup + "\">" + item.supergroup + "</li>\n          </ul>\n          <h2><a href=\"" + url + "\" target='_blank'>" + item.name + "</a></h2>\n          <div class=\"group-details-area\">\n            <div class=\"group-location location\">" + item.location + "</div>\n            <div class=\"group-description\">\n              <p>" + item.description + "</p>\n            </div>\n          </div>\n          <div class=\"call-to-action\">\n            <a href=\"" + url + "\" target='_blank' class=\"btn btn-secondary\">Get Involved</a>\n          </div>\n        </div>\n      </li>\n      ";
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
            $target.find("li." + fil).show();
          });
        }
      },
      updateBounds: function updateBounds(bound1, bound2) {

        // const bounds = [p.bounds1, p.bounds2];


        $target.find('ul li.event-obj, ul li.group-obj').each(function (ind, item) {

          var _lat = $(item).data('lat'),
              _lng = $(item).data('lng');

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
"use strict";

var MapManager = function ($) {
  var LANGUAGE = 'en';

  var renderEvent = function renderEvent(item) {
    var referrer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    var date = moment(item.start_datetime).format("dddd MMM DD, h:mma");
    var url = item.url.match(/^https{0,1}:/) ? item.url : "//" + item.url;

    url = Helper.refSource(url, referrer, source);

    var superGroup = window.slugify(item.supergroup);
    return "\n    <div class='popup-item " + item.event_type + " " + superGroup + "' data-lat='" + item.lat + "' data-lng='" + item.lng + "'>\n      <div class=\"type-event\">\n        <ul class=\"event-types-list\">\n          <li class=\"tag tag-" + item.event_type + "\">" + (item.event_type || 'Action') + "</li>\n        </ul>\n        <h2 class=\"event-title\"><a href=\"" + url + "\" target='_blank'>" + item.title + "</a></h2>\n        <div class=\"event-date\">" + date + "</div>\n        <div class=\"event-address address-area\">\n          <p>" + item.venue + "</p>\n        </div>\n        <div class=\"call-to-action\">\n          <a href=\"" + url + "\" target='_blank' class=\"btn btn-secondary\">RSVP</a>\n        </div>\n      </div>\n    </div>\n    ";
  };

  var renderGroup = function renderGroup(item) {
    var referrer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;


    var url = item.website.match(/^https{0,1}:/) ? item.website : "//" + item.website;

    url = Helper.refSource(url, referrer, source);

    var superGroup = window.slugify(item.supergroup);
    return "\n    <li>\n      <div class=\"type-group group-obj " + superGroup + "\">\n        <ul class=\"event-types-list\">\n          <li class=\"tag tag-" + item.supergroup + " " + superGroup + "\">" + item.supergroup + "</li>\n        </ul>\n        <div class=\"group-header\">\n          <h2><a href=\"" + url + "\" target='_blank'>" + item.name + "</a></h2>\n          <div class=\"group-location location\">" + item.location + "</div>\n        </div>\n        <div class=\"group-details-area\">\n          <div class=\"group-description\">\n            <p>" + item.description + "</p>\n          </div>\n        </div>\n        <div class=\"call-to-action\">\n          <a href=\"" + url + "\" target='_blank' class=\"btn btn-secondary\">Get Involved</a>\n        </div>\n      </div>\n    </li>\n    ";
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
        map.fitBounds(bounds);
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

        L.geoJSON(geojson, {
          pointToLayer: function pointToLayer(feature, latlng) {
            // Icons for markers
            var eventType = feature.properties.eventProperties.event_type;

            // If no supergroup, it's an event.
            var supergroup = groups[feature.properties.eventProperties.supergroup] ? feature.properties.eventProperties.supergroup : "Events";
            var slugged = window.slugify(supergroup);
            var iconUrl = groups[supergroup] ? groups[supergroup].iconurl || "/img/event.png" : "/img/event.png";

            var smallIcon = L.icon({
              iconUrl: iconUrl,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
              className: slugged + ' event-item-popup'
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
        }).addTo(map);
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
  return text.toString().toLowerCase().replace(/\s+/g, '-') // Replace spaces with -
  .replace(/[^\w\-]+/g, '') // Remove all non-word chars
  .replace(/\-\-+/g, '-') // Replace multiple - with single -
  .replace(/^-+/, '') // Trim - from start of text
  .replace(/-+$/, '');
}; // Trim - from end of text
(function ($) {
  // Load things

  window.queries = $.deparam(window.location.search.substring(1));

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

        //Load groups
        $(document).trigger('trigger-load-groups', { groups: window.EVENTS_DATA.groups });

        var parameters = queryManager.getParameters();

        window.EVENTS_DATA.data.forEach(function (item) {
          item['event_type'] = !item.event_type ? 'Action' : item.event_type;
        });
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9oZWxwZXIuanMiLCJjbGFzc2VzL2xhbmd1YWdlLmpzIiwiY2xhc3Nlcy9saXN0LmpzIiwiY2xhc3Nlcy9tYXAuanMiLCJjbGFzc2VzL3F1ZXJ5LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIkF1dG9jb21wbGV0ZU1hbmFnZXIiLCIkIiwidGFyZ2V0IiwiQVBJX0tFWSIsInRhcmdldEl0ZW0iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJxdWVyeU1nciIsIlF1ZXJ5TWFuYWdlciIsImdlb2NvZGVyIiwiZ29vZ2xlIiwibWFwcyIsIkdlb2NvZGVyIiwiJHRhcmdldCIsImZvcmNlU2VhcmNoIiwicSIsImdlb2NvZGUiLCJhZGRyZXNzIiwicmVzdWx0cyIsInN0YXR1cyIsImdlb21ldHJ5IiwidXBkYXRlVmlld3BvcnQiLCJ2aWV3cG9ydCIsInZhbCIsImZvcm1hdHRlZF9hZGRyZXNzIiwiaW5pdGlhbGl6ZSIsInR5cGVhaGVhZCIsImhpbnQiLCJoaWdobGlnaHQiLCJtaW5MZW5ndGgiLCJjbGFzc05hbWVzIiwibWVudSIsIm5hbWUiLCJkaXNwbGF5IiwiaXRlbSIsImxpbWl0Iiwic291cmNlIiwic3luYyIsImFzeW5jIiwib24iLCJvYmoiLCJkYXR1bSIsImpRdWVyeSIsIkhlbHBlciIsInJlZlNvdXJjZSIsInVybCIsInJlZiIsInNyYyIsImluZGV4T2YiLCJMYW5ndWFnZU1hbmFnZXIiLCJsYW5ndWFnZSIsImRpY3Rpb25hcnkiLCIkdGFyZ2V0cyIsInVwZGF0ZVBhZ2VMYW5ndWFnZSIsInRhcmdldExhbmd1YWdlIiwicm93cyIsImZpbHRlciIsImkiLCJsYW5nIiwiZWFjaCIsImluZGV4IiwidGFyZ2V0QXR0cmlidXRlIiwiZGF0YSIsImxhbmdUYXJnZXQiLCJ0ZXh0IiwiYXR0ciIsInRhcmdldHMiLCJhamF4IiwiZGF0YVR5cGUiLCJzdWNjZXNzIiwidHJpZ2dlciIsIm11bHRpc2VsZWN0IiwicmVmcmVzaCIsInVwZGF0ZUxhbmd1YWdlIiwiZ2V0VHJhbnNsYXRpb24iLCJrZXkiLCJMaXN0TWFuYWdlciIsIm9wdGlvbnMiLCJ0YXJnZXRMaXN0IiwicmVmZXJyZXIiLCJyZW5kZXJFdmVudCIsImNvbnNvbGUiLCJsb2ciLCJkYXRlIiwibW9tZW50Iiwic3RhcnRfZGF0ZXRpbWUiLCJmb3JtYXQiLCJtYXRjaCIsIndpbmRvdyIsInNsdWdpZnkiLCJldmVudF90eXBlIiwibGF0IiwibG5nIiwidGl0bGUiLCJ2ZW51ZSIsInJlbmRlckdyb3VwIiwid2Vic2l0ZSIsInN1cGVyR3JvdXAiLCJzdXBlcmdyb3VwIiwibG9jYXRpb24iLCJkZXNjcmlwdGlvbiIsIiRsaXN0IiwidXBkYXRlRmlsdGVyIiwicCIsInJlbW92ZVByb3AiLCJhZGRDbGFzcyIsImpvaW4iLCJmaW5kIiwiaGlkZSIsImZvckVhY2giLCJmaWwiLCJzaG93IiwidXBkYXRlQm91bmRzIiwiYm91bmQxIiwiYm91bmQyIiwiaW5kIiwiX2xhdCIsIl9sbmciLCJyZW1vdmVDbGFzcyIsIl92aXNpYmxlIiwibGVuZ3RoIiwicG9wdWxhdGVMaXN0IiwiaGFyZEZpbHRlcnMiLCJrZXlTZXQiLCJzcGxpdCIsIiRldmVudExpc3QiLCJFVkVOVFNfREFUQSIsIm1hcCIsInRvTG93ZXJDYXNlIiwiaW5jbHVkZXMiLCJyZW1vdmUiLCJhcHBlbmQiLCJNYXBNYW5hZ2VyIiwiTEFOR1VBR0UiLCJyZW5kZXJHZW9qc29uIiwibGlzdCIsInJlbmRlcmVkIiwiaXNOYU4iLCJwYXJzZUZsb2F0Iiwic3Vic3RyaW5nIiwidHlwZSIsImNvb3JkaW5hdGVzIiwicHJvcGVydGllcyIsImV2ZW50UHJvcGVydGllcyIsInBvcHVwQ29udGVudCIsImFjY2Vzc1Rva2VuIiwiTCIsImRyYWdnaW5nIiwiQnJvd3NlciIsIm1vYmlsZSIsInNldFZpZXciLCJzY3JvbGxXaGVlbFpvb20iLCJkaXNhYmxlIiwib25Nb3ZlIiwiZXZlbnQiLCJzdyIsImdldEJvdW5kcyIsIl9zb3V0aFdlc3QiLCJuZSIsIl9ub3J0aEVhc3QiLCJnZXRab29tIiwidGlsZUxheWVyIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsIiRtYXAiLCJjYWxsYmFjayIsInNldEJvdW5kcyIsImJvdW5kczEiLCJib3VuZHMyIiwiYm91bmRzIiwiZml0Qm91bmRzIiwic2V0Q2VudGVyIiwiY2VudGVyIiwiem9vbSIsImdldENlbnRlckJ5TG9jYXRpb24iLCJ0cmlnZ2VyWm9vbUVuZCIsImZpcmVFdmVudCIsInpvb21PdXRPbmNlIiwiem9vbU91dCIsInpvb21VbnRpbEhpdCIsIiR0aGlzIiwiaW50ZXJ2YWxIYW5kbGVyIiwic2V0SW50ZXJ2YWwiLCJjbGVhckludGVydmFsIiwicmVmcmVzaE1hcCIsImludmFsaWRhdGVTaXplIiwiZmlsdGVyTWFwIiwiZmlsdGVycyIsInBsb3RQb2ludHMiLCJncm91cHMiLCJnZW9qc29uIiwiZmVhdHVyZXMiLCJnZW9KU09OIiwicG9pbnRUb0xheWVyIiwiZmVhdHVyZSIsImxhdGxuZyIsImV2ZW50VHlwZSIsInNsdWdnZWQiLCJpY29uVXJsIiwiaWNvbnVybCIsInNtYWxsSWNvbiIsImljb24iLCJpY29uU2l6ZSIsImljb25BbmNob3IiLCJjbGFzc05hbWUiLCJnZW9qc29uTWFya2VyT3B0aW9ucyIsIm1hcmtlciIsIm9uRWFjaEZlYXR1cmUiLCJsYXllciIsImJpbmRQb3B1cCIsInVwZGF0ZSIsImxhdExuZyIsInRhcmdldEZvcm0iLCJwcmV2aW91cyIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImZvcm0iLCJkZXBhcmFtIiwic2VyaWFsaXplIiwiaGFzaCIsInBhcmFtIiwicGFyYW1zIiwibG9jIiwicHJvcCIsImdldFBhcmFtZXRlcnMiLCJwYXJhbWV0ZXJzIiwidXBkYXRlTG9jYXRpb24iLCJmIiwiYiIsIkpTT04iLCJzdHJpbmdpZnkiLCJ1cGRhdGVWaWV3cG9ydEJ5Qm91bmQiLCJ0cmlnZ2VyU3VibWl0IiwiYXV0b2NvbXBsZXRlTWFuYWdlciIsIm1hcE1hbmFnZXIiLCJERUZBVUxUX0lDT04iLCJ0b1N0cmluZyIsInJlcGxhY2UiLCJxdWVyaWVzIiwic2VhcmNoIiwiYnVpbGRGaWx0ZXJzIiwiZW5hYmxlSFRNTCIsInRlbXBsYXRlcyIsImJ1dHRvbiIsImxpIiwiZHJvcFJpZ2h0Iiwib25Jbml0aWFsaXplZCIsIm9uRHJvcGRvd25TaG93Iiwic2V0VGltZW91dCIsIm9uRHJvcGRvd25IaWRlIiwib3B0aW9uTGFiZWwiLCJ1bmVzY2FwZSIsImh0bWwiLCJvcHRpb25DbGFzcyIsInNlbGVjdGVkQ2xhc3MiLCJidXR0b25DbGFzcyIsIm9uQ2hhbmdlIiwib3B0aW9uIiwiY2hlY2tlZCIsInNlbGVjdCIsInF1ZXJ5TWFuYWdlciIsImluaXRQYXJhbXMiLCJsYW5ndWFnZU1hbmFnZXIiLCJsaXN0TWFuYWdlciIsImluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayIsInJlc3VsdCIsIndpZHRoIiwiaGVpZ2h0IiwicGFyc2UiLCJjb3B5IiwiY29weVRleHQiLCJnZXRFbGVtZW50QnlJZCIsImV4ZWNDb21tYW5kIiwib3B0IiwiZW1wdHkiLCJ2YWx1ZVRleHQiLCJ0cmFuc2xhdGlvbiIsInRvZ2dsZUNsYXNzIiwia2V5Q29kZSIsIl9xdWVyeSIsIm9sZFVSTCIsIm9yaWdpbmFsRXZlbnQiLCJvbGRIYXNoIiwid2hlbiIsInRoZW4iLCJkb25lIiwiY2FjaGUiLCJyZWR1Y2UiLCJkaWN0Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOztBQUNBLElBQU1BLHNCQUF1QixVQUFTQyxDQUFULEVBQVk7QUFDdkM7O0FBRUEsU0FBTyxVQUFDQyxNQUFELEVBQVk7O0FBRWpCLFFBQU1DLFVBQVUseUNBQWhCO0FBQ0EsUUFBTUMsYUFBYSxPQUFPRixNQUFQLElBQWlCLFFBQWpCLEdBQTRCRyxTQUFTQyxhQUFULENBQXVCSixNQUF2QixDQUE1QixHQUE2REEsTUFBaEY7QUFDQSxRQUFNSyxXQUFXQyxjQUFqQjtBQUNBLFFBQUlDLFdBQVcsSUFBSUMsT0FBT0MsSUFBUCxDQUFZQyxRQUFoQixF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WUFBRUksUUFBRixFQUFZaUUsT0FBWixDQUFvQixvQkFBcEIsRUFBMENpQyxDQUExQzs7QUFFQXRHLFlBQUVJLFFBQUYsRUFBWWlFLE9BQVosQ0FBb0IsNEJBQXBCLEVBQWtEaUMsQ0FBbEQ7QUFDQXRHLFlBQUVJLFFBQUYsRUFBWWlFLE9BQVosQ0FBb0IsOEJBQXBCLEVBQW9EaUMsQ0FBcEQ7QUFFRCxTQVRELEVBU0csR0FUSDtBQVVEO0FBdkNFLEtBQVA7QUF5Q0MsR0EvQ0w7QUFtREQsQ0FsWUQsRUFrWUc3RCxNQWxZSCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbi8vQVBJIDpBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cbmNvbnN0IEF1dG9jb21wbGV0ZU1hbmFnZXIgPSAoZnVuY3Rpb24oJCkge1xuICAvL0luaXRpYWxpemF0aW9uLi4uXG5cbiAgcmV0dXJuICh0YXJnZXQpID0+IHtcblxuICAgIGNvbnN0IEFQSV9LRVkgPSBcIkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVwiO1xuICAgIGNvbnN0IHRhcmdldEl0ZW0gPSB0eXBlb2YgdGFyZ2V0ID09IFwic3RyaW5nXCIgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCkgOiB0YXJnZXQ7XG4gICAgY29uc3QgcXVlcnlNZ3IgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICB2YXIgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcblxuICAgIHJldHVybiB7XG4gICAgICAkdGFyZ2V0OiAkKHRhcmdldEl0ZW0pLFxuICAgICAgdGFyZ2V0OiB0YXJnZXRJdGVtLFxuICAgICAgZm9yY2VTZWFyY2g6IChxKSA9PiB7XG4gICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBxIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICBpZiAocmVzdWx0c1swXSkge1xuICAgICAgICAgICAgbGV0IGdlb21ldHJ5ID0gcmVzdWx0c1swXS5nZW9tZXRyeTtcbiAgICAgICAgICAgIHF1ZXJ5TWdyLnVwZGF0ZVZpZXdwb3J0KGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICQodGFyZ2V0SXRlbSkudmFsKHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyB2YXIgZ2VvbWV0cnkgPSBkYXR1bS5nZW9tZXRyeTtcbiAgICAgICAgICAvLyBxdWVyeU1nci51cGRhdGVWaWV3cG9ydChnZW9tZXRyeS52aWV3cG9ydCk7XG5cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgaW5pdGlhbGl6ZTogKCkgPT4ge1xuICAgICAgICAkKHRhcmdldEl0ZW0pLnR5cGVhaGVhZCh7XG4gICAgICAgICAgICAgICAgICAgIGhpbnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWluTGVuZ3RoOiA0LFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgbWVudTogJ3R0LWRyb3Bkb3duLW1lbnUnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdzZWFyY2gtcmVzdWx0cycsXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IChpdGVtKSA9PiBpdGVtLmZvcm1hdHRlZF9hZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgICBsaW1pdDogMTAsXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogZnVuY3Rpb24gKHEsIHN5bmMsIGFzeW5jKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBxIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXN5bmMocmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICkub24oJ3R5cGVhaGVhZDpzZWxlY3RlZCcsIGZ1bmN0aW9uIChvYmosIGRhdHVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGRhdHVtKVxuICAgICAgICAgICAgICAgICAgICB7XG5cbiAgICAgICAgICAgICAgICAgICAgICB2YXIgZ2VvbWV0cnkgPSBkYXR1bS5nZW9tZXRyeTtcbiAgICAgICAgICAgICAgICAgICAgICBxdWVyeU1nci51cGRhdGVWaWV3cG9ydChnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gIG1hcC5maXRCb3VuZHMoZ2VvbWV0cnkuYm91bmRzPyBnZW9tZXRyeS5ib3VuZHMgOiBnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cblxuXG4gICAgcmV0dXJuIHtcblxuICAgIH1cbiAgfVxuXG59KGpRdWVyeSkpO1xuIiwiY29uc3QgSGVscGVyID0gKCgkKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlZlNvdXJjZTogKHVybCwgcmVmLCBzcmMpID0+IHtcbiAgICAgICAgLy8gSnVuIDEzIDIwMTgg4oCUIEZpeCBmb3Igc291cmNlIGFuZCByZWZlcnJlclxuICAgICAgICBpZiAocmVmICYmIHNyYykge1xuICAgICAgICAgIGlmICh1cmwuaW5kZXhPZihcIj9cIikgPj0gMCkge1xuICAgICAgICAgICAgdXJsID0gYCR7dXJsfSZyZWZlcnJlcj0ke3JlZn0mc291cmNlPSR7c3JjfWA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVybCA9IGAke3VybH0/cmVmZXJyZXI9JHtyZWZ9JnNvdXJjZT0ke3NyY31gO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB1cmw7XG4gICAgICB9XG4gICAgfTtcbn0pKGpRdWVyeSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IExhbmd1YWdlTWFuYWdlciA9ICgoJCkgPT4ge1xuICAvL2tleVZhbHVlXG5cbiAgLy90YXJnZXRzIGFyZSB0aGUgbWFwcGluZ3MgZm9yIHRoZSBsYW5ndWFnZVxuICByZXR1cm4gKCkgPT4ge1xuICAgIGxldCBsYW5ndWFnZTtcbiAgICBsZXQgZGljdGlvbmFyeSA9IHt9O1xuICAgIGxldCAkdGFyZ2V0cyA9ICQoXCJbZGF0YS1sYW5nLXRhcmdldF1bZGF0YS1sYW5nLWtleV1cIik7XG5cbiAgICBjb25zdCB1cGRhdGVQYWdlTGFuZ3VhZ2UgPSAoKSA9PiB7XG5cbiAgICAgIGxldCB0YXJnZXRMYW5ndWFnZSA9IGRpY3Rpb25hcnkucm93cy5maWx0ZXIoKGkpID0+IGkubGFuZyA9PT0gbGFuZ3VhZ2UpWzBdO1xuXG4gICAgICAkdGFyZ2V0cy5lYWNoKChpbmRleCwgaXRlbSkgPT4ge1xuXG4gICAgICAgIGxldCB0YXJnZXRBdHRyaWJ1dGUgPSAkKGl0ZW0pLmRhdGEoJ2xhbmctdGFyZ2V0Jyk7XG4gICAgICAgIGxldCBsYW5nVGFyZ2V0ID0gJChpdGVtKS5kYXRhKCdsYW5nLWtleScpO1xuXG5cblxuXG4gICAgICAgIHN3aXRjaCh0YXJnZXRBdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjYXNlICd0ZXh0JzpcblxuICAgICAgICAgICAgJCgoYFtkYXRhLWxhbmcta2V5PVwiJHtsYW5nVGFyZ2V0fVwiXWApKS50ZXh0KHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGlmIChsYW5nVGFyZ2V0ID09IFwibW9yZS1zZWFyY2gtb3B0aW9uc1wiKSB7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3ZhbHVlJzpcbiAgICAgICAgICAgICQoaXRlbSkudmFsKHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAkKGl0ZW0pLmF0dHIodGFyZ2V0QXR0cmlidXRlLCB0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGxhbmd1YWdlLFxuICAgICAgdGFyZ2V0czogJHRhcmdldHMsXG4gICAgICBkaWN0aW9uYXJ5LFxuICAgICAgaW5pdGlhbGl6ZTogKGxhbmcpID0+IHtcblxuICAgICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgICAvLyB1cmw6ICdodHRwczovL2dzeDJqc29uLmNvbS9hcGk/aWQ9MU8zZUJ5akwxdmxZZjdaN2FtLV9odFJUUWk3M1BhZnFJZk5CZExtWGU4U00mc2hlZXQ9MScsXG4gICAgICAgICAgdXJsOiAnL2RhdGEvbGFuZy5qc29uJyxcbiAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICBkaWN0aW9uYXJ5ID0gZGF0YTtcbiAgICAgICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZSgpO1xuXG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxhbmd1YWdlLWxvYWRlZCcpO1xuXG4gICAgICAgICAgICAkKFwiI2xhbmd1YWdlLW9wdHNcIikubXVsdGlzZWxlY3QoJ3NlbGVjdCcsIGxhbmcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgcmVmcmVzaDogKCkgPT4ge1xuICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UobGFuZ3VhZ2UpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZUxhbmd1YWdlOiAobGFuZykgPT4ge1xuXG4gICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgdXBkYXRlUGFnZUxhbmd1YWdlKCk7XG4gICAgICB9LFxuICAgICAgZ2V0VHJhbnNsYXRpb246IChrZXkpID0+IHtcbiAgICAgICAgbGV0IHRhcmdldExhbmd1YWdlID0gZGljdGlvbmFyeS5yb3dzLmZpbHRlcigoaSkgPT4gaS5sYW5nID09PSBsYW5ndWFnZSlbMF07XG4gICAgICAgIHJldHVybiB0YXJnZXRMYW5ndWFnZVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxufSkoalF1ZXJ5KTtcbiIsIi8qIFRoaXMgbG9hZHMgYW5kIG1hbmFnZXMgdGhlIGxpc3QhICovXG5cbmNvbnN0IExpc3RNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIHJldHVybiAob3B0aW9ucykgPT4ge1xuICAgIGxldCB0YXJnZXRMaXN0ID0gb3B0aW9ucy50YXJnZXRMaXN0IHx8IFwiI2V2ZW50cy1saXN0XCI7XG4gICAgLy8gSnVuZSAxMyBgMTgg4oCTIHJlZmVycmVyIGFuZCBzb3VyY2VcbiAgICBsZXQge3JlZmVycmVyLCBzb3VyY2V9ID0gb3B0aW9ucztcblxuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0TGlzdCA9PT0gJ3N0cmluZycgPyAkKHRhcmdldExpc3QpIDogdGFyZ2V0TGlzdDtcblxuICAgIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0sIHJlZmVycmVyID0gbnVsbCwgc291cmNlID0gbnVsbCkgPT4ge1xuICAgICAgY29uc29sZS5sb2cocmVmZXJyZXIsIHNvdXJjZSAsICBcIn5+fn5cIik7XG4gICAgICB2YXIgZGF0ZSA9IG1vbWVudChpdGVtLnN0YXJ0X2RhdGV0aW1lKS5mb3JtYXQoXCJkZGRkIE1NTSBERCwgaDptbWFcIik7XG4gICAgICBsZXQgdXJsID0gaXRlbS51cmwubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS51cmwgOiBcIi8vXCIgKyBpdGVtLnVybDtcbiAgICAgIC8vIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICAgIHVybCA9IEhlbHBlci5yZWZTb3VyY2UodXJsLCByZWZlcnJlciwgc291cmNlKTtcblxuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaSBjbGFzcz0nJHt3aW5kb3cuc2x1Z2lmeShpdGVtLmV2ZW50X3R5cGUpfSBldmVudHMgZXZlbnQtb2JqJyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50IHR5cGUtYWN0aW9uXCI+XG4gICAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgICAgPGxpIGNsYXNzPSd0YWctJHtpdGVtLmV2ZW50X3R5cGV9IHRhZyc+JHtpdGVtLmV2ZW50X3R5cGV9PC9saT5cbiAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDxoMiBjbGFzcz1cImV2ZW50LXRpdGxlXCI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWRhdGUgZGF0ZVwiPiR7ZGF0ZX08L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtYWRkcmVzcyBhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICAgIDxwPiR7aXRlbS52ZW51ZX08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5SU1ZQPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIGNvbnN0IHJlbmRlckdyb3VwID0gKGl0ZW0sIHJlZmVycmVyID0gbnVsbCwgc291cmNlID0gbnVsbCkgPT4ge1xuICAgICAgbGV0IHVybCA9IGl0ZW0ud2Vic2l0ZS5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLndlYnNpdGUgOiBcIi8vXCIgKyBpdGVtLndlYnNpdGU7XG4gICAgICBsZXQgc3VwZXJHcm91cCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG5cbiAgICAgIHVybCA9IEhlbHBlci5yZWZTb3VyY2UodXJsLCByZWZlcnJlciwgc291cmNlKTtcblxuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaSBjbGFzcz0nJHtpdGVtLmV2ZW50X3R5cGV9ICR7c3VwZXJHcm91cH0gZ3JvdXAtb2JqJyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwIGdyb3VwLW9ialwiPlxuICAgICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctJHtpdGVtLnN1cGVyZ3JvdXB9XCI+JHtpdGVtLnN1cGVyZ3JvdXB9PC9saT5cbiAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDxoMj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS5uYW1lfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1sb2NhdGlvbiBsb2NhdGlvblwiPiR7aXRlbS5sb2NhdGlvbn08L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXNjcmlwdGlvblwiPlxuICAgICAgICAgICAgICA8cD4ke2l0ZW0uZGVzY3JpcHRpb259PC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICRsaXN0OiAkdGFyZ2V0LFxuICAgICAgdXBkYXRlRmlsdGVyOiAocCkgPT4ge1xuICAgICAgICBpZighcCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIFJlbW92ZSBGaWx0ZXJzXG5cbiAgICAgICAgJHRhcmdldC5yZW1vdmVQcm9wKFwiY2xhc3NcIik7XG4gICAgICAgICR0YXJnZXQuYWRkQ2xhc3MocC5maWx0ZXIgPyBwLmZpbHRlci5qb2luKFwiIFwiKSA6ICcnKVxuXG4gICAgICAgICR0YXJnZXQuZmluZCgnbGknKS5oaWRlKCk7XG5cbiAgICAgICAgaWYgKHAuZmlsdGVyKSB7XG4gICAgICAgICAgcC5maWx0ZXIuZm9yRWFjaCgoZmlsKT0+e1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKGBsaS4ke2ZpbH1gKS5zaG93KCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHVwZGF0ZUJvdW5kczogKGJvdW5kMSwgYm91bmQyKSA9PiB7XG5cbiAgICAgICAgLy8gY29uc3QgYm91bmRzID0gW3AuYm91bmRzMSwgcC5ib3VuZHMyXTtcblxuXG4gICAgICAgICR0YXJnZXQuZmluZCgndWwgbGkuZXZlbnQtb2JqLCB1bCBsaS5ncm91cC1vYmonKS5lYWNoKChpbmQsIGl0ZW0pPT4ge1xuXG4gICAgICAgICAgbGV0IF9sYXQgPSAkKGl0ZW0pLmRhdGEoJ2xhdCcpLFxuICAgICAgICAgICAgICBfbG5nID0gJChpdGVtKS5kYXRhKCdsbmcnKTtcblxuXG4gICAgICAgICAgaWYgKGJvdW5kMVswXSA8PSBfbGF0ICYmIGJvdW5kMlswXSA+PSBfbGF0ICYmIGJvdW5kMVsxXSA8PSBfbG5nICYmIGJvdW5kMlsxXSA+PSBfbG5nKSB7XG5cbiAgICAgICAgICAgICQoaXRlbSkuYWRkQ2xhc3MoJ3dpdGhpbi1ib3VuZCcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKGl0ZW0pLnJlbW92ZUNsYXNzKCd3aXRoaW4tYm91bmQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBfdmlzaWJsZSA9ICR0YXJnZXQuZmluZCgndWwgbGkuZXZlbnQtb2JqLndpdGhpbi1ib3VuZCwgdWwgbGkuZ3JvdXAtb2JqLndpdGhpbi1ib3VuZCcpLmxlbmd0aDtcbiAgICAgICAgaWYgKF92aXNpYmxlID09IDApIHtcbiAgICAgICAgICAvLyBUaGUgbGlzdCBpcyBlbXB0eVxuICAgICAgICAgICR0YXJnZXQuYWRkQ2xhc3MoXCJpcy1lbXB0eVwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkdGFyZ2V0LnJlbW92ZUNsYXNzKFwiaXMtZW1wdHlcIik7XG4gICAgICAgIH1cblxuICAgICAgfSxcbiAgICAgIHBvcHVsYXRlTGlzdDogKGhhcmRGaWx0ZXJzKSA9PiB7XG4gICAgICAgIC8vdXNpbmcgd2luZG93LkVWRU5UX0RBVEFcbiAgICAgICAgY29uc3Qga2V5U2V0ID0gIWhhcmRGaWx0ZXJzLmtleSA/IFtdIDogaGFyZEZpbHRlcnMua2V5LnNwbGl0KCcsJyk7XG5cbiAgICAgICAgdmFyICRldmVudExpc3QgPSB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YS5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgaWYgKGtleVNldC5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0uZXZlbnRfdHlwZSAmJiBpdGVtLmV2ZW50X3R5cGUudG9Mb3dlckNhc2UoKSA9PSAnZ3JvdXAnID8gcmVuZGVyR3JvdXAoaXRlbSkgOiByZW5kZXJFdmVudChpdGVtLCByZWZlcnJlciwgc291cmNlKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtleVNldC5sZW5ndGggPiAwICYmIGl0ZW0uZXZlbnRfdHlwZSAhPSAnZ3JvdXAnICYmIGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyRXZlbnQoaXRlbSwgcmVmZXJyZXIsIHNvdXJjZSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXlTZXQubGVuZ3RoID4gMCAmJiBpdGVtLmV2ZW50X3R5cGUgPT0gJ2dyb3VwJyAmJiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5zdXBlcmdyb3VwKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlbmRlckdyb3VwKGl0ZW0sIHJlZmVycmVyLCBzb3VyY2UpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgfSlcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCBsaScpLnJlbW92ZSgpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsJykuYXBwZW5kKCRldmVudExpc3QpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJcblxuY29uc3QgTWFwTWFuYWdlciA9ICgoJCkgPT4ge1xuICBsZXQgTEFOR1VBR0UgPSAnZW4nO1xuXG4gIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0sIHJlZmVycmVyID0gbnVsbCwgc291cmNlID0gbnVsbCkgPT4ge1xuICAgIHZhciBkYXRlID0gbW9tZW50KGl0ZW0uc3RhcnRfZGF0ZXRpbWUpLmZvcm1hdChcImRkZGQgTU1NIERELCBoOm1tYVwiKTtcbiAgICBsZXQgdXJsID0gaXRlbS51cmwubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS51cmwgOiBcIi8vXCIgKyBpdGVtLnVybDtcblxuICAgIHVybCA9IEhlbHBlci5yZWZTb3VyY2UodXJsLCByZWZlcnJlciwgc291cmNlKTtcblxuICAgIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9J3BvcHVwLWl0ZW0gJHtpdGVtLmV2ZW50X3R5cGV9ICR7c3VwZXJHcm91cH0nIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5ldmVudF90eXBlfVwiPiR7aXRlbS5ldmVudF90eXBlIHx8ICdBY3Rpb24nfTwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxoMiBjbGFzcz1cImV2ZW50LXRpdGxlXCI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1kYXRlXCI+JHtkYXRlfTwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtYWRkcmVzcyBhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+UlNWUDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSwgcmVmZXJyZXIgPSBudWxsLCBzb3VyY2UgPSBudWxsKSA9PiB7XG5cbiAgICBsZXQgdXJsID0gaXRlbS53ZWJzaXRlLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0ud2Vic2l0ZSA6IFwiLy9cIiArIGl0ZW0ud2Vic2l0ZTtcblxuICAgIHVybCA9IEhlbHBlci5yZWZTb3VyY2UodXJsLCByZWZlcnJlciwgc291cmNlKTtcblxuICAgIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICByZXR1cm4gYFxuICAgIDxsaT5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwIGdyb3VwLW9iaiAke3N1cGVyR3JvdXB9XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5zdXBlcmdyb3VwfSAke3N1cGVyR3JvdXB9XCI+JHtpdGVtLnN1cGVyZ3JvdXB9PC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWhlYWRlclwiPlxuICAgICAgICAgIDxoMj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS5uYW1lfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1sb2NhdGlvbiBsb2NhdGlvblwiPiR7aXRlbS5sb2NhdGlvbn08L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGVzY3JpcHRpb25cIj5cbiAgICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9saT5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR2VvanNvbiA9IChsaXN0LCByZWYgPSBudWxsLCBzcmMgPSBudWxsKSA9PiB7XG4gICAgcmV0dXJuIGxpc3QubWFwKChpdGVtKSA9PiB7XG4gICAgICAvLyByZW5kZXJlZCBldmVudFR5cGVcbiAgICAgIGxldCByZW5kZXJlZDtcblxuICAgICAgaWYgKGl0ZW0uZXZlbnRfdHlwZSAmJiBpdGVtLmV2ZW50X3R5cGUudG9Mb3dlckNhc2UoKSA9PSAnZ3JvdXAnKSB7XG4gICAgICAgIHJlbmRlcmVkID0gcmVuZGVyR3JvdXAoaXRlbSwgcmVmLCBzcmMpO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZW5kZXJlZCA9IHJlbmRlckV2ZW50KGl0ZW0sIHJlZiwgc3JjKTtcbiAgICAgIH1cblxuICAgICAgLy8gZm9ybWF0IGNoZWNrXG4gICAgICBpZiAoaXNOYU4ocGFyc2VGbG9hdChwYXJzZUZsb2F0KGl0ZW0ubG5nKSkpKSB7XG4gICAgICAgIGl0ZW0ubG5nID0gaXRlbS5sbmcuc3Vic3RyaW5nKDEpXG4gICAgICB9XG4gICAgICBpZiAoaXNOYU4ocGFyc2VGbG9hdChwYXJzZUZsb2F0KGl0ZW0ubGF0KSkpKSB7XG4gICAgICAgIGl0ZW0ubGF0ID0gaXRlbS5sYXQuc3Vic3RyaW5nKDEpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICB0eXBlOiBcIlBvaW50XCIsXG4gICAgICAgICAgY29vcmRpbmF0ZXM6IFtpdGVtLmxuZywgaXRlbS5sYXRdXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBldmVudFByb3BlcnRpZXM6IGl0ZW0sXG4gICAgICAgICAgcG9wdXBDb250ZW50OiByZW5kZXJlZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAob3B0aW9ucykgPT4ge1xuICAgIHZhciBhY2Nlc3NUb2tlbiA9ICdway5leUoxSWpvaWJXRjBkR2hsZHpNMU1DSXNJbUVpT2lKYVRWRk1Va1V3SW4wLndjTTNYYzhCR0M2UE0tT3lyd2puaGcnO1xuICAgIHZhciBtYXAgPSBMLm1hcCgnbWFwJywgeyBkcmFnZ2luZzogIUwuQnJvd3Nlci5tb2JpbGUgfSkuc2V0VmlldyhbMzQuODg1OTMwOTQwNzUzMTcsIDUuMDk3NjU2MjUwMDAwMDAxXSwgMik7XG5cbiAgICBsZXQge3JlZmVycmVyLCBzb3VyY2V9ID0gb3B0aW9ucztcblxuICAgIGlmICghTC5Ccm93c2VyLm1vYmlsZSkge1xuICAgICAgbWFwLnNjcm9sbFdoZWVsWm9vbS5kaXNhYmxlKCk7XG4gICAgfVxuXG4gICAgTEFOR1VBR0UgPSBvcHRpb25zLmxhbmcgfHwgJ2VuJztcblxuICAgIGlmIChvcHRpb25zLm9uTW92ZSkge1xuICAgICAgbWFwLm9uKCdkcmFnZW5kJywgKGV2ZW50KSA9PiB7XG5cblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuICAgICAgICBvcHRpb25zLm9uTW92ZShzdywgbmUpO1xuICAgICAgfSkub24oJ3pvb21lbmQnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKG1hcC5nZXRab29tKCkgPD0gNCkge1xuICAgICAgICAgICQoXCIjbWFwXCIpLmFkZENsYXNzKFwiem9vbWVkLW91dFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkKFwiI21hcFwiKS5yZW1vdmVDbGFzcyhcInpvb21lZC1vdXRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuICAgICAgICBvcHRpb25zLm9uTW92ZShzdywgbmUpO1xuICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBtYXAuZmlyZUV2ZW50KCd6b29tZW5kJyk7XG5cbiAgICBMLnRpbGVMYXllcignaHR0cHM6Ly9hcGkubWFwYm94LmNvbS9zdHlsZXMvdjEvbWF0dGhldzM1MC9jamE0MXRpamsyN2Q2MnJxb2Q3ZzBseDRiL3RpbGVzLzI1Ni97en0ve3h9L3t5fT9hY2Nlc3NfdG9rZW49JyArIGFjY2Vzc1Rva2VuLCB7XG4gICAgICAgIGF0dHJpYnV0aW9uOiAnJmNvcHk7IDxhIGhyZWY9XCJodHRwOi8vb3NtLm9yZy9jb3B5cmlnaHRcIj5PcGVuU3RyZWV0TWFwPC9hPiBjb250cmlidXRvcnMg4oCiIDxhIGhyZWY9XCIvLzM1MC5vcmdcIj4zNTAub3JnPC9hPidcbiAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgbGV0IGdlb2NvZGVyID0gbnVsbDtcbiAgICByZXR1cm4ge1xuICAgICAgJG1hcDogbWFwLFxuICAgICAgaW5pdGlhbGl6ZTogKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG4gICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBzZXRCb3VuZHM6IChib3VuZHMxLCBib3VuZHMyKSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW2JvdW5kczEsIGJvdW5kczJdO1xuICAgICAgICBtYXAuZml0Qm91bmRzKGJvdW5kcyk7XG4gICAgICB9LFxuICAgICAgc2V0Q2VudGVyOiAoY2VudGVyLCB6b29tID0gMTApID0+IHtcbiAgICAgICAgaWYgKCFjZW50ZXIgfHwgIWNlbnRlclswXSB8fCBjZW50ZXJbMF0gPT0gXCJcIlxuICAgICAgICAgICAgICB8fCAhY2VudGVyWzFdIHx8IGNlbnRlclsxXSA9PSBcIlwiKSByZXR1cm47XG4gICAgICAgIG1hcC5zZXRWaWV3KGNlbnRlciwgem9vbSk7XG4gICAgICB9LFxuICAgICAgZ2V0Qm91bmRzOiAoKSA9PiB7XG5cbiAgICAgICAgbGV0IHN3ID0gW21hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW21hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubG5nXTtcblxuICAgICAgICByZXR1cm4gW3N3LCBuZV07XG4gICAgICB9LFxuICAgICAgLy8gQ2VudGVyIGxvY2F0aW9uIGJ5IGdlb2NvZGVkXG4gICAgICBnZXRDZW50ZXJCeUxvY2F0aW9uOiAobG9jYXRpb24sIGNhbGxiYWNrKSA9PiB7XG5cbiAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IGxvY2F0aW9uIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcblxuICAgICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlc3VsdHNbMF0pXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyWm9vbUVuZDogKCkgPT4ge1xuICAgICAgICBtYXAuZmlyZUV2ZW50KCd6b29tZW5kJyk7XG4gICAgICB9LFxuICAgICAgem9vbU91dE9uY2U6ICgpID0+IHtcbiAgICAgICAgbWFwLnpvb21PdXQoMSk7XG4gICAgICB9LFxuICAgICAgem9vbVVudGlsSGl0OiAoKSA9PiB7XG4gICAgICAgIHZhciAkdGhpcyA9IHRoaXM7XG4gICAgICAgIG1hcC56b29tT3V0KDEpO1xuICAgICAgICBsZXQgaW50ZXJ2YWxIYW5kbGVyID0gbnVsbDtcbiAgICAgICAgaW50ZXJ2YWxIYW5kbGVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgIHZhciBfdmlzaWJsZSA9ICQoZG9jdW1lbnQpLmZpbmQoJ3VsIGxpLmV2ZW50LW9iai53aXRoaW4tYm91bmQsIHVsIGxpLmdyb3VwLW9iai53aXRoaW4tYm91bmQnKS5sZW5ndGg7XG4gICAgICAgICAgaWYgKF92aXNpYmxlID09IDApIHtcbiAgICAgICAgICAgIG1hcC56b29tT3V0KDEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSGFuZGxlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAyMDApO1xuICAgICAgfSxcbiAgICAgIHJlZnJlc2hNYXA6ICgpID0+IHtcbiAgICAgICAgbWFwLmludmFsaWRhdGVTaXplKGZhbHNlKTtcbiAgICAgICAgLy8gbWFwLl9vblJlc2l6ZSgpO1xuICAgICAgICAvLyBtYXAuZmlyZUV2ZW50KCd6b29tZW5kJyk7XG5cblxuICAgICAgfSxcbiAgICAgIGZpbHRlck1hcDogKGZpbHRlcnMpID0+IHtcblxuICAgICAgICAkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXBcIikuaGlkZSgpO1xuXG5cbiAgICAgICAgaWYgKCFmaWx0ZXJzKSByZXR1cm47XG5cbiAgICAgICAgZmlsdGVycy5mb3JFYWNoKChpdGVtKSA9PiB7XG5cbiAgICAgICAgICAkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXAuXCIgKyBpdGVtLnRvTG93ZXJDYXNlKCkpLnNob3coKTtcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICBwbG90UG9pbnRzOiAobGlzdCwgaGFyZEZpbHRlcnMsIGdyb3VwcykgPT4ge1xuICAgICAgICBjb25zdCBrZXlTZXQgPSAhaGFyZEZpbHRlcnMua2V5ID8gW10gOiBoYXJkRmlsdGVycy5rZXkuc3BsaXQoJywnKTtcblxuICAgICAgICBpZiAoa2V5U2V0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsaXN0ID0gbGlzdC5maWx0ZXIoKGl0ZW0pID0+IGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKVxuICAgICAgICB9XG5cblxuICAgICAgICBjb25zdCBnZW9qc29uID0ge1xuICAgICAgICAgIHR5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgICAgICAgICBmZWF0dXJlczogcmVuZGVyR2VvanNvbihsaXN0LCByZWZlcnJlciwgc291cmNlKVxuICAgICAgICB9O1xuXG5cbiAgICAgICAgTC5nZW9KU09OKGdlb2pzb24sIHtcbiAgICAgICAgICAgIHBvaW50VG9MYXllcjogKGZlYXR1cmUsIGxhdGxuZykgPT4ge1xuICAgICAgICAgICAgICAvLyBJY29ucyBmb3IgbWFya2Vyc1xuICAgICAgICAgICAgICBjb25zdCBldmVudFR5cGUgPSBmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLmV2ZW50X3R5cGU7XG5cbiAgICAgICAgICAgICAgLy8gSWYgbm8gc3VwZXJncm91cCwgaXQncyBhbiBldmVudC5cbiAgICAgICAgICAgICAgY29uc3Qgc3VwZXJncm91cCA9IGdyb3Vwc1tmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLnN1cGVyZ3JvdXBdID8gZmVhdHVyZS5wcm9wZXJ0aWVzLmV2ZW50UHJvcGVydGllcy5zdXBlcmdyb3VwIDogXCJFdmVudHNcIjtcbiAgICAgICAgICAgICAgY29uc3Qgc2x1Z2dlZCA9IHdpbmRvdy5zbHVnaWZ5KHN1cGVyZ3JvdXApO1xuICAgICAgICAgICAgICBjb25zdCBpY29uVXJsID0gZ3JvdXBzW3N1cGVyZ3JvdXBdID8gZ3JvdXBzW3N1cGVyZ3JvdXBdLmljb251cmwgfHwgXCIvaW1nL2V2ZW50LnBuZ1wiICA6IFwiL2ltZy9ldmVudC5wbmdcIiA7XG5cbiAgICAgICAgICAgICAgY29uc3Qgc21hbGxJY29uID0gIEwuaWNvbih7XG4gICAgICAgICAgICAgICAgaWNvblVybDogaWNvblVybCxcbiAgICAgICAgICAgICAgICBpY29uU2l6ZTogWzE4LCAxOF0sXG4gICAgICAgICAgICAgICAgaWNvbkFuY2hvcjogWzksIDldLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogc2x1Z2dlZCArICcgZXZlbnQtaXRlbS1wb3B1cCdcbiAgICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgICB2YXIgZ2VvanNvbk1hcmtlck9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgaWNvbjogc21hbGxJY29uLFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICByZXR1cm4gTC5tYXJrZXIobGF0bG5nLCBnZW9qc29uTWFya2VyT3B0aW9ucyk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgb25FYWNoRmVhdHVyZTogKGZlYXR1cmUsIGxheWVyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZmVhdHVyZS5wcm9wZXJ0aWVzICYmIGZlYXR1cmUucHJvcGVydGllcy5wb3B1cENvbnRlbnQpIHtcbiAgICAgICAgICAgICAgbGF5ZXIuYmluZFBvcHVwKGZlYXR1cmUucHJvcGVydGllcy5wb3B1cENvbnRlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSkuYWRkVG8obWFwKTtcblxuICAgICAgfSxcbiAgICAgIHVwZGF0ZTogKHApID0+IHtcbiAgICAgICAgaWYgKCFwIHx8ICFwLmxhdCB8fCAhcC5sbmcgKSByZXR1cm47XG5cbiAgICAgICAgbWFwLnNldFZpZXcoTC5sYXRMbmcocC5sYXQsIHAubG5nKSwgMTApO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJjb25zdCBRdWVyeU1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRGb3JtID0gXCJmb3JtI2ZpbHRlcnMtZm9ybVwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRGb3JtID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0Rm9ybSkgOiB0YXJnZXRGb3JtO1xuICAgIGxldCBsYXQgPSBudWxsO1xuICAgIGxldCBsbmcgPSBudWxsO1xuXG4gICAgbGV0IHByZXZpb3VzID0ge307XG5cbiAgICAkdGFyZ2V0Lm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgbGF0ID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbCgpO1xuICAgICAgbG5nID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbCgpO1xuXG4gICAgICB2YXIgZm9ybSA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcblxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAkLnBhcmFtKGZvcm0pO1xuICAgIH0pXG5cbiAgICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJ3NlbGVjdCNmaWx0ZXItaXRlbXMnLCAoKSA9PiB7XG4gICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgIH0pXG5cblxuICAgIHJldHVybiB7XG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgcGFyYW1zID0gJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSlcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhbmddXCIpLnZhbChwYXJhbXMubGFuZyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChwYXJhbXMubGF0KTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKHBhcmFtcy5sbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwocGFyYW1zLmJvdW5kMSk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChwYXJhbXMuYm91bmQyKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxvY11cIikudmFsKHBhcmFtcy5sb2MpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9a2V5XVwiKS52YWwocGFyYW1zLmtleSk7XG5cbiAgICAgICAgICBpZiAocGFyYW1zLmZpbHRlcikge1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiI2ZpbHRlci1pdGVtcyBvcHRpb25cIikucmVtb3ZlUHJvcChcInNlbGVjdGVkXCIpO1xuICAgICAgICAgICAgcGFyYW1zLmZpbHRlci5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIjZmlsdGVyLWl0ZW1zIG9wdGlvblt2YWx1ZT0nXCIgKyBpdGVtICsgXCInXVwiKS5wcm9wKFwic2VsZWN0ZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGdldFBhcmFtZXRlcnM6ICgpID0+IHtcbiAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG4gICAgICAgIC8vIHBhcmFtZXRlcnNbJ2xvY2F0aW9uJ10gO1xuXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHBhcmFtZXRlcnMpIHtcbiAgICAgICAgICBpZiAoICFwYXJhbWV0ZXJzW2tleV0gfHwgcGFyYW1ldGVyc1trZXldID09IFwiXCIpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBwYXJhbWV0ZXJzW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtZXRlcnM7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTG9jYXRpb246IChsYXQsIGxuZykgPT4ge1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKGxhdCk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwobG5nKTtcbiAgICAgICAgLy8gJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVWaWV3cG9ydDogKHZpZXdwb3J0KSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW1t2aWV3cG9ydC5mLmIsIHZpZXdwb3J0LmIuYl0sIFt2aWV3cG9ydC5mLmYsIHZpZXdwb3J0LmIuZl1dO1xuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlVmlld3BvcnRCeUJvdW5kOiAoc3csIG5lKSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW3N3LCBuZV07Ly8vLy8vLy9cblxuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdHJpZ2dlclN1Ym1pdDogKCkgPT4ge1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSkoalF1ZXJ5KTtcbiIsImxldCBhdXRvY29tcGxldGVNYW5hZ2VyO1xubGV0IG1hcE1hbmFnZXI7XG5cbndpbmRvdy5ERUZBVUxUX0lDT04gPSBcIi9pbWcvZXZlbnQucG5nXCI7XG53aW5kb3cuc2x1Z2lmeSA9ICh0ZXh0KSA9PiB0ZXh0LnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHMrL2csICctJykgICAgICAgICAgIC8vIFJlcGxhY2Ugc3BhY2VzIHdpdGggLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9bXlxcd1xcLV0rL2csICcnKSAgICAgICAvLyBSZW1vdmUgYWxsIG5vbi13b3JkIGNoYXJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcLVxcLSsvZywgJy0nKSAgICAgICAgIC8vIFJlcGxhY2UgbXVsdGlwbGUgLSB3aXRoIHNpbmdsZSAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL14tKy8sICcnKSAgICAgICAgICAgICAvLyBUcmltIC0gZnJvbSBzdGFydCBvZiB0ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLy0rJC8sICcnKTsgICAgICAgICAgICAvLyBUcmltIC0gZnJvbSBlbmQgb2YgdGV4dFxuKGZ1bmN0aW9uKCQpIHtcbiAgLy8gTG9hZCB0aGluZ3NcblxuICB3aW5kb3cucXVlcmllcyA9ICAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHJpbmcoMSkpO1xuXG4gIGNvbnN0IGJ1aWxkRmlsdGVycyA9ICgpID0+IHskKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykubXVsdGlzZWxlY3Qoe1xuICAgICAgZW5hYmxlSFRNTDogdHJ1ZSxcbiAgICAgIHRlbXBsYXRlczoge1xuICAgICAgICBidXR0b246ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cIm11bHRpc2VsZWN0IGRyb3Bkb3duLXRvZ2dsZVwiIGRhdGEtdG9nZ2xlPVwiZHJvcGRvd25cIj48c3BhbiBkYXRhLWxhbmctdGFyZ2V0PVwidGV4dFwiIGRhdGEtbGFuZy1rZXk9XCJtb3JlLXNlYXJjaC1vcHRpb25zXCI+PC9zcGFuPiA8c3BhbiBjbGFzcz1cImZhIGZhLWNhcmV0LWRvd25cIj48L3NwYW4+PC9idXR0b24+JyxcbiAgICAgICAgbGk6ICc8bGk+PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIj48bGFiZWw+PC9sYWJlbD48L2E+PC9saT4nXG4gICAgICB9LFxuICAgICAgZHJvcFJpZ2h0OiB0cnVlLFxuICAgICAgb25Jbml0aWFsaXplZDogKCkgPT4ge1xuXG4gICAgICB9LFxuICAgICAgb25Ecm9wZG93blNob3c6ICgpID0+IHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcihcIm1vYmlsZS11cGRhdGUtbWFwLWhlaWdodFwiKTtcbiAgICAgICAgfSwgMTApO1xuXG4gICAgICB9LFxuICAgICAgb25Ecm9wZG93bkhpZGU6ICgpID0+IHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcihcIm1vYmlsZS11cGRhdGUtbWFwLWhlaWdodFwiKTtcbiAgICAgICAgfSwgMTApO1xuICAgICAgfSxcbiAgICAgIG9wdGlvbkxhYmVsOiAoZSkgPT4ge1xuICAgICAgICAvLyBsZXQgZWwgPSAkKCAnPGRpdj48L2Rpdj4nICk7XG4gICAgICAgIC8vIGVsLmFwcGVuZCgoKSArIFwiXCIpO1xuXG4gICAgICAgIHJldHVybiB1bmVzY2FwZSgkKGUpLmF0dHIoJ2xhYmVsJykpIHx8ICQoZSkuaHRtbCgpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfTtcbiAgYnVpbGRGaWx0ZXJzKCk7XG5cblxuICAkKCdzZWxlY3QjbGFuZ3VhZ2Utb3B0cycpLm11bHRpc2VsZWN0KHtcbiAgICBlbmFibGVIVE1MOiB0cnVlLFxuICAgIG9wdGlvbkNsYXNzOiAoKSA9PiAnbGFuZy1vcHQnLFxuICAgIHNlbGVjdGVkQ2xhc3M6ICgpID0+ICdsYW5nLXNlbCcsXG4gICAgYnV0dG9uQ2xhc3M6ICgpID0+ICdsYW5nLWJ1dCcsXG4gICAgZHJvcFJpZ2h0OiB0cnVlLFxuICAgIG9wdGlvbkxhYmVsOiAoZSkgPT4ge1xuICAgICAgLy8gbGV0IGVsID0gJCggJzxkaXY+PC9kaXY+JyApO1xuICAgICAgLy8gZWwuYXBwZW5kKCgpICsgXCJcIik7XG5cbiAgICAgIHJldHVybiB1bmVzY2FwZSgkKGUpLmF0dHIoJ2xhYmVsJykpIHx8ICQoZSkuaHRtbCgpO1xuICAgIH0sXG4gICAgb25DaGFuZ2U6IChvcHRpb24sIGNoZWNrZWQsIHNlbGVjdCkgPT4ge1xuXG4gICAgICBjb25zdCBwYXJhbWV0ZXJzID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcbiAgICAgIHBhcmFtZXRlcnNbJ2xhbmcnXSA9IG9wdGlvbi52YWwoKTtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgcGFyYW1ldGVycyk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXJlc2V0LW1hcCcsIHBhcmFtZXRlcnMpO1xuXG4gICAgfVxuICB9KVxuXG4gIC8vIDEuIGdvb2dsZSBtYXBzIGdlb2NvZGVcblxuICAvLyAyLiBmb2N1cyBtYXAgb24gZ2VvY29kZSAodmlhIGxhdC9sbmcpXG4gIGNvbnN0IHF1ZXJ5TWFuYWdlciA9IFF1ZXJ5TWFuYWdlcigpO1xuICAgICAgICBxdWVyeU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuXG4gIGNvbnN0IGluaXRQYXJhbXMgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuXG5cblxuICBjb25zdCBsYW5ndWFnZU1hbmFnZXIgPSBMYW5ndWFnZU1hbmFnZXIoKTtcblxuICBjb25zdCBsaXN0TWFuYWdlciA9IExpc3RNYW5hZ2VyKHtcbiAgICByZWZlcnJlcjogd2luZG93LnF1ZXJpZXMucmVmZXJyZXIsXG4gICAgc291cmNlOiB3aW5kb3cucXVlcmllcy5zb3VyY2VcbiAgfSk7XG5cblxuICBtYXBNYW5hZ2VyID0gTWFwTWFuYWdlcih7XG4gICAgb25Nb3ZlOiAoc3csIG5lKSA9PiB7XG4gICAgICAvLyBXaGVuIHRoZSBtYXAgbW92ZXMgYXJvdW5kLCB3ZSB1cGRhdGUgdGhlIGxpc3RcbiAgICAgIHF1ZXJ5TWFuYWdlci51cGRhdGVWaWV3cG9ydEJ5Qm91bmQoc3csIG5lKTtcbiAgICAgIC8vdXBkYXRlIFF1ZXJ5XG4gICAgfSxcbiAgICByZWZlcnJlcjogd2luZG93LnF1ZXJpZXMucmVmZXJyZXIsXG4gICAgc291cmNlOiB3aW5kb3cucXVlcmllcy5zb3VyY2VcbiAgfSk7XG5cbiAgd2luZG93LmluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayA9ICgpID0+IHtcblxuICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIgPSBBdXRvY29tcGxldGVNYW5hZ2VyKFwiaW5wdXRbbmFtZT0nbG9jJ11cIik7XG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlci5pbml0aWFsaXplKCk7XG5cbiAgICBpZiAoaW5pdFBhcmFtcy5sb2MgJiYgaW5pdFBhcmFtcy5sb2MgIT09ICcnICYmICghaW5pdFBhcmFtcy5ib3VuZDEgJiYgIWluaXRQYXJhbXMuYm91bmQyKSkge1xuICAgICAgbWFwTWFuYWdlci5pbml0aWFsaXplKCgpID0+IHtcbiAgICAgICAgbWFwTWFuYWdlci5nZXRDZW50ZXJCeUxvY2F0aW9uKGluaXRQYXJhbXMubG9jLCAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgcXVlcnlNYW5hZ2VyLnVwZGF0ZVZpZXdwb3J0KHJlc3VsdC5nZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBpZihpbml0UGFyYW1zLmxhdCAmJiBpbml0UGFyYW1zLmxuZykge1xuICAgIG1hcE1hbmFnZXIuc2V0Q2VudGVyKFtpbml0UGFyYW1zLmxhdCwgaW5pdFBhcmFtcy5sbmddKTtcbiAgfVxuXG4gIC8qKipcbiAgKiBMaXN0IEV2ZW50c1xuICAqIFRoaXMgd2lsbCB0cmlnZ2VyIHRoZSBsaXN0IHVwZGF0ZSBtZXRob2RcbiAgKi9cbiAgJChkb2N1bWVudCkub24oJ21vYmlsZS11cGRhdGUtbWFwLWhlaWdodCcsIChldmVudCkgPT4ge1xuICAgIC8vVGhpcyBjaGVja3MgaWYgd2lkdGggaXMgZm9yIG1vYmlsZVxuICAgIGlmICgkKHdpbmRvdykud2lkdGgoKSA8IDYwMCkge1xuICAgICAgc2V0VGltZW91dCgoKT0+IHtcbiAgICAgICAgJChcIiNtYXBcIikuaGVpZ2h0KCQoXCIjZXZlbnRzLWxpc3RcIikuaGVpZ2h0KCkpO1xuICAgICAgICBtYXBNYW5hZ2VyLnJlZnJlc2hNYXAoKTtcbiAgICAgIH0sIDEwKTtcbiAgICB9XG4gIH0pXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgbGlzdE1hbmFnZXIucG9wdWxhdGVMaXN0KG9wdGlvbnMucGFyYW1zKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG5cbiAgICBsaXN0TWFuYWdlci51cGRhdGVGaWx0ZXIob3B0aW9ucyk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLWJ5LWJvdW5kJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgbGV0IGJvdW5kMSwgYm91bmQyO1xuXG4gICAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLmJvdW5kMSB8fCAhb3B0aW9ucy5ib3VuZDIpIHtcbiAgICAgIFtib3VuZDEsIGJvdW5kMl0gPSBtYXBNYW5hZ2VyLmdldEJvdW5kcygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBib3VuZDEgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQxKTtcbiAgICAgIGJvdW5kMiA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDIpO1xuICAgIH1cblxuICAgIGxpc3RNYW5hZ2VyLnVwZGF0ZUJvdW5kcyhib3VuZDEsIGJvdW5kMilcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItcmVzZXQtbWFwJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgdmFyIGNvcHkgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9wdGlvbnMpKTtcbiAgICBkZWxldGUgY29weVsnbG5nJ107XG4gICAgZGVsZXRlIGNvcHlbJ2xhdCddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDEnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQyJ107XG5cbiAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICQucGFyYW0oY29weSk7XG5cblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJ0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZVwiLCBjb3B5KTtcbiAgICAkKFwic2VsZWN0I2ZpbHRlci1pdGVtc1wiKS5tdWx0aXNlbGVjdCgnZGVzdHJveScpO1xuICAgIGJ1aWxkRmlsdGVycygpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbG9hZC1ncm91cHMnLCB7IGdyb3Vwczogd2luZG93LkVWRU5UU19EQVRBLmdyb3VwcyB9KTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcblxuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcihcInRyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlXCIsIGNvcHkpO1xuICAgIH0sIDEwMDApO1xuICB9KTtcblxuXG4gIC8qKipcbiAgKiBNYXAgRXZlbnRzXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICAvLyBtYXBNYW5hZ2VyLnNldENlbnRlcihbb3B0aW9ucy5sYXQsIG9wdGlvbnMubG5nXSk7XG4gICAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLmJvdW5kMSB8fCAhb3B0aW9ucy5ib3VuZDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgdmFyIGJvdW5kMiA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDIpO1xuXG4gICAgbWFwTWFuYWdlci5zZXRCb3VuZHMoYm91bmQxLCBib3VuZDIpO1xuICAgIC8vIG1hcE1hbmFnZXIudHJpZ2dlclpvb21FbmQoKTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgbWFwTWFuYWdlci50cmlnZ2VyWm9vbUVuZCgpO1xuICAgIH0sIDEwKTtcblxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCBcIiNjb3B5LWVtYmVkXCIsIChlKSA9PiB7XG4gICAgdmFyIGNvcHlUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbWJlZC10ZXh0XCIpO1xuICAgIGNvcHlUZXh0LnNlbGVjdCgpO1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiQ29weVwiKTtcbiAgfSk7XG5cbiAgLy8gMy4gbWFya2VycyBvbiBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXBsb3QnLCAoZSwgb3B0KSA9PiB7XG5cbiAgICBtYXBNYW5hZ2VyLnBsb3RQb2ludHMob3B0LmRhdGEsIG9wdC5wYXJhbXMsIG9wdC5ncm91cHMpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicpO1xuICB9KVxuXG4gIC8vIGxvYWQgZ3JvdXBzXG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbG9hZC1ncm91cHMnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLmVtcHR5KCk7XG4gICAgb3B0Lmdyb3Vwcy5mb3JFYWNoKChpdGVtKSA9PiB7XG5cbiAgICAgIGxldCBzbHVnZ2VkID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICAgIGxldCB2YWx1ZVRleHQgPSBsYW5ndWFnZU1hbmFnZXIuZ2V0VHJhbnNsYXRpb24oaXRlbS50cmFuc2xhdGlvbik7XG4gICAgICAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykuYXBwZW5kKGBcbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9JyR7c2x1Z2dlZH0nXG4gICAgICAgICAgICAgIHNlbGVjdGVkPSdzZWxlY3RlZCdcbiAgICAgICAgICAgICAgbGFiZWw9XCI8c3BhbiBkYXRhLWxhbmctdGFyZ2V0PSd0ZXh0JyBkYXRhLWxhbmcta2V5PScke2l0ZW0udHJhbnNsYXRpb259Jz4ke3ZhbHVlVGV4dH08L3NwYW4+PGltZyBzcmM9JyR7aXRlbS5pY29udXJsIHx8IHdpbmRvdy5ERUZBVUxUX0lDT059JyAvPlwiPlxuICAgICAgICAgICAgPC9vcHRpb24+YClcbiAgICB9KTtcblxuICAgIC8vIFJlLWluaXRpYWxpemVcbiAgICBxdWVyeU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuICAgIC8vICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5tdWx0aXNlbGVjdCgnZGVzdHJveScpO1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5tdWx0aXNlbGVjdCgncmVidWlsZCcpO1xuXG4gICAgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCk7XG5cblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJyk7XG5cbiAgfSlcblxuICAvLyBGaWx0ZXIgbWFwXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCAoZSwgb3B0KSA9PiB7XG4gICAgaWYgKG9wdCkge1xuICAgICAgbWFwTWFuYWdlci5maWx0ZXJNYXAob3B0LmZpbHRlcik7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sYW5ndWFnZS11cGRhdGUnLCAoZSwgb3B0KSA9PiB7XG5cbiAgICBpZiAob3B0KSB7XG5cbiAgICAgIGxhbmd1YWdlTWFuYWdlci51cGRhdGVMYW5ndWFnZShvcHQubGFuZyk7XG4gICAgfSBlbHNlIHtcblxuICAgICAgbGFuZ3VhZ2VNYW5hZ2VyLnJlZnJlc2goKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxhbmd1YWdlLWxvYWRlZCcsIChlLCBvcHQpID0+IHtcbiAgICAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykubXVsdGlzZWxlY3QoJ3JlYnVpbGQnKTtcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uI3Nob3ctaGlkZS1tYXAnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnYm9keScpLnRvZ2dsZUNsYXNzKCdtYXAtdmlldycpXG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24uYnRuLm1vcmUtaXRlbXMnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnI2VtYmVkLWFyZWEnKS50b2dnbGVDbGFzcygnb3BlbicpO1xuICB9KVxuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIChlLCBvcHQpID0+IHtcbiAgICAvL3VwZGF0ZSBlbWJlZCBsaW5lXG4gICAgdmFyIGNvcHkgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9wdCkpO1xuICAgIGRlbGV0ZSBjb3B5WydsbmcnXTtcbiAgICBkZWxldGUgY29weVsnbGF0J107XG4gICAgZGVsZXRlIGNvcHlbJ2JvdW5kMSddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDInXTtcblxuICAgICQoJyNlbWJlZC1hcmVhIGlucHV0W25hbWU9ZW1iZWRdJykudmFsKCdodHRwczovL25ldy1tYXAuMzUwLm9yZyMnICsgJC5wYXJhbShjb3B5KSk7XG4gIH0pO1xuXG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbiN6b29tLW91dCcsIChlLCBvcHQpID0+IHtcblxuICAgIC8vIG1hcE1hbmFnZXIuem9vbU91dE9uY2UoKTtcblxuICAgIG1hcE1hbmFnZXIuem9vbVVudGlsSGl0KCk7XG4gIH0pXG5cbiAgJCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIChlKSA9PiB7XG4gICAgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCk7XG4gIH0pO1xuXG4gIC8qKlxuICBGaWx0ZXIgQ2hhbmdlc1xuICAqL1xuICAkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiLnNlYXJjaC1idXR0b24gYnV0dG9uXCIsIChlKSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJzZWFyY2guZm9yY2Utc2VhcmNoLWxvY2F0aW9uXCIpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oXCJrZXl1cFwiLCBcImlucHV0W25hbWU9J2xvYyddXCIsIChlKSA9PiB7XG4gICAgaWYgKGUua2V5Q29kZSA9PSAxMykge1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcignc2VhcmNoLmZvcmNlLXNlYXJjaC1sb2NhdGlvbicpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3NlYXJjaC5mb3JjZS1zZWFyY2gtbG9jYXRpb24nLCAoKSA9PiB7XG4gICAgbGV0IF9xdWVyeSA9ICQoXCJpbnB1dFtuYW1lPSdsb2MnXVwiKS52YWwoKTtcbiAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmZvcmNlU2VhcmNoKF9xdWVyeSk7XG4gICAgLy8gU2VhcmNoIGdvb2dsZSBhbmQgZ2V0IHRoZSBmaXJzdCByZXN1bHQuLi4gYXV0b2NvbXBsZXRlP1xuICB9KTtcblxuICAkKHdpbmRvdykub24oXCJoYXNoY2hhbmdlXCIsIChldmVudCkgPT4ge1xuICAgIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICBpZiAoaGFzaC5sZW5ndGggPT0gMCkgcmV0dXJuO1xuICAgIGNvbnN0IHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oaGFzaC5zdWJzdHJpbmcoMSkpO1xuICAgIGNvbnN0IG9sZFVSTCA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQub2xkVVJMO1xuXG5cbiAgICBjb25zdCBvbGRIYXNoID0gJC5kZXBhcmFtKG9sZFVSTC5zdWJzdHJpbmcob2xkVVJMLnNlYXJjaChcIiNcIikrMSkpO1xuXG5cbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicsIHBhcmFtZXRlcnMpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgcGFyYW1ldGVycyk7XG5cbiAgICAvLyBTbyB0aGF0IGNoYW5nZSBpbiBmaWx0ZXJzIHdpbGwgbm90IHVwZGF0ZSB0aGlzXG4gICAgaWYgKG9sZEhhc2guYm91bmQxICE9PSBwYXJhbWV0ZXJzLmJvdW5kMSB8fCBvbGRIYXNoLmJvdW5kMiAhPT0gcGFyYW1ldGVycy5ib3VuZDIpIHtcblxuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci1ieS1ib3VuZCcsIHBhcmFtZXRlcnMpO1xuICAgIH1cblxuICAgIGlmIChvbGRIYXNoLmxvZyAhPT0gcGFyYW1ldGVycy5sb2MpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuXG4gICAgfVxuXG4gICAgLy8gQ2hhbmdlIGl0ZW1zXG4gICAgaWYgKG9sZEhhc2gubGFuZyAhPT0gcGFyYW1ldGVycy5sYW5nKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgIH1cbiAgfSlcblxuICAvLyA0LiBmaWx0ZXIgb3V0IGl0ZW1zIGluIGFjdGl2aXR5LWFyZWFcblxuICAvLyA1LiBnZXQgbWFwIGVsZW1lbnRzXG5cbiAgLy8gNi4gZ2V0IEdyb3VwIGRhdGFcblxuICAvLyA3LiBwcmVzZW50IGdyb3VwIGVsZW1lbnRzXG5cbiAgJC53aGVuKCgpPT57fSlcbiAgICAudGhlbigoKSA9PntcbiAgICAgIHJldHVybiBsYW5ndWFnZU1hbmFnZXIuaW5pdGlhbGl6ZShpbml0UGFyYW1zWydsYW5nJ10gfHwgJ2VuJyk7XG4gICAgfSlcbiAgICAuZG9uZSgoZGF0YSkgPT4ge30pXG4gICAgLnRoZW4oKCkgPT4ge1xuICAgICAgJC5hamF4KHtcbiAgICAgICAgICB1cmw6ICdodHRwczovL25ldy1tYXAuMzUwLm9yZy9vdXRwdXQvMzUwb3JnLW5ldy1sYXlvdXQuanMuZ3onLCAvLyd8KipEQVRBX1NPVVJDRSoqfCcsXG4gICAgICAgICAgLy8gdXJsOiAnL2RhdGEvdGVzdC5qcycsIC8vJ3wqKkRBVEFfU09VUkNFKip8JyxcbiAgICAgICAgICBkYXRhVHlwZTogJ3NjcmlwdCcsXG4gICAgICAgICAgY2FjaGU6IHRydWUsXG4gICAgICAgICAgc3VjY2VzczogKGRhdGEpID0+IHtcbiAgICAgICAgICAgIC8vIHdpbmRvdy5FVkVOVFNfREFUQSA9IGRhdGE7XG5cbiAgICAgICAgICAgIC8vTG9hZCBncm91cHNcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbG9hZC1ncm91cHMnLCB7IGdyb3Vwczogd2luZG93LkVWRU5UU19EQVRBLmdyb3VwcyB9KTtcblxuXG4gICAgICAgICAgICB2YXIgcGFyYW1ldGVycyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG5cbiAgICAgICAgICAgIHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgaXRlbVsnZXZlbnRfdHlwZSddID0gIWl0ZW0uZXZlbnRfdHlwZSA/ICdBY3Rpb24nIDogaXRlbS5ldmVudF90eXBlO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC11cGRhdGUnLCB7IHBhcmFtczogcGFyYW1ldGVycyB9KTtcbiAgICAgICAgICAgIC8vICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1wbG90Jywge1xuICAgICAgICAgICAgICAgIGRhdGE6IHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhLFxuICAgICAgICAgICAgICAgIHBhcmFtczogcGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgICBncm91cHM6IHdpbmRvdy5FVkVOVFNfREFUQS5ncm91cHMucmVkdWNlKChkaWN0LCBpdGVtKT0+eyBkaWN0W2l0ZW0uc3VwZXJncm91cF0gPSBpdGVtOyByZXR1cm4gZGljdDsgfSwge30pXG4gICAgICAgICAgICB9KTtcbiAgICAgIC8vIH0pO1xuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgIC8vVE9ETzogTWFrZSB0aGUgZ2VvanNvbiBjb252ZXJzaW9uIGhhcHBlbiBvbiB0aGUgYmFja2VuZFxuXG4gICAgICAgICAgICAvL1JlZnJlc2ggdGhpbmdzXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgbGV0IHAgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuXG4gICAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHApO1xuICAgICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCBwKTtcblxuICAgICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHApO1xuICAgICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLWJ5LWJvdW5kJywgcCk7XG5cbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG5cblxufSkoalF1ZXJ5KTtcbiJdfQ==
