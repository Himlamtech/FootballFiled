module.exports = (sequelize, DataTypes) => {
  const TimeSlot = sequelize.define(
    "TimeSlot", 
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      start_time: {
        type: DataTypes.TIME,
        allowNull: false
      },
      end_time: {
        type: DataTypes.TIME,
        allowNull: false
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    }, 
    {
      tableName: 'time_slots',
      timestamps: true,
      underscored: true,
      paranoid: true
    }
  );

  return TimeSlot;
};
