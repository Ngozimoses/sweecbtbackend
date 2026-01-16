// services/notification.service.js
const Notification = require('../models/Notification');

class NotificationService {
  async getUserNotifications(userId) {
    return await Notification.find({ user: userId }).sort({ createdAt: -1 });
  }

  async markNotificationRead(notificationId, userId) {
    const notif = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true },
      { new: true }
    );
    if (!notif) throw new Error('Notification not found.');
    return notif;
  }

  async markAllNotificationsRead(userId) {
    await Notification.updateMany({ user: userId }, { read: true });
  }

  async sendNotification(userIds, title, message, type = 'general') {
    const notifications = userIds.map(userId => ({
      user: userId,
      title,
      message,
      type
    }));

    return await Notification.insertMany(notifications);
  }
}

module.exports = new NotificationService();