const bcrypt = require('bcryptjs');
const { sequelize, User, Field, Product } = require('../models');
const logger = require('./logger');

async function seedDatabase() {
  try {
    logger.info('Starting database seeding...');

    // Connect to the database
    await sequelize.authenticate();
    logger.info('Database connection established');

    // Sync models with the database
    await sequelize.sync({ alter: true });
    logger.info('Database synchronized');

    // Create admin user
    const adminExists = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: bcrypt.hashSync('admin123', 10),
        phone: '0987654321',
        role: 'admin',
        status: 'active'
      });
      logger.info('Admin user created');
    } else {
      logger.info('Admin user already exists');
    }

    // Create sample regular user
    const userExists = await User.findOne({ where: { email: 'user@example.com' } });
    
    if (!userExists) {
      await User.create({
        name: 'Sample User',
        email: 'user@example.com',
        password: bcrypt.hashSync('user123', 10),
        phone: '0123456789',
        role: 'user',
        status: 'active'
      });
      logger.info('Sample user created');
    } else {
      logger.info('Sample user already exists');
    }

    // Create sample fields
    const fieldCount = await Field.count();
    
    if (fieldCount === 0) {
      const fields = [
        {
          name: 'Field A',
          location: '123 Main Street, District 1, City',
          size: '5v5',
          hourlyRate: 150000,
          status: 'available',
          imageUrl: 'https://example.com/fields/field_a.jpg'
        },
        {
          name: 'Field B',
          location: '456 Park Avenue, District 2, City',
          size: '7v7',
          hourlyRate: 200000,
          status: 'available',
          imageUrl: 'https://example.com/fields/field_b.jpg'
        },
        {
          name: 'Field C',
          location: '789 Sports Complex, District 3, City',
          size: '11v11',
          hourlyRate: 300000,
          status: 'available',
          imageUrl: 'https://example.com/fields/field_c.jpg'
        }
      ];

      await Field.bulkCreate(fields);
      logger.info('Sample fields created');
    } else {
      logger.info('Fields already exist');
    }

    // Create sample products
    const productCount = await Product.count();
    
    if (productCount === 0) {
      const products = [
        {
          name: 'Water Bottle',
          description: '500ml mineral water',
          price: 10000,
          category: 'drinks',
          image_url: 'https://example.com/products/water.jpg',
          stock_quantity: 100
        },
        {
          name: 'Sports Drink',
          description: '500ml isotonic sports drink',
          price: 15000,
          category: 'drinks',
          image_url: 'https://example.com/products/sports_drink.jpg',
          stock_quantity: 80
        },
        {
          name: 'Football',
          description: 'Standard size 5 football',
          price: 200000,
          category: 'equipment',
          image_url: 'https://example.com/products/football.jpg',
          stock_quantity: 20
        },
        {
          name: 'Jersey Set',
          description: 'Set of 7 jerseys with numbers',
          price: 350000,
          category: 'equipment',
          image_url: 'https://example.com/products/jersey.jpg',
          stock_quantity: 15
        },
        {
          name: 'Energy Bar',
          description: 'Chocolate flavored energy bar',
          price: 12000,
          category: 'food',
          image_url: 'https://example.com/products/energy_bar.jpg',
          stock_quantity: 50
        }
      ];

      await Product.bulkCreate(products);
      logger.info('Sample products created');
    } else {
      logger.info('Products already exist');
    }

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
}

// If script is run directly, execute the seed function
if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('Seed process completed, exiting.');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seed process failed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase; 