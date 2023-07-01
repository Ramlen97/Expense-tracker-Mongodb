const User = require('../models/user');

const getAllUsers=(where)=>{
    return User.findAll(where);
}

const getUser=(where)=>{
    return User.findOne(where);
}

const UserByPk=(pk)=>{
    return User.findByPk(pk);
}

const createUser=(details,t)=>{
    return User.create(details,t);
}

const updateUser=(user,details,t)=>{
    return user.update(details,t);
}

const getExpenses =(user,where)=>{
    return user.getExpenses(where);
}

const createExpense=(user,details,t)=>{
    return user.createExpense(details,t);
}

const countExpenses =(user,where)=>{
    return user.countExpenses(where);
}

const createOrder=(user,details,t)=>{
    return user.createOrder(details,t);
}

const createForgotpassword=(user,details,t)=>{
    return user.createForgotpassword(details,t);
}

const createFiledownload=(user,details,t)=>{
    return user.createFiledownload(details,t);
}

const getFiledownloads=(user,where)=>{
    return user.getFiledownloads(where);
}

module.exports={
    getAllUsers,
    getUser,
    UserByPk,
    createUser,
    updateUser,
    getExpenses,
    createExpense,
    countExpenses,
    createOrder,
    createForgotpassword,
    createFiledownload,
    getFiledownloads
}