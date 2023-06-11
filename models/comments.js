"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Comments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Users, {
        targetKey: "snsId",
        foreignKey: "snsId",
        onDelete: "CASCADE",
      });

      this.belongsTo(models.Boats, {
        targetKey: "boatId",
        foreignKey: "boatId",
        onDelete: "CASCADE",
      });
    }
  }
  Comments.init(
    {
      commentId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      snsId: {
        allowNull: false,
        type: DataTypes.STRING,
        references: {
          model: "Users",
          key: "snsId",
        },
        onDelete: "CASCADE",
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
      comment: {
        type: DataTypes.STRING,
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
      modelName: "Comments",
    }
  );
  return Comments;
};
