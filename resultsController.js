const monk = require('monk');
const MONGODB_URL = "mongodb://admin:CMRMZIXTKGBKQYBG@portal-ssl730-43.bmix-dal-yp-d6975d40-c401-49cc-a500-ad4b98d432d4.421838044.composedb.com:16890,portal-ssl714-42.bmix-dal-yp-d6975d40-c401-49cc-a500-ad4b98d432d4.421838044.composedb.com:16890/mydb?authSource=admin&ssl=true";
const db = monk(MONGODB_URL);
const voteideas = db.get('ideas');

//const Joi = require('joi');
//const collection = db.collection;
// * username - default to anonymous
// * subject
// * message
// * imageURL
// * created

/*
const schema = Joi.object().keys({
    username: Joi.string().alphanum().required(),
    subject: Joi.string().required(),
    message: Joi.string().max(500).required(),
    imageURL: Joi.string().uri({
      scheme: [
        /https?/
      ]
    })
  });
*/
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