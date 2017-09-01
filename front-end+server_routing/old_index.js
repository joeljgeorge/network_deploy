//required variables
const express = require('express');
const convo = require('./conversation')
const ppl = require('./people')
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mysql = require('mysql');

//required functions to synchronize asynch calls
function render_home_page(user, res, recipients, contact_value, msg){//TODO: remove user from function calls
	console.log('test_3');
		res.render('home_page', {
			message: msg + contact_value,
			name: user,//assigns handlebars variable name the value of variable user
			active_convos: recipients, //assings handlebars variable group_items this array, TODO: Dynamically update groups
			contact: contact_value
		});
	}

function recipients_sql_query(user, recipient_sql, loop_val, recipients, res, array_size, contact, msg){
	con.query(recipient_sql, function(err_3, result_3, fields_3){
	if(err_3)
		throw err_3;
	else{
		console.log(result_3);//TODO: obtain person1 and person2 from list, push whichever is NOT current user onto the array
		var person1 = result_3[0].person1;
		var person2 = result_3[0].person2;
		if(person1 != user)
			recipients.push(person1);
		else
			recipients.push(person2);
		if(loop_val == (array_size - 1))
		{
		render_home_page(user, res, recipients, contact, msg);
		}
		}
	})
	
}

function convos_sql_query(user, sql, res, contact, msg, callback){

	con.query(sql, function(err_2, result_2, fields_2){
		if(err_2)
				throw err_2;
			else if(result_2[0].convos == null){
				console.log(result_2[0].convos);
				res.render('home_page', {
					message: "Welcome, " + user,
					name: user,//assigns handlebars variable name the value of variable user
					no_active_convos: "No active conversations",
					contact: user
				});
			}
			else{
				var i;
				var recipients = [];
				var convo_id_string = result_2[0].convos.toString();
				var parsable_convo_ids = convo_id_string.split(" ");
				var length = parsable_convo_ids.length;
				console.log(length);
				console.log(parsable_convo_ids);
				for(i = 0; i < length; i++)
				{

					if(parsable_convo_ids[i] != ''){
						var recipient_sql = "SELECT person1, person2 FROM conversations WHERE id = " + parsable_convo_ids[i];
						console.log(recipient_sql);
						callback(user, recipient_sql, i, recipients, res, length, contact, msg);
					}
				}
				}
			})
}

function password_sql_query(sql, user, password, convos_sql_entry, recipients_sql_function, res, contact, msg, callback)
{
		con.query(sql, function(err_1, result_1, fields_1){
			if(err_1) throw err_1;
			else if(result_1 == "" || password != result_1[0].password)
			{
				console.log("INCORRECT PASSWORD");
				res.render('login', {
					response: "Incorrect username and/or password"
				})
			}
			else{
				console.log('test');
				callback(user, convos_sql_entry, res, contact, msg, recipients_sql_function);
			}
		})
}

var con = mysql.createConnection({
	host: "localhost",
	user: "jgeorge",
	password: "thexperiment123!!",
	database: "acme"
});

con.connect(function(err){
	if(err)
		throw err;
	console.log("Connected!");
})

app.use(express.static('public'));
app.use(bodyParser.urlencoded());
app.set('view engine', 'hbs');

server.listen(port, function(){
	console.log('listening on *:3000');
});


app.get('/', (req, res, next) => {
	res.render('login', {
		response: ""
	})
})

