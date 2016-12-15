var app = angular.module('profitabilityCalc', ['ngRoute']);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: '/index.html'
  });
}]);

app.factory('socket', ['$rootScope', function($rootScope) {
  var socket = io.connect("http://144.217.85.254:1235/allCoins");
  //var socket = io.connect("http://localhost:1235");

  return {
    on: function(eventName, callback){
      socket.on(eventName, callback);
    },
    emit: function(eventName, data) {
      socket.emit(eventName, data);
    }
  };
}]);

app.controller('data', function($scope, socket) {
    $scope.coinCounter = 0;
    $scope.powerCost = 0.1;
    $scope.coinArray = [];
    $scope.coinArrayMap = {};
    $scope.profitability = {};
    $scope.hardwareStats = {
      rx470: {
        Ethash : 27,
        Equihash : 200,
        powerETH: 125,
        powerZEC: 125
      },
      7950 : {
        Ethash : 16,
        Equihash : 200,
        powerETH: 220,
        powerZEC: 220
      }
    }
    $scope.coinNames = {
      ETH : "Ethereum",
      ETC : "Ethereum Classic",
      ZEC : "ZCash",
      ZCL : "ZClassic"
    }
    $scope.calculateProfitability = function(coin) {
      coin.profitability = {};
      for (GPU in $scope.hardwareStats) {
        coin.profitability[GPU] = {};
        coin.profitability[GPU].gross = ($scope.hardwareStats[GPU][coin.hashType]/100) * coin.dollarsPerDay;
      }
      //console.dir($scope.coinArray);
    }
    socket.on('profitabilityUpdate', function(data) {
        $scope.$apply(function () {
            if (typeof $scope.coinArrayMap[data.coinSymbol] === 'undefined') {
              console.log("Creating new coin: " + data.coinSymbol + " coinCounter = " + $scope.coinCounter);
              $scope.coinArrayMap[data.coinSymbol] = $scope.coinCounter;
              $scope.coinArray[$scope.coinCounter] = data;
              $scope.coinArray[$scope.coinCounter].profitability = {};
              $scope.coinCounter++;
            } else {
              //console.dir($scope.coinArrayMap[data.coinSymbol]);
              $scope.coinArray[$scope.coinArrayMap[data.coinSymbol]] = data;
            }
            $scope.calculateProfitability($scope.coinArray[$scope.coinArrayMap[data.coinSymbol]]);
        });
    });
    socket.on('connectionReady', function() {
      socket.emit('requestInfo');
    })
});