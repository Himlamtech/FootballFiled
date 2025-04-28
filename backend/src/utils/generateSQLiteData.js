const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const logger = require('./logger');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Setup SQLite database
const dbPath = path.join(dataDir, 'football_field_db.sqlite');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: console.log
});

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
  players_count: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  skill_level: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  matched_with: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'opponents',
      key: 'id'
    }
  },
  contact_phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contact_email: {
    type: DataTypes.STRING,
    allowNull: true
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
  price_per_unit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'booking_products',
  underscored: true,
  timestamps: true
});

// Define associations
User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Field.hasMany(Booking, { foreignKey: 'field_id', as: 'bookings' });
Booking.belongsTo(Field, { foreignKey: 'field_id', as: 'field' });

Booking.hasOne(Feedback, { foreignKey: 'booking_id', as: 'feedback' });
Feedback.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

User.hasMany(Feedback, { foreignKey: 'user_id', as: 'feedback' });
Feedback.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Field.hasMany(Feedback, { foreignKey: 'field_id', as: 'feedback' });
Feedback.belongsTo(Field, { foreignKey: 'field_id', as: 'field' });

Booking.hasOne(Opponent, { foreignKey: 'booking_id', as: 'opponent' });
Opponent.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

User.hasMany(Opponent, { foreignKey: 'user_id', as: 'opponent_requests' });
Opponent.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Booking.belongsToMany(Product, { through: BookingProduct, foreignKey: 'booking_id', otherKey: 'product_id', as: 'products' });
Product.belongsToMany(Booking, { through: BookingProduct, foreignKey: 'product_id', otherKey: 'booking_id', as: 'bookings' });

// Helper functions
// Helper function to generate random integer within a range
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to generate random date within range
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Format date to 'YYYY-MM-DD'
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Format time to 'HH:MM:SS'
const formatTime = (hours, minutes) => {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
};

// Generate random Vietnamese phone number
const generatePhoneNumber = () => {
  const prefixes = ['032', '033', '034', '035', '036', '037', '038', '039', '070', '079', '077', '076', '078', '090', '091', '092', '093', '094', '096', '097', '098'];
  const prefix = prefixes[randomInt(0, prefixes.length - 1)];
  let number = '';
  for (let i = 0; i < 7; i++) {
    number += randomInt(0, 9);
  }
  return prefix + number;
};

// Generate users
async function generateUsers(count) {
  console.log(`Generating ${count} users...`);

  // Create admin user
  await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: bcrypt.hashSync('admin123', 10),
    phone: '0987654321',
    role: 'admin',
    status: 'active'
  });
  console.log('Admin user created');

  // Create regular users
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push({
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      password: bcrypt.hashSync('password123', 10),
      phone: generatePhoneNumber(),
      role: 'user',
      status: 'active'
    });
  }

  await User.bulkCreate(users);
  console.log(`${count} users created`);
}

// Generate fields
async function generateFields(count) {
  console.log(`Generating ${count} fields...`);

  const fieldTypes = ['5v5', '7v7', '11v11'];
  const locations = [
    'District 1, Ho Chi Minh City',
    'District 2, Ho Chi Minh City',
    'District 3, Ho Chi Minh City',
    'District 4, Ho Chi Minh City',
    'District 5, Ho Chi Minh City',
    'District 7, Ho Chi Minh City',
    'District 10, Ho Chi Minh City',
    'Binh Thanh District, Ho Chi Minh City',
    'Thu Duc City, Ho Chi Minh City',
    'Tan Binh District, Ho Chi Minh City',
  ];

  const facilities = [
    ['Lighting', 'Parking'],
    ['Lighting', 'Parking', 'Changing Rooms'],
    ['Lighting', 'Parking', 'Changing Rooms', 'Showers'],
    ['Lighting', 'Parking', 'Changing Rooms', 'Showers', 'Refreshments'],
    ['Lighting', 'Parking', 'Changing Rooms', 'Showers', 'Refreshments', 'Spectator Seating']
  ];

  const fields = [];
  for (let i = 0; i < count; i++) {
    const fieldType = fieldTypes[randomInt(0, fieldTypes.length - 1)];
    let pricePerHour;

    if (fieldType === '5v5') {
      pricePerHour = randomInt(150000, 250000);
    } else if (fieldType === '7v7') {
      pricePerHour = randomInt(250000, 350000);
    } else {
      pricePerHour = randomInt(400000, 600000);
    }

    fields.push({
      name: `Field ${String.fromCharCode(65 + i)}`,
      description: `${fieldType} football field with ${i % 2 === 0 ? 'artificial' : 'natural'} grass`,
      location: locations[randomInt(0, locations.length - 1)],
      field_type: fieldType,
      price_per_hour: pricePerHour,
      status: 'available',
      image_url: `https://example.com/fields/field_${String.fromCharCode(97 + i)}.jpg`,
      facilities: JSON.stringify(facilities[randomInt(0, facilities.length - 1)])
    });
  }

  await Field.bulkCreate(fields);
  console.log(`${count} fields created`);
}

