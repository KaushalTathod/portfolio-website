var express=require('express')
var mysql=require('mysql2');
var router = express.Router();
var util=require('util');
//bcrypt import
const bcrypt=require('bcrypt');
//for join the env file
require('dotenv').config();

const rateLimit = require('express-rate-limit');

var session=require('express-session');
var MySQLStore = require('express-mysql-session')(session);
const { send } = require('process');
var fileupload=require('express-fileupload');
var path=require('path');
const fs = require('fs');

const nodemailer = require('nodemailer');

var conn = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

var sessionStore = new MySQLStore({}, conn);
//util package middleware
var exe=util.promisify(conn.query).bind(conn);
//limited login and otp
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "To Many Attempt",
    standardHeaders: true,
    legacyHeaders: false
});

const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "To Many Attempt",
    standardHeaders: true,
    legacyHeaders: false
});
//middlerware for fileuplad
router.use(fileupload({
    limits: { fileSize: 2 * 1024 * 1024 },
    abortOnLimitReached: true,
    responseOnLimit: "File size limit exceeded (max 2MB allowed)"
}));
//middlerware for session 
router.use(session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,  
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'  
    }
}))
//selft middlerware for if session data is not avl then logout
function session_check(req,res,next){
    if(req.session.username){
        next();
    }else{
        res.redirect('/login');
    }
}
//helperfunction middlerware for resusable 
function isValidImage(file) {
    const allowedExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.name).toLowerCase();
    return allowedExt.includes(ext);
}
function isSafeFilename(name) {
    return typeof name === 'string' && name.length > 0 &&
           !name.includes('..') && !name.includes('/') && !name.includes('\\');
}
//middleware for read post data
router.use(express.urlencoded({extended:true}));

async function logActivity(description, icon, color) {
    try {
        await exe("INSERT INTO activity_log (description, icon, color) VALUES (?, ?, ?)", [description, icon, color]);
    } catch(e) {
        console.error(e);
    }
}

router.get('/',session_check, async (req,res)=>{
    var username = req.session.username;
    var password = req.session.pass;
    
    var recent_messages = await exe('SELECT * FROM messages ORDER BY mid DESC LIMIT 5');
    var recent_activities = await exe('SELECT * FROM activity_log ORDER BY id DESC LIMIT 5');
    
    var projectsCount = await exe("SELECT COUNT(*) as count FROM projects");
    var blogCount = await exe("SELECT COUNT(*) as count FROM blog");
    var messagesCount = await exe("SELECT COUNT(*) as count FROM messages");
    
    res.render('admin/dashbord.ejs',{
        username:username,
        recent_messages: recent_messages,
        recent_activities: recent_activities,
        projectsCount: projectsCount[0] ? projectsCount[0].count : 0,
        blogCount: blogCount[0] ? blogCount[0].count : 0,
        messagesCount: messagesCount[0] ? messagesCount[0].count : 0
    });
})
router.get('/login',(req,res)=>{
    res.render('admin/login.ejs')
})

//check login route
router.post('/check_login',loginLimiter, async (req, res) => {
    var { username, pass } = req.body;
    var sql = `SELECT * FROM login WHERE username=?`;
    var data = await exe(sql, [username]);

    if (data.length > 0) {
        const match = await bcrypt.compare(pass, data[0].pass);
        if (match) {
            return req.session.regenerate((err) => {
                if (err) {
                    console.error(err);
                    return res.redirect('/admin/login');
                }
                req.session.lid = data[0].lid;
                req.session.username = data[0].username;
                return res.redirect('/admin/');
            });
        }
    }
    res.redirect('/admin/login');
});

router.get('/forget',(req,res)=>{
    res.render('admin/forget.ejs', { error: req.session.error || null })
    req.session.error = null;
})

