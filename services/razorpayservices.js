const Razorpay = require('razorpay');

const createOrder=(amount)=>{
    const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    })
    
    return rzp.orders.create({ amount, currency: "INR" })
}

module.exports={
    createOrder,
}