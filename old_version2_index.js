//TODOS: 1. Watch out for repeated room names. 2. Make app based on unique usernames, not user's actual name. 3. Refer to TODOs scattered through code.
//required variables
const express = require('express');
const convo = require('./conversation')
const ppl = require('./people')
const server_functions = require('./server_functions')
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mysql = require('mysql');
var lessMiddleware = require('less-middleware');


//required functions to synchronize async calls
// function render_home_page(user, res, recipients, contact_value, msg, convo_id){//TODO: remove user from function calls AND remove convo_id from function headers and wherever any of these functions are called
// 	console.log('test_3');
// 	if(user == contact_value){
// 		res.render('home_page', {
// 			message: msg + contact_value,
// 			name: user,//assigns handlebars variable name the value of variable user
// 			active_convos: recipients, //assings handlebars variable group_items this array, TODO: Dynamically update groups
// 			contact: contact_value,
// 			convo_id: null
// 		});
// 	}
// 	else{
// 		res.render('home_page', {
// 			message: msg + contact_value,
// 			name: user,//assigns handlebars variable name the value of variable user
// 			active_convos: recipients, //assings handlebars variable group_items this array, TODO: Dynamically update groups
// 			contact: contact_value,
// 			convo_id: convo_id
// 		});
// 	}

// 	}

// function recipients_sql_query(user, recipient_sql, loop_val, recipients, res, array_size, contact, msg, convo_id){
// 	con.query(recipient_sql, function(err_3, result_3, fields_3){
// 	if(err_3)
// 		throw err_3;
// 	else{
// 		console.log(result_3);//TODO: obtain person1 and person2 from list, push whichever is NOT current user onto the array
// 		var person1 = result_3[0].person1;
// 		var person2 = result_3[0].person2;
// 		var convo_type = result_3[0].convo_type;
// 		var person_convo_1 = {name: person1, convo_type: convo_type};
// 		var person_convo_2 = {name: person2, convo_type: convo_type};
// 		if(person1 != user)
// 			recipients.push(person_convo_1);
// 		else
// 			recipients.push(person_convo_2);
// 		if(loop_val == (array_size - 1))
// 		{
// 			server_functions.render_home_page(user, res, recipients, contact, msg, convo_id);
// 		}
// 		}
// 	})
	
// }

// function convos_sql_query(user, sql, res, contact, msg, convo_id, callback){

// 	con.query(sql, function(err_2, result_2, fields_2){
// 		if(err_2)
// 				throw err_2;
// 			else if(result_2[0].convos == null){
// 				console.log("convos: " + result_2[0].convos);
// 				res.render('home_page', {
// 					message: "Welcome, " + user,
// 					name: user,//assigns handlebars variable name the value of variable user
// 					no_active_convos: "No active conversations",
// 					contact: user,
// 					convo_id: null
// 				});
// 			}
// 			else{
// 				var i;
// 				var recipients = [];
// 				var convo_id_string = result_2[0].convos.toString();
// 				var parsable_convo_ids = convo_id_string.split(" ");
// 				var length = parsable_convo_ids.length;
// 				console.log(length);
// 				console.log(parsable_convo_ids);
// 				for(i = 0; i < length; i++)
// 				{

// 					if(parsable_convo_ids[i] != ''){
// 						var recipient_sql = "SELECT person1, person2, convo_type FROM conversations WHERE id = " + parsable_convo_ids[i];
// 						console.log(recipient_sql);
// 						callback(user, recipient_sql, i, recipients, res, length, contact, msg, convo_id);
// 					}
// 				}
// 				}
// 			})
// }

// function password_sql_query(sql, user, password, convos_sql_entry, recipients_sql_function, res, contact, msg, convo_id, callback)
// {
// 		con.query(sql, function(err_1, result_1, fields_1){
// 			if(err_1) throw err_1;
// 			else if(result_1 == "" || password != result_1[0].password)
// 			{
// 				console.log("INCORRECT PASSWORD");
// 				res.render('login', {
// 					response: "Incorrect username and/or password"
// 				})
// 			}
// 			else{
// 				console.log('test');
// 				callback(user, convos_sql_entry, res, contact, msg, convo_id, recipients_sql_function);
// 			}
// 		})
// }

