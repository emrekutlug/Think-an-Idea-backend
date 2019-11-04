const monk = require('monk');
const nconf = require("nconf");
const MONGODB_URL = nconf.env().file(`${__dirname}/../config.json`).get("MONGODB_URL");
const db = monk(MONGODB_URL);
const voteideas = db.get('ideas');

function deleteAll() {
    return voteideas.remove({});
}

function getAll(){
    return voteideas.find({});
}

function getCreatorIdeas(creatorID){
    return voteideas.find({"creator.id": creatorID } );
}

function getParticipatingIdeas(memberID){
    return voteideas.find({members: { id : memberID } } );
}

function getLeadingIdeas(leaderID){
    return voteideas.find({leader: { id : leaderID } } );
}

function create(idea){
    return voteideas.insert(idea);
}

function deleteIdea(idea_id){
    return voteideas.remove({"_id" : idea_id});
}

function updateIdea(idea_id, idea){
    return voteideas.update({"_id" : idea_id}, idea);
}

module.exports = {
    getAll,
    getCreatorIdeas,
    getParticipatingIdeas,
    getLeadingIdeas,
    create,
    deleteIdea,
    updateIdea,
    deleteAll
}
