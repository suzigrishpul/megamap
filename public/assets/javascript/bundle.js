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
        $target.addClass(p.filter.join(" "));
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
      plotPoints: function plotPoints(list) {
        console.log(list);
        var geojson = {
          type: "FeatureCollection",
          features: renderGeojson(list)
        };

        console.log(JSON.stringify(geojson));

        L.geoJSON(geojson, {
          pointToLayer: function pointToLayer(feature, latlng) {
            console.log(feature, latlng);
            var geojsonMarkerOptions = {
              radius: 8,
              fillColor: feature.properties.eventProperties.event_type === 'Group' ? "#40D7D4" : "#0F81E8",
              color: "white",
              weight: 1,
              opacity: 1,
              fillOpacity: 0.8
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
  });

  $(window).on("hashchange", function (event) {
    var hash = window.location.hash;
    if (hash.length == 0) return;
    var parameters = $.deparam(hash.substring(1));
    var oldURL = event.originalEvent.oldURL;

    var oldHash = $.deparam(oldURL.substring(oldURL.search("#") + 1));

    $(document).trigger('trigger-list-filter-update', parameters);

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9saXN0LmpzIiwiY2xhc3Nlcy9tYXAuanMiLCJjbGFzc2VzL3F1ZXJ5LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIkF1dG9jb21wbGV0ZU1hbmFnZXIiLCIkIiwiQVBJX0tFWSIsInRhcmdldCIsInRhcmdldEl0ZW0iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJxdWVyeU1nciIsIlF1ZXJ5TWFuYWdlciIsImdlb2NvZGVyIiwiZ29vZ2xlIiwibWFwcyIsIkdlb2NvZGVyIiwidHlwZWFoZWFkIiwiaGludCIsImhpZ2hsaWdodCIsIm1pbkxlbmd0aCIsImNsYXNzTmFtZXMiLCJtZW51IiwibmFtZSIsImRpc3BsYXkiLCJpdGVtIiwiZm9ybWF0dGVkX2FkZHJlc3MiLCJsaW1pdCIsInNvdXJjZSIsInEiLCJzeW5jIiwiYXN5bmMiLCJnZW9jb2RlIiwiYWRkcmVzcyIsInJlc3VsdHMiLCJzdGF0dXMiLCJvbiIsIm9iaiIsImRhdHVtIiwiZ2VvbWV0cnkiLCJ1cGRhdGVWaWV3cG9ydCIsInZpZXdwb3J0IiwiJHRhcmdldCIsImpRdWVyeSIsImluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayIsIkxpc3RNYW5hZ2VyIiwidGFyZ2V0TGlzdCIsInJlbmRlckV2ZW50IiwiZGF0ZSIsIm1vbWVudCIsInN0YXJ0X2RhdGV0aW1lIiwiZm9ybWF0IiwiZXZlbnRfdHlwZSIsImxhdCIsImxuZyIsInVybCIsInRpdGxlIiwidmVudWUiLCJyZW5kZXJHcm91cCIsImRldGFpbHMiLCIkbGlzdCIsInVwZGF0ZUZpbHRlciIsInAiLCJyZW1vdmVQcm9wIiwiYWRkQ2xhc3MiLCJmaWx0ZXIiLCJqb2luIiwicG9wdWxhdGVMaXN0IiwiJGV2ZW50TGlzdCIsIndpbmRvdyIsIkVWRU5UU19EQVRBIiwibWFwIiwiZmluZCIsInJlbW92ZSIsImFwcGVuZCIsIk1hcE1hbmFnZXIiLCJyZW5kZXJHZW9qc29uIiwibGlzdCIsInR5cGUiLCJjb29yZGluYXRlcyIsInByb3BlcnRpZXMiLCJldmVudFByb3BlcnRpZXMiLCJwb3B1cENvbnRlbnQiLCJ0b0xvd2VyQ2FzZSIsIkwiLCJzZXRWaWV3IiwidGlsZUxheWVyIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsIiRtYXAiLCJzZXRCb3VuZHMiLCJib3VuZHMxIiwiYm91bmRzMiIsImJvdW5kcyIsImZpdEJvdW5kcyIsInNldENlbnRlciIsImNlbnRlciIsInpvb20iLCJwbG90UG9pbnRzIiwiY29uc29sZSIsImxvZyIsImdlb2pzb24iLCJmZWF0dXJlcyIsIkpTT04iLCJzdHJpbmdpZnkiLCJnZW9KU09OIiwicG9pbnRUb0xheWVyIiwiZmVhdHVyZSIsImxhdGxuZyIsImdlb2pzb25NYXJrZXJPcHRpb25zIiwicmFkaXVzIiwiZmlsbENvbG9yIiwiY29sb3IiLCJ3ZWlnaHQiLCJvcGFjaXR5IiwiZmlsbE9wYWNpdHkiLCJjaXJjbGVNYXJrZXIiLCJvbkVhY2hGZWF0dXJlIiwibGF5ZXIiLCJiaW5kUG9wdXAiLCJ1cGRhdGUiLCJsYXRMbmciLCJ0YXJnZXRGb3JtIiwicHJldmlvdXMiLCJlIiwicHJldmVudERlZmF1bHQiLCJ2YWwiLCJmb3JtIiwiZGVwYXJhbSIsInNlcmlhbGl6ZSIsImxvY2F0aW9uIiwiaGFzaCIsInBhcmFtIiwidHJpZ2dlciIsImluaXRpYWxpemUiLCJjYWxsYmFjayIsImxlbmd0aCIsInBhcmFtcyIsInN1YnN0cmluZyIsImJvdW5kMSIsImJvdW5kMiIsImZvckVhY2giLCJwcm9wIiwiZ2V0UGFyYW1ldGVycyIsInBhcmFtZXRlcnMiLCJ1cGRhdGVMb2NhdGlvbiIsImYiLCJiIiwidHJpZ2dlclN1Ym1pdCIsInF1ZXJ5TWFuYWdlciIsImluaXRQYXJhbXMiLCJtYXBNYW5hZ2VyIiwibGlzdE1hbmFnZXIiLCJldmVudCIsIm9wdGlvbnMiLCJwYXJzZSIsIm9wdCIsImRhdGEiLCJvbGRVUkwiLCJvcmlnaW5hbEV2ZW50Iiwib2xkSGFzaCIsInNlYXJjaCIsImFqYXgiLCJkYXRhVHlwZSIsImNhY2hlIiwic3VjY2VzcyIsInNldFRpbWVvdXQiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7O0FBQ0EsSUFBTUEsc0JBQXVCLFVBQVNDLENBQVQsRUFBWTtBQUN2Qzs7QUFFQSxNQUFNQyxVQUFVLHlDQUFoQjs7QUFFQSxTQUFPLFVBQUNDLE1BQUQsRUFBWTs7QUFFakIsUUFBTUMsYUFBYSxPQUFPRCxNQUFQLElBQWlCLFFBQWpCLEdBQTRCRSxTQUFTQyxhQUFULENBQXVCSCxNQUF2QixDQUE1QixHQUE2REEsTUFBaEY7QUFDQSxRQUFNSSxXQUFXQyxjQUFqQjtBQUNBLFFBQUlDLFdBQVcsSUFBSUMsT0FBT0MsSUFBUCxDQUFZQyxRQUFoQixFQUFmOztBQUVBWCxNQUFFRyxVQUFGLEVBQWNTLFNBQWQsQ0FBd0I7QUFDWkMsWUFBTSxJQURNO0FBRVpDLGlCQUFXLElBRkM7QUFHWkMsaUJBQVcsQ0FIQztBQUlaQyxrQkFBWTtBQUNWQyxjQUFNO0FBREk7QUFKQSxLQUF4QixFQVFVO0FBQ0VDLFlBQU0sZ0JBRFI7QUFFRUMsZUFBUyxpQkFBQ0MsSUFBRDtBQUFBLGVBQVVBLEtBQUtDLGlCQUFmO0FBQUEsT0FGWDtBQUdFQyxhQUFPLEVBSFQ7QUFJRUMsY0FBUSxnQkFBVUMsQ0FBVixFQUFhQyxJQUFiLEVBQW1CQyxLQUFuQixFQUF5QjtBQUM3QmxCLGlCQUFTbUIsT0FBVCxDQUFpQixFQUFFQyxTQUFTSixDQUFYLEVBQWpCLEVBQWlDLFVBQVVLLE9BQVYsRUFBbUJDLE1BQW5CLEVBQTJCO0FBQzFESixnQkFBTUcsT0FBTjtBQUNELFNBRkQ7QUFHSDtBQVJILEtBUlYsRUFrQlVFLEVBbEJWLENBa0JhLG9CQWxCYixFQWtCbUMsVUFBVUMsR0FBVixFQUFlQyxLQUFmLEVBQXNCO0FBQzdDLFVBQUdBLEtBQUgsRUFDQTs7QUFFRSxZQUFJQyxXQUFXRCxNQUFNQyxRQUFyQjtBQUNBNUIsaUJBQVM2QixjQUFULENBQXdCRCxTQUFTRSxRQUFqQztBQUNBO0FBQ0Q7QUFDSixLQTFCVDs7QUE2QkEsV0FBTztBQUNMQyxlQUFTckMsRUFBRUcsVUFBRixDQURKO0FBRUxELGNBQVFDO0FBRkgsS0FBUDtBQUlELEdBdkNEO0FBeUNELENBOUM0QixDQThDM0JtQyxNQTlDMkIsQ0FBN0I7O0FBZ0RBLElBQU1DLGlDQUFpQyxTQUFqQ0EsOEJBQWlDLEdBQU07O0FBRzNDeEMsc0JBQW9CLCtCQUFwQjtBQUNELENBSkQ7OztBQ2xEQTs7QUFFQSxJQUFNeUMsY0FBZSxVQUFDeEMsQ0FBRCxFQUFPO0FBQzFCLFNBQU8sWUFBaUM7QUFBQSxRQUFoQ3lDLFVBQWdDLHVFQUFuQixjQUFtQjs7QUFDdEMsUUFBTUosVUFBVSxPQUFPSSxVQUFQLEtBQXNCLFFBQXRCLEdBQWlDekMsRUFBRXlDLFVBQUYsQ0FBakMsR0FBaURBLFVBQWpFOztBQUVBLFFBQU1DLGNBQWMsU0FBZEEsV0FBYyxDQUFDdEIsSUFBRCxFQUFVOztBQUU1QixVQUFJdUIsT0FBT0MsT0FBT3hCLEtBQUt5QixjQUFaLEVBQTRCQyxNQUE1QixDQUFtQyxxQkFBbkMsQ0FBWDtBQUNBLHFDQUNhMUIsS0FBSzJCLFVBRGxCLG9CQUMyQzNCLEtBQUs0QixHQURoRCxvQkFDa0U1QixLQUFLNkIsR0FEdkUsMkdBSVk3QixLQUFLMkIsVUFKakIsMERBTXFCM0IsS0FBSzhCLEdBTjFCLDJCQU1rRDlCLEtBQUsrQixLQU52RCxpQ0FPVVIsSUFQVixzRUFTV3ZCLEtBQUtnQyxLQVRoQixrR0FZbUJoQyxLQUFLOEIsR0FaeEI7QUFpQkQsS0FwQkQ7O0FBc0JBLFFBQU1HLGNBQWMsU0FBZEEsV0FBYyxDQUFDakMsSUFBRCxFQUFVOztBQUU1QixpSEFHc0NBLEtBQUsrQixLQUFMLFdBSHRDLG9IQU1XL0IsS0FBS2tDLE9BQUwsK0xBTlgsaUhBWW1CbEMsS0FBSzhCLEdBWnhCO0FBaUJELEtBbkJEOztBQXFCQSxXQUFPO0FBQ0xLLGFBQU9sQixPQURGO0FBRUxtQixvQkFBYyxzQkFBQ0MsQ0FBRCxFQUFPO0FBQ25CLFlBQUcsQ0FBQ0EsQ0FBSixFQUFPOztBQUVQOztBQUVBcEIsZ0JBQVFxQixVQUFSLENBQW1CLE9BQW5CO0FBQ0FyQixnQkFBUXNCLFFBQVIsQ0FBaUJGLEVBQUVHLE1BQUYsQ0FBU0MsSUFBVCxDQUFjLEdBQWQsQ0FBakI7QUFDRCxPQVRJO0FBVUxDLG9CQUFjLHdCQUFNO0FBQ2xCOztBQUVBLFlBQUlDLGFBQWFDLE9BQU9DLFdBQVAsQ0FBbUJDLEdBQW5CLENBQXVCLGdCQUFRO0FBQzlDLGlCQUFPOUMsS0FBSzJCLFVBQUwsS0FBb0IsT0FBcEIsR0FBOEJMLFlBQVl0QixJQUFaLENBQTlCLEdBQWtEaUMsWUFBWWpDLElBQVosQ0FBekQ7QUFDRCxTQUZnQixDQUFqQjtBQUdBaUIsZ0JBQVE4QixJQUFSLENBQWEsT0FBYixFQUFzQkMsTUFBdEI7QUFDQS9CLGdCQUFROEIsSUFBUixDQUFhLElBQWIsRUFBbUJFLE1BQW5CLENBQTBCTixVQUExQjtBQUNEO0FBbEJJLEtBQVA7QUFvQkQsR0FsRUQ7QUFtRUQsQ0FwRW1CLENBb0VqQnpCLE1BcEVpQixDQUFwQjs7O0FDREEsSUFBTWdDLGFBQWMsVUFBQ3RFLENBQUQsRUFBTzs7QUFFekIsTUFBTTBDLGNBQWMsU0FBZEEsV0FBYyxDQUFDdEIsSUFBRCxFQUFVO0FBQzVCLFFBQUl1QixPQUFPQyxPQUFPeEIsS0FBS3lCLGNBQVosRUFBNEJDLE1BQTVCLENBQW1DLHFCQUFuQyxDQUFYO0FBQ0EsNkNBQ3lCMUIsS0FBSzJCLFVBRDlCLG9CQUN1RDNCLEtBQUs0QixHQUQ1RCxvQkFDOEU1QixLQUFLNkIsR0FEbkYscUdBSVk3QixLQUFLMkIsVUFKakIsc0RBTXFCM0IsS0FBSzhCLEdBTjFCLDJCQU1rRDlCLEtBQUsrQixLQU52RCwrQkFPVVIsSUFQVixrRUFTV3ZCLEtBQUtnQyxLQVRoQiw0RkFZbUJoQyxLQUFLOEIsR0FaeEI7QUFpQkQsR0FuQkQ7O0FBcUJBLE1BQU1HLGNBQWMsU0FBZEEsV0FBYyxDQUFDakMsSUFBRCxFQUFVO0FBQzVCLDZDQUN5QkEsS0FBSzJCLFVBRDlCLG9CQUN1RDNCLEtBQUs0QixHQUQ1RCxvQkFDOEU1QixLQUFLNkIsR0FEbkYseUZBR3NDN0IsS0FBSytCLEtBQUwsV0FIdEMsOEdBTVcvQixLQUFLa0MsT0FBTCwyTEFOWCx5R0FZbUJsQyxLQUFLOEIsR0FaeEI7QUFpQkQsR0FsQkQ7O0FBb0JBLE1BQU1xQixnQkFBZ0IsU0FBaEJBLGFBQWdCLENBQUNDLElBQUQsRUFBVTtBQUM5QixXQUFPQSxLQUFLTixHQUFMLENBQVMsVUFBQzlDLElBQUQsRUFBVTtBQUN4QixhQUFPO0FBQ0wsZ0JBQVEsU0FESDtBQUVMYyxrQkFBVTtBQUNSdUMsZ0JBQU0sT0FERTtBQUVSQyx1QkFBYSxDQUFDdEQsS0FBSzZCLEdBQU4sRUFBVzdCLEtBQUs0QixHQUFoQjtBQUZMLFNBRkw7QUFNTDJCLG9CQUFZO0FBQ1ZDLDJCQUFpQnhELElBRFA7QUFFVnlELHdCQUFjekQsS0FBSzJCLFVBQUwsQ0FBZ0IrQixXQUFoQixPQUFpQyxPQUFqQyxHQUEyQ3pCLFlBQVlqQyxJQUFaLENBQTNDLEdBQStEc0IsWUFBWXRCLElBQVo7QUFGbkU7QUFOUCxPQUFQO0FBV0QsS0FaTSxDQUFQO0FBYUQsR0FkRDs7QUFnQkEsU0FBTyxZQUFNO0FBQ1gsUUFBSThDLE1BQU1hLEVBQUViLEdBQUYsQ0FBTSxLQUFOLEVBQWFjLE9BQWIsQ0FBcUIsQ0FBQyxpQkFBRCxFQUFvQixpQkFBcEIsQ0FBckIsRUFBNkQsQ0FBN0QsQ0FBVjs7QUFFQUQsTUFBRUUsU0FBRixDQUFZLHlDQUFaLEVBQXVEO0FBQ25EQyxtQkFBYTtBQURzQyxLQUF2RCxFQUVHQyxLQUZILENBRVNqQixHQUZUOztBQUlBO0FBQ0EsV0FBTztBQUNMa0IsWUFBTWxCLEdBREQ7QUFFTG1CLGlCQUFXLG1CQUFDQyxPQUFELEVBQVVDLE9BQVYsRUFBc0I7QUFDL0IsWUFBTUMsU0FBUyxDQUFDRixPQUFELEVBQVVDLE9BQVYsQ0FBZjtBQUNBckIsWUFBSXVCLFNBQUosQ0FBY0QsTUFBZDtBQUNELE9BTEk7QUFNTEUsaUJBQVcsbUJBQUNDLE1BQUQsRUFBdUI7QUFBQSxZQUFkQyxJQUFjLHVFQUFQLEVBQU87O0FBQ2hDLFlBQUksQ0FBQ0QsTUFBRCxJQUFXLENBQUNBLE9BQU8sQ0FBUCxDQUFaLElBQXlCQSxPQUFPLENBQVAsS0FBYSxFQUF0QyxJQUNLLENBQUNBLE9BQU8sQ0FBUCxDQUROLElBQ21CQSxPQUFPLENBQVAsS0FBYSxFQURwQyxFQUN3QztBQUN4Q3pCLFlBQUljLE9BQUosQ0FBWVcsTUFBWixFQUFvQkMsSUFBcEI7QUFDRCxPQVZJO0FBV0xDLGtCQUFZLG9CQUFDckIsSUFBRCxFQUFVO0FBQ3BCc0IsZ0JBQVFDLEdBQVIsQ0FBWXZCLElBQVo7QUFDQSxZQUFNd0IsVUFBVTtBQUNkdkIsZ0JBQU0sbUJBRFE7QUFFZHdCLG9CQUFVMUIsY0FBY0MsSUFBZDtBQUZJLFNBQWhCOztBQUtBc0IsZ0JBQVFDLEdBQVIsQ0FBWUcsS0FBS0MsU0FBTCxDQUFlSCxPQUFmLENBQVo7O0FBRUFqQixVQUFFcUIsT0FBRixDQUFVSixPQUFWLEVBQW1CO0FBQ2ZLLHdCQUFjLHNCQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDakNULG9CQUFRQyxHQUFSLENBQVlPLE9BQVosRUFBcUJDLE1BQXJCO0FBQ0EsZ0JBQUlDLHVCQUF1QjtBQUN2QkMsc0JBQVEsQ0FEZTtBQUV2QkMseUJBQVdKLFFBQVEzQixVQUFSLENBQW1CQyxlQUFuQixDQUFtQzdCLFVBQW5DLEtBQWtELE9BQWxELEdBQTRELFNBQTVELEdBQXdFLFNBRjVEO0FBR3ZCNEQscUJBQU8sT0FIZ0I7QUFJdkJDLHNCQUFRLENBSmU7QUFLdkJDLHVCQUFTLENBTGM7QUFNdkJDLDJCQUFhO0FBTlUsYUFBM0I7QUFRQSxtQkFBTy9CLEVBQUVnQyxZQUFGLENBQWVSLE1BQWYsRUFBdUJDLG9CQUF2QixDQUFQO0FBQ0QsV0FaYzs7QUFjakJRLHlCQUFlLHVCQUFDVixPQUFELEVBQVVXLEtBQVYsRUFBb0I7QUFDakMsZ0JBQUlYLFFBQVEzQixVQUFSLElBQXNCMkIsUUFBUTNCLFVBQVIsQ0FBbUJFLFlBQTdDLEVBQTJEO0FBQ3pEb0Msb0JBQU1DLFNBQU4sQ0FBZ0JaLFFBQVEzQixVQUFSLENBQW1CRSxZQUFuQztBQUNEO0FBQ0Y7QUFsQmdCLFNBQW5CLEVBbUJHTSxLQW5CSCxDQW1CU2pCLEdBbkJUO0FBcUJELE9BekNJO0FBMENMaUQsY0FBUSxnQkFBQzFELENBQUQsRUFBTztBQUNiLFlBQUksQ0FBQ0EsQ0FBRCxJQUFNLENBQUNBLEVBQUVULEdBQVQsSUFBZ0IsQ0FBQ1MsRUFBRVIsR0FBdkIsRUFBNkI7O0FBRTdCaUIsWUFBSWMsT0FBSixDQUFZRCxFQUFFcUMsTUFBRixDQUFTM0QsRUFBRVQsR0FBWCxFQUFnQlMsRUFBRVIsR0FBbEIsQ0FBWixFQUFvQyxFQUFwQztBQUNEO0FBOUNJLEtBQVA7QUFnREQsR0F4REQ7QUF5REQsQ0FwSGtCLENBb0hoQlgsTUFwSGdCLENBQW5COzs7QUNEQSxJQUFNL0IsZUFBZ0IsVUFBQ1AsQ0FBRCxFQUFPO0FBQzNCLFNBQU8sWUFBc0M7QUFBQSxRQUFyQ3FILFVBQXFDLHVFQUF4QixtQkFBd0I7O0FBQzNDLFFBQU1oRixVQUFVLE9BQU9nRixVQUFQLEtBQXNCLFFBQXRCLEdBQWlDckgsRUFBRXFILFVBQUYsQ0FBakMsR0FBaURBLFVBQWpFO0FBQ0EsUUFBSXJFLE1BQU0sSUFBVjtBQUNBLFFBQUlDLE1BQU0sSUFBVjs7QUFFQSxRQUFJcUUsV0FBVyxFQUFmOztBQUVBakYsWUFBUU4sRUFBUixDQUFXLFFBQVgsRUFBcUIsVUFBQ3dGLENBQUQsRUFBTztBQUMxQkEsUUFBRUMsY0FBRjtBQUNBeEUsWUFBTVgsUUFBUThCLElBQVIsQ0FBYSxpQkFBYixFQUFnQ3NELEdBQWhDLEVBQU47QUFDQXhFLFlBQU1aLFFBQVE4QixJQUFSLENBQWEsaUJBQWIsRUFBZ0NzRCxHQUFoQyxFQUFOOztBQUVBLFVBQUlDLE9BQU8xSCxFQUFFMkgsT0FBRixDQUFVdEYsUUFBUXVGLFNBQVIsRUFBVixDQUFYO0FBQ0EsYUFBT0YsS0FBSyxpQkFBTCxDQUFQOztBQUVBMUQsYUFBTzZELFFBQVAsQ0FBZ0JDLElBQWhCLEdBQXVCOUgsRUFBRStILEtBQUYsQ0FBUUwsSUFBUixDQUF2QjtBQUNELEtBVEQ7O0FBV0ExSCxNQUFFSSxRQUFGLEVBQVkyQixFQUFaLENBQWUsUUFBZixFQUF5QixtQ0FBekIsRUFBOEQsWUFBTTtBQUNsRU0sY0FBUTJGLE9BQVIsQ0FBZ0IsUUFBaEI7QUFDRCxLQUZEOztBQUtBLFdBQU87QUFDTEMsa0JBQVksb0JBQUNDLFFBQUQsRUFBYztBQUN4QixZQUFJbEUsT0FBTzZELFFBQVAsQ0FBZ0JDLElBQWhCLENBQXFCSyxNQUFyQixHQUE4QixDQUFsQyxFQUFxQztBQUNuQyxjQUFJQyxTQUFTcEksRUFBRTJILE9BQUYsQ0FBVTNELE9BQU82RCxRQUFQLENBQWdCQyxJQUFoQixDQUFxQk8sU0FBckIsQ0FBK0IsQ0FBL0IsQ0FBVixDQUFiO0FBQ0FoRyxrQkFBUThCLElBQVIsQ0FBYSxpQkFBYixFQUFnQ3NELEdBQWhDLENBQW9DVyxPQUFPcEYsR0FBM0M7QUFDQVgsa0JBQVE4QixJQUFSLENBQWEsaUJBQWIsRUFBZ0NzRCxHQUFoQyxDQUFvQ1csT0FBT25GLEdBQTNDO0FBQ0FaLGtCQUFROEIsSUFBUixDQUFhLG9CQUFiLEVBQW1Dc0QsR0FBbkMsQ0FBdUNXLE9BQU9FLE1BQTlDO0FBQ0FqRyxrQkFBUThCLElBQVIsQ0FBYSxvQkFBYixFQUFtQ3NELEdBQW5DLENBQXVDVyxPQUFPRyxNQUE5Qzs7QUFFQSxjQUFJSCxPQUFPeEUsTUFBWCxFQUFtQjtBQUNqQnZCLG9CQUFROEIsSUFBUixDQUFhLG1DQUFiLEVBQWtEVCxVQUFsRCxDQUE2RCxTQUE3RDtBQUNBMEUsbUJBQU94RSxNQUFQLENBQWM0RSxPQUFkLENBQXNCLGdCQUFRO0FBQzVCbkcsc0JBQVE4QixJQUFSLENBQWEsOENBQThDL0MsSUFBOUMsR0FBcUQsSUFBbEUsRUFBd0VxSCxJQUF4RSxDQUE2RSxTQUE3RSxFQUF3RixJQUF4RjtBQUNELGFBRkQ7QUFHRDtBQUNGOztBQUVELFlBQUlQLFlBQVksT0FBT0EsUUFBUCxLQUFvQixVQUFwQyxFQUFnRDtBQUM5Q0E7QUFDRDtBQUNGLE9BcEJJO0FBcUJMUSxxQkFBZSx5QkFBTTtBQUNuQixZQUFJQyxhQUFhM0ksRUFBRTJILE9BQUYsQ0FBVXRGLFFBQVF1RixTQUFSLEVBQVYsQ0FBakI7QUFDQSxlQUFPZSxXQUFXLGlCQUFYLENBQVA7O0FBRUEsZUFBT0EsVUFBUDtBQUNELE9BMUJJO0FBMkJMQyxzQkFBZ0Isd0JBQUM1RixHQUFELEVBQU1DLEdBQU4sRUFBYztBQUM1QlosZ0JBQVE4QixJQUFSLENBQWEsaUJBQWIsRUFBZ0NzRCxHQUFoQyxDQUFvQ3pFLEdBQXBDO0FBQ0FYLGdCQUFROEIsSUFBUixDQUFhLGlCQUFiLEVBQWdDc0QsR0FBaEMsQ0FBb0N4RSxHQUFwQztBQUNBO0FBQ0QsT0EvQkk7QUFnQ0xkLHNCQUFnQix3QkFBQ0MsUUFBRCxFQUFjOztBQUU1QixZQUFNb0QsU0FBUyxDQUFDLENBQUNwRCxTQUFTeUcsQ0FBVCxDQUFXQyxDQUFaLEVBQWUxRyxTQUFTMEcsQ0FBVCxDQUFXQSxDQUExQixDQUFELEVBQStCLENBQUMxRyxTQUFTeUcsQ0FBVCxDQUFXQSxDQUFaLEVBQWV6RyxTQUFTMEcsQ0FBVCxDQUFXRCxDQUExQixDQUEvQixDQUFmOztBQUVBeEcsZ0JBQVE4QixJQUFSLENBQWEsb0JBQWIsRUFBbUNzRCxHQUFuQyxDQUF1Q3ZCLEtBQUtDLFNBQUwsQ0FBZVgsT0FBTyxDQUFQLENBQWYsQ0FBdkM7QUFDQW5ELGdCQUFROEIsSUFBUixDQUFhLG9CQUFiLEVBQW1Dc0QsR0FBbkMsQ0FBdUN2QixLQUFLQyxTQUFMLENBQWVYLE9BQU8sQ0FBUCxDQUFmLENBQXZDO0FBQ0FuRCxnQkFBUTJGLE9BQVIsQ0FBZ0IsUUFBaEI7QUFDRCxPQXZDSTtBQXdDTGUscUJBQWUseUJBQU07QUFDbkIxRyxnQkFBUTJGLE9BQVIsQ0FBZ0IsUUFBaEI7QUFDRDtBQTFDSSxLQUFQO0FBNENELEdBbkVEO0FBb0VELENBckVvQixDQXFFbEIxRixNQXJFa0IsQ0FBckI7OztBQ0FBLENBQUMsVUFBU3RDLENBQVQsRUFBWTs7QUFFWDs7QUFFQTtBQUNBLE1BQU1nSixlQUFlekksY0FBckI7QUFDTXlJLGVBQWFmLFVBQWI7O0FBRU4sTUFBTWdCLGFBQWFELGFBQWFOLGFBQWIsRUFBbkI7QUFDQSxNQUFNUSxhQUFhNUUsWUFBbkI7O0FBRUEsTUFBTTZFLGNBQWMzRyxhQUFwQjs7QUFFQSxNQUFHeUcsV0FBV2pHLEdBQVgsSUFBa0JpRyxXQUFXaEcsR0FBaEMsRUFBcUM7QUFDbkNpRyxlQUFXeEQsU0FBWCxDQUFxQixDQUFDdUQsV0FBV2pHLEdBQVosRUFBaUJpRyxXQUFXaEcsR0FBNUIsQ0FBckI7QUFDRDs7QUFFRDs7OztBQUlBakQsSUFBRUksUUFBRixFQUFZMkIsRUFBWixDQUFlLHFCQUFmLEVBQXNDLFVBQUNxSCxLQUFELEVBQVFDLE9BQVIsRUFBb0I7QUFDeERGLGdCQUFZckYsWUFBWjtBQUNELEdBRkQ7O0FBSUE5RCxJQUFFSSxRQUFGLEVBQVkyQixFQUFaLENBQWUsNEJBQWYsRUFBNkMsVUFBQ3FILEtBQUQsRUFBUUMsT0FBUixFQUFvQjs7QUFFL0RGLGdCQUFZM0YsWUFBWixDQUF5QjZGLE9BQXpCO0FBQ0QsR0FIRDs7QUFLQTs7O0FBR0FySixJQUFFSSxRQUFGLEVBQVkyQixFQUFaLENBQWUsb0JBQWYsRUFBcUMsVUFBQ3FILEtBQUQsRUFBUUMsT0FBUixFQUFvQjtBQUN2RDtBQUNBLFFBQUksQ0FBQ0EsT0FBRCxJQUFZLENBQUNBLFFBQVFmLE1BQXJCLElBQStCLENBQUNlLFFBQVFkLE1BQTVDLEVBQW9EO0FBQ2xEO0FBQ0Q7O0FBRUQsUUFBSUQsU0FBU3BDLEtBQUtvRCxLQUFMLENBQVdELFFBQVFmLE1BQW5CLENBQWI7QUFDQSxRQUFJQyxTQUFTckMsS0FBS29ELEtBQUwsQ0FBV0QsUUFBUWQsTUFBbkIsQ0FBYjtBQUNBVyxlQUFXN0QsU0FBWCxDQUFxQmlELE1BQXJCLEVBQTZCQyxNQUE3QjtBQUNBO0FBQ0QsR0FWRDtBQVdBO0FBQ0F2SSxJQUFFSSxRQUFGLEVBQVkyQixFQUFaLENBQWUsa0JBQWYsRUFBbUMsVUFBQ3dGLENBQUQsRUFBSWdDLEdBQUosRUFBWTtBQUM3Q0wsZUFBV3JELFVBQVgsQ0FBc0IwRCxJQUFJQyxJQUExQjtBQUNELEdBRkQ7O0FBSUF4SixJQUFFZ0UsTUFBRixFQUFVakMsRUFBVixDQUFhLFlBQWIsRUFBMkIsVUFBQ3FILEtBQUQsRUFBVztBQUNwQyxRQUFNdEIsT0FBTzlELE9BQU82RCxRQUFQLENBQWdCQyxJQUE3QjtBQUNBLFFBQUlBLEtBQUtLLE1BQUwsSUFBZSxDQUFuQixFQUFzQjtBQUN0QixRQUFNUSxhQUFhM0ksRUFBRTJILE9BQUYsQ0FBVUcsS0FBS08sU0FBTCxDQUFlLENBQWYsQ0FBVixDQUFuQjtBQUNBLFFBQU1vQixTQUFTTCxNQUFNTSxhQUFOLENBQW9CRCxNQUFuQzs7QUFHQSxRQUFNRSxVQUFVM0osRUFBRTJILE9BQUYsQ0FBVThCLE9BQU9wQixTQUFQLENBQWlCb0IsT0FBT0csTUFBUCxDQUFjLEdBQWQsSUFBbUIsQ0FBcEMsQ0FBVixDQUFoQjs7QUFFQTVKLE1BQUVJLFFBQUYsRUFBWTRILE9BQVosQ0FBb0IsNEJBQXBCLEVBQWtEVyxVQUFsRDs7QUFFQTtBQUNBLFFBQUlnQixRQUFRckIsTUFBUixLQUFtQkssV0FBV0wsTUFBOUIsSUFBd0NxQixRQUFRcEIsTUFBUixLQUFtQkksV0FBV0osTUFBMUUsRUFBa0Y7QUFDaEZ2SSxRQUFFSSxRQUFGLEVBQVk0SCxPQUFaLENBQW9CLG9CQUFwQixFQUEwQ1csVUFBMUM7QUFDRDtBQUNGLEdBZkQ7O0FBaUJBOztBQUVBOztBQUVBOztBQUVBOztBQUVBM0ksSUFBRTZKLElBQUYsQ0FBTztBQUNMM0csU0FBSywwREFEQSxFQUM0RDtBQUNqRTRHLGNBQVUsUUFGTDtBQUdMQyxXQUFPLElBSEY7QUFJTEMsYUFBUyxpQkFBQ1IsSUFBRCxFQUFVO0FBQ2pCLFVBQUliLGFBQWFLLGFBQWFOLGFBQWIsRUFBakI7O0FBRUExSSxRQUFFSSxRQUFGLEVBQVk0SCxPQUFaLENBQW9CLHFCQUFwQjtBQUNBO0FBQ0FoSSxRQUFFSSxRQUFGLEVBQVk0SCxPQUFaLENBQW9CLGtCQUFwQixFQUF3QyxFQUFFd0IsTUFBTXhGLE9BQU9DLFdBQWYsRUFBeEM7QUFDQTtBQUNEO0FBWEksR0FBUDs7QUFjQWdHLGFBQVcsWUFBTTtBQUNmakssTUFBRUksUUFBRixFQUFZNEgsT0FBWixDQUFvQiw0QkFBcEIsRUFBa0RnQixhQUFhTixhQUFiLEVBQWxEO0FBQ0ExSSxNQUFFSSxRQUFGLEVBQVk0SCxPQUFaLENBQW9CLG9CQUFwQixFQUEwQ2dCLGFBQWFOLGFBQWIsRUFBMUM7QUFDQTVDLFlBQVFDLEdBQVIsQ0FBWWlELGFBQWFOLGFBQWIsRUFBWjtBQUNELEdBSkQsRUFJRyxHQUpIO0FBTUQsQ0E5RkQsRUE4RkdwRyxNQTlGSCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbi8vQVBJIDpBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cbmNvbnN0IEF1dG9jb21wbGV0ZU1hbmFnZXIgPSAoZnVuY3Rpb24oJCkge1xuICAvL0luaXRpYWxpemF0aW9uLi4uXG5cbiAgY29uc3QgQVBJX0tFWSA9IFwiQUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXCI7XG5cbiAgcmV0dXJuICh0YXJnZXQpID0+IHtcblxuICAgIGNvbnN0IHRhcmdldEl0ZW0gPSB0eXBlb2YgdGFyZ2V0ID09IFwic3RyaW5nXCIgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCkgOiB0YXJnZXQ7XG4gICAgY29uc3QgcXVlcnlNZ3IgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICB2YXIgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcblxuICAgICQodGFyZ2V0SXRlbSkudHlwZWFoZWFkKHtcbiAgICAgICAgICAgICAgICBoaW50OiB0cnVlLFxuICAgICAgICAgICAgICAgIGhpZ2hsaWdodDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBtaW5MZW5ndGg6IDQsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lczoge1xuICAgICAgICAgICAgICAgICAgbWVudTogJ3R0LWRyb3Bkb3duLW1lbnUnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ3NlYXJjaC1yZXN1bHRzJyxcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAoaXRlbSkgPT4gaXRlbS5mb3JtYXR0ZWRfYWRkcmVzcyxcbiAgICAgICAgICAgICAgICBsaW1pdDogMTAsXG4gICAgICAgICAgICAgICAgc291cmNlOiBmdW5jdGlvbiAocSwgc3luYywgYXN5bmMpe1xuICAgICAgICAgICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogcSB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgYXN5bmMocmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKS5vbigndHlwZWFoZWFkOnNlbGVjdGVkJywgZnVuY3Rpb24gKG9iaiwgZGF0dW0pIHtcbiAgICAgICAgICAgICAgICBpZihkYXR1bSlcbiAgICAgICAgICAgICAgICB7XG5cbiAgICAgICAgICAgICAgICAgIHZhciBnZW9tZXRyeSA9IGRhdHVtLmdlb21ldHJ5O1xuICAgICAgICAgICAgICAgICAgcXVlcnlNZ3IudXBkYXRlVmlld3BvcnQoZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgLy8gIG1hcC5maXRCb3VuZHMoZ2VvbWV0cnkuYm91bmRzPyBnZW9tZXRyeS5ib3VuZHMgOiBnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cblxuICAgIHJldHVybiB7XG4gICAgICAkdGFyZ2V0OiAkKHRhcmdldEl0ZW0pLFxuICAgICAgdGFyZ2V0OiB0YXJnZXRJdGVtXG4gICAgfVxuICB9XG5cbn0oalF1ZXJ5KSk7XG5cbmNvbnN0IGluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayA9ICgpID0+IHtcblxuXG4gIEF1dG9jb21wbGV0ZU1hbmFnZXIoXCJpbnB1dFtuYW1lPSdzZWFyY2gtbG9jYXRpb24nXVwiKTtcbn07XG4iLCIvKiBUaGlzIGxvYWRzIGFuZCBtYW5hZ2VzIHRoZSBsaXN0ISAqL1xuXG5jb25zdCBMaXN0TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldExpc3QgPSBcIiNldmVudHMtbGlzdFwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRMaXN0ID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0TGlzdCkgOiB0YXJnZXRMaXN0O1xuXG4gICAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSkgPT4ge1xuXG4gICAgICB2YXIgZGF0ZSA9IG1vbWVudChpdGVtLnN0YXJ0X2RhdGV0aW1lKS5mb3JtYXQoXCJkZGRkIOKAoiBNTU0gREQgaDptbWFcIik7XG4gICAgICByZXR1cm4gYFxuICAgICAgPGxpIGNsYXNzPScke2l0ZW0uZXZlbnRfdHlwZX0nIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnRcIj5cbiAgICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgICA8bGk+JHtpdGVtLmV2ZW50X3R5cGV9PC9saT5cbiAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDxoMj48YSBocmVmPVwiLy8ke2l0ZW0udXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgICAgPGg0PiR7ZGF0ZX08L2g0PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICAgIDxwPiR7aXRlbS52ZW51ZX08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiLy8ke2l0ZW0udXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPlJTVlA8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSkgPT4ge1xuXG4gICAgICByZXR1cm4gYFxuICAgICAgPGxpPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ncm91cFwiPlxuICAgICAgICAgIDxoMj48YSBocmVmPVwiL1wiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGUgfHwgYEdyb3VwYH08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgICA8cD5Db2xvcmFkbywgVVNBPC9wPlxuICAgICAgICAgICAgPHA+JHtpdGVtLmRldGFpbHMgfHwgYDM1MCBDb2xvcmFkbyBpcyB3b3JraW5nIGxvY2FsbHkgdG8gaGVscCBidWlsZCB0aGUgZ2xvYmFsXG4gICAgICAgICAgICAgICAzNTAub3JnIG1vdmVtZW50IHRvIHNvbHZlIHRoZSBjbGltYXRlIGNyaXNpcyBhbmQgdHJhbnNpdGlvblxuICAgICAgICAgICAgICAgdG8gYSBjbGVhbiwgcmVuZXdhYmxlIGVuZXJneSBmdXR1cmUuYH1cbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCI+R2V0IEludm9sdmVkPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAkbGlzdDogJHRhcmdldCxcbiAgICAgIHVwZGF0ZUZpbHRlcjogKHApID0+IHtcbiAgICAgICAgaWYoIXApIHJldHVybjtcblxuICAgICAgICAvLyBSZW1vdmUgRmlsdGVyc1xuXG4gICAgICAgICR0YXJnZXQucmVtb3ZlUHJvcChcImNsYXNzXCIpO1xuICAgICAgICAkdGFyZ2V0LmFkZENsYXNzKHAuZmlsdGVyLmpvaW4oXCIgXCIpKVxuICAgICAgfSxcbiAgICAgIHBvcHVsYXRlTGlzdDogKCkgPT4ge1xuICAgICAgICAvL3VzaW5nIHdpbmRvdy5FVkVOVF9EQVRBXG5cbiAgICAgICAgdmFyICRldmVudExpc3QgPSB3aW5kb3cuRVZFTlRTX0RBVEEubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgIHJldHVybiBpdGVtLmV2ZW50X3R5cGUgIT09ICdHcm91cCcgPyByZW5kZXJFdmVudChpdGVtKSA6IHJlbmRlckdyb3VwKGl0ZW0pO1xuICAgICAgICB9KVxuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsIGxpJykucmVtb3ZlKCk7XG4gICAgICAgICR0YXJnZXQuZmluZCgndWwnKS5hcHBlbmQoJGV2ZW50TGlzdCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsIlxuY29uc3QgTWFwTWFuYWdlciA9ICgoJCkgPT4ge1xuXG4gIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0pID0+IHtcbiAgICB2YXIgZGF0ZSA9IG1vbWVudChpdGVtLnN0YXJ0X2RhdGV0aW1lKS5mb3JtYXQoXCJkZGRkIOKAoiBNTU0gREQgaDptbWFcIik7XG4gICAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPSdwb3B1cC1pdGVtICR7aXRlbS5ldmVudF90eXBlfScgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnRcIj5cbiAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgIDxsaT4ke2l0ZW0uZXZlbnRfdHlwZX08L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8aDI+PGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICA8aDQ+JHtkYXRlfTwvaDQ+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5SU1ZQPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICAgIGBcbiAgfTtcblxuICBjb25zdCByZW5kZXJHcm91cCA9IChpdGVtKSA9PiB7XG4gICAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPSdwb3B1cC1pdGVtICR7aXRlbS5ldmVudF90eXBlfScgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXBcIj5cbiAgICAgICAgPGgyPjxhIGhyZWY9XCIvXCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZSB8fCBgR3JvdXBgfTwvYT48L2gyPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgPHA+Q29sb3JhZG8sIFVTQTwvcD5cbiAgICAgICAgICA8cD4ke2l0ZW0uZGV0YWlscyB8fCBgMzUwIENvbG9yYWRvIGlzIHdvcmtpbmcgbG9jYWxseSB0byBoZWxwIGJ1aWxkIHRoZSBnbG9iYWxcbiAgICAgICAgICAgICAzNTAub3JnIG1vdmVtZW50IHRvIHNvbHZlIHRoZSBjbGltYXRlIGNyaXNpcyBhbmQgdHJhbnNpdGlvblxuICAgICAgICAgICAgIHRvIGEgY2xlYW4sIHJlbmV3YWJsZSBlbmVyZ3kgZnV0dXJlLmB9XG4gICAgICAgICAgPC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgYFxuICB9O1xuXG4gIGNvbnN0IHJlbmRlckdlb2pzb24gPSAobGlzdCkgPT4ge1xuICAgIHJldHVybiBsaXN0Lm1hcCgoaXRlbSkgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgIHR5cGU6IFwiUG9pbnRcIixcbiAgICAgICAgICBjb29yZGluYXRlczogW2l0ZW0ubG5nLCBpdGVtLmxhdF1cbiAgICAgICAgfSxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIGV2ZW50UHJvcGVydGllczogaXRlbSxcbiAgICAgICAgICBwb3B1cENvbnRlbnQ6IGl0ZW0uZXZlbnRfdHlwZS50b0xvd2VyQ2FzZSgpID09PSdncm91cCcgPyByZW5kZXJHcm91cChpdGVtKSA6IHJlbmRlckV2ZW50KGl0ZW0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuICgpID0+IHtcbiAgICB2YXIgbWFwID0gTC5tYXAoJ21hcCcpLnNldFZpZXcoWzM0Ljg4NTkzMDk0MDc1MzE3LCA1LjA5NzY1NjI1MDAwMDAwMV0sIDIpO1xuXG4gICAgTC50aWxlTGF5ZXIoJ2h0dHA6Ly97c30udGlsZS5vc20ub3JnL3t6fS97eH0ve3l9LnBuZycsIHtcbiAgICAgICAgYXR0cmlidXRpb246ICcmY29weTsgPGEgaHJlZj1cImh0dHA6Ly9vc20ub3JnL2NvcHlyaWdodFwiPk9wZW5TdHJlZXRNYXA8L2E+IGNvbnRyaWJ1dG9ycyDigKIgPGEgaHJlZj1cIi8vMzUwLm9yZ1wiPjM1MC5vcmc8L2E+J1xuICAgIH0pLmFkZFRvKG1hcCk7XG5cbiAgICAvLyBtYXAuZml0Qm91bmRzKFsgW1s0MC43MjE2MDE1MTk3MDg1LCAtNzMuODUxNzQ2OTgwMjkxNTJdLCBbNDAuNzI0Mjk5NDgwMjkxNSwgLTczLjg0OTA0OTAxOTcwODVdXSBdKTtcbiAgICByZXR1cm4ge1xuICAgICAgJG1hcDogbWFwLFxuICAgICAgc2V0Qm91bmRzOiAoYm91bmRzMSwgYm91bmRzMikgPT4ge1xuICAgICAgICBjb25zdCBib3VuZHMgPSBbYm91bmRzMSwgYm91bmRzMl07XG4gICAgICAgIG1hcC5maXRCb3VuZHMoYm91bmRzKTtcbiAgICAgIH0sXG4gICAgICBzZXRDZW50ZXI6IChjZW50ZXIsIHpvb20gPSAxMCkgPT4ge1xuICAgICAgICBpZiAoIWNlbnRlciB8fCAhY2VudGVyWzBdIHx8IGNlbnRlclswXSA9PSBcIlwiXG4gICAgICAgICAgICAgIHx8ICFjZW50ZXJbMV0gfHwgY2VudGVyWzFdID09IFwiXCIpIHJldHVybjtcbiAgICAgICAgbWFwLnNldFZpZXcoY2VudGVyLCB6b29tKTtcbiAgICAgIH0sXG4gICAgICBwbG90UG9pbnRzOiAobGlzdCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhsaXN0KTtcbiAgICAgICAgY29uc3QgZ2VvanNvbiA9IHtcbiAgICAgICAgICB0eXBlOiBcIkZlYXR1cmVDb2xsZWN0aW9uXCIsXG4gICAgICAgICAgZmVhdHVyZXM6IHJlbmRlckdlb2pzb24obGlzdClcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShnZW9qc29uKSk7XG5cbiAgICAgICAgTC5nZW9KU09OKGdlb2pzb24sIHtcbiAgICAgICAgICAgIHBvaW50VG9MYXllcjogKGZlYXR1cmUsIGxhdGxuZykgPT4ge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhmZWF0dXJlLCBsYXRsbmcpO1xuICAgICAgICAgICAgICB2YXIgZ2VvanNvbk1hcmtlck9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICByYWRpdXM6IDgsXG4gICAgICAgICAgICAgICAgICBmaWxsQ29sb3I6IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuZXZlbnRfdHlwZSA9PT0gJ0dyb3VwJyA/IFwiIzQwRDdENFwiIDogXCIjMEY4MUU4XCIsXG4gICAgICAgICAgICAgICAgICBjb2xvcjogXCJ3aGl0ZVwiLFxuICAgICAgICAgICAgICAgICAgd2VpZ2h0OiAxLFxuICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAwLjhcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgcmV0dXJuIEwuY2lyY2xlTWFya2VyKGxhdGxuZywgZ2VvanNvbk1hcmtlck9wdGlvbnMpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgIG9uRWFjaEZlYXR1cmU6IChmZWF0dXJlLCBsYXllcikgPT4ge1xuICAgICAgICAgICAgaWYgKGZlYXR1cmUucHJvcGVydGllcyAmJiBmZWF0dXJlLnByb3BlcnRpZXMucG9wdXBDb250ZW50KSB7XG4gICAgICAgICAgICAgIGxheWVyLmJpbmRQb3B1cChmZWF0dXJlLnByb3BlcnRpZXMucG9wdXBDb250ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pLmFkZFRvKG1hcCk7XG5cbiAgICAgIH0sXG4gICAgICB1cGRhdGU6IChwKSA9PiB7XG4gICAgICAgIGlmICghcCB8fCAhcC5sYXQgfHwgIXAubG5nICkgcmV0dXJuO1xuXG4gICAgICAgIG1hcC5zZXRWaWV3KEwubGF0TG5nKHAubGF0LCBwLmxuZyksIDEwKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiY29uc3QgUXVlcnlNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIHJldHVybiAodGFyZ2V0Rm9ybSA9IFwiZm9ybSNmaWx0ZXJzLWZvcm1cIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0Rm9ybSA9PT0gJ3N0cmluZycgPyAkKHRhcmdldEZvcm0pIDogdGFyZ2V0Rm9ybTtcbiAgICBsZXQgbGF0ID0gbnVsbDtcbiAgICBsZXQgbG5nID0gbnVsbDtcblxuICAgIGxldCBwcmV2aW91cyA9IHt9O1xuXG4gICAgJHRhcmdldC5vbignc3VibWl0JywgKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGxhdCA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwoKTtcbiAgICAgIGxuZyA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwoKTtcblxuICAgICAgdmFyIGZvcm0gPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG4gICAgICBkZWxldGUgZm9ybVsnc2VhcmNoLWxvY2F0aW9uJ107XG5cbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJC5wYXJhbShmb3JtKTtcbiAgICB9KVxuXG4gICAgJChkb2N1bWVudCkub24oJ2NoYW5nZScsICcuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF0nLCAoKSA9PiB7XG4gICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgIH0pXG5cblxuICAgIHJldHVybiB7XG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgcGFyYW1zID0gJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSlcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKHBhcmFtcy5sYXQpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwocGFyYW1zLmxuZyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChwYXJhbXMuYm91bmQxKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKHBhcmFtcy5ib3VuZDIpO1xuXG4gICAgICAgICAgaWYgKHBhcmFtcy5maWx0ZXIpIHtcbiAgICAgICAgICAgICR0YXJnZXQuZmluZChcIi5maWx0ZXItaXRlbSBpbnB1dFt0eXBlPWNoZWNrYm94XVwiKS5yZW1vdmVQcm9wKFwiY2hlY2tlZFwiKTtcbiAgICAgICAgICAgIHBhcmFtcy5maWx0ZXIuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdW3ZhbHVlPSdcIiArIGl0ZW0gKyBcIiddXCIpLnByb3AoXCJjaGVja2VkXCIsIHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBnZXRQYXJhbWV0ZXJzOiAoKSA9PiB7XG4gICAgICAgIHZhciBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuICAgICAgICBkZWxldGUgcGFyYW1ldGVyc1snc2VhcmNoLWxvY2F0aW9uJ107XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtZXRlcnM7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTG9jYXRpb246IChsYXQsIGxuZykgPT4ge1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKGxhdCk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwobG5nKTtcbiAgICAgICAgLy8gJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVWaWV3cG9ydDogKHZpZXdwb3J0KSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW1t2aWV3cG9ydC5mLmIsIHZpZXdwb3J0LmIuYl0sIFt2aWV3cG9ydC5mLmYsIHZpZXdwb3J0LmIuZl1dO1xuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdHJpZ2dlclN1Ym1pdDogKCkgPT4ge1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSkoalF1ZXJ5KTtcbiIsIihmdW5jdGlvbigkKSB7XG5cbiAgLy8gMS4gZ29vZ2xlIG1hcHMgZ2VvY29kZVxuXG4gIC8vIDIuIGZvY3VzIG1hcCBvbiBnZW9jb2RlICh2aWEgbGF0L2xuZylcbiAgY29uc3QgcXVlcnlNYW5hZ2VyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgICAgIHF1ZXJ5TWFuYWdlci5pbml0aWFsaXplKCk7XG5cbiAgY29uc3QgaW5pdFBhcmFtcyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gIGNvbnN0IG1hcE1hbmFnZXIgPSBNYXBNYW5hZ2VyKCk7XG5cbiAgY29uc3QgbGlzdE1hbmFnZXIgPSBMaXN0TWFuYWdlcigpO1xuXG4gIGlmKGluaXRQYXJhbXMubGF0ICYmIGluaXRQYXJhbXMubG5nKSB7XG4gICAgbWFwTWFuYWdlci5zZXRDZW50ZXIoW2luaXRQYXJhbXMubGF0LCBpbml0UGFyYW1zLmxuZ10pO1xuICB9XG5cbiAgLyoqKlxuICAqIExpc3QgRXZlbnRzXG4gICogVGhpcyB3aWxsIHRyaWdnZXIgdGhlIGxpc3QgdXBkYXRlIG1ldGhvZFxuICAqL1xuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnBvcHVsYXRlTGlzdCgpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcblxuICAgIGxpc3RNYW5hZ2VyLnVwZGF0ZUZpbHRlcihvcHRpb25zKTtcbiAgfSlcblxuICAvKioqXG4gICogTWFwIEV2ZW50c1xuICAqL1xuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgLy8gbWFwTWFuYWdlci5zZXRDZW50ZXIoW29wdGlvbnMubGF0LCBvcHRpb25zLmxuZ10pO1xuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGJvdW5kMSA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDEpO1xuICAgIHZhciBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcbiAgICBtYXBNYW5hZ2VyLnNldEJvdW5kcyhib3VuZDEsIGJvdW5kMik7XG4gICAgLy8gY29uc29sZS5sb2cob3B0aW9ucylcbiAgfSk7XG4gIC8vIDMuIG1hcmtlcnMgb24gbWFwXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC1wbG90JywgKGUsIG9wdCkgPT4ge1xuICAgIG1hcE1hbmFnZXIucGxvdFBvaW50cyhvcHQuZGF0YSk7XG4gIH0pXG5cbiAgJCh3aW5kb3cpLm9uKFwiaGFzaGNoYW5nZVwiLCAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgaWYgKGhhc2gubGVuZ3RoID09IDApIHJldHVybjtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKGhhc2guc3Vic3RyaW5nKDEpKTtcbiAgICBjb25zdCBvbGRVUkwgPSBldmVudC5vcmlnaW5hbEV2ZW50Lm9sZFVSTDtcblxuXG4gICAgY29uc3Qgb2xkSGFzaCA9ICQuZGVwYXJhbShvbGRVUkwuc3Vic3RyaW5nKG9sZFVSTC5zZWFyY2goXCIjXCIpKzEpKTtcblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG5cbiAgICAvLyBTbyB0aGF0IGNoYW5nZSBpbiBmaWx0ZXJzIHdpbGwgbm90IHVwZGF0ZSB0aGlzXG4gICAgaWYgKG9sZEhhc2guYm91bmQxICE9PSBwYXJhbWV0ZXJzLmJvdW5kMSB8fCBvbGRIYXNoLmJvdW5kMiAhPT0gcGFyYW1ldGVycy5ib3VuZDIpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgIH1cbiAgfSlcblxuICAvLyA0LiBmaWx0ZXIgb3V0IGl0ZW1zIGluIGFjdGl2aXR5LWFyZWFcblxuICAvLyA1LiBnZXQgbWFwIGVsZW1lbnRzXG5cbiAgLy8gNi4gZ2V0IEdyb3VwIGRhdGFcblxuICAvLyA3LiBwcmVzZW50IGdyb3VwIGVsZW1lbnRzXG5cbiAgJC5hamF4KHtcbiAgICB1cmw6ICdodHRwczovL2RuYjZsZWFuZ3g2ZGMuY2xvdWRmcm9udC5uZXQvb3V0cHV0LzM1MG9yZy5qcy5neicsIC8vJ3wqKkRBVEFfU09VUkNFKip8JyxcbiAgICBkYXRhVHlwZTogJ3NjcmlwdCcsXG4gICAgY2FjaGU6IHRydWUsXG4gICAgc3VjY2VzczogKGRhdGEpID0+IHtcbiAgICAgIHZhciBwYXJhbWV0ZXJzID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LXVwZGF0ZScpO1xuICAgICAgLy8gJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXBsb3QnLCB7IGRhdGE6IHdpbmRvdy5FVkVOVFNfREFUQSB9KTtcbiAgICAgIC8vVE9ETzogTWFrZSB0aGUgZ2VvanNvbiBjb252ZXJzaW9uIGhhcHBlbiBvbiB0aGUgYmFja2VuZFxuICAgIH1cbiAgfSk7XG5cbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpKTtcbiAgICBjb25zb2xlLmxvZyhxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpKVxuICB9LCAxMDApO1xuXG59KShqUXVlcnkpO1xuIl19
