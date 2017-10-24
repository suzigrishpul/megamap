(function($, d3) {
  var date = new Date();
  $("#loading-icon").show();

  $.ajax({
    url: 'https://dnb6leangx6dc.cloudfront.net/output/350org.js.gz', //'|**DATA_SOURCE**|',
    dataType: 'script',
    cache: true, // otherwise will get fresh copy every page load
    success: function(data) {
      d3.csv('//d1y0otadi3knf6.cloudfront.net/d/us_postal_codes.gz',
        function(zipcodes) {
          $("#loading-icon").hide();
          //Clean data
          window.EVENTS_DATA.forEach(function(d) {
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
          var params = $.deparam(window.location.hash.substring(1))
          var oldDate = new Date();

          /* Extract default lat lon */
          var m = /.*\?c=(.+?),(.+?),(\d+)z#?.*/g.exec(window.location.href)
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
            success: function(data) {
              $(data.features[0].geometry).each(function(key, data) {
                district_boundary
                  .addData(data)
                  .setStyle({
                    fillColor: 'transparent',
                    color: 'rgb(0, 0, 0)'
                  });
                if (!params.zipcode || params.zipcode === '') {
                  window.mapManager.getMap()
                    .fitBounds(district_boundary.getBounds(), { animate: false });
                }
              });
              district_boundary.bringToBack();
            }
          }).error(function() {});

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
  $("#filter-list").append(
    window.eventTypeFilters.map(function(d) {
      return $("<li />")
        .append(
          $("<input type='checkbox' class='filter-type' />")
          .attr('name', 'f[]')
          .attr("value", d.id)
          .attr("id", d.id)
          .prop("checked", !params.f ? true : $.inArray(d.id, params.f) >= 0)
        )
        .append($("<label />").attr('for', d.id)
        .append($("<span />").addClass('filter-on')
        .append(d.onItem ? d.onItem : $("<span>").addClass('circle-button default-on')))
        .append($("<span />").addClass('filter-off')
        .append(d.offItem ? d.offItem : $("<span>").addClass('circle-button default-off')))
        .append($("<span>").text(d.name)));
    })
  );
  /***
   *  define events
   */
  //only numbers
  $("input[name='zipcode']").on('keyup keydown', function(e) {
    if (e.type == 'keydown' && (e.keyCode < 48 || e.keyCode > 57) &&
      e.keyCode != 8 && !(e.keyCode >= 37 || e.keyCode <= 40)) {
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
  $("select[name='distance'],select[name='sort']").on('change', function(e) {
    $(this).closest("form#filter-form").submit();
  });

  /**
   * On filter type change
   */
  $(".filter-type").on('change', function(e) {
    $(this).closest("form#filter-form").submit();
  })

  //On submit
  $("form#filter-form").on('submit', function(e) {
    var serial = $(this).serialize();
    window.location.hash = serial;
    e.preventDefault();
    return false;
  });

  $(window).on('hashchange', function(e) {

    var hash = window.location.hash;
    if (hash.length == 0 || hash.substring(1) == 0) {
      $("#loading-icon").hide();
      return false;
    }

    var params = $.deparam(hash.substring(1));

    //Custom feature for specific default lat/lon
    //lat=40.7415479&lon=-73.8239609&zoom=17
    setTimeout(function() {
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
