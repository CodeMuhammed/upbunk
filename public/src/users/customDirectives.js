(function(){
  'use strict';

  angular.module('customDirectives' , [])
     .directive('compare' , function(){
           return {
           	   restrict: 'A',
           	   require: 'ngModel',
           	   link: function(scope , elem , attrs , ngModel){
                   ngModel.$validators.compare = function(modelValue){
                        return scope.newUser.password == modelValue;
                   }
           	   }
           }
     })

     .directive('fullname' , function(){
           return {
           	   restrict: 'A',
           	   require: 'ngModel',
           	   link: function(scope , elem , attrs , ngModel){
                   ngModel.$validators.fullname = function(modelValue){
                      if(modelValue){
                           var spaces  = function(){
                               var count =0;
                               for(var i=0; i<modelValue.length; i++){
                                   modelValue[i] == ' ' ? count++ : count;
                               }
                               return count;
                            };
                            return (/^[a-zA-Z ]+$/.test(modelValue) && spaces() == 1 && modelValue[modelValue.length - 1] !== ' ');
                      }
                      else {
                        return false;
                      }
                   	   
                   }
           	   }
           }
     })
      .directive('phone' , function(){
           return {
               restrict: 'A',
               require: 'ngModel',
               link: function(scope , elem , attrs , ngModel){
                   ngModel.$validators.phone = function(modelValue){
                        if(modelValue){
                            return modelValue.length == 11 && /^[0-9]+$/.test(modelValue);
                        }
                        else {
                          return false;
                        }
                       
                   }
               }
           }
     })
       .directive('username' , function(){
           return {
               restrict: 'A',
               require: 'ngModel',
               link: function(scope , elem , attrs , ngModel){
                   ngModel.$validators.username = function(modelValue){
                        if(modelValue){
                            return /^[a-z0-9]+$/.test(modelValue);
                        }
                        else {
                          return false;
                        }
                       
                   }
               }
           }
     })

    .directive('adsBox' , function(){
           return {
              restrict: 'E',
              template : '<md-whiteframe class="md-whiteframe-1dp" flex="grow" layout layout-align="center center" style="min-height:30em; margin-bottom:2em">'+
                             '<span>'+
                                '<a href="https://blockadz.com/?a=BuyAds&id=DU8OFDNNHK2EZ" target="_blank">Advertise in this spot</a>'+
                             '</span>'+
                        '</md-whiteframe>'+
                        '<md-whiteframe class="md-whiteframe-1dp" flex="grow" layout layout-align="center center" style="min-height:15em; margin-bottom:.2em">'+
                             '<span>'+
                                 '<center>'+
                                    '<div>'+
                                      '<iframe scrolling="no" src="//blockadz.com/ads/show/show.php?a=DU8OFDNNHK2EZ&b=U2895NMB0XBJ6" style="overflow:hidden;width:300px;height:250px;" frameborder="0"></iframe>'+
                                    '</div>'+
                                  '</center>'+
                             '</span>'+
                        '</md-whiteframe>'
           }
     })



     .directive('newListing' , function(){
           return {
              restrict: 'E',
              templateUrl : 'views/apartment.tpl.html',
              controller  : 'apartmentController'
           }
     })

     .directive('profile' , function(){
           return {
              restrict: 'E',
              templateUrl : 'views/profile.tpl.html',
              controller  : 'profileController'
           }
     })

      .directive('bunks' , function(){
           return {
              restrict: 'E',
              templateUrl : 'views/s_results.tpl.html',
              controller  : 's_resultsController'
           }
     })

    .directive('bunk' , function(){
           return {
              restrict: 'E',
              templateUrl : 'views/s_result.tpl.html',
              controller  : 's_resultController'
           }
     })

    //Getting our Maps Element Directive
    .directive("myMaps", function(){
        return{
            restrict:'E', //Element Type
            template:'<div flex="grow"></div>', //Defining myApp div
            replace:true, //Allowing replacing
            link: function(scope, element, attributes){

                //Initializing Coordinates
                var myLatLng = new google.maps.LatLng(-34.000,150.000); 
                var mapOptions = {
                    center: myLatLng, //Center of our map based on LatLong Coordinates
                    zoom: 8 //How much we want to initialize our zoom in the map
                    //Map type, you can check them in APIs documentation
                   // mapTypeId: google.maps.MapTypeId.ROADMAP 
                };

                //Attaching our features & options to the map
                var map = new google.maps.Map(document.getElementById(attributes.id), mapOptions);

                //Putting a marker on the center
                var marker = new google.maps.Marker({
                    position: myLatLng,
                    map: map,
                    title:"My Hostel Name"
                });

                marker.setMap(map); //Setting the marker up
            }   
        };
    });

})();