import '../util/leaflet.label'
import '../util/jscmap.southeastPopup'
import $ from '../../lib/jquery'

import flag_blue from '../../css/images/flag-blue.png'
import flag_browngreen from '../../css/images/flag-browngreen.png'
import flag_carmine from '../../css/images/flag-carmine.png'
import flag_green from '../../css/images/flag-green.png'
import flag_magenta from '../../css/images/flag-magenta.png'
import flag_red from '../../css/images/flag-red.png'
import flag_sapphireblue from '../../css/images/flag-sapphireblue.png'
import flag_smoke from '../../css/images/flag-smoke.png'
import flag_tan from '../../css/images/flag-tan.png'

import draw_red from '../../css/images/draw-red.png'
import draw_blue from '../../css/images/draw-blue.png'
import draw_browngreen from '../../css/images/draw-browngreen.png'
import draw_green from '../../css/images/draw-green.png'
import draw_carmine from '../../css/images/draw-carmine.png'
import draw_smoke from '../../css/images/draw-smoke.png'

L.Map.include({
    addPointsToMap: function (data, options) {
        if (!this.basicFeatures) {
            this.basicFeatures = L.featureGroup([]).addTo(this);
            this._initPointContext();
        }
        var markeroptions = {};
        if (options) {
            var icon = L.icon({
                iconUrl: flag_red,
                iconSize: options.iconSize || [20, 20],
                iconAnchor: options.iconAnchor || [10, 20]
            });
        } else {
            icon = L.icon({
                iconUrl: flag_red,
                iconSize: [20, 20],
                iconAnchor: [10, 20],
            });
        }

        var map = this;
        var ids = [];
        var bounds = [];
        for (var i = 0; i < data.length; i++) {
            var ele = data[i];
            if (ele.lat && ele.lng) {
                var markeroptions = L.setOptions({}, this.basicFeatures.ctxoptions);
                markeroptions.icon = L.icon({
                    iconUrl: map._getflagImage('flag-' + ele.color || 'red'),
                    iconSize: icon.options.iconSize,
                    iconAnchor: icon.options.iconAnchor
                });;
                var marker = L.marker([ele.lat, ele.lng], markeroptions).on('click', function (layer) {
                    map.panTo(layer.latlng);
                    map.fire('selectPoint', layer.target.attrs);
                });
                if (options && options.showLabel) {
                    marker.bindLabel(ele.content);
                }
                this.basicFeatures.addLayer(marker);
                marker.attrs = {};
                for (var attr in ele) {
                    marker.attrs[attr] = ele[attr];
                }
                marker.attrs['leafletid'] = marker._leaflet_id;
                ids.push(marker.attrs.leafletid);
                bounds.push(marker.getLatLng());
            }
        }
        map._fitLatlngs(bounds);
        return ids;
    },
    _initPointContext: function () {
        if (this.basicFeatures.ctxoptions) return;
        var ctxoptions = {
            contextmenu: true,
            contextmenuItems: [{
                text: '删除点',
                index: 0,
                callback: function (e2) {
                    deleteDrawPointInfo(e2.relatedTarget);
                }
            }],
            contextmenuInheritItems: false
        };
        var map = this;

        function deleteDrawPointInfo(marker) {
            marker.unbindLabel();
            map.basicFeatures.removeLayer(marker);
            map.fire('deletePoint', marker.attrs);
        }
        this.basicFeatures.ctxoptions = ctxoptions;
    },
    selectPoint: function (id) {
        if (!this.basicFeatures) {
            return;
        }
        var map = this;
        this.basicFeatures.eachLayer(function (layer) {
            if (layer.attrs.leafletid == id) {
                map.panTo(layer.getLatLng());
                return;
            }
        });
    },
    deletePoints: function (ids) {
        if (!this.basicFeatures) {
            return;
        }
        var map = this;
        this.basicFeatures.eachLayer(function (layer) {
            if (ids.indexOf(layer.attrs.leafletid) > -1) {
                map.basicFeatures.removeLayer(layer);
            }
        });
    },
    clearPoints: function () {
        if (this.basicFeatures) {
            this.basicFeatures.clearLayers();
        }
    },
    
    _initdrawLayer: function () {
        if (!this.drawPoints) {
            this.drawPoints = L.featureGroup([]).addTo(this);
        }
    },
    _initdrawIcon: function (options) {
        if (options) {
            var popupAnchor = options.iconSize ? [-20 + options.iconSize[0] / 3, -10 + options.iconSize[1] / 3] : [-20 + 20 / 3, -10 + 20 / 3];
            this.drawPoints.icon = L.icon({
                iconUrl: draw_red,
                iconSize: options.iconSize || [20, 20],
                iconAnchor: options.iconAnchor || [10, 10],
                popupAnchor: popupAnchor
            });
        } else {
            this.drawPoints.icon = L.icon({
                iconUrl: draw_red,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
                popupAnchor: [-20, -10]
            });
        }
    },
    _initdrawContext: function () {
        if (this.drawPoints.ctxoptions) return;
        var ctxoptions = {
            contextmenu: true,
            contextmenuItems: [{
                text: '调整位置',
                index: 0,
                callback: function (e1) {
                    moveDrawPoint(e1.relatedTarget);
                }
            }, {
                text: '编辑标注',
                index: 1,
                callback: function (e2) {
                    editDrawPointInfo(e2.relatedTarget);
                }
            }, {
                text: '删除标注',
                index: 2,
                callback: function (e2) {
                    deleteDrawPointInfo(e2.relatedTarget);
                }
            }],
            contextmenuInheritItems: false
        };
        var map = this;

        function moveDrawPoint(marker) {
            setContextDisable();
            marker.closePopup();
            map.on('mousemove', moving);
            marker.off('click');
            map.on('preclick', finishMove);

            function finishMove(evt) {
                var isFinish = true;
                marker.setLatLng(evt.latlng);
                if (marker.isSelected)
                    map.drawPoints.pulsemarker.setLatLng(evt.latlng);
                marker.attrs['lat'] = marker.getLatLng().lat;
                marker.attrs['lng'] = marker.getLatLng().lng;
                map.off('mousemove', moving);
                map.off('preclick', finishMove);
                marker.on('click', function () {
                    if (isFinish) {
                        isFinish = false;
                        return;
                    }
                    map._drawMarkerSelect(this);
                    map.fire('selectMarker', this.attrs);
                });
                reset();
                map.fire('editMarker', marker.attrs);
            }

            function moving(evt) {
                marker.setLatLng(evt.latlng);
                if (marker.isSelected)
                    map.drawPoints.pulsemarker.setLatLng(evt.latlng);
            }
        }
        var template = `
            <p class='title'>标注点编辑</p>
            <div style='margin-top:10px'>
                <span>颜色:</span>
                <ul class='colors'>
                    <li><div id='draw-red' class='box' style='background-color: red;'></div></li>
                    <li><div id='draw-blue' class='box' style='background-color: #3498db;'></div></li>
                    <li><div id='draw-green' class='box' style='background-color: green;'></div></li>
                    <li><div id='draw-smoke' class='box' style='background-color: #de9400;'></div></li>
                    <li><div id='draw-carmine' class='box' style='background-color: #f0f;'></div></li>
                    <li><div id='draw-browngreen' class='box' style='background-color: #8a8000;'></div></li>
                </ul>
            </div>
            <div style='margin-top:10px;'>
                <span style='vertical-align: top;'>内容:</span>
                <div style='display:inline;'>
                    <textarea id='marker-content' style='height:80px;resize: none;width:130px;'></textarea>
                </div>
            </div>
            <div style='width: 160px; margin: 10px auto;'>
                <input type='button' class='el-button edit-ok' value='确定'>
                <input type='button' class='el-button edit-cancel' value='取消'>
            </div>
            `;

        function editDrawPointInfo(marker) {
            setContextDisable();
            marker.closePopup().unbindPopup();
            marker.bindPopup(new L.Popup.southeastPopup({
                closeButton: false,
                autoClose: false
            }).setContent(template), {}).openPopup();
            $('#draw-' + marker.attrs.color).addClass('select');
            $('#marker-content').text(marker.attrs.content);
            $('.box').click(function (evt) {
                $('.box').removeClass('select');
                $(evt.target).addClass('select');
                marker.setIcon(L.icon({
                    iconUrl: map._getdrawImage(evt.target.id),
                    iconSize: map.drawPoints.icon.options.iconSize || [20, 20],
                    iconAnchor: map.drawPoints.icon.options.iconAnchor || [10, 10],
                    popupAnchor: map.drawPoints.icon.options.popupAnchor || [-20, -10]
                }));
                if (marker.isSelected)
                    map.drawPoints.pulsemarker.setIcon(L.divIcon({
                        className: 'pulse pulse-' + evt.target.id.slice(5)
                    }));
            });
            $('.edit-ok').click(function () {
                marker.attrs.content = $('#marker-content')[0].value;
                marker.attrs.color = $('.box.select').attr('id').slice(5);
                marker.closePopup().unbindPopup();
                if (marker.attrs.content != '') {
                    marker.bindPopup(new L.Popup.southeastPopup().setContent(marker.attrs.content), {}).openPopup();
                }
                reset();
                map.fire(marker.isNew ? 'createMarker' : 'editMarker', marker.attrs);
                marker.isNew = false;
            });
            $('.edit-cancel').click(function () {
                marker.setIcon(L.icon({
                    iconUrl: map._getdrawImage('draw-' + marker.attrs.color),
                    iconSize: map.drawPoints.icon.options.iconSize || [20, 20],
                    iconAnchor: map.drawPoints.icon.options.iconAnchor || [10, 10],
                    popupAnchor: map.drawPoints.icon.options.popupAnchor || [-20, -10]
                }));
                if (marker.isSelected)
                    map.drawPoints.pulsemarker.setIcon(L.divIcon({
                        className: 'pulse pulse-' + marker.attrs.color
                    }));
                marker.closePopup().unbindPopup();
                if (marker.attrs.content != '') {
                    marker.bindPopup(new L.Popup.southeastPopup().setContent(marker.attrs.content), {});
                }
                reset();
                if (marker.isNew) {
                    map.drawPoints.removeLayer(marker);
                }
            });
        }

        function deleteDrawPointInfo(marker) {
            marker.closePopup().unbindPopup();
            map.drawPoints.removeLayer(marker);
            if (marker.isSelected)
                map.drawPoints.removeLayer(map.drawPoints.pulsemarker);
            map.fire('deleteMarker', marker.attrs);
        }

        function setContextDisable() {
            map.contextmenu.setDisabled(0, true);
            map.drawPoints.eachLayer(function (marker) {
                marker.unbindContextMenu();
            });
        }

        function reset() {
            map.contextmenu.setDisabled(0, false);
            map.drawPoints.eachLayer(function (marker) {
                marker.bindContextMenu(ctxoptions);
            });
        }
        this.drawPoints.ctxoptions = ctxoptions;
        return editDrawPointInfo;
    },
    _drawMarkerSelect: function (marker) {
        var map = this;
        if (map.drawPoints.pulsemarker) {
            map.drawPoints.removeLayer(map.drawPoints.pulsemarker);
            map.drawPoints.eachLayer(function (layer) {
                if (layer.attrs && layer.attrs.leafletid == map.drawPoints.pulsemarker.relateId) {
                    layer.isSelected = false;
                    return;
                }
            });
        }
        if (!marker) return;
        map.panTo(marker.getLatLng());
        marker.isSelected = true;
        map.drawPoints.pulsemarker = L.marker(marker.getLatLng(), {
            icon: L.divIcon({
                className: 'pulse pulse-' + marker.attrs.color
            }),
            zIndexOffset: -1
        }).addTo(map.drawPoints);
        map.drawPoints.pulsemarker.relateId = marker.attrs.leafletid;
    },
    _getdrawImage: function (color) {
        switch (color) {
            case 'draw-red':
                return draw_red;
            case 'draw-blue':
                return draw_blue;
            case 'draw-browngreen':
                return draw_browngreen;
            case 'draw-green':
                return draw_green;
            case 'draw-carmine':
                return draw_carmine;
            case 'draw-smoke':
                return draw_smoke;
            default:
                return draw_red;
        }
    },
    _getflagImage: function (color) {
        switch (color) {
            case 'flag-blue':
                return flag_blue;
            case 'flag-browngreen':
                return flag_browngreen;
            case 'flag-carmine':
                return flag_carmine;
            case 'flag-green':
                return flag_green;
            case 'flag-magenta':
                return flag_magenta;
            case 'flag-red':
                return flag_red;
            case 'flag-sapphireblue':
                return flag_sapphireblue;
            case 'flag-smoke':
                return flag_smoke;
            case 'flag-tan':
                return flag_tan;
            default:
                return flag_red;
        }
    },
    initDrawPoint: function (options) {
        this._initdrawLayer();
        this._initdrawIcon(options);
        var map = this;
        var func = this._initdrawContext();
        this.contextmenu.addItem({
            text: '在此处添加标注',
            index: 0,
            callback: function (evt) {
                var op = L.setOptions({}, map.drawPoints.ctxoptions);
                op.icon = map.drawPoints.icon;
                var marker = L.marker(evt.latlng, op).on('click', function () {
                    map._drawMarkerSelect(this);
                    map.fire('selectMarker', this.attrs);
                }).addTo(map.drawPoints);
                marker.attrs = {};
                marker.attrs['leafletid'] = marker._leaflet_id;
                marker.attrs['color'] = 'red';
                marker.attrs['content'] = '';
                marker.attrs['lat'] = marker.getLatLng().lat;
                marker.attrs['lng'] = marker.getLatLng().lng;
                marker.isNew = true;
                func(marker);
            }
        });
    },
    addDrawPointsToMap: function (data, options) {
        this._initdrawLayer();
        this._initdrawIcon(options);
        this._initdrawContext();
        var map = this;
        var array = [];
        var bounds = [];
        for (var i = 0; i < data.length; i++) {
            var ele = data[i];
            if (ele.lat && ele.lng) {
                var op = L.setOptions({}, map.drawPoints.ctxoptions);
                ele.color = ele.color || 'red';
                op.icon = L.icon({
                    iconUrl: map._getdrawImage('draw-' + ele.color),
                    iconSize: map.drawPoints.icon.options.iconSize,
                    iconAnchor: map.drawPoints.icon.options.iconAnchor,
                    popupAnchor: map.drawPoints.icon.options.popupAnchor
                })
                var marker = L.marker([ele.lat, ele.lng], op).on('click', function () {
                    map._drawMarkerSelect(this);
                    map.fire('selectMarker', this.attrs);
                }).addTo(map.drawPoints);
                marker.attrs = {};
                for (var attr in ele) {
                    marker.attrs[attr] = ele[attr];
                }
                marker.attrs['leafletid'] = marker._leaflet_id;
                if (marker.attrs.content != '') {
                    marker.bindPopup(new L.Popup.southeastPopup().setContent(marker.attrs.content), {});
                }
                array.push(marker.attrs);
                bounds.push(marker.getLatLng());
            }
        }
        map._fitLatlngs(bounds);
        return array;
    },
    selectDrawPoint: function (leaflet_id) {
        var map = this;
        var marker;
        this.drawPoints.eachLayer(function (layer) {
            if (layer._leaflet_id == leaflet_id) {
                marker = layer;
                return;
            }
        });
        map._drawMarkerSelect(marker);
    },
    deleteDrawPoints: function (leaflet_ids) {
        var map = this;
        this.drawPoints.eachLayer(function (layer) {
            if (leaflet_ids.indexOf(layer._leaflet_id) > -1) {
                layer.closePopup().unbindPopup();
                map.drawPoints.removeLayer(layer);
                if (layer.isSelected) map.drawPoints.removeLayer(map.drawPoints.pulsemarker);
            }
        });
    },
    clearDrawPoints: function () {
        this.drawPoints.clearLayers();
    },
    _fitLatlngs: function (latlngs) {
        if (!latlngs || latlngs.length == 0) return;
        if (latlngs.length == 1) {
            this.panTo(latlngs[0]);
        } else {
            this.fitBounds(latlngs);
        }
    }
})