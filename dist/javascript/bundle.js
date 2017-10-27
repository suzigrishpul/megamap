'use strict';

// Global
window.eventTypeFilters = [
// {
//   name: 'Campaign Office',
//   id: 'campaign-office',
//   onItem: "<img style='width: 14px; height: 14px;' src='/img/icon/star.png' />",
//   offItem: "<img style='width: 14px; height: 14px;' src='/img/icon/star-gray.png' />"
// }
{
  name: 'Action',
  id: 'action'
}, {
  name: 'Group',
  id: 'group'
}];
'use strict';

//Create an event node
var Event = function ($) {
  return function (properties) {

    this.properties = properties;

    this.blip = null;
    // // this.title = properties.field_65;
    // this.url = properties.field_68_raw.url;
    // this.address = properties.field_64;
    // this.listing = null;
    this.className = properties.event_type.replace(/[^\w]/ig, "-").toLowerCase();

    // if (properties.url) {
    //   properties.url = properties.facebook ? properties.facebook : (
    //                         properties.twitter ? properties.twitter : null
    //                    )
    //   if (!properties.url) {
    //     return null;
    //   }
    // }

    this.props = {};
    this.props.title = properties.title;
    this.props.url = properties.url; //properties.url.match(/^@/g) ? `http://twitter.com/${properties.url}` : properties.url;
    this.props.start_datetime = properties.start_time;
    this.props.address = properties.venue;
    this.props.supergroup = properties.supergroup;
    this.props.start_time = moment(properties.start_time, 'YYYY-MM-DD HH:mm:ss')._d;

    // Remove the timezone issue from
    this.props.start_time = new Date(this.props.start_time.valueOf());
    this.props.group = properties.group;
    this.props.LatLng = [parseFloat(properties.lat), parseFloat(properties.lng)];
    this.props.event_type = properties.event_type;
    this.props.lat = properties.lat;
    this.props.lng = properties.lng;
    this.props.filters = properties.filters;

    this.props.social = {
      facebook: properties.facebook,
      email: properties.email,
      phone: properties.phone,
      twitter: properties.twitter
    };

    this.render = function (distance, zipcode) {

      var that = this;

      // var endtime = that.endTime ? moment(that.endTime).format("h:mma") : null;

      if (this.props.event_type === 'Group') {
        return that.render_group(distance, zipcode);
      } else {
        return that.render_event(distance, zipcode);
      }
    };

    this.render_group = function (distance, zipcode) {
      var that = this;

      var lat = that.props.lat;
      var lon = that.props.lng;

      var social_html = '';

      if (that.props.social) {
        if (that.props.social.facebook !== '') {
          social_html += '<a href=\'' + that.props.social.facebook + '\' target=\'_blank\'><img src=\'/img/icon/facebook.png\' /></a>';
        }
        if (that.props.social.twitter !== '') {
          social_html += '<a href=\'' + that.props.social.twitter + '\' target=\'_blank\'><img src=\'/img/icon/twitter.png\' /></a>';
        }
        if (that.props.social.email !== '') {
          social_html += '<a href=\'mailto:' + that.props.social.email + '\' ><img src=\'/img/icon/mailchimp.png\' /></a>';
        }
        if (that.props.social.phone !== '') {
          social_html += '&nbsp;<img src=\'/img/icon/phone.png\' /><span>' + that.props.social.phone + '</span>';
        }
      }

      var new_window = true;
      if (that.props.url.match(/^mailto/g)) {
        new_window = false;
      }

      var rendered = $("<div class=montserrat/>").addClass('event-item ' + that.className).html('\n            <div class="event-item lato ' + that.className + '" lat="' + lat + '" lon="' + lon + '">\n              <h5 class="time-info">\n                <span class="time-info-dist">' + (distance ? distance + "mi&nbsp;&nbsp;" : "") + '</span>\n              </h5>\n              <h3>\n                <a ' + (new_window ? 'target="_blank"' : '') + ' href="' + that.props.url + '">' + that.props.title + '</a>\n              </h3>\n              <span class="label-icon"></span>\n              <h5 class="event-type">' + that.props.event_type + '</h5>\n              <div class=\'event-social\'>\n                ' + social_html + '\n              </div>\n            </div>\n            ');

      return rendered.html();
    };

    this.render_event = function (distance, zipcode) {
      var that = this;

      var datetime = moment(that.props.start_time).format("MMM DD (ddd) h:mma");
      var lat = that.props.lat;
      var lon = that.props.lng;

      var rendered = $("<div class=montserrat/>").addClass('event-item ' + that.className).html('\n            <div class="event-item lato ' + that.className + '" lat="' + lat + '" lon="' + lon + '">\n              <h5 class="time-info">\n                <span class="time-info-dist">' + (distance ? distance + "mi&nbsp;&nbsp;" : "") + '</span>' + datetime + '\n              </h5>\n              <h3>\n                <a target="_blank" href="' + that.props.url + '">' + that.props.title + '</a>\n              </h3>\n              <span class="label-icon"></span>\n              <h5 class="event-type">' + that.props.event_type + '</h5>\n              <p>' + that.props.address + '</p>\n              <div>\n                <a class="rsvp-link" href="' + that.props.url + '" target="_blank">RSVP</a>\n              </div>\n            </div>\n            ');

      return rendered.html();
    };
  };
}(jQuery); //End of events
"use strict";

/****
 *  MapManager proper
 */
var MapManager = function ($, d3, leaflet) {
  return function (eventData, campaignOffices, zipcodes, options) {
    var allFilters = window.eventTypeFilters.map(function (i) {
      return i.id;
    });

    var popup = L.popup();
    var options = options;
    var zipcodes = zipcodes.reduce(function (zips, item) {
      zips[item.zip] = item;return zips;
    }, {});

    var current_filters = [],
        current_zipcode = "",
        current_distance = "",
        current_sort = "";

    var originalEventList = eventData.map(function (d) {
      return new Event(d);
    });
    var eventsList = originalEventList.slice(0);

    // var officeList = campaignOffices.map(function(d) { return new CampaignOffices(d); });

    // var mapboxTiles = leaflet.tileLayer('http://{s}.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + leaflet.mapbox.accessToken, { attribution: '<a href="http://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'});

    var mapboxTiles = leaflet.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
    });

    // var mapboxTiles = leaflet.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    //   maxZoom: 18,
    //   attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
    // });

    var CAMPAIGN_OFFICE_ICON = L.icon({
      iconUrl: '//d2bq2yf31lju3q.cloudfront.net/img/icon/star.png',
      iconSize: [17, 14] });
    var GOTV_CENTER_ICON = L.icon({
      iconUrl: '//d2bq2yf31lju3q.cloudfront.net/img/icon/gotv-star.png',
      iconSize: [13, 10] });
    var defaultCoord = options && options.defaultCoord ? options.defaultCoord : { center: [23.4892774, -31.0004934], zoom: 3 };

    var centralMap = new leaflet.Map("map-container", window.customMapCoord ? window.customMapCoord : defaultCoord).addLayer(mapboxTiles);
    if (centralMap) {}

    var overlays = L.layerGroup().addTo(centralMap);
    var offices = L.layerGroup().addTo(centralMap);
    var gotvCenter = L.layerGroup().addTo(centralMap);

    var campaignOfficeLayer = L.layerGroup().addTo(centralMap);

    //initialize map
    var filteredEvents = [];
    var module = {};

    var _popupEvents = function _popupEvents(event) {
      var target = event.target._latlng;

      var filtered = eventsList.filter(function (d) {

        return target.lat == d.props.LatLng[0] && target.lng == d.props.LatLng[1] && (!current_filters || current_filters.length == 0 || $(d.properties.filters).not(current_filters).length != d.properties.filters.length);
      }).sort(function (a, b) {
        return a.props.start_time - b.props.start_time;
      });

      var div = $("<div />").append(filtered.length > 1 ? "<h3 class='sched-count'>" + filtered.length + " Results</h3>" : "").append($("<div class='popup-list-container'/>").append($("<ul class='popup-list'>").append(filtered.map(function (d) {
        return $("<li class=montserrat/>").addClass(d.isFull ? "is-full" : "not-full").addClass(d.visible ? "is-visible" : "not-visible").append(d.render());
      }))));

      setTimeout(function () {
        L.popup().setLatLng(event.target._latlng).setContent(div.html()).openOn(centralMap);
      }, 100);
    };

    /***
     * Initialization
     */
    var initialize = function initialize() {
      var uniqueLocs = eventsList.reduce(function (arr, item) {
        var className = item.properties.filters.join(" ");
        if (arr.indexOf(item.properties.lat + "||" + item.properties.lng + "||" + className) >= 0) {
          return arr;
        } else {
          arr.push(item.properties.lat + "||" + item.properties.lng + "||" + className);
          return arr;
        }
      }, []);

      uniqueLocs = uniqueLocs.map(function (d) {
        var split = d.split("||");
        return { latLng: [parseFloat(split[0]), parseFloat(split[1])],
          className: split[2] };
      });

      uniqueLocs.forEach(function (item) {

        // setTimeout(function() {
        // if (item.className == "campaign-office") {
        //   L.marker(item.latLng, {icon: CAMPAIGN_OFFICE_ICON, className: item.className})
        //     .on('click', function(e) { _popupEvents(e); })
        //     .addTo(offices);
        // } else if (item.className == "gotv-center") {
        //   L.marker(item.latLng, {icon: GOTV_CENTER_ICON, className: item.className})
        //     .on('click', function(e) { _popupEvents(e); })
        //     .addTo(gotvCenter);
        // }else
        // if (item.className.match(/bernie\-event/ig)) {
        //   L.circleMarker(item.latLng, { radius: 12, className: item.className, color: 'white', fillColor: '#F55B5B', opacity: 0.8, fillOpacity: 0.7, weight: 2 })
        //     .on('click', function(e) { _popupEvents(e); })
        //     .addTo(overlays);
        // }
        if (item.className == 'group-meeting') {
          L.circleMarker(item.latLng, { radius: 5, className: item.className, color: 'white', fillColor: '#e71029', opacity: 0.8, fillOpacity: 0.7, weight: 2 }).on('click', function (e) {
            _popupEvents(e);
          }).addTo(overlays);
        } else if (item.className == 'group') {
          L.circleMarker(item.latLng, { radius: 4, className: item.className, color: 'white', fillColor: '#FF3251', opacity: 0.6, fillOpacity: 0.9, weight: 2 }).on('click', function (e) {
            _popupEvents(e);
          }).addTo(overlays);
        } else {
          L.circleMarker(item.latLng, { radius: 5, className: item.className, color: 'white', fillColor: '#FF3251', opacity: 0.8, fillOpacity: 0.7, weight: 2 }).on('click', function (e) {
            _popupEvents(e);
          }).addTo(overlays);
        }
        // }, 10);
      });

      // $(".leaflet-overlay-pane").find(".bernie-event").parent().prependTo('.leaflet-zoom-animated');
    }; // End of initialize

    var toMile = function toMile(meter) {
      return meter * 0.00062137;
    };

    var filterEventsByCoords = function filterEventsByCoords(center, distance, filterTypes) {

      var zipLatLng = leaflet.latLng(center);

      var filtered = eventsList.filter(function (d) {
        var dist = toMile(zipLatLng.distanceTo(d.props.LatLng));
        if (dist < distance) {

          d.distance = Math.round(dist * 10) / 10;

          //If no filter was a match on the current filter
          if (options && options.defaultCoord && !filterTypes) {
            return true;
          }

          if ($(d.props.filters).not(filterTypes).length == d.props.filters.length) {
            return false;
          }

          return true;
        }
        return false;
      });

      return filtered;
    };

    var filterEvents = function filterEvents(zipcode, distance, filterTypes) {
      return filterEventsByCoords([parseFloat(zipcode.lat), parseFloat(zipcode.lon)], distance, filterTypes);
    };

    var sortEvents = function sortEvents(filteredEvents, sortType) {
      switch (sortType) {
        case 'distance':
          filteredEvents = filteredEvents.sort(function (a, b) {
            return a.distance - b.distance;
          });
          break;
        default:
          filteredEvents = filteredEvents.sort(function (a, b) {
            return a.props.start_time - b.props.start_time;
          });
          break;
      }

      // filteredEvents = filteredEvents.sort(function(a, b) {
      //   var aFull = a.isFull();
      //   var bFull = b.isFull();

      //   if (aFull && bFull) { return 0; }
      //   else if (aFull && !bFull) { return 1; }
      //   else if (!aFull && bFull) { return -1; }
      // });
      //sort by fullness;
      //..
      return filteredEvents;
    };

    setTimeout(function () {
      initialize();
    }, 10);

    module._eventsList = eventsList;
    module._zipcodes = zipcodes;
    module._options = options;

    /*
    * Refresh map with new events map
    */
    var _refreshMap = function _refreshMap() {
      overlays.clearLayers();
      initialize();
    };

    module.filterByType = function (type) {
      if ($(filters).not(type).length != 0 || $(type).not(filters).length != 0) {
        current_filters = type;

        //Filter only items in the list
        // eventsList = originalEventList.filter(function(eventItem) {
        //   var unmatch = $(eventItem.properties.filters).not(filters);
        //   return unmatch.length != eventItem.properties.filters.length;
        // });


        // var target = type.map(function(i) { return "." + i }).join(",");
        // $(".leaflet-overlay-pane").find("path:not("+type.map(function(i) { return "." + i }).join(",") + ")")

        var toHide = $(allFilters).not(type);

        if (toHide && toHide.length > 0) {
          toHide = toHide.splice(0, toHide.length);
          $(".leaflet-overlay-pane").find("." + toHide.join(",.")).hide();
        }

        if (type && type.length > 0) {
          $(".leaflet-overlay-pane").find("." + type.join(",.")).show();
          // _refreshMap();
        }

        //Specifically for campaign office
        if (!type) {
          centralMap.removeLayer(offices);
        } else if (type && type.indexOf('campaign-office') < 0) {
          centralMap.removeLayer(offices);
        } else {
          centralMap.addLayer(offices);
        }

        //For gotv-centers
        if (!type) {
          centralMap.removeLayer(gotvCenter);
        } else if (type && type.indexOf('gotv-center') < 0) {
          centralMap.removeLayer(gotvCenter);
        } else {
          centralMap.addLayer(gotvCenter);
        }
      }
      return;
    };

    module.filterByCoords = function (coords, distance, sort, filterTypes) {
      //Remove list
      d3.select("#event-list").selectAll("li").remove();

      var filtered = filterEventsByCoords(coords, parseInt(distance), filterTypes);
      //Sort event
      filtered = sortEvents(filtered, sort, filterTypes);

      //Render event
      var eventList = d3.select("#event-list").selectAll("li").data(filtered, function (d) {
        return d.props.url;
      });

      eventList.enter().append("li").attr("class", function (d) {
        return (d.isFull ? 'is-full' : 'not-full') + " " + (this.visible ? "is-visible" : "not-visible");
      }).classed("lato", true).html(function (d) {
        return d.render(d.distance);
      });

      eventList.exit().remove();

      //add a highlighted marker
      function addhighlightedMarker(lat, lon) {
        var highlightedMarker = new L.circleMarker([lat, lon], { radius: 5, color: '#ea504e', fillColor: '#1462A2', opacity: 0.8, fillOpacity: 0.7, weight: 2 }).addTo(centralMap);
        // event listener to remove highlighted markers
        $(".not-full").mouseout(function () {
          centralMap.removeLayer(highlightedMarker);
        });
      }

      // event listener to get the mouseover
      $(".not-full").mouseover(function () {
        $(this).toggleClass("highlight");
        var cMarkerLat = $(this).children('div').attr('lat');
        var cMarkerLon = $(this).children('div').attr('lon');
        // function call to add highlighted marker
        addhighlightedMarker(cMarkerLat, cMarkerLon);
      });

      //Push all full items to end of list
      $("div#event-list-container ul#event-list li.is-full").appendTo("div#event-list-container ul#event-list");

      //Move campaign offices to

      var officeCount = $("div#event-list-container ul#event-list li .campaign-office").length;
      $("#hide-show-office").attr("data-count", officeCount);
      $("#campaign-off-count").text(officeCount);
      $("section#campaign-offices ul#campaign-office-list *").remove();
      $("div#event-list-container ul#event-list li .campaign-office").parent().appendTo("section#campaign-offices ul#campaign-office-list");
    };

    /***
     * FILTER()  -- When the user submits query, we will look at this.
     */
    module.filter = function (zipcode, distance, sort, filterTypes) {
      //Check type filter

      if (!zipcode || zipcode == "") {
        return;
      };

      //Start if other filters changed
      var targetZipcode = zipcodes[zipcode];

      //Remove list
      d3.select("#event-list").selectAll("li").remove();

      if (targetZipcode == undefined || !targetZipcode) {
        $("#event-list").append("<li class='error lato'>Zipcode does not exist.</li>");
        return;
      }

      //Calibrate map
      var zoom = 4;
      switch (parseInt(distance)) {
        case 5:
          zoom = 12;break;
        case 10:
          zoom = 11;break;
        case 20:
          zoom = 10;break;
        case 50:
          zoom = 9;break;
        case 100:
          zoom = 8;break;
        case 250:
          zoom = 7;break;
        case 500:
          zoom = 5;break;
        case 750:
          zoom = 5;break;
        case 1000:
          zoom = 4;break;
        case 2000:
          zoom = 4;break;
        case 3000:
          zoom = 3;break;
      }
      if (!(targetZipcode.lat && targetZipcode.lat != "")) {
        return;
      }

      if (current_zipcode != zipcode || current_distance != distance) {
        current_zipcode = zipcode;
        current_distance = distance;
        centralMap.setView([parseFloat(targetZipcode.lat), parseFloat(targetZipcode.lon)], zoom);
      }

      var filtered = filterEvents(targetZipcode, parseInt(distance), filterTypes);

      //Sort event
      filtered = sortEvents(filtered, sort, filterTypes);

      //Render event
      var eventList = d3.select("#event-list").selectAll("li").data(filtered, function (d) {
        return d.props.url;
      });

      eventList.enter().append("li").attr("class", function (d) {
        return (d.isFull ? 'is-full' : 'not-full') + " " + (this.visible ? "is-visible" : "not-visible");
      }).classed("lato", true).html(function (d) {
        return d.render(d.distance);
      });

      eventList.exit().remove();

      //add a highlighted marker
      function addhighlightedMarker(lat, lon) {
        var highlightedMarker = new L.circleMarker([lat, lon], { radius: 5, color: '#ea504e', fillColor: '#1462A2', opacity: 0.8, fillOpacity: 0.7, weight: 2 }).addTo(centralMap);
        // event listener to remove highlighted markers
        $(".not-full").mouseout(function () {
          centralMap.removeLayer(highlightedMarker);
        });
      }

      // event listener to get the mouseover
      $(".not-full").mouseover(function () {
        $(this).toggleClass("highlight");
        var cMarkerLat = $(this).children('div').attr('lat');
        var cMarkerLon = $(this).children('div').attr('lon');
        // function call to add highlighted marker
        addhighlightedMarker(cMarkerLat, cMarkerLon);
      });

      //Push all full items to end of list
      $("div#event-list-container ul#event-list li.is-full").appendTo("div#event-list-container ul#event-list");

      //Move campaign offices to

      var officeCount = $("div#event-list-container ul#event-list li .campaign-office").length;
      $("#hide-show-office").attr("data-count", officeCount);
      $("#campaign-off-count").text(officeCount);
      $("section#campaign-offices ul#campaign-office-list *").remove();
      $("div#event-list-container ul#event-list li .campaign-office").parent().appendTo("section#campaign-offices ul#campaign-office-list");
    };

    module.toMapView = function () {
      $("body").removeClass("list-view").addClass("map-view");
      centralMap.invalidateSize();
      centralMap._onResize();
    };
    module.toListView = function () {
      $("body").removeClass("map-view").addClass("list-view");
    };

    module.getMap = function () {
      return centralMap;
    };

    return module;
  };
}(jQuery, d3, L);

