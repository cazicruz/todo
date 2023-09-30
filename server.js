const express = require('express');
const session = require('express-session');
const path = require('path');
//importing database connection
const connectDB = require('./config/dbConnect');
const Users = require('./models/userModel');
const Task = require('./models/taskModel');
// import mongoose from 'mongoose';
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

connectDB();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(session({

// }));



app.get('/', (req, res) => {
    console.log(session);
    var characters = [
        {
          name: 'Harry',
          designation: "Student"
        },
        {
          name: 'Dumbledore',
          designation: "Headmaster"
        },
        {
          name: 'Snape',
          designation: "Professor"
        },
        {
          name: 'Hermione',
          designation: "Student"
        }
    ];
    var subheading = "I though we should involve some magic";

    res.render("index", {
    characters: characters,
    subheading: subheading,
    user:session.user
    });
});

app.post('/login', async (req,res)=>{
    const {user} = req.body;
    console.log(user);
    if(!user || user===''){
        return res.redirect('/');
    }
    else{
        const newUser = await Users.findOne({username:user}).exec();
        console.log(newUser)
        if (newUser ){
            
            session.user = user.charAt(0).toUpperCase() + user.slice(1);
            session.user_id = newUser.id;
        }
        res.redirect('/');
    }
})

app.post('/signup', async (req,res)=>{
    const {username, password }= req.body;
    if(!username || !password){
        return res.redirect('/');
    }
    try{
        const oldUser = await Users.findOne({username:username}).exec();
        if(oldUser){
            console.log('user already exists');
            return res.redirect('/');
        }
        const user = await Users.create({username:username, password:password});
        if(!user){
            console.log('error in creating user');
        }
        else{
            console.log(user);
            session.user = username.charAt(0).toUpperCase() + username.slice(1);
            session.user_id = user.id;
        }
    }catch(err){
        console.log(err.message)
    }
    res.redirect('/');
});

app.post('/logout', (req,res)=>{
    session.user = null;
    res.redirect('/');
})

app.get('/magic',async (req, res) => {
    let tasks=''
    try{

        const user = await Users.findOne({_id:session.user_id}).exec();
        console.log(user)
        if (!user || !session.user){
            return res.redirect('/');
        }
        tasks = await Task.find({user_id:user.id}).exec();
        console.log(tasks)
    } catch(err){
        console.log(err.message);
    }
    res.render('magic',{
        tasks:tasks,
        user:session.user
    })
});

app.post('/addtask',  async (req, res) => {
    const {newtask} = req.body;
    console.log(newtask);
    try{
        const user = await Users.findOne({_id:session.user_id}).exec();
        if(user){
            console.log(user);
            const task = await Task.create({task:newtask,
                user_id:user._id});
            if(!task){
                console.log('error in creating task');
            }
        }
    }catch(err){
        console.log(err.message);
    }
    res.redirect('magic');
})

app.post('/deletetask/:id', async (req,res)=>{
    const {id } = req.params;
    console.log(id);

    try{
        const task = await Task.findOneAndDelete({_id:id}).exec();
        console.log(task)
    }catch(err){
        console.log(err.message);
    }
    return res.redirect('/magic');
})


mongoose.connection.once('open', () => {
    console.log('connected to database');
    app.listen(port, () => {
        console.log(`Server is up on port ${port} and db is connected`); 
    }); 
})