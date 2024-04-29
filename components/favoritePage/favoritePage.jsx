import React from 'react';
import {  Modal, Backdrop, Fade, Typography } from '@mui/material';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import './favoritePage.css';

class FavoritePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photoArray: [],
      selectedImage: null,
      selectedImageDateTime: null,
      openModal: false,
    };
  }

  componentDidMount() {
    this.handleFavoriteImages();
  }

  handleFavoriteImages = () => {
    const { activeUser } = this.props;
    axios.post('/favorite', {
      favorite: 'ALL',
      user_id: activeUser._id,
    })
      .then((res) => {
        this.setState({
          photoArray: res.data,
        });
        console.log(res);
      })
      .catch(er => {
        console.log(er);
      });
  };

  handleDeleteFavorite = (fileName) => {
    const { activeUser } = this.props;
    axios.post('/favorite', {
      favorite: false,
      fileName,
      user_id: activeUser._id,
    })
    .then((res) => {
      console.log(res);
      const updatedPhotoArray = this.state.photoArray.filter((photo) => photo.file_name !== fileName);
      this.setState({
        photoArray: updatedPhotoArray,
      });
      this.props.activeUser.favorites = updatedPhotoArray;
    })
    .catch(er => {
      console.log(er);
    });
  };

  handleOpenModal = (image, dateTime) => {
    this.setState({
      selectedImage: image,
      selectedImageDateTime: dateTime,
      openModal: true,
    });
  };

  handleCloseModal = () => {
    this.setState({
      openModal: false,
    });
  };

  render() {
    return (
      <div>
        <div className='parentFavoritePage' elevation={3}>
          {this.state.photoArray.length > 0 && this.state.photoArray.map((photo, index) => (
            <div className='favPicContainer' key={`${index}`}>
              <CloseIcon
                style={{ cursor: 'pointer' }}
                className='crossIcon'
                onClick={() => this.handleDeleteFavorite(photo.file_name)}
              />
              <img
                className='favPicTag'
                src={`images/${photo.file_name}?w=32&h=32&fit=crop&auto=format&dpr=2.2x`}
                alt={photo.file_name}
                loading="lazy"
                onClick={() => this.handleOpenModal(photo.file_name, photo.date_time)}
              />
            </div>
          ))}
          {this.state.photoArray.length === 0 && (
            <p>No favorite photos found.</p>
          )}
        </div>

        {/* Modal for displaying full-size image */}
        <Modal
          open={this.state.openModal}
          onClose={this.handleCloseModal}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={this.state.openModal}>
            <div className="modal-container">
              <div className="modal-content">
                <img
                  src={`images/${this.state.selectedImage}`}
                  alt={this.state.selectedImage}
                  className="modal-image"
                />
                <Typography variant="caption" className="modal-caption">
                  {this.state.selectedImageDateTime && (
                    `Date: ${new Date(this.state.selectedImageDateTime).toLocaleString()}`
                  )}
                </Typography>
              </div>
            </div>
          </Fade>
        </Modal>
      </div>
    );
  }
}

export default FavoritePage;
