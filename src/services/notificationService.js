import Notification from '../models/Notification.js';

export const createNotification = async ({
  recipientUser,
  recipientOrg,
  role,
  type,
  title,
  message,
  data = {}
}) => {
  try {
    const notification = await Notification.create({
      recipientUser,
      recipientOrg,
      role,
      type,
      title,
      message,
      data
    });
    return notification;
  } catch (error) {
    console.error('Failed to create in-app notification:', error.message);
    return null;
  }
};
