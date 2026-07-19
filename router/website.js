var express=require('express')
var router = express.Router();


//home route
router.get('/',(req,res)=>{
    res.render('website/index.ejs');
})
//about route
router.get('/about',(req,res)=>{
    res.render('website/about.ejs');
})
//resume
router.get('/resume',(req,res)=>{
    res.render('website/resume.ejs');
})

//services
router.get('/services',(req,res)=>{
    res.render('website/services.ejs');
})
//portfolio
router.get('/portfolio',(req,res)=>{
    res.render('website/portfolio.ejs');
})
//contact
router.get('/contact',(req,res)=>{
    res.render('website/contact.ejs');
})
//blog
router.get('/blog',(req,res)=>{
    res.render('website/blog.ejs');
})
//testimonial
router.get('/testimonials',(req,res)=>{
    res.render('website/testimonials.ejs');
})
//statistics
router.get('/statistics',(req,res)=>{
    res.render('website/statistics.ejs');
})


module.exports=router;