const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Finance = sequelize.define('Finance', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    transaction_type: {
      type: DataTypes.ENUM('booking', 'product_sale', 'expense', 'other'),
      allowNull: false,
      defaultValue: 'other'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    reference_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Reference ID (e.g., booking ID, order ID)'
    },
    reference_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Reference name (e.g., customer name)'
    },
    status: {
      type: DataTypes.ENUM('completed', 'pending', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'finances',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Finance;
};
