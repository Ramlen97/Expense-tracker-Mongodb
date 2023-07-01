const User = require('../models/user');
const Expense = require('../models/expense');

const getExpenses = async (req, res) => {
    try {
        const { page, rows, startDate, endDate } = req.query;
        offset = (page - 1) * rows
        limit = rows * 1;
        const response = await Promise.all([
            Expense.find({userId:req.user,createdAt:{$gte:startDate,$lt:endDate}}).skip(offset).limit(limit).sort({_id:-1}),
            Expense.aggregate([
                {
                  $match: {
                    userId:req.user._id,
                    createdAt: { $gte: new Date(startDate), $lt: new Date(endDate) }
                  }
                },
                {
                  $group: {
                    _id:null,
                    count: { $sum: 1 },
                    total: { $sum: "$amount" }
                  }
                }
              ])
        ]);
        if(!response[1][0]){
            response[1]=[{count:0,total:0}]
        }
        res.status(200).json(response);
    }
    catch (error) {
        res.status(504).json({ message: 'Something went wrong!' });
        console.log(error);
    }
}

const postAddExpense = async (req, res) => {
    try {
        const { amount, description, category } = req.body;
        if (!amount || !description || !category) {
            return res.status(400).json({ message: 'Some fields are misisng!' });
        }
        req.user.totalExpense += Number(amount);
        const response = await Promise.all([
            Expense.create({ amount, description, category, userId: req.user }),
            req.user.save()
        ]);
        console.log('Expense added');
        res.status(201).json(response[0]);

    } catch (error) {
        res.status(504).json({ message: 'Something went wrong!' });
        console.log(error);
    }
}

const postUpdateExpense = async (req, res) => {
    try {
        const { id, amount, description, category } = req.body;
        const expense = await Expense.findByIdAndUpdate(id,{amount,description,category});
        req.user.totalExpense = req.user.totalExpense - expense.amount + Number(amount);
        await req.user.save()

        res.status(201).json();
        console.log('expense updated');

    } catch (error) {
        res.status(504).json({ message: 'Something went wrong!' });
        console.log(error);
    }
}

const postdeleteExpense = async (req, res) => {
    try {
        const id = req.params.expenseId;
        const deletedExpense = await Expense.findByIdAndDelete(id);
        req.user.totalExpense = req.user.totalExpense - deletedExpense.amount;
        await req.user.save();

        res.status(200).json();
        console.log('expense deleted');

    } catch (error) {
        res.status(504).json({ message: 'Something went wrong!' });
        console.log(error);
    }
}

module.exports = {
    getExpenses,
    postAddExpense,
    postUpdateExpense,
    postdeleteExpense
}