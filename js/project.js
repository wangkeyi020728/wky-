const ProjectService = {
    async saveProject(projectData) {
        const response = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AuthService.token}`
            },
            body: JSON.stringify(projectData)
        });
        
        if (!response.ok) {
            throw new Error('保存项目失败');
        }
        
        return response.json();
    },

    async loadProject(projectId) {
        const response = await fetch(`${API_URL}/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${AuthService.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('加载项目失败');
        }
        
        return response.json();
    },

    async updateFeature(projectId, featureId, featureData) {
        const response = await fetch(`${API_URL}/features/${projectId}/${featureId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AuthService.token}`
            },
            body: JSON.stringify(featureData)
        });
        
        if (!response.ok) {
            throw new Error('更新要素失败');
        }
        
        return response.json();
    }
};