var express = require('express');
var app = express();

//Public Access
app.use(express.static('public'));

// Website Router Import
const websiterouter = require("./router/website.js");
app.use('/', websiterouter);

app.listen(3000, () => {
    console.log('click http://localhost:3000');
})
