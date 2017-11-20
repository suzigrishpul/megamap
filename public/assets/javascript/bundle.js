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
        //console.log("$targets", lang);
        $.ajax({
          url: 'http://gsx2json.com/api?id=1O3eByjL1vlYf7Z7am-_htRTQi73PafqIfNBdLmXe8SM&sheet=1',
          dataType: 'json',
          success: function success(data) {
            dictionary = data;
            language = lang;
            updatePageLanguage();
          }
        });
      },
      updateLanguage: function updateLanguage(lang) {
        //console.log("New Lang ::: ", lang);
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

      var date = moment(item.start_datetime).format("dddd MMM DD – h:mma");
      return "\n      <li class='" + item.event_type + " event-obj' data-lat='" + item.lat + "' data-lng='" + item.lng + "'>\n        <div class=\"type-event type-action\">\n          <ul class=\"event-types-list\">\n            <li class='tag-" + item.event_type + " tag'>" + item.event_type + "</li>\n          </ul>\n          <h2 class=\"event-title\"><a href=\"//" + item.url + "\" target='_blank'>" + item.title + "</a></h2>\n          <div class=\"event-date date\">" + date + "</div>\n          <div class=\"event-address address-area\">\n            <p>" + item.venue + "</p>\n          </div>\n          <div class=\"call-to-action\">\n            <a href=\"//" + item.url + "\" target='_blank' class=\"btn btn-secondary\">RSVP</a>\n          </div>\n        </div>\n      </li>\n      ";
    };

    var renderGroup = function renderGroup(item) {

      return "\n      <li>\n        <div class=\"type-group\">\n          <h2><a href=\"/\" target='_blank'>" + (item.title || "Group") + "</a></h2>\n          <div class=\"group-details-area\">\n            <p>Colorado, USA</p>\n            <p>" + (item.details || "350 Colorado is working locally to help build the global\n               350.org movement to solve the climate crisis and transition\n               to a clean, renewable energy future.") + "\n            </p>\n          </div>\n          <div class=\"call-to-action\">\n            <a href=\"//" + item.url + "\" target='_blank' class=\"btn btn-secondary\">Get Involved</a>\n          </div>\n        </div>\n      </li>\n      ";
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
        console.log(bound1, bound2);

        $target.find('ul li.event-obj').each(function (ind, item) {

          var _lat = $(item).data('lat'),
              _lng = $(item).data('lng');

          if (bound1[0] <= _lat && bound2[0] >= _lat && bound1[1] <= _lng && bound2[1] >= _lng) {
            $(item).show();
          } else {
            $(item).hide();
          }
        });
      },
      populateList: function populateList(hardFilters) {
        //using window.EVENT_DATA
        var keySet = !hardFilters.key ? [] : hardFilters.key.split(',');

        var $eventList = window.EVENTS_DATA.map(function (item) {
          if (keySet.length == 0) {
            return item.event_type !== 'Group' ? renderEvent(item) : renderGroup(item);
          } else if (keySet.length > 0 && keySet.includes(item.event_type)) {
            return item.event_type !== 'Group' ? renderEvent(item) : renderGroup(item);
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

  var renderEvent = function renderEvent(item) {
    var date = moment(item.start_datetime).format("dddd MMM DD, h:mma");
    return '\n    <div class=\'popup-item ' + item.event_type + '\' data-lat=\'' + item.lat + '\' data-lng=\'' + item.lng + '\'>\n      <div class="type-event">\n        <ul class="event-types-list">\n          <li class="tag tag-' + item.event_type + '">' + (item.event_type || 'Action') + '</li>\n        </ul>\n        <h2 class="event-title"><a href="//' + item.url + '" target=\'_blank\'>' + item.title + '</a></h2>\n        <div class="event-date">' + date + '</div>\n        <div class="event-address address-area">\n          <p>' + item.venue + '</p>\n        </div>\n        <div class="call-to-action">\n          <a href="//' + item.url + '" target=\'_blank\' class="btn btn-secondary">RSVP</a>\n        </div>\n      </div>\n    </div>\n    ';
  };

  var renderGroup = function renderGroup(item) {
    return '\n    <div class=\'popup-item ' + item.event_type + '\' data-lat=\'' + item.lat + '\' data-lng=\'' + item.lng + '\'>\n      <div class="type-group">\n        <h2><a href="/" target=\'_blank\'>' + (item.title || 'Group') + '</a></h2>\n        <div class="group-details-area">\n          <p>Colorado, USA</p>\n          <p>' + (item.details || '350 Colorado is working locally to help build the global\n             350.org movement to solve the climate crisis and transition\n             to a clean, renewable energy future.') + '\n          </p>\n        </div>\n        <div class="call-to-action">\n          <a href="//' + item.url + '" target=\'_blank\' class="btn btn-secondary">Get Involved</a>\n        </div>\n      </div>\n    </div>\n    ';
  };

  var renderGeojson = function renderGeojson(list) {
    return list.map(function (item) {
      // rendered eventType
      var rendered = void 0;
      if (!item.event_type || !item.event_type.toLowerCase() !== 'group') {
        rendered = renderEvent(item);
      } else {
        rendered = renderGroup(item);
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
    var map = L.map('map').setView([34.88593094075317, 5.097656250000001], 2);

    if (options.onMove) {
      map.on('dragend', function (event) {
        console.log(event, "Drag has ended", map.getBounds());

        var sw = [map.getBounds()._southWest.lat, map.getBounds()._southWest.lng];
        var ne = [map.getBounds()._northEast.lat, map.getBounds()._northEast.lng];
        options.onMove(sw, ne);
      }).on('zoomend', function (event) {
        console.log(event, "Zoom has ended", map.getBounds());

        var sw = [map.getBounds()._southWest.lat, map.getBounds()._southWest.lng];
        var ne = [map.getBounds()._northEast.lat, map.getBounds()._northEast.lng];
        options.onMove(sw, ne);
      });
    }

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
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
        console.log(map.getBounds());
        return map.getBounds();
      },
      // Center location by geocoded
      getCenterByLocation: function getCenterByLocation(location, callback) {
        //console.log("Finding location of ", location);
        geocoder.geocode({ address: location }, function (results, status) {
          //console.log("LOCATION MATCH:: ", results, status);
          if (callback && typeof callback === 'function') {
            callback(results[0]);
          }
        });
      },
      filterMap: function filterMap(filters) {
        //console.log("filters >> ", filters);
        $("#map").find(".event-item-popup").hide();
        //console.log($("#map").find(".event-item-popup"));

        if (!filters) return;

        filters.forEach(function (item) {
          //console.log(".event-item-popup." + item.toLowerCase());
          $("#map").find(".event-item-popup." + item.toLowerCase()).show();
        });
      },
      plotPoints: function plotPoints(list, hardFilters) {

        var keySet = !hardFilters.key ? [] : hardFilters.key.split(',');
        console.log(keySet, list);
        if (keySet.length > 0) {
          list = list.filter(function (item) {
            return keySet.includes(item.event_type);
          });
        }
        console.log(list);;

        var geojson = {
          type: "FeatureCollection",
          features: renderGeojson(list)
        };

        L.geoJSON(geojson, {
          pointToLayer: function pointToLayer(feature, latlng) {
            var eventType = feature.properties.eventProperties.event_type;
            var geojsonMarkerOptions = {
              radius: 8,
              fillColor: eventType === 'Group' ? "#40D7D4" : "#0F81E8",
              color: "white",
              weight: 2,
              opacity: 0.5,
              fillOpacity: 0.8,
              className: (eventType === 'Group' ? 'groups' : 'events') + ' event-item-popup'
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

        console.log(bounds);
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
  //console.log("Initialized");
  window.initializeAutocompleteCallback = function () {
    //console.log("Initialized");
    autocompleteManager = AutocompleteManager("input[name='loc']");
    autocompleteManager.initialize();
    //console.log("Initialized");
    if (initParams.loc && initParams.loc !== '' && !initParams.bound1 && !initParams.bound2) {
      mapManager.initialize(function () {
        mapManager.getCenterByLocation(initParams.loc, function (result) {
          queryManager.updateViewport(result.geometry.viewport);
        });
      });
    }
  };
  //console.log("MAP ", mapManager);

  var languageManager = LanguageManager();
  //console.log(queryManager, queryManager.getParameters(), initParams);
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
    if (!options || !options.bound1 || !options.bound2) {
      return;
    }
    var bound1 = JSON.parse(options.bound1);
    var bound2 = JSON.parse(options.bound2);

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
    //console.log(opt);
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

    $('#embed-area input[name=embed]').val('http://map.350.org.s3-website-us-east-1.amazonaws.com#' + $.param(copy));
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
    url: 'https://s3-us-west-2.amazonaws.com/pplsmap-data/output/350org-test.js.gz', //'|**DATA_SOURCE**|',
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
    }
  });

  setTimeout(function () {
    var p = queryManager.getParameters();
    $(document).trigger('trigger-map-update', p);
    $(document).trigger('trigger-list-filter-update', p);
    $(document).trigger('trigger-list-filter-by-bound', p);
    //console.log(queryManager.getParameters())
  }, 100);
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9sYW5ndWFnZS5qcyIsImNsYXNzZXMvbGlzdC5qcyIsImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9xdWVyeS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJBdXRvY29tcGxldGVNYW5hZ2VyIiwiJCIsInRhcmdldCIsIkFQSV9LRVkiLCJ0YXJnZXRJdGVtIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwicXVlcnlNZ3IiLCJRdWVyeU1hbmFnZXIiLCJnZW9jb2RlciIsImdvb2dsZSIsIm1hcHMiLCJHZW9jb2RlciIsIiR0YXJnZXQiLCJpbml0aWFsaXplIiwidHlwZWFoZWFkIiwiaGludCIsImhpZ2hsaWdodCIsIm1pbkxlbmd0aCIsImNsYXNzTmFtZXMiLCJtZW51IiwibmFtZSIsImRpc3BsYXkiLCJpdGVtIiwiZm9ybWF0dGVkX2FkZHJlc3MiLCJsaW1pdCIsInNvdXJjZSIsInEiLCJzeW5jIiwiYXN5bmMiLCJnZW9jb2RlIiwiYWRkcmVzcyIsInJlc3VsdHMiLCJzdGF0dXMiLCJvbiIsIm9iaiIsImRhdHVtIiwiZ2VvbWV0cnkiLCJ1cGRhdGVWaWV3cG9ydCIsInZpZXdwb3J0IiwialF1ZXJ5IiwiTGFuZ3VhZ2VNYW5hZ2VyIiwibGFuZ3VhZ2UiLCJkaWN0aW9uYXJ5IiwiJHRhcmdldHMiLCJ1cGRhdGVQYWdlTGFuZ3VhZ2UiLCJ0YXJnZXRMYW5ndWFnZSIsInJvd3MiLCJmaWx0ZXIiLCJpIiwibGFuZyIsImVhY2giLCJpbmRleCIsInRhcmdldEF0dHJpYnV0ZSIsImRhdGEiLCJsYW5nVGFyZ2V0IiwidGV4dCIsInZhbCIsImF0dHIiLCJ0YXJnZXRzIiwiYWpheCIsInVybCIsImRhdGFUeXBlIiwic3VjY2VzcyIsInVwZGF0ZUxhbmd1YWdlIiwiTGlzdE1hbmFnZXIiLCJ0YXJnZXRMaXN0IiwicmVuZGVyRXZlbnQiLCJkYXRlIiwibW9tZW50Iiwic3RhcnRfZGF0ZXRpbWUiLCJmb3JtYXQiLCJldmVudF90eXBlIiwibGF0IiwibG5nIiwidGl0bGUiLCJ2ZW51ZSIsInJlbmRlckdyb3VwIiwiZGV0YWlscyIsIiRsaXN0IiwidXBkYXRlRmlsdGVyIiwicCIsInJlbW92ZVByb3AiLCJhZGRDbGFzcyIsImpvaW4iLCJ1cGRhdGVCb3VuZHMiLCJib3VuZDEiLCJib3VuZDIiLCJjb25zb2xlIiwibG9nIiwiZmluZCIsImluZCIsIl9sYXQiLCJfbG5nIiwic2hvdyIsImhpZGUiLCJwb3B1bGF0ZUxpc3QiLCJoYXJkRmlsdGVycyIsImtleVNldCIsImtleSIsInNwbGl0IiwiJGV2ZW50TGlzdCIsIndpbmRvdyIsIkVWRU5UU19EQVRBIiwibWFwIiwibGVuZ3RoIiwiaW5jbHVkZXMiLCJyZW1vdmUiLCJhcHBlbmQiLCJNYXBNYW5hZ2VyIiwicmVuZGVyR2VvanNvbiIsImxpc3QiLCJyZW5kZXJlZCIsInRvTG93ZXJDYXNlIiwidHlwZSIsImNvb3JkaW5hdGVzIiwicHJvcGVydGllcyIsImV2ZW50UHJvcGVydGllcyIsInBvcHVwQ29udGVudCIsIm9wdGlvbnMiLCJMIiwic2V0VmlldyIsIm9uTW92ZSIsImV2ZW50IiwiZ2V0Qm91bmRzIiwic3ciLCJfc291dGhXZXN0IiwibmUiLCJfbm9ydGhFYXN0IiwidGlsZUxheWVyIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsIiRtYXAiLCJjYWxsYmFjayIsInNldEJvdW5kcyIsImJvdW5kczEiLCJib3VuZHMyIiwiYm91bmRzIiwiZml0Qm91bmRzIiwic2V0Q2VudGVyIiwiY2VudGVyIiwiem9vbSIsImdldENlbnRlckJ5TG9jYXRpb24iLCJsb2NhdGlvbiIsImZpbHRlck1hcCIsImZpbHRlcnMiLCJmb3JFYWNoIiwicGxvdFBvaW50cyIsImdlb2pzb24iLCJmZWF0dXJlcyIsImdlb0pTT04iLCJwb2ludFRvTGF5ZXIiLCJmZWF0dXJlIiwibGF0bG5nIiwiZXZlbnRUeXBlIiwiZ2VvanNvbk1hcmtlck9wdGlvbnMiLCJyYWRpdXMiLCJmaWxsQ29sb3IiLCJjb2xvciIsIndlaWdodCIsIm9wYWNpdHkiLCJmaWxsT3BhY2l0eSIsImNsYXNzTmFtZSIsImNpcmNsZU1hcmtlciIsIm9uRWFjaEZlYXR1cmUiLCJsYXllciIsImJpbmRQb3B1cCIsInVwZGF0ZSIsImxhdExuZyIsInRhcmdldEZvcm0iLCJwcmV2aW91cyIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImZvcm0iLCJkZXBhcmFtIiwic2VyaWFsaXplIiwiaGFzaCIsInBhcmFtIiwidHJpZ2dlciIsInBhcmFtcyIsInN1YnN0cmluZyIsImxvYyIsInByb3AiLCJnZXRQYXJhbWV0ZXJzIiwicGFyYW1ldGVycyIsInVwZGF0ZUxvY2F0aW9uIiwiZiIsImIiLCJKU09OIiwic3RyaW5naWZ5IiwidXBkYXRlVmlld3BvcnRCeUJvdW5kIiwidHJpZ2dlclN1Ym1pdCIsImF1dG9jb21wbGV0ZU1hbmFnZXIiLCJtYXBNYW5hZ2VyIiwicXVlcnlNYW5hZ2VyIiwiaW5pdFBhcmFtcyIsImluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayIsInJlc3VsdCIsImxhbmd1YWdlTWFuYWdlciIsImxpc3RNYW5hZ2VyIiwicGFyc2UiLCJvcHQiLCJ0b2dnbGVDbGFzcyIsImNvcHkiLCJvbGRVUkwiLCJvcmlnaW5hbEV2ZW50Iiwib2xkSGFzaCIsInNlYXJjaCIsImNhY2hlIiwic2V0VGltZW91dCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7QUFDQSxJQUFNQSxzQkFBdUIsVUFBU0MsQ0FBVCxFQUFZO0FBQ3ZDOztBQUVBLFNBQU8sVUFBQ0MsTUFBRCxFQUFZOztBQUVqQixRQUFNQyxVQUFVLHlDQUFoQjtBQUNBLFFBQU1DLGFBQWEsT0FBT0YsTUFBUCxJQUFpQixRQUFqQixHQUE0QkcsU0FBU0MsYUFBVCxDQUF1QkosTUFBdkIsQ0FBNUIsR0FBNkRBLE1BQWhGO0FBQ0EsUUFBTUssV0FBV0MsY0FBakI7QUFDQSxRQUFJQyxXQUFXLElBQUlDLE9BQU9DLElBQVAsQ0FBWUMsUUFBaEIsRUFBZjs7QUFFQSxXQUFPO0FBQ0xDLGVBQVNa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b0JBQXBCLEVBQTBDakcsQ0FBMUM7QUFDQWhGLE1BQUVJLFFBQUYsRUFBWTZLLE9BQVosQ0FBb0IsNEJBQXBCLEVBQWtEakcsQ0FBbEQ7QUFDQWhGLE1BQUVJLFFBQUYsRUFBWTZLLE9BQVosQ0FBb0IsOEJBQXBCLEVBQW9EakcsQ0FBcEQ7QUFDSjtBQUNHLEdBTkQsRUFNRyxHQU5IO0FBUUQsQ0FqTEQsRUFpTEd6QyxNQWpMSCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbi8vQVBJIDpBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cbmNvbnN0IEF1dG9jb21wbGV0ZU1hbmFnZXIgPSAoZnVuY3Rpb24oJCkge1xuICAvL0luaXRpYWxpemF0aW9uLi4uXG5cbiAgcmV0dXJuICh0YXJnZXQpID0+IHtcblxuICAgIGNvbnN0IEFQSV9LRVkgPSBcIkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVwiO1xuICAgIGNvbnN0IHRhcmdldEl0ZW0gPSB0eXBlb2YgdGFyZ2V0ID09IFwic3RyaW5nXCIgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCkgOiB0YXJnZXQ7XG4gICAgY29uc3QgcXVlcnlNZ3IgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICB2YXIgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcblxuICAgIHJldHVybiB7XG4gICAgICAkdGFyZ2V0OiAkKHRhcmdldEl0ZW0pLFxuICAgICAgdGFyZ2V0OiB0YXJnZXRJdGVtLFxuICAgICAgaW5pdGlhbGl6ZTogKCkgPT4ge1xuICAgICAgICAkKHRhcmdldEl0ZW0pLnR5cGVhaGVhZCh7XG4gICAgICAgICAgICAgICAgICAgIGhpbnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWluTGVuZ3RoOiA0LFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgbWVudTogJ3R0LWRyb3Bkb3duLW1lbnUnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdzZWFyY2gtcmVzdWx0cycsXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IChpdGVtKSA9PiBpdGVtLmZvcm1hdHRlZF9hZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgICBsaW1pdDogMTAsXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogZnVuY3Rpb24gKHEsIHN5bmMsIGFzeW5jKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBxIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXN5bmMocmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICkub24oJ3R5cGVhaGVhZDpzZWxlY3RlZCcsIGZ1bmN0aW9uIChvYmosIGRhdHVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGRhdHVtKVxuICAgICAgICAgICAgICAgICAgICB7XG5cbiAgICAgICAgICAgICAgICAgICAgICB2YXIgZ2VvbWV0cnkgPSBkYXR1bS5nZW9tZXRyeTtcbiAgICAgICAgICAgICAgICAgICAgICBxdWVyeU1nci51cGRhdGVWaWV3cG9ydChnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gIG1hcC5maXRCb3VuZHMoZ2VvbWV0cnkuYm91bmRzPyBnZW9tZXRyeS5ib3VuZHMgOiBnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cblxuXG4gICAgcmV0dXJuIHtcblxuICAgIH1cbiAgfVxuXG59KGpRdWVyeSkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBMYW5ndWFnZU1hbmFnZXIgPSAoKCQpID0+IHtcbiAgLy9rZXlWYWx1ZVxuXG4gIC8vdGFyZ2V0cyBhcmUgdGhlIG1hcHBpbmdzIGZvciB0aGUgbGFuZ3VhZ2VcbiAgcmV0dXJuICgpID0+IHtcbiAgICBsZXQgbGFuZ3VhZ2U7XG4gICAgbGV0IGRpY3Rpb25hcnkgPSB7fTtcbiAgICBsZXQgJHRhcmdldHMgPSAkKFwiW2RhdGEtbGFuZy10YXJnZXRdW2RhdGEtbGFuZy1rZXldXCIpO1xuXG4gICAgY29uc3QgdXBkYXRlUGFnZUxhbmd1YWdlID0gKCkgPT4ge1xuXG4gICAgICBsZXQgdGFyZ2V0TGFuZ3VhZ2UgPSBkaWN0aW9uYXJ5LnJvd3MuZmlsdGVyKChpKSA9PiBpLmxhbmcgPT09IGxhbmd1YWdlKVswXTtcblxuICAgICAgJHRhcmdldHMuZWFjaCgoaW5kZXgsIGl0ZW0pID0+IHtcbiAgICAgICAgbGV0IHRhcmdldEF0dHJpYnV0ZSA9ICQoaXRlbSkuZGF0YSgnbGFuZy10YXJnZXQnKTtcbiAgICAgICAgbGV0IGxhbmdUYXJnZXQgPSAkKGl0ZW0pLmRhdGEoJ2xhbmcta2V5Jyk7XG5cbiAgICAgICAgc3dpdGNoKHRhcmdldEF0dHJpYnV0ZSkge1xuICAgICAgICAgIGNhc2UgJ3RleHQnOlxuICAgICAgICAgICAgJChpdGVtKS50ZXh0KHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3ZhbHVlJzpcbiAgICAgICAgICAgICQoaXRlbSkudmFsKHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAkKGl0ZW0pLmF0dHIodGFyZ2V0QXR0cmlidXRlLCB0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGxhbmd1YWdlLFxuICAgICAgdGFyZ2V0czogJHRhcmdldHMsXG4gICAgICBkaWN0aW9uYXJ5LFxuICAgICAgaW5pdGlhbGl6ZTogKGxhbmcpID0+IHtcbi8vY29uc29sZS5sb2coXCIkdGFyZ2V0c1wiLCBsYW5nKTtcbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICB1cmw6ICdodHRwOi8vZ3N4Mmpzb24uY29tL2FwaT9pZD0xTzNlQnlqTDF2bFlmN1o3YW0tX2h0UlRRaTczUGFmcUlmTkJkTG1YZThTTSZzaGVldD0xJyxcbiAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICBkaWN0aW9uYXJ5ID0gZGF0YTtcbiAgICAgICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTGFuZ3VhZ2U6IChsYW5nKSA9PiB7XG4vL2NvbnNvbGUubG9nKFwiTmV3IExhbmcgOjo6IFwiLCBsYW5nKTtcbiAgICAgICAgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbn0pKGpRdWVyeSk7XG4iLCIvKiBUaGlzIGxvYWRzIGFuZCBtYW5hZ2VzIHRoZSBsaXN0ISAqL1xuXG5jb25zdCBMaXN0TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldExpc3QgPSBcIiNldmVudHMtbGlzdFwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRMaXN0ID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0TGlzdCkgOiB0YXJnZXRMaXN0O1xuXG4gICAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSkgPT4ge1xuXG4gICAgICB2YXIgZGF0ZSA9IG1vbWVudChpdGVtLnN0YXJ0X2RhdGV0aW1lKS5mb3JtYXQoXCJkZGRkIE1NTSBERCDigJMgaDptbWFcIik7XG4gICAgICByZXR1cm4gYFxuICAgICAgPGxpIGNsYXNzPScke2l0ZW0uZXZlbnRfdHlwZX0gZXZlbnQtb2JqJyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50IHR5cGUtYWN0aW9uXCI+XG4gICAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgICAgPGxpIGNsYXNzPSd0YWctJHtpdGVtLmV2ZW50X3R5cGV9IHRhZyc+JHtpdGVtLmV2ZW50X3R5cGV9PC9saT5cbiAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDxoMiBjbGFzcz1cImV2ZW50LXRpdGxlXCI+PGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1kYXRlIGRhdGVcIj4ke2RhdGV9PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWFkZHJlc3MgYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPlJTVlA8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSkgPT4ge1xuXG4gICAgICByZXR1cm4gYFxuICAgICAgPGxpPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ncm91cFwiPlxuICAgICAgICAgIDxoMj48YSBocmVmPVwiL1wiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGUgfHwgYEdyb3VwYH08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgICA8cD5Db2xvcmFkbywgVVNBPC9wPlxuICAgICAgICAgICAgPHA+JHtpdGVtLmRldGFpbHMgfHwgYDM1MCBDb2xvcmFkbyBpcyB3b3JraW5nIGxvY2FsbHkgdG8gaGVscCBidWlsZCB0aGUgZ2xvYmFsXG4gICAgICAgICAgICAgICAzNTAub3JnIG1vdmVtZW50IHRvIHNvbHZlIHRoZSBjbGltYXRlIGNyaXNpcyBhbmQgdHJhbnNpdGlvblxuICAgICAgICAgICAgICAgdG8gYSBjbGVhbiwgcmVuZXdhYmxlIGVuZXJneSBmdXR1cmUuYH1cbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICRsaXN0OiAkdGFyZ2V0LFxuICAgICAgdXBkYXRlRmlsdGVyOiAocCkgPT4ge1xuICAgICAgICBpZighcCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIFJlbW92ZSBGaWx0ZXJzXG5cbiAgICAgICAgJHRhcmdldC5yZW1vdmVQcm9wKFwiY2xhc3NcIik7XG4gICAgICAgICR0YXJnZXQuYWRkQ2xhc3MocC5maWx0ZXIgPyBwLmZpbHRlci5qb2luKFwiIFwiKSA6ICcnKVxuICAgICAgfSxcbiAgICAgIHVwZGF0ZUJvdW5kczogKGJvdW5kMSwgYm91bmQyKSA9PiB7XG5cbiAgICAgICAgLy8gY29uc3QgYm91bmRzID0gW3AuYm91bmRzMSwgcC5ib3VuZHMyXTtcbiAgICAgICAgY29uc29sZS5sb2coYm91bmQxLCBib3VuZDIpO1xuXG4gICAgICAgICR0YXJnZXQuZmluZCgndWwgbGkuZXZlbnQtb2JqJykuZWFjaCgoaW5kLCBpdGVtKT0+IHtcblxuICAgICAgICAgIGxldCBfbGF0ID0gJChpdGVtKS5kYXRhKCdsYXQnKSxcbiAgICAgICAgICAgICAgX2xuZyA9ICQoaXRlbSkuZGF0YSgnbG5nJyk7XG5cbiAgICAgICAgICBpZiAoYm91bmQxWzBdIDw9IF9sYXQgJiYgYm91bmQyWzBdID49IF9sYXQgJiYgYm91bmQxWzFdIDw9IF9sbmcgJiYgYm91bmQyWzFdID49IF9sbmcpIHtcbiAgICAgICAgICAgICQoaXRlbSkuc2hvdygpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKGl0ZW0pLmhpZGUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHBvcHVsYXRlTGlzdDogKGhhcmRGaWx0ZXJzKSA9PiB7XG4gICAgICAgIC8vdXNpbmcgd2luZG93LkVWRU5UX0RBVEFcbiAgICAgICAgY29uc3Qga2V5U2V0ID0gIWhhcmRGaWx0ZXJzLmtleSA/IFtdIDogaGFyZEZpbHRlcnMua2V5LnNwbGl0KCcsJyk7XG5cbiAgICAgICAgdmFyICRldmVudExpc3QgPSB3aW5kb3cuRVZFTlRTX0RBVEEubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgIGlmIChrZXlTZXQubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLmV2ZW50X3R5cGUgIT09ICdHcm91cCcgPyByZW5kZXJFdmVudChpdGVtKSA6IHJlbmRlckdyb3VwKGl0ZW0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2V5U2V0Lmxlbmd0aCA+IDAgJiYga2V5U2V0LmluY2x1ZGVzKGl0ZW0uZXZlbnRfdHlwZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLmV2ZW50X3R5cGUgIT09ICdHcm91cCcgPyByZW5kZXJFdmVudChpdGVtKSA6IHJlbmRlckdyb3VwKGl0ZW0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIH0pXG4gICAgICAgICR0YXJnZXQuZmluZCgndWwgbGknKS5yZW1vdmUoKTtcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCcpLmFwcGVuZCgkZXZlbnRMaXN0KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiXG5jb25zdCBNYXBNYW5hZ2VyID0gKCgkKSA9PiB7XG5cbiAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSkgPT4ge1xuICAgIHZhciBkYXRlID0gbW9tZW50KGl0ZW0uc3RhcnRfZGF0ZXRpbWUpLmZvcm1hdChcImRkZGQgTU1NIERELCBoOm1tYVwiKTtcbiAgICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9J3BvcHVwLWl0ZW0gJHtpdGVtLmV2ZW50X3R5cGV9JyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudFwiPlxuICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgPGxpIGNsYXNzPVwidGFnIHRhZy0ke2l0ZW0uZXZlbnRfdHlwZX1cIj4ke2l0ZW0uZXZlbnRfdHlwZSB8fCAnQWN0aW9uJ308L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8aDIgY2xhc3M9XCJldmVudC10aXRsZVwiPjxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZX08L2E+PC9oMj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWRhdGVcIj4ke2RhdGV9PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1hZGRyZXNzIGFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgIDxwPiR7aXRlbS52ZW51ZX08L3A+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiLy8ke2l0ZW0udXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+UlNWUDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSkgPT4ge1xuICAgIHJldHVybiBgXG4gICAgPGRpdiBjbGFzcz0ncG9wdXAtaXRlbSAke2l0ZW0uZXZlbnRfdHlwZX0nIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwXCI+XG4gICAgICAgIDxoMj48YSBocmVmPVwiL1wiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGUgfHwgYEdyb3VwYH08L2E+PC9oMj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgIDxwPkNvbG9yYWRvLCBVU0E8L3A+XG4gICAgICAgICAgPHA+JHtpdGVtLmRldGFpbHMgfHwgYDM1MCBDb2xvcmFkbyBpcyB3b3JraW5nIGxvY2FsbHkgdG8gaGVscCBidWlsZCB0aGUgZ2xvYmFsXG4gICAgICAgICAgICAgMzUwLm9yZyBtb3ZlbWVudCB0byBzb2x2ZSB0aGUgY2xpbWF0ZSBjcmlzaXMgYW5kIHRyYW5zaXRpb25cbiAgICAgICAgICAgICB0byBhIGNsZWFuLCByZW5ld2FibGUgZW5lcmd5IGZ1dHVyZS5gfVxuICAgICAgICAgIDwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgIDxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgYFxuICB9O1xuXG4gIGNvbnN0IHJlbmRlckdlb2pzb24gPSAobGlzdCkgPT4ge1xuICAgIHJldHVybiBsaXN0Lm1hcCgoaXRlbSkgPT4ge1xuICAgICAgLy8gcmVuZGVyZWQgZXZlbnRUeXBlXG4gICAgICBsZXQgcmVuZGVyZWQ7XG4gICAgICBpZiAoIWl0ZW0uZXZlbnRfdHlwZSB8fCAhaXRlbS5ldmVudF90eXBlLnRvTG93ZXJDYXNlKCkgIT09ICdncm91cCcpIHtcbiAgICAgICAgcmVuZGVyZWQgPSByZW5kZXJFdmVudChpdGVtKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlbmRlcmVkID0gcmVuZGVyR3JvdXAoaXRlbSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICB0eXBlOiBcIlBvaW50XCIsXG4gICAgICAgICAgY29vcmRpbmF0ZXM6IFtpdGVtLmxuZywgaXRlbS5sYXRdXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBldmVudFByb3BlcnRpZXM6IGl0ZW0sXG4gICAgICAgICAgcG9wdXBDb250ZW50OiByZW5kZXJlZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAob3B0aW9ucykgPT4ge1xuICAgIHZhciBtYXAgPSBMLm1hcCgnbWFwJykuc2V0VmlldyhbMzQuODg1OTMwOTQwNzUzMTcsIDUuMDk3NjU2MjUwMDAwMDAxXSwgMik7XG5cbiAgICBpZiAob3B0aW9ucy5vbk1vdmUpIHtcbiAgICAgIG1hcC5vbignZHJhZ2VuZCcsIChldmVudCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhldmVudCwgXCJEcmFnIGhhcyBlbmRlZFwiLCBtYXAuZ2V0Qm91bmRzKCkpO1xuXG4gICAgICAgIGxldCBzdyA9IFttYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxuZ107XG4gICAgICAgIGxldCBuZSA9IFttYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxuZ107XG4gICAgICAgIG9wdGlvbnMub25Nb3ZlKHN3LCBuZSk7XG4gICAgICB9KS5vbignem9vbWVuZCcsIChldmVudCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhldmVudCwgXCJab29tIGhhcyBlbmRlZFwiLCBtYXAuZ2V0Qm91bmRzKCkpO1xuXG4gICAgICAgIGxldCBzdyA9IFttYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxuZ107XG4gICAgICAgIGxldCBuZSA9IFttYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxuZ107XG4gICAgICAgIG9wdGlvbnMub25Nb3ZlKHN3LCBuZSk7XG4gICAgICB9KVxuICAgIH1cblxuICAgIEwudGlsZUxheWVyKCdodHRwOi8ve3N9LnRpbGUub3NtLm9yZy97en0ve3h9L3t5fS5wbmcnLCB7XG4gICAgICAgIGF0dHJpYnV0aW9uOiAnJmNvcHk7IDxhIGhyZWY9XCJodHRwOi8vb3NtLm9yZy9jb3B5cmlnaHRcIj5PcGVuU3RyZWV0TWFwPC9hPiBjb250cmlidXRvcnMg4oCiIDxhIGhyZWY9XCIvLzM1MC5vcmdcIj4zNTAub3JnPC9hPidcbiAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgbGV0IGdlb2NvZGVyID0gbnVsbDtcbiAgICByZXR1cm4ge1xuICAgICAgJG1hcDogbWFwLFxuICAgICAgaW5pdGlhbGl6ZTogKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG4gICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBzZXRCb3VuZHM6IChib3VuZHMxLCBib3VuZHMyKSA9PiB7XG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtib3VuZHMxLCBib3VuZHMyXTtcbiAgICAgICAgbWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuICAgICAgfSxcbiAgICAgIHNldENlbnRlcjogKGNlbnRlciwgem9vbSA9IDEwKSA9PiB7XG4gICAgICAgIGlmICghY2VudGVyIHx8ICFjZW50ZXJbMF0gfHwgY2VudGVyWzBdID09IFwiXCJcbiAgICAgICAgICAgICAgfHwgIWNlbnRlclsxXSB8fCBjZW50ZXJbMV0gPT0gXCJcIikgcmV0dXJuO1xuICAgICAgICBtYXAuc2V0VmlldyhjZW50ZXIsIHpvb20pO1xuICAgICAgfSxcbiAgICAgIGdldEJvdW5kczogKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhtYXAuZ2V0Qm91bmRzKCkpO1xuICAgICAgICByZXR1cm4gbWFwLmdldEJvdW5kcygpO1xuICAgICAgfSxcbiAgICAgIC8vIENlbnRlciBsb2NhdGlvbiBieSBnZW9jb2RlZFxuICAgICAgZ2V0Q2VudGVyQnlMb2NhdGlvbjogKGxvY2F0aW9uLCBjYWxsYmFjaykgPT4ge1xuLy9jb25zb2xlLmxvZyhcIkZpbmRpbmcgbG9jYXRpb24gb2YgXCIsIGxvY2F0aW9uKTtcbiAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IGxvY2F0aW9uIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcbi8vY29uc29sZS5sb2coXCJMT0NBVElPTiBNQVRDSDo6IFwiLCByZXN1bHRzLCBzdGF0dXMpO1xuICAgICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlc3VsdHNbMF0pXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBmaWx0ZXJNYXA6IChmaWx0ZXJzKSA9PiB7XG4vL2NvbnNvbGUubG9nKFwiZmlsdGVycyA+PiBcIiwgZmlsdGVycyk7XG4gICAgICAgICQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cFwiKS5oaWRlKCk7XG4vL2NvbnNvbGUubG9nKCQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cFwiKSk7XG5cbiAgICAgICAgaWYgKCFmaWx0ZXJzKSByZXR1cm47XG5cbiAgICAgICAgZmlsdGVycy5mb3JFYWNoKChpdGVtKSA9PiB7XG4vL2NvbnNvbGUubG9nKFwiLmV2ZW50LWl0ZW0tcG9wdXAuXCIgKyBpdGVtLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICAgICQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cC5cIiArIGl0ZW0udG9Mb3dlckNhc2UoKSkuc2hvdygpO1xuICAgICAgICB9KVxuICAgICAgfSxcbiAgICAgIHBsb3RQb2ludHM6IChsaXN0LCBoYXJkRmlsdGVycykgPT4ge1xuXG4gICAgICAgIGNvbnN0IGtleVNldCA9ICFoYXJkRmlsdGVycy5rZXkgPyBbXSA6IGhhcmRGaWx0ZXJzLmtleS5zcGxpdCgnLCcpO1xuICAgICAgICBjb25zb2xlLmxvZyhrZXlTZXQsIGxpc3QpO1xuICAgICAgICBpZiAoa2V5U2V0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsaXN0ID0gbGlzdC5maWx0ZXIoKGl0ZW0pID0+IGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKVxuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGxpc3QpOztcblxuICAgICAgICBjb25zdCBnZW9qc29uID0ge1xuICAgICAgICAgIHR5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgICAgICAgICBmZWF0dXJlczogcmVuZGVyR2VvanNvbihsaXN0KVxuICAgICAgICB9O1xuXG5cblxuICAgICAgICBMLmdlb0pTT04oZ2VvanNvbiwge1xuICAgICAgICAgICAgcG9pbnRUb0xheWVyOiAoZmVhdHVyZSwgbGF0bG5nKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuZXZlbnRfdHlwZTtcbiAgICAgICAgICAgICAgdmFyIGdlb2pzb25NYXJrZXJPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgICAgcmFkaXVzOiA4LFxuICAgICAgICAgICAgICAgICAgZmlsbENvbG9yOiAgZXZlbnRUeXBlID09PSAnR3JvdXAnID8gXCIjNDBEN0Q0XCIgOiBcIiMwRjgxRThcIixcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiBcIndoaXRlXCIsXG4gICAgICAgICAgICAgICAgICB3ZWlnaHQ6IDIsXG4gICAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLjUsXG4gICAgICAgICAgICAgICAgICBmaWxsT3BhY2l0eTogMC44LFxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAoZXZlbnRUeXBlID09PSAnR3JvdXAnID8gJ2dyb3VwcycgOiAnZXZlbnRzJykgKyAnIGV2ZW50LWl0ZW0tcG9wdXAnXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJldHVybiBMLmNpcmNsZU1hcmtlcihsYXRsbmcsIGdlb2pzb25NYXJrZXJPcHRpb25zKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICBvbkVhY2hGZWF0dXJlOiAoZmVhdHVyZSwgbGF5ZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChmZWF0dXJlLnByb3BlcnRpZXMgJiYgZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCkge1xuICAgICAgICAgICAgICBsYXllci5iaW5kUG9wdXAoZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgICB9LFxuICAgICAgdXBkYXRlOiAocCkgPT4ge1xuICAgICAgICBpZiAoIXAgfHwgIXAubGF0IHx8ICFwLmxuZyApIHJldHVybjtcblxuICAgICAgICBtYXAuc2V0VmlldyhMLmxhdExuZyhwLmxhdCwgcC5sbmcpLCAxMCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsImNvbnN0IFF1ZXJ5TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldEZvcm0gPSBcImZvcm0jZmlsdGVycy1mb3JtXCIpID0+IHtcbiAgICBjb25zdCAkdGFyZ2V0ID0gdHlwZW9mIHRhcmdldEZvcm0gPT09ICdzdHJpbmcnID8gJCh0YXJnZXRGb3JtKSA6IHRhcmdldEZvcm07XG4gICAgbGV0IGxhdCA9IG51bGw7XG4gICAgbGV0IGxuZyA9IG51bGw7XG5cbiAgICBsZXQgcHJldmlvdXMgPSB7fTtcblxuICAgICR0YXJnZXQub24oJ3N1Ym1pdCcsIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBsYXQgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKCk7XG4gICAgICBsbmcgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKCk7XG5cbiAgICAgIHZhciBmb3JtID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuXG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICQucGFyYW0oZm9ybSk7XG4gICAgfSlcblxuICAgICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdJywgKCkgPT4ge1xuICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICB9KVxuXG5cbiAgICByZXR1cm4ge1xuICAgICAgaW5pdGlhbGl6ZTogKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdmFyIHBhcmFtcyA9ICQuZGVwYXJhbSh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkpXG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYW5nXVwiKS52YWwocGFyYW1zLmxhbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwocGFyYW1zLmxhdCk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChwYXJhbXMubG5nKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKHBhcmFtcy5ib3VuZDEpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwocGFyYW1zLmJvdW5kMik7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sb2NdXCIpLnZhbChwYXJhbXMubG9jKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWtleV1cIikudmFsKHBhcmFtcy5rZXkpO1xuXG4gICAgICAgICAgaWYgKHBhcmFtcy5maWx0ZXIpIHtcbiAgICAgICAgICAgICR0YXJnZXQuZmluZChcIi5maWx0ZXItaXRlbSBpbnB1dFt0eXBlPWNoZWNrYm94XVwiKS5yZW1vdmVQcm9wKFwiY2hlY2tlZFwiKTtcbiAgICAgICAgICAgIHBhcmFtcy5maWx0ZXIuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdW3ZhbHVlPSdcIiArIGl0ZW0gKyBcIiddXCIpLnByb3AoXCJjaGVja2VkXCIsIHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBnZXRQYXJhbWV0ZXJzOiAoKSA9PiB7XG4gICAgICAgIHZhciBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuICAgICAgICAvLyBwYXJhbWV0ZXJzWydsb2NhdGlvbiddIDtcblxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBwYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgaWYgKCAhcGFyYW1ldGVyc1trZXldIHx8IHBhcmFtZXRlcnNba2V5XSA9PSBcIlwiKSB7XG4gICAgICAgICAgICBkZWxldGUgcGFyYW1ldGVyc1trZXldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJhbWV0ZXJzO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZUxvY2F0aW9uOiAobGF0LCBsbmcpID0+IHtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChsYXQpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKGxuZyk7XG4gICAgICAgIC8vICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlVmlld3BvcnQ6ICh2aWV3cG9ydCkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtbdmlld3BvcnQuZi5iLCB2aWV3cG9ydC5iLmJdLCBbdmlld3BvcnQuZi5mLCB2aWV3cG9ydC5iLmZdXTtcblxuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1swXSkpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1sxXSkpO1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZVZpZXdwb3J0QnlCb3VuZDogKHN3LCBuZSkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtzdywgbmVdOy8vLy8vLy8vXG5cbiAgICAgICAgY29uc29sZS5sb2coYm91bmRzKTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMF0pKTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMV0pKTtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyU3VibWl0OiAoKSA9PiB7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59KShqUXVlcnkpO1xuIiwibGV0IGF1dG9jb21wbGV0ZU1hbmFnZXI7XG5sZXQgbWFwTWFuYWdlcjtcblxuKGZ1bmN0aW9uKCQpIHtcblxuICAvLyAxLiBnb29nbGUgbWFwcyBnZW9jb2RlXG5cbiAgLy8gMi4gZm9jdXMgbWFwIG9uIGdlb2NvZGUgKHZpYSBsYXQvbG5nKVxuICBjb25zdCBxdWVyeU1hbmFnZXIgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICAgICAgcXVlcnlNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICBjb25zdCBpbml0UGFyYW1zID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcbiAgbWFwTWFuYWdlciA9IE1hcE1hbmFnZXIoe1xuICAgIG9uTW92ZTogKHN3LCBuZSkgPT4ge1xuICAgICAgLy8gV2hlbiB0aGUgbWFwIG1vdmVzIGFyb3VuZCwgd2UgdXBkYXRlIHRoZSBsaXN0XG4gICAgICBxdWVyeU1hbmFnZXIudXBkYXRlVmlld3BvcnRCeUJvdW5kKHN3LCBuZSk7XG4gICAgICAvL3VwZGF0ZSBRdWVyeVxuICAgIH1cbiAgfSk7XG4vL2NvbnNvbGUubG9nKFwiSW5pdGlhbGl6ZWRcIik7XG4gIHdpbmRvdy5pbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2sgPSAoKSA9PiB7XG4vL2NvbnNvbGUubG9nKFwiSW5pdGlhbGl6ZWRcIik7XG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlciA9IEF1dG9jb21wbGV0ZU1hbmFnZXIoXCJpbnB1dFtuYW1lPSdsb2MnXVwiKTtcbiAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmluaXRpYWxpemUoKTtcbi8vY29uc29sZS5sb2coXCJJbml0aWFsaXplZFwiKTtcbiAgICBpZiAoaW5pdFBhcmFtcy5sb2MgJiYgaW5pdFBhcmFtcy5sb2MgIT09ICcnICYmICghaW5pdFBhcmFtcy5ib3VuZDEgJiYgIWluaXRQYXJhbXMuYm91bmQyKSkge1xuICAgICAgbWFwTWFuYWdlci5pbml0aWFsaXplKCgpID0+IHtcbiAgICAgICAgbWFwTWFuYWdlci5nZXRDZW50ZXJCeUxvY2F0aW9uKGluaXRQYXJhbXMubG9jLCAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgcXVlcnlNYW5hZ2VyLnVwZGF0ZVZpZXdwb3J0KHJlc3VsdC5nZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICB9XG4gIH1cbi8vY29uc29sZS5sb2coXCJNQVAgXCIsIG1hcE1hbmFnZXIpO1xuXG4gIGNvbnN0IGxhbmd1YWdlTWFuYWdlciA9IExhbmd1YWdlTWFuYWdlcigpO1xuLy9jb25zb2xlLmxvZyhxdWVyeU1hbmFnZXIsIHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCksIGluaXRQYXJhbXMpO1xuICBsYW5ndWFnZU1hbmFnZXIuaW5pdGlhbGl6ZShpbml0UGFyYW1zWydsYW5nJ10gfHwgJ2VuJyk7XG5cbiAgY29uc3QgbGlzdE1hbmFnZXIgPSBMaXN0TWFuYWdlcigpO1xuXG4gIGlmKGluaXRQYXJhbXMubGF0ICYmIGluaXRQYXJhbXMubG5nKSB7XG4gICAgbWFwTWFuYWdlci5zZXRDZW50ZXIoW2luaXRQYXJhbXMubGF0LCBpbml0UGFyYW1zLmxuZ10pO1xuICB9XG5cbiAgLyoqKlxuICAqIExpc3QgRXZlbnRzXG4gICogVGhpcyB3aWxsIHRyaWdnZXIgdGhlIGxpc3QgdXBkYXRlIG1ldGhvZFxuICAqL1xuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnBvcHVsYXRlTGlzdChvcHRpb25zLnBhcmFtcyk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnVwZGF0ZUZpbHRlcihvcHRpb25zKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMuYm91bmQxIHx8ICFvcHRpb25zLmJvdW5kMikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgdmFyIGJvdW5kMiA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDIpO1xuXG4gICAgbGlzdE1hbmFnZXIudXBkYXRlQm91bmRzKGJvdW5kMSwgYm91bmQyKVxuICB9KVxuXG4gIC8qKipcbiAgKiBNYXAgRXZlbnRzXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICAvLyBtYXBNYW5hZ2VyLnNldENlbnRlcihbb3B0aW9ucy5sYXQsIG9wdGlvbnMubG5nXSk7XG4gICAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLmJvdW5kMSB8fCAhb3B0aW9ucy5ib3VuZDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgdmFyIGJvdW5kMiA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDIpO1xuICAgIG1hcE1hbmFnZXIuc2V0Qm91bmRzKGJvdW5kMSwgYm91bmQyKTtcbiAgICAvLyBjb25zb2xlLmxvZyhvcHRpb25zKVxuICB9KTtcbiAgLy8gMy4gbWFya2VycyBvbiBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXBsb3QnLCAoZSwgb3B0KSA9PiB7XG4vL2NvbnNvbGUubG9nKG9wdCk7XG4gICAgbWFwTWFuYWdlci5wbG90UG9pbnRzKG9wdC5kYXRhLCBvcHQucGFyYW1zKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInKTtcbiAgfSlcblxuICAvLyBGaWx0ZXIgbWFwXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCAoZSwgb3B0KSA9PiB7XG4gICAgaWYgKG9wdCkge1xuICAgICAgbWFwTWFuYWdlci5maWx0ZXJNYXAob3B0LmZpbHRlcik7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sYW5ndWFnZS11cGRhdGUnLCAoZSwgb3B0KSA9PiB7XG4gICAgaWYgKG9wdCkge1xuICAgICAgbGFuZ3VhZ2VNYW5hZ2VyLnVwZGF0ZUxhbmd1YWdlKG9wdC5sYW5nKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24jc2hvdy1oaWRlLW1hcCcsIChlLCBvcHQpID0+IHtcbiAgICAkKCdib2R5JykudG9nZ2xlQ2xhc3MoJ21hcC12aWV3JylcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbi5idG4ubW9yZS1pdGVtcycsIChlLCBvcHQpID0+IHtcbiAgICAkKCcjZW1iZWQtYXJlYScpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgKGUsIG9wdCkgPT4ge1xuICAgIC8vdXBkYXRlIGVtYmVkIGxpbmVcbiAgICB2YXIgY29weSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3B0KSk7XG4gICAgZGVsZXRlIGNvcHlbJ2xuZyddO1xuICAgIGRlbGV0ZSBjb3B5WydsYXQnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQxJ107XG4gICAgZGVsZXRlIGNvcHlbJ2JvdW5kMiddO1xuXG4gICAgJCgnI2VtYmVkLWFyZWEgaW5wdXRbbmFtZT1lbWJlZF0nKS52YWwoJ2h0dHA6Ly9tYXAuMzUwLm9yZy5zMy13ZWJzaXRlLXVzLWVhc3QtMS5hbWF6b25hd3MuY29tIycgKyAkLnBhcmFtKGNvcHkpKTtcbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKFwiaGFzaGNoYW5nZVwiLCAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgaWYgKGhhc2gubGVuZ3RoID09IDApIHJldHVybjtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKGhhc2guc3Vic3RyaW5nKDEpKTtcbiAgICBjb25zdCBvbGRVUkwgPSBldmVudC5vcmlnaW5hbEV2ZW50Lm9sZFVSTDtcblxuXG4gICAgY29uc3Qgb2xkSGFzaCA9ICQuZGVwYXJhbShvbGRVUkwuc3Vic3RyaW5nKG9sZFVSTC5zZWFyY2goXCIjXCIpKzEpKTtcblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcblxuICAgIC8vIFNvIHRoYXQgY2hhbmdlIGluIGZpbHRlcnMgd2lsbCBub3QgdXBkYXRlIHRoaXNcbiAgICBpZiAob2xkSGFzaC5ib3VuZDEgIT09IHBhcmFtZXRlcnMuYm91bmQxIHx8IG9sZEhhc2guYm91bmQyICE9PSBwYXJhbWV0ZXJzLmJvdW5kMikge1xuXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG5cbiAgICAvLyBDaGFuZ2UgaXRlbXNcbiAgICBpZiAob2xkSGFzaC5sYW5nICE9PSBwYXJhbWV0ZXJzLmxhbmcpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgfVxuICB9KVxuXG4gIC8vIDQuIGZpbHRlciBvdXQgaXRlbXMgaW4gYWN0aXZpdHktYXJlYVxuXG4gIC8vIDUuIGdldCBtYXAgZWxlbWVudHNcblxuICAvLyA2LiBnZXQgR3JvdXAgZGF0YVxuXG4gIC8vIDcuIHByZXNlbnQgZ3JvdXAgZWxlbWVudHNcblxuICAkLmFqYXgoe1xuICAgIHVybDogJ2h0dHBzOi8vczMtdXMtd2VzdC0yLmFtYXpvbmF3cy5jb20vcHBsc21hcC1kYXRhL291dHB1dC8zNTBvcmctdGVzdC5qcy5neicsIC8vJ3wqKkRBVEFfU09VUkNFKip8JyxcbiAgICBkYXRhVHlwZTogJ3NjcmlwdCcsXG4gICAgY2FjaGU6IHRydWUsXG4gICAgc3VjY2VzczogKGRhdGEpID0+IHtcbiAgICAgIHZhciBwYXJhbWV0ZXJzID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuICAgICAgd2luZG93LkVWRU5UU19EQVRBLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgaXRlbVsnZXZlbnRfdHlwZSddID0gIWl0ZW0uZXZlbnRfdHlwZSA/ICdBY3Rpb24nIDogaXRlbS5ldmVudF90eXBlO1xuICAgICAgfSlcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC11cGRhdGUnLCB7IHBhcmFtczogcGFyYW1ldGVycyB9KTtcbiAgICAgIC8vICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1wbG90JywgeyBkYXRhOiB3aW5kb3cuRVZFTlRTX0RBVEEsIHBhcmFtczogcGFyYW1ldGVycyB9KTtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgcGFyYW1ldGVycyk7XG4gICAgICAvL1RPRE86IE1ha2UgdGhlIGdlb2pzb24gY29udmVyc2lvbiBoYXBwZW4gb24gdGhlIGJhY2tlbmRcbiAgICB9XG4gIH0pO1xuXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIGxldCBwID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHApO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCBwKTtcbi8vY29uc29sZS5sb2cocXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKSlcbiAgfSwgMTAwKTtcblxufSkoalF1ZXJ5KTtcbiJdfQ==
