var config = require('../config.json');
var express = require('express');
var query = require('pg-query');
var assert = require('assert');
var async = require('async');
var url = require('url');
var queryString = require('querystring');
var jQuery = require('jquery');
var $ = jQuery.create();
require('datejs');
var router = express.Router();

var EventLogger = require('node-windows').EventLogger;
var log = new EventLogger({
	source: 'MPRS.Web',
	eventLog: 'Application'
});

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { title: 'Express@4.2.0' });
});

/* AJAX handler for test time query */
router.get('/queryTT', function(req, res) {
	var theUrl = url.parse( req.url );
	var queryObj = queryString.parse( theUrl.query );
	var params = JSON.parse( queryObj.jsonParams );

	query.connectionParameters = config.reportConnStr;      //connecting to localhost
	var device, pkg, sites, grade, group;
	$.each(params, function(){
			switch(this.name){
					 case 'device':  device = this.value;  break;
					 case 'package': pkg    = this.value;  break;
					 case 'sites':   sites  = this.value;  break;
					 case 'grade': 	 grade  = this.value;  break;
					 case 'group':   group  = this.value;  break;
			}
	});				

	//select among those row whose test time falls within the 4 sigma envelope
	var sqlstr = 'select device, testprog, package as pkg, testgrade, testgroup, scd, temp, sum(qtyin) AS qtyin, sum(qtyout) qtyout, round((sum(qtyout*testtime)/sum(qtyout))::numeric,2)  as tt from testtime ';

	var whereCond = 'where device=\'' + device + '\' ';
	if(pkg!='-')   whereCond += 'and package=\'' + pkg + '\' ';
	if(sites!='-') whereCond += 'and actualnumofsites=\'' + sites + '\' ';
	if(grade!='-') whereCond += 'and lower(testgrade)=\'' + grade.toLowerCase() + '\' ';
	if(group!='-') whereCond += 'and lower(testgroup)=\'' + group.toLowerCase() + '\' ';

	sqlstr += whereCond;

	sqlstr +=' group by device,testprog, package, testgrade, testgroup, scd, temp';
	sqlstr +=' order by testprog, testgroup,package';

	console.log(sqlstr);

	query(sqlstr, function(err, rows, result) {
			assert.equal(rows, result.rows);
			console.log(rows.length + " rows returned.");
			var tableContent = {};
			if(rows.length==0) {
					res.json(tableContent);
					return;
			}
			
			var aaData = new Array();
			
			for (var i = 0; i < rows.length; i++) {   
				var rowArray = {};
				rowArray['device'] = rows[i].device;
				rowArray['testprog'] = rows[i].testprog;
				rowArray['package'] = rows[i].pkg;
				rowArray['testgrade'] = rows[i].testgrade;
				rowArray['testgroup'] = rows[i].testgroup;
				rowArray['SCD'] = rows[i].scd;
				rowArray['Temp'] = rows[i].temp;
				rowArray['qtyin'] = rows[i].qtyin;
				rowArray['qtyout'] = rows[i].qtyout;
				rowArray['testtime'] = rows[i].tt;
				aaData.push(rowArray);
			}
			tableContent['aaData'] = aaData;		
			res.json(tableContent);
	});
});

