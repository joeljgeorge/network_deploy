// var mysql = require('mysql');
var active_users = [];
// var server = require('http').Server(app);
// var io = require('socket.io')(server);
// var con = mysql.createConnection({
// 	host: "localhost",
// 	user: "jgeorge",
// 	password: "thexperiment123!!",
// 	database: "acme"
// });
// var nodemailer = require('nodemailer');
// var transporter = nodemailer.createTransport({
// 	 service: 'gmail',
// 	 auth: {
// 	    user: 'thexperimentreminder@gmail.com',
// 	    pass: 'redeemed123!!'
// 	 }
// });
//TODO: remove all references to id (in regards to building room names made unique through id)
function return_time(){
		var date = new Date();
		var month = date.getMonth();
		var day = date.getDate();
		var year = date.getFullYear();
   		var hour = date.getHours();
   		var minutes = date.getMinutes();
   		var seconds = date.getSeconds();
   		if(hour < 10){
   			date = '0' + date;
   		}
   		if(minutes < 10){
   			minutes = '0' + minutes;
   		}
   		if(seconds < 10){
   			seconds = '0' + seconds;
   		}
   		if(month < 10){
   			month++;
   			month = '0' + month;
   		}
   		if(day < 10){
   			day = '0' + day;
   		}
   		return (year + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' + seconds);
}

function render_home_page(user, res, recipients, contact_value, msg, convo_id, firstName, roomName){//TODO: remove user from function calls AND remove convo_id from function headers and wherever any of these functions are called
	console.log('test_3');
	recipients.sort(function(x, y){
		x_date = x.time_stamp;
		y_date = y.time_stamp;
		console.log(x_date - y_date);
		return y_date - x_date;
	});
	console.log(recipients);
	if(user == contact_value){
		console.log('yas: ' + user);
		res.render('home_page', {
			message: msg + firstName,
			name: firstName,//assigns handlebars variable name the value of variable user
			active_convos: recipients, //assings handlebars variable group_items this array, TODO: Dynamically update groups
			contact: firstName,
			room: roomName,
			user_name: user,
			convo_id: null
		});
	}
	else{
		console.log('nas: ' + user);
		res.render('home_page', {
			message: msg + contact_value,
			name: firstName,//assigns handlebars variable name the value of variable user
			active_convos: recipients, //assings handlebars variable group_items this array, TODO: Dynamically update groups
			contact: contact_value,
			room: roomName,
			user_name: user,
			convo_id: convo_id
		});
	}

}

function recipients_sql_query(user, recipient_sql, loop_val, recipients, res, array_size, contact, msg, convo_id, firstName, roomName){
	con.query(recipient_sql, function(err_3, result_3, fields_3){
	if(err_3)
		throw err_3;
	else{
		console.log(result_3);//TODO: obtain person1 and person2 from list, push whichever is NOT current user onto the array
		var person1 = result_3[0].person1;
		var person2 = result_3[0].person2;
		var convo_type = result_3[0].convo_type;
		var room_name = result_3[0].room_name;
		var time_stamp = new Date(result_3[0].time_stamp);
		var person_convo_1 = {name: person1, convo_type: convo_type, time_stamp: time_stamp, room_name: room_name};
		var person_convo_2 = {name: person2, convo_type: convo_type, time_stamp: time_stamp, room_name: room_name};
		if(person1 != firstName)
			recipients.push(person_convo_1);
		else
			recipients.push(person_convo_2);
		if(loop_val == (array_size - 1))
		{
			render_home_page(user, res, recipients, contact, msg, convo_id, firstName, roomName);
		}
		}
	})
	
}

function convos_sql_query(user, sql, res, contact, msg, convo_id, callback, firstName, roomName){
	con.query(sql, function(err_2, result_2, fields_2){
		console.log(user);
		if(err_2)
				throw err_2;
			else if(result_2[0].convos == null){
				console.log("convos: " + result_2[0].convos);
				res.render('home_page', {
					message: "Welcome, " + firstName,
					name: firstName,//assigns handlebars variable name the value of variable user
					no_active_convos: "No active conversations",
					contact: firstName,
					user_name: user,
					convo_id: null
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
						var recipient_sql = "SELECT person1, person2, convo_type, time_stamp, room_name FROM conversations WHERE id = " + parsable_convo_ids[i];
						console.log(recipient_sql);
						callback(user, recipient_sql, i, recipients, res, length, contact, msg, convo_id, firstName, roomName);
					}
				}
				}
			})
}

function password_sql_query(sql, user, password, convos_sql_entry, recipients_sql_function, res, contact, msg, convo_id, callback, roomName)
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
				var firstName = result_1[0].firstName;
				console.log('first name: ' + firstName);
				callback(user, convos_sql_entry, res, contact, msg, convo_id, recipients_sql_function, firstName, roomName);
			}
		})
}

function loop_thru_gc_recipients_array(array, group_name, res, callback){
		for(var i = 0; i < array.length - 1; i++){
			var user_name = array[i].user_name;
			var firstName = array[i].name;
			callback(user_name, group_name, i, res, array, firstName);
		}
		conversation_increment++;
}

function update_db_convos(user_name, group_name, loop_val, res, array, firstName){
		var time = "1969-08-24 20:29:5";//TODO: change creation time to 1969 so email notifcation is triggered
		var incremented_group_name = group_name + conversation_increment;
		var insert_sql = "INSERT INTO conversations VALUES ('NULL', " + "'" + firstName + "', " + "'" + group_name + "', " + "'" + incremented_group_name + "', 'group', '" + time + "')"; 
		console.log(insert_sql);
		con.query(insert_sql, function(err, result){
		if(err)
			throw err;
		else{
			var id_append_sql = "UPDATE customers SET convos = CONCAT(IFNULL(convos, ''), ' ', " + "'" + result.insertId + "')" + " WHERE user_name = " + "'" + user_name + "'";
			con.query(id_append_sql, function(err_1, result_1){
				if(err_1)
					throw err_1;//TODO: ask user to enter new gc name is one is already in the database
				else if(loop_val == array.length - 2){
					render_home_from_search(array[0].user_name, res, group_name, array, array[0].name, incremented_group_name);
				}
			})
		}
		})

}

