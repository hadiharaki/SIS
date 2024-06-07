'use strict';
var http = require('http');
var port = process.env.PORT || 1337;
var express = require('express');
var app = express();
var path = require('path');
var mysql = require('mysql2');
var cookieParser = require('cookie-parser');
var HTMLPath = path.join(__dirname, "html");
var connect = require('./DBconnection');
const fs = require('fs');

app.use('/assets', express.static(path.join(__dirname,"/assets")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());



var usernow;

var adminNow;

app.get('/', (req, res) => {

    res.sendFile(`${HTMLPath}/index.html`);
});


app.get('/signnup.html', (req, res) => {
    res.sendFile(`${HTMLPath}/signnup.html`);
});

app.get('/home.html', (req, res) => {
    res.sendFile(`${HTMLPath}/home.html`);
});

app.get('/admin.html', (req, res) => {
    res.sendFile(`${HTMLPath}/admin.html`);
});

app.post('/infoPost', (req, res) => {
    connect.con.query("SELECT COUNT(*) from users where username=? and password=?", [req.body.username, req.body.passw], function (err, result, fields) {
        if (err) throw err;
        console.log(result);

        if (result[0]['COUNT(*)'] > 0) {
           
            connect.con.query("SELECT idusers FROM users WHERE username = ? AND password = ?", [req.body.username, req.body.passw], function (err, result2, fields) {
               usernow = {
                    idusers: result2[0].idusers,
                    username: req.body.username,
                    password: req.body.passw
                };
                res.cookie("UserData", JSON.stringify(usernow));
                res.json({ info: 'you are successfully logged in' });
            });

        } else  {
            connect.con.query("SELECT COUNT(*) from admins where adminName=? and adminPass=?", [req.body.username, req.body.passw], function (err, result, fields) {
                if (err) throw err;
                console.log(result);
                if (result[0]['COUNT(*)'] > 0) {
                    res.json({ info: 'you are an admin' });
                    connect.con.query("SELECT idadmins FROM admins WHERE adminName = ? AND adminPass = ?", [req.body.username, req.body.passw], function (err, result2, fields) {
                        adminNow = {
                            idadmins: result2[0].idusers,
                            adminName: req.body.username,
                            adminPass: req.body.passw
                        };
                    });
                }
                else {
                    res.json({ info: 'User is not found' });
                }
            }
            );
            
        }
    });
});

app.post('/infos', (req, res) => {
    connect.con.query("INSERT INTO users (username,password) VALUES(?,?)", [req.body.username, req.body.passw], function (err, result, fields) {
        if (err) {
            console.error('Error signing up:', err);
            res.status(500).json({ info: 'Failed to sign up' });
        } else {
            connect.con.query("SELECT idusers FROM users WHERE username = ? AND password = ?", [req.body.username, req.body.passw], function (err, result2, fields) {
                if (err) {
                    console.error('Error fetching user data after signup:', err);
                    res.status(500).json({ info: 'Failed to retrieve user data' });
                } else {
                    const userId = result2[0].idusers;
                    const userData = {
                        idusers: userId,
                        username: req.body.username,
                        password: req.body.passw
                    };
                    res.cookie("UserData", JSON.stringify(userData));
                    res.status(200).json({ info: 'You are successfully signed up' });
                }
            });
        }
    });
});


//app.post('/infos', (req, res) => {

   // connect.con.query("insert into users (username,password) values(?,?)", [req.body.username, req.body.passw], function (err, result, fields) {
     //   if (err) throw err;
        
      //  connect.con.query("SELECT idusers FROM users WHERE username = ? AND password = ?", [req.body.username, req.body.passw], function (err, result2, fields) {
           // usernow = {
              //  idusers: result2[0].idusers,
              //  username: req.body.username,
              //  password: req.body.passw
           // };
          //  res.cookie("UserData", JSON.stringify(usernow));
            
       // });
       // res.json({ info: 'You are successfully signed up' });


   // });



//});



app.post('/infos', (req, res) => {
    res.redirect("/");
});


app.post('/infopo', (req, res) => {

    connect.con.query("SELECT * from courses", function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        res.json(result);
    });
});


