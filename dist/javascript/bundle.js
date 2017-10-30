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
    this.props.start_datetime = properties.start_datetime;
    this.props.address = properties.venue;
    this.props.supergroup = properties.supergroup;
    this.props.start_time = moment(properties.start_datetime, 'YYYY-MM-DDTHH:mm:ss')._d;

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
          L.circleMarker(item.latLng, { radius: 4, className: item.className, color: 'white', fillColor: 'rgb(255,97,18)', opacity: 0.6, fillOpacity: 0.9, weight: 2 }).on('click', function (e) {
            _popupEvents(e);
          }).addTo(overlays);
        } else {
          L.circleMarker(item.latLng, { radius: 5, className: item.className, color: 'white', fillColor: 'rgb(255,97,18)', opacity: 0.8, fillOpacity: 0.7, weight: 2 }).on('click', function (e) {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvZXZlbnQtdHlwZXMuanMiLCJjbGFzc2VzL2V2ZW50LmpzIiwiY2xhc3Nlcy9tYXAtbWFuYWdlci5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJ3aW5kb3ciLCJldmVudFR5cGVGaWx0ZXJzIiwibmFtZSIsImlkIiwiRXZlbnQiLCIkIiwicHJvcGVydGllcyIsImJsaXAiLCJjbGFzc05hbWUiLCJldmVudF90eXBlIiwicmVwbGFjZSIsInRvTG93ZXJDYXNlIiwicHJvcHMiLCJ0aXRsZSIsInVybCIsInN0YXJ0X2RhdGV0aW1lIiwiYWRkcmVzcyIsInZlbnVlIiwic3VwZXJncm91cCIsInN0YXJ0X3RpbWUiLCJtb21lbnQiLCJfZCIsIkRhdGUiLCJ2YWx1ZU9mIiwiZ3JvdXAiLCJMYXRMbmciLCJwYXJzZUZsb2F0IiwibGF0IiwibG5nIiwiZmlsdGVycyIsInNvY2lhbCIsImZhY2Vib29rIiwiZW1haWwiLCJwaG9uZSIsInR3aXR0ZXIiLCJyZW5kZXIiLCJkaXN0YW5jZSIsInppcGNvZGUiLCJ0aGF0IiwicmVuZGVyX2dyb3VwIiwicmVuZGVyX2V2ZW50IiwibG9uIiwic29jaWFsX2h0bWwiLCJuZXdfd2luZG93IiwibWF0Y2giLCJyZW5kZXJlZCIsImFkZENsYXNzIiwiaHRtbCIsImRhdGV0aW1lIiwiZm9ybWF0IiwialF1ZXJ5IiwiTWFwTWFuYWdlciIsImQzIiwibGVhZmxldCIsImV2ZW50RGF0YSIsImNhbXBhaWduT2ZmaWNlcyIsInppcGNvZGVzIiwib3B0aW9ucyIsImFsbEZpbHRlcnMiLCJtYXAiLCJpIiwicG9wdXAiLCJMIiwicmVkdWNlIiwiemlwcyIsIml0ZW0iLCJ6aXAiLCJjdXJyZW50X2ZpbHRlcnMiLCJjdXJyZW50X3ppcGNvZGUiLCJjdXJyZW50X2Rpc3RhbmNlIiwiY3VycmVudF9zb3J0Iiwib3JpZ2luYWxFdmVudExpc3QiLCJkIiwiZXZlbnRzTGlzdCIsInNsaWNlIiwibWFwYm94VGlsZXMiLCJ0aWxlTGF5ZXIiLCJtYXhab29tIiwiYXR0cmlidXRpb24iLCJDQU1QQUlHTl9PRkZJQ0VfSUNPTiIsImljb24iLCJpY29uVXJsIiwiaWNvblNpemUiLCJHT1RWX0NFTlRFUl9JQ09OIiwiZGVmYXVsdENvb3JkIiwiY2VudGVyIiwiem9vbSIsImNlbnRyYWxNYXAiLCJNYXAiLCJjdXN0b21NYXBDb29yZCIsImFkZExheWVyIiwib3ZlcmxheXMiLCJsYXllckdyb3VwIiwiYWRkVG8iLCJvZmZpY2VzIiwiZ290dkNlbnRlciIsImNhbXBhaWduT2ZmaWNlTGF5ZXIiLCJmaWx0ZXJlZEV2ZW50cyIsIm1vZHVsZSIsIl9wb3B1cEV2ZW50cyIsImV2ZW50IiwidGFyZ2V0IiwiX2xhdGxuZyIsImZpbHRlcmVkIiwiZmlsdGVyIiwibGVuZ3RoIiwibm90Iiwic29ydCIsImEiLCJiIiwiZGl2IiwiYXBwZW5kIiwiaXNGdWxsIiwidmlzaWJsZSIsInNldFRpbWVvdXQiLCJzZXRMYXRMbmciLCJzZXRDb250ZW50Iiwib3Blbk9uIiwiaW5pdGlhbGl6ZSIsInVuaXF1ZUxvY3MiLCJhcnIiLCJqb2luIiwiaW5kZXhPZiIsInB1c2giLCJzcGxpdCIsImxhdExuZyIsImZvckVhY2giLCJjaXJjbGVNYXJrZXIiLCJyYWRpdXMiLCJjb2xvciIsImZpbGxDb2xvciIsIm9wYWNpdHkiLCJmaWxsT3BhY2l0eSIsIndlaWdodCIsIm9uIiwiZSIsInRvTWlsZSIsIm1ldGVyIiwiZmlsdGVyRXZlbnRzQnlDb29yZHMiLCJmaWx0ZXJUeXBlcyIsInppcExhdExuZyIsImRpc3QiLCJkaXN0YW5jZVRvIiwiTWF0aCIsInJvdW5kIiwiZmlsdGVyRXZlbnRzIiwic29ydEV2ZW50cyIsInNvcnRUeXBlIiwiX2V2ZW50c0xpc3QiLCJfemlwY29kZXMiLCJfb3B0aW9ucyIsIl9yZWZyZXNoTWFwIiwiY2xlYXJMYXllcnMiLCJmaWx0ZXJCeVR5cGUiLCJ0eXBlIiwidG9IaWRlIiwic3BsaWNlIiwiZmluZCIsImhpZGUiLCJzaG93IiwicmVtb3ZlTGF5ZXIiLCJmaWx0ZXJCeUNvb3JkcyIsImNvb3JkcyIsInNlbGVjdCIsInNlbGVjdEFsbCIsInJlbW92ZSIsInBhcnNlSW50IiwiZXZlbnRMaXN0IiwiZGF0YSIsImVudGVyIiwiYXR0ciIsImNsYXNzZWQiLCJleGl0IiwiYWRkaGlnaGxpZ2h0ZWRNYXJrZXIiLCJoaWdobGlnaHRlZE1hcmtlciIsIm1vdXNlb3V0IiwibW91c2VvdmVyIiwidG9nZ2xlQ2xhc3MiLCJjTWFya2VyTGF0IiwiY2hpbGRyZW4iLCJjTWFya2VyTG9uIiwiYXBwZW5kVG8iLCJvZmZpY2VDb3VudCIsInRleHQiLCJwYXJlbnQiLCJ0YXJnZXRaaXBjb2RlIiwidW5kZWZpbmVkIiwic2V0VmlldyIsInRvTWFwVmlldyIsInJlbW92ZUNsYXNzIiwiaW52YWxpZGF0ZVNpemUiLCJfb25SZXNpemUiLCJ0b0xpc3RWaWV3IiwiZ2V0TWFwIiwiVm90aW5nSW5mb01hbmFnZXIiLCJ2b3RpbmdJbmZvIiwiYnVpbGRSZWdpc3RyYXRpb25NZXNzYWdlIiwic3RhdGUiLCIkbXNnIiwicmVnaXN0cmF0aW9uX2RlYWRsaW5lIiwiaXNfb3BlbiIsInlvdV9tdXN0IiwiYnVpbGRQcmltYXJ5SW5mbyIsInZvdGluZ19kYXkiLCJidWlsZENhdWN1c0luZm8iLCJnZXRJbmZvIiwidGFyZ2V0U3RhdGUiLCJ0b2RheSIsInNldERhdGUiLCJnZXREYXRlIiwiZG9jdW1lbnQiLCJwYXJhbXMiLCJzdG9wUHJvcGFnYXRpb24iLCJldmVudHMiLCJmb3JtIiwiY2xvc2VzdCIsImZhZGVJbiIsInF1ZXJ5IiwiZGVwYXJhbSIsInNlcmlhbGl6ZSIsImxvY2F0aW9uIiwiaGFzaCIsInN1YnN0cmluZyIsIiRlcnJvciIsIiRjb250YWluZXIiLCJzaGlmdHMiLCJndWVzdHMiLCJ0b1VwcGVyQ2FzZSIsIiR0aGlzIiwiYWpheCIsImNyb3NzRG9tYWluIiwiZGF0YVR5cGUiLCJzaGlmdF9pZHMiLCJldmVudF9pZF9vYmZ1c2NhdGVkIiwic3VjY2VzcyIsIkNvb2tpZXMiLCJzZXQiLCJleHBpcmVzIiwiZXZlbnRzX2pvaW5lZCIsIkpTT04iLCJwYXJzZSIsImdldCIsImRlbGF5IiwiZmFkZU91dCIsImRhdGUiLCJjYWNoZSIsImNzdiIsIkVWRU5UU19EQVRBIiwiaXNfb2ZmaWNpYWwiLCJvbGREYXRlIiwibSIsImV4ZWMiLCJocmVmIiwibWFwTWFuYWdlciIsImYiLCJkaXN0cmljdF9ib3VuZGFyeSIsImdlb0pzb24iLCJjbGlja2FibGUiLCJ0cmlnZ2VyIiwidmFsIiwicHJvcCIsImluQXJyYXkiLCJvbkl0ZW0iLCJvZmZJdGVtIiwia2V5Q29kZSIsInN1Ym1pdCIsImZvY3VzIiwic2VyaWFsIiwicHJldmVudERlZmF1bHQiLCJoYXNDbGFzcyIsInByZSIsIndpZHRoIl0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0FBLE9BQU9DLGdCQUFQLEdBQTBCO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0VDLFFBQU0sUUFEUjtBQUVFQyxNQUFJO0FBRk4sQ0FQd0IsRUFXeEI7QUFDRUQsUUFBTSxPQURSO0FBRUVDLE1BQUk7QUFGTixDQVh3QixDQUExQjs7O0FDREE7QUFDQSxJQUFJQyxRQUFRLFVBQVVDLENBQVYsRUFBYTtBQUN2QixTQUFPLFVBQVVDLFVBQVYsRUFBc0I7O0FBRTNCLFNBQUtBLFVBQUwsR0FBa0JBLFVBQWxCOztBQUVBLFNBQUtDLElBQUwsR0FBWSxJQUFaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFLQyxTQUFMLEdBQWlCRixXQUFXRyxVQUFYLENBQXNCQyxPQUF0QixDQUE4QixTQUE5QixFQUF5QyxHQUF6QyxFQUE4Q0MsV0FBOUMsRUFBakI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFLQyxLQUFMLEdBQWEsRUFBYjtBQUNBLFNBQUtBLEtBQUwsQ0FBV0MsS0FBWCxHQUFtQlAsV0FBV08sS0FBOUI7QUFDQSxTQUFLRCxLQUFMLENBQVdFLEdBQVgsR0FBaUJSLFdBQVdRLEdBQTVCLENBdEIyQixDQXNCTTtB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RCtLLE9BQU94RyxJQUFqRSxFQUF1RXdHLE9BQU8yQyxDQUE5RTtBQUNEO0FBQ0R6UCxRQUFFLGVBQUYsRUFBbUJ5SixJQUFuQjtBQUVELEtBWkQsRUFZRyxFQVpIO0FBYUE7QUFDQSxRQUFJcUQsT0FBTzlLLE9BQVAsQ0FBZW9FLE1BQWYsSUFBeUIsQ0FBekIsSUFBOEJwRyxFQUFFLE1BQUYsRUFBVXdRLFFBQVYsQ0FBbUIsY0FBbkIsQ0FBbEMsRUFBc0U7QUFDcEV4USxRQUFFLFNBQUYsRUFBYXdMLFdBQWIsQ0FBeUIsa0JBQXpCO0FBQ0F4TCxRQUFFLE1BQUYsRUFBVXdMLFdBQVYsQ0FBc0IsY0FBdEI7QUFDRDtBQUNGLEdBOUJEOztBQWdDQSxNQUFJaUYsTUFBTXpRLEVBQUVxTixPQUFGLENBQVUxTixPQUFPNE4sUUFBUCxDQUFnQkMsSUFBaEIsQ0FBcUJDLFNBQXJCLENBQStCLENBQS9CLENBQVYsQ0FBVjtBQUNBLE1BQUl6TixFQUFFLE1BQUYsRUFBVXdRLFFBQVYsQ0FBbUIsY0FBbkIsQ0FBSixFQUF3QztBQUN0QyxRQUFJeFEsRUFBRUwsTUFBRixFQUFVK1EsS0FBVixNQUFxQixHQUFyQixLQUE2QixDQUFDRCxJQUFJek8sT0FBTCxJQUFnQnlPLE9BQU9BLElBQUl6TyxPQUFKLENBQVlvRSxNQUFaLElBQXNCLENBQTFFLENBQUosRUFBa0Y7QUFDaEZwRyxRQUFFLFNBQUYsRUFBYXlDLFFBQWIsQ0FBc0Isa0JBQXRCO0FBQ0Q7QUFDRjtBQUdGLENBMU1ELEVBME1HSSxNQTFNSCxFQTBNV0UsRUExTVgiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gR2xvYmFsXG53aW5kb3cuZXZlbnRUeXBlRmlsdGVycyA9IFtcbiAgLy8ge1xuICAvLyAgIG5hbWU6ICdDYW1wYWlnbiBPZmZpY2UnLFxuICAvLyAgIGlkOiAnY2FtcGFpZ24tb2ZmaWNlJyxcbiAgLy8gICBvbkl0ZW06IFwiPGltZyBzdHlsZT0nd2lkdGg6IDE0cHg7IGhlaWdodDogMTRweDsnIHNyYz0nL2ltZy9pY29uL3N0YXIucG5nJyAvPlwiLFxuICAvLyAgIG9mZkl0ZW06IFwiPGltZyBzdHlsZT0nd2lkdGg6IDE0cHg7IGhlaWdodDogMTRweDsnIHNyYz0nL2ltZy9pY29uL3N0YXItZ3JheS5wbmcnIC8+XCJcbiAgLy8gfVxuICB7XG4gICAgbmFtZTogJ0FjdGlvbicsXG4gICAgaWQ6ICdhY3Rpb24nXG4gIH0sXG4gIHtcbiAgICBuYW1lOiAnR3JvdXAnLFxuICAgIGlkOiAnZ3JvdXAnXG4gIH1cbl07XG4iLCIvL0NyZWF0ZSBhbiBldmVudCBub2RlXG52YXIgRXZlbnQgPSBmdW5jdGlvbiAoJCkge1xuICByZXR1cm4gZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcblxuICAgIHRoaXMucHJvcGVydGllcyA9IHByb3BlcnRpZXM7XG5cbiAgICB0aGlzLmJsaXAgPSBudWxsO1xuICAgIC8vIC8vIHRoaXMudGl0bGUgPSBwcm9wZXJ0aWVzLmZpZWxkXzY1O1xuICAgIC8vIHRoaXMudXJsID0gcHJvcGVydGllcy5maWVsZF82OF9yYXcudXJsO1xuICAgIC8vIHRoaXMuYWRkcmVzcyA9IHByb3BlcnRpZXMuZmllbGRfNjQ7XG4gICAgLy8gdGhpcy5saXN0aW5nID0gbnVsbDtcbiAgICB0aGlzLmNsYXNzTmFtZSA9IHByb3BlcnRpZXMuZXZlbnRfdHlwZS5yZXBsYWNlKC9bXlxcd10vaWcsIFwiLVwiKS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgLy8gaWYgKHByb3BlcnRpZXMudXJsKSB7XG4gICAgLy8gICBwcm9wZXJ0aWVzLnVybCA9IHByb3BlcnRpZXMuZmFjZWJvb2sgPyBwcm9wZXJ0aWVzLmZhY2Vib29rIDogKFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXMudHdpdHRlciA/IHByb3BlcnRpZXMudHdpdHRlciA6IG51bGxcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgKVxuICAgIC8vICAgaWYgKCFwcm9wZXJ0aWVzLnVybCkge1xuICAgIC8vICAgICByZXR1cm4gbnVsbDtcbiAgICAvLyAgIH1cbiAgICAvLyB9XG5cbiAgICB0aGlzLnByb3BzID0ge307XG4gICAgdGhpcy5wcm9wcy50aXRsZSA9IHByb3BlcnRpZXMudGl0bGU7XG4gICAgdGhpcy5wcm9wcy51cmwgPSBwcm9wZXJ0aWVzLnVybDsgLy9wcm9wZXJ0aWVzLnVybC5tYXRjaCgvXkAvZykgPyBgaHR0cDovL3R3aXR0ZXIuY29tLyR7cHJvcGVydGllcy51cmx9YCA6IHByb3BlcnRpZXMudXJsO1xuICAgIHRoaXMucHJvcHMuc3RhcnRfZGF0ZXRpbWUgPSBwcm9wZXJ0aWVzLnN0YXJ0X2RhdGV0aW1lO1xuICAgIHRoaXMucHJvcHMuYWRkcmVzcyA9IHByb3BlcnRpZXMudmVudWU7XG4gICAgdGhpcy5wcm9wcy5zdXBlcmdyb3VwID0gcHJvcGVydGllcy5zdXBlcmdyb3VwO1xuICAgIHRoaXMucHJvcHMuc3RhcnRfdGltZSA9IG1vbWVudChwcm9wZXJ0aWVzLnN0YXJ0X2RhdGV0aW1lLCAnWVlZWS1NTS1ERFRISDptbTpzcycpLl9kO1xuXG4gICAgLy8gUmVtb3ZlIHRoZSB0aW1lem9uZSBpc3N1ZSBmcm9tXG4gICAgdGhpcy5wcm9wcy5zdGFydF90aW1lID0gbmV3IERhdGUodGhpcy5wcm9wcy5zdGFydF90aW1lLnZhbHVlT2YoKSk7XG4gICAgdGhpcy5wcm9wcy5ncm91cCA9IHByb3BlcnRpZXMuZ3JvdXA7XG4gICAgdGhpcy5wcm9wcy5MYXRMbmcgPSBbcGFyc2VGbG9hdChwcm9wZXJ0aWVzLmxhdCksIHBhcnNlRmxvYXQocHJvcGVydGllcy5sbmcpXTtcbiAgICB0aGlzLnByb3BzLmV2ZW50X3R5cGUgPSBwcm9wZXJ0aWVzLmV2ZW50X3R5cGU7XG4gICAgdGhpcy5wcm9wcy5sYXQgPSBwcm9wZXJ0aWVzLmxhdDtcbiAgICB0aGlzLnByb3BzLmxuZyA9IHByb3BlcnRpZXMubG5nO1xuICAgIHRoaXMucHJvcHMuZmlsdGVycyA9IHByb3BlcnRpZXMuZmlsdGVycztcblxuICAgIHRoaXMucHJvcHMuc29jaWFsID0ge1xuICAgICAgZmFjZWJvb2s6IHByb3BlcnRpZXMuZmFjZWJvb2ssXG4gICAgICBlbWFpbDogcHJvcGVydGllcy5lbWFpbCxcbiAgICAgIHBob25lOiBwcm9wZXJ0aWVzLnBob25lLFxuICAgICAgdHdpdHRlcjogcHJvcGVydGllcy50d2l0dGVyXG4gICAgfTtcblxuICAgIHRoaXMucmVuZGVyID0gZnVuY3Rpb24gKGRpc3RhbmNlLCB6aXBjb2RlKSB7XG5cbiAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgLy8gdmFyIGVuZHRpbWUgPSB0aGF0LmVuZFRpbWUgPyBtb21lbnQodGhhdC5lbmRUaW1lKS5mb3JtYXQoXCJoOm1tYVwiKSA6IG51bGw7XG5cbiAgICAgIGlmICh0aGlzLnByb3BzLmV2ZW50X3R5cGUgPT09ICdHcm91cCcpIHtcbiAgICAgICAgcmV0dXJuIHRoYXQucmVuZGVyX2dyb3VwKGRpc3RhbmNlLCB6aXBjb2RlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGF0LnJlbmRlcl9ldmVudChkaXN0YW5jZSwgemlwY29kZSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMucmVuZGVyX2dyb3VwID0gZnVuY3Rpb24gKGRpc3RhbmNlLCB6aXBjb2RlKSB7XG4gICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgIHZhciBsYXQgPSB0aGF0LnByb3BzLmxhdDtcbiAgICAgIHZhciBsb24gPSB0aGF0LnByb3BzLmxuZztcblxuICAgICAgdmFyIHNvY2lhbF9odG1sID0gJyc7XG5cbiAgICAgIGlmICh0aGF0LnByb3BzLnNvY2lhbCkge1xuICAgICAgICBpZiAodGhhdC5wcm9wcy5zb2NpYWwuZmFjZWJvb2sgIT09ICcnKSB7XG4gICAgICAgICAgc29jaWFsX2h0bWwgKz0gJzxhIGhyZWY9XFwnJyArIHRoYXQucHJvcHMuc29jaWFsLmZhY2Vib29rICsgJ1xcJyB0YXJnZXQ9XFwnX2JsYW5rXFwnPjxpbWcgc3JjPVxcJy9pbWcvaWNvbi9mYWNlYm9vay5wbmdcXCcgLz48L2E+JztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhhdC5wcm9wcy5zb2NpYWwudHdpdHRlciAhPT0gJycpIHtcbiAgICAgICAgICBzb2NpYWxfaHRtbCArPSAnPGEgaHJlZj1cXCcnICsgdGhhdC5wcm9wcy5zb2NpYWwudHdpdHRlciArICdcXCcgdGFyZ2V0PVxcJ19ibGFua1xcJz48aW1nIHNyYz1cXCcvaW1nL2ljb24vdHdpdHRlci5wbmdcXCcgLz48L2E+JztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhhdC5wcm9wcy5zb2NpYWwuZW1haWwgIT09ICcnKSB7XG4gICAgICAgICAgc29jaWFsX2h0bWwgKz0gJzxhIGhyZWY9XFwnbWFpbHRvOicgKyB0aGF0LnByb3BzLnNvY2lhbC5lbWFpbCArICdcXCcgPjxpbWcgc3JjPVxcJy9pbWcvaWNvbi9tYWlsY2hpbXAucG5nXFwnIC8+PC9hPic7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoYXQucHJvcHMuc29jaWFsLnBob25lICE9PSAnJykge1xuICAgICAgICAgIHNvY2lhbF9odG1sICs9ICcmbmJzcDs8aW1nIHNyYz1cXCcvaW1nL2ljb24vcGhvbmUucG5nXFwnIC8+PHNwYW4+JyArIHRoYXQucHJvcHMuc29jaWFsLnBob25lICsgJzwvc3Bhbj4nO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBuZXdfd2luZG93ID0gdHJ1ZTtcbiAgICAgIGlmICh0aGF0LnByb3BzLnVybC5tYXRjaCgvXm1haWx0by9nKSkge1xuICAgICAgICBuZXdfd2luZG93ID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHZhciByZW5kZXJlZCA9ICQoXCI8ZGl2IGNsYXNzPW1vbnRzZXJyYXQvPlwiKS5hZGRDbGFzcygnZXZlbnQtaXRlbSAnICsgdGhhdC5jbGFzc05hbWUpLmh0bWwoJ1xcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1pdGVtIGxhdG8gJyArIHRoYXQuY2xhc3NOYW1lICsgJ1wiIGxhdD1cIicgKyBsYXQgKyAnXCIgbG9uPVwiJyArIGxvbiArICdcIj5cXG4gICAgICAgICAgICAgIDxoNSBjbGFzcz1cInRpbWUtaW5mb1wiPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRpbWUtaW5mby1kaXN0XCI+JyArIChkaXN0YW5jZSA/IGRpc3RhbmNlICsgXCJtaSZuYnNwOyZuYnNwO1wiIDogXCJcIikgKyAnPC9zcGFuPlxcbiAgICAgICAgICAgICAgPC9oNT5cXG4gICAgICAgICAgICAgIDxoMz5cXG4gICAgICAgICAgICAgICAgPGEgJyArIChuZXdfd2luZG93ID8gJ3RhcmdldD1cIl9ibGFua1wiJyA6ICcnKSArICcgaHJlZj1cIicgKyB0aGF0LnByb3BzLnVybCArICdcIj4nICsgdGhhdC5wcm9wcy50aXRsZSArICc8L2E+XFxuICAgICAgICAgICAgICA8L2gzPlxcbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJsYWJlbC1pY29uXCI+PC9zcGFuPlxcbiAgICAgICAgICAgICAgPGg1IGNsYXNzPVwiZXZlbnQtdHlwZVwiPicgKyB0aGF0LnByb3BzLmV2ZW50X3R5cGUgKyAnPC9oNT5cXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFwnZXZlbnQtc29jaWFsXFwnPlxcbiAgICAgICAgICAgICAgICAnICsgc29jaWFsX2h0bWwgKyAnXFxuICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAnKTtcblxuICAgICAgcmV0dXJuIHJlbmRlcmVkLmh0bWwoKTtcbiAgICB9O1xuXG4gICAgdGhpcy5yZW5kZXJfZXZlbnQgPSBmdW5jdGlvbiAoZGlzdGFuY2UsIHppcGNvZGUpIHtcbiAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgdmFyIGRhdGV0aW1lID0gbW9tZW50KHRoYXQucHJvcHMuc3RhcnRfdGltZSkuZm9ybWF0KFwiTU1NIEREIChkZGQpIGg6bW1hXCIpO1xuICAgICAgdmFyIGxhdCA9IHRoYXQucHJvcHMubGF0O1xuICAgICAgdmFyIGxvbiA9IHRoYXQucHJvcHMubG5nO1xuXG4gICAgICB2YXIgcmVuZGVyZWQgPSAkKFwiPGRpdiBjbGFzcz1tb250c2VycmF0Lz5cIikuYWRkQ2xhc3MoJ2V2ZW50LWl0ZW0gJyArIHRoYXQuY2xhc3NOYW1lKS5odG1sKCdcXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtaXRlbSBsYXRvICcgKyB0aGF0LmNsYXNzTmFtZSArICdcIiBsYXQ9XCInICsgbGF0ICsgJ1wiIGxvbj1cIicgKyBsb24gKyAnXCI+XFxuICAgICAgICAgICAgICA8aDUgY2xhc3M9XCJ0aW1lLWluZm9cIj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0aW1lLWluZm8tZGlzdFwiPicgKyAoZGlzdGFuY2UgPyBkaXN0YW5jZSArIFwibWkmbmJzcDsmbmJzcDtcIiA6IFwiXCIpICsgJzwvc3Bhbj4nICsgZGF0ZXRpbWUgKyAnXFxuICAgICAgICAgICAgICA8L2g1PlxcbiAgICAgICAgICAgICAgPGgzPlxcbiAgICAgICAgICAgICAgICA8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiJyArIHRoYXQucHJvcHMudXJsICsgJ1wiPicgKyB0aGF0LnByb3BzLnRpdGxlICsgJzwvYT5cXG4gICAgICAgICAgICAgIDwvaDM+XFxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImxhYmVsLWljb25cIj48L3NwYW4+XFxuICAgICAgICAgICAgICA8aDUgY2xhc3M9XCJldmVudC10eXBlXCI+JyArIHRoYXQucHJvcHMuZXZlbnRfdHlwZSArICc8L2g1PlxcbiAgICAgICAgICAgICAgPHA+JyArIHRoYXQucHJvcHMuYWRkcmVzcyArICc8L3A+XFxuICAgICAgICAgICAgICA8ZGl2PlxcbiAgICAgICAgICAgICAgICA8YSBjbGFzcz1cInJzdnAtbGlua1wiIGhyZWY9XCInICsgdGhhdC5wcm9wcy51cmwgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+UlNWUDwvYT5cXG4gICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICcpO1xuXG4gICAgICByZXR1cm4gcmVuZGVyZWQuaHRtbCgpO1xuICAgIH07XG4gIH07XG5cbn0oalF1ZXJ5KTsgLy9FbmQgb2YgZXZlbnRzXG4iLCIvKioqKlxuICogIE1hcE1hbmFnZXIgcHJvcGVyXG4gKi9cbnZhciBNYXBNYW5hZ2VyID0gZnVuY3Rpb24gKCQsIGQzLCBsZWFmbGV0KSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZXZlbnREYXRhLCBjYW1wYWlnbk9mZmljZXMsIHppcGNvZGVzLCBvcHRpb25zKSB7XG4gICAgdmFyIGFsbEZpbHRlcnMgPSB3aW5kb3cuZXZlbnRUeXBlRmlsdGVycy5tYXAoZnVuY3Rpb24gKGkpIHtcbiAgICAgIHJldHVybiBpLmlkO1xuICAgIH0pO1xuXG4gICAgdmFyIHBvcHVwID0gTC5wb3B1cCgpO1xuICAgIHZhciBvcHRpb25zID0gb3B0aW9ucztcbiAgICB2YXIgemlwY29kZXMgPSB6aXBjb2Rlcy5yZWR1Y2UoZnVuY3Rpb24gKHppcHMsIGl0ZW0pIHtcbiAgICAgIHppcHNbaXRlbS56aXBdID0gaXRlbTtyZXR1cm4gemlwcztcbiAgICB9LCB7fSk7XG5cbiAgICB2YXIgY3VycmVudF9maWx0ZXJzID0gW10sXG4gICAgICAgIGN1cnJlbnRfemlwY29kZSA9IFwiXCIsXG4gICAgICAgIGN1cnJlbnRfZGlzdGFuY2UgPSBcIlwiLFxuICAgICAgICBjdXJyZW50X3NvcnQgPSBcIlwiO1xuXG4gICAgdmFyIG9yaWdpbmFsRXZlbnRMaXN0ID0gZXZlbnREYXRhLm1hcChmdW5jdGlvbiAoZCkge1xuICAgICAgcmV0dXJuIG5ldyBFdmVudChkKTtcbiAgICB9KTtcbiAgICB2YXIgZXZlbnRzTGlzdCA9IG9yaWdpbmFsRXZlbnRMaXN0LnNsaWNlKDApO1xuXG4gICAgLy8gdmFyIG9mZmljZUxpc3QgPSBjYW1wYWlnbk9mZmljZXMubWFwKGZ1bmN0aW9uKGQpIHsgcmV0dXJuIG5ldyBDYW1wYWlnbk9mZmljZXMoZCk7IH0pO1xuXG4gICAgLy8gdmFyIG1hcGJveFRpbGVzID0gbGVhZmxldC50aWxlTGF5ZXIoJ2h0dHA6Ly97c30udGlsZXMubWFwYm94LmNvbS92NC9tYXBib3guc3RyZWV0cy97en0ve3h9L3t5fS5wbmc/YWNjZXNzX3Rva2VuPScgKyBsZWFmbGV0Lm1hcGJveC5hY2Nlc3NUb2tlbiwgeyBhdHRyaWJ1dGlvbjogJzxhIGhyZWY9XCJodHRwOi8vd3d3Lm9wZW5zdHJlZXRtYXAub3JnL2NvcHlyaWdodFwiIHRhcmdldD1cIl9ibGFua1wiPiZjb3B5OyBPcGVuU3RyZWV0TWFwIGNvbnRyaWJ1dG9yczwvYT4nfSk7XG5cbiAgICB2YXIgbWFwYm94VGlsZXMgPSBsZWFmbGV0LnRpbGVMYXllcignaHR0cHM6Ly9jYXJ0b2RiLWJhc2VtYXBzLXtzfS5nbG9iYWwuc3NsLmZhc3RseS5uZXQvbGlnaHRfYWxsL3t6fS97eH0ve3l9LnBuZycsIHtcbiAgICAgIG1heFpvb206IDE4LFxuICAgICAgYXR0cmlidXRpb246ICcmY29weTsgPGEgaHJlZj1cImh0dHA6Ly93d3cub3BlbnN0cmVldG1hcC5vcmcvY29weXJpZ2h0XCI+T3BlblN0cmVldE1hcDwvYT4sICZjb3B5OzxhIGhyZWY9XCJodHRwczovL2NhcnRvLmNvbS9hdHRyaWJ1dGlvblwiPkNBUlRPPC9hPidcbiAgICB9KTtcblxuICAgIC8vIHZhciBtYXBib3hUaWxlcyA9IGxlYWZsZXQudGlsZUxheWVyKCdodHRwczovL2NhcnRvZGItYmFzZW1hcHMte3N9Lmdsb2JhbC5zc2wuZmFzdGx5Lm5ldC9saWdodF9hbGwve3p9L3t4fS97eX0ucG5nJywge1xuICAgIC8vICAgbWF4Wm9vbTogMTgsXG4gICAgLy8gICBhdHRyaWJ1dGlvbjogJyZjb3B5OyA8YSBocmVmPVwiaHR0cDovL3d3dy5vcGVuc3RyZWV0bWFwLm9yZy9jb3B5cmlnaHRcIj5PcGVuU3RyZWV0TWFwPC9hPiwgJmNvcHk7PGEgaHJlZj1cImh0dHBzOi8vY2FydG8uY29tL2F0dHJpYnV0aW9uXCI+Q0FSVE88L2E+J1xuICAgIC8vIH0pO1xuXG4gICAgdmFyIENBTVBBSUdOX09GRklDRV9JQ09OID0gTC5pY29uKHtcbiAgICAgIGljb25Vcmw6ICcvL2QyYnEyeWYzMWxqdTNxLmNsb3VkZnJvbnQubmV0L2ltZy9pY29uL3N0YXIucG5nJyxcbiAgICAgIGljb25TaXplOiBbMTcsIDE0XSB9KTtcbiAgICB2YXIgR09UVl9DRU5URVJfSUNPTiA9IEwuaWNvbih7XG4gICAgICBpY29uVXJsOiAnLy9kMmJxMnlmMzFsanUzcS5jbG91ZGZyb250Lm5ldC9pbWcvaWNvbi9nb3R2LXN0YXIucG5nJyxcbiAgICAgIGljb25TaXplOiBbMTMsIDEwXSB9KTtcbiAgICB2YXIgZGVmYXVsdENvb3JkID0gb3B0aW9ucyAmJiBvcHRpb25zLmRlZmF1bHRDb29yZCA/IG9wdGlvbnMuZGVmYXVsdENvb3JkIDogeyBjZW50ZXI6IFsyMy40ODkyNzc0LC0zMS4wMDA0OTM0XSwgem9vbTogM307XG5cbiAgICB2YXIgY2VudHJhbE1hcCA9IG5ldyBsZWFmbGV0Lk1hcChcIm1hcC1jb250YWluZXJcIiwgd2luZG93LmN1c3RvbU1hcENvb3JkID8gd2luZG93LmN1c3RvbU1hcENvb3JkIDogZGVmYXVsdENvb3JkKS5hZGRMYXllcihtYXBib3hUaWxlcyk7XG4gICAgaWYgKGNlbnRyYWxNYXApIHt9XG5cbiAgICB2YXIgb3ZlcmxheXMgPSBMLmxheWVyR3JvdXAoKS5hZGRUbyhjZW50cmFsTWFwKTtcbiAgICB2YXIgb2ZmaWNlcyA9IEwubGF5ZXJHcm91cCgpLmFkZFRvKGNlbnRyYWxNYXApO1xuICAgIHZhciBnb3R2Q2VudGVyID0gTC5sYXllckdyb3VwKCkuYWRkVG8oY2VudHJhbE1hcCk7XG5cbiAgICB2YXIgY2FtcGFpZ25PZmZpY2VMYXllciA9IEwubGF5ZXJHcm91cCgpLmFkZFRvKGNlbnRyYWxNYXApO1xuXG4gICAgLy9pbml0aWFsaXplIG1hcFxuICAgIHZhciBmaWx0ZXJlZEV2ZW50cyA9IFtdO1xuICAgIHZhciBtb2R1bGUgPSB7fTtcblxuICAgIHZhciBfcG9wdXBFdmVudHMgPSBmdW5jdGlvbiBfcG9wdXBFdmVudHMoZXZlbnQpIHtcbiAgICAgIHZhciB0YXJnZXQgPSBldmVudC50YXJnZXQuX2xhdGxuZztcblxuICAgICAgdmFyIGZpbHRlcmVkID0gZXZlbnRzTGlzdC5maWx0ZXIoZnVuY3Rpb24gKGQpIHtcblxuICAgICAgICByZXR1cm4gdGFyZ2V0LmxhdCA9PSBkLnByb3BzLkxhdExuZ1swXSAmJiB0YXJnZXQubG5nID09IGQucHJvcHMuTGF0TG5nWzFdICYmICghY3VycmVudF9maWx0ZXJzIHx8IGN1cnJlbnRfZmlsdGVycy5sZW5ndGggPT0gMCB8fCAkKGQucHJvcGVydGllcy5maWx0ZXJzKS5ub3QoY3VycmVudF9maWx0ZXJzKS5sZW5ndGggIT0gZC5wcm9wZXJ0aWVzLmZpbHRlcnMubGVuZ3RoKTtcbiAgICAgIH0pLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEucHJvcHMuc3RhcnRfdGltZSAtIGIucHJvcHMuc3RhcnRfdGltZTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgZGl2ID0gJChcIjxkaXYgLz5cIikuYXBwZW5kKGZpbHRlcmVkLmxlbmd0aCA+IDEgPyBcIjxoMyBjbGFzcz0nc2NoZWQtY291bnQnPlwiICsgZmlsdGVyZWQubGVuZ3RoICsgXCIgUmVzdWx0czwvaDM+XCIgOiBcIlwiKS5hcHBlbmQoJChcIjxkaXYgY2xhc3M9J3BvcHVwLWxpc3QtY29udGFpbmVyJy8+XCIpLmFwcGVuZCgkKFwiPHVsIGNsYXNzPSdwb3B1cC1saXN0Jz5cIilcbiAgICAgIC5hcHBlbmQoZmlsdGVyZWQubWFwKGZ1bmN0aW9uIChkKSB7XG4gICAgICAgIHJldHVybiAkKFwiPGxpIGNsYXNzPW1vbnRzZXJyYXQvPlwiKS5hZGRDbGFzcyhkLmlzRnVsbCA/IFwiaXMtZnVsbFwiIDogXCJub3QtZnVsbFwiKS5hZGRDbGFzcyhkLnZpc2libGUgPyBcImlzLXZpc2libGVcIiA6IFwibm90LXZpc2libGVcIikuYXBwZW5kKGQucmVuZGVyKCkpO1xuICAgICAgfSkpKSk7XG5cbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBMLnBvcHVwKCkuc2V0TGF0TG5nKGV2ZW50LnRhcmdldC5fbGF0bG5nKS5zZXRDb250ZW50KGRpdi5odG1sKCkpLm9wZW5PbihjZW50cmFsTWFwKTtcbiAgICAgIH0sIDEwMCk7XG4gICAgfTtcblxuICAgIC8qKipcbiAgICAgKiBJbml0aWFsaXphdGlvblxuICAgICAqL1xuICAgIHZhciBpbml0aWFsaXplID0gZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgICAgIHZhciB1bmlxdWVMb2NzID0gZXZlbnRzTGlzdC5yZWR1Y2UoZnVuY3Rpb24gKGFyciwgaXRlbSkge1xuICAgICAgICB2YXIgY2xhc3NOYW1lID0gaXRlbS5wcm9wZXJ0aWVzLmZpbHRlcnMuam9pbihcIiBcIik7XG4gICAgICAgIGlmIChhcnIuaW5kZXhPZihpdGVtLnByb3BlcnRpZXMubGF0ICsgXCJ8fFwiICsgaXRlbS5wcm9wZXJ0aWVzLmxuZyArIFwifHxcIiArIGNsYXNzTmFtZSkgPj0gMCkge1xuICAgICAgICAgIHJldHVybiBhcnI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXJyLnB1c2goaXRlbS5wcm9wZXJ0aWVzLmxhdCArIFwifHxcIiArIGl0ZW0ucHJvcGVydGllcy5sbmcgKyBcInx8XCIgKyBjbGFzc05hbWUpO1xuICAgICAgICAgIHJldHVybiBhcnI7XG4gICAgICAgIH1cbiAgICAgIH0sIFtdKTtcblxuICAgICAgdW5pcXVlTG9jcyA9IHVuaXF1ZUxvY3MubWFwKGZ1bmN0aW9uIChkKSB7XG4gICAgICAgIHZhciBzcGxpdCA9IGQuc3BsaXQoXCJ8fFwiKTtcbiAgICAgICAgcmV0dXJuIHsgbGF0TG5nOiBbcGFyc2VGbG9hdChzcGxpdFswXSksIHBhcnNlRmxvYXQoc3BsaXRbMV0pXSxcbiAgICAgICAgICBjbGFzc05hbWU6IHNwbGl0WzJdIH07XG4gICAgICB9KTtcblxuICAgICAgdW5pcXVlTG9jcy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG5cbiAgICAgICAgLy8gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gaWYgKGl0ZW0uY2xhc3NOYW1lID09IFwiY2FtcGFpZ24tb2ZmaWNlXCIpIHtcbiAgICAgICAgLy8gICBMLm1hcmtlcihpdGVtLmxhdExuZywge2ljb246IENBTVBBSUdOX09GRklDRV9JQ09OLCBjbGFzc05hbWU6IGl0ZW0uY2xhc3NOYW1lfSlcbiAgICAgICAgLy8gICAgIC5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7IF9wb3B1cEV2ZW50cyhlKTsgfSlcbiAgICAgICAgLy8gICAgIC5hZGRUbyhvZmZpY2VzKTtcbiAgICAgICAgLy8gfSBlbHNlIGlmIChpdGVtLmNsYXNzTmFtZSA9PSBcImdvdHYtY2VudGVyXCIpIHtcbiAgICAgICAgLy8gICBMLm1hcmtlcihpdGVtLmxhdExuZywge2ljb246IEdPVFZfQ0VOVEVSX0lDT04sIGNsYXNzTmFtZTogaXRlbS5jbGFzc05hbWV9KVxuICAgICAgICAvLyAgICAgLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHsgX3BvcHVwRXZlbnRzKGUpOyB9KVxuICAgICAgICAvLyAgICAgLmFkZFRvKGdvdHZDZW50ZXIpO1xuICAgICAgICAvLyB9ZWxzZVxuICAgICAgICAvLyBpZiAoaXRlbS5jbGFzc05hbWUubWF0Y2goL2Jlcm5pZVxcLWV2ZW50L2lnKSkge1xuICAgICAgICAvLyAgIEwuY2lyY2xlTWFya2VyKGl0ZW0ubGF0TG5nLCB7IHJhZGl1czogMTIsIGNsYXNzTmFtZTogaXRlbS5jbGFzc05hbWUsIGNvbG9yOiAnd2hpdGUnLCBmaWxsQ29sb3I6ICcjRjU1QjVCJywgb3BhY2l0eTogMC44LCBmaWxsT3BhY2l0eTogMC43LCB3ZWlnaHQ6IDIgfSlcbiAgICAgICAgLy8gICAgIC5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7IF9wb3B1cEV2ZW50cyhlKTsgfSlcbiAgICAgICAgLy8gICAgIC5hZGRUbyhvdmVybGF5cyk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgaWYgKGl0ZW0uY2xhc3NOYW1lID09ICdncm91cC1tZWV0aW5nJykge1xuICAgICAgICAgIEwuY2lyY2xlTWFya2VyKGl0ZW0ubGF0TG5nLCB7IHJhZGl1czogNSwgY2xhc3NOYW1lOiBpdGVtLmNsYXNzTmFtZSwgY29sb3I6ICd3aGl0ZScsIGZpbGxDb2xvcjogJyNlNzEwMjknLCBvcGFjaXR5OiAwLjgsIGZpbGxPcGFjaXR5OiAwLjcsIHdlaWdodDogMiB9KS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgX3BvcHVwRXZlbnRzKGUpO1xuICAgICAgICAgIH0pLmFkZFRvKG92ZXJsYXlzKTtcbiAgICAgICAgfSBlbHNlIGlmIChpdGVtLmNsYXNzTmFtZSA9PSAnZ3JvdXAnKSB7XG4gICAgICAgICAgTC5jaXJjbGVNYXJrZXIoaXRlbS5sYXRMbmcsIHsgcmFkaXVzOiA0LCBjbGFzc05hbWU6IGl0ZW0uY2xhc3NOYW1lLCBjb2xvcjogJ3doaXRlJywgZmlsbENvbG9yOiAncmdiKDI1NSw5NywxOCknLCBvcGFjaXR5OiAwLjYsIGZpbGxPcGFjaXR5OiAwLjksIHdlaWdodDogMiB9KS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgX3BvcHVwRXZlbnRzKGUpO1xuICAgICAgICAgIH0pLmFkZFRvKG92ZXJsYXlzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBMLmNpcmNsZU1hcmtlcihpdGVtLmxhdExuZywgeyByYWRpdXM6IDUsIGNsYXNzTmFtZTogaXRlbS5jbGFzc05hbWUsIGNvbG9yOiAnd2hpdGUnLCBmaWxsQ29sb3I6ICdyZ2IoMjU1LDk3LDE4KScsIG9wYWNpdHk6IDAuOCwgZmlsbE9wYWNpdHk6IDAuNywgd2VpZ2h0OiAyIH0pLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBfcG9wdXBFdmVudHMoZSk7XG4gICAgICAgICAgfSkuYWRkVG8ob3ZlcmxheXMpO1xuICAgICAgICB9XG4gICAgICAgIC8vIH0sIDEwKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyAkKFwiLmxlYWZsZXQtb3ZlcmxheS1wYW5lXCIpLmZpbmQoXCIuYmVybmllLWV2ZW50XCIpLnBhcmVudCgpLnByZXBlbmRUbygnLmxlYWZsZXQtem9vbS1hbmltYXRlZCcpO1xuICAgIH07IC8vIEVuZCBvZiBpbml0aWFsaXplXG5cbiAgICB2YXIgdG9NaWxlID0gZnVuY3Rpb24gdG9NaWxlKG1ldGVyKSB7XG4gICAgICByZXR1cm4gbWV0ZXIgKiAwLjAwMDYyMTM3O1xuICAgIH07XG5cbiAgICB2YXIgZmlsdGVyRXZlbnRzQnlDb29yZHMgPSBmdW5jdGlvbiBmaWx0ZXJFdmVudHNCeUNvb3JkcyhjZW50ZXIsIGRpc3RhbmNlLCBmaWx0ZXJUeXBlcykge1xuXG4gICAgICB2YXIgemlwTGF0TG5nID0gbGVhZmxldC5sYXRMbmcoY2VudGVyKTtcblxuICAgICAgdmFyIGZpbHRlcmVkID0gZXZlbnRzTGlzdC5maWx0ZXIoZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgdmFyIGRpc3QgPSB0b01pbGUoemlwTGF0TG5nLmRpc3RhbmNlVG8oZC5wcm9wcy5MYXRMbmcpKTtcbiAgICAgICAgaWYgKGRpc3QgPCBkaXN0YW5jZSkge1xuXG4gICAgICAgICAgZC5kaXN0YW5jZSA9IE1hdGgucm91bmQoZGlzdCAqIDEwKSAvIDEwO1xuXG4gICAgICAgICAgLy9JZiBubyBmaWx0ZXIgd2FzIGEgbWF0Y2ggb24gdGhlIGN1cnJlbnQgZmlsdGVyXG4gICAgICAgICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5kZWZhdWx0Q29vcmQgJiYgIWZpbHRlclR5cGVzKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoJChkLnByb3BzLmZpbHRlcnMpLm5vdChmaWx0ZXJUeXBlcykubGVuZ3RoID09IGQucHJvcHMuZmlsdGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGZpbHRlcmVkO1xuICAgIH07XG5cbiAgICB2YXIgZmlsdGVyRXZlbnRzID0gZnVuY3Rpb24gZmlsdGVyRXZlbnRzKHppcGNvZGUsIGRpc3RhbmNlLCBmaWx0ZXJUeXBlcykge1xuICAgICAgcmV0dXJuIGZpbHRlckV2ZW50c0J5Q29vcmRzKFtwYXJzZUZsb2F0KHppcGNvZGUubGF0KSwgcGFyc2VGbG9hdCh6aXBjb2RlLmxvbildLCBkaXN0YW5jZSwgZmlsdGVyVHlwZXMpO1xuICAgIH07XG5cbiAgICB2YXIgc29ydEV2ZW50cyA9IGZ1bmN0aW9uIHNvcnRFdmVudHMoZmlsdGVyZWRFdmVudHMsIHNvcnRUeXBlKSB7XG4gICAgICBzd2l0Y2ggKHNvcnRUeXBlKSB7XG4gICAgICAgIGNhc2UgJ2Rpc3RhbmNlJzpcbiAgICAgICAgICBmaWx0ZXJlZEV2ZW50cyA9IGZpbHRlcmVkRXZlbnRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhLmRpc3RhbmNlIC0gYi5kaXN0YW5jZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBmaWx0ZXJlZEV2ZW50cyA9IGZpbHRlcmVkRXZlbnRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhLnByb3BzLnN0YXJ0X3RpbWUgLSBiLnByb3BzLnN0YXJ0X3RpbWU7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIC8vIGZpbHRlcmVkRXZlbnRzID0gZmlsdGVyZWRFdmVudHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAvLyAgIHZhciBhRnVsbCA9IGEuaXNGdWxsKCk7XG4gICAgICAvLyAgIHZhciBiRnVsbCA9IGIuaXNGdWxsKCk7XG5cbiAgICAgIC8vICAgaWYgKGFGdWxsICYmIGJGdWxsKSB7IHJldHVybiAwOyB9XG4gICAgICAvLyAgIGVsc2UgaWYgKGFGdWxsICYmICFiRnVsbCkgeyByZXR1cm4gMTsgfVxuICAgICAgLy8gICBlbHNlIGlmICghYUZ1bGwgJiYgYkZ1bGwpIHsgcmV0dXJuIC0xOyB9XG4gICAgICAvLyB9KTtcbiAgICAgIC8vc29ydCBieSBmdWxsbmVzcztcbiAgICAgIC8vLi5cbiAgICAgIHJldHVybiBmaWx0ZXJlZEV2ZW50cztcbiAgICB9O1xuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBpbml0aWFsaXplKCk7XG4gICAgfSwgMTApO1xuXG4gICAgbW9kdWxlLl9ldmVudHNMaXN0ID0gZXZlbnRzTGlzdDtcbiAgICBtb2R1bGUuX3ppcGNvZGVzID0gemlwY29kZXM7XG4gICAgbW9kdWxlLl9vcHRpb25zID0gb3B0aW9ucztcblxuICAgIC8qXG4gICAgKiBSZWZyZXNoIG1hcCB3aXRoIG5ldyBldmVudHMgbWFwXG4gICAgKi9cbiAgICB2YXIgX3JlZnJlc2hNYXAgPSBmdW5jdGlvbiBfcmVmcmVzaE1hcCgpIHtcbiAgICAgIG92ZXJsYXlzLmNsZWFyTGF5ZXJzKCk7XG4gICAgICBpbml0aWFsaXplKCk7XG4gICAgfTtcblxuICAgIG1vZHVsZS5maWx0ZXJCeVR5cGUgPSBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgaWYgKCQoZmlsdGVycykubm90KHR5cGUpLmxlbmd0aCAhPSAwIHx8ICQodHlwZSkubm90KGZpbHRlcnMpLmxlbmd0aCAhPSAwKSB7XG4gICAgICAgIGN1cnJlbnRfZmlsdGVycyA9IHR5cGU7XG5cbiAgICAgICAgLy9GaWx0ZXIgb25seSBpdGVtcyBpbiB0aGUgbGlzdFxuICAgICAgICAvLyBldmVudHNMaXN0ID0gb3JpZ2luYWxFdmVudExpc3QuZmlsdGVyKGZ1bmN0aW9uKGV2ZW50SXRlbSkge1xuICAgICAgICAvLyAgIHZhciB1bm1hdGNoID0gJChldmVudEl0ZW0ucHJvcGVydGllcy5maWx0ZXJzKS5ub3QoZmlsdGVycyk7XG4gICAgICAgIC8vICAgcmV0dXJuIHVubWF0Y2gubGVuZ3RoICE9IGV2ZW50SXRlbS5wcm9wZXJ0aWVzLmZpbHRlcnMubGVuZ3RoO1xuICAgICAgICAvLyB9KTtcblxuXG4gICAgICAgIC8vIHZhciB0YXJnZXQgPSB0eXBlLm1hcChmdW5jdGlvbihpKSB7IHJldHVybiBcIi5cIiArIGkgfSkuam9pbihcIixcIik7XG4gICAgICAgIC8vICQoXCIubGVhZmxldC1vdmVybGF5LXBhbmVcIikuZmluZChcInBhdGg6bm90KFwiK3R5cGUubWFwKGZ1bmN0aW9uKGkpIHsgcmV0dXJuIFwiLlwiICsgaSB9KS5qb2luKFwiLFwiKSArIFwiKVwiKVxuXG4gICAgICAgIHZhciB0b0hpZGUgPSAkKGFsbEZpbHRlcnMpLm5vdCh0eXBlKTtcblxuICAgICAgICBpZiAodG9IaWRlICYmIHRvSGlkZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdG9IaWRlID0gdG9IaWRlLnNwbGljZSgwLCB0b0hpZGUubGVuZ3RoKTtcbiAgICAgICAgICAkKFwiLmxlYWZsZXQtb3ZlcmxheS1wYW5lXCIpLmZpbmQoXCIuXCIgKyB0b0hpZGUuam9pbihcIiwuXCIpKS5oaWRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZSAmJiB0eXBlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAkKFwiLmxlYWZsZXQtb3ZlcmxheS1wYW5lXCIpLmZpbmQoXCIuXCIgKyB0eXBlLmpvaW4oXCIsLlwiKSkuc2hvdygpO1xuICAgICAgICAgIC8vIF9yZWZyZXNoTWFwKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvL1NwZWNpZmljYWxseSBmb3IgY2FtcGFpZ24gb2ZmaWNlXG4gICAgICAgIGlmICghdHlwZSkge1xuICAgICAgICAgIGNlbnRyYWxNYXAucmVtb3ZlTGF5ZXIob2ZmaWNlcyk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSAmJiB0eXBlLmluZGV4T2YoJ2NhbXBhaWduLW9mZmljZScpIDwgMCkge1xuICAgICAgICAgIGNlbnRyYWxNYXAucmVtb3ZlTGF5ZXIob2ZmaWNlcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2VudHJhbE1hcC5hZGRMYXllcihvZmZpY2VzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vRm9yIGdvdHYtY2VudGVyc1xuICAgICAgICBpZiAoIXR5cGUpIHtcbiAgICAgICAgICBjZW50cmFsTWFwLnJlbW92ZUxheWVyKGdvdHZDZW50ZXIpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgJiYgdHlwZS5pbmRleE9mKCdnb3R2LWNlbnRlcicpIDwgMCkge1xuICAgICAgICAgIGNlbnRyYWxNYXAucmVtb3ZlTGF5ZXIoZ290dkNlbnRlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2VudHJhbE1hcC5hZGRMYXllcihnb3R2Q2VudGVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH07XG5cbiAgICBtb2R1bGUuZmlsdGVyQnlDb29yZHMgPSBmdW5jdGlvbiAoY29vcmRzLCBkaXN0YW5jZSwgc29ydCwgZmlsdGVyVHlwZXMpIHtcbiAgICAgIC8vUmVtb3ZlIGxpc3RcbiAgICAgIGQzLnNlbGVjdChcIiNldmVudC1saXN0XCIpLnNlbGVjdEFsbChcImxpXCIpLnJlbW92ZSgpO1xuXG4gICAgICB2YXIgZmlsdGVyZWQgPSBmaWx0ZXJFdmVudHNCeUNvb3Jkcyhjb29yZHMsIHBhcnNlSW50KGRpc3RhbmNlKSwgZmlsdGVyVHlwZXMpO1xuICAgICAgLy9Tb3J0IGV2ZW50XG4gICAgICBmaWx0ZXJlZCA9IHNvcnRFdmVudHMoZmlsdGVyZWQsIHNvcnQsIGZpbHRlclR5cGVzKTtcblxuICAgICAgLy9SZW5kZXIgZXZlbnRcbiAgICAgIHZhciBldmVudExpc3QgPSBkMy5zZWxlY3QoXCIjZXZlbnQtbGlzdFwiKS5zZWxlY3RBbGwoXCJsaVwiKS5kYXRhKGZpbHRlcmVkLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICByZXR1cm4gZC5wcm9wcy51cmw7XG4gICAgICB9KTtcblxuICAgICAgZXZlbnRMaXN0LmVudGVyKCkuYXBwZW5kKFwibGlcIikuYXR0cihcImNsYXNzXCIsIGZ1bmN0aW9uIChkKSB7XG4gICAgICAgIHJldHVybiAoZC5pc0Z1bGwgPyAnaXMtZnVsbCcgOiAnbm90LWZ1bGwnKSArIFwiIFwiICsgKHRoaXMudmlzaWJsZSA/IFwiaXMtdmlzaWJsZVwiIDogXCJub3QtdmlzaWJsZVwiKTtcbiAgICAgIH0pLmNsYXNzZWQoXCJsYXRvXCIsIHRydWUpLmh0bWwoZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgcmV0dXJuIGQucmVuZGVyKGQuZGlzdGFuY2UpO1xuICAgICAgfSk7XG5cbiAgICAgIGV2ZW50TGlzdC5leGl0KCkucmVtb3ZlKCk7XG5cbiAgICAgIC8vYWRkIGEgaGlnaGxpZ2h0ZWQgbWFya2VyXG4gICAgICBmdW5jdGlvbiBhZGRoaWdobGlnaHRlZE1hcmtlcihsYXQsIGxvbikge1xuICAgICAgICB2YXIgaGlnaGxpZ2h0ZWRNYXJrZXIgPSBuZXcgTC5jaXJjbGVNYXJrZXIoW2xhdCwgbG9uXSwgeyByYWRpdXM6IDUsIGNvbG9yOiAnI2VhNTA0ZScsIGZpbGxDb2xvcjogJyMxNDYyQTInLCBvcGFjaXR5OiAwLjgsIGZpbGxPcGFjaXR5OiAwLjcsIHdlaWdodDogMiB9KS5hZGRUbyhjZW50cmFsTWFwKTtcbiAgICAgICAgLy8gZXZlbnQgbGlzdGVuZXIgdG8gcmVtb3ZlIGhpZ2hsaWdodGVkIG1hcmtlcnNcbiAgICAgICAgJChcIi5ub3QtZnVsbFwiKS5tb3VzZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY2VudHJhbE1hcC5yZW1vdmVMYXllcihoaWdobGlnaHRlZE1hcmtlcik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBldmVudCBsaXN0ZW5lciB0byBnZXQgdGhlIG1vdXNlb3ZlclxuICAgICAgJChcIi5ub3QtZnVsbFwiKS5tb3VzZW92ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKFwiaGlnaGxpZ2h0XCIpO1xuICAgICAgICB2YXIgY01hcmtlckxhdCA9ICQodGhpcykuY2hpbGRyZW4oJ2RpdicpLmF0dHIoJ2xhdCcpO1xuICAgICAgICB2YXIgY01hcmtlckxvbiA9ICQodGhpcykuY2hpbGRyZW4oJ2RpdicpLmF0dHIoJ2xvbicpO1xuICAgICAgICAvLyBmdW5jdGlvbiBjYWxsIHRvIGFkZCBoaWdobGlnaHRlZCBtYXJrZXJcbiAgICAgICAgYWRkaGlnaGxpZ2h0ZWRNYXJrZXIoY01hcmtlckxhdCwgY01hcmtlckxvbik7XG4gICAgICB9KTtcblxuICAgICAgLy9QdXNoIGFsbCBmdWxsIGl0ZW1zIHRvIGVuZCBvZiBsaXN0XG4gICAgICAkKFwiZGl2I2V2ZW50LWxpc3QtY29udGFpbmVyIHVsI2V2ZW50LWxpc3QgbGkuaXMtZnVsbFwiKS5hcHBlbmRUbyhcImRpdiNldmVudC1saXN0LWNvbnRhaW5lciB1bCNldmVudC1saXN0XCIpO1xuXG4gICAgICAvL01vdmUgY2FtcGFpZ24gb2ZmaWNlcyB0b1xuXG4gICAgICB2YXIgb2ZmaWNlQ291bnQgPSAkKFwiZGl2I2V2ZW50LWxpc3QtY29udGFpbmVyIHVsI2V2ZW50LWxpc3QgbGkgLmNhbXBhaWduLW9mZmljZVwiKS5sZW5ndGg7XG4gICAgICAkKFwiI2hpZGUtc2hvdy1vZmZpY2VcIikuYXR0cihcImRhdGEtY291bnRcIiwgb2ZmaWNlQ291bnQpO1xuICAgICAgJChcIiNjYW1wYWlnbi1vZmYtY291bnRcIikudGV4dChvZmZpY2VDb3VudCk7XG4gICAgICAkKFwic2VjdGlvbiNjYW1wYWlnbi1vZmZpY2VzIHVsI2NhbXBhaWduLW9mZmljZS1saXN0ICpcIikucmVtb3ZlKCk7XG4gICAgICAkKFwiZGl2I2V2ZW50LWxpc3QtY29udGFpbmVyIHVsI2V2ZW50LWxpc3QgbGkgLmNhbXBhaWduLW9mZmljZVwiKS5wYXJlbnQoKS5hcHBlbmRUbyhcInNlY3Rpb24jY2FtcGFpZ24tb2ZmaWNlcyB1bCNjYW1wYWlnbi1vZmZpY2UtbGlzdFwiKTtcbiAgICB9O1xuXG4gICAgLyoqKlxuICAgICAqIEZJTFRFUigpICAtLSBXaGVuIHRoZSB1c2VyIHN1Ym1pdHMgcXVlcnksIHdlIHdpbGwgbG9vayBhdCB0aGlzLlxuICAgICAqL1xuICAgIG1vZHVsZS5maWx0ZXIgPSBmdW5jdGlvbiAoemlwY29kZSwgZGlzdGFuY2UsIHNvcnQsIGZpbHRlclR5cGVzKSB7XG4gICAgICAvL0NoZWNrIHR5cGUgZmlsdGVyXG5cbiAgICAgIGlmICghemlwY29kZSB8fCB6aXBjb2RlID09IFwiXCIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfTtcblxuICAgICAgLy9TdGFydCBpZiBvdGhlciBmaWx0ZXJzIGNoYW5nZWRcbiAgICAgIHZhciB0YXJnZXRaaXBjb2RlID0gemlwY29kZXNbemlwY29kZV07XG5cbiAgICAgIC8vUmVtb3ZlIGxpc3RcbiAgICAgIGQzLnNlbGVjdChcIiNldmVudC1saXN0XCIpLnNlbGVjdEFsbChcImxpXCIpLnJlbW92ZSgpO1xuXG4gICAgICBpZiAodGFyZ2V0WmlwY29kZSA9PSB1bmRlZmluZWQgfHwgIXRhcmdldFppcGNvZGUpIHtcbiAgICAgICAgJChcIiNldmVudC1saXN0XCIpLmFwcGVuZChcIjxsaSBjbGFzcz0nZXJyb3IgbGF0byc+WmlwY29kZSBkb2VzIG5vdCBleGlzdC48L2xpPlwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvL0NhbGlicmF0ZSBtYXBcbiAgICAgIHZhciB6b29tID0gNDtcbiAgICAgIHN3aXRjaCAocGFyc2VJbnQoZGlzdGFuY2UpKSB7XG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgICB6b29tID0gMTI7YnJlYWs7XG4gICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgem9vbSA9IDExO2JyZWFrO1xuICAgICAgICBjYXNlIDIwOlxuICAgICAgICAgIHpvb20gPSAxMDticmVhaztcbiAgICAgICAgY2FzZSA1MDpcbiAgICAgICAgICB6b29tID0gOTticmVhaztcbiAgICAgICAgY2FzZSAxMDA6XG4gICAgICAgICAgem9vbSA9IDg7YnJlYWs7XG4gICAgICAgIGNhc2UgMjUwOlxuICAgICAgICAgIHpvb20gPSA3O2JyZWFrO1xuICAgICAgICBjYXNlIDUwMDpcbiAgICAgICAgICB6b29tID0gNTticmVhaztcbiAgICAgICAgY2FzZSA3NTA6XG4gICAgICAgICAgem9vbSA9IDU7YnJlYWs7XG4gICAgICAgIGNhc2UgMTAwMDpcbiAgICAgICAgICB6b29tID0gNDticmVhaztcbiAgICAgICAgY2FzZSAyMDAwOlxuICAgICAgICAgIHpvb20gPSA0O2JyZWFrO1xuICAgICAgICBjYXNlIDMwMDA6XG4gICAgICAgICAgem9vbSA9IDM7YnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAoISh0YXJnZXRaaXBjb2RlLmxhdCAmJiB0YXJnZXRaaXBjb2RlLmxhdCAhPSBcIlwiKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChjdXJyZW50X3ppcGNvZGUgIT0gemlwY29kZSB8fCBjdXJyZW50X2Rpc3RhbmNlICE9IGRpc3RhbmNlKSB7XG4gICAgICAgIGN1cnJlbnRfemlwY29kZSA9IHppcGNvZGU7XG4gICAgICAgIGN1cnJlbnRfZGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgICAgY2VudHJhbE1hcC5zZXRWaWV3KFtwYXJzZUZsb2F0KHRhcmdldFppcGNvZGUubGF0KSwgcGFyc2VGbG9hdCh0YXJnZXRaaXBjb2RlLmxvbildLCB6b29tKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGZpbHRlcmVkID0gZmlsdGVyRXZlbnRzKHRhcmdldFppcGNvZGUsIHBhcnNlSW50KGRpc3RhbmNlKSwgZmlsdGVyVHlwZXMpO1xuXG4gICAgICAvL1NvcnQgZXZlbnRcbiAgICAgIGZpbHRlcmVkID0gc29ydEV2ZW50cyhmaWx0ZXJlZCwgc29ydCwgZmlsdGVyVHlwZXMpO1xuXG4gICAgICAvL1JlbmRlciBldmVudFxuICAgICAgdmFyIGV2ZW50TGlzdCA9IGQzLnNlbGVjdChcIiNldmVudC1saXN0XCIpLnNlbGVjdEFsbChcImxpXCIpLmRhdGEoZmlsdGVyZWQsIGZ1bmN0aW9uIChkKSB7XG4gICAgICAgIHJldHVybiBkLnByb3BzLnVybDtcbiAgICAgIH0pO1xuXG4gICAgICBldmVudExpc3QuZW50ZXIoKS5hcHBlbmQoXCJsaVwiKS5hdHRyKFwiY2xhc3NcIiwgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgcmV0dXJuIChkLmlzRnVsbCA/ICdpcy1mdWxsJyA6ICdub3QtZnVsbCcpICsgXCIgXCIgKyAodGhpcy52aXNpYmxlID8gXCJpcy12aXNpYmxlXCIgOiBcIm5vdC12aXNpYmxlXCIpO1xuICAgICAgfSkuY2xhc3NlZChcImxhdG9cIiwgdHJ1ZSkuaHRtbChmdW5jdGlvbiAoZCkge1xuICAgICAgICByZXR1cm4gZC5yZW5kZXIoZC5kaXN0YW5jZSk7XG4gICAgICB9KTtcblxuICAgICAgZXZlbnRMaXN0LmV4aXQoKS5yZW1vdmUoKTtcblxuICAgICAgLy9hZGQgYSBoaWdobGlnaHRlZCBtYXJrZXJcbiAgICAgIGZ1bmN0aW9uIGFkZGhpZ2hsaWdodGVkTWFya2VyKGxhdCwgbG9uKSB7XG4gICAgICAgIHZhciBoaWdobGlnaHRlZE1hcmtlciA9IG5ldyBMLmNpcmNsZU1hcmtlcihbbGF0LCBsb25dLCB7IHJhZGl1czogNSwgY29sb3I6ICcjZWE1MDRlJywgZmlsbENvbG9yOiAnIzE0NjJBMicsIG9wYWNpdHk6IDAuOCwgZmlsbE9wYWNpdHk6IDAuNywgd2VpZ2h0OiAyIH0pLmFkZFRvKGNlbnRyYWxNYXApO1xuICAgICAgICAvLyBldmVudCBsaXN0ZW5lciB0byByZW1vdmUgaGlnaGxpZ2h0ZWQgbWFya2Vyc1xuICAgICAgICAkKFwiLm5vdC1mdWxsXCIpLm1vdXNlb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBjZW50cmFsTWFwLnJlbW92ZUxheWVyKGhpZ2hsaWdodGVkTWFya2VyKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIGV2ZW50IGxpc3RlbmVyIHRvIGdldCB0aGUgbW91c2VvdmVyXG4gICAgICAkKFwiLm5vdC1mdWxsXCIpLm1vdXNlb3ZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICQodGhpcykudG9nZ2xlQ2xhc3MoXCJoaWdobGlnaHRcIik7XG4gICAgICAgIHZhciBjTWFya2VyTGF0ID0gJCh0aGlzKS5jaGlsZHJlbignZGl2JykuYXR0cignbGF0Jyk7XG4gICAgICAgIHZhciBjTWFya2VyTG9uID0gJCh0aGlzKS5jaGlsZHJlbignZGl2JykuYXR0cignbG9uJyk7XG4gICAgICAgIC8vIGZ1bmN0aW9uIGNhbGwgdG8gYWRkIGhpZ2hsaWdodGVkIG1hcmtlclxuICAgICAgICBhZGRoaWdobGlnaHRlZE1hcmtlcihjTWFya2VyTGF0LCBjTWFya2VyTG9uKTtcbiAgICAgIH0pO1xuXG4gICAgICAvL1B1c2ggYWxsIGZ1bGwgaXRlbXMgdG8gZW5kIG9mIGxpc3RcbiAgICAgICQoXCJkaXYjZXZlbnQtbGlzdC1jb250YWluZXIgdWwjZXZlbnQtbGlzdCBsaS5pcy1mdWxsXCIpLmFwcGVuZFRvKFwiZGl2I2V2ZW50LWxpc3QtY29udGFpbmVyIHVsI2V2ZW50LWxpc3RcIik7XG5cbiAgICAgIC8vTW92ZSBjYW1wYWlnbiBvZmZpY2VzIHRvXG5cbiAgICAgIHZhciBvZmZpY2VDb3VudCA9ICQoXCJkaXYjZXZlbnQtbGlzdC1jb250YWluZXIgdWwjZXZlbnQtbGlzdCBsaSAuY2FtcGFpZ24tb2ZmaWNlXCIpLmxlbmd0aDtcbiAgICAgICQoXCIjaGlkZS1zaG93LW9mZmljZVwiKS5hdHRyKFwiZGF0YS1jb3VudFwiLCBvZmZpY2VDb3VudCk7XG4gICAgICAkKFwiI2NhbXBhaWduLW9mZi1jb3VudFwiKS50ZXh0KG9mZmljZUNvdW50KTtcbiAgICAgICQoXCJzZWN0aW9uI2NhbXBhaWduLW9mZmljZXMgdWwjY2FtcGFpZ24tb2ZmaWNlLWxpc3QgKlwiKS5yZW1vdmUoKTtcbiAgICAgICQoXCJkaXYjZXZlbnQtbGlzdC1jb250YWluZXIgdWwjZXZlbnQtbGlzdCBsaSAuY2FtcGFpZ24tb2ZmaWNlXCIpLnBhcmVudCgpLmFwcGVuZFRvKFwic2VjdGlvbiNjYW1wYWlnbi1vZmZpY2VzIHVsI2NhbXBhaWduLW9mZmljZS1saXN0XCIpO1xuICAgIH07XG5cbiAgICBtb2R1bGUudG9NYXBWaWV3ID0gZnVuY3Rpb24gKCkge1xuICAgICAgJChcImJvZHlcIikucmVtb3ZlQ2xhc3MoXCJsaXN0LXZpZXdcIikuYWRkQ2xhc3MoXCJtYXAtdmlld1wiKTtcbiAgICAgIGNlbnRyYWxNYXAuaW52YWxpZGF0ZVNpemUoKTtcbiAgICAgIGNlbnRyYWxNYXAuX29uUmVzaXplKCk7XG4gICAgfTtcbiAgICBtb2R1bGUudG9MaXN0VmlldyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICQoXCJib2R5XCIpLnJlbW92ZUNsYXNzKFwibWFwLXZpZXdcIikuYWRkQ2xhc3MoXCJsaXN0LXZpZXdcIik7XG4gICAgfTtcblxuICAgIG1vZHVsZS5nZXRNYXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gY2VudHJhbE1hcDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIG1vZHVsZTtcbiAgfTtcbn0oalF1ZXJ5LCBkMywgTCk7XG5cbnZhciBWb3RpbmdJbmZvTWFuYWdlciA9IGZ1bmN0aW9uICgkKSB7XG4gIHJldHVybiBmdW5jdGlvbiAodm90aW5nSW5mbykge1xuICAgIHZhciB2b3RpbmdJbmZvID0gdm90aW5nSW5mbztcbiAgICB2YXIgbW9kdWxlID0ge307XG5cbiAgICBmdW5jdGlvbiBidWlsZFJlZ2lzdHJhdGlvbk1lc3NhZ2Uoc3RhdGUpIHtcbiAgICAgIHZhciAkbXNnID0gJChcIjxkaXYgY2xhc3M9J3JlZ2lzdHJhdGlvbi1tc2cnLz5cIikuYXBwZW5kKCQoXCI8aDMvPlwiKS50ZXh0KFwiUmVnaXN0cmF0aW9uIGRlYWRsaW5lOiBcIiArIG1vbWVudChuZXcgRGF0ZShzdGF0ZS5yZWdpc3RyYXRpb25fZGVhZGxpbmUpKS5mb3JtYXQoXCJNTU0gRFwiKSkpLmFwcGVuZCgkKFwiPHAgLz5cIikuaHRtbChzdGF0ZS5uYW1lICsgXCIgaGFzIDxzdHJvbmc+XCIgKyBzdGF0ZS5pc19vcGVuICsgXCIgXCIgKyBzdGF0ZS50eXBlICsgXCI8L3N0cm9uZz4uIFwiICsgc3RhdGUueW91X211c3QpKS5hcHBlbmQoJChcIjxwIC8+XCIpLmh0bWwoXCJGaW5kIG91dCB3aGVyZSBhbmQgaG93IHRvIHJlZ2lzdGVyIGF0IDxhIHRhcmdldD0nX2JsYW5rJyBocmVmPSdodHRwczovL3ZvdGUuYmVybmllc2FuZGVycy5jb20vXCIgKyBzdGF0ZS5zdGF0ZSArIFwiJz52b3RlLmJlcm5pZXNhbmRlcnMuY29tPC9hPlwiKSk7XG5cbiAgICAgIHJldHVybiAkbXNnO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJ1aWxkUHJpbWFyeUluZm8oc3RhdGUpIHtcblxuICAgICAgdmFyICRtc2cgPSAkKFwiPGRpdiBjbGFzcz0ncmVnaXN0cmF0aW9uLW1zZycvPlwiKS5hcHBlbmQoJChcIjxoMy8+XCIpLnRleHQoXCJQcmltYXJ5IGRheTogXCIgKyBtb21lbnQobmV3IERhdGUoc3RhdGUudm90aW5nX2RheSkpLmZvcm1hdChcIk1NTSBEXCIpKSkuYXBwZW5kKCQoXCI8cCAvPlwiKS5odG1sKHN0YXRlLm5hbWUgKyBcIiBoYXMgPHN0cm9uZz5cIiArIHN0YXRlLmlzX29wZW4gKyBcIiBcIiArIHN0YXRlLnR5cGUgKyBcIjwvc3Ryb25nPi4gXCIgKyBzdGF0ZS55b3VfbXVzdCkpLmFwcGVuZCgkKFwiPHAgLz5cIikuaHRtbChcIkZpbmQgb3V0IHdoZXJlIGFuZCBob3cgdG8gdm90ZSBhdCA8YSB0YXJnZXQ9J19ibGFuaycgaHJlZj0naHR0cHM6Ly92b3RlLmJlcm5pZXNhbmRlcnMuY29tL1wiICsgc3RhdGUuc3RhdGUgKyBcIic+dm90ZS5iZXJuaWVzYW5kZXJzLmNvbTwvYT5cIikpO1xuXG4gICAgICByZXR1cm4gJG1zZztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBidWlsZENhdWN1c0luZm8oc3RhdGUpIHtcbiAgICAgIHZhciAkbXNnID0gJChcIjxkaXYgY2xhc3M9J3JlZ2lzdHJhdGlvbi1tc2cnLz5cIikuYXBwZW5kKCQoXCI8aDMvPlwiKS50ZXh0KFwiQ2F1Y3VzIGRheTogXCIgKyBtb21lbnQobmV3IERhdGUoc3RhdGUudm90aW5nX2RheSkpLmZvcm1hdChcIk1NTSBEXCIpKSkuYXBwZW5kKCQoXCI8cCAvPlwiKS5odG1sKHN0YXRlLm5hbWUgKyBcIiBoYXMgPHN0cm9uZz5cIiArIHN0YXRlLmlzX29wZW4gKyBcIiBcIiArIHN0YXRlLnR5cGUgKyBcIjwvc3Ryb25nPi4gXCIgKyBzdGF0ZS55b3VfbXVzdCkpLmFwcGVuZCgkKFwiPHAgLz5cIikuaHRtbChcIkZpbmQgb3V0IHdoZXJlIGFuZCBob3cgdG8gY2F1Y3VzIGF0IDxhIHRhcmdldD0nX2JsYW5rJyBocmVmPSdodHRwczovL3ZvdGUuYmVybmllc2FuZGVycy5jb20vXCIgKyBzdGF0ZS5zdGF0ZSArIFwiJz52b3RlLmJlcm5pZXNhbmRlcnMuY29tPC9hPlwiKSk7XG5cbiAgICAgIHJldHVybiAkbXNnO1xuICAgIH1cblxuICAgIG1vZHVsZS5nZXRJbmZvID0gZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICB2YXIgdGFyZ2V0U3RhdGUgPSB2b3RpbmdJbmZvLmZpbHRlcihmdW5jdGlvbiAoZCkge1xuICAgICAgICByZXR1cm4gZC5zdGF0ZSA9PSBzdGF0ZTtcbiAgICAgIH0pWzBdOyAvL3JldHVybiBmaXJzdFxuICAgICAgaWYgKCF0YXJnZXRTdGF0ZSkgcmV0dXJuIG51bGw7XG5cbiAgICAgIHZhciB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgICB0b2RheS5zZXREYXRlKHRvZGF5LmdldERhdGUoKSAtIDEpO1xuXG4gICAgICBpZiAodG9kYXkgPD0gbmV3IERhdGUodGFyZ2V0U3RhdGUucmVnaXN0cmF0aW9uX2RlYWRsaW5lKSkge1xuICAgICAgICByZXR1cm4gYnVpbGRSZWdpc3RyYXRpb25NZXNzYWdlKHRhcmdldFN0YXRlKTtcbiAgICAgIH0gZWxzZSBpZiAodG9kYXkgPD0gbmV3IERhdGUodGFyZ2V0U3RhdGUudm90aW5nX2RheSkpIHtcbiAgICAgICAgaWYgKHRhcmdldFN0YXRlLnR5cGUgPT0gXCJwcmltYXJpZXNcIikge1xuICAgICAgICAgIHJldHVybiBidWlsZFByaW1hcnlJbmZvKHRhcmdldFN0YXRlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvL1xuICAgICAgICAgIHJldHVybiBidWlsZENhdWN1c0luZm8odGFyZ2V0U3RhdGUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIG1vZHVsZTtcbiAgfTtcbn0oalF1ZXJ5KTtcblxuLy8gTW9yZSBldmVudHNcbihmdW5jdGlvbiAoJCkge1xuICAkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uIChldmVudCwgcGFyYW1zKSB7XG4gICAgJChcIi5ldmVudC1yc3ZwLWFjdGl2aXR5XCIpLmhpZGUoKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIi5yc3ZwLWxpbmssIC5ldmVudC1yc3ZwLWFjdGl2aXR5XCIsIGZ1bmN0aW9uIChldmVudCwgcGFyYW1zKSB7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH0pO1xuXG4gIC8vU2hvdyBlbWFpbFxuICAkKGRvY3VtZW50KS5vbihcInNob3ctZXZlbnQtZm9ybVwiLCBmdW5jdGlvbiAoZXZlbnRzLCB0YXJnZXQpIHtcbiAgICB2YXIgZm9ybSA9ICQodGFyZ2V0KS5jbG9zZXN0KFwiLmV2ZW50LWl0ZW1cIikuZmluZChcIi5ldmVudC1yc3ZwLWFjdGl2aXR5XCIpO1xuXG4gICAgLy8gdmFyIHBhcmFtcyA9ICAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpIHx8IFwiXCIpO1xuICAgIC8vIGZvcm0uZmluZChcImlucHV0W25hbWU9emlwY29kZV1cIikudmFsKHBhcmFtcy56aXBjb2RlID8gcGFyYW1zLnppcGNvZGUgOiBDb29raWVzLmdldCgnbWFwLmJlcm5pZS56aXBjb2RlJykpO1xuXG4gICAgZm9ybS5mYWRlSW4oMTAwKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oXCJzdWJtaXRcIiwgXCJmb3JtLmV2ZW50LWZvcm1cIiwgZnVuY3Rpb24gKCkge1xuICAgIHZhciBxdWVyeSA9ICQuZGVwYXJhbSgkKHRoaXMpLnNlcmlhbGl6ZSgpKTtcbiAgICB2YXIgcGFyYW1zID0gJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSB8fCBcIlwiKTtcbiAgICBxdWVyeVsnemlwY29kZSddID0gcGFyYW1zWyd6aXBjb2RlJ10gfHwgcXVlcnlbJ3ppcGNvZGUnXTtcblxuICAgIHZhciAkZXJyb3IgPSAkKHRoaXMpLmZpbmQoXCIuZXZlbnQtZXJyb3JcIik7XG4gICAgdmFyICRjb250YWluZXIgPSAkKHRoaXMpLmNsb3Nlc3QoXCIuZXZlbnQtcnN2cC1hY3Rpdml0eVwiKTtcblxuICAgIGlmIChxdWVyeVsnaGFzX3NoaWZ0J10gPT0gJ3RydWUnICYmICghcXVlcnlbJ3NoaWZ0X2lkJ10gfHwgcXVlcnlbJ3NoaWZ0X2lkJ10ubGVuZ3RoID09IDApKSB7XG4gICAgICAkZXJyb3IudGV4dChcIllvdSBtdXN0IHBpY2sgYSBzaGlmdFwiKS5zaG93KCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIHNoaWZ0cyA9IG51bGw7XG4gICAgdmFyIGd1ZXN0cyA9IDA7XG4gICAgaWYgKHF1ZXJ5WydzaGlmdF9pZCddKSB7XG4gICAgICBzaGlmdHMgPSBxdWVyeVsnc2hpZnRfaWQnXS5qb2luKCk7XG4gICAgfVxuXG4gICAgaWYgKCFxdWVyeVsncGhvbmUnXSB8fCBxdWVyeVsncGhvbmUnXSA9PSAnJykge1xuICAgICAgJGVycm9yLnRleHQoXCJQaG9uZSBudW1iZXIgaXMgcmVxdWlyZWRcIikuc2hvdygpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghcXVlcnlbJ2VtYWlsJ10gfHwgcXVlcnlbJ2VtYWlsJ10gPT0gJycpIHtcbiAgICAgICRlcnJvci50ZXh0KFwiRW1haWwgaXMgcmVxdWlyZWRcIikuc2hvdygpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghcXVlcnlbJ2VtYWlsJ10udG9VcHBlckNhc2UoKS5tYXRjaCgvW0EtWjAtOS5fJSstXStAW0EtWjAtOS4tXStcXC5bQS1aXXsyLH0kLykpIHtcbiAgICAgICRlcnJvci50ZXh0KFwiUGxlYXNlIGlucHV0IHZhbGlkIGVtYWlsXCIpLnNob3coKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBpZiAoIXF1ZXJ5WyduYW1lJ10gfHwgcXVlcnlbJ25hbWUnXSA9PSBcIlwiKSB7XG4gICAgLy8gICAkZXJyb3IudGV4dChcIlBsZWFzZSBpbmNsdWRlIHlvdXIgbmFtZVwiKS5zaG93KCk7XG4gICAgLy8gICByZXR1cm4gZmFsc2U7XG4gICAgLy8gfVxuXG4gICAgJCh0aGlzKS5maW5kKFwiLmV2ZW50LWVycm9yXCIpLmhpZGUoKTtcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICQuYWpheCh7XG4gICAgICB0eXBlOiAnUE9TVCcsXG4gICAgICB1cmw6ICdodHRwczovL29yZ2FuaXplLmJlcm5pZXNhbmRlcnMuY29tL2V2ZW50cy9hZGQtcnN2cCcsXG4gICAgICAvLyB1cmw6ICdodHRwczovL2Jlcm5pZS1ncm91bmQtY29udHJvbC1zdGFnaW5nLmhlcm9rdWFwcC5jb20vZXZlbnRzL2FkZC1yc3ZwJyxcbiAgICAgIGNyb3NzRG9tYWluOiB0cnVlLFxuICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgLy8gbmFtZTogcXVlcnlbJ25hbWUnXSxcbiAgICAgICAgcGhvbmU6IHF1ZXJ5WydwaG9uZSddLFxuICAgICAgICBlbWFpbDogcXVlcnlbJ2VtYWlsJ10sXG4gICAgICAgIHppcDogcXVlcnlbJ3ppcGNvZGUnXSxcbiAgICAgICAgc2hpZnRfaWRzOiBzaGlmdHMsXG4gICAgICAgIGV2ZW50X2lkX29iZnVzY2F0ZWQ6IHF1ZXJ5WydpZF9vYmZ1c2NhdGVkJ11cbiAgICAgIH0sXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbiBzdWNjZXNzKGRhdGEpIHtcbiAgICAgICAgQ29va2llcy5zZXQoJ21hcC5iZXJuaWUuemlwY29kZScsIHF1ZXJ5Wyd6aXBjb2RlJ10sIHsgZXhwaXJlczogNyB9KTtcbiAgICAgICAgQ29va2llcy5zZXQoJ21hcC5iZXJuaWUuZW1haWwnLCBxdWVyeVsnZW1haWwnXSwgeyBleHBpcmVzOiA3IH0pO1xuICAgICAgICBDb29raWVzLnNldCgnbWFwLmJlcm5pZS5uYW1lJywgcXVlcnlbJ25hbWUnXSwgeyBleHBpcmVzOiA3IH0pO1xuXG4gICAgICAgIGlmIChxdWVyeVsncGhvbmUnXSAhPSAnJykge1xuICAgICAgICAgIENvb2tpZXMuc2V0KCdtYXAuYmVybmllLnBob25lJywgcXVlcnlbJ3Bob25lJ10sIHsgZXhwaXJlczogNyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vU3RvcmluZyB0aGUgZXZlbnRzIGpvaW5lZFxuICAgICAgICB2YXIgZXZlbnRzX2pvaW5lZCA9IEpTT04ucGFyc2UoQ29va2llcy5nZXQoJ21hcC5iZXJuaWUuZXZlbnRzSm9pbmVkLicgKyBxdWVyeVsnZW1haWwnXSkgfHwgXCJbXVwiKSB8fCBbXTtcblxuICAgICAgICBldmVudHNfam9pbmVkLnB1c2gocXVlcnlbJ2lkX29iZnVzY2F0ZWQnXSk7XG4gICAgICAgIENvb2tpZXMuc2V0KCdtYXAuYmVybmllLmV2ZW50c0pvaW5lZC4nICsgcXVlcnlbJ2VtYWlsJ10sIGV2ZW50c19qb2luZWQsIHsgZXhwaXJlczogNyB9KTtcblxuICAgICAgICAkdGhpcy5jbG9zZXN0KFwibGlcIikuYXR0cihcImRhdGEtYXR0ZW5kaW5nXCIsIHRydWUpO1xuXG4gICAgICAgICR0aGlzLmh0bWwoXCI8aDQgc3R5bGU9J2JvcmRlci1ib3R0b206IG5vbmUnPlJTVlAgU3VjY2Vzc2Z1bCEgVGhhbmsgeW91IGZvciBqb2luaW5nIHRvIHRoaXMgZXZlbnQhPC9oND5cIik7XG4gICAgICAgICRjb250YWluZXIuZGVsYXkoMTAwMCkuZmFkZU91dCgnZmFzdCcpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcbn0pKGpRdWVyeSk7XG4iLCIoZnVuY3Rpb24oJCwgZDMpIHtcbiAgdmFyIGRhdGUgPSBuZXcgRGF0ZSgpO1xuICAkKFwiI2xvYWRpbmctaWNvblwiKS5zaG93KCk7XG5cbiAgJC5hamF4KHtcbiAgICB1cmw6ICdodHRwczovL2RuYjZsZWFuZ3g2ZGMuY2xvdWRmcm9udC5uZXQvb3V0cHV0LzM1MG9yZy5qcy5neicsIC8vJ3wqKkRBVEFfU09VUkNFKip8JyxcbiAgICBkYXRhVHlwZTogJ3NjcmlwdCcsXG4gICAgY2FjaGU6IHRydWUsIC8vIG90aGVyd2lzZSB3aWxsIGdldCBmcmVzaCBjb3B5IGV2ZXJ5IHBhZ2UgbG9hZFxuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGQzLmNzdignLy9kMXkwb3RhZGkza25mNi5jbG91ZGZyb250Lm5ldC9kL3VzX3Bvc3RhbF9jb2Rlcy5neicsXG4gICAgICAgIGZ1bmN0aW9uKHppcGNvZGVzKSB7XG4gICAgICAgICAgJChcIiNsb2FkaW5nLWljb25cIikuaGlkZSgpO1xuICAgICAgICAgIC8vQ2xlYW4gZGF0YVxuICAgICAgICAgIHdpbmRvdy5FVkVOVFNfREFUQS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIGQuZmlsdGVycyA9IFtdO1xuICAgICAgICAgICAgLy9TZXQgZmlsdGVyIGluZm9cbiAgICAgICAgICAgIHN3aXRjaCAoZC5ldmVudF90eXBlKSB7XG4gICAgICAgICAgICAgIGNhc2UgXCJHcm91cFwiOlxuICAgICAgICAgICAgICAgIGQuZmlsdGVycy5wdXNoKCdncm91cCcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlIFwiQWN0aW9uXCI6XG4gICAgICAgICAgICAgICAgZC5maWx0ZXJzLnB1c2goJ2FjdGlvbicpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGQuZmlsdGVycy5wdXNoKCdvdGhlcicpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkLmlzX29mZmljaWFsID0gZC5pc19vZmZpY2lhbCA9PSBcIjFcIjtcbiAgICAgICAgICAgIGlmIChkLmlzX29mZmljaWFsKSB7XG4gICAgICAgICAgICAgIGQuZmlsdGVycy5wdXNoKFwib2ZmaWNpYWwtZXZlbnRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdmFyIHBhcmFtcyA9ICQuZGVwYXJhbSh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkpXG4gICAgICAgICAgdmFyIG9sZERhdGUgPSBuZXcgRGF0ZSgpO1xuXG4gICAgICAgICAgLyogRXh0cmFjdCBkZWZhdWx0IGxhdCBsb24gKi9cbiAgICAgICAgICB2YXIgbSA9IC8uKlxcP2M9KC4rPyksKC4rPyksKFxcZCspeiM/LiovZy5leGVjKHdpbmRvdy5sb2NhdGlvbi5ocmVmKVxuICAgICAgICAgIGlmIChtICYmIG1bMV0gJiYgbVsyXSAmJiBtWzNdKSB7XG4gICAgICAgICAgICB2YXIgZGVmYXVsdENvb3JkID0ge1xuICAgICAgICAgICAgICBjZW50ZXI6IFtwYXJzZUZsb2F0KG1bMV0pLCBwYXJzZUZsb2F0KG1bMl0pXSxcbiAgICAgICAgICAgICAgem9vbTogcGFyc2VJbnQobVszXSlcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB3aW5kb3cubWFwTWFuYWdlciA9IE1hcE1hbmFnZXIod2luZG93LkVWRU5UU19EQVRBLCBjYW1wYWlnbk9mZmljZXMsIHppcGNvZGVzLCB7XG4gICAgICAgICAgICAgIGRlZmF1bHRDb29yZDogZGVmYXVsdENvb3JkXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgd2luZG93Lm1hcE1hbmFnZXIuZmlsdGVyQnlDb29yZHMoZGVmYXVsdENvb3JkLmNlbnRlciwgNTAsIHBhcmFtcy5zb3J0LCBwYXJhbXMuZik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdpbmRvdy5tYXBNYW5hZ2VyID0gTWFwTWFuYWdlcih3aW5kb3cuRVZFTlRTX0RBVEEsIG51bGwsIHppcGNvZGVzKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBMb2FkIENvbm5lY3RpY3V0IGFyZWFcbiAgICAgICAgICB2YXIgZGlzdHJpY3RfYm91bmRhcnkgPSBuZXcgTC5nZW9Kc29uKG51bGwsIHtcbiAgICAgICAgICAgIGNsaWNrYWJsZTogZmFsc2VcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBkaXN0cmljdF9ib3VuZGFyeS5hZGRUbyh3aW5kb3cubWFwTWFuYWdlci5nZXRNYXAoKSk7XG5cbiAgICAgICAgICAvKioqIFRPVEFMTFkgT1BUSU9OQUwgQVJFQSBGT1IgRk9DVVNFRCBBUkVBUy4gRVhBTVBMRSBJUyBDT05ORVRJQ1VUICoqKi9cbiAgICAgICAgICAvKioqIFRPRE86IFJlcGFsYWNlL1JlbW92ZSB0aGlzICoqKi9cbiAgICAgICAgICAvLyAkLmFqYXgoe1xuICAgICAgICAgIC8vICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgICAgIC8vICAgdXJsOiBcIi9kYXRhL3RleGFzLmpzb25cIixcbiAgICAgICAgICAvLyAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAvLyAgICAgJChkYXRhLmZlYXR1cmVzWzBdLmdlb21ldHJ5KS5lYWNoKGZ1bmN0aW9uKGtleSwgZGF0YSkge1xuICAgICAgICAgIC8vICAgICAgIGRpc3RyaWN0X2JvdW5kYXJ5XG4gICAgICAgICAgLy8gICAgICAgICAuYWRkRGF0YShkYXRhKVxuICAgICAgICAgIC8vICAgICAgICAgLnNldFN0eWxlKHtcbiAgICAgICAgICAvLyAgICAgICAgICAgZmlsbENvbG9yOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICAgIC8vICAgICAgICAgICBjb2xvcjogJ3JnYigwLCAwLCAwKSdcbiAgICAgICAgICAvLyAgICAgICAgIH0pO1xuICAgICAgICAgIC8vICAgICAgIGlmICghcGFyYW1zLnppcGNvZGUgfHwgcGFyYW1zLnppcGNvZGUgPT09ICcnKSB7XG4gICAgICAgICAgLy8gICAgICAgICB3aW5kb3cubWFwTWFuYWdlci5nZXRNYXAoKVxuICAgICAgICAgIC8vICAgICAgICAgICAuZml0Qm91bmRzKGRpc3RyaWN0X2JvdW5kYXJ5LmdldEJvdW5kcygpLCB7IGFuaW1hdGU6IGZhbHNlIH0pO1xuICAgICAgICAgIC8vICAgICAgIH1cbiAgICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgICAgLy8gICAgIGRpc3RyaWN0X2JvdW5kYXJ5LmJyaW5nVG9CYWNrKCk7XG4gICAgICAgICAgLy8gICB9XG4gICAgICAgICAgLy8gfSkuZXJyb3IoZnVuY3Rpb24oKSB7fSk7XG5cbiAgICAgICAgICAvLyBpZiAoJChcImlucHV0W25hbWU9J3ppcGNvZGUnXVwiKS52YWwoKSA9PSAnJyAmJiBDb29raWVzLmdldCgnbWFwLmJlcm5pZS56aXBjb2RlJykgJiYgd2luZG93LmxvY2F0aW9uLmhhc2ggPT0gJycpIHtcbiAgICAgICAgICAvLyAgICQoXCJpbnB1dFtuYW1lPSd6aXBjb2RlJ11cIikudmFsKENvb2tpZXMuZ2V0KCdtYXAuYmVybmllLnppcGNvZGUnKSk7XG4gICAgICAgICAgLy8gICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICQoXCIjZmlsdGVyLWZvcm1cIikuc2VyaWFsaXplKCk7XG4gICAgICAgICAgLy8gfSBlbHNlIHtcbiAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcihcImhhc2hjaGFuZ2VcIik7XG4gICAgICAgICAgLy8gfVxuICAgICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIC8qKiBpbml0aWFsIGxvYWRpbmcgYmVmb3JlIGFjdGl2YXRpbmcgbGlzdGVuZXJzLi4uKi9cbiAgdmFyIHBhcmFtcyA9ICQuZGVwYXJhbSh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkpO1xuICBpZiAocGFyYW1zLnppcGNvZGUpIHtcbiAgICAkKFwiaW5wdXRbbmFtZT0nemlwY29kZSddXCIpLnZhbChwYXJhbXMuemlwY29kZSk7XG4gIH1cblxuICBpZiAocGFyYW1zLmRpc3RhbmNlKSB7XG4gICAgJChcInNlbGVjdFtuYW1lPSdkaXN0YW5jZSddXCIpLnZhbChwYXJhbXMuZGlzdGFuY2UpO1xuICB9XG4gIGlmIChwYXJhbXMuc29ydCkge1xuICAgICQoXCJzZWxlY3RbbmFtZT0nc29ydCddXCIpLnZhbChwYXJhbXMuc29ydCk7XG4gIH1cblxuICAvKiBQcmVwYXJlIGZpbHRlcnMgKi9cbiAgJChcIiNmaWx0ZXItbGlzdFwiKS5hcHBlbmQoXG4gICAgd2luZG93LmV2ZW50VHlwZUZpbHRlcnMubWFwKGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiAkKFwiPGxpIC8+XCIpXG4gICAgICAgIC5hcHBlbmQoXG4gICAgICAgICAgJChcIjxpbnB1dCB0eXBlPSdjaGVja2JveCcgY2xhc3M9J2ZpbHRlci10eXBlJyAvPlwiKVxuICAgICAgICAgIC5hdHRyKCduYW1lJywgJ2ZbXScpXG4gICAgICAgICAgLmF0dHIoXCJ2YWx1ZVwiLCBkLmlkKVxuICAgICAgICAgIC5hdHRyKFwiaWRcIiwgZC5pZClcbiAgICAgICAgICAucHJvcChcImNoZWNrZWRcIiwgIXBhcmFtcy5mID8gdHJ1ZSA6ICQuaW5BcnJheShkLmlkLCBwYXJhbXMuZikgPj0gMClcbiAgICAgICAgKVxuICAgICAgICAuYXBwZW5kKCQoXCI8bGFiZWwgLz5cIikuYXR0cignZm9yJywgZC5pZClcbiAgICAgICAgLmFwcGVuZCgkKFwiPHNwYW4gLz5cIikuYWRkQ2xhc3MoJ2ZpbHRlci1vbicpXG4gICAgICAgIC5hcHBlbmQoZC5vbkl0ZW0gPyBkLm9uSXRlbSA6ICQoXCI8c3Bhbj5cIikuYWRkQ2xhc3MoJ2NpcmNsZS1idXR0b24gZGVmYXVsdC1vbicpKSlcbiAgICAgICAgLmFwcGVuZCgkKFwiPHNwYW4gLz5cIikuYWRkQ2xhc3MoJ2ZpbHRlci1vZmYnKVxuICAgICAgICAuYXBwZW5kKGQub2ZmSXRlbSA/IGQub2ZmSXRlbSA6ICQoXCI8c3Bhbj5cIikuYWRkQ2xhc3MoJ2NpcmNsZS1idXR0b24gZGVmYXVsdC1vZmYnKSkpXG4gICAgICAgIC5hcHBlbmQoJChcIjxzcGFuPlwiKS50ZXh0KGQubmFtZSkpKTtcbiAgICB9KVxuICApO1xuICAvKioqXG4gICAqICBkZWZpbmUgZXZlbnRzXG4gICAqL1xuICAvL29ubHkgbnVtYmVyc1xuICAkKFwiaW5wdXRbbmFtZT0nemlwY29kZSddXCIpLm9uKCdrZXl1cCBrZXlkb3duJywgZnVuY3Rpb24oZSkge1xuICAgIGlmIChlLnR5cGUgPT0gJ2tleWRvd24nICYmIChlLmtleUNvZGUgPCA0OCB8fCBlLmtleUNvZGUgPiA1NykgJiZcbiAgICAgIGUua2V5Q29kZSAhPSA4ICYmICEoZS5rZXlDb2RlID49IDM3IHx8IGUua2V5Q29kZSA8PSA0MCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoZS50eXBlID09ICdrZXl1cCcgJiYgJCh0aGlzKS52YWwoKS5sZW5ndGggPT0gNSkge1xuICAgICAgaWYgKCEoZS5rZXlDb2RlID49IDM3ICYmIGUua2V5Q29kZSA8PSA0MCkpIHtcbiAgICAgICAgJCh0aGlzKS5jbG9zZXN0KFwiZm9ybSNmaWx0ZXItZm9ybVwiKS5zdWJtaXQoKTtcbiAgICAgICAgJChcIiNoaWRkZW4tYnV0dG9uXCIpLmZvY3VzKCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICAvKioqXG4gICAqICBvbmNoYW5nZSBvZiBzZWxlY3RcbiAgICovXG4gICQoXCJzZWxlY3RbbmFtZT0nZGlzdGFuY2UnXSxzZWxlY3RbbmFtZT0nc29ydCddXCIpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihlKSB7XG4gICAgJCh0aGlzKS5jbG9zZXN0KFwiZm9ybSNmaWx0ZXItZm9ybVwiKS5zdWJtaXQoKTtcbiAgfSk7XG5cbiAgLyoqXG4gICAqIE9uIGZpbHRlciB0eXBlIGNoYW5nZVxuICAgKi9cbiAgJChcIi5maWx0ZXItdHlwZVwiKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZSkge1xuICAgICQodGhpcykuY2xvc2VzdChcImZvcm0jZmlsdGVyLWZvcm1cIikuc3VibWl0KCk7XG4gIH0pXG5cbiAgLy9PbiBzdWJtaXRcbiAgJChcImZvcm0jZmlsdGVyLWZvcm1cIikub24oJ3N1Ym1pdCcsIGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgc2VyaWFsID0gJCh0aGlzKS5zZXJpYWxpemUoKTtcbiAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IHNlcmlhbDtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcblxuICAkKHdpbmRvdykub24oJ2hhc2hjaGFuZ2UnLCBmdW5jdGlvbihlKSB7XG5cbiAgICB2YXIgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgIGlmIChoYXNoLmxlbmd0aCA9PSAwIHx8IGhhc2guc3Vic3RyaW5nKDEpID09IDApIHtcbiAgICAgICQoXCIjbG9hZGluZy1pY29uXCIpLmhpZGUoKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgcGFyYW1zID0gJC5kZXBhcmFtKGhhc2guc3Vic3RyaW5nKDEpKTtcblxuICAgIC8vQ3VzdG9tIGZlYXR1cmUgZm9yIHNwZWNpZmljIGRlZmF1bHQgbGF0L2xvblxuICAgIC8vbGF0PTQwLjc0MTU0NzkmbG9uPS03My44MjM5NjA5Jnpvb209MTdcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJChcIiNsb2FkaW5nLWljb25cIikuc2hvdygpO1xuXG4gICAgICBpZiAod2luZG93Lm1hcE1hbmFnZXIuX29wdGlvbnMgJiYgd2luZG93Lm1hcE1hbmFnZXIuX29wdGlvbnMuZGVmYXVsdENvb3JkICYmIHBhcmFtcy56aXBjb2RlLmxlbmd0aCAhPSA1KSB7XG4gICAgICAgIHdpbmRvdy5tYXBNYW5hZ2VyLmZpbHRlckJ5VHlwZShwYXJhbXMuZik7XG4gICAgICAgIHdpbmRvdy5tYXBNYW5hZ2VyLmZpbHRlckJ5Q29vcmRzKHdpbmRvdy5tYXBNYW5hZ2VyLl9vcHRpb25zLmRlZmF1bHRDb29yZC5jZW50ZXIsIHBhcmFtcy5kaXN0YW5jZSwgcGFyYW1zLnNvcnQsIHBhcmFtcy5mKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdpbmRvdy5tYXBNYW5hZ2VyLmZpbHRlckJ5VHlwZShwYXJhbXMuZik7XG4gICAgICAgIHdpbmRvdy5tYXBNYW5hZ2VyLmZpbHRlcihwYXJhbXMuemlwY29kZSwgcGFyYW1zLmRpc3RhbmNlLCBwYXJhbXMuc29ydCwgcGFyYW1zLmYpO1xuICAgICAgfVxuICAgICAgJChcIiNsb2FkaW5nLWljb25cIikuaGlkZSgpO1xuXG4gICAgfSwgMTApO1xuICAgIC8vICQoXCIjbG9hZGluZy1pY29uXCIpLmhpZGUoKTtcbiAgICBpZiAocGFyYW1zLnppcGNvZGUubGVuZ3RoID09IDUgJiYgJChcImJvZHlcIikuaGFzQ2xhc3MoXCJpbml0aWFsLXZpZXdcIikpIHtcbiAgICAgICQoXCIjZXZlbnRzXCIpLnJlbW92ZUNsYXNzKFwic2hvdy10eXBlLWZpbHRlclwiKTtcbiAgICAgICQoXCJib2R5XCIpLnJlbW92ZUNsYXNzKFwiaW5pdGlhbC12aWV3XCIpO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIHByZSA9ICQuZGVwYXJhbSh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkpO1xuICBpZiAoJChcImJvZHlcIikuaGFzQ2xhc3MoXCJpbml0aWFsLXZpZXdcIikpIHtcbiAgICBpZiAoJCh3aW5kb3cpLndpZHRoKCkgPj0gNjAwICYmICghcHJlLnppcGNvZGUgfHwgcHJlICYmIHByZS56aXBjb2RlLmxlbmd0aCAhPSA1KSkge1xuICAgICAgJChcIiNldmVudHNcIikuYWRkQ2xhc3MoXCJzaG93LXR5cGUtZmlsdGVyXCIpO1xuICAgIH1cbiAgfVxuXG5cbn0pKGpRdWVyeSwgZDMpO1xuIl19
