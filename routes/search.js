var config = require('../config.json');
var express = require('express');
var queryRpt = require('pg-query');
var queryMPRS = require('pg-query');
var assert = require('assert');
var async = require('async');
var url = require('url');
var queryString = require('querystring');
var jQuery = require('jquery');
var $ = jQuery.create();
var router = express.Router();
var _=require('lodash');

var today = new Date();
var SevenDaysAgo = new Date(today -  1000 * 60 * 60 * 24 * 7); //Date is in millisecs;
var dateStr = SevenDaysAgo.toISOString().slice(0, 19).replace('T', ' ');

/* Display the page to query test time */
router.get('/', function(req, res) {
			queryMPRS.connectionParameters = config.mprsConnStr;      //connecting to localhost
			//queryRpt.connectionParameters = config.reportConnStr;
			var recentLotArray = new Array();
			var testerArray = new Array();
			var handlerArray = new Array();
			var deviceArray = new Array();

			async.parallel([ 
				function(callback) {						
						var sqlstr = 'select distinct lotid from lotintro where lotstartdt >\'';
								sqlstr += dateStr;
								sqlstr += '\' and char_length(lotid)=7';
						console.log(sqlstr);
						queryMPRS(sqlstr, function(err, rows, result) {
							assert.equal(rows, result.rows);
							for (var i = 0; i < rows.length; i++) {
								recentLotArray.push(rows[i].lotid.toUpperCase());        
							}
							recentLotArray=_.uniq(recentLotArray);
							callback();
						});
				},

				function(callback) {
						var sqlstr = 'select distinct handlerid from lotintro where lotstartdt >\'';
								sqlstr += dateStr;
								sqlstr += '\' and char_length(lotid)=7';
						console.log(sqlstr);
						queryMPRS(sqlstr, function(err, rows, result) {
							assert.equal(rows, result.rows);
							for (var i = 0; i < rows.length; i++) {
								handlerArray.push(rows[i].handlerid.toUpperCase());        
							}
							handlerArray=_.uniq(handlerArray);
							callback();
						});
				},

				function(callback) {
						var sqlstr = 'select distinct deviceid from lotintro';
						console.log(sqlstr);
						queryMPRS(sqlstr, function(err, rows, result) {
							assert.equal(rows, result.rows);
							for (var i = 0; i < rows.length; i++) {
								var str = rows[i].deviceid.toUpperCase();
								var regex = /^[A-Za-z0-9]+$/;
								if(!regex.test(str)) { continue; }
								deviceArray.push(str);        
							}
							deviceArray=_.uniq(deviceArray);
							callback();
						});
				},

				function(callback) {						
						var sqlstr = 'select distinct testerid from lotintro where lotstartdt >\'';
								sqlstr += dateStr + '\'';
	
						console.log(sqlstr);
						queryMPRS(sqlstr, function(err, rows, result) {
							assert.equal(rows, result.rows);
							for (var i = 0; i < rows.length; i++) {
								testerArray.push(rows[i].testerid.toUpperCase());        
							}
							testerArray=_.uniq(testerArray);
							callback();
						});
				}],

				function(err, results) {
					if (err) {
							throw err;
					}
					recentLotArray.sort();
					console.log('prefetched dev and pkg...');
					res.render('search', {testerArray:testerArray, 
																handlerArray:handlerArray, 
																deviceArray:deviceArray, 
																recentLotArray:recentLotArray
																});								
				});
});

module.exports = router;