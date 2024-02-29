import React from 'react';
import { Link } from 'react-router-dom';
import {
  List,
  ListItem,
  Typography
} from '@mui/material';
import './userDetail.css';


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
    this.fetchUserDetails();
  }

  componentDidUpdate(prevProps) { //checks if component updated when new user is selected
    if (prevProps.match.params.userId !== this.props.match.params.userId) {
      this.fetchUserDetails();
    }
  }

  fetchUserDetails() {
    const userId = this.props.match.params.userId;
    const user = window.models.userModel(userId);
    this.setState({ user }); 
  }

  render() {

    const { user } = this.state;

    return (
      <div>
        <Typography variant="body1">
          {user ? ( //Makes sure the user is loaded before page renders to prevent error
            <>
              <h1>{user.first_name} {user.last_name}</h1>
              <p>
                {/* This should be the UserDetail view of the PhotoShare app. Since
                it is invoked from React Router, the params from the route will be
                in property match. So this should show details of user: {this.props.match.params.userId}.
                You can fetch the model for the user from window.models.userModel(userId). */}
                {user.description}
              </p>
              <Link to={`/photos/${user._id}`}>
                View Photos
              </Link>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </Typography>
      </div>
    );
  }
}

export default UserDetail;
