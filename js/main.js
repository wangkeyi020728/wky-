// 全局函数
function setActiveTool(tool) {
    DrawTool.setActiveTool(tool);
}

function switchMapType(type) {
    MapCore.switchMapType(type);
}

function clearAll() {
    if (confirm('确定要清除所有要素吗？')) {
        MapCore.clearAll();
    }
}

async function saveProject() {
    try {
        const projectData = {
            name: prompt('请输入项目名称：'),
            description: prompt('请输入项目描述：'),
            center: MapCore.getCenter(),
            zoom: MapCore.getZoom(),
            features: FeatureManager.getAllFeatures()
        };

        await ProjectService.saveProject(projectData);
        alert('项目保存成功');
    } catch (err) {
        alert('保存失败：' + err.message);
    }
}

async function loadProject() {
    try {
        const projectId = prompt('请输入项目ID：');
        if (!projectId) return;

        const project = await ProjectService.loadProject(projectId);
        
        // 清除当前地图
        clearAll();
        
        // 设置地图视图
        MapCore.setCenter(project.center);
        MapCore.setZoom(project.zoom);
        
        // 加载要素
        project.features.forEach(feature => {
            FeatureManager.loadFeature(feature);
        });

        alert('项目加载成功');
    } catch (err) {
        alert('加载失败：' + err.message);
    }
}

function calculateRoute() {
    RouteManager.calculateRoute();
}

function clearRoute() {
    RouteManager.clearRoute();
}

// 添加拖拽功能
document.addEventListener('DOMContentLoaded', function() {
    // 原有的初始化代码...
    
    // 添加要素表拖拽功能
    makeDraggable(document.getElementById('featureTablePanel'));
    
    // 添加属性面板拖拽功能
    makeDraggable(document.getElementById('attrPanel'));
});

// 使元素可拖拽
function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    if (element.querySelector('.table-header')) {
        // 如果存在表头，则使用表头作为拖拽区域
        element.querySelector('.table-header').onmousedown = dragMouseDown;
    } else if (element.querySelector('h3')) {
        // 对于属性面板，使用h3作为拖拽区域
        element.querySelector('h3').onmousedown = dragMouseDown;
    } else {
        // 否则整个元素可拖拽
        element.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // 获取鼠标初始位置
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // 鼠标移动时调用elementDrag
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // 计算新位置
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // 设置元素的新位置
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
        // 确保不会拖出视口
        if (parseInt(element.style.top) < 0) element.style.top = "0px";
        if (parseInt(element.style.left) < 0) element.style.left = "0px";
        if (parseInt(element.style.top) > window.innerHeight - 100) 
            element.style.top = (window.innerHeight - 100) + "px";
        if (parseInt(element.style.left) > window.innerWidth - 100) 
            element.style.left = (window.innerWidth - 100) + "px";
    }

    function closeDragElement() {
        // 停止移动
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// 确保toggleFeatureTable函数不会重置位置
function toggleFeatureTable() {
    const panel = document.getElementById('featureTablePanel');
    panel.classList.toggle('active');
    
    if (panel.classList.contains('active')) {
        // 只有在没有设置过位置时才设置默认位置
        if (!panel.style.top && !panel.style.left) {
            panel.style.top = '50%';
            panel.style.left = '50%';
            panel.style.transform = 'translate(-50%, -50%)';
        }
        updateFeatureTable();
    }
}

function closePanel() {
    document.getElementById('attrPanel').classList.remove('active');
    FeatureManager.selectedFeature = null;
}

function deleteFeature() {
    if (FeatureManager.selectedFeature) {
        if (confirm('确定要删除该要素吗？')) {
            FeatureManager.removeFeature(FeatureManager.selectedFeature);
            closePanel();
        }
    }
}

function saveAttributes() {
    FeatureManager.saveAttributes();
}

// 修改初始化部分，移除登录检查
document.addEventListener('DOMContentLoaded', () => {
    // 直接初始化各个模块
    MapCore.init();
    
    // 添加快捷键支持
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (DrawTool.currentDrawing) {
                DrawTool.cancelDrawing();
            } else {
                closePanel();
            }
        }
    });
});

// 添加以下代码到 main.js 文件的开头

// 控制侧边栏显示/隐藏
function toggleSidebar(show) {
    const sidebar = document.getElementById('sidebar');
    if (show === undefined) {
        sidebar.classList.toggle('active');
    } else {
        sidebar.classList.toggle('active', show);
    }
}

// 搜索位置功能
function searchLocation() {
    const searchInput = document.getElementById('search-input').value;
    if (!searchInput) return;
    
    // 使用百度地图地址解析服务
    const myGeo = new BMap.Geocoder();
    myGeo.getPoint(searchInput, function(point){
        if (point) {
            MapCore.map.centerAndZoom(point, 16);
            // 可以选择添加一个标记
            const marker = new BMap.Marker(point);
            MapCore.map.addOverlay(marker);
            setTimeout(() => MapCore.map.removeOverlay(marker), 3000); // 3秒后移除标记
        } else {
            alert("未找到该地址");
        }
    }, "全国");
}

