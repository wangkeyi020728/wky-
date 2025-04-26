const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// 启用 CORS
app.use(cors());

// 解析 JSON 请求体
app.use(express.json());

// 连接到 MongoDB
mongoose.connect('mongodb://localhost:27017/emergency-map')
.then(() => {
    console.log('MongoDB 连接成功');
})
.catch(err => {
    console.error('MongoDB 连接失败:', err);
});

// 用户模型
const User = mongoose.model('User', {
    username: String,
    password: String
});

// 注册路由
app.post('/api/auth/register', async (req, res) => {
    try {
        console.log('收到注册请求:', req.body);
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
        }
        
        // 检查用户名是否已存在
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ success: false, message: '用户名已存在' });
        }

        // 创建新用户
        const user = new User({ username, password });
        await user.save();
        
        console.log('用户注册成功:', username);
        res.json({ success: true, message: '注册成功' });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ success: false, message: '服务器错误: ' + error.message });
    }
});

// 登录路由
app.post('/api/auth/login', async (req, res) => {
    try {
        console.log('收到登录请求:', req.body);
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
        }
        
        // 查找用户
        const user = await User.findOne({ username, password });
        if (!user) {
            return res.status(401).json({ success: false, message: '用户名或密码错误' });
        }

        // 生成简单的 token（实际项目中应该使用 JWT）
        const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
        
        console.log('用户登录成功:', username);
        res.json({ success: true, token });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ success: false, message: '服务器错误: ' + error.message });
    }
});

// 测试路由
app.get('/api/test', (req, res) => {
    res.json({ message: '服务器正常运行' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
});