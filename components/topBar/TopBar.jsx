import React from 'react';
import { Link as RouterLink} from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Box, Modal, TextField
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
        app_info: undefined,
        isUploadFormOpen: false
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
  };

  handleOpenForm = () => {
    this.setState({
      isUploadFormOpen: true // Open the upload form when the button is clicked
    });
  };

  handleCloseForm = () => {
    this.setState({
      isUploadFormOpen: false // Close the upload form
    });
  };

  handleUploadPhoto = () => {
    const fileInput = document.getElementById('photo');
    const file = fileInput.files[0];

    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    axios.post('/photos/new', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then((response) => {
      console.log('Photo uploaded successfully');
      // Close the upload form after successful upload
      this.handleCloseForm();
    })
    .catch((error) => {
      console.error('Error uploading photo:', error);
      alert('Error uploading photo. Please try again.');
    });
  };

  render() {
    return this.state.app_info ? (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar>
                
          {
            this.props.user ?
            (
              <>
                <Typography variant="h5" color="lemonchiffon">
                    { "Hi " + this.props.user.first_name }
                </Typography>
                <br></br>
                <Typography variant="h5" component="div"   sx={{  display: 'flex', 
                    width: 'fit-content', '& svg': {m: 1.5,}, '& hr': {mx: 0.5,},}} align="center">                            
                  <Button variant="contained" color="info" component={RouterLink} to={`/favorites`}>
                    View Favorites
                  </Button>
                </Typography>
                <br></br>
                <Typography variant="h5" component="div"   sx={{  display: 'flex', 
                    width: 'fit-content', '& svg': {m: 1.5,}, '& hr': {mx: 0.5,},}} align="center">                            
                  <Button variant="contained" color="info" onClick={this.handleOpenForm}>
                    Upload Photo
                  </Button>
                </Typography>
               
                
              </>
            )
            :
            (
              <Typography variant="h5" component="div" color="inherit" align="center"> Please login</Typography>
            )
          }          
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }} color="inherit" align="center">{this.props.main_content}</Typography> 
          {
            this.props.user ?
            ( 
              <Button variant="contained" color = "info" onClick={this.handleLogout} align="right">
                Logout
              </Button>
            ):(<br></br>)
          }
          <Typography variant="h7" component="div" sx={{ flexGrow: 0 }} color="inherit" align="right">Team: Symphony</Typography>
          <br></br>
          <Typography variant="h7" component="div" sx={{ flexGrow: 0 }} color="inherit" align="right"> Version: {this.state.app_info.__v}</Typography>
        </Toolbar>
        <Modal open={this.state.isUploadFormOpen} onClose={this.handleCloseForm}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
            <Typography variant="h6" component="div" align="center" gutterBottom>
              Upload Photo
            </Typography>
            {/* Form for uploading a photo */}
            <form>
              <TextField
                id="photo"
                label="Choose Photo"
                type="file"
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                variant="outlined"
                inputProps={{ accept: 'image/*' }}
              />
              <Button onClick={this.handleUploadPhoto} variant="contained" color="primary" fullWidth>
                Upload
              </Button>
            </form>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
              <Button variant="contained" onClick={this.handleCloseForm}>
                Close
              </Button>
            </Box>
          </Box>
        </Modal>
      </AppBar>
    ) : (
        <div/>
    );
  }
  
}

export default TopBar;

