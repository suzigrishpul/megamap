/* This loads and manages the list! */

const ListManager = (($) => {
  return (targetList = "#events-list") => {
    const $target = typeof targetList === 'string' ? $(targetList) : targetList;

    const renderEvent = (item) => {

      var date = moment(new Date(item.start_datetime).toGMTString()).format("dddd MMM DD, h:mma");
      let url = item.url.match(/^https{0,1}:/) ? item.url : "//" + item.url;
      // let superGroup = window.slugify(item.supergroup);

      return `
      <li class='${window.slugify(item.event_type)} events event-obj' data-lat='${item.lat}' data-lng='${item.lng}'>
        <div class="type-event type-action">
          <ul class="event-types-list">
            <li class='tag-${item.event_type} tag'>${item.event_type}</li>
          </ul>
          <h2 class="event-title"><a href="${url}" target='_blank'>${item.title}</a></h2>
          <div class="event-date date">${date}</div>
          <div class="event-address address-area">
            <p>${item.venue}</p>
          </div>
          <div class="call-to-action">
            <a href="${url}" target='_blank' class="btn btn-secondary">RSVP</a>
          </div>
        </div>
      </li>
      `
    };

    const renderGroup = (item) => {
      let url = item.website.match(/^https{0,1}:/) ? item.website : "//" + item.website;
      let superGroup = window.slugify(item.supergroup);
      // console.log(superGroup);
      return `
      <li class='${item.event_type} ${superGroup} group-obj' data-lat='${item.lat}' data-lng='${item.lng}'>
        <div class="type-group group-obj">
          <ul class="event-types-list">
            <li class="tag tag-${item.supergroup}">${item.supergroup}</li>
          </ul>
          <h2><a href="${url}" target='_blank'>${item.name}</a></h2>
          <div class="group-details-area">
            <div class="group-location location">${item.location}</div>
            <div class="group-description">
              <p>${item.description}</p>
            </div>
          </div>
          <div class="call-to-action">
            <a href="${url}" target='_blank' class="btn btn-secondary">Get Involved</a>
          </div>
        </div>
      </li>
      `
    };

    return {
      $list: $target,
      updateFilter: (p) => {
        if(!p) return;

        // Remove Filters

        $target.removeProp("class");
        $target.addClass(p.filter ? p.filter.join(" ") : '')

        $target.find('li.event-obj, li.group-obj').hide();

        if (p.filter) {
          p.filter.forEach((fil)=>{
            $target.find(`li.${fil}`).show();
          })
        }
      },
      updateBounds: (bound1, bound2) => {

        // const bounds = [p.bounds1, p.bounds2];


        $target.find('ul li.event-obj, ul li.group-obj').each((ind, item)=> {

          let _lat = $(item).data('lat'),
              _lng = $(item).data('lng');

          // console.log("updateBounds", item)
          if (bound1[0] <= _lat && bound2[0] >= _lat && bound1[1] <= _lng && bound2[1] >= _lng) {
            // console.log("Adding bounds");
            $(item).addClass('within-bound');
          } else {
            $(item).removeClass('within-bound');
          }
        });
      },
      populateList: (hardFilters) => {
        //using window.EVENT_DATA
        const keySet = !hardFilters.key ? [] : hardFilters.key.split(',');

        var $eventList = window.EVENTS_DATA.data.map(item => {
          if (keySet.length == 0) {
            return item.event_type && item.event_type.toLowerCase() == 'group' ? renderGroup(item) : renderEvent(item);
          } else if (keySet.length > 0 && item.event_type != 'group' && keySet.includes(item.event_type)) {
            return renderEvent(item);
          } else if (keySet.length > 0 && item.event_type == 'group' && keySet.includes(item.supergroup)) {
            return renderGroup(item)
          }

          return null;

        })
        $target.find('ul li').remove();
        $target.find('ul').append($eventList);
      }
    };
  }
})(jQuery);
