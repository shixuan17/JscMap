/**********************************************************************************************************************************
    模块：地图右下角弹出框
***********************************************************************************************************************************/
L.Popup.southeastPopup = L.Popup.extend({
    options: {
        hasTip: true,
    },
    _initLayout: function () {

        var prefix = 'leaflet-popup',
            container = this._container = L.DomUtil.create('div',
                prefix + ' ' + (this.options.className || '') +
                ' leaflet-zoom-animated');

        if (this.options.closeButton) {
            var closeButton = this._closeButton = L.DomUtil.create('a', prefix + '-close-button', container);
            closeButton.href = '#close';
            closeButton.innerHTML = '&#215;';

            L.DomEvent.on(closeButton, 'click', this._onCloseButtonClick, this);
        }

        var wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper', container);
        this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper);

        L.DomEvent
            .disableClickPropagation(wrapper)
            .disableScrollPropagation(this._contentNode)
            .on(wrapper, 'contextmenu', L.DomEvent.stopPropagation);

        if (this.options.hasTip) {
            this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container);
            this._tip = L.DomUtil.create('div', prefix + '-tip', this._tipContainer);
        }
    },
    _updatePosition: function () {

        if (!this._map) {
            return;
        }

        var pos = this._map.latLngToLayerPoint(this._latlng),
            basePoint = this._map.layerPointToContainerPoint(pos),
            containerWidth = this._container.offsetWidth,
            padding = L.point(this.options.autoPanPadding),
            paddingTL = L.point(this.options.autoPanPaddingTopLeft || padding),
            paddingBR = L.point(this.options.autoPanPaddingBottomRight || padding),
            mapSize = this._map.getSize(),
            anchor = this._getAnchor(), // popup anchor
            offset = L.point(this.options.offset); // offset relative to anchor (option from L.DivOverlay. We only use absolute values).

        // Leaflet default dimensions (should not be hard coded in the future)
        var tipHeight = 11; //px

        // Tweak offset to include tip dimensions 
        var offsetX = Math.abs(offset.x);
        var offsetY = Math.abs(offset.y);
        if (this.options.hasTip) {
            offsetX += tipHeight;
            offsetY += tipHeight;
            // clear CSS
            L.DomUtil.removeClass(this._container, 'leaflet-resp-popup-south-east');
            // this._container.style.display = 'initial'; // this does not work
        }

        // Where can we fit the popup ?
        var containerPos = false;

        // manage overflows
        var subtractX = containerWidth / 2 - anchor.x;

        var containerLeft = basePoint.x + anchor.x - (containerWidth / 2);
        var containerRight = basePoint.x + anchor.x + (containerWidth / 2);
        if (containerLeft < Math.abs(paddingTL.x)) { // left overflow
            subtractX = containerWidth / 2 - anchor.x - Math.abs(paddingTL.x) + containerLeft;
        }
        if (containerRight > mapSize.x - Math.abs(paddingBR.x)) { // right overflow
            subtractX = containerWidth / 2 - anchor.x + containerRight - mapSize.x + Math.abs(paddingBR.x);
        }

        // position the popup (order of preference is: top, left, bottom, right, centerOnMap)
        containerPos = pos.subtract(L.point(subtractX, -anchor.y - offsetY, true));
        if (this.options.hasTip) {
            containerPos.x = pos.x + anchor.x;
            L.DomUtil.addClass(this._container, 'leaflet-resp-popup-south-east');
            this._tipContainer.style.top = '0px';
            this._tipContainer.style.left = '0px';
        }

        L.DomUtil.setPosition(this._container, containerPos);
    }

});