var MongoClient  = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var assert = require('assert');
var DBOpened = false;

//This object will hold opened connections to the collections the app uses
var openedColls = {};
var url = '';

//import the language driver
module.exports = function(dbName , app){
   
	//This functions accesses the database and creates a pool of opened 
	//connections to the required collections needed by the app
	var initColls = function (cb) {
		if(!isDBOpened()){
			MongoClient.connect(url , function(err , db){
				if(err){
					throw new Error('DB connection error ');
				} else { 
					assert.equal(null ,err);
					console.log('Connected correcctly to the database');
					openedColls.Users = db.collection('Users');
					openedColls.Apartments = db.collection('Apartments');
					openedColls.Features = db.collection('Features');
					openedColls.Agents = db.collection('Agents');
					return cb();
				}
			});
		} else {
			return cb();
		} 
		
	};
	
    //This function returns the valid collection to the client module
	var model = function(coll){
		if(!openedColls[coll]){
			throw new Error('The model or collection required does not exists');
		}
		return openedColls[coll];
	};
	
	//
	var isDBOpened = function(){
		return DBOpened;
	}
	
	//Set db connection string based on the current environment being worked in...
	if(app.get('env') ==='development'){
       url = 'mongodb://127.0.0.1:27017/upbunk';
	} else {
       url = 'mongodb://'+ process.env.dbuser+ ':'+process.env.dbpassword+'@ds051738.mongolab.com:51738/'+dbName.trim();
	}
	
	return {
		initColls : initColls,
		model : model
	};
};

