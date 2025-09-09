import express from 'express';
import auth from '../middleware/auth.js';
import notificationService from '../services/notificationService.js';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/notifications/expiring
// @desc    Get expiring items for notifications
// @access  Private
router.get('/expiring', auth, async (req, res) => {
  try {
    const { days = 3 } = req.query;
    const expiringItems = await notificationService.getExpiringItems(req.user._id, parseInt(days));

    res.json({
      expiringItems,
      days: parseInt(days)
    });
  } catch (error) {
    console.error('Get expiring items error:', error);
    res.status(500).json({ message: 'Server error fetching expiring items' });
  }
});

// @route   POST /api/notifications/send-reminder
// @desc    Send reminder notification
// @access  Private
router.post('/send-reminder', auth, async (req, res) => {
  try {
    const { type = 'email', days = 3 } = req.body;

    const result = await notificationService.sendReminderNotification(
      req.user._id,
      type,
      parseInt(days)
    );

    res.json({
      message: 'Reminder sent successfully',
      result
    });
  } catch (error) {
    console.error('Send reminder error:', error);
    res.status(500).json({ message: 'Server error sending reminder' });
  }
});

// @route   GET /api/notifications/preferences
// @desc    Get notification preferences
// @access  Private
router.get('/preferences', auth, async (req, res) => {
  try {
    const preferences = req.user.preferences?.notifications || {
      email: true,
      push: true,
      expiryReminderDays: 3
    };

    res.json({ preferences });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({ message: 'Server error fetching notification preferences' });
  }
});

// @route   PUT /api/notifications/preferences
// @desc    Update notification preferences
// @access  Private
router.put('/preferences', auth, async (req, res) => {
  try {
    const { email, push, expiryReminderDays } = req.body;

    const updateData = {};
    if (email !== undefined) updateData['preferences.notifications.email'] = email;
    if (push !== undefined) updateData['preferences.notifications.push'] = push;
    if (expiryReminderDays !== undefined) {
      updateData['preferences.notifications.expiryReminderDays'] = Math.max(1, Math.min(7, expiryReminderDays));
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Notification preferences updated successfully',
      preferences: user.preferences.notifications
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ message: 'Server error updating notification preferences' });
  }
});

export default router;