// function loop_thru_gc_recipients_array(array, group_name, res, callback){
// 		for(var i = 0; i < array.length - 1; i++){
// 			var current_name = array[i];
// 			callback(current_name, group_name, i, res, array);
// 		}
// }

// function update_db_convos(current_name, group_name, loop_val, res, array){
// 		var insert_sql = "INSERT INTO conversations VALUES ('NULL', " + "'" + current_name + "', " + "'" + group_name + "', " + "'" + group_name + "', 'group')"; 
// 		con.query(insert_sql, function(err, result){
// 		if(err)
// 			throw err;
// 		else{
// 			var id_append_sql = "UPDATE customers SET convos = CONCAT(IFNULL(convos, ''), ' ', " + "'" + result.insertId + "')" + " WHERE firstName = " + "'" + current_name + "'";
// 			con.query(id_append_sql, function(err_1, result_1){
// 				if(err_1)
// 					throw err_1;//TODO: ask user to enter new gc name is one is already in the database
// 				else if(loop_val == array.length - 2){
// 					render_home_from_search(array[0], res, group_name, array);
// 				}
// 			})
// 		}
// 		})
// }

// function render_home_from_search(user_name, res, group_name, array){
// 		var convos_sql = "SELECT convos FROM customers WHERE firstName = " + "'" + user_name + "'";
// 		var msg = "Now chatting with group ";
// 		server_functions.convos_sql_query(user_name, convos_sql, res, group_name, msg, 1, server_functions.recipients_sql_query);
// 		for(var j = 1; j < array.length - 1; j++ ){
// 			var gc_recipient = array[j];
// 			for(var i = 0; i < active_users.length; i++){
// 				if(active_users[i].user_name === gc_recipient){
// 					io.to(active_users[i].user_socket).emit('new_convo', group_name, "group");
// 					break;
// 				}
// 			}
// 		}
// }

// function gc_creator(req, res, callback){
// 		// console.log(JSON.parse(req.body.gc_real_submission_value));
// 		var array = JSON.parse(JSON.parse(req.body.gc_real_submission_value).group_chat);
// 		var user_name = array[0];
// 		var group_name = array[array.length - 1];
// 		server_functions.loop_thru_gc_recipients_array(array, group_name, res, server_functions.update_db_convos);
// }

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
app.use(lessMiddleware(__dirname + '/public/css',{ commpress: true }));
app.use(express.static(__dirname + '/public/css'));

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
	server_functions.password_sql_query(sql, user, password, convos_sql, server_functions.recipients_sql_query, res, user, msg, 0, server_functions.convos_sql_query);
})

