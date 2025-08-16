const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

// Get user profile
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: user.profile
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', isAuthenticated, async (req, res) => {
  try {
    const { name, avatar } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: user.profile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Get user statistics
router.get('/stats', isAuthenticated, async (req, res) => {
  try {
    const File = require('../models/File');
    
    const totalFiles = await File.countDocuments({ userId: req.user.id });
    const totalSize = await File.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: null, totalSize: { $sum: '$fileSize' } } }
    ]);

    const fileTypes = await File.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$fileType', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalFiles,
        totalSize: totalSize[0]?.totalSize || 0,
        fileTypes: fileTypes.reduce((acc, type) => {
          acc[type._id] = type.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

module.exports = router;
