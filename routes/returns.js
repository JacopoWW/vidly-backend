const express = require('express')
const auth = require('../middleware/auth')
const criteria = require('../middleware/validate')
const { Rental } = require('../models/rental')
const { Movie } = require('../models/movie')
const Joi = require('joi')

const router = express.Router()
const checkData = criteria(validate)


router.post('/', [auth, checkData], async (req, res) => {
  const rental = await Rental.lookup(req.body.customerId, req.body.movieId)
  if (!rental) {
    return res.status(404).send('Rental not found')
  } else if (rental.dateReturned) {
    return res.status(400).send('Return already processed')
  } else {
    rental.return()
    await rental.save()
    await Movie.update(
      {_id: rental.movie._id},
      {$inc: {numberInStock: 1}}
    )
    return res.send(rental)
  }
})


function validate(data) {
  const schema = {
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  }
  return Joi.validate(data, schema)
}

module.exports = router;