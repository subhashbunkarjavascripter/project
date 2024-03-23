var express = require('express');
var router = express.Router();
const ExcelJS = require("exceljs")
const userModel = require("./users.js");
const Task = require("./task.js");
const mongoose = require('mongoose');
const passport = require("passport");
const localStrategy = require("passport-local");

passport.use(new localStrategy(userModel.authenticate()));



mongoose.connect("mongodb://0.0.0.0/project").then( ()=>{
  console.log("connect to db");
}).catch(err =>{
  console.log(err);
})



router.get("/", async function(req, res, next) {
  try {
    const users = await userModel.find();
    res.render("index", { users: users }); 
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal server error');
  }
});



router.get("/adduser",function(req,res,next){
  res.render("adduser")
})


router.post("/addUser", async function(req,res,next){
  const { username, email, mobile } = req.body;

  try {
    const newUser = new userModel({
      username,
      email,
      mobile
    });

    await newUser.save();
    
    res.redirect("/");
  } catch (error) {
    console.error('Error adding user:', error);
    return res.status(500).send('Internal server error');
  }
});


router.get("/user/:userId", async function(req, res, next) {
  try {
    const userId = req.params.userId;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.render("index", { user });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).send('Internal server error');
  }
});


function isValidMobileNumber(mobile) {
  return /^\d{10}$/.test(mobile);
}


router.get("/addTask", async function(req,res, next){
  
  try {
    const users = await userModel.find();
    res.render("addTask", {users})
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error")
    
  }

});


router.post("/addTask", async function(req, res, next) {
  try {
    const { user, title, taskType, status } = req.body;

    if (!user || !title || !taskType) {
      return res.status(400).send("User ID, task title, and task type are required");
    }

    const newTask = new Task({
      user,
      title,
      taskType,
      status,
    });

    await newTask.save();

    res.redirect("/");
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).send("Internal server error");
  }
});


router.get("/export", async function(req, res, next) {
  try {
    
    
    const userId = req.query.userId;

    let users;
    if (userId) {
      users = await userModel.findById(userId).populate('tasks');
    } else {
      users = await userModel.find().populate('tasks');
    }


    if (users) {

      const workbook = new ExcelJS.Workbook();
      const userSheet = workbook.addWorksheet("User");
      const taskSheet = workbook.addWorksheet("Tasks");

      userSheet.addRow(["Name", "Email", "Mobile"]);
      taskSheet.addRow(["User", "Task Name", "Task Type", "Status"]);

      users.forEach(user => {
        userSheet.addRow([user.username, user.email, user.mobile]);

        user.tasks.forEach(task => {
          taskSheet.addRow([user.username, task.title, task.taskType, task.status]);
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();

      res.setHeader('Content-Disposition', 'attachment; filename="users_and_tasks.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } else {
      console.error("No users found or users is not an array:", users);
      res.status(404).send('No users found');
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).send('Error exporting data');
  }
});


module.exports = router;
