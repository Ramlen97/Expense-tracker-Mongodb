const Expense=require('../models/expense');

const getAllExpenses=(where)=>{
    return Expense.findAll(where);
}

const getExpense=(where)=>{
    return Expense.findOne(where);
}

const expenseByPk=(id)=>{
    return Expense.findByPk(id);
}

const updateExpense=(expense,updatedDetails,t)=>{
    return expense.update(updatedDetails,t);
}

const destroyExpense=(expense,t)=>{
    return expense.destroy(t);
}

module.exports={
    getAllExpenses,
    getExpense,
    expenseByPk,
    updateExpense,
    destroyExpense
}