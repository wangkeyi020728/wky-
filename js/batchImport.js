/**
 * 批量导入功能模块
 */
const BatchImport = {
    // 当前导入的数据
    importData: [],
    
    /**
     * 初始化批量导入功能
     */
    init() {
        // 导入方式切换事件
        const importMethodRadios = document.querySelectorAll('input[name="import-method"]');
        importMethodRadios.forEach(radio => {
            radio.addEventListener('change', this.toggleImportMethod);
        });
    },
    
    /**
     * 切换导入方式（文件/文本）
     */
    toggleImportMethod() {
        const method = document.querySelector('input[name="import-method"]:checked').value;
        document.getElementById('file-import-section').style.display = method === 'file' ? 'block' : 'none';
        document.getElementById('text-import-section').style.display = method === 'text' ? 'block' : 'none';
    },
    
    /**
     * 解析导入数据
     * @returns {Array} 解析后的点位数据数组
     */
    parseImportData() {
        const method = document.querySelector('input[name="import-method"]:checked').value;
        let content = '';
        
        if (method === 'file') {
            const fileInput = document.getElementById('batch-file-input');
            if (!fileInput.files || fileInput.files.length === 0) {
                alert('请选择文件');
                return [];
            }
            
            // 这里需要异步读取文件，所以我们在previewImportData中处理
            return [];
        } else {
            content = document.getElementById('batch-text-input').value.trim();
            if (!content) {
                alert('请输入数据');
                return [];
            }
            
            return this.parseContent(content);
        }
    },
    
    /**
     * 解析文本内容
     * @param {string} content 文本内容
     * @returns {Array} 解析后的点位数据数组
     */
    parseContent(content) {
        const lines = content.split('\n');
        const result = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // 修改：支持中文逗号和全角逗号
            const parts = line.split(/[,，]/);
            if (parts.length < 3) {
                console.warn(`第${i+1}行数据格式不正确，已跳过`);
                continue;
            }
            
            // 修改：去除每个部分的空格
            const cleanParts = parts.map(part => part.trim());
            
            const lng = parseFloat(cleanParts[0]);
            const lat = parseFloat(cleanParts[1]);
            
            if (isNaN(lng) || isNaN(lat)) {
                console.warn(`第${i+1}行经纬度格式不正确，已跳过`);
                continue;
            }
            
            const name = cleanParts[2];
            const properties = cleanParts.slice(3);
            
            result.push({
                lng,
                lat,
                name,
                properties
            });
        }
        
        return result;
    },
    
    /**
     * 从文件读取内容
     * @param {File} file 文件对象
     * @returns {Promise<string>} 文件内容
     */
    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = e => reject(e);
            reader.readAsText(file);
        });
    },
    
    /**
     * 预览导入数据
     */
    async previewData() {
        const method = document.querySelector('input[name="import-method"]:checked').value;
        let content = '';
        
        if (method === 'file') {
            const fileInput = document.getElementById('batch-file-input');
            if (!fileInput.files || fileInput.files.length === 0) {
                alert('请选择文件');
                return;
            }
            
            try {
                content = await this.readFileContent(fileInput.files[0]);
            } catch (error) {
                console.error('读取文件失败:', error);
                alert('读取文件失败');
                return;
            }
        } else {
            content = document.getElementById('batch-text-input').value.trim();
            if (!content) {
                alert('请输入数据');
                return;
            }
        }
        
        this.importData = this.parseContent(content);
        this.updatePreviewTable();
        
        // 添加日志输出，帮助调试
        console.log('解析的数据:', this.importData);
    },
    
    /**
     * 更新预览表格
     */
    updatePreviewTable() {
        const tableBody = document.getElementById('preview-table-body');
        const previewCount = document.getElementById('preview-count');
        
        // 清空表格
        tableBody.innerHTML = '';
        
        // 更新计数
        previewCount.textContent = `(${this.importData.length}条)`;
        
        // 填充表格
        this.importData.forEach(item => {
            const row = document.createElement('tr');
            
            const lngCell = document.createElement('td');
            lngCell.textContent = item.lng;
            row.appendChild(lngCell);
            
            const latCell = document.createElement('td');
            latCell.textContent = item.lat;
            row.appendChild(latCell);
            
            const nameCell = document.createElement('td');
            nameCell.textContent = item.name;
            row.appendChild(nameCell);
            
            const propsCell = document.createElement('td');
            propsCell.textContent = item.properties.join(', ');
            row.appendChild(propsCell);
            
            tableBody.appendChild(row);
        });
    },
    
    /**
     * 导入点位到地图
     */
    importPoints() {
        if (this.importData.length === 0) {
            alert('没有可导入的数据');
            return;
        }
        
        const pointType = document.getElementById('import-point-type').value;
        let importCount = 0;
        
        // 添加调试日志
        console.log('开始导入点位，类型:', pointType);
        console.log('导入数据:', this.importData);
        
        // 检查DrawTool对象是否存在
        if (!window.DrawTool) {
            console.error('DrawTool对象不存在');
            alert('系统错误：绘图工具未加载');
            return;
        }
        
        // 检查必要的方法是否存在
        const methodName = pointType === 'hydrant' ? 'createHydrant' : 
                          pointType === 'water' ? 'createWaterSource' :
                          pointType === 'firetruck' ? 'createFireTruck' :
                          pointType === 'firepoint' ? 'createFirePoint' : 'createPoint';
                          
        if (typeof DrawTool[methodName] !== 'function') {
            console.error(`DrawTool.${methodName}方法不存在`);
            
            // 如果方法不存在，尝试使用通用的createPoint方法
            if (typeof DrawTool.createPoint === 'function') {
                console.log('尝试使用通用的createPoint方法');
                
                this.importData.forEach(item => {
                    try {
                        const point = new BMap.Point(item.lng, item.lat);
                        DrawTool.createPoint(point, item.name);
                        importCount++;
                    } catch (error) {
                        console.error('导入点位失败:', error, item);
                    }
                });
            } else {
                alert(`系统错误：${methodName}方法未实现`);
                return;
            }
        } else {
            // 正常导入流程
            this.importData.forEach(item => {
                try {
                    console.log(`正在导入点位: ${item.name}, 坐标: ${item.lng},${item.lat}`);
                    
                    const point = new BMap.Point(item.lng, item.lat);
                    
                    // 根据不同类型创建不同的点位
                    switch (pointType) {
                        case 'point':
                            DrawTool.createPoint(point, item.name);
                            break;
                        case 'hydrant':
                            DrawTool.createHydrant(point, item.name, item.properties[0] || '正常');
                            break;
                        case 'water':
                            DrawTool.createWaterSource(point, item.name, item.properties[0] || '');
                            break;
                        case 'firetruck':
                            DrawTool.createFireTruck(point, item.name, item.properties[0] || '待命', item.properties[1] || '');
                            break;
                        case 'firepoint':
                            DrawTool.createFirePoint(point, item.name, item.properties[0] || '一级');
                            break;
                        default:
                            DrawTool.createPoint(point, item.name);
                    }
                    
                    importCount++;
                } catch (error) {
                    console.error('导入点位失败:', error, item);
                }
            });
        }
        
        console.log(`成功导入${importCount}个点位`);
        alert(`成功导入${importCount}个点位`);
        closeBatchImportModal();
        
        // 更新要素表
        if (typeof updateFeatureTable === 'function') {
            updateFeatureTable();
        } else if (FeatureManager && typeof FeatureManager.updateFeatureTable === 'function') {
            FeatureManager.updateFeatureTable();
        }
    }
};

/**
 * 打开批量导入模态框
 */
function openBatchImportModal() {
    document.getElementById('batchImportModal').style.display = 'block';
    // 重置表单
    document.getElementById('batch-file-input').value = '';
    document.getElementById('batch-text-input').value = '';
    document.getElementById('preview-table-body').innerHTML = '';
    document.getElementById('preview-count').textContent = '(0条)';
    BatchImport.importData = [];
    
    // 确保导入方式正确显示
    BatchImport.toggleImportMethod();
}

/**
 * 关闭批量导入模态框
 */
function closeBatchImportModal() {
    document.getElementById('batchImportModal').style.display = 'none';
}

/**
 * 预览导入数据
 */
function previewImportData() {
    BatchImport.previewData();
}

/**
 * 导入批量点位
 */
function importBatchPoints() {
    BatchImport.importPoints();
}

// 页面加载完成后初始化批量导入功能
document.addEventListener('DOMContentLoaded', () => {
    BatchImport.init();
});