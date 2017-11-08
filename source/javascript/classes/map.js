
const MapManager = (($) => {
  return () => {
    var map = L.map('map').setView([34.88593094075317, 5.097656250000001], 2);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors • <a href="//350.org">350.org</a>'
    }).addTo(map);

    // map.fitBounds([ [[40.7216015197085, -73.85174698029152], [40.7242994802915, -73.8490490197085]] ]);
    return {
      $map: map,
      setBounds: (bounds1, bounds2) => {
        const bounds = [bounds1, bounds2];
        map.fitBounds(bounds);
      },
      setCenter: (center, zoom = 10) => {
        if (!center || !center[0] || center[0] == ""
              || !center[1] || center[1] == "") return;
        map.setView(center, zoom);
      },
      update: (p) => {
        if (!p || !p.lat || !p.lng ) return;

        map.setView(L.latLng(p.lat, p.lng), 10);
      }
    };
  }
})(jQuery);
