const express = require('express');
const router = express.Router();
const ideas = require('./ideaController.js');
const WebAppStrategy = require('./index').WebAppStrategy;

router.use('/', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

router.get("/allIdeas", (req,res) =>{
    console.log("request body is here " + JSON.stringify(req.body));
    console.log(req.user);
    ideas.getAll().then((ideas) => {
        res.status(200).json(ideas);
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

router.delete("/ideas", (req, res) => {
    console.log("request body is here " + JSON.stringify(req.query));
    ideas.deleteIdea(req.query.id).then((idea) => {
        res.status(200).json("200 Returned idea is "+ idea + "successfully deleted");
    }).catch((error) => {
        res.status(500).json(error + "could not be deleted");
    });
});

router.put("/updateIdea", (req, res) => {
    console.log("request body is here " + JSON.stringify(req.body));
    ideas.updateEdit(req.body.id, req.body.title, req.body.body, req.body.isActive).then((idea) => {
        res.status(200).json("200 Returned idea is "+ idea + "successfully updated");
    }).catch((error) => {
        res.status(500).json(error + "could not be updated");
    });
});

router.put("/becomeProjectMember", (req, res) => {
    console.log("request body is here " + JSON.stringify(req.body));
    ideas.becomeProjectMember(req.body.id, req.body.member).then((idea) => {
        res.status(200).json("200 Returned idea is "+ idea + "successfully updated");
    }).catch((error) => {
        res.status(500).json(error + "could not be updated");
    });
});

router.put("/leaveProjectMembership", (req, res) => {
    console.log("request body is here " + JSON.stringify(req.body));
    ideas.leaveProjectMembership(req.body.id, req.body.member).then((idea) => {
        res.status(200).json("200 Returned idea is "+ idea + "successfully updated");
    }).catch((error) => {
        res.status(500).json(error + "could not be updated");
    });
});

router.put("/becomeProjectLeader", (req, res) => {
    console.log("request body is here " + JSON.stringify(req.body));
    ideas.becomeProjectLeader(req.body.id, req.body.leader).then((idea) => {
        res.status(200).json("200 Returned idea is "+ idea + "successfully updated");
    }).catch((error) => {
        res.status(500).json(error + "could not be deleted");
    });
});

router.put("/leaveProjectLeadership", (req, res) => {
    console.log("request body is here " + JSON.stringify(req.body));
    ideas.leaveProjectLeadership(req.body.id).then((idea) => {
        res.status(200).json("200 Returned idea is "+ idea + "successfully updated");
    }).catch((error) => {
        res.status(500).json(error + "could not be updated");
    });
});

router.put("/deactivateIdea", (req, res) => {
    console.log("request body is here " + JSON.stringify(req.body));
    ideas.deactivateIdea(req.body.id, req.body.reason).then((idea) => {
        res.status(200).json("200 Returned idea is "+ idea + "successfully updated");
    }).catch((error) => {
        res.status(500).json(error + "could not be updated");
    });
});

module.exports = router;