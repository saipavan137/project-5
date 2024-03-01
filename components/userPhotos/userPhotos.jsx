import React from 'react';
import {
  Typography
} from '@mui/material';
import './userPhotos.css';
import { Link } from 'react-router-dom';
import fetchModel from '../../lib/fetchModelData';
import TopBar from '../topBar/TopBar';
/**
 * Define UserPhotos, a React componment of project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_id : undefined,
      userPhotos: undefined,
      user: null
  };
  }

  componentDidMount() {
    this.handleUserChange(this.props.match.params.userId);
  }

  componentDidUpdate() {
      const newUserId = this.props.match.params.userId;
      const currentUserId = this.state.user_id;
      if (currentUserId  !== newUserId){
          this.handleUserChange(newUserId);
      }
  }


  handleUserChange(userId){
    fetchModel("/photosOfUser/" + userId)
        .then((response) =>
        {
            this.setState({
                user_id : userId,
                userPhotos: response.data
            });
        });
    fetchModel("/user/" + userId)
        .then((response) =>
        {
            const new_user = response.data;
            this.setState({
              user: new_user
            });
        });
  }
  render() {

    const userPhotos = this.state.userPhotos;
    const topBarContent = this.state?.user ? `User photos for ${this.state.user?.first_name} ${this.state.user?.last_name}` : '';
    return (
      <div>
      <TopBar topName={topBarContent}></TopBar>
      <Typography variant="body1">
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
      </div>
    );
  }
}

export default UserPhotos;