function render_home_from_search(user_name, res, group_name, array, firstName, roomName){
		var convos_sql = "SELECT id, convos FROM customers WHERE user_name = " + "'" + user_name + "'";
		var msg = "Now chatting with group ";
		convos_sql_query(user_name, convos_sql, res, group_name, msg, 1, recipients_sql_query, firstName, roomName);
		for(var j = 1; j < array.length - 1; j++ ){
			var gc_recipient = array[j].user_name;
			for(var i = 0; i < active_users.length; i++){
				if(active_users[i].user_name === gc_recipient){
					io.to(active_users[i].user_socket).emit('new_convo', group_name, "group", roomName);
					break;
				}
			}
		}
}

function gc_creator(req, res, callback){
		// console.log(JSON.parse(req.body.gc_real_submission_value));
		var array = JSON.parse(JSON.parse(req.body.gc_real_submission_value).group_chat);
		var group_name = array[array.length - 1].name;
		loop_thru_gc_recipients_array(array, group_name, res, update_db_convos);
}

function retrieve_email(name, recipient_emails, i, array_length, message, receiver, sender){
		var email_query = "SELECT email FROM customers WHERE firstName = '" + name + "'";
		console.log(i + ', ' + array_length);
		con.query(email_query, function(err, result){
			if(err) throw err;
			else{
				recipient_emails.push(result[0].email);
				if(i == array_length - 1){
					recipient_emails = recipient_emails.map(function(e){
						return JSON.stringify(e);
					})
					recipient_emails = recipient_emails.join(", ");
					message = message.replace(/[']+/g, "\'");
					var mailOptions = {
					  from: 'thexperimentreminder@gmail.com',
					  to: recipient_emails,
					  subject: sender + " just contacted you on TheNetwork",
					  html: '<!DOCTYPE html> <html> <body> <style> </style> <table style = "height: 100%; width: 100%; border-collapse: collapse; text-align: left; font-family: Verdana; font-size: 200%"> <tr> <th colspan = "4" style = "width: 25%; border-collapse: collapse; background-color: #ffe6e6; text-align: left; font-size: 100%;">' + sender + ' sent the group chat "' + receiver + '" a message:</th> </tr> <tr> <td style = "width: 25%; padding: 15px; border-collapse: collapse; background-color: #ffe6e6"></td> <td style = "width: 25%; border-collapse: collapse; background-color: #ffe6e6""></td> <td style = "width: 25%; padding: 15px; border-collapse: collapse; background-color: #ffe6e6"></td> <td style = "width: 25%; padding: 15px; border-collapse: collapse; background-color: #ffe6e6"></td> </tr> <tr> <td style = "width: 25%; padding: 15px; border-collapse: collapse; background-color: #ffe6e6"></td> <td colspan = "2" style = "width: 25%; background-color: skyblue; padding: 15px; border-collapse: collapse; font-family: Century Gothic">' + message + '</td> <td style = "width: 25%; padding: 15px; border-collapse: collapse; background-color: #ffe6e6"></td> </tr> <tr> <td style = "width: 25%; padding: 15px; border-collapse: collapse; background-color: #ffe6e6"></td> <td style = "width: 25%; background-color: skyblue; padding: 15px; border-collapse: collapse;"></td> <td style = "width: 25%; background-color: skyblue; padding: 15px; border-collapse: collapse;"></td> <td style = "width: 25%; padding: 15px; border-collapse: collapse; background-color: #ffe6e6"></td> </tr> <tr> <td style = "width: 25%; padding: 15px; border-collapse: collapse; background-color: #ffe6e6"></td> <td colspan = "2" style = "width: 25%; background-color: #ffe6e6; padding: 15px; border-collapse: collapse; text-align: center"><div style = "border: none; background-color: skyblue; width: 25%; font-size: 80%; margin: 0 auto"><a href = "https://thexperimentnetwork.herokuapp.com/" target = "_blank" style = "text-decoration: none">Reply</a></div></td> <td style = "width: 25%; padding: 15px; border-collapse: collapse; background-color: #ffe6e6"></td> </tr> </table> </body> </html>'
					  //TODO: update link from button
					}
					transporter.sendMail(mailOptions, function(error, info){
					  if (error) {
					    console.log(error);
					  } else {
					    console.log('Email sent: ' + info.response);
					  }
					});
				}
			}
		})
	}

function gather_gc_names(sender, receiver, message, name_query, callback){
	var recipient_emails = [];
	con.query(name_query, function(err, result){
		if(err) throw err;
		else{
			for(var i = 0; i < result.length; i++){
				console.log(result[i].person);
				if(result[i].person != null){
					callback(result[i].person, recipient_emails, i, result.length, message, receiver, sender); //TODO: inefficient to keep sending message each iteration
				}
			}
		}
	})
}

module.exports = {
	render_home_page: render_home_page,
	recipients_sql_query: recipients_sql_query,
	convos_sql_query: convos_sql_query,
	password_sql_query: password_sql_query,
	loop_thru_gc_recipients_array: loop_thru_gc_recipients_array,
	update_db_convos: update_db_convos,
	gc_creator: gc_creator,
	active_users: active_users,
	return_time: return_time,
	gather_gc_names: gather_gc_names,
	retrieve_email: retrieve_email
}