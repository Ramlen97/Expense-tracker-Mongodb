const RazorpayServices = require('../services/razorpayservices');
const User=require('../models/user');
const Order=require('../models/order');
const JwtServices=require('../services/jwtservices');

const getPremiumMembership = async (req, res) => {
    try {
        const amount = 2500;
        const order = await RazorpayServices.createOrder(amount);
        // console.log(order);
    
        await Order.create({userId:req.user, orderId: order.id, status: "PENDING" });
        res.status(201).json({ order, key_id: process.env.RAZORPAY_KEY_ID });

    } catch (error) {
        console.log(error);
        res.status(403).json({ message: 'Something went wrong!' });
    }
}

const postUpdateTransaction = async (req, res) => {
    try {
        const { status, order_id, payment_id } = req.body;
        const order = await Order.findOne({ orderId: order_id });
        order.paymentId=payment_id;
        if (status === "failed") {
            console.log('payment failed');
            order.status="FAILED";
            return order.save();
        }
        order.status="SUCCESSFUL";
        req.user.isPremiumUser=true;
        await Promise.all([
            order.save(),
            req.user.save()
        ]);
        const { _id, name, isPremiumUser } = req.user;
        res.status(202).json(({
            success: true, message: 'Transaction successful', token: JwtServices.generateToken(_id, name, isPremiumUser)
        }));

    } catch (error) {
        res.status(500).json({ message: 'Something went wrong!' });
        console.log(error);
    }
}

module.exports={
    getPremiumMembership,
    postUpdateTransaction
}