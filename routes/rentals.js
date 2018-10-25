const express = require('express')
const mongoose = require('mongoose')
const Fawn = require("fawn")
const auth = require('../middleware/auth')
const criteria = require('../middleware/validate')
const { Rental, validate } = require('../models/rental')
const { Customer } = require('../models/customer')
const { Movie } = require('../models/movie')
const _ = require('lodash')

const router = express.Router()
const checkData = criteria(validate)

Fawn.init(mongoose)

router.get('/', async (req, res) => {
  const rentals = await Rental.find().select('-__v').sort('-dateOut')
  return res.send(rentals)
});

router.post('/', auth, checkData, async (req, res) => {
  const customer = await Customer.findById(req.body.customerId)
  if (!customer) {
    return res.status(400).send("Invalid customer")
  } else {

    let movie = await Movie.findById(req.body.movieId)
    if (!movie) {
      return res.status(400).send('Invalid movie')
    }
    let customer = await Customer.findById(req.body.customerId)
    if (!customer) {
      return res.status(400).send('Invalid movie')
    }

    if (movie.numberInStock === 0) {
      return res.status(400).send("Movie not in stock")
    } else {
      movie = _.pick(movie, ['_id', 'title', 'dailyRentalRate'])
      customer = _.pick(customer, ['_id', 'title', 'phone'])
      const rental = new Rental({ customer, movie })
      
      try {
        new Fawn.Task()
          .save('rentals', rental)
          .update(
            'movies',
            {_id: movie._id},
            {$inc: { numberInStock: -1} }
          ).run()
        return res.send(rental)
      } catch(e) {
        return res.status(500).send('Something failed')
      }
    }
  }
});

router.get('/:id', async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (rental) {
    return res.send(rental);
  } else {
    return res.status(404).send('The rental with the given ID was not found.');
  }
});

module.exports = router;