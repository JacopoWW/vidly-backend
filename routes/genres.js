const express = require('express');
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const validateObjectId = require('../middleware/validateObjectID')
const { Genre, validate } = require('../models/genre')
const checkData = require('../middleware/validate')(validate)


const router = express.Router();

router.get('/', async (req, res) => {
  const genres = await Genre.find().select('-__v').sort('name')
  return res.send(genres)
});

router.post('/', auth, checkData, async (req, res) => {
  const genre = new Genre({ name: req.body.name });
  await genre.save()
  return res.send(genre);
});

router.put('/:id', auth, validateObjectId, checkData, async (req, res) => {
  const genre = await Genre.findByIdAndUpdate(req.params.id, { name: req.body.name}, {
    new: true
  });
  if (genre) {
    return res.send(genre)
  } else {
    return res.status(404).send('The genre with the given ID was not found.');
  }
});

router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id)
  if (!genre) {
    return res.status(404).send('The genre with the given ID was not found.');
  } else {
    return res.send(genre)
  }
});

router.get('/:id', validateObjectId, async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (genre) {
    return res.send(genre);
  } else {
    return res.status(404).send('The genre with the given ID was not found.');
  }
});

module.exports = router;