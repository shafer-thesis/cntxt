  var app = angular.module('cntxt', ['ngSanitize','cntxt.services']);
app.controller('controller', function($scope, $http, $q, twitterService) {

    $scope.url = null
    $scope.searchSent = false;
    $scope.invalidUrl = false;

    document.getElementById("urlInput")
    .addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode == 13) {
        document.getElementById("urlInput-button").click();
    	}
	});

    $scope.getAllData = function(){


        if($scope.url.substring(0,4) === 'http' || $scope.url.substring(0,3) === 'www'){
            console.log("substr(0,4)", $scope.url.substring(0,4));
        	getRedditData();
            searchTweets();
            $scope.searchSent = true;
            $scope.invalidUrl = false;
        } else {
            $scope.invalidUrl = true;
        }
    }

    //load google charts for making charts
    google.charts.load('current', {packages: ['corechart', 'bar']});

   function getRedditData(){
   		//this function also gathers the reddit_chart data and vizualizes it

        $scope.trimmedUrl = $scope.url.split('?');

  		$http.get("http://www.reddit.com/api/info.json?url=" + $scope.trimmedUrl[0])
       		 .then(function(response) {

            $scope.redditResponse = response.data;

            // for(var z = 0; z < response.data.length; z++){
            //     console.log
            // }

            $scope.reddit = [];

            $scope.reddit.topcomments = [];

            $scope.reddit_chart_data = [];
            
            for(var i = 0;i<$scope.redditResponse['data']['children'].length; i++){

                var listing = $scope.redditResponse['data']['children'][i]['data'];

                $scope.reddit_chart_data.push({comments: listing.num_comments, subreddit: listing.subreddit});

                if (listing.num_comments > 0){
                    
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

		        //title: 'Top Conversations on Reddit',

		        chartArea: {width: '80%'},

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
        var commentsToGet = 4;
        var minimumScore = 1;

      // if(score > 50)
      //   {
      //       commentsToGet = 2;
      //   } else {
      //       commentsToGet = 1;
      //   }
    var commentUrl = "https://www.reddit.com/r/" + subreddit + "/comments/" + id + ".json?sort=top&limit=" + commentsToGet;
     
    $http.get(commentUrl)
         .then(function(response){
           // console.log(response.data[1].data.children[0].data.body);
            for(var i = 0; i < commentsToGet; i++){
                if(response.data[1].data.children[i]){
                    if(response.data[1].data.children[i].data.score > minimumScore){
                        $scope.reddit.topcomments.push(response.data[1].data.children[i].data);
                                }
                            }
                        }
        			

           }); //end .then function
	}//end getTopComment



//begin twitter stuff
$scope.tweets = []; //array of tweets

twitterService.initialize();

function searchTweets(){
    twitterService.getMatchingTweets($scope.url).then(function(data){
        //console.log(data);
        $scope.tweets = data.statuses;
        $scope.twitter_chart_data = [];
        $scope.highestRT = 0;
        $scope.highestFAV = 0;
        $scope.timeMeasureToDisplay = 'N/A';
        $scope.timeSinceLastTweet = 'N/A';


       

        for(var i = 0; i < data.statuses.length; i++){
        
            var tweet = data.statuses[i];
            if(tweet.retweet_count > $scope.highestRT){
                $scope.highestRT = tweet.retweet_count;
            }
            if(tweet.favorite_count > $scope.highestFAV){
                $scope.highestFAV = tweet.favorite_count;
            }
        }

        var firstTweet = new Date($scope.tweets[data.statuses.length-1].created_at);
        var lastTweet = new Date($scope.tweets[0].created_at);

        var timeDifferenceInSeconds = (Math.abs(firstTweet-lastTweet)/1000).toFixed(2);
        var timeDifferenceInMinutes = (timeDifferenceInSeconds/60).toFixed(2);
        var timeDifferenceInHours = (timeDifferenceInMinutes/60).toFixed(2);
        //$scope.main.timeMeasureToDisplay = '';
        var timeSinceLastTweet_s = (Math.abs(lastTweet-new Date())/1000).toFixed(2);
        var timeSinceLastTweet_m = (timeSinceLastTweet_s/60).toFixed(2);
        var timeSinceLastTweet_h = (timeSinceLastTweet_m/60).toFixed(2);

        if(timeDifferenceInHours >= 1){
            $scope.timeMeasureToDisplay = timeDifferenceInHours.toString()+' hours';
        } else if (timeDifferenceInMinutes < 60 && timeDifferenceInMinutes > 1){
            $scope.timeMeasureToDisplay = timeDifferenceInMinutes.toString()+' minutes';
        } else {
            $scope.timeMeasureToDisplay = timeDifferenceInSeconds.toString()+' seconds';
        }

        if(timeSinceLastTweet_h >= 1){
            $scope.timeSinceLastTweet = timeSinceLastTweet_h.toString()+' hours';
        } else if (timeSinceLastTweet_m < 60 && timeSinceLastTweet_m > 1){
            $scope.timeSinceLastTweet = timeSinceLastTweet_m.toString()+' minutes';
        } else {
            $scope.timeSinceLastTweet = timeSinceLastTweet_s.toString()+' seconds';
        }
        $scope.stats = [["100 tweets in ", $scope.timeMeasureToDisplay], [$scope.timeSinceLastTweet, "since last tweet"], ["Highest number of retweets:", $scope.highestRT]];

        //buildTwitterChart();
    }, function(){
        $scope.rateLimitError = true;
    })
}


function buildTwitterChart(){

    var sorted_twitter_chart_data = $scope.twitter_chart_data.slice(0);

            sorted_twitter_chart_data.sort(function(a,b){return b.retweet_count-a.retweet_count});

            var arrayToDataTable_data_twitter = [ ['Username', 'Retweets'] ];

            if(sorted_twitter_chart_data.length >=5){
                var noMoreThanFive = 5;
            } else {
                var noMoreThanFive = sorted_twitter_chart_data.length;
            }

            for(var j = 0; j<noMoreThanFive; j++){

                arrayToDataTable_data_twitter.push(["@"+sorted_twitter_chart_data[j].username, parseFloat(sorted_twitter_chart_data[j].retweets)]);

            }

            var twitter_chart_data = google.visualization.arrayToDataTable(arrayToDataTable_data_twitter);

            var twitter_chart_options = {

                legend: 'none',

                title: 'Most Retweeted Tweets',

                chartArea: {width: '100%'},

                hAxis: {

                  title: 'Number of Retweets',

                  minValue: 0
                }
                ,vAxis: {
                    minValue: 0
                }
            };

            var twitter_chart = new google.visualization.BarChart(document.getElementById('twitter-comments-chart'));

            twitter_chart.draw(twitter_chart_data, twitter_chart_options);

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
                $('#signIn').fadeOut();
                $('#urlInput-button').fadeIn();
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



