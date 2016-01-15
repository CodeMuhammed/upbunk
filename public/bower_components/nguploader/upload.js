'use strict';


var app = angular.module('fileUpload', [ 'ngFileUpload' /*,'uploadService'*/]);
var version = '4.1.2';

 // cors configurations to enable consuming the rest api
  app.config([
      '$httpProvider' , 
      function($httpProvider){
         $httpProvider.defaults.useXDomain = true;
         $httpProvider.defaults.withCredentials = true;
         delete $httpProvider.defaults.headers.common['X-Requested-With'];
      }
  ]);

app.controller('uploadController', function($scope, $rootScope ,  $http, $timeout, $interval , $compile, Upload /*,uploader*/) {
	$scope.usingFlash = FileAPI && FileAPI.upload != null;
	$scope.fileReaderSupported = window.FileReader != null && (window.FileAPI == null || FileAPI.html5 != false);

	$scope.angularVersion = window.location.hash.length > 1 ? (window.location.hash.indexOf('/') === 1 ? 
			window.location.hash.substring(2): window.location.hash.substring(1)) : '1.2.20';

    //checks if the user has selected a file and uploads it immediately
	$scope.$watch('files' , function(oldVal , newVal){
		if(angular.isDefined(newVal)){
            $scope.uploadFiles($scope.files);
		}
        
	});

	//
	$scope.stopUpload = false;

	$scope.$on('stopUpload' , function(){
		$scope.stopUpload = true;
	});

	$scope.$on('openUpload' , function(){
		$scope.stopUpload = false;
	});

	$scope.uploadFiles= function(files) {
		if (files != null) {
			$scope.percent = 0;
			for (var i = 0; i < files.length; i++) {
				(function(file) {
					$scope.generateThumbAndUpload(file);
				})(files[i]);
			}

          
		}
	};
	
	$scope.generateThumbAndUpload = function(file) {
		if (file != null) {
			if ($scope.fileReaderSupported && file.type.indexOf('image') > -1) {
				$timeout(function() {
					var fileReader = new FileReader();
					fileReader.readAsDataURL(file);
					fileReader.onload = function(e) {
						$timeout(function() {
							   file.dataUrl = e.target.result;
							    $scope.loading = true;
						        uploader.upload([file]).then(
						        	function(results){
						        		$scope.loading = false;
						        		$rootScope.$broadcast('uploadCompleted' , {img_url : results[0]});
						        	},
						        	function(err){
						        		$scope.loading = false;
						        		alert('image not uploaded');
						        	},
						        	function(percent){
						        		$scope.percent = percent;
						        	}
						        );
						});
					}
				});
			}

		}
	};
	

	$timeout(function(){
		$scope.accept = localStorage.getItem('accept'+ version) || 'image/*';
		$scope.acceptSelect = localStorage.getItem('acceptSelect'+ version) || 'image/*';
		$scope.disabled = localStorage.getItem('disabled'+ version) == 'true' || false;
		$scope.multiple = localStorage.getItem('multiple'+ version) == 'true' || false;
		$scope.allowDir = localStorage.getItem('allowDir'+ version) == 'true' || true;
		$scope.$watch('accept+acceptSelect+disabled+multiple+allowDir', function() {
			localStorage.setItem('capture'+ version, $scope.capture);
			localStorage.setItem('accept'+ version, $scope.accept);
			localStorage.setItem('acceptSelect'+ version, $scope.acceptSelect);
			localStorage.setItem('disabled'+ version, $scope.disabled);
			localStorage.setItem('multiple'+ version, $scope.multiple);
			localStorage.setItem('allowDir'+ version, $scope.allowDir);
		});
	});

});

app.directive('myUploader' , function(){
	return {
		restrict:'E',
		controller : 'uploadController',
		template: '<md-whiteframe class="md-whiteframe-2dp" flex layout="row" layout-align="center center" style="margin-bottom:1em; padding:.2em .4em">'+
                    '<md-button ng-disabled="stopUpload" class="md-raised" ngf-select ng-model="files" ng-model-rejected="rejFiles"'+
						 'ngf-multiple="multiple" ngf-accept="accept" accept="{{acceptSelect}}"'+
						 'ngf-disabled="disabled"'+
						 'ngf-min-size="minSize" ngf-max-size="maxSize" >'+
						 '<ng-md-icon icon="add"  md-menu-align-target></ng-md-icon>'+
						 'Add images'+
					'</md-button>'+					
					'<div flex></div>'+
					'<md-whiteframe class="md-whiteframe-2dp" layout="row" flexlayout-align="center center" ng-show="files[0].type.indexOf(\'image\') > -1">'+
					   '<img ng-src="{{files[0].dataUrl}}" width="30px" height="30px"> uploading {{percent}}%'+
					'</md-whiteframe>'+
				'</md-whiteframe>'
	};  
});

app.directive('miniUploader' , function(){
	return {
		restrict:'E',
		controller : 'uploadController',
		template: '<div style="">'+
	                   '<md-button  class="md-raised" ng-hide="loading" ngf-select ng-model="files" ng-model-rejected="rejFiles"'+
							 'ngf-multiple="multiple" ngf-accept="accept" accept="{{acceptSelect}}"'+
							 'ngf-disabled="disabled"'+
							 'ngf-min-size="minSize" ngf-max-size="maxSize" >'+
							 '<ng-md-icon icon="insert_photo"  md-menu-align-target></ng-md-icon>'+
						'</md-button>'+
						'<md-button class="md-raised" ng-show="loading"><md-progress-circular  md-diameter="20" md-mode="determinate" value="{{percent}}"></md-progress-circular></md-button>'+
                   '</div>'
	};
});
