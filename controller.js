  var app = angular.module('cntxt', ['ngSanitize','cntxt.services']);
app.controller('controller', function($scope, $http, $q, twitterService) {

    $scope.url = null

    document.getElementById("urlInput")
    .addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode == 13) {
        document.getElementById("urlInput-button").click();
    	}
	});

    $scope.getAllData = function(){
    	getRedditData();
      searchTweets();
    	//drawRedditChart();
    	//getTwitterData();

    	// uncomment the next three lines to get ERR_INSECURE_RESPONSE from twitter api
    	// dataService.getTwitterData().then(function(dataResponse) {
     //    $scope.data = dataResponse;
    	// });
    }

    //load google charts for making charts
    google.charts.load('current', {packages: ['corechart', 'bar']});

   function getRedditData(){
   		//this function also gathers the reddit_chart data and vizualizes it
        console.log($scope.url);

  		$http.get("http://www.reddit.com/api/info.json?url=" + $scope.url)
       		 .then(function(response) {

            $scope.redditResponse = response.data;

            $scope.reddit = [];

            $scope.reddit.topcomments = [];

            $scope.reddit_chart_data = [];

            $scope.twitter_chart_data = [];
            
            for(var i = 0;i<$scope.redditResponse['data']['children'].length; i++){

                var listing = $scope.redditResponse['data']['children'][i]['data'];

                $scope.reddit_chart_data.push({comments: listing.num_comments, subreddit: listing.subreddit});

                if (listing.num_comments > 1){
                    
                    	listing.topcomment = getTopComment(listing.subreddit, listing.id, listing.score);

                	}		

        		}

        	//sort chart data and format it correctly	
        	var sorted_chart_data = $scope.reddit_chart_data.slice(0);

			sorted_chart_data.sort(function(a,b){return b.comments-a.comments});

			var arrayToDataTable_data = [ ['Subreddit', 'Number of Comments'] ];

			if(sorted_chart_data.length >=5){
				var noMoreThanFive = 5;
			} else {
				var noMoreThanFive = sorted_chart_data.length;
			}

			for(var j = 0; j<noMoreThanFive; j++){

				arrayToDataTable_data.push(["/r/"+sorted_chart_data[j].subreddit, parseFloat(sorted_chart_data[j].comments)]);

			}

			var reddit_chart_data = google.visualization.arrayToDataTable(arrayToDataTable_data);

			var reddit_chart_options = {

		      	legend: 'none',

		        title: 'Active Conversations on Reddit',

		        chartArea: {width: '50%'},

		        hAxis: {

		          title: 'Number of Comments',

		          minValue: 0
		        }
		        //,vAxis: {}
		    };

      		var reddit_chart = new google.visualization.BarChart(document.getElementById('reddit-comments-chart'));

      		reddit_chart.draw(reddit_chart_data, reddit_chart_options);

  			}); //end .then function

    }// end getRedditData

function getTopComment(subreddit, id, score){
    var commentsToGet = 1;  
      // if(score > 1000)
      //   {
      //       commentsToGet = 3;
      //   } else {
      //       commentsToGet = 1;
      //   }
    var commentUrl = "https://www.reddit.com/r/" + subreddit + "/comments/" + id + ".json?sort=top&limit=" + commentsToGet;
     
    $http.get(commentUrl)
         .then(function(response){
            //console.log(response.data[1].data.children[0].data.body);
            for(var i = 0; i < commentsToGet; i++){
                
                $scope.reddit.topcomments.push(response.data[1].data.children[i].data);

        			}

           }); //end .then function
	}//end getTopComment



//begin twitter stuff
$scope.tweets = []; //array of tweets

twitterService.initialize();

function searchTweets(){
    twitterService.getMatchingTweets($scope.url).then(function(data){
        console.log(data);
        $scope.tweets = data.statuses;
        //$scope.tweets = $scope.tweets.concat(data);
    }, function(){
        $scope.rateLimitError = true;
    })
}

//using the OAuth authorization result get the latest 20 tweets from twitter for the user
$scope.refreshTimeline = function(maxId) {
    twitterService.getLatestTweets(maxId).then(function(data) {
        $scope.tweets = $scope.tweets.concat(data);
    }, function() {
        $scope.rateLimitError = true;
    });
}

//when the user clicks the connect twitter button, the popup authorization window opens
$scope.connectButton = function() {
    twitterService.connectTwitter().then(function() {
        if (twitterService.isReady()) {
            //if the authorization is successful, hide the connect button and display the tweets
            $('#connectButton').fadeOut(function() {
                $('#getTimelineButton, #signOut').fadeIn();
                $scope.connectedTwitter = true;
            });
        } else {

        }
    });
}

//sign out clears the OAuth cache, the user will have to reauthenticate when returning
$scope.signOut = function() {
    twitterService.clearCache();
    $scope.tweets.length = 0;
    $('#getTimelineButton, #signOut').fadeOut(function() {
        $('#connectButton').fadeIn();
        $scope.$apply(function() {
            $scope.connectedTwitter = false
        })
    });
}

//if the user is a returning user, hide the sign in button and display the tweets
if (twitterService.isReady()) {
    $('#connectButton').hide();
    $('#getTimelineButton, #signOut').show();
    $scope.connectedTwitter = true;
    //$scope.refreshTimeline();
}

});



