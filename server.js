const express = require('express');
const app = express();

const root = __dirname + '/public/';
app.use(express.static('public'));

app.get('/', function(req, res){
	let options = {
		root: root,
	}
	res.sendFile('login.html', options, function(err){
		if(err){
			console.log('Error');
		}
	})
});

app.get('/main-page', function(req, res){
	let options = {
		root: root,
	}
	res.sendFile('main-page.html', options, function(err){
		if(err){
			console.log('Error');
		}
	})
});

app.get('/fight-page', function(req, res){
	let options = {
		root: root,
	}
	res.sendFile('fight-page.html', options, function(err){
		if(err){
			console.log('Error');
		}
	})
});

const port = process.env.PORT || 3000;

app.listen(port,'192.168.0.102', function(){
	console.log('Server is running on port ' + port);
});