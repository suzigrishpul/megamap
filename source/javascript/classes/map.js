
const MapManager = (($) => {
  return () => {
    var map = L.map('map').setView([34.88593094075317, 5.097656250000001], 2);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors • <a href="//350.org">350.org</a>'
    }).addTo(map);

    return {
      $map: map,
      setCenter: (center, zoom = 10) => {
        //console.log(("XXX"););
        console.log(center);
        if (!center || !center[0] || center[0] == ""
              || !center[1] || center[1] == "") return;
        map.setView(center, zoom);
      },
      update: (p) => {
        if (!p || !p.lat || !p.lng ) return;
        //console.log(("TTT", p););
        map.setView(L.latLng(p.lat, p.lng), 10);
      }
    };
  }
})(jQuery);
