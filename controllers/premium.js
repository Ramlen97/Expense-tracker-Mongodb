const User=require('../models/user');
const Expense=require('../models/expense');
const FileDownload=require('../models/filedownload');
const S3Services = require('../services/S3services');

const getLeaderboard = async (req, res) => {
    try {
        if(!req.user.isPremiumUser){
            return res.status(401).json({message:'User not authorized'});
        }
        const leaderboard = await User.find().limit(10).sort({totalExpense:-1}).select('name totalExpense');
        // console.log(leaderboard);
        res.status(200).json(leaderboard);
    }
    catch (error) {
        console.log(error);
        res.status(504).json({message:'Something went wrong'});
    }
}

const getDownloadExpenses = async (req, res) => {
    try {
        if(!req.user.isPremiumUser){
            return res.status(401).json({message:'User not authorized'});
        }
        const { startDate,endDate } = req.query;   
        const expenses = await Expense.find({userId:req.user,createdAt:{$gte:startDate,$lt:endDate}}).sort({_id:-1});
        const stringifiedExpenses = JSON.stringify(expenses);
        // console.log(stringifiedExpenses);

        const userId = req.user._id;
        const filename = `Expense${userId}/${new Date()}.txt`;
        const fileURL = await S3Services.uploadToS3(stringifiedExpenses, filename);
        await FileDownload.create({userId:req.user,url:fileURL});
        // console.log(fileURL);
        res.status(200).json({ fileURL, success: true });
    }
    catch (error) {
        res.status(504).json({ fileURL: "", success: false, message: 'Something went wrong!'});
        console.log(error);
    }
}

const getPreviousDownloads=async(req,res)=>{
    try {
        if(!req.user.isPremiumUser){
            return res.status(401).json({message:'Unauthorized'});
        }     
        const  previousdownloads=await FileDownload.find({_id:req.user}).sort({_id:-1});
        res.status(200).json(previousdownloads);
    } catch (error) {
        res.status(504).json({success: false, message: 'Something went wrong!'});
        console.log(error);
    }
}

module.exports={
    getLeaderboard,
    getDownloadExpenses,
    getPreviousDownloads
}