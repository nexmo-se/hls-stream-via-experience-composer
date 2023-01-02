//create a session
var apiKey = '';
var sessionId = '';
var token = '';
var session = '';
//connect to a session

//publish our stream
var publisher = OT.initPublisher('publisher', {
	insertMode: 'append',
	width: '100%',
	height: '100%',
	resolution: "640x480"
});

function startSession(sessionId, token, apiKey) {
	var deferred = new $.Deferred();
	session = OT.initSession(apiKey, sessionId);
	session.connect(token, function (err) {
		if (err) {
			console.log(err);
			deferred.resolve(false);
		} else {
			session.publish(publisher);
			deferred.resolve(true);
			//subscribe to other's stream
			session.on('streamCreated', function (event) {
				var subscriber = session.subscribe(event.stream, 'subscriber', {
					insertMode: 'append',
				});
			});
			session.on('streamCreated', function (event) {
				session.subscribe(
					event.stream,
					'subscriber',
					{
						insertMode: 'append',
						width: '100%',
						height: '100%',
					},
					handleError
				);
			});
		}
	});
	return deferred.promise();
}
try {
} catch (e) {
	console.log('No session yet');
}