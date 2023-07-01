const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const fileDownloadSchema= new Schema({
    url:{
        type:String,
        required:true
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
})

// const FileDownload= sequelize.define('filedownload',{
//     id:{
//         type:Sequelize.INTEGER,
//         allowNull:false,
//         autoIncrement:true,
//         primaryKey:true,
//     },
//     url:{
//         type:Sequelize.STRING,
//         allowNull:false,                
//     }
// })

module.exports=mongoose.model('FileDownload',fileDownloadSchema);