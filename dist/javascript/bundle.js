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
            $(item).text(targetLanguage[langTarget]);
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

        $.ajax({
          // url: 'https://gsx2json.com/api?id=1O3eByjL1vlYf7Z7am-_htRTQi73PafqIfNBdLmXe8SM&sheet=1',
          url: '/data/lang.json',
          dataType: 'json',
          success: function success(data) {
            dictionary = data;
            language = lang;
            updatePageLanguage();
          }
        });
      },
      updateLanguage: function updateLanguage(lang) {

        language = lang;
        updatePageLanguage();
      }
    };
  };
}(jQuery);
"use strict";

/* This loads and manages the list! */

var ListManager = function ($) {
  return function () {
    var targetList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "#events-list";

    var $target = typeof targetList === 'string' ? $(targetList) : targetList;

    var renderEvent = function renderEvent(item) {

      var date = moment(new Date(item.start_datetime).toGMTString()).format("dddd MMM DD, h:mma");
      var url = item.url.match(/^https{0,1}:/) ? item.url : "//" + item.url;
      return "\n      <li class='" + item.event_type + " event-obj' data-lat='" + item.lat + "' data-lng='" + item.lng + "'>\n        <div class=\"type-event type-action\">\n          <ul class=\"event-types-list\">\n            <li class='tag-" + item.event_type + " tag'>" + item.event_type + "</li>\n          </ul>\n          <h2 class=\"event-title\"><a href=\"" + url + "\" target='_blank'>" + item.title + "</a></h2>\n          <div class=\"event-date date\">" + date + "</div>\n          <div class=\"event-address address-area\">\n            <p>" + item.venue + "</p>\n          </div>\n          <div class=\"call-to-action\">\n            <a href=\"" + url + "\" target='_blank' class=\"btn btn-secondary\">RSVP</a>\n          </div>\n        </div>\n      </li>\n      ";
    };

    var renderGroup = function renderGroup(item) {
      var url = item.website == '' ? 'javascript: void(0)' : item.website.match(/^https{0,1}:/) ? item.website : "//" + item.website;

      var hideButton = item.website == '';

      return "\n      <li class='" + item.event_type + " group-obj' data-lat='" + item.lat + "' data-lng='" + item.lng + "'>\n        <div class=\"type-group group-obj\">\n          <ul class=\"event-types-list\">\n            <li class=\"tag tag-" + item.supergroup + "\">" + item.supergroup + "</li>\n          </ul>\n          <h2><a href=\"" + url + "\" target='_blank'>" + item.name + "</a></h2>\n          <div class=\"group-details-area\">\n            <div class=\"group-location location\">" + item.location + "</div>\n            <div class=\"group-description\">\n              <p>" + item.description + "</p>\n            </div>\n          </div>\n          <div class=\"call-to-action\">\n            <a href=\"" + url + "\" target='_blank' class=\"btn btn-secondary\" style=\"" + (hideButton ? 'display: none' : '') + "\">\n              Get Involved\n            </a>\n          </div>\n        </div>\n      </li>\n      ";
    };

    return {
      $list: $target,
      updateFilter: function updateFilter(p) {
        if (!p) return;

        // Remove Filters

        $target.removeProp("class");
        $target.addClass(p.filter ? p.filter.join(" ") : '');
      },
      updateBounds: function updateBounds(bound1, bound2) {

        // const bounds = [p.bounds1, p.bounds2];


        $target.find('ul li.event-obj, ul li.group-obj').each(function (ind, item) {

          var _lat = $(item).data('lat'),
              _lng = $(item).data('lng');

          // console.log("updateBounds", item)
          if (bound1[0] <= _lat && bound2[0] >= _lat && bound1[1] <= _lng && bound2[1] >= _lng) {
            // console.log("Adding bounds");
            $(item).addClass('within-bound');
          } else {
            $(item).removeClass('within-bound');
          }
        });
      },
      populateList: function populateList(hardFilters) {
        //using window.EVENT_DATA
        var keySet = !hardFilters.key ? [] : hardFilters.key.split(',');

        var $eventList = window.EVENTS_DATA.map(function (item) {
          if (keySet.length == 0) {
            return item.event_type && item.event_type.toLowerCase() == 'group' ? renderGroup(item) : renderEvent(item);
          } else if (keySet.length > 0 && item.event_type != 'group' && keySet.includes(item.event_type)) {
            return renderEvent(item);
          } else if (keySet.length > 0 && item.event_type == 'group' && keySet.includes(item.supergroup)) {
            return renderGroup(item);
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
    var date = moment(item.start_datetime).format("dddd MMM DD, h:mma");
    var url = item.url.match(/^https{0,1}:/) ? item.url : "//" + item.url;
    return "\n    <div class='popup-item " + item.event_type + "' data-lat='" + item.lat + "' data-lng='" + item.lng + "'>\n      <div class=\"type-event\">\n        <ul class=\"event-types-list\">\n          <li class=\"tag tag-" + item.event_type + "\">" + (item.event_type || 'Action') + "</li>\n        </ul>\n        <h2 class=\"event-title\"><a href=\"" + url + "\" target='_blank'>" + item.title + "</a></h2>\n        <div class=\"event-date\">" + date + "</div>\n        <div class=\"event-address address-area\">\n          <p>" + item.venue + "</p>\n        </div>\n        <div class=\"call-to-action\">\n          <a href=\"" + url + "\" target='_blank' class=\"btn btn-secondary\">RSVP</a>\n        </div>\n      </div>\n    </div>\n    ";
  };

  var renderGroup = function renderGroup(item) {

    var url = item.website == '' ? 'javascript: void(0)' : item.website.match(/^https{0,1}:/) ? item.website : "//" + item.website;

    var hideButton = item.website == '';

    return "\n    <li>\n      <div class=\"type-group group-obj\">\n        <ul class=\"event-types-list\">\n          <li class=\"tag tag-" + item.supergroup + "\">" + item.supergroup + "</li>\n        </ul>\n        <div class=\"group-header\">\n          <h2><a href=\"" + url + "\" target='_blank'>" + item.name + "</a></h2>\n          <div class=\"group-location location\">" + item.location + "</div>\n        </div>\n        <div class=\"group-details-area\">\n          <div class=\"group-description\">\n            <p>" + item.description + "</p>\n          </div>\n        </div>\n        <div class=\"call-to-action\">\n          <a href=\"" + url + "\" target='_blank' class=\"btn btn-secondary\" style=\"" + (hideButton ? 'display: none' : '') + "\">\n            Get Involved\n          </a>\n        </div>\n      </div>\n    </li>\n    ";
  };

  var renderGeojson = function renderGeojson(list) {
    return list.map(function (item) {
      // rendered eventType
      var rendered = void 0;

      if (item.event_type && item.event_type.toLowerCase() == 'group') {
        rendered = renderGroup(item);
      } else {
        rendered = renderEvent(item);
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

        var sw = [map.getBounds()._southWest.lat, map.getBounds()._southWest.lng];
        var ne = [map.getBounds()._northEast.lat, map.getBounds()._northEast.lng];
        options.onMove(sw, ne);
      });
    }

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
      refreshMap: function refreshMap() {
        map.invalidateSize(false);
        // map._onResize();

        // console.log("map is resized")
      },
      filterMap: function filterMap(filters) {

        $("#map").find(".event-item-popup").hide();

        if (!filters) return;

        filters.forEach(function (item) {

          $("#map").find(".event-item-popup." + item.toLowerCase()).show();
        });
      },
      plotPoints: function plotPoints(list, hardFilters) {

        var keySet = !hardFilters.key ? [] : hardFilters.key.split(',');

        if (keySet.length > 0) {
          list = list.filter(function (item) {
            return keySet.includes(item.event_type);
          });
        }

        var geojson = {
          type: "FeatureCollection",
          features: renderGeojson(list)
        };

        L.geoJSON(geojson, {
          pointToLayer: function pointToLayer(feature, latlng) {
            // Icons for markers
            var eventType = feature.properties.eventProperties.event_type;
            var groupIcon = L.icon({
              iconUrl: eventType && eventType.toLowerCase() === 'group' ? '/img/group.svg' : '/img/event.svg',
              iconSize: [22, 22],
              iconAnchor: [12, 8],
              className: 'groups event-item-popup'
            });
            var eventIcon = L.icon({
              iconUrl: eventType && eventType.toLowerCase() === 'group' ? '/img/group.svg' : '/img/event.svg',
              iconSize: [18, 18],
              iconAnchor: [9, 9],
              className: 'events event-item-popup'
            });
            var geojsonMarkerOptions = {
              icon: eventType && eventType.toLowerCase() === 'group' ? groupIcon : eventIcon
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

    $(document).on('change', '.filter-item input[type=checkbox]', function () {
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
            $target.find(".filter-item input[type=checkbox]").removeProp("checked");
            params.filter.forEach(function (item) {
              $target.find(".filter-item input[type=checkbox][value='" + item + "']").prop("checked", true);
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

(function ($) {

  // 1. google maps geocode

  // 2. focus map on geocode (via lat/lng)
  var queryManager = QueryManager();
  queryManager.initialize();

  var initParams = queryManager.getParameters();
  mapManager = MapManager({
    onMove: function onMove(sw, ne) {
      // When the map moves around, we update the list
      queryManager.updateViewportByBound(sw, ne);
      //update Query
    }
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

  var languageManager = LanguageManager();

  languageManager.initialize(initParams['lang'] || 'en');

  var listManager = ListManager();

  if (initParams.lat && initParams.lng) {
    mapManager.setCenter([initParams.lat, initParams.lng]);
  }

  /***
  * List Events
  * This will trigger the list update method
  */
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
    // console.log(options)
  });
  // 3. markers on map
  $(document).on('trigger-map-plot', function (e, opt) {

    mapManager.plotPoints(opt.data, opt.params);
    $(document).trigger('trigger-map-filter');
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
    }
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

  $(window).on("resize", function (e) {
    mapManager.refreshMap();
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

      $(document).trigger('trigger-map-update', parameters);
      $(document).trigger('trigger-list-filter-by-bound', parameters);
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

  $.ajax({
    url: 'https://new-map.350.org/output/350org.js.gz', //'|**DATA_SOURCE**|',
    dataType: 'script',
    cache: true,
    success: function success(data) {
      var parameters = queryManager.getParameters();

      window.EVENTS_DATA.forEach(function (item) {
        item['event_type'] = !item.event_type ? 'Action' : item.event_type;
      });
      $(document).trigger('trigger-list-update', { params: parameters });
      // $(document).trigger('trigger-list-filter-update', parameters);
      $(document).trigger('trigger-map-plot', { data: window.EVENTS_DATA, params: parameters });
      $(document).trigger('trigger-update-embed', parameters);
      //TODO: Make the geojson conversion happen on the backend

      //Refresh things
      setTimeout(function () {
        var p = queryManager.getParameters();
        $(document).trigger('trigger-map-update', p);
        $(document).trigger('trigger-map-filter', p);
        $(document).trigger('trigger-list-filter-update', p);
        $(document).trigger('trigger-list-filter-by-bound', p);
        //console.log(queryManager.getParameters())
      }, 100);
    }
  });
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9sYW5ndWFnZS5qcyIsImNsYXNzZXMvbGlzdC5qcyIsImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9xdWVyeS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJBdXRvY29tcGxldGVNYW5hZ2VyIiwiJCIsInRhcmdldCIsIkFQSV9LRVkiLCJ0YXJnZXRJdGVtIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwicXVlcnlNZ3IiLCJRdWVyeU1hbmFnZXIiLCJnZW9jb2RlciIsImdvb2dsZSIsIm1hcHMiLCJHZW9jb2RlciIsIiR0YXJnZXQiLCJpbml0aWFsaXplIiwidHlwZWFoZWFkIiwiaGludCIsImhpZ2hsaWdodCIsIm1pbkxlbmd0aCIsImNsYXNzTmFtZXMiLCJtZW51IiwibmFtZSIsImRpc3BsYXkiLCJpdGVtIiwiZm9ybWF0dGVkX2FkZHJlc3MiLCJsaW1pdCIsInNvdXJjZSIsInEiLCJzeW5jIiwiYXN5bmMiLCJnZW9jb2RlIiwiYWRkcmVzcyIsInJlc3VsdHMiLCJzdGF0dXMiLCJvbiIsIm9iaiIsImRhdHVtIiwiZ2VvbWV0cnkiLCJ1cGRhdGVWaWV3cG9ydCIsInZpZXdwb3J0IiwialF1ZXJ5IiwiTGFuZ3VhZ2VNYW5hZ2VyIiwibGFuZ3VhZ2UiLCJkaWN0aW9uYXJ5IiwiJHRhcmdldHMiLCJ1cGRhdGVQYWdlTGFuZ3VhZ2UiLCJ0YXJnZXRMYW5ndWFnZSIsInJvd3MiLCJmaWx0ZXIiLCJpIiwibGFuZyIsImVhY2giLCJpbmRleCIsInRhcmdldEF0dHJpYnV0ZSIsImRhdGEiLCJsYW5nVGFyZ2V0IiwidGV4dCIsInZhbCIsImF0dHIiLCJ0YXJnZXRzIiwiYWpheCIsInVybCIsImRhdGFUeXBlIiwic3VjY2VzcyIsInVwZGF0ZUxhbmd1YWdlIiwiTGlzdE1hbmFnZXIiLCJ0YXJnZXRMaXN0IiwicmVuZGVyRXZlbnQiLCJkYXRlIiwibW9tZW50IiwiRGF0ZSIsInN0YXJ0X2RhdGV0aW1lIiwidG9HTVRTdHJpbmciLCJmb3JtYXQiLCJtYXRjaCIsImV2ZW50X3R5cGUiLCJsYXQiLCJsbmciLCJ0aXRsZSIsInZlbnVlIiwicmVuZGVyR3JvdXAiLCJ3ZWJzaXRlIiwiaGlkZUJ1dHRvbiIsInN1cGVyZ3JvdXAiLCJsb2NhdGlvbiIsImRlc2NyaXB0aW9uIiwiJGxpc3QiLCJ1cGRhdGVGaWx0ZXIiLCJwIiwicmVtb3ZlUHJvcCIsImFkZENsYXNzIiwiam9pbiIsInVwZGF0ZUJvdW5kcyIsImJvdW5kMSIsImJvdW5kMiIsImZpbmQiLCJpbmQiLCJfbGF0IiwiX2xuZyIsInJlbW92ZUNsYXNzIiwicG9wdWxhdGVMaXN0IiwiaGFyZEZpbHRlcnMiLCJrZXlTZXQiLCJrZXkiLCJzcGxpdCIsIiRldmVudExpc3QiLCJ3aW5kb3ciLCJFVkVOVFNfREFUQSIsIm1hcCIsImxlbmd0aCIsInRvTG93ZXJDYXNlIiwiaW5jbHVkZXMiLCJyZW1vdmUiLCJhcHBlbmQiLCJNYXBNYW5hZ2VyIiwiTEFOR1VBR0UiLCJyZW5kZXJHZW9qc29uIiwibGlzdCIsInJlbmRlcmVkIiwiaXNOYU4iLCJwYXJzZUZsb2F0Iiwic3Vic3RyaW5nIiwidHlwZSIsImNvb3JkaW5hdGVzIiwicHJvcGVydGllcyIsImV2ZW50UHJvcGVydGllcyIsInBvcHVwQ29udGVudCIsIm9wdGlvbnMiLCJhY2Nlc3NUb2tlbiIsIkwiLCJkcmFnZ2luZyIsIkJyb3dzZXIiLCJtb2JpbGUiLCJzZXRWaWV3Iiwic2Nyb2xsV2hlZWxab29tIiwiZGlzYWJsZSIsIm9uTW92ZSIsImV2ZW50Iiwic3ciLCJnZXRCb3VuZHMiLCJfc291dGhXZXN0IiwibmUiLCJfbm9ydGhFYXN0IiwidGlsZUxheWVyIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsIiRtYXAiLCJjYWxsYmFjayIsInNldEJvdW5kcyIsImJvdW5kczEiLCJib3VuZHMyIiwiYm91bmRzIiwiZml0Qm91bmRzIiwic2V0Q2VudGVyIiwiY2VudGVyIiwiem9vbSIsImdldENlbnRlckJ5TG9jYXRpb24iLCJyZWZyZXNoTWFwIiwiaW52YWxpZGF0ZVNpemUiLCJmaWx0ZXJNYXAiLCJmaWx0ZXJzIiwiaGlkZSIsImZvckVhY2giLCJzaG93IiwicGxvdFBvaW50cyIsImdlb2pzb24iLCJmZWF0dXJlcyIsImdlb0pTT04iLCJwb2ludFRvTGF5ZXIiLCJmZWF0dXJlIiwibGF0bG5nIiwiZXZlbnRUeXBlIiwiZ3JvdXBJY29uIiwiaWNvbiIsImljb25VcmwiLCJpY29uU2l6ZSIsImljb25BbmNob3IiLCJjbGFzc05hbWUiLCJldmVudEljb24iLCJnZW9qc29uTWFya2VyT3B0aW9ucyIsIm1hcmtlciIsIm9uRWFjaEZlYXR1cmUiLCJsYXllciIsImJpbmRQb3B1cCIsInVwZGF0ZSIsImxhdExuZyIsInRhcmdldEZvcm0iLCJwcmV2aW91cyIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImZvcm0iLCJkZXBhcmFtIiwic2VyaWFsaXplIiwiaGFzaCIsInBhcmFtIiwidHJpZ2dlciIsInBhcmFtcyIsImxvYyIsInByb3AiLCJnZXRQYXJhbWV0ZXJzIiwicGFyYW1ldGVycyIsInVwZGF0ZUxvY2F0aW9uIiwiZiIsImIiLCJKU09OIiwic3RyaW5naWZ5IiwidXBkYXRlVmlld3BvcnRCeUJvdW5kIiwidHJpZ2dlclN1Ym1pdCIsImF1dG9jb21wbGV0ZU1hbmFnZXIiLCJtYXBNYW5hZ2VyIiwicXVlcnlNYW5hZ2VyIiwiaW5pdFBhcmFtcyIsImluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayIsInJlc3VsdCIsImxhbmd1YWdlTWFuYWdlciIsImxpc3RNYW5hZ2VyIiwicGFyc2UiLCJvcHQiLCJ0b2dnbGVDbGFzcyIsImNvcHkiLCJvbGRVUkwiLCJvcmlnaW5hbEV2ZW50Iiwib2xkSGFzaCIsInNlYXJjaCIsImNhY2hlIiwic2V0VGltZW91dCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7QUFDQSxJQUFNQSxzQkFBdUIsVUFBU0MsQ0FBVCxFQUFZO0FBQ3ZDOztBQUVBLFNBQU8sVUFBQ0MsTUFBRCxFQUFZOztBQUVqQixRQUFN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MkMsRUFBRUMsUUFBUUksVUFBVixFQUEzQztBQUNBO0FBQ0F2TSxRQUFFSSxRQUFGLEVBQVk4TCxPQUFaLENBQW9CLGtCQUFwQixFQUF3QyxFQUFFN0ksTUFBTW9ELE9BQU9DLFdBQWYsRUFBNEJ5RixRQUFRSSxVQUFwQyxFQUF4QztBQUNBdk0sUUFBRUksUUFBRixFQUFZOEwsT0FBWixDQUFvQixzQkFBcEIsRUFBNENLLFVBQTVDO0FBQ0E7O0FBRUE7QUFDQXlCLGlCQUFXLFlBQU07QUFDZixZQUFJekksSUFBSTBILGFBQWFYLGFBQWIsRUFBUjtBQUNBdE0sVUFBRUksUUFBRixFQUFZOEwsT0FBWixDQUFvQixvQkFBcEIsRUFBMEMzRyxDQUExQztBQUNBdkYsVUFBRUksUUFBRixFQUFZOEwsT0FBWixDQUFvQixvQkFBcEIsRUFBMEMzRyxDQUExQztBQUNBdkYsVUFBRUksUUFBRixFQUFZOEwsT0FBWixDQUFvQiw0QkFBcEIsRUFBa0QzRyxDQUFsRDtBQUNBdkYsVUFBRUksUUFBRixFQUFZOEwsT0FBWixDQUFvQiw4QkFBcEIsRUFBb0QzRyxDQUFwRDtBQUNBO0FBQ0QsT0FQRCxFQU9HLEdBUEg7QUFRRDtBQXpCSSxHQUFQO0FBOEJELENBOUxELEVBOExHaEQsTUE5TEgiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vL0FQSSA6QUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXG5jb25zdCBBdXRvY29tcGxldGVNYW5hZ2VyID0gKGZ1bmN0aW9uKCQpIHtcbiAgLy9Jbml0aWFsaXphdGlvbi4uLlxuXG4gIHJldHVybiAodGFyZ2V0KSA9PiB7XG5cbiAgICBjb25zdCBBUElfS0VZID0gXCJBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cIjtcbiAgICBjb25zdCB0YXJnZXRJdGVtID0gdHlwZW9mIHRhcmdldCA9PSBcInN0cmluZ1wiID8gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpIDogdGFyZ2V0O1xuICAgIGNvbnN0IHF1ZXJ5TWdyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgdmFyIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgJHRhcmdldDogJCh0YXJnZXRJdGVtKSxcbiAgICAgIHRhcmdldDogdGFyZ2V0SXRlbSxcbiAgICAgIGluaXRpYWxpemU6ICgpID0+IHtcbiAgICAgICAgJCh0YXJnZXRJdGVtKS50eXBlYWhlYWQoe1xuICAgICAgICAgICAgICAgICAgICBoaW50OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1pbkxlbmd0aDogNCxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICAgIG1lbnU6ICd0dC1kcm9wZG93bi1tZW51J1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnc2VhcmNoLXJlc3VsdHMnLFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAoaXRlbSkgPT4gaXRlbS5mb3JtYXR0ZWRfYWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgbGltaXQ6IDEwLFxuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IGZ1bmN0aW9uIChxLCBzeW5jLCBhc3luYyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogcSB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFzeW5jKHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApLm9uKCd0eXBlYWhlYWQ6c2VsZWN0ZWQnLCBmdW5jdGlvbiAob2JqLCBkYXR1bSkge1xuICAgICAgICAgICAgICAgICAgICBpZihkYXR1bSlcbiAgICAgICAgICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgICAgICAgdmFyIGdlb21ldHJ5ID0gZGF0dW0uZ2VvbWV0cnk7XG4gICAgICAgICAgICAgICAgICAgICAgcXVlcnlNZ3IudXBkYXRlVmlld3BvcnQoZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgICAgIC8vICBtYXAuZml0Qm91bmRzKGdlb21ldHJ5LmJvdW5kcz8gZ2VvbWV0cnkuYm91bmRzIDogZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG5cblxuICAgIHJldHVybiB7XG5cbiAgICB9XG4gIH1cblxufShqUXVlcnkpKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTGFuZ3VhZ2VNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIC8va2V5VmFsdWVcblxuICAvL3RhcmdldHMgYXJlIHRoZSBtYXBwaW5ncyBmb3IgdGhlIGxhbmd1YWdlXG4gIHJldHVybiAoKSA9PiB7XG4gICAgbGV0IGxhbmd1YWdlO1xuICAgIGxldCBkaWN0aW9uYXJ5ID0ge307XG4gICAgbGV0ICR0YXJnZXRzID0gJChcIltkYXRhLWxhbmctdGFyZ2V0XVtkYXRhLWxhbmcta2V5XVwiKTtcblxuICAgIGNvbnN0IHVwZGF0ZVBhZ2VMYW5ndWFnZSA9ICgpID0+IHtcblxuICAgICAgbGV0IHRhcmdldExhbmd1YWdlID0gZGljdGlvbmFyeS5yb3dzLmZpbHRlcigoaSkgPT4gaS5sYW5nID09PSBsYW5ndWFnZSlbMF07XG5cbiAgICAgICR0YXJnZXRzLmVhY2goKGluZGV4LCBpdGVtKSA9PiB7XG4gICAgICAgIGxldCB0YXJnZXRBdHRyaWJ1dGUgPSAkKGl0ZW0pLmRhdGEoJ2xhbmctdGFyZ2V0Jyk7XG4gICAgICAgIGxldCBsYW5nVGFyZ2V0ID0gJChpdGVtKS5kYXRhKCdsYW5nLWtleScpO1xuXG4gICAgICAgIHN3aXRjaCh0YXJnZXRBdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjYXNlICd0ZXh0JzpcbiAgICAgICAgICAgICQoaXRlbSkudGV4dCh0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd2YWx1ZSc6XG4gICAgICAgICAgICAkKGl0ZW0pLnZhbCh0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgJChpdGVtKS5hdHRyKHRhcmdldEF0dHJpYnV0ZSwgdGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICBsYW5ndWFnZSxcbiAgICAgIHRhcmdldHM6ICR0YXJnZXRzLFxuICAgICAgZGljdGlvbmFyeSxcbiAgICAgIGluaXRpYWxpemU6IChsYW5nKSA9PiB7XG5cbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAvLyB1cmw6ICdodHRwczovL2dzeDJqc29uLmNvbS9hcGk/aWQ9MU8zZUJ5akwxdmxZZjdaN2FtLV9odFJUUWk3M1BhZnFJZk5CZExtWGU4U00mc2hlZXQ9MScsXG4gICAgICAgICAgdXJsOiAnL2RhdGEvbGFuZy5qc29uJyxcbiAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICBkaWN0aW9uYXJ5ID0gZGF0YTtcbiAgICAgICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTGFuZ3VhZ2U6IChsYW5nKSA9PiB7XG5cbiAgICAgICAgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbn0pKGpRdWVyeSk7XG4iLCIvKiBUaGlzIGxvYWRzIGFuZCBtYW5hZ2VzIHRoZSBsaXN0ISAqL1xuXG5jb25zdCBMaXN0TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldExpc3QgPSBcIiNldmVudHMtbGlzdFwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRMaXN0ID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0TGlzdCkgOiB0YXJnZXRMaXN0O1xuXG4gICAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSkgPT4ge1xuXG4gICAgICB2YXIgZGF0ZSA9IG1vbWVudChuZXcgRGF0ZShpdGVtLnN0YXJ0X2RhdGV0aW1lKS50b0dNVFN0cmluZygpKS5mb3JtYXQoXCJkZGRkIE1NTSBERCwgaDptbWFcIik7XG4gICAgICBsZXQgdXJsID0gaXRlbS51cmwubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS51cmwgOiBcIi8vXCIgKyBpdGVtLnVybDtcbiAgICAgIHJldHVybiBgXG4gICAgICA8bGkgY2xhc3M9JyR7aXRlbS5ldmVudF90eXBlfSBldmVudC1vYmonIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnQgdHlwZS1hY3Rpb25cIj5cbiAgICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgICA8bGkgY2xhc3M9J3RhZy0ke2l0ZW0uZXZlbnRfdHlwZX0gdGFnJz4ke2l0ZW0uZXZlbnRfdHlwZX08L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPGgyIGNsYXNzPVwiZXZlbnQtdGl0bGVcIj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZX08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtZGF0ZSBkYXRlXCI+JHtkYXRlfTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1hZGRyZXNzIGFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgICAgPHA+JHtpdGVtLnZlbnVlfTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPlJTVlA8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSkgPT4ge1xuICAgICAgbGV0IHVybCA9IGl0ZW0ud2Vic2l0ZSA9PSAnJyA/ICdqYXZhc2NyaXB0OiB2b2lkKDApJyA6XG4gICAgICAgIChpdGVtLndlYnNpdGUubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS53ZWJzaXRlIDogXCIvL1wiICsgaXRlbS53ZWJzaXRlKTtcblxuICAgICAgbGV0IGhpZGVCdXR0b24gPSBpdGVtLndlYnNpdGUgPT0gJyc7XG5cbiAgICAgIHJldHVybiBgXG4gICAgICA8bGkgY2xhc3M9JyR7aXRlbS5ldmVudF90eXBlfSBncm91cC1vYmonIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXAgZ3JvdXAtb2JqXCI+XG4gICAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgICAgPGxpIGNsYXNzPVwidGFnIHRhZy0ke2l0ZW0uc3VwZXJncm91cH1cIj4ke2l0ZW0uc3VwZXJncm91cH08L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPGgyPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLm5hbWV9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWxvY2F0aW9uIGxvY2F0aW9uXCI+JHtpdGVtLmxvY2F0aW9ufTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiIHN0eWxlPVwiJHtoaWRlQnV0dG9uID8gJ2Rpc3BsYXk6IG5vbmUnIDogJyd9XCI+XG4gICAgICAgICAgICAgIEdldCBJbnZvbHZlZFxuICAgICAgICAgICAgPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAkbGlzdDogJHRhcmdldCxcbiAgICAgIHVwZGF0ZUZpbHRlcjogKHApID0+IHtcbiAgICAgICAgaWYoIXApIHJldHVybjtcblxuICAgICAgICAvLyBSZW1vdmUgRmlsdGVyc1xuXG4gICAgICAgICR0YXJnZXQucmVtb3ZlUHJvcChcImNsYXNzXCIpO1xuICAgICAgICAkdGFyZ2V0LmFkZENsYXNzKHAuZmlsdGVyID8gcC5maWx0ZXIuam9pbihcIiBcIikgOiAnJylcbiAgICAgIH0sXG4gICAgICB1cGRhdGVCb3VuZHM6IChib3VuZDEsIGJvdW5kMikgPT4ge1xuXG4gICAgICAgIC8vIGNvbnN0IGJvdW5kcyA9IFtwLmJvdW5kczEsIHAuYm91bmRzMl07XG5cblxuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsIGxpLmV2ZW50LW9iaiwgdWwgbGkuZ3JvdXAtb2JqJykuZWFjaCgoaW5kLCBpdGVtKT0+IHtcblxuICAgICAgICAgIGxldCBfbGF0ID0gJChpdGVtKS5kYXRhKCdsYXQnKSxcbiAgICAgICAgICAgICAgX2xuZyA9ICQoaXRlbSkuZGF0YSgnbG5nJyk7XG5cbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInVwZGF0ZUJvdW5kc1wiLCBpdGVtKVxuICAgICAgICAgIGlmIChib3VuZDFbMF0gPD0gX2xhdCAmJiBib3VuZDJbMF0gPj0gX2xhdCAmJiBib3VuZDFbMV0gPD0gX2xuZyAmJiBib3VuZDJbMV0gPj0gX2xuZykge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJBZGRpbmcgYm91bmRzXCIpO1xuICAgICAgICAgICAgJChpdGVtKS5hZGRDbGFzcygnd2l0aGluLWJvdW5kJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoaXRlbSkucmVtb3ZlQ2xhc3MoJ3dpdGhpbi1ib3VuZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgcG9wdWxhdGVMaXN0OiAoaGFyZEZpbHRlcnMpID0+IHtcbiAgICAgICAgLy91c2luZyB3aW5kb3cuRVZFTlRfREFUQVxuICAgICAgICBjb25zdCBrZXlTZXQgPSAhaGFyZEZpbHRlcnMua2V5ID8gW10gOiBoYXJkRmlsdGVycy5rZXkuc3BsaXQoJywnKTtcblxuICAgICAgICB2YXIgJGV2ZW50TGlzdCA9IHdpbmRvdy5FVkVOVFNfREFUQS5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgaWYgKGtleVNldC5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0uZXZlbnRfdHlwZSAmJiBpdGVtLmV2ZW50X3R5cGUudG9Mb3dlckNhc2UoKSA9PSAnZ3JvdXAnID8gcmVuZGVyR3JvdXAoaXRlbSkgOiByZW5kZXJFdmVudChpdGVtKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtleVNldC5sZW5ndGggPiAwICYmIGl0ZW0uZXZlbnRfdHlwZSAhPSAnZ3JvdXAnICYmIGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyRXZlbnQoaXRlbSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXlTZXQubGVuZ3RoID4gMCAmJiBpdGVtLmV2ZW50X3R5cGUgPT0gJ2dyb3VwJyAmJiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5zdXBlcmdyb3VwKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlbmRlckdyb3VwKGl0ZW0pXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgfSlcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCBsaScpLnJlbW92ZSgpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsJykuYXBwZW5kKCRldmVudExpc3QpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJcbmNvbnN0IE1hcE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgbGV0IExBTkdVQUdFID0gJ2VuJztcblxuICBjb25zdCByZW5kZXJFdmVudCA9IChpdGVtKSA9PiB7XG4gICAgdmFyIGRhdGUgPSBtb21lbnQoaXRlbS5zdGFydF9kYXRldGltZSkuZm9ybWF0KFwiZGRkZCBNTU0gREQsIGg6bW1hXCIpO1xuICAgIGxldCB1cmwgPSBpdGVtLnVybC5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLnVybCA6IFwiLy9cIiArIGl0ZW0udXJsO1xuICAgIHJldHVybiBgXG4gICAgPGRpdiBjbGFzcz0ncG9wdXAtaXRlbSAke2l0ZW0uZXZlbnRfdHlwZX0nIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5ldmVudF90eXBlfVwiPiR7aXRlbS5ldmVudF90eXBlIHx8ICdBY3Rpb24nfTwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxoMiBjbGFzcz1cImV2ZW50LXRpdGxlXCI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1kYXRlXCI+JHtkYXRlfTwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtYWRkcmVzcyBhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+UlNWUDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSkgPT4ge1xuXG4gICAgbGV0IHVybCA9IGl0ZW0ud2Vic2l0ZSA9PSAnJyA/ICdqYXZhc2NyaXB0OiB2b2lkKDApJyA6XG4gICAgICAoaXRlbS53ZWJzaXRlLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0ud2Vic2l0ZSA6IFwiLy9cIiArIGl0ZW0ud2Vic2l0ZSk7XG5cbiAgICBsZXQgaGlkZUJ1dHRvbiA9IGl0ZW0ud2Vic2l0ZSA9PSAnJztcblxuICAgIHJldHVybiBgXG4gICAgPGxpPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXAgZ3JvdXAtb2JqXCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5zdXBlcmdyb3VwfVwiPiR7aXRlbS5zdXBlcmdyb3VwfTwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1oZWFkZXJcIj5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0ubmFtZX08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtbG9jYXRpb24gbG9jYXRpb25cIj4ke2l0ZW0ubG9jYXRpb259PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICA8cD4ke2l0ZW0uZGVzY3JpcHRpb259PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCIgc3R5bGU9XCIke2hpZGVCdXR0b24gPyAnZGlzcGxheTogbm9uZScgOiAnJ31cIj5cbiAgICAgICAgICAgIEdldCBJbnZvbHZlZFxuICAgICAgICAgIDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2xpPlxuICAgIGBcbiAgfTtcblxuICBjb25zdCByZW5kZXJHZW9qc29uID0gKGxpc3QpID0+IHtcbiAgICByZXR1cm4gbGlzdC5tYXAoKGl0ZW0pID0+IHtcbiAgICAgIC8vIHJlbmRlcmVkIGV2ZW50VHlwZVxuICAgICAgbGV0IHJlbmRlcmVkO1xuXG4gICAgICBpZiAoaXRlbS5ldmVudF90eXBlICYmIGl0ZW0uZXZlbnRfdHlwZS50b0xvd2VyQ2FzZSgpID09ICdncm91cCcpIHtcbiAgICAgICAgcmVuZGVyZWQgPSByZW5kZXJHcm91cChpdGVtKTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVuZGVyZWQgPSByZW5kZXJFdmVudChpdGVtKTtcbiAgICAgIH1cblxuICAgICAgLy8gZm9ybWF0IGNoZWNrXG4gICAgICBpZiAoaXNOYU4ocGFyc2VGbG9hdChwYXJzZUZsb2F0KGl0ZW0ubG5nKSkpKSB7XG4gICAgICAgIGl0ZW0ubG5nID0gaXRlbS5sbmcuc3Vic3RyaW5nKDEpXG4gICAgICB9XG4gICAgICBpZiAoaXNOYU4ocGFyc2VGbG9hdChwYXJzZUZsb2F0KGl0ZW0ubGF0KSkpKSB7XG4gICAgICAgIGl0ZW0ubGF0ID0gaXRlbS5sYXQuc3Vic3RyaW5nKDEpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICB0eXBlOiBcIlBvaW50XCIsXG4gICAgICAgICAgY29vcmRpbmF0ZXM6IFtpdGVtLmxuZywgaXRlbS5sYXRdXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBldmVudFByb3BlcnRpZXM6IGl0ZW0sXG4gICAgICAgICAgcG9wdXBDb250ZW50OiByZW5kZXJlZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAob3B0aW9ucykgPT4ge1xuICAgIHZhciBhY2Nlc3NUb2tlbiA9ICdway5leUoxSWpvaWJXRjBkR2hsZHpNMU1DSXNJbUVpT2lKYVRWRk1Va1V3SW4wLndjTTNYYzhCR0M2UE0tT3lyd2puaGcnO1xuICAgIHZhciBtYXAgPSBMLm1hcCgnbWFwJywgeyBkcmFnZ2luZzogIUwuQnJvd3Nlci5tb2JpbGUgfSkuc2V0VmlldyhbMzQuODg1OTMwOTQwNzUzMTcsIDUuMDk3NjU2MjUwMDAwMDAxXSwgMik7XG5cbiAgICBpZiAoIUwuQnJvd3Nlci5tb2JpbGUpIHtcbiAgICAgIG1hcC5zY3JvbGxXaGVlbFpvb20uZGlzYWJsZSgpO1xuICAgIH1cblxuICAgIExBTkdVQUdFID0gb3B0aW9ucy5sYW5nIHx8ICdlbic7XG5cbiAgICBpZiAob3B0aW9ucy5vbk1vdmUpIHtcbiAgICAgIG1hcC5vbignZHJhZ2VuZCcsIChldmVudCkgPT4ge1xuXG5cbiAgICAgICAgbGV0IHN3ID0gW21hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW21hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubG5nXTtcbiAgICAgICAgb3B0aW9ucy5vbk1vdmUoc3csIG5lKTtcbiAgICAgIH0pLm9uKCd6b29tZW5kJywgKGV2ZW50KSA9PiB7XG5cblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuICAgICAgICBvcHRpb25zLm9uTW92ZShzdywgbmUpO1xuICAgICAgfSlcbiAgICB9XG5cbiAgICBMLnRpbGVMYXllcignaHR0cHM6Ly9hcGkubWFwYm94LmNvbS9zdHlsZXMvdjEvbWF0dGhldzM1MC9jamE0MXRpamsyN2Q2MnJxb2Q3ZzBseDRiL3RpbGVzLzI1Ni97en0ve3h9L3t5fT9hY2Nlc3NfdG9rZW49JyArIGFjY2Vzc1Rva2VuLCB7XG4gICAgICAgIGF0dHJpYnV0aW9uOiAnJmNvcHk7IDxhIGhyZWY9XCJodHRwOi8vb3NtLm9yZy9jb3B5cmlnaHRcIj5PcGVuU3RyZWV0TWFwPC9hPiBjb250cmlidXRvcnMg4oCiIDxhIGhyZWY9XCIvLzM1MC5vcmdcIj4zNTAub3JnPC9hPidcbiAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgbGV0IGdlb2NvZGVyID0gbnVsbDtcbiAgICByZXR1cm4ge1xuICAgICAgJG1hcDogbWFwLFxuICAgICAgaW5pdGlhbGl6ZTogKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG4gICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBzZXRCb3VuZHM6IChib3VuZHMxLCBib3VuZHMyKSA9PiB7XG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtib3VuZHMxLCBib3VuZHMyXTtcbiAgICAgICAgbWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuICAgICAgfSxcbiAgICAgIHNldENlbnRlcjogKGNlbnRlciwgem9vbSA9IDEwKSA9PiB7XG4gICAgICAgIGlmICghY2VudGVyIHx8ICFjZW50ZXJbMF0gfHwgY2VudGVyWzBdID09IFwiXCJcbiAgICAgICAgICAgICAgfHwgIWNlbnRlclsxXSB8fCBjZW50ZXJbMV0gPT0gXCJcIikgcmV0dXJuO1xuICAgICAgICBtYXAuc2V0VmlldyhjZW50ZXIsIHpvb20pO1xuICAgICAgfSxcbiAgICAgIGdldEJvdW5kczogKCkgPT4ge1xuXG4gICAgICAgIGxldCBzdyA9IFttYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxuZ107XG4gICAgICAgIGxldCBuZSA9IFttYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxuZ107XG5cbiAgICAgICAgcmV0dXJuIFtzdywgbmVdO1xuICAgICAgfSxcbiAgICAgIC8vIENlbnRlciBsb2NhdGlvbiBieSBnZW9jb2RlZFxuICAgICAgZ2V0Q2VudGVyQnlMb2NhdGlvbjogKGxvY2F0aW9uLCBjYWxsYmFjaykgPT4ge1xuXG4gICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBsb2NhdGlvbiB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG5cbiAgICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXN1bHRzWzBdKVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgcmVmcmVzaE1hcDogKCkgPT4ge1xuICAgICAgICBtYXAuaW52YWxpZGF0ZVNpemUoZmFsc2UpO1xuICAgICAgICAvLyBtYXAuX29uUmVzaXplKCk7XG5cbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJtYXAgaXMgcmVzaXplZFwiKVxuICAgICAgfSxcbiAgICAgIGZpbHRlck1hcDogKGZpbHRlcnMpID0+IHtcblxuICAgICAgICAkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXBcIikuaGlkZSgpO1xuXG5cbiAgICAgICAgaWYgKCFmaWx0ZXJzKSByZXR1cm47XG5cbiAgICAgICAgZmlsdGVycy5mb3JFYWNoKChpdGVtKSA9PiB7XG5cbiAgICAgICAgICAkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXAuXCIgKyBpdGVtLnRvTG93ZXJDYXNlKCkpLnNob3coKTtcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICBwbG90UG9pbnRzOiAobGlzdCwgaGFyZEZpbHRlcnMpID0+IHtcblxuICAgICAgICBjb25zdCBrZXlTZXQgPSAhaGFyZEZpbHRlcnMua2V5ID8gW10gOiBoYXJkRmlsdGVycy5rZXkuc3BsaXQoJywnKTtcblxuICAgICAgICBpZiAoa2V5U2V0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsaXN0ID0gbGlzdC5maWx0ZXIoKGl0ZW0pID0+IGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKVxuICAgICAgICB9XG5cblxuICAgICAgICBjb25zdCBnZW9qc29uID0ge1xuICAgICAgICAgIHR5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgICAgICAgICBmZWF0dXJlczogcmVuZGVyR2VvanNvbihsaXN0KVxuICAgICAgICB9O1xuXG5cblxuICAgICAgICBMLmdlb0pTT04oZ2VvanNvbiwge1xuICAgICAgICAgICAgcG9pbnRUb0xheWVyOiAoZmVhdHVyZSwgbGF0bG5nKSA9PiB7XG4gICAgICAgICAgICAgIC8vIEljb25zIGZvciBtYXJrZXJzXG4gICAgICAgICAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuZXZlbnRfdHlwZTtcbiAgICAgICAgICAgICAgdmFyIGdyb3VwSWNvbiA9IEwuaWNvbih7XG4gICAgICAgICAgICAgICAgaWNvblVybDogZXZlbnRUeXBlICYmIGV2ZW50VHlwZS50b0xvd2VyQ2FzZSgpID09PSAnZ3JvdXAnID8gJy9pbWcvZ3JvdXAuc3ZnJyA6ICcvaW1nL2V2ZW50LnN2ZycsXG4gICAgICAgICAgICAgICAgaWNvblNpemU6IFsyMiwgMjJdLFxuICAgICAgICAgICAgICAgIGljb25BbmNob3I6IFsxMiwgOF0sXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnZ3JvdXBzIGV2ZW50LWl0ZW0tcG9wdXAnXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB2YXIgZXZlbnRJY29uID0gTC5pY29uKHtcbiAgICAgICAgICAgICAgICBpY29uVXJsOiBldmVudFR5cGUgJiYgZXZlbnRUeXBlLnRvTG93ZXJDYXNlKCkgPT09ICdncm91cCcgPyAnL2ltZy9ncm91cC5zdmcnIDogJy9pbWcvZXZlbnQuc3ZnJyxcbiAgICAgICAgICAgICAgICBpY29uU2l6ZTogWzE4LCAxOF0sXG4gICAgICAgICAgICAgICAgaWNvbkFuY2hvcjogWzksIDldLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2V2ZW50cyBldmVudC1pdGVtLXBvcHVwJ1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgdmFyIGdlb2pzb25NYXJrZXJPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIGljb246IGV2ZW50VHlwZSAmJiBldmVudFR5cGUudG9Mb3dlckNhc2UoKSA9PT0gJ2dyb3VwJyA/IGdyb3VwSWNvbiA6IGV2ZW50SWNvbixcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgcmV0dXJuIEwubWFya2VyKGxhdGxuZywgZ2VvanNvbk1hcmtlck9wdGlvbnMpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgIG9uRWFjaEZlYXR1cmU6IChmZWF0dXJlLCBsYXllcikgPT4ge1xuICAgICAgICAgICAgaWYgKGZlYXR1cmUucHJvcGVydGllcyAmJiBmZWF0dXJlLnByb3BlcnRpZXMucG9wdXBDb250ZW50KSB7XG4gICAgICAgICAgICAgIGxheWVyLmJpbmRQb3B1cChmZWF0dXJlLnByb3BlcnRpZXMucG9wdXBDb250ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pLmFkZFRvKG1hcCk7XG5cbiAgICAgIH0sXG4gICAgICB1cGRhdGU6IChwKSA9PiB7XG4gICAgICAgIGlmICghcCB8fCAhcC5sYXQgfHwgIXAubG5nICkgcmV0dXJuO1xuXG4gICAgICAgIG1hcC5zZXRWaWV3KEwubGF0TG5nKHAubGF0LCBwLmxuZyksIDEwKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiY29uc3QgUXVlcnlNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIHJldHVybiAodGFyZ2V0Rm9ybSA9IFwiZm9ybSNmaWx0ZXJzLWZvcm1cIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0Rm9ybSA9PT0gJ3N0cmluZycgPyAkKHRhcmdldEZvcm0pIDogdGFyZ2V0Rm9ybTtcbiAgICBsZXQgbGF0ID0gbnVsbDtcbiAgICBsZXQgbG5nID0gbnVsbDtcblxuICAgIGxldCBwcmV2aW91cyA9IHt9O1xuXG4gICAgJHRhcmdldC5vbignc3VibWl0JywgKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGxhdCA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwoKTtcbiAgICAgIGxuZyA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwoKTtcblxuICAgICAgdmFyIGZvcm0gPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG5cbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJC5wYXJhbShmb3JtKTtcbiAgICB9KVxuXG4gICAgJChkb2N1bWVudCkub24oJ2NoYW5nZScsICcuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF0nLCAoKSA9PiB7XG4gICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgIH0pXG5cblxuICAgIHJldHVybiB7XG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgcGFyYW1zID0gJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSlcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhbmddXCIpLnZhbChwYXJhbXMubGFuZyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChwYXJhbXMubGF0KTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKHBhcmFtcy5sbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwocGFyYW1zLmJvdW5kMSk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChwYXJhbXMuYm91bmQyKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxvY11cIikudmFsKHBhcmFtcy5sb2MpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9a2V5XVwiKS52YWwocGFyYW1zLmtleSk7XG5cbiAgICAgICAgICBpZiAocGFyYW1zLmZpbHRlcikge1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdXCIpLnJlbW92ZVByb3AoXCJjaGVja2VkXCIpO1xuICAgICAgICAgICAgcGFyYW1zLmZpbHRlci5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF1bdmFsdWU9J1wiICsgaXRlbSArIFwiJ11cIikucHJvcChcImNoZWNrZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGdldFBhcmFtZXRlcnM6ICgpID0+IHtcbiAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG4gICAgICAgIC8vIHBhcmFtZXRlcnNbJ2xvY2F0aW9uJ10gO1xuXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHBhcmFtZXRlcnMpIHtcbiAgICAgICAgICBpZiAoICFwYXJhbWV0ZXJzW2tleV0gfHwgcGFyYW1ldGVyc1trZXldID09IFwiXCIpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBwYXJhbWV0ZXJzW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtZXRlcnM7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTG9jYXRpb246IChsYXQsIGxuZykgPT4ge1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKGxhdCk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwobG5nKTtcbiAgICAgICAgLy8gJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVWaWV3cG9ydDogKHZpZXdwb3J0KSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW1t2aWV3cG9ydC5mLmIsIHZpZXdwb3J0LmIuYl0sIFt2aWV3cG9ydC5mLmYsIHZpZXdwb3J0LmIuZl1dO1xuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlVmlld3BvcnRCeUJvdW5kOiAoc3csIG5lKSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW3N3LCBuZV07Ly8vLy8vLy9cblxuICAgICAgICBcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMF0pKTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMV0pKTtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyU3VibWl0OiAoKSA9PiB7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59KShqUXVlcnkpO1xuIiwibGV0IGF1dG9jb21wbGV0ZU1hbmFnZXI7XG5sZXQgbWFwTWFuYWdlcjtcblxuKGZ1bmN0aW9uKCQpIHtcblxuICAvLyAxLiBnb29nbGUgbWFwcyBnZW9jb2RlXG5cbiAgLy8gMi4gZm9jdXMgbWFwIG9uIGdlb2NvZGUgKHZpYSBsYXQvbG5nKVxuICBjb25zdCBxdWVyeU1hbmFnZXIgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICAgICAgcXVlcnlNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICBjb25zdCBpbml0UGFyYW1zID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcbiAgbWFwTWFuYWdlciA9IE1hcE1hbmFnZXIoe1xuICAgIG9uTW92ZTogKHN3LCBuZSkgPT4ge1xuICAgICAgLy8gV2hlbiB0aGUgbWFwIG1vdmVzIGFyb3VuZCwgd2UgdXBkYXRlIHRoZSBsaXN0XG4gICAgICBxdWVyeU1hbmFnZXIudXBkYXRlVmlld3BvcnRCeUJvdW5kKHN3LCBuZSk7XG4gICAgICAvL3VwZGF0ZSBRdWVyeVxuICAgIH1cbiAgfSk7XG5cbiAgd2luZG93LmluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayA9ICgpID0+IHtcblxuICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIgPSBBdXRvY29tcGxldGVNYW5hZ2VyKFwiaW5wdXRbbmFtZT0nbG9jJ11cIik7XG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlci5pbml0aWFsaXplKCk7XG5cbiAgICBpZiAoaW5pdFBhcmFtcy5sb2MgJiYgaW5pdFBhcmFtcy5sb2MgIT09ICcnICYmICghaW5pdFBhcmFtcy5ib3VuZDEgJiYgIWluaXRQYXJhbXMuYm91bmQyKSkge1xuICAgICAgbWFwTWFuYWdlci5pbml0aWFsaXplKCgpID0+IHtcbiAgICAgICAgbWFwTWFuYWdlci5nZXRDZW50ZXJCeUxvY2F0aW9uKGluaXRQYXJhbXMubG9jLCAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgcXVlcnlNYW5hZ2VyLnVwZGF0ZVZpZXdwb3J0KHJlc3VsdC5nZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICB9XG4gIH1cblxuXG4gIGNvbnN0IGxhbmd1YWdlTWFuYWdlciA9IExhbmd1YWdlTWFuYWdlcigpO1xuXG4gIGxhbmd1YWdlTWFuYWdlci5pbml0aWFsaXplKGluaXRQYXJhbXNbJ2xhbmcnXSB8fCAnZW4nKTtcblxuICBjb25zdCBsaXN0TWFuYWdlciA9IExpc3RNYW5hZ2VyKCk7XG5cbiAgaWYoaW5pdFBhcmFtcy5sYXQgJiYgaW5pdFBhcmFtcy5sbmcpIHtcbiAgICBtYXBNYW5hZ2VyLnNldENlbnRlcihbaW5pdFBhcmFtcy5sYXQsIGluaXRQYXJhbXMubG5nXSk7XG4gIH1cblxuICAvKioqXG4gICogTGlzdCBFdmVudHNcbiAgKiBUaGlzIHdpbGwgdHJpZ2dlciB0aGUgbGlzdCB1cGRhdGUgbWV0aG9kXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgbGlzdE1hbmFnZXIucG9wdWxhdGVMaXN0KG9wdGlvbnMucGFyYW1zKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgbGlzdE1hbmFnZXIudXBkYXRlRmlsdGVyKG9wdGlvbnMpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlci1ieS1ib3VuZCcsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxldCBib3VuZDEsIGJvdW5kMjtcblxuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICBbYm91bmQxLCBib3VuZDJdID0gbWFwTWFuYWdlci5nZXRCb3VuZHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgICBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcbiAgICB9XG5cblxuXG4gICAgbGlzdE1hbmFnZXIudXBkYXRlQm91bmRzKGJvdW5kMSwgYm91bmQyKVxuICB9KVxuXG4gIC8qKipcbiAgKiBNYXAgRXZlbnRzXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICAvLyBtYXBNYW5hZ2VyLnNldENlbnRlcihbb3B0aW9ucy5sYXQsIG9wdGlvbnMubG5nXSk7XG4gICAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLmJvdW5kMSB8fCAhb3B0aW9ucy5ib3VuZDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgdmFyIGJvdW5kMiA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDIpO1xuICAgIG1hcE1hbmFnZXIuc2V0Qm91bmRzKGJvdW5kMSwgYm91bmQyKTtcbiAgICAvLyBjb25zb2xlLmxvZyhvcHRpb25zKVxuICB9KTtcbiAgLy8gMy4gbWFya2VycyBvbiBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXBsb3QnLCAoZSwgb3B0KSA9PiB7XG5cbiAgICBtYXBNYW5hZ2VyLnBsb3RQb2ludHMob3B0LmRhdGEsIG9wdC5wYXJhbXMpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicpO1xuICB9KVxuXG4gIC8vIEZpbHRlciBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLWZpbHRlcicsIChlLCBvcHQpID0+IHtcbiAgICBpZiAob3B0KSB7XG4gICAgICBtYXBNYW5hZ2VyLmZpbHRlck1hcChvcHQuZmlsdGVyKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZScsIChlLCBvcHQpID0+IHtcbiAgICBpZiAob3B0KSB7XG4gICAgICBsYW5ndWFnZU1hbmFnZXIudXBkYXRlTGFuZ3VhZ2Uob3B0LmxhbmcpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbiNzaG93LWhpZGUtbWFwJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ2JvZHknKS50b2dnbGVDbGFzcygnbWFwLXZpZXcnKVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uLmJ0bi5tb3JlLWl0ZW1zJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJyNlbWJlZC1hcmVhJykudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgLy91cGRhdGUgZW1iZWQgbGluZVxuICAgIHZhciBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHQpKTtcbiAgICBkZWxldGUgY29weVsnbG5nJ107XG4gICAgZGVsZXRlIGNvcHlbJ2xhdCddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDEnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQyJ107XG5cbiAgICAkKCcjZW1iZWQtYXJlYSBpbnB1dFtuYW1lPWVtYmVkXScpLnZhbCgnaHR0cHM6Ly9uZXctbWFwLjM1MC5vcmcjJyArICQucGFyYW0oY29weSkpO1xuICB9KTtcblxuICAkKHdpbmRvdykub24oXCJyZXNpemVcIiwgKGUpID0+IHtcbiAgICBtYXBNYW5hZ2VyLnJlZnJlc2hNYXAoKTtcbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKFwiaGFzaGNoYW5nZVwiLCAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgaWYgKGhhc2gubGVuZ3RoID09IDApIHJldHVybjtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKGhhc2guc3Vic3RyaW5nKDEpKTtcbiAgICBjb25zdCBvbGRVUkwgPSBldmVudC5vcmlnaW5hbEV2ZW50Lm9sZFVSTDtcblxuXG4gICAgY29uc3Qgb2xkSGFzaCA9ICQuZGVwYXJhbShvbGRVUkwuc3Vic3RyaW5nKG9sZFVSTC5zZWFyY2goXCIjXCIpKzEpKTtcblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcblxuICAgIC8vIFNvIHRoYXQgY2hhbmdlIGluIGZpbHRlcnMgd2lsbCBub3QgdXBkYXRlIHRoaXNcbiAgICBpZiAob2xkSGFzaC5ib3VuZDEgIT09IHBhcmFtZXRlcnMuYm91bmQxIHx8IG9sZEhhc2guYm91bmQyICE9PSBwYXJhbWV0ZXJzLmJvdW5kMikge1xuXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG5cbiAgICAvLyBDaGFuZ2UgaXRlbXNcbiAgICBpZiAob2xkSGFzaC5sYW5nICE9PSBwYXJhbWV0ZXJzLmxhbmcpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgfVxuICB9KVxuXG4gIC8vIDQuIGZpbHRlciBvdXQgaXRlbXMgaW4gYWN0aXZpdHktYXJlYVxuXG4gIC8vIDUuIGdldCBtYXAgZWxlbWVudHNcblxuICAvLyA2LiBnZXQgR3JvdXAgZGF0YVxuXG4gIC8vIDcuIHByZXNlbnQgZ3JvdXAgZWxlbWVudHNcblxuICAkLmFqYXgoe1xuICAgIHVybDogJ2h0dHBzOi8vbmV3LW1hcC4zNTAub3JnL291dHB1dC8zNTBvcmcuanMuZ3onLCAvLyd8KipEQVRBX1NPVVJDRSoqfCcsXG4gICAgZGF0YVR5cGU6ICdzY3JpcHQnLFxuICAgIGNhY2hlOiB0cnVlLFxuICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICB2YXIgcGFyYW1ldGVycyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG5cbiAgICAgIHdpbmRvdy5FVkVOVFNfREFUQS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIGl0ZW1bJ2V2ZW50X3R5cGUnXSA9ICFpdGVtLmV2ZW50X3R5cGUgPyAnQWN0aW9uJyA6IGl0ZW0uZXZlbnRfdHlwZTtcbiAgICAgIH0pXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtdXBkYXRlJywgeyBwYXJhbXM6IHBhcmFtZXRlcnMgfSk7XG4gICAgICAvLyAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtcGxvdCcsIHsgZGF0YTogd2luZG93LkVWRU5UU19EQVRBLCBwYXJhbXM6IHBhcmFtZXRlcnMgfSk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuICAgICAgLy9UT0RPOiBNYWtlIHRoZSBnZW9qc29uIGNvbnZlcnNpb24gaGFwcGVuIG9uIHRoZSBiYWNrZW5kXG5cbiAgICAgIC8vUmVmcmVzaCB0aGluZ3NcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBsZXQgcCA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHApO1xuICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCBwKTtcbiAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwKTtcbiAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci1ieS1ib3VuZCcsIHApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCkpXG4gICAgICB9LCAxMDApO1xuICAgIH1cbiAgfSk7XG5cblxuXG59KShqUXVlcnkpO1xuIl19
