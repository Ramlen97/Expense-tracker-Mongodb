const Filedownload=require('../models/filedownload');

const getAllFiledownloads=(where)=>{
    return Filedownload.findAll(where);
}

const getFiledownload=(where)=>{
    return Filedownload.findOne(where);
}

const filedownloadByPk=(id)=>{
    return Filedownload.findByPk(id);
}

const updateFiledownload=(filedownload,updatedDetails,t)=>{
    return filedownload.update(updatedDetails,t);
}

const destroyFiledownload=(filedownload,t)=>{
    return filedownload.destroy(t);
}

module.exports={
    getAllFiledownloads,
    getFiledownload,
    filedownloadByPk,
    updateFiledownload,
    destroyFiledownload
}
