const express = require('express');
const router = express.Router();

let deadline = null;

router.post("/deadline", (req, res) => {
    deadline = req.body.deadline;
    console.log(deadline);
    res.status(200).json("Deadline updated");
});

router.get("/deadline", (req, res) => {
    let time = getTimeRemaining(deadline)
    res.status(200).json({deadline: time.total})
});

function getTimeRemaining(endtime){
    var t = Date.parse(endtime) - Date.parse(new Date());
    var seconds = Math.floor( (t/1000) % 60 );
    var minutes = Math.floor( (t/1000/60) % 60 );
    var hours = Math.floor( (t/(1000*60*60)) % 24 );
    var days = Math.floor( t/(1000*60*60*24) );
    return {
        'total': t,
        'days': days,
        'hours': hours,
        'minutes': minutes,
        'seconds': seconds
    };
}

module.exports = router;
