/**
 * MySQL Database Seed Script for Football Field Management System
 * 
 * This script generates sample data for MySQL database
 * It's similar to the SQLite generator but with MySQL-specific configurations
 */
const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');
const logger = require('./logger');
const config = require('../config/config');

// MySQL connection configuration
const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port, 
    dialect: 'mysql',
    logging: msg => logger.debug(msg),
    timezone: '+07:00',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Define models directly to ensure consistency
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user',
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
    allowNull: false
  },
  avatar_url: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true
});

const Field = sequelize.define('Field', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  field_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price_per_hour: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'available',
    allowNull: false
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  facilities: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'fields',
  underscored: true,
  timestamps: true
});

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'products',
  underscored: true,
  timestamps: true
});

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  field_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'fields',
      key: 'id'
    }
  },
  booking_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payment_status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'bookings',
  underscored: true,
  timestamps: true
});

const BookingProduct = sequelize.define('BookingProduct', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'bookings',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'booking_products',
  underscored: true,
  timestamps: true
});

const Feedback = sequelize.define('Feedback', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'bookings',
      key: 'id'
    }
  },
  field_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'fields',
      key: 'id'
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'feedback',
  underscored: true,
  timestamps: true
});

const Opponent = sequelize.define('Opponent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'bookings',
      key: 'id'
    }
  },
  team_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  player_count: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  contact_phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  preferred_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  preferred_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'open'
  },
  matched_opponent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'opponents',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'opponents',
  underscored: true,
  timestamps: true
});

// Helper functions
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const formatTime = (hours, minutes) => {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
};

