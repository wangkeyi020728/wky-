const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// 获取所有项目
router.get('/', auth, async (req, res) => {
    try {
        const projects = await Project.find({ creator: req.user._id });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: '获取项目失败' });
    }
});

// 创建新项目
router.post('/', auth, async (req, res) => {
    try {
        const project = new Project({
            ...req.body,
            creator: req.user._id
        });
        await project.save();
        res.status(201).json(project);
    } catch (err) {
        res.status(400).json({ message: '创建项目失败' });
    }
});

// 获取单个项目
router.get('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            creator: req.user._id
        });
        if (!project) {
            return res.status(404).json({ message: '项目不存在' });
        }
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: '获取项目失败' });
    }
});

// 更新项目
router.patch('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, creator: req.user._id },
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );
        if (!project) {
            return res.status(404).json({ message: '项目不存在' });
        }
        res.json(project);
    } catch (err) {
        res.status(400).json({ message: '更新项目失败' });
    }
});

// 删除项目
router.delete('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({
            _id: req.params.id,
            creator: req.user._id
        });
        if (!project) {
            return res.status(404).json({ message: '项目不存在' });
        }
        res.json({ message: '项目已删除' });
    } catch (err) {
        res.status(500).json({ message: '删除项目失败' });
    }
});

module.exports = router;