// Generate products
async function generateProducts(count) {
  console.log(`Generating ${count} products...`);

  const categories = ['equipment', 'drinks', 'food', 'service'];
  const equipmentProducts = [
    { name: 'Football', description: 'Standard size 5 football', price: randomInt(200000, 350000) },
    { name: 'Jersey Set', description: 'Set of jerseys with numbers', price: randomInt(300000, 500000) },
    { name: 'Goalkeeper Gloves', description: 'Professional goalkeeper gloves', price: randomInt(150000, 250000) },
    { name: 'Referee Kit', description: 'Complete referee kit with whistle', price: randomInt(180000, 300000) },
    { name: 'Shin Guards', description: 'Protective shin guards', price: randomInt(80000, 150000) },
    { name: 'Football Boots', description: 'Professional football boots', price: randomInt(350000, 700000) }
  ];

  const drinksProducts = [
    { name: 'Water Bottle', description: '500ml mineral water', price: randomInt(8000, 12000) },
    { name: 'Sports Drink', description: 'Isotonic sports drink', price: randomInt(12000, 20000) },
    { name: 'Energy Drink', description: 'Energy boosting drink', price: randomInt(15000, 25000) },
    { name: 'Iced Tea', description: 'Refreshing iced tea', price: randomInt(12000, 18000) },
    { name: 'Fruit Juice', description: 'Fresh fruit juice', price: randomInt(15000, 22000) }
  ];

  const foodProducts = [
    { name: 'Energy Bar', description: 'Nutritious energy bar', price: randomInt(10000, 15000) },
    { name: 'Protein Bar', description: 'High protein recovery bar', price: randomInt(12000, 18000) },
    { name: 'Sandwich', description: 'Fresh sandwich', price: randomInt(20000, 35000) },
    { name: 'Fruit Pack', description: 'Assorted fresh fruits', price: randomInt(15000, 25000) },
    { name: 'Nuts Mix', description: 'Mixed nuts for energy', price: randomInt(20000, 30000) }
  ];

  const serviceProducts = [
    { name: 'Professional Referee', description: 'Hire a professional referee for your match', price: randomInt(200000, 300000) },
    { name: 'Photography Service', description: 'Professional photography for your game', price: randomInt(250000, 400000) },
    { name: 'Video Recording', description: 'HD video recording of your match', price: randomInt(300000, 500000) },
    { name: 'Coaching Session', description: '1-hour coaching session with a professional', price: randomInt(400000, 600000) }
  ];

  const categoryProducts = {
    'equipment': equipmentProducts,
    'drinks': drinksProducts,
    'food': foodProducts,
    'service': serviceProducts
  };

  const products = [];

  // Ensure at least one product from each category
  for (const category of categories) {
    const productsOfCategory = categoryProducts[category];
    for (const product of productsOfCategory) {
      products.push({
        name: product.name,
        description: product.description,
        price: product.price,
        category: category,
        image_url: `https://example.com/products/${product.name.toLowerCase().replace(/\s/g, '_')}.jpg`,
        stock_quantity: category === 'service' ? null : randomInt(10, 100),
        is_available: true
      });

      if (products.length >= count) break;
    }
    if (products.length >= count) break;
  }

  await Product.bulkCreate(products);
  console.log(`${count} products created`);
}

