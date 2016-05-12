
"use strict";
var cntxt = angular.module('cntxt', ['ngRoute']);

cntxt.controller('MainController', ['$scope', '$location', function($scope, $location) {
    // We defined an object called 'main' with a single property 'title' that is used
    // by the html view template to get the page's title in the browser tab.
    $scope.main = {};
    $scope.main.url = 'https://www.washingtonpost.com/news/the-switch/wp/2016/05/11/google-to-ban-payday-loan-advertisements/';
    $scope.main.redditToDisplay = [];
    $scope.main.twitterToDisplay = ['1','2','3'];

    //console.log(twitterResponse);


    $scope.getWebInfo = function(url) {
        $location.path('results');
        $scope.getRedditData(url, function(){
            console.log("done!");
        });
    }

    $scope.getRedditData = function(url, doneCallback){
        $scope.main.tempRedditToDisplay = [];
    //console.log(url);
    $.getJSON(
        "http://www.reddit.com/api/info.json?url="+url
        /*"https://www.reddit.com/duplicates/74jbg.json?limit=100"*/, function(resp)
        {
            //console.log(resp.data.children);

            for(var i = 0;i<resp['data']['children'].length; i++){
            var listing = resp['data']['children'][i]['data'];
            if (listing.num_comments > 10){
                listing.topcomment = get_top_comment(listing.subreddit, listing.id);
                $scope[listing.id]={};
                $scope[listing.id]["title"] = listing.title;
                console.log($scope[listing.id]["title"]);
                $scope.main.tempRedditToDisplay.push(listing);
                //console.log($scope.main.redditToDisplay.length);
            }


            // for(var i = 0;i<resp[1]['data']['children'].length; i++){
            // var listing = resp[1]['data']['children'][i]['data'];
            // if (listing.num_comments > 10){
            //     toDisplay.push(listing);
            //     console.log(listing.num_comments);
            // }


            } //END FOR LOOP STARTING AT 31
            for(var j = 0; j<$scope.main.tempRedditToDisplay.length; j++){
                //BUILD REDDIT CARDS HERE mock in sketch file
                //or use ng-repeat....seems like a better option
                //console.log(j);
            }

            //updateRedditToDisplay(tempRedditToDisplay);

                    doneCallback();
        });


}

function updateRedditToDisplay(tempArray){
    $scope.main.redditToDisplay = tempArray;
    console.log($scope.main.redditToDisplay);


}

function get_top_comment(subreddit, id){
  var url = "https://www.reddit.com/r/" + subreddit + "/comments/" + id + ".json?sort=top&limit=1";
  $.getJSON(url, function(resp){
    var topcomment = process_top_comment(resp);
    console.log(topcomment.body)
  });
}

function process_top_comment(resp){
      var thread = resp[0]['data']['children'][0]['data'];

      var comment = resp[1]['data']['children'][0]['data'];
      var obj = {};
      obj['score'] = comment['score'];
      obj['body'] = comment['body'];
      obj['author'] = comment['author'];
      obj['permalink'] = 'https://www.reddit.com' +
                            thread['permalink'] +
                            comment['id']

      return obj;

}






}]);

cntxt.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/', {
            templateUrl: 'mainTemplate.html',
            controller: 'MainController'
        }).
        when('/results', {
            templateUrl: 'results/resultsTemplate.html',
            controller: 'ResultsController'
        }).
        otherwise({
            redirectTo: '/'
        });
    }
]);