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
      snsId: {
        allowNull: false,
        type: Sequelize.STRING,
        references: {
          model: "Users",
          key: "snsId",
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
