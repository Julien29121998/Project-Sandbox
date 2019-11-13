const Joi=require('joi')
const db=require('./connection')
const users=db.get('user') //get the collection "user"

//the format of userinfo stocked in the db, it's used to check the received data
const schema=Joi.object().keys({
	first_name: Joi.string().alphanum().required(),
	last_name: Joi.string().alphanum().required(),
	pwd: Joi.string().max(20).required(),
	role: Joi.string().alphanum().required(),
})



//function used to get all the no-admin user in the collection
function getAll(){
	//only return the coder users info
	return users.find({"role":{$ne:"admin"}});
}

//function used to insert new user to the collection
function create(user){
	const result=Joi.validate(user,schema);
	var exi=usrExiste(user);
	if(exi)
	{
		var s="UserName already registered.";
		return s;
	}

	if(result.error==null){
		user.created=new Date();
		return users.insert(user);
	}
	else{
		Promise.reject(result.error);
	}
}



//function used to check whether the user trying to login exists, and return the userinfo
function isValide(user){
	//check if the user info is in right form
	const result=Joi.validate(user,schema);
	if(result.error==null)
		return users.find({"first_name":user.first_name,"last_name":user.last_name});
	else
		Promise.reject(result.error);
	

}


module.exports={
	getAll,
	create,
	isValide
};
