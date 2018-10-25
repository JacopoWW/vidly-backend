const express = require('express')
const { User } = require('../models/user')
const Joi = require('joi')
const bcrypt = require('bcrypt')
const criteria = require('../middleware/validate')
const _ = require('lodash')

const router = express.Router()
const checkData = criteria(validate)

// 登录模块
router.post('/', checkData, async (req, res) => {
  let user = await User.findOne({ email: req.body.email })
  if (!user) {
    return res.status(400).send('Invalid email or password')
  } else {
    // 对比密码
    const valid = await bcrypt.compare(req.body.password, user.password) 
    
    if (!valid) {
      return res.status(400).send('Invalid email or password')      
    } else {
      // 生成jwt返回
      const token = user.generateAuthToken()
      return res.send(token)
    }
  }
})

function validate(req) {
  const schema = {
    email: Joi.string().min(5).max(255).email().required(),
    password: Joi.string().min(5).max(50).required(),
  }
  return Joi.validate(req, schema)
}


module.exports = router