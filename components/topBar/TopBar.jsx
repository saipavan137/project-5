import React from 'react';
import {
  AppBar, Toolbar, Typography, Button,Box
} from '@mui/material';
import './TopBar.css';
import axios from 'axios';
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

  handleLogout = () => {
    axios.post("/admin/logout")
        .then((response) =>
        {
            console.log(response);
            this.props.changeUser(undefined);
        })
        .catch( error => {
            this.props.changeUser(undefined);
            console.log(error);
        });
  }

  render() {
    return this.state.app_info ? (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 0 }} color="inherit" align="left">Team: Symphony</Typography>      
          {
            this.props.user ?
            (
              <Typography variant="h5" component="div" color="inherit"  sx={{  display: 'flex', 
                  width: 'fit-content', '& svg': {m: 1.5,}, '& hr': {mx: 0.5,},}} align="center">
                <span>
                  { "Hi " + this.props.user.first_name }
                </span>
                <Button variant="contained" onClick={this.handleLogout}>
                  Logout
                </Button>
              </Typography>
            )
            :
            (
              <Typography variant="h5" component="div" color="inherit" align="center"> Please login </Typography>
            )
          }          
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }} color="inherit" align="center">{this.props.main_content}</Typography> 
          <Typography variant="h5" component="div" sx={{ flexGrow: 0 }} color="inherit" align="right"> Version: {this.state.app_info.__v}</Typography>
        </Toolbar>
      </AppBar>
    ) : (
        <div/>
    );
  }
  
}

export default TopBar;

