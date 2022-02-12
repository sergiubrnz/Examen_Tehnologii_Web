const sequelize = require('../db/db').sequelize;
const { DataTypes } = require('sequelize');

const Astronaut = sequelize.define('Astronaut', {
	id: {
		type: DataTypes.INTEGER,
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
		validate: {
			hasMinLength(val) {
				if (val.length < 5) {
					throw new Error('Name is too short!');
				}
			},
		},
	},
	rol: {
		type: DataTypes.ENUM(
			'commander',
			'pilot',
			'tester',
		),
		allowNull: false,
	},
	spacecraftId: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
});

Astronaut.associate = () => {
	const { Spacecraft } = sequelize.models;
	Astronaut.belongsTo(Spacecraft, { foreignKey: 'spacecraftId' });
};

module.exports = Astronaut;