router.post('/forget', otpLimiter, async (req, res) => {
    try {

        var { email } = req.body;

        console.log("Forget Email:", email);

        var sql = `SELECT * FROM login WHERE email=?`;
        var data = await exe(sql, [email]);


        if (data.length > 0) {

            // Generate OTP
            var otp = Math.floor(100000 + Math.random() * 900000).toString();


            req.session.reset_email = email;
            req.session.reset_otp = otp;
            req.session.otp_expires = Date.now() + 5 * 60 * 1000;



            // Gmail SMTP
            var transporter = nodemailer.createTransport({

                host: "smtp.gmail.com",
                port: 587,
                secure: false,

                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },

                tls: {
                    rejectUnauthorized: false
                }

            });



            // SMTP Test
            transporter.verify((error, success) => {

                if (error) {
                    console.log("SMTP VERIFY ERROR:", error);
                } else {
                    console.log("SMTP SERVER READY");
                }

            });



            var mailOptions = {

                from: process.env.EMAIL_USER,

                to: email,

                subject: "Admin Panel Password Reset OTP",

                html: `
                    <h2>Password Reset OTP</h2>
                    <h3>Your OTP is:</h3>
                    <h1>${otp}</h1>
                    <p>This OTP is valid for 5 minutes.</p>
                `

            };


            console.log("Before sending OTP mail");


            await transporter.sendMail(mailOptions);


            console.log("After sending OTP mail");
            console.log("OTP email sent successfully");


            return res.redirect('/admin/verify_otp');



        } else {


            console.log("Email not found");

            req.session.error = "Email not found in our records.";

            return res.redirect('/admin/forget');


        }



    } catch (error) {


        console.log("OTP MAIL ERROR:", error);


        req.session.error = "Error sending email. Check server config.";

        return res.redirect('/admin/forget');


    }

});

router.get('/verify_otp',otpLimiter, (req, res) => {
    if (!req.session.reset_email) return res.redirect('/admin/forget');
    res.render('admin/verify_otp.ejs', { error: req.session.error || null });
    req.session.error = null;
});

router.post('/verify_otp', (req, res) => {
    var { otp } = req.body;
    
    if (!req.session.reset_otp || Date.now() > req.session.otp_expires) {
        req.session.error = "OTP expired. Please request a new one.";
        return res.redirect('/admin/forget');
    }
    
    if (otp === req.session.reset_otp) {
        req.session.otp_verified = true;
        res.redirect('/admin/reset_password');
    } else {
        req.session.error = "Invalid OTP.";
        res.redirect('/admin/verify_otp');
    }
});

router.get('/reset_password', (req, res) => {
    if (!req.session.otp_verified) return res.redirect('/admin/forget');
    res.render('admin/reset_password.ejs', { error: req.session.error || null });
    req.session.error = null;
});

router.post('/reset_password', async (req, res) => {
    if (!req.session.otp_verified) return res.redirect('/admin/forget');
    
    var { new_password, confirm_password } = req.body;
    
    if (new_password !== confirm_password) {
        req.session.error = "Passwords do not match.";
        return res.redirect('/admin/reset_password');
    }
    
    var email = req.session.reset_email;
    var sql = `update login set pass=? where email=?`;
    const hashPassword = await bcrypt.hash(new_password, 10);

    await exe(sql, [hashPassword, email]);
    
    // Clear session variables
    delete req.session.reset_email;
    delete req.session.reset_otp;
    delete req.session.otp_expires;
    delete req.session.otp_verified;
    
    res.redirect('/admin/login');
});

router.get('/logout',(req,res)=>{
    req.session.destroy();
    res.redirect('/admin/login');
})
//-----------CRUD---------//
//1.SKILL
//Add skill
router.get('/skill_add',session_check,(req,res)=>{
    var username=req.session.username;
    var password=req.session.pass;
    res.render('admin/skill_add.ejs');
})

