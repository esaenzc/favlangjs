'use strict'

const gitHubUrl = 'api.github.com';
const https = require('https');
const async = require('async');
var response;

/**
 * Controller
 *
 * This app is a single layered solution with a fat controller.
 * Improvement: Inject a service layer and implement there the bussines logic.
 * Uncouple the code with Promises (https://www.npmjs.com/package/promise)
 */

module.exports = {
main: function(req, res) {
		response = res;
		var username = req.query.username;

		if(validateWord(username)) {
			findUserRepositories(username);
		} else {
			viewLangs([],username,'Username not valid');
		}
	}
}

/**
 * View
 */
function viewLangs (langs,username,error) {
	try {
		return response.render('index',{'username':username, 'langs': JSON.stringify(langs), 'error': error});
	} catch (e) {
		// Should implement a better treatment
		console.log(e);
	}
}

/**
 * Find User Repositories
 */
function findUserRepositories (username) {
	var options = setOptions(gitHubUrl, '/users/' + username + '/repos', username);
	callHTTPSRequest(options, findUserRepositoriesCb);
}

/**
 * Find User Repositories Callback
 */
function findUserRepositoriesCb (response,username) {
	var names = [];
	for(var i = 0; i < response.length; i++) {
		names.push(response[i].name);
	}
	findUserLanguages(names,username);
}

/**
 * Find User Languages from a list of a repository
 */
function findUserLanguages (repos,username) {
	var langs = [];

	// Several async http calls to get from each repository it programming languages
	async.each(repos,function(repo,callback) {

			var options = setOptions(gitHubUrl, '/repos/' + username + '/' + repo + '/languages', username);

			https.request(options, function(res) {
						res.setEncoding('utf8');

						var body = '';

						res.on('data', function (data) {
							body += data;

						});

						res.on('end', function() {
							var response = JSON.parse(body);
							// Callback function
							langs.push(response);
							callback();
						});
			}).end();

	},function (err) {findUserLanguagesCallback(langs,username)});

}

/**
 * Find User Languages Callback
 */
function findUserLanguagesCallback (response,username) {
	var langs = [];

	for(var attributename in response){
		var object = response[attributename];
		for(var name in object){

			// Find if language is already inserted in the array
			var pos = langs.findIndex(object => object.name === name)

			if(pos === -1) {
				langs.push({'name': name, 'lines': object[name]});
			} else {
				var codeLines = langs[pos].lines + object[name];
				langs.splice(pos, 1);
				langs.push({'name': name, 'lines': codeLines});
			}
		}
	}

	// Sort the list by coded lines
	langs.sort(function(a, b){
	  return a.lines < b.lines;
	});
	viewLangs(langs,username);
}

/*
 * HTTPS Request options settings
 */
function setOptions (url,path,username) {
	var auth = 'testgithubpua:test325';
	var base64enc = new Buffer(auth).toString('base64');

	var options = {
		host: url,
		path: path,
		method: 'GET',
		headers: {'User-Agent':'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)','Authorization': 'Basic ' + base64enc},
		username: username
	};
	return options;
}

/*
 * HTTPS Request
 */
function callHTTPSRequest (options,callback) {

	https.request(options, function(res) {
		res.setEncoding('utf8');

		var body = '';

		res.on('data', function (data) {
			body += data;

		});

		res.on('end', function() {
			var response = JSON.parse(body);
			// Callback function
			if (typeof callback === "function") {
				// Call it since is callable
				callback(response,options.username);
			}
    	});
	}).end();
}

/*
 * Validation
 */
function validateWord (str) {
	var pattern = new RegExp("^[A-Za-z0-9]+$");
	return pattern.test(str);
}