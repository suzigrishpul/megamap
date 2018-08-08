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
      // console.log(m.utcOffset());
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

          var mi5 = 0.0725;

          if (bound1[0] - mi5 <= _lat && bound2[0] + mi5 >= _lat && bound1[1] - mi5 <= _lng && bound2[1] + mi5 >= _lng) {

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9oZWxwZXIuanMiLCJjbGFzc2VzL2xhbmd1YWdlLmpzIiwiY2xhc3Nlcy9saXN0LmpzIiwiY2xhc3Nlcy9tYXAuanMiLCJjbGFzc2VzL3F1ZXJ5LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIkF1dG9jb21wbGV0ZU1hbmFnZXIiLCIkIiwidGFyZ2V0IiwiQVBJX0tFWSIsInRhcmdldEl0ZW0iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJxdWVyeU1nciIsIlF1ZXJ5TWFuYWdlciIsImdlb2NvZGVyIiwiZ29vZ2xlIiwibWFwcyIsIkdlb2NvZGVyIiwiJHRhcmdldCIsImZvcmNlU2VhcmNoIiwicSIsImdlb2NvZGUiLCJhZGRyZXNzIiwicmVzdWx0cyIsInN0YXR1cyIsImdlb21ldHJ5IiwidXBkYXRlVmlld3BvcnQiLCJ2aWV3cG9ydCIsInZhbCIsImZvcm1hdHRlZF9hZGRyZXNzIiwiaW5pdGlhbGl6ZSIsInR5cGVhaGVhZCIsImhpbnQiLCJoaWdobGlnaHQiLCJtaW5MZW5ndGgiLCJjbGFzc05hbWVzIiwibWVudSIsIm5hbWUiLCJkaXNwbGF5IiwiaXRlbSIsImxpbWl0Iiwic291cmNlIiwic3luYyIsImFzeW5jIiwib24iLCJvYmoiLCJkYXR1bSIsImpRdWVyeSIsIkhlbHBlciIsInJlZlNvdXJjZSIsInVybCIsInJlZiIsInNyYyIsImluZGV4T2YiLCJMYW5ndWFnZU1hbmFnZXIiLCJsYW5ndWFnZSIsImRpY3Rpb25hcnkiLCIkdGFyZ2V0cyIsInVwZGF0ZVBhZ2VMYW5ndWFnZSIsInRhcmdldExhbmd1YWdlIiwicm93cyIsImZpbHRlciIsImkiLCJsYW5nIiwiZWFjaCIsImluZGV4IiwidGFyZ2V0QXR0cmlidXRlIiwiZGF0YSIsImxhbmdUYXJnZXQiLCJ0ZXh0IiwiYXR0ciIsInRhcmdldHMiLCJhamF4IiwiZGF0YVR5cGUiLCJzdWNjZXNzIiwidHJpZ2dlciIsIm11bHRpc2VsZWN0IiwicmVmcmVzaCIsInVwZGF0ZUxhbmd1YWdlIiwiZ2V0VHJhbnNsYXRpb24iLCJrZXkiLCJMaXN0TWFuYWdlciIsIm9wdGlvbnMiLCJ0YXJnZXRMaXN0IiwicmVmZXJyZXIiLCJyZW5kZXJFdmVudCIsIm0iLCJtb21lbnQiLCJEYXRlIiwic3RhcnRfZGF0ZXRpbWUiLCJ1dGMiLCJzdWJ0cmFjdCIsInV0Y09mZnNldCIsImRhdGUiLCJmb3JtYXQiLCJtYXRjaCIsIndpbmRvdyIsInNsdWdpZnkiLCJldmVudF90eXBlIiwibGF0IiwibG5nIiwidGl0bGUiLCJ2ZW51ZSIsInJlbmRlckdyb3VwIiwid2Vic2l0ZSIsInN1cGVyR3JvdXAiLCJzdXBlcmdyb3VwIiwibG9jYXRpb24iLCJkZXNjcmlwdGlvbiIsIiRsaXN0IiwidXBkYXRlRmlsdGVyIiwicCIsInJlbW92ZVByb3AiLCJhZGRDbGFzcyIsImpvaW4iLCJmaW5kIiwiaGlkZSIsImZvckVhY2giLCJmaWwiLCJzaG93IiwidXBkYXRlQm91bmRzIiwiYm91bmQxIiwiYm91bmQyIiwiaW5kIiwiX2xhdCIsIl9sbmciLCJtaTUiLCJyZW1vdmVDbGFzcyIsIl92aXNpYmxlIiwibGVuZ3RoIiwicG9wdWxhdGVMaXN0IiwiaGFyZEZpbHRlcnMiLCJrZXlTZXQiLCJzcGxpdCIsIiRldmVudExpc3QiLCJFVkVOVFNfREFUQSIsIm1hcCIsInRvTG93ZXJDYXNlIiwiaW5jbHVkZXMiLCJyZW1vdmUiLCJhcHBlbmQiLCJNYXBNYW5hZ2VyIiwiTEFOR1VBR0UiLCJyZW5kZXJHZW9qc29uIiwibGlzdCIsInJlbmRlcmVkIiwiaXNOYU4iLCJwYXJzZUZsb2F0Iiwic3Vic3RyaW5nIiwidHlwZSIsImNvb3JkaW5hdGVzIiwicHJvcGVydGllcyIsImV2ZW50UHJvcGVydGllcyIsInBvcHVwQ29udGVudCIsImFjY2Vzc1Rva2VuIiwiTCIsImRyYWdnaW5nIiwiQnJvd3NlciIsIm1vYmlsZSIsInNldFZpZXciLCJzY3JvbGxXaGVlbFpvb20iLCJkaXNhYmxlIiwib25Nb3ZlIiwiZXZlbnQiLCJzdyIsImdldEJvdW5kcyIsIl9zb3V0aFdlc3QiLCJuZSIsIl9ub3J0aEVhc3QiLCJnZXRab29tIiwidGlsZUxheWVyIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsIiRtYXAiLCJjYWxsYmFjayIsInNldEJvdW5kcyIsImJvdW5kczEiLCJib3VuZHMyIiwiYm91bmRzIiwiZml0Qm91bmRzIiwic2V0Q2VudGVyIiwiY2VudGVyIiwiem9vbSIsImdldENlbnRlckJ5TG9jYXRpb24iLCJ0cmlnZ2VyWm9vbUVuZCIsImZpcmVFdmVudCIsInpvb21PdXRPbmNlIiwiem9vbU91dCIsInpvb21VbnRpbEhpdCIsIiR0aGlzIiwiaW50ZXJ2YWxIYW5kbGVyIiwic2V0SW50ZXJ2YWwiLCJjbGVhckludGVydmFsIiwicmVmcmVzaE1hcCIsImludmFsaWRhdGVTaXplIiwiZmlsdGVyTWFwIiwiZmlsdGVycyIsInBsb3RQb2ludHMiLCJncm91cHMiLCJnZW9qc29uIiwiZmVhdHVyZXMiLCJnZW9KU09OIiwicG9pbnRUb0xheWVyIiwiZmVhdHVyZSIsImxhdGxuZyIsImV2ZW50VHlwZSIsInNsdWdnZWQiLCJpY29uVXJsIiwiaWNvbnVybCIsInNtYWxsSWNvbiIsImljb24iLCJpY29uU2l6ZSIsImljb25BbmNob3IiLCJjbGFzc05hbWUiLCJnZW9qc29uTWFya2VyT3B0aW9ucyIsIm1hcmtlciIsIm9uRWFjaEZlYXR1cmUiLCJsYXllciIsImJpbmRQb3B1cCIsInVwZGF0ZSIsImxhdExuZyIsInRhcmdldEZvcm0iLCJwcmV2aW91cyIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImZvcm0iLCJkZXBhcmFtIiwic2VyaWFsaXplIiwiaGFzaCIsInBhcmFtIiwicGFyYW1zIiwibG9jIiwicHJvcCIsImdldFBhcmFtZXRlcnMiLCJwYXJhbWV0ZXJzIiwidXBkYXRlTG9jYXRpb24iLCJmIiwiYiIsIkpTT04iLCJzdHJpbmdpZnkiLCJ1cGRhdGVWaWV3cG9ydEJ5Qm91bmQiLCJ0cmlnZ2VyU3VibWl0IiwiYXV0b2NvbXBsZXRlTWFuYWdlciIsIm1hcE1hbmFnZXIiLCJERUZBVUxUX0lDT04iLCJ0b1N0cmluZyIsInJlcGxhY2UiLCJnZXRRdWVyeVN0cmluZyIsInF1ZXJ5U3RyaW5nS2V5VmFsdWUiLCJwYXJlbnQiLCJzZWFyY2giLCJxc0pzb25PYmplY3QiLCJxdWVyaWVzIiwiZ3JvdXAiLCJjb25zb2xlIiwibG9nIiwiY3NzIiwiYnVpbGRGaWx0ZXJzIiwiZW5hYmxlSFRNTCIsInRlbXBsYXRlcyIsImJ1dHRvbiIsImxpIiwiZHJvcFJpZ2h0Iiwib25Jbml0aWFsaXplZCIsIm9uRHJvcGRvd25TaG93Iiwic2V0VGltZW91dCIsIm9uRHJvcGRvd25IaWRlIiwib3B0aW9uTGFiZWwiLCJ1bmVzY2FwZSIsImh0bWwiLCJvcHRpb25DbGFzcyIsInNlbGVjdGVkQ2xhc3MiLCJidXR0b25DbGFzcyIsIm9uQ2hhbmdlIiwib3B0aW9uIiwiY2hlY2tlZCIsInNlbGVjdCIsInF1ZXJ5TWFuYWdlciIsImluaXRQYXJhbXMiLCJsYW5ndWFnZU1hbmFnZXIiLCJsaXN0TWFuYWdlciIsImluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayIsInJlc3VsdCIsIndpZHRoIiwiaGVpZ2h0IiwicGFyc2UiLCJjb3B5IiwiY29weVRleHQiLCJnZXRFbGVtZW50QnlJZCIsImV4ZWNDb21tYW5kIiwib3B0IiwiZW1wdHkiLCJ2YWx1ZVRleHQiLCJ0cmFuc2xhdGlvbiIsInRvZ2dsZUNsYXNzIiwia2V5Q29kZSIsIl9xdWVyeSIsIm9sZFVSTCIsIm9yaWdpbmFsRXZlbnQiLCJvbGRIYXNoIiwid2hlbiIsInRoZW4iLCJkb25lIiwiY2FjaGUiLCJjYW1wYWlnbiIsInJlZHVjZSIsImRpY3QiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7O0FBQ0EsSUFBTUEsc0JBQXVCLFVBQVNDLENBQVQsRUFBWTtBQUN2Qzs7QUFFQSxTQUFPLFVBQUNDLE1BQUQsRUFBWTs7QUFFakIsUUFBTUMsVUFBVSx5Q0FBaEI7QUFDQSxRQUFNQyxhQUFhLE9BQU9GLE1B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QVA7QUErQ0MsR0FyREw7QUF5REQsQ0F4WkQsRUF3WkdoRSxNQXhaSCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbi8vQVBJIDpBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cbmNvbnN0IEF1dG9jb21wbGV0ZU1hbmFnZXIgPSAoZnVuY3Rpb24oJCkge1xuICAvL0luaXRpYWxpemF0aW9uLi4uXG5cbiAgcmV0dXJuICh0YXJnZXQpID0+IHtcblxuICAgIGNvbnN0IEFQSV9LRVkgPSBcIkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVwiO1xuICAgIGNvbnN0IHRhcmdldEl0ZW0gPSB0eXBlb2YgdGFyZ2V0ID09IFwic3RyaW5nXCIgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCkgOiB0YXJnZXQ7XG4gICAgY29uc3QgcXVlcnlNZ3IgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICB2YXIgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcblxuICAgIHJldHVybiB7XG4gICAgICAkdGFyZ2V0OiAkKHRhcmdldEl0ZW0pLFxuICAgICAgdGFyZ2V0OiB0YXJnZXRJdGVtLFxuICAgICAgZm9yY2VTZWFyY2g6IChxKSA9PiB7XG4gICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBxIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICBpZiAocmVzdWx0c1swXSkge1xuICAgICAgICAgICAgbGV0IGdlb21ldHJ5ID0gcmVzdWx0c1swXS5nZW9tZXRyeTtcbiAgICAgICAgICAgIHF1ZXJ5TWdyLnVwZGF0ZVZpZXdwb3J0KGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICQodGFyZ2V0SXRlbSkudmFsKHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyB2YXIgZ2VvbWV0cnkgPSBkYXR1bS5nZW9tZXRyeTtcbiAgICAgICAgICAvLyBxdWVyeU1nci51cGRhdGVWaWV3cG9ydChnZW9tZXRyeS52aWV3cG9ydCk7XG5cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgaW5pdGlhbGl6ZTogKCkgPT4ge1xuICAgICAgICAkKHRhcmdldEl0ZW0pLnR5cGVhaGVhZCh7XG4gICAgICAgICAgICAgICAgICAgIGhpbnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWluTGVuZ3RoOiA0LFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgbWVudTogJ3R0LWRyb3Bkb3duLW1lbnUnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdzZWFyY2gtcmVzdWx0cycsXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IChpdGVtKSA9PiBpdGVtLmZvcm1hdHRlZF9hZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgICBsaW1pdDogMTAsXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogZnVuY3Rpb24gKHEsIHN5bmMsIGFzeW5jKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBxIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXN5bmMocmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICkub24oJ3R5cGVhaGVhZDpzZWxlY3RlZCcsIGZ1bmN0aW9uIChvYmosIGRhdHVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGRhdHVtKVxuICAgICAgICAgICAgICAgICAgICB7XG5cbiAgICAgICAgICAgICAgICAgICAgICB2YXIgZ2VvbWV0cnkgPSBkYXR1bS5nZW9tZXRyeTtcbiAgICAgICAgICAgICAgICAgICAgICBxdWVyeU1nci51cGRhdGVWaWV3cG9ydChnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gIG1hcC5maXRCb3VuZHMoZ2VvbWV0cnkuYm91bmRzPyBnZW9tZXRyeS5ib3VuZHMgOiBnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cblxuXG4gICAgcmV0dXJuIHtcblxuICAgIH1cbiAgfVxuXG59KGpRdWVyeSkpO1xuIiwiY29uc3QgSGVscGVyID0gKCgkKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlZlNvdXJjZTogKHVybCwgcmVmLCBzcmMpID0+IHtcbiAgICAgICAgLy8gSnVuIDEzIDIwMTgg4oCUIEZpeCBmb3Igc291cmNlIGFuZCByZWZlcnJlclxuICAgICAgICBpZiAocmVmIHx8IHNyYykge1xuICAgICAgICAgIGlmICh1cmwuaW5kZXhPZihcIj9cIikgPj0gMCkge1xuICAgICAgICAgICAgdXJsID0gYCR7dXJsfSZyZWZlcnJlcj0ke3JlZnx8XCJcIn0mc291cmNlPSR7c3JjfHxcIlwifWA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVybCA9IGAke3VybH0/cmVmZXJyZXI9JHtyZWZ8fFwiXCJ9JnNvdXJjZT0ke3NyY3x8XCJcIn1gO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB1cmw7XG4gICAgICB9XG4gICAgfTtcbn0pKGpRdWVyeSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IExhbmd1YWdlTWFuYWdlciA9ICgoJCkgPT4ge1xuICAvL2tleVZhbHVlXG5cbiAgLy90YXJnZXRzIGFyZSB0aGUgbWFwcGluZ3MgZm9yIHRoZSBsYW5ndWFnZVxuICByZXR1cm4gKCkgPT4ge1xuICAgIGxldCBsYW5ndWFnZTtcbiAgICBsZXQgZGljdGlvbmFyeSA9IHt9O1xuICAgIGxldCAkdGFyZ2V0cyA9ICQoXCJbZGF0YS1sYW5nLXRhcmdldF1bZGF0YS1sYW5nLWtleV1cIik7XG5cbiAgICBjb25zdCB1cGRhdGVQYWdlTGFuZ3VhZ2UgPSAoKSA9PiB7XG5cbiAgICAgIGxldCB0YXJnZXRMYW5ndWFnZSA9IGRpY3Rpb25hcnkucm93cy5maWx0ZXIoKGkpID0+IGkubGFuZyA9PT0gbGFuZ3VhZ2UpWzBdO1xuXG4gICAgICAkdGFyZ2V0cy5lYWNoKChpbmRleCwgaXRlbSkgPT4ge1xuXG4gICAgICAgIGxldCB0YXJnZXRBdHRyaWJ1dGUgPSAkKGl0ZW0pLmRhdGEoJ2xhbmctdGFyZ2V0Jyk7XG4gICAgICAgIGxldCBsYW5nVGFyZ2V0ID0gJChpdGVtKS5kYXRhKCdsYW5nLWtleScpO1xuXG5cblxuXG4gICAgICAgIHN3aXRjaCh0YXJnZXRBdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjYXNlICd0ZXh0JzpcblxuICAgICAgICAgICAgJCgoYFtkYXRhLWxhbmcta2V5PVwiJHtsYW5nVGFyZ2V0fVwiXWApKS50ZXh0KHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGlmIChsYW5nVGFyZ2V0ID09IFwibW9yZS1zZWFyY2gtb3B0aW9uc1wiKSB7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3ZhbHVlJzpcbiAgICAgICAgICAgICQoaXRlbSkudmFsKHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAkKGl0ZW0pLmF0dHIodGFyZ2V0QXR0cmlidXRlLCB0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGxhbmd1YWdlLFxuICAgICAgdGFyZ2V0czogJHRhcmdldHMsXG4gICAgICBkaWN0aW9uYXJ5LFxuICAgICAgaW5pdGlhbGl6ZTogKGxhbmcpID0+IHtcblxuICAgICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgICAvLyB1cmw6ICdodHRwczovL2dzeDJqc29uLmNvbS9hcGk/aWQ9MU8zZUJ5akwxdmxZZjdaN2FtLV9odFJUUWk3M1BhZnFJZk5CZExtWGU4U00mc2hlZXQ9MScsXG4gICAgICAgICAgdXJsOiAnL2RhdGEvbGFuZy5qc29uJyxcbiAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICBkaWN0aW9uYXJ5ID0gZGF0YTtcbiAgICAgICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZSgpO1xuXG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxhbmd1YWdlLWxvYWRlZCcpO1xuXG4gICAgICAgICAgICAkKFwiI2xhbmd1YWdlLW9wdHNcIikubXVsdGlzZWxlY3QoJ3NlbGVjdCcsIGxhbmcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgcmVmcmVzaDogKCkgPT4ge1xuICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UobGFuZ3VhZ2UpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZUxhbmd1YWdlOiAobGFuZykgPT4ge1xuXG4gICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgdXBkYXRlUGFnZUxhbmd1YWdlKCk7XG4gICAgICB9LFxuICAgICAgZ2V0VHJhbnNsYXRpb246IChrZXkpID0+IHtcbiAgICAgICAgbGV0IHRhcmdldExhbmd1YWdlID0gZGljdGlvbmFyeS5yb3dzLmZpbHRlcigoaSkgPT4gaS5sYW5nID09PSBsYW5ndWFnZSlbMF07XG4gICAgICAgIHJldHVybiB0YXJnZXRMYW5ndWFnZVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxufSkoalF1ZXJ5KTtcbiIsIi8qIFRoaXMgbG9hZHMgYW5kIG1hbmFnZXMgdGhlIGxpc3QhICovXG5cbmNvbnN0IExpc3RNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIHJldHVybiAob3B0aW9ucykgPT4ge1xuICAgIGxldCB0YXJnZXRMaXN0ID0gb3B0aW9ucy50YXJnZXRMaXN0IHx8IFwiI2V2ZW50cy1saXN0XCI7XG4gICAgLy8gSnVuZSAxMyBgMTgg4oCTIHJlZmVycmVyIGFuZCBzb3VyY2VcbiAgICBsZXQge3JlZmVycmVyLCBzb3VyY2V9ID0gb3B0aW9ucztcblxuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0TGlzdCA9PT0gJ3N0cmluZycgPyAkKHRhcmdldExpc3QpIDogdGFyZ2V0TGlzdDtcblxuICAgIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0sIHJlZmVycmVyID0gbnVsbCwgc291cmNlID0gbnVsbCkgPT4ge1xuICAgICAgbGV0IG0gPSBtb21lbnQobmV3IERhdGUoaXRlbS5zdGFydF9kYXRldGltZSkpO1xuICAgICAgbSA9IG0udXRjKCkuc3VidHJhY3QobS51dGNPZmZzZXQoKSwgJ20nKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKG0udXRjT2Zmc2V0KCkpO1xuICAgICAgdmFyIGRhdGUgPSBtLmZvcm1hdChcImRkZGQgTU1NIERELCBoOm1tYVwiKTtcbiAgICAgIGxldCB1cmwgPSBpdGVtLnVybC5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLnVybCA6IFwiLy9cIiArIGl0ZW0udXJsO1xuICAgICAgLy8gbGV0IHN1cGVyR3JvdXAgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuICAgICAgdXJsID0gSGVscGVyLnJlZlNvdXJjZSh1cmwsIHJlZmVycmVyLCBzb3VyY2UpO1xuXG4gICAgICByZXR1cm4gYFxuICAgICAgPGxpIGNsYXNzPScke3dpbmRvdy5zbHVnaWZ5KGl0ZW0uZXZlbnRfdHlwZSl9IGV2ZW50cyBldmVudC1vYmonIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnQgdHlwZS1hY3Rpb25cIj5cbiAgICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgICA8bGkgY2xhc3M9J3RhZy0ke2l0ZW0uZXZlbnRfdHlwZX0gdGFnJz4ke2l0ZW0uZXZlbnRfdHlwZX08L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPGgyIGNsYXNzPVwiZXZlbnQtdGl0bGVcIj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZX08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtZGF0ZSBkYXRlXCI+JHtkYXRlfTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1hZGRyZXNzIGFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgICAgPHA+JHtpdGVtLnZlbnVlfTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPlJTVlA8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSwgcmVmZXJyZXIgPSBudWxsLCBzb3VyY2UgPSBudWxsKSA9PiB7XG4gICAgICBsZXQgdXJsID0gaXRlbS53ZWJzaXRlLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0ud2Vic2l0ZSA6IFwiLy9cIiArIGl0ZW0ud2Vic2l0ZTtcbiAgICAgIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcblxuICAgICAgdXJsID0gSGVscGVyLnJlZlNvdXJjZSh1cmwsIHJlZmVycmVyLCBzb3VyY2UpO1xuXG4gICAgICByZXR1cm4gYFxuICAgICAgPGxpIGNsYXNzPScke2l0ZW0uZXZlbnRfdHlwZX0gJHtzdXBlckdyb3VwfSBncm91cC1vYmonIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXAgZ3JvdXAtb2JqXCI+XG4gICAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgICAgPGxpIGNsYXNzPVwidGFnIHRhZy0ke2l0ZW0uc3VwZXJncm91cH1cIj4ke2l0ZW0uc3VwZXJncm91cH08L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPGgyPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLm5hbWV9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWxvY2F0aW9uIGxvY2F0aW9uXCI+JHtpdGVtLmxvY2F0aW9ufTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPkdldCBJbnZvbHZlZDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICAgYFxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgJGxpc3Q6ICR0YXJnZXQsXG4gICAgICB1cGRhdGVGaWx0ZXI6IChwKSA9PiB7XG4gICAgICAgIGlmKCFwKSByZXR1cm47XG5cbiAgICAgICAgLy8gUmVtb3ZlIEZpbHRlcnNcblxuICAgICAgICAkdGFyZ2V0LnJlbW92ZVByb3AoXCJjbGFzc1wiKTtcbiAgICAgICAgJHRhcmdldC5hZGRDbGFzcyhwLmZpbHRlciA/IHAuZmlsdGVyLmpvaW4oXCIgXCIpIDogJycpXG5cbiAgICAgICAgJHRhcmdldC5maW5kKCdsaScpLmhpZGUoKTtcblxuICAgICAgICBpZiAocC5maWx0ZXIpIHtcbiAgICAgICAgICBwLmZpbHRlci5mb3JFYWNoKChmaWwpPT57XG4gICAgICAgICAgICAkdGFyZ2V0LmZpbmQoYGxpLiR7ZmlsfWApLnNob3coKTtcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdXBkYXRlQm91bmRzOiAoYm91bmQxLCBib3VuZDIpID0+IHtcblxuICAgICAgICAvLyBjb25zdCBib3VuZHMgPSBbcC5ib3VuZHMxLCBwLmJvdW5kczJdO1xuXG5cbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCBsaS5ldmVudC1vYmosIHVsIGxpLmdyb3VwLW9iaicpLmVhY2goKGluZCwgaXRlbSk9PiB7XG5cbiAgICAgICAgICBsZXQgX2xhdCA9ICQoaXRlbSkuZGF0YSgnbGF0JyksXG4gICAgICAgICAgICAgIF9sbmcgPSAkKGl0ZW0pLmRhdGEoJ2xuZycpO1xuXG4gICAgICAgICAgY29uc3QgbWk1ID0gMC4wNzI1O1xuXG4gICAgICAgICAgaWYgKGJvdW5kMVswXSAtIG1pNSA8PSBfbGF0ICYmIGJvdW5kMlswXSArIG1pNSA+PSBfbGF0ICYmIGJvdW5kMVsxXSAtIG1pNSA8PSBfbG5nICYmIGJvdW5kMlsxXSArIG1pNSAgPj0gX2xuZykge1xuXG4gICAgICAgICAgICAkKGl0ZW0pLmFkZENsYXNzKCd3aXRoaW4tYm91bmQnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJChpdGVtKS5yZW1vdmVDbGFzcygnd2l0aGluLWJvdW5kJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgX3Zpc2libGUgPSAkdGFyZ2V0LmZpbmQoJ3VsIGxpLmV2ZW50LW9iai53aXRoaW4tYm91bmQsIHVsIGxpLmdyb3VwLW9iai53aXRoaW4tYm91bmQnKS5sZW5ndGg7XG4gICAgICAgIGlmIChfdmlzaWJsZSA9PSAwKSB7XG4gICAgICAgICAgLy8gVGhlIGxpc3QgaXMgZW1wdHlcbiAgICAgICAgICAkdGFyZ2V0LmFkZENsYXNzKFwiaXMtZW1wdHlcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHRhcmdldC5yZW1vdmVDbGFzcyhcImlzLWVtcHR5XCIpO1xuICAgICAgICB9XG5cbiAgICAgIH0sXG4gICAgICBwb3B1bGF0ZUxpc3Q6IChoYXJkRmlsdGVycykgPT4ge1xuICAgICAgICAvL3VzaW5nIHdpbmRvdy5FVkVOVF9EQVRBXG4gICAgICAgIGNvbnN0IGtleVNldCA9ICFoYXJkRmlsdGVycy5rZXkgPyBbXSA6IGhhcmRGaWx0ZXJzLmtleS5zcGxpdCgnLCcpO1xuXG4gICAgICAgIHZhciAkZXZlbnRMaXN0ID0gd2luZG93LkVWRU5UU19EQVRBLmRhdGEubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgIGlmIChrZXlTZXQubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLmV2ZW50X3R5cGUgJiYgaXRlbS5ldmVudF90eXBlLnRvTG93ZXJDYXNlKCkgPT0gJ2dyb3VwJyA/IHJlbmRlckdyb3VwKGl0ZW0pIDogcmVuZGVyRXZlbnQoaXRlbSwgcmVmZXJyZXIsIHNvdXJjZSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXlTZXQubGVuZ3RoID4gMCAmJiBpdGVtLmV2ZW50X3R5cGUgIT0gJ2dyb3VwJyAmJiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5ldmVudF90eXBlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlbmRlckV2ZW50KGl0ZW0sIHJlZmVycmVyLCBzb3VyY2UpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2V5U2V0Lmxlbmd0aCA+IDAgJiYgaXRlbS5ldmVudF90eXBlID09ICdncm91cCcgJiYga2V5U2V0LmluY2x1ZGVzKGl0ZW0uc3VwZXJncm91cCkpIHtcbiAgICAgICAgICAgIHJldHVybiByZW5kZXJHcm91cChpdGVtLCByZWZlcnJlciwgc291cmNlKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIH0pXG4gICAgICAgICR0YXJnZXQuZmluZCgndWwgbGknKS5yZW1vdmUoKTtcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCcpLmFwcGVuZCgkZXZlbnRMaXN0KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiXG5cbmNvbnN0IE1hcE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgbGV0IExBTkdVQUdFID0gJ2VuJztcblxuICBjb25zdCByZW5kZXJFdmVudCA9IChpdGVtLCByZWZlcnJlciA9IG51bGwsIHNvdXJjZSA9IG51bGwpID0+IHtcblxuICAgIGxldCBtID0gbW9tZW50KG5ldyBEYXRlKGl0ZW0uc3RhcnRfZGF0ZXRpbWUpKTtcbiAgICBtID0gbS51dGMoKS5zdWJ0cmFjdChtLnV0Y09mZnNldCgpLCAnbScpO1xuXG4gICAgdmFyIGRhdGUgPSBtLmZvcm1hdChcImRkZGQgTU1NIERELCBoOm1tYVwiKTtcbiAgICBsZXQgdXJsID0gaXRlbS51cmwubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS51cmwgOiBcIi8vXCIgKyBpdGVtLnVybDtcblxuICAgIHVybCA9IEhlbHBlci5yZWZTb3VyY2UodXJsLCByZWZlcnJlciwgc291cmNlKTtcblxuICAgIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9J3BvcHVwLWl0ZW0gJHtpdGVtLmV2ZW50X3R5cGV9ICR7c3VwZXJHcm91cH0nIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5ldmVudF90eXBlfVwiPiR7aXRlbS5ldmVudF90eXBlIHx8ICdBY3Rpb24nfTwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxoMiBjbGFzcz1cImV2ZW50LXRpdGxlXCI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1kYXRlXCI+JHtkYXRlfTwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtYWRkcmVzcyBhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+UlNWUDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSwgcmVmZXJyZXIgPSBudWxsLCBzb3VyY2UgPSBudWxsKSA9PiB7XG5cbiAgICBsZXQgdXJsID0gaXRlbS53ZWJzaXRlLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0ud2Vic2l0ZSA6IFwiLy9cIiArIGl0ZW0ud2Vic2l0ZTtcblxuICAgIHVybCA9IEhlbHBlci5yZWZTb3VyY2UodXJsLCByZWZlcnJlciwgc291cmNlKTtcblxuICAgIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICByZXR1cm4gYFxuICAgIDxsaT5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwIGdyb3VwLW9iaiAke3N1cGVyR3JvdXB9XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5zdXBlcmdyb3VwfSAke3N1cGVyR3JvdXB9XCI+JHtpdGVtLnN1cGVyZ3JvdXB9PC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWhlYWRlclwiPlxuICAgICAgICAgIDxoMj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS5uYW1lfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1sb2NhdGlvbiBsb2NhdGlvblwiPiR7aXRlbS5sb2NhdGlvbn08L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGVzY3JpcHRpb25cIj5cbiAgICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9saT5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR2VvanNvbiA9IChsaXN0LCByZWYgPSBudWxsLCBzcmMgPSBudWxsKSA9PiB7XG4gICAgcmV0dXJuIGxpc3QubWFwKChpdGVtKSA9PiB7XG4gICAgICAvLyByZW5kZXJlZCBldmVudFR5cGVcbiAgICAgIGxldCByZW5kZXJlZDtcblxuICAgICAgaWYgKGl0ZW0uZXZlbnRfdHlwZSAmJiBpdGVtLmV2ZW50X3R5cGUudG9Mb3dlckNhc2UoKSA9PSAnZ3JvdXAnKSB7XG4gICAgICAgIHJlbmRlcmVkID0gcmVuZGVyR3JvdXAoaXRlbSwgcmVmLCBzcmMpO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZW5kZXJlZCA9IHJlbmRlckV2ZW50KGl0ZW0sIHJlZiwgc3JjKTtcbiAgICAgIH1cblxuICAgICAgLy8gZm9ybWF0IGNoZWNrXG4gICAgICBpZiAoaXNOYU4ocGFyc2VGbG9hdChwYXJzZUZsb2F0KGl0ZW0ubG5nKSkpKSB7XG4gICAgICAgIGl0ZW0ubG5nID0gaXRlbS5sbmcuc3Vic3RyaW5nKDEpXG4gICAgICB9XG4gICAgICBpZiAoaXNOYU4ocGFyc2VGbG9hdChwYXJzZUZsb2F0KGl0ZW0ubGF0KSkpKSB7XG4gICAgICAgIGl0ZW0ubGF0ID0gaXRlbS5sYXQuc3Vic3RyaW5nKDEpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICB0eXBlOiBcIlBvaW50XCIsXG4gICAgICAgICAgY29vcmRpbmF0ZXM6IFtpdGVtLmxuZywgaXRlbS5sYXRdXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBldmVudFByb3BlcnRpZXM6IGl0ZW0sXG4gICAgICAgICAgcG9wdXBDb250ZW50OiByZW5kZXJlZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAob3B0aW9ucykgPT4ge1xuICAgIHZhciBhY2Nlc3NUb2tlbiA9ICdway5leUoxSWpvaWJXRjBkR2hsZHpNMU1DSXNJbUVpT2lKYVRWRk1Va1V3SW4wLndjTTNYYzhCR0M2UE0tT3lyd2puaGcnO1xuICAgIHZhciBtYXAgPSBMLm1hcCgnbWFwJywgeyBkcmFnZ2luZzogIUwuQnJvd3Nlci5tb2JpbGUgfSkuc2V0VmlldyhbMzQuODg1OTMwOTQwNzUzMTcsIDUuMDk3NjU2MjUwMDAwMDAxXSwgMik7XG5cbiAgICBsZXQge3JlZmVycmVyLCBzb3VyY2V9ID0gb3B0aW9ucztcblxuICAgIGlmICghTC5Ccm93c2VyLm1vYmlsZSkge1xuICAgICAgbWFwLnNjcm9sbFdoZWVsWm9vbS5kaXNhYmxlKCk7XG4gICAgfVxuXG4gICAgTEFOR1VBR0UgPSBvcHRpb25zLmxhbmcgfHwgJ2VuJztcblxuICAgIGlmIChvcHRpb25zLm9uTW92ZSkge1xuICAgICAgbWFwLm9uKCdkcmFnZW5kJywgKGV2ZW50KSA9PiB7XG5cblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuICAgICAgICBvcHRpb25zLm9uTW92ZShzdywgbmUpO1xuICAgICAgfSkub24oJ3pvb21lbmQnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKG1hcC5nZXRab29tKCkgPD0gNCkge1xuICAgICAgICAgICQoXCIjbWFwXCIpLmFkZENsYXNzKFwiem9vbWVkLW91dFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkKFwiI21hcFwiKS5yZW1vdmVDbGFzcyhcInpvb21lZC1vdXRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuICAgICAgICBvcHRpb25zLm9uTW92ZShzdywgbmUpO1xuICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBtYXAuZmlyZUV2ZW50KCd6b29tZW5kJyk7XG5cbiAgICBMLnRpbGVMYXllcignaHR0cHM6Ly9hcGkubWFwYm94LmNvbS9zdHlsZXMvdjEvbWF0dGhldzM1MC9jamE0MXRpamsyN2Q2MnJxb2Q3ZzBseDRiL3RpbGVzLzI1Ni97en0ve3h9L3t5fT9hY2Nlc3NfdG9rZW49JyArIGFjY2Vzc1Rva2VuLCB7XG4gICAgICAgIGF0dHJpYnV0aW9uOiAnJmNvcHk7IDxhIGhyZWY9XCJodHRwOi8vb3NtLm9yZy9jb3B5cmlnaHRcIj5PcGVuU3RyZWV0TWFwPC9hPiBjb250cmlidXRvcnMg4oCiIDxhIGhyZWY9XCIvLzM1MC5vcmdcIj4zNTAub3JnPC9hPidcbiAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgbGV0IGdlb2NvZGVyID0gbnVsbDtcbiAgICByZXR1cm4ge1xuICAgICAgJG1hcDogbWFwLFxuICAgICAgaW5pdGlhbGl6ZTogKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG4gICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBzZXRCb3VuZHM6IChib3VuZHMxLCBib3VuZHMyKSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW2JvdW5kczEsIGJvdW5kczJdO1xuICAgICAgICBtYXAuZml0Qm91bmRzKGJvdW5kcyk7XG4gICAgICB9LFxuICAgICAgc2V0Q2VudGVyOiAoY2VudGVyLCB6b29tID0gMTApID0+IHtcbiAgICAgICAgaWYgKCFjZW50ZXIgfHwgIWNlbnRlclswXSB8fCBjZW50ZXJbMF0gPT0gXCJcIlxuICAgICAgICAgICAgICB8fCAhY2VudGVyWzFdIHx8IGNlbnRlclsxXSA9PSBcIlwiKSByZXR1cm47XG4gICAgICAgIG1hcC5zZXRWaWV3KGNlbnRlciwgem9vbSk7XG4gICAgICB9LFxuICAgICAgZ2V0Qm91bmRzOiAoKSA9PiB7XG5cbiAgICAgICAgbGV0IHN3ID0gW21hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW21hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubG5nXTtcblxuICAgICAgICByZXR1cm4gW3N3LCBuZV07XG4gICAgICB9LFxuICAgICAgLy8gQ2VudGVyIGxvY2F0aW9uIGJ5IGdlb2NvZGVkXG4gICAgICBnZXRDZW50ZXJCeUxvY2F0aW9uOiAobG9jYXRpb24sIGNhbGxiYWNrKSA9PiB7XG5cbiAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IGxvY2F0aW9uIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcblxuICAgICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlc3VsdHNbMF0pXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyWm9vbUVuZDogKCkgPT4ge1xuICAgICAgICBtYXAuZmlyZUV2ZW50KCd6b29tZW5kJyk7XG4gICAgICB9LFxuICAgICAgem9vbU91dE9uY2U6ICgpID0+IHtcbiAgICAgICAgbWFwLnpvb21PdXQoMSk7XG4gICAgICB9LFxuICAgICAgem9vbVVudGlsSGl0OiAoKSA9PiB7XG4gICAgICAgIHZhciAkdGhpcyA9IHRoaXM7XG4gICAgICAgIG1hcC56b29tT3V0KDEpO1xuICAgICAgICBsZXQgaW50ZXJ2YWxIYW5kbGVyID0gbnVsbDtcbiAgICAgICAgaW50ZXJ2YWxIYW5kbGVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgIHZhciBfdmlzaWJsZSA9ICQoZG9jdW1lbnQpLmZpbmQoJ3VsIGxpLmV2ZW50LW9iai53aXRoaW4tYm91bmQsIHVsIGxpLmdyb3VwLW9iai53aXRoaW4tYm91bmQnKS5sZW5ndGg7XG4gICAgICAgICAgaWYgKF92aXNpYmxlID09IDApIHtcbiAgICAgICAgICAgIG1hcC56b29tT3V0KDEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSGFuZGxlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAyMDApO1xuICAgICAgfSxcbiAgICAgIHJlZnJlc2hNYXA6ICgpID0+IHtcbiAgICAgICAgbWFwLmludmFsaWRhdGVTaXplKGZhbHNlKTtcbiAgICAgICAgLy8gbWFwLl9vblJlc2l6ZSgpO1xuICAgICAgICAvLyBtYXAuZmlyZUV2ZW50KCd6b29tZW5kJyk7XG5cblxuICAgICAgfSxcbiAgICAgIGZpbHRlck1hcDogKGZpbHRlcnMpID0+IHtcblxuICAgICAgICAkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXBcIikuaGlkZSgpO1xuXG5cbiAgICAgICAgaWYgKCFmaWx0ZXJzKSByZXR1cm47XG5cbiAgICAgICAgZmlsdGVycy5mb3JFYWNoKChpdGVtKSA9PiB7XG5cbiAgICAgICAgICAkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXAuXCIgKyBpdGVtLnRvTG93ZXJDYXNlKCkpLnNob3coKTtcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICBwbG90UG9pbnRzOiAobGlzdCwgaGFyZEZpbHRlcnMsIGdyb3VwcykgPT4ge1xuICAgICAgICBjb25zdCBrZXlTZXQgPSAhaGFyZEZpbHRlcnMua2V5ID8gW10gOiBoYXJkRmlsdGVycy5rZXkuc3BsaXQoJywnKTtcblxuICAgICAgICBpZiAoa2V5U2V0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsaXN0ID0gbGlzdC5maWx0ZXIoKGl0ZW0pID0+IGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKVxuICAgICAgICB9XG5cblxuICAgICAgICBjb25zdCBnZW9qc29uID0ge1xuICAgICAgICAgIHR5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgICAgICAgICBmZWF0dXJlczogcmVuZGVyR2VvanNvbihsaXN0LCByZWZlcnJlciwgc291cmNlKVxuICAgICAgICB9O1xuXG5cbiAgICAgICAgTC5nZW9KU09OKGdlb2pzb24sIHtcbiAgICAgICAgICAgIHBvaW50VG9MYXllcjogKGZlYXR1cmUsIGxhdGxuZykgPT4ge1xuICAgICAgICAgICAgICAvLyBJY29ucyBmb3IgbWFya2Vyc1xuICAgICAgICAgICAgICBjb25zdCBldmVudFR5cGUgPSBmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLmV2ZW50X3R5cGU7XG5cbiAgICAgICAgICAgICAgLy8gSWYgbm8gc3VwZXJncm91cCwgaXQncyBhbiBldmVudC5cbiAgICAgICAgICAgICAgY29uc3Qgc3VwZXJncm91cCA9IGdyb3Vwc1tmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLnN1cGVyZ3JvdXBdID8gZmVhdHVyZS5wcm9wZXJ0aWVzLmV2ZW50UHJvcGVydGllcy5zdXBlcmdyb3VwIDogXCJFdmVudHNcIjtcbiAgICAgICAgICAgICAgY29uc3Qgc2x1Z2dlZCA9IHdpbmRvdy5zbHVnaWZ5KHN1cGVyZ3JvdXApO1xuICAgICAgICAgICAgICBjb25zdCBpY29uVXJsID0gZ3JvdXBzW3N1cGVyZ3JvdXBdID8gZ3JvdXBzW3N1cGVyZ3JvdXBdLmljb251cmwgfHwgXCIvaW1nL2V2ZW50LnBuZ1wiICA6IFwiL2ltZy9ldmVudC5wbmdcIiA7XG5cbiAgICAgICAgICAgICAgY29uc3Qgc21hbGxJY29uID0gIEwuaWNvbih7XG4gICAgICAgICAgICAgICAgaWNvblVybDogaWNvblVybCxcbiAgICAgICAgICAgICAgICBpY29uU2l6ZTogWzE4LCAxOF0sXG4gICAgICAgICAgICAgICAgaWNvbkFuY2hvcjogWzksIDldLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogc2x1Z2dlZCArICcgZXZlbnQtaXRlbS1wb3B1cCdcbiAgICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgICB2YXIgZ2VvanNvbk1hcmtlck9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgaWNvbjogc21hbGxJY29uLFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICByZXR1cm4gTC5tYXJrZXIobGF0bG5nLCBnZW9qc29uTWFya2VyT3B0aW9ucyk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgb25FYWNoRmVhdHVyZTogKGZlYXR1cmUsIGxheWVyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZmVhdHVyZS5wcm9wZXJ0aWVzICYmIGZlYXR1cmUucHJvcGVydGllcy5wb3B1cENvbnRlbnQpIHtcbiAgICAgICAgICAgICAgbGF5ZXIuYmluZFBvcHVwKGZlYXR1cmUucHJvcGVydGllcy5wb3B1cENvbnRlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSkuYWRkVG8obWFwKTtcblxuICAgICAgfSxcbiAgICAgIHVwZGF0ZTogKHApID0+IHtcbiAgICAgICAgaWYgKCFwIHx8ICFwLmxhdCB8fCAhcC5sbmcgKSByZXR1cm47XG5cbiAgICAgICAgbWFwLnNldFZpZXcoTC5sYXRMbmcocC5sYXQsIHAubG5nKSwgMTApO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJjb25zdCBRdWVyeU1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRGb3JtID0gXCJmb3JtI2ZpbHRlcnMtZm9ybVwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRGb3JtID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0Rm9ybSkgOiB0YXJnZXRGb3JtO1xuICAgIGxldCBsYXQgPSBudWxsO1xuICAgIGxldCBsbmcgPSBudWxsO1xuXG4gICAgbGV0IHByZXZpb3VzID0ge307XG5cbiAgICAkdGFyZ2V0Lm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgbGF0ID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbCgpO1xuICAgICAgbG5nID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbCgpO1xuXG4gICAgICB2YXIgZm9ybSA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcblxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAkLnBhcmFtKGZvcm0pO1xuICAgIH0pXG5cbiAgICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJ3NlbGVjdCNmaWx0ZXItaXRlbXMnLCAoKSA9PiB7XG4gICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgIH0pXG5cblxuICAgIHJldHVybiB7XG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgcGFyYW1zID0gJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSlcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhbmddXCIpLnZhbChwYXJhbXMubGFuZyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChwYXJhbXMubGF0KTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKHBhcmFtcy5sbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwocGFyYW1zLmJvdW5kMSk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChwYXJhbXMuYm91bmQyKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxvY11cIikudmFsKHBhcmFtcy5sb2MpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9a2V5XVwiKS52YWwocGFyYW1zLmtleSk7XG5cbiAgICAgICAgICBpZiAocGFyYW1zLmZpbHRlcikge1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiI2ZpbHRlci1pdGVtcyBvcHRpb25cIikucmVtb3ZlUHJvcChcInNlbGVjdGVkXCIpO1xuICAgICAgICAgICAgcGFyYW1zLmZpbHRlci5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIjZmlsdGVyLWl0ZW1zIG9wdGlvblt2YWx1ZT0nXCIgKyBpdGVtICsgXCInXVwiKS5wcm9wKFwic2VsZWN0ZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGdldFBhcmFtZXRlcnM6ICgpID0+IHtcbiAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG4gICAgICAgIC8vIHBhcmFtZXRlcnNbJ2xvY2F0aW9uJ10gO1xuXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHBhcmFtZXRlcnMpIHtcbiAgICAgICAgICBpZiAoICFwYXJhbWV0ZXJzW2tleV0gfHwgcGFyYW1ldGVyc1trZXldID09IFwiXCIpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBwYXJhbWV0ZXJzW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtZXRlcnM7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTG9jYXRpb246IChsYXQsIGxuZykgPT4ge1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKGxhdCk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwobG5nKTtcbiAgICAgICAgLy8gJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVWaWV3cG9ydDogKHZpZXdwb3J0KSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW1t2aWV3cG9ydC5mLmIsIHZpZXdwb3J0LmIuYl0sIFt2aWV3cG9ydC5mLmYsIHZpZXdwb3J0LmIuZl1dO1xuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlVmlld3BvcnRCeUJvdW5kOiAoc3csIG5lKSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW3N3LCBuZV07Ly8vLy8vLy9cblxuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdHJpZ2dlclN1Ym1pdDogKCkgPT4ge1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSkoalF1ZXJ5KTtcbiIsImxldCBhdXRvY29tcGxldGVNYW5hZ2VyO1xubGV0IG1hcE1hbmFnZXI7XG5cbndpbmRvdy5ERUZBVUxUX0lDT04gPSBcIi9pbWcvZXZlbnQucG5nXCI7XG53aW5kb3cuc2x1Z2lmeSA9ICh0ZXh0KSA9PiAhdGV4dCA/IHRleHQgOiB0ZXh0LnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHMrL2csICctJykgICAgICAgICAgIC8vIFJlcGxhY2Ugc3BhY2VzIHdpdGggLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9bXlxcd1xcLV0rL2csICcnKSAgICAgICAvLyBSZW1vdmUgYWxsIG5vbi13b3JkIGNoYXJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcLVxcLSsvZywgJy0nKSAgICAgICAgIC8vIFJlcGxhY2UgbXVsdGlwbGUgLSB3aXRoIHNpbmdsZSAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL14tKy8sICcnKSAgICAgICAgICAgICAvLyBUcmltIC0gZnJvbSBzdGFydCBvZiB0ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLy0rJC8sICcnKTsgICAgICAgICAgICAvLyBUcmltIC0gZnJvbSBlbmQgb2YgdGV4dFxuXG5jb25zdCBnZXRRdWVyeVN0cmluZyA9ICgpID0+IHtcbiAgICB2YXIgcXVlcnlTdHJpbmdLZXlWYWx1ZSA9IHdpbmRvdy5wYXJlbnQubG9jYXRpb24uc2VhcmNoLnJlcGxhY2UoJz8nLCAnJykuc3BsaXQoJyYnKTtcbiAgICB2YXIgcXNKc29uT2JqZWN0ID0ge307XG4gICAgaWYgKHF1ZXJ5U3RyaW5nS2V5VmFsdWUgIT0gJycpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBxdWVyeVN0cmluZ0tleVZhbHVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBxc0pzb25PYmplY3RbcXVlcnlTdHJpbmdLZXlWYWx1ZVtpXS5zcGxpdCgnPScpWzBdXSA9IHF1ZXJ5U3RyaW5nS2V5VmFsdWVbaV0uc3BsaXQoJz0nKVsxXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcXNKc29uT2JqZWN0O1xufTtcblxuKGZ1bmN0aW9uKCQpIHtcbiAgLy8gTG9hZCB0aGluZ3NcblxuICB3aW5kb3cucXVlcmllcyA9ICAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHJpbmcoMSkpO1xuXG4gIHRyeSB7XG4gICAgaWYgKCghd2luZG93LnF1ZXJpZXMuZ3JvdXAgfHwgKCF3aW5kb3cucXVlcmllcy5yZWZlcnJlciAmJiAhd2luZG93LnF1ZXJpZXMuc291cmNlKSkgJiYgd2luZG93LnBhcmVudCkge1xuICAgICAgd2luZG93LnF1ZXJpZXMgPSB7XG4gICAgICAgIGdyb3VwOiBnZXRRdWVyeVN0cmluZygpLmdyb3VwLFxuICAgICAgICByZWZlcnJlcjogZ2V0UXVlcnlTdHJpbmcoKS5yZWZlcnJlcixcbiAgICAgICAgc291cmNlOiBnZXRRdWVyeVN0cmluZygpLnNvdXJjZSxcbiAgICAgIH07XG4gICAgfVxuICB9IGNhdGNoKGUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiwgZSk7XG4gIH1cblxuXG4gIGlmICh3aW5kb3cucXVlcmllcy5ncm91cCkge1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5wYXJlbnQoKS5jc3MoXCJvcGFjaXR5XCIsIFwiMFwiKTtcbiAgfVxuICBjb25zdCBidWlsZEZpbHRlcnMgPSAoKSA9PiB7JCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KHtcbiAgICAgIGVuYWJsZUhUTUw6IHRydWUsXG4gICAgICB0ZW1wbGF0ZXM6IHtcbiAgICAgICAgYnV0dG9uOiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJtdWx0aXNlbGVjdCBkcm9wZG93bi10b2dnbGVcIiBkYXRhLXRvZ2dsZT1cImRyb3Bkb3duXCI+PHNwYW4gZGF0YS1sYW5nLXRhcmdldD1cInRleHRcIiBkYXRhLWxhbmcta2V5PVwibW9yZS1zZWFyY2gtb3B0aW9uc1wiPjwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJmYSBmYS1jYXJldC1kb3duXCI+PC9zcGFuPjwvYnV0dG9uPicsXG4gICAgICAgIGxpOiAnPGxpPjxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCI+PGxhYmVsPjwvbGFiZWw+PC9hPjwvbGk+J1xuICAgICAgfSxcbiAgICAgIGRyb3BSaWdodDogdHJ1ZSxcbiAgICAgIG9uSW5pdGlhbGl6ZWQ6ICgpID0+IHtcblxuICAgICAgfSxcbiAgICAgIG9uRHJvcGRvd25TaG93OiAoKSA9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJtb2JpbGUtdXBkYXRlLW1hcC1oZWlnaHRcIik7XG4gICAgICAgIH0sIDEwKTtcblxuICAgICAgfSxcbiAgICAgIG9uRHJvcGRvd25IaWRlOiAoKSA9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJtb2JpbGUtdXBkYXRlLW1hcC1oZWlnaHRcIik7XG4gICAgICAgIH0sIDEwKTtcbiAgICAgIH0sXG4gICAgICBvcHRpb25MYWJlbDogKGUpID0+IHtcbiAgICAgICAgLy8gbGV0IGVsID0gJCggJzxkaXY+PC9kaXY+JyApO1xuICAgICAgICAvLyBlbC5hcHBlbmQoKCkgKyBcIlwiKTtcblxuICAgICAgICByZXR1cm4gdW5lc2NhcGUoJChlKS5hdHRyKCdsYWJlbCcpKSB8fCAkKGUpLmh0bWwoKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH07XG4gIGJ1aWxkRmlsdGVycygpO1xuXG5cbiAgJCgnc2VsZWN0I2xhbmd1YWdlLW9wdHMnKS5tdWx0aXNlbGVjdCh7XG4gICAgZW5hYmxlSFRNTDogdHJ1ZSxcbiAgICBvcHRpb25DbGFzczogKCkgPT4gJ2xhbmctb3B0JyxcbiAgICBzZWxlY3RlZENsYXNzOiAoKSA9PiAnbGFuZy1zZWwnLFxuICAgIGJ1dHRvbkNsYXNzOiAoKSA9PiAnbGFuZy1idXQnLFxuICAgIGRyb3BSaWdodDogdHJ1ZSxcbiAgICBvcHRpb25MYWJlbDogKGUpID0+IHtcbiAgICAgIC8vIGxldCBlbCA9ICQoICc8ZGl2PjwvZGl2PicgKTtcbiAgICAgIC8vIGVsLmFwcGVuZCgoKSArIFwiXCIpO1xuXG4gICAgICByZXR1cm4gdW5lc2NhcGUoJChlKS5hdHRyKCdsYWJlbCcpKSB8fCAkKGUpLmh0bWwoKTtcbiAgICB9LFxuICAgIG9uQ2hhbmdlOiAob3B0aW9uLCBjaGVja2VkLCBzZWxlY3QpID0+IHtcblxuICAgICAgY29uc3QgcGFyYW1ldGVycyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gICAgICBwYXJhbWV0ZXJzWydsYW5nJ10gPSBvcHRpb24udmFsKCk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1yZXNldC1tYXAnLCBwYXJhbWV0ZXJzKTtcblxuICAgIH1cbiAgfSlcblxuICAvLyAxLiBnb29nbGUgbWFwcyBnZW9jb2RlXG5cbiAgLy8gMi4gZm9jdXMgbWFwIG9uIGdlb2NvZGUgKHZpYSBsYXQvbG5nKVxuICBjb25zdCBxdWVyeU1hbmFnZXIgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICAgICAgcXVlcnlNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICBjb25zdCBpbml0UGFyYW1zID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuXG5cbiAgY29uc3QgbGFuZ3VhZ2VNYW5hZ2VyID0gTGFuZ3VhZ2VNYW5hZ2VyKCk7XG5cbiAgY29uc3QgbGlzdE1hbmFnZXIgPSBMaXN0TWFuYWdlcih7XG4gICAgcmVmZXJyZXI6IHdpbmRvdy5xdWVyaWVzLnJlZmVycmVyLFxuICAgIHNvdXJjZTogd2luZG93LnF1ZXJpZXMuc291cmNlXG4gIH0pO1xuXG5cbiAgbWFwTWFuYWdlciA9IE1hcE1hbmFnZXIoe1xuICAgIG9uTW92ZTogKHN3LCBuZSkgPT4ge1xuICAgICAgLy8gV2hlbiB0aGUgbWFwIG1vdmVzIGFyb3VuZCwgd2UgdXBkYXRlIHRoZSBsaXN0XG4gICAgICBxdWVyeU1hbmFnZXIudXBkYXRlVmlld3BvcnRCeUJvdW5kKHN3LCBuZSk7XG4gICAgICAvL3VwZGF0ZSBRdWVyeVxuICAgIH0sXG4gICAgcmVmZXJyZXI6IHdpbmRvdy5xdWVyaWVzLnJlZmVycmVyLFxuICAgIHNvdXJjZTogd2luZG93LnF1ZXJpZXMuc291cmNlXG4gIH0pO1xuXG4gIHdpbmRvdy5pbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2sgPSAoKSA9PiB7XG5cbiAgICBhdXRvY29tcGxldGVNYW5hZ2VyID0gQXV0b2NvbXBsZXRlTWFuYWdlcihcImlucHV0W25hbWU9J2xvYyddXCIpO1xuICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuXG4gICAgaWYgKGluaXRQYXJhbXMubG9jICYmIGluaXRQYXJhbXMubG9jICE9PSAnJyAmJiAoIWluaXRQYXJhbXMuYm91bmQxICYmICFpbml0UGFyYW1zLmJvdW5kMikpIHtcbiAgICAgIG1hcE1hbmFnZXIuaW5pdGlhbGl6ZSgoKSA9PiB7XG4gICAgICAgIG1hcE1hbmFnZXIuZ2V0Q2VudGVyQnlMb2NhdGlvbihpbml0UGFyYW1zLmxvYywgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIHF1ZXJ5TWFuYWdlci51cGRhdGVWaWV3cG9ydChyZXN1bHQuZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgaWYoaW5pdFBhcmFtcy5sYXQgJiYgaW5pdFBhcmFtcy5sbmcpIHtcbiAgICBtYXBNYW5hZ2VyLnNldENlbnRlcihbaW5pdFBhcmFtcy5sYXQsIGluaXRQYXJhbXMubG5nXSk7XG4gIH1cblxuICAvKioqXG4gICogTGlzdCBFdmVudHNcbiAgKiBUaGlzIHdpbGwgdHJpZ2dlciB0aGUgbGlzdCB1cGRhdGUgbWV0aG9kXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCdtb2JpbGUtdXBkYXRlLW1hcC1oZWlnaHQnLCAoZXZlbnQpID0+IHtcbiAgICAvL1RoaXMgY2hlY2tzIGlmIHdpZHRoIGlzIGZvciBtb2JpbGVcbiAgICBpZiAoJCh3aW5kb3cpLndpZHRoKCkgPCA2MDApIHtcbiAgICAgIHNldFRpbWVvdXQoKCk9PiB7XG4gICAgICAgICQoXCIjbWFwXCIpLmhlaWdodCgkKFwiI2V2ZW50cy1saXN0XCIpLmhlaWdodCgpKTtcbiAgICAgICAgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCk7XG4gICAgICB9LCAxMCk7XG4gICAgfVxuICB9KVxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnBvcHVsYXRlTGlzdChvcHRpb25zLnBhcmFtcyk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuXG4gICAgbGlzdE1hbmFnZXIudXBkYXRlRmlsdGVyKG9wdGlvbnMpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlci1ieS1ib3VuZCcsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxldCBib3VuZDEsIGJvdW5kMjtcblxuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICBbYm91bmQxLCBib3VuZDJdID0gbWFwTWFuYWdlci5nZXRCb3VuZHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgICBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcbiAgICB9XG5cbiAgICBsaXN0TWFuYWdlci51cGRhdGVCb3VuZHMoYm91bmQxLCBib3VuZDIpXG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLXJlc2V0LW1hcCcsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIHZhciBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHRpb25zKSk7XG4gICAgZGVsZXRlIGNvcHlbJ2xuZyddO1xuICAgIGRlbGV0ZSBjb3B5WydsYXQnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQxJ107XG4gICAgZGVsZXRlIGNvcHlbJ2JvdW5kMiddO1xuXG4gICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAkLnBhcmFtKGNvcHkpO1xuXG5cbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwidHJpZ2dlci1sYW5ndWFnZS11cGRhdGVcIiwgY29weSk7XG4gICAgJChcInNlbGVjdCNmaWx0ZXItaXRlbXNcIikubXVsdGlzZWxlY3QoJ2Rlc3Ryb3knKTtcbiAgICBidWlsZEZpbHRlcnMoKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxvYWQtZ3JvdXBzJywgeyBncm91cHM6IHdpbmRvdy5FVkVOVFNfREFUQS5ncm91cHMgfSk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG5cbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJ0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZVwiLCBjb3B5KTtcbiAgICB9LCAxMDAwKTtcbiAgfSk7XG5cblxuICAvKioqXG4gICogTWFwIEV2ZW50c1xuICAqL1xuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgLy8gbWFwTWFuYWdlci5zZXRDZW50ZXIoW29wdGlvbnMubGF0LCBvcHRpb25zLmxuZ10pO1xuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGJvdW5kMSA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDEpO1xuICAgIHZhciBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcblxuICAgIG1hcE1hbmFnZXIuc2V0Qm91bmRzKGJvdW5kMSwgYm91bmQyKTtcbiAgICAvLyBtYXBNYW5hZ2VyLnRyaWdnZXJab29tRW5kKCk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIG1hcE1hbmFnZXIudHJpZ2dlclpvb21FbmQoKTtcbiAgICB9LCAxMCk7XG5cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgXCIjY29weS1lbWJlZFwiLCAoZSkgPT4ge1xuICAgIHZhciBjb3B5VGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW1iZWQtdGV4dFwiKTtcbiAgICBjb3B5VGV4dC5zZWxlY3QoKTtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZChcIkNvcHlcIik7XG4gIH0pO1xuXG4gIC8vIDMuIG1hcmtlcnMgb24gbWFwXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC1wbG90JywgKGUsIG9wdCkgPT4ge1xuXG4gICAgbWFwTWFuYWdlci5wbG90UG9pbnRzKG9wdC5kYXRhLCBvcHQucGFyYW1zLCBvcHQuZ3JvdXBzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInKTtcbiAgfSlcblxuICAvLyBsb2FkIGdyb3Vwc1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxvYWQtZ3JvdXBzJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5lbXB0eSgpO1xuICAgIG9wdC5ncm91cHMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuXG4gICAgICBsZXQgc2x1Z2dlZCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG4gICAgICBsZXQgdmFsdWVUZXh0ID0gbGFuZ3VhZ2VNYW5hZ2VyLmdldFRyYW5zbGF0aW9uKGl0ZW0udHJhbnNsYXRpb24pO1xuICAgICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLmFwcGVuZChgXG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPScke3NsdWdnZWR9J1xuICAgICAgICAgICAgICBzZWxlY3RlZD0nc2VsZWN0ZWQnXG4gICAgICAgICAgICAgIGxhYmVsPVwiPHNwYW4gZGF0YS1sYW5nLXRhcmdldD0ndGV4dCcgZGF0YS1sYW5nLWtleT0nJHtpdGVtLnRyYW5zbGF0aW9ufSc+JHt2YWx1ZVRleHR9PC9zcGFuPjxpbWcgc3JjPScke2l0ZW0uaWNvbnVybCB8fCB3aW5kb3cuREVGQVVMVF9JQ09OfScgLz5cIj5cbiAgICAgICAgICAgIDwvb3B0aW9uPmApXG4gICAgfSk7XG5cbiAgICAvLyBSZS1pbml0aWFsaXplXG4gICAgcXVlcnlNYW5hZ2VyLmluaXRpYWxpemUoKTtcbiAgICAvLyAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykubXVsdGlzZWxlY3QoJ2Rlc3Ryb3knKTtcbiAgICAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykubXVsdGlzZWxlY3QoJ3JlYnVpbGQnKTtcblxuICAgIG1hcE1hbmFnZXIucmVmcmVzaE1hcCgpO1xuXG5cbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZScpO1xuXG4gIH0pXG5cbiAgLy8gRmlsdGVyIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtZmlsdGVyJywgKGUsIG9wdCkgPT4ge1xuICAgIGlmIChvcHQpIHtcbiAgICAgIG1hcE1hbmFnZXIuZmlsdGVyTWFwKG9wdC5maWx0ZXIpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgKGUsIG9wdCkgPT4ge1xuXG4gICAgaWYgKG9wdCkge1xuXG4gICAgICBsYW5ndWFnZU1hbmFnZXIudXBkYXRlTGFuZ3VhZ2Uob3B0LmxhbmcpO1xuICAgIH0gZWxzZSB7XG5cbiAgICAgIGxhbmd1YWdlTWFuYWdlci5yZWZyZXNoKCk7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sYW5ndWFnZS1sb2FkZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KCdyZWJ1aWxkJyk7XG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbiNzaG93LWhpZGUtbWFwJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ2JvZHknKS50b2dnbGVDbGFzcygnbWFwLXZpZXcnKVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uLmJ0bi5tb3JlLWl0ZW1zJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJyNlbWJlZC1hcmVhJykudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgLy91cGRhdGUgZW1iZWQgbGluZVxuICAgIHZhciBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHQpKTtcbiAgICBkZWxldGUgY29weVsnbG5nJ107XG4gICAgZGVsZXRlIGNvcHlbJ2xhdCddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDEnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQyJ107XG5cbiAgICAkKCcjZW1iZWQtYXJlYSBpbnB1dFtuYW1lPWVtYmVkXScpLnZhbCgnaHR0cHM6Ly9uZXctbWFwLjM1MC5vcmcjJyArICQucGFyYW0oY29weSkpO1xuICB9KTtcblxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24jem9vbS1vdXQnLCAoZSwgb3B0KSA9PiB7XG5cbiAgICAvLyBtYXBNYW5hZ2VyLnpvb21PdXRPbmNlKCk7XG5cbiAgICBtYXBNYW5hZ2VyLnpvb21VbnRpbEhpdCgpO1xuICB9KVxuXG4gICQod2luZG93KS5vbihcInJlc2l6ZVwiLCAoZSkgPT4ge1xuICAgIG1hcE1hbmFnZXIucmVmcmVzaE1hcCgpO1xuICB9KTtcblxuICAvKipcbiAgRmlsdGVyIENoYW5nZXNcbiAgKi9cbiAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIi5zZWFyY2gtYnV0dG9uIGJ1dHRvblwiLCAoZSkgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwic2VhcmNoLmZvcmNlLXNlYXJjaC1sb2NhdGlvblwiKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKFwia2V5dXBcIiwgXCJpbnB1dFtuYW1lPSdsb2MnXVwiLCAoZSkgPT4ge1xuICAgIGlmIChlLmtleUNvZGUgPT0gMTMpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3NlYXJjaC5mb3JjZS1zZWFyY2gtbG9jYXRpb24nKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdzZWFyY2guZm9yY2Utc2VhcmNoLWxvY2F0aW9uJywgKCkgPT4ge1xuICAgIGxldCBfcXVlcnkgPSAkKFwiaW5wdXRbbmFtZT0nbG9jJ11cIikudmFsKCk7XG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlci5mb3JjZVNlYXJjaChfcXVlcnkpO1xuICAgIC8vIFNlYXJjaCBnb29nbGUgYW5kIGdldCB0aGUgZmlyc3QgcmVzdWx0Li4uIGF1dG9jb21wbGV0ZT9cbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKFwiaGFzaGNoYW5nZVwiLCAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgaWYgKGhhc2gubGVuZ3RoID09IDApIHJldHVybjtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKGhhc2guc3Vic3RyaW5nKDEpKTtcbiAgICBjb25zdCBvbGRVUkwgPSBldmVudC5vcmlnaW5hbEV2ZW50Lm9sZFVSTDtcblxuXG4gICAgY29uc3Qgb2xkSGFzaCA9ICQuZGVwYXJhbShvbGRVUkwuc3Vic3RyaW5nKG9sZFVSTC5zZWFyY2goXCIjXCIpKzEpKTtcblxuXG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCBwYXJhbWV0ZXJzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuXG4gICAgLy8gU28gdGhhdCBjaGFuZ2UgaW4gZmlsdGVycyB3aWxsIG5vdCB1cGRhdGUgdGhpc1xuICAgIGlmIChvbGRIYXNoLmJvdW5kMSAhPT0gcGFyYW1ldGVycy5ib3VuZDEgfHwgb2xkSGFzaC5ib3VuZDIgIT09IHBhcmFtZXRlcnMuYm91bmQyKSB7XG5cbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG5cbiAgICBpZiAob2xkSGFzaC5sb2cgIT09IHBhcmFtZXRlcnMubG9jKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcblxuICAgIH1cblxuICAgIC8vIENoYW5nZSBpdGVtc1xuICAgIGlmIChvbGRIYXNoLmxhbmcgIT09IHBhcmFtZXRlcnMubGFuZykge1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sYW5ndWFnZS11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG4gIH0pXG5cbiAgLy8gNC4gZmlsdGVyIG91dCBpdGVtcyBpbiBhY3Rpdml0eS1hcmVhXG5cbiAgLy8gNS4gZ2V0IG1hcCBlbGVtZW50c1xuXG4gIC8vIDYuIGdldCBHcm91cCBkYXRhXG5cbiAgLy8gNy4gcHJlc2VudCBncm91cCBlbGVtZW50c1xuXG4gICQud2hlbigoKT0+e30pXG4gICAgLnRoZW4oKCkgPT57XG4gICAgICByZXR1cm4gbGFuZ3VhZ2VNYW5hZ2VyLmluaXRpYWxpemUoaW5pdFBhcmFtc1snbGFuZyddIHx8ICdlbicpO1xuICAgIH0pXG4gICAgLmRvbmUoKGRhdGEpID0+IHt9KVxuICAgIC50aGVuKCgpID0+IHtcbiAgICAgICQuYWpheCh7XG4gICAgICAgICAgdXJsOiAnaHR0cHM6Ly9uZXctbWFwLjM1MC5vcmcvb3V0cHV0LzM1MG9yZy1uZXctbGF5b3V0LmpzLmd6JywgLy8nfCoqREFUQV9TT1VSQ0UqKnwnLFxuICAgICAgICAgIC8vIHVybDogJy9kYXRhL3Rlc3QuanMnLCAvLyd8KipEQVRBX1NPVVJDRSoqfCcsXG4gICAgICAgICAgZGF0YVR5cGU6ICdzY3JpcHQnLFxuICAgICAgICAgIGNhY2hlOiB0cnVlLFxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICAvLyB3aW5kb3cuRVZFTlRTX0RBVEEgPSBkYXRhO1xuICAgICAgICAgICAgLy9KdW5lIDE0LCAyMDE4IOKAkyBDaGFuZ2VzXG4gICAgICAgICAgICBpZih3aW5kb3cucXVlcmllcy5ncm91cCkge1xuICAgICAgICAgICAgICB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YSA9IHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhLmZpbHRlcigoaSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBpLmNhbXBhaWduID09IHdpbmRvdy5xdWVyaWVzLmdyb3VwXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL0xvYWQgZ3JvdXBzXG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxvYWQtZ3JvdXBzJywgeyBncm91cHM6IHdpbmRvdy5FVkVOVFNfREFUQS5ncm91cHMgfSk7XG5cblxuICAgICAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuXG4gICAgICAgICAgICB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgIGl0ZW1bJ2V2ZW50X3R5cGUnXSA9ICFpdGVtLmV2ZW50X3R5cGUgPyAnQWN0aW9uJyA6IGl0ZW0uZXZlbnRfdHlwZTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtdXBkYXRlJywgeyBwYXJhbXM6IHBhcmFtZXRlcnMgfSk7XG4gICAgICAgICAgICAvLyAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtcGxvdCcsIHtcbiAgICAgICAgICAgICAgICBkYXRhOiB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YSxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHBhcmFtZXRlcnMsXG4gICAgICAgICAgICAgICAgZ3JvdXBzOiB3aW5kb3cuRVZFTlRTX0RBVEEuZ3JvdXBzLnJlZHVjZSgoZGljdCwgaXRlbSk9PnsgZGljdFtpdGVtLnN1cGVyZ3JvdXBdID0gaXRlbTsgcmV0dXJuIGRpY3Q7IH0sIHt9KVxuICAgICAgICAgICAgfSk7XG4gICAgICAvLyB9KTtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgcGFyYW1ldGVycyk7XG4gICAgICAgICAgICAvL1RPRE86IE1ha2UgdGhlIGdlb2pzb24gY29udmVyc2lvbiBoYXBwZW4gb24gdGhlIGJhY2tlbmRcblxuICAgICAgICAgICAgLy9SZWZyZXNoIHRoaW5nc1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgIGxldCBwID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuICAgICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwKTtcbiAgICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJywgcCk7XG5cbiAgICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwKTtcbiAgICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci1ieS1ib3VuZCcsIHApO1xuXG4gICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuXG5cbn0pKGpRdWVyeSk7XG4iXX0=
