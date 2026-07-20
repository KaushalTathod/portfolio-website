var express=require('express')
var router = express.Router();

//Public Access
router.use(express.static('public'));

router.get('/login',(req,res)=>{
    res.render('admin/login.ejs')
})

module.exports=router;