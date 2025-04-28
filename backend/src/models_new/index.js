const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../config/config');
const logger = require('../utils/logger');

const basename = path.basename(__filename);
const db = {};

// Sequelize options
const sequelizeOptions = {
  dialect: config.db.dialect,
  logging: config.db.logging ? (msg) => logger.debug(msg) : false,
  define: {
    underscored: true,
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
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

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
