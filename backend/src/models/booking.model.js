module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define(
    "Booking",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      field_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'fields',
          key: 'id'
        }
      },
      time_slot_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'time_slots',
          key: 'id'
        }
      },
      booking_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      customer_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      customer_phone: {
        type: DataTypes.STRING,
        allowNull: false
      },
      customer_email: {
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
        type: DataTypes.ENUM('cash', 'bank_transfer', 'momo', 'zalopay'),
        defaultValue: 'cash'
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
          name: 'idx_booking_field',
          fields: ['field_id']
        },
        {
          name: 'idx_booking_time_slot',
          fields: ['time_slot_id']
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