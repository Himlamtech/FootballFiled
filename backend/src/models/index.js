const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../config/config');
const logger = require('../utils/logger');

const basename = path.basename(__filename);
const db = {};

// Create Sequelize instance
const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: 'mysql',
    logging: config.env === 'development' ? msg => logger.debug(msg) : false,
    timezone: '+07:00',
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      paranoid: true
    },
    pool: {
      max: config.db.pool.max,
      min: config.db.pool.min,
      acquire: config.db.pool.acquire,
      idle: config.db.pool.idle
    }
  }
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

// Define associations
db.User.hasMany(db.Booking, { foreignKey: 'user_id', as: 'bookings' });
db.Booking.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

db.Field.hasMany(db.Booking, { foreignKey: 'field_id', as: 'bookings' });
db.Booking.belongsTo(db.Field, { foreignKey: 'field_id', as: 'field' });

db.Booking.hasOne(db.Feedback, { foreignKey: 'booking_id', as: 'feedback' });
db.Feedback.belongsTo(db.Booking, { foreignKey: 'booking_id', as: 'booking' });

db.User.hasMany(db.Feedback, { foreignKey: 'user_id', as: 'feedback' });
db.Feedback.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

db.Field.hasMany(db.Feedback, { foreignKey: 'field_id', as: 'feedback' });
db.Feedback.belongsTo(db.Field, { foreignKey: 'field_id', as: 'field' });

db.Booking.hasOne(db.Opponent, { foreignKey: 'booking_id', as: 'opponent' });
db.Opponent.belongsTo(db.Booking, { foreignKey: 'booking_id', as: 'booking' });

db.User.hasMany(db.Opponent, { foreignKey: 'user_id', as: 'opponent_requests' });
db.Opponent.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

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

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db; 