import React, { Component } from 'react';
import './App.css';
import ReactDOM from 'react-dom';
import Grid from 'material-ui/Grid';
import googleclientapi from 'google-client-api';

import LeftPanelComponent from './components/LeftPanelComponent';
import RightPanelComponent from './components/RightPanelComponent';

const API_KEY = "AIzaSyDM1SWYC-ICD_EZx_4hzIKhzybFNbQZgTg";
let google_api_loaded = false;
let gapi = null;
googleclientapi().then( function (ret) {
  gapi = ret;
  gapi.load('client', function(){
    gapi.client.setApiKey(API_KEY);
    gapi.client.load('youtube', 'v3').then(function(){
      google_api_loaded = true;
      console.log ('google api loading success!');
    });
  });
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {results: [], filter: {}, pageToken: null};
    this.videoSearch = this.videoSearch.bind(this);
    this.loadmore = this.loadmore.bind(this);
  }

  componentDidMount() {
    document.title = "Youtube Search";
  }

  videoSearch = function(term) {

    if (gapi == null) {
      return ;
    }
    console.log (term);
    console.log (this.state);

    const {pageToken} = this.state;
    let that = this;

    let request = gapi.client.youtube.search.list({
      part: 'snippet',
      q: term.query,
      order: 'viewCount',
      type:'video',
      publishedAfter: term.date_min ? term.date_min+'T00:00:00Z' : undefined,
      publishedBefore: term.date_max ? term.date_max+'T00:00:00Z' : undefined,
      pageToken: pageToken,
      maxResults: 50
    });

    request.execute(function(resp1){

      if(resp1.error){
        //$scope.info = "Query error: "+ JSON.stringify(resp.data);
        //$scope.$apply();
        return;
      }

      console.log (resp1);
      let items = resp1.items;
      let map = {},
        ids = items.map(function(item){
          map[item.id.videoId] = item;
          return item.id.videoId;
        }),
        monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ],
        added = false;
      let st1 = that.state;
      st1.nextPageToken = resp1.nextPageToken;
      st1.filter = term;
      that.setState(st1);

      ids = ids.join(",");

      let request1 = gapi.client.youtube.videos.list({id:ids, part:'statistics,contentDetails'});

      request1.execute(function(resp) {

        if (resp.error) {
          //$scope.info = "Fetching error: " + JSON.stringify(resp.data);
          //$scope.$apply();
          return;
        }
        console.log(resp);
        let results = []

        resp.items.forEach(function (stat_item) {

          var item = map[stat_item.id],
            date = new Date(item.snippet.publishedAt);


          item.stats = stat_item.statistics;
          //item.stats.duration = nezasa.iso8601.Period.parseToTotalSeconds(stat_item.contentDetails.duration);
          item.stats.duration = convert_time(stat_item.contentDetails.duration);

          item.stats.likeCount = parseInt(item.stats.likeCount);
          item.stats.dislikeCount = parseInt(item.stats.dislikeCount);
          item.stats.viewCount = parseInt(item.stats.viewCount);

          item.stats.rating = (function () {

            var totalVotes = item.stats.likeCount + item.stats.dislikeCount;
            return parseInt(item.stats.likeCount / (totalVotes / 100)) || 0;
          })();

          item.date = monthNames[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();


          if (check_item(item, term)) {
            results.push(item);
            added = true;
          }

        });

        if (!added) {
          if (!items[0]) {
            //delete $scope.info;
            //$scope.resp.nextPageToken = null;
            //}else if(items[0] && items[0].stats.viewCount < term.views){
            //$scope.info = 'Nothing here (not enough views)';
            //$scope.resp.nextPageToken = null;
          } else {
            //$scope.info = 'Results were filtered out by the script. Try to load more.'
          }
          let state = that.state;
          state.results = [];
          that.setState(state);
        } else {
          let state = that.state;
          state.results = results;
          that.setState(state);
        }
      });

    });

    function convert_time(duration) {
      var a = duration.match(/\d+/g);

      if (duration.indexOf('M') >= 0 && duration.indexOf('H') == -1 && duration.indexOf('S') == -1) {
        a = [0, a[0], 0];
      }

      if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1) {
        a = [a[0], 0, a[1]];
      }
      if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1 && duration.indexOf('S') == -1) {
        a = [a[0], 0, 0];
      }

      duration = 0;

      if (a.length == 3) {
        duration = duration + parseInt(a[0]) * 3600;
        duration = duration + parseInt(a[1]) * 60;
        duration = duration + parseInt(a[2]);
      }

      if (a.length == 2) {
        duration = duration + parseInt(a[0]) * 60;
        duration = duration + parseInt(a[1]);
      }

      if (a.length == 1) {
        duration = duration + parseInt(a[0]);
      }
      return duration
    }

    function fetch_items(items) {

    }

    function check_item(item, term){
      if(term.views_min && item.stats.viewCount < parseInt(term.views_min)) return false;
      if(term.views_max && item.stats.viewCount >= parseInt(term.views_max)) return false;

      if(term.comments_min && item.stats.commentCount < parseInt(term.comments_min)) return false;
      if(term.comments_max && item.stats.commentCount >= parseInt(term.comments_max)) return false;

      if(term.duration_min && item.stats.duration < parseInt(term.duration_min)) return false;
      if(term.duration_max && item.stats.duration >= parseInt(term.duration_max)) return false;

      if(item.stats.rating < term.rating) return false;

      return true;

    }
  }

  loadmore = function() {

    if (gapi == null) {
      return ;
    }
    let term = this.state.filter;
    console.log (term);
    console.log (this.state);

    const {nextPageToken} = this.state;
    let that = this;

    let request = gapi.client.youtube.search.list({
      part: 'snippet',
      q: term.query,
      order: 'viewCount',
      type:'video',
      publishedAfter: term.date_min ? term.date_min+'T00:00:00Z' : undefined,
      publishedBefore: term.date_max ? term.date_max+'T00:00:00Z' : undefined,
      pageToken: nextPageToken,
      maxResults: 50
    });

    request.execute(function(resp1){

      if(resp1.error){
        //$scope.info = "Query error: "+ JSON.stringify(resp.data);
        //$scope.$apply();
        return;
      }

      console.log (resp1);
      let items = resp1.items;
      let map = {},
        ids = items.map(function(item){
          map[item.id.videoId] = item;
          return item.id.videoId;
        }),
        monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ],
        added = false;
      let st1 = that.state;
      st1.nextPageToken = resp1.nextPageToken;
      that.setState(st1);

      ids = ids.join(",");

      let request1 = gapi.client.youtube.videos.list({id:ids, part:'statistics,contentDetails'});

      request1.execute(function(resp) {

        if (resp.error) {
          //$scope.info = "Fetching error: " + JSON.stringify(resp.data);
          //$scope.$apply();
          return;
        }
        console.log(resp);
        let results = []

        resp.items.forEach(function (stat_item) {

          var item = map[stat_item.id],
            date = new Date(item.snippet.publishedAt);


          item.stats = stat_item.statistics;
          //item.stats.duration = nezasa.iso8601.Period.parseToTotalSeconds(stat_item.contentDetails.duration);
          item.stats.duration = convert_time(stat_item.contentDetails.duration);

          item.stats.likeCount = parseInt(item.stats.likeCount);
          item.stats.dislikeCount = parseInt(item.stats.dislikeCount);
          item.stats.viewCount = parseInt(item.stats.viewCount);

          item.stats.rating = (function () {

            var totalVotes = item.stats.likeCount + item.stats.dislikeCount;
            return parseInt(item.stats.likeCount / (totalVotes / 100)) || 0;
          })();

          item.date = monthNames[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();


          if (check_item(item, term)) {
            results.push(item);
            added = true;
          }

        });

        if (!added) {
          if (!items[0]) {
            //delete $scope.info;
            //$scope.resp.nextPageToken = null;
            //}else if(items[0] && items[0].stats.viewCount < term.views){
            //$scope.info = 'Nothing here (not enough views)';
            //$scope.resp.nextPageToken = null;
          } else {
            //$scope.info = 'Results were filtered out by the script. Try to load more.'
          }

        } else {
          let state = that.state;
          state.results = state.results.concat(results);
          that.setState(state);
        }
      });

    });

    function convert_time(duration) {
      var a = duration.match(/\d+/g);

      if (duration.indexOf('M') >= 0 && duration.indexOf('H') == -1 && duration.indexOf('S') == -1) {
        a = [0, a[0], 0];
      }

      if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1) {
        a = [a[0], 0, a[1]];
      }
      if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1 && duration.indexOf('S') == -1) {
        a = [a[0], 0, 0];
      }

      duration = 0;

      if (a.length == 3) {
        duration = duration + parseInt(a[0]) * 3600;
        duration = duration + parseInt(a[1]) * 60;
        duration = duration + parseInt(a[2]);
      }

      if (a.length == 2) {
        duration = duration + parseInt(a[0]) * 60;
        duration = duration + parseInt(a[1]);
      }

      if (a.length == 1) {
        duration = duration + parseInt(a[0]);
      }
      return duration
    }

    function fetch_items(items) {

    }

    function check_item(item, term){
      if(term.views_min && item.stats.viewCount < parseInt(term.views_min)) return false;
      if(term.views_max && item.stats.viewCount >= parseInt(term.views_max)) return false;

      if(term.comments_min && item.stats.commentCount < parseInt(term.comments_min)) return false;
      if(term.comments_max && item.stats.commentCount >= parseInt(term.comments_max)) return false;

      if(term.duration_min && item.stats.duration < parseInt(term.duration_min)) return false;
      if(term.duration_max && item.stats.duration >= parseInt(term.duration_max)) return false;

      if(item.stats.rating < term.rating) return false;

      return true;

    }
  }

  render() {
    //const videoSearch = _.debounce((term) => {this.videoSearch(term)}, 300);

    return (
      <div>
          <script src="https://apis.google.com/js/api.js"></script>

          <Grid container spacing={24}>
              <Grid item md={6}>
                  <LeftPanelComponent onSearchTermChange={this.videoSearch}/>
              </Grid>
              <Grid item md={6}>
                  <RightPanelComponent
                    results={this.state.results}
                    nexttoken = {this.state.nextPageToken}
                    loadmore={this.loadmore}
                  />
              </Grid>
          </Grid>
      </div>
    );
  }
}

ReactDOM.render(
 <App />,
 document.getElementById('root')
);

export default App;
