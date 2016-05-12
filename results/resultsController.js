

cntxt.controller('ResultsController', ['$scope', '$window', function($scope, $window) {

    $scope.main = {};
    $scope.main.url = '';
    $scope.main.redditResponse = redditResponse;
    $scope.main.twitterResponse = twitterResponse;

    $scope.goToTwitterProfile = function(username){
    	$window.open("https://twitter.com/" + username, '_blank');
    }

    $scope.goToRedditProfile = function(username){
    	$window.open("https://reddit.com/user/" + username, '_blank');
    }

    $scope.goToSubreddit = function(permalink){
    	$window.open("https://reddit.com" + permalink, '_blank');
    }


    //console.log($scope.main.twitterUsers);

}]);