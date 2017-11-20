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

      var date = moment(item.start_datetime).format("dddd MMM DD, h:mma");
      var url = item.url.match(/^https{0,1}:/) ? item.url : "//" + item.url;
      return "\n      <li class='" + item.event_type + " event-obj' data-lat='" + item.lat + "' data-lng='" + item.lng + "'>\n        <div class=\"type-event type-action\">\n          <ul class=\"event-types-list\">\n            <li class='tag-" + item.event_type + " tag'>" + item.event_type + "</li>\n          </ul>\n          <h2 class=\"event-title\"><a href=\"//" + item.url + "\" target='_blank'>" + item.title + "</a></h2>\n          <div class=\"event-date date\">" + date + "</div>\n          <div class=\"event-address address-area\">\n            <p>" + item.venue + "</p>\n          </div>\n          <div class=\"call-to-action\">\n            <a href=\"" + url + "\" target='_blank' class=\"btn btn-secondary\">RSVP</a>\n          </div>\n        </div>\n      </li>\n      ";
    };

    var renderGroup = function renderGroup(item) {
      var url = item.website.match(/^https{0,1}:/) ? item.website : "//" + item.website;
      return "\n      <li class='" + item.event_type + " group-obj' data-lat='" + item.lat + "' data-lng='" + item.lng + "'>\n        <div class=\"type-group group-obj\">\n          <ul class=\"event-types-list\">\n            <li class=\"tag tag-" + item.supergroup + "\">" + item.supergroup + "</li>\n          </ul>\n          <h2><a href=\"/\" target='_blank'>" + item.name + "</a></h2>\n          <div class=\"group-details-area\">\n            <div class=\"group-location location\">" + item.location + "</div>\n            <div class=\"group-description\">\n              <p>" + item.description + "</p>\n            </div>\n          </div>\n          <div class=\"call-to-action\">\n            <a href=\"" + url + "\" target='_blank' class=\"btn btn-secondary\">Get Involved</a>\n          </div>\n        </div>\n      </li>\n      ";
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
            console.log("Adding bounds");
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
    return "\n    <div class='popup-item " + item.event_type + "' data-lat='" + item.lat + "' data-lng='" + item.lng + "'>\n      <div class=\"type-event\">\n        <ul class=\"event-types-list\">\n          <li class=\"tag tag-" + item.event_type + "\">" + (item.event_type || 'Action') + "</li>\n        </ul>\n        <h2 class=\"event-title\"><a href=\"//" + item.url + "\" target='_blank'>" + item.title + "</a></h2>\n        <div class=\"event-date\">" + date + "</div>\n        <div class=\"event-address address-area\">\n          <p>" + item.venue + "</p>\n        </div>\n        <div class=\"call-to-action\">\n          <a href=\"" + url + "\" target='_blank' class=\"btn btn-secondary\">RSVP</a>\n        </div>\n      </div>\n    </div>\n    ";
  };

  var renderGroup = function renderGroup(item) {

    var url = item.website.match(/^https{0,1}:/) ? item.website : "//" + item.website;
    return "\n    <li>\n      <div class=\"type-group group-obj\">\n        <ul class=\"event-types-list\">\n          <li class=\"tag tag-" + item.supergroup + "\">" + item.supergroup + "</li>\n        </ul>\n        <h2><a href=\"/\" target='_blank'>" + item.name + "</a></h2>\n        <div class=\"group-details-area\">\n          <div class=\"group-location location\">" + item.location + "</div>\n          <div class=\"group-description\">\n            <p>" + item.description + "</p>\n          </div>\n        </div>\n        <div class=\"call-to-action\">\n          <a href=\"" + url + "\" target='_blank' class=\"btn btn-secondary\">Get Involved</a>\n        </div>\n      </div>\n    </li>\n    ";
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
    var map = L.map('map').setView([34.88593094075317, 5.097656250000001], 2);

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

        console.log("map is resized");
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
    url: 'https://s3-us-west-2.amazonaws.com/pplsmap-data/output/350org.js.gz', //'|**DATA_SOURCE**|',
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9sYW5ndWFnZS5qcyIsImNsYXNzZXMvbGlzdC5qcyIsImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9xdWVyeS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJBdXRvY29tcGxldGVNYW5hZ2VyIiwiJCIsInRhcmdldCIsIkFQSV9LRVkiLCJ0YXJnZXRJdGVtIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwicXVlcnlNZ3IiLCJRdWVyeU1hbmFnZXIiLCJnZW9jb2RlciIsImdvb2dsZSIsIm1hcHMiLCJHZW9jb2RlciIsIiR0YXJnZXQiLCJpbml0aWFsaXplIiwidHlwZWFoZWFkIiwiaGludCIsImhpZ2hsaWdodCIsIm1pbkxlbmd0aCIsImNsYXNzTmFtZXMiLCJtZW51IiwibmFtZSIsImRpc3BsYXkiLCJpdGVtIiwiZm9ybWF0dGVkX2FkZHJlc3MiLCJsaW1pdCIsInNvdXJjZSIsInEiLCJzeW5jIiwiYXN5bmMiLCJnZW9jb2RlIiwiYWRkcmVzcyIsInJlc3VsdHMiLCJzdGF0dXMiLCJvbiIsIm9iaiIsImRhdHVtIiwiZ2VvbWV0cnkiLCJ1cGRhdGVWaWV3cG9ydCIsInZpZXdwb3J0IiwialF1ZXJ5IiwiTGFuZ3VhZ2VNYW5hZ2VyIiwibGFuZ3VhZ2UiLCJkaWN0aW9uYXJ5IiwiJHRhcmdldHMiLCJ1cGRhdGVQYWdlTGFuZ3VhZ2UiLCJ0YXJnZXRMYW5ndWFnZSIsInJvd3MiLCJmaWx0ZXIiLCJpIiwibGFuZyIsImVhY2giLCJpbmRleCIsInRhcmdldEF0dHJpYnV0ZSIsImRhdGEiLCJsYW5nVGFyZ2V0IiwidGV4dCIsInZhbCIsImF0dHIiLCJ0YXJnZXRzIiwiYWpheCIsInVybCIsImRhdGFUeXBlIiwic3VjY2VzcyIsInVwZGF0ZUxhbmd1YWdlIiwiTGlzdE1hbmFnZXIiLCJ0YXJnZXRMaXN0IiwicmVuZGVyRXZlbnQiLCJkYXRlIiwibW9tZW50Iiwic3RhcnRfZGF0ZXRpbWUiLCJmb3JtYXQiLCJtYXRjaCIsImV2ZW50X3R5cGUiLCJsYXQiLCJsbmciLCJ0aXRsZSIsInZlbnVlIiwicmVuZGVyR3JvdXAiLCJ3ZWJzaXRlIiwic3VwZXJncm91cCIsImxvY2F0aW9uIiwiZGVzY3JpcHRpb24iLCIkbGlzdCIsInVwZGF0ZUZpbHRlciIsInAiLCJyZW1vdmVQcm9wIiwiYWRkQ2xhc3MiLCJqb2luIiwidXBkYXRlQm91bmRzIiwiYm91bmQxIiwiYm91bmQyIiwiZmluZCIsImluZCIsIl9sYXQiLCJfbG5nIiwiY29uc29sZSIsImxvZyIsInJlbW92ZUNsYXNzIiwicG9wdWxhdGVMaXN0IiwiaGFyZEZpbHRlcnMiLCJrZXlTZXQiLCJrZXkiLCJzcGxpdCIsIiRldmVudExpc3QiLCJ3aW5kb3ciLCJFVkVOVFNfREFUQSIsIm1hcCIsImxlbmd0aCIsInRvTG93ZXJDYXNlIiwiaW5jbHVkZXMiLCJyZW1vdmUiLCJhcHBlbmQiLCJNYXBNYW5hZ2VyIiwiTEFOR1VBR0UiLCJyZW5kZXJHZW9qc29uIiwibGlzdCIsInJlbmRlcmVkIiwiaXNOYU4iLCJwYXJzZUZsb2F0Iiwic3Vic3RyaW5nIiwidHlwZSIsImNvb3JkaW5hdGVzIiwicHJvcGVydGllcyIsImV2ZW50UHJvcGVydGllcyIsInBvcHVwQ29udGVudCIsIm9wdGlvbnMiLCJhY2Nlc3NUb2tlbiIsIkwiLCJzZXRWaWV3Iiwib25Nb3ZlIiwiZXZlbnQiLCJzdyIsImdldEJvdW5kcyIsIl9zb3V0aFdlc3QiLCJuZSIsIl9ub3J0aEVhc3QiLCJ0aWxlTGF5ZXIiLCJhdHRyaWJ1dGlvbiIsImFkZFRvIiwiJG1hcCIsImNhbGxiYWNrIiwic2V0Qm91bmRzIiwiYm91bmRzMSIsImJvdW5kczIiLCJib3VuZHMiLCJmaXRCb3VuZHMiLCJzZXRDZW50ZXIiLCJjZW50ZXIiLCJ6b29tIiwiZ2V0Q2VudGVyQnlMb2NhdGlvbiIsInJlZnJlc2hNYXAiLCJpbnZhbGlkYXRlU2l6ZSIsImZpbHRlck1hcCIsImZpbHRlcnMiLCJoaWRlIiwiZm9yRWFjaCIsInNob3ciLCJwbG90UG9pbnRzIiwiZ2VvanNvbiIsImZlYXR1cmVzIiwiZ2VvSlNPTiIsInBvaW50VG9MYXllciIsImZlYXR1cmUiLCJsYXRsbmciLCJldmVudFR5cGUiLCJnZW9qc29uTWFya2VyT3B0aW9ucyIsInJhZGl1cyIsImZpbGxDb2xvciIsImNvbG9yIiwid2VpZ2h0Iiwib3BhY2l0eSIsImZpbGxPcGFjaXR5IiwiY2xhc3NOYW1lIiwiY2lyY2xlTWFya2VyIiwib25FYWNoRmVhdHVyZSIsImxheWVyIiwiYmluZFBvcHVwIiwidXBkYXRlIiwibGF0TG5nIiwidGFyZ2V0Rm9ybSIsInByZXZpb3VzIiwiZSIsInByZXZlbnREZWZhdWx0IiwiZm9ybSIsImRlcGFyYW0iLCJzZXJpYWxpemUiLCJoYXNoIiwicGFyYW0iLCJ0cmlnZ2VyIiwicGFyYW1zIiwibG9jIiwicHJvcCIsImdldFBhcmFtZXRlcnMiLCJwYXJhbWV0ZXJzIiwidXBkYXRlTG9jYXRpb24iLCJmIiwiYiIsIkpTT04iLCJzdHJpbmdpZnkiLCJ1cGRhdGVWaWV3cG9ydEJ5Qm91bmQiLCJ0cmlnZ2VyU3VibWl0IiwiYXV0b2NvbXBsZXRlTWFuYWdlciIsIm1hcE1hbmFnZXIiLCJxdWVyeU1hbmFnZXIiLCJpbml0UGFyYW1zIiwiaW5pdGlhbGl6ZUF1dG9jb21wbGV0ZUNhbGxiYWNrIiwicmVzdWx0IiwibGFuZ3VhZ2VNYW5hZ2VyIiwibGlzdE1hbmFnZXIiLCJwYXJzZSIsIm9wdCIsInRvZ2dsZUNsYXNzIiwiY29weSIsIm9sZFVSTCIsIm9yaWdpbmFsRXZlbnQiLCJvbGRIYXNoIiwic2VhcmNoIiwiY2FjaGUiLCJzZXRUaW1lb3V0Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOztBQUNBLElBQU1BLHNCQUF1QixVQUFTQyxDQUFULEVBQVk7QUFDdkM7O0FBRUEsU0FBTyxVQUFDQyxNQUFELEVBQVk7O0FBRWpCLFFBQU1DLFVBQVUseUNBQWhCO0FBQ0EsUUFBTUMsYUFBYSxPQUFPRixNQUFQLElBQWlCLFFBQWpCLEdBQTRCRyxTQUFTQyxhQUFULENB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LGFBQWIsRUFBakI7O0FBRUF4RixhQUFPQyxXQUFQLENBQW1Ca0QsT0FBbkIsQ0FBMkIsVUFBQ3JJLElBQUQsRUFBVTtBQUNuQ0EsYUFBSyxZQUFMLElBQXFCLENBQUNBLEtBQUtrRCxVQUFOLEdBQW1CLFFBQW5CLEdBQThCbEQsS0FBS2tELFVBQXhEO0FBQ0QsT0FGRDtBQUdBeEUsUUFBRUksUUFBRixFQUFZd0wsT0FBWixDQUFvQixxQkFBcEIsRUFBMkMsRUFBRUMsUUFBUUksVUFBVixFQUEzQztBQUNBO0FBQ0FqTSxRQUFFSSxRQUFGLEVBQVl3TCxPQUFaLENBQW9CLGtCQUFwQixFQUF3QyxFQUFFdkksTUFBTW1ELE9BQU9DLFdBQWYsRUFBNEJvRixRQUFRSSxVQUFwQyxFQUF4QztBQUNBak0sUUFBRUksUUFBRixFQUFZd0wsT0FBWixDQUFvQixzQkFBcEIsRUFBNENLLFVBQTVDO0FBQ0E7O0FBRUE7QUFDQXlCLGlCQUFXLFlBQU07QUFDZixZQUFJdEksSUFBSXVILGFBQWFYLGFBQWIsRUFBUjtBQUNBaE0sVUFBRUksUUFBRixFQUFZd0wsT0FBWixDQUFvQixvQkFBcEIsRUFBMEN4RyxDQUExQztBQUNBcEYsVUFBRUksUUFBRixFQUFZd0wsT0FBWixDQUFvQixvQkFBcEIsRUFBMEN4RyxDQUExQztBQUNBcEYsVUFBRUksUUFBRixFQUFZd0wsT0FBWixDQUFvQiw0QkFBcEIsRUFBa0R4RyxDQUFsRDtBQUNBcEYsVUFBRUksUUFBRixFQUFZd0wsT0FBWixDQUFvQiw4QkFBcEIsRUFBb0R4RyxDQUFwRDtBQUNBO0FBQ0QsT0FQRCxFQU9HLEdBUEg7QUFRRDtBQXpCSSxHQUFQO0FBOEJELENBOUxELEVBOExHN0MsTUE5TEgiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vL0FQSSA6QUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXG5jb25zdCBBdXRvY29tcGxldGVNYW5hZ2VyID0gKGZ1bmN0aW9uKCQpIHtcbiAgLy9Jbml0aWFsaXphdGlvbi4uLlxuXG4gIHJldHVybiAodGFyZ2V0KSA9PiB7XG5cbiAgICBjb25zdCBBUElfS0VZID0gXCJBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cIjtcbiAgICBjb25zdCB0YXJnZXRJdGVtID0gdHlwZW9mIHRhcmdldCA9PSBcInN0cmluZ1wiID8gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpIDogdGFyZ2V0O1xuICAgIGNvbnN0IHF1ZXJ5TWdyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgdmFyIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgJHRhcmdldDogJCh0YXJnZXRJdGVtKSxcbiAgICAgIHRhcmdldDogdGFyZ2V0SXRlbSxcbiAgICAgIGluaXRpYWxpemU6ICgpID0+IHtcbiAgICAgICAgJCh0YXJnZXRJdGVtKS50eXBlYWhlYWQoe1xuICAgICAgICAgICAgICAgICAgICBoaW50OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1pbkxlbmd0aDogNCxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICAgIG1lbnU6ICd0dC1kcm9wZG93bi1tZW51J1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnc2VhcmNoLXJlc3VsdHMnLFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAoaXRlbSkgPT4gaXRlbS5mb3JtYXR0ZWRfYWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgbGltaXQ6IDEwLFxuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IGZ1bmN0aW9uIChxLCBzeW5jLCBhc3luYyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogcSB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFzeW5jKHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApLm9uKCd0eXBlYWhlYWQ6c2VsZWN0ZWQnLCBmdW5jdGlvbiAob2JqLCBkYXR1bSkge1xuICAgICAgICAgICAgICAgICAgICBpZihkYXR1bSlcbiAgICAgICAgICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgICAgICAgdmFyIGdlb21ldHJ5ID0gZGF0dW0uZ2VvbWV0cnk7XG4gICAgICAgICAgICAgICAgICAgICAgcXVlcnlNZ3IudXBkYXRlVmlld3BvcnQoZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgICAgIC8vICBtYXAuZml0Qm91bmRzKGdlb21ldHJ5LmJvdW5kcz8gZ2VvbWV0cnkuYm91bmRzIDogZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG5cblxuICAgIHJldHVybiB7XG5cbiAgICB9XG4gIH1cblxufShqUXVlcnkpKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTGFuZ3VhZ2VNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIC8va2V5VmFsdWVcblxuICAvL3RhcmdldHMgYXJlIHRoZSBtYXBwaW5ncyBmb3IgdGhlIGxhbmd1YWdlXG4gIHJldHVybiAoKSA9PiB7XG4gICAgbGV0IGxhbmd1YWdlO1xuICAgIGxldCBkaWN0aW9uYXJ5ID0ge307XG4gICAgbGV0ICR0YXJnZXRzID0gJChcIltkYXRhLWxhbmctdGFyZ2V0XVtkYXRhLWxhbmcta2V5XVwiKTtcblxuICAgIGNvbnN0IHVwZGF0ZVBhZ2VMYW5ndWFnZSA9ICgpID0+IHtcblxuICAgICAgbGV0IHRhcmdldExhbmd1YWdlID0gZGljdGlvbmFyeS5yb3dzLmZpbHRlcigoaSkgPT4gaS5sYW5nID09PSBsYW5ndWFnZSlbMF07XG5cbiAgICAgICR0YXJnZXRzLmVhY2goKGluZGV4LCBpdGVtKSA9PiB7XG4gICAgICAgIGxldCB0YXJnZXRBdHRyaWJ1dGUgPSAkKGl0ZW0pLmRhdGEoJ2xhbmctdGFyZ2V0Jyk7XG4gICAgICAgIGxldCBsYW5nVGFyZ2V0ID0gJChpdGVtKS5kYXRhKCdsYW5nLWtleScpO1xuXG4gICAgICAgIHN3aXRjaCh0YXJnZXRBdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjYXNlICd0ZXh0JzpcbiAgICAgICAgICAgICQoaXRlbSkudGV4dCh0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd2YWx1ZSc6XG4gICAgICAgICAgICAkKGl0ZW0pLnZhbCh0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgJChpdGVtKS5hdHRyKHRhcmdldEF0dHJpYnV0ZSwgdGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICBsYW5ndWFnZSxcbiAgICAgIHRhcmdldHM6ICR0YXJnZXRzLFxuICAgICAgZGljdGlvbmFyeSxcbiAgICAgIGluaXRpYWxpemU6IChsYW5nKSA9PiB7XG5cbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAvLyB1cmw6ICdodHRwczovL2dzeDJqc29uLmNvbS9hcGk/aWQ9MU8zZUJ5akwxdmxZZjdaN2FtLV9odFJUUWk3M1BhZnFJZk5CZExtWGU4U00mc2hlZXQ9MScsXG4gICAgICAgICAgdXJsOiAnL2RhdGEvbGFuZy5qc29uJyxcbiAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICBkaWN0aW9uYXJ5ID0gZGF0YTtcbiAgICAgICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTGFuZ3VhZ2U6IChsYW5nKSA9PiB7XG5cbiAgICAgICAgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbn0pKGpRdWVyeSk7XG4iLCIvKiBUaGlzIGxvYWRzIGFuZCBtYW5hZ2VzIHRoZSBsaXN0ISAqL1xuXG5jb25zdCBMaXN0TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldExpc3QgPSBcIiNldmVudHMtbGlzdFwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRMaXN0ID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0TGlzdCkgOiB0YXJnZXRMaXN0O1xuXG4gICAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSkgPT4ge1xuXG4gICAgICB2YXIgZGF0ZSA9IG1vbWVudChpdGVtLnN0YXJ0X2RhdGV0aW1lKS5mb3JtYXQoXCJkZGRkIE1NTSBERCwgaDptbWFcIik7XG4gICAgICBsZXQgdXJsID0gaXRlbS51cmwubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS51cmwgOiBcIi8vXCIgKyBpdGVtLnVybDtcbiAgICAgIHJldHVybiBgXG4gICAgICA8bGkgY2xhc3M9JyR7aXRlbS5ldmVudF90eXBlfSBldmVudC1vYmonIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnQgdHlwZS1hY3Rpb25cIj5cbiAgICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgICA8bGkgY2xhc3M9J3RhZy0ke2l0ZW0uZXZlbnRfdHlwZX0gdGFnJz4ke2l0ZW0uZXZlbnRfdHlwZX08L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPGgyIGNsYXNzPVwiZXZlbnQtdGl0bGVcIj48YSBocmVmPVwiLy8ke2l0ZW0udXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWRhdGUgZGF0ZVwiPiR7ZGF0ZX08L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtYWRkcmVzcyBhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICAgIDxwPiR7aXRlbS52ZW51ZX08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5SU1ZQPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIGNvbnN0IHJlbmRlckdyb3VwID0gKGl0ZW0pID0+IHtcbiAgICAgIGxldCB1cmwgPSBpdGVtLndlYnNpdGUubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS53ZWJzaXRlIDogXCIvL1wiICsgaXRlbS53ZWJzaXRlO1xuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaSBjbGFzcz0nJHtpdGVtLmV2ZW50X3R5cGV9IGdyb3VwLW9iaicgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ncm91cCBncm91cC1vYmpcIj5cbiAgICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5zdXBlcmdyb3VwfVwiPiR7aXRlbS5zdXBlcmdyb3VwfTwvbGk+XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIi9cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLm5hbWV9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWxvY2F0aW9uIGxvY2F0aW9uXCI+JHtpdGVtLmxvY2F0aW9ufTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPkdldCBJbnZvbHZlZDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICAgYFxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgJGxpc3Q6ICR0YXJnZXQsXG4gICAgICB1cGRhdGVGaWx0ZXI6IChwKSA9PiB7XG4gICAgICAgIGlmKCFwKSByZXR1cm47XG5cbiAgICAgICAgLy8gUmVtb3ZlIEZpbHRlcnNcblxuICAgICAgICAkdGFyZ2V0LnJlbW92ZVByb3AoXCJjbGFzc1wiKTtcbiAgICAgICAgJHRhcmdldC5hZGRDbGFzcyhwLmZpbHRlciA/IHAuZmlsdGVyLmpvaW4oXCIgXCIpIDogJycpXG4gICAgICB9LFxuICAgICAgdXBkYXRlQm91bmRzOiAoYm91bmQxLCBib3VuZDIpID0+IHtcblxuICAgICAgICAvLyBjb25zdCBib3VuZHMgPSBbcC5ib3VuZHMxLCBwLmJvdW5kczJdO1xuXG5cbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCBsaS5ldmVudC1vYmosIHVsIGxpLmdyb3VwLW9iaicpLmVhY2goKGluZCwgaXRlbSk9PiB7XG5cbiAgICAgICAgICBsZXQgX2xhdCA9ICQoaXRlbSkuZGF0YSgnbGF0JyksXG4gICAgICAgICAgICAgIF9sbmcgPSAkKGl0ZW0pLmRhdGEoJ2xuZycpO1xuXG4gICAgICAgICAgLy8gY29uc29sZS5sb2coXCJ1cGRhdGVCb3VuZHNcIiwgaXRlbSlcbiAgICAgICAgICBpZiAoYm91bmQxWzBdIDw9IF9sYXQgJiYgYm91bmQyWzBdID49IF9sYXQgJiYgYm91bmQxWzFdIDw9IF9sbmcgJiYgYm91bmQyWzFdID49IF9sbmcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQWRkaW5nIGJvdW5kc1wiKTtcbiAgICAgICAgICAgICQoaXRlbSkuYWRkQ2xhc3MoJ3dpdGhpbi1ib3VuZCcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKGl0ZW0pLnJlbW92ZUNsYXNzKCd3aXRoaW4tYm91bmQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHBvcHVsYXRlTGlzdDogKGhhcmRGaWx0ZXJzKSA9PiB7XG4gICAgICAgIC8vdXNpbmcgd2luZG93LkVWRU5UX0RBVEFcbiAgICAgICAgY29uc3Qga2V5U2V0ID0gIWhhcmRGaWx0ZXJzLmtleSA/IFtdIDogaGFyZEZpbHRlcnMua2V5LnNwbGl0KCcsJyk7XG5cbiAgICAgICAgdmFyICRldmVudExpc3QgPSB3aW5kb3cuRVZFTlRTX0RBVEEubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgIGlmIChrZXlTZXQubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLmV2ZW50X3R5cGUgJiYgaXRlbS5ldmVudF90eXBlLnRvTG93ZXJDYXNlKCkgPT0gJ2dyb3VwJyA/IHJlbmRlckdyb3VwKGl0ZW0pIDogcmVuZGVyRXZlbnQoaXRlbSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXlTZXQubGVuZ3RoID4gMCAmJiBpdGVtLmV2ZW50X3R5cGUgIT0gJ2dyb3VwJyAmJiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5ldmVudF90eXBlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlbmRlckV2ZW50KGl0ZW0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2V5U2V0Lmxlbmd0aCA+IDAgJiYgaXRlbS5ldmVudF90eXBlID09ICdncm91cCcgJiYga2V5U2V0LmluY2x1ZGVzKGl0ZW0uc3VwZXJncm91cCkpIHtcbiAgICAgICAgICAgIHJldHVybiByZW5kZXJHcm91cChpdGVtKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIH0pXG4gICAgICAgICR0YXJnZXQuZmluZCgndWwgbGknKS5yZW1vdmUoKTtcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCcpLmFwcGVuZCgkZXZlbnRMaXN0KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiXG5jb25zdCBNYXBNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIGxldCBMQU5HVUFHRSA9ICdlbic7XG5cbiAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSkgPT4ge1xuICAgIHZhciBkYXRlID0gbW9tZW50KGl0ZW0uc3RhcnRfZGF0ZXRpbWUpLmZvcm1hdChcImRkZGQgTU1NIERELCBoOm1tYVwiKTtcbiAgICBsZXQgdXJsID0gaXRlbS51cmwubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS51cmwgOiBcIi8vXCIgKyBpdGVtLnVybDtcbiAgICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9J3BvcHVwLWl0ZW0gJHtpdGVtLmV2ZW50X3R5cGV9JyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudFwiPlxuICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgPGxpIGNsYXNzPVwidGFnIHRhZy0ke2l0ZW0uZXZlbnRfdHlwZX1cIj4ke2l0ZW0uZXZlbnRfdHlwZSB8fCAnQWN0aW9uJ308L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8aDIgY2xhc3M9XCJldmVudC10aXRsZVwiPjxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZX08L2E+PC9oMj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWRhdGVcIj4ke2RhdGV9PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1hZGRyZXNzIGFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgIDxwPiR7aXRlbS52ZW51ZX08L3A+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5SU1ZQPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICAgIGBcbiAgfTtcblxuICBjb25zdCByZW5kZXJHcm91cCA9IChpdGVtKSA9PiB7XG5cbiAgICBsZXQgdXJsID0gaXRlbS53ZWJzaXRlLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0ud2Vic2l0ZSA6IFwiLy9cIiArIGl0ZW0ud2Vic2l0ZTtcbiAgICByZXR1cm4gYFxuICAgIDxsaT5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwIGdyb3VwLW9ialwiPlxuICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgPGxpIGNsYXNzPVwidGFnIHRhZy0ke2l0ZW0uc3VwZXJncm91cH1cIj4ke2l0ZW0uc3VwZXJncm91cH08L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8aDI+PGEgaHJlZj1cIi9cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLm5hbWV9PC9hPjwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtbG9jYXRpb24gbG9jYXRpb25cIj4ke2l0ZW0ubG9jYXRpb259PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICA8cD4ke2l0ZW0uZGVzY3JpcHRpb259PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+R2V0IEludm9sdmVkPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvbGk+XG4gICAgYFxuICB9O1xuXG4gIGNvbnN0IHJlbmRlckdlb2pzb24gPSAobGlzdCkgPT4ge1xuICAgIHJldHVybiBsaXN0Lm1hcCgoaXRlbSkgPT4ge1xuICAgICAgLy8gcmVuZGVyZWQgZXZlbnRUeXBlXG4gICAgICBsZXQgcmVuZGVyZWQ7XG5cbiAgICAgIGlmIChpdGVtLmV2ZW50X3R5cGUgJiYgaXRlbS5ldmVudF90eXBlLnRvTG93ZXJDYXNlKCkgPT0gJ2dyb3VwJykge1xuICAgICAgICByZW5kZXJlZCA9IHJlbmRlckdyb3VwKGl0ZW0pO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZW5kZXJlZCA9IHJlbmRlckV2ZW50KGl0ZW0pO1xuICAgICAgfVxuXG4gICAgICAvLyBmb3JtYXQgY2hlY2tcbiAgICAgIGlmIChpc05hTihwYXJzZUZsb2F0KHBhcnNlRmxvYXQoaXRlbS5sbmcpKSkpIHtcbiAgICAgICAgaXRlbS5sbmcgPSBpdGVtLmxuZy5zdWJzdHJpbmcoMSlcbiAgICAgIH1cbiAgICAgIGlmIChpc05hTihwYXJzZUZsb2F0KHBhcnNlRmxvYXQoaXRlbS5sYXQpKSkpIHtcbiAgICAgICAgaXRlbS5sYXQgPSBpdGVtLmxhdC5zdWJzdHJpbmcoMSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgIHR5cGU6IFwiUG9pbnRcIixcbiAgICAgICAgICBjb29yZGluYXRlczogW2l0ZW0ubG5nLCBpdGVtLmxhdF1cbiAgICAgICAgfSxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIGV2ZW50UHJvcGVydGllczogaXRlbSxcbiAgICAgICAgICBwb3B1cENvbnRlbnQ6IHJlbmRlcmVkXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIChvcHRpb25zKSA9PiB7XG4gICAgdmFyIGFjY2Vzc1Rva2VuID0gJ3BrLmV5SjFJam9pYldGMGRHaGxkek0xTUNJc0ltRWlPaUphVFZGTVVrVXdJbjAud2NNM1hjOEJHQzZQTS1PeXJ3am5oZyc7XG4gICAgdmFyIG1hcCA9IEwubWFwKCdtYXAnKS5zZXRWaWV3KFszNC44ODU5MzA5NDA3NTMxNywgNS4wOTc2NTYyNTAwMDAwMDFdLCAyKTtcblxuICAgIExBTkdVQUdFID0gb3B0aW9ucy5sYW5nIHx8ICdlbic7XG5cbiAgICBpZiAob3B0aW9ucy5vbk1vdmUpIHtcbiAgICAgIG1hcC5vbignZHJhZ2VuZCcsIChldmVudCkgPT4ge1xuXG5cbiAgICAgICAgbGV0IHN3ID0gW21hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW21hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubG5nXTtcbiAgICAgICAgb3B0aW9ucy5vbk1vdmUoc3csIG5lKTtcbiAgICAgIH0pLm9uKCd6b29tZW5kJywgKGV2ZW50KSA9PiB7XG5cblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuICAgICAgICBvcHRpb25zLm9uTW92ZShzdywgbmUpO1xuICAgICAgfSlcbiAgICB9XG5cbiAgICBMLnRpbGVMYXllcignaHR0cHM6Ly9hcGkubWFwYm94LmNvbS9zdHlsZXMvdjEvbWF0dGhldzM1MC9jamE0MXRpamsyN2Q2MnJxb2Q3ZzBseDRiL3RpbGVzLzI1Ni97en0ve3h9L3t5fT9hY2Nlc3NfdG9rZW49JyArIGFjY2Vzc1Rva2VuLCB7XG4gICAgICAgIGF0dHJpYnV0aW9uOiAnJmNvcHk7IDxhIGhyZWY9XCJodHRwOi8vb3NtLm9yZy9jb3B5cmlnaHRcIj5PcGVuU3RyZWV0TWFwPC9hPiBjb250cmlidXRvcnMg4oCiIDxhIGhyZWY9XCIvLzM1MC5vcmdcIj4zNTAub3JnPC9hPidcbiAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgbGV0IGdlb2NvZGVyID0gbnVsbDtcbiAgICByZXR1cm4ge1xuICAgICAgJG1hcDogbWFwLFxuICAgICAgaW5pdGlhbGl6ZTogKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG4gICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBzZXRCb3VuZHM6IChib3VuZHMxLCBib3VuZHMyKSA9PiB7XG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtib3VuZHMxLCBib3VuZHMyXTtcbiAgICAgICAgbWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuICAgICAgfSxcbiAgICAgIHNldENlbnRlcjogKGNlbnRlciwgem9vbSA9IDEwKSA9PiB7XG4gICAgICAgIGlmICghY2VudGVyIHx8ICFjZW50ZXJbMF0gfHwgY2VudGVyWzBdID09IFwiXCJcbiAgICAgICAgICAgICAgfHwgIWNlbnRlclsxXSB8fCBjZW50ZXJbMV0gPT0gXCJcIikgcmV0dXJuO1xuICAgICAgICBtYXAuc2V0VmlldyhjZW50ZXIsIHpvb20pO1xuICAgICAgfSxcbiAgICAgIGdldEJvdW5kczogKCkgPT4ge1xuXG4gICAgICAgIGxldCBzdyA9IFttYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxuZ107XG4gICAgICAgIGxldCBuZSA9IFttYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxuZ107XG5cbiAgICAgICAgcmV0dXJuIFtzdywgbmVdO1xuICAgICAgfSxcbiAgICAgIC8vIENlbnRlciBsb2NhdGlvbiBieSBnZW9jb2RlZFxuICAgICAgZ2V0Q2VudGVyQnlMb2NhdGlvbjogKGxvY2F0aW9uLCBjYWxsYmFjaykgPT4ge1xuXG4gICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBsb2NhdGlvbiB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG5cbiAgICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXN1bHRzWzBdKVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgcmVmcmVzaE1hcDogKCkgPT4ge1xuICAgICAgICBtYXAuaW52YWxpZGF0ZVNpemUoZmFsc2UpO1xuICAgICAgICAvLyBtYXAuX29uUmVzaXplKCk7XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJtYXAgaXMgcmVzaXplZFwiKVxuICAgICAgfSxcbiAgICAgIGZpbHRlck1hcDogKGZpbHRlcnMpID0+IHtcblxuICAgICAgICAkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXBcIikuaGlkZSgpO1xuXG5cbiAgICAgICAgaWYgKCFmaWx0ZXJzKSByZXR1cm47XG5cbiAgICAgICAgZmlsdGVycy5mb3JFYWNoKChpdGVtKSA9PiB7XG5cbiAgICAgICAgICAkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXAuXCIgKyBpdGVtLnRvTG93ZXJDYXNlKCkpLnNob3coKTtcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICBwbG90UG9pbnRzOiAobGlzdCwgaGFyZEZpbHRlcnMpID0+IHtcblxuICAgICAgICBjb25zdCBrZXlTZXQgPSAhaGFyZEZpbHRlcnMua2V5ID8gW10gOiBoYXJkRmlsdGVycy5rZXkuc3BsaXQoJywnKTtcblxuICAgICAgICBpZiAoa2V5U2V0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsaXN0ID0gbGlzdC5maWx0ZXIoKGl0ZW0pID0+IGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKVxuICAgICAgICB9XG5cblxuICAgICAgICBjb25zdCBnZW9qc29uID0ge1xuICAgICAgICAgIHR5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgICAgICAgICBmZWF0dXJlczogcmVuZGVyR2VvanNvbihsaXN0KVxuICAgICAgICB9O1xuXG5cblxuICAgICAgICBMLmdlb0pTT04oZ2VvanNvbiwge1xuICAgICAgICAgICAgcG9pbnRUb0xheWVyOiAoZmVhdHVyZSwgbGF0bG5nKSA9PiB7XG4gICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuZXZlbnRfdHlwZTtcbiAgICAgICAgICAgICAgdmFyIGdlb2pzb25NYXJrZXJPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgICAgcmFkaXVzOiA4LFxuICAgICAgICAgICAgICAgICAgZmlsbENvbG9yOiAgZXZlbnRUeXBlICYmIGV2ZW50VHlwZS50b0xvd2VyQ2FzZSgpID09PSAnZ3JvdXAnID8gXCIjNDBEN0Q0XCIgOiBcIiMwRjgxRThcIixcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiBcIndoaXRlXCIsXG4gICAgICAgICAgICAgICAgICB3ZWlnaHQ6IDIsXG4gICAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLjUsXG4gICAgICAgICAgICAgICAgICBmaWxsT3BhY2l0eTogMC44LFxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAoZXZlbnRUeXBlICYmIGV2ZW50VHlwZS50b0xvd2VyQ2FzZSgpID09PSAnZ3JvdXAnID8gJ2dyb3VwcycgOiAnZXZlbnRzJykgKyAnIGV2ZW50LWl0ZW0tcG9wdXAnXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJldHVybiBMLmNpcmNsZU1hcmtlcihsYXRsbmcsIGdlb2pzb25NYXJrZXJPcHRpb25zKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICBvbkVhY2hGZWF0dXJlOiAoZmVhdHVyZSwgbGF5ZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChmZWF0dXJlLnByb3BlcnRpZXMgJiYgZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCkge1xuICAgICAgICAgICAgICBsYXllci5iaW5kUG9wdXAoZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgICB9LFxuICAgICAgdXBkYXRlOiAocCkgPT4ge1xuICAgICAgICBpZiAoIXAgfHwgIXAubGF0IHx8ICFwLmxuZyApIHJldHVybjtcblxuICAgICAgICBtYXAuc2V0VmlldyhMLmxhdExuZyhwLmxhdCwgcC5sbmcpLCAxMCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsImNvbnN0IFF1ZXJ5TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldEZvcm0gPSBcImZvcm0jZmlsdGVycy1mb3JtXCIpID0+IHtcbiAgICBjb25zdCAkdGFyZ2V0ID0gdHlwZW9mIHRhcmdldEZvcm0gPT09ICdzdHJpbmcnID8gJCh0YXJnZXRGb3JtKSA6IHRhcmdldEZvcm07XG4gICAgbGV0IGxhdCA9IG51bGw7XG4gICAgbGV0IGxuZyA9IG51bGw7XG5cbiAgICBsZXQgcHJldmlvdXMgPSB7fTtcblxuICAgICR0YXJnZXQub24oJ3N1Ym1pdCcsIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBsYXQgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKCk7XG4gICAgICBsbmcgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKCk7XG5cbiAgICAgIHZhciBmb3JtID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuXG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICQucGFyYW0oZm9ybSk7XG4gICAgfSlcblxuICAgICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdJywgKCkgPT4ge1xuICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICB9KVxuXG5cbiAgICByZXR1cm4ge1xuICAgICAgaW5pdGlhbGl6ZTogKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdmFyIHBhcmFtcyA9ICQuZGVwYXJhbSh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkpXG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYW5nXVwiKS52YWwocGFyYW1zLmxhbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwocGFyYW1zLmxhdCk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChwYXJhbXMubG5nKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKHBhcmFtcy5ib3VuZDEpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwocGFyYW1zLmJvdW5kMik7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sb2NdXCIpLnZhbChwYXJhbXMubG9jKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWtleV1cIikudmFsKHBhcmFtcy5rZXkpO1xuXG4gICAgICAgICAgaWYgKHBhcmFtcy5maWx0ZXIpIHtcbiAgICAgICAgICAgICR0YXJnZXQuZmluZChcIi5maWx0ZXItaXRlbSBpbnB1dFt0eXBlPWNoZWNrYm94XVwiKS5yZW1vdmVQcm9wKFwiY2hlY2tlZFwiKTtcbiAgICAgICAgICAgIHBhcmFtcy5maWx0ZXIuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdW3ZhbHVlPSdcIiArIGl0ZW0gKyBcIiddXCIpLnByb3AoXCJjaGVja2VkXCIsIHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBnZXRQYXJhbWV0ZXJzOiAoKSA9PiB7XG4gICAgICAgIHZhciBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuICAgICAgICAvLyBwYXJhbWV0ZXJzWydsb2NhdGlvbiddIDtcblxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBwYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgaWYgKCAhcGFyYW1ldGVyc1trZXldIHx8IHBhcmFtZXRlcnNba2V5XSA9PSBcIlwiKSB7XG4gICAgICAgICAgICBkZWxldGUgcGFyYW1ldGVyc1trZXldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJhbWV0ZXJzO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZUxvY2F0aW9uOiAobGF0LCBsbmcpID0+IHtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChsYXQpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKGxuZyk7XG4gICAgICAgIC8vICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlVmlld3BvcnQ6ICh2aWV3cG9ydCkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtbdmlld3BvcnQuZi5iLCB2aWV3cG9ydC5iLmJdLCBbdmlld3BvcnQuZi5mLCB2aWV3cG9ydC5iLmZdXTtcblxuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1swXSkpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1sxXSkpO1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZVZpZXdwb3J0QnlCb3VuZDogKHN3LCBuZSkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtzdywgbmVdOy8vLy8vLy8vXG5cbiAgICAgICAgXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdHJpZ2dlclN1Ym1pdDogKCkgPT4ge1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSkoalF1ZXJ5KTtcbiIsImxldCBhdXRvY29tcGxldGVNYW5hZ2VyO1xubGV0IG1hcE1hbmFnZXI7XG5cbihmdW5jdGlvbigkKSB7XG5cbiAgLy8gMS4gZ29vZ2xlIG1hcHMgZ2VvY29kZVxuXG4gIC8vIDIuIGZvY3VzIG1hcCBvbiBnZW9jb2RlICh2aWEgbGF0L2xuZylcbiAgY29uc3QgcXVlcnlNYW5hZ2VyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgICAgIHF1ZXJ5TWFuYWdlci5pbml0aWFsaXplKCk7XG5cbiAgY29uc3QgaW5pdFBhcmFtcyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gIG1hcE1hbmFnZXIgPSBNYXBNYW5hZ2VyKHtcbiAgICBvbk1vdmU6IChzdywgbmUpID0+IHtcbiAgICAgIC8vIFdoZW4gdGhlIG1hcCBtb3ZlcyBhcm91bmQsIHdlIHVwZGF0ZSB0aGUgbGlzdFxuICAgICAgcXVlcnlNYW5hZ2VyLnVwZGF0ZVZpZXdwb3J0QnlCb3VuZChzdywgbmUpO1xuICAgICAgLy91cGRhdGUgUXVlcnlcbiAgICB9XG4gIH0pO1xuXG4gIHdpbmRvdy5pbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2sgPSAoKSA9PiB7XG5cbiAgICBhdXRvY29tcGxldGVNYW5hZ2VyID0gQXV0b2NvbXBsZXRlTWFuYWdlcihcImlucHV0W25hbWU9J2xvYyddXCIpO1xuICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuXG4gICAgaWYgKGluaXRQYXJhbXMubG9jICYmIGluaXRQYXJhbXMubG9jICE9PSAnJyAmJiAoIWluaXRQYXJhbXMuYm91bmQxICYmICFpbml0UGFyYW1zLmJvdW5kMikpIHtcbiAgICAgIG1hcE1hbmFnZXIuaW5pdGlhbGl6ZSgoKSA9PiB7XG4gICAgICAgIG1hcE1hbmFnZXIuZ2V0Q2VudGVyQnlMb2NhdGlvbihpbml0UGFyYW1zLmxvYywgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIHF1ZXJ5TWFuYWdlci51cGRhdGVWaWV3cG9ydChyZXN1bHQuZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cblxuICBjb25zdCBsYW5ndWFnZU1hbmFnZXIgPSBMYW5ndWFnZU1hbmFnZXIoKTtcblxuICBsYW5ndWFnZU1hbmFnZXIuaW5pdGlhbGl6ZShpbml0UGFyYW1zWydsYW5nJ10gfHwgJ2VuJyk7XG5cbiAgY29uc3QgbGlzdE1hbmFnZXIgPSBMaXN0TWFuYWdlcigpO1xuXG4gIGlmKGluaXRQYXJhbXMubGF0ICYmIGluaXRQYXJhbXMubG5nKSB7XG4gICAgbWFwTWFuYWdlci5zZXRDZW50ZXIoW2luaXRQYXJhbXMubGF0LCBpbml0UGFyYW1zLmxuZ10pO1xuICB9XG5cbiAgLyoqKlxuICAqIExpc3QgRXZlbnRzXG4gICogVGhpcyB3aWxsIHRyaWdnZXIgdGhlIGxpc3QgdXBkYXRlIG1ldGhvZFxuICAqL1xuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnBvcHVsYXRlTGlzdChvcHRpb25zLnBhcmFtcyk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnVwZGF0ZUZpbHRlcihvcHRpb25zKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICBsZXQgYm91bmQxLCBib3VuZDI7XG4gICAgXG4gICAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLmJvdW5kMSB8fCAhb3B0aW9ucy5ib3VuZDIpIHtcbiAgICAgIFtib3VuZDEsIGJvdW5kMl0gPSBtYXBNYW5hZ2VyLmdldEJvdW5kcygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBib3VuZDEgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQxKTtcbiAgICAgIGJvdW5kMiA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDIpO1xuICAgIH1cblxuXG5cbiAgICBsaXN0TWFuYWdlci51cGRhdGVCb3VuZHMoYm91bmQxLCBib3VuZDIpXG4gIH0pXG5cbiAgLyoqKlxuICAqIE1hcCBFdmVudHNcbiAgKi9cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIC8vIG1hcE1hbmFnZXIuc2V0Q2VudGVyKFtvcHRpb25zLmxhdCwgb3B0aW9ucy5sbmddKTtcbiAgICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMuYm91bmQxIHx8ICFvcHRpb25zLmJvdW5kMikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBib3VuZDEgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQxKTtcbiAgICB2YXIgYm91bmQyID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMik7XG4gICAgbWFwTWFuYWdlci5zZXRCb3VuZHMoYm91bmQxLCBib3VuZDIpO1xuICAgIC8vIGNvbnNvbGUubG9nKG9wdGlvbnMpXG4gIH0pO1xuICAvLyAzLiBtYXJrZXJzIG9uIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtcGxvdCcsIChlLCBvcHQpID0+IHtcblxuICAgIG1hcE1hbmFnZXIucGxvdFBvaW50cyhvcHQuZGF0YSwgb3B0LnBhcmFtcyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJyk7XG4gIH0pXG5cbiAgLy8gRmlsdGVyIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtZmlsdGVyJywgKGUsIG9wdCkgPT4ge1xuICAgIGlmIChvcHQpIHtcbiAgICAgIG1hcE1hbmFnZXIuZmlsdGVyTWFwKG9wdC5maWx0ZXIpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgKGUsIG9wdCkgPT4ge1xuICAgIGlmIChvcHQpIHtcbiAgICAgIGxhbmd1YWdlTWFuYWdlci51cGRhdGVMYW5ndWFnZShvcHQubGFuZyk7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uI3Nob3ctaGlkZS1tYXAnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnYm9keScpLnRvZ2dsZUNsYXNzKCdtYXAtdmlldycpXG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24uYnRuLm1vcmUtaXRlbXMnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnI2VtYmVkLWFyZWEnKS50b2dnbGVDbGFzcygnb3BlbicpO1xuICB9KVxuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIChlLCBvcHQpID0+IHtcbiAgICAvL3VwZGF0ZSBlbWJlZCBsaW5lXG4gICAgdmFyIGNvcHkgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9wdCkpO1xuICAgIGRlbGV0ZSBjb3B5WydsbmcnXTtcbiAgICBkZWxldGUgY29weVsnbGF0J107XG4gICAgZGVsZXRlIGNvcHlbJ2JvdW5kMSddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDInXTtcblxuICAgICQoJyNlbWJlZC1hcmVhIGlucHV0W25hbWU9ZW1iZWRdJykudmFsKCdodHRwczovL25ldy1tYXAuMzUwLm9yZyMnICsgJC5wYXJhbShjb3B5KSk7XG4gIH0pO1xuXG4gICQod2luZG93KS5vbihcInJlc2l6ZVwiLCAoZSkgPT4ge1xuICAgIG1hcE1hbmFnZXIucmVmcmVzaE1hcCgpO1xuICB9KTtcblxuICAkKHdpbmRvdykub24oXCJoYXNoY2hhbmdlXCIsIChldmVudCkgPT4ge1xuICAgIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICBpZiAoaGFzaC5sZW5ndGggPT0gMCkgcmV0dXJuO1xuICAgIGNvbnN0IHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oaGFzaC5zdWJzdHJpbmcoMSkpO1xuICAgIGNvbnN0IG9sZFVSTCA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQub2xkVVJMO1xuXG5cbiAgICBjb25zdCBvbGRIYXNoID0gJC5kZXBhcmFtKG9sZFVSTC5zdWJzdHJpbmcob2xkVVJMLnNlYXJjaChcIiNcIikrMSkpO1xuXG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCBwYXJhbWV0ZXJzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuXG4gICAgLy8gU28gdGhhdCBjaGFuZ2UgaW4gZmlsdGVycyB3aWxsIG5vdCB1cGRhdGUgdGhpc1xuICAgIGlmIChvbGRIYXNoLmJvdW5kMSAhPT0gcGFyYW1ldGVycy5ib3VuZDEgfHwgb2xkSGFzaC5ib3VuZDIgIT09IHBhcmFtZXRlcnMuYm91bmQyKSB7XG5cbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci1ieS1ib3VuZCcsIHBhcmFtZXRlcnMpO1xuICAgIH1cblxuICAgIC8vIENoYW5nZSBpdGVtc1xuICAgIGlmIChvbGRIYXNoLmxhbmcgIT09IHBhcmFtZXRlcnMubGFuZykge1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sYW5ndWFnZS11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG4gIH0pXG5cbiAgLy8gNC4gZmlsdGVyIG91dCBpdGVtcyBpbiBhY3Rpdml0eS1hcmVhXG5cbiAgLy8gNS4gZ2V0IG1hcCBlbGVtZW50c1xuXG4gIC8vIDYuIGdldCBHcm91cCBkYXRhXG5cbiAgLy8gNy4gcHJlc2VudCBncm91cCBlbGVtZW50c1xuXG4gICQuYWpheCh7XG4gICAgdXJsOiAnaHR0cHM6Ly9zMy11cy13ZXN0LTIuYW1hem9uYXdzLmNvbS9wcGxzbWFwLWRhdGEvb3V0cHV0LzM1MG9yZy5qcy5neicsIC8vJ3wqKkRBVEFfU09VUkNFKip8JyxcbiAgICBkYXRhVHlwZTogJ3NjcmlwdCcsXG4gICAgY2FjaGU6IHRydWUsXG4gICAgc3VjY2VzczogKGRhdGEpID0+IHtcbiAgICAgIHZhciBwYXJhbWV0ZXJzID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuICAgICAgd2luZG93LkVWRU5UU19EQVRBLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgaXRlbVsnZXZlbnRfdHlwZSddID0gIWl0ZW0uZXZlbnRfdHlwZSA/ICdBY3Rpb24nIDogaXRlbS5ldmVudF90eXBlO1xuICAgICAgfSlcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC11cGRhdGUnLCB7IHBhcmFtczogcGFyYW1ldGVycyB9KTtcbiAgICAgIC8vICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1wbG90JywgeyBkYXRhOiB3aW5kb3cuRVZFTlRTX0RBVEEsIHBhcmFtczogcGFyYW1ldGVycyB9KTtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgcGFyYW1ldGVycyk7XG4gICAgICAvL1RPRE86IE1ha2UgdGhlIGdlb2pzb24gY29udmVyc2lvbiBoYXBwZW4gb24gdGhlIGJhY2tlbmRcblxuICAgICAgLy9SZWZyZXNoIHRoaW5nc1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGxldCBwID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcbiAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcCk7XG4gICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicsIHApO1xuICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHApO1xuICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLWJ5LWJvdW5kJywgcCk7XG4gICAgICAgIC8vY29uc29sZS5sb2cocXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKSlcbiAgICAgIH0sIDEwMCk7XG4gICAgfVxuICB9KTtcblxuXG5cbn0pKGpRdWVyeSk7XG4iXX0=