app.post('/search', (req, res, next) => {//TODO: use callbacks to tidy this up
	let query = req.body.searchBar;//assigns local variable query value of text entered into search bar, TODO: implement proper sorting algorithm + database reader
	let chat_type = req.body.group_chat_or_private_chat;
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
	var render_file;
	if(chat_type === "group"){
		render_file = "group_chat_creation";
	}
	else
		render_file = "search_results";
	if(sorted_people.length == 0){//if there are no relevant results, render the page with "no match found!" 
		res.render(render_file, {
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
	res.render(render_file, {//renders page with relevant results
		username: current_user,
		group_items: ["TXE", "Branch", "Class"], //TODO: Dynamically update groups
		individual_items: ["Mohan", "Caren", "Anne"],
		search: query, 
		search_items_people: sorted_people
	});
})


app.post('/contact', (req, res, next) => {
	var recipient = req.body.contact_button;
	var user_self = req.body.stored_user_name;
	var person1;
	var person2;
	var roomName;
	if(user_self < recipient){
		roomName = user_self + recipient;
		person1 = user_self;
		person2 = recipient;
	}
	else{
		roomName = recipient + user_self;
		person2 = user_self;
		person1 = recipient;
	}
	var insert_sql = "INSERT INTO conversations VALUES ('NULL', " + "'" + person1 + "', " + "'" + person2 + "', " + "'" + roomName + "', 'private')";
	console.log(insert_sql);
	con.query(insert_sql, function(err, result){
		if(err){//TODO: check if error was due to duplicate row entry; if not, throw error
				var convos_sql = "SELECT convos FROM customers WHERE firstName = " + "'" + user_self + "'";
				var msg = "Now chatting with ";
				server_functions.convos_sql_query(user_self, convos_sql, res, recipient, msg, 1, server_functions.recipients_sql_query);
		}
		else{
			var id_append_sql = "UPDATE customers SET convos = CONCAT(IFNULL(convos, ''), ' ', " + "'" + result.insertId + "')" + " WHERE firstName IN (" + "'" + recipient +"', " + "'" + user_self + "')"; //updates the convos list of a customer
			con.query(id_append_sql, function(err_1, result_1){
				if(err_1)
					throw err_1;
				else{
					var convos_sql = "SELECT convos FROM customers WHERE firstName = " + "'" + user_self + "'";
					var msg = "Now chatting with ";
					server_functions.convos_sql_query(user_self, convos_sql, res, recipient, msg, result.insertId, server_functions.recipients_sql_query);
					console.log(server_functions.active_users.length);
					for(i = 0; i < server_functions.active_users.length; i++){
						console.log("user_name: " + server_functions.active_users[i].user_name);
						if(server_functions.active_users[i].user_name === recipient){
							io.to(server_functions.active_users[i].user_socket).emit('new_convo', user_self, "private");
							break;
						}
					}
				}
			})
		}
	})


})

app.post('/new_pm', (req, res, next) => {
	let current_user = req.body.stored_user_name;
	console.log(current_user);
	res.render('search_results', {
		username: current_user,
		group_items: ["TXE", "Branch", "Class"], 
		individual_items: ["Mohan", "Caren", "Anne"],
		result: "Search for someone!"
	});
})

app.post('/gc_creation', (req, res, next)=>{
	let current_user = req.body.stored_user_name;
	res.render('group_chat_creation', {
		username: current_user,
		group_items: ["TXE", "Branch", "Class"], 
		individual_items: ["Mohan", "Caren", "Anne"],
		result: "Search for the people you want to add to the group!"
	});
})

app.post('/new_gc', (req, res, next) => {
	server_functions.gc_creator(req, res, server_functions.loop_thru_gc_recipients_array);
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
	socket.on('chat message', function(time, user, msg, room, convo_type){
		console.log(socket.rooms);
		console.log("received room: " + room);
   		var message = user + ', ' + time + ": " +msg;
   		console.log(user + ' said: ' + msg);
   		var index_of_apostrophe = msg.indexOf("'");
		if(index_of_apostrophe != -1){
			console.log('hit');
			msg = msg.replace(/[\']+/g, "''");
		}
   		var insert_sql = "INSERT INTO messages VALUES (NULL, " + "'" + msg + "', " + "'" + time + "', " + "'" + user + "', " + "'" + room + "'" + ")";
   		console.log(insert_sql);
   		con.query(insert_sql, function(err, result){
   			if(err) throw err;
   		});
   		//TODO: look into buffer to store messages again
   		// if(room == "default")
   		// 	io.emit('chat message', message, room);
   		// else
   		console.log("Sending to : " + room);
   		io.sockets.in(room).emit('chat message', message, room, user, convo_type);
  	});


  	socket.on('add_to_array', function(name, socket_id){//TODO: what to do if active user then disconnects? HOw to remove them from array?
  		var new_user = {user_name: name, user_socket: socket_id};
  		var index = -1;
  		for(var i = 0; i < server_functions.active_users.length; i++)
  		{
  			if(server_functions.active_users[i].user_name === name){
  				index = i;
  				break;
  			}
  		}
  		if(index === -1){
  			server_functions.active_users.push(new_user);
  			console.log(server_functions.active_users);
  		}
  		else{
  			console.log("jelly");
  			server_functions.active_users.splice(index, 1);
  			server_functions.active_users.push(new_user);
  			console.log(server_functions.active_users);
  		}
  	})

  	socket.on('load-room', function(room, socket_id){
  		console.log(room);
		console.log("Joined room: " + room);
		socket.join(room);
			var messages_sql = "SELECT msg_text, time_stamp, sent_from FROM messages WHERE room_name = '" + room + "' ORDER BY msg_id ASC";
			con.query(messages_sql, function(err_1, result_1){
				if(err_1) throw err_1;
				else
					io.to(socket_id).emit('convo_id', 1, result_1);//emit just to one socket
			})
			
		//io.sockets.in(room).emit('chat message', "Welcome to " + room + "!", room);
	});

	socket.on('join-room', function(room){
		socket.join(room);
	})
});

io.emit('some event', { for: 'everyone' });