/* AJAX handler for test insertion history query */
router.get('/queryFTC', function(req, res) {

	var theUrl = url.parse( req.url );
	var queryObj = queryString.parse( theUrl.query );
	var params = JSON.parse( queryObj.jsonParams );

	query.connectionParameters = config.reportConnStr;     
	var sqlstr = 'select device, package AS pkg, lotid, scd, testgrade, min(startdt) AS startdt, max(enddt) AS enddt, string_agg(ftc, \'-\' order by startdt) AS ftcstr from testtime ';
	//console.log(params);
	$.each(params, function(){
			switch(this.name){
					 case 'device': sqlstr +=  'where device=\'' + this.value+ '\' ';  break;

					 case 'package': if(this.value != '-')  sqlstr += 'and package=\'' + this.value+ '\' ';  break;

					 case 'grade': 	if(this.value != '-')  sqlstr += 'and lower(testgrade)=\'' + this.value.toLowerCase() + '\' ';  break;

					 case 'group':  if(this.value != '-')  sqlstr += 'and lower(testgroup)=\'' + this.value.toLowerCase() + '\' ';  break;

					 case 'tp':   if(this.value.indexOf('non-LV') !=-1)  sqlstr += ' and lower(testprog) not like \'%lv%\' '; 
												if(this.value.indexOf('only-LV') !=-1) sqlstr += ' and lower(testprog) like \'%lv%\' '; 
												break;
			}
	});
	sqlstr += ' group by device, package, lotid, scd, testgrade order by min(startdt)';

	console.log(sqlstr);

	query(sqlstr, function(err, rows, result) {
			assert.equal(rows, result.rows);
			console.log(rows.length + " rows returned.");
			var tableContent = {};
			if(rows.length==0) {
					res.json(tableContent);
					return;
			}
			var aaData = new Array();
			
			for (var i = 0; i < rows.length; i++) {   
				var rowArray = {};
				rowArray['device'] = rows[i].device;
				rowArray['package'] = rows[i].pkg;
				rowArray['testgrade'] = rows[i].testgrade;
				rowArray['lotid'] = rows[i].lotid;
				//ftcstr = "SP-SR1-SR2-SQ-SQR1-SQR3"
				//ftc2 = "SP-SQ"
				var ftcArray = rows[i].ftcstr.toUpperCase().split("-");
				var ftc2="";

				$.each(ftcArray, function(i, el){
						if(el.indexOf("R")!=-1) return;   //remove retest ftc code
						var temp = el.replace(/[0-9]*$/, "");  
						var regex = new RegExp(temp+"$");
						if(!ftc2.substring(0,ftc2.length-1).match(regex))
						{
							ftc2+=temp;
							ftc2+="-";
						}
				});
				ftc2 = ftc2.slice(0, -1);
				//console.log(ftcArray + ":" + ftc2);
				rowArray['FTC-seq'] = ftc2;
				rowArray['scd'] = rows[i].scd;
				var monStart = rows[i].startdt.getMonth() +1; //since getMonth() is in [0-11] range
				rowArray['startDate'] = rows[i].startdt.getFullYear() +'-'+ monStart +'-'+ rows[i].startdt.getDate();
				var monEnd = rows[i].enddt.getMonth() +1;  //since getMonth() is in [0-11] range
				rowArray['endDate'] = rows[i].enddt.getFullYear() +'-'+  monEnd +'-'+  rows[i].enddt.getDate();
				aaData.push(rowArray);
			}
			tableContent['aaData'] = aaData;		
			res.json(tableContent);
	});
});

/* AJAX handler for universal query */
router.get('/universalQuery', function(req, res) {

	var theUrl = url.parse( req.url );
	var queryObj = queryString.parse( theUrl.query );
	var params = JSON.parse( queryObj.jsonParams );
			 
	console.log("params['type'] = " + params['type']);
	//console.log(params['testers']);
	//console.log(params['value']);
	
	
	switch(params['type']){
			 case 'lotid':	
						var sqlstr = 'select lotstartdt, ftc, lotid, deviceid, packageid, testprogname, testgrade, testgroup, temperature, testerid, handlerid, numofsite, masknum, soaktime, xamsqty, scd, speedgrade, loadboardid, checksum from lotintro';
						sqlstr +=  ' where UPPER(lotid)=\'' + params['value'] + '\'  order by lotstartdt';  
						getDataFromLotID(sqlstr, function(d) {
							res.json(d);
						});
						break;

			 case 'testerid': 
						var sqlstr = 'SELECT min(lotstartdt) AS lotstart, ftc, lotid, deviceid, packageid, handlerid, masknum, loadboardid, testerid from lotintro';
						sqlstr += ' where UPPER(testerid) =\'' + params['value'] + '\'';
						sqlstr += ' and lotstartdt>\'' + params['startDate'] + '\'';
						sqlstr += ' and lotstartdt<\'' + params['endDate'] + '\'';
						sqlstr += ' group by ftc, lotid, deviceid, packageid, handlerid, masknum, loadboardid, testerid order by min(lotstartdt) ASC';
						getDataFromTesterID(sqlstr, function(d) {
							res.json(d);
						});
						break;

			case 'handlerid':
						var sqlstr = 'SELECT min(lotstartdt) AS lotstart, lotid, xamsqty, handlerid, testerid, deviceid, packageid, masknum, loadboardid from lotintro';
						sqlstr += ' where UPPER(handlerid) =\'' + params['value'] + '\''; 			
						sqlstr += ' and lotstartdt>\'' + params['startDate'] + '\'';
						sqlstr += ' and lotstartdt<\'' + params['endDate'] + '\'';
						sqlstr += ' group by lotid, xamsqty, handlerid, testerid, deviceid, packageid, masknum, loadboardid order by min(lotstartdt) DESC';
						getDataFromHandlerID(sqlstr, function(d) {
							res.json(d);
						});
						break;

			 case 'deviceid':
						var sqlstr = 'select distinct testerid, min(lotstartdt) AS startdt, max(lotstartdt) AS enddt, sum(xamsqty) as qty, deviceid from lotintro';
						sqlstr += ' where UPPER(deviceid) =\'' + params['value'] + '\'';
						sqlstr += ' group by testerid, deviceid order by  startdt, testerid, deviceid';
						getDataFromDeviceID(sqlstr, function(d) {					
							res.json(d);
						});
						break;

			 case 'factory':
						getDataFromFactory(params['testers'], function(d) {
							res.json(d);
						});
						break;
			 case 'OEE':
			 			var osat = params['factory'];			
						getOEEData(osat, function(d) {
							res.json(d);
						});
						break;
			 case 'error':
						log.warn('Unrecognized user input: ' + params['value']);
						res.json(null);
						break;
	}
	
});

