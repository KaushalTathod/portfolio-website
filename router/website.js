var express=require('express')
var router = express.Router();
var mysql=require('mysql2');
var util=require('util');
require('dotenv').config();


var conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});


//util package middleware
var exe=util.promisify(conn.query).bind(conn);

router.use(express.urlencoded({ extended: true }));
router.use(express.json());


router.use(async (req, res, next) => {
    try {
        const [contact, social_media] = await Promise.all([
            exe("SELECT * FROM contact"),
            exe("SELECT * FROM social_media")
        ]);

        res.locals.contact = contact[0];
        res.locals.social_media = social_media[0];

        next();
    } catch (err) {
        console.log(err);
        next();
    }
});


// Home Route
router.get('/', async (req, res) => {
    try {
        const heroRows = await exe('SELECT * FROM hero');
        const socialRows = await exe('SELECT * FROM social_media');
        const aboutRows = await exe('SELECT * FROM about');
        const experienceRows = await exe('SELECT * FROM experience');
        const servicesRows = await exe('SELECT * FROM services');

        return res.render('website/index.ejs', {
            hero: heroRows?.[0],
            social_media: socialRows?.[0],
            about: aboutRows?.[0],
            experience: experienceRows,
            services: servicesRows
        });

    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error');
    }
});

// About Route
router.get('/about', async (req, res) => {
    try {
        const [aboutRows, technicalSkills, education] = await Promise.all([
            exe('SELECT * FROM about'),
            exe('SELECT * FROM technical_skill'),
            exe('SELECT * FROM education')
        ]);

        return res.render('website/about.ejs', {
            about: aboutRows?.[0],
            technicalSkills,
            education
        });

    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error');
    }
});

//services


//portfolio
router.get('/portfolio', async (req, res) => {
    try {
        const projects = await exe('SELECT * FROM projects');
        return res.render('website/portfolio.ejs', { projects });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error');
    }
});

//contact
router.get('/contact', async (req, res) => {
    try {
        const [contact, social_media] = await Promise.all([
            exe('SELECT * FROM contact'),
            exe('SELECT * FROM social_media')
        ]);

        return res.render('website/contact.ejs', {
            contact: contact[0],
            social_media: social_media[0],
            logo: contact[0]?.logo,
            success: req.query.success
        });

    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error');
    }
});

//contact form submit
router.post('/contact/submit', async (req, res) => {
    try {
        var { name, email, subject, message } = req.body;
        if (!name || !email || !message) {
            return res.redirect('/contact?success=0');
        }
        await exe(
            'INSERT INTO messages(name, email, subject, message) VALUES(?,?,?,?)',
            [name, email, subject || '', message]
        );
        return res.redirect('/contact?success=1');
    } catch (err) {
        console.error(err);
        return res.redirect('/contact?success=0');
    }
});

//blog
router.get('/blog', async (req, res) => {
    try {
        const blog = await exe('SELECT * FROM blog ORDER BY bid DESC');
        return res.render('website/blog.ejs', { blog });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error');
    }
});

router.get('/blog/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const blog = await exe('SELECT * FROM blog WHERE bid=?', [id]);

        return res.render('website/blog_details.ejs', { blog: blog[0] });

    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error');
    }
});

//statistics (stats from about + experience/education timelines)
router.get('/statistics', async (req, res) => {
    try {
        const [aboutRows, experience, education] = await Promise.all([
            exe('SELECT * FROM about'),
            exe('SELECT * FROM experience'),
            exe('SELECT * FROM education')
        ]);
        return res.render('website/statistics.ejs', {
            about: aboutRows?.[0],
            experience,
            education
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error');
    }
});


module.exports=router;