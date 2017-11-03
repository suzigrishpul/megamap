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
        queryMgr.updateLocation(geometry.location.lat(), geometry.location.lng());
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
  //console.log(("Autocomplete has been initialized"));
  //console.log((AutocompleteManager("input[name='search-location']")););
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
        //console.log(("ENTERED!"););
        $target.removeProp("class");
        $target.addClass(p.filter.join(" "));
      },
      populateList: function populateList() {
        //using window.EVENT_DATA
        //console.log(("Populating --> ", window.EVENTS_DATA));
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

    return {
      $map: map,
      setCenter: function setCenter(center) {
        var zoom = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

        //console.log(("XXX"););
        console.log(center);
        if (!center || !center[0] || center[0] == "" || !center[1] || center[1] == "") return;
        map.setView(center, zoom);
      },
      update: function update(p) {
        if (!p || !p.lat || !p.lng) return;
        //console.log(("TTT", p););
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
              //console.log((".filter-item input[type=checkbox][value=" + item + "]"););
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
    //console.log(("XXXX"););
    listManager.updateFilter(options);
  });

  $(document).on('trigger-map-update', function (event, options) {
    mapManager.setCenter([options.lat, options.lng]);
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
      //console.log((window.EVENT_DATA));
      $(document).trigger('trigger-list-update');
      $(document).trigger('trigger-list-filter-update', queryManager.getParameters());
      // $(document).trigger('trigger-map-update');
    }
  });

  setTimeout(function () {
    $(document).trigger('trigger-list-filter-update', queryManager.getParameters());
  }, 1000);
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9saXN0LmpzIiwiY2xhc3Nlcy9tYXAuanMiLCJjbGFzc2VzL3F1ZXJ5LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIkF1dG9jb21wbGV0ZU1hbmFnZXIiLCIkIiwiQVBJX0tFWSIsInRhcmdldCIsInRhcmdldEl0ZW0iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJxdWVyeU1nciIsIlF1ZXJ5TWFuYWdlciIsImdlb2NvZGVyIiwiZ29vZ2xlIiwibWFwcyIsIkdlb2NvZGVyIiwidHlwZWFoZWFkIiwiaGludCIsImhpZ2hsaWdodCIsIm1pbkxlbmd0aCIsImNsYXNzTmFtZXMiLCJtZW51IiwibmFtZSIsImRpc3BsYXkiLCJpdGVtIiwiZm9ybWF0dGVkX2FkZHJlc3MiLCJsaW1pdCIsInNvdXJjZSIsInEiLCJzeW5jIiwiYXN5bmMiLCJnZW9jb2RlIiwiYWRkcmVzcyIsInJlc3VsdHMiLCJzdGF0dXMiLCJvbiIsIm9iaiIsImRhdHVtIiwiZ2VvbWV0cnkiLCJ1cGRhdGVMb2NhdGlvbiIsImxvY2F0aW9uIiwibGF0IiwibG5nIiwiJHRhcmdldCIsImpRdWVyeSIsImluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayIsIkxpc3RNYW5hZ2VyIiwidGFyZ2V0TGlzdCIsInJlbmRlckV2ZW50IiwiZGF0ZSIsIm1vbWVudCIsInN0YXJ0X2RhdGV0aW1lIiwiZm9ybWF0IiwiZXZlbnRfdHlwZSIsInVybCIsInRpdGxlIiwidmVudWUiLCJyZW5kZXJHcm91cCIsImRldGFpbHMiLCIkbGlzdCIsInVwZGF0ZUZpbHRlciIsInAiLCJyZW1vdmVQcm9wIiwiYWRkQ2xhc3MiLCJmaWx0ZXIiLCJqb2luIiwicG9wdWxhdGVMaXN0IiwiJGV2ZW50TGlzdCIsIndpbmRvdyIsIkVWRU5UU19EQVRBIiwibWFwIiwiZmluZCIsInJlbW92ZSIsImFwcGVuZCIsIk1hcE1hbmFnZXIiLCJMIiwic2V0VmlldyIsInRpbGVMYXllciIsImF0dHJpYnV0aW9uIiwiYWRkVG8iLCIkbWFwIiwic2V0Q2VudGVyIiwiY2VudGVyIiwiem9vbSIsImNvbnNvbGUiLCJsb2ciLCJ1cGRhdGUiLCJsYXRMbmciLCJ0YXJnZXRGb3JtIiwiZSIsInByZXZlbnREZWZhdWx0IiwidmFsIiwiZm9ybSIsImRlcGFyYW0iLCJzZXJpYWxpemUiLCJoYXNoIiwicGFyYW0iLCJ0cmlnZ2VyIiwiaW5pdGlhbGl6ZSIsImNhbGxiYWNrIiwibGVuZ3RoIiwicGFyYW1zIiwic3Vic3RyaW5nIiwiZm9yRWFjaCIsInByb3AiLCJnZXRQYXJhbWV0ZXJzIiwicGFyYW1ldGVycyIsInRyaWdnZXJTdWJtaXQiLCJxdWVyeU1hbmFnZXIiLCJpbml0UGFyYW1zIiwibWFwTWFuYWdlciIsImxpc3RNYW5hZ2VyIiwiZXZlbnQiLCJvcHRpb25zIiwiYWpheCIsImRhdGFUeXBlIiwiY2FjaGUiLCJzdWNjZXNzIiwiZGF0YSIsInNldFRpbWVvdXQiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7O0FBQ0EsSUFBTUEsc0JBQXVCLFVBQVNDLENBQVQsRUFBWTtBQUN2Qzs7QUFFQSxNQUFNQyxVQUFVLHlDQUFoQjs7QUFFQSxTQUFPLFVBQUNDLE1BQUQsRUFBWTs7QUFFakIsUUFBTUMsYUFBYSxPQUFPRCxNQUFQLElBQWlCLFFBQWpCLEdBQTRCRSxTQUFTQyxhQUFULENBQXVCSCxNQUF2QixDQUE1QixHQUE2REEsTUFBaEY7QUFDQSxRQUFNSSxXQUFXQyxjQUFqQjtBQUNBLFFBQUlDLFdBQVcsSUFBSUMsT0FBT0MsSUFBUCxDQUFZQyxRQUFoQixFQUFmOztBQUVBWCxNQUFFRyxVQUFGLEVBQWNTLFNBQWQsQ0FBd0I7QUFDWkMsWUFBTSxJQURNO0FBRVpDLGlCQUFXLElBRkM7QUFHWkMsaUJBQVcsQ0FIQztBQUlaQyxrQkFBWTtBQUNWQyxjQUFNO0FBREk7QUFKQSxLQUF4QixFQVFVO0FBQ0VDLFlBQU0sZ0JBRFI7QUFFRUMsZUFBUyxpQkFBQ0MsSUFBRDtBQUFBLGVBQVVBLEtBQUtD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UyxVQUExQztBQUNELEdBUEQ7O0FBU0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUF0RyxJQUFFOEcsSUFBRixDQUFPO0FBQ0w1RCxTQUFLLDBEQURBLEVBQzREO0FBQ2pFNkQsY0FBVSxRQUZMO0FBR0xDLFdBQU8sSUFIRjtBQUlMQyxhQUFTLGlCQUFDQyxJQUFELEVBQVU7QUFDakI7QUFDQWxILFFBQUVJLFFBQUYsRUFBWXlGLE9BQVosQ0FBb0IscUJBQXBCO0FBQ0E3RixRQUFFSSxRQUFGLEVBQVl5RixPQUFaLENBQW9CLDRCQUFwQixFQUFrRFcsYUFBYUgsYUFBYixFQUFsRDtBQUNBO0FBQ0Q7QUFUSSxHQUFQOztBQVlBYyxhQUFXLFlBQU07QUFDZm5ILE1BQUVJLFFBQUYsRUFBWXlGLE9BQVosQ0FBb0IsNEJBQXBCLEVBQWtEVyxhQUFhSCxhQUFiLEVBQWxEO0FBQ0QsR0FGRCxFQUVHLElBRkg7QUFJRCxDQWxFRCxFQWtFRzdELE1BbEVIIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuLy9BUEkgOkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVxuY29uc3QgQXV0b2NvbXBsZXRlTWFuYWdlciA9IChmdW5jdGlvbigkKSB7XG4gIC8vSW5pdGlhbGl6YXRpb24uLi5cblxuICBjb25zdCBBUElfS0VZID0gXCJBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cIjtcblxuICByZXR1cm4gKHRhcmdldCkgPT4ge1xuXG4gICAgY29uc3QgdGFyZ2V0SXRlbSA9IHR5cGVvZiB0YXJnZXQgPT0gXCJzdHJpbmdcIiA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KSA6IHRhcmdldDtcbiAgICBjb25zdCBxdWVyeU1nciA9IFF1ZXJ5TWFuYWdlcigpO1xuICAgIHZhciBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuXG4gICAgJCh0YXJnZXRJdGVtKS50eXBlYWhlYWQoe1xuICAgICAgICAgICAgICAgIGhpbnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgaGlnaGxpZ2h0OiB0cnVlLFxuICAgICAgICAgICAgICAgIG1pbkxlbmd0aDogNCxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWVzOiB7XG4gICAgICAgICAgICAgICAgICBtZW51OiAndHQtZHJvcGRvd24tbWVudSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnc2VhcmNoLXJlc3VsdHMnLFxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IChpdGVtKSA9PiBpdGVtLmZvcm1hdHRlZF9hZGRyZXNzLFxuICAgICAgICAgICAgICAgIGxpbWl0OiAxMCxcbiAgICAgICAgICAgICAgICBzb3VyY2U6IGZ1bmN0aW9uIChxLCBzeW5jLCBhc3luYyl7XG4gICAgICAgICAgICAgICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBxIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICBhc3luYyhyZXN1bHRzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApLm9uKCd0eXBlYWhlYWQ6c2VsZWN0ZWQnLCBmdW5jdGlvbiAob2JqLCBkYXR1bSkge1xuICAgICAgICAgICAgICAgIGlmKGRhdHVtKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHZhciBnZW9tZXRyeSA9IGRhdHVtLmdlb21ldHJ5O1xuICAgICAgICAgICAgICAgICAgcXVlcnlNZ3IudXBkYXRlTG9jYXRpb24oZ2VvbWV0cnkubG9jYXRpb24ubGF0KCksIGdlb21ldHJ5LmxvY2F0aW9uLmxuZygpKTtcbiAgICAgICAgICAgICAgICAgIC8vICBtYXAuZml0Qm91bmRzKGdlb21ldHJ5LmJvdW5kcz8gZ2VvbWV0cnkuYm91bmRzIDogZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG5cbiAgICByZXR1cm4ge1xuICAgICAgJHRhcmdldDogJCh0YXJnZXRJdGVtKSxcbiAgICAgIHRhcmdldDogdGFyZ2V0SXRlbVxuICAgIH1cbiAgfVxuXG59KGpRdWVyeSkpO1xuXG5jb25zdCBpbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2sgPSAoKSA9PiB7XG4gIC8vY29uc29sZS5sb2coKFwiQXV0b2NvbXBsZXRlIGhhcyBiZWVuIGluaXRpYWxpemVkXCIpKTtcbiAgLy9jb25zb2xlLmxvZygoQXV0b2NvbXBsZXRlTWFuYWdlcihcImlucHV0W25hbWU9J3NlYXJjaC1sb2NhdGlvbiddXCIpKTspO1xuICBBdXRvY29tcGxldGVNYW5hZ2VyKFwiaW5wdXRbbmFtZT0nc2VhcmNoLWxvY2F0aW9uJ11cIik7XG59O1xuIiwiLyogVGhpcyBsb2FkcyBhbmQgbWFuYWdlcyB0aGUgbGlzdCEgKi9cblxuY29uc3QgTGlzdE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRMaXN0ID0gXCIjZXZlbnRzLWxpc3RcIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0TGlzdCA9PT0gJ3N0cmluZycgPyAkKHRhcmdldExpc3QpIDogdGFyZ2V0TGlzdDtcblxuICAgIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0pID0+IHtcblxuICAgICAgdmFyIGRhdGUgPSBtb21lbnQoaXRlbS5zdGFydF9kYXRldGltZSkuZm9ybWF0KFwiZGRkZCDigKIgTU1NIEREIGg6bW1hXCIpO1xuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaSBjbGFzcz0nJHtpdGVtLmV2ZW50X3R5cGV9JyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50XCI+XG4gICAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgICAgPGxpPiR7aXRlbS5ldmVudF90eXBlfTwvbGk+XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICAgIDxoND4ke2RhdGV9PC9oND5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5SU1ZQPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIGNvbnN0IHJlbmRlckdyb3VwID0gKGl0ZW0pID0+IHtcblxuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaT5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXBcIj5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIi9cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlIHx8IGBHcm91cGB9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgICAgPHA+Q29sb3JhZG8sIFVTQTwvcD5cbiAgICAgICAgICAgIDxwPiR7aXRlbS5kZXRhaWxzIHx8IGAzNTAgQ29sb3JhZG8gaXMgd29ya2luZyBsb2NhbGx5IHRvIGhlbHAgYnVpbGQgdGhlIGdsb2JhbFxuICAgICAgICAgICAgICAgMzUwLm9yZyBtb3ZlbWVudCB0byBzb2x2ZSB0aGUgY2xpbWF0ZSBjcmlzaXMgYW5kIHRyYW5zaXRpb25cbiAgICAgICAgICAgICAgIHRvIGEgY2xlYW4sIHJlbmV3YWJsZSBlbmVyZ3kgZnV0dXJlLmB9XG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiLy8ke2l0ZW0udXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPkdldCBJbnZvbHZlZDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICAgYFxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgJGxpc3Q6ICR0YXJnZXQsXG4gICAgICB1cGRhdGVGaWx0ZXI6IChwKSA9PiB7XG4gICAgICAgIGlmKCFwKSByZXR1cm47XG5cbiAgICAgICAgLy8gUmVtb3ZlIEZpbHRlcnNcbiAgICAgICAgLy9jb25zb2xlLmxvZygoXCJFTlRFUkVEIVwiKTspO1xuICAgICAgICAkdGFyZ2V0LnJlbW92ZVByb3AoXCJjbGFzc1wiKTtcbiAgICAgICAgJHRhcmdldC5hZGRDbGFzcyhwLmZpbHRlci5qb2luKFwiIFwiKSlcbiAgICAgIH0sXG4gICAgICBwb3B1bGF0ZUxpc3Q6ICgpID0+IHtcbiAgICAgICAgLy91c2luZyB3aW5kb3cuRVZFTlRfREFUQVxuICAgICAgICAvL2NvbnNvbGUubG9nKChcIlBvcHVsYXRpbmcgLS0+IFwiLCB3aW5kb3cuRVZFTlRTX0RBVEEpKTtcbiAgICAgICAgdmFyICRldmVudExpc3QgPSB3aW5kb3cuRVZFTlRTX0RBVEEubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgIHJldHVybiBpdGVtLmV2ZW50X3R5cGUgIT09ICdHcm91cCcgPyByZW5kZXJFdmVudChpdGVtKSA6IHJlbmRlckdyb3VwKGl0ZW0pO1xuICAgICAgICB9KVxuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsIGxpJykucmVtb3ZlKCk7XG4gICAgICAgICR0YXJnZXQuZmluZCgndWwnKS5hcHBlbmQoJGV2ZW50TGlzdCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsIlxuY29uc3QgTWFwTWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKCkgPT4ge1xuICAgIHZhciBtYXAgPSBMLm1hcCgnbWFwJykuc2V0VmlldyhbMzQuODg1OTMwOTQwNzUzMTcsIDUuMDk3NjU2MjUwMDAwMDAxXSwgMik7XG5cbiAgICBMLnRpbGVMYXllcignaHR0cDovL3tzfS50aWxlLm9zbS5vcmcve3p9L3t4fS97eX0ucG5nJywge1xuICAgICAgICBhdHRyaWJ1dGlvbjogJyZjb3B5OyA8YSBocmVmPVwiaHR0cDovL29zbS5vcmcvY29weXJpZ2h0XCI+T3BlblN0cmVldE1hcDwvYT4gY29udHJpYnV0b3JzIOKAoiA8YSBocmVmPVwiLy8zNTAub3JnXCI+MzUwLm9yZzwvYT4nXG4gICAgfSkuYWRkVG8obWFwKTtcblxuICAgIHJldHVybiB7XG4gICAgICAkbWFwOiBtYXAsXG4gICAgICBzZXRDZW50ZXI6IChjZW50ZXIsIHpvb20gPSAxMCkgPT4ge1xuICAgICAgICAvL2NvbnNvbGUubG9nKChcIlhYWFwiKTspO1xuICAgICAgICBjb25zb2xlLmxvZyhjZW50ZXIpO1xuICAgICAgICBpZiAoIWNlbnRlciB8fCAhY2VudGVyWzBdIHx8IGNlbnRlclswXSA9PSBcIlwiXG4gICAgICAgICAgICAgIHx8ICFjZW50ZXJbMV0gfHwgY2VudGVyWzFdID09IFwiXCIpIHJldHVybjtcbiAgICAgICAgbWFwLnNldFZpZXcoY2VudGVyLCB6b29tKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGU6IChwKSA9PiB7XG4gICAgICAgIGlmICghcCB8fCAhcC5sYXQgfHwgIXAubG5nICkgcmV0dXJuO1xuICAgICAgICAvL2NvbnNvbGUubG9nKChcIlRUVFwiLCBwKTspO1xuICAgICAgICBtYXAuc2V0VmlldyhMLmxhdExuZyhwLmxhdCwgcC5sbmcpLCAxMCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsImNvbnN0IFF1ZXJ5TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldEZvcm0gPSBcImZvcm0jZmlsdGVycy1mb3JtXCIpID0+IHtcbiAgICBjb25zdCAkdGFyZ2V0ID0gdHlwZW9mIHRhcmdldEZvcm0gPT09ICdzdHJpbmcnID8gJCh0YXJnZXRGb3JtKSA6IHRhcmdldEZvcm07XG4gICAgbGV0IGxhdCA9IG51bGw7XG4gICAgbGV0IGxuZyA9IG51bGw7XG5cbiAgICAkdGFyZ2V0Lm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgbGF0ID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbCgpO1xuICAgICAgbG5nID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbCgpO1xuXG4gICAgICB2YXIgZm9ybSA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcbiAgICAgIGRlbGV0ZSBmb3JtWydzZWFyY2gtbG9jYXRpb24nXTtcblxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAkLnBhcmFtKGZvcm0pO1xuICAgIH0pXG5cbiAgICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy5maWx0ZXItaXRlbSBpbnB1dFt0eXBlPWNoZWNrYm94XScsICgpID0+IHtcbiAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgfSlcblxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGluaXRpYWxpemU6IChjYWxsYmFjaykgPT4ge1xuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2gubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHZhciBwYXJhbXMgPSAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpKVxuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwocGFyYW1zLmxhdCk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChwYXJhbXMubG5nKTtcblxuICAgICAgICAgIGlmIChwYXJhbXMuZmlsdGVyKSB7XG4gICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF1cIikucmVtb3ZlUHJvcChcImNoZWNrZWRcIik7XG4gICAgICAgICAgICBwYXJhbXMuZmlsdGVyLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICAgIC8vY29uc29sZS5sb2coKFwiLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdW3ZhbHVlPVwiICsgaXRlbSArIFwiXVwiKTspO1xuICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF1bdmFsdWU9J1wiICsgaXRlbSArIFwiJ11cIikucHJvcChcImNoZWNrZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZ2V0UGFyYW1ldGVyczogKCkgPT4ge1xuICAgICAgICB2YXIgcGFyYW1ldGVycyA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcbiAgICAgICAgZGVsZXRlIHBhcmFtZXRlcnNbJ3NlYXJjaC1sb2NhdGlvbiddO1xuXG4gICAgICAgIHJldHVybiBwYXJhbWV0ZXJzO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZUxvY2F0aW9uOiAobGF0LCBsbmcpID0+IHtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChsYXQpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKGxuZyk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdHJpZ2dlclN1Ym1pdDogKCkgPT4ge1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSkoalF1ZXJ5KTtcbiIsIihmdW5jdGlvbigkKSB7XG5cbiAgLy8gMS4gZ29vZ2xlIG1hcHMgZ2VvY29kZVxuXG4gIC8vIDIuIGZvY3VzIG1hcCBvbiBnZW9jb2RlICh2aWEgbGF0L2xuZylcbiAgY29uc3QgcXVlcnlNYW5hZ2VyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgICAgIHF1ZXJ5TWFuYWdlci5pbml0aWFsaXplKCk7XG5cbiAgY29uc3QgaW5pdFBhcmFtcyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gIGNvbnN0IG1hcE1hbmFnZXIgPSBNYXBNYW5hZ2VyKCk7XG5cbiAgY29uc3QgbGlzdE1hbmFnZXIgPSBMaXN0TWFuYWdlcigpO1xuXG4gIGlmKGluaXRQYXJhbXMubGF0ICYmIGluaXRQYXJhbXMubG5nKSB7XG4gICAgbWFwTWFuYWdlci5zZXRDZW50ZXIoW2luaXRQYXJhbXMubGF0LCBpbml0UGFyYW1zLmxuZ10pO1xuICB9XG5cbiAgLy8gVGhpcyB3aWxsIHRyaWdnZXIgdGhlIGxpc3QgdXBkYXRlIG1ldGhvZFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnBvcHVsYXRlTGlzdCgpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICAvL2NvbnNvbGUubG9nKChcIlhYWFhcIik7KTtcbiAgICBsaXN0TWFuYWdlci51cGRhdGVGaWx0ZXIob3B0aW9ucyk7XG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIG1hcE1hbmFnZXIuc2V0Q2VudGVyKFtvcHRpb25zLmxhdCwgb3B0aW9ucy5sbmddKTtcbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKFwiaGFzaGNoYW5nZVwiLCAoKSA9PiB7XG4gICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgIGlmIChoYXNoLmxlbmd0aCA9PSAwKSByZXR1cm47XG4gICAgY29uc3QgcGFyYW1ldGVycyA9ICQuZGVwYXJhbShoYXNoLnN1YnN0cmluZygxKSk7XG5cbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICB9KVxuXG4gIC8vIDMuIG1hcmtlcnMgb24gbWFwXG5cbiAgLy8gNC4gZmlsdGVyIG91dCBpdGVtcyBpbiBhY3Rpdml0eS1hcmVhXG5cbiAgLy8gNS4gZ2V0IG1hcCBlbGVtZW50c1xuXG4gIC8vIDYuIGdldCBHcm91cCBkYXRhXG5cbiAgLy8gNy4gcHJlc2VudCBncm91cCBlbGVtZW50c1xuXG4gICQuYWpheCh7XG4gICAgdXJsOiAnaHR0cHM6Ly9kbmI2bGVhbmd4NmRjLmNsb3VkZnJvbnQubmV0L291dHB1dC8zNTBvcmcuanMuZ3onLCAvLyd8KipEQVRBX1NPVVJDRSoqfCcsXG4gICAgZGF0YVR5cGU6ICdzY3JpcHQnLFxuICAgIGNhY2hlOiB0cnVlLFxuICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAvL2NvbnNvbGUubG9nKCh3aW5kb3cuRVZFTlRfREFUQSkpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LXVwZGF0ZScpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpKTtcbiAgICAgIC8vICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScpO1xuICAgIH1cbiAgfSk7XG5cbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpKTtcbiAgfSwgMTAwMCk7XG5cbn0pKGpRdWVyeSk7XG4iXX0=
