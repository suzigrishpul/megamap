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
    var lang = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'fr';

    var language = lang;
    var dictionary = {};
    var $targets = $("[data-lang-target][data-lang-key]");

    console.log($targets);
    var updatePageLanguage = function updatePageLanguage() {

      $targets.each(function (index, item) {
        var targetAttribute = $(item).data('lang-target');
        var langTarget = $(item).data('lang-key');

        var targetItem = dictionary.rows.filter(function (i) {
          return i.key === langTarget;
        })[0];
        console.log("YYYI", targetItem);

        switch (targetAttribute) {
          case 'text':
            $(item).text(targetItem[language]);
            break;
          case 'value':
            $(item).val(targetItem[language]);
            break;
          default:
            $(item).attr(targetAttribute, targetItem[language]);
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
          url: 'http://gsx2json.com/api?id=1O3eByjL1vlYf7Z7am-_htRTQi73PafqIfNBdLmXe8SM&sheet=1',
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
  languageManager.initialize('fr');

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9sYW5ndWFnZS5qcyIsImNsYXNzZXMvbGlzdC5qcyIsImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9xdWVyeS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJBdXRvY29tcGxldGVNYW5hZ2VyIiwiJCIsIkFQSV9LRVkiLCJ0YXJnZXQiLCJ0YXJnZXRJdGVtIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwicXVlcnlNZ3IiLCJRdWVyeU1hbmFnZXIiLCJnZW9jb2RlciIsImdvb2dsZSIsIm1hcHMiLCJHZW9jb2RlciIsInR5cGVhaGVhZCIsImhpbnQiLCJoaWdobGlnaHQiLCJtaW5MZW5ndGgiLCJjbGFzc05hbWVzIiwibWVudSIsIm5hbWUiLCJkaXNwbGF5IiwiaXRlbSIsImZvcm1hdHRlZF9hZGRyZXNzIiwibGltaXQiLCJzb3VyY2UiLCJxIiwic3luYyIsImFzeW5jIiwiZ2VvY29kZSIsImFkZHJlc3MiLCJyZXN1bHRzIiwic3RhdHVzIiwib24iLCJvYmoiLCJkYXR1bSIsImdlb21ldHJ5IiwidXBkYXRlVmlld3BvcnQiLCJ2aWV3cG9ydCIsIiR0YXJnZXQiLCJqUXVlcnkiLCJpbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2siLCJMYW5ndWFnZU1hbmFnZXIiLCJsYW5nIiwibGFuZ3VhZ2UiLCJkaWN0aW9uYXJ5IiwiJHRhcmdldHMiLCJjb25zb2xlIiwibG9nIiwidXBkYXRlUGFnZUxhbmd1YWdlIiwiZWFjaCIsImluZGV4IiwidGFyZ2V0QXR0cmlidXRlIiwiZGF0YSIsImxhbmdUYXJnZXQiLCJyb3dzIiwiZmlsdGVyIiwiaSIsImtleSIsInRleHQiLCJ2YWwiLCJhdHRyIiwidGFyZ2V0cyIsImluaXRpYWxpemUiLCJhamF4IiwidXJsIiwiZGF0YVR5cGUiLCJzdWNjZXNzIiwiY2hhbmdlTGFuZ3VhZ2UiLCJMaXN0TWFuYWdlciIsInRhcmdldExpc3QiLCJyZW5kZXJFdmVudCIsImRhdGUiLCJtb21lbnQiLCJzdGFydF9kYXRldGltZSIsImZvcm1hdCIsImV2ZW50X3R5cGUiLCJsYXQiLCJsbmciLCJ0aXRsZSIsInZlbnVlIiwicmVuZGVyR3JvdXAiLCJkZXRhaWxzIiwiJGxpc3QiLCJ1cGRhdGVGaWx0ZXIiLCJwIiwicmVtb3ZlUHJvcCIsImFkZENsYXNzIiwiam9pbiIsInBvcHVsYXRlTGlzdCIsIiRldmVudExpc3QiLCJ3aW5kb3ciLCJFVkVOVFNfREFUQSIsIm1hcCIsImZpbmQiLCJyZW1vdmUiLCJhcHBlbmQiLCJNYXBNYW5hZ2VyIiwicmVuZGVyR2VvanNvbiIsImxpc3QiLCJyZW5kZXJlZCIsInRvTG93ZXJDYXNlIiwidHlwZSIsImNvb3JkaW5hdGVzIiwicHJvcGVydGllcyIsImV2ZW50UHJvcGVydGllcyIsInBvcHVwQ29udGVudCIsIkwiLCJzZXRWaWV3IiwidGlsZUxheWVyIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsIiRtYXAiLCJzZXRCb3VuZHMiLCJib3VuZHMxIiwiYm91bmRzMiIsImJvdW5kcyIsImZpdEJvdW5kcyIsInNldENlbnRlciIsImNlbnRlciIsInpvb20iLCJmaWx0ZXJNYXAiLCJmaWx0ZXJzIiwiaGlkZSIsImZvckVhY2giLCJzaG93IiwicGxvdFBvaW50cyIsImdlb2pzb24iLCJmZWF0dXJlcyIsImdlb0pTT04iLCJwb2ludFRvTGF5ZXIiLCJmZWF0dXJlIiwibGF0bG5nIiwiZXZlbnRUeXBlIiwiZ2VvanNvbk1hcmtlck9wdGlvbnMiLCJyYWRpdXMiLCJmaWxsQ29sb3IiLCJjb2xvciIsIndlaWdodCIsIm9wYWNpdHkiLCJmaWxsT3BhY2l0eSIsImNsYXNzTmFtZSIsImNpcmNsZU1hcmtlciIsIm9uRWFjaEZlYXR1cmUiLCJsYXllciIsImJpbmRQb3B1cCIsInVwZGF0ZSIsImxhdExuZyIsInRhcmdldEZvcm0iLCJwcmV2aW91cyIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImZvcm0iLCJkZXBhcmFtIiwic2VyaWFsaXplIiwibG9jYXRpb24iLCJoYXNoIiwicGFyYW0iLCJ0cmlnZ2VyIiwiY2FsbGJhY2siLCJsZW5ndGgiLCJwYXJhbXMiLCJzdWJzdHJpbmciLCJib3VuZDEiLCJib3VuZDIiLCJwcm9wIiwiZ2V0UGFyYW1ldGVycyIsInBhcmFtZXRlcnMiLCJ1cGRhdGVMb2NhdGlvbiIsImYiLCJiIiwiSlNPTiIsInN0cmluZ2lmeSIsInRyaWdnZXJTdWJtaXQiLCJxdWVyeU1hbmFnZXIiLCJpbml0UGFyYW1zIiwibWFwTWFuYWdlciIsImxhbmd1YWdlTWFuYWdlciIsImxpc3RNYW5hZ2VyIiwiZXZlbnQiLCJvcHRpb25zIiwicGFyc2UiLCJvcHQiLCJvbGRVUkwiLCJvcmlnaW5hbEV2ZW50Iiwib2xkSGFzaCIsInNlYXJjaCIsImNhY2hlIiwic2V0VGltZW91dCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7QUFDQSxJQUFNQSxzQkFBdUIsVUFBU0MsQ0FBVCxFQUFZO0FBQ3ZDOztBQUVBLE1BQU1DLFVBQVUseUNBQWhCOztBQUVBLFNBQU8sVUFBQ0MsTUFBRCxFQUFZOztBQUVqQixRQUFNQyxhQUFhLE9BQU9ELE1BQVAsSUFBaUIsUUFBakIsR0FBNEJFLFNBQVNDLGFBQVQsQ0FBdUJILE1BQXZCLENBQTVCLEdBQTZEQSxNQUFoRjtBQUNBLFFBQU1JLFdBQVdDLGNBQWpCO0FBQ0EsUUFBSUMsV0FBVyxJQUFJQyxPQUFPQyxJQUFQLENBQVlDLFFBQWhCLEVBQWY7O0FBRUFYLE1BQUVHLFVBQUYsRUFBY1MsU0FBZCxDQUF3QjtBQUNaQyxZQUFNLElBRE07QUFFWkMsaUJBQVcsSUFGQztBQUdaQyxpQkFBVyxDQUhDO0FBSVpDLGtCQUFZO0FBQ1ZDLGNBQU07QUFESTtBQUpBLEtBQXhCLEVBUVU7QUFDRUMsWUFBTSxnQkFEUjtBQUVFQyxlQUFTLGlCQUFDQyxJQUFEO0FBQUEsZUFBVUEsS0FBS0MsaUJBQWY7QUFBQSxPQUZYO0FBR0VDLGFBQU8sRUFIVDtBQUlFQyxjQUFRLGdCQUFVQyxDQUFWLEVBQWFDLElBQWIsRUFBbUJDLEtBQW5CLEVBQXlCO0FBQzdC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QUFwQixFQUFrRGdCLGFBQWFSLGFBQWIsRUFBbEQ7QUFDQXBLLE1BQUVJLFFBQUYsRUFBWXdKLE9BQVosQ0FBb0Isb0JBQXBCLEVBQTBDZ0IsYUFBYVIsYUFBYixFQUExQztBQUNBdkgsWUFBUUMsR0FBUixDQUFZOEgsYUFBYVIsYUFBYixFQUFaO0FBQ0QsR0FKRCxFQUlHLEdBSkg7QUFNRCxDQTlHRCxFQThHRzlILE1BOUdIIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuLy9BUEkgOkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVxuY29uc3QgQXV0b2NvbXBsZXRlTWFuYWdlciA9IChmdW5jdGlvbigkKSB7XG4gIC8vSW5pdGlhbGl6YXRpb24uLi5cblxuICBjb25zdCBBUElfS0VZID0gXCJBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cIjtcblxuICByZXR1cm4gKHRhcmdldCkgPT4ge1xuXG4gICAgY29uc3QgdGFyZ2V0SXRlbSA9IHR5cGVvZiB0YXJnZXQgPT0gXCJzdHJpbmdcIiA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KSA6IHRhcmdldDtcbiAgICBjb25zdCBxdWVyeU1nciA9IFF1ZXJ5TWFuYWdlcigpO1xuICAgIHZhciBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuXG4gICAgJCh0YXJnZXRJdGVtKS50eXBlYWhlYWQoe1xuICAgICAgICAgICAgICAgIGhpbnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgaGlnaGxpZ2h0OiB0cnVlLFxuICAgICAgICAgICAgICAgIG1pbkxlbmd0aDogNCxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWVzOiB7XG4gICAgICAgICAgICAgICAgICBtZW51OiAndHQtZHJvcGRvd24tbWVudSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnc2VhcmNoLXJlc3VsdHMnLFxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IChpdGVtKSA9PiBpdGVtLmZvcm1hdHRlZF9hZGRyZXNzLFxuICAgICAgICAgICAgICAgIGxpbWl0OiAxMCxcbiAgICAgICAgICAgICAgICBzb3VyY2U6IGZ1bmN0aW9uIChxLCBzeW5jLCBhc3luYyl7XG4gICAgICAgICAgICAgICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBxIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICBhc3luYyhyZXN1bHRzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApLm9uKCd0eXBlYWhlYWQ6c2VsZWN0ZWQnLCBmdW5jdGlvbiAob2JqLCBkYXR1bSkge1xuICAgICAgICAgICAgICAgIGlmKGRhdHVtKVxuICAgICAgICAgICAgICAgIHtcblxuICAgICAgICAgICAgICAgICAgdmFyIGdlb21ldHJ5ID0gZGF0dW0uZ2VvbWV0cnk7XG4gICAgICAgICAgICAgICAgICBxdWVyeU1nci51cGRhdGVWaWV3cG9ydChnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgICAvLyAgbWFwLmZpdEJvdW5kcyhnZW9tZXRyeS5ib3VuZHM/IGdlb21ldHJ5LmJvdW5kcyA6IGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuXG4gICAgcmV0dXJuIHtcbiAgICAgICR0YXJnZXQ6ICQodGFyZ2V0SXRlbSksXG4gICAgICB0YXJnZXQ6IHRhcmdldEl0ZW1cbiAgICB9XG4gIH1cblxufShqUXVlcnkpKTtcblxuY29uc3QgaW5pdGlhbGl6ZUF1dG9jb21wbGV0ZUNhbGxiYWNrID0gKCkgPT4ge1xuXG5cbiAgQXV0b2NvbXBsZXRlTWFuYWdlcihcImlucHV0W25hbWU9J3NlYXJjaC1sb2NhdGlvbiddXCIpO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTGFuZ3VhZ2VNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIC8va2V5VmFsdWVcblxuICAvL3RhcmdldHMgYXJlIHRoZSBtYXBwaW5ncyBmb3IgdGhlIGxhbmd1YWdlXG4gIHJldHVybiAobGFuZyA9ICdmcicpID0+IHtcbiAgICBsZXQgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgIGxldCBkaWN0aW9uYXJ5ID0ge307XG4gICAgbGV0ICR0YXJnZXRzID0gJChcIltkYXRhLWxhbmctdGFyZ2V0XVtkYXRhLWxhbmcta2V5XVwiKTtcblxuICAgIGNvbnNvbGUubG9nKCR0YXJnZXRzKTtcbiAgICBjb25zdCB1cGRhdGVQYWdlTGFuZ3VhZ2UgPSAoKSA9PiB7XG5cbiAgICAgICR0YXJnZXRzLmVhY2goKGluZGV4LCBpdGVtKSA9PiB7XG4gICAgICAgIGxldCB0YXJnZXRBdHRyaWJ1dGUgPSAkKGl0ZW0pLmRhdGEoJ2xhbmctdGFyZ2V0Jyk7XG4gICAgICAgIGxldCBsYW5nVGFyZ2V0ID0gJChpdGVtKS5kYXRhKCdsYW5nLWtleScpO1xuXG4gICAgICAgIGxldCB0YXJnZXRJdGVtID0gZGljdGlvbmFyeS5yb3dzLmZpbHRlcigoaSkgPT4gaS5rZXkgPT09IGxhbmdUYXJnZXQpWzBdO1xuICAgICAgICBjb25zb2xlLmxvZyhcIllZWUlcIiwgdGFyZ2V0SXRlbSk7XG5cbiAgICAgICAgc3dpdGNoKHRhcmdldEF0dHJpYnV0ZSkge1xuICAgICAgICAgIGNhc2UgJ3RleHQnOlxuICAgICAgICAgICAgJChpdGVtKS50ZXh0KHRhcmdldEl0ZW1bbGFuZ3VhZ2VdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3ZhbHVlJzpcbiAgICAgICAgICAgICQoaXRlbSkudmFsKHRhcmdldEl0ZW1bbGFuZ3VhZ2VdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAkKGl0ZW0pLmF0dHIodGFyZ2V0QXR0cmlidXRlLCB0YXJnZXRJdGVtW2xhbmd1YWdlXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGxhbmd1YWdlLFxuICAgICAgdGFyZ2V0czogJHRhcmdldHMsXG4gICAgICBkaWN0aW9uYXJ5LFxuICAgICAgaW5pdGlhbGl6ZTogKGxhbmcpID0+IHtcbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICB1cmw6ICdodHRwOi8vZ3N4Mmpzb24uY29tL2FwaT9pZD0xTzNlQnlqTDF2bFlmN1o3YW0tX2h0UlRRaTczUGFmcUlmTkJkTG1YZThTTSZzaGVldD0xJyxcbiAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICBkaWN0aW9uYXJ5ID0gZGF0YTtcbiAgICAgICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgY2hhbmdlTGFuZ3VhZ2U6IChsYW5nKSA9PiB7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG59KShqUXVlcnkpO1xuIiwiLyogVGhpcyBsb2FkcyBhbmQgbWFuYWdlcyB0aGUgbGlzdCEgKi9cblxuY29uc3QgTGlzdE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRMaXN0ID0gXCIjZXZlbnRzLWxpc3RcIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0TGlzdCA9PT0gJ3N0cmluZycgPyAkKHRhcmdldExpc3QpIDogdGFyZ2V0TGlzdDtcblxuICAgIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0pID0+IHtcblxuICAgICAgdmFyIGRhdGUgPSBtb21lbnQoaXRlbS5zdGFydF9kYXRldGltZSkuZm9ybWF0KFwiZGRkZCDigKIgTU1NIEREIGg6bW1hXCIpO1xuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaSBjbGFzcz0nJHtpdGVtLmV2ZW50X3R5cGUgfHwgJyd9IEFjdGlvbicgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudCB0eXBlLWFjdGlvblwiPlxuICAgICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICAgIDxsaT4ke2l0ZW0uZXZlbnRfdHlwZX08L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPGgyPjxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZX08L2E+PC9oMj5cbiAgICAgICAgICA8aDQ+JHtkYXRlfTwvaDQ+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgICAgPHA+JHtpdGVtLnZlbnVlfTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCI+UlNWUDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICAgYFxuICAgIH07XG5cbiAgICBjb25zdCByZW5kZXJHcm91cCA9IChpdGVtKSA9PiB7XG5cbiAgICAgIHJldHVybiBgXG4gICAgICA8bGk+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwXCI+XG4gICAgICAgICAgPGgyPjxhIGhyZWY9XCIvXCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZSB8fCBgR3JvdXBgfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICAgIDxwPkNvbG9yYWRvLCBVU0E8L3A+XG4gICAgICAgICAgICA8cD4ke2l0ZW0uZGV0YWlscyB8fCBgMzUwIENvbG9yYWRvIGlzIHdvcmtpbmcgbG9jYWxseSB0byBoZWxwIGJ1aWxkIHRoZSBnbG9iYWxcbiAgICAgICAgICAgICAgIDM1MC5vcmcgbW92ZW1lbnQgdG8gc29sdmUgdGhlIGNsaW1hdGUgY3Jpc2lzIGFuZCB0cmFuc2l0aW9uXG4gICAgICAgICAgICAgICB0byBhIGNsZWFuLCByZW5ld2FibGUgZW5lcmd5IGZ1dHVyZS5gfVxuICAgICAgICAgICAgPC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICRsaXN0OiAkdGFyZ2V0LFxuICAgICAgdXBkYXRlRmlsdGVyOiAocCkgPT4ge1xuICAgICAgICBpZighcCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIFJlbW92ZSBGaWx0ZXJzXG5cbiAgICAgICAgJHRhcmdldC5yZW1vdmVQcm9wKFwiY2xhc3NcIik7XG4gICAgICAgICR0YXJnZXQuYWRkQ2xhc3MocC5maWx0ZXIgPyBwLmZpbHRlci5qb2luKFwiIFwiKSA6ICcnKVxuICAgICAgfSxcbiAgICAgIHBvcHVsYXRlTGlzdDogKCkgPT4ge1xuICAgICAgICAvL3VzaW5nIHdpbmRvdy5FVkVOVF9EQVRBXG5cbiAgICAgICAgdmFyICRldmVudExpc3QgPSB3aW5kb3cuRVZFTlRTX0RBVEEubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgIHJldHVybiBpdGVtLmV2ZW50X3R5cGUgIT09ICdHcm91cCcgPyByZW5kZXJFdmVudChpdGVtKSA6IHJlbmRlckdyb3VwKGl0ZW0pO1xuICAgICAgICB9KVxuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsIGxpJykucmVtb3ZlKCk7XG4gICAgICAgICR0YXJnZXQuZmluZCgndWwnKS5hcHBlbmQoJGV2ZW50TGlzdCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsIlxuY29uc3QgTWFwTWFuYWdlciA9ICgoJCkgPT4ge1xuXG4gIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0pID0+IHtcbiAgICB2YXIgZGF0ZSA9IG1vbWVudChpdGVtLnN0YXJ0X2RhdGV0aW1lKS5mb3JtYXQoXCJkZGRkIOKAoiBNTU0gREQgaDptbWFcIik7XG4gICAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPSdwb3B1cC1pdGVtICR7aXRlbS5ldmVudF90eXBlfScgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnRcIj5cbiAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgIDxsaT4ke2l0ZW0uZXZlbnRfdHlwZSB8fCAnQWN0aW9uJ308L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8aDI+PGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICA8aDQ+JHtkYXRlfTwvaDQ+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5SU1ZQPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICAgIGBcbiAgfTtcblxuICBjb25zdCByZW5kZXJHcm91cCA9IChpdGVtKSA9PiB7XG4gICAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPSdwb3B1cC1pdGVtICR7aXRlbS5ldmVudF90eXBlfScgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXBcIj5cbiAgICAgICAgPGgyPjxhIGhyZWY9XCIvXCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZSB8fCBgR3JvdXBgfTwvYT48L2gyPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgPHA+Q29sb3JhZG8sIFVTQTwvcD5cbiAgICAgICAgICA8cD4ke2l0ZW0uZGV0YWlscyB8fCBgMzUwIENvbG9yYWRvIGlzIHdvcmtpbmcgbG9jYWxseSB0byBoZWxwIGJ1aWxkIHRoZSBnbG9iYWxcbiAgICAgICAgICAgICAzNTAub3JnIG1vdmVtZW50IHRvIHNvbHZlIHRoZSBjbGltYXRlIGNyaXNpcyBhbmQgdHJhbnNpdGlvblxuICAgICAgICAgICAgIHRvIGEgY2xlYW4sIHJlbmV3YWJsZSBlbmVyZ3kgZnV0dXJlLmB9XG4gICAgICAgICAgPC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgYFxuICB9O1xuXG4gIGNvbnN0IHJlbmRlckdlb2pzb24gPSAobGlzdCkgPT4ge1xuICAgIHJldHVybiBsaXN0Lm1hcCgoaXRlbSkgPT4ge1xuICAgICAgLy8gcmVuZGVyZWQgZXZlbnRUeXBlXG4gICAgICBsZXQgcmVuZGVyZWQ7XG4gICAgICBpZiAoIWl0ZW0uZXZlbnRfdHlwZSB8fCAhaXRlbS5ldmVudF90eXBlLnRvTG93ZXJDYXNlKCkgIT09ICdncm91cCcpIHtcbiAgICAgICAgcmVuZGVyZWQgPSByZW5kZXJFdmVudChpdGVtKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlbmRlcmVkID0gcmVuZGVyR3JvdXAoaXRlbSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICB0eXBlOiBcIlBvaW50XCIsXG4gICAgICAgICAgY29vcmRpbmF0ZXM6IFtpdGVtLmxuZywgaXRlbS5sYXRdXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBldmVudFByb3BlcnRpZXM6IGl0ZW0sXG4gICAgICAgICAgcG9wdXBDb250ZW50OiByZW5kZXJlZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAoKSA9PiB7XG4gICAgdmFyIG1hcCA9IEwubWFwKCdtYXAnKS5zZXRWaWV3KFszNC44ODU5MzA5NDA3NTMxNywgNS4wOTc2NTYyNTAwMDAwMDFdLCAyKTtcblxuICAgIEwudGlsZUxheWVyKCdodHRwOi8ve3N9LnRpbGUub3NtLm9yZy97en0ve3h9L3t5fS5wbmcnLCB7XG4gICAgICAgIGF0dHJpYnV0aW9uOiAnJmNvcHk7IDxhIGhyZWY9XCJodHRwOi8vb3NtLm9yZy9jb3B5cmlnaHRcIj5PcGVuU3RyZWV0TWFwPC9hPiBjb250cmlidXRvcnMg4oCiIDxhIGhyZWY9XCIvLzM1MC5vcmdcIj4zNTAub3JnPC9hPidcbiAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgLy8gbWFwLmZpdEJvdW5kcyhbIFtbNDAuNzIxNjAxNTE5NzA4NSwgLTczLjg1MTc0Njk4MDI5MTUyXSwgWzQwLjcyNDI5OTQ4MDI5MTUsIC03My44NDkwNDkwMTk3MDg1XV0gXSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICRtYXA6IG1hcCxcbiAgICAgIHNldEJvdW5kczogKGJvdW5kczEsIGJvdW5kczIpID0+IHtcbiAgICAgICAgY29uc3QgYm91bmRzID0gW2JvdW5kczEsIGJvdW5kczJdO1xuICAgICAgICBtYXAuZml0Qm91bmRzKGJvdW5kcyk7XG4gICAgICB9LFxuICAgICAgc2V0Q2VudGVyOiAoY2VudGVyLCB6b29tID0gMTApID0+IHtcbiAgICAgICAgaWYgKCFjZW50ZXIgfHwgIWNlbnRlclswXSB8fCBjZW50ZXJbMF0gPT0gXCJcIlxuICAgICAgICAgICAgICB8fCAhY2VudGVyWzFdIHx8IGNlbnRlclsxXSA9PSBcIlwiKSByZXR1cm47XG4gICAgICAgIG1hcC5zZXRWaWV3KGNlbnRlciwgem9vbSk7XG4gICAgICB9LFxuICAgICAgZmlsdGVyTWFwOiAoZmlsdGVycykgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcImZpbHRlcnMgPj4gXCIsIGZpbHRlcnMpO1xuICAgICAgICAkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXBcIikuaGlkZSgpO1xuICAgICAgICBjb25zb2xlLmxvZygkKFwiI21hcFwiKS5maW5kKFwiLmV2ZW50LWl0ZW0tcG9wdXBcIikpO1xuXG4gICAgICAgIGlmICghZmlsdGVycykgcmV0dXJuO1xuXG4gICAgICAgIGZpbHRlcnMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiLmV2ZW50LWl0ZW0tcG9wdXAuXCIgKyBpdGVtLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICAgICQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cC5cIiArIGl0ZW0udG9Mb3dlckNhc2UoKSkuc2hvdygpO1xuICAgICAgICB9KVxuICAgICAgfSxcbiAgICAgIHBsb3RQb2ludHM6IChsaXN0KSA9PiB7XG5cbiAgICAgICAgY29uc3QgZ2VvanNvbiA9IHtcbiAgICAgICAgICB0eXBlOiBcIkZlYXR1cmVDb2xsZWN0aW9uXCIsXG4gICAgICAgICAgZmVhdHVyZXM6IHJlbmRlckdlb2pzb24obGlzdClcbiAgICAgICAgfTtcblxuXG5cbiAgICAgICAgTC5nZW9KU09OKGdlb2pzb24sIHtcbiAgICAgICAgICAgIHBvaW50VG9MYXllcjogKGZlYXR1cmUsIGxhdGxuZykgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBldmVudFR5cGUgPSBmZWF0dXJlLnByb3BlcnRpZXMuZXZlbnRQcm9wZXJ0aWVzLmV2ZW50X3R5cGU7XG4gICAgICAgICAgICAgIHZhciBnZW9qc29uTWFya2VyT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICAgIHJhZGl1czogOCxcbiAgICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogIGV2ZW50VHlwZSA9PT0gJ0dyb3VwJyA/IFwiIzQwRDdENFwiIDogXCIjMEY4MUU4XCIsXG4gICAgICAgICAgICAgICAgICBjb2xvcjogXCJ3aGl0ZVwiLFxuICAgICAgICAgICAgICAgICAgd2VpZ2h0OiAyLFxuICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMC41LFxuICAgICAgICAgICAgICAgICAgZmlsbE9wYWNpdHk6IDAuOCxcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogKGV2ZW50VHlwZSA9PT0gJ0dyb3VwJyA/ICdncm91cHMnIDogJ2V2ZW50cycpICsgJyBldmVudC1pdGVtLXBvcHVwJ1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICByZXR1cm4gTC5jaXJjbGVNYXJrZXIobGF0bG5nLCBnZW9qc29uTWFya2VyT3B0aW9ucyk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgb25FYWNoRmVhdHVyZTogKGZlYXR1cmUsIGxheWVyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZmVhdHVyZS5wcm9wZXJ0aWVzICYmIGZlYXR1cmUucHJvcGVydGllcy5wb3B1cENvbnRlbnQpIHtcbiAgICAgICAgICAgICAgbGF5ZXIuYmluZFBvcHVwKGZlYXR1cmUucHJvcGVydGllcy5wb3B1cENvbnRlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSkuYWRkVG8obWFwKTtcblxuICAgICAgfSxcbiAgICAgIHVwZGF0ZTogKHApID0+IHtcbiAgICAgICAgaWYgKCFwIHx8ICFwLmxhdCB8fCAhcC5sbmcgKSByZXR1cm47XG5cbiAgICAgICAgbWFwLnNldFZpZXcoTC5sYXRMbmcocC5sYXQsIHAubG5nKSwgMTApO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJjb25zdCBRdWVyeU1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRGb3JtID0gXCJmb3JtI2ZpbHRlcnMtZm9ybVwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRGb3JtID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0Rm9ybSkgOiB0YXJnZXRGb3JtO1xuICAgIGxldCBsYXQgPSBudWxsO1xuICAgIGxldCBsbmcgPSBudWxsO1xuXG4gICAgbGV0IHByZXZpb3VzID0ge307XG5cbiAgICAkdGFyZ2V0Lm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgbGF0ID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbCgpO1xuICAgICAgbG5nID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbCgpO1xuXG4gICAgICB2YXIgZm9ybSA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcbiAgICAgIGRlbGV0ZSBmb3JtWydzZWFyY2gtbG9jYXRpb24nXTtcblxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAkLnBhcmFtKGZvcm0pO1xuICAgIH0pXG5cbiAgICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy5maWx0ZXItaXRlbSBpbnB1dFt0eXBlPWNoZWNrYm94XScsICgpID0+IHtcbiAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgfSlcblxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGluaXRpYWxpemU6IChjYWxsYmFjaykgPT4ge1xuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2gubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHZhciBwYXJhbXMgPSAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpKVxuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwocGFyYW1zLmxhdCk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChwYXJhbXMubG5nKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKHBhcmFtcy5ib3VuZDEpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwocGFyYW1zLmJvdW5kMik7XG5cbiAgICAgICAgICBpZiAocGFyYW1zLmZpbHRlcikge1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdXCIpLnJlbW92ZVByb3AoXCJjaGVja2VkXCIpO1xuICAgICAgICAgICAgcGFyYW1zLmZpbHRlci5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF1bdmFsdWU9J1wiICsgaXRlbSArIFwiJ11cIikucHJvcChcImNoZWNrZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGdldFBhcmFtZXRlcnM6ICgpID0+IHtcbiAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG4gICAgICAgIGRlbGV0ZSBwYXJhbWV0ZXJzWydzZWFyY2gtbG9jYXRpb24nXTtcblxuICAgICAgICByZXR1cm4gcGFyYW1ldGVycztcbiAgICAgIH0sXG4gICAgICB1cGRhdGVMb2NhdGlvbjogKGxhdCwgbG5nKSA9PiB7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwobGF0KTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChsbmcpO1xuICAgICAgICAvLyAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZVZpZXdwb3J0OiAodmlld3BvcnQpID0+IHtcblxuICAgICAgICBjb25zdCBib3VuZHMgPSBbW3ZpZXdwb3J0LmYuYiwgdmlld3BvcnQuYi5iXSwgW3ZpZXdwb3J0LmYuZiwgdmlld3BvcnQuYi5mXV07XG5cbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMF0pKTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMV0pKTtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyU3VibWl0OiAoKSA9PiB7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59KShqUXVlcnkpO1xuIiwiKGZ1bmN0aW9uKCQpIHtcblxuICAvLyAxLiBnb29nbGUgbWFwcyBnZW9jb2RlXG5cbiAgLy8gMi4gZm9jdXMgbWFwIG9uIGdlb2NvZGUgKHZpYSBsYXQvbG5nKVxuICBjb25zdCBxdWVyeU1hbmFnZXIgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICAgICAgcXVlcnlNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICBjb25zdCBpbml0UGFyYW1zID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcbiAgY29uc3QgbWFwTWFuYWdlciA9IE1hcE1hbmFnZXIoKTtcblxuICBjb25zdCBsYW5ndWFnZU1hbmFnZXIgPSBMYW5ndWFnZU1hbmFnZXIoKTtcbiAgbGFuZ3VhZ2VNYW5hZ2VyLmluaXRpYWxpemUoJ2ZyJyk7XG5cbiAgY29uc3QgbGlzdE1hbmFnZXIgPSBMaXN0TWFuYWdlcigpO1xuXG4gIGlmKGluaXRQYXJhbXMubGF0ICYmIGluaXRQYXJhbXMubG5nKSB7XG4gICAgbWFwTWFuYWdlci5zZXRDZW50ZXIoW2luaXRQYXJhbXMubGF0LCBpbml0UGFyYW1zLmxuZ10pO1xuICB9XG5cbiAgLyoqKlxuICAqIExpc3QgRXZlbnRzXG4gICogVGhpcyB3aWxsIHRyaWdnZXIgdGhlIGxpc3QgdXBkYXRlIG1ldGhvZFxuICAqL1xuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnBvcHVsYXRlTGlzdCgpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcblxuICAgIGxpc3RNYW5hZ2VyLnVwZGF0ZUZpbHRlcihvcHRpb25zKTtcbiAgfSlcblxuICAvKioqXG4gICogTWFwIEV2ZW50c1xuICAqL1xuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgLy8gbWFwTWFuYWdlci5zZXRDZW50ZXIoW29wdGlvbnMubGF0LCBvcHRpb25zLmxuZ10pO1xuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGJvdW5kMSA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDEpO1xuICAgIHZhciBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcbiAgICBtYXBNYW5hZ2VyLnNldEJvdW5kcyhib3VuZDEsIGJvdW5kMik7XG4gICAgLy8gY29uc29sZS5sb2cob3B0aW9ucylcbiAgfSk7XG4gIC8vIDMuIG1hcmtlcnMgb24gbWFwXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC1wbG90JywgKGUsIG9wdCkgPT4ge1xuICAgIG1hcE1hbmFnZXIucGxvdFBvaW50cyhvcHQuZGF0YSk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJyk7XG4gIH0pXG5cbiAgLy8gRmlsdGVyIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtZmlsdGVyJywgKGUsIG9wdCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKG9wdCk7XG4gICAgaWYgKG9wdCkge1xuICAgICAgbWFwTWFuYWdlci5maWx0ZXJNYXAob3B0LmZpbHRlcik7XG4gICAgfVxuICB9KVxuXG4gICQod2luZG93KS5vbihcImhhc2hjaGFuZ2VcIiwgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgIGlmIChoYXNoLmxlbmd0aCA9PSAwKSByZXR1cm47XG4gICAgY29uc3QgcGFyYW1ldGVycyA9ICQuZGVwYXJhbShoYXNoLnN1YnN0cmluZygxKSk7XG4gICAgY29uc3Qgb2xkVVJMID0gZXZlbnQub3JpZ2luYWxFdmVudC5vbGRVUkw7XG5cblxuICAgIGNvbnN0IG9sZEhhc2ggPSAkLmRlcGFyYW0ob2xkVVJMLnN1YnN0cmluZyhvbGRVUkwuc2VhcmNoKFwiI1wiKSsxKSk7XG5cbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicsIHBhcmFtZXRlcnMpO1xuXG4gICAgLy8gU28gdGhhdCBjaGFuZ2UgaW4gZmlsdGVycyB3aWxsIG5vdCB1cGRhdGUgdGhpc1xuICAgIGlmIChvbGRIYXNoLmJvdW5kMSAhPT0gcGFyYW1ldGVycy5ib3VuZDEgfHwgb2xkSGFzaC5ib3VuZDIgIT09IHBhcmFtZXRlcnMuYm91bmQyKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG4gIH0pXG5cbiAgLy8gNC4gZmlsdGVyIG91dCBpdGVtcyBpbiBhY3Rpdml0eS1hcmVhXG5cbiAgLy8gNS4gZ2V0IG1hcCBlbGVtZW50c1xuXG4gIC8vIDYuIGdldCBHcm91cCBkYXRhXG5cbiAgLy8gNy4gcHJlc2VudCBncm91cCBlbGVtZW50c1xuXG4gICQuYWpheCh7XG4gICAgdXJsOiAnaHR0cHM6Ly9zMy11cy13ZXN0LTIuYW1hem9uYXdzLmNvbS9wcGxzbWFwLWRhdGEvb3V0cHV0LzM1MG9yZy10ZXN0LmpzLmd6JywgLy8nfCoqREFUQV9TT1VSQ0UqKnwnLFxuICAgIGRhdGFUeXBlOiAnc2NyaXB0JyxcbiAgICBjYWNoZTogdHJ1ZSxcbiAgICBzdWNjZXNzOiAoZGF0YSkgPT4ge1xuICAgICAgdmFyIHBhcmFtZXRlcnMgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuXG4gICAgICB3aW5kb3cuRVZFTlRTX0RBVEEuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICBpdGVtWydldmVudF90eXBlJ10gPSAhaXRlbS5ldmVudF90eXBlID8gJ0FjdGlvbicgOiBpdGVtLmV2ZW50X3R5cGU7XG4gICAgICB9KVxuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LXVwZGF0ZScpO1xuICAgICAgLy8gJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXBsb3QnLCB7IGRhdGE6IHdpbmRvdy5FVkVOVFNfREFUQSB9KTtcbiAgICAgIC8vVE9ETzogTWFrZSB0aGUgZ2VvanNvbiBjb252ZXJzaW9uIGhhcHBlbiBvbiB0aGUgYmFja2VuZFxuICAgIH1cbiAgfSk7XG5cbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpKTtcbiAgICBjb25zb2xlLmxvZyhxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpKVxuICB9LCAxMDApO1xuXG59KShqUXVlcnkpO1xuIl19
