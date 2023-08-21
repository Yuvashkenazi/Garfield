'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.removeColumn('Settings', 'voteStartTime');
    queryInterface.addColumn('Settings', 'voteStartTime', Sequelize.DataTypes.NUMBER);

    queryInterface.removeColumn('Settings', 'MiMaMuStartTime');
    queryInterface.addColumn('Settings', 'MiMaMuStartTime', Sequelize.DataTypes.NUMBER);
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn('Settings', 'voteStartTime');
    queryInterface.addColumn('Settings', 'voteStartTime', Sequelize.DataTypes.STRING);

    queryInterface.removeColumn('Settings', 'MiMaMuStartTime');
    queryInterface.addColumn('Settings', 'MiMaMuStartTime', Sequelize.DataTypes.STRING);
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
