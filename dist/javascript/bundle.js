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
    url: 'https://new-map.350.org/output/350org-new-layout.js.gz', //'|**DATA_SOURCE**|',
    dataType: 'script',
    cache: true,
    success: function success(data) {
      // window.EVENTS_DATA = data;

      console.log(window.EVENTS_DATA);

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9sYW5ndWFnZS5qcyIsImNsYXNzZXMvbGlzdC5qcyIsImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9xdWVyeS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJBdXRvY29tcGxldGVNYW5hZ2VyIiwiJCIsInRhcmdldCIsIkFQSV9LRVkiLCJ0YXJnZXRJdGVtIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwicXVlcnlNZ3IiLCJRdWVyeU1hbmFnZXIiLCJnZW9jb2RlciIsImdvb2dsZSIsIm1hcHMiLCJHZW9jb2RlciIsIiR0YXJnZXQiLCJpbml0aWFsaXplIiwidHlwZWFoZWFkIiwiaGludCIsImhpZ2hsaWdodCIsIm1pbkxlbmd0aCIsImNsYXNzTmFtZXMiLCJtZW51IiwibmFtZSIsImRpc3BsYXkiLCJpdGVtIiwiZm9ybWF0dGVkX2FkZHJlc3MiLCJsaW1pdCIsInNvdXJjZSIsInEiLCJzeW5jIiwiYXN5bmMiLCJnZW9jb2RlIiwiYWRkcmVzcyIsInJlc3VsdHMiLCJzdGF0dXMiLCJvbiIsIm9iaiIsImRhdHVtIiwiZ2VvbWV0cnkiLCJ1cGRhdGVWaWV3cG9ydCIsInZpZXdwb3J0IiwialF1ZXJ5IiwiTGFuZ3VhZ2VNYW5hZ2VyIiwibGFuZ3VhZ2UiLCJkaWN0aW9uYXJ5IiwiJHRhcmdldHMiLCJ1cGRhdGVQYWdlTGFuZ3VhZ2UiLCJ0YXJnZXRMYW5ndWFnZSIsInJvd3MiLCJmaWx0ZXIiLCJpIiwibGFuZyIsImVhY2giLCJpbmRleCIsInRhcmdldEF0dHJpYnV0ZSIsImRhdGEiLCJsYW5nVGFyZ2V0IiwidGV4dCIsInZhbCIsImF0dHIiLCJ0YXJnZXRzIiwiYWpheCIsInVybCIsImRhdGFUeXBlIiwic3VjY2VzcyIsInRyaWdnZXIiLCJ1cGRhdGVMYW5ndWFnZSIsIkxpc3RNYW5hZ2VyIiwidGFyZ2V0TGlzdCIsInJlbmRlckV2ZW50IiwiZGF0ZSIsIm1vbWVudCIsIkRhdGUiLCJzdGFydF9kYXRldGltZSIsInRvR01UU3RyaW5nIiwiZm9ybWF0IiwibWF0Y2giLCJ3aW5kb3ciLCJzbHVnaWZ5IiwiZXZlbnRfdHlwZSIsImxhdCIsImxuZyIsInRpdGxlIiwidmVudWUiLCJyZW5kZXJHcm91cCIsIndlYnNpdGUiLCJzdXBlckdyb3VwIiwic3VwZXJncm91cCIsImxvY2F0aW9uIiwiZGVzY3JpcHRpb24iLCIkbGlzdCIsInVwZGF0ZUZpbHRlciIsInAiLCJyZW1vdmVQcm9wIiwiYWRkQ2xhc3MiLCJqb2luIiwiZmluZCIsImhpZGUiLCJmb3JFYWNoIiwiZmlsIiwic2hvdyIsInVwZGF0ZUJvdW5kcyIsImJvdW5kMSIsImJvdW5kMiIsImluZCIsIl9sYXQiLCJfbG5nIiwicmVtb3ZlQ2xhc3MiLCJwb3B1bGF0ZUxpc3QiLCJoYXJkRmlsdGVycyIsImtleVNldCIsImtleSIsInNwbGl0IiwiJGV2ZW50TGlzdCIsIkVWRU5UU19EQVRBIiwibWFwIiwibGVuZ3RoIiwidG9Mb3dlckNhc2UiLCJpbmNsdWRlcyIsInJlbW92ZSIsImFwcGVuZCIsIk1hcE1hbmFnZXIiLCJMQU5HVUFHRSIsInJlbmRlckdlb2pzb24iLCJsaXN0IiwicmVuZGVyZWQiLCJpc05hTiIsInBhcnNlRmxvYXQiLCJzdWJzdHJpbmciLCJ0eXBlIiwiY29vcmRpbmF0ZXMiLCJwcm9wZXJ0aWVzIiwiZXZlbnRQcm9wZXJ0aWVzIiwicG9wdXBDb250ZW50Iiwib3B0aW9ucyIsImFjY2Vzc1Rva2VuIiwiTCIsImRyYWdnaW5nIiwiQnJvd3NlciIsIm1vYmlsZSIsInNldFZpZXciLCJzY3JvbGxXaGVlbFpvb20iLCJkaXNhYmxlIiwib25Nb3ZlIiwiZXZlbnQiLCJzdyIsImdldEJvdW5kcyIsIl9zb3V0aFdlc3QiLCJuZSIsIl9ub3J0aEVhc3QiLCJnZXRab29tIiwidGlsZUxheWVyIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsIiRtYXAiLCJjYWxsYmFjayIsInNldEJvdW5kcyIsImJvdW5kczEiLCJib3VuZHMyIiwiYm91bmRzIiwiZml0Qm91bmRzIiwic2V0Q2VudGVyIiwiY2VudGVyIiwiem9vbSIsImdldENlbnRlckJ5TG9jYXRpb24iLCJ0cmlnZ2VyWm9vbUVuZCIsImZpcmVFdmVudCIsInJlZnJlc2hNYXAiLCJpbnZhbGlkYXRlU2l6ZSIsImZpbHRlck1hcCIsImZpbHRlcnMiLCJwbG90UG9pbnRzIiwiZ2VvanNvbiIsImZlYXR1cmVzIiwiZ2VvSlNPTiIsInBvaW50VG9MYXllciIsImZlYXR1cmUiLCJsYXRsbmciLCJldmVudFR5cGUiLCJzbHVnZ2VkIiwiZ3JvdXBJY29uIiwiaWNvbiIsImljb25VcmwiLCJpY29uU2l6ZSIsImljb25BbmNob3IiLCJjbGFzc05hbWUiLCJldmVudEljb24iLCJnZW9qc29uTWFya2VyT3B0aW9ucyIsIm1hcmtlciIsIm9uRWFjaEZlYXR1cmUiLCJsYXllciIsImJpbmRQb3B1cCIsInVwZGF0ZSIsImxhdExuZyIsInRhcmdldEZvcm0iLCJwcmV2aW91cyIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImZvcm0iLCJkZXBhcmFtIiwic2VyaWFsaXplIiwiaGFzaCIsInBhcmFtIiwicGFyYW1zIiwibG9jIiwicHJvcCIsImdldFBhcmFtZXRlcnMiLCJwYXJhbWV0ZXJzIiwidXBkYXRlTG9jYXRpb24iLCJmIiwiYiIsIkpTT04iLCJzdHJpbmdpZnkiLCJ1cGRhdGVWaWV3cG9ydEJ5Qm91bmQiLCJ0cmlnZ2VyU3VibWl0IiwiYXV0b2NvbXBsZXRlTWFuYWdlciIsIm1hcE1hbmFnZXIiLCJ0b1N0cmluZyIsInJlcGxhY2UiLCJtdWx0aXNlbGVjdCIsInRlbXBsYXRlcyIsImJ1dHRvbiIsImRyb3BSaWdodCIsInF1ZXJ5TWFuYWdlciIsImluaXRQYXJhbXMiLCJpbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2siLCJyZXN1bHQiLCJsYW5ndWFnZU1hbmFnZXIiLCJsaXN0TWFuYWdlciIsInBhcnNlIiwic2V0VGltZW91dCIsIm9wdCIsImdyb3VwcyIsInRvZ2dsZUNsYXNzIiwiY29weSIsIm9sZFVSTCIsIm9y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LFVBQU4sR0FBbUIsUUFBbkIsR0FBOEJ2RCxLQUFLdUQsVUFBeEQ7QUFDRCxPQUZEO0FBR0E3RSxRQUFFSSxRQUFGLEVBQVkyRCxPQUFaLENBQW9CLHFCQUFwQixFQUEyQyxFQUFFMEksUUFBUUksVUFBVixFQUEzQztBQUNBO0FBQ0E3TSxRQUFFSSxRQUFGLEVBQVkyRCxPQUFaLENBQW9CLGtCQUFwQixFQUF3QyxFQUFFVixNQUFNc0IsT0FBT3FDLFdBQVAsQ0FBbUIzRCxJQUEzQixFQUFpQ29KLFFBQVFJLFVBQXpDLEVBQXhDO0FBQ0E3TSxRQUFFSSxRQUFGLEVBQVkyRCxPQUFaLENBQW9CLHNCQUFwQixFQUE0QzhJLFVBQTVDO0FBQ0E7O0FBRUE7QUFDQXVCLGlCQUFXLFlBQU07QUFDZixZQUFJMUksSUFBSW1JLGFBQWFqQixhQUFiLEVBQVI7QUFDQTVNLFVBQUVJLFFBQUYsRUFBWTJELE9BQVosQ0FBb0Isb0JBQXBCLEVBQTBDMkIsQ0FBMUM7QUFDQTFGLFVBQUVJLFFBQUYsRUFBWTJELE9BQVosQ0FBb0Isb0JBQXBCLEVBQTBDMkIsQ0FBMUM7QUFDQTFGLFVBQUVJLFFBQUYsRUFBWTJELE9BQVosQ0FBb0IsNEJBQXBCLEVBQWtEMkIsQ0FBbEQ7QUFDQTFGLFVBQUVJLFFBQUYsRUFBWTJELE9BQVosQ0FBb0IsOEJBQXBCLEVBQW9EMkIsQ0FBcEQ7QUFDQTtBQUNELE9BUEQsRUFPRyxHQVBIO0FBUUQ7QUFqQ0ksR0FBUDtBQXNDRCxDQXBPRCxFQW9PR25ELE1BcE9IIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuLy9BUEkgOkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVxuY29uc3QgQXV0b2NvbXBsZXRlTWFuYWdlciA9IChmdW5jdGlvbigkKSB7XG4gIC8vSW5pdGlhbGl6YXRpb24uLi5cblxuICByZXR1cm4gKHRhcmdldCkgPT4ge1xuXG4gICAgY29uc3QgQVBJX0tFWSA9IFwiQUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXCI7XG4gICAgY29uc3QgdGFyZ2V0SXRlbSA9IHR5cGVvZiB0YXJnZXQgPT0gXCJzdHJpbmdcIiA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KSA6IHRhcmdldDtcbiAgICBjb25zdCBxdWVyeU1nciA9IFF1ZXJ5TWFuYWdlcigpO1xuICAgIHZhciBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICR0YXJnZXQ6ICQodGFyZ2V0SXRlbSksXG4gICAgICB0YXJnZXQ6IHRhcmdldEl0ZW0sXG4gICAgICBpbml0aWFsaXplOiAoKSA9PiB7XG4gICAgICAgICQodGFyZ2V0SXRlbSkudHlwZWFoZWFkKHtcbiAgICAgICAgICAgICAgICAgICAgaGludDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBtaW5MZW5ndGg6IDQsXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICBtZW51OiAndHQtZHJvcGRvd24tbWVudSdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3NlYXJjaC1yZXN1bHRzJyxcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogKGl0ZW0pID0+IGl0ZW0uZm9ybWF0dGVkX2FkZHJlc3MsXG4gICAgICAgICAgICAgICAgICAgIGxpbWl0OiAxMCxcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiBmdW5jdGlvbiAocSwgc3luYywgYXN5bmMpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IHEgfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBhc3luYyhyZXN1bHRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKS5vbigndHlwZWFoZWFkOnNlbGVjdGVkJywgZnVuY3Rpb24gKG9iaiwgZGF0dW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoZGF0dW0pXG4gICAgICAgICAgICAgICAgICAgIHtcblxuICAgICAgICAgICAgICAgICAgICAgIHZhciBnZW9tZXRyeSA9IGRhdHVtLmdlb21ldHJ5O1xuICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5TWdyLnVwZGF0ZVZpZXdwb3J0KGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICAgICAgICAgICAvLyAgbWFwLmZpdEJvdW5kcyhnZW9tZXRyeS5ib3VuZHM/IGdlb21ldHJ5LmJvdW5kcyA6IGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuXG5cbiAgICByZXR1cm4ge1xuXG4gICAgfVxuICB9XG5cbn0oalF1ZXJ5KSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IExhbmd1YWdlTWFuYWdlciA9ICgoJCkgPT4ge1xuICAvL2tleVZhbHVlXG5cbiAgLy90YXJnZXRzIGFyZSB0aGUgbWFwcGluZ3MgZm9yIHRoZSBsYW5ndWFnZVxuICByZXR1cm4gKCkgPT4ge1xuICAgIGxldCBsYW5ndWFnZTtcbiAgICBsZXQgZGljdGlvbmFyeSA9IHt9O1xuICAgIGxldCAkdGFyZ2V0cyA9ICQoXCJbZGF0YS1sYW5nLXRhcmdldF1bZGF0YS1sYW5nLWtleV1cIik7XG5cbiAgICBjb25zdCB1cGRhdGVQYWdlTGFuZ3VhZ2UgPSAoKSA9PiB7XG5cbiAgICAgIGxldCB0YXJnZXRMYW5ndWFnZSA9IGRpY3Rpb25hcnkucm93cy5maWx0ZXIoKGkpID0+IGkubGFuZyA9PT0gbGFuZ3VhZ2UpWzBdO1xuXG4gICAgICAkdGFyZ2V0cy5lYWNoKChpbmRleCwgaXRlbSkgPT4ge1xuICAgICAgICBsZXQgdGFyZ2V0QXR0cmlidXRlID0gJChpdGVtKS5kYXRhKCdsYW5nLXRhcmdldCcpO1xuICAgICAgICBsZXQgbGFuZ1RhcmdldCA9ICQoaXRlbSkuZGF0YSgnbGFuZy1rZXknKTtcblxuICAgICAgICBzd2l0Y2godGFyZ2V0QXR0cmlidXRlKSB7XG4gICAgICAgICAgY2FzZSAndGV4dCc6XG4gICAgICAgICAgICAkKGl0ZW0pLnRleHQodGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAndmFsdWUnOlxuICAgICAgICAgICAgJChpdGVtKS52YWwodGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICQoaXRlbSkuYXR0cih0YXJnZXRBdHRyaWJ1dGUsIHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgbGFuZ3VhZ2UsXG4gICAgICB0YXJnZXRzOiAkdGFyZ2V0cyxcbiAgICAgIGRpY3Rpb25hcnksXG4gICAgICBpbml0aWFsaXplOiAobGFuZykgPT4ge1xuXG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgLy8gdXJsOiAnaHR0cHM6Ly9nc3gyanNvbi5jb20vYXBpP2lkPTFPM2VCeWpMMXZsWWY3WjdhbS1faHRSVFFpNzNQYWZxSWZOQmRMbVhlOFNNJnNoZWV0PTEnLFxuICAgICAgICAgIHVybDogJy9kYXRhL2xhbmcuanNvbicsXG4gICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgZGljdGlvbmFyeSA9IGRhdGE7XG4gICAgICAgICAgICBsYW5ndWFnZSA9IGxhbmc7XG4gICAgICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UoKTtcblxuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sYW5ndWFnZS1sb2FkZWQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZUxhbmd1YWdlOiAobGFuZykgPT4ge1xuXG4gICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgdXBkYXRlUGFnZUxhbmd1YWdlKCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG59KShqUXVlcnkpO1xuIiwiLyogVGhpcyBsb2FkcyBhbmQgbWFuYWdlcyB0aGUgbGlzdCEgKi9cblxuY29uc3QgTGlzdE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRMaXN0ID0gXCIjZXZlbnRzLWxpc3RcIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0TGlzdCA9PT0gJ3N0cmluZycgPyAkKHRhcmdldExpc3QpIDogdGFyZ2V0TGlzdDtcblxuICAgIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0pID0+IHtcblxuICAgICAgdmFyIGRhdGUgPSBtb21lbnQobmV3IERhdGUoaXRlbS5zdGFydF9kYXRldGltZSkudG9HTVRTdHJpbmcoKSkuZm9ybWF0KFwiZGRkZCBNTU0gREQsIGg6bW1hXCIpO1xuICAgICAgbGV0IHVybCA9IGl0ZW0udXJsLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0udXJsIDogXCIvL1wiICsgaXRlbS51cmw7XG4gICAgICAvLyBsZXQgc3VwZXJHcm91cCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG5cbiAgICAgIHJldHVybiBgXG4gICAgICA8bGkgY2xhc3M9JyR7d2luZG93LnNsdWdpZnkoaXRlbS5ldmVudF90eXBlKX0gZXZlbnRzIGV2ZW50LW9iaicgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudCB0eXBlLWFjdGlvblwiPlxuICAgICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICAgIDxsaSBjbGFzcz0ndGFnLSR7aXRlbS5ldmVudF90eXBlfSB0YWcnPiR7aXRlbS5ldmVudF90eXBlfTwvbGk+XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgICA8aDIgY2xhc3M9XCJldmVudC10aXRsZVwiPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1kYXRlIGRhdGVcIj4ke2RhdGV9PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWFkZHJlc3MgYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+UlNWUDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICAgYFxuICAgIH07XG5cbiAgICBjb25zdCByZW5kZXJHcm91cCA9IChpdGVtKSA9PiB7XG4gICAgICBsZXQgdXJsID0gaXRlbS53ZWJzaXRlLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0ud2Vic2l0ZSA6IFwiLy9cIiArIGl0ZW0ud2Vic2l0ZTtcbiAgICAgIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKHN1cGVyR3JvdXApO1xuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaSBjbGFzcz0nJHtpdGVtLmV2ZW50X3R5cGV9ICR7c3VwZXJHcm91cH0gZ3JvdXAtb2JqJyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwIGdyb3VwLW9ialwiPlxuICAgICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctJHtpdGVtLnN1cGVyZ3JvdXB9XCI+JHtpdGVtLnN1cGVyZ3JvdXB9PC9saT5cbiAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDxoMj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS5uYW1lfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1sb2NhdGlvbiBsb2NhdGlvblwiPiR7aXRlbS5sb2NhdGlvbn08L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXNjcmlwdGlvblwiPlxuICAgICAgICAgICAgICA8cD4ke2l0ZW0uZGVzY3JpcHRpb259PC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICRsaXN0OiAkdGFyZ2V0LFxuICAgICAgdXBkYXRlRmlsdGVyOiAocCkgPT4ge1xuICAgICAgICBpZighcCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIFJlbW92ZSBGaWx0ZXJzXG5cbiAgICAgICAgJHRhcmdldC5yZW1vdmVQcm9wKFwiY2xhc3NcIik7XG4gICAgICAgICR0YXJnZXQuYWRkQ2xhc3MocC5maWx0ZXIgPyBwLmZpbHRlci5qb2luKFwiIFwiKSA6ICcnKVxuXG4gICAgICAgICR0YXJnZXQuZmluZCgnbGkuZXZlbnQtb2JqLCBsaS5ncm91cC1vYmonKS5oaWRlKCk7XG5cbiAgICAgICAgaWYgKHAuZmlsdGVyKSB7XG4gICAgICAgICAgcC5maWx0ZXIuZm9yRWFjaCgoZmlsKT0+e1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKGBsaS4ke2ZpbH1gKS5zaG93KCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHVwZGF0ZUJvdW5kczogKGJvdW5kMSwgYm91bmQyKSA9PiB7XG5cbiAgICAgICAgLy8gY29uc3QgYm91bmRzID0gW3AuYm91bmRzMSwgcC5ib3VuZHMyXTtcblxuXG4gICAgICAgICR0YXJnZXQuZmluZCgndWwgbGkuZXZlbnQtb2JqLCB1bCBsaS5ncm91cC1vYmonKS5lYWNoKChpbmQsIGl0ZW0pPT4ge1xuXG4gICAgICAgICAgbGV0IF9sYXQgPSAkKGl0ZW0pLmRhdGEoJ2xhdCcpLFxuICAgICAgICAgICAgICBfbG5nID0gJChpdGVtKS5kYXRhKCdsbmcnKTtcblxuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwidXBkYXRlQm91bmRzXCIsIGl0ZW0pXG4gICAgICAgICAgaWYgKGJvdW5kMVswXSA8PSBfbGF0ICYmIGJvdW5kMlswXSA+PSBfbGF0ICYmIGJvdW5kMVsxXSA8PSBfbG5nICYmIGJvdW5kMlsxXSA+PSBfbG5nKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIkFkZGluZyBib3VuZHNcIik7XG4gICAgICAgICAgICAkKGl0ZW0pLmFkZENsYXNzKCd3aXRoaW4tYm91bmQnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJChpdGVtKS5yZW1vdmVDbGFzcygnd2l0aGluLWJvdW5kJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBwb3B1bGF0ZUxpc3Q6IChoYXJkRmlsdGVycykgPT4ge1xuICAgICAgICAvL3VzaW5nIHdpbmRvdy5FVkVOVF9EQVRBXG4gICAgICAgIGNvbnN0IGtleVNldCA9ICFoYXJkRmlsdGVycy5rZXkgPyBbXSA6IGhhcmRGaWx0ZXJzLmtleS5zcGxpdCgnLCcpO1xuXG4gICAgICAgIHZhciAkZXZlbnRMaXN0ID0gd2luZG93LkVWRU5UU19EQVRBLmRhdGEubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgIGlmIChrZXlTZXQubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLmV2ZW50X3R5cGUgJiYgaXRlbS5ldmVudF90eXBlLnRvTG93ZXJDYXNlKCkgPT0gJ2dyb3VwJyA/IHJlbmRlckdyb3VwKGl0ZW0pIDogcmVuZGVyRXZlbnQoaXRlbSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXlTZXQubGVuZ3RoID4gMCAmJiBpdGVtLmV2ZW50X3R5cGUgIT0gJ2dyb3VwJyAmJiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5ldmVudF90eXBlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlbmRlckV2ZW50KGl0ZW0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2V5U2V0Lmxlbmd0aCA+IDAgJiYgaXRlbS5ldmVudF90eXBlID09ICdncm91cCcgJiYga2V5U2V0LmluY2x1ZGVzKGl0ZW0uc3VwZXJncm91cCkpIHtcbiAgICAgICAgICAgIHJldHVybiByZW5kZXJHcm91cChpdGVtKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIH0pXG4gICAgICAgICR0YXJnZXQuZmluZCgndWwgbGknKS5yZW1vdmUoKTtcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCcpLmFwcGVuZCgkZXZlbnRMaXN0KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiXG5jb25zdCBNYXBNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIGxldCBMQU5HVUFHRSA9ICdlbic7XG5cbiAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSkgPT4ge1xuICAgIHZhciBkYXRlID0gbW9tZW50KGl0ZW0uc3RhcnRfZGF0ZXRpbWUpLmZvcm1hdChcImRkZGQgTU1NIERELCBoOm1tYVwiKTtcbiAgICBsZXQgdXJsID0gaXRlbS51cmwubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS51cmwgOiBcIi8vXCIgKyBpdGVtLnVybDtcblxuICAgIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9J3BvcHVwLWl0ZW0gJHtpdGVtLmV2ZW50X3R5cGV9ICR7c3VwZXJHcm91cH0nIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5ldmVudF90eXBlfVwiPiR7aXRlbS5ldmVudF90eXBlIHx8ICdBY3Rpb24nfTwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxoMiBjbGFzcz1cImV2ZW50LXRpdGxlXCI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1kYXRlXCI+JHtkYXRlfTwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtYWRkcmVzcyBhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+UlNWUDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSkgPT4ge1xuXG4gICAgbGV0IHVybCA9IGl0ZW0ud2Vic2l0ZS5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLndlYnNpdGUgOiBcIi8vXCIgKyBpdGVtLndlYnNpdGU7XG4gICAgbGV0IHN1cGVyR3JvdXAgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuICAgIHJldHVybiBgXG4gICAgPGxpPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXAgZ3JvdXAtb2JqICR7c3VwZXJHcm91cH1cIj5cbiAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctJHtpdGVtLnN1cGVyZ3JvdXB9ICR7c3VwZXJHcm91cH1cIj4ke2l0ZW0uc3VwZXJncm91cH08L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtaGVhZGVyXCI+XG4gICAgICAgICAgPGgyPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLm5hbWV9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWxvY2F0aW9uIGxvY2F0aW9uXCI+JHtpdGVtLmxvY2F0aW9ufTwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXNjcmlwdGlvblwiPlxuICAgICAgICAgICAgPHA+JHtpdGVtLmRlc2NyaXB0aW9ufTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPkdldCBJbnZvbHZlZDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2xpPlxuICAgIGBcbiAgfTtcblxuICBjb25zdCByZW5kZXJHZW9qc29uID0gKGxpc3QpID0+IHtcbiAgICByZXR1cm4gbGlzdC5tYXAoKGl0ZW0pID0+IHtcbiAgICAgIC8vIHJlbmRlcmVkIGV2ZW50VHlwZVxuICAgICAgbGV0IHJlbmRlcmVkO1xuXG4gICAgICBpZiAoaXRlbS5ldmVudF90eXBlICYmIGl0ZW0uZXZlbnRfdHlwZS50b0xvd2VyQ2FzZSgpID09ICdncm91cCcpIHtcbiAgICAgICAgcmVuZGVyZWQgPSByZW5kZXJHcm91cChpdGVtKTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVuZGVyZWQgPSByZW5kZXJFdmVudChpdGVtKTtcbiAgICAgIH1cblxuICAgICAgLy8gZm9ybWF0IGNoZWNrXG4gICAgICBpZiAoaXNOYU4ocGFyc2VGbG9hdChwYXJzZUZsb2F0KGl0ZW0ubG5nKSkpKSB7XG4gICAgICAgIGl0ZW0ubG5nID0gaXRlbS5sbmcuc3Vic3RyaW5nKDEpXG4gICAgICB9XG4gICAgICBpZiAoaXNOYU4ocGFyc2VGbG9hdChwYXJzZUZsb2F0KGl0ZW0ubGF0KSkpKSB7XG4gICAgICAgIGl0ZW0ubGF0ID0gaXRlbS5sYXQuc3Vic3RyaW5nKDEpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICB0eXBlOiBcIlBvaW50XCIsXG4gICAgICAgICAgY29vcmRpbmF0ZXM6IFtpdGVtLmxuZywgaXRlbS5sYXRdXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBldmVudFByb3BlcnRpZXM6IGl0ZW0sXG4gICAgICAgICAgcG9wdXBDb250ZW50OiByZW5kZXJlZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAob3B0aW9ucykgPT4ge1xuICAgIHZhciBhY2Nlc3NUb2tlbiA9ICdway5leUoxSWpvaWJXRjBkR2hsZHpNMU1DSXNJbUVpT2lKYVRWRk1Va1V3SW4wLndjTTNYYzhCR0M2UE0tT3lyd2puaGcnO1xuICAgIHZhciBtYXAgPSBMLm1hcCgnbWFwJywgeyBkcmFnZ2luZzogIUwuQnJvd3Nlci5tb2JpbGUgfSkuc2V0VmlldyhbMzQuODg1OTMwOTQwNzUzMTcsIDUuMDk3NjU2MjUwMDAwMDAxXSwgMik7XG5cbiAgICBpZiAoIUwuQnJvd3Nlci5tb2JpbGUpIHtcbiAgICAgIG1hcC5zY3JvbGxXaGVlbFpvb20uZGlzYWJsZSgpO1xuICAgIH1cblxuICAgIExBTkdVQUdFID0gb3B0aW9ucy5sYW5nIHx8ICdlbic7XG5cbiAgICBpZiAob3B0aW9ucy5vbk1vdmUpIHtcbiAgICAgIG1hcC5vbignZHJhZ2VuZCcsIChldmVudCkgPT4ge1xuXG5cbiAgICAgICAgbGV0IHN3ID0gW21hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW21hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubG5nXTtcbiAgICAgICAgb3B0aW9ucy5vbk1vdmUoc3csIG5lKTtcbiAgICAgIH0pLm9uKCd6b29tZW5kJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChtYXAuZ2V0Wm9vbSgpIDw9IDQpIHtcbiAgICAgICAgICAkKFwiI21hcFwiKS5hZGRDbGFzcyhcInpvb21lZC1vdXRcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJChcIiNtYXBcIikucmVtb3ZlQ2xhc3MoXCJ6b29tZWQtb3V0XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHN3ID0gW21hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW21hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubG5nXTtcbiAgICAgICAgb3B0aW9ucy5vbk1vdmUoc3csIG5lKTtcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gbWFwLmZpcmVFdmVudCgnem9vbWVuZCcpO1xuXG4gICAgTC50aWxlTGF5ZXIoJ2h0dHBzOi8vYXBpLm1hcGJveC5jb20vc3R5bGVzL3YxL21hdHRoZXczNTAvY2phNDF0aWprMjdkNjJycW9kN2cwbHg0Yi90aWxlcy8yNTYve3p9L3t4fS97eX0/YWNjZXNzX3Rva2VuPScgKyBhY2Nlc3NUb2tlbiwge1xuICAgICAgICBhdHRyaWJ1dGlvbjogJyZjb3B5OyA8YSBocmVmPVwiaHR0cDovL29zbS5vcmcvY29weXJpZ2h0XCI+T3BlblN0cmVldE1hcDwvYT4gY29udHJpYnV0b3JzIOKAoiA8YSBocmVmPVwiLy8zNTAub3JnXCI+MzUwLm9yZzwvYT4nXG4gICAgfSkuYWRkVG8obWFwKTtcblxuICAgIGxldCBnZW9jb2RlciA9IG51bGw7XG4gICAgcmV0dXJuIHtcbiAgICAgICRtYXA6IG1hcCxcbiAgICAgIGluaXRpYWxpemU6IChjYWxsYmFjaykgPT4ge1xuICAgICAgICBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgc2V0Qm91bmRzOiAoYm91bmRzMSwgYm91bmRzMikgPT4ge1xuICAgICAgICBjb25zdCBib3VuZHMgPSBbYm91bmRzMSwgYm91bmRzMl07XG4gICAgICAgIG1hcC5maXRCb3VuZHMoYm91bmRzKTtcbiAgICAgIH0sXG4gICAgICBzZXRDZW50ZXI6IChjZW50ZXIsIHpvb20gPSAxMCkgPT4ge1xuICAgICAgICBpZiAoIWNlbnRlciB8fCAhY2VudGVyWzBdIHx8IGNlbnRlclswXSA9PSBcIlwiXG4gICAgICAgICAgICAgIHx8ICFjZW50ZXJbMV0gfHwgY2VudGVyWzFdID09IFwiXCIpIHJldHVybjtcbiAgICAgICAgbWFwLnNldFZpZXcoY2VudGVyLCB6b29tKTtcbiAgICAgIH0sXG4gICAgICBnZXRCb3VuZHM6ICgpID0+IHtcblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuXG4gICAgICAgIHJldHVybiBbc3csIG5lXTtcbiAgICAgIH0sXG4gICAgICAvLyBDZW50ZXIgbG9jYXRpb24gYnkgZ2VvY29kZWRcbiAgICAgIGdldENlbnRlckJ5TG9jYXRpb246IChsb2NhdGlvbiwgY2FsbGJhY2spID0+IHtcblxuICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogbG9jYXRpb24gfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuXG4gICAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2socmVzdWx0c1swXSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHRyaWdnZXJab29tRW5kOiAoKSA9PiB7XG4gICAgICAgIG1hcC5maXJlRXZlbnQoJ3pvb21lbmQnKTtcbiAgICAgIH0sXG4gICAgICByZWZyZXNoTWFwOiAoKSA9PiB7XG4gICAgICAgIG1hcC5pbnZhbGlkYXRlU2l6ZShmYWxzZSk7XG4gICAgICAgIC8vIG1hcC5fb25SZXNpemUoKTtcbiAgICAgICAgLy8gbWFwLmZpcmVFdmVudCgnem9vbWVuZCcpO1xuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwibWFwIGlzIHJlc2l6ZWRcIilcbiAgICAgIH0sXG4gICAgICBmaWx0ZXJNYXA6IChmaWx0ZXJzKSA9PiB7XG5cbiAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwXCIpLmhpZGUoKTtcblxuICAgICAgICAvLyBjb25zb2xlLmxvZyhmaWx0ZXJzKTtcbiAgICAgICAgaWYgKCFmaWx0ZXJzKSByZXR1cm47XG5cbiAgICAgICAgZmlsdGVycy5mb3JFYWNoKChpdGVtKSA9PiB7XG5cbiAgICAgICAgICAkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXAuXCIgKyBpdGVtLnRvTG93ZXJDYXNlKCkpLnNob3coKTtcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICBwbG90UG9pbnRzOiAobGlzdCwgaGFyZEZpbHRlcnMpID0+IHtcblxuICAgICAgICBjb25zdCBrZXlTZXQgPSAhaGFyZEZpbHRlcnMua2V5ID8gW10gOiBoYXJkRmlsdGVycy5rZXkuc3BsaXQoJywnKTtcblxuICAgICAgICBpZiAoa2V5U2V0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsaXN0ID0gbGlzdC5maWx0ZXIoKGl0ZW0pID0+IGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKVxuICAgICAgICB9XG5cblxuICAgICAgICBjb25zdCBnZW9qc29uID0ge1xuICAgICAgICAgIHR5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgICAgICAgICBmZWF0dXJlczogcmVuZGVyR2VvanNvbihsaXN0KVxuICAgICAgICB9O1xuXG5cblxuICAgICAgICBMLmdlb0pTT04oZ2VvanNvbiwge1xuICAgICAgICAgICAgcG9pbnRUb0xheWVyOiAoZmVhdHVyZSwgbGF0bG5nKSA9PiB7XG4gICAgICAgICAgICAgIC8vIEljb25zIGZvciBtYXJrZXJzXG4gICAgICAgICAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuZXZlbnRfdHlwZTtcbiAgICAgICAgICAgICAgY29uc3Qgc2x1Z2dlZCA9IHdpbmRvdy5zbHVnaWZ5KGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuc3VwZXJncm91cCk7XG5cbiAgICAgICAgICAgICAgdmFyIGdyb3VwSWNvbiA9IEwuaWNvbih7XG4gICAgICAgICAgICAgICAgaWNvblVybDogZXZlbnRUeXBlICYmIGV2ZW50VHlwZS50b0xvd2VyQ2FzZSgpID09PSAnZ3JvdXAnID8gJy9pbWcvZ3JvdXAuc3ZnJyA6ICcvaW1nL2V2ZW50LnN2ZycsXG4gICAgICAgICAgICAgICAgaWNvblNpemU6IFsyMiwgMjJdLFxuICAgICAgICAgICAgICAgIGljb25BbmNob3I6IFsxMiwgOF0sXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBzbHVnZ2VkICsgJyBldmVudC1pdGVtLXBvcHVwJ1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgdmFyIGV2ZW50SWNvbiA9IEwuaWNvbih7XG4gICAgICAgICAgICAgICAgaWNvblVybDogZXZlbnRUeXBlICYmIGV2ZW50VHlwZS50b0xvd2VyQ2FzZSgpID09PSAnZ3JvdXAnID8gJy9pbWcvZ3JvdXAuc3ZnJyA6ICcvaW1nL2V2ZW50LnN2ZycsXG4gICAgICAgICAgICAgICAgaWNvblNpemU6IFsxOCwgMThdLFxuICAgICAgICAgICAgICAgIGljb25BbmNob3I6IFs5LCA5XSxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdldmVudHMgZXZlbnQtaXRlbS1wb3B1cCdcbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgdmFyIGdlb2pzb25NYXJrZXJPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIGljb246IGV2ZW50VHlwZSAmJiBldmVudFR5cGUudG9Mb3dlckNhc2UoKSA9PT0gJ2dyb3VwJyA/IGdyb3VwSWNvbiA6IGV2ZW50SWNvbixcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgcmV0dXJuIEwubWFya2VyKGxhdGxuZywgZ2VvanNvbk1hcmtlck9wdGlvbnMpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgIG9uRWFjaEZlYXR1cmU6IChmZWF0dXJlLCBsYXllcikgPT4ge1xuICAgICAgICAgICAgaWYgKGZlYXR1cmUucHJvcGVydGllcyAmJiBmZWF0dXJlLnByb3BlcnRpZXMucG9wdXBDb250ZW50KSB7XG4gICAgICAgICAgICAgIGxheWVyLmJpbmRQb3B1cChmZWF0dXJlLnByb3BlcnRpZXMucG9wdXBDb250ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pLmFkZFRvKG1hcCk7XG5cbiAgICAgIH0sXG4gICAgICB1cGRhdGU6IChwKSA9PiB7XG4gICAgICAgIGlmICghcCB8fCAhcC5sYXQgfHwgIXAubG5nICkgcmV0dXJuO1xuXG4gICAgICAgIG1hcC5zZXRWaWV3KEwubGF0TG5nKHAubGF0LCBwLmxuZyksIDEwKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiY29uc3QgUXVlcnlNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIHJldHVybiAodGFyZ2V0Rm9ybSA9IFwiZm9ybSNmaWx0ZXJzLWZvcm1cIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0Rm9ybSA9PT0gJ3N0cmluZycgPyAkKHRhcmdldEZvcm0pIDogdGFyZ2V0Rm9ybTtcbiAgICBsZXQgbGF0ID0gbnVsbDtcbiAgICBsZXQgbG5nID0gbnVsbDtcblxuICAgIGxldCBwcmV2aW91cyA9IHt9O1xuXG4gICAgJHRhcmdldC5vbignc3VibWl0JywgKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGxhdCA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwoKTtcbiAgICAgIGxuZyA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwoKTtcblxuICAgICAgdmFyIGZvcm0gPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG5cbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJC5wYXJhbShmb3JtKTtcbiAgICB9KVxuXG4gICAgJChkb2N1bWVudCkub24oJ2NoYW5nZScsICdzZWxlY3QjZmlsdGVyLWl0ZW1zJywgKCkgPT4ge1xuICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICB9KVxuXG5cbiAgICByZXR1cm4ge1xuICAgICAgaW5pdGlhbGl6ZTogKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdmFyIHBhcmFtcyA9ICQuZGVwYXJhbSh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkpXG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYW5nXVwiKS52YWwocGFyYW1zLmxhbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwocGFyYW1zLmxhdCk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChwYXJhbXMubG5nKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKHBhcmFtcy5ib3VuZDEpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwocGFyYW1zLmJvdW5kMik7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sb2NdXCIpLnZhbChwYXJhbXMubG9jKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWtleV1cIikudmFsKHBhcmFtcy5rZXkpO1xuXG4gICAgICAgICAgaWYgKHBhcmFtcy5maWx0ZXIpIHtcbiAgICAgICAgICAgICR0YXJnZXQuZmluZChcIiNmaWx0ZXItaXRlbXMgb3B0aW9uXCIpLnJlbW92ZVByb3AoXCJzZWxlY3RlZFwiKTtcbiAgICAgICAgICAgIHBhcmFtcy5maWx0ZXIuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiI2ZpbHRlci1pdGVtcyBvcHRpb25bdmFsdWU9J1wiICsgaXRlbSArIFwiJ11cIikucHJvcChcInNlbGVjdGVkXCIsIHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBnZXRQYXJhbWV0ZXJzOiAoKSA9PiB7XG4gICAgICAgIHZhciBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuICAgICAgICAvLyBwYXJhbWV0ZXJzWydsb2NhdGlvbiddIDtcblxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBwYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgaWYgKCAhcGFyYW1ldGVyc1trZXldIHx8IHBhcmFtZXRlcnNba2V5XSA9PSBcIlwiKSB7XG4gICAgICAgICAgICBkZWxldGUgcGFyYW1ldGVyc1trZXldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJhbWV0ZXJzO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZUxvY2F0aW9uOiAobGF0LCBsbmcpID0+IHtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChsYXQpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKGxuZyk7XG4gICAgICAgIC8vICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlVmlld3BvcnQ6ICh2aWV3cG9ydCkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtbdmlld3BvcnQuZi5iLCB2aWV3cG9ydC5iLmJdLCBbdmlld3BvcnQuZi5mLCB2aWV3cG9ydC5iLmZdXTtcblxuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1swXSkpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1sxXSkpO1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZVZpZXdwb3J0QnlCb3VuZDogKHN3LCBuZSkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtzdywgbmVdOy8vLy8vLy8vXG5cblxuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1swXSkpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1sxXSkpO1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHRyaWdnZXJTdWJtaXQ6ICgpID0+IHtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJsZXQgYXV0b2NvbXBsZXRlTWFuYWdlcjtcbmxldCBtYXBNYW5hZ2VyO1xuXG53aW5kb3cuc2x1Z2lmeSA9ICh0ZXh0KSA9PiB0ZXh0LnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHMrL2csICctJykgICAgICAgICAgIC8vIFJlcGxhY2Ugc3BhY2VzIHdpdGggLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9bXlxcd1xcLV0rL2csICcnKSAgICAgICAvLyBSZW1vdmUgYWxsIG5vbi13b3JkIGNoYXJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcLVxcLSsvZywgJy0nKSAgICAgICAgIC8vIFJlcGxhY2UgbXVsdGlwbGUgLSB3aXRoIHNpbmdsZSAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL14tKy8sICcnKSAgICAgICAgICAgICAvLyBUcmltIC0gZnJvbSBzdGFydCBvZiB0ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLy0rJC8sICcnKTsgICAgICAgICAgICAvLyBUcmltIC0gZnJvbSBlbmQgb2YgdGV4dFxuXG4oZnVuY3Rpb24oJCkge1xuICAvLyBMb2FkIHRoaW5nc1xuICAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykubXVsdGlzZWxlY3Qoe1xuICAgIHRlbXBsYXRlczoge1xuICAgICAgYnV0dG9uOiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJtdWx0aXNlbGVjdCBkcm9wZG93bi10b2dnbGVcIiBkYXRhLXRvZ2dsZT1cImRyb3Bkb3duXCI+PHNwYW4+U2hvdyBGaWx0ZXJzPC9zcGFuPiA8aW1nIHNyYz1cIi9pbWcvZmlsdGVyLnBuZ1wiIC8+PC9idXR0b24+JyxcbiAgICB9LFxuICAgIGRyb3BSaWdodDogdHJ1ZVxuICB9KTtcbiAgLy8gMS4gZ29vZ2xlIG1hcHMgZ2VvY29kZVxuXG4gIC8vIDIuIGZvY3VzIG1hcCBvbiBnZW9jb2RlICh2aWEgbGF0L2xuZylcbiAgY29uc3QgcXVlcnlNYW5hZ2VyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgICAgIHF1ZXJ5TWFuYWdlci5pbml0aWFsaXplKCk7XG5cbiAgY29uc3QgaW5pdFBhcmFtcyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gIG1hcE1hbmFnZXIgPSBNYXBNYW5hZ2VyKHtcbiAgICBvbk1vdmU6IChzdywgbmUpID0+IHtcbiAgICAgIC8vIFdoZW4gdGhlIG1hcCBtb3ZlcyBhcm91bmQsIHdlIHVwZGF0ZSB0aGUgbGlzdFxuICAgICAgcXVlcnlNYW5hZ2VyLnVwZGF0ZVZpZXdwb3J0QnlCb3VuZChzdywgbmUpO1xuICAgICAgLy91cGRhdGUgUXVlcnlcbiAgICB9XG4gIH0pO1xuXG4gIHdpbmRvdy5pbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2sgPSAoKSA9PiB7XG5cbiAgICBhdXRvY29tcGxldGVNYW5hZ2VyID0gQXV0b2NvbXBsZXRlTWFuYWdlcihcImlucHV0W25hbWU9J2xvYyddXCIpO1xuICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuXG4gICAgaWYgKGluaXRQYXJhbXMubG9jICYmIGluaXRQYXJhbXMubG9jICE9PSAnJyAmJiAoIWluaXRQYXJhbXMuYm91bmQxICYmICFpbml0UGFyYW1zLmJvdW5kMikpIHtcbiAgICAgIG1hcE1hbmFnZXIuaW5pdGlhbGl6ZSgoKSA9PiB7XG4gICAgICAgIG1hcE1hbmFnZXIuZ2V0Q2VudGVyQnlMb2NhdGlvbihpbml0UGFyYW1zLmxvYywgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIHF1ZXJ5TWFuYWdlci51cGRhdGVWaWV3cG9ydChyZXN1bHQuZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cblxuICBjb25zdCBsYW5ndWFnZU1hbmFnZXIgPSBMYW5ndWFnZU1hbmFnZXIoKTtcblxuICBsYW5ndWFnZU1hbmFnZXIuaW5pdGlhbGl6ZShpbml0UGFyYW1zWydsYW5nJ10gfHwgJ2VuJyk7XG5cbiAgY29uc3QgbGlzdE1hbmFnZXIgPSBMaXN0TWFuYWdlcigpO1xuXG4gIGlmKGluaXRQYXJhbXMubGF0ICYmIGluaXRQYXJhbXMubG5nKSB7XG4gICAgbWFwTWFuYWdlci5zZXRDZW50ZXIoW2luaXRQYXJhbXMubGF0LCBpbml0UGFyYW1zLmxuZ10pO1xuICB9XG5cbiAgLyoqKlxuICAqIExpc3QgRXZlbnRzXG4gICogVGhpcyB3aWxsIHRyaWdnZXIgdGhlIGxpc3QgdXBkYXRlIG1ldGhvZFxuICAqL1xuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnBvcHVsYXRlTGlzdChvcHRpb25zLnBhcmFtcyk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnVwZGF0ZUZpbHRlcihvcHRpb25zKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICBsZXQgYm91bmQxLCBib3VuZDI7XG5cbiAgICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMuYm91bmQxIHx8ICFvcHRpb25zLmJvdW5kMikge1xuICAgICAgW2JvdW5kMSwgYm91bmQyXSA9IG1hcE1hbmFnZXIuZ2V0Qm91bmRzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJvdW5kMSA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDEpO1xuICAgICAgYm91bmQyID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMik7XG4gICAgfVxuXG5cblxuICAgIGxpc3RNYW5hZ2VyLnVwZGF0ZUJvdW5kcyhib3VuZDEsIGJvdW5kMilcbiAgfSlcblxuICAvKioqXG4gICogTWFwIEV2ZW50c1xuICAqL1xuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgLy8gbWFwTWFuYWdlci5zZXRDZW50ZXIoW29wdGlvbnMubGF0LCBvcHRpb25zLmxuZ10pO1xuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGJvdW5kMSA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDEpO1xuICAgIHZhciBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcbiAgICBtYXBNYW5hZ2VyLnNldEJvdW5kcyhib3VuZDEsIGJvdW5kMik7XG4gICAgLy8gbWFwTWFuYWdlci50cmlnZ2VyWm9vbUVuZCgpO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBtYXBNYW5hZ2VyLnRyaWdnZXJab29tRW5kKCk7XG4gICAgfSwgMTApO1xuICAgIC8vIGNvbnNvbGUubG9nKG9wdGlvbnMpXG4gIH0pO1xuICAvLyAzLiBtYXJrZXJzIG9uIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtcGxvdCcsIChlLCBvcHQpID0+IHtcblxuICAgIG1hcE1hbmFnZXIucGxvdFBvaW50cyhvcHQuZGF0YSwgb3B0LnBhcmFtcyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJyk7XG4gIH0pXG5cbiAgLy8gbG9hZCBncm91cHNcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sb2FkLWdyb3VwcycsIChlLCBvcHQpID0+IHtcblxuICAgIG9wdC5ncm91cHMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgbGV0IHNsdWdnZWQgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuICAgICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLmFwcGVuZChgPG9wdGlvbiB2YWx1ZT0nJHtzbHVnZ2VkfScgc2VsZWN0ZWQ9J3NlbGVjdGVkJz4ke2l0ZW0uc3VwZXJncm91cH08L29wdGlvbj5gKVxuICAgIH0pO1xuXG4gICAgLy8gUmUtaW5pdGlhbGl6ZVxuICAgIHF1ZXJ5TWFuYWdlci5pbml0aWFsaXplKCk7XG4gICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KCdyZWJ1aWxkJyk7XG4gICAgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCk7XG4gIH0pXG5cbiAgLy8gRmlsdGVyIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtZmlsdGVyJywgKGUsIG9wdCkgPT4ge1xuICAgIGlmIChvcHQpIHtcbiAgICAgIG1hcE1hbmFnZXIuZmlsdGVyTWFwKG9wdC5maWx0ZXIpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgKGUsIG9wdCkgPT4ge1xuICAgIGlmIChvcHQpIHtcbiAgICAgIGxhbmd1YWdlTWFuYWdlci51cGRhdGVMYW5ndWFnZShvcHQubGFuZyk7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sYW5ndWFnZS1sb2FkZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KCdyZWJ1aWxkJyk7XG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbiNzaG93LWhpZGUtbWFwJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ2JvZHknKS50b2dnbGVDbGFzcygnbWFwLXZpZXcnKVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uLmJ0bi5tb3JlLWl0ZW1zJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJyNlbWJlZC1hcmVhJykudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgLy91cGRhdGUgZW1iZWQgbGluZVxuICAgIHZhciBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHQpKTtcbiAgICBkZWxldGUgY29weVsnbG5nJ107XG4gICAgZGVsZXRlIGNvcHlbJ2xhdCddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDEnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQyJ107XG5cbiAgICAkKCcjZW1iZWQtYXJlYSBpbnB1dFtuYW1lPWVtYmVkXScpLnZhbCgnaHR0cHM6Ly9uZXctbWFwLjM1MC5vcmcjJyArICQucGFyYW0oY29weSkpO1xuICB9KTtcblxuICAkKHdpbmRvdykub24oXCJyZXNpemVcIiwgKGUpID0+IHtcbiAgICBtYXBNYW5hZ2VyLnJlZnJlc2hNYXAoKTtcbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKFwiaGFzaGNoYW5nZVwiLCAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgaWYgKGhhc2gubGVuZ3RoID09IDApIHJldHVybjtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKGhhc2guc3Vic3RyaW5nKDEpKTtcbiAgICBjb25zdCBvbGRVUkwgPSBldmVudC5vcmlnaW5hbEV2ZW50Lm9sZFVSTDtcblxuXG4gICAgY29uc3Qgb2xkSGFzaCA9ICQuZGVwYXJhbShvbGRVUkwuc3Vic3RyaW5nKG9sZFVSTC5zZWFyY2goXCIjXCIpKzEpKTtcblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcblxuICAgIC8vIFNvIHRoYXQgY2hhbmdlIGluIGZpbHRlcnMgd2lsbCBub3QgdXBkYXRlIHRoaXNcbiAgICBpZiAob2xkSGFzaC5ib3VuZDEgIT09IHBhcmFtZXRlcnMuYm91bmQxIHx8IG9sZEhhc2guYm91bmQyICE9PSBwYXJhbWV0ZXJzLmJvdW5kMikge1xuXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG5cbiAgICAvLyBDaGFuZ2UgaXRlbXNcbiAgICBpZiAob2xkSGFzaC5sYW5nICE9PSBwYXJhbWV0ZXJzLmxhbmcpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgfVxuICB9KVxuXG4gIC8vIDQuIGZpbHRlciBvdXQgaXRlbXMgaW4gYWN0aXZpdHktYXJlYVxuXG4gIC8vIDUuIGdldCBtYXAgZWxlbWVudHNcblxuICAvLyA2LiBnZXQgR3JvdXAgZGF0YVxuXG4gIC8vIDcuIHByZXNlbnQgZ3JvdXAgZWxlbWVudHNcblxuICAkLmFqYXgoe1xuICAgIHVybDogJ2h0dHBzOi8vbmV3LW1hcC4zNTAub3JnL291dHB1dC8zNTBvcmctbmV3LWxheW91dC5qcy5neicsIC8vJ3wqKkRBVEFfU09VUkNFKip8JyxcbiAgICBkYXRhVHlwZTogJ3NjcmlwdCcsXG4gICAgY2FjaGU6IHRydWUsXG4gICAgc3VjY2VzczogKGRhdGEpID0+IHtcbiAgICAgIC8vIHdpbmRvdy5FVkVOVFNfREFUQSA9IGRhdGE7XG5cbiAgICAgIGNvbnNvbGUubG9nKHdpbmRvdy5FVkVOVFNfREFUQSk7XG5cbiAgICAgIC8vTG9hZCBncm91cHNcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbG9hZC1ncm91cHMnLCB7IGdyb3Vwczogd2luZG93LkVWRU5UU19EQVRBLmdyb3VwcyB9KTtcblxuXG4gICAgICB2YXIgcGFyYW1ldGVycyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG5cbiAgICAgIHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgaXRlbVsnZXZlbnRfdHlwZSddID0gIWl0ZW0uZXZlbnRfdHlwZSA/ICdBY3Rpb24nIDogaXRlbS5ldmVudF90eXBlO1xuICAgICAgfSlcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC11cGRhdGUnLCB7IHBhcmFtczogcGFyYW1ldGVycyB9KTtcbiAgICAgIC8vICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1wbG90JywgeyBkYXRhOiB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YSwgcGFyYW1zOiBwYXJhbWV0ZXJzIH0pO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcbiAgICAgIC8vVE9ETzogTWFrZSB0aGUgZ2VvanNvbiBjb252ZXJzaW9uIGhhcHBlbiBvbiB0aGUgYmFja2VuZFxuXG4gICAgICAvL1JlZnJlc2ggdGhpbmdzXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgbGV0IHAgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwKTtcbiAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJywgcCk7XG4gICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcCk7XG4gICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCBwKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpKVxuICAgICAgfSwgMTAwKTtcbiAgICB9XG4gIH0pO1xuXG5cblxufSkoalF1ZXJ5KTtcbiJdfQ==
