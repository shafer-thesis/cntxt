var app = angular.module('myApp', []);
app.controller('controller', function($scope, $http, dataService) {

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


	//draw reddit chart
	// function drawRedditChart() {
	// 	var chart_data = [];

	// 	for(var i = 0; i < $scope.redditResponse['data']['children']length; i++){
	// 		var listing = $scope.redditResponse.data.children[i];
	// 		//console.log(listing.data.num_comments, listing.data.subreddit);
	// 		chart_data.push({comments: listing.data.num_comments, subreddit: listing.data.subreddit});
	// 	}

		// var sorted_chart_data = chart_data.slice(0);

		// sorted_chart_data.sort(function(a,b){return b.comments-a.comments})

		// var arrayToDataTable_data = [
		// ['Subreddit', 'Number of Comments']
		// ];

		// for(var j = 0; j<sorted_chart_data.length; j++){
		// 	arrayToDataTable_data.push(["/r/"+sorted_chart_data[j].subreddit, sorted_chart_data[j].comments]);
		// }

		// var data = google.visualization.arrayToDataTable(arrayToDataTable_data);

		// //SAVED TO SHOW SYNTAX OF CHART BUIDLING 
  //     // var data = google.visualization.arrayToDataTable([
  //     //   ['Subreddit', 'Number of Comments'],
  //     //   ["/r/"+sorted_chart_data[0].subreddit, sorted_chart_data[0].comments],
  //     //   ["/r/"+sorted_chart_data[1].subreddit, sorted_chart_data[1].comments],
  //     //   ["/r/"+sorted_chart_data[2].subreddit, sorted_chart_data[2].comments],
  //     //   ["/r/"+sorted_chart_data[3].subreddit, sorted_chart_data[3].comments],
  //     //   ["/r/"+sorted_chart_data[4].subreddit, sorted_chart_data[4].comments],
  //     //   ["/r/"+sorted_chart_data[5].subreddit, sorted_chart_data[5].comments]
  //     // ]);

  //     var options = {
  //     	legend: 'none',
  //       title: 'Active Conversations on Reddit',
  //       chartArea: {width: '50%'},
  //       hAxis: {
  //         title: 'Number of Comments',
  //         minValue: 0
  //       },
  //       vAxis: {

  //       }
  //     };

  //     var chart = new google.visualization.BarChart(document.getElementById('reddit-comments-chart'));

  //     chart.draw(data, options);
  //   }






// // Simple GET request example:
// $http({
//   method: 'GET',
//   url: 'https://' + bearer_token + '@api.twitter.com/1.1/search/tweets.json?q=@travisshafer',
//   headers: {
//   		'Authorization': 'Bearer ' + bearer_token,
//   		'Allow-Enconding': 'gzip'
//   }
// }).then(function successCallback(response) {
// 	console.log("nice!");
//   }, function errorCallback(response) {
//    console.log("crap!");
//   });

// }

// GET /1.1/search/tweets.json?count=100&result_type=recent&q=%24MMM HTTP/1.1
// User-Agent: curl/7.24.0 (x86_64-apple-darwin12.0) libcurl/7.24.0 OpenSSL/0.9.8x zlib/1.2.5
// Host: api.twitter.com
// Accept: /
// Authorization: Bearer xxxxxxxxx






});

app.service('dataService', function($http) {
delete $http.defaults.headers.common['X-Requested-With'];
this.getTwitterData = function() {
    // $http() returns a $promise that we can add handlers with .then()
    return $http({
        method: 'GET',
        url: 'https://api/twitter.com/1.1/search/tweets.json',
        params: {'q': 'hello'},
        headers: {'Authorization': 'Bearer AAAAA...(use code reference here)'}

     });
 }
});

// app.controller('AngularJSCtrl', function($scope, dataService) {
//     $scope.data = null;
//     dataService.getTwitterData().then(function(dataResponse) {
//         $scope.data = dataResponse;
//     });
// };


