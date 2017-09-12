import './components/jscmap-basic'
import './components/jscmap-markers'
import './components/jscmap-lines'

var map = L.initMap('mapContainer', {
    center: [31, 118],
    zoom: 8,
    streetMapUrl: "http://192.103.108.10:6080/arcgis/rest/services/3G/World/MapServer/tile/{z}/{y}/{x}",
    mapStyle: 'dark'
});

// map.addPointsToMap([{
//     lat: 32.2,
//     lng: 120.0,
//     content: '’xxxx’'
// }, {
//     lat: 32.0,
//     lng: 121.0,
//     content: '’xxxx’'
// }, {
//     lat: 31.0,
//     lng: 120.0,
//     content: '’xxxx’'
// }], {
//     showLabel: true
// });
map.addDrawPointsToMap([{
    lat: 32.0,
    lng: 120.0,
    content: '’xxxx’'
}, {
    lat: 32.0,
    lng: 121.0,
    content: '’xxxx’'
}, {
    lat: 31.0,
    lng: 120.0,
    content: '’xxxx’'
}]);
map.addTraceToMap([{
        lat: 32.0,
        lng: 120.0,
        time: '2017-08-30 11:11:11',
        source: '3123123123213',
        content: '45yerwhwry356u356uwej563uwgnjgfjngfjngfjdf45yerwhwry356u356uwej563uwgnjgfjngfjngfjdf45yerwhwry356u356uwej563uwgnjgfjngfjngfjdf'
    },
    {
        lat: 32.0,
        lng: 121.0,
        time: '2017-08-30 11:12:11',
        source: '312312fsfsd',
        content: '45yerwhwry356u356uwej563uwgnjgfjngfjngfjdf45yerwhwry356u356uwej563uwgnjgfjngfjngfjdf45yerwhwry356u356uwej563uwgnjgfjngfjngfjdf'
    },
    {
        lat: 32.0,
        lng: 122.0,
        time: '2017-08-30 11:13:11',
        source: 'fsdfsdfsdfsdf',
        content: '45yerwhwry356u356uwej563uwgnjgfjngfjngfjdf45yerwhwry356u356uwej563uwgnjgfjngfjngfjdf45yerwhwry356u356uwej563uwgnjgfjngfjngfjdf'
    },
    {
        lat: 32.0,
        lng: 121.0,
        time: '2017-08-30 11:14:11',
        source: 'tyrhg45yw',
        content: '45yerwhwry356u356uwej563uwgnjgfjngfjngfjdf'
    },
    {
        lat: 32.0,
        lng: 124.0,
        time: '2017-08-30 11:15:11',
        source: '',
        content: ''
    },
], {
    color: '#ff0000',
    smooth: true
});

map.addTraceToMap([{
    lat: 28.0,
    lng: 117.0,
    time: '2017-08-30 11:11:11',
    source: '',
    content: ''
}, {
    lat: 29.0,
    lng: 117.0,
    time: '2017-08-30 11:11:12',
    source: '',
    content: ''
}, {
    lat: 28.0,
    lng: 118.0,
    time: '2017-08-30 11:11:15',
    source: '',
    content: ''
}, {
    lat: 27.0,
    lng: 118.0,
    time: '2017-08-30 11:11:15',
    source: '',
    content: ''
}], {
    color: '#00ff00',
    smooth: false
});