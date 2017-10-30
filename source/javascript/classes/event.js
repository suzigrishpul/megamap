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
