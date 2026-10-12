import Notification from '../models/Notification.js';

export const getNotifications = async (req, res, next) => {
  try {
    const orgId = req.user.organization ? req.user.organization._id : null;

    const query = {
      $or: [
        { recipientUser: req.user._id },
        { role: req.user.role },
        { role: 'all' }
      ]
    };

    if (orgId) {
      query.$or.push({ recipientOrg: orgId });
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      ...query,
      isRead: false
    });

    res.json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        $set: { isRead: true, readAt: new Date() }
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const orgId = req.user.organization ? req.user.organization._id : null;
    const query = {
      $or: [
        { recipientUser: req.user._id },
        { role: req.user.role },
        { role: 'all' }
      ],
      isRead: false
    };

    if (orgId) {
      query.$or.push({ recipientOrg: orgId });
    }

    await Notification.updateMany(query, {
      $set: { isRead: true, readAt: new Date() }
    });

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};
