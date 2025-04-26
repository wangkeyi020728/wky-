const User = require('../models/User');
const jwt = require('jsonwebtoken');

const userController = {
    async register(req, res) {
        try {
            const { username, password } = req.body;
            
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: '用户名已存在' });
            }

            const user = new User({ username, password });
            await user.save();

            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.status(201).json({
                message: '注册成功',
                token,
                user: {
                    id: user._id,
                    username: user.username
                }
            });
        } catch (error) {
            res.status(500).json({ message: '服务器错误', error: error.message });
        }
    },

    async login(req, res) {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ username });
            
            if (!user) {
                return res.status(401).json({ message: '用户名或密码错误' });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: '用户名或密码错误' });
            }

            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                message: '登录成功',
                token,
                user: {
                    id: user._id,
                    username: user.username
                }
            });
        } catch (error) {
            res.status(500).json({ message: '服务器错误', error: error.message });
        }
    },

    async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.userId).select('-password');
            if (!user) {
                return res.status(404).json({ message: '用户不存在' });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: '服务器错误', error: error.message });
        }
    }
};

module.exports = userController;