function getDataFromLotID(sqlstr, cb) {
		console.log(sqlstr);
		query.connectionParameters = config.mprsConnStr;
		query(sqlstr, function(err, rows, result) {
				assert.equal(rows, result.rows);
				console.log(rows.length + " rows returned.");
				var data = {};
				var lotinfo = {};
				if(rows.length==0) {
						cb(null);
				}
				var aaData = new Array();
				
				for (var i = 0; i < rows.length; i++) {

					if(rows[i].ftc.toUpperCase().indexOf('COR')!=-1)  continue;
					var rowArray = {};
					var monStart = rows[i].lotstartdt.getMonth() +1; //since getMonth() is in [0-11] range
					rowArray['lotstartdt'] = rows[i].lotstartdt.toString("MMM dd HH:mm");
					lotinfo['lotid'] = rows[i].lotid;
					lotinfo['deviceid'] = rows[i].deviceid;
					lotinfo['packageid'] = rows[i].packageid;
					lotinfo['testgrade'] = rows[i].testgrade;

					rowArray['ftc'] = rows[i].ftc;
					rowArray['testprogname'] = rows[i].testprogname;
					rowArray['testgroup'] = rows[i].testgroup;
					rowArray['temperature'] = rows[i].temperature;

					var rawTesterID = rows[i].testerid.toUpperCase();
					if(rawTesterID.indexOf('KYEC')!=-1){
						rowArray['testerid'] = rows[i].testerid.substring(4, rows[i].testerid.length);
						lotinfo['factory'] = 'KYEC';
					}else if(rawTesterID.indexOf('XAP')!=-1){
						rowArray['testerid'] = rows[i].testerid;
						lotinfo['factory'] = 'XAP';
					}else if(rawTesterID.charAt(0)=='T'){
						rowArray['testerid'] = rows[i].testerid;
						lotinfo['factory'] = 'SPIL';
					}else {
						rowArray['testerid'] = rows[i].testerid;
						lotinfo['factory'] = 'ATK';
					}

					rowArray['handlerid'] = rows[i].handlerid;
					rowArray['numofsite'] = rows[i].numofsite;
					rowArray['masknum'] = rows[i].masknum;
					rowArray['soaktime'] = rows[i].soaktime;
					rowArray['xamsqty'] = rows[i].xamsqty;
					rowArray['scd'] = rows[i].scd;
					rowArray['speedgrade'] = rows[i].speedgrade;
					rowArray['loadboardid'] = rows[i].loadboardid;
					rowArray['checksum'] = rows[i].checksum;
				
					aaData.push(rowArray);
				}
				data['aaData'] = aaData;	
				data['lotinfo']	= lotinfo;
				cb(data);
		});
}

