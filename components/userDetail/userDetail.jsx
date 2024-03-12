import React from 'react';
import { Link } from 'react-router-dom';
import {

  Typography
} from '@mui/material';
import './userDetail.css';
import fetchModel from '../../lib/fetchModelData';
import TopBar from '../topBar/TopBar';

/**
 * Define UserDetail, a React component of project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null
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
    const main_content = user ? `User photos for ${user.first_name} ${user.last_name}` : '';
    return (
      <div>
         <TopBar topName={main_content} />
        <Typography variant="body1">
          {user ? ( //Makes sure the user is loaded before page renders to prevent error
            <>
              <h1>{user.first_name} {user.last_name}</h1>
              <h2>
                {/* This should be the UserDetail view of the PhotoShare app. Since
                it is invoked from React Router, the params from the route will be
                in property match. So this should show details of user: {this.props.match.params.userId}.
                You can fetch the model for the user from window.models.userModel(userId). */}
                {user.description}
              </h2>
              <Link to={`/photos/${user._id}`}>
                View Photos
              </Link>
            </>
          ) : (
            <h1>Loading...</h1>
          )}
        </Typography>
      </div>
    );
  }
}

export default UserDetail;
