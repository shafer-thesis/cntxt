
/**
 * Define StatesController for the states component of CS142 project #4
 * problem #2.  The model data for this view (the states) is available
 * at window.cs142models.statesModel().
 */
cntxt.controller('ResultsController', ['$scope', function($scope) {

    $scope.main = {};
    $scope.main.url = '';
    $scope.main.redditResponse = redditResponse;
    $scope.main.twitterResponse = twitterResponse;



    //console.log($scope.main.twitterUsers);

}]);