function getDataFromTesterID(sqlstr, cb) {
		console.log(sqlstr);
		query.connectionParameters = config.mprsConnStr;
		query(sqlstr, function(err, rows, result) {
				assert.equal(rows, result.rows);
				console.log(rows.length + " rows returned.");
				var data = {};
				var lotinfo = {};
				if(rows.length==0) {
						cb(null);
				}
				var aaData = new Array();
				
				for (var i = 0; i < rows.length; i++) {
					var rowArray = {};					
					rowArray['lotstartdt'] = rows[i].lotstart.toString("MMM dd HH:mm");
					rowArray['lotid'] = rows[i].lotid;
					rowArray['deviceid'] = rows[i].deviceid;
					rowArray['packageid'] = rows[i].packageid;

					var rawTesterID = rows[i].testerid.toUpperCase();
					if(rawTesterID.indexOf('KYEC')!=-1){
						rowArray['testerid'] = rows[i].testerid.substring(4, rows[i].testerid.length);
						lotinfo['factory'] = 'KYEC';
					}else if(rawTesterID.indexOf('XAP')!=-1){
						rowArray['testerid'] = rows[i].testerid;
						lotinfo['factory'] = 'XAP';
					}else if(rawTesterID.charAt(0)=='T'){
						rowArray['testerid'] = rows[i].testerid;
						lotinfo['factory'] = 'SPIL';
					}else {
						rowArray['testerid'] = rows[i].testerid;
						lotinfo['factory'] = 'ATK';
					}
					lotinfo['testerid'] = rowArray['testerid'];

					rowArray['handlerid'] = rows[i].handlerid;
					rowArray['masknum'] = rows[i].masknum;
					rowArray['loadboardid'] = rows[i].loadboardid;
					rowArray['ftc'] = rows[i].ftc;

				
					aaData.push(rowArray);
				}
				data['aaData'] = aaData;	
				data['lotinfo']	= lotinfo;
				cb(data);
		});
}

function getDataFromHandlerID(sqlstr, cb) {
		console.log(sqlstr);
		query.connectionParameters = config.mprsConnStr;
		query(sqlstr, function(err, rows, result) {
				assert.equal(rows, result.rows);
				console.log(rows.length + " rows returned.");
				var data = {};
				var lotinfo = {};
				if(rows.length==0) {
						cb(null);
				}
				var aaData = new Array();
				
				for (var i = 0; i < rows.length; i++) {
					var rowArray = {};					
					rowArray['lotstartdt'] = rows[i].lotstart.toString("MMM dd HH:mm");

					rowArray['lotid'] = rows[i].lotid;
					rowArray['deviceid'] = rows[i].deviceid;
					rowArray['packageid'] = rows[i].packageid;
					rowArray['handlerid'] = rows[i].handlerid;
					rowArray['qty'] = rows[i].xamsqty;

					var rawTesterID = rows[i].testerid.toUpperCase();
					if(rawTesterID.indexOf('KYEC')!=-1){
						rowArray['testerid'] = rows[i].testerid.substring(4, rows[i].testerid.length);
					}else{
						rowArray['testerid'] = rows[i].testerid;
					}
					rowArray['masknum'] = rows[i].masknum;
					rowArray['loadboardid'] = rows[i].loadboardid;

					lotinfo['handlerid'] = rows[i].handlerid;
					aaData.push(rowArray);
				}
				data['aaData'] = aaData;	
				data['lotinfo']	= lotinfo;
				cb(data);
		});
}

function getDataFromDeviceID(sqlstr, cb) {
		console.log(sqlstr);
		query.connectionParameters = config.mprsConnStr;
		query(sqlstr, function(err, rows, result) {
				assert.equal(rows, result.rows);
				console.log(rows.length + " rows returned.");
				var data = {};
				var lotinfo = {};
				if(rows.length==0) {
						cb(null);
				}
				var aaData = new Array();
				
				for (var i = 0; i < rows.length; i++) {
					var rowArray = {};
					rowArray['startDt'] = rows[i].startdt.toString("MMM dd HH:mm");

					var monEnd = rows[i].enddt.getMonth() +1; //since getMonth() is in [0-11] range
					rowArray['endDt'] = rows[i].enddt.toString("MMM dd HH:mm");					

					var rawTesterID = rows[i].testerid.toUpperCase();
					if(rawTesterID.indexOf('KYEC')!=-1){
						rowArray['testerid'] = rows[i].testerid.substring(4, rows[i].testerid.length);
					}else{
						rowArray['testerid'] = rows[i].testerid;
					}

					rowArray['qty'] = rows[i].qty;
					lotinfo['deviceid'] = rows[i].deviceid;

					aaData.push(rowArray);
				}
				data['aaData'] = aaData;	
				data['lotinfo']	= lotinfo;
				cb(data);
		});
}

function getDataFromFactory(testers, cb) {
		var data = {};
		testers.sort();
		lastE10stateArray = new Array(); //to clear array upon page refresh
		async.each(testers, getLastE10Status, function(err) {
			if (err) return console.error(err);	   
			data['aaData'] = lastE10stateArray;	
			cb(data);
		});
}

