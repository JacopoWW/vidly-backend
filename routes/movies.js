const express = require('express')
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const criteria = require('../middleware/validate')
const validateObjectId = require('../middleware/validateObjectID')
const { Genre }  = require('../models/genre')
const { Movie, validate } = require('../models/movie')
const _ = require('lodash')
const moment = require('moment')

const router = express.Router()
const checkData = criteria(validate)

router.get('/', async (req, res) => {
  const movies = await Movie.find().select('-__v').sort("title")
  return res.send(movies)
})

router.get('/:id', validateObjectId, async (req, res) => {
  const movie = await Movie.findById(req.params.id).select('-__v')
  if (movie) {
    return res.send(movie)
  } else {
    return res.status(404).send('invalidated Id')
  }
})

router.post('/', auth, checkData, async (req, res) => {
  const genre = await Genre.findById(req.body.genreId)
  if (!genre) {
    return res.status(404).send('invalidate genre')
  } else {
    const { title, numberInStock, dailyRentalRate } = req.body
    const movie = new Movie({
      title, numberInStock, dailyRentalRate,
      genre: { _id: genre._id, name: genre.name},
      publishDate: moment().toJSON()
    })
    await movie.save()
    return res.send(movie)
  }
})

router.put('/:id', [auth, checkData], async (req, res) => {
  const genre = await Genre.findById(req.body.genreId)
  if (!genre) {
    return res.status(404).send('invalidate genre')
  } else {
    const { title, numberInStock, dailyRentalRate } = req.body
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,{
      title, numberInStock, dailyRentalRate,
      genre: { _id: genre._id, name: genre.name}},
      {new: true}
    )

    if (movie) {
      return res.send(movie)
    } else {
      return res.status(404).send('The movie with the given ID was not found.')
    }
  }
})

router.delete('/:id', [auth, admin], async (req, res) => {
  const movie = await Movie.findByIdAndRemove(req.params.id)
  if (movie) {
    return res.send(movie)
  } else {
    return res.status(404).send('The movie with the given ID was not found.')
  }
})

module.exports = router