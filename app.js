var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var admin = require("firebase-admin");
var helper = require('sendgrid').mail;

console.log(process.env);
admin.initializeApp({
  credential: admin.credential.cert("./serviceAccountKey.json"),
  databaseURL: "https://thursbballdev.firebaseio.com"
});

var db = admin.database();
var ref = db.ref("users");

app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());

var port =  process.env.PORT || 8080; // set our port

// routes for the API

var router = express.Router(); // instance of Express Router

router.use(function(req, res, next){
	console.log('something is happening, please wait');
	next();
});

router.post('/send', function(req, res){
	// send confirmation to user when they are added to the roster for that night
	// required fields:  bball_date, email, firstname

	var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
	var request = sg.emptyRequest({
	  method: 'POST',
	  path: '/v3/mail/send',
	  body: {
	    personalizations: [
	      {
	        to: [
	          {
	            email: req.body.email,
	          },
	        ],
	        substitutions: {
			    ":firstname": req.body.firstname
      		},
	      },
	    ],

	    from: {
	      email: 'thursbballers@gmail.com',
	    },
	    subject: 'ThursBball Confirmation for 1/26/2017',
	    template_id: "a37d3b93-d1c7-47ff-b16e-6ef4e7926d6d",
	  },
	});

	//With callback
	sg.API(request, function(error, response) {
	  if (error) {
	    console.log('Error response received');
	  }
	  console.log(response.statusCode);
	  console.log(response.body);
	  console.log(response.headers);
	});

	// console.log(req.body.recipient_email);
	// console.log(req.body.email_subject);
	
	// from_email = new helper.Email("edisonko@gmail.com");
	// to_email = new helper.Email(req.body.recipient_email);
	// subject = req.body.email_subject;
	// content = new helper.Content("text/plain", "You are confirmed to play at ThursBball on ...");
	// mail = new helper.Mail(from_email, subject, to_email, content);

	// var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
	// var request = sg.emptyRequest({
	// 	method: 'POST',
	// 	path: '/v3/mail/send',
	// 	body: mail.toJSON()
	// });

	// sg.API(request, function(error, response) {
	// 	console.log(response.statusCode);
	// 	console.log(response.body);
	// 	console.log(response.headers);
	// });

	// res.json({ message: 'success'});
});


router.route('/players')
	.get(function(req, res){
		ref.once("value", function(snapshot) {
			console.log(snapshot.val());
			res.json(snapshot.val());
		});
	});

router.route('/players/:players_id')
	.get(function(req, res){
		console.log(req.params.players_id);
		ref.child(req.params.players_id).once("value", function(snapshot){
			res.json(snapshot.val());
		});
	});

router.route('/bballnights')
	.get(function(req, res){
		ref.child('bballnights').once("value", function(snapshot){
			res.json(snapshot.val());
		});
	});


app.use('/api', router);

app.listen(port);
console.log('magic happens on port ' + port);
