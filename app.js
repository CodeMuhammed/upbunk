//Require dependencies phase
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var errorHandler = require('errorhandler');
var logger = require('morgan');
var compression = require('compression');
var methodOverride = require('method-override');
var busboy = require('connect-busboy');
var passport  = require('passport');
var cors  = require('cors');

var socket = require('socket.io');
var http  = require ('http');
var fs = require('fs');
var path = require('path');


//Instantiate a new express app
var app = express();

//set the model source @TODO use app.set(app.use) here ., Then return a function
//that returns the object
var dbResource = require('./app_server/models/dbResource')('restapi' , app);

//initialize database
dbResource.initColls(function(){
	
	//initialize passport
	var initPassport = require('./app_server/controllers/passportCtrl');
	initPassport(passport , dbResource);

	//Configure the express app
	app.set('port' , process.env.PORT || 3003);

    //cors 
	app.use(cors({credentials: true, origin: true}));
	
	app.use(compression({threshold:1}));
	//app.use(logger('combined'));
	app.use(methodOverride('_method'));

	//configure router to use cookie-parser  ,body-parser 
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended:true}));
	app.use(cookieParser());
	app.use(session({resave:true , secret:'this string' , saveUninitialized:true}));

	//use passport local strategy for login , logout and signup 
	app.use(passport.initialize());
	app.use(passport.session());
	
	//configure express static
    app.use(express.static(path.join(__dirname , 'public')));
    //app.use(favicon(path.join(__dirname , 'public', 'favicon.ico')));
	
	app.get('/' , function(req , res){
		res.json('upbunk deployed :-) just awesome.now');
	});
	
	//Define routes for authentication
	app.use('/auth' , require('./routes/authenticate')(passport , dbResource));

	//api routes starts here
	app.use('/api' , require('./routes/api')(dbResource));

	
	//handle errors using custom or 3rd party middle-wares
	app.use(errorHandler());

	//Start the app
	var server  = http.createServer(app);
	var io = socket.listen(server);

	io.sockets.on('connection' , function(socket){
		socket.on('messageChange' , function(data){
		});
		socket.emit('hey' , {msg:'hello'});
	});

	server.listen(app.get('port') , function(){
		console.log('Server running on port ' ,app.get('port'));
	});
});
