(function($) {

  // 1. google maps geocode

  // 2. focus map on geocode (via lat/lng)
  const queryManager = QueryManager();
        queryManager.initialize();

  const initParams = queryManager.getParameters();
  const mapManager = MapManager();

  const listManager = ListManager();

  if(initParams.lat && initParams.lng) {
    mapManager.setCenter([initParams.lat, initParams.lng]);
  }

  // This will trigger the list update method
  $(document).on('trigger-list-update', (event, options) => {
    listManager.populateList();
  });

  $(document).on('trigger-list-filter-update', (event, options) => {
    //console.log(("XXXX"););
    listManager.updateFilter(options);
  })

  $(document).on('trigger-map-update', (event, options) => {
    mapManager.setCenter([options.lat, options.lng]);
  });

  $(window).on("hashchange", () => {
    const hash = window.location.hash;
    if (hash.length == 0) return;
    const parameters = $.deparam(hash.substring(1));

    $(document).trigger('trigger-list-filter-update', parameters);
    $(document).trigger('trigger-map-update', parameters);
  })

  // 3. markers on map

  // 4. filter out items in activity-area

  // 5. get map elements

  // 6. get Group data

  // 7. present group elements

  $.ajax({
    url: 'https://dnb6leangx6dc.cloudfront.net/output/350org.js.gz', //'|**DATA_SOURCE**|',
    dataType: 'script',
    cache: true,
    success: (data) => {
      //console.log((window.EVENT_DATA));
      $(document).trigger('trigger-list-update');
      $(document).trigger('trigger-list-filter-update', queryManager.getParameters());
      // $(document).trigger('trigger-map-update');
    }
  });

  setTimeout(() => {
    $(document).trigger('trigger-list-filter-update', queryManager.getParameters());
  }, 1000);

})(jQuery);
