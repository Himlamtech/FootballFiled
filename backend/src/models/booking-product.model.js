module.exports = (sequelize, DataTypes) => {
  const BookingProduct = sequelize.define(
    "BookingProduct",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      booking_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'bookings',
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
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: "Price at the time of booking"
      }
    },
    {
      tableName: 'booking_products',
      underscored: true,
      timestamps: true,
      paranoid: true,
      indexes: [
        {
          name: 'idx_booking_product_booking',
          fields: ['booking_id']
        },
        {
          name: 'idx_booking_product_product',
          fields: ['product_id']
        }
      ]
    }
  );

  return BookingProduct;
};