//Save Form Data
router.post('/skill_add_save',session_check,async(req,res)=>{
    var username=req.session.username;
    var password=req.session.pass;
    var {tech_name,tech_per}=req.body;
    var sql=`insert into technical_skill(tech_name,tech_per)values(?,?)`;
    var data=await exe(sql,[tech_name,tech_per]);
    await logActivity('Added a new skill: ' + tech_name, 'fas fa-plus', 'bg-primary');
    res.redirect('/admin/skill_add');
})
//Send Data To Table
router.get('/skill_list',session_check,(req,res)=>{
    var username=req.session.username;
    var password=req.session.pass;
    var sql=`select * from technical_skill `
    conn.query(sql,(err,result)=>{
        res.render('admin/skill_list.ejs',{skill:result});
    })
    
})
//Delete Record
router.get('/delete_skill/:id',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    var id = req.params.id;
    var sql = `delete from technical_skill where tid=?`;
    await exe(sql, [id]);
    await logActivity('Deleted a skill', 'fas fa-trash', 'bg-danger');
    res.redirect('/admin/skill_list');
});
//Edit Record
router.get('/edit_skill/:id',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    var id = req.params.id;
    var sql = `select * from technical_skill where tid=?`;
    var result = await exe(sql, [id]);
    res.render('admin/skill_edit.ejs', { skill: result[0] });
});
//Save-Update Record
router.post('/update_skill',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    var { tid, tech_name, tech_per } = req.body;
    var sql = `update technical_skill set tech_name=?, tech_per=? where tid=?`;
    await exe(sql, [tech_name, tech_per, tid]);
    await logActivity('Updated skill: ' + tech_name, 'fas fa-edit', 'bg-success');
    res.redirect('/admin/skill_list');
});


//2.EDUCATION
//Add Education
router.get('/education_add',session_check,(req,res)=>{
    var username=req.session.username;
    var password=req.session.pass;
        res.render('admin/education_add.ejs');
})

//Save Form Data
router.post('/education_add_save',session_check,async(req,res)=>{
    var username=req.session.username;
    var password=req.session.pass;
    var {eyear,edegree,eunivercity}=req.body;
    var sql=`insert into education(eyear,edegree,eunivercity)values(?,?,?)`;
    var data=await exe(sql,[eyear,edegree,eunivercity]);
    res.redirect('/admin/education_add');
})

//Send Data to Table
router.get('/education_list',session_check,(req,res)=>{
    var username=req.session.username;
    var password=req.session.pass;
    var sql=`select * from education`
    conn.query(sql,(err,result)=>{
        res.render('admin/education_list.ejs',{education:result});
    })
})
//Delete Record
router.get('/delete_education/:id',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    var id = req.params.id;
    var sql = `delete from education where eid=?`;
    await exe(sql, [id]);
    res.redirect('/admin/education_list');
});
//Edite Record
router.get('/edit_education/:id',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    var id = req.params.id;
    var sql = `select * from education where eid=?`;
    var result = await exe(sql, [id]);
    res.render('admin/education_edit.ejs', { education: result[0] });
});
//Save-Update Record
router.post('/update_education',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    var { eid, eyear, edegree, eunivercity } = req.body;
    var sql = `update education set eyear=?, edegree=?, eunivercity=? where eid=?`;
    await exe(sql, [eyear, edegree, eunivercity, eid]);
    res.redirect('/admin/education_list');
});


