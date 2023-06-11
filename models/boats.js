'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Boats extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Boats.init({
    title: DataTypes.STRING,
    content: DataTypes.STRING,
    keyword: DataTypes.STRING,
    crewNumber: DataTypes.NUMBER,
    endDate: DataTypes.STRING,
    crew: DataTypes.ARRAY,
    address: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Boats',
  });
  return Boats;
};