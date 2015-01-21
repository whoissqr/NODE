var config = require('../config.json');
var express = require('express');
var query = require('pg-query');
var assert = require('assert');
var async = require('async');
var url = require('url');
var queryString = require('querystring');
var jQuery = require('jquery');
var $ = jQuery.create();
var router = express.Router();

/* Display the page to query test time */
router.get('/', function(req, res) {
			query.connectionParameters = config.reportConnStr;      //connecting to localhost
			var packageArray = new Array();
			var devPkg = {};
			var pkgList = new Array();
			var sitesArray = new Array();
			var testgradeArray = new Array();
			var testgroupArray = new Array();
			var testgradeUnique = [];
			var testgroupUnique = [];

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
								testgradeArray.push(rows[i].testgrade.toUpperCase());        
							}
							$.each(testgradeArray, function(i, el){
									if($.inArray(el, testgradeUnique) === -1) testgradeUnique.push(el);
							});
							callback();
						});
				},
				function(callback) {
						var sqlstr = 'select DISTINCT testgroup from testtime';
						query(sqlstr, function(err, rows, result) {
							assert.equal(rows, result.rows);
							for (var i = 0; i < rows.length; i++) {
								testgroupArray.push(rows[i].testgroup.toUpperCase());        
							}
							$.each(testgroupArray, function(i, el){
									if($.inArray(el, testgroupUnique) === -1) testgroupUnique.push(el);
							});
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
					res.render('ftc', {devPkg:devPkg,packageArray:packageArray, sitesArray:sitesArray, testgradeArray:testgradeUnique, testgroupArray:testgroupUnique });								
				});
});



module.exports = router;