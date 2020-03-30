const express = require('express');

const router = express.Router();

router.get('/', (req,res) => {
    const db = req.db;
    let teacherarr = req.query["teacher"];
    var checkNumTeacher = !Array.isArray(teacherarr);  // to determine the num of arguments
    //console.log("the check is ", checkNumTeacher);
    
    // single input
    if(checkNumTeacher) {
        teacherarr = [teacherarr];
    } 

    promises = [];
    //console.log(teacherarr);
    for(var i=0;i<teacherarr.length;i++) {
        promises.push(new Promise((resolve, reject)=> {
            get_val(teacherarr[i])
            .then(function(result) {
                get_next_val(result[0].idteacher)
                .then(result => {
                    resolve(result);
                })
            })
        }))
    }

    var overall = [];
    var promises2 = [];
    Promise.all(promises).then(results=>{
        // if only one variable, initialize the overall array to be student ids of the first teacher
        if(checkNumTeacher) {
            console.log(results);
            overall = results[0];
        }
        // check for overlaps between this value and the next value
        var temp = results[0];
        //console.log(results);
        for(var i=0; i<results.length-1;i++) {
            overall = temp.filter(value => {
                console.log("tryagain", value.student_idstudent);
                return results[i+1].some(b=> {
                    console.log("trytryagain", b.student_idstudent===value.student_idstudent);
                    return b.student_idstudent===value.student_idstudent
                })
            })
            temp = overall;
            //console.log("overall", overall, "temp", temp);
        }    
        console.log("overall", overall)
        return overall;
    }).then(results => {
        // get the students emails based on their ids 
        console.log("passed in results", results);
        let sql = "SELECT emailstudent FROM student WHERE idstudent= ? ";
        for(var i=0; i<results.length;i++) {
            promises2.push(new Promise((resolve)=> {
                //console.log("results0", results.length);
                db.query(sql,results[i].student_idstudent, (err, res)=> {
                    if (err) {
                        console.error("err connecting " + err.stack);
                    } 
                    console.log("WHAT",res, res[0].emailstudent);
                    resolve(res[0].emailstudent);
                })
            }))
        }
        return promises2;
    }).then(result => {
        // print their emails
        Promise.all(result).then(results=>{
            console.log("hello2",results);
            res.status(200).json({
                students: results
            })
        })
    })
    
    //function to select the teacher id given their email
    function get_val(teacherarr) {
        //console.log(teacherarr);
        return new Promise((resolve,reject)=>{
            db.query("SELECT idteacher FROM teacher WHERE email= ? ", teacherarr , (err,result) => {
                if(err) { console.error("err connecting " + err.stack);}
                //console.log("the prev", result);
                resolve(result);
            })
        })
    }

    // function to select the students that the teachers are teaching based on id
    function get_next_val(teacherid) {
        return new Promise((resolve,reject)=> {
            db.query("SELECT student_idstudent FROM teacher_student WHERE teacher_idteacher= ? ",teacherid, (err,result)=>{
                if(err) {console.error("err connecting " + err.stack);}
                //console.log("the next", result);
                resolve(result);
            })
        })
    }
})

module.exports = router;