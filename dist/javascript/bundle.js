"use strict";
//API :AIzaSyBujKTRw5uIXp_NHZgjYVDtBy1dbyNuGEM

var AutocompleteManager = function ($) {
  //Initialization...

  return function (target) {

    var API_KEY = "AIzaSyBujKTRw5uIXp_NHZgjYVDtBy1dbyNuGEM";
    var targetItem = typeof target == "string" ? document.querySelector(target) : target;
    var queryMgr = QueryManager();
    var geocoder = new google.maps.Geocoder();

    return {
      $target: $(targetItem),
      target: targetItem,
      initialize: function initialize() {
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
      }
    };

    return {};
  };
}(jQuery);
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
        //console.log("$targets", lang);
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
        //console.log("New Lang ::: ", lang);
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

  return function (callback) {
    var map = L.map('map').setView([34.88593094075317, 5.097656250000001], 2);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors • <a href="//350.org">350.org</a>'
    }).addTo(map);

    var geocoder = null;
    return {
      $map: map,
      initialize: function initialize(callback) {
        geocoder = new google.maps.Geocoder();
        if (callback && typeof callback === 'function') {
          callback();
        }
      },
      setBounds: function setBounds(bounds1, bounds2) {
        var bounds = [bounds1, bounds2];
        map.fitBounds(bounds);
      },
      setCenter: function setCenter(center) {
        var zoom = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

        if (!center || !center[0] || center[0] == "" || !center[1] || center[1] == "") return;
        map.setView(center, zoom);
      },
      // Center location by geocoded
      getCenterByLocation: function getCenterByLocation(location, callback) {
        //console.log("Finding location of ", location);
        geocoder.geocode({ address: location }, function (results, status) {
          //console.log("LOCATION MATCH:: ", results, status);
          if (callback && typeof callback === 'function') {
            callback(results[0]);
          }
        });
      },
      filterMap: function filterMap(filters) {
        //console.log("filters >> ", filters);
        $("#map").find(".event-item-popup").hide();
        //console.log($("#map").find(".event-item-popup"));

        if (!filters) return;

        filters.forEach(function (item) {
          //console.log(".event-item-popup." + item.toLowerCase());
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
          $target.find("input[name=loc]").val(params.loc);

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
        // parameters['location'] ;

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9sYW5ndWFnZS5qcyIsImNsYXNzZXMvbGlzdC5qcyIsImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9xdWVyeS5qcyJdLCJuYW1lcyI6WyJBdXRvY29tcGxldGVNYW5hZ2VyIiwiJCIsInRhcmdldCIsIkFQSV9LRVkiLCJ0YXJnZXRJdGVtIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwicXVlcnlNZ3IiLCJRdWVyeU1hbmFnZXIiLCJnZW9jb2RlciIsImdvb2dsZSIsIm1hcHMiLCJHZW9jb2RlciIsIiR0YXJnZXQiLCJpbml0aWFsaXplIiwidHlwZWFoZWFkIiwiaGludCIsImhpZ2hsaWdodCIsIm1pbkxlbmd0aCIsImNsYXNzTmFtZXMiLCJtZW51IiwibmFtZSIsImRpc3BsYXkiLCJpdGVtIiwiZm9ybWF0dGVkX2FkZHJlc3MiLCJsaW1pdCIsInNvdXJjZSIsInEiLCJzeW5jIiwiYXN5bmMiLCJnZW9jb2RlIiwiYWRkcmVzcyIsInJlc3VsdHMiLCJzdGF0dXMiLCJvbiIsIm9iaiIsImRhdHVtIiwiZ2VvbWV0cnkiLCJ1cGRhdGVWaWV3cG9ydCIsInZpZXdwb3J0IiwialF1ZXJ5IiwiTGFuZ3VhZ2VNYW5hZ2VyIiwibGFuZ3VhZ2UiLCJkaWN0aW9uYXJ5IiwiJHRhcmdldHMiLCJ1cGRhdGVQYWdlTGFuZ3VhZ2UiLCJ0YXJnZXRMYW5ndWFnZSIsInJvd3MiLCJmaWx0ZXIiLCJpIiwibGFuZyIsImVhY2giLCJpbmRleCIsInRhcmdldEF0dHJpYnV0ZSIsImRhdGEiLCJsYW5nVGFyZ2V0IiwidGV4dCIsInZhbCIsImF0dHIiLCJ0YXJnZXRzIiwiYWpheCIsInVybCIsImRhdGFUeXBlIiwic3VjY2VzcyIsInVwZGF0ZUxhbmd1YWdlIiwiTGlzdE1hbmFnZXIiLCJ0YXJnZXRMaXN0IiwicmVuZGVyRXZlbnQiLCJkYXRlIiwibW9tZW50Iiwic3RhcnRfZGF0ZXRpbWUiLCJmb3JtYXQiLCJldmVudF90eXBlIiwibGF0IiwibG5nIiwidGl0bGUiLCJ2ZW51ZSIsInJlbmRlckdyb3VwIiwiZGV0YWlscyIsIiRsaXN0IiwidXBkYXRlRmlsdGVyIiwicCIsInJlbW92ZVByb3AiLCJhZGRDbGFzcyIsImpvaW4iLCJwb3B1bGF0ZUxpc3QiLCIkZXZlbnRMaXN0Iiwid2luZG93IiwiRVZFTlRTX0RBVEEiLCJtYXAiLCJmaW5kIiwicmVtb3ZlIiwiYXBwZW5kIiwiTWFwTWFuYWdlciIsInJlbmRlckdlb2pzb24iLCJsaXN0IiwicmVuZGVyZWQiLCJ0b0xvd2VyQ2FzZSIsInR5cGUiLCJjb29yZGluYXRlcyIsInByb3BlcnRpZXMiLCJldmVudFByb3BlcnRpZXMiLCJwb3B1cENvbnRlbnQiLCJjYWxsYmFjayIsIkwiLCJzZXRWaWV3IiwidGlsZUxheWVyIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsIiRtYXAiLCJzZXRCb3VuZHMiLCJib3VuZHMxIiwiYm91bmRzMiIsImJvdW5kcyIsImZpdEJvdW5kcyIsInNldENlbnRlciIsImNlbnRlciIsInpvb20iLCJnZXRDZW50ZXJCeUxvY2F0aW9uIiwibG9jYXRpb24iLCJmaWx0ZXJNYXAiLCJmaWx0ZXJzIiwiaGlkZSIsImZvckVhY2giLCJzaG93IiwicGxvdFBvaW50cyIsImdlb2pzb24iLCJmZWF0dXJlcyIsImdlb0pTT04iLCJwb2ludFRvTGF5ZXIiLCJmZWF0dXJlIiwibGF0bG5nIiwiZXZlbnRUeXBlIiwiZ2VvanNvbk1hcmtlck9wdGlvbnMiLCJyYWRpdXMiLCJmaWxsQ29sb3IiLCJjb2xvciIsIndlaWdodCIsIm9wYWNpdHkiLCJmaWxsT3BhY2l0eSIsImNsYXNzTmFtZSIsImNpcmNsZU1hcmtlciIsIm9uRWFjaEZlYXR1cmUiLCJsYXllciIsImJpbmRQb3B1cCIsInVwZGF0ZSIsImxhdExuZyIsInRhcmdldEZvcm0iLCJwcmV2aW91cyIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImZvcm0iLCJkZXBhcmFtIiwic2VyaWFsaXplIiwiaGFzaCIsInBhcmFtIiwidHJpZ2dlciIsImxlbmd0aCIsInBhcmFtcyIsInN1YnN0cmluZyIsImJvdW5kMSIsImJvdW5kMiIsImxvYyIsInByb3AiLCJnZXRQYXJhbWV0ZXJzIiwicGFyYW1ldGVycyIsInVwZGF0ZUxvY2F0aW9uIiwiZiIsImIiLCJKU09OIiwic3RyaW5naWZ5IiwidHJpZ2dlclN1Ym1pdCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7QUFDQSxJQUFNQSxzQkFBdUIsVUFBU0MsQ0FBVCxFQUFZO0FBQ3ZDOztBQUVBLFNBQU8sVUFBQ0MsTUFBRCxFQUFZOztBQUVqQixRQUFNQyxVQUFVLHlDQUFoQjtBQUNBLFFBQU1DLGFBQWEsT0FBT0YsTUFBUCxJQUFpQixRQUFqQixHQUE0QkcsU0FBU0MsYUFBVCxDQUF1QkosTUFBdkIsQ0FBNUIsR0FBNkRBLE1BQWhGO0FBQ0EsUUFBTUssV0FBV0MsY0FBakI7QUFDQSxRQUFJQyxXQUFXLElBQUlDLE9BQU9DLElBQVAsQ0FBWUMsUUFBaEIsRUFBZjs7QUFFQSxXQUFPO0FBQ0xDLGVBQVNaLEVBQUVHLFVBQUYsQ0FESjtBQUVMRixjQUFRRSxVQUZIO0FBR0xVLGtCQUFZLHNCQUFNO0FBQ2hCYixVQUFFRyxVQUFGLEVBQWNXLFNBQWQsQ0FBd0I7QUFDWkMsZ0JBQU0sSUFETTtBQUVaQyxxQkFBVyxJQUZDO0FBR1pDLHFCQUFXLENBSEM7QUFJWkMsc0JBQVk7QUFDVkMsa0JBQU07QUFESTtBQUpBLFNBQXhCLEVBUVU7QUFDRUMsZ0JBQU0sZ0JBRFI7QUFFRUMsbUJBQVMsaUJBQUNDLElBQUQ7QUFBQSxtQkFBVUEsS0FBS0MsaUJBQWY7QUFBQSxXQUZYO0FBR0VDLGlCQUFPLEVBSFQ7QUFJRUMsa0JBQVEsZ0JBQVVDLENBQVYsRUFBYUMsSUFBYixFQUFtQkMsS0FBbkIsRUFBeUI7QUFDN0JwQixxQkFBU3FCLE9BQVQsQ0FBaUIsRUFBRUMsU0FBU0osQ0FBWCxFQUFqQixFQUFpQyxVQUFVSyxPQUFWLEVBQW1CQyxNQUFuQixFQUEyQjtBQUMxREosb0JBQU1HLE9BQU47QUFDRCxhQUZE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QUFiLEVBQW1DakMsR0FBbkMsQ0FBdUNnSCxLQUFLQyxTQUFMLENBQWV6RCxPQUFPLENBQVAsQ0FBZixDQUF2QztBQUNBcEcsZ0JBQVE2RSxJQUFSLENBQWEsb0JBQWIsRUFBbUNqQyxHQUFuQyxDQUF1Q2dILEtBQUtDLFNBQUwsQ0FBZXpELE9BQU8sQ0FBUCxDQUFmLENBQXZDO0FBQ0FwRyxnQkFBUStJLE9BQVIsQ0FBZ0IsUUFBaEI7QUFDRCxPQXpDSTtBQTBDTGUscUJBQWUseUJBQU07QUFDbkI5SixnQkFBUStJLE9BQVIsQ0FBZ0IsUUFBaEI7QUFDRDtBQTVDSSxLQUFQO0FBOENELEdBcEVEO0FBcUVELENBdEVvQixDQXNFbEJwSCxNQXRFa0IsQ0FBckIiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vL0FQSSA6QUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXG5jb25zdCBBdXRvY29tcGxldGVNYW5hZ2VyID0gKGZ1bmN0aW9uKCQpIHtcbiAgLy9Jbml0aWFsaXphdGlvbi4uLlxuXG4gIHJldHVybiAodGFyZ2V0KSA9PiB7XG5cbiAgICBjb25zdCBBUElfS0VZID0gXCJBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cIjtcbiAgICBjb25zdCB0YXJnZXRJdGVtID0gdHlwZW9mIHRhcmdldCA9PSBcInN0cmluZ1wiID8gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpIDogdGFyZ2V0O1xuICAgIGNvbnN0IHF1ZXJ5TWdyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgdmFyIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgJHRhcmdldDogJCh0YXJnZXRJdGVtKSxcbiAgICAgIHRhcmdldDogdGFyZ2V0SXRlbSxcbiAgICAgIGluaXRpYWxpemU6ICgpID0+IHtcbiAgICAgICAgJCh0YXJnZXRJdGVtKS50eXBlYWhlYWQoe1xuICAgICAgICAgICAgICAgICAgICBoaW50OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1pbkxlbmd0aDogNCxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICAgIG1lbnU6ICd0dC1kcm9wZG93bi1tZW51J1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnc2VhcmNoLXJlc3VsdHMnLFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAoaXRlbSkgPT4gaXRlbS5mb3JtYXR0ZWRfYWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgbGltaXQ6IDEwLFxuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IGZ1bmN0aW9uIChxLCBzeW5jLCBhc3luYyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogcSB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFzeW5jKHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApLm9uKCd0eXBlYWhlYWQ6c2VsZWN0ZWQnLCBmdW5jdGlvbiAob2JqLCBkYXR1bSkge1xuICAgICAgICAgICAgICAgICAgICBpZihkYXR1bSlcbiAgICAgICAgICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgICAgICAgdmFyIGdlb21ldHJ5ID0gZGF0dW0uZ2VvbWV0cnk7XG4gICAgICAgICAgICAgICAgICAgICAgcXVlcnlNZ3IudXBkYXRlVmlld3BvcnQoZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgICAgIC8vICBtYXAuZml0Qm91bmRzKGdlb21ldHJ5LmJvdW5kcz8gZ2VvbWV0cnkuYm91bmRzIDogZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG5cblxuICAgIHJldHVybiB7XG5cbiAgICB9XG4gIH1cblxufShqUXVlcnkpKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTGFuZ3VhZ2VNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIC8va2V5VmFsdWVcblxuICAvL3RhcmdldHMgYXJlIHRoZSBtYXBwaW5ncyBmb3IgdGhlIGxhbmd1YWdlXG4gIHJldHVybiAoKSA9PiB7XG4gICAgbGV0IGxhbmd1YWdlO1xuICAgIGxldCBkaWN0aW9uYXJ5ID0ge307XG4gICAgbGV0ICR0YXJnZXRzID0gJChcIltkYXRhLWxhbmctdGFyZ2V0XVtkYXRhLWxhbmcta2V5XVwiKTtcblxuICAgIGNvbnN0IHVwZGF0ZVBhZ2VMYW5ndWFnZSA9ICgpID0+IHtcblxuICAgICAgbGV0IHRhcmdldExhbmd1YWdlID0gZGljdGlvbmFyeS5yb3dzLmZpbHRlcigoaSkgPT4gaS5sYW5nID09PSBsYW5ndWFnZSlbMF07XG5cbiAgICAgICR0YXJnZXRzLmVhY2goKGluZGV4LCBpdGVtKSA9PiB7XG4gICAgICAgIGxldCB0YXJnZXRBdHRyaWJ1dGUgPSAkKGl0ZW0pLmRhdGEoJ2xhbmctdGFyZ2V0Jyk7XG4gICAgICAgIGxldCBsYW5nVGFyZ2V0ID0gJChpdGVtKS5kYXRhKCdsYW5nLWtleScpO1xuXG4gICAgICAgIHN3aXRjaCh0YXJnZXRBdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjYXNlICd0ZXh0JzpcbiAgICAgICAgICAgICQoaXRlbSkudGV4dCh0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd2YWx1ZSc6XG4gICAgICAgICAgICAkKGl0ZW0pLnZhbCh0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgJChpdGVtKS5hdHRyKHRhcmdldEF0dHJpYnV0ZSwgdGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICBsYW5ndWFnZSxcbiAgICAgIHRhcmdldHM6ICR0YXJnZXRzLFxuICAgICAgZGljdGlvbmFyeSxcbiAgICAgIGluaXRpYWxpemU6IChsYW5nKSA9PiB7XG4vL2NvbnNvbGUubG9nKFwiJHRhcmdldHNcIiwgbGFuZyk7XG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgdXJsOiAnaHR0cDovL2dzeDJqc29uLmNvbS9hcGk/aWQ9MU8zZUJ5akwxdmxZZjdaN2FtLV9odFJUUWk3M1BhZnFJZk5CZExtWGU4U00mc2hlZXQ9MScsXG4gICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgZGljdGlvbmFyeSA9IGRhdGE7XG4gICAgICAgICAgICBsYW5ndWFnZSA9IGxhbmc7XG4gICAgICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZUxhbmd1YWdlOiAobGFuZykgPT4ge1xuLy9jb25zb2xlLmxvZyhcIk5ldyBMYW5nIDo6OiBcIiwgbGFuZyk7XG4gICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgdXBkYXRlUGFnZUxhbmd1YWdlKCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG59KShqUXVlcnkpO1xuIiwiLyogVGhpcyBsb2FkcyBhbmQgbWFuYWdlcyB0aGUgbGlzdCEgKi9cblxuY29uc3QgTGlzdE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRMaXN0ID0gXCIjZXZlbnRzLWxpc3RcIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0TGlzdCA9PT0gJ3N0cmluZycgPyAkKHRhcmdldExpc3QpIDogdGFyZ2V0TGlzdDtcblxuICAgIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0pID0+IHtcblxuICAgICAgdmFyIGRhdGUgPSBtb21lbnQoaXRlbS5zdGFydF9kYXRldGltZSkuZm9ybWF0KFwiZGRkZCDigKIgTU1NIEREIGg6bW1hXCIpO1xuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaSBjbGFzcz0nJHtpdGVtLmV2ZW50X3R5cGUgfHwgJyd9IEFjdGlvbicgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudCB0eXBlLWFjdGlvblwiPlxuICAgICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICAgIDxsaT4ke2l0ZW0uZXZlbnRfdHlwZX08L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPGgyPjxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZX08L2E+PC9oMj5cbiAgICAgICAgICA8aDQ+JHtkYXRlfTwvaDQ+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgICAgPHA+JHtpdGVtLnZlbnVlfTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIvLyR7aXRlbS51cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCI+UlNWUDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICAgYFxuICAgIH07XG5cbiAgICBjb25zdCByZW5kZXJHcm91cCA9IChpdGVtKSA9PiB7XG5cbiAgICAgIHJldHVybiBgXG4gICAgICA8bGk+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwXCI+XG4gICAgICAgICAgPGgyPjxhIGhyZWY9XCIvXCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZSB8fCBgR3JvdXBgfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICAgIDxwPkNvbG9yYWRvLCBVU0E8L3A+XG4gICAgICAgICAgICA8cD4ke2l0ZW0uZGV0YWlscyB8fCBgMzUwIENvbG9yYWRvIGlzIHdvcmtpbmcgbG9jYWxseSB0byBoZWxwIGJ1aWxkIHRoZSBnbG9iYWxcbiAgICAgICAgICAgICAgIDM1MC5vcmcgbW92ZW1lbnQgdG8gc29sdmUgdGhlIGNsaW1hdGUgY3Jpc2lzIGFuZCB0cmFuc2l0aW9uXG4gICAgICAgICAgICAgICB0byBhIGNsZWFuLCByZW5ld2FibGUgZW5lcmd5IGZ1dHVyZS5gfVxuICAgICAgICAgICAgPC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICRsaXN0OiAkdGFyZ2V0LFxuICAgICAgdXBkYXRlRmlsdGVyOiAocCkgPT4ge1xuICAgICAgICBpZighcCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIFJlbW92ZSBGaWx0ZXJzXG5cbiAgICAgICAgJHRhcmdldC5yZW1vdmVQcm9wKFwiY2xhc3NcIik7XG4gICAgICAgICR0YXJnZXQuYWRkQ2xhc3MocC5maWx0ZXIgPyBwLmZpbHRlci5qb2luKFwiIFwiKSA6ICcnKVxuICAgICAgfSxcbiAgICAgIHBvcHVsYXRlTGlzdDogKCkgPT4ge1xuICAgICAgICAvL3VzaW5nIHdpbmRvdy5FVkVOVF9EQVRBXG5cbiAgICAgICAgdmFyICRldmVudExpc3QgPSB3aW5kb3cuRVZFTlRTX0RBVEEubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgIHJldHVybiBpdGVtLmV2ZW50X3R5cGUgIT09ICdHcm91cCcgPyByZW5kZXJFdmVudChpdGVtKSA6IHJlbmRlckdyb3VwKGl0ZW0pO1xuICAgICAgICB9KVxuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsIGxpJykucmVtb3ZlKCk7XG4gICAgICAgICR0YXJnZXQuZmluZCgndWwnKS5hcHBlbmQoJGV2ZW50TGlzdCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsIlxuY29uc3QgTWFwTWFuYWdlciA9ICgoJCkgPT4ge1xuXG4gIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0pID0+IHtcbiAgICB2YXIgZGF0ZSA9IG1vbWVudChpdGVtLnN0YXJ0X2RhdGV0aW1lKS5mb3JtYXQoXCJkZGRkIOKAoiBNTU0gREQgaDptbWFcIik7XG4gICAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPSdwb3B1cC1pdGVtICR7aXRlbS5ldmVudF90eXBlfScgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnRcIj5cbiAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgIDxsaT4ke2l0ZW0uZXZlbnRfdHlwZSB8fCAnQWN0aW9uJ308L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8aDI+PGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICA8aDQ+JHtkYXRlfTwvaDQ+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5SU1ZQPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICAgIGBcbiAgfTtcblxuICBjb25zdCByZW5kZXJHcm91cCA9IChpdGVtKSA9PiB7XG4gICAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPSdwb3B1cC1pdGVtICR7aXRlbS5ldmVudF90eXBlfScgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXBcIj5cbiAgICAgICAgPGgyPjxhIGhyZWY9XCIvXCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZSB8fCBgR3JvdXBgfTwvYT48L2gyPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgPHA+Q29sb3JhZG8sIFVTQTwvcD5cbiAgICAgICAgICA8cD4ke2l0ZW0uZGV0YWlscyB8fCBgMzUwIENvbG9yYWRvIGlzIHdvcmtpbmcgbG9jYWxseSB0byBoZWxwIGJ1aWxkIHRoZSBnbG9iYWxcbiAgICAgICAgICAgICAzNTAub3JnIG1vdmVtZW50IHRvIHNvbHZlIHRoZSBjbGltYXRlIGNyaXNpcyBhbmQgdHJhbnNpdGlvblxuICAgICAgICAgICAgIHRvIGEgY2xlYW4sIHJlbmV3YWJsZSBlbmVyZ3kgZnV0dXJlLmB9XG4gICAgICAgICAgPC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIi8vJHtpdGVtLnVybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgYFxuICB9O1xuXG4gIGNvbnN0IHJlbmRlckdlb2pzb24gPSAobGlzdCkgPT4ge1xuICAgIHJldHVybiBsaXN0Lm1hcCgoaXRlbSkgPT4ge1xuICAgICAgLy8gcmVuZGVyZWQgZXZlbnRUeXBlXG4gICAgICBsZXQgcmVuZGVyZWQ7XG4gICAgICBpZiAoIWl0ZW0uZXZlbnRfdHlwZSB8fCAhaXRlbS5ldmVudF90eXBlLnRvTG93ZXJDYXNlKCkgIT09ICdncm91cCcpIHtcbiAgICAgICAgcmVuZGVyZWQgPSByZW5kZXJFdmVudChpdGVtKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlbmRlcmVkID0gcmVuZGVyR3JvdXAoaXRlbSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICB0eXBlOiBcIlBvaW50XCIsXG4gICAgICAgICAgY29vcmRpbmF0ZXM6IFtpdGVtLmxuZywgaXRlbS5sYXRdXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBldmVudFByb3BlcnRpZXM6IGl0ZW0sXG4gICAgICAgICAgcG9wdXBDb250ZW50OiByZW5kZXJlZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAoY2FsbGJhY2spID0+IHtcbiAgICB2YXIgbWFwID0gTC5tYXAoJ21hcCcpLnNldFZpZXcoWzM0Ljg4NTkzMDk0MDc1MzE3LCA1LjA5NzY1NjI1MDAwMDAwMV0sIDIpO1xuXG4gICAgTC50aWxlTGF5ZXIoJ2h0dHA6Ly97c30udGlsZS5vc20ub3JnL3t6fS97eH0ve3l9LnBuZycsIHtcbiAgICAgICAgYXR0cmlidXRpb246ICcmY29weTsgPGEgaHJlZj1cImh0dHA6Ly9vc20ub3JnL2NvcHlyaWdodFwiPk9wZW5TdHJlZXRNYXA8L2E+IGNvbnRyaWJ1dG9ycyDigKIgPGEgaHJlZj1cIi8vMzUwLm9yZ1wiPjM1MC5vcmc8L2E+J1xuICAgIH0pLmFkZFRvKG1hcCk7XG5cbiAgICBsZXQgZ2VvY29kZXIgPSBudWxsO1xuICAgIHJldHVybiB7XG4gICAgICAkbWFwOiBtYXAsXG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHNldEJvdW5kczogKGJvdW5kczEsIGJvdW5kczIpID0+IHtcbiAgICAgICAgY29uc3QgYm91bmRzID0gW2JvdW5kczEsIGJvdW5kczJdO1xuICAgICAgICBtYXAuZml0Qm91bmRzKGJvdW5kcyk7XG4gICAgICB9LFxuICAgICAgc2V0Q2VudGVyOiAoY2VudGVyLCB6b29tID0gMTApID0+IHtcbiAgICAgICAgaWYgKCFjZW50ZXIgfHwgIWNlbnRlclswXSB8fCBjZW50ZXJbMF0gPT0gXCJcIlxuICAgICAgICAgICAgICB8fCAhY2VudGVyWzFdIHx8IGNlbnRlclsxXSA9PSBcIlwiKSByZXR1cm47XG4gICAgICAgIG1hcC5zZXRWaWV3KGNlbnRlciwgem9vbSk7XG4gICAgICB9LFxuICAgICAgLy8gQ2VudGVyIGxvY2F0aW9uIGJ5IGdlb2NvZGVkXG4gICAgICBnZXRDZW50ZXJCeUxvY2F0aW9uOiAobG9jYXRpb24sIGNhbGxiYWNrKSA9PiB7XG4vL2NvbnNvbGUubG9nKFwiRmluZGluZyBsb2NhdGlvbiBvZiBcIiwgbG9jYXRpb24pO1xuICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogbG9jYXRpb24gfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuLy9jb25zb2xlLmxvZyhcIkxPQ0FUSU9OIE1BVENIOjogXCIsIHJlc3VsdHMsIHN0YXR1cyk7XG4gICAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2socmVzdWx0c1swXSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGZpbHRlck1hcDogKGZpbHRlcnMpID0+IHtcbi8vY29uc29sZS5sb2coXCJmaWx0ZXJzID4+IFwiLCBmaWx0ZXJzKTtcbiAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwXCIpLmhpZGUoKTtcbi8vY29uc29sZS5sb2coJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwXCIpKTtcblxuICAgICAgICBpZiAoIWZpbHRlcnMpIHJldHVybjtcblxuICAgICAgICBmaWx0ZXJzLmZvckVhY2goKGl0ZW0pID0+IHtcbi8vY29uc29sZS5sb2coXCIuZXZlbnQtaXRlbS1wb3B1cC5cIiArIGl0ZW0udG9Mb3dlckNhc2UoKSk7XG4gICAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwLlwiICsgaXRlbS50b0xvd2VyQ2FzZSgpKS5zaG93KCk7XG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgcGxvdFBvaW50czogKGxpc3QpID0+IHtcblxuICAgICAgICBjb25zdCBnZW9qc29uID0ge1xuICAgICAgICAgIHR5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgICAgICAgICBmZWF0dXJlczogcmVuZGVyR2VvanNvbihsaXN0KVxuICAgICAgICB9O1xuXG5cblxuICAgICAgICBMLmdlb0pTT04oZ2VvanNvbiwge1xuICAgICAgICAgICAgcG9pbnRUb0xheWVyOiAoZmVhdHVyZSwgbGF0bG5nKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuZXZlbnRfdHlwZTtcbiAgICAgICAgICAgICAgdmFyIGdlb2pzb25NYXJrZXJPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgICAgcmFkaXVzOiA4LFxuICAgICAgICAgICAgICAgICAgZmlsbENvbG9yOiAgZXZlbnRUeXBlID09PSAnR3JvdXAnID8gXCIjNDBEN0Q0XCIgOiBcIiMwRjgxRThcIixcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiBcIndoaXRlXCIsXG4gICAgICAgICAgICAgICAgICB3ZWlnaHQ6IDIsXG4gICAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLjUsXG4gICAgICAgICAgICAgICAgICBmaWxsT3BhY2l0eTogMC44LFxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAoZXZlbnRUeXBlID09PSAnR3JvdXAnID8gJ2dyb3VwcycgOiAnZXZlbnRzJykgKyAnIGV2ZW50LWl0ZW0tcG9wdXAnXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJldHVybiBMLmNpcmNsZU1hcmtlcihsYXRsbmcsIGdlb2pzb25NYXJrZXJPcHRpb25zKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICBvbkVhY2hGZWF0dXJlOiAoZmVhdHVyZSwgbGF5ZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChmZWF0dXJlLnByb3BlcnRpZXMgJiYgZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCkge1xuICAgICAgICAgICAgICBsYXllci5iaW5kUG9wdXAoZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgICB9LFxuICAgICAgdXBkYXRlOiAocCkgPT4ge1xuICAgICAgICBpZiAoIXAgfHwgIXAubGF0IHx8ICFwLmxuZyApIHJldHVybjtcblxuICAgICAgICBtYXAuc2V0VmlldyhMLmxhdExuZyhwLmxhdCwgcC5sbmcpLCAxMCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsImNvbnN0IFF1ZXJ5TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldEZvcm0gPSBcImZvcm0jZmlsdGVycy1mb3JtXCIpID0+IHtcbiAgICBjb25zdCAkdGFyZ2V0ID0gdHlwZW9mIHRhcmdldEZvcm0gPT09ICdzdHJpbmcnID8gJCh0YXJnZXRGb3JtKSA6IHRhcmdldEZvcm07XG4gICAgbGV0IGxhdCA9IG51bGw7XG4gICAgbGV0IGxuZyA9IG51bGw7XG5cbiAgICBsZXQgcHJldmlvdXMgPSB7fTtcblxuICAgICR0YXJnZXQub24oJ3N1Ym1pdCcsIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBsYXQgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKCk7XG4gICAgICBsbmcgPSAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKCk7XG5cbiAgICAgIHZhciBmb3JtID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuXG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICQucGFyYW0oZm9ybSk7XG4gICAgfSlcblxuICAgICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdJywgKCkgPT4ge1xuICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICB9KVxuXG5cbiAgICByZXR1cm4ge1xuICAgICAgaW5pdGlhbGl6ZTogKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdmFyIHBhcmFtcyA9ICQuZGVwYXJhbSh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkpXG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYW5nXVwiKS52YWwocGFyYW1zLmxhbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwocGFyYW1zLmxhdCk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChwYXJhbXMubG5nKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKHBhcmFtcy5ib3VuZDEpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwocGFyYW1zLmJvdW5kMik7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sb2NdXCIpLnZhbChwYXJhbXMubG9jKVxuXG4gICAgICAgICAgaWYgKHBhcmFtcy5maWx0ZXIpIHtcbiAgICAgICAgICAgICR0YXJnZXQuZmluZChcIi5maWx0ZXItaXRlbSBpbnB1dFt0eXBlPWNoZWNrYm94XVwiKS5yZW1vdmVQcm9wKFwiY2hlY2tlZFwiKTtcbiAgICAgICAgICAgIHBhcmFtcy5maWx0ZXIuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdW3ZhbHVlPSdcIiArIGl0ZW0gKyBcIiddXCIpLnByb3AoXCJjaGVja2VkXCIsIHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBnZXRQYXJhbWV0ZXJzOiAoKSA9PiB7XG4gICAgICAgIHZhciBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKCR0YXJnZXQuc2VyaWFsaXplKCkpO1xuICAgICAgICAvLyBwYXJhbWV0ZXJzWydsb2NhdGlvbiddIDtcblxuICAgICAgICByZXR1cm4gcGFyYW1ldGVycztcbiAgICAgIH0sXG4gICAgICB1cGRhdGVMb2NhdGlvbjogKGxhdCwgbG5nKSA9PiB7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwobGF0KTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChsbmcpO1xuICAgICAgICAvLyAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZVZpZXdwb3J0OiAodmlld3BvcnQpID0+IHtcblxuICAgICAgICBjb25zdCBib3VuZHMgPSBbW3ZpZXdwb3J0LmYuYiwgdmlld3BvcnQuYi5iXSwgW3ZpZXdwb3J0LmYuZiwgdmlld3BvcnQuYi5mXV07XG5cbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMF0pKTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMV0pKTtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyU3VibWl0OiAoKSA9PiB7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59KShqUXVlcnkpO1xuIl19
