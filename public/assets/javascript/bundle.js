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
        console.log("$targets", lang);
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
        console.log("New Lang ::: ", lang);
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
          $target.find("input[name=lang]").val(params.lang);
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
  console.log(queryManager, queryManager.getParameters(), initParams);
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
    console.log(queryManager.getParameters());
  }, 100);
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9sYW5ndWFnZS5qcyIsImNsYXNzZXMvbGlzdC5qcyIsImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9xdWVyeS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJBdXRvY29tcGxldGVNYW5hZ2VyIiwiJCIsIkFQSV9LRVkiLCJ0YXJnZXQiLCJ0YXJnZXRJdGVtIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwicXVlcnlNZ3IiLCJRdWVyeU1hbmFnZXIiLCJnZW9jb2RlciIsImdvb2dsZSIsIm1hcHMiLCJHZW9jb2RlciIsInR5cGVhaGVhZCIsImhpbnQiLCJoaWdobGlnaHQiLCJtaW5MZW5ndGgiLCJjbGFzc05hbWVzIiwibWVudSIsIm5hbWUiLCJkaXNwbGF5IiwiaXRlbSIsImZvcm1hdHRlZF9hZGRyZXNzIiwibGltaXQiLCJzb3VyY2UiLCJxIiwic3luYyIsImFzeW5jIiwiZ2VvY29kZSIsImFkZHJlc3MiLCJyZXN1bHRzIiwic3RhdHVzIiwib24iLCJvYmoiLCJkYXR1bSIsImdlb21ldHJ5IiwidXBkYXRlVmlld3BvcnQiLCJ2aWV3cG9ydCIsIiR0YXJnZXQiLCJqUXVlcnkiLCJpbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2siLCJMYW5ndWFnZU1hbmFnZXIiLCJsYW5ndWFnZSIsImRpY3Rpb25hcnkiLCIkdGFyZ2V0cyIsInVwZGF0ZVBhZ2VMYW5ndWFnZSIsInRhcmdldExhbmd1YWdlIiwicm93cyIsImZpbHRlciIsImkiLCJsYW5nIiwiZWFjaCIsImluZGV4IiwidGFyZ2V0QXR0cmlidXRlIiwiZGF0YSIsImxhbmdUYXJnZXQiLCJ0ZXh0IiwidmFsIiwiYXR0ciIsInRhcmdldHMiLCJpbml0aWFsaXplIiwiY29uc29sZSIsImxvZyIsImFqYXgiLCJ1cmwiLCJkYXRhVHlwZSIsInN1Y2Nlc3MiLCJ1cGRhdGVMYW5ndWFnZSIsIkxpc3RNYW5hZ2VyIiwidGFyZ2V0TGlzdCIsInJlbmRlckV2ZW50IiwiZGF0ZSIsIm1vbWVudCIsInN0YXJ0X2RhdGV0aW1lIiwiZm9ybWF0IiwiZXZlbnRfdHlwZSIsImxhdCIsImxuZyIsInRpdGxlIiwidmVudWUiLCJyZW5kZXJHcm91cCIsImRldGFpbHMiLCIkbGlzdCIsInVwZGF0ZUZpbHRlciIsInAiLCJyZW1vdmVQcm9wIiwiYWRkQ2xhc3MiLCJqb2luIiwicG9wdWxhdGVMaXN0IiwiJGV2ZW50TGlzdCIsIndpbmRvdyIsIkVWRU5UU19EQVRBIiwibWFwIiwiZmluZCIsInJlbW92ZSIsImFwcGVuZCIsIk1hcE1hbmFnZXIiLCJyZW5kZXJHZW9qc29uIiwibGlzdCIsInJlbmRlcmVkIiwidG9Mb3dlckNhc2UiLCJ0eXBlIiwiY29vcmRpbmF0ZXMiLCJwcm9wZXJ0aWVzIiwiZXZlbnRQcm9wZXJ0aWVzIiwicG9wdXBDb250ZW50IiwiTCIsInNldFZpZXciLCJ0aWxlTGF5ZXIiLCJhdHRyaWJ1dGlvbiIsImFkZFRvIiwiJG1hcCIsInNldEJvdW5kcyIsImJvdW5kczEiLCJib3VuZHMyIiwiYm91bmRzIiwiZml0Qm91bmRzIiwic2V0Q2VudGVyIiwiY2VudGVyIiwiem9vbSIsImZpbHRlck1hcCIsImZpbHRlcnMiLCJoaWRlIiwiZm9yRWFjaCIsInNob3ciLCJwbG90UG9pbnRzIiwiZ2VvanNvbiIsImZlYXR1cmVzIiwiZ2VvSlNPTiIsInBvaW50VG9MYXllciIsImZlYXR1cmUiLCJsYXRsbmciLCJldmVudFR5cGUiLCJnZW9qc29uTWFya2VyT3B0aW9ucyIsInJhZGl1cyIsImZpbGxDb2xvciIsImNvbG9yIiwid2VpZ2h0Iiwib3BhY2l0eSIsImZpbGxPcGFjaXR5IiwiY2xhc3NOYW1lIiwiY2lyY2xlTWFya2VyIiwib25FYWNoRmVhdHVyZSIsImxheWVyIiwiYmluZFBvcHVwIiwidXBkYXRlIiwibGF0TG5nIiwidGFyZ2V0Rm9ybSIsInByZXZpb3VzIiwiZSIsInByZXZlbnREZWZhdWx0IiwiZm9ybSIsImRlcGFyYW0iLCJzZXJpYWxpemUiLCJsb2NhdGlvbiIsImhhc2giLCJwYXJhbSIsInRyaWdnZXIiLCJjYWxsYmFjayIsImxlbmd0aCIsInBhcmFtcyIsInN1YnN0cmluZyIsImJvdW5kMSIsImJvdW5kMiIsInByb3AiLCJnZXRQYXJhbWV0ZXJzIiwicGFyYW1ldGVycyIsInVwZGF0ZUxvY2F0aW9uIiwiZiIsImIiLCJKU09OIiwic3RyaW5naWZ5IiwidHJpZ2dlclN1Ym1pdCIsInF1ZXJ5TWFuYWdlciIsImluaXRQYXJhbXMiLCJtYXBNYW5hZ2VyIiwibGFuZ3VhZ2VNYW5hZ2VyIiwibGlzdE1hbmFnZXIiLCJldmVudCIsIm9wdGlvbnMiLCJwYXJzZSIsIm9wdCIsIm9sZFVSTCIsIm9yaWdpbmFsRXZlbnQiLCJvbGRIYXNoIiwic2VhcmNoIiwiY2FjaGUiLCJzZXRUaW1lb3V0Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOztBQUNBLElBQU1BLHNCQUF1QixVQUFTQyxDQUFULEVBQVk7QUFDdkM7O0FBRUEsTUFBTUMsVUFBVSx5Q0FBaEI7O0FBRUEsU0FBTyxVQUFDQyxNQUFELEVBQVk7O0FBRWpCLFFBQU1DLGFBQWEsT0FBT0QsTUFBUCxJQUFpQixRQUFqQixHQUE0QkUsU0FBU0MsYUFBVCxDQUF1QkgsTUFBdkIsQ0FBNUIsR0FBNkRBLE1BQWhGO0FBQ0EsUUFBTUksV0FBV0MsY0FBakI7QUFDQSxRQUFJQyxXQUFXLElBQUlDLE9BQU9DLElBQVAsQ0FBWUMsUUFBaEIsRUFBZjs7QUFFQVgsTUFBRUcsVUFBRixFQUFjUyxTQUFkLENBQXdCO0FBQ1pDLFlBQU0sSUFETTtBQUVaQyxpQkFBVyxJQUZDO0FBR1pDLGlCQUFXLENBSEM7QUFJWkMsa0JBQVk7QUFDVkMsY0FBTTtBQURJO0FBSkEsS0FBeEIsRUFRVTtBQUNFQyxZQUFNLGdCQURSO0FBRUVDLGVBQVMsaUJBQUNDLElBQUQ7QUFBQSxlQUFVQSxLQUFLQyxpQkFBZjtBQUFBLE9BRlg7QUFHRUMsYUFBTyxFQUhUO0FBSUVDLGNBQVEsZ0JBQVVDLENBQVYsRUFBYUMsSUFBYixFQUFtQkMsS0FBbkIsRUFBeUI7QUFDN0JsQixpQkFBU21CLE9BQVQsQ0FBaUIsRUFBRUMsU0FBU0osQ0FBWCxFQUFqQixFQUFpQyxVQUFVSyxPQUFWLEVBQW1CQyxNQUFuQixFQUEyQjtBQUMxREosZ0JBQU1HLE9BQU47QUFDRCxTQUZEO0FBR0g7QUFSSCxLQVJWLEVBa0JVRSxFQWxCVixDQWtCYSxvQkFsQmIsRUFrQm1DLFVBQVVDLEdBQVYsRUFBZUMsS0FBZixFQUFzQjtBQUM3QyxVQUFHQSxLQUFILEVBQ0E7O0FBRUUsWUFBSUMsV0FBV0QsTUFBTUMsUUFBckI7QUFDQTVCLGlCQUFTNkIsY0FBVCxDQUF3QkQsU0FBU0UsUUFBakM7QUFDQTtBQUNEO0FBQ0osS0ExQlQ7O0FBNkJBLFdBQU87QUFDTEMsZUFBU3JDLEVBQUVHLFVBQUYsQ0FESjtBQUVMRCxjQUFRQztBQUZILEtBQVA7QUFJRCxHQXZDRDtBQXlDRCxDQTlDNEIsQ0E4QzNCbUMsTUE5QzJCLENBQTdCOztBQWdEQSxJQUFNQyxpQ0FBaUMsU0FBakNBLDhCQUFpQyxHQUFNOztBQUczQ3hDLHNCQUFvQiwrQkFBcEI7QUFDRCxDQUpEO0FDbERBOztBQUNBLElBQU15QyxrQkFBbUIsVUFBQ3hDLENBQUQsRUFBTztBQUM5Qjs7QUFFQTtBQUNBLFNBQU8sWUFBTTtBQUNYLFFBQUl5QyxpQkFBSjtBQUNBLFFBQUlDLGFBQWEsRUFBakI7QUFDQSxRQUFJQyxXQUFXM0MsRUFBRSxtQ0FBRixDQUFmOztBQUVBLFFBQU00QyxxQkFBcUIsU0FBckJBLGtCQUFxQixHQUFNOztBQUUvQixVQUFJQyxpQkFBaUJILFdBQVdJLElBQVgsQ0FBZ0JDLE1BQWhCLENBQXVCLFVBQUNDLENBQUQ7QUFBQSxlQUFPQSxFQUFFQyxJQUFGLEtBQVdSLFFBQWxCO0FBQUEsT0FBdkIsRUFBbUQsQ0FBbkQsQ0FBckI7O0FBRUFFLGVBQVNPLElBQVQsQ0FBYyxVQUFDQyxLQUFELEVBQVEvQixJQUFSLEVBQWlCO0FBQzdCLFlBQUlnQyxrQkFBa0JwRCxFQUFFb0IsSUFBRixFQUFRaUMsSUFBUixDQUFhLGFBQWIsQ0FBdEI7QUFDQSxZQUFJQyxhQUFhdEQsRUFBRW9CLElBQUYsRUFBUWlDLElBQVIsQ0FBYSxVQUFiLENBQWpCOztBQUVBLGdCQUFPRCxlQUFQO0FBQ0UsZUFBSyxNQUFMO0FBQ0VwRCxjQUFFb0IsSUFBRixFQUFRbUMsSUFBUixDQUFhVixlQUFlUyxVQUFmLENBQWI7QUFDQTtBQUNGLGVBQUssT0FBTDtBQUNFdEQsY0FBRW9CLElBQUYsRUFBUW9DLEdBQVIsQ0FBWVgsZUFBZVMsVUFBZixDQUFaO0FBQ0E7QUFDRjtBQUNFdEQsY0FBRW9CLElBQUYsRUFBUXFDLElBQVIsQ0FBYUwsZUFBYixFQUE4QlAsZUFBZVMsVUFBZixDQUE5QjtBQUNBO0FBVEo7QUFXRCxPQWZEO0FBZ0JELEtBcEJEOztBQXNCQSxXQUFPO0FBQ0xiLHdCQURLO0FBRUxpQixlQUFTZixRQUZKO0FBR0xELDRCQUhLO0FBSUxpQixrQkFBWSxvQkFBQ1YsSUFBRCxFQUFVO0FBQ3BCVyxnQkFBUUMsR0FBUixDQUFZLFVBQVosRUFBd0JaLElBQXhCO0FBQ0FqRCxVQUFFOEQsSUFBRixDQUFPO0FBQ0xDLGVBQUssaUZBREE7QUFFTEMsb0JBQVUsTUFGTDtBQUdMQyxtQkFBUyxpQkFBQ1osSUFBRCxFQUFVO0FBQ2pCWCx5QkFBYVcsSUFBYjtBQUNBWix1QkFBV1EsSUFBWDtBQUNBTDtBQUNEO0FBUEksU0FBUDtBQVNELE9BZkk7QUFnQkxzQixzQkFBZ0Isd0JBQUNqQixJQUFELEVBQVU7QUFDeEJXLGdCQUFRQyxHQUFSLENBQVksZUFBWixFQUE2QlosSUFBN0I7QUFDQVIsbUJBQVdRLElBQVg7QUFDQUw7QUFDRDtBQXBCSSxLQUFQO0FBc0JELEdBakREO0FBbURELENBdkR1QixDQXVEckJOLE1BdkRxQixDQUF4Qjs7O0FDREE7O0FBRUEsSUFBTTZCLGNBQWUsVUFBQ25FLENBQUQsRUFBTztBQUMxQixTQUFPLFlBQWlDO0FBQUEsUUFBaENvRSxVQUFnQyx1RUFBbkIsY0FBbUI7O0FBQ3RDLFFBQU0vQixVQUFVLE9BQU8rQixVQUFQLEtBQXNCLFFBQXRCLEdBQWlDcEUsRUFBRW9FLFVBQUYsQ0FBakMsR0FBaURBLFVBQWpFOztBQUVBLFFBQU1DLGNBQWMsU0FBZEEsV0FBYyxDQUFDakQsSUFBRCxFQUFVOztBQUU1QixVQUFJa0QsT0FBT0MsT0FBT25ELEtBQUtvRCxjQUFaLEVBQTRCQyxNQUE1QixDQUFtQyxxQkFBbkMsQ0FBWDtBQUNBLHNDQUNhckQsS0FBS3NELFVBQUwsSUFBbUIsRUFEaEMsNEJBQ3dEdEQsS0FBS3VELEdBRDdELG9CQUMrRXZELEtBQUt3RCxHQURwRix1SEFJWXhELEtBQUtzRCxVQUpqQiwwREFNcUJ0RCxLQUFLMkMsR0FOMUIsMkJBTWtEM0MsS0FBS3lELEtBTnZELGlDQU9VUCxJQVBWLHNFQVNXbEQsS0FBSzBELEtBVGhCLGtHQVltQjFELEtBQUsyQyxHQVp4QjtBQWlCRCxLQXBCRDs7QUFzQkEsUUFBTWdCLGNBQWMsU0FBZEEsV0FBYyxDQUFDM0QsSUFBRCxFQUFVOztBQUU1QixpSEFHc0NBLEtBQUt5RCxLQUFMLFdBSHRDLG9IQU1XekQsS0FBSzRELE9BQUwsK0xBTlgsaUhBWW1CNUQsS0FBSzJDLEdBWnhCO0FBaUJELEtBbkJEOztBQXFCQSxXQUFPO0FBQ0xrQixhQUFPNUMsT0FERjtBQUVMNkMsb0JBQWMsc0JBQUNDLENBQUQsRUFBTztBQUNuQixZQUFHLENBQUNBLENBQUosRUFBTzs7QUFFUDs7QUFFQTlDLGdCQUFRK0MsVUFBUixDQUFtQixPQUFuQjtBQUNBL0MsZ0JBQVFnRCxRQUFSLENBQWlCRixFQUFFcEMsTUFBRixHQUFXb0MsRUFBRXBDLE1BQUYsQ0FBU3VDLElBQVQsQ0FBYyxHQUFkLENBQVgsR0FBZ0MsRUFBakQ7QUFDRCxPQVRJO0FBVUxDLG9CQUFjLHdCQUFNO0FBQ2xCOztBQUVBLFlBQUlDLGFBQWFDLE9BQU9DLFdBQVAsQ0FBbUJDLEdBQW5CLENBQXVCLGdCQUFRO0FBQzlDLGlCQUFPdkUsS0FBS3NELFVBQUwsS0FBb0IsT0FBcEIsR0FBOEJMLFlBQVlqRCxJQUFaLENBQTlCLEdBQWtEMkQsWUFBWTNELElBQVosQ0FBekQ7QUFDRCxTQUZnQixDQUFqQjtBQUdBaUIsZ0JBQVF1RCxJQUFSLENBQWEsT0FBYixFQUFzQkMsTUFBdEI7QUFDQXhELGdCQUFRdUQsSUFBUixDQUFhLElBQWIsRUFBbUJFLE1BQW5CLENBQTBCTixVQUExQjtBQUNEO0FBbEJJLEtBQVA7QUFvQkQsR0FsRUQ7QUFtRUQsQ0FwRW1CLENBb0VqQmxELE1BcEVpQixDQUFwQjs7O0FDREEsSUFBTXlELGFBQWMsVUFBQy9GLENBQUQsRUFBTzs7QUFFekIsTUFBTXFFLGNBQWMsU0FBZEEsV0FBYyxDQUFDakQsSUFBRCxFQUFVO0FBQzVCLFFBQUlrRCxPQUFPQyxPQUFPbkQsS0FBS29ELGNBQVosRUFBNEJDLE1BQTVCLENBQW1DLHFCQUFuQyxDQUFYO0FBQ0EsOENBQ3lCckQsS0FBS3NELFVBRDlCLHNCQUN1RHRELEtBQUt1RCxHQUQ1RCxzQkFDOEV2RCxLQUFLd0QsR0FEbkYsbUdBSVl4RCxLQUFLc0QsVUFBTCxJQUFtQixRQUovQixzREFNcUJ0RCxLQUFLMkMsR0FOMUIsNEJBTWtEM0MsS0FBS3lELEtBTnZELCtCQU9VUCxJQVBWLGdFQVNXbEQsS0FBSzBELEtBVGhCLHlGQVltQjFELEtBQUsyQyxHQVp4QjtBQWlCRCxHQW5CRDs7QUFxQkEsTUFBTWdCLGNBQWMsU0FBZEEsV0FBYyxDQUFDM0QsSUFBRCxFQUFVO0FBQzVCLDhDQUN5QkEsS0FBS3NELFVBRDlCLHNCQUN1RHRELEtBQUt1RCxHQUQ1RCxzQkFDOEV2RCxLQUFLd0QsR0FEbkYsd0ZBR3NDeEQsS0FBS3lELEtBQUwsV0FIdEMsNEdBTVd6RCxLQUFLNEQsT0FBTCwyTEFOWCxzR0FZbUI1RCxLQUFLMkMsR0FaeEI7QUFpQkQsR0FsQkQ7O0FBb0JBLE1BQU1pQyxnQkFBZ0IsU0FBaEJBLGFBQWdCLENBQUNDLElBQUQsRUFBVTtBQUM5QixXQUFPQSxLQUFLTixHQUFMLENBQVMsVUFBQ3ZFLElBQUQsRUFBVTtBQUN4QjtBQUNBLFVBQUk4RSxpQkFBSjtBQUNBLFVBQUksQ0FBQzlFLEtBQUtzRCxVQUFOLElBQW9CLENBQUN0RCxLQUFLc0QsVUFBTCxDQUFnQnlCLFdBQWhCLEVBQUQsS0FBbUMsT0FBM0QsRUFBb0U7QUFDbEVELG1CQUFXN0IsWUFBWWpELElBQVosQ0FBWDtBQUNELE9BRkQsTUFFTztBQUNMOEUsbUJBQVduQixZQUFZM0QsSUFBWixDQUFYO0FBQ0Q7O0FBRUQsYUFBTztBQUNMLGdCQUFRLFNBREg7QUFFTGMsa0JBQVU7QUFDUmtFLGdCQUFNLE9BREU7QUFFUkMsdUJBQWEsQ0FBQ2pGLEtBQUt3RCxHQUFOLEVBQVd4RCxLQUFLdUQsR0FBaEI7QUFGTCxTQUZMO0FBTUwyQixvQkFBWTtBQUNWQywyQkFBaUJuRixJQURQO0FBRVZvRix3QkFBY047QUFGSjtBQU5QLE9BQVA7QUFXRCxLQXBCTSxDQUFQO0FBcUJELEdBdEJEOztBQXdCQSxTQUFPLFlBQU07QUFDWCxRQUFJUCxNQUFNYyxFQUFFZCxHQUFGLENBQU0sS0FBTixFQUFhZSxPQUFiLENBQXFCLENBQUMsaUJBQUQsRUFBb0IsaUJBQXBCLENBQXJCLEVBQTZELENBQTdELENBQVY7O0FBRUFELE1BQUVFLFNBQUYsQ0FBWSx5Q0FBWixFQUF1RDtBQUNuREMsbUJBQWE7QUFEc0MsS0FBdkQsRUFFR0MsS0FGSCxDQUVTbEIsR0FGVDs7QUFJQTtBQUNBLFdBQU87QUFDTG1CLFlBQU1uQixHQUREO0FBRUxvQixpQkFBVyxtQkFBQ0MsT0FBRCxFQUFVQyxPQUFWLEVBQXNCO0FBQy9CLFlBQU1DLFNBQVMsQ0FBQ0YsT0FBRCxFQUFVQyxPQUFWLENBQWY7QUFDQXRCLFlBQUl3QixTQUFKLENBQWNELE1BQWQ7QUFDRCxPQUxJO0FBTUxFLGlCQUFXLG1CQUFDQyxNQUFELEVBQXVCO0FBQUEsWUFBZEMsSUFBYyx1RUFBUCxFQUFPOztBQUNoQyxZQUFJLENBQUNELE1BQUQsSUFBVyxDQUFDQSxPQUFPLENBQVAsQ0FBWixJQUF5QkEsT0FBTyxDQUFQLEtBQWEsRUFBdEMsSUFDSyxDQUFDQSxPQUFPLENBQVAsQ0FETixJQUNtQkEsT0FBTyxDQUFQLEtBQWEsRUFEcEMsRUFDd0M7QUFDeEMxQixZQUFJZSxPQUFKLENBQVlXLE1BQVosRUFBb0JDLElBQXBCO0FBQ0QsT0FWSTtBQVdMQyxpQkFBVyxtQkFBQ0MsT0FBRCxFQUFhO0FBQ3RCNUQsZ0JBQVFDLEdBQVIsQ0FBWSxhQUFaLEVBQTJCMkQsT0FBM0I7QUFDQXhILFVBQUUsTUFBRixFQUFVNEYsSUFBVixDQUFlLG1CQUFmLEVBQW9DNkIsSUFBcEM7QUFDQTdELGdCQUFRQyxHQUFSLENBQVk3RCxFQUFFLE1BQUYsRUFBVTRGLElBQVYsQ0FBZSxtQkFBZixDQUFaOztBQUVBLFlBQUksQ0FBQzRCLE9BQUwsRUFBYzs7QUFFZEEsZ0JBQVFFLE9BQVIsQ0FBZ0IsVUFBQ3RHLElBQUQsRUFBVTtBQUN4QndDLGtCQUFRQyxHQUFSLENBQVksdUJBQXVCekMsS0FBSytFLFdBQUwsRUFBbkM7QUFDQW5HLFlBQUUsTUFBRixFQUFVNEYsSUFBVixDQUFlLHVCQUF1QnhFLEtBQUsrRSxXQUFMLEVBQXRDLEVBQTBEd0IsSUFBMUQ7QUFDRCxTQUhEO0FBSUQsT0F0Qkk7QUF1QkxDLGtCQUFZLG9CQUFDM0IsSUFBRCxFQUFVOztBQUVwQixZQUFNNEIsVUFBVTtBQUNkekIsZ0JBQU0sbUJBRFE7QUFFZDBCLG9CQUFVOUIsY0FBY0MsSUFBZDtBQUZJLFNBQWhCOztBQU9BUSxVQUFFc0IsT0FBRixDQUFVRixPQUFWLEVBQW1CO0FBQ2ZHLHdCQUFjLHNCQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDakMsZ0JBQU1DLFlBQVlGLFFBQVEzQixVQUFSLENBQW1CQyxlQUFuQixDQUFtQzdCLFVBQXJEO0FBQ0EsZ0JBQUkwRCx1QkFBdUI7QUFDdkJDLHNCQUFRLENBRGU7QUFFdkJDLHlCQUFZSCxjQUFjLE9BQWQsR0FBd0IsU0FBeEIsR0FBb0MsU0FGekI7QUFHdkJJLHFCQUFPLE9BSGdCO0FBSXZCQyxzQkFBUSxDQUplO0FBS3ZCQyx1QkFBUyxHQUxjO0FBTXZCQywyQkFBYSxHQU5VO0FBT3ZCQyx5QkFBVyxDQUFDUixjQUFjLE9BQWQsR0FBd0IsUUFBeEIsR0FBbUMsUUFBcEMsSUFBZ0Q7QUFQcEMsYUFBM0I7QUFTQSxtQkFBTzFCLEVBQUVtQyxZQUFGLENBQWVWLE1BQWYsRUFBdUJFLG9CQUF2QixDQUFQO0FBQ0QsV0FiYzs7QUFlakJTLHlCQUFlLHVCQUFDWixPQUFELEVBQVVhLEtBQVYsRUFBb0I7QUFDakMsZ0JBQUliLFFBQVEzQixVQUFSLElBQXNCMkIsUUFBUTNCLFVBQVIsQ0FBbUJFLFlBQTdDLEVBQTJEO0FBQ3pEc0Msb0JBQU1DLFNBQU4sQ0FBZ0JkLFFBQVEzQixVQUFSLENBQW1CRSxZQUFuQztBQUNEO0FBQ0Y7QUFuQmdCLFNBQW5CLEVBb0JHSyxLQXBCSCxDQW9CU2xCLEdBcEJUO0FBc0JELE9BdERJO0FBdURMcUQsY0FBUSxnQkFBQzdELENBQUQsRUFBTztBQUNiLFlBQUksQ0FBQ0EsQ0FBRCxJQUFNLENBQUNBLEVBQUVSLEdBQVQsSUFBZ0IsQ0FBQ1EsRUFBRVAsR0FBdkIsRUFBNkI7O0FBRTdCZSxZQUFJZSxPQUFKLENBQVlELEVBQUV3QyxNQUFGLENBQVM5RCxFQUFFUixHQUFYLEVBQWdCUSxFQUFFUCxHQUFsQixDQUFaLEVBQW9DLEVBQXBDO0FBQ0Q7QUEzREksS0FBUDtBQTZERCxHQXJFRDtBQXNFRCxDQXpJa0IsQ0F5SWhCdEMsTUF6SWdCLENBQW5COzs7QUNEQSxJQUFNL0IsZUFBZ0IsVUFBQ1AsQ0FBRCxFQUFPO0FBQzNCLFNBQU8sWUFBc0M7QUFBQSxRQUFyQ2tKLFVBQXFDLHVFQUF4QixtQkFBd0I7O0FBQzNDLFFBQU03RyxVQUFVLE9BQU82RyxVQUFQLEtBQXNCLFFBQXRCLEdBQWlDbEosRUFBRWtKLFVBQUYsQ0FBakMsR0FBaURBLFVBQWpFO0FBQ0EsUUFBSXZFLE1BQU0sSUFBVjtBQUNBLFFBQUlDLE1BQU0sSUFBVjs7QUFFQSxRQUFJdUUsV0FBVyxFQUFmOztBQUVBOUcsWUFBUU4sRUFBUixDQUFXLFFBQVgsRUFBcUIsVUFBQ3FILENBQUQsRUFBTztBQUMxQkEsUUFBRUMsY0FBRjtBQUNBMUUsWUFBTXRDLFFBQVF1RCxJQUFSLENBQWEsaUJBQWIsRUFBZ0NwQyxHQUFoQyxFQUFOO0FBQ0FvQixZQUFNdkMsUUFBUXVELElBQVIsQ0FBYSxpQkFBYixFQUFnQ3BDLEdBQWhDLEVBQU47O0FBRUEsVUFBSThGLE9BQU90SixFQUFFdUosT0FBRixDQUFVbEgsUUFBUW1ILFNBQVIsRUFBVixDQUFYO0FBQ0EsYUFBT0YsS0FBSyxpQkFBTCxDQUFQOztBQUVBN0QsYUFBT2dFLFFBQVAsQ0FBZ0JDLElBQWhCLEdBQXVCMUosRUFBRTJKLEtBQUYsQ0FBUUwsSUFBUixDQUF2QjtBQUNELEtBVEQ7O0FBV0F0SixNQUFFSSxRQUFGLEVBQVkyQixFQUFaLENBQWUsUUFBZixFQUF5QixtQ0FBekIsRUFBOEQsWUFBTTtBQUNsRU0sY0FBUXVILE9BQVIsQ0FBZ0IsUUFBaEI7QUFDRCxLQUZEOztBQUtBLFdBQU87QUFDTGpHLGtCQUFZLG9CQUFDa0csUUFBRCxFQUFjO0FBQ3hCLFlBQUlwRSxPQUFPZ0UsUUFBUCxDQUFnQkMsSUFBaEIsQ0FBcUJJLE1BQXJCLEdBQThCLENBQWxDLEVBQXFDO0FBQ25DLGNBQUlDLFNBQVMvSixFQUFFdUosT0FBRixDQUFVOUQsT0FBT2dFLFFBQVAsQ0FBZ0JDLElBQWhCLENBQXFCTSxTQUFyQixDQUErQixDQUEvQixDQUFWLENBQWI7QUFDQTNILGtCQUFRdUQsSUFBUixDQUFhLGtCQUFiLEVBQWlDcEMsR0FBakMsQ0FBcUN1RyxPQUFPOUcsSUFBNUM7QUFDQVosa0JBQVF1RCxJQUFSLENBQWEsaUJBQWIsRUFBZ0NwQyxHQUFoQyxDQUFvQ3VHLE9BQU9wRixHQUEzQztBQUNBdEMsa0JBQVF1RCxJQUFSLENBQWEsaUJBQWIsRUFBZ0NwQyxHQUFoQyxDQUFvQ3VHLE9BQU9uRixHQUEzQztBQUNBdkMsa0JBQVF1RCxJQUFSLENBQWEsb0JBQWIsRUFBbUNwQyxHQUFuQyxDQUF1Q3VHLE9BQU9FLE1BQTlDO0FBQ0E1SCxrQkFBUXVELElBQVIsQ0FBYSxvQkFBYixFQUFtQ3BDLEdBQW5DLENBQXVDdUcsT0FBT0csTUFBOUM7O0FBRUEsY0FBSUgsT0FBT2hILE1BQVgsRUFBbUI7QUFDakJWLG9CQUFRdUQsSUFBUixDQUFhLG1DQUFiLEVBQWtEUixVQUFsRCxDQUE2RCxTQUE3RDtBQUNBMkUsbUJBQU9oSCxNQUFQLENBQWMyRSxPQUFkLENBQXNCLGdCQUFRO0FBQzVCckYsc0JBQVF1RCxJQUFSLENBQWEsOENBQThDeEUsSUFBOUMsR0FBcUQsSUFBbEUsRUFBd0UrSSxJQUF4RSxDQUE2RSxTQUE3RSxFQUF3RixJQUF4RjtBQUNELGFBRkQ7QUFHRDtBQUNGOztBQUVELFlBQUlOLFlBQVksT0FBT0EsUUFBUCxLQUFvQixVQUFwQyxFQUFnRDtBQUM5Q0E7QUFDRDtBQUNGLE9BckJJO0FBc0JMTyxxQkFBZSx5QkFBTTtBQUNuQixZQUFJQyxhQUFhckssRUFBRXVKLE9BQUYsQ0FBVWxILFFBQVFtSCxTQUFSLEVBQVYsQ0FBakI7QUFDQSxlQUFPYSxXQUFXLGlCQUFYLENBQVA7O0FBRUEsZUFBT0EsVUFBUDtBQUNELE9BM0JJO0FBNEJMQyxzQkFBZ0Isd0JBQUMzRixHQUFELEVBQU1DLEdBQU4sRUFBYztBQUM1QnZDLGdCQUFRdUQsSUFBUixDQUFhLGlCQUFiLEVBQWdDcEMsR0FBaEMsQ0FBb0NtQixHQUFwQztBQUNBdEMsZ0JBQVF1RCxJQUFSLENBQWEsaUJBQWIsRUFBZ0NwQyxHQUFoQyxDQUFvQ29CLEdBQXBDO0FBQ0E7QUFDRCxPQWhDSTtBQWlDTHpDLHNCQUFnQix3QkFBQ0MsUUFBRCxFQUFjOztBQUU1QixZQUFNOEUsU0FBUyxDQUFDLENBQUM5RSxTQUFTbUksQ0FBVCxDQUFXQyxDQUFaLEVBQWVwSSxTQUFTb0ksQ0FBVCxDQUFXQSxDQUExQixDQUFELEVBQStCLENBQUNwSSxTQUFTbUksQ0FBVCxDQUFXQSxDQUFaLEVBQWVuSSxTQUFTb0ksQ0FBVCxDQUFXRCxDQUExQixDQUEvQixDQUFmOztBQUVBbEksZ0JBQVF1RCxJQUFSLENBQWEsb0JBQWIsRUFBbUNwQyxHQUFuQyxDQUF1Q2lILEtBQUtDLFNBQUwsQ0FBZXhELE9BQU8sQ0FBUCxDQUFmLENBQXZDO0FBQ0E3RSxnQkFBUXVELElBQVIsQ0FBYSxvQkFBYixFQUFtQ3BDLEdBQW5DLENBQXVDaUgsS0FBS0MsU0FBTCxDQUFleEQsT0FBTyxDQUFQLENBQWYsQ0FBdkM7QUFDQTdFLGdCQUFRdUgsT0FBUixDQUFnQixRQUFoQjtBQUNELE9BeENJO0FBeUNMZSxxQkFBZSx5QkFBTTtBQUNuQnRJLGdCQUFRdUgsT0FBUixDQUFnQixRQUFoQjtBQUNEO0FBM0NJLEtBQVA7QUE2Q0QsR0FwRUQ7QUFxRUQsQ0F0RW9CLENBc0VsQnRILE1BdEVrQixDQUFyQjs7O0FDQUEsQ0FBQyxVQUFTdEMsQ0FBVCxFQUFZOztBQUVYOztBQUVBO0FBQ0EsTUFBTTRLLGVBQWVySyxjQUFyQjtBQUNNcUssZUFBYWpILFVBQWI7O0FBRU4sTUFBTWtILGFBQWFELGFBQWFSLGFBQWIsRUFBbkI7QUFDQSxNQUFNVSxhQUFhL0UsWUFBbkI7O0FBRUEsTUFBTWdGLGtCQUFrQnZJLGlCQUF4QjtBQUNBb0IsVUFBUUMsR0FBUixDQUFZK0csWUFBWixFQUEwQkEsYUFBYVIsYUFBYixFQUExQixFQUF3RFMsVUFBeEQ7QUFDQUUsa0JBQWdCcEgsVUFBaEIsQ0FBMkJrSCxXQUFXLE1BQVgsS0FBc0IsSUFBakQ7O0FBRUEsTUFBTUcsY0FBYzdHLGFBQXBCOztBQUVBLE1BQUcwRyxXQUFXbEcsR0FBWCxJQUFrQmtHLFdBQVdqRyxHQUFoQyxFQUFxQztBQUNuQ2tHLGVBQVcxRCxTQUFYLENBQXFCLENBQUN5RCxXQUFXbEcsR0FBWixFQUFpQmtHLFdBQVdqRyxHQUE1QixDQUFyQjtBQUNEOztBQUVEOzs7O0FBSUE1RSxJQUFFSSxRQUFGLEVBQVkyQixFQUFaLENBQWUscUJBQWYsRUFBc0MsVUFBQ2tKLEtBQUQsRUFBUUMsT0FBUixFQUFvQjtBQUN4REYsZ0JBQVl6RixZQUFaO0FBQ0QsR0FGRDs7QUFJQXZGLElBQUVJLFFBQUYsRUFBWTJCLEVBQVosQ0FBZSw0QkFBZixFQUE2QyxVQUFDa0osS0FBRCxFQUFRQyxPQUFSLEVBQW9COztBQUUvREYsZ0JBQVk5RixZQUFaLENBQXlCZ0csT0FBekI7QUFDRCxHQUhEOztBQUtBOzs7QUFHQWxMLElBQUVJLFFBQUYsRUFBWTJCLEVBQVosQ0FBZSxvQkFBZixFQUFxQyxVQUFDa0osS0FBRCxFQUFRQyxPQUFSLEVBQW9CO0FBQ3ZEO0FBQ0EsUUFBSSxDQUFDQSxPQUFELElBQVksQ0FBQ0EsUUFBUWpCLE1BQXJCLElBQStCLENBQUNpQixRQUFRaEIsTUFBNUMsRUFBb0Q7QUFDbEQ7QUFDRDs7QUFFRCxRQUFJRCxTQUFTUSxLQUFLVSxLQUFMLENBQVdELFFBQVFqQixNQUFuQixDQUFiO0FBQ0EsUUFBSUMsU0FBU08sS0FBS1UsS0FBTCxDQUFXRCxRQUFRaEIsTUFBbkIsQ0FBYjtBQUNBWSxlQUFXL0QsU0FBWCxDQUFxQmtELE1BQXJCLEVBQTZCQyxNQUE3QjtBQUNBO0FBQ0QsR0FWRDtBQVdBO0FBQ0FsSyxJQUFFSSxRQUFGLEVBQVkyQixFQUFaLENBQWUsa0JBQWYsRUFBbUMsVUFBQ3FILENBQUQsRUFBSWdDLEdBQUosRUFBWTtBQUM3Q04sZUFBV2xELFVBQVgsQ0FBc0J3RCxJQUFJL0gsSUFBMUI7QUFDQXJELE1BQUVJLFFBQUYsRUFBWXdKLE9BQVosQ0FBb0Isb0JBQXBCO0FBQ0QsR0FIRDs7QUFLQTtBQUNBNUosSUFBRUksUUFBRixFQUFZMkIsRUFBWixDQUFlLG9CQUFmLEVBQXFDLFVBQUNxSCxDQUFELEVBQUlnQyxHQUFKLEVBQVk7QUFDL0MsUUFBSUEsR0FBSixFQUFTO0FBQ1BOLGlCQUFXdkQsU0FBWCxDQUFxQjZELElBQUlySSxNQUF6QjtBQUNEO0FBQ0YsR0FKRDs7QUFNQS9DLElBQUVJLFFBQUYsRUFBWTJCLEVBQVosQ0FBZSx5QkFBZixFQUEwQyxVQUFDcUgsQ0FBRCxFQUFJZ0MsR0FBSixFQUFZO0FBQ3BELFFBQUlBLEdBQUosRUFBUztBQUNQTCxzQkFBZ0I3RyxjQUFoQixDQUErQmtILElBQUluSSxJQUFuQztBQUNEO0FBQ0YsR0FKRDs7QUFNQWpELElBQUV5RixNQUFGLEVBQVUxRCxFQUFWLENBQWEsWUFBYixFQUEyQixVQUFDa0osS0FBRCxFQUFXO0FBQ3BDLFFBQU12QixPQUFPakUsT0FBT2dFLFFBQVAsQ0FBZ0JDLElBQTdCO0FBQ0EsUUFBSUEsS0FBS0ksTUFBTCxJQUFlLENBQW5CLEVBQXNCO0FBQ3RCLFFBQU1PLGFBQWFySyxFQUFFdUosT0FBRixDQUFVRyxLQUFLTSxTQUFMLENBQWUsQ0FBZixDQUFWLENBQW5CO0FBQ0EsUUFBTXFCLFNBQVNKLE1BQU1LLGFBQU4sQ0FBb0JELE1BQW5DOztBQUdBLFFBQU1FLFVBQVV2TCxFQUFFdUosT0FBRixDQUFVOEIsT0FBT3JCLFNBQVAsQ0FBaUJxQixPQUFPRyxNQUFQLENBQWMsR0FBZCxJQUFtQixDQUFwQyxDQUFWLENBQWhCOztBQUVBeEwsTUFBRUksUUFBRixFQUFZd0osT0FBWixDQUFvQiw0QkFBcEIsRUFBa0RTLFVBQWxEO0FBQ0FySyxNQUFFSSxRQUFGLEVBQVl3SixPQUFaLENBQW9CLG9CQUFwQixFQUEwQ1MsVUFBMUM7O0FBRUE7QUFDQSxRQUFJa0IsUUFBUXRCLE1BQVIsS0FBbUJJLFdBQVdKLE1BQTlCLElBQXdDc0IsUUFBUXJCLE1BQVIsS0FBbUJHLFdBQVdILE1BQTFFLEVBQWtGO0FBQ2hGbEssUUFBRUksUUFBRixFQUFZd0osT0FBWixDQUFvQixvQkFBcEIsRUFBMENTLFVBQTFDO0FBQ0Q7O0FBRUQ7QUFDQSxRQUFJa0IsUUFBUXRJLElBQVIsS0FBaUJvSCxXQUFXcEgsSUFBaEMsRUFBc0M7QUFDcENqRCxRQUFFSSxRQUFGLEVBQVl3SixPQUFaLENBQW9CLHlCQUFwQixFQUErQ1MsVUFBL0M7QUFDRDtBQUNGLEdBckJEOztBQXVCQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQXJLLElBQUU4RCxJQUFGLENBQU87QUFDTEMsU0FBSywwRUFEQSxFQUM0RTtBQUNqRkMsY0FBVSxRQUZMO0FBR0x5SCxXQUFPLElBSEY7QUFJTHhILGFBQVMsaUJBQUNaLElBQUQsRUFBVTtBQUNqQixVQUFJZ0gsYUFBYU8sYUFBYVIsYUFBYixFQUFqQjs7QUFFQTNFLGFBQU9DLFdBQVAsQ0FBbUJnQyxPQUFuQixDQUEyQixVQUFDdEcsSUFBRCxFQUFVO0FBQ25DQSxhQUFLLFlBQUwsSUFBcUIsQ0FBQ0EsS0FBS3NELFVBQU4sR0FBbUIsUUFBbkIsR0FBOEJ0RCxLQUFLc0QsVUFBeEQ7QUFDRCxPQUZEO0FBR0ExRSxRQUFFSSxRQUFGLEVBQVl3SixPQUFaLENBQW9CLHFCQUFwQjtBQUNBO0FBQ0E1SixRQUFFSSxRQUFGLEVBQVl3SixPQUFaLENBQW9CLGtCQUFwQixFQUF3QyxFQUFFdkcsTUFBTW9DLE9BQU9DLFdBQWYsRUFBeEM7QUFDQTtBQUNEO0FBZEksR0FBUDs7QUFpQkFnRyxhQUFXLFlBQU07QUFDZjFMLE1BQUVJLFFBQUYsRUFBWXdKLE9BQVosQ0FBb0IsNEJBQXBCLEVBQWtEZ0IsYUFBYVIsYUFBYixFQUFsRDtBQUNBcEssTUFBRUksUUFBRixFQUFZd0osT0FBWixDQUFvQixvQkFBcEIsRUFBMENnQixhQUFhUixhQUFiLEVBQTFDO0FBQ0F4RyxZQUFRQyxHQUFSLENBQVkrRyxhQUFhUixhQUFiLEVBQVo7QUFDRCxHQUpELEVBSUcsR0FKSDtBQU1ELENBekhELEVBeUhHOUgsTUF6SEgiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vL0FQSSA6QUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXG5jb25zdCBBdXRvY29tcGxldGVNYW5hZ2VyID0gKGZ1bmN0aW9uKCQpIHtcbiAgLy9Jbml0aWFsaXphdGlvbi4uLlxuXG4gIGNvbnN0IEFQSV9LRVkgPSBcIkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVwiO1xuXG4gIHJldHVybiAodGFyZ2V0KSA9PiB7XG5cbiAgICBjb25zdCB0YXJnZXRJdGVtID0gdHlwZW9mIHRhcmdldCA9PSBcInN0cmluZ1wiID8gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpIDogdGFyZ2V0O1xuICAgIGNvbnN0IHF1ZXJ5TWdyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgdmFyIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG5cbiAgICAkKHRhcmdldEl0ZW0pLnR5cGVhaGVhZCh7XG4gICAgICAgICAgICAgICAgaGludDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBoaWdobGlnaHQ6IHRydWUsXG4gICAgICAgICAgICAgICAgbWluTGVuZ3RoOiA0LFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgIG1lbnU6ICd0dC1kcm9wZG93bi1tZW51J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdzZWFyY2gtcmVzdWx0cycsXG4gICAgICAgICAgICAgICAgZGlzcGxheTogKGl0ZW0pID0+IGl0ZW0uZm9ybWF0dGVkX2FkZHJlc3MsXG4gICAgICAgICAgICAgICAgbGltaXQ6IDEwLFxuICAgICAgICAgICAgICAgIHNvdXJjZTogZnVuY3Rpb24gKHEsIHN5bmMsIGFzeW5jKXtcbiAgICAgICAgICAgICAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IHEgfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICAgIGFzeW5jKHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkub24oJ3R5cGVhaGVhZDpzZWxlY3RlZCcsIGZ1bmN0aW9uIChvYmosIGRhdHVtKSB7XG4gICAgICAgICAgICAgICAgaWYoZGF0dW0pXG4gICAgICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgICB2YXIgZ2VvbWV0cnkgPSBkYXR1bS5nZW9tZXRyeTtcbiAgICAgICAgICAgICAgICAgIHF1ZXJ5TWdyLnVwZGF0ZVZpZXdwb3J0KGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICAgICAgIC8vICBtYXAuZml0Qm91bmRzKGdlb21ldHJ5LmJvdW5kcz8gZ2VvbWV0cnkuYm91bmRzIDogZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG5cbiAgICByZXR1cm4ge1xuICAgICAgJHRhcmdldDogJCh0YXJnZXRJdGVtKSxcbiAgICAgIHRhcmdldDogdGFyZ2V0SXRlbVxuICAgIH1cbiAgfVxuXG59KGpRdWVyeSkpO1xuXG5jb25zdCBpbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2sgPSAoKSA9PiB7XG5cblxuICBBdXRvY29tcGxldGVNYW5hZ2VyKFwiaW5wdXRbbmFtZT0nc2VhcmNoLWxvY2F0aW9uJ11cIik7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBMYW5ndWFnZU1hbmFnZXIgPSAoKCQpID0+IHtcbiAgLy9rZXlWYWx1ZVxuXG4gIC8vdGFyZ2V0cyBhcmUgdGhlIG1hcHBpbmdzIGZvciB0aGUgbGFuZ3VhZ2VcbiAgcmV0dXJuICgpID0+IHtcbiAgICBsZXQgbGFuZ3VhZ2U7XG4gICAgbGV0IGRpY3Rpb25hcnkgPSB7fTtcbiAgICBsZXQgJHRhcmdldHMgPSAkKFwiW2RhdGEtbGFuZy10YXJnZXRdW2RhdGEtbGFuZy1rZXldXCIpO1xuXG4gICAgY29uc3QgdXBkYXRlUGFnZUxhbmd1YWdlID0gKCkgPT4ge1xuXG4gICAgICBsZXQgdGFyZ2V0TGFuZ3VhZ2UgPSBkaWN0aW9uYXJ5LnJvd3MuZmlsdGVyKChpKSA9PiBpLmxhbmcgPT09IGxhbmd1YWdlKVswXTtcblxuICAgICAgJHRhcmdldHMuZWFjaCgoaW5kZXgsIGl0ZW0pID0+IHtcbiAgICAgICAgbGV0IHRhcmdldEF0dHJpYnV0ZSA9ICQoaXRlbSkuZGF0YSgnbGFuZy10YXJnZXQnKTtcbiAgICAgICAgbGV0IGxhbmdUYXJnZXQgPSAkKGl0ZW0pLmRhdGEoJ2xhbmcta2V5Jyk7XG5cbiAgICAgICAgc3dpdGNoKHRhcmdldEF0dHJpYnV0ZSkge1xuICAgICAgICAgIGNhc2UgJ3RleHQnOlxuICAgICAgICAgICAgJChpdGVtKS50ZXh0KHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3ZhbHVlJzpcbiAgICAgICAgICAgICQoaXRlbSkudmFsKHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAkKGl0ZW0pLmF0dHIodGFyZ2V0QXR0cmlidXRlLCB0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGxhbmd1YWdlLFxuICAgICAgdGFyZ2V0czogJHRhcmdldHMsXG4gICAgICBkaWN0aW9uYXJ5LFxuICAgICAgaW5pdGlhbGl6ZTogKGxhbmcpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCIkdGFyZ2V0c1wiLCBsYW5nKTtcbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICB1cmw6ICdodHRwOi8vZ3N4Mmpzb24uY29tL2FwaT9pZD0xTzNlQnlqTDF2bFlmN1o3YW0tX2h0UlRRaTczUGFmcUlmTkJkTG1YZThTTSZzaGVldD0xJyxcbiAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICBkaWN0aW9uYXJ5ID0gZGF0YTtcbiAgICAgICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTGFuZ3VhZ2U6IChsYW5nKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiTmV3IExhbmcgOjo6IFwiLCBsYW5nKTtcbiAgICAgICAgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbn0pKGpRdWVyeSk7XG4iLCIvKiBUaGlzIGxvYWRzIGFuZCBtYW5hZ2VzIHRoZSBsaXN0ISAqL1xuXG5jb25zdCBMaXN0TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldExpc3QgPSBcIiNldmVudHMtbGlzdFwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRMaXN0ID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0TGlzdCkgOiB0YXJnZXRMaXN0O1xuXG4gICAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSkgPT4ge1xuXG4gICAgICB2YXIgZGF0ZSA9IG1vbWVudChpdGVtLnN0YXJ0X2RhdGV0aW1lKS5mb3JtYXQoXCJkZGRkIOKAoiBNTU0gREQgaDptbWFcIik7XG4gICAgICByZXR1cm4gYFxuICAgICAgPGxpIGNsYXNzPScke2l0ZW0uZXZlbnRfdHlwZSB8fCAnJ30gQWN0aW9uJyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50IHR5cGUtYWN0aW9uXCI+XG4gICAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgICAgPGxpPiR7aXRlbS5ldmVudF90eXBlfTwvbGk+XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICAgIDxoND4ke2RhdGV9PC9oND5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5SU1ZQPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIGNvbnN0IHJlbmRlckdyb3VwID0gKGl0ZW0pID0+IHtcblxuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaT5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXBcIj5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIi9cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlIHx8IGBHcm91cGB9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgICAgPHA+Q29sb3JhZG8sIFVTQTwvcD5cbiAgICAgICAgICAgIDxwPiR7aXRlbS5kZXRhaWxzIHx8IGAzNTAgQ29sb3JhZG8gaXMgd29ya2luZyBsb2NhbGx5IHRvIGhlbHAgYnVpbGQgdGhlIGdsb2JhbFxuICAgICAgICAgICAgICAgMzUwLm9yZyBtb3ZlbWVudCB0byBzb2x2ZSB0aGUgY2xpbWF0ZSBjcmlzaXMgYW5kIHRyYW5zaXRpb25cbiAgICAgICAgICAgICAgIHRvIGEgY2xlYW4sIHJlbmV3YWJsZSBlbmVyZ3kgZnV0dXJlLmB9XG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiLy8ke2l0ZW0udXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPkdldCBJbnZvbHZlZDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICAgYFxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgJGxpc3Q6ICR0YXJnZXQsXG4gICAgICB1cGRhdGVGaWx0ZXI6IChwKSA9PiB7XG4gICAgICAgIGlmKCFwKSByZXR1cm47XG5cbiAgICAgICAgLy8gUmVtb3ZlIEZpbHRlcnNcblxuICAgICAgICAkdGFyZ2V0LnJlbW92ZVByb3AoXCJjbGFzc1wiKTtcbiAgICAgICAgJHRhcmdldC5hZGRDbGFzcyhwLmZpbHRlciA/IHAuZmlsdGVyLmpvaW4oXCIgXCIpIDogJycpXG4gICAgICB9LFxuICAgICAgcG9wdWxhdGVMaXN0OiAoKSA9PiB7XG4gICAgICAgIC8vdXNpbmcgd2luZG93LkVWRU5UX0RBVEFcblxuICAgICAgICB2YXIgJGV2ZW50TGlzdCA9IHdpbmRvdy5FVkVOVFNfREFUQS5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGl0ZW0uZXZlbnRfdHlwZSAhPT0gJ0dyb3VwJyA/IHJlbmRlckV2ZW50KGl0ZW0pIDogcmVuZGVyR3JvdXAoaXRlbSk7XG4gICAgICAgIH0pXG4gICAgICAgICR0YXJnZXQuZmluZCgndWwgbGknKS5yZW1vdmUoKTtcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCcpLmFwcGVuZCgkZXZlbnRMaXN0KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiXG5jb25zdCBNYXBNYW5hZ2VyID0gKCgkKSA9PiB7XG5cbiAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSkgPT4ge1xuICAgIHZhciBkYXRlID0gbW9tZW50KGl0ZW0uc3RhcnRfZGF0ZXRpbWUpLmZvcm1hdChcImRkZGQg4oCiIE1NTSBERCBoOm1tYVwiKTtcbiAgICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9J3BvcHVwLWl0ZW0gJHtpdGVtLmV2ZW50X3R5cGV9JyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudFwiPlxuICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgPGxpPiR7aXRlbS5ldmVudF90eXBlIHx8ICdBY3Rpb24nfTwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxoMj48YSBocmVmPVwiLy8ke2l0ZW0udXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgIDxoND4ke2RhdGV9PC9oND5cbiAgICAgICAgPGRpdiBjbGFzcz1cImFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgIDxwPiR7aXRlbS52ZW51ZX08L3A+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiLy8ke2l0ZW0udXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPlJTVlA8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgYFxuICB9O1xuXG4gIGNvbnN0IHJlbmRlckdyb3VwID0gKGl0ZW0pID0+IHtcbiAgICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9J3BvcHVwLWl0ZW0gJHtpdGVtLmV2ZW50X3R5cGV9JyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ncm91cFwiPlxuICAgICAgICA8aDI+PGEgaHJlZj1cIi9cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlIHx8IGBHcm91cGB9PC9hPjwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICA8cD5Db2xvcmFkbywgVVNBPC9wPlxuICAgICAgICAgIDxwPiR7aXRlbS5kZXRhaWxzIHx8IGAzNTAgQ29sb3JhZG8gaXMgd29ya2luZyBsb2NhbGx5IHRvIGhlbHAgYnVpbGQgdGhlIGdsb2JhbFxuICAgICAgICAgICAgIDM1MC5vcmcgbW92ZW1lbnQgdG8gc29sdmUgdGhlIGNsaW1hdGUgY3Jpc2lzIGFuZCB0cmFuc2l0aW9uXG4gICAgICAgICAgICAgdG8gYSBjbGVhbiwgcmVuZXdhYmxlIGVuZXJneSBmdXR1cmUuYH1cbiAgICAgICAgICA8L3A+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiLy8ke2l0ZW0udXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPkdldCBJbnZvbHZlZDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR2VvanNvbiA9IChsaXN0KSA9PiB7XG4gICAgcmV0dXJuIGxpc3QubWFwKChpdGVtKSA9PiB7XG4gICAgICAvLyByZW5kZXJlZCBldmVudFR5cGVcbiAgICAgIGxldCByZW5kZXJlZDtcbiAgICAgIGlmICghaXRlbS5ldmVudF90eXBlIHx8ICFpdGVtLmV2ZW50X3R5cGUudG9Mb3dlckNhc2UoKSAhPT0gJ2dyb3VwJykge1xuICAgICAgICByZW5kZXJlZCA9IHJlbmRlckV2ZW50KGl0ZW0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVuZGVyZWQgPSByZW5kZXJHcm91cChpdGVtKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgIHR5cGU6IFwiUG9pbnRcIixcbiAgICAgICAgICBjb29yZGluYXRlczogW2l0ZW0ubG5nLCBpdGVtLmxhdF1cbiAgICAgICAgfSxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIGV2ZW50UHJvcGVydGllczogaXRlbSxcbiAgICAgICAgICBwb3B1cENvbnRlbnQ6IHJlbmRlcmVkXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuICgpID0+IHtcbiAgICB2YXIgbWFwID0gTC5tYXAoJ21hcCcpLnNldFZpZXcoWzM0Ljg4NTkzMDk0MDc1MzE3LCA1LjA5NzY1NjI1MDAwMDAwMV0sIDIpO1xuXG4gICAgTC50aWxlTGF5ZXIoJ2h0dHA6Ly97c30udGlsZS5vc20ub3JnL3t6fS97eH0ve3l9LnBuZycsIHtcbiAgICAgICAgYXR0cmlidXRpb246ICcmY29weTsgPGEgaHJlZj1cImh0dHA6Ly9vc20ub3JnL2NvcHlyaWdodFwiPk9wZW5TdHJlZXRNYXA8L2E+IGNvbnRyaWJ1dG9ycyDigKIgPGEgaHJlZj1cIi8vMzUwLm9yZ1wiPjM1MC5vcmc8L2E+J1xuICAgIH0pLmFkZFRvKG1hcCk7XG5cbiAgICAvLyBtYXAuZml0Qm91bmRzKFsgW1s0MC43MjE2MDE1MTk3MDg1LCAtNzMuODUxNzQ2OTgwMjkxNTJdLCBbNDAuNzI0Mjk5NDgwMjkxNSwgLTczLjg0OTA0OTAxOTcwODVdXSBdKTtcbiAgICByZXR1cm4ge1xuICAgICAgJG1hcDogbWFwLFxuICAgICAgc2V0Qm91bmRzOiAoYm91bmRzMSwgYm91bmRzMikgPT4ge1xuICAgICAgICBjb25zdCBib3VuZHMgPSBbYm91bmRzMSwgYm91bmRzMl07XG4gICAgICAgIG1hcC5maXRCb3VuZHMoYm91bmRzKTtcbiAgICAgIH0sXG4gICAgICBzZXRDZW50ZXI6IChjZW50ZXIsIHpvb20gPSAxMCkgPT4ge1xuICAgICAgICBpZiAoIWNlbnRlciB8fCAhY2VudGVyWzBdIHx8IGNlbnRlclswXSA9PSBcIlwiXG4gICAgICAgICAgICAgIHx8ICFjZW50ZXJbMV0gfHwgY2VudGVyWzFdID09IFwiXCIpIHJldHVybjtcbiAgICAgICAgbWFwLnNldFZpZXcoY2VudGVyLCB6b29tKTtcbiAgICAgIH0sXG4gICAgICBmaWx0ZXJNYXA6IChmaWx0ZXJzKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZmlsdGVycyA+PiBcIiwgZmlsdGVycyk7XG4gICAgICAgICQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cFwiKS5oaWRlKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cFwiKSk7XG5cbiAgICAgICAgaWYgKCFmaWx0ZXJzKSByZXR1cm47XG5cbiAgICAgICAgZmlsdGVycy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCIuZXZlbnQtaXRlbS1wb3B1cC5cIiArIGl0ZW0udG9Mb3dlckNhc2UoKSk7XG4gICAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwLlwiICsgaXRlbS50b0xvd2VyQ2FzZSgpKS5zaG93KCk7XG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgcGxvdFBvaW50czogKGxpc3QpID0+IHtcblxuICAgICAgICBjb25zdCBnZW9qc29uID0ge1xuICAgICAgICAgIHR5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgICAgICAgICBmZWF0dXJlczogcmVuZGVyR2VvanNvbihsaXN0KVxuICAgICAgICB9O1xuXG5cblxuICAgICAgICBMLmdlb0pTT04oZ2VvanNvbiwge1xuICAgICAgICAgICAgcG9pbnRUb0xheWVyOiAoZmVhdHVyZSwgbGF0bG5nKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuZXZlbnRfdHlwZTtcbiAgICAgICAgICAgICAgdmFyIGdlb2pzb25NYXJrZXJPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgICAgcmFkaXVzOiA4LFxuICAgICAgICAgICAgICAgICAgZmlsbENvbG9yOiAgZXZlbnRUeXBlID09PSAnR3JvdXAnID8gXCIjNDBEN0Q0XCIgOiBcIiMwRjgxRThcIixcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiBcIndoaXRlXCIsXG4gICAgICAgICAgICAgICAgICB3ZWlnaHQ6IDIsXG4gICAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLjUsXG4gICAgICAgICAgICAgICAgICBmaWxsT3BhY2l0eTogMC44LFxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAoZXZlbnRUeXBlID09PSAnR3JvdXAnID8gJ2dyb3VwcycgOiAnZXZlbnRzJykgKyAnIGV2ZW50LWl0ZW0tcG9wdXAnXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJldHVybiBMLmNpcmNsZU1hcmtlcihsYXRsbmcsIGdlb2pzb25NYXJrZXJPcHRpb25zKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICBvbkVhY2hGZWF0dXJlOiAoZmVhdHVyZSwgbGF5ZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChmZWF0dXJlLnByb3BlcnRpZXMgJiYgZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCkge1xuICAgICAgICAgICAgICBsYXllci5iaW5kUG9wdXAoZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgICB9LFxuICAgICAgdXBkYXRlOiAocCkgPT4ge1xuICAgICAgICBpZiAoIXAgfHwgIXAubGF0IHx8ICFwLmxuZyApIHJldHVybjtcblxuICAgICAgICBtYXAuc2V0VmlldyhMLmxhdExuZyhwLmxhdCwgcC5sbmcpLCAxMCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsImNvbnN0IFF1ZXJ5TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldEZvcm0gPSBcImZvcm0jZmlsdGVycy1mb3JtXCIpID0+IHtcbiAgICBjb25zdCAkdGFyZ2V0ID0gdHlwZW9mIHRhcmdldEZvcm0gPT09ICdzdHJpbmcnID8gJCh0YXJnZXRGb3JtKSA6IHRhcmdldEZvcm07XG4gICAgbGV0IGxhdCA9IG51bGw7XG4gICAgbGV0IGxuZyA9IG51bGw7XG5cbiAgICBsZXQgcHJldmlvdXMgPSB7fTtcblxuICAgICR0YXJnZXQub24oJ3N1Ym1pdCcsIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBsYXQgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKCk7XG4gICAgICBsbmcgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKCk7XG5cbiAgICAgIHZhciBmb3JtID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuICAgICAgZGVsZXRlIGZvcm1bJ3NlYXJjaC1sb2NhdGlvbiddO1xuXG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICQucGFyYW0oZm9ybSk7XG4gICAgfSlcblxuICAgICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdJywgKCkgPT4ge1xuICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICB9KVxuXG5cbiAgICByZXR1cm4ge1xuICAgICAgaW5pdGlhbGl6ZTogKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdmFyIHBhcmFtcyA9ICQuZGVwYXJhbSh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkpXG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYW5nXVwiKS52YWwocGFyYW1zLmxhbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwocGFyYW1zLmxhdCk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChwYXJhbXMubG5nKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKHBhcmFtcy5ib3VuZDEpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwocGFyYW1zLmJvdW5kMik7XG5cbiAgICAgICAgICBpZiAocGFyYW1zLmZpbHRlcikge1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdXCIpLnJlbW92ZVByb3AoXCJjaGVja2VkXCIpO1xuICAgICAgICAgICAgcGFyYW1zLmZpbHRlci5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF1bdmFsdWU9J1wiICsgaXRlbSArIFwiJ11cIikucHJvcChcImNoZWNrZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGdldFBhcmFtZXRlcnM6ICgpID0+IHtcbiAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG4gICAgICAgIGRlbGV0ZSBwYXJhbWV0ZXJzWydzZWFyY2gtbG9jYXRpb24nXTtcblxuICAgICAgICByZXR1cm4gcGFyYW1ldGVycztcbiAgICAgIH0sXG4gICAgICB1cGRhdGVMb2NhdGlvbjogKGxhdCwgbG5nKSA9PiB7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwobGF0KTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChsbmcpO1xuICAgICAgICAvLyAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZVZpZXdwb3J0OiAodmlld3BvcnQpID0+IHtcblxuICAgICAgICBjb25zdCBib3VuZHMgPSBbW3ZpZXdwb3J0LmYuYiwgdmlld3BvcnQuYi5iXSwgW3ZpZXdwb3J0LmYuZiwgdmlld3BvcnQuYi5mXV07XG5cbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMF0pKTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMV0pKTtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyU3VibWl0OiAoKSA9PiB7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59KShqUXVlcnkpO1xuIiwiKGZ1bmN0aW9uKCQpIHtcblxuICAvLyAxLiBnb29nbGUgbWFwcyBnZW9jb2RlXG5cbiAgLy8gMi4gZm9jdXMgbWFwIG9uIGdlb2NvZGUgKHZpYSBsYXQvbG5nKVxuICBjb25zdCBxdWVyeU1hbmFnZXIgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICAgICAgcXVlcnlNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICBjb25zdCBpbml0UGFyYW1zID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcbiAgY29uc3QgbWFwTWFuYWdlciA9IE1hcE1hbmFnZXIoKTtcblxuICBjb25zdCBsYW5ndWFnZU1hbmFnZXIgPSBMYW5ndWFnZU1hbmFnZXIoKTtcbiAgY29uc29sZS5sb2cocXVlcnlNYW5hZ2VyLCBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpLCBpbml0UGFyYW1zKTtcbiAgbGFuZ3VhZ2VNYW5hZ2VyLmluaXRpYWxpemUoaW5pdFBhcmFtc1snbGFuZyddIHx8ICdlbicpO1xuXG4gIGNvbnN0IGxpc3RNYW5hZ2VyID0gTGlzdE1hbmFnZXIoKTtcblxuICBpZihpbml0UGFyYW1zLmxhdCAmJiBpbml0UGFyYW1zLmxuZykge1xuICAgIG1hcE1hbmFnZXIuc2V0Q2VudGVyKFtpbml0UGFyYW1zLmxhdCwgaW5pdFBhcmFtcy5sbmddKTtcbiAgfVxuXG4gIC8qKipcbiAgKiBMaXN0IEV2ZW50c1xuICAqIFRoaXMgd2lsbCB0cmlnZ2VyIHRoZSBsaXN0IHVwZGF0ZSBtZXRob2RcbiAgKi9cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICBsaXN0TWFuYWdlci5wb3B1bGF0ZUxpc3QoKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG5cbiAgICBsaXN0TWFuYWdlci51cGRhdGVGaWx0ZXIob3B0aW9ucyk7XG4gIH0pXG5cbiAgLyoqKlxuICAqIE1hcCBFdmVudHNcbiAgKi9cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIC8vIG1hcE1hbmFnZXIuc2V0Q2VudGVyKFtvcHRpb25zLmxhdCwgb3B0aW9ucy5sbmddKTtcbiAgICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMuYm91bmQxIHx8ICFvcHRpb25zLmJvdW5kMikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBib3VuZDEgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQxKTtcbiAgICB2YXIgYm91bmQyID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMik7XG4gICAgbWFwTWFuYWdlci5zZXRCb3VuZHMoYm91bmQxLCBib3VuZDIpO1xuICAgIC8vIGNvbnNvbGUubG9nKG9wdGlvbnMpXG4gIH0pO1xuICAvLyAzLiBtYXJrZXJzIG9uIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtcGxvdCcsIChlLCBvcHQpID0+IHtcbiAgICBtYXBNYW5hZ2VyLnBsb3RQb2ludHMob3B0LmRhdGEpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicpO1xuICB9KVxuXG4gIC8vIEZpbHRlciBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLWZpbHRlcicsIChlLCBvcHQpID0+IHtcbiAgICBpZiAob3B0KSB7XG4gICAgICBtYXBNYW5hZ2VyLmZpbHRlck1hcChvcHQuZmlsdGVyKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZScsIChlLCBvcHQpID0+IHtcbiAgICBpZiAob3B0KSB7XG4gICAgICBsYW5ndWFnZU1hbmFnZXIudXBkYXRlTGFuZ3VhZ2Uob3B0LmxhbmcpO1xuICAgIH1cbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKFwiaGFzaGNoYW5nZVwiLCAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgaWYgKGhhc2gubGVuZ3RoID09IDApIHJldHVybjtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKGhhc2guc3Vic3RyaW5nKDEpKTtcbiAgICBjb25zdCBvbGRVUkwgPSBldmVudC5vcmlnaW5hbEV2ZW50Lm9sZFVSTDtcblxuXG4gICAgY29uc3Qgb2xkSGFzaCA9ICQuZGVwYXJhbShvbGRVUkwuc3Vic3RyaW5nKG9sZFVSTC5zZWFyY2goXCIjXCIpKzEpKTtcblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJywgcGFyYW1ldGVycyk7XG5cbiAgICAvLyBTbyB0aGF0IGNoYW5nZSBpbiBmaWx0ZXJzIHdpbGwgbm90IHVwZGF0ZSB0aGlzXG4gICAgaWYgKG9sZEhhc2guYm91bmQxICE9PSBwYXJhbWV0ZXJzLmJvdW5kMSB8fCBvbGRIYXNoLmJvdW5kMiAhPT0gcGFyYW1ldGVycy5ib3VuZDIpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgIH1cblxuICAgIC8vIENoYW5nZSBpdGVtc1xuICAgIGlmIChvbGRIYXNoLmxhbmcgIT09IHBhcmFtZXRlcnMubGFuZykge1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sYW5ndWFnZS11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG4gIH0pXG5cbiAgLy8gNC4gZmlsdGVyIG91dCBpdGVtcyBpbiBhY3Rpdml0eS1hcmVhXG5cbiAgLy8gNS4gZ2V0IG1hcCBlbGVtZW50c1xuXG4gIC8vIDYuIGdldCBHcm91cCBkYXRhXG5cbiAgLy8gNy4gcHJlc2VudCBncm91cCBlbGVtZW50c1xuXG4gICQuYWpheCh7XG4gICAgdXJsOiAnaHR0cHM6Ly9zMy11cy13ZXN0LTIuYW1hem9uYXdzLmNvbS9wcGxzbWFwLWRhdGEvb3V0cHV0LzM1MG9yZy10ZXN0LmpzLmd6JywgLy8nfCoqREFUQV9TT1VSQ0UqKnwnLFxuICAgIGRhdGFUeXBlOiAnc2NyaXB0JyxcbiAgICBjYWNoZTogdHJ1ZSxcbiAgICBzdWNjZXNzOiAoZGF0YSkgPT4ge1xuICAgICAgdmFyIHBhcmFtZXRlcnMgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuXG4gICAgICB3aW5kb3cuRVZFTlRTX0RBVEEuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICBpdGVtWydldmVudF90eXBlJ10gPSAhaXRlbS5ldmVudF90eXBlID8gJ0FjdGlvbicgOiBpdGVtLmV2ZW50X3R5cGU7XG4gICAgICB9KVxuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LXVwZGF0ZScpO1xuICAgICAgLy8gJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXBsb3QnLCB7IGRhdGE6IHdpbmRvdy5FVkVOVFNfREFUQSB9KTtcbiAgICAgIC8vVE9ETzogTWFrZSB0aGUgZ2VvanNvbiBjb252ZXJzaW9uIGhhcHBlbiBvbiB0aGUgYmFja2VuZFxuICAgIH1cbiAgfSk7XG5cbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpKTtcbiAgICBjb25zb2xlLmxvZyhxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpKVxuICB9LCAxMDApO1xuXG59KShqUXVlcnkpO1xuIl19
