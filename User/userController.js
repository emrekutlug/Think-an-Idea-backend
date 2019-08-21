const monk = require('monk');
const MONGODB_URL = "mongodb://admin:CMRMZIXTKGBKQYBG@portal-ssl730-43.bmix-dal-yp-d6975d40-c401-49cc-a500-ad4b98d432d4.421838044.composedb.com:16890,portal-ssl714-42.bmix-dal-yp-d6975d40-c401-49cc-a500-ad4b98d432d4.421838044.composedb.com:16890/mydb?authSource=admin&ssl=true";
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