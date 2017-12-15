gapi.load('client', function(){
  gapi.client.setApiKey(API_KEY);
  gapi.client.load('youtube', 'v3').then(function(){

    window.google_api_loaded = true;

  });
});

var app = angular.module('youtube', []);

app.controller('main', function PhoneListController($scope) {
  $scope.search = {
    query: '',
    rating: 90,
    views_min: undefined,
    views_max: undefined,
    comments_min: undefined,
    comments_max: undefined,
    date_min: undefined,
    date_max: undefined,
    duration_min: undefined,
    duration_max: undefined
  };

  $scope.result = [];

  $scope.openVideo = function(item){
    require('nw.gui').Shell.openExternal( "https://www.youtube.com/watch?v=" + item.id.videoId);
    event.preventDefault();
  };



  $scope.run = function(pageToken){
    if(!google_api_loaded){
      $scope.info = "google api is not loaded";
      return;
    }

    if(!pageToken) {
      $scope.results = [];
    }

    $scope.info = "running";

    var request = gapi.client.youtube.search.list({
      part: 'snippet',
      q: $scope.search.query,
      order: 'viewCount',
      type:'video',
      publishedAfter: $scope.search.date_min ? $scope.search.date_min+'T00:00:00Z' : undefined,
      publishedBefore: $scope.search.date_max ? $scope.search.date_max+'T00:00:00Z' : undefined,
      pageToken: pageToken,
      maxResults: 50
    });
    console.log($scope.search.date_min ? $scope.search.date_min+'T00:00:00Z' : undefined)

    request.execute(function(resp){

      if(resp.error){
        $scope.info = "Query error: "+ JSON.stringify(resp.data);
        $scope.$apply();
        return;
      }

      $scope.resp = resp;
      fetch_items(resp.items);

    });

    function fetch_items(items){

      $scope.$apply();


      var map = {},
          ids = items.map(function(item){
            map[item.id.videoId] = item;
            return item.id.videoId;
          }),
          monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ],
          added = false;

      ids = ids.join(",");


      var request = gapi.client.youtube.videos.list({id:ids, part:'statistics,contentDetails'});

      request.execute(function(resp){

        if(resp.error) {
          $scope.info = "Fetching error: " + JSON.stringify(resp.data);
          $scope.$apply();
          return;
        }

        //console.log(resp);

        resp.items.forEach(function (stat_item) {

          var item = map[stat_item.id],
            date = new Date(item.snippet.publishedAt);


          item.stats = stat_item.statistics;
          item.stats.duration = nezasa.iso8601.Period.parseToTotalSeconds(stat_item.contentDetails.duration);

          item.stats.likeCount = parseInt(item.stats.likeCount);
          item.stats.dislikeCount = parseInt(item.stats.dislikeCount);
          item.stats.viewCount = parseInt(item.stats.viewCount);

          item.stats.rating = (function(){

            var totalVotes = item.stats.likeCount + item.stats.dislikeCount;
            return parseInt(item.stats.likeCount/(totalVotes/100)) || 0;
          })();

          item.date = monthNames[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();


          if(check_item(item)) {
            $scope.results.push(item);
            added = true;
          }

        });

        if(!added){
          if(!items[0]){
            delete $scope.info;
            $scope.resp.nextPageToken = null;
          }else if(items[0] && items[0].stats.viewCount < $scope.search.views){
            $scope.info = 'Nothing here (not enough views)';
            $scope.resp.nextPageToken = null;
          }else{
            $scope.info = 'Results were filtered out by the script. Try to load more.'
          }

        }else {
          delete $scope.info;
        }
        $scope.$apply();

      });
    }

    function check_item(item){
      //console.log(item.stats.viewCount, $scope.search.views, item.stats.viewCount < $scope.search.views);

      if($scope.search.views_min && item.stats.viewCount < parseInt($scope.search.views_min)) return false;
      if($scope.search.views_max && item.stats.viewCount >= parseInt($scope.search.views_max)) return false;

      if($scope.search.comments_min && item.stats.commentCount < parseInt($scope.search.comments_min)) return false;
      if($scope.search.comments_max && item.stats.commentCount >= parseInt($scope.search.comments_max)) return false;

      if($scope.search.duration_min && item.stats.duration < parseInt($scope.search.duration_min)) return false;
      if($scope.search.duration_max && item.stats.duration >= parseInt($scope.search.duration_max)) return false;

      if(item.stats.rating < $scope.search.rating) return false;

      return true;

    }

    window.s = $scope;

  }
});



$(function(){
  $(".filter.date input").each(function(){
    $(this).datepicker({
      changeMonth: true,
      changeYear: true,
      dateFormat: 'yy-mm-dd'
    });

  });
})