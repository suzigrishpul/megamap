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
  return text.toString().toLowerCase().replace(/\s+/g, '-') // Replace spaces with -
  .replace(/[^\w\-]+/g, '') // Remove all non-word chars
  .replace(/\-\-+/g, '-') // Replace multiple - with single -
  .replace(/^-+/, '') // Trim - from start of text
  .replace(/-+$/, '');
}; // Trim - from end of text
(function ($) {
  // Load things

  window.queries = $.deparam(window.location.search.substring(1));

  if (window.queries.campaign) {
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
        //TODO: Change supergroup to campaign once connected
        if (window.queries.campaign) {
          console.log(window.queries.campaign);
          window.EVENTS_DATA.data = window.EVENTS_DATA.data.filter(function (i) {
            return i.supergroup == window.queries.campaign;
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9oZWxwZXIuanMiLCJjbGFzc2VzL2xhbmd1YWdlLmpzIiwiY2xhc3Nlcy9saXN0LmpzIiwiY2xhc3Nlcy9tYXAuanMiLCJjbGFzc2VzL3F1ZXJ5LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIkF1dG9jb21wbGV0ZU1hbmFnZXIiLCIkIiwidGFyZ2V0IiwiQVBJX0tFWSIsInRhcmdldEl0ZW0iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJxdWVyeU1nciIsIlF1ZXJ5TWFuYWdlciIsImdlb2NvZGVyIiwiZ29vZ2xlIiwibWFwcyIsIkdlb2NvZGVyIiwiJHRhcmdldCIsImZvcmNlU2VhcmNoIiwicSIsImdlb2NvZGUiLCJhZGRyZXNzIiwicmVzdWx0cyIsInN0YXR1cyIsImdlb21ldHJ5IiwidXBkYXRlVmlld3BvcnQiLCJ2aWV3cG9ydCIsInZhbCIsImZvcm1hdHRlZF9hZGRyZXNzIiwiaW5pdGlhbGl6ZSIsInR5cGVhaGVhZCIsImhpbnQiLCJoaWdobGlnaHQiLCJtaW5MZW5ndGgiLCJjbGFzc05hbWVzIiwibWVudSIsIm5hbWUiLCJkaXNwbGF5IiwiaXRlbSIsImxpbWl0Iiwic291cmNlIiwic3luYyIsImFzeW5jIiwib24iLCJvYmoiLCJkYXR1bSIsImpRdWVyeSIsIkhlbHBlciIsInJlZlNvdXJjZSIsInVybCIsInJlZiIsInNyYyIsImluZGV4T2YiLCJMYW5ndWFnZU1hbmFnZXIiLCJsYW5ndWFnZSIsImRpY3Rpb25hcnkiLCIkdGFyZ2V0cyIsInVwZGF0ZVBhZ2VMYW5ndWFnZSIsInRhcmdldExhbmd1YWdlIiwicm93cyIsImZpbHRlciIsImkiLCJsYW5nIiwiZWFjaCIsImluZGV4IiwidGFyZ2V0QXR0cmlidXRlIiwiZGF0YSIsImxhbmdUYXJnZXQiLCJ0ZXh0IiwiYXR0ciIsInRhcmdldHMiLCJhamF4IiwiZGF0YVR5cGUiLCJzdWNjZXNzIiwidHJpZ2dlciIsIm11bHRpc2VsZWN0IiwicmVmcmVzaCIsInVwZGF0ZUxhbmd1YWdlIiwiZ2V0VHJhbnNsYXRpb24iLCJrZXkiLCJMaXN0TWFuYWdlciIsIm9wdGlvbnMiLCJ0YXJnZXRMaXN0IiwicmVmZXJyZXIiLCJyZW5kZXJFdmVudCIsImRhdGUiLCJtb21lbnQiLCJzdGFydF9kYXRldGltZSIsImZvcm1hdCIsIm1hdGNoIiwid2luZG93Iiwic2x1Z2lmeSIsImV2ZW50X3R5cGUiLCJsYXQiLCJsbmciLCJ0aXRsZSIsInZlbnVlIiwicmVuZGVyR3JvdXAiLCJ3ZWJzaXRlIiwic3VwZXJHcm91cCIsInN1cGVyZ3JvdXAiLCJsb2NhdGlvbiIsImRlc2NyaXB0aW9uIiwiJGxpc3QiLCJ1cGRhdGVGaWx0ZXIiLCJwIiwicmVtb3ZlUHJvcCIsImFkZENsYXNzIiwiam9pbiIsImZpbmQiLCJoaWRlIiwiZm9yRWFjaCIsImZpbCIsInNob3ciLCJ1cGRhdGVCb3VuZHMiLCJib3VuZDEiLCJib3VuZDIiLCJpbmQiLCJfbGF0IiwiX2xuZyIsInJlbW92ZUNsYXNzIiwiX3Zpc2libGUiLCJsZW5ndGgiLCJwb3B1bGF0ZUxpc3QiLCJoYXJkRmlsdGVycyIsImtleVNldCIsInNwbGl0IiwiJGV2ZW50TGlzdCIsIkVWRU5UU19EQVRBIiwibWFwIiwidG9Mb3dlckNhc2UiLCJpbmNsdWRlcyIsInJlbW92ZSIsImFwcGVuZCIsIk1hcE1hbmFnZXIiLCJMQU5HVUFHRSIsInJlbmRlckdlb2pzb24iLCJsaXN0IiwicmVuZGVyZWQiLCJpc05hTiIsInBhcnNlRmxvYXQiLCJzdWJzdHJpbmciLCJ0eXBlIiwiY29vcmRpbmF0ZXMiLCJwcm9wZXJ0aWVzIiwiZXZlbnRQcm9wZXJ0aWVzIiwicG9wdXBDb250ZW50IiwiYWNjZXNzVG9rZW4iLCJMIiwiZHJhZ2dpbmciLCJCcm93c2VyIiwibW9iaWxlIiwic2V0VmlldyIsInNjcm9sbFdoZWVsWm9vbSIsImRpc2FibGUiLCJvbk1vdmUiLCJldmVudCIsInN3IiwiZ2V0Qm91bmRzIiwiX3NvdXRoV2VzdCIsIm5lIiwiX25vcnRoRWFzdCIsImdldFpvb20iLCJ0aWxlTGF5ZXIiLCJhdHRyaWJ1dGlvbiIsImFkZFRvIiwiJG1hcCIsImNhbGxiYWNrIiwic2V0Qm91bmRzIiwiYm91bmRzMSIsImJvdW5kczIiLCJib3VuZHMiLCJmaXRCb3VuZHMiLCJzZXRDZW50ZXIiLCJjZW50ZXIiLCJ6b29tIiwiZ2V0Q2VudGVyQnlMb2NhdGlvbiIsInRyaWdnZXJab29tRW5kIiwiZmlyZUV2ZW50Iiwiem9vbU91dE9uY2UiLCJ6b29tT3V0Iiwiem9vbVVudGlsSGl0IiwiJHRoaXMiLCJpbnRlcnZhbEhhbmRsZXIiLCJzZXRJbnRlcnZhbCIsImNsZWFySW50ZXJ2YWwiLCJyZWZyZXNoTWFwIiwiaW52YWxpZGF0ZVNpemUiLCJmaWx0ZXJNYXAiLCJmaWx0ZXJzIiwicGxvdFBvaW50cyIsImdyb3VwcyIsImdlb2pzb24iLCJmZWF0dXJlcyIsImdlb0pTT04iLCJwb2ludFRvTGF5ZXIiLCJmZWF0dXJlIiwibGF0bG5nIiwiZXZlbnRUeXBlIiwic2x1Z2dlZCIsImljb25VcmwiLCJpY29udXJsIiwic21hbGxJY29uIiwiaWNvbiIsImljb25TaXplIiwiaWNvbkFuY2hvciIsImNsYXNzTmFtZSIsImdlb2pzb25NYXJrZXJPcHRpb25zIiwibWFya2VyIiwib25FYWNoRmVhdHVyZSIsImxheWVyIiwiYmluZFBvcHVwIiwidXBkYXRlIiwibGF0TG5nIiwidGFyZ2V0Rm9ybSIsInByZXZpb3VzIiwiZSIsInByZXZlbnREZWZhdWx0IiwiZm9ybSIsImRlcGFyYW0iLCJzZXJpYWxpemUiLCJoYXNoIiwicGFyYW0iLCJwYXJhbXMiLCJsb2MiLCJwcm9wIiwiZ2V0UGFyYW1ldGVycyIsInBhcmFtZXRlcnMiLCJ1cGRhdGVMb2NhdGlvbiIsImYiLCJiIiwiSlNPTiIsInN0cmluZ2lmeSIsInVwZGF0ZVZpZXdwb3J0QnlCb3VuZCIsInRyaWdnZXJTdWJtaXQiLCJhdXRvY29tcGxldGVNYW5hZ2VyIiwibWFwTWFuYWdlciIsIkRFRkFVTFRfSUNPTiIsInRvU3RyaW5nIiwicmVwbGFjZSIsInF1ZXJpZXMiLCJzZWFyY2giLCJjYW1wYWlnbiIsInBhcmVudCIsImNzcyIsImJ1aWxkRmlsdGVycyIsImVuYWJsZUhUTUwiLCJ0ZW1wbGF0ZXMiLCJidXR0b24iLCJsaSIsImRyb3BSaWdodCIsIm9uSW5pdGlhbGl6ZWQiLCJvbkRyb3Bkb3duU2hvdyIsInNldFRpbWVvdXQiLCJvbkRyb3Bkb3duSGlkZSIsIm9wdGlvbkxhYmVsIiwidW5lc2NhcGUiLCJodG1sIiwib3B0aW9uQ2xhc3MiLCJzZWxlY3RlZENsYXNzIiwiYnV0dG9uQ2xhc3MiLCJvbkNoYW5nZSIsIm9wdGlvbiIsImNoZWNrZWQiLCJzZWxlY3QiLCJxdWVyeU1hbmFnZXIiLCJpbml0UGFyYW1zIiwibGFuZ3VhZ2VNYW5hZ2VyIiwibGlzdE1hbmFnZXIiLCJpbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2siLCJyZXN1bHQiLCJ3aWR0aCIsImhlaWdodCIsInBhcnNlIiwiY29weSIsImNvcHlUZXh0IiwiZ2V0RWxlbWVudEJ5SWQiLCJleGVjQ29tbWFuZCIsIm9wdCIsImVtcHR5IiwidmFsdWVUZXh0IiwidHJhbnNsYXRpb24iLCJ0b2dnbGVDbGFzcyIsImtleUNvZGUiLCJfcXVlcnkiLCJvbGRVUkwiLCJvcmlnaW5hbEV2ZW50Iiwib2xkSGFzaCIsImxvZyIsIndoZW4iLCJ0aGVuIiwiZG9uZSIsImNhY2hlIiwiY29uc29sZSIsInJlZHVjZSIsImRpY3QiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7O0FBQ0EsSUFBTUEsc0JBQXVCLFVBQVNDLENBQVQsRUFBWTtBQUN2Qzs7QUFFQSxTQUFPLFVBQUNDLE1BQUQsRUFBWTs7QUFFakIsUUFBTUMsVUFBVSx5Q0FBaEI7QUFDQSxRQUFNQyxhQUFhLE9BQU9GLE1BQVAsSUFBaUIsUUFBakIsR0FBNEJHLFNBQVNDLGFBQVQsQ0FBdUJKLE1BQXZCLENBQTVCLEdBQTZEQSxNQUFoRjtBQUNBLFFBQU1LLFdBQVdDLGNBQWpCO0FBQ0EsUUFBSUMsV0FBVyxJQUFJ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QVFyRyxPQUFPc0MsV0FBUCxDQUFtQitELE1BQW5CLENBQTBCdUcsTUFBMUIsQ0FBaUMsVUFBQ0MsSUFBRCxFQUFPalEsSUFBUCxFQUFjO0FBQUVpUSxpQkFBS2pRLEtBQUs4RCxVQUFWLElBQXdCOUQsSUFBeEIsQ0FBOEIsT0FBT2lRLElBQVA7QUFBYyxXQUE3RixFQUErRixFQUEvRjtBQUg0QixTQUF4QztBQUtOO0FBQ01sUyxVQUFFSSxRQUFGLEVBQVlpRSxPQUFaLENBQW9CLHNCQUFwQixFQUE0Q3lKLFVBQTVDO0FBQ0E7O0FBRUE7QUFDQTBCLG1CQUFXLFlBQU07QUFDZixjQUFJcEosSUFBSWdLLGFBQWF2QyxhQUFiLEVBQVI7O0FBRUE3TixZQUFFSSxRQUFGLEVBQVlpRSxPQUFaLENBQW9CLG9CQUFwQixFQUEwQytCLENBQTFDO0FBQ0FwRyxZQUFFSSxRQUFGLEVBQVlpRSxPQUFaLENBQW9CLG9CQUFwQixFQUEwQytCLENBQTFDOztBQUVBcEcsWUFBRUksUUFBRixFQUFZaUUsT0FBWixDQUFvQiw0QkFBcEIsRUFBa0QrQixDQUFsRDtBQUNBcEcsWUFBRUksUUFBRixFQUFZaUUsT0FBWixDQUFvQiw4QkFBcEIsRUFBb0QrQixDQUFwRDtBQUVELFNBVEQsRUFTRyxHQVRIO0FBVUQ7QUE3Q0UsS0FBUDtBQStDQyxHQXJETDtBQXlERCxDQTNZRCxFQTJZRzNELE1BM1lIIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuLy9BUEkgOkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVxuY29uc3QgQXV0b2NvbXBsZXRlTWFuYWdlciA9IChmdW5jdGlvbigkKSB7XG4gIC8vSW5pdGlhbGl6YXRpb24uLi5cblxuICByZXR1cm4gKHRhcmdldCkgPT4ge1xuXG4gICAgY29uc3QgQVBJX0tFWSA9IFwiQUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXCI7XG4gICAgY29uc3QgdGFyZ2V0SXRlbSA9IHR5cGVvZiB0YXJnZXQgPT0gXCJzdHJpbmdcIiA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KSA6IHRhcmdldDtcbiAgICBjb25zdCBxdWVyeU1nciA9IFF1ZXJ5TWFuYWdlcigpO1xuICAgIHZhciBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICR0YXJnZXQ6ICQodGFyZ2V0SXRlbSksXG4gICAgICB0YXJnZXQ6IHRhcmdldEl0ZW0sXG4gICAgICBmb3JjZVNlYXJjaDogKHEpID0+IHtcbiAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IHEgfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuICAgICAgICAgIGlmIChyZXN1bHRzWzBdKSB7XG4gICAgICAgICAgICBsZXQgZ2VvbWV0cnkgPSByZXN1bHRzWzBdLmdlb21ldHJ5O1xuICAgICAgICAgICAgcXVlcnlNZ3IudXBkYXRlVmlld3BvcnQoZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgJCh0YXJnZXRJdGVtKS52YWwocmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHZhciBnZW9tZXRyeSA9IGRhdHVtLmdlb21ldHJ5O1xuICAgICAgICAgIC8vIHF1ZXJ5TWdyLnVwZGF0ZVZpZXdwb3J0KGdlb21ldHJ5LnZpZXdwb3J0KTtcblxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBpbml0aWFsaXplOiAoKSA9PiB7XG4gICAgICAgICQodGFyZ2V0SXRlbSkudHlwZWFoZWFkKHtcbiAgICAgICAgICAgICAgICAgICAgaGludDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBtaW5MZW5ndGg6IDQsXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICBtZW51OiAndHQtZHJvcGRvd24tbWVudSdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3NlYXJjaC1yZXN1bHRzJyxcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogKGl0ZW0pID0+IGl0ZW0uZm9ybWF0dGVkX2FkZHJlc3MsXG4gICAgICAgICAgICAgICAgICAgIGxpbWl0OiAxMCxcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiBmdW5jdGlvbiAocSwgc3luYywgYXN5bmMpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IHEgfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBhc3luYyhyZXN1bHRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKS5vbigndHlwZWFoZWFkOnNlbGVjdGVkJywgZnVuY3Rpb24gKG9iaiwgZGF0dW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoZGF0dW0pXG4gICAgICAgICAgICAgICAgICAgIHtcblxuICAgICAgICAgICAgICAgICAgICAgIHZhciBnZW9tZXRyeSA9IGRhdHVtLmdlb21ldHJ5O1xuICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5TWdyLnVwZGF0ZVZpZXdwb3J0KGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICAgICAgICAgICAvLyAgbWFwLmZpdEJvdW5kcyhnZW9tZXRyeS5ib3VuZHM/IGdlb21ldHJ5LmJvdW5kcyA6IGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuXG5cbiAgICByZXR1cm4ge1xuXG4gICAgfVxuICB9XG5cbn0oalF1ZXJ5KSk7XG4iLCJjb25zdCBIZWxwZXIgPSAoKCQpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVmU291cmNlOiAodXJsLCByZWYsIHNyYykgPT4ge1xuICAgICAgICAvLyBKdW4gMTMgMjAxOCDigJQgRml4IGZvciBzb3VyY2UgYW5kIHJlZmVycmVyXG4gICAgICAgIGlmIChyZWYgJiYgc3JjKSB7XG4gICAgICAgICAgaWYgKHVybC5pbmRleE9mKFwiP1wiKSA+PSAwKSB7XG4gICAgICAgICAgICB1cmwgPSBgJHt1cmx9JnJlZmVycmVyPSR7cmVmfSZzb3VyY2U9JHtzcmN9YDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXJsID0gYCR7dXJsfT9yZWZlcnJlcj0ke3JlZn0mc291cmNlPSR7c3JjfWA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgIH1cbiAgICB9O1xufSkoalF1ZXJ5KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTGFuZ3VhZ2VNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIC8va2V5VmFsdWVcblxuICAvL3RhcmdldHMgYXJlIHRoZSBtYXBwaW5ncyBmb3IgdGhlIGxhbmd1YWdlXG4gIHJldHVybiAoKSA9PiB7XG4gICAgbGV0IGxhbmd1YWdlO1xuICAgIGxldCBkaWN0aW9uYXJ5ID0ge307XG4gICAgbGV0ICR0YXJnZXRzID0gJChcIltkYXRhLWxhbmctdGFyZ2V0XVtkYXRhLWxhbmcta2V5XVwiKTtcblxuICAgIGNvbnN0IHVwZGF0ZVBhZ2VMYW5ndWFnZSA9ICgpID0+IHtcblxuICAgICAgbGV0IHRhcmdldExhbmd1YWdlID0gZGljdGlvbmFyeS5yb3dzLmZpbHRlcigoaSkgPT4gaS5sYW5nID09PSBsYW5ndWFnZSlbMF07XG5cbiAgICAgICR0YXJnZXRzLmVhY2goKGluZGV4LCBpdGVtKSA9PiB7XG5cbiAgICAgICAgbGV0IHRhcmdldEF0dHJpYnV0ZSA9ICQoaXRlbSkuZGF0YSgnbGFuZy10YXJnZXQnKTtcbiAgICAgICAgbGV0IGxhbmdUYXJnZXQgPSAkKGl0ZW0pLmRhdGEoJ2xhbmcta2V5Jyk7XG5cblxuXG5cbiAgICAgICAgc3dpdGNoKHRhcmdldEF0dHJpYnV0ZSkge1xuICAgICAgICAgIGNhc2UgJ3RleHQnOlxuXG4gICAgICAgICAgICAkKChgW2RhdGEtbGFuZy1rZXk9XCIke2xhbmdUYXJnZXR9XCJdYCkpLnRleHQodGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgaWYgKGxhbmdUYXJnZXQgPT0gXCJtb3JlLXNlYXJjaC1vcHRpb25zXCIpIHtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAndmFsdWUnOlxuICAgICAgICAgICAgJChpdGVtKS52YWwodGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICQoaXRlbSkuYXR0cih0YXJnZXRBdHRyaWJ1dGUsIHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgbGFuZ3VhZ2UsXG4gICAgICB0YXJnZXRzOiAkdGFyZ2V0cyxcbiAgICAgIGRpY3Rpb25hcnksXG4gICAgICBpbml0aWFsaXplOiAobGFuZykgPT4ge1xuXG4gICAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICAgIC8vIHVybDogJ2h0dHBzOi8vZ3N4Mmpzb24uY29tL2FwaT9pZD0xTzNlQnlqTDF2bFlmN1o3YW0tX2h0UlRRaTczUGFmcUlmTkJkTG1YZThTTSZzaGVldD0xJyxcbiAgICAgICAgICB1cmw6ICcvZGF0YS9sYW5nLmpzb24nLFxuICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgc3VjY2VzczogKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGRpY3Rpb25hcnkgPSBkYXRhO1xuICAgICAgICAgICAgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgICAgICAgICAgdXBkYXRlUGFnZUxhbmd1YWdlKCk7XG5cbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtbG9hZGVkJyk7XG5cbiAgICAgICAgICAgICQoXCIjbGFuZ3VhZ2Utb3B0c1wiKS5tdWx0aXNlbGVjdCgnc2VsZWN0JywgbGFuZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICByZWZyZXNoOiAoKSA9PiB7XG4gICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZShsYW5ndWFnZSk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTGFuZ3VhZ2U6IChsYW5nKSA9PiB7XG5cbiAgICAgICAgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UoKTtcbiAgICAgIH0sXG4gICAgICBnZXRUcmFuc2xhdGlvbjogKGtleSkgPT4ge1xuICAgICAgICBsZXQgdGFyZ2V0TGFuZ3VhZ2UgPSBkaWN0aW9uYXJ5LnJvd3MuZmlsdGVyKChpKSA9PiBpLmxhbmcgPT09IGxhbmd1YWdlKVswXTtcbiAgICAgICAgcmV0dXJuIHRhcmdldExhbmd1YWdlW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG59KShqUXVlcnkpO1xuIiwiLyogVGhpcyBsb2FkcyBhbmQgbWFuYWdlcyB0aGUgbGlzdCEgKi9cblxuY29uc3QgTGlzdE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuIChvcHRpb25zKSA9PiB7XG4gICAgbGV0IHRhcmdldExpc3QgPSBvcHRpb25zLnRhcmdldExpc3QgfHwgXCIjZXZlbnRzLWxpc3RcIjtcbiAgICAvLyBKdW5lIDEzIGAxOCDigJMgcmVmZXJyZXIgYW5kIHNvdXJjZVxuICAgIGxldCB7cmVmZXJyZXIsIHNvdXJjZX0gPSBvcHRpb25zO1xuXG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRMaXN0ID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0TGlzdCkgOiB0YXJnZXRMaXN0O1xuXG4gICAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSwgcmVmZXJyZXIgPSBudWxsLCBzb3VyY2UgPSBudWxsKSA9PiB7XG4gICAgICB2YXIgZGF0ZSA9IG1vbWVudChpdGVtLnN0YXJ0X2RhdGV0aW1lKS5mb3JtYXQoXCJkZGRkIE1NTSBERCwgaDptbWFcIik7XG4gICAgICBsZXQgdXJsID0gaXRlbS51cmwubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS51cmwgOiBcIi8vXCIgKyBpdGVtLnVybDtcbiAgICAgIC8vIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICAgIHVybCA9IEhlbHBlci5yZWZTb3VyY2UodXJsLCByZWZlcnJlciwgc291cmNlKTtcblxuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaSBjbGFzcz0nJHt3aW5kb3cuc2x1Z2lmeShpdGVtLmV2ZW50X3R5cGUpfSBldmVudHMgZXZlbnQtb2JqJyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50IHR5cGUtYWN0aW9uXCI+XG4gICAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgICAgPGxpIGNsYXNzPSd0YWctJHtpdGVtLmV2ZW50X3R5cGV9IHRhZyc+JHtpdGVtLmV2ZW50X3R5cGV9PC9saT5cbiAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDxoMiBjbGFzcz1cImV2ZW50LXRpdGxlXCI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWRhdGUgZGF0ZVwiPiR7ZGF0ZX08L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtYWRkcmVzcyBhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICAgIDxwPiR7aXRlbS52ZW51ZX08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5SU1ZQPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIGNvbnN0IHJlbmRlckdyb3VwID0gKGl0ZW0sIHJlZmVycmVyID0gbnVsbCwgc291cmNlID0gbnVsbCkgPT4ge1xuICAgICAgbGV0IHVybCA9IGl0ZW0ud2Vic2l0ZS5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLndlYnNpdGUgOiBcIi8vXCIgKyBpdGVtLndlYnNpdGU7XG4gICAgICBsZXQgc3VwZXJHcm91cCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG5cbiAgICAgIHVybCA9IEhlbHBlci5yZWZTb3VyY2UodXJsLCByZWZlcnJlciwgc291cmNlKTtcblxuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaSBjbGFzcz0nJHtpdGVtLmV2ZW50X3R5cGV9ICR7c3VwZXJHcm91cH0gZ3JvdXAtb2JqJyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwIGdyb3VwLW9ialwiPlxuICAgICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctJHtpdGVtLnN1cGVyZ3JvdXB9XCI+JHtpdGVtLnN1cGVyZ3JvdXB9PC9saT5cbiAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDxoMj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS5uYW1lfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1sb2NhdGlvbiBsb2NhdGlvblwiPiR7aXRlbS5sb2NhdGlvbn08L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXNjcmlwdGlvblwiPlxuICAgICAgICAgICAgICA8cD4ke2l0ZW0uZGVzY3JpcHRpb259PC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICRsaXN0OiAkdGFyZ2V0LFxuICAgICAgdXBkYXRlRmlsdGVyOiAocCkgPT4ge1xuICAgICAgICBpZighcCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIFJlbW92ZSBGaWx0ZXJzXG5cbiAgICAgICAgJHRhcmdldC5yZW1vdmVQcm9wKFwiY2xhc3NcIik7XG4gICAgICAgICR0YXJnZXQuYWRkQ2xhc3MocC5maWx0ZXIgPyBwLmZpbHRlci5qb2luKFwiIFwiKSA6ICcnKVxuXG4gICAgICAgICR0YXJnZXQuZmluZCgnbGknKS5oaWRlKCk7XG5cbiAgICAgICAgaWYgKHAuZmlsdGVyKSB7XG4gICAgICAgICAgcC5maWx0ZXIuZm9yRWFjaCgoZmlsKT0+e1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKGBsaS4ke2ZpbH1gKS5zaG93KCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHVwZGF0ZUJvdW5kczogKGJvdW5kMSwgYm91bmQyKSA9PiB7XG5cbiAgICAgICAgLy8gY29uc3QgYm91bmRzID0gW3AuYm91bmRzMSwgcC5ib3VuZHMyXTtcblxuXG4gICAgICAgICR0YXJnZXQuZmluZCgndWwgbGkuZXZlbnQtb2JqLCB1bCBsaS5ncm91cC1vYmonKS5lYWNoKChpbmQsIGl0ZW0pPT4ge1xuXG4gICAgICAgICAgbGV0IF9sYXQgPSAkKGl0ZW0pLmRhdGEoJ2xhdCcpLFxuICAgICAgICAgICAgICBfbG5nID0gJChpdGVtKS5kYXRhKCdsbmcnKTtcblxuXG4gICAgICAgICAgaWYgKGJvdW5kMVswXSA8PSBfbGF0ICYmIGJvdW5kMlswXSA+PSBfbGF0ICYmIGJvdW5kMVsxXSA8PSBfbG5nICYmIGJvdW5kMlsxXSA+PSBfbG5nKSB7XG5cbiAgICAgICAgICAgICQoaXRlbSkuYWRkQ2xhc3MoJ3dpdGhpbi1ib3VuZCcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKGl0ZW0pLnJlbW92ZUNsYXNzKCd3aXRoaW4tYm91bmQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBfdmlzaWJsZSA9ICR0YXJnZXQuZmluZCgndWwgbGkuZXZlbnQtb2JqLndpdGhpbi1ib3VuZCwgdWwgbGkuZ3JvdXAtb2JqLndpdGhpbi1ib3VuZCcpLmxlbmd0aDtcbiAgICAgICAgaWYgKF92aXNpYmxlID09IDApIHtcbiAgICAgICAgICAvLyBUaGUgbGlzdCBpcyBlbXB0eVxuICAgICAgICAgICR0YXJnZXQuYWRkQ2xhc3MoXCJpcy1lbXB0eVwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkdGFyZ2V0LnJlbW92ZUNsYXNzKFwiaXMtZW1wdHlcIik7XG4gICAgICAgIH1cblxuICAgICAgfSxcbiAgICAgIHBvcHVsYXRlTGlzdDogKGhhcmRGaWx0ZXJzKSA9PiB7XG4gICAgICAgIC8vdXNpbmcgd2luZG93LkVWRU5UX0RBVEFcbiAgICAgICAgY29uc3Qga2V5U2V0ID0gIWhhcmRGaWx0ZXJzLmtleSA/IFtdIDogaGFyZEZpbHRlcnMua2V5LnNwbGl0KCcsJyk7XG5cbiAgICAgICAgdmFyICRldmVudExpc3QgPSB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YS5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgaWYgKGtleVNldC5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0uZXZlbnRfdHlwZSAmJiBpdGVtLmV2ZW50X3R5cGUudG9Mb3dlckNhc2UoKSA9PSAnZ3JvdXAnID8gcmVuZGVyR3JvdXAoaXRlbSkgOiByZW5kZXJFdmVudChpdGVtLCByZWZlcnJlciwgc291cmNlKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtleVNldC5sZW5ndGggPiAwICYmIGl0ZW0uZXZlbnRfdHlwZSAhPSAnZ3JvdXAnICYmIGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyRXZlbnQoaXRlbSwgcmVmZXJyZXIsIHNvdXJjZSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXlTZXQubGVuZ3RoID4gMCAmJiBpdGVtLmV2ZW50X3R5cGUgPT0gJ2dyb3VwJyAmJiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5zdXBlcmdyb3VwKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlbmRlckdyb3VwKGl0ZW0sIHJlZmVycmVyLCBzb3VyY2UpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgfSlcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCBsaScpLnJlbW92ZSgpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsJykuYXBwZW5kKCRldmVudExpc3QpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJcblxuY29uc3QgTWFwTWFuYWdlciA9ICgoJCkgPT4ge1xuICBsZXQgTEFOR1VBR0UgPSAnZW4nO1xuXG4gIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0sIHJlZmVycmVyID0gbnVsbCwgc291cmNlID0gbnVsbCkgPT4ge1xuICAgIHZhciBkYXRlID0gbW9tZW50KGl0ZW0uc3RhcnRfZGF0ZXRpbWUpLmZvcm1hdChcImRkZGQgTU1NIERELCBoOm1tYVwiKTtcbiAgICBsZXQgdXJsID0gaXRlbS51cmwubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS51cmwgOiBcIi8vXCIgKyBpdGVtLnVybDtcblxuICAgIHVybCA9IEhlbHBlci5yZWZTb3VyY2UodXJsLCByZWZlcnJlciwgc291cmNlKTtcblxuICAgIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9J3BvcHVwLWl0ZW0gJHtpdGVtLmV2ZW50X3R5cGV9ICR7c3VwZXJHcm91cH0nIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5ldmVudF90eXBlfVwiPiR7aXRlbS5ldmVudF90eXBlIHx8ICdBY3Rpb24nfTwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxoMiBjbGFzcz1cImV2ZW50LXRpdGxlXCI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1kYXRlXCI+JHtkYXRlfTwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtYWRkcmVzcyBhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+UlNWUDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSwgcmVmZXJyZXIgPSBudWxsLCBzb3VyY2UgPSBudWxsKSA9PiB7XG5cbiAgICBsZXQgdXJsID0gaXRlbS53ZWJzaXRlLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0ud2Vic2l0ZSA6IFwiLy9cIiArIGl0ZW0ud2Vic2l0ZTtcblxuICAgIHVybCA9IEhlbHBlci5yZWZTb3VyY2UodXJsLCByZWZlcnJlciwgc291cmNlKTtcblxuICAgIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICByZXR1cm4gYFxuICAgIDxsaT5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwIGdyb3VwLW9iaiAke3N1cGVyR3JvdXB9XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5zdXBlcmdyb3VwfSAke3N1cGVyR3JvdXB9XCI+JHtpdGVtLnN1cGVyZ3JvdXB9PC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWhlYWRlclwiPlxuICAgICAgICAgIDxoMj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS5uYW1lfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1sb2NhdGlvbiBsb2NhdGlvblwiPiR7aXRlbS5sb2NhdGlvbn08L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGVzY3JpcHRpb25cIj5cbiAgICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9saT5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR2VvanNvbiA9IChsaXN0LCByZWYgPSBudWxsLCBzcmMgPSBudWxsKSA9PiB7XG4gICAgcmV0dXJuIGxpc3QubWFwKChpdGVtKSA9PiB7XG4gICAgICAvLyByZW5kZXJlZCBldmVudFR5cGVcbiAgICAgIGxldCByZW5kZXJlZDtcblxuICAgICAgaWYgKGl0ZW0uZXZlbnRfdHlwZSAmJiBpdGVtLmV2ZW50X3R5cGUudG9Mb3dlckNhc2UoKSA9PSAnZ3JvdXAnKSB7XG4gICAgICAgIHJlbmRlcmVkID0gcmVuZGVyR3JvdXAoaXRlbSwgcmVmLCBzcmMpO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZW5kZXJlZCA9IHJlbmRlckV2ZW50KGl0ZW0sIHJlZiwgc3JjKTtcbiAgICAgIH1cblxuICAgICAgLy8gZm9ybWF0IGNoZWNrXG4gICAgICBpZiAoaXNOYU4ocGFyc2VGbG9hdChwYXJzZUZsb2F0KGl0ZW0ubG5nKSkpKSB7XG4gICAgICAgIGl0ZW0ubG5nID0gaXRlbS5sbmcuc3Vic3RyaW5nKDEpXG4gICAgICB9XG4gICAgICBpZiAoaXNOYU4ocGFyc2VGbG9hdChwYXJzZUZsb2F0KGl0ZW0ubGF0KSkpKSB7XG4gICAgICAgIGl0ZW0ubGF0ID0gaXRlbS5sYXQuc3Vic3RyaW5nKDEpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICB0eXBlOiBcIlBvaW50XCIsXG4gICAgICAgICAgY29vcmRpbmF0ZXM6IFtpdGVtLmxuZywgaXRlbS5sYXRdXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBldmVudFByb3BlcnRpZXM6IGl0ZW0sXG4gICAgICAgICAgcG9wdXBDb250ZW50OiByZW5kZXJlZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAob3B0aW9ucykgPT4ge1xuICAgIHZhciBhY2Nlc3NUb2tlbiA9ICdway5leUoxSWpvaWJXRjBkR2hsZHpNMU1DSXNJbUVpT2lKYVRWRk1Va1V3SW4wLndjTTNYYzhCR0M2UE0tT3lyd2puaGcnO1xuICAgIHZhciBtYXAgPSBMLm1hcCgnbWFwJywgeyBkcmFnZ2luZzogIUwuQnJvd3Nlci5tb2JpbGUgfSkuc2V0VmlldyhbMzQuODg1OTMwOTQwNzUzMTcsIDUuMDk3NjU2MjUwMDAwMDAxXSwgMik7XG5cbiAgICBsZXQge3JlZmVycmVyLCBzb3VyY2V9ID0gb3B0aW9ucztcblxuICAgIGlmICghTC5Ccm93c2VyLm1vYmlsZSkge1xuICAgICAgbWFwLnNjcm9sbFdoZWVsWm9vbS5kaXNhYmxlKCk7XG4gICAgfVxuXG4gICAgTEFOR1VBR0UgPSBvcHRpb25zLmxhbmcgfHwgJ2VuJztcblxuICAgIGlmIChvcHRpb25zLm9uTW92ZSkge1xuICAgICAgbWFwLm9uKCdkcmFnZW5kJywgKGV2ZW50KSA9PiB7XG5cblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuICAgICAgICBvcHRpb25zLm9uTW92ZShzdywgbmUpO1xuICAgICAgfSkub24oJ3pvb21lbmQnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKG1hcC5nZXRab29tKCkgPD0gNCkge1xuICAgICAgICAgICQoXCIjbWFwXCIpLmFkZENsYXNzKFwiem9vbWVkLW91dFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkKFwiI21hcFwiKS5yZW1vdmVDbGFzcyhcInpvb21lZC1vdXRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuICAgICAgICBvcHRpb25zLm9uTW92ZShzdywgbmUpO1xuICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBtYXAuZmlyZUV2ZW50KCd6b29tZW5kJyk7XG5cbiAgICBMLnRpbGVMYXllcignaHR0cHM6Ly9hcGkubWFwYm94LmNvbS9zdHlsZXMvdjEvbWF0dGhldzM1MC9jamE0MXRpamsyN2Q2MnJxb2Q3ZzBseDRiL3RpbGVzLzI1Ni97en0ve3h9L3t5fT9hY2Nlc3NfdG9rZW49JyArIGFjY2Vzc1Rva2VuLCB7XG4gICAgICAgIGF0dHJpYnV0aW9uOiAnJmNvcHk7IDxhIGhyZWY9XCJodHRwOi8vb3NtLm9yZy9jb3B5cmlnaHRcIj5PcGVuU3RyZWV0TWFwPC9hPiBjb250cmlidXRvcnMg4oCiIDxhIGhyZWY9XCIvLzM1MC5vcmdcIj4zNTAub3JnPC9hPidcbiAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgbGV0IGdlb2NvZGVyID0gbnVsbDtcbiAgICByZXR1cm4ge1xuICAgICAgJG1hcDogbWFwLFxuICAgICAgaW5pdGlhbGl6ZTogKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG4gICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBzZXRCb3VuZHM6IChib3VuZHMxLCBib3VuZHMyKSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW2JvdW5kczEsIGJvdW5kczJdO1xuICAgICAgICBtYXAuZml0Qm91bmRzKGJvdW5kcyk7XG4gICAgICB9LFxuICAgICAgc2V0Q2VudGVyOiAoY2VudGVyLCB6b29tID0gMTApID0+IHtcbiAgICAgICAgaWYgKCFjZW50ZXIgfHwgIWNlbnRlclswXSB8fCBjZW50ZXJbMF0gPT0gXCJcIlxuICAgICAgICAgICAgICB8fCAhY2VudGVyWzFdIHx8IGNlbnRlclsxXSA9PSBcIlwiKSByZXR1cm47XG4gICAgICAgIG1hcC5zZXRWaWV3KGNlbnRlciwgem9vbSk7XG4gICAgICB9LFxuICAgICAgZ2V0Qm91bmRzOiAoKSA9PiB7XG5cbiAgICAgICAgbGV0IHN3ID0gW21hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW21hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubG5nXTtcblxuICAgICAgICByZXR1cm4gW3N3LCBuZV07XG4gICAgICB9LFxuICAgICAgLy8gQ2VudGVyIGxvY2F0aW9uIGJ5IGdlb2NvZGVkXG4gICAgICBnZXRDZW50ZXJCeUxvY2F0aW9uOiAobG9jYXRpb24sIGNhbGxiYWNrKSA9PiB7XG5cbiAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IGxvY2F0aW9uIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcblxuICAgICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlc3VsdHNbMF0pXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyWm9vbUVuZDogKCkgPT4ge1xuICAgICAgICBtYXAuZmlyZUV2ZW50KCd6b29tZW5kJyk7XG4gICAgICB9LFxuICAgICAgem9vbU91dE9uY2U6ICgpID0+IHtcbiAgICAgICAgbWFwLnpvb21PdXQoMSk7XG4gICAgICB9LFxuICAgICAgem9vbVVudGlsSGl0OiAoKSA9PiB7XG4gICAgICAgIHZhciAkdGhpcyA9IHRoaXM7XG4gICAgICAgIG1hcC56b29tT3V0KDEpO1xuICAgICAgICBsZXQgaW50ZXJ2YWxIYW5kbGVyID0gbnVsbDtcbiAgICAgICAgaW50ZXJ2YWxIYW5kbGVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgIHZhciBfdmlzaWJsZSA9ICQoZG9jdW1lbnQpLmZpbmQoJ3VsIGxpLmV2ZW50LW9iai53aXRoaW4tYm91bmQsIHVsIGxpLmdyb3VwLW9iai53aXRoaW4tYm91bmQnKS5sZW5ndGg7XG4gICAgICAgICAgaWYgKF92aXNpYmxlID09IDApIHtcbiAgICAgICAgICAgIG1hcC56b29tT3V0KDEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSGFuZGxlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAyMDApO1xuICAgICAgfSxcbiAgICAgIHJlZnJlc2hNYXA6ICgpID0+IHtcbiAgICAgICAgbWFwLmludmFsaWRhdGVTaXplKGZhbHNlKTtcbiAgICAgICAgLy8gbWFwLl9vblJlc2l6ZSgpO1xuICAgICAgICAvLyBtYXAuZmlyZUV2ZW50KCd6b29tZW5kJyk7XG5cblxuICAgICAgfSxcbiAgICAgIGZpbHRlck1hcDogKGZpbHRlcnMpID0+IHtcblxuICAgICAgICAkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXBcIikuaGlkZSgpO1xuXG5cbiAgICAgICAgaWYgKCFmaWx0ZXJzKSByZXR1cm47XG5cbiAgICAgICAgZmlsdGVycy5mb3JFYWNoKChpdGVtKSA9PiB7XG5cbiAgICAgICAgICAkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXAuXCIgKyBpdGVtLnRvTG93ZXJDYXNlKCkpLnNob3coKTtcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICBwbG90UG9pbnRzOiAobGlzdCwgaGFyZEZpbHRlcnMsIGdyb3VwcykgPT4ge1xuICAgICAgICBjb25zdCBrZXlTZXQgPSAhaGFyZEZpbHRlcnMua2V5ID8gW10gOiBoYXJkRmlsdGVycy5rZXkuc3BsaXQoJywnKTtcblxuICAgICAgICBpZiAoa2V5U2V0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsaXN0ID0gbGlzdC5maWx0ZXIoKGl0ZW0pID0+IGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKVxuICAgICAgICB9XG5cblxuICAgICAgICBjb25zdCBnZW9qc29uID0ge1xuICAgICAgICAgIHR5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgICAgICAgICBmZWF0dXJlczogcmVuZGVyR2VvanNvbihsaXN0LCByZWZlcnJlciwgc291cmNlKVxuICAgICAgICB9O1xuXG5cbiAgICAgICAgTC5nZW9KU09OKGdlb2pzb24sIHtcbiAgICAgICAgICAgIHBvaW50VG9MYXllcjogKGZlYXR1cmUsIGxhdGxuZykgPT4ge1xuICAgICAgICAgICAgICAvLyBJY29ucyBmb3IgbWFya2Vyc1xuICAgICAgICAgICAgICBjb25zdCBldmVudFR5cGUgPSBmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLmV2ZW50X3R5cGU7XG5cbiAgICAgICAgICAgICAgLy8gSWYgbm8gc3VwZXJncm91cCwgaXQncyBhbiBldmVudC5cbiAgICAgICAgICAgICAgY29uc3Qgc3VwZXJncm91cCA9IGdyb3Vwc1tmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLnN1cGVyZ3JvdXBdID8gZmVhdHVyZS5wcm9wZXJ0aWVzLmV2ZW50UHJvcGVydGllcy5zdXBlcmdyb3VwIDogXCJFdmVudHNcIjtcbiAgICAgICAgICAgICAgY29uc3Qgc2x1Z2dlZCA9IHdpbmRvdy5zbHVnaWZ5KHN1cGVyZ3JvdXApO1xuICAgICAgICAgICAgICBjb25zdCBpY29uVXJsID0gZ3JvdXBzW3N1cGVyZ3JvdXBdID8gZ3JvdXBzW3N1cGVyZ3JvdXBdLmljb251cmwgfHwgXCIvaW1nL2V2ZW50LnBuZ1wiICA6IFwiL2ltZy9ldmVudC5wbmdcIiA7XG5cbiAgICAgICAgICAgICAgY29uc3Qgc21hbGxJY29uID0gIEwuaWNvbih7XG4gICAgICAgICAgICAgICAgaWNvblVybDogaWNvblVybCxcbiAgICAgICAgICAgICAgICBpY29uU2l6ZTogWzE4LCAxOF0sXG4gICAgICAgICAgICAgICAgaWNvbkFuY2hvcjogWzksIDldLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogc2x1Z2dlZCArICcgZXZlbnQtaXRlbS1wb3B1cCdcbiAgICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgICB2YXIgZ2VvanNvbk1hcmtlck9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgaWNvbjogc21hbGxJY29uLFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICByZXR1cm4gTC5tYXJrZXIobGF0bG5nLCBnZW9qc29uTWFya2VyT3B0aW9ucyk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgb25FYWNoRmVhdHVyZTogKGZlYXR1cmUsIGxheWVyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZmVhdHVyZS5wcm9wZXJ0aWVzICYmIGZlYXR1cmUucHJvcGVydGllcy5wb3B1cENvbnRlbnQpIHtcbiAgICAgICAgICAgICAgbGF5ZXIuYmluZFBvcHVwKGZlYXR1cmUucHJvcGVydGllcy5wb3B1cENvbnRlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSkuYWRkVG8obWFwKTtcblxuICAgICAgfSxcbiAgICAgIHVwZGF0ZTogKHApID0+IHtcbiAgICAgICAgaWYgKCFwIHx8ICFwLmxhdCB8fCAhcC5sbmcgKSByZXR1cm47XG5cbiAgICAgICAgbWFwLnNldFZpZXcoTC5sYXRMbmcocC5sYXQsIHAubG5nKSwgMTApO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJjb25zdCBRdWVyeU1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRGb3JtID0gXCJmb3JtI2ZpbHRlcnMtZm9ybVwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRGb3JtID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0Rm9ybSkgOiB0YXJnZXRGb3JtO1xuICAgIGxldCBsYXQgPSBudWxsO1xuICAgIGxldCBsbmcgPSBudWxsO1xuXG4gICAgbGV0IHByZXZpb3VzID0ge307XG5cbiAgICAkdGFyZ2V0Lm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgbGF0ID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbCgpO1xuICAgICAgbG5nID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbCgpO1xuXG4gICAgICB2YXIgZm9ybSA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcblxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAkLnBhcmFtKGZvcm0pO1xuICAgIH0pXG5cbiAgICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJ3NlbGVjdCNmaWx0ZXItaXRlbXMnLCAoKSA9PiB7XG4gICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgIH0pXG5cblxuICAgIHJldHVybiB7XG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgcGFyYW1zID0gJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSlcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhbmddXCIpLnZhbChwYXJhbXMubGFuZyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChwYXJhbXMubGF0KTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKHBhcmFtcy5sbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwocGFyYW1zLmJvdW5kMSk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChwYXJhbXMuYm91bmQyKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxvY11cIikudmFsKHBhcmFtcy5sb2MpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9a2V5XVwiKS52YWwocGFyYW1zLmtleSk7XG5cbiAgICAgICAgICBpZiAocGFyYW1zLmZpbHRlcikge1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiI2ZpbHRlci1pdGVtcyBvcHRpb25cIikucmVtb3ZlUHJvcChcInNlbGVjdGVkXCIpO1xuICAgICAgICAgICAgcGFyYW1zLmZpbHRlci5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIjZmlsdGVyLWl0ZW1zIG9wdGlvblt2YWx1ZT0nXCIgKyBpdGVtICsgXCInXVwiKS5wcm9wKFwic2VsZWN0ZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGdldFBhcmFtZXRlcnM6ICgpID0+IHtcbiAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG4gICAgICAgIC8vIHBhcmFtZXRlcnNbJ2xvY2F0aW9uJ10gO1xuXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHBhcmFtZXRlcnMpIHtcbiAgICAgICAgICBpZiAoICFwYXJhbWV0ZXJzW2tleV0gfHwgcGFyYW1ldGVyc1trZXldID09IFwiXCIpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBwYXJhbWV0ZXJzW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtZXRlcnM7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTG9jYXRpb246IChsYXQsIGxuZykgPT4ge1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKGxhdCk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwobG5nKTtcbiAgICAgICAgLy8gJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVWaWV3cG9ydDogKHZpZXdwb3J0KSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW1t2aWV3cG9ydC5mLmIsIHZpZXdwb3J0LmIuYl0sIFt2aWV3cG9ydC5mLmYsIHZpZXdwb3J0LmIuZl1dO1xuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlVmlld3BvcnRCeUJvdW5kOiAoc3csIG5lKSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW3N3LCBuZV07Ly8vLy8vLy9cblxuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdHJpZ2dlclN1Ym1pdDogKCkgPT4ge1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSkoalF1ZXJ5KTtcbiIsImxldCBhdXRvY29tcGxldGVNYW5hZ2VyO1xubGV0IG1hcE1hbmFnZXI7XG5cbndpbmRvdy5ERUZBVUxUX0lDT04gPSBcIi9pbWcvZXZlbnQucG5nXCI7XG53aW5kb3cuc2x1Z2lmeSA9ICh0ZXh0KSA9PiB0ZXh0LnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHMrL2csICctJykgICAgICAgICAgIC8vIFJlcGxhY2Ugc3BhY2VzIHdpdGggLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9bXlxcd1xcLV0rL2csICcnKSAgICAgICAvLyBSZW1vdmUgYWxsIG5vbi13b3JkIGNoYXJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcLVxcLSsvZywgJy0nKSAgICAgICAgIC8vIFJlcGxhY2UgbXVsdGlwbGUgLSB3aXRoIHNpbmdsZSAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL14tKy8sICcnKSAgICAgICAgICAgICAvLyBUcmltIC0gZnJvbSBzdGFydCBvZiB0ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLy0rJC8sICcnKTsgICAgICAgICAgICAvLyBUcmltIC0gZnJvbSBlbmQgb2YgdGV4dFxuKGZ1bmN0aW9uKCQpIHtcbiAgLy8gTG9hZCB0aGluZ3NcblxuICB3aW5kb3cucXVlcmllcyA9ICAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHJpbmcoMSkpO1xuXG4gIGlmICh3aW5kb3cucXVlcmllcy5jYW1wYWlnbikge1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5wYXJlbnQoKS5jc3MoXCJvcGFjaXR5XCIsIFwiMFwiKTtcbiAgfVxuICBjb25zdCBidWlsZEZpbHRlcnMgPSAoKSA9PiB7JCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KHtcbiAgICAgIGVuYWJsZUhUTUw6IHRydWUsXG4gICAgICB0ZW1wbGF0ZXM6IHtcbiAgICAgICAgYnV0dG9uOiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJtdWx0aXNlbGVjdCBkcm9wZG93bi10b2dnbGVcIiBkYXRhLXRvZ2dsZT1cImRyb3Bkb3duXCI+PHNwYW4gZGF0YS1sYW5nLXRhcmdldD1cInRleHRcIiBkYXRhLWxhbmcta2V5PVwibW9yZS1zZWFyY2gtb3B0aW9uc1wiPjwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJmYSBmYS1jYXJldC1kb3duXCI+PC9zcGFuPjwvYnV0dG9uPicsXG4gICAgICAgIGxpOiAnPGxpPjxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCI+PGxhYmVsPjwvbGFiZWw+PC9hPjwvbGk+J1xuICAgICAgfSxcbiAgICAgIGRyb3BSaWdodDogdHJ1ZSxcbiAgICAgIG9uSW5pdGlhbGl6ZWQ6ICgpID0+IHtcblxuICAgICAgfSxcbiAgICAgIG9uRHJvcGRvd25TaG93OiAoKSA9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJtb2JpbGUtdXBkYXRlLW1hcC1oZWlnaHRcIik7XG4gICAgICAgIH0sIDEwKTtcblxuICAgICAgfSxcbiAgICAgIG9uRHJvcGRvd25IaWRlOiAoKSA9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJtb2JpbGUtdXBkYXRlLW1hcC1oZWlnaHRcIik7XG4gICAgICAgIH0sIDEwKTtcbiAgICAgIH0sXG4gICAgICBvcHRpb25MYWJlbDogKGUpID0+IHtcbiAgICAgICAgLy8gbGV0IGVsID0gJCggJzxkaXY+PC9kaXY+JyApO1xuICAgICAgICAvLyBlbC5hcHBlbmQoKCkgKyBcIlwiKTtcblxuICAgICAgICByZXR1cm4gdW5lc2NhcGUoJChlKS5hdHRyKCdsYWJlbCcpKSB8fCAkKGUpLmh0bWwoKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH07XG4gIGJ1aWxkRmlsdGVycygpO1xuXG5cbiAgJCgnc2VsZWN0I2xhbmd1YWdlLW9wdHMnKS5tdWx0aXNlbGVjdCh7XG4gICAgZW5hYmxlSFRNTDogdHJ1ZSxcbiAgICBvcHRpb25DbGFzczogKCkgPT4gJ2xhbmctb3B0JyxcbiAgICBzZWxlY3RlZENsYXNzOiAoKSA9PiAnbGFuZy1zZWwnLFxuICAgIGJ1dHRvbkNsYXNzOiAoKSA9PiAnbGFuZy1idXQnLFxuICAgIGRyb3BSaWdodDogdHJ1ZSxcbiAgICBvcHRpb25MYWJlbDogKGUpID0+IHtcbiAgICAgIC8vIGxldCBlbCA9ICQoICc8ZGl2PjwvZGl2PicgKTtcbiAgICAgIC8vIGVsLmFwcGVuZCgoKSArIFwiXCIpO1xuXG4gICAgICByZXR1cm4gdW5lc2NhcGUoJChlKS5hdHRyKCdsYWJlbCcpKSB8fCAkKGUpLmh0bWwoKTtcbiAgICB9LFxuICAgIG9uQ2hhbmdlOiAob3B0aW9uLCBjaGVja2VkLCBzZWxlY3QpID0+IHtcblxuICAgICAgY29uc3QgcGFyYW1ldGVycyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gICAgICBwYXJhbWV0ZXJzWydsYW5nJ10gPSBvcHRpb24udmFsKCk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1yZXNldC1tYXAnLCBwYXJhbWV0ZXJzKTtcblxuICAgIH1cbiAgfSlcblxuICAvLyAxLiBnb29nbGUgbWFwcyBnZW9jb2RlXG5cbiAgLy8gMi4gZm9jdXMgbWFwIG9uIGdlb2NvZGUgKHZpYSBsYXQvbG5nKVxuICBjb25zdCBxdWVyeU1hbmFnZXIgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICAgICAgcXVlcnlNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICBjb25zdCBpbml0UGFyYW1zID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuXG5cbiAgY29uc3QgbGFuZ3VhZ2VNYW5hZ2VyID0gTGFuZ3VhZ2VNYW5hZ2VyKCk7XG5cbiAgY29uc3QgbGlzdE1hbmFnZXIgPSBMaXN0TWFuYWdlcih7XG4gICAgcmVmZXJyZXI6IHdpbmRvdy5xdWVyaWVzLnJlZmVycmVyLFxuICAgIHNvdXJjZTogd2luZG93LnF1ZXJpZXMuc291cmNlXG4gIH0pO1xuXG5cbiAgbWFwTWFuYWdlciA9IE1hcE1hbmFnZXIoe1xuICAgIG9uTW92ZTogKHN3LCBuZSkgPT4ge1xuICAgICAgLy8gV2hlbiB0aGUgbWFwIG1vdmVzIGFyb3VuZCwgd2UgdXBkYXRlIHRoZSBsaXN0XG4gICAgICBxdWVyeU1hbmFnZXIudXBkYXRlVmlld3BvcnRCeUJvdW5kKHN3LCBuZSk7XG4gICAgICAvL3VwZGF0ZSBRdWVyeVxuICAgIH0sXG4gICAgcmVmZXJyZXI6IHdpbmRvdy5xdWVyaWVzLnJlZmVycmVyLFxuICAgIHNvdXJjZTogd2luZG93LnF1ZXJpZXMuc291cmNlXG4gIH0pO1xuXG4gIHdpbmRvdy5pbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2sgPSAoKSA9PiB7XG5cbiAgICBhdXRvY29tcGxldGVNYW5hZ2VyID0gQXV0b2NvbXBsZXRlTWFuYWdlcihcImlucHV0W25hbWU9J2xvYyddXCIpO1xuICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuXG4gICAgaWYgKGluaXRQYXJhbXMubG9jICYmIGluaXRQYXJhbXMubG9jICE9PSAnJyAmJiAoIWluaXRQYXJhbXMuYm91bmQxICYmICFpbml0UGFyYW1zLmJvdW5kMikpIHtcbiAgICAgIG1hcE1hbmFnZXIuaW5pdGlhbGl6ZSgoKSA9PiB7XG4gICAgICAgIG1hcE1hbmFnZXIuZ2V0Q2VudGVyQnlMb2NhdGlvbihpbml0UGFyYW1zLmxvYywgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIHF1ZXJ5TWFuYWdlci51cGRhdGVWaWV3cG9ydChyZXN1bHQuZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgaWYoaW5pdFBhcmFtcy5sYXQgJiYgaW5pdFBhcmFtcy5sbmcpIHtcbiAgICBtYXBNYW5hZ2VyLnNldENlbnRlcihbaW5pdFBhcmFtcy5sYXQsIGluaXRQYXJhbXMubG5nXSk7XG4gIH1cblxuICAvKioqXG4gICogTGlzdCBFdmVudHNcbiAgKiBUaGlzIHdpbGwgdHJpZ2dlciB0aGUgbGlzdCB1cGRhdGUgbWV0aG9kXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCdtb2JpbGUtdXBkYXRlLW1hcC1oZWlnaHQnLCAoZXZlbnQpID0+IHtcbiAgICAvL1RoaXMgY2hlY2tzIGlmIHdpZHRoIGlzIGZvciBtb2JpbGVcbiAgICBpZiAoJCh3aW5kb3cpLndpZHRoKCkgPCA2MDApIHtcbiAgICAgIHNldFRpbWVvdXQoKCk9PiB7XG4gICAgICAgICQoXCIjbWFwXCIpLmhlaWdodCgkKFwiI2V2ZW50cy1saXN0XCIpLmhlaWdodCgpKTtcbiAgICAgICAgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCk7XG4gICAgICB9LCAxMCk7XG4gICAgfVxuICB9KVxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnBvcHVsYXRlTGlzdChvcHRpb25zLnBhcmFtcyk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuXG4gICAgbGlzdE1hbmFnZXIudXBkYXRlRmlsdGVyKG9wdGlvbnMpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlci1ieS1ib3VuZCcsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxldCBib3VuZDEsIGJvdW5kMjtcblxuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICBbYm91bmQxLCBib3VuZDJdID0gbWFwTWFuYWdlci5nZXRCb3VuZHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgICBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcbiAgICB9XG5cbiAgICBsaXN0TWFuYWdlci51cGRhdGVCb3VuZHMoYm91bmQxLCBib3VuZDIpXG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLXJlc2V0LW1hcCcsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIHZhciBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHRpb25zKSk7XG4gICAgZGVsZXRlIGNvcHlbJ2xuZyddO1xuICAgIGRlbGV0ZSBjb3B5WydsYXQnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQxJ107XG4gICAgZGVsZXRlIGNvcHlbJ2JvdW5kMiddO1xuXG4gICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAkLnBhcmFtKGNvcHkpO1xuXG5cbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwidHJpZ2dlci1sYW5ndWFnZS11cGRhdGVcIiwgY29weSk7XG4gICAgJChcInNlbGVjdCNmaWx0ZXItaXRlbXNcIikubXVsdGlzZWxlY3QoJ2Rlc3Ryb3knKTtcbiAgICBidWlsZEZpbHRlcnMoKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxvYWQtZ3JvdXBzJywgeyBncm91cHM6IHdpbmRvdy5FVkVOVFNfREFUQS5ncm91cHMgfSk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG5cbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJ0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZVwiLCBjb3B5KTtcbiAgICB9LCAxMDAwKTtcbiAgfSk7XG5cblxuICAvKioqXG4gICogTWFwIEV2ZW50c1xuICAqL1xuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgLy8gbWFwTWFuYWdlci5zZXRDZW50ZXIoW29wdGlvbnMubGF0LCBvcHRpb25zLmxuZ10pO1xuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGJvdW5kMSA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDEpO1xuICAgIHZhciBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcblxuICAgIG1hcE1hbmFnZXIuc2V0Qm91bmRzKGJvdW5kMSwgYm91bmQyKTtcbiAgICAvLyBtYXBNYW5hZ2VyLnRyaWdnZXJab29tRW5kKCk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIG1hcE1hbmFnZXIudHJpZ2dlclpvb21FbmQoKTtcbiAgICB9LCAxMCk7XG5cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgXCIjY29weS1lbWJlZFwiLCAoZSkgPT4ge1xuICAgIHZhciBjb3B5VGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW1iZWQtdGV4dFwiKTtcbiAgICBjb3B5VGV4dC5zZWxlY3QoKTtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZChcIkNvcHlcIik7XG4gIH0pO1xuXG4gIC8vIDMuIG1hcmtlcnMgb24gbWFwXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC1wbG90JywgKGUsIG9wdCkgPT4ge1xuXG4gICAgbWFwTWFuYWdlci5wbG90UG9pbnRzKG9wdC5kYXRhLCBvcHQucGFyYW1zLCBvcHQuZ3JvdXBzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInKTtcbiAgfSlcblxuICAvLyBsb2FkIGdyb3Vwc1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxvYWQtZ3JvdXBzJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5lbXB0eSgpO1xuICAgIG9wdC5ncm91cHMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuXG4gICAgICBsZXQgc2x1Z2dlZCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG4gICAgICBsZXQgdmFsdWVUZXh0ID0gbGFuZ3VhZ2VNYW5hZ2VyLmdldFRyYW5zbGF0aW9uKGl0ZW0udHJhbnNsYXRpb24pO1xuICAgICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLmFwcGVuZChgXG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPScke3NsdWdnZWR9J1xuICAgICAgICAgICAgICBzZWxlY3RlZD0nc2VsZWN0ZWQnXG4gICAgICAgICAgICAgIGxhYmVsPVwiPHNwYW4gZGF0YS1sYW5nLXRhcmdldD0ndGV4dCcgZGF0YS1sYW5nLWtleT0nJHtpdGVtLnRyYW5zbGF0aW9ufSc+JHt2YWx1ZVRleHR9PC9zcGFuPjxpbWcgc3JjPScke2l0ZW0uaWNvbnVybCB8fCB3aW5kb3cuREVGQVVMVF9JQ09OfScgLz5cIj5cbiAgICAgICAgICAgIDwvb3B0aW9uPmApXG4gICAgfSk7XG5cbiAgICAvLyBSZS1pbml0aWFsaXplXG4gICAgcXVlcnlNYW5hZ2VyLmluaXRpYWxpemUoKTtcbiAgICAvLyAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykubXVsdGlzZWxlY3QoJ2Rlc3Ryb3knKTtcbiAgICAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykubXVsdGlzZWxlY3QoJ3JlYnVpbGQnKTtcblxuICAgIG1hcE1hbmFnZXIucmVmcmVzaE1hcCgpO1xuXG5cbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZScpO1xuXG4gIH0pXG5cbiAgLy8gRmlsdGVyIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtZmlsdGVyJywgKGUsIG9wdCkgPT4ge1xuICAgIGlmIChvcHQpIHtcbiAgICAgIG1hcE1hbmFnZXIuZmlsdGVyTWFwKG9wdC5maWx0ZXIpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgKGUsIG9wdCkgPT4ge1xuXG4gICAgaWYgKG9wdCkge1xuXG4gICAgICBsYW5ndWFnZU1hbmFnZXIudXBkYXRlTGFuZ3VhZ2Uob3B0LmxhbmcpO1xuICAgIH0gZWxzZSB7XG5cbiAgICAgIGxhbmd1YWdlTWFuYWdlci5yZWZyZXNoKCk7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sYW5ndWFnZS1sb2FkZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KCdyZWJ1aWxkJyk7XG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbiNzaG93LWhpZGUtbWFwJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ2JvZHknKS50b2dnbGVDbGFzcygnbWFwLXZpZXcnKVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uLmJ0bi5tb3JlLWl0ZW1zJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJyNlbWJlZC1hcmVhJykudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgLy91cGRhdGUgZW1iZWQgbGluZVxuICAgIHZhciBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHQpKTtcbiAgICBkZWxldGUgY29weVsnbG5nJ107XG4gICAgZGVsZXRlIGNvcHlbJ2xhdCddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDEnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQyJ107XG5cbiAgICAkKCcjZW1iZWQtYXJlYSBpbnB1dFtuYW1lPWVtYmVkXScpLnZhbCgnaHR0cHM6Ly9uZXctbWFwLjM1MC5vcmcjJyArICQucGFyYW0oY29weSkpO1xuICB9KTtcblxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24jem9vbS1vdXQnLCAoZSwgb3B0KSA9PiB7XG5cbiAgICAvLyBtYXBNYW5hZ2VyLnpvb21PdXRPbmNlKCk7XG5cbiAgICBtYXBNYW5hZ2VyLnpvb21VbnRpbEhpdCgpO1xuICB9KVxuXG4gICQod2luZG93KS5vbihcInJlc2l6ZVwiLCAoZSkgPT4ge1xuICAgIG1hcE1hbmFnZXIucmVmcmVzaE1hcCgpO1xuICB9KTtcblxuICAvKipcbiAgRmlsdGVyIENoYW5nZXNcbiAgKi9cbiAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIi5zZWFyY2gtYnV0dG9uIGJ1dHRvblwiLCAoZSkgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwic2VhcmNoLmZvcmNlLXNlYXJjaC1sb2NhdGlvblwiKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKFwia2V5dXBcIiwgXCJpbnB1dFtuYW1lPSdsb2MnXVwiLCAoZSkgPT4ge1xuICAgIGlmIChlLmtleUNvZGUgPT0gMTMpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3NlYXJjaC5mb3JjZS1zZWFyY2gtbG9jYXRpb24nKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdzZWFyY2guZm9yY2Utc2VhcmNoLWxvY2F0aW9uJywgKCkgPT4ge1xuICAgIGxldCBfcXVlcnkgPSAkKFwiaW5wdXRbbmFtZT0nbG9jJ11cIikudmFsKCk7XG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlci5mb3JjZVNlYXJjaChfcXVlcnkpO1xuICAgIC8vIFNlYXJjaCBnb29nbGUgYW5kIGdldCB0aGUgZmlyc3QgcmVzdWx0Li4uIGF1dG9jb21wbGV0ZT9cbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKFwiaGFzaGNoYW5nZVwiLCAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgaWYgKGhhc2gubGVuZ3RoID09IDApIHJldHVybjtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKGhhc2guc3Vic3RyaW5nKDEpKTtcbiAgICBjb25zdCBvbGRVUkwgPSBldmVudC5vcmlnaW5hbEV2ZW50Lm9sZFVSTDtcblxuXG4gICAgY29uc3Qgb2xkSGFzaCA9ICQuZGVwYXJhbShvbGRVUkwuc3Vic3RyaW5nKG9sZFVSTC5zZWFyY2goXCIjXCIpKzEpKTtcblxuXG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCBwYXJhbWV0ZXJzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuXG4gICAgLy8gU28gdGhhdCBjaGFuZ2UgaW4gZmlsdGVycyB3aWxsIG5vdCB1cGRhdGUgdGhpc1xuICAgIGlmIChvbGRIYXNoLmJvdW5kMSAhPT0gcGFyYW1ldGVycy5ib3VuZDEgfHwgb2xkSGFzaC5ib3VuZDIgIT09IHBhcmFtZXRlcnMuYm91bmQyKSB7XG5cbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG5cbiAgICBpZiAob2xkSGFzaC5sb2cgIT09IHBhcmFtZXRlcnMubG9jKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcblxuICAgIH1cblxuICAgIC8vIENoYW5nZSBpdGVtc1xuICAgIGlmIChvbGRIYXNoLmxhbmcgIT09IHBhcmFtZXRlcnMubGFuZykge1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sYW5ndWFnZS11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG4gIH0pXG5cbiAgLy8gNC4gZmlsdGVyIG91dCBpdGVtcyBpbiBhY3Rpdml0eS1hcmVhXG5cbiAgLy8gNS4gZ2V0IG1hcCBlbGVtZW50c1xuXG4gIC8vIDYuIGdldCBHcm91cCBkYXRhXG5cbiAgLy8gNy4gcHJlc2VudCBncm91cCBlbGVtZW50c1xuXG4gICQud2hlbigoKT0+e30pXG4gICAgLnRoZW4oKCkgPT57XG4gICAgICByZXR1cm4gbGFuZ3VhZ2VNYW5hZ2VyLmluaXRpYWxpemUoaW5pdFBhcmFtc1snbGFuZyddIHx8ICdlbicpO1xuICAgIH0pXG4gICAgLmRvbmUoKGRhdGEpID0+IHt9KVxuICAgIC50aGVuKCgpID0+IHtcbiAgICAgICQuYWpheCh7XG4gICAgICAgICAgdXJsOiAnaHR0cHM6Ly9uZXctbWFwLjM1MC5vcmcvb3V0cHV0LzM1MG9yZy1uZXctbGF5b3V0LmpzLmd6JywgLy8nfCoqREFUQV9TT1VSQ0UqKnwnLFxuICAgICAgICAgIC8vIHVybDogJy9kYXRhL3Rlc3QuanMnLCAvLyd8KipEQVRBX1NPVVJDRSoqfCcsXG4gICAgICAgICAgZGF0YVR5cGU6ICdzY3JpcHQnLFxuICAgICAgICAgIGNhY2hlOiB0cnVlLFxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICAvLyB3aW5kb3cuRVZFTlRTX0RBVEEgPSBkYXRhO1xuICAgICAgICAgICAgLy9KdW5lIDE0LCAyMDE4IOKAkyBDaGFuZ2VzXG4gICAgICAgICAgICAvL1RPRE86IENoYW5nZSBzdXBlcmdyb3VwIHRvIGNhbXBhaWduIG9uY2UgY29ubmVjdGVkXG4gICAgICAgICAgICBpZih3aW5kb3cucXVlcmllcy5jYW1wYWlnbikge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyh3aW5kb3cucXVlcmllcy5jYW1wYWlnbik7XG4gICAgICAgICAgICAgIHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhID0gd2luZG93LkVWRU5UU19EQVRBLmRhdGEuZmlsdGVyKChpKSA9PiBpLnN1cGVyZ3JvdXAgPT0gd2luZG93LnF1ZXJpZXMuY2FtcGFpZ24pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL0xvYWQgZ3JvdXBzXG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxvYWQtZ3JvdXBzJywgeyBncm91cHM6IHdpbmRvdy5FVkVOVFNfREFUQS5ncm91cHMgfSk7XG5cblxuICAgICAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuXG4gICAgICAgICAgICB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgIGl0ZW1bJ2V2ZW50X3R5cGUnXSA9ICFpdGVtLmV2ZW50X3R5cGUgPyAnQWN0aW9uJyA6IGl0ZW0uZXZlbnRfdHlwZTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtdXBkYXRlJywgeyBwYXJhbXM6IHBhcmFtZXRlcnMgfSk7XG4gICAgICAgICAgICAvLyAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtcGxvdCcsIHtcbiAgICAgICAgICAgICAgICBkYXRhOiB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YSxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHBhcmFtZXRlcnMsXG4gICAgICAgICAgICAgICAgZ3JvdXBzOiB3aW5kb3cuRVZFTlRTX0RBVEEuZ3JvdXBzLnJlZHVjZSgoZGljdCwgaXRlbSk9PnsgZGljdFtpdGVtLnN1cGVyZ3JvdXBdID0gaXRlbTsgcmV0dXJuIGRpY3Q7IH0sIHt9KVxuICAgICAgICAgICAgfSk7XG4gICAgICAvLyB9KTtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgcGFyYW1ldGVycyk7XG4gICAgICAgICAgICAvL1RPRE86IE1ha2UgdGhlIGdlb2pzb24gY29udmVyc2lvbiBoYXBwZW4gb24gdGhlIGJhY2tlbmRcblxuICAgICAgICAgICAgLy9SZWZyZXNoIHRoaW5nc1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgIGxldCBwID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuICAgICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwKTtcbiAgICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJywgcCk7XG5cbiAgICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwKTtcbiAgICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci1ieS1ib3VuZCcsIHApO1xuXG4gICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuXG5cbn0pKGpRdWVyeSk7XG4iXX0=
