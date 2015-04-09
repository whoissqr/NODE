var config = require('../config.json');
var express = require('express');
var query = require('pg-query');
var assert = require('assert');
var async = require('async');
var url = require('url');
var queryString = require('querystring');
var _=require('lodash');
var router = express.Router();

var EventLogger = require('node-windows').EventLogger;
var log = new EventLogger({
	source: 'MPRS.Web',
	eventLog: 'Application'
});

/* AJAX handler for test time query */
router.get('/queryTT', function(req, res) {
	var theUrl = url.parse( req.url );
	var queryObj = queryString.parse( theUrl.query );
	var params = JSON.parse( queryObj.jsonParams );

	query.connectionParameters = config.reportConnStr;      //connecting to localhost
	var device, pkg, sites, grade, group;

	_.forEach(params, function(item){
			console.log(item.name);
			switch(item.name){
					 case 'device':  device = item.value;  break;
					 case 'package': pkg    = item.value;  break;
					 case 'sites':   sites  = item.value;  break;
					 case 'grade': 	 grade  = item.value;  break;
					 case 'group':   group  = item.value;  break;
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

module.exports = router;