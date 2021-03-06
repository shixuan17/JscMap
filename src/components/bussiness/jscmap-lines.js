import '../util/leaflet.label'
import antpath from '../util/leaflet-ant-path'
import '../util/jscmap.doublecircle'
import '../util/jscmap.southeastPopup'
import $ from '../../lib/jquery'

L.Map.include({
    addTraceToMap: function (data, options) {
        var map = this;
        if (!map.traceLines) {
            map.traceMarkers = L.featureGroup([]).addTo(map);
            map.traceLines = L.featureGroup([]).addTo(map);
            map.traceMarkers.ctxoptions = {
                contextmenu: true,
                contextmenuItems: [{
                    text: '删除节点',
                    index: 0,
                    callback: function (e) {
                        map._deleteTraceMarker(e.relatedTarget);
                    }
                }],
                contextmenuInheritItems: false
            };

            map.traceLines.ctxoptions = {
                contextmenu: true,
                contextmenuItems: [{
                    text: '删除轨迹',
                    index: 0,
                    callback: function () {
                        if (map.traceLines.rmId) {
                            map.deleteTrace(map.traceLines.rmId);
                            map.fire('deleteTrace', {
                                leafletid: map.traceLines.rmId
                            });
                        }
                    }
                }],
                contextmenuInheritItems: false
            };
        }
        var lastLatlng;
        var m_latlngs = {};
        var t_latlngs = [];
        for (var i = 0; i < data.length; i++) {
            var ele = data[i];
            if (ele.lat && ele.lng) {
                var latlng = L.latLng([ele.lat, ele.lng]);
                if (m_latlngs[ele.lat + ';' + ele.lng]) {
                    m_latlngs[ele.lat + ';' + ele.lng].nodes.push(ele);
                } else {
                    latlng.nodes = [];
                    latlng.nodes.push(ele);
                    m_latlngs[ele.lat + ';' + ele.lng] = latlng;
                }
                if (lastLatlng) {
                    if (options.smooth) {
                        if (!lastLatlng.equals(latlng)) {
                            var polyline = L.LineUtil.bezier([lastLatlng, latlng]);
                        } else {
                            polyline = undefined;
                        }
                    } else {
                        polyline = [lastLatlng, latlng];
                    }
                    if (polyline) t_latlngs = t_latlngs.concat(polyline.slice(0, polyline.length - 1));
                }
                lastLatlng = latlng;
            }
        }
        if (polyline) {
            t_latlngs.push(polyline[polyline.length - 1]);
        }
        var trace = antpath.antPath(t_latlngs, {
            color: options.color,
            opacity: 0.4,
            delay: 1000,
            dashArray: [0, 20],
            paused: false
        }).on('click', function (e) {
            map._highlightTrace(this);
            map.fire('selectTrace', {
                leafletid: this.leafletid
            });
            L.DomEvent.stopPropagation(e);
        }).addTo(map.traceLines);

        trace.eachLayer(function (layer) {
            layer.on('contextmenu', function (e) {
                map.traceLines.rmId = e.target.traceId;
            });
            layer.traceId = trace._leaflet_id;
            layer.bindContextMenu(map.traceLines.ctxoptions);
        });

        trace.leafletid = trace._leaflet_id;
        trace.origindata = data;
        trace.myoptions = options;

        Object.values(m_latlngs).forEach(function (latlng) {
            var op = L.setOptions({}, map.traceMarkers.ctxoptions);
            op.color = options.color;
            op.count = latlng.nodes.length;
            var html = ``;
            if (op.count == 1) {
                for (var attr in latlng.nodes[0].summary) {
                    html += `<div style='margin:10px 0;overflow-wrap: break-word;'>
                            ` + attr + `:  ` + latlng.nodes[0].summary[attr] + `
                        </div>`;
                }
            } else {
                html = `<div style='margin-top:10px'>
                            <span>共 ` + latlng.nodes.length + ` 条话单</span>
                            <a class='showNodeDetail' style="text-decoration: underline;cursor: pointer;vertical-align: super;"
                                info='` + JSON.stringify(latlng.nodes) + `'>查看详情</a>
                        </div>`;
            }

            // <div style='margin-top:10px'>
            //     <span>时间:  ` + latlng.text.time + `</span>
            // </div>

            // <div style='margin-top:10px'>
            //     <span>轨迹点内容:</span>
            //     <div style='margin:10px 0;overflow-wrap: break-word;'>` + latlng.text.content + `
            //     </div>
            // </div>
            console.info(latlng.nodes);
            var marker = L.marker.doubleCircle(latlng, op).bindPopup(new L.Popup.southeastPopup().setContent(`
            <p class='title'>轨迹节点</p>` + html).on('add', function () {
                $('.showNodeDetail').unbind('click');
                $('.showNodeDetail').click(function (e) {
                    console.info($(e.target).attr('info'));
                    map.fire('selectTraceNode', {
                        points: $(e.target).attr('info')
                    });
                });
            }), {}).addTo(map.traceMarkers);

            marker.traceid = trace.leafletid;
        });

        map._fitLatlngs(Object.values(m_latlngs));

        return trace.leafletid;
    },

    _deleteTraceMarker: function (marker) {
        var map = this;
        map.traceMarkers.removeLayer(marker);
        var lastLatlng;
        var t_latlngs = [];
        map.traceLines.eachLayer(function (trace) {
            if (trace.leafletid == marker.traceid) {
                var newdata = [];
                for (var i = 0; i < trace.origindata.length; i++) {
                    var ele = trace.origindata[i];
                    if (ele.lat && ele.lng) {
                        var latlng = L.latLng([ele.lat, ele.lng]);
                        if (!marker.getLatLng().equals(latlng)) {
                            newdata.push(trace.origindata[i]);
                            if (lastLatlng) {
                                if (trace.myoptions.smooth) {
                                    if (!lastLatlng.equals(latlng)) {
                                        var polyline = L.LineUtil.bezier([lastLatlng, latlng]);
                                    } else {
                                        polyline = undefined;
                                    }
                                } else {
                                    polyline = [lastLatlng, latlng];
                                }
                                if (polyline) t_latlngs = t_latlngs.concat(polyline.slice(0, polyline.length - 1));
                            }
                            lastLatlng = latlng;
                        }
                    }
                }
                if (polyline) {
                    t_latlngs.push(polyline[polyline.length - 1]);
                }
                map.traceLines.removeLayer(trace);
                var newtrace = antpath.antPath(t_latlngs, {
                    color: trace.myoptions.color,
                    opacity: 0.4,
                    delay: 2000,
                    dashArray: [0, 20]
                }).on('click', function (e) {
                    map._highlightTrace(this);
                    map.fire('selectTrace', {
                        leafletid: this._leaflet_id
                    });
                    L.DomEvent.stopPropagation(e);
                }).addTo(map.traceLines);

                newtrace.eachLayer(function (layer) {
                    layer.on('contextmenu', function (e) {
                        map.traceLines.rmId = e.target.traceId;
                    });
                    layer.traceId = newtrace._leaflet_id;
                    layer.bindContextMenu(map.traceLines.ctxoptions);
                });

                newtrace.leafletid = newtrace._leaflet_id;
                newtrace.origindata = newdata;
                newtrace.myoptions = trace.myoptions;

                map.traceMarkers.eachLayer(function (marker) {
                    if (marker.traceid == trace.leafletid) {
                        marker.traceid = newtrace.leafletid;
                    }
                });

                map.fire('deleteTraceNode', {
                    oldTraceid: trace.leafletid,
                    newTrace: {
                        leafletid: newtrace.leafletid,
                        points: newtrace.origindata
                    }
                });
                return;
            }
        });
    },

    _highlightTrace: function (trace) {
        this.traceLines.eachLayer(function (t) {
            t.setStyle({
                opacity: trace ? 0.2 : 0.4
            });
        });
        if (trace) {
            trace.setStyle({
                opacity: 0.8
            });
            var latlngs = [];
            this.traceMarkers.eachLayer(function (m) {
                if (m.traceid == trace.leafletid) {
                    latlngs.push(m.getLatLng());
                }
            });
            this._fitLatlngs(latlngs);
        }
    },

    selectTrace: function (id) {
        var map = this;
        var trace;
        map.traceLines.eachLayer(function (tr) {
            if (tr.leafletid == id) {
                trace = tr;
                return;
            }
        });
        map._highlightTrace(trace);
    },

    deleteTrace: function (id) {
        var map = this;
        map.traceLines.eachLayer(function (trace) {
            if (trace.leafletid == id) {
                map.traceLines.removeLayer(trace);
                return;
            }
        });
        map.traceMarkers.eachLayer(function (marker) {
            if (marker.traceid == id) {
                map.traceMarkers.removeLayer(marker);
            }
        });
    },

    clearTrace: function () {
        var map = this;
        map.traceLines.eachLayer(function (trace) {
            map.traceLines.removeLayer(trace);
        });
        map.traceMarkers.eachLayer(function (marker) {
            map.traceMarkers.removeLayer(marker);
        });
    },

    _fitLatlngs: function (latlngs) {
        if (!latlngs || latlngs.length == 0) return;
        if (latlngs.length == 1) {
            this.panTo(latlngs[0]);
        } else {
            this.fitBounds(latlngs);
        }
    }
});