app.post('/login', (req, res, next) => {
	var user = req.body.username;//assigning value entered into username section as a global variable called user
	var password = req.body.password;
	var sql = "SELECT * FROM customers WHERE firstName = " + "'" + user + "'";//change firstName to username
	var convos_sql = "SELECT convos FROM customers WHERE firstName = " + "'" + user + "'";
	var msg = "Welcome, ";
	password_sql_query(sql, user, password, convos_sql, recipients_sql_query, res, user, msg, convos_sql_query);
	// con.query(sql, function (err_1, result_1, fields_1){
	// 	if(err_1)
	// 		throw err_1;
	// 	if(result_1 == "" || password != result_1[0].password)
	// 	{
	// 		console.log("INCORRECT PASSWORD");
	// 		res.render('login', {
	// 			response: "Incorrect username and/or password"
	// 		})
	// 	}
	// 	else{
	// 		var convos_sql = "SELECT convos FROM customers WHERE firstName = " + "'" + user + "'";
	// 		con.query(convos_sql, function(err_2, result_2, fields_2){
	// 			if(err_2)
	// 				throw err_2;
	// 			else if(result_2[0].convos == null){
	// 				console.log(result_2[0].convos);
	// 				res.render('home_page', {
	// 					message: "Welcome, " + user,
	// 					name: user,//assigns handlebars variable name the value of variable user
	// 					no_active_convos: "No active conversations",
	// 					contact: user
	// 				});
	// 			}
	// 			else{
	// 				var i;
	// 				var recipients = [];
	// 				var convo_id_string = result_2[0].convos.toString();
	// 				var parsable_convo_ids = convo_id_string.split(" ");
	// 				console.log(parsable_convo_ids);
	// 				for(i = 0; i <=parsable_convo_ids.length; i++){
	// 					if(parsable_convo_ids[i] != ''){
	// 						var recipient_sql = "SELECT person1, person2 FROM conversations WHERE id = " + parsable_convo_ids[i];
	// 						console.log(recipient_sql);
	// 						con.query(recipient_sql, function(err_3, result_3, fields_3){
	// 							if(err_3)
	// 								throw err_3;
	// 							else{
	// 								console.log(result_3);//TODO: obtain person1 and person2 from list, push whichever is NOT current user onto the array
	// 								var person1 = result_3[0].person1;
	// 								var person2 = result_3[0].person2;
	// 								if(person1 != user)
	// 									recipients.push(person1);
	// 								else
	// 									recipients.push(person2);
	// 							}
	// 							if(i>=parsable_convo_ids.length)
	// 							{
	// 								res.render('home_page', {
	// 								message: "Welcome, " + user,
	// 								name: user,//assigns handlebars variable name the value of variable user
	// 								active_convos: recipients, //assings handlebars variable group_items this array, TODO: Dynamically update groups
	// 								contact: user
	// 								});
	// 								return;
	// 							}
	// 						})
	// 					}
	// 				}
	// 				}
	// 			})
	// 		}
	// 	})
})

app.post('/search', (req, res, next) => {
	let query = req.body.searchBar;//assigns local variable query value of text entered into search bar, TODO: implement proper sorting algorithm + database reader
	let lowercase_query = query.toLowerCase(); //converts query to lowercase
	let people = ppl.getPeople().person_list;//I created a list of people for testing purposes, we can supplant this with a database of mentors
	let sorted_people = [];//local variable that will hold all of the results that are relevant to the query
	let current_user = req.body.stored_user_name;
	for(let i =0; i<people.length; i++){//sorting algorithm that determines if the query is found in any part of a mentor's profile
		let current_name = people[i].name.toLowerCase();
		let current_branch = people[i].branch.toLowerCase();
		let current_mini_bio = people[i].mini_bio.toLowerCase();
		let current_expanded_bio = people[i].extended_bio.toLowerCase();
		let work_experience1 = people[i].work_experience1.toLowerCase();
		let work_experience2 = people[i].work_experience2.toLowerCase();
		if(current_name.indexOf(lowercase_query) != -1 
		|| current_branch.indexOf(lowercase_query) != -1 
		|| current_mini_bio.indexOf(lowercase_query) != -1
		|| current_expanded_bio.indexOf(lowercase_query) != -1
		|| work_experience1.indexOf(lowercase_query) != -1
		|| work_experience2.indexOf(lowercase_query) != -1
		){
			sorted_people.push(people[i]);
		}
	}
	if(sorted_people.length == 0){//if there are no relevant results, render the page with "no match found!"
		res.render('search_results', {
		username: current_user,
		group_items: ["TXE", "Branch", "Class"], //TODO: Dynamically update groups
		individual_items: ["Mohan", "Caren", "Anne"],
		search: query, 
		result: "No match found!"
	});
	}
	else
	sorted_people.sort(function(a,b){//sorts results alphabetically
		var textA = a.name.toLowerCase();
		var textB = b.name.toLowerCase();
		return (textA < textB) ? -1 : (textA>textB) ? 1: 0;
	})
	res.render('search_results', {//renders page with relevant results
		username: current_user,
		group_items: ["TXE", "Branch", "Class"], //TODO: Dynamically update groups
		individual_items: ["Mohan", "Caren", "Anne"],
		search: query, 
		search_items_people: sorted_people
	});
})


