const bcrypt = require('bcrypt');
const JwtServices=require('../services/jwtservices');
const User=require('../models/user');


const postUserSignup = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({message:'Something is missing! Please fill all the details to proceed'});
    }
    try {
        const user = await User.findOne({email});
        if (user) {
            return res.status(400).json({message:'User already exists. Please login!'})
        }
        const saltrounds = 10;
        bcrypt.hash(password, saltrounds, async (err, hash) => {
            console.log(err);
            const user= await User.create({ name, email, password: hash });
            res.status(201).json({message:'User created succesfully',token:JwtServices.generateToken(user._id,user.name,user.isPremiumUser)});
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({message:'Something went wrong!',error:error} );
    }
}

const postUserLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({message:'Kindly enter your email and password to proceed'});
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({message:'User not found.Please register'});
        }
        bcrypt.compare(password, user.password, (err, result) => {
            if(err){
                throw new Error();
            }
            if (result) {
                res.status(200).json({message:'User login successfully',token:JwtServices.generateToken(user._id,user.name,user.isPremiumUser)});
            } else {
                res.status(401).json({message:'Password is incorrect. Please try again!'});
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Something went wrong. Please try again!'});
    }
}

module.exports={
    postUserSignup,
    postUserLogin
}