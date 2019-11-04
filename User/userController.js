const monk = require('monk');
const nconf = require("nconf");
const MONGODB_URL = nconf.env().file(`${__dirname}/../config.json`).get("MONGODB_URL");
const db = monk(MONGODB_URL);
const users = db.get('users');

function getUser(uid){
    return users.find({"uid": uid})
}

function addUser(user){
    return users.insert({"uid": user.uid, "firstname": user.firstName, "lastname": user.lastName, "emailaddress": user.emailaddress});
}

function setAdmin(uid){
    return users.update(
        { uid: uid},
        { $set: {isAdmin: true}}
    )
}

function removeAdmin(admin_id){
    return users.update(
        { uid: admin_id},
        { $set: {isAdmin: false}}
    )
}

module.exports = {
    getUser,
    addUser,
    setAdmin,
    removeAdmin
};