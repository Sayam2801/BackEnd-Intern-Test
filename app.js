// //jshint esversion:6
//
// const express = require("express");
// const bodyParser = require("body-parser");
// const ejs = require("ejs");
// const mongoose = require("mongoose");
// const session = require("express-session");//I have already implemented session using express-session now I want to do the same with JWT Authentication
// const bcrypt = require("bcrypt");
// const passport = require("passport");
// const passportLocalMongoose = require("passport-local-mongoose");
// const saltRounds = 12;
//
// const app = express();
//
// app.use(bodyParser.urlencoded({extended: true}));
// app.set("view engine","ejs");
// app.use(express.static("public"));
//
// app.use(session({
//   secret: "Our little secret.",
//   resave: false,
//   saveUninitialized: false
// }));
// app.use(passport.initialize());
// app.use(passport.session());
//
//
// mongoose.connect("mongodb://localhost:27017/user2DB",{useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.set("useCreateIndex",true);
//
// const userSchema = new mongoose.Schema ({
//   username: String,
//   phone: String,
//   email: String,
//   password: String
// });
//
// userSchema.plugin(passportLocalMongoose);
//
//
// const User = mongoose.model("User",userSchema);
// passport.use(User.createStrategy());
// passport.serializeUser(function(user, done) {
//   done(null, user.id);
// });
//
// passport.deserializeUser(function(id, done) {
//   User.findById(id, function(err, user) {
//     done(err, user);
//   });
// });
//
// app.get("/", function(req,res) {
//   res.render("home");
// });
//
// app.post("/register", function(req,res) {
//   res.render("signup");
// });
//
// app.post("/signinOption", function(req,res) {
//   res.render("login");
// });
//
// app.post("/getDetails", function(req,res) {
//   res.render("getDetails");
// });
//
// app.post("/showDetails", function(req,res) {
//   const userEntered = req.body.userName;
//
//   User.findOne({username: userEntered}, function(err, foundUser) {
//     if(err)
//        console.log(err);
//     else
//     {
//       if(foundUser)
//           res.render("showDetails",{userRegistered: foundUser});
//     }
//   });
// });
// app.post("/signup", function(req,res) {
//    bcrypt.hash(req.body.password,saltRounds, function(err,hash) {
//       const newUser = new User ({
//         username: req.body.name,
//         phone: req.body.phone,
//         email: req.body.email,
//         password: hash
//       });
//       newUser.save(function(err) {
//         if(err){
//            console.log(err);
//            res.render("signup");
//         }
//         else
//            res.render("signupSuccessful");
//       });
//    });
// });
// app.post("/signin", function(req,res) {
//   debugger
//   const emailEntered = req.body.email;
//   const passwordEntered = req.body.password;
//   // console.log(emailEntered);
//   // console.log(passwordEntered);
//   User.findOne({email: emailEntered}, function(err, foundUser) {
//     // console.log(passwordEntered);
//     // console.log(foundUser.password);
//     if(err){
//        console.log(err);
//        res.render("login");
//     }
//     else
//     {
//       if(foundUser)
//       {
//         // const hash = bcrypt.hash(passwordEntered,saltRounds,function());
//         bcrypt.compare(passwordEntered,foundUser.password, function(err, result) {
//           if(result===true)
//              res.render("loginSuccessful");
//         });
//       }
//     }
//   });
// });
//
// app.listen(process.env.PORT || 3000, function() {
//   console.log("Server started on port 3000.");
// });
//jshint esversion:6
//Make the necessary changes here now...
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const session = require("express-session");//I have already implemented session using express-session now I want to do the same with JWT Authentication
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const saltRounds = 12;
const auth = require('./middleware/auth');
const app = express();
///Generation of Tokens
function generateAccessToken(email) {
  // expires after half and hour (1800 seconds = 30 minutes)
  return jwt.sign(email, 'TEST', { expiresIn: '1800s' });
}
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(express.static("public"));

// app.use(session({
//   secret: "Our little secret.",
//   resave: false,
//   saveUninitialized: false
// }));
app.use(passport.initialize());
app.use(passport.session());
//See here user2 DB is enabled.. but what happened with mongod? It's not establishing any connections..

mongoose.connect("mongodb://localhost:27017/user2DB",{useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);

const userSchema = new mongoose.Schema ({
  username: String,
  phone: String,
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);


const User = mongoose.model("User",userSchema);
passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
//This route is for triggering home page in the root route..
app.get("/", function(req,res) {
  res.render("home");
});
//This route is for opening signup page on clicking Sign Up button in Home page
app.post("/register", function(req,res) {
  res.render("signup");
});
//This route is for opening login page on clicking Sign Up button in Home page
app.post("/signinOption", function(req,res) {
  res.render("login");
});
//This route is for opening get details page on clicking Sign Up button in Home page
app.post("/getDetails", function(req,res) {
  res.render("getDetails");
});
//This route is for shwoing details of user, when the post request for show details is made from getDetails.ejs
app.post("/showDetails",auth,function(req,res) {
  console.log('test token', req);
  const userEntered = req.body.username;

  User.findOne({username: userEntered}, function(err, foundUser) {
    if(err)
       console.log(err);
    else
    {
      if(foundUser)
          res.render("showDetails",{userRegistered: foundUser});
    }
  });
});
//Sign Up Post Route
app.post("/signup", function(req,res) {
   bcrypt.hash(req.body.password,saltRounds, function(err,hash) {
      const newUser = new User ({
        username: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        password: hash
      });
      newUser.save(function(err) {
        if(err){
           console.log(err);
           res.render("signup");
        }
        else
           res.render("signupSuccessful");
      });
   });
});
//Login Post Route
app.post("/signin",  function(req,res) {
  // debugger
  const emailEntered = req.body.email;
  const passwordEntered = req.body.password;
  // console.log(emailEntered);
  // console.log(passwordEntered);
  User.findOne({email: emailEntered}, function(err, foundUser) {
    // console.log(passwordEntered);
    // console.log(foundUser.password);
    if(err){
       console.log(err);
       res.render("login");
    }
    else
    {
      if(foundUser)
      {
        // const hash = bcrypt.hash(passwordEntered,saltRounds,function());
        bcrypt.compare(passwordEntered,foundUser.password, function(err, result) {
          if(result===true){
          const token = generateAccessToken({ email: req.body.email });
          console.log('token generation', token);
          // res.json(token);//But I want to render the login successful page as well apart from generation of JWT token..
              res.render("loginSuccessful");//Include this file as well
          }
        });
      }
    }
  });
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000.");
});
