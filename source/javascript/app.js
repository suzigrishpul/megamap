let autocompleteManager;
let mapManager;

window.slugify = (text) => text.toString().toLowerCase()
                            .replace(/\s+/g, '-')           // Replace spaces with -
                            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
                            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
                            .replace(/^-+/, '')             // Trim - from start of text
                            .replace(/-+$/, '');            // Trim - from end of text

(function($) {
  // Load things
  $('select#filter-items').multiselect({
    templates: {
      button: '<button type="button" class="multiselect dropdown-toggle" data-toggle="dropdown"><span>More Search Options</span> <span class="fa fa-caret-down"></span></button>',
    },
    dropRight: true
  });

  $('select#language-opts').multiselect({
    enableHTML: true,
    optionClass: () => 'lang-opt',
    selectedClass: () => 'lang-sel',
    buttonClass: () => 'lang-but',
    dropRight: true,
    optionLabel: (e) => {
      // let el = $( '<div></div>' );
      // el.append(() + "");

      return unescape($(e).attr('label')) || $(e).html();
    },
    onChange: (option, checked, select) => {
      // console.log(option.val())
      const parameters = queryManager.getParameters();
      parameters['lang'] = option.val();
      $(document).trigger('trigger-update-embed', parameters);
    }
  })

  // 1. google maps geocode

  // 2. focus map on geocode (via lat/lng)
  const queryManager = QueryManager();
        queryManager.initialize();

  const initParams = queryManager.getParameters();
  mapManager = MapManager({
    onMove: (sw, ne) => {
      // When the map moves around, we update the list
      queryManager.updateViewportByBound(sw, ne);
      //update Query
    }
  });

  window.initializeAutocompleteCallback = () => {
    // console.log("It is called");
    autocompleteManager = AutocompleteManager("input[name='loc']");
    autocompleteManager.initialize();

    if (initParams.loc && initParams.loc !== '' && (!initParams.bound1 && !initParams.bound2)) {
      mapManager.initialize(() => {
        mapManager.getCenterByLocation(initParams.loc, (result) => {
          queryManager.updateViewport(result.geometry.viewport);
        });
      })
    }
  }


  const languageManager = LanguageManager();

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
    listManager.populateList(options.params);
  });

  $(document).on('trigger-list-filter-update', (event, options) => {
    // console.log("Filter", options);
    listManager.updateFilter(options);
  });

  $(document).on('trigger-list-filter-by-bound', (event, options) => {
    let bound1, bound2;

    if (!options || !options.bound1 || !options.bound2) {
      [bound1, bound2] = mapManager.getBounds();
    } else {
      bound1 = JSON.parse(options.bound1);
      bound2 = JSON.parse(options.bound2);
    }

    listManager.updateBounds(bound1, bound2)
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
    // console.log("map.98", options);
    mapManager.setBounds(bound1, bound2);
    // mapManager.triggerZoomEnd();

    setTimeout(() => {
      mapManager.triggerZoomEnd();
    }, 10);
    // console.log(options)
  });

  $(document).on('click', "#copy-embed", (e) => {
    var copyText = document.getElementById("embed-text");
    copyText.select();
    document.execCommand("Copy");
  });

  // 3. markers on map
  $(document).on('trigger-map-plot', (e, opt) => {

    mapManager.plotPoints(opt.data, opt.params);
    $(document).trigger('trigger-map-filter');
  })

  // load groups

  $(document).on('trigger-load-groups', (e, opt) => {

    opt.groups.forEach((item) => {
      let slugged = window.slugify(item.supergroup);
      let valueText = languageManager.getTranslation(item.translation);
      $('select#filter-items').append(`<option value='${slugged}' selected='selected' data-lang-target='text' data-lang-key='${item.translation}' >${valueText}</option>`)
    });

    // Re-initialize
    queryManager.initialize();
    $(document).trigger('trigger-language-update');

    $('select#filter-items').multiselect('rebuild');
    mapManager.refreshMap();
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

  $(document).on('trigger-language-loaded', (e, opt) => {
    $('select#filter-items').multiselect('rebuild');
  })

  $(document).on('click', 'button#show-hide-map', (e, opt) => {
    $('body').toggleClass('map-view')
  });

  $(document).on('click', 'button.btn.more-items', (e, opt) => {
    $('#embed-area').toggleClass('open');
  })

  $(document).on('trigger-update-embed', (e, opt) => {
    //update embed line
    var copy = JSON.parse(JSON.stringify(opt));
    delete copy['lng'];
    delete copy['lat'];
    delete copy['bound1'];
    delete copy['bound2'];

    $('#embed-area input[name=embed]').val('https://new-map.350.org#' + $.param(copy));
  });


  $(document).on('click', 'button#zoom-out', (e, opt) => {
    mapManager.zoomOutOnce();
  })

  $(window).on("resize", (e) => {
    mapManager.refreshMap();
  });

  $(window).on("hashchange", (event) => {
    const hash = window.location.hash;
    if (hash.length == 0) return;
    const parameters = $.deparam(hash.substring(1));
    const oldURL = event.originalEvent.oldURL;


    const oldHash = $.deparam(oldURL.substring(oldURL.search("#")+1));

    // console.log("177", parameters, oldHash);
    $(document).trigger('trigger-list-filter-update', parameters);
    $(document).trigger('trigger-map-filter', parameters);
    $(document).trigger('trigger-update-embed', parameters);

    // So that change in filters will not update this
    if (oldHash.bound1 !== parameters.bound1 || oldHash.bound2 !== parameters.bound2) {
      // console.log("185", parameters);
      $(document).trigger('trigger-list-filter-by-bound', parameters);
    }

    if (oldHash.log !== parameters.loc) {
      $(document).trigger('trigger-map-update', parameters);
      // console.log("Calling it")
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
    url: 'https://new-map.350.org/output/350org-new-layout.js.gz', //'|**DATA_SOURCE**|',
    dataType: 'script',
    cache: true,
    success: (data) => {
      // window.EVENTS_DATA = data;

      // console.log(window.EVENTS_DATA);

      //Load groups
      $(document).trigger('trigger-load-groups', { groups: window.EVENTS_DATA.groups });


      var parameters = queryManager.getParameters();

      window.EVENTS_DATA.data.forEach((item) => {
        item['event_type'] = !item.event_type ? 'Action' : item.event_type;
      })
      $(document).trigger('trigger-list-update', { params: parameters });
      // $(document).trigger('trigger-list-filter-update', parameters);
      $(document).trigger('trigger-map-plot', { data: window.EVENTS_DATA.data, params: parameters });
      $(document).trigger('trigger-update-embed', parameters);
      //TODO: Make the geojson conversion happen on the backend

      //Refresh things
      setTimeout(() => {
        let p = queryManager.getParameters();
        // console.log("231", p);
        $(document).trigger('trigger-map-update', p);
        $(document).trigger('trigger-map-filter', p);
        // console.log("232", p);
        $(document).trigger('trigger-list-filter-update', p);
        $(document).trigger('trigger-list-filter-by-bound', p);
        //console.log(queryManager.getParameters())
      }, 100);
    }
  });



})(jQuery);
