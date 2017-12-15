import React, { Component } from 'react';
import './App.css';
import ReactDOM from 'react-dom';
import Grid from 'material-ui/Grid';
import { YouTube, SearchRequest } from 'youtube-search-google-api';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import LeftPanelComponent from './components/LeftPanelComponent';
import RightPanelComponent from './components/RightPanelComponent';

const API_KEY = "AIzaSyDM1SWYC-ICD_EZx_4hzIKhzybFNbQZgTg";
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {results: [], filter: {}};
  }

  changeHandler(value) {
    this.setState({filter: value});
  }

  videoSearch(term) {

    const youtube = new YouTube()

    youtube.search(new SearchRequest(
      {
        query: {
          key: API_KEY,
          maxResults: 50,
          order: 'viewCount',
          type: 'video',
          publishedAfter: '2017-10-01T00:00:00Z',
          q: 'pumpkin|halloween+dog -cat'
        }
      }, function(error, resp, body) {
        if(error || resp.error) {
          console.log ("Fetching error: " + JSON.stringify(resp.data));
          return;
        }

        //console.log(resp);
        let results = []

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
            results.push(item);
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

        }
      }))
  }

  render() {
    const videoSearch = _.debounce((term) => {this.videoSearch(term)}, 300);

    return (
      <div>
          <script src="https://apis.google.com/js/api.js"></script>

          <Grid container spacing={24}>
              <Grid item md={6}>
                  <LeftPanelComponent onChange={this.changeHandler} onSearchTermChange={videoSearch}/>
              </Grid>
              <Grid item md={6}>
                  <RightPanelComponent
                    results={this.state.results}
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
