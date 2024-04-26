import React from 'react';
import { Link as RouterLink} from 'react-router-dom';
import {  Typography,Grid,Card,CardContent } from '@mui/material';
import './userDetail.css';
import fetchModel from '../../lib/fetchModelData';
/**
 * Define UserDetail, a React component of project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: undefined,
    };
  }

  componentDidMount() { //Calls the fetch method
    const userId = this.props.match.params.userId;
    this.fetchUserDetails(userId);
  }

  componentDidUpdate() { //checks if component updated when new user is selected
    
    if (this.state.user?._id !== this.props.match.params.userId) {
      this.fetchUserDetails(this.props.match.params.userId);
    }
  }

  fetchUserDetails(userId) {
    
    fetchModel("/user/" + userId)
    .then((response) =>
    {
        const new_user = response.data;
        this.setState({
            user: new_user
        });
        const main_content = "User Details for " + new_user.first_name + " " + new_user.last_name;
        this.props.changeMainContent(main_content);
    });
  }

  render() {

    const { user } = this.state;
    const {activeUser, } = this.props;
    const {first_name, last_name, } = activeUser;
    return user ? ( //Makes sure the user is loaded before page renders to prevent error
      <Card variant="outlined">
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h5">{user.first_name} {user.last_name}</Typography>
            </Grid>              
            <Grid item xs={12}>
              <Typography variant="body1">Location: {user.location}</Typography>
              <Typography variant="body1">Description: {user.description}</Typography>
              <Typography variant="body1">Occupation: {user.occupation}</Typography>
            </Grid>
            <Grid item xs={12}>
              <RouterLink to={`/photos/${user._id}`}>
                View Photos
              </RouterLink>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      ) : 
      (
        <h1>Loading...</h1>
      );
  }
}

export default UserDetail;
