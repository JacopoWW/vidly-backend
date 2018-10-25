const express = require('express')
const auth = require('../middleware/auth')
const criteria = require('../middleware/validate')
const { User, validate } = require('../models/user')
const bcrypt = require('bcrypt')
const _ = require('lodash')

const router = express.Router()
const checkData = criteria(validate)

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password')
  return res.send(user)
})

// 注册模块
router.post('/', checkData, async (req, res) => {
  let user = await User.findOne({ email: req.body.email })
  if (user) {
    return res.status(400).send('this email had been registered')
  } else {
    user = new User(_.pick(req.body, ['name', 'email', 'password']))
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)
    await user.save()
    const token = user.generateAuthToken()
    return res.header('x-auth-token', token)
              .header('access-control-expose-headers','x-auth-token')
              .send(_.pick(user, ['_id', 'name', 'email']));
  }
})

module.exports = router