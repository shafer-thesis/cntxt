var app = angular.module('cntxt', ['ngSanitize','cntxt.services']);

app.controller('controller', function($scope, $http, $q, twitterService, $timeout){

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
        	getRedditData();
            searchTweets();
            $scope.searchSent = true;
            $scope.invalidUrl = false;
            $scope.sortedWordsDict = {};
            $scope.mostUsedWords = [];
            $scope.wordsDictionary = {};    
            $scope.hashtags = [];
            var hashtagArray = [];
            var hashtagsDict = {};
        } else {
            $scope.invalidUrl = true;
        }
    }


function getRedditData(){

	$http.get("http://www.reddit.com/api/info.json?url=" + $scope.url)
		 .then(function(response){

    $scope.redditResponse = response.data;

    $scope.reddit = [];
    $scope.reddit.topcomments = [];
    $scope.reddit_chart_data = [];
    
if($scope.redditResponse['data']['children'].length > 0){
    $scope.redditResponseExists = true;
    for(var i = 0;i<$scope.redditResponse['data']['children'].length; i++){
        var listing = $scope.redditResponse['data']['children'][i]['data'];
        if (listing.num_comments > 0){
            
            	listing.topcomment = getTopComment(listing.subreddit, listing.id, listing.score, i);
        	}		
		}
    } else {
        $scope.redditResponseExists = false;
    }

		}); //end .then function

}// end getRedditData

