require('dotenv').config({path:__dirname + '/.env'});

const massive = require('massive');

massive(process.env.DB_CONNECTION_STRING, { scripts:__dirname + '/db'}).then( db => {
    return db.setup.create_users_table();
}).then(() => {
    console.log('Table created succesfully');
}).catch( err => {
    console.warn(err);
})