const DrawTool = {
    activeTool: null,
    currentDrawing: null,
    style: {
        point: new BMap.Icon('./images/markers/point.png', new BMap.Size(24, 24), {
            imageSize: new BMap.Size(24, 24),
            anchor: new BMap.Size(12, 12)
        }),
        hydrant: new BMap.Icon('./images/markers/hydrant.png', new BMap.Size(24, 24), {
            imageSize: new BMap.Size(24, 24),
            anchor: new BMap.Size(12, 12)
        }),
        water: new BMap.Icon('./images/markers/water.png', new BMap.Size(24, 24), {
            imageSize: new BMap.Size(24, 24),
            anchor: new BMap.Size(12, 12)
        }),
        firetruck: new BMap.Icon('./images/markers/firetruck.png', new BMap.Size(24, 24), {
            imageSize: new BMap.Size(24, 24),
            anchor: new BMap.Size(12, 12)
        }),
        firepoint: new BMap.Icon('./images/markers/firepoint.png', new BMap.Size(24, 24), {
            imageSize: new BMap.Size(24, 24),
            anchor: new BMap.Size(12, 12)
        })
    },

    setActiveTool(tool) {
        if (this.currentDrawing) {
            this.cancelDrawing();
        }
        this.activeTool = this.activeTool === tool ? null : tool;
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === this.activeTool);
        });
    },

    handleMapClick(e) {
        if (!this.activeTool) return;
        
        const point = e.point;
        
        switch(this.activeTool) {
            case 'point':
            case 'hydrant':
            case 'water':
            case 'firetruck':
            case 'firepoint':
                this.createMarker(e.point);
                break;
            case 'polyline':
                this.handlePolylineClick(e.point);
                break;
            case 'circle':
                this.handleCircleClick(e.point);
                break;
            case 'rectangle':
                this.handleRectangleClick(e.point);
                break;
            case 'image':
                ImageMarker.createImageMarker(point);
                break;
        }
    },

    createMarker(point) {
        const marker = new BMap.Marker(point, {
            icon: this.style[this.activeTool],
            enableDragging: true  // 启用标记拖拽
        });
        
        marker.featureData = {
            type: this.activeTool,
            name: `${FeatureManager.getFeatureName(this.activeTool)} ${FeatureManager.getFeatureCount(this.activeTool) + 1}`,
            coordinates: point,
            properties: FeatureManager.getDefaultProperties(this.activeTool),
            createTime: new Date().toISOString()
        };

        // 添加拖拽结束事件，更新坐标信息
        marker.addEventListener('dragend', e => {
            marker.featureData.coordinates = e.point;
            // 如果属性面板打开且当前选中的是这个要素，则更新坐标显示
            if (FeatureManager.selectedFeature === marker) {
                document.getElementById('attr-coordinates').textContent = 
                    `${e.point.lng.toFixed(6)}, ${e.point.lat.toFixed(6)}`;
            }
        });

        marker.addEventListener('click', () => FeatureManager.selectFeature(marker));
        MapCore.addOverlay(marker);
        FeatureManager.addFeature(this.activeTool, marker);
        FeatureManager.selectFeature(marker);
    },

    // 修改 handlePolylineClick 方法，移除 enableEditing 属性
    handlePolylineClick(point) {
        if (!this.currentDrawing) {
            this.currentDrawing = new BMap.Polyline([point], {
                strokeColor: "#1890ff",
                strokeWeight: 2,
                strokeOpacity: 1
                // 移除 enableEditing: true
            });
            this.currentDrawing.featureData = {
                type: 'polyline',
                name: '未命名路线',
                coordinates: [point],
                style: {
                    strokeColor: "#1890ff",
                    strokeWeight: 2,
                    strokeOpacity: 1
                },
                createTime: new Date().toISOString()
            };
            MapCore.addOverlay(this.currentDrawing);
        } else {
            const path = this.currentDrawing.getPath();
            path.push(point);
            this.currentDrawing.setPath(path);
            this.currentDrawing.featureData.coordinates = path;
        }
    },

    // 修改 handleCircleClick 方法，移除 enableEditing 属性
    handleCircleClick(center) {
        if (!this.currentDrawing) {
            this.currentDrawing = new BMap.Circle(center, 100, {
                strokeColor: "#FFA500",
                fillColor: "#FFA50030",
                strokeWeight: 2,
                strokeOpacity: 1
                // 移除 enableEditing: true
            });
            this.currentDrawing.featureData = {
                type: 'circle',
                name: '未命名圆形',
                center: center,
                radius: 100,
                style: {
                    strokeColor: "#FFA500",
                    fillColor: "#FFA50030",
                    strokeWeight: 2,
                    strokeOpacity: 1
                },
                createTime: new Date().toISOString()
            };
            MapCore.addOverlay(this.currentDrawing);
        }
    },

    // 修改 handleRectangleClick 方法，移除 enableEditing 属性
    handleRectangleClick(start) {
        if (!this.currentDrawing) {
            this.currentDrawing = new BMap.Polygon([
                start,
                start,
                start,
                start
            ], {
                strokeColor: "#800080",
                fillColor: "#80008030",
                strokeWeight: 2,
                strokeOpacity: 1
                // 移除 enableEditing: true
            });
            this.currentDrawing.featureData = {
                type: 'rectangle',
                name: '未命名矩形',
                coordinates: [start, start, start, start],
                style: {
                    strokeColor: "#800080",
                    fillColor: "#80008030",
                    strokeWeight: 2,
                    strokeOpacity: 1
                },
                createTime: new Date().toISOString()
            };
            MapCore.addOverlay(this.currentDrawing);
        }
    },

    handleMouseMove(e) {
        if (!this.currentDrawing) return;

        if (this.activeTool === 'rectangle') {
            const start = this.currentDrawing.getPath()[0];
            const current = e.point;
            
            const path = [
                start,
                new BMap.Point(current.lng, start.lat),
                current,
                new BMap.Point(start.lng, current.lat)
            ];
            this.currentDrawing.setPath(path);
            this.currentDrawing.featureData.coordinates = path;
        }
        
        if (this.activeTool === 'circle') {
            const radius = MapCore.map.getDistance(
                this.currentDrawing.getCenter(),
                e.point
            );
            this.currentDrawing.setRadius(radius);
            this.currentDrawing.featureData.radius = radius;
        }
    },

    // 修改 finishDrawing 方法，确保正确处理不同类型的绘制
    finishDrawing(resetTool = true) {
        if (!this.currentDrawing) return;
        
        console.log('完成绘制', this.activeTool, this.currentDrawing);
        
        // 保存当前绘制的引用，以防后续需要
        const finishedFeature = this.currentDrawing;
        
        // 确保要素有点击事件 - 修复this指向问题
        finishedFeature.addEventListener('click', function(e) {
            console.log('要素被点击', finishedFeature);
            // 阻止事件冒泡，避免触发地图点击事件
            e.domEvent && e.domEvent.stopPropagation();
            FeatureManager.selectFeature(finishedFeature);
        });
        
        // 确保要素被正确添加到FeatureManager
        FeatureManager.addFeature(this.activeTool, finishedFeature);
        
        // 清除当前绘制状态
        this.currentDrawing = null;
        
        // 根据参数决定是否重置活动工具
        if (resetTool) {
            // 直接设置为null，避免递归调用setActiveTool
            this.activeTool = null;
            document.querySelectorAll('.tool-btn').forEach(btn => {
                btn.classList.toggle('active', false);
            });
        }
        
        // 确保完成的要素被选中
        FeatureManager.selectFeature(finishedFeature);
        
        return finishedFeature;
    },
    
    // 添加取消绘制方法，用于ESC键取消当前绘制
    cancelDrawing() {
        if (this.currentDrawing) {
            MapCore.removeOverlay(this.currentDrawing);
            this.currentDrawing = null;
            // 重置活动工具
            this.setActiveTool(null);
        }
    }
};

