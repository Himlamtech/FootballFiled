module.exports = (sequelize, DataTypes) => {
  const OpponentRequest = sequelize.define(
    "OpponentRequest", 
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
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      team_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      player_count: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      skill_level: {
        type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('searching', 'matched', 'cancelled'),
        defaultValue: 'searching'
      }
    }, 
    {
      tableName: 'opponent_requests',
      underscored: true,
      timestamps: true
    }
  );

  OpponentRequest.associate = function(models) {
    // OpponentRequest belongs to Booking
    OpponentRequest.belongsTo(models.Booking, {
      foreignKey: 'booking_id',
      as: 'booking'
    });
    
    // OpponentRequest belongs to User (optional)
    OpponentRequest.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return OpponentRequest;
};
