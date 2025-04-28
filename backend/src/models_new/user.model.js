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
      paranoid: true
    }
  );

  User.associate = function(models) {
    // User has many Bookings
    User.hasMany(models.Booking, {
      foreignKey: 'user_id',
      as: 'bookings'
    });
    
    // User has many BookingRatings
    User.hasMany(models.BookingRating, {
      foreignKey: 'user_id',
      as: 'ratings'
    });
    
    // User has many OpponentRequests
    User.hasMany(models.OpponentRequest, {
      foreignKey: 'user_id',
      as: 'opponent_requests'
    });
    
    // User has many Orders
    User.hasMany(models.Order, {
      foreignKey: 'user_id',
      as: 'orders'
    });
  };

  return User;
};
