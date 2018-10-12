let autocompleteManager;
let mapManager;

window.DEFAULT_ICON = "/img/event.png";
window.slugify = (text) => !text ? text : text.toString().toLowerCase()
                            .replace(/\s+/g, '-')           // Replace spaces with -
                            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
                            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
                            .replace(/^-+/, '')             // Trim - from start of text
                            .replace(/-+$/, '');            // Trim - from end of text

const getQueryString = () => {
    var queryStringKeyValue = window.parent.location.search.replace('?', '').split('&');
    var qsJsonObject = {};
    if (queryStringKeyValue != '') {
        for (let i = 0; i < queryStringKeyValue.length; i++) {
            qsJsonObject[queryStringKeyValue[i].split('=')[0]] = queryStringKeyValue[i].split('=')[1];
        }
    }
    return qsJsonObject;
};

(function($) {
  // Load things

  window.queries =  $.deparam(window.location.search.substring(1));
  try {
    if ((!window.queries.group || (!window.queries.referrer && !window.queries.source)) && window.parent) {
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
  } catch(e) {
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
  const buildFilters = () => {$('select#filter-items').multiselect({
      enableHTML: true,
      templates: {
        button: '<button type="button" class="multiselect dropdown-toggle" data-toggle="dropdown"><span data-lang-target="text" data-lang-key="more-search-options"></span> <span class="fa fa-caret-down"></span></button>',
        li: '<li><a href="javascript:void(0);"><label></label></a></li>'
      },
      dropRight: true,
      onInitialized: () => {

      },
      onDropdownShow: () => {
        setTimeout(() => {
          $(document).trigger("mobile-update-map-height");
        }, 10);

      },
      onDropdownHide: () => {
        setTimeout(() => {
          $(document).trigger("mobile-update-map-height");
        }, 10);
      },
      optionLabel: (e) => {
        // let el = $( '<div></div>' );
        // el.append(() + "");

        return unescape($(e).attr('label')) || $(e).html();
      },
    });
  };
  buildFilters();


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

      const parameters = queryManager.getParameters();
      parameters['lang'] = option.val();
      $(document).trigger('trigger-update-embed', parameters);
      $(document).trigger('trigger-reset-map', parameters);

    }
  })

  // 1. google maps geocode

  // 2. focus map on geocode (via lat/lng)
  const queryManager = QueryManager();
        queryManager.initialize();

  const initParams = queryManager.getParameters();



  const languageManager = LanguageManager();

  const listManager = ListManager({
    referrer: window.queries.referrer,
    source: window.queries.source
  });


  mapManager = MapManager({
    onMove: (sw, ne) => {
      // When the map moves around, we update the list
      queryManager.updateViewportByBound(sw, ne);
      //update Query
    },
    referrer: window.queries.referrer,
    source: window.queries.source
  });

  window.initializeAutocompleteCallback = () => {

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

  if(initParams.lat && initParams.lng) {
    mapManager.setCenter([initParams.lat, initParams.lng]);
  }

  /***
  * List Events
  * This will trigger the list update method
  */
  $(document).on('mobile-update-map-height', (event) => {
    //This checks if width is for mobile
    if ($(window).width() < 600) {
      setTimeout(()=> {
        $("#map").height($("#events-list").height());
        mapManager.refreshMap();
      }, 10);
    }
  })
  $(document).on('trigger-list-update', (event, options) => {
    listManager.populateList(options.params);
  });

  $(document).on('trigger-list-filter-update', (event, options) => {

    listManager.updateFilter(options);
  });

  $(document).on('trigger-list-filter', (event, options) => {
    let bound1, bound2;

    if (!options || !options.bound1 || !options.bound2) {
      [bound1, bound2] = mapManager.getBounds();
    } else {
      bound1 = JSON.parse(options.bound1);
      bound2 = JSON.parse(options.bound2);
    }

    listManager.updateBounds(bound1, bound2, options.filter);
  });

  $(document).on('trigger-reset-map', (event, options) => {
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
    setTimeout(() => {

      $(document).trigger("trigger-language-update", copy);
    }, 1000);
  });


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
    // mapManager.triggerZoomEnd();

    // setTimeout(() => {
    //   mapManager.triggerZoomEnd();
    // }, 10);

  });

  $(document).on('click', "#copy-embed", (e) => {
    var copyText = document.getElementById("embed-text");
    copyText.select();
    document.execCommand("Copy");
  });

  // 3. markers on map
  $(document).on('trigger-map-plot', (e, opt) => {

    mapManager.plotPoints(opt.data, opt.params, opt.groups);
    $(document).trigger('trigger-map-filter');
  })

  // load groups

  $(document).on('trigger-load-groups', (e, opt) => {
    $('select#filter-items').empty();
    opt.groups.forEach((item) => {

      let slugged = window.slugify(item.supergroup);
      let valueText = languageManager.getTranslation(item.translation);
      $('select#filter-items').append(`
            <option value='${slugged}'
              selected='selected'
              label="<span data-lang-target='text' data-lang-key='${item.translation}'>${valueText}</span><img src='${item.iconurl || window.DEFAULT_ICON}' />">
            </option>`)
    });

    // Re-initialize
    queryManager.initialize();
    // $('select#filter-items').multiselect('destroy');
    $('select#filter-items').multiselect('rebuild');

    mapManager.refreshMap();


    $(document).trigger('trigger-language-update');

  })

  // Filter map
  $(document).on('trigger-map-filter', (e, opt) => {
    if (opt) {
      mapManager.filterMap(opt.filter);
    }
  });

  $(document).on('trigger-language-update', (e, opt) => {

    if (window.queries.lang) {
      languageManager.updateLanguage(window.queries.lang);
    } else if (opt) {
      languageManager.updateLanguage(opt.lang);
    } else {

      languageManager.refresh();
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

    // mapManager.zoomOutOnce();
    mapManager.zoomUntilHit();
  });


  $(document).on('click', '#show-hide-list-container', (e, opt) => {
    $('body').toggleClass('filter-collapsed');
    setTimeout(() => { mapManager.refreshMap() }, 600)
  });

  $(window).on("resize", (e) => {
    mapManager.refreshMap();
  });

  /**
  Filter Changes
  */
  $(document).on("click", ".search-button button", (e) => {
    e.preventDefault();
    $(document).trigger("search.force-search-location");
    return false;
  });

  $(document).on("keyup", "input[name='loc']", (e) => {
    if (e.keyCode == 13) {
      $(document).trigger('search.force-search-location');
    }
  });

  $(document).on('search.force-search-location', () => {
    let _query = $("input[name='loc']").val();
    autocompleteManager.forceSearch(_query);
    // Search google and get the first result... autocomplete?
  });

  $(window).on("hashchange", (event) => {
    const hash = window.location.hash;
    if (hash.length == 0) return;
    const parameters = $.deparam(hash.substring(1));
    const oldURL = event.originalEvent.oldURL;
    const oldHash = $.deparam(oldURL.substring(oldURL.search("#")+1));

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
  })

  // 4. filter out items in activity-area

  // 5. get map elements

  // 6. get Group data

  // 7. present group elements

  $.when(()=>{})
    .then(() =>{
      return languageManager.initialize(initParams['lang'] || 'en');
    })
    .done((data) => {})
    .then(() => {
      $.ajax({
          url: 'https://new-map.350.org/output/350org-with-annotation.js.gz', //'|**DATA_SOURCE**|',
          // url: '/data/test.js', //'|**DATA_SOURCE**|',
          dataType: 'script',
          cache: true,
          success: (data) => {
            // window.EVENTS_DATA = data;
            //June 14, 2018 – Changes

            if(window.queries.group) {
              const target_group = decodeURIComponent(window.queries.group);
              console.log(target_group);
              window.EVENTS_DATA.data = window.EVENTS_DATA.data.filter((i) => {
                return i.campaign == target_group || i.supergroup == target_group;
              });
            }

            //Load groups
            $(document).trigger('trigger-load-groups', { groups: window.EVENTS_DATA.groups });


            var parameters = queryManager.getParameters();

            window.EVENTS_DATA.data.forEach((item) => {
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
                groups: window.EVENTS_DATA.groups.reduce((dict, item)=>{ dict[item.supergroup] = item; return dict; }, {})
            });
      // });
            $(document).trigger('trigger-update-embed', parameters);
            //TODO: Make the geojson conversion happen on the backend

            //Refresh things
            setTimeout(() => {
              let p = queryManager.getParameters();

              $(document).trigger('trigger-map-update', p);
              $(document).trigger('trigger-map-filter', p);

              $(document).trigger('trigger-list-filter', p);

            }, 100);
          }
        });
      });



})(jQuery);
