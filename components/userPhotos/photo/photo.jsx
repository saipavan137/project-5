/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import {
  Button, TextField,
   ImageListItem, Typography
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import axios from 'axios';
import './photo.css';
import MessageInput from '../message';



class Photo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
     
      favoriteState: props.favoriteFlag,
      users: [],
      
    };
    
  }
  

  componentDidMount() {
    axios.get("/user/list").then((response) => {
      this.setState({
        users: response.data.map((obj) => {
          return { id: obj._id, display: obj.first_name + " " + obj.last_name };
        }),
      });
    });
  }

  handleFavorite = (item) => {
    const { file_name, date_time } = item;
    console.log('date_time: ', date_time);
    const { activeUser } = this.props;
    console.log(activeUser);

    if(this.state.favoriteState){
      console.log("Already favorite");
    }else{
      this.setState({ favoriteState: true });

      axios.post('/favorite', {
        fileName: file_name,
        favorite: true,
        user_id: activeUser._id,
        date_time: date_time,
      }).then((res) => {
        console.log(res);
        this.props.activeUser.favorites = res.data;
        console.log(this.props.activeUser.favorites);
      }).catch(er => {
        console.log(er);
      });
    }
  };

  render() {
    const { item } = this.props;
    return (
      <div>
        <div key={item._id}>
          <TextField label="Photo Date" variant="outlined" disabled fullWidth margin="normal"
            value={item.date_time} />
          <ImageListItem key={item.file_name}>
            <img src={`images/${item.file_name}?w=164&h=164&fit=crop&auto=format&dpr=2.2x`}
              srcSet={`images/${item.file_name}?w=164&h=164&fit=crop&auto=format`}
              alt={item.file_name} loading="lazy"
            />
          </ImageListItem>
          <div className='controlIcons'>
            <div className="iconContainer" 
              alt="favoriteIcon"
              onClick={() => {this.handleFavorite(item); }}>
              <FavoriteIcon style={{ fontSize:'20px', color: this.state.favoriteState ? 'red' : 'black'}} />
            </div>
          </div>
          <div>
            {item.comments ?
              item.comments.map((comment) => (
                <div key={comment._id}>
                  <TextField label="Comment Date" variant="outlined" disabled fullWidth
                    margin="normal" value={comment.date_time} />
                  <TextField label="User" variant="outlined" disabled fullWidth
                    margin="normal"
                    value={comment.user.first_name + " " + comment.user.last_name}>
                  </TextField>
                  <MessageInput msg={comment.comment} users={this.state.users} />
                </div>
              ))
              : 
              (
                <div>
                  <Typography>No Comments</Typography>
                </div>
              )
            }
            <Button photo_id={item._id} variant="contained" onClick={(e) => this.props.handleShowAddComment(e)}>
              Add Comment
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default Photo;