//3.Experience
//Add Experience
router.get('/experience_add',session_check,(req,res)=>{
    var username=req.session.username;
    var password=req.session.pass;
        res.render('admin/experience_add.ejs');
})
//Save Form Data
router.post('/experience_add_save',session_check,async(req,res)=>{
    var username=req.session.username;
    var password=req.session.pass;
    var {exp_duration,exp_position,exp_company,exp_desc}=req.body;
    var sql=`insert into experience(exp_duration,exp_position,exp_company,exp_desc)values(?,?,?,?)`;
    var data=await exe(sql,[exp_duration,exp_position,exp_company,exp_desc]);
    res.redirect('/admin/experience_add');
})
//Send Data to Table
router.get('/experience_list',session_check,(req,res)=>{
    var username=req.session.username;
    var password=req.session.pass;
    var sql=`select * from experience`
    conn.query(sql,(err,result)=>{
        res.render('admin/experience_list.ejs',{experience:result});
    })
})
//Delete Record
router.get('/delete_experience/:id',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    var id = req.params.id;
    var sql = `delete from experience where eid=?`;
    await exe(sql, [id]);
    res.redirect('/admin/experience_list');
});
//Edite Record
router.get('/edit_experience/:id',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    var id = req.params.id;
    var sql = `select * from experience where eid=?`;
    var result = await exe(sql, [id]);
    res.render('admin/experience_edit.ejs', { experience: result[0] });
});
//Save-Update Record
router.post('/update_experience',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    var { eid, exp_duration, exp_position, exp_company, exp_desc } = req.body;
    var sql = `update experience set exp_duration=?, exp_position=?, exp_company=?, exp_desc=? where eid=?`;
    await exe(sql, [exp_duration, exp_position, exp_company, exp_desc, eid]);
    res.redirect('/admin/experience_list');
});

//4.SERVICE
//Add Experience
router.get('/services_add',session_check,(req,res)=>{
    var username=req.session.username;
    var password=req.session.pass;
        res.render('admin/services_add.ejs');
})
//Save Form Data
router.post('/services_add_save',session_check,async(req,res)=>{
    var username=req.session.username;
    var password=req.session.pass;
    var {ser_technology,ser_discription,ser_icon}=req.body;
    var sql=`insert into services(ser_technology,ser_discription,ser_icon)values(?,?,?)`;
    var data=await exe(sql,[ser_technology,ser_discription,ser_icon]);
    res.redirect('/admin/services_add');
})
//Send Data to Table
router.get('/services_list',session_check,(req,res)=>{
    var username=req.session.username;
    var password=req.session.pass;
    var sql=`select * from services`
    conn.query(sql,(err,result)=>{
        res.render('admin/services_list.ejs',{services:result});
    })
})
//Delete Record
router.get('/delete_service/:id',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    var id = req.params.id;
    var sql = `delete from services where sid=?`;
    await exe(sql, [id]);
    res.redirect('/admin/services_list');
});
//Edite Record
router.get('/edit_service/:id',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    var id = req.params.id;
    var sql = `select * from services where sid=?`;
    var result = await exe(sql, [id]);
    res.render('admin/services_edit.ejs', { services: result[0] });
});
//Update Record
router.post('/update_service',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    var { sid, ser_technology, ser_discription } = req.body;
    var sql = `update services set ser_technology=?, ser_discription=? where sid=?`;
    await exe(sql, [ser_technology, ser_discription, sid]);
    res.redirect('/admin/services_list');
});


//------------File--Update------------//
//1 Setting - Genral
//Send Data To Form
router.get('/settings',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    var contact = await exe("SELECT * FROM contact");
    var social_media = await exe("SELECT * FROM social_media");

    res.render("admin/settings.ejs", {
        contact,
        social_media
    });
});
//Save form data
router.post('/contact_save',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    try {
        var { email, phone, address, map, old_logo } = req.body;
        var imgname = old_logo;

        if (req.files && req.files.logo) {
            const img = req.files.logo;

            if (!isValidImage(img)) {
                return res.status(400).send("Invalid file type. Only jpg, jpeg, png, webp, gif allowed");
            }

            imgname = Date.now() + path.extname(img.name).toLowerCase();
            var imgpath = path.join(__dirname, '../', 'public', imgname);

            await new Promise((resolve, reject) => {
                img.mv(imgpath, (err) => err ? reject(err) : resolve());
            });

            // remove old logo
            if (old_logo && isSafeFilename(old_logo)) {
                var imgpath1 = path.join(__dirname, '../', 'public', old_logo);
                fs.unlink(imgpath1, (err) => {});
            }
        }

        var sql = `update contact set email=?,phone=?,address=?,map=?,logo=? where cid=1`;
        await exe(sql, [email, phone, address, map, imgname]);
        res.redirect('/admin/settings');

    } catch (e) {
        console.error(e);
        res.status(500).send("Something went wrong. Please try again.");
    }
});

