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
      forceSearch: function forceSearch(q) {
        geocoder.geocode({ address: q }, function (results, status) {
          if (results[0]) {
            var geometry = results[0].geometry;
            queryMgr.updateViewport(geometry.viewport);
            $(targetItem).val(results[0].formatted_address);
          }
          // var geometry = datum.geometry;
          // queryMgr.updateViewport(geometry.viewport);
        });
      },
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

var Helper = function ($) {
  return {
    refSource: function refSource(url, ref, src) {
      // Jun 13 2018 — Fix for source and referrer
      if (ref || src) {
        if (url.indexOf("?") >= 0) {
          url = url + "&referrer=" + (ref || "") + "&source=" + (src || "");
        } else {
          url = url + "?referrer=" + (ref || "") + "&source=" + (src || "");
        }
      }

      return url;
    }
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

            $("[data-lang-key=\"" + langTarget + "\"]").text(targetLanguage[langTarget]);
            if (langTarget == "more-search-options") {}
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

        return $.ajax({
          // url: 'https://gsx2json.com/api?id=1O3eByjL1vlYf7Z7am-_htRTQi73PafqIfNBdLmXe8SM&sheet=1',
          url: '/data/lang.json',
          dataType: 'json',
          success: function success(data) {
            dictionary = data;
            language = lang;
            updatePageLanguage();

            $(document).trigger('trigger-language-loaded');

            $("#language-opts").multiselect('select', lang);
          }
        });
      },
      refresh: function refresh() {
        updatePageLanguage(language);
      },
      updateLanguage: function updateLanguage(lang) {

        language = lang;
        updatePageLanguage();
      },
      getTranslation: function getTranslation(key) {
        var targetLanguage = dictionary.rows.filter(function (i) {
          return i.lang === language;
        })[0];
        return targetLanguage[key];
      }
    };
  };
}(jQuery);
'use strict';

/* This loads and manages the list! */

var ListManager = function ($) {
  return function (options) {
    var targetList = options.targetList || "#events-list";
    // June 13 `18 – referrer and source
    var referrer = options.referrer,
        source = options.source;


    var $target = typeof targetList === 'string' ? $(targetList) : targetList;
    var d3Target = typeof targetList === 'string' ? d3.select(targetList) : targetList;

    var renderEvent = function renderEvent(item) {
      var referrer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      var m = moment(new Date(item.start_datetime));
      m = m.utc().subtract(m.utcOffset(), 'm');
      var date = m.format("dddd MMM DD, h:mma");
      var url = item.url.match(/^https{0,1}:/) ? item.url : "//" + item.url;
      // let superGroup = window.slugify(item.supergroup);
      url = Helper.refSource(url, referrer, source);

      //<li class='${window.slugify(item.event_type)} events event-obj' data-lat='${item.lat}' data-lng='${item.lng}'>
      return '\n\n        <div class="type-event type-action">\n          <ul class="event-types-list">\n            <li class=\'tag-' + item.event_type + ' tag\'>' + item.event_type + '</li>\n          </ul>\n          <h2 class="event-title"><a href="' + url + '" target=\'_blank\'>' + item.title + '</a></h2>\n          <div class="event-date date">' + date + '</div>\n          <div class="event-address address-area">\n            <p>' + item.venue + '</p>\n          </div>\n          <div class="call-to-action">\n            <a href="' + url + '" target=\'_blank\' class="btn btn-secondary">RSVP</a>\n          </div>\n        </div>\n      ';
    };

    var renderGroup = function renderGroup(item) {
      var referrer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      var url = item.website.match(/^https{0,1}:/) ? item.website : "//" + item.website;
      var superGroup = window.slugify(item.supergroup);

      url = Helper.refSource(url, referrer, source);

      //<li class='${item.event_type} ${superGroup} group-obj' data-lat='${item.lat}' data-lng='${item.lng}'>
      return '\n        <div class="type-group group-obj">\n          <ul class="event-types-list">\n            <li class="tag tag-' + item.supergroup + '">' + item.supergroup + '</li>\n          </ul>\n          <h2><a href="' + url + '" target=\'_blank\'>' + item.name + '</a></h2>\n          <div class="group-details-area">\n            <div class="group-location location">' + item.location + '</div>\n            <div class="group-description">\n              <p>' + item.description + '</p>\n            </div>\n          </div>\n          <div class="call-to-action">\n            <a href="' + url + '" target=\'_blank\' class="btn btn-secondary">Get Involved</a>\n          </div>\n        </div>\n      ';
    };

    return {
      $list: $target,
      updateFilter: function updateFilter(p) {
        if (!p) return;

        // Remove Filters

        $target.removeProp("class");
        $target.addClass(p.filter ? p.filter.join(" ") : '');

        // $target.find('li').hide();

        if (p.filter) {
          p.filter.forEach(function (fil) {
            $target.find('li.' + fil).show();
          });
        }
      },
      updateBounds: function updateBounds(bound1, bound2, filters) {
        // const bounds = [p.bounds1, p.bounds2];

        //
        // $target.find('ul li.event-obj, ul li.group-obj').each((ind, item)=> {
        //
        //   let _lat = $(item).data('lat'),
        //       _lng = $(item).data('lng');
        //
        //   const mi10 = 0.1449;
        //
        //   if (bound1[0] <= _lat && bound2[0] >= _lat && bound1[1] <= _lng && bound2[1] >= _lng) {
        //
        //     $(item).addClass('within-bound');
        //   } else {
        //     $(item).removeClass('within-bound');
        //   }
        // });
        //
        // let _visible = $target.find('ul li.event-obj.within-bound, ul li.group-obj.within-bound').length;

        var data = window.EVENTS_DATA.data.filter(function (item) {
          var type = item.event_type ? item.event_type.toLowerCase() : '';
          return filters && (filters.length == 0 /* If it's in filter */
          ? true : filters.includes(type != 'group' ? type : window.slugify(item.supergroup))) && /* If it's in bounds */
          bound1[0] <= item.lat && bound2[0] >= item.lat && bound1[1] <= item.lng && bound2[1] >= item.lng;
        });

        var listContainer = d3Target.select("ul");
        listContainer.selectAll("li.org-list-item").remove();
        listContainer.selectAll("li.org-list-item").data(data, function (item) {
          return item.event_type == 'group' ? item.website : item.url;
        }).enter().append('li').attr("class", function (item) {
          return item.event_type != 'group' ? 'org-list-item events event-obj' : 'org-list-item group-obj';
        }).html(function (item) {
          return item.event_type != 'group' ? renderEvent(item, referrer, source) : renderGroup(item);
        });

        if (data.length == 0) {
          // The list is empty
          $target.addClass("is-empty");
        } else {
          $target.removeClass("is-empty");
        }
      },
      populateList: function populateList(hardFilters) {
        //using window.EVENT_DATA
        var keySet = !hardFilters.key ? [] : hardFilters.key.split(',');
        // var $eventList = window.EVENTS_DATA.data.map(item => {
        //   if (keySet.length == 0) {
        //     return item.event_type && item.event_type.toLowerCase() == 'group' ? renderGroup(item) : renderEvent(item, referrer, source);
        //   } else if (keySet.length > 0 && item.event_type != 'group' && keySet.includes(item.event_type)) {
        //     return renderEvent(item, referrer, source);
        //   } else if (keySet.length > 0 && item.event_type == 'group' && keySet.includes(item.supergroup)) {
        //     return renderGroup(item, referrer, source)
        //   }
        //   return null;
        // })

        // const eventType = item.event_type ? item.event_type.toLowerCase() : null;
        // const initialData = window.EVENTS_DATA.data.filter(item => keySet.length == 0
        //                                         ? true
        //                                         : keySet.includes(item.event_type != 'group' ? item.event_type : window.slugify(item.supergroup)));
        // const listContainer = d3Target.select("ul");
        // listContainer.selectAll("li")
        //   .data(initialData, (item) => item ? item.url : '')
        //   .enter()
        //   .append('li')
        //     .attr("class", (item) => item.event_type != 'group' ? 'events event-obj' : 'group-obj')
        //     .html((item) => item.event_type != 'group' ? renderEvent(item, referrer, source) : renderGroup(item))
        //   .exit();
        // .remove();
        // console.log(listContainer);
        // $target.find('ul li').remove();
        // $target.find('ul').append($eventList);
      }
    };
  };
}(jQuery);
'use strict';