app.post('/infopo2', (req, res) => {
    const userId = usernow.idusers;


    connect.con.query("SELECT * from courses inner join usercourses on courses.idcourses=usercourses.courseid inner join users on users.idusers=usercourses.userid where users.idusers= ?", [userId]

        , function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            res.json(result);
        });
});

app.post('/infobutton', (req, res) => {
    const userId3 = usernow.idusers;
    connect.con.query(" delete from usercourses where userid=? AND courseid=?", [userId3,req.body.courseid], function (err, result, fields) {
        if (err) throw err;
        res.json({ info: 'Deleted' });
    });
});

app.post('/infobuttonadd', (req, res) => {
    const userId2 = usernow.idusers;
    connect.con.query(" insert into usercourses(userid,courseid) values(?,?)", [userId2, req.body.courseid], function (err, result, fields) {
        if (err) throw err;
        res.json({ info: 'Enrolled' });
    });
});

app.get('/forgetpass.html', (req, res) => {
    res.sendFile(`${HTMLPath}/forgetpass.html`);
});

app.post('/resetpass', (req, res) => {
    connect.con.query("update users set password=? where username=? ", [req.body.passw, req.body.username], function (err, result, fields) {
        if (err) throw err;
        res.json({ info: 'Password is resetted succefully' });
    });
});


app.post('/infosearch', (req, res) => {
    connect.con.query("select coursename from courses where coursename like ?", ['%' + req.body.coursenames + '%'], function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        res.json(result);
    });
});

app.post('/addCourse', (req, res) => {
    const { courseName } = req.body;
    connect.con.query("INSERT INTO courses (coursename) VALUES (?)", [courseName], (err, result) => {
        if (err) {
            console.error('Error adding course: ', err);
            res.status(500).send('Failed to add course.');
        } else {
            console.log('Course added successfully:', result);
            res.status(200).send('Course added successfully.');
        }
    });
});


app.post('/deleteCourse', (req, res) => {
    const { courseId } = req.body;
    connect.con.query("DELETE FROM courses WHERE idcourses = ?", [courseId], (err, result) => {
        if (err) {
            console.error('Error deleting course: ', err);
            res.status(500).send('Failed to delete course.');
        } else {
            console.log('Course deleted successfully:', result);
            res.status(200).send('Course deleted successfully.');
        }
    });
});

app.get('/MyCourses.html', (req, res) => {
    res.sendFile(`${HTMLPath}/MyCourses.html`);
});

app.get('/fetchMyCourses', (req, res) => {
    
    const loggedInUserId = usernow.idusers;

    
    const query = `
        SELECT courses.coursename
        FROM courses
        INNER JOIN usercourses ON courses.idcourses = usercourses.courseid
        WHERE usercourses.userid = ?
    `;

   
    connect.con.query(query, [loggedInUserId], (err, results) => {
        if (err) {
            console.error('Error fetching enrolled courses:', err);
            res.status(500).json({ error: 'Failed to fetch enrolled courses' });
        } else {
        
            const enrolledCourses = results.map(row => ({ coursename: row.coursename }));
            res.json(enrolledCourses); 
        }
    });
});

app.get('/manageUser.html', (req, res) => {
    res.sendFile(`${HTMLPath}/manageUser.html`);
});

app.post('/addUser', (req, res) => {
    const { username, password } = req.body;
    connect.con.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, password], (err, result) => {
        if (err) {
            console.error('Error adding user: ', err);
            res.status(500).send('Failed to add user.');
        } else {
            console.log('User added successfully:', result);
            res.status(200).send('User added successfully.');
        }
       
    });
});

app.post('/deleteUser', (req, res) => {
    const { userId } = req.body;
    connect.con.query("DELETE FROM users WHERE idusers = ?", [userId], (err, result) => {
        if (err) {
            console.error('Error deleting user: ', err);
            res.status(500).send('Failed to delete user.');
        } else {
            console.log('User deleted successfully:', result);
            res.status(200).send('User deleted successfully.');
        }
    });
});

