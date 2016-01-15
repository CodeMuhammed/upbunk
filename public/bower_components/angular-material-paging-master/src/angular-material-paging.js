(function() {
  'use strict';

  angular
    .module('fc.paging', [])
    .directive('wanMaterialPaging', function() {
          return {
            restrict: 'EA',
            scope: {
              wmpTotal: '=',
              position: '@',
              gotoPage: '&',
              step: '=',
              currentPage: '='
            },
            controller: function ($scope) {
              var vm = this;
              vm.index = $scope.currentPage-1;
              vm.step = $scope.step;

              vm.goto = function(index) {
                $scope.currentPage = vm.page[index];
              };

              vm.getoPre = function(){
                $scope.currentPage = vm.index;
                vm.index -= vm.step;
              };

              vm.getoNext = function(){
                vm.index += vm.step;
                $scope.currentPage = vm.index + 1;
              };

              vm.gotoFirst = function(){
                vm.index = 0;
                $scope.currentPage = 1;
              };

              vm.gotoLast = function(){
                vm.index = parseInt($scope.wmpTotal / vm.step) * vm.step;
                vm.index === $scope.wmpTotal ? vm.index = vm.index - vm.step : '';
                $scope.currentPage = $scope.wmpTotal;
              };

              $scope.$watch('currentPage', function() {
                vm.index = $scope.currentPage-1;
                $scope.gotoPage();
                
              });

              $scope.$watch('wmpTotal', function() {
                vm.init();
              });

              vm.init = function() {
                vm.stepInfo = (function() {
                  var i, result = [];
                  for (i = 0; i < vm.step; i++) {
                    result.push(i)
                  }
                  return result;
                })();

                vm.page = (function() {
                  var i, result = [];
                  for (i = 1; i <= $scope.wmpTotal; i++) {
                    result.push(i);
                  }
                  return result;
                })();

              };
            },
            controllerAs: 'vm',
            template: [
              '<div layout="row" class="wan-material-paging" layout-align="{{ position }}">',
              '<span style="color:#000; padding:.3em 1em" ng-click="vm.gotoFirst()"><ng-md-icon icon="skip_previous" md-menu-align-target ></ng-md-icon></span>',
              '<span style="color:#ccc; padding:.3em 1em" ng-click="vm.getoPre()" ng-show="vm.index - 1 >= 0"><ng-md-icon icon="keyboard_arrow_left" md-menu-align-target ></ng-md-icon></span>',
              '<span style="color:{{vm.page[vm.index + i] === currentPage ? \'green\' : \'\'}}; padding:.3em 1em" ng-repeat="i in vm.stepInfo"',
              ' ng-click="vm.goto(vm.index + i)" ng-show="vm.page[vm.index + i]" >',
              ' {{ vm.page[vm.index + i] }}',
              '</span>',
              '<span style="color:#ccc; padding:.3em 1em" ng-click="vm.getoNext()" ng-show="vm.index + vm.step < wmpTotal"><ng-md-icon icon="keyboard_arrow_right" md-menu-align-target ></ng-md-icon></span>',
              '<span style="color:#000; padding:.3em 1em" ng-click="vm.gotoLast()"><ng-md-icon icon="skip_next" md-menu-align-target ></ng-md-icon></span>',
              '</div>'
            ].join('')
          };
        }
      );

})();
