// 添加百度地图常量定义
if (typeof BMAP_DRIVING_POLICY_LEAST_DISTANCE === 'undefined') {
    var BMAP_DRIVING_POLICY_LEAST_DISTANCE = 0;
}
if (typeof BMAP_DRIVING_POLICY_LEAST_TIME === 'undefined') {
    var BMAP_DRIVING_POLICY_LEAST_TIME = 1;
}
if (typeof BMAP_STATUS_SUCCESS === 'undefined') {
    var BMAP_STATUS_SUCCESS = 0;
}

// 确保 RouteManager 对象中的方法正确实现
const RouteManager = {
    currentRoute: null,
    routePoints: [],
    routeLabels: [],

    calculateRoute() {
        const startId = document.getElementById('route-start-id').value;
        const endId = document.getElementById('route-end-id').value;

        if (!startId || !endId) {
            alert('请输入有效的起点和终点ID');
            return;
        }

        // 查找起点和终点要素
        const startFeature = QueryManager.findFeatureById(startId);
        const endFeature = QueryManager.findFeatureById(endId);

        if (!startFeature || !endFeature) {
            alert('未找到指定ID的要素');
            return;
        }

        const startPoint = startFeature.getPosition();
        const endPoint = endFeature.getPosition();

        this.planRoute(startPoint, endPoint);
    },
    calculateRouteFromUI() {
        console.log('开始从UI计算路线');
        const startSelect = document.getElementById('route-start');
        const endSelect = document.getElementById('route-end');
        // 移除策略选择，始终使用最短距离
        // const policy = document.getElementById('route-policy').value || 'distance';
        
        if (!startSelect || !endSelect) {
            console.error('找不到路线选择下拉框');
            alert('系统错误：找不到路线选择下拉框');
            return;
        }
        
        if (!startSelect.value || !endSelect.value) {
            alert('请选择起点(消防车)和终点(着火点)');
            return;
        }
        
        console.log('选择的起点和终点:', startSelect.value, endSelect.value);
        
        // 检查 FeatureManager 是否存在
        if (!FeatureManager || !FeatureManager.features) {
            console.error('FeatureManager 不存在或未初始化');
            alert('系统错误：FeatureManager 未初始化');
            return;
        }
        
        // 查找消防车和着火点
        const firetrucks = FeatureManager.features.firetruck || [];
        const firepoints = FeatureManager.features.firepoint || [];
        
        console.log('消防车数量:', firetrucks.length);
        console.log('着火点数量:', firepoints.length);
        
        // 根据名称查找消防车
        let startFeature = null;
        for (let i = 0; i < firetrucks.length; i++) {
            const truck = firetrucks[i];
            console.log('检查消防车:', truck);
            if (truck.featureData && truck.featureData.name === startSelect.value) {
                startFeature = truck;
                break;
            }
        }
        
        // 根据名称查找着火点
        let endFeature = null;
        for (let i = 0; i < firepoints.length; i++) {
            const point = firepoints[i];
            console.log('检查着火点:', point);
            if (point.featureData && point.featureData.name === endSelect.value) {
                endFeature = point;
                break;
            }
        }
        
        if (!startFeature) {
            alert('未找到选择的消防车: ' + startSelect.value);
            return;
        }
        
        if (!endFeature) {
            alert('未找到选择的着火点: ' + endSelect.value);
            return;
        }
        
        console.log('找到消防车:', startFeature);
        console.log('找到着火点:', endFeature);
        
        // 获取位置 - 尝试多种方法获取坐标
        let startPoint = null;
        let endPoint = null;
        
        // 尝试不同的方法获取坐标
        if (startFeature.getPosition) {
            startPoint = startFeature.getPosition();
            console.log('通过 getPosition 获取消防车坐标:', startPoint);
        } else if (startFeature.getCenter) {
            startPoint = startFeature.getCenter();
            console.log('通过 getCenter 获取消防车坐标:', startPoint);
        } else if (startFeature.marker && startFeature.marker.getPosition) {
            startPoint = startFeature.marker.getPosition();
            console.log('通过 marker.getPosition 获取消防车坐标:', startPoint);
        } else if (startFeature.overlay && startFeature.overlay.getPosition) {
            startPoint = startFeature.overlay.getPosition();
            console.log('通过 overlay.getPosition 获取消防车坐标:', startPoint);
        } else if (startFeature.featureData && startFeature.featureData.geometry) {
            // 尝试从 GeoJSON 格式获取坐标
            const coords = startFeature.featureData.geometry.coordinates;
            if (coords && coords.length >= 2) {
                startPoint = new BMap.Point(coords[0], coords[1]);
                console.log('通过 geometry.coordinates 获取消防车坐标:', startPoint);
            }
        }
        
        // 同样尝试多种方法获取终点坐标
        if (endFeature.getPosition) {
            endPoint = endFeature.getPosition();
            console.log('通过 getPosition 获取着火点坐标:', endPoint);
        } else if (endFeature.getCenter) {
            endPoint = endFeature.getCenter();
            console.log('通过 getCenter 获取着火点坐标:', endPoint);
        } else if (endFeature.marker && endFeature.marker.getPosition) {
            endPoint = endFeature.marker.getPosition();
            console.log('通过 marker.getPosition 获取着火点坐标:', endPoint);
        } else if (endFeature.overlay && endFeature.overlay.getPosition) {
            endPoint = endFeature.overlay.getPosition();
            console.log('通过 overlay.getPosition 获取着火点坐标:', endPoint);
        } else if (endFeature.featureData && endFeature.featureData.geometry) {
            // 尝试从 GeoJSON 格式获取坐标
            const coords = endFeature.featureData.geometry.coordinates;
            if (coords && coords.length >= 2) {
                endPoint = new BMap.Point(coords[0], coords[1]);
                console.log('通过 geometry.coordinates 获取着火点坐标:', endPoint);
            }
        }
        
        if (!startPoint) {
            console.error('无法获取消防车位置:', startFeature);
            alert('无法获取消防车位置，请检查要素数据');
            return;
        }
        
        if (!endPoint) {
            console.error('无法获取着火点位置:', endFeature);
            alert('无法获取着火点位置，请检查要素数据');
            return;
        }
        
        console.log('起点坐标:', startPoint);
        console.log('终点坐标:', endPoint);
        
        // 清除现有路线
        this.clearRoute();
        
        // 使用百度地图驾车路线规划 - 始终使用最短距离策略
        const drivingPolicy = 0; // 0 = 最短距离
            
        this.planRoute(startPoint, endPoint, drivingPolicy, startFeature.featureData.name, endFeature.featureData.name);
    },
    
    planRoute(startPoint, endPoint, policy = 0, startName = '起点', endName = '终点') {
        console.log('规划路线:', startPoint, endPoint);
        
        // 检查坐标是否有效
        if (!startPoint || typeof startPoint.lng !== 'number' || typeof startPoint.lat !== 'number') {
            console.error('起点坐标无效:', startPoint);
            alert('起点坐标无效，请检查要素数据');
            return;
        }
        
        if (!endPoint || typeof endPoint.lng !== 'number' || typeof endPoint.lat !== 'number') {
            console.error('终点坐标无效:', endPoint);
            alert('终点坐标无效，请检查要素数据');
            return;
        }
        
        // 确保坐标是百度地图的 Point 对象
        const start = new BMap.Point(startPoint.lng, startPoint.lat);
        const end = new BMap.Point(endPoint.lng, endPoint.lat);
        
        console.log('转换后的起点坐标:', start);
        console.log('转换后的终点坐标:', end);
        
        // 清除现有路线
        this.clearRoute();
        
        // 检查 MapCore 是否存在
        if (!MapCore || !MapCore.map) {
            console.error('MapCore 不存在或未初始化');
            alert('系统错误：地图未初始化');
            return;
        }
        
        // 使用百度地图驾车路线规划
        try {
            // 确保始终使用最短距离策略
            policy = 0;
            
            // 确保策略值在有效范围内
            if (policy !== 0 && policy !== 1) {
                console.warn('无效的策略值，使用默认策略(最短距离)');
                policy = 0;
            }
            
            // 保存参数以便重试
            const routeParams = {
                start: start,
                end: end,
                startName: startName,
                endName: endName
            };
            
            const driving = new BMap.DrivingRoute(MapCore.map, {
                renderOptions: {
                    map: MapCore.map,
                    autoViewport: true
                },
                policy: policy,
                onSearchComplete: (results) => {
                    console.log('路线搜索完成:', results);
                    if (driving.getStatus() === BMAP_STATUS_SUCCESS) {
                        if (results.getNumPlans() > 0) {
                            const plan = results.getPlan(0);
                            this.routePoints = [];
                            
                            plan.getRoute(0).getPath().forEach(point => {
                                this.routePoints.push(point);
                            });
    
                            this.drawRoute();
                            this.calculateRouteInfo(plan, startName, endName);
                        } else {
                            console.error('没有找到路线方案');
                            alert('没有找到路线方案，请检查起点和终点位置');
                        }
                    } else {
                        console.error('路线规划失败，状态码:', driving.getStatus());
                        alert('路线规划失败，请检查起点和终点是否正确');
                    }
                }
            });
    
            console.log('开始搜索路线 (最短距离)');
            driving.search(start, end);
        } catch (error) {
            console.error('路线搜索出错:', error);
            alert('路线规划出错: ' + error.message);
        }
    },  // 这里修改为逗号

    drawRoute() {
        try {
            if (this.currentRoute) {
                if (MapCore.removeOverlay) {
                    MapCore.removeOverlay(this.currentRoute);
                } else if (MapCore.map && MapCore.map.removeOverlay) {
                    MapCore.map.removeOverlay(this.currentRoute);
                } else {
                    console.error('无法移除覆盖物，removeOverlay 方法不存在');
                }
            }
    
            this.currentRoute = new BMap.Polyline(this.routePoints, {
                strokeColor: "#ff0000",
                strokeWeight: 4,
                strokeOpacity: 0.8
            });
    
            if (MapCore.addOverlay) {
                MapCore.addOverlay(this.currentRoute);
            } else if (MapCore.map && MapCore.map.addOverlay) {
                MapCore.map.addOverlay(this.currentRoute);
            } else {
                console.error('无法添加覆盖物，addOverlay 方法不存在');
            }
        } catch (error) {
            console.error('绘制路线出错:', error);
        }
    },
    
    calculateRouteInfo(plan, startName = '起点', endName = '终点') {
        try {
            const distance = plan.getDistance(true);
            const duration = plan.getDuration(true);
            
            // 清除之前的标签
            this.clearRouteLabels();
            
            // 在地图上添加路线信息标签
            const label = new BMap.Label(
                `从 ${startName} 到 ${endName}\n距离：${distance}\n预计时间：${duration}`,
                {
                    position: this.routePoints[0],
                    offset: new BMap.Size(20, -20)
                }
            );
            
            label.setStyle({
                padding: '5px',
                borderRadius: '3px',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                fontSize: '12px',
                lineHeight: '20px'
            });
    
            if (MapCore.addOverlay) {
                MapCore.addOverlay(label);
            } else if (MapCore.map && MapCore.map.addOverlay) {
                MapCore.map.addOverlay(label);
            }
            
            this.routeLabels.push(label);
        } catch (error) {
            console.error('计算路线信息出错:', error);
        }
    },

    clearRoute() {
        try {
            if (this.currentRoute) {
                if (MapCore.removeOverlay) {
                    MapCore.removeOverlay(this.currentRoute);
                } else if (MapCore.map && MapCore.map.removeOverlay) {
                    MapCore.map.removeOverlay(this.currentRoute);
                }
                this.currentRoute = null;
            }
            
            this.clearRouteLabels();
        } catch (error) {
            console.error('清除路线出错:', error);
        }
    },
    
    clearRouteLabels() {
        try {
            // 清除路线相关的标签
            if (this.routeLabels && this.routeLabels.length > 0) {
                this.routeLabels.forEach(label => {
                    if (MapCore.removeOverlay) {
                        MapCore.removeOverlay(label);
                    } else if (MapCore.map && MapCore.map.removeOverlay) {
                        MapCore.map.removeOverlay(label);
                    }
                });
                this.routeLabels = [];
            }
        } catch (error) {
            console.error('清除路线标签出错:', error);
        }
    },

    optimizeRoute(points) {
        // 路线优化算法
        const optimizedPoints = [];
        const visited = new Set();
        let currentPoint = points[0];
        
        optimizedPoints.push(currentPoint);
        visited.add(currentPoint);

        while (optimizedPoints.length < points.length) {
            let nearestPoint = null;
            let minDistance = Infinity;

            points.forEach(point => {
                if (!visited.has(point)) {
                    const distance = MapCore.map.getDistance(currentPoint, point);
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestPoint = point;
                    }
                }
            });

            if (nearestPoint) {
                optimizedPoints.push(nearestPoint);
                visited.add(nearestPoint);
                currentPoint = nearestPoint;
            }
        }

        return optimizedPoints;
    }
};

// 绑定路线规划相关事件
document.addEventListener('DOMContentLoaded', () => {
    // 确保全局函数可用
    window.calculateRoute = function() {
        RouteManager.calculateRoute();
    };
    
    window.clearRoute = function() {
        RouteManager.clearRoute();
    };
    
    // 确保全局函数可用
    window.calculateRouteFromUI = function() {
        console.log('调用路线规划函数');
        RouteManager.calculateRouteFromUI();
    };
    
    window.clearRoute = function() {
        RouteManager.clearRoute();
    };
});