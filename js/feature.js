const FeatureManager = {
    features: {
        point: [],
        hydrant: [],
        water: [],
        firetruck: [],
        firepoint: [],
        polyline: [],
        circle: [],
        rectangle: [],
        image: []
    },
    selectedFeature: null,

    featureNames: {
        point: '通用点',
        hydrant: '消防栓',
        water: '水源点',
        firetruck: '消防车',
        firepoint: '着火点',
        polyline: '路线',
        circle: '圆形区域',
        rectangle: '矩形区域',
        image: '图片标注'
    },

    getFeatureName(type) {
        return this.featureNames[type] || '未知类型';
    },
    
    // 添加缺失的方法 - 这是导致错误的主要原因
    getFeatureTypeName(type) {
        return this.getFeatureName(type);
    },

    getFeatureCount(type) {
        return this.features[type].length;
    },

    getDefaultProperties(type) {
        switch(type) {
            case 'hydrant':
                return { pressure: '正常' };
            case 'water':
                return { capacity: '1000m³' };
            case 'firetruck':
                return { 
                    status: '待命',
                    capacity: '10吨'
                };
            case 'firepoint':
                return { 
                    level: '一级',
                    fireTime: new Date().toISOString()
                };
            default:
                return {};
        }
    },

    addFeature(type, feature) {
        if (this.features[type]) {
            // 确保每个要素有独立的属性对象
            if (feature.featureData && !feature.featureData.properties) {
                feature.featureData.properties = JSON.parse(JSON.stringify(this.getDefaultProperties(type)));
            }
            
            this.features[type].push(feature);
            this.updateFeatureTable();
        }
    },

    removeFeature(feature) {
        const type = feature.featureData.type;
        const index = this.features[type].indexOf(feature);
        if (index > -1) {
            this.features[type].splice(index, 1);
            MapCore.removeOverlay(feature);
            if (feature.label) {
                MapCore.removeOverlay(feature.label);
            }
            this.updateFeatureTable();
        }
    },

    selectFeature(feature) {
        console.log('选择要素:', feature);
        
        this.selectedFeature = feature;
        const panel = document.getElementById('attrPanel');
        
        if (!feature) {
            panel.classList.remove('active');
            return;
        }
        
        // 显示属性面板
        panel.classList.add('active');
        
        // 确保 featureData 存在
        if (!feature.featureData) {
            console.error('要素数据不存在:', feature);
            return;
        }
        
        console.log('要素类型:', feature.featureData.type);
        console.log('要素数据:', feature.featureData);
        
        // 填充基本属性
        document.getElementById('attr-type').textContent = this.getFeatureName(feature.featureData.type);
        document.getElementById('attr-name').value = feature.featureData.name || '';
        
        // 添加坐标显示
        const coordsElem = document.getElementById('attr-coordinates');
        if (coordsElem) {
            if (feature.featureData.type === 'circle') {
                const center = feature.getCenter();
                coordsElem.textContent = `${center.lng.toFixed(6)}, ${center.lat.toFixed(6)}`;
            } else if (feature instanceof BMap.Marker) {
                const pos = feature.getPosition();
                coordsElem.textContent = `${pos.lng.toFixed(6)}, ${pos.lat.toFixed(6)}`;
            } else if (feature instanceof BMap.Polyline || feature instanceof BMap.Polygon) {
                coordsElem.textContent = '多点坐标';
            }
        }
        
        // 确保 properties 存在
        if (!feature.featureData.properties) {
            feature.featureData.properties = this.getDefaultProperties(feature.featureData.type);
        }
        
        const data = this.selectedFeature.featureData;

        // 隐藏所有特殊属性面板
        document.querySelectorAll('[id$="-props"]').forEach(el => {
            el.style.display = 'none';
        });

        // 显示对应类型的特殊属性面板
        switch(data.type) {
            case 'hydrant':
                document.getElementById('hydrant-props').style.display = 'block';
                document.getElementById('attr-pressure').value = data.properties.pressure || '正常';
                break;
            case 'water':
                document.getElementById('water-props').style.display = 'block';
                document.getElementById('attr-capacity').value = data.properties.capacity || '1000m³';
                break;
            case 'firetruck':
                document.getElementById('firetruck-props').style.display = 'block';
                document.getElementById('attr-status').value = data.properties.status || '待命';
                document.getElementById('attr-truck-capacity').value = data.properties.capacity || '10吨';
                break;
            case 'firepoint':
                document.getElementById('firepoint-props').style.display = 'block';
                document.getElementById('attr-fire-level').value = data.properties.level || '一级';
                document.getElementById('attr-fire-time').textContent = 
                    data.properties.fireTime ? new Date(data.properties.fireTime).toLocaleString() : new Date().toLocaleString();
                break;
        }

        // 显示样式控制面板
        if (data.style) {
            document.getElementById('style-controls').style.display = 'block';
            document.getElementById('attr-color').value = data.style.strokeColor || '#1E90FF';
            document.getElementById('attr-fill-color').value = data.style.fillColor || '#ffffff';
            document.getElementById('attr-weight').value = data.style.strokeWeight || 2;
            document.getElementById('attr-opacity').value = data.style.strokeOpacity || 1.0;
        } else {
            document.getElementById('style-controls').style.display = 'none';
        }

        panel.classList.add('active');
    },

    showAttributePanel() {
        if (!this.selectedFeature) return;

        const panel = document.getElementById('attrPanel');
        const data = this.selectedFeature.featureData;

        document.getElementById('attr-type').textContent = this.getFeatureName(data.type);
        document.getElementById('attr-name').value = data.name;

        // 隐藏所有特殊属性面板
        document.querySelectorAll('[id$="-props"]').forEach(el => {
            el.style.display = 'none';
        });

        // 显示对应类型的特殊属性面板
        switch(data.type) {
            case 'hydrant':
                document.getElementById('hydrant-props').style.display = 'block';
                document.getElementById('attr-pressure').value = data.properties.pressure;
                break;
            case 'water':
                document.getElementById('water-props').style.display = 'block';
                document.getElementById('attr-capacity').value = data.properties.capacity;
                break;
            case 'firetruck':
                document.getElementById('firetruck-props').style.display = 'block';
                document.getElementById('attr-status').value = data.properties.status;
                document.getElementById('attr-truck-capacity').value = data.properties.capacity;
                break;
            case 'firepoint':
                document.getElementById('firepoint-props').style.display = 'block';
                document.getElementById('attr-fire-level').value = data.properties.level;
                document.getElementById('attr-fire-time').textContent = 
                    new Date(data.properties.fireTime).toLocaleString();
                break;
        }

        // 显示样式控制面板
        if (data.style) {
            document.getElementById('style-controls').style.display = 'block';
            document.getElementById('attr-color').value = data.style.strokeColor;
            document.getElementById('attr-fill-color').value = data.style.fillColor || '#ffffff';
            document.getElementById('attr-weight').value = data.style.strokeWeight;
            document.getElementById('attr-opacity').value = data.style.strokeOpacity;
        } else {
            document.getElementById('style-controls').style.display = 'none';
        }

        panel.classList.add('active');
    },

    saveAttributes() {
        if (!this.selectedFeature) return;

        const data = this.selectedFeature.featureData;
        data.name = document.getElementById('attr-name').value;

        // 确保 properties 对象存在
        if (!data.properties) {
            data.properties = this.getDefaultProperties(data.type);
        }

        switch(data.type) {
            case 'hydrant':
                data.properties.pressure = document.getElementById('attr-pressure').value;
                break;
            case 'water':
                data.properties.capacity = document.getElementById('attr-capacity').value;
                break;
            case 'firetruck':
                data.properties.status = document.getElementById('attr-status').value;
                data.properties.capacity = document.getElementById('attr-truck-capacity').value;
                break;
            case 'firepoint':
                data.properties.level = document.getElementById('attr-fire-level').value;
                break;
        }

        // 确保 style 对象存在
        if (!data.style) {
            data.style = {
                strokeColor: '#1E90FF',
                fillColor: '#ffffff',
                strokeWeight: 2,
                strokeOpacity: 1.0
            };
        }

        data.style.strokeColor = document.getElementById('attr-color').value;
        data.style.fillColor = document.getElementById('attr-fill-color').value;
        data.style.strokeWeight = parseInt(document.getElementById('attr-weight').value);
        data.style.strokeOpacity = parseFloat(document.getElementById('attr-opacity').value);

        // 应用样式到要素
        if (this.selectedFeature instanceof BMap.Polyline) {
            this.selectedFeature.setStrokeColor(data.style.strokeColor);
            this.selectedFeature.setStrokeWeight(data.style.strokeWeight);
            this.selectedFeature.setStrokeOpacity(data.style.strokeOpacity);
        } else if (this.selectedFeature instanceof BMap.Polygon) {
            this.selectedFeature.setStrokeColor(data.style.strokeColor);
            this.selectedFeature.setFillColor(data.style.fillColor);
            this.selectedFeature.setStrokeWeight(data.style.strokeWeight);
            this.selectedFeature.setStrokeOpacity(data.style.strokeOpacity);
        } else if (this.selectedFeature instanceof BMap.Circle) {
            this.selectedFeature.setStrokeColor(data.style.strokeColor);
            this.selectedFeature.setFillColor(data.style.fillColor);
            this.selectedFeature.setStrokeWeight(data.style.strokeWeight);
            this.selectedFeature.setStrokeOpacity(data.style.strokeOpacity);
        }

        this.updateFeatureTable();
    },

    updateFeatureTable() {
        const tbody = document.getElementById('featureTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        Object.entries(this.features).forEach(([type, features]) => {
            features.forEach(feature => {
                const data = feature.featureData;
                const tr = document.createElement('tr');
                
                tr.innerHTML = `
                    <td>${this.getFeatureName(type)}</td>
                    <td>${data.name}</td>
                    <td>${this.getFeatureStatus(data)}</td>
                    <td>${new Date(data.createTime).toLocaleString()}</td>
                `;

                tr.addEventListener('click', () => this.selectFeature(feature));
                
                if (feature === this.selectedFeature) {
                    tr.classList.add('selected');
                }
                
                tbody.appendChild(tr);
            });
        });
    },

    getFeatureStatus(data) {
        if (data.type === 'firetruck') {
            return data.properties.status;
        } else if (data.type === 'firepoint') {
            return `${data.properties.level}火情`;
        }
        return '-';
    },

    clearFeatures() {
        Object.keys(this.features).forEach(type => {
            this.features[type] = [];
        });
        this.selectedFeature = null;
        this.updateFeatureTable();
        document.getElementById('attrPanel').classList.remove('active');
    },
    
    // 添加正确的getNextId方法
    getNextId(type) {
        if (!this.features[type]) {
            this.features[type] = [];
        }
        return this.features[type].length + 1;
    }
};

// 确保DrawTool对象存在
if (!window.DrawTool) {
    window.DrawTool = {
        // 创建通用点
        createPoint(point, name) {
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
        },
        
        // 创建消防栓
        createHydrant(point, name, pressure) {
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
        },
        
        // 创建水源点
        createWaterSource(point, name, capacity) {
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
        },
        
        // 创建消防车
        createFireTruck(point, name, status, capacity) {
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
        },
        
        // 创建着火点
        createFirePoint(point, name, level) {
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
    };
}