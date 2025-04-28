module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define(
    "Booking", 
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      field_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'fields',
          key: 'id'
        }
      },
      booking_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      start_time: {
        type: DataTypes.TIME,
        allowNull: false
      },
      end_time: {
        type: DataTypes.TIME,
        allowNull: false
      },
      customer_name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
        defaultValue: 'pending'
      },
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      payment_status: {
        type: DataTypes.ENUM('pending', 'paid', 'refunded'),
        defaultValue: 'pending'
      },
      payment_method: {
        type: DataTypes.ENUM('cash', 'credit_card', 'bank_transfer', 'e_wallet'),
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, 
    {
      tableName: 'bookings',
      underscored: true,
      timestamps: true,
      paranoid: true,
      indexes: [
        {
          name: 'idx_booking_date',
          fields: ['booking_date']
        },
        {
          name: 'idx_booking_status',
          fields: ['status']
        },
        {
          name: 'idx_booking_payment',
          fields: ['payment_status']
        }
      ]
    }
  );

  Booking.associate = function(models) {
    // Booking belongs to User (optional - guest bookings possible)
    Booking.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    
    // Booking belongs to Field
    Booking.belongsTo(models.Field, {
      foreignKey: 'field_id',
      as: 'field'
    });
    
    // Booking has one BookingRating
    Booking.hasOne(models.BookingRating, {
      foreignKey: 'booking_id',
      as: 'rating'
    });
    
    // Booking has one OpponentRequest
    Booking.hasOne(models.OpponentRequest, {
      foreignKey: 'booking_id',
      as: 'opponent_request'
    });
    
    // Booking has many Products (through BookingProduct)
    Booking.belongsToMany(models.Product, {
      through: models.BookingProduct,
      foreignKey: 'booking_id',
      otherKey: 'product_id',
      as: 'products'
    });
  };

  return Booking;
};
