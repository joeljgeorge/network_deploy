//TODOS: 1. Watch out for repeated room names. 2. Make app based on unique usernames, not user's actual name. 3. Refer to TODOs scattered through code. 4. Limit group chat sizes to 10-15 people.
//global variables required for server:
express = require('express');
app = express();
server = require('http').Server(app);
io = require('socket.io')(server);
mysql = require('mysql');
conversation_increment = 1;
nodemailer = require('nodemailer');
transporter = nodemailer.createTransport({
	 service: 'gmail',
	 auth: {
	    user: 'thexperimentreminder@gmail.com',
	    pass: 'redeemed123!!'
	 }
});
con = mysql.createConnection({
	host: "the-experiment-online-server.caq9gqmfjjuv.us-east-2.rds.amazonaws.com",
	user: "schrute_master",
	password: "ChiLASB_experimenter_2017!!",
	database: "acme",
	port: '3306'
});
//other required variables
const convo = require('./conversation')
const ppl = require('./people')
const server_functions = require('./server_functions')
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
var lessMiddleware = require('less-middleware');



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
	var user = req.body.username;//user_name
	var password = req.body.password;
	var sql = "SELECT firstName, password FROM customers WHERE user_name = " + "'" + user + "'";
	var convos_sql = "SELECT id, convos FROM customers WHERE user_name = " + "'" + user + "'";//TODO: update other SELECT convos FROM customers statements to include id
	console.log(sql + ", " + convos_sql);
	var msg = "Welcome, ";
	server_functions.password_sql_query(sql, user, password, convos_sql, server_functions.recipients_sql_query, res, user, msg, 0, server_functions.convos_sql_query, "");
})

app.post('/search', (req, res, next) => {//TODO: use callbacks to tidy this up
	let query = req.body.searchBar;//assigns local variable query value of text entered into search bar, TODO: implement proper sorting algorithm + database reader
	let chat_type = req.body.group_chat_or_private_chat;
	let user_name = req.body.user_name;
	let lowercase_query = query.toLowerCase(); //converts query to lowercase
	let people = ppl.getPeople().person_list;//I created a list of people for testing purposes, we can supplant this with a database of mentors
	let sorted_people = [];//local variable that will hold all of the results that are relevant to the query
	let current_user = req.body.stored_user_name;
	var render_file;
	console.log("user_name: "+ user_name);
	if(chat_type === "group"){
		render_file = "group_chat_creation";
	}
	else
		render_file = "search_results";

	var query_sql = "SELECT * FROM customers WHERE full_name LIKE '%" + query + "%' OR branch LIKE '%" + query + "%'  OR mini_bio LIKE '%" + query + "%'  OR extended_bio LIKE '%" + query + "%'  OR work_experience_1 LIKE '%" + query + "%'  OR work_experience_2 LIKE '%" + query + "%'";
	con.query(query_sql, function(err, result){
		if(err) throw err;
		else{
			if(result.length == 0){//if there are no relevant results, render the page with "no match found!" 
					res.render(render_file, {
					username: current_user,
					group_items: ["TXE", "Branch", "Class"], //TODO: Dynamically update groups
					individual_items: ["Mohan", "Caren", "Anne"],
					search: query, 
					user_name: user_name,
					result: "No match found!"
				});
			}
		else
			// result.sort(function(a,b){//sorts results alphabetically
			// 	var textA = a.name.toLowerCase();
			// 	var textB = b.name.toLowerCase();
			// 	return (textA < textB) ? -1 : (textA>textB) ? 1: 0;
			// })//TODO: revise this sort function?
			res.render(render_file, {//renders page with relevant results
				username: current_user,
				group_items: ["TXE", "Branch", "Class"], //TODO: Dynamically update groups
				individual_items: ["Mohan", "Caren", "Anne"],
				search: query, 
				user_name: user_name,
				search_items_people: result
			});
		}
	})

})