// 初始化事件监听
document.addEventListener('DOMContentLoaded', function() {
    // 原有的初始化代码...
    
    // 清除搜索框默认值
    document.getElementById('search-input').value = '';
    
    // 添加菜单按钮点击事件
    document.getElementById('menu-toggle').addEventListener('click', function() {
        toggleSidebar();
    });
    
    // 添加搜索按钮点击事件
    document.getElementById('search-btn').addEventListener('click', searchLocation);
    
    // 添加搜索框回车事件
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchLocation();
        }
    });
});

// 设置活动工具的函数
function setActiveTool(tool) {
    DrawTool.setActiveTool(tool);
    // 在移动设备上，选择工具后自动关闭侧边栏
    if (window.innerWidth < 768) {
        toggleSidebar(false);
    }
}

// 添加这个函数，用于从UI界面调用路线规划
function calculateRouteFromUI() {
    RouteManager.calculateRouteFromUI();
}

// 确保这个函数已经实现
function updateRouteOptions() {
    console.log('更新路线选项');
    // 更新起点（消防车）选项
    const startSelect = document.getElementById('route-start');
    if (!startSelect) return;
    
    startSelect.innerHTML = '<option value="">请选择消防车</option>';
    
    // 获取所有消防车要素
    if (FeatureManager && FeatureManager.features) {
        const firetrucks = FeatureManager.features.firetruck || [];
        console.log('找到消防车数量:', firetrucks.length);
        
        firetrucks.forEach(truck => {
            if (truck && truck.featureData) {
                const option = document.createElement('option');
                // 使用名称作为显示文本，ID作为值
                option.value = truck.featureData.name || '';
                option.textContent = truck.featureData.name || '未命名消防车';
                startSelect.appendChild(option);
                console.log('添加消防车选项:', option.textContent);
            }
        });
    }
    
    // 更新终点选项
    updateEndPointOptions();
}

// 更新终点（着火点）选项
function updateEndPointOptions() {
    console.log('更新终点选项');
    // 更新终点（着火点）选项
    const endSelect = document.getElementById('route-end');
    if (!endSelect) return;
    
    endSelect.innerHTML = '<option value="">请选择着火点</option>';
    
    // 获取所有着火点要素
    if (FeatureManager && FeatureManager.features) {
        const firepoints = FeatureManager.features.firepoint || [];
        console.log('找到着火点数量:', firepoints.length);
        
        firepoints.forEach(point => {
            if (point && point.featureData) {
                const option = document.createElement('option');
                // 使用名称作为显示文本，ID作为值
                option.value = point.featureData.name || '';
                option.textContent = point.featureData.name || '未命名着火点';
                endSelect.appendChild(option);
                console.log('添加着火点选项:', option.textContent);
            }
        });
    }
}

// 添加打开路线规划面板的函数
// 初始化路线规划面板拖拽功能
function initRoutePanelDrag() {
    const routePanel = document.getElementById('route-panel');
    const panelHeader = routePanel.querySelector('.panel-header');
    const dragHandle = routePanel.querySelector('.drag-handle');
    
    let isDragging = false;
    let offsetX, offsetY;
    
    // 使用拖拽把手启动拖拽
    dragHandle.addEventListener('mousedown', function(e) {
        isDragging = true;
        offsetX = e.clientX - routePanel.getBoundingClientRect().left;
        offsetY = e.clientY - routePanel.getBoundingClientRect().top;
        document.body.style.userSelect = 'none';
    });
    
    // 监听鼠标移动事件
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        
        // 确保面板不会被拖出视口
        const maxX = window.innerWidth - routePanel.offsetWidth;
        const maxY = window.innerHeight - routePanel.offsetHeight;
        
        routePanel.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
        routePanel.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
        
        // 移除初始的居中定位
        routePanel.style.transform = 'none';
    });
    
    // 监听鼠标释放事件
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            document.body.style.userSelect = '';
        }
    });
}

// 在文档加载完成后初始化拖拽功能
document.addEventListener('DOMContentLoaded', function() {
    // ... 现有代码 ...
    
    // 初始化路线规划面板拖拽功能
    initRoutePanelDrag();
});

// 打开路线规划面板
function openRoutePanel() {
    console.log('打开路线规划面板');
    const routePanel = document.getElementById('route-panel');
    
    // 如果面板没有定位，设置初始位置
    if (!routePanel.style.left || !routePanel.style.top) {
        routePanel.style.left = '50%';
        routePanel.style.top = '50%';
        routePanel.style.transform = 'translate(-50%, -50%)';
    }
    
    routePanel.style.display = 'block';
    updateRouteOptions();
}