// Generate bookings
async function generateBookings(count) {
  console.log(`Generating ${count} bookings...`);

  const users = await User.findAll({ where: { role: 'user' } });
  const fields = await Field.findAll();
  const products = await Product.findAll();

  if (users.length === 0 || fields.length === 0) {
    console.error('No users or fields found. Cannot generate bookings.');
    return;
  }

  const statuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  const paymentStatuses = ['pending', 'paid', 'refunded'];
  const paymentMethods = ['cash', 'credit_card', 'bank_transfer', 'e_wallet'];

  // Generate dates for the past 30 days and next 60 days
  const now = new Date();
  const pastDate = new Date(now);
  pastDate.setDate(pastDate.getDate() - 30);

  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + 60);

  for (let i = 0; i < count; i++) {
    const user = users[randomInt(0, users.length - 1)];
    const field = fields[randomInt(0, fields.length - 1)];

    // Determine dates and times
    const bookingDate = formatDate(randomDate(pastDate, futureDate));

    // Generate random hour between 6 AM and 10 PM
    const startHour = randomInt(6, 21);
    // Booking duration is either 1 or 2 hours
    const duration = randomInt(1, 2);
    const endHour = Math.min(startHour + duration, 22);

    const startTime = formatTime(startHour, 0);
    const endTime = formatTime(endHour, 0);

    // Calculate total price based on field hourly rate and duration
    let totalPrice = field.price_per_hour * duration;

    // Determine status based on date
    let status;
    let paymentStatus;

    const bookingDateObj = new Date(bookingDate);
    if (bookingDateObj < now) {
      // Past bookings
      status = Math.random() < 0.1 ? 'cancelled' : 'completed';
      paymentStatus = status === 'cancelled' ? (Math.random() < 0.5 ? 'refunded' : 'pending') : 'paid';
    } else if (bookingDateObj.toDateString() === now.toDateString()) {
      // Today's bookings
      status = Math.random() < 0.7 ? 'confirmed' : 'pending';
      paymentStatus = status === 'confirmed' ? (Math.random() < 0.8 ? 'paid' : 'pending') : 'pending';
    } else {
      // Future bookings
      status = Math.random() < 0.6 ? 'confirmed' : 'pending';
      paymentStatus = status === 'confirmed' ? (Math.random() < 0.6 ? 'paid' : 'pending') : 'pending';
    }

    const paymentMethod = paymentStatus === 'paid' ? paymentMethods[randomInt(0, paymentMethods.length - 1)] : null;

    const booking = await Booking.create({
      user_id: user.id,
      field_id: field.id,
      booking_date: bookingDate,
      start_time: startTime,
      end_time: endTime,
      status: status,
      total_price: totalPrice,
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      notes: Math.random() < 0.3 ? `Special request for booking #${i + 1}` : null
    });

    // Add products to booking (30% chance)
    if (Math.random() < 0.3 && products.length > 0) {
      // Select 1-3 random products
      const numProducts = randomInt(1, Math.min(3, products.length));
      const selectedProducts = [];

      while (selectedProducts.length < numProducts) {
        const product = products[randomInt(0, products.length - 1)];
        if (!selectedProducts.includes(product) && product.category !== 'service') {
          selectedProducts.push(product);
        }
      }

      let bookingTotalPrice = totalPrice;

      for (const product of selectedProducts) {
        const quantity = randomInt(1, 5);
        const price = product.price * quantity;

        // Add to total price
        bookingTotalPrice += Number(price);

        await BookingProduct.create({
          booking_id: booking.id,
          product_id: product.id,
          quantity: quantity,
          price_per_unit: product.price,
          total_price: price
        });
      }

      // Update booking with new total price
      await booking.update({ total_price: bookingTotalPrice });
    }
  }

  console.log(`${count} bookings created`);
}

// Generate feedback
async function generateFeedback(count) {
  console.log(`Generating feedback...`);

  // Get completed bookings with payment status 'paid'
  const bookings = await Booking.findAll({
    where: {
      status: 'completed',
      payment_status: 'paid'
    }
  });

  if (bookings.length === 0) {
    console.error('No completed and paid bookings found. Cannot generate feedback.');
    return;
  }

  // Limit to count or available bookings
  const feedbackCount = Math.min(count, bookings.length);
  console.log(`Generating ${feedbackCount} feedback entries...`);

  const comments = [
    "Great field and excellent service!",
    "The field was clean and well-maintained.",
    "Had a wonderful time playing here.",
    "Good facilities but the changing rooms could be cleaner.",
    "Perfect location and reasonable prices.",
    "The staff was very helpful and friendly.",
    "Excellent lighting for evening games.",
    "The field quality was not as good as expected.",
    "Parking was a bit challenging but the field was great.",
    "Will definitely book again!",
    "The artificial grass was in top condition.",
    "Enjoyed the game, but the facilities need upgrade.",
    "Great value for money.",
    "The field size was perfect for our team.",
    "Had some issues with the booking but the play was great."
  ];

  for (let i = 0; i < feedbackCount; i++) {
    const booking = bookings[i];

    await Feedback.create({
      user_id: booking.user_id,
      booking_id: booking.id,
      field_id: booking.field_id,
      rating: randomInt(3, 5),  // Bias toward positive ratings
      comment: comments[randomInt(0, comments.length - 1)]
    });
  }

  console.log(`${feedbackCount} feedback entries created`);
}

