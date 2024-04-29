/* eslint-disable class-methods-use-this */
import React from 'react';
import {
  Typography,ImageList,Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,Button
} from '@mui/material';
import {Mention, MentionsInput } from 'react-mentions';
import './userPhotos.css';
import axios from 'axios';
import fetchModel from '../../lib/fetchModelData';
import Photo from './photo/photo';
import mentionsInputStyle from "./mentionsInputStyle";
import mentionStyle from "./mentionStyle";


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
      commenterId: null,
      commentText: null,
      current_photo_id:null,
      users: [],
      taggedIds: [],
      tagValue: "",
      add_comment:false
    };
    this.tagOnChange = this.tagOnChange.bind(this);
    this.handleCancelAddComment = this.handleCancelAddComment.bind(this);

  }

  
  componentDidMount() {
    this.handleUserChange(this.props.match.params.userId);
    this.checkLoggedIn();
    axios.get("/user/list").then((response) => {
      this.setState({
        users: response.data.map((obj) => {
          return { id: obj._id, display: obj.first_name + " " + obj.last_name };
        }),
      });
    });
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
      this.setState({ commenterId: data });
    });
  }

  tagOnChange(event, newValue, newPlainTextValue, mentions) {
    const mentionIds = mentions.map((mention) => mention.id);
    this.setState({
      tagValue: event.target.value,
      commentText : event.target.value,
      //current_photo_id: photo._id,
      taggedIds: mentionIds,
    });
  }

  

  handleShowAddComment = (event) => {
    const photo_id = event.target.attributes.photo_id.value;
    this.setState({
      add_comment: true,
      current_photo_id: photo_id
    });
  };

  handleCancelAddComment = () => {
    this.setState({
      add_comment: false,
      current_photo_id: undefined
    });
  };

  handleSubmit(event) {
    event.preventDefault();
    this.getSessionUserID()
      .then(commenterId => {
        const userId = this.state.user_id;
        const text = this.state.commentText;
        this.handleCommentSubmit(userId, commenterId, text);
      })
      .catch(error => {
        console.error('Error getting commenter ID:', error);
      });
  }

  handleCommentSubmit(userId, commenterId, text) {
    const requestBody = {
      userId: userId,
      commenterId: commenterId,
      text: text,
      taggedIds: this.state.taggedIds,
    };
    
    console.log('userid:', userId);
    console.log('text:', text);
    console.log('commenter:', commenterId);
    const current_photo_id = this.state.current_photo_id;
    fetch(`/commentsOfPhoto/${current_photo_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      this.setState({
        add_comment: false,
        current_photo_id: undefined,
        tagValue: undefined,
      });
      axios.get(`/photosOfUser/${userId}`).then((response) => {
        this.setState({
          userPhotos: response.data,
        });
      });
    })
    .catch(error => {
      console.error('Error submitting comment:', error);
    });
  }

  getSessionUserID(){
    return fetch('/getid', {
      method: 'GET'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch user ID');
      }
      return response.json();
    })
    .then(data => {

      return data.userId;
    })
    .catch(error => {
      console.error('Error fetching user ID:', error);
      throw error;
    });
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

    if (!this.state.user_id || this.state.commenterId === null) {
      // If not loaded, return a loading indicator or null
      return null; 
    }

    return this.state.user_id ? (
      <div>
        <ImageList variant="masonry" cols={1} gap={8}>
            {userPhotos ? userPhotos.map((item) => {              
                            
              let favoriteFlag = false;
              console.log(this.props.activeUser.favorites);
              this.props.activeUser.favorites.forEach((fav) => {
                console.log(fav.file_name);
                if (fav.file_name === item.file_name){
                  favoriteFlag = true;
                }
              });
             
              return (
                <Photo key={item._id} favoriteFlag={favoriteFlag} activeUser={this.props.activeUser}
                  item={item} handleShowAddComment={this.handleShowAddComment}>
                </Photo>
              );
            }) : (
              <div>
                <Typography>No Photos</Typography>
              </div>
            )}
        </ImageList>     
        {this.state.commenterId && (
          <Dialog open={this.state.add_comment}>
            <DialogTitle>Add Comment</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Enter New Comment for Photo
              </DialogContentText>
              <MentionsInput
                placeholder="Add Comment. Use '@' for mention and '&' for emojis"
                value={this.state.tagValue}
                onChange={this.tagOnChange}
                style={mentionsInputStyle}
                a11ySuggestionsListLabel={"Suggested mentions"}
              >
                <Mention style={mentionStyle} data={this.state.users} />
              </MentionsInput>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {this.handleCancelAddComment();}}>Cancel</Button>
              <Button onClick={(event) => this.handleSubmit(event)}>Add</Button>
            </DialogActions>
          </Dialog>
        )} 
      </div>
    ):(
      <div></div>
    );
  }
}

export default UserPhotos;
