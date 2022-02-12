const sequelize = require('../db/db').sequelize;
const { DataTypes } = require('sequelize');

const Spacecraft = sequelize.define(
	'Spacecraft',
	{
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
					if (val.length < 3) {
						throw new Error('Name is too short!');
					}
				},
			},
		},
		maxSpeed: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				min: 1000,
			},
		},
		weigth: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				min: 200,
			},
		},
	},
	{ timestamps: true }
);

Spacecraft.associate = () => {
	const { Astronaut } = sequelize.models;
	Spacecraft.hasMany(Astronaut, { foreignKey: 'spacecraftId', onDelete: 'CASCADE' });
};

module.exports = Spacecraft;