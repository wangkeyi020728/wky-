const MapCore = {
    map: null,
    center: new BMap.Point(104.189026, 30.651446),
    zoom: 15,
    mapTypes: {
        normal: BMAP_NORMAL_MAP,
        satellite: BMAP_SATELLITE_MAP,
        perspective: BMAP_HYBRID_MAP  // 将三维地图改为混合地图
    },

    init() {
        this.map = new BMap.Map("map-container");
        this.map.centerAndZoom(this.center, this.zoom);
        this.map.enableScrollWheelZoom(true);
        this.addControls();
        this.initEventListeners();
    },

    addControls() {
        this.map.addControl(new BMap.NavigationControl());
        this.map.addControl(new BMap.ScaleControl());
        this.map.addControl(new BMap.MapTypeControl({
            mapTypes: [
                BMAP_NORMAL_MAP,
                BMAP_SATELLITE_MAP,
                BMAP_HYBRID_MAP  // 这里也需要修改
            ]
        }));
    },

    initEventListeners() {
        this.map.addEventListener('click', e => {
            DrawTool.handleMapClick(e);
        });

        this.map.addEventListener('rightclick', e => {
            // 检查是否有正在进行的绘制
            if (DrawTool.currentDrawing) {
                // 阻止默认右键菜单
                if (e.domEvent) {
                    e.domEvent.preventDefault();
                    e.domEvent.stopPropagation();
                }
                
                // 保存当前绘制内容
                try {
                    console.log('右键完成绘制开始');
                    // 完成绘制但不清除覆盖物
                    DrawTool.finishDrawing(true);
                    console.log('右键完成绘制结束');
                } catch (error) {
                    console.error('完成绘制时出错:', error);
                }
                
                // 不要调用setActiveTool(null)，因为finishDrawing(true)已经重置了工具状态
                // 但我们需要确保绘制的要素不被清除
                
                return false;
            }
        });

        this.map.addEventListener('mousemove', e => {
            DrawTool.handleMouseMove(e);
        });
        
        // 添加键盘ESC键事件监听
        document.addEventListener('keydown', e => {
            // ESC键的keyCode是27
            if (e.keyCode === 27 || e.key === 'Escape') {
                console.log('ESC键被按下');
                if (DrawTool.currentDrawing) {
                    // ESC键取消绘制
                    DrawTool.cancelDrawing();
                    e.preventDefault();
                }
            }
        });
    },

    switchMapType(type) {
        if (this.mapTypes[type]) {
            this.map.setMapType(this.mapTypes[type]);
            
            // 如果是卫星图或混合地图，可能需要额外设置
            if (type === 'satellite' || type === 'perspective') {
                // 确保卫星图和混合地图正确加载
                setTimeout(() => {
                    this.map.setMapType(this.mapTypes[type]);
                }, 100);
            }
        }
    },

    clearAll() {
        this.map.clearOverlays();
        FeatureManager.clearFeatures();
        this.addControls();
    },

    getCenter() {
        return this.map.getCenter();
    },

    getZoom() {
        return this.map.getZoom();
    },

    panTo(point) {
        this.map.panTo(point);
    },

    addOverlay(overlay) {
        this.map.addOverlay(overlay);
    },

    removeOverlay(overlay) {
        this.map.removeOverlay(overlay);
    }
};

// 初始化地图
document.addEventListener('DOMContentLoaded', () => {
    MapCore.init();
});