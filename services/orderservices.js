const Order=require('../models/order');

const getAllOrders=(where)=>{
    return Order.findAll(where);
}

const getOrder=(where)=>{
    return Order.findOne(where);
}

const orderByPk=(id)=>{
    return Order.findByPk(id);
}

const updateOrder=(order,updatedDetails,t)=>{
    return order.update(updatedDetails,t);
}


module.exports={
    getAllOrders,
    getOrder,
    orderByPk,
    updateOrder
}