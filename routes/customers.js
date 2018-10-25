const express = require('express');
const auth = require('../middleware/auth')
const criteria = require('../middleware/validate')
const { Customer,  validate} = require('../models/customer')
const _ = require('lodash')


const router = express.Router();
const checkData = criteria(validate)
// 获取所有会员
router.get('/', async (req, res) => {
  // 把用户数据去掉__v返回回去
  const customers = await Customer.find().select('-__v').sort("name")
  return res.send(customers)
})

// 处理post请求, 添加新的customer消费记录的话需要用户权限
router.post('/', auth, checkData, async (req, res) => {
  let customer = _.pick(req.body, ['name', 'isGold', 'phone'])   
  customer = new Customer(customer)
  await customer.save()
  return res.send(customer)
})

// 处理put
router.put('/:id', auth, async (req, res) => {
  let update = _.pick(req.body, ['name', 'isGold', 'phone'])
  update = await Customer.findByIdAndUpdate(
    req.params.id, 
    update,
    { new: true }
  )
  if (update) {
    return res.send(update)
  } else {
    return res.status(404).send('The customer with the given Id was not found')
  }
});

router.delete('/:id', auth, async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id)
  if (customer) {
    return res.send(customer)
  } else {
    return res.status(404).send('The customer with the given id was not found')
  }
})

router.get('/:id', auth, async (req, res) => {
  const customer = await Customer.findById(req.params.id).select('-__v')
  if (customer) {
    return res.send(customer)
  } else {
    return res.status(404).send('not found this id')
  }
})

module.exports = router;