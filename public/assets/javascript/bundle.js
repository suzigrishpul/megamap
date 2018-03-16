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

            $(document).trigger('trigger-language-loaded');
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
      // let superGroup = window.slugify(item.supergroup);

      return "\n      <li class='" + window.slugify(item.event_type) + " event-obj' data-lat='" + item.lat + "' data-lng='" + item.lng + "'>\n        <div class=\"type-event type-action\">\n          <ul class=\"event-types-list\">\n            <li class='tag-" + item.event_type + " tag'>" + item.event_type + "</li>\n          </ul>\n          <h2 class=\"event-title\"><a href=\"" + url + "\" target='_blank'>" + item.title + "</a></h2>\n          <div class=\"event-date date\">" + date + "</div>\n          <div class=\"event-address address-area\">\n            <p>" + item.venue + "</p>\n          </div>\n          <div class=\"call-to-action\">\n            <a href=\"" + url + "\" target='_blank' class=\"btn btn-secondary\">RSVP</a>\n          </div>\n        </div>\n      </li>\n      ";
    };

    var renderGroup = function renderGroup(item) {
      var url = item.website.match(/^https{0,1}:/) ? item.website : "//" + item.website;
      var superGroup = window.slugify(item.supergroup);
      console.log(superGroup);
      return "\n      <li class='" + item.event_type + " " + superGroup + " group-obj' data-lat='" + item.lat + "' data-lng='" + item.lng + "'>\n        <div class=\"type-group group-obj\">\n          <ul class=\"event-types-list\">\n            <li class=\"tag tag-" + item.supergroup + "\">" + item.supergroup + "</li>\n          </ul>\n          <h2><a href=\"" + url + "\" target='_blank'>" + item.name + "</a></h2>\n          <div class=\"group-details-area\">\n            <div class=\"group-location location\">" + item.location + "</div>\n            <div class=\"group-description\">\n              <p>" + item.description + "</p>\n            </div>\n          </div>\n          <div class=\"call-to-action\">\n            <a href=\"" + url + "\" target='_blank' class=\"btn btn-secondary\">Get Involved</a>\n          </div>\n        </div>\n      </li>\n      ";
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

        var $eventList = window.EVENTS_DATA.data.map(function (item) {
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

    var superGroup = window.slugify(item.supergroup);
    return "\n    <div class='popup-item " + item.event_type + " " + superGroup + "' data-lat='" + item.lat + "' data-lng='" + item.lng + "'>\n      <div class=\"type-event\">\n        <ul class=\"event-types-list\">\n          <li class=\"tag tag-" + item.event_type + "\">" + (item.event_type || 'Action') + "</li>\n        </ul>\n        <h2 class=\"event-title\"><a href=\"" + url + "\" target='_blank'>" + item.title + "</a></h2>\n        <div class=\"event-date\">" + date + "</div>\n        <div class=\"event-address address-area\">\n          <p>" + item.venue + "</p>\n        </div>\n        <div class=\"call-to-action\">\n          <a href=\"" + url + "\" target='_blank' class=\"btn btn-secondary\">RSVP</a>\n        </div>\n      </div>\n    </div>\n    ";
  };

  var renderGroup = function renderGroup(item) {

    var url = item.website.match(/^https{0,1}:/) ? item.website : "//" + item.website;
    var superGroup = window.slugify(item.supergroup);
    return "\n    <li>\n      <div class=\"type-group group-obj " + superGroup + "\">\n        <ul class=\"event-types-list\">\n          <li class=\"tag tag-" + item.supergroup + " " + superGroup + "\">" + item.supergroup + "</li>\n        </ul>\n        <div class=\"group-header\">\n          <h2><a href=\"" + url + "\" target='_blank'>" + item.name + "</a></h2>\n          <div class=\"group-location location\">" + item.location + "</div>\n        </div>\n        <div class=\"group-details-area\">\n          <div class=\"group-description\">\n            <p>" + item.description + "</p>\n          </div>\n        </div>\n        <div class=\"call-to-action\">\n          <a href=\"" + url + "\" target='_blank' class=\"btn btn-secondary\">Get Involved</a>\n        </div>\n      </div>\n    </li>\n    ";
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

        console.log(filters);
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
            var slugged = window.slugify(feature.properties.eventProperties.supergroup);
            var groupIcon = L.icon({
              iconUrl: eventType && eventType.toLowerCase() === 'group' ? '/img/group.svg' : '/img/event.svg',
              iconSize: [22, 22],
              iconAnchor: [12, 8],
              className: slugged + ' event-item-popup'
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

window.slugify = function (text) {
  return text.toString().toLowerCase().replace(/\s+/g, '-') // Replace spaces with -
  .replace(/[^\w\-]+/g, '') // Remove all non-word chars
  .replace(/\-\-+/g, '-') // Replace multiple - with single -
  .replace(/^-+/, '') // Trim - from start of text
  .replace(/-+$/, '');
}; // Trim - from end of text

(function ($) {
  // Load things
  $('select#filter-items').multiselect();
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

  // load groups

  $(document).on('trigger-load-groups', function (e, opt) {

    opt.groups.forEach(function (item) {
      var slugged = window.slugify(item.supergroup);
      $('select#filter-items').append('<option value=\'' + slugged + '\' selected=\'selected\'>' + item.supergroup + '</option>');
    });

    // Re-initialize
    queryManager.initialize();
    $('select#filter-items').multiselect('rebuild');
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
    url: '/data/test.json', //'|**DATA_SOURCE**|',
    dataType: 'json',
    cache: true,
    success: function success(data) {
      window.EVENTS_DATA = data;

      //Load groups
      $(document).trigger('trigger-load-groups', { groups: window.EVENTS_DATA.groups });

      var parameters = queryManager.getParameters();

      window.EVENTS_DATA.data.forEach(function (item) {
        item['event_type'] = !item.event_type ? 'Action' : item.event_type;
      });
      $(document).trigger('trigger-list-update', { params: parameters });
      // $(document).trigger('trigger-list-filter-update', parameters);
      $(document).trigger('trigger-map-plot', { data: window.EVENTS_DATA.data, params: parameters });
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9sYW5ndWFnZS5qcyIsImNsYXNzZXMvbGlzdC5qcyIsImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9xdWVyeS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJBdXRvY29tcGxldGVNYW5hZ2VyIiwiJCIsInRhcmdldCIsIkFQSV9LRVkiLCJ0YXJnZXRJdGVtIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwicXVlcnlNZ3IiLCJRdWVyeU1hbmFnZXIiLCJnZW9jb2RlciIsImdvb2dsZSIsIm1hcHMiLCJHZW9jb2RlciIsIiR0YXJnZXQiLCJpbml0aWFsaXplIiwidHlwZWFoZWFkIiwiaGludCIsImhpZ2hsaWdodCIsIm1pbkxlbmd0aCIsImNsYXNzTmFtZXMiLCJtZW51IiwibmFtZSIsImRpc3BsYXkiLCJpdGVtIiwiZm9ybWF0dGVkX2FkZHJlc3MiLCJsaW1pdCIsInNvdXJjZSIsInEiLCJzeW5jIiwiYXN5bmMiLCJnZW9jb2RlIiwiYWRkcmVzcyIsInJlc3VsdHMiLCJzdGF0dXMiLCJvbiIsIm9iaiIsImRhdHVtIiwiZ2VvbWV0cnkiLCJ1cGRhdGVWaWV3cG9ydCIsInZpZXdwb3J0IiwialF1ZXJ5IiwiTGFuZ3VhZ2VNYW5hZ2VyIiwibGFuZ3VhZ2UiLCJkaWN0aW9uYXJ5IiwiJHRhcmdldHMiLCJ1cGRhdGVQYWdlTGFuZ3VhZ2UiLCJ0YXJnZXRMYW5ndWFnZSIsInJvd3MiLCJmaWx0ZXIiLCJpIiwibGFuZyIsImVhY2giLCJpbmRleCIsInRhcmdldEF0dHJpYnV0ZSIsImRhdGEiLCJsYW5nVGFyZ2V0IiwidGV4dCIsInZhbCIsImF0dHIiLCJ0YXJnZXRzIiwiYWpheCIsInVybCIsImRhdGFUeXBlIiwic3VjY2VzcyIsInRyaWdnZXIiLCJ1cGRhdGVMYW5ndWFnZSIsIkxpc3RNYW5hZ2VyIiwidGFyZ2V0TGlzdCIsInJlbmRlckV2ZW50IiwiZGF0ZSIsIm1vbWVudCIsIkRhdGUiLCJzdGFydF9kYXRldGltZSIsInRvR01UU3RyaW5nIiwiZm9ybWF0IiwibWF0Y2giLCJ3aW5kb3ciLCJzbHVnaWZ5IiwiZXZlbnRfdHlwZSIsImxhdCIsImxuZyIsInRpdGxlIiwidmVudWUiLCJyZW5kZXJHcm91cCIsIndlYnNpdGUiLCJzdXBlckdyb3VwIiwic3VwZXJncm91cCIsImNvbnNvbGUiLCJsb2ciLCJsb2NhdGlvbiIsImRlc2NyaXB0aW9uIiwiJGxpc3QiLCJ1cGRhdGVGaWx0ZXIiLCJwIiwicmVtb3ZlUHJvcCIsImFkZENsYXNzIiwiam9pbiIsInVwZGF0ZUJvdW5kcyIsImJvdW5kMSIsImJvdW5kMiIsImZpbmQiLCJpbmQiLCJfbGF0IiwiX2xuZyIsInJlbW92ZUNsYXNzIiwicG9wdWxhdGVMaXN0IiwiaGFyZEZpbHRlcnMiLCJrZXlTZXQiLCJrZXkiLCJzcGxpdCIsIiRldmVudExpc3QiLCJFVkVOVFNfREFUQSIsIm1hcCIsImxlbmd0aCIsInRvTG93ZXJDYXNlIiwiaW5jbHVkZXMiLCJyZW1vdmUiLCJhcHBlbmQiLCJNYXBNYW5hZ2VyIiwiTEFOR1VBR0UiLCJyZW5kZXJHZW9qc29uIiwibGlzdCIsInJlbmRlcmVkIiwiaXNOYU4iLCJwYXJzZUZsb2F0Iiwic3Vic3RyaW5nIiwidHlwZSIsImNvb3JkaW5hdGVzIiwicHJvcGVydGllcyIsImV2ZW50UHJvcGVydGllcyIsInBvcHVwQ29udGVudCIsIm9wdGlvbnMiLCJhY2Nlc3NUb2tlbiIsIkwiLCJkcmFnZ2luZyIsIkJyb3dzZXIiLCJtb2JpbGUiLCJzZXRWaWV3Iiwic2Nyb2xsV2hlZWxab29tIiwiZGlzYWJsZSIsIm9uTW92ZSIsImV2ZW50Iiwic3ciLCJnZXRCb3VuZHMiLCJfc291dGhXZXN0IiwibmUiLCJfbm9ydGhFYXN0IiwidGlsZUxheWVyIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsIiRtYXAiLCJjYWxsYmFjayIsInNldEJvdW5kcyIsImJvdW5kczEiLCJib3VuZHMyIiwiYm91bmRzIiwiZml0Qm91bmRzIiwic2V0Q2VudGVyIiwiY2VudGVyIiwiem9vbSIsImdldENlbnRlckJ5TG9jYXRpb24iLCJyZWZyZXNoTWFwIiwiaW52YWxpZGF0ZVNpemUiLCJmaWx0ZXJNYXAiLCJmaWx0ZXJzIiwiaGlkZSIsImZvckVhY2giLCJzaG93IiwicGxvdFBvaW50cyIsImdlb2pzb24iLCJmZWF0dXJlcyIsImdlb0pTT04iLCJwb2ludFRvTGF5ZXIiLCJmZWF0dXJlIiwibGF0bG5nIiwiZXZlbnRUeXBlIiwic2x1Z2dlZCIsImdyb3VwSWNvbiIsImljb24iLCJpY29uVXJsIiwiaWNvblNpemUiLCJpY29uQW5jaG9yIiwiY2xhc3NOYW1lIiwiZXZlbnRJY29uIiwiZ2VvanNvbk1hcmtlck9wdGlvbnMiLCJtYXJrZXIiLCJvbkVhY2hGZWF0dXJlIiwibGF5ZXIiLCJiaW5kUG9wdXAiLCJ1cGRhdGUiLCJsYXRMbmciLCJ0YXJnZXRGb3JtIiwicHJldmlvdXMiLCJlIiwicHJldmVudERlZmF1bHQiLCJmb3JtIiwiZGVwYXJhbSIsInNlcmlhbGl6ZSIsImhhc2giLCJwYXJhbSIsInBhcmFtcyIsImxvYyIsInByb3AiLCJnZXRQYXJhbWV0ZXJzIiwicGFyYW1ldGVycyIsInVwZGF0ZUxvY2F0aW9uIiwiZiIsImIiLCJKU09OIiwic3RyaW5naWZ5IiwidXBkYXRlVmlld3BvcnRCeUJvdW5kIiwidHJpZ2dlclN1Ym1pdCIsImF1dG9jb21wbGV0ZU1hbmFnZXIiLCJtYXBNYW5hZ2VyIiwidG9TdHJpbmciLCJyZXBsYWNlIiwibXVsdGlzZWxlY3QiLCJxdWVyeU1hbmFnZXIiLCJpbml0UGFyYW1zIiwiaW5pdGlhbGl6ZUF1dG9jb21wbGV0ZUNhbGxiYWNrIiwicmVzdWx0IiwibGFuZ3VhZ2VNYW5hZ2VyIiwibGlzdE1hbmFnZXIiLCJwYXJzZSIsIm9wdCIsImdyb3VwcyIsInRvZ2dsZUNsYXNzIiwiY29weSIsIm9sZFVSTCIsIm9yaWdpbmFsRXZlbnQiLCJvbGRIYXNoIiwic2VhcmNoIiwiY2FjaGUiLCJzZXRUaW1lb3V0Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNB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UEg7QUFRRDtBQS9CSSxHQUFQO0FBb0NELENBdk5ELEVBdU5HckQsTUF2TkgiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vL0FQSSA6QUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXG5jb25zdCBBdXRvY29tcGxldGVNYW5hZ2VyID0gKGZ1bmN0aW9uKCQpIHtcbiAgLy9Jbml0aWFsaXphdGlvbi4uLlxuXG4gIHJldHVybiAodGFyZ2V0KSA9PiB7XG5cbiAgICBjb25zdCBBUElfS0VZID0gXCJBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cIjtcbiAgICBjb25zdCB0YXJnZXRJdGVtID0gdHlwZW9mIHRhcmdldCA9PSBcInN0cmluZ1wiID8gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpIDogdGFyZ2V0O1xuICAgIGNvbnN0IHF1ZXJ5TWdyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgdmFyIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgJHRhcmdldDogJCh0YXJnZXRJdGVtKSxcbiAgICAgIHRhcmdldDogdGFyZ2V0SXRlbSxcbiAgICAgIGluaXRpYWxpemU6ICgpID0+IHtcbiAgICAgICAgJCh0YXJnZXRJdGVtKS50eXBlYWhlYWQoe1xuICAgICAgICAgICAgICAgICAgICBoaW50OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1pbkxlbmd0aDogNCxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICAgIG1lbnU6ICd0dC1kcm9wZG93bi1tZW51J1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnc2VhcmNoLXJlc3VsdHMnLFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAoaXRlbSkgPT4gaXRlbS5mb3JtYXR0ZWRfYWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgbGltaXQ6IDEwLFxuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IGZ1bmN0aW9uIChxLCBzeW5jLCBhc3luYyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogcSB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFzeW5jKHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApLm9uKCd0eXBlYWhlYWQ6c2VsZWN0ZWQnLCBmdW5jdGlvbiAob2JqLCBkYXR1bSkge1xuICAgICAgICAgICAgICAgICAgICBpZihkYXR1bSlcbiAgICAgICAgICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgICAgICAgdmFyIGdlb21ldHJ5ID0gZGF0dW0uZ2VvbWV0cnk7XG4gICAgICAgICAgICAgICAgICAgICAgcXVlcnlNZ3IudXBkYXRlVmlld3BvcnQoZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgICAgIC8vICBtYXAuZml0Qm91bmRzKGdlb21ldHJ5LmJvdW5kcz8gZ2VvbWV0cnkuYm91bmRzIDogZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG5cblxuICAgIHJldHVybiB7XG5cbiAgICB9XG4gIH1cblxufShqUXVlcnkpKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTGFuZ3VhZ2VNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIC8va2V5VmFsdWVcblxuICAvL3RhcmdldHMgYXJlIHRoZSBtYXBwaW5ncyBmb3IgdGhlIGxhbmd1YWdlXG4gIHJldHVybiAoKSA9PiB7XG4gICAgbGV0IGxhbmd1YWdlO1xuICAgIGxldCBkaWN0aW9uYXJ5ID0ge307XG4gICAgbGV0ICR0YXJnZXRzID0gJChcIltkYXRhLWxhbmctdGFyZ2V0XVtkYXRhLWxhbmcta2V5XVwiKTtcblxuICAgIGNvbnN0IHVwZGF0ZVBhZ2VMYW5ndWFnZSA9ICgpID0+IHtcblxuICAgICAgbGV0IHRhcmdldExhbmd1YWdlID0gZGljdGlvbmFyeS5yb3dzLmZpbHRlcigoaSkgPT4gaS5sYW5nID09PSBsYW5ndWFnZSlbMF07XG5cbiAgICAgICR0YXJnZXRzLmVhY2goKGluZGV4LCBpdGVtKSA9PiB7XG4gICAgICAgIGxldCB0YXJnZXRBdHRyaWJ1dGUgPSAkKGl0ZW0pLmRhdGEoJ2xhbmctdGFyZ2V0Jyk7XG4gICAgICAgIGxldCBsYW5nVGFyZ2V0ID0gJChpdGVtKS5kYXRhKCdsYW5nLWtleScpO1xuXG4gICAgICAgIHN3aXRjaCh0YXJnZXRBdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjYXNlICd0ZXh0JzpcbiAgICAgICAgICAgICQoaXRlbSkudGV4dCh0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd2YWx1ZSc6XG4gICAgICAgICAgICAkKGl0ZW0pLnZhbCh0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgJChpdGVtKS5hdHRyKHRhcmdldEF0dHJpYnV0ZSwgdGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICBsYW5ndWFnZSxcbiAgICAgIHRhcmdldHM6ICR0YXJnZXRzLFxuICAgICAgZGljdGlvbmFyeSxcbiAgICAgIGluaXRpYWxpemU6IChsYW5nKSA9PiB7XG5cbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAvLyB1cmw6ICdodHRwczovL2dzeDJqc29uLmNvbS9hcGk/aWQ9MU8zZUJ5akwxdmxZZjdaN2FtLV9odFJUUWk3M1BhZnFJZk5CZExtWGU4U00mc2hlZXQ9MScsXG4gICAgICAgICAgdXJsOiAnL2RhdGEvbGFuZy5qc29uJyxcbiAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICBkaWN0aW9uYXJ5ID0gZGF0YTtcbiAgICAgICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZSgpO1xuXG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxhbmd1YWdlLWxvYWRlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTGFuZ3VhZ2U6IChsYW5nKSA9PiB7XG5cbiAgICAgICAgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbn0pKGpRdWVyeSk7XG4iLCIvKiBUaGlzIGxvYWRzIGFuZCBtYW5hZ2VzIHRoZSBsaXN0ISAqL1xuXG5jb25zdCBMaXN0TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldExpc3QgPSBcIiNldmVudHMtbGlzdFwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRMaXN0ID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0TGlzdCkgOiB0YXJnZXRMaXN0O1xuXG4gICAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSkgPT4ge1xuXG4gICAgICB2YXIgZGF0ZSA9IG1vbWVudChuZXcgRGF0ZShpdGVtLnN0YXJ0X2RhdGV0aW1lKS50b0dNVFN0cmluZygpKS5mb3JtYXQoXCJkZGRkIE1NTSBERCwgaDptbWFcIik7XG4gICAgICBsZXQgdXJsID0gaXRlbS51cmwubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS51cmwgOiBcIi8vXCIgKyBpdGVtLnVybDtcbiAgICAgIC8vIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcblxuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaSBjbGFzcz0nJHt3aW5kb3cuc2x1Z2lmeShpdGVtLmV2ZW50X3R5cGUpfSBldmVudC1vYmonIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnQgdHlwZS1hY3Rpb25cIj5cbiAgICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgICA8bGkgY2xhc3M9J3RhZy0ke2l0ZW0uZXZlbnRfdHlwZX0gdGFnJz4ke2l0ZW0uZXZlbnRfdHlwZX08L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPGgyIGNsYXNzPVwiZXZlbnQtdGl0bGVcIj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZX08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtZGF0ZSBkYXRlXCI+JHtkYXRlfTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1hZGRyZXNzIGFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgICAgPHA+JHtpdGVtLnZlbnVlfTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPlJTVlA8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSkgPT4ge1xuICAgICAgbGV0IHVybCA9IGl0ZW0ud2Vic2l0ZS5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLndlYnNpdGUgOiBcIi8vXCIgKyBpdGVtLndlYnNpdGU7XG4gICAgICBsZXQgc3VwZXJHcm91cCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG4gICAgICBjb25zb2xlLmxvZyhzdXBlckdyb3VwKTtcbiAgICAgIHJldHVybiBgXG4gICAgICA8bGkgY2xhc3M9JyR7aXRlbS5ldmVudF90eXBlfSAke3N1cGVyR3JvdXB9IGdyb3VwLW9iaicgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ncm91cCBncm91cC1vYmpcIj5cbiAgICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5zdXBlcmdyb3VwfVwiPiR7aXRlbS5zdXBlcmdyb3VwfTwvbGk+XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0ubmFtZX08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtbG9jYXRpb24gbG9jYXRpb25cIj4ke2l0ZW0ubG9jYXRpb259PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGVzY3JpcHRpb25cIj5cbiAgICAgICAgICAgICAgPHA+JHtpdGVtLmRlc2NyaXB0aW9ufTwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+R2V0IEludm9sdmVkPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAkbGlzdDogJHRhcmdldCxcbiAgICAgIHVwZGF0ZUZpbHRlcjogKHApID0+IHtcbiAgICAgICAgaWYoIXApIHJldHVybjtcblxuICAgICAgICAvLyBSZW1vdmUgRmlsdGVyc1xuXG4gICAgICAgICR0YXJnZXQucmVtb3ZlUHJvcChcImNsYXNzXCIpO1xuICAgICAgICAkdGFyZ2V0LmFkZENsYXNzKHAuZmlsdGVyID8gcC5maWx0ZXIuam9pbihcIiBcIikgOiAnJylcbiAgICAgIH0sXG4gICAgICB1cGRhdGVCb3VuZHM6IChib3VuZDEsIGJvdW5kMikgPT4ge1xuXG4gICAgICAgIC8vIGNvbnN0IGJvdW5kcyA9IFtwLmJvdW5kczEsIHAuYm91bmRzMl07XG5cblxuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsIGxpLmV2ZW50LW9iaiwgdWwgbGkuZ3JvdXAtb2JqJykuZWFjaCgoaW5kLCBpdGVtKT0+IHtcblxuICAgICAgICAgIGxldCBfbGF0ID0gJChpdGVtKS5kYXRhKCdsYXQnKSxcbiAgICAgICAgICAgICAgX2xuZyA9ICQoaXRlbSkuZGF0YSgnbG5nJyk7XG5cbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInVwZGF0ZUJvdW5kc1wiLCBpdGVtKVxuICAgICAgICAgIGlmIChib3VuZDFbMF0gPD0gX2xhdCAmJiBib3VuZDJbMF0gPj0gX2xhdCAmJiBib3VuZDFbMV0gPD0gX2xuZyAmJiBib3VuZDJbMV0gPj0gX2xuZykge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJBZGRpbmcgYm91bmRzXCIpO1xuICAgICAgICAgICAgJChpdGVtKS5hZGRDbGFzcygnd2l0aGluLWJvdW5kJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoaXRlbSkucmVtb3ZlQ2xhc3MoJ3dpdGhpbi1ib3VuZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgcG9wdWxhdGVMaXN0OiAoaGFyZEZpbHRlcnMpID0+IHtcbiAgICAgICAgLy91c2luZyB3aW5kb3cuRVZFTlRfREFUQVxuICAgICAgICBjb25zdCBrZXlTZXQgPSAhaGFyZEZpbHRlcnMua2V5ID8gW10gOiBoYXJkRmlsdGVycy5rZXkuc3BsaXQoJywnKTtcblxuICAgICAgICB2YXIgJGV2ZW50TGlzdCA9IHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhLm1hcChpdGVtID0+IHtcbiAgICAgICAgICBpZiAoa2V5U2V0Lmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbS5ldmVudF90eXBlICYmIGl0ZW0uZXZlbnRfdHlwZS50b0xvd2VyQ2FzZSgpID09ICdncm91cCcgPyByZW5kZXJHcm91cChpdGVtKSA6IHJlbmRlckV2ZW50KGl0ZW0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2V5U2V0Lmxlbmd0aCA+IDAgJiYgaXRlbS5ldmVudF90eXBlICE9ICdncm91cCcgJiYga2V5U2V0LmluY2x1ZGVzKGl0ZW0uZXZlbnRfdHlwZSkpIHtcbiAgICAgICAgICAgIHJldHVybiByZW5kZXJFdmVudChpdGVtKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtleVNldC5sZW5ndGggPiAwICYmIGl0ZW0uZXZlbnRfdHlwZSA9PSAnZ3JvdXAnICYmIGtleVNldC5pbmNsdWRlcyhpdGVtLnN1cGVyZ3JvdXApKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyR3JvdXAoaXRlbSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICB9KVxuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsIGxpJykucmVtb3ZlKCk7XG4gICAgICAgICR0YXJnZXQuZmluZCgndWwnKS5hcHBlbmQoJGV2ZW50TGlzdCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsIlxuY29uc3QgTWFwTWFuYWdlciA9ICgoJCkgPT4ge1xuICBsZXQgTEFOR1VBR0UgPSAnZW4nO1xuXG4gIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0pID0+IHtcbiAgICB2YXIgZGF0ZSA9IG1vbWVudChpdGVtLnN0YXJ0X2RhdGV0aW1lKS5mb3JtYXQoXCJkZGRkIE1NTSBERCwgaDptbWFcIik7XG4gICAgbGV0IHVybCA9IGl0ZW0udXJsLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0udXJsIDogXCIvL1wiICsgaXRlbS51cmw7XG5cbiAgICBsZXQgc3VwZXJHcm91cCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG4gICAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPSdwb3B1cC1pdGVtICR7aXRlbS5ldmVudF90eXBlfSAke3N1cGVyR3JvdXB9JyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudFwiPlxuICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgPGxpIGNsYXNzPVwidGFnIHRhZy0ke2l0ZW0uZXZlbnRfdHlwZX1cIj4ke2l0ZW0uZXZlbnRfdHlwZSB8fCAnQWN0aW9uJ308L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8aDIgY2xhc3M9XCJldmVudC10aXRsZVwiPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtZGF0ZVwiPiR7ZGF0ZX08L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWFkZHJlc3MgYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgPHA+JHtpdGVtLnZlbnVlfTwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPlJTVlA8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgYFxuICB9O1xuXG4gIGNvbnN0IHJlbmRlckdyb3VwID0gKGl0ZW0pID0+IHtcblxuICAgIGxldCB1cmwgPSBpdGVtLndlYnNpdGUubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS53ZWJzaXRlIDogXCIvL1wiICsgaXRlbS53ZWJzaXRlO1xuICAgIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICByZXR1cm4gYFxuICAgIDxsaT5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwIGdyb3VwLW9iaiAke3N1cGVyR3JvdXB9XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5zdXBlcmdyb3VwfSAke3N1cGVyR3JvdXB9XCI+JHtpdGVtLnN1cGVyZ3JvdXB9PC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWhlYWRlclwiPlxuICAgICAgICAgIDxoMj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS5uYW1lfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1sb2NhdGlvbiBsb2NhdGlvblwiPiR7aXRlbS5sb2NhdGlvbn08L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGVzY3JpcHRpb25cIj5cbiAgICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9saT5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR2VvanNvbiA9IChsaXN0KSA9PiB7XG4gICAgcmV0dXJuIGxpc3QubWFwKChpdGVtKSA9PiB7XG4gICAgICAvLyByZW5kZXJlZCBldmVudFR5cGVcbiAgICAgIGxldCByZW5kZXJlZDtcblxuICAgICAgaWYgKGl0ZW0uZXZlbnRfdHlwZSAmJiBpdGVtLmV2ZW50X3R5cGUudG9Mb3dlckNhc2UoKSA9PSAnZ3JvdXAnKSB7XG4gICAgICAgIHJlbmRlcmVkID0gcmVuZGVyR3JvdXAoaXRlbSk7XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlbmRlcmVkID0gcmVuZGVyRXZlbnQoaXRlbSk7XG4gICAgICB9XG5cbiAgICAgIC8vIGZvcm1hdCBjaGVja1xuICAgICAgaWYgKGlzTmFOKHBhcnNlRmxvYXQocGFyc2VGbG9hdChpdGVtLmxuZykpKSkge1xuICAgICAgICBpdGVtLmxuZyA9IGl0ZW0ubG5nLnN1YnN0cmluZygxKVxuICAgICAgfVxuICAgICAgaWYgKGlzTmFOKHBhcnNlRmxvYXQocGFyc2VGbG9hdChpdGVtLmxhdCkpKSkge1xuICAgICAgICBpdGVtLmxhdCA9IGl0ZW0ubGF0LnN1YnN0cmluZygxKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICAgIGdlb21ldHJ5OiB7XG4gICAgICAgICAgdHlwZTogXCJQb2ludFwiLFxuICAgICAgICAgIGNvb3JkaW5hdGVzOiBbaXRlbS5sbmcsIGl0ZW0ubGF0XVxuICAgICAgICB9LFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgZXZlbnRQcm9wZXJ0aWVzOiBpdGVtLFxuICAgICAgICAgIHBvcHVwQ29udGVudDogcmVuZGVyZWRcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gKG9wdGlvbnMpID0+IHtcbiAgICB2YXIgYWNjZXNzVG9rZW4gPSAncGsuZXlKMUlqb2liV0YwZEdobGR6TTFNQ0lzSW1FaU9pSmFUVkZNVWtVd0luMC53Y00zWGM4QkdDNlBNLU95cndqbmhnJztcbiAgICB2YXIgbWFwID0gTC5tYXAoJ21hcCcsIHsgZHJhZ2dpbmc6ICFMLkJyb3dzZXIubW9iaWxlIH0pLnNldFZpZXcoWzM0Ljg4NTkzMDk0MDc1MzE3LCA1LjA5NzY1NjI1MDAwMDAwMV0sIDIpO1xuXG4gICAgaWYgKCFMLkJyb3dzZXIubW9iaWxlKSB7XG4gICAgICBtYXAuc2Nyb2xsV2hlZWxab29tLmRpc2FibGUoKTtcbiAgICB9XG5cbiAgICBMQU5HVUFHRSA9IG9wdGlvbnMubGFuZyB8fCAnZW4nO1xuXG4gICAgaWYgKG9wdGlvbnMub25Nb3ZlKSB7XG4gICAgICBtYXAub24oJ2RyYWdlbmQnLCAoZXZlbnQpID0+IHtcblxuXG4gICAgICAgIGxldCBzdyA9IFttYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxuZ107XG4gICAgICAgIGxldCBuZSA9IFttYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxuZ107XG4gICAgICAgIG9wdGlvbnMub25Nb3ZlKHN3LCBuZSk7XG4gICAgICB9KS5vbignem9vbWVuZCcsIChldmVudCkgPT4ge1xuXG5cbiAgICAgICAgbGV0IHN3ID0gW21hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW21hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubG5nXTtcbiAgICAgICAgb3B0aW9ucy5vbk1vdmUoc3csIG5lKTtcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgTC50aWxlTGF5ZXIoJ2h0dHBzOi8vYXBpLm1hcGJveC5jb20vc3R5bGVzL3YxL21hdHRoZXczNTAvY2phNDF0aWprMjdkNjJycW9kN2cwbHg0Yi90aWxlcy8yNTYve3p9L3t4fS97eX0/YWNjZXNzX3Rva2VuPScgKyBhY2Nlc3NUb2tlbiwge1xuICAgICAgICBhdHRyaWJ1dGlvbjogJyZjb3B5OyA8YSBocmVmPVwiaHR0cDovL29zbS5vcmcvY29weXJpZ2h0XCI+T3BlblN0cmVldE1hcDwvYT4gY29udHJpYnV0b3JzIOKAoiA8YSBocmVmPVwiLy8zNTAub3JnXCI+MzUwLm9yZzwvYT4nXG4gICAgfSkuYWRkVG8obWFwKTtcblxuICAgIGxldCBnZW9jb2RlciA9IG51bGw7XG4gICAgcmV0dXJuIHtcbiAgICAgICRtYXA6IG1hcCxcbiAgICAgIGluaXRpYWxpemU6IChjYWxsYmFjaykgPT4ge1xuICAgICAgICBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgc2V0Qm91bmRzOiAoYm91bmRzMSwgYm91bmRzMikgPT4ge1xuICAgICAgICBjb25zdCBib3VuZHMgPSBbYm91bmRzMSwgYm91bmRzMl07XG4gICAgICAgIG1hcC5maXRCb3VuZHMoYm91bmRzKTtcbiAgICAgIH0sXG4gICAgICBzZXRDZW50ZXI6IChjZW50ZXIsIHpvb20gPSAxMCkgPT4ge1xuICAgICAgICBpZiAoIWNlbnRlciB8fCAhY2VudGVyWzBdIHx8IGNlbnRlclswXSA9PSBcIlwiXG4gICAgICAgICAgICAgIHx8ICFjZW50ZXJbMV0gfHwgY2VudGVyWzFdID09IFwiXCIpIHJldHVybjtcbiAgICAgICAgbWFwLnNldFZpZXcoY2VudGVyLCB6b29tKTtcbiAgICAgIH0sXG4gICAgICBnZXRCb3VuZHM6ICgpID0+IHtcblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuXG4gICAgICAgIHJldHVybiBbc3csIG5lXTtcbiAgICAgIH0sXG4gICAgICAvLyBDZW50ZXIgbG9jYXRpb24gYnkgZ2VvY29kZWRcbiAgICAgIGdldENlbnRlckJ5TG9jYXRpb246IChsb2NhdGlvbiwgY2FsbGJhY2spID0+IHtcblxuICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogbG9jYXRpb24gfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuXG4gICAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2socmVzdWx0c1swXSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHJlZnJlc2hNYXA6ICgpID0+IHtcbiAgICAgICAgbWFwLmludmFsaWRhdGVTaXplKGZhbHNlKTtcbiAgICAgICAgLy8gbWFwLl9vblJlc2l6ZSgpO1xuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwibWFwIGlzIHJlc2l6ZWRcIilcbiAgICAgIH0sXG4gICAgICBmaWx0ZXJNYXA6IChmaWx0ZXJzKSA9PiB7XG5cbiAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwXCIpLmhpZGUoKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhmaWx0ZXJzKTtcbiAgICAgICAgaWYgKCFmaWx0ZXJzKSByZXR1cm47XG5cbiAgICAgICAgZmlsdGVycy5mb3JFYWNoKChpdGVtKSA9PiB7XG5cbiAgICAgICAgICAkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXAuXCIgKyBpdGVtLnRvTG93ZXJDYXNlKCkpLnNob3coKTtcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICBwbG90UG9pbnRzOiAobGlzdCwgaGFyZEZpbHRlcnMpID0+IHtcblxuICAgICAgICBjb25zdCBrZXlTZXQgPSAhaGFyZEZpbHRlcnMua2V5ID8gW10gOiBoYXJkRmlsdGVycy5rZXkuc3BsaXQoJywnKTtcblxuICAgICAgICBpZiAoa2V5U2V0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsaXN0ID0gbGlzdC5maWx0ZXIoKGl0ZW0pID0+IGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKVxuICAgICAgICB9XG5cblxuICAgICAgICBjb25zdCBnZW9qc29uID0ge1xuICAgICAgICAgIHR5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgICAgICAgICBmZWF0dXJlczogcmVuZGVyR2VvanNvbihsaXN0KVxuICAgICAgICB9O1xuXG5cblxuICAgICAgICBMLmdlb0pTT04oZ2VvanNvbiwge1xuICAgICAgICAgICAgcG9pbnRUb0xheWVyOiAoZmVhdHVyZSwgbGF0bG5nKSA9PiB7XG4gICAgICAgICAgICAgIC8vIEljb25zIGZvciBtYXJrZXJzXG4gICAgICAgICAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuZXZlbnRfdHlwZTtcbiAgICAgICAgICAgICAgY29uc3Qgc2x1Z2dlZCA9IHdpbmRvdy5zbHVnaWZ5KGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuc3VwZXJncm91cCk7XG4gICAgICAgICAgICAgIHZhciBncm91cEljb24gPSBMLmljb24oe1xuICAgICAgICAgICAgICAgIGljb25Vcmw6IGV2ZW50VHlwZSAmJiBldmVudFR5cGUudG9Mb3dlckNhc2UoKSA9PT0gJ2dyb3VwJyA/ICcvaW1nL2dyb3VwLnN2ZycgOiAnL2ltZy9ldmVudC5zdmcnLFxuICAgICAgICAgICAgICAgIGljb25TaXplOiBbMjIsIDIyXSxcbiAgICAgICAgICAgICAgICBpY29uQW5jaG9yOiBbMTIsIDhdLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogc2x1Z2dlZCArICcgZXZlbnQtaXRlbS1wb3B1cCdcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHZhciBldmVudEljb24gPSBMLmljb24oe1xuICAgICAgICAgICAgICAgIGljb25Vcmw6IGV2ZW50VHlwZSAmJiBldmVudFR5cGUudG9Mb3dlckNhc2UoKSA9PT0gJ2dyb3VwJyA/ICcvaW1nL2dyb3VwLnN2ZycgOiAnL2ltZy9ldmVudC5zdmcnLFxuICAgICAgICAgICAgICAgIGljb25TaXplOiBbMTgsIDE4XSxcbiAgICAgICAgICAgICAgICBpY29uQW5jaG9yOiBbOSwgOV0sXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnZXZlbnRzIGV2ZW50LWl0ZW0tcG9wdXAnXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB2YXIgZ2VvanNvbk1hcmtlck9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgaWNvbjogZXZlbnRUeXBlICYmIGV2ZW50VHlwZS50b0xvd2VyQ2FzZSgpID09PSAnZ3JvdXAnID8gZ3JvdXBJY29uIDogZXZlbnRJY29uLFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICByZXR1cm4gTC5tYXJrZXIobGF0bG5nLCBnZW9qc29uTWFya2VyT3B0aW9ucyk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgb25FYWNoRmVhdHVyZTogKGZlYXR1cmUsIGxheWVyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZmVhdHVyZS5wcm9wZXJ0aWVzICYmIGZlYXR1cmUucHJvcGVydGllcy5wb3B1cENvbnRlbnQpIHtcbiAgICAgICAgICAgICAgbGF5ZXIuYmluZFBvcHVwKGZlYXR1cmUucHJvcGVydGllcy5wb3B1cENvbnRlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSkuYWRkVG8obWFwKTtcblxuICAgICAgfSxcbiAgICAgIHVwZGF0ZTogKHApID0+IHtcbiAgICAgICAgaWYgKCFwIHx8ICFwLmxhdCB8fCAhcC5sbmcgKSByZXR1cm47XG5cbiAgICAgICAgbWFwLnNldFZpZXcoTC5sYXRMbmcocC5sYXQsIHAubG5nKSwgMTApO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJjb25zdCBRdWVyeU1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRGb3JtID0gXCJmb3JtI2ZpbHRlcnMtZm9ybVwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRGb3JtID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0Rm9ybSkgOiB0YXJnZXRGb3JtO1xuICAgIGxldCBsYXQgPSBudWxsO1xuICAgIGxldCBsbmcgPSBudWxsO1xuXG4gICAgbGV0IHByZXZpb3VzID0ge307XG5cbiAgICAkdGFyZ2V0Lm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgbGF0ID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbCgpO1xuICAgICAgbG5nID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbCgpO1xuXG4gICAgICB2YXIgZm9ybSA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcblxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAkLnBhcmFtKGZvcm0pO1xuICAgIH0pXG5cbiAgICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJ3NlbGVjdCNmaWx0ZXItaXRlbXMnLCAoKSA9PiB7XG4gICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgIH0pXG5cblxuICAgIHJldHVybiB7XG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgcGFyYW1zID0gJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSlcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhbmddXCIpLnZhbChwYXJhbXMubGFuZyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChwYXJhbXMubGF0KTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKHBhcmFtcy5sbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwocGFyYW1zLmJvdW5kMSk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChwYXJhbXMuYm91bmQyKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxvY11cIikudmFsKHBhcmFtcy5sb2MpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9a2V5XVwiKS52YWwocGFyYW1zLmtleSk7XG5cbiAgICAgICAgICBpZiAocGFyYW1zLmZpbHRlcikge1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiI2ZpbHRlci1pdGVtcyBvcHRpb25cIikucmVtb3ZlUHJvcChcInNlbGVjdGVkXCIpO1xuICAgICAgICAgICAgcGFyYW1zLmZpbHRlci5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIjZmlsdGVyLWl0ZW1zIG9wdGlvblt2YWx1ZT0nXCIgKyBpdGVtICsgXCInXVwiKS5wcm9wKFwic2VsZWN0ZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGdldFBhcmFtZXRlcnM6ICgpID0+IHtcbiAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG4gICAgICAgIC8vIHBhcmFtZXRlcnNbJ2xvY2F0aW9uJ10gO1xuXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHBhcmFtZXRlcnMpIHtcbiAgICAgICAgICBpZiAoICFwYXJhbWV0ZXJzW2tleV0gfHwgcGFyYW1ldGVyc1trZXldID09IFwiXCIpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBwYXJhbWV0ZXJzW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtZXRlcnM7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTG9jYXRpb246IChsYXQsIGxuZykgPT4ge1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKGxhdCk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwobG5nKTtcbiAgICAgICAgLy8gJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVWaWV3cG9ydDogKHZpZXdwb3J0KSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW1t2aWV3cG9ydC5mLmIsIHZpZXdwb3J0LmIuYl0sIFt2aWV3cG9ydC5mLmYsIHZpZXdwb3J0LmIuZl1dO1xuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlVmlld3BvcnRCeUJvdW5kOiAoc3csIG5lKSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW3N3LCBuZV07Ly8vLy8vLy9cblxuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdHJpZ2dlclN1Ym1pdDogKCkgPT4ge1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSkoalF1ZXJ5KTtcbiIsImxldCBhdXRvY29tcGxldGVNYW5hZ2VyO1xubGV0IG1hcE1hbmFnZXI7XG5cbndpbmRvdy5zbHVnaWZ5ID0gKHRleHQpID0+IHRleHQudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xccysvZywgJy0nKSAgICAgICAgICAgLy8gUmVwbGFjZSBzcGFjZXMgd2l0aCAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1teXFx3XFwtXSsvZywgJycpICAgICAgIC8vIFJlbW92ZSBhbGwgbm9uLXdvcmQgY2hhcnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwtXFwtKy9nLCAnLScpICAgICAgICAgLy8gUmVwbGFjZSBtdWx0aXBsZSAtIHdpdGggc2luZ2xlIC1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXi0rLywgJycpICAgICAgICAgICAgIC8vIFRyaW0gLSBmcm9tIHN0YXJ0IG9mIHRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvLSskLywgJycpOyAgICAgICAgICAgIC8vIFRyaW0gLSBmcm9tIGVuZCBvZiB0ZXh0XG5cbihmdW5jdGlvbigkKSB7XG4gIC8vIExvYWQgdGhpbmdzXG4gICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5tdWx0aXNlbGVjdCgpO1xuICAvLyAxLiBnb29nbGUgbWFwcyBnZW9jb2RlXG5cbiAgLy8gMi4gZm9jdXMgbWFwIG9uIGdlb2NvZGUgKHZpYSBsYXQvbG5nKVxuICBjb25zdCBxdWVyeU1hbmFnZXIgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICAgICAgcXVlcnlNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICBjb25zdCBpbml0UGFyYW1zID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcbiAgbWFwTWFuYWdlciA9IE1hcE1hbmFnZXIoe1xuICAgIG9uTW92ZTogKHN3LCBuZSkgPT4ge1xuICAgICAgLy8gV2hlbiB0aGUgbWFwIG1vdmVzIGFyb3VuZCwgd2UgdXBkYXRlIHRoZSBsaXN0XG4gICAgICBxdWVyeU1hbmFnZXIudXBkYXRlVmlld3BvcnRCeUJvdW5kKHN3LCBuZSk7XG4gICAgICAvL3VwZGF0ZSBRdWVyeVxuICAgIH1cbiAgfSk7XG5cbiAgd2luZG93LmluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayA9ICgpID0+IHtcblxuICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIgPSBBdXRvY29tcGxldGVNYW5hZ2VyKFwiaW5wdXRbbmFtZT0nbG9jJ11cIik7XG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlci5pbml0aWFsaXplKCk7XG5cbiAgICBpZiAoaW5pdFBhcmFtcy5sb2MgJiYgaW5pdFBhcmFtcy5sb2MgIT09ICcnICYmICghaW5pdFBhcmFtcy5ib3VuZDEgJiYgIWluaXRQYXJhbXMuYm91bmQyKSkge1xuICAgICAgbWFwTWFuYWdlci5pbml0aWFsaXplKCgpID0+IHtcbiAgICAgICAgbWFwTWFuYWdlci5nZXRDZW50ZXJCeUxvY2F0aW9uKGluaXRQYXJhbXMubG9jLCAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgcXVlcnlNYW5hZ2VyLnVwZGF0ZVZpZXdwb3J0KHJlc3VsdC5nZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICB9XG4gIH1cblxuXG4gIGNvbnN0IGxhbmd1YWdlTWFuYWdlciA9IExhbmd1YWdlTWFuYWdlcigpO1xuXG4gIGxhbmd1YWdlTWFuYWdlci5pbml0aWFsaXplKGluaXRQYXJhbXNbJ2xhbmcnXSB8fCAnZW4nKTtcblxuICBjb25zdCBsaXN0TWFuYWdlciA9IExpc3RNYW5hZ2VyKCk7XG5cbiAgaWYoaW5pdFBhcmFtcy5sYXQgJiYgaW5pdFBhcmFtcy5sbmcpIHtcbiAgICBtYXBNYW5hZ2VyLnNldENlbnRlcihbaW5pdFBhcmFtcy5sYXQsIGluaXRQYXJhbXMubG5nXSk7XG4gIH1cblxuICAvKioqXG4gICogTGlzdCBFdmVudHNcbiAgKiBUaGlzIHdpbGwgdHJpZ2dlciB0aGUgbGlzdCB1cGRhdGUgbWV0aG9kXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgbGlzdE1hbmFnZXIucG9wdWxhdGVMaXN0KG9wdGlvbnMucGFyYW1zKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgbGlzdE1hbmFnZXIudXBkYXRlRmlsdGVyKG9wdGlvbnMpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlci1ieS1ib3VuZCcsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxldCBib3VuZDEsIGJvdW5kMjtcblxuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICBbYm91bmQxLCBib3VuZDJdID0gbWFwTWFuYWdlci5nZXRCb3VuZHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgICBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcbiAgICB9XG5cblxuXG4gICAgbGlzdE1hbmFnZXIudXBkYXRlQm91bmRzKGJvdW5kMSwgYm91bmQyKVxuICB9KVxuXG4gIC8qKipcbiAgKiBNYXAgRXZlbnRzXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICAvLyBtYXBNYW5hZ2VyLnNldENlbnRlcihbb3B0aW9ucy5sYXQsIG9wdGlvbnMubG5nXSk7XG4gICAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLmJvdW5kMSB8fCAhb3B0aW9ucy5ib3VuZDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgdmFyIGJvdW5kMiA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDIpO1xuICAgIG1hcE1hbmFnZXIuc2V0Qm91bmRzKGJvdW5kMSwgYm91bmQyKTtcbiAgICAvLyBjb25zb2xlLmxvZyhvcHRpb25zKVxuICB9KTtcbiAgLy8gMy4gbWFya2VycyBvbiBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXBsb3QnLCAoZSwgb3B0KSA9PiB7XG5cbiAgICBtYXBNYW5hZ2VyLnBsb3RQb2ludHMob3B0LmRhdGEsIG9wdC5wYXJhbXMpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicpO1xuICB9KVxuXG4gIC8vIGxvYWQgZ3JvdXBzXG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbG9hZC1ncm91cHMnLCAoZSwgb3B0KSA9PiB7XG5cbiAgICBvcHQuZ3JvdXBzLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgIGxldCBzbHVnZ2VkID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5hcHBlbmQoYDxvcHRpb24gdmFsdWU9JyR7c2x1Z2dlZH0nIHNlbGVjdGVkPSdzZWxlY3RlZCc+JHtpdGVtLnN1cGVyZ3JvdXB9PC9vcHRpb24+YClcbiAgICB9KTtcblxuICAgIC8vIFJlLWluaXRpYWxpemVcbiAgICBxdWVyeU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5tdWx0aXNlbGVjdCgncmVidWlsZCcpO1xuICB9KVxuXG4gIC8vIEZpbHRlciBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLWZpbHRlcicsIChlLCBvcHQpID0+IHtcbiAgICBpZiAob3B0KSB7XG4gICAgICBtYXBNYW5hZ2VyLmZpbHRlck1hcChvcHQuZmlsdGVyKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZScsIChlLCBvcHQpID0+IHtcbiAgICBpZiAob3B0KSB7XG4gICAgICBsYW5ndWFnZU1hbmFnZXIudXBkYXRlTGFuZ3VhZ2Uob3B0LmxhbmcpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGFuZ3VhZ2UtbG9hZGVkJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5tdWx0aXNlbGVjdCgncmVidWlsZCcpO1xuICB9KVxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24jc2hvdy1oaWRlLW1hcCcsIChlLCBvcHQpID0+IHtcbiAgICAkKCdib2R5JykudG9nZ2xlQ2xhc3MoJ21hcC12aWV3JylcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbi5idG4ubW9yZS1pdGVtcycsIChlLCBvcHQpID0+IHtcbiAgICAkKCcjZW1iZWQtYXJlYScpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgKGUsIG9wdCkgPT4ge1xuICAgIC8vdXBkYXRlIGVtYmVkIGxpbmVcbiAgICB2YXIgY29weSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3B0KSk7XG4gICAgZGVsZXRlIGNvcHlbJ2xuZyddO1xuICAgIGRlbGV0ZSBjb3B5WydsYXQnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQxJ107XG4gICAgZGVsZXRlIGNvcHlbJ2JvdW5kMiddO1xuXG4gICAgJCgnI2VtYmVkLWFyZWEgaW5wdXRbbmFtZT1lbWJlZF0nKS52YWwoJ2h0dHBzOi8vbmV3LW1hcC4zNTAub3JnIycgKyAkLnBhcmFtKGNvcHkpKTtcbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIChlKSA9PiB7XG4gICAgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCk7XG4gIH0pO1xuXG4gICQod2luZG93KS5vbihcImhhc2hjaGFuZ2VcIiwgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgIGlmIChoYXNoLmxlbmd0aCA9PSAwKSByZXR1cm47XG4gICAgY29uc3QgcGFyYW1ldGVycyA9ICQuZGVwYXJhbShoYXNoLnN1YnN0cmluZygxKSk7XG4gICAgY29uc3Qgb2xkVVJMID0gZXZlbnQub3JpZ2luYWxFdmVudC5vbGRVUkw7XG5cblxuICAgIGNvbnN0IG9sZEhhc2ggPSAkLmRlcGFyYW0ob2xkVVJMLnN1YnN0cmluZyhvbGRVUkwuc2VhcmNoKFwiI1wiKSsxKSk7XG5cbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicsIHBhcmFtZXRlcnMpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgcGFyYW1ldGVycyk7XG5cbiAgICAvLyBTbyB0aGF0IGNoYW5nZSBpbiBmaWx0ZXJzIHdpbGwgbm90IHVwZGF0ZSB0aGlzXG4gICAgaWYgKG9sZEhhc2guYm91bmQxICE9PSBwYXJhbWV0ZXJzLmJvdW5kMSB8fCBvbGRIYXNoLmJvdW5kMiAhPT0gcGFyYW1ldGVycy5ib3VuZDIpIHtcblxuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLWJ5LWJvdW5kJywgcGFyYW1ldGVycyk7XG4gICAgfVxuXG4gICAgLy8gQ2hhbmdlIGl0ZW1zXG4gICAgaWYgKG9sZEhhc2gubGFuZyAhPT0gcGFyYW1ldGVycy5sYW5nKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgIH1cbiAgfSlcblxuICAvLyA0LiBmaWx0ZXIgb3V0IGl0ZW1zIGluIGFjdGl2aXR5LWFyZWFcblxuICAvLyA1LiBnZXQgbWFwIGVsZW1lbnRzXG5cbiAgLy8gNi4gZ2V0IEdyb3VwIGRhdGFcblxuICAvLyA3LiBwcmVzZW50IGdyb3VwIGVsZW1lbnRzXG5cbiAgJC5hamF4KHtcbiAgICB1cmw6ICcvZGF0YS90ZXN0Lmpzb24nLCAvLyd8KipEQVRBX1NPVVJDRSoqfCcsXG4gICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICBjYWNoZTogdHJ1ZSxcbiAgICBzdWNjZXNzOiAoZGF0YSkgPT4ge1xuICAgICAgd2luZG93LkVWRU5UU19EQVRBID0gZGF0YTtcblxuICAgICAgLy9Mb2FkIGdyb3Vwc1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sb2FkLWdyb3VwcycsIHsgZ3JvdXBzOiB3aW5kb3cuRVZFTlRTX0RBVEEuZ3JvdXBzIH0pO1xuXG5cbiAgICAgIHZhciBwYXJhbWV0ZXJzID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuICAgICAgd2luZG93LkVWRU5UU19EQVRBLmRhdGEuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICBpdGVtWydldmVudF90eXBlJ10gPSAhaXRlbS5ldmVudF90eXBlID8gJ0FjdGlvbicgOiBpdGVtLmV2ZW50X3R5cGU7XG4gICAgICB9KVxuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LXVwZGF0ZScsIHsgcGFyYW1zOiBwYXJhbWV0ZXJzIH0pO1xuICAgICAgLy8gJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXBsb3QnLCB7IGRhdGE6IHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhLCBwYXJhbXM6IHBhcmFtZXRlcnMgfSk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuICAgICAgLy9UT0RPOiBNYWtlIHRoZSBnZW9qc29uIGNvbnZlcnNpb24gaGFwcGVuIG9uIHRoZSBiYWNrZW5kXG5cbiAgICAgIC8vUmVmcmVzaCB0aGluZ3NcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBsZXQgcCA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHApO1xuICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCBwKTtcbiAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwKTtcbiAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci1ieS1ib3VuZCcsIHApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCkpXG4gICAgICB9LCAxMDApO1xuICAgIH1cbiAgfSk7XG5cblxuXG59KShqUXVlcnkpO1xuIl19
