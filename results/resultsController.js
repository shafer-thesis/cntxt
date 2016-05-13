

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

    google.charts.load('current', {packages: ['corechart', 'bar']});
	google.charts.setOnLoadCallback(drawRedditChart);
	google.charts.setOnLoadCallback(drawTwitterChart);

	//console.log(redditResponse.data.children);

		//sorted_chart_data[sorted_chart_data[0].subreddit], sorted_chart_data[sorted_chart_data[0].comments]

function drawRedditChart() {
		var chart_data = [];

		for(var i = 0; i < redditResponse.data.children.length; i++){
			var listing = redditResponse.data.children[i];
			//console.log(listing.data.num_comments, listing.data.subreddit);
			chart_data.push({comments: listing.data.num_comments, subreddit: listing.data.subreddit});
		}
		var sorted_chart_data = chart_data.slice(0);
		sorted_chart_data.sort(function(a,b){return b.comments-a.comments})

		var arrayToDataTable_data = [
		['Subreddit', 'Number of Comments']
		];

		for(var j = 0; j<sorted_chart_data.length; j++){
			arrayToDataTable_data.push(["/r/"+sorted_chart_data[j].subreddit, sorted_chart_data[j].comments]);
		}

		var data = google.visualization.arrayToDataTable(arrayToDataTable_data);

		//SAVED TO SHOW SYNTAX OF CHART BUIDLING 
      // var data = google.visualization.arrayToDataTable([
      //   ['Subreddit', 'Number of Comments'],
      //   ["/r/"+sorted_chart_data[0].subreddit, sorted_chart_data[0].comments],
      //   ["/r/"+sorted_chart_data[1].subreddit, sorted_chart_data[1].comments],
      //   ["/r/"+sorted_chart_data[2].subreddit, sorted_chart_data[2].comments],
      //   ["/r/"+sorted_chart_data[3].subreddit, sorted_chart_data[3].comments],
      //   ["/r/"+sorted_chart_data[4].subreddit, sorted_chart_data[4].comments],
      //   ["/r/"+sorted_chart_data[5].subreddit, sorted_chart_data[5].comments]
      // ]);

      var options = {
      	legend: 'none',
        title: 'Active Conversations on Reddit',
        chartArea: {width: '50%'},
        hAxis: {
          title: 'Number of Comments',
          minValue: 0
        },
        vAxis: {
          title: 'Subreddit'
        }
      };

      var chart = new google.visualization.BarChart(document.getElementById('reddit-comments-chart'));

      chart.draw(data, options);
    }

    function drawTwitterChart() {
		var chart_data = [];

		for(var i = 0; i < twitterResponse.statuses.length; i++){
			var tweet = twitterResponse.statuses[i];
			//console.log(listing.data.num_comments, listing.data.subreddit);
			chart_data.push({user: tweet.user.screen_name, retweets: tweet.retweet_count, favorites: tweet.favorite_count});
		}
		console.log(chart_data);
		var sorted_chart_data = chart_data.slice(0);
		sorted_chart_data.sort(function(a,b){return b.retweets-a.retweets})
		console.log(sorted_chart_data);

		var arrayToDataTable_data = [
		['Username', 'Retweets', 'Favorites']
		];

		for(var j = 0; j<sorted_chart_data.length; j++){
			if(sorted_chart_data[j].retweets > 5){
			arrayToDataTable_data.push(["@"+sorted_chart_data[j].user, sorted_chart_data[j].retweets, sorted_chart_data[j].favorites]);
			}
		}

		var data = google.visualization.arrayToDataTable(arrayToDataTable_data);

		//SAVED TO SHOW SYNTAX OF CHART BUIDLING 
      // var data = google.visualization.arrayToDataTable([
      //   ['Subreddit', 'Number of Comments'],
      //   ["/r/"+sorted_chart_data[0].subreddit, sorted_chart_data[0].comments],
      //   ["/r/"+sorted_chart_data[1].subreddit, sorted_chart_data[1].comments],
      //   ["/r/"+sorted_chart_data[2].subreddit, sorted_chart_data[2].comments],
      //   ["/r/"+sorted_chart_data[3].subreddit, sorted_chart_data[3].comments],
      //   ["/r/"+sorted_chart_data[4].subreddit, sorted_chart_data[4].comments],
      //   ["/r/"+sorted_chart_data[5].subreddit, sorted_chart_data[5].comments]
      // ]);

      var options = {
      	legend: 'none',
        title: 'Most Retweeted Tweets',
        chartArea: {width: '50%'},
        hAxis: {
          title: 'Number of Retweets',
          minValue: 0
        },
        vAxis: {
          title: 'User'
        }
      };

      var chart = new google.visualization.BarChart(document.getElementById('twitter-tweet-chart'));

      chart.draw(data, options);
    }




    //console.log($scope.main.twitterUsers);

}]);