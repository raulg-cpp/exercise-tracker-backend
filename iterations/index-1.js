const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

// read forms
const bodyParser = require('body-parser'); 
app.use( bodyParser.urlencoded({extended:true}) ); 

// mongodb - store users
mongoose = require('mongoose');
mongoose.connect( process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

//---------------- boilerplate ----------------

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

//---------------- custom code ---------------

/* --- database functions --- */

// user schema
const userSchema = new mongoose.Schema({
  username: {type: String, required: true},
  log: [{
    description: {type: String, required: true},
    duration: {type: Number, required: true},
    date: String
  }]
});

let UserLog =  mongoose.model('UserLog', userSchema);

// wipe data
/*
UserLog.deleteMany({})
.then(x => console.log("wiped data"))
.catch(error => console.log(error));
*/

//example person
/*
const personData = new UserLog(
  { name: "name", 
    log: [
      {description: "desc", duration: 3, date: "1993-03-13"}
    ]
  }
);
console.log(personData);
*/

// save user
function saveUser(user) {
  user.save()
  .then( data => console.log("saved user") )
  .catch( error => console.log(error) );
}

// get user
function getUser(id, fdone) {
  UserLog.findById(id)
  .then( data => {
    console.log("retrieved user"); 
    fdone(data); // do something with data
    //console.log(data);
  })
  .catch( error => console.log(error) );
}

// update user
function updateUser(id, data_new) {
  UserLog.findByIdAndUpdate(id, data_new)
  .then( data => console.log("updated user") )
  .catch( error => console.log(error) );
}

// delete user
function removeUser(id) {
  UserLog.findByIdAndDelete(id)
  .then( data => console.log("removed user") )
  .catch( error => console.log(error) );
}

// test
/*
saveUser(personData);
getUser(personData._id, x => { console.log(x) } );
updateUser(personData._id, { name: "bob" } );
getUser(personData._id, x => { console.log(x) } );
removeUser(personData._id);
*/
// retrieve user

//var id_g = new mongoose.Types.ObjectId('66738d458b0c089582cada2e');
//getUser(id_g, x => console.log(x) );

/* --- user functions --- */

// read create user
app.post("/api/users",  
  function (req, res) {
    // form input
    var username = req.body.username;
    console.log("submitted user");

    // new entry
    const newUser = new UserLog( { username: username } );
    saveUser(newUser);
    // output
    res.json({
      username: username,
      _id: newUser._id
    });
  }
);

// get all users
app.get("/api/users",  
  function (req, res) {
    UserLog.find({})
    .sort( {username: 1} )
    .select( {username: 1, _id: 1} )
    .then( data => {
      console.log(data);
      res.json( data ); 
    })
    .catch( error => console.log(error) );
  }
);

/* --- exercise functions --- */

app.post("/api/users/:_id/exercises",  
  function (req, res) {
    // form input
    var id = req.body._id;
    var description = req.body.description;
    var duration = req.body.duration;
    var date_str = req.body.date;
    
    console.log(id);
    console.log(description);
    console.log(duration);

    var date = date_str.length === 0 ? new Date() : new Date(date_str);
    date = date.toDateString();
    console.log(date);

    // output
    var user_id = new mongoose.Types.ObjectId(id);

    getUser( user_id, user => {
      user.log.push({
        'description': description,
        'duration': duration,
        'date': date
      });
      //console.log(user);

      saveUser(user);
      
      res.json({
        '_id': user._id,
        'username': user.username,
        'description': description,
        'duration': duration,
        'date': date
      });
    }); 
  }
);
