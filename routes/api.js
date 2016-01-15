var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var ObjectId = require('mongodb').ObjectId;

//api routes
module.exports = function(dbResource){
  //models
	var Users = dbResource.model('Users');
	var Apartments = dbResource.model('Apartments');
  var Features = dbResource.model('Features');
  var Agents = dbResource.model('Agents');

	router.use(function(req , res , next){
	   
	 if(req.method==='GET'){
		return next();
	 }

	 else if(req.isAuthenticated()){
	  console.log('This User is authenticated here'); 
	  return next();
	 }

   else if(req.originalUrl == "/api/search"){
    console.log('search requested'); 
    return next();
   }

	 else{
		 console.log('This is not auth ');
		 res.status(403).send("Please sign in above to proceed");
	 }

   });

   router.param('id' , function(req , res , next , id){
	  req.id  = id;
	  return next();
   });

   //=========================================================================================
   //=================================== FAVOURITES===========================================
     router.route('/favourites')
      .post(function(req , res){
             var  favourites = req.body.favourites;
             for(var i = 0; i<favourites.length; i++){
                  favourites[i] = ObjectId(favourites[i]);
             }

             Apartments.find({_id : {"$in": favourites}}).toArray(function(err , results){
                  if(err){
                       res.status(500).send('err favourites get 1');
                  }
                  else if(!results[0]){
                        res.status(500).send('No results were found for your query');
                  }
                  else {
                      res.status(200).send(results);
                  }
             });
             
       })
  
   //========================================================================================
   //============================= APARTMENT ================================================
   router.route('/apartments/:id')
      .get(function(req , res){
      	     Apartments.find({_id : ObjectId(req.id)}).toArray(function(err , result){
                  if(err){
                       res.status(500).send('err apartment get 1');
                  }
                  else if(!result[0]){
                        res.status(500).send('No results were found for your query');
                  }
                  else {
                  	  res.status(200).send(result[0]);
                  }
      	     });
             
       })
      
      .post(function(req , res){
      	     Apartments.insertOne(req.body , function(err,result){
        				if(err){
        					res.status(500).send('Could not create a new listing ');
        				} else {
        					res.status(200).send(result.ops[0]);
        				}
        			}); 
       })

      .put(function(req , res){
      	    req.body._id = ObjectId(req.body._id);
            Apartments.update(
                {_id : req.body._id},
                req.body,
                function(err , result){
                    if(err){
                        res.status(500).send('Not ok apartment was not updated');
                    }
                    else {
                       res.status(200).send('update apartment successful');
                    }
                }
             );
       })

      .delete(function(req , res){
           Apartments.remove({_id : ObjectId(req.id)} , function(err , result){
                 if(err){
                     res.status(500).send('Not ok apartment was not removed');
                 }
                 else{
                     res.status(200).send('Apartment deleted successfully');
                 }
        	});
      });

      router.route('/search')
         .post(function(req , res){
         	  console.log(req.body);
              Apartments.find(req.body).toArray(function(err , results){
                  if(err){
                       res.status(500).send('err apartment get all 1');
                  }
                  else if(!results[0]){
                        res.status(500).send('No results were found for your search');
                  }
                  else {
                  	  res.status(200).send(results);
                  }
      	     });
         });

      router.route('/users')
         .post(function(req , res){
            console.log(req.body);
              Users.find({"username":{"$in":req.body}} , {"profile_details" : 1}).toArray(function(err , results){
                  if(err){
                       res.status(500).send('err Users get all 1');
                  }
                  else if(!results[0]){
                        res.status(500).send('No results were found for your search');
                  }
                  else {
                      res.status(200).send(results);
                  }
             });
         });

      router.route('/user')
        .put(function(req , res){
            req.body._id = ObjectId(req.body._id);
            Users.update(
                {_id : req.body._id},
                req.body,
                function(err , result){
                    if(err){
                        res.status(500).send('User was not updated');
                    }
                    else {
                       res.status(200).send('user updated successfully');
                    }
                }
             );
       })

   //=========================================================================================
   //======================================== AGENTS ==========================================
    router.route('/agents')
       .get(function(req , res){
             console.log('api/agents get '+req.query.agentPhone);
             Agents.find({phone : req.query.agentPhone}).toArray(function(err , results){
                 if(err){
                     res.status(500).send('err Agent get');
                 }
                 else if(!results[0]){
                     console.log('empty agent');
                     res.status(200).send('empty result sent');
                 } 
                 else {
                      console.log(results[0]);
                      res.status(200).send(results[0]);
                  }
             });
        })

       .post(function(req , res){
              Agents.insertOne(req.body , function(err,result){
                if(err){
                  res.status(500).send('Could not create a new agent ');
                } else {
                  res.status(200).send(result.ops[0]);
                }
              }); 
       })

       .put(function(req , res){
            req.body._id = ObjectId(req.body._id);
            Agents.update(
                {_id : req.body._id},
                req.body,
                function(err , result){
                    if(err){
                        res.status(500).send('Agent update error');
                    }
                    else {
                       res.status(200).send('Agent updated successfully');
                    }
                }
             );
       })

   return router;
};
