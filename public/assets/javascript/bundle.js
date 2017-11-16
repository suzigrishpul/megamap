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
      populateList: function populateList() {
        //using window.EVENT_DATA

        var $eventList = window.EVENTS_DATA.map(function (item) {
          return item.event_type !== 'Group' ? renderEvent(item) : renderGroup(item);
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
      plotPoints: function plotPoints(list) {

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
"use strict";

var autocompleteManager = void 0;
var mapManager = void 0;

(function ($) {

  // 1. google maps geocode

  // 2. focus map on geocode (via lat/lng)
  var queryManager = QueryManager();
  queryManager.initialize();

  var initParams = queryManager.getParameters();
  mapManager = MapManager();

  console.log("Initialized");
  window.initializeAutocompleteCallback = function () {
    console.log("Initialized");
    autocompleteManager = AutocompleteManager("input[name='loc']");
    autocompleteManager.initialize();
    console.log("Initialized");
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
    listManager.populateList();
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
    mapManager.plotPoints(opt.data);
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
      $(document).trigger('trigger-list-update');
      // $(document).trigger('trigger-list-filter-update', parameters);
      $(document).trigger('trigger-map-plot', { data: window.EVENTS_DATA });
      //TODO: Make the geojson conversion happen on the backend
    }
  });

  setTimeout(function () {
    $(document).trigger('trigger-list-filter-update', queryManager.getParameters());
    $(document).trigger('trigger-map-update', queryManager.getParameters());
    //console.log(queryManager.getParameters())
  }, 100);
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9sYW5ndWFnZS5qcyIsImNsYXNzZXMvbGlzdC5qcyIsImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9xdWVyeS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJBdXRvY29tcGxldGVNYW5hZ2VyIiwiJCIsInRhcmdldCIsIkFQSV9LRVkiLCJ0YXJnZXRJdGVtIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwicXVlcnlNZ3IiLCJRdWVyeU1hbmFnZXIiLCJnZW9jb2RlciIsImdvb2dsZSIsIm1hcHMiLCJHZW9jb2RlciIsIiR0YXJnZXQiLCJpbml0aWFsaXplIiwidHlwZWFoZWFkIiwiaGludCIsImhpZ2hsaWdodCIsIm1pbkxlbmd0aCIsImNsYXNzTmFtZXMiLCJtZW51IiwibmFtZSIsImRpc3BsYXkiLCJpdGVtIiwiZm9ybWF0dGVkX2FkZHJlc3MiLCJsaW1pdCIsInNvdXJjZSIsInEiLCJzeW5jIiwiYXN5bmMiLCJnZW9jb2RlIiwiYWRkcmVzcyIsInJlc3VsdHMiLCJzdGF0dXMiLCJvbiIsIm9iaiIsImRhdHVtIiwiZ2VvbWV0cnkiLCJ1cGRhdGVWaWV3cG9ydCIsInZpZXdwb3J0IiwialF1ZXJ5IiwiTGFuZ3VhZ2VNYW5hZ2VyIiwibGFuZ3VhZ2UiLCJkaWN0aW9uYXJ5IiwiJHRhcmdldHMiLCJ1cGRhdGVQYWdlTGFuZ3VhZ2UiLCJ0YXJnZXRMYW5ndWFnZSIsInJvd3MiLCJmaWx0ZXIiLCJpIiwibGFuZyIsImVhY2giLCJpbmRleCIsInRhcmdldEF0dHJpYnV0ZSIsImRhdGEiLCJsYW5nVGFyZ2V0IiwidGV4dCIsInZhbCIsImF0dHIiLCJ0YXJnZXRzIiwiYWpheCIsInVybCIsImRhdGFUeXBlIiwic3VjY2VzcyIsInVwZGF0ZUxhbmd1YWdlIiwiTGlzdE1hbmFnZXIiLCJ0YXJnZXRMaXN0IiwicmVuZGVyRXZlbnQiLCJkYXRlIiwibW9tZW50Iiwic3RhcnRfZGF0ZXRpbWUiLCJmb3JtYXQiLCJldmVudF90eXBlIiwibGF0IiwibG5nIiwidGl0bGUiLCJ2ZW51ZSIsInJlbmRlckdyb3VwIiwiZGV0YWlscyIsIiRsaXN0IiwidXBkYXRlRmlsdGVyIiwicCIsInJlbW92ZVByb3AiLCJhZGRDbGFzcyIsImpvaW4iLCJwb3B1bGF0ZUxpc3QiLCIkZXZlbnRMaXN0Iiwid2luZG93IiwiRVZFTlRTX0RBVEEiLCJtYXAiLCJmaW5kIiwicmVtb3ZlIiwiYXBwZW5kIiwiTWFwTWFuYWdlciIsInJlbmRlckdlb2pzb24iLCJsaXN0IiwicmVuZGVyZWQiLCJ0b0xvd2VyQ2FzZSIsInR5cGUiLCJjb29yZGluYXRlcyIsInByb3BlcnRpZXMiLCJldmVudFByb3BlcnRpZXMiLCJwb3B1cENvbnRlbnQiLCJjYWxsYmFjayIsIkwiLCJzZXRWaWV3IiwidGlsZUxheWVyIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsIiRtYXAiLCJzZXRCb3VuZHMiLCJib3VuZHMxIiwiYm91bmRzMiIsImJvdW5kcyIsImZpdEJvdW5kcyIsInNldENlbnRlciIsImNlbnRlciIsInpvb20iLCJnZXRDZW50ZXJCeUxvY2F0aW9uIiwibG9jYXRpb24iLCJmaWx0ZXJNYXAiLCJmaWx0ZXJzIiwiaGlkZSIsImZvckVhY2giLCJzaG93IiwicGxvdFBvaW50cyIsImdlb2pzb24iLCJmZWF0dXJlcyIsImdlb0pTT04iLCJwb2ludFRvTGF5ZXIiLCJmZWF0dXJlIiwibGF0bG5nIiwiZXZlbnRUeXBlIiwiZ2VvanNvbk1hcmtlck9wdGlvbnMiLCJyYWRpdXMiLCJmaWxsQ29sb3IiLCJjb2xvciIsIndlaWdodCIsIm9wYWNpdHkiLCJmaWxsT3BhY2l0eSIsImNsYXNzTmFtZSIsImNpcmNsZU1hcmtlciIsIm9uRWFjaEZlYXR1cmUiLCJsYXllciIsImJpbmRQb3B1cCIsInVwZGF0ZSIsImxhdExuZyIsInRhcmdldEZvcm0iLCJwcmV2aW91cyIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImZvcm0iLCJkZXBhcmFtIiwic2VyaWFsaXplIiwiaGFzaCIsInBhcmFtIiwidHJpZ2dlciIsImxlbmd0aCIsInBhcmFtcyIsInN1YnN0cmluZyIsImJvdW5kMSIsImJvdW5kMiIsImxvYyIsInByb3AiLCJnZXRQYXJhbWV0ZXJzIiwicGFyYW1ldGVycyIsInVwZGF0ZUxvY2F0aW9uIiwiZiIsImIiLCJKU09OIiwic3RyaW5naWZ5IiwidHJpZ2dlclN1Ym1pdCIsImF1dG9jb21wbGV0ZU1hbmFnZXIiLCJtYXBNYW5hZ2VyIiwicXVlcnlNYW5hZ2VyIiwiaW5pdFBhcmFtcyIsImNvbnNvbGUiLCJsb2ciLCJpbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2siLCJyZXN1bHQiLCJsYW5ndWFnZU1hbmFnZXIiLCJsaXN0TWFuYWdlciIsImV2ZW50Iiwib3B0aW9ucyIsInBhcnNlIiwib3B0IiwidG9nZ2xlQ2xhc3MiLCJjb3B5Iiwib2xkVVJMIiwib3JpZ2luYWxFdmVudCIsIm9sZEhhc2giLCJzZWFyY2giLCJjYWNoZSIsInNldFRpbWVvdXQiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7O0FBQ0EsSUFBTUEsc0JBQXVCLFVBQVNDLENBQVQsRUFBWTtBQUN2Qzs7QUFFQSxTQUFPLFVBQUNDLE1BQUQsRUFBWTs7QUFFakIsUUFBTUMsVUFBVSx5Q0FBaEI7QUFDQSxRQUFNQyxhQUFhLE9BQU9GLE1BQVAsSUFBaUIsUUFBakIsR0FBNEJHLFNBQVNDLGFBQVQsQ0FBdUJKLE1BQXZCLENBQTVCLEdBQTZEQSxNQUFoRjtBQUNBLFFBQU1LLFdBQVdDLGNBQWpCO0FBQ0EsUUFBSUMsV0FBVyxJQUFJQyxPQUFPQyxJQUFQLENBQVlDLFFBQWhCLEVBQWY7O0FBRUEsV0FBTztBQUNMQyxlQUFTWixFQUFFRyxVQUFGLENBREo7QUFFTEYsY0FBUUUsVUFGSDtBQUdMVSxrQkFBWSxzQkFBTTtBQUNoQmIsVUFBRUcsVUFBRixFQUFjVyxTQUFkLENBQXdCO0FBQ1pDLGdCQUFNLElBRE07QUFFWkMscUJBQVcsSUFGQztBQUdaQyxxQkFBVyxDQUhDO0FBSVpDLHNCQUFZO0FBQ1ZDLGtCQUFNO0FB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bnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vL0FQSSA6QUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXG5jb25zdCBBdXRvY29tcGxldGVNYW5hZ2VyID0gKGZ1bmN0aW9uKCQpIHtcbiAgLy9Jbml0aWFsaXphdGlvbi4uLlxuXG4gIHJldHVybiAodGFyZ2V0KSA9PiB7XG5cbiAgICBjb25zdCBBUElfS0VZID0gXCJBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cIjtcbiAgICBjb25zdCB0YXJnZXRJdGVtID0gdHlwZW9mIHRhcmdldCA9PSBcInN0cmluZ1wiID8gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpIDogdGFyZ2V0O1xuICAgIGNvbnN0IHF1ZXJ5TWdyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgdmFyIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgJHRhcmdldDogJCh0YXJnZXRJdGVtKSxcbiAgICAgIHRhcmdldDogdGFyZ2V0SXRlbSxcbiAgICAgIGluaXRpYWxpemU6ICgpID0+IHtcbiAgICAgICAgJCh0YXJnZXRJdGVtKS50eXBlYWhlYWQoe1xuICAgICAgICAgICAgICAgICAgICBoaW50OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1pbkxlbmd0aDogNCxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICAgIG1lbnU6ICd0dC1kcm9wZG93bi1tZW51J1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnc2VhcmNoLXJlc3VsdHMnLFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAoaXRlbSkgPT4gaXRlbS5mb3JtYXR0ZWRfYWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgbGltaXQ6IDEwLFxuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IGZ1bmN0aW9uIChxLCBzeW5jLCBhc3luYyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogcSB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFzeW5jKHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApLm9uKCd0eXBlYWhlYWQ6c2VsZWN0ZWQnLCBmdW5jdGlvbiAob2JqLCBkYXR1bSkge1xuICAgICAgICAgICAgICAgICAgICBpZihkYXR1bSlcbiAgICAgICAgICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgICAgICAgdmFyIGdlb21ldHJ5ID0gZGF0dW0uZ2VvbWV0cnk7XG4gICAgICAgICAgICAgICAgICAgICAgcXVlcnlNZ3IudXBkYXRlVmlld3BvcnQoZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgICAgIC8vICBtYXAuZml0Qm91bmRzKGdlb21ldHJ5LmJvdW5kcz8gZ2VvbWV0cnkuYm91bmRzIDogZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG5cblxuICAgIHJldHVybiB7XG5cbiAgICB9XG4gIH1cblxufShqUXVlcnkpKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTGFuZ3VhZ2VNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIC8va2V5VmFsdWVcblxuICAvL3RhcmdldHMgYXJlIHRoZSBtYXBwaW5ncyBmb3IgdGhlIGxhbmd1YWdlXG4gIHJldHVybiAoKSA9PiB7XG4gICAgbGV0IGxhbmd1YWdlO1xuICAgIGxldCBkaWN0aW9uYXJ5ID0ge307XG4gICAgbGV0ICR0YXJnZXRzID0gJChcIltkYXRhLWxhbmctdGFyZ2V0XVtkYXRhLWxhbmcta2V5XVwiKTtcblxuICAgIGNvbnN0IHVwZGF0ZVBhZ2VMYW5ndWFnZSA9ICgpID0+IHtcblxuICAgICAgbGV0IHRhcmdldExhbmd1YWdlID0gZGljdGlvbmFyeS5yb3dzLmZpbHRlcigoaSkgPT4gaS5sYW5nID09PSBsYW5ndWFnZSlbMF07XG5cbiAgICAgICR0YXJnZXRzLmVhY2goKGluZGV4LCBpdGVtKSA9PiB7XG4gICAgICAgIGxldCB0YXJnZXRBdHRyaWJ1dGUgPSAkKGl0ZW0pLmRhdGEoJ2xhbmctdGFyZ2V0Jyk7XG4gICAgICAgIGxldCBsYW5nVGFyZ2V0ID0gJChpdGVtKS5kYXRhKCdsYW5nLWtleScpO1xuXG4gICAgICAgIHN3aXRjaCh0YXJnZXRBdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjYXNlICd0ZXh0JzpcbiAgICAgICAgICAgICQoaXRlbSkudGV4dCh0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd2YWx1ZSc6XG4gICAgICAgICAgICAkKGl0ZW0pLnZhbCh0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgJChpdGVtKS5hdHRyKHRhcmdldEF0dHJpYnV0ZSwgdGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICBsYW5ndWFnZSxcbiAgICAgIHRhcmdldHM6ICR0YXJnZXRzLFxuICAgICAgZGljdGlvbmFyeSxcbiAgICAgIGluaXRpYWxpemU6IChsYW5nKSA9PiB7XG4vL2NvbnNvbGUubG9nKFwiJHRhcmdldHNcIiwgbGFuZyk7XG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgdXJsOiAnaHR0cDovL2dzeDJqc29uLmNvbS9hcGk/aWQ9MU8zZUJ5akwxdmxZZjdaN2FtLV9odFJUUWk3M1BhZnFJZk5CZExtWGU4U00mc2hlZXQ9MScsXG4gICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgZGljdGlvbmFyeSA9IGRhdGE7XG4gICAgICAgICAgICBsYW5ndWFnZSA9IGxhbmc7XG4gICAgICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZUxhbmd1YWdlOiAobGFuZykgPT4ge1xuLy9jb25zb2xlLmxvZyhcIk5ldyBMYW5nIDo6OiBcIiwgbGFuZyk7XG4gICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgdXBkYXRlUGFnZUxhbmd1YWdlKCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG59KShqUXVlcnkpO1xuIiwiLyogVGhpcyBsb2FkcyBhbmQgbWFuYWdlcyB0aGUgbGlzdCEgKi9cblxuY29uc3QgTGlzdE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRMaXN0ID0gXCIjZXZlbnRzLWxpc3RcIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0TGlzdCA9PT0gJ3N0cmluZycgPyAkKHRhcmdldExpc3QpIDogdGFyZ2V0TGlzdDtcblxuICAgIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0pID0+IHtcblxuICAgICAgdmFyIGRhdGUgPSBtb21lbnQoaXRlbS5zdGFydF9kYXRldGltZSkuZm9ybWF0KFwiZGRkZCDigKIgTU1NIEREIGg6bW1hXCIpO1xuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaSBjbGFzcz0nJHtpdGVtLmV2ZW50X3R5cGUgfHwgJyd9IEFjdGlvbicgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudCB0eXBlLWFjdGlvblwiPlxuICAgICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICAgIDxsaT4ke2l0ZW0uZXZlbnRfdHlwZX08L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPGgyPjxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZX08L2E+PC9oMj5cbiAgICAgICAgICA8aDQ+JHtkYXRlfTwvaDQ+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgICAgPHA+JHtpdGVtLnZlbnVlfTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCI+UlNWUDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICAgYFxuICAgIH07XG5cbiAgICBjb25zdCByZW5kZXJHcm91cCA9IChpdGVtKSA9PiB7XG5cbiAgICAgIHJldHVybiBgXG4gICAgICA8bGk+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwXCI+XG4gICAgICAgICAgPGgyPjxhIGhyZWY9XCIvXCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZSB8fCBgR3JvdXBgfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICAgIDxwPkNvbG9yYWRvLCBVU0E8L3A+XG4gICAgICAgICAgICA8cD4ke2l0ZW0uZGV0YWlscyB8fCBgMzUwIENvbG9yYWRvIGlzIHdvcmtpbmcgbG9jYWxseSB0byBoZWxwIGJ1aWxkIHRoZSBnbG9iYWxcbiAgICAgICAgICAgICAgIDM1MC5vcmcgbW92ZW1lbnQgdG8gc29sdmUgdGhlIGNsaW1hdGUgY3Jpc2lzIGFuZCB0cmFuc2l0aW9uXG4gICAgICAgICAgICAgICB0byBhIGNsZWFuLCByZW5ld2FibGUgZW5lcmd5IGZ1dHVyZS5gfVxuICAgICAgICAgICAgPC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICRsaXN0OiAkdGFyZ2V0LFxuICAgICAgdXBkYXRlRmlsdGVyOiAocCkgPT4ge1xuICAgICAgICBpZighcCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIFJlbW92ZSBGaWx0ZXJzXG5cbiAgICAgICAgJHRhcmdldC5yZW1vdmVQcm9wKFwiY2xhc3NcIik7XG4gICAgICAgICR0YXJnZXQuYWRkQ2xhc3MocC5maWx0ZXIgPyBwLmZpbHRlci5qb2luKFwiIFwiKSA6ICcnKVxuICAgICAgfSxcbiAgICAgIHBvcHVsYXRlTGlzdDogKCkgPT4ge1xuICAgICAgICAvL3VzaW5nIHdpbmRvdy5FVkVOVF9EQVRBXG5cbiAgICAgICAgdmFyICRldmVudExpc3QgPSB3aW5kb3cuRVZFTlRTX0RBVEEubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgIHJldHVybiBpdGVtLmV2ZW50X3R5cGUgIT09ICdHcm91cCcgPyByZW5kZXJFdmVudChpdGVtKSA6IHJlbmRlckdyb3VwKGl0ZW0pO1xuICAgICAgICB9KVxuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsIGxpJykucmVtb3ZlKCk7XG4gICAgICAgICR0YXJnZXQuZmluZCgndWwnKS5hcHBlbmQoJGV2ZW50TGlzdCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsIlxuY29uc3QgTWFwTWFuYWdlciA9ICgoJCkgPT4ge1xuXG4gIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0pID0+IHtcbiAgICB2YXIgZGF0ZSA9IG1vbWVudChpdGVtLnN0YXJ0X2RhdGV0aW1lKS5mb3JtYXQoXCJkZGRkIOKAoiBNTU0gREQgaDptbWFcIik7XG4gICAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPSdwb3B1cC1pdGVtICR7aXRlbS5ldmVudF90eXBlfScgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnRcIj5cbiAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgIDxsaT4ke2l0ZW0uZXZlbnRfdHlwZSB8fCAnQWN0aW9uJ308L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8aDI+PGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICA8aDQ+JHtkYXRlfTwvaDQ+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5SU1ZQPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICAgIGBcbiAgfTtcblxuICBjb25zdCByZW5kZXJHcm91cCA9IChpdGVtKSA9PiB7XG4gICAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPSdwb3B1cC1pdGVtICR7aXRlbS5ldmVudF90eXBlfScgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXBcIj5cbiAgICAgICAgPGgyPjxhIGhyZWY9XCIvXCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZSB8fCBgR3JvdXBgfTwvYT48L2gyPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgPHA+Q29sb3JhZG8sIFVTQTwvcD5cbiAgICAgICAgICA8cD4ke2l0ZW0uZGV0YWlscyB8fCBgMzUwIENvbG9yYWRvIGlzIHdvcmtpbmcgbG9jYWxseSB0byBoZWxwIGJ1aWxkIHRoZSBnbG9iYWxcbiAgICAgICAgICAgICAzNTAub3JnIG1vdmVtZW50IHRvIHNvbHZlIHRoZSBjbGltYXRlIGNyaXNpcyBhbmQgdHJhbnNpdGlvblxuICAgICAgICAgICAgIHRvIGEgY2xlYW4sIHJlbmV3YWJsZSBlbmVyZ3kgZnV0dXJlLmB9XG4gICAgICAgICAgPC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgYFxuICB9O1xuXG4gIGNvbnN0IHJlbmRlckdlb2pzb24gPSAobGlzdCkgPT4ge1xuICAgIHJldHVybiBsaXN0Lm1hcCgoaXRlbSkgPT4ge1xuICAgICAgLy8gcmVuZGVyZWQgZXZlbnRUeXBlXG4gICAgICBsZXQgcmVuZGVyZWQ7XG4gICAgICBpZiAoIWl0ZW0uZXZlbnRfdHlwZSB8fCAhaXRlbS5ldmVudF90eXBlLnRvTG93ZXJDYXNlKCkgIT09ICdncm91cCcpIHtcbiAgICAgICAgcmVuZGVyZWQgPSByZW5kZXJFdmVudChpdGVtKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlbmRlcmVkID0gcmVuZGVyR3JvdXAoaXRlbSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICB0eXBlOiBcIlBvaW50XCIsXG4gICAgICAgICAgY29vcmRpbmF0ZXM6IFtpdGVtLmxuZywgaXRlbS5sYXRdXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBldmVudFByb3BlcnRpZXM6IGl0ZW0sXG4gICAgICAgICAgcG9wdXBDb250ZW50OiByZW5kZXJlZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAoY2FsbGJhY2spID0+IHtcbiAgICB2YXIgbWFwID0gTC5tYXAoJ21hcCcpLnNldFZpZXcoWzM0Ljg4NTkzMDk0MDc1MzE3LCA1LjA5NzY1NjI1MDAwMDAwMV0sIDIpO1xuXG4gICAgTC50aWxlTGF5ZXIoJ2h0dHA6Ly97c30udGlsZS5vc20ub3JnL3t6fS97eH0ve3l9LnBuZycsIHtcbiAgICAgICAgYXR0cmlidXRpb246ICcmY29weTsgPGEgaHJlZj1cImh0dHA6Ly9vc20ub3JnL2NvcHlyaWdodFwiPk9wZW5TdHJlZXRNYXA8L2E+IGNvbnRyaWJ1dG9ycyDigKIgPGEgaHJlZj1cIi8vMzUwLm9yZ1wiPjM1MC5vcmc8L2E+J1xuICAgIH0pLmFkZFRvKG1hcCk7XG5cbiAgICBsZXQgZ2VvY29kZXIgPSBudWxsO1xuICAgIHJldHVybiB7XG4gICAgICAkbWFwOiBtYXAsXG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHNldEJvdW5kczogKGJvdW5kczEsIGJvdW5kczIpID0+IHtcbiAgICAgICAgY29uc3QgYm91bmRzID0gW2JvdW5kczEsIGJvdW5kczJdO1xuICAgICAgICBtYXAuZml0Qm91bmRzKGJvdW5kcyk7XG4gICAgICB9LFxuICAgICAgc2V0Q2VudGVyOiAoY2VudGVyLCB6b29tID0gMTApID0+IHtcbiAgICAgICAgaWYgKCFjZW50ZXIgfHwgIWNlbnRlclswXSB8fCBjZW50ZXJbMF0gPT0gXCJcIlxuICAgICAgICAgICAgICB8fCAhY2VudGVyWzFdIHx8IGNlbnRlclsxXSA9PSBcIlwiKSByZXR1cm47XG4gICAgICAgIG1hcC5zZXRWaWV3KGNlbnRlciwgem9vbSk7XG4gICAgICB9LFxuICAgICAgLy8gQ2VudGVyIGxvY2F0aW9uIGJ5IGdlb2NvZGVkXG4gICAgICBnZXRDZW50ZXJCeUxvY2F0aW9uOiAobG9jYXRpb24sIGNhbGxiYWNrKSA9PiB7XG4vL2NvbnNvbGUubG9nKFwiRmluZGluZyBsb2NhdGlvbiBvZiBcIiwgbG9jYXRpb24pO1xuICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogbG9jYXRpb24gfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuLy9jb25zb2xlLmxvZyhcIkxPQ0FUSU9OIE1BVENIOjogXCIsIHJlc3VsdHMsIHN0YXR1cyk7XG4gICAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2socmVzdWx0c1swXSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGZpbHRlck1hcDogKGZpbHRlcnMpID0+IHtcbi8vY29uc29sZS5sb2coXCJmaWx0ZXJzID4+IFwiLCBmaWx0ZXJzKTtcbiAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwXCIpLmhpZGUoKTtcbi8vY29uc29sZS5sb2coJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwXCIpKTtcblxuICAgICAgICBpZiAoIWZpbHRlcnMpIHJldHVybjtcblxuICAgICAgICBmaWx0ZXJzLmZvckVhY2goKGl0ZW0pID0+IHtcbi8vY29uc29sZS5sb2coXCIuZXZlbnQtaXRlbS1wb3B1cC5cIiArIGl0ZW0udG9Mb3dlckNhc2UoKSk7XG4gICAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwLlwiICsgaXRlbS50b0xvd2VyQ2FzZSgpKS5zaG93KCk7XG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgcGxvdFBvaW50czogKGxpc3QpID0+IHtcblxuICAgICAgICBjb25zdCBnZW9qc29uID0ge1xuICAgICAgICAgIHR5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgICAgICAgICBmZWF0dXJlczogcmVuZGVyR2VvanNvbihsaXN0KVxuICAgICAgICB9O1xuXG5cblxuICAgICAgICBMLmdlb0pTT04oZ2VvanNvbiwge1xuICAgICAgICAgICAgcG9pbnRUb0xheWVyOiAoZmVhdHVyZSwgbGF0bG5nKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuZXZlbnRfdHlwZTtcbiAgICAgICAgICAgICAgdmFyIGdlb2pzb25NYXJrZXJPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgICAgcmFkaXVzOiA4LFxuICAgICAgICAgICAgICAgICAgZmlsbENvbG9yOiAgZXZlbnRUeXBlID09PSAnR3JvdXAnID8gXCIjNDBEN0Q0XCIgOiBcIiMwRjgxRThcIixcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiBcIndoaXRlXCIsXG4gICAgICAgICAgICAgICAgICB3ZWlnaHQ6IDIsXG4gICAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLjUsXG4gICAgICAgICAgICAgICAgICBmaWxsT3BhY2l0eTogMC44LFxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAoZXZlbnRUeXBlID09PSAnR3JvdXAnID8gJ2dyb3VwcycgOiAnZXZlbnRzJykgKyAnIGV2ZW50LWl0ZW0tcG9wdXAnXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJldHVybiBMLmNpcmNsZU1hcmtlcihsYXRsbmcsIGdlb2pzb25NYXJrZXJPcHRpb25zKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICBvbkVhY2hGZWF0dXJlOiAoZmVhdHVyZSwgbGF5ZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChmZWF0dXJlLnByb3BlcnRpZXMgJiYgZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCkge1xuICAgICAgICAgICAgICBsYXllci5iaW5kUG9wdXAoZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgICB9LFxuICAgICAgdXBkYXRlOiAocCkgPT4ge1xuICAgICAgICBpZiAoIXAgfHwgIXAubGF0IHx8ICFwLmxuZyApIHJldHVybjtcblxuICAgICAgICBtYXAuc2V0VmlldyhMLmxhdExuZyhwLmxhdCwgcC5sbmcpLCAxMCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsImNvbnN0IFF1ZXJ5TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldEZvcm0gPSBcImZvcm0jZmlsdGVycy1mb3JtXCIpID0+IHtcbiAgICBjb25zdCAkdGFyZ2V0ID0gdHlwZW9mIHRhcmdldEZvcm0gPT09ICdzdHJpbmcnID8gJCh0YXJnZXRGb3JtKSA6IHRhcmdldEZvcm07XG4gICAgbGV0IGxhdCA9IG51bGw7XG4gICAgbGV0IGxuZyA9IG51bGw7XG5cbiAgICBsZXQgcHJldmlvdXMgPSB7fTtcblxuICAgICR0YXJnZXQub24oJ3N1Ym1pdCcsIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBsYXQgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKCk7XG4gICAgICBsbmcgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKCk7XG5cbiAgICAgIHZhciBmb3JtID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuXG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICQucGFyYW0oZm9ybSk7XG4gICAgfSlcblxuICAgICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdJywgKCkgPT4ge1xuICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICB9KVxuXG5cbiAgICByZXR1cm4ge1xuICAgICAgaW5pdGlhbGl6ZTogKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdmFyIHBhcmFtcyA9ICQuZGVwYXJhbSh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkpXG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYW5nXVwiKS52YWwocGFyYW1zLmxhbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwocGFyYW1zLmxhdCk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChwYXJhbXMubG5nKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKHBhcmFtcy5ib3VuZDEpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwocGFyYW1zLmJvdW5kMik7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sb2NdXCIpLnZhbChwYXJhbXMubG9jKVxuXG4gICAgICAgICAgaWYgKHBhcmFtcy5maWx0ZXIpIHtcbiAgICAgICAgICAgICR0YXJnZXQuZmluZChcIi5maWx0ZXItaXRlbSBpbnB1dFt0eXBlPWNoZWNrYm94XVwiKS5yZW1vdmVQcm9wKFwiY2hlY2tlZFwiKTtcbiAgICAgICAgICAgIHBhcmFtcy5maWx0ZXIuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdW3ZhbHVlPSdcIiArIGl0ZW0gKyBcIiddXCIpLnByb3AoXCJjaGVja2VkXCIsIHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBnZXRQYXJhbWV0ZXJzOiAoKSA9PiB7XG4gICAgICAgIHZhciBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuICAgICAgICAvLyBwYXJhbWV0ZXJzWydsb2NhdGlvbiddIDtcblxuICAgICAgICByZXR1cm4gcGFyYW1ldGVycztcbiAgICAgIH0sXG4gICAgICB1cGRhdGVMb2NhdGlvbjogKGxhdCwgbG5nKSA9PiB7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwobGF0KTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChsbmcpO1xuICAgICAgICAvLyAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZVZpZXdwb3J0OiAodmlld3BvcnQpID0+IHtcblxuICAgICAgICBjb25zdCBib3VuZHMgPSBbW3ZpZXdwb3J0LmYuYiwgdmlld3BvcnQuYi5iXSwgW3ZpZXdwb3J0LmYuZiwgdmlld3BvcnQuYi5mXV07XG5cbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMF0pKTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMV0pKTtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyU3VibWl0OiAoKSA9PiB7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59KShqUXVlcnkpO1xuIiwibGV0IGF1dG9jb21wbGV0ZU1hbmFnZXI7XG5sZXQgbWFwTWFuYWdlcjtcblxuKGZ1bmN0aW9uKCQpIHtcblxuICAvLyAxLiBnb29nbGUgbWFwcyBnZW9jb2RlXG5cbiAgLy8gMi4gZm9jdXMgbWFwIG9uIGdlb2NvZGUgKHZpYSBsYXQvbG5nKVxuICBjb25zdCBxdWVyeU1hbmFnZXIgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICAgICAgcXVlcnlNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICBjb25zdCBpbml0UGFyYW1zID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcbiAgbWFwTWFuYWdlciA9IE1hcE1hbmFnZXIoKTtcblxuICBjb25zb2xlLmxvZyhcIkluaXRpYWxpemVkXCIpO1xuICB3aW5kb3cuaW5pdGlhbGl6ZUF1dG9jb21wbGV0ZUNhbGxiYWNrID0gKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiSW5pdGlhbGl6ZWRcIik7XG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlciA9IEF1dG9jb21wbGV0ZU1hbmFnZXIoXCJpbnB1dFtuYW1lPSdsb2MnXVwiKTtcbiAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmluaXRpYWxpemUoKTtcbiAgICBjb25zb2xlLmxvZyhcIkluaXRpYWxpemVkXCIpO1xuICAgIGlmIChpbml0UGFyYW1zLmxvYyAmJiBpbml0UGFyYW1zLmxvYyAhPT0gJycpIHtcbiAgICAgIG1hcE1hbmFnZXIuaW5pdGlhbGl6ZSgoKSA9PiB7XG4gICAgICAgIG1hcE1hbmFnZXIuZ2V0Q2VudGVyQnlMb2NhdGlvbihpbml0UGFyYW1zLmxvYywgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIHF1ZXJ5TWFuYWdlci51cGRhdGVWaWV3cG9ydChyZXN1bHQuZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgfVxuICB9XG4vL2NvbnNvbGUubG9nKFwiTUFQIFwiLCBtYXBNYW5hZ2VyKTtcblxuICBjb25zdCBsYW5ndWFnZU1hbmFnZXIgPSBMYW5ndWFnZU1hbmFnZXIoKTtcbi8vY29uc29sZS5sb2cocXVlcnlNYW5hZ2VyLCBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpLCBpbml0UGFyYW1zKTtcbiAgbGFuZ3VhZ2VNYW5hZ2VyLmluaXRpYWxpemUoaW5pdFBhcmFtc1snbGFuZyddIHx8ICdlbicpO1xuXG4gIGNvbnN0IGxpc3RNYW5hZ2VyID0gTGlzdE1hbmFnZXIoKTtcblxuICBpZihpbml0UGFyYW1zLmxhdCAmJiBpbml0UGFyYW1zLmxuZykge1xuICAgIG1hcE1hbmFnZXIuc2V0Q2VudGVyKFtpbml0UGFyYW1zLmxhdCwgaW5pdFBhcmFtcy5sbmddKTtcbiAgfVxuXG4gIC8qKipcbiAgKiBMaXN0IEV2ZW50c1xuICAqIFRoaXMgd2lsbCB0cmlnZ2VyIHRoZSBsaXN0IHVwZGF0ZSBtZXRob2RcbiAgKi9cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICBsaXN0TWFuYWdlci5wb3B1bGF0ZUxpc3QoKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG5cbiAgICBsaXN0TWFuYWdlci51cGRhdGVGaWx0ZXIob3B0aW9ucyk7XG4gIH0pXG5cbiAgLyoqKlxuICAqIE1hcCBFdmVudHNcbiAgKi9cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIC8vIG1hcE1hbmFnZXIuc2V0Q2VudGVyKFtvcHRpb25zLmxhdCwgb3B0aW9ucy5sbmddKTtcbiAgICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMuYm91bmQxIHx8ICFvcHRpb25zLmJvdW5kMikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBib3VuZDEgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQxKTtcbiAgICB2YXIgYm91bmQyID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMik7XG4gICAgbWFwTWFuYWdlci5zZXRCb3VuZHMoYm91bmQxLCBib3VuZDIpO1xuICAgIC8vIGNvbnNvbGUubG9nKG9wdGlvbnMpXG4gIH0pO1xuICAvLyAzLiBtYXJrZXJzIG9uIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtcGxvdCcsIChlLCBvcHQpID0+IHtcbi8vY29uc29sZS5sb2cob3B0KTtcbiAgICBtYXBNYW5hZ2VyLnBsb3RQb2ludHMob3B0LmRhdGEpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicpO1xuICB9KVxuXG4gIC8vIEZpbHRlciBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLWZpbHRlcicsIChlLCBvcHQpID0+IHtcbiAgICBpZiAob3B0KSB7XG4gICAgICBtYXBNYW5hZ2VyLmZpbHRlck1hcChvcHQuZmlsdGVyKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZScsIChlLCBvcHQpID0+IHtcbiAgICBpZiAob3B0KSB7XG4gICAgICBsYW5ndWFnZU1hbmFnZXIudXBkYXRlTGFuZ3VhZ2Uob3B0LmxhbmcpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbiNzaG93LWhpZGUtbWFwJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ2JvZHknKS50b2dnbGVDbGFzcygnbWFwLXZpZXcnKVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgLy91cGRhdGUgZW1iZWQgbGluZVxuICAgIHZhciBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHQpKTtcbiAgICBkZWxldGUgY29weVsnbG5nJ107XG4gICAgZGVsZXRlIGNvcHlbJ2xhdCddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDEnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQyJ107XG5cbiAgICAkKCcjZW1iZWQtYXJlYSBpbnB1dFtuYW1lPWVtYmVkXScpLnZhbCgnaHR0cDovL21hcC4zNTAub3JnLnMzLXdlYnNpdGUtdXMtZWFzdC0xLmFtYXpvbmF3cy5jb20jJyArICQucGFyYW0oY29weSkpO1xuICB9KTtcblxuICAkKHdpbmRvdykub24oXCJoYXNoY2hhbmdlXCIsIChldmVudCkgPT4ge1xuICAgIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICBpZiAoaGFzaC5sZW5ndGggPT0gMCkgcmV0dXJuO1xuICAgIGNvbnN0IHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oaGFzaC5zdWJzdHJpbmcoMSkpO1xuICAgIGNvbnN0IG9sZFVSTCA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQub2xkVVJMO1xuXG5cbiAgICBjb25zdCBvbGRIYXNoID0gJC5kZXBhcmFtKG9sZFVSTC5zdWJzdHJpbmcob2xkVVJMLnNlYXJjaChcIiNcIikrMSkpO1xuXG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCBwYXJhbWV0ZXJzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuXG4gICAgLy8gU28gdGhhdCBjaGFuZ2UgaW4gZmlsdGVycyB3aWxsIG5vdCB1cGRhdGUgdGhpc1xuICAgIGlmIChvbGRIYXNoLmJvdW5kMSAhPT0gcGFyYW1ldGVycy5ib3VuZDEgfHwgb2xkSGFzaC5ib3VuZDIgIT09IHBhcmFtZXRlcnMuYm91bmQyKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG5cbiAgICAvLyBDaGFuZ2UgaXRlbXNcbiAgICBpZiAob2xkSGFzaC5sYW5nICE9PSBwYXJhbWV0ZXJzLmxhbmcpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgfVxuICB9KVxuXG4gIC8vIDQuIGZpbHRlciBvdXQgaXRlbXMgaW4gYWN0aXZpdHktYXJlYVxuXG4gIC8vIDUuIGdldCBtYXAgZWxlbWVudHNcblxuICAvLyA2LiBnZXQgR3JvdXAgZGF0YVxuXG4gIC8vIDcuIHByZXNlbnQgZ3JvdXAgZWxlbWVudHNcblxuICAkLmFqYXgoe1xuICAgIHVybDogJ2h0dHBzOi8vczMtdXMtd2VzdC0yLmFtYXpvbmF3cy5jb20vcHBsc21hcC1kYXRhL291dHB1dC8zNTBvcmctdGVzdC5qcy5neicsIC8vJ3wqKkRBVEFfU09VUkNFKip8JyxcbiAgICBkYXRhVHlwZTogJ3NjcmlwdCcsXG4gICAgY2FjaGU6IHRydWUsXG4gICAgc3VjY2VzczogKGRhdGEpID0+IHtcbiAgICAgIHZhciBwYXJhbWV0ZXJzID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuICAgICAgd2luZG93LkVWRU5UU19EQVRBLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgaXRlbVsnZXZlbnRfdHlwZSddID0gIWl0ZW0uZXZlbnRfdHlwZSA/ICdBY3Rpb24nIDogaXRlbS5ldmVudF90eXBlO1xuICAgICAgfSlcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC11cGRhdGUnKTtcbiAgICAgIC8vICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1wbG90JywgeyBkYXRhOiB3aW5kb3cuRVZFTlRTX0RBVEEgfSk7XG4gICAgICAvL1RPRE86IE1ha2UgdGhlIGdlb2pzb24gY29udmVyc2lvbiBoYXBwZW4gb24gdGhlIGJhY2tlbmRcbiAgICB9XG4gIH0pO1xuXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKSk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKSk7XG4vL2NvbnNvbGUubG9nKHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCkpXG4gIH0sIDEwMCk7XG5cbn0pKGpRdWVyeSk7XG4iXX0=
