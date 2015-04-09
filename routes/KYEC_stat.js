var config = require('../config.json');
var express = require('express');
var query = require('pg-query');
var assert = require('assert');
var async = require('async');
var url = require('url');
var queryString = require('querystring');
var router = express.Router();
var lastE10stateArray = new Array();

var getLastE10Status = function(testerid, cb) { // called once for each project row	    
				query('SELECT * FROM e10state WHERE testerid=\''+testerid+'\' ORDER BY startdt DESC LIMIT 1', 
					function(err, rows, result) {
					if(err) return cb(err); // let Async know there was an error. Further processing will stop
					var lastE10state = {};
					var startdt = new Date(rows[0].startdt);
					var now = new Date();
					var timeDiff = (now - startdt)/1000;   //in sec
					timeDiff = Math.round(timeDiff/3600);  //in hours
					lastE10state["startdt"] = startdt.toISOString().slice(0,10).replace(/-/g,"");
					lastE10state["testername"] = testerid;
					lastE10state["hours_elapsed"] = timeDiff;
					lastE10state["category"] = rows[0].category;
					lastE10state["username"] = rows[0].username;
					lastE10state["reason1"] = rows[0].reason1;
					lastE10state["reason2"] = rows[0].reason2;
					lastE10stateArray.push(lastE10state);
					cb(null); // no error, continue with next projectRow, if any
				});
};

/* GET data from postgres page. */
router.get('/kyec', function(req, res) {
		query.connectionParameters = config.mprsConnStr;      //connecting to xap-opsweb01
		var testers = new Array();	
		query('SELECT DISTINCT \"testerid\" AS tester from lotintro where lotstartdt>\'2014-8-01\'', function(err, rows, result) {
			assert.equal(rows, result.rows);
			for (var i = 0; i < rows.length; i++) {
				var testerName = rows[i].tester;
				if(testerName.match('KYEC*')) {
					if(testerName.search('XAP')!=-1) continue;  //filter out names like KYECXAP**; those are testing data;
							testers.push(testerName);
				}
			}
			testers.sort();
			lastE10stateArray = new Array(); //to clear array upon page refresh
			async.each(testers, getLastE10Status, function(err) {
				if (err) return console.error(err);	   

				var lastE10state_93k = new Array();
				var lastE10state_t2k = new Array();
				for (var i = 0; i < lastE10stateArray.length; i++) {
					var testerName = lastE10stateArray[i].testername;
									if(testerName.search('93K')!=-1){
										lastE10state_93k.push(lastE10stateArray[i]);
									}else{
										lastE10state_t2k.push(lastE10stateArray[i]);
									}
				}       		        		        
				res.render('dal', {t2ktesters:lastE10state_t2k, v93ktesters:lastE10state_93k});	
			});
		});
});

module.exports = router;