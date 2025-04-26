// 样式管理模块
const StyleManager = {
    // 默认样式
    defaultStyles: {
        point: {
            strokeColor: '#1E90FF',
            fillColor: '#ffffff',
            strokeWeight: 2,
            strokeOpacity: 1.0
        },
        polyline: {
            strokeColor: '#1E90FF',
            strokeWeight: 3,
            strokeOpacity: 0.8
        },
        polygon: {
            strokeColor: '#1E90FF',
            fillColor: '#B0E0E6',
            strokeWeight: 2,
            strokeOpacity: 0.8,
            fillOpacity: 0.5
        },
        circle: {
            strokeColor: '#1E90FF',
            fillColor: '#B0E0E6',
            strokeWeight: 2,
            strokeOpacity: 0.8,
            fillOpacity: 0.5
        },
        rectangle: {
            strokeColor: '#1E90FF',
            fillColor: '#B0E0E6',
            strokeWeight: 2,
            strokeOpacity: 0.8,
            fillOpacity: 0.5
        }
    },
    
    // 获取指定类型的默认样式
    getDefaultStyle(type) {
        return this.defaultStyles[type] || this.defaultStyles.point;
    },
    
    // 应用样式到要素
    applyStyle(feature, style) {
        if (!feature || !style) return;
        
        try {
            if (feature instanceof BMap.Polyline) {
                feature.setStrokeColor(style.strokeColor);
                feature.setStrokeWeight(style.strokeWeight);
                feature.setStrokeOpacity(style.strokeOpacity);
            } else if (feature instanceof BMap.Polygon || feature instanceof BMap.Circle) {
                feature.setStrokeColor(style.strokeColor);
                feature.setFillColor(style.fillColor);
                feature.setStrokeWeight(style.strokeWeight);
                feature.setStrokeOpacity(style.strokeOpacity);
                if (typeof style.fillOpacity !== 'undefined') {
                    feature.setFillOpacity(style.fillOpacity);
                }
            } else if (feature instanceof BMap.Marker) {
                // 对于标记点，可能需要特殊处理
                if (feature.setIcon && style.icon) {
                    feature.setIcon(style.icon);
                }
            }
            
            // 保存样式到要素数据中
            if (feature.featureData) {
                feature.featureData.style = Object.assign({}, style);
            }
        } catch (error) {
            console.error('应用样式出错:', error);
        }
    },
    
    // 根据要素类型创建样式
    createStyleForFeature(featureType) {
        const baseStyle = this.getDefaultStyle(featureType);
        
        // 为特定类型的要素添加特殊样式
        switch(featureType) {
            case 'hydrant':
                return Object.assign({}, baseStyle, {
                    strokeColor: '#FF0000',
                    fillColor: '#FFD700'
                });
            case 'water':
                return Object.assign({}, baseStyle, {
                    strokeColor: '#0000FF',
                    fillColor: '#87CEFA'
                });
            case 'firetruck':
                return Object.assign({}, baseStyle, {
                    strokeColor: '#FF4500',
                    fillColor: '#FF6347'
                });
            case 'firepoint':
                return Object.assign({}, baseStyle, {
                    strokeColor: '#8B0000',
                    fillColor: '#FF4500'
                });
            default:
                return Object.assign({}, baseStyle);
        }
    },
    
    // 从DOM元素中获取样式设置
    getStyleFromForm() {
        return {
            strokeColor: document.getElementById('attr-color').value,
            fillColor: document.getElementById('attr-fill-color').value,
            strokeWeight: parseInt(document.getElementById('attr-weight').value),
            strokeOpacity: parseFloat(document.getElementById('attr-opacity').value)
        };
    },
    
    // 将样式应用到表单
    applyStyleToForm(style) {
        if (!style) return;
        
        document.getElementById('attr-color').value = style.strokeColor || '#1E90FF';
        document.getElementById('attr-fill-color').value = style.fillColor || '#ffffff';
        document.getElementById('attr-weight').value = style.strokeWeight || 2;
        document.getElementById('attr-opacity').value = style.strokeOpacity || 1.0;
    }
};