const express = require('express');
const app = express();
const { sports, matches, session, player:playerModel, admin: adminModel} = require("./models");
const path = require('path');
const bcrypt=require('bcrypt');
const bodyParser = require('body-parser');  
const passport=require('passport')
const LocalStrategy=require('passport-local')
const sess=require('express-session')
const connectEnsureLogin=require("connect-ensure-login")
const saltRounds=10
// Middleware for parsing JSON and URL-encoded data
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,"public")))
app.set("view engine","ejs")

app.use(
  sess({
    secret: "my-secret-key-127287123873",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, //24hours
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (username, password, done) => {
      const admin = await adminModel.findOne({ where: { email: username } });
      const player = await playerModel.findOne({ where: { email: username } });

      if (admin) {
        const result = await bcrypt.compare(password, admin.password);
        if (result) {
            global.adminFirstName = admin.first;
            global.adminLastName = admin.last;
            global.adminEmail=admin.email;
          return done(null, { user: admin, type: 'admin' });
        } else {
          return done(null, false, { message: "Invalid password" });
        }
      }
      else if (player) {
        const result = await bcrypt.compare(password, player.password);
        if (result) {
          // User is a Player
          global.userFullname = player.fullname;
          global.userEmail=player.email;
          return done(null, { user: player, type: 'player' });
        } else {
          return done(null, false, { message: "Invalid password" });
        }
      } 
      else {
        return done(null, false, { message: "User not found" });
      }
    },
  ),
);

passport.serializeUser((userObject, done) => {
  const { user, type } = userObject;
  console.log(`serializing ${type}`, user.id);
  done(null, { id: user.id, type });
});


passport.deserializeUser((serializedUser, done) => {
  const { id, type } = serializedUser;

  if (type === 'admin') {
    adminModel.findByPk(id)
      .then((user) => {
        done(null,  user );
      })
      .catch((error) => {
        done(error, null);
      });
  } else if (type === 'player') {
    playerModel.findByPk(id)
      .then((user) => {
        done(null,  user );
      })
      .catch((error) => {
        done(error, null);
      });
  } else {
    done(null, false, { message: "Invalid user type during deserialization" });
  }
});


passport.serializeUser((user, done) => {
  console.log("serializing user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  playerModel.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});
app.get("/",(request,response) => {
  response.render("main");
})

app.post('/create-player', async (req, res) => {
  try {
    // create account for player 
    const { first, last, email, password} = req.body;
    console.log(first,last,email,typeof password)

    if (!first|| !last|| !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    } 
    const firstName=first
    const lastName=last
    const hashedPwd = await bcrypt.hash(password, saltRounds);
    const newPlayers = await playerModel.create({
      first:firstName,   
      last:lastName,
      email:email,
      password: hashedPwd,
      fullname:firstName+lastName
   });
    console.log(newPlayers)
    res.redirect("/login")
    // req.login(newPlayer, (err) => {
    //   if (err) {
    //     console.log(err);
    //   }
    //   res.redirect("/player");
    // });
  } catch (error) {
    console.error('Error creating Player:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// FOR ADMIN CREATE ACCOUNT 
app.post('/create-players', async (req, res) => {
  try {
    const { first, last, email, password} = req.body;
    // console.log(req.body)
    if (!first|| !last|| !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const firstName=first
    const lastName=last
    const hashedPwd = await bcrypt.hash(password, saltRounds);
      const newPlayer = await adminModel.create({
      first:firstName,
      last:lastName,
      email:email,
      password: hashedPwd,
      // fullname:firstName+lastName
    });
    // console.log(newPlayer)
    res.redirect("/login")
    // req.login(newPlayer, (err) => {
    //   if (err) {
    //     console.log(err);
    //   }
    //   res.redirect("/player");
    // });
  } catch (error) {
    console.error('Error creating Player:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// section player

app.post(
  "/sectionPlayer",
  passport.authenticate("local", {
    failureRedirect: "/login",
  }),
  connectEnsureLogin.ensureLoggedIn(),
  (request, response) => {
    response.redirect("/user");
  }
);

app.post(
  "/sectionAdmin",
  passport.authenticate("local", {
    failureRedirect: "/login",
  }),
  connectEnsureLogin.ensureLoggedIn(),
  (request, response) => {
    response.redirect(`/admin`);
  }
);

app.get("/signup", (request, response) => {
  response.render("signup");
});
app.get("/sigupadmin", (request, response) => {
  response.render("sigupadmin");
});
app.get("/forgotuser", (request, response) => {
  response.render("forgotuser");
});
app.get("/forgotadmin", (request, response) => {
  response.render("forgotadmin");
});
app.get("/login",async (request, response) => {
  const ad = await adminModel.findAll();
  const us=await playerModel.findAll();
  response.render("login",{ad,us});
});

app.post('/forgotad', async (req, res) => {
  try {
    // create account for admin
    const { first, last, email, password } = req.body;

    if (!first || !last || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const firstName = first;
    const lastName = last;
    const hashedPwd = await bcrypt.hash(password, saltRounds);

    // Assuming your model is named adminModel
    const existingAdmin = await adminModel.findOne({
      where: {
        first: firstName,
        last: lastName,
        email: email,
      },
    });

    if (existingAdmin) {
      // If the admin exists, update the password
      await existingAdmin.update({
        password: hashedPwd,
      });
      res.redirect("/login");
    } else {
      res.status(404).json({ error: 'Admin not found.' });
    }
  } catch (error) {
    console.error('Error updating password:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/forgot', async (req, res) => {
  try {
    // create account for player
    const { first, last, email, password } = req.body;

    if (!first || !last || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const firstName = first;
    const lastName = last;
    const hashedPwd = await bcrypt.hash(password, saltRounds);
    const existingPlayer = await playerModel.findOne({
      where: {
        first: firstName,
        last: lastName,
        email: email,
      },
    });

    if (existingPlayer) {
      // If the player exists, update the password
      await existingPlayer.update({
        password: hashedPwd,
      });
      res.redirect("/login");
    } else {
      res.status(404).json({ error: 'Player not found.' });
    }
  } catch (error) {
    console.error('Error updating password:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/signout", (request, response, next) => {
  request.logout((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/");
  });
});
app.get('/admin', async (req, res) => {
  try {
    const adminName = global.adminFirstName+global.adminLastName;
    const adminEmail=global.adminEmail
    console.log("Email :",adminEmail,"Name",adminName)
    // if (adminEmail==undefined || adminName==undefined) {
    //   res.redirect('login');
    // }
    const sportsList = await sports.findAll();
    const matchesList = await matches.findAll();
    const sessionData = await session.findAll();
    // const session = await session.findAll();
    // const adminName = global.adminFirstName+global.adminLastName;
    // const adminEmail=global.adminEmail
    res.render('admin', { sports: sportsList, matches: matchesList, sessionData,adminName,adminEmail});
    } catch (error) {
    console.error(error);
    return res.status(422).json(error);
  }
});
app.get('/user', async (req, res) => {
  try {
    const adminName = global.userFullname;
    const adminEmail=global.userEmail
    console.log(adminEmail,adminName)
    // console.log(userName,"email:",userEmail)
    if (adminEmail===undefined || adminName===undefined) {
      res.redirect('login');
    }
    const sportsList = await sports.findAll();
    const matchesList = await matches.findAll();
    const sessionData = await session.findAll();
    res.render('user', { sports: sportsList, matches: matchesList, sessionData,adminName,adminEmail});
    } catch (error) {
    console.error(error);
    return res.status(422).json(error);
  }
});

app.get('/t',async(req,res)=>{
  try {
    const sportsList = await sports.findAll();
    const matchesList = await matches.findAll();
    const sessionData = await session.findAll();
    res.render('a', { sports: sportsList, matches: matchesList, sessionData});
    } catch (error) {
    console.error(error);
    return res.status(422).json(error);
  }
})

app.post('/createsport',async(req,res)=>{
  const { sport, admin } = req.body;
  try {
    const newsport = await sports.create({
      // await sports.create({
      sport: sport,
      admin: admin
    });
    console.log(newsport);
     } catch (error) {
    console.error(error);
    return res.status(422).json(error);
  } 
})

app.post('/creatematch', async (req, res) => {
  const { sport, admin, date, venue, match,teamsize,timein,timeout } = req.body;
  console.log(sport,timeout,typeof timein);
  // If deleteMatch is not selected, proceed with creating a new match
  try {
    const newMatch = await matches.create({
      sport: sport,
      admin: admin,
      date: date,
      venue: venue,
      match: match,
      teamsize:teamsize,
      timein:timein,
      timeout:timeout
    });
    const adminmail=global.adminEmail
    const usermail=global.userEmail
    console.log(adminmail,usermail)
    if(usermail==undefined){
      res.redirect('admin');
    }
    if(adminmail==undefined){
      res.redirect('user')
    }
  } catch (error) {
    console.error(error);
    return res.status(422).json(error);
  }
});

// for admin delete matches 
app.post('/deletematchforms', async (req, res) => {
  try {
    const deleteMatches = req.body.deleteMatch;
    const reasons = req.body.reason;
    console.log(deleteMatches, reasons);

    // Assuming deleteMatches and reasons are arrays of the same length
    let i = -1;
    for (let j = 0; j < reasons.length; j++) {
      if (reasons[j] !== '') {
        i = j;
        break;
      }
    }

    if (i !== -1) {
      console.log('Index of the first non-empty string:', i);
      const [sport, match] = deleteMatches.split(':');
      console.log("sport", sport, match);

      const matchRecord = await matches.findOne({
        where: {
          sport: sport,
          match: match,
        },
      });

      if (matchRecord) {
        // Update the 'reason' column
        await matchRecord.update({
          reason: reasons[i],
        });
        console.log(`${deleteMatches[i]} updated successfully in matches.`);
      } else {
        console.log(`${deleteMatches[i]} not found in matches.`);
      }

      // Handle the case where the record doesn't exist
      const matchRecords = await session.findAll({
        where: {
          sport: sport,
          match: match,
        },
      });
      
      if (matchRecords && matchRecords.length > 0) {
        // Update the 'reason' column for each record
        for (const record of matchRecords) {
          await record.update({
            reason: reasons[i],
          });
        }
        console.log(`Reason for ${deleteMatches[i]} updated successfully in session.`);
      }
      else {
      console.log('No data found.');
    }
  }
  const adminmail=global.adminEmail
  const usermail=global.userEmail
  if(usermail==undefined){
    res.redirect('admin');
  }
  if(adminmail==undefined){
    res.redirect('user')
  }
  } catch (error) {
    console.error(error);
    return res.status(422).json(error);
  }
});

 




app.post('/deletematch', async (req, res) => {
  try {
    const deleteMatches = req.body.deleteMatch;
    const reasons = req.body.reason;
    console.log(deleteMatches, reasons);
    let i = -1;
    for (let j = 0; j < reasons.length; j++) {
      if (reasons[j] !== '') {
        i = j;
        break;
      }
    }

    if (i !== -1) {
      console.log('Index of the first non-empty string:', i);
      const [sport, match] = deleteMatches[i].split(':');
      console.log("sport", sport, match);

      const matchRecord = await matches.findOne({
        where: {
          sport: sport,
          match: match,
        },
      });

      if (matchRecord) {
        // Update the 'reason' column
        await matchRecord.update({
          reason: reasons[i],
        });
        console.log(`${deleteMatches[i]} updated successfully in matches.`);
      } else {
        console.log(`${deleteMatches[i]} not found in matches.`);
      }

      // Handle the case where the record doesn't exist
      const matchRecords = await session.findAll({
        where: {
          sport: sport,
          match: match,
        },
      });
      
      if (matchRecords && matchRecords.length > 0) {
        // Update the 'reason' column for each record
        for (const record of matchRecords) {
          await record.update({
            reason: reasons[i],
          });
        }
        console.log(`Reason for ${deleteMatches[i]} updated successfully in session.`);
      }
      else {
      console.log('No data found.');
    }
  }
    res.redirect('user');
  } catch (error) {
    console.error(error);
    return res.status(422).json(error);
  }
});
app.post('/joinmatch', async (req, res) => {
  const { admin, selectedInfo} = req.body;
  console.log("print this ",selectedInfo)
  
  // Split the selectedInfo into match and sport
  const [selectedMatch, selectedSport,date,timein,timeout] = selectedInfo.split('#');
  console.log(selectedSport,date,admin,timein,timeout)

  try {
      // Create a new match in the 'session' table
      const newMatch1 = await session.create({
        sport: selectedSport,
        admin: admin,
        match: selectedMatch,
      });
    const adminmail=global.adminEmail
    const usermail=global.userEmail
    if(usermail==undefined){
      res.redirect('admin');
    }
    if(adminmail==undefined){
      res.redirect('user')
    }
    }
   catch (error) {
    console.error(error);
    return res.status(422).json(error);
  }
});



app.listen(3000, () => {
  console.log('Server is running on port 3000');
});




// app.post('/crt',function(req,res){
//     console.log("/a route ",req.body)
// })
// app.put('/crt/:match',function(req,res){
//     console.log("update match",req.params.id)
// })
// app.delete("/crt/:match",function(req,res){
//     console.log("deleted",req.params.delete)
// })