var VotingInfoManager = function ($) {
  return function (votingInfo) {
    var votingInfo = votingInfo;
    var module = {};

    function buildRegistrationMessage(state) {
      var $msg = $("<div class='registration-msg'/>").append($("<h3/>").text("Registration deadline: " + moment(new Date(state.registration_deadline)).format("MMM D"))).append($("<p />").html(state.name + " has <strong>" + state.is_open + " " + state.type + "</strong>. " + state.you_must)).append($("<p />").html("Find out where and how to register at <a target='_blank' href='https://vote.berniesanders.com/" + state.state + "'>vote.berniesanders.com</a>"));

      return $msg;
    }

    function buildPrimaryInfo(state) {

      var $msg = $("<div class='registration-msg'/>").append($("<h3/>").text("Primary day: " + moment(new Date(state.voting_day)).format("MMM D"))).append($("<p />").html(state.name + " has <strong>" + state.is_open + " " + state.type + "</strong>. " + state.you_must)).append($("<p />").html("Find out where and how to vote at <a target='_blank' href='https://vote.berniesanders.com/" + state.state + "'>vote.berniesanders.com</a>"));

      return $msg;
    }

    function buildCaucusInfo(state) {
      var $msg = $("<div class='registration-msg'/>").append($("<h3/>").text("Caucus day: " + moment(new Date(state.voting_day)).format("MMM D"))).append($("<p />").html(state.name + " has <strong>" + state.is_open + " " + state.type + "</strong>. " + state.you_must)).append($("<p />").html("Find out where and how to caucus at <a target='_blank' href='https://vote.berniesanders.com/" + state.state + "'>vote.berniesanders.com</a>"));

      return $msg;
    }

    module.getInfo = function (state) {
      var targetState = votingInfo.filter(function (d) {
        return d.state == state;
      })[0]; //return first
      if (!targetState) return null;

      var today = new Date();
      today.setDate(today.getDate() - 1);

      if (today <= new Date(targetState.registration_deadline)) {
        return buildRegistrationMessage(targetState);
      } else if (today <= new Date(targetState.voting_day)) {
        if (targetState.type == "primaries") {
          return buildPrimaryInfo(targetState);
        } else {
          //
          return buildCaucusInfo(targetState);
        }
      } else {
        return null;
      }
    };

    return module;
  };
}(jQuery);

// More events
(function ($) {
  $(document).on("click", function (event, params) {
    $(".event-rsvp-activity").hide();
  });

  $(document).on("click", ".rsvp-link, .event-rsvp-activity", function (event, params) {
    event.stopPropagation();
  });

  //Show email
  $(document).on("show-event-form", function (events, target) {
    var form = $(target).closest(".event-item").find(".event-rsvp-activity");

    // var params =  $.deparam(window.location.hash.substring(1) || "");
    // form.find("input[name=zipcode]").val(params.zipcode ? params.zipcode : Cookies.get('map.bernie.zipcode'));

    form.fadeIn(100);
  });

  $(document).on("submit", "form.event-form", function () {
    var query = $.deparam($(this).serialize());
    var params = $.deparam(window.location.hash.substring(1) || "");
    query['zipcode'] = params['zipcode'] || query['zipcode'];

    var $error = $(this).find(".event-error");
    var $container = $(this).closest(".event-rsvp-activity");

    if (query['has_shift'] == 'true' && (!query['shift_id'] || query['shift_id'].length == 0)) {
      $error.text("You must pick a shift").show();
      return false;
    }

    var shifts = null;
    var guests = 0;
    if (query['shift_id']) {
      shifts = query['shift_id'].join();
    }

    if (!query['phone'] || query['phone'] == '') {
      $error.text("Phone number is required").show();
      return false;
    }

    if (!query['email'] || query['email'] == '') {
      $error.text("Email is required").show();
      return false;
    }

    if (!query['email'].toUpperCase().match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/)) {
      $error.text("Please input valid email").show();
      return false;
    }

    // if (!query['name'] || query['name'] == "") {
    //   $error.text("Please include your name").show();
    //   return false;
    // }

    $(this).find(".event-error").hide();
    var $this = $(this);
    $.ajax({
      type: 'POST',
      url: 'https://organize.berniesanders.com/events/add-rsvp',
      // url: 'https://bernie-ground-control-staging.herokuapp.com/events/add-rsvp',
      crossDomain: true,
      dataType: 'json',
      data: {
        // name: query['name'],
        phone: query['phone'],
        email: query['email'],
        zip: query['zipcode'],
        shift_ids: shifts,
        event_id_obfuscated: query['id_obfuscated']
      },
      success: function success(data) {
        Cookies.set('map.bernie.zipcode', query['zipcode'], { expires: 7 });
        Cookies.set('map.bernie.email', query['email'], { expires: 7 });
        Cookies.set('map.bernie.name', query['name'], { expires: 7 });

        if (query['phone'] != '') {
          Cookies.set('map.bernie.phone', query['phone'], { expires: 7 });
        }

        //Storing the events joined
        var events_joined = JSON.parse(Cookies.get('map.bernie.eventsJoined.' + query['email']) || "[]") || [];

        events_joined.push(query['id_obfuscated']);
        Cookies.set('map.bernie.eventsJoined.' + query['email'], events_joined, { expires: 7 });

        $this.closest("li").attr("data-attending", true);

        $this.html("<h4 style='border-bottom: none'>RSVP Successful! Thank you for joining to this event!</h4>");
        $container.delay(1000).fadeOut('fast');
      }
    });

    return false;
  });
})(jQuery);
'use strict';

