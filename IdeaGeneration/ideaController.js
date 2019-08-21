const monk = require('monk');
const MONGODB_URL = "mongodb://admin:CMRMZIXTKGBKQYBG@portal-ssl730-43.bmix-dal-yp-d6975d40-c401-49cc-a500-ad4b98d432d4.421838044.composedb.com:16890,portal-ssl714-42.bmix-dal-yp-d6975d40-c401-49cc-a500-ad4b98d432d4.421838044.composedb.com:16890/mydb?authSource=admin&ssl=true";
const db = monk(MONGODB_URL);
const ideas = db.get('ideas');

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

function getAll(){
    return ideas.find({}, {_id: 1, title: 1, body: 1, creator: 1, leader: 1, members: 1, date: 1, isActive: 1, reason: 1})
    //const ideas = ideas.find({});
    //return ideas.map(i => ({ id: i._id, title: i.title ..}))
}

function getCreatorIdeas(creatorID){
    return ideas.find({"creator.creatorID": creatorID }, {_id: 1, title: 1, body: 1, creator: 1, leader: 1, members: 1, date: 1, isActive: 1, reason: 1} );
}

function getParticipatingIdeas(memberID){
    return ideas.find({"members.memberID": memberID}, {_id: 1, title: 1, body: 1, creator: 1, leader: 1, members: 1, date: 1, isActive: 1, reason: 1});
}

function getLeadingIdeas(leaderID){
    return ideas.find({"leader.leaderID": leaderID}, {_id: 1, title: 1, body: 1, creator: 1, leader: 1, members: 1, date: 1, isActive: 1, reason: 1});
}

function create(idea){
    return ideas.insert(idea);
}

function deleteIdea(idea_id){
    return ideas.remove({"_id" : idea_id});
}

function updateEdit(idea_id, title ,body, isActive){
    return ideas.update(
        { _id: idea_id},
        { $set: {"title": title,"body": body, "isActive": isActive}}
    )
}

function becomeProjectMember(idea_id, member){
    return ideas.update({_id : idea_id}, { $push: {members: member}})
}

function leaveProjectMembership(idea_id, member){
    return ideas.update({_id : idea_id}, { $pull: {members: member}})
}

function becomeProjectLeader(idea_id, leader){
    return ideas.update({_id : idea_id}, { $set: {leader: leader}})
}

function leaveProjectLeadership(idea_id){
    return ideas.update({_id : idea_id}, { $set: {leader: null}})
}

function deactivateIdea(idea_id, reason){
    return ideas.update({_id : idea_id}, { $set: {isActive: false, reason:reason}, } )
}

module.exports = {
    getAll,
    getCreatorIdeas,
    getParticipatingIdeas,
    getLeadingIdeas,
    create,
    deleteIdea,
    becomeProjectMember,
    leaveProjectMembership,
    becomeProjectLeader,
    leaveProjectLeadership,
    deactivateIdea,
    updateEdit
}
