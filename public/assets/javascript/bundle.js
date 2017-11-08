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

/* This loads and manages the list! */

var ListManager = function ($) {
  return function () {
    var targetList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "#events-list";

    var $target = typeof targetList === 'string' ? $(targetList) : targetList;

    var renderEvent = function renderEvent(item) {

      var date = moment(item.start_datetime).format("dddd • MMM DD h:mma");
      return "\n      <li class='" + item.event_type + "' data-lat='" + item.lat + "' data-lng='" + item.lng + "'>\n        <div class=\"type-event\">\n          <ul class=\"event-types-list\">\n            <li>" + item.event_type + "</li>\n          </ul>\n          <h2><a href=\"//" + item.url + "\" target='_blank'>" + item.title + "</a></h2>\n          <h4>" + date + "</h4>\n          <div class=\"address-area\">\n            <p>" + item.venue + "</p>\n          </div>\n          <div class=\"call-to-action\">\n            <a href=\"//" + item.url + "\" target='_blank' class=\"btn btn-primary\">RSVP</a>\n          </div>\n        </div>\n      </li>\n      ";
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
"use strict";

var MapManager = function ($) {

  var renderEvent = function renderEvent(item) {
    var date = moment(item.start_datetime).format("dddd • MMM DD h:mma");
    return "\n    <div class='popup-item " + item.event_type + "' data-lat='" + item.lat + "' data-lng='" + item.lng + "'>\n      <div class=\"type-event\">\n        <ul class=\"event-types-list\">\n          <li>" + item.event_type + "</li>\n        </ul>\n        <h2><a href=\"//" + item.url + "\" target='_blank'>" + item.title + "</a></h2>\n        <h4>" + date + "</h4>\n        <div class=\"address-area\">\n          <p>" + item.venue + "</p>\n        </div>\n        <div class=\"call-to-action\">\n          <a href=\"//" + item.url + "\" target='_blank' class=\"btn btn-primary\">RSVP</a>\n        </div>\n      </div>\n    </div>\n    ";
  };

  var renderGroup = function renderGroup(item) {
    return "\n    <div class='popup-item " + item.event_type + "' data-lat='" + item.lat + "' data-lng='" + item.lng + "'>\n      <div class=\"type-group\">\n        <h2><a href=\"/\" target='_blank'>" + (item.title || "Group") + "</a></h2>\n        <div class=\"group-details-area\">\n          <p>Colorado, USA</p>\n          <p>" + (item.details || "350 Colorado is working locally to help build the global\n             350.org movement to solve the climate crisis and transition\n             to a clean, renewable energy future.") + "\n          </p>\n        </div>\n        <div class=\"call-to-action\">\n          <a href=\"//" + item.url + "\" target='_blank' class=\"btn btn-primary\">Get Involved</a>\n        </div>\n      </div>\n    </div>\n    ";
  };

  var renderGeojson = function renderGeojson(list) {
    return list.map(function (item) {
      return {
        "type": "Feature",
        geometry: {
          type: "Point",
          coordinates: [item.lng, item.lat]
        },
        properties: {
          eventProperties: item,
          popupContent: item.event_type.toLowerCase() === 'group' ? renderGroup(item) : renderEvent(item)
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
    url: 'https://dnb6leangx6dc.cloudfront.net/output/350org.js.gz', //'|**DATA_SOURCE**|',
    dataType: 'script',
    cache: true,
    success: function success(data) {
      var parameters = queryManager.getParameters();

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9saXN0LmpzIiwiY2xhc3Nlcy9tYXAuanMiLCJjbGFzc2VzL3F1ZXJ5LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIkF1dG9jb21wbGV0ZU1hbmFnZXIiLCIkIiwiQVBJX0tFWSIsInRhcmdldCIsInRhcmdldEl0ZW0iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJxdWVyeU1nciIsIlF1ZXJ5TWFuYWdlciIsImdlb2NvZGVyIiwiZ29vZ2xlIiwibWFwcyIsIkdlb2NvZGVyIiwidHlwZWFoZWFkIiwiaGludCIsImhpZ2hsaWdodCIsIm1pbkxlbmd0aCIsImNsYXNzTmFtZXMiLCJtZW51IiwibmFtZSIsImRpc3BsYXkiLCJpdGVtIiwiZm9ybWF0dGVkX2FkZHJlc3MiLCJsaW1pdCIsInNvdXJjZSIsInEiLCJzeW5jIiwiYXN5bmMiLCJnZW9jb2RlIiwiYWRkcmVzcyIsInJlc3VsdHMiLCJzdGF0dXMiLCJvbiIsIm9iaiIsImRhdHVtIiwiZ2VvbWV0cnkiLCJ1cGRhdGVWaWV3cG9ydCIsInZpZXdwb3J0IiwiJHRhcmdldCIsImpRdWVyeSIsImluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayIsIkxpc3RNYW5hZ2VyIiwidGFyZ2V0TGlzdCIsInJlbmRlckV2ZW50IiwiZGF0ZSIsIm1vbWVudCIsInN0YXJ0X2RhdGV0aW1lIiwiZm9ybWF0IiwiZXZlbnRfdHlwZSIsImxhdCIsImxuZyIsInVybCIsInRpdGxlIiwidmVudWUiLCJyZW5kZXJHcm91cCIsImRldGFpbHMiLCIkbGlzdCIsInVwZGF0ZUZpbHRlciIsInAiLCJyZW1vdmVQcm9wIiwiYWRkQ2xhc3MiLCJmaWx0ZXIiLCJqb2luIiwicG9wdWxhdGVMaXN0IiwiJGV2ZW50TGlzdCIsIndpbmRvdyIsIkVWRU5UU19EQVRBIiwibWFwIiwiZmluZCIsInJlbW92ZSIsImFwcGVuZCIsIk1hcE1hbmFnZXIiLCJyZW5kZXJHZW9qc29uIiwibGlzdCIsInR5cGUiLCJjb29yZGluYXRlcyIsInByb3BlcnRpZXMiLCJldmVudFByb3BlcnRpZXMiLCJwb3B1cENvbnRlbnQiLCJ0b0xvd2VyQ2FzZSIsIkwiLCJzZXRWaWV3IiwidGlsZUxheWVyIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsIiRtYXAiLCJzZXRCb3VuZHMiLCJib3VuZHMxIiwiYm91bmRzMiIsImJvdW5kcyIsImZpdEJvdW5kcyIsInNldENlbnRlciIsImNlbnRlciIsInpvb20iLCJmaWx0ZXJNYXAiLCJmaWx0ZXJzIiwiY29uc29sZSIsImxvZyIsImhpZGUiLCJmb3JFYWNoIiwic2hvdyIsInBsb3RQb2ludHMiLCJnZW9qc29uIiwiZmVhdHVyZXMiLCJnZW9KU09OIiwicG9pbnRUb0xheWVyIiwiZmVhdHVyZSIsImxhdGxuZyIsImV2ZW50VHlwZSIsImdlb2pzb25NYXJrZXJPcHRpb25zIiwicmFkaXVzIiwiZmlsbENvbG9yIiwiY29sb3IiLCJ3ZWlnaHQiLCJvcGFjaXR5IiwiZmlsbE9wYWNpdHkiLCJjbGFzc05hbWUiLCJjaXJjbGVNYXJrZXIiLCJvbkVhY2hGZWF0dXJlIiwibGF5ZXIiLCJiaW5kUG9wdXAiLCJ1cGRhdGUiLCJsYXRMbmciLCJ0YXJnZXRGb3JtIiwicHJldmlvdXMiLCJlIiwicHJldmVudERlZmF1bHQiLCJ2YWwiLCJmb3JtIiwiZGVwYXJhbSIsInNlcmlhbGl6ZSIsImxvY2F0aW9uIiwiaGFzaCIsInBhcmFtIiwidHJpZ2dlciIsImluaXRpYWxpemUiLCJjYWxsYmFjayIsImxlbmd0aCIsInBhcmFtcyIsInN1YnN0cmluZyIsImJvdW5kMSIsImJvdW5kMiIsInByb3AiLCJnZXRQYXJhbWV0ZXJzIiwicGFyYW1ldGVycyIsInVwZGF0ZUxvY2F0aW9uIiwiZiIsImIiLCJKU09OIiwic3RyaW5naWZ5IiwidHJpZ2dlclN1Ym1pdCIsInF1ZXJ5TWFuYWdlciIsImluaXRQYXJhbXMiLCJtYXBNYW5hZ2VyIiwibGlzdE1hbmFnZXIiLCJldmVudCIsIm9wdGlvbnMiLCJwYXJzZSIsIm9wdCIsImRhdGEiLCJvbGRVUkwiLCJvcmlnaW5hbEV2ZW50Iiwib2xkSGFzaCIsInNlYXJjaCIsImFqYXgiLCJkYXRhVHlwZSIsImNhY2hlIiwic3VjY2VzcyIsInNldFRpbWVvdXQiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7O0FBQ0EsSUFBTUEsc0JBQXVCLFVBQVNDLENBQVQsRUFBWTtBQUN2Qzs7QUFFQSxNQUFNQyxVQUFVLHlDQUFoQjs7QUFFQSxTQUFPLFVBQUNDLE1BQUQsRUFBWTs7QUFFakIsUUFBTUMsYUFBYSxPQUFPRCxNQUFQLElBQWlCLFFBQWpCLEdBQTRCRSxTQUFTQyxhQUFULENBQXVCSCxNQUF2QixDQUE1QixHQUE2REEsTUFBaEY7QUFDQSxRQUFNSSxXQUFXQyxjQUFqQjtBQUNBLFFBQUlDLFdBQVcsSUFBSUMsT0FBT0MsSUFBUCxDQUFZQyxRQUFoQixFQUFmOztBQUVBWCxNQUFFRyxVQUFGLEVBQWNTLFNBQWQsQ0FBd0I7QUFDWkMsWUFBTSxJQURNO0FBRVpDLGlCQUFXLElBRkM7QUFHWkMsaUJBQVcsQ0FIQztBQUlaQyxrQkFBWTtBQUNWQyxjQUFNO0FBREk7QUFKQSxLQUF4QixFQVFVO0FBQ0VDLFlBQU0sZ0JBRFI7QUFFRUMsZUFBUyxpQkFBQ0MsSUFBRDtBQUFBLGVBQVVBLEtBQUtDLGlCQUFmO0FBQUEsT0FGWDtBQUdFQyxhQUFPLEVBSFQ7QUFJRUMsY0FBUSxnQkFBVUMsQ0FBVixFQUFhQyxJQUFiLEVBQW1CQyxLQUFuQixFQUF5QjtBQUM3QmxCLGlCQUFTbUIsT0FBVCxDQUFpQixFQUFFQyxTQUFTSixDQUFYLEVBQWpCLEVBQWlDLFVBQVVLLE9BQVYsRUFBbUJDLE1BQW5CLEVBQTJCO0FBQzFESixnQkFBTUcsT0FBTjtBQUNELFNBRkQ7QUFHSDtBQVJILEtBUlYsRUFrQlVFLEVBbEJWLENBa0JhLG9CQWxCYixFQWtCbUMsVUFBVUMsR0FBVixFQUFlQyxLQUFmLEVBQXNCO0FBQzdDLFVBQUdBLEtBQUgsRUFDQTs7QUFFRSxZQUFJQyxXQUFXRCxNQUFNQyxRQUFy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LEVBQWtEaUIsYUFBYVIsYUFBYixFQUFsRDtBQUNBOUksTUFBRUksUUFBRixFQUFZaUksT0FBWixDQUFvQixvQkFBcEIsRUFBMENpQixhQUFhUixhQUFiLEVBQTFDO0FBQ0EvQyxZQUFRQyxHQUFSLENBQVlzRCxhQUFhUixhQUFiLEVBQVo7QUFDRCxHQUpELEVBSUcsR0FKSDtBQU1ELENBeEdELEVBd0dHeEcsTUF4R0giLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vL0FQSSA6QUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXG5jb25zdCBBdXRvY29tcGxldGVNYW5hZ2VyID0gKGZ1bmN0aW9uKCQpIHtcbiAgLy9Jbml0aWFsaXphdGlvbi4uLlxuXG4gIGNvbnN0IEFQSV9LRVkgPSBcIkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVwiO1xuXG4gIHJldHVybiAodGFyZ2V0KSA9PiB7XG5cbiAgICBjb25zdCB0YXJnZXRJdGVtID0gdHlwZW9mIHRhcmdldCA9PSBcInN0cmluZ1wiID8gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpIDogdGFyZ2V0O1xuICAgIGNvbnN0IHF1ZXJ5TWdyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgdmFyIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG5cbiAgICAkKHRhcmdldEl0ZW0pLnR5cGVhaGVhZCh7XG4gICAgICAgICAgICAgICAgaGludDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBoaWdobGlnaHQ6IHRydWUsXG4gICAgICAgICAgICAgICAgbWluTGVuZ3RoOiA0LFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgIG1lbnU6ICd0dC1kcm9wZG93bi1tZW51J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdzZWFyY2gtcmVzdWx0cycsXG4gICAgICAgICAgICAgICAgZGlzcGxheTogKGl0ZW0pID0+IGl0ZW0uZm9ybWF0dGVkX2FkZHJlc3MsXG4gICAgICAgICAgICAgICAgbGltaXQ6IDEwLFxuICAgICAgICAgICAgICAgIHNvdXJjZTogZnVuY3Rpb24gKHEsIHN5bmMsIGFzeW5jKXtcbiAgICAgICAgICAgICAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IHEgfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICAgIGFzeW5jKHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkub24oJ3R5cGVhaGVhZDpzZWxlY3RlZCcsIGZ1bmN0aW9uIChvYmosIGRhdHVtKSB7XG4gICAgICAgICAgICAgICAgaWYoZGF0dW0pXG4gICAgICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgICB2YXIgZ2VvbWV0cnkgPSBkYXR1bS5nZW9tZXRyeTtcbiAgICAgICAgICAgICAgICAgIHF1ZXJ5TWdyLnVwZGF0ZVZpZXdwb3J0KGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICAgICAgIC8vICBtYXAuZml0Qm91bmRzKGdlb21ldHJ5LmJvdW5kcz8gZ2VvbWV0cnkuYm91bmRzIDogZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG5cbiAgICByZXR1cm4ge1xuICAgICAgJHRhcmdldDogJCh0YXJnZXRJdGVtKSxcbiAgICAgIHRhcmdldDogdGFyZ2V0SXRlbVxuICAgIH1cbiAgfVxuXG59KGpRdWVyeSkpO1xuXG5jb25zdCBpbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2sgPSAoKSA9PiB7XG5cblxuICBBdXRvY29tcGxldGVNYW5hZ2VyKFwiaW5wdXRbbmFtZT0nc2VhcmNoLWxvY2F0aW9uJ11cIik7XG59O1xuIiwiLyogVGhpcyBsb2FkcyBhbmQgbWFuYWdlcyB0aGUgbGlzdCEgKi9cblxuY29uc3QgTGlzdE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRMaXN0ID0gXCIjZXZlbnRzLWxpc3RcIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0TGlzdCA9PT0gJ3N0cmluZycgPyAkKHRhcmdldExpc3QpIDogdGFyZ2V0TGlzdDtcblxuICAgIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0pID0+IHtcblxuICAgICAgdmFyIGRhdGUgPSBtb21lbnQoaXRlbS5zdGFydF9kYXRldGltZSkuZm9ybWF0KFwiZGRkZCDigKIgTU1NIEREIGg6bW1hXCIpO1xuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaSBjbGFzcz0nJHtpdGVtLmV2ZW50X3R5cGV9JyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50XCI+XG4gICAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgICAgPGxpPiR7aXRlbS5ldmVudF90eXBlfTwvbGk+XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICAgIDxoND4ke2RhdGV9PC9oND5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5SU1ZQPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIGNvbnN0IHJlbmRlckdyb3VwID0gKGl0ZW0pID0+IHtcblxuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaT5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXBcIj5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIi9cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlIHx8IGBHcm91cGB9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgICAgPHA+Q29sb3JhZG8sIFVTQTwvcD5cbiAgICAgICAgICAgIDxwPiR7aXRlbS5kZXRhaWxzIHx8IGAzNTAgQ29sb3JhZG8gaXMgd29ya2luZyBsb2NhbGx5IHRvIGhlbHAgYnVpbGQgdGhlIGdsb2JhbFxuICAgICAgICAgICAgICAgMzUwLm9yZyBtb3ZlbWVudCB0byBzb2x2ZSB0aGUgY2xpbWF0ZSBjcmlzaXMgYW5kIHRyYW5zaXRpb25cbiAgICAgICAgICAgICAgIHRvIGEgY2xlYW4sIHJlbmV3YWJsZSBlbmVyZ3kgZnV0dXJlLmB9XG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiLy8ke2l0ZW0udXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPkdldCBJbnZvbHZlZDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICAgYFxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgJGxpc3Q6ICR0YXJnZXQsXG4gICAgICB1cGRhdGVGaWx0ZXI6IChwKSA9PiB7XG4gICAgICAgIGlmKCFwKSByZXR1cm47XG5cbiAgICAgICAgLy8gUmVtb3ZlIEZpbHRlcnNcblxuICAgICAgICAkdGFyZ2V0LnJlbW92ZVByb3AoXCJjbGFzc1wiKTtcbiAgICAgICAgJHRhcmdldC5hZGRDbGFzcyhwLmZpbHRlciA/IHAuZmlsdGVyLmpvaW4oXCIgXCIpIDogJycpXG4gICAgICB9LFxuICAgICAgcG9wdWxhdGVMaXN0OiAoKSA9PiB7XG4gICAgICAgIC8vdXNpbmcgd2luZG93LkVWRU5UX0RBVEFcblxuICAgICAgICB2YXIgJGV2ZW50TGlzdCA9IHdpbmRvdy5FVkVOVFNfREFUQS5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGl0ZW0uZXZlbnRfdHlwZSAhPT0gJ0dyb3VwJyA/IHJlbmRlckV2ZW50KGl0ZW0pIDogcmVuZGVyR3JvdXAoaXRlbSk7XG4gICAgICAgIH0pXG4gICAgICAgICR0YXJnZXQuZmluZCgndWwgbGknKS5yZW1vdmUoKTtcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCcpLmFwcGVuZCgkZXZlbnRMaXN0KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiXG5jb25zdCBNYXBNYW5hZ2VyID0gKCgkKSA9PiB7XG5cbiAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSkgPT4ge1xuICAgIHZhciBkYXRlID0gbW9tZW50KGl0ZW0uc3RhcnRfZGF0ZXRpbWUpLmZvcm1hdChcImRkZGQg4oCiIE1NTSBERCBoOm1tYVwiKTtcbiAgICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9J3BvcHVwLWl0ZW0gJHtpdGVtLmV2ZW50X3R5cGV9JyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudFwiPlxuICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgPGxpPiR7aXRlbS5ldmVudF90eXBlfTwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxoMj48YSBocmVmPVwiLy8ke2l0ZW0udXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgIDxoND4ke2RhdGV9PC9oND5cbiAgICAgICAgPGRpdiBjbGFzcz1cImFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgIDxwPiR7aXRlbS52ZW51ZX08L3A+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiLy8ke2l0ZW0udXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPlJTVlA8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgYFxuICB9O1xuXG4gIGNvbnN0IHJlbmRlckdyb3VwID0gKGl0ZW0pID0+IHtcbiAgICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9J3BvcHVwLWl0ZW0gJHtpdGVtLmV2ZW50X3R5cGV9JyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ncm91cFwiPlxuICAgICAgICA8aDI+PGEgaHJlZj1cIi9cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlIHx8IGBHcm91cGB9PC9hPjwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICA8cD5Db2xvcmFkbywgVVNBPC9wPlxuICAgICAgICAgIDxwPiR7aXRlbS5kZXRhaWxzIHx8IGAzNTAgQ29sb3JhZG8gaXMgd29ya2luZyBsb2NhbGx5IHRvIGhlbHAgYnVpbGQgdGhlIGdsb2JhbFxuICAgICAgICAgICAgIDM1MC5vcmcgbW92ZW1lbnQgdG8gc29sdmUgdGhlIGNsaW1hdGUgY3Jpc2lzIGFuZCB0cmFuc2l0aW9uXG4gICAgICAgICAgICAgdG8gYSBjbGVhbiwgcmVuZXdhYmxlIGVuZXJneSBmdXR1cmUuYH1cbiAgICAgICAgICA8L3A+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiLy8ke2l0ZW0udXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPkdldCBJbnZvbHZlZDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR2VvanNvbiA9IChsaXN0KSA9PiB7XG4gICAgcmV0dXJuIGxpc3QubWFwKChpdGVtKSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICAgIGdlb21ldHJ5OiB7XG4gICAgICAgICAgdHlwZTogXCJQb2ludFwiLFxuICAgICAgICAgIGNvb3JkaW5hdGVzOiBbaXRlbS5sbmcsIGl0ZW0ubGF0XVxuICAgICAgICB9LFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgZXZlbnRQcm9wZXJ0aWVzOiBpdGVtLFxuICAgICAgICAgIHBvcHVwQ29udGVudDogaXRlbS5ldmVudF90eXBlLnRvTG93ZXJDYXNlKCkgPT09J2dyb3VwJyA/IHJlbmRlckdyb3VwKGl0ZW0pIDogcmVuZGVyRXZlbnQoaXRlbSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gKCkgPT4ge1xuICAgIHZhciBtYXAgPSBMLm1hcCgnbWFwJykuc2V0VmlldyhbMzQuODg1OTMwOTQwNzUzMTcsIDUuMDk3NjU2MjUwMDAwMDAxXSwgMik7XG5cbiAgICBMLnRpbGVMYXllcignaHR0cDovL3tzfS50aWxlLm9zbS5vcmcve3p9L3t4fS97eX0ucG5nJywge1xuICAgICAgICBhdHRyaWJ1dGlvbjogJyZjb3B5OyA8YSBocmVmPVwiaHR0cDovL29zbS5vcmcvY29weXJpZ2h0XCI+T3BlblN0cmVldE1hcDwvYT4gY29udHJpYnV0b3JzIOKAoiA8YSBocmVmPVwiLy8zNTAub3JnXCI+MzUwLm9yZzwvYT4nXG4gICAgfSkuYWRkVG8obWFwKTtcblxuICAgIC8vIG1hcC5maXRCb3VuZHMoWyBbWzQwLjcyMTYwMTUxOTcwODUsIC03My44NTE3NDY5ODAyOTE1Ml0sIFs0MC43MjQyOTk0ODAyOTE1LCAtNzMuODQ5MDQ5MDE5NzA4NV1dIF0pO1xuICAgIHJldHVybiB7XG4gICAgICAkbWFwOiBtYXAsXG4gICAgICBzZXRCb3VuZHM6IChib3VuZHMxLCBib3VuZHMyKSA9PiB7XG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtib3VuZHMxLCBib3VuZHMyXTtcbiAgICAgICAgbWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuICAgICAgfSxcbiAgICAgIHNldENlbnRlcjogKGNlbnRlciwgem9vbSA9IDEwKSA9PiB7XG4gICAgICAgIGlmICghY2VudGVyIHx8ICFjZW50ZXJbMF0gfHwgY2VudGVyWzBdID09IFwiXCJcbiAgICAgICAgICAgICAgfHwgIWNlbnRlclsxXSB8fCBjZW50ZXJbMV0gPT0gXCJcIikgcmV0dXJuO1xuICAgICAgICBtYXAuc2V0VmlldyhjZW50ZXIsIHpvb20pO1xuICAgICAgfSxcbiAgICAgIGZpbHRlck1hcDogKGZpbHRlcnMpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJmaWx0ZXJzID4+IFwiLCBmaWx0ZXJzKTtcbiAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwXCIpLmhpZGUoKTtcbiAgICAgICAgY29uc29sZS5sb2coJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwXCIpKTtcblxuICAgICAgICBpZiAoIWZpbHRlcnMpIHJldHVybjtcblxuICAgICAgICBmaWx0ZXJzLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIi5ldmVudC1pdGVtLXBvcHVwLlwiICsgaXRlbS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgICAkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXAuXCIgKyBpdGVtLnRvTG93ZXJDYXNlKCkpLnNob3coKTtcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICBwbG90UG9pbnRzOiAobGlzdCkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGdlb2pzb24gPSB7XG4gICAgICAgICAgdHlwZTogXCJGZWF0dXJlQ29sbGVjdGlvblwiLFxuICAgICAgICAgIGZlYXR1cmVzOiByZW5kZXJHZW9qc29uKGxpc3QpXG4gICAgICAgIH07XG5cblxuXG4gICAgICAgIEwuZ2VvSlNPTihnZW9qc29uLCB7XG4gICAgICAgICAgICBwb2ludFRvTGF5ZXI6IChmZWF0dXJlLCBsYXRsbmcpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgZXZlbnRUeXBlID0gZmVhdHVyZS5wcm9wZXJ0aWVzLmV2ZW50UHJvcGVydGllcy5ldmVudF90eXBlO1xuICAgICAgICAgICAgICB2YXIgZ2VvanNvbk1hcmtlck9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICByYWRpdXM6IDgsXG4gICAgICAgICAgICAgICAgICBmaWxsQ29sb3I6ICBldmVudFR5cGUgPT09ICdHcm91cCcgPyBcIiM0MEQ3RDRcIiA6IFwiIzBGODFFOFwiLFxuICAgICAgICAgICAgICAgICAgY29sb3I6IFwid2hpdGVcIixcbiAgICAgICAgICAgICAgICAgIHdlaWdodDogMixcbiAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAuNSxcbiAgICAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAwLjgsXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IChldmVudFR5cGUgPT09ICdHcm91cCcgPyAnZ3JvdXBzJyA6ICdldmVudHMnKSArICcgZXZlbnQtaXRlbS1wb3B1cCdcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgcmV0dXJuIEwuY2lyY2xlTWFya2VyKGxhdGxuZywgZ2VvanNvbk1hcmtlck9wdGlvbnMpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgIG9uRWFjaEZlYXR1cmU6IChmZWF0dXJlLCBsYXllcikgPT4ge1xuICAgICAgICAgICAgaWYgKGZlYXR1cmUucHJvcGVydGllcyAmJiBmZWF0dXJlLnByb3BlcnRpZXMucG9wdXBDb250ZW50KSB7XG4gICAgICAgICAgICAgIGxheWVyLmJpbmRQb3B1cChmZWF0dXJlLnByb3BlcnRpZXMucG9wdXBDb250ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pLmFkZFRvKG1hcCk7XG5cbiAgICAgIH0sXG4gICAgICB1cGRhdGU6IChwKSA9PiB7XG4gICAgICAgIGlmICghcCB8fCAhcC5sYXQgfHwgIXAubG5nICkgcmV0dXJuO1xuXG4gICAgICAgIG1hcC5zZXRWaWV3KEwubGF0TG5nKHAubGF0LCBwLmxuZyksIDEwKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiY29uc3QgUXVlcnlNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIHJldHVybiAodGFyZ2V0Rm9ybSA9IFwiZm9ybSNmaWx0ZXJzLWZvcm1cIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0Rm9ybSA9PT0gJ3N0cmluZycgPyAkKHRhcmdldEZvcm0pIDogdGFyZ2V0Rm9ybTtcbiAgICBsZXQgbGF0ID0gbnVsbDtcbiAgICBsZXQgbG5nID0gbnVsbDtcblxuICAgIGxldCBwcmV2aW91cyA9IHt9O1xuXG4gICAgJHRhcmdldC5vbignc3VibWl0JywgKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGxhdCA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwoKTtcbiAgICAgIGxuZyA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwoKTtcblxuICAgICAgdmFyIGZvcm0gPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG4gICAgICBkZWxldGUgZm9ybVsnc2VhcmNoLWxvY2F0aW9uJ107XG5cbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJC5wYXJhbShmb3JtKTtcbiAgICB9KVxuXG4gICAgJChkb2N1bWVudCkub24oJ2NoYW5nZScsICcuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF0nLCAoKSA9PiB7XG4gICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgIH0pXG5cblxuICAgIHJldHVybiB7XG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgcGFyYW1zID0gJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSlcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKHBhcmFtcy5sYXQpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwocGFyYW1zLmxuZyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChwYXJhbXMuYm91bmQxKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKHBhcmFtcy5ib3VuZDIpO1xuXG4gICAgICAgICAgaWYgKHBhcmFtcy5maWx0ZXIpIHtcbiAgICAgICAgICAgICR0YXJnZXQuZmluZChcIi5maWx0ZXItaXRlbSBpbnB1dFt0eXBlPWNoZWNrYm94XVwiKS5yZW1vdmVQcm9wKFwiY2hlY2tlZFwiKTtcbiAgICAgICAgICAgIHBhcmFtcy5maWx0ZXIuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdW3ZhbHVlPSdcIiArIGl0ZW0gKyBcIiddXCIpLnByb3AoXCJjaGVja2VkXCIsIHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBnZXRQYXJhbWV0ZXJzOiAoKSA9PiB7XG4gICAgICAgIHZhciBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuICAgICAgICBkZWxldGUgcGFyYW1ldGVyc1snc2VhcmNoLWxvY2F0aW9uJ107XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtZXRlcnM7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTG9jYXRpb246IChsYXQsIGxuZykgPT4ge1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKGxhdCk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwobG5nKTtcbiAgICAgICAgLy8gJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVWaWV3cG9ydDogKHZpZXdwb3J0KSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW1t2aWV3cG9ydC5mLmIsIHZpZXdwb3J0LmIuYl0sIFt2aWV3cG9ydC5mLmYsIHZpZXdwb3J0LmIuZl1dO1xuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdHJpZ2dlclN1Ym1pdDogKCkgPT4ge1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSkoalF1ZXJ5KTtcbiIsIihmdW5jdGlvbigkKSB7XG5cbiAgLy8gMS4gZ29vZ2xlIG1hcHMgZ2VvY29kZVxuXG4gIC8vIDIuIGZvY3VzIG1hcCBvbiBnZW9jb2RlICh2aWEgbGF0L2xuZylcbiAgY29uc3QgcXVlcnlNYW5hZ2VyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgICAgIHF1ZXJ5TWFuYWdlci5pbml0aWFsaXplKCk7XG5cbiAgY29uc3QgaW5pdFBhcmFtcyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gIGNvbnN0IG1hcE1hbmFnZXIgPSBNYXBNYW5hZ2VyKCk7XG5cbiAgY29uc3QgbGlzdE1hbmFnZXIgPSBMaXN0TWFuYWdlcigpO1xuXG4gIGlmKGluaXRQYXJhbXMubGF0ICYmIGluaXRQYXJhbXMubG5nKSB7XG4gICAgbWFwTWFuYWdlci5zZXRDZW50ZXIoW2luaXRQYXJhbXMubGF0LCBpbml0UGFyYW1zLmxuZ10pO1xuICB9XG5cbiAgLyoqKlxuICAqIExpc3QgRXZlbnRzXG4gICogVGhpcyB3aWxsIHRyaWdnZXIgdGhlIGxpc3QgdXBkYXRlIG1ldGhvZFxuICAqL1xuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnBvcHVsYXRlTGlzdCgpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcblxuICAgIGxpc3RNYW5hZ2VyLnVwZGF0ZUZpbHRlcihvcHRpb25zKTtcbiAgfSlcblxuICAvKioqXG4gICogTWFwIEV2ZW50c1xuICAqL1xuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgLy8gbWFwTWFuYWdlci5zZXRDZW50ZXIoW29wdGlvbnMubGF0LCBvcHRpb25zLmxuZ10pO1xuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGJvdW5kMSA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDEpO1xuICAgIHZhciBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcbiAgICBtYXBNYW5hZ2VyLnNldEJvdW5kcyhib3VuZDEsIGJvdW5kMik7XG4gICAgLy8gY29uc29sZS5sb2cob3B0aW9ucylcbiAgfSk7XG4gIC8vIDMuIG1hcmtlcnMgb24gbWFwXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC1wbG90JywgKGUsIG9wdCkgPT4ge1xuICAgIG1hcE1hbmFnZXIucGxvdFBvaW50cyhvcHQuZGF0YSk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJyk7XG4gIH0pXG5cbiAgLy8gRmlsdGVyIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtZmlsdGVyJywgKGUsIG9wdCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKG9wdCk7XG4gICAgaWYgKG9wdCkge1xuICAgICAgbWFwTWFuYWdlci5maWx0ZXJNYXAob3B0LmZpbHRlcik7XG4gICAgfVxuICB9KVxuXG4gICQod2luZG93KS5vbihcImhhc2hjaGFuZ2VcIiwgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgIGlmIChoYXNoLmxlbmd0aCA9PSAwKSByZXR1cm47XG4gICAgY29uc3QgcGFyYW1ldGVycyA9ICQuZGVwYXJhbShoYXNoLnN1YnN0cmluZygxKSk7XG4gICAgY29uc3Qgb2xkVVJMID0gZXZlbnQub3JpZ2luYWxFdmVudC5vbGRVUkw7XG5cblxuICAgIGNvbnN0IG9sZEhhc2ggPSAkLmRlcGFyYW0ob2xkVVJMLnN1YnN0cmluZyhvbGRVUkwuc2VhcmNoKFwiI1wiKSsxKSk7XG5cbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicsIHBhcmFtZXRlcnMpO1xuXG4gICAgLy8gU28gdGhhdCBjaGFuZ2UgaW4gZmlsdGVycyB3aWxsIG5vdCB1cGRhdGUgdGhpc1xuICAgIGlmIChvbGRIYXNoLmJvdW5kMSAhPT0gcGFyYW1ldGVycy5ib3VuZDEgfHwgb2xkSGFzaC5ib3VuZDIgIT09IHBhcmFtZXRlcnMuYm91bmQyKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG4gIH0pXG5cbiAgLy8gNC4gZmlsdGVyIG91dCBpdGVtcyBpbiBhY3Rpdml0eS1hcmVhXG5cbiAgLy8gNS4gZ2V0IG1hcCBlbGVtZW50c1xuXG4gIC8vIDYuIGdldCBHcm91cCBkYXRhXG5cbiAgLy8gNy4gcHJlc2VudCBncm91cCBlbGVtZW50c1xuXG4gICQuYWpheCh7XG4gICAgdXJsOiAnaHR0cHM6Ly9kbmI2bGVhbmd4NmRjLmNsb3VkZnJvbnQubmV0L291dHB1dC8zNTBvcmcuanMuZ3onLCAvLyd8KipEQVRBX1NPVVJDRSoqfCcsXG4gICAgZGF0YVR5cGU6ICdzY3JpcHQnLFxuICAgIGNhY2hlOiB0cnVlLFxuICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICB2YXIgcGFyYW1ldGVycyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG5cbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC11cGRhdGUnKTtcbiAgICAgIC8vICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1wbG90JywgeyBkYXRhOiB3aW5kb3cuRVZFTlRTX0RBVEEgfSk7XG4gICAgICAvL1RPRE86IE1ha2UgdGhlIGdlb2pzb24gY29udmVyc2lvbiBoYXBwZW4gb24gdGhlIGJhY2tlbmRcbiAgICB9XG4gIH0pO1xuXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKSk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKSk7XG4gICAgY29uc29sZS5sb2cocXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKSlcbiAgfSwgMTAwKTtcblxufSkoalF1ZXJ5KTtcbiJdfQ==
