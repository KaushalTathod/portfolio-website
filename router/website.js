const express=require('express');
const router=express.Router();

router.get('/',(req,res)=>{
    res.render('website/index.ejs');
})

module.exports=router;