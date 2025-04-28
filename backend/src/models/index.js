const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");
const logger = require("../utils/logger");

// Create Sequelize instance
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: dbConfig.dialect,
  operatorsAliases: 0,
  logging: dbConfig.logging ? msg => logger.debug(msg) : false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require("./user.model.js")(sequelize, Sequelize);
db.Field = require("./field.model.js")(sequelize, Sequelize);
db.Product = require("./product.model.js")(sequelize, Sequelize);
db.Booking = require("./booking.model.js")(sequelize, Sequelize);
db.Feedback = require("./feedback.model.js")(sequelize, Sequelize);
db.Opponent = require("./opponent.model.js")(sequelize, Sequelize);
db.BookingProduct = require("./booking-product.model.js")(sequelize, Sequelize);

// Define associations

// User <-> Booking
db.User.hasMany(db.Booking, { foreignKey: 'userId', as: 'bookings' });
db.Booking.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// Field <-> Booking
db.Field.hasMany(db.Booking, { foreignKey: 'fieldId', as: 'bookings' });
db.Booking.belongsTo(db.Field, { foreignKey: 'fieldId', as: 'field' });

// Booking <-> Feedback (one-to-one)
db.Booking.hasOne(db.Feedback, { foreignKey: 'bookingId', as: 'feedback' });
db.Feedback.belongsTo(db.Booking, { foreignKey: 'bookingId', as: 'booking' });

// Booking <-> Opponent (one-to-one)
db.Booking.hasOne(db.Opponent, { foreignKey: 'bookingId', as: 'opponent' });
db.Opponent.belongsTo(db.Booking, { foreignKey: 'bookingId', as: 'booking' });

// Booking <-> Product (many-to-many)
db.Booking.belongsToMany(db.Product, { 
  through: db.BookingProduct,
  foreignKey: 'bookingId',
  otherKey: 'productId',
  as: 'products'
});
db.Product.belongsToMany(db.Booking, {
  through: db.BookingProduct,
  foreignKey: 'productId',
  otherKey: 'bookingId',
  as: 'bookings'
});

module.exports = db; 