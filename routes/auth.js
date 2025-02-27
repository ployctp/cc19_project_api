const express = require('express')
const router = express.Router()

const{ register,login, currentUser } = require('../controllers/auth')

router.get('/register', register )
router.post('/login',login)
router.post('/current-user',currentUser)
router.post('/current-admin',currentUser)


// router.post('/register', register)
// router.post('/login',login)

module.exports = router