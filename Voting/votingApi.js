const express = require('express');
const router = express.Router();
const ideas = require('./votingController.js');

router.get("/allIdeas", (req,res) =>{
    console.log("request body is here " + JSON.stringify(req.body));
    ideas.getAll().then((ideas) => {
        res.status(200).json(ideas);
    }).catch((error) => {
        res.status(500).json(error);
    });
});

router.get("/deleteAll", (req,res) =>{
    ideas.deleteAll().then(() => {
        res.status(200).json({result:"ok"});
    }).catch((error) => {
        res.status(500).json(error);
    });
});

router.get("/myIdeas", (req,res) => {
    console.log("request query is here " + JSON.stringify(req.query));
    ideas.getCreatorIdeas(req.query.id).then((ideas) => {
        res.status(200).json(ideas);
    }).catch((error) => {
        res.status(500).json(error);
    });
});

router.get("/iMember", (req,res) => {
    console.log("request query is here " + JSON.stringify(req.query));
    ideas.getParticipatingIdeas(req.query.id).then((ideas) => {
        res.status(200).json(ideas);
    }).catch((error) => {
        res.status(500).json(error);
    });
});

router.get("/iLead", (req,res) => {
    console.log("request query is here " + JSON.stringify(req.query));
    ideas.getLeadingIdeas(req.query.id).then((ideas) => {
        res.status(200).json(ideas);
    }).catch((error) => {
        res.status(500).json(error);
    });
});

router.post("/ideas", (req, res) => {
    console.log("request body is here " + JSON.stringify(req.body));
    ideas.create(req.body).then((idea) => {
      res.status(200).json(idea);
    }).catch((error) => {
      res.status(500).json(error);
    });
});

router.post("/voteIdea", (req,res) =>{
    ideas.voteIdea(req.query.id,req.body).then((votedIdea) => {
        res.status(200).json(votedIdea);
    }).catch((error) => {
        res.status(500).json(error);
    });
});

/*
router.get("/myVote", (req, res) => {
    console.log("request body is here " + JSON.stringify(req.body));
    ideas.create(req.body).then((idea) => {
        res.status(200).json(idea);
    }).catch((error) => {
        res.status(500).json(error);
    });
});
*/
router.put("/ideas", (req, res) => {
    console.log("request body is here " + JSON.stringify(req.body));
    ideas.updateIdea(req.body.id).then((idea) => {
        res.status(200).json("200 Returned idea is "+ idea + "successfully updated");
    }).catch((error) => {
        res.status(500).json(error + "could not be updated");
    });

});

router.delete("/ideas", (req, res) => {
    console.log("request body is here " + JSON.stringify(req.query));
    ideas.deleteIdea(req.query.id).then((idea) => {
        res.status(200).json("200 Returned idea is "+ idea + "successfully deleted");
    }).catch((error) => {
        res.status(500).json(error + "could not be deleted");
    });
});


module.exports = router;
