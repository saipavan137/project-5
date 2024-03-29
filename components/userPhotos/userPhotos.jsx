import React from 'react';
import {
  Typography
} from '@mui/material';
import './userPhotos.css';
import { Link } from 'react-router-dom';
import fetchModel from '../../lib/fetchModelData';

/**
 * Define UserPhotos, a React component of project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_id : undefined,
      userPhotos: [],
      user: null,
      isLoggedIn: false,
      commentText: null
  };
  }

  
  componentDidMount() {
    this.handleUserChange(this.props.match.params.userId);
    this.checkLoggedIn();
  }

  componentDidUpdate() {
      const newUserId = this.props.match.params.userId;
      const currentUserId = this.state.user_id;
      if (currentUserId  !== newUserId){
          this.handleUserChange(newUserId);
      }
  }

  checkLoggedIn() {
    fetch('/checkloggedin')
    .then(response => response.json())
    .then(data => {
      this.setState({ isLoggedIn: data.isLoggedIn });
    })
  }

  handleSubmit() {
    event.preventDefault();
    const userId = this.state.user_id;
    const commenterId = this.getSessionUserID();
    const text = this.state.commentText;

    this.handleCommentSubmit(userId, commenterId, text);
  }

  handleCommentSubmit(userId, commenterId, text) {
    const requestBody = {
      userId: userId,
      commenterId: commenterId,
      text: text
    };
  
    fetch('/postcomment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.error('Error submitting comment:', error);
    });
  }

  getSessionUserID(request){
    return request.session.user_id;
    //return session.user._id;
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
            const main_content = this.state.user? `User photos for ${this.state.user?.first_name} ${this.state.user?.last_name}` : '';
            this.props.changeMainContent(main_content);
        });
  }
  render() {
    const userPhotos =  this.state.userPhotos;
    const isLoggedIn = this.props.isLoggedIn;

    return this.state.user_id ? (
      <div>
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
                {isLoggedIn && (
                  <div className='comment-form'>
                    <form onSubmit={(event) => this.handleSubmit(event)}>
                      <textarea
                        placeholder="comment"
                        rows={4}
                        cols={50}
                        value={this.state.commentText}
                        onChange={(event) => this.setState({ commentText: event.target.value })}
                      />
                      <button type="submit">Submit Comment</button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Typography>
      </div>
    ):(
      <div></div>
    );
  }
}

export default UserPhotos;
