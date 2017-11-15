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

  $(document).on('click', 'button#show-hide-map', function (e, opt) {
    $('body').toggleClass('map-view');
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9sYW5ndWFnZS5qcyIsImNsYXNzZXMvbGlzdC5qcyIsImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9xdWVyeS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJBdXRvY29tcGxldGVNYW5hZ2VyIiwiJCIsIkFQSV9LRVkiLCJ0YXJnZXQiLCJ0YXJnZXRJdGVtIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwicXVlcnlNZ3IiLCJRdWVyeU1hbmFnZXIiLCJnZW9jb2RlciIsImdvb2dsZSIsIm1hcHMiLCJHZW9jb2RlciIsInR5cGVhaGVhZCIsImhpbnQiLCJoaWdobGlnaHQiLCJtaW5MZW5ndGgiLCJjbGFzc05hbWVzIiwibWVudSIsIm5hbWUiLCJkaXNwbGF5IiwiaXRlbSIsImZvcm1hdHRlZF9hZGRyZXNzIiwibGltaXQiLCJzb3VyY2UiLCJxIiwic3luYyIsImFzeW5jIiwiZ2VvY29kZSIsImFkZHJlc3MiLCJyZXN1bHRzIiwic3RhdHVzIiwib24iLCJvYmoiLCJkYXR1bSIsImdlb21ldHJ5IiwidXBkYXRlVmlld3BvcnQiLCJ2aWV3cG9ydCIsIiR0YXJnZXQiLCJqUXVlcnkiLCJpbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2siLCJMYW5ndWFnZU1hbmFnZXIiLCJsYW5ndWFnZSIsImRpY3Rpb25hcnkiLCIkdGFyZ2V0cyIsInVwZGF0ZVBhZ2VMYW5ndWFnZSIsInRhcmdldExhbmd1YWdlIiwicm93cyIsImZpbHRlciIsImkiLCJsYW5nIiwiZWFjaCIsImluZGV4IiwidGFyZ2V0QXR0cmlidXRlIiwiZGF0YSIsImxhbmdUYXJnZXQiLCJ0ZXh0IiwidmFsIiwiYXR0ciIsInRhcmdldHMiLCJpbml0aWFsaXplIiwiY29uc29sZSIsImxvZyIsImFqYXgiLCJ1cmwiLCJkYXRhVHlwZSIsInN1Y2Nlc3MiLCJ1cGRhdGVMYW5ndWFnZSIsIkxpc3RNYW5hZ2VyIiwidGFyZ2V0TGlzdCIsInJlbmRlckV2ZW50IiwiZGF0ZSIsIm1vbWVudCIsInN0YXJ0X2RhdGV0aW1lIiwiZm9ybWF0IiwiZXZlbnRfdHlwZSIsImxhdCIsImxuZyIsInRpdGxlIiwidmVudWUiLCJyZW5kZXJHcm91cCIsImRldGFpbHMiLCIkbGlzdCIsInVwZGF0ZUZpbHRlciIsInAiLCJyZW1vdmVQcm9wIiwiYWRkQ2xhc3MiLCJqb2luIiwicG9wdWxhdGVMaXN0IiwiJGV2ZW50TGlzdCIsIndpbmRvdyIsIkVWRU5UU19EQVRBIiwibWFwIiwiZmluZCIsInJlbW92ZSIsImFwcGVuZCIsIk1hcE1hbmFnZXIiLCJyZW5kZXJHZW9qc29uIiwibGlzdCIsInJlbmRlcmVkIiwidG9Mb3dlckNhc2UiLCJ0eXBlIiwiY29vcmRpbmF0ZXMiLCJwcm9wZXJ0aWVzIiwiZXZlbnRQcm9wZXJ0aWVzIiwicG9wdXBDb250ZW50IiwiTCIsInNldFZpZXciLCJ0aWxlTGF5ZXIiLCJhdHRyaWJ1dGlvbiIsImFkZFRvIiwiJG1hcCIsInNldEJvdW5kcyIsImJvdW5kczEiLCJib3VuZHMyIiwiYm91bmRzIiwiZml0Qm91bmRzIiwic2V0Q2VudGVyIiwiY2VudGVyIiwiem9vbSIsImZpbHRlck1hcCIsImZpbHRlcnMiLCJoaWRlIiwiZm9yRWFjaCIsInNob3ciLCJwbG90UG9pbnRzIiwiZ2VvanNvbiIsImZlYXR1cmVzIiwiZ2VvSlNPTiIsInBvaW50VG9MYXllciIsImZlYXR1cmUiLCJsYXRsbmciLCJldmVudFR5cGUiLCJnZW9qc29uTWFya2VyT3B0aW9ucyIsInJhZGl1cyIsImZpbGxDb2xvciIsImNvbG9yIiwid2VpZ2h0Iiwib3BhY2l0eSIsImZpbGxPcGFjaXR5IiwiY2xhc3NOYW1lIiwiY2lyY2xlTWFya2VyIiwib25FYWNoRmVhdHVyZSIsImxheWVyIiwiYmluZFBvcHVwIiwidXBkYXRlIiwibGF0TG5nIiwidGFyZ2V0Rm9ybSIsInByZXZpb3VzIiwiZSIsInByZXZlbnREZWZhdWx0IiwiZm9ybSIsImRlcGFyYW0iLCJzZXJpYWxpemUiLCJsb2NhdGlvbiIsImhhc2giLCJwYXJhbSIsInRyaWdnZXIiLCJjYWxsYmFjayIsImxlbmd0aCIsInBhcmFtcyIsInN1YnN0cmluZyIsImJvdW5kMSIsImJvdW5kMiIsInByb3AiLCJnZXRQYXJhbWV0ZXJzIiwicGFyYW1ldGVycyIsInVwZGF0ZUxvY2F0aW9uIiwiZiIsImIiLCJKU09OIiwic3RyaW5naWZ5IiwidHJpZ2dlclN1Ym1pdCIsInF1ZXJ5TWFuYWdlciIsImluaXRQYXJhbXMiLCJtYXBNYW5hZ2VyIiwibGFuZ3VhZ2VNYW5hZ2VyIiwibGlzdE1hbmFnZXIiLCJldmVudCIsIm9wdGlvbnMiLCJwYXJzZSIsIm9wdCIsInRvZ2dsZUNsYXNzIiwib2xkVVJMIiwib3JpZ2luYWxFdmVudCIsIm9sZEhhc2giLCJzZWFyY2giLCJjYWNoZSIsInNldFRpbWVvdXQiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7O0FBQ0EsSUFBTUEsc0JBQXVCLFVBQVNDLENBQVQsRUFBWTtBQUN2Qzs7QUFFQSxNQUFNQyxVQUFVLHlDQUFoQjs7QUFFQSxTQUFPLFVBQUNDLE1BQUQsRUFBWTs7QUFFakIsUUFBTUMsYUFBYSxPQUFPRCxNQUFQLElBQWlCLFFBQWpCLEdBQTRCRSxTQUFTQyxhQUFULENBQXVCSCxNQUF2QixDQUE1QixHQUE2REEsTUFBaEY7QUFDQSxRQUFNSSxXQUFXQyxjQUFqQjtBQUNBLFFBQUlDLFdBQVcsSUFBSUMsT0FBT0MsSUFBUCxDQUFZQyxRQUFoQixFQUFmOztBQUVBWCxNQUFFRyxVQUFGLEVBQWNTLFNBQWQsQ0FBd0I7QUFDWkMsWUFBTSxJQURNO0FBRVpDLGlCQUFXLElBRkM7QUFHWkMsaUJBQVcsQ0FIQztBQUlaQyxrQkFBWTtBQUNWQyxjQUFNO0FBREk7QUFKQSxLQUF4QixFQVFVO0FBQ0VDLFlBQU0sZ0JBRFI7QUFFRUMsZUFBUyxpQkFBQ0MsSUFBRDtBQUFBLGVBQVVBLEtBQUtDLGlCQUFmO0FBQUEsT0FGWDtBQUdFQyxhQUFPLEVBSFQ7QUFJRUMsY0FBUSxnQkFBVUMsQ0FBVixFQUFhQyxJQUFi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LEVBQStDUyxVQUEvQztBQUNEO0FBQ0YsR0FyQkQ7O0FBdUJBOztBQUVBOztBQUVBOztBQUVBOztBQUVBckssSUFBRThELElBQUYsQ0FBTztBQUNMQyxTQUFLLDBFQURBLEVBQzRFO0FBQ2pGQyxjQUFVLFFBRkw7QUFHTDBILFdBQU8sSUFIRjtBQUlMekgsYUFBUyxpQkFBQ1osSUFBRCxFQUFVO0FBQ2pCLFVBQUlnSCxhQUFhTyxhQUFhUixhQUFiLEVBQWpCOztBQUVBM0UsYUFBT0MsV0FBUCxDQUFtQmdDLE9BQW5CLENBQTJCLFVBQUN0RyxJQUFELEVBQVU7QUFDbkNBLGFBQUssWUFBTCxJQUFxQixDQUFDQSxLQUFLc0QsVUFBTixHQUFtQixRQUFuQixHQUE4QnRELEtBQUtzRCxVQUF4RDtBQUNELE9BRkQ7QUFHQTFFLFFBQUVJLFFBQUYsRUFBWXdKLE9BQVosQ0FBb0IscUJBQXBCO0FBQ0E7QUFDQTVKLFFBQUVJLFFBQUYsRUFBWXdKLE9BQVosQ0FBb0Isa0JBQXBCLEVBQXdDLEVBQUV2RyxNQUFNb0MsT0FBT0MsV0FBZixFQUF4QztBQUNBO0FBQ0Q7QUFkSSxHQUFQOztBQWlCQWlHLGFBQVcsWUFBTTtBQUNmM0wsTUFBRUksUUFBRixFQUFZd0osT0FBWixDQUFvQiw0QkFBcEIsRUFBa0RnQixhQUFhUixhQUFiLEVBQWxEO0FBQ0FwSyxNQUFFSSxRQUFGLEVBQVl3SixPQUFaLENBQW9CLG9CQUFwQixFQUEwQ2dCLGFBQWFSLGFBQWIsRUFBMUM7QUFDQXhHLFlBQVFDLEdBQVIsQ0FBWStHLGFBQWFSLGFBQWIsRUFBWjtBQUNELEdBSkQsRUFJRyxHQUpIO0FBTUQsQ0E3SEQsRUE2SEc5SCxNQTdISCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbi8vQVBJIDpBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cbmNvbnN0IEF1dG9jb21wbGV0ZU1hbmFnZXIgPSAoZnVuY3Rpb24oJCkge1xuICAvL0luaXRpYWxpemF0aW9uLi4uXG5cbiAgY29uc3QgQVBJX0tFWSA9IFwiQUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXCI7XG5cbiAgcmV0dXJuICh0YXJnZXQpID0+IHtcblxuICAgIGNvbnN0IHRhcmdldEl0ZW0gPSB0eXBlb2YgdGFyZ2V0ID09IFwic3RyaW5nXCIgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCkgOiB0YXJnZXQ7XG4gICAgY29uc3QgcXVlcnlNZ3IgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICB2YXIgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcblxuICAgICQodGFyZ2V0SXRlbSkudHlwZWFoZWFkKHtcbiAgICAgICAgICAgICAgICBoaW50OiB0cnVlLFxuICAgICAgICAgICAgICAgIGhpZ2hsaWdodDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBtaW5MZW5ndGg6IDQsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lczoge1xuICAgICAgICAgICAgICAgICAgbWVudTogJ3R0LWRyb3Bkb3duLW1lbnUnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ3NlYXJjaC1yZXN1bHRzJyxcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAoaXRlbSkgPT4gaXRlbS5mb3JtYXR0ZWRfYWRkcmVzcyxcbiAgICAgICAgICAgICAgICBsaW1pdDogMTAsXG4gICAgICAgICAgICAgICAgc291cmNlOiBmdW5jdGlvbiAocSwgc3luYywgYXN5bmMpe1xuICAgICAgICAgICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogcSB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgYXN5bmMocmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKS5vbigndHlwZWFoZWFkOnNlbGVjdGVkJywgZnVuY3Rpb24gKG9iaiwgZGF0dW0pIHtcbiAgICAgICAgICAgICAgICBpZihkYXR1bSlcbiAgICAgICAgICAgICAgICB7XG5cbiAgICAgICAgICAgICAgICAgIHZhciBnZW9tZXRyeSA9IGRhdHVtLmdlb21ldHJ5O1xuICAgICAgICAgICAgICAgICAgcXVlcnlNZ3IudXBkYXRlVmlld3BvcnQoZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgLy8gIG1hcC5maXRCb3VuZHMoZ2VvbWV0cnkuYm91bmRzPyBnZW9tZXRyeS5ib3VuZHMgOiBnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cblxuICAgIHJldHVybiB7XG4gICAgICAkdGFyZ2V0OiAkKHRhcmdldEl0ZW0pLFxuICAgICAgdGFyZ2V0OiB0YXJnZXRJdGVtXG4gICAgfVxuICB9XG5cbn0oalF1ZXJ5KSk7XG5cbmNvbnN0IGluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayA9ICgpID0+IHtcblxuXG4gIEF1dG9jb21wbGV0ZU1hbmFnZXIoXCJpbnB1dFtuYW1lPSdzZWFyY2gtbG9jYXRpb24nXVwiKTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IExhbmd1YWdlTWFuYWdlciA9ICgoJCkgPT4ge1xuICAvL2tleVZhbHVlXG5cbiAgLy90YXJnZXRzIGFyZSB0aGUgbWFwcGluZ3MgZm9yIHRoZSBsYW5ndWFnZVxuICByZXR1cm4gKCkgPT4ge1xuICAgIGxldCBsYW5ndWFnZTtcbiAgICBsZXQgZGljdGlvbmFyeSA9IHt9O1xuICAgIGxldCAkdGFyZ2V0cyA9ICQoXCJbZGF0YS1sYW5nLXRhcmdldF1bZGF0YS1sYW5nLWtleV1cIik7XG5cbiAgICBjb25zdCB1cGRhdGVQYWdlTGFuZ3VhZ2UgPSAoKSA9PiB7XG5cbiAgICAgIGxldCB0YXJnZXRMYW5ndWFnZSA9IGRpY3Rpb25hcnkucm93cy5maWx0ZXIoKGkpID0+IGkubGFuZyA9PT0gbGFuZ3VhZ2UpWzBdO1xuXG4gICAgICAkdGFyZ2V0cy5lYWNoKChpbmRleCwgaXRlbSkgPT4ge1xuICAgICAgICBsZXQgdGFyZ2V0QXR0cmlidXRlID0gJChpdGVtKS5kYXRhKCdsYW5nLXRhcmdldCcpO1xuICAgICAgICBsZXQgbGFuZ1RhcmdldCA9ICQoaXRlbSkuZGF0YSgnbGFuZy1rZXknKTtcblxuICAgICAgICBzd2l0Y2godGFyZ2V0QXR0cmlidXRlKSB7XG4gICAgICAgICAgY2FzZSAndGV4dCc6XG4gICAgICAgICAgICAkKGl0ZW0pLnRleHQodGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAndmFsdWUnOlxuICAgICAgICAgICAgJChpdGVtKS52YWwodGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICQoaXRlbSkuYXR0cih0YXJnZXRBdHRyaWJ1dGUsIHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgbGFuZ3VhZ2UsXG4gICAgICB0YXJnZXRzOiAkdGFyZ2V0cyxcbiAgICAgIGRpY3Rpb25hcnksXG4gICAgICBpbml0aWFsaXplOiAobGFuZykgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcIiR0YXJnZXRzXCIsIGxhbmcpO1xuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgIHVybDogJ2h0dHA6Ly9nc3gyanNvbi5jb20vYXBpP2lkPTFPM2VCeWpMMXZsWWY3WjdhbS1faHRSVFFpNzNQYWZxSWZOQmRMbVhlOFNNJnNoZWV0PTEnLFxuICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgc3VjY2VzczogKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGRpY3Rpb25hcnkgPSBkYXRhO1xuICAgICAgICAgICAgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgICAgICAgICAgdXBkYXRlUGFnZUxhbmd1YWdlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVMYW5ndWFnZTogKGxhbmcpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJOZXcgTGFuZyA6OjogXCIsIGxhbmcpO1xuICAgICAgICBsYW5ndWFnZSA9IGxhbmc7XG4gICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxufSkoalF1ZXJ5KTtcbiIsIi8qIFRoaXMgbG9hZHMgYW5kIG1hbmFnZXMgdGhlIGxpc3QhICovXG5cbmNvbnN0IExpc3RNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIHJldHVybiAodGFyZ2V0TGlzdCA9IFwiI2V2ZW50cy1saXN0XCIpID0+IHtcbiAgICBjb25zdCAkdGFyZ2V0ID0gdHlwZW9mIHRhcmdldExpc3QgPT09ICdzdHJpbmcnID8gJCh0YXJnZXRMaXN0KSA6IHRhcmdldExpc3Q7XG5cbiAgICBjb25zdCByZW5kZXJFdmVudCA9IChpdGVtKSA9PiB7XG5cbiAgICAgIHZhciBkYXRlID0gbW9tZW50KGl0ZW0uc3RhcnRfZGF0ZXRpbWUpLmZvcm1hdChcImRkZGQg4oCiIE1NTSBERCBoOm1tYVwiKTtcbiAgICAgIHJldHVybiBgXG4gICAgICA8bGkgY2xhc3M9JyR7aXRlbS5ldmVudF90eXBlIHx8ICcnfSBBY3Rpb24nIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnQgdHlwZS1hY3Rpb25cIj5cbiAgICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgICA8bGk+JHtpdGVtLmV2ZW50X3R5cGV9PC9saT5cbiAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDxoMj48YSBocmVmPVwiLy8ke2l0ZW0udXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgICAgPGg0PiR7ZGF0ZX08L2g0PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICAgIDxwPiR7aXRlbS52ZW51ZX08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiLy8ke2l0ZW0udXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPlJTVlA8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSkgPT4ge1xuXG4gICAgICByZXR1cm4gYFxuICAgICAgPGxpPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ncm91cFwiPlxuICAgICAgICAgIDxoMj48YSBocmVmPVwiL1wiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGUgfHwgYEdyb3VwYH08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgICA8cD5Db2xvcmFkbywgVVNBPC9wPlxuICAgICAgICAgICAgPHA+JHtpdGVtLmRldGFpbHMgfHwgYDM1MCBDb2xvcmFkbyBpcyB3b3JraW5nIGxvY2FsbHkgdG8gaGVscCBidWlsZCB0aGUgZ2xvYmFsXG4gICAgICAgICAgICAgICAzNTAub3JnIG1vdmVtZW50IHRvIHNvbHZlIHRoZSBjbGltYXRlIGNyaXNpcyBhbmQgdHJhbnNpdGlvblxuICAgICAgICAgICAgICAgdG8gYSBjbGVhbiwgcmVuZXdhYmxlIGVuZXJneSBmdXR1cmUuYH1cbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCI+R2V0IEludm9sdmVkPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAkbGlzdDogJHRhcmdldCxcbiAgICAgIHVwZGF0ZUZpbHRlcjogKHApID0+IHtcbiAgICAgICAgaWYoIXApIHJldHVybjtcblxuICAgICAgICAvLyBSZW1vdmUgRmlsdGVyc1xuXG4gICAgICAgICR0YXJnZXQucmVtb3ZlUHJvcChcImNsYXNzXCIpO1xuICAgICAgICAkdGFyZ2V0LmFkZENsYXNzKHAuZmlsdGVyID8gcC5maWx0ZXIuam9pbihcIiBcIikgOiAnJylcbiAgICAgIH0sXG4gICAgICBwb3B1bGF0ZUxpc3Q6ICgpID0+IHtcbiAgICAgICAgLy91c2luZyB3aW5kb3cuRVZFTlRfREFUQVxuXG4gICAgICAgIHZhciAkZXZlbnRMaXN0ID0gd2luZG93LkVWRU5UU19EQVRBLm1hcChpdGVtID0+IHtcbiAgICAgICAgICByZXR1cm4gaXRlbS5ldmVudF90eXBlICE9PSAnR3JvdXAnID8gcmVuZGVyRXZlbnQoaXRlbSkgOiByZW5kZXJHcm91cChpdGVtKTtcbiAgICAgICAgfSlcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCBsaScpLnJlbW92ZSgpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsJykuYXBwZW5kKCRldmVudExpc3QpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJcbmNvbnN0IE1hcE1hbmFnZXIgPSAoKCQpID0+IHtcblxuICBjb25zdCByZW5kZXJFdmVudCA9IChpdGVtKSA9PiB7XG4gICAgdmFyIGRhdGUgPSBtb21lbnQoaXRlbS5zdGFydF9kYXRldGltZSkuZm9ybWF0KFwiZGRkZCDigKIgTU1NIEREIGg6bW1hXCIpO1xuICAgIHJldHVybiBgXG4gICAgPGRpdiBjbGFzcz0ncG9wdXAtaXRlbSAke2l0ZW0uZXZlbnRfdHlwZX0nIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGk+JHtpdGVtLmV2ZW50X3R5cGUgfHwgJ0FjdGlvbid9PC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPGgyPjxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZX08L2E+PC9oMj5cbiAgICAgICAgPGg0PiR7ZGF0ZX08L2g0PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgPHA+JHtpdGVtLnZlbnVlfTwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgIDxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCI+UlNWUDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSkgPT4ge1xuICAgIHJldHVybiBgXG4gICAgPGRpdiBjbGFzcz0ncG9wdXAtaXRlbSAke2l0ZW0uZXZlbnRfdHlwZX0nIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwXCI+XG4gICAgICAgIDxoMj48YSBocmVmPVwiL1wiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGUgfHwgYEdyb3VwYH08L2E+PC9oMj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgIDxwPkNvbG9yYWRvLCBVU0E8L3A+XG4gICAgICAgICAgPHA+JHtpdGVtLmRldGFpbHMgfHwgYDM1MCBDb2xvcmFkbyBpcyB3b3JraW5nIGxvY2FsbHkgdG8gaGVscCBidWlsZCB0aGUgZ2xvYmFsXG4gICAgICAgICAgICAgMzUwLm9yZyBtb3ZlbWVudCB0byBzb2x2ZSB0aGUgY2xpbWF0ZSBjcmlzaXMgYW5kIHRyYW5zaXRpb25cbiAgICAgICAgICAgICB0byBhIGNsZWFuLCByZW5ld2FibGUgZW5lcmd5IGZ1dHVyZS5gfVxuICAgICAgICAgIDwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgIDxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCI+R2V0IEludm9sdmVkPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICAgIGBcbiAgfTtcblxuICBjb25zdCByZW5kZXJHZW9qc29uID0gKGxpc3QpID0+IHtcbiAgICByZXR1cm4gbGlzdC5tYXAoKGl0ZW0pID0+IHtcbiAgICAgIC8vIHJlbmRlcmVkIGV2ZW50VHlwZVxuICAgICAgbGV0IHJlbmRlcmVkO1xuICAgICAgaWYgKCFpdGVtLmV2ZW50X3R5cGUgfHwgIWl0ZW0uZXZlbnRfdHlwZS50b0xvd2VyQ2FzZSgpICE9PSAnZ3JvdXAnKSB7XG4gICAgICAgIHJlbmRlcmVkID0gcmVuZGVyRXZlbnQoaXRlbSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZW5kZXJlZCA9IHJlbmRlckdyb3VwKGl0ZW0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICAgIGdlb21ldHJ5OiB7XG4gICAgICAgICAgdHlwZTogXCJQb2ludFwiLFxuICAgICAgICAgIGNvb3JkaW5hdGVzOiBbaXRlbS5sbmcsIGl0ZW0ubGF0XVxuICAgICAgICB9LFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgZXZlbnRQcm9wZXJ0aWVzOiBpdGVtLFxuICAgICAgICAgIHBvcHVwQ29udGVudDogcmVuZGVyZWRcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gKCkgPT4ge1xuICAgIHZhciBtYXAgPSBMLm1hcCgnbWFwJykuc2V0VmlldyhbMzQuODg1OTMwOTQwNzUzMTcsIDUuMDk3NjU2MjUwMDAwMDAxXSwgMik7XG5cbiAgICBMLnRpbGVMYXllcignaHR0cDovL3tzfS50aWxlLm9zbS5vcmcve3p9L3t4fS97eX0ucG5nJywge1xuICAgICAgICBhdHRyaWJ1dGlvbjogJyZjb3B5OyA8YSBocmVmPVwiaHR0cDovL29zbS5vcmcvY29weXJpZ2h0XCI+T3BlblN0cmVldE1hcDwvYT4gY29udHJpYnV0b3JzIOKAoiA8YSBocmVmPVwiLy8zNTAub3JnXCI+MzUwLm9yZzwvYT4nXG4gICAgfSkuYWRkVG8obWFwKTtcblxuICAgIC8vIG1hcC5maXRCb3VuZHMoWyBbWzQwLjcyMTYwMTUxOTcwODUsIC03My44NTE3NDY5ODAyOTE1Ml0sIFs0MC43MjQyOTk0ODAyOTE1LCAtNzMuODQ5MDQ5MDE5NzA4NV1dIF0pO1xuICAgIHJldHVybiB7XG4gICAgICAkbWFwOiBtYXAsXG4gICAgICBzZXRCb3VuZHM6IChib3VuZHMxLCBib3VuZHMyKSA9PiB7XG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtib3VuZHMxLCBib3VuZHMyXTtcbiAgICAgICAgbWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuICAgICAgfSxcbiAgICAgIHNldENlbnRlcjogKGNlbnRlciwgem9vbSA9IDEwKSA9PiB7XG4gICAgICAgIGlmICghY2VudGVyIHx8ICFjZW50ZXJbMF0gfHwgY2VudGVyWzBdID09IFwiXCJcbiAgICAgICAgICAgICAgfHwgIWNlbnRlclsxXSB8fCBjZW50ZXJbMV0gPT0gXCJcIikgcmV0dXJuO1xuICAgICAgICBtYXAuc2V0VmlldyhjZW50ZXIsIHpvb20pO1xuICAgICAgfSxcbiAgICAgIGZpbHRlck1hcDogKGZpbHRlcnMpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJmaWx0ZXJzID4+IFwiLCBmaWx0ZXJzKTtcbiAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwXCIpLmhpZGUoKTtcbiAgICAgICAgY29uc29sZS5sb2coJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwXCIpKTtcblxuICAgICAgICBpZiAoIWZpbHRlcnMpIHJldHVybjtcblxuICAgICAgICBmaWx0ZXJzLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIi5ldmVudC1pdGVtLXBvcHVwLlwiICsgaXRlbS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgICAkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXAuXCIgKyBpdGVtLnRvTG93ZXJDYXNlKCkpLnNob3coKTtcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICBwbG90UG9pbnRzOiAobGlzdCkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGdlb2pzb24gPSB7XG4gICAgICAgICAgdHlwZTogXCJGZWF0dXJlQ29sbGVjdGlvblwiLFxuICAgICAgICAgIGZlYXR1cmVzOiByZW5kZXJHZW9qc29uKGxpc3QpXG4gICAgICAgIH07XG5cblxuXG4gICAgICAgIEwuZ2VvSlNPTihnZW9qc29uLCB7XG4gICAgICAgICAgICBwb2ludFRvTGF5ZXI6IChmZWF0dXJlLCBsYXRsbmcpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgZXZlbnRUeXBlID0gZmVhdHVyZS5wcm9wZXJ0aWVzLmV2ZW50UHJvcGVydGllcy5ldmVudF90eXBlO1xuICAgICAgICAgICAgICB2YXIgZ2VvanNvbk1hcmtlck9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICByYWRpdXM6IDgsXG4gICAgICAgICAgICAgICAgICBmaWxsQ29sb3I6ICBldmVudFR5cGUgPT09ICdHcm91cCcgPyBcIiM0MEQ3RDRcIiA6IFwiIzBGODFFOFwiLFxuICAgICAgICAgICAgICAgICAgY29sb3I6IFwid2hpdGVcIixcbiAgICAgICAgICAgICAgICAgIHdlaWdodDogMixcbiAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAuNSxcbiAgICAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAwLjgsXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IChldmVudFR5cGUgPT09ICdHcm91cCcgPyAnZ3JvdXBzJyA6ICdldmVudHMnKSArICcgZXZlbnQtaXRlbS1wb3B1cCdcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgcmV0dXJuIEwuY2lyY2xlTWFya2VyKGxhdGxuZywgZ2VvanNvbk1hcmtlck9wdGlvbnMpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgIG9uRWFjaEZlYXR1cmU6IChmZWF0dXJlLCBsYXllcikgPT4ge1xuICAgICAgICAgICAgaWYgKGZlYXR1cmUucHJvcGVydGllcyAmJiBmZWF0dXJlLnByb3BlcnRpZXMucG9wdXBDb250ZW50KSB7XG4gICAgICAgICAgICAgIGxheWVyLmJpbmRQb3B1cChmZWF0dXJlLnByb3BlcnRpZXMucG9wdXBDb250ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pLmFkZFRvKG1hcCk7XG5cbiAgICAgIH0sXG4gICAgICB1cGRhdGU6IChwKSA9PiB7XG4gICAgICAgIGlmICghcCB8fCAhcC5sYXQgfHwgIXAubG5nICkgcmV0dXJuO1xuXG4gICAgICAgIG1hcC5zZXRWaWV3KEwubGF0TG5nKHAubGF0LCBwLmxuZyksIDEwKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiY29uc3QgUXVlcnlNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIHJldHVybiAodGFyZ2V0Rm9ybSA9IFwiZm9ybSNmaWx0ZXJzLWZvcm1cIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0Rm9ybSA9PT0gJ3N0cmluZycgPyAkKHRhcmdldEZvcm0pIDogdGFyZ2V0Rm9ybTtcbiAgICBsZXQgbGF0ID0gbnVsbDtcbiAgICBsZXQgbG5nID0gbnVsbDtcblxuICAgIGxldCBwcmV2aW91cyA9IHt9O1xuXG4gICAgJHRhcmdldC5vbignc3VibWl0JywgKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGxhdCA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwoKTtcbiAgICAgIGxuZyA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwoKTtcblxuICAgICAgdmFyIGZvcm0gPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG4gICAgICBkZWxldGUgZm9ybVsnc2VhcmNoLWxvY2F0aW9uJ107XG5cbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJC5wYXJhbShmb3JtKTtcbiAgICB9KVxuXG4gICAgJChkb2N1bWVudCkub24oJ2NoYW5nZScsICcuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF0nLCAoKSA9PiB7XG4gICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgIH0pXG5cblxuICAgIHJldHVybiB7XG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgcGFyYW1zID0gJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSlcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhbmddXCIpLnZhbChwYXJhbXMubGFuZyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChwYXJhbXMubGF0KTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKHBhcmFtcy5sbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwocGFyYW1zLmJvdW5kMSk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChwYXJhbXMuYm91bmQyKTtcblxuICAgICAgICAgIGlmIChwYXJhbXMuZmlsdGVyKSB7XG4gICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF1cIikucmVtb3ZlUHJvcChcImNoZWNrZWRcIik7XG4gICAgICAgICAgICBwYXJhbXMuZmlsdGVyLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICAgICR0YXJnZXQuZmluZChcIi5maWx0ZXItaXRlbSBpbnB1dFt0eXBlPWNoZWNrYm94XVt2YWx1ZT0nXCIgKyBpdGVtICsgXCInXVwiKS5wcm9wKFwiY2hlY2tlZFwiLCB0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZ2V0UGFyYW1ldGVyczogKCkgPT4ge1xuICAgICAgICB2YXIgcGFyYW1ldGVycyA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcbiAgICAgICAgZGVsZXRlIHBhcmFtZXRlcnNbJ3NlYXJjaC1sb2NhdGlvbiddO1xuXG4gICAgICAgIHJldHVybiBwYXJhbWV0ZXJzO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZUxvY2F0aW9uOiAobGF0LCBsbmcpID0+IHtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChsYXQpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKGxuZyk7XG4gICAgICAgIC8vICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlVmlld3BvcnQ6ICh2aWV3cG9ydCkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtbdmlld3BvcnQuZi5iLCB2aWV3cG9ydC5iLmJdLCBbdmlld3BvcnQuZi5mLCB2aWV3cG9ydC5iLmZdXTtcblxuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1swXSkpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1sxXSkpO1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHRyaWdnZXJTdWJtaXQ6ICgpID0+IHtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCIoZnVuY3Rpb24oJCkge1xuXG4gIC8vIDEuIGdvb2dsZSBtYXBzIGdlb2NvZGVcblxuICAvLyAyLiBmb2N1cyBtYXAgb24gZ2VvY29kZSAodmlhIGxhdC9sbmcpXG4gIGNvbnN0IHF1ZXJ5TWFuYWdlciA9IFF1ZXJ5TWFuYWdlcigpO1xuICAgICAgICBxdWVyeU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuXG4gIGNvbnN0IGluaXRQYXJhbXMgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuICBjb25zdCBtYXBNYW5hZ2VyID0gTWFwTWFuYWdlcigpO1xuXG4gIGNvbnN0IGxhbmd1YWdlTWFuYWdlciA9IExhbmd1YWdlTWFuYWdlcigpO1xuICBjb25zb2xlLmxvZyhxdWVyeU1hbmFnZXIsIHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCksIGluaXRQYXJhbXMpO1xuICBsYW5ndWFnZU1hbmFnZXIuaW5pdGlhbGl6ZShpbml0UGFyYW1zWydsYW5nJ10gfHwgJ2VuJyk7XG5cbiAgY29uc3QgbGlzdE1hbmFnZXIgPSBMaXN0TWFuYWdlcigpO1xuXG4gIGlmKGluaXRQYXJhbXMubGF0ICYmIGluaXRQYXJhbXMubG5nKSB7XG4gICAgbWFwTWFuYWdlci5zZXRDZW50ZXIoW2luaXRQYXJhbXMubGF0LCBpbml0UGFyYW1zLmxuZ10pO1xuICB9XG5cbiAgLyoqKlxuICAqIExpc3QgRXZlbnRzXG4gICogVGhpcyB3aWxsIHRyaWdnZXIgdGhlIGxpc3QgdXBkYXRlIG1ldGhvZFxuICAqL1xuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnBvcHVsYXRlTGlzdCgpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcblxuICAgIGxpc3RNYW5hZ2VyLnVwZGF0ZUZpbHRlcihvcHRpb25zKTtcbiAgfSlcblxuICAvKioqXG4gICogTWFwIEV2ZW50c1xuICAqL1xuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgLy8gbWFwTWFuYWdlci5zZXRDZW50ZXIoW29wdGlvbnMubGF0LCBvcHRpb25zLmxuZ10pO1xuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGJvdW5kMSA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDEpO1xuICAgIHZhciBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcbiAgICBtYXBNYW5hZ2VyLnNldEJvdW5kcyhib3VuZDEsIGJvdW5kMik7XG4gICAgLy8gY29uc29sZS5sb2cob3B0aW9ucylcbiAgfSk7XG4gIC8vIDMuIG1hcmtlcnMgb24gbWFwXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC1wbG90JywgKGUsIG9wdCkgPT4ge1xuICAgIG1hcE1hbmFnZXIucGxvdFBvaW50cyhvcHQuZGF0YSk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJyk7XG4gIH0pXG5cbiAgLy8gRmlsdGVyIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtZmlsdGVyJywgKGUsIG9wdCkgPT4ge1xuICAgIGlmIChvcHQpIHtcbiAgICAgIG1hcE1hbmFnZXIuZmlsdGVyTWFwKG9wdC5maWx0ZXIpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgKGUsIG9wdCkgPT4ge1xuICAgIGlmIChvcHQpIHtcbiAgICAgIGxhbmd1YWdlTWFuYWdlci51cGRhdGVMYW5ndWFnZShvcHQubGFuZyk7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uI3Nob3ctaGlkZS1tYXAnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnYm9keScpLnRvZ2dsZUNsYXNzKCdtYXAtdmlldycpXG4gIH0pO1xuXG4gICQod2luZG93KS5vbihcImhhc2hjaGFuZ2VcIiwgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgIGlmIChoYXNoLmxlbmd0aCA9PSAwKSByZXR1cm47XG4gICAgY29uc3QgcGFyYW1ldGVycyA9ICQuZGVwYXJhbShoYXNoLnN1YnN0cmluZygxKSk7XG4gICAgY29uc3Qgb2xkVVJMID0gZXZlbnQub3JpZ2luYWxFdmVudC5vbGRVUkw7XG5cblxuICAgIGNvbnN0IG9sZEhhc2ggPSAkLmRlcGFyYW0ob2xkVVJMLnN1YnN0cmluZyhvbGRVUkwuc2VhcmNoKFwiI1wiKSsxKSk7XG5cbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicsIHBhcmFtZXRlcnMpO1xuXG4gICAgLy8gU28gdGhhdCBjaGFuZ2UgaW4gZmlsdGVycyB3aWxsIG5vdCB1cGRhdGUgdGhpc1xuICAgIGlmIChvbGRIYXNoLmJvdW5kMSAhPT0gcGFyYW1ldGVycy5ib3VuZDEgfHwgb2xkSGFzaC5ib3VuZDIgIT09IHBhcmFtZXRlcnMuYm91bmQyKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG5cbiAgICAvLyBDaGFuZ2UgaXRlbXNcbiAgICBpZiAob2xkSGFzaC5sYW5nICE9PSBwYXJhbWV0ZXJzLmxhbmcpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgfVxuICB9KVxuXG4gIC8vIDQuIGZpbHRlciBvdXQgaXRlbXMgaW4gYWN0aXZpdHktYXJlYVxuXG4gIC8vIDUuIGdldCBtYXAgZWxlbWVudHNcblxuICAvLyA2LiBnZXQgR3JvdXAgZGF0YVxuXG4gIC8vIDcuIHByZXNlbnQgZ3JvdXAgZWxlbWVudHNcblxuICAkLmFqYXgoe1xuICAgIHVybDogJ2h0dHBzOi8vczMtdXMtd2VzdC0yLmFtYXpvbmF3cy5jb20vcHBsc21hcC1kYXRhL291dHB1dC8zNTBvcmctdGVzdC5qcy5neicsIC8vJ3wqKkRBVEFfU09VUkNFKip8JyxcbiAgICBkYXRhVHlwZTogJ3NjcmlwdCcsXG4gICAgY2FjaGU6IHRydWUsXG4gICAgc3VjY2VzczogKGRhdGEpID0+IHtcbiAgICAgIHZhciBwYXJhbWV0ZXJzID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuICAgICAgd2luZG93LkVWRU5UU19EQVRBLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgaXRlbVsnZXZlbnRfdHlwZSddID0gIWl0ZW0uZXZlbnRfdHlwZSA/ICdBY3Rpb24nIDogaXRlbS5ldmVudF90eXBlO1xuICAgICAgfSlcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC11cGRhdGUnKTtcbiAgICAgIC8vICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1wbG90JywgeyBkYXRhOiB3aW5kb3cuRVZFTlRTX0RBVEEgfSk7XG4gICAgICAvL1RPRE86IE1ha2UgdGhlIGdlb2pzb24gY29udmVyc2lvbiBoYXBwZW4gb24gdGhlIGJhY2tlbmRcbiAgICB9XG4gIH0pO1xuXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKSk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKSk7XG4gICAgY29uc29sZS5sb2cocXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKSlcbiAgfSwgMTAwKTtcblxufSkoalF1ZXJ5KTtcbiJdfQ==
