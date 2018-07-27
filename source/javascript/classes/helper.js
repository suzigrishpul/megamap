const Helper = (($) => {
    return {
      refSource: (url, ref, src) => {
        // Jun 13 2018 — Fix for source and referrer
        if (ref || src) {
          if (url.indexOf("?") >= 0) {
            url = `${url}&referrer=${ref||""}&source=${src||""}`;
          } else {
            url = `${url}?referrer=${ref||""}&source=${src||""}`;
          }
        }

        return url;
      }
    };
})(jQuery);
