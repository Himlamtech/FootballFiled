const bcrypt = require('bcryptjs');
const { sequelize, Admin, Field, TimeSlot, Product } = require('../models');
const logger = require('./logger');

// Initialize database
async function initDatabase() {
  try {
    logger.info('Starting database setup...');
    logger.info('Initializing database...');

    // Test database connection
    try {
      await sequelize.authenticate();
      logger.info('Database connection established successfully');
    } catch (err) {
      logger.error('Unable to connect to the database:', err);
      return false;
    }

    // Sync database with force: true to drop all tables and recreate them
    await sequelize.sync({ force: true });
    logger.info('Database synchronized successfully');

    // Create admin account
    await createAdmin();

    // Create fields
    await createFields();

    // Create time slots
    await createTimeSlots();

    // Create products
    await createProducts();

    logger.info('Database setup completed successfully');
    return true;
  } catch (error) {
    logger.error('Error setting up database:', error);
    return false;
  }
}

// Create admin account
async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await Admin.create({
      username: 'admin',
      password: hashedPassword,
      name: 'Admin',
      email: 'admin@footballfield.com',
      phone: '0123456789'
    });
    logger.info('Admin account created successfully');
  } catch (error) {
    logger.error('Error creating admin account:', error);
    throw error;
  }
}

// Create fields
async function createFields() {
  try {
    const fields = [
      {
        name: 'Sân A',
        description: 'Sân bóng đá 5 người với cỏ nhân tạo chất lượng cao',
        location: 'Khu vực A, Quận 1, TP.HCM',
        capacity: 10,
        size: '5-a-side',
        price_per_hour: 200000,
        price_per_hour_weekend: 250000,
        status: 'available',
        image_url: 'https://placehold.co/600x400?text=Football+Field+A'
      },
      {
        name: 'Sân B',
        description: 'Sân bóng đá 7 người với cỏ nhân tạo và hệ thống chiếu sáng hiện đại',
        location: 'Khu vực B, Quận 2, TP.HCM',
        capacity: 14,
        size: '7-a-side',
        price_per_hour: 300000,
        price_per_hour_weekend: 350000,
        status: 'available',
        image_url: 'https://placehold.co/600x400?text=Football+Field+B'
      },
      {
        name: 'Sân C',
        description: 'Sân bóng đá 11 người tiêu chuẩn FIFA',
        location: 'Khu vực C, Quận 3, TP.HCM',
        capacity: 22,
        size: '11-a-side',
        price_per_hour: 500000,
        price_per_hour_weekend: 600000,
        status: 'available',
        image_url: 'https://placehold.co/600x400?text=Football+Field+C'
      },
      {
        name: 'Sân D',
        description: 'Sân bóng đá 5 người trong nhà với điều hòa',
        location: 'Khu vực D, Quận 4, TP.HCM',
        capacity: 10,
        size: '5-a-side',
        price_per_hour: 250000,
        price_per_hour_weekend: 300000,
        status: 'available',
        image_url: 'https://placehold.co/600x400?text=Football+Field+D'
      }
    ];

    await Field.bulkCreate(fields);
    logger.info('Fields created successfully');
  } catch (error) {
    logger.error('Error creating fields:', error);
    throw error;
  }
}

// Create time slots
async function createTimeSlots() {
  try {
    const timeSlots = [
      { start_time: '06:00:00', end_time: '07:30:00', is_active: true },
      { start_time: '07:30:00', end_time: '09:00:00', is_active: true },
      { start_time: '09:00:00', end_time: '10:30:00', is_active: true },
      { start_time: '10:30:00', end_time: '12:00:00', is_active: true },
      { start_time: '14:00:00', end_time: '15:30:00', is_active: true },
      { start_time: '15:30:00', end_time: '17:00:00', is_active: true },
      { start_time: '17:00:00', end_time: '18:30:00', is_active: true },
      { start_time: '18:30:00', end_time: '20:00:00', is_active: true },
      { start_time: '20:00:00', end_time: '21:30:00', is_active: true }
    ];

    await TimeSlot.bulkCreate(timeSlots);
    logger.info('Time slots created successfully');
  } catch (error) {
    logger.error('Error creating time slots:', error);
    throw error;
  }
}

// Create products
async function createProducts() {
  try {
    const products = [
      {
        name: 'Nước suối',
        description: 'Chai nước suối 500ml',
        price: 10000,
        category: 'drinks',
        type: 'buy',
        stock_quantity: 100,
        image_url: 'https://placehold.co/300x300?text=Water'
      },
      {
        name: 'Nước ngọt',
        description: 'Lon nước ngọt 330ml',
        price: 15000,
        category: 'drinks',
        type: 'buy',
        stock_quantity: 100,
        image_url: 'https://placehold.co/300x300?text=Soda'
      },
      {
        name: 'Bánh mì',
        description: 'Bánh mì thịt nguội',
        price: 20000,
        category: 'food',
        type: 'buy',
        stock_quantity: 50,
        image_url: 'https://placehold.co/300x300?text=Sandwich'
      },
      {
        name: 'Thuê áo',
        description: 'Thuê áo đá bóng',
        price: 30000,
        category: 'equipment',
        type: 'rent',
        stock_quantity: 20,
        image_url: 'https://placehold.co/300x300?text=Jersey'
      },
      {
        name: 'Thuê giày',
        description: 'Thuê giày đá bóng',
        price: 40000,
        category: 'equipment',
        type: 'rent',
        stock_quantity: 20,
        image_url: 'https://placehold.co/300x300?text=Shoes'
      },
      {
        name: 'Thuê bóng',
        description: 'Thuê bóng đá',
        price: 50000,
        category: 'equipment',
        type: 'rent',
        stock_quantity: 10,
        image_url: 'https://placehold.co/300x300?text=Ball'
      },
      {
        name: 'Dịch vụ quay phim',
        description: 'Dịch vụ quay phim trận đấu',
        price: 200000,
        category: 'service',
        type: 'buy',
        stock_quantity: 5,
        image_url: 'https://placehold.co/300x300?text=Video'
      },
      {
        name: 'Dịch vụ chụp ảnh',
        description: 'Dịch vụ chụp ảnh trận đấu',
        price: 150000,
        category: 'service',
        type: 'buy',
        stock_quantity: 5,
        image_url: 'https://placehold.co/300x300?text=Photo'
      }
    ];

    await Product.bulkCreate(products);
    logger.info('Products created successfully');
  } catch (error) {
    logger.error('Error creating products:', error);
    throw error;
  }
}

// If this script is run directly
if (require.main === module) {
  initDatabase()
    .then(() => {
      logger.info('Database setup completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = {
  initDatabase,
  createAdmin,
  createFields,
  createTimeSlots,
  createProducts
};
