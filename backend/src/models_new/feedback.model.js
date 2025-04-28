module.exports = (sequelize, DataTypes) => {
  const Feedback = sequelize.define(
    "Feedback", 
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
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('new', 'read', 'responded'),
        defaultValue: 'new'
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      }
    }, 
    {
      tableName: 'feedback',
      underscored: true,
      timestamps: true
    }
  );

  return Feedback;
};