// 添加键盘事件监听，支持ESC键取消绘制
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        DrawTool.cancelDrawing();
    } else if (e.key === 'Enter' && DrawTool.currentDrawing) {
        DrawTool.finishDrawing();
    }
});

// 确保DrawTool对象存在
if (!window.DrawTool) {
    window.DrawTool = {};
}

// 添加必要的方法
DrawTool.createPoint = function(point, name) {
    console.log(`创建点位: ${name}, 坐标: ${point.lng},${point.lat}`);
    
    const marker = new BMap.Marker(point);
    marker.featureData = {
        type: 'point',
        name: name || `点位 ${FeatureManager.getNextId('point')}`,
        coordinates: {
            lng: point.lng,
            lat: point.lat
        },
        properties: {},
        createTime: new Date().toISOString()
    };
    
    MapCore.map.addOverlay(marker);
    FeatureManager.addFeature('point', marker);
    return marker;
};

DrawTool.createHydrant = function(point, name, pressure) {
    console.log(`创建消防栓: ${name}, 坐标: ${point.lng},${point.lat}, 水压: ${pressure}`);
    
    const icon = new BMap.Icon('images/markers/hydrant.png', new BMap.Size(32, 32), {
        imageSize: new BMap.Size(32, 32),
        anchor: new BMap.Size(16, 16)
    });
    
    const marker = new BMap.Marker(point, { icon });
    marker.featureData = {
        type: 'hydrant',
        name: name || `消防栓 ${FeatureManager.getNextId('hydrant')}`,
        coordinates: {
            lng: point.lng,
            lat: point.lat
        },
        properties: {
            pressure: pressure || '正常'
        },
        createTime: new Date().toISOString()
    };
    
    MapCore.map.addOverlay(marker);
    FeatureManager.addFeature('hydrant', marker);
    return marker;
};

