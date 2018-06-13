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


    console.log(options);

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9oZWxwZXIuanMiLCJjbGFzc2VzL2xhbmd1YWdlLmpzIiwiY2xhc3Nlcy9saXN0LmpzIiwiY2xhc3Nlcy9tYXAuanMiLCJjbGFzc2VzL3F1ZXJ5LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIkF1dG9jb21wbGV0ZU1hbmFnZXIiLCIkIiwidGFyZ2V0IiwiQVBJX0tFWSIsInRhcmdldEl0ZW0iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJxdWVyeU1nciIsIlF1ZXJ5TWFuYWdlciIsImdlb2NvZGVyIiwiZ29vZ2xlIiwibWFwcyIsIkdlb2NvZGVyIiwiJHRhcmdldCIsImZvcmNlU2VhcmNoIiwicSIsImdlb2NvZGUiLCJhZGRyZXNzIiwicmVzdWx0cyIsInN0YXR1cyIsImdlb21ldHJ5IiwidXBkYXRlVmlld3BvcnQiLCJ2aWV3cG9ydCIsInZhbCIsImZvcm1hdHRlZF9hZGRyZXNzIiwiaW5pdGlhbGl6ZSIsInR5cGVhaGVhZCIsImhpbnQiLCJoaWdobGlnaHQiLCJtaW5MZW5ndGgiLCJjbGFzc05hbWVzIiwibWVudSIsIm5hbWUiLCJkaXNwbGF5IiwiaXRlbSIsImxpbWl0Iiwic291cmNlIiwic3luYyIsImFzeW5jIiwib24iLCJvYmoiLCJkYXR1bSIsImpRdWVyeSIsIkhlbHBlciIsInJlZlNvdXJjZSIsInVybCIsInJlZiIsInNyYyIsImluZGV4T2YiLCJMYW5ndWFnZU1hbmFnZXIiLCJsYW5ndWFnZSIsImRpY3Rpb25hcnkiLCIkdGFyZ2V0cyIsInVwZGF0ZVBhZ2VMYW5ndWFnZSIsInRhcmdldExhbmd1YWdlIiwicm93cyIsImZpbHRlciIsImkiLCJsYW5nIiwiZWFjaCIsImluZGV4IiwidGFyZ2V0QXR0cmlidXRlIiwiZGF0YSIsImxhbmdUYXJnZXQiLCJ0ZXh0IiwiYXR0ciIsInRhcmdldHMiLCJhamF4IiwiZGF0YVR5cGUiLCJzdWNjZXNzIiwidHJpZ2dlciIsIm11bHRpc2VsZWN0IiwicmVmcmVzaCIsInVwZGF0ZUxhbmd1YWdlIiwiZ2V0VHJhbnNsYXRpb24iLCJrZXkiLCJMaXN0TWFuYWdlciIsIm9wdGlvbnMiLCJ0YXJnZXRMaXN0IiwicmVmZXJyZXIiLCJjb25zb2xlIiwibG9nIiwicmVuZGVyRXZlbnQiLCJkYXRlIiwibW9tZW50Iiwic3RhcnRfZGF0ZXRpbWUiLCJmb3JtYXQiLCJtYXRjaCIsIndpbmRvdyIsInNsdWdpZnkiLCJldmVudF90eXBlIiwibGF0IiwibG5nIiwidGl0bGUiLCJ2ZW51ZSIsInJlbmRlckdyb3VwIiwid2Vic2l0ZSIsInN1cGVyR3JvdXAiLCJzdXBlcmdyb3VwIiwibG9jYXRpb24iLCJkZXNjcmlwdGlvbiIsIiRsaXN0IiwidXBkYXRlRmlsdGVyIiwicCIsInJlbW92ZVByb3AiLCJhZGRDbGFzcyIsImpvaW4iLCJmaW5kIiwiaGlkZSIsImZvckVhY2giLCJmaWwiLCJzaG93IiwidXBkYXRlQm91bmRzIiwiYm91bmQxIiwiYm91bmQyIiwiaW5kIiwiX2xhdCIsIl9sbmciLCJyZW1vdmVDbGFzcyIsIl92aXNpYmxlIiwibGVuZ3RoIiwicG9wdWxhdGVMaXN0IiwiaGFyZEZpbHRlcnMiLCJrZXlTZXQiLCJzcGxpdCIsIiRldmVudExpc3QiLCJFVkVOVFNfREFUQSIsIm1hcCIsInRvTG93ZXJDYXNlIiwiaW5jbHVkZXMiLCJyZW1vdmUiLCJhcHBlbmQiLCJNYXBNYW5hZ2VyIiwiTEFOR1VBR0UiLCJyZW5kZXJHZW9qc29uIiwibGlzdCIsInJlbmRlcmVkIiwiaXNOYU4iLCJwYXJzZUZsb2F0Iiwic3Vic3RyaW5nIiwidHlwZSIsImNvb3JkaW5hdGVzIiwicHJvcGVydGllcyIsImV2ZW50UHJvcGVydGllcyIsInBvcHVwQ29udGVudCIsImFjY2Vzc1Rva2VuIiwiTCIsImRyYWdnaW5nIiwiQnJvd3NlciIsIm1vYmlsZSIsInNldFZpZXciLCJzY3JvbGxXaGVlbFpvb20iLCJkaXNhYmxlIiwib25Nb3ZlIiwiZXZlbnQiLCJzdyIsImdldEJvdW5kcyIsIl9zb3V0aFdlc3QiLCJuZSIsIl9ub3J0aEVhc3QiLCJnZXRab29tIiwidGlsZUxheWVyIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsIiRtYXAiLCJjYWxsYmFjayIsInNldEJvdW5kcyIsImJvdW5kczEiLCJib3VuZHMyIiwiYm91bmRzIiwiZml0Qm91bmRzIiwic2V0Q2VudGVyIiwiY2VudGVyIiwiem9vbSIsImdldENlbnRlckJ5TG9jYXRpb24iLCJ0cmlnZ2VyWm9vbUVuZCIsImZpcmVFdmVudCIsInpvb21PdXRPbmNlIiwiem9vbU91dCIsInpvb21VbnRpbEhpdCIsIiR0aGlzIiwiaW50ZXJ2YWxIYW5kbGVyIiwic2V0SW50ZXJ2YWwiLCJjbGVhckludGVydmFsIiwicmVmcmVzaE1hcCIsImludmFsaWRhdGVTaXplIiwiZmlsdGVyTWFwIiwiZmlsdGVycyIsInBsb3RQb2ludHMiLCJncm91cHMiLCJnZW9qc29uIiwiZmVhdHVyZXMiLCJnZW9KU09OIiwicG9pbnRUb0xheWVyIiwiZmVhdHVyZSIsImxhdGxuZyIsImV2ZW50VHlwZSIsInNsdWdnZWQiLCJpY29uVXJsIiwiaWNvbnVybCIsInNtYWxsSWNvbiIsImljb24iLCJpY29uU2l6ZSIsImljb25BbmNob3IiLCJjbGFzc05hbWUiLCJnZW9qc29uTWFya2VyT3B0aW9ucyIsIm1hcmtlciIsIm9uRWFjaEZlYXR1cmUiLCJsYXllciIsImJpbmRQb3B1cCIsInVwZGF0ZSIsImxhdExuZyIsInRhcmdldEZvcm0iLCJwcmV2aW91cyIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImZvcm0iLCJkZXBhcmFtIiwic2VyaWFsaXplIiwiaGFzaCIsInBhcmFtIiwicGFyYW1zIiwibG9jIiwicHJvcCIsImdldFBhcmFtZXRlcnMiLCJwYXJhbWV0ZXJzIiwidXBkYXRlTG9jYXRpb24iLCJmIiwiYiIsIkpTT04iLCJzdHJpbmdpZnkiLCJ1cGRhdGVWaWV3cG9ydEJ5Qm91bmQiLCJ0cmlnZ2VyU3VibWl0IiwiYXV0b2NvbXBsZXRlTWFuYWdlciIsIm1hcE1hbmFnZXIiLCJERUZBVUxUX0lDT04iLCJ0b1N0cmluZyIsInJlcGxhY2UiLCJxdWVyaWVzIiwic2VhcmNoIiwiYnVpbGRGaWx0ZXJzIiwiZW5hYmxlSFRNTCIsInRlbXBsYXRlcyIsImJ1dHRvbiIsImxpIiwiZHJvcFJpZ2h0Iiwib25Jbml0aWFsaXplZCIsIm9uRHJvcGRvd25TaG93Iiwic2V0VGltZW91dCIsIm9uRHJvcGRvd25IaWRlIiwib3B0aW9uTGFiZWwiLCJ1bmVzY2FwZSIsImh0bWwiLCJvcHRpb25DbGFzcyIsInNlbGVjdGVkQ2xhc3MiLCJidXR0b25DbGFzcyIsIm9uQ2hhbmdlIiwib3B0aW9uIiwiY2hlY2tlZCIsInNlbGVjdCIsInF1ZXJ5TWFuYWdlciIsImluaXRQYXJhbXMiLCJsYW5ndWFnZU1hbmFnZXIiLCJsaXN0TWFuYWdlciIsImluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayIsInJlc3VsdCIsIndpZHRoIiwiaGVpZ2h0IiwicGFyc2UiLCJjb3B5IiwiY29weVRleHQiLCJnZXRFbGVtZW50QnlJZCIsImV4ZWNDb21tYW5kIiwib3B0IiwiZW1wdHkiLCJ2YWx1ZVRleHQiLCJ0cmFuc2xhdGlvbiIsInRvZ2dsZUNsYXNzIiwia2V5Q29kZSIsIl9xdWVyeSIsIm9sZFVSTCIsIm9yaWdpbmFsRXZlbnQiLCJvbGRIYXNoIiwid2hlbiIsInRoZW4iLCJkb25lIiwiY2FjaGUiLCJyZWR1Y2UiLCJkaWN0Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOztBQUNBLElBQU1BLHNCQUF1QixVQUFTQyxDQUFULEVBQVk7QUFDdkM7O0FBRUEsU0FBTyxVQUFDQyxNQUFELEVBQVk7O0FBRWpCLFFBQU1DLFVBQVUseUNBQWhCO0FBQ0EsUUFBTUMsYUFBYSxPQUFPRixNQUFQLElBQWlCLFFBQWpCLEdBQTRCRyxTQUFTQyxhQUFULENBQXVCSixNQUF2QixDQUE1QixHQUE2REEsTUFBaEY7QUFDQSxRQUFNSyxXQUFXQyxjQUFqQjtBQUNBLFFBQUlDLFdBQVcsSUFBSUMsT0FBT0MsSUFBUCxDQUFZQyxRQUFoQixF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QixvQkFBcEIsRUFBMENpQyxDQUExQztBQUNBdEcsWUFBRUksUUFBRixFQUFZaUUsT0FBWixDQUFvQixvQkFBcEIsRUFBMENpQyxDQUExQzs7QUFFQXRHLFlBQUVJLFFBQUYsRUFBWWlFLE9BQVosQ0FBb0IsNEJBQXBCLEVBQWtEaUMsQ0FBbEQ7QUFDQXRHLFlBQUVJLFFBQUYsRUFBWWlFLE9BQVosQ0FBb0IsOEJBQXBCLEVBQW9EaUMsQ0FBcEQ7QUFFRCxTQVRELEVBU0csR0FUSDtBQVVEO0FBdkNFLEtBQVA7QUF5Q0MsR0EvQ0w7QUFtREQsQ0FsWUQsRUFrWUc3RCxNQWxZSCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbi8vQVBJIDpBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cbmNvbnN0IEF1dG9jb21wbGV0ZU1hbmFnZXIgPSAoZnVuY3Rpb24oJCkge1xuICAvL0luaXRpYWxpemF0aW9uLi4uXG5cbiAgcmV0dXJuICh0YXJnZXQpID0+IHtcblxuICAgIGNvbnN0IEFQSV9LRVkgPSBcIkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVwiO1xuICAgIGNvbnN0IHRhcmdldEl0ZW0gPSB0eXBlb2YgdGFyZ2V0ID09IFwic3RyaW5nXCIgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCkgOiB0YXJnZXQ7XG4gICAgY29uc3QgcXVlcnlNZ3IgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICB2YXIgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcblxuICAgIHJldHVybiB7XG4gICAgICAkdGFyZ2V0OiAkKHRhcmdldEl0ZW0pLFxuICAgICAgdGFyZ2V0OiB0YXJnZXRJdGVtLFxuICAgICAgZm9yY2VTZWFyY2g6IChxKSA9PiB7XG4gICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBxIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICBpZiAocmVzdWx0c1swXSkge1xuICAgICAgICAgICAgbGV0IGdlb21ldHJ5ID0gcmVzdWx0c1swXS5nZW9tZXRyeTtcbiAgICAgICAgICAgIHF1ZXJ5TWdyLnVwZGF0ZVZpZXdwb3J0KGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICQodGFyZ2V0SXRlbSkudmFsKHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyB2YXIgZ2VvbWV0cnkgPSBkYXR1bS5nZW9tZXRyeTtcbiAgICAgICAgICAvLyBxdWVyeU1nci51cGRhdGVWaWV3cG9ydChnZW9tZXRyeS52aWV3cG9ydCk7XG5cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgaW5pdGlhbGl6ZTogKCkgPT4ge1xuICAgICAgICAkKHRhcmdldEl0ZW0pLnR5cGVhaGVhZCh7XG4gICAgICAgICAgICAgICAgICAgIGhpbnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWluTGVuZ3RoOiA0LFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgbWVudTogJ3R0LWRyb3Bkb3duLW1lbnUnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdzZWFyY2gtcmVzdWx0cycsXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IChpdGVtKSA9PiBpdGVtLmZvcm1hdHRlZF9hZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgICBsaW1pdDogMTAsXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogZnVuY3Rpb24gKHEsIHN5bmMsIGFzeW5jKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBxIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXN5bmMocmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICkub24oJ3R5cGVhaGVhZDpzZWxlY3RlZCcsIGZ1bmN0aW9uIChvYmosIGRhdHVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGRhdHVtKVxuICAgICAgICAgICAgICAgICAgICB7XG5cbiAgICAgICAgICAgICAgICAgICAgICB2YXIgZ2VvbWV0cnkgPSBkYXR1bS5nZW9tZXRyeTtcbiAgICAgICAgICAgICAgICAgICAgICBxdWVyeU1nci51cGRhdGVWaWV3cG9ydChnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gIG1hcC5maXRCb3VuZHMoZ2VvbWV0cnkuYm91bmRzPyBnZW9tZXRyeS5ib3VuZHMgOiBnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cblxuXG4gICAgcmV0dXJuIHtcblxuICAgIH1cbiAgfVxuXG59KGpRdWVyeSkpO1xuIiwiY29uc3QgSGVscGVyID0gKCgkKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlZlNvdXJjZTogKHVybCwgcmVmLCBzcmMpID0+IHtcbiAgICAgICAgLy8gSnVuIDEzIDIwMTgg4oCUIEZpeCBmb3Igc291cmNlIGFuZCByZWZlcnJlclxuICAgICAgICBpZiAocmVmICYmIHNyYykge1xuICAgICAgICAgIGlmICh1cmwuaW5kZXhPZihcIj9cIikgPj0gMCkge1xuICAgICAgICAgICAgdXJsID0gYCR7dXJsfSZyZWZlcnJlcj0ke3JlZn0mc291cmNlPSR7c3JjfWA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVybCA9IGAke3VybH0/cmVmZXJyZXI9JHtyZWZ9JnNvdXJjZT0ke3NyY31gO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB1cmw7XG4gICAgICB9XG4gICAgfTtcbn0pKGpRdWVyeSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IExhbmd1YWdlTWFuYWdlciA9ICgoJCkgPT4ge1xuICAvL2tleVZhbHVlXG5cbiAgLy90YXJnZXRzIGFyZSB0aGUgbWFwcGluZ3MgZm9yIHRoZSBsYW5ndWFnZVxuICByZXR1cm4gKCkgPT4ge1xuICAgIGxldCBsYW5ndWFnZTtcbiAgICBsZXQgZGljdGlvbmFyeSA9IHt9O1xuICAgIGxldCAkdGFyZ2V0cyA9ICQoXCJbZGF0YS1sYW5nLXRhcmdldF1bZGF0YS1sYW5nLWtleV1cIik7XG5cbiAgICBjb25zdCB1cGRhdGVQYWdlTGFuZ3VhZ2UgPSAoKSA9PiB7XG5cbiAgICAgIGxldCB0YXJnZXRMYW5ndWFnZSA9IGRpY3Rpb25hcnkucm93cy5maWx0ZXIoKGkpID0+IGkubGFuZyA9PT0gbGFuZ3VhZ2UpWzBdO1xuXG4gICAgICAkdGFyZ2V0cy5lYWNoKChpbmRleCwgaXRlbSkgPT4ge1xuXG4gICAgICAgIGxldCB0YXJnZXRBdHRyaWJ1dGUgPSAkKGl0ZW0pLmRhdGEoJ2xhbmctdGFyZ2V0Jyk7XG4gICAgICAgIGxldCBsYW5nVGFyZ2V0ID0gJChpdGVtKS5kYXRhKCdsYW5nLWtleScpO1xuXG5cblxuXG4gICAgICAgIHN3aXRjaCh0YXJnZXRBdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjYXNlICd0ZXh0JzpcblxuICAgICAgICAgICAgJCgoYFtkYXRhLWxhbmcta2V5PVwiJHtsYW5nVGFyZ2V0fVwiXWApKS50ZXh0KHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGlmIChsYW5nVGFyZ2V0ID09IFwibW9yZS1zZWFyY2gtb3B0aW9uc1wiKSB7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3ZhbHVlJzpcbiAgICAgICAgICAgICQoaXRlbSkudmFsKHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAkKGl0ZW0pLmF0dHIodGFyZ2V0QXR0cmlidXRlLCB0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGxhbmd1YWdlLFxuICAgICAgdGFyZ2V0czogJHRhcmdldHMsXG4gICAgICBkaWN0aW9uYXJ5LFxuICAgICAgaW5pdGlhbGl6ZTogKGxhbmcpID0+IHtcblxuICAgICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgICAvLyB1cmw6ICdodHRwczovL2dzeDJqc29uLmNvbS9hcGk/aWQ9MU8zZUJ5akwxdmxZZjdaN2FtLV9odFJUUWk3M1BhZnFJZk5CZExtWGU4U00mc2hlZXQ9MScsXG4gICAgICAgICAgdXJsOiAnL2RhdGEvbGFuZy5qc29uJyxcbiAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICBkaWN0aW9uYXJ5ID0gZGF0YTtcbiAgICAgICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZSgpO1xuXG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxhbmd1YWdlLWxvYWRlZCcpO1xuXG4gICAgICAgICAgICAkKFwiI2xhbmd1YWdlLW9wdHNcIikubXVsdGlzZWxlY3QoJ3NlbGVjdCcsIGxhbmcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgcmVmcmVzaDogKCkgPT4ge1xuICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UobGFuZ3VhZ2UpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZUxhbmd1YWdlOiAobGFuZykgPT4ge1xuXG4gICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgdXBkYXRlUGFnZUxhbmd1YWdlKCk7XG4gICAgICB9LFxuICAgICAgZ2V0VHJhbnNsYXRpb246IChrZXkpID0+IHtcbiAgICAgICAgbGV0IHRhcmdldExhbmd1YWdlID0gZGljdGlvbmFyeS5yb3dzLmZpbHRlcigoaSkgPT4gaS5sYW5nID09PSBsYW5ndWFnZSlbMF07XG4gICAgICAgIHJldHVybiB0YXJnZXRMYW5ndWFnZVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxufSkoalF1ZXJ5KTtcbiIsIi8qIFRoaXMgbG9hZHMgYW5kIG1hbmFnZXMgdGhlIGxpc3QhICovXG5cbmNvbnN0IExpc3RNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIHJldHVybiAob3B0aW9ucykgPT4ge1xuICAgIGxldCB0YXJnZXRMaXN0ID0gb3B0aW9ucy50YXJnZXRMaXN0IHx8IFwiI2V2ZW50cy1saXN0XCI7XG4gICAgLy8gSnVuZSAxMyBgMTgg4oCTIHJlZmVycmVyIGFuZCBzb3VyY2VcbiAgICBsZXQge3JlZmVycmVyLCBzb3VyY2V9ID0gb3B0aW9ucztcblxuICAgIGNvbnNvbGUubG9nKG9wdGlvbnMpO1xuXG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRMaXN0ID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0TGlzdCkgOiB0YXJnZXRMaXN0O1xuXG4gICAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSwgcmVmZXJyZXIgPSBudWxsLCBzb3VyY2UgPSBudWxsKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhyZWZlcnJlciwgc291cmNlICwgIFwifn5+flwiKTtcbiAgICAgIHZhciBkYXRlID0gbW9tZW50KGl0ZW0uc3RhcnRfZGF0ZXRpbWUpLmZvcm1hdChcImRkZGQgTU1NIERELCBoOm1tYVwiKTtcbiAgICAgIGxldCB1cmwgPSBpdGVtLnVybC5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLnVybCA6IFwiLy9cIiArIGl0ZW0udXJsO1xuICAgICAgLy8gbGV0IHN1cGVyR3JvdXAgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuICAgICAgdXJsID0gSGVscGVyLnJlZlNvdXJjZSh1cmwsIHJlZmVycmVyLCBzb3VyY2UpO1xuXG4gICAgICByZXR1cm4gYFxuICAgICAgPGxpIGNsYXNzPScke3dpbmRvdy5zbHVnaWZ5KGl0ZW0uZXZlbnRfdHlwZSl9IGV2ZW50cyBldmVudC1vYmonIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnQgdHlwZS1hY3Rpb25cIj5cbiAgICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgICA8bGkgY2xhc3M9J3RhZy0ke2l0ZW0uZXZlbnRfdHlwZX0gdGFnJz4ke2l0ZW0uZXZlbnRfdHlwZX08L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPGgyIGNsYXNzPVwiZXZlbnQtdGl0bGVcIj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZX08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtZGF0ZSBkYXRlXCI+JHtkYXRlfTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1hZGRyZXNzIGFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgICAgPHA+JHtpdGVtLnZlbnVlfTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPlJTVlA8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSwgcmVmZXJyZXIgPSBudWxsLCBzb3VyY2UgPSBudWxsKSA9PiB7XG4gICAgICBsZXQgdXJsID0gaXRlbS53ZWJzaXRlLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0ud2Vic2l0ZSA6IFwiLy9cIiArIGl0ZW0ud2Vic2l0ZTtcbiAgICAgIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcblxuICAgICAgdXJsID0gSGVscGVyLnJlZlNvdXJjZSh1cmwsIHJlZmVycmVyLCBzb3VyY2UpO1xuXG4gICAgICByZXR1cm4gYFxuICAgICAgPGxpIGNsYXNzPScke2l0ZW0uZXZlbnRfdHlwZX0gJHtzdXBlckdyb3VwfSBncm91cC1vYmonIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXAgZ3JvdXAtb2JqXCI+XG4gICAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgICAgPGxpIGNsYXNzPVwidGFnIHRhZy0ke2l0ZW0uc3VwZXJncm91cH1cIj4ke2l0ZW0uc3VwZXJncm91cH08L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPGgyPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLm5hbWV9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWxvY2F0aW9uIGxvY2F0aW9uXCI+JHtpdGVtLmxvY2F0aW9ufTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPkdldCBJbnZvbHZlZDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICAgYFxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgJGxpc3Q6ICR0YXJnZXQsXG4gICAgICB1cGRhdGVGaWx0ZXI6IChwKSA9PiB7XG4gICAgICAgIGlmKCFwKSByZXR1cm47XG5cbiAgICAgICAgLy8gUmVtb3ZlIEZpbHRlcnNcblxuICAgICAgICAkdGFyZ2V0LnJlbW92ZVByb3AoXCJjbGFzc1wiKTtcbiAgICAgICAgJHRhcmdldC5hZGRDbGFzcyhwLmZpbHRlciA/IHAuZmlsdGVyLmpvaW4oXCIgXCIpIDogJycpXG5cbiAgICAgICAgJHRhcmdldC5maW5kKCdsaScpLmhpZGUoKTtcblxuICAgICAgICBpZiAocC5maWx0ZXIpIHtcbiAgICAgICAgICBwLmZpbHRlci5mb3JFYWNoKChmaWwpPT57XG4gICAgICAgICAgICAkdGFyZ2V0LmZpbmQoYGxpLiR7ZmlsfWApLnNob3coKTtcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdXBkYXRlQm91bmRzOiAoYm91bmQxLCBib3VuZDIpID0+IHtcblxuICAgICAgICAvLyBjb25zdCBib3VuZHMgPSBbcC5ib3VuZHMxLCBwLmJvdW5kczJdO1xuXG5cbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCBsaS5ldmVudC1vYmosIHVsIGxpLmdyb3VwLW9iaicpLmVhY2goKGluZCwgaXRlbSk9PiB7XG5cbiAgICAgICAgICBsZXQgX2xhdCA9ICQoaXRlbSkuZGF0YSgnbGF0JyksXG4gICAgICAgICAgICAgIF9sbmcgPSAkKGl0ZW0pLmRhdGEoJ2xuZycpO1xuXG5cbiAgICAgICAgICBpZiAoYm91bmQxWzBdIDw9IF9sYXQgJiYgYm91bmQyWzBdID49IF9sYXQgJiYgYm91bmQxWzFdIDw9IF9sbmcgJiYgYm91bmQyWzFdID49IF9sbmcpIHtcblxuICAgICAgICAgICAgJChpdGVtKS5hZGRDbGFzcygnd2l0aGluLWJvdW5kJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoaXRlbSkucmVtb3ZlQ2xhc3MoJ3dpdGhpbi1ib3VuZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IF92aXNpYmxlID0gJHRhcmdldC5maW5kKCd1bCBsaS5ldmVudC1vYmoud2l0aGluLWJvdW5kLCB1bCBsaS5ncm91cC1vYmoud2l0aGluLWJvdW5kJykubGVuZ3RoO1xuICAgICAgICBpZiAoX3Zpc2libGUgPT0gMCkge1xuICAgICAgICAgIC8vIFRoZSBsaXN0IGlzIGVtcHR5XG4gICAgICAgICAgJHRhcmdldC5hZGRDbGFzcyhcImlzLWVtcHR5XCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICR0YXJnZXQucmVtb3ZlQ2xhc3MoXCJpcy1lbXB0eVwiKTtcbiAgICAgICAgfVxuXG4gICAgICB9LFxuICAgICAgcG9wdWxhdGVMaXN0OiAoaGFyZEZpbHRlcnMpID0+IHtcbiAgICAgICAgLy91c2luZyB3aW5kb3cuRVZFTlRfREFUQVxuICAgICAgICBjb25zdCBrZXlTZXQgPSAhaGFyZEZpbHRlcnMua2V5ID8gW10gOiBoYXJkRmlsdGVycy5rZXkuc3BsaXQoJywnKTtcblxuICAgICAgICB2YXIgJGV2ZW50TGlzdCA9IHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhLm1hcChpdGVtID0+IHtcbiAgICAgICAgICBpZiAoa2V5U2V0Lmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbS5ldmVudF90eXBlICYmIGl0ZW0uZXZlbnRfdHlwZS50b0xvd2VyQ2FzZSgpID09ICdncm91cCcgPyByZW5kZXJHcm91cChpdGVtKSA6IHJlbmRlckV2ZW50KGl0ZW0sIHJlZmVycmVyLCBzb3VyY2UpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2V5U2V0Lmxlbmd0aCA+IDAgJiYgaXRlbS5ldmVudF90eXBlICE9ICdncm91cCcgJiYga2V5U2V0LmluY2x1ZGVzKGl0ZW0uZXZlbnRfdHlwZSkpIHtcbiAgICAgICAgICAgIHJldHVybiByZW5kZXJFdmVudChpdGVtLCByZWZlcnJlciwgc291cmNlKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtleVNldC5sZW5ndGggPiAwICYmIGl0ZW0uZXZlbnRfdHlwZSA9PSAnZ3JvdXAnICYmIGtleVNldC5pbmNsdWRlcyhpdGVtLnN1cGVyZ3JvdXApKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyR3JvdXAoaXRlbSwgcmVmZXJyZXIsIHNvdXJjZSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICB9KVxuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsIGxpJykucmVtb3ZlKCk7XG4gICAgICAgICR0YXJnZXQuZmluZCgndWwnKS5hcHBlbmQoJGV2ZW50TGlzdCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsIlxuXG5jb25zdCBNYXBNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIGxldCBMQU5HVUFHRSA9ICdlbic7XG5cbiAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSwgcmVmZXJyZXIgPSBudWxsLCBzb3VyY2UgPSBudWxsKSA9PiB7XG4gICAgdmFyIGRhdGUgPSBtb21lbnQoaXRlbS5zdGFydF9kYXRldGltZSkuZm9ybWF0KFwiZGRkZCBNTU0gREQsIGg6bW1hXCIpO1xuICAgIGxldCB1cmwgPSBpdGVtLnVybC5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLnVybCA6IFwiLy9cIiArIGl0ZW0udXJsO1xuXG4gICAgdXJsID0gSGVscGVyLnJlZlNvdXJjZSh1cmwsIHJlZmVycmVyLCBzb3VyY2UpO1xuXG4gICAgbGV0IHN1cGVyR3JvdXAgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuICAgIHJldHVybiBgXG4gICAgPGRpdiBjbGFzcz0ncG9wdXAtaXRlbSAke2l0ZW0uZXZlbnRfdHlwZX0gJHtzdXBlckdyb3VwfScgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnRcIj5cbiAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctJHtpdGVtLmV2ZW50X3R5cGV9XCI+JHtpdGVtLmV2ZW50X3R5cGUgfHwgJ0FjdGlvbid9PC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPGgyIGNsYXNzPVwiZXZlbnQtdGl0bGVcIj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZX08L2E+PC9oMj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWRhdGVcIj4ke2RhdGV9PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1hZGRyZXNzIGFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgIDxwPiR7aXRlbS52ZW51ZX08L3A+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5SU1ZQPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICAgIGBcbiAgfTtcblxuICBjb25zdCByZW5kZXJHcm91cCA9IChpdGVtLCByZWZlcnJlciA9IG51bGwsIHNvdXJjZSA9IG51bGwpID0+IHtcblxuICAgIGxldCB1cmwgPSBpdGVtLndlYnNpdGUubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS53ZWJzaXRlIDogXCIvL1wiICsgaXRlbS53ZWJzaXRlO1xuXG4gICAgdXJsID0gSGVscGVyLnJlZlNvdXJjZSh1cmwsIHJlZmVycmVyLCBzb3VyY2UpO1xuXG4gICAgbGV0IHN1cGVyR3JvdXAgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuICAgIHJldHVybiBgXG4gICAgPGxpPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXAgZ3JvdXAtb2JqICR7c3VwZXJHcm91cH1cIj5cbiAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctJHtpdGVtLnN1cGVyZ3JvdXB9ICR7c3VwZXJHcm91cH1cIj4ke2l0ZW0uc3VwZXJncm91cH08L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtaGVhZGVyXCI+XG4gICAgICAgICAgPGgyPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLm5hbWV9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWxvY2F0aW9uIGxvY2F0aW9uXCI+JHtpdGVtLmxvY2F0aW9ufTwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXNjcmlwdGlvblwiPlxuICAgICAgICAgICAgPHA+JHtpdGVtLmRlc2NyaXB0aW9ufTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPkdldCBJbnZvbHZlZDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2xpPlxuICAgIGBcbiAgfTtcblxuICBjb25zdCByZW5kZXJHZW9qc29uID0gKGxpc3QsIHJlZiA9IG51bGwsIHNyYyA9IG51bGwpID0+IHtcbiAgICByZXR1cm4gbGlzdC5tYXAoKGl0ZW0pID0+IHtcbiAgICAgIC8vIHJlbmRlcmVkIGV2ZW50VHlwZVxuICAgICAgbGV0IHJlbmRlcmVkO1xuXG4gICAgICBpZiAoaXRlbS5ldmVudF90eXBlICYmIGl0ZW0uZXZlbnRfdHlwZS50b0xvd2VyQ2FzZSgpID09ICdncm91cCcpIHtcbiAgICAgICAgcmVuZGVyZWQgPSByZW5kZXJHcm91cChpdGVtLCByZWYsIHNyYyk7XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlbmRlcmVkID0gcmVuZGVyRXZlbnQoaXRlbSwgcmVmLCBzcmMpO1xuICAgICAgfVxuXG4gICAgICAvLyBmb3JtYXQgY2hlY2tcbiAgICAgIGlmIChpc05hTihwYXJzZUZsb2F0KHBhcnNlRmxvYXQoaXRlbS5sbmcpKSkpIHtcbiAgICAgICAgaXRlbS5sbmcgPSBpdGVtLmxuZy5zdWJzdHJpbmcoMSlcbiAgICAgIH1cbiAgICAgIGlmIChpc05hTihwYXJzZUZsb2F0KHBhcnNlRmxvYXQoaXRlbS5sYXQpKSkpIHtcbiAgICAgICAgaXRlbS5sYXQgPSBpdGVtLmxhdC5zdWJzdHJpbmcoMSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgIHR5cGU6IFwiUG9pbnRcIixcbiAgICAgICAgICBjb29yZGluYXRlczogW2l0ZW0ubG5nLCBpdGVtLmxhdF1cbiAgICAgICAgfSxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIGV2ZW50UHJvcGVydGllczogaXRlbSxcbiAgICAgICAgICBwb3B1cENvbnRlbnQ6IHJlbmRlcmVkXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIChvcHRpb25zKSA9PiB7XG4gICAgdmFyIGFjY2Vzc1Rva2VuID0gJ3BrLmV5SjFJam9pYldGMGRHaGxkek0xTUNJc0ltRWlPaUphVFZGTVVrVXdJbjAud2NNM1hjOEJHQzZQTS1PeXJ3am5oZyc7XG4gICAgdmFyIG1hcCA9IEwubWFwKCdtYXAnLCB7IGRyYWdnaW5nOiAhTC5Ccm93c2VyLm1vYmlsZSB9KS5zZXRWaWV3KFszNC44ODU5MzA5NDA3NTMxNywgNS4wOTc2NTYyNTAwMDAwMDFdLCAyKTtcblxuICAgIGxldCB7cmVmZXJyZXIsIHNvdXJjZX0gPSBvcHRpb25zO1xuXG4gICAgaWYgKCFMLkJyb3dzZXIubW9iaWxlKSB7XG4gICAgICBtYXAuc2Nyb2xsV2hlZWxab29tLmRpc2FibGUoKTtcbiAgICB9XG5cbiAgICBMQU5HVUFHRSA9IG9wdGlvbnMubGFuZyB8fCAnZW4nO1xuXG4gICAgaWYgKG9wdGlvbnMub25Nb3ZlKSB7XG4gICAgICBtYXAub24oJ2RyYWdlbmQnLCAoZXZlbnQpID0+IHtcblxuXG4gICAgICAgIGxldCBzdyA9IFttYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxuZ107XG4gICAgICAgIGxldCBuZSA9IFttYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxuZ107XG4gICAgICAgIG9wdGlvbnMub25Nb3ZlKHN3LCBuZSk7XG4gICAgICB9KS5vbignem9vbWVuZCcsIChldmVudCkgPT4ge1xuICAgICAgICBpZiAobWFwLmdldFpvb20oKSA8PSA0KSB7XG4gICAgICAgICAgJChcIiNtYXBcIikuYWRkQ2xhc3MoXCJ6b29tZWQtb3V0XCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICQoXCIjbWFwXCIpLnJlbW92ZUNsYXNzKFwiem9vbWVkLW91dFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzdyA9IFttYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxuZ107XG4gICAgICAgIGxldCBuZSA9IFttYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxuZ107XG4gICAgICAgIG9wdGlvbnMub25Nb3ZlKHN3LCBuZSk7XG4gICAgICB9KVxuICAgIH1cblxuICAgIC8vIG1hcC5maXJlRXZlbnQoJ3pvb21lbmQnKTtcblxuICAgIEwudGlsZUxheWVyKCdodHRwczovL2FwaS5tYXBib3guY29tL3N0eWxlcy92MS9tYXR0aGV3MzUwL2NqYTQxdGlqazI3ZDYycnFvZDdnMGx4NGIvdGlsZXMvMjU2L3t6fS97eH0ve3l9P2FjY2Vzc190b2tlbj0nICsgYWNjZXNzVG9rZW4sIHtcbiAgICAgICAgYXR0cmlidXRpb246ICcmY29weTsgPGEgaHJlZj1cImh0dHA6Ly9vc20ub3JnL2NvcHlyaWdodFwiPk9wZW5TdHJlZXRNYXA8L2E+IGNvbnRyaWJ1dG9ycyDigKIgPGEgaHJlZj1cIi8vMzUwLm9yZ1wiPjM1MC5vcmc8L2E+J1xuICAgIH0pLmFkZFRvKG1hcCk7XG5cbiAgICBsZXQgZ2VvY29kZXIgPSBudWxsO1xuICAgIHJldHVybiB7XG4gICAgICAkbWFwOiBtYXAsXG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHNldEJvdW5kczogKGJvdW5kczEsIGJvdW5kczIpID0+IHtcblxuICAgICAgICBjb25zdCBib3VuZHMgPSBbYm91bmRzMSwgYm91bmRzMl07XG4gICAgICAgIG1hcC5maXRCb3VuZHMoYm91bmRzKTtcbiAgICAgIH0sXG4gICAgICBzZXRDZW50ZXI6IChjZW50ZXIsIHpvb20gPSAxMCkgPT4ge1xuICAgICAgICBpZiAoIWNlbnRlciB8fCAhY2VudGVyWzBdIHx8IGNlbnRlclswXSA9PSBcIlwiXG4gICAgICAgICAgICAgIHx8ICFjZW50ZXJbMV0gfHwgY2VudGVyWzFdID09IFwiXCIpIHJldHVybjtcbiAgICAgICAgbWFwLnNldFZpZXcoY2VudGVyLCB6b29tKTtcbiAgICAgIH0sXG4gICAgICBnZXRCb3VuZHM6ICgpID0+IHtcblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuXG4gICAgICAgIHJldHVybiBbc3csIG5lXTtcbiAgICAgIH0sXG4gICAgICAvLyBDZW50ZXIgbG9jYXRpb24gYnkgZ2VvY29kZWRcbiAgICAgIGdldENlbnRlckJ5TG9jYXRpb246IChsb2NhdGlvbiwgY2FsbGJhY2spID0+IHtcblxuICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogbG9jYXRpb24gfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuXG4gICAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2socmVzdWx0c1swXSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHRyaWdnZXJab29tRW5kOiAoKSA9PiB7XG4gICAgICAgIG1hcC5maXJlRXZlbnQoJ3pvb21lbmQnKTtcbiAgICAgIH0sXG4gICAgICB6b29tT3V0T25jZTogKCkgPT4ge1xuICAgICAgICBtYXAuem9vbU91dCgxKTtcbiAgICAgIH0sXG4gICAgICB6b29tVW50aWxIaXQ6ICgpID0+IHtcbiAgICAgICAgdmFyICR0aGlzID0gdGhpcztcbiAgICAgICAgbWFwLnpvb21PdXQoMSk7XG4gICAgICAgIGxldCBpbnRlcnZhbEhhbmRsZXIgPSBudWxsO1xuICAgICAgICBpbnRlcnZhbEhhbmRsZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgdmFyIF92aXNpYmxlID0gJChkb2N1bWVudCkuZmluZCgndWwgbGkuZXZlbnQtb2JqLndpdGhpbi1ib3VuZCwgdWwgbGkuZ3JvdXAtb2JqLndpdGhpbi1ib3VuZCcpLmxlbmd0aDtcbiAgICAgICAgICBpZiAoX3Zpc2libGUgPT0gMCkge1xuICAgICAgICAgICAgbWFwLnpvb21PdXQoMSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxIYW5kbGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIDIwMCk7XG4gICAgICB9LFxuICAgICAgcmVmcmVzaE1hcDogKCkgPT4ge1xuICAgICAgICBtYXAuaW52YWxpZGF0ZVNpemUoZmFsc2UpO1xuICAgICAgICAvLyBtYXAuX29uUmVzaXplKCk7XG4gICAgICAgIC8vIG1hcC5maXJlRXZlbnQoJ3pvb21lbmQnKTtcblxuXG4gICAgICB9LFxuICAgICAgZmlsdGVyTWFwOiAoZmlsdGVycykgPT4ge1xuXG4gICAgICAgICQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cFwiKS5oaWRlKCk7XG5cblxuICAgICAgICBpZiAoIWZpbHRlcnMpIHJldHVybjtcblxuICAgICAgICBmaWx0ZXJzLmZvckVhY2goKGl0ZW0pID0+IHtcblxuICAgICAgICAgICQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cC5cIiArIGl0ZW0udG9Mb3dlckNhc2UoKSkuc2hvdygpO1xuICAgICAgICB9KVxuICAgICAgfSxcbiAgICAgIHBsb3RQb2ludHM6IChsaXN0LCBoYXJkRmlsdGVycywgZ3JvdXBzKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleVNldCA9ICFoYXJkRmlsdGVycy5rZXkgPyBbXSA6IGhhcmRGaWx0ZXJzLmtleS5zcGxpdCgnLCcpO1xuXG4gICAgICAgIGlmIChrZXlTZXQubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGxpc3QgPSBsaXN0LmZpbHRlcigoaXRlbSkgPT4ga2V5U2V0LmluY2x1ZGVzKGl0ZW0uZXZlbnRfdHlwZSkpXG4gICAgICAgIH1cblxuXG4gICAgICAgIGNvbnN0IGdlb2pzb24gPSB7XG4gICAgICAgICAgdHlwZTogXCJGZWF0dXJlQ29sbGVjdGlvblwiLFxuICAgICAgICAgIGZlYXR1cmVzOiByZW5kZXJHZW9qc29uKGxpc3QsIHJlZmVycmVyLCBzb3VyY2UpXG4gICAgICAgIH07XG5cblxuICAgICAgICBMLmdlb0pTT04oZ2VvanNvbiwge1xuICAgICAgICAgICAgcG9pbnRUb0xheWVyOiAoZmVhdHVyZSwgbGF0bG5nKSA9PiB7XG4gICAgICAgICAgICAgIC8vIEljb25zIGZvciBtYXJrZXJzXG4gICAgICAgICAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuZXZlbnRfdHlwZTtcblxuICAgICAgICAgICAgICAvLyBJZiBubyBzdXBlcmdyb3VwLCBpdCdzIGFuIGV2ZW50LlxuICAgICAgICAgICAgICBjb25zdCBzdXBlcmdyb3VwID0gZ3JvdXBzW2ZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuc3VwZXJncm91cF0gPyBmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLnN1cGVyZ3JvdXAgOiBcIkV2ZW50c1wiO1xuICAgICAgICAgICAgICBjb25zdCBzbHVnZ2VkID0gd2luZG93LnNsdWdpZnkoc3VwZXJncm91cCk7XG4gICAgICAgICAgICAgIGNvbnN0IGljb25VcmwgPSBncm91cHNbc3VwZXJncm91cF0gPyBncm91cHNbc3VwZXJncm91cF0uaWNvbnVybCB8fCBcIi9pbWcvZXZlbnQucG5nXCIgIDogXCIvaW1nL2V2ZW50LnBuZ1wiIDtcblxuICAgICAgICAgICAgICBjb25zdCBzbWFsbEljb24gPSAgTC5pY29uKHtcbiAgICAgICAgICAgICAgICBpY29uVXJsOiBpY29uVXJsLFxuICAgICAgICAgICAgICAgIGljb25TaXplOiBbMTgsIDE4XSxcbiAgICAgICAgICAgICAgICBpY29uQW5jaG9yOiBbOSwgOV0sXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBzbHVnZ2VkICsgJyBldmVudC1pdGVtLXBvcHVwJ1xuICAgICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICAgIHZhciBnZW9qc29uTWFya2VyT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBpY29uOiBzbWFsbEljb24sXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJldHVybiBMLm1hcmtlcihsYXRsbmcsIGdlb2pzb25NYXJrZXJPcHRpb25zKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICBvbkVhY2hGZWF0dXJlOiAoZmVhdHVyZSwgbGF5ZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChmZWF0dXJlLnByb3BlcnRpZXMgJiYgZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCkge1xuICAgICAgICAgICAgICBsYXllci5iaW5kUG9wdXAoZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgICB9LFxuICAgICAgdXBkYXRlOiAocCkgPT4ge1xuICAgICAgICBpZiAoIXAgfHwgIXAubGF0IHx8ICFwLmxuZyApIHJldHVybjtcblxuICAgICAgICBtYXAuc2V0VmlldyhMLmxhdExuZyhwLmxhdCwgcC5sbmcpLCAxMCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsImNvbnN0IFF1ZXJ5TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldEZvcm0gPSBcImZvcm0jZmlsdGVycy1mb3JtXCIpID0+IHtcbiAgICBjb25zdCAkdGFyZ2V0ID0gdHlwZW9mIHRhcmdldEZvcm0gPT09ICdzdHJpbmcnID8gJCh0YXJnZXRGb3JtKSA6IHRhcmdldEZvcm07XG4gICAgbGV0IGxhdCA9IG51bGw7XG4gICAgbGV0IGxuZyA9IG51bGw7XG5cbiAgICBsZXQgcHJldmlvdXMgPSB7fTtcblxuICAgICR0YXJnZXQub24oJ3N1Ym1pdCcsIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBsYXQgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKCk7XG4gICAgICBsbmcgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKCk7XG5cbiAgICAgIHZhciBmb3JtID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuXG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICQucGFyYW0oZm9ybSk7XG4gICAgfSlcblxuICAgICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnc2VsZWN0I2ZpbHRlci1pdGVtcycsICgpID0+IHtcbiAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgfSlcblxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGluaXRpYWxpemU6IChjYWxsYmFjaykgPT4ge1xuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2gubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHZhciBwYXJhbXMgPSAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpKVxuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGFuZ11cIikudmFsKHBhcmFtcy5sYW5nKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKHBhcmFtcy5sYXQpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwocGFyYW1zLmxuZyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChwYXJhbXMuYm91bmQxKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKHBhcmFtcy5ib3VuZDIpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG9jXVwiKS52YWwocGFyYW1zLmxvYyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1rZXldXCIpLnZhbChwYXJhbXMua2V5KTtcblxuICAgICAgICAgIGlmIChwYXJhbXMuZmlsdGVyKSB7XG4gICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIjZmlsdGVyLWl0ZW1zIG9wdGlvblwiKS5yZW1vdmVQcm9wKFwic2VsZWN0ZWRcIik7XG4gICAgICAgICAgICBwYXJhbXMuZmlsdGVyLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICAgICR0YXJnZXQuZmluZChcIiNmaWx0ZXItaXRlbXMgb3B0aW9uW3ZhbHVlPSdcIiArIGl0ZW0gKyBcIiddXCIpLnByb3AoXCJzZWxlY3RlZFwiLCB0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZ2V0UGFyYW1ldGVyczogKCkgPT4ge1xuICAgICAgICB2YXIgcGFyYW1ldGVycyA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcbiAgICAgICAgLy8gcGFyYW1ldGVyc1snbG9jYXRpb24nXSA7XG5cbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gcGFyYW1ldGVycykge1xuICAgICAgICAgIGlmICggIXBhcmFtZXRlcnNba2V5XSB8fCBwYXJhbWV0ZXJzW2tleV0gPT0gXCJcIikge1xuICAgICAgICAgICAgZGVsZXRlIHBhcmFtZXRlcnNba2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyYW1ldGVycztcbiAgICAgIH0sXG4gICAgICB1cGRhdGVMb2NhdGlvbjogKGxhdCwgbG5nKSA9PiB7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwobGF0KTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChsbmcpO1xuICAgICAgICAvLyAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZVZpZXdwb3J0OiAodmlld3BvcnQpID0+IHtcblxuICAgICAgICBjb25zdCBib3VuZHMgPSBbW3ZpZXdwb3J0LmYuYiwgdmlld3BvcnQuYi5iXSwgW3ZpZXdwb3J0LmYuZiwgdmlld3BvcnQuYi5mXV07XG5cbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMF0pKTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMV0pKTtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVWaWV3cG9ydEJ5Qm91bmQ6IChzdywgbmUpID0+IHtcblxuICAgICAgICBjb25zdCBib3VuZHMgPSBbc3csIG5lXTsvLy8vLy8vL1xuXG5cbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMF0pKTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMV0pKTtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyU3VibWl0OiAoKSA9PiB7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59KShqUXVlcnkpO1xuIiwibGV0IGF1dG9jb21wbGV0ZU1hbmFnZXI7XG5sZXQgbWFwTWFuYWdlcjtcblxud2luZG93LkRFRkFVTFRfSUNPTiA9IFwiL2ltZy9ldmVudC5wbmdcIjtcbndpbmRvdy5zbHVnaWZ5ID0gKHRleHQpID0+IHRleHQudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xccysvZywgJy0nKSAgICAgICAgICAgLy8gUmVwbGFjZSBzcGFjZXMgd2l0aCAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1teXFx3XFwtXSsvZywgJycpICAgICAgIC8vIFJlbW92ZSBhbGwgbm9uLXdvcmQgY2hhcnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwtXFwtKy9nLCAnLScpICAgICAgICAgLy8gUmVwbGFjZSBtdWx0aXBsZSAtIHdpdGggc2luZ2xlIC1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXi0rLywgJycpICAgICAgICAgICAgIC8vIFRyaW0gLSBmcm9tIHN0YXJ0IG9mIHRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvLSskLywgJycpOyAgICAgICAgICAgIC8vIFRyaW0gLSBmcm9tIGVuZCBvZiB0ZXh0XG4oZnVuY3Rpb24oJCkge1xuICAvLyBMb2FkIHRoaW5nc1xuXG4gIHdpbmRvdy5xdWVyaWVzID0gICQuZGVwYXJhbSh3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cmluZygxKSk7XG5cbiAgY29uc3QgYnVpbGRGaWx0ZXJzID0gKCkgPT4geyQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5tdWx0aXNlbGVjdCh7XG4gICAgICBlbmFibGVIVE1MOiB0cnVlLFxuICAgICAgdGVtcGxhdGVzOiB7XG4gICAgICAgIGJ1dHRvbjogJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwibXVsdGlzZWxlY3QgZHJvcGRvd24tdG9nZ2xlXCIgZGF0YS10b2dnbGU9XCJkcm9wZG93blwiPjxzcGFuIGRhdGEtbGFuZy10YXJnZXQ9XCJ0ZXh0XCIgZGF0YS1sYW5nLWtleT1cIm1vcmUtc2VhcmNoLW9wdGlvbnNcIj48L3NwYW4+IDxzcGFuIGNsYXNzPVwiZmEgZmEtY2FyZXQtZG93blwiPjwvc3Bhbj48L2J1dHRvbj4nLFxuICAgICAgICBsaTogJzxsaT48YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPjxsYWJlbD48L2xhYmVsPjwvYT48L2xpPidcbiAgICAgIH0sXG4gICAgICBkcm9wUmlnaHQ6IHRydWUsXG4gICAgICBvbkluaXRpYWxpemVkOiAoKSA9PiB7XG5cbiAgICAgIH0sXG4gICAgICBvbkRyb3Bkb3duU2hvdzogKCkgPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwibW9iaWxlLXVwZGF0ZS1tYXAtaGVpZ2h0XCIpO1xuICAgICAgICB9LCAxMCk7XG5cbiAgICAgIH0sXG4gICAgICBvbkRyb3Bkb3duSGlkZTogKCkgPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwibW9iaWxlLXVwZGF0ZS1tYXAtaGVpZ2h0XCIpO1xuICAgICAgICB9LCAxMCk7XG4gICAgICB9LFxuICAgICAgb3B0aW9uTGFiZWw6IChlKSA9PiB7XG4gICAgICAgIC8vIGxldCBlbCA9ICQoICc8ZGl2PjwvZGl2PicgKTtcbiAgICAgICAgLy8gZWwuYXBwZW5kKCgpICsgXCJcIik7XG5cbiAgICAgICAgcmV0dXJuIHVuZXNjYXBlKCQoZSkuYXR0cignbGFiZWwnKSkgfHwgJChlKS5odG1sKCk7XG4gICAgICB9LFxuICAgIH0pO1xuICB9O1xuICBidWlsZEZpbHRlcnMoKTtcblxuXG4gICQoJ3NlbGVjdCNsYW5ndWFnZS1vcHRzJykubXVsdGlzZWxlY3Qoe1xuICAgIGVuYWJsZUhUTUw6IHRydWUsXG4gICAgb3B0aW9uQ2xhc3M6ICgpID0+ICdsYW5nLW9wdCcsXG4gICAgc2VsZWN0ZWRDbGFzczogKCkgPT4gJ2xhbmctc2VsJyxcbiAgICBidXR0b25DbGFzczogKCkgPT4gJ2xhbmctYnV0JyxcbiAgICBkcm9wUmlnaHQ6IHRydWUsXG4gICAgb3B0aW9uTGFiZWw6IChlKSA9PiB7XG4gICAgICAvLyBsZXQgZWwgPSAkKCAnPGRpdj48L2Rpdj4nICk7XG4gICAgICAvLyBlbC5hcHBlbmQoKCkgKyBcIlwiKTtcblxuICAgICAgcmV0dXJuIHVuZXNjYXBlKCQoZSkuYXR0cignbGFiZWwnKSkgfHwgJChlKS5odG1sKCk7XG4gICAgfSxcbiAgICBvbkNoYW5nZTogKG9wdGlvbiwgY2hlY2tlZCwgc2VsZWN0KSA9PiB7XG5cbiAgICAgIGNvbnN0IHBhcmFtZXRlcnMgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuICAgICAgcGFyYW1ldGVyc1snbGFuZyddID0gb3B0aW9uLnZhbCgpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItcmVzZXQtbWFwJywgcGFyYW1ldGVycyk7XG5cbiAgICB9XG4gIH0pXG5cbiAgLy8gMS4gZ29vZ2xlIG1hcHMgZ2VvY29kZVxuXG4gIC8vIDIuIGZvY3VzIG1hcCBvbiBnZW9jb2RlICh2aWEgbGF0L2xuZylcbiAgY29uc3QgcXVlcnlNYW5hZ2VyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgICAgIHF1ZXJ5TWFuYWdlci5pbml0aWFsaXplKCk7XG5cbiAgY29uc3QgaW5pdFBhcmFtcyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG5cblxuXG4gIGNvbnN0IGxhbmd1YWdlTWFuYWdlciA9IExhbmd1YWdlTWFuYWdlcigpO1xuXG4gIGNvbnN0IGxpc3RNYW5hZ2VyID0gTGlzdE1hbmFnZXIoe1xuICAgIHJlZmVycmVyOiB3aW5kb3cucXVlcmllcy5yZWZlcnJlcixcbiAgICBzb3VyY2U6IHdpbmRvdy5xdWVyaWVzLnNvdXJjZVxuICB9KTtcblxuXG4gIG1hcE1hbmFnZXIgPSBNYXBNYW5hZ2VyKHtcbiAgICBvbk1vdmU6IChzdywgbmUpID0+IHtcbiAgICAgIC8vIFdoZW4gdGhlIG1hcCBtb3ZlcyBhcm91bmQsIHdlIHVwZGF0ZSB0aGUgbGlzdFxuICAgICAgcXVlcnlNYW5hZ2VyLnVwZGF0ZVZpZXdwb3J0QnlCb3VuZChzdywgbmUpO1xuICAgICAgLy91cGRhdGUgUXVlcnlcbiAgICB9LFxuICAgIHJlZmVycmVyOiB3aW5kb3cucXVlcmllcy5yZWZlcnJlcixcbiAgICBzb3VyY2U6IHdpbmRvdy5xdWVyaWVzLnNvdXJjZVxuICB9KTtcblxuICB3aW5kb3cuaW5pdGlhbGl6ZUF1dG9jb21wbGV0ZUNhbGxiYWNrID0gKCkgPT4ge1xuXG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlciA9IEF1dG9jb21wbGV0ZU1hbmFnZXIoXCJpbnB1dFtuYW1lPSdsb2MnXVwiKTtcbiAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICAgIGlmIChpbml0UGFyYW1zLmxvYyAmJiBpbml0UGFyYW1zLmxvYyAhPT0gJycgJiYgKCFpbml0UGFyYW1zLmJvdW5kMSAmJiAhaW5pdFBhcmFtcy5ib3VuZDIpKSB7XG4gICAgICBtYXBNYW5hZ2VyLmluaXRpYWxpemUoKCkgPT4ge1xuICAgICAgICBtYXBNYW5hZ2VyLmdldENlbnRlckJ5TG9jYXRpb24oaW5pdFBhcmFtcy5sb2MsIChyZXN1bHQpID0+IHtcbiAgICAgICAgICBxdWVyeU1hbmFnZXIudXBkYXRlVmlld3BvcnQocmVzdWx0Lmdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGlmKGluaXRQYXJhbXMubGF0ICYmIGluaXRQYXJhbXMubG5nKSB7XG4gICAgbWFwTWFuYWdlci5zZXRDZW50ZXIoW2luaXRQYXJhbXMubGF0LCBpbml0UGFyYW1zLmxuZ10pO1xuICB9XG5cbiAgLyoqKlxuICAqIExpc3QgRXZlbnRzXG4gICogVGhpcyB3aWxsIHRyaWdnZXIgdGhlIGxpc3QgdXBkYXRlIG1ldGhvZFxuICAqL1xuICAkKGRvY3VtZW50KS5vbignbW9iaWxlLXVwZGF0ZS1tYXAtaGVpZ2h0JywgKGV2ZW50KSA9PiB7XG4gICAgLy9UaGlzIGNoZWNrcyBpZiB3aWR0aCBpcyBmb3IgbW9iaWxlXG4gICAgaWYgKCQod2luZG93KS53aWR0aCgpIDwgNjAwKSB7XG4gICAgICBzZXRUaW1lb3V0KCgpPT4ge1xuICAgICAgICAkKFwiI21hcFwiKS5oZWlnaHQoJChcIiNldmVudHMtbGlzdFwiKS5oZWlnaHQoKSk7XG4gICAgICAgIG1hcE1hbmFnZXIucmVmcmVzaE1hcCgpO1xuICAgICAgfSwgMTApO1xuICAgIH1cbiAgfSlcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICBsaXN0TWFuYWdlci5wb3B1bGF0ZUxpc3Qob3B0aW9ucy5wYXJhbXMpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcblxuICAgIGxpc3RNYW5hZ2VyLnVwZGF0ZUZpbHRlcihvcHRpb25zKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICBsZXQgYm91bmQxLCBib3VuZDI7XG5cbiAgICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMuYm91bmQxIHx8ICFvcHRpb25zLmJvdW5kMikge1xuICAgICAgW2JvdW5kMSwgYm91bmQyXSA9IG1hcE1hbmFnZXIuZ2V0Qm91bmRzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJvdW5kMSA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDEpO1xuICAgICAgYm91bmQyID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMik7XG4gICAgfVxuXG4gICAgbGlzdE1hbmFnZXIudXBkYXRlQm91bmRzKGJvdW5kMSwgYm91bmQyKVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1yZXNldC1tYXAnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICB2YXIgY29weSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3B0aW9ucykpO1xuICAgIGRlbGV0ZSBjb3B5WydsbmcnXTtcbiAgICBkZWxldGUgY29weVsnbGF0J107XG4gICAgZGVsZXRlIGNvcHlbJ2JvdW5kMSddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDInXTtcblxuICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJC5wYXJhbShjb3B5KTtcblxuXG4gICAgJChkb2N1bWVudCkudHJpZ2dlcihcInRyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlXCIsIGNvcHkpO1xuICAgICQoXCJzZWxlY3QjZmlsdGVyLWl0ZW1zXCIpLm11bHRpc2VsZWN0KCdkZXN0cm95Jyk7XG4gICAgYnVpbGRGaWx0ZXJzKCk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sb2FkLWdyb3VwcycsIHsgZ3JvdXBzOiB3aW5kb3cuRVZFTlRTX0RBVEEuZ3JvdXBzIH0pO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwidHJpZ2dlci1sYW5ndWFnZS11cGRhdGVcIiwgY29weSk7XG4gICAgfSwgMTAwMCk7XG4gIH0pO1xuXG5cbiAgLyoqKlxuICAqIE1hcCBFdmVudHNcbiAgKi9cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIC8vIG1hcE1hbmFnZXIuc2V0Q2VudGVyKFtvcHRpb25zLmxhdCwgb3B0aW9ucy5sbmddKTtcbiAgICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMuYm91bmQxIHx8ICFvcHRpb25zLmJvdW5kMikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBib3VuZDEgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQxKTtcbiAgICB2YXIgYm91bmQyID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMik7XG5cbiAgICBtYXBNYW5hZ2VyLnNldEJvdW5kcyhib3VuZDEsIGJvdW5kMik7XG4gICAgLy8gbWFwTWFuYWdlci50cmlnZ2VyWm9vbUVuZCgpO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBtYXBNYW5hZ2VyLnRyaWdnZXJab29tRW5kKCk7XG4gICAgfSwgMTApO1xuXG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsIFwiI2NvcHktZW1iZWRcIiwgKGUpID0+IHtcbiAgICB2YXIgY29weVRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVtYmVkLXRleHRcIik7XG4gICAgY29weVRleHQuc2VsZWN0KCk7XG4gICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJDb3B5XCIpO1xuICB9KTtcblxuICAvLyAzLiBtYXJrZXJzIG9uIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtcGxvdCcsIChlLCBvcHQpID0+IHtcblxuICAgIG1hcE1hbmFnZXIucGxvdFBvaW50cyhvcHQuZGF0YSwgb3B0LnBhcmFtcywgb3B0Lmdyb3Vwcyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJyk7XG4gIH0pXG5cbiAgLy8gbG9hZCBncm91cHNcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sb2FkLWdyb3VwcycsIChlLCBvcHQpID0+IHtcbiAgICAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykuZW1wdHkoKTtcbiAgICBvcHQuZ3JvdXBzLmZvckVhY2goKGl0ZW0pID0+IHtcblxuICAgICAgbGV0IHNsdWdnZWQgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuICAgICAgbGV0IHZhbHVlVGV4dCA9IGxhbmd1YWdlTWFuYWdlci5nZXRUcmFuc2xhdGlvbihpdGVtLnRyYW5zbGF0aW9uKTtcbiAgICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5hcHBlbmQoYFxuICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0nJHtzbHVnZ2VkfSdcbiAgICAgICAgICAgICAgc2VsZWN0ZWQ9J3NlbGVjdGVkJ1xuICAgICAgICAgICAgICBsYWJlbD1cIjxzcGFuIGRhdGEtbGFuZy10YXJnZXQ9J3RleHQnIGRhdGEtbGFuZy1rZXk9JyR7aXRlbS50cmFuc2xhdGlvbn0nPiR7dmFsdWVUZXh0fTwvc3Bhbj48aW1nIHNyYz0nJHtpdGVtLmljb251cmwgfHwgd2luZG93LkRFRkFVTFRfSUNPTn0nIC8+XCI+XG4gICAgICAgICAgICA8L29wdGlvbj5gKVxuICAgIH0pO1xuXG4gICAgLy8gUmUtaW5pdGlhbGl6ZVxuICAgIHF1ZXJ5TWFuYWdlci5pbml0aWFsaXplKCk7XG4gICAgLy8gJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KCdkZXN0cm95Jyk7XG4gICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KCdyZWJ1aWxkJyk7XG5cbiAgICBtYXBNYW5hZ2VyLnJlZnJlc2hNYXAoKTtcblxuXG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sYW5ndWFnZS11cGRhdGUnKTtcblxuICB9KVxuXG4gIC8vIEZpbHRlciBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLWZpbHRlcicsIChlLCBvcHQpID0+IHtcbiAgICBpZiAob3B0KSB7XG4gICAgICBtYXBNYW5hZ2VyLmZpbHRlck1hcChvcHQuZmlsdGVyKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZScsIChlLCBvcHQpID0+IHtcblxuICAgIGlmIChvcHQpIHtcblxuICAgICAgbGFuZ3VhZ2VNYW5hZ2VyLnVwZGF0ZUxhbmd1YWdlKG9wdC5sYW5nKTtcbiAgICB9IGVsc2Uge1xuXG4gICAgICBsYW5ndWFnZU1hbmFnZXIucmVmcmVzaCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGFuZ3VhZ2UtbG9hZGVkJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5tdWx0aXNlbGVjdCgncmVidWlsZCcpO1xuICB9KVxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24jc2hvdy1oaWRlLW1hcCcsIChlLCBvcHQpID0+IHtcbiAgICAkKCdib2R5JykudG9nZ2xlQ2xhc3MoJ21hcC12aWV3JylcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbi5idG4ubW9yZS1pdGVtcycsIChlLCBvcHQpID0+IHtcbiAgICAkKCcjZW1iZWQtYXJlYScpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgKGUsIG9wdCkgPT4ge1xuICAgIC8vdXBkYXRlIGVtYmVkIGxpbmVcbiAgICB2YXIgY29weSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3B0KSk7XG4gICAgZGVsZXRlIGNvcHlbJ2xuZyddO1xuICAgIGRlbGV0ZSBjb3B5WydsYXQnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQxJ107XG4gICAgZGVsZXRlIGNvcHlbJ2JvdW5kMiddO1xuXG4gICAgJCgnI2VtYmVkLWFyZWEgaW5wdXRbbmFtZT1lbWJlZF0nKS52YWwoJ2h0dHBzOi8vbmV3LW1hcC4zNTAub3JnIycgKyAkLnBhcmFtKGNvcHkpKTtcbiAgfSk7XG5cblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uI3pvb20tb3V0JywgKGUsIG9wdCkgPT4ge1xuXG4gICAgLy8gbWFwTWFuYWdlci56b29tT3V0T25jZSgpO1xuXG4gICAgbWFwTWFuYWdlci56b29tVW50aWxIaXQoKTtcbiAgfSlcblxuICAkKHdpbmRvdykub24oXCJyZXNpemVcIiwgKGUpID0+IHtcbiAgICBtYXBNYW5hZ2VyLnJlZnJlc2hNYXAoKTtcbiAgfSk7XG5cbiAgLyoqXG4gIEZpbHRlciBDaGFuZ2VzXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgXCIuc2VhcmNoLWJ1dHRvbiBidXR0b25cIiwgKGUpID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcihcInNlYXJjaC5mb3JjZS1zZWFyY2gtbG9jYXRpb25cIik7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbihcImtleXVwXCIsIFwiaW5wdXRbbmFtZT0nbG9jJ11cIiwgKGUpID0+IHtcbiAgICBpZiAoZS5rZXlDb2RlID09IDEzKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCdzZWFyY2guZm9yY2Utc2VhcmNoLWxvY2F0aW9uJyk7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignc2VhcmNoLmZvcmNlLXNlYXJjaC1sb2NhdGlvbicsICgpID0+IHtcbiAgICBsZXQgX3F1ZXJ5ID0gJChcImlucHV0W25hbWU9J2xvYyddXCIpLnZhbCgpO1xuICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuZm9yY2VTZWFyY2goX3F1ZXJ5KTtcbiAgICAvLyBTZWFyY2ggZ29vZ2xlIGFuZCBnZXQgdGhlIGZpcnN0IHJlc3VsdC4uLiBhdXRvY29tcGxldGU/XG4gIH0pO1xuXG4gICQod2luZG93KS5vbihcImhhc2hjaGFuZ2VcIiwgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgIGlmIChoYXNoLmxlbmd0aCA9PSAwKSByZXR1cm47XG4gICAgY29uc3QgcGFyYW1ldGVycyA9ICQuZGVwYXJhbShoYXNoLnN1YnN0cmluZygxKSk7XG4gICAgY29uc3Qgb2xkVVJMID0gZXZlbnQub3JpZ2luYWxFdmVudC5vbGRVUkw7XG5cblxuICAgIGNvbnN0IG9sZEhhc2ggPSAkLmRlcGFyYW0ob2xkVVJMLnN1YnN0cmluZyhvbGRVUkwuc2VhcmNoKFwiI1wiKSsxKSk7XG5cblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcblxuICAgIC8vIFNvIHRoYXQgY2hhbmdlIGluIGZpbHRlcnMgd2lsbCBub3QgdXBkYXRlIHRoaXNcbiAgICBpZiAob2xkSGFzaC5ib3VuZDEgIT09IHBhcmFtZXRlcnMuYm91bmQxIHx8IG9sZEhhc2guYm91bmQyICE9PSBwYXJhbWV0ZXJzLmJvdW5kMikge1xuXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLWJ5LWJvdW5kJywgcGFyYW1ldGVycyk7XG4gICAgfVxuXG4gICAgaWYgKG9sZEhhc2gubG9nICE9PSBwYXJhbWV0ZXJzLmxvYykge1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcGFyYW1ldGVycyk7XG5cbiAgICB9XG5cbiAgICAvLyBDaGFuZ2UgaXRlbXNcbiAgICBpZiAob2xkSGFzaC5sYW5nICE9PSBwYXJhbWV0ZXJzLmxhbmcpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgfVxuICB9KVxuXG4gIC8vIDQuIGZpbHRlciBvdXQgaXRlbXMgaW4gYWN0aXZpdHktYXJlYVxuXG4gIC8vIDUuIGdldCBtYXAgZWxlbWVudHNcblxuICAvLyA2LiBnZXQgR3JvdXAgZGF0YVxuXG4gIC8vIDcuIHByZXNlbnQgZ3JvdXAgZWxlbWVudHNcblxuICAkLndoZW4oKCk9Pnt9KVxuICAgIC50aGVuKCgpID0+e1xuICAgICAgcmV0dXJuIGxhbmd1YWdlTWFuYWdlci5pbml0aWFsaXplKGluaXRQYXJhbXNbJ2xhbmcnXSB8fCAnZW4nKTtcbiAgICB9KVxuICAgIC5kb25lKChkYXRhKSA9PiB7fSlcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICAkLmFqYXgoe1xuICAgICAgICAgIHVybDogJ2h0dHBzOi8vbmV3LW1hcC4zNTAub3JnL291dHB1dC8zNTBvcmctbmV3LWxheW91dC5qcy5neicsIC8vJ3wqKkRBVEFfU09VUkNFKip8JyxcbiAgICAgICAgICAvLyB1cmw6ICcvZGF0YS90ZXN0LmpzJywgLy8nfCoqREFUQV9TT1VSQ0UqKnwnLFxuICAgICAgICAgIGRhdGFUeXBlOiAnc2NyaXB0JyxcbiAgICAgICAgICBjYWNoZTogdHJ1ZSxcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgLy8gd2luZG93LkVWRU5UU19EQVRBID0gZGF0YTtcblxuICAgICAgICAgICAgLy9Mb2FkIGdyb3Vwc1xuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sb2FkLWdyb3VwcycsIHsgZ3JvdXBzOiB3aW5kb3cuRVZFTlRTX0RBVEEuZ3JvdXBzIH0pO1xuXG5cbiAgICAgICAgICAgIHZhciBwYXJhbWV0ZXJzID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuICAgICAgICAgICAgd2luZG93LkVWRU5UU19EQVRBLmRhdGEuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICBpdGVtWydldmVudF90eXBlJ10gPSAhaXRlbS5ldmVudF90eXBlID8gJ0FjdGlvbicgOiBpdGVtLmV2ZW50X3R5cGU7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LXVwZGF0ZScsIHsgcGFyYW1zOiBwYXJhbWV0ZXJzIH0pO1xuICAgICAgICAgICAgLy8gJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXBsb3QnLCB7XG4gICAgICAgICAgICAgICAgZGF0YTogd2luZG93LkVWRU5UU19EQVRBLmRhdGEsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiBwYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICAgIGdyb3Vwczogd2luZG93LkVWRU5UU19EQVRBLmdyb3Vwcy5yZWR1Y2UoKGRpY3QsIGl0ZW0pPT57IGRpY3RbaXRlbS5zdXBlcmdyb3VwXSA9IGl0ZW07IHJldHVybiBkaWN0OyB9LCB7fSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgLy8gfSk7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgLy9UT0RPOiBNYWtlIHRoZSBnZW9qc29uIGNvbnZlcnNpb24gaGFwcGVuIG9uIHRoZSBiYWNrZW5kXG5cbiAgICAgICAgICAgIC8vUmVmcmVzaCB0aGluZ3NcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICBsZXQgcCA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG5cbiAgICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcCk7XG4gICAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicsIHApO1xuXG4gICAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcCk7XG4gICAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCBwKTtcblxuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cblxuXG59KShqUXVlcnkpO1xuIl19