const generatePhoneNumber = () => {
  const prefixes = ['0320', '0321', '0322', '0323', '0325', '0326', '0327', '0328', '0329', '0909', '0908', '0907', '0906', '0905', '0904', '0903', '0902', '0901'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return prefix + suffix;
};

// Data generation functions
async function generateUsers(count) {
  const users = [];
  const defaultPassword = await bcrypt.hash('password123', 10);
  
  // Add default admin
  users.push({
    name: 'Admin User',
    email: 'admin@example.com',
    password: await bcrypt.hash('admin123', 10),
    phone: '0909123456',
    role: 'admin',
    status: 'active',
    avatar_url: 'https://randomuser.me/api/portraits/men/1.jpg',
    created_at: new Date(),
    updated_at: new Date()
  });

  // Add regular users
  for (let i = 0; i < count - 1; i++) {
    users.push({
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      password: defaultPassword,
      phone: generatePhoneNumber(),
      role: 'user',
      status: 'active',
      avatar_url: `https://randomuser.me/api/portraits/men/${i + 2}.jpg`,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  await User.bulkCreate(users);
  logger.info(`Created ${users.length} users`);
  return users;
}

async function generateFields(count) {
  const fieldTypes = ['5-a-side', '7-a-side', '11-a-side'];
  const locations = ['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Hue', 'Can Tho'];
  const facilitiesList = [
    'Parking, Lighting, Changing Rooms, Shower',
    'Parking, Lighting, Shower, Cafeteria',
    'Lighting, Changing Rooms, Restaurant',
    'Parking, Shower, Restaurant, Free Wifi',
    'Changing Rooms, Shower, Cafeteria, Free Wifi'
  ];
  const fields = [];

  for (let i = 0; i < count; i++) {
    const fieldType = fieldTypes[randomInt(0, fieldTypes.length - 1)];
    const priceMap = {
      '5-a-side': randomInt(200000, 350000),
      '7-a-side': randomInt(350000, 500000),
      '11-a-side': randomInt(500000, 800000)
    };

    fields.push({
      name: `Football Field ${i + 1}`,
      description: `A quality ${fieldType} football field with excellent facilities.`,
      location: locations[randomInt(0, locations.length - 1)],
      field_type: fieldType,
      price_per_hour: priceMap[fieldType],
      status: 'available',
      image_url: `https://source.unsplash.com/random/800x600?football,field,${i}`,
      facilities: facilitiesList[randomInt(0, facilitiesList.length - 1)],
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  await Field.bulkCreate(fields);
  logger.info(`Created ${fields.length} fields`);
  return fields;
}

async function generateProducts(count) {
  const categories = ['Equipment', 'Beverage', 'Food', 'Merchandise'];
  const products = [];

  const equipmentItems = [
    { name: 'Football', price: 250000, stock: 50 },
    { name: 'Goalkeeper Gloves', price: 150000, stock: 30 },
    { name: 'Shin Guards', price: 100000, stock: 40 },
    { name: 'Football Socks', price: 50000, stock: 100 },
    { name: 'Jersey (Set)', price: 300000, stock: 25 }
  ];

  const beverageItems = [
    { name: 'Water Bottle', price: 15000, stock: 200 },
    { name: 'Sports Drink', price: 25000, stock: 150 },
    { name: 'Energy Drink', price: 30000, stock: 100 },
    { name: 'Coconut Water', price: 20000, stock: 80 },
    { name: 'Iced Tea', price: 18000, stock: 120 }
  ];

  const foodItems = [
    { name: 'Energy Bar', price: 30000, stock: 100 },
    { name: 'Sandwich', price: 35000, stock: 40 },
    { name: 'Fruit Pack', price: 25000, stock: 60 },
    { name: 'Protein Snack', price: 40000, stock: 50 },
    { name: 'Chips', price: 20000, stock: 150 }
  ];

  const merchandiseItems = [
    { name: 'Team Cap', price: 150000, stock: 40 },
    { name: 'Sports Bag', price: 300000, stock: 30 },
    { name: 'Whistle', price: 50000, stock: 60 },
    { name: 'Wristband', price: 30000, stock: 100 },
    { name: 'Water Bottle (Premium)', price: 100000, stock: 50 }
  ];

  const allItems = {
    'Equipment': equipmentItems,
    'Beverage': beverageItems,
    'Food': foodItems,
    'Merchandise': merchandiseItems
  };

  for (const category of categories) {
    const categoryItems = allItems[category];
    for (const item of categoryItems) {
      products.push({
        name: item.name,
        description: `Quality ${item.name.toLowerCase()} for football players.`,
        price: item.price,
        category,
        image_url: `https://source.unsplash.com/random/200x200?${item.name.replace(' ', ',')}`,
        stock_quantity: item.stock,
        is_available: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  }

  await Product.bulkCreate(products);
  logger.info(`Created ${products.length} products`);
  return products;
}

async function generateBookings(count) {
  const users = await User.findAll({ where: { role: 'user' } });
  const fields = await Field.findAll();
  const products = await Product.findAll();
  const bookings = [];
  const bookingProducts = [];
  const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  const paymentStatuses = ['pending', 'paid', 'refunded'];
  const paymentMethods = ['cash', 'credit_card', 'bank_transfer', 'e-wallet'];

  // Current date for reference
  const now = new Date();
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(now.getMonth() - 1);
  const threeMonthsAhead = new Date(now);
  threeMonthsAhead.setMonth(now.getMonth() + 3);

  for (let i = 0; i < count; i++) {
    const user = users[randomInt(0, users.length - 1)];
    const field = fields[randomInt(0, fields.length - 1)];
    const startHour = randomInt(7, 20);
    const duration = randomInt(1, 3);
    const endHour = startHour + duration;
    const bookingDate = randomDate(oneMonthAgo, threeMonthsAhead);
    
    // Calculate if booking is in the past or future
    const isPastBooking = bookingDate < now;
    
    // Determine status based on booking date
    let status;
    let paymentStatus;
    
    if (isPastBooking) {
      // Past bookings are more likely to be completed or cancelled
      status = Math.random() < 0.8 ? 'completed' : 'cancelled';
      paymentStatus = status === 'completed' ? 'paid' : (Math.random() < 0.7 ? 'refunded' : 'paid');
    } else {
      // Future bookings are more likely to be pending or confirmed
      status = Math.random() < 0.7 ? 'confirmed' : 'pending';
      paymentStatus = Math.random() < 0.6 ? 'paid' : 'pending';
    }

    const totalHours = duration;
    const basePrice = parseFloat(field.price_per_hour) * totalHours;
    
    // Add some products to the booking
    const productCount = randomInt(0, 3);
    let productTotal = 0;
    
    const booking = {
      user_id: user.id,
      field_id: field.id,
      booking_date: formatDate(bookingDate),
      start_time: formatTime(startHour, 0),
      end_time: formatTime(endHour, 0),
      status,
      total_price: basePrice, // Will update after adding products
      payment_status: paymentStatus,
      payment_method: paymentStatus === 'paid' ? paymentMethods[randomInt(0, paymentMethods.length - 1)] : null,
      notes: Math.random() < 0.3 ? 'Please prepare the field 15 minutes before the scheduled time.' : null,
      created_at: new Date(bookingDate.getTime() - randomInt(1, 7) * 24 * 60 * 60 * 1000), // 1-7 days before booking
      updated_at: new Date()
    };
    
    // Add the booking to our collection
    bookings.push(booking);
    
    // We'll add products to this booking after we insert it and get the ID
  }

  // Create bookings first
  const createdBookings = await Booking.bulkCreate(bookings, { returning: true });
  
  // Now add products to each booking
  for (const booking of createdBookings) {
    const productCount = randomInt(0, 3);
    let productTotal = 0;
    
    for (let j = 0; j < productCount; j++) {
      const product = products[randomInt(0, products.length - 1)];
      const quantity = randomInt(1, 3);
      const price = parseFloat(product.price) * quantity;
      
      bookingProducts.push({
        booking_id: booking.id,
        product_id: product.id,
        quantity,
        price,
        created_at: booking.created_at,
        updated_at: booking.created_at
      });
      
      productTotal += price;
    }
    
    // Update booking with product costs if any products were added
    if (productTotal > 0) {
      await booking.update({
        total_price: parseFloat(booking.total_price) + productTotal
      });
    }
  }
  
  // Create booking products
  if (bookingProducts.length > 0) {
    await BookingProduct.bulkCreate(bookingProducts);
  }
  
  logger.info(`Created ${bookings.length} bookings with ${bookingProducts.length} products`);
  return createdBookings;
}

async function generateFeedback(count) {
  const completedBookings = await Booking.findAll({ 
    where: { 
      status: 'completed',
      payment_status: 'paid'
    }
  });
  
  const feedbacks = [];
  const feedbackComments = [
    'Great field, highly recommend!',
    'The facilities were clean and well-maintained.',
    'Average experience, could be better.',
    'Had an issue with lighting, but overall okay.',
    'Excellent service and facilities!',
    'The field was in perfect condition.',
    'Will definitely book again.',
    'Staff was very helpful.',
    'Decent field but a bit expensive.',
    'Perfect for our weekly match!'
  ];
  
  // Get the smaller of requested count or available completed bookings
  const actualCount = Math.min(count, completedBookings.length);
  const selectedBookings = completedBookings.slice(0, actualCount);
  
  for (const booking of selectedBookings) {
    feedbacks.push({
      user_id: booking.user_id,
      booking_id: booking.id,
      field_id: booking.field_id,
      rating: randomInt(3, 5),  // More positive ratings than negative
      comment: Math.random() < 0.7 ? feedbackComments[randomInt(0, feedbackComments.length - 1)] : null,
      created_at: new Date(),
      updated_at: new Date()
    });
  }
  
  await Feedback.bulkCreate(feedbacks);
  logger.info(`Created ${feedbacks.length} feedback entries`);
  return feedbacks;
}

async function generateOpponents(count) {
  const users = await User.findAll({ where: { role: 'user' } });
  const opponents = [];
  const statuses = ['open', 'matched', 'completed', 'cancelled'];
  const teamNames = [
    'Red Dragons', 'Blue Lions', 'Green Eagles', 'Yellow Tigers', 
    'Black Panthers', 'White Wolves', 'Golden Knights', 'Silver Falcons',
    'Royal Phoenix', 'Electric Vipers', 'Thunder Sharks', 'Mighty Bulls',
    'Fierce Cobras', 'Swift Foxes', 'Brave Warriors', 'Dynamic Dolphins'
  ];
  
  // Current date for reference
  const now = new Date();
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(now.getMonth() - 1);
  const twoMonthsAhead = new Date(now);
  twoMonthsAhead.setMonth(now.getMonth() + 2);
  
  // First pass: create initial opponent requests
  for (let i = 0; i < count; i++) {
    const user = users[randomInt(0, users.length - 1)];
    const preferredDate = randomDate(now, twoMonthsAhead);
    const preferredHour = randomInt(8, 20);
    const playerCount = [5, 7, 11][randomInt(0, 2)]; // 5-a-side, 7-a-side, or 11-a-side
    
    opponents.push({
      user_id: user.id,
      booking_id: null, // Will be set for some opponents later
      team_name: teamNames[randomInt(0, teamNames.length - 1)],
      player_count: playerCount,
      contact_phone: generatePhoneNumber(),
      preferred_date: formatDate(preferredDate),
      preferred_time: formatTime(preferredHour, 0),
      status: 'open', // All start as open
      matched_opponent_id: null, // Will be set for matched opponents
      notes: Math.random() < 0.5 ? 'Looking for a friendly match.' : null,
      created_at: new Date(),
      updated_at: new Date()
    });
  }
  
  // Create all opponent requests
  const createdOpponents = await Opponent.bulkCreate(opponents, { returning: true });
  
  // Second pass: match some opponents
  const opponentsToMatch = createdOpponents.filter(o => 
    Math.random() < 0.4 && o.status === 'open'
  );
  
  // Process in pairs
  for (let i = 0; i < opponentsToMatch.length - 1; i += 2) {
    const opponent1 = opponentsToMatch[i];
    const opponent2 = opponentsToMatch[i + 1];
    
    // Only match if they have compatible player counts
    if (opponent1.player_count === opponent2.player_count) {
      await opponent1.update({
        status: 'matched',
        matched_opponent_id: opponent2.id
      });
      
      await opponent2.update({
        status: 'matched',
        matched_opponent_id: opponent1.id
      });
    }
  }
  
  logger.info(`Created ${createdOpponents.length} opponent requests`);
  logger.info(`Matched ${opponentsToMatch.length - (opponentsToMatch.length % 2)} opponents`);
  
  return createdOpponents;
}

// Main function to generate all data
async function generateData() {
  try {
    // Check MySQL connection
    await sequelize.authenticate();
    logger.info('MySQL connection established successfully.');
    
    // Drop and recreate tables
    logger.info('Syncing database models...');
    await sequelize.sync({ force: true });
    logger.info('Database synced. All tables created.');
    
    // Generate data
    await generateUsers(20);
    await generateFields(10);
    await generateProducts(20);
    const bookings = await generateBookings(50);
    await generateFeedback(30);
    await generateOpponents(20);
    
    logger.info('Sample data generated successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Error generating data:', error);
    process.exit(1);
  }
}

// Run the script
generateData(); 