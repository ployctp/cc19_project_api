const express = require('express')
const router = express.Router()

const { create, list,read,update , remove, listby, searchFilter} = require('../controllers/product')

router.post('/product',create)
router.get('/products/:count',list)
router.get('/product/:id', read)
router.put('/product/:id', update)
router.delete('/product/:id',remove)
router.post('/productby',listby)
router.post('/search/filters',searchFilter)



module.exports = router