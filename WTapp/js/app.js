(function(){

var app = angular.module("WTapp", ['ngRoute'])
.config(config);

function config($routeProvider){
  $routeProvider
  .when('/', {
    templateUrl: 'js/view.html',
    controller: 'WTctrl'
  })
}

angular.element(function(){
    angular.bootstrap(document.body, ['WTapp']);
});
 //app.controller('WTctrl', ['$scope', function($scope){}]);

})();