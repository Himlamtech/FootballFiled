module.exports = (sequelize, DataTypes) => {
  const Opponent = sequelize.define("Opponent", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Changed to true to allow ON DELETE SET NULL
      references: {
        model: 'users',
        key: 'id'
      }
    },
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'bookings',
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
    contact_phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    preferred_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    preferred_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('open', 'matched', 'completed', 'cancelled'),
      defaultValue: 'open',
      allowNull: false
    },
    matched_opponent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'opponents',
        key: 'id'
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'opponents',
    underscored: true,
    timestamps: true,
    paranoid: true
  });

  return Opponent;
};