var MapManager = function ($) {
  var LANGUAGE = 'en';

  var renderEvent = function renderEvent(item) {
    var referrer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;


    var m = moment(new Date(item.start_datetime));
    m = m.utc().subtract(m.utcOffset(), 'm');

    var date = m.format("dddd MMM DD, h:mma");
    var url = item.url.match(/^https{0,1}:/) ? item.url : "//" + item.url;

    url = Helper.refSource(url, referrer, source);

    var superGroup = window.slugify(item.supergroup);
    return '\n    <div class=\'popup-item ' + item.event_type + ' ' + superGroup + '\' data-lat=\'' + item.lat + '\' data-lng=\'' + item.lng + '\'>\n      <div class="type-event">\n        <ul class="event-types-list">\n          <li class="tag tag-' + item.event_type + '">' + (item.event_type || 'Action') + '</li>\n        </ul>\n        <h2 class="event-title"><a href="' + url + '" target=\'_blank\'>' + item.title + '</a></h2>\n        <div class="event-date">' + date + '</div>\n        <div class="event-address address-area">\n          <p>' + item.venue + '</p>\n        </div>\n        <div class="call-to-action">\n          <a href="' + url + '" target=\'_blank\' class="btn btn-secondary">RSVP</a>\n        </div>\n      </div>\n    </div>\n    ';
  };

  var renderGroup = function renderGroup(item) {
    var referrer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;


    var url = item.website.match(/^https{0,1}:/) ? item.website : "//" + item.website;

    url = Helper.refSource(url, referrer, source);

    var superGroup = window.slugify(item.supergroup);
    return '\n    <li>\n      <div class="type-group group-obj ' + superGroup + '">\n        <ul class="event-types-list">\n          <li class="tag tag-' + item.supergroup + ' ' + superGroup + '">' + item.supergroup + '</li>\n        </ul>\n        <div class="group-header">\n          <h2><a href="' + url + '" target=\'_blank\'>' + item.name + '</a></h2>\n          <div class="group-location location">' + item.location + '</div>\n        </div>\n        <div class="group-details-area">\n          <div class="group-description">\n            <p>' + item.description + '</p>\n          </div>\n        </div>\n        <div class="call-to-action">\n          <a href="' + url + '" target=\'_blank\' class="btn btn-secondary">Get Involved</a>\n        </div>\n      </div>\n    </li>\n    ';
  };

  var renderAnnotationPopup = function renderAnnotationPopup(item) {
    return '\n    <div class=\'popup-item annotation\' data-lat=\'' + item.lat + '\' data-lng=\'' + item.lng + '\'>\n      <div class="type-event">\n        <ul class="event-types-list">\n          <li class="tag tag-annotation">Annotation</li>\n        </ul>\n        <h2 class="event-title">' + item.name + '</h2>\n        <div class="event-address address-area">\n          <p>' + item.description + '</p>\n        </div>\n      </div>\n    </div>\n    ';
  };

  var renderAnnotationsGeoJson = function renderAnnotationsGeoJson(list) {
    return list.map(function (item) {
      var rendered = renderAnnotationPopup(item);
      return {
        "type": "Feature",
        geometry: {
          type: "Point",
          coordinates: [item.lng, item.lat]
        },
        properties: {
          annotationProps: item,
          popupContent: rendered
        }
      };
    });
  };

  var renderGeojson = function renderGeojson(list) {
    var ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var src = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    return list.map(function (item) {
      // rendered eventType
      var rendered = void 0;

      if (item.event_type && item.event_type.toLowerCase() == 'group') {
        rendered = renderGroup(item, ref, src);
      } else {
        rendered = renderEvent(item, ref, src);
      }

      // format check
      if (isNaN(parseFloat(parseFloat(item.lng)))) {
        item.lng = item.lng.substring(1);
      }
      if (isNaN(parseFloat(parseFloat(item.lat)))) {
        item.lat = item.lat.substring(1);
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

  return function (options) {
    var accessToken = 'pk.eyJ1IjoibWF0dGhldzM1MCIsImEiOiJaTVFMUkUwIn0.wcM3Xc8BGC6PM-Oyrwjnhg';
    var map = L.map('map-proper', { dragging: !L.Browser.mobile }).setView([34.88593094075317, 5.097656250000001], 2);

    var referrer = options.referrer,
        source = options.source;


    if (!L.Browser.mobile) {
      map.scrollWheelZoom.disable();
    }

    LANGUAGE = options.lang || 'en';

    if (options.onMove) {
      map.on('dragend', function (event) {

        var sw = [map.getBounds()._southWest.lat, map.getBounds()._southWest.lng];
        var ne = [map.getBounds()._northEast.lat, map.getBounds()._northEast.lng];
        options.onMove(sw, ne);
      }).on('zoomend', function (event) {
        if (map.getZoom() <= 4) {
          $("#map").addClass("zoomed-out");
        } else {
          $("#map").removeClass("zoomed-out");
        }

        var sw = [map.getBounds()._southWest.lat, map.getBounds()._southWest.lng];
        var ne = [map.getBounds()._northEast.lat, map.getBounds()._northEast.lng];
        options.onMove(sw, ne);
      });
    }

    // map.fireEvent('zoomend');

    L.tileLayer('https://api.mapbox.com/styles/v1/matthew350/cja41tijk27d62rqod7g0lx4b/tiles/256/{z}/{x}/{y}?access_token=' + accessToken, {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors • <a href="//350.org">350.org</a>'
    }).addTo(map);

    // console.log(window.queries['twilight-zone'], window.queries['twilight-zone'] === "true");
    if (window.queries['twilight-zone']) {
      L.terminator().addTo(map);
    }

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
        map.fitBounds(bounds, { animate: false });
      },
      setCenter: function setCenter(center) {
        var zoom = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

        if (!center || !center[0] || center[0] == "" || !center[1] || center[1] == "") return;
        map.setView(center, zoom);
      },
      getBounds: function getBounds() {

        var sw = [map.getBounds()._southWest.lat, map.getBounds()._southWest.lng];
        var ne = [map.getBounds()._northEast.lat, map.getBounds()._northEast.lng];

        return [sw, ne];
      },
      // Center location by geocoded
      getCenterByLocation: function getCenterByLocation(location, callback) {

        geocoder.geocode({ address: location }, function (results, status) {

          if (callback && typeof callback === 'function') {
            callback(results[0]);
          }
        });
      },
      triggerZoomEnd: function triggerZoomEnd() {
        map.fireEvent('zoomend');
      },
      zoomOutOnce: function zoomOutOnce() {
        map.zoomOut(1);
      },
      zoomUntilHit: function zoomUntilHit() {
        var $this = undefined;
        map.zoomOut(1);
        var intervalHandler = null;
        intervalHandler = setInterval(function () {
          var _visible = $(document).find('ul li.event-obj.within-bound, ul li.group-obj.within-bound').length;
          if (_visible == 0) {
            map.zoomOut(1);
          } else {
            clearInterval(intervalHandler);
          }
        }, 200);
      },
      refreshMap: function refreshMap() {
        map.invalidateSize(false);
        // map._onResize();
        // map.fireEvent('zoomend');

      },
      filterMap: function filterMap(filters) {

        $("#map").find(".event-item-popup").hide();

        if (!filters) return;

        filters.forEach(function (item) {

          $("#map").find(".event-item-popup." + item.toLowerCase()).show();
        });
      },
      plotPoints: function plotPoints(list, hardFilters, groups) {
        var keySet = !hardFilters.key ? [] : hardFilters.key.split(',');

        if (keySet.length > 0) {
          list = list.filter(function (item) {
            return keySet.includes(item.event_type);
          });
        }

        var geojson = {
          type: "FeatureCollection",
          features: renderGeojson(list, referrer, source)
        };

        var eventsLayer = L.geoJSON(geojson, {
          pointToLayer: function pointToLayer(feature, latlng) {
            // Icons for markers
            var eventType = feature.properties.eventProperties.event_type;

            // If no supergroup, it's an event.
            var supergroup = groups[feature.properties.eventProperties.supergroup] ? feature.properties.eventProperties.supergroup : "Events";
            var slugged = window.slugify(supergroup);

            var iconUrl = void 0;
            var isPast = new Date(feature.properties.eventProperties.start_datetime) < new Date();
            if (eventType == "Action") {
              iconUrl = isPast ? "/img/past-event.png" : "/img/event.png";
            } else {
              iconUrl = groups[supergroup] ? groups[supergroup].iconurl || "/img/event.png" : "/img/event.png";
            }

            var smallIcon = L.icon({
              iconUrl: iconUrl,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
              className: slugged + ' event-item-popup ' + (isPast && eventType == "Action" ? "event-past-event" : "")
            });

            var geojsonMarkerOptions = {
              icon: smallIcon
            };
            return L.marker(latlng, geojsonMarkerOptions);
          },

          onEachFeature: function onEachFeature(feature, layer) {
            if (feature.properties && feature.properties.popupContent) {
              layer.bindPopup(feature.properties.popupContent);
            }

            // const isPast = new Date(feature.properties.eventProperties.start_datetime) < new Date();
            // const eventType = feature.properties.eventProperties.event_type;
          }
        });

        eventsLayer.addTo(map);
        // eventsLayer.bringToBack();


        // Add Annotations
        if (window.queries.annotation) {
          var annotations = !window.EVENTS_DATA.annotations ? [] : window.EVENTS_DATA.annotations.filter(function (item) {
            return item.type === window.queries.annotation;
          });

          var annotIcon = L.icon({
            iconUrl: "/img/annotation.png",
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            className: 'annotation-popup'
          });
          var annotMarkers = annotations.map(function (item) {
            return L.marker([item.lat, item.lng], { icon: annotIcon }).bindPopup(renderAnnotationPopup(item));
          });
          // annotLayer.bringToFront();

          // const annotLayerGroup = ;

          var annotLayerGroup = map.addLayer(L.featureGroup(annotMarkers));
          // annotLayerGroup.bringToFront();
          // annotMarkers.forEach(item => {
          //   item.addTo(map);
          //   item.bringToFront();
          // })
        }
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

    $(document).on('change', 'select#filter-items', function () {
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
          $target.find("input[name=key]").val(params.key);

          if (params.filter) {
            $target.find("#filter-items option").removeProp("selected");
            params.filter.forEach(function (item) {
              $target.find("#filter-items option[value='" + item + "']").prop("selected", true);
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

        for (var key in parameters) {
          if (!parameters[key] || parameters[key] == "") {
            delete parameters[key];
          }
        }

        return parameters;
      },
      updateLocation: function updateLocation(lat, lng) {
        $target.find("input[name=lat]").val(lat);
        $target.find("input[name=lng]").val(lng);
        // $target.trigger('submit');
      },
      updateViewport: function updateViewport(viewport) {

        // Average it if less than 10mi radius
        if (Math.abs(viewport.f.b - viewport.f.f) < .15 || Math.abs(viewport.b.b - viewport.b.f) < .15) {
          var fAvg = (viewport.f.b + viewport.f.f) / 2;
          var bAvg = (viewport.b.b + viewport.b.f) / 2;
          viewport.f = { b: fAvg - .08, f: fAvg + .08 };
          viewport.b = { b: bAvg - .08, f: bAvg + .08 };
        }
        var bounds = [[viewport.f.b, viewport.b.b], [viewport.f.f, viewport.b.f]];

        $target.find("input[name=bound1]").val(JSON.stringify(bounds[0]));
        $target.find("input[name=bound2]").val(JSON.stringify(bounds[1]));
        $target.trigger('submit');
      },
      updateViewportByBound: function updateViewportByBound(sw, ne) {

        var bounds = [sw, ne]; ////////


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

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var autocompleteManager = void 0;
var mapManager = void 0;

window.DEFAULT_ICON = "/img/event.png";
window.slugify = function (text) {
  return !text ? text : text.toString().toLowerCase().replace(/\s+/g, '-') // Replace spaces with -
  .replace(/[^\w\-]+/g, '') // Remove all non-word chars
  .replace(/\-\-+/g, '-') // Replace multiple - with single -
  .replace(/^-+/, '') // Trim - from start of text
  .replace(/-+$/, '');
}; // Trim - from end of text

var getQueryString = function getQueryString() {
  var queryStringKeyValue = window.parent.location.search.replace('?', '').split('&');
  var qsJsonObject = {};
  if (queryStringKeyValue != '') {
    for (var i = 0; i < queryStringKeyValue.length; i++) {
      qsJsonObject[queryStringKeyValue[i].split('=')[0]] = queryStringKeyValue[i].split('=')[1];
    }
  }
  return qsJsonObject;
};

(function ($) {
  // Load things

  window.queries = $.deparam(window.location.search.substring(1));
  try {
    if ((!window.queries.group || !window.queries.referrer && !window.queries.source) && window.parent) {
      window.queries = {
        group: getQueryString().group,
        referrer: getQueryString().referrer,
        source: getQueryString().source,
        "twilight-zone": window.queries['twilight-zone'],
        "annotation": window.queries['annotation'],
        "full-map": window.queries['full-map'],
        "lang": window.queries['lang']
      };
    }
  } catch (e) {
    console.log("Error: ", e);
  }

  if (window.queries['full-map']) {
    if ($(window).width() < 600) {
      // $("#events-list-container").hide();
      $("body").addClass("map-view");
      // $(".filter-area").hide();
      // $("section#map").css("height", "calc(100% - 64px)");
    } else {
      $("body").addClass("filter-collapsed");
      // $("#events-list-container").hide();
    }
  } else {
    $("#show-hide-list-container").hide();
  }

  if (window.queries.group) {
    $('select#filter-items').parent().css("opacity", "0");
  }
  var buildFilters = function buildFilters() {
    $('select#filter-items').multiselect({
      enableHTML: true,
      templates: {
        button: '<button type="button" class="multiselect dropdown-toggle" data-toggle="dropdown"><span data-lang-target="text" data-lang-key="more-search-options"></span> <span class="fa fa-caret-down"></span></button>',
        li: '<li><a href="javascript:void(0);"><label></label></a></li>'
      },
      dropRight: true,
      onInitialized: function onInitialized() {},
      onDropdownShow: function onDropdownShow() {
        setTimeout(function () {
          $(document).trigger("mobile-update-map-height");
        }, 10);
      },
      onDropdownHide: function onDropdownHide() {
        setTimeout(function () {
          $(document).trigger("mobile-update-map-height");
        }, 10);
      },
      optionLabel: function optionLabel(e) {
        // let el = $( '<div></div>' );
        // el.append(() + "");

        return unescape($(e).attr('label')) || $(e).html();
      }
    });
  };
  buildFilters();

  $('select#language-opts').multiselect({
    enableHTML: true,
    optionClass: function optionClass() {
      return 'lang-opt';
    },
    selectedClass: function selectedClass() {
      return 'lang-sel';
    },
    buttonClass: function buttonClass() {
      return 'lang-but';
    },
    dropRight: true,
    optionLabel: function optionLabel(e) {
      // let el = $( '<div></div>' );
      // el.append(() + "");

      return unescape($(e).attr('label')) || $(e).html();
    },
    onChange: function onChange(option, checked, select) {

      var parameters = queryManager.getParameters();
      parameters['lang'] = option.val();
      $(document).trigger('trigger-update-embed', parameters);
      $(document).trigger('trigger-reset-map', parameters);
    }
  });

  // 1. google maps geocode

  // 2. focus map on geocode (via lat/lng)
  var queryManager = QueryManager();
  queryManager.initialize();

  var initParams = queryManager.getParameters();

  var languageManager = LanguageManager();

  var listManager = ListManager({
    referrer: window.queries.referrer,
    source: window.queries.source
  });

  mapManager = MapManager({
    onMove: function onMove(sw, ne) {
      // When the map moves around, we update the list
      queryManager.updateViewportByBound(sw, ne);
      //update Query
    },
    referrer: window.queries.referrer,
    source: window.queries.source
  });

  window.initializeAutocompleteCallback = function () {

    autocompleteManager = AutocompleteManager("input[name='loc']");
    autocompleteManager.initialize();

    if (initParams.loc && initParams.loc !== '' && !initParams.bound1 && !initParams.bound2) {
      mapManager.initialize(function () {
        mapManager.getCenterByLocation(initParams.loc, function (result) {
          queryManager.updateViewport(result.geometry.viewport);
        });
      });
    }
  };

  if (initParams.lat && initParams.lng) {
    mapManager.setCenter([initParams.lat, initParams.lng]);
  }

  /***
  * List Events
  * This will trigger the list update method
  */
  $(document).on('mobile-update-map-height', function (event) {
    //This checks if width is for mobile
    if ($(window).width() < 600) {
      setTimeout(function () {
        $("#map").height($("#events-list").height());
        mapManager.refreshMap();
      }, 10);
    }
  });
  $(document).on('trigger-list-update', function (event, options) {
    listManager.populateList(options.params);
  });

  $(document).on('trigger-list-filter-update', function (event, options) {

    listManager.updateFilter(options);
  });

  $(document).on('trigger-list-filter', function (event, options) {
    var bound1 = void 0,
        bound2 = void 0;

    if (!options || !options.bound1 || !options.bound2) {
      var _mapManager$getBounds = mapManager.getBounds();

      var _mapManager$getBounds2 = _slicedToArray(_mapManager$getBounds, 2);

      bound1 = _mapManager$getBounds2[0];
      bound2 = _mapManager$getBounds2[1];
    } else {
      bound1 = JSON.parse(options.bound1);
      bound2 = JSON.parse(options.bound2);
    }

    listManager.updateBounds(bound1, bound2, options.filter);
  });

  $(document).on('trigger-reset-map', function (event, options) {
    var copy = JSON.parse(JSON.stringify(options));
    delete copy['lng'];
    delete copy['lat'];
    delete copy['bound1'];
    delete copy['bound2'];

    window.location.hash = $.param(copy);

    $(document).trigger("trigger-language-update", copy);
    $("select#filter-items").multiselect('destroy');
    buildFilters();
    $(document).trigger('trigger-load-groups', { groups: window.EVENTS_DATA.groups });
    setTimeout(function () {

      $(document).trigger("trigger-language-update", copy);
    }, 1000);
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
    // mapManager.triggerZoomEnd();

    setTimeout(function () {
      mapManager.triggerZoomEnd();
    }, 10);
  });

  $(document).on('click', "#copy-embed", function (e) {
    var copyText = document.getElementById("embed-text");
    copyText.select();
    document.execCommand("Copy");
  });

  // 3. markers on map
  $(document).on('trigger-map-plot', function (e, opt) {

    mapManager.plotPoints(opt.data, opt.params, opt.groups);
    $(document).trigger('trigger-map-filter');
  });

  // load groups

  $(document).on('trigger-load-groups', function (e, opt) {
    $('select#filter-items').empty();
    opt.groups.forEach(function (item) {

      var slugged = window.slugify(item.supergroup);
      var valueText = languageManager.getTranslation(item.translation);
      $('select#filter-items').append('\n            <option value=\'' + slugged + '\'\n              selected=\'selected\'\n              label="<span data-lang-target=\'text\' data-lang-key=\'' + item.translation + '\'>' + valueText + '</span><img src=\'' + (item.iconurl || window.DEFAULT_ICON) + '\' />">\n            </option>');
    });

    // Re-initialize
    queryManager.initialize();
    // $('select#filter-items').multiselect('destroy');
    $('select#filter-items').multiselect('rebuild');

    mapManager.refreshMap();

    $(document).trigger('trigger-language-update');
  });

  // Filter map
  $(document).on('trigger-map-filter', function (e, opt) {
    if (opt) {
      mapManager.filterMap(opt.filter);
    }
  });

  $(document).on('trigger-language-update', function (e, opt) {

    if (window.queries.lang) {
      languageManager.updateLanguage(window.queries.lang);
    } else if (opt) {
      languageManager.updateLanguage(opt.lang);
    } else {

      languageManager.refresh();
    }
  });

  $(document).on('trigger-language-loaded', function (e, opt) {
    $('select#filter-items').multiselect('rebuild');
  });

  $(document).on('click', 'button#show-hide-map', function (e, opt) {
    $('body').toggleClass('map-view');
  });

  $(document).on('click', 'button.btn.more-items', function (e, opt) {
    $('#embed-area').toggleClass('open');
  });

  $(document).on('trigger-update-embed', function (e, opt) {
    //update embed line
    var copy = JSON.parse(JSON.stringify(opt));
    delete copy['lng'];
    delete copy['lat'];
    delete copy['bound1'];
    delete copy['bound2'];

    $('#embed-area input[name=embed]').val('https://new-map.350.org#' + $.param(copy));
  });

  $(document).on('click', 'button#zoom-out', function (e, opt) {

    // mapManager.zoomOutOnce();
    mapManager.zoomUntilHit();
  });

  $(document).on('click', '#show-hide-list-container', function (e, opt) {
    $('body').toggleClass('filter-collapsed');
    setTimeout(function () {
      mapManager.refreshMap();
    }, 600);
  });

  $(window).on("resize", function (e) {
    mapManager.refreshMap();
  });

  /**
  Filter Changes
  */
  $(document).on("click", ".search-button button", function (e) {
    e.preventDefault();
    $(document).trigger("search.force-search-location");
    return false;
  });

  $(document).on("keyup", "input[name='loc']", function (e) {
    if (e.keyCode == 13) {
      $(document).trigger('search.force-search-location');
    }
  });

  $(document).on('search.force-search-location', function () {
    var _query = $("input[name='loc']").val();
    autocompleteManager.forceSearch(_query);
    // Search google and get the first result... autocomplete?
  });

  $(window).on("hashchange", function (event) {
    var hash = window.location.hash;
    if (hash.length == 0) return;
    var parameters = $.deparam(hash.substring(1));
    var oldURL = event.originalEvent.oldURL;
    var oldHash = $.deparam(oldURL.substring(oldURL.search("#") + 1));

    // $(document).trigger('trigger-list-filter-update', parameters);
    $(document).trigger('trigger-map-filter', parameters);
    $(document).trigger('trigger-update-embed', parameters);

    $(document).trigger('trigger-list-filter', parameters);
    // // So that change in filters will not update this
    // if (oldHash.bound1 !== parameters.bound1 || oldHash.bound2 !== parameters.bound2) {
    //   $(document).trigger('trigger-list-filter', parameters);
    // }

    if (oldHash.loc !== parameters.loc) {
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

  $.when(function () {}).then(function () {
    return languageManager.initialize(initParams['lang'] || 'en');
  }).done(function (data) {}).then(function () {
    $.ajax({
      url: 'https://new-map.350.org/output/350org-with-annotation.js.gz', //'|**DATA_SOURCE**|',
      // url: '/data/test.js', //'|**DATA_SOURCE**|',
      dataType: 'script',
      cache: true,
      success: function success(data) {
        // window.EVENTS_DATA = data;
        //June 14, 2018 – Changes
        if (window.queries.group) {
          window.EVENTS_DATA.data = window.EVENTS_DATA.data.filter(function (i) {
            return i.campaign == window.queries.group;
          });
        }

        //Load groups
        $(document).trigger('trigger-load-groups', { groups: window.EVENTS_DATA.groups });

        var parameters = queryManager.getParameters();

        window.EVENTS_DATA.data.forEach(function (item) {
          item['event_type'] = item.event_type !== 'group' ? 'events' : item.event_type; //!item.event_type ? 'Event' : item.event_type;

          if (item.start_datetime && !item.start_datetime.match(/Z$/)) {
            item.start_datetime = item.start_datetime + "Z";
          }
        });

        // window.EVENTS_DATA.data.sort((a, b) => {
        //   return new Date(a.start_datetime) - new Date(b.start_datetime);
        // })


        $(document).trigger('trigger-list-update', { params: parameters });
        // $(document).trigger('trigger-list-filter-update', parameters);
        $(document).trigger('trigger-map-plot', {
          data: window.EVENTS_DATA.data,
          params: parameters,
          groups: window.EVENTS_DATA.groups.reduce(function (dict, item) {
            dict[item.supergroup] = item;return dict;
          }, {})
        });
        // });
        $(document).trigger('trigger-update-embed', parameters);
        //TODO: Make the geojson conversion happen on the backend

        //Refresh things
        setTimeout(function () {
          var p = queryManager.getParameters();

          $(document).trigger('trigger-map-update', p);
          $(document).trigger('trigger-map-filter', p);

          $(document).trigger('trigger-list-filter', p);
        }, 100);
      }
    });
  });
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9oZWxwZXIuanMiLCJjbGFzc2VzL2xhbmd1YWdlLmpzIiwiY2xhc3Nlcy9saXN0LmpzIiwiY2xhc3Nlcy9tYXAuanMiLCJjbGFzc2VzL3F1ZXJ5LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIkF1dG9jb21wbGV0ZU1hbmFnZXIiLCIkIiwidGFyZ2V0IiwiQVBJX0tFWSIsInRhcmdldEl0ZW0iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJxdWVyeU1nciIsIlF1ZXJ5TWFuYWdlciIsImdlb2NvZGVyIiwiZ29vZ2xlIiwibWFwcyIsIkdlb2NvZGVyIiwiJHRhcmdldCIsImZvcmNlU2VhcmNoIiwicSIsImdlb2NvZGUiLCJhZGRyZXNzIiwicmVzdWx0cyIsInN0YXR1cyIsImdlb21ldHJ5IiwidXBkYXRlVmlld3BvcnQiLCJ2aWV3cG9ydCIsInZhbCIsImZvcm1hdHRlZF9hZGRyZXNzIiwiaW5pdGlhbGl6ZSIsInR5cGVhaGVhZCIsImhpbnQiLCJoaWdobGlnaHQiLCJtaW5MZW5ndGgiLCJjbGFzc05hbWVzIiwibWVudSIsIm5hbWUiLCJkaXNwbGF5IiwiaXRlbSIsImxpbWl0Iiwic291cmNlIiwic3luYyIsImFzeW5jIiwib24iLCJvYmoiLCJkYXR1bSIsImpRdWVyeSIsIkhlbHBlciIsInJlZlNvdXJjZSIsInVybCIsInJlZiIsInNyYyIsImluZGV4T2YiLCJMYW5ndWFnZU1hbmFnZXIiLCJsYW5ndWFnZSIsImRpY3Rpb25hcnkiLCIkdGFyZ2V0cyIsInVwZGF0ZVBhZ2VMYW5ndWFnZSIsInRhcmdldExhbmd1YWdlIiwicm93cyIsImZpbHRlciIsImkiLCJsYW5nIiwiZWFjaCIsImluZGV4IiwidGFyZ2V0QXR0cmlidXRlIiwiZGF0YSIsImxhbmdUYXJnZXQiLCJ0ZXh0IiwiYXR0ciIsInRhcmdldHMiLCJhamF4IiwiZGF0YVR5cGUiLCJzdWNjZXNzIiwidHJpZ2dlciIsIm11bHRpc2VsZWN0IiwicmVmcmVzaCIsInVwZGF0ZUxhbmd1YWdlIiwiZ2V0VHJhbnNsYXRpb24iLCJrZXkiLCJMaXN0TWFuYWdlciIsIm9wdGlvbnMiLCJ0YXJnZXRMaXN0IiwicmVmZXJyZXIiLCJkM1RhcmdldCIsImQzIiwic2VsZWN0IiwicmVuZGVyRXZlbnQiLCJtIiwibW9tZW50IiwiRGF0ZSIsInN0YXJ0X2RhdGV0aW1lIiwidXRjIiwic3VidHJhY3QiLCJ1dGNPZmZzZXQiLCJkYXRlIiwiZm9ybWF0IiwibWF0Y2giLCJldmVudF90eXBlIiwidGl0bGUiLCJ2ZW51ZSIsInJlbmRlckdyb3VwIiwid2Vic2l0ZSIsInN1cGVyR3JvdXAiLCJ3aW5kb3ciLCJzbHVnaWZ5Iiwic3VwZXJncm91cCIsImxvY2F0aW9uIiwiZGVzY3JpcHRpb24iLCIkbGlzdCIsInVwZGF0ZUZpbHRlciIsInAiLCJyZW1vdmVQcm9wIiwiYWRkQ2xhc3MiLCJqb2luIiwiZm9yRWFjaCIsImZpbCIsImZpbmQiLCJzaG93IiwidXBkYXRlQm91bmRzIiwiYm91bmQxIiwiYm91bmQyIiwiZmlsdGVycyIsIkVWRU5UU19EQVRBIiwidHlwZSIsInRvTG93ZXJDYXNlIiwibGVuZ3RoIiwiaW5jbHVkZXMiLCJsYXQiLCJsbmciLCJsaXN0Q29udGFpbmVyIiwic2VsZWN0QWxsIiwicmVtb3ZlIiwiZW50ZXIiLCJhcHBlbmQiLCJodG1sIiwicmVtb3ZlQ2xhc3MiLCJwb3B1bGF0ZUxpc3QiLCJoYXJkRmlsdGVycyIsImtleVNldCIsInNwbGl0IiwiTWFwTWFuYWdlciIsIkxBTkdVQUdFIiwicmVuZGVyQW5ub3RhdGlvblBvcHVwIiwicmVuZGVyQW5ub3RhdGlvbnNHZW9Kc29uIiwibGlzdCIsIm1hcCIsInJlbmRlcmVkIiwiY29vcmRpbmF0ZXMiLCJwcm9wZXJ0aWVzIiwiYW5ub3RhdGlvblByb3BzIiwicG9wdXBDb250ZW50IiwicmVuZGVyR2VvanNvbiIsImlzTmFOIiwicGFyc2VGbG9hdCIsInN1YnN0cmluZyIsImV2ZW50UHJvcGVydGllcyIsImFjY2Vzc1Rva2VuIiwiTCIsImRyYWdnaW5nIiwiQnJvd3NlciIsIm1vYmlsZSIsInNldFZpZXciLCJzY3JvbGxXaGVlbFpvb20iLCJkaXNhYmxlIiwib25Nb3ZlIiwiZXZlbnQiLCJzdyIsImdldEJvdW5kcyIsIl9zb3V0aFdlc3QiLCJuZSIsIl9ub3J0aEVhc3QiLCJnZXRab29tIiwidGlsZUxheWVyIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsInF1ZXJpZXMiLCJ0ZXJtaW5hdG9yIiwiJG1hcCIsImNhbGxiYWNrIiwic2V0Qm91bmRzIiwiYm91bmRzMSIsImJvdW5kczIiLCJib3VuZHMiLCJmaXRCb3VuZHMiLCJhbmltYXRlIiwic2V0Q2VudGVyIiwiY2VudGVyIiwiem9vbSIsImdldENlbnRlckJ5TG9jYXRpb24iLCJ0cmlnZ2VyWm9vbUVuZCIsImZpcmVFdmVudCIsInpvb21PdXRPbmNlIiwiem9vbU91dCIsInpvb21VbnRpbEhpdCIsIiR0aGlzIiwiaW50ZXJ2YWxIYW5kbGVyIiwic2V0SW50ZXJ2YWwiLCJfdmlzaWJsZSIsImNsZWFySW50ZXJ2YWwiLCJyZWZyZXNoTWFwIiwiaW52YWxpZGF0ZVNpemUiLCJmaWx0ZXJNYXAiLCJoaWRlIiwicGxvdFBvaW50cyIsImdyb3VwcyIsImdlb2pzb24iLCJmZWF0dXJlcyIsImV2ZW50c0xheWVyIiwiZ2VvSlNPTiIsInBvaW50VG9MYXllciIsImZlYXR1cmUiLCJsYXRsbmciLCJldmVudFR5cGUiLCJzbHVnZ2VkIiwiaWNvblVybCIsImlzUGFzdCIsImljb251cmwiLCJzbWFsbEljb24iLCJpY29uIiwiaWNvblNpemUiLCJpY29uQW5jaG9yIiwiY2xhc3NOYW1lIiwiZ2VvanNvbk1hcmtlck9wdGlvbnMiLCJtYXJrZXIiLCJvbkVhY2hGZWF0dXJlIiwibGF5ZXIiLCJiaW5kUG9wdXAiLCJhbm5vdGF0aW9uIiwiYW5ub3RhdGlvbnMiLCJhbm5vdEljb24iLCJhbm5vdE1hcmtlcnMiLCJhbm5vdExheWVyR3JvdXAiLCJhZGRMYXllciIsImZlYXR1cmVHcm91cCIsInVwZGF0ZSIsImxhdExuZyIsInRhcmdldEZvcm0iLCJwcmV2aW91cyIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImZvcm0iLCJkZXBhcmFtIiwic2VyaWFsaXplIiwiaGFzaCIsInBhcmFtIiwicGFyYW1zIiwibG9jIiwicHJvcCIsImdldFBhcmFtZXRlcnMiLCJwYXJhbWV0ZXJzIiwidXBkYXRlTG9jYXRpb24iLCJNYXRoIiwiYWJzIiwiZiIsImIiLCJmQXZnIiwiYkF2ZyIsIkpTT04iLCJzdHJpbmdpZnkiLCJ1cGRhdGVWaWV3cG9ydEJ5Qm91bmQiLCJ0cmlnZ2VyU3VibWl0IiwiYXV0b2NvbXBsZXRlTWFuYWdlciIsIm1hcE1hbmFnZXIiLCJERUZBVUxUX0lDT04iLCJ0b1N0cmluZyIsInJlcGxhY2UiLCJnZXRRdWVyeVN0cmluZyIsInF1ZXJ5U3RyaW5nS2V5VmFsdWUiLCJwYXJlbnQiLCJzZWFyY2giLCJxc0pzb25PYmplY3QiLCJncm91cCIsImNvbnNvbGUiLCJsb2ciLCJ3aWR0aCIsImNzcyIsImJ1aWxkRmlsdGVycyIsImVuYWJsZUhUTUwiLCJ0ZW1wbGF0ZXMiLCJidXR0b24iLCJsaSIsImRyb3BSaWdodCIsIm9uSW5pdGlhbGl6ZWQiLCJvbkRyb3Bkb3duU2hvdyIsInNldFRpbWVvdXQiLCJvbkRyb3Bkb3duSGlkZSIsIm9wdGlvbkxhYmVsIiwidW5lc2NhcGUiLCJvcHRpb25DbGFzcyIsInNlbGVjdGVkQ2xhc3MiLCJidXR0b25DbGFzcyIsIm9uQ2hhbmdlIiwib3B0aW9uIiwiY2hlY2tlZCIsInF1ZXJ5TWFuYWdlciIsImluaXRQYXJhbXMiLCJsYW5ndWFnZU1hbmFnZXIiLCJsaXN0TWFuYWdlciIsImluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayIsInJlc3VsdCIsImhlaWdodCIsInBhcnNlIiwiY29weSIsImNvcHlUZXh0IiwiZ2V0RWxlbWVudEJ5SWQiLCJleGVjQ29tbWFuZCIsIm9wdCIsImVtcHR5IiwidmFsdWVUZXh0IiwidHJhbnNsYXRpb24iLCJ0b2dnbGVDbGFzcyIsImtleUNvZGUiLCJfcXVlcnkiLCJvbGRVUkwiLCJvcmlnaW5hbEV2ZW50Iiwib2xkSGFzaCIsIndoZW4iLCJ0aGVuIiwiZG9uZSIsImNhY2hlIiwiY2FtcGFpZ24iLCJyZWR1Y2UiLCJkaWN0Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOztBQUNBLElBQU1BLHNCQUF1QixVQUFTQyxDQUFULEVBQVk7QUFDdkM7O0FBRUEsU0FBTyxVQUFDQyxNQUFELEVBQVk7O0FBRWpCLFFBQU1DLFVBQVUseUNBQWhCO0FBQ0EsUUFBTUMsYUFBYSxPQUFPRixNQUFQLElBQWlCLFFBQWpCLEdBQTRCRyxTQUFTQyxhQUFULENBQXVCSixNQUF2QixDQUE1QixHQUE2REEsTUFBaEY7QUFDQSxRQUFNSyxXQUFXQyxjQUFqQjtBQUNBLFFBQUlDLFdBQVcsSUFBSUMsT0FBT0MsSUFBUCxDQUFZQyxRQUFoQixFQUFmOztBQUVBLFdBQU87QUFDTEMsZUFBU1osRUFBRUcsVUFBRixDQURKO0FBRUxGLGNBQVFFLFVBRkg7QUFHTFUsbUJBQWEscUJBQUNDLENBQUQsRUFBTztBQUNsQk4saUJBQVNPLE9BQVQsQ0FBaUIsRUFBRUMsU0FBU0YsQ0FBWCxFQUFqQixFQUFpQyxVQUFVRyxPQUFWLEVBQW1CQyxNQUFuQixFQUEyQjtBQUMxRCxjQUFJRCxRQUFRLENBQVIsQ0FBSixFQUFnQjtBQUNkLGdCQUFJRSxXQUFXRixRQUFRLENBQVIsRUFBV0UsUUFBMUI7QUFDQWIscUJBQVNjLGNBQVQsQ0FBd0JELFNBQVNFLFFBQWpDO0FBQ0FyQixjQUFFRyxVQUFGLEVBQWNtQixHQUFkLENBQWtCTCxRQUFRLENBQVIsRUFBV00saUJBQTdCO0FBQ0Q7QUFDRDtBQUNBO0FBRUQsU0FURDtBQVVELE9BZEk7QUFlTEMsa0JBQVksc0JBQU07QUFDaEJ4QixVQUFFRyxVQUFGLEVBQWNzQixTQUFkLENBQXdCO0FBQ1pDLGdCQUFNLElBRE07QUFFWkMscUJBQVcsSUFGQztBQUdaQyxxQkFBVyxDQUhDO0FBSVpDLHNCQUFZO0FBQ1ZDLGtCQUFNO0FBREk7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QUFINEIsU0FBeEM7QUFLTjtBQUNNOVQsVUFBRUksUUFBRixFQUFZaUUsT0FBWixDQUFvQixzQkFBcEIsRUFBNENnTCxVQUE1QztBQUNBOztBQUVBO0FBQ0FtQyxtQkFBVyxZQUFNO0FBQ2YsY0FBSTlLLElBQUl3TCxhQUFhOUMsYUFBYixFQUFSOztBQUVBcFAsWUFBRUksUUFBRixFQUFZaUUsT0FBWixDQUFvQixvQkFBcEIsRUFBMENxQyxDQUExQztBQUNBMUcsWUFBRUksUUFBRixFQUFZaUUsT0FBWixDQUFvQixvQkFBcEIsRUFBMENxQyxDQUExQzs7QUFFQTFHLFlBQUVJLFFBQUYsRUFBWWlFLE9BQVosQ0FBb0IscUJBQXBCLEVBQTJDcUMsQ0FBM0M7QUFFRCxTQVJELEVBUUcsR0FSSDtBQVNEO0FBdERFLEtBQVA7QUF3REMsR0E5REw7QUFrRUQsQ0FwYkQsRUFvYkdqRSxNQXBiSCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbi8vQVBJIDpBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cbmNvbnN0IEF1dG9jb21wbGV0ZU1hbmFnZXIgPSAoZnVuY3Rpb24oJCkge1xuICAvL0luaXRpYWxpemF0aW9uLi4uXG5cbiAgcmV0dXJuICh0YXJnZXQpID0+IHtcblxuICAgIGNvbnN0IEFQSV9LRVkgPSBcIkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVwiO1xuICAgIGNvbnN0IHRhcmdldEl0ZW0gPSB0eXBlb2YgdGFyZ2V0ID09IFwic3RyaW5nXCIgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCkgOiB0YXJnZXQ7XG4gICAgY29uc3QgcXVlcnlNZ3IgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICB2YXIgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcblxuICAgIHJldHVybiB7XG4gICAgICAkdGFyZ2V0OiAkKHRhcmdldEl0ZW0pLFxuICAgICAgdGFyZ2V0OiB0YXJnZXRJdGVtLFxuICAgICAgZm9yY2VTZWFyY2g6IChxKSA9PiB7XG4gICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBxIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICBpZiAocmVzdWx0c1swXSkge1xuICAgICAgICAgICAgbGV0IGdlb21ldHJ5ID0gcmVzdWx0c1swXS5nZW9tZXRyeTtcbiAgICAgICAgICAgIHF1ZXJ5TWdyLnVwZGF0ZVZpZXdwb3J0KGdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgICAgICQodGFyZ2V0SXRlbSkudmFsKHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyB2YXIgZ2VvbWV0cnkgPSBkYXR1bS5nZW9tZXRyeTtcbiAgICAgICAgICAvLyBxdWVyeU1nci51cGRhdGVWaWV3cG9ydChnZW9tZXRyeS52aWV3cG9ydCk7XG5cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgaW5pdGlhbGl6ZTogKCkgPT4ge1xuICAgICAgICAkKHRhcmdldEl0ZW0pLnR5cGVhaGVhZCh7XG4gICAgICAgICAgICAgICAgICAgIGhpbnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWluTGVuZ3RoOiA0LFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgbWVudTogJ3R0LWRyb3Bkb3duLW1lbnUnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdzZWFyY2gtcmVzdWx0cycsXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IChpdGVtKSA9PiBpdGVtLmZvcm1hdHRlZF9hZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgICBsaW1pdDogMTAsXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogZnVuY3Rpb24gKHEsIHN5bmMsIGFzeW5jKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBxIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXN5bmMocmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICkub24oJ3R5cGVhaGVhZDpzZWxlY3RlZCcsIGZ1bmN0aW9uIChvYmosIGRhdHVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGRhdHVtKVxuICAgICAgICAgICAgICAgICAgICB7XG5cbiAgICAgICAgICAgICAgICAgICAgICB2YXIgZ2VvbWV0cnkgPSBkYXR1bS5nZW9tZXRyeTtcbiAgICAgICAgICAgICAgICAgICAgICBxdWVyeU1nci51cGRhdGVWaWV3cG9ydChnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gIG1hcC5maXRCb3VuZHMoZ2VvbWV0cnkuYm91bmRzPyBnZW9tZXRyeS5ib3VuZHMgOiBnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cblxuXG4gICAgcmV0dXJuIHtcblxuICAgIH1cbiAgfVxuXG59KGpRdWVyeSkpO1xuIiwiY29uc3QgSGVscGVyID0gKCgkKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlZlNvdXJjZTogKHVybCwgcmVmLCBzcmMpID0+IHtcbiAgICAgICAgLy8gSnVuIDEzIDIwMTgg4oCUIEZpeCBmb3Igc291cmNlIGFuZCByZWZlcnJlclxuICAgICAgICBpZiAocmVmIHx8IHNyYykge1xuICAgICAgICAgIGlmICh1cmwuaW5kZXhPZihcIj9cIikgPj0gMCkge1xuICAgICAgICAgICAgdXJsID0gYCR7dXJsfSZyZWZlcnJlcj0ke3JlZnx8XCJcIn0mc291cmNlPSR7c3JjfHxcIlwifWA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVybCA9IGAke3VybH0/cmVmZXJyZXI9JHtyZWZ8fFwiXCJ9JnNvdXJjZT0ke3NyY3x8XCJcIn1gO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB1cmw7XG4gICAgICB9XG4gICAgfTtcbn0pKGpRdWVyeSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IExhbmd1YWdlTWFuYWdlciA9ICgoJCkgPT4ge1xuICAvL2tleVZhbHVlXG5cbiAgLy90YXJnZXRzIGFyZSB0aGUgbWFwcGluZ3MgZm9yIHRoZSBsYW5ndWFnZVxuICByZXR1cm4gKCkgPT4ge1xuICAgIGxldCBsYW5ndWFnZTtcbiAgICBsZXQgZGljdGlvbmFyeSA9IHt9O1xuICAgIGxldCAkdGFyZ2V0cyA9ICQoXCJbZGF0YS1sYW5nLXRhcmdldF1bZGF0YS1sYW5nLWtleV1cIik7XG5cbiAgICBjb25zdCB1cGRhdGVQYWdlTGFuZ3VhZ2UgPSAoKSA9PiB7XG5cbiAgICAgIGxldCB0YXJnZXRMYW5ndWFnZSA9IGRpY3Rpb25hcnkucm93cy5maWx0ZXIoKGkpID0+IGkubGFuZyA9PT0gbGFuZ3VhZ2UpWzBdO1xuXG4gICAgICAkdGFyZ2V0cy5lYWNoKChpbmRleCwgaXRlbSkgPT4ge1xuXG4gICAgICAgIGxldCB0YXJnZXRBdHRyaWJ1dGUgPSAkKGl0ZW0pLmRhdGEoJ2xhbmctdGFyZ2V0Jyk7XG4gICAgICAgIGxldCBsYW5nVGFyZ2V0ID0gJChpdGVtKS5kYXRhKCdsYW5nLWtleScpO1xuXG5cblxuXG4gICAgICAgIHN3aXRjaCh0YXJnZXRBdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjYXNlICd0ZXh0JzpcblxuICAgICAgICAgICAgJCgoYFtkYXRhLWxhbmcta2V5PVwiJHtsYW5nVGFyZ2V0fVwiXWApKS50ZXh0KHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGlmIChsYW5nVGFyZ2V0ID09IFwibW9yZS1zZWFyY2gtb3B0aW9uc1wiKSB7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3ZhbHVlJzpcbiAgICAgICAgICAgICQoaXRlbSkudmFsKHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAkKGl0ZW0pLmF0dHIodGFyZ2V0QXR0cmlidXRlLCB0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGxhbmd1YWdlLFxuICAgICAgdGFyZ2V0czogJHRhcmdldHMsXG4gICAgICBkaWN0aW9uYXJ5LFxuICAgICAgaW5pdGlhbGl6ZTogKGxhbmcpID0+IHtcblxuICAgICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgICAvLyB1cmw6ICdodHRwczovL2dzeDJqc29uLmNvbS9hcGk/aWQ9MU8zZUJ5akwxdmxZZjdaN2FtLV9odFJUUWk3M1BhZnFJZk5CZExtWGU4U00mc2hlZXQ9MScsXG4gICAgICAgICAgdXJsOiAnL2RhdGEvbGFuZy5qc29uJyxcbiAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICBkaWN0aW9uYXJ5ID0gZGF0YTtcbiAgICAgICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZSgpO1xuXG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxhbmd1YWdlLWxvYWRlZCcpO1xuXG4gICAgICAgICAgICAkKFwiI2xhbmd1YWdlLW9wdHNcIikubXVsdGlzZWxlY3QoJ3NlbGVjdCcsIGxhbmcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgcmVmcmVzaDogKCkgPT4ge1xuICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UobGFuZ3VhZ2UpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZUxhbmd1YWdlOiAobGFuZykgPT4ge1xuXG4gICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgdXBkYXRlUGFnZUxhbmd1YWdlKCk7XG4gICAgICB9LFxuICAgICAgZ2V0VHJhbnNsYXRpb246IChrZXkpID0+IHtcbiAgICAgICAgbGV0IHRhcmdldExhbmd1YWdlID0gZGljdGlvbmFyeS5yb3dzLmZpbHRlcigoaSkgPT4gaS5sYW5nID09PSBsYW5ndWFnZSlbMF07XG4gICAgICAgIHJldHVybiB0YXJnZXRMYW5ndWFnZVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxufSkoalF1ZXJ5KTtcbiIsIi8qIFRoaXMgbG9hZHMgYW5kIG1hbmFnZXMgdGhlIGxpc3QhICovXG5cbmNvbnN0IExpc3RNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIHJldHVybiAob3B0aW9ucykgPT4ge1xuICAgIGxldCB0YXJnZXRMaXN0ID0gb3B0aW9ucy50YXJnZXRMaXN0IHx8IFwiI2V2ZW50cy1saXN0XCI7XG4gICAgLy8gSnVuZSAxMyBgMTgg4oCTIHJlZmVycmVyIGFuZCBzb3VyY2VcbiAgICBsZXQge3JlZmVycmVyLCBzb3VyY2V9ID0gb3B0aW9ucztcblxuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0TGlzdCA9PT0gJ3N0cmluZycgPyAkKHRhcmdldExpc3QpIDogdGFyZ2V0TGlzdDtcbiAgICBjb25zdCBkM1RhcmdldCA9IHR5cGVvZiB0YXJnZXRMaXN0ID09PSAnc3RyaW5nJyA/IGQzLnNlbGVjdCh0YXJnZXRMaXN0KSA6IHRhcmdldExpc3Q7XG5cbiAgICBjb25zdCByZW5kZXJFdmVudCA9IChpdGVtLCByZWZlcnJlciA9IG51bGwsIHNvdXJjZSA9IG51bGwpID0+IHtcbiAgICAgIGxldCBtID0gbW9tZW50KG5ldyBEYXRlKGl0ZW0uc3RhcnRfZGF0ZXRpbWUpKTtcbiAgICAgIG0gPSBtLnV0YygpLnN1YnRyYWN0KG0udXRjT2Zmc2V0KCksICdtJyk7XG4gICAgICB2YXIgZGF0ZSA9IG0uZm9ybWF0KFwiZGRkZCBNTU0gREQsIGg6bW1hXCIpO1xuICAgICAgbGV0IHVybCA9IGl0ZW0udXJsLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0udXJsIDogXCIvL1wiICsgaXRlbS51cmw7XG4gICAgICAvLyBsZXQgc3VwZXJHcm91cCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG4gICAgICB1cmwgPSBIZWxwZXIucmVmU291cmNlKHVybCwgcmVmZXJyZXIsIHNvdXJjZSk7XG5cbiAgICAgIC8vPGxpIGNsYXNzPScke3dpbmRvdy5zbHVnaWZ5KGl0ZW0uZXZlbnRfdHlwZSl9IGV2ZW50cyBldmVudC1vYmonIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgIHJldHVybiBgXG5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnQgdHlwZS1hY3Rpb25cIj5cbiAgICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgICA8bGkgY2xhc3M9J3RhZy0ke2l0ZW0uZXZlbnRfdHlwZX0gdGFnJz4ke2l0ZW0uZXZlbnRfdHlwZX08L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPGgyIGNsYXNzPVwiZXZlbnQtdGl0bGVcIj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZX08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtZGF0ZSBkYXRlXCI+JHtkYXRlfTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1hZGRyZXNzIGFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgICAgPHA+JHtpdGVtLnZlbnVlfTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPlJTVlA8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgYFxuICAgIH07XG5cbiAgICBjb25zdCByZW5kZXJHcm91cCA9IChpdGVtLCByZWZlcnJlciA9IG51bGwsIHNvdXJjZSA9IG51bGwpID0+IHtcbiAgICAgIGxldCB1cmwgPSBpdGVtLndlYnNpdGUubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS53ZWJzaXRlIDogXCIvL1wiICsgaXRlbS53ZWJzaXRlO1xuICAgICAgbGV0IHN1cGVyR3JvdXAgPSB3aW5kb3cuc2x1Z2lmeShpdGVtLnN1cGVyZ3JvdXApO1xuXG4gICAgICB1cmwgPSBIZWxwZXIucmVmU291cmNlKHVybCwgcmVmZXJyZXIsIHNvdXJjZSk7XG5cbiAgICAgIC8vPGxpIGNsYXNzPScke2l0ZW0uZXZlbnRfdHlwZX0gJHtzdXBlckdyb3VwfSBncm91cC1vYmonIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgIHJldHVybiBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwIGdyb3VwLW9ialwiPlxuICAgICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctJHtpdGVtLnN1cGVyZ3JvdXB9XCI+JHtpdGVtLnN1cGVyZ3JvdXB9PC9saT5cbiAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDxoMj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS5uYW1lfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1sb2NhdGlvbiBsb2NhdGlvblwiPiR7aXRlbS5sb2NhdGlvbn08L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXNjcmlwdGlvblwiPlxuICAgICAgICAgICAgICA8cD4ke2l0ZW0uZGVzY3JpcHRpb259PC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgYFxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgJGxpc3Q6ICR0YXJnZXQsXG4gICAgICB1cGRhdGVGaWx0ZXI6IChwKSA9PiB7XG4gICAgICAgIGlmKCFwKSByZXR1cm47XG5cbiAgICAgICAgLy8gUmVtb3ZlIEZpbHRlcnNcblxuICAgICAgICAkdGFyZ2V0LnJlbW92ZVByb3AoXCJjbGFzc1wiKTtcbiAgICAgICAgJHRhcmdldC5hZGRDbGFzcyhwLmZpbHRlciA/IHAuZmlsdGVyLmpvaW4oXCIgXCIpIDogJycpXG5cbiAgICAgICAgLy8gJHRhcmdldC5maW5kKCdsaScpLmhpZGUoKTtcblxuICAgICAgICBpZiAocC5maWx0ZXIpIHtcbiAgICAgICAgICBwLmZpbHRlci5mb3JFYWNoKChmaWwpPT57XG4gICAgICAgICAgICAkdGFyZ2V0LmZpbmQoYGxpLiR7ZmlsfWApLnNob3coKTtcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdXBkYXRlQm91bmRzOiAoYm91bmQxLCBib3VuZDIsIGZpbHRlcnMpID0+IHtcbiAgICAgICAgLy8gY29uc3QgYm91bmRzID0gW3AuYm91bmRzMSwgcC5ib3VuZHMyXTtcblxuICAgICAgICAvL1xuICAgICAgICAvLyAkdGFyZ2V0LmZpbmQoJ3VsIGxpLmV2ZW50LW9iaiwgdWwgbGkuZ3JvdXAtb2JqJykuZWFjaCgoaW5kLCBpdGVtKT0+IHtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gICBsZXQgX2xhdCA9ICQoaXRlbSkuZGF0YSgnbGF0JyksXG4gICAgICAgIC8vICAgICAgIF9sbmcgPSAkKGl0ZW0pLmRhdGEoJ2xuZycpO1xuICAgICAgICAvL1xuICAgICAgICAvLyAgIGNvbnN0IG1pMTAgPSAwLjE0NDk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgaWYgKGJvdW5kMVswXSA8PSBfbGF0ICYmIGJvdW5kMlswXSA+PSBfbGF0ICYmIGJvdW5kMVsxXSA8PSBfbG5nICYmIGJvdW5kMlsxXSA+PSBfbG5nKSB7XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgICAkKGl0ZW0pLmFkZENsYXNzKCd3aXRoaW4tYm91bmQnKTtcbiAgICAgICAgLy8gICB9IGVsc2Uge1xuICAgICAgICAvLyAgICAgJChpdGVtKS5yZW1vdmVDbGFzcygnd2l0aGluLWJvdW5kJyk7XG4gICAgICAgIC8vICAgfVxuICAgICAgICAvLyB9KTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gbGV0IF92aXNpYmxlID0gJHRhcmdldC5maW5kKCd1bCBsaS5ldmVudC1vYmoud2l0aGluLWJvdW5kLCB1bCBsaS5ncm91cC1vYmoud2l0aGluLWJvdW5kJykubGVuZ3RoO1xuXG4gICAgICAgIGNvbnN0IGRhdGEgPSB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YS5maWx0ZXIoKGl0ZW0pPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdHlwZSA9IGl0ZW0uZXZlbnRfdHlwZSA/IGl0ZW0uZXZlbnRfdHlwZS50b0xvd2VyQ2FzZSgpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWx0ZXJzICYmIChmaWx0ZXJzLmxlbmd0aCA9PSAwIC8qIElmIGl0J3MgaW4gZmlsdGVyICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdHJ1ZSA6IGZpbHRlcnMuaW5jbHVkZXModHlwZSAhPSAnZ3JvdXAnID8gdHlwZSA6IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAvKiBJZiBpdCdzIGluIGJvdW5kcyAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoYm91bmQxWzBdIDw9IGl0ZW0ubGF0ICYmIGJvdW5kMlswXSA+PSBpdGVtLmxhdCAmJiBib3VuZDFbMV0gPD0gaXRlbS5sbmcgJiYgYm91bmQyWzFdID49IGl0ZW0ubG5nKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBsaXN0Q29udGFpbmVyID0gZDNUYXJnZXQuc2VsZWN0KFwidWxcIik7XG4gICAgICAgIGxpc3RDb250YWluZXIuc2VsZWN0QWxsKFwibGkub3JnLWxpc3QtaXRlbVwiKS5yZW1vdmUoKTtcbiAgICAgICAgbGlzdENvbnRhaW5lci5zZWxlY3RBbGwoXCJsaS5vcmctbGlzdC1pdGVtXCIpXG4gICAgICAgICAgLmRhdGEoZGF0YSwgKGl0ZW0pID0+IGl0ZW0uZXZlbnRfdHlwZSA9PSAnZ3JvdXAnID8gaXRlbS53ZWJzaXRlIDogaXRlbS51cmwpXG4gICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAuYXBwZW5kKCdsaScpXG4gICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIChpdGVtKSA9PiBpdGVtLmV2ZW50X3R5cGUgIT0gJ2dyb3VwJyA/ICdvcmctbGlzdC1pdGVtIGV2ZW50cyBldmVudC1vYmonIDogJ29yZy1saXN0LWl0ZW0gZ3JvdXAtb2JqJylcbiAgICAgICAgICAgIC5odG1sKChpdGVtKSA9PiBpdGVtLmV2ZW50X3R5cGUgIT0gJ2dyb3VwJyA/IHJlbmRlckV2ZW50KGl0ZW0sIHJlZmVycmVyLCBzb3VyY2UpIDogcmVuZGVyR3JvdXAoaXRlbSkpO1xuXG5cbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAvLyBUaGUgbGlzdCBpcyBlbXB0eVxuICAgICAgICAgICR0YXJnZXQuYWRkQ2xhc3MoXCJpcy1lbXB0eVwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkdGFyZ2V0LnJlbW92ZUNsYXNzKFwiaXMtZW1wdHlcIik7XG4gICAgICAgIH1cblxuICAgICAgfSxcbiAgICAgIHBvcHVsYXRlTGlzdDogKGhhcmRGaWx0ZXJzKSA9PiB7XG4gICAgICAgIC8vdXNpbmcgd2luZG93LkVWRU5UX0RBVEFcbiAgICAgICAgY29uc3Qga2V5U2V0ID0gIWhhcmRGaWx0ZXJzLmtleSA/IFtdIDogaGFyZEZpbHRlcnMua2V5LnNwbGl0KCcsJyk7XG4gICAgICAgIC8vIHZhciAkZXZlbnRMaXN0ID0gd2luZG93LkVWRU5UU19EQVRBLmRhdGEubWFwKGl0ZW0gPT4ge1xuICAgICAgICAvLyAgIGlmIChrZXlTZXQubGVuZ3RoID09IDApIHtcbiAgICAgICAgLy8gICAgIHJldHVybiBpdGVtLmV2ZW50X3R5cGUgJiYgaXRlbS5ldmVudF90eXBlLnRvTG93ZXJDYXNlKCkgPT0gJ2dyb3VwJyA/IHJlbmRlckdyb3VwKGl0ZW0pIDogcmVuZGVyRXZlbnQoaXRlbSwgcmVmZXJyZXIsIHNvdXJjZSk7XG4gICAgICAgIC8vICAgfSBlbHNlIGlmIChrZXlTZXQubGVuZ3RoID4gMCAmJiBpdGVtLmV2ZW50X3R5cGUgIT0gJ2dyb3VwJyAmJiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5ldmVudF90eXBlKSkge1xuICAgICAgICAvLyAgICAgcmV0dXJuIHJlbmRlckV2ZW50KGl0ZW0sIHJlZmVycmVyLCBzb3VyY2UpO1xuICAgICAgICAvLyAgIH0gZWxzZSBpZiAoa2V5U2V0Lmxlbmd0aCA+IDAgJiYgaXRlbS5ldmVudF90eXBlID09ICdncm91cCcgJiYga2V5U2V0LmluY2x1ZGVzKGl0ZW0uc3VwZXJncm91cCkpIHtcbiAgICAgICAgLy8gICAgIHJldHVybiByZW5kZXJHcm91cChpdGVtLCByZWZlcnJlciwgc291cmNlKVxuICAgICAgICAvLyAgIH1cbiAgICAgICAgLy8gICByZXR1cm4gbnVsbDtcbiAgICAgICAgLy8gfSlcblxuICAgICAgICAvLyBjb25zdCBldmVudFR5cGUgPSBpdGVtLmV2ZW50X3R5cGUgPyBpdGVtLmV2ZW50X3R5cGUudG9Mb3dlckNhc2UoKSA6IG51bGw7XG4gICAgICAgIC8vIGNvbnN0IGluaXRpYWxEYXRhID0gd2luZG93LkVWRU5UU19EQVRBLmRhdGEuZmlsdGVyKGl0ZW0gPT4ga2V5U2V0Lmxlbmd0aCA9PSAwXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHRydWVcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDoga2V5U2V0LmluY2x1ZGVzKGl0ZW0uZXZlbnRfdHlwZSAhPSAnZ3JvdXAnID8gaXRlbS5ldmVudF90eXBlIDogd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKSkpO1xuICAgICAgICAvLyBjb25zdCBsaXN0Q29udGFpbmVyID0gZDNUYXJnZXQuc2VsZWN0KFwidWxcIik7XG4gICAgICAgIC8vIGxpc3RDb250YWluZXIuc2VsZWN0QWxsKFwibGlcIilcbiAgICAgICAgLy8gICAuZGF0YShpbml0aWFsRGF0YSwgKGl0ZW0pID0+IGl0ZW0gPyBpdGVtLnVybCA6ICcnKVxuICAgICAgICAvLyAgIC5lbnRlcigpXG4gICAgICAgIC8vICAgLmFwcGVuZCgnbGknKVxuICAgICAgICAvLyAgICAgLmF0dHIoXCJjbGFzc1wiLCAoaXRlbSkgPT4gaXRlbS5ldmVudF90eXBlICE9ICdncm91cCcgPyAnZXZlbnRzIGV2ZW50LW9iaicgOiAnZ3JvdXAtb2JqJylcbiAgICAgICAgLy8gICAgIC5odG1sKChpdGVtKSA9PiBpdGVtLmV2ZW50X3R5cGUgIT0gJ2dyb3VwJyA/IHJlbmRlckV2ZW50KGl0ZW0sIHJlZmVycmVyLCBzb3VyY2UpIDogcmVuZGVyR3JvdXAoaXRlbSkpXG4gICAgICAgIC8vICAgLmV4aXQoKTtcbiAgICAgICAgICAvLyAucmVtb3ZlKCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGxpc3RDb250YWluZXIpO1xuICAgICAgICAvLyAkdGFyZ2V0LmZpbmQoJ3VsIGxpJykucmVtb3ZlKCk7XG4gICAgICAgIC8vICR0YXJnZXQuZmluZCgndWwnKS5hcHBlbmQoJGV2ZW50TGlzdCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsIlxuXG5jb25zdCBNYXBNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIGxldCBMQU5HVUFHRSA9ICdlbic7XG5cbiAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSwgcmVmZXJyZXIgPSBudWxsLCBzb3VyY2UgPSBudWxsKSA9PiB7XG5cbiAgICBsZXQgbSA9IG1vbWVudChuZXcgRGF0ZShpdGVtLnN0YXJ0X2RhdGV0aW1lKSk7XG4gICAgbSA9IG0udXRjKCkuc3VidHJhY3QobS51dGNPZmZzZXQoKSwgJ20nKTtcblxuICAgIHZhciBkYXRlID0gbS5mb3JtYXQoXCJkZGRkIE1NTSBERCwgaDptbWFcIik7XG4gICAgbGV0IHVybCA9IGl0ZW0udXJsLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0udXJsIDogXCIvL1wiICsgaXRlbS51cmw7XG5cbiAgICB1cmwgPSBIZWxwZXIucmVmU291cmNlKHVybCwgcmVmZXJyZXIsIHNvdXJjZSk7XG5cbiAgICBsZXQgc3VwZXJHcm91cCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG4gICAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPSdwb3B1cC1pdGVtICR7aXRlbS5ldmVudF90eXBlfSAke3N1cGVyR3JvdXB9JyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudFwiPlxuICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgPGxpIGNsYXNzPVwidGFnIHRhZy0ke2l0ZW0uZXZlbnRfdHlwZX1cIj4ke2l0ZW0uZXZlbnRfdHlwZSB8fCAnQWN0aW9uJ308L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8aDIgY2xhc3M9XCJldmVudC10aXRsZVwiPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtZGF0ZVwiPiR7ZGF0ZX08L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWFkZHJlc3MgYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgPHA+JHtpdGVtLnZlbnVlfTwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPlJTVlA8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgYFxuICB9O1xuXG4gIGNvbnN0IHJlbmRlckdyb3VwID0gKGl0ZW0sIHJlZmVycmVyID0gbnVsbCwgc291cmNlID0gbnVsbCkgPT4ge1xuXG4gICAgbGV0IHVybCA9IGl0ZW0ud2Vic2l0ZS5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLndlYnNpdGUgOiBcIi8vXCIgKyBpdGVtLndlYnNpdGU7XG5cbiAgICB1cmwgPSBIZWxwZXIucmVmU291cmNlKHVybCwgcmVmZXJyZXIsIHNvdXJjZSk7XG5cbiAgICBsZXQgc3VwZXJHcm91cCA9IHdpbmRvdy5zbHVnaWZ5KGl0ZW0uc3VwZXJncm91cCk7XG4gICAgcmV0dXJuIGBcbiAgICA8bGk+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ncm91cCBncm91cC1vYmogJHtzdXBlckdyb3VwfVwiPlxuICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgPGxpIGNsYXNzPVwidGFnIHRhZy0ke2l0ZW0uc3VwZXJncm91cH0gJHtzdXBlckdyb3VwfVwiPiR7aXRlbS5zdXBlcmdyb3VwfTwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1oZWFkZXJcIj5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0ubmFtZX08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtbG9jYXRpb24gbG9jYXRpb25cIj4ke2l0ZW0ubG9jYXRpb259PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICA8cD4ke2l0ZW0uZGVzY3JpcHRpb259PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+R2V0IEludm9sdmVkPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvbGk+XG4gICAgYFxuICB9O1xuXG4gIGNvbnN0IHJlbmRlckFubm90YXRpb25Qb3B1cCA9IChpdGVtKSA9PiB7XG4gICAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPSdwb3B1cC1pdGVtIGFubm90YXRpb24nIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLWFubm90YXRpb25cIj5Bbm5vdGF0aW9uPC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPGgyIGNsYXNzPVwiZXZlbnQtdGl0bGVcIj4ke2l0ZW0ubmFtZX08L2gyPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtYWRkcmVzcyBhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICA8cD4ke2l0ZW0uZGVzY3JpcHRpb259PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICAgIGA7XG4gIH1cblxuXG4gIGNvbnN0IHJlbmRlckFubm90YXRpb25zR2VvSnNvbiA9IChsaXN0KSA9PiB7XG4gICAgcmV0dXJuIGxpc3QubWFwKChpdGVtKSA9PiB7XG4gICAgICBjb25zdCByZW5kZXJlZCA9IHJlbmRlckFubm90YXRpb25Qb3B1cChpdGVtKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICB0eXBlOiBcIlBvaW50XCIsXG4gICAgICAgICAgY29vcmRpbmF0ZXM6IFtpdGVtLmxuZywgaXRlbS5sYXRdXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBhbm5vdGF0aW9uUHJvcHM6IGl0ZW0sXG4gICAgICAgICAgcG9wdXBDb250ZW50OiByZW5kZXJlZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IHJlbmRlckdlb2pzb24gPSAobGlzdCwgcmVmID0gbnVsbCwgc3JjID0gbnVsbCkgPT4ge1xuICAgIHJldHVybiBsaXN0Lm1hcCgoaXRlbSkgPT4ge1xuICAgICAgLy8gcmVuZGVyZWQgZXZlbnRUeXBlXG4gICAgICBsZXQgcmVuZGVyZWQ7XG5cbiAgICAgIGlmIChpdGVtLmV2ZW50X3R5cGUgJiYgaXRlbS5ldmVudF90eXBlLnRvTG93ZXJDYXNlKCkgPT0gJ2dyb3VwJykge1xuICAgICAgICByZW5kZXJlZCA9IHJlbmRlckdyb3VwKGl0ZW0sIHJlZiwgc3JjKTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVuZGVyZWQgPSByZW5kZXJFdmVudChpdGVtLCByZWYsIHNyYyk7XG4gICAgICB9XG5cbiAgICAgIC8vIGZvcm1hdCBjaGVja1xuICAgICAgaWYgKGlzTmFOKHBhcnNlRmxvYXQocGFyc2VGbG9hdChpdGVtLmxuZykpKSkge1xuICAgICAgICBpdGVtLmxuZyA9IGl0ZW0ubG5nLnN1YnN0cmluZygxKVxuICAgICAgfVxuICAgICAgaWYgKGlzTmFOKHBhcnNlRmxvYXQocGFyc2VGbG9hdChpdGVtLmxhdCkpKSkge1xuICAgICAgICBpdGVtLmxhdCA9IGl0ZW0ubGF0LnN1YnN0cmluZygxKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICAgIGdlb21ldHJ5OiB7XG4gICAgICAgICAgdHlwZTogXCJQb2ludFwiLFxuICAgICAgICAgIGNvb3JkaW5hdGVzOiBbaXRlbS5sbmcsIGl0ZW0ubGF0XVxuICAgICAgICB9LFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgZXZlbnRQcm9wZXJ0aWVzOiBpdGVtLFxuICAgICAgICAgIHBvcHVwQ29udGVudDogcmVuZGVyZWRcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gKG9wdGlvbnMpID0+IHtcbiAgICB2YXIgYWNjZXNzVG9rZW4gPSAncGsuZXlKMUlqb2liV0YwZEdobGR6TTFNQ0lzSW1FaU9pSmFUVkZNVWtVd0luMC53Y00zWGM4QkdDNlBNLU95cndqbmhnJztcbiAgICB2YXIgbWFwID0gTC5tYXAoJ21hcC1wcm9wZXInLCB7IGRyYWdnaW5nOiAhTC5Ccm93c2VyLm1vYmlsZSB9KS5zZXRWaWV3KFszNC44ODU5MzA5NDA3NTMxNywgNS4wOTc2NTYyNTAwMDAwMDFdLCAyKTtcblxuICAgIGxldCB7cmVmZXJyZXIsIHNvdXJjZX0gPSBvcHRpb25zO1xuXG4gICAgaWYgKCFMLkJyb3dzZXIubW9iaWxlKSB7XG4gICAgICBtYXAuc2Nyb2xsV2hlZWxab29tLmRpc2FibGUoKTtcbiAgICB9XG5cbiAgICBMQU5HVUFHRSA9IG9wdGlvbnMubGFuZyB8fCAnZW4nO1xuXG4gICAgaWYgKG9wdGlvbnMub25Nb3ZlKSB7XG4gICAgICBtYXAub24oJ2RyYWdlbmQnLCAoZXZlbnQpID0+IHtcblxuXG4gICAgICAgIGxldCBzdyA9IFttYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxuZ107XG4gICAgICAgIGxldCBuZSA9IFttYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxuZ107XG4gICAgICAgIG9wdGlvbnMub25Nb3ZlKHN3LCBuZSk7XG4gICAgICB9KS5vbignem9vbWVuZCcsIChldmVudCkgPT4ge1xuICAgICAgICBpZiAobWFwLmdldFpvb20oKSA8PSA0KSB7XG4gICAgICAgICAgJChcIiNtYXBcIikuYWRkQ2xhc3MoXCJ6b29tZWQtb3V0XCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICQoXCIjbWFwXCIpLnJlbW92ZUNsYXNzKFwiem9vbWVkLW91dFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzdyA9IFttYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxuZ107XG4gICAgICAgIGxldCBuZSA9IFttYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxuZ107XG4gICAgICAgIG9wdGlvbnMub25Nb3ZlKHN3LCBuZSk7XG4gICAgICB9KVxuICAgIH1cblxuICAgIC8vIG1hcC5maXJlRXZlbnQoJ3pvb21lbmQnKTtcblxuICAgIEwudGlsZUxheWVyKCdodHRwczovL2FwaS5tYXBib3guY29tL3N0eWxlcy92MS9tYXR0aGV3MzUwL2NqYTQxdGlqazI3ZDYycnFvZDdnMGx4NGIvdGlsZXMvMjU2L3t6fS97eH0ve3l9P2FjY2Vzc190b2tlbj0nICsgYWNjZXNzVG9rZW4sIHtcbiAgICAgICAgYXR0cmlidXRpb246ICcmY29weTsgPGEgaHJlZj1cImh0dHA6Ly9vc20ub3JnL2NvcHlyaWdodFwiPk9wZW5TdHJlZXRNYXA8L2E+IGNvbnRyaWJ1dG9ycyDigKIgPGEgaHJlZj1cIi8vMzUwLm9yZ1wiPjM1MC5vcmc8L2E+J1xuICAgIH0pLmFkZFRvKG1hcCk7XG5cbiAgICAvLyBjb25zb2xlLmxvZyh3aW5kb3cucXVlcmllc1sndHdpbGlnaHQtem9uZSddLCB3aW5kb3cucXVlcmllc1sndHdpbGlnaHQtem9uZSddID09PSBcInRydWVcIik7XG4gICAgaWYod2luZG93LnF1ZXJpZXNbJ3R3aWxpZ2h0LXpvbmUnXSkge1xuICAgICAgTC50ZXJtaW5hdG9yKCkuYWRkVG8obWFwKVxuICAgIH1cblxuICAgIGxldCBnZW9jb2RlciA9IG51bGw7XG4gICAgcmV0dXJuIHtcbiAgICAgICRtYXA6IG1hcCxcbiAgICAgIGluaXRpYWxpemU6IChjYWxsYmFjaykgPT4ge1xuICAgICAgICBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgc2V0Qm91bmRzOiAoYm91bmRzMSwgYm91bmRzMikgPT4ge1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtib3VuZHMxLCBib3VuZHMyXTtcbiAgICAgICAgbWFwLmZpdEJvdW5kcyhib3VuZHMsIHsgYW5pbWF0ZTogZmFsc2V9KTtcbiAgICAgIH0sXG4gICAgICBzZXRDZW50ZXI6IChjZW50ZXIsIHpvb20gPSAxMCkgPT4ge1xuICAgICAgICBpZiAoIWNlbnRlciB8fCAhY2VudGVyWzBdIHx8IGNlbnRlclswXSA9PSBcIlwiXG4gICAgICAgICAgICAgIHx8ICFjZW50ZXJbMV0gfHwgY2VudGVyWzFdID09IFwiXCIpIHJldHVybjtcbiAgICAgICAgbWFwLnNldFZpZXcoY2VudGVyLCB6b29tKTtcbiAgICAgIH0sXG4gICAgICBnZXRCb3VuZHM6ICgpID0+IHtcblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuXG4gICAgICAgIHJldHVybiBbc3csIG5lXTtcbiAgICAgIH0sXG4gICAgICAvLyBDZW50ZXIgbG9jYXRpb24gYnkgZ2VvY29kZWRcbiAgICAgIGdldENlbnRlckJ5TG9jYXRpb246IChsb2NhdGlvbiwgY2FsbGJhY2spID0+IHtcblxuICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogbG9jYXRpb24gfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuXG4gICAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2socmVzdWx0c1swXSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHRyaWdnZXJab29tRW5kOiAoKSA9PiB7XG4gICAgICAgIG1hcC5maXJlRXZlbnQoJ3pvb21lbmQnKTtcbiAgICAgIH0sXG4gICAgICB6b29tT3V0T25jZTogKCkgPT4ge1xuICAgICAgICBtYXAuem9vbU91dCgxKTtcbiAgICAgIH0sXG4gICAgICB6b29tVW50aWxIaXQ6ICgpID0+IHtcbiAgICAgICAgdmFyICR0aGlzID0gdGhpcztcbiAgICAgICAgbWFwLnpvb21PdXQoMSk7XG4gICAgICAgIGxldCBpbnRlcnZhbEhhbmRsZXIgPSBudWxsO1xuICAgICAgICBpbnRlcnZhbEhhbmRsZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgdmFyIF92aXNpYmxlID0gJChkb2N1bWVudCkuZmluZCgndWwgbGkuZXZlbnQtb2JqLndpdGhpbi1ib3VuZCwgdWwgbGkuZ3JvdXAtb2JqLndpdGhpbi1ib3VuZCcpLmxlbmd0aDtcbiAgICAgICAgICBpZiAoX3Zpc2libGUgPT0gMCkge1xuICAgICAgICAgICAgbWFwLnpvb21PdXQoMSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxIYW5kbGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIDIwMCk7XG4gICAgICB9LFxuICAgICAgcmVmcmVzaE1hcDogKCkgPT4ge1xuICAgICAgICBtYXAuaW52YWxpZGF0ZVNpemUoZmFsc2UpO1xuICAgICAgICAvLyBtYXAuX29uUmVzaXplKCk7XG4gICAgICAgIC8vIG1hcC5maXJlRXZlbnQoJ3pvb21lbmQnKTtcblxuXG4gICAgICB9LFxuICAgICAgZmlsdGVyTWFwOiAoZmlsdGVycykgPT4ge1xuXG4gICAgICAgICQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cFwiKS5oaWRlKCk7XG5cblxuICAgICAgICBpZiAoIWZpbHRlcnMpIHJldHVybjtcblxuICAgICAgICBmaWx0ZXJzLmZvckVhY2goKGl0ZW0pID0+IHtcblxuICAgICAgICAgICQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cC5cIiArIGl0ZW0udG9Mb3dlckNhc2UoKSkuc2hvdygpO1xuICAgICAgICB9KVxuICAgICAgfSxcbiAgICAgIHBsb3RQb2ludHM6IChsaXN0LCBoYXJkRmlsdGVycywgZ3JvdXBzKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleVNldCA9ICFoYXJkRmlsdGVycy5rZXkgPyBbXSA6IGhhcmRGaWx0ZXJzLmtleS5zcGxpdCgnLCcpO1xuXG4gICAgICAgIGlmIChrZXlTZXQubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGxpc3QgPSBsaXN0LmZpbHRlcigoaXRlbSkgPT4ga2V5U2V0LmluY2x1ZGVzKGl0ZW0uZXZlbnRfdHlwZSkpXG4gICAgICAgIH1cblxuXG4gICAgICAgIGNvbnN0IGdlb2pzb24gPSB7XG4gICAgICAgICAgdHlwZTogXCJGZWF0dXJlQ29sbGVjdGlvblwiLFxuICAgICAgICAgIGZlYXR1cmVzOiByZW5kZXJHZW9qc29uKGxpc3QsIHJlZmVycmVyLCBzb3VyY2UpXG4gICAgICAgIH07XG5cblxuICAgICAgICBjb25zdCBldmVudHNMYXllciA9IEwuZ2VvSlNPTihnZW9qc29uLCB7XG4gICAgICAgICAgICBwb2ludFRvTGF5ZXI6IChmZWF0dXJlLCBsYXRsbmcpID0+IHtcbiAgICAgICAgICAgICAgLy8gSWNvbnMgZm9yIG1hcmtlcnNcbiAgICAgICAgICAgICAgY29uc3QgZXZlbnRUeXBlID0gZmVhdHVyZS5wcm9wZXJ0aWVzLmV2ZW50UHJvcGVydGllcy5ldmVudF90eXBlO1xuXG4gICAgICAgICAgICAgIC8vIElmIG5vIHN1cGVyZ3JvdXAsIGl0J3MgYW4gZXZlbnQuXG4gICAgICAgICAgICAgIGNvbnN0IHN1cGVyZ3JvdXAgPSBncm91cHNbZmVhdHVyZS5wcm9wZXJ0aWVzLmV2ZW50UHJvcGVydGllcy5zdXBlcmdyb3VwXSA/IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuc3VwZXJncm91cCA6IFwiRXZlbnRzXCI7XG4gICAgICAgICAgICAgIGNvbnN0IHNsdWdnZWQgPSB3aW5kb3cuc2x1Z2lmeShzdXBlcmdyb3VwKTtcblxuXG5cbiAgICAgICAgICAgICAgbGV0IGljb25Vcmw7XG4gICAgICAgICAgICAgIGNvbnN0IGlzUGFzdCA9IG5ldyBEYXRlKGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuc3RhcnRfZGF0ZXRpbWUpIDwgbmV3IERhdGUoKTtcbiAgICAgICAgICAgICAgaWYgKGV2ZW50VHlwZSA9PSBcIkFjdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgaWNvblVybCA9IGlzUGFzdCA/IFwiL2ltZy9wYXN0LWV2ZW50LnBuZ1wiIDogXCIvaW1nL2V2ZW50LnBuZ1wiO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGljb25VcmwgPSBncm91cHNbc3VwZXJncm91cF0gPyBncm91cHNbc3VwZXJncm91cF0uaWNvbnVybCB8fCBcIi9pbWcvZXZlbnQucG5nXCIgIDogXCIvaW1nL2V2ZW50LnBuZ1wiIDtcbiAgICAgICAgICAgICAgfVxuXG5cblxuICAgICAgICAgICAgICBjb25zdCBzbWFsbEljb24gPSAgTC5pY29uKHtcbiAgICAgICAgICAgICAgICBpY29uVXJsOiBpY29uVXJsLFxuICAgICAgICAgICAgICAgIGljb25TaXplOiBbMTgsIDE4XSxcbiAgICAgICAgICAgICAgICBpY29uQW5jaG9yOiBbOSwgOV0sXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBzbHVnZ2VkICsgJyBldmVudC1pdGVtLXBvcHVwICcgKyAoaXNQYXN0JiZldmVudFR5cGUgPT0gXCJBY3Rpb25cIj9cImV2ZW50LXBhc3QtZXZlbnRcIjpcIlwiKVxuICAgICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICAgIHZhciBnZW9qc29uTWFya2VyT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBpY29uOiBzbWFsbEljb24sXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJldHVybiBMLm1hcmtlcihsYXRsbmcsIGdlb2pzb25NYXJrZXJPcHRpb25zKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICBvbkVhY2hGZWF0dXJlOiAoZmVhdHVyZSwgbGF5ZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChmZWF0dXJlLnByb3BlcnRpZXMgJiYgZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCkge1xuICAgICAgICAgICAgICBsYXllci5iaW5kUG9wdXAoZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNvbnN0IGlzUGFzdCA9IG5ldyBEYXRlKGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuc3RhcnRfZGF0ZXRpbWUpIDwgbmV3IERhdGUoKTtcbiAgICAgICAgICAgIC8vIGNvbnN0IGV2ZW50VHlwZSA9IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuZXZlbnRfdHlwZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGV2ZW50c0xheWVyLmFkZFRvKG1hcCk7XG4gICAgICAgIC8vIGV2ZW50c0xheWVyLmJyaW5nVG9CYWNrKCk7XG5cblxuICAgICAgICAvLyBBZGQgQW5ub3RhdGlvbnNcbiAgICAgICAgaWYgKHdpbmRvdy5xdWVyaWVzLmFubm90YXRpb24pIHtcbiAgICAgICAgICBjb25zdCBhbm5vdGF0aW9ucyA9ICF3aW5kb3cuRVZFTlRTX0RBVEEuYW5ub3RhdGlvbnMgPyBbXSA6IHdpbmRvdy5FVkVOVFNfREFUQS5hbm5vdGF0aW9ucy5maWx0ZXIoKGl0ZW0pPT5pdGVtLnR5cGU9PT13aW5kb3cucXVlcmllcy5hbm5vdGF0aW9uKTtcblxuICAgICAgICAgIGNvbnN0IGFubm90SWNvbiA9ICBMLmljb24oe1xuICAgICAgICAgICAgaWNvblVybDogXCIvaW1nL2Fubm90YXRpb24ucG5nXCIsXG4gICAgICAgICAgICBpY29uU2l6ZTogWzQwLCA0MF0sXG4gICAgICAgICAgICBpY29uQW5jaG9yOiBbMjAsIDIwXSxcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ2Fubm90YXRpb24tcG9wdXAnXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgY29uc3QgYW5ub3RNYXJrZXJzID0gYW5ub3RhdGlvbnMubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gTC5tYXJrZXIoW2l0ZW0ubGF0LCBpdGVtLmxuZ10sIHtpY29uOiBhbm5vdEljb259KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmJpbmRQb3B1cChyZW5kZXJBbm5vdGF0aW9uUG9wdXAoaXRlbSkpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyBhbm5vdExheWVyLmJyaW5nVG9Gcm9udCgpO1xuXG4gICAgICAgICAgLy8gY29uc3QgYW5ub3RMYXllckdyb3VwID0gO1xuXG4gICAgICAgICAgY29uc3QgYW5ub3RMYXllckdyb3VwID0gbWFwLmFkZExheWVyKEwuZmVhdHVyZUdyb3VwKGFubm90TWFya2VycykpO1xuICAgICAgICAgIC8vIGFubm90TGF5ZXJHcm91cC5icmluZ1RvRnJvbnQoKTtcbiAgICAgICAgICAvLyBhbm5vdE1hcmtlcnMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAvLyAgIGl0ZW0uYWRkVG8obWFwKTtcbiAgICAgICAgICAvLyAgIGl0ZW0uYnJpbmdUb0Zyb250KCk7XG4gICAgICAgICAgLy8gfSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHVwZGF0ZTogKHApID0+IHtcbiAgICAgICAgaWYgKCFwIHx8ICFwLmxhdCB8fCAhcC5sbmcgKSByZXR1cm47XG5cbiAgICAgICAgbWFwLnNldFZpZXcoTC5sYXRMbmcocC5sYXQsIHAubG5nKSwgMTApO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJjb25zdCBRdWVyeU1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRGb3JtID0gXCJmb3JtI2ZpbHRlcnMtZm9ybVwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRGb3JtID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0Rm9ybSkgOiB0YXJnZXRGb3JtO1xuICAgIGxldCBsYXQgPSBudWxsO1xuICAgIGxldCBsbmcgPSBudWxsO1xuXG4gICAgbGV0IHByZXZpb3VzID0ge307XG5cbiAgICAkdGFyZ2V0Lm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgbGF0ID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbCgpO1xuICAgICAgbG5nID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbCgpO1xuXG4gICAgICB2YXIgZm9ybSA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcblxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAkLnBhcmFtKGZvcm0pO1xuICAgIH0pXG5cbiAgICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJ3NlbGVjdCNmaWx0ZXItaXRlbXMnLCAoKSA9PiB7XG4gICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgIH0pXG5cblxuICAgIHJldHVybiB7XG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgcGFyYW1zID0gJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSlcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhbmddXCIpLnZhbChwYXJhbXMubGFuZyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChwYXJhbXMubGF0KTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKHBhcmFtcy5sbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwocGFyYW1zLmJvdW5kMSk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChwYXJhbXMuYm91bmQyKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxvY11cIikudmFsKHBhcmFtcy5sb2MpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9a2V5XVwiKS52YWwocGFyYW1zLmtleSk7XG5cbiAgICAgICAgICBpZiAocGFyYW1zLmZpbHRlcikge1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiI2ZpbHRlci1pdGVtcyBvcHRpb25cIikucmVtb3ZlUHJvcChcInNlbGVjdGVkXCIpO1xuICAgICAgICAgICAgcGFyYW1zLmZpbHRlci5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIjZmlsdGVyLWl0ZW1zIG9wdGlvblt2YWx1ZT0nXCIgKyBpdGVtICsgXCInXVwiKS5wcm9wKFwic2VsZWN0ZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGdldFBhcmFtZXRlcnM6ICgpID0+IHtcbiAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG4gICAgICAgIC8vIHBhcmFtZXRlcnNbJ2xvY2F0aW9uJ10gO1xuXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHBhcmFtZXRlcnMpIHtcbiAgICAgICAgICBpZiAoICFwYXJhbWV0ZXJzW2tleV0gfHwgcGFyYW1ldGVyc1trZXldID09IFwiXCIpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBwYXJhbWV0ZXJzW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtZXRlcnM7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTG9jYXRpb246IChsYXQsIGxuZykgPT4ge1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKGxhdCk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwobG5nKTtcbiAgICAgICAgLy8gJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVWaWV3cG9ydDogKHZpZXdwb3J0KSA9PiB7XG5cbiAgICAgICAgLy8gQXZlcmFnZSBpdCBpZiBsZXNzIHRoYW4gMTBtaSByYWRpdXNcbiAgICAgICAgaWYgKE1hdGguYWJzKHZpZXdwb3J0LmYuYiAtIHZpZXdwb3J0LmYuZikgPCAuMTUgfHwgTWF0aC5hYnModmlld3BvcnQuYi5iIC0gdmlld3BvcnQuYi5mKSA8IC4xNSkge1xuICAgICAgICAgIGxldCBmQXZnID0gKHZpZXdwb3J0LmYuYiArIHZpZXdwb3J0LmYuZikgLyAyO1xuICAgICAgICAgIGxldCBiQXZnID0gKHZpZXdwb3J0LmIuYiArIHZpZXdwb3J0LmIuZikgLyAyO1xuICAgICAgICAgIHZpZXdwb3J0LmYgPSB7IGI6IGZBdmcgLSAuMDgsIGY6IGZBdmcgKyAuMDggfTtcbiAgICAgICAgICB2aWV3cG9ydC5iID0geyBiOiBiQXZnIC0gLjA4LCBmOiBiQXZnICsgLjA4IH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYm91bmRzID0gW1t2aWV3cG9ydC5mLmIsIHZpZXdwb3J0LmIuYl0sIFt2aWV3cG9ydC5mLmYsIHZpZXdwb3J0LmIuZl1dO1xuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlVmlld3BvcnRCeUJvdW5kOiAoc3csIG5lKSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW3N3LCBuZV07Ly8vLy8vLy9cblxuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdHJpZ2dlclN1Ym1pdDogKCkgPT4ge1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSkoalF1ZXJ5KTtcbiIsImxldCBhdXRvY29tcGxldGVNYW5hZ2VyO1xubGV0IG1hcE1hbmFnZXI7XG5cbndpbmRvdy5ERUZBVUxUX0lDT04gPSBcIi9pbWcvZXZlbnQucG5nXCI7XG53aW5kb3cuc2x1Z2lmeSA9ICh0ZXh0KSA9PiAhdGV4dCA/IHRleHQgOiB0ZXh0LnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHMrL2csICctJykgICAgICAgICAgIC8vIFJlcGxhY2Ugc3BhY2VzIHdpdGggLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9bXlxcd1xcLV0rL2csICcnKSAgICAgICAvLyBSZW1vdmUgYWxsIG5vbi13b3JkIGNoYXJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcLVxcLSsvZywgJy0nKSAgICAgICAgIC8vIFJlcGxhY2UgbXVsdGlwbGUgLSB3aXRoIHNpbmdsZSAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL14tKy8sICcnKSAgICAgICAgICAgICAvLyBUcmltIC0gZnJvbSBzdGFydCBvZiB0ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLy0rJC8sICcnKTsgICAgICAgICAgICAvLyBUcmltIC0gZnJvbSBlbmQgb2YgdGV4dFxuXG5jb25zdCBnZXRRdWVyeVN0cmluZyA9ICgpID0+IHtcbiAgICB2YXIgcXVlcnlTdHJpbmdLZXlWYWx1ZSA9IHdpbmRvdy5wYXJlbnQubG9jYXRpb24uc2VhcmNoLnJlcGxhY2UoJz8nLCAnJykuc3BsaXQoJyYnKTtcbiAgICB2YXIgcXNKc29uT2JqZWN0ID0ge307XG4gICAgaWYgKHF1ZXJ5U3RyaW5nS2V5VmFsdWUgIT0gJycpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBxdWVyeVN0cmluZ0tleVZhbHVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBxc0pzb25PYmplY3RbcXVlcnlTdHJpbmdLZXlWYWx1ZVtpXS5zcGxpdCgnPScpWzBdXSA9IHF1ZXJ5U3RyaW5nS2V5VmFsdWVbaV0uc3BsaXQoJz0nKVsxXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcXNKc29uT2JqZWN0O1xufTtcblxuKGZ1bmN0aW9uKCQpIHtcbiAgLy8gTG9hZCB0aGluZ3NcblxuICB3aW5kb3cucXVlcmllcyA9ICAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHJpbmcoMSkpO1xuICB0cnkge1xuICAgIGlmICgoIXdpbmRvdy5xdWVyaWVzLmdyb3VwIHx8ICghd2luZG93LnF1ZXJpZXMucmVmZXJyZXIgJiYgIXdpbmRvdy5xdWVyaWVzLnNvdXJjZSkpICYmIHdpbmRvdy5wYXJlbnQpIHtcbiAgICAgIHdpbmRvdy5xdWVyaWVzID0ge1xuICAgICAgICBncm91cDogZ2V0UXVlcnlTdHJpbmcoKS5ncm91cCxcbiAgICAgICAgcmVmZXJyZXI6IGdldFF1ZXJ5U3RyaW5nKCkucmVmZXJyZXIsXG4gICAgICAgIHNvdXJjZTogZ2V0UXVlcnlTdHJpbmcoKS5zb3VyY2UsXG4gICAgICAgIFwidHdpbGlnaHQtem9uZVwiOiB3aW5kb3cucXVlcmllc1sndHdpbGlnaHQtem9uZSddLFxuICAgICAgICBcImFubm90YXRpb25cIjogd2luZG93LnF1ZXJpZXNbJ2Fubm90YXRpb24nXSxcbiAgICAgICAgXCJmdWxsLW1hcFwiOiB3aW5kb3cucXVlcmllc1snZnVsbC1tYXAnXSxcbiAgICAgICAgXCJsYW5nXCI6IHdpbmRvdy5xdWVyaWVzWydsYW5nJ11cbiAgICAgIH07XG4gICAgfVxuICB9IGNhdGNoKGUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiwgZSk7XG4gIH1cblxuICBpZiAod2luZG93LnF1ZXJpZXNbJ2Z1bGwtbWFwJ10pIHtcbiAgICBpZiAoJCh3aW5kb3cpLndpZHRoKCkgPCA2MDApIHtcbiAgICAgIC8vICQoXCIjZXZlbnRzLWxpc3QtY29udGFpbmVyXCIpLmhpZGUoKTtcbiAgICAgICQoXCJib2R5XCIpLmFkZENsYXNzKFwibWFwLXZpZXdcIik7XG4gICAgICAvLyAkKFwiLmZpbHRlci1hcmVhXCIpLmhpZGUoKTtcbiAgICAgIC8vICQoXCJzZWN0aW9uI21hcFwiKS5jc3MoXCJoZWlnaHRcIiwgXCJjYWxjKDEwMCUgLSA2NHB4KVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJChcImJvZHlcIikuYWRkQ2xhc3MoXCJmaWx0ZXItY29sbGFwc2VkXCIpO1xuICAgICAgLy8gJChcIiNldmVudHMtbGlzdC1jb250YWluZXJcIikuaGlkZSgpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAkKFwiI3Nob3ctaGlkZS1saXN0LWNvbnRhaW5lclwiKS5oaWRlKCk7XG4gIH1cblxuXG4gIGlmICh3aW5kb3cucXVlcmllcy5ncm91cCkge1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5wYXJlbnQoKS5jc3MoXCJvcGFjaXR5XCIsIFwiMFwiKTtcbiAgfVxuICBjb25zdCBidWlsZEZpbHRlcnMgPSAoKSA9PiB7JCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KHtcbiAgICAgIGVuYWJsZUhUTUw6IHRydWUsXG4gICAgICB0ZW1wbGF0ZXM6IHtcbiAgICAgICAgYnV0dG9uOiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJtdWx0aXNlbGVjdCBkcm9wZG93bi10b2dnbGVcIiBkYXRhLXRvZ2dsZT1cImRyb3Bkb3duXCI+PHNwYW4gZGF0YS1sYW5nLXRhcmdldD1cInRleHRcIiBkYXRhLWxhbmcta2V5PVwibW9yZS1zZWFyY2gtb3B0aW9uc1wiPjwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJmYSBmYS1jYXJldC1kb3duXCI+PC9zcGFuPjwvYnV0dG9uPicsXG4gICAgICAgIGxpOiAnPGxpPjxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCI+PGxhYmVsPjwvbGFiZWw+PC9hPjwvbGk+J1xuICAgICAgfSxcbiAgICAgIGRyb3BSaWdodDogdHJ1ZSxcbiAgICAgIG9uSW5pdGlhbGl6ZWQ6ICgpID0+IHtcblxuICAgICAgfSxcbiAgICAgIG9uRHJvcGRvd25TaG93OiAoKSA9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJtb2JpbGUtdXBkYXRlLW1hcC1oZWlnaHRcIik7XG4gICAgICAgIH0sIDEwKTtcblxuICAgICAgfSxcbiAgICAgIG9uRHJvcGRvd25IaWRlOiAoKSA9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJtb2JpbGUtdXBkYXRlLW1hcC1oZWlnaHRcIik7XG4gICAgICAgIH0sIDEwKTtcbiAgICAgIH0sXG4gICAgICBvcHRpb25MYWJlbDogKGUpID0+IHtcbiAgICAgICAgLy8gbGV0IGVsID0gJCggJzxkaXY+PC9kaXY+JyApO1xuICAgICAgICAvLyBlbC5hcHBlbmQoKCkgKyBcIlwiKTtcblxuICAgICAgICByZXR1cm4gdW5lc2NhcGUoJChlKS5hdHRyKCdsYWJlbCcpKSB8fCAkKGUpLmh0bWwoKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH07XG4gIGJ1aWxkRmlsdGVycygpO1xuXG5cbiAgJCgnc2VsZWN0I2xhbmd1YWdlLW9wdHMnKS5tdWx0aXNlbGVjdCh7XG4gICAgZW5hYmxlSFRNTDogdHJ1ZSxcbiAgICBvcHRpb25DbGFzczogKCkgPT4gJ2xhbmctb3B0JyxcbiAgICBzZWxlY3RlZENsYXNzOiAoKSA9PiAnbGFuZy1zZWwnLFxuICAgIGJ1dHRvbkNsYXNzOiAoKSA9PiAnbGFuZy1idXQnLFxuICAgIGRyb3BSaWdodDogdHJ1ZSxcbiAgICBvcHRpb25MYWJlbDogKGUpID0+IHtcbiAgICAgIC8vIGxldCBlbCA9ICQoICc8ZGl2PjwvZGl2PicgKTtcbiAgICAgIC8vIGVsLmFwcGVuZCgoKSArIFwiXCIpO1xuXG4gICAgICByZXR1cm4gdW5lc2NhcGUoJChlKS5hdHRyKCdsYWJlbCcpKSB8fCAkKGUpLmh0bWwoKTtcbiAgICB9LFxuICAgIG9uQ2hhbmdlOiAob3B0aW9uLCBjaGVja2VkLCBzZWxlY3QpID0+IHtcblxuICAgICAgY29uc3QgcGFyYW1ldGVycyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gICAgICBwYXJhbWV0ZXJzWydsYW5nJ10gPSBvcHRpb24udmFsKCk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1yZXNldC1tYXAnLCBwYXJhbWV0ZXJzKTtcblxuICAgIH1cbiAgfSlcblxuICAvLyAxLiBnb29nbGUgbWFwcyBnZW9jb2RlXG5cbiAgLy8gMi4gZm9jdXMgbWFwIG9uIGdlb2NvZGUgKHZpYSBsYXQvbG5nKVxuICBjb25zdCBxdWVyeU1hbmFnZXIgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICAgICAgcXVlcnlNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICBjb25zdCBpbml0UGFyYW1zID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcblxuXG5cbiAgY29uc3QgbGFuZ3VhZ2VNYW5hZ2VyID0gTGFuZ3VhZ2VNYW5hZ2VyKCk7XG5cbiAgY29uc3QgbGlzdE1hbmFnZXIgPSBMaXN0TWFuYWdlcih7XG4gICAgcmVmZXJyZXI6IHdpbmRvdy5xdWVyaWVzLnJlZmVycmVyLFxuICAgIHNvdXJjZTogd2luZG93LnF1ZXJpZXMuc291cmNlXG4gIH0pO1xuXG5cbiAgbWFwTWFuYWdlciA9IE1hcE1hbmFnZXIoe1xuICAgIG9uTW92ZTogKHN3LCBuZSkgPT4ge1xuICAgICAgLy8gV2hlbiB0aGUgbWFwIG1vdmVzIGFyb3VuZCwgd2UgdXBkYXRlIHRoZSBsaXN0XG4gICAgICBxdWVyeU1hbmFnZXIudXBkYXRlVmlld3BvcnRCeUJvdW5kKHN3LCBuZSk7XG4gICAgICAvL3VwZGF0ZSBRdWVyeVxuICAgIH0sXG4gICAgcmVmZXJyZXI6IHdpbmRvdy5xdWVyaWVzLnJlZmVycmVyLFxuICAgIHNvdXJjZTogd2luZG93LnF1ZXJpZXMuc291cmNlXG4gIH0pO1xuXG4gIHdpbmRvdy5pbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2sgPSAoKSA9PiB7XG5cbiAgICBhdXRvY29tcGxldGVNYW5hZ2VyID0gQXV0b2NvbXBsZXRlTWFuYWdlcihcImlucHV0W25hbWU9J2xvYyddXCIpO1xuICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuXG4gICAgaWYgKGluaXRQYXJhbXMubG9jICYmIGluaXRQYXJhbXMubG9jICE9PSAnJyAmJiAoIWluaXRQYXJhbXMuYm91bmQxICYmICFpbml0UGFyYW1zLmJvdW5kMikpIHtcbiAgICAgIG1hcE1hbmFnZXIuaW5pdGlhbGl6ZSgoKSA9PiB7XG4gICAgICAgIG1hcE1hbmFnZXIuZ2V0Q2VudGVyQnlMb2NhdGlvbihpbml0UGFyYW1zLmxvYywgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIHF1ZXJ5TWFuYWdlci51cGRhdGVWaWV3cG9ydChyZXN1bHQuZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgaWYoaW5pdFBhcmFtcy5sYXQgJiYgaW5pdFBhcmFtcy5sbmcpIHtcbiAgICBtYXBNYW5hZ2VyLnNldENlbnRlcihbaW5pdFBhcmFtcy5sYXQsIGluaXRQYXJhbXMubG5nXSk7XG4gIH1cblxuICAvKioqXG4gICogTGlzdCBFdmVudHNcbiAgKiBUaGlzIHdpbGwgdHJpZ2dlciB0aGUgbGlzdCB1cGRhdGUgbWV0aG9kXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCdtb2JpbGUtdXBkYXRlLW1hcC1oZWlnaHQnLCAoZXZlbnQpID0+IHtcbiAgICAvL1RoaXMgY2hlY2tzIGlmIHdpZHRoIGlzIGZvciBtb2JpbGVcbiAgICBpZiAoJCh3aW5kb3cpLndpZHRoKCkgPCA2MDApIHtcbiAgICAgIHNldFRpbWVvdXQoKCk9PiB7XG4gICAgICAgICQoXCIjbWFwXCIpLmhlaWdodCgkKFwiI2V2ZW50cy1saXN0XCIpLmhlaWdodCgpKTtcbiAgICAgICAgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCk7XG4gICAgICB9LCAxMCk7XG4gICAgfVxuICB9KVxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnBvcHVsYXRlTGlzdChvcHRpb25zLnBhcmFtcyk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuXG4gICAgbGlzdE1hbmFnZXIudXBkYXRlRmlsdGVyKG9wdGlvbnMpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlcicsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxldCBib3VuZDEsIGJvdW5kMjtcblxuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICBbYm91bmQxLCBib3VuZDJdID0gbWFwTWFuYWdlci5nZXRCb3VuZHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgICBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcbiAgICB9XG5cbiAgICBsaXN0TWFuYWdlci51cGRhdGVCb3VuZHMoYm91bmQxLCBib3VuZDIsIG9wdGlvbnMuZmlsdGVyKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItcmVzZXQtbWFwJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgdmFyIGNvcHkgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9wdGlvbnMpKTtcbiAgICBkZWxldGUgY29weVsnbG5nJ107XG4gICAgZGVsZXRlIGNvcHlbJ2xhdCddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDEnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQyJ107XG5cbiAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICQucGFyYW0oY29weSk7XG5cblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJ0cmlnZ2VyLWxhbmd1YWdlLXVwZGF0ZVwiLCBjb3B5KTtcbiAgICAkKFwic2VsZWN0I2ZpbHRlci1pdGVtc1wiKS5tdWx0aXNlbGVjdCgnZGVzdHJveScpO1xuICAgIGJ1aWxkRmlsdGVycygpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbG9hZC1ncm91cHMnLCB7IGdyb3Vwczogd2luZG93LkVWRU5UU19EQVRBLmdyb3VwcyB9KTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcblxuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcihcInRyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlXCIsIGNvcHkpO1xuICAgIH0sIDEwMDApO1xuICB9KTtcblxuXG4gIC8qKipcbiAgKiBNYXAgRXZlbnRzXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICAvLyBtYXBNYW5hZ2VyLnNldENlbnRlcihbb3B0aW9ucy5sYXQsIG9wdGlvbnMubG5nXSk7XG4gICAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLmJvdW5kMSB8fCAhb3B0aW9ucy5ib3VuZDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYm91bmQxID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMSk7XG4gICAgdmFyIGJvdW5kMiA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDIpO1xuXG4gICAgbWFwTWFuYWdlci5zZXRCb3VuZHMoYm91bmQxLCBib3VuZDIpO1xuICAgIC8vIG1hcE1hbmFnZXIudHJpZ2dlclpvb21FbmQoKTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgbWFwTWFuYWdlci50cmlnZ2VyWm9vbUVuZCgpO1xuICAgIH0sIDEwKTtcblxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCBcIiNjb3B5LWVtYmVkXCIsIChlKSA9PiB7XG4gICAgdmFyIGNvcHlUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbWJlZC10ZXh0XCIpO1xuICAgIGNvcHlUZXh0LnNlbGVjdCgpO1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiQ29weVwiKTtcbiAgfSk7XG5cbiAgLy8gMy4gbWFya2VycyBvbiBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXBsb3QnLCAoZSwgb3B0KSA9PiB7XG5cbiAgICBtYXBNYW5hZ2VyLnBsb3RQb2ludHMob3B0LmRhdGEsIG9wdC5wYXJhbXMsIG9wdC5ncm91cHMpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicpO1xuICB9KVxuXG4gIC8vIGxvYWQgZ3JvdXBzXG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbG9hZC1ncm91cHMnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLmVtcHR5KCk7XG4gICAgb3B0Lmdyb3Vwcy5mb3JFYWNoKChpdGVtKSA9PiB7XG5cbiAgICAgIGxldCBzbHVnZ2VkID0gd2luZG93LnNsdWdpZnkoaXRlbS5zdXBlcmdyb3VwKTtcbiAgICAgIGxldCB2YWx1ZVRleHQgPSBsYW5ndWFnZU1hbmFnZXIuZ2V0VHJhbnNsYXRpb24oaXRlbS50cmFuc2xhdGlvbik7XG4gICAgICAkKCdzZWxlY3QjZmlsdGVyLWl0ZW1zJykuYXBwZW5kKGBcbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9JyR7c2x1Z2dlZH0nXG4gICAgICAgICAgICAgIHNlbGVjdGVkPSdzZWxlY3RlZCdcbiAgICAgICAgICAgICAgbGFiZWw9XCI8c3BhbiBkYXRhLWxhbmctdGFyZ2V0PSd0ZXh0JyBkYXRhLWxhbmcta2V5PScke2l0ZW0udHJhbnNsYXRpb259Jz4ke3ZhbHVlVGV4dH08L3NwYW4+PGltZyBzcmM9JyR7aXRlbS5pY29udXJsIHx8IHdpbmRvdy5ERUZBVUxUX0lDT059JyAvPlwiPlxuICAgICAgICAgICAgPC9vcHRpb24+YClcbiAgICB9KTtcblxuICAgIC8vIFJlLWluaXRpYWxpemVcbiAgICBxdWVyeU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuICAgIC8vICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5tdWx0aXNlbGVjdCgnZGVzdHJveScpO1xuICAgICQoJ3NlbGVjdCNmaWx0ZXItaXRlbXMnKS5tdWx0aXNlbGVjdCgncmVidWlsZCcpO1xuXG4gICAgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCk7XG5cblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJyk7XG5cbiAgfSlcblxuICAvLyBGaWx0ZXIgbWFwXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCAoZSwgb3B0KSA9PiB7XG4gICAgaWYgKG9wdCkge1xuICAgICAgbWFwTWFuYWdlci5maWx0ZXJNYXAob3B0LmZpbHRlcik7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sYW5ndWFnZS11cGRhdGUnLCAoZSwgb3B0KSA9PiB7XG5cbiAgICBpZiAod2luZG93LnF1ZXJpZXMubGFuZykge1xuICAgICAgbGFuZ3VhZ2VNYW5hZ2VyLnVwZGF0ZUxhbmd1YWdlKHdpbmRvdy5xdWVyaWVzLmxhbmcpO1xuICAgIH0gZWxzZSBpZiAob3B0KSB7XG4gICAgICBsYW5ndWFnZU1hbmFnZXIudXBkYXRlTGFuZ3VhZ2Uob3B0LmxhbmcpO1xuICAgIH0gZWxzZSB7XG5cbiAgICAgIGxhbmd1YWdlTWFuYWdlci5yZWZyZXNoKCk7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sYW5ndWFnZS1sb2FkZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnc2VsZWN0I2ZpbHRlci1pdGVtcycpLm11bHRpc2VsZWN0KCdyZWJ1aWxkJyk7XG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbiNzaG93LWhpZGUtbWFwJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ2JvZHknKS50b2dnbGVDbGFzcygnbWFwLXZpZXcnKVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uLmJ0bi5tb3JlLWl0ZW1zJywgKGUsIG9wdCkgPT4ge1xuICAgICQoJyNlbWJlZC1hcmVhJykudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCAoZSwgb3B0KSA9PiB7XG4gICAgLy91cGRhdGUgZW1iZWQgbGluZVxuICAgIHZhciBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHQpKTtcbiAgICBkZWxldGUgY29weVsnbG5nJ107XG4gICAgZGVsZXRlIGNvcHlbJ2xhdCddO1xuICAgIGRlbGV0ZSBjb3B5Wydib3VuZDEnXTtcbiAgICBkZWxldGUgY29weVsnYm91bmQyJ107XG5cbiAgICAkKCcjZW1iZWQtYXJlYSBpbnB1dFtuYW1lPWVtYmVkXScpLnZhbCgnaHR0cHM6Ly9uZXctbWFwLjM1MC5vcmcjJyArICQucGFyYW0oY29weSkpO1xuICB9KTtcblxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24jem9vbS1vdXQnLCAoZSwgb3B0KSA9PiB7XG5cbiAgICAvLyBtYXBNYW5hZ2VyLnpvb21PdXRPbmNlKCk7XG4gICAgbWFwTWFuYWdlci56b29tVW50aWxIaXQoKTtcbiAgfSk7XG5cblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnI3Nob3ctaGlkZS1saXN0LWNvbnRhaW5lcicsIChlLCBvcHQpID0+IHtcbiAgICAkKCdib2R5JykudG9nZ2xlQ2xhc3MoJ2ZpbHRlci1jb2xsYXBzZWQnKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHsgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCkgfSwgNjAwKVxuICB9KTtcblxuICAkKHdpbmRvdykub24oXCJyZXNpemVcIiwgKGUpID0+IHtcbiAgICBtYXBNYW5hZ2VyLnJlZnJlc2hNYXAoKTtcbiAgfSk7XG5cbiAgLyoqXG4gIEZpbHRlciBDaGFuZ2VzXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgXCIuc2VhcmNoLWJ1dHRvbiBidXR0b25cIiwgKGUpID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcihcInNlYXJjaC5mb3JjZS1zZWFyY2gtbG9jYXRpb25cIik7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbihcImtleXVwXCIsIFwiaW5wdXRbbmFtZT0nbG9jJ11cIiwgKGUpID0+IHtcbiAgICBpZiAoZS5rZXlDb2RlID09IDEzKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCdzZWFyY2guZm9yY2Utc2VhcmNoLWxvY2F0aW9uJyk7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignc2VhcmNoLmZvcmNlLXNlYXJjaC1sb2NhdGlvbicsICgpID0+IHtcbiAgICBsZXQgX3F1ZXJ5ID0gJChcImlucHV0W25hbWU9J2xvYyddXCIpLnZhbCgpO1xuICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuZm9yY2VTZWFyY2goX3F1ZXJ5KTtcbiAgICAvLyBTZWFyY2ggZ29vZ2xlIGFuZCBnZXQgdGhlIGZpcnN0IHJlc3VsdC4uLiBhdXRvY29tcGxldGU/XG4gIH0pO1xuXG4gICQod2luZG93KS5vbihcImhhc2hjaGFuZ2VcIiwgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgIGlmIChoYXNoLmxlbmd0aCA9PSAwKSByZXR1cm47XG4gICAgY29uc3QgcGFyYW1ldGVycyA9ICQuZGVwYXJhbShoYXNoLnN1YnN0cmluZygxKSk7XG4gICAgY29uc3Qgb2xkVVJMID0gZXZlbnQub3JpZ2luYWxFdmVudC5vbGRVUkw7XG4gICAgY29uc3Qgb2xkSGFzaCA9ICQuZGVwYXJhbShvbGRVUkwuc3Vic3RyaW5nKG9sZFVSTC5zZWFyY2goXCIjXCIpKzEpKTtcblxuICAgIC8vICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXInLCBwYXJhbWV0ZXJzKTtcbiAgICAvLyAvLyBTbyB0aGF0IGNoYW5nZSBpbiBmaWx0ZXJzIHdpbGwgbm90IHVwZGF0ZSB0aGlzXG4gICAgLy8gaWYgKG9sZEhhc2guYm91bmQxICE9PSBwYXJhbWV0ZXJzLmJvdW5kMSB8fCBvbGRIYXNoLmJvdW5kMiAhPT0gcGFyYW1ldGVycy5ib3VuZDIpIHtcbiAgICAvLyAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXInLCBwYXJhbWV0ZXJzKTtcbiAgICAvLyB9XG5cbiAgICBpZiAob2xkSGFzaC5sb2MgIT09IHBhcmFtZXRlcnMubG9jKSB7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG5cbiAgICAvLyBDaGFuZ2UgaXRlbXNcbiAgICBpZiAob2xkSGFzaC5sYW5nICE9PSBwYXJhbWV0ZXJzLmxhbmcpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgfVxuICB9KVxuXG4gIC8vIDQuIGZpbHRlciBvdXQgaXRlbXMgaW4gYWN0aXZpdHktYXJlYVxuXG4gIC8vIDUuIGdldCBtYXAgZWxlbWVudHNcblxuICAvLyA2LiBnZXQgR3JvdXAgZGF0YVxuXG4gIC8vIDcuIHByZXNlbnQgZ3JvdXAgZWxlbWVudHNcblxuICAkLndoZW4oKCk9Pnt9KVxuICAgIC50aGVuKCgpID0+e1xuICAgICAgcmV0dXJuIGxhbmd1YWdlTWFuYWdlci5pbml0aWFsaXplKGluaXRQYXJhbXNbJ2xhbmcnXSB8fCAnZW4nKTtcbiAgICB9KVxuICAgIC5kb25lKChkYXRhKSA9PiB7fSlcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICAkLmFqYXgoe1xuICAgICAgICAgIHVybDogJ2h0dHBzOi8vbmV3LW1hcC4zNTAub3JnL291dHB1dC8zNTBvcmctd2l0aC1hbm5vdGF0aW9uLmpzLmd6JywgLy8nfCoqREFUQV9TT1VSQ0UqKnwnLFxuICAgICAgICAgIC8vIHVybDogJy9kYXRhL3Rlc3QuanMnLCAvLyd8KipEQVRBX1NPVVJDRSoqfCcsXG4gICAgICAgICAgZGF0YVR5cGU6ICdzY3JpcHQnLFxuICAgICAgICAgIGNhY2hlOiB0cnVlLFxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICAvLyB3aW5kb3cuRVZFTlRTX0RBVEEgPSBkYXRhO1xuICAgICAgICAgICAgLy9KdW5lIDE0LCAyMDE4IOKAkyBDaGFuZ2VzXG4gICAgICAgICAgICBpZih3aW5kb3cucXVlcmllcy5ncm91cCkge1xuICAgICAgICAgICAgICB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YSA9IHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhLmZpbHRlcigoaSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBpLmNhbXBhaWduID09IHdpbmRvdy5xdWVyaWVzLmdyb3VwXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL0xvYWQgZ3JvdXBzXG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxvYWQtZ3JvdXBzJywgeyBncm91cHM6IHdpbmRvdy5FVkVOVFNfREFUQS5ncm91cHMgfSk7XG5cblxuICAgICAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuXG4gICAgICAgICAgICB3aW5kb3cuRVZFTlRTX0RBVEEuZGF0YS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgIGl0ZW1bJ2V2ZW50X3R5cGUnXSA9IGl0ZW0uZXZlbnRfdHlwZSAhPT0gJ2dyb3VwJyA/ICdldmVudHMnIDogaXRlbS5ldmVudF90eXBlOyAvLyFpdGVtLmV2ZW50X3R5cGUgPyAnRXZlbnQnIDogaXRlbS5ldmVudF90eXBlO1xuXG4gICAgICAgICAgICAgIGlmIChpdGVtLnN0YXJ0X2RhdGV0aW1lICYmICFpdGVtLnN0YXJ0X2RhdGV0aW1lLm1hdGNoKC9aJC8pKSB7XG4gICAgICAgICAgICAgICAgaXRlbS5zdGFydF9kYXRldGltZSA9IGl0ZW0uc3RhcnRfZGF0ZXRpbWUgKyBcIlpcIjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgIC8vICAgcmV0dXJuIG5ldyBEYXRlKGEuc3RhcnRfZGF0ZXRpbWUpIC0gbmV3IERhdGUoYi5zdGFydF9kYXRldGltZSk7XG4gICAgICAgICAgICAvLyB9KVxuXG5cbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC11cGRhdGUnLCB7IHBhcmFtczogcGFyYW1ldGVycyB9KTtcbiAgICAgICAgICAgIC8vICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1wbG90Jywge1xuICAgICAgICAgICAgICAgIGRhdGE6IHdpbmRvdy5FVkVOVFNfREFUQS5kYXRhLFxuICAgICAgICAgICAgICAgIHBhcmFtczogcGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgICBncm91cHM6IHdpbmRvdy5FVkVOVFNfREFUQS5ncm91cHMucmVkdWNlKChkaWN0LCBpdGVtKT0+eyBkaWN0W2l0ZW0uc3VwZXJncm91cF0gPSBpdGVtOyByZXR1cm4gZGljdDsgfSwge30pXG4gICAgICAgICAgICB9KTtcbiAgICAgIC8vIH0pO1xuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgIC8vVE9ETzogTWFrZSB0aGUgZ2VvanNvbiBjb252ZXJzaW9uIGhhcHBlbiBvbiB0aGUgYmFja2VuZFxuXG4gICAgICAgICAgICAvL1JlZnJlc2ggdGhpbmdzXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgbGV0IHAgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuXG4gICAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHApO1xuICAgICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCBwKTtcblxuICAgICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyJywgcCk7XG5cbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG5cblxufSkoalF1ZXJ5KTtcbiJdfQ==
