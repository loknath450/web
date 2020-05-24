//Importing dependencies
require('dotenv').config();
const express = require('express');
var path = require('path');
var sql = require('./db.js');
const sgMail = require('@sendgrid/mail');
const fs = require("fs");

var app = express()
sgMail.setApiKey('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');
//Starting Express app

const multer = require('multer'); // file storing middleware
const cors = require('cors');
const bodyParser = require('body-parser');
var newFileName;
var toEmail;
app.use(cors())




app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Set the base path to the angular-test dist folder
app.use(express.static(path.join(__dirname, 'project3-ui')));

//MULTER CONFIG: to get file photos to temp server storage
const multerConfig = {
    storage: multer.diskStorage({
        //Setup where the user's file will go
        destination: function (req, file, next) {
            next(null, './project3-ui/resumes');
        },

        //Then give the file a unique name
        filename: function (req, file, next) {
            console.log('this is from multer',file);
            
            const ext = file.mimetype.split('/')[1];
             newFileName = file.originalname + '-' + Date.now() + '.' + ext;
            console.log('newFileName', newFileName);
            next(null, newFileName);
        }
    }),

    //A means of ensuring only pdfs are uploaded. 
    fileFilter: function (req, file, next) {
        if (!file) {
            next();
        }
        
        const fileType = file.mimetype.startsWith('application/pdf');
        if (fileType) {
        console.log('file uploaded');
        
            next(null, true);
        } else {
            console.log("file not supported");
            //TODO:  A better message response to user on failure.
            return next();
        }
        sendEmail(toEmail);
    }

    
    
};

var sendEmail = function(email, done) {
    pathToAttachment = 'C:\\Users\\emr\\Desktop\\web\\project3-ui\\resumes\\'+newFileName;
    attachment = fs.readFileSync(pathToAttachment).toString("base64");
    console.log('this is caalled function',toEmail);
    const msg = {
      to: toEmail,
      from: 'loknath450@gmail.com',
      subject: 'Advance Record Management Copes ',
      text: 'Here I am attaching the requested document  ',
      attachments: [
        {
          content: attachment,
          filename: "attachment.pdf",
          type: "application/pdf",
          
          disposition: "attachment"
        }
      ]
    };
    
    sgMail.send(msg).catch(err => {
        
      console.log(err);
    });
       console.log("done");

    
  };
app.post('/uploadResume', multer(multerConfig).single('resume'), function (req,file, res) {
    console.log('this is real file',req.file);
    
       
});

app.get("/getAllStudents", function (req, res) {
    console.log('Called getAllStudents');
    sql.query('SELECT * from student', function (err, rows, fields) {
        if (err) {
            console.log('Error while performing Query.', err);
            return res.json({ 'error': true, 'message': 'Error occurred' + err });
        } else {
            console.log('Existing data: ', rows);
            res.json(rows);
        }
    });
});

app.get("/getAllFiles", function (req, res) {
    console.log('Called getAllFiless');
    fs.readdir("C:\\Users\\emr\\Desktop\\web\\project3-ui\\resumes", (err, files) => {
        files.forEach(file => {
          console.log(file);
        });
        res.json(files);
      });
});

app.post("/createApplication", function (req, res) {
    console.log('req', req.body.email);
    toEmail = req.body.email;
    console.log('email to',toEmail)
   
    let newApplication = req.body;
    let appModel = {
        firstname: newApplication.firstname,
        lastname: newApplication.lastname,
        email: newApplication.email,
        suid: newApplication.suid
    }
    sql.query("INSERT INTO student set ?", appModel, function (err, rows) {
        if (err) {
            console.log('Error while performing Query.', err);
            return res.json({ 'error': true, 'message': 'Error occurred' + err });
        } else {
            console.log('The solution is: ', rows);
            res.json(rows);
        }
    });
    
});

//Any routes will be redirected to the angular app
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'project3-ui/getAllFiles.html'));
});
app.get('getAllFilesP', function (req, res) {
    res.sendFile(path.join(__dirname, 'project3-ui/getAllFiles.html'));
});


//Starting server on port 8081
app.listen(8081, () => {
    console.log('Server started!');
    console.log('on port 8081');
});



