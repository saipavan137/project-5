/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the cs collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");

//const fs=require("fs");

const async = require("async");
const path = require('path');

const express = require("express");
const app = express();
app.use(session({secret: "secretKey", resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
//const models = require("./modelData/photoApp.js").models;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));
app.use(session({secret: "secretKey", resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

app.get("/", function (request, response) {
  response.send( path.join("Simple web server of files from ", __dirname));
});

//Multer config for desination
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "./images/"));
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage }); //define the upload function for multer

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 * 
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    SchemaInfo.find({}, function (err, info) {
      if (err) {
        // Query returned an error. We pass it back to the browser with an
        // Internal Service Error (500) error code.
        console.error("Error in /user/info:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        // Query didn't return an error but didn't find the SchemaInfo object -
        // This is also an internal error return.
        response.status(500).send("Missing SchemaInfo");
        return;
      }

      // We got the object - return it in JSON format.
      console.log("SchemaInfo", info[0]);
      response.end(JSON.stringify(info[0]));
    });
  } else if (param === "counts") {
    // In order to return the counts of all the collections we need to do an
    // async call to each collections. That is tricky to do so we use the async
    // package do the work. We put the collections into array and use async.each
    // to do each .count() query.
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];
    async.each(
      collections,
      function (col, done_callback) {
        col.collection.countDocuments({}, function (err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function (err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          const obj = {};
          for (let i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    response.status(400).send("Bad param " + param);
  }
});

function getSessionUserID(request){
  return request.session.user_id;
  //return session.user._id;
}

function hasNoUserSession(request, response){
  //return false;
  if (!getSessionUserID(request)){
    response.status(401).send();
    return true;
  }
  // if (session.user === undefined){
  //   response.status(401).send();
  //   return true;
  // }
  return false;
}


app.get('/getid', function(request, response) {
  const userid = request.session.user_id;
  if (!userid) {
    response.status(500).json({ error: "Error" });
  }
  response.status(200).json({ userId: userid });
});

/**
 * URL /admin/login - Returns user object on successful login
 */
app.post("/admin/login", function (request, response) {
  const login_name = request.body.login_name || "";
  const password = request.body.password || "";
  User.find( {login_name: login_name, password: password }, {__v: 0})
    .then((user)=> {    
      if (user.length === 0) {
        // Query didn't return an error but didn't find the user object -
        // This is also an internal error return.
        response.status(400).send();
        return;
      }
      request.session.user_id = user[0]._id;
      session.user_id = user[0]._id;
      //session.user = user;
      //response.cookie('user',user);
      // We got the object - return it in JSON format.
      response.end(JSON.stringify(user[0]));
    }).catch((err) =>{
      if (err) {
        // Query returned an error. We pass it back to the browser with an
        // Internal Service Error (500) error code.
        console.error("Error in /admin/login", err);
        response.status(500).send(JSON.stringify(err));
      }
  });
});

/**
 * URL /admin/logout - clears user session
 */
app.post("/admin/logout", function (request, response) {
  //session.user = undefined;
  //response.clearCookie('user');
  request.session.destroy(() => {
    session.user_id = undefined;
    response.end();
  });
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", function (request, response) {
  if (hasNoUserSession(request, response)) return;
   User.find({}, { _id: 1, first_name: 1, last_name: 1 })
    .then((userList)=> {
      if (userList.length === 0) {
        // Query didn't return an error but didn't find the SchemaInfo object -
        // This is also an internal error return.
        response.status(400).send(JSON.stringify("No users found in the database"));
        return;
      }  
      response.status(200).send(JSON.stringify(userList));  
    }).catch((error) =>{
      console.error("Error while retrieving user list", error);
      response.status(500).send(JSON.stringify(error));
      return null;
    });
});

app.get("/checkloggedin", function (request, response)  {
  const userid = getSessionUserID(request);
  response.status(200).json({ userId: userid });
});

app.post("/commentsOfPhoto/:photo_id", function (request, response) {
  if (hasNoUserSession(request, response)){ return;}
  const { userId, commenterId, text } = request.body;
  const id =  request.params.photo_id || "";
  
  console.log(userId);
  console.log(commenterId);
  console.log(text);
  if (!text ) {
     response.status(400).json({ error: "userid and text required" });
     return ;
  }

  Photo.updateOne(
    { _id: new mongoose.Types.ObjectId(id) },
    { $push: {
        comments: {
          comment: text,
          date_time: new Date(),
          user_id: new mongoose.Types.ObjectId(commenterId),
          _id: new mongoose.Types.ObjectId()
        }
      } },
  function (err) {
    if (err) {
      // Query returned an error. We pass it back to the browser with an
      // Internal Service Error (500) error code.
      console.error("Error in /commentsOfPhoto/:photo_id", err);
      response.status(500).send(JSON.stringify(err));
      return;
    }
    response.end();
  });  
});

app.post('/photos/new',upload.single("photo"),  function (request, response) {
  if (hasNoUserSession(request, response)){
    return;
  } 
  if (!request.file) {
    response.status(400).json({error: "No file uploaded."});
  }
  const userId = getSessionUserID(request);

  if (!userId) {
     response.status(401).json({error: "User not logged in"});
  }

  Photo.create({
      _id: new mongoose.Types.ObjectId(),
      file_name:  request.file.filename,
      date_time: new Date(),
      user_id: new mongoose.Types.ObjectId(userId),
      comment: []
    }).then(() => {
        response.end();
    }).catch(err2 => {
        console.error("Error in /photos/new", err2);
        response.status(500).send(JSON.stringify(err2));
    });
   
 
});

app.post("/user", function (request, response) {
  const first_name = request.body.first_name || "";
  const last_name = request.body.last_name || "";
  const location = request.body.location || "";
  const description = request.body.description || "";
  const occupation = request.body.occupation || "";
  const login_name = request.body.login_name || "";
  const password = request.body.password || "";

  if (first_name === "") {
    console.error("Error in /user", first_name);
    response.status(400).send("first_name is required");
    return;
  }
  if (last_name === "") {
    console.error("Error in /user", last_name);
    response.status(400).send("last_name is required");
    return;
  }
  if (login_name === "") {
    console.error("Error in /user", login_name);
    response.status(400).send("login_name is required");
    return;
  }
  if (password === "") {
    console.error("Error in /user", password);
    response.status(400).send("password is required");
    return;
  }

  User.exists({login_name: login_name}, function (err, returnValue){
    if (err){
      console.error("Error in /user", err);
      response.status(500).send();
    } else if (returnValue) {
        console.error("Error in /user", returnValue);
        response.status(400).send();
    } else {
        User.create(
            {
              _id: new mongoose.Types.ObjectId(),
              first_name: first_name,
              last_name: last_name,
              location: location,
              description: description,
              occupation: occupation,
              login_name: login_name,
              password: password
            })
            .then((user) => {
              request.session.user_id = user._id;
              session.user_id = user._id;
              response.end(JSON.stringify(user));
            })
            .catch(error => {
              console.error("Error in /user", error);
              response.status(500).send();
            });
      }
    
  });
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", function (request, response) {
  if (hasNoUserSession(request, response)) return;
  const id = request.params.id;
  User.findById(id,{__v:0, login_name:0, password: 0})
    .then((user) => {
      if (user === null) {
        console.log("User with _id:" + id + " not found.");
        response.status(400).send("User with id is not found in the db.");
        return;
      }
      response.status(200).send(user);
    }).catch((err) =>{
      console.error("Error while retrieving user information with id {id}", err.reason);
      if (err.reason.toString().startsWith("BSONTypeError:")){
        response.status(400).send("Please check the id being passed in the request");
      }else{
        response.status(500).send("Error while retrieving user information with id {id}");
      }
      return null;
    });
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", function (request, response) {
  if (hasNoUserSession(request, response)) return;
  const id = request.params.id;
  Photo.find({ user_id: id })
  .then((photos) => {
    if (photos.length === 0) {
      console.log("Photos for user with _id:" + id + " not found.");
      response.status(400).send(" Photos for user not found");
    } else{
      var users = [];
      var photosJson = JSON.parse(JSON.stringify(photos));
      for (var i = 0; i < photosJson.length; i++) {
        delete photosJson[i].__v;
        var comments = photosJson[i].comments;
        comments.forEach(function (comment) {
            var uid = comment.user_id;
            users.push(function (callback) {
                User.findOne({
                    _id: uid
                }).then((result) => {
                    var userInfo = JSON.parse(JSON.stringify(result));
                    var user = {
                        _id: uid,
                        first_name: userInfo.first_name,
                        last_name: userInfo.last_name
                    };
                    comment.user = user;
                    callback();
                }).catch((err1) =>{
                  console.log("Error occurred while retrieving user info of the comment",err1);
                  response.status(400).send("Error occurred while retrieving user info of the comment");
                });
            });
            delete comment.user_id;
        });
      }
      async.parallel(users, function () {
        response.status(200).send(photosJson);
      });
    }
  }).catch((err) => {
      console.log("Error occurred while retrieving photo with id",err);
      response.status(400).send(JSON.stringify(err));
      return null;
  });
});

//favorite endpoint
app.post('/favorite', async (request, response) => {
  const { favorite, fileName, user_id, date_time } = request.body;
  try {
    console.log(favorite, fileName, user_id, date_time);
    const user = await User.findById(user_id);
    if(favorite ==='ALL' || fileName === undefined) {
      response.status(200).send(user.favorites);
      return;
    }
    else if(favorite) {
      const file = {file_name: fileName, date_time: date_time };
      console.log('favorite');
      user.favorites.push(file);
      user.save().then(res => {
        console.log(res);
        response.status(200).send(user.favorites);
      }).catch((err) =>{console.log(err);});
    }
    else {
      const indexToRemove = user.favorites.findIndex(
        (file) => file.file_name === fileName
      );
      console.log('Not favorite');
      if (indexToRemove !== -1) {
        user.favorites.splice(indexToRemove, 1);
      }   
      user.save().then(res => {
        console.log(res);
        response.status(200).send(user.favorites);   
      }).catch((err) =>{console.log(err);});         
    }   
    return;
  } catch (e) {
    console.log(e);
  }
 
});

//endpoint to fetch the comments with mentions in them
app.get('/comments/mentions/:mentionedUserId', async (req, res) => {
  const mentionedUserId = req.params.mentionedUserId;
  try {
    const allComments = await Photo.aggregate([
      { $unwind: '$comments' }, 
      { 
        $match: {
          'comments.comment': { $regex: `${mentionedUserId}`, $options: 'i' }
        }
      },
      {
        $project: {
          _id: 0, // Exclude the _id field from the output
          commentId: '$comments._id', 
          commentText: '$comments.comment', 
          commentDateTime: '$comments.date_time', 
          userId: '$comments.user_id', 
          photoFileName: '$file_name',
          photoUserId: '$user_id',
        },
      },
    ]);
    res.status(200).send(allComments);

    return;
  } catch (error) {
    console.error('Error fetching all comments:', error);
    throw error;
  }
});



const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log("Listening at http://localhost:"+port);
});
