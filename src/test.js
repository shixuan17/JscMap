import './components/basic/jscmap-basic'
import './components/bussiness/jscmap-drawLayer'
// import './components/bussiness/jscmap-markers'
import './components/bussiness/jscmap-lines'


var map = L.initMap('mapContainer', {
    center: [31, 118],
    zoom: 8,
    streetMapUrl: "http://192.103.108.10:6080/arcgis/rest/services/3G/World/MapServer/tile/{z}/{y}/{x}",
    mapStyle: 'dark'
});

var drawlayer = map.initDrawPoint({
    canMove: true,
    canEdit: true,
    canDelete: true,
    showPopup: true,
    iconType: 'draw'
});

var pointlayer = map.addDrawPointsToLayer([{
    lat: 31.2,
    lng: 120.0,
    content: '’xxxx’',
    time: '2005-12-12 21:21:25',
    color: 'red'
}, {
    lat: 32.0,
    lng: 121.0,
    content: '’xxxx’',
    time: '2005-12-12 21:21:25',
    color: 'blue'
}, {
    lat: 31.0,
    lng: 120.0,
    content: '’xxxx’',
    time: '2005-12-12 21:21:25',
    color: 'green'
}], {
    iconType: 'flag',
    canMove: false,
    canEdit: false,
    canDelete: true,
    showLabel: true,
    iconAnchor: [12, 18],
});

console.info(map.addDrawPointsToLayer([{
    lat: 31.2,
    lng: 120.0,
    content: '’xxxx’',
    time: '2005-12-12 21:21:25',
}, {
    lat: 31.0,
    lng: 121.0,
    content: '’xxxx’',
    time: '2005-12-12 21:21:25',
}, {
    lat: 31.0,
    lng: 121.0,
    content: '’xxxx’',
    time: '2005-12-12 21:21:25',
}], {
    iconType: 'poi',
    iconSize: [20, 30],
    showPopup: true
}));


console.info(map.addDrawPointsToLayer([{
    lat: 32.0,
    lng: 120.0,
    content: '’xxxx’'
}, {
    lat: 32.0,
    lng: 121.0,
    content: '’xxxx’',
    time: '2005-12-12 21:21:25',
    color: 'blue'
}, {
    lat: 31.0,
    lng: 120.0,
    content: '’xxxx’',
    time: '2005-12-12 21:21:25'
}], {
    iconType: 'icon',
    canMove: true,
    canEdit: true,
    canDelete: true,
    showPopup: true
}));


// console.info(map.addTraceToMap([{
//         lat: 32.0,
//         lng: 120.0,
//         time: '2017-08-30 11:11:11',
//         source: '3123123123213',
//         content: '45yerwhwry356u356uwej563uwgnjgfjngfjngfjdf45yerwhwry356u356uwej563uwgnjgfjngfjngfjdf45yerwhwry356u356uwej563uwgnjgfjngfjngfjdf'
//     },
//     {
//         lat: 32.0,
//         lng: 121.0,
//         time: '2017-08-30 11:12:11',
//         source: '312312fsfsd',
//         content: '45yerwhwry356u356uwej563uwgnjgfjngfjngfjdf45yerwhwry356u356uwej563uwgnjgfjngfjngfjdf45yerwhwry356u356uwej563uwgnjgfjngfjngfjdf'
//     },
//     {
//         lat: 32.0,
//         lng: 122.0,
//         time: '2017-08-30 11:13:11',
//         source: 'fsdfsdfsdfsdf',
//         content: '45yerwhwry356u356uwej563uwgnjgfjngfjngfjdf45yerwhwry356u356uwej563uwgnjgfjngfjngfjdf45yerwhwry356u356uwej563uwgnjgfjngfjngfjdf'
//     },
//     {
//         lat: 32.0,
//         lng: 121.0,
//         time: '2017-08-30 11:14:11',
//         source: 'tyrhg45yw',
//         content: '45yerwhwry356u356uwej563uwgnjgfjngfjngfjdf'
//     },
//     {
//         lat: 32.0,
//         lng: 124.0,
//         time: '2017-08-30 11:15:11',
//         source: '',
//         content: ''
//     },
// ], {
//     color: '#ff0000',
//     smooth: true
// }));

map.addTraceToMap([{
    lat: 28.0,
    lng: 117.0,
    time: '2017-08-30 11:11:11',
    source: '',
    content: '',
    summary: {
        'a': 'e32eqw',
        'b': 'fasfsdfsdf',
        'c': 'dddad'
    }
}, {
    lat: 29.0,
    lng: 117.0,
    time: '2017-08-30 11:11:12',
    source: '',
    content: '',
    ltui: '2005-12-12 21:21:25',
    summary: {
        'a': 'e32eqw',
        'b': '中华人民共和国中华人民共和国中华人民共和国中华人民共和国中华人民共和国中华人民共和国中华人民共和国中华人民共和国',
        'c': 'dddad'
    }
}, {
    lat: 28.0,
    lng: 117.0,
    time: '2017-08-30 11:11:15',
    source: '',
    content: '',
    ltui: '2005-12-12 21:21:25',
    summary: {
        'a': 'e32eqw',
        'b': 'fasfsdfsdf',
        'c': 'dddad'
    }
}, {
    lat: 27.0,
    lng: 118.0,
    time: '2017-08-30 11:11:15',
    source: '',
    content: '',
    ltui: '2005-12-12 21:21:25',
    summary: {
        'a': 'e32eqw',
        'b': 'fasfsdfsdf',
        'c': 'dddad'
    }
}], {
    color: 'blue',
    smooth: false
});

map.on('clickBlank', function (e) {
    console.info('clickBlank');
    console.info(e);
})



// map.on('selectPoint', function (e) {
//     console.info('selectPoint');
//     console.info(e);
// })

// map.on('deletePoint', function (e) {
//     console.info('deletePoint');
//     console.info(e);
// })

pointlayer.on('createMarker', function (e) {
    console.info('pointlayer createMarker');
    console.info(e);
})

pointlayer.on('editMarker', function (e) {
    console.info('pointlayer editMarker');
    console.info(e);
})

pointlayer.on('selectMarker', function (e) {
    console.info('pointlayer selectMarker');
    console.info(e);
});

pointlayer.on('deleteMarker', function (e) {
    console.info('pointlayer deleteMarker');
    console.info(e);
});

drawlayer.on('createMarker', function (e) {
    console.info('createMarker');
    console.info(e);
})

drawlayer.on('editMarker', function (e) {
    console.info('editMarker');
    console.info(e);
})

drawlayer.on('selectMarker', function (e) {
    console.info('selectMarker');
    console.info(e);
});

drawlayer.on('deleteMarker', function (e) {
    console.info('deleteMarker');
    console.info(e);
});



// map.on('deleteTrace', function (e) {
//     console.info('deleteTrace');
//     console.info(e);
// });
// map.on('selectTrace', function (e) {
//     console.info('selectTrace');
//     console.info(e);
// });
// map.on('selectTraceNode', function (e) {
//     console.info('selectTraceNode');
//     console.info(e);
// });
// map.on('deleteTraceNode', function (e) {
//     console.info('deleteTraceNode');
//     console.info(e);
// });

// map.selectTrace('111');

map.on('extent', function (e) {
    console.info(e);
});