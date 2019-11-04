const monk = require('monk');
const nconf = require("nconf");
const MONGODB_URL = nconf.env().file(`${__dirname}/../config.json`).get("MONGODB_URL");
const db = monk(MONGODB_URL);
const ideas = db.get('ideas');

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
