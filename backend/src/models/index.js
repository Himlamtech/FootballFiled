const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../config/config');
const logger = require('../utils/logger');

const basename = path.basename(__filename);
const db = {};

// Create options object for MySQL
const sequelizeOptions = {
  dialect: config.db.dialect,
  host: config.db.host,
  port: config.db.port,
  logging: config.db.logging ? msg => logger.debug(msg) : false,
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
  },
  timezone: '+07:00',
  pool: config.db.pool
};

// Create Sequelize instance
const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  sequelizeOptions
);

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
  if (!db.Admin || !db.Booking || !db.Field || !db.Feedback || !db.Product || !db.BookingProduct || !db.TimeSlot) {
    logger.warn('Some models are missing, skipping association definitions');
    return;
  }

  // Field <-> Booking
  db.Field.hasMany(db.Booking, { foreignKey: 'field_id', as: 'bookings' });
  db.Booking.belongsTo(db.Field, { foreignKey: 'field_id', as: 'field' });

  // TimeSlot <-> Booking
  db.TimeSlot.hasMany(db.Booking, { foreignKey: 'time_slot_id', as: 'bookings' });
  db.Booking.belongsTo(db.TimeSlot, { foreignKey: 'time_slot_id', as: 'time_slot' });

  // Field <-> Feedback
  db.Field.hasMany(db.Feedback, { foreignKey: 'field_id', as: 'feedbacks' });
  db.Feedback.belongsTo(db.Field, { foreignKey: 'field_id', as: 'field' });

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