//2 Setting - Social Media
//Save-Update Record
router.post('/social_save',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    var { facebook,twitter, instagram, linkedin, github,youtube, } = req.body;
    var sql = `update social_media set facebook=?, twitter=?, instagram=?, linkedin=?,github=?,youtube=? where sid=1`;
    await exe(sql, [facebook,twitter, instagram, linkedin, github,youtube,]);
    res.redirect('/admin/settings');
});
//3 Hero
//Hero Form
router.get('/hero',session_check,(req,res)=>{
    var username=req.session.username;
    var password=req.session.pass;
    var sql=`select * from hero`
    conn.query(sql,(err,result)=>{
        res.render('admin/hero.ejs',{hero:result});
    })
})
//Save form data
router.post('/hero_add_save',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    try {
        var { hname, hprofession, habout, old_img } = req.body;
        var imgname = old_img;

        if (req.files && req.files.himg) {
            const img = req.files.himg;

            if (!isValidImage(img)) {
                return res.status(400).send("Invalid file type. Only jpg, jpeg, png, webp, gif allowed");
            }

            imgname = Date.now() + path.extname(img.name).toLowerCase();
            var imgpath = path.join(__dirname, '../', 'public', imgname);

            await new Promise((resolve, reject) => {
                img.mv(imgpath, (err) => err ? reject(err) : resolve());
            });

            if (old_img && isSafeFilename(old_img)) {
                var imgpath1 = path.join(__dirname, '../', 'public', old_img);
                fs.unlink(imgpath1, (err) => {});
            }
        }

        var sql = `update hero set hname=?,hprofession=?,habout=?,himg=? where hid=1`;
        await exe(sql, [hname, hprofession, habout, imgname]);
        res.redirect('/admin/hero');

    } catch (e) {
        console.error(e);
        res.status(500).send("Something went wrong. Please try again.");
    }
});
//3 About
//About Form
router.get('/about',session_check,(req,res)=>{
    var username=req.session.username;
    var password=req.session.pass;
    var sql=`select * from about`
    conn.query(sql,(err,result)=>{
        res.render('admin/about.ejs',{about:result});
    })
})
// Save About Data
router.post('/about_add_save',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    try {
        var {
            aprofession, asummary, aname, aemail, alocation,
            afreelance, aexperience, aprojectcom, ahappyclients,
            aaward, ayear, old_img
        } = req.body;

        var imgname = old_img;

        if (req.files && req.files.aimg) {
            const img = req.files.aimg;

            if (!isValidImage(img)) {
                return res.status(400).send("Invalid file type. Only jpg, jpeg, png, webp, gif allowed");
            }

            imgname = Date.now() + path.extname(img.name).toLowerCase();
            var imgpath = path.join(__dirname, '../', 'public', imgname);

            await new Promise((resolve, reject) => {
                img.mv(imgpath, (err) => err ? reject(err) : resolve());
            });

            if (old_img && isSafeFilename(old_img)) {
                var imgpath1 = path.join(__dirname, '../', 'public', old_img);
                fs.unlink(imgpath1, (err) => {});
            }
        }

        var sql = `
            UPDATE about
            SET
                aprofession=?, asummary=?, aname=?, aemail=?, alocation=?,
                afreelance=?, aexperience=?, aprojectcom=?, ahappyclients=?,
                aaward=?, ayear=?, aimg=?
            WHERE aid=1
        `;

        await exe(sql, [
            aprofession, asummary, aname, aemail, alocation,
            afreelance, aexperience, aprojectcom, ahappyclients,
            aaward, ayear, imgname
        ]);

        res.redirect('/admin/about');

    } catch (e) {
        console.error(e);
        res.status(500).send("Something went wrong. Please try again.");
    }
});

