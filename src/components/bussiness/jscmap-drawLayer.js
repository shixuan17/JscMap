import '../util/leaflet.label'
import '../util/jscmap.southeastPopup'
import $ from '../../lib/jquery'
// import markerIcon from '../../css/images/marker-icon.png'

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

import poi_red from '../../css/images/poi-red.png'
import poi_blue from '../../css/images/poi-blue.png'

L.DrawLayer = L.FeatureGroup.extend({
    initialize: function (options) {
        L.setOptions(this, options);
        this.options.popupAnchor = this.options.iconSize ? [-20 + this.options.iconSize[0] / 3, -10 + this.options.iconSize[1] / 3] : [-20 + 20 / 3, -10 + 20 / 3];
        this.options.iconPrefix = this.options.iconType + '_';
        var that = this;

        var ctxoptions = {
            contextmenu: true,
            contextmenuItems: [],
            contextmenuInheritItems: false
        };
        var ctxoptionIndex = 0;
        if (options.canMove) {
            ctxoptions.contextmenuItems.push({
                text: '调整位置',
                index: ctxoptionIndex++,
                callback: function (e1) {
                    that.moveDrawPoint(e1.relatedTarget);
                }
            });
        }

        if (options.canEdit) {
            ctxoptions.contextmenuItems.push({
                text: '编辑',
                index: ctxoptionIndex++,
                callback: function (e2) {
                    that.editDrawPointInfo(e2.relatedTarget);
                }
            });
        }
        if (options.canDelete) {
            ctxoptions.contextmenuItems.push({
                text: '删除',
                index: ctxoptionIndex++,
                callback: function (e3) {
                    that.deleteDrawPoints([e3.relatedTarget._leaflet_id]);
                    that.fire('deleteMarker', e3.relatedTarget.attrs);
                }
            });
        }

        this.ctxoptions = ctxoptions;

        this.editPopupTemplate = `
            <p class='title'>标注点编辑</p>
            <div style='margin-top:10px'>
                <span>颜色:</span>
                <ul class='colors'>
                    <li><div id='` + this.options.iconPrefix + `red' class='box' style='background-color: red;'></div></li>
                    <li><div id='` + this.options.iconPrefix + `blue' class='box' style='background-color: #3498db;'></div></li>
                    <li><div id='` + this.options.iconPrefix + `green' class='box' style='background-color: green;'></div></li>
                    <li><div id='` + this.options.iconPrefix + `smoke' class='box' style='background-color: #de9400;'></div></li>
                    <li><div id='` + this.options.iconPrefix + `carmine' class='box' style='background-color: #f0f;'></div></li>
                    <li><div id='` + this.options.iconPrefix + `browngreen' class='box' style='background-color: #8a8000;'></div></li>
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


        this.on('add', function (evt) {
            that.map = evt.target._map;
        });

        L.FeatureGroup.prototype.initialize.call(this, this.options);
        this.markers = [];
    },

    addDrawPoint: function (ele) {
        if (ele.lat && ele.lng) {
            var op = L.setOptions({}, this.ctxoptions);
            ele.color = ele.color || 'red';
            ele.content = ele.content || '';
            op.icon = L.icon({
                iconUrl: this._getdrawImage(this.options.iconPrefix + ele.color),
                iconSize: this.options.iconSize || [20, 20],
                iconAnchor: this.options.iconAnchor || [10, 10],
                popupAnchor: this.options.popupAnchor || [-20, -10]
            })
            var that = this;
            var marker = L.marker([ele.lat, ele.lng], op).on('click', function () {
                that.selectDrawPoint(this._leaflet_id);
                that.fire('selectMarker', this.attrs);
            }).addTo(this);
            marker.attrs = {};
            for (var attr in ele) {
                marker.attrs[attr] = ele[attr];
            }
            marker.attrs['leafletid'] = marker._leaflet_id;
            if (this.options.showLabel && marker.attrs.content != '') {
                marker.bindLabel(ele.content).showLabel();
            }
            if (this.options.showPopup && marker.attrs.content != '') {
                marker.bindPopup(new L.Popup.southeastPopup().setContent(marker.attrs.content), {});
            }
            return marker;
        }
    },

    moveDrawPoint: function (marker) {
        var that = this;
        that.setContextDisable();
        marker.closePopup();
        that.map.on('mousemove', moving);
        marker.off('click');
        that.map.on('preclick', finishMove);

        function finishMove(evt) {
            var isFinish = true;
            marker.setLatLng(evt.latlng);
            if (marker.isSelected)
                that.pulsemarker.setLatLng(evt.latlng);
            marker.attrs['lat'] = marker.getLatLng().lat;
            marker.attrs['lng'] = marker.getLatLng().lng;
            that.map.off('mousemove', moving);
            that.map.off('preclick', finishMove);
            marker.on('click', function () {
                if (isFinish) {
                    isFinish = false;
                    return;
                }
                that.selectDrawPoint(this._leaflet_id);
                that.fire('selectMarker', this.attrs);
            });
            that.reset();
            that.fire('editMarker', marker.attrs);
        }

        function moving(evt) {
            marker.setLatLng(evt.latlng);
            if (marker.isSelected)
                that.pulsemarker.setLatLng(evt.latlng);
        }
    },

    editDrawPointInfo: function (marker) {
        var that = this;
        that.setContextDisable();
        if (that.options.showPopup) {
            marker.closePopup().unbindPopup();
            marker.bindPopup(new L.Popup.southeastPopup({
                closeButton: false,
                autoClose: false
            }).setContent(that.editPopupTemplate), {}).openPopup();
        }

        $('#' + that.options.iconType + '-' + marker.attrs.color).addClass('select');
        $('#marker-content').text(marker.attrs.content);

        $('.box').click(function (evt) {
            $('.box').removeClass('select');
            $(evt.target).addClass('select');
            marker.setIcon(L.icon({
                iconUrl: that._getdrawImage(evt.target.id),
                iconSize: that.options.iconSize || [20, 20],
                iconAnchor: that.options.iconAnchor || [10, 10],
                popupAnchor: that.options.popupAnchor || [-20, -10]
            }));
            if (marker.isSelected)
                that.pulsemarker.setIcon(L.divIcon({
                    className: 'pulse pulse-' + evt.target.id.slice(5)
                }));
        });
        $('.edit-ok').click(function () {
            marker.attrs.content = $('#marker-content')[0].value;
            marker.attrs.color = $('.box.select').attr('id').slice(5);
            marker.closePopup().unbindPopup();
            if (that.options.showPopup && marker.attrs.content != '') {
                marker.bindPopup(new L.Popup.southeastPopup().setContent(marker.attrs.content), {}).openPopup();
            }
            that.reset();
            that.fire(marker.isNew ? 'createMarker' : 'editMarker', marker.attrs);
            if (marker.isNew) {
                that.markers.push(marker.attrs);
            }
            marker.isNew = false;
        });
        $('.edit-cancel').click(function () {
            marker.setIcon(L.icon({
                iconUrl: that._getdrawImage(that.options.iconPrefix + marker.attrs.color),
                iconSize: that.options.iconSize || [20, 20],
                iconAnchor: that.options.iconAnchor || [10, 10],
                popupAnchor: that.options.popupAnchor || [-20, -10]
            }));
            if (marker.isSelected)
                that.pulsemarker.setIcon(L.divIcon({
                    className: 'pulse pulse-' + marker.attrs.color
                }));
            marker.closePopup().unbindPopup();
            if (that.options.showPopup && marker.attrs.content != '') {
                marker.bindPopup(new L.Popup.southeastPopup().setContent(marker.attrs.content), {});
            }
            that.reset();
            if (marker.isNew) {
                that.removeLayer(marker);
            }
        });
    },

    setContextDisable: function () {
        this.map.contextmenu.setDisabled(0, true);
        this.eachLayer(function (marker) {
            marker.unbindContextMenu();
        });
    },

    reset: function () {
        this.map.contextmenu.setDisabled(0, false);
        this.eachLayer(function (marker) {
            marker.bindContextMenu(this.ctxoptions);
        }, this);
    },

    _selectDrawPoint: function (marker) {
        if (this.pulsemarker) {
            var pulsemarker = this.pulsemarker;
            this.removeLayer(pulsemarker);
            this.eachLayer(function (layer) {
                if (layer.attrs && layer.attrs['id'] == pulsemarker.relateId) {
                    layer.isSelected = false;
                    return;
                }
            });
        }
        if (!marker) return;
        this.map.panTo(marker.getLatLng());
        marker.isSelected = true;
        this.pulsemarker = L.marker(marker.getLatLng(), {
            icon: L.divIcon({
                className: 'pulse pulse-' + marker.attrs.color
            }),
            zIndexOffset: -1
        }).addTo(this);
        this.pulsemarker.relateId = marker.attrs['id'];
    },

    _getdrawImage: function (color) {
        switch (color) {
            case 'draw_red':
                return draw_red;
            case 'draw_blue':
                return draw_blue;
            case 'draw_browngreen':
                return draw_browngreen;
            case 'draw_green':
                return draw_green;
            case 'draw_carmine':
                return draw_carmine;
            case 'draw_smoke':
                return draw_smoke;
            case 'flag_blue':
                return flag_blue;
            case 'flag_browngreen':
                return flag_browngreen;
            case 'flag_carmine':
                return flag_carmine;
            case 'flag_green':
                return flag_green;
            case 'flag_magenta':
                return flag_magenta;
            case 'flag_red':
                return flag_red;
            case 'flag_sapphireblue':
                return flag_sapphireblue;
            case 'flag_smoke':
                return flag_smoke;
            case 'flag_tan':
                return flag_tan;
            case 'poi_red':
                return poi_red;
            case 'poi_blue':
                return poi_blue;
            default:
                return draw_red;
        }
    },

    selectDrawPoint: function (leafletid) {
        var marker;
        this.eachLayer(function (layer) {
            if (layer._leaflet_id == leafletid) {
                marker = layer;
                return;
            }
        });
        this._selectDrawPoint(marker);
    },

    deleteDrawPoints: function (leaflet_ids) {
        var that = this;
        this.eachLayer(function (layer) {
            if (leaflet_ids.indexOf(layer._leaflet_id) > -1) {
                layer.closePopup().unbindPopup();
                that.removeLayer(layer);
                var ele = that.markers.find(function (element) {
                    return element.leafletid == layer._leaflet_id;
                })
                that.markers.splice(that.markers.indexOf(ele), 1);
                if (layer.isSelected) that.removeLayer(that.pulsemarker);
            }
        });

    },

    clearDrawPoints: function () {
        this.clearLayers();
        this.markers = [];
    },

    panTo: function (leafletid) {
        var marker;
        this.eachLayer(function (layer) {
            if (layer._leaflet_id == leafletid) {
                marker = layer;
                return;
            }
        });
        if (!marker) return;
        this.map.panTo(marker.getLatLng());
    },

    pulse: function (leafletid) {
        if (this.pulsemarker) {
            var pulsemarker = this.pulsemarker;
            this.removeLayer(pulsemarker);
            this.eachLayer(function (layer) {
                if (layer.attrs && layer.attrs['id'] == pulsemarker.relateId) {
                    layer.isSelected = false;
                    return;
                }
            });
        }
        var marker;
        this.eachLayer(function (layer) {
            if (layer._leaflet_id == leafletid) {
                marker = layer;
                return;
            }
        });
        if (!marker) return;
        marker.isSelected = true;
        this.pulsemarker = L.marker(marker.getLatLng(), {
            icon: L.divIcon({
                className: 'pulse pulse-' + marker.attrs.color
            }),
            zIndexOffset: -1
        }).addTo(this);
        this.pulsemarker.relateId = marker.attrs['id'];
    },

    popup: function (leafletid) {
        if (!this.options.showPopup) return;
        var marker;
        this.eachLayer(function (layer) {
            if (layer._leaflet_id == leafletid) {
                marker = layer;
                return;
            }
        });
        if (!marker) {
            this.map.closePopup();
            return;
        }
        marker.openPopup();
    }

});

L.drawLayer = function (options) {
    return new L.DrawLayer(options);
}

L.Map.include({
    initDrawPoint: function (options, layer) {
        var drawPoints = layer || L.drawLayer(options).addTo(this);
        this.contextmenu.addItem({
            text: drawPoints.options.contextTitle || '在此处添加标注',
            index: 0,
            callback: function (evt) {
                var marker = drawPoints.addDrawPoint({
                    lat: evt.latlng.lat,
                    lng: evt.latlng.lng
                });
                marker.isNew = true;
                drawPoints.editDrawPointInfo(marker);
            }
        });
        return drawPoints;
    },

    addDrawPointsToLayer: function (data, options, layer) {
        var drawPoints = layer || L.drawLayer(options).addTo(this);
        var bounds = [];
        drawPoints.newVal = [];
        for (var i = 0; i < data.length; i++) {
            var marker = drawPoints.addDrawPoint(data[i]);
            drawPoints.markers.push(marker.attrs);
            drawPoints.newVal.push(marker.attrs);
            bounds.push(marker.getLatLng());
        }
        this._fitLatlngs(bounds);
        return drawPoints;
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