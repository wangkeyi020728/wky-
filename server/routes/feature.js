const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// 添加要素
router.post('/:projectId', auth, async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.projectId,
            creator: req.user._id
        });

        if (!project) {
            return res.status(404).json({ message: '项目不存在' });
        }

        project.features.push(req.body);
        project.updatedAt = Date.now();
        await project.save();

        res.status(201).json(project.features[project.features.length - 1]);
    } catch (err) {
        res.status(400).json({ message: '添加要素失败' });
    }
});

// 更新要素
router.patch('/:projectId/:featureId', auth, async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.projectId,
            creator: req.user._id
        });

        if (!project) {
            return res.status(404).json({ message: '项目不存在' });
        }

        const featureIndex = project.features.findIndex(
            f => f._id.toString() === req.params.featureId
        );

        if (featureIndex === -1) {
            return res.status(404).json({ message: '要素不存在' });
        }

        project.features[featureIndex] = {
            ...project.features[featureIndex],
            ...req.body
        };
        project.updatedAt = Date.now();
        await project.save();

        res.json(project.features[featureIndex]);
    } catch (err) {
        res.status(400).json({ message: '更新要素失败' });
    }
});

// 删除要素
router.delete('/:projectId/:featureId', auth, async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.projectId,
            creator: req.user._id
        });

        if (!project) {
            return res.status(404).json({ message: '项目不存在' });
        }

        project.features = project.features.filter(
            f => f._id.toString() !== req.params.featureId
        );
        project.updatedAt = Date.now();
        await project.save();

        res.json({ message: '要素已删除' });
    } catch (err) {
        res.status(500).json({ message: '删除要素失败' });
    }
});

module.exports = router;