app.post('/contact', (req, res, next) => {
	//TODO: check if convo already exists before creating new row in database
	var recipient = req.body.contact_button;
	var user_self = req.body.stored_user_name;
	var insert_sql = "INSERT INTO conversations VALUES ('NULL', 'NULL', " + "'" + user_self + "'" +", " + "'" + recipient + "'" +")";
	con.query(insert_sql, function(err, result){
		if(err)
			throw err;
		else{
			var id_append_sql = "UPDATE customers SET convos = CONCAT(IFNULL(convos, ''), ' ', " + "'" + result.insertId + "')" + " WHERE firstName IN (" + "'" + recipient +"', " + "'" + user_self + "')";
			con.query(id_append_sql, function(err_1, result_1){
				if(err_1)
					throw err_1;
				else{
					var convos_sql = "SELECT convos FROM customers WHERE firstName = " + "'" + user_self + "'";
					var msg = "Now chatting with ";
					convos_sql_query(user_self, convos_sql, res, recipient, msg, recipients_sql_query);
				}
			})
		}
	})
	// con.query(convos_sql, function(err_2, result_2, fields_2){
	// 	if(err_2)
	// 		throw err_2;
	// 	else{
	// 		var i;
	// 		var recipients = [];
	// 		var convo_id_string = result_2[0].convos.toString();
	// 		var parsable_convo_ids = convo_id_string.split(" ");
	// 		for(i = 0; i < parsable_convo_ids.length; i++){
	// 			if(parsable_convo_ids[i] != ''){
	// 				var recipient_sql = "SELECT person1, person2 FROM conversations WHERE id = " + parsable_convo_ids[i];
	// 				con.query(recipient_sql, function(err_3, result_3, fields_3){
	// 				if(err_3)
	// 					throw err_3;
	// 				else{
	// 					console.log(result_3);//TODO: obtain person1 and person2 from list, push whichever is NOT current user onto the array
	// 					var person1 = result_3[0].person1;
	// 					var person2 = result_3[0].person2;
	// 					if(person1 != user_self)
	// 						recipients.push(person1);
	// 					else
	// 						recipients.push(person2);
	// 					}
	// 					if(i>=res.parsable_convo_ids.length)
	// 					{
	// 							render('home_page', {
	// 							message: "Now chatting with " + recipient,
	// 							name: user_self,//assigns handlebars variable name the value of variable user
	// 							active_convos: recipients, //assings handlebars variable group_items this array, TODO: Dynamically update groups
	// 							contact: recipient
	// 						});
	// 						return;
	// 					}
	// 				})
	// 			}
	// 		}
	// 	}
	// })
})


app.get('/group', (req, res, next)=>{

})
//IGNORE IGNORE IGNORE
// app.post('/message', (req, res, next)=> {
// 	user_message = req.body.messageBox;//sets global variable user_message equal to the value of the text entered into the messageBox
// 	convo.addMessage(user_message, user);//adds message to the array of messages to be displayed
// 	res.render('home_page',{//renders page with new message + all old messages
// 		name: user,
// 		group_items: ["TXE", "Branch", "Class"], //TODO: Dynamically update groups
// 		individual_items: ["Mohan", "Caren", "Anne"], //TODO: Dynamically update groups
// 		message: convo.getConversation().messages
// 	})
// })
 var buffer1 = [];
 var buffer2 = [];

io.on('connection', function(socket){//socket functionality, integrated from Anne's code

	// console.log('a user connected');
	socket.on('chat message', function(time, user,msg, room){
		console.log(socket.rooms);
		console.log("received room: room-" + room);
   		var message = user + ', ' + time + ": " +msg;
   		console.log(user + ' said: ' + msg);
   		//TODO: look into buffer to store messages again
   		// if(room == "default")
   		// 	io.emit('chat message', message, room);
   		// else
   		io.sockets.in(room).emit('chat message', message, room);
  	});

  	socket.on('join-room', function(room){
		console.log("Joined room: room-" + room);
		socket.join(room);
		//io.sockets.in(room).emit('chat message', "Welcome to " + room + "!", room);
		console.log(socket.rooms);
	});

	// socket.on('disconnect', function(){
	// 	console.log('user disconnected');
	// });

});

io.emit('some event', { for: 'everyone' });




