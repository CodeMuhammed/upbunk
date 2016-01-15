(function(){
  'use strict';

  angular.module('customServices' , [])
     //
     .factory('Apartment' , function($q , $http , $timeout){

          //search results that will be shared among coontrollers
          var apartmentResults = [];
          var Favourites = [];
          var active = {};
          var editorInfo = {data : {}};
          var pageDetails = {view : 'bunks' , page : 1};
          
          //
          function search(params){ 
             var promise = $q.defer();
             
              $http({
                  method: 'POST',
                  url: '/api/search',
                  data: {state: params.state , school: params.school , location: params.location}
              })

              .success(function(results){
                  apartmentResults = results;
                  promise.resolve(true);
              })

              .error(function(err){
                  promise.reject(err);
              });

             return promise.promise;
          }

          //
          function get(id){
               if(id){
                   var temp = {};
                   angular.forEach(apartmentResults , function(apartment){
                       if(apartment._id == id){
                           temp = apartment;
                       }
                   });
                   return temp;
               }
               else{
                  return pageDetails.view == 'bunks' ? apartmentResults : Favourites;
               }
          }

          //
          function remove(listing){
                var promise = $q.defer();

               $http({
                  method: 'DELETE',
                  url: '/api/apartments/'+listing._id,
               })
               .success(function(status){
                    apartmentResults.splice(apartmentResults.indexOf(listing) , 1);
                    if(Favourites.length >0){
                        Favourites.splice(Favourites.indexOf(listing) , 1);
                    }
                    promise.resolve(status);
               })
               .error(function(err){
                    promise.reject(err);
               });

               return promise.promise;
          }

          //
          function add(listing){
               var promise = $q.defer();

               $http({
                  method: 'POST',
                  url: '/api/apartments/1',
                  data: listing
               })
               .success(function(data){
                    promise.resolve(data);
               })
               .error(function(err){
                    promise.reject(err);
               });

               return promise.promise;
          }

          //
          function update(listing){
               var promise = $q.defer();

               $http({
                  method: 'PUT',
                  url: '/api/apartments/'+listing._id,
                  data: listing
               })
               .success(function(data){
                    promise.resolve(data);
               })
               .error(function(err){
                    promise.reject(err);
               });

               return promise.promise;
          }
          

          //
          function setActive(apartment){
              active = apartment;
          };

          // 
          function getActive(){
              return active;
          }
          

           //
          function setEditorInfo(info){
              editorInfo.data = info;
          };

          // 
          function getEditorInfo(){
              return editorInfo;
          }

          //
          function getFavourites(favArr) {
               var promise = $q.defer();
               if(favArr.length == 0){
                    promise.reject('You have not yet favourited any apartment yet');
               }
               else {
                    if(Favourites.length == favArr.length){
                         promise.resolve(Favourites);
                    }
                    else {
                        $http({
                            method : 'POST',
                            url : '/api/favourites',
                            data: {favourites : favArr}
                        })
                        .success(function(data){
                             Favourites = data;
                             promise.resolve(Favourites);
                        })
                        .error(function(err){
                             promise.reject(err);
                        });
                    }
               }

               return promise.promise;
          }
          
          //
          function savePageDetails(details){
              pageDetails = details;
          };

          // 
          function getPageDetails(){
              return pageDetails;
          }

           return {
                search : search,
                remove : remove,
                add    : add,
                update : update,
                get    : get,
                getActive : getActive,
                setActive : setActive,
                setEditorInfo : setEditorInfo,
                getEditorInfo : getEditorInfo,
                getFavourites : getFavourites,
                savePageDetails: savePageDetails,
                getPageDetails: getPageDetails
           };
     })

     //
     .factory('Search' , function($q , $http , $filter , $timeout  , $interval, $rootScope , Apartment){
        
         //A map object containing every states and apartments including the locations of the apartments 
        //that have been indexed on upbunk
        var mapObject = [];
        var legal = {};
        var Features;

        //Get map object from server
        $http.get('src/json/mapObject.json')
           .success(function(data){
                mapObject = data.objectArray;
                updateMapIndex();
           })
           .error(function(err){
                alert(err);
           });

         //This initializes the mapIndex with the mapObject
         var mapIndex = {};
         function updateMapIndex(){
            mapIndex = {
               data :  mapObject,
               getStates : function(){
                   var states=[];
                   angular.forEach(this.data , function(data){
                        states.push(data.state);
                   });
                   return states;
               },
               getSchools : function(state){
                   var schools = [];
                   angular.forEach(this.data , function(data){
                        if(angular.lowercase(data.state) == angular.lowercase(state)){
                            angular.forEach(data.schools , function(schoolObj){
                                schools.push(schoolObj.name);
                            });
                        }
                   });
                   return schools;
               },
               getLocations : function(state , school){
                    var locations = [];
                    angular.forEach(this.data , function(data){
                        if(angular.lowercase(data.state) == angular.lowercase(state)){
                            angular.forEach(data.schools , function(schoolObj){
                                if(angular.lowercase(schoolObj.name) == angular.lowercase(school)){
                                    locations = schoolObj.locations;
                                }
                            });
                        }
                   });
                   return locations;
               }, 
               getPriceRange : function(){
                    return  ['40k-50k' , '50k-60k' , '70k-100k' , '120k-150k' , '200k and above'];
               },
               getApartmentType : function(){
                    return  [ 'single bedroom' ,'single bedroom Self-con' , '2 bedroom Self-con' , '3 bedroom Self-con' , '4 bedroom Self-con'];
               }
            }; 

            //After the map index is updated, init query object
            initQueryObject();
         }
        
         
         //Initializes the query objects containing all the search params
         var  queryObject = [];
         function initQueryObject(){
             queryObject = [
               {
                  options : mapIndex.getStates(),
                  temp : mapIndex.getStates(),
                  placeholder : 'State',
                  isDisabled : false,
                  nocache : false,
                  selectedItem : '',
                  searchText : '',
                  searchTextChange : function(text){
                      this.temp = angular.copy(this.options);
                      this.temp = $filter('filter')(this.temp  , text);
                  },
                  selectedItemChange : function(item){
                     this.selectedItem = item;
                     this.searchText = item;
                     queryObject[1].options = mapIndex.getSchools(this.selectedItem);
                     queryObject[1].temp = mapIndex.getSchools(this.selectedItem);
                  },
                  querySearch : function(){
                      return this.temp;
                  }
               },
               {
                  options : [],
                  temp : [],
                  placeholder : 'School',
                  isDisabled : false,
                  nocache : false,
                  selectedItem : '',
                  searchText : '',
                  searchTextChange : function(text){
                     this.temp = angular.copy(this.options);
                     this.temp = $filter('filter')(this.temp  , text);
                  },
                  selectedItemChange : function(item){
                     this.selectedItem = item;
                     this.searchText = item;
                     queryObject[4].options = mapIndex.getLocations(queryObject[0].selectedItem  , this.selectedItem);
                     queryObject[4].temp = mapIndex.getLocations(queryObject[0].selectedItem  , this.selectedItem);
                  },
                  querySearch : function(){
                      return this.temp;
                  }
               },
               {
                  options : mapIndex.getApartmentType(),
                  temp : mapIndex.getApartmentType(),
                  placeholder : 'Apartment_type',
                  isDisabled : false,
                  nocache : false,
                  selectedItem : '',
                  searchText : '',
                  searchTextChange : function(text){
                    this.temp = angular.copy(this.options);
                    this.temp = $filter('filter')(this.temp  , text);
                  },
                  selectedItemChange : function(item){
                     this.selectedItem = item;
                     this.searchText = item;
                  },
                  querySearch : function(){
                      return this.temp;
                  }
               },
               {
                  options : mapIndex.getPriceRange(),
                  temp : mapIndex.getPriceRange(),
                  placeholder : 'price_range',
                  isDisabled : false,
                  nocache : false,
                  selectedItem : '',
                  searchText : '',
                  searchTextChange : function(text){
                     this.temp = angular.copy(this.options);
                     this.temp = $filter('filter')(this.temp  , text);
                  },
                  selectedItemChange : function(item){
                     this.selectedItem = item;
                     this.searchText = item;
                  },
                  querySearch : function(){
                      return this.temp;
                  }
               },
               {
                  options : [],
                  temp : [],
                  placeholder : 'Location',
                  isDisabled : false,
                  nocache : false,
                  selectedItem : '',
                  searchText : '',
                  searchTextChange : function(text){
                     this.temp = angular.copy(this.options);
                     this.temp = $filter('filter')(this.temp  , text);
                  },
                  selectedItemChange : function(item){
                     this.selectedItem = item;
                     this.searchText = item;
                  },
                  querySearch : function(){
                      return this.temp;
                  }
               }
            ];
         } 

         //
         function queryObjectFn(){
            var promise = $q.defer()

            var interval = $interval(function () {
                if(queryObject.length > 0){
                    promise.resolve(queryObject);
                    $interval.cancel(interval);
                }
            }, 1000);
            
            return  promise.promise;
         }
          
        
         //
         function getMapIndex(){
             return mapIndex;
         }
         
         //
         function getLegal(){
             var promise = $q.defer()
             if(legal.FAQ){
                  promise.resolve(legal);
             }
             else {
                $http.get('src/json/legal.json')
                   .success(function(data){
                        legal = data;
                         promise.resolve(legal);
                   })
                   .error(function(err){
                         promise.reject(err);
                });
             }
             return promise.promise;
         }

         //functions available to other controllers and services
          return {
             queryObjectFn :  queryObjectFn, 
             getMapIndex   : getMapIndex,
             getLegal : getLegal
         };

     })

     //
     .factory('Auth' , function($q , $http , $timeout){

          //
          var User = {};

          function getuser(){
             return User;
          }

          //
          function getusers(bunkeeArr){
              var promise = $q.defer();
              
              $http({
                   method: 'POST',
                   url: '/api/Users',
                   data: bunkeeArr
              })
              .success(function(data){
                  promise.resolve(data);
              })
              .error(function(err){
                  promise.reject(err);
              });

              return promise.promise;
          }

          //
          function updateUser(user){
               var promise = $q.defer();
               
               $http({
                     method: 'PUT',
                     url: '/api/User',
                     data: user
                })
                .success(function(data){
                    promise.resolve(data);
                })
                .error(function(err){
                    promise.reject(err);
                });


               return promise.promise;
          }

          //
           function getAgent(phone){
               var promise = $q.defer();
               var details =  {
                      email : 'email@agency.com',
                      phone : phone,
                      fullname : 'JOhn Doe',
                      agency_name : 'Agency or venture name'
               };

              $http({
                   method: 'GET',
                   url: '/api/agents',
                   params: {agentPhone : phone}
               })
              .success(function(data){
                 if(data._id){
                     details  = data; 
                 }
                 promise.resolve(details);
              })
              .error(function(err){
                  promise.reject(err.error);
              });

               return promise.promise;
          }

          //
          function addAgent(details) {
              var promise = $q.defer();

              $http({
                   method: 'POST',
                   url: '/api/agents',
                   data: details
               })
              .success(function(data){
                  promise.resolve(data);
              })
              .error(function(err){
                  promise.reject(err);
              });

              return promise.promise;
          }

           //
          function updateAgent(details) {
              var promise = $q.defer();

              $http({
                   method: 'PUT',
                   url: '/api/agents',
                   data: details
               })
              .success(function(data){
                  promise.resolve(data);
              })
              .error(function(err){
                  promise.reject(err);
              });

              return promise.promise;
          }
          
          function signin(credentials){
              var promise = $q.defer();
              var errObj = {};
              $http({
                   method: 'POST',
                   url: '/auth/signin',
                   data: credentials
               })
              .success(function(data){
                 User  = data; 
                 promise.resolve('signin success');
              })
              .error(function(err){
                  if(err){
                     promise.reject(err.error);
                  }
                  else{
                    promise.reject('error while signing in ');
                  }
                  

              });

               return promise.promise;
          }

          //
          function signup(userDetails){
              var promise = $q.defer();
              var errObj = {};
              $http({
                   method: 'POST',
                   url: '/auth/signup',
                   data: userDetails
               })
              .success(function(data){
                 User  = data; 
                 promise.resolve('signup success');
              })
              .error(function(err){
                  promise.reject(err.error);
              });

               return promise.promise;
          }

          //
          function recoverPassword(details){
               var promise = $q.defer();

              var errObj = {};
              $http({
                   method: 'POST',
                   url: '/auth/recoverPassword',
                   data: details
               })
              .success(function(status){
                 promise.resolve(status);
              })
              .error(function(err){

                  console.log(err);
                  promise.reject(err);
              });


               return promise.promise;
          }

          //
          function signout(){
              var promise = $q.defer();
              $http({
                   method: 'GET',
                   url: '/auth/signout'
               })
              .success(function(status){
                 User  = {}; 
                 promise.resolve(status);
              })
              .error(function(err){
                  promise.reject(err);
              });

               return promise.promise;
          }

          //
          function isAuth(){
              return angular.isDefined(User.username);
          }

          return {
               signin : signin,
               signup : signup,
               signout: signout,
               recoverPassword : recoverPassword,
               getuser: getuser,
               updateUser: updateUser,
               getusers:getusers,
               getAgent:getAgent,
               addAgent:addAgent,
               updateAgent : updateAgent,
               isAuth : isAuth
          };
     });

})();
