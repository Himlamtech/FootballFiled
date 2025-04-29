module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define(
    "Admin", 
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: true
        }
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true
      }
    }, 
    {
      tableName: 'admin',
      timestamps: true,
      underscored: true,
      paranoid: true
    }
  );

  return Admin;
};
