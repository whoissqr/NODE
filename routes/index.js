var express = require('express');
var query = require('pg-query');
var assert = require('assert');
var async = require('async');
var d3 = require('d3');
var url = require('url');
var queryString = require('querystring');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { title: 'Express@4.2.0' });
});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
		res.render('helloworld', { title: 'Hello, XAP!' })
});


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
router.get('/KYEC', function(req, res) {
		query.connectionParameters = 'postgres://MPRS_viewer:MPRS@172.22.150.178/dataloggerDB';      //connecting to xap-opsweb01
		var testers = new Array();	
		query('SELECT DISTINCT \"testerid\" AS tester from lotintro', function(err, rows, result) {
			assert.equal(rows, result.rows);
			for (var i = 0; i < rows.length; i++) {
				var testerName = rows[i].tester;
				if(testerName.match('KYEC*')) {
					if(testerName.search('XAP')!=-1) continue;  //filter out names like KYECXAP**; those are testing data;
										testers.push(testerName);
				}
			}
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


/* Display quantity tested per device id since 2011 using d3 */
/* The query will first select all lot records and their earliest test date (which is the 'P' insertion incoming material quantity);
   then use {lotid, lotstartdate} to retrieve all 1st insertion lot records, then add up lots per device;
   then return the 1st 20 device id which tops inocming material quantity;
 */
router.get('/d3t1', function(req, res) {
		query.connectionParameters = 'postgres://postgres:postgres@localhost/MPRS_report';      //connecting to localhost
		var deviceArray = new Array();
		var sqlstr =   'select distinct t1.device, sum(t1.qtyin) as totalQtyIn, sum(t1.qtyout) as qtyout, substr(device,3,1)'
							 +	'	from testtime as t1'
							 +	' inner join'
							 +	' ('
							 +	'	select min(startdt) as InitialDT, lotid from testtime group by lotid'
							 +	'	)t2'
							 +	'	on( t1.startdt=t2.InitialDT and t1.lotid=t2.lotid)'
							 +	'	where char_length(t1.device)>0'
							 +	'	group by t1.device'
							 +	'	order by totalQtyIn'
							 +	'	DESC limit 20';

    console.log('>' + sqlstr);
		query(sqlstr, function(err, rows, result) {
			assert.equal(rows, result.rows);
			for (var i = 0; i < rows.length; i++) {
				var device = {};
				device.name = rows[i].device;
				device.value = rows[i].qtyout;
				deviceArray.push(device);        
			}
			res.render('d3t1', {deviceArray:deviceArray});						
		});
});

/* Display the page to query test time */
router.get('/tt1', function(req, res) {
			query.connectionParameters = 'postgres://postgres:postgres@localhost/MPRS_report';      //connecting to localhost
			var packageArray = new Array();
			var devPkg = {};
			var pkgList = new Array();
			var sitesArray = new Array();
			var testgradeArray = new Array();
			var testgroupArray = new Array();

			async.parallel([ 
				function(callback) {
						var sqlstr = 'select DISTINCT device, package as pkg from testtime where char_length(device)>0 order by device';
						query(sqlstr, function(err, rows, result) {
							assert.equal(rows, result.rows);
							for (var i = 0; i < rows.length; i++) {  
								if(rows[i].device in devPkg)
									devPkg[rows[i].device].push(rows[i].pkg); 
								else 
									devPkg[rows[i].device] = new Array(rows[i].pkg);    
							}

							callback();
						});
				}, 
				function(callback) {
						var sqlstr = 'select DISTINCT package as pkg from testtime';
						query(sqlstr, function(err, rows, result) {
							assert.equal(rows, result.rows);
							for (var i = 0; i < rows.length; i++) {
								packageArray.push(rows[i].pkg);        
							}
							callback();
						});
				},
				function(callback) {
						var sqlstr = 'select DISTINCT actualnumofsites from testtime';
						query(sqlstr, function(err, rows, result) {
							assert.equal(rows, result.rows);
							for (var i = 0; i < rows.length; i++) {
								sitesArray.push(rows[i].actualnumofsites);        
							}
							callback();
						});
				},
				function(callback) {
						var sqlstr = 'select DISTINCT testgrade from testtime';
						query(sqlstr, function(err, rows, result) {
							assert.equal(rows, result.rows);
							for (var i = 0; i < rows.length; i++) {
								testgradeArray.push(rows[i].testgrade);        
							}
							callback();
						});

				},
				function(callback) {
						var sqlstr = 'select DISTINCT testgroup from testtime';
						query(sqlstr, function(err, rows, result) {
							assert.equal(rows, result.rows);
							for (var i = 0; i < rows.length; i++) {
								testgroupArray.push(rows[i].testgroup);        
							}
							callback();
						});
				}], 
				function(err, results) {
					if (err) {
							throw err;
					}
					packageArray.sort();
					sitesArray.sort();
					testgradeArray.sort();
					testgroupArray.sort();
					console.log('now all query done, yeah!');
					res.render('tt1', {devPkg:devPkg,packageArray:packageArray, sitesArray:sitesArray, testgradeArray:testgradeArray, testgroupArray:testgroupArray });								
				});
});

/* AJAX handler for test time query */
router.get('/queryTT', function(req, res) {

	var theUrl = url.parse( req.url );
	var queryObj = queryString.parse( theUrl.query );
	var params = JSON.parse( queryObj.jsonParams );

  query.connectionParameters = 'postgres://postgres:postgres@localhost/MPRS_report';      //connecting to localhost
  var sqlstr = 'select device, testprog, package as pkg, testgrade, testgroup, sum(qtyin) AS qtyin, sum(qtyout) qtyout, round(Avg(testtime)::numeric,2) as tt from testtime'
  						+' where device=\'' + params[0].value + '\''
							+ ( (params[1].value=='-')? '': 'and package=\'' + params[1].value + '\'')
							+ ( (params[2].value=='-')? '': 'and actualnumofsites=\'' + params[2].value + '\'')
							+ ( (params[3].value=='-')? '':' and testgrade=\'' + params[3].value + '\'')
							+ ( (params[4].value=='-')? '':' and testgroup=\'' + params[4].value + '\'')
							+' group by device,testprog, package, testgrade, testgroup';
							+' order by testprog, testgroup,package';
	//console.log(sqlstr);

	query(sqlstr, function(err, rows, result) {
			assert.equal(rows, result.rows);
			console.log(rows.length + " rows returned.");
			var responseHTML = '<table id="testTimeTable1"  class="display" cellspacing="0" width="100%">';
			responseHTML += '<thead>';
			responseHTML += '<tr>';
			responseHTML += '<th>device';
			responseHTML += '<th>testprog';
			responseHTML += '<th>package';
			responseHTML += '<th>testgrade';
			responseHTML += '<th>testgroup';
			responseHTML += '<th>qtyin';
			responseHTML += '<th>qtyout';
			responseHTML += '<th>test time';
			responseHTML += '</tr>';
			responseHTML += '</thead>';
			responseHTML += '<tfoot>';
			responseHTML += '<tr>';
			responseHTML += '<th>device';
			responseHTML += '<th>testprog';
			responseHTML += '<th>package';
			responseHTML += '<th>testgrade';
			responseHTML += '<th>testgroup';
			responseHTML += '<th>qtyin';
			responseHTML += '<th>qtyout';
			responseHTML += '<th>test time';
			responseHTML += '</tr>';
			responseHTML += '</tfoot>';
			responseHTML += '<tbody>';
			
			for (var i = 0; i < rows.length; i++) {   
			 	responseHTML += '<tr>';
			 	responseHTML += '<td>' + rows[i].device;
			 	responseHTML += '<td>' + rows[i].testprog;
			 	responseHTML += '<td>' + rows[i].pkg;
			 	responseHTML += '<td>' + rows[i].testgrade;
			 	responseHTML += '<td>' + rows[i].testgroup;
			 	responseHTML += '<td>' + rows[i].qtyin;
			 	responseHTML += '<td>' + rows[i].qtyout;
			 	responseHTML += '<td>' + rows[i].tt;   	
			 	responseHTML +='</tr>';
			}
			responseHTML += '</tbody>';
			responseHTML += '</table>';
			
			res.writeHead(200, {'content-type': 'text/html' });
			res.write(responseHTML);
			res.end('\n');						
	});
})
module.exports = router;