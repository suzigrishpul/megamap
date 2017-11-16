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

      var date = moment(item.start_datetime).format("dddd • MMM DD h:mma");
      return "\n      <li class='" + (item.event_type || '') + " Action' data-lat='" + item.lat + "' data-lng='" + item.lng + "'>\n        <div class=\"type-event type-action\">\n          <ul class=\"event-types-list\">\n            <li>" + item.event_type + "</li>\n          </ul>\n          <h2><a href=\"//" + item.url + "\" target='_blank'>" + item.title + "</a></h2>\n          <h4>" + date + "</h4>\n          <div class=\"address-area\">\n            <p>" + item.venue + "</p>\n          </div>\n          <div class=\"call-to-action\">\n            <a href=\"//" + item.url + "\" target='_blank' class=\"btn btn-primary\">RSVP</a>\n          </div>\n        </div>\n      </li>\n      ";
    };

    var renderGroup = function renderGroup(item) {

      return "\n      <li>\n        <div class=\"type-group\">\n          <h2><a href=\"/\" target='_blank'>" + (item.title || "Group") + "</a></h2>\n          <div class=\"group-details-area\">\n            <p>Colorado, USA</p>\n            <p>" + (item.details || "350 Colorado is working locally to help build the global\n               350.org movement to solve the climate crisis and transition\n               to a clean, renewable energy future.") + "\n            </p>\n          </div>\n          <div class=\"call-to-action\">\n            <a href=\"//" + item.url + "\" target='_blank' class=\"btn btn-primary\">Get Involved</a>\n          </div>\n        </div>\n      </li>\n      ";
    };

    return {
      $list: $target,
      updateFilter: function updateFilter(p) {
        if (!p) return;

        // Remove Filters

        $target.removeProp("class");
        $target.addClass(p.filter ? p.filter.join(" ") : '');
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
    var date = moment(item.start_datetime).format("dddd • MMM DD h:mma");
    return '\n    <div class=\'popup-item ' + item.event_type + '\' data-lat=\'' + item.lat + '\' data-lng=\'' + item.lng + '\'>\n      <div class="type-event">\n        <ul class="event-types-list">\n          <li>' + (item.event_type || 'Action') + '</li>\n        </ul>\n        <h2><a href="//' + item.url + '" target=\'_blank\'>' + item.title + '</a></h2>\n        <h4>' + date + '</h4>\n        <div class="address-area">\n          <p>' + item.venue + '</p>\n        </div>\n        <div class="call-to-action">\n          <a href="//' + item.url + '" target=\'_blank\' class="btn btn-primary">RSVP</a>\n        </div>\n      </div>\n    </div>\n    ';
  };

  var renderGroup = function renderGroup(item) {
    return '\n    <div class=\'popup-item ' + item.event_type + '\' data-lat=\'' + item.lat + '\' data-lng=\'' + item.lng + '\'>\n      <div class="type-group">\n        <h2><a href="/" target=\'_blank\'>' + (item.title || 'Group') + '</a></h2>\n        <div class="group-details-area">\n          <p>Colorado, USA</p>\n          <p>' + (item.details || '350 Colorado is working locally to help build the global\n             350.org movement to solve the climate crisis and transition\n             to a clean, renewable energy future.') + '\n          </p>\n        </div>\n        <div class="call-to-action">\n          <a href="//' + item.url + '" target=\'_blank\' class="btn btn-primary">Get Involved</a>\n        </div>\n      </div>\n    </div>\n    ';
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

  return function (callback) {
    var map = L.map('map').setView([34.88593094075317, 5.097656250000001], 2);

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
  mapManager = MapManager();
  //console.log("Initialized");
  window.initializeAutocompleteCallback = function () {
    //console.log("Initialized");
    autocompleteManager = AutocompleteManager("input[name='loc']");
    autocompleteManager.initialize();
    //console.log("Initialized");
    if (initParams.loc && initParams.loc !== '') {
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
    $(document).trigger('trigger-list-filter-update', queryManager.getParameters());
    $(document).trigger('trigger-map-update', queryManager.getParameters());
    //console.log(queryManager.getParameters())
  }, 100);
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9sYW5ndWFnZS5qcyIsImNsYXNzZXMvbGlzdC5qcyIsImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9xdWVyeS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJBdXRvY29tcGxldGVNYW5hZ2VyIiwiJCIsInRhcmdldCIsIkFQSV9LRVkiLCJ0YXJnZXRJdGVtIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwicXVlcnlNZ3IiLCJRdWVyeU1hbmFnZXIiLCJnZW9jb2RlciIsImdvb2dsZSIsIm1hcHMiLCJHZW9jb2RlciIsIiR0YXJnZXQiLCJpbml0aWFsaXplIiwidHlwZWFoZWFkIiwiaGludCIsImhpZ2hsaWdodCIsIm1pbkxlbmd0aCIsImNsYXNzTmFtZXMiLCJtZW51IiwibmFtZSIsImRpc3BsYXkiLCJpdGVtIiwiZm9ybWF0dGVkX2FkZHJlc3MiLCJsaW1pdCIsInNvdXJjZSIsInEiLCJzeW5jIiwiYXN5bmMiLCJnZW9jb2RlIiwiYWRkcmVzcyIsInJlc3VsdHMiLCJzdGF0dXMiLCJvbiIsIm9iaiIsImRhdHVtIiwiZ2VvbWV0cnkiLCJ1cGRhdGVWaWV3cG9ydCIsInZpZXdwb3J0IiwialF1ZXJ5IiwiTGFuZ3VhZ2VNYW5hZ2VyIiwibGFuZ3VhZ2UiLCJkaWN0aW9uYXJ5IiwiJHRhcmdldHMiLCJ1cGRhdGVQYWdlTGFuZ3VhZ2UiLCJ0YXJnZXRMYW5ndWFnZSIsInJvd3MiLCJmaWx0ZXIiLCJpIiwibGFuZyIsImVhY2giLCJpbmRleCIsInRhcmdldEF0dHJpYnV0ZSIsImRhdGEiLCJsYW5nVGFyZ2V0IiwidGV4dCIsInZhbCIsImF0dHIiLCJ0YXJnZXRzIiwiYWpheCIsInVybCIsImRhdGFUeXBlIiwic3VjY2VzcyIsInVwZGF0ZUxhbmd1YWdlIiwiTGlzdE1hbmFnZXIiLCJ0YXJnZXRMaXN0IiwicmVuZGVyRXZlbnQiLCJkYXRlIiwibW9tZW50Iiwic3RhcnRfZGF0ZXRpbWUiLCJmb3JtYXQiLCJldmVudF90eXBlIiwibGF0IiwibG5nIiwidGl0bGUiLCJ2ZW51ZSIsInJlbmRlckdyb3VwIiwiZGV0YWlscyIsIiRsaXN0IiwidXBkYXRlRmlsdGVyIiwicCIsInJlbW92ZVByb3AiLCJhZGRDbGFzcyIsImpvaW4iLCJwb3B1bGF0ZUxpc3QiLCJoYXJkRmlsdGVycyIsImtleVNldCIsImtleSIsInNwbGl0IiwiJGV2ZW50TGlzdCIsIndpbmRvdyIsIkVWRU5UU19EQVRBIiwibWFwIiwibGVuZ3RoIiwiaW5jbHVkZXMiLCJmaW5kIiwicmVtb3ZlIiwiYXBwZW5kIiwiTWFwTWFuYWdlciIsInJlbmRlckdlb2pzb24iLCJsaXN0IiwicmVuZGVyZWQiLCJ0b0xvd2VyQ2FzZSIsInR5cGUiLCJjb29yZGluYXRlcyIsInByb3BlcnRpZXMiLCJldmVudFByb3BlcnRpZXMiLCJwb3B1cENvbnRlbnQiLCJjYWxsYmFjayIsIkwiLCJzZXRWaWV3IiwidGlsZUxheWVyIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsIiRtYXAiLCJzZXRCb3VuZHMiLCJib3VuZHMxIiwiYm91bmRzMiIsImJvdW5kcyIsImZpdEJvdW5kcyIsInNldENlbnRlciIsImNlbnRlciIsInpvb20iLCJnZXRDZW50ZXJCeUxvY2F0aW9uIiwibG9jYXRpb24iLCJmaWx0ZXJNYXAiLCJmaWx0ZXJzIiwiaGlkZSIsImZvckVhY2giLCJzaG93IiwicGxvdFBvaW50cyIsImNvbnNvbGUiLCJsb2ciLCJnZW9qc29uIiwiZmVhdHVyZXMiLCJnZW9KU09OIiwicG9pbnRUb0xheWVyIiwiZmVhdHVyZSIsImxhdGxuZyIsImV2ZW50VHlwZSIsImdlb2pzb25NYXJrZXJPcHRpb25zIiwicmFkaXVzIiwiZmlsbENvbG9yIiwiY29sb3IiLCJ3ZWlnaHQiLCJvcGFjaXR5IiwiZmlsbE9wYWNpdHkiLCJjbGFzc05hbWUiLCJjaXJjbGVNYXJrZXIiLCJvbkVhY2hGZWF0dXJlIiwibGF5ZXIiLCJiaW5kUG9wdXAiLCJ1cGRhdGUiLCJsYXRMbmciLCJ0YXJnZXRGb3JtIiwicHJldmlvdXMiLCJlIiwicHJldmVudERlZmF1bHQiLCJmb3JtIiwiZGVwYXJhbSIsInNlcmlhbGl6ZSIsImhhc2giLCJwYXJhbSIsInRyaWdnZXIiLCJwYXJhbXMiLCJzdWJzdHJpbmciLCJib3VuZDEiLCJib3VuZDIiLCJsb2MiLCJwcm9wIiwiZ2V0UGFyYW1ldGVycyIsInBhcmFtZXRlcnMiLCJ1cGRhdGVMb2NhdGlvbiIsImYiLCJiIiwiSlNPTiIsInN0cmluZ2lmeSIsInRyaWdnZXJTdWJtaXQiLCJhdXRvY29tcGxldGVNYW5hZ2VyIiwibWFwTWFuYWdlciIsInF1ZXJ5TWFuYWdlciIsImluaXRQYXJhbXMiLCJpbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2siLCJyZXN1bHQiLCJsYW5ndWFnZU1hbmFnZXIiLCJsaXN0TWFuYWdlciIsImV2ZW50Iiwib3B0aW9ucyIsInBhcnNlIiwib3B0IiwidG9nZ2xlQ2xhc3MiLCJjb3B5Iiwib2xkVVJMIiwib3JpZ2luYWxFdmVudCIsIm9sZEhhc2giLCJzZWFyY2giLCJjYWNoZSIsInNldFRpbWVvdXQiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7O0FBQ0EsSUFBTUEsc0JBQXVCLFVBQVNDLENBQVQsRUFBWTtBQUN2Qzs7QUFFQSxTQUFPLFVBQUNDLE1BQUQsRUFBWTs7QUFFakIsUUFBTUMsVUFBVSx5Q0FBaEI7QUFDQSxRQUFNQyxhQUFhLE9BQU9GLE1BQVAsSUFBaUIsUUFBakIsR0FBNEJHLFNBQVNDLGFBQVQsQ0FBdUJKLE1BQXZCLENBQTVCLEdBQTZEQSxNQUFoRjtBQUNBLFFBQU1LLFdBQVdDLGNBQWpCO0FBQ0EsUUFBSUMsV0FBVyxJQUFJQyxPQUFPQyxJQUFQLENBQVlDLFFBQWhCLEVBQWY7O0FBRUEsV0FBTztBQUNMQyxlQUFTWixFQUFFRyxVQUFGLENBREo7QUFFTEYsY0FBUUUsVUFGSDtBQUdMVSxrQkFBWSxzQkFBTTtBQUNoQmIsVUFBRUcsVUFBRixFQUFjVyxTQUFkLENBQXdCO0FBQ1pDLGdCQUFNLElBRE07QUFFWkMscUJBQVcs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QUYsRUFBWStKLE9BQVosQ0FBb0Isc0JBQXBCLEVBQTRDUSxVQUE1QztBQUNBO0FBQ0Q7QUFmSSxHQUFQOztBQWtCQTBCLGFBQVcsWUFBTTtBQUNmck0sTUFBRUksUUFBRixFQUFZK0osT0FBWixDQUFvQiw0QkFBcEIsRUFBa0RpQixhQUFhVixhQUFiLEVBQWxEO0FBQ0ExSyxNQUFFSSxRQUFGLEVBQVkrSixPQUFaLENBQW9CLG9CQUFwQixFQUEwQ2lCLGFBQWFWLGFBQWIsRUFBMUM7QUFDSjtBQUNHLEdBSkQsRUFJRyxHQUpIO0FBTUQsQ0E5SkQsRUE4SkduSSxNQTlKSCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbi8vQVBJIDpBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cbmNvbnN0IEF1dG9jb21wbGV0ZU1hbmFnZXIgPSAoZnVuY3Rpb24oJCkge1xuICAvL0luaXRpYWxpemF0aW9uLi4uXG5cbiAgcmV0dXJuICh0YXJnZXQpID0+IHtcblxuICAgIGNvbnN0IEFQSV9LRVkgPSBcIkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVwiO1xuICAgIGNvbnN0IHRhcmdldEl0ZW0gPSB0eXBlb2YgdGFyZ2V0ID09IFwic3RyaW5nXCIgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCkgOiB0YXJnZXQ7XG4gICAgY29uc3QgcXVlcnlNZ3IgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICB2YXIgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcblxuICAgIHJldHVybiB7XG4gICAgICAkdGFyZ2V0OiAkKHRhcmdldEl0ZW0pLFxuICAgICAgdGFyZ2V0OiB0YXJnZXRJdGVtLFxuICAgICAgaW5pdGlhbGl6ZTogKCkgPT4ge1xuICAgICAgICAkKHRhcmdldEl0ZW0pLnR5cGVhaGVhZCh7XG4gICAgICAgICAgICAgICAgICAgIGhpbnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWluTGVuZ3RoOiA0LFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgbWVudTogJ3R0LWRyb3Bkb3duLW1lbnUnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdzZWFyY2gtcmVzdWx0cycsXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IChpdGVtKSA9PiBpdGVtLmZvcm1hdHRlZF9hZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgICBsaW1pdDogMTAsXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogZnVuY3Rpb24gKHEsIHN5bmMsIGFzeW5jKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBxIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXN5bmMocmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICkub24oJ3R5cGVhaGVhZDpzZWxlY3RlZCcsIGZ1bmN0aW9uIChvYmosIGRhdHVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGRhdHVtKVxuICAgICAgICAgICAgICAgICAgICB7XG5cbiAgICAgICAgICAgICAgICAgICAgICB2YXIgZ2VvbWV0cnkgPSBkYXR1bS5nZW9tZXRyeTtcbiAgICAgICAgICAgICAgICAgICAgICBxdWVyeU1nci51cGRhdGVWaWV3cG9ydChnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gIG1hcC5maXRCb3VuZHMoZ2VvbWV0cnkuYm91bmRzPyBnZW9tZXRyeS5ib3VuZHMgOiBnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cblxuXG4gICAgcmV0dXJuIHtcblxuICAgIH1cbiAgfVxuXG59KGpRdWVyeSkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBMYW5ndWFnZU1hbmFnZXIgPSAoKCQpID0+IHtcbiAgLy9rZXlWYWx1ZVxuXG4gIC8vdGFyZ2V0cyBhcmUgdGhlIG1hcHBpbmdzIGZvciB0aGUgbGFuZ3VhZ2VcbiAgcmV0dXJuICgpID0+IHtcbiAgICBsZXQgbGFuZ3VhZ2U7XG4gICAgbGV0IGRpY3Rpb25hcnkgPSB7fTtcbiAgICBsZXQgJHRhcmdldHMgPSAkKFwiW2RhdGEtbGFuZy10YXJnZXRdW2RhdGEtbGFuZy1rZXldXCIpO1xuXG4gICAgY29uc3QgdXBkYXRlUGFnZUxhbmd1YWdlID0gKCkgPT4ge1xuXG4gICAgICBsZXQgdGFyZ2V0TGFuZ3VhZ2UgPSBkaWN0aW9uYXJ5LnJvd3MuZmlsdGVyKChpKSA9PiBpLmxhbmcgPT09IGxhbmd1YWdlKVswXTtcblxuICAgICAgJHRhcmdldHMuZWFjaCgoaW5kZXgsIGl0ZW0pID0+IHtcbiAgICAgICAgbGV0IHRhcmdldEF0dHJpYnV0ZSA9ICQoaXRlbSkuZGF0YSgnbGFuZy10YXJnZXQnKTtcbiAgICAgICAgbGV0IGxhbmdUYXJnZXQgPSAkKGl0ZW0pLmRhdGEoJ2xhbmcta2V5Jyk7XG5cbiAgICAgICAgc3dpdGNoKHRhcmdldEF0dHJpYnV0ZSkge1xuICAgICAgICAgIGNhc2UgJ3RleHQnOlxuICAgICAgICAgICAgJChpdGVtKS50ZXh0KHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3ZhbHVlJzpcbiAgICAgICAgICAgICQoaXRlbSkudmFsKHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAkKGl0ZW0pLmF0dHIodGFyZ2V0QXR0cmlidXRlLCB0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGxhbmd1YWdlLFxuICAgICAgdGFyZ2V0czogJHRhcmdldHMsXG4gICAgICBkaWN0aW9uYXJ5LFxuICAgICAgaW5pdGlhbGl6ZTogKGxhbmcpID0+IHtcbi8vY29uc29sZS5sb2coXCIkdGFyZ2V0c1wiLCBsYW5nKTtcbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICB1cmw6ICdodHRwOi8vZ3N4Mmpzb24uY29tL2FwaT9pZD0xTzNlQnlqTDF2bFlmN1o3YW0tX2h0UlRRaTczUGFmcUlmTkJkTG1YZThTTSZzaGVldD0xJyxcbiAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICBkaWN0aW9uYXJ5ID0gZGF0YTtcbiAgICAgICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTGFuZ3VhZ2U6IChsYW5nKSA9PiB7XG4vL2NvbnNvbGUubG9nKFwiTmV3IExhbmcgOjo6IFwiLCBsYW5nKTtcbiAgICAgICAgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbn0pKGpRdWVyeSk7XG4iLCIvKiBUaGlzIGxvYWRzIGFuZCBtYW5hZ2VzIHRoZSBsaXN0ISAqL1xuXG5jb25zdCBMaXN0TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldExpc3QgPSBcIiNldmVudHMtbGlzdFwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRMaXN0ID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0TGlzdCkgOiB0YXJnZXRMaXN0O1xuXG4gICAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSkgPT4ge1xuXG4gICAgICB2YXIgZGF0ZSA9IG1vbWVudChpdGVtLnN0YXJ0X2RhdGV0aW1lKS5mb3JtYXQoXCJkZGRkIOKAoiBNTU0gREQgaDptbWFcIik7XG4gICAgICByZXR1cm4gYFxuICAgICAgPGxpIGNsYXNzPScke2l0ZW0uZXZlbnRfdHlwZSB8fCAnJ30gQWN0aW9uJyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50IHR5cGUtYWN0aW9uXCI+XG4gICAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgICAgPGxpPiR7aXRlbS5ldmVudF90eXBlfTwvbGk+XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICAgIDxoND4ke2RhdGV9PC9oND5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5SU1ZQPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIGNvbnN0IHJlbmRlckdyb3VwID0gKGl0ZW0pID0+IHtcblxuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaT5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXBcIj5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIi9cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlIHx8IGBHcm91cGB9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgICAgPHA+Q29sb3JhZG8sIFVTQTwvcD5cbiAgICAgICAgICAgIDxwPiR7aXRlbS5kZXRhaWxzIHx8IGAzNTAgQ29sb3JhZG8gaXMgd29ya2luZyBsb2NhbGx5IHRvIGhlbHAgYnVpbGQgdGhlIGdsb2JhbFxuICAgICAgICAgICAgICAgMzUwLm9yZyBtb3ZlbWVudCB0byBzb2x2ZSB0aGUgY2xpbWF0ZSBjcmlzaXMgYW5kIHRyYW5zaXRpb25cbiAgICAgICAgICAgICAgIHRvIGEgY2xlYW4sIHJlbmV3YWJsZSBlbmVyZ3kgZnV0dXJlLmB9XG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiLy8ke2l0ZW0udXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPkdldCBJbnZvbHZlZDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICAgYFxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgJGxpc3Q6ICR0YXJnZXQsXG4gICAgICB1cGRhdGVGaWx0ZXI6IChwKSA9PiB7XG4gICAgICAgIGlmKCFwKSByZXR1cm47XG5cbiAgICAgICAgLy8gUmVtb3ZlIEZpbHRlcnNcblxuICAgICAgICAkdGFyZ2V0LnJlbW92ZVByb3AoXCJjbGFzc1wiKTtcbiAgICAgICAgJHRhcmdldC5hZGRDbGFzcyhwLmZpbHRlciA/IHAuZmlsdGVyLmpvaW4oXCIgXCIpIDogJycpXG4gICAgICB9LFxuICAgICAgcG9wdWxhdGVMaXN0OiAoaGFyZEZpbHRlcnMpID0+IHtcbiAgICAgICAgLy91c2luZyB3aW5kb3cuRVZFTlRfREFUQVxuICAgICAgICBjb25zdCBrZXlTZXQgPSAhaGFyZEZpbHRlcnMua2V5ID8gW10gOiBoYXJkRmlsdGVycy5rZXkuc3BsaXQoJywnKTtcblxuICAgICAgICB2YXIgJGV2ZW50TGlzdCA9IHdpbmRvdy5FVkVOVFNfREFUQS5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgaWYgKGtleVNldC5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0uZXZlbnRfdHlwZSAhPT0gJ0dyb3VwJyA/IHJlbmRlckV2ZW50KGl0ZW0pIDogcmVuZGVyR3JvdXAoaXRlbSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXlTZXQubGVuZ3RoID4gMCAmJiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5ldmVudF90eXBlKSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0uZXZlbnRfdHlwZSAhPT0gJ0dyb3VwJyA/IHJlbmRlckV2ZW50KGl0ZW0pIDogcmVuZGVyR3JvdXAoaXRlbSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgfSlcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCBsaScpLnJlbW92ZSgpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsJykuYXBwZW5kKCRldmVudExpc3QpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJcbmNvbnN0IE1hcE1hbmFnZXIgPSAoKCQpID0+IHtcblxuICBjb25zdCByZW5kZXJFdmVudCA9IChpdGVtKSA9PiB7XG4gICAgdmFyIGRhdGUgPSBtb21lbnQoaXRlbS5zdGFydF9kYXRldGltZSkuZm9ybWF0KFwiZGRkZCDigKIgTU1NIEREIGg6bW1hXCIpO1xuICAgIHJldHVybiBgXG4gICAgPGRpdiBjbGFzcz0ncG9wdXAtaXRlbSAke2l0ZW0uZXZlbnRfdHlwZX0nIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGk+JHtpdGVtLmV2ZW50X3R5cGUgfHwgJ0FjdGlvbid9PC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPGgyPjxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZX08L2E+PC9oMj5cbiAgICAgICAgPGg0PiR7ZGF0ZX08L2g0PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgPHA+JHtpdGVtLnZlbnVlfTwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgIDxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCI+UlNWUDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSkgPT4ge1xuICAgIHJldHVybiBgXG4gICAgPGRpdiBjbGFzcz0ncG9wdXAtaXRlbSAke2l0ZW0uZXZlbnRfdHlwZX0nIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwXCI+XG4gICAgICAgIDxoMj48YSBocmVmPVwiL1wiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGUgfHwgYEdyb3VwYH08L2E+PC9oMj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgIDxwPkNvbG9yYWRvLCBVU0E8L3A+XG4gICAgICAgICAgPHA+JHtpdGVtLmRldGFpbHMgfHwgYDM1MCBDb2xvcmFkbyBpcyB3b3JraW5nIGxvY2FsbHkgdG8gaGVscCBidWlsZCB0aGUgZ2xvYmFsXG4gICAgICAgICAgICAgMzUwLm9yZyBtb3ZlbWVudCB0byBzb2x2ZSB0aGUgY2xpbWF0ZSBjcmlzaXMgYW5kIHRyYW5zaXRpb25cbiAgICAgICAgICAgICB0byBhIGNsZWFuLCByZW5ld2FibGUgZW5lcmd5IGZ1dHVyZS5gfVxuICAgICAgICAgIDwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgIDxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCI+R2V0IEludm9sdmVkPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICAgIGBcbiAgfTtcblxuICBjb25zdCByZW5kZXJHZW9qc29uID0gKGxpc3QpID0+IHtcbiAgICByZXR1cm4gbGlzdC5tYXAoKGl0ZW0pID0+IHtcbiAgICAgIC8vIHJlbmRlcmVkIGV2ZW50VHlwZVxuICAgICAgbGV0IHJlbmRlcmVkO1xuICAgICAgaWYgKCFpdGVtLmV2ZW50X3R5cGUgfHwgIWl0ZW0uZXZlbnRfdHlwZS50b0xvd2VyQ2FzZSgpICE9PSAnZ3JvdXAnKSB7XG4gICAgICAgIHJlbmRlcmVkID0gcmVuZGVyRXZlbnQoaXRlbSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZW5kZXJlZCA9IHJlbmRlckdyb3VwKGl0ZW0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICAgIGdlb21ldHJ5OiB7XG4gICAgICAgICAgdHlwZTogXCJQb2ludFwiLFxuICAgICAgICAgIGNvb3JkaW5hdGVzOiBbaXRlbS5sbmcsIGl0ZW0ubGF0XVxuICAgICAgICB9LFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgZXZlbnRQcm9wZXJ0aWVzOiBpdGVtLFxuICAgICAgICAgIHBvcHVwQ29udGVudDogcmVuZGVyZWRcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gKGNhbGxiYWNrKSA9PiB7XG4gICAgdmFyIG1hcCA9IEwubWFwKCdtYXAnKS5zZXRWaWV3KFszNC44ODU5MzA5NDA3NTMxNywgNS4wOTc2NTYyNTAwMDAwMDFdLCAyKTtcblxuICAgIEwudGlsZUxheWVyKCdodHRwOi8ve3N9LnRpbGUub3NtLm9yZy97en0ve3h9L3t5fS5wbmcnLCB7XG4gICAgICAgIGF0dHJpYnV0aW9uOiAnJmNvcHk7IDxhIGhyZWY9XCJodHRwOi8vb3NtLm9yZy9jb3B5cmlnaHRcIj5PcGVuU3RyZWV0TWFwPC9hPiBjb250cmlidXRvcnMg4oCiIDxhIGhyZWY9XCIvLzM1MC5vcmdcIj4zNTAub3JnPC9hPidcbiAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgbGV0IGdlb2NvZGVyID0gbnVsbDtcbiAgICByZXR1cm4ge1xuICAgICAgJG1hcDogbWFwLFxuICAgICAgaW5pdGlhbGl6ZTogKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG4gICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBzZXRCb3VuZHM6IChib3VuZHMxLCBib3VuZHMyKSA9PiB7XG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtib3VuZHMxLCBib3VuZHMyXTtcbiAgICAgICAgbWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuICAgICAgfSxcbiAgICAgIHNldENlbnRlcjogKGNlbnRlciwgem9vbSA9IDEwKSA9PiB7XG4gICAgICAgIGlmICghY2VudGVyIHx8ICFjZW50ZXJbMF0gfHwgY2VudGVyWzBdID09IFwiXCJcbiAgICAgICAgICAgICAgfHwgIWNlbnRlclsxXSB8fCBjZW50ZXJbMV0gPT0gXCJcIikgcmV0dXJuO1xuICAgICAgICBtYXAuc2V0VmlldyhjZW50ZXIsIHpvb20pO1xuICAgICAgfSxcbiAgICAgIC8vIENlbnRlciBsb2NhdGlvbiBieSBnZW9jb2RlZFxuICAgICAgZ2V0Q2VudGVyQnlMb2NhdGlvbjogKGxvY2F0aW9uLCBjYWxsYmFjaykgPT4ge1xuLy9jb25zb2xlLmxvZyhcIkZpbmRpbmcgbG9jYXRpb24gb2YgXCIsIGxvY2F0aW9uKTtcbiAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IGxvY2F0aW9uIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcbi8vY29uc29sZS5sb2coXCJMT0NBVElPTiBNQVRDSDo6IFwiLCByZXN1bHRzLCBzdGF0dXMpO1xuICAgICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlc3VsdHNbMF0pXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBmaWx0ZXJNYXA6IChmaWx0ZXJzKSA9PiB7XG4vL2NvbnNvbGUubG9nKFwiZmlsdGVycyA+PiBcIiwgZmlsdGVycyk7XG4gICAgICAgICQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cFwiKS5oaWRlKCk7XG4vL2NvbnNvbGUubG9nKCQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cFwiKSk7XG5cbiAgICAgICAgaWYgKCFmaWx0ZXJzKSByZXR1cm47XG5cbiAgICAgICAgZmlsdGVycy5mb3JFYWNoKChpdGVtKSA9PiB7XG4vL2NvbnNvbGUubG9nKFwiLmV2ZW50LWl0ZW0tcG9wdXAuXCIgKyBpdGVtLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICAgICQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cC5cIiArIGl0ZW0udG9Mb3dlckNhc2UoKSkuc2hvdygpO1xuICAgICAgICB9KVxuICAgICAgfSxcbiAgICAgIHBsb3RQb2ludHM6IChsaXN0LCBoYXJkRmlsdGVycykgPT4ge1xuXG4gICAgICAgIGNvbnN0IGtleVNldCA9ICFoYXJkRmlsdGVycy5rZXkgPyBbXSA6IGhhcmRGaWx0ZXJzLmtleS5zcGxpdCgnLCcpO1xuICAgICAgICBjb25zb2xlLmxvZyhrZXlTZXQsIGxpc3QpO1xuICAgICAgICBpZiAoa2V5U2V0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsaXN0ID0gbGlzdC5maWx0ZXIoKGl0ZW0pID0+IGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKVxuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGxpc3QpOztcblxuICAgICAgICBjb25zdCBnZW9qc29uID0ge1xuICAgICAgICAgIHR5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgICAgICAgICBmZWF0dXJlczogcmVuZGVyR2VvanNvbihsaXN0KVxuICAgICAgICB9O1xuXG5cblxuICAgICAgICBMLmdlb0pTT04oZ2VvanNvbiwge1xuICAgICAgICAgICAgcG9pbnRUb0xheWVyOiAoZmVhdHVyZSwgbGF0bG5nKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuZXZlbnRfdHlwZTtcbiAgICAgICAgICAgICAgdmFyIGdlb2pzb25NYXJrZXJPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgICAgcmFkaXVzOiA4LFxuICAgICAgICAgICAgICAgICAgZmlsbENvbG9yOiAgZXZlbnRUeXBlID09PSAnR3JvdXAnID8gXCIjNDBEN0Q0XCIgOiBcIiMwRjgxRThcIixcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiBcIndoaXRlXCIsXG4gICAgICAgICAgICAgICAgICB3ZWlnaHQ6IDIsXG4gICAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLjUsXG4gICAgICAgICAgICAgICAgICBmaWxsT3BhY2l0eTogMC44LFxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAoZXZlbnRUeXBlID09PSAnR3JvdXAnID8gJ2dyb3VwcycgOiAnZXZlbnRzJykgKyAnIGV2ZW50LWl0ZW0tcG9wdXAnXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJldHVybiBMLmNpcmNsZU1hcmtlcihsYXRsbmcsIGdlb2pzb25NYXJrZXJPcHRpb25zKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICBvbkVhY2hGZWF0dXJlOiAoZmVhdHVyZSwgbGF5ZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChmZWF0dXJlLnByb3BlcnRpZXMgJiYgZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCkge1xuICAgICAgICAgICAgICBsYXllci5iaW5kUG9wdXAoZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgICB9LFxuICAgICAgdXBkYXRlOiAocCkgPT4ge1xuICAgICAgICBpZiAoIXAgfHwgIXAubGF0IHx8ICFwLmxuZyApIHJldHVybjtcblxuICAgICAgICBtYXAuc2V0VmlldyhMLmxhdExuZyhwLmxhdCwgcC5sbmcpLCAxMCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsImNvbnN0IFF1ZXJ5TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldEZvcm0gPSBcImZvcm0jZmlsdGVycy1mb3JtXCIpID0+IHtcbiAgICBjb25zdCAkdGFyZ2V0ID0gdHlwZW9mIHRhcmdldEZvcm0gPT09ICdzdHJpbmcnID8gJCh0YXJnZXRGb3JtKSA6IHRhcmdldEZvcm07XG4gICAgbGV0IGxhdCA9IG51bGw7XG4gICAgbGV0IGxuZyA9IG51bGw7XG5cbiAgICBsZXQgcHJldmlvdXMgPSB7fTtcblxuICAgICR0YXJnZXQub24oJ3N1Ym1pdCcsIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBsYXQgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKCk7XG4gICAgICBsbmcgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKCk7XG5cbiAgICAgIHZhciBmb3JtID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuXG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICQucGFyYW0oZm9ybSk7XG4gICAgfSlcblxuICAgICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdJywgKCkgPT4ge1xuICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICB9KVxuXG5cbiAgICByZXR1cm4ge1xuICAgICAgaW5pdGlhbGl6ZTogKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdmFyIHBhcmFtcyA9ICQuZGVwYXJhbSh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkpXG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYW5nXVwiKS52YWwocGFyYW1zLmxhbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwocGFyYW1zLmxhdCk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChwYXJhbXMubG5nKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKHBhcmFtcy5ib3VuZDEpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwocGFyYW1zLmJvdW5kMik7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sb2NdXCIpLnZhbChwYXJhbXMubG9jKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWtleV1cIikudmFsKHBhcmFtcy5rZXkpO1xuXG4gICAgICAgICAgaWYgKHBhcmFtcy5maWx0ZXIpIHtcbiAgICAgICAgICAgICR0YXJnZXQuZmluZChcIi5maWx0ZXItaXRlbSBpbnB1dFt0eXBlPWNoZWNrYm94XVwiKS5yZW1vdmVQcm9wKFwiY2hlY2tlZFwiKTtcbiAgICAgICAgICAgIHBhcmFtcy5maWx0ZXIuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdW3ZhbHVlPSdcIiArIGl0ZW0gKyBcIiddXCIpLnByb3AoXCJjaGVja2VkXCIsIHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBnZXRQYXJhbWV0ZXJzOiAoKSA9PiB7XG4gICAgICAgIHZhciBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuICAgICAgICAvLyBwYXJhbWV0ZXJzWydsb2NhdGlvbiddIDtcblxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBwYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgaWYgKCAhcGFyYW1ldGVyc1trZXldIHx8IHBhcmFtZXRlcnNba2V5XSA9PSBcIlwiKSB7XG4gICAgICAgICAgICBkZWxldGUgcGFyYW1ldGVyc1trZXldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJhbWV0ZXJzO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZUxvY2F0aW9uOiAobGF0LCBsbmcpID0+IHtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChsYXQpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKGxuZyk7XG4gICAgICAgIC8vICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlVmlld3BvcnQ6ICh2aWV3cG9ydCkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtbdmlld3BvcnQuZi5iLCB2aWV3cG9ydC5iLmJdLCBbdmlld3BvcnQuZi5mLCB2aWV3cG9ydC5iLmZdXTtcblxuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1swXSkpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1sxXSkpO1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHRyaWdnZXJTdWJtaXQ6ICgpID0+IHtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJsZXQgYXV0b2NvbXBsZXRlTWFuYWdlcjtcbmxldCBtYXBNYW5hZ2VyO1xuXG4oZnVuY3Rpb24oJCkge1xuXG4gIC8vIDEuIGdvb2dsZSBtYXBzIGdlb2NvZGVcblxuICAvLyAyLiBmb2N1cyBtYXAgb24gZ2VvY29kZSAodmlhIGxhdC9sbmcpXG4gIGNvbnN0IHF1ZXJ5TWFuYWdlciA9IFF1ZXJ5TWFuYWdlcigpO1xuICAgICAgICBxdWVyeU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuXG4gIGNvbnN0IGluaXRQYXJhbXMgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuICBtYXBNYW5hZ2VyID0gTWFwTWFuYWdlcigpO1xuLy9jb25zb2xlLmxvZyhcIkluaXRpYWxpemVkXCIpO1xuICB3aW5kb3cuaW5pdGlhbGl6ZUF1dG9jb21wbGV0ZUNhbGxiYWNrID0gKCkgPT4ge1xuLy9jb25zb2xlLmxvZyhcIkluaXRpYWxpemVkXCIpO1xuICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIgPSBBdXRvY29tcGxldGVNYW5hZ2VyKFwiaW5wdXRbbmFtZT0nbG9jJ11cIik7XG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlci5pbml0aWFsaXplKCk7XG4vL2NvbnNvbGUubG9nKFwiSW5pdGlhbGl6ZWRcIik7XG4gICAgaWYgKGluaXRQYXJhbXMubG9jICYmIGluaXRQYXJhbXMubG9jICE9PSAnJykge1xuICAgICAgbWFwTWFuYWdlci5pbml0aWFsaXplKCgpID0+IHtcbiAgICAgICAgbWFwTWFuYWdlci5nZXRDZW50ZXJCeUxvY2F0aW9uKGluaXRQYXJhbXMubG9jLCAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgcXVlcnlNYW5hZ2VyLnVwZGF0ZVZpZXdwb3J0KHJlc3VsdC5nZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICB9XG4gIH1cbi8vY29uc29sZS5sb2coXCJNQVAgXCIsIG1hcE1hbmFnZXIpO1xuXG4gIGNvbnN0IGxhbmd1YWdlTWFuYWdlciA9IExhbmd1YWdlTWFuYWdlcigpO1xuLy9jb25zb2xlLmxvZyhxdWVyeU1hbmFnZXIsIHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCksIGluaXRQYXJhbXMpO1xuICBsYW5ndWFnZU1hbmFnZXIuaW5pdGlhbGl6ZShpbml0UGFyYW1zWydsYW5nJ10gfHwgJ2VuJyk7XG5cbiAgY29uc3QgbGlzdE1hbmFnZXIgPSBMaXN0TWFuYWdlcigpO1xuXG4gIGlmKGluaXRQYXJhbXMubGF0ICYmIGluaXRQYXJhbXMubG5nKSB7XG4gICAgbWFwTWFuYWdlci5zZXRDZW50ZXIoW2luaXRQYXJhbXMubGF0LCBpbml0UGFyYW1zLmxuZ10pO1xuICB9XG5cbiAgLyoqKlxuICAqIExpc3QgRXZlbnRzXG4gICogVGhpcyB3aWxsIHRyaWdnZXIgdGhlIGxpc3QgdXBkYXRlIG1ldGhvZFxuICAqL1xuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnBvcHVsYXRlTGlzdChvcHRpb25zLnBhcmFtcyk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuXG4gICAgbGlzdE1hbmFnZXIudXBkYXRlRmlsdGVyKG9wdGlvbnMpO1xuICB9KVxuXG4gIC8qKipcbiAgKiBNYXAgRXZlbnRzXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICAvLyBtYXBNYW5hZ2VyLnNldENlbnRlcihbb3B0aW9ucy5sYXQsIG9wdGlvbnMubG5nXSk7XG4gICAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLmJvdW5kMSB8fCAhb3B0aW9ucy5ib3VuZDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgdmFyIGJvdW5kMiA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDIpO1xuICAgIG1hcE1hbmFnZXIuc2V0Qm91bmRzKGJvdW5kMSwgYm91bmQyKTtcbiAgICAvLyBjb25zb2xlLmxvZyhvcHRpb25zKVxuICB9KTtcbiAgLy8gMy4gbWFya2VycyBvbiBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXBsb3QnLCAoZSwgb3B0KSA9PiB7XG4vL2NvbnNvbGUubG9nKG9wdCk7XG4gICAgbWFwTWFuYWdlci5wbG90UG9pbnRzKG9wdC5kYXRhLCBvcHQucGFyYW1zKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInKTtcbiAgfSlcblxuICAvLyBGaWx0ZXIgbWFwXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCAoZSwgb3B0KSA9PiB7XG4gICAgaWYgKG9wdCkge1xuICAgICAgbWFwTWFuYWdlci5maWx0ZXJNYXAob3B0LmZpbHRlcik7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sYW5ndWFnZS11cGRhdGUnLCAoZSwgb3B0KSA9PiB7XG4gICAgaWYgKG9wdCkge1xuICAgICAgbGFuZ3VhZ2VNYW5hZ2VyLnVwZGF0ZUxhbmd1YWdlKG9wdC5sYW5nKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24jc2hvdy1oaWRlLW1hcCcsIChlLCBvcHQpID0+IHtcbiAgICAkKCdib2R5JykudG9nZ2xlQ2xhc3MoJ21hcC12aWV3JylcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbi5idG4ubW9yZS1pdGVtcycsIChlLCBvcHQpID0+IHtcbiAgICAkKCcjZW1iZWQtYXJlYScpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgKGUsIG9wdCkgPT4ge1xuICAgIC8vdXBkYXRlIGVtYmVkIGxpbmVcbiAgICB2YXIgY29weSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3B0KSk7XG4gICAgZGVsZXRlIGNvcHlbJ2xuZyddO1xuICAgIGRlbGV0ZSBjb3B5WydsYXQnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQxJ107XG4gICAgZGVsZXRlIGNvcHlbJ2JvdW5kMiddO1xuXG4gICAgJCgnI2VtYmVkLWFyZWEgaW5wdXRbbmFtZT1lbWJlZF0nKS52YWwoJ2h0dHA6Ly9tYXAuMzUwLm9yZy5zMy13ZWJzaXRlLXVzLWVhc3QtMS5hbWF6b25hd3MuY29tIycgKyAkLnBhcmFtKGNvcHkpKTtcbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKFwiaGFzaGNoYW5nZVwiLCAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgaWYgKGhhc2gubGVuZ3RoID09IDApIHJldHVybjtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKGhhc2guc3Vic3RyaW5nKDEpKTtcbiAgICBjb25zdCBvbGRVUkwgPSBldmVudC5vcmlnaW5hbEV2ZW50Lm9sZFVSTDtcblxuXG4gICAgY29uc3Qgb2xkSGFzaCA9ICQuZGVwYXJhbShvbGRVUkwuc3Vic3RyaW5nKG9sZFVSTC5zZWFyY2goXCIjXCIpKzEpKTtcblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcblxuICAgIC8vIFNvIHRoYXQgY2hhbmdlIGluIGZpbHRlcnMgd2lsbCBub3QgdXBkYXRlIHRoaXNcbiAgICBpZiAob2xkSGFzaC5ib3VuZDEgIT09IHBhcmFtZXRlcnMuYm91bmQxIHx8IG9sZEhhc2guYm91bmQyICE9PSBwYXJhbWV0ZXJzLmJvdW5kMikge1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgfVxuXG4gICAgLy8gQ2hhbmdlIGl0ZW1zXG4gICAgaWYgKG9sZEhhc2gubGFuZyAhPT0gcGFyYW1ldGVycy5sYW5nKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgIH1cbiAgfSlcblxuICAvLyA0LiBmaWx0ZXIgb3V0IGl0ZW1zIGluIGFjdGl2aXR5LWFyZWFcblxuICAvLyA1LiBnZXQgbWFwIGVsZW1lbnRzXG5cbiAgLy8gNi4gZ2V0IEdyb3VwIGRhdGFcblxuICAvLyA3LiBwcmVzZW50IGdyb3VwIGVsZW1lbnRzXG5cbiAgJC5hamF4KHtcbiAgICB1cmw6ICdodHRwczovL3MzLXVzLXdlc3QtMi5hbWF6b25hd3MuY29tL3BwbHNtYXAtZGF0YS9vdXRwdXQvMzUwb3JnLXRlc3QuanMuZ3onLCAvLyd8KipEQVRBX1NPVVJDRSoqfCcsXG4gICAgZGF0YVR5cGU6ICdzY3JpcHQnLFxuICAgIGNhY2hlOiB0cnVlLFxuICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICB2YXIgcGFyYW1ldGVycyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG5cbiAgICAgIHdpbmRvdy5FVkVOVFNfREFUQS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIGl0ZW1bJ2V2ZW50X3R5cGUnXSA9ICFpdGVtLmV2ZW50X3R5cGUgPyAnQWN0aW9uJyA6IGl0ZW0uZXZlbnRfdHlwZTtcbiAgICAgIH0pXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtdXBkYXRlJywgeyBwYXJhbXM6IHBhcmFtZXRlcnMgfSk7XG4gICAgICAvLyAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtcGxvdCcsIHsgZGF0YTogd2luZG93LkVWRU5UU19EQVRBLCBwYXJhbXM6IHBhcmFtZXRlcnMgfSk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuICAgICAgLy9UT0RPOiBNYWtlIHRoZSBnZW9qc29uIGNvbnZlcnNpb24gaGFwcGVuIG9uIHRoZSBiYWNrZW5kXG4gICAgfVxuICB9KTtcblxuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCkpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCkpO1xuLy9jb25zb2xlLmxvZyhxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpKVxuICB9LCAxMDApO1xuXG59KShqUXVlcnkpO1xuIl19
