var app = angular.module('sampleApp', ['ngRoute']);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: '/index.html'
  });
}]);

app.factory('socket', ['$rootScope', function($rootScope) {
  //var socket = io.connect("http://144.217.86.48:1235");
  var socket = io.connect("http://localhost:1235");

  return {
    on: function(eventName, callback){
      socket.on(eventName, callback);
    },
    emit: function(eventName, data) {
      socket.emit(eventName, data);
    }
  };
}]);

app.controller('IndexController', function($scope, socket) {
    $scope.profitability = {};
    
    $scope.currentCustomer = {};

    $scope.join = function() {
        socket.emit('add-customer', $scope.currentCustomer);
    };

    socket.on('profitabilityUpdate', function(data) {
        $scope.$apply(function () {
            $scope.profitability[data.coinSymbol] = data;
        });
    });
});