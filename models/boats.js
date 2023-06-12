"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Boats extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Users, {
        targetKey: "userId",
        foreignKey: "userId",
        onDelete: "CASCADE",
      });

      this.hasMany(models.Comments, {
        sourceKey: "boatId",
        foreignKey: "boatId",
      });
    }
  }
  Boats.init(
    {
      boatId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "userId",
        },
        onDelete: "CASCADE",
      },
      captain: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      title: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      content: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      keyword: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      crewNumber: {
        allowNull: false,
        type: DataTypes.NUMBER,
      },
      endDate: {
        type: DataTypes.STRING,
      },
      crew: {
        type: DataTypes.ARRAY,
      },
      address: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      isPrivate: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      softDelete: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "Boats",
    }
  );
  return Boats;
};
