module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define(
    "OrderItem", 
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id'
        }
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        }
      },
      product_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      }
    }, 
    {
      tableName: 'order_items',
      underscored: true,
      timestamps: true
    }
  );

  OrderItem.associate = function(models) {
    // OrderItem belongs to Order
    OrderItem.belongsTo(models.Order, {
      foreignKey: 'order_id',
      as: 'order'
    });
    
    // OrderItem belongs to Product
    OrderItem.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product'
    });
  };

  return OrderItem;
};
