const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../config/config');
const logger = require('../utils/logger');

const basename = path.basename(__filename);
const db = {};

// Create options object based on database dialect
const sequelizeOptions = {
  dialect: config.db.dialect,
  logging: config.db.logging ? msg => logger.debug(msg) : false,
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
  },
  pool: config.db.pool
};

// Add dialect-specific options
if (config.db.dialect === 'sqlite') {
  sequelizeOptions.storage = config.db.storage;
} else {
  sequelizeOptions.host = config.db.host;
  sequelizeOptions.port = config.db.port;
  sequelizeOptions.timezone = '+07:00';
}

// Create Sequelize instance
const sequelize = config.db.dialect === 'sqlite' 
  ? new Sequelize({ ...sequelizeOptions })
  : new Sequelize(config.db.database, config.db.username, config.db.password, sequelizeOptions);

// Import models
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Define associations after all models are loaded
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Define associations explicitly if needed
const defineAssociations = () => {
  if (!db.User || !db.Booking || !db.Field || !db.Feedback || !db.Opponent || !db.Product || !db.BookingProduct) {
    logger.warn('Some models are missing, skipping association definitions');
    return;
  }

  // User <-> Booking
  db.User.hasMany(db.Booking, { foreignKey: 'user_id', as: 'bookings' });
  db.Booking.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

  // Field <-> Booking
  db.Field.hasMany(db.Booking, { foreignKey: 'field_id', as: 'bookings' });
  db.Booking.belongsTo(db.Field, { foreignKey: 'field_id', as: 'field' });

  // Booking <-> Feedback
  db.Booking.hasOne(db.Feedback, { foreignKey: 'booking_id', as: 'feedback' });
  db.Feedback.belongsTo(db.Booking, { foreignKey: 'booking_id', as: 'booking' });

  // User <-> Feedback
  db.User.hasMany(db.Feedback, { foreignKey: 'user_id', as: 'feedback' });
  db.Feedback.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

  // Field <-> Feedback
  db.Field.hasMany(db.Feedback, { foreignKey: 'field_id', as: 'feedback' });
  db.Feedback.belongsTo(db.Field, { foreignKey: 'field_id', as: 'field' });

  // Booking <-> Opponent
  db.Booking.hasOne(db.Opponent, { foreignKey: 'booking_id', as: 'opponent' });
  db.Opponent.belongsTo(db.Booking, { foreignKey: 'booking_id', as: 'booking' });

  // User <-> Opponent
  db.User.hasMany(db.Opponent, { foreignKey: 'user_id', as: 'opponent_requests' });
  db.Opponent.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

  // Booking <-> Product (Many-to-Many)
  db.Booking.belongsToMany(db.Product, { 
    through: db.BookingProduct,
    foreignKey: 'booking_id',
    otherKey: 'product_id',
    as: 'products'
  });

  db.Product.belongsToMany(db.Booking, {
    through: db.BookingProduct,
    foreignKey: 'product_id',
    otherKey: 'booking_id',
    as: 'bookings'
  });
};

// Call the function to define associations
defineAssociations();

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db; 