const prisma = require('../config/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.register = async(req,res)=>{
   //code 
   try{

    //code
    const {email,password} =req.body
    //Stap validate body
    if(!email){
        return res.status(400).json({message: 'Email is required !!!'})

    }
    if(!password){
        return res.status(400).json({message: "password is requied !!!"})

    }

    //check Email in DB already
    const user = await prisma.user.findFirst({
        where:{
            email: email
        }
    })
    if(user){
        return res.status(400).json({message:"Email already exits!"})
    }
    //HashPassword
    const hashpassword = await bcrypt.hash(password, 10);
    // console.log(hashpassword)

    //register
    await prisma.user.create({
        data:{
            email: email,
            password: hashpassword
        }
    })
    
    res.send('Register Success')

   }catch (err){
    console.log(err)
    res.status(500).json({message:"Sever Error"})
   }
}

exports.login = async(req,res)=>{
    //code 
    try{
     //code
     const{email, password} = req.body

        //check Email
        const user =await prisma.user.findFirst({
            where:{
                email:email
            }
        })
        if(!user || !user.enabled){
            return res.status(400).json({message: 'User Not found or not Enabled'})
        }
        //check password
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({message:'passsword Invalid!!'})
        }
        //create payload
        const payload={
            id: user.id,
            email: user.email,
            role: user.role
        }
       
        //generate token
        jwt.sign(payload,process.env.SECRET,{expiresIn:'1d'},(err,token)=>{
            if(err){
                return res.status(500).json({message:"server Error"})
            }
            res.json({payload, token})
        })

    }catch (err){
     console.log(err)
     res.status(500).json({message:"Sever Error"})
    }
 }


 exports.currentUser = async(req,res)=>{
    try{
        //code
        res.send('hello current user')
    }catch(err){
        console.log(err)
        res.status(500).json({message:"Sever Error"})
    }
 }