app.get('/appointment.html', (req, res) => {
    res.sendFile(`${HTMLPath}/appointment.html`);
});

app.get('/getAppointmentData', (req, res) => {
    connect.con.query("SELECT d.dt, c.CashierNB FROM cashier c right JOIN datetime d ON c.cashierNB = d.cashierNB;", (err, results) => {
        if (err) {
            console.error('Error fetching appointment data:', err);
            res.status(500).json({ error: 'Failed to fetch appointment data' });
        } else {
            res.json(results);
        }
    });
});


app.post('/createAppointment', (req, res) => {
    const { datetime, cashier } = req.body;
    const loggedInUser = usernow.username; 

    const when = new Date(datetime);
    connect.con.query("INSERT INTO appointment (`when`, `where`, `who`) VALUES (?, ?, ?)", [when, cashier, loggedInUser], (err, result) => {
        if (err) {
            console.error('Error creating appointment:', err);
            res.status(500).send('Failed to create appointment.');
        } else {
            console.log('Appointment created successfully:', result);
          

            connect.con.query("DELETE FROM datetime WHERE dt = ?", [when], (delErr, delResult) => {
                if (delErr) {
                    console.error('Error deleting datetime:', delErr);
                    res.status(500).send('Failed to delete selected datetime.');
                } else {
                    console.log('Selected datetime deleted successfully:', delResult);
                    res.status(200).send('Appointment created successfully.');
                }
            });
        }
    });
});


app.get('/profile.html', (req, res) => {
    res.sendFile(`${HTMLPath}/profile.html`);
});

app.get('/profiledisplay.html', (req, res) => {
    res.sendFile(`${HTMLPath}/profiledisplay.html`);
});


app.post('/profileinfo', async (req, res) => {
    const userId2 = JSON.parse(req.cookies.UserData).idusers;
    console.log(userId2);
    // const result = await func.addprofile(userId2, req.body.username, req.body.profile);
    connect.con.query("select count(*) from profile where usersid=?", [userId2], (err, result,fields) => {
        console.log(result[0]['count(*)']);

        if (result[0]['count(*)'] == 0) {
            console.log('entered');
            connect.con.query("insert into profile(usersid, picture) values(?,?)", [userId2, req.body.username, req.body.profile], (err, result2, fields) => {
                console.log('inserted');
            });

        }
        else {
            connect.con.query("update profile set picture=? where usersid=?", [req.body.profile,userId2], (err, results, fields) => {
                console.log('updated');
            });
        }
            const uploadedImage = req.body.profile;
        const sourcePath = path.join('C:\\Users\\user\\Desktop', uploadedImage);
        const destinationPath = path.join(__dirname,"assets", uploadedImage);
        fs.copyFile(sourcePath, destinationPath, (err) => {
            if (err) {
                console.error('Error copying file:', err);
                return res.json({ info: 'Added Successfully, but error copying image' });
            }
            console.log('Image copied successfully!');
            res.json({ info: 'Added Successfully and image copied to assets' });
        });
    });

});



app.post('/profiledisp', async (req, res) => {
    const userId2 = JSON.parse(req.cookies.UserData).idusers;
    // const result = await func.dispprof(userId2);
    connect.con.query("select * from profile inner join users on usersid=idusers  where usersid=?", [userId2], (err, results, fields) => {
        console.log(results[0].picture);
        res.json(results);
    });
});

app.post('/updateUsername', (req, res) => {
    const loggedInUser = JSON.parse(req.cookies.UserData).username; 

    const newUsername = req.body.newUsername; 

    
    connect.con.query("UPDATE users SET username = ? WHERE username = ?", [newUsername, loggedInUser], (err, result) => {
        if (err) {
            console.error('Error updating username:', err);
            res.status(500).json({ info: 'Failed to update username' });
        } else {
            console.log('Username updated successfully:', result);
            res.status(200).json({ info: 'Username updated successfully' });
        }
    });
});

app.listen(port);

