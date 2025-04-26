const ImageMarker = {
    currentImage: null,

    uploadCustomImage() {
        const input = document.getElementById('imageInput');
        input.click();

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // 弹出对话框让用户输入图片名称和标注文字
            const imageName = prompt('请输入图片名称：', file.name) || file.name;
            const labelText = prompt('请输入标注文字（可选）：', '');

            const reader = new FileReader();
            reader.onload = (e) => {
                this.currentImage = {
                    url: e.target.result,
                    name: imageName,
                    label: labelText
                };
                DrawTool.setActiveTool('image');
            };
            reader.readAsDataURL(file);
        };
    },

    createImageMarker(point) {
        if (!this.currentImage) return;

        const img = new Image();
        img.src = this.currentImage.url;
        
        img.onload = () => {
            // 计算图片的显示尺寸（最大宽度100px）
            const scale = Math.min(1, 100 / img.width);
            const width = img.width * scale;
            const height = img.height * scale;

            const icon = new BMap.Icon(this.currentImage.url, new BMap.Size(width, height), {
                imageSize: new BMap.Size(width, height),
                anchor: new BMap.Size(width/2, height/2)
            });

            const marker = new BMap.Marker(point, {
                icon: icon
            });

            // 如果有标注文字，添加标签
            if (this.currentImage.label) {
                const label = new BMap.Label(this.currentImage.label, {
                    offset: new BMap.Size(width/2, -10),
                    position: point,
                    enableMassClear: true
                });
                
                label.setStyle({
                    color: '#333',
                    fontSize: '12px',
                    padding: '5px',
                    borderRadius: '3px',
                    backgroundColor: 'white',
                    border: '1px solid #ddd'
                });
                
                MapCore.addOverlay(label);
                marker.label = label;
            }

            marker.featureData = {
                type: 'image',
                name: this.currentImage.name,
                label: this.currentImage.label,
                coordinates: {
                    lng: point.lng,
                    lat: point.lat
                },
                properties: {
                    imageUrl: this.currentImage.url,
                    width: width,
                    height: height
                },
                createTime: new Date().toISOString()
            };

            MapCore.addOverlay(marker);
            FeatureManager.addFeature('image', marker);
            this.currentImage = null;
        };
    }
};

// 添加到全局函数
function uploadCustomImage() {
    ImageMarker.uploadCustomImage();
}