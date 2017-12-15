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
      var url = item.website.match(/^https{0,1}:/) ? item.website : "//" + item.website;
      return "\n      <li class='" + item.event_type + " group-obj' data-lat='" + item.lat + "' data-lng='" + item.lng + "'>\n        <div class=\"type-group group-obj\">\n          <ul class=\"event-types-list\">\n            <li class=\"tag tag-" + item.supergroup + "\">" + item.supergroup + "</li>\n          </ul>\n          <h2><a href=\"" + url + "\" target='_blank'>" + item.name + "</a></h2>\n          <div class=\"group-details-area\">\n            <div class=\"group-location location\">" + item.location + "</div>\n            <div class=\"group-description\">\n              <p>" + item.description + "</p>\n            </div>\n          </div>\n          <div class=\"call-to-action\">\n            <a href=\"" + url + "\" target='_blank' class=\"btn btn-secondary\">Get Involved</a>\n          </div>\n        </div>\n      </li>\n      ";
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

    var url = item.website.match(/^https{0,1}:/) ? item.website : "//" + item.website;
    return "\n    <li>\n      <div class=\"type-group group-obj\">\n        <ul class=\"event-types-list\">\n          <li class=\"tag tag-" + item.supergroup + "\">" + item.supergroup + "</li>\n        </ul>\n        <h2><a href=\"" + url + "\" target='_blank'>" + item.name + "</a></h2>\n        <div class=\"group-details-area\">\n          <div class=\"group-location location\">" + item.location + "</div>\n          <div class=\"group-description\">\n            <p>" + item.description + "</p>\n          </div>\n        </div>\n        <div class=\"call-to-action\">\n          <a href=\"" + url + "\" target='_blank' class=\"btn btn-secondary\">Get Involved</a>\n        </div>\n      </div>\n    </li>\n    ";
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
    map.scrollWheelZoom.disable();
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
            //
            var eventType = feature.properties.eventProperties.event_type;
            var geojsonMarkerOptions = {
              radius: 8,
              fillColor: eventType && eventType.toLowerCase() === 'group' ? "#40D7D4" : "#0F81E8",
              color: "white",
              weight: 2,
              opacity: 0.5,
              fillOpacity: 0.8,
              className: (eventType && eventType.toLowerCase() === 'group' ? 'groups' : 'events') + ' event-item-popup'
            };
            return L.circleMarker(latlng, geojsonMarkerOptions);
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
    url: '//new-map.350.org/output/350org.js.gz', //'|**DATA_SOURCE**|',
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9sYW5ndWFnZS5qcyIsImNsYXNzZXMvbGlzdC5qcyIsImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9xdWVyeS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJBdXRvY29tcGxldGVNYW5hZ2VyIiwiJCIsInRhcmdldCIsIkFQSV9LRVkiLCJ0YXJnZXRJdGVtIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwicXVlcnlNZ3IiLCJRdWVyeU1hbmFnZXIiLCJnZW9jb2RlciIsImdvb2dsZSIsIm1hcHMiLCJHZW9jb2RlciIsIiR0YXJnZXQiLCJpbml0aWFsaXplIiwidHlwZWFoZWFkIiwiaGludCIsImhpZ2hsaWdodCIsIm1pbkxlbmd0aCIsImNsYXNzTmFtZXMiLCJtZW51IiwibmFtZSIsImRpc3BsYXkiLCJpdGVtIiwiZm9ybWF0dGVkX2FkZHJlc3MiLCJsaW1pdCIsInNvdXJjZSIsInEiLCJzeW5jIiwiYXN5bmMiLCJnZW9jb2RlIiwiYWRkcmVzcyIsInJlc3VsdHMiLCJzdGF0dXMiLCJvbiIsIm9iaiIsImRhdHVtIiwiZ2VvbWV0cnkiLCJ1cGRhdGVWaWV3cG9ydCIsInZpZXdwb3J0IiwialF1ZXJ5IiwiTGFuZ3VhZ2VNYW5hZ2VyIiwibGFuZ3VhZ2UiLCJkaWN0aW9uYXJ5IiwiJHRhcmdldHMiLCJ1cGRhdGVQYWdlTGFuZ3VhZ2UiLCJ0YXJnZXRMYW5ndWFnZSIsInJvd3MiLCJmaWx0ZXIiLCJpIiwibGFuZyIsImVhY2giLCJpbmRleCIsInRhcmdldEF0dHJpYnV0ZSIsImRhdGEiLCJsYW5nVGFyZ2V0IiwidGV4dCIsInZhbCIsImF0dHIiLCJ0YXJnZXRzIiwiYWpheCIsInVybCIsImRhdGFUeXBlIiwic3VjY2VzcyIsInVwZGF0ZUxhbmd1YWdlIiwiTGlzdE1hbmFnZXIiLCJ0YXJnZXRMaXN0IiwicmVuZGVyRXZlbnQiLCJkYXRlIiwibW9tZW50IiwiRGF0ZSIsInN0YXJ0X2RhdGV0aW1lIiwidG9HTVRTdHJpbmciLCJmb3JtYXQiLCJtYXRjaCIsImV2ZW50X3R5cGUiLCJsYXQiLCJsbmciLCJ0aXRsZSIsInZlbnVlIiwicmVuZGVyR3JvdXAiLCJ3ZWJzaXRlIiwic3VwZXJncm91cCIsImxvY2F0aW9uIiwiZGVzY3JpcHRpb24iLCIkbGlzdCIsInVwZGF0ZUZpbHRlciIsInAiLCJyZW1vdmVQcm9wIiwiYWRkQ2xhc3MiLCJqb2luIiwidXBkYXRlQm91bmRzIiwiYm91bmQxIiwiYm91bmQyIiwiZmluZCIsImluZCIsIl9sYXQiLCJfbG5nIiwicmVtb3ZlQ2xhc3MiLCJwb3B1bGF0ZUxpc3QiLCJoYXJkRmlsdGVycyIsImtleVNldCIsImtleSIsInNwbGl0IiwiJGV2ZW50TGlzdCIsIndpbmRvdyIsIkVWRU5UU19EQVRBIiwibWFwIiwibGVuZ3RoIiwidG9Mb3dlckNhc2UiLCJpbmNsdWRlcyIsInJlbW92ZSIsImFwcGVuZCIsIk1hcE1hbmFnZXIiLCJMQU5HVUFHRSIsInJlbmRlckdlb2pzb24iLCJsaXN0IiwicmVuZGVyZWQiLCJpc05hTiIsInBhcnNlRmxvYXQiLCJzdWJzdHJpbmciLCJ0eXBlIiwiY29vcmRpbmF0ZXMiLCJwcm9wZXJ0aWVzIiwiZXZlbnRQcm9wZXJ0aWVzIiwicG9wdXBDb250ZW50Iiwib3B0aW9ucyIsImFjY2Vzc1Rva2VuIiwiTCIsImRyYWdnaW5nIiwiQnJvd3NlciIsIm1vYmlsZSIsInNldFZpZXciLCJzY3JvbGxXaGVlbFpvb20iLCJkaXNhYmxlIiwib25Nb3ZlIiwiZXZlbnQiLCJzdyIsImdldEJvdW5kcyIsIl9zb3V0aFdlc3QiLCJuZSIsIl9ub3J0aEVhc3QiLCJ0aWxlTGF5ZXIiLCJhdHRyaWJ1dGlvbiIsImFkZFRvIiwiJG1hcCIsImNhbGxiYWNrIiwic2V0Qm91bmRzIiwiYm91bmRzMSIsImJvdW5kczIiLCJib3VuZHMiLCJmaXRCb3VuZHMiLCJzZXRDZW50ZXIiLCJjZW50ZXIiLCJ6b29tIiwiZ2V0Q2VudGVyQnlMb2NhdGlvbiIsInJlZnJlc2hNYXAiLCJpbnZhbGlkYXRlU2l6ZSIsImZpbHRlck1hcCIsImZpbHRlcnMiLCJoaWRlIiwiZm9yRWFjaCIsInNob3ciLCJwbG90UG9pbnRzIiwiZ2VvanNvbiIsImZlYXR1cmVzIiwiZ2VvSlNPTiIsInBvaW50VG9MYXllciIsImZlYXR1cmUiLCJsYXRsbmciLCJldmVudFR5cGUiLCJnZW9qc29uTWFya2VyT3B0aW9ucyIsInJhZGl1cyIsImZpbGxDb2xvciIsImNvbG9yIiwid2VpZ2h0Iiwib3BhY2l0eSIsImZpbGxPcGFjaXR5IiwiY2xhc3NOYW1lIiwiY2lyY2xlTWFya2VyIiwib25FYWNoRmVhdHVyZSIsImxheWVyIiwiYmluZFBvcHVwIiwidXBkYXRlIiwibGF0TG5nIiwidGFyZ2V0Rm9ybSIsInByZXZpb3VzIiwiZSIsInByZXZlbnREZWZhdWx0IiwiZm9ybSIsImRlcGFyYW0iLCJzZXJpYWxpemUiLCJoYXNoIiwicGFyYW0iLCJ0cmlnZ2VyIiwicGFyYW1zIiwibG9jIiwicHJvcCIsImdldFBhcmFtZXRlcnMiLCJwYXJhbWV0ZXJzIiwidXBkYXRlTG9jYXRpb24iLCJmIiwiYiIsIkpTT04iLCJzdHJpbmdpZnkiLCJ1cGRhdGVWaWV3cG9ydEJ5Qm91bmQiLCJ0cmlnZ2VyU3VibWl0IiwiYXV0b2NvbXBsZXRlTWFuYWdlciIsIm1hcE1hbmFnZXIiLCJxdWVyeU1hbmFnZXIiLCJpbml0UGFyYW1zIiwiaW5pdGlhbGl6ZUF1dG9jb21wbGV0ZUNhbGxiYWNrIiwicmVzdWx0IiwibGFuZ3VhZ2VNYW5hZ2VyIiwibGlzdE1hbmFnZXIiLCJwYXJzZSIsIm9wdCIsInRvZ2dsZUNsYXNzIiwiY29weSIsIm9sZFVSTCIsIm9yaWdpbmFsRXZlbnQiLCJvbGRIYXNoIiwic2VhcmNoIiwiY2FjaGUiLCJzZXRUaW1lb3V0Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOztBQUNBLElBQU1BLHNCQUF1QixVQUFTQyxDQUFULEVBQVk7QUFDdkM7O0FBRUEsU0FBTyxVQUFDQyxNQUFELEVBQVk7O0FBRWpCLFFBQU1DLFVBQVUseUNB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ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuLy9BUEkgOkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVxuY29uc3QgQXV0b2NvbXBsZXRlTWFuYWdlciA9IChmdW5jdGlvbigkKSB7XG4gIC8vSW5pdGlhbGl6YXRpb24uLi5cblxuICByZXR1cm4gKHRhcmdldCkgPT4ge1xuXG4gICAgY29uc3QgQVBJX0tFWSA9IFwiQUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXCI7XG4gICAgY29uc3QgdGFyZ2V0SXRlbSA9IHR5cGVvZiB0YXJnZXQgPT0gXCJzdHJpbmdcIiA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KSA6IHRhcmdldDtcbiAgICBjb25zdCBxdWVyeU1nciA9IFF1ZXJ5TWFuYWdlcigpO1xuICAgIHZhciBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICR0YXJnZXQ6ICQodGFyZ2V0SXRlbSksXG4gICAgICB0YXJnZXQ6IHRhcmdldEl0ZW0sXG4gICAgICBpbml0aWFsaXplOiAoKSA9PiB7XG4gICAgICAgICQodGFyZ2V0SXRlbSkudHlwZWFoZWFkKHtcbiAgICAgICAgICAgICAgICAgICAgaGludDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBtaW5MZW5ndGg6IDQsXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICBtZW51OiAndHQtZHJvcGRvd24tbWVudSdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3NlYXJjaC1yZXN1bHRzJyxcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogKGl0ZW0pID0+IGl0ZW0uZm9ybWF0dGVkX2FkZHJlc3MsXG4gICAgICAgICAgICAgICAgICAgIGxpbWl0OiAxMCxcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiBmdW5jdGlvbiAocSwgc3luYywgYXN5bmMpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IHEgfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBhc3luYyhyZXN1bHRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKS5vbigndHlwZWFoZWFkOnNlbGVjdGVkJywgZnVuY3Rpb24gKG9iaiwgZGF0dW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoZGF0dW0pXG4gICAgICAgICAgICAgICAgICAgIHtcblxuICAgICAgICAgICAgICAgICAgICAgIHZhciBnZW9tZXRyeSA9IGRhdHVtLmdlb21ldHJ5O1xuICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5TWdyLnVwZGF0ZVZpZXdwb3J0KGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICAgICAgICAgICAvLyAgbWFwLmZpdEJvdW5kcyhnZW9tZXRyeS5ib3VuZHM/IGdlb21ldHJ5LmJvdW5kcyA6IGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuXG5cbiAgICByZXR1cm4ge1xuXG4gICAgfVxuICB9XG5cbn0oalF1ZXJ5KSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IExhbmd1YWdlTWFuYWdlciA9ICgoJCkgPT4ge1xuICAvL2tleVZhbHVlXG5cbiAgLy90YXJnZXRzIGFyZSB0aGUgbWFwcGluZ3MgZm9yIHRoZSBsYW5ndWFnZVxuICByZXR1cm4gKCkgPT4ge1xuICAgIGxldCBsYW5ndWFnZTtcbiAgICBsZXQgZGljdGlvbmFyeSA9IHt9O1xuICAgIGxldCAkdGFyZ2V0cyA9ICQoXCJbZGF0YS1sYW5nLXRhcmdldF1bZGF0YS1sYW5nLWtleV1cIik7XG5cbiAgICBjb25zdCB1cGRhdGVQYWdlTGFuZ3VhZ2UgPSAoKSA9PiB7XG5cbiAgICAgIGxldCB0YXJnZXRMYW5ndWFnZSA9IGRpY3Rpb25hcnkucm93cy5maWx0ZXIoKGkpID0+IGkubGFuZyA9PT0gbGFuZ3VhZ2UpWzBdO1xuXG4gICAgICAkdGFyZ2V0cy5lYWNoKChpbmRleCwgaXRlbSkgPT4ge1xuICAgICAgICBsZXQgdGFyZ2V0QXR0cmlidXRlID0gJChpdGVtKS5kYXRhKCdsYW5nLXRhcmdldCcpO1xuICAgICAgICBsZXQgbGFuZ1RhcmdldCA9ICQoaXRlbSkuZGF0YSgnbGFuZy1rZXknKTtcblxuICAgICAgICBzd2l0Y2godGFyZ2V0QXR0cmlidXRlKSB7XG4gICAgICAgICAgY2FzZSAndGV4dCc6XG4gICAgICAgICAgICAkKGl0ZW0pLnRleHQodGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAndmFsdWUnOlxuICAgICAgICAgICAgJChpdGVtKS52YWwodGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICQoaXRlbSkuYXR0cih0YXJnZXRBdHRyaWJ1dGUsIHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgbGFuZ3VhZ2UsXG4gICAgICB0YXJnZXRzOiAkdGFyZ2V0cyxcbiAgICAgIGRpY3Rpb25hcnksXG4gICAgICBpbml0aWFsaXplOiAobGFuZykgPT4ge1xuXG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgLy8gdXJsOiAnaHR0cHM6Ly9nc3gyanNvbi5jb20vYXBpP2lkPTFPM2VCeWpMMXZsWWY3WjdhbS1faHRSVFFpNzNQYWZxSWZOQmRMbVhlOFNNJnNoZWV0PTEnLFxuICAgICAgICAgIHVybDogJy9kYXRhL2xhbmcuanNvbicsXG4gICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgZGljdGlvbmFyeSA9IGRhdGE7XG4gICAgICAgICAgICBsYW5ndWFnZSA9IGxhbmc7XG4gICAgICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZUxhbmd1YWdlOiAobGFuZykgPT4ge1xuXG4gICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgdXBkYXRlUGFnZUxhbmd1YWdlKCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG59KShqUXVlcnkpO1xuIiwiLyogVGhpcyBsb2FkcyBhbmQgbWFuYWdlcyB0aGUgbGlzdCEgKi9cblxuY29uc3QgTGlzdE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRMaXN0ID0gXCIjZXZlbnRzLWxpc3RcIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0TGlzdCA9PT0gJ3N0cmluZycgPyAkKHRhcmdldExpc3QpIDogdGFyZ2V0TGlzdDtcblxuICAgIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0pID0+IHtcblxuICAgICAgdmFyIGRhdGUgPSBtb21lbnQobmV3IERhdGUoaXRlbS5zdGFydF9kYXRldGltZSkudG9HTVRTdHJpbmcoKSkuZm9ybWF0KFwiZGRkZCBNTU0gREQsIGg6bW1hXCIpO1xuICAgICAgbGV0IHVybCA9IGl0ZW0udXJsLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0udXJsIDogXCIvL1wiICsgaXRlbS51cmw7XG4gICAgICByZXR1cm4gYFxuICAgICAgPGxpIGNsYXNzPScke2l0ZW0uZXZlbnRfdHlwZX0gZXZlbnQtb2JqJyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50IHR5cGUtYWN0aW9uXCI+XG4gICAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgICAgPGxpIGNsYXNzPSd0YWctJHtpdGVtLmV2ZW50X3R5cGV9IHRhZyc+JHtpdGVtLmV2ZW50X3R5cGV9PC9saT5cbiAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDxoMiBjbGFzcz1cImV2ZW50LXRpdGxlXCI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWRhdGUgZGF0ZVwiPiR7ZGF0ZX08L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtYWRkcmVzcyBhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICAgIDxwPiR7aXRlbS52ZW51ZX08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5SU1ZQPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIGNvbnN0IHJlbmRlckdyb3VwID0gKGl0ZW0pID0+IHtcbiAgICAgIGxldCB1cmwgPSBpdGVtLndlYnNpdGUubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS53ZWJzaXRlIDogXCIvL1wiICsgaXRlbS53ZWJzaXRlO1xuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaSBjbGFzcz0nJHtpdGVtLmV2ZW50X3R5cGV9IGdyb3VwLW9iaicgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ncm91cCBncm91cC1vYmpcIj5cbiAgICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5zdXBlcmdyb3VwfVwiPiR7aXRlbS5zdXBlcmdyb3VwfTwvbGk+XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0ubmFtZX08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtbG9jYXRpb24gbG9jYXRpb25cIj4ke2l0ZW0ubG9jYXRpb259PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGVzY3JpcHRpb25cIj5cbiAgICAgICAgICAgICAgPHA+JHtpdGVtLmRlc2NyaXB0aW9ufTwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+R2V0IEludm9sdmVkPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAkbGlzdDogJHRhcmdldCxcbiAgICAgIHVwZGF0ZUZpbHRlcjogKHApID0+IHtcbiAgICAgICAgaWYoIXApIHJldHVybjtcblxuICAgICAgICAvLyBSZW1vdmUgRmlsdGVyc1xuXG4gICAgICAgICR0YXJnZXQucmVtb3ZlUHJvcChcImNsYXNzXCIpO1xuICAgICAgICAkdGFyZ2V0LmFkZENsYXNzKHAuZmlsdGVyID8gcC5maWx0ZXIuam9pbihcIiBcIikgOiAnJylcbiAgICAgIH0sXG4gICAgICB1cGRhdGVCb3VuZHM6IChib3VuZDEsIGJvdW5kMikgPT4ge1xuXG4gICAgICAgIC8vIGNvbnN0IGJvdW5kcyA9IFtwLmJvdW5kczEsIHAuYm91bmRzMl07XG5cblxuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsIGxpLmV2ZW50LW9iaiwgdWwgbGkuZ3JvdXAtb2JqJykuZWFjaCgoaW5kLCBpdGVtKT0+IHtcblxuICAgICAgICAgIGxldCBfbGF0ID0gJChpdGVtKS5kYXRhKCdsYXQnKSxcbiAgICAgICAgICAgICAgX2xuZyA9ICQoaXRlbSkuZGF0YSgnbG5nJyk7XG5cbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInVwZGF0ZUJvdW5kc1wiLCBpdGVtKVxuICAgICAgICAgIGlmIChib3VuZDFbMF0gPD0gX2xhdCAmJiBib3VuZDJbMF0gPj0gX2xhdCAmJiBib3VuZDFbMV0gPD0gX2xuZyAmJiBib3VuZDJbMV0gPj0gX2xuZykge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJBZGRpbmcgYm91bmRzXCIpO1xuICAgICAgICAgICAgJChpdGVtKS5hZGRDbGFzcygnd2l0aGluLWJvdW5kJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoaXRlbSkucmVtb3ZlQ2xhc3MoJ3dpdGhpbi1ib3VuZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgcG9wdWxhdGVMaXN0OiAoaGFyZEZpbHRlcnMpID0+IHtcbiAgICAgICAgLy91c2luZyB3aW5kb3cuRVZFTlRfREFUQVxuICAgICAgICBjb25zdCBrZXlTZXQgPSAhaGFyZEZpbHRlcnMua2V5ID8gW10gOiBoYXJkRmlsdGVycy5rZXkuc3BsaXQoJywnKTtcblxuICAgICAgICB2YXIgJGV2ZW50TGlzdCA9IHdpbmRvdy5FVkVOVFNfREFUQS5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgaWYgKGtleVNldC5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0uZXZlbnRfdHlwZSAmJiBpdGVtLmV2ZW50X3R5cGUudG9Mb3dlckNhc2UoKSA9PSAnZ3JvdXAnID8gcmVuZGVyR3JvdXAoaXRlbSkgOiByZW5kZXJFdmVudChpdGVtKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtleVNldC5sZW5ndGggPiAwICYmIGl0ZW0uZXZlbnRfdHlwZSAhPSAnZ3JvdXAnICYmIGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyRXZlbnQoaXRlbSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXlTZXQubGVuZ3RoID4gMCAmJiBpdGVtLmV2ZW50X3R5cGUgPT0gJ2dyb3VwJyAmJiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5zdXBlcmdyb3VwKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlbmRlckdyb3VwKGl0ZW0pXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgfSlcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCBsaScpLnJlbW92ZSgpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsJykuYXBwZW5kKCRldmVudExpc3QpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJcbmNvbnN0IE1hcE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgbGV0IExBTkdVQUdFID0gJ2VuJztcblxuICBjb25zdCByZW5kZXJFdmVudCA9IChpdGVtKSA9PiB7XG4gICAgdmFyIGRhdGUgPSBtb21lbnQoaXRlbS5zdGFydF9kYXRldGltZSkuZm9ybWF0KFwiZGRkZCBNTU0gREQsIGg6bW1hXCIpO1xuICAgIGxldCB1cmwgPSBpdGVtLnVybC5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLnVybCA6IFwiLy9cIiArIGl0ZW0udXJsO1xuICAgIHJldHVybiBgXG4gICAgPGRpdiBjbGFzcz0ncG9wdXAtaXRlbSAke2l0ZW0uZXZlbnRfdHlwZX0nIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5ldmVudF90eXBlfVwiPiR7aXRlbS5ldmVudF90eXBlIHx8ICdBY3Rpb24nfTwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxoMiBjbGFzcz1cImV2ZW50LXRpdGxlXCI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1kYXRlXCI+JHtkYXRlfTwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtYWRkcmVzcyBhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+UlNWUDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSkgPT4ge1xuXG4gICAgbGV0IHVybCA9IGl0ZW0ud2Vic2l0ZS5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLndlYnNpdGUgOiBcIi8vXCIgKyBpdGVtLndlYnNpdGU7XG4gICAgcmV0dXJuIGBcbiAgICA8bGk+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ncm91cCBncm91cC1vYmpcIj5cbiAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctJHtpdGVtLnN1cGVyZ3JvdXB9XCI+JHtpdGVtLnN1cGVyZ3JvdXB9PC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPGgyPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLm5hbWV9PC9hPjwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtbG9jYXRpb24gbG9jYXRpb25cIj4ke2l0ZW0ubG9jYXRpb259PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICA8cD4ke2l0ZW0uZGVzY3JpcHRpb259PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+R2V0IEludm9sdmVkPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvbGk+XG4gICAgYFxuICB9O1xuXG4gIGNvbnN0IHJlbmRlckdlb2pzb24gPSAobGlzdCkgPT4ge1xuICAgIHJldHVybiBsaXN0Lm1hcCgoaXRlbSkgPT4ge1xuICAgICAgLy8gcmVuZGVyZWQgZXZlbnRUeXBlXG4gICAgICBsZXQgcmVuZGVyZWQ7XG5cbiAgICAgIGlmIChpdGVtLmV2ZW50X3R5cGUgJiYgaXRlbS5ldmVudF90eXBlLnRvTG93ZXJDYXNlKCkgPT0gJ2dyb3VwJykge1xuICAgICAgICByZW5kZXJlZCA9IHJlbmRlckdyb3VwKGl0ZW0pO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZW5kZXJlZCA9IHJlbmRlckV2ZW50KGl0ZW0pO1xuICAgICAgfVxuXG4gICAgICAvLyBmb3JtYXQgY2hlY2tcbiAgICAgIGlmIChpc05hTihwYXJzZUZsb2F0KHBhcnNlRmxvYXQoaXRlbS5sbmcpKSkpIHtcbiAgICAgICAgaXRlbS5sbmcgPSBpdGVtLmxuZy5zdWJzdHJpbmcoMSlcbiAgICAgIH1cbiAgICAgIGlmIChpc05hTihwYXJzZUZsb2F0KHBhcnNlRmxvYXQoaXRlbS5sYXQpKSkpIHtcbiAgICAgICAgaXRlbS5sYXQgPSBpdGVtLmxhdC5zdWJzdHJpbmcoMSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgIHR5cGU6IFwiUG9pbnRcIixcbiAgICAgICAgICBjb29yZGluYXRlczogW2l0ZW0ubG5nLCBpdGVtLmxhdF1cbiAgICAgICAgfSxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIGV2ZW50UHJvcGVydGllczogaXRlbSxcbiAgICAgICAgICBwb3B1cENvbnRlbnQ6IHJlbmRlcmVkXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIChvcHRpb25zKSA9PiB7XG4gICAgdmFyIGFjY2Vzc1Rva2VuID0gJ3BrLmV5SjFJam9pYldGMGRHaGxkek0xTUNJc0ltRWlPaUphVFZGTVVrVXdJbjAud2NNM1hjOEJHQzZQTS1PeXJ3am5oZyc7XG4gICAgdmFyIG1hcCA9IEwubWFwKCdtYXAnLCB7IGRyYWdnaW5nOiAhTC5Ccm93c2VyLm1vYmlsZSB9KS5zZXRWaWV3KFszNC44ODU5MzA5NDA3NTMxNywgNS4wOTc2NTYyNTAwMDAwMDFdLCAyKTtcbiAgICAgICAgbWFwLnNjcm9sbFdoZWVsWm9vbS5kaXNhYmxlKCk7XG4gICAgTEFOR1VBR0UgPSBvcHRpb25zLmxhbmcgfHwgJ2VuJztcblxuICAgIGlmIChvcHRpb25zLm9uTW92ZSkge1xuICAgICAgbWFwLm9uKCdkcmFnZW5kJywgKGV2ZW50KSA9PiB7XG5cblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuICAgICAgICBvcHRpb25zLm9uTW92ZShzdywgbmUpO1xuICAgICAgfSkub24oJ3pvb21lbmQnLCAoZXZlbnQpID0+IHtcblxuXG4gICAgICAgIGxldCBzdyA9IFttYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxuZ107XG4gICAgICAgIGxldCBuZSA9IFttYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxuZ107XG4gICAgICAgIG9wdGlvbnMub25Nb3ZlKHN3LCBuZSk7XG4gICAgICB9KVxuICAgIH1cblxuICAgIEwudGlsZUxheWVyKCdodHRwczovL2FwaS5tYXBib3guY29tL3N0eWxlcy92MS9tYXR0aGV3MzUwL2NqYTQxdGlqazI3ZDYycnFvZDdnMGx4NGIvdGlsZXMvMjU2L3t6fS97eH0ve3l9P2FjY2Vzc190b2tlbj0nICsgYWNjZXNzVG9rZW4sIHtcbiAgICAgICAgYXR0cmlidXRpb246ICcmY29weTsgPGEgaHJlZj1cImh0dHA6Ly9vc20ub3JnL2NvcHlyaWdodFwiPk9wZW5TdHJlZXRNYXA8L2E+IGNvbnRyaWJ1dG9ycyDigKIgPGEgaHJlZj1cIi8vMzUwLm9yZ1wiPjM1MC5vcmc8L2E+J1xuICAgIH0pLmFkZFRvKG1hcCk7XG5cbiAgICBsZXQgZ2VvY29kZXIgPSBudWxsO1xuICAgIHJldHVybiB7XG4gICAgICAkbWFwOiBtYXAsXG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHNldEJvdW5kczogKGJvdW5kczEsIGJvdW5kczIpID0+IHtcbiAgICAgICAgY29uc3QgYm91bmRzID0gW2JvdW5kczEsIGJvdW5kczJdO1xuICAgICAgICBtYXAuZml0Qm91bmRzKGJvdW5kcyk7XG4gICAgICB9LFxuICAgICAgc2V0Q2VudGVyOiAoY2VudGVyLCB6b29tID0gMTApID0+IHtcbiAgICAgICAgaWYgKCFjZW50ZXIgfHwgIWNlbnRlclswXSB8fCBjZW50ZXJbMF0gPT0gXCJcIlxuICAgICAgICAgICAgICB8fCAhY2VudGVyWzFdIHx8IGNlbnRlclsxXSA9PSBcIlwiKSByZXR1cm47XG4gICAgICAgIG1hcC5zZXRWaWV3KGNlbnRlciwgem9vbSk7XG4gICAgICB9LFxuICAgICAgZ2V0Qm91bmRzOiAoKSA9PiB7XG5cbiAgICAgICAgbGV0IHN3ID0gW21hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW21hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubG5nXTtcblxuICAgICAgICByZXR1cm4gW3N3LCBuZV07XG4gICAgICB9LFxuICAgICAgLy8gQ2VudGVyIGxvY2F0aW9uIGJ5IGdlb2NvZGVkXG4gICAgICBnZXRDZW50ZXJCeUxvY2F0aW9uOiAobG9jYXRpb24sIGNhbGxiYWNrKSA9PiB7XG5cbiAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IGxvY2F0aW9uIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcblxuICAgICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlc3VsdHNbMF0pXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICByZWZyZXNoTWFwOiAoKSA9PiB7XG4gICAgICAgIG1hcC5pbnZhbGlkYXRlU2l6ZShmYWxzZSk7XG4gICAgICAgIC8vIG1hcC5fb25SZXNpemUoKTtcblxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIm1hcCBpcyByZXNpemVkXCIpXG4gICAgICB9LFxuICAgICAgZmlsdGVyTWFwOiAoZmlsdGVycykgPT4ge1xuXG4gICAgICAgICQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cFwiKS5oaWRlKCk7XG5cblxuICAgICAgICBpZiAoIWZpbHRlcnMpIHJldHVybjtcblxuICAgICAgICBmaWx0ZXJzLmZvckVhY2goKGl0ZW0pID0+IHtcblxuICAgICAgICAgICQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cC5cIiArIGl0ZW0udG9Mb3dlckNhc2UoKSkuc2hvdygpO1xuICAgICAgICB9KVxuICAgICAgfSxcbiAgICAgIHBsb3RQb2ludHM6IChsaXN0LCBoYXJkRmlsdGVycykgPT4ge1xuXG4gICAgICAgIGNvbnN0IGtleVNldCA9ICFoYXJkRmlsdGVycy5rZXkgPyBbXSA6IGhhcmRGaWx0ZXJzLmtleS5zcGxpdCgnLCcpO1xuXG4gICAgICAgIGlmIChrZXlTZXQubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGxpc3QgPSBsaXN0LmZpbHRlcigoaXRlbSkgPT4ga2V5U2V0LmluY2x1ZGVzKGl0ZW0uZXZlbnRfdHlwZSkpXG4gICAgICAgIH1cblxuXG4gICAgICAgIGNvbnN0IGdlb2pzb24gPSB7XG4gICAgICAgICAgdHlwZTogXCJGZWF0dXJlQ29sbGVjdGlvblwiLFxuICAgICAgICAgIGZlYXR1cmVzOiByZW5kZXJHZW9qc29uKGxpc3QpXG4gICAgICAgIH07XG5cblxuXG4gICAgICAgIEwuZ2VvSlNPTihnZW9qc29uLCB7XG4gICAgICAgICAgICBwb2ludFRvTGF5ZXI6IChmZWF0dXJlLCBsYXRsbmcpID0+IHtcbiAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgY29uc3QgZXZlbnRUeXBlID0gZmVhdHVyZS5wcm9wZXJ0aWVzLmV2ZW50UHJvcGVydGllcy5ldmVudF90eXBlO1xuICAgICAgICAgICAgICB2YXIgZ2VvanNvbk1hcmtlck9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICByYWRpdXM6IDgsXG4gICAgICAgICAgICAgICAgICBmaWxsQ29sb3I6ICBldmVudFR5cGUgJiYgZXZlbnRUeXBlLnRvTG93ZXJDYXNlKCkgPT09ICdncm91cCcgPyBcIiM0MEQ3RDRcIiA6IFwiIzBGODFFOFwiLFxuICAgICAgICAgICAgICAgICAgY29sb3I6IFwid2hpdGVcIixcbiAgICAgICAgICAgICAgICAgIHdlaWdodDogMixcbiAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAuNSxcbiAgICAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAwLjgsXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IChldmVudFR5cGUgJiYgZXZlbnRUeXBlLnRvTG93ZXJDYXNlKCkgPT09ICdncm91cCcgPyAnZ3JvdXBzJyA6ICdldmVudHMnKSArICcgZXZlbnQtaXRlbS1wb3B1cCdcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgcmV0dXJuIEwuY2lyY2xlTWFya2VyKGxhdGxuZywgZ2VvanNvbk1hcmtlck9wdGlvbnMpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgIG9uRWFjaEZlYXR1cmU6IChmZWF0dXJlLCBsYXllcikgPT4ge1xuICAgICAgICAgICAgaWYgKGZlYXR1cmUucHJvcGVydGllcyAmJiBmZWF0dXJlLnByb3BlcnRpZXMucG9wdXBDb250ZW50KSB7XG4gICAgICAgICAgICAgIGxheWVyLmJpbmRQb3B1cChmZWF0dXJlLnByb3BlcnRpZXMucG9wdXBDb250ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pLmFkZFRvKG1hcCk7XG5cbiAgICAgIH0sXG4gICAgICB1cGRhdGU6IChwKSA9PiB7XG4gICAgICAgIGlmICghcCB8fCAhcC5sYXQgfHwgIXAubG5nICkgcmV0dXJuO1xuXG4gICAgICAgIG1hcC5zZXRWaWV3KEwubGF0TG5nKHAubGF0LCBwLmxuZyksIDEwKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiY29uc3QgUXVlcnlNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIHJldHVybiAodGFyZ2V0Rm9ybSA9IFwiZm9ybSNmaWx0ZXJzLWZvcm1cIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0Rm9ybSA9PT0gJ3N0cmluZycgPyAkKHRhcmdldEZvcm0pIDogdGFyZ2V0Rm9ybTtcbiAgICBsZXQgbGF0ID0gbnVsbDtcbiAgICBsZXQgbG5nID0gbnVsbDtcblxuICAgIGxldCBwcmV2aW91cyA9IHt9O1xuXG4gICAgJHRhcmdldC5vbignc3VibWl0JywgKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGxhdCA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwoKTtcbiAgICAgIGxuZyA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwoKTtcblxuICAgICAgdmFyIGZvcm0gPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG5cbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJC5wYXJhbShmb3JtKTtcbiAgICB9KVxuXG4gICAgJChkb2N1bWVudCkub24oJ2NoYW5nZScsICcuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF0nLCAoKSA9PiB7XG4gICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgIH0pXG5cblxuICAgIHJldHVybiB7XG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgcGFyYW1zID0gJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSlcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhbmddXCIpLnZhbChwYXJhbXMubGFuZyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChwYXJhbXMubGF0KTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKHBhcmFtcy5sbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwocGFyYW1zLmJvdW5kMSk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChwYXJhbXMuYm91bmQyKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxvY11cIikudmFsKHBhcmFtcy5sb2MpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9a2V5XVwiKS52YWwocGFyYW1zLmtleSk7XG5cbiAgICAgICAgICBpZiAocGFyYW1zLmZpbHRlcikge1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdXCIpLnJlbW92ZVByb3AoXCJjaGVja2VkXCIpO1xuICAgICAgICAgICAgcGFyYW1zLmZpbHRlci5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF1bdmFsdWU9J1wiICsgaXRlbSArIFwiJ11cIikucHJvcChcImNoZWNrZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGdldFBhcmFtZXRlcnM6ICgpID0+IHtcbiAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG4gICAgICAgIC8vIHBhcmFtZXRlcnNbJ2xvY2F0aW9uJ10gO1xuXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHBhcmFtZXRlcnMpIHtcbiAgICAgICAgICBpZiAoICFwYXJhbWV0ZXJzW2tleV0gfHwgcGFyYW1ldGVyc1trZXldID09IFwiXCIpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBwYXJhbWV0ZXJzW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtZXRlcnM7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTG9jYXRpb246IChsYXQsIGxuZykgPT4ge1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKGxhdCk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwobG5nKTtcbiAgICAgICAgLy8gJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVWaWV3cG9ydDogKHZpZXdwb3J0KSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW1t2aWV3cG9ydC5mLmIsIHZpZXdwb3J0LmIuYl0sIFt2aWV3cG9ydC5mLmYsIHZpZXdwb3J0LmIuZl1dO1xuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlVmlld3BvcnRCeUJvdW5kOiAoc3csIG5lKSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW3N3LCBuZV07Ly8vLy8vLy9cblxuICAgICAgICBcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMF0pKTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMV0pKTtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyU3VibWl0OiAoKSA9PiB7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59KShqUXVlcnkpO1xuIiwibGV0IGF1dG9jb21wbGV0ZU1hbmFnZXI7XG5sZXQgbWFwTWFuYWdlcjtcblxuKGZ1bmN0aW9uKCQpIHtcblxuICAvLyAxLiBnb29nbGUgbWFwcyBnZW9jb2RlXG5cbiAgLy8gMi4gZm9jdXMgbWFwIG9uIGdlb2NvZGUgKHZpYSBsYXQvbG5nKVxuICBjb25zdCBxdWVyeU1hbmFnZXIgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICAgICAgcXVlcnlNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICBjb25zdCBpbml0UGFyYW1zID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcbiAgbWFwTWFuYWdlciA9IE1hcE1hbmFnZXIoe1xuICAgIG9uTW92ZTogKHN3LCBuZSkgPT4ge1xuICAgICAgLy8gV2hlbiB0aGUgbWFwIG1vdmVzIGFyb3VuZCwgd2UgdXBkYXRlIHRoZSBsaXN0XG4gICAgICBxdWVyeU1hbmFnZXIudXBkYXRlVmlld3BvcnRCeUJvdW5kKHN3LCBuZSk7XG4gICAgICAvL3VwZGF0ZSBRdWVyeVxuICAgIH1cbiAgfSk7XG5cbiAgd2luZG93LmluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayA9ICgpID0+IHtcblxuICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIgPSBBdXRvY29tcGxldGVNYW5hZ2VyKFwiaW5wdXRbbmFtZT0nbG9jJ11cIik7XG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlci5pbml0aWFsaXplKCk7XG5cbiAgICBpZiAoaW5pdFBhcmFtcy5sb2MgJiYgaW5pdFBhcmFtcy5sb2MgIT09ICcnICYmICghaW5pdFBhcmFtcy5ib3VuZDEgJiYgIWluaXRQYXJhbXMuYm91bmQyKSkge1xuICAgICAgbWFwTWFuYWdlci5pbml0aWFsaXplKCgpID0+IHtcbiAgICAgICAgbWFwTWFuYWdlci5nZXRDZW50ZXJCeUxvY2F0aW9uKGluaXRQYXJhbXMubG9jLCAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgcXVlcnlNYW5hZ2VyLnVwZGF0ZVZpZXdwb3J0KHJlc3VsdC5nZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICB9XG4gIH1cblxuXG4gIGNvbnN0IGxhbmd1YWdlTWFuYWdlciA9IExhbmd1YWdlTWFuYWdlcigpO1xuXG4gIGxhbmd1YWdlTWFuYWdlci5pbml0aWFsaXplKGluaXRQYXJhbXNbJ2xhbmcnXSB8fCAnZW4nKTtcblxuICBjb25zdCBsaXN0TWFuYWdlciA9IExpc3RNYW5hZ2VyKCk7XG5cbiAgaWYoaW5pdFBhcmFtcy5sYXQgJiYgaW5pdFBhcmFtcy5sbmcpIHtcbiAgICBtYXBNYW5hZ2VyLnNldENlbnRlcihbaW5pdFBhcmFtcy5sYXQsIGluaXRQYXJhbXMubG5nXSk7XG4gIH1cblxuICAvKioqXG4gICogTGlzdCBFdmVudHNcbiAgKiBUaGlzIHdpbGwgdHJpZ2dlciB0aGUgbGlzdCB1cGRhdGUgbWV0aG9kXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgbGlzdE1hbmFnZXIucG9wdWxhdGVMaXN0KG9wdGlvbnMucGFyYW1zKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgbGlzdE1hbmFnZXIudXBkYXRlRmlsdGVyKG9wdGlvbnMpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlci1ieS1ib3VuZCcsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxldCBib3VuZDEsIGJvdW5kMjtcblxuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICBbYm91bmQxLCBib3VuZDJdID0gbWFwTWFuYWdlci5nZXRCb3VuZHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgICBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcbiAgICB9XG5cblxuXG4gICAgbGlzdE1hbmFnZXIudXBkYXRlQm91bmRzKGJvdW5kMSwgYm91bmQyKVxuICB9KVxuXG4gIC8qKipcbiAgKiBNYXAgRXZlbnRzXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICAvLyBtYXBNYW5hZ2VyLnNldENlbnRlcihbb3B0aW9ucy5sYXQsIG9wdGlvbnMubG5nXSk7XG4gICAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLmJvdW5kMSB8fCAhb3B0aW9ucy5ib3VuZDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgdmFyIGJvdW5kMiA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDIpO1xuICAgIG1hcE1hbmFnZXIuc2V0Qm91bmRzKGJvdW5kMSwgYm91bmQyKTtcbiAgICAvLyBjb25zb2xlLmxvZyhvcHRpb25zKVxuICB9KTtcbiAgLy8gMy4gbWFya2VycyBvbiBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXBsb3QnLCAoZSwgb3B0KSA9PiB7XG5cbiAgICBtYXBNYW5hZ2VyLnBsb3RQb2ludHMob3B0LmRhdGEsIG9wdC5wYXJhbXMpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicpO1xuICB9KVxuXG4gIC8vIEZpbHRlciBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLWZpbHRlcicsIChlLCBvcHQpID0+IHtcbiAgICBpZiAob3B0KSB7XG4gICAgICBtYXBNYW5hZ2VyLmZpbHRlck1hcChvcHQuZmlsdGVyKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZScsIChlLCBvcHQpID0+IHtcbiAgICBpZiAob3B0KSB7XG4gICAgICBsYW5ndWFnZU1hbmFnZXIudXBkYXRlTGFuZ3VhZ2Uob3B0LmxhbmcpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbiNzaG93LWhpZGUtbWFwJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ2JvZHknKS50b2dnbGVDbGFzcygnbWFwLXZpZXcnKVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uLmJ0bi5tb3JlLWl0ZW1zJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJyNlbWJlZC1hcmVhJykudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgLy91cGRhdGUgZW1iZWQgbGluZVxuICAgIHZhciBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHQpKTtcbiAgICBkZWxldGUgY29weVsnbG5nJ107XG4gICAgZGVsZXRlIGNvcHlbJ2xhdCddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDEnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQyJ107XG5cbiAgICAkKCcjZW1iZWQtYXJlYSBpbnB1dFtuYW1lPWVtYmVkXScpLnZhbCgnaHR0cHM6Ly9uZXctbWFwLjM1MC5vcmcjJyArICQucGFyYW0oY29weSkpO1xuICB9KTtcblxuICAkKHdpbmRvdykub24oXCJyZXNpemVcIiwgKGUpID0+IHtcbiAgICBtYXBNYW5hZ2VyLnJlZnJlc2hNYXAoKTtcbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKFwiaGFzaGNoYW5nZVwiLCAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgaWYgKGhhc2gubGVuZ3RoID09IDApIHJldHVybjtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKGhhc2guc3Vic3RyaW5nKDEpKTtcbiAgICBjb25zdCBvbGRVUkwgPSBldmVudC5vcmlnaW5hbEV2ZW50Lm9sZFVSTDtcblxuXG4gICAgY29uc3Qgb2xkSGFzaCA9ICQuZGVwYXJhbShvbGRVUkwuc3Vic3RyaW5nKG9sZFVSTC5zZWFyY2goXCIjXCIpKzEpKTtcblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcblxuICAgIC8vIFNvIHRoYXQgY2hhbmdlIGluIGZpbHRlcnMgd2lsbCBub3QgdXBkYXRlIHRoaXNcbiAgICBpZiAob2xkSGFzaC5ib3VuZDEgIT09IHBhcmFtZXRlcnMuYm91bmQxIHx8IG9sZEhhc2guYm91bmQyICE9PSBwYXJhbWV0ZXJzLmJvdW5kMikge1xuXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG5cbiAgICAvLyBDaGFuZ2UgaXRlbXNcbiAgICBpZiAob2xkSGFzaC5sYW5nICE9PSBwYXJhbWV0ZXJzLmxhbmcpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgfVxuICB9KVxuXG4gIC8vIDQuIGZpbHRlciBvdXQgaXRlbXMgaW4gYWN0aXZpdHktYXJlYVxuXG4gIC8vIDUuIGdldCBtYXAgZWxlbWVudHNcblxuICAvLyA2LiBnZXQgR3JvdXAgZGF0YVxuXG4gIC8vIDcuIHByZXNlbnQgZ3JvdXAgZWxlbWVudHNcblxuICAkLmFqYXgoe1xuICAgIHVybDogJy8vbmV3LW1hcC4zNTAub3JnL291dHB1dC8zNTBvcmcuanMuZ3onLCAvLyd8KipEQVRBX1NPVVJDRSoqfCcsXG4gICAgZGF0YVR5cGU6ICdzY3JpcHQnLFxuICAgIGNhY2hlOiB0cnVlLFxuICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICB2YXIgcGFyYW1ldGVycyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG5cbiAgICAgIHdpbmRvdy5FVkVOVFNfREFUQS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIGl0ZW1bJ2V2ZW50X3R5cGUnXSA9ICFpdGVtLmV2ZW50X3R5cGUgPyAnQWN0aW9uJyA6IGl0ZW0uZXZlbnRfdHlwZTtcbiAgICAgIH0pXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtdXBkYXRlJywgeyBwYXJhbXM6IHBhcmFtZXRlcnMgfSk7XG4gICAgICAvLyAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtcGxvdCcsIHsgZGF0YTogd2luZG93LkVWRU5UU19EQVRBLCBwYXJhbXM6IHBhcmFtZXRlcnMgfSk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuICAgICAgLy9UT0RPOiBNYWtlIHRoZSBnZW9qc29uIGNvbnZlcnNpb24gaGFwcGVuIG9uIHRoZSBiYWNrZW5kXG5cbiAgICAgIC8vUmVmcmVzaCB0aGluZ3NcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBsZXQgcCA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHApO1xuICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCBwKTtcbiAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwKTtcbiAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci1ieS1ib3VuZCcsIHApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCkpXG4gICAgICB9LCAxMDApO1xuICAgIH1cbiAgfSk7XG5cblxuXG59KShqUXVlcnkpO1xuIl19
