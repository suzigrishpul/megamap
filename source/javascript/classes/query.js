const QueryManager = (($) => {
  return (targetForm = "form#filters-form") => {
    const $target = typeof targetForm === 'string' ? $(targetForm) : targetForm;
    let lat = null;
    let lng = null;

    $target.on('submit', (e) => {
      e.preventDefault();
      lat = $target.find("input[name=lat]").val();
      lng = $target.find("input[name=lng]").val();

      var form = $.deparam($("form").serialize());
      delete form['search-location'];

      window.location.hash = $.param(form);
    })

    $(document).on('change', '.filter-item input[type=checkbox]', () => {
      $target.trigger('submit');
    })


    return {
      initialize: () => {
        if (window.location.hash.length > 0) {
          var params = $.deparam(window.location.hash.substring(1))
          $target.find("input[name=lat]").val(params.lat);
          $target.find("input[name=lng]").val(params.lng);

          // if (params.filter !== null && params.filter !== undefined) {
            $target.find(".filter-item input[type=checkbox]").removeProp("checked");
            params.filter.forEach(item => {
              console.log(".filter-item input[type=checkbox][value=" + item + "]");
              $target.find(".filter-item input[type=checkbox][value='" + item + "']").prop("checked", true);
            })
          // }
        }
      },
      updateLocation: (lat, lng) => {
        $target.find("input[name=lat]").val(lat);
        $target.find("input[name=lng]").val(lng);
        $target.trigger('submit');
      },
      triggerSubmit: () => {
        $target.trigger('submit');
      }
    }
  }
})(jQuery);
