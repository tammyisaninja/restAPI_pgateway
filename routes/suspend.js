const express = require('express');

const router = express.Router();

// suspend
router.post('/', (req,res) => {
    const db = req.db;
    const student = req.body;
    let sql = "UPDATE student SET suspended = ? WHERE emailstudent = ?";
    db.query(sql,[1,student.student], (err,result)=>{
        if(err) {
            console.log(err.stack);
        }
        else {
            res.status(204).json({});
        }
    })
})

//unsuspend for testing 
router.post('/undo', (req,res)=>{
    const db = req.db;
    const student = req.body;
    let sql = "UPDATE student SET suspended = ? WHERE emailstudent = ?";
    db.query(sql,[0,student.student], (err,result)=>{
        if(err) {
            console.log(err.stack);
        }
        else {
            res.status(204).json({});
        }
    })
})

module.exports = router;