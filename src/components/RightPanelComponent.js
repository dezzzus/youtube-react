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
  },
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

    return (
      <div>Result items here</div>
    );
  }
}

RightPanel.propTypes = {
  classes: PropTypes.object.isRequired,
  results: PropTypes.array,
};

export default withStyles(styles)(RightPanel);

