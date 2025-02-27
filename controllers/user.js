const { check } = require("prisma")
const prisma = require("../config/prisma")
const { create } = require("./product")

exports.listUsers = async (req, res) => {
    try{
        const users = await prisma.user.findMany({
            select:{
                id:true,
                email:true,
                role:true,
                enabled:true,
                address:true
            }
        })
        res.json(users)
    }catch (err){
        console.log(err)
        res.status(500).json({message: 'Server Error'})
    }
}
exports.changeStatus = async (req, res) => {
    try{
        const{id,enabled} = req.body
        console.log(id,enabled)
        const user = await prisma.user.update({
            where:{ id:Number(id)},
            data:{enabled: enabled}
        })

        res.send('Update Status Success')
    }catch (err){
        console.log(err)
        res.status(500).json({message: 'Server Error'})
    }
}
exports.changeRole = async (req, res) => {
    try{
        const{id,role} = req.body
        console.log(id,role)
        const user = await prisma.user.update({
            where:{ id:Number(id)},
            data:{role: role}
        })

        res.send('Update Role Success')
    }catch (err){
        console.log(err)
        res.status(500).json({message: 'Server Error'})
    }
}
exports.userCart = async (req, res) => {
    try{
       const{cart} = req.body
       console.log(cart)
       
        const user = await prisma.user.findFirst({
            where:{id :Number(req.user.id)}
        })

        console.log(user)
        //delete old cart item
        await prisma.productOncart.deleteMany({
            where:{
                cart:{ 
                    orderedById : user.id 

                }
            }
        })
        //delete old Cart
        await prisma.cart.deleteMany({
            where:{
                orderedById:user.id
            }   
        })
        //เตรียมสินค้า
        let products = cart.map((item)=>({
            productId: item.id,
            count: item.count,
            price: item.price
        }))
        //หาผลรวม
        let cartTotal = products.reduce((sum, item) => 
            sum+item.price * item.count,0)


        //New cart
        const newCart = await prisma.cart.create({
            data:{
                products:{
                    create:products
                },
                cartTotal: cartTotal,
                orderedById: user.id
            }
        })
        ///เพิ่มสินค้าเข้ามาใหม่สินค้าเก่าจะหายไปทั้งหมด


        console.log(newCart)

       res.send('Add Cart Ok')
    }catch (err){
        console.log(err)
        res.status(500).json({message: 'Server Error'})
    }
}
//ดึงข้อมูลในตะกร้าสินค้า
exports.getUserCart = async (req, res) => {
    try{
        const cart  = await prisma.cart.findFirst({
            where:{
                orderedById: Number(req.user.id)
            },
            include:{
                products:{
                    include:{
                        product: true
                    }
                }
            }

        })
        // console.log(cart)
        res.send({
            products: cart.products,
            cartTotal: cart.cartTotal

        })
    }catch (err){
        console.log(err)
        res.status(500).json({message: 'Server Error'})
    }
}
//เคลียร์ข้อมูลในตะกร้าสินค้า
exports.emptyCart = async (req, res) => {
    try{
        const cart = await prisma.cart.findFirst({
            where:{
                orderedById: Number(req.user.id)
            }
        })
        if(!cart){
            return res.status(400).json({message:'No Cart'})
        }
        await prisma.productOncart.deleteMany({
            where:{
                 cartId : cart.id
            }
        })
        const result = await prisma.cart.deleteMany({
            where:{ orderedById: Number(req.user.id)}
        })

        console.log(result)
        res.json({
            message:'Cart Empty Success',
            deleteCount: result.count
        })
    }catch (err){
        console.log(err)
        res.status(500).json({message: 'Server Error'})
    }
}
exports.saveAddress = async (req, res) => {
    try{
        const{ address } = req.body
        console.log(address)
        const addressUser = await prisma.user.update({
            where:{
                id: Number(req.user.id)
            },
            data:{
                address: address
            }
        })

        res.json({ok:true,message:'Address update success'})
    }catch (err){
        console.log(err)
        res.status(500).json({message: 'Server Error'})
    }
}
exports.saveOrder = async (req, res) => {
    try{
        //step1 Get user cart
        const userCart = await prisma.cart.findFirst({
            where:{
                orderedById: Number(req.user.id)
                
            },
            include:{ products: true}
        })

        // check cart empty
        if(!userCart || userCart.products.length === 0){
            return res.status(400).json({ok:false,message:'Cart is Empty'})
        }

        // Check quantity
        for(const item of userCart.products){
            // console.log(item)
            const product = await prisma.product.findUnique({
                where:{id: item.productId},
                select:{ quantity:true, title:true}
            })
            console.log(item)
            console.log(product)
            if(!product || item.count > product.quantity){
                return res.status(400).json({
                    ok:false,
                    message:`Sorry,This  ${product?.title || 'Product = '} out of stock` 
                })
            }
        }

        // create a new Order 
        const order = await prisma.order.create({
            data:{
                products:{
                    create: userCart.products.map((item)=>({
                        productId: item.productId,
                        count: item.count,
                        price: item.price
                    }))
                },
                orderedBy:{
                    connect:{id: req.user.id}
                },
                cartTotal: userCart.cartTotal
            }
        })

        //update product
        const update =  userCart.products.map((item)=>({
            where:{ id: item.productId},
            data:{
                quantity:{ decrement: item.count},
                sold: {increment: item.count}
            }
        }))


        console.log(update)

        await Promise.all(
            update.map((updated)=> prisma.product.update(updated))
        )
        //และมาลบสินค้าในตะกร้า
        await prisma.cart.deleteMany({
            where:{orderedById: Number(req.user.id)}
        })

        res.send({ok:true, order})
    }catch (err){
        console.log(err)
        res.status(500).json({message: 'Server Error'})
    }
}
exports.getOrder = async (req, res) => {
    try{
        const orders = await prisma.order.findMany({
            where: { orderedById: Number(req.user.id) },
            include: {
              products: {
                include: {
                  product: true,
                }
              }
            }
          })
        if(orders.length ===0){
            return res.status(400).json({ok: false, message:'No orders'})

        }
        res.json({ok: true, orders})
      
    }catch (err){
        console.log(err)
        res.status(500).json({message: 'Server Error'})
    }
}

