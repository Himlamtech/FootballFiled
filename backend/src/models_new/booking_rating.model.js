module.exports = (sequelize, DataTypes) => {
  const BookingRating = sequelize.define(
    "BookingRating", 
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
        },
        unique: true
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
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        }
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, 
    {
      tableName: 'booking_ratings',
      underscored: true,
      timestamps: true
    }
  );

  BookingRating.associate = function(models) {
    // BookingRating belongs to Booking
    BookingRating.belongsTo(models.Booking, {
      foreignKey: 'booking_id',
      as: 'booking'
    });
    
    // BookingRating belongs to User (optional)
    BookingRating.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    
    // BookingRating belongs to Field
    BookingRating.belongsTo(models.Field, {
      foreignKey: 'field_id',
      as: 'field'
    });
  };

  return BookingRating;
};
