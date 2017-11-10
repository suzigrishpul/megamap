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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9saXN0LmpzIiwiY2xhc3Nlcy9tYXAuanMiLCJjbGFzc2VzL3F1ZXJ5LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIkF1dG9jb21wbGV0ZU1hbmFnZXIiLCIkIiwiQVBJX0tFWSIsInRhcmdldCIsInRhcmdldEl0ZW0iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJxdWVyeU1nciIsIlF1ZXJ5TWFuYWdlciIsImdlb2NvZGVyIiwiZ29vZ2xlIiwibWFwcyIsIkdlb2NvZGVyIiwidHlwZWFoZWFkIiwiaGludCIsImhpZ2hsaWdodCIsIm1pbkxlbmd0aCIsImNsYXNzTmFtZXMiLCJtZW51IiwibmFtZSIsImRpc3BsYXkiLCJpdGVtIiwiZm9ybWF0dGVkX2FkZHJlc3MiLCJsaW1pdCIsInNvdXJjZSIsInEiLCJzeW5jIiwiYXN5bmMiLCJnZW9jb2RlIiwiYWRkcmVzcyIsInJlc3VsdHMiLCJzdGF0dXMiLCJvbiIsIm9iaiIsImRhdHVtIiwiZ2VvbWV0cnkiLCJ1cGRhdGVWaWV3cG9ydCIsInZpZXdwb3J0IiwiJHRhcmdldCIsImpRdWVyeSIsImluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayIsIkxpc3RNYW5hZ2VyIiwidGFyZ2V0TGlzdCIsInJlbmRlckV2ZW50IiwiZGF0ZSIsIm1vbWVudCIsInN0YXJ0X2RhdGV0aW1lIiwiZm9ybWF0IiwiZXZlbnRfdHlwZSIsImxhdCIsImxuZyIsInVybCIsInRpdGxlIiwidmVudWUiLCJyZW5kZXJHcm91cCIsImRldGFpbHMiLCIkbGlzdCIsInVwZGF0ZUZpbHRlciIsInAiLCJyZW1vdmVQcm9wIiwiYWRkQ2xhc3MiLCJmaWx0ZXIiLCJqb2luIiwicG9wdWxhdGVMaXN0IiwiJGV2ZW50TGlzdCIsIndpbmRvdyIsIkVWRU5UU19EQVRBIiwibWFwIiwiZmluZCIsInJlbW92ZSIsImFwcGVuZCIsIk1hcE1hbmFnZXIiLCJyZW5kZXJHZW9qc29uIiwibGlzdCIsInJlbmRlcmVkIiwidG9Mb3dlckNhc2UiLCJ0eXBlIiwiY29vcmRpbmF0ZXMiLCJwcm9wZXJ0aWVzIiwiZXZlbnRQcm9wZXJ0aWVzIiwicG9wdXBDb250ZW50IiwiTCIsInNldFZpZXciLCJ0aWxlTGF5ZXIiLCJhdHRyaWJ1dGlvbiIsImFkZFRvIiwiJG1hcCIsInNldEJvdW5kcyIsImJvdW5kczEiLCJib3VuZHMyIiwiYm91bmRzIiwiZml0Qm91bmRzIiwic2V0Q2VudGVyIiwiY2VudGVyIiwiem9vbSIsImZpbHRlck1hcCIsImZpbHRlcnMiLCJjb25zb2xlIiwibG9nIiwiaGlkZSIsImZvckVhY2giLCJzaG93IiwicGxvdFBvaW50cyIsImdlb2pzb24iLCJmZWF0dXJlcyIsImdlb0pTT04iLCJwb2ludFRvTGF5ZXIiLCJmZWF0dXJlIiwibGF0bG5nIiwiZXZlbnRUeXBlIiwiZ2VvanNvbk1hcmtlck9wdGlvbnMiLCJyYWRpdXMiLCJmaWxsQ29sb3IiLCJjb2xvciIsIndlaWdodCIsIm9wYWNpdHkiLCJmaWxsT3BhY2l0eSIsImNsYXNzTmFtZSIsImNpcmNsZU1hcmtlciIsIm9uRWFjaEZlYXR1cmUiLCJsYXllciIsImJpbmRQb3B1cCIsInVwZGF0ZSIsImxhdExuZyIsInRhcmdldEZvcm0iLCJwcmV2aW91cyIsImUiLCJwcmV2ZW50RGVmYXVsdCIsInZhbCIsImZvcm0iLCJkZXBhcmFtIiwic2VyaWFsaXplIiwibG9jYXRpb24iLCJoYXNoIiwicGFyYW0iLCJ0cmlnZ2VyIiwiaW5pdGlhbGl6ZSIsImNhbGxiYWNrIiwibGVuZ3RoIiwicGFyYW1zIiwic3Vic3RyaW5nIiwiYm91bmQxIiwiYm91bmQyIiwicHJvcCIsImdldFBhcmFtZXRlcnMiLCJwYXJhbWV0ZXJzIiwidXBkYXRlTG9jYXRpb24iLCJmIiwiYiIsIkpTT04iLCJzdHJpbmdpZnkiLCJ0cmlnZ2VyU3VibWl0IiwicXVlcnlNYW5hZ2VyIiwiaW5pdFBhcmFtcyIsIm1hcE1hbmFnZXIiLCJsaXN0TWFuYWdlciIsImV2ZW50Iiwib3B0aW9ucyIsInBhcnNlIiwib3B0IiwiZGF0YSIsIm9sZFVSTCIsIm9yaWdpbmFsRXZlbnQiLCJvbGRIYXNoIiwic2VhcmNoIiwiYWpheCIsImRhdGFUeXBlIiwiY2FjaGUiLCJzdWNjZXNzIiwic2V0VGltZW91dCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7QUFDQSxJQUFNQSxzQkFBdUIsVUFBU0MsQ0FBVCxFQUFZO0FBQ3ZDOztBQUVBLE1BQU1DLFVBQVUseUNBQWhCOztBQUVBLFNBQU8sVUFBQ0MsTUFBRCxFQUFZOztBQUVqQixRQUFNQyxhQUFhLE9BQU9ELE1BQVAsSUFBaUIsUUFBakIsR0FBNEJFLFNBQVNDLGFBQVQsQ0FBdUJILE1BQXZCLENBQTVCLEdBQTZEQSxNQUFoRjtBQUNBLFFBQU1JLFdBQVdDLGNBQWpCO0FBQ0EsUUFBSUMsV0FBVyxJQUFJQyxPQUFPQyxJQUFQLENBQVlDLFFBQWhCLEVBQWY7O0FBRUFYLE1BQUVHLFVBQUYsRUFBY1MsU0FBZCxDQUF3QjtBQUNaQyxZQUFNLElBRE07QUFFWkMsaUJBQVcsSUFGQztBQUdaQyxpQkFBVyxDQUhDO0FBSVpDLGtCQUFZO0FBQ1ZDLGNBQU07QUFESTtBQUpBLEtBQXhCLEVBUVU7QUFDRUMsWUFBTSxnQkFEUjtBQUVFQyxlQUFTLGlCQUFDQyxJQUFEO0FBQUEsZUFBVUEsS0FBS0MsaUJBQWY7QUFBQSxPQUZYO0FBR0VDLGFBQU8sRUFIVDtBQUlFQyxjQUFRLGdCQUFVQyxDQUFWLEVBQWFDLElBQWIsRUFBbUJDLEtBQW5CLEVBQXlCO0FBQzdCbEIsaUJBQVNtQixPQUFULENBQWlCLEVBQUVDLFNBQVNKLENBQVgsRUFBakIsRUFBaUMsVUFBVUssT0FBVixFQUFtQkMsTUFBbkIsRUFBMkI7QUFDMURKLGdCQUFNRyxPQUFOO0FBQ0QsU0FGRDtBQUdIO0FBUkgsS0FSVixFQWtCVUUsRUFsQlYsQ0FrQmEsb0JBbEJiLEVBa0JtQyxVQUFVQyxHQUFWLEVBQWVDLEtBQWYsRUFBc0I7QUFDN0MsVUFBR0EsS0FBSCxFQUNBOztBQUVFLFlBQUlDLFdBQVdE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QSxhQUFLLFlBQUwsSUFBcUIsQ0FBQ0EsS0FBSzJCLFVBQU4sR0FBbUIsUUFBbkIsR0FBOEIzQixLQUFLMkIsVUFBeEQ7QUFDRCxPQUZEO0FBR0EvQyxRQUFFSSxRQUFGLEVBQVlrSSxPQUFaLENBQW9CLHFCQUFwQjtBQUNBO0FBQ0F0SSxRQUFFSSxRQUFGLEVBQVlrSSxPQUFaLENBQW9CLGtCQUFwQixFQUF3QyxFQUFFeUIsTUFBTS9GLE9BQU9DLFdBQWYsRUFBeEM7QUFDQTtBQUNEO0FBZEksR0FBUDs7QUFpQkF1RyxhQUFXLFlBQU07QUFDZnhLLE1BQUVJLFFBQUYsRUFBWWtJLE9BQVosQ0FBb0IsNEJBQXBCLEVBQWtEaUIsYUFBYVIsYUFBYixFQUFsRDtBQUNBL0ksTUFBRUksUUFBRixFQUFZa0ksT0FBWixDQUFvQixvQkFBcEIsRUFBMENpQixhQUFhUixhQUFiLEVBQTFDO0FBQ0EvQyxZQUFRQyxHQUFSLENBQVlzRCxhQUFhUixhQUFiLEVBQVo7QUFDRCxHQUpELEVBSUcsR0FKSDtBQU1ELENBM0dELEVBMkdHekcsTUEzR0giLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vL0FQSSA6QUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXG5jb25zdCBBdXRvY29tcGxldGVNYW5hZ2VyID0gKGZ1bmN0aW9uKCQpIHtcbiAgLy9Jbml0aWFsaXphdGlvbi4uLlxuXG4gIGNvbnN0IEFQSV9LRVkgPSBcIkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVwiO1xuXG4gIHJldHVybiAodGFyZ2V0KSA9PiB7XG5cbiAgICBjb25zdCB0YXJnZXRJdGVtID0gdHlwZW9mIHRhcmdldCA9PSBcInN0cmluZ1wiID8gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpIDogdGFyZ2V0O1xuICAgIGNvbnN0IHF1ZXJ5TWdyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgdmFyIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG5cbiAgICAkKHRhcmdldEl0ZW0pLnR5cGVhaGVhZCh7XG4gICAgICAgICAgICAgICAgaGludDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBoaWdobGlnaHQ6IHRydWUsXG4gICAgICAgICAgICAgICAgbWluTGVuZ3RoOiA0LFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgIG1lbnU6ICd0dC1kcm9wZG93bi1tZW51J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdzZWFyY2gtcmVzdWx0cycsXG4gICAgICAgICAgICAgICAgZGlzcGxheTogKGl0ZW0pID0+IGl0ZW0uZm9ybWF0dGVkX2FkZHJlc3MsXG4gICAgICAgICAgICAgICAgbGltaXQ6IDEwLFxuICAgICAgICAgICAgICAgIHNvdXJjZTogZnVuY3Rpb24gKHEsIHN5bmMsIGFzeW5jKXtcbiAgICAgICAgICAgICAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IHEgfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICAgIGFzeW5jKHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkub24oJ3R5cGVhaGVhZDpzZWxlY3RlZCcsIGZ1bmN0aW9uIChvYmosIGRhdHVtKSB7XG4gICAgICAgICAgICAgICAgaWYoZGF0dW0pXG4gICAgICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgICB2YXIgZ2VvbWV0cnkgPSBkYXR1bS5nZW9tZXRyeTtcbiAgICAgICAgICAgICAgICAgIHF1ZXJ5TWdyLnVwZGF0ZVZpZXdwb3J0KGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICAgICAgIC8vICBtYXAuZml0Qm91bmRzKGdlb21ldHJ5LmJvdW5kcz8gZ2VvbWV0cnkuYm91bmRzIDogZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG5cbiAgICByZXR1cm4ge1xuICAgICAgJHRhcmdldDogJCh0YXJnZXRJdGVtKSxcbiAgICAgIHRhcmdldDogdGFyZ2V0SXRlbVxuICAgIH1cbiAgfVxuXG59KGpRdWVyeSkpO1xuXG5jb25zdCBpbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2sgPSAoKSA9PiB7XG5cblxuICBBdXRvY29tcGxldGVNYW5hZ2VyKFwiaW5wdXRbbmFtZT0nc2VhcmNoLWxvY2F0aW9uJ11cIik7XG59O1xuIiwiLyogVGhpcyBsb2FkcyBhbmQgbWFuYWdlcyB0aGUgbGlzdCEgKi9cblxuY29uc3QgTGlzdE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRMaXN0ID0gXCIjZXZlbnRzLWxpc3RcIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0TGlzdCA9PT0gJ3N0cmluZycgPyAkKHRhcmdldExpc3QpIDogdGFyZ2V0TGlzdDtcblxuICAgIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0pID0+IHtcblxuICAgICAgdmFyIGRhdGUgPSBtb21lbnQoaXRlbS5zdGFydF9kYXRldGltZSkuZm9ybWF0KFwiZGRkZCDigKIgTU1NIEREIGg6bW1hXCIpO1xuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaSBjbGFzcz0nJHtpdGVtLmV2ZW50X3R5cGUgfHwgJyd9IEFjdGlvbicgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudCB0eXBlLWFjdGlvblwiPlxuICAgICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICAgIDxsaT4ke2l0ZW0uZXZlbnRfdHlwZX08L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPGgyPjxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZX08L2E+PC9oMj5cbiAgICAgICAgICA8aDQ+JHtkYXRlfTwvaDQ+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgICAgPHA+JHtpdGVtLnZlbnVlfTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCI+UlNWUDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICAgYFxuICAgIH07XG5cbiAgICBjb25zdCByZW5kZXJHcm91cCA9IChpdGVtKSA9PiB7XG5cbiAgICAgIHJldHVybiBgXG4gICAgICA8bGk+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwXCI+XG4gICAgICAgICAgPGgyPjxhIGhyZWY9XCIvXCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZSB8fCBgR3JvdXBgfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICAgIDxwPkNvbG9yYWRvLCBVU0E8L3A+XG4gICAgICAgICAgICA8cD4ke2l0ZW0uZGV0YWlscyB8fCBgMzUwIENvbG9yYWRvIGlzIHdvcmtpbmcgbG9jYWxseSB0byBoZWxwIGJ1aWxkIHRoZSBnbG9iYWxcbiAgICAgICAgICAgICAgIDM1MC5vcmcgbW92ZW1lbnQgdG8gc29sdmUgdGhlIGNsaW1hdGUgY3Jpc2lzIGFuZCB0cmFuc2l0aW9uXG4gICAgICAgICAgICAgICB0byBhIGNsZWFuLCByZW5ld2FibGUgZW5lcmd5IGZ1dHVyZS5gfVxuICAgICAgICAgICAgPC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICRsaXN0OiAkdGFyZ2V0LFxuICAgICAgdXBkYXRlRmlsdGVyOiAocCkgPT4ge1xuICAgICAgICBpZighcCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIFJlbW92ZSBGaWx0ZXJzXG5cbiAgICAgICAgJHRhcmdldC5yZW1vdmVQcm9wKFwiY2xhc3NcIik7XG4gICAgICAgICR0YXJnZXQuYWRkQ2xhc3MocC5maWx0ZXIgPyBwLmZpbHRlci5qb2luKFwiIFwiKSA6ICcnKVxuICAgICAgfSxcbiAgICAgIHBvcHVsYXRlTGlzdDogKCkgPT4ge1xuICAgICAgICAvL3VzaW5nIHdpbmRvdy5FVkVOVF9EQVRBXG5cbiAgICAgICAgdmFyICRldmVudExpc3QgPSB3aW5kb3cuRVZFTlRTX0RBVEEubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgIHJldHVybiBpdGVtLmV2ZW50X3R5cGUgIT09ICdHcm91cCcgPyByZW5kZXJFdmVudChpdGVtKSA6IHJlbmRlckdyb3VwKGl0ZW0pO1xuICAgICAgICB9KVxuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsIGxpJykucmVtb3ZlKCk7XG4gICAgICAgICR0YXJnZXQuZmluZCgndWwnKS5hcHBlbmQoJGV2ZW50TGlzdCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsIlxuY29uc3QgTWFwTWFuYWdlciA9ICgoJCkgPT4ge1xuXG4gIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0pID0+IHtcbiAgICB2YXIgZGF0ZSA9IG1vbWVudChpdGVtLnN0YXJ0X2RhdGV0aW1lKS5mb3JtYXQoXCJkZGRkIOKAoiBNTU0gREQgaDptbWFcIik7XG4gICAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPSdwb3B1cC1pdGVtICR7aXRlbS5ldmVudF90eXBlfScgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnRcIj5cbiAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgIDxsaT4ke2l0ZW0uZXZlbnRfdHlwZSB8fCAnQWN0aW9uJ308L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8aDI+PGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICA8aDQ+JHtkYXRlfTwvaDQ+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5SU1ZQPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICAgIGBcbiAgfTtcblxuICBjb25zdCByZW5kZXJHcm91cCA9IChpdGVtKSA9PiB7XG4gICAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPSdwb3B1cC1pdGVtICR7aXRlbS5ldmVudF90eXBlfScgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXBcIj5cbiAgICAgICAgPGgyPjxhIGhyZWY9XCIvXCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZSB8fCBgR3JvdXBgfTwvYT48L2gyPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgPHA+Q29sb3JhZG8sIFVTQTwvcD5cbiAgICAgICAgICA8cD4ke2l0ZW0uZGV0YWlscyB8fCBgMzUwIENvbG9yYWRvIGlzIHdvcmtpbmcgbG9jYWxseSB0byBoZWxwIGJ1aWxkIHRoZSBnbG9iYWxcbiAgICAgICAgICAgICAzNTAub3JnIG1vdmVtZW50IHRvIHNvbHZlIHRoZSBjbGltYXRlIGNyaXNpcyBhbmQgdHJhbnNpdGlvblxuICAgICAgICAgICAgIHRvIGEgY2xlYW4sIHJlbmV3YWJsZSBlbmVyZ3kgZnV0dXJlLmB9XG4gICAgICAgICAgPC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgYFxuICB9O1xuXG4gIGNvbnN0IHJlbmRlckdlb2pzb24gPSAobGlzdCkgPT4ge1xuICAgIHJldHVybiBsaXN0Lm1hcCgoaXRlbSkgPT4ge1xuICAgICAgLy8gcmVuZGVyZWQgZXZlbnRUeXBlXG4gICAgICBsZXQgcmVuZGVyZWQ7XG4gICAgICBpZiAoIWl0ZW0uZXZlbnRfdHlwZSB8fCAhaXRlbS5ldmVudF90eXBlLnRvTG93ZXJDYXNlKCkgIT09ICdncm91cCcpIHtcbiAgICAgICAgcmVuZGVyZWQgPSByZW5kZXJFdmVudChpdGVtKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlbmRlcmVkID0gcmVuZGVyR3JvdXAoaXRlbSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICB0eXBlOiBcIlBvaW50XCIsXG4gICAgICAgICAgY29vcmRpbmF0ZXM6IFtpdGVtLmxuZywgaXRlbS5sYXRdXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBldmVudFByb3BlcnRpZXM6IGl0ZW0sXG4gICAgICAgICAgcG9wdXBDb250ZW50OiByZW5kZXJlZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAoKSA9PiB7XG4gICAgdmFyIG1hcCA9IEwubWFwKCdtYXAnKS5zZXRWaWV3KFszNC44ODU5MzA5NDA3NTMxNywgNS4wOTc2NTYyNTAwMDAwMDFdLCAyKTtcblxuICAgIEwudGlsZUxheWVyKCdodHRwOi8ve3N9LnRpbGUub3NtLm9yZy97en0ve3h9L3t5fS5wbmcnLCB7XG4gICAgICAgIGF0dHJpYnV0aW9uOiAnJmNvcHk7IDxhIGhyZWY9XCJodHRwOi8vb3NtLm9yZy9jb3B5cmlnaHRcIj5PcGVuU3RyZWV0TWFwPC9hPiBjb250cmlidXRvcnMg4oCiIDxhIGhyZWY9XCIvLzM1MC5vcmdcIj4zNTAub3JnPC9hPidcbiAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgLy8gbWFwLmZpdEJvdW5kcyhbIFtbNDAuNzIxNjAxNTE5NzA4NSwgLTczLjg1MTc0Njk4MDI5MTUyXSwgWzQwLjcyNDI5OTQ4MDI5MTUsIC03My44NDkwNDkwMTk3MDg1XV0gXSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICRtYXA6IG1hcCxcbiAgICAgIHNldEJvdW5kczogKGJvdW5kczEsIGJvdW5kczIpID0+IHtcbiAgICAgICAgY29uc3QgYm91bmRzID0gW2JvdW5kczEsIGJvdW5kczJdO1xuICAgICAgICBtYXAuZml0Qm91bmRzKGJvdW5kcyk7XG4gICAgICB9LFxuICAgICAgc2V0Q2VudGVyOiAoY2VudGVyLCB6b29tID0gMTApID0+IHtcbiAgICAgICAgaWYgKCFjZW50ZXIgfHwgIWNlbnRlclswXSB8fCBjZW50ZXJbMF0gPT0gXCJcIlxuICAgICAgICAgICAgICB8fCAhY2VudGVyWzFdIHx8IGNlbnRlclsxXSA9PSBcIlwiKSByZXR1cm47XG4gICAgICAgIG1hcC5zZXRWaWV3KGNlbnRlciwgem9vbSk7XG4gICAgICB9LFxuICAgICAgZmlsdGVyTWFwOiAoZmlsdGVycykgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcImZpbHRlcnMgPj4gXCIsIGZpbHRlcnMpO1xuICAgICAgICAkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXBcIikuaGlkZSgpO1xuICAgICAgICBjb25zb2xlLmxvZygkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXBcIikpO1xuXG4gICAgICAgIGlmICghZmlsdGVycykgcmV0dXJuO1xuXG4gICAgICAgIGZpbHRlcnMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiLmV2ZW50LWl0ZW0tcG9wdXAuXCIgKyBpdGVtLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICAgICQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cC5cIiArIGl0ZW0udG9Mb3dlckNhc2UoKSkuc2hvdygpO1xuICAgICAgICB9KVxuICAgICAgfSxcbiAgICAgIHBsb3RQb2ludHM6IChsaXN0KSA9PiB7XG5cbiAgICAgICAgY29uc3QgZ2VvanNvbiA9IHtcbiAgICAgICAgICB0eXBlOiBcIkZlYXR1cmVDb2xsZWN0aW9uXCIsXG4gICAgICAgICAgZmVhdHVyZXM6IHJlbmRlckdlb2pzb24obGlzdClcbiAgICAgICAgfTtcblxuXG5cbiAgICAgICAgTC5nZW9KU09OKGdlb2pzb24sIHtcbiAgICAgICAgICAgIHBvaW50VG9MYXllcjogKGZlYXR1cmUsIGxhdGxuZykgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBldmVudFR5cGUgPSBmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLmV2ZW50X3R5cGU7XG4gICAgICAgICAgICAgIHZhciBnZW9qc29uTWFya2VyT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICAgIHJhZGl1czogOCxcbiAgICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogIGV2ZW50VHlwZSA9PT0gJ0dyb3VwJyA/IFwiIzQwRDdENFwiIDogXCIjMEY4MUU4XCIsXG4gICAgICAgICAgICAgICAgICBjb2xvcjogXCJ3aGl0ZVwiLFxuICAgICAgICAgICAgICAgICAgd2VpZ2h0OiAyLFxuICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMC41LFxuICAgICAgICAgICAgICAgICAgZmlsbE9wYWNpdHk6IDAuOCxcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogKGV2ZW50VHlwZSA9PT0gJ0dyb3VwJyA/ICdncm91cHMnIDogJ2V2ZW50cycpICsgJyBldmVudC1pdGVtLXBvcHVwJ1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICByZXR1cm4gTC5jaXJjbGVNYXJrZXIobGF0bG5nLCBnZW9qc29uTWFya2VyT3B0aW9ucyk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgb25FYWNoRmVhdHVyZTogKGZlYXR1cmUsIGxheWVyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZmVhdHVyZS5wcm9wZXJ0aWVzICYmIGZlYXR1cmUucHJvcGVydGllcy5wb3B1cENvbnRlbnQpIHtcbiAgICAgICAgICAgICAgbGF5ZXIuYmluZFBvcHVwKGZlYXR1cmUucHJvcGVydGllcy5wb3B1cENvbnRlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSkuYWRkVG8obWFwKTtcblxuICAgICAgfSxcbiAgICAgIHVwZGF0ZTogKHApID0+IHtcbiAgICAgICAgaWYgKCFwIHx8ICFwLmxhdCB8fCAhcC5sbmcgKSByZXR1cm47XG5cbiAgICAgICAgbWFwLnNldFZpZXcoTC5sYXRMbmcocC5sYXQsIHAubG5nKSwgMTApO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJjb25zdCBRdWVyeU1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRGb3JtID0gXCJmb3JtI2ZpbHRlcnMtZm9ybVwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRGb3JtID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0Rm9ybSkgOiB0YXJnZXRGb3JtO1xuICAgIGxldCBsYXQgPSBudWxsO1xuICAgIGxldCBsbmcgPSBudWxsO1xuXG4gICAgbGV0IHByZXZpb3VzID0ge307XG5cbiAgICAkdGFyZ2V0Lm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgbGF0ID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbCgpO1xuICAgICAgbG5nID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbCgpO1xuXG4gICAgICB2YXIgZm9ybSA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcbiAgICAgIGRlbGV0ZSBmb3JtWydzZWFyY2gtbG9jYXRpb24nXTtcblxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAkLnBhcmFtKGZvcm0pO1xuICAgIH0pXG5cbiAgICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy5maWx0ZXItaXRlbSBpbnB1dFt0eXBlPWNoZWNrYm94XScsICgpID0+IHtcbiAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgfSlcblxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGluaXRpYWxpemU6IChjYWxsYmFjaykgPT4ge1xuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2gubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHZhciBwYXJhbXMgPSAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpKVxuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwocGFyYW1zLmxhdCk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChwYXJhbXMubG5nKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKHBhcmFtcy5ib3VuZDEpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwocGFyYW1zLmJvdW5kMik7XG5cbiAgICAgICAgICBpZiAocGFyYW1zLmZpbHRlcikge1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdXCIpLnJlbW92ZVByb3AoXCJjaGVja2VkXCIpO1xuICAgICAgICAgICAgcGFyYW1zLmZpbHRlci5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF1bdmFsdWU9J1wiICsgaXRlbSArIFwiJ11cIikucHJvcChcImNoZWNrZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGdldFBhcmFtZXRlcnM6ICgpID0+IHtcbiAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG4gICAgICAgIGRlbGV0ZSBwYXJhbWV0ZXJzWydzZWFyY2gtbG9jYXRpb24nXTtcblxuICAgICAgICByZXR1cm4gcGFyYW1ldGVycztcbiAgICAgIH0sXG4gICAgICB1cGRhdGVMb2NhdGlvbjogKGxhdCwgbG5nKSA9PiB7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwobGF0KTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChsbmcpO1xuICAgICAgICAvLyAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZVZpZXdwb3J0OiAodmlld3BvcnQpID0+IHtcblxuICAgICAgICBjb25zdCBib3VuZHMgPSBbW3ZpZXdwb3J0LmYuYiwgdmlld3BvcnQuYi5iXSwgW3ZpZXdwb3J0LmYuZiwgdmlld3BvcnQuYi5mXV07XG5cbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMF0pKTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMV0pKTtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyU3VibWl0OiAoKSA9PiB7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59KShqUXVlcnkpO1xuIiwiKGZ1bmN0aW9uKCQpIHtcblxuICAvLyAxLiBnb29nbGUgbWFwcyBnZW9jb2RlXG5cbiAgLy8gMi4gZm9jdXMgbWFwIG9uIGdlb2NvZGUgKHZpYSBsYXQvbG5nKVxuICBjb25zdCBxdWVyeU1hbmFnZXIgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICAgICAgcXVlcnlNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICBjb25zdCBpbml0UGFyYW1zID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcbiAgY29uc3QgbWFwTWFuYWdlciA9IE1hcE1hbmFnZXIoKTtcblxuICBjb25zdCBsaXN0TWFuYWdlciA9IExpc3RNYW5hZ2VyKCk7XG5cbiAgaWYoaW5pdFBhcmFtcy5sYXQgJiYgaW5pdFBhcmFtcy5sbmcpIHtcbiAgICBtYXBNYW5hZ2VyLnNldENlbnRlcihbaW5pdFBhcmFtcy5sYXQsIGluaXRQYXJhbXMubG5nXSk7XG4gIH1cblxuICAvKioqXG4gICogTGlzdCBFdmVudHNcbiAgKiBUaGlzIHdpbGwgdHJpZ2dlciB0aGUgbGlzdCB1cGRhdGUgbWV0aG9kXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgbGlzdE1hbmFnZXIucG9wdWxhdGVMaXN0KCk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuXG4gICAgbGlzdE1hbmFnZXIudXBkYXRlRmlsdGVyKG9wdGlvbnMpO1xuICB9KVxuXG4gIC8qKipcbiAgKiBNYXAgRXZlbnRzXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICAvLyBtYXBNYW5hZ2VyLnNldENlbnRlcihbb3B0aW9ucy5sYXQsIG9wdGlvbnMubG5nXSk7XG4gICAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLmJvdW5kMSB8fCAhb3B0aW9ucy5ib3VuZDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgdmFyIGJvdW5kMiA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDIpO1xuICAgIG1hcE1hbmFnZXIuc2V0Qm91bmRzKGJvdW5kMSwgYm91bmQyKTtcbiAgICAvLyBjb25zb2xlLmxvZyhvcHRpb25zKVxuICB9KTtcbiAgLy8gMy4gbWFya2VycyBvbiBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXBsb3QnLCAoZSwgb3B0KSA9PiB7XG4gICAgbWFwTWFuYWdlci5wbG90UG9pbnRzKG9wdC5kYXRhKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInKTtcbiAgfSlcblxuICAvLyBGaWx0ZXIgbWFwXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCAoZSwgb3B0KSA9PiB7XG4gICAgY29uc29sZS5sb2cob3B0KTtcbiAgICBpZiAob3B0KSB7XG4gICAgICBtYXBNYW5hZ2VyLmZpbHRlck1hcChvcHQuZmlsdGVyKTtcbiAgICB9XG4gIH0pXG5cbiAgJCh3aW5kb3cpLm9uKFwiaGFzaGNoYW5nZVwiLCAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgaWYgKGhhc2gubGVuZ3RoID09IDApIHJldHVybjtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKGhhc2guc3Vic3RyaW5nKDEpKTtcbiAgICBjb25zdCBvbGRVUkwgPSBldmVudC5vcmlnaW5hbEV2ZW50Lm9sZFVSTDtcblxuXG4gICAgY29uc3Qgb2xkSGFzaCA9ICQuZGVwYXJhbShvbGRVUkwuc3Vic3RyaW5nKG9sZFVSTC5zZWFyY2goXCIjXCIpKzEpKTtcblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJywgcGFyYW1ldGVycyk7XG5cbiAgICAvLyBTbyB0aGF0IGNoYW5nZSBpbiBmaWx0ZXJzIHdpbGwgbm90IHVwZGF0ZSB0aGlzXG4gICAgaWYgKG9sZEhhc2guYm91bmQxICE9PSBwYXJhbWV0ZXJzLmJvdW5kMSB8fCBvbGRIYXNoLmJvdW5kMiAhPT0gcGFyYW1ldGVycy5ib3VuZDIpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgIH1cbiAgfSlcblxuICAvLyA0LiBmaWx0ZXIgb3V0IGl0ZW1zIGluIGFjdGl2aXR5LWFyZWFcblxuICAvLyA1LiBnZXQgbWFwIGVsZW1lbnRzXG5cbiAgLy8gNi4gZ2V0IEdyb3VwIGRhdGFcblxuICAvLyA3LiBwcmVzZW50IGdyb3VwIGVsZW1lbnRzXG5cbiAgJC5hamF4KHtcbiAgICB1cmw6ICdodHRwczovL3MzLXVzLXdlc3QtMi5hbWF6b25hd3MuY29tL3BwbHNtYXAtZGF0YS9vdXRwdXQvMzUwb3JnLXRlc3QuanMuZ3onLCAvLyd8KipEQVRBX1NPVVJDRSoqfCcsXG4gICAgZGF0YVR5cGU6ICdzY3JpcHQnLFxuICAgIGNhY2hlOiB0cnVlLFxuICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICB2YXIgcGFyYW1ldGVycyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG5cbiAgICAgIHdpbmRvdy5FVkVOVFNfREFUQS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIGl0ZW1bJ2V2ZW50X3R5cGUnXSA9ICFpdGVtLmV2ZW50X3R5cGUgPyAnQWN0aW9uJyA6IGl0ZW0uZXZlbnRfdHlwZTtcbiAgICAgIH0pXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtdXBkYXRlJyk7XG4gICAgICAvLyAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtcGxvdCcsIHsgZGF0YTogd2luZG93LkVWRU5UU19EQVRBIH0pO1xuICAgICAgLy9UT0RPOiBNYWtlIHRoZSBnZW9qc29uIGNvbnZlcnNpb24gaGFwcGVuIG9uIHRoZSBiYWNrZW5kXG4gICAgfVxuICB9KTtcblxuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCkpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCkpO1xuICAgIGNvbnNvbGUubG9nKHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCkpXG4gIH0sIDEwMCk7XG5cbn0pKGpRdWVyeSk7XG4iXX0=
