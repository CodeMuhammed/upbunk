(function(){

  angular
       .module('customControllers'  , [])

       .controller('mainController' , function($scope, $rootScope , $state ,  $timeout, $mdSidenav,$mdToast ,  $mdMedia, ssSideNav , $log , Auth){

             //Tests if user is on a desktop device
             $scope.bigScreen = function(){
                 return $mdMedia('gt-md'); //
             };

             //
             $scope.auth = Auth.isAuth();

             //closes sidenav
             $scope.close = function (side) {
                 $mdSidenav(side).close()
                  .then(function () {
                    $log.debug("close is done "+side);
                  });
              };
              
              //toggles sidenav to the left or right depending on auth status
              $scope.toggle = function(side){
                 if(side == 'right'){
                     $scope.view = 'signin';
                     $scope.oldUser = {};
                     $scope.newUser= {};
                     $scope.retrieve = {};
                 }
                 $mdSidenav(side)
                  .toggle()
                  .then(function () {
                    $log.debug("toggle left is done");
                  });
              };

            //ssSide menu 
            $scope.menu = ssSideNav;

            // Listen event SS_SIDENAV_CLICK_ITEM to close menu
            $rootScope.$on('SS_SIDENAV_CLICK_ITEM', function() {
                $mdSidenav('left').close();
            });

            //changes tabs view
            $scope.toggleView = function(view){
                $scope.view = view;
            }

            //
            $scope.onSwipe =  function(side){
                 $scope.close(side);
            };

            //
            $scope.signIn = function(oldUser){
                 $scope.processing = true;
                 Auth.signin(oldUser).then(function(status){
                     $scope.loggedInUser = Auth.getuser();
                     $scope.close('right');
                     $scope.auth = Auth.isAuth();
                     $scope.processing = false;
                 } , function(errObj){
                     if(angular.isObject(errObj)){
                          $scope.oldEmailVerdict= false;
                          $scope.passwordVerdict= false;

                          if(errObj.username){
                               $scope.oldUser.username = '';
                               $scope.oldEmailVerdict = true;
                          }
                          if(errObj.password){
                               $scope.oldUser.password = '';
                               $scope.passwordVerdict = true;
                          }
                     }
                      
                      $scope.processing = false;
                 });
            }


          //
          $scope.recoverPassword = function(details){
               $scope.processing = true;
               Auth.recoverPassword(details).then(
                   function(status){
                      $scope.processing = false;
                      $mdToast.show($mdToast.simple().content(status));
                      $scope.close('right');
                   },
                   function(errObj){
                        $scope.processing = false;

                        if(errObj.username){
                             $scope.retrieve.username = '';
                             $scope.recoverVerdict = true;
                        }
                   }
               );
               
          }

            //
            $scope.signUp = function(newUser){
                newUser.favourites = [];
                newUser.unlocked = [];
                newUser.profile_details = {
                    img : 'src/img/upbunk-short-logo.png',
                    department : '',
                    level : '',
                    sex  : '',
                    bio : '',
                    phone : newUser.phone,
                    fullname : newUser.fullname
                };

                $scope.processing = true;
                console.log(newUser);
                Auth.signup(newUser).then(
                    function(status){
                      $scope.loggedInUser = Auth.getuser();
                      $scope.auth = Auth.isAuth();
                      $scope.close('right');
                      $scope.processing = false;
                      
                 } , function(errObj){
                      $scope.newEmailVerdict= false;
                      $scope.usernameVerdict= false;

                      if(errObj.email){
                           $scope.newUser.email = '';
                           $scope.newEmailVerdict = true;
                      }
                      if(errObj.username){
                           $scope.newUser.username = '';
                           $scope.usernameVerdict = true;
                      }
                      $scope.processing = false;
                 });
            }

           //
           $scope.signOut = function(){
               Auth.signout().then(
                function(status){
                   $scope.loggedInUser = undefined;
                   $scope.auth = Auth.isAuth();
                   $scope.close('left');
                   $state.go('o.search');
               } , 
               function(err){
                  alert(err);
               });
           }

          //Goto home state wheneverr the applicattion is manually reloaaded and login automatically
          //@todo maintain state
          $state.go('o.search');

          //The initial attempt to automatically sign a user in based on session information
          if(!Auth.isAuth()){
              $scope.signIn({});
          }
          
        })

        //Controller taking care of search logics
        .controller('searchController' , function($scope , $rootScope , $window , $mdMedia, $mdDialog , $mdToast , $filter , $timeout , $log , $state , $stateParams , Search , Apartment , Auth){
              
               //Defines how user is to transition to the new listing tab : manually or automatically
               $scope.editorMode = 'manual';
               
               //
                $scope.bigScreen = function(){
                 return $mdMedia('gt-md');
                };

               //
               
                selected = null,
                previous = null;

                $scope.selectedIndex = 0;
                
                //
                $scope.$watch('selectedIndex', function(current, old){
                     if(current == 1 && $scope.editorMode == 'manual'){
                         $scope.infoSet = false;
                         Apartment.setEditorInfo({id : -1});
                         $scope.infoSet = true;
                     }

                     else if (current == 1 && $scope.editorMode == 'auto'){
                         $scope.editorMode = 'manual';
                         $scope.infoSet = true;
                     }
                     
                     else if(current != 1){
                         $scope.infoSet = false;
                         $scope.editorMode = 'manual';
                     }
                     
                     
                });

                //Logic takes care of search box informations
                Search.queryObjectFn().then(function(object){
                      $scope.searchFields  = object;
                });

                //minimum requirement for refinement of search or searching for apartment to commence
                $scope.minReq = function(){
                    var status = false;
                    angular.forEach($scope.searchFields , function(field){
                        if(field.selectedItem == '' || field.selectedItem == undefined){
                           status = true;
                        }
                    });
                    return status;
                }
                
                //The paginates search input fields on large screen
                $scope.startIndex = 0;
                $scope.refine = function(index){
                     $scope.startIndex = index;
                };

                //controls views to display
                $scope.isSmall = function(){
                     return ! $mdMedia('gt-md');
                }

                //
                $scope.scrollToSearch = function(){
                    $window.scrollY = 500;
                    console.log($window);
                }

                // Takes the parameters supplied in the search fields and queries the database for results 
                $scope.showResults  = function(){
                    $scope.processing = true;
                    $scope.resultScreen = false;
                    var queryParams = {};
                    angular.forEach($scope.searchFields , function(field){
                        queryParams[angular.lowercase(field.placeholder)] = field.selectedItem;
                    });
                    
                    Apartment.search(queryParams).then(
                      function(status){
                          $scope.processing = false;
                          Apartment.savePageDetails({view : 'bunks', page : 1});
                          if($scope.bigScreen()){
                            $scope.resultScreen = true;
                            $scope.activeView = 'bunks';
                          }
                          else{ 
                            $state.go('o.search.results');
                          }
                         
                      }  , 
                      function(err){
                          $scope.processing = false;
                          $mdToast.show($mdToast.simple().content(err));
                      });
                    
                }
            

              //
              $rootScope.$on('bunkview' , function(e , a){
                   $scope.activeView = a.view;
              });

              //
              $rootScope.$on('switchEdit' , function(e , a){
                   $scope.editorMode = 'auto';
                   $scope.selectedIndex = 1;
              })

              //
              if(angular.isDefined($state.$current.data.switchEdit)){
                   if($state.$current.data.switchEdit == 1){
                        $scope.editorMode = 'auto';
                        $scope.selectedIndex = 1;
                   }  
              };

        })
      
       //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
       //Takes care off logic backing the search results 
       .controller('s_resultsController' , function($scope , $rootScope , $q,   $state , $mdMedia , $mdDialog, $mdToast , $interval , $timeout,  $filter,  Search, Apartment , Auth){
     
          //
          $scope.bigScreen = function(){
              return $mdMedia('gt-md');
          };
          
          //Initial page data setup
          $scope.pageDetails = Apartment.getPageDetails();
          $scope.favouritesActive = $scope.pageDetails.view == 'favourites';
          $scope.totalApartments = Apartment.get();

          //
          var originatorEv;
          $scope.announceClick = function(item , index) {
              $scope.totalApartments = Apartment.get();
              $scope.pageDetails = Apartment.getPageDetails();
              $scope.searchFields[index].selectedItem = item;
              originatorEv = null;

              //
              var temp = 0;
              $scope.filteredApartments = [];
              if(angular.isDefined($scope.searchFields)){
                   angular.forEach($scope.totalApartments , function(apartment){
                        if((apartment.price_range == $scope.searchFields[3].selectedItem && apartment.apartment_type == $scope.searchFields[2].selectedItem) || $scope.pageDetails.view != 'bunks'){
                            $scope.filteredApartments.push(apartment);
                            temp++;
                        }
                   });
                   if(temp==0){
                       $scope.noResult = true;
                   }
                   else{
                       $scope.noResult = false;
                   }
              }  
              initPaging();
              $scope.gotoPage(); 
          };
          
          //Takes care off logic backing the search results pagination
          var pageSize = 5;

          $scope.gotoPage = function() {
            if($scope.filteredApartments){
                 $scope.apartments = [];

                 //@TODO when data is plenty update pagination logic
                 var startIndex = ($scope.currentPage-1)* pageSize;
                 $scope.apartments = angular.copy($scope.filteredApartments).splice(startIndex , pageSize);
            }
          };

          //
          function initPaging() { 
                $scope.currentPage = $scope.pageDetails.page;
                $scope.step = $scope.bigScreen() ? 5 : 1;
                $scope.total = $scope.filteredApartments ? Math.ceil($scope.filteredApartments.length / pageSize) : 1;
          }
          initPaging();

          //
          $scope.showApartment = function(ev , apartment) {
              $scope.currentId = apartment._id;
              Apartment.setActive(apartment);
              $scope.pageDetails.page = $scope.currentPage;
              Apartment.savePageDetails($scope.pageDetails);

              if($scope.bigScreen()){
                   $rootScope.$broadcast('bunkview' , {view : 'bunk'});
              }
              else{
                 $state.go('o.search.results.id' , {id : apartment._id});
              } 
          };

          //This makes the search querry object availlable to the view
          Search.queryObjectFn().then(function(object){
                $scope.searchFields  = object;

                //displays empty error message for the first time the search results are being loaded
                if($scope.totalApartments.length > 0){
                   $scope.announceClick($scope.searchFields[0].querySearch()[0] , 0);
                }
                else {
                   $scope.noResult = true;
                }
                
          });

 
          //
          $scope.deleteListing = function(apartment , ev){
              //@todo make deleted items remove from view
              // Appending dialog to document.body to cover sidenav in docs app
                var confirm = $mdDialog.confirm()
                      .title('Action is permanent !')
                      .content('Are you sure you want to delete this listing ?')
                      .ariaLabel('Delete Apartment')
                      .targetEvent(ev)
                      .ok('delete')
                      .cancel('cancel');
                 $mdDialog.show(confirm).then(
                  function() {
                        Apartment.remove(apartment).then(
                          function(status){
                              $scope.totalApartments = Apartment.get();
                              var temp = $scope.currentPage;
                              $scope.announceClick($scope.searchFields[0].querySearch()[0] , 0);
                              $scope.currentPage =  temp;
                              $mdToast.show($mdToast.simple().content(status));

                              //@TODO when deleting an item, 
                          },
                          function(err){
                              $mdToast.show($mdToast.simple().content(err));
                          });
                 },
                 function() {
                }); 
              
          }

          //
          $scope.editListing = function(_id){
               $scope.eMode = true;
               Apartment.setEditorInfo({id : _id});
               if($scope.bigScreen()){
                   $rootScope.$broadcast('switchEdit');
               }
               else {
                 //@todo enable editor for mobile devices
                 $state.go('o.search');
               }
               
          }
          

          //
          $scope.unlockedActive  = false;
          $scope.toggleFavourites = function(favArr){
               $scope.processing = true;
               
               var promise = $q.defer();
               if(Auth.isAuth()){
                    if($scope.favouritesActive){
                        $scope.processing = false;
                        $scope.favouritesActive = false;
                        $scope.unlockedActive  = false;

                        //@do things right here then save favourites
                        if(Apartment.getPageDetails().view == 'favourites'){
                              //for first time excecution
                              Apartment.savePageDetails({view : 'bunks', page : 1});
                         }


                        var temp = $scope.currentPage;
                        $scope.announceClick($scope.searchFields[0].querySearch()[0] , 0);

                        Apartment.savePageDetails({view : 'favourites' , page : temp});
                        console.log({view : 'favourites' , page : temp});
                    }

                    else {
                          var favArr = Auth.getuser().favourites;
                          var unlocked = Auth.getuser().unlocked ? Auth.getuser().unlocked : [];

                          //                          
                          if($scope.unlockedActive){
                              favArr = unlocked;
                          }

                          Apartment.getFavourites(favArr).then(
                               function(results){
                                     promise.resolve('favourites active');
                                     $scope.processing = false;
                                     $scope.favouritesActive = true;
                                     
                                     //@todo synchronize favourites to the view
                                     if(Apartment.getPageDetails().view == 'bunks'){
                                          //for first time excecution
                                          Apartment.savePageDetails({view : 'favourites', page : 1});
                                     }

                                     var temp = $scope.currentPage;
                                     $scope.announceClick($scope.searchFields[0].querySearch()[0] , 0);
                                     
                                     Apartment.savePageDetails({view : 'bunks' , page : temp});
                               },
                               function(err){
                                   promise.reject('favourites error');
                                   $mdToast.show($mdToast.simple().content(err));
                                   $scope.processing = false;
                                   $scope.favouritesActive = false;
                                   $scope.unlockedActive = false;
                               }
                           );
                    }
               }
               else{
                 $scope.processing = false;
                 $mdToast.show($mdToast.simple().content('sign in to see your favourites'));
               } 

               return promise.promise;
          }

          //
          $scope.toggleUnlocked = function(){
               $scope.processing = true;

               function filterByUnlocked(){
                  
                  $scope.unlockedActive = true;
                  $scope.favouritesActive = false;
                  $scope.toggleFavourites().then(
                       function(status){
                            $scope.processing = false;
                            $mdToast.show($mdToast.simple().content('unlocked active'));
                       },
                       function(err){
                           $scope.processing = false;
                           $mdToast.show($mdToast.simple().content(err));
                       }
                   );

               }

               function filterByFavourites(){
                  
                  $scope.unlockedActive = false;
                  $scope.favouritesActive = false;
                  $scope.toggleFavourites().then(
                       function(status){
                            $scope.processing = false;
                            $mdToast.show($mdToast.simple().content(status));
                       },
                       function(err){
                           $scope.processing = false;
                           $mdToast.show($mdToast.simple().content(err));
                       }
                   );
               }
               
               //@todo test for empty unlocked
               if(Auth.isAuth()){
                  var user = Auth.getuser();
                  if(angular.isDefined(user.unlocked)){
                       if(!$scope.favouritesActive){
                         $scope.toggleFavourites().then(
                             function(status){
                                  if(!$scope.unlockedActive){
                                      filterByUnlocked();
                                  }
                                  
                             },
                             function(err){
                                 $scope.processing = false;
                                 $mdToast.show($mdToast.simple().content(err));
                             }
                         );
                      }

                      else {
                          if(!$scope.unlockedActive){
                              $scope.processing = true;
                              filterByUnlocked();
                          }
                          else {
                              $scope.processing = true;
                              filterByFavourites();
                          }

                      }
                  }

                  else {
                      $scope.processing = false;
                      $mdToast.show($mdToast.simple().content('You have not unlocked any apartmet yet'));
                  }
               }

               else{
                 $scope.processing = false;
                 $mdToast.show($mdToast.simple().content('sign in to see your unlocked apartments'));
               }
               
          }

          //Thiis checks to see if user is transitioning to the editor in whicch case it acts accordingly         
          $rootScope.$on('$stateChangeStart' , function(event , toS , toP , fromS , fromP){
              if($scope.eMode){
                 toS.data.switchEdit = 1;
                 $scope.eMode = false;
              }
              
          });

          //
          $scope.isOwner = function(lister){
               if(Auth.isAuth())
               return  lister == Auth.getuser().username;
               return false;    
          }

          //logic controlling small view
          $scope.openMenu = function($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
          };


       })

       //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
       //Logic controlling profile
       .controller('profileController' , function($scope , $rootScope, $mdMedia , Auth, $mdToast){
            //
            $scope.bigScreen = function(){
                return $mdMedia('gt-md');
            };

            //
            $scope.user = Auth.getuser();

            //
            $scope.updateUser = function(){
                 $scope.processing = true;
                 Auth.updateUser($scope.user).then(
                  function(status){
                      $scope.processing = false;
                      $mdToast.show($mdToast.simple().content('user profile updated'));
                 } , 
                 function(err){
                      $scope.processing = false;
                      $mdToast.show($mdToast.simple().content(err));
                 });
            }

            //
            $scope.$on('uploadCompleted' , function(e , a){
                 $scope.user.profile_details.img = a.img_url;
            })
       })


       //Logic controlling the listing of new apartment 
       .controller('apartmentController' , function($rootScope , $scope , $timeout, $mdToast , $mdMedia  , $mdDialog, $state  ,$stateParams , Search , Auth , Apartment){
            var user = Auth.getuser();
            var editorInfo = Apartment.getEditorInfo();

            $scope.bigScreen = function(){
                return $mdMedia('gt-md');
            };

            //object that contains the apartment listing
            if(editorInfo.data.id != -1){
                $scope.listing = Apartment.get(editorInfo.data.id);
            }
            
            else {
                 $scope.listing = {
                 state : '',
                 school: '',
                 apartment_type: '',
                 location : '',
                 price_range : '',
                 apartment_number: '',
                 date_listed: Date.now(),
                 lister_username : user.username,
                 availability  : 'true',
                 name:'Apartment name',
                 description : 'describe your apartment',
                 images_url : ['src/img/bg7.jpg' , 'src/img/bg9.jpg'],
                 agent_phone : user.phone,
                 facilities : [
                    {
                       name:'Running water',
                       status: false
                    },
                    {
                       name:'Security guard',
                       status: false
                    }, 
                    {
                       name: 'Tiled floor',
                       status: false
                    },
                    {
                       name: 'Wardrobe',
                       status: false
                    },
                    {
                       name: 'Cable TV',
                       status: false
                    }
                 ],
                 reviews :{
                   security : 1,
                   proximity: 1,
                   facilities: 1
                 },
                 interested_bunkees : []
              };
            }

           //If a facility is available in the apartment
           $scope.exists = function(item){
               return item.status;
           }

           //Toggles  a facility on or off
           $scope.toggle = function(item , list){
              var index = list.indexOf(item);
              list[index].status = !list[index].status;
           }

           //Logic takes care of dropdown options
           Search.queryObjectFn().then(function(object){
                  $scope.searchFields  = object;

                  //update values in searchFields with correxsponding listing values
                  angular.forEach($scope.searchFields , function(field){
                       field.selectedItem = $scope.listing[angular.lowercase(field.placeholder)];
                       field.selectedItemChange(field.selectedItem);
                  });
            });
            

            //minimum requirement before an apartment can be saveed
            //@todo include three images and at least three features stated
            $scope.minReq = function(){
                var status = false;
                angular.forEach($scope.searchFields , function(field){
                    if(field.selectedItem == '' || field.selectedItem == undefined){
                       status = true;
                    }
               });
                return status;
            }
 
            //This listens for when the uploader is done uploading a file
            $scope.$on('uploadCompleted'  , function(e , a){
                var index = $scope.listing.images_url.indexOf(a.img_url);
                if(index<0){
                    $scope.listing.images_url.push(a.img_url);
                    if($scope.listing.images_url.length==8){
                      $mdToast.show($mdToast.simple().content('maximum number of images per apartment reached'));
                      $rootScope.$broadcast('stopUpload' , {});
                    }
                }
                else{
                   $mdToast.show($mdToast.simple().content('This image already exists'));
                }
               
            });
            
            //This takes care of deleting an image
            $scope.deleteImage = function(image , ev){
               // Appending dialog to document.body to cover sidenav in docs app
                var confirm = $mdDialog.confirm()
                      .title('Do you want to delete this image ?')
                      .content('<div layout="column" style="max-width:300px" layout-align="center center"><img src="'+image+'" style="width:100%;"></div>')
                      .ariaLabel('Delete image')
                      .targetEvent(ev)
                      .ok('delete')
                      .cancel('cancel');
                $mdDialog.show(confirm).then(
                  function() {
                      var index = $scope.listing.images_url.indexOf(image);
                      $scope.listing.images_url.splice(index , 1);
                      $rootScope.$broadcast('openUpload' , {});
                      $mdToast.show($mdToast.simple().content('image deleted'));
                      
                 },
                 function() {
                });
            }
            
             //Takes care of agent details
            $scope.searchForAgent = function(phone){
                 $scope.agentsearch = false;
                 var timeout = $timeout(function(){
                     $scope.searchdone = false;
                     if(phone){
                         if(phone.length == 11 && /^[0-9]+$/.test(phone)){
                            $scope.agentsearch = true;
                            Auth.getAgent(phone).then(
                                 function(result){
                                     $scope.agentDetails = result;
                                     $scope.searchdone = true;
                                     $scope.agentsearch = false;
                                 },
                                 function(err){
                                      $mdToast.show($mdToast.simple().content(err));
                                 }
                            );
                         }
                     }
                     
                     
                 } , 3000); 
            };
            $scope.searchForAgent($scope.listing.agent_phone);

            //
            $scope.saveAgent = function(){
                 if(angular.isDefined($scope.agentDetails)){
                      $scope.processing = true;
                      if($scope.agentDetails._id){
                          Auth.updateAgent($scope.agentDetails).then(
                              function(result){
                                  $mdToast.show($mdToast.simple().content(result));
                                  $scope.processing = false;
                              },
                              function(err){
                                  $mdToast.show($mdToast.simple().content(err));
                                  $scope.processing = false;
                              }
                          );
                      }
                      else {
                          Auth.addAgent($scope.agentDetails).then(
                              function(result){
                                  $scope.agentDetails = result;
                                  $mdToast.show($mdToast.simple().content('Agent added successfully'));
                                  $scope.processing = false;
                              },
                              function(err){
                                  $mdToast.show($mdToast.simple().content(err));
                                  $scope.processing = false;
                              }
                          );
                      }
                 }
            }


            //This takes care of synchronising the listing online
            $scope.processing = false;

            $scope.saveListing = function(){

                $scope.processing = true;
                angular.forEach($scope.searchFields , function(s_field){
                       $scope.listing[angular.lowercase(s_field.placeholder)] = s_field.selectedItem;
                });
                if($scope.listing._id){
                    Apartment.update($scope.listing).then(
                      function(result){
                            $scope.processing = false;
                            $mdToast.show($mdToast.simple().content(result));
                            $scope.saveAgent();
                        },
                        function(err){
                            $scope.processing = false;
                            $mdToast.show($mdToast.simple().content('Please signin above to save your listing'));
                      });
                }
                else{
                      Apartment.add($scope.listing).then(
                        function(result){
                            $scope.processing = false;
                            $scope.listing = result;
                            $mdToast.show($mdToast.simple().content('Listing added successfully'));
                            $scope.saveAgent();
                        },
                        function(err){
                            $scope.processing = false;
                            $mdToast.show($mdToast.simple().content(err));
                        });
                 }
            }

           
       })

       //logic for individial search result
       .controller('s_resultController' ,  function ($scope,$rootScope , $interval , $mdDialog , $mdMedia ,  $mdToast, $mdBottomSheet, $state , $stateParams, Search , Apartment , Auth) {
             // 
             $scope.bigScreen = $mdMedia('gt-md');
              
              //
              if(angular.isDefined($stateParams.id)){
                   $scope.apartment = Apartment.get($stateParams.id);
              }
              else {
                   $scope.apartment = Apartment.getActive(); 
              }
              
               //This makes the search querry object availlable to the view
                Search.queryObjectFn().then(function(object){
                      $scope.searchFields  = object;          
                });

              //share integration
              $scope.link  = 'www.upbunk.com';
              $scope.sharePost = 'Students apartment search made easy in Nigerian higher institutions www.upbunk.com';
            
              //
              $scope.alertInterest = function(apartment , ev){
                    if(Auth.isAuth()){
                         
                          var user = Auth.getuser();
                          var index = apartment.interested_bunkees.indexOf(user.username);

                          if(index < 0){
                                 //update apartment to server
                                 apartment.interested_bunkees.push(user.username);
                                 Apartment.update(apartment).then(function(result){

                                     if(!angular.isDefined(user.favourites)){
                                         user.favourites = [];
                                     }

                                     if(user.favourites.indexOf(apartment._id) < 0 ){
                                         user.favourites.push(apartment._id);
                                         Auth.updateUser(user).then(
                                             function(){
                                                  $mdToast.show($mdToast.simple().content('Apartment added to your list of favourites'));
                                             },
                                             function(err){
                                                 console.log(err);
                                             }
                                         );
                                    
                                     }

                                 } , 
                                  function(err){
                                     console.log(err);
                                 });
                          }
                          else {
                              //update apartment to server
                                 apartment.interested_bunkees.splice(index , 1);
                                 Apartment.update(apartment).then(function(result){
                                     console.log(user);
                                     user.favourites.splice(user.favourites.indexOf(apartment._id) , 1);

                                     Auth.updateUser(user).then(
                                         function(){
                                              $mdToast.show($mdToast.simple().content('Apartment removed from your list of favourites'));
                                         },
                                         function(err){
                                             console.log(err);
                                         }
                                     );

                                 } , 
                                  function(err){
                                     console.log(err);
                                 });
                          }
                    }
                    else {
                      $mdToast.show($mdToast.simple().content('Please signin to favourite this apartment'));
                    }
              }

              //
              $scope.isFavourite = function(apartment){
                   if(Auth.isAuth()){
                       var user = Auth.getuser();
                       if(angular.isDefined(user.favourites)){
                          var status = false;
                          angular.forEach(user.favourites , function(favId){
                              if(favId == apartment._id){
                                 status = true;
                              }
                          });
                          return status;
                       }
                   }
                   else {
                      return false;
                   }
              }
              
              
              //
              $scope.isOwner = function(lister){
                   if(Auth.isAuth())
                   return  lister == Auth.getuser().username;
                   return false;    
              }

              //
              $scope.isLockedFn = function(){
                   if(Auth.isAuth()){
                         var user = Auth.getuser();
                         if(user.unlocked){
                             var index = user.unlocked.indexOf($scope.apartment._id);
                             if(index>=0){
                                if(!$scope.agentDetails){
                                    Auth.getAgent($scope.apartment.agent_phone).then(
                                         function(result){
                                              $scope.agentDetails = result;
                                               return false;
                                         },
                                         function(err){
                                             $mdToast.show($mdToast.simple().content(err));
                                              return false;
                                         }
                                    );
                                }
                                 
                             }
                             else {
                                 return true;
                             }
                         }
                         else {
                             user.unlocked = [];
                             Auth.updateUser(user).then(
                                  function(status){
                                      $mdToast.show($mdToast.simple().content('user updated'));
                                      return true;
                                  },
                                  function(err){
                                       $mdToast.show($mdToast.simple().content(err));
                                       return false;
                                  }
                             );
                             
                         }
                    }
                    else {
                       return true;
                    }
              }

              //set up a watcher to observer when a user is signed in or not
              var authStatus = Auth.isAuth();
              $scope.isLocked = $scope.isLockedFn();
              var interval = $interval(function(){
                   if(authStatus != Auth.isAuth()){
                        authStatus = Auth.isAuth();
                        $scope.isLocked = $scope.isLockedFn();
                   }
              } , 1000);

              // see if a user has the right to make a call. true when he has already unlocked it
              $scope.checkCall = function(){
                   if($scope.isLocked){
                        $mdToast.show($mdToast.simple().content('Sorry you have to unlock with NGN100'));
                   }
              }

              //This unlocks an apartment and adds it to a users' list of unlocked
              $scope.unlock = function(){
                   if(Auth.isAuth()){
                       var user = Auth.getuser();
                       user.unlocked.push($scope.apartment._id);
                       Auth.updateUser(user).then(
                            function(status){
                                $mdToast.show($mdToast.simple().content('Congratulations you have  unlocked this apartment.'));
                            },
                            function(err){
                                 $mdToast.show($mdToast.simple().content(err));
                            }
                       );
                   }
                   else {
                       $mdToast.show($mdToast.simple().content('Please signin to complete action'));
                   }
              }

              //slidshow logic
              $scope.startIndex = 0;

              $scope.prev = function() {
                 if($scope.startIndex > 0){
                    $scope.startIndex--;
                 }
              };
              $scope.next = function() {
                  if($scope.startIndex < $scope.apartment.images_url.length-1){
                    $scope.startIndex++;
                 }
              };

              //for going back to bunks list
              $scope.back = function(){
                if($scope.bigScreen){
                    $rootScope.$broadcast('bunkview' , {view : 'bunks'});
                }
                else {
                   $state.go('o.search.results');
                }
              }

              //Default review for an apartment
              if(!angular.isDefined($scope.apartment.reviews)){
                   $scope.apartment.reviews = {
                       security : 1,
                       proximity: 1,
                       facilities: 1
                   };
              }

              //
              $scope.updateReview = function(){
                   $scope.processing = true;
                    Apartment.update($scope.apartment).then(
                    function(result){
                          $scope.processing = false;
                          $mdToast.show($mdToast.simple().content(result));
                      },
                      function(err){
                          $scope.processing = false;
                          $mdToast.show($mdToast.simple().content(err));
                    });
              }

               //
              $scope.setReview = function(name  ,score){
                  if(!$scope.isOwner($scope.apartment.lister_username)){
                      $mdToast.show($mdToast.simple().content('You are not a verified agent.'));
                  }
                  else {
                     $scope.apartment.reviews[name] = score;
                      $scope.updateReview();
                  }
              }

              //This returns the approriate color code based on the score of the reviewed frature
              $scope.getColor = function(val , i){
                  if(i>val){
                     return '#ccc';
                  }
                  else if(val >=7){
                     return 'green';
                  }
                  else if(val >=4){
                    return '#F57C00';
                  }
                  else {
                    return 'red';
                  }
              }
        })

       //FAQ controller
       .controller('FAQController' , function($scope , $mdMedia , $http , Search){
            //
             $scope.bigScreen = function(){
                return $mdMedia('gt-md');
            };

            //
            Search.getLegal().then(
                 function(data){
                       $scope.FAQ = data.FAQ;
                 },
                 function(err){
                      alert(err);
                 }
            );
 
            //
            $scope.activeIndex = -1;
            $scope.setActive = function(index){
                 $scope.activeIndex = index;
            }
       });    

    })();