module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User", 
    {
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
        unique: true,
        validate: {
          isEmail: true
        }
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
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user',
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'banned'),
        defaultValue: 'active',
        allowNull: false
      },
      avatar_url: {
        type: DataTypes.STRING,
        allowNull: true
      }
    }, 
    {
      tableName: 'users',
      underscored: true,
      timestamps: true,
      paranoid: true,
      indexes: [
        {
          name: 'idx_user_email',
          unique: true,
          fields: ['email']
        },
        {
          name: 'idx_user_status',
          fields: ['status']
        },
        {
          name: 'idx_user_role',
          fields: ['role']
        }
      ]
    }
  );

  return User;
}; 