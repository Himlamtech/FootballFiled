module.exports = {
  HOST: process.env.DB_HOST || "127.0.0.1",
  PORT: process.env.DB_PORT || "3306",
  USER: process.env.DB_USER || "root",
  PASSWORD: process.env.DB_PASSWORD || "Himlam04@",
  DB: process.env.DB_NAME || "FootballField",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: process.env.NODE_ENV === 'development'
}; 