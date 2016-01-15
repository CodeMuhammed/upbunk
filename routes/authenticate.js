var express = require('express');
var router = express.Router();
module.exports = function(passport , dbResource){
  //
  var Users = dbResource.model('Users');

	//A catch all logic for this route
   router.use(function(req , res , next){
   	  if(req.path === '/signout'){
         next();
   	  }
   	  else if(req.isAuthenticated()){
        console.log('user auth');
		    res.status(200).send(req.user);
	  }
    
      else{
         next();
   	  }	 
   });

   var status = function(req , res ){
       if(req.isAuthenticated()){
		      res.status(200).send(req.user);
	     } 

	    else {
		     res.status(401).send(req.authErrObj);
	     }
   };

  
   router.post('/signup' , passport.authenticate('signup') , function(req , res){
        status(req , res);
   });

   router.post('/signin' , passport.authenticate('signin') , function(req , res){
        status(req , res);
   });

   router.post('/recoverPassword' , function(req , res){
          Users.find({"$or":[{username : req.body.username} , {email : req.body.username}]}).toArray(function(err , result){
              req.authErrObj = {};
              if(err){
               
                req.authErrObj.db =true;
                res.status(500).send(req.authErrObj);
              }
              else if(!result[0]){
                 req.authErrObj.username =true;
                 res.status(500).send(req.authErrObj);
              }
            
              else{
                 res.status(200).send('Password was sent to your email address');
               }
        });
   });
  
	router.get('/signout' , function(req, res){
		console.log('signout called');
		req.logout();
		res.status(200).send('Logged out successfully');
	});

	return router; 
};
