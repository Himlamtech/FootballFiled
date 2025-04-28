module.exports = (sequelize, DataTypes) => {
  const Field = sequelize.define("Field", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    size: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Field size, e.g. '5-a-side', '7-a-side'"
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Number of players the field can accommodate"
    },
    hourly_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('available', 'maintenance', 'booked'),
      defaultValue: 'available'
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'fields',
    underscored: true,
    timestamps: true,
    paranoid: true
  });

  Field.associate = function(models) {
    // Field has many Bookings
    Field.hasMany(models.Booking, {
      foreignKey: 'field_id',
      as: 'bookings'
    });
    
    // Field has many BookingRatings
    Field.hasMany(models.BookingRating, {
      foreignKey: 'field_id',
      as: 'ratings'
    });
  };

  return Field;
};
