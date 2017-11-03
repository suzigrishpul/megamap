/* This loads and manages the list! */

const ListManager = (($) => {
  return (targetList = "#events-list") => {
    const $target = typeof targetList === 'string' ? $(targetList) : targetList;

    const renderEvent = (item) => {

      var date = moment(item.start_datetime).format("dddd • MMM DD h:mma");
      return `
      <li class='${item.event_type}' data-lat='${item.lat}' data-lng='${item.lng}'>
        <div class="type-event">
          <ul class="event-types-list">
            <li>${item.event_type}</li>
          </ul>
          <h2><a href="//${item.url}" target='_blank'>${item.title}</a></h2>
          <h4>${date}</h4>
          <div class="address-area">
            <p>${item.venue}</p>
          </div>
          <div class="call-to-action">
            <a href="//${item.url}" target='_blank' class="btn btn-primary">RSVP</a>
          </div>
        </div>
      </li>
      `
    };

    const renderGroup = (item) => {

      return `
      <li>
        <div class="type-group">
          <h2><a href="/" target='_blank'>${item.title || `Group`}</a></h2>
          <div class="group-details-area">
            <p>Colorado, USA</p>
            <p>${item.details || `350 Colorado is working locally to help build the global
               350.org movement to solve the climate crisis and transition
               to a clean, renewable energy future.`}
            </p>
          </div>
          <div class="call-to-action">
            <a href="//${item.url}" target='_blank' class="btn btn-primary">Get Involved</a>
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
        //console.log(("ENTERED!"););
        $target.removeProp("class");
        $target.addClass(p.filter.join(" "))
      },
      populateList: () => {
        //using window.EVENT_DATA
        //console.log(("Populating --> ", window.EVENTS_DATA));
        var $eventList = window.EVENTS_DATA.map(item => {
          return item.event_type !== 'Group' ? renderEvent(item) : renderGroup(item);
        })
        $target.find('ul li').remove();
        $target.find('ul').append($eventList);
      }
    };
  }
})(jQuery);
