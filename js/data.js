const DataManager = {
    saveProject() {
        const projectData = {
            mapCenter: MapCore.getCenter(),
            mapZoom: MapCore.getZoom(),
            features: {}
        };

        // 收集所有要素数据
        Object.entries(FeatureManager.features).forEach(([type, features]) => {
            projectData.features[type] = features.map(feature => feature.featureData);
        });

        // 创建并下载JSON文件
        const dataStr = JSON.stringify(projectData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `消防预案_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    loadProject() {
        const fileInput = document.getElementById('fileInput');
        fileInput.click();

        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const projectData = JSON.parse(e.target.result);
                    this.restoreProject(projectData);
                } catch (error) {
                    alert('加载项目文件失败：' + error.message);
                }
            };
            reader.readAsText(file);
        };
    },

    restoreProject(data) {
        // 清除当前地图
        MapCore.clearAll();

        // 恢复地图视图
        if (data.mapCenter) {
            const center = new BMap.Point(data.mapCenter.lng, data.mapCenter.lat);
            MapCore.map.centerAndZoom(center, data.mapZoom || 15);
        }

        // 恢复要素
        Object.entries(data.features).forEach(([type, features]) => {
            features.forEach(featureData => {
                this.restoreFeature(type, featureData);
            });
        });
    },

    restoreFeature(type, data) {
        let overlay;

        switch(type) {
            case 'point':
            case 'hydrant':
            case 'water':
            case 'firetruck':
            case 'firepoint':
                const point = new BMap.Point(data.coordinates.lng, data.coordinates.lat);
                overlay = new BMap.Marker(point, {
                    icon: DrawTool.style[type]
                });
                break;

            case 'polyline':
                const path = data.coordinates.map(p => new BMap.Point(p.lng, p.lat));
                overlay = new BMap.Polyline(path, data.style);
                break;

            case 'circle':
                const center = new BMap.Point(data.center.lng, data.center.lat);
                overlay = new BMap.Circle(center, data.radius, data.style);
                break;

            case 'rectangle':
                const bounds = data.coordinates.map(p => new BMap.Point(p.lng, p.lat));
                overlay = new BMap.Polygon(bounds, data.style);
                break;
        }

        if (overlay) {
            overlay.featureData = data;
            overlay.addEventListener('click', () => FeatureManager.selectFeature(overlay));
            MapCore.addOverlay(overlay);
            FeatureManager.addFeature(type, overlay);
        }
    },

    exportImage() {
        // 创建临时canvas
        const canvas = document.createElement('canvas');
        const mapContainer = document.getElementById('map-container');
        canvas.width = mapContainer.offsetWidth;
        canvas.height = mapContainer.offsetHeight;
        const ctx = canvas.getContext('2d');

        // 截取地图
        html2canvas(mapContainer).then(mapCanvas => {
            ctx.drawImage(mapCanvas, 0, 0);

            // 添加水印
            ctx.font = '14px Arial';
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillText(`消防预案图 - ${new Date().toLocaleString()}`, 10, canvas.height - 20);

            // 下载图片
            const url = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = url;
            a.download = `消防预案图_${new Date().toISOString().split('T')[0]}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }
};

// 绑定保存和加载事件
document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.querySelector('[onclick="saveProject()"]');
    const loadBtn = document.querySelector('[onclick="loadProject()"]');
    
    if (saveBtn) saveBtn.onclick = () => DataManager.saveProject();
    if (loadBtn) loadBtn.onclick = () => DataManager.loadProject();
});