function getTopComment(subreddit, id, score, number){

        var ignore = ['www','not','or',"i'm",'are','also','but','and','the','to','a','of','for','as','i','with','it','is','on','that','this','can','in','be','has','if','was','at', 'he', 'she', 'so'];
        var commentsToGet = 4;
        var minimumScore = 1;
        $scope.mostUsedWords = [];
        $scope.wordsDictionary = {};
        $scope.hashtags = [];

    var commentUrl = "https://www.reddit.com/r/" + subreddit + "/comments/" + id + ".json?sort=top&limit=" + commentsToGet;
     
    $http.get(commentUrl)
         .then(function(response){
            for(var i = 0; i < commentsToGet; i++){
                if(response.data[1].data.children[i]){
                    if(response.data[1].data.children[i].data.score > minimumScore){
                        $scope.reddit.topcomments.push(response.data[1].data.children[i].data);
                        var removePunctuation = (response.data[1].data.children[i].data.body.toLowerCase()).match(/\w+'*\w*/g);//.replace(/[.,\/#!$%\^&\**;:{}=\-_`~\(()+|><?@[]]/g,"");

                        for(var j=0; j < removePunctuation.length; j++){
                                $scope.mostUsedWords.push(removePunctuation[j]);
                        }
                    }
                }
            }

        $timeout(function(){
            for(var k=0; k<$scope.mostUsedWords.length; k++){
                var word = $scope.mostUsedWords[k];
                if(ignore.indexOf(word) === -1 && word.length > 1){
                    if(!$scope.wordsDictionary[word]){
                        $scope.wordsDictionary[word] = 1;
                    } else {
                        $scope.wordsDictionary[word] += 1;
                    }
                }
            }
            $scope.sortedWordsDict = Object.keys($scope.wordsDictionary).map(function(key) {
                return [key, $scope.wordsDictionary[key]];
            });

            // Sort the array based on the second element
            $scope.sortedWordsDict.sort(function(first, second) {
                return second[1] - first[1];
            });

        }, 500);

        }); //end .then function
	}//end getTopComment



//begin twitter stuff
$scope.tweets = []; //array of tweets

twitterService.initialize();

function searchTweets(){
    twitterService.getMatchingTweets($scope.url).then(function(data){
        //console.log(data);
        $scope.tweets = data.statuses;

        $scope.highestRT = 0;
        $scope.highestFAV = 0;
        $scope.timeMeasureToDisplay = 'N/A';
        $scope.timeSinceLastTweet = 'N/A';
        $scope.twitterResponseLength = 0;
        var hashtagArray = [];
        var hashtagsDict = {};
        var t = [];

        if(data.statuses.length > 0){
            $scope.twitterResponseExists = true;
        } else{
            $scope.twitterResponseExists = false;
        }

        var used = {};

        for(var i = 0; i < data.statuses.length; i++){

        
            var tweet = data.statuses[i];
            t.push(tweet.id_str);
            //twttr.widgets.create(tweet.id_str, document.getElementById('tryme'), {theme: 'dark'});
            if(tweet.retweet_count > $scope.highestRT){
                $scope.highestRT = tweet.retweet_count;

            }
            if(tweet.favorite_count > $scope.highestFAV){
                $scope.highestFAV = tweet.favorite_count;
            }
            for(var x = 0; x < tweet.entities.hashtags.length; x++){

                hashtagArray.push(tweet.entities.hashtags[x].text);
                //console.log(hashtag);


            }
        }
    
        $timeout(function(){
            for(var k=0; k<hashtagArray.length; k++){
                var hashtag = hashtagArray[k];


                if(!hashtagsDict[hashtag]){
                    hashtagsDict[hashtag] = 1;
                } else {
                    hashtagsDict[hashtag] += 1;
                }
            }
            $scope.hashtags = Object.keys(hashtagsDict).map(function(key) {
                return [key, hashtagsDict[key]];
            });

            // Sort the array based on the second element
            $scope.hashtags.sort(function(first, second) {
                return second[1] - first[1];
            });




        console.log(t);


        twttr.widgets.createTweet(t[0], document.getElementById('object-0'), {align: "center"});
        twttr.widgets.createTweet(t[1], document.getElementById('object-1'), {align: "center"});
        twttr.widgets.createTweet(t[2], document.getElementById('object-2'), {align: "center"});
        twttr.widgets.createTweet(t[3], document.getElementById('object-3'), {align: "center"});
        twttr.widgets.createTweet(t[4], document.getElementById('object-4'), {align: "center"});
        twttr.widgets.createTweet(t[5], document.getElementById('object-5'), {align: "center"});
        twttr.widgets.createTweet(t[6], document.getElementById('object-6'), {align: "center"});



        }, 500);




    
        var firstTweet = new Date($scope.tweets[data.statuses.length-1].created_at);
        var lastTweet = new Date($scope.tweets[0].created_at);
        $scope.twitterResponseLength = data.statuses.length;

        var timeDifferenceInSeconds = (Math.abs(firstTweet-lastTweet)/1000).toFixed(2);
        var timeDifferenceInMinutes = (timeDifferenceInSeconds/60).toFixed(2);
        var timeDifferenceInHours = (timeDifferenceInMinutes/60).toFixed(2);
        //$scope.main.timeMeasureToDisplay = '';
        var timeSinceLastTweet_s = (Math.abs(lastTweet-new Date())/1000).toFixed(2);
        var timeSinceLastTweet_m = (timeSinceLastTweet_s/60).toFixed(2);
        var timeSinceLastTweet_h = (timeSinceLastTweet_m/60).toFixed(2);

        $scope.tweetsPerMinute = (data.statuses.length/timeDifferenceInMinutes).toFixed(2);

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

    }, function(){
        $scope.rateLimitError = true;
    })
}


//when the user clicks the connect twitter button, the popup authorization window opens
$scope.connectButton = function() {
    twitterService.connectTwitter().then(function() {
        if (twitterService.isReady()) {
            //if the authorization is successful, hide the connect button and display the tweets
            $scope.connectedTwitter = true;
            $('#main_input').fadeIn();
            $('#connectButton').fadeOut(function() {
            $('#signOut').fadeIn();
            $('#signIn').fadeOut();
                
            });
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

})//;

.filter('markdown', function(){
    var converter = new Showdown.converter();
    return converter.makeHtml;
});




