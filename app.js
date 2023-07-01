require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const mongoose=require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');
const purchaseRoutes = require('./routes/purchase');
const premiumRoutes = require('./routes/premium');
const resetPasswordRoutes = require('./routes/resetpassword');


const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'), { flags: 'a' }
);

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(morgan('combined', { stream: accessLogStream }));

app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumRoutes);
app.use('/password', resetPasswordRoutes);
app.use((req, res) => {
    console.log('url=>',req.url);
    if(req.url==="/"){
        return res.redirect('login/login.html');
    }
    res.sendFile(path.join(__dirname, `public/${req.url}`));
})

mongoose.connect(`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.e8alx0d.mongodb.net/expense-tracker?retryWrites=true&w=majority`)
.then(result=>{
    console.log('connected');
    app.listen(process.env.PORT);
})




