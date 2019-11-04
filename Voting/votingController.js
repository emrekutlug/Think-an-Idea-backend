const monk = require('monk');
const nconf = require("nconf");
const MONGODB_URL = nconf.env().file(`${__dirname}/../config.json`).get("MONGODB_URL");
const db = monk(MONGODB_URL);
const voteideas = db.get('ideas');

function getAll(){
    return voteideas.find({});
}

function getCreatorIdeas(creatorID){
    return voteideas.find({"creator.creatorID": creatorID } );
}

function getParticipatingIdeas(memberID){
    return voteideas.find({"members.memberID": memberID  } );
}

function getLeadingIdeas(leaderID){
    return voteideas.find({"leader.leaderID":  leaderID  } );
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

function voteIdea(idea_id,user){
    return currIdea = voteideas.update({"_id": idea_id},{$push: {"votes": {"userId": user.id,"userName": user.name, "timestamp": new Date()} }});
}

function didVote(){

}

module.exports = {
    getAll,
    getCreatorIdeas,
    getParticipatingIdeas,
    getLeadingIdeas,
    create,
    deleteIdea,
    updateIdea,
    voteIdea
};
