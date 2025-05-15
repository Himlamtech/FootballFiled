const { User, Booking, Order, Notification, TimeSlot, Field, OrderItem } = require('../models');
const bcrypt = require('bcryptjs');

/**
 * Get all users (admin only)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

/**
 * Get user by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if requesting user is the user in question or an admin
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized access to this user profile' });
    }
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error fetching user details', error: error.message });
  }
};

/**
 * Update user profile
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Only the user themselves or an admin can update the profile
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this user profile' });
    }
    
    const { name, phoneNumber, email } = req.body;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user data
    await user.update({
      name: name || user.name,
      phoneNumber: phoneNumber || user.phoneNumber,
      email: email || user.email
    });
    
    res.status(200).json({
      message: 'User profile updated successfully',
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

/**
 * Update user status (admin only)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const { isActive } = req.body;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deactivating your own account
    if (req.user.id === parseInt(userId)) {
      return res.status(400).json({ 
        message: 'You cannot change the status of your own account' 
      });
    }
    
    await user.update({ isActive });
    
    res.status(200).json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        userId: user.userId,
        name: user.name,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
};

/**
 * Update user role (admin only)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updateUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;
    
    // Validate role
    const validRoles = ['user', 'staff', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
      });
    }
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent changing your own role
    if (req.user.id === parseInt(userId)) {
      return res.status(400).json({ 
        message: 'You cannot change your own role' 
      });
    }
    
    await user.update({ role });
    
    res.status(200).json({
      message: 'User role updated successfully',
      user: {
        userId: user.userId,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
};

/**
 * Get user's bookings
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Only allow users to access their own bookings, unless admin
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to access these bookings' });
    }
    
    const bookings = await Booking.findAll({
      where: { userId },
      include: [
        { 
          model: User,
          attributes: ['userId', 'name']
        },
        { 
          model: TimeSlot,
          attributes: ['timeSlotId', 'startTime', 'endTime']
        },
        { 
          model: Field,
          attributes: ['fieldId', 'name', 'size']
        }
      ],
      order: [['bookingDate', 'DESC']]
    });
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Error fetching user bookings', error: error.message });
  }
};

/**
 * Get user's orders
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Only allow users to access their own orders, unless admin
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to access these orders' });
    }
    
    const orders = await Order.findAll({
      where: { userId },
      include: [
        { 
          model: OrderItem,
          as: 'orderItems',
          include: [
            { 
              model: Product,
              attributes: ['productId', 'name', 'price', 'category']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Error fetching user orders', error: error.message });
  }
};

/**
 * Get user's notifications
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Only allow users to access their own notifications
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({ message: 'Unauthorized to access these notifications' });
    }
    
    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

/**
 * Mark notification as read
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findByPk(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Only allow users to mark their own notifications as read
    if (req.user.id !== notification.userId) {
      return res.status(403).json({ message: 'Unauthorized to update this notification' });
    }
    
    await notification.update({ isRead: true });
    
    res.status(200).json({
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark notification error:', error);
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
}; 