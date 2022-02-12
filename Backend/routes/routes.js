const Spacecraft = require('../models/spacecraft');
const Astronaut = require('../models/astronaut');
const express = require('express');
const router = new express.Router();

router
    .get('/spacecrafts', async (req, res) => {
        const filters = {};
        let sort;

        const name = req.query?.name?.toLowerCase();
        const createdAt = req.query?.createdAt
            ? Date.parse(req.query.createdAt)
            : null;

        if (name) {
            filters.name = name;
        }

        if (createdAt) {
            filters.createdAt = createdAt;
        }

        sort = req.query?.sort?.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const page = req.query.page ? parseInt(req.query.page) * limit : null;

        try {
            const spacecrafts = await Spacecraft.findAll({
                order: [['name', sort]],
                limit,
                offset: page,
            });
            const filteredSpacecrafts = spacecrafts.filter((spacecraft) => {
                let isValid = true;
                for (key in filters) {
                    if (key === 'name') {
                        isValid =
                            isValid &&
                            spacecraft[key]?.trim()?.toLowerCase() ===
                            filters[key]?.trim()?.toLowerCase();
                    }
                    if (key === 'createdAt') {
                        const date1 = new Date(spacecraft[key]);
                        const date2 = new Date(filters[key]);
                        isValid =
                            isValid &&
                            date1.getFullYear() === date2.getFullYear() &&
                            date1.getMonth() === date2.getMonth() &&
                            date1.getDay() === date2.getDay();
                    }
                }
                return isValid;
            });
            filteredSpacecrafts.forEach((spacecraft) => {
                spacecraft.dataValues.createdAt = new Date(
                    spacecraft.dataValues.createdAt
                ).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                });
            });
            res.send(filteredSpacecrafts);
        } catch (err) {
            console.log(err);
            res.status(500).send({ err });
        }
    })

    .get('/spacecraft/:id', async (req, res) => {
        try {
            const spacecraft = await Spacecraft.findByPk(req.params.id);
            console.log(spacecraft);
            if (spacecraft) {
                return res.status(200).send(spacecraft);
            }
            res.status(400).send({ message: 'Spacecraft not found!' });
        } catch (err) {
            res.status(500).send({ err });
        }
    })

    .post('/spacecraft', async (req, res) => {
        try {
            const spacecraft = await Spacecraft.create({ ...req.body });
            res.status(201).send(spacecraft);
        } catch (err) {
            res.status(500).send({ err });
        }
    })

    .put('/spacecraft/:id', async (req, res) => {
        try {
            let spacecraft = await Spacecraft.findByPk(req.params.id);
            if (!spacecraft) {
                spacecraft = await Spacecraft.create({ ...req.body });
                res.status(201).send(spacecraft);
            } else {
                const updates = Object.keys(req.body);
                const allowedUpdates = ['name', 'maxSpeed', 'weigth'];
                const isValidUpdate = updates.every((update) =>
                    allowedUpdates.includes(update)
                );
                if (!isValidUpdate)
                    return res.status(400).send({ message: 'Invalid Updates' });
                updates.forEach((update) => (spacecraft[update] = req.body[update]));
                await spacecraft.save();
                res.status(202).send(spacecraft);
            }
        } catch (err) {
            res.status(500).send({ err });
        }
    })

    .delete('/spacecrafts', async (_req, res) => {
        try {
            await Spacecraft.truncate();
        } catch (err) {
            res.status(500).send({ err });
        }
    })

    .delete('/spacecraft/:id', async (req, res) => {
        try {
            const spacecraft = await Spacecraft.findByPk(req.params.id);
            console.log(spacecraft);
            if (!spacecraft) res.status(404).send({ message: 'Spacecraft not found!' });
            await spacecraft.destroy();
            res.send(spacecraft);
        } catch (err) {
            res.status(500).send({ err });
        }
    })

    .get('/spacecraft/:spacecraftId/astronauts', async (req, res) => {
        try {
            const spacecraft = await Spacecraft.findByPk(req.params.spacecraftId);
            if (spacecraft) {
                const astronauts = await spacecraft.getAstronauts();
                return res.send(astronauts);
            }
            res.status(400).send({ message: 'Spacecraft not found!' });
        } catch (err) {
            res.status(404).send({ err });
        }
    })

    .get('/spacecraft/:spacecraftId/astronauts/:astronautId', async (req, res) => {
        try {
            const spacecraft = await Spacecraft.findByPk(req.params.spacecraftId);
            if (spacecraft) {
                const astronauts = await spacecraft.getAstronau({ where: { id: req.params.astronautId } });
                const astronaut = astronauts.shift();
                if (astronaut) {
                    return res.send(astronaut);
                }
                return res.status(400).send({ message: 'Astronaut not found!' });
            }
            res.status(400).send({ message: 'Spacecraft not found!' });
        } catch (err) {
            res.status(500).send({ err });
        }
    })

    .post('/spacecraft/:spacecraftId/astronaut', async (req, res) => {
        try {
            const spacecraft = await Spacecraft.findByPk(req.params.spacecraftId);
            if (spacecraft) {
                const astronaut = await Astronaut.create({ spacecraftId: spacecraft.id, ...req.body });
                spacecraft.addAstronaut(astronaut);
                await spacecraft.save();
                return res.status(201).send(astronaut);
            }
            res.status(400).send({ message: 'Spacecraft not found!' });
        } catch (err) {
            res.status(500).send({ err });
        }
    })

    .put('/spacecraft/:spacecraftId/astronaut/:astronautId', async (req, res) => {
        try {
            let spacecraft = await Spacecraft.findByPk(req.params.spacecraftId);
            if (spacecraft) {
                const astronauts = await spacecraft.getAstronauts({ where: { id: req.params.astronautId } });
                const astronaut = astronauts.shift();
                if (!astronaut) {
                    astronaut = await Astronaut.create({ spacecraftId: spacecraft.id, ...req.body });
                    return res.status(201).send(astronaut);
                } else {
                    const updates = Object.keys(req.body);
                    const allowedUpdates = ['name', 'rol'];
                    const isValidUpdate = updates.every((update) =>
                        allowedUpdates.includes(update)
                    );
                    if (!isValidUpdate)
                        return res.status(400).send({ message: 'Invalid Updates' });
                    updates.forEach((update) => (astronaut[update] = req.body[update]));
                    await astronaut.save();
                    return res.status(202).send(astronaut);
                }
            }
            res.status(400).send({ message: 'Spacecraft not found!' });
        } catch (err) {
            console.log(err);
            res.status(500).send({ err });
        }
    })

    .delete('/spacecraft/:spacecraftId/astronaut/:astronautId', async (req, res) => {
        try {
            const spacecraft = await Spacecraft.findByPk(req.params.spacecraftId);
            if (spacecraft) {
                const astronauts = await spacecraft.getAstronauts({ where: { id: req.params.astronautId } });
                const astronaut = astronauts.shift();
                if (astronaut) {
                    await astronaut.destroy();
                    return res.send(astronaut);
                }
                return res.status(400).send({ message: 'Astronaut not found!' });
            }
            res.status(400).send({ message: 'Spacecraft not found!' });
        } catch (err) {
            res.status(500).send({ err });
        }
    })

    .post('/import', async (req, res) => {
        try {
            for (let _spacecraft of req.body) {
                const spacecraft = await Spacecraft.create(_spacecraft);
                for (let _astronaut of _spacecraft.astronauts) {
                    const astronaut = await Astronaut.create(_astronaut);
                    spacecraft.addAstronaut(astronaut);
                }
                await spacecraft.save();
            }
            res.send(201);
        } catch (err) {
            res.status(500).send({ err });
        }
    })

    .get('/export', async (_req, res) => {
        try {
            const result = [];
            const spacecrafts = await Spacecraft.findAll();
            for (let _spacecraft of spacecrafts) {
                const spacecraft = {
                    name: _spacecraft.name,
                    maxSpeed: _spacecraft.maxSpeed,
                    weigth: _spacecraft.weigth,
                    createdAt: _spacecraft.createdAt,
                    astronauts: [],
                };
                const astronauts = await _spacecraft.getAstronauts();
                for (let _astronaut of astronauts) {
                    spacecraft.astronauts.push({
                        id: _astronaut.id,
                        name: _astronaut.name,
                        rol: _astronaut.rol,
                        spacecraftId: _astronaut.spacecraftId,
                    });
                }
                result.push(spacecraft);
            }
            res.send(result);
        } catch (err) {
            res.status(500).send({ err });
        }
    });

module.exports = router;
