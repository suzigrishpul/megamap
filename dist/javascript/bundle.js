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

            $("#language-opts").multiselect('select', lang);
          }
        });
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
  return function () {
    var targetList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "#events-list";

    var $target = typeof targetList === 'string' ? $(targetList) : targetList;

    var renderEvent = function renderEvent(item) {

      var date = moment(item.start_datetime).format("dddd MMM DD, h:mma");
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

          // console.log("updateBounds", item)
          if (bound1[0] <= _lat && bound2[0] >= _lat && bound1[1] <= _lng && bound2[1] >= _lng) {
            // console.log("Adding bounds");
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
        // console.log("XXX");
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
              iconUrl: eventType && eventType.toLowerCase() === 'group' ? '/img/group.png' : '/img/event.png',
              iconSize: [22, 22],
              iconAnchor: [12, 8],
              className: slugged + ' event-item-popup'
            });
            var eventIcon = L.icon({
              iconUrl: eventType && eventType.toLowerCase() === 'group' ? '/img/group.png' : '/img/event.png',
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
      button: '<button type="button" class="multiselect dropdown-toggle" data-toggle="dropdown"><span>More Search Options</span> <span class="fa fa-caret-down"></span></button>'
    },
    dropRight: true
  });

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
      // console.log(option.val())
      var parameters = queryManager.getParameters();
      parameters['lang'] = option.val();
      $(document).trigger('trigger-update-embed', parameters);
    }
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
    // console.log("It is called");
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
    // console.log("Filter", options);
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
    // console.log("map.98", options);
    mapManager.setBounds(bound1, bound2);
    // mapManager.triggerZoomEnd();

    setTimeout(function () {
      mapManager.triggerZoomEnd();
    }, 10);
    // console.log(options)
  });

  $(document).on('click', "#copy-embed", function (e) {
    var copyText = document.getElementById("embed-text");
    copyText.select();
    document.execCommand("Copy");
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
      var valueText = languageManager.getTranslation(item.translation);
      $('select#filter-items').append('<option value=\'' + slugged + '\' selected=\'selected\' data-lang-target=\'text\' data-lang-key=\'' + item.translation + '\' >' + valueText + '</option>');
    });

    // Re-initialize
    queryManager.initialize();
    $(document).trigger('trigger-language-update');

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

    // console.log("177", parameters, oldHash);
    $(document).trigger('trigger-list-filter-update', parameters);
    $(document).trigger('trigger-map-filter', parameters);
    $(document).trigger('trigger-update-embed', parameters);

    // So that change in filters will not update this
    if (oldHash.bound1 !== parameters.bound1 || oldHash.bound2 !== parameters.bound2) {
      // console.log("185", parameters);
      $(document).trigger('trigger-list-filter-by-bound', parameters);
    }

    if (oldHash.log !== parameters.loc) {
      $(document).trigger('trigger-map-update', parameters);
      // console.log("Calling it")
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

      // console.log(window.EVENTS_DATA);

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
        // console.log("231", p);
        $(document).trigger('trigger-map-update', p);
        $(document).trigger('trigger-map-filter', p);
        // console.log("232", p);
        $(document).trigger('trigger-list-filter-update', p);
        $(document).trigger('trigger-list-filter-by-bound', p);
        //console.log(queryManager.getParameters())
      }, 100);
    }
  });
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9sYW5ndWFnZS5qcyIsImNsYXNzZXMvbGlzdC5qcyIsImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9xdWVyeS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJBdXRvY29tcGxldGVNYW5hZ2VyIiwiJCIsInRhcmdldCIsIkFQSV9LRVkiLCJ0YXJnZXRJdGVtIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwicXVlcnlNZ3IiLCJRdWVyeU1hbmFnZXIiLCJnZW9jb2RlciIsImdvb2dsZSIsIm1hcHMiLCJHZW9jb2RlciIsIiR0YXJnZXQiLCJmb3JjZVNlYXJjaCIsInEiLCJnZW9jb2RlIiwiYWRkcmVzcyIsInJlc3VsdHMiLCJzdGF0dXMiLCJnZW9tZXRyeSIsInVwZGF0ZVZpZXdwb3J0Iiwidmlld3BvcnQiLCJ2YWwiLCJmb3JtYXR0ZWRfYWRkcmVzcyIsImluaXRpYWxpemUiLCJ0eXBlYWhlYWQiLCJoaW50IiwiaGlnaGxpZ2h0IiwibWluTGVuZ3RoIiwiY2xhc3NOYW1lcyIsIm1lbnUiLCJuYW1lIiwiZGlzcGxheSIsIml0ZW0iLCJsaW1pdCIsInNvdXJjZSIsInN5bmMiLCJhc3luYyIsIm9uIiwib2JqIiwiZGF0dW0iLCJqUXVlcnkiLCJMYW5ndWFnZU1hbmFnZXIiLCJsYW5ndWFnZSIsImRpY3Rpb25hcnkiLCIkdGFyZ2V0cyIsInVwZGF0ZVBhZ2VMYW5ndWFnZSIsInRhcmdldExhbmd1YWdlIiwicm93cyIsImZpbHRlciIsImkiLCJsYW5nIiwiZWFjaCIsImluZGV4IiwidGFyZ2V0QXR0cmlidXRlIiwiZGF0YSIsImxhbmdUYXJnZXQiLCJ0ZXh0IiwiYXR0ciIsInRhcmdldHMiLCJhamF4IiwidXJsIiwiZGF0YVR5cGUiLCJzdWNjZXNzIiwidHJpZ2dlciIsIm11bHRpc2VsZWN0IiwidXBkYXRlTGFuZ3VhZ2UiLCJnZXRUcmFuc2xhdGlvbiIsImtleSIsIkxpc3RNYW5hZ2VyIiwidGFyZ2V0TGlzdCIsInJlbmRlckV2ZW50IiwiZGF0ZSIsIm1vbWVudCIsInN0YXJ0X2RhdGV0aW1lIiwiZm9ybWF0IiwibWF0Y2giLCJ3aW5kb3ciLCJzbHVnaWZ5IiwiZXZlbnRfdHlwZSIsImxhdCIsImxuZyIsInRpdGxlIiwidmVudWUiLCJyZW5kZXJHcm91cCIsIndlYnNpdGUiLCJzdXBlckdyb3VwIiwic3VwZXJncm91cCIsImxvY2F0aW9uIiwiZGVzY3JpcHRpb24iLCIkbGlzdCIsInVwZGF0ZUZpbHRlciIsInAiLCJyZW1vdmVQcm9wIiwiYWRkQ2xhc3MiLCJqb2luIiwiZmluZCIsImhpZGUiLCJmb3JFYWNoIiwiZmlsIiwic2hvdyIsInVwZGF0ZUJvdW5kcyIsImJvdW5kMSIsImJvdW5kMiIsImluZCIsIl9sYXQiLCJfbG5nIiwicmVtb3ZlQ2xhc3MiLCJfdmlzaWJsZSIsImxlbmd0aCIsInBvcHVsYXRlTGlzdCIsImhhcmRGaWx0ZXJzIiwia2V5U2V0Iiwic3BsaXQiLCIkZXZlbnRMaXN0IiwiRVZFTlRTX0RBVEEiLCJtYXAiLCJ0b0xvd2VyQ2FzZSIsImluY2x1ZGVzIiwicmVtb3ZlIiwiYXBwZW5kIiwiTWFwTWFuYWdlciIsIkxBTkdVQUdFIiwicmVuZGVyR2VvanNvbiIsImxpc3QiLCJyZW5kZXJlZCIsImlzTmFOIiwicGFyc2VGbG9hdCIsInN1YnN0cmluZyIsInR5cGUiLCJjb29yZGluYXRlcyIsInByb3BlcnRpZXMiLCJldmVudFByb3BlcnRpZXMiLCJwb3B1cENvbnRlbnQiLCJvcHRpb25zIiwiYWNjZXNzVG9rZW4iLCJMIiwiZHJhZ2dpbmciLCJCcm93c2VyIiwibW9iaWxlIiwic2V0VmlldyIsInNjcm9sbFdoZWVsWm9vbSIsImRpc2FibGUiLCJvbk1vdmUiLCJldmVudCIsInN3IiwiZ2V0Qm91bmRzIiwiX3NvdXRoV2VzdCIsIm5lIiwiX25vcnRoRWFzdCIsImdldFpvb20iLCJ0aWxlTGF5ZXIiLCJhdHRyaWJ1dGlvbiIsImFkZFRvIiwiJG1hcCIsImNhbGxiYWNrIiwic2V0Qm91bmRzIiwiYm91bmRzMSIsImJvdW5kczIiLCJib3VuZHMiLCJmaXRCb3VuZHMiLCJzZXRDZW50ZXIiLCJjZW50ZXIiLCJ6b29tIiwiZ2V0Q2VudGVyQnlMb2NhdGlvbiIsInRyaWdnZXJab29tRW5kIiwiZmlyZUV2ZW50Iiwiem9vbU91dE9uY2UiLCJ6b29tT3V0Iiwiem9vbVVudGlsSGl0IiwiJHRoaXMiLCJpbnRlcnZhbEhhbmRsZXIiLCJzZXRJbnRlcnZhbCIsImNsZWFySW50ZXJ2YWwiLCJyZWZyZXNoTWFwIiwiaW52YWxpZGF0ZVNpemUiLCJmaWx0ZXJNYXAiLCJmaWx0ZXJzIiwicGxvdFBvaW50cyIsImdlb2pzb24iLCJmZWF0dXJlcyIsImdlb0pTT04iLCJwb2ludFRvTGF5ZXIiLCJmZWF0dXJlIiwibGF0bG5nIiwiZXZlbnRUeXBlIiwic2x1Z2dlZCIsImdyb3VwSWNvbiIsImljb24iLCJpY29uVXJsIiwiaWNvblNpemUiLCJpY29uQW5jaG9yIiwiY2xhc3NOYW1lIiwiZXZlbnRJY29uIiwiZ2VvanNvbk1hcmtlck9wdGlvbnMiLCJtYXJrZXIiLCJvbkVhY2hGZWF0dXJlIiwibGF5ZXIiLCJiaW5kUG9wdXAiLCJ1cGRhdGUiLCJsYXRMbmciLCJ0YXJnZXRGb3JtIiwicHJldmlvdXMiLCJlIiwicHJldmVudERlZmF1bHQiLCJmb3JtIiwiZGVwYXJhbSIsInNlcmlhbGl6ZSIsImhhc2giLCJwYXJhbSIsInBhcmFtcyIsImxvYyIsInByb3AiLCJnZXRQYXJhbWV0ZXJzIiwicGFyYW1ldGVycyIsInVwZGF0ZUxvY2F0aW9uIiwiZiIsImIiLCJKU09OIiwic3RyaW5naWZ5IiwidXBkYXRlVmlld3BvcnRCeUJvdW5kIiwidHJpZ2dlclN1Ym1pdCIsImF1dG9jb21wbGV0ZU1hbmFnZXIiLCJtYXBNYW5hZ2VyIiwidG9TdHJpbmciLCJyZXBsYWNlIiwidGVtcGxhdGVzIiwiYnV0dG9uIiwiZHJvcFJpZ2h0IiwiZW5hYmxlSFRNTCIsIm9wdGlvbkNsYXNzIiwic2VsZWN0ZWRDbGFzcyIsImJ1dHRvbkNsYXNzIiwib3B0aW9uTGFiZWwiLCJ1bmVzY2FwZSIsImh0bWwiLCJvbkNoYW5nZSIsIm9wdGlvbiIsImNoZWNrZWQiLCJzZWxlY3QiLCJxdWVyeU1hbmFnZXIiLCJpbml0UGFyYW1zIiwiaW5pdGlhbGl6ZUF1dG9jb21wbGV0ZUNhbGxiYWNrIiwicmVzdWx0IiwibGFuZ3VhZ2VNYW5hZ2VyIiwibGlzdE1hbmFnZXIiLCJwYXJzZSIsInNldFRpbWVvdXQiLCJjb3B5VGV4dCIsImdldEVsZW1lbnRCeUlkIiwiZXhlY0NvbW1hbmQiLCJvcHQiLCJncm91cHMiLCJ2YWx1ZVRleHQiLCJ0cmFuc2xhdGlvbiIsInRvZ2dsZUNsYXNzIiwiY29weSIsImtleUNvZGUiLCJfcXVlcnkiLCJvbGRVUkwiLCJvcmlnaW5hbEV2ZW50Iiwib2xkSGFzaCIsInNlYXJjaCIsImxvZyIsImNhY2hlIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOztBQUNBLElBQU1BLHNCQUF1QixVQUFTQyxDQUFULEVBQVk7QUFDdkM7O0FBRUEsU0FBTyxVQUFDQyxNQUFELEVBQVk7O0FBRWpCLFFBQU1DLFVBQVUseUNBQWhCO0FBQ0EsUUFBTUMsYUFBYSxPQUFPRixNQUFQLElBQWlCLFFBQWpCLEdBQTRCRyxTQUFTQyxhQUFULENBQXVCSixNQUF2QixDQUE1QixHQUE2REEsTUFBaEY7QUFDQSxRQUFNSyxXQUFXQyxjQUFqQjtBQUNBLFFBQUlDLFdBQVcsSUFBSUMsT0FBT0MsSUFBUCxDQUFZQyxRQUFoQixFQUFmOztBQUVBLFdBQU87QUFDTEMsZUFBU1osRUFBRUcsVUFBRixDQURKO0FBRUxGLGNBQVFFLFVBRkg7QUFHTFUsbUJBQWEscUJBQUNDLENBQUQsRUFBTztBQUNsQk4saUJBQVNPLE9BQVQsQ0FBaUIsRUFBRUMsU0FBU0YsQ0FBWCxFQUFqQixFQUFpQyxVQUFVRyxPQUFWLEVBQW1CQyxNQUFuQixFQUEyQjtBQUMxRCxjQUFJRCxRQUFRLENBQVIsQ0FBSixFQUFnQjtBQUNkLGdCQUFJRSxXQUFXRixRQUFRLENBQVIsRUFBV0UsUUFBMUI7QUFD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U0csR0FUSDtBQVVEO0FBbkNJLEdBQVA7QUF3Q0QsQ0F4U0QsRUF3U0duRCxNQXhTSCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbi8vQVBJIDpBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cbmNvbnN0IEF1dG9jb21wbGV0ZU1hbmFnZXIgPSAoZnVuY3Rpb24oJCkge1xuICAvL0luaXRpYWxpemF0aW9uLi4uXG5cbiAgcmV0dXJuICh0YXJnZXQpID0+IHtcblxuICAgIGNvbnN0IEFQSV9LRVkgPSBcIkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVwiO1xuICAgIGNvbnN0IHRhcmdldEl0ZW0gPSB0eXBlb2YgdGFyZ2V0ID09IFwic3RyaW5nXCIgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCkgOiB0YXJnZXQ7XG4gICAgY29uc3QgcXVlcnlNZ3IgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICB2YXIgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcblxuICAgIHJldHVybiB7XG4gICAgICAkdGFyZ2V0OiAkKHRhcmdldEl0ZW0pLFxuICAgICAgdGFyZ2V0OiB0YXJnZXRJdGVtLFxuICAgICAgZm9yY2VTZWFyY2g6IChxKSA9PiB7XG4gICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBxIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICBpZiAocmVzdWx0c1swXSkge1xuICAgICAgICAgICAgbGV0IGdlb21ldHJ5ID0gcmVzdWx0c1swXS5nZW9tZXRyeTtcbiAgICAgICAgICAgIHF1ZXJ5TWdyLnVwZGF0ZVZpZXdwb3J0KGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICQodGFyZ2V0SXRlbSkudmFsKHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyB2YXIgZ2VvbWV0cnkgPSBkYXR1bS5nZW9tZXRyeTtcbiAgICAgICAgICAvLyBxdWVyeU1nci51cGRhdGVWaWV3cG9ydChnZW9tZXRyeS52aWV3cG9ydCk7XG5cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgaW5pdGlhbGl6ZTogKCkgPT4ge1xuICAgICAgICAkKHRhcmdldEl0ZW0pLnR5cGVhaGVhZCh7XG4gICAgICAgICAgICAgICAgICAgIGhpbnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWluTGVuZ3RoOiA0LFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgbWVudTogJ3R0LWRyb3Bkb3duLW1lbnUnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdzZWFyY2gtcmVzdWx0cycsXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IChpdGVtKSA9PiBpdGVtLmZvcm1hdHRlZF9hZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgICBsaW1pdDogMTAsXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogZnVuY3Rpb24gKHEsIHN5bmMsIGFzeW5jKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBxIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXN5bmMocmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICkub24oJ3R5cGVhaGVhZDpzZWxlY3RlZCcsIGZ1bmN0aW9uIChvYmosIGRhdHVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGRhdHVtKVxuICAgICAgICAgICAgICAgICAgICB7XG5cbiAgICAgICAgICAgICAgICAgICAgICB2YXIgZ2VvbWV0cnkgPSBkYXR1bS5nZW9tZXRyeTtcbiAgICAgICAgICAgICAgICAgICAgICBxdWVyeU1nci51cGRhdGVWaWV3cG9ydChnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gIG1hcC5maXRCb3VuZHMoZ2VvbWV0cnkuYm91bmRzPyBnZW9tZXRyeS5ib3VuZHMgOiBnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cblxuXG4gICAgcmV0dXJuIHtcblxuICAgIH1cbiAgfVxuXG59KGpRdWVyeSkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBMYW5ndWFnZU1hbmFnZXIgPSAoKCQpID0+IHtcbiAgLy9rZXlWYWx1ZVxuXG4gIC8vdGFyZ2V0cyBhcmUgdGhlIG1hcHBpbmdzIGZvciB0aGUgbGFuZ3VhZ2VcbiAgcmV0dXJuICgpID0+IHtcbiAgICBsZXQgbGFuZ3VhZ2U7XG4gICAgbGV0IGRpY3Rpb25hcnkgPSB7fTtcbiAgICBsZXQgJHRhcmdldHMgPSAkKFwiW2RhdGEtbGFuZy10YXJnZXRdW2RhdGEtbGFuZy1rZXldXCIpO1xuXG4gICAgY29uc3QgdXBkYXRlUGFnZUxhbmd1YWdlID0gKCkgPT4ge1xuXG4gICAgICBsZXQgdGFyZ2V0TGFuZ3VhZ2UgPSBkaWN0aW9uYXJ5LnJvd3MuZmlsdGVyKChpKSA9PiBpLmxhbmcgPT09IGxhbmd1YWdlKVswXTtcblxuICAgICAgJHRhcmdldHMuZWFjaCgoaW5kZXgsIGl0ZW0pID0+IHtcbiAgICAgICAgbGV0IHRhcmdldEF0dHJpYnV0ZSA9ICQoaXRlbSkuZGF0YSgnbGFuZy10YXJnZXQnKTtcbiAgICAgICAgbGV0IGxhbmdUYXJnZXQgPSAkKGl0ZW0pLmRhdGEoJ2xhbmcta2V5Jyk7XG5cbiAgICAgICAgc3dpdGNoKHRhcmdldEF0dHJpYnV0ZSkge1xuICAgICAgICAgIGNhc2UgJ3RleHQnOlxuICAgICAgICAgICAgJChpdGVtKS50ZXh0KHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3ZhbHVlJzpcbiAgICAgICAgICAgICQoaXRlbSkudmFsKHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAkKGl0ZW0pLmF0dHIodGFyZ2V0QXR0cmlidXRlLCB0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGxhbmd1YWdlLFxuICAgICAgdGFyZ2V0czogJHRhcmdldHMsXG4gICAgICBkaWN0aW9uYXJ5LFxuICAgICAgaW5pdGlhbGl6ZTogKGxhbmcpID0+IHtcblxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgIC8vIHVybDogJ2h0dHBzOi8vZ3N4Mmpzb24uY29tL2FwaT9pZD0xTzNlQnlqTDF2bFlmN1o3YW0tX2h0UlRRaTczUGFmcUlmTkJkTG1YZThTTSZzaGVldD0xJyxcbiAgICAgICAgICB1cmw6ICcvZGF0YS9sYW5nLmpzb24nLFxuICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgc3VjY2VzczogKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGRpY3Rpb25hcnkgPSBkYXRhO1xuICAgICAgICAgICAgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgICAgICAgICAgdXBkYXRlUGFnZUxhbmd1YWdlKCk7XG5cbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtbG9hZGVkJyk7XG5cbiAgICAgICAgICAgICQoXCIjbGFuZ3VhZ2Utb3B0c1wiKS5tdWx0aXNlbGVjdCgnc2VsZWN0JywgbGFuZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVMYW5ndWFnZTogKGxhbmcpID0+IHtcblxuICAgICAgICBsYW5ndWFnZSA9IGxhbmc7XG4gICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZSgpO1xuICAgICAgfSxcbiAgICAgIGdldFRyYW5zbGF0aW9uOiAoa2V5KSA9PiB7XG4gICAgICAgIGxldCB0YXJnZXRMYW5ndWFnZSA9IGRpY3Rpb25hcnkucm93cy5maWx0ZXIoKGkpID0+IGkubGFuZyA9PT0gbGFuZ3VhZ2UpWzBdO1xuICAgICAgICByZXR1cm4gdGFyZ2V0TGFuZ3VhZ2Vba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbn0pKGpRdWVyeSk7XG4iLCIvKiBUaGlzIGxvYWRzIGFuZCBtYW5hZ2VzIHRoZSBsaXN0ISAqL1xuXG5jb25zdCBMaXN0TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldExpc3QgPSBcIiNldmVudHMtbGlzdFwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRMaXN0ID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0TGlzdCkgOiB0YXJnZXRMaXN0O1xuXG4gICAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSkgPT4ge1xuXG4gICAgICB2YXIgZGF0ZSA9IG1vbWVudChpdGVtLnN0YXJ0X2RhdGV0aW1lKS5mb3JtYXQoXCJkZGRkIE1NTSBERCwgaDptbWFcIik7XG4gICAgICBsZXQgdXJsID0gaXRlbS51cmwubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS51cmwgOiBcIi8vXCIgKyBpdGVtLnVybDtcbiAgICAgIC8vIGxldCBzdXBlckdyb3VwID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcblxuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaSBjbGFzcz0nJHt3aW5kb3cuc2x1Z2lmeShpdGVtLmV2ZW50X3R5cGUpfSBldmVudHMgZXZlbnQtb2JqJyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50IHR5cGUtYWN0aW9uXCI+XG4gICAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgICAgPGxpIGNsYXNzPSd0YWctJHtpdGVtLmV2ZW50X3R5cGV9IHRhZyc+JHtpdGVtLmV2ZW50X3R5cGV9PC9saT5cbiAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDxoMiBjbGFzcz1cImV2ZW50LXRpdGxlXCI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWRhdGUgZGF0ZVwiPiR7ZGF0ZX08L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtYWRkcmVzcyBhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICAgIDxwPiR7aXRlbS52ZW51ZX08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5SU1ZQPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIGNvbnN0IHJlbmRlckdyb3VwID0gKGl0ZW0pID0+IHtcbiAgICAgIGxldCB1cmwgPSBpdGVtLndlYnNpdGUubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS53ZWJzaXRlIDogXCIvL1wiICsgaXRlbS53ZWJzaXRlO1xuICAgICAgbGV0IHN1cGVyR3JvdXAgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuICAgICAgLy8gY29uc29sZS5sb2coc3VwZXJHcm91cCk7XG4gICAgICByZXR1cm4gYFxuICAgICAgPGxpIGNsYXNzPScke2l0ZW0uZXZlbnRfdHlwZX0gJHtzdXBlckdyb3VwfSBncm91cC1vYmonIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXAgZ3JvdXAtb2JqXCI+XG4gICAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgICAgPGxpIGNsYXNzPVwidGFnIHRhZy0ke2l0ZW0uc3VwZXJncm91cH1cIj4ke2l0ZW0uc3VwZXJncm91cH08L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPGgyPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLm5hbWV9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWxvY2F0aW9uIGxvY2F0aW9uXCI+JHtpdGVtLmxvY2F0aW9ufTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPkdldCBJbnZvbHZlZDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICAgYFxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgJGxpc3Q6ICR0YXJnZXQsXG4gICAgICB1cGRhdGVGaWx0ZXI6IChwKSA9PiB7XG4gICAgICAgIGlmKCFwKSByZXR1cm47XG5cbiAgICAgICAgLy8gUmVtb3ZlIEZpbHRlcnNcblxuICAgICAgICAkdGFyZ2V0LnJlbW92ZVByb3AoXCJjbGFzc1wiKTtcbiAgICAgICAgJHRhcmdldC5hZGRDbGFzcyhwLmZpbHRlciA/IHAuZmlsdGVyLmpvaW4oXCIgXCIpIDogJycpXG5cbiAgICAgICAgJHRhcmdldC5maW5kKCdsaScpLmhpZGUoKTtcblxuICAgICAgICBpZiAocC5maWx0ZXIpIHtcbiAgICAgICAgICBwLmZpbHRlci5mb3JFYWNoKChmaWwpPT57XG4gICAgICAgICAgICAkdGFyZ2V0LmZpbmQoYGxpLiR7ZmlsfWApLnNob3coKTtcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdXBkYXRlQm91bmRzOiAoYm91bmQxLCBib3VuZDIpID0+IHtcblxuICAgICAgICAvLyBjb25zdCBib3VuZHMgPSBbcC5ib3VuZHMxLCBwLmJvdW5kczJdO1xuXG5cbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCBsaS5ldmVudC1vYmosIHVsIGxpLmdyb3VwLW9iaicpLmVhY2goKGluZCwgaXRlbSk9PiB7XG5cbiAgICAgICAgICBsZXQgX2xhdCA9ICQoaXRlbSkuZGF0YSgnbGF0JyksXG4gICAgICAgICAgICAgIF9sbmcgPSAkKGl0ZW0pLmRhdGEoJ2xuZycpO1xuXG4gICAgICAgICAgLy8gY29uc29sZS5sb2coXCJ1cGRhdGVCb3VuZHNcIiwgaXRlbSlcbiAgICAgICAgICBpZiAoYm91bmQxWzBdIDw9IF9sYXQgJiYgYm91bmQyWzBdID49IF9sYXQgJiYgYm91bmQxWzFdIDw9IF9sbmcgJiYgYm91bmQyWzFdID49IF9sbmcpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiQWRkaW5nIGJvdW5kc1wiKTtcbiAgICAgICAgICAgICQoaXRlbSkuYWRkQ2xhc3MoJ3dpdGhpbi1ib3VuZCcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKGl0ZW0pLnJlbW92ZUNsYXNzKCd3aXRoaW4tYm91bmQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBfdmlzaWJsZSA9ICR0YXJnZXQuZmluZCgndWwgbGkuZXZlbnQtb2JqLndpdGhpbi1ib3VuZCwgdWwgbGkuZ3JvdXAtb2JqLndpdGhpbi1ib3VuZCcpLmxlbmd0aDtcbiAgICAgICAgaWYgKF92aXNpYmxlID09IDApIHtcbiAgICAgICAgICAvLyBUaGUgbGlzdCBpcyBlbXB0eVxuICAgICAgICAgICR0YXJnZXQuYWRkQ2xhc3MoXCJpcy1lbXB0eVwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkdGFyZ2V0LnJlbW92ZUNsYXNzKFwiaXMtZW1wdHlcIik7XG4gICAgICAgIH1cblxuICAgICAgfSxcbiAgICAgIHBvcHVsYXRlTGlzdDogKGhhcmRGaWx0ZXJzKSA9PiB7XG4gICAgICAgIC8vdXNpbmcgd2luZG93LkVWRU5UX0RBVEFcbiAgICAgICAgY29uc3Qga2V5U2V0ID0gIWhhcmRGaWx0ZXJzLmtleSA/IFtdIDogaGFyZEZpbHRlcnMua2V5LnNwbGl0KCcsJyk7XG5cbiAgICAgICAgdmFyICRldmVudExpc3QgPSB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YS5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgaWYgKGtleVNldC5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0uZXZlbnRfdHlwZSAmJiBpdGVtLmV2ZW50X3R5cGUudG9Mb3dlckNhc2UoKSA9PSAnZ3JvdXAnID8gcmVuZGVyR3JvdXAoaXRlbSkgOiByZW5kZXJFdmVudChpdGVtKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtleVNldC5sZW5ndGggPiAwICYmIGl0ZW0uZXZlbnRfdHlwZSAhPSAnZ3JvdXAnICYmIGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyRXZlbnQoaXRlbSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXlTZXQubGVuZ3RoID4gMCAmJiBpdGVtLmV2ZW50X3R5cGUgPT0gJ2dyb3VwJyAmJiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5zdXBlcmdyb3VwKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlbmRlckdyb3VwKGl0ZW0pXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgfSlcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCBsaScpLnJlbW92ZSgpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsJykuYXBwZW5kKCRldmVudExpc3QpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJcbmNvbnN0IE1hcE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgbGV0IExBTkdVQUdFID0gJ2VuJztcblxuICBjb25zdCByZW5kZXJFdmVudCA9IChpdGVtKSA9PiB7XG4gICAgdmFyIGRhdGUgPSBtb21lbnQoaXRlbS5zdGFydF9kYXRldGltZSkuZm9ybWF0KFwiZGRkZCBNTU0gREQsIGg6bW1hXCIpO1xuICAgIGxldCB1cmwgPSBpdGVtLnVybC5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLnVybCA6IFwiLy9cIiArIGl0ZW0udXJsO1xuXG4gICAgbGV0IHN1cGVyR3JvdXAgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuICAgIHJldHVybiBgXG4gICAgPGRpdiBjbGFzcz0ncG9wdXAtaXRlbSAke2l0ZW0uZXZlbnRfdHlwZX0gJHtzdXBlckdyb3VwfScgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnRcIj5cbiAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctJHtpdGVtLmV2ZW50X3R5cGV9XCI+JHtpdGVtLmV2ZW50X3R5cGUgfHwgJ0FjdGlvbid9PC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPGgyIGNsYXNzPVwiZXZlbnQtdGl0bGVcIj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZX08L2E+PC9oMj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWRhdGVcIj4ke2RhdGV9PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1hZGRyZXNzIGFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgIDxwPiR7aXRlbS52ZW51ZX08L3A+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5SU1ZQPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICAgIGBcbiAgfTtcblxuICBjb25zdCByZW5kZXJHcm91cCA9IChpdGVtKSA9PiB7XG5cbiAgICBsZXQgdXJsID0gaXRlbS53ZWJzaXRlLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0ud2Vic2l0ZSA6IFwiLy9cIiArIGl0ZW0ud2Vic2l0ZTtcbiAgICBsZXQgc3VwZXJHcm91cCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG4gICAgcmV0dXJuIGBcbiAgICA8bGk+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ncm91cCBncm91cC1vYmogJHtzdXBlckdyb3VwfVwiPlxuICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgPGxpIGNsYXNzPVwidGFnIHRhZy0ke2l0ZW0uc3VwZXJncm91cH0gJHtzdXBlckdyb3VwfVwiPiR7aXRlbS5zdXBlcmdyb3VwfTwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1oZWFkZXJcIj5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0ubmFtZX08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtbG9jYXRpb24gbG9jYXRpb25cIj4ke2l0ZW0ubG9jYXRpb259PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICA8cD4ke2l0ZW0uZGVzY3JpcHRpb259PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+R2V0IEludm9sdmVkPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvbGk+XG4gICAgYFxuICB9O1xuXG4gIGNvbnN0IHJlbmRlckdlb2pzb24gPSAobGlzdCkgPT4ge1xuICAgIHJldHVybiBsaXN0Lm1hcCgoaXRlbSkgPT4ge1xuICAgICAgLy8gcmVuZGVyZWQgZXZlbnRUeXBlXG4gICAgICBsZXQgcmVuZGVyZWQ7XG5cbiAgICAgIGlmIChpdGVtLmV2ZW50X3R5cGUgJiYgaXRlbS5ldmVudF90eXBlLnRvTG93ZXJDYXNlKCkgPT0gJ2dyb3VwJykge1xuICAgICAgICByZW5kZXJlZCA9IHJlbmRlckdyb3VwKGl0ZW0pO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZW5kZXJlZCA9IHJlbmRlckV2ZW50KGl0ZW0pO1xuICAgICAgfVxuXG4gICAgICAvLyBmb3JtYXQgY2hlY2tcbiAgICAgIGlmIChpc05hTihwYXJzZUZsb2F0KHBhcnNlRmxvYXQoaXRlbS5sbmcpKSkpIHtcbiAgICAgICAgaXRlbS5sbmcgPSBpdGVtLmxuZy5zdWJzdHJpbmcoMSlcbiAgICAgIH1cbiAgICAgIGlmIChpc05hTihwYXJzZUZsb2F0KHBhcnNlRmxvYXQoaXRlbS5sYXQpKSkpIHtcbiAgICAgICAgaXRlbS5sYXQgPSBpdGVtLmxhdC5zdWJzdHJpbmcoMSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgIHR5cGU6IFwiUG9pbnRcIixcbiAgICAgICAgICBjb29yZGluYXRlczogW2l0ZW0ubG5nLCBpdGVtLmxhdF1cbiAgICAgICAgfSxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIGV2ZW50UHJvcGVydGllczogaXRlbSxcbiAgICAgICAgICBwb3B1cENvbnRlbnQ6IHJlbmRlcmVkXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIChvcHRpb25zKSA9PiB7XG4gICAgdmFyIGFjY2Vzc1Rva2VuID0gJ3BrLmV5SjFJam9pYldGMGRHaGxkek0xTUNJc0ltRWlPaUphVFZGTVVrVXdJbjAud2NNM1hjOEJHQzZQTS1PeXJ3am5oZyc7XG4gICAgdmFyIG1hcCA9IEwubWFwKCdtYXAnLCB7IGRyYWdnaW5nOiAhTC5Ccm93c2VyLm1vYmlsZSB9KS5zZXRWaWV3KFszNC44ODU5MzA5NDA3NTMxNywgNS4wOTc2NTYyNTAwMDAwMDFdLCAyKTtcblxuICAgIGlmICghTC5Ccm93c2VyLm1vYmlsZSkge1xuICAgICAgbWFwLnNjcm9sbFdoZWVsWm9vbS5kaXNhYmxlKCk7XG4gICAgfVxuXG4gICAgTEFOR1VBR0UgPSBvcHRpb25zLmxhbmcgfHwgJ2VuJztcblxuICAgIGlmIChvcHRpb25zLm9uTW92ZSkge1xuICAgICAgbWFwLm9uKCdkcmFnZW5kJywgKGV2ZW50KSA9PiB7XG5cblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuICAgICAgICBvcHRpb25zLm9uTW92ZShzdywgbmUpO1xuICAgICAgfSkub24oJ3pvb21lbmQnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKG1hcC5nZXRab29tKCkgPD0gNCkge1xuICAgICAgICAgICQoXCIjbWFwXCIpLmFkZENsYXNzKFwiem9vbWVkLW91dFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkKFwiI21hcFwiKS5yZW1vdmVDbGFzcyhcInpvb21lZC1vdXRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuICAgICAgICBvcHRpb25zLm9uTW92ZShzdywgbmUpO1xuICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBtYXAuZmlyZUV2ZW50KCd6b29tZW5kJyk7XG5cbiAgICBMLnRpbGVMYXllcignaHR0cHM6Ly9hcGkubWFwYm94LmNvbS9zdHlsZXMvdjEvbWF0dGhldzM1MC9jamE0MXRpamsyN2Q2MnJxb2Q3ZzBseDRiL3RpbGVzLzI1Ni97en0ve3h9L3t5fT9hY2Nlc3NfdG9rZW49JyArIGFjY2Vzc1Rva2VuLCB7XG4gICAgICAgIGF0dHJpYnV0aW9uOiAnJmNvcHk7IDxhIGhyZWY9XCJodHRwOi8vb3NtLm9yZy9jb3B5cmlnaHRcIj5PcGVuU3RyZWV0TWFwPC9hPiBjb250cmlidXRvcnMg4oCiIDxhIGhyZWY9XCIvLzM1MC5vcmdcIj4zNTAub3JnPC9hPidcbiAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgbGV0IGdlb2NvZGVyID0gbnVsbDtcbiAgICByZXR1cm4ge1xuICAgICAgJG1hcDogbWFwLFxuICAgICAgaW5pdGlhbGl6ZTogKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG4gICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBzZXRCb3VuZHM6IChib3VuZHMxLCBib3VuZHMyKSA9PiB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiWFhYXCIpO1xuICAgICAgICBjb25zdCBib3VuZHMgPSBbYm91bmRzMSwgYm91bmRzMl07XG4gICAgICAgIG1hcC5maXRCb3VuZHMoYm91bmRzKTtcbiAgICAgIH0sXG4gICAgICBzZXRDZW50ZXI6IChjZW50ZXIsIHpvb20gPSAxMCkgPT4ge1xuICAgICAgICBpZiAoIWNlbnRlciB8fCAhY2VudGVyWzBdIHx8IGNlbnRlclswXSA9PSBcIlwiXG4gICAgICAgICAgICAgIHx8ICFjZW50ZXJbMV0gfHwgY2VudGVyWzFdID09IFwiXCIpIHJldHVybjtcbiAgICAgICAgbWFwLnNldFZpZXcoY2VudGVyLCB6b29tKTtcbiAgICAgIH0sXG4gICAgICBnZXRCb3VuZHM6ICgpID0+IHtcblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuXG4gICAgICAgIHJldHVybiBbc3csIG5lXTtcbiAgICAgIH0sXG4gICAgICAvLyBDZW50ZXIgbG9jYXRpb24gYnkgZ2VvY29kZWRcbiAgICAgIGdldENlbnRlckJ5TG9jYXRpb246IChsb2NhdGlvbiwgY2FsbGJhY2spID0+IHtcblxuICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogbG9jYXRpb24gfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuXG4gICAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2socmVzdWx0c1swXSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHRyaWdnZXJab29tRW5kOiAoKSA9PiB7XG4gICAgICAgIG1hcC5maXJlRXZlbnQoJ3pvb21lbmQnKTtcbiAgICAgIH0sXG4gICAgICB6b29tT3V0T25jZTogKCkgPT4ge1xuICAgICAgICBtYXAuem9vbU91dCgxKTtcbiAgICAgIH0sXG4gICAgICB6b29tVW50aWxIaXQ6ICgpID0+IHtcbiAgICAgICAgdmFyICR0aGlzID0gdGhpcztcbiAgICAgICAgbWFwLnpvb21PdXQoMSk7XG4gICAgICAgIGxldCBpbnRlcnZhbEhhbmRsZXIgPSBudWxsO1xuICAgICAgICBpbnRlcnZhbEhhbmRsZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgdmFyIF92aXNpYmxlID0gJChkb2N1bWVudCkuZmluZCgndWwgbGkuZXZlbnQtb2JqLndpdGhpbi1ib3VuZCwgdWwgbGkuZ3JvdXAtb2JqLndpdGhpbi1ib3VuZCcpLmxlbmd0aDtcbiAgICAgICAgICBpZiAoX3Zpc2libGUgPT0gMCkge1xuICAgICAgICAgICAgbWFwLnpvb21PdXQoMSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxIYW5kbGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIDIwMCk7XG4gICAgICB9LFxuICAgICAgcmVmcmVzaE1hcDogKCkgPT4ge1xuICAgICAgICBtYXAuaW52YWxpZGF0ZVNpemUoZmFsc2UpO1xuICAgICAgICAvLyBtYXAuX29uUmVzaXplKCk7XG4gICAgICAgIC8vIG1hcC5maXJlRXZlbnQoJ3pvb21lbmQnKTtcblxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIm1hcCBpcyByZXNpemVkXCIpXG4gICAgICB9LFxuICAgICAgZmlsdGVyTWFwOiAoZmlsdGVycykgPT4ge1xuXG4gICAgICAgICQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cFwiKS5oaWRlKCk7XG5cbiAgICAgICAgLy8gY29uc29sZS5sb2coZmlsdGVycyk7XG4gICAgICAgIGlmICghZmlsdGVycykgcmV0dXJuO1xuXG4gICAgICAgIGZpbHRlcnMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuXG4gICAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwLlwiICsgaXRlbS50b0xvd2VyQ2FzZSgpKS5zaG93KCk7XG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgcGxvdFBvaW50czogKGxpc3QsIGhhcmRGaWx0ZXJzKSA9PiB7XG5cbiAgICAgICAgY29uc3Qga2V5U2V0ID0gIWhhcmRGaWx0ZXJzLmtleSA/IFtdIDogaGFyZEZpbHRlcnMua2V5LnNwbGl0KCcsJyk7XG5cbiAgICAgICAgaWYgKGtleVNldC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgbGlzdCA9IGxpc3QuZmlsdGVyKChpdGVtKSA9PiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5ldmVudF90eXBlKSlcbiAgICAgICAgfVxuXG5cbiAgICAgICAgY29uc3QgZ2VvanNvbiA9IHtcbiAgICAgICAgICB0eXBlOiBcIkZlYXR1cmVDb2xsZWN0aW9uXCIsXG4gICAgICAgICAgZmVhdHVyZXM6IHJlbmRlckdlb2pzb24obGlzdClcbiAgICAgICAgfTtcblxuXG5cbiAgICAgICAgTC5nZW9KU09OKGdlb2pzb24sIHtcbiAgICAgICAgICAgIHBvaW50VG9MYXllcjogKGZlYXR1cmUsIGxhdGxuZykgPT4ge1xuICAgICAgICAgICAgICAvLyBJY29ucyBmb3IgbWFya2Vyc1xuICAgICAgICAgICAgICBjb25zdCBldmVudFR5cGUgPSBmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLmV2ZW50X3R5cGU7XG4gICAgICAgICAgICAgIGNvbnN0IHNsdWdnZWQgPSB3aW5kb3cuc2x1Z2lmeShmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLnN1cGVyZ3JvdXApO1xuXG4gICAgICAgICAgICAgIHZhciBncm91cEljb24gPSBMLmljb24oe1xuICAgICAgICAgICAgICAgIGljb25Vcmw6IGV2ZW50VHlwZSAmJiBldmVudFR5cGUudG9Mb3dlckNhc2UoKSA9PT0gJ2dyb3VwJyA/ICcvaW1nL2dyb3VwLnBuZycgOiAnL2ltZy9ldmVudC5wbmcnLFxuICAgICAgICAgICAgICAgIGljb25TaXplOiBbMjIsIDIyXSxcbiAgICAgICAgICAgICAgICBpY29uQW5jaG9yOiBbMTIsIDhdLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogc2x1Z2dlZCArICcgZXZlbnQtaXRlbS1wb3B1cCdcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHZhciBldmVudEljb24gPSBMLmljb24oe1xuICAgICAgICAgICAgICAgIGljb25Vcmw6IGV2ZW50VHlwZSAmJiBldmVudFR5cGUudG9Mb3dlckNhc2UoKSA9PT0gJ2dyb3VwJyA/ICcvaW1nL2dyb3VwLnBuZycgOiAnL2ltZy9ldmVudC5wbmcnLFxuICAgICAgICAgICAgICAgIGljb25TaXplOiBbMTgsIDE4XSxcbiAgICAgICAgICAgICAgICBpY29uQW5jaG9yOiBbOSwgOV0sXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnZXZlbnRzIGV2ZW50LWl0ZW0tcG9wdXAnXG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgIHZhciBnZW9qc29uTWFya2VyT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBpY29uOiBldmVudFR5cGUgJiYgZXZlbnRUeXBlLnRvTG93ZXJDYXNlKCkgPT09ICdncm91cCcgPyBncm91cEljb24gOiBldmVudEljb24sXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJldHVybiBMLm1hcmtlcihsYXRsbmcsIGdlb2pzb25NYXJrZXJPcHRpb25zKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICBvbkVhY2hGZWF0dXJlOiAoZmVhdHVyZSwgbGF5ZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChmZWF0dXJlLnByb3BlcnRpZXMgJiYgZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCkge1xuICAgICAgICAgICAgICBsYXllci5iaW5kUG9wdXAoZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgICB9LFxuICAgICAgdXBkYXRlOiAocCkgPT4ge1xuICAgICAgICBpZiAoIXAgfHwgIXAubGF0IHx8ICFwLmxuZyApIHJldHVybjtcblxuICAgICAgICBtYXAuc2V0VmlldyhMLmxhdExuZyhwLmxhdCwgcC5sbmcpLCAxMCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsImNvbnN0IFF1ZXJ5TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldEZvcm0gPSBcImZvcm0jZmlsdGVycy1mb3JtXCIpID0+IHtcbiAgICBjb25zdCAkdGFyZ2V0ID0gdHlwZW9mIHRhcmdldEZvcm0gPT09ICdzdHJpbmcnID8gJCh0YXJnZXRGb3JtKSA6IHRhcmdldEZvcm07XG4gICAgbGV0IGxhdCA9IG51bGw7XG4gICAgbGV0IGxuZyA9IG51bGw7XG5cbiAgICBsZXQgcHJldmlvdXMgPSB7fTtcblxuICAgICR0YXJnZXQub24oJ3N1Ym1pdCcsIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBsYXQgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKCk7XG4gICAgICBsbmcgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKCk7XG5cbiAgICAgIHZhciBmb3JtID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuXG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICQucGFyYW0oZm9ybSk7XG4gICAgfSlcblxuICAgICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnc2VsZWN0I2ZpbHRlci1pdGVtcycsICgpID0+IHtcbiAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgfSlcblxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGluaXRpYWxpemU6IChjYWxsYmFjaykgPT4ge1xuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2gubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHZhciBwYXJhbXMgPSAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpKVxuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGFuZ11cIikudmFsKHBhcmFtcy5sYW5nKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKHBhcmFtcy5sYXQpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwocGFyYW1zLmxuZyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChwYXJhbXMuYm91bmQxKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKHBhcmFtcy5ib3VuZDIpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG9jXVwiKS52YWwocGFyYW1zLmxvYyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1rZXldXCIpLnZhbChwYXJhbXMua2V5KTtcblxuICAgICAgICAgIGlmIChwYXJhbXMuZmlsdGVyKSB7XG4gICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIjZmlsdGVyLWl0ZW1zIG9wdGlvblwiKS5yZW1vdmVQcm9wKFwic2VsZWN0ZWRcIik7XG4gICAgICAgICAgICBwYXJhbXMuZmlsdGVyLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICAgICR0YXJnZXQuZmluZChcIiNmaWx0ZXItaXRlbXMgb3B0aW9uW3ZhbHVlPSdcIiArIGl0ZW0gKyBcIiddXCIpLnByb3AoXCJzZWxlY3RlZFwiLCB0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZ2V0UGFyYW1ldGVyczogKCkgPT4ge1xuICAgICAgICB2YXIgcGFyYW1ldGVycyA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcbiAgICAgICAgLy8gcGFyYW1ldGVyc1snbG9jYXRpb24nXSA7XG5cbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gcGFyYW1ldGVycykge1xuICAgICAgICAgIGlmICggIXBhcmFtZXRlcnNba2V5XSB8fCBwYXJhbWV0ZXJzW2tleV0gPT0gXCJcIikge1xuICAgICAgICAgICAgZGVsZXRlIHBhcmFtZXRlcnNba2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyYW1ldGVycztcbiAgICAgIH0sXG4gICAgICB1cGRhdGVMb2NhdGlvbjogKGxhdCwgbG5nKSA9PiB7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwobGF0KTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChsbmcpO1xuICAgICAgICAvLyAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZVZpZXdwb3J0OiAodmlld3BvcnQpID0+IHtcblxuICAgICAgICBjb25zdCBib3VuZHMgPSBbW3ZpZXdwb3J0LmYuYiwgdmlld3BvcnQuYi5iXSwgW3ZpZXdwb3J0LmYuZiwgdmlld3BvcnQuYi5mXV07XG5cbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMF0pKTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMV0pKTtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVWaWV3cG9ydEJ5Qm91bmQ6IChzdywgbmUpID0+IHtcblxuICAgICAgICBjb25zdCBib3VuZHMgPSBbc3csIG5lXTsvLy8vLy8vL1xuXG5cbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMF0pKTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMV0pKTtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyU3VibWl0OiAoKSA9PiB7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59KShqUXVlcnkpO1xuIiwibGV0IGF1dG9jb21wbGV0ZU1hbmFnZXI7XG5sZXQgbWFwTWFuYWdlcjtcblxud2luZG93LnNsdWdpZnkgPSAodGV4dCkgPT4gdGV4dC50b1N0cmluZygpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxzKy9nLCAnLScpICAgICAgICAgICAvLyBSZXBsYWNlIHNwYWNlcyB3aXRoIC1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvW15cXHdcXC1dKy9nLCAnJykgICAgICAgLy8gUmVtb3ZlIGFsbCBub24td29yZCBjaGFyc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXC1cXC0rL2csICctJykgICAgICAgICAvLyBSZXBsYWNlIG11bHRpcGxlIC0gd2l0aCBzaW5nbGUgLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9eLSsvLCAnJykgICAgICAgICAgICAgLy8gVHJpbSAtIGZyb20gc3RhcnQgb2YgdGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8tKyQvLCAnJyk7ICAgICAgICAgICAgLy8gVHJpbSAtIGZyb20gZW5kIG9mIHRleHRcblxuKGZ1bmN0aW9uKCQpIHtcbiAgLy8gTG9hZCB0aGluZ3NcbiAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KHtcbiAgICB0ZW1wbGF0ZXM6IHtcbiAgICAgIGJ1dHRvbjogJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwibXVsdGlzZWxlY3QgZHJvcGRvd24tdG9nZ2xlXCIgZGF0YS10b2dnbGU9XCJkcm9wZG93blwiPjxzcGFuPk1vcmUgU2VhcmNoIE9wdGlvbnM8L3NwYW4+IDxzcGFuIGNsYXNzPVwiZmEgZmEtY2FyZXQtZG93blwiPjwvc3Bhbj48L2J1dHRvbj4nLFxuICAgIH0sXG4gICAgZHJvcFJpZ2h0OiB0cnVlXG4gIH0pO1xuXG4gICQoJ3NlbGVjdCNsYW5ndWFnZS1vcHRzJykubXVsdGlzZWxlY3Qoe1xuICAgIGVuYWJsZUhUTUw6IHRydWUsXG4gICAgb3B0aW9uQ2xhc3M6ICgpID0+ICdsYW5nLW9wdCcsXG4gICAgc2VsZWN0ZWRDbGFzczogKCkgPT4gJ2xhbmctc2VsJyxcbiAgICBidXR0b25DbGFzczogKCkgPT4gJ2xhbmctYnV0JyxcbiAgICBkcm9wUmlnaHQ6IHRydWUsXG4gICAgb3B0aW9uTGFiZWw6IChlKSA9PiB7XG4gICAgICAvLyBsZXQgZWwgPSAkKCAnPGRpdj48L2Rpdj4nICk7XG4gICAgICAvLyBlbC5hcHBlbmQoKCkgKyBcIlwiKTtcblxuICAgICAgcmV0dXJuIHVuZXNjYXBlKCQoZSkuYXR0cignbGFiZWwnKSkgfHwgJChlKS5odG1sKCk7XG4gICAgfSxcbiAgICBvbkNoYW5nZTogKG9wdGlvbiwgY2hlY2tlZCwgc2VsZWN0KSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhvcHRpb24udmFsKCkpXG4gICAgICBjb25zdCBwYXJhbWV0ZXJzID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcbiAgICAgIHBhcmFtZXRlcnNbJ2xhbmcnXSA9IG9wdGlvbi52YWwoKTtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgcGFyYW1ldGVycyk7XG4gICAgfVxuICB9KVxuXG4gIC8vIDEuIGdvb2dsZSBtYXBzIGdlb2NvZGVcblxuICAvLyAyLiBmb2N1cyBtYXAgb24gZ2VvY29kZSAodmlhIGxhdC9sbmcpXG4gIGNvbnN0IHF1ZXJ5TWFuYWdlciA9IFF1ZXJ5TWFuYWdlcigpO1xuICAgICAgICBxdWVyeU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuXG4gIGNvbnN0IGluaXRQYXJhbXMgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuICBtYXBNYW5hZ2VyID0gTWFwTWFuYWdlcih7XG4gICAgb25Nb3ZlOiAoc3csIG5lKSA9PiB7XG4gICAgICAvLyBXaGVuIHRoZSBtYXAgbW92ZXMgYXJvdW5kLCB3ZSB1cGRhdGUgdGhlIGxpc3RcbiAgICAgIHF1ZXJ5TWFuYWdlci51cGRhdGVWaWV3cG9ydEJ5Qm91bmQoc3csIG5lKTtcbiAgICAgIC8vdXBkYXRlIFF1ZXJ5XG4gICAgfVxuICB9KTtcblxuICB3aW5kb3cuaW5pdGlhbGl6ZUF1dG9jb21wbGV0ZUNhbGxiYWNrID0gKCkgPT4ge1xuICAgIC8vIGNvbnNvbGUubG9nKFwiSXQgaXMgY2FsbGVkXCIpO1xuICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIgPSBBdXRvY29tcGxldGVNYW5hZ2VyKFwiaW5wdXRbbmFtZT0nbG9jJ11cIik7XG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlci5pbml0aWFsaXplKCk7XG5cbiAgICBpZiAoaW5pdFBhcmFtcy5sb2MgJiYgaW5pdFBhcmFtcy5sb2MgIT09ICcnICYmICghaW5pdFBhcmFtcy5ib3VuZDEgJiYgIWluaXRQYXJhbXMuYm91bmQyKSkge1xuICAgICAgbWFwTWFuYWdlci5pbml0aWFsaXplKCgpID0+IHtcbiAgICAgICAgbWFwTWFuYWdlci5nZXRDZW50ZXJCeUxvY2F0aW9uKGluaXRQYXJhbXMubG9jLCAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgcXVlcnlNYW5hZ2VyLnVwZGF0ZVZpZXdwb3J0KHJlc3VsdC5nZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICB9XG4gIH1cblxuXG4gIGNvbnN0IGxhbmd1YWdlTWFuYWdlciA9IExhbmd1YWdlTWFuYWdlcigpO1xuXG4gIGxhbmd1YWdlTWFuYWdlci5pbml0aWFsaXplKGluaXRQYXJhbXNbJ2xhbmcnXSB8fCAnZW4nKTtcblxuICBjb25zdCBsaXN0TWFuYWdlciA9IExpc3RNYW5hZ2VyKCk7XG5cbiAgaWYoaW5pdFBhcmFtcy5sYXQgJiYgaW5pdFBhcmFtcy5sbmcpIHtcbiAgICBtYXBNYW5hZ2VyLnNldENlbnRlcihbaW5pdFBhcmFtcy5sYXQsIGluaXRQYXJhbXMubG5nXSk7XG4gIH1cblxuICAvKioqXG4gICogTGlzdCBFdmVudHNcbiAgKiBUaGlzIHdpbGwgdHJpZ2dlciB0aGUgbGlzdCB1cGRhdGUgbWV0aG9kXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgbGlzdE1hbmFnZXIucG9wdWxhdGVMaXN0KG9wdGlvbnMucGFyYW1zKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgLy8gY29uc29sZS5sb2coXCJGaWx0ZXJcIiwgb3B0aW9ucyk7XG4gICAgbGlzdE1hbmFnZXIudXBkYXRlRmlsdGVyKG9wdGlvbnMpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlci1ieS1ib3VuZCcsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxldCBib3VuZDEsIGJvdW5kMjtcblxuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICBbYm91bmQxLCBib3VuZDJdID0gbWFwTWFuYWdlci5nZXRCb3VuZHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgICBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcbiAgICB9XG5cbiAgICBsaXN0TWFuYWdlci51cGRhdGVCb3VuZHMoYm91bmQxLCBib3VuZDIpXG4gIH0pXG5cblxuICAvKioqXG4gICogTWFwIEV2ZW50c1xuICAqL1xuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgLy8gbWFwTWFuYWdlci5zZXRDZW50ZXIoW29wdGlvbnMubGF0LCBvcHRpb25zLmxuZ10pO1xuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGJvdW5kMSA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDEpO1xuICAgIHZhciBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcbiAgICAvLyBjb25zb2xlLmxvZyhcIm1hcC45OFwiLCBvcHRpb25zKTtcbiAgICBtYXBNYW5hZ2VyLnNldEJvdW5kcyhib3VuZDEsIGJvdW5kMik7XG4gICAgLy8gbWFwTWFuYWdlci50cmlnZ2VyWm9vbUVuZCgpO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBtYXBNYW5hZ2VyLnRyaWdnZXJab29tRW5kKCk7XG4gICAgfSwgMTApO1xuICAgIC8vIGNvbnNvbGUubG9nKG9wdGlvbnMpXG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsIFwiI2NvcHktZW1iZWRcIiwgKGUpID0+IHtcbiAgICB2YXIgY29weVRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVtYmVkLXRleHRcIik7XG4gICAgY29weVRleHQuc2VsZWN0KCk7XG4gICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJDb3B5XCIpO1xuICB9KTtcblxuICAvLyAzLiBtYXJrZXJzIG9uIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtcGxvdCcsIChlLCBvcHQpID0+IHtcblxuICAgIG1hcE1hbmFnZXIucGxvdFBvaW50cyhvcHQuZGF0YSwgb3B0LnBhcmFtcyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJyk7XG4gIH0pXG5cbiAgLy8gbG9hZCBncm91cHNcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sb2FkLWdyb3VwcycsIChlLCBvcHQpID0+IHtcblxuICAgIG9wdC5ncm91cHMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgbGV0IHNsdWdnZWQgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuICAgICAgbGV0IHZhbHVlVGV4dCA9IGxhbmd1YWdlTWFuYWdlci5nZXRUcmFuc2xhdGlvbihpdGVtLnRyYW5zbGF0aW9uKTtcbiAgICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5hcHBlbmQoYDxvcHRpb24gdmFsdWU9JyR7c2x1Z2dlZH0nIHNlbGVjdGVkPSdzZWxlY3RlZCcgZGF0YS1sYW5nLXRhcmdldD0ndGV4dCcgZGF0YS1sYW5nLWtleT0nJHtpdGVtLnRyYW5zbGF0aW9ufScgPiR7dmFsdWVUZXh0fTwvb3B0aW9uPmApXG4gICAgfSk7XG5cbiAgICAvLyBSZS1pbml0aWFsaXplXG4gICAgcXVlcnlNYW5hZ2VyLmluaXRpYWxpemUoKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZScpO1xuXG4gICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KCdyZWJ1aWxkJyk7XG4gICAgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCk7XG4gIH0pXG5cbiAgLy8gRmlsdGVyIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtZmlsdGVyJywgKGUsIG9wdCkgPT4ge1xuICAgIGlmIChvcHQpIHtcbiAgICAgIG1hcE1hbmFnZXIuZmlsdGVyTWFwKG9wdC5maWx0ZXIpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgKGUsIG9wdCkgPT4ge1xuICAgIGlmIChvcHQpIHtcbiAgICAgIGxhbmd1YWdlTWFuYWdlci51cGRhdGVMYW5ndWFnZShvcHQubGFuZyk7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sYW5ndWFnZS1sb2FkZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KCdyZWJ1aWxkJyk7XG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbiNzaG93LWhpZGUtbWFwJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ2JvZHknKS50b2dnbGVDbGFzcygnbWFwLXZpZXcnKVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uLmJ0bi5tb3JlLWl0ZW1zJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJyNlbWJlZC1hcmVhJykudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgLy91cGRhdGUgZW1iZWQgbGluZVxuICAgIHZhciBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHQpKTtcbiAgICBkZWxldGUgY29weVsnbG5nJ107XG4gICAgZGVsZXRlIGNvcHlbJ2xhdCddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDEnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQyJ107XG5cbiAgICAkKCcjZW1iZWQtYXJlYSBpbnB1dFtuYW1lPWVtYmVkXScpLnZhbCgnaHR0cHM6Ly9uZXctbWFwLjM1MC5vcmcjJyArICQucGFyYW0oY29weSkpO1xuICB9KTtcblxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24jem9vbS1vdXQnLCAoZSwgb3B0KSA9PiB7XG5cbiAgICAvLyBtYXBNYW5hZ2VyLnpvb21PdXRPbmNlKCk7XG5cbiAgICBtYXBNYW5hZ2VyLnpvb21VbnRpbEhpdCgpO1xuICB9KVxuXG4gICQod2luZG93KS5vbihcInJlc2l6ZVwiLCAoZSkgPT4ge1xuICAgIG1hcE1hbmFnZXIucmVmcmVzaE1hcCgpO1xuICB9KTtcblxuICAvKipcbiAgRmlsdGVyIENoYW5nZXNcbiAgKi9cbiAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIi5zZWFyY2gtYnV0dG9uIGJ1dHRvblwiLCAoZSkgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwic2VhcmNoLmZvcmNlLXNlYXJjaC1sb2NhdGlvblwiKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKFwia2V5dXBcIiwgXCJpbnB1dFtuYW1lPSdsb2MnXVwiLCAoZSkgPT4ge1xuICAgIGlmIChlLmtleUNvZGUgPT0gMTMpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3NlYXJjaC5mb3JjZS1zZWFyY2gtbG9jYXRpb24nKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdzZWFyY2guZm9yY2Utc2VhcmNoLWxvY2F0aW9uJywgKCkgPT4ge1xuICAgIGxldCBfcXVlcnkgPSAkKFwiaW5wdXRbbmFtZT0nbG9jJ11cIikudmFsKCk7XG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlci5mb3JjZVNlYXJjaChfcXVlcnkpO1xuICAgIC8vIFNlYXJjaCBnb29nbGUgYW5kIGdldCB0aGUgZmlyc3QgcmVzdWx0Li4uIGF1dG9jb21wbGV0ZT9cbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKFwiaGFzaGNoYW5nZVwiLCAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgaWYgKGhhc2gubGVuZ3RoID09IDApIHJldHVybjtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKGhhc2guc3Vic3RyaW5nKDEpKTtcbiAgICBjb25zdCBvbGRVUkwgPSBldmVudC5vcmlnaW5hbEV2ZW50Lm9sZFVSTDtcblxuXG4gICAgY29uc3Qgb2xkSGFzaCA9ICQuZGVwYXJhbShvbGRVUkwuc3Vic3RyaW5nKG9sZFVSTC5zZWFyY2goXCIjXCIpKzEpKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKFwiMTc3XCIsIHBhcmFtZXRlcnMsIG9sZEhhc2gpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcblxuICAgIC8vIFNvIHRoYXQgY2hhbmdlIGluIGZpbHRlcnMgd2lsbCBub3QgdXBkYXRlIHRoaXNcbiAgICBpZiAob2xkSGFzaC5ib3VuZDEgIT09IHBhcmFtZXRlcnMuYm91bmQxIHx8IG9sZEhhc2guYm91bmQyICE9PSBwYXJhbWV0ZXJzLmJvdW5kMikge1xuICAgICAgLy8gY29uc29sZS5sb2coXCIxODVcIiwgcGFyYW1ldGVycyk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLWJ5LWJvdW5kJywgcGFyYW1ldGVycyk7XG4gICAgfVxuXG4gICAgaWYgKG9sZEhhc2gubG9nICE9PSBwYXJhbWV0ZXJzLmxvYykge1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkNhbGxpbmcgaXRcIilcbiAgICB9XG5cbiAgICAvLyBDaGFuZ2UgaXRlbXNcbiAgICBpZiAob2xkSGFzaC5sYW5nICE9PSBwYXJhbWV0ZXJzLmxhbmcpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgfVxuICB9KVxuXG4gIC8vIDQuIGZpbHRlciBvdXQgaXRlbXMgaW4gYWN0aXZpdHktYXJlYVxuXG4gIC8vIDUuIGdldCBtYXAgZWxlbWVudHNcblxuICAvLyA2LiBnZXQgR3JvdXAgZGF0YVxuXG4gIC8vIDcuIHByZXNlbnQgZ3JvdXAgZWxlbWVudHNcblxuICAkLmFqYXgoe1xuICAgIHVybDogJ2h0dHBzOi8vbmV3LW1hcC4zNTAub3JnL291dHB1dC8zNTBvcmctbmV3LWxheW91dC5qcy5neicsIC8vJ3wqKkRBVEFfU09VUkNFKip8JyxcbiAgICBkYXRhVHlwZTogJ3NjcmlwdCcsXG4gICAgY2FjaGU6IHRydWUsXG4gICAgc3VjY2VzczogKGRhdGEpID0+IHtcbiAgICAgIC8vIHdpbmRvdy5FVkVOVFNfREFUQSA9IGRhdGE7XG5cbiAgICAgIC8vIGNvbnNvbGUubG9nKHdpbmRvdy5FVkVOVFNfREFUQSk7XG5cbiAgICAgIC8vTG9hZCBncm91cHNcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbG9hZC1ncm91cHMnLCB7IGdyb3Vwczogd2luZG93LkVWRU5UU19EQVRBLmdyb3VwcyB9KTtcblxuXG4gICAgICB2YXIgcGFyYW1ldGVycyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG5cbiAgICAgIHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgaXRlbVsnZXZlbnRfdHlwZSddID0gIWl0ZW0uZXZlbnRfdHlwZSA/ICdBY3Rpb24nIDogaXRlbS5ldmVudF90eXBlO1xuICAgICAgfSlcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC11cGRhdGUnLCB7IHBhcmFtczogcGFyYW1ldGVycyB9KTtcbiAgICAgIC8vICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1wbG90JywgeyBkYXRhOiB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YSwgcGFyYW1zOiBwYXJhbWV0ZXJzIH0pO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcbiAgICAgIC8vVE9ETzogTWFrZSB0aGUgZ2VvanNvbiBjb252ZXJzaW9uIGhhcHBlbiBvbiB0aGUgYmFja2VuZFxuXG4gICAgICAvL1JlZnJlc2ggdGhpbmdzXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgbGV0IHAgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIjIzMVwiLCBwKTtcbiAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcCk7XG4gICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicsIHApO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIjIzMlwiLCBwKTtcbiAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwKTtcbiAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci1ieS1ib3VuZCcsIHApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCkpXG4gICAgICB9LCAxMDApO1xuICAgIH1cbiAgfSk7XG5cblxuXG59KShqUXVlcnkpO1xuIl19
