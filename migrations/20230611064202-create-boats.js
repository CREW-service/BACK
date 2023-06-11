"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Boats", {
      boatId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "userId",
        },
        onDelete: "CASCADE",
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      content: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      keyword: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      crewNumber: {
        allowNull: false,
        type: Sequelize.NUMBER,
      },
      endDate: {
        type: Sequelize.STRING,
      },
      crew: {
        type: Sequelize.ARRAY,
      },
      address: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      isPrivate: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      softDelete: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Boats");
  },
};
