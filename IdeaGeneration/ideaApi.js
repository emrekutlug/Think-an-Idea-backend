const express = require('express');
const router = express.Router();
const ideas = require('./ideaController.js');
const WebAppStrategy = require('../index').WebAppStrategy;

router.use('/', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

router.get("/allIdeas", (req,res) =>{
    ideas.getAll().then((ideas) => {
        res.status(200).json(ideas);
    }).catch((error) => {
        res.status(500).json(error);
    });
});

router.get("/myIdeas", (req,res) => {
    ideas.getCreatorIdeas(req.query.id).then((ideas) => {
        res.status(200).json(ideas);
    }).catch((error) => {
        res.status(500).json(error);
    });
});

router.get("/iMember", (req,res) => {
    ideas.getParticipatingIdeas(req.query.id).then((ideas) => {
        res.status(200).json(ideas);
    }).catch((error) => {
        res.status(500).json(error);
    });
});

router.get("/iLead", (req,res) => {
    ideas.getLeadingIdeas(req.query.id).then((ideas) => {
        res.status(200).json(ideas);
    }).catch((error) => {
        res.status(500).json(error);
    });
});

router.post("/ideas", (req, res) => {
    ideas.create(req.body).then((idea) => {
      res.status(200).json(idea);
    }).catch((error) => {
      res.status(500).json(error);
    });
});

router.delete("/ideas", (req, res) => {
    ideas.deleteIdea(req.query.id).then((idea) => {
        res.status(200).json("200 Returned idea is "+ idea + "successfully deleted");
    }).catch((error) => {
        res.status(500).json(error + "could not be deleted");
    });
});

router.put("/updateIdea", (req, res) => {
    ideas.updateEdit(req.body.id, req.body.title, req.body.body, req.body.isActive).then((idea) => {
        res.status(200).json("200 Returned idea is "+ idea + "successfully updated");
    }).catch((error) => {
        res.status(500).json(error + "could not be updated");
    });
});

router.put("/becomeProjectMember", (req, res) => {
    ideas.becomeProjectMember(req.body.id, req.body.member).then((idea) => {
        res.status(200).json("200 Returned idea is "+ idea + "successfully updated");
    }).catch((error) => {
        res.status(500).json(error + "could not be updated");
    });
});

router.put("/leaveProjectMembership", (req, res) => {
    ideas.leaveProjectMembership(req.body.id, req.body.member).then((idea) => {
        res.status(200).json("200 Returned idea is "+ idea + "successfully updated");
    }).catch((error) => {
        res.status(500).json(error + "could not be updated");
    });
});

router.put("/becomeProjectLeader", (req, res) => {
    ideas.becomeProjectLeader(req.body.id, req.body.leader).then((idea) => {
        res.status(200).json("200 Returned idea is "+ idea + "successfully updated");
    }).catch((error) => {
        res.status(500).json(error + "could not be deleted");
    });
});

router.put("/leaveProjectLeadership", (req, res) => {
    ideas.leaveProjectLeadership(req.body.id).then((idea) => {
        res.status(200).json("200 Returned idea is "+ idea + "successfully updated");
    }).catch((error) => {
        res.status(500).json(error + "could not be updated");
    });
});

router.put("/deactivateIdea", (req, res) => {
    ideas.deactivateIdea(req.body.id, req.body.reason).then((idea) => {
        res.status(200).json("200 Returned idea is "+ idea + "successfully updated");
    }).catch((error) => {
        res.status(500).json(error + "could not be updated");
    });
});

module.exports = router;