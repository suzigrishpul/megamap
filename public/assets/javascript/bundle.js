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
  name: 'Meet and Greet',
  id: 'Meet-and-greet'
}, {
  name: 'Town Hall',
  id: 'Town-Hall'
}, {
  name: 'Volunteer event',
  id: 'Volunteer-event'
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
    var defaultCoord = options && options.defaultCoord ? options.defaultCoord : { center: [37.8, -96.9], zoom: 4 };

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
            case "Meet and Greet":
              d.filters.push('Meet-and-greet');
              break;
            case "Phone bank":
              d.filters.push('Phone-bank');
              break;
            case "Block walk":
              d.filters.push('Block-walk');
              break;
            case "Rally":
              d.filters.push('Rally');
              break;
            case "Town Hall":
              d.filters.push('Town-Hall');
              break;
            case "Veteran town hall":
              d.filters.push('Veteran-town-hall');
              break;
            case "Volunteer event":
              d.filters.push('Volunteer-event');
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
        $.ajax({
          dataType: "json",
          url: "/data/texas.json",
          success: function success(data) {
            $(data.features[0].geometry).each(function (key, data) {
              district_boundary.addData(data).setStyle({
                fillColor: 'transparent',
                color: 'rgb(0, 0, 0)'
              });
              if (!params.zipcode || params.zipcode === '') {
                window.mapManager.getMap().fitBounds(district_boundary.getBounds(), { animate: false });
              }
            });
            district_boundary.bringToBack();
          }
        }).error(function () {});

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvZXZlbnQtdHlwZXMuanMiLCJjbGFzc2VzL2V2ZW50LmpzIiwiY2xhc3Nlcy9tYXAtbWFuYWdlci5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJ3aW5kb3ciLCJldmVudFR5cGVGaWx0ZXJzIiwibmFtZSIsImlkIiwiRXZlbnQiLCIkIiwicHJvcGVydGllcyIsImJsaXAiLCJjbGFzc05hbWUiLCJldmVudF90eXBlIiwicmVwbGFjZSIsInRvTG93ZXJDYXNlIiwicHJvcHMiLCJ0aXRsZSIsInVybCIsInN0YXJ0X2RhdGV0aW1lIiwic3RhcnRfdGltZSIsImFkZHJlc3MiLCJ2ZW51ZSIsInN1cGVyZ3JvdXAiLCJtb21lbnQiLCJfZCIsIkRhdGUiLCJ2YWx1ZU9mIiwiZ3JvdXAiLCJMYXRMbmciLCJwYXJzZUZsb2F0IiwibGF0IiwibG5nIiwiZmlsdGVycyIsInNvY2lhbCIsImZhY2Vib29rIiwiZW1haWwiLCJwaG9uZSIsInR3aXR0ZXIiLCJyZW5kZXIiLCJkaXN0YW5jZSIsInppcGNvZGUiLCJ0aGF0IiwicmVuZGVyX2dyb3VwIiwicmVuZGVyX2V2ZW50IiwibG9uIiwic29jaWFsX2h0bWwiLCJuZXdfd2luZG93IiwibWF0Y2giLCJyZW5kZXJlZCIsImFkZENsYXNzIiwiaHRtbCIsImRhdGV0aW1lIiwiZm9ybWF0IiwialF1ZXJ5IiwiTWFwTWFuYWdlciIsImQzIiwibGVhZmxldCIsImV2ZW50RGF0YSIsImNhbXBhaWduT2ZmaWNlcyIsInppcGNvZGVzIiwib3B0aW9ucyIsImFsbEZpbHRlcnMiLCJtYXAiLCJpIiwicG9wdXAiLCJMIiwicmVkdWNlIiwiemlwcyIsIml0ZW0iLCJ6aXAiLCJjdXJyZW50X2ZpbHRlcnMiLCJjdXJyZW50X3ppcGNvZGUiLCJjdXJyZW50X2Rpc3RhbmNlIiwiY3VycmVudF9zb3J0Iiwib3JpZ2luYWxFdmVudExpc3QiLCJkIiwiZXZlbnRzTGlzdCIsInNsaWNlIiwibWFwYm94VGlsZXMiLCJ0aWxlTGF5ZXIiLCJtYXhab29tIiwiYXR0cmlidXRpb24iLCJDQU1QQUlHTl9PRkZJQ0VfSUNPTiIsImljb24iLCJpY29uVXJsIiwiaWNvblNpemUiLCJHT1RWX0NFTlRFUl9JQ09OIiwiZGVmYXVsdENvb3JkIiwiY2VudGVyIiwiem9vbSIsImNlbnRyYWxNYXAiLCJNYXAiLCJjdXN0b21NYXBDb29yZCIsImFkZExheWVyIiwib3ZlcmxheXMiLCJsYXllckdyb3VwIiwiYWRkVG8iLCJvZmZpY2VzIiwiZ290dkNlbnRlciIsImNhbXBhaWduT2ZmaWNlTGF5ZXIiLCJmaWx0ZXJlZEV2ZW50cyIsIm1vZHVsZSIsIl9wb3B1cEV2ZW50cyIsImV2ZW50IiwidGFyZ2V0IiwiX2xhdGxuZyIsImZpbHRlcmVkIiwiZmlsdGVyIiwibGVuZ3RoIiwibm90Iiwic29ydCIsImEiLCJiIiwiZGl2IiwiYXBwZW5kIiwiaXNGdWxsIiwidmlzaWJsZSIsInNldFRpbWVvdXQiLCJzZXRMYXRMbmciLCJzZXRDb250ZW50Iiwib3Blbk9uIiwiaW5pdGlhbGl6ZSIsInVuaXF1ZUxvY3MiLCJhcnIiLCJqb2luIiwiaW5kZXhPZiIsInB1c2giLCJzcGxpdCIsImxhdExuZyIsImZvckVhY2giLCJjaXJjbGVNYXJrZXIiLCJyYWRpdXMiLCJjb2xvciIsImZpbGxDb2xvciIsIm9wYWNpdHkiLCJmaWxsT3BhY2l0eSIsIndlaWdodCIsIm9uIiwiZSIsInRvTWlsZSIsIm1ldGVyIiwiZmlsdGVyRXZlbnRzQnlDb29yZHMiLCJmaWx0ZXJUeXBlcyIsInppcExhdExuZyIsImRpc3QiLCJkaXN0YW5jZVRvIiwiTWF0aCIsInJvdW5kIiwiZmlsdGVyRXZlbnRzIiwic29ydEV2ZW50cyIsInNvcnRUeXBlIiwiX2V2ZW50c0xpc3QiLCJfemlwY29kZXMiLCJfb3B0aW9ucyIsIl9yZWZyZXNoTWFwIiwiY2xlYXJMYXllcnMiLCJmaWx0ZXJCeVR5cGUiLCJ0eXBlIiwidG9IaWRlIiwic3BsaWNlIiwiZmluZCIsImhpZGUiLCJzaG93IiwicmVtb3ZlTGF5ZXIiLCJmaWx0ZXJCeUNvb3JkcyIsImNvb3JkcyIsInNlbGVjdCIsInNlbGVjdEFsbCIsInJlbW92ZSIsInBhcnNlSW50IiwiZXZlbnRMaXN0IiwiZGF0YSIsImVudGVyIiwiYXR0ciIsImNsYXNzZWQiLCJleGl0IiwiYWRkaGlnaGxpZ2h0ZWRNYXJrZXIiLCJoaWdobGlnaHRlZE1hcmtlciIsIm1vdXNlb3V0IiwibW91c2VvdmVyIiwidG9nZ2xlQ2xhc3MiLCJjTWFya2VyTGF0IiwiY2hpbGRyZW4iLCJjTWFya2VyTG9uIiwiYXBwZW5kVG8iLCJvZmZpY2VDb3VudCIsInRleHQiLCJwYXJlbnQiLCJ0YXJnZXRaaXBjb2RlIiwidW5kZWZpbmVkIiwic2V0VmlldyIsInRvTWFwVmlldyIsInJlbW92ZUNsYXNzIiwiaW52YWxpZGF0ZVNpemUiLCJfb25SZXNpemUiLCJ0b0xpc3RWaWV3IiwiZ2V0TWFwIiwiVm90aW5nSW5mb01hbmFnZXIiLCJ2b3RpbmdJbmZvIiwiYnVpbGRSZWdpc3RyYXRpb25NZXNzYWdlIiwic3RhdGUiLCIkbXNnIiwicmVnaXN0cmF0aW9uX2RlYWRsaW5lIiwiaXNfb3BlbiIsInlvdV9tdXN0IiwiYnVpbGRQcmltYXJ5SW5mbyIsInZvdGluZ19kYXkiLCJidWlsZENhdWN1c0luZm8iLCJnZXRJbmZvIiwidGFyZ2V0U3RhdGUiLCJ0b2RheSIsInNldERhdGUiLCJnZXREYXRlIiwiZG9jdW1lbnQiLCJwYXJhbXMiLCJzdG9wUHJvcGFnYXRpb24iLCJldmVudHMiLCJmb3JtIiwiY2xvc2VzdCIsImZhZGVJbiIsInF1ZXJ5IiwiZGVwYXJhbSIsInNlcmlhbGl6ZSIsImxvY2F0aW9uIiwiaGFzaCIsInN1YnN0cmluZyIsIiRlcnJvciIsIiRjb250YWluZXIiLCJzaGlmdHMiLCJndWVzdHMiLCJ0b1VwcGVyQ2FzZSIsIiR0aGlzIiwiYWpheCIsImNyb3NzRG9tYWluIiwiZGF0YVR5cGUiLCJzaGlmdF9pZHMiLCJldmVudF9pZF9vYmZ1c2NhdGVkIiwic3VjY2VzcyIsIkNvb2tpZXMiLCJzZXQiLCJleHBpcmVzIiwiZXZlbnRzX2pvaW5lZCIsIkpTT04iLCJwYXJzZSIsImdldCIsImRlbGF5IiwiZmFkZU91dCIsImRhdGUiLCJjYWNoZSIsImNzdiIsIkVWRU5UU19EQVRBIiwiaXNfb2ZmaWNpYWwiLCJvbGREYXRlIiwibSIsImV4ZWMiLCJocmVmIiwibWFwTWFuYWdlciIsImYiLCJkaXN0cmljdF9ib3VuZGFyeSIsImdlb0pzb24iLCJjbGlja2FibGUiLCJmZWF0dXJlcyIsImdlb21ldHJ5IiwiZWFjaCIsImtleSIsImFkZERhdGEiLCJzZXRTdHlsZSIsImZpdEJvdW5kcyIsImdldEJvdW5kcyIsImFuaW1hdGUiLCJicmluZ1RvQmFjayIsImVycm9yIiwidHJpZ2dlciIsInZhbCIsInByb3AiLCJpbkFycmF5Iiwib25JdGVtIiwib2ZmSXRlbSIsImtleUNvZGUiLCJzdWJtaXQiLCJmb2N1cyIsInNlcmlhbCIsInByZXZlbnREZWZhdWx0IiwiaGFzQ2xhc3MiLCJwcmUiLCJ3aWR0aCJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBQSxPQUFPQyxnQkFBUCxHQUEwQjtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNFQyxRQUFNLGdCQURSO0FBRUVDLE1BQUk7QUFGTixDQVB3QixFQVd4QjtBQUNFRCxRQUFNLFdBRFI7QUFFRUMsTUFBSTtBQUZOLENBWHdCLEVBZXhCO0FBQ0VELFFBQU0saUJBRFI7QUFFRUMsTUFBSTtBQUZOLENBZndCLENBQTFCOzs7QUNEQTtBQUNBLElBQUlDLFFBQVEsVUFBVUMsQ0FBVixFQUFhO0FBQ3ZCLFNBQU8sVUFBVUMsVUFBVixFQUFzQjs7QUFFM0IsU0FBS0EsVUFBTCxHQUFrQkEsVUFBbEI7O0FBRUEsU0FBS0MsSUFBTCxHQUFZLElBQVo7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQUtDLFNBQUwsR0FBaUJGLFdBQVdHLFVBQVgsQ0FBc0JDLE9BQXRCLENBQThCLFNBQTlCLEVBQXlDLEdBQXpDLEVBQThDQyxXQUE5QyxFQUFqQjs7QUFFQTtBQUNBO0FBQ0E7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T0FBTy9LLFFBQWhELEVBQTBEK0ssT0FBT3hHLElBQWpFLEVBQXVFd0csT0FBTzJDLENBQTlFO0FBQ0Q7QUFDRHpQLFFBQUUsZUFBRixFQUFtQnlKLElBQW5CO0FBRUQsS0FaRCxFQVlHLEVBWkg7QUFhQTtBQUNBLFFBQUlxRCxPQUFPOUssT0FBUCxDQUFlb0UsTUFBZixJQUF5QixDQUF6QixJQUE4QnBHLEVBQUUsTUFBRixFQUFVbVIsUUFBVixDQUFtQixjQUFuQixDQUFsQyxFQUFzRTtBQUNwRW5SLFFBQUUsU0FBRixFQUFhd0wsV0FBYixDQUF5QixrQkFBekI7QUFDQXhMLFFBQUUsTUFBRixFQUFVd0wsV0FBVixDQUFzQixjQUF0QjtBQUNEO0FBQ0YsR0E5QkQ7O0FBZ0NBLE1BQUk0RixNQUFNcFIsRUFBRXFOLE9BQUYsQ0FBVTFOLE9BQU80TixRQUFQLENBQWdCQyxJQUFoQixDQUFxQkMsU0FBckIsQ0FBK0IsQ0FBL0IsQ0FBVixDQUFWO0FBQ0EsTUFBSXpOLEVBQUUsTUFBRixFQUFVbVIsUUFBVixDQUFtQixjQUFuQixDQUFKLEVBQXdDO0FBQ3RDLFFBQUluUixFQUFFTCxNQUFGLEVBQVUwUixLQUFWLE1BQXFCLEdBQXJCLEtBQTZCLENBQUNELElBQUlwUCxPQUFMLElBQWdCb1AsT0FBT0EsSUFBSXBQLE9BQUosQ0FBWW9FLE1BQVosSUFBc0IsQ0FBMUUsQ0FBSixFQUFrRjtBQUNoRnBHLFFBQUUsU0FBRixFQUFheUMsUUFBYixDQUFzQixrQkFBdEI7QUFDRDtBQUNGO0FBR0YsQ0F6TkQsRUF5TkdJLE1Bek5ILEVBeU5XRSxFQXpOWCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBHbG9iYWxcbndpbmRvdy5ldmVudFR5cGVGaWx0ZXJzID0gW1xuICAvLyB7XG4gIC8vICAgbmFtZTogJ0NhbXBhaWduIE9mZmljZScsXG4gIC8vICAgaWQ6ICdjYW1wYWlnbi1vZmZpY2UnLFxuICAvLyAgIG9uSXRlbTogXCI8aW1nIHN0eWxlPSd3aWR0aDogMTRweDsgaGVpZ2h0OiAxNHB4Oycgc3JjPScvaW1nL2ljb24vc3Rhci5wbmcnIC8+XCIsXG4gIC8vICAgb2ZmSXRlbTogXCI8aW1nIHN0eWxlPSd3aWR0aDogMTRweDsgaGVpZ2h0OiAxNHB4Oycgc3JjPScvaW1nL2ljb24vc3Rhci1ncmF5LnBuZycgLz5cIlxuICAvLyB9XG4gIHtcbiAgICBuYW1lOiAnTWVldCBhbmQgR3JlZXQnLFxuICAgIGlkOiAnTWVldC1hbmQtZ3JlZXQnXG4gIH0sXG4gIHtcbiAgICBuYW1lOiAnVG93biBIYWxsJyxcbiAgICBpZDogJ1Rvd24tSGFsbCdcbiAgfSxcbiAge1xuICAgIG5hbWU6ICdWb2x1bnRlZXIgZXZlbnQnLFxuICAgIGlkOiAnVm9sdW50ZWVyLWV2ZW50J1xuICB9XG5dO1xuIiwiLy9DcmVhdGUgYW4gZXZlbnQgbm9kZVxudmFyIEV2ZW50ID0gZnVuY3Rpb24gKCQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XG5cbiAgICB0aGlzLnByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzO1xuXG4gICAgdGhpcy5ibGlwID0gbnVsbDtcbiAgICAvLyAvLyB0aGlzLnRpdGxlID0gcHJvcGVydGllcy5maWVsZF82NTtcbiAgICAvLyB0aGlzLnVybCA9IHByb3BlcnRpZXMuZmllbGRfNjhfcmF3LnVybDtcbiAgICAvLyB0aGlzLmFkZHJlc3MgPSBwcm9wZXJ0aWVzLmZpZWxkXzY0O1xuICAgIC8vIHRoaXMubGlzdGluZyA9IG51bGw7XG4gICAgdGhpcy5jbGFzc05hbWUgPSBwcm9wZXJ0aWVzLmV2ZW50X3R5cGUucmVwbGFjZSgvW15cXHddL2lnLCBcIi1cIikudG9Mb3dlckNhc2UoKTtcblxuICAgIC8vIGlmIChwcm9wZXJ0aWVzLnVybCkge1xuICAgIC8vICAgcHJvcGVydGllcy51cmwgPSBwcm9wZXJ0aWVzLmZhY2Vib29rID8gcHJvcGVydGllcy5mYWNlYm9vayA6IChcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLnR3aXR0ZXIgPyBwcm9wZXJ0aWVzLnR3aXR0ZXIgOiBudWxsXG4gICAgLy8gICAgICAgICAgICAgICAgICAgIClcbiAgICAvLyAgIGlmICghcHJvcGVydGllcy51cmwpIHtcbiAgICAvLyAgICAgcmV0dXJuIG51bGw7XG4gICAgLy8gICB9XG4gICAgLy8gfVxuXG4gICAgdGhpcy5wcm9wcyA9IHt9O1xuICAgIHRoaXMucHJvcHMudGl0bGUgPSBwcm9wZXJ0aWVzLnRpdGxlO1xuICAgIHRoaXMucHJvcHMudXJsID0gcHJvcGVydGllcy51cmw7IC8vcHJvcGVydGllcy51cmwubWF0Y2goL15AL2cpID8gYGh0dHA6Ly90d2l0dGVyLmNvbS8ke3Byb3BlcnRpZXMudXJsfWAgOiBwcm9wZXJ0aWVzLnVybDtcbiAgICB0aGlzLnByb3BzLnN0YXJ0X2RhdGV0aW1lID0gcHJvcGVydGllcy5zdGFydF90aW1lO1xuICAgIHRoaXMucHJvcHMuYWRkcmVzcyA9IHByb3BlcnRpZXMudmVudWU7XG4gICAgdGhpcy5wcm9wcy5zdXBlcmdyb3VwID0gcHJvcGVydGllcy5zdXBlcmdyb3VwO1xuICAgIHRoaXMucHJvcHMuc3RhcnRfdGltZSA9IG1vbWVudChwcm9wZXJ0aWVzLnN0YXJ0X3RpbWUsICdZWVlZLU1NLUREIEhIOm1tOnNzJykuX2Q7XG5cbiAgICAvLyBSZW1vdmUgdGhlIHRpbWV6b25lIGlzc3VlIGZyb21cbiAgICB0aGlzLnByb3BzLnN0YXJ0X3RpbWUgPSBuZXcgRGF0ZSh0aGlzLnByb3BzLnN0YXJ0X3RpbWUudmFsdWVPZigpKTtcbiAgICB0aGlzLnByb3BzLmdyb3VwID0gcHJvcGVydGllcy5ncm91cDtcbiAgICB0aGlzLnByb3BzLkxhdExuZyA9IFtwYXJzZUZsb2F0KHByb3BlcnRpZXMubGF0KSwgcGFyc2VGbG9hdChwcm9wZXJ0aWVzLmxuZyldO1xuICAgIHRoaXMucHJvcHMuZXZlbnRfdHlwZSA9IHByb3BlcnRpZXMuZXZlbnRfdHlwZTtcbiAgICB0aGlzLnByb3BzLmxhdCA9IHByb3BlcnRpZXMubGF0O1xuICAgIHRoaXMucHJvcHMubG5nID0gcHJvcGVydGllcy5sbmc7XG4gICAgdGhpcy5wcm9wcy5maWx0ZXJzID0gcHJvcGVydGllcy5maWx0ZXJzO1xuXG4gICAgdGhpcy5wcm9wcy5zb2NpYWwgPSB7XG4gICAgICBmYWNlYm9vazogcHJvcGVydGllcy5mYWNlYm9vayxcbiAgICAgIGVtYWlsOiBwcm9wZXJ0aWVzLmVtYWlsLFxuICAgICAgcGhvbmU6IHByb3BlcnRpZXMucGhvbmUsXG4gICAgICB0d2l0dGVyOiBwcm9wZXJ0aWVzLnR3aXR0ZXJcbiAgICB9O1xuXG4gICAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbiAoZGlzdGFuY2UsIHppcGNvZGUpIHtcblxuICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAvLyB2YXIgZW5kdGltZSA9IHRoYXQuZW5kVGltZSA/IG1vbWVudCh0aGF0LmVuZFRpbWUpLmZvcm1hdChcImg6bW1hXCIpIDogbnVsbDtcblxuICAgICAgaWYgKHRoaXMucHJvcHMuZXZlbnRfdHlwZSA9PT0gJ0dyb3VwJykge1xuICAgICAgICByZXR1cm4gdGhhdC5yZW5kZXJfZ3JvdXAoZGlzdGFuY2UsIHppcGNvZGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoYXQucmVuZGVyX2V2ZW50KGRpc3RhbmNlLCB6aXBjb2RlKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5yZW5kZXJfZ3JvdXAgPSBmdW5jdGlvbiAoZGlzdGFuY2UsIHppcGNvZGUpIHtcbiAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgdmFyIGxhdCA9IHRoYXQucHJvcHMubGF0O1xuICAgICAgdmFyIGxvbiA9IHRoYXQucHJvcHMubG5nO1xuXG4gICAgICB2YXIgc29jaWFsX2h0bWwgPSAnJztcblxuICAgICAgaWYgKHRoYXQucHJvcHMuc29jaWFsKSB7XG4gICAgICAgIGlmICh0aGF0LnByb3BzLnNvY2lhbC5mYWNlYm9vayAhPT0gJycpIHtcbiAgICAgICAgICBzb2NpYWxfaHRtbCArPSAnPGEgaHJlZj1cXCcnICsgdGhhdC5wcm9wcy5zb2NpYWwuZmFjZWJvb2sgKyAnXFwnIHRhcmdldD1cXCdfYmxhbmtcXCc+PGltZyBzcmM9XFwnL2ltZy9pY29uL2ZhY2Vib29rLnBuZ1xcJyAvPjwvYT4nO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGF0LnByb3BzLnNvY2lhbC50d2l0dGVyICE9PSAnJykge1xuICAgICAgICAgIHNvY2lhbF9odG1sICs9ICc8YSBocmVmPVxcJycgKyB0aGF0LnByb3BzLnNvY2lhbC50d2l0dGVyICsgJ1xcJyB0YXJnZXQ9XFwnX2JsYW5rXFwnPjxpbWcgc3JjPVxcJy9pbWcvaWNvbi90d2l0dGVyLnBuZ1xcJyAvPjwvYT4nO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGF0LnByb3BzLnNvY2lhbC5lbWFpbCAhPT0gJycpIHtcbiAgICAgICAgICBzb2NpYWxfaHRtbCArPSAnPGEgaHJlZj1cXCdtYWlsdG86JyArIHRoYXQucHJvcHMuc29jaWFsLmVtYWlsICsgJ1xcJyA+PGltZyBzcmM9XFwnL2ltZy9pY29uL21haWxjaGltcC5wbmdcXCcgLz48L2E+JztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhhdC5wcm9wcy5zb2NpYWwucGhvbmUgIT09ICcnKSB7XG4gICAgICAgICAgc29jaWFsX2h0bWwgKz0gJyZuYnNwOzxpbWcgc3JjPVxcJy9pbWcvaWNvbi9waG9uZS5wbmdcXCcgLz48c3Bhbj4nICsgdGhhdC5wcm9wcy5zb2NpYWwucGhvbmUgKyAnPC9zcGFuPic7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIG5ld193aW5kb3cgPSB0cnVlO1xuICAgICAgaWYgKHRoYXQucHJvcHMudXJsLm1hdGNoKC9ebWFpbHRvL2cpKSB7XG4gICAgICAgIG5ld193aW5kb3cgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlbmRlcmVkID0gJChcIjxkaXYgY2xhc3M9bW9udHNlcnJhdC8+XCIpLmFkZENsYXNzKCdldmVudC1pdGVtICcgKyB0aGF0LmNsYXNzTmFtZSkuaHRtbCgnXFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWl0ZW0gbGF0byAnICsgdGhhdC5jbGFzc05hbWUgKyAnXCIgbGF0PVwiJyArIGxhdCArICdcIiBsb249XCInICsgbG9uICsgJ1wiPlxcbiAgICAgICAgICAgICAgPGg1IGNsYXNzPVwidGltZS1pbmZvXCI+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGltZS1pbmZvLWRpc3RcIj4nICsgKGRpc3RhbmNlID8gZGlzdGFuY2UgKyBcIm1pJm5ic3A7Jm5ic3A7XCIgOiBcIlwiKSArICc8L3NwYW4+XFxuICAgICAgICAgICAgICA8L2g1PlxcbiAgICAgICAgICAgICAgPGgzPlxcbiAgICAgICAgICAgICAgICA8YSAnICsgKG5ld193aW5kb3cgPyAndGFyZ2V0PVwiX2JsYW5rXCInIDogJycpICsgJyBocmVmPVwiJyArIHRoYXQucHJvcHMudXJsICsgJ1wiPicgKyB0aGF0LnByb3BzLnRpdGxlICsgJzwvYT5cXG4gICAgICAgICAgICAgIDwvaDM+XFxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImxhYmVsLWljb25cIj48L3NwYW4+XFxuICAgICAgICAgICAgICA8aDUgY2xhc3M9XCJldmVudC10eXBlXCI+JyArIHRoYXQucHJvcHMuZXZlbnRfdHlwZSArICc8L2g1PlxcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXCdldmVudC1zb2NpYWxcXCc+XFxuICAgICAgICAgICAgICAgICcgKyBzb2NpYWxfaHRtbCArICdcXG4gICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICcpO1xuXG4gICAgICByZXR1cm4gcmVuZGVyZWQuaHRtbCgpO1xuICAgIH07XG5cbiAgICB0aGlzLnJlbmRlcl9ldmVudCA9IGZ1bmN0aW9uIChkaXN0YW5jZSwgemlwY29kZSkge1xuICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICB2YXIgZGF0ZXRpbWUgPSBtb21lbnQodGhhdC5wcm9wcy5zdGFydF90aW1lKS5mb3JtYXQoXCJNTU0gREQgKGRkZCkgaDptbWFcIik7XG4gICAgICB2YXIgbGF0ID0gdGhhdC5wcm9wcy5sYXQ7XG4gICAgICB2YXIgbG9uID0gdGhhdC5wcm9wcy5sbmc7XG5cbiAgICAgIHZhciByZW5kZXJlZCA9ICQoXCI8ZGl2IGNsYXNzPW1vbnRzZXJyYXQvPlwiKS5hZGRDbGFzcygnZXZlbnQtaXRlbSAnICsgdGhhdC5jbGFzc05hbWUpLmh0bWwoJ1xcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1pdGVtIGxhdG8gJyArIHRoYXQuY2xhc3NOYW1lICsgJ1wiIGxhdD1cIicgKyBsYXQgKyAnXCIgbG9uPVwiJyArIGxvbiArICdcIj5cXG4gICAgICAgICAgICAgIDxoNSBjbGFzcz1cInRpbWUtaW5mb1wiPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRpbWUtaW5mby1kaXN0XCI+JyArIChkaXN0YW5jZSA/IGRpc3RhbmNlICsgXCJtaSZuYnNwOyZuYnNwO1wiIDogXCJcIikgKyAnPC9zcGFuPicgKyBkYXRldGltZSArICdcXG4gICAgICAgICAgICAgIDwvaDU+XFxuICAgICAgICAgICAgICA8aDM+XFxuICAgICAgICAgICAgICAgIDxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCInICsgdGhhdC5wcm9wcy51cmwgKyAnXCI+JyArIHRoYXQucHJvcHMudGl0bGUgKyAnPC9hPlxcbiAgICAgICAgICAgICAgPC9oMz5cXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibGFiZWwtaWNvblwiPjwvc3Bhbj5cXG4gICAgICAgICAgICAgIDxoNSBjbGFzcz1cImV2ZW50LXR5cGVcIj4nICsgdGhhdC5wcm9wcy5ldmVudF90eXBlICsgJzwvaDU+XFxuICAgICAgICAgICAgICA8cD4nICsgdGhhdC5wcm9wcy5hZGRyZXNzICsgJzwvcD5cXG4gICAgICAgICAgICAgIDxkaXY+XFxuICAgICAgICAgICAgICAgIDxhIGNsYXNzPVwicnN2cC1saW5rXCIgaHJlZj1cIicgKyB0aGF0LnByb3BzLnVybCArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIj5SU1ZQPC9hPlxcbiAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgJyk7XG5cbiAgICAgIHJldHVybiByZW5kZXJlZC5odG1sKCk7XG4gICAgfTtcbiAgfTtcbiAgXG59KGpRdWVyeSk7IC8vRW5kIG9mIGV2ZW50c1xuIiwiLyoqKipcbiAqICBNYXBNYW5hZ2VyIHByb3BlclxuICovXG52YXIgTWFwTWFuYWdlciA9IGZ1bmN0aW9uICgkLCBkMywgbGVhZmxldCkge1xuICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50RGF0YSwgY2FtcGFpZ25PZmZpY2VzLCB6aXBjb2Rlcywgb3B0aW9ucykge1xuICAgIHZhciBhbGxGaWx0ZXJzID0gd2luZG93LmV2ZW50VHlwZUZpbHRlcnMubWFwKGZ1bmN0aW9uIChpKSB7XG4gICAgICByZXR1cm4gaS5pZDtcbiAgICB9KTtcblxuICAgIHZhciBwb3B1cCA9IEwucG9wdXAoKTtcbiAgICB2YXIgb3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdmFyIHppcGNvZGVzID0gemlwY29kZXMucmVkdWNlKGZ1bmN0aW9uICh6aXBzLCBpdGVtKSB7XG4gICAgICB6aXBzW2l0ZW0uemlwXSA9IGl0ZW07cmV0dXJuIHppcHM7XG4gICAgfSwge30pO1xuXG4gICAgdmFyIGN1cnJlbnRfZmlsdGVycyA9IFtdLFxuICAgICAgICBjdXJyZW50X3ppcGNvZGUgPSBcIlwiLFxuICAgICAgICBjdXJyZW50X2Rpc3RhbmNlID0gXCJcIixcbiAgICAgICAgY3VycmVudF9zb3J0ID0gXCJcIjtcblxuICAgIHZhciBvcmlnaW5hbEV2ZW50TGlzdCA9IGV2ZW50RGF0YS5tYXAoZnVuY3Rpb24gKGQpIHtcbiAgICAgIHJldHVybiBuZXcgRXZlbnQoZCk7XG4gICAgfSk7XG4gICAgdmFyIGV2ZW50c0xpc3QgPSBvcmlnaW5hbEV2ZW50TGlzdC5zbGljZSgwKTtcblxuICAgIC8vIHZhciBvZmZpY2VMaXN0ID0gY2FtcGFpZ25PZmZpY2VzLm1hcChmdW5jdGlvbihkKSB7IHJldHVybiBuZXcgQ2FtcGFpZ25PZmZpY2VzKGQpOyB9KTtcblxuICAgIC8vIHZhciBtYXBib3hUaWxlcyA9IGxlYWZsZXQudGlsZUxheWVyKCdodHRwOi8ve3N9LnRpbGVzLm1hcGJveC5jb20vdjQvbWFwYm94LnN0cmVldHMve3p9L3t4fS97eX0ucG5nP2FjY2Vzc190b2tlbj0nICsgbGVhZmxldC5tYXBib3guYWNjZXNzVG9rZW4sIHsgYXR0cmlidXRpb246ICc8YSBocmVmPVwiaHR0cDovL3d3dy5vcGVuc3RyZWV0bWFwLm9yZy9jb3B5cmlnaHRcIiB0YXJnZXQ9XCJfYmxhbmtcIj4mY29weTsgT3BlblN0cmVldE1hcCBjb250cmlidXRvcnM8L2E+J30pO1xuXG4gICAgdmFyIG1hcGJveFRpbGVzID0gbGVhZmxldC50aWxlTGF5ZXIoJ2h0dHBzOi8vY2FydG9kYi1iYXNlbWFwcy17c30uZ2xvYmFsLnNzbC5mYXN0bHkubmV0L2xpZ2h0X2FsbC97en0ve3h9L3t5fS5wbmcnLCB7XG4gICAgICBtYXhab29tOiAxOCxcbiAgICAgIGF0dHJpYnV0aW9uOiAnJmNvcHk7IDxhIGhyZWY9XCJodHRwOi8vd3d3Lm9wZW5zdHJlZXRtYXAub3JnL2NvcHlyaWdodFwiPk9wZW5TdHJlZXRNYXA8L2E+LCAmY29weTs8YSBocmVmPVwiaHR0cHM6Ly9jYXJ0by5jb20vYXR0cmlidXRpb25cIj5DQVJUTzwvYT4nXG4gICAgfSk7XG5cbiAgICAvLyB2YXIgbWFwYm94VGlsZXMgPSBsZWFmbGV0LnRpbGVMYXllcignaHR0cHM6Ly9jYXJ0b2RiLWJhc2VtYXBzLXtzfS5nbG9iYWwuc3NsLmZhc3RseS5uZXQvbGlnaHRfYWxsL3t6fS97eH0ve3l9LnBuZycsIHtcbiAgICAvLyAgIG1heFpvb206IDE4LFxuICAgIC8vICAgYXR0cmlidXRpb246ICcmY29weTsgPGEgaHJlZj1cImh0dHA6Ly93d3cub3BlbnN0cmVldG1hcC5vcmcvY29weXJpZ2h0XCI+T3BlblN0cmVldE1hcDwvYT4sICZjb3B5OzxhIGhyZWY9XCJodHRwczovL2NhcnRvLmNvbS9hdHRyaWJ1dGlvblwiPkNBUlRPPC9hPidcbiAgICAvLyB9KTtcblxuICAgIHZhciBDQU1QQUlHTl9PRkZJQ0VfSUNPTiA9IEwuaWNvbih7XG4gICAgICBpY29uVXJsOiAnLy9kMmJxMnlmMzFsanUzcS5jbG91ZGZyb250Lm5ldC9pbWcvaWNvbi9zdGFyLnBuZycsXG4gICAgICBpY29uU2l6ZTogWzE3LCAxNF0gfSk7XG4gICAgdmFyIEdPVFZfQ0VOVEVSX0lDT04gPSBMLmljb24oe1xuICAgICAgaWNvblVybDogJy8vZDJicTJ5ZjMxbGp1M3EuY2xvdWRmcm9udC5uZXQvaW1nL2ljb24vZ290di1zdGFyLnBuZycsXG4gICAgICBpY29uU2l6ZTogWzEzLCAxMF0gfSk7XG4gICAgdmFyIGRlZmF1bHRDb29yZCA9IG9wdGlvbnMgJiYgb3B0aW9ucy5kZWZhdWx0Q29vcmQgPyBvcHRpb25zLmRlZmF1bHRDb29yZCA6IHsgY2VudGVyOiBbMzcuOCwgLTk2LjldLCB6b29tOiA0IH07XG5cbiAgICB2YXIgY2VudHJhbE1hcCA9IG5ldyBsZWFmbGV0Lk1hcChcIm1hcC1jb250YWluZXJcIiwgd2luZG93LmN1c3RvbU1hcENvb3JkID8gd2luZG93LmN1c3RvbU1hcENvb3JkIDogZGVmYXVsdENvb3JkKS5hZGRMYXllcihtYXBib3hUaWxlcyk7XG4gICAgaWYgKGNlbnRyYWxNYXApIHt9XG5cbiAgICB2YXIgb3ZlcmxheXMgPSBMLmxheWVyR3JvdXAoKS5hZGRUbyhjZW50cmFsTWFwKTtcbiAgICB2YXIgb2ZmaWNlcyA9IEwubGF5ZXJHcm91cCgpLmFkZFRvKGNlbnRyYWxNYXApO1xuICAgIHZhciBnb3R2Q2VudGVyID0gTC5sYXllckdyb3VwKCkuYWRkVG8oY2VudHJhbE1hcCk7XG5cbiAgICB2YXIgY2FtcGFpZ25PZmZpY2VMYXllciA9IEwubGF5ZXJHcm91cCgpLmFkZFRvKGNlbnRyYWxNYXApO1xuXG4gICAgLy9pbml0aWFsaXplIG1hcFxuICAgIHZhciBmaWx0ZXJlZEV2ZW50cyA9IFtdO1xuICAgIHZhciBtb2R1bGUgPSB7fTtcblxuICAgIHZhciBfcG9wdXBFdmVudHMgPSBmdW5jdGlvbiBfcG9wdXBFdmVudHMoZXZlbnQpIHtcbiAgICAgIHZhciB0YXJnZXQgPSBldmVudC50YXJnZXQuX2xhdGxuZztcblxuICAgICAgdmFyIGZpbHRlcmVkID0gZXZlbnRzTGlzdC5maWx0ZXIoZnVuY3Rpb24gKGQpIHtcblxuICAgICAgICByZXR1cm4gdGFyZ2V0LmxhdCA9PSBkLnByb3BzLkxhdExuZ1swXSAmJiB0YXJnZXQubG5nID09IGQucHJvcHMuTGF0TG5nWzFdICYmICghY3VycmVudF9maWx0ZXJzIHx8IGN1cnJlbnRfZmlsdGVycy5sZW5ndGggPT0gMCB8fCAkKGQucHJvcGVydGllcy5maWx0ZXJzKS5ub3QoY3VycmVudF9maWx0ZXJzKS5sZW5ndGggIT0gZC5wcm9wZXJ0aWVzLmZpbHRlcnMubGVuZ3RoKTtcbiAgICAgIH0pLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEucHJvcHMuc3RhcnRfdGltZSAtIGIucHJvcHMuc3RhcnRfdGltZTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgZGl2ID0gJChcIjxkaXYgLz5cIikuYXBwZW5kKGZpbHRlcmVkLmxlbmd0aCA+IDEgPyBcIjxoMyBjbGFzcz0nc2NoZWQtY291bnQnPlwiICsgZmlsdGVyZWQubGVuZ3RoICsgXCIgUmVzdWx0czwvaDM+XCIgOiBcIlwiKS5hcHBlbmQoJChcIjxkaXYgY2xhc3M9J3BvcHVwLWxpc3QtY29udGFpbmVyJy8+XCIpLmFwcGVuZCgkKFwiPHVsIGNsYXNzPSdwb3B1cC1saXN0Jz5cIilcbiAgICAgIC5hcHBlbmQoZmlsdGVyZWQubWFwKGZ1bmN0aW9uIChkKSB7XG4gICAgICAgIHJldHVybiAkKFwiPGxpIGNsYXNzPW1vbnRzZXJyYXQvPlwiKS5hZGRDbGFzcyhkLmlzRnVsbCA/IFwiaXMtZnVsbFwiIDogXCJub3QtZnVsbFwiKS5hZGRDbGFzcyhkLnZpc2libGUgPyBcImlzLXZpc2libGVcIiA6IFwibm90LXZpc2libGVcIikuYXBwZW5kKGQucmVuZGVyKCkpO1xuICAgICAgfSkpKSk7XG5cbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBMLnBvcHVwKCkuc2V0TGF0TG5nKGV2ZW50LnRhcmdldC5fbGF0bG5nKS5zZXRDb250ZW50KGRpdi5odG1sKCkpLm9wZW5PbihjZW50cmFsTWFwKTtcbiAgICAgIH0sIDEwMCk7XG4gICAgfTtcblxuICAgIC8qKipcbiAgICAgKiBJbml0aWFsaXphdGlvblxuICAgICAqL1xuICAgIHZhciBpbml0aWFsaXplID0gZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgICAgIHZhciB1bmlxdWVMb2NzID0gZXZlbnRzTGlzdC5yZWR1Y2UoZnVuY3Rpb24gKGFyciwgaXRlbSkge1xuICAgICAgICB2YXIgY2xhc3NOYW1lID0gaXRlbS5wcm9wZXJ0aWVzLmZpbHRlcnMuam9pbihcIiBcIik7XG4gICAgICAgIGlmIChhcnIuaW5kZXhPZihpdGVtLnByb3BlcnRpZXMubGF0ICsgXCJ8fFwiICsgaXRlbS5wcm9wZXJ0aWVzLmxuZyArIFwifHxcIiArIGNsYXNzTmFtZSkgPj0gMCkge1xuICAgICAgICAgIHJldHVybiBhcnI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXJyLnB1c2goaXRlbS5wcm9wZXJ0aWVzLmxhdCArIFwifHxcIiArIGl0ZW0ucHJvcGVydGllcy5sbmcgKyBcInx8XCIgKyBjbGFzc05hbWUpO1xuICAgICAgICAgIHJldHVybiBhcnI7XG4gICAgICAgIH1cbiAgICAgIH0sIFtdKTtcblxuICAgICAgdW5pcXVlTG9jcyA9IHVuaXF1ZUxvY3MubWFwKGZ1bmN0aW9uIChkKSB7XG4gICAgICAgIHZhciBzcGxpdCA9IGQuc3BsaXQoXCJ8fFwiKTtcbiAgICAgICAgcmV0dXJuIHsgbGF0TG5nOiBbcGFyc2VGbG9hdChzcGxpdFswXSksIHBhcnNlRmxvYXQoc3BsaXRbMV0pXSxcbiAgICAgICAgICBjbGFzc05hbWU6IHNwbGl0WzJdIH07XG4gICAgICB9KTtcblxuICAgICAgdW5pcXVlTG9jcy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG5cbiAgICAgICAgLy8gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gaWYgKGl0ZW0uY2xhc3NOYW1lID09IFwiY2FtcGFpZ24tb2ZmaWNlXCIpIHtcbiAgICAgICAgLy8gICBMLm1hcmtlcihpdGVtLmxhdExuZywge2ljb246IENBTVBBSUdOX09GRklDRV9JQ09OLCBjbGFzc05hbWU6IGl0ZW0uY2xhc3NOYW1lfSlcbiAgICAgICAgLy8gICAgIC5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7IF9wb3B1cEV2ZW50cyhlKTsgfSlcbiAgICAgICAgLy8gICAgIC5hZGRUbyhvZmZpY2VzKTtcbiAgICAgICAgLy8gfSBlbHNlIGlmIChpdGVtLmNsYXNzTmFtZSA9PSBcImdvdHYtY2VudGVyXCIpIHtcbiAgICAgICAgLy8gICBMLm1hcmtlcihpdGVtLmxhdExuZywge2ljb246IEdPVFZfQ0VOVEVSX0lDT04sIGNsYXNzTmFtZTogaXRlbS5jbGFzc05hbWV9KVxuICAgICAgICAvLyAgICAgLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHsgX3BvcHVwRXZlbnRzKGUpOyB9KVxuICAgICAgICAvLyAgICAgLmFkZFRvKGdvdHZDZW50ZXIpO1xuICAgICAgICAvLyB9ZWxzZVxuICAgICAgICAvLyBpZiAoaXRlbS5jbGFzc05hbWUubWF0Y2goL2Jlcm5pZVxcLWV2ZW50L2lnKSkge1xuICAgICAgICAvLyAgIEwuY2lyY2xlTWFya2VyKGl0ZW0ubGF0TG5nLCB7IHJhZGl1czogMTIsIGNsYXNzTmFtZTogaXRlbS5jbGFzc05hbWUsIGNvbG9yOiAnd2hpdGUnLCBmaWxsQ29sb3I6ICcjRjU1QjVCJywgb3BhY2l0eTogMC44LCBmaWxsT3BhY2l0eTogMC43LCB3ZWlnaHQ6IDIgfSlcbiAgICAgICAgLy8gICAgIC5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7IF9wb3B1cEV2ZW50cyhlKTsgfSlcbiAgICAgICAgLy8gICAgIC5hZGRUbyhvdmVybGF5cyk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgaWYgKGl0ZW0uY2xhc3NOYW1lID09ICdncm91cC1tZWV0aW5nJykge1xuICAgICAgICAgIEwuY2lyY2xlTWFya2VyKGl0ZW0ubGF0TG5nLCB7IHJhZGl1czogNSwgY2xhc3NOYW1lOiBpdGVtLmNsYXNzTmFtZSwgY29sb3I6ICd3aGl0ZScsIGZpbGxDb2xvcjogJyNlNzEwMjknLCBvcGFjaXR5OiAwLjgsIGZpbGxPcGFjaXR5OiAwLjcsIHdlaWdodDogMiB9KS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgX3BvcHVwRXZlbnRzKGUpO1xuICAgICAgICAgIH0pLmFkZFRvKG92ZXJsYXlzKTtcbiAgICAgICAgfSBlbHNlIGlmIChpdGVtLmNsYXNzTmFtZSA9PSAnZ3JvdXAnKSB7XG4gICAgICAgICAgTC5jaXJjbGVNYXJrZXIoaXRlbS5sYXRMbmcsIHsgcmFkaXVzOiA0LCBjbGFzc05hbWU6IGl0ZW0uY2xhc3NOYW1lLCBjb2xvcjogJ3doaXRlJywgZmlsbENvbG9yOiAnI0ZGMzI1MScsIG9wYWNpdHk6IDAuNiwgZmlsbE9wYWNpdHk6IDAuOSwgd2VpZ2h0OiAyIH0pLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBfcG9wdXBFdmVudHMoZSk7XG4gICAgICAgICAgfSkuYWRkVG8ob3ZlcmxheXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIEwuY2lyY2xlTWFya2VyKGl0ZW0ubGF0TG5nLCB7IHJhZGl1czogNSwgY2xhc3NOYW1lOiBpdGVtLmNsYXNzTmFtZSwgY29sb3I6ICd3aGl0ZScsIGZpbGxDb2xvcjogJyNGRjMyNTEnLCBvcGFjaXR5OiAwLjgsIGZpbGxPcGFjaXR5OiAwLjcsIHdlaWdodDogMiB9KS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgX3BvcHVwRXZlbnRzKGUpO1xuICAgICAgICAgIH0pLmFkZFRvKG92ZXJsYXlzKTtcbiAgICAgICAgfVxuICAgICAgICAvLyB9LCAxMCk7XG4gICAgICB9KTtcblxuICAgICAgLy8gJChcIi5sZWFmbGV0LW92ZXJsYXktcGFuZVwiKS5maW5kKFwiLmJlcm5pZS1ldmVudFwiKS5wYXJlbnQoKS5wcmVwZW5kVG8oJy5sZWFmbGV0LXpvb20tYW5pbWF0ZWQnKTtcbiAgICB9OyAvLyBFbmQgb2YgaW5pdGlhbGl6ZVxuXG4gICAgdmFyIHRvTWlsZSA9IGZ1bmN0aW9uIHRvTWlsZShtZXRlcikge1xuICAgICAgcmV0dXJuIG1ldGVyICogMC4wMDA2MjEzNztcbiAgICB9O1xuXG4gICAgdmFyIGZpbHRlckV2ZW50c0J5Q29vcmRzID0gZnVuY3Rpb24gZmlsdGVyRXZlbnRzQnlDb29yZHMoY2VudGVyLCBkaXN0YW5jZSwgZmlsdGVyVHlwZXMpIHtcblxuICAgICAgdmFyIHppcExhdExuZyA9IGxlYWZsZXQubGF0TG5nKGNlbnRlcik7XG5cbiAgICAgIHZhciBmaWx0ZXJlZCA9IGV2ZW50c0xpc3QuZmlsdGVyKGZ1bmN0aW9uIChkKSB7XG4gICAgICAgIHZhciBkaXN0ID0gdG9NaWxlKHppcExhdExuZy5kaXN0YW5jZVRvKGQucHJvcHMuTGF0TG5nKSk7XG4gICAgICAgIGlmIChkaXN0IDwgZGlzdGFuY2UpIHtcblxuICAgICAgICAgIGQuZGlzdGFuY2UgPSBNYXRoLnJvdW5kKGRpc3QgKiAxMCkgLyAxMDtcblxuICAgICAgICAgIC8vSWYgbm8gZmlsdGVyIHdhcyBhIG1hdGNoIG9uIHRoZSBjdXJyZW50IGZpbHRlclxuICAgICAgICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZGVmYXVsdENvb3JkICYmICFmaWx0ZXJUeXBlcykge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCQoZC5wcm9wcy5maWx0ZXJzKS5ub3QoZmlsdGVyVHlwZXMpLmxlbmd0aCA9PSBkLnByb3BzLmZpbHRlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBmaWx0ZXJlZDtcbiAgICB9O1xuXG4gICAgdmFyIGZpbHRlckV2ZW50cyA9IGZ1bmN0aW9uIGZpbHRlckV2ZW50cyh6aXBjb2RlLCBkaXN0YW5jZSwgZmlsdGVyVHlwZXMpIHtcbiAgICAgIHJldHVybiBmaWx0ZXJFdmVudHNCeUNvb3JkcyhbcGFyc2VGbG9hdCh6aXBjb2RlLmxhdCksIHBhcnNlRmxvYXQoemlwY29kZS5sb24pXSwgZGlzdGFuY2UsIGZpbHRlclR5cGVzKTtcbiAgICB9O1xuXG4gICAgdmFyIHNvcnRFdmVudHMgPSBmdW5jdGlvbiBzb3J0RXZlbnRzKGZpbHRlcmVkRXZlbnRzLCBzb3J0VHlwZSkge1xuICAgICAgc3dpdGNoIChzb3J0VHlwZSkge1xuICAgICAgICBjYXNlICdkaXN0YW5jZSc6XG4gICAgICAgICAgZmlsdGVyZWRFdmVudHMgPSBmaWx0ZXJlZEV2ZW50cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYS5kaXN0YW5jZSAtIGIuZGlzdGFuY2U7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgZmlsdGVyZWRFdmVudHMgPSBmaWx0ZXJlZEV2ZW50cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYS5wcm9wcy5zdGFydF90aW1lIC0gYi5wcm9wcy5zdGFydF90aW1lO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICAvLyBmaWx0ZXJlZEV2ZW50cyA9IGZpbHRlcmVkRXZlbnRzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgLy8gICB2YXIgYUZ1bGwgPSBhLmlzRnVsbCgpO1xuICAgICAgLy8gICB2YXIgYkZ1bGwgPSBiLmlzRnVsbCgpO1xuXG4gICAgICAvLyAgIGlmIChhRnVsbCAmJiBiRnVsbCkgeyByZXR1cm4gMDsgfVxuICAgICAgLy8gICBlbHNlIGlmIChhRnVsbCAmJiAhYkZ1bGwpIHsgcmV0dXJuIDE7IH1cbiAgICAgIC8vICAgZWxzZSBpZiAoIWFGdWxsICYmIGJGdWxsKSB7IHJldHVybiAtMTsgfVxuICAgICAgLy8gfSk7XG4gICAgICAvL3NvcnQgYnkgZnVsbG5lc3M7XG4gICAgICAvLy4uXG4gICAgICByZXR1cm4gZmlsdGVyZWRFdmVudHM7XG4gICAgfTtcblxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgaW5pdGlhbGl6ZSgpO1xuICAgIH0sIDEwKTtcblxuICAgIG1vZHVsZS5fZXZlbnRzTGlzdCA9IGV2ZW50c0xpc3Q7XG4gICAgbW9kdWxlLl96aXBjb2RlcyA9IHppcGNvZGVzO1xuICAgIG1vZHVsZS5fb3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICAvKlxuICAgICogUmVmcmVzaCBtYXAgd2l0aCBuZXcgZXZlbnRzIG1hcFxuICAgICovXG4gICAgdmFyIF9yZWZyZXNoTWFwID0gZnVuY3Rpb24gX3JlZnJlc2hNYXAoKSB7XG4gICAgICBvdmVybGF5cy5jbGVhckxheWVycygpO1xuICAgICAgaW5pdGlhbGl6ZSgpO1xuICAgIH07XG5cbiAgICBtb2R1bGUuZmlsdGVyQnlUeXBlID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgIGlmICgkKGZpbHRlcnMpLm5vdCh0eXBlKS5sZW5ndGggIT0gMCB8fCAkKHR5cGUpLm5vdChmaWx0ZXJzKS5sZW5ndGggIT0gMCkge1xuICAgICAgICBjdXJyZW50X2ZpbHRlcnMgPSB0eXBlO1xuXG4gICAgICAgIC8vRmlsdGVyIG9ubHkgaXRlbXMgaW4gdGhlIGxpc3RcbiAgICAgICAgLy8gZXZlbnRzTGlzdCA9IG9yaWdpbmFsRXZlbnRMaXN0LmZpbHRlcihmdW5jdGlvbihldmVudEl0ZW0pIHtcbiAgICAgICAgLy8gICB2YXIgdW5tYXRjaCA9ICQoZXZlbnRJdGVtLnByb3BlcnRpZXMuZmlsdGVycykubm90KGZpbHRlcnMpO1xuICAgICAgICAvLyAgIHJldHVybiB1bm1hdGNoLmxlbmd0aCAhPSBldmVudEl0ZW0ucHJvcGVydGllcy5maWx0ZXJzLmxlbmd0aDtcbiAgICAgICAgLy8gfSk7XG5cblxuICAgICAgICAvLyB2YXIgdGFyZ2V0ID0gdHlwZS5tYXAoZnVuY3Rpb24oaSkgeyByZXR1cm4gXCIuXCIgKyBpIH0pLmpvaW4oXCIsXCIpO1xuICAgICAgICAvLyAkKFwiLmxlYWZsZXQtb3ZlcmxheS1wYW5lXCIpLmZpbmQoXCJwYXRoOm5vdChcIit0eXBlLm1hcChmdW5jdGlvbihpKSB7IHJldHVybiBcIi5cIiArIGkgfSkuam9pbihcIixcIikgKyBcIilcIilcblxuICAgICAgICB2YXIgdG9IaWRlID0gJChhbGxGaWx0ZXJzKS5ub3QodHlwZSk7XG5cbiAgICAgICAgaWYgKHRvSGlkZSAmJiB0b0hpZGUubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHRvSGlkZSA9IHRvSGlkZS5zcGxpY2UoMCwgdG9IaWRlLmxlbmd0aCk7XG4gICAgICAgICAgJChcIi5sZWFmbGV0LW92ZXJsYXktcGFuZVwiKS5maW5kKFwiLlwiICsgdG9IaWRlLmpvaW4oXCIsLlwiKSkuaGlkZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGUgJiYgdHlwZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgJChcIi5sZWFmbGV0LW92ZXJsYXktcGFuZVwiKS5maW5kKFwiLlwiICsgdHlwZS5qb2luKFwiLC5cIikpLnNob3coKTtcbiAgICAgICAgICAvLyBfcmVmcmVzaE1hcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9TcGVjaWZpY2FsbHkgZm9yIGNhbXBhaWduIG9mZmljZVxuICAgICAgICBpZiAoIXR5cGUpIHtcbiAgICAgICAgICBjZW50cmFsTWFwLnJlbW92ZUxheWVyKG9mZmljZXMpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgJiYgdHlwZS5pbmRleE9mKCdjYW1wYWlnbi1vZmZpY2UnKSA8IDApIHtcbiAgICAgICAgICBjZW50cmFsTWFwLnJlbW92ZUxheWVyKG9mZmljZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNlbnRyYWxNYXAuYWRkTGF5ZXIob2ZmaWNlcyk7XG4gICAgICAgIH1cblxuICAgICAgICAvL0ZvciBnb3R2LWNlbnRlcnNcbiAgICAgICAgaWYgKCF0eXBlKSB7XG4gICAgICAgICAgY2VudHJhbE1hcC5yZW1vdmVMYXllcihnb3R2Q2VudGVyKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlICYmIHR5cGUuaW5kZXhPZignZ290di1jZW50ZXInKSA8IDApIHtcbiAgICAgICAgICBjZW50cmFsTWFwLnJlbW92ZUxheWVyKGdvdHZDZW50ZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNlbnRyYWxNYXAuYWRkTGF5ZXIoZ290dkNlbnRlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9O1xuXG4gICAgbW9kdWxlLmZpbHRlckJ5Q29vcmRzID0gZnVuY3Rpb24gKGNvb3JkcywgZGlzdGFuY2UsIHNvcnQsIGZpbHRlclR5cGVzKSB7XG4gICAgICAvL1JlbW92ZSBsaXN0XG4gICAgICBkMy5zZWxlY3QoXCIjZXZlbnQtbGlzdFwiKS5zZWxlY3RBbGwoXCJsaVwiKS5yZW1vdmUoKTtcblxuICAgICAgdmFyIGZpbHRlcmVkID0gZmlsdGVyRXZlbnRzQnlDb29yZHMoY29vcmRzLCBwYXJzZUludChkaXN0YW5jZSksIGZpbHRlclR5cGVzKTtcbiAgICAgIC8vU29ydCBldmVudFxuICAgICAgZmlsdGVyZWQgPSBzb3J0RXZlbnRzKGZpbHRlcmVkLCBzb3J0LCBmaWx0ZXJUeXBlcyk7XG5cbiAgICAgIC8vUmVuZGVyIGV2ZW50XG4gICAgICB2YXIgZXZlbnRMaXN0ID0gZDMuc2VsZWN0KFwiI2V2ZW50LWxpc3RcIikuc2VsZWN0QWxsKFwibGlcIikuZGF0YShmaWx0ZXJlZCwgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgcmV0dXJuIGQucHJvcHMudXJsO1xuICAgICAgfSk7XG5cbiAgICAgIGV2ZW50TGlzdC5lbnRlcigpLmFwcGVuZChcImxpXCIpLmF0dHIoXCJjbGFzc1wiLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICByZXR1cm4gKGQuaXNGdWxsID8gJ2lzLWZ1bGwnIDogJ25vdC1mdWxsJykgKyBcIiBcIiArICh0aGlzLnZpc2libGUgPyBcImlzLXZpc2libGVcIiA6IFwibm90LXZpc2libGVcIik7XG4gICAgICB9KS5jbGFzc2VkKFwibGF0b1wiLCB0cnVlKS5odG1sKGZ1bmN0aW9uIChkKSB7XG4gICAgICAgIHJldHVybiBkLnJlbmRlcihkLmRpc3RhbmNlKTtcbiAgICAgIH0pO1xuXG4gICAgICBldmVudExpc3QuZXhpdCgpLnJlbW92ZSgpO1xuXG4gICAgICAvL2FkZCBhIGhpZ2hsaWdodGVkIG1hcmtlclxuICAgICAgZnVuY3Rpb24gYWRkaGlnaGxpZ2h0ZWRNYXJrZXIobGF0LCBsb24pIHtcbiAgICAgICAgdmFyIGhpZ2hsaWdodGVkTWFya2VyID0gbmV3IEwuY2lyY2xlTWFya2VyKFtsYXQsIGxvbl0sIHsgcmFkaXVzOiA1LCBjb2xvcjogJyNlYTUwNGUnLCBmaWxsQ29sb3I6ICcjMTQ2MkEyJywgb3BhY2l0eTogMC44LCBmaWxsT3BhY2l0eTogMC43LCB3ZWlnaHQ6IDIgfSkuYWRkVG8oY2VudHJhbE1hcCk7XG4gICAgICAgIC8vIGV2ZW50IGxpc3RlbmVyIHRvIHJlbW92ZSBoaWdobGlnaHRlZCBtYXJrZXJzXG4gICAgICAgICQoXCIubm90LWZ1bGxcIikubW91c2VvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNlbnRyYWxNYXAucmVtb3ZlTGF5ZXIoaGlnaGxpZ2h0ZWRNYXJrZXIpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gZXZlbnQgbGlzdGVuZXIgdG8gZ2V0IHRoZSBtb3VzZW92ZXJcbiAgICAgICQoXCIubm90LWZ1bGxcIikubW91c2VvdmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCh0aGlzKS50b2dnbGVDbGFzcyhcImhpZ2hsaWdodFwiKTtcbiAgICAgICAgdmFyIGNNYXJrZXJMYXQgPSAkKHRoaXMpLmNoaWxkcmVuKCdkaXYnKS5hdHRyKCdsYXQnKTtcbiAgICAgICAgdmFyIGNNYXJrZXJMb24gPSAkKHRoaXMpLmNoaWxkcmVuKCdkaXYnKS5hdHRyKCdsb24nKTtcbiAgICAgICAgLy8gZnVuY3Rpb24gY2FsbCB0byBhZGQgaGlnaGxpZ2h0ZWQgbWFya2VyXG4gICAgICAgIGFkZGhpZ2hsaWdodGVkTWFya2VyKGNNYXJrZXJMYXQsIGNNYXJrZXJMb24pO1xuICAgICAgfSk7XG5cbiAgICAgIC8vUHVzaCBhbGwgZnVsbCBpdGVtcyB0byBlbmQgb2YgbGlzdFxuICAgICAgJChcImRpdiNldmVudC1saXN0LWNvbnRhaW5lciB1bCNldmVudC1saXN0IGxpLmlzLWZ1bGxcIikuYXBwZW5kVG8oXCJkaXYjZXZlbnQtbGlzdC1jb250YWluZXIgdWwjZXZlbnQtbGlzdFwiKTtcblxuICAgICAgLy9Nb3ZlIGNhbXBhaWduIG9mZmljZXMgdG9cblxuICAgICAgdmFyIG9mZmljZUNvdW50ID0gJChcImRpdiNldmVudC1saXN0LWNvbnRhaW5lciB1bCNldmVudC1saXN0IGxpIC5jYW1wYWlnbi1vZmZpY2VcIikubGVuZ3RoO1xuICAgICAgJChcIiNoaWRlLXNob3ctb2ZmaWNlXCIpLmF0dHIoXCJkYXRhLWNvdW50XCIsIG9mZmljZUNvdW50KTtcbiAgICAgICQoXCIjY2FtcGFpZ24tb2ZmLWNvdW50XCIpLnRleHQob2ZmaWNlQ291bnQpO1xuICAgICAgJChcInNlY3Rpb24jY2FtcGFpZ24tb2ZmaWNlcyB1bCNjYW1wYWlnbi1vZmZpY2UtbGlzdCAqXCIpLnJlbW92ZSgpO1xuICAgICAgJChcImRpdiNldmVudC1saXN0LWNvbnRhaW5lciB1bCNldmVudC1saXN0IGxpIC5jYW1wYWlnbi1vZmZpY2VcIikucGFyZW50KCkuYXBwZW5kVG8oXCJzZWN0aW9uI2NhbXBhaWduLW9mZmljZXMgdWwjY2FtcGFpZ24tb2ZmaWNlLWxpc3RcIik7XG4gICAgfTtcblxuICAgIC8qKipcbiAgICAgKiBGSUxURVIoKSAgLS0gV2hlbiB0aGUgdXNlciBzdWJtaXRzIHF1ZXJ5LCB3ZSB3aWxsIGxvb2sgYXQgdGhpcy5cbiAgICAgKi9cbiAgICBtb2R1bGUuZmlsdGVyID0gZnVuY3Rpb24gKHppcGNvZGUsIGRpc3RhbmNlLCBzb3J0LCBmaWx0ZXJUeXBlcykge1xuICAgICAgLy9DaGVjayB0eXBlIGZpbHRlclxuXG4gICAgICBpZiAoIXppcGNvZGUgfHwgemlwY29kZSA9PSBcIlwiKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH07XG5cbiAgICAgIC8vU3RhcnQgaWYgb3RoZXIgZmlsdGVycyBjaGFuZ2VkXG4gICAgICB2YXIgdGFyZ2V0WmlwY29kZSA9IHppcGNvZGVzW3ppcGNvZGVdO1xuXG4gICAgICAvL1JlbW92ZSBsaXN0XG4gICAgICBkMy5zZWxlY3QoXCIjZXZlbnQtbGlzdFwiKS5zZWxlY3RBbGwoXCJsaVwiKS5yZW1vdmUoKTtcblxuICAgICAgaWYgKHRhcmdldFppcGNvZGUgPT0gdW5kZWZpbmVkIHx8ICF0YXJnZXRaaXBjb2RlKSB7XG4gICAgICAgICQoXCIjZXZlbnQtbGlzdFwiKS5hcHBlbmQoXCI8bGkgY2xhc3M9J2Vycm9yIGxhdG8nPlppcGNvZGUgZG9lcyBub3QgZXhpc3QuPC9saT5cIik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy9DYWxpYnJhdGUgbWFwXG4gICAgICB2YXIgem9vbSA9IDQ7XG4gICAgICBzd2l0Y2ggKHBhcnNlSW50KGRpc3RhbmNlKSkge1xuICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgem9vbSA9IDEyO2JyZWFrO1xuICAgICAgICBjYXNlIDEwOlxuICAgICAgICAgIHpvb20gPSAxMTticmVhaztcbiAgICAgICAgY2FzZSAyMDpcbiAgICAgICAgICB6b29tID0gMTA7YnJlYWs7XG4gICAgICAgIGNhc2UgNTA6XG4gICAgICAgICAgem9vbSA9IDk7YnJlYWs7XG4gICAgICAgIGNhc2UgMTAwOlxuICAgICAgICAgIHpvb20gPSA4O2JyZWFrO1xuICAgICAgICBjYXNlIDI1MDpcbiAgICAgICAgICB6b29tID0gNzticmVhaztcbiAgICAgICAgY2FzZSA1MDA6XG4gICAgICAgICAgem9vbSA9IDU7YnJlYWs7XG4gICAgICAgIGNhc2UgNzUwOlxuICAgICAgICAgIHpvb20gPSA1O2JyZWFrO1xuICAgICAgICBjYXNlIDEwMDA6XG4gICAgICAgICAgem9vbSA9IDQ7YnJlYWs7XG4gICAgICAgIGNhc2UgMjAwMDpcbiAgICAgICAgICB6b29tID0gNDticmVhaztcbiAgICAgICAgY2FzZSAzMDAwOlxuICAgICAgICAgIHpvb20gPSAzO2JyZWFrO1xuICAgICAgfVxuICAgICAgaWYgKCEodGFyZ2V0WmlwY29kZS5sYXQgJiYgdGFyZ2V0WmlwY29kZS5sYXQgIT0gXCJcIikpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoY3VycmVudF96aXBjb2RlICE9IHppcGNvZGUgfHwgY3VycmVudF9kaXN0YW5jZSAhPSBkaXN0YW5jZSkge1xuICAgICAgICBjdXJyZW50X3ppcGNvZGUgPSB6aXBjb2RlO1xuICAgICAgICBjdXJyZW50X2Rpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgICAgIGNlbnRyYWxNYXAuc2V0VmlldyhbcGFyc2VGbG9hdCh0YXJnZXRaaXBjb2RlLmxhdCksIHBhcnNlRmxvYXQodGFyZ2V0WmlwY29kZS5sb24pXSwgem9vbSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBmaWx0ZXJlZCA9IGZpbHRlckV2ZW50cyh0YXJnZXRaaXBjb2RlLCBwYXJzZUludChkaXN0YW5jZSksIGZpbHRlclR5cGVzKTtcblxuICAgICAgLy9Tb3J0IGV2ZW50XG4gICAgICBmaWx0ZXJlZCA9IHNvcnRFdmVudHMoZmlsdGVyZWQsIHNvcnQsIGZpbHRlclR5cGVzKTtcblxuICAgICAgLy9SZW5kZXIgZXZlbnRcbiAgICAgIHZhciBldmVudExpc3QgPSBkMy5zZWxlY3QoXCIjZXZlbnQtbGlzdFwiKS5zZWxlY3RBbGwoXCJsaVwiKS5kYXRhKGZpbHRlcmVkLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICByZXR1cm4gZC5wcm9wcy51cmw7XG4gICAgICB9KTtcblxuICAgICAgZXZlbnRMaXN0LmVudGVyKCkuYXBwZW5kKFwibGlcIikuYXR0cihcImNsYXNzXCIsIGZ1bmN0aW9uIChkKSB7XG4gICAgICAgIHJldHVybiAoZC5pc0Z1bGwgPyAnaXMtZnVsbCcgOiAnbm90LWZ1bGwnKSArIFwiIFwiICsgKHRoaXMudmlzaWJsZSA/IFwiaXMtdmlzaWJsZVwiIDogXCJub3QtdmlzaWJsZVwiKTtcbiAgICAgIH0pLmNsYXNzZWQoXCJsYXRvXCIsIHRydWUpLmh0bWwoZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgcmV0dXJuIGQucmVuZGVyKGQuZGlzdGFuY2UpO1xuICAgICAgfSk7XG5cbiAgICAgIGV2ZW50TGlzdC5leGl0KCkucmVtb3ZlKCk7XG5cbiAgICAgIC8vYWRkIGEgaGlnaGxpZ2h0ZWQgbWFya2VyXG4gICAgICBmdW5jdGlvbiBhZGRoaWdobGlnaHRlZE1hcmtlcihsYXQsIGxvbikge1xuICAgICAgICB2YXIgaGlnaGxpZ2h0ZWRNYXJrZXIgPSBuZXcgTC5jaXJjbGVNYXJrZXIoW2xhdCwgbG9uXSwgeyByYWRpdXM6IDUsIGNvbG9yOiAnI2VhNTA0ZScsIGZpbGxDb2xvcjogJyMxNDYyQTInLCBvcGFjaXR5OiAwLjgsIGZpbGxPcGFjaXR5OiAwLjcsIHdlaWdodDogMiB9KS5hZGRUbyhjZW50cmFsTWFwKTtcbiAgICAgICAgLy8gZXZlbnQgbGlzdGVuZXIgdG8gcmVtb3ZlIGhpZ2hsaWdodGVkIG1hcmtlcnNcbiAgICAgICAgJChcIi5ub3QtZnVsbFwiKS5tb3VzZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY2VudHJhbE1hcC5yZW1vdmVMYXllcihoaWdobGlnaHRlZE1hcmtlcik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBldmVudCBsaXN0ZW5lciB0byBnZXQgdGhlIG1vdXNlb3ZlclxuICAgICAgJChcIi5ub3QtZnVsbFwiKS5tb3VzZW92ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKFwiaGlnaGxpZ2h0XCIpO1xuICAgICAgICB2YXIgY01hcmtlckxhdCA9ICQodGhpcykuY2hpbGRyZW4oJ2RpdicpLmF0dHIoJ2xhdCcpO1xuICAgICAgICB2YXIgY01hcmtlckxvbiA9ICQodGhpcykuY2hpbGRyZW4oJ2RpdicpLmF0dHIoJ2xvbicpO1xuICAgICAgICAvLyBmdW5jdGlvbiBjYWxsIHRvIGFkZCBoaWdobGlnaHRlZCBtYXJrZXJcbiAgICAgICAgYWRkaGlnaGxpZ2h0ZWRNYXJrZXIoY01hcmtlckxhdCwgY01hcmtlckxvbik7XG4gICAgICB9KTtcblxuICAgICAgLy9QdXNoIGFsbCBmdWxsIGl0ZW1zIHRvIGVuZCBvZiBsaXN0XG4gICAgICAkKFwiZGl2I2V2ZW50LWxpc3QtY29udGFpbmVyIHVsI2V2ZW50LWxpc3QgbGkuaXMtZnVsbFwiKS5hcHBlbmRUbyhcImRpdiNldmVudC1saXN0LWNvbnRhaW5lciB1bCNldmVudC1saXN0XCIpO1xuXG4gICAgICAvL01vdmUgY2FtcGFpZ24gb2ZmaWNlcyB0b1xuXG4gICAgICB2YXIgb2ZmaWNlQ291bnQgPSAkKFwiZGl2I2V2ZW50LWxpc3QtY29udGFpbmVyIHVsI2V2ZW50LWxpc3QgbGkgLmNhbXBhaWduLW9mZmljZVwiKS5sZW5ndGg7XG4gICAgICAkKFwiI2hpZGUtc2hvdy1vZmZpY2VcIikuYXR0cihcImRhdGEtY291bnRcIiwgb2ZmaWNlQ291bnQpO1xuICAgICAgJChcIiNjYW1wYWlnbi1vZmYtY291bnRcIikudGV4dChvZmZpY2VDb3VudCk7XG4gICAgICAkKFwic2VjdGlvbiNjYW1wYWlnbi1vZmZpY2VzIHVsI2NhbXBhaWduLW9mZmljZS1saXN0ICpcIikucmVtb3ZlKCk7XG4gICAgICAkKFwiZGl2I2V2ZW50LWxpc3QtY29udGFpbmVyIHVsI2V2ZW50LWxpc3QgbGkgLmNhbXBhaWduLW9mZmljZVwiKS5wYXJlbnQoKS5hcHBlbmRUbyhcInNlY3Rpb24jY2FtcGFpZ24tb2ZmaWNlcyB1bCNjYW1wYWlnbi1vZmZpY2UtbGlzdFwiKTtcbiAgICB9O1xuXG4gICAgbW9kdWxlLnRvTWFwVmlldyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICQoXCJib2R5XCIpLnJlbW92ZUNsYXNzKFwibGlzdC12aWV3XCIpLmFkZENsYXNzKFwibWFwLXZpZXdcIik7XG4gICAgICBjZW50cmFsTWFwLmludmFsaWRhdGVTaXplKCk7XG4gICAgICBjZW50cmFsTWFwLl9vblJlc2l6ZSgpO1xuICAgIH07XG4gICAgbW9kdWxlLnRvTGlzdFZpZXcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAkKFwiYm9keVwiKS5yZW1vdmVDbGFzcyhcIm1hcC12aWV3XCIpLmFkZENsYXNzKFwibGlzdC12aWV3XCIpO1xuICAgIH07XG5cbiAgICBtb2R1bGUuZ2V0TWFwID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGNlbnRyYWxNYXA7XG4gICAgfTtcblxuICAgIHJldHVybiBtb2R1bGU7XG4gIH07XG59KGpRdWVyeSwgZDMsIEwpO1xuXG52YXIgVm90aW5nSW5mb01hbmFnZXIgPSBmdW5jdGlvbiAoJCkge1xuICByZXR1cm4gZnVuY3Rpb24gKHZvdGluZ0luZm8pIHtcbiAgICB2YXIgdm90aW5nSW5mbyA9IHZvdGluZ0luZm87XG4gICAgdmFyIG1vZHVsZSA9IHt9O1xuXG4gICAgZnVuY3Rpb24gYnVpbGRSZWdpc3RyYXRpb25NZXNzYWdlKHN0YXRlKSB7XG4gICAgICB2YXIgJG1zZyA9ICQoXCI8ZGl2IGNsYXNzPSdyZWdpc3RyYXRpb24tbXNnJy8+XCIpLmFwcGVuZCgkKFwiPGgzLz5cIikudGV4dChcIlJlZ2lzdHJhdGlvbiBkZWFkbGluZTogXCIgKyBtb21lbnQobmV3IERhdGUoc3RhdGUucmVnaXN0cmF0aW9uX2RlYWRsaW5lKSkuZm9ybWF0KFwiTU1NIERcIikpKS5hcHBlbmQoJChcIjxwIC8+XCIpLmh0bWwoc3RhdGUubmFtZSArIFwiIGhhcyA8c3Ryb25nPlwiICsgc3RhdGUuaXNfb3BlbiArIFwiIFwiICsgc3RhdGUudHlwZSArIFwiPC9zdHJvbmc+LiBcIiArIHN0YXRlLnlvdV9tdXN0KSkuYXBwZW5kKCQoXCI8cCAvPlwiKS5odG1sKFwiRmluZCBvdXQgd2hlcmUgYW5kIGhvdyB0byByZWdpc3RlciBhdCA8YSB0YXJnZXQ9J19ibGFuaycgaHJlZj0naHR0cHM6Ly92b3RlLmJlcm5pZXNhbmRlcnMuY29tL1wiICsgc3RhdGUuc3RhdGUgKyBcIic+dm90ZS5iZXJuaWVzYW5kZXJzLmNvbTwvYT5cIikpO1xuXG4gICAgICByZXR1cm4gJG1zZztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBidWlsZFByaW1hcnlJbmZvKHN0YXRlKSB7XG5cbiAgICAgIHZhciAkbXNnID0gJChcIjxkaXYgY2xhc3M9J3JlZ2lzdHJhdGlvbi1tc2cnLz5cIikuYXBwZW5kKCQoXCI8aDMvPlwiKS50ZXh0KFwiUHJpbWFyeSBkYXk6IFwiICsgbW9tZW50KG5ldyBEYXRlKHN0YXRlLnZvdGluZ19kYXkpKS5mb3JtYXQoXCJNTU0gRFwiKSkpLmFwcGVuZCgkKFwiPHAgLz5cIikuaHRtbChzdGF0ZS5uYW1lICsgXCIgaGFzIDxzdHJvbmc+XCIgKyBzdGF0ZS5pc19vcGVuICsgXCIgXCIgKyBzdGF0ZS50eXBlICsgXCI8L3N0cm9uZz4uIFwiICsgc3RhdGUueW91X211c3QpKS5hcHBlbmQoJChcIjxwIC8+XCIpLmh0bWwoXCJGaW5kIG91dCB3aGVyZSBhbmQgaG93IHRvIHZvdGUgYXQgPGEgdGFyZ2V0PSdfYmxhbmsnIGhyZWY9J2h0dHBzOi8vdm90ZS5iZXJuaWVzYW5kZXJzLmNvbS9cIiArIHN0YXRlLnN0YXRlICsgXCInPnZvdGUuYmVybmllc2FuZGVycy5jb208L2E+XCIpKTtcblxuICAgICAgcmV0dXJuICRtc2c7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYnVpbGRDYXVjdXNJbmZvKHN0YXRlKSB7XG4gICAgICB2YXIgJG1zZyA9ICQoXCI8ZGl2IGNsYXNzPSdyZWdpc3RyYXRpb24tbXNnJy8+XCIpLmFwcGVuZCgkKFwiPGgzLz5cIikudGV4dChcIkNhdWN1cyBkYXk6IFwiICsgbW9tZW50KG5ldyBEYXRlKHN0YXRlLnZvdGluZ19kYXkpKS5mb3JtYXQoXCJNTU0gRFwiKSkpLmFwcGVuZCgkKFwiPHAgLz5cIikuaHRtbChzdGF0ZS5uYW1lICsgXCIgaGFzIDxzdHJvbmc+XCIgKyBzdGF0ZS5pc19vcGVuICsgXCIgXCIgKyBzdGF0ZS50eXBlICsgXCI8L3N0cm9uZz4uIFwiICsgc3RhdGUueW91X211c3QpKS5hcHBlbmQoJChcIjxwIC8+XCIpLmh0bWwoXCJGaW5kIG91dCB3aGVyZSBhbmQgaG93IHRvIGNhdWN1cyBhdCA8YSB0YXJnZXQ9J19ibGFuaycgaHJlZj0naHR0cHM6Ly92b3RlLmJlcm5pZXNhbmRlcnMuY29tL1wiICsgc3RhdGUuc3RhdGUgKyBcIic+dm90ZS5iZXJuaWVzYW5kZXJzLmNvbTwvYT5cIikpO1xuXG4gICAgICByZXR1cm4gJG1zZztcbiAgICB9XG5cbiAgICBtb2R1bGUuZ2V0SW5mbyA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgdmFyIHRhcmdldFN0YXRlID0gdm90aW5nSW5mby5maWx0ZXIoZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgcmV0dXJuIGQuc3RhdGUgPT0gc3RhdGU7XG4gICAgICB9KVswXTsgLy9yZXR1cm4gZmlyc3RcbiAgICAgIGlmICghdGFyZ2V0U3RhdGUpIHJldHVybiBudWxsO1xuXG4gICAgICB2YXIgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgICAgdG9kYXkuc2V0RGF0ZSh0b2RheS5nZXREYXRlKCkgLSAxKTtcblxuICAgICAgaWYgKHRvZGF5IDw9IG5ldyBEYXRlKHRhcmdldFN0YXRlLnJlZ2lzdHJhdGlvbl9kZWFkbGluZSkpIHtcbiAgICAgICAgcmV0dXJuIGJ1aWxkUmVnaXN0cmF0aW9uTWVzc2FnZSh0YXJnZXRTdGF0ZSk7XG4gICAgICB9IGVsc2UgaWYgKHRvZGF5IDw9IG5ldyBEYXRlKHRhcmdldFN0YXRlLnZvdGluZ19kYXkpKSB7XG4gICAgICAgIGlmICh0YXJnZXRTdGF0ZS50eXBlID09IFwicHJpbWFyaWVzXCIpIHtcbiAgICAgICAgICByZXR1cm4gYnVpbGRQcmltYXJ5SW5mbyh0YXJnZXRTdGF0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy9cbiAgICAgICAgICByZXR1cm4gYnVpbGRDYXVjdXNJbmZvKHRhcmdldFN0YXRlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBtb2R1bGU7XG4gIH07XG59KGpRdWVyeSk7XG5cbi8vIE1vcmUgZXZlbnRzXG4oZnVuY3Rpb24gKCQpIHtcbiAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBmdW5jdGlvbiAoZXZlbnQsIHBhcmFtcykge1xuICAgICQoXCIuZXZlbnQtcnN2cC1hY3Rpdml0eVwiKS5oaWRlKCk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgXCIucnN2cC1saW5rLCAuZXZlbnQtcnN2cC1hY3Rpdml0eVwiLCBmdW5jdGlvbiAoZXZlbnQsIHBhcmFtcykge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9KTtcblxuICAvL1Nob3cgZW1haWxcbiAgJChkb2N1bWVudCkub24oXCJzaG93LWV2ZW50LWZvcm1cIiwgZnVuY3Rpb24gKGV2ZW50cywgdGFyZ2V0KSB7XG4gICAgdmFyIGZvcm0gPSAkKHRhcmdldCkuY2xvc2VzdChcIi5ldmVudC1pdGVtXCIpLmZpbmQoXCIuZXZlbnQtcnN2cC1hY3Rpdml0eVwiKTtcblxuICAgIC8vIHZhciBwYXJhbXMgPSAgJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSB8fCBcIlwiKTtcbiAgICAvLyBmb3JtLmZpbmQoXCJpbnB1dFtuYW1lPXppcGNvZGVdXCIpLnZhbChwYXJhbXMuemlwY29kZSA/IHBhcmFtcy56aXBjb2RlIDogQ29va2llcy5nZXQoJ21hcC5iZXJuaWUuemlwY29kZScpKTtcblxuICAgIGZvcm0uZmFkZUluKDEwMCk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKFwic3VibWl0XCIsIFwiZm9ybS5ldmVudC1mb3JtXCIsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcXVlcnkgPSAkLmRlcGFyYW0oJCh0aGlzKS5zZXJpYWxpemUoKSk7XG4gICAgdmFyIHBhcmFtcyA9ICQuZGVwYXJhbSh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkgfHwgXCJcIik7XG4gICAgcXVlcnlbJ3ppcGNvZGUnXSA9IHBhcmFtc1snemlwY29kZSddIHx8IHF1ZXJ5Wyd6aXBjb2RlJ107XG5cbiAgICB2YXIgJGVycm9yID0gJCh0aGlzKS5maW5kKFwiLmV2ZW50LWVycm9yXCIpO1xuICAgIHZhciAkY29udGFpbmVyID0gJCh0aGlzKS5jbG9zZXN0KFwiLmV2ZW50LXJzdnAtYWN0aXZpdHlcIik7XG5cbiAgICBpZiAocXVlcnlbJ2hhc19zaGlmdCddID09ICd0cnVlJyAmJiAoIXF1ZXJ5WydzaGlmdF9pZCddIHx8IHF1ZXJ5WydzaGlmdF9pZCddLmxlbmd0aCA9PSAwKSkge1xuICAgICAgJGVycm9yLnRleHQoXCJZb3UgbXVzdCBwaWNrIGEgc2hpZnRcIikuc2hvdygpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBzaGlmdHMgPSBudWxsO1xuICAgIHZhciBndWVzdHMgPSAwO1xuICAgIGlmIChxdWVyeVsnc2hpZnRfaWQnXSkge1xuICAgICAgc2hpZnRzID0gcXVlcnlbJ3NoaWZ0X2lkJ10uam9pbigpO1xuICAgIH1cblxuICAgIGlmICghcXVlcnlbJ3Bob25lJ10gfHwgcXVlcnlbJ3Bob25lJ10gPT0gJycpIHtcbiAgICAgICRlcnJvci50ZXh0KFwiUGhvbmUgbnVtYmVyIGlzIHJlcXVpcmVkXCIpLnNob3coKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIXF1ZXJ5WydlbWFpbCddIHx8IHF1ZXJ5WydlbWFpbCddID09ICcnKSB7XG4gICAgICAkZXJyb3IudGV4dChcIkVtYWlsIGlzIHJlcXVpcmVkXCIpLnNob3coKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIXF1ZXJ5WydlbWFpbCddLnRvVXBwZXJDYXNlKCkubWF0Y2goL1tBLVowLTkuXyUrLV0rQFtBLVowLTkuLV0rXFwuW0EtWl17Mix9JC8pKSB7XG4gICAgICAkZXJyb3IudGV4dChcIlBsZWFzZSBpbnB1dCB2YWxpZCBlbWFpbFwiKS5zaG93KCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gaWYgKCFxdWVyeVsnbmFtZSddIHx8IHF1ZXJ5WyduYW1lJ10gPT0gXCJcIikge1xuICAgIC8vICAgJGVycm9yLnRleHQoXCJQbGVhc2UgaW5jbHVkZSB5b3VyIG5hbWVcIikuc2hvdygpO1xuICAgIC8vICAgcmV0dXJuIGZhbHNlO1xuICAgIC8vIH1cblxuICAgICQodGhpcykuZmluZChcIi5ldmVudC1lcnJvclwiKS5oaWRlKCk7XG4gICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAkLmFqYXgoe1xuICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgdXJsOiAnaHR0cHM6Ly9vcmdhbml6ZS5iZXJuaWVzYW5kZXJzLmNvbS9ldmVudHMvYWRkLXJzdnAnLFxuICAgICAgLy8gdXJsOiAnaHR0cHM6Ly9iZXJuaWUtZ3JvdW5kLWNvbnRyb2wtc3RhZ2luZy5oZXJva3VhcHAuY29tL2V2ZW50cy9hZGQtcnN2cCcsXG4gICAgICBjcm9zc0RvbWFpbjogdHJ1ZSxcbiAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIC8vIG5hbWU6IHF1ZXJ5WyduYW1lJ10sXG4gICAgICAgIHBob25lOiBxdWVyeVsncGhvbmUnXSxcbiAgICAgICAgZW1haWw6IHF1ZXJ5WydlbWFpbCddLFxuICAgICAgICB6aXA6IHF1ZXJ5Wyd6aXBjb2RlJ10sXG4gICAgICAgIHNoaWZ0X2lkczogc2hpZnRzLFxuICAgICAgICBldmVudF9pZF9vYmZ1c2NhdGVkOiBxdWVyeVsnaWRfb2JmdXNjYXRlZCddXG4gICAgICB9LFxuICAgICAgc3VjY2VzczogZnVuY3Rpb24gc3VjY2VzcyhkYXRhKSB7XG4gICAgICAgIENvb2tpZXMuc2V0KCdtYXAuYmVybmllLnppcGNvZGUnLCBxdWVyeVsnemlwY29kZSddLCB7IGV4cGlyZXM6IDcgfSk7XG4gICAgICAgIENvb2tpZXMuc2V0KCdtYXAuYmVybmllLmVtYWlsJywgcXVlcnlbJ2VtYWlsJ10sIHsgZXhwaXJlczogNyB9KTtcbiAgICAgICAgQ29va2llcy5zZXQoJ21hcC5iZXJuaWUubmFtZScsIHF1ZXJ5WyduYW1lJ10sIHsgZXhwaXJlczogNyB9KTtcblxuICAgICAgICBpZiAocXVlcnlbJ3Bob25lJ10gIT0gJycpIHtcbiAgICAgICAgICBDb29raWVzLnNldCgnbWFwLmJlcm5pZS5waG9uZScsIHF1ZXJ5WydwaG9uZSddLCB7IGV4cGlyZXM6IDcgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL1N0b3JpbmcgdGhlIGV2ZW50cyBqb2luZWRcbiAgICAgICAgdmFyIGV2ZW50c19qb2luZWQgPSBKU09OLnBhcnNlKENvb2tpZXMuZ2V0KCdtYXAuYmVybmllLmV2ZW50c0pvaW5lZC4nICsgcXVlcnlbJ2VtYWlsJ10pIHx8IFwiW11cIikgfHwgW107XG5cbiAgICAgICAgZXZlbnRzX2pvaW5lZC5wdXNoKHF1ZXJ5WydpZF9vYmZ1c2NhdGVkJ10pO1xuICAgICAgICBDb29raWVzLnNldCgnbWFwLmJlcm5pZS5ldmVudHNKb2luZWQuJyArIHF1ZXJ5WydlbWFpbCddLCBldmVudHNfam9pbmVkLCB7IGV4cGlyZXM6IDcgfSk7XG5cbiAgICAgICAgJHRoaXMuY2xvc2VzdChcImxpXCIpLmF0dHIoXCJkYXRhLWF0dGVuZGluZ1wiLCB0cnVlKTtcblxuICAgICAgICAkdGhpcy5odG1sKFwiPGg0IHN0eWxlPSdib3JkZXItYm90dG9tOiBub25lJz5SU1ZQIFN1Y2Nlc3NmdWwhIFRoYW5rIHlvdSBmb3Igam9pbmluZyB0byB0aGlzIGV2ZW50ITwvaDQ+XCIpO1xuICAgICAgICAkY29udGFpbmVyLmRlbGF5KDEwMDApLmZhZGVPdXQoJ2Zhc3QnKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSk7XG59KShqUXVlcnkpO1xuIiwiKGZ1bmN0aW9uKCQsIGQzKSB7XG4gIHZhciBkYXRlID0gbmV3IERhdGUoKTtcbiAgJChcIiNsb2FkaW5nLWljb25cIikuc2hvdygpO1xuXG4gICQuYWpheCh7XG4gICAgdXJsOiAnaHR0cHM6Ly9kbmI2bGVhbmd4NmRjLmNsb3VkZnJvbnQubmV0L291dHB1dC8zNTBvcmcuanMuZ3onLCAvLyd8KipEQVRBX1NPVVJDRSoqfCcsXG4gICAgZGF0YVR5cGU6ICdzY3JpcHQnLFxuICAgIGNhY2hlOiB0cnVlLCAvLyBvdGhlcndpc2Ugd2lsbCBnZXQgZnJlc2ggY29weSBldmVyeSBwYWdlIGxvYWRcbiAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBkMy5jc3YoJy8vZDF5MG90YWRpM2tuZjYuY2xvdWRmcm9udC5uZXQvZC91c19wb3N0YWxfY29kZXMuZ3onLFxuICAgICAgICBmdW5jdGlvbih6aXBjb2Rlcykge1xuICAgICAgICAgICQoXCIjbG9hZGluZy1pY29uXCIpLmhpZGUoKTtcbiAgICAgICAgICAvL0NsZWFuIGRhdGFcbiAgICAgICAgICB3aW5kb3cuRVZFTlRTX0RBVEEuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICBkLmZpbHRlcnMgPSBbXTtcbiAgICAgICAgICAgIC8vU2V0IGZpbHRlciBpbmZvXG4gICAgICAgICAgICBzd2l0Y2ggKGQuZXZlbnRfdHlwZSkge1xuICAgICAgICAgICAgICBjYXNlIFwiTWVldCBhbmQgR3JlZXRcIjpcbiAgICAgICAgICAgICAgICBkLmZpbHRlcnMucHVzaCgnTWVldC1hbmQtZ3JlZXQnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSBcIlBob25lIGJhbmtcIjpcbiAgICAgICAgICAgICAgICBkLmZpbHRlcnMucHVzaCgnUGhvbmUtYmFuaycpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlIFwiQmxvY2sgd2Fsa1wiOlxuICAgICAgICAgICAgICAgIGQuZmlsdGVycy5wdXNoKCdCbG9jay13YWxrJyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgXCJSYWxseVwiOlxuICAgICAgICAgICAgICAgIGQuZmlsdGVycy5wdXNoKCdSYWxseScpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlIFwiVG93biBIYWxsXCI6XG4gICAgICAgICAgICAgICAgZC5maWx0ZXJzLnB1c2goJ1Rvd24tSGFsbCcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlIFwiVmV0ZXJhbiB0b3duIGhhbGxcIjpcbiAgICAgICAgICAgICAgICBkLmZpbHRlcnMucHVzaCgnVmV0ZXJhbi10b3duLWhhbGwnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSBcIlZvbHVudGVlciBldmVudFwiOlxuICAgICAgICAgICAgICAgIGQuZmlsdGVycy5wdXNoKCdWb2x1bnRlZXItZXZlbnQnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBkLmZpbHRlcnMucHVzaCgnb3RoZXInKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZC5pc19vZmZpY2lhbCA9IGQuaXNfb2ZmaWNpYWwgPT0gXCIxXCI7XG4gICAgICAgICAgICBpZiAoZC5pc19vZmZpY2lhbCkge1xuICAgICAgICAgICAgICBkLmZpbHRlcnMucHVzaChcIm9mZmljaWFsLWV2ZW50XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHZhciBwYXJhbXMgPSAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpKVxuICAgICAgICAgIHZhciBvbGREYXRlID0gbmV3IERhdGUoKTtcblxuICAgICAgICAgIC8qIEV4dHJhY3QgZGVmYXVsdCBsYXQgbG9uICovXG4gICAgICAgICAgdmFyIG0gPSAvLipcXD9jPSguKz8pLCguKz8pLChcXGQrKXojPy4qL2cuZXhlYyh3aW5kb3cubG9jYXRpb24uaHJlZilcbiAgICAgICAgICBpZiAobSAmJiBtWzFdICYmIG1bMl0gJiYgbVszXSkge1xuICAgICAgICAgICAgdmFyIGRlZmF1bHRDb29yZCA9IHtcbiAgICAgICAgICAgICAgY2VudGVyOiBbcGFyc2VGbG9hdChtWzFdKSwgcGFyc2VGbG9hdChtWzJdKV0sXG4gICAgICAgICAgICAgIHpvb206IHBhcnNlSW50KG1bM10pXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgd2luZG93Lm1hcE1hbmFnZXIgPSBNYXBNYW5hZ2VyKHdpbmRvdy5FVkVOVFNfREFUQSwgY2FtcGFpZ25PZmZpY2VzLCB6aXBjb2Rlcywge1xuICAgICAgICAgICAgICBkZWZhdWx0Q29vcmQ6IGRlZmF1bHRDb29yZFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHdpbmRvdy5tYXBNYW5hZ2VyLmZpbHRlckJ5Q29vcmRzKGRlZmF1bHRDb29yZC5jZW50ZXIsIDUwLCBwYXJhbXMuc29ydCwgcGFyYW1zLmYpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3aW5kb3cubWFwTWFuYWdlciA9IE1hcE1hbmFnZXIod2luZG93LkVWRU5UU19EQVRBLCBudWxsLCB6aXBjb2Rlcyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gTG9hZCBDb25uZWN0aWN1dCBhcmVhXG4gICAgICAgICAgdmFyIGRpc3RyaWN0X2JvdW5kYXJ5ID0gbmV3IEwuZ2VvSnNvbihudWxsLCB7XG4gICAgICAgICAgICBjbGlja2FibGU6IGZhbHNlXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZGlzdHJpY3RfYm91bmRhcnkuYWRkVG8od2luZG93Lm1hcE1hbmFnZXIuZ2V0TWFwKCkpO1xuXG4gICAgICAgICAgLyoqKiBUT1RBTExZIE9QVElPTkFMIEFSRUEgRk9SIEZPQ1VTRUQgQVJFQVMuIEVYQU1QTEUgSVMgQ09OTkVUSUNVVCAqKiovXG4gICAgICAgICAgLyoqKiBUT0RPOiBSZXBhbGFjZS9SZW1vdmUgdGhpcyAqKiovXG4gICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgIHVybDogXCIvZGF0YS90ZXhhcy5qc29uXCIsXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICQoZGF0YS5mZWF0dXJlc1swXS5nZW9tZXRyeSkuZWFjaChmdW5jdGlvbihrZXksIGRhdGEpIHtcbiAgICAgICAgICAgICAgICBkaXN0cmljdF9ib3VuZGFyeVxuICAgICAgICAgICAgICAgICAgLmFkZERhdGEoZGF0YSlcbiAgICAgICAgICAgICAgICAgIC5zZXRTdHlsZSh7XG4gICAgICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICdyZ2IoMCwgMCwgMCknXG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoIXBhcmFtcy56aXBjb2RlIHx8IHBhcmFtcy56aXBjb2RlID09PSAnJykge1xuICAgICAgICAgICAgICAgICAgd2luZG93Lm1hcE1hbmFnZXIuZ2V0TWFwKClcbiAgICAgICAgICAgICAgICAgICAgLmZpdEJvdW5kcyhkaXN0cmljdF9ib3VuZGFyeS5nZXRCb3VuZHMoKSwgeyBhbmltYXRlOiBmYWxzZSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBkaXN0cmljdF9ib3VuZGFyeS5icmluZ1RvQmFjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pLmVycm9yKGZ1bmN0aW9uKCkge30pO1xuXG4gICAgICAgICAgLy8gaWYgKCQoXCJpbnB1dFtuYW1lPSd6aXBjb2RlJ11cIikudmFsKCkgPT0gJycgJiYgQ29va2llcy5nZXQoJ21hcC5iZXJuaWUuemlwY29kZScpICYmIHdpbmRvdy5sb2NhdGlvbi5oYXNoID09ICcnKSB7XG4gICAgICAgICAgLy8gICAkKFwiaW5wdXRbbmFtZT0nemlwY29kZSddXCIpLnZhbChDb29raWVzLmdldCgnbWFwLmJlcm5pZS56aXBjb2RlJykpO1xuICAgICAgICAgIC8vICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAkKFwiI2ZpbHRlci1mb3JtXCIpLnNlcmlhbGl6ZSgpO1xuICAgICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoXCJoYXNoY2hhbmdlXCIpO1xuICAgICAgICAgIC8vIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICAvKiogaW5pdGlhbCBsb2FkaW5nIGJlZm9yZSBhY3RpdmF0aW5nIGxpc3RlbmVycy4uLiovXG4gIHZhciBwYXJhbXMgPSAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpKTtcbiAgaWYgKHBhcmFtcy56aXBjb2RlKSB7XG4gICAgJChcImlucHV0W25hbWU9J3ppcGNvZGUnXVwiKS52YWwocGFyYW1zLnppcGNvZGUpO1xuICB9XG5cbiAgaWYgKHBhcmFtcy5kaXN0YW5jZSkge1xuICAgICQoXCJzZWxlY3RbbmFtZT0nZGlzdGFuY2UnXVwiKS52YWwocGFyYW1zLmRpc3RhbmNlKTtcbiAgfVxuICBpZiAocGFyYW1zLnNvcnQpIHtcbiAgICAkKFwic2VsZWN0W25hbWU9J3NvcnQnXVwiKS52YWwocGFyYW1zLnNvcnQpO1xuICB9XG5cbiAgLyogUHJlcGFyZSBmaWx0ZXJzICovXG4gICQoXCIjZmlsdGVyLWxpc3RcIikuYXBwZW5kKFxuICAgIHdpbmRvdy5ldmVudFR5cGVGaWx0ZXJzLm1hcChmdW5jdGlvbihkKSB7XG4gICAgICByZXR1cm4gJChcIjxsaSAvPlwiKVxuICAgICAgICAuYXBwZW5kKFxuICAgICAgICAgICQoXCI8aW5wdXQgdHlwZT0nY2hlY2tib3gnIGNsYXNzPSdmaWx0ZXItdHlwZScgLz5cIilcbiAgICAgICAgICAuYXR0cignbmFtZScsICdmW10nKVxuICAgICAgICAgIC5hdHRyKFwidmFsdWVcIiwgZC5pZClcbiAgICAgICAgICAuYXR0cihcImlkXCIsIGQuaWQpXG4gICAgICAgICAgLnByb3AoXCJjaGVja2VkXCIsICFwYXJhbXMuZiA/IHRydWUgOiAkLmluQXJyYXkoZC5pZCwgcGFyYW1zLmYpID49IDApXG4gICAgICAgIClcbiAgICAgICAgLmFwcGVuZCgkKFwiPGxhYmVsIC8+XCIpLmF0dHIoJ2ZvcicsIGQuaWQpXG4gICAgICAgIC5hcHBlbmQoJChcIjxzcGFuIC8+XCIpLmFkZENsYXNzKCdmaWx0ZXItb24nKVxuICAgICAgICAuYXBwZW5kKGQub25JdGVtID8gZC5vbkl0ZW0gOiAkKFwiPHNwYW4+XCIpLmFkZENsYXNzKCdjaXJjbGUtYnV0dG9uIGRlZmF1bHQtb24nKSkpXG4gICAgICAgIC5hcHBlbmQoJChcIjxzcGFuIC8+XCIpLmFkZENsYXNzKCdmaWx0ZXItb2ZmJylcbiAgICAgICAgLmFwcGVuZChkLm9mZkl0ZW0gPyBkLm9mZkl0ZW0gOiAkKFwiPHNwYW4+XCIpLmFkZENsYXNzKCdjaXJjbGUtYnV0dG9uIGRlZmF1bHQtb2ZmJykpKVxuICAgICAgICAuYXBwZW5kKCQoXCI8c3Bhbj5cIikudGV4dChkLm5hbWUpKSk7XG4gICAgfSlcbiAgKTtcbiAgLyoqKlxuICAgKiAgZGVmaW5lIGV2ZW50c1xuICAgKi9cbiAgLy9vbmx5IG51bWJlcnNcbiAgJChcImlucHV0W25hbWU9J3ppcGNvZGUnXVwiKS5vbigna2V5dXAga2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAoZS50eXBlID09ICdrZXlkb3duJyAmJiAoZS5rZXlDb2RlIDwgNDggfHwgZS5rZXlDb2RlID4gNTcpICYmXG4gICAgICBlLmtleUNvZGUgIT0gOCAmJiAhKGUua2V5Q29kZSA+PSAzNyB8fCBlLmtleUNvZGUgPD0gNDApKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGUudHlwZSA9PSAna2V5dXAnICYmICQodGhpcykudmFsKCkubGVuZ3RoID09IDUpIHtcbiAgICAgIGlmICghKGUua2V5Q29kZSA+PSAzNyAmJiBlLmtleUNvZGUgPD0gNDApKSB7XG4gICAgICAgICQodGhpcykuY2xvc2VzdChcImZvcm0jZmlsdGVyLWZvcm1cIikuc3VibWl0KCk7XG4gICAgICAgICQoXCIjaGlkZGVuLWJ1dHRvblwiKS5mb2N1cygpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgLyoqKlxuICAgKiAgb25jaGFuZ2Ugb2Ygc2VsZWN0XG4gICAqL1xuICAkKFwic2VsZWN0W25hbWU9J2Rpc3RhbmNlJ10sc2VsZWN0W25hbWU9J3NvcnQnXVwiKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZSkge1xuICAgICQodGhpcykuY2xvc2VzdChcImZvcm0jZmlsdGVyLWZvcm1cIikuc3VibWl0KCk7XG4gIH0pO1xuXG4gIC8qKlxuICAgKiBPbiBmaWx0ZXIgdHlwZSBjaGFuZ2VcbiAgICovXG4gICQoXCIuZmlsdGVyLXR5cGVcIikub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGUpIHtcbiAgICAkKHRoaXMpLmNsb3Nlc3QoXCJmb3JtI2ZpbHRlci1mb3JtXCIpLnN1Ym1pdCgpO1xuICB9KVxuXG4gIC8vT24gc3VibWl0XG4gICQoXCJmb3JtI2ZpbHRlci1mb3JtXCIpLm9uKCdzdWJtaXQnLCBmdW5jdGlvbihlKSB7XG4gICAgdmFyIHNlcmlhbCA9ICQodGhpcykuc2VyaWFsaXplKCk7XG4gICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBzZXJpYWw7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKCdoYXNoY2hhbmdlJywgZnVuY3Rpb24oZSkge1xuXG4gICAgdmFyIGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICBpZiAoaGFzaC5sZW5ndGggPT0gMCB8fCBoYXNoLnN1YnN0cmluZygxKSA9PSAwKSB7XG4gICAgICAkKFwiI2xvYWRpbmctaWNvblwiKS5oaWRlKCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIHBhcmFtcyA9ICQuZGVwYXJhbShoYXNoLnN1YnN0cmluZygxKSk7XG5cbiAgICAvL0N1c3RvbSBmZWF0dXJlIGZvciBzcGVjaWZpYyBkZWZhdWx0IGxhdC9sb25cbiAgICAvL2xhdD00MC43NDE1NDc5Jmxvbj0tNzMuODIzOTYwOSZ6b29tPTE3XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICQoXCIjbG9hZGluZy1pY29uXCIpLnNob3coKTtcblxuICAgICAgaWYgKHdpbmRvdy5tYXBNYW5hZ2VyLl9vcHRpb25zICYmIHdpbmRvdy5tYXBNYW5hZ2VyLl9vcHRpb25zLmRlZmF1bHRDb29yZCAmJiBwYXJhbXMuemlwY29kZS5sZW5ndGggIT0gNSkge1xuICAgICAgICB3aW5kb3cubWFwTWFuYWdlci5maWx0ZXJCeVR5cGUocGFyYW1zLmYpO1xuICAgICAgICB3aW5kb3cubWFwTWFuYWdlci5maWx0ZXJCeUNvb3Jkcyh3aW5kb3cubWFwTWFuYWdlci5fb3B0aW9ucy5kZWZhdWx0Q29vcmQuY2VudGVyLCBwYXJhbXMuZGlzdGFuY2UsIHBhcmFtcy5zb3J0LCBwYXJhbXMuZik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3aW5kb3cubWFwTWFuYWdlci5maWx0ZXJCeVR5cGUocGFyYW1zLmYpO1xuICAgICAgICB3aW5kb3cubWFwTWFuYWdlci5maWx0ZXIocGFyYW1zLnppcGNvZGUsIHBhcmFtcy5kaXN0YW5jZSwgcGFyYW1zLnNvcnQsIHBhcmFtcy5mKTtcbiAgICAgIH1cbiAgICAgICQoXCIjbG9hZGluZy1pY29uXCIpLmhpZGUoKTtcblxuICAgIH0sIDEwKTtcbiAgICAvLyAkKFwiI2xvYWRpbmctaWNvblwiKS5oaWRlKCk7XG4gICAgaWYgKHBhcmFtcy56aXBjb2RlLmxlbmd0aCA9PSA1ICYmICQoXCJib2R5XCIpLmhhc0NsYXNzKFwiaW5pdGlhbC12aWV3XCIpKSB7XG4gICAgICAkKFwiI2V2ZW50c1wiKS5yZW1vdmVDbGFzcyhcInNob3ctdHlwZS1maWx0ZXJcIik7XG4gICAgICAkKFwiYm9keVwiKS5yZW1vdmVDbGFzcyhcImluaXRpYWwtdmlld1wiKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBwcmUgPSAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpKTtcbiAgaWYgKCQoXCJib2R5XCIpLmhhc0NsYXNzKFwiaW5pdGlhbC12aWV3XCIpKSB7XG4gICAgaWYgKCQod2luZG93KS53aWR0aCgpID49IDYwMCAmJiAoIXByZS56aXBjb2RlIHx8IHByZSAmJiBwcmUuemlwY29kZS5sZW5ndGggIT0gNSkpIHtcbiAgICAgICQoXCIjZXZlbnRzXCIpLmFkZENsYXNzKFwic2hvdy10eXBlLWZpbHRlclwiKTtcbiAgICB9XG4gIH1cblxuXG59KShqUXVlcnksIGQzKTtcbiJdfQ==
