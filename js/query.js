const QueryManager = {
    searchFeatures(keyword) {
        if (!keyword) {
            FeatureManager.updateFeatureTable();
            return;
        }

        const tbody = document.getElementById('featureTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        const searchTerm = keyword.toLowerCase();

        Object.entries(FeatureManager.features).forEach(([type, features]) => {
            features.forEach(feature => {
                const data = feature.featureData;
                if (this.matchFeature(data, searchTerm)) {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${FeatureManager.getFeatureName(type)}</td>
                        <td>${data.name}</td>
                        <td>${FeatureManager.getFeatureStatus(data)}</td>
                        <td>${new Date(data.createTime).toLocaleString()}</td>
                    `;
                    tr.addEventListener('click', () => FeatureManager.selectFeature(feature));
                    if (feature === FeatureManager.selectedFeature) {
                        tr.classList.add('selected');
                    }
                    tbody.appendChild(tr);
                }
            });
        });
    },

    matchFeature(data, searchTerm) {
        // 匹配名称
        if (data.name.toLowerCase().includes(searchTerm)) return true;

        // 匹配属性
        if (data.properties) {
            const props = Object.values(data.properties);
            for (let prop of props) {
                if (String(prop).toLowerCase().includes(searchTerm)) return true;
            }
        }

        return false;
    },

    findFeatureById(id) {
        for (const features of Object.values(FeatureManager.features)) {
            const feature = features.find(f => f.featureData.id === id);
            if (feature) return feature;
        }
        return null;
    },

    findFeaturesByType(type) {
        return FeatureManager.features[type] || [];
    },

    findNearbyFeatures(point, radius) {
        const nearbyFeatures = [];
        
        Object.entries(FeatureManager.features).forEach(([type, features]) => {
            features.forEach(feature => {
                let distance;
                if (feature instanceof BMap.Marker) {
                    distance = MapCore.map.getDistance(feature.getPosition(), point);
                } else if (feature instanceof BMap.Circle) {
                    distance = MapCore.map.getDistance(feature.getCenter(), point);
                } else if (feature instanceof BMap.Polygon) {
                    // 对于多边形，计算到边界的最短距离
                    const path = feature.getPath();
                    distance = this.calculateMinDistanceToPolygon(point, path);
                }

                if (distance <= radius) {
                    nearbyFeatures.push({
                        feature: feature,
                        distance: Math.round(distance)
                    });
                }
            });
        });

        return nearbyFeatures.sort((a, b) => a.distance - b.distance);
    },

    calculateMinDistanceToPolygon(point, path) {
        let minDistance = Infinity;
        for (let i = 0; i < path.length; i++) {
            const start = path[i];
            const end = path[(i + 1) % path.length];
            const distance = this.calculateDistanceToLine(point, start, end);
            minDistance = Math.min(minDistance, distance);
        }
        return minDistance;
    },

    calculateDistanceToLine(point, lineStart, lineEnd) {
        const dx = lineEnd.lng - lineStart.lng;
        const dy = lineEnd.lat - lineStart.lat;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) return MapCore.map.getDistance(point, lineStart);

        const t = ((point.lng - lineStart.lng) * dx + (point.lat - lineStart.lat) * dy) / (length * length);
        
        if (t < 0) return MapCore.map.getDistance(point, lineStart);
        if (t > 1) return MapCore.map.getDistance(point, lineEnd);

        const projection = new BMap.Point(
            lineStart.lng + t * dx,
            lineStart.lat + t * dy
        );
        
        return MapCore.map.getDistance(point, projection);
    }
};

// 绑定搜索事件
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            QueryManager.searchFeatures(e.target.value);
        });
    }
});