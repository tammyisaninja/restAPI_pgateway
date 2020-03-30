const express = require('express');

const router = express.Router();

router.post('/', (req,res) => {
    const db = req.db;
    const teacher = req.body.teacher;
    const students = req.body.students;
    if(teacher && students) {
        console.log(teacher);
        console.log(students);
    }else {
        return res.status(404).json({
            message: 'No valid entry found for provided ID'
        });
    }

    promises = []
    // save students into the database
    function get_teacher(teacher) {
        return new Promise(function(resolve,reject){
            let sql = "INSERT INTO teacher(email) VALUES(?)";
            db.query(sql, teacher, (err, result) => {
                if(err) {
                    // for duplicate keys
                    if(err.errno === 1062) {
                        let tempsql = "SELECT idteacher FROM teacher WHERE email= ?";
                        db.query(tempsql,teacher,(err,result) => {
                            if (err) throw err;
                            return resolve(result[0].idteacher);
                        })
                    }
                    else {
                        throw err; 
                    } 
                } else {  
                    resolve(result.insertId); 
                }
            });
        })
    } 
    promises.push(get_teacher(teacher));
    /*function get_student(students) {
        let studentids = [];
        return new Promise((resolve, reject) => {
            for(var i=0; i<students.length;i++) {
                tempstudent = students[i];
                let tempsql = "SELECT idstudent FROM student WHERE emailstudent= ?";
                db.query(tempsql,tempstudent,(err,res) => {
                    if(res>0) {
                        studentids.push(res[0].idstudent);
                    } else {
                        let sql2 = "INSERT INTO student(emailstudent) VALUES(?)";
                        db.query(sql2, tempstudent, (err,result) => {
                            if(err) { throw err } 
                            else {
                                studentids.push(result.insertId);
                                console.log(result.insertId);
                            }
                        })
                    }
                })
                if(i===students.length -1) {
                    console.log(studentids);
                    resolve(studentids);
                }
            }
        })
    }*/

    for(var i=0; i<students.length;i++) {
        let tempstudent = students[i];
        promises.push(new Promise((resolve,reject)=> {
            let tempsql = "SELECT idstudent FROM student WHERE emailstudent= ?";
            db.query(tempsql,tempstudent,(err,res) => {
                if (err) {
                    console.error("err connecting" + err.stack);
                }
                else {
                    //console.log("testing 2", res);
                    // match not found insert 
                    if(res.length >0) {
                        //console.log("testing 1", res);
                        resolve(res[0].idstudent); //push old id into the array
                    }
                    // match found, dont insert new student into database 
                    else {
                        let sql2 = "INSERT INTO student(emailstudent) VALUES(?)";
                        db.query(sql2, tempstudent, (err,result) => {
                            if(err) { 
                                console.error("err connecting" + err.stack);
                            } 
                            else {
                                let num = result.insertId;
                                resolve(num);
                            }
                        })
                    }
                }
            })
        }))
    }

    Promise.all(promises).then(results => {
        let sql = "INSERT INTO teacher_student(teacher_idteacher, student_idstudent) VALUES(?,?)";
        for(var i=1; i<=students.length;i++) {
            //console.log(results);
            console.log(results[0],results[i]);
            db.query(sql,[results[0],results[i]], (err, result) => {
                if (err) {
                    if(err.code === 'ER_DUP_ENTRY') {
                        console.log("err"+err.stack);
                        /*return res.status(500).json({
                            message: "Teacher, student pairing already created"
                        })*/
                    };
                } 
            })
        }
        //console.log("test", results);
    })
    res.status(204).json({});
}); 

module.exports = router;