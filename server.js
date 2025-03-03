//import
const express = require('express')
const app = express ()
const morgan = require('morgan')
const cors = require("cors");


const authRouter = require ('./routes/auth')
const categoryRouter = require('./routes/category')
const productRouter =  require('./routes/product')
const userRouter = require('./routes/user')
const adminRouter = require('./routes/admin')

app.use(morgan('dev'))
app.use(express.json())
app.use(cors());

app.use('/api',authRouter)
app.use('/api',categoryRouter)
app.use('/api',productRouter)
app.use('/api',userRouter)
app.use('/api',adminRouter)

app.listen(5001,
    ()=> console.log ('Sever is running on port 5001')
)