const QueryManager = (($) => {
  return (targetForm = "form#filters-form") => {
    const $target = typeof targetForm === 'string' ? $(targetForm) : targetForm;
    let lat = null;
    let lng = null;

    let previous = {};

    $target.on('submit', (e) => {
      e.preventDefault();
      lat = $target.find("input[name=lat]").val();
      lng = $target.find("input[name=lng]").val();

      var form = $.deparam($target.serialize());

      window.location.hash = $.param(form);
    })

    $(document).on('change', '.filter-item input[type=checkbox]', () => {
      $target.trigger('submit');
    })


    return {
      initialize: (callback) => {
        if (window.location.hash.length > 0) {
          var params = $.deparam(window.location.hash.substring(1))
          $target.find("input[name=lang]").val(params.lang);
          $target.find("input[name=lat]").val(params.lat);
          $target.find("input[name=lng]").val(params.lng);
          $target.find("input[name=bound1]").val(params.bound1);
          $target.find("input[name=bound2]").val(params.bound2);
          $target.find("input[name=loc]").val(params.loc);
          $target.find("input[name=key]").val(params.key);

          if (params.filter) {
            $target.find(".filter-item input[type=checkbox]").removeProp("checked");
            params.filter.forEach(item => {
              $target.find(".filter-item input[type=checkbox][value='" + item + "']").prop("checked", true);
            });
          }
        }

        if (callback && typeof callback === 'function') {
          callback();
        }
      },
      getParameters: () => {
        var parameters = $.deparam($target.serialize());
        // parameters['location'] ;

        for (const key in parameters) {
          if ( !parameters[key] || parameters[key] == "") {
            delete parameters[key];
          }
        }

        return parameters;
      },
      updateLocation: (lat, lng) => {
        $target.find("input[name=lat]").val(lat);
        $target.find("input[name=lng]").val(lng);
        // $target.trigger('submit');
      },
      updateViewport: (viewport) => {

        const bounds = [[viewport.f.b, viewport.b.b], [viewport.f.f, viewport.b.f]];

        $target.find("input[name=bound1]").val(JSON.stringify(bounds[0]));
        $target.find("input[name=bound2]").val(JSON.stringify(bounds[1]));
        $target.trigger('submit');
      },
      updateViewportByBound: (sw, ne) => {

        const bounds = [sw, ne];////////

        
        $target.find("input[name=bound1]").val(JSON.stringify(bounds[0]));
        $target.find("input[name=bound2]").val(JSON.stringify(bounds[1]));
        $target.trigger('submit');
      },
      triggerSubmit: () => {
        $target.trigger('submit');
      }
    }
  }
})(jQuery);