function getOEEData(osat, cb){
		var oeeData = {};
		var resultA;
		var resultB;

		query.connectionParameters = config.reportConnStr;
		async.parallel([ 
				function(callback) {						
						var sqlstrA = 'SELECT ww, platform, ';
						sqlstrA += ' unnest(array[\'earnhour\', \'mfghour\', \'rthour\',\'verifyhour\', \'qcehour\', \'setup\', \'down\', \'pm\', \'others\', \'mte\',\'pte\', \'idle\', \'shutdown\', \'unknown\', \'xoee\']) AS \"category\",';
						sqlstrA += ' unnest(array[earnhour, mfghour, rthour,verifyhour, qcehour, setup, down, pm, others, mte,pte, idle, shutdown, unknown, xoee]) AS \"hours\"';
						sqlstrA += ' from oee where osat=\'' + osat + '\' and years=\'2015\'';

						//console.log('sqlstrA = ' + sqlstrA);

						query(sqlstrA, function(err, rows, result) {
								assert.equal(rows, result.rows);
								console.log(rows.length + " rows returned.");
								if(rows.length==0) {
										cb(null);
								}
								resultA = JSON.stringify(result.rows);
								callback();
						});
				},

				function(callback) {
						var sqlstrB = 'select ww, platform, earnhour, rthour, verifyhour, qcehour, setup, down, pm, others, mte,pte, idle, shutdown, unknown, xoee';
						sqlstrB += ' from oee where osat=\'' + osat + '\' and years=\'2015\'';

						//console.log('sqlstrB = ' + sqlstrB);

						query(sqlstrB, function(err, rows, result) {
								assert.equal(rows, result.rows);
								console.log(rows.length + " rows returned.");
								if(rows.length==0) {
										cb(null);
								}
								resultB = JSON.stringify(result.rows);
								callback();
						});
				}],

				function(err, results) {
					if (err) {
							throw err;
					}
					oeeData['forGraph'] = resultA;
					oeeData['forTable'] = resultB;
					cb(oeeData);					
				});
}

var lastE10stateArray = new Array();

var getLastE10Status = function(testerid, cb) { // called once for each project row	    
				query.connectionParameters = config.mprsConnStr;
				query('SELECT * FROM e10state WHERE testerid=\''+testerid+'\' ORDER BY startdt DESC LIMIT 1', 
					function(err, rows, result) {
							if(err) return cb(err); // let Async know there was an error. Further processing will stop
							console.log(rows.length + " rows returned.");
							var lastE10state = {};
							var startdt = new Date(rows[0].startdt);
							var now = new Date();
							var timeDiff = (now - startdt)/1000;   //in sec
							timeDiff = Math.round(timeDiff/3600);  //in hours
							lastE10state["startdt"] = startdt.toISOString().slice(0,10).replace(/-/g,"");
							if(testerid.indexOf('KYEC')!=-1){
									lastE10state['testername'] = testerid.substring(4, testerid.length);
							}else{
									lastE10state['testername'] = testerid;
							}
							lastE10state["hours_elapsed"] = timeDiff;

							var reason1 = rows[0].reason1;
							var reason2 = rows[0].reason2;
							if(reason1=='none') reason1 = '';
							if(reason2=='none') reason2 = '';
							if(rows[0].category.indexOf('Productive')==0) { reason1=''; reason2='';}
							if((reason1.length + reason2.length)==0)
									lastE10state["category"] = rows[0].category;
							else 
									lastE10state["category"] = rows[0].category +' (' + reason1 + ' '+ reason2 + ')';

							lastE10state["username"] = rows[0].username;
							
							//then get lotid, deviceid, handlerid, masknum, loadboard from lotintro table
							var sqlstr = 'SELECT lotstartdt, lotid, deviceid, packageid, handlerid, masknum, loadboardid, testerid from lotintro'
									sqlstr += ' where testerid = \''+testerid+'\'';
									sqlstr += ' order by lotstartdt DESC LIMIT 1';
							console.log(sqlstr);
							query(sqlstr, function(err, rows, result) {
									if(err) return cb(err); // let Async know there was an error. Further processing will stop
									assert.equal(rows, result.rows);
									console.log(rows.length + " rows returned.");
									lastE10state["deviceid"]  = rows[0].deviceid;
									lastE10state["packageid"] = rows[0].packageid;
									lastE10state["handlerid"] = rows[0].handlerid;
									lastE10state["loadboardid"]	= rows[0].loadboardid;
									lastE10state["masknum"]			= rows[0].masknum;
									lastE10stateArray.push(lastE10state);
									cb(null);
							});					
							 // no error, continue with next projectRow, if any
				});
};

module.exports = router;