module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product", 
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
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      category: {
        type: DataTypes.ENUM('equipment', 'clothes', 'shoes', 'food', 'service'),
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('buy', 'rent'),
        allowNull: false,
        defaultValue: 'buy'
      },
      stock_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      is_available: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    }, 
    {
      tableName: 'products',
      underscored: true,
      timestamps: true,
      paranoid: true
    }
  );

  Product.associate = function(models) {
    // Product belongs to many Bookings (through BookingProduct)
    Product.belongsToMany(models.Booking, {
      through: models.BookingProduct,
      foreignKey: 'product_id',
      otherKey: 'booking_id',
      as: 'bookings'
    });
    
    // Product has many OrderItems
    Product.hasMany(models.OrderItem, {
      foreignKey: 'product_id',
      as: 'order_items'
    });
  };

  return Product;
};
