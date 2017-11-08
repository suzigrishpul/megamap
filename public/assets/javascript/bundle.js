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
'use strict';

var MapManager = function ($) {
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

  // This will trigger the list update method
  $(document).on('trigger-list-update', function (event, options) {
    listManager.populateList();
  });

  $(document).on('trigger-list-filter-update', function (event, options) {

    listManager.updateFilter(options);
  });

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

  // 3. markers on map

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
      // $(document).trigger('trigger-map-update', parameters);
    }
  });

  setTimeout(function () {
    $(document).trigger('trigger-list-filter-update', queryManager.getParameters());
    $(document).trigger('trigger-map-update', queryManager.getParameters());
    console.log(queryManager.getParameters());
  }, 100);
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9saXN0LmpzIiwiY2xhc3Nlcy9tYXAuanMiLCJjbGFzc2VzL3F1ZXJ5LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIkF1dG9jb21wbGV0ZU1hbmFnZXIiLCIkIiwiQVBJX0tFWSIsInRhcmdldCIsInRhcmdldEl0ZW0iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJxdWVyeU1nciIsIlF1ZXJ5TWFuYWdlciIsImdlb2NvZGVyIiwiZ29vZ2xlIiwibWFwcyIsIkdlb2NvZGVyIiwidHlwZWFoZWFkIiwiaGludCIsImhpZ2hsaWdodCIsIm1pbkxlbmd0aCIsImNsYXNzTmFtZXMiLCJtZW51IiwibmFtZSIsImRpc3BsYXkiLCJpdGVtIiwiZm9ybWF0dGVkX2FkZHJlc3MiLCJsaW1pdCIsInNvdXJjZSIsInEiLCJzeW5jIiwiYXN5bmMiLCJnZW9jb2RlIiwiYWRkcmVzcyIsInJlc3VsdHMiLCJzdGF0dXMiLCJvbiIsIm9iaiIsImRhdHVtIiwiZ2VvbWV0cnkiLCJ1cGRhdGVWaWV3cG9ydCIsInZpZXdwb3J0IiwiJHRhcmdldCIsImpRdWVyeSIsImluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayIsIkxpc3RNYW5hZ2VyIiwidGFyZ2V0TGlzdCIsInJlbmRlckV2ZW50IiwiZGF0ZSIsIm1vbWVudCIsInN0YXJ0X2RhdGV0aW1lIiwiZm9ybWF0IiwiZXZlbnRfdHlwZSIsImxhdCIsImxuZyIsInVybCIsInRpdGxlIiwidmVudWUiLCJyZW5kZXJHcm91cCIsImRldGFpbHMiLCIkbGlzdCIsInVwZGF0ZUZpbHRlciIsInAiLCJyZW1vdmVQcm9wIiwiYWRkQ2xhc3MiLCJmaWx0ZXIiLCJqb2luIiwicG9wdWxhdGVMaXN0IiwiJGV2ZW50TGlzdCIsIndpbmRvdyIsIkVWRU5UU19EQVRBIiwibWFwIiwiZmluZCIsInJlbW92ZSIsImFwcGVuZCIsIk1hcE1hbmFnZXIiLCJMIiwic2V0VmlldyIsInRpbGVMYXllciIsImF0dHJpYnV0aW9uIiwiYWRkVG8iLCIkbWFwIiwic2V0Qm91bmRzIiwiYm91bmRzMSIsImJvdW5kczIiLCJib3VuZHMiLCJmaXRCb3VuZHMiLCJzZXRDZW50ZXIiLCJjZW50ZXIiLCJ6b29tIiwidXBkYXRlIiwibGF0TG5nIiwidGFyZ2V0Rm9ybSIsInByZXZpb3VzIiwiZSIsInByZXZlbnREZWZhdWx0IiwidmFsIiwiZm9ybSIsImRlcGFyYW0iLCJzZXJpYWxpemUiLCJsb2NhdGlvbiIsImhhc2giLCJwYXJhbSIsInRyaWdnZXIiLCJpbml0aWFsaXplIiwiY2FsbGJhY2siLCJsZW5ndGgiLCJwYXJhbXMiLCJzdWJzdHJpbmciLCJib3VuZDEiLCJib3VuZDIiLCJmb3JFYWNoIiwicHJvcCIsImdldFBhcmFtZXRlcnMiLCJwYXJhbWV0ZXJzIiwidXBkYXRlTG9jYXRpb24iLCJmIiwiYiIsIkpTT04iLCJzdHJpbmdpZnkiLCJ0cmlnZ2VyU3VibWl0IiwicXVlcnlNYW5hZ2VyIiwiaW5pdFBhcmFtcyIsIm1hcE1hbmFnZXIiLCJsaXN0TWFuYWdlciIsImV2ZW50Iiwib3B0aW9ucyIsInBhcnNlIiwib2xkVVJMIiwib3JpZ2luYWxFdmVudCIsIm9sZEhhc2giLCJzZWFyY2giLCJhamF4IiwiZGF0YVR5cGUiLCJjYWNoZSIsInN1Y2Nlc3MiLCJkYXRhIiwic2V0VGltZW91dCIsImNvbnNvbGUiLCJsb2ciXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7O0FBQ0EsSUFBTUEsc0JBQXVCLFVBQVNDLENBQVQsRUFBWTtBQUN2Qzs7QUFFQSxNQUFNQyxVQUFVLHlDQUFoQjs7QUFFQSxTQUFPLFVBQUNDLE1BQUQsRUFBWTs7QUFFakIsUUFBTUMsYUFBYSxPQUFPRCxNQUFQLElBQWlCLFFBQWpCLEdBQTRCRSxTQUFTQyxhQUFULENBQXVCSCxNQUF2QixDQUE1QixHQUE2REEsTUFBaEY7QUFDQSxRQUFNSSxXQUFXQyxjQUFqQjtBQUNBLFFBQUlDLFdBQVcsSUFBSUMsT0FBT0MsSUFBUCxDQUFZQyxRQUFoQixFQUFmOztBQUVBWCxNQUFFRyxVQUFGLEVBQWNTLFNBQWQsQ0FBd0I7QUFDWkMsWUFBTSxJQURNO0FBRVpDLGlCQUFXLElBRkM7QUFHWkMsaUJBQVcsQ0FIQztBQUlaQyxrQkFBWTtBQUNWQyxjQUFNO0FBREk7QUFKQSxLQUF4QixFQVFVO0FBQ0VDLFlBQU0sZ0JBRFI7QUFFRUMsZUFBUyxpQkFBQ0MsSUFBRDtBQUFBLGVBQVVBLEtBQUtDLGlCQUFmO0FBQUEsT0FGWDtBQUdFQyxhQUFPLEVBSFQ7QUFJRUMsY0FBUSxnQkFBVUMsQ0FBVixFQUFhQyxJQUFiLEVBQW1CQyxLQUFuQixFQUF5QjtBQUM3QmxCLGlCQUFTbUIsT0FBVCxDQUFpQixFQUFFQyxTQUFTSixDQUFYLEVBQWpCLEVBQWlDLFVBQVVLLE9BQVYsRUFBbUJDLE1BQW5CLEVBQTJCO0FBQzFESixnQkFBTUcsT0FBTjtBQUNELFNBRkQ7QUFHSDtBQVJILEtBUlYsRUFrQlVFLEVBbEJWLENBa0JhLG9CQWxCYixFQWtCbUMsVUFBVUMsR0FBVixFQUFlQyxLQUFmLEVBQXNCO0FBQzdDLFVBQUdBLEtBQUgsRUFDQTs7QUFFRSxZQUFJQyxXQUFXRCxNQUFNQyxRQUFyQjtBQUNBNUIsaUJBQVM2QixjQUFULENBQXdCRCxTQUFTRSxRQUFqQztBQUNBO0FBQ0Q7QUFDSixLQTFCVDs7QUE2QkEsV0FBTztBQUNMQyxlQUFTckMsRUFBRUcsVUFBRixDQURKO0FBRUxELGNBQVFDO0FBRkgsS0FBUDtBQUlELEdBdkNEO0FBeUNELENBOUM0QixDQThDM0JtQyxNQTlDMkIsQ0FBN0I7O0FBZ0RBLElBQU1DLGlDQUFpQyxTQUFqQ0EsOEJBQWlDLEdBQU07O0FBRzNDeEMsc0JBQW9CLCtCQUFwQjtBQUNELENBSkQ7OztBQ2xEQTs7QUFFQSxJQUFNeUMsY0FBZSxVQUFDeEMsQ0FBRCxFQUFPO0FBQzFCLFNBQU8sWUFBaUM7QUFBQSxRQUFoQ3lDLFVBQWdDLHVFQUFuQixjQUFtQjs7QUFDdEMsUUFBTUosVUFBVSxPQUFPSSxVQUFQLEtBQXNCLFFBQXRCLEdBQWlDekMsRUFBRXlDLFVBQUYsQ0FBakMsR0FBaURBLFVBQWpFOztBQUVBLFFBQU1DLGNBQWMsU0FBZEEsV0FBYyxDQUFDdEIsSUFBRCxFQUFVOztBQUU1QixVQUFJdUIsT0FBT0MsT0FBT3hCLEtBQUt5QixjQUFaLEVBQTRCQyxNQUE1QixDQUFtQyxxQkFBbkMsQ0FBWDtBQUNBLHFDQUNhMUIsS0FBSzJCLFVBRGxCLG9CQUMyQzNCLEtBQUs0QixHQURoRCxvQkFDa0U1QixLQUFLNkIsR0FEdkUsMkdBSVk3QixLQUFLMkIsVUFKakIsMERBTXFCM0IsS0FBSzhCLEdBTjFCLDJCQU1rRDlCLEtBQUsrQixLQU52RCxpQ0FPVVIsSUFQVixzRUFTV3ZCLEtBQUtnQyxLQVRoQixrR0FZbUJoQyxLQUFLOEIsR0FaeEI7QUFpQkQsS0FwQkQ7O0FBc0JBLFFBQU1HLGNBQWMsU0FBZEEsV0FBYyxDQUFDakMsSUFBRCxFQUFVOztBQUU1QixpSEFHc0NBLEtBQUsrQixLQUFMLFdBSHRDLG9IQU1XL0IsS0FBS2tDLE9BQUwsK0xBTlgsaUhBWW1CbEMsS0FBSzhCLEdBWnhCO0FBaUJELEtBbkJEOztBQXFCQSxXQUFPO0FBQ0xLLGFBQU9sQixPQURGO0FBRUxtQixvQkFBYyxzQkFBQ0MsQ0FBRCxFQUFPO0FBQ25CLFlBQUcsQ0FBQ0EsQ0FBSixFQUFPOztBQUVQOztBQUVBcEIsZ0JBQVFxQixVQUFSLENBQW1CLE9BQW5CO0FBQ0FyQixnQkFBUXNCLFFBQVIsQ0FBaUJGLEVBQUVHLE1BQUYsQ0FBU0MsSUFBVCxDQUFjLEdBQWQsQ0FBakI7QUFDRCxPQVRJO0FBVUxDLG9CQUFjLHdCQUFNO0FBQ2xCOztBQUVBLFlBQUlDLGFBQWFDLE9BQU9DLFdBQVAsQ0FBbUJDLEdBQW5CLENBQXVCLGdCQUFRO0FBQzlDLGlCQUFPOUMsS0FBSzJCLFVBQUwsS0FBb0IsT0FBcEIsR0FBOEJMLFlBQVl0QixJQUFaLENBQTlCLEdBQWtEaUMsWUFBWWpDLElBQVosQ0FBekQ7QUFDRCxTQUZnQixDQUFqQjtBQUdBaUIsZ0JBQVE4QixJQUFSLENBQWEsT0FBYixFQUFzQkMsTUFBdEI7QUFDQS9CLGdCQUFROEIsSUFBUixDQUFhLElBQWIsRUFBbUJFLE1BQW5CLENBQTBCTixVQUExQjtBQUNEO0FBbEJJLEtBQVA7QUFvQkQsR0FsRUQ7QUFtRUQsQ0FwRW1CLENBb0VqQnpCLE1BcEVpQixDQUFwQjs7O0FDREEsSUFBTWdDLGFBQWMsVUFBQ3RFLENBQUQsRUFBTztBQUN6QixTQUFPLFlBQU07QUFDWCxRQUFJa0UsTUFBTUssRUFBRUwsR0FBRixDQUFNLEtBQU4sRUFBYU0sT0FBYixDQUFxQixDQUFDLGlCQUFELEVBQW9CLGlCQUFwQixDQUFyQixFQUE2RCxDQUE3RCxDQUFWOztBQUVBRCxNQUFFRSxTQUFGLENBQVkseUNBQVosRUFBdUQ7QUFDbkRDLG1CQUFhO0FBRHNDLEtBQXZELEVBRUdDLEtBRkgsQ0FFU1QsR0FGVDs7QUFJQTtBQUNBLFdBQU87QUFDTFUsWUFBTVYsR0FERDtBQUVMVyxpQkFBVyxtQkFBQ0MsT0FBRCxFQUFVQyxPQUFWLEVBQXNCO0FBQy9CLFlBQU1DLFNBQVMsQ0FBQ0YsT0FBRCxFQUFVQyxPQUFWLENBQWY7QUFDQWIsWUFBSWUsU0FBSixDQUFjRCxNQUFkO0FBQ0QsT0FMSTtBQU1MRSxpQkFBVyxtQkFBQ0MsTUFBRCxFQUF1QjtBQUFBLFlBQWRDLElBQWMsdUVBQVAsRUFBTzs7QUFDaEMsWUFBSSxDQUFDRCxNQUFELElBQVcsQ0FBQ0EsT0FBTyxDQUFQLENBQVosSUFBeUJBLE9BQU8sQ0FBUCxLQUFhLEVBQXRDLElBQ0ssQ0FBQ0EsT0FBTyxDQUFQLENBRE4sSUFDbUJBLE9BQU8sQ0FBUCxLQUFhLEVBRHBDLEVBQ3dDO0FBQ3hDakIsWUFBSU0sT0FBSixDQUFZVyxNQUFaLEVBQW9CQyxJQUFwQjtBQUNELE9BVkk7QUFXTEMsY0FBUSxnQkFBQzVCLENBQUQsRUFBTztBQUNiLFlBQUksQ0FBQ0EsQ0FBRCxJQUFNLENBQUNBLEVBQUVULEdBQVQsSUFBZ0IsQ0FBQ1MsRUFBRVIsR0FBdkIsRUFBNkI7O0FBRTdCaUIsWUFBSU0sT0FBSixDQUFZRCxFQUFFZSxNQUFGLENBQVM3QixFQUFFVCxHQUFYLEVBQWdCUyxFQUFFUixHQUFsQixDQUFaLEVBQW9DLEVBQXBDO0FBQ0Q7QUFmSSxLQUFQO0FBaUJELEdBekJEO0FBMEJELENBM0JrQixDQTJCaEJYLE1BM0JnQixDQUFuQjs7O0FDREEsSUFBTS9CLGVBQWdCLFVBQUNQLENBQUQsRUFBTztBQUMzQixTQUFPLFlBQXNDO0FBQUEsUUFBckN1RixVQUFxQyx1RUFBeEIsbUJBQXdCOztBQUMzQyxRQUFNbEQsVUFBVSxPQUFPa0QsVUFBUCxLQUFzQixRQUF0QixHQUFpQ3ZGLEVBQUV1RixVQUFGLENBQWpDLEdBQWlEQSxVQUFqRTtBQUNBLFFBQUl2QyxNQUFNLElBQVY7QUFDQSxRQUFJQyxNQUFNLElBQVY7O0FBRUEsUUFBSXVDLFdBQVcsRUFBZjs7QUFFQW5ELFlBQVFOLEVBQVIsQ0FBVyxRQUFYLEVBQXFCLFVBQUMwRCxDQUFELEVBQU87QUFDMUJBLFFBQUVDLGNBQUY7QUFDQTFDLFlBQU1YLFFBQVE4QixJQUFSLENBQWEsaUJBQWIsRUFBZ0N3QixHQUFoQyxFQUFOO0FBQ0ExQyxZQUFNWixRQUFROEIsSUFBUixDQUFhLGlCQUFiLEVBQWdDd0IsR0FBaEMsRUFBTjs7QUFFQSxVQUFJQyxPQUFPNUYsRUFBRTZGLE9BQUYsQ0FBVXhELFFBQVF5RCxTQUFSLEVBQVYsQ0FBWDtBQUNBLGFBQU9GLEtBQUssaUJBQUwsQ0FBUDs7QUFFQTVCLGFBQU8rQixRQUFQLENBQWdCQyxJQUFoQixHQUF1QmhHLEVBQUVpRyxLQUFGLENBQVFMLElBQVIsQ0FBdkI7QUFDRCxLQVREOztBQVdBNUYsTUFBRUksUUFBRixFQUFZMkIsRUFBWixDQUFlLFFBQWYsRUFBeUIsbUNBQXpCLEVBQThELFlBQU07QUFDbEVNLGNBQVE2RCxPQUFSLENBQWdCLFFBQWhCO0FBQ0QsS0FGRDs7QUFLQSxXQUFPO0FBQ0xDLGtCQUFZLG9CQUFDQyxRQUFELEVBQWM7QUFDeEIsWUFBSXBDLE9BQU8rQixRQUFQLENBQWdCQyxJQUFoQixDQUFxQkssTUFBckIsR0FBOEIsQ0FBbEMsRUFBcUM7QUFDbkMsY0FBSUMsU0FBU3RHLEVBQUU2RixPQUFGLENBQVU3QixPQUFPK0IsUUFBUCxDQUFnQkMsSUFBaEIsQ0FBcUJPLFNBQXJCLENBQStCLENBQS9CLENBQVYsQ0FBYjtBQUNBbEUsa0JBQVE4QixJQUFSLENBQWEsaUJBQWIsRUFBZ0N3QixHQUFoQyxDQUFvQ1csT0FBT3RELEdBQTNDO0FBQ0FYLGtCQUFROEIsSUFBUixDQUFhLGlCQUFiLEVBQWdDd0IsR0FBaEMsQ0FBb0NXLE9BQU9yRCxHQUEzQztBQUNBWixrQkFBUThCLElBQVIsQ0FBYSxvQkFBYixFQUFtQ3dCLEdBQW5DLENBQXVDVyxPQUFPRSxNQUE5QztBQUNBbkUsa0JBQVE4QixJQUFSLENBQWEsb0JBQWIsRUFBbUN3QixHQUFuQyxDQUF1Q1csT0FBT0csTUFBOUM7O0FBRUEsY0FBSUgsT0FBTzFDLE1BQVgsRUFBbUI7QUFDakJ2QixvQkFBUThCLElBQVIsQ0FBYSxtQ0FBYixFQUFrRFQsVUFBbEQsQ0FBNkQsU0FBN0Q7QUFDQTRDLG1CQUFPMUMsTUFBUCxDQUFjOEMsT0FBZCxDQUFzQixnQkFBUTtBQUM1QnJFLHNCQUFROEIsSUFBUixDQUFhLDhDQUE4Qy9DLElBQTlDLEdBQXFELElBQWxFLEVBQXdFdUYsSUFBeEUsQ0FBNkUsU0FBN0UsRUFBd0YsSUFBeEY7QUFDRCxhQUZEO0FBR0Q7QUFDRjs7QUFFRCxZQUFJUCxZQUFZLE9BQU9BLFFBQVAsS0FBb0IsVUFBcEMsRUFBZ0Q7QUFDOUNBO0FBQ0Q7QUFDRixPQXBCSTtBQXFCTFEscUJBQWUseUJBQU07QUFDbkIsWUFBSUMsYUFBYTdHLEVBQUU2RixPQUFGLENBQVV4RCxRQUFReUQsU0FBUixFQUFWLENBQWpCO0FBQ0EsZUFBT2UsV0FBVyxpQkFBWCxDQUFQOztBQUVBLGVBQU9BLFVBQVA7QUFDRCxPQTFCSTtBQTJCTEMsc0JBQWdCLHdCQUFDOUQsR0FBRCxFQUFNQyxHQUFOLEVBQWM7QUFDNUJaLGdCQUFROEIsSUFBUixDQUFhLGlCQUFiLEVBQWdDd0IsR0FBaEMsQ0FBb0MzQyxHQUFwQztBQUNBWCxnQkFBUThCLElBQVIsQ0FBYSxpQkFBYixFQUFnQ3dCLEdBQWhDLENBQW9DMUMsR0FBcEM7QUFDQTtBQUNELE9BL0JJO0FBZ0NMZCxzQkFBZ0Isd0JBQUNDLFFBQUQsRUFBYzs7QUFFNUIsWUFBTTRDLFNBQVMsQ0FBQyxDQUFDNUMsU0FBUzJFLENBQVQsQ0FBV0MsQ0FBWixFQUFlNUUsU0FBUzRFLENBQVQsQ0FBV0EsQ0FBMUIsQ0FBRCxFQUErQixDQUFDNUUsU0FBUzJFLENBQVQsQ0FBV0EsQ0FBWixFQUFlM0UsU0FBUzRFLENBQVQsQ0FBV0QsQ0FBMUIsQ0FBL0IsQ0FBZjs7QUFFQTFFLGdCQUFROEIsSUFBUixDQUFhLG9CQUFiLEVBQW1Dd0IsR0FBbkMsQ0FBdUNzQixLQUFLQyxTQUFMLENBQWVsQyxPQUFPLENBQVAsQ0FBZixDQUF2QztBQUNBM0MsZ0JBQVE4QixJQUFSLENBQWEsb0JBQWIsRUFBbUN3QixHQUFuQyxDQUF1Q3NCLEtBQUtDLFNBQUwsQ0FBZWxDLE9BQU8sQ0FBUCxDQUFmLENBQXZDO0FBQ0EzQyxnQkFBUTZELE9BQVIsQ0FBZ0IsUUFBaEI7QUFDRCxPQXZDSTtBQXdDTGlCLHFCQUFlLHlCQUFNO0FBQ25COUUsZ0JBQVE2RCxPQUFSLENBQWdCLFFBQWhCO0FBQ0Q7QUExQ0ksS0FBUDtBQTRDRCxHQW5FRDtBQW9FRCxDQXJFb0IsQ0FxRWxCNUQsTUFyRWtCLENBQXJCOzs7QUNBQSxDQUFDLFVBQVN0QyxDQUFULEVBQVk7O0FBRVg7O0FBRUE7QUFDQSxNQUFNb0gsZUFBZTdHLGNBQXJCO0FBQ002RyxlQUFhakIsVUFBYjs7QUFFTixNQUFNa0IsYUFBYUQsYUFBYVIsYUFBYixFQUFuQjtBQUNBLE1BQU1VLGFBQWFoRCxZQUFuQjs7QUFFQSxNQUFNaUQsY0FBYy9FLGFBQXBCOztBQUVBLE1BQUc2RSxXQUFXckUsR0FBWCxJQUFrQnFFLFdBQVdwRSxHQUFoQyxFQUFxQztBQUNuQ3FFLGVBQVdwQyxTQUFYLENBQXFCLENBQUNtQyxXQUFXckUsR0FBWixFQUFpQnFFLFdBQVdwRSxHQUE1QixDQUFyQjtBQUNEOztBQUVEO0FBQ0FqRCxJQUFFSSxRQUFGLEVBQVkyQixFQUFaLENBQWUscUJBQWYsRUFBc0MsVUFBQ3lGLEtBQUQsRUFBUUMsT0FBUixFQUFvQjtBQUN4REYsZ0JBQVl6RCxZQUFaO0FBQ0QsR0FGRDs7QUFJQTlELElBQUVJLFFBQUYsRUFBWTJCLEVBQVosQ0FBZSw0QkFBZixFQUE2QyxVQUFDeUYsS0FBRCxFQUFRQyxPQUFSLEVBQW9COztBQUUvREYsZ0JBQVkvRCxZQUFaLENBQXlCaUUsT0FBekI7QUFDRCxHQUhEOztBQUtBekgsSUFBRUksUUFBRixFQUFZMkIsRUFBWixDQUFlLG9CQUFmLEVBQXFDLFVBQUN5RixLQUFELEVBQVFDLE9BQVIsRUFBb0I7QUFDdkQ7OztBQUdBLFFBQUksQ0FBQ0EsT0FBRCxJQUFZLENBQUNBLFFBQVFqQixNQUFyQixJQUErQixDQUFDaUIsUUFBUWhCLE1BQTVDLEVBQW9EO0FBQ2xEO0FBQ0Q7O0FBRUQsUUFBSUQsU0FBU1MsS0FBS1MsS0FBTCxDQUFXRCxRQUFRakIsTUFBbkIsQ0FBYjtBQUNBLFFBQUlDLFNBQVNRLEtBQUtTLEtBQUwsQ0FBV0QsUUFBUWhCLE1BQW5CLENBQWI7QUFDQWEsZUFBV3pDLFNBQVgsQ0FBcUIyQixNQUFyQixFQUE2QkMsTUFBN0I7QUFDQTtBQUNELEdBWkQ7O0FBY0F6RyxJQUFFZ0UsTUFBRixFQUFVakMsRUFBVixDQUFhLFlBQWIsRUFBMkIsVUFBQ3lGLEtBQUQsRUFBVzs7QUFFcEMsUUFBTXhCLE9BQU9oQyxPQUFPK0IsUUFBUCxDQUFnQkMsSUFBN0I7QUFDQSxRQUFJQSxLQUFLSyxNQUFMLElBQWUsQ0FBbkIsRUFBc0I7QUFDdEIsUUFBTVEsYUFBYTdHLEVBQUU2RixPQUFGLENBQVVHLEtBQUtPLFNBQUwsQ0FBZSxDQUFmLENBQVYsQ0FBbkI7QUFDQSxRQUFNb0IsU0FBU0gsTUFBTUksYUFBTixDQUFvQkQsTUFBbkM7O0FBR0EsUUFBTUUsVUFBVTdILEVBQUU2RixPQUFGLENBQVU4QixPQUFPcEIsU0FBUCxDQUFpQm9CLE9BQU9HLE1BQVAsQ0FBYyxHQUFkLElBQW1CLENBQXBDLENBQVYsQ0FBaEI7O0FBRUE5SCxNQUFFSSxRQUFGLEVBQVk4RixPQUFaLENBQW9CLDRCQUFwQixFQUFrRFcsVUFBbEQ7O0FBRUE7QUFDQSxRQUFJZ0IsUUFBUXJCLE1BQVIsS0FBbUJLLFdBQVdMLE1BQTlCLElBQXdDcUIsUUFBUXBCLE1BQVIsS0FBbUJJLFdBQVdKLE1BQTFFLEVBQWtGO0FBQ2hGekcsUUFBRUksUUFBRixFQUFZOEYsT0FBWixDQUFvQixvQkFBcEIsRUFBMENXLFVBQTFDO0FBQ0Q7QUFDRixHQWhCRDs7QUFrQkE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE3RyxJQUFFK0gsSUFBRixDQUFPO0FBQ0w3RSxTQUFLLDBEQURBLEVBQzREO0FBQ2pFOEUsY0FBVSxRQUZMO0FBR0xDLFdBQU8sSUFIRjtBQUlMQyxhQUFTLGlCQUFDQyxJQUFELEVBQVU7QUFDakIsVUFBSXRCLGFBQWFPLGFBQWFSLGFBQWIsRUFBakI7O0FBRUE1RyxRQUFFSSxRQUFGLEVBQVk4RixPQUFaLENBQW9CLHFCQUFwQjtBQUNBO0FBQ0E7QUFDRDtBQVZJLEdBQVA7O0FBYUFrQyxhQUFXLFlBQU07QUFDZnBJLE1BQUVJLFFBQUYsRUFBWThGLE9BQVosQ0FBb0IsNEJBQXBCLEVBQWtEa0IsYUFBYVIsYUFBYixFQUFsRDtBQUNBNUcsTUFBRUksUUFBRixFQUFZOEYsT0FBWixDQUFvQixvQkFBcEIsRUFBMENrQixhQUFhUixhQUFiLEVBQTFDO0FBQ0F5QixZQUFRQyxHQUFSLENBQVlsQixhQUFhUixhQUFiLEVBQVo7QUFDRCxHQUpELEVBSUcsR0FKSDtBQU1ELENBeEZELEVBd0ZHdEUsTUF4RkgiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vL0FQSSA6QUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXG5jb25zdCBBdXRvY29tcGxldGVNYW5hZ2VyID0gKGZ1bmN0aW9uKCQpIHtcbiAgLy9Jbml0aWFsaXphdGlvbi4uLlxuXG4gIGNvbnN0IEFQSV9LRVkgPSBcIkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVwiO1xuXG4gIHJldHVybiAodGFyZ2V0KSA9PiB7XG5cbiAgICBjb25zdCB0YXJnZXRJdGVtID0gdHlwZW9mIHRhcmdldCA9PSBcInN0cmluZ1wiID8gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpIDogdGFyZ2V0O1xuICAgIGNvbnN0IHF1ZXJ5TWdyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgdmFyIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG5cbiAgICAkKHRhcmdldEl0ZW0pLnR5cGVhaGVhZCh7XG4gICAgICAgICAgICAgICAgaGludDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBoaWdobGlnaHQ6IHRydWUsXG4gICAgICAgICAgICAgICAgbWluTGVuZ3RoOiA0LFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgIG1lbnU6ICd0dC1kcm9wZG93bi1tZW51J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdzZWFyY2gtcmVzdWx0cycsXG4gICAgICAgICAgICAgICAgZGlzcGxheTogKGl0ZW0pID0+IGl0ZW0uZm9ybWF0dGVkX2FkZHJlc3MsXG4gICAgICAgICAgICAgICAgbGltaXQ6IDEwLFxuICAgICAgICAgICAgICAgIHNvdXJjZTogZnVuY3Rpb24gKHEsIHN5bmMsIGFzeW5jKXtcbiAgICAgICAgICAgICAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IHEgfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICAgIGFzeW5jKHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkub24oJ3R5cGVhaGVhZDpzZWxlY3RlZCcsIGZ1bmN0aW9uIChvYmosIGRhdHVtKSB7XG4gICAgICAgICAgICAgICAgaWYoZGF0dW0pXG4gICAgICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgICB2YXIgZ2VvbWV0cnkgPSBkYXR1bS5nZW9tZXRyeTtcbiAgICAgICAgICAgICAgICAgIHF1ZXJ5TWdyLnVwZGF0ZVZpZXdwb3J0KGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICAgICAgIC8vICBtYXAuZml0Qm91bmRzKGdlb21ldHJ5LmJvdW5kcz8gZ2VvbWV0cnkuYm91bmRzIDogZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG5cbiAgICByZXR1cm4ge1xuICAgICAgJHRhcmdldDogJCh0YXJnZXRJdGVtKSxcbiAgICAgIHRhcmdldDogdGFyZ2V0SXRlbVxuICAgIH1cbiAgfVxuXG59KGpRdWVyeSkpO1xuXG5jb25zdCBpbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2sgPSAoKSA9PiB7XG5cblxuICBBdXRvY29tcGxldGVNYW5hZ2VyKFwiaW5wdXRbbmFtZT0nc2VhcmNoLWxvY2F0aW9uJ11cIik7XG59O1xuIiwiLyogVGhpcyBsb2FkcyBhbmQgbWFuYWdlcyB0aGUgbGlzdCEgKi9cblxuY29uc3QgTGlzdE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRMaXN0ID0gXCIjZXZlbnRzLWxpc3RcIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0TGlzdCA9PT0gJ3N0cmluZycgPyAkKHRhcmdldExpc3QpIDogdGFyZ2V0TGlzdDtcblxuICAgIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0pID0+IHtcblxuICAgICAgdmFyIGRhdGUgPSBtb21lbnQoaXRlbS5zdGFydF9kYXRldGltZSkuZm9ybWF0KFwiZGRkZCDigKIgTU1NIEREIGg6bW1hXCIpO1xuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaSBjbGFzcz0nJHtpdGVtLmV2ZW50X3R5cGV9JyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50XCI+XG4gICAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgICAgPGxpPiR7aXRlbS5ldmVudF90eXBlfTwvbGk+XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICAgIDxoND4ke2RhdGV9PC9oND5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5SU1ZQPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIGNvbnN0IHJlbmRlckdyb3VwID0gKGl0ZW0pID0+IHtcblxuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaT5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXBcIj5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIi9cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlIHx8IGBHcm91cGB9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgICAgPHA+Q29sb3JhZG8sIFVTQTwvcD5cbiAgICAgICAgICAgIDxwPiR7aXRlbS5kZXRhaWxzIHx8IGAzNTAgQ29sb3JhZG8gaXMgd29ya2luZyBsb2NhbGx5IHRvIGhlbHAgYnVpbGQgdGhlIGdsb2JhbFxuICAgICAgICAgICAgICAgMzUwLm9yZyBtb3ZlbWVudCB0byBzb2x2ZSB0aGUgY2xpbWF0ZSBjcmlzaXMgYW5kIHRyYW5zaXRpb25cbiAgICAgICAgICAgICAgIHRvIGEgY2xlYW4sIHJlbmV3YWJsZSBlbmVyZ3kgZnV0dXJlLmB9XG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiLy8ke2l0ZW0udXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPkdldCBJbnZvbHZlZDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICAgYFxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgJGxpc3Q6ICR0YXJnZXQsXG4gICAgICB1cGRhdGVGaWx0ZXI6IChwKSA9PiB7XG4gICAgICAgIGlmKCFwKSByZXR1cm47XG5cbiAgICAgICAgLy8gUmVtb3ZlIEZpbHRlcnNcblxuICAgICAgICAkdGFyZ2V0LnJlbW92ZVByb3AoXCJjbGFzc1wiKTtcbiAgICAgICAgJHRhcmdldC5hZGRDbGFzcyhwLmZpbHRlci5qb2luKFwiIFwiKSlcbiAgICAgIH0sXG4gICAgICBwb3B1bGF0ZUxpc3Q6ICgpID0+IHtcbiAgICAgICAgLy91c2luZyB3aW5kb3cuRVZFTlRfREFUQVxuXG4gICAgICAgIHZhciAkZXZlbnRMaXN0ID0gd2luZG93LkVWRU5UU19EQVRBLm1hcChpdGVtID0+IHtcbiAgICAgICAgICByZXR1cm4gaXRlbS5ldmVudF90eXBlICE9PSAnR3JvdXAnID8gcmVuZGVyRXZlbnQoaXRlbSkgOiByZW5kZXJHcm91cChpdGVtKTtcbiAgICAgICAgfSlcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCBsaScpLnJlbW92ZSgpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsJykuYXBwZW5kKCRldmVudExpc3QpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJcbmNvbnN0IE1hcE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICgpID0+IHtcbiAgICB2YXIgbWFwID0gTC5tYXAoJ21hcCcpLnNldFZpZXcoWzM0Ljg4NTkzMDk0MDc1MzE3LCA1LjA5NzY1NjI1MDAwMDAwMV0sIDIpO1xuXG4gICAgTC50aWxlTGF5ZXIoJ2h0dHA6Ly97c30udGlsZS5vc20ub3JnL3t6fS97eH0ve3l9LnBuZycsIHtcbiAgICAgICAgYXR0cmlidXRpb246ICcmY29weTsgPGEgaHJlZj1cImh0dHA6Ly9vc20ub3JnL2NvcHlyaWdodFwiPk9wZW5TdHJlZXRNYXA8L2E+IGNvbnRyaWJ1dG9ycyDigKIgPGEgaHJlZj1cIi8vMzUwLm9yZ1wiPjM1MC5vcmc8L2E+J1xuICAgIH0pLmFkZFRvKG1hcCk7XG5cbiAgICAvLyBtYXAuZml0Qm91bmRzKFsgW1s0MC43MjE2MDE1MTk3MDg1LCAtNzMuODUxNzQ2OTgwMjkxNTJdLCBbNDAuNzI0Mjk5NDgwMjkxNSwgLTczLjg0OTA0OTAxOTcwODVdXSBdKTtcbiAgICByZXR1cm4ge1xuICAgICAgJG1hcDogbWFwLFxuICAgICAgc2V0Qm91bmRzOiAoYm91bmRzMSwgYm91bmRzMikgPT4ge1xuICAgICAgICBjb25zdCBib3VuZHMgPSBbYm91bmRzMSwgYm91bmRzMl07XG4gICAgICAgIG1hcC5maXRCb3VuZHMoYm91bmRzKTtcbiAgICAgIH0sXG4gICAgICBzZXRDZW50ZXI6IChjZW50ZXIsIHpvb20gPSAxMCkgPT4ge1xuICAgICAgICBpZiAoIWNlbnRlciB8fCAhY2VudGVyWzBdIHx8IGNlbnRlclswXSA9PSBcIlwiXG4gICAgICAgICAgICAgIHx8ICFjZW50ZXJbMV0gfHwgY2VudGVyWzFdID09IFwiXCIpIHJldHVybjtcbiAgICAgICAgbWFwLnNldFZpZXcoY2VudGVyLCB6b29tKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGU6IChwKSA9PiB7XG4gICAgICAgIGlmICghcCB8fCAhcC5sYXQgfHwgIXAubG5nICkgcmV0dXJuO1xuXG4gICAgICAgIG1hcC5zZXRWaWV3KEwubGF0TG5nKHAubGF0LCBwLmxuZyksIDEwKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiY29uc3QgUXVlcnlNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIHJldHVybiAodGFyZ2V0Rm9ybSA9IFwiZm9ybSNmaWx0ZXJzLWZvcm1cIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0Rm9ybSA9PT0gJ3N0cmluZycgPyAkKHRhcmdldEZvcm0pIDogdGFyZ2V0Rm9ybTtcbiAgICBsZXQgbGF0ID0gbnVsbDtcbiAgICBsZXQgbG5nID0gbnVsbDtcblxuICAgIGxldCBwcmV2aW91cyA9IHt9O1xuXG4gICAgJHRhcmdldC5vbignc3VibWl0JywgKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGxhdCA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwoKTtcbiAgICAgIGxuZyA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwoKTtcblxuICAgICAgdmFyIGZvcm0gPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG4gICAgICBkZWxldGUgZm9ybVsnc2VhcmNoLWxvY2F0aW9uJ107XG5cbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJC5wYXJhbShmb3JtKTtcbiAgICB9KVxuXG4gICAgJChkb2N1bWVudCkub24oJ2NoYW5nZScsICcuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF0nLCAoKSA9PiB7XG4gICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgIH0pXG5cblxuICAgIHJldHVybiB7XG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgcGFyYW1zID0gJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSlcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKHBhcmFtcy5sYXQpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwocGFyYW1zLmxuZyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChwYXJhbXMuYm91bmQxKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKHBhcmFtcy5ib3VuZDIpO1xuXG4gICAgICAgICAgaWYgKHBhcmFtcy5maWx0ZXIpIHtcbiAgICAgICAgICAgICR0YXJnZXQuZmluZChcIi5maWx0ZXItaXRlbSBpbnB1dFt0eXBlPWNoZWNrYm94XVwiKS5yZW1vdmVQcm9wKFwiY2hlY2tlZFwiKTtcbiAgICAgICAgICAgIHBhcmFtcy5maWx0ZXIuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdW3ZhbHVlPSdcIiArIGl0ZW0gKyBcIiddXCIpLnByb3AoXCJjaGVja2VkXCIsIHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBnZXRQYXJhbWV0ZXJzOiAoKSA9PiB7XG4gICAgICAgIHZhciBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuICAgICAgICBkZWxldGUgcGFyYW1ldGVyc1snc2VhcmNoLWxvY2F0aW9uJ107XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtZXRlcnM7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTG9jYXRpb246IChsYXQsIGxuZykgPT4ge1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKGxhdCk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwobG5nKTtcbiAgICAgICAgLy8gJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVWaWV3cG9ydDogKHZpZXdwb3J0KSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW1t2aWV3cG9ydC5mLmIsIHZpZXdwb3J0LmIuYl0sIFt2aWV3cG9ydC5mLmYsIHZpZXdwb3J0LmIuZl1dO1xuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdHJpZ2dlclN1Ym1pdDogKCkgPT4ge1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSkoalF1ZXJ5KTtcbiIsIihmdW5jdGlvbigkKSB7XG5cbiAgLy8gMS4gZ29vZ2xlIG1hcHMgZ2VvY29kZVxuXG4gIC8vIDIuIGZvY3VzIG1hcCBvbiBnZW9jb2RlICh2aWEgbGF0L2xuZylcbiAgY29uc3QgcXVlcnlNYW5hZ2VyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgICAgIHF1ZXJ5TWFuYWdlci5pbml0aWFsaXplKCk7XG5cbiAgY29uc3QgaW5pdFBhcmFtcyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gIGNvbnN0IG1hcE1hbmFnZXIgPSBNYXBNYW5hZ2VyKCk7XG5cbiAgY29uc3QgbGlzdE1hbmFnZXIgPSBMaXN0TWFuYWdlcigpO1xuXG4gIGlmKGluaXRQYXJhbXMubGF0ICYmIGluaXRQYXJhbXMubG5nKSB7XG4gICAgbWFwTWFuYWdlci5zZXRDZW50ZXIoW2luaXRQYXJhbXMubGF0LCBpbml0UGFyYW1zLmxuZ10pO1xuICB9XG5cbiAgLy8gVGhpcyB3aWxsIHRyaWdnZXIgdGhlIGxpc3QgdXBkYXRlIG1ldGhvZFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnBvcHVsYXRlTGlzdCgpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcblxuICAgIGxpc3RNYW5hZ2VyLnVwZGF0ZUZpbHRlcihvcHRpb25zKTtcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgLy8gbWFwTWFuYWdlci5zZXRDZW50ZXIoW29wdGlvbnMubGF0LCBvcHRpb25zLmxuZ10pO1xuXG5cbiAgICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMuYm91bmQxIHx8ICFvcHRpb25zLmJvdW5kMikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBib3VuZDEgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQxKTtcbiAgICB2YXIgYm91bmQyID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMik7XG4gICAgbWFwTWFuYWdlci5zZXRCb3VuZHMoYm91bmQxLCBib3VuZDIpO1xuICAgIC8vIGNvbnNvbGUubG9nKG9wdGlvbnMpXG4gIH0pO1xuXG4gICQod2luZG93KS5vbihcImhhc2hjaGFuZ2VcIiwgKGV2ZW50KSA9PiB7XG5cbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgaWYgKGhhc2gubGVuZ3RoID09IDApIHJldHVybjtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKGhhc2guc3Vic3RyaW5nKDEpKTtcbiAgICBjb25zdCBvbGRVUkwgPSBldmVudC5vcmlnaW5hbEV2ZW50Lm9sZFVSTDtcblxuXG4gICAgY29uc3Qgb2xkSGFzaCA9ICQuZGVwYXJhbShvbGRVUkwuc3Vic3RyaW5nKG9sZFVSTC5zZWFyY2goXCIjXCIpKzEpKTtcblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG5cbiAgICAvLyBTbyB0aGF0IGNoYW5nZSBpbiBmaWx0ZXJzIHdpbGwgbm90IHVwZGF0ZSB0aGlzXG4gICAgaWYgKG9sZEhhc2guYm91bmQxICE9PSBwYXJhbWV0ZXJzLmJvdW5kMSB8fCBvbGRIYXNoLmJvdW5kMiAhPT0gcGFyYW1ldGVycy5ib3VuZDIpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgIH1cbiAgfSlcblxuICAvLyAzLiBtYXJrZXJzIG9uIG1hcFxuXG4gIC8vIDQuIGZpbHRlciBvdXQgaXRlbXMgaW4gYWN0aXZpdHktYXJlYVxuXG4gIC8vIDUuIGdldCBtYXAgZWxlbWVudHNcblxuICAvLyA2LiBnZXQgR3JvdXAgZGF0YVxuXG4gIC8vIDcuIHByZXNlbnQgZ3JvdXAgZWxlbWVudHNcblxuICAkLmFqYXgoe1xuICAgIHVybDogJ2h0dHBzOi8vZG5iNmxlYW5neDZkYy5jbG91ZGZyb250Lm5ldC9vdXRwdXQvMzUwb3JnLmpzLmd6JywgLy8nfCoqREFUQV9TT1VSQ0UqKnwnLFxuICAgIGRhdGFUeXBlOiAnc2NyaXB0JyxcbiAgICBjYWNoZTogdHJ1ZSxcbiAgICBzdWNjZXNzOiAoZGF0YSkgPT4ge1xuICAgICAgdmFyIHBhcmFtZXRlcnMgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtdXBkYXRlJyk7XG4gICAgICAvLyAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgICAgLy8gJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgfVxuICB9KTtcblxuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCkpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCkpO1xuICAgIGNvbnNvbGUubG9nKHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCkpXG4gIH0sIDEwMCk7XG5cbn0pKGpRdWVyeSk7XG4iXX0=
