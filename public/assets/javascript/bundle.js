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
        $target.trigger('submit');
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

  $(window).on("hashchange", function () {
    var hash = window.location.hash;
    if (hash.length == 0) return;
    var parameters = $.deparam(hash.substring(1));

    $(document).trigger('trigger-list-filter-update', parameters);
    $(document).trigger('trigger-map-update', parameters);
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

      $(document).trigger('trigger-list-update');
      $(document).trigger('trigger-list-filter-update', queryManager.getParameters());
      // $(document).trigger('trigger-map-update');
    }
  });

  setTimeout(function () {
    $(document).trigger('trigger-list-filter-update', queryManager.getParameters());
  }, 1000);
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9saXN0LmpzIiwiY2xhc3Nlcy9tYXAuanMiLCJjbGFzc2VzL3F1ZXJ5LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIkF1dG9jb21wbGV0ZU1hbmFnZXIiLCIkIiwiQVBJX0tFWSIsInRhcmdldCIsInRhcmdldEl0ZW0iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJxdWVyeU1nciIsIlF1ZXJ5TWFuYWdlciIsImdlb2NvZGVyIiwiZ29vZ2xlIiwibWFwcyIsIkdlb2NvZGVyIiwidHlwZWFoZWFkIiwiaGludCIsImhpZ2hsaWdodCIsIm1pbkxlbmd0aCIsImNsYXNzTmFtZXMiLCJtZW51IiwibmFtZSIsImRpc3BsYXkiLCJpdGVtIiwiZm9ybWF0dGVkX2FkZHJlc3MiLCJsaW1pdCIsInNvdXJjZSIsInEiLCJzeW5jIiwiYXN5bmMiLCJnZW9jb2RlIiwiYWRkcmVzcyIsInJlc3VsdHMiLCJzdGF0dXMiLCJvbiIsIm9iaiIsImRhdHVtIiwiZ2VvbWV0cnkiLCJ1cGRhdGVWaWV3cG9ydCIsInZpZXdwb3J0IiwiJHRhcmdldCIsImpRdWVyeSIsImluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayIsIkxpc3RNYW5hZ2VyIiwidGFyZ2V0TGlzdCIsInJlbmRlckV2ZW50IiwiZGF0ZSIsIm1vbWVudCIsInN0YXJ0X2RhdGV0aW1lIiwiZm9ybWF0IiwiZXZlbnRfdHlwZSIsImxhdCIsImxuZyIsInVybCIsInRpdGxlIiwidmVudWUiLCJyZW5kZXJHcm91cCIsImRldGFpbHMiLCIkbGlzdCIsInVwZGF0ZUZpbHRlciIsInAiLCJyZW1vdmVQcm9wIiwiYWRkQ2xhc3MiLCJmaWx0ZXIiLCJqb2luIiwicG9wdWxhdGVMaXN0IiwiJGV2ZW50TGlzdCIsIndpbmRvdyIsIkVWRU5UU19EQVRBIiwibWFwIiwiZmluZCIsInJlbW92ZSIsImFwcGVuZCIsIk1hcE1hbmFnZXIiLCJMIiwic2V0VmlldyIsInRpbGVMYXllciIsImF0dHJpYnV0aW9uIiwiYWRkVG8iLCIkbWFwIiwic2V0Qm91bmRzIiwiYm91bmRzMSIsImJvdW5kczIiLCJib3VuZHMiLCJmaXRCb3VuZHMiLCJzZXRDZW50ZXIiLCJjZW50ZXIiLCJ6b29tIiwidXBkYXRlIiwibGF0TG5nIiwidGFyZ2V0Rm9ybSIsImUiLCJwcmV2ZW50RGVmYXVsdCIsInZhbCIsImZvcm0iLCJkZXBhcmFtIiwic2VyaWFsaXplIiwibG9jYXRpb24iLCJoYXNoIiwicGFyYW0iLCJ0cmlnZ2VyIiwiaW5pdGlhbGl6ZSIsImNhbGxiYWNrIiwibGVuZ3RoIiwicGFyYW1zIiwic3Vic3RyaW5nIiwiZm9yRWFjaCIsInByb3AiLCJnZXRQYXJhbWV0ZXJzIiwicGFyYW1ldGVycyIsInVwZGF0ZUxvY2F0aW9uIiwiZiIsImIiLCJKU09OIiwic3RyaW5naWZ5IiwidHJpZ2dlclN1Ym1pdCIsInF1ZXJ5TWFuYWdlciIsImluaXRQYXJhbXMiLCJtYXBNYW5hZ2VyIiwibGlzdE1hbmFnZXIiLCJldmVudCIsIm9wdGlvbnMiLCJib3VuZDEiLCJib3VuZDIiLCJwYXJzZSIsImFqYXgiLCJkYXRhVHlwZSIsImNhY2hlIiwic3VjY2VzcyIsImRhdGEiLCJzZXRUaW1lb3V0Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOztBQUNBLElBQU1BLHNCQUF1QixVQUFTQyxDQUFULEVBQVk7QUFDdkM7O0FBRUEsTUFBTUMsVUFBVSx5Q0FBaEI7O0FBRUEsU0FBTyxVQUFDQyxNQUFELEVBQVk7O0FBRWpCLFFBQU1DLGFBQWEsT0FBT0QsTUFBUCxJQUFpQixRQUFqQixHQUE0QkUsU0FBU0MsYUFBVCxDQUF1QkgsTUFBdkIsQ0FBNUIsR0FBNkRBLE1BQWhGO0FBQ0EsUUFBTUksV0FBV0MsY0FBakI7QUFDQSxRQUFJQyxXQUFXLElBQUlDLE9BQU9DLElBQVAsQ0FBWUMsUUFBaEIsRUFBZjs7QUFFQVgsTUFBRUcsVUFBRixFQUFjUyxTQUFkLENBQXdCO0FBQ1pDLFlBQU0sSUFETTtBQUVaQyxpQkFBVyxJQUZD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QUFGLEVBQVk2RixPQUFaLENBQW9CLHFCQUFwQjtBQUNBakcsUUFBRUksUUFBRixFQUFZNkYsT0FBWixDQUFvQiw0QkFBcEIsRUFBa0RnQixhQUFhUixhQUFiLEVBQWxEO0FBQ0E7QUFDRDtBQVRJLEdBQVA7O0FBWUFzQixhQUFXLFlBQU07QUFDZi9ILE1BQUVJLFFBQUYsRUFBWTZGLE9BQVosQ0FBb0IsNEJBQXBCLEVBQWtEZ0IsYUFBYVIsYUFBYixFQUFsRDtBQUNELEdBRkQsRUFFRyxJQUZIO0FBSUQsQ0EzRUQsRUEyRUduRSxNQTNFSCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbi8vQVBJIDpBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cbmNvbnN0IEF1dG9jb21wbGV0ZU1hbmFnZXIgPSAoZnVuY3Rpb24oJCkge1xuICAvL0luaXRpYWxpemF0aW9uLi4uXG5cbiAgY29uc3QgQVBJX0tFWSA9IFwiQUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXCI7XG5cbiAgcmV0dXJuICh0YXJnZXQpID0+IHtcblxuICAgIGNvbnN0IHRhcmdldEl0ZW0gPSB0eXBlb2YgdGFyZ2V0ID09IFwic3RyaW5nXCIgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCkgOiB0YXJnZXQ7XG4gICAgY29uc3QgcXVlcnlNZ3IgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICB2YXIgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcblxuICAgICQodGFyZ2V0SXRlbSkudHlwZWFoZWFkKHtcbiAgICAgICAgICAgICAgICBoaW50OiB0cnVlLFxuICAgICAgICAgICAgICAgIGhpZ2hsaWdodDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBtaW5MZW5ndGg6IDQsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lczoge1xuICAgICAgICAgICAgICAgICAgbWVudTogJ3R0LWRyb3Bkb3duLW1lbnUnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ3NlYXJjaC1yZXN1bHRzJyxcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAoaXRlbSkgPT4gaXRlbS5mb3JtYXR0ZWRfYWRkcmVzcyxcbiAgICAgICAgICAgICAgICBsaW1pdDogMTAsXG4gICAgICAgICAgICAgICAgc291cmNlOiBmdW5jdGlvbiAocSwgc3luYywgYXN5bmMpe1xuICAgICAgICAgICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogcSB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgYXN5bmMocmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKS5vbigndHlwZWFoZWFkOnNlbGVjdGVkJywgZnVuY3Rpb24gKG9iaiwgZGF0dW0pIHtcbiAgICAgICAgICAgICAgICBpZihkYXR1bSlcbiAgICAgICAgICAgICAgICB7XG5cbiAgICAgICAgICAgICAgICAgIHZhciBnZW9tZXRyeSA9IGRhdHVtLmdlb21ldHJ5O1xuICAgICAgICAgICAgICAgICAgcXVlcnlNZ3IudXBkYXRlVmlld3BvcnQoZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgLy8gIG1hcC5maXRCb3VuZHMoZ2VvbWV0cnkuYm91bmRzPyBnZW9tZXRyeS5ib3VuZHMgOiBnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cblxuICAgIHJldHVybiB7XG4gICAgICAkdGFyZ2V0OiAkKHRhcmdldEl0ZW0pLFxuICAgICAgdGFyZ2V0OiB0YXJnZXRJdGVtXG4gICAgfVxuICB9XG5cbn0oalF1ZXJ5KSk7XG5cbmNvbnN0IGluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayA9ICgpID0+IHtcblxuXG4gIEF1dG9jb21wbGV0ZU1hbmFnZXIoXCJpbnB1dFtuYW1lPSdzZWFyY2gtbG9jYXRpb24nXVwiKTtcbn07XG4iLCIvKiBUaGlzIGxvYWRzIGFuZCBtYW5hZ2VzIHRoZSBsaXN0ISAqL1xuXG5jb25zdCBMaXN0TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldExpc3QgPSBcIiNldmVudHMtbGlzdFwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRMaXN0ID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0TGlzdCkgOiB0YXJnZXRMaXN0O1xuXG4gICAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSkgPT4ge1xuXG4gICAgICB2YXIgZGF0ZSA9IG1vbWVudChpdGVtLnN0YXJ0X2RhdGV0aW1lKS5mb3JtYXQoXCJkZGRkIOKAoiBNTU0gREQgaDptbWFcIik7XG4gICAgICByZXR1cm4gYFxuICAgICAgPGxpIGNsYXNzPScke2l0ZW0uZXZlbnRfdHlwZX0nIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnRcIj5cbiAgICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgICA8bGk+JHtpdGVtLmV2ZW50X3R5cGV9PC9saT5cbiAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDxoMj48YSBocmVmPVwiLy8ke2l0ZW0udXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgICAgPGg0PiR7ZGF0ZX08L2g0PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICAgIDxwPiR7aXRlbS52ZW51ZX08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiLy8ke2l0ZW0udXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPlJTVlA8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSkgPT4ge1xuXG4gICAgICByZXR1cm4gYFxuICAgICAgPGxpPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ncm91cFwiPlxuICAgICAgICAgIDxoMj48YSBocmVmPVwiL1wiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGUgfHwgYEdyb3VwYH08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgICA8cD5Db2xvcmFkbywgVVNBPC9wPlxuICAgICAgICAgICAgPHA+JHtpdGVtLmRldGFpbHMgfHwgYDM1MCBDb2xvcmFkbyBpcyB3b3JraW5nIGxvY2FsbHkgdG8gaGVscCBidWlsZCB0aGUgZ2xvYmFsXG4gICAgICAgICAgICAgICAzNTAub3JnIG1vdmVtZW50IHRvIHNvbHZlIHRoZSBjbGltYXRlIGNyaXNpcyBhbmQgdHJhbnNpdGlvblxuICAgICAgICAgICAgICAgdG8gYSBjbGVhbiwgcmVuZXdhYmxlIGVuZXJneSBmdXR1cmUuYH1cbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCI+R2V0IEludm9sdmVkPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAkbGlzdDogJHRhcmdldCxcbiAgICAgIHVwZGF0ZUZpbHRlcjogKHApID0+IHtcbiAgICAgICAgaWYoIXApIHJldHVybjtcblxuICAgICAgICAvLyBSZW1vdmUgRmlsdGVyc1xuXG4gICAgICAgICR0YXJnZXQucmVtb3ZlUHJvcChcImNsYXNzXCIpO1xuICAgICAgICAkdGFyZ2V0LmFkZENsYXNzKHAuZmlsdGVyLmpvaW4oXCIgXCIpKVxuICAgICAgfSxcbiAgICAgIHBvcHVsYXRlTGlzdDogKCkgPT4ge1xuICAgICAgICAvL3VzaW5nIHdpbmRvdy5FVkVOVF9EQVRBXG5cbiAgICAgICAgdmFyICRldmVudExpc3QgPSB3aW5kb3cuRVZFTlRTX0RBVEEubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgIHJldHVybiBpdGVtLmV2ZW50X3R5cGUgIT09ICdHcm91cCcgPyByZW5kZXJFdmVudChpdGVtKSA6IHJlbmRlckdyb3VwKGl0ZW0pO1xuICAgICAgICB9KVxuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsIGxpJykucmVtb3ZlKCk7XG4gICAgICAgICR0YXJnZXQuZmluZCgndWwnKS5hcHBlbmQoJGV2ZW50TGlzdCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsIlxuY29uc3QgTWFwTWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKCkgPT4ge1xuICAgIHZhciBtYXAgPSBMLm1hcCgnbWFwJykuc2V0VmlldyhbMzQuODg1OTMwOTQwNzUzMTcsIDUuMDk3NjU2MjUwMDAwMDAxXSwgMik7XG5cbiAgICBMLnRpbGVMYXllcignaHR0cDovL3tzfS50aWxlLm9zbS5vcmcve3p9L3t4fS97eX0ucG5nJywge1xuICAgICAgICBhdHRyaWJ1dGlvbjogJyZjb3B5OyA8YSBocmVmPVwiaHR0cDovL29zbS5vcmcvY29weXJpZ2h0XCI+T3BlblN0cmVldE1hcDwvYT4gY29udHJpYnV0b3JzIOKAoiA8YSBocmVmPVwiLy8zNTAub3JnXCI+MzUwLm9yZzwvYT4nXG4gICAgfSkuYWRkVG8obWFwKTtcblxuICAgIC8vIG1hcC5maXRCb3VuZHMoWyBbWzQwLjcyMTYwMTUxOTcwODUsIC03My44NTE3NDY5ODAyOTE1Ml0sIFs0MC43MjQyOTk0ODAyOTE1LCAtNzMuODQ5MDQ5MDE5NzA4NV1dIF0pO1xuICAgIHJldHVybiB7XG4gICAgICAkbWFwOiBtYXAsXG4gICAgICBzZXRCb3VuZHM6IChib3VuZHMxLCBib3VuZHMyKSA9PiB7XG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtib3VuZHMxLCBib3VuZHMyXTtcbiAgICAgICAgbWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuICAgICAgfSxcbiAgICAgIHNldENlbnRlcjogKGNlbnRlciwgem9vbSA9IDEwKSA9PiB7XG4gICAgICAgIGlmICghY2VudGVyIHx8ICFjZW50ZXJbMF0gfHwgY2VudGVyWzBdID09IFwiXCJcbiAgICAgICAgICAgICAgfHwgIWNlbnRlclsxXSB8fCBjZW50ZXJbMV0gPT0gXCJcIikgcmV0dXJuO1xuICAgICAgICBtYXAuc2V0VmlldyhjZW50ZXIsIHpvb20pO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZTogKHApID0+IHtcbiAgICAgICAgaWYgKCFwIHx8ICFwLmxhdCB8fCAhcC5sbmcgKSByZXR1cm47XG5cbiAgICAgICAgbWFwLnNldFZpZXcoTC5sYXRMbmcocC5sYXQsIHAubG5nKSwgMTApO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJjb25zdCBRdWVyeU1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRGb3JtID0gXCJmb3JtI2ZpbHRlcnMtZm9ybVwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRGb3JtID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0Rm9ybSkgOiB0YXJnZXRGb3JtO1xuICAgIGxldCBsYXQgPSBudWxsO1xuICAgIGxldCBsbmcgPSBudWxsO1xuXG4gICAgJHRhcmdldC5vbignc3VibWl0JywgKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGxhdCA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwoKTtcbiAgICAgIGxuZyA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwoKTtcblxuICAgICAgdmFyIGZvcm0gPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG4gICAgICBkZWxldGUgZm9ybVsnc2VhcmNoLWxvY2F0aW9uJ107XG5cbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJC5wYXJhbShmb3JtKTtcbiAgICB9KVxuXG4gICAgJChkb2N1bWVudCkub24oJ2NoYW5nZScsICcuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF0nLCAoKSA9PiB7XG4gICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgIH0pXG5cblxuICAgIHJldHVybiB7XG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgcGFyYW1zID0gJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSlcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKHBhcmFtcy5sYXQpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwocGFyYW1zLmxuZyk7XG5cbiAgICAgICAgICBpZiAocGFyYW1zLmZpbHRlcikge1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdXCIpLnJlbW92ZVByb3AoXCJjaGVja2VkXCIpO1xuICAgICAgICAgICAgcGFyYW1zLmZpbHRlci5mb3JFYWNoKGl0ZW0gPT4ge1xuXG4gICAgICAgICAgICAgICR0YXJnZXQuZmluZChcIi5maWx0ZXItaXRlbSBpbnB1dFt0eXBlPWNoZWNrYm94XVt2YWx1ZT0nXCIgKyBpdGVtICsgXCInXVwiKS5wcm9wKFwiY2hlY2tlZFwiLCB0cnVlKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBnZXRQYXJhbWV0ZXJzOiAoKSA9PiB7XG4gICAgICAgIHZhciBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuICAgICAgICBkZWxldGUgcGFyYW1ldGVyc1snc2VhcmNoLWxvY2F0aW9uJ107XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtZXRlcnM7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTG9jYXRpb246IChsYXQsIGxuZykgPT4ge1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKGxhdCk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwobG5nKTtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVWaWV3cG9ydDogKHZpZXdwb3J0KSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW1t2aWV3cG9ydC5mLmIsIHZpZXdwb3J0LmIuYl0sIFt2aWV3cG9ydC5mLmYsIHZpZXdwb3J0LmIuZl1dO1xuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdHJpZ2dlclN1Ym1pdDogKCkgPT4ge1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSkoalF1ZXJ5KTtcbiIsIihmdW5jdGlvbigkKSB7XG5cbiAgLy8gMS4gZ29vZ2xlIG1hcHMgZ2VvY29kZVxuXG4gIC8vIDIuIGZvY3VzIG1hcCBvbiBnZW9jb2RlICh2aWEgbGF0L2xuZylcbiAgY29uc3QgcXVlcnlNYW5hZ2VyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgICAgIHF1ZXJ5TWFuYWdlci5pbml0aWFsaXplKCk7XG5cbiAgY29uc3QgaW5pdFBhcmFtcyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gIGNvbnN0IG1hcE1hbmFnZXIgPSBNYXBNYW5hZ2VyKCk7XG5cbiAgY29uc3QgbGlzdE1hbmFnZXIgPSBMaXN0TWFuYWdlcigpO1xuXG4gIGlmKGluaXRQYXJhbXMubGF0ICYmIGluaXRQYXJhbXMubG5nKSB7XG4gICAgbWFwTWFuYWdlci5zZXRDZW50ZXIoW2luaXRQYXJhbXMubGF0LCBpbml0UGFyYW1zLmxuZ10pO1xuICB9XG5cbiAgLy8gVGhpcyB3aWxsIHRyaWdnZXIgdGhlIGxpc3QgdXBkYXRlIG1ldGhvZFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnBvcHVsYXRlTGlzdCgpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcblxuICAgIGxpc3RNYW5hZ2VyLnVwZGF0ZUZpbHRlcihvcHRpb25zKTtcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgLy8gbWFwTWFuYWdlci5zZXRDZW50ZXIoW29wdGlvbnMubGF0LCBvcHRpb25zLmxuZ10pO1xuXG4gICAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLmJvdW5kMSB8fCAhb3B0aW9ucy5ib3VuZDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgdmFyIGJvdW5kMiA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDIpO1xuICAgIG1hcE1hbmFnZXIuc2V0Qm91bmRzKGJvdW5kMSwgYm91bmQyKTtcbiAgICAvLyBjb25zb2xlLmxvZyhvcHRpb25zKVxuICB9KTtcblxuICAkKHdpbmRvdykub24oXCJoYXNoY2hhbmdlXCIsICgpID0+IHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgaWYgKGhhc2gubGVuZ3RoID09IDApIHJldHVybjtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKGhhc2guc3Vic3RyaW5nKDEpKTtcblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gIH0pXG5cbiAgLy8gMy4gbWFya2VycyBvbiBtYXBcblxuICAvLyA0LiBmaWx0ZXIgb3V0IGl0ZW1zIGluIGFjdGl2aXR5LWFyZWFcblxuICAvLyA1LiBnZXQgbWFwIGVsZW1lbnRzXG5cbiAgLy8gNi4gZ2V0IEdyb3VwIGRhdGFcblxuICAvLyA3LiBwcmVzZW50IGdyb3VwIGVsZW1lbnRzXG5cbiAgJC5hamF4KHtcbiAgICB1cmw6ICdodHRwczovL2RuYjZsZWFuZ3g2ZGMuY2xvdWRmcm9udC5uZXQvb3V0cHV0LzM1MG9yZy5qcy5neicsIC8vJ3wqKkRBVEFfU09VUkNFKip8JyxcbiAgICBkYXRhVHlwZTogJ3NjcmlwdCcsXG4gICAgY2FjaGU6IHRydWUsXG4gICAgc3VjY2VzczogKGRhdGEpID0+IHtcblxuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LXVwZGF0ZScpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpKTtcbiAgICAgIC8vICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScpO1xuICAgIH1cbiAgfSk7XG5cbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpKTtcbiAgfSwgMTAwMCk7XG5cbn0pKGpRdWVyeSk7XG4iXX0=
