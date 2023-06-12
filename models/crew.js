"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Crew extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Crew.init(
    {
      crewId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      boatId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: "Boats",
          key: "boatId",
        },
        onDelete: "CASCADE",
      },
      nickName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      isReleased: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
    },
    {
      timestamps: false,
      sequelize,
      modelName: "Crew",
    }
  );
  return Crew;
};
