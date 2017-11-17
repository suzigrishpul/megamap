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

      var date = moment(item.start_datetime).format("dddd MMM DD – h:mma");
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9saXN0LmpzIiwiY2xhc3Nlcy9tYXAuanMiLCJjbGFzc2VzL3F1ZXJ5LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIkF1dG9jb21wbGV0ZU1hbmFnZXIiLCIkIiwiQVBJX0tFWSIsInRhcmdldCIsInRhcmdldEl0ZW0iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJxdWVyeU1nciIsIlF1ZXJ5TWFuYWdlciIsImdlb2NvZGVyIiwiZ29vZ2xlIiwibWFwcyIsIkdlb2NvZGVyIiwidHlwZWFoZWFkIiwiaGludCIsImhpZ2hsaWdodCIsIm1pbkxlbmd0aCIsImNsYXNzTmFtZXMiLCJtZW51IiwibmFtZSIsImRpc3BsYXkiLCJpdGVtIiwiZm9ybWF0dGVkX2FkZHJlc3MiLCJsaW1pdCIsInNvdXJjZSIsInEiLCJzeW5jIiwiYXN5bmMiLCJnZW9jb2RlIiwiYWRkcmVzcyIsInJlc3VsdHMiLCJzdGF0dXMiLCJvbiIsIm9iaiIsImRhdHVtIiwiZ2VvbWV0cnkiLCJ1cGRhdGVWaWV3cG9ydCIsInZpZXdwb3J0IiwiJHRhcmdldCIsImpRdWVyeSIsImluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayIsIkxpc3RNYW5hZ2VyIiwidGFyZ2V0TGlzdCIsInJlbmRlckV2ZW50IiwiZGF0ZSIsIm1vbWVudCIsInN0YXJ0X2RhdGV0aW1lIiwiZm9ybWF0IiwiZXZlbnRfdHlwZSIsImxhdCIsImxuZyIsInVybCIsInRpdGxlIiwidmVudWUiLCJyZW5kZXJHcm91cCIsImRldGFpbHMiLCIkbGlzdCIsInVwZGF0ZUZpbHRlciIsInAiLCJyZW1vdmVQcm9wIiwiYWRkQ2xhc3MiLCJmaWx0ZXIiLCJqb2luIiwicG9wdWxhdGVMaXN0IiwiJGV2ZW50TGlzdCIsIndpbmRvdyIsIkVWRU5UU19EQVRBIiwibWFwIiwiZmluZCIsInJlbW92ZSIsImFwcGVuZCIsIk1hcE1hbmFnZXIiLCJyZW5kZXJHZW9qc29uIiwibGlzdCIsInJlbmRlcmVkIiwidG9Mb3dlckNhc2UiLCJ0eXBlIiwiY29vcmRpbmF0ZXMiLCJwcm9wZXJ0aWVzIiwiZXZlbnRQcm9wZXJ0aWVzIiwicG9wdXBDb250ZW50IiwiTCIsInNldFZpZXciLCJ0aWxlTGF5ZXIiLCJhdHRyaWJ1dGlvbiIsImFkZFRvIiwiJG1hcCIsInNldEJvdW5kcyIsImJvdW5kczEiLCJib3VuZHMyIiwiYm91bmRzIiwiZml0Qm91bmRzIiwic2V0Q2VudGVyIiwiY2VudGVyIiwiem9vbSIsImZpbHRlck1hcCIsImZpbHRlcnMiLCJjb25zb2xlIiwibG9nIiwiaGlkZSIsImZvckVhY2giLCJzaG93IiwicGxvdFBvaW50cyIsImdlb2pzb24iLCJmZWF0dXJlcyIsImdlb0pTT04iLCJwb2ludFRvTGF5ZXIiLCJmZWF0dXJlIiwibGF0bG5nIiwiZXZlbnRUeXBlIiwiZ2VvanNvbk1hcmtlck9wdGlvbnMiLCJyYWRpdXMiLCJmaWxsQ29sb3IiLCJjb2xvciIsIndlaWdodCIsIm9wYWNpdHkiLCJmaWxsT3BhY2l0eSIsImNsYXNzTmFtZSIsImNpcmNsZU1hcmtlciIsIm9uRWFjaEZlYXR1cmUiLCJsYXllciIsImJpbmRQb3B1cCIsInVwZGF0ZSIsImxhdExuZyIsInRhcmdldEZvcm0iLCJwcmV2aW91cyIsImUiLCJwcmV2ZW50RGVmYXVsdCIsInZhbCIsImZvcm0iLCJkZXBhcmFtIiwic2VyaWFsaXplIiwibG9jYXRpb24iLCJoYXNoIiwicGFyYW0iLCJ0cmlnZ2VyIiwiaW5pdGlhbGl6ZSIsImNhbGxiYWNrIiwibGVuZ3RoIiwicGFyYW1zIiwic3Vic3RyaW5nIiwiYm91bmQxIiwiYm91bmQyIiwicHJvcCIsImdldFBhcmFtZXRlcnMiLCJwYXJhbWV0ZXJzIiwidXBkYXRlTG9jYXRpb24iLCJmIiwiYiIsIkpTT04iLCJzdHJpbmdpZnkiLCJ0cmlnZ2VyU3VibWl0IiwicXVlcnlNYW5hZ2VyIiwiaW5pdFBhcmFtcyIsIm1hcE1hbmFnZXIiLCJsaXN0TWFuYWdlciIsImV2ZW50Iiwib3B0aW9ucyIsInBhcnNlIiwib3B0IiwiZGF0YSIsIm9sZFVSTCIsIm9yaWdpbmFsRXZlbnQiLCJvbGRIYXNoIiwic2VhcmNoIiwiYWpheCIsImRhdGFUeXBlIiwiY2FjaGUiLCJzdWNjZXNzIiwic2V0VGltZW91dCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7QUFDQSxJQUFNQSxzQkFBdUIsVUFBU0MsQ0FBVCxFQUFZO0FBQ3ZDOztBQUVBLE1BQU1DLFVBQVUseUNBQWhCOztBQUVBLFNBQU8sVUFBQ0MsTUFBRCxFQUFZOztBQUVqQixRQUFNQyxhQUFhLE9BQU9ELE1BQVAsSUFBaUIsUUFBakIsR0FBNEJFLFNBQVNDLGFBQVQsQ0FBdUJILE1BQXZCLENBQTVCLEdBQTZEQSxNQUFoRjtBQUNBLFFBQU1JLFdBQVdDLGNBQWpCO0FBQ0EsUUFBSUMsV0FBVyxJQUFJQyxPQUFPQyxJQUFQLENBQVlDLFFBQWhCLEVBQWY7O0FBRUFYLE1BQUVHLFVBQUYsRUFBY1MsU0FBZCxDQUF3QjtBQUNaQyxZQUFNLElBRE07QUFFWkMsaUJBQVcsSUFGQztBQUdaQyxpQkFBVyxDQUhDO0FBSVpDLGtCQUFZO0FBQ1ZDLGNBQU07QUFESTtBQUpBLEtBQXhCLEVBUVU7QUFDRUMsWUFBTSxnQkFEUjtBQUVFQyxlQUFTLGlCQUFDQyxJQUFEO0FBQUEsZUFBVUEsS0FBS0MsaUJBQWY7QUFBQSxPQUZYO0FBR0VDLGFBQU8sRUFIVDtBQUlFQyxjQUFRLGdCQUFVQyxDQUFWLEVBQWFDLElBQWIsRUFBbUJDLEtBQW5CLEVBQXlCO0FBQzdCbEIsaUJBQVNtQixPQUFULENBQWlCLEVBQUVDLFNBQVNKLENBQVgsRUFBakIsRUFBaUMsVUFBVUssT0FBVixFQUFtQkMsTUFBbkIsRUFBMkI7QUFDMURKLGdCQUFNRyxPQUFOO0FBQ0QsU0FGRDtBQUdIO0FBUkgsS0FSVixFQWtCVUUsRUFsQlYsQ0FrQmEsb0JBbEJiLEVBa0JtQyxVQUFVQyxHQUFWLEVBQWVDLEtBQWYsRUFBc0I7QUFDN0MsVUFBR0EsS0FBSCxFQUNBOztBQUVFLFlBQUlDLFdBQVdELE1BQU1DLFFBQXJCO0FBQ0E1QixpQkFBUzZCLGNBQVQsQ0FBd0JELFNBQVNFLFFBQWpDO0FBQ0E7QUFDRDtBQUNKLEtBMUJUOztBQTZCQSxXQUFPO0FBQ0xDLGVBQVNyQyxFQUFFRyxVQUFGLENBREo7QUFFTEQsY0FBUUM7QUFGSCxLQUFQO0FBSUQsR0F2Q0Q7QUF5Q0QsQ0E5QzRCLENBOEMzQm1DLE1BOUMyQixDQUE3Qjs7QUFnREEsSUFBTUMsaUNBQWlDLFNBQWpDQSw4QkFBaUMsR0FBTTs7QUFHM0N4QyxzQkFBb0IsK0JBQXBCO0FBQ0QsQ0FKRDs7O0FDbERBOztBQUVBLElBQU15QyxjQUFlLFVBQUN4QyxDQUFELEVBQU87QUFDMUIsU0FBTyxZQUFpQztBQUFBLFFBQWhDeUMsVUFBZ0MsdUVBQW5CLGNBQW1COztBQUN0QyxRQUFNSixVQUFVLE9BQU9JLFVBQVAsS0FBc0IsUUFBdEIsR0FBaUN6QyxFQUFFeUMsVUFBRixDQUFqQyxHQUFpREEsVUFBakU7O0FBRUEsUUFBTUMsY0FBYyxTQUFkQSxXQUFjLENBQUN0QixJQUFELEVBQVU7O0FBRTVCLFVBQUl1QixPQUFPQyxPQUFPeEIsS0FBS3lCLGNBQVosRUFBNEJDLE1BQTVCLENBQW1DLHFCQUFuQyxDQUFYO0FBQ0EscUNBQ2ExQixLQUFLMkIsVUFEbEIsb0JBQzJDM0IsS0FBSzRCLEdBRGhELG9CQUNrRTVCLEtBQUs2QixHQUR2RSxrSUFJdUI3QixLQUFLMkIsVUFKNUIsY0FJK0MzQixLQUFLMkIsVUFKcEQsZ0ZBTXlDM0IsS0FBSzhCLEdBTjlDLDJCQU1zRTlCLEtBQUsrQixLQU4zRSw0REFPbUNSLElBUG5DLHFGQVNXdkIsS0FBS2dDLEtBVGhCLGtHQVltQmhDLEtBQUs4QixHQVp4QjtBQWlCRCxLQXBCRDs7QUFzQkEsUUFBTUcsY0FBYyxTQUFkQSxXQUFjLENBQUNqQyxJQUFELEVBQVU7O0FBRTVCLGlIQUdzQ0EsS0FBSytCLEtBQUwsV0FIdEMsb0hBTVcvQixLQUFLa0MsT0FBTCwrTEFOWCxpSEFZbUJsQyxLQUFLOEIsR0FaeEI7QUFpQkQsS0FuQkQ7O0FBcUJBLFdBQU87QUFDTEssYUFBT2xCLE9BREY7QUFFTG1CLG9CQUFjLHNCQUFDQyxDQUFELEVBQU87QUFDbkIsWUFBRyxDQUFDQSxDQUFKLEVBQU87O0FBRVA7O0FBRUFwQixnQkFBUXFCLFVBQVIsQ0FBbUIsT0FBbkI7QUFDQXJCLGdCQUFRc0IsUUFBUixDQUFpQkYsRUFBRUcsTUFBRixHQUFXSCxFQUFFRyxNQUFGLENBQVNDLElBQVQsQ0FBYyxHQUFkLENBQVgsR0FBZ0MsRUFBakQ7QUFDRCxPQVRJO0FBVUxDLG9CQUFjLHdCQUFNO0FBQ2xCOztBQUVBLFlBQUlDLGFBQWFDLE9BQU9DLFdBQVAsQ0FBbUJDLEdBQW5CLENBQXVCLGdCQUFRO0FBQzlDLGlCQUFPOUMsS0FBSzJCLFVBQUwsS0FBb0IsT0FBcEIsR0FBOEJMLFlBQVl0QixJQUFaLENBQTlCLEdBQWtEaUMsWUFBWWpDLElBQVosQ0FBekQ7QUFDRCxTQUZnQixDQUFqQjtBQUdBaUIsZ0JBQVE4QixJQUFSLENBQWEsT0FBYixFQUFzQkMsTUFBdEI7QUFDQS9CLGdCQUFROEIsSUFBUixDQUFhLElBQWIsRUFBbUJFLE1BQW5CLENBQTBCTixVQUExQjtBQUNEO0FBbEJJLEtBQVA7QUFvQkQsR0FsRUQ7QUFtRUQsQ0FwRW1CLENBb0VqQnpCLE1BcEVpQixDQUFwQjs7O0FDREEsSUFBTWdDLGFBQWMsVUFBQ3RFLENBQUQsRUFBTzs7QUFFekIsTUFBTTBDLGNBQWMsU0FBZEEsV0FBYyxDQUFDdEIsSUFBRCxFQUFVO0FBQzVCLFFBQUl1QixPQUFPQyxPQUFPeEIsS0FBS3lCLGNBQVosRUFBNEJDLE1BQTVCLENBQW1DLG9CQUFuQyxDQUFYO0FBQ0EsOENBQ3lCMUIsS0FBSzJCLFVBRDlCLHNCQUN1RDNCLEtBQUs0QixHQUQ1RCxzQkFDOEU1QixLQUFLNkIsR0FEbkYsaUhBSTJCN0IsS0FBSzJCLFVBSmhDLFdBSStDM0IsS0FBSzJCLFVBQUwsSUFBbUIsUUFKbEUsMEVBTXlDM0IsS0FBSzhCLEdBTjlDLDRCQU1zRTlCLEtBQUsrQixLQU4zRSxtREFPOEJSLElBUDlCLCtFQVNXdkIsS0FBS2dDLEtBVGhCLHlGQVltQmhDLEtBQUs4QixHQVp4QjtBQWlCRCxHQW5CRDs7QUFxQkEsTUFBTUcsY0FBYyxTQUFkQSxXQUFjLENBQUNqQyxJQUFELEVBQVU7QUFDNUIsOENBQ3lCQSxLQUFLMkIsVUFEOUIsc0JBQ3VEM0IsS0FBSzRCLEdBRDVELHNCQUM4RTVCLEtBQUs2QixHQURuRix3RkFHc0M3QixLQUFLK0IsS0FBTCxXQUh0Qyw0R0FNVy9CLEtBQUtrQyxPQUFMLDJMQU5YLHNHQVltQmxDLEtBQUs4QixHQVp4QjtBQWlCRCxHQWxCRDs7QUFvQkEsTUFBTXFCLGdCQUFnQixTQUFoQkEsYUFBZ0IsQ0FBQ0MsSUFBRCxFQUFVO0FBQzlCLFdBQU9BLEtBQUtOLEdBQUwsQ0FBUyxVQUFDOUMsSUFBRCxFQUFVO0FBQ3hCO0FBQ0EsVUFBSXFELGlCQUFKO0FBQ0EsVUFBSSxDQUFDckQsS0FBSzJCLFVBQU4sSUFBb0IsQ0FBQzNCLEtBQUsyQixVQUFMLENBQWdCMkIsV0FBaEIsRUFBRCxLQUFtQyxPQUEzRCxFQUFvRTtBQUNsRUQsbUJBQVcvQixZQUFZdEIsSUFBWixDQUFYO0FBQ0QsT0FGRCxNQUVPO0FBQ0xxRCxtQkFBV3BCLFlBQVlqQyxJQUFaLENBQVg7QUFDRDs7QUFFRCxhQUFPO0FBQ0wsZ0JBQVEsU0FESDtBQUVMYyxrQkFBVTtBQUNSeUMsZ0JBQU0sT0FERTtBQUVSQyx1QkFBYSxDQUFDeEQsS0FBSzZCLEdBQU4sRUFBVzdCLEtBQUs0QixHQUFoQjtBQUZMLFNBRkw7QUFNTDZCLG9CQUFZO0FBQ1ZDLDJCQUFpQjFELElBRFA7QUFFVjJELHdCQUFjTjtBQUZKO0FBTlAsT0FBUDtBQVdELEtBcEJNLENBQVA7QUFxQkQsR0F0QkQ7O0FBd0JBLFNBQU8sWUFBTTtBQUNYLFFBQUlQLE1BQU1jLEVBQUVkLEdBQUYsQ0FBTSxLQUFOLEVBQWFlLE9BQWIsQ0FBcUIsQ0FBQyxpQkFBRCxFQUFvQixpQkFBcEIsQ0FBckIsRUFBNkQsQ0FBN0QsQ0FBVjs7QUFFQUQsTUFBRUUsU0FBRixDQUFZLHlDQUFaLEVBQXVEO0FBQ25EQyxtQkFBYTtBQURzQyxLQUF2RCxFQUVHQyxLQUZILENBRVNsQixHQUZUOztBQUlBO0FBQ0EsV0FBTztBQUNMbUIsWUFBTW5CLEdBREQ7QUFFTG9CLGlCQUFXLG1CQUFDQyxPQUFELEVBQVVDLE9BQVYsRUFBc0I7QUFDL0IsWUFBTUMsU0FBUyxDQUFDRixPQUFELEVBQVVDLE9BQVYsQ0FBZjtBQUNBdEIsWUFBSXdCLFNBQUosQ0FBY0QsTUFBZDtBQUNELE9BTEk7QUFNTEUsaUJBQVcsbUJBQUNDLE1BQUQsRUFBdUI7QUFBQSxZQUFkQyxJQUFjLHVFQUFQLEVBQU87O0FBQ2hDLFlBQUksQ0FBQ0QsTUFBRCxJQUFXLENBQUNBLE9BQU8sQ0FBUCxDQUFaLElBQXlCQSxPQUFPLENBQVAsS0FBYSxFQUF0QyxJQUNLLENBQUNBLE9BQU8sQ0FBUCxDQUROLElBQ21CQSxPQUFPLENBQVAsS0FBYSxFQURwQyxFQUN3QztBQUN4QzFCLFlBQUllLE9BQUosQ0FBWVcsTUFBWixFQUFvQkMsSUFBcEI7QUFDRCxPQVZJO0FBV0xDLGlCQUFXLG1CQUFDQyxPQUFELEVBQWE7QUFDdEJDLGdCQUFRQyxHQUFSLENBQVksYUFBWixFQUEyQkYsT0FBM0I7QUFDQS9GLFVBQUUsTUFBRixFQUFVbUUsSUFBVixDQUFlLG1CQUFmLEVBQW9DK0IsSUFBcEM7QUFDQUYsZ0JBQVFDLEdBQVIsQ0FBWWpHLEVBQUUsTUFBRixFQUFVbUUsSUFBVixDQUFlLG1CQUFmLENBQVo7O0FBRUEsWUFBSSxDQUFDNEIsT0FBTCxFQUFjOztBQUVkQSxnQkFBUUksT0FBUixDQUFnQixVQUFDL0UsSUFBRCxFQUFVO0FBQ3hCNEUsa0JBQVFDLEdBQVIsQ0FBWSx1QkFBdUI3RSxLQUFLc0QsV0FBTCxFQUFuQztBQUNBMUUsWUFBRSxNQUFGLEVBQVVtRSxJQUFWLENBQWUsdUJBQXVCL0MsS0FBS3NELFdBQUwsRUFBdEMsRUFBMEQwQixJQUExRDtBQUNELFNBSEQ7QUFJRCxPQXRCSTtBQXVCTEMsa0JBQVksb0JBQUM3QixJQUFELEVBQVU7O0FBRXBCLFlBQU04QixVQUFVO0FBQ2QzQixnQkFBTSxtQkFEUTtBQUVkNEIsb0JBQVVoQyxjQUFjQyxJQUFkO0FBRkksU0FBaEI7O0FBT0FRLFVBQUV3QixPQUFGLENBQVVGLE9BQVYsRUFBbUI7QUFDZkcsd0JBQWMsc0JBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUNqQyxnQkFBTUMsWUFBWUYsUUFBUTdCLFVBQVIsQ0FBbUJDLGVBQW5CLENBQW1DL0IsVUFBckQ7QUFDQSxnQkFBSThELHVCQUF1QjtBQUN2QkMsc0JBQVEsQ0FEZTtBQUV2QkMseUJBQVlILGNBQWMsT0FBZCxHQUF3QixTQUF4QixHQUFvQyxTQUZ6QjtBQUd2QkkscUJBQU8sT0FIZ0I7QUFJdkJDLHNCQUFRLENBSmU7QUFLdkJDLHVCQUFTLEdBTGM7QUFNdkJDLDJCQUFhLEdBTlU7QUFPdkJDLHlCQUFXLENBQUNSLGNBQWMsT0FBZCxHQUF3QixRQUF4QixHQUFtQyxRQUFwQyxJQUFnRDtBQVBwQyxhQUEzQjtBQVNBLG1CQUFPNUIsRUFBRXFDLFlBQUYsQ0FBZVYsTUFBZixFQUF1QkUsb0JBQXZCLENBQVA7QUFDRCxXQWJjOztBQWVqQlMseUJBQWUsdUJBQUNaLE9BQUQsRUFBVWEsS0FBVixFQUFvQjtBQUNqQyxnQkFBSWIsUUFBUTdCLFVBQVIsSUFBc0I2QixRQUFRN0IsVUFBUixDQUFtQkUsWUFBN0MsRUFBMkQ7QUFDekR3QyxvQkFBTUMsU0FBTixDQUFnQmQsUUFBUTdCLFVBQVIsQ0FBbUJFLFlBQW5DO0FBQ0Q7QUFDRjtBQW5CZ0IsU0FBbkIsRUFvQkdLLEtBcEJILENBb0JTbEIsR0FwQlQ7QUFzQkQsT0F0REk7QUF1REx1RCxjQUFRLGdCQUFDaEUsQ0FBRCxFQUFPO0FBQ2IsWUFBSSxDQUFDQSxDQUFELElBQU0sQ0FBQ0EsRUFBRVQsR0FBVCxJQUFnQixDQUFDUyxFQUFFUixHQUF2QixFQUE2Qjs7QUFFN0JpQixZQUFJZSxPQUFKLENBQVlELEVBQUUwQyxNQUFGLENBQVNqRSxFQUFFVCxHQUFYLEVBQWdCUyxFQUFFUixHQUFsQixDQUFaLEVBQW9DLEVBQXBDO0FBQ0Q7QUEzREksS0FBUDtBQTZERCxHQXJFRDtBQXNFRCxDQXpJa0IsQ0F5SWhCWCxNQXpJZ0IsQ0FBbkI7OztBQ0RBLElBQU0vQixlQUFnQixVQUFDUCxDQUFELEVBQU87QUFDM0IsU0FBTyxZQUFzQztBQUFBLFFBQXJDMkgsVUFBcUMsdUVBQXhCLG1CQUF3Qjs7QUFDM0MsUUFBTXRGLFVBQVUsT0FBT3NGLFVBQVAsS0FBc0IsUUFBdEIsR0FBaUMzSCxFQUFFMkgsVUFBRixDQUFqQyxHQUFpREEsVUFBakU7QUFDQSxRQUFJM0UsTUFBTSxJQUFWO0FBQ0EsUUFBSUMsTUFBTSxJQUFWOztBQUVBLFFBQUkyRSxXQUFXLEVBQWY7O0FBRUF2RixZQUFRTixFQUFSLENBQVcsUUFBWCxFQUFxQixVQUFDOEYsQ0FBRCxFQUFPO0FBQzFCQSxRQUFFQyxjQUFGO0FBQ0E5RSxZQUFNWCxRQUFROEIsSUFBUixDQUFhLGlCQUFiLEVBQWdDNEQsR0FBaEMsRUFBTjtBQUNBOUUsWUFBTVosUUFBUThCLElBQVIsQ0FBYSxpQkFBYixFQUFnQzRELEdBQWhDLEVBQU47O0FBRUEsVUFBSUMsT0FBT2hJLEVBQUVpSSxPQUFGLENBQVU1RixRQUFRNkYsU0FBUixFQUFWLENBQVg7QUFDQSxhQUFPRixLQUFLLGlCQUFMLENBQVA7O0FBRUFoRSxhQUFPbUUsUUFBUCxDQUFnQkMsSUFBaEIsR0FBdUJwSSxFQUFFcUksS0FBRixDQUFRTCxJQUFSLENBQXZCO0FBQ0QsS0FURDs7QUFXQWhJLE1BQUVJLFFBQUYsRUFBWTJCLEVBQVosQ0FBZSxRQUFmLEVBQXlCLG1DQUF6QixFQUE4RCxZQUFNO0FBQ2xFTSxjQUFRaUcsT0FBUixDQUFnQixRQUFoQjtBQUNELEtBRkQ7O0FBS0EsV0FBTztBQUNMQyxrQkFBWSxvQkFBQ0MsUUFBRCxFQUFjO0FBQ3hCLFlBQUl4RSxPQUFPbUUsUUFBUCxDQUFnQkMsSUFBaEIsQ0FBcUJLLE1BQXJCLEdBQThCLENBQWxDLEVBQXFDO0FBQ25DLGNBQUlDLFNBQVMxSSxFQUFFaUksT0FBRixDQUFVakUsT0FBT21FLFFBQVAsQ0FBZ0JDLElBQWhCLENBQXFCTyxTQUFyQixDQUErQixDQUEvQixDQUFWLENBQWI7QUFDQXRHLGtCQUFROEIsSUFBUixDQUFhLGlCQUFiLEVBQWdDNEQsR0FBaEMsQ0FBb0NXLE9BQU8xRixHQUEzQztBQUNBWCxrQkFBUThCLElBQVIsQ0FBYSxpQkFBYixFQUFnQzRELEdBQWhDLENBQW9DVyxPQUFPekYsR0FBM0M7QUFDQVosa0JBQVE4QixJQUFSLENBQWEsb0JBQWIsRUFBbUM0RCxHQUFuQyxDQUF1Q1csT0FBT0UsTUFBOUM7QUFDQXZHLGtCQUFROEIsSUFBUixDQUFhLG9CQUFiLEVBQW1DNEQsR0FBbkMsQ0FBdUNXLE9BQU9HLE1BQTlDOztBQUVBLGNBQUlILE9BQU85RSxNQUFYLEVBQW1CO0FBQ2pCdkIsb0JBQVE4QixJQUFSLENBQWEsbUNBQWIsRUFBa0RULFVBQWxELENBQTZELFNBQTdEO0FBQ0FnRixtQkFBTzlFLE1BQVAsQ0FBY3VDLE9BQWQsQ0FBc0IsZ0JBQVE7QUFDNUI5RCxzQkFBUThCLElBQVIsQ0FBYSw4Q0FBOEMvQyxJQUE5QyxHQUFxRCxJQUFsRSxFQUF3RTBILElBQXhFLENBQTZFLFNBQTdFLEVBQXdGLElBQXhGO0FBQ0QsYUFGRDtBQUdEO0FBQ0Y7O0FBRUQsWUFBSU4sWUFBWSxPQUFPQSxRQUFQLEtBQW9CLFVBQXBDLEVBQWdEO0FBQzlDQTtBQUNEO0FBQ0YsT0FwQkk7QUFxQkxPLHFCQUFlLHlCQUFNO0FBQ25CLFlBQUlDLGFBQWFoSixFQUFFaUksT0FBRixDQUFVNUYsUUFBUTZGLFNBQVIsRUFBVixDQUFqQjtBQUNBLGVBQU9jLFdBQVcsaUJBQVgsQ0FBUDs7QUFFQSxlQUFPQSxVQUFQO0FBQ0QsT0ExQkk7QUEyQkxDLHNCQUFnQix3QkFBQ2pHLEdBQUQsRUFBTUMsR0FBTixFQUFjO0FBQzVCWixnQkFBUThCLElBQVIsQ0FBYSxpQkFBYixFQUFnQzRELEdBQWhDLENBQW9DL0UsR0FBcEM7QUFDQVgsZ0JBQVE4QixJQUFSLENBQWEsaUJBQWIsRUFBZ0M0RCxHQUFoQyxDQUFvQzlFLEdBQXBDO0FBQ0E7QUFDRCxPQS9CSTtBQWdDTGQsc0JBQWdCLHdCQUFDQyxRQUFELEVBQWM7O0FBRTVCLFlBQU1xRCxTQUFTLENBQUMsQ0FBQ3JELFNBQVM4RyxDQUFULENBQVdDLENBQVosRUFBZS9HLFNBQVMrRyxDQUFULENBQVdBLENBQTFCLENBQUQsRUFBK0IsQ0FBQy9HLFNBQVM4RyxDQUFULENBQVdBLENBQVosRUFBZTlHLFNBQVMrRyxDQUFULENBQVdELENBQTFCLENBQS9CLENBQWY7O0FBRUE3RyxnQkFBUThCLElBQVIsQ0FBYSxvQkFBYixFQUFtQzRELEdBQW5DLENBQXVDcUIsS0FBS0MsU0FBTCxDQUFlNUQsT0FBTyxDQUFQLENBQWYsQ0FBdkM7QUFDQXBELGdCQUFROEIsSUFBUixDQUFhLG9CQUFiLEVBQW1DNEQsR0FBbkMsQ0FBdUNxQixLQUFLQyxTQUFMLENBQWU1RCxPQUFPLENBQVAsQ0FBZixDQUF2QztBQUNBcEQsZ0JBQVFpRyxPQUFSLENBQWdCLFFBQWhCO0FBQ0QsT0F2Q0k7QUF3Q0xnQixxQkFBZSx5QkFBTTtBQUNuQmpILGdCQUFRaUcsT0FBUixDQUFnQixRQUFoQjtBQUNEO0FBMUNJLEtBQVA7QUE0Q0QsR0FuRUQ7QUFvRUQsQ0FyRW9CLENBcUVsQmhHLE1BckVrQixDQUFyQjs7O0FDQUEsQ0FBQyxVQUFTdEMsQ0FBVCxFQUFZOztBQUVYOztBQUVBO0FBQ0EsTUFBTXVKLGVBQWVoSixjQUFyQjtBQUNNZ0osZUFBYWhCLFVBQWI7O0FBRU4sTUFBTWlCLGFBQWFELGFBQWFSLGFBQWIsRUFBbkI7QUFDQSxNQUFNVSxhQUFhbkYsWUFBbkI7O0FBRUEsTUFBTW9GLGNBQWNsSCxhQUFwQjs7QUFFQSxNQUFHZ0gsV0FBV3hHLEdBQVgsSUFBa0J3RyxXQUFXdkcsR0FBaEMsRUFBcUM7QUFDbkN3RyxlQUFXOUQsU0FBWCxDQUFxQixDQUFDNkQsV0FBV3hHLEdBQVosRUFBaUJ3RyxXQUFXdkcsR0FBNUIsQ0FBckI7QUFDRDs7QUFFRDs7OztBQUlBakQsSUFBRUksUUFBRixFQUFZMkIsRUFBWixDQUFlLHFCQUFmLEVBQXNDLFVBQUM0SCxLQUFELEVBQVFDLE9BQVIsRUFBb0I7QUFDeERGLGdCQUFZNUYsWUFBWjtBQUNELEdBRkQ7O0FBSUE5RCxJQUFFSSxRQUFGLEVBQVkyQixFQUFaLENBQWUsNEJBQWYsRUFBNkMsVUFBQzRILEtBQUQsRUFBUUMsT0FBUixFQUFvQjs7QUFFL0RGLGdCQUFZbEcsWUFBWixDQUF5Qm9HLE9BQXpCO0FBQ0QsR0FIRDs7QUFLQTs7O0FBR0E1SixJQUFFSSxRQUFGLEVBQVkyQixFQUFaLENBQWUsb0JBQWYsRUFBcUMsVUFBQzRILEtBQUQsRUFBUUMsT0FBUixFQUFvQjtBQUN2RDtBQUNBLFFBQUksQ0FBQ0EsT0FBRCxJQUFZLENBQUNBLFFBQVFoQixNQUFyQixJQUErQixDQUFDZ0IsUUFBUWYsTUFBNUMsRUFBb0Q7QUFDbEQ7QUFDRDs7QUFFRCxRQUFJRCxTQUFTUSxLQUFLUyxLQUFMLENBQVdELFFBQVFoQixNQUFuQixDQUFiO0FBQ0EsUUFBSUMsU0FBU08sS0FBS1MsS0FBTCxDQUFXRCxRQUFRZixNQUFuQixDQUFiO0FBQ0FZLGVBQVduRSxTQUFYLENBQXFCc0QsTUFBckIsRUFBNkJDLE1BQTdCO0FBQ0E7QUFDRCxHQVZEO0FBV0E7QUFDQTdJLElBQUVJLFFBQUYsRUFBWTJCLEVBQVosQ0FBZSxrQkFBZixFQUFtQyxVQUFDOEYsQ0FBRCxFQUFJaUMsR0FBSixFQUFZO0FBQzdDTCxlQUFXcEQsVUFBWCxDQUFzQnlELElBQUlDLElBQTFCO0FBQ0EvSixNQUFFSSxRQUFGLEVBQVlrSSxPQUFaLENBQW9CLG9CQUFwQjtBQUNELEdBSEQ7O0FBS0E7QUFDQXRJLElBQUVJLFFBQUYsRUFBWTJCLEVBQVosQ0FBZSxvQkFBZixFQUFxQyxVQUFDOEYsQ0FBRCxFQUFJaUMsR0FBSixFQUFZO0FBQy9DOUQsWUFBUUMsR0FBUixDQUFZNkQsR0FBWjtBQUNBLFFBQUlBLEdBQUosRUFBUztBQUNQTCxpQkFBVzNELFNBQVgsQ0FBcUJnRSxJQUFJbEcsTUFBekI7QUFDRDtBQUNGLEdBTEQ7O0FBT0E1RCxJQUFFZ0UsTUFBRixFQUFVakMsRUFBVixDQUFhLFlBQWIsRUFBMkIsVUFBQzRILEtBQUQsRUFBVztBQUNwQyxRQUFNdkIsT0FBT3BFLE9BQU9tRSxRQUFQLENBQWdCQyxJQUE3QjtBQUNBLFFBQUlBLEtBQUtLLE1BQUwsSUFBZSxDQUFuQixFQUFzQjtBQUN0QixRQUFNTyxhQUFhaEosRUFBRWlJLE9BQUYsQ0FBVUcsS0FBS08sU0FBTCxDQUFlLENBQWYsQ0FBVixDQUFuQjtBQUNBLFFBQU1xQixTQUFTTCxNQUFNTSxhQUFOLENBQW9CRCxNQUFuQzs7QUFHQSxRQUFNRSxVQUFVbEssRUFBRWlJLE9BQUYsQ0FBVStCLE9BQU9yQixTQUFQLENBQWlCcUIsT0FBT0csTUFBUCxDQUFjLEdBQWQsSUFBbUIsQ0FBcEMsQ0FBVixDQUFoQjs7QUFFQW5LLE1BQUVJLFFBQUYsRUFBWWtJLE9BQVosQ0FBb0IsNEJBQXBCLEVBQWtEVSxVQUFsRDtBQUNBaEosTUFBRUksUUFBRixFQUFZa0ksT0FBWixDQUFvQixvQkFBcEIsRUFBMENVLFVBQTFDOztBQUVBO0FBQ0EsUUFBSWtCLFFBQVF0QixNQUFSLEtBQW1CSSxXQUFXSixNQUE5QixJQUF3Q3NCLFFBQVFyQixNQUFSLEtBQW1CRyxXQUFXSCxNQUExRSxFQUFrRjtBQUNoRjdJLFFBQUVJLFFBQUYsRUFBWWtJLE9BQVosQ0FBb0Isb0JBQXBCLEVBQTBDVSxVQUExQztBQUNEO0FBQ0YsR0FoQkQ7O0FBa0JBOztBQUVBOztBQUVBOztBQUVBOztBQUVBaEosSUFBRW9LLElBQUYsQ0FBTztBQUNMbEgsU0FBSywwRUFEQSxFQUM0RTtBQUNqRm1ILGNBQVUsUUFGTDtBQUdMQyxXQUFPLElBSEY7QUFJTEMsYUFBUyxpQkFBQ1IsSUFBRCxFQUFVO0FBQ2pCLFVBQUlmLGFBQWFPLGFBQWFSLGFBQWIsRUFBakI7O0FBRUEvRSxhQUFPQyxXQUFQLENBQW1Ca0MsT0FBbkIsQ0FBMkIsVUFBQy9FLElBQUQsRUFBVTtBQUNuQ0EsYUFBSyxZQUFMLElBQXFCLENBQUNBLEtBQUsyQixVQUFOLEdBQW1CLFFBQW5CLEdBQThCM0IsS0FBSzJCLFVBQXhEO0FBQ0QsT0FGRDtBQUdBL0MsUUFBRUksUUFBRixFQUFZa0ksT0FBWixDQUFvQixxQkFBcEI7QUFDQTtBQUNBdEksUUFBRUksUUFBRixFQUFZa0ksT0FBWixDQUFvQixrQkFBcEIsRUFBd0MsRUFBRXlCLE1BQU0vRixPQUFPQyxXQUFmLEVBQXhDO0FBQ0E7QUFDRDtBQWRJLEdBQVA7O0FBaUJBdUcsYUFBVyxZQUFNO0FBQ2Z4SyxNQUFFSSxRQUFGLEVBQVlrSSxPQUFaLENBQW9CLDRCQUFwQixFQUFrRGlCLGFBQWFSLGFBQWIsRUFBbEQ7QUFDQS9JLE1BQUVJLFFBQUYsRUFBWWtJLE9BQVosQ0FBb0Isb0JBQXBCLEVBQTBDaUIsYUFBYVIsYUFBYixFQUExQztBQUNBL0MsWUFBUUMsR0FBUixDQUFZc0QsYUFBYVIsYUFBYixFQUFaO0FBQ0QsR0FKRCxFQUlHLEdBSkg7QUFNRCxDQTNHRCxFQTJHR3pHLE1BM0dIIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuLy9BUEkgOkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVxuY29uc3QgQXV0b2NvbXBsZXRlTWFuYWdlciA9IChmdW5jdGlvbigkKSB7XG4gIC8vSW5pdGlhbGl6YXRpb24uLi5cblxuICBjb25zdCBBUElfS0VZID0gXCJBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cIjtcblxuICByZXR1cm4gKHRhcmdldCkgPT4ge1xuXG4gICAgY29uc3QgdGFyZ2V0SXRlbSA9IHR5cGVvZiB0YXJnZXQgPT0gXCJzdHJpbmdcIiA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KSA6IHRhcmdldDtcbiAgICBjb25zdCBxdWVyeU1nciA9IFF1ZXJ5TWFuYWdlcigpO1xuICAgIHZhciBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuXG4gICAgJCh0YXJnZXRJdGVtKS50eXBlYWhlYWQoe1xuICAgICAgICAgICAgICAgIGhpbnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgaGlnaGxpZ2h0OiB0cnVlLFxuICAgICAgICAgICAgICAgIG1pbkxlbmd0aDogNCxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWVzOiB7XG4gICAgICAgICAgICAgICAgICBtZW51OiAndHQtZHJvcGRvd24tbWVudSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnc2VhcmNoLXJlc3VsdHMnLFxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IChpdGVtKSA9PiBpdGVtLmZvcm1hdHRlZF9hZGRyZXNzLFxuICAgICAgICAgICAgICAgIGxpbWl0OiAxMCxcbiAgICAgICAgICAgICAgICBzb3VyY2U6IGZ1bmN0aW9uIChxLCBzeW5jLCBhc3luYyl7XG4gICAgICAgICAgICAgICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBxIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICBhc3luYyhyZXN1bHRzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApLm9uKCd0eXBlYWhlYWQ6c2VsZWN0ZWQnLCBmdW5jdGlvbiAob2JqLCBkYXR1bSkge1xuICAgICAgICAgICAgICAgIGlmKGRhdHVtKVxuICAgICAgICAgICAgICAgIHtcblxuICAgICAgICAgICAgICAgICAgdmFyIGdlb21ldHJ5ID0gZGF0dW0uZ2VvbWV0cnk7XG4gICAgICAgICAgICAgICAgICBxdWVyeU1nci51cGRhdGVWaWV3cG9ydChnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgICAvLyAgbWFwLmZpdEJvdW5kcyhnZW9tZXRyeS5ib3VuZHM/IGdlb21ldHJ5LmJvdW5kcyA6IGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuXG4gICAgcmV0dXJuIHtcbiAgICAgICR0YXJnZXQ6ICQodGFyZ2V0SXRlbSksXG4gICAgICB0YXJnZXQ6IHRhcmdldEl0ZW1cbiAgICB9XG4gIH1cblxufShqUXVlcnkpKTtcblxuY29uc3QgaW5pdGlhbGl6ZUF1dG9jb21wbGV0ZUNhbGxiYWNrID0gKCkgPT4ge1xuXG5cbiAgQXV0b2NvbXBsZXRlTWFuYWdlcihcImlucHV0W25hbWU9J3NlYXJjaC1sb2NhdGlvbiddXCIpO1xufTtcbiIsIi8qIFRoaXMgbG9hZHMgYW5kIG1hbmFnZXMgdGhlIGxpc3QhICovXG5cbmNvbnN0IExpc3RNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIHJldHVybiAodGFyZ2V0TGlzdCA9IFwiI2V2ZW50cy1saXN0XCIpID0+IHtcbiAgICBjb25zdCAkdGFyZ2V0ID0gdHlwZW9mIHRhcmdldExpc3QgPT09ICdzdHJpbmcnID8gJCh0YXJnZXRMaXN0KSA6IHRhcmdldExpc3Q7XG5cbiAgICBjb25zdCByZW5kZXJFdmVudCA9IChpdGVtKSA9PiB7XG5cbiAgICAgIHZhciBkYXRlID0gbW9tZW50KGl0ZW0uc3RhcnRfZGF0ZXRpbWUpLmZvcm1hdChcImRkZGQgTU1NIEREIOKAkyBoOm1tYVwiKTtcbiAgICAgIHJldHVybiBgXG4gICAgICA8bGkgY2xhc3M9JyR7aXRlbS5ldmVudF90eXBlfScgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudCB0eXBlLWFjdGlvblwiPlxuICAgICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICAgIDxsaSBjbGFzcz0ndGFnLSR7aXRlbS5ldmVudF90eXBlfSB0YWcnPiR7aXRlbS5ldmVudF90eXBlfTwvbGk+XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgICA8aDIgY2xhc3M9XCJldmVudC10aXRsZVwiPjxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZX08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtZGF0ZSBkYXRlXCI+JHtkYXRlfTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1hZGRyZXNzIGFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgICAgPHA+JHtpdGVtLnZlbnVlfTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5SU1ZQPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIGNvbnN0IHJlbmRlckdyb3VwID0gKGl0ZW0pID0+IHtcblxuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaT5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXBcIj5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIi9cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlIHx8IGBHcm91cGB9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgICAgPHA+Q29sb3JhZG8sIFVTQTwvcD5cbiAgICAgICAgICAgIDxwPiR7aXRlbS5kZXRhaWxzIHx8IGAzNTAgQ29sb3JhZG8gaXMgd29ya2luZyBsb2NhbGx5IHRvIGhlbHAgYnVpbGQgdGhlIGdsb2JhbFxuICAgICAgICAgICAgICAgMzUwLm9yZyBtb3ZlbWVudCB0byBzb2x2ZSB0aGUgY2xpbWF0ZSBjcmlzaXMgYW5kIHRyYW5zaXRpb25cbiAgICAgICAgICAgICAgIHRvIGEgY2xlYW4sIHJlbmV3YWJsZSBlbmVyZ3kgZnV0dXJlLmB9XG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiLy8ke2l0ZW0udXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+R2V0IEludm9sdmVkPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAkbGlzdDogJHRhcmdldCxcbiAgICAgIHVwZGF0ZUZpbHRlcjogKHApID0+IHtcbiAgICAgICAgaWYoIXApIHJldHVybjtcblxuICAgICAgICAvLyBSZW1vdmUgRmlsdGVyc1xuXG4gICAgICAgICR0YXJnZXQucmVtb3ZlUHJvcChcImNsYXNzXCIpO1xuICAgICAgICAkdGFyZ2V0LmFkZENsYXNzKHAuZmlsdGVyID8gcC5maWx0ZXIuam9pbihcIiBcIikgOiAnJylcbiAgICAgIH0sXG4gICAgICBwb3B1bGF0ZUxpc3Q6ICgpID0+IHtcbiAgICAgICAgLy91c2luZyB3aW5kb3cuRVZFTlRfREFUQVxuXG4gICAgICAgIHZhciAkZXZlbnRMaXN0ID0gd2luZG93LkVWRU5UU19EQVRBLm1hcChpdGVtID0+IHtcbiAgICAgICAgICByZXR1cm4gaXRlbS5ldmVudF90eXBlICE9PSAnR3JvdXAnID8gcmVuZGVyRXZlbnQoaXRlbSkgOiByZW5kZXJHcm91cChpdGVtKTtcbiAgICAgICAgfSlcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCBsaScpLnJlbW92ZSgpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsJykuYXBwZW5kKCRldmVudExpc3QpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJcbmNvbnN0IE1hcE1hbmFnZXIgPSAoKCQpID0+IHtcblxuICBjb25zdCByZW5kZXJFdmVudCA9IChpdGVtKSA9PiB7XG4gICAgdmFyIGRhdGUgPSBtb21lbnQoaXRlbS5zdGFydF9kYXRldGltZSkuZm9ybWF0KFwiZGRkZCBNTU0gREQsIGg6bW1hXCIpO1xuICAgIHJldHVybiBgXG4gICAgPGRpdiBjbGFzcz0ncG9wdXAtaXRlbSAke2l0ZW0uZXZlbnRfdHlwZX0nIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5ldmVudF90eXBlfVwiPiR7aXRlbS5ldmVudF90eXBlIHx8ICdBY3Rpb24nfTwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxoMiBjbGFzcz1cImV2ZW50LXRpdGxlXCI+PGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtZGF0ZVwiPiR7ZGF0ZX08L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWFkZHJlc3MgYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgPHA+JHtpdGVtLnZlbnVlfTwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgIDxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5SU1ZQPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICAgIGBcbiAgfTtcblxuICBjb25zdCByZW5kZXJHcm91cCA9IChpdGVtKSA9PiB7XG4gICAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPSdwb3B1cC1pdGVtICR7aXRlbS5ldmVudF90eXBlfScgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXBcIj5cbiAgICAgICAgPGgyPjxhIGhyZWY9XCIvXCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZSB8fCBgR3JvdXBgfTwvYT48L2gyPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgPHA+Q29sb3JhZG8sIFVTQTwvcD5cbiAgICAgICAgICA8cD4ke2l0ZW0uZGV0YWlscyB8fCBgMzUwIENvbG9yYWRvIGlzIHdvcmtpbmcgbG9jYWxseSB0byBoZWxwIGJ1aWxkIHRoZSBnbG9iYWxcbiAgICAgICAgICAgICAzNTAub3JnIG1vdmVtZW50IHRvIHNvbHZlIHRoZSBjbGltYXRlIGNyaXNpcyBhbmQgdHJhbnNpdGlvblxuICAgICAgICAgICAgIHRvIGEgY2xlYW4sIHJlbmV3YWJsZSBlbmVyZ3kgZnV0dXJlLmB9XG4gICAgICAgICAgPC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPkdldCBJbnZvbHZlZDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR2VvanNvbiA9IChsaXN0KSA9PiB7XG4gICAgcmV0dXJuIGxpc3QubWFwKChpdGVtKSA9PiB7XG4gICAgICAvLyByZW5kZXJlZCBldmVudFR5cGVcbiAgICAgIGxldCByZW5kZXJlZDtcbiAgICAgIGlmICghaXRlbS5ldmVudF90eXBlIHx8ICFpdGVtLmV2ZW50X3R5cGUudG9Mb3dlckNhc2UoKSAhPT0gJ2dyb3VwJykge1xuICAgICAgICByZW5kZXJlZCA9IHJlbmRlckV2ZW50KGl0ZW0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVuZGVyZWQgPSByZW5kZXJHcm91cChpdGVtKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgIHR5cGU6IFwiUG9pbnRcIixcbiAgICAgICAgICBjb29yZGluYXRlczogW2l0ZW0ubG5nLCBpdGVtLmxhdF1cbiAgICAgICAgfSxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIGV2ZW50UHJvcGVydGllczogaXRlbSxcbiAgICAgICAgICBwb3B1cENvbnRlbnQ6IHJlbmRlcmVkXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuICgpID0+IHtcbiAgICB2YXIgbWFwID0gTC5tYXAoJ21hcCcpLnNldFZpZXcoWzM0Ljg4NTkzMDk0MDc1MzE3LCA1LjA5NzY1NjI1MDAwMDAwMV0sIDIpO1xuXG4gICAgTC50aWxlTGF5ZXIoJ2h0dHA6Ly97c30udGlsZS5vc20ub3JnL3t6fS97eH0ve3l9LnBuZycsIHtcbiAgICAgICAgYXR0cmlidXRpb246ICcmY29weTsgPGEgaHJlZj1cImh0dHA6Ly9vc20ub3JnL2NvcHlyaWdodFwiPk9wZW5TdHJlZXRNYXA8L2E+IGNvbnRyaWJ1dG9ycyDigKIgPGEgaHJlZj1cIi8vMzUwLm9yZ1wiPjM1MC5vcmc8L2E+J1xuICAgIH0pLmFkZFRvKG1hcCk7XG5cbiAgICAvLyBtYXAuZml0Qm91bmRzKFsgW1s0MC43MjE2MDE1MTk3MDg1LCAtNzMuODUxNzQ2OTgwMjkxNTJdLCBbNDAuNzI0Mjk5NDgwMjkxNSwgLTczLjg0OTA0OTAxOTcwODVdXSBdKTtcbiAgICByZXR1cm4ge1xuICAgICAgJG1hcDogbWFwLFxuICAgICAgc2V0Qm91bmRzOiAoYm91bmRzMSwgYm91bmRzMikgPT4ge1xuICAgICAgICBjb25zdCBib3VuZHMgPSBbYm91bmRzMSwgYm91bmRzMl07XG4gICAgICAgIG1hcC5maXRCb3VuZHMoYm91bmRzKTtcbiAgICAgIH0sXG4gICAgICBzZXRDZW50ZXI6IChjZW50ZXIsIHpvb20gPSAxMCkgPT4ge1xuICAgICAgICBpZiAoIWNlbnRlciB8fCAhY2VudGVyWzBdIHx8IGNlbnRlclswXSA9PSBcIlwiXG4gICAgICAgICAgICAgIHx8ICFjZW50ZXJbMV0gfHwgY2VudGVyWzFdID09IFwiXCIpIHJldHVybjtcbiAgICAgICAgbWFwLnNldFZpZXcoY2VudGVyLCB6b29tKTtcbiAgICAgIH0sXG4gICAgICBmaWx0ZXJNYXA6IChmaWx0ZXJzKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZmlsdGVycyA+PiBcIiwgZmlsdGVycyk7XG4gICAgICAgICQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cFwiKS5oaWRlKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cFwiKSk7XG5cbiAgICAgICAgaWYgKCFmaWx0ZXJzKSByZXR1cm47XG5cbiAgICAgICAgZmlsdGVycy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCIuZXZlbnQtaXRlbS1wb3B1cC5cIiArIGl0ZW0udG9Mb3dlckNhc2UoKSk7XG4gICAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwLlwiICsgaXRlbS50b0xvd2VyQ2FzZSgpKS5zaG93KCk7XG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgcGxvdFBvaW50czogKGxpc3QpID0+IHtcblxuICAgICAgICBjb25zdCBnZW9qc29uID0ge1xuICAgICAgICAgIHR5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgICAgICAgICBmZWF0dXJlczogcmVuZGVyR2VvanNvbihsaXN0KVxuICAgICAgICB9O1xuXG5cblxuICAgICAgICBMLmdlb0pTT04oZ2VvanNvbiwge1xuICAgICAgICAgICAgcG9pbnRUb0xheWVyOiAoZmVhdHVyZSwgbGF0bG5nKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuZXZlbnRfdHlwZTtcbiAgICAgICAgICAgICAgdmFyIGdlb2pzb25NYXJrZXJPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgICAgcmFkaXVzOiA4LFxuICAgICAgICAgICAgICAgICAgZmlsbENvbG9yOiAgZXZlbnRUeXBlID09PSAnR3JvdXAnID8gXCIjNDBEN0Q0XCIgOiBcIiMwRjgxRThcIixcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiBcIndoaXRlXCIsXG4gICAgICAgICAgICAgICAgICB3ZWlnaHQ6IDIsXG4gICAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLjUsXG4gICAgICAgICAgICAgICAgICBmaWxsT3BhY2l0eTogMC44LFxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAoZXZlbnRUeXBlID09PSAnR3JvdXAnID8gJ2dyb3VwcycgOiAnZXZlbnRzJykgKyAnIGV2ZW50LWl0ZW0tcG9wdXAnXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJldHVybiBMLmNpcmNsZU1hcmtlcihsYXRsbmcsIGdlb2pzb25NYXJrZXJPcHRpb25zKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICBvbkVhY2hGZWF0dXJlOiAoZmVhdHVyZSwgbGF5ZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChmZWF0dXJlLnByb3BlcnRpZXMgJiYgZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCkge1xuICAgICAgICAgICAgICBsYXllci5iaW5kUG9wdXAoZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgICB9LFxuICAgICAgdXBkYXRlOiAocCkgPT4ge1xuICAgICAgICBpZiAoIXAgfHwgIXAubGF0IHx8ICFwLmxuZyApIHJldHVybjtcblxuICAgICAgICBtYXAuc2V0VmlldyhMLmxhdExuZyhwLmxhdCwgcC5sbmcpLCAxMCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsImNvbnN0IFF1ZXJ5TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldEZvcm0gPSBcImZvcm0jZmlsdGVycy1mb3JtXCIpID0+IHtcbiAgICBjb25zdCAkdGFyZ2V0ID0gdHlwZW9mIHRhcmdldEZvcm0gPT09ICdzdHJpbmcnID8gJCh0YXJnZXRGb3JtKSA6IHRhcmdldEZvcm07XG4gICAgbGV0IGxhdCA9IG51bGw7XG4gICAgbGV0IGxuZyA9IG51bGw7XG5cbiAgICBsZXQgcHJldmlvdXMgPSB7fTtcblxuICAgICR0YXJnZXQub24oJ3N1Ym1pdCcsIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBsYXQgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKCk7XG4gICAgICBsbmcgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKCk7XG5cbiAgICAgIHZhciBmb3JtID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuICAgICAgZGVsZXRlIGZvcm1bJ3NlYXJjaC1sb2NhdGlvbiddO1xuXG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICQucGFyYW0oZm9ybSk7XG4gICAgfSlcblxuICAgICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdJywgKCkgPT4ge1xuICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICB9KVxuXG5cbiAgICByZXR1cm4ge1xuICAgICAgaW5pdGlhbGl6ZTogKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdmFyIHBhcmFtcyA9ICQuZGVwYXJhbSh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkpXG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChwYXJhbXMubGF0KTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKHBhcmFtcy5sbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwocGFyYW1zLmJvdW5kMSk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChwYXJhbXMuYm91bmQyKTtcblxuICAgICAgICAgIGlmIChwYXJhbXMuZmlsdGVyKSB7XG4gICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF1cIikucmVtb3ZlUHJvcChcImNoZWNrZWRcIik7XG4gICAgICAgICAgICBwYXJhbXMuZmlsdGVyLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICAgICR0YXJnZXQuZmluZChcIi5maWx0ZXItaXRlbSBpbnB1dFt0eXBlPWNoZWNrYm94XVt2YWx1ZT0nXCIgKyBpdGVtICsgXCInXVwiKS5wcm9wKFwiY2hlY2tlZFwiLCB0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZ2V0UGFyYW1ldGVyczogKCkgPT4ge1xuICAgICAgICB2YXIgcGFyYW1ldGVycyA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcbiAgICAgICAgZGVsZXRlIHBhcmFtZXRlcnNbJ3NlYXJjaC1sb2NhdGlvbiddO1xuXG4gICAgICAgIHJldHVybiBwYXJhbWV0ZXJzO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZUxvY2F0aW9uOiAobGF0LCBsbmcpID0+IHtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChsYXQpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKGxuZyk7XG4gICAgICAgIC8vICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlVmlld3BvcnQ6ICh2aWV3cG9ydCkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtbdmlld3BvcnQuZi5iLCB2aWV3cG9ydC5iLmJdLCBbdmlld3BvcnQuZi5mLCB2aWV3cG9ydC5iLmZdXTtcblxuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1swXSkpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1sxXSkpO1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHRyaWdnZXJTdWJtaXQ6ICgpID0+IHtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCIoZnVuY3Rpb24oJCkge1xuXG4gIC8vIDEuIGdvb2dsZSBtYXBzIGdlb2NvZGVcblxuICAvLyAyLiBmb2N1cyBtYXAgb24gZ2VvY29kZSAodmlhIGxhdC9sbmcpXG4gIGNvbnN0IHF1ZXJ5TWFuYWdlciA9IFF1ZXJ5TWFuYWdlcigpO1xuICAgICAgICBxdWVyeU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuXG4gIGNvbnN0IGluaXRQYXJhbXMgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuICBjb25zdCBtYXBNYW5hZ2VyID0gTWFwTWFuYWdlcigpO1xuXG4gIGNvbnN0IGxpc3RNYW5hZ2VyID0gTGlzdE1hbmFnZXIoKTtcblxuICBpZihpbml0UGFyYW1zLmxhdCAmJiBpbml0UGFyYW1zLmxuZykge1xuICAgIG1hcE1hbmFnZXIuc2V0Q2VudGVyKFtpbml0UGFyYW1zLmxhdCwgaW5pdFBhcmFtcy5sbmddKTtcbiAgfVxuXG4gIC8qKipcbiAgKiBMaXN0IEV2ZW50c1xuICAqIFRoaXMgd2lsbCB0cmlnZ2VyIHRoZSBsaXN0IHVwZGF0ZSBtZXRob2RcbiAgKi9cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICBsaXN0TWFuYWdlci5wb3B1bGF0ZUxpc3QoKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG5cbiAgICBsaXN0TWFuYWdlci51cGRhdGVGaWx0ZXIob3B0aW9ucyk7XG4gIH0pXG5cbiAgLyoqKlxuICAqIE1hcCBFdmVudHNcbiAgKi9cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIC8vIG1hcE1hbmFnZXIuc2V0Q2VudGVyKFtvcHRpb25zLmxhdCwgb3B0aW9ucy5sbmddKTtcbiAgICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMuYm91bmQxIHx8ICFvcHRpb25zLmJvdW5kMikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBib3VuZDEgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQxKTtcbiAgICB2YXIgYm91bmQyID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMik7XG4gICAgbWFwTWFuYWdlci5zZXRCb3VuZHMoYm91bmQxLCBib3VuZDIpO1xuICAgIC8vIGNvbnNvbGUubG9nKG9wdGlvbnMpXG4gIH0pO1xuICAvLyAzLiBtYXJrZXJzIG9uIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtcGxvdCcsIChlLCBvcHQpID0+IHtcbiAgICBtYXBNYW5hZ2VyLnBsb3RQb2ludHMob3B0LmRhdGEpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicpO1xuICB9KVxuXG4gIC8vIEZpbHRlciBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLWZpbHRlcicsIChlLCBvcHQpID0+IHtcbiAgICBjb25zb2xlLmxvZyhvcHQpO1xuICAgIGlmIChvcHQpIHtcbiAgICAgIG1hcE1hbmFnZXIuZmlsdGVyTWFwKG9wdC5maWx0ZXIpO1xuICAgIH1cbiAgfSlcblxuICAkKHdpbmRvdykub24oXCJoYXNoY2hhbmdlXCIsIChldmVudCkgPT4ge1xuICAgIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICBpZiAoaGFzaC5sZW5ndGggPT0gMCkgcmV0dXJuO1xuICAgIGNvbnN0IHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oaGFzaC5zdWJzdHJpbmcoMSkpO1xuICAgIGNvbnN0IG9sZFVSTCA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQub2xkVVJMO1xuXG5cbiAgICBjb25zdCBvbGRIYXNoID0gJC5kZXBhcmFtKG9sZFVSTC5zdWJzdHJpbmcob2xkVVJMLnNlYXJjaChcIiNcIikrMSkpO1xuXG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCBwYXJhbWV0ZXJzKTtcblxuICAgIC8vIFNvIHRoYXQgY2hhbmdlIGluIGZpbHRlcnMgd2lsbCBub3QgdXBkYXRlIHRoaXNcbiAgICBpZiAob2xkSGFzaC5ib3VuZDEgIT09IHBhcmFtZXRlcnMuYm91bmQxIHx8IG9sZEhhc2guYm91bmQyICE9PSBwYXJhbWV0ZXJzLmJvdW5kMikge1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgfVxuICB9KVxuXG4gIC8vIDQuIGZpbHRlciBvdXQgaXRlbXMgaW4gYWN0aXZpdHktYXJlYVxuXG4gIC8vIDUuIGdldCBtYXAgZWxlbWVudHNcblxuICAvLyA2LiBnZXQgR3JvdXAgZGF0YVxuXG4gIC8vIDcuIHByZXNlbnQgZ3JvdXAgZWxlbWVudHNcblxuICAkLmFqYXgoe1xuICAgIHVybDogJ2h0dHBzOi8vczMtdXMtd2VzdC0yLmFtYXpvbmF3cy5jb20vcHBsc21hcC1kYXRhL291dHB1dC8zNTBvcmctdGVzdC5qcy5neicsIC8vJ3wqKkRBVEFfU09VUkNFKip8JyxcbiAgICBkYXRhVHlwZTogJ3NjcmlwdCcsXG4gICAgY2FjaGU6IHRydWUsXG4gICAgc3VjY2VzczogKGRhdGEpID0+IHtcbiAgICAgIHZhciBwYXJhbWV0ZXJzID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuICAgICAgd2luZG93LkVWRU5UU19EQVRBLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgaXRlbVsnZXZlbnRfdHlwZSddID0gIWl0ZW0uZXZlbnRfdHlwZSA/ICdBY3Rpb24nIDogaXRlbS5ldmVudF90eXBlO1xuICAgICAgfSlcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC11cGRhdGUnKTtcbiAgICAgIC8vICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1wbG90JywgeyBkYXRhOiB3aW5kb3cuRVZFTlRTX0RBVEEgfSk7XG4gICAgICAvL1RPRE86IE1ha2UgdGhlIGdlb2pzb24gY29udmVyc2lvbiBoYXBwZW4gb24gdGhlIGJhY2tlbmRcbiAgICB9XG4gIH0pO1xuXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKSk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKSk7XG4gICAgY29uc29sZS5sb2cocXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKSlcbiAgfSwgMTAwKTtcblxufSkoalF1ZXJ5KTtcbiJdfQ==