//二次贝塞尔曲线
L.LineUtil.bezier = function (latlngs) {
    function curve(points) {
        var c = [];
        var steps = 100;

        for (var i = 0; i <= steps; i++) {
            var t = i / steps;

            var pt = [
                Math.pow(1 - t, 3) * points[0][0] +
                3 * t * Math.pow(1 - t, 2) * points[1][0] +
                3 * (1 - t) * Math.pow(t, 2) * points[2][0] +
                Math.pow(t, 3) * points[3][0],
                Math.pow(1 - t, 3) * points[0][1] +
                3 * t * Math.pow(1 - t, 2) * points[1][1] +
                3 * (1 - t) * Math.pow(t, 2) * points[2][1] +
                Math.pow(t, 3) * points[3][1]
            ];
            c.push(pt);
        }
        return c;
    }

    function createPoints(fromPoint, toPoint) {
        var p2 = [],
            p1 = [];
        var dx = toPoint[0] - fromPoint[0];
        var dy = toPoint[1] - fromPoint[1];
        if (Math.abs(dy - 0) < 0.0000001 && Math.abs(dx - 0) < 0.0000001) {
            return [fromPoint, toPoint];
        }
        var distance = CalculateDistance(fromPoint, toPoint);
        var angle = Math.atan2(dx, dy);
        p1[0] = fromPoint[0] + (dx / 5) + (distance / 5) * Math.cos(angle);
        p1[1] = fromPoint[1] + (dy / 5) + (distance / 5) * Math.sin(angle);
        p2[0] = toPoint[0] - (dx / 5) + (distance / 5) * Math.cos(angle);
        p2[1] = toPoint[1] - (dy / 5) + (distance / 5) * Math.sin(angle);
        var pts = [];
        pts.push(fromPoint);
        pts.push(p1);
        pts.push(p2);
        pts.push(toPoint);
        return pts;
    }

    function CalculateDistance(p1, p2) {
        var dis = 0;
        dis = Math.sqrt((p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]));
        return dis;
    }

    var c = [];
    var pts = latlngsToArray(latlngs);
    if (pts.length == 2) {
        pts = createPoints(pts[0], pts[1]);
    }

    if (pts.length < 4) return pts;

    for (var i = 0; i < pts.length; i += 3) {
        if (i + 4 <= pts.length) {
            c = c.concat(curve(pts.slice(i, i + 4)));
        }
    }

    function latlngsToArray(latlngs) {
        var array = [];
        for (var i = 0; i < latlngs.length; i++) {
            array.push([latlngs[i].lng, latlngs[i].lat]);
        }
        return array;
    }

    function arrayToLatlngs(array) {
        var latlngs = [];
        for (var i = 0; i < array.length; i++) {
            latlngs.push(L.latLng(array[i][1], array[i][0]));
        }
        return latlngs;
    }

    return arrayToLatlngs(c);
}

