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

      return "\n      <li class='" + window.slugify(item.event_type) + " events event-obj' data-lat='" + item.lat + "' data-lng='" + item.lng + "'>\n        <div class=\"type-event type-action\">\n          <ul class=\"event-types-list\">\n            <li class='tag-" + item.event_type + " tag'>" + item.event_type + "</li>\n          </ul>\n          <h2 class=\"event-title\"><a href=\"" + url + "\" target='_blank'>" + item.title + "</a></h2>\n          <div class=\"event-date date\">" + date + "</div>\n          <div class=\"event-address address-area\">\n            <p>" + item.venue + "</p>\n          </div>\n          <div class=\"call-to-action\">\n            <a href=\"" + url + "\" target='_blank' class=\"btn btn-secondary\">RSVP</a>\n          </div>\n        </div>\n      </li>\n      ";
    };

    var renderGroup = function renderGroup(item) {
      var url = item.website.match(/^https{0,1}:/) ? item.website : "//" + item.website;
      var superGroup = window.slugify(item.supergroup);
      // console.log(superGroup);
      return "\n      <li class='" + item.event_type + " " + superGroup + " group-obj' data-lat='" + item.lat + "' data-lng='" + item.lng + "'>\n        <div class=\"type-group group-obj\">\n          <ul class=\"event-types-list\">\n            <li class=\"tag tag-" + item.supergroup + "\">" + item.supergroup + "</li>\n          </ul>\n          <h2><a href=\"" + url + "\" target='_blank'>" + item.name + "</a></h2>\n          <div class=\"group-details-area\">\n            <div class=\"group-location location\">" + item.location + "</div>\n            <div class=\"group-description\">\n              <p>" + item.description + "</p>\n            </div>\n          </div>\n          <div class=\"call-to-action\">\n            <a href=\"" + url + "\" target='_blank' class=\"btn btn-secondary\">Get Involved</a>\n          </div>\n        </div>\n      </li>\n      ";
    };

    return {
      $list: $target,
      updateFilter: function updateFilter(p) {
        if (!p) return;

        // Remove Filters

        $target.removeProp("class");
        $target.addClass(p.filter ? p.filter.join(" ") : '');

        $target.find('li.event-obj, li.group-obj').hide();

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
      refreshMap: function refreshMap() {
        map.invalidateSize(false);
        // map._onResize();
        // map.fireEvent('zoomend');

        // console.log("map is resized")
      },
      filterMap: function filterMap(filters) {

        $("#map").find(".event-item-popup").hide();

        // console.log(filters);
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
    // mapManager.triggerZoomEnd();

    setTimeout(function () {
      mapManager.triggerZoomEnd();
    }, 10);
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
    mapManager.refreshMap();
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9sYW5ndWFnZS5qcyIsImNsYXNzZXMvbGlzdC5qcyIsImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9xdWVyeS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJBdXRvY29tcGxldGVNYW5hZ2VyIiwiJCIsInRhcmdldCIsIkFQSV9LRVkiLCJ0YXJnZXRJdGVtIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwicXVlcnlNZ3IiLCJRdWVyeU1hbmFnZXIiLCJnZW9jb2RlciIsImdvb2dsZSIsIm1hcHMiLCJHZW9jb2RlciIsIiR0YXJnZXQiLCJpbml0aWFsaXplIiwidHlwZWFoZWFkIiwiaGludCIsImhpZ2hsaWdodCIsIm1pbkxlbmd0aCIsImNsYXNzTmFtZXMiLCJtZW51IiwibmFtZSIsImRpc3BsYXkiLCJpdGVtIiwiZm9ybWF0dGVkX2FkZHJlc3MiLCJsaW1pdCIsInNvdXJjZSIsInEiLCJzeW5jIiwiYXN5bmMiLCJnZW9jb2RlIiwiYWRkcmVzcyIsInJlc3VsdHMiLCJzdGF0dXMiLCJvbiIsIm9iaiIsImRhdHVtIiwiZ2VvbWV0cnkiLCJ1cGRhdGVWaWV3cG9ydCIsInZpZXdwb3J0IiwialF1ZXJ5IiwiTGFuZ3VhZ2VNYW5hZ2VyIiwibGFuZ3VhZ2UiLCJkaWN0aW9uYXJ5IiwiJHRhcmdldHMiLCJ1cGRhdGVQYWdlTGFuZ3VhZ2UiLCJ0YXJnZXRMYW5ndWFnZSIsInJvd3MiLCJmaWx0ZXIiLCJpIiwibGFuZyIsImVhY2giLCJpbmRleCIsInRhcmdldEF0dHJpYnV0ZSIsImRhdGEiLCJsYW5nVGFyZ2V0IiwidGV4dCIsInZhbCIsImF0dHIiLCJ0YXJnZXRzIiwiYWpheCIsInVybCIsImRhdGFUeXBlIiwic3VjY2VzcyIsInRyaWdnZXIiLCJ1cGRhdGVMYW5ndWFnZSIsIkxpc3RNYW5hZ2VyIiwidGFyZ2V0TGlzdCIsInJlbmRlckV2ZW50IiwiZGF0ZSIsIm1vbWVudCIsIkRhdGUiLCJzdGFydF9kYXRldGltZSIsInRvR01UU3RyaW5nIiwiZm9ybWF0IiwibWF0Y2giLCJ3aW5kb3ciLCJzbHVnaWZ5IiwiZXZlbnRfdHlwZSIsImxhdCIsImxuZyIsInRpdGxlIiwidmVudWUiLCJyZW5kZXJHcm91cCIsIndlYnNpdGUiLCJzdXBlckdyb3VwIiwic3VwZXJncm91cCIsImxvY2F0aW9uIiwiZGVzY3JpcHRpb24iLCIkbGlzdCIsInVwZGF0ZUZpbHRlciIsInAiLCJyZW1vdmVQcm9wIiwiYWRkQ2xhc3MiLCJqb2luIiwiZmluZCIsImhpZGUiLCJmb3JFYWNoIiwiZmlsIiwic2hvdyIsInVwZGF0ZUJvdW5kcyIsImJvdW5kMSIsImJvdW5kMiIsImluZCIsIl9sYXQiLCJfbG5nIiwicmVtb3ZlQ2xhc3MiLCJwb3B1bGF0ZUxpc3QiLCJoYXJkRmlsdGVycyIsImtleVNldCIsImtleSIsInNwbGl0IiwiJGV2ZW50TGlzdCIsIkVWRU5UU19EQVRBIiwibWFwIiwibGVuZ3RoIiwidG9Mb3dlckNhc2UiLCJpbmNsdWRlcyIsInJlbW92ZSIsImFwcGVuZCIsIk1hcE1hbmFnZXIiLCJMQU5HVUFHRSIsInJlbmRlckdlb2pzb24iLCJsaXN0IiwicmVuZGVyZWQiLCJpc05hTiIsInBhcnNlRmxvYXQiLCJzdWJzdHJpbmciLCJ0eXBlIiwiY29vcmRpbmF0ZXMiLCJwcm9wZXJ0aWVzIiwiZXZlbnRQcm9wZXJ0aWVzIiwicG9wdXBDb250ZW50Iiwib3B0aW9ucyIsImFjY2Vzc1Rva2VuIiwiTCIsImRyYWdnaW5nIiwiQnJvd3NlciIsIm1vYmlsZSIsInNldFZpZXciLCJzY3JvbGxXaGVlbFpvb20iLCJkaXNhYmxlIiwib25Nb3ZlIiwiZXZlbnQiLCJzdyIsImdldEJvdW5kcyIsIl9zb3V0aFdlc3QiLCJuZSIsIl9ub3J0aEVhc3QiLCJnZXRab29tIiwidGlsZUxheWVyIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsIiRtYXAiLCJjYWxsYmFjayIsInNldEJvdW5kcyIsImJvdW5kczEiLCJib3VuZHMyIiwiYm91bmRzIiwiZml0Qm91bmRzIiwic2V0Q2VudGVyIiwiY2VudGVyIiwiem9vbSIsImdldENlbnRlckJ5TG9jYXRpb24iLCJ0cmlnZ2VyWm9vbUVuZCIsImZpcmVFdmVudCIsInJlZnJlc2hNYXAiLCJpbnZhbGlkYXRlU2l6ZSIsImZpbHRlck1hcCIsImZpbHRlcnMiLCJwbG90UG9pbnRzIiwiZ2VvanNvbiIsImZlYXR1cmVzIiwiZ2VvSlNPTiIsInBvaW50VG9MYXllciIsImZlYXR1cmUiLCJsYXRsbmciLCJldmVudFR5cGUiLCJzbHVnZ2VkIiwiZ3JvdXBJY29uIiwiaWNvbiIsImljb25VcmwiLCJpY29uU2l6ZSIsImljb25BbmNob3IiLCJjbGFzc05hbWUiLCJldmVudEljb24iLCJnZW9qc29uTWFya2VyT3B0aW9ucyIsIm1hcmtlciIsIm9uRWFjaEZlYXR1cmUiLCJsYXllciIsImJpbmRQb3B1cCIsInVwZGF0ZSIsImxhdExuZyIsInRhcmdldEZvcm0iLCJwcmV2aW91cyIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImZvcm0iLCJkZXBhcmFtIiwic2VyaWFsaXplIiwiaGFzaCIsInBhcmFtIiwicGFyYW1zIiwibG9jIiwicHJvcCIsImdldFBhcmFtZXRlcnMiLCJwYXJhbWV0ZXJzIiwidXBkYXRlTG9jYXRpb24iLCJmIiwiYiIsIkpTT04iLCJzdHJpbmdpZnkiLCJ1cGRhdGVWaWV3cG9ydEJ5Qm91bmQiLCJ0cmlnZ2VyU3VibWl0IiwiYXV0b2NvbXBsZXRlTWFuYWdlciIsIm1hcE1hbmFnZXIiLCJ0b1N0cmluZyIsInJlcGxhY2UiLCJtdWx0aXNlbGVjdCIsInF1ZXJ5TWFuYWdlciIsImluaXRQYXJhbXMiLCJpbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2siLCJyZXN1bHQiLCJsYW5ndWFnZU1hbmFnZXIiLCJsaXN0TWFuYWdlciIsInBhcnNlIiwic2V0VGltZW91dCIsIm9wdCIsImdyb3VwcyIsInRvZ2dsZUNsYXNzIiwiY29weSIsIm9sZFVSTCIsIm9yaWdpbmFsRXZlbnQiLCJvbGRIYXNoIiwic2VhcmNoIiwi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LFFBQUVJLFFBQUYsRUFBWTJELE9BQVosQ0FBb0Isa0JBQXBCLEVBQXdDLEVBQUVWLE1BQU1zQixPQUFPcUMsV0FBUCxDQUFtQjNELElBQTNCLEVBQWlDb0osUUFBUUksVUFBekMsRUFBeEM7QUFDQTdNLFFBQUVJLFFBQUYsRUFBWTJELE9BQVosQ0FBb0Isc0JBQXBCLEVBQTRDOEksVUFBNUM7QUFDQTs7QUFFQTtBQUNBb0IsaUJBQVcsWUFBTTtBQUNmLFlBQUl2SSxJQUFJZ0ksYUFBYWQsYUFBYixFQUFSO0FBQ0E1TSxVQUFFSSxRQUFGLEVBQVkyRCxPQUFaLENBQW9CLG9CQUFwQixFQUEwQzJCLENBQTFDO0FBQ0ExRixVQUFFSSxRQUFGLEVBQVkyRCxPQUFaLENBQW9CLG9CQUFwQixFQUEwQzJCLENBQTFDO0FBQ0ExRixVQUFFSSxRQUFGLEVBQVkyRCxPQUFaLENBQW9CLDRCQUFwQixFQUFrRDJCLENBQWxEO0FBQ0ExRixVQUFFSSxRQUFGLEVBQVkyRCxPQUFaLENBQW9CLDhCQUFwQixFQUFvRDJCLENBQXBEO0FBQ0E7QUFDRCxPQVBELEVBT0csR0FQSDtBQVFEO0FBL0JJLEdBQVA7QUFvQ0QsQ0E3TkQsRUE2TkduRCxNQTdOSCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbi8vQVBJIDpBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cbmNvbnN0IEF1dG9jb21wbGV0ZU1hbmFnZXIgPSAoZnVuY3Rpb24oJCkge1xuICAvL0luaXRpYWxpemF0aW9uLi4uXG5cbiAgcmV0dXJuICh0YXJnZXQpID0+IHtcblxuICAgIGNvbnN0IEFQSV9LRVkgPSBcIkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVwiO1xuICAgIGNvbnN0IHRhcmdldEl0ZW0gPSB0eXBlb2YgdGFyZ2V0ID09IFwic3RyaW5nXCIgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCkgOiB0YXJnZXQ7XG4gICAgY29uc3QgcXVlcnlNZ3IgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICB2YXIgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcblxuICAgIHJldHVybiB7XG4gICAgICAkdGFyZ2V0OiAkKHRhcmdldEl0ZW0pLFxuICAgICAgdGFyZ2V0OiB0YXJnZXRJdGVtLFxuICAgICAgaW5pdGlhbGl6ZTogKCkgPT4ge1xuICAgICAgICAkKHRhcmdldEl0ZW0pLnR5cGVhaGVhZCh7XG4gICAgICAgICAgICAgICAgICAgIGhpbnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWluTGVuZ3RoOiA0LFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgbWVudTogJ3R0LWRyb3Bkb3duLW1lbnUnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdzZWFyY2gtcmVzdWx0cycsXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IChpdGVtKSA9PiBpdGVtLmZvcm1hdHRlZF9hZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgICBsaW1pdDogMTAsXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogZnVuY3Rpb24gKHEsIHN5bmMsIGFzeW5jKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBxIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXN5bmMocmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICkub24oJ3R5cGVhaGVhZDpzZWxlY3RlZCcsIGZ1bmN0aW9uIChvYmosIGRhdHVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGRhdHVtKVxuICAgICAgICAgICAgICAgICAgICB7XG5cbiAgICAgICAgICAgICAgICAgICAgICB2YXIgZ2VvbWV0cnkgPSBkYXR1bS5nZW9tZXRyeTtcbiAgICAgICAgICAgICAgICAgICAgICBxdWVyeU1nci51cGRhdGVWaWV3cG9ydChnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gIG1hcC5maXRCb3VuZHMoZ2VvbWV0cnkuYm91bmRzPyBnZW9tZXRyeS5ib3VuZHMgOiBnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cblxuXG4gICAgcmV0dXJuIHtcblxuICAgIH1cbiAgfVxuXG59KGpRdWVyeSkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBMYW5ndWFnZU1hbmFnZXIgPSAoKCQpID0+IHtcbiAgLy9rZXlWYWx1ZVxuXG4gIC8vdGFyZ2V0cyBhcmUgdGhlIG1hcHBpbmdzIGZvciB0aGUgbGFuZ3VhZ2VcbiAgcmV0dXJuICgpID0+IHtcbiAgICBsZXQgbGFuZ3VhZ2U7XG4gICAgbGV0IGRpY3Rpb25hcnkgPSB7fTtcbiAgICBsZXQgJHRhcmdldHMgPSAkKFwiW2RhdGEtbGFuZy10YXJnZXRdW2RhdGEtbGFuZy1rZXldXCIpO1xuXG4gICAgY29uc3QgdXBkYXRlUGFnZUxhbmd1YWdlID0gKCkgPT4ge1xuXG4gICAgICBsZXQgdGFyZ2V0TGFuZ3VhZ2UgPSBkaWN0aW9uYXJ5LnJvd3MuZmlsdGVyKChpKSA9PiBpLmxhbmcgPT09IGxhbmd1YWdlKVswXTtcblxuICAgICAgJHRhcmdldHMuZWFjaCgoaW5kZXgsIGl0ZW0pID0+IHtcbiAgICAgICAgbGV0IHRhcmdldEF0dHJpYnV0ZSA9ICQoaXRlbSkuZGF0YSgnbGFuZy10YXJnZXQnKTtcbiAgICAgICAgbGV0IGxhbmdUYXJnZXQgPSAkKGl0ZW0pLmRhdGEoJ2xhbmcta2V5Jyk7XG5cbiAgICAgICAgc3dpdGNoKHRhcmdldEF0dHJpYnV0ZSkge1xuICAgICAgICAgIGNhc2UgJ3RleHQnOlxuICAgICAgICAgICAgJChpdGVtKS50ZXh0KHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3ZhbHVlJzpcbiAgICAgICAgICAgICQoaXRlbSkudmFsKHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAkKGl0ZW0pLmF0dHIodGFyZ2V0QXR0cmlidXRlLCB0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGxhbmd1YWdlLFxuICAgICAgdGFyZ2V0czogJHRhcmdldHMsXG4gICAgICBkaWN0aW9uYXJ5LFxuICAgICAgaW5pdGlhbGl6ZTogKGxhbmcpID0+IHtcblxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgIC8vIHVybDogJ2h0dHBzOi8vZ3N4Mmpzb24uY29tL2FwaT9pZD0xTzNlQnlqTDF2bFlmN1o3YW0tX2h0UlRRaTczUGFmcUlmTkJkTG1YZThTTSZzaGVldD0xJyxcbiAgICAgICAgICB1cmw6ICcvZGF0YS9sYW5nLmpzb24nLFxuICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgc3VjY2VzczogKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGRpY3Rpb25hcnkgPSBkYXRhO1xuICAgICAgICAgICAgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgICAgICAgICAgdXBkYXRlUGFnZUxhbmd1YWdlKCk7XG5cbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtbG9hZGVkJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVMYW5ndWFnZTogKGxhbmcpID0+IHtcblxuICAgICAgICBsYW5ndWFnZSA9IGxhbmc7XG4gICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxufSkoalF1ZXJ5KTtcbiIsIi8qIFRoaXMgbG9hZHMgYW5kIG1hbmFnZXMgdGhlIGxpc3QhICovXG5cbmNvbnN0IExpc3RNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIHJldHVybiAodGFyZ2V0TGlzdCA9IFwiI2V2ZW50cy1saXN0XCIpID0+IHtcbiAgICBjb25zdCAkdGFyZ2V0ID0gdHlwZW9mIHRhcmdldExpc3QgPT09ICdzdHJpbmcnID8gJCh0YXJnZXRMaXN0KSA6IHRhcmdldExpc3Q7XG5cbiAgICBjb25zdCByZW5kZXJFdmVudCA9IChpdGVtKSA9PiB7XG5cbiAgICAgIHZhciBkYXRlID0gbW9tZW50KG5ldyBEYXRlKGl0ZW0uc3RhcnRfZGF0ZXRpbWUpLnRvR01UU3RyaW5nKCkpLmZvcm1hdChcImRkZGQgTU1NIERELCBoOm1tYVwiKTtcbiAgICAgIGxldCB1cmwgPSBpdGVtLnVybC5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLnVybCA6IFwiLy9cIiArIGl0ZW0udXJsO1xuICAgICAgLy8gbGV0IHN1cGVyR3JvdXAgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuXG4gICAgICByZXR1cm4gYFxuICAgICAgPGxpIGNsYXNzPScke3dpbmRvdy5zbHVnaWZ5KGl0ZW0uZXZlbnRfdHlwZSl9IGV2ZW50cyBldmVudC1vYmonIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnQgdHlwZS1hY3Rpb25cIj5cbiAgICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgICA8bGkgY2xhc3M9J3RhZy0ke2l0ZW0uZXZlbnRfdHlwZX0gdGFnJz4ke2l0ZW0uZXZlbnRfdHlwZX08L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPGgyIGNsYXNzPVwiZXZlbnQtdGl0bGVcIj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZX08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtZGF0ZSBkYXRlXCI+JHtkYXRlfTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1hZGRyZXNzIGFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgICAgPHA+JHtpdGVtLnZlbnVlfTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPlJTVlA8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSkgPT4ge1xuICAgICAgbGV0IHVybCA9IGl0ZW0ud2Vic2l0ZS5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLndlYnNpdGUgOiBcIi8vXCIgKyBpdGVtLndlYnNpdGU7XG4gICAgICBsZXQgc3VwZXJHcm91cCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG4gICAgICAvLyBjb25zb2xlLmxvZyhzdXBlckdyb3VwKTtcbiAgICAgIHJldHVybiBgXG4gICAgICA8bGkgY2xhc3M9JyR7aXRlbS5ldmVudF90eXBlfSAke3N1cGVyR3JvdXB9IGdyb3VwLW9iaicgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ncm91cCBncm91cC1vYmpcIj5cbiAgICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5zdXBlcmdyb3VwfVwiPiR7aXRlbS5zdXBlcmdyb3VwfTwvbGk+XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0ubmFtZX08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtbG9jYXRpb24gbG9jYXRpb25cIj4ke2l0ZW0ubG9jYXRpb259PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGVzY3JpcHRpb25cIj5cbiAgICAgICAgICAgICAgPHA+JHtpdGVtLmRlc2NyaXB0aW9ufTwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+R2V0IEludm9sdmVkPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAkbGlzdDogJHRhcmdldCxcbiAgICAgIHVwZGF0ZUZpbHRlcjogKHApID0+IHtcbiAgICAgICAgaWYoIXApIHJldHVybjtcblxuICAgICAgICAvLyBSZW1vdmUgRmlsdGVyc1xuXG4gICAgICAgICR0YXJnZXQucmVtb3ZlUHJvcChcImNsYXNzXCIpO1xuICAgICAgICAkdGFyZ2V0LmFkZENsYXNzKHAuZmlsdGVyID8gcC5maWx0ZXIuam9pbihcIiBcIikgOiAnJylcblxuICAgICAgICAkdGFyZ2V0LmZpbmQoJ2xpLmV2ZW50LW9iaiwgbGkuZ3JvdXAtb2JqJykuaGlkZSgpO1xuXG4gICAgICAgIGlmIChwLmZpbHRlcikge1xuICAgICAgICAgIHAuZmlsdGVyLmZvckVhY2goKGZpbCk9PntcbiAgICAgICAgICAgICR0YXJnZXQuZmluZChgbGkuJHtmaWx9YCkuc2hvdygpO1xuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB1cGRhdGVCb3VuZHM6IChib3VuZDEsIGJvdW5kMikgPT4ge1xuXG4gICAgICAgIC8vIGNvbnN0IGJvdW5kcyA9IFtwLmJvdW5kczEsIHAuYm91bmRzMl07XG5cblxuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsIGxpLmV2ZW50LW9iaiwgdWwgbGkuZ3JvdXAtb2JqJykuZWFjaCgoaW5kLCBpdGVtKT0+IHtcblxuICAgICAgICAgIGxldCBfbGF0ID0gJChpdGVtKS5kYXRhKCdsYXQnKSxcbiAgICAgICAgICAgICAgX2xuZyA9ICQoaXRlbSkuZGF0YSgnbG5nJyk7XG5cbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInVwZGF0ZUJvdW5kc1wiLCBpdGVtKVxuICAgICAgICAgIGlmIChib3VuZDFbMF0gPD0gX2xhdCAmJiBib3VuZDJbMF0gPj0gX2xhdCAmJiBib3VuZDFbMV0gPD0gX2xuZyAmJiBib3VuZDJbMV0gPj0gX2xuZykge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJBZGRpbmcgYm91bmRzXCIpO1xuICAgICAgICAgICAgJChpdGVtKS5hZGRDbGFzcygnd2l0aGluLWJvdW5kJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoaXRlbSkucmVtb3ZlQ2xhc3MoJ3dpdGhpbi1ib3VuZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgcG9wdWxhdGVMaXN0OiAoaGFyZEZpbHRlcnMpID0+IHtcbiAgICAgICAgLy91c2luZyB3aW5kb3cuRVZFTlRfREFUQVxuICAgICAgICBjb25zdCBrZXlTZXQgPSAhaGFyZEZpbHRlcnMua2V5ID8gW10gOiBoYXJkRmlsdGVycy5rZXkuc3BsaXQoJywnKTtcblxuICAgICAgICB2YXIgJGV2ZW50TGlzdCA9IHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhLm1hcChpdGVtID0+IHtcbiAgICAgICAgICBpZiAoa2V5U2V0Lmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbS5ldmVudF90eXBlICYmIGl0ZW0uZXZlbnRfdHlwZS50b0xvd2VyQ2FzZSgpID09ICdncm91cCcgPyByZW5kZXJHcm91cChpdGVtKSA6IHJlbmRlckV2ZW50KGl0ZW0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2V5U2V0Lmxlbmd0aCA+IDAgJiYgaXRlbS5ldmVudF90eXBlICE9ICdncm91cCcgJiYga2V5U2V0LmluY2x1ZGVzKGl0ZW0uZXZlbnRfdHlwZSkpIHtcbiAgICAgICAgICAgIHJldHVybiByZW5kZXJFdmVudChpdGVtKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtleVNldC5sZW5ndGggPiAwICYmIGl0ZW0uZXZlbnRfdHlwZSA9PSAnZ3JvdXAnICYmIGtleVNldC5pbmNsdWRlcyhpdGVtLnN1cGVyZ3JvdXApKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyR3JvdXAoaXRlbSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICB9KVxuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsIGxpJykucmVtb3ZlKCk7XG4gICAgICAgICR0YXJnZXQuZmluZCgndWwnKS5hcHBlbmQoJGV2ZW50TGlzdCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsIlxuY29uc3QgTWFwTWFuYWdlciA9ICgoJCkgPT4ge1xuICBsZXQgTEFOR1VBR0UgPSAnZW4nO1xuXG4gIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0pID0+IHtcbiAgICB2YXIgZGF0ZSA9IG1vbWVudChpdGVtLnN0YXJ0X2RhdGV0aW1lKS5mb3JtYXQoXCJkZGRkIE1NTSBERCwgaDptbWFcIik7XG4gICAgbGV0IHVybCA9IGl0ZW0udXJsLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0udXJsIDogXCIvL1wiICsgaXRlbS51cmw7XG5cbiAgICBsZXQgc3VwZXJHcm91cCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG4gICAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPSdwb3B1cC1pdGVtICR7aXRlbS5ldmVudF90eXBlfSAke3N1cGVyR3JvdXB9JyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudFwiPlxuICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgPGxpIGNsYXNzPVwidGFnIHRhZy0ke2l0ZW0uZXZlbnRfdHlwZX1cIj4ke2l0ZW0uZXZlbnRfdHlwZSB8fCAnQWN0aW9uJ308L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8aDIgY2xhc3M9XCJldmVudC10aXRsZVwiPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtZGF0ZVwiPiR7ZGF0ZX08L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWFkZHJlc3MgYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgPHA+JHtpdGVtLnZlbnVlfTwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPlJTVlA8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgYFxuICB9O1xuXG4gIGNvbnN0IHJlbmRlckdyb3VwID0gKGl0ZW0pID0+IHtcblxuICAgIGxldCB1cmwgPSBpdGVtLndlYnNpdGUubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS53ZWJzaXRlIDogXCIvL1wiICsgaXRlbS53ZWJzaXRlO1xuICAgIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICByZXR1cm4gYFxuICAgIDxsaT5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwIGdyb3VwLW9iaiAke3N1cGVyR3JvdXB9XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5zdXBlcmdyb3VwfSAke3N1cGVyR3JvdXB9XCI+JHtpdGVtLnN1cGVyZ3JvdXB9PC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWhlYWRlclwiPlxuICAgICAgICAgIDxoMj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS5uYW1lfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1sb2NhdGlvbiBsb2NhdGlvblwiPiR7aXRlbS5sb2NhdGlvbn08L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGVzY3JpcHRpb25cIj5cbiAgICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9saT5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR2VvanNvbiA9IChsaXN0KSA9PiB7XG4gICAgcmV0dXJuIGxpc3QubWFwKChpdGVtKSA9PiB7XG4gICAgICAvLyByZW5kZXJlZCBldmVudFR5cGVcbiAgICAgIGxldCByZW5kZXJlZDtcblxuICAgICAgaWYgKGl0ZW0uZXZlbnRfdHlwZSAmJiBpdGVtLmV2ZW50X3R5cGUudG9Mb3dlckNhc2UoKSA9PSAnZ3JvdXAnKSB7XG4gICAgICAgIHJlbmRlcmVkID0gcmVuZGVyR3JvdXAoaXRlbSk7XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlbmRlcmVkID0gcmVuZGVyRXZlbnQoaXRlbSk7XG4gICAgICB9XG5cbiAgICAgIC8vIGZvcm1hdCBjaGVja1xuICAgICAgaWYgKGlzTmFOKHBhcnNlRmxvYXQocGFyc2VGbG9hdChpdGVtLmxuZykpKSkge1xuICAgICAgICBpdGVtLmxuZyA9IGl0ZW0ubG5nLnN1YnN0cmluZygxKVxuICAgICAgfVxuICAgICAgaWYgKGlzTmFOKHBhcnNlRmxvYXQocGFyc2VGbG9hdChpdGVtLmxhdCkpKSkge1xuICAgICAgICBpdGVtLmxhdCA9IGl0ZW0ubGF0LnN1YnN0cmluZygxKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICAgIGdlb21ldHJ5OiB7XG4gICAgICAgICAgdHlwZTogXCJQb2ludFwiLFxuICAgICAgICAgIGNvb3JkaW5hdGVzOiBbaXRlbS5sbmcsIGl0ZW0ubGF0XVxuICAgICAgICB9LFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgZXZlbnRQcm9wZXJ0aWVzOiBpdGVtLFxuICAgICAgICAgIHBvcHVwQ29udGVudDogcmVuZGVyZWRcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gKG9wdGlvbnMpID0+IHtcbiAgICB2YXIgYWNjZXNzVG9rZW4gPSAncGsuZXlKMUlqb2liV0YwZEdobGR6TTFNQ0lzSW1FaU9pSmFUVkZNVWtVd0luMC53Y00zWGM4QkdDNlBNLU95cndqbmhnJztcbiAgICB2YXIgbWFwID0gTC5tYXAoJ21hcCcsIHsgZHJhZ2dpbmc6ICFMLkJyb3dzZXIubW9iaWxlIH0pLnNldFZpZXcoWzM0Ljg4NTkzMDk0MDc1MzE3LCA1LjA5NzY1NjI1MDAwMDAwMV0sIDIpO1xuXG4gICAgaWYgKCFMLkJyb3dzZXIubW9iaWxlKSB7XG4gICAgICBtYXAuc2Nyb2xsV2hlZWxab29tLmRpc2FibGUoKTtcbiAgICB9XG5cbiAgICBMQU5HVUFHRSA9IG9wdGlvbnMubGFuZyB8fCAnZW4nO1xuXG4gICAgaWYgKG9wdGlvbnMub25Nb3ZlKSB7XG4gICAgICBtYXAub24oJ2RyYWdlbmQnLCAoZXZlbnQpID0+IHtcblxuXG4gICAgICAgIGxldCBzdyA9IFttYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxuZ107XG4gICAgICAgIGxldCBuZSA9IFttYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxuZ107XG4gICAgICAgIG9wdGlvbnMub25Nb3ZlKHN3LCBuZSk7XG4gICAgICB9KS5vbignem9vbWVuZCcsIChldmVudCkgPT4ge1xuICAgICAgICBpZiAobWFwLmdldFpvb20oKSA8PSA0KSB7XG4gICAgICAgICAgJChcIiNtYXBcIikuYWRkQ2xhc3MoXCJ6b29tZWQtb3V0XCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICQoXCIjbWFwXCIpLnJlbW92ZUNsYXNzKFwiem9vbWVkLW91dFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzdyA9IFttYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxuZ107XG4gICAgICAgIGxldCBuZSA9IFttYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxuZ107XG4gICAgICAgIG9wdGlvbnMub25Nb3ZlKHN3LCBuZSk7XG4gICAgICB9KVxuICAgIH1cblxuICAgIC8vIG1hcC5maXJlRXZlbnQoJ3pvb21lbmQnKTtcblxuICAgIEwudGlsZUxheWVyKCdodHRwczovL2FwaS5tYXBib3guY29tL3N0eWxlcy92MS9tYXR0aGV3MzUwL2NqYTQxdGlqazI3ZDYycnFvZDdnMGx4NGIvdGlsZXMvMjU2L3t6fS97eH0ve3l9P2FjY2Vzc190b2tlbj0nICsgYWNjZXNzVG9rZW4sIHtcbiAgICAgICAgYXR0cmlidXRpb246ICcmY29weTsgPGEgaHJlZj1cImh0dHA6Ly9vc20ub3JnL2NvcHlyaWdodFwiPk9wZW5TdHJlZXRNYXA8L2E+IGNvbnRyaWJ1dG9ycyDigKIgPGEgaHJlZj1cIi8vMzUwLm9yZ1wiPjM1MC5vcmc8L2E+J1xuICAgIH0pLmFkZFRvKG1hcCk7XG5cbiAgICBsZXQgZ2VvY29kZXIgPSBudWxsO1xuICAgIHJldHVybiB7XG4gICAgICAkbWFwOiBtYXAsXG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHNldEJvdW5kczogKGJvdW5kczEsIGJvdW5kczIpID0+IHtcbiAgICAgICAgY29uc3QgYm91bmRzID0gW2JvdW5kczEsIGJvdW5kczJdO1xuICAgICAgICBtYXAuZml0Qm91bmRzKGJvdW5kcyk7XG4gICAgICB9LFxuICAgICAgc2V0Q2VudGVyOiAoY2VudGVyLCB6b29tID0gMTApID0+IHtcbiAgICAgICAgaWYgKCFjZW50ZXIgfHwgIWNlbnRlclswXSB8fCBjZW50ZXJbMF0gPT0gXCJcIlxuICAgICAgICAgICAgICB8fCAhY2VudGVyWzFdIHx8IGNlbnRlclsxXSA9PSBcIlwiKSByZXR1cm47XG4gICAgICAgIG1hcC5zZXRWaWV3KGNlbnRlciwgem9vbSk7XG4gICAgICB9LFxuICAgICAgZ2V0Qm91bmRzOiAoKSA9PiB7XG5cbiAgICAgICAgbGV0IHN3ID0gW21hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW21hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubG5nXTtcblxuICAgICAgICByZXR1cm4gW3N3LCBuZV07XG4gICAgICB9LFxuICAgICAgLy8gQ2VudGVyIGxvY2F0aW9uIGJ5IGdlb2NvZGVkXG4gICAgICBnZXRDZW50ZXJCeUxvY2F0aW9uOiAobG9jYXRpb24sIGNhbGxiYWNrKSA9PiB7XG5cbiAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IGxvY2F0aW9uIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcblxuICAgICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlc3VsdHNbMF0pXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyWm9vbUVuZDogKCkgPT4ge1xuICAgICAgICBtYXAuZmlyZUV2ZW50KCd6b29tZW5kJyk7XG4gICAgICB9LFxuICAgICAgcmVmcmVzaE1hcDogKCkgPT4ge1xuICAgICAgICBtYXAuaW52YWxpZGF0ZVNpemUoZmFsc2UpO1xuICAgICAgICAvLyBtYXAuX29uUmVzaXplKCk7XG4gICAgICAgIC8vIG1hcC5maXJlRXZlbnQoJ3pvb21lbmQnKTtcblxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIm1hcCBpcyByZXNpemVkXCIpXG4gICAgICB9LFxuICAgICAgZmlsdGVyTWFwOiAoZmlsdGVycykgPT4ge1xuXG4gICAgICAgICQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cFwiKS5oaWRlKCk7XG5cbiAgICAgICAgLy8gY29uc29sZS5sb2coZmlsdGVycyk7XG4gICAgICAgIGlmICghZmlsdGVycykgcmV0dXJuO1xuXG4gICAgICAgIGZpbHRlcnMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuXG4gICAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwLlwiICsgaXRlbS50b0xvd2VyQ2FzZSgpKS5zaG93KCk7XG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgcGxvdFBvaW50czogKGxpc3QsIGhhcmRGaWx0ZXJzKSA9PiB7XG5cbiAgICAgICAgY29uc3Qga2V5U2V0ID0gIWhhcmRGaWx0ZXJzLmtleSA/IFtdIDogaGFyZEZpbHRlcnMua2V5LnNwbGl0KCcsJyk7XG5cbiAgICAgICAgaWYgKGtleVNldC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgbGlzdCA9IGxpc3QuZmlsdGVyKChpdGVtKSA9PiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5ldmVudF90eXBlKSlcbiAgICAgICAgfVxuXG5cbiAgICAgICAgY29uc3QgZ2VvanNvbiA9IHtcbiAgICAgICAgICB0eXBlOiBcIkZlYXR1cmVDb2xsZWN0aW9uXCIsXG4gICAgICAgICAgZmVhdHVyZXM6IHJlbmRlckdlb2pzb24obGlzdClcbiAgICAgICAgfTtcblxuXG5cbiAgICAgICAgTC5nZW9KU09OKGdlb2pzb24sIHtcbiAgICAgICAgICAgIHBvaW50VG9MYXllcjogKGZlYXR1cmUsIGxhdGxuZykgPT4ge1xuICAgICAgICAgICAgICAvLyBJY29ucyBmb3IgbWFya2Vyc1xuICAgICAgICAgICAgICBjb25zdCBldmVudFR5cGUgPSBmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLmV2ZW50X3R5cGU7XG4gICAgICAgICAgICAgIGNvbnN0IHNsdWdnZWQgPSB3aW5kb3cuc2x1Z2lmeShmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLnN1cGVyZ3JvdXApO1xuXG4gICAgICAgICAgICAgIHZhciBncm91cEljb24gPSBMLmljb24oe1xuICAgICAgICAgICAgICAgIGljb25Vcmw6IGV2ZW50VHlwZSAmJiBldmVudFR5cGUudG9Mb3dlckNhc2UoKSA9PT0gJ2dyb3VwJyA/ICcvaW1nL2dyb3VwLnN2ZycgOiAnL2ltZy9ldmVudC5zdmcnLFxuICAgICAgICAgICAgICAgIGljb25TaXplOiBbMjIsIDIyXSxcbiAgICAgICAgICAgICAgICBpY29uQW5jaG9yOiBbMTIsIDhdLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogc2x1Z2dlZCArICcgZXZlbnQtaXRlbS1wb3B1cCdcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHZhciBldmVudEljb24gPSBMLmljb24oe1xuICAgICAgICAgICAgICAgIGljb25Vcmw6IGV2ZW50VHlwZSAmJiBldmVudFR5cGUudG9Mb3dlckNhc2UoKSA9PT0gJ2dyb3VwJyA/ICcvaW1nL2dyb3VwLnN2ZycgOiAnL2ltZy9ldmVudC5zdmcnLFxuICAgICAgICAgICAgICAgIGljb25TaXplOiBbMTgsIDE4XSxcbiAgICAgICAgICAgICAgICBpY29uQW5jaG9yOiBbOSwgOV0sXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnZXZlbnRzIGV2ZW50LWl0ZW0tcG9wdXAnXG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgIHZhciBnZW9qc29uTWFya2VyT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBpY29uOiBldmVudFR5cGUgJiYgZXZlbnRUeXBlLnRvTG93ZXJDYXNlKCkgPT09ICdncm91cCcgPyBncm91cEljb24gOiBldmVudEljb24sXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJldHVybiBMLm1hcmtlcihsYXRsbmcsIGdlb2pzb25NYXJrZXJPcHRpb25zKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICBvbkVhY2hGZWF0dXJlOiAoZmVhdHVyZSwgbGF5ZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChmZWF0dXJlLnByb3BlcnRpZXMgJiYgZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCkge1xuICAgICAgICAgICAgICBsYXllci5iaW5kUG9wdXAoZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgICB9LFxuICAgICAgdXBkYXRlOiAocCkgPT4ge1xuICAgICAgICBpZiAoIXAgfHwgIXAubGF0IHx8ICFwLmxuZyApIHJldHVybjtcblxuICAgICAgICBtYXAuc2V0VmlldyhMLmxhdExuZyhwLmxhdCwgcC5sbmcpLCAxMCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsImNvbnN0IFF1ZXJ5TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldEZvcm0gPSBcImZvcm0jZmlsdGVycy1mb3JtXCIpID0+IHtcbiAgICBjb25zdCAkdGFyZ2V0ID0gdHlwZW9mIHRhcmdldEZvcm0gPT09ICdzdHJpbmcnID8gJCh0YXJnZXRGb3JtKSA6IHRhcmdldEZvcm07XG4gICAgbGV0IGxhdCA9IG51bGw7XG4gICAgbGV0IGxuZyA9IG51bGw7XG5cbiAgICBsZXQgcHJldmlvdXMgPSB7fTtcblxuICAgICR0YXJnZXQub24oJ3N1Ym1pdCcsIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBsYXQgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKCk7XG4gICAgICBsbmcgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKCk7XG5cbiAgICAgIHZhciBmb3JtID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuXG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICQucGFyYW0oZm9ybSk7XG4gICAgfSlcblxuICAgICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnc2VsZWN0I2ZpbHRlci1pdGVtcycsICgpID0+IHtcbiAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgfSlcblxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGluaXRpYWxpemU6IChjYWxsYmFjaykgPT4ge1xuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2gubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHZhciBwYXJhbXMgPSAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpKVxuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGFuZ11cIikudmFsKHBhcmFtcy5sYW5nKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKHBhcmFtcy5sYXQpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwocGFyYW1zLmxuZyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChwYXJhbXMuYm91bmQxKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKHBhcmFtcy5ib3VuZDIpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG9jXVwiKS52YWwocGFyYW1zLmxvYyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1rZXldXCIpLnZhbChwYXJhbXMua2V5KTtcblxuICAgICAgICAgIGlmIChwYXJhbXMuZmlsdGVyKSB7XG4gICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIjZmlsdGVyLWl0ZW1zIG9wdGlvblwiKS5yZW1vdmVQcm9wKFwic2VsZWN0ZWRcIik7XG4gICAgICAgICAgICBwYXJhbXMuZmlsdGVyLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICAgICR0YXJnZXQuZmluZChcIiNmaWx0ZXItaXRlbXMgb3B0aW9uW3ZhbHVlPSdcIiArIGl0ZW0gKyBcIiddXCIpLnByb3AoXCJzZWxlY3RlZFwiLCB0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZ2V0UGFyYW1ldGVyczogKCkgPT4ge1xuICAgICAgICB2YXIgcGFyYW1ldGVycyA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcbiAgICAgICAgLy8gcGFyYW1ldGVyc1snbG9jYXRpb24nXSA7XG5cbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gcGFyYW1ldGVycykge1xuICAgICAgICAgIGlmICggIXBhcmFtZXRlcnNba2V5XSB8fCBwYXJhbWV0ZXJzW2tleV0gPT0gXCJcIikge1xuICAgICAgICAgICAgZGVsZXRlIHBhcmFtZXRlcnNba2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyYW1ldGVycztcbiAgICAgIH0sXG4gICAgICB1cGRhdGVMb2NhdGlvbjogKGxhdCwgbG5nKSA9PiB7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwobGF0KTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChsbmcpO1xuICAgICAgICAvLyAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZVZpZXdwb3J0OiAodmlld3BvcnQpID0+IHtcblxuICAgICAgICBjb25zdCBib3VuZHMgPSBbW3ZpZXdwb3J0LmYuYiwgdmlld3BvcnQuYi5iXSwgW3ZpZXdwb3J0LmYuZiwgdmlld3BvcnQuYi5mXV07XG5cbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMF0pKTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMV0pKTtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVWaWV3cG9ydEJ5Qm91bmQ6IChzdywgbmUpID0+IHtcblxuICAgICAgICBjb25zdCBib3VuZHMgPSBbc3csIG5lXTsvLy8vLy8vL1xuXG5cbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMF0pKTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMV0pKTtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyU3VibWl0OiAoKSA9PiB7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59KShqUXVlcnkpO1xuIiwibGV0IGF1dG9jb21wbGV0ZU1hbmFnZXI7XG5sZXQgbWFwTWFuYWdlcjtcblxud2luZG93LnNsdWdpZnkgPSAodGV4dCkgPT4gdGV4dC50b1N0cmluZygpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxzKy9nLCAnLScpICAgICAgICAgICAvLyBSZXBsYWNlIHNwYWNlcyB3aXRoIC1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvW15cXHdcXC1dKy9nLCAnJykgICAgICAgLy8gUmVtb3ZlIGFsbCBub24td29yZCBjaGFyc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXC1cXC0rL2csICctJykgICAgICAgICAvLyBSZXBsYWNlIG11bHRpcGxlIC0gd2l0aCBzaW5nbGUgLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9eLSsvLCAnJykgICAgICAgICAgICAgLy8gVHJpbSAtIGZyb20gc3RhcnQgb2YgdGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8tKyQvLCAnJyk7ICAgICAgICAgICAgLy8gVHJpbSAtIGZyb20gZW5kIG9mIHRleHRcblxuKGZ1bmN0aW9uKCQpIHtcbiAgLy8gTG9hZCB0aGluZ3NcbiAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KCk7XG4gIC8vIDEuIGdvb2dsZSBtYXBzIGdlb2NvZGVcblxuICAvLyAyLiBmb2N1cyBtYXAgb24gZ2VvY29kZSAodmlhIGxhdC9sbmcpXG4gIGNvbnN0IHF1ZXJ5TWFuYWdlciA9IFF1ZXJ5TWFuYWdlcigpO1xuICAgICAgICBxdWVyeU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuXG4gIGNvbnN0IGluaXRQYXJhbXMgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuICBtYXBNYW5hZ2VyID0gTWFwTWFuYWdlcih7XG4gICAgb25Nb3ZlOiAoc3csIG5lKSA9PiB7XG4gICAgICAvLyBXaGVuIHRoZSBtYXAgbW92ZXMgYXJvdW5kLCB3ZSB1cGRhdGUgdGhlIGxpc3RcbiAgICAgIHF1ZXJ5TWFuYWdlci51cGRhdGVWaWV3cG9ydEJ5Qm91bmQoc3csIG5lKTtcbiAgICAgIC8vdXBkYXRlIFF1ZXJ5XG4gICAgfVxuICB9KTtcblxuICB3aW5kb3cuaW5pdGlhbGl6ZUF1dG9jb21wbGV0ZUNhbGxiYWNrID0gKCkgPT4ge1xuXG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlciA9IEF1dG9jb21wbGV0ZU1hbmFnZXIoXCJpbnB1dFtuYW1lPSdsb2MnXVwiKTtcbiAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICAgIGlmIChpbml0UGFyYW1zLmxvYyAmJiBpbml0UGFyYW1zLmxvYyAhPT0gJycgJiYgKCFpbml0UGFyYW1zLmJvdW5kMSAmJiAhaW5pdFBhcmFtcy5ib3VuZDIpKSB7XG4gICAgICBtYXBNYW5hZ2VyLmluaXRpYWxpemUoKCkgPT4ge1xuICAgICAgICBtYXBNYW5hZ2VyLmdldENlbnRlckJ5TG9jYXRpb24oaW5pdFBhcmFtcy5sb2MsIChyZXN1bHQpID0+IHtcbiAgICAgICAgICBxdWVyeU1hbmFnZXIudXBkYXRlVmlld3BvcnQocmVzdWx0Lmdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG5cbiAgY29uc3QgbGFuZ3VhZ2VNYW5hZ2VyID0gTGFuZ3VhZ2VNYW5hZ2VyKCk7XG5cbiAgbGFuZ3VhZ2VNYW5hZ2VyLmluaXRpYWxpemUoaW5pdFBhcmFtc1snbGFuZyddIHx8ICdlbicpO1xuXG4gIGNvbnN0IGxpc3RNYW5hZ2VyID0gTGlzdE1hbmFnZXIoKTtcblxuICBpZihpbml0UGFyYW1zLmxhdCAmJiBpbml0UGFyYW1zLmxuZykge1xuICAgIG1hcE1hbmFnZXIuc2V0Q2VudGVyKFtpbml0UGFyYW1zLmxhdCwgaW5pdFBhcmFtcy5sbmddKTtcbiAgfVxuXG4gIC8qKipcbiAgKiBMaXN0IEV2ZW50c1xuICAqIFRoaXMgd2lsbCB0cmlnZ2VyIHRoZSBsaXN0IHVwZGF0ZSBtZXRob2RcbiAgKi9cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICBsaXN0TWFuYWdlci5wb3B1bGF0ZUxpc3Qob3B0aW9ucy5wYXJhbXMpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICBsaXN0TWFuYWdlci51cGRhdGVGaWx0ZXIob3B0aW9ucyk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLWJ5LWJvdW5kJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgbGV0IGJvdW5kMSwgYm91bmQyO1xuXG4gICAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLmJvdW5kMSB8fCAhb3B0aW9ucy5ib3VuZDIpIHtcbiAgICAgIFtib3VuZDEsIGJvdW5kMl0gPSBtYXBNYW5hZ2VyLmdldEJvdW5kcygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBib3VuZDEgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQxKTtcbiAgICAgIGJvdW5kMiA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDIpO1xuICAgIH1cblxuXG5cbiAgICBsaXN0TWFuYWdlci51cGRhdGVCb3VuZHMoYm91bmQxLCBib3VuZDIpXG4gIH0pXG5cbiAgLyoqKlxuICAqIE1hcCBFdmVudHNcbiAgKi9cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIC8vIG1hcE1hbmFnZXIuc2V0Q2VudGVyKFtvcHRpb25zLmxhdCwgb3B0aW9ucy5sbmddKTtcbiAgICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMuYm91bmQxIHx8ICFvcHRpb25zLmJvdW5kMikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBib3VuZDEgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQxKTtcbiAgICB2YXIgYm91bmQyID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMik7XG4gICAgbWFwTWFuYWdlci5zZXRCb3VuZHMoYm91bmQxLCBib3VuZDIpO1xuICAgIC8vIG1hcE1hbmFnZXIudHJpZ2dlclpvb21FbmQoKTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgbWFwTWFuYWdlci50cmlnZ2VyWm9vbUVuZCgpO1xuICAgIH0sIDEwKTtcbiAgICAvLyBjb25zb2xlLmxvZyhvcHRpb25zKVxuICB9KTtcbiAgLy8gMy4gbWFya2VycyBvbiBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXBsb3QnLCAoZSwgb3B0KSA9PiB7XG5cbiAgICBtYXBNYW5hZ2VyLnBsb3RQb2ludHMob3B0LmRhdGEsIG9wdC5wYXJhbXMpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicpO1xuICB9KVxuXG4gIC8vIGxvYWQgZ3JvdXBzXG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbG9hZC1ncm91cHMnLCAoZSwgb3B0KSA9PiB7XG5cbiAgICBvcHQuZ3JvdXBzLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgIGxldCBzbHVnZ2VkID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5hcHBlbmQoYDxvcHRpb24gdmFsdWU9JyR7c2x1Z2dlZH0nIHNlbGVjdGVkPSdzZWxlY3RlZCc+JHtpdGVtLnN1cGVyZ3JvdXB9PC9vcHRpb24+YClcbiAgICB9KTtcblxuICAgIC8vIFJlLWluaXRpYWxpemVcbiAgICBxdWVyeU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5tdWx0aXNlbGVjdCgncmVidWlsZCcpO1xuICAgIG1hcE1hbmFnZXIucmVmcmVzaE1hcCgpO1xuICB9KVxuXG4gIC8vIEZpbHRlciBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLWZpbHRlcicsIChlLCBvcHQpID0+IHtcbiAgICBpZiAob3B0KSB7XG4gICAgICBtYXBNYW5hZ2VyLmZpbHRlck1hcChvcHQuZmlsdGVyKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZScsIChlLCBvcHQpID0+IHtcbiAgICBpZiAob3B0KSB7XG4gICAgICBsYW5ndWFnZU1hbmFnZXIudXBkYXRlTGFuZ3VhZ2Uob3B0LmxhbmcpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGFuZ3VhZ2UtbG9hZGVkJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5tdWx0aXNlbGVjdCgncmVidWlsZCcpO1xuICB9KVxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24jc2hvdy1oaWRlLW1hcCcsIChlLCBvcHQpID0+IHtcbiAgICAkKCdib2R5JykudG9nZ2xlQ2xhc3MoJ21hcC12aWV3JylcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbi5idG4ubW9yZS1pdGVtcycsIChlLCBvcHQpID0+IHtcbiAgICAkKCcjZW1iZWQtYXJlYScpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgKGUsIG9wdCkgPT4ge1xuICAgIC8vdXBkYXRlIGVtYmVkIGxpbmVcbiAgICB2YXIgY29weSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3B0KSk7XG4gICAgZGVsZXRlIGNvcHlbJ2xuZyddO1xuICAgIGRlbGV0ZSBjb3B5WydsYXQnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQxJ107XG4gICAgZGVsZXRlIGNvcHlbJ2JvdW5kMiddO1xuXG4gICAgJCgnI2VtYmVkLWFyZWEgaW5wdXRbbmFtZT1lbWJlZF0nKS52YWwoJ2h0dHBzOi8vbmV3LW1hcC4zNTAub3JnIycgKyAkLnBhcmFtKGNvcHkpKTtcbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIChlKSA9PiB7XG4gICAgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCk7XG4gIH0pO1xuXG4gICQod2luZG93KS5vbihcImhhc2hjaGFuZ2VcIiwgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgIGlmIChoYXNoLmxlbmd0aCA9PSAwKSByZXR1cm47XG4gICAgY29uc3QgcGFyYW1ldGVycyA9ICQuZGVwYXJhbShoYXNoLnN1YnN0cmluZygxKSk7XG4gICAgY29uc3Qgb2xkVVJMID0gZXZlbnQub3JpZ2luYWxFdmVudC5vbGRVUkw7XG5cblxuICAgIGNvbnN0IG9sZEhhc2ggPSAkLmRlcGFyYW0ob2xkVVJMLnN1YnN0cmluZyhvbGRVUkwuc2VhcmNoKFwiI1wiKSsxKSk7XG5cbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicsIHBhcmFtZXRlcnMpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgcGFyYW1ldGVycyk7XG5cbiAgICAvLyBTbyB0aGF0IGNoYW5nZSBpbiBmaWx0ZXJzIHdpbGwgbm90IHVwZGF0ZSB0aGlzXG4gICAgaWYgKG9sZEhhc2guYm91bmQxICE9PSBwYXJhbWV0ZXJzLmJvdW5kMSB8fCBvbGRIYXNoLmJvdW5kMiAhPT0gcGFyYW1ldGVycy5ib3VuZDIpIHtcblxuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLWJ5LWJvdW5kJywgcGFyYW1ldGVycyk7XG4gICAgfVxuXG4gICAgLy8gQ2hhbmdlIGl0ZW1zXG4gICAgaWYgKG9sZEhhc2gubGFuZyAhPT0gcGFyYW1ldGVycy5sYW5nKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgIH1cbiAgfSlcblxuICAvLyA0LiBmaWx0ZXIgb3V0IGl0ZW1zIGluIGFjdGl2aXR5LWFyZWFcblxuICAvLyA1LiBnZXQgbWFwIGVsZW1lbnRzXG5cbiAgLy8gNi4gZ2V0IEdyb3VwIGRhdGFcblxuICAvLyA3LiBwcmVzZW50IGdyb3VwIGVsZW1lbnRzXG5cbiAgJC5hamF4KHtcbiAgICB1cmw6ICcvZGF0YS90ZXN0Lmpzb24nLCAvLyd8KipEQVRBX1NPVVJDRSoqfCcsXG4gICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICBjYWNoZTogdHJ1ZSxcbiAgICBzdWNjZXNzOiAoZGF0YSkgPT4ge1xuICAgICAgd2luZG93LkVWRU5UU19EQVRBID0gZGF0YTtcblxuICAgICAgLy9Mb2FkIGdyb3Vwc1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sb2FkLWdyb3VwcycsIHsgZ3JvdXBzOiB3aW5kb3cuRVZFTlRTX0RBVEEuZ3JvdXBzIH0pO1xuXG5cbiAgICAgIHZhciBwYXJhbWV0ZXJzID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuICAgICAgd2luZG93LkVWRU5UU19EQVRBLmRhdGEuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICBpdGVtWydldmVudF90eXBlJ10gPSAhaXRlbS5ldmVudF90eXBlID8gJ0FjdGlvbicgOiBpdGVtLmV2ZW50X3R5cGU7XG4gICAgICB9KVxuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LXVwZGF0ZScsIHsgcGFyYW1zOiBwYXJhbWV0ZXJzIH0pO1xuICAgICAgLy8gJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXBsb3QnLCB7IGRhdGE6IHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhLCBwYXJhbXM6IHBhcmFtZXRlcnMgfSk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuICAgICAgLy9UT0RPOiBNYWtlIHRoZSBnZW9qc29uIGNvbnZlcnNpb24gaGFwcGVuIG9uIHRoZSBiYWNrZW5kXG5cbiAgICAgIC8vUmVmcmVzaCB0aGluZ3NcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBsZXQgcCA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHApO1xuICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCBwKTtcbiAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwKTtcbiAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci1ieS1ib3VuZCcsIHApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCkpXG4gICAgICB9LCAxMDApO1xuICAgIH1cbiAgfSk7XG5cblxuXG59KShqUXVlcnkpO1xuIl19
