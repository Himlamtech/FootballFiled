module.exports = (sequelize, DataTypes) => {
  const Opponent = sequelize.define(
    "Opponent", 
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      bookingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'booking_id'
      },
      teamName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'team_name'
      },
      contactEmail: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'contact_email',
        validate: {
          isEmail: true
        }
      },
      contactPhone: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'contact_phone'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('searching', 'matched', 'cancelled'),
        defaultValue: 'searching'
      },
      matchedWithId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'matched_with_id'
      }
    }, 
    {
      tableName: 'opponents',
      timestamps: true,
      underscored: true,
      paranoid: true
    }
  );

  Opponent.associate = (models) => {
    // Opponent belongs to a Booking
    Opponent.belongsTo(models.Booking, {
      foreignKey: 'booking_id',
      as: 'booking'
    });
    
    // Self-referential relationship for matched opponents
    Opponent.belongsTo(models.Opponent, {
      foreignKey: 'matched_with_id',
      as: 'matchedWith'
    });
  };

  return Opponent;
};
