const config = require('./config');

module.exports = {
  development: {
    username: config.db.username,
    password: config.db.password,
    database: config.db.database,
    host: config.db.host,
    port: config.db.port,
    dialect: 'mysql',
    logging: console.log,
    timezone: '+07:00',
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at'
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  test: {
    username: config.db.username,
    password: config.db.password,
    database: 'football_field_test',
    host: config.db.host,
    dialect: 'mysql',
    logging: false,
    timezone: '+07:00',
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at'
    }
  },
  production: {
    username: config.db.username,
    password: config.db.password,
    database: config.db.database,
    host: config.db.host,
    dialect: 'mysql',
    logging: false,
    timezone: '+07:00',
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at'
    },
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 30000
    }
  }
}; 