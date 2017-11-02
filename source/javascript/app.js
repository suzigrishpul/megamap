(function($) {
  var map = L.map('map').setView([34.88593094075317, 5.097656250000001], 2);

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors • <a href="//350.org">350.org</a>'
  }).addTo(map);
})(jQuery);
