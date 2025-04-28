module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order", 
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
      customer_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      customer_phone: {
        type: DataTypes.STRING,
        allowNull: true
      },
      customer_email: {
        type: DataTypes.STRING,
        allowNull: true
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'paid', 'cancelled', 'completed'),
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
      tableName: 'orders',
      underscored: true,
      timestamps: true,
      paranoid: true
    }
  );

  Order.associate = function(models) {
    // Order belongs to User (optional)
    Order.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    
    // Order has many OrderItems
    Order.hasMany(models.OrderItem, {
      foreignKey: 'order_id',
      as: 'items'
    });
  };

  return Order;
};
