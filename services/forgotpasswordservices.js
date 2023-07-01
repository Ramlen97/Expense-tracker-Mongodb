const Forgotpassword=require('../models/forgotpassword');

const getAllForgotpasswords=(where)=>{
    return Forgotpassword.findAll(where);
}

const getForgotpassword=(where)=>{
    return Forgotpassword.findOne(where);
}

const forgotpasswordByPk=(id)=>{
    return Forgotpassword.findByPk(id);
}

const updateForgotpassword=(forgotpassword,updatedDetails,t)=>{
    return forgotpassword.update(updatedDetails,t);
}


module.exports={
    getAllForgotpasswords,
    getForgotpassword,
    forgotpasswordByPk,
    updateForgotpassword
}