app.post('/contact', (req, res, next) => {
	var recipient = req.body.contact_button;
	var user_self = req.body.stored_user_name;
	var user_name = req.body.user_name;
	var recipient_user_name = req.body.contact_user_name;
	var person1;
	var person2;
	var roomName;
	if(user_name < recipient_user_name){
		roomName = user_name + recipient_user_name;//TODO: come back to this and complete this implementation elsewhere
		person1 = user_self;
		person2 = recipient;
	}
	else{
		roomName = recipient_user_name + user_name;
		person2 = user_self;
		person1 = recipient;
	}
	var time = "1969-08-24 20:29:5";//To ensure new email is sent
	var insert_sql = "INSERT INTO conversations VALUES ('NULL', " + "'" + person1 + "', " + "'" + person2 + "', " + "'" + roomName + "', 'private', '" + time + "')"; //TODO: make time 1969
	console.log(insert_sql);
	con.query(insert_sql, function(err, result){
		if(err){//TODO: check if error was due to duplicate row entry; if not, throw error
				var convos_sql = "SELECT id, convos FROM customers WHERE user_name = " + "'" + user_name + "'";
				var msg = "Now chatting with ";
				server_functions.convos_sql_query(user_name, convos_sql, res, recipient, msg, 1, server_functions.recipients_sql_query, user_self, roomName);
		}
		else{
			console.log("worked");
			var id_append_sql = "UPDATE customers SET convos = CONCAT(IFNULL(convos, ''), ' ', " + "'" + result.insertId + "')" + " WHERE user_name IN (" + "'" + recipient_user_name +"', " + "'" + user_name + "')"; //updates the convos list of a customer
			con.query(id_append_sql, function(err_1, result_1){
				if(err_1)
					throw err_1;
				else{
					var convos_sql = "SELECT id, convos FROM customers WHERE user_name = " + "'" + user_name + "'";
					var msg = "Now chatting with ";
					server_functions.convos_sql_query(user_name, convos_sql, res, recipient, msg, result.insertId, server_functions.recipients_sql_query, user_self, roomName);
					console.log(server_functions.active_users.length);
					for(i = 0; i < server_functions.active_users.length; i++){
						console.log("user_name: " + server_functions.active_users[i].user_name);
						if(server_functions.active_users[i].user_name === recipient_user_name){//TODO: check if this works
							io.to(server_functions.active_users[i].user_socket).emit('new_convo', user_self, "private", roomName);
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
	let user_name = req.body.user_name;
	console.log(current_user);
	res.render('search_results', {
		username: current_user,
		user_name: user_name,
		group_items: ["TXE", "Branch", "Class"], 
		individual_items: ["Mohan", "Caren", "Anne"],
		result: "Search for someone!"
	});
})

app.post('/gc_creation', (req, res, next)=>{
	let current_user = req.body.stored_user_name;//THIS is the user's first name
	let user_name = req.body.user_name;
	res.render('group_chat_creation', {
		username: current_user,
		user_name: user_name,
		group_items: ["TXE", "Branch", "Class"], 
		individual_items: ["Mohan", "Caren", "Anne"],
		result: "Search for the people you want to add to the group!"
	});
})

app.post('/new_gc', (req, res, next) => {
	server_functions.gc_creator(req, res, server_functions.loop_thru_gc_recipients_array);
})

//socket functionality, integrated from Anne's code
 var buffer1 = [];
 var buffer2 = [];

io.on('connection', function(socket){

	// console.log('a user connected');
	socket.on('chat message', function(time, user, msg, room, convo_type, date){
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
   			else{
   				var time = server_functions.return_time();
   				var update_sql = "UPDATE conversations SET time_stamp = '" + time + "' WHERE room_name = '" + room + "'";
   				con.query(update_sql, function(err, result){
   					if(err) throw err;
   				})
   			}
   		});
   		//TODO: look into buffer to store messages again
   		// if(room == "default")
   		// 	io.emit('chat message', message, room);
   		// else
   		console.log("Sending to : " + room);
   		io.sockets.in(room).emit('chat message', message, room, user, convo_type, date);
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

	socket.on('convo_revived', function(sender, receiver, message){
		var email_query = "SELECT email FROM customers WHERE firstName = '" + receiver + "'";
		con.query(email_query, function(err, result){
			if(err){
				console.log("error occurred.");
			}
			else{
				message = message.replace(/[']+/g, "\'");
				var mailOptions = {
				  from: 'thexperimentreminder@gmail.com',
				  to: result[0].email,
				  subject: sender + " just contacted you on TheNetwork",
				  html: '<!DOCTYPE html> <html> <body> <style> </style> <table style = "height: 100%; width: 100%; border-collapse: collapse; text-align: left; font-family: Verdana; font-size: 200%"> <tr> <th colspan = "4" style = "width: 25%; border-collapse: collapse; background-color: #ffe6e6; text-align: left; font-size: 100%;">' + sender + ' sent you a message:</th> </tr> <tr> <td style = "width: 25%; padding: 15px; border-collapse: collapse; background-color: #ffe6e6"></td> <td style = "width: 25%; border-collapse: collapse; background-color: #ffe6e6""></td> <td style = "width: 25%; padding: 15px; border-collapse: collapse; background-color: #ffe6e6"></td> <td style = "width: 25%; padding: 15px; border-collapse: collapse; background-color: #ffe6e6"></td> </tr> <tr> <td style = "width: 25%; padding: 15px; border-collapse: collapse; background-color: #ffe6e6"></td> <td colspan = "2" style = "width: 25%; background-color: skyblue; padding: 15px; border-collapse: collapse; font-family: Century Gothic">' + message + '</td> <td style = "width: 25%; padding: 15px; border-collapse: collapse; background-color: #ffe6e6"></td> </tr> <tr> <td style = "width: 25%; padding: 15px; border-collapse: collapse; background-color: #ffe6e6"></td> <td style = "width: 25%; background-color: #ffe6e6; padding: 15px; border-collapse: collapse;"></td> <td style = "width: 25%; background-color: #ffe6e6; padding: 15px; border-collapse: collapse;"></td> <td style = "width: 25%; padding: 15px; border-collapse: collapse; background-color: #ffe6e6"></td> </tr> <tr> <td style = "width: 25%; padding: 15px; border-collapse: collapse; background-color: #ffe6e6"></td> <td colspan = "2" style = "width: 25%; background-color: #ffe6e6; padding: 15px; border-collapse: collapse; text-align: center"><div style = "border: none; background-color: skyblue; width: 25%; font-size: 80%; margin: 0 auto"><a href = "https://thexperimentnetwork.herokuapp.com/" target = "_blank" style = "text-decoration: none">Reply</a></div></td> <td style = "width: 25%; padding: 15px; border-collapse: collapse; background-color: #ffe6e6"></td> </tr> </table> </body> </html>'
				  //TODO: update link from button
				}
				console.log(result[0].email);
				transporter.sendMail(mailOptions, function(error, info){
				  if (error) {
				    console.log(error);
				  } else {
				    console.log('Email sent: ' + info.response);
				  }
				});
			}
		})
	})


	socket.on('gc_revived', function(sender, receiver, message){
		//first, grab all names that are in the gc
		console.log(receiver + " group chat revived!");
		var name_query = "SELECT DISTINCT CASE WHEN person1 != '" + sender + "' AND person2 = '" + receiver + "' THEN person1 WHEN person1 = '" + receiver + "' AND person2 != '" + sender + "' THEN person2 END AS person FROM conversations ORDER BY person ASC";
		server_functions.gather_gc_names(sender, receiver, message, name_query, server_functions.retrieve_email);
	})
});

io.emit('some event', { for: 'everyone' });