L.LineUtil.opplatlngs = function (latlngs) {
    var array = [];
    for (var i = 0; i < latlngs.length; i++) {
        array.push(latlngs[latlngs.length - i - 1]);
    }
    return array;
}

L.LineUtil.oppbezier = function (latlngs) {
    var opp = L.LineUtil.opplatlngs(latlngs);
    var oppbezier = L.LineUtil.bezier(opp);
    return L.LineUtil.opplatlngs(oppbezier);
}

//起始点相同的直线和贝塞尔曲线 compare返回 1,方向相反返回 -1,其他返回 0
L.LineUtil.bezier.compare = function (latlngs, layer) {
    var len = layer._latlngs.length;
    var result = 0;
    var ll = layer.getLatLngs();
    if (ll[0].lat == undefined) {
        return result;
    }
    if (ll[0].equals(latlngs[0]) && ll[len - 1].equals(latlngs[1])) {
        result = 1;
    } else if (layer._latlngs[0].equals(latlngs[1]) && layer._latlngs[len - 1].equals(latlngs[0])) {
        result = -1;
    }
    return result;
}

//轨迹平滑
L.LineUtil.smoothLine = function (originPoints) {
    var points = [];
    var inputPoints = originPoints;
    var vector_line_points = {};
    for (var i = 0; i < inputPoints.length - 1; i++) {
        if (originPoints[i].lat == originPoints[i + 1].lat && originPoints[i].lng == originPoints[i + 1].lng)
            continue;
        var vector_name = originPoints[i].lat.toString() + ',' + originPoints[i].lng.toString() + '-' + originPoints[i + 1].lat.toString() + ',' + originPoints[i + 1].lng.toString();
        points.push([originPoints[i].lat, originPoints[i].lng]);
        if (!(vector_name in vector_line_points)) {
            var pts = [];
            pts.push([originPoints[i].lng, originPoints[i].lat]);
            pts.push([originPoints[i + 1].lng, originPoints[i + 1].lat]);
            var line_seg = L.LineUtil.bezier(pts);
            vector_line_points[vector_name] = line_seg;
        }
        for (var j = 1; j < vector_line_points[vector_name].length - 1; j++) {
            points.push([vector_line_points[vector_name][j][1], vector_line_points[vector_name][j][0]]);
        }
    }
    points.push([originPoints[inputPoints.length - 1].lat, originPoints[inputPoints.length - 1].lng]);
    return points;
}