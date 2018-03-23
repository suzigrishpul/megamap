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
  $('select#filter-items').multiselect({
    templates: {
      button: '<button type="button" class="multiselect dropdown-toggle" data-toggle="dropdown"><span>Show Filters</span> <img src="/img/filter.png" /></button>'
    },
    dropRight: true
  });
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9sYW5ndWFnZS5qcyIsImNsYXNzZXMvbGlzdC5qcyIsImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9xdWVyeS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJBdXRvY29tcGxldGVNYW5hZ2VyIiwiJCIsInRhcmdldCIsIkFQSV9LRVkiLCJ0YXJnZXRJdGVtIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwicXVlcnlNZ3IiLCJRdWVyeU1hbmFnZXIiLCJnZW9jb2RlciIsImdvb2dsZSIsIm1hcHMiLCJHZW9jb2RlciIsIiR0YXJnZXQiLCJpbml0aWFsaXplIiwidHlwZWFoZWFkIiwiaGludCIsImhpZ2hsaWdodCIsIm1pbkxlbmd0aCIsImNsYXNzTmFtZXMiLCJtZW51IiwibmFtZSIsImRpc3BsYXkiLCJpdGVtIiwiZm9ybWF0dGVkX2FkZHJlc3MiLCJsaW1pdCIsInNvdXJjZSIsInEiLCJzeW5jIiwiYXN5bmMiLCJnZW9jb2RlIiwiYWRkcmVzcyIsInJlc3VsdHMiLCJzdGF0dXMiLCJvbiIsIm9iaiIsImRhdHVtIiwiZ2VvbWV0cnkiLCJ1cGRhdGVWaWV3cG9ydCIsInZpZXdwb3J0IiwialF1ZXJ5IiwiTGFuZ3VhZ2VNYW5hZ2VyIiwibGFuZ3VhZ2UiLCJkaWN0aW9uYXJ5IiwiJHRhcmdldHMiLCJ1cGRhdGVQYWdlTGFuZ3VhZ2UiLCJ0YXJnZXRMYW5ndWFnZSIsInJvd3MiLCJmaWx0ZXIiLCJpIiwibGFuZyIsImVhY2giLCJpbmRleCIsInRhcmdldEF0dHJpYnV0ZSIsImRhdGEiLCJsYW5nVGFyZ2V0IiwidGV4dCIsInZhbCIsImF0dHIiLCJ0YXJnZXRzIiwiYWpheCIsInVybCIsImRhdGFUeXBlIiwic3VjY2VzcyIsInRyaWdnZXIiLCJ1cGRhdGVMYW5ndWFnZSIsIkxpc3RNYW5hZ2VyIiwidGFyZ2V0TGlzdCIsInJlbmRlckV2ZW50IiwiZGF0ZSIsIm1vbWVudCIsIkRhdGUiLCJzdGFydF9kYXRldGltZSIsInRvR01UU3RyaW5nIiwiZm9ybWF0IiwibWF0Y2giLCJ3aW5kb3ciLCJzbHVnaWZ5IiwiZXZlbnRfdHlwZSIsImxhdCIsImxuZyIsInRpdGxlIiwidmVudWUiLCJyZW5kZXJHcm91cCIsIndlYnNpdGUiLCJzdXBlckdyb3VwIiwic3VwZXJncm91cCIsImxvY2F0aW9uIiwiZGVzY3JpcHRpb24iLCIkbGlzdCIsInVwZGF0ZUZpbHRlciIsInAiLCJyZW1vdmVQcm9wIiwiYWRkQ2xhc3MiLCJqb2luIiwiZmluZCIsImhpZGUiLCJmb3JFYWNoIiwiZmlsIiwic2hvdyIsInVwZGF0ZUJvdW5kcyIsImJvdW5kMSIsImJvdW5kMiIsImluZCIsIl9sYXQiLCJfbG5nIiwicmVtb3ZlQ2xhc3MiLCJwb3B1bGF0ZUxpc3QiLCJoYXJkRmlsdGVycyIsImtleVNldCIsImtleSIsInNwbGl0IiwiJGV2ZW50TGlzdCIsIkVWRU5UU19EQVRBIiwibWFwIiwibGVuZ3RoIiwidG9Mb3dlckNhc2UiLCJpbmNsdWRlcyIsInJlbW92ZSIsImFwcGVuZCIsIk1hcE1hbmFnZXIiLCJMQU5HVUFHRSIsInJlbmRlckdlb2pzb24iLCJsaXN0IiwicmVuZGVyZWQiLCJpc05hTiIsInBhcnNlRmxvYXQiLCJzdWJzdHJpbmciLCJ0eXBlIiwiY29vcmRpbmF0ZXMiLCJwcm9wZXJ0aWVzIiwiZXZlbnRQcm9wZXJ0aWVzIiwicG9wdXBDb250ZW50Iiwib3B0aW9ucyIsImFjY2Vzc1Rva2VuIiwiTCIsImRyYWdnaW5nIiwiQnJvd3NlciIsIm1vYmlsZSIsInNldFZpZXciLCJzY3JvbGxXaGVlbFpvb20iLCJkaXNhYmxlIiwib25Nb3ZlIiwiZXZlbnQiLCJzdyIsImdldEJvdW5kcyIsIl9zb3V0aFdlc3QiLCJuZSIsIl9ub3J0aEVhc3QiLCJnZXRab29tIiwidGlsZUxheWVyIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsIiRtYXAiLCJjYWxsYmFjayIsInNldEJvdW5kcyIsImJvdW5kczEiLCJib3VuZHMyIiwiYm91bmRzIiwiZml0Qm91bmRzIiwic2V0Q2VudGVyIiwiY2VudGVyIiwiem9vbSIsImdldENlbnRlckJ5TG9jYXRpb24iLCJ0cmlnZ2VyWm9vbUVuZCIsImZpcmVFdmVudCIsInJlZnJlc2hNYXAiLCJpbnZhbGlkYXRlU2l6ZSIsImZpbHRlck1hcCIsImZpbHRlcnMiLCJwbG90UG9pbnRzIiwiZ2VvanNvbiIsImZlYXR1cmVzIiwiZ2VvSlNPTiIsInBvaW50VG9MYXllciIsImZlYXR1cmUiLCJsYXRsbmciLCJldmVudFR5cGUiLCJzbHVnZ2VkIiwiZ3JvdXBJY29uIiwiaWNvbiIsImljb25VcmwiLCJpY29uU2l6ZSIsImljb25BbmNob3IiLCJjbGFzc05hbWUiLCJldmVudEljb24iLCJnZW9qc29uTWFya2VyT3B0aW9ucyIsIm1hcmtlciIsIm9uRWFjaEZlYXR1cmUiLCJsYXllciIsImJpbmRQb3B1cCIsInVwZGF0ZSIsImxhdExuZyIsInRhcmdldEZvcm0iLCJwcmV2aW91cyIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImZvcm0iLCJkZXBhcmFtIiwic2VyaWFsaXplIiwiaGFzaCIsInBhcmFtIiwicGFyYW1zIiwibG9jIiwicHJvcCIsImdldFBhcmFtZXRlcnMiLCJwYXJhbWV0ZXJzIiwidXBkYXRlTG9jYXRpb24iLCJmIiwiYiIsIkpTT04iLCJzdHJpbmdpZnkiLCJ1cGRhdGVWaWV3cG9ydEJ5Qm91bmQiLCJ0cmlnZ2VyU3VibWl0IiwiYXV0b2NvbXBsZXRlTWFuYWdlciIsIm1hcE1hbmFnZXIiLCJ0b1N0cmluZyIsInJlcGxhY2UiLCJtdWx0aXNlbGVjdCIsInRlbXBsYXRlcyIsImJ1dHRvbiIsImRyb3BSaWdodCIsInF1ZXJ5TWFuYWdlciIsImluaXRQYXJhbXMiLCJpbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2siLCJyZXN1bHQiLCJsYW5ndWFnZU1hbmFnZXIiLCJsaXN0TWFuYWdlciIsInBhcnNlIiwic2V0VGltZW91dCIsIm9wdCIsImdyb3VwcyIsInRvZ2dsZUNsYXNzIiwiY29weSIsIm9sZFVSTCIsIm9y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QUFLdUQsVUFBeEQ7QUFDRCxPQUZEO0FBR0E3RSxRQUFFSSxRQUFGLEVBQVkyRCxPQUFaLENBQW9CLHFCQUFwQixFQUEyQyxFQUFFMEksUUFBUUksVUFBVixFQUEzQztBQUNBO0FBQ0E3TSxRQUFFSSxRQUFGLEVBQVkyRCxPQUFaLENBQW9CLGtCQUFwQixFQUF3QyxFQUFFVixNQUFNc0IsT0FBT3FDLFdBQVAsQ0FBbUIzRCxJQUEzQixFQUFpQ29KLFFBQVFJLFVBQXpDLEVBQXhDO0FBQ0E3TSxRQUFFSSxRQUFGLEVBQVkyRCxPQUFaLENBQW9CLHNCQUFwQixFQUE0QzhJLFVBQTVDO0FBQ0E7O0FBRUE7QUFDQXVCLGlCQUFXLFlBQU07QUFDZixZQUFJMUksSUFBSW1JLGFBQWFqQixhQUFiLEVBQVI7QUFDQTVNLFVBQUVJLFFBQUYsRUFBWTJELE9BQVosQ0FBb0Isb0JBQXBCLEVBQTBDMkIsQ0FBMUM7QUFDQTFGLFVBQUVJLFFBQUYsRUFBWTJELE9BQVosQ0FBb0Isb0JBQXBCLEVBQTBDMkIsQ0FBMUM7QUFDQTFGLFVBQUVJLFFBQUYsRUFBWTJELE9BQVosQ0FBb0IsNEJBQXBCLEVBQWtEMkIsQ0FBbEQ7QUFDQTFGLFVBQUVJLFFBQUYsRUFBWTJELE9BQVosQ0FBb0IsOEJBQXBCLEVBQW9EMkIsQ0FBcEQ7QUFDQTtBQUNELE9BUEQsRUFPRyxHQVBIO0FBUUQ7QUEvQkksR0FBUDtBQW9DRCxDQWxPRCxFQWtPR25ELE1BbE9IIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuLy9BUEkgOkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVxuY29uc3QgQXV0b2NvbXBsZXRlTWFuYWdlciA9IChmdW5jdGlvbigkKSB7XG4gIC8vSW5pdGlhbGl6YXRpb24uLi5cblxuICByZXR1cm4gKHRhcmdldCkgPT4ge1xuXG4gICAgY29uc3QgQVBJX0tFWSA9IFwiQUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXCI7XG4gICAgY29uc3QgdGFyZ2V0SXRlbSA9IHR5cGVvZiB0YXJnZXQgPT0gXCJzdHJpbmdcIiA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KSA6IHRhcmdldDtcbiAgICBjb25zdCBxdWVyeU1nciA9IFF1ZXJ5TWFuYWdlcigpO1xuICAgIHZhciBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICR0YXJnZXQ6ICQodGFyZ2V0SXRlbSksXG4gICAgICB0YXJnZXQ6IHRhcmdldEl0ZW0sXG4gICAgICBpbml0aWFsaXplOiAoKSA9PiB7XG4gICAgICAgICQodGFyZ2V0SXRlbSkudHlwZWFoZWFkKHtcbiAgICAgICAgICAgICAgICAgICAgaGludDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBtaW5MZW5ndGg6IDQsXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICBtZW51OiAndHQtZHJvcGRvd24tbWVudSdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3NlYXJjaC1yZXN1bHRzJyxcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogKGl0ZW0pID0+IGl0ZW0uZm9ybWF0dGVkX2FkZHJlc3MsXG4gICAgICAgICAgICAgICAgICAgIGxpbWl0OiAxMCxcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiBmdW5jdGlvbiAocSwgc3luYywgYXN5bmMpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IHEgfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBhc3luYyhyZXN1bHRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKS5vbigndHlwZWFoZWFkOnNlbGVjdGVkJywgZnVuY3Rpb24gKG9iaiwgZGF0dW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoZGF0dW0pXG4gICAgICAgICAgICAgICAgICAgIHtcblxuICAgICAgICAgICAgICAgICAgICAgIHZhciBnZW9tZXRyeSA9IGRhdHVtLmdlb21ldHJ5O1xuICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5TWdyLnVwZGF0ZVZpZXdwb3J0KGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICAgICAgICAgICAvLyAgbWFwLmZpdEJvdW5kcyhnZW9tZXRyeS5ib3VuZHM/IGdlb21ldHJ5LmJvdW5kcyA6IGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuXG5cbiAgICByZXR1cm4ge1xuXG4gICAgfVxuICB9XG5cbn0oalF1ZXJ5KSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IExhbmd1YWdlTWFuYWdlciA9ICgoJCkgPT4ge1xuICAvL2tleVZhbHVlXG5cbiAgLy90YXJnZXRzIGFyZSB0aGUgbWFwcGluZ3MgZm9yIHRoZSBsYW5ndWFnZVxuICByZXR1cm4gKCkgPT4ge1xuICAgIGxldCBsYW5ndWFnZTtcbiAgICBsZXQgZGljdGlvbmFyeSA9IHt9O1xuICAgIGxldCAkdGFyZ2V0cyA9ICQoXCJbZGF0YS1sYW5nLXRhcmdldF1bZGF0YS1sYW5nLWtleV1cIik7XG5cbiAgICBjb25zdCB1cGRhdGVQYWdlTGFuZ3VhZ2UgPSAoKSA9PiB7XG5cbiAgICAgIGxldCB0YXJnZXRMYW5ndWFnZSA9IGRpY3Rpb25hcnkucm93cy5maWx0ZXIoKGkpID0+IGkubGFuZyA9PT0gbGFuZ3VhZ2UpWzBdO1xuXG4gICAgICAkdGFyZ2V0cy5lYWNoKChpbmRleCwgaXRlbSkgPT4ge1xuICAgICAgICBsZXQgdGFyZ2V0QXR0cmlidXRlID0gJChpdGVtKS5kYXRhKCdsYW5nLXRhcmdldCcpO1xuICAgICAgICBsZXQgbGFuZ1RhcmdldCA9ICQoaXRlbSkuZGF0YSgnbGFuZy1rZXknKTtcblxuICAgICAgICBzd2l0Y2godGFyZ2V0QXR0cmlidXRlKSB7XG4gICAgICAgICAgY2FzZSAndGV4dCc6XG4gICAgICAgICAgICAkKGl0ZW0pLnRleHQodGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAndmFsdWUnOlxuICAgICAgICAgICAgJChpdGVtKS52YWwodGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICQoaXRlbSkuYXR0cih0YXJnZXRBdHRyaWJ1dGUsIHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgbGFuZ3VhZ2UsXG4gICAgICB0YXJnZXRzOiAkdGFyZ2V0cyxcbiAgICAgIGRpY3Rpb25hcnksXG4gICAgICBpbml0aWFsaXplOiAobGFuZykgPT4ge1xuXG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgLy8gdXJsOiAnaHR0cHM6Ly9nc3gyanNvbi5jb20vYXBpP2lkPTFPM2VCeWpMMXZsWWY3WjdhbS1faHRSVFFpNzNQYWZxSWZOQmRMbVhlOFNNJnNoZWV0PTEnLFxuICAgICAgICAgIHVybDogJy9kYXRhL2xhbmcuanNvbicsXG4gICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgZGljdGlvbmFyeSA9IGRhdGE7XG4gICAgICAgICAgICBsYW5ndWFnZSA9IGxhbmc7XG4gICAgICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UoKTtcblxuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sYW5ndWFnZS1sb2FkZWQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZUxhbmd1YWdlOiAobGFuZykgPT4ge1xuXG4gICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgdXBkYXRlUGFnZUxhbmd1YWdlKCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG59KShqUXVlcnkpO1xuIiwiLyogVGhpcyBsb2FkcyBhbmQgbWFuYWdlcyB0aGUgbGlzdCEgKi9cblxuY29uc3QgTGlzdE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRMaXN0ID0gXCIjZXZlbnRzLWxpc3RcIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0TGlzdCA9PT0gJ3N0cmluZycgPyAkKHRhcmdldExpc3QpIDogdGFyZ2V0TGlzdDtcblxuICAgIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0pID0+IHtcblxuICAgICAgdmFyIGRhdGUgPSBtb21lbnQobmV3IERhdGUoaXRlbS5zdGFydF9kYXRldGltZSkudG9HTVRTdHJpbmcoKSkuZm9ybWF0KFwiZGRkZCBNTU0gREQsIGg6bW1hXCIpO1xuICAgICAgbGV0IHVybCA9IGl0ZW0udXJsLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0udXJsIDogXCIvL1wiICsgaXRlbS51cmw7XG4gICAgICAvLyBsZXQgc3VwZXJHcm91cCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG5cbiAgICAgIHJldHVybiBgXG4gICAgICA8bGkgY2xhc3M9JyR7d2luZG93LnNsdWdpZnkoaXRlbS5ldmVudF90eXBlKX0gZXZlbnRzIGV2ZW50LW9iaicgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudCB0eXBlLWFjdGlvblwiPlxuICAgICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICAgIDxsaSBjbGFzcz0ndGFnLSR7aXRlbS5ldmVudF90eXBlfSB0YWcnPiR7aXRlbS5ldmVudF90eXBlfTwvbGk+XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgICA8aDIgY2xhc3M9XCJldmVudC10aXRsZVwiPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1kYXRlIGRhdGVcIj4ke2RhdGV9PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWFkZHJlc3MgYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+UlNWUDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICAgYFxuICAgIH07XG5cbiAgICBjb25zdCByZW5kZXJHcm91cCA9IChpdGVtKSA9PiB7XG4gICAgICBsZXQgdXJsID0gaXRlbS53ZWJzaXRlLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0ud2Vic2l0ZSA6IFwiLy9cIiArIGl0ZW0ud2Vic2l0ZTtcbiAgICAgIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKHN1cGVyR3JvdXApO1xuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaSBjbGFzcz0nJHtpdGVtLmV2ZW50X3R5cGV9ICR7c3VwZXJHcm91cH0gZ3JvdXAtb2JqJyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwIGdyb3VwLW9ialwiPlxuICAgICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctJHtpdGVtLnN1cGVyZ3JvdXB9XCI+JHtpdGVtLnN1cGVyZ3JvdXB9PC9saT5cbiAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDxoMj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS5uYW1lfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1sb2NhdGlvbiBsb2NhdGlvblwiPiR7aXRlbS5sb2NhdGlvbn08L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXNjcmlwdGlvblwiPlxuICAgICAgICAgICAgICA8cD4ke2l0ZW0uZGVzY3JpcHRpb259PC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICRsaXN0OiAkdGFyZ2V0LFxuICAgICAgdXBkYXRlRmlsdGVyOiAocCkgPT4ge1xuICAgICAgICBpZighcCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIFJlbW92ZSBGaWx0ZXJzXG5cbiAgICAgICAgJHRhcmdldC5yZW1vdmVQcm9wKFwiY2xhc3NcIik7XG4gICAgICAgICR0YXJnZXQuYWRkQ2xhc3MocC5maWx0ZXIgPyBwLmZpbHRlci5qb2luKFwiIFwiKSA6ICcnKVxuXG4gICAgICAgICR0YXJnZXQuZmluZCgnbGkuZXZlbnQtb2JqLCBsaS5ncm91cC1vYmonKS5oaWRlKCk7XG5cbiAgICAgICAgaWYgKHAuZmlsdGVyKSB7XG4gICAgICAgICAgcC5maWx0ZXIuZm9yRWFjaCgoZmlsKT0+e1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKGBsaS4ke2ZpbH1gKS5zaG93KCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHVwZGF0ZUJvdW5kczogKGJvdW5kMSwgYm91bmQyKSA9PiB7XG5cbiAgICAgICAgLy8gY29uc3QgYm91bmRzID0gW3AuYm91bmRzMSwgcC5ib3VuZHMyXTtcblxuXG4gICAgICAgICR0YXJnZXQuZmluZCgndWwgbGkuZXZlbnQtb2JqLCB1bCBsaS5ncm91cC1vYmonKS5lYWNoKChpbmQsIGl0ZW0pPT4ge1xuXG4gICAgICAgICAgbGV0IF9sYXQgPSAkKGl0ZW0pLmRhdGEoJ2xhdCcpLFxuICAgICAgICAgICAgICBfbG5nID0gJChpdGVtKS5kYXRhKCdsbmcnKTtcblxuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwidXBkYXRlQm91bmRzXCIsIGl0ZW0pXG4gICAgICAgICAgaWYgKGJvdW5kMVswXSA8PSBfbGF0ICYmIGJvdW5kMlswXSA+PSBfbGF0ICYmIGJvdW5kMVsxXSA8PSBfbG5nICYmIGJvdW5kMlsxXSA+PSBfbG5nKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIkFkZGluZyBib3VuZHNcIik7XG4gICAgICAgICAgICAkKGl0ZW0pLmFkZENsYXNzKCd3aXRoaW4tYm91bmQnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJChpdGVtKS5yZW1vdmVDbGFzcygnd2l0aGluLWJvdW5kJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBwb3B1bGF0ZUxpc3Q6IChoYXJkRmlsdGVycykgPT4ge1xuICAgICAgICAvL3VzaW5nIHdpbmRvdy5FVkVOVF9EQVRBXG4gICAgICAgIGNvbnN0IGtleVNldCA9ICFoYXJkRmlsdGVycy5rZXkgPyBbXSA6IGhhcmRGaWx0ZXJzLmtleS5zcGxpdCgnLCcpO1xuXG4gICAgICAgIHZhciAkZXZlbnRMaXN0ID0gd2luZG93LkVWRU5UU19EQVRBLmRhdGEubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgIGlmIChrZXlTZXQubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLmV2ZW50X3R5cGUgJiYgaXRlbS5ldmVudF90eXBlLnRvTG93ZXJDYXNlKCkgPT0gJ2dyb3VwJyA/IHJlbmRlckdyb3VwKGl0ZW0pIDogcmVuZGVyRXZlbnQoaXRlbSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXlTZXQubGVuZ3RoID4gMCAmJiBpdGVtLmV2ZW50X3R5cGUgIT0gJ2dyb3VwJyAmJiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5ldmVudF90eXBlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlbmRlckV2ZW50KGl0ZW0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2V5U2V0Lmxlbmd0aCA+IDAgJiYgaXRlbS5ldmVudF90eXBlID09ICdncm91cCcgJiYga2V5U2V0LmluY2x1ZGVzKGl0ZW0uc3VwZXJncm91cCkpIHtcbiAgICAgICAgICAgIHJldHVybiByZW5kZXJHcm91cChpdGVtKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIH0pXG4gICAgICAgICR0YXJnZXQuZmluZCgndWwgbGknKS5yZW1vdmUoKTtcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCcpLmFwcGVuZCgkZXZlbnRMaXN0KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiXG5jb25zdCBNYXBNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIGxldCBMQU5HVUFHRSA9ICdlbic7XG5cbiAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSkgPT4ge1xuICAgIHZhciBkYXRlID0gbW9tZW50KGl0ZW0uc3RhcnRfZGF0ZXRpbWUpLmZvcm1hdChcImRkZGQgTU1NIERELCBoOm1tYVwiKTtcbiAgICBsZXQgdXJsID0gaXRlbS51cmwubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS51cmwgOiBcIi8vXCIgKyBpdGVtLnVybDtcblxuICAgIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9J3BvcHVwLWl0ZW0gJHtpdGVtLmV2ZW50X3R5cGV9ICR7c3VwZXJHcm91cH0nIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5ldmVudF90eXBlfVwiPiR7aXRlbS5ldmVudF90eXBlIHx8ICdBY3Rpb24nfTwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxoMiBjbGFzcz1cImV2ZW50LXRpdGxlXCI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1kYXRlXCI+JHtkYXRlfTwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtYWRkcmVzcyBhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+UlNWUDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSkgPT4ge1xuXG4gICAgbGV0IHVybCA9IGl0ZW0ud2Vic2l0ZS5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLndlYnNpdGUgOiBcIi8vXCIgKyBpdGVtLndlYnNpdGU7XG4gICAgbGV0IHN1cGVyR3JvdXAgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuICAgIHJldHVybiBgXG4gICAgPGxpPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXAgZ3JvdXAtb2JqICR7c3VwZXJHcm91cH1cIj5cbiAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctJHtpdGVtLnN1cGVyZ3JvdXB9ICR7c3VwZXJHcm91cH1cIj4ke2l0ZW0uc3VwZXJncm91cH08L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtaGVhZGVyXCI+XG4gICAgICAgICAgPGgyPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLm5hbWV9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWxvY2F0aW9uIGxvY2F0aW9uXCI+JHtpdGVtLmxvY2F0aW9ufTwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXNjcmlwdGlvblwiPlxuICAgICAgICAgICAgPHA+JHtpdGVtLmRlc2NyaXB0aW9ufTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPkdldCBJbnZvbHZlZDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2xpPlxuICAgIGBcbiAgfTtcblxuICBjb25zdCByZW5kZXJHZW9qc29uID0gKGxpc3QpID0+IHtcbiAgICByZXR1cm4gbGlzdC5tYXAoKGl0ZW0pID0+IHtcbiAgICAgIC8vIHJlbmRlcmVkIGV2ZW50VHlwZVxuICAgICAgbGV0IHJlbmRlcmVkO1xuXG4gICAgICBpZiAoaXRlbS5ldmVudF90eXBlICYmIGl0ZW0uZXZlbnRfdHlwZS50b0xvd2VyQ2FzZSgpID09ICdncm91cCcpIHtcbiAgICAgICAgcmVuZGVyZWQgPSByZW5kZXJHcm91cChpdGVtKTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVuZGVyZWQgPSByZW5kZXJFdmVudChpdGVtKTtcbiAgICAgIH1cblxuICAgICAgLy8gZm9ybWF0IGNoZWNrXG4gICAgICBpZiAoaXNOYU4ocGFyc2VGbG9hdChwYXJzZUZsb2F0KGl0ZW0ubG5nKSkpKSB7XG4gICAgICAgIGl0ZW0ubG5nID0gaXRlbS5sbmcuc3Vic3RyaW5nKDEpXG4gICAgICB9XG4gICAgICBpZiAoaXNOYU4ocGFyc2VGbG9hdChwYXJzZUZsb2F0KGl0ZW0ubGF0KSkpKSB7XG4gICAgICAgIGl0ZW0ubGF0ID0gaXRlbS5sYXQuc3Vic3RyaW5nKDEpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICB0eXBlOiBcIlBvaW50XCIsXG4gICAgICAgICAgY29vcmRpbmF0ZXM6IFtpdGVtLmxuZywgaXRlbS5sYXRdXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBldmVudFByb3BlcnRpZXM6IGl0ZW0sXG4gICAgICAgICAgcG9wdXBDb250ZW50OiByZW5kZXJlZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAob3B0aW9ucykgPT4ge1xuICAgIHZhciBhY2Nlc3NUb2tlbiA9ICdway5leUoxSWpvaWJXRjBkR2hsZHpNMU1DSXNJbUVpT2lKYVRWRk1Va1V3SW4wLndjTTNYYzhCR0M2UE0tT3lyd2puaGcnO1xuICAgIHZhciBtYXAgPSBMLm1hcCgnbWFwJywgeyBkcmFnZ2luZzogIUwuQnJvd3Nlci5tb2JpbGUgfSkuc2V0VmlldyhbMzQuODg1OTMwOTQwNzUzMTcsIDUuMDk3NjU2MjUwMDAwMDAxXSwgMik7XG5cbiAgICBpZiAoIUwuQnJvd3Nlci5tb2JpbGUpIHtcbiAgICAgIG1hcC5zY3JvbGxXaGVlbFpvb20uZGlzYWJsZSgpO1xuICAgIH1cblxuICAgIExBTkdVQUdFID0gb3B0aW9ucy5sYW5nIHx8ICdlbic7XG5cbiAgICBpZiAob3B0aW9ucy5vbk1vdmUpIHtcbiAgICAgIG1hcC5vbignZHJhZ2VuZCcsIChldmVudCkgPT4ge1xuXG5cbiAgICAgICAgbGV0IHN3ID0gW21hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW21hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubG5nXTtcbiAgICAgICAgb3B0aW9ucy5vbk1vdmUoc3csIG5lKTtcbiAgICAgIH0pLm9uKCd6b29tZW5kJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChtYXAuZ2V0Wm9vbSgpIDw9IDQpIHtcbiAgICAgICAgICAkKFwiI21hcFwiKS5hZGRDbGFzcyhcInpvb21lZC1vdXRcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJChcIiNtYXBcIikucmVtb3ZlQ2xhc3MoXCJ6b29tZWQtb3V0XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHN3ID0gW21hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW21hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubG5nXTtcbiAgICAgICAgb3B0aW9ucy5vbk1vdmUoc3csIG5lKTtcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gbWFwLmZpcmVFdmVudCgnem9vbWVuZCcpO1xuXG4gICAgTC50aWxlTGF5ZXIoJ2h0dHBzOi8vYXBpLm1hcGJveC5jb20vc3R5bGVzL3YxL21hdHRoZXczNTAvY2phNDF0aWprMjdkNjJycW9kN2cwbHg0Yi90aWxlcy8yNTYve3p9L3t4fS97eX0/YWNjZXNzX3Rva2VuPScgKyBhY2Nlc3NUb2tlbiwge1xuICAgICAgICBhdHRyaWJ1dGlvbjogJyZjb3B5OyA8YSBocmVmPVwiaHR0cDovL29zbS5vcmcvY29weXJpZ2h0XCI+T3BlblN0cmVldE1hcDwvYT4gY29udHJpYnV0b3JzIOKAoiA8YSBocmVmPVwiLy8zNTAub3JnXCI+MzUwLm9yZzwvYT4nXG4gICAgfSkuYWRkVG8obWFwKTtcblxuICAgIGxldCBnZW9jb2RlciA9IG51bGw7XG4gICAgcmV0dXJuIHtcbiAgICAgICRtYXA6IG1hcCxcbiAgICAgIGluaXRpYWxpemU6IChjYWxsYmFjaykgPT4ge1xuICAgICAgICBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgc2V0Qm91bmRzOiAoYm91bmRzMSwgYm91bmRzMikgPT4ge1xuICAgICAgICBjb25zdCBib3VuZHMgPSBbYm91bmRzMSwgYm91bmRzMl07XG4gICAgICAgIG1hcC5maXRCb3VuZHMoYm91bmRzKTtcbiAgICAgIH0sXG4gICAgICBzZXRDZW50ZXI6IChjZW50ZXIsIHpvb20gPSAxMCkgPT4ge1xuICAgICAgICBpZiAoIWNlbnRlciB8fCAhY2VudGVyWzBdIHx8IGNlbnRlclswXSA9PSBcIlwiXG4gICAgICAgICAgICAgIHx8ICFjZW50ZXJbMV0gfHwgY2VudGVyWzFdID09IFwiXCIpIHJldHVybjtcbiAgICAgICAgbWFwLnNldFZpZXcoY2VudGVyLCB6b29tKTtcbiAgICAgIH0sXG4gICAgICBnZXRCb3VuZHM6ICgpID0+IHtcblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuXG4gICAgICAgIHJldHVybiBbc3csIG5lXTtcbiAgICAgIH0sXG4gICAgICAvLyBDZW50ZXIgbG9jYXRpb24gYnkgZ2VvY29kZWRcbiAgICAgIGdldENlbnRlckJ5TG9jYXRpb246IChsb2NhdGlvbiwgY2FsbGJhY2spID0+IHtcblxuICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogbG9jYXRpb24gfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuXG4gICAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2socmVzdWx0c1swXSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHRyaWdnZXJab29tRW5kOiAoKSA9PiB7XG4gICAgICAgIG1hcC5maXJlRXZlbnQoJ3pvb21lbmQnKTtcbiAgICAgIH0sXG4gICAgICByZWZyZXNoTWFwOiAoKSA9PiB7XG4gICAgICAgIG1hcC5pbnZhbGlkYXRlU2l6ZShmYWxzZSk7XG4gICAgICAgIC8vIG1hcC5fb25SZXNpemUoKTtcbiAgICAgICAgLy8gbWFwLmZpcmVFdmVudCgnem9vbWVuZCcpO1xuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwibWFwIGlzIHJlc2l6ZWRcIilcbiAgICAgIH0sXG4gICAgICBmaWx0ZXJNYXA6IChmaWx0ZXJzKSA9PiB7XG5cbiAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwXCIpLmhpZGUoKTtcblxuICAgICAgICAvLyBjb25zb2xlLmxvZyhmaWx0ZXJzKTtcbiAgICAgICAgaWYgKCFmaWx0ZXJzKSByZXR1cm47XG5cbiAgICAgICAgZmlsdGVycy5mb3JFYWNoKChpdGVtKSA9PiB7XG5cbiAgICAgICAgICAkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXAuXCIgKyBpdGVtLnRvTG93ZXJDYXNlKCkpLnNob3coKTtcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICBwbG90UG9pbnRzOiAobGlzdCwgaGFyZEZpbHRlcnMpID0+IHtcblxuICAgICAgICBjb25zdCBrZXlTZXQgPSAhaGFyZEZpbHRlcnMua2V5ID8gW10gOiBoYXJkRmlsdGVycy5rZXkuc3BsaXQoJywnKTtcblxuICAgICAgICBpZiAoa2V5U2V0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsaXN0ID0gbGlzdC5maWx0ZXIoKGl0ZW0pID0+IGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKVxuICAgICAgICB9XG5cblxuICAgICAgICBjb25zdCBnZW9qc29uID0ge1xuICAgICAgICAgIHR5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgICAgICAgICBmZWF0dXJlczogcmVuZGVyR2VvanNvbihsaXN0KVxuICAgICAgICB9O1xuXG5cblxuICAgICAgICBMLmdlb0pTT04oZ2VvanNvbiwge1xuICAgICAgICAgICAgcG9pbnRUb0xheWVyOiAoZmVhdHVyZSwgbGF0bG5nKSA9PiB7XG4gICAgICAgICAgICAgIC8vIEljb25zIGZvciBtYXJrZXJzXG4gICAgICAgICAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuZXZlbnRfdHlwZTtcbiAgICAgICAgICAgICAgY29uc3Qgc2x1Z2dlZCA9IHdpbmRvdy5zbHVnaWZ5KGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuc3VwZXJncm91cCk7XG5cbiAgICAgICAgICAgICAgdmFyIGdyb3VwSWNvbiA9IEwuaWNvbih7XG4gICAgICAgICAgICAgICAgaWNvblVybDogZXZlbnRUeXBlICYmIGV2ZW50VHlwZS50b0xvd2VyQ2FzZSgpID09PSAnZ3JvdXAnID8gJy9pbWcvZ3JvdXAuc3ZnJyA6ICcvaW1nL2V2ZW50LnN2ZycsXG4gICAgICAgICAgICAgICAgaWNvblNpemU6IFsyMiwgMjJdLFxuICAgICAgICAgICAgICAgIGljb25BbmNob3I6IFsxMiwgOF0sXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBzbHVnZ2VkICsgJyBldmVudC1pdGVtLXBvcHVwJ1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgdmFyIGV2ZW50SWNvbiA9IEwuaWNvbih7XG4gICAgICAgICAgICAgICAgaWNvblVybDogZXZlbnRUeXBlICYmIGV2ZW50VHlwZS50b0xvd2VyQ2FzZSgpID09PSAnZ3JvdXAnID8gJy9pbWcvZ3JvdXAuc3ZnJyA6ICcvaW1nL2V2ZW50LnN2ZycsXG4gICAgICAgICAgICAgICAgaWNvblNpemU6IFsxOCwgMThdLFxuICAgICAgICAgICAgICAgIGljb25BbmNob3I6IFs5LCA5XSxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdldmVudHMgZXZlbnQtaXRlbS1wb3B1cCdcbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgdmFyIGdlb2pzb25NYXJrZXJPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIGljb246IGV2ZW50VHlwZSAmJiBldmVudFR5cGUudG9Mb3dlckNhc2UoKSA9PT0gJ2dyb3VwJyA/IGdyb3VwSWNvbiA6IGV2ZW50SWNvbixcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgcmV0dXJuIEwubWFya2VyKGxhdGxuZywgZ2VvanNvbk1hcmtlck9wdGlvbnMpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgIG9uRWFjaEZlYXR1cmU6IChmZWF0dXJlLCBsYXllcikgPT4ge1xuICAgICAgICAgICAgaWYgKGZlYXR1cmUucHJvcGVydGllcyAmJiBmZWF0dXJlLnByb3BlcnRpZXMucG9wdXBDb250ZW50KSB7XG4gICAgICAgICAgICAgIGxheWVyLmJpbmRQb3B1cChmZWF0dXJlLnByb3BlcnRpZXMucG9wdXBDb250ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pLmFkZFRvKG1hcCk7XG5cbiAgICAgIH0sXG4gICAgICB1cGRhdGU6IChwKSA9PiB7XG4gICAgICAgIGlmICghcCB8fCAhcC5sYXQgfHwgIXAubG5nICkgcmV0dXJuO1xuXG4gICAgICAgIG1hcC5zZXRWaWV3KEwubGF0TG5nKHAubGF0LCBwLmxuZyksIDEwKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiY29uc3QgUXVlcnlNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIHJldHVybiAodGFyZ2V0Rm9ybSA9IFwiZm9ybSNmaWx0ZXJzLWZvcm1cIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0Rm9ybSA9PT0gJ3N0cmluZycgPyAkKHRhcmdldEZvcm0pIDogdGFyZ2V0Rm9ybTtcbiAgICBsZXQgbGF0ID0gbnVsbDtcbiAgICBsZXQgbG5nID0gbnVsbDtcblxuICAgIGxldCBwcmV2aW91cyA9IHt9O1xuXG4gICAgJHRhcmdldC5vbignc3VibWl0JywgKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGxhdCA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwoKTtcbiAgICAgIGxuZyA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwoKTtcblxuICAgICAgdmFyIGZvcm0gPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG5cbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJC5wYXJhbShmb3JtKTtcbiAgICB9KVxuXG4gICAgJChkb2N1bWVudCkub24oJ2NoYW5nZScsICdzZWxlY3QjZmlsdGVyLWl0ZW1zJywgKCkgPT4ge1xuICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICB9KVxuXG5cbiAgICByZXR1cm4ge1xuICAgICAgaW5pdGlhbGl6ZTogKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdmFyIHBhcmFtcyA9ICQuZGVwYXJhbSh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkpXG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYW5nXVwiKS52YWwocGFyYW1zLmxhbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwocGFyYW1zLmxhdCk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChwYXJhbXMubG5nKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKHBhcmFtcy5ib3VuZDEpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwocGFyYW1zLmJvdW5kMik7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sb2NdXCIpLnZhbChwYXJhbXMubG9jKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWtleV1cIikudmFsKHBhcmFtcy5rZXkpO1xuXG4gICAgICAgICAgaWYgKHBhcmFtcy5maWx0ZXIpIHtcbiAgICAgICAgICAgICR0YXJnZXQuZmluZChcIiNmaWx0ZXItaXRlbXMgb3B0aW9uXCIpLnJlbW92ZVByb3AoXCJzZWxlY3RlZFwiKTtcbiAgICAgICAgICAgIHBhcmFtcy5maWx0ZXIuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiI2ZpbHRlci1pdGVtcyBvcHRpb25bdmFsdWU9J1wiICsgaXRlbSArIFwiJ11cIikucHJvcChcInNlbGVjdGVkXCIsIHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBnZXRQYXJhbWV0ZXJzOiAoKSA9PiB7XG4gICAgICAgIHZhciBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuICAgICAgICAvLyBwYXJhbWV0ZXJzWydsb2NhdGlvbiddIDtcblxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBwYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgaWYgKCAhcGFyYW1ldGVyc1trZXldIHx8IHBhcmFtZXRlcnNba2V5XSA9PSBcIlwiKSB7XG4gICAgICAgICAgICBkZWxldGUgcGFyYW1ldGVyc1trZXldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJhbWV0ZXJzO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZUxvY2F0aW9uOiAobGF0LCBsbmcpID0+IHtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChsYXQpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKGxuZyk7XG4gICAgICAgIC8vICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlVmlld3BvcnQ6ICh2aWV3cG9ydCkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtbdmlld3BvcnQuZi5iLCB2aWV3cG9ydC5iLmJdLCBbdmlld3BvcnQuZi5mLCB2aWV3cG9ydC5iLmZdXTtcblxuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1swXSkpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1sxXSkpO1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZVZpZXdwb3J0QnlCb3VuZDogKHN3LCBuZSkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtzdywgbmVdOy8vLy8vLy8vXG5cblxuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1swXSkpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1sxXSkpO1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHRyaWdnZXJTdWJtaXQ6ICgpID0+IHtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJsZXQgYXV0b2NvbXBsZXRlTWFuYWdlcjtcbmxldCBtYXBNYW5hZ2VyO1xuXG53aW5kb3cuc2x1Z2lmeSA9ICh0ZXh0KSA9PiB0ZXh0LnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHMrL2csICctJykgICAgICAgICAgIC8vIFJlcGxhY2Ugc3BhY2VzIHdpdGggLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9bXlxcd1xcLV0rL2csICcnKSAgICAgICAvLyBSZW1vdmUgYWxsIG5vbi13b3JkIGNoYXJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcLVxcLSsvZywgJy0nKSAgICAgICAgIC8vIFJlcGxhY2UgbXVsdGlwbGUgLSB3aXRoIHNpbmdsZSAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL14tKy8sICcnKSAgICAgICAgICAgICAvLyBUcmltIC0gZnJvbSBzdGFydCBvZiB0ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLy0rJC8sICcnKTsgICAgICAgICAgICAvLyBUcmltIC0gZnJvbSBlbmQgb2YgdGV4dFxuXG4oZnVuY3Rpb24oJCkge1xuICAvLyBMb2FkIHRoaW5nc1xuICAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykubXVsdGlzZWxlY3Qoe1xuICAgIHRlbXBsYXRlczoge1xuICAgICAgYnV0dG9uOiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJtdWx0aXNlbGVjdCBkcm9wZG93bi10b2dnbGVcIiBkYXRhLXRvZ2dsZT1cImRyb3Bkb3duXCI+PHNwYW4+U2hvdyBGaWx0ZXJzPC9zcGFuPiA8aW1nIHNyYz1cIi9pbWcvZmlsdGVyLnBuZ1wiIC8+PC9idXR0b24+JyxcbiAgICB9LFxuICAgIGRyb3BSaWdodDogdHJ1ZVxuICB9KTtcbiAgLy8gMS4gZ29vZ2xlIG1hcHMgZ2VvY29kZVxuXG4gIC8vIDIuIGZvY3VzIG1hcCBvbiBnZW9jb2RlICh2aWEgbGF0L2xuZylcbiAgY29uc3QgcXVlcnlNYW5hZ2VyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgICAgIHF1ZXJ5TWFuYWdlci5pbml0aWFsaXplKCk7XG5cbiAgY29uc3QgaW5pdFBhcmFtcyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gIG1hcE1hbmFnZXIgPSBNYXBNYW5hZ2VyKHtcbiAgICBvbk1vdmU6IChzdywgbmUpID0+IHtcbiAgICAgIC8vIFdoZW4gdGhlIG1hcCBtb3ZlcyBhcm91bmQsIHdlIHVwZGF0ZSB0aGUgbGlzdFxuICAgICAgcXVlcnlNYW5hZ2VyLnVwZGF0ZVZpZXdwb3J0QnlCb3VuZChzdywgbmUpO1xuICAgICAgLy91cGRhdGUgUXVlcnlcbiAgICB9XG4gIH0pO1xuXG4gIHdpbmRvdy5pbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2sgPSAoKSA9PiB7XG5cbiAgICBhdXRvY29tcGxldGVNYW5hZ2VyID0gQXV0b2NvbXBsZXRlTWFuYWdlcihcImlucHV0W25hbWU9J2xvYyddXCIpO1xuICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuXG4gICAgaWYgKGluaXRQYXJhbXMubG9jICYmIGluaXRQYXJhbXMubG9jICE9PSAnJyAmJiAoIWluaXRQYXJhbXMuYm91bmQxICYmICFpbml0UGFyYW1zLmJvdW5kMikpIHtcbiAgICAgIG1hcE1hbmFnZXIuaW5pdGlhbGl6ZSgoKSA9PiB7XG4gICAgICAgIG1hcE1hbmFnZXIuZ2V0Q2VudGVyQnlMb2NhdGlvbihpbml0UGFyYW1zLmxvYywgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIHF1ZXJ5TWFuYWdlci51cGRhdGVWaWV3cG9ydChyZXN1bHQuZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cblxuICBjb25zdCBsYW5ndWFnZU1hbmFnZXIgPSBMYW5ndWFnZU1hbmFnZXIoKTtcblxuICBsYW5ndWFnZU1hbmFnZXIuaW5pdGlhbGl6ZShpbml0UGFyYW1zWydsYW5nJ10gfHwgJ2VuJyk7XG5cbiAgY29uc3QgbGlzdE1hbmFnZXIgPSBMaXN0TWFuYWdlcigpO1xuXG4gIGlmKGluaXRQYXJhbXMubGF0ICYmIGluaXRQYXJhbXMubG5nKSB7XG4gICAgbWFwTWFuYWdlci5zZXRDZW50ZXIoW2luaXRQYXJhbXMubGF0LCBpbml0UGFyYW1zLmxuZ10pO1xuICB9XG5cbiAgLyoqKlxuICAqIExpc3QgRXZlbnRzXG4gICogVGhpcyB3aWxsIHRyaWdnZXIgdGhlIGxpc3QgdXBkYXRlIG1ldGhvZFxuICAqL1xuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnBvcHVsYXRlTGlzdChvcHRpb25zLnBhcmFtcyk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnVwZGF0ZUZpbHRlcihvcHRpb25zKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICBsZXQgYm91bmQxLCBib3VuZDI7XG5cbiAgICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMuYm91bmQxIHx8ICFvcHRpb25zLmJvdW5kMikge1xuICAgICAgW2JvdW5kMSwgYm91bmQyXSA9IG1hcE1hbmFnZXIuZ2V0Qm91bmRzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJvdW5kMSA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDEpO1xuICAgICAgYm91bmQyID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMik7XG4gICAgfVxuXG5cblxuICAgIGxpc3RNYW5hZ2VyLnVwZGF0ZUJvdW5kcyhib3VuZDEsIGJvdW5kMilcbiAgfSlcblxuICAvKioqXG4gICogTWFwIEV2ZW50c1xuICAqL1xuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgLy8gbWFwTWFuYWdlci5zZXRDZW50ZXIoW29wdGlvbnMubGF0LCBvcHRpb25zLmxuZ10pO1xuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGJvdW5kMSA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDEpO1xuICAgIHZhciBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcbiAgICBtYXBNYW5hZ2VyLnNldEJvdW5kcyhib3VuZDEsIGJvdW5kMik7XG4gICAgLy8gbWFwTWFuYWdlci50cmlnZ2VyWm9vbUVuZCgpO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBtYXBNYW5hZ2VyLnRyaWdnZXJab29tRW5kKCk7XG4gICAgfSwgMTApO1xuICAgIC8vIGNvbnNvbGUubG9nKG9wdGlvbnMpXG4gIH0pO1xuICAvLyAzLiBtYXJrZXJzIG9uIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtcGxvdCcsIChlLCBvcHQpID0+IHtcblxuICAgIG1hcE1hbmFnZXIucGxvdFBvaW50cyhvcHQuZGF0YSwgb3B0LnBhcmFtcyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJyk7XG4gIH0pXG5cbiAgLy8gbG9hZCBncm91cHNcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sb2FkLWdyb3VwcycsIChlLCBvcHQpID0+IHtcblxuICAgIG9wdC5ncm91cHMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgbGV0IHNsdWdnZWQgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuICAgICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLmFwcGVuZChgPG9wdGlvbiB2YWx1ZT0nJHtzbHVnZ2VkfScgc2VsZWN0ZWQ9J3NlbGVjdGVkJz4ke2l0ZW0uc3VwZXJncm91cH08L29wdGlvbj5gKVxuICAgIH0pO1xuXG4gICAgLy8gUmUtaW5pdGlhbGl6ZVxuICAgIHF1ZXJ5TWFuYWdlci5pbml0aWFsaXplKCk7XG4gICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KCdyZWJ1aWxkJyk7XG4gICAgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCk7XG4gIH0pXG5cbiAgLy8gRmlsdGVyIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtZmlsdGVyJywgKGUsIG9wdCkgPT4ge1xuICAgIGlmIChvcHQpIHtcbiAgICAgIG1hcE1hbmFnZXIuZmlsdGVyTWFwKG9wdC5maWx0ZXIpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgKGUsIG9wdCkgPT4ge1xuICAgIGlmIChvcHQpIHtcbiAgICAgIGxhbmd1YWdlTWFuYWdlci51cGRhdGVMYW5ndWFnZShvcHQubGFuZyk7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sYW5ndWFnZS1sb2FkZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KCdyZWJ1aWxkJyk7XG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbiNzaG93LWhpZGUtbWFwJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ2JvZHknKS50b2dnbGVDbGFzcygnbWFwLXZpZXcnKVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uLmJ0bi5tb3JlLWl0ZW1zJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJyNlbWJlZC1hcmVhJykudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgLy91cGRhdGUgZW1iZWQgbGluZVxuICAgIHZhciBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHQpKTtcbiAgICBkZWxldGUgY29weVsnbG5nJ107XG4gICAgZGVsZXRlIGNvcHlbJ2xhdCddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDEnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQyJ107XG5cbiAgICAkKCcjZW1iZWQtYXJlYSBpbnB1dFtuYW1lPWVtYmVkXScpLnZhbCgnaHR0cHM6Ly9uZXctbWFwLjM1MC5vcmcjJyArICQucGFyYW0oY29weSkpO1xuICB9KTtcblxuICAkKHdpbmRvdykub24oXCJyZXNpemVcIiwgKGUpID0+IHtcbiAgICBtYXBNYW5hZ2VyLnJlZnJlc2hNYXAoKTtcbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKFwiaGFzaGNoYW5nZVwiLCAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgaWYgKGhhc2gubGVuZ3RoID09IDApIHJldHVybjtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKGhhc2guc3Vic3RyaW5nKDEpKTtcbiAgICBjb25zdCBvbGRVUkwgPSBldmVudC5vcmlnaW5hbEV2ZW50Lm9sZFVSTDtcblxuXG4gICAgY29uc3Qgb2xkSGFzaCA9ICQuZGVwYXJhbShvbGRVUkwuc3Vic3RyaW5nKG9sZFVSTC5zZWFyY2goXCIjXCIpKzEpKTtcblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcblxuICAgIC8vIFNvIHRoYXQgY2hhbmdlIGluIGZpbHRlcnMgd2lsbCBub3QgdXBkYXRlIHRoaXNcbiAgICBpZiAob2xkSGFzaC5ib3VuZDEgIT09IHBhcmFtZXRlcnMuYm91bmQxIHx8IG9sZEhhc2guYm91bmQyICE9PSBwYXJhbWV0ZXJzLmJvdW5kMikge1xuXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG5cbiAgICAvLyBDaGFuZ2UgaXRlbXNcbiAgICBpZiAob2xkSGFzaC5sYW5nICE9PSBwYXJhbWV0ZXJzLmxhbmcpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgfVxuICB9KVxuXG4gIC8vIDQuIGZpbHRlciBvdXQgaXRlbXMgaW4gYWN0aXZpdHktYXJlYVxuXG4gIC8vIDUuIGdldCBtYXAgZWxlbWVudHNcblxuICAvLyA2LiBnZXQgR3JvdXAgZGF0YVxuXG4gIC8vIDcuIHByZXNlbnQgZ3JvdXAgZWxlbWVudHNcblxuICAkLmFqYXgoe1xuICAgIHVybDogJy9kYXRhL3Rlc3QuanNvbicsIC8vJ3wqKkRBVEFfU09VUkNFKip8JyxcbiAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgIGNhY2hlOiB0cnVlLFxuICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICB3aW5kb3cuRVZFTlRTX0RBVEEgPSBkYXRhO1xuXG4gICAgICAvL0xvYWQgZ3JvdXBzXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxvYWQtZ3JvdXBzJywgeyBncm91cHM6IHdpbmRvdy5FVkVOVFNfREFUQS5ncm91cHMgfSk7XG5cblxuICAgICAgdmFyIHBhcmFtZXRlcnMgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuXG4gICAgICB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIGl0ZW1bJ2V2ZW50X3R5cGUnXSA9ICFpdGVtLmV2ZW50X3R5cGUgPyAnQWN0aW9uJyA6IGl0ZW0uZXZlbnRfdHlwZTtcbiAgICAgIH0pXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtdXBkYXRlJywgeyBwYXJhbXM6IHBhcmFtZXRlcnMgfSk7XG4gICAgICAvLyAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtcGxvdCcsIHsgZGF0YTogd2luZG93LkVWRU5UU19EQVRBLmRhdGEsIHBhcmFtczogcGFyYW1ldGVycyB9KTtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgcGFyYW1ldGVycyk7XG4gICAgICAvL1RPRE86IE1ha2UgdGhlIGdlb2pzb24gY29udmVyc2lvbiBoYXBwZW4gb24gdGhlIGJhY2tlbmRcblxuICAgICAgLy9SZWZyZXNoIHRoaW5nc1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGxldCBwID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcbiAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcCk7XG4gICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicsIHApO1xuICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHApO1xuICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLWJ5LWJvdW5kJywgcCk7XG4gICAgICAgIC8vY29uc29sZS5sb2cocXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKSlcbiAgICAgIH0sIDEwMCk7XG4gICAgfVxuICB9KTtcblxuXG5cbn0pKGpRdWVyeSk7XG4iXX0=
