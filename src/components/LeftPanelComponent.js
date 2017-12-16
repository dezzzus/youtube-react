import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import $ from 'jquery';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);
const Handle = Slider.Handle;

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
  },
  dateField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: '25%',
    display: 'inline-block',
  },
  searchQuery: {
    width: 'calc(100% - 150px)',
    marginLeft: '30px',
  },
  toolbar: {
    padding: '20px 50px',
  },
  labeldiv: {
    display: 'inline-block',
    width: '40%',
    textAlign: 'center',
  },
  halfside: {
    display: 'inline-block',
    width: '48%',
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    verticalAlign: 'top',
  },
  rating: {
    margin: '10px 30px',
  }
});

const handle = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip
      prefixCls="rc-slider-tooltip"
      overlay={value}
      visible={dragging}
      placement="top"
      key={index}
    >
      <Handle value={value} {...restProps} />
    </Tooltip>
  );
};

class LeftPanel extends React.Component {
  state = {rating: 1};

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  handleSlider = (value) => {
    this.setState({rating: value});
  }

  updateFilter = () => {
    let filter = {}
    filter.query = $('#search_query').val();
    console.log (filter);
    console.log (this);
    this.props.onSearchTermChange(filter);
  }

  render() {
    const { classes } = this.props;

    return (
      <form className={classes.container} noValidate autoComplete="off">
        <TextField
          id="search_query"
          label=""
          className={classes.textField, classes.searchQuery}
          InputLabelProps={{
            shrink: true,
          }}
          placeholder="Search Query"
          margin="normal"
        />
        <Button raised className={classes.button} onClick={this.updateFilter}>
          Search
        </Button>
        <div className={classes.toolbar}>
          <div className={classes.halfside}>
            <TextField id="min_views" label="" className={classes.textField} InputLabelProps={{shrink: true}} placeholder="min" margin="normal"/>
            <div className={classes.labeldiv}>View-count</div>
            <TextField id="max_views" label="" className={classes.textField} InputLabelProps={{shrink: true}} placeholder="max" margin="normal"/>
            <br/>
            <TextField id="min_comments" label="" className={classes.textField} InputLabelProps={{shrink: true}} placeholder="min" margin="normal"/>
            <div className={classes.labeldiv}>Comment-count</div>
            <TextField id="max_comments" label="" className={classes.textField} InputLabelProps={{shrink: true}} placeholder="max" margin="normal"/>
            <br/>
            <TextField id="min-date" label="" type="date" defaultValue="min" className={classes.dateField} InputLabelProps={{shrink: true}}/>
            <div className={classes.labeldiv}>Date-time</div>
            <TextField id="max-date" label="" type="date" defaultValue="max" className={classes.dateField} InputLabelProps={{shrink: true}}/>
            <br/>
          </div>
          <div className={classes.halfside}>
            <TextField id="min_durations" label="" className={classes.textField} InputLabelProps={{shrink: true}} placeholder="min" margin="normal"/>
            <div className={classes.labeldiv}>Duration (s)</div>
            <TextField id="max_durations" label="" className={classes.textField} InputLabelProps={{shrink: true}} placeholder="max" margin="normal"/>
            <br/>
            <div className={classes.labeldiv}>
              Min. rating({this.state.rating})
            </div>
            <Slider className={classes.rating} min={1} step={1} max={100} onChange={this.handleSlider} handle={handle} />
          </div>
        </div>
      </form>
    );
  }
}

LeftPanel.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LeftPanel);

/*


import React from 'react';
import {List, ListItem} from 'material-ui/List';
import MobileTearSheet from '../MobileTearSheet';
import ActionInfo from 'material-ui-icons/Info';
import AddToQueue from 'material-ui-icons/AddToQueue';
import Divider from 'material-ui/Divider';


const LeftPanel = () => (
  <MobileTearSheet>
    <List>
      <ListItem primaryText="New command" leftIcon={<AddToQueue />} />
    </List>
    <Divider />
    <List>
      <ListItem primaryText="Command 1" rightIcon={<ActionInfo />} />
      <ListItem primaryText="Command 2" rightIcon={<ActionInfo />} />
      <ListItem primaryText="Command 3" rightIcon={<ActionInfo />} />
      <ListItem primaryText="Command 4" rightIcon={<ActionInfo />} />
    </List>
  </MobileTearSheet>
);

export default LeftPanel;
*/