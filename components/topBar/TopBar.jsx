import React from 'react';
import {
  AppBar, Toolbar, Typography
} from '@mui/material';
import './TopBar.css';
import fetchModel from '../../lib/fetchModelData';

/**
 * Define TopBar, a React component of project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        app_info: undefined
        
    };
   
  }
  componentDidMount() {
      this.handleAppInfoChange();
  }

  handleAppInfoChange(){
      const app_info = this.state.app_info;
      if (app_info === undefined){
        fetchModel("/test/info")
              .then((response) =>
              {
                  this.setState({
                      app_info: response.data
                  });
              });
      }
  }

  render() {
    return this.state.app_info ? (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar>
        <Typography variant="h5" component="div" sx={{ flexGrow: 0 }} color="inherit" align="left">Team: Symphony</Typography>
            <Typography variant="h5" component="div" sx={{ flexGrow: 1 }} color="inherit" align="center">{this.props.main_content}</Typography>
            <Typography variant="h5" component="div" sx={{ flexGrow: 0 }} color="inherit" align="right"> Version: {this.state.app_info._v}</Typography>
        </Toolbar>
      </AppBar>
    ) : (
        <div/>
    );
  }
  
}

export default TopBar;

