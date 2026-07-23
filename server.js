var express = require('express');
var app = express();
app.set('trust proxy', 1);

//Public Access
app.use(express.static('public'));

// Website Router Import
const websiterouter = require("./router/website.js");
app.use('/', websiterouter);

// Admin Router Import
const adminrouter = require("./router/admin.js");
app.use('/admin',adminrouter );

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
