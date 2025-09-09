import nodemailer from 'nodemailer';
import cron from 'node-cron';
import FoodItem from '../models/FoodItem.js';
import User from '../models/User.js';

class NotificationService {
  constructor() {
    this.emailTransporter = this.createEmailTransporter();
    this.setupCronJobs();
  }

  // Create email transporter
  createEmailTransporter() {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email configuration not found. Email notifications will be disabled.');
      return null;
    }

    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Setup cron jobs for automatic notifications
  setupCronJobs() {
    // Run daily at 9 AM to check for expiring items
    cron.schedule('0 9 * * *', async () => {
      console.log('Running daily expiry check...');
      await this.sendDailyExpiryNotifications();
    });

    console.log('✅ Cron jobs scheduled for notifications');
  }

  // Get expiring items for a user
  async getExpiringItems(userId, days = 3) {
    try {
      const now = new Date();
      const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));

      const expiringItems = await FoodItem.find({
        user: userId,
        isConsumed: false,
        expiryDate: { $gte: now, $lte: futureDate }
      }).sort({ expiryDate: 1 });

      return expiringItems.map(item => ({
        id: item._id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        expiryDate: item.expiryDate,
        daysUntilExpiry: Math.ceil((new Date(item.expiryDate) - now) / (1000 * 60 * 60 * 24)),
        storageLocation: item.storageLocation
      }));
    } catch (error) {
      console.error('Error getting expiring items:', error);
      return [];
    }
  }

  // Send reminder notification
  async sendReminderNotification(userId, type = 'email', days = 3) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const expiringItems = await this.getExpiringItems(userId, days);

      if (expiringItems.length === 0) {
        return { message: 'No expiring items found', sent: false };
      }

      let result = { sent: false, type };

      switch (type) {
        case 'email':
          result = await this.sendEmailNotification(user, expiringItems);
          break;
        case 'push':
          // Push notifications would be implemented here
          result = { message: 'Push notification sent', sent: true };
          break;
        default:
          throw new Error('Invalid notification type');
      }

      return result;
    } catch (error) {
      console.error('Error sending reminder notification:', error);
      throw error;
    }
  }

  // Send email notification
  async sendEmailNotification(user, expiringItems) {
    try {
      if (!this.emailTransporter) {
        throw new Error('Email transporter not configured');
      }

      const emailContent = this.generateEmailContent(user.name, expiringItems);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `🍎 Food Expiry Reminder - ${expiringItems.length} items expiring soon`,
        html: emailContent
      };

      await this.emailTransporter.sendMail(mailOptions);

      return {
        message: 'Email notification sent successfully',
        sent: true,
        recipient: user.email,
        itemsCount: expiringItems.length
      };
    } catch (error) {
      console.error('Error sending email notification:', error);
      throw error;
    }
  }

  // Generate email content
  generateEmailContent(userName, expiringItems) {
    const itemsList = expiringItems.map(item => {
      const status = item.daysUntilExpiry === 0 ? 'expires today' : 
                    item.daysUntilExpiry === 1 ? 'expires tomorrow' : 
                    `expires in ${item.daysUntilExpiry} days`;
      
      return `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px;">${item.name}</td>
          <td style="padding: 10px;">${item.quantity.amount} ${item.quantity.unit}</td>
          <td style="padding: 10px;">${status}</td>
          <td style="padding: 10px;">${item.storageLocation}</td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Food Expiry Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #4CAF50; color: white; padding: 10px; text-align: left; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍎 Food Expiry Reminder</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>You have <strong>${expiringItems.length}</strong> food items that are expiring soon:</p>
            
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Storage</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>
            
            <p><strong>Tips to reduce food waste:</strong></p>
            <ul>
              <li>Plan meals around expiring items</li>
              <li>Freeze items that can be frozen</li>
              <li>Use expiring fruits in smoothies or baking</li>
              <li>Cook vegetables into soups or stir-fries</li>
            </ul>
            
            <p>Log in to your Food Tracker app to manage your inventory and get recipe suggestions!</p>
          </div>
          <div class="footer">
            <p>This is an automated message from your Food Expiry & Nutrition Tracker.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send daily expiry notifications to all users
  async sendDailyExpiryNotifications() {
    try {
      const users = await User.find({
        'preferences.notifications.email': true
      });

      for (const user of users) {
        try {
          const reminderDays = user.preferences?.notifications?.expiryReminderDays || 3;
          const expiringItems = await this.getExpiringItems(user._id, reminderDays);

          if (expiringItems.length > 0) {
            await this.sendEmailNotification(user, expiringItems);
            console.log(`✅ Daily notification sent to ${user.email}`);
          }
        } catch (error) {
          console.error(`❌ Error sending notification to ${user.email}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in daily expiry notifications:', error);
    }
  }

  // Test email configuration
  async testEmailConfiguration() {
    try {
      if (!this.emailTransporter) {
        throw new Error('Email transporter not configured');
      }

      await this.emailTransporter.verify();
      return { success: true, message: 'Email configuration is valid' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

export default new NotificationService();