// 修复水源点方法定义
DrawTool.createWaterSource = function(point, name, capacity) {
    console.log(`创建水源点: ${name}, 坐标: ${point.lng},${point.lat}, 容量: ${capacity}`);
    
    const icon = new BMap.Icon('images/markers/water.png', new BMap.Size(32, 32), {
        imageSize: new BMap.Size(32, 32),
        anchor: new BMap.Size(16, 16)
    });
    
    const marker = new BMap.Marker(point, { icon });
    marker.featureData = {
        type: 'water',
        name: name || `水源点 ${FeatureManager.getNextId('water')}`,
        coordinates: {
            lng: point.lng,
            lat: point.lat
        },
        properties: {
            capacity: capacity || ''
        },
        createTime: new Date().toISOString()
    };
    
    MapCore.map.addOverlay(marker);
    FeatureManager.addFeature('water', marker);
    return marker;
};

// 修复消防车方法定义
DrawTool.createFireTruck = function(point, name, status, capacity) {
    console.log(`创建消防车: ${name}, 坐标: ${point.lng},${point.lat}, 状态: ${status}, 载水量: ${capacity}`);
    
    const icon = new BMap.Icon('images/markers/firetruck.png', new BMap.Size(32, 32), {
        imageSize: new BMap.Size(32, 32),
        anchor: new BMap.Size(16, 16)
    });
    
    const marker = new BMap.Marker(point, { icon });
    marker.featureData = {
        type: 'firetruck',
        name: name || `消防车 ${FeatureManager.getNextId('firetruck')}`,
        coordinates: {
            lng: point.lng,
            lat: point.lat
        },
        properties: {
            status: status || '待命',
            capacity: capacity || ''
        },
        createTime: new Date().toISOString()
    };
    
    MapCore.map.addOverlay(marker);
    FeatureManager.addFeature('firetruck', marker);
    return marker;
};

// 修复着火点方法定义
DrawTool.createFirePoint = function(point, name, level) {
    console.log(`创建着火点: ${name}, 坐标: ${point.lng},${point.lat}, 火势等级: ${level}`);
    
    const icon = new BMap.Icon('images/markers/fire.png', new BMap.Size(32, 32), {
        imageSize: new BMap.Size(32, 32),
        anchor: new BMap.Size(16, 16)
    });
    
    const marker = new BMap.Marker(point, { icon });
    marker.featureData = {
        type: 'firepoint',
        name: name || `着火点 ${FeatureManager.getNextId('firepoint')}`,
        coordinates: {
            lng: point.lng,
            lat: point.lat
        },
        properties: {
            level: level || '一级',
            fireTime: new Date().toISOString()
        },
        createTime: new Date().toISOString()
    };
    
    MapCore.map.addOverlay(marker);
    FeatureManager.addFeature('firepoint', marker);
    return marker;
}