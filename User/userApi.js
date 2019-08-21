const express = require('express');
const router = express.Router();
const users = require('./userController.js');

router.use('/', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

router.post("/addUser", (req, res) => {
    users.getUser(req.body.uid).then((user) => {
        if (user.length === 0) {
            users.addUser(req.body);
            res.status(200).json({result: `User added with uid ${req.body.uid}`});
        }
        res.status(200).json({user: user});
    }).catch((error) => {
        res.status(500).json(error);
    });
});

router.get("/getUser", (req, res) => {
    users.getUser(req.query.uid).then((user) => {
        res.status(200).json({result: user});
    }).catch((error) => {
        res.status(500).json(error);
    });
});

router.post("/setAdmin",  (req, res) => {
    users.getUser(req.body.uid).then(async (user) => {
        if (user.length === 0) {
            return res.status(500).json({result:"No such user"});
        }
        user = await users.setAdmin(req.body.uid);
        res.status(200).json({user: user});
    }).catch((error) => {
        res.status(500).json(error);
    });
});

router.post("/removeAdmin", (req,res) =>{
    users.removeAdmin(req.body.uid).then(() => {
        res.status(200).json({result:"ok"});
    }).catch((error) => {
        res.status(500).json(error);
    });
});


module.exports = router;