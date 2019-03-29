require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const session = require('express-session');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const massive = require('massive');
const bcrypt = require('bcrypt');

const app = express();

massive(process.env.DB_CONNECTION_STRING, { scripts: __dirname + '/db' }).then(db => {
    console.log('Database is connected');
    app.set('db', db);
}).catch(err => {
    console.warn(err);
})

passport.use('Login', new LocalStrategy({
    usernameField: 'email',
}, (email, password, done) => {
    if (!email || !password) {
        return done({ message: 'Email and password are required' })
    }

    const db = app.get('db');

    db.Users.find({ email }).then( userResults => {
        if( userResults.lenght == 0 ) {
            done({message:'Username or password is invalid'});
        }

        const user = userResults[0];

        const storedPassword = user.password;

        if( storedPassword != password) {
            return done(JSON.stringify({message:'Username or password is invalid'}));
        }

        delete user.password;

        done(null, user);
    }).catch(err => {
        console.warn(err);
        done(JSON.stringify({message: 'Unkown error occurred. Please try again.'}));
    });

}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    done(null, id);
});

app.use(express.json());

app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: process.env.SESSION_SECRET,
}
));

app.use(passport.initialize());

app.use(passport.session());

//Endpoints
app.post('/auth/login', passport.authenticate('Login'), (req, res) => {
    return res.send({message: 'CONGRATS!!!'})
})


const port = 3000;
app.listen(port, () => { console.log(`Server listening on port ${port}`); });