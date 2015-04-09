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

/* AJAX handler for test insertion history query */
router.get('/queryFTC', function(req, res) {

	var theUrl = url.parse( req.url );
	var queryObj = queryString.parse( theUrl.query );
	var params = JSON.parse( queryObj.jsonParams );

	query.connectionParameters = config.reportConnStr;     
	var sqlstr = 'select device, package AS pkg, lotid, scd, testgrade, min(startdt) AS startdt, max(enddt) AS enddt, string_agg(ftc, \'-\' order by startdt) AS ftcstr from testtime ';
	//console.log(params);
	_.forEach(params, function(item){
			switch(item.name){
					 case 'device': sqlstr +=  'where device=\'' + item.value+ '\' ';  break;

					 case 'package': if(item.value != '-')  sqlstr += 'and package=\'' + item.value+ '\' ';  break;

					 case 'grade': 	if(item.value != '-')  sqlstr += 'and lower(testgrade)=\'' + item.value.toLowerCase() + '\' ';  break;

					 case 'group':  if(item.value != '-')  sqlstr += 'and lower(testgroup)=\'' + item.value.toLowerCase() + '\' ';  break;

					 case 'tp':   if(item.value.indexOf('non-LV') !=-1)  sqlstr += ' and lower(testprog) not like \'%lv%\' '; 
												if(item.value.indexOf('only-LV') !=-1) sqlstr += ' and lower(testprog) like \'%lv%\' '; 
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
				_.forEach(ftcArray, function(el){
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

module.exports = router;