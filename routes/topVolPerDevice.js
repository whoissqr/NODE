var config = require('../config.json');
var express = require('express');
var query = require('pg-query');
var assert = require('assert');
var async = require('async');
var url = require('url');
var queryString = require('querystring');

var router = express.Router();


/* Display quantity tested per device id since 2011 using d3 */
/* The query will first select all lot records and their earliest test date (which is the 'P' insertion incoming material quantity);
   then use {lotid, lotstartdate} to retrieve all 1st insertion lot records, then add up lots per device;
   then return the 1st 20 device id which tops inocming material quantity;
 */
router.get('/vol', function(req, res) {
		query.connectionParameters = config.reportConnStr;      //connecting to localhost
		var deviceArray = new Array();
		var sqlstr =   'select distinct t1.device, sum(t1.qtyin) as totalqtyin, sum(t1.qtyout) as totalqtyout'
							 +	'	from testtime as t1'
							 +	' inner join'
							 +	' ('
							 +	'	select min(startdt) as InitialDT, lotid from testtime group by lotid'
							 +	'	)t2'
							 +	'	on( t1.startdt=t2.InitialDT and t1.lotid=t2.lotid)'
							 +	'	where char_length(t1.device)>0'
							 +  ' and char_length(t1.lotid)=7'
							 +	'	group by t1.device'
							 +	'	order by totalQtyIn'
							 +	'	DESC limit 20';

    console.log('>' + sqlstr);
		query(sqlstr, function(err, rows, result) {
			assert.equal(rows, result.rows);
			for (var i = 0; i < rows.length; i++) {
				var device = {};
				device.name = rows[i].device;
				device.value = rows[i].totalqtyout;
				deviceArray.push(device);        
			}
			res.render('d3_vol', {deviceArray:deviceArray});						
		});
});

module.exports = router;