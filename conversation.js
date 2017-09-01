let nextMsgId = 0;
let conversation = {
	"messages": []
}

function addMessage(item, user){
	let d = new Date();
	current_hour = d.getHours();
	current_minute = d.getMinutes();
	if(current_minute<10)
		current_minute = '0'+current_minute;
	if(current_hour<10)
		current_hour = '0'+current_hour;
	let time = current_hour+':'+current_minute;
	conversation.messages.push({timestamp: time, value: item, name: user});
}

function getConversation(){
	return conversation;
}
module.exports = {
	addMessage: addMessage, 
	getConversation: getConversation
};

