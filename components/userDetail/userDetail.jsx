import React, { Component } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Typography, Grid, Card, CardContent } from '@mui/material';
import './userDetail.css';
import fetchModel from '../../lib/fetchModelData';

class UserDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: undefined,
      mentionComments: [],
      commenterNames: {},
    };
  }

  componentDidMount() {
    const userId = this.props.match.params.userId;
    this.fetchUserDetails(userId);
    this.fetchMentionComments(userId);
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.userId !== prevProps.match.params.userId) {
      const userId = this.props.match.params.userId;
      this.fetchUserDetails(userId);
      this.fetchMentionComments(userId);
    }
  }

  fetchUserDetails(userId) {
    fetchModel(`/user/${userId}`).then((response) => {
      const newUser = response.data;
      this.setState({
        user: newUser,
      });
      const mainContent = `User Details for ${newUser.first_name} ${newUser.last_name}`;
      this.props.changeMainContent(mainContent);
    });
  }

  fetchMentionComments(userId) {
    fetch(`/comments/mentions/${userId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        const userIds = data.map((comment) => comment.userId);

        Promise.all(userIds.map((id) => fetchModel(`/user/${id}`)))
          .then((responses) => Promise.all(responses.map((res) => res.data)))
          .then((users) => {
            const commenterNames = {};
            users.forEach((user) => {
              commenterNames[user._id] = user;
            });
            this.setState({
              mentionComments: data,
              commenterNames,
            });
          });
      })
      .catch((error) => {
        console.error('Error fetching mention comments:', error);
      });
  }

  render() {
    const { user, mentionComments, commenterNames } = this.state;

    return user ? (
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
              <RouterLink to={`/photos/${user._id}`}>View Photos</RouterLink>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">Mentioned in Comments:</Typography>
              {mentionComments.map((comment) => (
                <div key={comment.commentId}>
                  <Typography variant="body2">
                    <RouterLink to={`/users/${commenterNames[comment.userId]._id}`}>
                      {commenterNames[comment.userId].first_name} {commenterNames[comment.userId].last_name}
                    </RouterLink>: {comment.commentText}
                  </Typography>
                  {comment.photoFileName && (
                    <RouterLink to={`/photos/${comment.photoUserId}`}>
                      <img
                        src={`../../images/${comment.photoFileName}`}
                        alt="Photo Thumbnail"
                        style={{ maxWidth: '100px', cursor: 'pointer' }}
                      />
                    </RouterLink>
                  )}
                </div>
              ))}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    ) : (
      <h1>Loading...</h1>
    );
  }
}

export default UserDetail;
