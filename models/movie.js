const Joi = require('joi')
const mongoose = require('mongoose')
const { genreSchema } = require('./genre')

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 50
  },
  genre: {
    type: genreSchema,
    required: true
  },
  numberInStock: {
    type: Number,
    required: true,
    min: 0,
    max: 255
  },
  dailyRentalRate: { 
    type: Number, 
    required: true,
    min: 0,
    max: 255
  }
})
const Movie = mongoose.model("Movie", movieSchema)

function movieValidate(movie) {
  const schema = {
    title: Joi.string().max(50).required(),
    genreId: Joi.objectId().required(),
    numberInStock: Joi.number().min(0).required(),
    dailyRentalRate: Joi.number().min(0).required()
  }
  return Joi.validate(movie, schema)
}

exports.Movie = Movie
exports.movieSchema = movieSchema
exports.validate = movieValidate