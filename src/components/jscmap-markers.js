import '../lib/leaflet.label-src'
import $ from '../lib/jquery'
import markerIcon from '../css/images/marker-icon.png'
import draw_red from '../css/images/draw-red.png'
import draw_blue from '../css/images/draw-blue.png'
import draw_browngreen from '../css/images/draw-browngreen.png'
import draw_green from '../css/images/draw-green.png'
import draw_pink from '../css/images/draw-pink.png'
import draw_smoke from '../css/images/draw-smoke.png'


L.Map.include({
    addPointsToMap: function (data, options) {
        if (!this.basicFeatures) {
            this.basicFeatures = L.featureGroup([]).addTo(this);
        }
        var markeroptions = {};
        if (options) {
            var icon = L.icon({
                iconUrl: options.icon || markerIcon,
                iconSize: options.iconSize || [20, 20],
                iconAnchor: options.iconAnchor || [10, 10],
                popupAnchor: [-20, -10]
            });
        } else {
            icon = L.icon({
                iconUrl: markerIcon,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
                popupAnchor: [-20, -10]
            });
        }

        for (var i = 0; i < data.length; i++) {
            var ele = data[i];
            if (ele.lat && ele.lng) {
                var markeroptions = {};
                if (icon) {
                    markeroptions.icon = icon;
                }
                var marker = L.marker([ele.lat, ele.lng], markeroptions);
                if (options && options.showLabel) {
                    marker.bindLabel(ele.content);
                }
                this.basicFeatures.addLayer(marker);
            }
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
            map.on('click', finishMove);

            function finishMove(evt) {
                marker.setLatLng(evt.latlng);
                map.off('mousemove', moving);
                map.off('click', finishMove);
                marker.on('click', function () {
                    map._drawMarkerSelect(this);
                    map.fire('selectMarker', {
                        id: this.drawinfo.id,
                        content: this.drawinfo.content,
                        color: this.drawinfo.color,
                        lat: this.getLatLng().lat,
                        lng: this.getLatLng().lng
                    });
                });
                reset();
                map.fire('editMarker', {
                    id: marker.drawinfo.id,
                    content: marker.drawinfo.content,
                    color: marker.drawinfo.color,
                    lat: marker.getLatLng().lat,
                    lng: marker.getLatLng().lng
                });
            }

            function moving(evt) {
                marker.setLatLng(evt.latlng);
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
                    <li><div id='draw-pink' class='box' style='background-color: #f0f;'></div></li>
                    <li><div id='draw-browngreen' class='box' style='background-color: #8a8000;'></div></li>
                </ul>
            </div>
            <div style='margin-top:10px'>
                <span>内容:</span>
                <div>
                    <textarea id='marker-content' style='height:80px;'></textarea>
                </div>
            </div>
            <div style='margin-top:10px'>
                <input type='button' class='el-button edit-ok' value='确定'>
                <input type='button' class='el-button edit-cancel' value='取消'>
            </div>
            `;

        function editDrawPointInfo(marker) {
            setContextDisable();
            marker.closePopup().unbindPopup();
            marker.bindPopup(new L.Popup.StaticPopup({
                closeButton: false,
                autoClose: false
            }).setContent(template), {}).openPopup();

            $('#draw-' + marker.drawinfo.color).addClass('select');
            $('#marker-content').text(marker.drawinfo.content);

            $('.box').click(function (evt) {
                $('.box').removeClass('select');
                $(evt.target).addClass('select');
                marker.setIcon(L.icon({
                    iconUrl: map._getdrawImage(evt.target.id),
                    iconSize: map.drawPoints.icon.options.iconSize || [20, 20],
                    iconAnchor: map.drawPoints.icon.options.iconAnchor || [10, 10],
                    popupAnchor: map.drawPoints.icon.options.popupAnchor || [-20, -10]
                }));
            });
            $('.edit-ok').click(function () {
                marker.drawinfo.content = $('#marker-content')[0].value;
                marker.drawinfo.color = $('.box.select').attr('id').slice(5);
                marker.closePopup();
                if (marker.drawinfo.content != '') {
                    marker.bindPopup(new L.Popup.StaticPopup().setContent(marker.drawinfo.content), {}).openPopup();
                }
                reset();
                map.fire('editMarker', {
                    id: marker.drawinfo.id,
                    content: marker.drawinfo.content,
                    color: marker.drawinfo.color,
                    lat: marker.getLatLng().lat,
                    lng: marker.getLatLng().lng
                });
            });
            $('.edit-cancel').click(function () {
                marker.setIcon(L.icon({
                    iconUrl: map._getdrawImage('draw-' + marker.drawinfo.color),
                    iconSize: map.drawPoints.icon.options.iconSize || [20, 20],
                    iconAnchor: map.drawPoints.icon.options.iconAnchor || [10, 10],
                    popupAnchor: map.drawPoints.icon.options.popupAnchor || [-20, -10]
                }));
                marker.closePopup();
                if (marker.drawinfo.content != '') {
                    marker.bindPopup(new L.Popup.StaticPopup().setContent(marker.drawinfo.content), {});
                }
                reset();
            });
        }

        function deleteDrawPointInfo(marker) {
            marker.closePopup().unbindPopup();
            map.drawPoints.removeLayer(marker);
            map.fire('deleteMarker', {
                id: marker.drawinfo.id,
                content: marker.drawinfo.content,
                color: marker.drawinfo.color,
                lat: marker.getLatLng().lat,
                lng: marker.getLatLng().lng
            });
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
    },

    _drawMarkerSelect: function (marker) {
        var map = this;
        map.panTo(marker.getLatLng());
        // marker.setIcon(L.icon({
        //     iconUrl: map._getdrawImage('draw-' + marker.drawinfo.color),
        //     iconSize: map.drawPoints.icon.options.iconSize,
        //     iconAnchor: map.drawPoints.icon.options.iconAnchor,
        //     popupAnchor: map.drawPoints.icon.options.popupAnchor,
        //     className: 'pulse-' + marker.drawinfo.color
        // }));
        // $('.pulse-' + marker.drawinfo.color).attr('alt', '11');
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
            case 'draw-pink':
                return draw_pink;
            case 'draw-smoke':
                return draw_smoke;
            default:
                return draw_red;
        }
    },

    initDrawPoint: function (options) {
        this._initdrawLayer();
        this._initdrawIcon(options);
        var map = this;
        this._initdrawContext();
        this.contextmenu.addItem({
            text: '在此处添加标注',
            index: 0,
            callback: function (evt) {
                var op = L.setOptions({}, map.drawPoints.ctxoptions);
                op.icon = map.drawPoints.icon;
                var marker = L.marker(evt.latlng, op).on('click', function () {
                    map._drawMarkerSelect(this);
                    map.fire('selectMarker', {
                        id: this.drawinfo.id,
                        content: this.drawinfo.content,
                        color: this.drawinfo.color,
                        lat: this.getLatLng().lat,
                        lng: this.getLatLng().lng
                    });
                }).addTo(map.drawPoints);
                marker.drawinfo = {
                    id: marker._leaflet_id,
                    content: '',
                    color: 'red'
                };
                map.fire('createMarker', {
                    id: marker._leaflet_id,
                    content: '',
                    color: 'red',
                    lat: marker.getLatLng().lat,
                    lng: marker.getLatLng().lng
                });
            }
        });

    },

    addDrawPointsToMap: function (data, options) {
        this._initdrawLayer();
        this._initdrawIcon(options);
        this._initdrawContext();

        var map = this;
        var array = [];
        for (var i = 0; i < data.length; i++) {
            var ele = data[i];
            if (ele.lat && ele.lng) {
                var op = L.setOptions({}, map.drawPoints.ctxoptions);
                op.icon = L.icon({
                    iconUrl: map._getdrawImage('draw-' + ele.color || 'red'),
                    iconSize: map.drawPoints.icon.options.iconSize,
                    iconAnchor: map.drawPoints.icon.options.iconAnchor,
                    popupAnchor: map.drawPoints.icon.options.popupAnchor
                })
                var marker = L.marker([ele.lat, ele.lng], op).on('click', function () {
                    map._drawMarkerSelect(this);
                    map.fire('selectMarker', {
                        id: this.drawinfo.id,
                        content: this.drawinfo.content,
                        color: this.drawinfo.color,
                        lat: this.getLatLng().lat,
                        lng: this.getLatLng().lng
                    });
                }).addTo(map.drawPoints);
                marker.drawinfo = {
                    id: marker._leaflet_id,
                    content: ele.content,
                    color: ele.color || 'red'
                };
                if (marker.drawinfo.content != '') {
                    marker.bindPopup(new L.Popup.StaticPopup().setContent(marker.drawinfo.content), {});
                }
                array.push({
                    id: marker.drawinfo.id,
                    content: marker.drawinfo.content,
                    color: marker.drawinfo.color,
                    lat: marker.getLatLng().lat,
                    lng: marker.getLatLng().lng
                });
            }
        }
        return array;
    },

    selectDrawPoint: function (leaflet_id) {
        var map = this;
        this.drawPoints.eachLayer(function (layer) {
            if (layer._leaflet_id == leaflet_id) {
                map._drawMarkerSelect(layer);
                return;
            }
        });
    },

    deleteDrawPoints: function (leaflet_ids) {
        var map = this;
        this.drawPoints.eachLayer(function (layer) {
            if (leaflet_ids.indexOf(layer._leaflet_id) > -1) {
                layer.closePopup().unbindPopup();
                map.drawPoints.removeLayer(layer);
            }
        });
    },

    clearDrawPoints: function () {
        this.drawPoints.clearLayers();
    }

})