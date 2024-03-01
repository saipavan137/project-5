import React from 'react';
import {
  Typography
} from '@mui/material';
import './userPhotos.css';
import { Link } from 'react-router-dom';

/**
 * Define UserPhotos, a React componment of project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);

  }

  render() {

    const userId = this.props.match.params.userId;
    const userPhotos = window.models.photoOfUserModel(userId);

    return (
      <Typography variant="body1">
      {/* This should be the UserPhotos view of the PhotoShare app. Since
      it is invoked from React Router the params from the route will be
      in property match. So this should show details of user:
      {this.props.match.params.userId}. You can fetch the model for the user from
      window.models.photoOfUserModel(userId): */}
        {/* <Typography variant="caption">
          {JSON.stringify(window.models.photoOfUserModel(this.props.match.params.userId))}
          <img src="" alt="" />
        </Typography> */}

        <div className='photo-container'>
          {userPhotos.map(photo => (
            <div key={photo._id}>
              <span className="date-time">{photo.date_time}</span>
              <img className="photo" src={`/images/${photo.file_name}`} alt="" />
              <div className="comments">
                {photo.comments && photo.comments.map(comment => (
                  <div key={comment._id} className="comment">
                    <span className="date-time">{comment.date_time}</span>
                    <Link to={`/users/${comment.user._id}`}><span className="username">{comment.user.first_name} {comment.user.last_name}</span></Link>
                    <span>{comment.comment}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Typography>

    );
  }
}

export default UserPhotos;
