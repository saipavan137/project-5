import React from 'react';
import { Link } from 'react-router-dom';
import {

  List,
  ListItem,
  ListItemText
}
from '@mui/material';
import './userList.css';
import fetchModel from '../../lib/fetchModelData';


/**
 * Define UserList, a React component of project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      userId: undefined
    };
  }

  componentDidMount() {
    this.fetchUserListDetails();
  }

  componentDidUpdate() { //checks if component updated when new user is selected
    const userId = this.props.match?.params.userId;
    if (this.state.userId !== userId) {
      this.setState({
        userId: userId
    });
    }
  }

  fetchUserListDetails(){
     fetchModel("/user/list")
          .then((response) =>
          {
              this.setState({
                  users: response.data
              });
          });
    }

  render() {

    const { users } = this.state;

    return (
      <div>
        {/* <Typography variant="body1">
          This is the user list, which takes up 3/12 of the window.
          You might choose to use <a href="https://mui.com/components/lists/">Lists</a> and <a href="https://mui.com/components/dividers/">Dividers</a> to
          display your users like so:
        </Typography> */}
        <List component="nav">
          {users.map(user => (
          <div key={user._id}>
            <ListItem button component={Link} to={`/users/${user._id}`} selected={this.state.userId === user._id}>
              <ListItemText primary={`${user.first_name} ${user.last_name}`}></ListItemText>
            </ListItem>
          </div>
          ))}
        </List>
        {/* <Typography variant="body1">
          The model comes in from window.models.userListModel()
        </Typography> */}
      </div>
    );
  }
}

export default UserList;
