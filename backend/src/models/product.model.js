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
        type: DataTypes.ENUM('equipment', 'drinks', 'food', 'service'),
        allowNull: false
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
      paranoid: true,
      indexes: [
        {
          name: 'idx_product_category',
          fields: ['category']
        },
        {
          name: 'idx_product_availability',
          fields: ['is_available']
        }
      ]
    }
  );

  return Product;
}; 