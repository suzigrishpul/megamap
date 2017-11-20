"use strict";
//API :AIzaSyBujKTRw5uIXp_NHZgjYVDtBy1dbyNuGEM
const AutocompleteManager = (function($) {
  //Initialization...

  return (target) => {

    const API_KEY = "AIzaSyBujKTRw5uIXp_NHZgjYVDtBy1dbyNuGEM";
    const targetItem = typeof target == "string" ? document.querySelector(target) : target;
    const queryMgr = QueryManager();
    var geocoder = new google.maps.Geocoder();

    return {
      $target: $(targetItem),
      target: targetItem,
      initialize: () => {
        $(targetItem).typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 4,
                    classNames: {
                      menu: 'tt-dropdown-menu'
                    }
                  },
                  {
                    name: 'search-results',
                    display: (item) => item.formatted_address,
                    limit: 10,
                    source: function (q, sync, async){
                        geocoder.geocode({ address: q }, function (results, status) {
                          async(results);
                        });
                    }
                  }
                ).on('typeahead:selected', function (obj, datum) {
                    if(datum)
                    {

                      var geometry = datum.geometry;
                      queryMgr.updateViewport(geometry.viewport);
                      //  map.fitBounds(geometry.bounds? geometry.bounds : geometry.viewport);
                    }
                });
      }
    }



    return {

    }
  }

}(jQuery));
