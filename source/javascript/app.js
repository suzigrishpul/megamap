let autocompleteManager;
let mapManager;

(function($) {

  // 1. google maps geocode

  // 2. focus map on geocode (via lat/lng)
  const queryManager = QueryManager();
        queryManager.initialize();

  const initParams = queryManager.getParameters();
  mapManager = MapManager();

  window.initializeAutocompleteCallback = () => {
    autocompleteManager = AutocompleteManager("input[name='loc']");
    autocompleteManager.initialize();
    
    if (initParams.loc && initParams.loc !== '') {
      mapManager.initialize(() => {
//console.log(initParams.loc);
        mapManager.getCenterByLocation(initParams.loc, (result) => {
//console.log(result.geometry);
          queryManager.updateViewport(result.geometry.viewport);
        });
      })
    }
//console.log("MAP ", mapManager);

  const languageManager = LanguageManager();
//console.log(queryManager, queryManager.getParameters(), initParams);
  languageManager.initialize(initParams['lang'] || 'en');

  const listManager = ListManager();

  if(initParams.lat && initParams.lng) {
    mapManager.setCenter([initParams.lat, initParams.lng]);
  }

  /***
  * List Events
  * This will trigger the list update method
  */
  $(document).on('trigger-list-update', (event, options) => {
    listManager.populateList();
  });

  $(document).on('trigger-list-filter-update', (event, options) => {

    listManager.updateFilter(options);
  })

  /***
  * Map Events
  */
  $(document).on('trigger-map-update', (event, options) => {
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
  $(document).on('trigger-map-plot', (e, opt) => {
//console.log(opt);
    mapManager.plotPoints(opt.data);
    $(document).trigger('trigger-map-filter');
  })

  // Filter map
  $(document).on('trigger-map-filter', (e, opt) => {
    if (opt) {
      mapManager.filterMap(opt.filter);
    }
  });

  $(document).on('trigger-language-update', (e, opt) => {
    if (opt) {
      languageManager.updateLanguage(opt.lang);
    }
  });

  $(document).on('click', 'button#show-hide-map', (e, opt) => {
    $('body').toggleClass('map-view')
  });

  $(window).on("hashchange", (event) => {
    const hash = window.location.hash;
    if (hash.length == 0) return;
    const parameters = $.deparam(hash.substring(1));
    const oldURL = event.originalEvent.oldURL;


    const oldHash = $.deparam(oldURL.substring(oldURL.search("#")+1));

    $(document).trigger('trigger-list-filter-update', parameters);
    $(document).trigger('trigger-map-filter', parameters);

    // So that change in filters will not update this
    if (oldHash.bound1 !== parameters.bound1 || oldHash.bound2 !== parameters.bound2) {
      $(document).trigger('trigger-map-update', parameters);
    }

    // Change items
    if (oldHash.lang !== parameters.lang) {
      $(document).trigger('trigger-language-update', parameters);
    }
  })

  // 4. filter out items in activity-area

  // 5. get map elements

  // 6. get Group data

  // 7. present group elements

  $.ajax({
    url: 'https://s3-us-west-2.amazonaws.com/pplsmap-data/output/350org-test.js.gz', //'|**DATA_SOURCE**|',
    dataType: 'script',
    cache: true,
    success: (data) => {
      var parameters = queryManager.getParameters();

      window.EVENTS_DATA.forEach((item) => {
        item['event_type'] = !item.event_type ? 'Action' : item.event_type;
      })
      $(document).trigger('trigger-list-update');
      // $(document).trigger('trigger-list-filter-update', parameters);
      $(document).trigger('trigger-map-plot', { data: window.EVENTS_DATA });
      //TODO: Make the geojson conversion happen on the backend
    }
  });

  setTimeout(() => {
    $(document).trigger('trigger-list-filter-update', queryManager.getParameters());
    $(document).trigger('trigger-map-update', queryManager.getParameters());
//console.log(queryManager.getParameters())
  }, 100);

})(jQuery);