//------------File--CRUD------------//
//1 Project
//Add Project
router.get('/projects',session_check,(req,res)=>{
    var username=req.session.username;
    var password=req.session.pass;
  res.render('admin/projects.ejs');
})
//Insert Into Db
router.post('/projects_add_save',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    try {
        var { pname, ptype } = req.body;

        if (!req.files || !req.files.pimg) {
            return res.status(400).send("Image is required");
        }

        const img = req.files.pimg;

        if (!isValidImage(img)) {
            return res.status(400).send("Invalid file type. Only jpg, jpeg, png, webp, gif allowed");
        }

        var imgname = Date.now() + path.extname(img.name).toLowerCase();
        var imgpath = path.join(__dirname, '../', 'public', imgname);

        await new Promise((resolve, reject) => {
            img.mv(imgpath, (err) => err ? reject(err) : resolve());
        });

        var sql = `INSERT INTO projects(pname, ptype, pimg) VALUES (?, ?, ?)`;
        await exe(sql, [pname, ptype, imgname]);
        await logActivity('Added a new project: ' + pname, 'fas fa-folder-plus', 'bg-primary');
        res.redirect('/admin/projects');

    } catch (e) {
        console.error(e);
        res.status(500).send("Something went wrong. Please try again.");
    }
});
// Send Data to Table
router.get('/projects_list',session_check, (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    var sql = `SELECT * FROM projects`;

    conn.query(sql, (err, result) => {
        res.render('admin/projects_list.ejs', { project: result });
    });
});
// Delete Project
router.get('/delete_projects/:id',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    var id = req.params.id;

    var sql = `DELETE FROM projects WHERE pid=?`;
    await exe(sql, [id]);
    await logActivity('Deleted a project', 'fas fa-trash', 'bg-danger');
    res.redirect('/admin/projects_list');
});

// Edit Project
router.get('/edit_projects/:id',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    var id = req.params.id;

    var sql = `SELECT * FROM projects WHERE pid=?`;
    var result = await exe(sql, [id]);

    res.render('admin/projects_update.ejs', { project: result[0] });
});

// Update Project
router.post('/project_update_save',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    try {
        var { pid, pname, ptype, old_img } = req.body;
        var imgname = old_img;

        if (req.files && req.files.pimg) {
            const img = req.files.pimg;

            if (!isValidImage(img)) {
                return res.status(400).send("Invalid file type. Only jpg, jpeg, png, webp, gif allowed");
            }

            imgname = Date.now() + path.extname(img.name).toLowerCase();
            var imgpath = path.join(__dirname, '../', 'public', imgname);

            await new Promise((resolve, reject) => {
                img.mv(imgpath, (err) => err ? reject(err) : resolve());
            });

            if (old_img && isSafeFilename(old_img)) {
                var oldImgPath = path.join(__dirname, '../', 'public', old_img);
                fs.unlink(oldImgPath, (err) => {});
            }
        }

        var sql = `
            UPDATE projects
            SET pname=?, ptype=?, pimg=?
            WHERE pid=?
        `;

        await exe(sql, [pname, ptype, imgname, pid]);
        await logActivity('Updated a project: ' + pname, 'fas fa-edit', 'bg-success');
        res.redirect('/admin/projects_list');

    } catch (e) {
        console.error(e);
        res.status(500).send("Something went wrong. Please try again.");
    }
});
//2 Blog
//Add Blog
router.get('/blog',session_check,(req,res)=>{
    var username=req.session.username;
    var password=req.session.pass;
  res.render('admin/blog.ejs');
})
//Insert Into Db
router.post('/blog_add_save',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    try {
        var { bdate, btitle, bcontent } = req.body;

        if (!req.files || !req.files.bimg) {
            return res.status(400).send("Image is required");
        }

        const img = req.files.bimg;

        if (!isValidImage(img)) {
            return res.status(400).send("Invalid file type. Only jpg, jpeg, png, webp, gif allowed");
        }

        var imgname = Date.now() + path.extname(img.name).toLowerCase();
        var imgpath = path.join(__dirname, '../', 'public', imgname);

        await new Promise((resolve, reject) => {
            img.mv(imgpath, (err) => err ? reject(err) : resolve());
        });

        var sql = `INSERT INTO blog(bdate, btitle, bcontent, bimg) VALUES(?, ?, ?, ?)`;
        await exe(sql, [bdate, btitle, bcontent, imgname]);
        await logActivity('Added a new blog: ' + btitle, 'fas fa-blog', 'bg-primary');
        res.redirect('/admin/blog');

    } catch (e) {
        console.error(e);
        res.status(500).send("Something went wrong. Please try again.");
    }
});
// Send Data to Table
router.get('/blog_list',session_check, (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    var sql = `SELECT * FROM blog`;

    conn.query(sql, (err, result) => {
        res.render('admin/blog_list.ejs', {blog: result });
    });
});
// Delete Project
router.get('/delete_blog/:id',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    var id = req.params.id;

    var sql = `DELETE FROM blog WHERE bid=?`;
    await exe(sql, [id]);
    await logActivity('Deleted a blog', 'fas fa-trash', 'bg-danger');
    res.redirect('/admin/blog_list');
});