// Generate opponents
async function generateOpponents(count) {
  console.log(`Generating opponent requests...`);

  // Get confirmed bookings
  const bookings = await Booking.findAll({
    where: {
      status: ['confirmed', 'completed']
    },
    order: [['created_at', 'DESC']],
    limit: count * 2 // Double to have enough for matching
  });

  if (bookings.length === 0) {
    console.error('No confirmed bookings found. Cannot generate opponent requests.');
    return;
  }

  // Limit to count or available bookings
  const opponentCount = Math.min(count, Math.floor(bookings.length / 2) * 2);  // Ensure even count for matching
  console.log(`Generating ${opponentCount} opponent requests...`);

  const teamNames = [
    "FC Thunder", "Real Stars", "United FC", "City Strikers", "Athletic Club",
    "FC Legends", "Phoenix FC", "Eagles United", "Spartans FC", "Warriors FC",
    "Dynamo FC", "Olympic FC", "Victory United", "Freedom Fighters", "Dragons FC",
    "Titans FC", "Royal FC", "Liberty FC", "FC Heroes", "Raptors United"
  ];

  let opponentMatches = [];

  for (let i = 0; i < opponentCount; i += 2) {
    const booking1 = bookings[i];
    const booking2 = i + 1 < bookings.length ? bookings[i + 1] : null;

    if (!booking2) continue;

    const teamName1 = `${teamNames[randomInt(0, teamNames.length - 1)]} ${randomInt(1, 99)}`;
    const teamName2 = `${teamNames[randomInt(0, teamNames.length - 1)]} ${randomInt(1, 99)}`;

    const opponent1 = await Opponent.create({
      user_id: booking1.user_id,
      booking_id: booking1.id,
      team_name: teamName1,
      players_count: booking1.field_id % 3 === 0 ? 11 : (booking1.field_id % 2 === 0 ? 7 : 5),
      skill_level: ['beginner', 'intermediate', 'advanced'][randomInt(0, 2)],
      status: 'matched',
      contact_phone: generatePhoneNumber(),
      contact_email: `team${i+1}@example.com`,
      notes: Math.random() < 0.5 ? `Looking for a friendly match on ${booking1.booking_date}` : null
    });

    const opponent2 = await Opponent.create({
      user_id: booking2.user_id,
      booking_id: booking2.id,
      team_name: teamName2,
      players_count: booking2.field_id % 3 === 0 ? 11 : (booking2.field_id % 2 === 0 ? 7 : 5),
      skill_level: ['beginner', 'intermediate', 'advanced'][randomInt(0, 2)],
      status: 'matched',
      contact_phone: generatePhoneNumber(),
      contact_email: `team${i+2}@example.com`,
      notes: Math.random() < 0.5 ? `Available for friendly matches` : null
    });

    // Update matched_with fields
    await opponent1.update({ matched_with: opponent2.id });
    await opponent2.update({ matched_with: opponent1.id });

    opponentMatches.push({ opponent1, opponent2 });
  }

  console.log(`${opponentMatches.length * 2} opponent requests created with ${opponentMatches.length} matches`);
}

// Main function to generate all data
async function generateData() {
  try {
    console.log("Starting data generation with SQLite...");

    // Sync the database
    await sequelize.sync({ force: true });
    console.log("Database synced");

    // Generate data
    await generateUsers(20);
    await generateFields(10);
    await generateProducts(15);
    await generateBookings(50);
    await generateFeedback(25);
    await generateOpponents(10);

    console.log("Data generation completed successfully!");
    return { success: true };
  } catch (error) {
    console.error("Error generating data:", error);
    return { success: false, error };
  }
}

// If script is run directly, execute the function
if (require.main === module) {
  generateData()
    .then((result) => {
      if (result.success) {
        console.log("Data generated successfully!");
        process.exit(0);
      } else {
        console.error("Data generation failed:", result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("Fatal error during data generation:", error);
      process.exit(1);
    });
}

module.exports = generateData; 