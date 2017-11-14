"use strict";
//API :AIzaSyBujKTRw5uIXp_NHZgjYVDtBy1dbyNuGEM

var AutocompleteManager = function ($) {
  //Initialization...

  var API_KEY = "AIzaSyBujKTRw5uIXp_NHZgjYVDtBy1dbyNuGEM";

  return function (target) {

    var targetItem = typeof target == "string" ? document.querySelector(target) : target;
    var queryMgr = QueryManager();
    var geocoder = new google.maps.Geocoder();

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

    return {
      $target: $(targetItem),
      target: targetItem
    };
  };
}(jQuery);

var initializeAutocompleteCallback = function initializeAutocompleteCallback() {

  AutocompleteManager("input[name='search-location']");
};
"use strict";

var LanguageManager = function ($) {
  //keyValue

  //targets are the mappings for the language
  return function () {
    var lang = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'en';

    var language = lang;
    var dictionary = {};
    var $targets = $("[data-lang-target][data-lang-key]");

    console.log($targets);
    var updatePageLanguage = function updatePageLanguage() {

      $targets.each(function (index, item) {
        var targetAttribute = $(item).data('lang-target');
        var langTarget = $(item).data('lang-key');

        switch (targetAttribute) {
          case 'text':
            $(item).text(dictionary[language][langTarget]);
            break;
          case 'value':
            $(item).val(dictionary[language][langTarget]);
            break;
          default:
            $(item).setAttribute(targetAttribute, dictionary[language][langTarget]);
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
          url: '/data/lang.json',
          dataType: 'json',
          success: function success(data) {
            dictionary = data;
            language = lang;
            updatePageLanguage();
          }
        });
      },
      changeLanguage: function changeLanguage(lang) {}
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

  return function () {
    var map = L.map('map').setView([34.88593094075317, 5.097656250000001], 2);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors • <a href="//350.org">350.org</a>'
    }).addTo(map);

    // map.fitBounds([ [[40.7216015197085, -73.85174698029152], [40.7242994802915, -73.8490490197085]] ]);
    return {
      $map: map,
      setBounds: function setBounds(bounds1, bounds2) {
        var bounds = [bounds1, bounds2];
        map.fitBounds(bounds);
      },
      setCenter: function setCenter(center) {
        var zoom = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

        if (!center || !center[0] || center[0] == "" || !center[1] || center[1] == "") return;
        map.setView(center, zoom);
      },
      filterMap: function filterMap(filters) {
        console.log("filters >> ", filters);
        $("#map").find(".event-item-popup").hide();
        console.log($("#map").find(".event-item-popup"));

        if (!filters) return;

        filters.forEach(function (item) {
          console.log(".event-item-popup." + item.toLowerCase());
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
      delete form['search-location'];

      window.location.hash = $.param(form);
    });

    $(document).on('change', '.filter-item input[type=checkbox]', function () {
      $target.trigger('submit');
    });

    return {
      initialize: function initialize(callback) {
        if (window.location.hash.length > 0) {
          var params = $.deparam(window.location.hash.substring(1));
          $target.find("input[name=lat]").val(params.lat);
          $target.find("input[name=lng]").val(params.lng);
          $target.find("input[name=bound1]").val(params.bound1);
          $target.find("input[name=bound2]").val(params.bound2);

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
        delete parameters['search-location'];

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

(function ($) {

  // 1. google maps geocode

  // 2. focus map on geocode (via lat/lng)
  var queryManager = QueryManager();
  queryManager.initialize();

  var initParams = queryManager.getParameters();
  var mapManager = MapManager();

  var languageManager = LanguageManager();
  languageManager.initialize('en');

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
    mapManager.plotPoints(opt.data);
    $(document).trigger('trigger-map-filter');
  });

  // Filter map
  $(document).on('trigger-map-filter', function (e, opt) {
    console.log(opt);
    if (opt) {
      mapManager.filterMap(opt.filter);
    }
  });

  $(window).on("hashchange", function (event) {
    var hash = window.location.hash;
    if (hash.length == 0) return;
    var parameters = $.deparam(hash.substring(1));
    var oldURL = event.originalEvent.oldURL;

    var oldHash = $.deparam(oldURL.substring(oldURL.search("#") + 1));

    $(document).trigger('trigger-list-filter-update', parameters);
    $(document).trigger('trigger-map-filter', parameters);

    // So that change in filters will not update this
    if (oldHash.bound1 !== parameters.bound1 || oldHash.bound2 !== parameters.bound2) {
      $(document).trigger('trigger-map-update', parameters);
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
    console.log(queryManager.getParameters());
  }, 100);
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9sYW5ndWFnZS5qcyIsImNsYXNzZXMvbGlzdC5qcyIsImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9xdWVyeS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJBdXRvY29tcGxldGVNYW5hZ2VyIiwiJCIsIkFQSV9LRVkiLCJ0YXJnZXQiLCJ0YXJnZXRJdGVtIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwicXVlcnlNZ3IiLCJRdWVyeU1hbmFnZXIiLCJnZW9jb2RlciIsImdvb2dsZSIsIm1hcHMiLCJHZW9jb2RlciIsInR5cGVhaGVhZCIsImhpbnQiLCJoaWdobGlnaHQiLCJtaW5MZW5ndGgiLCJjbGFzc05hbWVzIiwibWVudSIsIm5hbWUiLCJkaXNwbGF5IiwiaXRlbSIsImZvcm1hdHRlZF9hZGRyZXNzIiwibGltaXQiLCJzb3VyY2UiLCJxIiwic3luYyIsImFzeW5jIiwiZ2VvY29kZSIsImFkZHJlc3MiLCJyZXN1bHRzIiwic3RhdHVzIiwib24iLCJvYmoiLCJkYXR1bSIsImdlb21ldHJ5IiwidXBkYXRlVmlld3BvcnQiLCJ2aWV3cG9ydCIsIiR0YXJnZXQiLCJqUXVlcnkiLCJpbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2siLCJMYW5ndWFnZU1hbmFnZXIiLCJsYW5nIiwibGFuZ3VhZ2UiLCJkaWN0aW9uYXJ5IiwiJHRhcmdldHMiLCJjb25zb2xlIiwibG9nIiwidXBkYXRlUGFnZUxhbmd1YWdlIiwiZWFjaCIsImluZGV4IiwidGFyZ2V0QXR0cmlidXRlIiwiZGF0YSIsImxhbmdUYXJnZXQiLCJ0ZXh0IiwidmFsIiwic2V0QXR0cmlidXRlIiwidGFyZ2V0cyIsImluaXRpYWxpemUiLCJhamF4IiwidXJsIiwiZGF0YVR5cGUiLCJzdWNjZXNzIiwiY2hhbmdlTGFuZ3VhZ2UiLCJMaXN0TWFuYWdlciIsInRhcmdldExpc3QiLCJyZW5kZXJFdmVudCIsImRhdGUiLCJtb21lbnQiLCJzdGFydF9kYXRldGltZSIsImZvcm1hdCIsImV2ZW50X3R5cGUiLCJsYXQiLCJsbmciLCJ0aXRsZSIsInZlbnVlIiwicmVuZGVyR3JvdXAiLCJkZXRhaWxzIiwiJGxpc3QiLCJ1cGRhdGVGaWx0ZXIiLCJwIiwicmVtb3ZlUHJvcCIsImFkZENsYXNzIiwiZmlsdGVyIiwiam9pbiIsInBvcHVsYXRlTGlzdCIsIiRldmVudExpc3QiLCJ3aW5kb3ciLCJFVkVOVFNfREFUQSIsIm1hcCIsImZpbmQiLCJyZW1vdmUiLCJhcHBlbmQiLCJNYXBNYW5hZ2VyIiwicmVuZGVyR2VvanNvbiIsImxpc3QiLCJyZW5kZXJlZCIsInRvTG93ZXJDYXNlIiwidHlwZSIsImNvb3JkaW5hdGVzIiwicHJvcGVydGllcyIsImV2ZW50UHJvcGVydGllcyIsInBvcHVwQ29udGVudCIsIkwiLCJzZXRWaWV3IiwidGlsZUxheWVyIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsIiRtYXAiLCJzZXRCb3VuZHMiLCJib3VuZHMxIiwiYm91bmRzMiIsImJvdW5kcyIsImZpdEJvdW5kcyIsInNldENlbnRlciIsImNlbnRlciIsInpvb20iLCJmaWx0ZXJNYXAiLCJmaWx0ZXJzIiwiaGlkZSIsImZvckVhY2giLCJzaG93IiwicGxvdFBvaW50cyIsImdlb2pzb24iLCJmZWF0dXJlcyIsImdlb0pTT04iLCJwb2ludFRvTGF5ZXIiLCJmZWF0dXJlIiwibGF0bG5nIiwiZXZlbnRUeXBlIiwiZ2VvanNvbk1hcmtlck9wdGlvbnMiLCJyYWRpdXMiLCJmaWxsQ29sb3IiLCJjb2xvciIsIndlaWdodCIsIm9wYWNpdHkiLCJmaWxsT3BhY2l0eSIsImNsYXNzTmFtZSIsImNpcmNsZU1hcmtlciIsIm9uRWFjaEZlYXR1cmUiLCJsYXllciIsImJpbmRQb3B1cCIsInVwZGF0ZSIsImxhdExuZyIsInRhcmdldEZvcm0iLCJwcmV2aW91cyIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImZvcm0iLCJkZXBhcmFtIiwic2VyaWFsaXplIiwibG9jYXRpb24iLCJoYXNoIiwicGFyYW0iLCJ0cmlnZ2VyIiwiY2FsbGJhY2siLCJsZW5ndGgiLCJwYXJhbXMiLCJzdWJzdHJpbmciLCJib3VuZDEiLCJib3VuZDIiLCJwcm9wIiwiZ2V0UGFyYW1ldGVycyIsInBhcmFtZXRlcnMiLCJ1cGRhdGVMb2NhdGlvbiIsImYiLCJiIiwiSlNPTiIsInN0cmluZ2lmeSIsInRyaWdnZXJTdWJtaXQiLCJxdWVyeU1hbmFnZXIiLCJpbml0UGFyYW1zIiwibWFwTWFuYWdlciIsImxhbmd1YWdlTWFuYWdlciIsImxpc3RNYW5hZ2VyIiwiZXZlbnQiLCJvcHRpb25zIiwicGFyc2UiLCJvcHQiLCJvbGRVUkwiLCJvcmlnaW5hbEV2ZW50Iiwib2xkSGFzaCIsInNlYXJjaCIsImNhY2hlIiwic2V0VGltZW91dCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7QUFDQSxJQUFNQSxzQkFBdUIsVUFBU0MsQ0FBVCxFQUFZO0FBQ3ZDOztBQUVBLE1BQU1DLFVBQVUseUNBQWhCOztBQUVBLFNBQU8sVUFBQ0MsTUFBRCxFQUFZOztBQUVqQixRQUFNQyxhQUFhLE9BQU9ELE1BQVAsSUFBaUIsUUFBakIsR0FBNEJFLFNBQVNDLGFBQVQsQ0FBdUJILE1BQXZCLENBQTVCLEdBQTZEQSxNQUFoRjtBQUNBLFFBQU1JLFdBQVdDLGNBQWpCO0FBQ0EsUUFBSUMsV0FBVyxJQUFJQyxPQUFPQyxJQUFQLENBQVlDLFFBQWhCLEVBQWY7O0FBRUFYLE1BQUVHLFVBQUYsRUFBY1MsU0FBZCxDQUF3QjtBQUNaQyxZQUFNLElBRE07QUFFWkMsaUJBQVcsSUFGQztBQUdaQyxpQkFBVyxDQUhDO0FBSVpDLGtCQUFZO0FBQ1ZDLGNBQU07QUFESTtBQUpBLEtBQXhCLEVBUVU7QUFDRUMsWUFBTSxnQkFEUjtBQUVFQyxlQUFTLGlCQUFDQyxJQUFEO0FBQUEsZUFBVUEsS0FBS0MsaUJBQWY7QUFBQSxPQUZYO0FBR0VDLGFBQU8sRUFIVDtBQUlFQyxjQUFRLGdCQUFVQyxDQUFWLEVBQWFDLElBQWIsRUFBbUJDLEtBQW5CLEVBQXlCO0FBQzdCbEIsaUJBQVNt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QUlHLEdBSkg7QUFNRCxDQTlHRCxFQThHRzNILE1BOUdIIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuLy9BUEkgOkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVxuY29uc3QgQXV0b2NvbXBsZXRlTWFuYWdlciA9IChmdW5jdGlvbigkKSB7XG4gIC8vSW5pdGlhbGl6YXRpb24uLi5cblxuICBjb25zdCBBUElfS0VZID0gXCJBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cIjtcblxuICByZXR1cm4gKHRhcmdldCkgPT4ge1xuXG4gICAgY29uc3QgdGFyZ2V0SXRlbSA9IHR5cGVvZiB0YXJnZXQgPT0gXCJzdHJpbmdcIiA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KSA6IHRhcmdldDtcbiAgICBjb25zdCBxdWVyeU1nciA9IFF1ZXJ5TWFuYWdlcigpO1xuICAgIHZhciBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuXG4gICAgJCh0YXJnZXRJdGVtKS50eXBlYWhlYWQoe1xuICAgICAgICAgICAgICAgIGhpbnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgaGlnaGxpZ2h0OiB0cnVlLFxuICAgICAgICAgICAgICAgIG1pbkxlbmd0aDogNCxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWVzOiB7XG4gICAgICAgICAgICAgICAgICBtZW51OiAndHQtZHJvcGRvd24tbWVudSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnc2VhcmNoLXJlc3VsdHMnLFxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IChpdGVtKSA9PiBpdGVtLmZvcm1hdHRlZF9hZGRyZXNzLFxuICAgICAgICAgICAgICAgIGxpbWl0OiAxMCxcbiAgICAgICAgICAgICAgICBzb3VyY2U6IGZ1bmN0aW9uIChxLCBzeW5jLCBhc3luYyl7XG4gICAgICAgICAgICAgICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBxIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICBhc3luYyhyZXN1bHRzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApLm9uKCd0eXBlYWhlYWQ6c2VsZWN0ZWQnLCBmdW5jdGlvbiAob2JqLCBkYXR1bSkge1xuICAgICAgICAgICAgICAgIGlmKGRhdHVtKVxuICAgICAgICAgICAgICAgIHtcblxuICAgICAgICAgICAgICAgICAgdmFyIGdlb21ldHJ5ID0gZGF0dW0uZ2VvbWV0cnk7XG4gICAgICAgICAgICAgICAgICBxdWVyeU1nci51cGRhdGVWaWV3cG9ydChnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgICAvLyAgbWFwLmZpdEJvdW5kcyhnZW9tZXRyeS5ib3VuZHM/IGdlb21ldHJ5LmJvdW5kcyA6IGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuXG4gICAgcmV0dXJuIHtcbiAgICAgICR0YXJnZXQ6ICQodGFyZ2V0SXRlbSksXG4gICAgICB0YXJnZXQ6IHRhcmdldEl0ZW1cbiAgICB9XG4gIH1cblxufShqUXVlcnkpKTtcblxuY29uc3QgaW5pdGlhbGl6ZUF1dG9jb21wbGV0ZUNhbGxiYWNrID0gKCkgPT4ge1xuXG5cbiAgQXV0b2NvbXBsZXRlTWFuYWdlcihcImlucHV0W25hbWU9J3NlYXJjaC1sb2NhdGlvbiddXCIpO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTGFuZ3VhZ2VNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIC8va2V5VmFsdWVcblxuICAvL3RhcmdldHMgYXJlIHRoZSBtYXBwaW5ncyBmb3IgdGhlIGxhbmd1YWdlXG4gIHJldHVybiAobGFuZyA9ICdlbicpID0+IHtcbiAgICBsZXQgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgIGxldCBkaWN0aW9uYXJ5ID0ge307XG4gICAgbGV0ICR0YXJnZXRzID0gJChcIltkYXRhLWxhbmctdGFyZ2V0XVtkYXRhLWxhbmcta2V5XVwiKTtcblxuICAgIGNvbnNvbGUubG9nKCR0YXJnZXRzKTtcbiAgICBjb25zdCB1cGRhdGVQYWdlTGFuZ3VhZ2UgPSAoKSA9PiB7XG5cbiAgICAgICR0YXJnZXRzLmVhY2goKGluZGV4LCBpdGVtKSA9PiB7XG4gICAgICAgIGxldCB0YXJnZXRBdHRyaWJ1dGUgPSAkKGl0ZW0pLmRhdGEoJ2xhbmctdGFyZ2V0Jyk7XG4gICAgICAgIGxldCBsYW5nVGFyZ2V0ID0gJChpdGVtKS5kYXRhKCdsYW5nLWtleScpO1xuXG4gICAgICAgIHN3aXRjaCh0YXJnZXRBdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjYXNlICd0ZXh0JzpcbiAgICAgICAgICAgICQoaXRlbSkudGV4dChkaWN0aW9uYXJ5W2xhbmd1YWdlXVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd2YWx1ZSc6XG4gICAgICAgICAgICAkKGl0ZW0pLnZhbChkaWN0aW9uYXJ5W2xhbmd1YWdlXVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgJChpdGVtKS5zZXRBdHRyaWJ1dGUodGFyZ2V0QXR0cmlidXRlLCBkaWN0aW9uYXJ5W2xhbmd1YWdlXVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGxhbmd1YWdlLFxuICAgICAgdGFyZ2V0czogJHRhcmdldHMsXG4gICAgICBkaWN0aW9uYXJ5LFxuICAgICAgaW5pdGlhbGl6ZTogKGxhbmcpID0+IHtcbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICB1cmw6ICcvZGF0YS9sYW5nLmpzb24nLFxuICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgc3VjY2VzczogKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGRpY3Rpb25hcnkgPSBkYXRhO1xuICAgICAgICAgICAgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgICAgICAgICAgdXBkYXRlUGFnZUxhbmd1YWdlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBjaGFuZ2VMYW5ndWFnZTogKGxhbmcpID0+IHtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbn0pKGpRdWVyeSk7XG4iLCIvKiBUaGlzIGxvYWRzIGFuZCBtYW5hZ2VzIHRoZSBsaXN0ISAqL1xuXG5jb25zdCBMaXN0TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldExpc3QgPSBcIiNldmVudHMtbGlzdFwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRMaXN0ID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0TGlzdCkgOiB0YXJnZXRMaXN0O1xuXG4gICAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSkgPT4ge1xuXG4gICAgICB2YXIgZGF0ZSA9IG1vbWVudChpdGVtLnN0YXJ0X2RhdGV0aW1lKS5mb3JtYXQoXCJkZGRkIOKAoiBNTU0gREQgaDptbWFcIik7XG4gICAgICByZXR1cm4gYFxuICAgICAgPGxpIGNsYXNzPScke2l0ZW0uZXZlbnRfdHlwZSB8fCAnJ30gQWN0aW9uJyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50IHR5cGUtYWN0aW9uXCI+XG4gICAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgICAgPGxpPiR7aXRlbS5ldmVudF90eXBlfTwvbGk+XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICAgIDxoND4ke2RhdGV9PC9oND5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5SU1ZQPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIGNvbnN0IHJlbmRlckdyb3VwID0gKGl0ZW0pID0+IHtcblxuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaT5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXBcIj5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIi9cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlIHx8IGBHcm91cGB9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgICAgPHA+Q29sb3JhZG8sIFVTQTwvcD5cbiAgICAgICAgICAgIDxwPiR7aXRlbS5kZXRhaWxzIHx8IGAzNTAgQ29sb3JhZG8gaXMgd29ya2luZyBsb2NhbGx5IHRvIGhlbHAgYnVpbGQgdGhlIGdsb2JhbFxuICAgICAgICAgICAgICAgMzUwLm9yZyBtb3ZlbWVudCB0byBzb2x2ZSB0aGUgY2xpbWF0ZSBjcmlzaXMgYW5kIHRyYW5zaXRpb25cbiAgICAgICAgICAgICAgIHRvIGEgY2xlYW4sIHJlbmV3YWJsZSBlbmVyZ3kgZnV0dXJlLmB9XG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiLy8ke2l0ZW0udXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPkdldCBJbnZvbHZlZDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICAgYFxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgJGxpc3Q6ICR0YXJnZXQsXG4gICAgICB1cGRhdGVGaWx0ZXI6IChwKSA9PiB7XG4gICAgICAgIGlmKCFwKSByZXR1cm47XG5cbiAgICAgICAgLy8gUmVtb3ZlIEZpbHRlcnNcblxuICAgICAgICAkdGFyZ2V0LnJlbW92ZVByb3AoXCJjbGFzc1wiKTtcbiAgICAgICAgJHRhcmdldC5hZGRDbGFzcyhwLmZpbHRlciA/IHAuZmlsdGVyLmpvaW4oXCIgXCIpIDogJycpXG4gICAgICB9LFxuICAgICAgcG9wdWxhdGVMaXN0OiAoKSA9PiB7XG4gICAgICAgIC8vdXNpbmcgd2luZG93LkVWRU5UX0RBVEFcblxuICAgICAgICB2YXIgJGV2ZW50TGlzdCA9IHdpbmRvdy5FVkVOVFNfREFUQS5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGl0ZW0uZXZlbnRfdHlwZSAhPT0gJ0dyb3VwJyA/IHJlbmRlckV2ZW50KGl0ZW0pIDogcmVuZGVyR3JvdXAoaXRlbSk7XG4gICAgICAgIH0pXG4gICAgICAgICR0YXJnZXQuZmluZCgndWwgbGknKS5yZW1vdmUoKTtcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCcpLmFwcGVuZCgkZXZlbnRMaXN0KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiXG5jb25zdCBNYXBNYW5hZ2VyID0gKCgkKSA9PiB7XG5cbiAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSkgPT4ge1xuICAgIHZhciBkYXRlID0gbW9tZW50KGl0ZW0uc3RhcnRfZGF0ZXRpbWUpLmZvcm1hdChcImRkZGQg4oCiIE1NTSBERCBoOm1tYVwiKTtcbiAgICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9J3BvcHVwLWl0ZW0gJHtpdGVtLmV2ZW50X3R5cGV9JyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudFwiPlxuICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgPGxpPiR7aXRlbS5ldmVudF90eXBlIHx8ICdBY3Rpb24nfTwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxoMj48YSBocmVmPVwiLy8ke2l0ZW0udXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgIDxoND4ke2RhdGV9PC9oND5cbiAgICAgICAgPGRpdiBjbGFzcz1cImFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgIDxwPiR7aXRlbS52ZW51ZX08L3A+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiLy8ke2l0ZW0udXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPlJTVlA8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgYFxuICB9O1xuXG4gIGNvbnN0IHJlbmRlckdyb3VwID0gKGl0ZW0pID0+IHtcbiAgICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9J3BvcHVwLWl0ZW0gJHtpdGVtLmV2ZW50X3R5cGV9JyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ncm91cFwiPlxuICAgICAgICA8aDI+PGEgaHJlZj1cIi9cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlIHx8IGBHcm91cGB9PC9hPjwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICA8cD5Db2xvcmFkbywgVVNBPC9wPlxuICAgICAgICAgIDxwPiR7aXRlbS5kZXRhaWxzIHx8IGAzNTAgQ29sb3JhZG8gaXMgd29ya2luZyBsb2NhbGx5IHRvIGhlbHAgYnVpbGQgdGhlIGdsb2JhbFxuICAgICAgICAgICAgIDM1MC5vcmcgbW92ZW1lbnQgdG8gc29sdmUgdGhlIGNsaW1hdGUgY3Jpc2lzIGFuZCB0cmFuc2l0aW9uXG4gICAgICAgICAgICAgdG8gYSBjbGVhbiwgcmVuZXdhYmxlIGVuZXJneSBmdXR1cmUuYH1cbiAgICAgICAgICA8L3A+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiLy8ke2l0ZW0udXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPkdldCBJbnZvbHZlZDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR2VvanNvbiA9IChsaXN0KSA9PiB7XG4gICAgcmV0dXJuIGxpc3QubWFwKChpdGVtKSA9PiB7XG4gICAgICAvLyByZW5kZXJlZCBldmVudFR5cGVcbiAgICAgIGxldCByZW5kZXJlZDtcbiAgICAgIGlmICghaXRlbS5ldmVudF90eXBlIHx8ICFpdGVtLmV2ZW50X3R5cGUudG9Mb3dlckNhc2UoKSAhPT0gJ2dyb3VwJykge1xuICAgICAgICByZW5kZXJlZCA9IHJlbmRlckV2ZW50KGl0ZW0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVuZGVyZWQgPSByZW5kZXJHcm91cChpdGVtKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgIHR5cGU6IFwiUG9pbnRcIixcbiAgICAgICAgICBjb29yZGluYXRlczogW2l0ZW0ubG5nLCBpdGVtLmxhdF1cbiAgICAgICAgfSxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIGV2ZW50UHJvcGVydGllczogaXRlbSxcbiAgICAgICAgICBwb3B1cENvbnRlbnQ6IHJlbmRlcmVkXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuICgpID0+IHtcbiAgICB2YXIgbWFwID0gTC5tYXAoJ21hcCcpLnNldFZpZXcoWzM0Ljg4NTkzMDk0MDc1MzE3LCA1LjA5NzY1NjI1MDAwMDAwMV0sIDIpO1xuXG4gICAgTC50aWxlTGF5ZXIoJ2h0dHA6Ly97c30udGlsZS5vc20ub3JnL3t6fS97eH0ve3l9LnBuZycsIHtcbiAgICAgICAgYXR0cmlidXRpb246ICcmY29weTsgPGEgaHJlZj1cImh0dHA6Ly9vc20ub3JnL2NvcHlyaWdodFwiPk9wZW5TdHJlZXRNYXA8L2E+IGNvbnRyaWJ1dG9ycyDigKIgPGEgaHJlZj1cIi8vMzUwLm9yZ1wiPjM1MC5vcmc8L2E+J1xuICAgIH0pLmFkZFRvKG1hcCk7XG5cbiAgICAvLyBtYXAuZml0Qm91bmRzKFsgW1s0MC43MjE2MDE1MTk3MDg1LCAtNzMuODUxNzQ2OTgwMjkxNTJdLCBbNDAuNzI0Mjk5NDgwMjkxNSwgLTczLjg0OTA0OTAxOTcwODVdXSBdKTtcbiAgICByZXR1cm4ge1xuICAgICAgJG1hcDogbWFwLFxuICAgICAgc2V0Qm91bmRzOiAoYm91bmRzMSwgYm91bmRzMikgPT4ge1xuICAgICAgICBjb25zdCBib3VuZHMgPSBbYm91bmRzMSwgYm91bmRzMl07XG4gICAgICAgIG1hcC5maXRCb3VuZHMoYm91bmRzKTtcbiAgICAgIH0sXG4gICAgICBzZXRDZW50ZXI6IChjZW50ZXIsIHpvb20gPSAxMCkgPT4ge1xuICAgICAgICBpZiAoIWNlbnRlciB8fCAhY2VudGVyWzBdIHx8IGNlbnRlclswXSA9PSBcIlwiXG4gICAgICAgICAgICAgIHx8ICFjZW50ZXJbMV0gfHwgY2VudGVyWzFdID09IFwiXCIpIHJldHVybjtcbiAgICAgICAgbWFwLnNldFZpZXcoY2VudGVyLCB6b29tKTtcbiAgICAgIH0sXG4gICAgICBmaWx0ZXJNYXA6IChmaWx0ZXJzKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZmlsdGVycyA+PiBcIiwgZmlsdGVycyk7XG4gICAgICAgICQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cFwiKS5oaWRlKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cFwiKSk7XG5cbiAgICAgICAgaWYgKCFmaWx0ZXJzKSByZXR1cm47XG5cbiAgICAgICAgZmlsdGVycy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCIuZXZlbnQtaXRlbS1wb3B1cC5cIiArIGl0ZW0udG9Mb3dlckNhc2UoKSk7XG4gICAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwLlwiICsgaXRlbS50b0xvd2VyQ2FzZSgpKS5zaG93KCk7XG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgcGxvdFBvaW50czogKGxpc3QpID0+IHtcblxuICAgICAgICBjb25zdCBnZW9qc29uID0ge1xuICAgICAgICAgIHR5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgICAgICAgICBmZWF0dXJlczogcmVuZGVyR2VvanNvbihsaXN0KVxuICAgICAgICB9O1xuXG5cblxuICAgICAgICBMLmdlb0pTT04oZ2VvanNvbiwge1xuICAgICAgICAgICAgcG9pbnRUb0xheWVyOiAoZmVhdHVyZSwgbGF0bG5nKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuZXZlbnRfdHlwZTtcbiAgICAgICAgICAgICAgdmFyIGdlb2pzb25NYXJrZXJPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgICAgcmFkaXVzOiA4LFxuICAgICAgICAgICAgICAgICAgZmlsbENvbG9yOiAgZXZlbnRUeXBlID09PSAnR3JvdXAnID8gXCIjNDBEN0Q0XCIgOiBcIiMwRjgxRThcIixcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiBcIndoaXRlXCIsXG4gICAgICAgICAgICAgICAgICB3ZWlnaHQ6IDIsXG4gICAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLjUsXG4gICAgICAgICAgICAgICAgICBmaWxsT3BhY2l0eTogMC44LFxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAoZXZlbnRUeXBlID09PSAnR3JvdXAnID8gJ2dyb3VwcycgOiAnZXZlbnRzJykgKyAnIGV2ZW50LWl0ZW0tcG9wdXAnXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJldHVybiBMLmNpcmNsZU1hcmtlcihsYXRsbmcsIGdlb2pzb25NYXJrZXJPcHRpb25zKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICBvbkVhY2hGZWF0dXJlOiAoZmVhdHVyZSwgbGF5ZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChmZWF0dXJlLnByb3BlcnRpZXMgJiYgZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCkge1xuICAgICAgICAgICAgICBsYXllci5iaW5kUG9wdXAoZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgICB9LFxuICAgICAgdXBkYXRlOiAocCkgPT4ge1xuICAgICAgICBpZiAoIXAgfHwgIXAubGF0IHx8ICFwLmxuZyApIHJldHVybjtcblxuICAgICAgICBtYXAuc2V0VmlldyhMLmxhdExuZyhwLmxhdCwgcC5sbmcpLCAxMCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsImNvbnN0IFF1ZXJ5TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldEZvcm0gPSBcImZvcm0jZmlsdGVycy1mb3JtXCIpID0+IHtcbiAgICBjb25zdCAkdGFyZ2V0ID0gdHlwZW9mIHRhcmdldEZvcm0gPT09ICdzdHJpbmcnID8gJCh0YXJnZXRGb3JtKSA6IHRhcmdldEZvcm07XG4gICAgbGV0IGxhdCA9IG51bGw7XG4gICAgbGV0IGxuZyA9IG51bGw7XG5cbiAgICBsZXQgcHJldmlvdXMgPSB7fTtcblxuICAgICR0YXJnZXQub24oJ3N1Ym1pdCcsIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBsYXQgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKCk7XG4gICAgICBsbmcgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKCk7XG5cbiAgICAgIHZhciBmb3JtID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuICAgICAgZGVsZXRlIGZvcm1bJ3NlYXJjaC1sb2NhdGlvbiddO1xuXG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICQucGFyYW0oZm9ybSk7XG4gICAgfSlcblxuICAgICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdJywgKCkgPT4ge1xuICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICB9KVxuXG5cbiAgICByZXR1cm4ge1xuICAgICAgaW5pdGlhbGl6ZTogKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdmFyIHBhcmFtcyA9ICQuZGVwYXJhbSh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkpXG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChwYXJhbXMubGF0KTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKHBhcmFtcy5sbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwocGFyYW1zLmJvdW5kMSk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChwYXJhbXMuYm91bmQyKTtcblxuICAgICAgICAgIGlmIChwYXJhbXMuZmlsdGVyKSB7XG4gICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF1cIikucmVtb3ZlUHJvcChcImNoZWNrZWRcIik7XG4gICAgICAgICAgICBwYXJhbXMuZmlsdGVyLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICAgICR0YXJnZXQuZmluZChcIi5maWx0ZXItaXRlbSBpbnB1dFt0eXBlPWNoZWNrYm94XVt2YWx1ZT0nXCIgKyBpdGVtICsgXCInXVwiKS5wcm9wKFwiY2hlY2tlZFwiLCB0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZ2V0UGFyYW1ldGVyczogKCkgPT4ge1xuICAgICAgICB2YXIgcGFyYW1ldGVycyA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcbiAgICAgICAgZGVsZXRlIHBhcmFtZXRlcnNbJ3NlYXJjaC1sb2NhdGlvbiddO1xuXG4gICAgICAgIHJldHVybiBwYXJhbWV0ZXJzO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZUxvY2F0aW9uOiAobGF0LCBsbmcpID0+IHtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChsYXQpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKGxuZyk7XG4gICAgICAgIC8vICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlVmlld3BvcnQ6ICh2aWV3cG9ydCkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtbdmlld3BvcnQuZi5iLCB2aWV3cG9ydC5iLmJdLCBbdmlld3BvcnQuZi5mLCB2aWV3cG9ydC5iLmZdXTtcblxuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1swXSkpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1sxXSkpO1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHRyaWdnZXJTdWJtaXQ6ICgpID0+IHtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCIoZnVuY3Rpb24oJCkge1xuXG4gIC8vIDEuIGdvb2dsZSBtYXBzIGdlb2NvZGVcblxuICAvLyAyLiBmb2N1cyBtYXAgb24gZ2VvY29kZSAodmlhIGxhdC9sbmcpXG4gIGNvbnN0IHF1ZXJ5TWFuYWdlciA9IFF1ZXJ5TWFuYWdlcigpO1xuICAgICAgICBxdWVyeU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuXG4gIGNvbnN0IGluaXRQYXJhbXMgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuICBjb25zdCBtYXBNYW5hZ2VyID0gTWFwTWFuYWdlcigpO1xuXG4gIGNvbnN0IGxhbmd1YWdlTWFuYWdlciA9IExhbmd1YWdlTWFuYWdlcigpO1xuICBsYW5ndWFnZU1hbmFnZXIuaW5pdGlhbGl6ZSgnZW4nKTtcblxuICBjb25zdCBsaXN0TWFuYWdlciA9IExpc3RNYW5hZ2VyKCk7XG5cbiAgaWYoaW5pdFBhcmFtcy5sYXQgJiYgaW5pdFBhcmFtcy5sbmcpIHtcbiAgICBtYXBNYW5hZ2VyLnNldENlbnRlcihbaW5pdFBhcmFtcy5sYXQsIGluaXRQYXJhbXMubG5nXSk7XG4gIH1cblxuICAvKioqXG4gICogTGlzdCBFdmVudHNcbiAgKiBUaGlzIHdpbGwgdHJpZ2dlciB0aGUgbGlzdCB1cGRhdGUgbWV0aG9kXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgbGlzdE1hbmFnZXIucG9wdWxhdGVMaXN0KCk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuXG4gICAgbGlzdE1hbmFnZXIudXBkYXRlRmlsdGVyKG9wdGlvbnMpO1xuICB9KVxuXG4gIC8qKipcbiAgKiBNYXAgRXZlbnRzXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICAvLyBtYXBNYW5hZ2VyLnNldENlbnRlcihbb3B0aW9ucy5sYXQsIG9wdGlvbnMubG5nXSk7XG4gICAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLmJvdW5kMSB8fCAhb3B0aW9ucy5ib3VuZDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgdmFyIGJvdW5kMiA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDIpO1xuICAgIG1hcE1hbmFnZXIuc2V0Qm91bmRzKGJvdW5kMSwgYm91bmQyKTtcbiAgICAvLyBjb25zb2xlLmxvZyhvcHRpb25zKVxuICB9KTtcbiAgLy8gMy4gbWFya2VycyBvbiBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXBsb3QnLCAoZSwgb3B0KSA9PiB7XG4gICAgbWFwTWFuYWdlci5wbG90UG9pbnRzKG9wdC5kYXRhKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInKTtcbiAgfSlcblxuICAvLyBGaWx0ZXIgbWFwXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCAoZSwgb3B0KSA9PiB7XG4gICAgY29uc29sZS5sb2cob3B0KTtcbiAgICBpZiAob3B0KSB7XG4gICAgICBtYXBNYW5hZ2VyLmZpbHRlck1hcChvcHQuZmlsdGVyKTtcbiAgICB9XG4gIH0pXG5cbiAgJCh3aW5kb3cpLm9uKFwiaGFzaGNoYW5nZVwiLCAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgaWYgKGhhc2gubGVuZ3RoID09IDApIHJldHVybjtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKGhhc2guc3Vic3RyaW5nKDEpKTtcbiAgICBjb25zdCBvbGRVUkwgPSBldmVudC5vcmlnaW5hbEV2ZW50Lm9sZFVSTDtcblxuXG4gICAgY29uc3Qgb2xkSGFzaCA9ICQuZGVwYXJhbShvbGRVUkwuc3Vic3RyaW5nKG9sZFVSTC5zZWFyY2goXCIjXCIpKzEpKTtcblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJywgcGFyYW1ldGVycyk7XG5cbiAgICAvLyBTbyB0aGF0IGNoYW5nZSBpbiBmaWx0ZXJzIHdpbGwgbm90IHVwZGF0ZSB0aGlzXG4gICAgaWYgKG9sZEhhc2guYm91bmQxICE9PSBwYXJhbWV0ZXJzLmJvdW5kMSB8fCBvbGRIYXNoLmJvdW5kMiAhPT0gcGFyYW1ldGVycy5ib3VuZDIpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgIH1cbiAgfSlcblxuICAvLyA0LiBmaWx0ZXIgb3V0IGl0ZW1zIGluIGFjdGl2aXR5LWFyZWFcblxuICAvLyA1LiBnZXQgbWFwIGVsZW1lbnRzXG5cbiAgLy8gNi4gZ2V0IEdyb3VwIGRhdGFcblxuICAvLyA3LiBwcmVzZW50IGdyb3VwIGVsZW1lbnRzXG5cbiAgJC5hamF4KHtcbiAgICB1cmw6ICdodHRwczovL3MzLXVzLXdlc3QtMi5hbWF6b25hd3MuY29tL3BwbHNtYXAtZGF0YS9vdXRwdXQvMzUwb3JnLXRlc3QuanMuZ3onLCAvLyd8KipEQVRBX1NPVVJDRSoqfCcsXG4gICAgZGF0YVR5cGU6ICdzY3JpcHQnLFxuICAgIGNhY2hlOiB0cnVlLFxuICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICB2YXIgcGFyYW1ldGVycyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG5cbiAgICAgIHdpbmRvdy5FVkVOVFNfREFUQS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIGl0ZW1bJ2V2ZW50X3R5cGUnXSA9ICFpdGVtLmV2ZW50X3R5cGUgPyAnQWN0aW9uJyA6IGl0ZW0uZXZlbnRfdHlwZTtcbiAgICAgIH0pXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtdXBkYXRlJyk7XG4gICAgICAvLyAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtcGxvdCcsIHsgZGF0YTogd2luZG93LkVWRU5UU19EQVRBIH0pO1xuICAgICAgLy9UT0RPOiBNYWtlIHRoZSBnZW9qc29uIGNvbnZlcnNpb24gaGFwcGVuIG9uIHRoZSBiYWNrZW5kXG4gICAgfVxuICB9KTtcblxuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCkpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCkpO1xuICAgIGNvbnNvbGUubG9nKHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCkpXG4gIH0sIDEwMCk7XG5cbn0pKGpRdWVyeSk7XG4iXX0=
