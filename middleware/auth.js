const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = function(req, res, next) {
  if (!config.get("requiresAuth")) return next()

  const token = req.header('x-auth-token')
  if (!token) {
    return res.status(401).send('Access failed Because no auth token')
  } else {
    try {
      // 解析jwt尝试在服务器中的 jwt 中查询
      const decoded = jwt.verify(token, config.get('jwtPrivateKey'))
      req.user = decoded
      next()
    } catch (error) {
      return res.status(400).send('Invalid token')
    }
  }
}