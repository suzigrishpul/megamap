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

      var date = moment(item.start_datetime).format("dddd MMM DD, h:mma");
      return "\n      <li class='" + item.event_type + "' data-lat='" + item.lat + "' data-lng='" + item.lng + "'>\n        <div class=\"type-event type-action\">\n          <ul class=\"event-types-list\">\n            <li class='tag-" + item.event_type + " tag'>" + item.event_type + "</li>\n          </ul>\n          <h2 class=\"event-title\"><a href=\"//" + item.url + "\" target='_blank'>" + item.title + "</a></h2>\n          <div class=\"event-date date\">" + date + "</div>\n          <div class=\"event-address address-area\">\n            <p>" + item.venue + "</p>\n          </div>\n          <div class=\"call-to-action\">\n            <a href=\"//" + item.url + "\" target='_blank' class=\"btn btn-secondary\">RSVP</a>\n          </div>\n        </div>\n      </li>\n      ";
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9sYW5ndWFnZS5qcyIsImNsYXNzZXMvbGlzdC5qcyIsImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9xdWVyeS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJBdXRvY29tcGxldGVNYW5hZ2VyIiwiJCIsInRhcmdldCIsIkFQSV9LRVkiLCJ0YXJnZXRJdGVtIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwicXVlcnlNZ3IiLCJRdWVyeU1hbmFnZXIiLCJnZW9jb2RlciIsImdvb2dsZSIsIm1hcHMiLCJHZW9jb2RlciIsIiR0YXJnZXQiLCJpbml0aWFsaXplIiwidHlwZWFoZWFkIiwiaGludCIsImhpZ2hsaWdodCIsIm1pbkxlbmd0aCIsImNsYXNzTmFtZXMiLCJtZW51IiwibmFtZSIsImRpc3BsYXkiLCJpdGVtIiwiZm9ybWF0dGVkX2FkZHJlc3MiLCJsaW1pdCIsInNvdXJjZSIsInEiLCJzeW5jIiwiYXN5bmMiLCJnZW9jb2RlIiwiYWRkcmVzcyIsInJlc3VsdHMiLCJzdGF0dXMiLCJvbiIsIm9iaiIsImRhdHVtIiwiZ2VvbWV0cnkiLCJ1cGRhdGVWaWV3cG9ydCIsInZpZXdwb3J0IiwialF1ZXJ5IiwiTGFuZ3VhZ2VNYW5hZ2VyIiwibGFuZ3VhZ2UiLCJkaWN0aW9uYXJ5IiwiJHRhcmdldHMiLCJ1cGRhdGVQYWdlTGFuZ3VhZ2UiLCJ0YXJnZXRMYW5ndWFnZSIsInJvd3MiLCJmaWx0ZXIiLCJpIiwibGFuZyIsImVhY2giLCJpbmRleCIsInRhcmdldEF0dHJpYnV0ZSIsImRhdGEiLCJsYW5nVGFyZ2V0IiwidGV4dCIsInZhbCIsImF0dHIiLCJ0YXJnZXRzIiwiYWpheCIsInVybCIsImRhdGFUeXBlIiwic3VjY2VzcyIsInVwZGF0ZUxhbmd1YWdlIiwiTGlzdE1hbmFnZXIiLCJ0YXJnZXRMaXN0IiwicmVuZGVyRXZlbnQiLCJkYXRlIiwibW9tZW50Iiwic3RhcnRfZGF0ZXRpbWUiLCJmb3JtYXQiLCJldmVudF90eXBlIiwibGF0IiwibG5nIiwidGl0bGUiLCJ2ZW51ZSIsInJlbmRlckdyb3VwIiwiZGV0YWlscyIsIiRsaXN0IiwidXBkYXRlRmlsdGVyIiwicCIsInJlbW92ZVByb3AiLCJhZGRDbGFzcyIsImpvaW4iLCJwb3B1bGF0ZUxpc3QiLCJoYXJkRmlsdGVycyIsImtleVNldCIsImtleSIsInNwbGl0IiwiJGV2ZW50TGlzdCIsIndpbmRvdyIsIkVWRU5UU19EQVRBIiwibWFwIiwibGVuZ3RoIiwiaW5jbHVkZXMiLCJmaW5kIiwicmVtb3ZlIiwiYXBwZW5kIiwiTWFwTWFuYWdlciIsInJlbmRlckdlb2pzb24iLCJsaXN0IiwicmVuZGVyZWQiLCJ0b0xvd2VyQ2FzZSIsInR5cGUiLCJjb29yZGluYXRlcyIsInByb3BlcnRpZXMiLCJldmVudFByb3BlcnRpZXMiLCJwb3B1cENvbnRlbnQiLCJjYWxsYmFjayIsIkwiLCJzZXRWaWV3IiwidGlsZUxheWVyIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsIiRtYXAiLCJzZXRCb3VuZHMiLCJib3VuZHMxIiwiYm91bmRzMiIsImJvdW5kcyIsImZpdEJvdW5kcyIsInNldENlbnRlciIsImNlbnRlciIsInpvb20iLCJnZXRDZW50ZXJCeUxvY2F0aW9uIiwibG9jYXRpb24iLCJmaWx0ZXJNYXAiLCJmaWx0ZXJzIiwiaGlkZSIsImZvckVhY2giLCJzaG93IiwicGxvdFBvaW50cyIsImNvbnNvbGUiLCJsb2ciLCJnZW9qc29uIiwiZmVhdHVyZXMiLCJnZW9KU09OIiwicG9pbnRUb0xheWVyIiwiZmVhdHVyZSIsImxhdGxuZyIsImV2ZW50VHlwZSIsImdlb2pzb25NYXJrZXJPcHRpb25zIiwicmFkaXVzIiwiZmlsbENvbG9yIiwiY29sb3IiLCJ3ZWlnaHQiLCJvcGFjaXR5IiwiZmlsbE9wYWNpdHkiLCJjbGFzc05hbWUiLCJjaXJjbGVNYXJrZXIiLCJvbkVhY2hGZWF0dXJlIiwibGF5ZXIiLCJiaW5kUG9wdXAiLCJ1cGRhdGUiLCJsYXRMbmciLCJ0YXJnZXRGb3JtIiwicHJldmlvdXMiLCJlIiwicHJldmVudERlZmF1bHQiLCJmb3JtIiwiZGVwYXJhbSIsInNlcmlhbGl6ZSIsImhhc2giLCJwYXJhbSIsInRyaWdnZXIiLCJwYXJhbXMiLCJzdWJzdHJpbmciLCJib3VuZDEiLCJib3VuZDIiLCJsb2MiLCJwcm9wIiwiZ2V0UGFyYW1ldGVycyIsInBhcmFtZXRlcnMiLCJ1cGRhdGVMb2NhdGlvbiIsImYiLCJiIiwiSlNPTiIsInN0cmluZ2lmeSIsInRyaWdnZXJTdWJtaXQiLCJhdXRvY29tcGxldGVNYW5hZ2VyIiwibWFwTWFuYWdlciIsInF1ZXJ5TWFuYWdlciIsImluaXRQYXJhbXMiLCJpbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2siLCJyZXN1bHQiLCJsYW5ndWFnZU1hbmFnZXIiLCJsaXN0TWFuYWdlciIsImV2ZW50Iiwib3B0aW9ucyIsInBhcnNlIiwib3B0IiwidG9nZ2xlQ2xhc3MiLCJjb3B5Iiwib2xkVVJMIiwib3JpZ2luYWxFdmVudCIsIm9sZEhhc2giLCJzZWFyY2giLCJjYWNoZSIsInNldFRpbWVvdXQiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7O0FBQ0EsSUFBTUEsc0JBQXVCLFVBQVNDLENBQVQsRUFBWTtBQUN2Qzs7QUFFQSxTQUFPLFVBQUNDLE1BQUQsRUFBWTs7QUFFakIsUUFBTUMsVUFBVSx5Q0FBaEI7QUFDQSxRQUFNQyxhQUFhLE9BQU9GLE1BQVAsSUFBaUIsUUFBakIsR0FBNEJHLFNBQVNDLGFBQVQsQ0FBdUJKLE1BQXZCLENBQTVCLEdBQTZEQSxNQUFoRjtBQUNBLFFBQU1LLFdBQVdDLGNBQWpCO0FBQ0EsUUFBSUMsV0FBVyxJQUFJQyxPQUFPQyxJQUFQLENBQVlDLFFBQWhCLEVBQWY7O0FBRUEsV0FBTztBQUNMQyxlQUFTWixFQUFFRyxVQUFGLENBREo7QUFFTEYsY0FBUUUsVUFGSDtBQUdMVSxrQkFBWSxzQkFBTTtBQUNoQmIsVUFBRUcsVUFBRixFQUFjVyxTQUFkLENBQXdCO0FBQ1pDLGdCQUFNLElBRE07QUFFWkMscUJBQVcs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QnlFLFFBQVFPLFVBQXBDLEVBQXhDO0FBQ0EzSyxRQUFFSSxRQUFGLEVBQVkrSixPQUFaLENBQW9CLHNCQUFwQixFQUE0Q1EsVUFBNUM7QUFDQTtBQUNEO0FBZkksR0FBUDs7QUFrQkEwQixhQUFXLFlBQU07QUFDZnJNLE1BQUVJLFFBQUYsRUFBWStKLE9BQVosQ0FBb0IsNEJBQXBCLEVBQWtEaUIsYUFBYVYsYUFBYixFQUFsRDtBQUNBMUssTUFBRUksUUFBRixFQUFZK0osT0FBWixDQUFvQixvQkFBcEIsRUFBMENpQixhQUFhVixhQUFiLEVBQTFDO0FBQ0o7QUFDRyxHQUpELEVBSUcsR0FKSDtBQU1ELENBOUpELEVBOEpHbkksTUE5SkgiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vL0FQSSA6QUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXG5jb25zdCBBdXRvY29tcGxldGVNYW5hZ2VyID0gKGZ1bmN0aW9uKCQpIHtcbiAgLy9Jbml0aWFsaXphdGlvbi4uLlxuXG4gIHJldHVybiAodGFyZ2V0KSA9PiB7XG5cbiAgICBjb25zdCBBUElfS0VZID0gXCJBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cIjtcbiAgICBjb25zdCB0YXJnZXRJdGVtID0gdHlwZW9mIHRhcmdldCA9PSBcInN0cmluZ1wiID8gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpIDogdGFyZ2V0O1xuICAgIGNvbnN0IHF1ZXJ5TWdyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgdmFyIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgJHRhcmdldDogJCh0YXJnZXRJdGVtKSxcbiAgICAgIHRhcmdldDogdGFyZ2V0SXRlbSxcbiAgICAgIGluaXRpYWxpemU6ICgpID0+IHtcbiAgICAgICAgJCh0YXJnZXRJdGVtKS50eXBlYWhlYWQoe1xuICAgICAgICAgICAgICAgICAgICBoaW50OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1pbkxlbmd0aDogNCxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICAgIG1lbnU6ICd0dC1kcm9wZG93bi1tZW51J1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnc2VhcmNoLXJlc3VsdHMnLFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAoaXRlbSkgPT4gaXRlbS5mb3JtYXR0ZWRfYWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgbGltaXQ6IDEwLFxuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IGZ1bmN0aW9uIChxLCBzeW5jLCBhc3luYyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogcSB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFzeW5jKHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApLm9uKCd0eXBlYWhlYWQ6c2VsZWN0ZWQnLCBmdW5jdGlvbiAob2JqLCBkYXR1bSkge1xuICAgICAgICAgICAgICAgICAgICBpZihkYXR1bSlcbiAgICAgICAgICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgICAgICAgdmFyIGdlb21ldHJ5ID0gZGF0dW0uZ2VvbWV0cnk7XG4gICAgICAgICAgICAgICAgICAgICAgcXVlcnlNZ3IudXBkYXRlVmlld3BvcnQoZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgICAgIC8vICBtYXAuZml0Qm91bmRzKGdlb21ldHJ5LmJvdW5kcz8gZ2VvbWV0cnkuYm91bmRzIDogZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG5cblxuICAgIHJldHVybiB7XG5cbiAgICB9XG4gIH1cblxufShqUXVlcnkpKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTGFuZ3VhZ2VNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIC8va2V5VmFsdWVcblxuICAvL3RhcmdldHMgYXJlIHRoZSBtYXBwaW5ncyBmb3IgdGhlIGxhbmd1YWdlXG4gIHJldHVybiAoKSA9PiB7XG4gICAgbGV0IGxhbmd1YWdlO1xuICAgIGxldCBkaWN0aW9uYXJ5ID0ge307XG4gICAgbGV0ICR0YXJnZXRzID0gJChcIltkYXRhLWxhbmctdGFyZ2V0XVtkYXRhLWxhbmcta2V5XVwiKTtcblxuICAgIGNvbnN0IHVwZGF0ZVBhZ2VMYW5ndWFnZSA9ICgpID0+IHtcblxuICAgICAgbGV0IHRhcmdldExhbmd1YWdlID0gZGljdGlvbmFyeS5yb3dzLmZpbHRlcigoaSkgPT4gaS5sYW5nID09PSBsYW5ndWFnZSlbMF07XG5cbiAgICAgICR0YXJnZXRzLmVhY2goKGluZGV4LCBpdGVtKSA9PiB7XG4gICAgICAgIGxldCB0YXJnZXRBdHRyaWJ1dGUgPSAkKGl0ZW0pLmRhdGEoJ2xhbmctdGFyZ2V0Jyk7XG4gICAgICAgIGxldCBsYW5nVGFyZ2V0ID0gJChpdGVtKS5kYXRhKCdsYW5nLWtleScpO1xuXG4gICAgICAgIHN3aXRjaCh0YXJnZXRBdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjYXNlICd0ZXh0JzpcbiAgICAgICAgICAgICQoaXRlbSkudGV4dCh0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd2YWx1ZSc6XG4gICAgICAgICAgICAkKGl0ZW0pLnZhbCh0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgJChpdGVtKS5hdHRyKHRhcmdldEF0dHJpYnV0ZSwgdGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICBsYW5ndWFnZSxcbiAgICAgIHRhcmdldHM6ICR0YXJnZXRzLFxuICAgICAgZGljdGlvbmFyeSxcbiAgICAgIGluaXRpYWxpemU6IChsYW5nKSA9PiB7XG4vL2NvbnNvbGUubG9nKFwiJHRhcmdldHNcIiwgbGFuZyk7XG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgdXJsOiAnaHR0cDovL2dzeDJqc29uLmNvbS9hcGk/aWQ9MU8zZUJ5akwxdmxZZjdaN2FtLV9odFJUUWk3M1BhZnFJZk5CZExtWGU4U00mc2hlZXQ9MScsXG4gICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgZGljdGlvbmFyeSA9IGRhdGE7XG4gICAgICAgICAgICBsYW5ndWFnZSA9IGxhbmc7XG4gICAgICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZUxhbmd1YWdlOiAobGFuZykgPT4ge1xuLy9jb25zb2xlLmxvZyhcIk5ldyBMYW5nIDo6OiBcIiwgbGFuZyk7XG4gICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgdXBkYXRlUGFnZUxhbmd1YWdlKCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG59KShqUXVlcnkpO1xuIiwiLyogVGhpcyBsb2FkcyBhbmQgbWFuYWdlcyB0aGUgbGlzdCEgKi9cblxuY29uc3QgTGlzdE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRMaXN0ID0gXCIjZXZlbnRzLWxpc3RcIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0TGlzdCA9PT0gJ3N0cmluZycgPyAkKHRhcmdldExpc3QpIDogdGFyZ2V0TGlzdDtcblxuICAgIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0pID0+IHtcblxuICAgICAgdmFyIGRhdGUgPSBtb21lbnQoaXRlbS5zdGFydF9kYXRldGltZSkuZm9ybWF0KFwiZGRkZCBNTU0gREQsIGg6bW1hXCIpO1xuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaSBjbGFzcz0nJHtpdGVtLmV2ZW50X3R5cGV9JyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50IHR5cGUtYWN0aW9uXCI+XG4gICAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgICAgPGxpIGNsYXNzPSd0YWctJHtpdGVtLmV2ZW50X3R5cGV9IHRhZyc+JHtpdGVtLmV2ZW50X3R5cGV9PC9saT5cbiAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDxoMiBjbGFzcz1cImV2ZW50LXRpdGxlXCI+PGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1kYXRlIGRhdGVcIj4ke2RhdGV9PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWFkZHJlc3MgYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPlJTVlA8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSkgPT4ge1xuXG4gICAgICByZXR1cm4gYFxuICAgICAgPGxpPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ncm91cFwiPlxuICAgICAgICAgIDxoMj48YSBocmVmPVwiL1wiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGUgfHwgYEdyb3VwYH08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgICA8cD5Db2xvcmFkbywgVVNBPC9wPlxuICAgICAgICAgICAgPHA+JHtpdGVtLmRldGFpbHMgfHwgYDM1MCBDb2xvcmFkbyBpcyB3b3JraW5nIGxvY2FsbHkgdG8gaGVscCBidWlsZCB0aGUgZ2xvYmFsXG4gICAgICAgICAgICAgICAzNTAub3JnIG1vdmVtZW50IHRvIHNvbHZlIHRoZSBjbGltYXRlIGNyaXNpcyBhbmQgdHJhbnNpdGlvblxuICAgICAgICAgICAgICAgdG8gYSBjbGVhbiwgcmVuZXdhYmxlIGVuZXJneSBmdXR1cmUuYH1cbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICRsaXN0OiAkdGFyZ2V0LFxuICAgICAgdXBkYXRlRmlsdGVyOiAocCkgPT4ge1xuICAgICAgICBpZighcCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIFJlbW92ZSBGaWx0ZXJzXG5cbiAgICAgICAgJHRhcmdldC5yZW1vdmVQcm9wKFwiY2xhc3NcIik7XG4gICAgICAgICR0YXJnZXQuYWRkQ2xhc3MocC5maWx0ZXIgPyBwLmZpbHRlci5qb2luKFwiIFwiKSA6ICcnKVxuICAgICAgfSxcbiAgICAgIHBvcHVsYXRlTGlzdDogKGhhcmRGaWx0ZXJzKSA9PiB7XG4gICAgICAgIC8vdXNpbmcgd2luZG93LkVWRU5UX0RBVEFcbiAgICAgICAgY29uc3Qga2V5U2V0ID0gIWhhcmRGaWx0ZXJzLmtleSA/IFtdIDogaGFyZEZpbHRlcnMua2V5LnNwbGl0KCcsJyk7XG5cbiAgICAgICAgdmFyICRldmVudExpc3QgPSB3aW5kb3cuRVZFTlRTX0RBVEEubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgIGlmIChrZXlTZXQubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLmV2ZW50X3R5cGUgIT09ICdHcm91cCcgPyByZW5kZXJFdmVudChpdGVtKSA6IHJlbmRlckdyb3VwKGl0ZW0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2V5U2V0Lmxlbmd0aCA+IDAgJiYga2V5U2V0LmluY2x1ZGVzKGl0ZW0uZXZlbnRfdHlwZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLmV2ZW50X3R5cGUgIT09ICdHcm91cCcgPyByZW5kZXJFdmVudChpdGVtKSA6IHJlbmRlckdyb3VwKGl0ZW0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIH0pXG4gICAgICAgICR0YXJnZXQuZmluZCgndWwgbGknKS5yZW1vdmUoKTtcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCcpLmFwcGVuZCgkZXZlbnRMaXN0KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiXG5jb25zdCBNYXBNYW5hZ2VyID0gKCgkKSA9PiB7XG5cbiAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSkgPT4ge1xuICAgIHZhciBkYXRlID0gbW9tZW50KGl0ZW0uc3RhcnRfZGF0ZXRpbWUpLmZvcm1hdChcImRkZGQgTU1NIERELCBoOm1tYVwiKTtcbiAgICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9J3BvcHVwLWl0ZW0gJHtpdGVtLmV2ZW50X3R5cGV9JyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudFwiPlxuICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgPGxpIGNsYXNzPVwidGFnIHRhZy0ke2l0ZW0uZXZlbnRfdHlwZX1cIj4ke2l0ZW0uZXZlbnRfdHlwZSB8fCAnQWN0aW9uJ308L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8aDIgY2xhc3M9XCJldmVudC10aXRsZVwiPjxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZX08L2E+PC9oMj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWRhdGVcIj4ke2RhdGV9PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1hZGRyZXNzIGFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgIDxwPiR7aXRlbS52ZW51ZX08L3A+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiLy8ke2l0ZW0udXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+UlNWUDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSkgPT4ge1xuICAgIHJldHVybiBgXG4gICAgPGRpdiBjbGFzcz0ncG9wdXAtaXRlbSAke2l0ZW0uZXZlbnRfdHlwZX0nIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwXCI+XG4gICAgICAgIDxoMj48YSBocmVmPVwiL1wiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGUgfHwgYEdyb3VwYH08L2E+PC9oMj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgIDxwPkNvbG9yYWRvLCBVU0E8L3A+XG4gICAgICAgICAgPHA+JHtpdGVtLmRldGFpbHMgfHwgYDM1MCBDb2xvcmFkbyBpcyB3b3JraW5nIGxvY2FsbHkgdG8gaGVscCBidWlsZCB0aGUgZ2xvYmFsXG4gICAgICAgICAgICAgMzUwLm9yZyBtb3ZlbWVudCB0byBzb2x2ZSB0aGUgY2xpbWF0ZSBjcmlzaXMgYW5kIHRyYW5zaXRpb25cbiAgICAgICAgICAgICB0byBhIGNsZWFuLCByZW5ld2FibGUgZW5lcmd5IGZ1dHVyZS5gfVxuICAgICAgICAgIDwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgIDxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgYFxuICB9O1xuXG4gIGNvbnN0IHJlbmRlckdlb2pzb24gPSAobGlzdCkgPT4ge1xuICAgIHJldHVybiBsaXN0Lm1hcCgoaXRlbSkgPT4ge1xuICAgICAgLy8gcmVuZGVyZWQgZXZlbnRUeXBlXG4gICAgICBsZXQgcmVuZGVyZWQ7XG4gICAgICBpZiAoIWl0ZW0uZXZlbnRfdHlwZSB8fCAhaXRlbS5ldmVudF90eXBlLnRvTG93ZXJDYXNlKCkgIT09ICdncm91cCcpIHtcbiAgICAgICAgcmVuZGVyZWQgPSByZW5kZXJFdmVudChpdGVtKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlbmRlcmVkID0gcmVuZGVyR3JvdXAoaXRlbSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICB0eXBlOiBcIlBvaW50XCIsXG4gICAgICAgICAgY29vcmRpbmF0ZXM6IFtpdGVtLmxuZywgaXRlbS5sYXRdXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBldmVudFByb3BlcnRpZXM6IGl0ZW0sXG4gICAgICAgICAgcG9wdXBDb250ZW50OiByZW5kZXJlZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAoY2FsbGJhY2spID0+IHtcbiAgICB2YXIgbWFwID0gTC5tYXAoJ21hcCcpLnNldFZpZXcoWzM0Ljg4NTkzMDk0MDc1MzE3LCA1LjA5NzY1NjI1MDAwMDAwMV0sIDIpO1xuXG4gICAgTC50aWxlTGF5ZXIoJ2h0dHA6Ly97c30udGlsZS5vc20ub3JnL3t6fS97eH0ve3l9LnBuZycsIHtcbiAgICAgICAgYXR0cmlidXRpb246ICcmY29weTsgPGEgaHJlZj1cImh0dHA6Ly9vc20ub3JnL2NvcHlyaWdodFwiPk9wZW5TdHJlZXRNYXA8L2E+IGNvbnRyaWJ1dG9ycyDigKIgPGEgaHJlZj1cIi8vMzUwLm9yZ1wiPjM1MC5vcmc8L2E+J1xuICAgIH0pLmFkZFRvKG1hcCk7XG5cbiAgICBsZXQgZ2VvY29kZXIgPSBudWxsO1xuICAgIHJldHVybiB7XG4gICAgICAkbWFwOiBtYXAsXG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHNldEJvdW5kczogKGJvdW5kczEsIGJvdW5kczIpID0+IHtcbiAgICAgICAgY29uc3QgYm91bmRzID0gW2JvdW5kczEsIGJvdW5kczJdO1xuICAgICAgICBtYXAuZml0Qm91bmRzKGJvdW5kcyk7XG4gICAgICB9LFxuICAgICAgc2V0Q2VudGVyOiAoY2VudGVyLCB6b29tID0gMTApID0+IHtcbiAgICAgICAgaWYgKCFjZW50ZXIgfHwgIWNlbnRlclswXSB8fCBjZW50ZXJbMF0gPT0gXCJcIlxuICAgICAgICAgICAgICB8fCAhY2VudGVyWzFdIHx8IGNlbnRlclsxXSA9PSBcIlwiKSByZXR1cm47XG4gICAgICAgIG1hcC5zZXRWaWV3KGNlbnRlciwgem9vbSk7XG4gICAgICB9LFxuICAgICAgLy8gQ2VudGVyIGxvY2F0aW9uIGJ5IGdlb2NvZGVkXG4gICAgICBnZXRDZW50ZXJCeUxvY2F0aW9uOiAobG9jYXRpb24sIGNhbGxiYWNrKSA9PiB7XG4vL2NvbnNvbGUubG9nKFwiRmluZGluZyBsb2NhdGlvbiBvZiBcIiwgbG9jYXRpb24pO1xuICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogbG9jYXRpb24gfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuLy9jb25zb2xlLmxvZyhcIkxPQ0FUSU9OIE1BVENIOjogXCIsIHJlc3VsdHMsIHN0YXR1cyk7XG4gICAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2socmVzdWx0c1swXSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGZpbHRlck1hcDogKGZpbHRlcnMpID0+IHtcbi8vY29uc29sZS5sb2coXCJmaWx0ZXJzID4+IFwiLCBmaWx0ZXJzKTtcbiAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwXCIpLmhpZGUoKTtcbi8vY29uc29sZS5sb2coJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwXCIpKTtcblxuICAgICAgICBpZiAoIWZpbHRlcnMpIHJldHVybjtcblxuICAgICAgICBmaWx0ZXJzLmZvckVhY2goKGl0ZW0pID0+IHtcbi8vY29uc29sZS5sb2coXCIuZXZlbnQtaXRlbS1wb3B1cC5cIiArIGl0ZW0udG9Mb3dlckNhc2UoKSk7XG4gICAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwLlwiICsgaXRlbS50b0xvd2VyQ2FzZSgpKS5zaG93KCk7XG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgcGxvdFBvaW50czogKGxpc3QsIGhhcmRGaWx0ZXJzKSA9PiB7XG5cbiAgICAgICAgY29uc3Qga2V5U2V0ID0gIWhhcmRGaWx0ZXJzLmtleSA/IFtdIDogaGFyZEZpbHRlcnMua2V5LnNwbGl0KCcsJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKGtleVNldCwgbGlzdCk7XG4gICAgICAgIGlmIChrZXlTZXQubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGxpc3QgPSBsaXN0LmZpbHRlcigoaXRlbSkgPT4ga2V5U2V0LmluY2x1ZGVzKGl0ZW0uZXZlbnRfdHlwZSkpXG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2cobGlzdCk7O1xuXG4gICAgICAgIGNvbnN0IGdlb2pzb24gPSB7XG4gICAgICAgICAgdHlwZTogXCJGZWF0dXJlQ29sbGVjdGlvblwiLFxuICAgICAgICAgIGZlYXR1cmVzOiByZW5kZXJHZW9qc29uKGxpc3QpXG4gICAgICAgIH07XG5cblxuXG4gICAgICAgIEwuZ2VvSlNPTihnZW9qc29uLCB7XG4gICAgICAgICAgICBwb2ludFRvTGF5ZXI6IChmZWF0dXJlLCBsYXRsbmcpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgZXZlbnRUeXBlID0gZmVhdHVyZS5wcm9wZXJ0aWVzLmV2ZW50UHJvcGVydGllcy5ldmVudF90eXBlO1xuICAgICAgICAgICAgICB2YXIgZ2VvanNvbk1hcmtlck9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICByYWRpdXM6IDgsXG4gICAgICAgICAgICAgICAgICBmaWxsQ29sb3I6ICBldmVudFR5cGUgPT09ICdHcm91cCcgPyBcIiM0MEQ3RDRcIiA6IFwiIzBGODFFOFwiLFxuICAgICAgICAgICAgICAgICAgY29sb3I6IFwid2hpdGVcIixcbiAgICAgICAgICAgICAgICAgIHdlaWdodDogMixcbiAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAuNSxcbiAgICAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAwLjgsXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IChldmVudFR5cGUgPT09ICdHcm91cCcgPyAnZ3JvdXBzJyA6ICdldmVudHMnKSArICcgZXZlbnQtaXRlbS1wb3B1cCdcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgcmV0dXJuIEwuY2lyY2xlTWFya2VyKGxhdGxuZywgZ2VvanNvbk1hcmtlck9wdGlvbnMpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgIG9uRWFjaEZlYXR1cmU6IChmZWF0dXJlLCBsYXllcikgPT4ge1xuICAgICAgICAgICAgaWYgKGZlYXR1cmUucHJvcGVydGllcyAmJiBmZWF0dXJlLnByb3BlcnRpZXMucG9wdXBDb250ZW50KSB7XG4gICAgICAgICAgICAgIGxheWVyLmJpbmRQb3B1cChmZWF0dXJlLnByb3BlcnRpZXMucG9wdXBDb250ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pLmFkZFRvKG1hcCk7XG5cbiAgICAgIH0sXG4gICAgICB1cGRhdGU6IChwKSA9PiB7XG4gICAgICAgIGlmICghcCB8fCAhcC5sYXQgfHwgIXAubG5nICkgcmV0dXJuO1xuXG4gICAgICAgIG1hcC5zZXRWaWV3KEwubGF0TG5nKHAubGF0LCBwLmxuZyksIDEwKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiY29uc3QgUXVlcnlNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIHJldHVybiAodGFyZ2V0Rm9ybSA9IFwiZm9ybSNmaWx0ZXJzLWZvcm1cIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0Rm9ybSA9PT0gJ3N0cmluZycgPyAkKHRhcmdldEZvcm0pIDogdGFyZ2V0Rm9ybTtcbiAgICBsZXQgbGF0ID0gbnVsbDtcbiAgICBsZXQgbG5nID0gbnVsbDtcblxuICAgIGxldCBwcmV2aW91cyA9IHt9O1xuXG4gICAgJHRhcmdldC5vbignc3VibWl0JywgKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGxhdCA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwoKTtcbiAgICAgIGxuZyA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwoKTtcblxuICAgICAgdmFyIGZvcm0gPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG5cbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJC5wYXJhbShmb3JtKTtcbiAgICB9KVxuXG4gICAgJChkb2N1bWVudCkub24oJ2NoYW5nZScsICcuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF0nLCAoKSA9PiB7XG4gICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgIH0pXG5cblxuICAgIHJldHVybiB7XG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgcGFyYW1zID0gJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSlcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhbmddXCIpLnZhbChwYXJhbXMubGFuZyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChwYXJhbXMubGF0KTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKHBhcmFtcy5sbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwocGFyYW1zLmJvdW5kMSk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChwYXJhbXMuYm91bmQyKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxvY11cIikudmFsKHBhcmFtcy5sb2MpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9a2V5XVwiKS52YWwocGFyYW1zLmtleSk7XG5cbiAgICAgICAgICBpZiAocGFyYW1zLmZpbHRlcikge1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdXCIpLnJlbW92ZVByb3AoXCJjaGVja2VkXCIpO1xuICAgICAgICAgICAgcGFyYW1zLmZpbHRlci5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF1bdmFsdWU9J1wiICsgaXRlbSArIFwiJ11cIikucHJvcChcImNoZWNrZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGdldFBhcmFtZXRlcnM6ICgpID0+IHtcbiAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG4gICAgICAgIC8vIHBhcmFtZXRlcnNbJ2xvY2F0aW9uJ10gO1xuXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHBhcmFtZXRlcnMpIHtcbiAgICAgICAgICBpZiAoICFwYXJhbWV0ZXJzW2tleV0gfHwgcGFyYW1ldGVyc1trZXldID09IFwiXCIpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBwYXJhbWV0ZXJzW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtZXRlcnM7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTG9jYXRpb246IChsYXQsIGxuZykgPT4ge1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKGxhdCk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwobG5nKTtcbiAgICAgICAgLy8gJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVWaWV3cG9ydDogKHZpZXdwb3J0KSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW1t2aWV3cG9ydC5mLmIsIHZpZXdwb3J0LmIuYl0sIFt2aWV3cG9ydC5mLmYsIHZpZXdwb3J0LmIuZl1dO1xuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdHJpZ2dlclN1Ym1pdDogKCkgPT4ge1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSkoalF1ZXJ5KTtcbiIsImxldCBhdXRvY29tcGxldGVNYW5hZ2VyO1xubGV0IG1hcE1hbmFnZXI7XG5cbihmdW5jdGlvbigkKSB7XG5cbiAgLy8gMS4gZ29vZ2xlIG1hcHMgZ2VvY29kZVxuXG4gIC8vIDIuIGZvY3VzIG1hcCBvbiBnZW9jb2RlICh2aWEgbGF0L2xuZylcbiAgY29uc3QgcXVlcnlNYW5hZ2VyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgICAgIHF1ZXJ5TWFuYWdlci5pbml0aWFsaXplKCk7XG5cbiAgY29uc3QgaW5pdFBhcmFtcyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gIG1hcE1hbmFnZXIgPSBNYXBNYW5hZ2VyKCk7XG4vL2NvbnNvbGUubG9nKFwiSW5pdGlhbGl6ZWRcIik7XG4gIHdpbmRvdy5pbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2sgPSAoKSA9PiB7XG4vL2NvbnNvbGUubG9nKFwiSW5pdGlhbGl6ZWRcIik7XG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlciA9IEF1dG9jb21wbGV0ZU1hbmFnZXIoXCJpbnB1dFtuYW1lPSdsb2MnXVwiKTtcbiAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmluaXRpYWxpemUoKTtcbi8vY29uc29sZS5sb2coXCJJbml0aWFsaXplZFwiKTtcbiAgICBpZiAoaW5pdFBhcmFtcy5sb2MgJiYgaW5pdFBhcmFtcy5sb2MgIT09ICcnKSB7XG4gICAgICBtYXBNYW5hZ2VyLmluaXRpYWxpemUoKCkgPT4ge1xuICAgICAgICBtYXBNYW5hZ2VyLmdldENlbnRlckJ5TG9jYXRpb24oaW5pdFBhcmFtcy5sb2MsIChyZXN1bHQpID0+IHtcbiAgICAgICAgICBxdWVyeU1hbmFnZXIudXBkYXRlVmlld3BvcnQocmVzdWx0Lmdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgIH1cbiAgfVxuLy9jb25zb2xlLmxvZyhcIk1BUCBcIiwgbWFwTWFuYWdlcik7XG5cbiAgY29uc3QgbGFuZ3VhZ2VNYW5hZ2VyID0gTGFuZ3VhZ2VNYW5hZ2VyKCk7XG4vL2NvbnNvbGUubG9nKHF1ZXJ5TWFuYWdlciwgcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKSwgaW5pdFBhcmFtcyk7XG4gIGxhbmd1YWdlTWFuYWdlci5pbml0aWFsaXplKGluaXRQYXJhbXNbJ2xhbmcnXSB8fCAnZW4nKTtcblxuICBjb25zdCBsaXN0TWFuYWdlciA9IExpc3RNYW5hZ2VyKCk7XG5cbiAgaWYoaW5pdFBhcmFtcy5sYXQgJiYgaW5pdFBhcmFtcy5sbmcpIHtcbiAgICBtYXBNYW5hZ2VyLnNldENlbnRlcihbaW5pdFBhcmFtcy5sYXQsIGluaXRQYXJhbXMubG5nXSk7XG4gIH1cblxuICAvKioqXG4gICogTGlzdCBFdmVudHNcbiAgKiBUaGlzIHdpbGwgdHJpZ2dlciB0aGUgbGlzdCB1cGRhdGUgbWV0aG9kXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgbGlzdE1hbmFnZXIucG9wdWxhdGVMaXN0KG9wdGlvbnMucGFyYW1zKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG5cbiAgICBsaXN0TWFuYWdlci51cGRhdGVGaWx0ZXIob3B0aW9ucyk7XG4gIH0pXG5cbiAgLyoqKlxuICAqIE1hcCBFdmVudHNcbiAgKi9cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIC8vIG1hcE1hbmFnZXIuc2V0Q2VudGVyKFtvcHRpb25zLmxhdCwgb3B0aW9ucy5sbmddKTtcbiAgICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMuYm91bmQxIHx8ICFvcHRpb25zLmJvdW5kMikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBib3VuZDEgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQxKTtcbiAgICB2YXIgYm91bmQyID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMik7XG4gICAgbWFwTWFuYWdlci5zZXRCb3VuZHMoYm91bmQxLCBib3VuZDIpO1xuICAgIC8vIGNvbnNvbGUubG9nKG9wdGlvbnMpXG4gIH0pO1xuICAvLyAzLiBtYXJrZXJzIG9uIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtcGxvdCcsIChlLCBvcHQpID0+IHtcbi8vY29uc29sZS5sb2cob3B0KTtcbiAgICBtYXBNYW5hZ2VyLnBsb3RQb2ludHMob3B0LmRhdGEsIG9wdC5wYXJhbXMpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicpO1xuICB9KVxuXG4gIC8vIEZpbHRlciBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLWZpbHRlcicsIChlLCBvcHQpID0+IHtcbiAgICBpZiAob3B0KSB7XG4gICAgICBtYXBNYW5hZ2VyLmZpbHRlck1hcChvcHQuZmlsdGVyKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZScsIChlLCBvcHQpID0+IHtcbiAgICBpZiAob3B0KSB7XG4gICAgICBsYW5ndWFnZU1hbmFnZXIudXBkYXRlTGFuZ3VhZ2Uob3B0LmxhbmcpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbiNzaG93LWhpZGUtbWFwJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ2JvZHknKS50b2dnbGVDbGFzcygnbWFwLXZpZXcnKVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uLmJ0bi5tb3JlLWl0ZW1zJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJyNlbWJlZC1hcmVhJykudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgLy91cGRhdGUgZW1iZWQgbGluZVxuICAgIHZhciBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHQpKTtcbiAgICBkZWxldGUgY29weVsnbG5nJ107XG4gICAgZGVsZXRlIGNvcHlbJ2xhdCddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDEnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQyJ107XG5cbiAgICAkKCcjZW1iZWQtYXJlYSBpbnB1dFtuYW1lPWVtYmVkXScpLnZhbCgnaHR0cDovL21hcC4zNTAub3JnLnMzLXdlYnNpdGUtdXMtZWFzdC0xLmFtYXpvbmF3cy5jb20jJyArICQucGFyYW0oY29weSkpO1xuICB9KTtcblxuICAkKHdpbmRvdykub24oXCJoYXNoY2hhbmdlXCIsIChldmVudCkgPT4ge1xuICAgIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICBpZiAoaGFzaC5sZW5ndGggPT0gMCkgcmV0dXJuO1xuICAgIGNvbnN0IHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oaGFzaC5zdWJzdHJpbmcoMSkpO1xuICAgIGNvbnN0IG9sZFVSTCA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQub2xkVVJMO1xuXG5cbiAgICBjb25zdCBvbGRIYXNoID0gJC5kZXBhcmFtKG9sZFVSTC5zdWJzdHJpbmcob2xkVVJMLnNlYXJjaChcIiNcIikrMSkpO1xuXG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCBwYXJhbWV0ZXJzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuXG4gICAgLy8gU28gdGhhdCBjaGFuZ2UgaW4gZmlsdGVycyB3aWxsIG5vdCB1cGRhdGUgdGhpc1xuICAgIGlmIChvbGRIYXNoLmJvdW5kMSAhPT0gcGFyYW1ldGVycy5ib3VuZDEgfHwgb2xkSGFzaC5ib3VuZDIgIT09IHBhcmFtZXRlcnMuYm91bmQyKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG5cbiAgICAvLyBDaGFuZ2UgaXRlbXNcbiAgICBpZiAob2xkSGFzaC5sYW5nICE9PSBwYXJhbWV0ZXJzLmxhbmcpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgfVxuICB9KVxuXG4gIC8vIDQuIGZpbHRlciBvdXQgaXRlbXMgaW4gYWN0aXZpdHktYXJlYVxuXG4gIC8vIDUuIGdldCBtYXAgZWxlbWVudHNcblxuICAvLyA2LiBnZXQgR3JvdXAgZGF0YVxuXG4gIC8vIDcuIHByZXNlbnQgZ3JvdXAgZWxlbWVudHNcblxuICAkLmFqYXgoe1xuICAgIHVybDogJ2h0dHBzOi8vczMtdXMtd2VzdC0yLmFtYXpvbmF3cy5jb20vcHBsc21hcC1kYXRhL291dHB1dC8zNTBvcmctdGVzdC5qcy5neicsIC8vJ3wqKkRBVEFfU09VUkNFKip8JyxcbiAgICBkYXRhVHlwZTogJ3NjcmlwdCcsXG4gICAgY2FjaGU6IHRydWUsXG4gICAgc3VjY2VzczogKGRhdGEpID0+IHtcbiAgICAgIHZhciBwYXJhbWV0ZXJzID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuICAgICAgd2luZG93LkVWRU5UU19EQVRBLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgaXRlbVsnZXZlbnRfdHlwZSddID0gIWl0ZW0uZXZlbnRfdHlwZSA/ICdBY3Rpb24nIDogaXRlbS5ldmVudF90eXBlO1xuICAgICAgfSlcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC11cGRhdGUnLCB7IHBhcmFtczogcGFyYW1ldGVycyB9KTtcbiAgICAgIC8vICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1wbG90JywgeyBkYXRhOiB3aW5kb3cuRVZFTlRTX0RBVEEsIHBhcmFtczogcGFyYW1ldGVycyB9KTtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgcGFyYW1ldGVycyk7XG4gICAgICAvL1RPRE86IE1ha2UgdGhlIGdlb2pzb24gY29udmVyc2lvbiBoYXBwZW4gb24gdGhlIGJhY2tlbmRcbiAgICB9XG4gIH0pO1xuXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKSk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKSk7XG4vL2NvbnNvbGUubG9nKHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCkpXG4gIH0sIDEwMCk7XG5cbn0pKGpRdWVyeSk7XG4iXX0=
