const express = require('express');
const router = express.Router();
const async = require('async');

router.post('/', (req,res)=> {
    const db = req.db;
    const teacher = req.body.teacher;
    const notif = req.body.notification;
    var myRegexp = /(?<=@)([a-zA-Z0-9._-])+@([a-zA-Z0-9.-])+\.([a-zA-Z]{2,4})/g;
    // Split the string  
    var notifPart = notif.match(myRegexp);
    //console.log("the expression is", notifPart,notif,teacher);
    
    // Get the students mentioned in the post and check if they are suspended
    var promises = [];
    if(notifPart) {
        for(var i=0; i<notifPart.length; i++) {
            //console.log("notif", typeof notifPart[i]);
            promises.push(new Promise((resolve,reject)=> {
                let sql = "SELECT emailstudent FROM student WHERE student.emailstudent = ? AND student.suspended = 0";
                db.query(sql, notifPart[i],(err,result)=>{
                    if(err) { console.log(err); }
                    if(typeof result[0] === 'undefined') {
                        // dont resolve anything if there's no match
                        resolve(0);
                    } else {
                        //console.log(result[0].emailstudent);
                        resolve(result[0].emailstudent);
                    }
                })
            }))
        }
    }
    let getIdFromTeacherPromise = getIdFromTeacher(teacher);
    var promises2 = [];
    var finalArray=[];
    Promise.all(promises).then(result=> {
        finalArray=result;
        getIdFromTeacherPromise.then(result=>{
            getStudentFromTeacher(result).then(result => {  // get student ids under that teacher
                for(var i=0; i<result.length;i++) {
                    promises2.push(new Promise((resolve => {
                        let sql = "SELECT emailstudent FROM student WHERE idstudent = ? ";
                        db.query(sql, result[i].student_idstudent,(err,res)=> {
                            if(err) {console.log(err);}
                            //console.log("student email", res[0].emailstudent);
                            resolve(res[0].emailstudent);
                        })
                    })))  
                }
                Promise.all(promises2,finalArray).then(result=>{
                    let finalresponse = result.concat(finalArray);
                    const finalresult = finalresponse.filter(response=>response !=0);
                    res.status(200).json({
                        students: finalresult
                    })
    
                })
            })
        })
    })
    
    // Get the id of that teacher 
    function getIdFromTeacher(teacher) {
        return new Promise((resolve)=>{
            let sqlTeacherId = "SELECT idteacher FROM teacher WHERE email = ?";
            db.query(sqlTeacherId,teacher, (err,result)=> {
                if(err) { console.log(err)}
                //console.log("the idea is " ,result[0].idteacher);
                resolve(result[0].idteacher);
            })
        })
    }

    // Get the students of that teacher that arent suspended
    function getStudentFromTeacher(teacher) {
        return new Promise((resolve)=>{
            let sql = "SELECT student_idstudent FROM teacher_student INNER JOIN student ON student.idstudent = teacher_student.student_idstudent\
             WHERE teacher_idteacher = ? AND student.suspended = 0";
            db.query(sql,teacher, (err,result)=> {
                if(err) { console.log(err)}
                //console.log(result);
                resolve(result);
            })
        })
    }
})

module.exports = router