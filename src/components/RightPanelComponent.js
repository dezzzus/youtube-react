import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';

const styles = theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    background: theme.palette.background.paper,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: '25%',
    display: 'inline-block',
  },
  button: {
    margin: theme.spacing.unit,
    width: '100%',
  },
  thumb: {
    display: 'inline-block',
    width: '120px'
  },
  videoinfo: {
    display: 'inline-block',
    width: 'calc(100% - 120px)',
    verticalAlign: 'top',
  },
  info: {
    color: 'grey',
  }
});

class RightPanel extends React.Component {
  state = {rating: 1};

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  handleSlider = (value) => {
    this.setState({rating: value});
  }

  render() {
    const { classes, results } = this.props;

    console.log (results);
    return (
      <div>
        <div>Result items here</div>
        {results.map((item,index) => (
          <div key={item.id.videoId}>
            <a href={"https://www.youtube.com/watch?v="+item.id.videoId} ng-click="openVideo(item)" target="_blank" className={classes.thumb}>
              <img src={item.snippet.thumbnails.default.url}/>
            </a>
            <div className={classes.videoinfo}>
              <a href={"https://www.youtube.com/watch?v="+item.id.videoId} ng-click="openVideo(item)" target="_blank" className={classes.title}>{item.snippet.title}</a>
              <div className={classes.info}>{item.date} &nbsp;|&nbsp; {item.stats.viewCount} views &nbsp;|&nbsp; Rating {item.stats.rating}%</div>
              <div className={classes.desc}>{item.snippet.description}</div>
            </div>
          </div>
          ))}
        { this.props.nexttoken ?
          <Button raised className={classes.button} onClick={this.props.loadmore}>Load Next Page</Button>
          :
          <div></div>
        }
      </div>
    );
  }
}

RightPanel.propTypes = {
  classes: PropTypes.object.isRequired,
  results: PropTypes.array,
};

export default withStyles(styles)(RightPanel);

