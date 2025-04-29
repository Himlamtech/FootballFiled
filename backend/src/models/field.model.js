module.exports = (sequelize, DataTypes) => {
  const Field = sequelize.define(
    "Field",
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
      location: {
        type: DataTypes.STRING,
        allowNull: false
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "Number of players the field can accommodate"
      },
      size: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Field size, e.g. '5-a-side', '7-a-side', '11-a-side'"
      },
      price_per_hour: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      price_per_hour_weekend: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('available', 'maintenance'),
        defaultValue: 'available'
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      tableName: 'fields',
      timestamps: true,
      underscored: true,
      paranoid: true
    }
  );

  return Field;
};