(function ($, d3) {
  var date = new Date();
  $("#loading-icon").show();

  $.ajax({
    url: 'https://dnb6leangx6dc.cloudfront.net/output/350org.js.gz', //'|**DATA_SOURCE**|',
    dataType: 'script',
    cache: true, // otherwise will get fresh copy every page load
    success: function success(data) {
      d3.csv('//d1y0otadi3knf6.cloudfront.net/d/us_postal_codes.gz', function (zipcodes) {
        $("#loading-icon").hide();
        //Clean data
        window.EVENTS_DATA.forEach(function (d) {
          d.filters = [];
          //Set filter info
          switch (d.event_type) {
            case "Group":
              d.filters.push('group');
              break;
            case "Action":
              d.filters.push('action');
              break;
            default:
              d.filters.push('other');
              break;
          }

          d.is_official = d.is_official == "1";
          if (d.is_official) {
            d.filters.push("official-event");
          }
        });
        var params = $.deparam(window.location.hash.substring(1));
        var oldDate = new Date();

        /* Extract default lat lon */
        var m = /.*\?c=(.+?),(.+?),(\d+)z#?.*/g.exec(window.location.href);
        if (m && m[1] && m[2] && m[3]) {
          var defaultCoord = {
            center: [parseFloat(m[1]), parseFloat(m[2])],
            zoom: parseInt(m[3])
          };
          window.mapManager = MapManager(window.EVENTS_DATA, campaignOffices, zipcodes, {
            defaultCoord: defaultCoord
          });

          window.mapManager.filterByCoords(defaultCoord.center, 50, params.sort, params.f);
        } else {
          window.mapManager = MapManager(window.EVENTS_DATA, null, zipcodes);
        }

        // Load Connecticut area
        var district_boundary = new L.geoJson(null, {
          clickable: false
        });
        district_boundary.addTo(window.mapManager.getMap());

        /*** TOTALLY OPTIONAL AREA FOR FOCUSED AREAS. EXAMPLE IS CONNETICUT ***/
        /*** TODO: Repalace/Remove this ***/
        // $.ajax({
        //   dataType: "json",
        //   url: "/data/texas.json",
        //   success: function(data) {
        //     $(data.features[0].geometry).each(function(key, data) {
        //       district_boundary
        //         .addData(data)
        //         .setStyle({
        //           fillColor: 'transparent',
        //           color: 'rgb(0, 0, 0)'
        //         });
        //       if (!params.zipcode || params.zipcode === '') {
        //         window.mapManager.getMap()
        //           .fitBounds(district_boundary.getBounds(), { animate: false });
        //       }
        //     });
        //     district_boundary.bringToBack();
        //   }
        // }).error(function() {});

        // if ($("input[name='zipcode']").val() == '' && Cookies.get('map.bernie.zipcode') && window.location.hash == '') {
        //   $("input[name='zipcode']").val(Cookies.get('map.bernie.zipcode'));
        //   window.location.hash = $("#filter-form").serialize();
        // } else {
        $(window).trigger("hashchange");
        // }
      });
    }
  });

  /** initial loading before activating listeners...*/
  var params = $.deparam(window.location.hash.substring(1));
  if (params.zipcode) {
    $("input[name='zipcode']").val(params.zipcode);
  }

  if (params.distance) {
    $("select[name='distance']").val(params.distance);
  }
  if (params.sort) {
    $("select[name='sort']").val(params.sort);
  }

  /* Prepare filters */
  $("#filter-list").append(window.eventTypeFilters.map(function (d) {
    return $("<li />").append($("<input type='checkbox' class='filter-type' />").attr('name', 'f[]').attr("value", d.id).attr("id", d.id).prop("checked", !params.f ? true : $.inArray(d.id, params.f) >= 0)).append($("<label />").attr('for', d.id).append($("<span />").addClass('filter-on').append(d.onItem ? d.onItem : $("<span>").addClass('circle-button default-on'))).append($("<span />").addClass('filter-off').append(d.offItem ? d.offItem : $("<span>").addClass('circle-button default-off'))).append($("<span>").text(d.name)));
  }));
  /***
   *  define events
   */
  //only numbers
  $("input[name='zipcode']").on('keyup keydown', function (e) {
    if (e.type == 'keydown' && (e.keyCode < 48 || e.keyCode > 57) && e.keyCode != 8 && !(e.keyCode >= 37 || e.keyCode <= 40)) {
      return false;
    }

    if (e.type == 'keyup' && $(this).val().length == 5) {
      if (!(e.keyCode >= 37 && e.keyCode <= 40)) {
        $(this).closest("form#filter-form").submit();
        $("#hidden-button").focus();
      }
    }
  });

  /***
   *  onchange of select
   */
  $("select[name='distance'],select[name='sort']").on('change', function (e) {
    $(this).closest("form#filter-form").submit();
  });

  /**
   * On filter type change
   */
  $(".filter-type").on('change', function (e) {
    $(this).closest("form#filter-form").submit();
  });

  //On submit
  $("form#filter-form").on('submit', function (e) {
    var serial = $(this).serialize();
    window.location.hash = serial;
    e.preventDefault();
    return false;
  });

  $(window).on('hashchange', function (e) {

    var hash = window.location.hash;
    if (hash.length == 0 || hash.substring(1) == 0) {
      $("#loading-icon").hide();
      return false;
    }

    var params = $.deparam(hash.substring(1));

    //Custom feature for specific default lat/lon
    //lat=40.7415479&lon=-73.8239609&zoom=17
    setTimeout(function () {
      $("#loading-icon").show();

      if (window.mapManager._options && window.mapManager._options.defaultCoord && params.zipcode.length != 5) {
        window.mapManager.filterByType(params.f);
        window.mapManager.filterByCoords(window.mapManager._options.defaultCoord.center, params.distance, params.sort, params.f);
      } else {
        window.mapManager.filterByType(params.f);
        window.mapManager.filter(params.zipcode, params.distance, params.sort, params.f);
      }
      $("#loading-icon").hide();
    }, 10);
    // $("#loading-icon").hide();
    if (params.zipcode.length == 5 && $("body").hasClass("initial-view")) {
      $("#events").removeClass("show-type-filter");
      $("body").removeClass("initial-view");
    }
  });

  var pre = $.deparam(window.location.hash.substring(1));
  if ($("body").hasClass("initial-view")) {
    if ($(window).width() >= 600 && (!pre.zipcode || pre && pre.zipcode.length != 5)) {
      $("#events").addClass("show-type-filter");
    }
  }
})(jQuery, d3);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvZXZlbnQtdHlwZXMuanMiLCJjbGFzc2VzL2V2ZW50LmpzIiwiY2xhc3Nlcy9tYXAtbWFuYWdlci5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJ3aW5kb3ciLCJldmVudFR5cGVGaWx0ZXJzIiwibmFtZSIsImlkIiwiRXZlbnQiLCIkIiwicHJvcGVydGllcyIsImJsaXAiLCJjbGFzc05hbWUiLCJldmVudF90eXBlIiwicmVwbGFjZSIsInRvTG93ZXJDYXNlIiwicHJvcHMiLCJ0aXRsZSIsInVybCIsInN0YXJ0X2RhdGV0aW1lIiwic3RhcnRfdGltZSIsImFkZHJlc3MiLCJ2ZW51ZSIsInN1cGVyZ3JvdXAiLCJtb21lbnQiLCJfZCIsIkRhdGUiLCJ2YWx1ZU9mIiwiZ3JvdXAiLCJMYXRMbmciLCJwYXJzZUZsb2F0IiwibGF0IiwibG5nIiwiZmlsdGVycyIsInNvY2lhbCIsImZhY2Vib29rIiwiZW1haWwiLCJwaG9uZSIsInR3aXR0ZXIiLCJyZW5kZXIiLCJkaXN0YW5jZSIsInppcGNvZGUiLCJ0aGF0IiwicmVuZGVyX2dyb3VwIiwicmVuZGVyX2V2ZW50IiwibG9uIiwic29jaWFsX2h0bWwiLCJuZXdfd2luZG93IiwibWF0Y2giLCJyZW5kZXJlZCIsImFkZENsYXNzIiwiaHRtbCIsImRhdGV0aW1lIiwiZm9ybWF0IiwialF1ZXJ5IiwiTWFwTWFuYWdlciIsImQzIiwibGVhZmxldCIsImV2ZW50RGF0YSIsImNhbXBhaWduT2ZmaWNlcyIsInppcGNvZGVzIiwib3B0aW9ucyIsImFsbEZpbHRlcnMiLCJtYXAiLCJpIiwicG9wdXAiLCJMIiwicmVkdWNlIiwiemlwcyIsIml0ZW0iLCJ6aXAiLCJjdXJyZW50X2ZpbHRlcnMiLCJjdXJyZW50X3ppcGNvZGUiLCJjdXJyZW50X2Rpc3RhbmNlIiwiY3VycmVudF9zb3J0Iiwib3JpZ2luYWxFdmVudExpc3QiLCJkIiwiZXZlbnRzTGlzdCIsInNsaWNlIiwibWFwYm94VGlsZXMiLCJ0aWxlTGF5ZXIiLCJtYXhab29tIiwiYXR0cmlidXRpb24iLCJDQU1QQUlHTl9PRkZJQ0VfSUNPTiIsImljb24iLCJpY29uVXJsIiwiaWNvblNpemUiLCJHT1RWX0NFTlRFUl9JQ09OIiwiZGVmYXVsdENvb3JkIiwiY2VudGVyIiwiem9vbSIsImNlbnRyYWxNYXAiLCJNYXAiLCJjdXN0b21NYXBDb29yZCIsImFkZExheWVyIiwib3ZlcmxheXMiLCJsYXllckdyb3VwIiwiYWRkVG8iLCJvZmZpY2VzIiwiZ290dkNlbnRlciIsImNhbXBhaWduT2ZmaWNlTGF5ZXIiLCJmaWx0ZXJlZEV2ZW50cyIsIm1vZHVsZSIsIl9wb3B1cEV2ZW50cyIsImV2ZW50IiwidGFyZ2V0IiwiX2xhdGxuZyIsImZpbHRlcmVkIiwiZmlsdGVyIiwibGVuZ3RoIiwibm90Iiwic29ydCIsImEiLCJiIiwiZGl2IiwiYXBwZW5kIiwiaXNGdWxsIiwidmlzaWJsZSIsInNldFRpbWVvdXQiLCJzZXRMYXRMbmciLCJzZXRDb250ZW50Iiwib3Blbk9uIiwiaW5pdGlhbGl6ZSIsInVuaXF1ZUxvY3MiLCJhcnIiLCJqb2luIiwiaW5kZXhPZiIsInB1c2giLCJzcGxpdCIsImxhdExuZyIsImZvckVhY2giLCJjaXJjbGVNYXJrZXIiLCJyYWRpdXMiLCJjb2xvciIsImZpbGxDb2xvciIsIm9wYWNpdHkiLCJmaWxsT3BhY2l0eSIsIndlaWdodCIsIm9uIiwiZSIsInRvTWlsZSIsIm1ldGVyIiwiZmlsdGVyRXZlbnRzQnlDb29yZHMiLCJmaWx0ZXJUeXBlcyIsInppcExhdExuZyIsImRpc3QiLCJkaXN0YW5jZVRvIiwiTWF0aCIsInJvdW5kIiwiZmlsdGVyRXZlbnRzIiwic29ydEV2ZW50cyIsInNvcnRUeXBlIiwiX2V2ZW50c0xpc3QiLCJfemlwY29kZXMiLCJfb3B0aW9ucyIsIl9yZWZyZXNoTWFwIiwiY2xlYXJMYXllcnMiLCJmaWx0ZXJCeVR5cGUiLCJ0eXBlIiwidG9IaWRlIiwic3BsaWNlIiwiZmluZCIsImhpZGUiLCJzaG93IiwicmVtb3ZlTGF5ZXIiLCJmaWx0ZXJCeUNvb3JkcyIsImNvb3JkcyIsInNlbGVjdCIsInNlbGVjdEFsbCIsInJlbW92ZSIsInBhcnNlSW50IiwiZXZlbnRMaXN0IiwiZGF0YSIsImVudGVyIiwiYXR0ciIsImNsYXNzZWQiLCJleGl0IiwiYWRkaGlnaGxpZ2h0ZWRNYXJrZXIiLCJoaWdobGlnaHRlZE1hcmtlciIsIm1vdXNlb3V0IiwibW91c2VvdmVyIiwidG9nZ2xlQ2xhc3MiLCJjTWFya2VyTGF0IiwiY2hpbGRyZW4iLCJjTWFya2VyTG9uIiwiYXBwZW5kVG8iLCJvZmZpY2VDb3VudCIsInRleHQiLCJwYXJlbnQiLCJ0YXJnZXRaaXBjb2RlIiwidW5kZWZpbmVkIiwic2V0VmlldyIsInRvTWFwVmlldyIsInJlbW92ZUNsYXNzIiwiaW52YWxpZGF0ZVNpemUiLCJfb25SZXNpemUiLCJ0b0xpc3RWaWV3IiwiZ2V0TWFwIiwiVm90aW5nSW5mb01hbmFnZXIiLCJ2b3RpbmdJbmZvIiwiYnVpbGRSZWdpc3RyYXRpb25NZXNzYWdlIiwic3RhdGUiLCIkbXNnIiwicmVnaXN0cmF0aW9uX2RlYWRsaW5lIiwiaXNfb3BlbiIsInlvdV9tdXN0IiwiYnVpbGRQcmltYXJ5SW5mbyIsInZvdGluZ19kYXkiLCJidWlsZENhdWN1c0luZm8iLCJnZXRJbmZvIiwidGFyZ2V0U3RhdGUiLCJ0b2RheSIsInNldERhdGUiLCJnZXREYXRlIiwiZG9jdW1lbnQiLCJwYXJhbXMiLCJzdG9wUHJvcGFnYXRpb24iLCJldmVudHMiLCJmb3JtIiwiY2xvc2VzdCIsImZhZGVJbiIsInF1ZXJ5IiwiZGVwYXJhbSIsInNlcmlhbGl6ZSIsImxvY2F0aW9uIiwiaGFzaCIsInN1YnN0cmluZyIsIiRlcnJvciIsIiRjb250YWluZXIiLCJzaGlmdHMiLCJndWVzdHMiLCJ0b1VwcGVyQ2FzZSIsIiR0aGlzIiwiYWpheCIsImNyb3NzRG9tYWluIiwiZGF0YVR5cGUiLCJzaGlmdF9pZHMiLCJldmVudF9pZF9vYmZ1c2NhdGVkIiwic3VjY2VzcyIsIkNvb2tpZXMiLCJzZXQiLCJleHBpcmVzIiwiZXZlbnRzX2pvaW5lZCIsIkpTT04iLCJwYXJzZSIsImdldCIsImRlbGF5IiwiZmFkZU91dCIsImRhdGUiLCJjYWNoZSIsImNzdiIsIkVWRU5UU19EQVRBIiwiaXNfb2ZmaWNpYWwiLCJvbGREYXRlIiwibSIsImV4ZWMiLCJocmVmIiwibWFwTWFuYWdlciIsImYiLCJkaXN0cmljdF9ib3VuZGFyeSIsImdlb0pzb24iLCJjbGlja2FibGUiLCJ0cmlnZ2VyIiwidmFsIiwicHJvcCIsImluQXJyYXkiLCJvbkl0ZW0iLCJvZmZJdGVtIiwia2V5Q29kZSIsInN1Ym1pdCIsImZvY3VzIiwic2VyaWFsIiwicHJldmVudERlZmF1bHQiLCJoYXNDbGFzcyIsInByZSIsIndpZHRoIl0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0FBLE9BQU9DLGdCQUFQLEdBQTBCO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0VDLFFBQU0sUUFEUjtBQUVFQyxNQUFJO0FBRk4sQ0FQd0IsRUFXeEI7QUFDRUQsUUFBTSxPQURSO0FBRUVDLE1BQUk7QUFGTixDQVh3QixDQUExQjs7O0FDREE7QUFDQSxJQUFJQyxRQUFRLFVBQVVDLENBQVYsRUFBYTtBQUN2QixTQUFPLFVBQVVDLFVBQVYsRUFBc0I7O0FBRTNCLFNBQUtBLFVBQUwsR0FBa0JBLFVBQWxCOztBQUVBLFNBQUtDLElBQUwsR0FBWSxJQUFaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFLQyxTQUFMLEdBQWlCRixXQUFXRyxVQUFYLENBQXNCQyxPQUF0QixDQUE4QixTQUE5QixFQUF5QyxHQUF6QyxFQUE4Q0MsV0FBOUMsRUFBakI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFLQyxLQUFMLEdBQWEsRUFBYjtBQUNBLFNBQUtBLEtBQUwsQ0FBV0MsS0FBWCxHQUFtQlAsV0FBV08sS0FBOUI7QUFDQSxTQUFLRCxLQUFMLENBQVdFLEdBQVgsR0FBaUJSLFdBQVdRLEdBQTVCLENBdEIyQixDQXNCTTtB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SyxPQUFPeEcsSUFBakUsRUFBdUV3RyxPQUFPMkMsQ0FBOUU7QUFDRDtBQUNEelAsUUFBRSxlQUFGLEVBQW1CeUosSUFBbkI7QUFFRCxLQVpELEVBWUcsRUFaSDtBQWFBO0FBQ0EsUUFBSXFELE9BQU85SyxPQUFQLENBQWVvRSxNQUFmLElBQXlCLENBQXpCLElBQThCcEcsRUFBRSxNQUFGLEVBQVV3USxRQUFWLENBQW1CLGNBQW5CLENBQWxDLEVBQXNFO0FBQ3BFeFEsUUFBRSxTQUFGLEVBQWF3TCxXQUFiLENBQXlCLGtCQUF6QjtBQUNBeEwsUUFBRSxNQUFGLEVBQVV3TCxXQUFWLENBQXNCLGNBQXRCO0FBQ0Q7QUFDRixHQTlCRDs7QUFnQ0EsTUFBSWlGLE1BQU16USxFQUFFcU4sT0FBRixDQUFVMU4sT0FBTzROLFFBQVAsQ0FBZ0JDLElBQWhCLENBQXFCQyxTQUFyQixDQUErQixDQUEvQixDQUFWLENBQVY7QUFDQSxNQUFJek4sRUFBRSxNQUFGLEVBQVV3USxRQUFWLENBQW1CLGNBQW5CLENBQUosRUFBd0M7QUFDdEMsUUFBSXhRLEVBQUVMLE1BQUYsRUFBVStRLEtBQVYsTUFBcUIsR0FBckIsS0FBNkIsQ0FBQ0QsSUFBSXpPLE9BQUwsSUFBZ0J5TyxPQUFPQSxJQUFJek8sT0FBSixDQUFZb0UsTUFBWixJQUFzQixDQUExRSxDQUFKLEVBQWtGO0FBQ2hGcEcsUUFBRSxTQUFGLEVBQWF5QyxRQUFiLENBQXNCLGtCQUF0QjtBQUNEO0FBQ0Y7QUFHRixDQTFNRCxFQTBNR0ksTUExTUgsRUEwTVdFLEVBMU1YIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEdsb2JhbFxud2luZG93LmV2ZW50VHlwZUZpbHRlcnMgPSBbXG4gIC8vIHtcbiAgLy8gICBuYW1lOiAnQ2FtcGFpZ24gT2ZmaWNlJyxcbiAgLy8gICBpZDogJ2NhbXBhaWduLW9mZmljZScsXG4gIC8vICAgb25JdGVtOiBcIjxpbWcgc3R5bGU9J3dpZHRoOiAxNHB4OyBoZWlnaHQ6IDE0cHg7JyBzcmM9Jy9pbWcvaWNvbi9zdGFyLnBuZycgLz5cIixcbiAgLy8gICBvZmZJdGVtOiBcIjxpbWcgc3R5bGU9J3dpZHRoOiAxNHB4OyBoZWlnaHQ6IDE0cHg7JyBzcmM9Jy9pbWcvaWNvbi9zdGFyLWdyYXkucG5nJyAvPlwiXG4gIC8vIH1cbiAge1xuICAgIG5hbWU6ICdBY3Rpb24nLFxuICAgIGlkOiAnYWN0aW9uJ1xuICB9LFxuICB7XG4gICAgbmFtZTogJ0dyb3VwJyxcbiAgICBpZDogJ2dyb3VwJ1xuICB9XG5dO1xuIiwiLy9DcmVhdGUgYW4gZXZlbnQgbm9kZVxudmFyIEV2ZW50ID0gZnVuY3Rpb24gKCQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XG5cbiAgICB0aGlzLnByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzO1xuXG4gICAgdGhpcy5ibGlwID0gbnVsbDtcbiAgICAvLyAvLyB0aGlzLnRpdGxlID0gcHJvcGVydGllcy5maWVsZF82NTtcbiAgICAvLyB0aGlzLnVybCA9IHByb3BlcnRpZXMuZmllbGRfNjhfcmF3LnVybDtcbiAgICAvLyB0aGlzLmFkZHJlc3MgPSBwcm9wZXJ0aWVzLmZpZWxkXzY0O1xuICAgIC8vIHRoaXMubGlzdGluZyA9IG51bGw7XG4gICAgdGhpcy5jbGFzc05hbWUgPSBwcm9wZXJ0aWVzLmV2ZW50X3R5cGUucmVwbGFjZSgvW15cXHddL2lnLCBcIi1cIikudG9Mb3dlckNhc2UoKTtcblxuICAgIC8vIGlmIChwcm9wZXJ0aWVzLnVybCkge1xuICAgIC8vICAgcHJvcGVydGllcy51cmwgPSBwcm9wZXJ0aWVzLmZhY2Vib29rID8gcHJvcGVydGllcy5mYWNlYm9vayA6IChcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLnR3aXR0ZXIgPyBwcm9wZXJ0aWVzLnR3aXR0ZXIgOiBudWxsXG4gICAgLy8gICAgICAgICAgICAgICAgICAgIClcbiAgICAvLyAgIGlmICghcHJvcGVydGllcy51cmwpIHtcbiAgICAvLyAgICAgcmV0dXJuIG51bGw7XG4gICAgLy8gICB9XG4gICAgLy8gfVxuXG4gICAgdGhpcy5wcm9wcyA9IHt9O1xuICAgIHRoaXMucHJvcHMudGl0bGUgPSBwcm9wZXJ0aWVzLnRpdGxlO1xuICAgIHRoaXMucHJvcHMudXJsID0gcHJvcGVydGllcy51cmw7IC8vcHJvcGVydGllcy51cmwubWF0Y2goL15AL2cpID8gYGh0dHA6Ly90d2l0dGVyLmNvbS8ke3Byb3BlcnRpZXMudXJsfWAgOiBwcm9wZXJ0aWVzLnVybDtcbiAgICB0aGlzLnByb3BzLnN0YXJ0X2RhdGV0aW1lID0gcHJvcGVydGllcy5zdGFydF90aW1lO1xuICAgIHRoaXMucHJvcHMuYWRkcmVzcyA9IHByb3BlcnRpZXMudmVudWU7XG4gICAgdGhpcy5wcm9wcy5zdXBlcmdyb3VwID0gcHJvcGVydGllcy5zdXBlcmdyb3VwO1xuICAgIHRoaXMucHJvcHMuc3RhcnRfdGltZSA9IG1vbWVudChwcm9wZXJ0aWVzLnN0YXJ0X3RpbWUsICdZWVlZLU1NLUREIEhIOm1tOnNzJykuX2Q7XG5cbiAgICAvLyBSZW1vdmUgdGhlIHRpbWV6b25lIGlzc3VlIGZyb21cbiAgICB0aGlzLnByb3BzLnN0YXJ0X3RpbWUgPSBuZXcgRGF0ZSh0aGlzLnByb3BzLnN0YXJ0X3RpbWUudmFsdWVPZigpKTtcbiAgICB0aGlzLnByb3BzLmdyb3VwID0gcHJvcGVydGllcy5ncm91cDtcbiAgICB0aGlzLnByb3BzLkxhdExuZyA9IFtwYXJzZUZsb2F0KHByb3BlcnRpZXMubGF0KSwgcGFyc2VGbG9hdChwcm9wZXJ0aWVzLmxuZyldO1xuICAgIHRoaXMucHJvcHMuZXZlbnRfdHlwZSA9IHByb3BlcnRpZXMuZXZlbnRfdHlwZTtcbiAgICB0aGlzLnByb3BzLmxhdCA9IHByb3BlcnRpZXMubGF0O1xuICAgIHRoaXMucHJvcHMubG5nID0gcHJvcGVydGllcy5sbmc7XG4gICAgdGhpcy5wcm9wcy5maWx0ZXJzID0gcHJvcGVydGllcy5maWx0ZXJzO1xuXG4gICAgdGhpcy5wcm9wcy5zb2NpYWwgPSB7XG4gICAgICBmYWNlYm9vazogcHJvcGVydGllcy5mYWNlYm9vayxcbiAgICAgIGVtYWlsOiBwcm9wZXJ0aWVzLmVtYWlsLFxuICAgICAgcGhvbmU6IHByb3BlcnRpZXMucGhvbmUsXG4gICAgICB0d2l0dGVyOiBwcm9wZXJ0aWVzLnR3aXR0ZXJcbiAgICB9O1xuXG4gICAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbiAoZGlzdGFuY2UsIHppcGNvZGUpIHtcblxuICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAvLyB2YXIgZW5kdGltZSA9IHRoYXQuZW5kVGltZSA/IG1vbWVudCh0aGF0LmVuZFRpbWUpLmZvcm1hdChcImg6bW1hXCIpIDogbnVsbDtcblxuICAgICAgaWYgKHRoaXMucHJvcHMuZXZlbnRfdHlwZSA9PT0gJ0dyb3VwJykge1xuICAgICAgICByZXR1cm4gdGhhdC5yZW5kZXJfZ3JvdXAoZGlzdGFuY2UsIHppcGNvZGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoYXQucmVuZGVyX2V2ZW50KGRpc3RhbmNlLCB6aXBjb2RlKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5yZW5kZXJfZ3JvdXAgPSBmdW5jdGlvbiAoZGlzdGFuY2UsIHppcGNvZGUpIHtcbiAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgdmFyIGxhdCA9IHRoYXQucHJvcHMubGF0O1xuICAgICAgdmFyIGxvbiA9IHRoYXQucHJvcHMubG5nO1xuXG4gICAgICB2YXIgc29jaWFsX2h0bWwgPSAnJztcblxuICAgICAgaWYgKHRoYXQucHJvcHMuc29jaWFsKSB7XG4gICAgICAgIGlmICh0aGF0LnByb3BzLnNvY2lhbC5mYWNlYm9vayAhPT0gJycpIHtcbiAgICAgICAgICBzb2NpYWxfaHRtbCArPSAnPGEgaHJlZj1cXCcnICsgdGhhdC5wcm9wcy5zb2NpYWwuZmFjZWJvb2sgKyAnXFwnIHRhcmdldD1cXCdfYmxhbmtcXCc+PGltZyBzcmM9XFwnL2ltZy9pY29uL2ZhY2Vib29rLnBuZ1xcJyAvPjwvYT4nO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGF0LnByb3BzLnNvY2lhbC50d2l0dGVyICE9PSAnJykge1xuICAgICAgICAgIHNvY2lhbF9odG1sICs9ICc8YSBocmVmPVxcJycgKyB0aGF0LnByb3BzLnNvY2lhbC50d2l0dGVyICsgJ1xcJyB0YXJnZXQ9XFwnX2JsYW5rXFwnPjxpbWcgc3JjPVxcJy9pbWcvaWNvbi90d2l0dGVyLnBuZ1xcJyAvPjwvYT4nO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGF0LnByb3BzLnNvY2lhbC5lbWFpbCAhPT0gJycpIHtcbiAgICAgICAgICBzb2NpYWxfaHRtbCArPSAnPGEgaHJlZj1cXCdtYWlsdG86JyArIHRoYXQucHJvcHMuc29jaWFsLmVtYWlsICsgJ1xcJyA+PGltZyBzcmM9XFwnL2ltZy9pY29uL21haWxjaGltcC5wbmdcXCcgLz48L2E+JztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhhdC5wcm9wcy5zb2NpYWwucGhvbmUgIT09ICcnKSB7XG4gICAgICAgICAgc29jaWFsX2h0bWwgKz0gJyZuYnNwOzxpbWcgc3JjPVxcJy9pbWcvaWNvbi9waG9uZS5wbmdcXCcgLz48c3Bhbj4nICsgdGhhdC5wcm9wcy5zb2NpYWwucGhvbmUgKyAnPC9zcGFuPic7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIG5ld193aW5kb3cgPSB0cnVlO1xuICAgICAgaWYgKHRoYXQucHJvcHMudXJsLm1hdGNoKC9ebWFpbHRvL2cpKSB7XG4gICAgICAgIG5ld193aW5kb3cgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlbmRlcmVkID0gJChcIjxkaXYgY2xhc3M9bW9udHNlcnJhdC8+XCIpLmFkZENsYXNzKCdldmVudC1pdGVtICcgKyB0aGF0LmNsYXNzTmFtZSkuaHRtbCgnXFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWl0ZW0gbGF0byAnICsgdGhhdC5jbGFzc05hbWUgKyAnXCIgbGF0PVwiJyArIGxhdCArICdcIiBsb249XCInICsgbG9uICsgJ1wiPlxcbiAgICAgICAgICAgICAgPGg1IGNsYXNzPVwidGltZS1pbmZvXCI+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGltZS1pbmZvLWRpc3RcIj4nICsgKGRpc3RhbmNlID8gZGlzdGFuY2UgKyBcIm1pJm5ic3A7Jm5ic3A7XCIgOiBcIlwiKSArICc8L3NwYW4+XFxuICAgICAgICAgICAgICA8L2g1PlxcbiAgICAgICAgICAgICAgPGgzPlxcbiAgICAgICAgICAgICAgICA8YSAnICsgKG5ld193aW5kb3cgPyAndGFyZ2V0PVwiX2JsYW5rXCInIDogJycpICsgJyBocmVmPVwiJyArIHRoYXQucHJvcHMudXJsICsgJ1wiPicgKyB0aGF0LnByb3BzLnRpdGxlICsgJzwvYT5cXG4gICAgICAgICAgICAgIDwvaDM+XFxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImxhYmVsLWljb25cIj48L3NwYW4+XFxuICAgICAgICAgICAgICA8aDUgY2xhc3M9XCJldmVudC10eXBlXCI+JyArIHRoYXQucHJvcHMuZXZlbnRfdHlwZSArICc8L2g1PlxcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXCdldmVudC1zb2NpYWxcXCc+XFxuICAgICAgICAgICAgICAgICcgKyBzb2NpYWxfaHRtbCArICdcXG4gICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICcpO1xuXG4gICAgICByZXR1cm4gcmVuZGVyZWQuaHRtbCgpO1xuICAgIH07XG5cbiAgICB0aGlzLnJlbmRlcl9ldmVudCA9IGZ1bmN0aW9uIChkaXN0YW5jZSwgemlwY29kZSkge1xuICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICB2YXIgZGF0ZXRpbWUgPSBtb21lbnQodGhhdC5wcm9wcy5zdGFydF90aW1lKS5mb3JtYXQoXCJNTU0gREQgKGRkZCkgaDptbWFcIik7XG4gICAgICB2YXIgbGF0ID0gdGhhdC5wcm9wcy5sYXQ7XG4gICAgICB2YXIgbG9uID0gdGhhdC5wcm9wcy5sbmc7XG5cbiAgICAgIHZhciByZW5kZXJlZCA9ICQoXCI8ZGl2IGNsYXNzPW1vbnRzZXJyYXQvPlwiKS5hZGRDbGFzcygnZXZlbnQtaXRlbSAnICsgdGhhdC5jbGFzc05hbWUpLmh0bWwoJ1xcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1pdGVtIGxhdG8gJyArIHRoYXQuY2xhc3NOYW1lICsgJ1wiIGxhdD1cIicgKyBsYXQgKyAnXCIgbG9uPVwiJyArIGxvbiArICdcIj5cXG4gICAgICAgICAgICAgIDxoNSBjbGFzcz1cInRpbWUtaW5mb1wiPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRpbWUtaW5mby1kaXN0XCI+JyArIChkaXN0YW5jZSA/IGRpc3RhbmNlICsgXCJtaSZuYnNwOyZuYnNwO1wiIDogXCJcIikgKyAnPC9zcGFuPicgKyBkYXRldGltZSArICdcXG4gICAgICAgICAgICAgIDwvaDU+XFxuICAgICAgICAgICAgICA8aDM+XFxuICAgICAgICAgICAgICAgIDxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCInICsgdGhhdC5wcm9wcy51cmwgKyAnXCI+JyArIHRoYXQucHJvcHMudGl0bGUgKyAnPC9hPlxcbiAgICAgICAgICAgICAgPC9oMz5cXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibGFiZWwtaWNvblwiPjwvc3Bhbj5cXG4gICAgICAgICAgICAgIDxoNSBjbGFzcz1cImV2ZW50LXR5cGVcIj4nICsgdGhhdC5wcm9wcy5ldmVudF90eXBlICsgJzwvaDU+XFxuICAgICAgICAgICAgICA8cD4nICsgdGhhdC5wcm9wcy5hZGRyZXNzICsgJzwvcD5cXG4gICAgICAgICAgICAgIDxkaXY+XFxuICAgICAgICAgICAgICAgIDxhIGNsYXNzPVwicnN2cC1saW5rXCIgaHJlZj1cIicgKyB0aGF0LnByb3BzLnVybCArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIj5SU1ZQPC9hPlxcbiAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgJyk7XG5cbiAgICAgIHJldHVybiByZW5kZXJlZC5odG1sKCk7XG4gICAgfTtcbiAgfTtcbiAgXG59KGpRdWVyeSk7IC8vRW5kIG9mIGV2ZW50c1xuIiwiLyoqKipcbiAqICBNYXBNYW5hZ2VyIHByb3BlclxuICovXG52YXIgTWFwTWFuYWdlciA9IGZ1bmN0aW9uICgkLCBkMywgbGVhZmxldCkge1xuICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50RGF0YSwgY2FtcGFpZ25PZmZpY2VzLCB6aXBjb2Rlcywgb3B0aW9ucykge1xuICAgIHZhciBhbGxGaWx0ZXJzID0gd2luZG93LmV2ZW50VHlwZUZpbHRlcnMubWFwKGZ1bmN0aW9uIChpKSB7XG4gICAgICByZXR1cm4gaS5pZDtcbiAgICB9KTtcblxuICAgIHZhciBwb3B1cCA9IEwucG9wdXAoKTtcbiAgICB2YXIgb3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdmFyIHppcGNvZGVzID0gemlwY29kZXMucmVkdWNlKGZ1bmN0aW9uICh6aXBzLCBpdGVtKSB7XG4gICAgICB6aXBzW2l0ZW0uemlwXSA9IGl0ZW07cmV0dXJuIHppcHM7XG4gICAgfSwge30pO1xuXG4gICAgdmFyIGN1cnJlbnRfZmlsdGVycyA9IFtdLFxuICAgICAgICBjdXJyZW50X3ppcGNvZGUgPSBcIlwiLFxuICAgICAgICBjdXJyZW50X2Rpc3RhbmNlID0gXCJcIixcbiAgICAgICAgY3VycmVudF9zb3J0ID0gXCJcIjtcblxuICAgIHZhciBvcmlnaW5hbEV2ZW50TGlzdCA9IGV2ZW50RGF0YS5tYXAoZnVuY3Rpb24gKGQpIHtcbiAgICAgIHJldHVybiBuZXcgRXZlbnQoZCk7XG4gICAgfSk7XG4gICAgdmFyIGV2ZW50c0xpc3QgPSBvcmlnaW5hbEV2ZW50TGlzdC5zbGljZSgwKTtcblxuICAgIC8vIHZhciBvZmZpY2VMaXN0ID0gY2FtcGFpZ25PZmZpY2VzLm1hcChmdW5jdGlvbihkKSB7IHJldHVybiBuZXcgQ2FtcGFpZ25PZmZpY2VzKGQpOyB9KTtcblxuICAgIC8vIHZhciBtYXBib3hUaWxlcyA9IGxlYWZsZXQudGlsZUxheWVyKCdodHRwOi8ve3N9LnRpbGVzLm1hcGJveC5jb20vdjQvbWFwYm94LnN0cmVldHMve3p9L3t4fS97eX0ucG5nP2FjY2Vzc190b2tlbj0nICsgbGVhZmxldC5tYXBib3guYWNjZXNzVG9rZW4sIHsgYXR0cmlidXRpb246ICc8YSBocmVmPVwiaHR0cDovL3d3dy5vcGVuc3RyZWV0bWFwLm9yZy9jb3B5cmlnaHRcIiB0YXJnZXQ9XCJfYmxhbmtcIj4mY29weTsgT3BlblN0cmVldE1hcCBjb250cmlidXRvcnM8L2E+J30pO1xuXG4gICAgdmFyIG1hcGJveFRpbGVzID0gbGVhZmxldC50aWxlTGF5ZXIoJ2h0dHBzOi8vY2FydG9kYi1iYXNlbWFwcy17c30uZ2xvYmFsLnNzbC5mYXN0bHkubmV0L2xpZ2h0X2FsbC97en0ve3h9L3t5fS5wbmcnLCB7XG4gICAgICBtYXhab29tOiAxOCxcbiAgICAgIGF0dHJpYnV0aW9uOiAnJmNvcHk7IDxhIGhyZWY9XCJodHRwOi8vd3d3Lm9wZW5zdHJlZXRtYXAub3JnL2NvcHlyaWdodFwiPk9wZW5TdHJlZXRNYXA8L2E+LCAmY29weTs8YSBocmVmPVwiaHR0cHM6Ly9jYXJ0by5jb20vYXR0cmlidXRpb25cIj5DQVJUTzwvYT4nXG4gICAgfSk7XG5cbiAgICAvLyB2YXIgbWFwYm94VGlsZXMgPSBsZWFmbGV0LnRpbGVMYXllcignaHR0cHM6Ly9jYXJ0b2RiLWJhc2VtYXBzLXtzfS5nbG9iYWwuc3NsLmZhc3RseS5uZXQvbGlnaHRfYWxsL3t6fS97eH0ve3l9LnBuZycsIHtcbiAgICAvLyAgIG1heFpvb206IDE4LFxuICAgIC8vICAgYXR0cmlidXRpb246ICcmY29weTsgPGEgaHJlZj1cImh0dHA6Ly93d3cub3BlbnN0cmVldG1hcC5vcmcvY29weXJpZ2h0XCI+T3BlblN0cmVldE1hcDwvYT4sICZjb3B5OzxhIGhyZWY9XCJodHRwczovL2NhcnRvLmNvbS9hdHRyaWJ1dGlvblwiPkNBUlRPPC9hPidcbiAgICAvLyB9KTtcblxuICAgIHZhciBDQU1QQUlHTl9PRkZJQ0VfSUNPTiA9IEwuaWNvbih7XG4gICAgICBpY29uVXJsOiAnLy9kMmJxMnlmMzFsanUzcS5jbG91ZGZyb250Lm5ldC9pbWcvaWNvbi9zdGFyLnBuZycsXG4gICAgICBpY29uU2l6ZTogWzE3LCAxNF0gfSk7XG4gICAgdmFyIEdPVFZfQ0VOVEVSX0lDT04gPSBMLmljb24oe1xuICAgICAgaWNvblVybDogJy8vZDJicTJ5ZjMxbGp1M3EuY2xvdWRmcm9udC5uZXQvaW1nL2ljb24vZ290di1zdGFyLnBuZycsXG4gICAgICBpY29uU2l6ZTogWzEzLCAxMF0gfSk7XG4gICAgdmFyIGRlZmF1bHRDb29yZCA9IG9wdGlvbnMgJiYgb3B0aW9ucy5kZWZhdWx0Q29vcmQgPyBvcHRpb25zLmRlZmF1bHRDb29yZCA6IHsgY2VudGVyOiBbMjMuNDg5Mjc3NCwtMzEuMDAwNDkzNF0sIHpvb206IDN9O1xuXG4gICAgdmFyIGNlbnRyYWxNYXAgPSBuZXcgbGVhZmxldC5NYXAoXCJtYXAtY29udGFpbmVyXCIsIHdpbmRvdy5jdXN0b21NYXBDb29yZCA/IHdpbmRvdy5jdXN0b21NYXBDb29yZCA6IGRlZmF1bHRDb29yZCkuYWRkTGF5ZXIobWFwYm94VGlsZXMpO1xuICAgIGlmIChjZW50cmFsTWFwKSB7fVxuXG4gICAgdmFyIG92ZXJsYXlzID0gTC5sYXllckdyb3VwKCkuYWRkVG8oY2VudHJhbE1hcCk7XG4gICAgdmFyIG9mZmljZXMgPSBMLmxheWVyR3JvdXAoKS5hZGRUbyhjZW50cmFsTWFwKTtcbiAgICB2YXIgZ290dkNlbnRlciA9IEwubGF5ZXJHcm91cCgpLmFkZFRvKGNlbnRyYWxNYXApO1xuXG4gICAgdmFyIGNhbXBhaWduT2ZmaWNlTGF5ZXIgPSBMLmxheWVyR3JvdXAoKS5hZGRUbyhjZW50cmFsTWFwKTtcblxuICAgIC8vaW5pdGlhbGl6ZSBtYXBcbiAgICB2YXIgZmlsdGVyZWRFdmVudHMgPSBbXTtcbiAgICB2YXIgbW9kdWxlID0ge307XG5cbiAgICB2YXIgX3BvcHVwRXZlbnRzID0gZnVuY3Rpb24gX3BvcHVwRXZlbnRzKGV2ZW50KSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0Ll9sYXRsbmc7XG5cbiAgICAgIHZhciBmaWx0ZXJlZCA9IGV2ZW50c0xpc3QuZmlsdGVyKGZ1bmN0aW9uIChkKSB7XG5cbiAgICAgICAgcmV0dXJuIHRhcmdldC5sYXQgPT0gZC5wcm9wcy5MYXRMbmdbMF0gJiYgdGFyZ2V0LmxuZyA9PSBkLnByb3BzLkxhdExuZ1sxXSAmJiAoIWN1cnJlbnRfZmlsdGVycyB8fCBjdXJyZW50X2ZpbHRlcnMubGVuZ3RoID09IDAgfHwgJChkLnByb3BlcnRpZXMuZmlsdGVycykubm90KGN1cnJlbnRfZmlsdGVycykubGVuZ3RoICE9IGQucHJvcGVydGllcy5maWx0ZXJzLmxlbmd0aCk7XG4gICAgICB9KS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgIHJldHVybiBhLnByb3BzLnN0YXJ0X3RpbWUgLSBiLnByb3BzLnN0YXJ0X3RpbWU7XG4gICAgICB9KTtcblxuICAgICAgdmFyIGRpdiA9ICQoXCI8ZGl2IC8+XCIpLmFwcGVuZChmaWx0ZXJlZC5sZW5ndGggPiAxID8gXCI8aDMgY2xhc3M9J3NjaGVkLWNvdW50Jz5cIiArIGZpbHRlcmVkLmxlbmd0aCArIFwiIFJlc3VsdHM8L2gzPlwiIDogXCJcIikuYXBwZW5kKCQoXCI8ZGl2IGNsYXNzPSdwb3B1cC1saXN0LWNvbnRhaW5lcicvPlwiKS5hcHBlbmQoJChcIjx1bCBjbGFzcz0ncG9wdXAtbGlzdCc+XCIpXG4gICAgICAuYXBwZW5kKGZpbHRlcmVkLm1hcChmdW5jdGlvbiAoZCkge1xuICAgICAgICByZXR1cm4gJChcIjxsaSBjbGFzcz1tb250c2VycmF0Lz5cIikuYWRkQ2xhc3MoZC5pc0Z1bGwgPyBcImlzLWZ1bGxcIiA6IFwibm90LWZ1bGxcIikuYWRkQ2xhc3MoZC52aXNpYmxlID8gXCJpcy12aXNpYmxlXCIgOiBcIm5vdC12aXNpYmxlXCIpLmFwcGVuZChkLnJlbmRlcigpKTtcbiAgICAgIH0pKSkpO1xuXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgTC5wb3B1cCgpLnNldExhdExuZyhldmVudC50YXJnZXQuX2xhdGxuZykuc2V0Q29udGVudChkaXYuaHRtbCgpKS5vcGVuT24oY2VudHJhbE1hcCk7XG4gICAgICB9LCAxMDApO1xuICAgIH07XG5cbiAgICAvKioqXG4gICAgICogSW5pdGlhbGl6YXRpb25cbiAgICAgKi9cbiAgICB2YXIgaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XG4gICAgICB2YXIgdW5pcXVlTG9jcyA9IGV2ZW50c0xpc3QucmVkdWNlKGZ1bmN0aW9uIChhcnIsIGl0ZW0pIHtcbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9IGl0ZW0ucHJvcGVydGllcy5maWx0ZXJzLmpvaW4oXCIgXCIpO1xuICAgICAgICBpZiAoYXJyLmluZGV4T2YoaXRlbS5wcm9wZXJ0aWVzLmxhdCArIFwifHxcIiArIGl0ZW0ucHJvcGVydGllcy5sbmcgKyBcInx8XCIgKyBjbGFzc05hbWUpID49IDApIHtcbiAgICAgICAgICByZXR1cm4gYXJyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFyci5wdXNoKGl0ZW0ucHJvcGVydGllcy5sYXQgKyBcInx8XCIgKyBpdGVtLnByb3BlcnRpZXMubG5nICsgXCJ8fFwiICsgY2xhc3NOYW1lKTtcbiAgICAgICAgICByZXR1cm4gYXJyO1xuICAgICAgICB9XG4gICAgICB9LCBbXSk7XG5cbiAgICAgIHVuaXF1ZUxvY3MgPSB1bmlxdWVMb2NzLm1hcChmdW5jdGlvbiAoZCkge1xuICAgICAgICB2YXIgc3BsaXQgPSBkLnNwbGl0KFwifHxcIik7XG4gICAgICAgIHJldHVybiB7IGxhdExuZzogW3BhcnNlRmxvYXQoc3BsaXRbMF0pLCBwYXJzZUZsb2F0KHNwbGl0WzFdKV0sXG4gICAgICAgICAgY2xhc3NOYW1lOiBzcGxpdFsyXSB9O1xuICAgICAgfSk7XG5cbiAgICAgIHVuaXF1ZUxvY3MuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuXG4gICAgICAgIC8vIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIGlmIChpdGVtLmNsYXNzTmFtZSA9PSBcImNhbXBhaWduLW9mZmljZVwiKSB7XG4gICAgICAgIC8vICAgTC5tYXJrZXIoaXRlbS5sYXRMbmcsIHtpY29uOiBDQU1QQUlHTl9PRkZJQ0VfSUNPTiwgY2xhc3NOYW1lOiBpdGVtLmNsYXNzTmFtZX0pXG4gICAgICAgIC8vICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkgeyBfcG9wdXBFdmVudHMoZSk7IH0pXG4gICAgICAgIC8vICAgICAuYWRkVG8ob2ZmaWNlcyk7XG4gICAgICAgIC8vIH0gZWxzZSBpZiAoaXRlbS5jbGFzc05hbWUgPT0gXCJnb3R2LWNlbnRlclwiKSB7XG4gICAgICAgIC8vICAgTC5tYXJrZXIoaXRlbS5sYXRMbmcsIHtpY29uOiBHT1RWX0NFTlRFUl9JQ09OLCBjbGFzc05hbWU6IGl0ZW0uY2xhc3NOYW1lfSlcbiAgICAgICAgLy8gICAgIC5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7IF9wb3B1cEV2ZW50cyhlKTsgfSlcbiAgICAgICAgLy8gICAgIC5hZGRUbyhnb3R2Q2VudGVyKTtcbiAgICAgICAgLy8gfWVsc2VcbiAgICAgICAgLy8gaWYgKGl0ZW0uY2xhc3NOYW1lLm1hdGNoKC9iZXJuaWVcXC1ldmVudC9pZykpIHtcbiAgICAgICAgLy8gICBMLmNpcmNsZU1hcmtlcihpdGVtLmxhdExuZywgeyByYWRpdXM6IDEyLCBjbGFzc05hbWU6IGl0ZW0uY2xhc3NOYW1lLCBjb2xvcjogJ3doaXRlJywgZmlsbENvbG9yOiAnI0Y1NUI1QicsIG9wYWNpdHk6IDAuOCwgZmlsbE9wYWNpdHk6IDAuNywgd2VpZ2h0OiAyIH0pXG4gICAgICAgIC8vICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkgeyBfcG9wdXBFdmVudHMoZSk7IH0pXG4gICAgICAgIC8vICAgICAuYWRkVG8ob3ZlcmxheXMpO1xuICAgICAgICAvLyB9XG4gICAgICAgIGlmIChpdGVtLmNsYXNzTmFtZSA9PSAnZ3JvdXAtbWVldGluZycpIHtcbiAgICAgICAgICBMLmNpcmNsZU1hcmtlcihpdGVtLmxhdExuZywgeyByYWRpdXM6IDUsIGNsYXNzTmFtZTogaXRlbS5jbGFzc05hbWUsIGNvbG9yOiAnd2hpdGUnLCBmaWxsQ29sb3I6ICcjZTcxMDI5Jywgb3BhY2l0eTogMC44LCBmaWxsT3BhY2l0eTogMC43LCB3ZWlnaHQ6IDIgfSkub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIF9wb3B1cEV2ZW50cyhlKTtcbiAgICAgICAgICB9KS5hZGRUbyhvdmVybGF5cyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXRlbS5jbGFzc05hbWUgPT0gJ2dyb3VwJykge1xuICAgICAgICAgIEwuY2lyY2xlTWFya2VyKGl0ZW0ubGF0TG5nLCB7IHJhZGl1czogNCwgY2xhc3NOYW1lOiBpdGVtLmNsYXNzTmFtZSwgY29sb3I6ICd3aGl0ZScsIGZpbGxDb2xvcjogJyNGRjMyNTEnLCBvcGFjaXR5OiAwLjYsIGZpbGxPcGFjaXR5OiAwLjksIHdlaWdodDogMiB9KS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgX3BvcHVwRXZlbnRzKGUpO1xuICAgICAgICAgIH0pLmFkZFRvKG92ZXJsYXlzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBMLmNpcmNsZU1hcmtlcihpdGVtLmxhdExuZywgeyByYWRpdXM6IDUsIGNsYXNzTmFtZTogaXRlbS5jbGFzc05hbWUsIGNvbG9yOiAnd2hpdGUnLCBmaWxsQ29sb3I6ICcjRkYzMjUxJywgb3BhY2l0eTogMC44LCBmaWxsT3BhY2l0eTogMC43LCB3ZWlnaHQ6IDIgfSkub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIF9wb3B1cEV2ZW50cyhlKTtcbiAgICAgICAgICB9KS5hZGRUbyhvdmVybGF5cyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gfSwgMTApO1xuICAgICAgfSk7XG5cbiAgICAgIC8vICQoXCIubGVhZmxldC1vdmVybGF5LXBhbmVcIikuZmluZChcIi5iZXJuaWUtZXZlbnRcIikucGFyZW50KCkucHJlcGVuZFRvKCcubGVhZmxldC16b29tLWFuaW1hdGVkJyk7XG4gICAgfTsgLy8gRW5kIG9mIGluaXRpYWxpemVcblxuICAgIHZhciB0b01pbGUgPSBmdW5jdGlvbiB0b01pbGUobWV0ZXIpIHtcbiAgICAgIHJldHVybiBtZXRlciAqIDAuMDAwNjIxMzc7XG4gICAgfTtcblxuICAgIHZhciBmaWx0ZXJFdmVudHNCeUNvb3JkcyA9IGZ1bmN0aW9uIGZpbHRlckV2ZW50c0J5Q29vcmRzKGNlbnRlciwgZGlzdGFuY2UsIGZpbHRlclR5cGVzKSB7XG5cbiAgICAgIHZhciB6aXBMYXRMbmcgPSBsZWFmbGV0LmxhdExuZyhjZW50ZXIpO1xuXG4gICAgICB2YXIgZmlsdGVyZWQgPSBldmVudHNMaXN0LmZpbHRlcihmdW5jdGlvbiAoZCkge1xuICAgICAgICB2YXIgZGlzdCA9IHRvTWlsZSh6aXBMYXRMbmcuZGlzdGFuY2VUbyhkLnByb3BzLkxhdExuZykpO1xuICAgICAgICBpZiAoZGlzdCA8IGRpc3RhbmNlKSB7XG5cbiAgICAgICAgICBkLmRpc3RhbmNlID0gTWF0aC5yb3VuZChkaXN0ICogMTApIC8gMTA7XG5cbiAgICAgICAgICAvL0lmIG5vIGZpbHRlciB3YXMgYSBtYXRjaCBvbiB0aGUgY3VycmVudCBmaWx0ZXJcbiAgICAgICAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmRlZmF1bHRDb29yZCAmJiAhZmlsdGVyVHlwZXMpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICgkKGQucHJvcHMuZmlsdGVycykubm90KGZpbHRlclR5cGVzKS5sZW5ndGggPT0gZC5wcm9wcy5maWx0ZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZmlsdGVyZWQ7XG4gICAgfTtcblxuICAgIHZhciBmaWx0ZXJFdmVudHMgPSBmdW5jdGlvbiBmaWx0ZXJFdmVudHMoemlwY29kZSwgZGlzdGFuY2UsIGZpbHRlclR5cGVzKSB7XG4gICAgICByZXR1cm4gZmlsdGVyRXZlbnRzQnlDb29yZHMoW3BhcnNlRmxvYXQoemlwY29kZS5sYXQpLCBwYXJzZUZsb2F0KHppcGNvZGUubG9uKV0sIGRpc3RhbmNlLCBmaWx0ZXJUeXBlcyk7XG4gICAgfTtcblxuICAgIHZhciBzb3J0RXZlbnRzID0gZnVuY3Rpb24gc29ydEV2ZW50cyhmaWx0ZXJlZEV2ZW50cywgc29ydFR5cGUpIHtcbiAgICAgIHN3aXRjaCAoc29ydFR5cGUpIHtcbiAgICAgICAgY2FzZSAnZGlzdGFuY2UnOlxuICAgICAgICAgIGZpbHRlcmVkRXZlbnRzID0gZmlsdGVyZWRFdmVudHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgcmV0dXJuIGEuZGlzdGFuY2UgLSBiLmRpc3RhbmNlO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGZpbHRlcmVkRXZlbnRzID0gZmlsdGVyZWRFdmVudHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgcmV0dXJuIGEucHJvcHMuc3RhcnRfdGltZSAtIGIucHJvcHMuc3RhcnRfdGltZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgLy8gZmlsdGVyZWRFdmVudHMgPSBmaWx0ZXJlZEV2ZW50cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIC8vICAgdmFyIGFGdWxsID0gYS5pc0Z1bGwoKTtcbiAgICAgIC8vICAgdmFyIGJGdWxsID0gYi5pc0Z1bGwoKTtcblxuICAgICAgLy8gICBpZiAoYUZ1bGwgJiYgYkZ1bGwpIHsgcmV0dXJuIDA7IH1cbiAgICAgIC8vICAgZWxzZSBpZiAoYUZ1bGwgJiYgIWJGdWxsKSB7IHJldHVybiAxOyB9XG4gICAgICAvLyAgIGVsc2UgaWYgKCFhRnVsbCAmJiBiRnVsbCkgeyByZXR1cm4gLTE7IH1cbiAgICAgIC8vIH0pO1xuICAgICAgLy9zb3J0IGJ5IGZ1bGxuZXNzO1xuICAgICAgLy8uLlxuICAgICAgcmV0dXJuIGZpbHRlcmVkRXZlbnRzO1xuICAgIH07XG5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGluaXRpYWxpemUoKTtcbiAgICB9LCAxMCk7XG5cbiAgICBtb2R1bGUuX2V2ZW50c0xpc3QgPSBldmVudHNMaXN0O1xuICAgIG1vZHVsZS5femlwY29kZXMgPSB6aXBjb2RlcztcbiAgICBtb2R1bGUuX29wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgLypcbiAgICAqIFJlZnJlc2ggbWFwIHdpdGggbmV3IGV2ZW50cyBtYXBcbiAgICAqL1xuICAgIHZhciBfcmVmcmVzaE1hcCA9IGZ1bmN0aW9uIF9yZWZyZXNoTWFwKCkge1xuICAgICAgb3ZlcmxheXMuY2xlYXJMYXllcnMoKTtcbiAgICAgIGluaXRpYWxpemUoKTtcbiAgICB9O1xuXG4gICAgbW9kdWxlLmZpbHRlckJ5VHlwZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICBpZiAoJChmaWx0ZXJzKS5ub3QodHlwZSkubGVuZ3RoICE9IDAgfHwgJCh0eXBlKS5ub3QoZmlsdGVycykubGVuZ3RoICE9IDApIHtcbiAgICAgICAgY3VycmVudF9maWx0ZXJzID0gdHlwZTtcblxuICAgICAgICAvL0ZpbHRlciBvbmx5IGl0ZW1zIGluIHRoZSBsaXN0XG4gICAgICAgIC8vIGV2ZW50c0xpc3QgPSBvcmlnaW5hbEV2ZW50TGlzdC5maWx0ZXIoZnVuY3Rpb24oZXZlbnRJdGVtKSB7XG4gICAgICAgIC8vICAgdmFyIHVubWF0Y2ggPSAkKGV2ZW50SXRlbS5wcm9wZXJ0aWVzLmZpbHRlcnMpLm5vdChmaWx0ZXJzKTtcbiAgICAgICAgLy8gICByZXR1cm4gdW5tYXRjaC5sZW5ndGggIT0gZXZlbnRJdGVtLnByb3BlcnRpZXMuZmlsdGVycy5sZW5ndGg7XG4gICAgICAgIC8vIH0pO1xuXG5cbiAgICAgICAgLy8gdmFyIHRhcmdldCA9IHR5cGUubWFwKGZ1bmN0aW9uKGkpIHsgcmV0dXJuIFwiLlwiICsgaSB9KS5qb2luKFwiLFwiKTtcbiAgICAgICAgLy8gJChcIi5sZWFmbGV0LW92ZXJsYXktcGFuZVwiKS5maW5kKFwicGF0aDpub3QoXCIrdHlwZS5tYXAoZnVuY3Rpb24oaSkgeyByZXR1cm4gXCIuXCIgKyBpIH0pLmpvaW4oXCIsXCIpICsgXCIpXCIpXG5cbiAgICAgICAgdmFyIHRvSGlkZSA9ICQoYWxsRmlsdGVycykubm90KHR5cGUpO1xuXG4gICAgICAgIGlmICh0b0hpZGUgJiYgdG9IaWRlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB0b0hpZGUgPSB0b0hpZGUuc3BsaWNlKDAsIHRvSGlkZS5sZW5ndGgpO1xuICAgICAgICAgICQoXCIubGVhZmxldC1vdmVybGF5LXBhbmVcIikuZmluZChcIi5cIiArIHRvSGlkZS5qb2luKFwiLC5cIikpLmhpZGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlICYmIHR5cGUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICQoXCIubGVhZmxldC1vdmVybGF5LXBhbmVcIikuZmluZChcIi5cIiArIHR5cGUuam9pbihcIiwuXCIpKS5zaG93KCk7XG4gICAgICAgICAgLy8gX3JlZnJlc2hNYXAoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vU3BlY2lmaWNhbGx5IGZvciBjYW1wYWlnbiBvZmZpY2VcbiAgICAgICAgaWYgKCF0eXBlKSB7XG4gICAgICAgICAgY2VudHJhbE1hcC5yZW1vdmVMYXllcihvZmZpY2VzKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlICYmIHR5cGUuaW5kZXhPZignY2FtcGFpZ24tb2ZmaWNlJykgPCAwKSB7XG4gICAgICAgICAgY2VudHJhbE1hcC5yZW1vdmVMYXllcihvZmZpY2VzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjZW50cmFsTWFwLmFkZExheWVyKG9mZmljZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9Gb3IgZ290di1jZW50ZXJzXG4gICAgICAgIGlmICghdHlwZSkge1xuICAgICAgICAgIGNlbnRyYWxNYXAucmVtb3ZlTGF5ZXIoZ290dkNlbnRlcik7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSAmJiB0eXBlLmluZGV4T2YoJ2dvdHYtY2VudGVyJykgPCAwKSB7XG4gICAgICAgICAgY2VudHJhbE1hcC5yZW1vdmVMYXllcihnb3R2Q2VudGVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjZW50cmFsTWFwLmFkZExheWVyKGdvdHZDZW50ZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfTtcblxuICAgIG1vZHVsZS5maWx0ZXJCeUNvb3JkcyA9IGZ1bmN0aW9uIChjb29yZHMsIGRpc3RhbmNlLCBzb3J0LCBmaWx0ZXJUeXBlcykge1xuICAgICAgLy9SZW1vdmUgbGlzdFxuICAgICAgZDMuc2VsZWN0KFwiI2V2ZW50LWxpc3RcIikuc2VsZWN0QWxsKFwibGlcIikucmVtb3ZlKCk7XG5cbiAgICAgIHZhciBmaWx0ZXJlZCA9IGZpbHRlckV2ZW50c0J5Q29vcmRzKGNvb3JkcywgcGFyc2VJbnQoZGlzdGFuY2UpLCBmaWx0ZXJUeXBlcyk7XG4gICAgICAvL1NvcnQgZXZlbnRcbiAgICAgIGZpbHRlcmVkID0gc29ydEV2ZW50cyhmaWx0ZXJlZCwgc29ydCwgZmlsdGVyVHlwZXMpO1xuXG4gICAgICAvL1JlbmRlciBldmVudFxuICAgICAgdmFyIGV2ZW50TGlzdCA9IGQzLnNlbGVjdChcIiNldmVudC1saXN0XCIpLnNlbGVjdEFsbChcImxpXCIpLmRhdGEoZmlsdGVyZWQsIGZ1bmN0aW9uIChkKSB7XG4gICAgICAgIHJldHVybiBkLnByb3BzLnVybDtcbiAgICAgIH0pO1xuXG4gICAgICBldmVudExpc3QuZW50ZXIoKS5hcHBlbmQoXCJsaVwiKS5hdHRyKFwiY2xhc3NcIiwgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgcmV0dXJuIChkLmlzRnVsbCA/ICdpcy1mdWxsJyA6ICdub3QtZnVsbCcpICsgXCIgXCIgKyAodGhpcy52aXNpYmxlID8gXCJpcy12aXNpYmxlXCIgOiBcIm5vdC12aXNpYmxlXCIpO1xuICAgICAgfSkuY2xhc3NlZChcImxhdG9cIiwgdHJ1ZSkuaHRtbChmdW5jdGlvbiAoZCkge1xuICAgICAgICByZXR1cm4gZC5yZW5kZXIoZC5kaXN0YW5jZSk7XG4gICAgICB9KTtcblxuICAgICAgZXZlbnRMaXN0LmV4aXQoKS5yZW1vdmUoKTtcblxuICAgICAgLy9hZGQgYSBoaWdobGlnaHRlZCBtYXJrZXJcbiAgICAgIGZ1bmN0aW9uIGFkZGhpZ2hsaWdodGVkTWFya2VyKGxhdCwgbG9uKSB7XG4gICAgICAgIHZhciBoaWdobGlnaHRlZE1hcmtlciA9IG5ldyBMLmNpcmNsZU1hcmtlcihbbGF0LCBsb25dLCB7IHJhZGl1czogNSwgY29sb3I6ICcjZWE1MDRlJywgZmlsbENvbG9yOiAnIzE0NjJBMicsIG9wYWNpdHk6IDAuOCwgZmlsbE9wYWNpdHk6IDAuNywgd2VpZ2h0OiAyIH0pLmFkZFRvKGNlbnRyYWxNYXApO1xuICAgICAgICAvLyBldmVudCBsaXN0ZW5lciB0byByZW1vdmUgaGlnaGxpZ2h0ZWQgbWFya2Vyc1xuICAgICAgICAkKFwiLm5vdC1mdWxsXCIpLm1vdXNlb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBjZW50cmFsTWFwLnJlbW92ZUxheWVyKGhpZ2hsaWdodGVkTWFya2VyKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIGV2ZW50IGxpc3RlbmVyIHRvIGdldCB0aGUgbW91c2VvdmVyXG4gICAgICAkKFwiLm5vdC1mdWxsXCIpLm1vdXNlb3ZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICQodGhpcykudG9nZ2xlQ2xhc3MoXCJoaWdobGlnaHRcIik7XG4gICAgICAgIHZhciBjTWFya2VyTGF0ID0gJCh0aGlzKS5jaGlsZHJlbignZGl2JykuYXR0cignbGF0Jyk7XG4gICAgICAgIHZhciBjTWFya2VyTG9uID0gJCh0aGlzKS5jaGlsZHJlbignZGl2JykuYXR0cignbG9uJyk7XG4gICAgICAgIC8vIGZ1bmN0aW9uIGNhbGwgdG8gYWRkIGhpZ2hsaWdodGVkIG1hcmtlclxuICAgICAgICBhZGRoaWdobGlnaHRlZE1hcmtlcihjTWFya2VyTGF0LCBjTWFya2VyTG9uKTtcbiAgICAgIH0pO1xuXG4gICAgICAvL1B1c2ggYWxsIGZ1bGwgaXRlbXMgdG8gZW5kIG9mIGxpc3RcbiAgICAgICQoXCJkaXYjZXZlbnQtbGlzdC1jb250YWluZXIgdWwjZXZlbnQtbGlzdCBsaS5pcy1mdWxsXCIpLmFwcGVuZFRvKFwiZGl2I2V2ZW50LWxpc3QtY29udGFpbmVyIHVsI2V2ZW50LWxpc3RcIik7XG5cbiAgICAgIC8vTW92ZSBjYW1wYWlnbiBvZmZpY2VzIHRvXG5cbiAgICAgIHZhciBvZmZpY2VDb3VudCA9ICQoXCJkaXYjZXZlbnQtbGlzdC1jb250YWluZXIgdWwjZXZlbnQtbGlzdCBsaSAuY2FtcGFpZ24tb2ZmaWNlXCIpLmxlbmd0aDtcbiAgICAgICQoXCIjaGlkZS1zaG93LW9mZmljZVwiKS5hdHRyKFwiZGF0YS1jb3VudFwiLCBvZmZpY2VDb3VudCk7XG4gICAgICAkKFwiI2NhbXBhaWduLW9mZi1jb3VudFwiKS50ZXh0KG9mZmljZUNvdW50KTtcbiAgICAgICQoXCJzZWN0aW9uI2NhbXBhaWduLW9mZmljZXMgdWwjY2FtcGFpZ24tb2ZmaWNlLWxpc3QgKlwiKS5yZW1vdmUoKTtcbiAgICAgICQoXCJkaXYjZXZlbnQtbGlzdC1jb250YWluZXIgdWwjZXZlbnQtbGlzdCBsaSAuY2FtcGFpZ24tb2ZmaWNlXCIpLnBhcmVudCgpLmFwcGVuZFRvKFwic2VjdGlvbiNjYW1wYWlnbi1vZmZpY2VzIHVsI2NhbXBhaWduLW9mZmljZS1saXN0XCIpO1xuICAgIH07XG5cbiAgICAvKioqXG4gICAgICogRklMVEVSKCkgIC0tIFdoZW4gdGhlIHVzZXIgc3VibWl0cyBxdWVyeSwgd2Ugd2lsbCBsb29rIGF0IHRoaXMuXG4gICAgICovXG4gICAgbW9kdWxlLmZpbHRlciA9IGZ1bmN0aW9uICh6aXBjb2RlLCBkaXN0YW5jZSwgc29ydCwgZmlsdGVyVHlwZXMpIHtcbiAgICAgIC8vQ2hlY2sgdHlwZSBmaWx0ZXJcblxuICAgICAgaWYgKCF6aXBjb2RlIHx8IHppcGNvZGUgPT0gXCJcIikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9O1xuXG4gICAgICAvL1N0YXJ0IGlmIG90aGVyIGZpbHRlcnMgY2hhbmdlZFxuICAgICAgdmFyIHRhcmdldFppcGNvZGUgPSB6aXBjb2Rlc1t6aXBjb2RlXTtcblxuICAgICAgLy9SZW1vdmUgbGlzdFxuICAgICAgZDMuc2VsZWN0KFwiI2V2ZW50LWxpc3RcIikuc2VsZWN0QWxsKFwibGlcIikucmVtb3ZlKCk7XG5cbiAgICAgIGlmICh0YXJnZXRaaXBjb2RlID09IHVuZGVmaW5lZCB8fCAhdGFyZ2V0WmlwY29kZSkge1xuICAgICAgICAkKFwiI2V2ZW50LWxpc3RcIikuYXBwZW5kKFwiPGxpIGNsYXNzPSdlcnJvciBsYXRvJz5aaXBjb2RlIGRvZXMgbm90IGV4aXN0LjwvbGk+XCIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vQ2FsaWJyYXRlIG1hcFxuICAgICAgdmFyIHpvb20gPSA0O1xuICAgICAgc3dpdGNoIChwYXJzZUludChkaXN0YW5jZSkpIHtcbiAgICAgICAgY2FzZSA1OlxuICAgICAgICAgIHpvb20gPSAxMjticmVhaztcbiAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICB6b29tID0gMTE7YnJlYWs7XG4gICAgICAgIGNhc2UgMjA6XG4gICAgICAgICAgem9vbSA9IDEwO2JyZWFrO1xuICAgICAgICBjYXNlIDUwOlxuICAgICAgICAgIHpvb20gPSA5O2JyZWFrO1xuICAgICAgICBjYXNlIDEwMDpcbiAgICAgICAgICB6b29tID0gODticmVhaztcbiAgICAgICAgY2FzZSAyNTA6XG4gICAgICAgICAgem9vbSA9IDc7YnJlYWs7XG4gICAgICAgIGNhc2UgNTAwOlxuICAgICAgICAgIHpvb20gPSA1O2JyZWFrO1xuICAgICAgICBjYXNlIDc1MDpcbiAgICAgICAgICB6b29tID0gNTticmVhaztcbiAgICAgICAgY2FzZSAxMDAwOlxuICAgICAgICAgIHpvb20gPSA0O2JyZWFrO1xuICAgICAgICBjYXNlIDIwMDA6XG4gICAgICAgICAgem9vbSA9IDQ7YnJlYWs7XG4gICAgICAgIGNhc2UgMzAwMDpcbiAgICAgICAgICB6b29tID0gMzticmVhaztcbiAgICAgIH1cbiAgICAgIGlmICghKHRhcmdldFppcGNvZGUubGF0ICYmIHRhcmdldFppcGNvZGUubGF0ICE9IFwiXCIpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGN1cnJlbnRfemlwY29kZSAhPSB6aXBjb2RlIHx8IGN1cnJlbnRfZGlzdGFuY2UgIT0gZGlzdGFuY2UpIHtcbiAgICAgICAgY3VycmVudF96aXBjb2RlID0gemlwY29kZTtcbiAgICAgICAgY3VycmVudF9kaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgICBjZW50cmFsTWFwLnNldFZpZXcoW3BhcnNlRmxvYXQodGFyZ2V0WmlwY29kZS5sYXQpLCBwYXJzZUZsb2F0KHRhcmdldFppcGNvZGUubG9uKV0sIHpvb20pO1xuICAgICAgfVxuXG4gICAgICB2YXIgZmlsdGVyZWQgPSBmaWx0ZXJFdmVudHModGFyZ2V0WmlwY29kZSwgcGFyc2VJbnQoZGlzdGFuY2UpLCBmaWx0ZXJUeXBlcyk7XG5cbiAgICAgIC8vU29ydCBldmVudFxuICAgICAgZmlsdGVyZWQgPSBzb3J0RXZlbnRzKGZpbHRlcmVkLCBzb3J0LCBmaWx0ZXJUeXBlcyk7XG5cbiAgICAgIC8vUmVuZGVyIGV2ZW50XG4gICAgICB2YXIgZXZlbnRMaXN0ID0gZDMuc2VsZWN0KFwiI2V2ZW50LWxpc3RcIikuc2VsZWN0QWxsKFwibGlcIikuZGF0YShmaWx0ZXJlZCwgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgcmV0dXJuIGQucHJvcHMudXJsO1xuICAgICAgfSk7XG5cbiAgICAgIGV2ZW50TGlzdC5lbnRlcigpLmFwcGVuZChcImxpXCIpLmF0dHIoXCJjbGFzc1wiLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICByZXR1cm4gKGQuaXNGdWxsID8gJ2lzLWZ1bGwnIDogJ25vdC1mdWxsJykgKyBcIiBcIiArICh0aGlzLnZpc2libGUgPyBcImlzLXZpc2libGVcIiA6IFwibm90LXZpc2libGVcIik7XG4gICAgICB9KS5jbGFzc2VkKFwibGF0b1wiLCB0cnVlKS5odG1sKGZ1bmN0aW9uIChkKSB7XG4gICAgICAgIHJldHVybiBkLnJlbmRlcihkLmRpc3RhbmNlKTtcbiAgICAgIH0pO1xuXG4gICAgICBldmVudExpc3QuZXhpdCgpLnJlbW92ZSgpO1xuXG4gICAgICAvL2FkZCBhIGhpZ2hsaWdodGVkIG1hcmtlclxuICAgICAgZnVuY3Rpb24gYWRkaGlnaGxpZ2h0ZWRNYXJrZXIobGF0LCBsb24pIHtcbiAgICAgICAgdmFyIGhpZ2hsaWdodGVkTWFya2VyID0gbmV3IEwuY2lyY2xlTWFya2VyKFtsYXQsIGxvbl0sIHsgcmFkaXVzOiA1LCBjb2xvcjogJyNlYTUwNGUnLCBmaWxsQ29sb3I6ICcjMTQ2MkEyJywgb3BhY2l0eTogMC44LCBmaWxsT3BhY2l0eTogMC43LCB3ZWlnaHQ6IDIgfSkuYWRkVG8oY2VudHJhbE1hcCk7XG4gICAgICAgIC8vIGV2ZW50IGxpc3RlbmVyIHRvIHJlbW92ZSBoaWdobGlnaHRlZCBtYXJrZXJzXG4gICAgICAgICQoXCIubm90LWZ1bGxcIikubW91c2VvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNlbnRyYWxNYXAucmVtb3ZlTGF5ZXIoaGlnaGxpZ2h0ZWRNYXJrZXIpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gZXZlbnQgbGlzdGVuZXIgdG8gZ2V0IHRoZSBtb3VzZW92ZXJcbiAgICAgICQoXCIubm90LWZ1bGxcIikubW91c2VvdmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCh0aGlzKS50b2dnbGVDbGFzcyhcImhpZ2hsaWdodFwiKTtcbiAgICAgICAgdmFyIGNNYXJrZXJMYXQgPSAkKHRoaXMpLmNoaWxkcmVuKCdkaXYnKS5hdHRyKCdsYXQnKTtcbiAgICAgICAgdmFyIGNNYXJrZXJMb24gPSAkKHRoaXMpLmNoaWxkcmVuKCdkaXYnKS5hdHRyKCdsb24nKTtcbiAgICAgICAgLy8gZnVuY3Rpb24gY2FsbCB0byBhZGQgaGlnaGxpZ2h0ZWQgbWFya2VyXG4gICAgICAgIGFkZGhpZ2hsaWdodGVkTWFya2VyKGNNYXJrZXJMYXQsIGNNYXJrZXJMb24pO1xuICAgICAgfSk7XG5cbiAgICAgIC8vUHVzaCBhbGwgZnVsbCBpdGVtcyB0byBlbmQgb2YgbGlzdFxuICAgICAgJChcImRpdiNldmVudC1saXN0LWNvbnRhaW5lciB1bCNldmVudC1saXN0IGxpLmlzLWZ1bGxcIikuYXBwZW5kVG8oXCJkaXYjZXZlbnQtbGlzdC1jb250YWluZXIgdWwjZXZlbnQtbGlzdFwiKTtcblxuICAgICAgLy9Nb3ZlIGNhbXBhaWduIG9mZmljZXMgdG9cblxuICAgICAgdmFyIG9mZmljZUNvdW50ID0gJChcImRpdiNldmVudC1saXN0LWNvbnRhaW5lciB1bCNldmVudC1saXN0IGxpIC5jYW1wYWlnbi1vZmZpY2VcIikubGVuZ3RoO1xuICAgICAgJChcIiNoaWRlLXNob3ctb2ZmaWNlXCIpLmF0dHIoXCJkYXRhLWNvdW50XCIsIG9mZmljZUNvdW50KTtcbiAgICAgICQoXCIjY2FtcGFpZ24tb2ZmLWNvdW50XCIpLnRleHQob2ZmaWNlQ291bnQpO1xuICAgICAgJChcInNlY3Rpb24jY2FtcGFpZ24tb2ZmaWNlcyB1bCNjYW1wYWlnbi1vZmZpY2UtbGlzdCAqXCIpLnJlbW92ZSgpO1xuICAgICAgJChcImRpdiNldmVudC1saXN0LWNvbnRhaW5lciB1bCNldmVudC1saXN0IGxpIC5jYW1wYWlnbi1vZmZpY2VcIikucGFyZW50KCkuYXBwZW5kVG8oXCJzZWN0aW9uI2NhbXBhaWduLW9mZmljZXMgdWwjY2FtcGFpZ24tb2ZmaWNlLWxpc3RcIik7XG4gICAgfTtcblxuICAgIG1vZHVsZS50b01hcFZpZXcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAkKFwiYm9keVwiKS5yZW1vdmVDbGFzcyhcImxpc3Qtdmlld1wiKS5hZGRDbGFzcyhcIm1hcC12aWV3XCIpO1xuICAgICAgY2VudHJhbE1hcC5pbnZhbGlkYXRlU2l6ZSgpO1xuICAgICAgY2VudHJhbE1hcC5fb25SZXNpemUoKTtcbiAgICB9O1xuICAgIG1vZHVsZS50b0xpc3RWaWV3ID0gZnVuY3Rpb24gKCkge1xuICAgICAgJChcImJvZHlcIikucmVtb3ZlQ2xhc3MoXCJtYXAtdmlld1wiKS5hZGRDbGFzcyhcImxpc3Qtdmlld1wiKTtcbiAgICB9O1xuXG4gICAgbW9kdWxlLmdldE1hcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBjZW50cmFsTWFwO1xuICAgIH07XG5cbiAgICByZXR1cm4gbW9kdWxlO1xuICB9O1xufShqUXVlcnksIGQzLCBMKTtcblxudmFyIFZvdGluZ0luZm9NYW5hZ2VyID0gZnVuY3Rpb24gKCQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICh2b3RpbmdJbmZvKSB7XG4gICAgdmFyIHZvdGluZ0luZm8gPSB2b3RpbmdJbmZvO1xuICAgIHZhciBtb2R1bGUgPSB7fTtcblxuICAgIGZ1bmN0aW9uIGJ1aWxkUmVnaXN0cmF0aW9uTWVzc2FnZShzdGF0ZSkge1xuICAgICAgdmFyICRtc2cgPSAkKFwiPGRpdiBjbGFzcz0ncmVnaXN0cmF0aW9uLW1zZycvPlwiKS5hcHBlbmQoJChcIjxoMy8+XCIpLnRleHQoXCJSZWdpc3RyYXRpb24gZGVhZGxpbmU6IFwiICsgbW9tZW50KG5ldyBEYXRlKHN0YXRlLnJlZ2lzdHJhdGlvbl9kZWFkbGluZSkpLmZvcm1hdChcIk1NTSBEXCIpKSkuYXBwZW5kKCQoXCI8cCAvPlwiKS5odG1sKHN0YXRlLm5hbWUgKyBcIiBoYXMgPHN0cm9uZz5cIiArIHN0YXRlLmlzX29wZW4gKyBcIiBcIiArIHN0YXRlLnR5cGUgKyBcIjwvc3Ryb25nPi4gXCIgKyBzdGF0ZS55b3VfbXVzdCkpLmFwcGVuZCgkKFwiPHAgLz5cIikuaHRtbChcIkZpbmQgb3V0IHdoZXJlIGFuZCBob3cgdG8gcmVnaXN0ZXIgYXQgPGEgdGFyZ2V0PSdfYmxhbmsnIGhyZWY9J2h0dHBzOi8vdm90ZS5iZXJuaWVzYW5kZXJzLmNvbS9cIiArIHN0YXRlLnN0YXRlICsgXCInPnZvdGUuYmVybmllc2FuZGVycy5jb208L2E+XCIpKTtcblxuICAgICAgcmV0dXJuICRtc2c7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYnVpbGRQcmltYXJ5SW5mbyhzdGF0ZSkge1xuXG4gICAgICB2YXIgJG1zZyA9ICQoXCI8ZGl2IGNsYXNzPSdyZWdpc3RyYXRpb24tbXNnJy8+XCIpLmFwcGVuZCgkKFwiPGgzLz5cIikudGV4dChcIlByaW1hcnkgZGF5OiBcIiArIG1vbWVudChuZXcgRGF0ZShzdGF0ZS52b3RpbmdfZGF5KSkuZm9ybWF0KFwiTU1NIERcIikpKS5hcHBlbmQoJChcIjxwIC8+XCIpLmh0bWwoc3RhdGUubmFtZSArIFwiIGhhcyA8c3Ryb25nPlwiICsgc3RhdGUuaXNfb3BlbiArIFwiIFwiICsgc3RhdGUudHlwZSArIFwiPC9zdHJvbmc+LiBcIiArIHN0YXRlLnlvdV9tdXN0KSkuYXBwZW5kKCQoXCI8cCAvPlwiKS5odG1sKFwiRmluZCBvdXQgd2hlcmUgYW5kIGhvdyB0byB2b3RlIGF0IDxhIHRhcmdldD0nX2JsYW5rJyBocmVmPSdodHRwczovL3ZvdGUuYmVybmllc2FuZGVycy5jb20vXCIgKyBzdGF0ZS5zdGF0ZSArIFwiJz52b3RlLmJlcm5pZXNhbmRlcnMuY29tPC9hPlwiKSk7XG5cbiAgICAgIHJldHVybiAkbXNnO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJ1aWxkQ2F1Y3VzSW5mbyhzdGF0ZSkge1xuICAgICAgdmFyICRtc2cgPSAkKFwiPGRpdiBjbGFzcz0ncmVnaXN0cmF0aW9uLW1zZycvPlwiKS5hcHBlbmQoJChcIjxoMy8+XCIpLnRleHQoXCJDYXVjdXMgZGF5OiBcIiArIG1vbWVudChuZXcgRGF0ZShzdGF0ZS52b3RpbmdfZGF5KSkuZm9ybWF0KFwiTU1NIERcIikpKS5hcHBlbmQoJChcIjxwIC8+XCIpLmh0bWwoc3RhdGUubmFtZSArIFwiIGhhcyA8c3Ryb25nPlwiICsgc3RhdGUuaXNfb3BlbiArIFwiIFwiICsgc3RhdGUudHlwZSArIFwiPC9zdHJvbmc+LiBcIiArIHN0YXRlLnlvdV9tdXN0KSkuYXBwZW5kKCQoXCI8cCAvPlwiKS5odG1sKFwiRmluZCBvdXQgd2hlcmUgYW5kIGhvdyB0byBjYXVjdXMgYXQgPGEgdGFyZ2V0PSdfYmxhbmsnIGhyZWY9J2h0dHBzOi8vdm90ZS5iZXJuaWVzYW5kZXJzLmNvbS9cIiArIHN0YXRlLnN0YXRlICsgXCInPnZvdGUuYmVybmllc2FuZGVycy5jb208L2E+XCIpKTtcblxuICAgICAgcmV0dXJuICRtc2c7XG4gICAgfVxuXG4gICAgbW9kdWxlLmdldEluZm8gPSBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgIHZhciB0YXJnZXRTdGF0ZSA9IHZvdGluZ0luZm8uZmlsdGVyKGZ1bmN0aW9uIChkKSB7XG4gICAgICAgIHJldHVybiBkLnN0YXRlID09IHN0YXRlO1xuICAgICAgfSlbMF07IC8vcmV0dXJuIGZpcnN0XG4gICAgICBpZiAoIXRhcmdldFN0YXRlKSByZXR1cm4gbnVsbDtcblxuICAgICAgdmFyIHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgICAgIHRvZGF5LnNldERhdGUodG9kYXkuZ2V0RGF0ZSgpIC0gMSk7XG5cbiAgICAgIGlmICh0b2RheSA8PSBuZXcgRGF0ZSh0YXJnZXRTdGF0ZS5yZWdpc3RyYXRpb25fZGVhZGxpbmUpKSB7XG4gICAgICAgIHJldHVybiBidWlsZFJlZ2lzdHJhdGlvbk1lc3NhZ2UodGFyZ2V0U3RhdGUpO1xuICAgICAgfSBlbHNlIGlmICh0b2RheSA8PSBuZXcgRGF0ZSh0YXJnZXRTdGF0ZS52b3RpbmdfZGF5KSkge1xuICAgICAgICBpZiAodGFyZ2V0U3RhdGUudHlwZSA9PSBcInByaW1hcmllc1wiKSB7XG4gICAgICAgICAgcmV0dXJuIGJ1aWxkUHJpbWFyeUluZm8odGFyZ2V0U3RhdGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vXG4gICAgICAgICAgcmV0dXJuIGJ1aWxkQ2F1Y3VzSW5mbyh0YXJnZXRTdGF0ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbW9kdWxlO1xuICB9O1xufShqUXVlcnkpO1xuXG4vLyBNb3JlIGV2ZW50c1xuKGZ1bmN0aW9uICgkKSB7XG4gICQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGV2ZW50LCBwYXJhbXMpIHtcbiAgICAkKFwiLmV2ZW50LXJzdnAtYWN0aXZpdHlcIikuaGlkZSgpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiLnJzdnAtbGluaywgLmV2ZW50LXJzdnAtYWN0aXZpdHlcIiwgZnVuY3Rpb24gKGV2ZW50LCBwYXJhbXMpIHtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfSk7XG5cbiAgLy9TaG93IGVtYWlsXG4gICQoZG9jdW1lbnQpLm9uKFwic2hvdy1ldmVudC1mb3JtXCIsIGZ1bmN0aW9uIChldmVudHMsIHRhcmdldCkge1xuICAgIHZhciBmb3JtID0gJCh0YXJnZXQpLmNsb3Nlc3QoXCIuZXZlbnQtaXRlbVwiKS5maW5kKFwiLmV2ZW50LXJzdnAtYWN0aXZpdHlcIik7XG5cbiAgICAvLyB2YXIgcGFyYW1zID0gICQuZGVwYXJhbSh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkgfHwgXCJcIik7XG4gICAgLy8gZm9ybS5maW5kKFwiaW5wdXRbbmFtZT16aXBjb2RlXVwiKS52YWwocGFyYW1zLnppcGNvZGUgPyBwYXJhbXMuemlwY29kZSA6IENvb2tpZXMuZ2V0KCdtYXAuYmVybmllLnppcGNvZGUnKSk7XG5cbiAgICBmb3JtLmZhZGVJbigxMDApO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbihcInN1Ym1pdFwiLCBcImZvcm0uZXZlbnQtZm9ybVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHF1ZXJ5ID0gJC5kZXBhcmFtKCQodGhpcykuc2VyaWFsaXplKCkpO1xuICAgIHZhciBwYXJhbXMgPSAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpIHx8IFwiXCIpO1xuICAgIHF1ZXJ5Wyd6aXBjb2RlJ10gPSBwYXJhbXNbJ3ppcGNvZGUnXSB8fCBxdWVyeVsnemlwY29kZSddO1xuXG4gICAgdmFyICRlcnJvciA9ICQodGhpcykuZmluZChcIi5ldmVudC1lcnJvclwiKTtcbiAgICB2YXIgJGNvbnRhaW5lciA9ICQodGhpcykuY2xvc2VzdChcIi5ldmVudC1yc3ZwLWFjdGl2aXR5XCIpO1xuXG4gICAgaWYgKHF1ZXJ5WydoYXNfc2hpZnQnXSA9PSAndHJ1ZScgJiYgKCFxdWVyeVsnc2hpZnRfaWQnXSB8fCBxdWVyeVsnc2hpZnRfaWQnXS5sZW5ndGggPT0gMCkpIHtcbiAgICAgICRlcnJvci50ZXh0KFwiWW91IG11c3QgcGljayBhIHNoaWZ0XCIpLnNob3coKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgc2hpZnRzID0gbnVsbDtcbiAgICB2YXIgZ3Vlc3RzID0gMDtcbiAgICBpZiAocXVlcnlbJ3NoaWZ0X2lkJ10pIHtcbiAgICAgIHNoaWZ0cyA9IHF1ZXJ5WydzaGlmdF9pZCddLmpvaW4oKTtcbiAgICB9XG5cbiAgICBpZiAoIXF1ZXJ5WydwaG9uZSddIHx8IHF1ZXJ5WydwaG9uZSddID09ICcnKSB7XG4gICAgICAkZXJyb3IudGV4dChcIlBob25lIG51bWJlciBpcyByZXF1aXJlZFwiKS5zaG93KCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFxdWVyeVsnZW1haWwnXSB8fCBxdWVyeVsnZW1haWwnXSA9PSAnJykge1xuICAgICAgJGVycm9yLnRleHQoXCJFbWFpbCBpcyByZXF1aXJlZFwiKS5zaG93KCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFxdWVyeVsnZW1haWwnXS50b1VwcGVyQ2FzZSgpLm1hdGNoKC9bQS1aMC05Ll8lKy1dK0BbQS1aMC05Li1dK1xcLltBLVpdezIsfSQvKSkge1xuICAgICAgJGVycm9yLnRleHQoXCJQbGVhc2UgaW5wdXQgdmFsaWQgZW1haWxcIikuc2hvdygpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIGlmICghcXVlcnlbJ25hbWUnXSB8fCBxdWVyeVsnbmFtZSddID09IFwiXCIpIHtcbiAgICAvLyAgICRlcnJvci50ZXh0KFwiUGxlYXNlIGluY2x1ZGUgeW91ciBuYW1lXCIpLnNob3coKTtcbiAgICAvLyAgIHJldHVybiBmYWxzZTtcbiAgICAvLyB9XG5cbiAgICAkKHRoaXMpLmZpbmQoXCIuZXZlbnQtZXJyb3JcIikuaGlkZSgpO1xuICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgJC5hamF4KHtcbiAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgIHVybDogJ2h0dHBzOi8vb3JnYW5pemUuYmVybmllc2FuZGVycy5jb20vZXZlbnRzL2FkZC1yc3ZwJyxcbiAgICAgIC8vIHVybDogJ2h0dHBzOi8vYmVybmllLWdyb3VuZC1jb250cm9sLXN0YWdpbmcuaGVyb2t1YXBwLmNvbS9ldmVudHMvYWRkLXJzdnAnLFxuICAgICAgY3Jvc3NEb21haW46IHRydWUsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgZGF0YToge1xuICAgICAgICAvLyBuYW1lOiBxdWVyeVsnbmFtZSddLFxuICAgICAgICBwaG9uZTogcXVlcnlbJ3Bob25lJ10sXG4gICAgICAgIGVtYWlsOiBxdWVyeVsnZW1haWwnXSxcbiAgICAgICAgemlwOiBxdWVyeVsnemlwY29kZSddLFxuICAgICAgICBzaGlmdF9pZHM6IHNoaWZ0cyxcbiAgICAgICAgZXZlbnRfaWRfb2JmdXNjYXRlZDogcXVlcnlbJ2lkX29iZnVzY2F0ZWQnXVxuICAgICAgfSxcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIHN1Y2Nlc3MoZGF0YSkge1xuICAgICAgICBDb29raWVzLnNldCgnbWFwLmJlcm5pZS56aXBjb2RlJywgcXVlcnlbJ3ppcGNvZGUnXSwgeyBleHBpcmVzOiA3IH0pO1xuICAgICAgICBDb29raWVzLnNldCgnbWFwLmJlcm5pZS5lbWFpbCcsIHF1ZXJ5WydlbWFpbCddLCB7IGV4cGlyZXM6IDcgfSk7XG4gICAgICAgIENvb2tpZXMuc2V0KCdtYXAuYmVybmllLm5hbWUnLCBxdWVyeVsnbmFtZSddLCB7IGV4cGlyZXM6IDcgfSk7XG5cbiAgICAgICAgaWYgKHF1ZXJ5WydwaG9uZSddICE9ICcnKSB7XG4gICAgICAgICAgQ29va2llcy5zZXQoJ21hcC5iZXJuaWUucGhvbmUnLCBxdWVyeVsncGhvbmUnXSwgeyBleHBpcmVzOiA3IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9TdG9yaW5nIHRoZSBldmVudHMgam9pbmVkXG4gICAgICAgIHZhciBldmVudHNfam9pbmVkID0gSlNPTi5wYXJzZShDb29raWVzLmdldCgnbWFwLmJlcm5pZS5ldmVudHNKb2luZWQuJyArIHF1ZXJ5WydlbWFpbCddKSB8fCBcIltdXCIpIHx8IFtdO1xuXG4gICAgICAgIGV2ZW50c19qb2luZWQucHVzaChxdWVyeVsnaWRfb2JmdXNjYXRlZCddKTtcbiAgICAgICAgQ29va2llcy5zZXQoJ21hcC5iZXJuaWUuZXZlbnRzSm9pbmVkLicgKyBxdWVyeVsnZW1haWwnXSwgZXZlbnRzX2pvaW5lZCwgeyBleHBpcmVzOiA3IH0pO1xuXG4gICAgICAgICR0aGlzLmNsb3Nlc3QoXCJsaVwiKS5hdHRyKFwiZGF0YS1hdHRlbmRpbmdcIiwgdHJ1ZSk7XG5cbiAgICAgICAgJHRoaXMuaHRtbChcIjxoNCBzdHlsZT0nYm9yZGVyLWJvdHRvbTogbm9uZSc+UlNWUCBTdWNjZXNzZnVsISBUaGFuayB5b3UgZm9yIGpvaW5pbmcgdG8gdGhpcyBldmVudCE8L2g0PlwiKTtcbiAgICAgICAgJGNvbnRhaW5lci5kZWxheSgxMDAwKS5mYWRlT3V0KCdmYXN0Jyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xufSkoalF1ZXJ5KTtcbiIsIihmdW5jdGlvbigkLCBkMykge1xuICB2YXIgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gICQoXCIjbG9hZGluZy1pY29uXCIpLnNob3coKTtcblxuICAkLmFqYXgoe1xuICAgIHVybDogJ2h0dHBzOi8vZG5iNmxlYW5neDZkYy5jbG91ZGZyb250Lm5ldC9vdXRwdXQvMzUwb3JnLmpzLmd6JywgLy8nfCoqREFUQV9TT1VSQ0UqKnwnLFxuICAgIGRhdGFUeXBlOiAnc2NyaXB0JyxcbiAgICBjYWNoZTogdHJ1ZSwgLy8gb3RoZXJ3aXNlIHdpbGwgZ2V0IGZyZXNoIGNvcHkgZXZlcnkgcGFnZSBsb2FkXG4gICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgZDMuY3N2KCcvL2QxeTBvdGFkaTNrbmY2LmNsb3VkZnJvbnQubmV0L2QvdXNfcG9zdGFsX2NvZGVzLmd6JyxcbiAgICAgICAgZnVuY3Rpb24oemlwY29kZXMpIHtcbiAgICAgICAgICAkKFwiI2xvYWRpbmctaWNvblwiKS5oaWRlKCk7XG4gICAgICAgICAgLy9DbGVhbiBkYXRhXG4gICAgICAgICAgd2luZG93LkVWRU5UU19EQVRBLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgZC5maWx0ZXJzID0gW107XG4gICAgICAgICAgICAvL1NldCBmaWx0ZXIgaW5mb1xuICAgICAgICAgICAgc3dpdGNoIChkLmV2ZW50X3R5cGUpIHtcbiAgICAgICAgICAgICAgY2FzZSBcIkdyb3VwXCI6XG4gICAgICAgICAgICAgICAgZC5maWx0ZXJzLnB1c2goJ2dyb3VwJyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgXCJBY3Rpb25cIjpcbiAgICAgICAgICAgICAgICBkLmZpbHRlcnMucHVzaCgnYWN0aW9uJyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgZC5maWx0ZXJzLnB1c2goJ290aGVyJyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGQuaXNfb2ZmaWNpYWwgPSBkLmlzX29mZmljaWFsID09IFwiMVwiO1xuICAgICAgICAgICAgaWYgKGQuaXNfb2ZmaWNpYWwpIHtcbiAgICAgICAgICAgICAgZC5maWx0ZXJzLnB1c2goXCJvZmZpY2lhbC1ldmVudFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICB2YXIgcGFyYW1zID0gJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSlcbiAgICAgICAgICB2YXIgb2xkRGF0ZSA9IG5ldyBEYXRlKCk7XG5cbiAgICAgICAgICAvKiBFeHRyYWN0IGRlZmF1bHQgbGF0IGxvbiAqL1xuICAgICAgICAgIHZhciBtID0gLy4qXFw/Yz0oLis/KSwoLis/KSwoXFxkKyl6Iz8uKi9nLmV4ZWMod2luZG93LmxvY2F0aW9uLmhyZWYpXG4gICAgICAgICAgaWYgKG0gJiYgbVsxXSAmJiBtWzJdICYmIG1bM10pIHtcbiAgICAgICAgICAgIHZhciBkZWZhdWx0Q29vcmQgPSB7XG4gICAgICAgICAgICAgIGNlbnRlcjogW3BhcnNlRmxvYXQobVsxXSksIHBhcnNlRmxvYXQobVsyXSldLFxuICAgICAgICAgICAgICB6b29tOiBwYXJzZUludChtWzNdKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHdpbmRvdy5tYXBNYW5hZ2VyID0gTWFwTWFuYWdlcih3aW5kb3cuRVZFTlRTX0RBVEEsIGNhbXBhaWduT2ZmaWNlcywgemlwY29kZXMsIHtcbiAgICAgICAgICAgICAgZGVmYXVsdENvb3JkOiBkZWZhdWx0Q29vcmRcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB3aW5kb3cubWFwTWFuYWdlci5maWx0ZXJCeUNvb3JkcyhkZWZhdWx0Q29vcmQuY2VudGVyLCA1MCwgcGFyYW1zLnNvcnQsIHBhcmFtcy5mKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2luZG93Lm1hcE1hbmFnZXIgPSBNYXBNYW5hZ2VyKHdpbmRvdy5FVkVOVFNfREFUQSwgbnVsbCwgemlwY29kZXMpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIExvYWQgQ29ubmVjdGljdXQgYXJlYVxuICAgICAgICAgIHZhciBkaXN0cmljdF9ib3VuZGFyeSA9IG5ldyBMLmdlb0pzb24obnVsbCwge1xuICAgICAgICAgICAgY2xpY2thYmxlOiBmYWxzZVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGRpc3RyaWN0X2JvdW5kYXJ5LmFkZFRvKHdpbmRvdy5tYXBNYW5hZ2VyLmdldE1hcCgpKTtcblxuICAgICAgICAgIC8qKiogVE9UQUxMWSBPUFRJT05BTCBBUkVBIEZPUiBGT0NVU0VEIEFSRUFTLiBFWEFNUExFIElTIENPTk5FVElDVVQgKioqL1xuICAgICAgICAgIC8qKiogVE9ETzogUmVwYWxhY2UvUmVtb3ZlIHRoaXMgKioqL1xuICAgICAgICAgIC8vICQuYWpheCh7XG4gICAgICAgICAgLy8gICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgLy8gICB1cmw6IFwiL2RhdGEvdGV4YXMuanNvblwiLFxuICAgICAgICAgIC8vICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIC8vICAgICAkKGRhdGEuZmVhdHVyZXNbMF0uZ2VvbWV0cnkpLmVhY2goZnVuY3Rpb24oa2V5LCBkYXRhKSB7XG4gICAgICAgICAgLy8gICAgICAgZGlzdHJpY3RfYm91bmRhcnlcbiAgICAgICAgICAvLyAgICAgICAgIC5hZGREYXRhKGRhdGEpXG4gICAgICAgICAgLy8gICAgICAgICAuc2V0U3R5bGUoe1xuICAgICAgICAgIC8vICAgICAgICAgICBmaWxsQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgICAgLy8gICAgICAgICAgIGNvbG9yOiAncmdiKDAsIDAsIDApJ1xuICAgICAgICAgIC8vICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gICAgICAgaWYgKCFwYXJhbXMuemlwY29kZSB8fCBwYXJhbXMuemlwY29kZSA9PT0gJycpIHtcbiAgICAgICAgICAvLyAgICAgICAgIHdpbmRvdy5tYXBNYW5hZ2VyLmdldE1hcCgpXG4gICAgICAgICAgLy8gICAgICAgICAgIC5maXRCb3VuZHMoZGlzdHJpY3RfYm91bmRhcnkuZ2V0Qm91bmRzKCksIHsgYW5pbWF0ZTogZmFsc2UgfSk7XG4gICAgICAgICAgLy8gICAgICAgfVxuICAgICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgICAvLyAgICAgZGlzdHJpY3RfYm91bmRhcnkuYnJpbmdUb0JhY2soKTtcbiAgICAgICAgICAvLyAgIH1cbiAgICAgICAgICAvLyB9KS5lcnJvcihmdW5jdGlvbigpIHt9KTtcblxuICAgICAgICAgIC8vIGlmICgkKFwiaW5wdXRbbmFtZT0nemlwY29kZSddXCIpLnZhbCgpID09ICcnICYmIENvb2tpZXMuZ2V0KCdtYXAuYmVybmllLnppcGNvZGUnKSAmJiB3aW5kb3cubG9jYXRpb24uaGFzaCA9PSAnJykge1xuICAgICAgICAgIC8vICAgJChcImlucHV0W25hbWU9J3ppcGNvZGUnXVwiKS52YWwoQ29va2llcy5nZXQoJ21hcC5iZXJuaWUuemlwY29kZScpKTtcbiAgICAgICAgICAvLyAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJChcIiNmaWx0ZXItZm9ybVwiKS5zZXJpYWxpemUoKTtcbiAgICAgICAgICAvLyB9IGVsc2Uge1xuICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKFwiaGFzaGNoYW5nZVwiKTtcbiAgICAgICAgICAvLyB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgLyoqIGluaXRpYWwgbG9hZGluZyBiZWZvcmUgYWN0aXZhdGluZyBsaXN0ZW5lcnMuLi4qL1xuICB2YXIgcGFyYW1zID0gJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSk7XG4gIGlmIChwYXJhbXMuemlwY29kZSkge1xuICAgICQoXCJpbnB1dFtuYW1lPSd6aXBjb2RlJ11cIikudmFsKHBhcmFtcy56aXBjb2RlKTtcbiAgfVxuXG4gIGlmIChwYXJhbXMuZGlzdGFuY2UpIHtcbiAgICAkKFwic2VsZWN0W25hbWU9J2Rpc3RhbmNlJ11cIikudmFsKHBhcmFtcy5kaXN0YW5jZSk7XG4gIH1cbiAgaWYgKHBhcmFtcy5zb3J0KSB7XG4gICAgJChcInNlbGVjdFtuYW1lPSdzb3J0J11cIikudmFsKHBhcmFtcy5zb3J0KTtcbiAgfVxuXG4gIC8qIFByZXBhcmUgZmlsdGVycyAqL1xuICAkKFwiI2ZpbHRlci1saXN0XCIpLmFwcGVuZChcbiAgICB3aW5kb3cuZXZlbnRUeXBlRmlsdGVycy5tYXAoZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuICQoXCI8bGkgLz5cIilcbiAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAkKFwiPGlucHV0IHR5cGU9J2NoZWNrYm94JyBjbGFzcz0nZmlsdGVyLXR5cGUnIC8+XCIpXG4gICAgICAgICAgLmF0dHIoJ25hbWUnLCAnZltdJylcbiAgICAgICAgICAuYXR0cihcInZhbHVlXCIsIGQuaWQpXG4gICAgICAgICAgLmF0dHIoXCJpZFwiLCBkLmlkKVxuICAgICAgICAgIC5wcm9wKFwiY2hlY2tlZFwiLCAhcGFyYW1zLmYgPyB0cnVlIDogJC5pbkFycmF5KGQuaWQsIHBhcmFtcy5mKSA+PSAwKVxuICAgICAgICApXG4gICAgICAgIC5hcHBlbmQoJChcIjxsYWJlbCAvPlwiKS5hdHRyKCdmb3InLCBkLmlkKVxuICAgICAgICAuYXBwZW5kKCQoXCI8c3BhbiAvPlwiKS5hZGRDbGFzcygnZmlsdGVyLW9uJylcbiAgICAgICAgLmFwcGVuZChkLm9uSXRlbSA/IGQub25JdGVtIDogJChcIjxzcGFuPlwiKS5hZGRDbGFzcygnY2lyY2xlLWJ1dHRvbiBkZWZhdWx0LW9uJykpKVxuICAgICAgICAuYXBwZW5kKCQoXCI8c3BhbiAvPlwiKS5hZGRDbGFzcygnZmlsdGVyLW9mZicpXG4gICAgICAgIC5hcHBlbmQoZC5vZmZJdGVtID8gZC5vZmZJdGVtIDogJChcIjxzcGFuPlwiKS5hZGRDbGFzcygnY2lyY2xlLWJ1dHRvbiBkZWZhdWx0LW9mZicpKSlcbiAgICAgICAgLmFwcGVuZCgkKFwiPHNwYW4+XCIpLnRleHQoZC5uYW1lKSkpO1xuICAgIH0pXG4gICk7XG4gIC8qKipcbiAgICogIGRlZmluZSBldmVudHNcbiAgICovXG4gIC8vb25seSBudW1iZXJzXG4gICQoXCJpbnB1dFtuYW1lPSd6aXBjb2RlJ11cIikub24oJ2tleXVwIGtleWRvd24nLCBmdW5jdGlvbihlKSB7XG4gICAgaWYgKGUudHlwZSA9PSAna2V5ZG93bicgJiYgKGUua2V5Q29kZSA8IDQ4IHx8IGUua2V5Q29kZSA+IDU3KSAmJlxuICAgICAgZS5rZXlDb2RlICE9IDggJiYgIShlLmtleUNvZGUgPj0gMzcgfHwgZS5rZXlDb2RlIDw9IDQwKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChlLnR5cGUgPT0gJ2tleXVwJyAmJiAkKHRoaXMpLnZhbCgpLmxlbmd0aCA9PSA1KSB7XG4gICAgICBpZiAoIShlLmtleUNvZGUgPj0gMzcgJiYgZS5rZXlDb2RlIDw9IDQwKSkge1xuICAgICAgICAkKHRoaXMpLmNsb3Nlc3QoXCJmb3JtI2ZpbHRlci1mb3JtXCIpLnN1Ym1pdCgpO1xuICAgICAgICAkKFwiI2hpZGRlbi1idXR0b25cIikuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIC8qKipcbiAgICogIG9uY2hhbmdlIG9mIHNlbGVjdFxuICAgKi9cbiAgJChcInNlbGVjdFtuYW1lPSdkaXN0YW5jZSddLHNlbGVjdFtuYW1lPSdzb3J0J11cIikub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGUpIHtcbiAgICAkKHRoaXMpLmNsb3Nlc3QoXCJmb3JtI2ZpbHRlci1mb3JtXCIpLnN1Ym1pdCgpO1xuICB9KTtcblxuICAvKipcbiAgICogT24gZmlsdGVyIHR5cGUgY2hhbmdlXG4gICAqL1xuICAkKFwiLmZpbHRlci10eXBlXCIpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihlKSB7XG4gICAgJCh0aGlzKS5jbG9zZXN0KFwiZm9ybSNmaWx0ZXItZm9ybVwiKS5zdWJtaXQoKTtcbiAgfSlcblxuICAvL09uIHN1Ym1pdFxuICAkKFwiZm9ybSNmaWx0ZXItZm9ybVwiKS5vbignc3VibWl0JywgZnVuY3Rpb24oZSkge1xuICAgIHZhciBzZXJpYWwgPSAkKHRoaXMpLnNlcmlhbGl6ZSgpO1xuICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gc2VyaWFsO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xuXG4gICQod2luZG93KS5vbignaGFzaGNoYW5nZScsIGZ1bmN0aW9uKGUpIHtcblxuICAgIHZhciBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgaWYgKGhhc2gubGVuZ3RoID09IDAgfHwgaGFzaC5zdWJzdHJpbmcoMSkgPT0gMCkge1xuICAgICAgJChcIiNsb2FkaW5nLWljb25cIikuaGlkZSgpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBwYXJhbXMgPSAkLmRlcGFyYW0oaGFzaC5zdWJzdHJpbmcoMSkpO1xuXG4gICAgLy9DdXN0b20gZmVhdHVyZSBmb3Igc3BlY2lmaWMgZGVmYXVsdCBsYXQvbG9uXG4gICAgLy9sYXQ9NDAuNzQxNTQ3OSZsb249LTczLjgyMzk2MDkmem9vbT0xN1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkKFwiI2xvYWRpbmctaWNvblwiKS5zaG93KCk7XG5cbiAgICAgIGlmICh3aW5kb3cubWFwTWFuYWdlci5fb3B0aW9ucyAmJiB3aW5kb3cubWFwTWFuYWdlci5fb3B0aW9ucy5kZWZhdWx0Q29vcmQgJiYgcGFyYW1zLnppcGNvZGUubGVuZ3RoICE9IDUpIHtcbiAgICAgICAgd2luZG93Lm1hcE1hbmFnZXIuZmlsdGVyQnlUeXBlKHBhcmFtcy5mKTtcbiAgICAgICAgd2luZG93Lm1hcE1hbmFnZXIuZmlsdGVyQnlDb29yZHMod2luZG93Lm1hcE1hbmFnZXIuX29wdGlvbnMuZGVmYXVsdENvb3JkLmNlbnRlciwgcGFyYW1zLmRpc3RhbmNlLCBwYXJhbXMuc29ydCwgcGFyYW1zLmYpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2luZG93Lm1hcE1hbmFnZXIuZmlsdGVyQnlUeXBlKHBhcmFtcy5mKTtcbiAgICAgICAgd2luZG93Lm1hcE1hbmFnZXIuZmlsdGVyKHBhcmFtcy56aXBjb2RlLCBwYXJhbXMuZGlzdGFuY2UsIHBhcmFtcy5zb3J0LCBwYXJhbXMuZik7XG4gICAgICB9XG4gICAgICAkKFwiI2xvYWRpbmctaWNvblwiKS5oaWRlKCk7XG5cbiAgICB9LCAxMCk7XG4gICAgLy8gJChcIiNsb2FkaW5nLWljb25cIikuaGlkZSgpO1xuICAgIGlmIChwYXJhbXMuemlwY29kZS5sZW5ndGggPT0gNSAmJiAkKFwiYm9keVwiKS5oYXNDbGFzcyhcImluaXRpYWwtdmlld1wiKSkge1xuICAgICAgJChcIiNldmVudHNcIikucmVtb3ZlQ2xhc3MoXCJzaG93LXR5cGUtZmlsdGVyXCIpO1xuICAgICAgJChcImJvZHlcIikucmVtb3ZlQ2xhc3MoXCJpbml0aWFsLXZpZXdcIik7XG4gICAgfVxuICB9KTtcblxuICB2YXIgcHJlID0gJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSk7XG4gIGlmICgkKFwiYm9keVwiKS5oYXNDbGFzcyhcImluaXRpYWwtdmlld1wiKSkge1xuICAgIGlmICgkKHdpbmRvdykud2lkdGgoKSA+PSA2MDAgJiYgKCFwcmUuemlwY29kZSB8fCBwcmUgJiYgcHJlLnppcGNvZGUubGVuZ3RoICE9IDUpKSB7XG4gICAgICAkKFwiI2V2ZW50c1wiKS5hZGRDbGFzcyhcInNob3ctdHlwZS1maWx0ZXJcIik7XG4gICAgfVxuICB9XG5cblxufSkoalF1ZXJ5LCBkMyk7XG4iXX0=
