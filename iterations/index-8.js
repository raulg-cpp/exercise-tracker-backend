const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

// read forms
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// mongodb - store users
mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//---------------- boilerplate ----------------

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

//---------------- custom code ---------------

/* --- database functions --- */

// user schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  log: [
    {
      description: { type: String, required: true },
      duration: { type: Number, required: true },
      date: { type: String, required: true },
    },
  ],
});

let UserLog = mongoose.model("UserLog", userSchema);

// wipe data
//
UserLog.deleteMany({})
  .then((x) => console.log("wiped data"))
  .catch((error) => console.log(error));
//

// save user
function saveUser(user) {
  user
    .save()
    .then((data) => console.log("saved user"))
    .catch((error) => console.log(error));
}

// get user
function getUser(id, fdone) {
  UserLog.findById(id)
    .then((data) => {
      console.log("retrieved user");
      fdone(data); // do something with data
      //console.log(data);
    })
    .catch((error) => console.log(error));
}

// update user
function updateUser(id, data_new) {
  UserLog.findByIdAndUpdate(id, data_new)
    .then((data) => console.log("updated user"))
    .catch((error) => console.log(error));
}

// delete user
function removeUser(id) {
  UserLog.findByIdAndDelete(id)
    .then((data) => console.log("removed user"))
    .catch((error) => console.log(error));
}

/* --- user functions --- */

// read create user
app.post("/api/users", function (req, res) {
  // form input
  var username = req.body.username;
  console.log("submitted user");

  // new entry
  const newUser = new UserLog({ username: username });
  saveUser(newUser);
  // output
  res.json({
    username: username,
    _id: newUser._id,
  });
});

// get all users
app.get("/api/users", function (req, res) {
  UserLog.find({})
    .sort({ username: 1 })
    .select({ username: 1, _id: 1 })
    .then((data) => {
      //console.log(data);
      res.json(data);
    })
    .catch((error) => console.log(error));
});

/* --- exercise functions --- */

app.post("/api/users/:_id/exercises", function (req, res) {
  // form input
  var id = req.params["_id"];
  var description = req.body.description;
  var duration = Number(req.body.duration);
  var date_input = req.body.date;

  // format date
  var date = date_input ? new Date(date_input) : new Date();
  var date_str = date.toDateString();
  //console.log(date_str);

  // output
  var user_id = new mongoose.Types.ObjectId(id);

  getUser(user_id, (user) => {
    // update log
    user.log.push({
      description: description,
      duration: duration,
      date: date_str,
    });
    //console.log(user);
    saveUser(user);

    // api output
    res.json({
      _id: id,
      username: user.username,
      date: date_str,
      duration: duration,
      description: description,
    });
  });
});

app.get("/api/users/:_id/logs", function (req, res) {
  var id = req.params["_id"];
  var user_id = new mongoose.Types.ObjectId(id);

  // header variables
  var variables = req.params;
  var date_to = variables.to;
  var date_from = variables.from;
  var limit = variables.limit;
  /*
  if (date_to === undefined) {
    console.log("date_to undef");
  }
  if (date_from === undefined) {
    console.log("date_from undef");
  }
  if (limit === undefined) {
    console.log("limit undef");
  }*/
  /*
  console.log(date_to);
  console.log(date_from);
  console.log(limit);
  */
  if (date_to === undefined || date_from == undefined) {
    getUser(user_id, function (user) {
      //console.log(user);
      var logs = user.log;
      res.json({
        _id: user_id,
        username: user.username,
        log: logs,
        count: user.__v, // length of array
      });
    });

    // valid date limits
  } else {
    /*
    Person.find( {'favoriteFoods': foodToSearch} )
    .sort( {'name': 1} )
    .limit(2)
    .select( {'name': 1, '_id': 0, 'age': 0} )
    .exec(
      function( error, data ) {
        if(error) {
          return done(error);
        } else {
          console.log(data);
          return done(null, data);
        }
    });
    */
  }
});
