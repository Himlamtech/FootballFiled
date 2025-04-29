module.exports = (sequelize, DataTypes) => {
  const Finance = sequelize.define(
    "Finance",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      booking_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'bookings',
          key: 'id'
        }
      },
      transaction_type: {
        type: DataTypes.ENUM('income', 'expense'),
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      payment_method: {
        type: DataTypes.ENUM('cash', 'bank_transfer', 'momo', 'zalopay'),
        allowNull: false
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "Category of transaction (e.g., 'booking', 'product', 'maintenance', 'salary', etc.)"
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      transaction_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'refunded'),
        defaultValue: 'completed'
      }
    },
    {
      tableName: 'finances',
      underscored: true,
      timestamps: true,
      paranoid: true,
      indexes: [
        {
          name: 'idx_finances_booking_id',
          fields: ['booking_id']
        },
        {
          name: 'idx_finances_transaction_type',
          fields: ['transaction_type']
        },
        {
          name: 'idx_finances_transaction_date',
          fields: ['transaction_date']
        },
        {
          name: 'idx_finances_status',
          fields: ['status']
        }
      ]
    }
  );

  Finance.associate = (models) => {
    // Finance belongs to a Booking
    Finance.belongsTo(models.Booking, {
      foreignKey: 'booking_id',
      as: 'booking'
    });
  };

  return Finance;
};
