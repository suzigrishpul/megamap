"use strict";
//API :AIzaSyBujKTRw5uIXp_NHZgjYVDtBy1dbyNuGEM
const AutocompleteManager = (function($) {
  //Initialization...

  const API_KEY = "AIzaSyBujKTRw5uIXp_NHZgjYVDtBy1dbyNuGEM";

  return (target) => {

    const targetItem = typeof target == "string" ? document.querySelector(target) : target;
    const queryMgr = QueryManager();
    var geocoder = new google.maps.Geocoder();

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
                  queryMgr.updateLocation(geometry.location.lat(), geometry.location.lng());
                  //  map.fitBounds(geometry.bounds? geometry.bounds : geometry.viewport);
                }
            });


    return {
      $target: $(targetItem),
      target: targetItem
    }
  }

}(jQuery));

const initializeAutocompleteCallback = () => {
  //console.log(("Autocomplete has been initialized"));
  //console.log((AutocompleteManager("input[name='search-location']")););
};