// Edit Project
router.get('/edit_blog/:id',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    var id = req.params.id;

    var sql = `SELECT * FROM blog WHERE bid=?`;
    var result = await exe(sql, [id]);

    res.render('admin/blog_update.ejs', {  blog: result[0] });
});

// Update Project
router.post('/blog_update_save',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    try {
        var { bid, bdate, btitle, bcontent, old_img } = req.body;
        var imgname = old_img;

        if (req.files && req.files.bimg) {   // 👈 bug fix: pehle 'pimg' tha, ab 'bimg'
            const img = req.files.bimg;

            if (!isValidImage(img)) {
                return res.status(400).send("Invalid file type. Only jpg, jpeg, png, webp, gif allowed");
            }

            imgname = Date.now() + path.extname(img.name).toLowerCase();
            var imgpath = path.join(__dirname, '../', 'public', imgname);

            await new Promise((resolve, reject) => {
                img.mv(imgpath, (err) => err ? reject(err) : resolve());
            });

            if (old_img && isSafeFilename(old_img)) {
                var oldImgPath = path.join(__dirname, '../', 'public', old_img);
                fs.unlink(oldImgPath, (err) => {});
            }
        }

        var sql = `
            UPDATE blog
            SET bdate=?, btitle=?, bcontent=?, bimg=?
            WHERE bid=?
        `;

        await exe(sql, [bdate, btitle, bcontent, imgname, bid]);
        await logActivity('Updated a blog: ' + btitle, 'fas fa-edit', 'bg-success');
        res.redirect('/admin/blog_list');

    } catch (e) {
        console.error(e);
        res.status(500).send("Something went wrong. Please try again.");
    }
});
//3 Contact form messages (from website)
router.get('/contact_messages',session_check, async (req, res) => {
    var username=req.session.username;
    var password=req.session.pass;
    var messages = await exe('SELECT * FROM messages ORDER BY mid DESC');
    res.render('admin/contact_messages.ejs', { messages });
});

router.get('/messages',session_check, async (req, res) => {
    var messages = await exe('SELECT * FROM messages ORDER BY mid DESC');
    res.render('admin/contact_messages.ejs', { messages });
});

router.get('/messages_unread',session_check, async (req, res) => {
    var messages = await exe('SELECT * FROM messages WHERE is_read=0 ORDER BY mid DESC');
    res.render('admin/contact_messages.ejs', { messages });
});

router.get('/delete_message/:id',session_check, async (req, res) => {
    await exe('DELETE FROM messages WHERE mid=?', [req.params.id]);
    res.redirect('/admin/contact_messages');
});

router.get('/read_message/:id',session_check, async (req, res) => {
    await exe('UPDATE messages SET is_read=1 WHERE mid=?', [req.params.id]);
    res.redirect('/admin/contact_messages');
});

module.exports=router;