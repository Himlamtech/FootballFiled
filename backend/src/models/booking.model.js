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
        allowNull: false,
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
          name: 'idx_booking_user',
          fields: ['user_id']
        },
        {
          name: 'idx_booking_field',
          fields: ['field_id']
        },
        {
          name: 'idx_booking_date',
          fields: ['booking_date']
        },
        {
          name: 'idx_booking_status',
          fields: ['status']
        }
      ]
    }
  );

  return Booking;
}; 