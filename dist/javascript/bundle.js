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
        source: getQueryString().source
      };
    }
  } catch (e) {
    console.log("Error: ", e);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9oZWxwZXIuanMiLCJjbGFzc2VzL2xhbmd1YWdlLmpzIiwiY2xhc3Nlcy9saXN0LmpzIiwiY2xhc3Nlcy9tYXAuanMiLCJjbGFzc2VzL3F1ZXJ5LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIkF1dG9jb21wbGV0ZU1hbmFnZXIiLCIkIiwidGFyZ2V0IiwiQVBJX0tFWSIsInRhcmdldEl0ZW0iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJxdWVyeU1nciIsIlF1ZXJ5TWFuYWdlciIsImdlb2NvZGVyIiwiZ29vZ2xlIiwibWFwcyIsIkdlb2NvZGVyIiwiJHRhcmdldCIsImZvcmNlU2VhcmNoIiwicSIsImdlb2NvZGUiLCJhZGRyZXNzIiwicmVzdWx0cyIsInN0YXR1cyIsImdlb21ldHJ5IiwidXBkYXRlVmlld3BvcnQiLCJ2aWV3cG9ydCIsInZhbCIsImZvcm1hdHRlZF9hZGRyZXNzIiwiaW5pdGlhbGl6ZSIsInR5cGVhaGVhZCIsImhpbnQiLCJoaWdobGlnaHQiLCJtaW5MZW5ndGgiLCJjbGFzc05hbWVzIiwibWVudSIsIm5hbWUiLCJkaXNwbGF5IiwiaXRlbSIsImxpbWl0Iiwic291cmNlIiwic3luYyIsImFzeW5jIiwib24iLCJvYmoiLCJkYXR1bSIsImpRdWVyeSIsIkhlbHBlciIsInJlZlNvdXJjZSIsInVybCIsInJlZiIsInNyYyIsImluZGV4T2YiLCJMYW5ndWFnZU1hbmFnZXIiLCJsYW5ndWFnZSIsImRpY3Rpb25hcnkiLCIkdGFyZ2V0cyIsInVwZGF0ZVBhZ2VMYW5ndWFnZSIsInRhcmdldExhbmd1YWdlIiwicm93cyIsImZpbHRlciIsImkiLCJsYW5nIiwiZWFjaCIsImluZGV4IiwidGFyZ2V0QXR0cmlidXRlIiwiZGF0YSIsImxhbmdUYXJnZXQiLCJ0ZXh0IiwiYXR0ciIsInRhcmdldHMiLCJhamF4IiwiZGF0YVR5cGUiLCJzdWNjZXNzIiwidHJpZ2dlciIsIm11bHRpc2VsZWN0IiwicmVmcmVzaCIsInVwZGF0ZUxhbmd1YWdlIiwiZ2V0VHJhbnNsYXRpb24iLCJrZXkiLCJMaXN0TWFuYWdlciIsIm9wdGlvbnMiLCJ0YXJnZXRMaXN0IiwicmVmZXJyZXIiLCJyZW5kZXJFdmVudCIsImRhdGUiLCJtb21lbnQiLCJzdGFydF9kYXRldGltZSIsImZvcm1hdCIsIm1hdGNoIiwid2luZG93Iiwic2x1Z2lmeSIsImV2ZW50X3R5cGUiLCJsYXQiLCJsbmciLCJ0aXRsZSIsInZlbnVlIiwicmVuZGVyR3JvdXAiLCJ3ZWJzaXRlIiwic3VwZXJHcm91cCIsInN1cGVyZ3JvdXAiLCJsb2NhdGlvbiIsImRlc2NyaXB0aW9uIiwiJGxpc3QiLCJ1cGRhdGVGaWx0ZXIiLCJwIiwicmVtb3ZlUHJvcCIsImFkZENsYXNzIiwiam9pbiIsImZpbmQiLCJoaWRlIiwiZm9yRWFjaCIsImZpbCIsInNob3ciLCJ1cGRhdGVCb3VuZHMiLCJib3VuZDEiLCJib3VuZDIiLCJpbmQiLCJfbGF0IiwiX2xuZyIsInJlbW92ZUNsYXNzIiwiX3Zpc2libGUiLCJsZW5ndGgiLCJwb3B1bGF0ZUxpc3QiLCJoYXJkRmlsdGVycyIsImtleVNldCIsInNwbGl0IiwiJGV2ZW50TGlzdCIsIkVWRU5UU19EQVRBIiwibWFwIiwidG9Mb3dlckNhc2UiLCJpbmNsdWRlcyIsInJlbW92ZSIsImFwcGVuZCIsIk1hcE1hbmFnZXIiLCJMQU5HVUFHRSIsInJlbmRlckdlb2pzb24iLCJsaXN0IiwicmVuZGVyZWQiLCJpc05hTiIsInBhcnNlRmxvYXQiLCJzdWJzdHJpbmciLCJ0eXBlIiwiY29vcmRpbmF0ZXMiLCJwcm9wZXJ0aWVzIiwiZXZlbnRQcm9wZXJ0aWVzIiwicG9wdXBDb250ZW50IiwiYWNjZXNzVG9rZW4iLCJMIiwiZHJhZ2dpbmciLCJCcm93c2VyIiwibW9iaWxlIiwic2V0VmlldyIsInNjcm9sbFdoZWVsWm9vbSIsImRpc2FibGUiLCJvbk1vdmUiLCJldmVudCIsInN3IiwiZ2V0Qm91bmRzIiwiX3NvdXRoV2VzdCIsIm5lIiwiX25vcnRoRWFzdCIsImdldFpvb20iLCJ0aWxlTGF5ZXIiLCJhdHRyaWJ1dGlvbiIsImFkZFRvIiwiJG1hcCIsImNhbGxiYWNrIiwic2V0Qm91bmRzIiwiYm91bmRzMSIsImJvdW5kczIiLCJib3VuZHMiLCJmaXRCb3VuZHMiLCJzZXRDZW50ZXIiLCJjZW50ZXIiLCJ6b29tIiwiZ2V0Q2VudGVyQnlMb2NhdGlvbiIsInRyaWdnZXJab29tRW5kIiwiZmlyZUV2ZW50Iiwiem9vbU91dE9uY2UiLCJ6b29tT3V0Iiwiem9vbVVudGlsSGl0IiwiJHRoaXMiLCJpbnRlcnZhbEhhbmRsZXIiLCJzZXRJbnRlcnZhbCIsImNsZWFySW50ZXJ2YWwiLCJyZWZyZXNoTWFwIiwiaW52YWxpZGF0ZVNpemUiLCJmaWx0ZXJNYXAiLCJmaWx0ZXJzIiwicGxvdFBvaW50cyIsImdyb3VwcyIsImdlb2pzb24iLCJmZWF0dXJlcyIsImdlb0pTT04iLCJwb2ludFRvTGF5ZXIiLCJmZWF0dXJlIiwibGF0bG5nIiwiZXZlbnRUeXBlIiwic2x1Z2dlZCIsImljb25VcmwiLCJpY29udXJsIiwic21hbGxJY29uIiwiaWNvbiIsImljb25TaXplIiwiaWNvbkFuY2hvciIsImNsYXNzTmFtZSIsImdlb2pzb25NYXJrZXJPcHRpb25zIiwibWFya2VyIiwib25FYWNoRmVhdHVyZSIsImxheWVyIiwiYmluZFBvcHVwIiwidXBkYXRlIiwibGF0TG5nIiwidGFyZ2V0Rm9ybSIsInByZXZpb3VzIiwiZSIsInByZXZlbnREZWZhdWx0IiwiZm9ybSIsImRlcGFyYW0iLCJzZXJpYWxpemUiLCJoYXNoIiwicGFyYW0iLCJwYXJhbXMiLCJsb2MiLCJwcm9wIiwiZ2V0UGFyYW1ldGVycyIsInBhcmFtZXRlcnMiLCJ1cGRhdGVMb2NhdGlvbiIsImYiLCJiIiwiSlNPTiIsInN0cmluZ2lmeSIsInVwZGF0ZVZpZXdwb3J0QnlCb3VuZCIsInRyaWdnZXJTdWJtaXQiLCJhdXRvY29tcGxldGVNYW5hZ2VyIiwibWFwTWFuYWdlciIsIkRFRkFVTFRfSUNPTiIsInRvU3RyaW5nIiwicmVwbGFjZSIsImdldFF1ZXJ5U3RyaW5nIiwicXVlcnlTdHJpbmdLZXlWYWx1ZSIsInBhcmVudCIsInNlYXJjaCIsInFzSnNvbk9iamVjdCIsInF1ZXJpZXMiLCJncm91cCIsImNvbnNvbGUiLCJsb2ciLCJjc3MiLCJidWlsZEZpbHRlcnMiLCJlbmFibGVIVE1MIiwidGVtcGxhdGVzIiwiYnV0dG9uIiwibGkiLCJkcm9wUmlnaHQiLCJvbkluaXRpYWxpemVkIiwib25Ecm9wZG93blNob3ciLCJzZXRUaW1lb3V0Iiwib25Ecm9wZG93bkhpZGUiLCJvcHRpb25MYWJlbCIsInVuZXNjYXBlIiwiaHRtbCIsIm9wdGlvbkNsYXNzIiwic2VsZWN0ZWRDbGFzcyIsImJ1dHRvbkNsYXNzIiwib25DaGFuZ2UiLCJvcHRpb24iLCJjaGVja2VkIiwic2VsZWN0IiwicXVlcnlNYW5hZ2VyIiwiaW5pdFBhcmFtcyIsImxhbmd1YWdlTWFuYWdlciIsImxpc3RNYW5hZ2VyIiwiaW5pdGlhbGl6ZUF1dG9jb21wbGV0ZUNhbGxiYWNrIiwicmVzdWx0Iiwid2lkdGgiLCJoZWlnaHQiLCJwYXJzZSIsImNvcHkiLCJjb3B5VGV4dCIsImdldEVsZW1lbnRCeUlkIiwiZXhlY0NvbW1hbmQiLCJvcHQiLCJlbXB0eSIsInZhbHVlVGV4dCIsInRyYW5zbGF0aW9uIiwidG9nZ2xlQ2xhc3MiLCJrZXlDb2RlIiwiX3F1ZXJ5Iiwib2xkVVJMIiwib3JpZ2luYWxFdmVudCIsIm9sZEhhc2giLCJ3aGVuIiwidGhlbiIsImRvbmUiLCJjYWNoZSIsImNhbXBhaWduIiwicmVkdWNlIiwiZGljdCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7QUFDQSxJQUFNQSxzQkFBdUIsVUFBU0MsQ0FBVCxFQUFZO0FBQ3ZDOztBQUVBLFNBQU8sVUFBQ0MsTUFBRCxFQUFZOztBQUVqQixRQUFNQyxVQUFVLHlDQUFoQjtBQUNBLFFBQU1DLGFBQWEsT0FBT0YsTUFBUCxJQUFpQixRQUFqQixHQUE0QkcsU0FBU0MsYUFBVCxDQUF1QkosTUFBdkIs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Q0FBbUIrRCxNQUFuQixDQUEwQjJHLE1BQTFCLENBQWlDLFVBQUNDLElBQUQsRUFBT3JRLElBQVAsRUFBYztBQUFFcVEsaUJBQUtyUSxLQUFLOEQsVUFBVixJQUF3QjlELElBQXhCLENBQThCLE9BQU9xUSxJQUFQO0FBQWMsV0FBN0YsRUFBK0YsRUFBL0Y7QUFINEIsU0FBeEM7QUFLTjtBQUNNdFMsVUFBRUksUUFBRixFQUFZaUUsT0FBWixDQUFvQixzQkFBcEIsRUFBNEN5SixVQUE1QztBQUNBOztBQUVBO0FBQ0ErQixtQkFBVyxZQUFNO0FBQ2YsY0FBSXpKLElBQUlxSyxhQUFhNUMsYUFBYixFQUFSOztBQUVBN04sWUFBRUksUUFBRixFQUFZaUUsT0FBWixDQUFvQixvQkFBcEIsRUFBMEMrQixDQUExQztBQUNBcEcsWUFBRUksUUFBRixFQUFZaUUsT0FBWixDQUFvQixvQkFBcEIsRUFBMEMrQixDQUExQzs7QUFFQXBHLFlBQUVJLFFBQUYsRUFBWWlFLE9BQVosQ0FBb0IsNEJBQXBCLEVBQWtEK0IsQ0FBbEQ7QUFDQXBHLFlBQUVJLFFBQUYsRUFBWWlFLE9BQVosQ0FBb0IsOEJBQXBCLEVBQW9EK0IsQ0FBcEQ7QUFFRCxTQVRELEVBU0csR0FUSDtBQVVEO0FBN0NFLEtBQVA7QUErQ0MsR0FyREw7QUF5REQsQ0F4WkQsRUF3WkczRCxNQXhaSCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbi8vQVBJIDpBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cbmNvbnN0IEF1dG9jb21wbGV0ZU1hbmFnZXIgPSAoZnVuY3Rpb24oJCkge1xuICAvL0luaXRpYWxpemF0aW9uLi4uXG5cbiAgcmV0dXJuICh0YXJnZXQpID0+IHtcblxuICAgIGNvbnN0IEFQSV9LRVkgPSBcIkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVwiO1xuICAgIGNvbnN0IHRhcmdldEl0ZW0gPSB0eXBlb2YgdGFyZ2V0ID09IFwic3RyaW5nXCIgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCkgOiB0YXJnZXQ7XG4gICAgY29uc3QgcXVlcnlNZ3IgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICB2YXIgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcblxuICAgIHJldHVybiB7XG4gICAgICAkdGFyZ2V0OiAkKHRhcmdldEl0ZW0pLFxuICAgICAgdGFyZ2V0OiB0YXJnZXRJdGVtLFxuICAgICAgZm9yY2VTZWFyY2g6IChxKSA9PiB7XG4gICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBxIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICBpZiAocmVzdWx0c1swXSkge1xuICAgICAgICAgICAgbGV0IGdlb21ldHJ5ID0gcmVzdWx0c1swXS5nZW9tZXRyeTtcbiAgICAgICAgICAgIHF1ZXJ5TWdyLnVwZGF0ZVZpZXdwb3J0KGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICQodGFyZ2V0SXRlbSkudmFsKHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyB2YXIgZ2VvbWV0cnkgPSBkYXR1bS5nZW9tZXRyeTtcbiAgICAgICAgICAvLyBxdWVyeU1nci51cGRhdGVWaWV3cG9ydChnZW9tZXRyeS52aWV3cG9ydCk7XG5cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgaW5pdGlhbGl6ZTogKCkgPT4ge1xuICAgICAgICAkKHRhcmdldEl0ZW0pLnR5cGVhaGVhZCh7XG4gICAgICAgICAgICAgICAgICAgIGhpbnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWluTGVuZ3RoOiA0LFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgbWVudTogJ3R0LWRyb3Bkb3duLW1lbnUnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdzZWFyY2gtcmVzdWx0cycsXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IChpdGVtKSA9PiBpdGVtLmZvcm1hdHRlZF9hZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgICBsaW1pdDogMTAsXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogZnVuY3Rpb24gKHEsIHN5bmMsIGFzeW5jKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBxIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXN5bmMocmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICkub24oJ3R5cGVhaGVhZDpzZWxlY3RlZCcsIGZ1bmN0aW9uIChvYmosIGRhdHVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGRhdHVtKVxuICAgICAgICAgICAgICAgICAgICB7XG5cbiAgICAgICAgICAgICAgICAgICAgICB2YXIgZ2VvbWV0cnkgPSBkYXR1bS5nZW9tZXRyeTtcbiAgICAgICAgICAgICAgICAgICAgICBxdWVyeU1nci51cGRhdGVWaWV3cG9ydChnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gIG1hcC5maXRCb3VuZHMoZ2VvbWV0cnkuYm91bmRzPyBnZW9tZXRyeS5ib3VuZHMgOiBnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cblxuXG4gICAgcmV0dXJuIHtcblxuICAgIH1cbiAgfVxuXG59KGpRdWVyeSkpO1xuIiwiY29uc3QgSGVscGVyID0gKCgkKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlZlNvdXJjZTogKHVybCwgcmVmLCBzcmMpID0+IHtcbiAgICAgICAgLy8gSnVuIDEzIDIwMTgg4oCUIEZpeCBmb3Igc291cmNlIGFuZCByZWZlcnJlclxuICAgICAgICBpZiAocmVmIHx8IHNyYykge1xuICAgICAgICAgIGlmICh1cmwuaW5kZXhPZihcIj9cIikgPj0gMCkge1xuICAgICAgICAgICAgdXJsID0gYCR7dXJsfSZyZWZlcnJlcj0ke3JlZnx8XCJcIn0mc291cmNlPSR7c3JjfHxcIlwifWA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVybCA9IGAke3VybH0/cmVmZXJyZXI9JHtyZWZ8fFwiXCJ9JnNvdXJjZT0ke3NyY3x8XCJcIn1gO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB1cmw7XG4gICAgICB9XG4gICAgfTtcbn0pKGpRdWVyeSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IExhbmd1YWdlTWFuYWdlciA9ICgoJCkgPT4ge1xuICAvL2tleVZhbHVlXG5cbiAgLy90YXJnZXRzIGFyZSB0aGUgbWFwcGluZ3MgZm9yIHRoZSBsYW5ndWFnZVxuICByZXR1cm4gKCkgPT4ge1xuICAgIGxldCBsYW5ndWFnZTtcbiAgICBsZXQgZGljdGlvbmFyeSA9IHt9O1xuICAgIGxldCAkdGFyZ2V0cyA9ICQoXCJbZGF0YS1sYW5nLXRhcmdldF1bZGF0YS1sYW5nLWtleV1cIik7XG5cbiAgICBjb25zdCB1cGRhdGVQYWdlTGFuZ3VhZ2UgPSAoKSA9PiB7XG5cbiAgICAgIGxldCB0YXJnZXRMYW5ndWFnZSA9IGRpY3Rpb25hcnkucm93cy5maWx0ZXIoKGkpID0+IGkubGFuZyA9PT0gbGFuZ3VhZ2UpWzBdO1xuXG4gICAgICAkdGFyZ2V0cy5lYWNoKChpbmRleCwgaXRlbSkgPT4ge1xuXG4gICAgICAgIGxldCB0YXJnZXRBdHRyaWJ1dGUgPSAkKGl0ZW0pLmRhdGEoJ2xhbmctdGFyZ2V0Jyk7XG4gICAgICAgIGxldCBsYW5nVGFyZ2V0ID0gJChpdGVtKS5kYXRhKCdsYW5nLWtleScpO1xuXG5cblxuXG4gICAgICAgIHN3aXRjaCh0YXJnZXRBdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjYXNlICd0ZXh0JzpcblxuICAgICAgICAgICAgJCgoYFtkYXRhLWxhbmcta2V5PVwiJHtsYW5nVGFyZ2V0fVwiXWApKS50ZXh0KHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGlmIChsYW5nVGFyZ2V0ID09IFwibW9yZS1zZWFyY2gtb3B0aW9uc1wiKSB7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3ZhbHVlJzpcbiAgICAgICAgICAgICQoaXRlbSkudmFsKHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAkKGl0ZW0pLmF0dHIodGFyZ2V0QXR0cmlidXRlLCB0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGxhbmd1YWdlLFxuICAgICAgdGFyZ2V0czogJHRhcmdldHMsXG4gICAgICBkaWN0aW9uYXJ5LFxuICAgICAgaW5pdGlhbGl6ZTogKGxhbmcpID0+IHtcblxuICAgICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgICAvLyB1cmw6ICdodHRwczovL2dzeDJqc29uLmNvbS9hcGk/aWQ9MU8zZUJ5akwxdmxZZjdaN2FtLV9odFJUUWk3M1BhZnFJZk5CZExtWGU4U00mc2hlZXQ9MScsXG4gICAgICAgICAgdXJsOiAnL2RhdGEvbGFuZy5qc29uJyxcbiAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICBkaWN0aW9uYXJ5ID0gZGF0YTtcbiAgICAgICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZSgpO1xuXG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxhbmd1YWdlLWxvYWRlZCcpO1xuXG4gICAgICAgICAgICAkKFwiI2xhbmd1YWdlLW9wdHNcIikubXVsdGlzZWxlY3QoJ3NlbGVjdCcsIGxhbmcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgcmVmcmVzaDogKCkgPT4ge1xuICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UobGFuZ3VhZ2UpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZUxhbmd1YWdlOiAobGFuZykgPT4ge1xuXG4gICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgdXBkYXRlUGFnZUxhbmd1YWdlKCk7XG4gICAgICB9LFxuICAgICAgZ2V0VHJhbnNsYXRpb246IChrZXkpID0+IHtcbiAgICAgICAgbGV0IHRhcmdldExhbmd1YWdlID0gZGljdGlvbmFyeS5yb3dzLmZpbHRlcigoaSkgPT4gaS5sYW5nID09PSBsYW5ndWFnZSlbMF07XG4gICAgICAgIHJldHVybiB0YXJnZXRMYW5ndWFnZVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxufSkoalF1ZXJ5KTtcbiIsIi8qIFRoaXMgbG9hZHMgYW5kIG1hbmFnZXMgdGhlIGxpc3QhICovXG5cbmNvbnN0IExpc3RNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIHJldHVybiAob3B0aW9ucykgPT4ge1xuICAgIGxldCB0YXJnZXRMaXN0ID0gb3B0aW9ucy50YXJnZXRMaXN0IHx8IFwiI2V2ZW50cy1saXN0XCI7XG4gICAgLy8gSnVuZSAxMyBgMTgg4oCTIHJlZmVycmVyIGFuZCBzb3VyY2VcbiAgICBsZXQge3JlZmVycmVyLCBzb3VyY2V9ID0gb3B0aW9ucztcblxuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0TGlzdCA9PT0gJ3N0cmluZycgPyAkKHRhcmdldExpc3QpIDogdGFyZ2V0TGlzdDtcblxuICAgIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0sIHJlZmVycmVyID0gbnVsbCwgc291cmNlID0gbnVsbCkgPT4ge1xuICAgICAgdmFyIGRhdGUgPSBtb21lbnQoaXRlbS5zdGFydF9kYXRldGltZSkuZm9ybWF0KFwiZGRkZCBNTU0gREQsIGg6bW1hXCIpO1xuICAgICAgbGV0IHVybCA9IGl0ZW0udXJsLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0udXJsIDogXCIvL1wiICsgaXRlbS51cmw7XG4gICAgICAvLyBsZXQgc3VwZXJHcm91cCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG4gICAgICB1cmwgPSBIZWxwZXIucmVmU291cmNlKHVybCwgcmVmZXJyZXIsIHNvdXJjZSk7XG5cbiAgICAgIHJldHVybiBgXG4gICAgICA8bGkgY2xhc3M9JyR7d2luZG93LnNsdWdpZnkoaXRlbS5ldmVudF90eXBlKX0gZXZlbnRzIGV2ZW50LW9iaicgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudCB0eXBlLWFjdGlvblwiPlxuICAgICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICAgIDxsaSBjbGFzcz0ndGFnLSR7aXRlbS5ldmVudF90eXBlfSB0YWcnPiR7aXRlbS5ldmVudF90eXBlfTwvbGk+XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgICA8aDIgY2xhc3M9XCJldmVudC10aXRsZVwiPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1kYXRlIGRhdGVcIj4ke2RhdGV9PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWFkZHJlc3MgYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+UlNWUDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICAgYFxuICAgIH07XG5cbiAgICBjb25zdCByZW5kZXJHcm91cCA9IChpdGVtLCByZWZlcnJlciA9IG51bGwsIHNvdXJjZSA9IG51bGwpID0+IHtcbiAgICAgIGxldCB1cmwgPSBpdGVtLndlYnNpdGUubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS53ZWJzaXRlIDogXCIvL1wiICsgaXRlbS53ZWJzaXRlO1xuICAgICAgbGV0IHN1cGVyR3JvdXAgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuXG4gICAgICB1cmwgPSBIZWxwZXIucmVmU291cmNlKHVybCwgcmVmZXJyZXIsIHNvdXJjZSk7XG5cbiAgICAgIHJldHVybiBgXG4gICAgICA8bGkgY2xhc3M9JyR7aXRlbS5ldmVudF90eXBlfSAke3N1cGVyR3JvdXB9IGdyb3VwLW9iaicgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ncm91cCBncm91cC1vYmpcIj5cbiAgICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5zdXBlcmdyb3VwfVwiPiR7aXRlbS5zdXBlcmdyb3VwfTwvbGk+XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0ubmFtZX08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtbG9jYXRpb24gbG9jYXRpb25cIj4ke2l0ZW0ubG9jYXRpb259PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGVzY3JpcHRpb25cIj5cbiAgICAgICAgICAgICAgPHA+JHtpdGVtLmRlc2NyaXB0aW9ufTwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+R2V0IEludm9sdmVkPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAkbGlzdDogJHRhcmdldCxcbiAgICAgIHVwZGF0ZUZpbHRlcjogKHApID0+IHtcbiAgICAgICAgaWYoIXApIHJldHVybjtcblxuICAgICAgICAvLyBSZW1vdmUgRmlsdGVyc1xuXG4gICAgICAgICR0YXJnZXQucmVtb3ZlUHJvcChcImNsYXNzXCIpO1xuICAgICAgICAkdGFyZ2V0LmFkZENsYXNzKHAuZmlsdGVyID8gcC5maWx0ZXIuam9pbihcIiBcIikgOiAnJylcblxuICAgICAgICAkdGFyZ2V0LmZpbmQoJ2xpJykuaGlkZSgpO1xuXG4gICAgICAgIGlmIChwLmZpbHRlcikge1xuICAgICAgICAgIHAuZmlsdGVyLmZvckVhY2goKGZpbCk9PntcbiAgICAgICAgICAgICR0YXJnZXQuZmluZChgbGkuJHtmaWx9YCkuc2hvdygpO1xuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB1cGRhdGVCb3VuZHM6IChib3VuZDEsIGJvdW5kMikgPT4ge1xuXG4gICAgICAgIC8vIGNvbnN0IGJvdW5kcyA9IFtwLmJvdW5kczEsIHAuYm91bmRzMl07XG5cblxuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsIGxpLmV2ZW50LW9iaiwgdWwgbGkuZ3JvdXAtb2JqJykuZWFjaCgoaW5kLCBpdGVtKT0+IHtcblxuICAgICAgICAgIGxldCBfbGF0ID0gJChpdGVtKS5kYXRhKCdsYXQnKSxcbiAgICAgICAgICAgICAgX2xuZyA9ICQoaXRlbSkuZGF0YSgnbG5nJyk7XG5cblxuICAgICAgICAgIGlmIChib3VuZDFbMF0gPD0gX2xhdCAmJiBib3VuZDJbMF0gPj0gX2xhdCAmJiBib3VuZDFbMV0gPD0gX2xuZyAmJiBib3VuZDJbMV0gPj0gX2xuZykge1xuXG4gICAgICAgICAgICAkKGl0ZW0pLmFkZENsYXNzKCd3aXRoaW4tYm91bmQnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJChpdGVtKS5yZW1vdmVDbGFzcygnd2l0aGluLWJvdW5kJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgX3Zpc2libGUgPSAkdGFyZ2V0LmZpbmQoJ3VsIGxpLmV2ZW50LW9iai53aXRoaW4tYm91bmQsIHVsIGxpLmdyb3VwLW9iai53aXRoaW4tYm91bmQnKS5sZW5ndGg7XG4gICAgICAgIGlmIChfdmlzaWJsZSA9PSAwKSB7XG4gICAgICAgICAgLy8gVGhlIGxpc3QgaXMgZW1wdHlcbiAgICAgICAgICAkdGFyZ2V0LmFkZENsYXNzKFwiaXMtZW1wdHlcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHRhcmdldC5yZW1vdmVDbGFzcyhcImlzLWVtcHR5XCIpO1xuICAgICAgICB9XG5cbiAgICAgIH0sXG4gICAgICBwb3B1bGF0ZUxpc3Q6IChoYXJkRmlsdGVycykgPT4ge1xuICAgICAgICAvL3VzaW5nIHdpbmRvdy5FVkVOVF9EQVRBXG4gICAgICAgIGNvbnN0IGtleVNldCA9ICFoYXJkRmlsdGVycy5rZXkgPyBbXSA6IGhhcmRGaWx0ZXJzLmtleS5zcGxpdCgnLCcpO1xuXG4gICAgICAgIHZhciAkZXZlbnRMaXN0ID0gd2luZG93LkVWRU5UU19EQVRBLmRhdGEubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgIGlmIChrZXlTZXQubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLmV2ZW50X3R5cGUgJiYgaXRlbS5ldmVudF90eXBlLnRvTG93ZXJDYXNlKCkgPT0gJ2dyb3VwJyA/IHJlbmRlckdyb3VwKGl0ZW0pIDogcmVuZGVyRXZlbnQoaXRlbSwgcmVmZXJyZXIsIHNvdXJjZSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXlTZXQubGVuZ3RoID4gMCAmJiBpdGVtLmV2ZW50X3R5cGUgIT0gJ2dyb3VwJyAmJiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5ldmVudF90eXBlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlbmRlckV2ZW50KGl0ZW0sIHJlZmVycmVyLCBzb3VyY2UpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2V5U2V0Lmxlbmd0aCA+IDAgJiYgaXRlbS5ldmVudF90eXBlID09ICdncm91cCcgJiYga2V5U2V0LmluY2x1ZGVzKGl0ZW0uc3VwZXJncm91cCkpIHtcbiAgICAgICAgICAgIHJldHVybiByZW5kZXJHcm91cChpdGVtLCByZWZlcnJlciwgc291cmNlKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIH0pXG4gICAgICAgICR0YXJnZXQuZmluZCgndWwgbGknKS5yZW1vdmUoKTtcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCcpLmFwcGVuZCgkZXZlbnRMaXN0KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiXG5cbmNvbnN0IE1hcE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgbGV0IExBTkdVQUdFID0gJ2VuJztcblxuICBjb25zdCByZW5kZXJFdmVudCA9IChpdGVtLCByZWZlcnJlciA9IG51bGwsIHNvdXJjZSA9IG51bGwpID0+IHtcbiAgICB2YXIgZGF0ZSA9IG1vbWVudChpdGVtLnN0YXJ0X2RhdGV0aW1lKS5mb3JtYXQoXCJkZGRkIE1NTSBERCwgaDptbWFcIik7XG4gICAgbGV0IHVybCA9IGl0ZW0udXJsLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0udXJsIDogXCIvL1wiICsgaXRlbS51cmw7XG5cbiAgICB1cmwgPSBIZWxwZXIucmVmU291cmNlKHVybCwgcmVmZXJyZXIsIHNvdXJjZSk7XG5cbiAgICBsZXQgc3VwZXJHcm91cCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG4gICAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPSdwb3B1cC1pdGVtICR7aXRlbS5ldmVudF90eXBlfSAke3N1cGVyR3JvdXB9JyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudFwiPlxuICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgPGxpIGNsYXNzPVwidGFnIHRhZy0ke2l0ZW0uZXZlbnRfdHlwZX1cIj4ke2l0ZW0uZXZlbnRfdHlwZSB8fCAnQWN0aW9uJ308L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8aDIgY2xhc3M9XCJldmVudC10aXRsZVwiPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtZGF0ZVwiPiR7ZGF0ZX08L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWFkZHJlc3MgYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgPHA+JHtpdGVtLnZlbnVlfTwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPlJTVlA8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgYFxuICB9O1xuXG4gIGNvbnN0IHJlbmRlckdyb3VwID0gKGl0ZW0sIHJlZmVycmVyID0gbnVsbCwgc291cmNlID0gbnVsbCkgPT4ge1xuXG4gICAgbGV0IHVybCA9IGl0ZW0ud2Vic2l0ZS5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLndlYnNpdGUgOiBcIi8vXCIgKyBpdGVtLndlYnNpdGU7XG5cbiAgICB1cmwgPSBIZWxwZXIucmVmU291cmNlKHVybCwgcmVmZXJyZXIsIHNvdXJjZSk7XG5cbiAgICBsZXQgc3VwZXJHcm91cCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG4gICAgcmV0dXJuIGBcbiAgICA8bGk+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ncm91cCBncm91cC1vYmogJHtzdXBlckdyb3VwfVwiPlxuICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgPGxpIGNsYXNzPVwidGFnIHRhZy0ke2l0ZW0uc3VwZXJncm91cH0gJHtzdXBlckdyb3VwfVwiPiR7aXRlbS5zdXBlcmdyb3VwfTwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1oZWFkZXJcIj5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0ubmFtZX08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtbG9jYXRpb24gbG9jYXRpb25cIj4ke2l0ZW0ubG9jYXRpb259PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICA8cD4ke2l0ZW0uZGVzY3JpcHRpb259PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+R2V0IEludm9sdmVkPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvbGk+XG4gICAgYFxuICB9O1xuXG4gIGNvbnN0IHJlbmRlckdlb2pzb24gPSAobGlzdCwgcmVmID0gbnVsbCwgc3JjID0gbnVsbCkgPT4ge1xuICAgIHJldHVybiBsaXN0Lm1hcCgoaXRlbSkgPT4ge1xuICAgICAgLy8gcmVuZGVyZWQgZXZlbnRUeXBlXG4gICAgICBsZXQgcmVuZGVyZWQ7XG5cbiAgICAgIGlmIChpdGVtLmV2ZW50X3R5cGUgJiYgaXRlbS5ldmVudF90eXBlLnRvTG93ZXJDYXNlKCkgPT0gJ2dyb3VwJykge1xuICAgICAgICByZW5kZXJlZCA9IHJlbmRlckdyb3VwKGl0ZW0sIHJlZiwgc3JjKTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVuZGVyZWQgPSByZW5kZXJFdmVudChpdGVtLCByZWYsIHNyYyk7XG4gICAgICB9XG5cbiAgICAgIC8vIGZvcm1hdCBjaGVja1xuICAgICAgaWYgKGlzTmFOKHBhcnNlRmxvYXQocGFyc2VGbG9hdChpdGVtLmxuZykpKSkge1xuICAgICAgICBpdGVtLmxuZyA9IGl0ZW0ubG5nLnN1YnN0cmluZygxKVxuICAgICAgfVxuICAgICAgaWYgKGlzTmFOKHBhcnNlRmxvYXQocGFyc2VGbG9hdChpdGVtLmxhdCkpKSkge1xuICAgICAgICBpdGVtLmxhdCA9IGl0ZW0ubGF0LnN1YnN0cmluZygxKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICAgIGdlb21ldHJ5OiB7XG4gICAgICAgICAgdHlwZTogXCJQb2ludFwiLFxuICAgICAgICAgIGNvb3JkaW5hdGVzOiBbaXRlbS5sbmcsIGl0ZW0ubGF0XVxuICAgICAgICB9LFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgZXZlbnRQcm9wZXJ0aWVzOiBpdGVtLFxuICAgICAgICAgIHBvcHVwQ29udGVudDogcmVuZGVyZWRcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gKG9wdGlvbnMpID0+IHtcbiAgICB2YXIgYWNjZXNzVG9rZW4gPSAncGsuZXlKMUlqb2liV0YwZEdobGR6TTFNQ0lzSW1FaU9pSmFUVkZNVWtVd0luMC53Y00zWGM4QkdDNlBNLU95cndqbmhnJztcbiAgICB2YXIgbWFwID0gTC5tYXAoJ21hcCcsIHsgZHJhZ2dpbmc6ICFMLkJyb3dzZXIubW9iaWxlIH0pLnNldFZpZXcoWzM0Ljg4NTkzMDk0MDc1MzE3LCA1LjA5NzY1NjI1MDAwMDAwMV0sIDIpO1xuXG4gICAgbGV0IHtyZWZlcnJlciwgc291cmNlfSA9IG9wdGlvbnM7XG5cbiAgICBpZiAoIUwuQnJvd3Nlci5tb2JpbGUpIHtcbiAgICAgIG1hcC5zY3JvbGxXaGVlbFpvb20uZGlzYWJsZSgpO1xuICAgIH1cblxuICAgIExBTkdVQUdFID0gb3B0aW9ucy5sYW5nIHx8ICdlbic7XG5cbiAgICBpZiAob3B0aW9ucy5vbk1vdmUpIHtcbiAgICAgIG1hcC5vbignZHJhZ2VuZCcsIChldmVudCkgPT4ge1xuXG5cbiAgICAgICAgbGV0IHN3ID0gW21hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW21hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubG5nXTtcbiAgICAgICAgb3B0aW9ucy5vbk1vdmUoc3csIG5lKTtcbiAgICAgIH0pLm9uKCd6b29tZW5kJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChtYXAuZ2V0Wm9vbSgpIDw9IDQpIHtcbiAgICAgICAgICAkKFwiI21hcFwiKS5hZGRDbGFzcyhcInpvb21lZC1vdXRcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJChcIiNtYXBcIikucmVtb3ZlQ2xhc3MoXCJ6b29tZWQtb3V0XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHN3ID0gW21hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW21hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubG5nXTtcbiAgICAgICAgb3B0aW9ucy5vbk1vdmUoc3csIG5lKTtcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gbWFwLmZpcmVFdmVudCgnem9vbWVuZCcpO1xuXG4gICAgTC50aWxlTGF5ZXIoJ2h0dHBzOi8vYXBpLm1hcGJveC5jb20vc3R5bGVzL3YxL21hdHRoZXczNTAvY2phNDF0aWprMjdkNjJycW9kN2cwbHg0Yi90aWxlcy8yNTYve3p9L3t4fS97eX0/YWNjZXNzX3Rva2VuPScgKyBhY2Nlc3NUb2tlbiwge1xuICAgICAgICBhdHRyaWJ1dGlvbjogJyZjb3B5OyA8YSBocmVmPVwiaHR0cDovL29zbS5vcmcvY29weXJpZ2h0XCI+T3BlblN0cmVldE1hcDwvYT4gY29udHJpYnV0b3JzIOKAoiA8YSBocmVmPVwiLy8zNTAub3JnXCI+MzUwLm9yZzwvYT4nXG4gICAgfSkuYWRkVG8obWFwKTtcblxuICAgIGxldCBnZW9jb2RlciA9IG51bGw7XG4gICAgcmV0dXJuIHtcbiAgICAgICRtYXA6IG1hcCxcbiAgICAgIGluaXRpYWxpemU6IChjYWxsYmFjaykgPT4ge1xuICAgICAgICBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgc2V0Qm91bmRzOiAoYm91bmRzMSwgYm91bmRzMikgPT4ge1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtib3VuZHMxLCBib3VuZHMyXTtcbiAgICAgICAgbWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuICAgICAgfSxcbiAgICAgIHNldENlbnRlcjogKGNlbnRlciwgem9vbSA9IDEwKSA9PiB7XG4gICAgICAgIGlmICghY2VudGVyIHx8ICFjZW50ZXJbMF0gfHwgY2VudGVyWzBdID09IFwiXCJcbiAgICAgICAgICAgICAgfHwgIWNlbnRlclsxXSB8fCBjZW50ZXJbMV0gPT0gXCJcIikgcmV0dXJuO1xuICAgICAgICBtYXAuc2V0VmlldyhjZW50ZXIsIHpvb20pO1xuICAgICAgfSxcbiAgICAgIGdldEJvdW5kczogKCkgPT4ge1xuXG4gICAgICAgIGxldCBzdyA9IFttYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxuZ107XG4gICAgICAgIGxldCBuZSA9IFttYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxuZ107XG5cbiAgICAgICAgcmV0dXJuIFtzdywgbmVdO1xuICAgICAgfSxcbiAgICAgIC8vIENlbnRlciBsb2NhdGlvbiBieSBnZW9jb2RlZFxuICAgICAgZ2V0Q2VudGVyQnlMb2NhdGlvbjogKGxvY2F0aW9uLCBjYWxsYmFjaykgPT4ge1xuXG4gICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBsb2NhdGlvbiB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG5cbiAgICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXN1bHRzWzBdKVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgdHJpZ2dlclpvb21FbmQ6ICgpID0+IHtcbiAgICAgICAgbWFwLmZpcmVFdmVudCgnem9vbWVuZCcpO1xuICAgICAgfSxcbiAgICAgIHpvb21PdXRPbmNlOiAoKSA9PiB7XG4gICAgICAgIG1hcC56b29tT3V0KDEpO1xuICAgICAgfSxcbiAgICAgIHpvb21VbnRpbEhpdDogKCkgPT4ge1xuICAgICAgICB2YXIgJHRoaXMgPSB0aGlzO1xuICAgICAgICBtYXAuem9vbU91dCgxKTtcbiAgICAgICAgbGV0IGludGVydmFsSGFuZGxlciA9IG51bGw7XG4gICAgICAgIGludGVydmFsSGFuZGxlciA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICB2YXIgX3Zpc2libGUgPSAkKGRvY3VtZW50KS5maW5kKCd1bCBsaS5ldmVudC1vYmoud2l0aGluLWJvdW5kLCB1bCBsaS5ncm91cC1vYmoud2l0aGluLWJvdW5kJykubGVuZ3RoO1xuICAgICAgICAgIGlmIChfdmlzaWJsZSA9PSAwKSB7XG4gICAgICAgICAgICBtYXAuem9vbU91dCgxKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbEhhbmRsZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgMjAwKTtcbiAgICAgIH0sXG4gICAgICByZWZyZXNoTWFwOiAoKSA9PiB7XG4gICAgICAgIG1hcC5pbnZhbGlkYXRlU2l6ZShmYWxzZSk7XG4gICAgICAgIC8vIG1hcC5fb25SZXNpemUoKTtcbiAgICAgICAgLy8gbWFwLmZpcmVFdmVudCgnem9vbWVuZCcpO1xuXG5cbiAgICAgIH0sXG4gICAgICBmaWx0ZXJNYXA6IChmaWx0ZXJzKSA9PiB7XG5cbiAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwXCIpLmhpZGUoKTtcblxuXG4gICAgICAgIGlmICghZmlsdGVycykgcmV0dXJuO1xuXG4gICAgICAgIGZpbHRlcnMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuXG4gICAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwLlwiICsgaXRlbS50b0xvd2VyQ2FzZSgpKS5zaG93KCk7XG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgcGxvdFBvaW50czogKGxpc3QsIGhhcmRGaWx0ZXJzLCBncm91cHMpID0+IHtcbiAgICAgICAgY29uc3Qga2V5U2V0ID0gIWhhcmRGaWx0ZXJzLmtleSA/IFtdIDogaGFyZEZpbHRlcnMua2V5LnNwbGl0KCcsJyk7XG5cbiAgICAgICAgaWYgKGtleVNldC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgbGlzdCA9IGxpc3QuZmlsdGVyKChpdGVtKSA9PiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5ldmVudF90eXBlKSlcbiAgICAgICAgfVxuXG5cbiAgICAgICAgY29uc3QgZ2VvanNvbiA9IHtcbiAgICAgICAgICB0eXBlOiBcIkZlYXR1cmVDb2xsZWN0aW9uXCIsXG4gICAgICAgICAgZmVhdHVyZXM6IHJlbmRlckdlb2pzb24obGlzdCwgcmVmZXJyZXIsIHNvdXJjZSlcbiAgICAgICAgfTtcblxuXG4gICAgICAgIEwuZ2VvSlNPTihnZW9qc29uLCB7XG4gICAgICAgICAgICBwb2ludFRvTGF5ZXI6IChmZWF0dXJlLCBsYXRsbmcpID0+IHtcbiAgICAgICAgICAgICAgLy8gSWNvbnMgZm9yIG1hcmtlcnNcbiAgICAgICAgICAgICAgY29uc3QgZXZlbnRUeXBlID0gZmVhdHVyZS5wcm9wZXJ0aWVzLmV2ZW50UHJvcGVydGllcy5ldmVudF90eXBlO1xuXG4gICAgICAgICAgICAgIC8vIElmIG5vIHN1cGVyZ3JvdXAsIGl0J3MgYW4gZXZlbnQuXG4gICAgICAgICAgICAgIGNvbnN0IHN1cGVyZ3JvdXAgPSBncm91cHNbZmVhdHVyZS5wcm9wZXJ0aWVzLmV2ZW50UHJvcGVydGllcy5zdXBlcmdyb3VwXSA/IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuc3VwZXJncm91cCA6IFwiRXZlbnRzXCI7XG4gICAgICAgICAgICAgIGNvbnN0IHNsdWdnZWQgPSB3aW5kb3cuc2x1Z2lmeShzdXBlcmdyb3VwKTtcbiAgICAgICAgICAgICAgY29uc3QgaWNvblVybCA9IGdyb3Vwc1tzdXBlcmdyb3VwXSA/IGdyb3Vwc1tzdXBlcmdyb3VwXS5pY29udXJsIHx8IFwiL2ltZy9ldmVudC5wbmdcIiAgOiBcIi9pbWcvZXZlbnQucG5nXCIgO1xuXG4gICAgICAgICAgICAgIGNvbnN0IHNtYWxsSWNvbiA9ICBMLmljb24oe1xuICAgICAgICAgICAgICAgIGljb25Vcmw6IGljb25VcmwsXG4gICAgICAgICAgICAgICAgaWNvblNpemU6IFsxOCwgMThdLFxuICAgICAgICAgICAgICAgIGljb25BbmNob3I6IFs5LCA5XSxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IHNsdWdnZWQgKyAnIGV2ZW50LWl0ZW0tcG9wdXAnXG4gICAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgICAgdmFyIGdlb2pzb25NYXJrZXJPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIGljb246IHNtYWxsSWNvbixcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgcmV0dXJuIEwubWFya2VyKGxhdGxuZywgZ2VvanNvbk1hcmtlck9wdGlvbnMpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgIG9uRWFjaEZlYXR1cmU6IChmZWF0dXJlLCBsYXllcikgPT4ge1xuICAgICAgICAgICAgaWYgKGZlYXR1cmUucHJvcGVydGllcyAmJiBmZWF0dXJlLnByb3BlcnRpZXMucG9wdXBDb250ZW50KSB7XG4gICAgICAgICAgICAgIGxheWVyLmJpbmRQb3B1cChmZWF0dXJlLnByb3BlcnRpZXMucG9wdXBDb250ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pLmFkZFRvKG1hcCk7XG5cbiAgICAgIH0sXG4gICAgICB1cGRhdGU6IChwKSA9PiB7XG4gICAgICAgIGlmICghcCB8fCAhcC5sYXQgfHwgIXAubG5nICkgcmV0dXJuO1xuXG4gICAgICAgIG1hcC5zZXRWaWV3KEwubGF0TG5nKHAubGF0LCBwLmxuZyksIDEwKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiY29uc3QgUXVlcnlNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIHJldHVybiAodGFyZ2V0Rm9ybSA9IFwiZm9ybSNmaWx0ZXJzLWZvcm1cIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0Rm9ybSA9PT0gJ3N0cmluZycgPyAkKHRhcmdldEZvcm0pIDogdGFyZ2V0Rm9ybTtcbiAgICBsZXQgbGF0ID0gbnVsbDtcbiAgICBsZXQgbG5nID0gbnVsbDtcblxuICAgIGxldCBwcmV2aW91cyA9IHt9O1xuXG4gICAgJHRhcmdldC5vbignc3VibWl0JywgKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGxhdCA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwoKTtcbiAgICAgIGxuZyA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwoKTtcblxuICAgICAgdmFyIGZvcm0gPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG5cbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJC5wYXJhbShmb3JtKTtcbiAgICB9KVxuXG4gICAgJChkb2N1bWVudCkub24oJ2NoYW5nZScsICdzZWxlY3QjZmlsdGVyLWl0ZW1zJywgKCkgPT4ge1xuICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICB9KVxuXG5cbiAgICByZXR1cm4ge1xuICAgICAgaW5pdGlhbGl6ZTogKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdmFyIHBhcmFtcyA9ICQuZGVwYXJhbSh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkpXG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYW5nXVwiKS52YWwocGFyYW1zLmxhbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwocGFyYW1zLmxhdCk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChwYXJhbXMubG5nKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKHBhcmFtcy5ib3VuZDEpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwocGFyYW1zLmJvdW5kMik7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sb2NdXCIpLnZhbChwYXJhbXMubG9jKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWtleV1cIikudmFsKHBhcmFtcy5rZXkpO1xuXG4gICAgICAgICAgaWYgKHBhcmFtcy5maWx0ZXIpIHtcbiAgICAgICAgICAgICR0YXJnZXQuZmluZChcIiNmaWx0ZXItaXRlbXMgb3B0aW9uXCIpLnJlbW92ZVByb3AoXCJzZWxlY3RlZFwiKTtcbiAgICAgICAgICAgIHBhcmFtcy5maWx0ZXIuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiI2ZpbHRlci1pdGVtcyBvcHRpb25bdmFsdWU9J1wiICsgaXRlbSArIFwiJ11cIikucHJvcChcInNlbGVjdGVkXCIsIHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBnZXRQYXJhbWV0ZXJzOiAoKSA9PiB7XG4gICAgICAgIHZhciBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuICAgICAgICAvLyBwYXJhbWV0ZXJzWydsb2NhdGlvbiddIDtcblxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBwYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgaWYgKCAhcGFyYW1ldGVyc1trZXldIHx8IHBhcmFtZXRlcnNba2V5XSA9PSBcIlwiKSB7XG4gICAgICAgICAgICBkZWxldGUgcGFyYW1ldGVyc1trZXldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJhbWV0ZXJzO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZUxvY2F0aW9uOiAobGF0LCBsbmcpID0+IHtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChsYXQpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKGxuZyk7XG4gICAgICAgIC8vICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlVmlld3BvcnQ6ICh2aWV3cG9ydCkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtbdmlld3BvcnQuZi5iLCB2aWV3cG9ydC5iLmJdLCBbdmlld3BvcnQuZi5mLCB2aWV3cG9ydC5iLmZdXTtcblxuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1swXSkpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1sxXSkpO1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZVZpZXdwb3J0QnlCb3VuZDogKHN3LCBuZSkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtzdywgbmVdOy8vLy8vLy8vXG5cblxuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1swXSkpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1sxXSkpO1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHRyaWdnZXJTdWJtaXQ6ICgpID0+IHtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJsZXQgYXV0b2NvbXBsZXRlTWFuYWdlcjtcbmxldCBtYXBNYW5hZ2VyO1xuXG53aW5kb3cuREVGQVVMVF9JQ09OID0gXCIvaW1nL2V2ZW50LnBuZ1wiO1xud2luZG93LnNsdWdpZnkgPSAodGV4dCkgPT4gIXRleHQgPyB0ZXh0IDogdGV4dC50b1N0cmluZygpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxzKy9nLCAnLScpICAgICAgICAgICAvLyBSZXBsYWNlIHNwYWNlcyB3aXRoIC1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvW15cXHdcXC1dKy9nLCAnJykgICAgICAgLy8gUmVtb3ZlIGFsbCBub24td29yZCBjaGFyc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXC1cXC0rL2csICctJykgICAgICAgICAvLyBSZXBsYWNlIG11bHRpcGxlIC0gd2l0aCBzaW5nbGUgLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9eLSsvLCAnJykgICAgICAgICAgICAgLy8gVHJpbSAtIGZyb20gc3RhcnQgb2YgdGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8tKyQvLCAnJyk7ICAgICAgICAgICAgLy8gVHJpbSAtIGZyb20gZW5kIG9mIHRleHRcblxuY29uc3QgZ2V0UXVlcnlTdHJpbmcgPSAoKSA9PiB7XG4gICAgdmFyIHF1ZXJ5U3RyaW5nS2V5VmFsdWUgPSB3aW5kb3cucGFyZW50LmxvY2F0aW9uLnNlYXJjaC5yZXBsYWNlKCc/JywgJycpLnNwbGl0KCcmJyk7XG4gICAgdmFyIHFzSnNvbk9iamVjdCA9IHt9O1xuICAgIGlmIChxdWVyeVN0cmluZ0tleVZhbHVlICE9ICcnKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcXVlcnlTdHJpbmdLZXlWYWx1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcXNKc29uT2JqZWN0W3F1ZXJ5U3RyaW5nS2V5VmFsdWVbaV0uc3BsaXQoJz0nKVswXV0gPSBxdWVyeVN0cmluZ0tleVZhbHVlW2ldLnNwbGl0KCc9JylbMV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHFzSnNvbk9iamVjdDtcbn07XG5cbihmdW5jdGlvbigkKSB7XG4gIC8vIExvYWQgdGhpbmdzXG5cbiAgd2luZG93LnF1ZXJpZXMgPSAgJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyaW5nKDEpKTtcblxuICB0cnkge1xuICAgIGlmICgoIXdpbmRvdy5xdWVyaWVzLmdyb3VwIHx8ICghd2luZG93LnF1ZXJpZXMucmVmZXJyZXIgJiYgIXdpbmRvdy5xdWVyaWVzLnNvdXJjZSkpICYmIHdpbmRvdy5wYXJlbnQpIHtcbiAgICAgIHdpbmRvdy5xdWVyaWVzID0ge1xuICAgICAgICBncm91cDogZ2V0UXVlcnlTdHJpbmcoKS5ncm91cCxcbiAgICAgICAgcmVmZXJyZXI6IGdldFF1ZXJ5U3RyaW5nKCkucmVmZXJyZXIsXG4gICAgICAgIHNvdXJjZTogZ2V0UXVlcnlTdHJpbmcoKS5zb3VyY2UsXG4gICAgICB9O1xuICAgIH1cbiAgfSBjYXRjaChlKSB7XG4gICAgY29uc29sZS5sb2coXCJFcnJvcjogXCIsIGUpO1xuICB9XG5cblxuICBpZiAod2luZG93LnF1ZXJpZXMuZ3JvdXApIHtcbiAgICAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykucGFyZW50KCkuY3NzKFwib3BhY2l0eVwiLCBcIjBcIik7XG4gIH1cbiAgY29uc3QgYnVpbGRGaWx0ZXJzID0gKCkgPT4geyQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5tdWx0aXNlbGVjdCh7XG4gICAgICBlbmFibGVIVE1MOiB0cnVlLFxuICAgICAgdGVtcGxhdGVzOiB7XG4gICAgICAgIGJ1dHRvbjogJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwibXVsdGlzZWxlY3QgZHJvcGRvd24tdG9nZ2xlXCIgZGF0YS10b2dnbGU9XCJkcm9wZG93blwiPjxzcGFuIGRhdGEtbGFuZy10YXJnZXQ9XCJ0ZXh0XCIgZGF0YS1sYW5nLWtleT1cIm1vcmUtc2VhcmNoLW9wdGlvbnNcIj48L3NwYW4+IDxzcGFuIGNsYXNzPVwiZmEgZmEtY2FyZXQtZG93blwiPjwvc3Bhbj48L2J1dHRvbj4nLFxuICAgICAgICBsaTogJzxsaT48YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPjxsYWJlbD48L2xhYmVsPjwvYT48L2xpPidcbiAgICAgIH0sXG4gICAgICBkcm9wUmlnaHQ6IHRydWUsXG4gICAgICBvbkluaXRpYWxpemVkOiAoKSA9PiB7XG5cbiAgICAgIH0sXG4gICAgICBvbkRyb3Bkb3duU2hvdzogKCkgPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwibW9iaWxlLXVwZGF0ZS1tYXAtaGVpZ2h0XCIpO1xuICAgICAgICB9LCAxMCk7XG5cbiAgICAgIH0sXG4gICAgICBvbkRyb3Bkb3duSGlkZTogKCkgPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwibW9iaWxlLXVwZGF0ZS1tYXAtaGVpZ2h0XCIpO1xuICAgICAgICB9LCAxMCk7XG4gICAgICB9LFxuICAgICAgb3B0aW9uTGFiZWw6IChlKSA9PiB7XG4gICAgICAgIC8vIGxldCBlbCA9ICQoICc8ZGl2PjwvZGl2PicgKTtcbiAgICAgICAgLy8gZWwuYXBwZW5kKCgpICsgXCJcIik7XG5cbiAgICAgICAgcmV0dXJuIHVuZXNjYXBlKCQoZSkuYXR0cignbGFiZWwnKSkgfHwgJChlKS5odG1sKCk7XG4gICAgICB9LFxuICAgIH0pO1xuICB9O1xuICBidWlsZEZpbHRlcnMoKTtcblxuXG4gICQoJ3NlbGVjdCNsYW5ndWFnZS1vcHRzJykubXVsdGlzZWxlY3Qoe1xuICAgIGVuYWJsZUhUTUw6IHRydWUsXG4gICAgb3B0aW9uQ2xhc3M6ICgpID0+ICdsYW5nLW9wdCcsXG4gICAgc2VsZWN0ZWRDbGFzczogKCkgPT4gJ2xhbmctc2VsJyxcbiAgICBidXR0b25DbGFzczogKCkgPT4gJ2xhbmctYnV0JyxcbiAgICBkcm9wUmlnaHQ6IHRydWUsXG4gICAgb3B0aW9uTGFiZWw6IChlKSA9PiB7XG4gICAgICAvLyBsZXQgZWwgPSAkKCAnPGRpdj48L2Rpdj4nICk7XG4gICAgICAvLyBlbC5hcHBlbmQoKCkgKyBcIlwiKTtcblxuICAgICAgcmV0dXJuIHVuZXNjYXBlKCQoZSkuYXR0cignbGFiZWwnKSkgfHwgJChlKS5odG1sKCk7XG4gICAgfSxcbiAgICBvbkNoYW5nZTogKG9wdGlvbiwgY2hlY2tlZCwgc2VsZWN0KSA9PiB7XG5cbiAgICAgIGNvbnN0IHBhcmFtZXRlcnMgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuICAgICAgcGFyYW1ldGVyc1snbGFuZyddID0gb3B0aW9uLnZhbCgpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItcmVzZXQtbWFwJywgcGFyYW1ldGVycyk7XG5cbiAgICB9XG4gIH0pXG5cbiAgLy8gMS4gZ29vZ2xlIG1hcHMgZ2VvY29kZVxuXG4gIC8vIDIuIGZvY3VzIG1hcCBvbiBnZW9jb2RlICh2aWEgbGF0L2xuZylcbiAgY29uc3QgcXVlcnlNYW5hZ2VyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgICAgIHF1ZXJ5TWFuYWdlci5pbml0aWFsaXplKCk7XG5cbiAgY29uc3QgaW5pdFBhcmFtcyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG5cblxuXG4gIGNvbnN0IGxhbmd1YWdlTWFuYWdlciA9IExhbmd1YWdlTWFuYWdlcigpO1xuXG4gIGNvbnN0IGxpc3RNYW5hZ2VyID0gTGlzdE1hbmFnZXIoe1xuICAgIHJlZmVycmVyOiB3aW5kb3cucXVlcmllcy5yZWZlcnJlcixcbiAgICBzb3VyY2U6IHdpbmRvdy5xdWVyaWVzLnNvdXJjZVxuICB9KTtcblxuXG4gIG1hcE1hbmFnZXIgPSBNYXBNYW5hZ2VyKHtcbiAgICBvbk1vdmU6IChzdywgbmUpID0+IHtcbiAgICAgIC8vIFdoZW4gdGhlIG1hcCBtb3ZlcyBhcm91bmQsIHdlIHVwZGF0ZSB0aGUgbGlzdFxuICAgICAgcXVlcnlNYW5hZ2VyLnVwZGF0ZVZpZXdwb3J0QnlCb3VuZChzdywgbmUpO1xuICAgICAgLy91cGRhdGUgUXVlcnlcbiAgICB9LFxuICAgIHJlZmVycmVyOiB3aW5kb3cucXVlcmllcy5yZWZlcnJlcixcbiAgICBzb3VyY2U6IHdpbmRvdy5xdWVyaWVzLnNvdXJjZVxuICB9KTtcblxuICB3aW5kb3cuaW5pdGlhbGl6ZUF1dG9jb21wbGV0ZUNhbGxiYWNrID0gKCkgPT4ge1xuXG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlciA9IEF1dG9jb21wbGV0ZU1hbmFnZXIoXCJpbnB1dFtuYW1lPSdsb2MnXVwiKTtcbiAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICAgIGlmIChpbml0UGFyYW1zLmxvYyAmJiBpbml0UGFyYW1zLmxvYyAhPT0gJycgJiYgKCFpbml0UGFyYW1zLmJvdW5kMSAmJiAhaW5pdFBhcmFtcy5ib3VuZDIpKSB7XG4gICAgICBtYXBNYW5hZ2VyLmluaXRpYWxpemUoKCkgPT4ge1xuICAgICAgICBtYXBNYW5hZ2VyLmdldENlbnRlckJ5TG9jYXRpb24oaW5pdFBhcmFtcy5sb2MsIChyZXN1bHQpID0+IHtcbiAgICAgICAgICBxdWVyeU1hbmFnZXIudXBkYXRlVmlld3BvcnQocmVzdWx0Lmdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGlmKGluaXRQYXJhbXMubGF0ICYmIGluaXRQYXJhbXMubG5nKSB7XG4gICAgbWFwTWFuYWdlci5zZXRDZW50ZXIoW2luaXRQYXJhbXMubGF0LCBpbml0UGFyYW1zLmxuZ10pO1xuICB9XG5cbiAgLyoqKlxuICAqIExpc3QgRXZlbnRzXG4gICogVGhpcyB3aWxsIHRyaWdnZXIgdGhlIGxpc3QgdXBkYXRlIG1ldGhvZFxuICAqL1xuICAkKGRvY3VtZW50KS5vbignbW9iaWxlLXVwZGF0ZS1tYXAtaGVpZ2h0JywgKGV2ZW50KSA9PiB7XG4gICAgLy9UaGlzIGNoZWNrcyBpZiB3aWR0aCBpcyBmb3IgbW9iaWxlXG4gICAgaWYgKCQod2luZG93KS53aWR0aCgpIDwgNjAwKSB7XG4gICAgICBzZXRUaW1lb3V0KCgpPT4ge1xuICAgICAgICAkKFwiI21hcFwiKS5oZWlnaHQoJChcIiNldmVudHMtbGlzdFwiKS5oZWlnaHQoKSk7XG4gICAgICAgIG1hcE1hbmFnZXIucmVmcmVzaE1hcCgpO1xuICAgICAgfSwgMTApO1xuICAgIH1cbiAgfSlcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICBsaXN0TWFuYWdlci5wb3B1bGF0ZUxpc3Qob3B0aW9ucy5wYXJhbXMpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcblxuICAgIGxpc3RNYW5hZ2VyLnVwZGF0ZUZpbHRlcihvcHRpb25zKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICBsZXQgYm91bmQxLCBib3VuZDI7XG5cbiAgICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMuYm91bmQxIHx8ICFvcHRpb25zLmJvdW5kMikge1xuICAgICAgW2JvdW5kMSwgYm91bmQyXSA9IG1hcE1hbmFnZXIuZ2V0Qm91bmRzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJvdW5kMSA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDEpO1xuICAgICAgYm91bmQyID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMik7XG4gICAgfVxuXG4gICAgbGlzdE1hbmFnZXIudXBkYXRlQm91bmRzKGJvdW5kMSwgYm91bmQyKVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1yZXNldC1tYXAnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICB2YXIgY29weSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3B0aW9ucykpO1xuICAgIGRlbGV0ZSBjb3B5WydsbmcnXTtcbiAgICBkZWxldGUgY29weVsnbGF0J107XG4gICAgZGVsZXRlIGNvcHlbJ2JvdW5kMSddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDInXTtcblxuICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJC5wYXJhbShjb3B5KTtcblxuXG4gICAgJChkb2N1bWVudCkudHJpZ2dlcihcInRyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlXCIsIGNvcHkpO1xuICAgICQoXCJzZWxlY3QjZmlsdGVyLWl0ZW1zXCIpLm11bHRpc2VsZWN0KCdkZXN0cm95Jyk7XG4gICAgYnVpbGRGaWx0ZXJzKCk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sb2FkLWdyb3VwcycsIHsgZ3JvdXBzOiB3aW5kb3cuRVZFTlRTX0RBVEEuZ3JvdXBzIH0pO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwidHJpZ2dlci1sYW5ndWFnZS11cGRhdGVcIiwgY29weSk7XG4gICAgfSwgMTAwMCk7XG4gIH0pO1xuXG5cbiAgLyoqKlxuICAqIE1hcCBFdmVudHNcbiAgKi9cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIC8vIG1hcE1hbmFnZXIuc2V0Q2VudGVyKFtvcHRpb25zLmxhdCwgb3B0aW9ucy5sbmddKTtcbiAgICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMuYm91bmQxIHx8ICFvcHRpb25zLmJvdW5kMikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBib3VuZDEgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQxKTtcbiAgICB2YXIgYm91bmQyID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMik7XG5cbiAgICBtYXBNYW5hZ2VyLnNldEJvdW5kcyhib3VuZDEsIGJvdW5kMik7XG4gICAgLy8gbWFwTWFuYWdlci50cmlnZ2VyWm9vbUVuZCgpO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBtYXBNYW5hZ2VyLnRyaWdnZXJab29tRW5kKCk7XG4gICAgfSwgMTApO1xuXG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsIFwiI2NvcHktZW1iZWRcIiwgKGUpID0+IHtcbiAgICB2YXIgY29weVRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVtYmVkLXRleHRcIik7XG4gICAgY29weVRleHQuc2VsZWN0KCk7XG4gICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJDb3B5XCIpO1xuICB9KTtcblxuICAvLyAzLiBtYXJrZXJzIG9uIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtcGxvdCcsIChlLCBvcHQpID0+IHtcblxuICAgIG1hcE1hbmFnZXIucGxvdFBvaW50cyhvcHQuZGF0YSwgb3B0LnBhcmFtcywgb3B0Lmdyb3Vwcyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJyk7XG4gIH0pXG5cbiAgLy8gbG9hZCBncm91cHNcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sb2FkLWdyb3VwcycsIChlLCBvcHQpID0+IHtcbiAgICAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykuZW1wdHkoKTtcbiAgICBvcHQuZ3JvdXBzLmZvckVhY2goKGl0ZW0pID0+IHtcblxuICAgICAgbGV0IHNsdWdnZWQgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuICAgICAgbGV0IHZhbHVlVGV4dCA9IGxhbmd1YWdlTWFuYWdlci5nZXRUcmFuc2xhdGlvbihpdGVtLnRyYW5zbGF0aW9uKTtcbiAgICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5hcHBlbmQoYFxuICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0nJHtzbHVnZ2VkfSdcbiAgICAgICAgICAgICAgc2VsZWN0ZWQ9J3NlbGVjdGVkJ1xuICAgICAgICAgICAgICBsYWJlbD1cIjxzcGFuIGRhdGEtbGFuZy10YXJnZXQ9J3RleHQnIGRhdGEtbGFuZy1rZXk9JyR7aXRlbS50cmFuc2xhdGlvbn0nPiR7dmFsdWVUZXh0fTwvc3Bhbj48aW1nIHNyYz0nJHtpdGVtLmljb251cmwgfHwgd2luZG93LkRFRkFVTFRfSUNPTn0nIC8+XCI+XG4gICAgICAgICAgICA8L29wdGlvbj5gKVxuICAgIH0pO1xuXG4gICAgLy8gUmUtaW5pdGlhbGl6ZVxuICAgIHF1ZXJ5TWFuYWdlci5pbml0aWFsaXplKCk7XG4gICAgLy8gJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KCdkZXN0cm95Jyk7XG4gICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KCdyZWJ1aWxkJyk7XG5cbiAgICBtYXBNYW5hZ2VyLnJlZnJlc2hNYXAoKTtcblxuXG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sYW5ndWFnZS11cGRhdGUnKTtcblxuICB9KVxuXG4gIC8vIEZpbHRlciBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLWZpbHRlcicsIChlLCBvcHQpID0+IHtcbiAgICBpZiAob3B0KSB7XG4gICAgICBtYXBNYW5hZ2VyLmZpbHRlck1hcChvcHQuZmlsdGVyKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZScsIChlLCBvcHQpID0+IHtcblxuICAgIGlmIChvcHQpIHtcblxuICAgICAgbGFuZ3VhZ2VNYW5hZ2VyLnVwZGF0ZUxhbmd1YWdlKG9wdC5sYW5nKTtcbiAgICB9IGVsc2Uge1xuXG4gICAgICBsYW5ndWFnZU1hbmFnZXIucmVmcmVzaCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGFuZ3VhZ2UtbG9hZGVkJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5tdWx0aXNlbGVjdCgncmVidWlsZCcpO1xuICB9KVxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24jc2hvdy1oaWRlLW1hcCcsIChlLCBvcHQpID0+IHtcbiAgICAkKCdib2R5JykudG9nZ2xlQ2xhc3MoJ21hcC12aWV3JylcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbi5idG4ubW9yZS1pdGVtcycsIChlLCBvcHQpID0+IHtcbiAgICAkKCcjZW1iZWQtYXJlYScpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgKGUsIG9wdCkgPT4ge1xuICAgIC8vdXBkYXRlIGVtYmVkIGxpbmVcbiAgICB2YXIgY29weSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3B0KSk7XG4gICAgZGVsZXRlIGNvcHlbJ2xuZyddO1xuICAgIGRlbGV0ZSBjb3B5WydsYXQnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQxJ107XG4gICAgZGVsZXRlIGNvcHlbJ2JvdW5kMiddO1xuXG4gICAgJCgnI2VtYmVkLWFyZWEgaW5wdXRbbmFtZT1lbWJlZF0nKS52YWwoJ2h0dHBzOi8vbmV3LW1hcC4zNTAub3JnIycgKyAkLnBhcmFtKGNvcHkpKTtcbiAgfSk7XG5cblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uI3pvb20tb3V0JywgKGUsIG9wdCkgPT4ge1xuXG4gICAgLy8gbWFwTWFuYWdlci56b29tT3V0T25jZSgpO1xuXG4gICAgbWFwTWFuYWdlci56b29tVW50aWxIaXQoKTtcbiAgfSlcblxuICAkKHdpbmRvdykub24oXCJyZXNpemVcIiwgKGUpID0+IHtcbiAgICBtYXBNYW5hZ2VyLnJlZnJlc2hNYXAoKTtcbiAgfSk7XG5cbiAgLyoqXG4gIEZpbHRlciBDaGFuZ2VzXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgXCIuc2VhcmNoLWJ1dHRvbiBidXR0b25cIiwgKGUpID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcihcInNlYXJjaC5mb3JjZS1zZWFyY2gtbG9jYXRpb25cIik7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbihcImtleXVwXCIsIFwiaW5wdXRbbmFtZT0nbG9jJ11cIiwgKGUpID0+IHtcbiAgICBpZiAoZS5rZXlDb2RlID09IDEzKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCdzZWFyY2guZm9yY2Utc2VhcmNoLWxvY2F0aW9uJyk7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignc2VhcmNoLmZvcmNlLXNlYXJjaC1sb2NhdGlvbicsICgpID0+IHtcbiAgICBsZXQgX3F1ZXJ5ID0gJChcImlucHV0W25hbWU9J2xvYyddXCIpLnZhbCgpO1xuICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuZm9yY2VTZWFyY2goX3F1ZXJ5KTtcbiAgICAvLyBTZWFyY2ggZ29vZ2xlIGFuZCBnZXQgdGhlIGZpcnN0IHJlc3VsdC4uLiBhdXRvY29tcGxldGU/XG4gIH0pO1xuXG4gICQod2luZG93KS5vbihcImhhc2hjaGFuZ2VcIiwgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgIGlmIChoYXNoLmxlbmd0aCA9PSAwKSByZXR1cm47XG4gICAgY29uc3QgcGFyYW1ldGVycyA9ICQuZGVwYXJhbShoYXNoLnN1YnN0cmluZygxKSk7XG4gICAgY29uc3Qgb2xkVVJMID0gZXZlbnQub3JpZ2luYWxFdmVudC5vbGRVUkw7XG5cblxuICAgIGNvbnN0IG9sZEhhc2ggPSAkLmRlcGFyYW0ob2xkVVJMLnN1YnN0cmluZyhvbGRVUkwuc2VhcmNoKFwiI1wiKSsxKSk7XG5cblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcblxuICAgIC8vIFNvIHRoYXQgY2hhbmdlIGluIGZpbHRlcnMgd2lsbCBub3QgdXBkYXRlIHRoaXNcbiAgICBpZiAob2xkSGFzaC5ib3VuZDEgIT09IHBhcmFtZXRlcnMuYm91bmQxIHx8IG9sZEhhc2guYm91bmQyICE9PSBwYXJhbWV0ZXJzLmJvdW5kMikge1xuXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLWJ5LWJvdW5kJywgcGFyYW1ldGVycyk7XG4gICAgfVxuXG4gICAgaWYgKG9sZEhhc2gubG9nICE9PSBwYXJhbWV0ZXJzLmxvYykge1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcGFyYW1ldGVycyk7XG5cbiAgICB9XG5cbiAgICAvLyBDaGFuZ2UgaXRlbXNcbiAgICBpZiAob2xkSGFzaC5sYW5nICE9PSBwYXJhbWV0ZXJzLmxhbmcpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgfVxuICB9KVxuXG4gIC8vIDQuIGZpbHRlciBvdXQgaXRlbXMgaW4gYWN0aXZpdHktYXJlYVxuXG4gIC8vIDUuIGdldCBtYXAgZWxlbWVudHNcblxuICAvLyA2LiBnZXQgR3JvdXAgZGF0YVxuXG4gIC8vIDcuIHByZXNlbnQgZ3JvdXAgZWxlbWVudHNcblxuICAkLndoZW4oKCk9Pnt9KVxuICAgIC50aGVuKCgpID0+e1xuICAgICAgcmV0dXJuIGxhbmd1YWdlTWFuYWdlci5pbml0aWFsaXplKGluaXRQYXJhbXNbJ2xhbmcnXSB8fCAnZW4nKTtcbiAgICB9KVxuICAgIC5kb25lKChkYXRhKSA9PiB7fSlcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICAkLmFqYXgoe1xuICAgICAgICAgIHVybDogJ2h0dHBzOi8vbmV3LW1hcC4zNTAub3JnL291dHB1dC8zNTBvcmctbmV3LWxheW91dC5qcy5neicsIC8vJ3wqKkRBVEFfU09VUkNFKip8JyxcbiAgICAgICAgICAvLyB1cmw6ICcvZGF0YS90ZXN0LmpzJywgLy8nfCoqREFUQV9TT1VSQ0UqKnwnLFxuICAgICAgICAgIGRhdGFUeXBlOiAnc2NyaXB0JyxcbiAgICAgICAgICBjYWNoZTogdHJ1ZSxcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgLy8gd2luZG93LkVWRU5UU19EQVRBID0gZGF0YTtcbiAgICAgICAgICAgIC8vSnVuZSAxNCwgMjAxOCDigJMgQ2hhbmdlc1xuICAgICAgICAgICAgaWYod2luZG93LnF1ZXJpZXMuZ3JvdXApIHtcbiAgICAgICAgICAgICAgd2luZG93LkVWRU5UU19EQVRBLmRhdGEgPSB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YS5maWx0ZXIoKGkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaS5jYW1wYWlnbiA9PSB3aW5kb3cucXVlcmllcy5ncm91cFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9Mb2FkIGdyb3Vwc1xuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sb2FkLWdyb3VwcycsIHsgZ3JvdXBzOiB3aW5kb3cuRVZFTlRTX0RBVEEuZ3JvdXBzIH0pO1xuXG5cbiAgICAgICAgICAgIHZhciBwYXJhbWV0ZXJzID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuICAgICAgICAgICAgd2luZG93LkVWRU5UU19EQVRBLmRhdGEuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICBpdGVtWydldmVudF90eXBlJ10gPSAhaXRlbS5ldmVudF90eXBlID8gJ0FjdGlvbicgOiBpdGVtLmV2ZW50X3R5cGU7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LXVwZGF0ZScsIHsgcGFyYW1zOiBwYXJhbWV0ZXJzIH0pO1xuICAgICAgICAgICAgLy8gJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXBsb3QnLCB7XG4gICAgICAgICAgICAgICAgZGF0YTogd2luZG93LkVWRU5UU19EQVRBLmRhdGEsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiBwYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICAgIGdyb3Vwczogd2luZG93LkVWRU5UU19EQVRBLmdyb3Vwcy5yZWR1Y2UoKGRpY3QsIGl0ZW0pPT57IGRpY3RbaXRlbS5zdXBlcmdyb3VwXSA9IGl0ZW07IHJldHVybiBkaWN0OyB9LCB7fSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgLy8gfSk7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgLy9UT0RPOiBNYWtlIHRoZSBnZW9qc29uIGNvbnZlcnNpb24gaGFwcGVuIG9uIHRoZSBiYWNrZW5kXG5cbiAgICAgICAgICAgIC8vUmVmcmVzaCB0aGluZ3NcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICBsZXQgcCA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG5cbiAgICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcCk7XG4gICAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicsIHApO1xuXG4gICAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcCk7XG4gICAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCBwKTtcblxuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cblxuXG59KShqUXVlcnkpO1xuIl19
