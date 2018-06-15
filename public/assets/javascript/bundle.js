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
  return !text ? text : text.toString().toLowerCase().replace(/\s+/g, '-') // Replace spaces with -
  .replace(/[^\w\-]+/g, '') // Remove all non-word chars
  .replace(/\-\-+/g, '-') // Replace multiple - with single -
  .replace(/^-+/, '') // Trim - from start of text
  .replace(/-+$/, '');
}; // Trim - from end of text
(function ($) {
  // Load things

  window.queries = $.deparam(window.location.search.substring(1));

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
          console.log(window.queries.group);
          window.EVENTS_DATA.data = window.EVENTS_DATA.data.filter(function (i) {
            return i.campaign == window.queries.group;
          });
        }

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9oZWxwZXIuanMiLCJjbGFzc2VzL2xhbmd1YWdlLmpzIiwiY2xhc3Nlcy9saXN0LmpzIiwiY2xhc3Nlcy9tYXAuanMiLCJjbGFzc2VzL3F1ZXJ5LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIkF1dG9jb21wbGV0ZU1hbmFnZXIiLCIkIiwidGFyZ2V0IiwiQVBJX0tFWSIsInRhcmdldEl0ZW0iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJxdWVyeU1nciIsIlF1ZXJ5TWFuYWdlciIsImdlb2NvZGVyIiwiZ29vZ2xlIiwibWFwcyIsIkdlb2NvZGVyIiwiJHRhcmdldCIsImZvcmNlU2VhcmNoIiwicSIsImdlb2NvZGUiLCJhZGRyZXNzIiwicmVzdWx0cyIsInN0YXR1cyIsImdlb21ldHJ5IiwidXBkYXRlVmlld3BvcnQiLCJ2aWV3cG9ydCIsInZhbCIsImZvcm1hdHRlZF9hZGRyZXNzIiwiaW5pdGlhbGl6ZSIsInR5cGVhaGVhZCIsImhpbnQiLCJoaWdobGlnaHQiLCJtaW5MZW5ndGgiLCJjbGFzc05hbWVzIiwibWVudSIsIm5hbWUiLCJkaXNwbGF5IiwiaXRlbSIsImxpbWl0Iiwic291cmNlIiwic3luYyIsImFzeW5jIiwib24iLCJvYmoiLCJkYXR1bSIsImpRdWVyeSIsIkhlbHBlciIsInJlZlNvdXJjZSIsInVybCIsInJlZiIsInNyYyIsImluZGV4T2YiLCJMYW5ndWFnZU1hbmFnZXIiLCJsYW5ndWFnZSIsImRpY3Rpb25hcnkiLCIkdGFyZ2V0cyIsInVwZGF0ZVBhZ2VMYW5ndWFnZSIsInRhcmdldExhbmd1YWdlIiwicm93cyIsImZpbHRlciIsImkiLCJsYW5nIiwiZWFjaCIsImluZGV4IiwidGFyZ2V0QXR0cmlidXRlIiwiZGF0YSIsImxhbmdUYXJnZXQiLCJ0ZXh0IiwiYXR0ciIsInRhcmdldHMiLCJhamF4IiwiZGF0YVR5cGUiLCJzdWNjZXNzIiwidHJpZ2dlciIsIm11bHRpc2VsZWN0IiwicmVmcmVzaCIsInVwZGF0ZUxhbmd1YWdlIiwiZ2V0VHJhbnNsYXRpb24iLCJrZXkiLCJMaXN0TWFuYWdlciIsIm9wdGlvbnMiLCJ0YXJnZXRMaXN0IiwicmVmZXJyZXIiLCJyZW5kZXJFdmVudCIsImRhdGUiLCJtb21lbnQiLCJzdGFydF9kYXRldGltZSIsImZvcm1hdCIsIm1hdGNoIiwid2luZG93Iiwic2x1Z2lmeSIsImV2ZW50X3R5cGUiLCJsYXQiLCJsbmciLCJ0aXRsZSIsInZlbnVlIiwicmVuZGVyR3JvdXAiLCJ3ZWJzaXRlIiwic3VwZXJHcm91cCIsInN1cGVyZ3JvdXAiLCJsb2NhdGlvbiIsImRlc2NyaXB0aW9uIiwiJGxpc3QiLCJ1cGRhdGVGaWx0ZXIiLCJwIiwicmVtb3ZlUHJvcCIsImFkZENsYXNzIiwiam9pbiIsImZpbmQiLCJoaWRlIiwiZm9yRWFjaCIsImZpbCIsInNob3ciLCJ1cGRhdGVCb3VuZHMiLCJib3VuZDEiLCJib3VuZDIiLCJpbmQiLCJfbGF0IiwiX2xuZyIsInJlbW92ZUNsYXNzIiwiX3Zpc2libGUiLCJsZW5ndGgiLCJwb3B1bGF0ZUxpc3QiLCJoYXJkRmlsdGVycyIsImtleVNldCIsInNwbGl0IiwiJGV2ZW50TGlzdCIsIkVWRU5UU19EQVRBIiwibWFwIiwidG9Mb3dlckNhc2UiLCJpbmNsdWRlcyIsInJlbW92ZSIsImFwcGVuZCIsIk1hcE1hbmFnZXIiLCJMQU5HVUFHRSIsInJlbmRlckdlb2pzb24iLCJsaXN0IiwicmVuZGVyZWQiLCJpc05hTiIsInBhcnNlRmxvYXQiLCJzdWJzdHJpbmciLCJ0eXBlIiwiY29vcmRpbmF0ZXMiLCJwcm9wZXJ0aWVzIiwiZXZlbnRQcm9wZXJ0aWVzIiwicG9wdXBDb250ZW50IiwiYWNjZXNzVG9rZW4iLCJMIiwiZHJhZ2dpbmciLCJCcm93c2VyIiwibW9iaWxlIiwic2V0VmlldyIsInNjcm9sbFdoZWVsWm9vbSIsImRpc2FibGUiLCJvbk1vdmUiLCJldmVudCIsInN3IiwiZ2V0Qm91bmRzIiwiX3NvdXRoV2VzdCIsIm5lIiwiX25vcnRoRWFzdCIsImdldFpvb20iLCJ0aWxlTGF5ZXIiLCJhdHRyaWJ1dGlvbiIsImFkZFRvIiwiJG1hcCIsImNhbGxiYWNrIiwic2V0Qm91bmRzIiwiYm91bmRzMSIsImJvdW5kczIiLCJib3VuZHMiLCJmaXRCb3VuZHMiLCJzZXRDZW50ZXIiLCJjZW50ZXIiLCJ6b29tIiwiZ2V0Q2VudGVyQnlMb2NhdGlvbiIsInRyaWdnZXJab29tRW5kIiwiZmlyZUV2ZW50Iiwiem9vbU91dE9uY2UiLCJ6b29tT3V0Iiwiem9vbVVudGlsSGl0IiwiJHRoaXMiLCJpbnRlcnZhbEhhbmRsZXIiLCJzZXRJbnRlcnZhbCIsImNsZWFySW50ZXJ2YWwiLCJyZWZyZXNoTWFwIiwiaW52YWxpZGF0ZVNpemUiLCJmaWx0ZXJNYXAiLCJmaWx0ZXJzIiwicGxvdFBvaW50cyIsImdyb3VwcyIsImdlb2pzb24iLCJmZWF0dXJlcyIsImdlb0pTT04iLCJwb2ludFRvTGF5ZXIiLCJmZWF0dXJlIiwibGF0bG5nIiwiZXZlbnRUeXBlIiwic2x1Z2dlZCIsImljb25VcmwiLCJpY29udXJsIiwic21hbGxJY29uIiwiaWNvbiIsImljb25TaXplIiwiaWNvbkFuY2hvciIsImNsYXNzTmFtZSIsImdlb2pzb25NYXJrZXJPcHRpb25zIiwibWFya2VyIiwib25FYWNoRmVhdHVyZSIsImxheWVyIiwiYmluZFBvcHVwIiwidXBkYXRlIiwibGF0TG5nIiwidGFyZ2V0Rm9ybSIsInByZXZpb3VzIiwiZSIsInByZXZlbnREZWZhdWx0IiwiZm9ybSIsImRlcGFyYW0iLCJzZXJpYWxpemUiLCJoYXNoIiwicGFyYW0iLCJwYXJhbXMiLCJsb2MiLCJwcm9wIiwiZ2V0UGFyYW1ldGVycyIsInBhcmFtZXRlcnMiLCJ1cGRhdGVMb2NhdGlvbiIsImYiLCJiIiwiSlNPTiIsInN0cmluZ2lmeSIsInVwZGF0ZVZpZXdwb3J0QnlCb3VuZCIsInRyaWdnZXJTdWJtaXQiLCJhdXRvY29tcGxldGVNYW5hZ2VyIiwibWFwTWFuYWdlciIsIkRFRkFVTFRfSUNPTiIsInRvU3RyaW5nIiwicmVwbGFjZSIsInF1ZXJpZXMiLCJzZWFyY2giLCJncm91cCIsInBhcmVudCIsImNzcyIsImJ1aWxkRmlsdGVycyIsImVuYWJsZUhUTUwiLCJ0ZW1wbGF0ZXMiLCJidXR0b24iLCJsaSIsImRyb3BSaWdodCIsIm9uSW5pdGlhbGl6ZWQiLCJvbkRyb3Bkb3duU2hvdyIsInNldFRpbWVvdXQiLCJvbkRyb3Bkb3duSGlkZSIsIm9wdGlvbkxhYmVsIiwidW5lc2NhcGUiLCJodG1sIiwib3B0aW9uQ2xhc3MiLCJzZWxlY3RlZENsYXNzIiwiYnV0dG9uQ2xhc3MiLCJvbkNoYW5nZSIsIm9wdGlvbiIsImNoZWNrZWQiLCJzZWxlY3QiLCJxdWVyeU1hbmFnZXIiLCJpbml0UGFyYW1zIiwibGFuZ3VhZ2VNYW5hZ2VyIiwibGlzdE1hbmFnZXIiLCJpbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2siLCJyZXN1bHQiLCJ3aWR0aCIsImhlaWdodCIsInBhcnNlIiwiY29weSIsImNvcHlUZXh0IiwiZ2V0RWxlbWVudEJ5SWQiLCJleGVjQ29tbWFuZCIsIm9wdCIsImVtcHR5IiwidmFsdWVUZXh0IiwidHJhbnNsYXRpb24iLCJ0b2dnbGVDbGFzcyIsImtleUNvZGUiLCJfcXVlcnkiLCJvbGRVUkwiLCJvcmlnaW5hbEV2ZW50Iiwib2xkSGFzaCIsImxvZyIsIndoZW4iLCJ0aGVuIiwiZG9uZSIsImNhY2hlIiwiY29uc29sZSIsImNhbXBhaWduIiwicmVkdWNlIiwiZGljdCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7QUFDQSxJQUFNQSxzQkFBdUIsVUFBU0MsQ0FBVCxFQUFZO0FBQ3ZDOztBQUVBLFNBQU8sVUFBQ0MsTUFBRCxFQUFZOztBQUVqQixRQUFNQyxVQUFVLHlDQUFoQjtBQUNBLFFBQU1DLGFBQWEsT0FBT0YsTUFBUCxJQUFpQixRQUFqQixHQUE0QkcsU0FBU0MsYUFBVCxDQUF1QkosTUFBdkIsQ0FBNUIsR0FBNkRBLE1BQWhGO0FBQ0EsUUFBTUssV0FBV0MsY0FBakI7QUFDQSxRQUFJQyxX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QVFJLFVBRjRCO0FBR3BDcEMsa0JBQVFyRyxPQUFPc0MsV0FBUCxDQUFtQitELE1BQW5CLENBQTBCd0csTUFBMUIsQ0FBaUMsVUFBQ0MsSUFBRCxFQUFPbFEsSUFBUCxFQUFjO0FBQUVrUSxpQkFBS2xRLEtBQUs4RCxVQUFWLElBQXdCOUQsSUFBeEIsQ0FBOEIsT0FBT2tRLElBQVA7QUFBYyxXQUE3RixFQUErRixFQUEvRjtBQUg0QixTQUF4QztBQUtOO0FBQ01uUyxVQUFFSSxRQUFGLEVBQVlpRSxPQUFaLENBQW9CLHNCQUFwQixFQUE0Q3lKLFVBQTVDO0FBQ0E7O0FBRUE7QUFDQTBCLG1CQUFXLFlBQU07QUFDZixjQUFJcEosSUFBSWdLLGFBQWF2QyxhQUFiLEVBQVI7O0FBRUE3TixZQUFFSSxRQUFGLEVBQVlpRSxPQUFaLENBQW9CLG9CQUFwQixFQUEwQytCLENBQTFDO0FBQ0FwRyxZQUFFSSxRQUFGLEVBQVlpRSxPQUFaLENBQW9CLG9CQUFwQixFQUEwQytCLENBQTFDOztBQUVBcEcsWUFBRUksUUFBRixFQUFZaUUsT0FBWixDQUFvQiw0QkFBcEIsRUFBa0QrQixDQUFsRDtBQUNBcEcsWUFBRUksUUFBRixFQUFZaUUsT0FBWixDQUFvQiw4QkFBcEIsRUFBb0QrQixDQUFwRDtBQUVELFNBVEQsRUFTRyxHQVRIO0FBVUQ7QUE1Q0UsS0FBUDtBQThDQyxHQXBETDtBQXdERCxDQTFZRCxFQTBZRzNELE1BMVlIIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuLy9BUEkgOkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVxuY29uc3QgQXV0b2NvbXBsZXRlTWFuYWdlciA9IChmdW5jdGlvbigkKSB7XG4gIC8vSW5pdGlhbGl6YXRpb24uLi5cblxuICByZXR1cm4gKHRhcmdldCkgPT4ge1xuXG4gICAgY29uc3QgQVBJX0tFWSA9IFwiQUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXCI7XG4gICAgY29uc3QgdGFyZ2V0SXRlbSA9IHR5cGVvZiB0YXJnZXQgPT0gXCJzdHJpbmdcIiA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KSA6IHRhcmdldDtcbiAgICBjb25zdCBxdWVyeU1nciA9IFF1ZXJ5TWFuYWdlcigpO1xuICAgIHZhciBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICR0YXJnZXQ6ICQodGFyZ2V0SXRlbSksXG4gICAgICB0YXJnZXQ6IHRhcmdldEl0ZW0sXG4gICAgICBmb3JjZVNlYXJjaDogKHEpID0+IHtcbiAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IHEgfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuICAgICAgICAgIGlmIChyZXN1bHRzWzBdKSB7XG4gICAgICAgICAgICBsZXQgZ2VvbWV0cnkgPSByZXN1bHRzWzBdLmdlb21ldHJ5O1xuICAgICAgICAgICAgcXVlcnlNZ3IudXBkYXRlVmlld3BvcnQoZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgJCh0YXJnZXRJdGVtKS52YWwocmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHZhciBnZW9tZXRyeSA9IGRhdHVtLmdlb21ldHJ5O1xuICAgICAgICAgIC8vIHF1ZXJ5TWdyLnVwZGF0ZVZpZXdwb3J0KGdlb21ldHJ5LnZpZXdwb3J0KTtcblxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBpbml0aWFsaXplOiAoKSA9PiB7XG4gICAgICAgICQodGFyZ2V0SXRlbSkudHlwZWFoZWFkKHtcbiAgICAgICAgICAgICAgICAgICAgaGludDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBtaW5MZW5ndGg6IDQsXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICBtZW51OiAndHQtZHJvcGRvd24tbWVudSdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3NlYXJjaC1yZXN1bHRzJyxcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogKGl0ZW0pID0+IGl0ZW0uZm9ybWF0dGVkX2FkZHJlc3MsXG4gICAgICAgICAgICAgICAgICAgIGxpbWl0OiAxMCxcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiBmdW5jdGlvbiAocSwgc3luYywgYXN5bmMpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IHEgfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBhc3luYyhyZXN1bHRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKS5vbigndHlwZWFoZWFkOnNlbGVjdGVkJywgZnVuY3Rpb24gKG9iaiwgZGF0dW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoZGF0dW0pXG4gICAgICAgICAgICAgICAgICAgIHtcblxuICAgICAgICAgICAgICAgICAgICAgIHZhciBnZW9tZXRyeSA9IGRhdHVtLmdlb21ldHJ5O1xuICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5TWdyLnVwZGF0ZVZpZXdwb3J0KGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICAgICAgICAgICAvLyAgbWFwLmZpdEJvdW5kcyhnZW9tZXRyeS5ib3VuZHM/IGdlb21ldHJ5LmJvdW5kcyA6IGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuXG5cbiAgICByZXR1cm4ge1xuXG4gICAgfVxuICB9XG5cbn0oalF1ZXJ5KSk7XG4iLCJjb25zdCBIZWxwZXIgPSAoKCQpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVmU291cmNlOiAodXJsLCByZWYsIHNyYykgPT4ge1xuICAgICAgICAvLyBKdW4gMTMgMjAxOCDigJQgRml4IGZvciBzb3VyY2UgYW5kIHJlZmVycmVyXG4gICAgICAgIGlmIChyZWYgJiYgc3JjKSB7XG4gICAgICAgICAgaWYgKHVybC5pbmRleE9mKFwiP1wiKSA+PSAwKSB7XG4gICAgICAgICAgICB1cmwgPSBgJHt1cmx9JnJlZmVycmVyPSR7cmVmfSZzb3VyY2U9JHtzcmN9YDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXJsID0gYCR7dXJsfT9yZWZlcnJlcj0ke3JlZn0mc291cmNlPSR7c3JjfWA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgIH1cbiAgICB9O1xufSkoalF1ZXJ5KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTGFuZ3VhZ2VNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIC8va2V5VmFsdWVcblxuICAvL3RhcmdldHMgYXJlIHRoZSBtYXBwaW5ncyBmb3IgdGhlIGxhbmd1YWdlXG4gIHJldHVybiAoKSA9PiB7XG4gICAgbGV0IGxhbmd1YWdlO1xuICAgIGxldCBkaWN0aW9uYXJ5ID0ge307XG4gICAgbGV0ICR0YXJnZXRzID0gJChcIltkYXRhLWxhbmctdGFyZ2V0XVtkYXRhLWxhbmcta2V5XVwiKTtcblxuICAgIGNvbnN0IHVwZGF0ZVBhZ2VMYW5ndWFnZSA9ICgpID0+IHtcblxuICAgICAgbGV0IHRhcmdldExhbmd1YWdlID0gZGljdGlvbmFyeS5yb3dzLmZpbHRlcigoaSkgPT4gaS5sYW5nID09PSBsYW5ndWFnZSlbMF07XG5cbiAgICAgICR0YXJnZXRzLmVhY2goKGluZGV4LCBpdGVtKSA9PiB7XG5cbiAgICAgICAgbGV0IHRhcmdldEF0dHJpYnV0ZSA9ICQoaXRlbSkuZGF0YSgnbGFuZy10YXJnZXQnKTtcbiAgICAgICAgbGV0IGxhbmdUYXJnZXQgPSAkKGl0ZW0pLmRhdGEoJ2xhbmcta2V5Jyk7XG5cblxuXG5cbiAgICAgICAgc3dpdGNoKHRhcmdldEF0dHJpYnV0ZSkge1xuICAgICAgICAgIGNhc2UgJ3RleHQnOlxuXG4gICAgICAgICAgICAkKChgW2RhdGEtbGFuZy1rZXk9XCIke2xhbmdUYXJnZXR9XCJdYCkpLnRleHQodGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgaWYgKGxhbmdUYXJnZXQgPT0gXCJtb3JlLXNlYXJjaC1vcHRpb25zXCIpIHtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAndmFsdWUnOlxuICAgICAgICAgICAgJChpdGVtKS52YWwodGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICQoaXRlbSkuYXR0cih0YXJnZXRBdHRyaWJ1dGUsIHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgbGFuZ3VhZ2UsXG4gICAgICB0YXJnZXRzOiAkdGFyZ2V0cyxcbiAgICAgIGRpY3Rpb25hcnksXG4gICAgICBpbml0aWFsaXplOiAobGFuZykgPT4ge1xuXG4gICAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICAgIC8vIHVybDogJ2h0dHBzOi8vZ3N4Mmpzb24uY29tL2FwaT9pZD0xTzNlQnlqTDF2bFlmN1o3YW0tX2h0UlRRaTczUGFmcUlmTkJkTG1YZThTTSZzaGVldD0xJyxcbiAgICAgICAgICB1cmw6ICcvZGF0YS9sYW5nLmpzb24nLFxuICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgc3VjY2VzczogKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGRpY3Rpb25hcnkgPSBkYXRhO1xuICAgICAgICAgICAgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgICAgICAgICAgdXBkYXRlUGFnZUxhbmd1YWdlKCk7XG5cbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtbG9hZGVkJyk7XG5cbiAgICAgICAgICAgICQoXCIjbGFuZ3VhZ2Utb3B0c1wiKS5tdWx0aXNlbGVjdCgnc2VsZWN0JywgbGFuZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICByZWZyZXNoOiAoKSA9PiB7XG4gICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZShsYW5ndWFnZSk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTGFuZ3VhZ2U6IChsYW5nKSA9PiB7XG5cbiAgICAgICAgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UoKTtcbiAgICAgIH0sXG4gICAgICBnZXRUcmFuc2xhdGlvbjogKGtleSkgPT4ge1xuICAgICAgICBsZXQgdGFyZ2V0TGFuZ3VhZ2UgPSBkaWN0aW9uYXJ5LnJvd3MuZmlsdGVyKChpKSA9PiBpLmxhbmcgPT09IGxhbmd1YWdlKVswXTtcbiAgICAgICAgcmV0dXJuIHRhcmdldExhbmd1YWdlW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG59KShqUXVlcnkpO1xuIiwiLyogVGhpcyBsb2FkcyBhbmQgbWFuYWdlcyB0aGUgbGlzdCEgKi9cblxuY29uc3QgTGlzdE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuIChvcHRpb25zKSA9PiB7XG4gICAgbGV0IHRhcmdldExpc3QgPSBvcHRpb25zLnRhcmdldExpc3QgfHwgXCIjZXZlbnRzLWxpc3RcIjtcbiAgICAvLyBKdW5lIDEzIGAxOCDigJMgcmVmZXJyZXIgYW5kIHNvdXJjZVxuICAgIGxldCB7cmVmZXJyZXIsIHNvdXJjZX0gPSBvcHRpb25zO1xuXG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRMaXN0ID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0TGlzdCkgOiB0YXJnZXRMaXN0O1xuXG4gICAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSwgcmVmZXJyZXIgPSBudWxsLCBzb3VyY2UgPSBudWxsKSA9PiB7XG4gICAgICB2YXIgZGF0ZSA9IG1vbWVudChpdGVtLnN0YXJ0X2RhdGV0aW1lKS5mb3JtYXQoXCJkZGRkIE1NTSBERCwgaDptbWFcIik7XG4gICAgICBsZXQgdXJsID0gaXRlbS51cmwubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS51cmwgOiBcIi8vXCIgKyBpdGVtLnVybDtcbiAgICAgIC8vIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICAgIHVybCA9IEhlbHBlci5yZWZTb3VyY2UodXJsLCByZWZlcnJlciwgc291cmNlKTtcblxuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaSBjbGFzcz0nJHt3aW5kb3cuc2x1Z2lmeShpdGVtLmV2ZW50X3R5cGUpfSBldmVudHMgZXZlbnQtb2JqJyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50IHR5cGUtYWN0aW9uXCI+XG4gICAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgICAgPGxpIGNsYXNzPSd0YWctJHtpdGVtLmV2ZW50X3R5cGV9IHRhZyc+JHtpdGVtLmV2ZW50X3R5cGV9PC9saT5cbiAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDxoMiBjbGFzcz1cImV2ZW50LXRpdGxlXCI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWRhdGUgZGF0ZVwiPiR7ZGF0ZX08L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtYWRkcmVzcyBhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICAgIDxwPiR7aXRlbS52ZW51ZX08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5SU1ZQPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIGNvbnN0IHJlbmRlckdyb3VwID0gKGl0ZW0sIHJlZmVycmVyID0gbnVsbCwgc291cmNlID0gbnVsbCkgPT4ge1xuICAgICAgbGV0IHVybCA9IGl0ZW0ud2Vic2l0ZS5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLndlYnNpdGUgOiBcIi8vXCIgKyBpdGVtLndlYnNpdGU7XG4gICAgICBsZXQgc3VwZXJHcm91cCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG5cbiAgICAgIHVybCA9IEhlbHBlci5yZWZTb3VyY2UodXJsLCByZWZlcnJlciwgc291cmNlKTtcblxuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaSBjbGFzcz0nJHtpdGVtLmV2ZW50X3R5cGV9ICR7c3VwZXJHcm91cH0gZ3JvdXAtb2JqJyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwIGdyb3VwLW9ialwiPlxuICAgICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctJHtpdGVtLnN1cGVyZ3JvdXB9XCI+JHtpdGVtLnN1cGVyZ3JvdXB9PC9saT5cbiAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDxoMj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS5uYW1lfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1sb2NhdGlvbiBsb2NhdGlvblwiPiR7aXRlbS5sb2NhdGlvbn08L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXNjcmlwdGlvblwiPlxuICAgICAgICAgICAgICA8cD4ke2l0ZW0uZGVzY3JpcHRpb259PC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICRsaXN0OiAkdGFyZ2V0LFxuICAgICAgdXBkYXRlRmlsdGVyOiAocCkgPT4ge1xuICAgICAgICBpZighcCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIFJlbW92ZSBGaWx0ZXJzXG5cbiAgICAgICAgJHRhcmdldC5yZW1vdmVQcm9wKFwiY2xhc3NcIik7XG4gICAgICAgICR0YXJnZXQuYWRkQ2xhc3MocC5maWx0ZXIgPyBwLmZpbHRlci5qb2luKFwiIFwiKSA6ICcnKVxuXG4gICAgICAgICR0YXJnZXQuZmluZCgnbGknKS5oaWRlKCk7XG5cbiAgICAgICAgaWYgKHAuZmlsdGVyKSB7XG4gICAgICAgICAgcC5maWx0ZXIuZm9yRWFjaCgoZmlsKT0+e1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKGBsaS4ke2ZpbH1gKS5zaG93KCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHVwZGF0ZUJvdW5kczogKGJvdW5kMSwgYm91bmQyKSA9PiB7XG5cbiAgICAgICAgLy8gY29uc3QgYm91bmRzID0gW3AuYm91bmRzMSwgcC5ib3VuZHMyXTtcblxuXG4gICAgICAgICR0YXJnZXQuZmluZCgndWwgbGkuZXZlbnQtb2JqLCB1bCBsaS5ncm91cC1vYmonKS5lYWNoKChpbmQsIGl0ZW0pPT4ge1xuXG4gICAgICAgICAgbGV0IF9sYXQgPSAkKGl0ZW0pLmRhdGEoJ2xhdCcpLFxuICAgICAgICAgICAgICBfbG5nID0gJChpdGVtKS5kYXRhKCdsbmcnKTtcblxuXG4gICAgICAgICAgaWYgKGJvdW5kMVswXSA8PSBfbGF0ICYmIGJvdW5kMlswXSA+PSBfbGF0ICYmIGJvdW5kMVsxXSA8PSBfbG5nICYmIGJvdW5kMlsxXSA+PSBfbG5nKSB7XG5cbiAgICAgICAgICAgICQoaXRlbSkuYWRkQ2xhc3MoJ3dpdGhpbi1ib3VuZCcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKGl0ZW0pLnJlbW92ZUNsYXNzKCd3aXRoaW4tYm91bmQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBfdmlzaWJsZSA9ICR0YXJnZXQuZmluZCgndWwgbGkuZXZlbnQtb2JqLndpdGhpbi1ib3VuZCwgdWwgbGkuZ3JvdXAtb2JqLndpdGhpbi1ib3VuZCcpLmxlbmd0aDtcbiAgICAgICAgaWYgKF92aXNpYmxlID09IDApIHtcbiAgICAgICAgICAvLyBUaGUgbGlzdCBpcyBlbXB0eVxuICAgICAgICAgICR0YXJnZXQuYWRkQ2xhc3MoXCJpcy1lbXB0eVwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkdGFyZ2V0LnJlbW92ZUNsYXNzKFwiaXMtZW1wdHlcIik7XG4gICAgICAgIH1cblxuICAgICAgfSxcbiAgICAgIHBvcHVsYXRlTGlzdDogKGhhcmRGaWx0ZXJzKSA9PiB7XG4gICAgICAgIC8vdXNpbmcgd2luZG93LkVWRU5UX0RBVEFcbiAgICAgICAgY29uc3Qga2V5U2V0ID0gIWhhcmRGaWx0ZXJzLmtleSA/IFtdIDogaGFyZEZpbHRlcnMua2V5LnNwbGl0KCcsJyk7XG5cbiAgICAgICAgdmFyICRldmVudExpc3QgPSB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YS5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgaWYgKGtleVNldC5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0uZXZlbnRfdHlwZSAmJiBpdGVtLmV2ZW50X3R5cGUudG9Mb3dlckNhc2UoKSA9PSAnZ3JvdXAnID8gcmVuZGVyR3JvdXAoaXRlbSkgOiByZW5kZXJFdmVudChpdGVtLCByZWZlcnJlciwgc291cmNlKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtleVNldC5sZW5ndGggPiAwICYmIGl0ZW0uZXZlbnRfdHlwZSAhPSAnZ3JvdXAnICYmIGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyRXZlbnQoaXRlbSwgcmVmZXJyZXIsIHNvdXJjZSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXlTZXQubGVuZ3RoID4gMCAmJiBpdGVtLmV2ZW50X3R5cGUgPT0gJ2dyb3VwJyAmJiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5zdXBlcmdyb3VwKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlbmRlckdyb3VwKGl0ZW0sIHJlZmVycmVyLCBzb3VyY2UpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgfSlcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCBsaScpLnJlbW92ZSgpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsJykuYXBwZW5kKCRldmVudExpc3QpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJcblxuY29uc3QgTWFwTWFuYWdlciA9ICgoJCkgPT4ge1xuICBsZXQgTEFOR1VBR0UgPSAnZW4nO1xuXG4gIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0sIHJlZmVycmVyID0gbnVsbCwgc291cmNlID0gbnVsbCkgPT4ge1xuICAgIHZhciBkYXRlID0gbW9tZW50KGl0ZW0uc3RhcnRfZGF0ZXRpbWUpLmZvcm1hdChcImRkZGQgTU1NIERELCBoOm1tYVwiKTtcbiAgICBsZXQgdXJsID0gaXRlbS51cmwubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS51cmwgOiBcIi8vXCIgKyBpdGVtLnVybDtcblxuICAgIHVybCA9IEhlbHBlci5yZWZTb3VyY2UodXJsLCByZWZlcnJlciwgc291cmNlKTtcblxuICAgIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9J3BvcHVwLWl0ZW0gJHtpdGVtLmV2ZW50X3R5cGV9ICR7c3VwZXJHcm91cH0nIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5ldmVudF90eXBlfVwiPiR7aXRlbS5ldmVudF90eXBlIHx8ICdBY3Rpb24nfTwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxoMiBjbGFzcz1cImV2ZW50LXRpdGxlXCI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1kYXRlXCI+JHtkYXRlfTwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtYWRkcmVzcyBhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+UlNWUDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSwgcmVmZXJyZXIgPSBudWxsLCBzb3VyY2UgPSBudWxsKSA9PiB7XG5cbiAgICBsZXQgdXJsID0gaXRlbS53ZWJzaXRlLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0ud2Vic2l0ZSA6IFwiLy9cIiArIGl0ZW0ud2Vic2l0ZTtcblxuICAgIHVybCA9IEhlbHBlci5yZWZTb3VyY2UodXJsLCByZWZlcnJlciwgc291cmNlKTtcblxuICAgIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICByZXR1cm4gYFxuICAgIDxsaT5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwIGdyb3VwLW9iaiAke3N1cGVyR3JvdXB9XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5zdXBlcmdyb3VwfSAke3N1cGVyR3JvdXB9XCI+JHtpdGVtLnN1cGVyZ3JvdXB9PC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWhlYWRlclwiPlxuICAgICAgICAgIDxoMj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS5uYW1lfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1sb2NhdGlvbiBsb2NhdGlvblwiPiR7aXRlbS5sb2NhdGlvbn08L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGVzY3JpcHRpb25cIj5cbiAgICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9saT5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR2VvanNvbiA9IChsaXN0LCByZWYgPSBudWxsLCBzcmMgPSBudWxsKSA9PiB7XG4gICAgcmV0dXJuIGxpc3QubWFwKChpdGVtKSA9PiB7XG4gICAgICAvLyByZW5kZXJlZCBldmVudFR5cGVcbiAgICAgIGxldCByZW5kZXJlZDtcblxuICAgICAgaWYgKGl0ZW0uZXZlbnRfdHlwZSAmJiBpdGVtLmV2ZW50X3R5cGUudG9Mb3dlckNhc2UoKSA9PSAnZ3JvdXAnKSB7XG4gICAgICAgIHJlbmRlcmVkID0gcmVuZGVyR3JvdXAoaXRlbSwgcmVmLCBzcmMpO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZW5kZXJlZCA9IHJlbmRlckV2ZW50KGl0ZW0sIHJlZiwgc3JjKTtcbiAgICAgIH1cblxuICAgICAgLy8gZm9ybWF0IGNoZWNrXG4gICAgICBpZiAoaXNOYU4ocGFyc2VGbG9hdChwYXJzZUZsb2F0KGl0ZW0ubG5nKSkpKSB7XG4gICAgICAgIGl0ZW0ubG5nID0gaXRlbS5sbmcuc3Vic3RyaW5nKDEpXG4gICAgICB9XG4gICAgICBpZiAoaXNOYU4ocGFyc2VGbG9hdChwYXJzZUZsb2F0KGl0ZW0ubGF0KSkpKSB7XG4gICAgICAgIGl0ZW0ubGF0ID0gaXRlbS5sYXQuc3Vic3RyaW5nKDEpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICB0eXBlOiBcIlBvaW50XCIsXG4gICAgICAgICAgY29vcmRpbmF0ZXM6IFtpdGVtLmxuZywgaXRlbS5sYXRdXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBldmVudFByb3BlcnRpZXM6IGl0ZW0sXG4gICAgICAgICAgcG9wdXBDb250ZW50OiByZW5kZXJlZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAob3B0aW9ucykgPT4ge1xuICAgIHZhciBhY2Nlc3NUb2tlbiA9ICdway5leUoxSWpvaWJXRjBkR2hsZHpNMU1DSXNJbUVpT2lKYVRWRk1Va1V3SW4wLndjTTNYYzhCR0M2UE0tT3lyd2puaGcnO1xuICAgIHZhciBtYXAgPSBMLm1hcCgnbWFwJywgeyBkcmFnZ2luZzogIUwuQnJvd3Nlci5tb2JpbGUgfSkuc2V0VmlldyhbMzQuODg1OTMwOTQwNzUzMTcsIDUuMDk3NjU2MjUwMDAwMDAxXSwgMik7XG5cbiAgICBsZXQge3JlZmVycmVyLCBzb3VyY2V9ID0gb3B0aW9ucztcblxuICAgIGlmICghTC5Ccm93c2VyLm1vYmlsZSkge1xuICAgICAgbWFwLnNjcm9sbFdoZWVsWm9vbS5kaXNhYmxlKCk7XG4gICAgfVxuXG4gICAgTEFOR1VBR0UgPSBvcHRpb25zLmxhbmcgfHwgJ2VuJztcblxuICAgIGlmIChvcHRpb25zLm9uTW92ZSkge1xuICAgICAgbWFwLm9uKCdkcmFnZW5kJywgKGV2ZW50KSA9PiB7XG5cblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuICAgICAgICBvcHRpb25zLm9uTW92ZShzdywgbmUpO1xuICAgICAgfSkub24oJ3pvb21lbmQnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKG1hcC5nZXRab29tKCkgPD0gNCkge1xuICAgICAgICAgICQoXCIjbWFwXCIpLmFkZENsYXNzKFwiem9vbWVkLW91dFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkKFwiI21hcFwiKS5yZW1vdmVDbGFzcyhcInpvb21lZC1vdXRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuICAgICAgICBvcHRpb25zLm9uTW92ZShzdywgbmUpO1xuICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBtYXAuZmlyZUV2ZW50KCd6b29tZW5kJyk7XG5cbiAgICBMLnRpbGVMYXllcignaHR0cHM6Ly9hcGkubWFwYm94LmNvbS9zdHlsZXMvdjEvbWF0dGhldzM1MC9jamE0MXRpamsyN2Q2MnJxb2Q3ZzBseDRiL3RpbGVzLzI1Ni97en0ve3h9L3t5fT9hY2Nlc3NfdG9rZW49JyArIGFjY2Vzc1Rva2VuLCB7XG4gICAgICAgIGF0dHJpYnV0aW9uOiAnJmNvcHk7IDxhIGhyZWY9XCJodHRwOi8vb3NtLm9yZy9jb3B5cmlnaHRcIj5PcGVuU3RyZWV0TWFwPC9hPiBjb250cmlidXRvcnMg4oCiIDxhIGhyZWY9XCIvLzM1MC5vcmdcIj4zNTAub3JnPC9hPidcbiAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgbGV0IGdlb2NvZGVyID0gbnVsbDtcbiAgICByZXR1cm4ge1xuICAgICAgJG1hcDogbWFwLFxuICAgICAgaW5pdGlhbGl6ZTogKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG4gICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBzZXRCb3VuZHM6IChib3VuZHMxLCBib3VuZHMyKSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW2JvdW5kczEsIGJvdW5kczJdO1xuICAgICAgICBtYXAuZml0Qm91bmRzKGJvdW5kcyk7XG4gICAgICB9LFxuICAgICAgc2V0Q2VudGVyOiAoY2VudGVyLCB6b29tID0gMTApID0+IHtcbiAgICAgICAgaWYgKCFjZW50ZXIgfHwgIWNlbnRlclswXSB8fCBjZW50ZXJbMF0gPT0gXCJcIlxuICAgICAgICAgICAgICB8fCAhY2VudGVyWzFdIHx8IGNlbnRlclsxXSA9PSBcIlwiKSByZXR1cm47XG4gICAgICAgIG1hcC5zZXRWaWV3KGNlbnRlciwgem9vbSk7XG4gICAgICB9LFxuICAgICAgZ2V0Qm91bmRzOiAoKSA9PiB7XG5cbiAgICAgICAgbGV0IHN3ID0gW21hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW21hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubG5nXTtcblxuICAgICAgICByZXR1cm4gW3N3LCBuZV07XG4gICAgICB9LFxuICAgICAgLy8gQ2VudGVyIGxvY2F0aW9uIGJ5IGdlb2NvZGVkXG4gICAgICBnZXRDZW50ZXJCeUxvY2F0aW9uOiAobG9jYXRpb24sIGNhbGxiYWNrKSA9PiB7XG5cbiAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IGxvY2F0aW9uIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcblxuICAgICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlc3VsdHNbMF0pXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyWm9vbUVuZDogKCkgPT4ge1xuICAgICAgICBtYXAuZmlyZUV2ZW50KCd6b29tZW5kJyk7XG4gICAgICB9LFxuICAgICAgem9vbU91dE9uY2U6ICgpID0+IHtcbiAgICAgICAgbWFwLnpvb21PdXQoMSk7XG4gICAgICB9LFxuICAgICAgem9vbVVudGlsSGl0OiAoKSA9PiB7XG4gICAgICAgIHZhciAkdGhpcyA9IHRoaXM7XG4gICAgICAgIG1hcC56b29tT3V0KDEpO1xuICAgICAgICBsZXQgaW50ZXJ2YWxIYW5kbGVyID0gbnVsbDtcbiAgICAgICAgaW50ZXJ2YWxIYW5kbGVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgIHZhciBfdmlzaWJsZSA9ICQoZG9jdW1lbnQpLmZpbmQoJ3VsIGxpLmV2ZW50LW9iai53aXRoaW4tYm91bmQsIHVsIGxpLmdyb3VwLW9iai53aXRoaW4tYm91bmQnKS5sZW5ndGg7XG4gICAgICAgICAgaWYgKF92aXNpYmxlID09IDApIHtcbiAgICAgICAgICAgIG1hcC56b29tT3V0KDEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSGFuZGxlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAyMDApO1xuICAgICAgfSxcbiAgICAgIHJlZnJlc2hNYXA6ICgpID0+IHtcbiAgICAgICAgbWFwLmludmFsaWRhdGVTaXplKGZhbHNlKTtcbiAgICAgICAgLy8gbWFwLl9vblJlc2l6ZSgpO1xuICAgICAgICAvLyBtYXAuZmlyZUV2ZW50KCd6b29tZW5kJyk7XG5cblxuICAgICAgfSxcbiAgICAgIGZpbHRlck1hcDogKGZpbHRlcnMpID0+IHtcblxuICAgICAgICAkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXBcIikuaGlkZSgpO1xuXG5cbiAgICAgICAgaWYgKCFmaWx0ZXJzKSByZXR1cm47XG5cbiAgICAgICAgZmlsdGVycy5mb3JFYWNoKChpdGVtKSA9PiB7XG5cbiAgICAgICAgICAkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXAuXCIgKyBpdGVtLnRvTG93ZXJDYXNlKCkpLnNob3coKTtcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICBwbG90UG9pbnRzOiAobGlzdCwgaGFyZEZpbHRlcnMsIGdyb3VwcykgPT4ge1xuICAgICAgICBjb25zdCBrZXlTZXQgPSAhaGFyZEZpbHRlcnMua2V5ID8gW10gOiBoYXJkRmlsdGVycy5rZXkuc3BsaXQoJywnKTtcblxuICAgICAgICBpZiAoa2V5U2V0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsaXN0ID0gbGlzdC5maWx0ZXIoKGl0ZW0pID0+IGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKVxuICAgICAgICB9XG5cblxuICAgICAgICBjb25zdCBnZW9qc29uID0ge1xuICAgICAgICAgIHR5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgICAgICAgICBmZWF0dXJlczogcmVuZGVyR2VvanNvbihsaXN0LCByZWZlcnJlciwgc291cmNlKVxuICAgICAgICB9O1xuXG5cbiAgICAgICAgTC5nZW9KU09OKGdlb2pzb24sIHtcbiAgICAgICAgICAgIHBvaW50VG9MYXllcjogKGZlYXR1cmUsIGxhdGxuZykgPT4ge1xuICAgICAgICAgICAgICAvLyBJY29ucyBmb3IgbWFya2Vyc1xuICAgICAgICAgICAgICBjb25zdCBldmVudFR5cGUgPSBmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLmV2ZW50X3R5cGU7XG5cbiAgICAgICAgICAgICAgLy8gSWYgbm8gc3VwZXJncm91cCwgaXQncyBhbiBldmVudC5cbiAgICAgICAgICAgICAgY29uc3Qgc3VwZXJncm91cCA9IGdyb3Vwc1tmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLnN1cGVyZ3JvdXBdID8gZmVhdHVyZS5wcm9wZXJ0aWVzLmV2ZW50UHJvcGVydGllcy5zdXBlcmdyb3VwIDogXCJFdmVudHNcIjtcbiAgICAgICAgICAgICAgY29uc3Qgc2x1Z2dlZCA9IHdpbmRvdy5zbHVnaWZ5KHN1cGVyZ3JvdXApO1xuICAgICAgICAgICAgICBjb25zdCBpY29uVXJsID0gZ3JvdXBzW3N1cGVyZ3JvdXBdID8gZ3JvdXBzW3N1cGVyZ3JvdXBdLmljb251cmwgfHwgXCIvaW1nL2V2ZW50LnBuZ1wiICA6IFwiL2ltZy9ldmVudC5wbmdcIiA7XG5cbiAgICAgICAgICAgICAgY29uc3Qgc21hbGxJY29uID0gIEwuaWNvbih7XG4gICAgICAgICAgICAgICAgaWNvblVybDogaWNvblVybCxcbiAgICAgICAgICAgICAgICBpY29uU2l6ZTogWzE4LCAxOF0sXG4gICAgICAgICAgICAgICAgaWNvbkFuY2hvcjogWzksIDldLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogc2x1Z2dlZCArICcgZXZlbnQtaXRlbS1wb3B1cCdcbiAgICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgICB2YXIgZ2VvanNvbk1hcmtlck9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgaWNvbjogc21hbGxJY29uLFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICByZXR1cm4gTC5tYXJrZXIobGF0bG5nLCBnZW9qc29uTWFya2VyT3B0aW9ucyk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgb25FYWNoRmVhdHVyZTogKGZlYXR1cmUsIGxheWVyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZmVhdHVyZS5wcm9wZXJ0aWVzICYmIGZlYXR1cmUucHJvcGVydGllcy5wb3B1cENvbnRlbnQpIHtcbiAgICAgICAgICAgICAgbGF5ZXIuYmluZFBvcHVwKGZlYXR1cmUucHJvcGVydGllcy5wb3B1cENvbnRlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSkuYWRkVG8obWFwKTtcblxuICAgICAgfSxcbiAgICAgIHVwZGF0ZTogKHApID0+IHtcbiAgICAgICAgaWYgKCFwIHx8ICFwLmxhdCB8fCAhcC5sbmcgKSByZXR1cm47XG5cbiAgICAgICAgbWFwLnNldFZpZXcoTC5sYXRMbmcocC5sYXQsIHAubG5nKSwgMTApO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJjb25zdCBRdWVyeU1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRGb3JtID0gXCJmb3JtI2ZpbHRlcnMtZm9ybVwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRGb3JtID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0Rm9ybSkgOiB0YXJnZXRGb3JtO1xuICAgIGxldCBsYXQgPSBudWxsO1xuICAgIGxldCBsbmcgPSBudWxsO1xuXG4gICAgbGV0IHByZXZpb3VzID0ge307XG5cbiAgICAkdGFyZ2V0Lm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgbGF0ID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbCgpO1xuICAgICAgbG5nID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbCgpO1xuXG4gICAgICB2YXIgZm9ybSA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcblxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAkLnBhcmFtKGZvcm0pO1xuICAgIH0pXG5cbiAgICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJ3NlbGVjdCNmaWx0ZXItaXRlbXMnLCAoKSA9PiB7XG4gICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgIH0pXG5cblxuICAgIHJldHVybiB7XG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgcGFyYW1zID0gJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSlcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhbmddXCIpLnZhbChwYXJhbXMubGFuZyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChwYXJhbXMubGF0KTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKHBhcmFtcy5sbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwocGFyYW1zLmJvdW5kMSk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChwYXJhbXMuYm91bmQyKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxvY11cIikudmFsKHBhcmFtcy5sb2MpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9a2V5XVwiKS52YWwocGFyYW1zLmtleSk7XG5cbiAgICAgICAgICBpZiAocGFyYW1zLmZpbHRlcikge1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiI2ZpbHRlci1pdGVtcyBvcHRpb25cIikucmVtb3ZlUHJvcChcInNlbGVjdGVkXCIpO1xuICAgICAgICAgICAgcGFyYW1zLmZpbHRlci5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIjZmlsdGVyLWl0ZW1zIG9wdGlvblt2YWx1ZT0nXCIgKyBpdGVtICsgXCInXVwiKS5wcm9wKFwic2VsZWN0ZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGdldFBhcmFtZXRlcnM6ICgpID0+IHtcbiAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG4gICAgICAgIC8vIHBhcmFtZXRlcnNbJ2xvY2F0aW9uJ10gO1xuXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHBhcmFtZXRlcnMpIHtcbiAgICAgICAgICBpZiAoICFwYXJhbWV0ZXJzW2tleV0gfHwgcGFyYW1ldGVyc1trZXldID09IFwiXCIpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBwYXJhbWV0ZXJzW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtZXRlcnM7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTG9jYXRpb246IChsYXQsIGxuZykgPT4ge1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKGxhdCk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwobG5nKTtcbiAgICAgICAgLy8gJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVWaWV3cG9ydDogKHZpZXdwb3J0KSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW1t2aWV3cG9ydC5mLmIsIHZpZXdwb3J0LmIuYl0sIFt2aWV3cG9ydC5mLmYsIHZpZXdwb3J0LmIuZl1dO1xuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlVmlld3BvcnRCeUJvdW5kOiAoc3csIG5lKSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW3N3LCBuZV07Ly8vLy8vLy9cblxuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdHJpZ2dlclN1Ym1pdDogKCkgPT4ge1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSkoalF1ZXJ5KTtcbiIsImxldCBhdXRvY29tcGxldGVNYW5hZ2VyO1xubGV0IG1hcE1hbmFnZXI7XG5cbndpbmRvdy5ERUZBVUxUX0lDT04gPSBcIi9pbWcvZXZlbnQucG5nXCI7XG53aW5kb3cuc2x1Z2lmeSA9ICh0ZXh0KSA9PiAhdGV4dCA/IHRleHQgOiB0ZXh0LnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHMrL2csICctJykgICAgICAgICAgIC8vIFJlcGxhY2Ugc3BhY2VzIHdpdGggLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9bXlxcd1xcLV0rL2csICcnKSAgICAgICAvLyBSZW1vdmUgYWxsIG5vbi13b3JkIGNoYXJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcLVxcLSsvZywgJy0nKSAgICAgICAgIC8vIFJlcGxhY2UgbXVsdGlwbGUgLSB3aXRoIHNpbmdsZSAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL14tKy8sICcnKSAgICAgICAgICAgICAvLyBUcmltIC0gZnJvbSBzdGFydCBvZiB0ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLy0rJC8sICcnKTsgICAgICAgICAgICAvLyBUcmltIC0gZnJvbSBlbmQgb2YgdGV4dFxuKGZ1bmN0aW9uKCQpIHtcbiAgLy8gTG9hZCB0aGluZ3NcblxuICB3aW5kb3cucXVlcmllcyA9ICAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHJpbmcoMSkpO1xuXG4gIGlmICh3aW5kb3cucXVlcmllcy5ncm91cCkge1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5wYXJlbnQoKS5jc3MoXCJvcGFjaXR5XCIsIFwiMFwiKTtcbiAgfVxuICBjb25zdCBidWlsZEZpbHRlcnMgPSAoKSA9PiB7JCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KHtcbiAgICAgIGVuYWJsZUhUTUw6IHRydWUsXG4gICAgICB0ZW1wbGF0ZXM6IHtcbiAgICAgICAgYnV0dG9uOiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJtdWx0aXNlbGVjdCBkcm9wZG93bi10b2dnbGVcIiBkYXRhLXRvZ2dsZT1cImRyb3Bkb3duXCI+PHNwYW4gZGF0YS1sYW5nLXRhcmdldD1cInRleHRcIiBkYXRhLWxhbmcta2V5PVwibW9yZS1zZWFyY2gtb3B0aW9uc1wiPjwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJmYSBmYS1jYXJldC1kb3duXCI+PC9zcGFuPjwvYnV0dG9uPicsXG4gICAgICAgIGxpOiAnPGxpPjxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCI+PGxhYmVsPjwvbGFiZWw+PC9hPjwvbGk+J1xuICAgICAgfSxcbiAgICAgIGRyb3BSaWdodDogdHJ1ZSxcbiAgICAgIG9uSW5pdGlhbGl6ZWQ6ICgpID0+IHtcblxuICAgICAgfSxcbiAgICAgIG9uRHJvcGRvd25TaG93OiAoKSA9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJtb2JpbGUtdXBkYXRlLW1hcC1oZWlnaHRcIik7XG4gICAgICAgIH0sIDEwKTtcblxuICAgICAgfSxcbiAgICAgIG9uRHJvcGRvd25IaWRlOiAoKSA9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJtb2JpbGUtdXBkYXRlLW1hcC1oZWlnaHRcIik7XG4gICAgICAgIH0sIDEwKTtcbiAgICAgIH0sXG4gICAgICBvcHRpb25MYWJlbDogKGUpID0+IHtcbiAgICAgICAgLy8gbGV0IGVsID0gJCggJzxkaXY+PC9kaXY+JyApO1xuICAgICAgICAvLyBlbC5hcHBlbmQoKCkgKyBcIlwiKTtcblxuICAgICAgICByZXR1cm4gdW5lc2NhcGUoJChlKS5hdHRyKCdsYWJlbCcpKSB8fCAkKGUpLmh0bWwoKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH07XG4gIGJ1aWxkRmlsdGVycygpO1xuXG5cbiAgJCgnc2VsZWN0I2xhbmd1YWdlLW9wdHMnKS5tdWx0aXNlbGVjdCh7XG4gICAgZW5hYmxlSFRNTDogdHJ1ZSxcbiAgICBvcHRpb25DbGFzczogKCkgPT4gJ2xhbmctb3B0JyxcbiAgICBzZWxlY3RlZENsYXNzOiAoKSA9PiAnbGFuZy1zZWwnLFxuICAgIGJ1dHRvbkNsYXNzOiAoKSA9PiAnbGFuZy1idXQnLFxuICAgIGRyb3BSaWdodDogdHJ1ZSxcbiAgICBvcHRpb25MYWJlbDogKGUpID0+IHtcbiAgICAgIC8vIGxldCBlbCA9ICQoICc8ZGl2PjwvZGl2PicgKTtcbiAgICAgIC8vIGVsLmFwcGVuZCgoKSArIFwiXCIpO1xuXG4gICAgICByZXR1cm4gdW5lc2NhcGUoJChlKS5hdHRyKCdsYWJlbCcpKSB8fCAkKGUpLmh0bWwoKTtcbiAgICB9LFxuICAgIG9uQ2hhbmdlOiAob3B0aW9uLCBjaGVja2VkLCBzZWxlY3QpID0+IHtcblxuICAgICAgY29uc3QgcGFyYW1ldGVycyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gICAgICBwYXJhbWV0ZXJzWydsYW5nJ10gPSBvcHRpb24udmFsKCk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1yZXNldC1tYXAnLCBwYXJhbWV0ZXJzKTtcblxuICAgIH1cbiAgfSlcblxuICAvLyAxLiBnb29nbGUgbWFwcyBnZW9jb2RlXG5cbiAgLy8gMi4gZm9jdXMgbWFwIG9uIGdlb2NvZGUgKHZpYSBsYXQvbG5nKVxuICBjb25zdCBxdWVyeU1hbmFnZXIgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICAgICAgcXVlcnlNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICBjb25zdCBpbml0UGFyYW1zID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuXG5cbiAgY29uc3QgbGFuZ3VhZ2VNYW5hZ2VyID0gTGFuZ3VhZ2VNYW5hZ2VyKCk7XG5cbiAgY29uc3QgbGlzdE1hbmFnZXIgPSBMaXN0TWFuYWdlcih7XG4gICAgcmVmZXJyZXI6IHdpbmRvdy5xdWVyaWVzLnJlZmVycmVyLFxuICAgIHNvdXJjZTogd2luZG93LnF1ZXJpZXMuc291cmNlXG4gIH0pO1xuXG5cbiAgbWFwTWFuYWdlciA9IE1hcE1hbmFnZXIoe1xuICAgIG9uTW92ZTogKHN3LCBuZSkgPT4ge1xuICAgICAgLy8gV2hlbiB0aGUgbWFwIG1vdmVzIGFyb3VuZCwgd2UgdXBkYXRlIHRoZSBsaXN0XG4gICAgICBxdWVyeU1hbmFnZXIudXBkYXRlVmlld3BvcnRCeUJvdW5kKHN3LCBuZSk7XG4gICAgICAvL3VwZGF0ZSBRdWVyeVxuICAgIH0sXG4gICAgcmVmZXJyZXI6IHdpbmRvdy5xdWVyaWVzLnJlZmVycmVyLFxuICAgIHNvdXJjZTogd2luZG93LnF1ZXJpZXMuc291cmNlXG4gIH0pO1xuXG4gIHdpbmRvdy5pbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2sgPSAoKSA9PiB7XG5cbiAgICBhdXRvY29tcGxldGVNYW5hZ2VyID0gQXV0b2NvbXBsZXRlTWFuYWdlcihcImlucHV0W25hbWU9J2xvYyddXCIpO1xuICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuXG4gICAgaWYgKGluaXRQYXJhbXMubG9jICYmIGluaXRQYXJhbXMubG9jICE9PSAnJyAmJiAoIWluaXRQYXJhbXMuYm91bmQxICYmICFpbml0UGFyYW1zLmJvdW5kMikpIHtcbiAgICAgIG1hcE1hbmFnZXIuaW5pdGlhbGl6ZSgoKSA9PiB7XG4gICAgICAgIG1hcE1hbmFnZXIuZ2V0Q2VudGVyQnlMb2NhdGlvbihpbml0UGFyYW1zLmxvYywgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIHF1ZXJ5TWFuYWdlci51cGRhdGVWaWV3cG9ydChyZXN1bHQuZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgaWYoaW5pdFBhcmFtcy5sYXQgJiYgaW5pdFBhcmFtcy5sbmcpIHtcbiAgICBtYXBNYW5hZ2VyLnNldENlbnRlcihbaW5pdFBhcmFtcy5sYXQsIGluaXRQYXJhbXMubG5nXSk7XG4gIH1cblxuICAvKioqXG4gICogTGlzdCBFdmVudHNcbiAgKiBUaGlzIHdpbGwgdHJpZ2dlciB0aGUgbGlzdCB1cGRhdGUgbWV0aG9kXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCdtb2JpbGUtdXBkYXRlLW1hcC1oZWlnaHQnLCAoZXZlbnQpID0+IHtcbiAgICAvL1RoaXMgY2hlY2tzIGlmIHdpZHRoIGlzIGZvciBtb2JpbGVcbiAgICBpZiAoJCh3aW5kb3cpLndpZHRoKCkgPCA2MDApIHtcbiAgICAgIHNldFRpbWVvdXQoKCk9PiB7XG4gICAgICAgICQoXCIjbWFwXCIpLmhlaWdodCgkKFwiI2V2ZW50cy1saXN0XCIpLmhlaWdodCgpKTtcbiAgICAgICAgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCk7XG4gICAgICB9LCAxMCk7XG4gICAgfVxuICB9KVxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnBvcHVsYXRlTGlzdChvcHRpb25zLnBhcmFtcyk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuXG4gICAgbGlzdE1hbmFnZXIudXBkYXRlRmlsdGVyKG9wdGlvbnMpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlci1ieS1ib3VuZCcsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxldCBib3VuZDEsIGJvdW5kMjtcblxuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICBbYm91bmQxLCBib3VuZDJdID0gbWFwTWFuYWdlci5nZXRCb3VuZHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgICBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcbiAgICB9XG5cbiAgICBsaXN0TWFuYWdlci51cGRhdGVCb3VuZHMoYm91bmQxLCBib3VuZDIpXG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLXJlc2V0LW1hcCcsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIHZhciBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHRpb25zKSk7XG4gICAgZGVsZXRlIGNvcHlbJ2xuZyddO1xuICAgIGRlbGV0ZSBjb3B5WydsYXQnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQxJ107XG4gICAgZGVsZXRlIGNvcHlbJ2JvdW5kMiddO1xuXG4gICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAkLnBhcmFtKGNvcHkpO1xuXG5cbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwidHJpZ2dlci1sYW5ndWFnZS11cGRhdGVcIiwgY29weSk7XG4gICAgJChcInNlbGVjdCNmaWx0ZXItaXRlbXNcIikubXVsdGlzZWxlY3QoJ2Rlc3Ryb3knKTtcbiAgICBidWlsZEZpbHRlcnMoKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxvYWQtZ3JvdXBzJywgeyBncm91cHM6IHdpbmRvdy5FVkVOVFNfREFUQS5ncm91cHMgfSk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG5cbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJ0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZVwiLCBjb3B5KTtcbiAgICB9LCAxMDAwKTtcbiAgfSk7XG5cblxuICAvKioqXG4gICogTWFwIEV2ZW50c1xuICAqL1xuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgLy8gbWFwTWFuYWdlci5zZXRDZW50ZXIoW29wdGlvbnMubGF0LCBvcHRpb25zLmxuZ10pO1xuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGJvdW5kMSA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDEpO1xuICAgIHZhciBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcblxuICAgIG1hcE1hbmFnZXIuc2V0Qm91bmRzKGJvdW5kMSwgYm91bmQyKTtcbiAgICAvLyBtYXBNYW5hZ2VyLnRyaWdnZXJab29tRW5kKCk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIG1hcE1hbmFnZXIudHJpZ2dlclpvb21FbmQoKTtcbiAgICB9LCAxMCk7XG5cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgXCIjY29weS1lbWJlZFwiLCAoZSkgPT4ge1xuICAgIHZhciBjb3B5VGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW1iZWQtdGV4dFwiKTtcbiAgICBjb3B5VGV4dC5zZWxlY3QoKTtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZChcIkNvcHlcIik7XG4gIH0pO1xuXG4gIC8vIDMuIG1hcmtlcnMgb24gbWFwXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC1wbG90JywgKGUsIG9wdCkgPT4ge1xuXG4gICAgbWFwTWFuYWdlci5wbG90UG9pbnRzKG9wdC5kYXRhLCBvcHQucGFyYW1zLCBvcHQuZ3JvdXBzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInKTtcbiAgfSlcblxuICAvLyBsb2FkIGdyb3Vwc1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxvYWQtZ3JvdXBzJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5lbXB0eSgpO1xuICAgIG9wdC5ncm91cHMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuXG4gICAgICBsZXQgc2x1Z2dlZCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG4gICAgICBsZXQgdmFsdWVUZXh0ID0gbGFuZ3VhZ2VNYW5hZ2VyLmdldFRyYW5zbGF0aW9uKGl0ZW0udHJhbnNsYXRpb24pO1xuICAgICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLmFwcGVuZChgXG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPScke3NsdWdnZWR9J1xuICAgICAgICAgICAgICBzZWxlY3RlZD0nc2VsZWN0ZWQnXG4gICAgICAgICAgICAgIGxhYmVsPVwiPHNwYW4gZGF0YS1sYW5nLXRhcmdldD0ndGV4dCcgZGF0YS1sYW5nLWtleT0nJHtpdGVtLnRyYW5zbGF0aW9ufSc+JHt2YWx1ZVRleHR9PC9zcGFuPjxpbWcgc3JjPScke2l0ZW0uaWNvbnVybCB8fCB3aW5kb3cuREVGQVVMVF9JQ09OfScgLz5cIj5cbiAgICAgICAgICAgIDwvb3B0aW9uPmApXG4gICAgfSk7XG5cbiAgICAvLyBSZS1pbml0aWFsaXplXG4gICAgcXVlcnlNYW5hZ2VyLmluaXRpYWxpemUoKTtcbiAgICAvLyAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykubXVsdGlzZWxlY3QoJ2Rlc3Ryb3knKTtcbiAgICAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykubXVsdGlzZWxlY3QoJ3JlYnVpbGQnKTtcblxuICAgIG1hcE1hbmFnZXIucmVmcmVzaE1hcCgpO1xuXG5cbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZScpO1xuXG4gIH0pXG5cbiAgLy8gRmlsdGVyIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtZmlsdGVyJywgKGUsIG9wdCkgPT4ge1xuICAgIGlmIChvcHQpIHtcbiAgICAgIG1hcE1hbmFnZXIuZmlsdGVyTWFwKG9wdC5maWx0ZXIpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgKGUsIG9wdCkgPT4ge1xuXG4gICAgaWYgKG9wdCkge1xuXG4gICAgICBsYW5ndWFnZU1hbmFnZXIudXBkYXRlTGFuZ3VhZ2Uob3B0LmxhbmcpO1xuICAgIH0gZWxzZSB7XG5cbiAgICAgIGxhbmd1YWdlTWFuYWdlci5yZWZyZXNoKCk7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sYW5ndWFnZS1sb2FkZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KCdyZWJ1aWxkJyk7XG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbiNzaG93LWhpZGUtbWFwJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ2JvZHknKS50b2dnbGVDbGFzcygnbWFwLXZpZXcnKVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uLmJ0bi5tb3JlLWl0ZW1zJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJyNlbWJlZC1hcmVhJykudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgLy91cGRhdGUgZW1iZWQgbGluZVxuICAgIHZhciBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHQpKTtcbiAgICBkZWxldGUgY29weVsnbG5nJ107XG4gICAgZGVsZXRlIGNvcHlbJ2xhdCddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDEnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQyJ107XG5cbiAgICAkKCcjZW1iZWQtYXJlYSBpbnB1dFtuYW1lPWVtYmVkXScpLnZhbCgnaHR0cHM6Ly9uZXctbWFwLjM1MC5vcmcjJyArICQucGFyYW0oY29weSkpO1xuICB9KTtcblxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24jem9vbS1vdXQnLCAoZSwgb3B0KSA9PiB7XG5cbiAgICAvLyBtYXBNYW5hZ2VyLnpvb21PdXRPbmNlKCk7XG5cbiAgICBtYXBNYW5hZ2VyLnpvb21VbnRpbEhpdCgpO1xuICB9KVxuXG4gICQod2luZG93KS5vbihcInJlc2l6ZVwiLCAoZSkgPT4ge1xuICAgIG1hcE1hbmFnZXIucmVmcmVzaE1hcCgpO1xuICB9KTtcblxuICAvKipcbiAgRmlsdGVyIENoYW5nZXNcbiAgKi9cbiAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIi5zZWFyY2gtYnV0dG9uIGJ1dHRvblwiLCAoZSkgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwic2VhcmNoLmZvcmNlLXNlYXJjaC1sb2NhdGlvblwiKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKFwia2V5dXBcIiwgXCJpbnB1dFtuYW1lPSdsb2MnXVwiLCAoZSkgPT4ge1xuICAgIGlmIChlLmtleUNvZGUgPT0gMTMpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3NlYXJjaC5mb3JjZS1zZWFyY2gtbG9jYXRpb24nKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdzZWFyY2guZm9yY2Utc2VhcmNoLWxvY2F0aW9uJywgKCkgPT4ge1xuICAgIGxldCBfcXVlcnkgPSAkKFwiaW5wdXRbbmFtZT0nbG9jJ11cIikudmFsKCk7XG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlci5mb3JjZVNlYXJjaChfcXVlcnkpO1xuICAgIC8vIFNlYXJjaCBnb29nbGUgYW5kIGdldCB0aGUgZmlyc3QgcmVzdWx0Li4uIGF1dG9jb21wbGV0ZT9cbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKFwiaGFzaGNoYW5nZVwiLCAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgaWYgKGhhc2gubGVuZ3RoID09IDApIHJldHVybjtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKGhhc2guc3Vic3RyaW5nKDEpKTtcbiAgICBjb25zdCBvbGRVUkwgPSBldmVudC5vcmlnaW5hbEV2ZW50Lm9sZFVSTDtcblxuXG4gICAgY29uc3Qgb2xkSGFzaCA9ICQuZGVwYXJhbShvbGRVUkwuc3Vic3RyaW5nKG9sZFVSTC5zZWFyY2goXCIjXCIpKzEpKTtcblxuXG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCBwYXJhbWV0ZXJzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuXG4gICAgLy8gU28gdGhhdCBjaGFuZ2UgaW4gZmlsdGVycyB3aWxsIG5vdCB1cGRhdGUgdGhpc1xuICAgIGlmIChvbGRIYXNoLmJvdW5kMSAhPT0gcGFyYW1ldGVycy5ib3VuZDEgfHwgb2xkSGFzaC5ib3VuZDIgIT09IHBhcmFtZXRlcnMuYm91bmQyKSB7XG5cbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG5cbiAgICBpZiAob2xkSGFzaC5sb2cgIT09IHBhcmFtZXRlcnMubG9jKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcblxuICAgIH1cblxuICAgIC8vIENoYW5nZSBpdGVtc1xuICAgIGlmIChvbGRIYXNoLmxhbmcgIT09IHBhcmFtZXRlcnMubGFuZykge1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sYW5ndWFnZS11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG4gIH0pXG5cbiAgLy8gNC4gZmlsdGVyIG91dCBpdGVtcyBpbiBhY3Rpdml0eS1hcmVhXG5cbiAgLy8gNS4gZ2V0IG1hcCBlbGVtZW50c1xuXG4gIC8vIDYuIGdldCBHcm91cCBkYXRhXG5cbiAgLy8gNy4gcHJlc2VudCBncm91cCBlbGVtZW50c1xuXG4gICQud2hlbigoKT0+e30pXG4gICAgLnRoZW4oKCkgPT57XG4gICAgICByZXR1cm4gbGFuZ3VhZ2VNYW5hZ2VyLmluaXRpYWxpemUoaW5pdFBhcmFtc1snbGFuZyddIHx8ICdlbicpO1xuICAgIH0pXG4gICAgLmRvbmUoKGRhdGEpID0+IHt9KVxuICAgIC50aGVuKCgpID0+IHtcbiAgICAgICQuYWpheCh7XG4gICAgICAgICAgdXJsOiAnaHR0cHM6Ly9uZXctbWFwLjM1MC5vcmcvb3V0cHV0LzM1MG9yZy1uZXctbGF5b3V0LmpzLmd6JywgLy8nfCoqREFUQV9TT1VSQ0UqKnwnLFxuICAgICAgICAgIC8vIHVybDogJy9kYXRhL3Rlc3QuanMnLCAvLyd8KipEQVRBX1NPVVJDRSoqfCcsXG4gICAgICAgICAgZGF0YVR5cGU6ICdzY3JpcHQnLFxuICAgICAgICAgIGNhY2hlOiB0cnVlLFxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICAvLyB3aW5kb3cuRVZFTlRTX0RBVEEgPSBkYXRhO1xuICAgICAgICAgICAgLy9KdW5lIDE0LCAyMDE4IOKAkyBDaGFuZ2VzXG4gICAgICAgICAgICBpZih3aW5kb3cucXVlcmllcy5ncm91cCkge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyh3aW5kb3cucXVlcmllcy5ncm91cCk7XG4gICAgICAgICAgICAgIHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhID0gd2luZG93LkVWRU5UU19EQVRBLmRhdGEuZmlsdGVyKChpKSA9PiBpLmNhbXBhaWduID09IHdpbmRvdy5xdWVyaWVzLmdyb3VwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9Mb2FkIGdyb3Vwc1xuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sb2FkLWdyb3VwcycsIHsgZ3JvdXBzOiB3aW5kb3cuRVZFTlRTX0RBVEEuZ3JvdXBzIH0pO1xuXG5cbiAgICAgICAgICAgIHZhciBwYXJhbWV0ZXJzID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuICAgICAgICAgICAgd2luZG93LkVWRU5UU19EQVRBLmRhdGEuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICBpdGVtWydldmVudF90eXBlJ10gPSAhaXRlbS5ldmVudF90eXBlID8gJ0FjdGlvbicgOiBpdGVtLmV2ZW50X3R5cGU7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LXVwZGF0ZScsIHsgcGFyYW1zOiBwYXJhbWV0ZXJzIH0pO1xuICAgICAgICAgICAgLy8gJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXBsb3QnLCB7XG4gICAgICAgICAgICAgICAgZGF0YTogd2luZG93LkVWRU5UU19EQVRBLmRhdGEsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiBwYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICAgIGdyb3Vwczogd2luZG93LkVWRU5UU19EQVRBLmdyb3Vwcy5yZWR1Y2UoKGRpY3QsIGl0ZW0pPT57IGRpY3RbaXRlbS5zdXBlcmdyb3VwXSA9IGl0ZW07IHJldHVybiBkaWN0OyB9LCB7fSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgLy8gfSk7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgLy9UT0RPOiBNYWtlIHRoZSBnZW9qc29uIGNvbnZlcnNpb24gaGFwcGVuIG9uIHRoZSBiYWNrZW5kXG5cbiAgICAgICAgICAgIC8vUmVmcmVzaCB0aGluZ3NcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICBsZXQgcCA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG5cbiAgICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcCk7XG4gICAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicsIHApO1xuXG4gICAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcCk7XG4gICAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCBwKTtcblxuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cblxuXG59KShqUXVlcnkpO1xuIl19
