var dotenv = require('dotenv');
dotenv.load();

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var admin = require("firebase-admin");
var helper = require('sendgrid').mail;

admin.initializeApp({
  	// credential: admin.credential.cert("./serviceAccountKey.json"),
  	credential: admin.credential.cert(
  	{
		"type": process.env.SERVICE_ACCOUNT,
		"project_id": process.env.PROJECT_ID,
		"private_key_id": process.env.PRIVATE_KEY_ID,
		"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCyEzTFi6U3z86I\n2SqOIRLEJM3l1D+T6kTsny9SDL/bNIDlJ5VP9XuWuFbYZlgNdNhbXRsihgpQxv7o\nuj8UyYnI93okz7oA1KlRrhzCzrFIwrKDN4RX3WqCpmUUvojNS/gGxrYa6+TolmsO\nCi9jUw1fzNkbvhqCyaPH1mQVKixqNxdqvDopLpa/GMdkrkacBh1SPUwYYT79CBbj\nz1CsdsPXyMFgl/wmMtFmc5zxp2B83gs+xNqSqpyCB6zM3TZTzRxOyTRQ++kl74Cr\nW1TfihDqBTDbJ34asGa+1RiEtpFYZBBhK9ndrwqHrJkVfU3jpSaUa1yzJ8aZieRH\nk1ZeXt8lAgMBAAECggEAPZREsHd899Llwg8PFz06pxdvGCYQok7l7MmTbJU6F0yN\nsjDBAniKd3Fhns2tb2HTm6yTwJmHoa1e4w3c2IxlGFj0JRysXrMrpjJGgdtGFTo2\nzwd4vYW02l8+HzFQT2YQ7A71VFP0wbWaaa19+6PxwQoundhchJPEDkwGKgd+em/k\n97r+V5N2tzoYPddvoxrdLsx3G9HO1o3G9/GJbTS5DH+LVmrLgCxKaBdPu/uAuBd0\nUGTkIid8X+3Q2oUveLPyQjGKLnECLHo/4KJzW63KbIz0vk1yJXzDeLUbVEYWAtFQ\nljYRN0EyJ69XW6RCiDOTjI6ukZMzlzdvH0g5kMb8oQKBgQDZtvcvPw8Fplvjljpt\npx57Qe2GncESh2BIXqU8A2LrYrxMOuSoAii29A8QHaAtHSzrjYGK9dYyrvUmM/b7\nmo5AXU06Edf9czpIB+vYqAp6mdAPHmjha7Mnx8H2nvHf5ua1rSFPC1eB6EqsYvKz\nB86I1pipn5Q8jmCxJ7GFFDApqQKBgQDRY7/p2EoJRxZWUG1kYFuD0SYOeF4P95X2\n6umcThkpvYctuTOSjR3gPu5/h5MSCGIxx2l2dXe5Y3GVZwb822NyeLLzXhyVKmf/\nhwXBWLTvzqZqXgakJqMMXYLZURkDn1YS4LKtdnHcIoXYYE+u7SpD9bZ4Mvho/4xl\nmRhPlvdPHQKBgDFPAh7ePk2+RtN9w8/v6LRr0xsJAaBrrr/VR8EW10GOhC0TrZPr\noUMGdZ7lxtBQ6kqTKwLI+PFTtMwpOsfzUkJ7nzEGt498mHeV67GPJYhs67Vw4roj\nRVk+Icz0ZL2cMyZ0hrW7UN9oN/lhE6y+mOVfDQZl0RICAR4+ajNExj+5AoGAOLu7\nOwQEg2EEd1yRVzoYca3QjukkK1VdB6r8owIyJTIaF1Rv2cxshN7oRhuYyLEG0hAC\nzjrjtpJwKxfgN9DFsDVt3yznt67mwMB32bxMQhGO25EgYYeqc+Y+Vt13VpjsfG7v\nWrqV/RxJgagOzwmpgwJnb0f4MJLVGo4RnTb9SS0CgYEArbecw3jdOVAH/kLXgajB\n8TAqBsWUxLOKyJZLavPIbKlhZ/456vtO6e1kASajM89WAn36IHbOiz2OGjdzsmo4\nusNvttqaT8JEmI+hxazXCDllAYE9pTFyegwgifd4rudIx7fp4FOc6cxCtPrVgrQ+\nECUdfdXBjYrGmeubHlmSEa8=\n-----END PRIVATE KEY-----\n",
		"client_email": process.env.CLIENT_EMAIL,
		"client_id": process.env.CLIENT_ID,
		"auth_uri": process.env.AUTH_URI,
		"token_uri": process.env.TOKEN_URI,
		"auth_provider_x509_cert_url": process.env.AUTH_PROVIDER_X509_CERT_URL,
		"client_x509_cert_url": process.env.CLIENT_X509_CERT_URL
  	}
  	),
 	databaseURL: process.env.DATABASEURL
});

var db = admin.database();
var ref = db.ref("users");

app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());

var port =  process.env.PORT || 8080; // set our port

// routes for the API

var router = express.Router(); // instance of Express Router

router.use(function(req, res, next){
	console.log('please wait...');
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
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
			    ":firstname": req.body.firstname,
			    ":date": req.body.date
      		},
	      },
	    ],

	    from: {
	      email: 'thursbballers@gmail.com',
	    },
	    subject: 'ThursBball Confirmation for ' + req.body.date,
	    template_id: "a37d3b93-d1c7-47ff-b16e-6ef4e7926d6d",
	  },
	});

	//With callback
	sg.API(request, function(error, response) {
	  if (error) {
	    console.log('Error response received');
	  } else {
	  	res.json({ message: 'success'});
	  }
	  console.log(response.statusCode);
	  console.log(response.body);
	  console.log(response.headers);
	});

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
