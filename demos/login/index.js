const express=require('express')
const morgan=require('morgan')
const cors=require('cors')
const bodyParser=require('body-parser')

const users=require('./db/users')

const app= express()

app.use(morgan('tiny'))
app.use(cors())
app.use(bodyParser.json())


//answer the show all users request from the admin page 
app.get('/admin',(req,res)=>{
	users.getAll().then((messages)=>{
		res.json(messages);	
	})
})


//answer the signup request from the signup page
app.post('/signup',(req,res)=>{
	console.log(req.body);
	users.isValide(req.body).then((user)=>{
		//if there is no such user, create a new user using requeste body
		if(user.length==0) {
			users.create(req.body).then((message)=>{
				res.json(message);
			}).catch((error)=>{
				res.status(500);
				res.json(error);
			});
		}
		else{
			res.json("user already exist");
		}

	}).catch((error)=>{
		res.status(500);
		res.json(error);
	});
	
});


//answer the login request from the login page
app.post('/login',(req,res)=>{
	console.log(req.body);
	users.isValide(req.body).then((user)=>{
		//if there is no such user
		if(user.length==0) {
			res.json("user doesn't exist");
			return;
		}
		//if the pwd input is correct, return true
		if(user[0].pwd==req.body.pwd)
			res.json("true");
		//otherwise return false
		else res.json("false");

	}).catch((error)=>{
		res.status(500);
		res.json(error);
	});
	

})


const port=8080
app.listen(port, ()=>{
	console.log(`listening at ${port}`)
})
