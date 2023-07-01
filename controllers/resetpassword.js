const User=require('../models/user');
const ForgotPassword = require('../models/forgotpassword');
const SibServices = require('../services/sibservices');
// const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const postForgotPassword = async (req, res) => {
    const email = req.body.email;
    if (!email) {
        return res.status(400).json({ message: 'Please enter your email to proceed' });
    }
    try {
        const user = await User.findOne({email})
        if (!user) {
            return res.status(404).json({ message: "Sorry! User not found" });
        }
        const newForgotPassword = await ForgotPassword.create({userId:user, isActive: true });
        const id = newForgotPassword._id.toString();
        const resetEmail= await SibServices.resetpasswordEmail(user,id);
        setTimeout(() => {
            newForgotPassword.isActive=false;
            newForgotPassword.save();
        }, 1000*60*2);
        res.status(200).json({ message: 'Reset passsword email sent succesfully' });
    }
    catch (err) {
        console.log(err);
        res.status(504).json({ message: 'Something went wrong!', error: err });
    }
}

const getResetPassword = async (req, res) => {
    try {
        const id = req.params.id;
        const forgotpassword = await ForgotPassword.findById(id);
        // console.log(forgotpassword.isActive);
        if (forgotpassword && forgotpassword.isActive === true) {
            res.cookie('id',id);
            res.redirect('/login/resetpassword.html');
        } else {
            res.status(401).json('Invalid Request');
        }
    }
    catch (error) {
        console.log(error);
        res.status(401).json('Invalid request');
    }
}

const postUpdatePassword = async(req, res) => {
    try {
        const { id } = req.params;
        // console.log(id, req.params);
        const { newpassword } = req.body;
        if (!newpassword) {
            return res.status(400).json('Please enter the password');
        }
        const forgotpassword = await ForgotPassword.findById(id);
        const user = await User.findById(forgotpassword.userId);
        bcrypt.hash(newpassword, 10, async (err, hash) => {
            if (err) {
                console.log(err);
                throw new Error('Something went wrong');
            };
            user.password=hash;
            forgotpassword.isActive=false;            
            const response = await Promise.all([
               forgotpassword.save(),
               user.save()
            ])
            // console.log(response);
            res.status(201).json('Password updated successfully.Please login again')
            
        })
    } catch (error) {
        console.log(error);
        res.status(500).json('Something went wrong!');
    }
}

module.exports={
    postForgotPassword,
    getResetPassword,
    postUpdatePassword
}