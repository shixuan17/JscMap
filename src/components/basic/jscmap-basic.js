import L from '../../lib/leaflet-src'
import $ from '../../lib/jquery'
import '../util/leaflet.contextmenu'

L.initMap = function (container, options) {
    var mapoptions = {
        closePopupOnClick: false,
        contextmenu: true,
        contextmenuWidth: 140,
        contextmenuItems: []
    };
    for (var i in options) {
        mapoptions[i] = options[i];
    }

    var map = L.map(container, mapoptions);
    if (mapoptions.bounds) {
        map.fitBounds(mapoptions.bounds);
    }
    mapoptions.url = mapoptions.streetMapUrl || mapoptions.satelliteUrl || mapoptions.labelMapUrl;
    if (mapoptions.url) {
        L.tileLayer(mapoptions.url).on('tileload', function () {
            if (mapoptions.mapStyle) {
                if (mapoptions.mapStyle === 'light') {
                    $('.leaflet-tile').removeClass('leaflet-tile-dark');
                } else if (mapoptions.mapStyle === 'dark')
                    $('.leaflet-tile').addClass('leaflet-tile-dark');
            }
        }).addTo(map);
    }

    map.on('mousemove', function (evt) {
        map.fire('pickCoordinate', evt.latlng);
    });

    map.on('click', function (evt) {
        map.fire('clickBlank');
    });

    map.on('moveend', function (evt) {
        console.info(evt);
        var bounds = map.getBounds();
        map.fire('extent', [bounds.getSouthWest(), bounds.getNorthEast()]);
    });

    map.createPane('label');

    return map;
}