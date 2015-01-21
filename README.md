NODE
====

#sample CRUD application using NODEJS with PostgreSQL


This is an extremely simple NODEJS application built on top of Express. It connects to a PostgreSQL server and display some database rows in 
graphical (d3.js) or tabular (Datatable) form .

#What do you need?
	a. NODES itself. 
	b. A good editor -- I am using Sublime myself; I highlight this as you might need 'tab conscious' editor to work well with jade.
	c. You can use 'express' for web server.
	d. You can use 'pg-query' for database interface to PostgresSQL.
	e. You can use 'async' for asynchronous database queries.
	f. You can use 'd3' to visualize your data.
	g. You can use 'jQuery' for tabs, tables, form implementation in web pages.
	h. A good debugger 
	   - The simplest one, google chrome. When you load a page in chrome tab, just right click and select 'Inspect element', and here you go.
	   - Another one, Firebug, a google chrome plugin. I installed this one, and it seems powerful, but I haven't used it much yet. No comment.

#How to read those bunch of code?
	Some basic understanding about Express folder structure is helpful. To me, most frequently access folder are 
		- app.js       this is like an entry point.
		- routes	   well, those are where the page URL being routed to.
		- public	   this contains all the front end resources. I created a subfolder called public/front_JS to store all my own JavaScript code to differentiate with
						public/javascripts which i used to store all the downloaded JavaScript libraries. (well, they should be in CDNs instead, but the sake of intranet, err...)	   
		- views   	   All those JADE files.
		- config.json  this is where I store DB login credentials.
		- packge.json  this is where Express configures the back end JavaScript modules.
	
	Ok, let me start with an example, I have a page called http://localhost:3000/search
	You will see these two lines of code somewhere in app.js:
	'''
	var search = require('./routes/search');    //line 1
	app.use('/search', search);                 //line 2
	'''
	
	Line 2 above is matching URL with route, and line 1 is defining the file path ('./routes/search') for the route.
	
	Then open routes/search.js, we will find the below code snippet
	'''
	router.get('/', function(req, res) {
		......              //prepare data
		res.render('search', 	testerArray:testerArray, 
								handlerArray:handlerArray, 
								deviceArray:deviceArray, 
								recentLotArray:recentLotArray
							});								
	});
	'''
	module.exports = router;
	OK, what we are doing here is pretty much simple -- we need to prepare some data before we actually rendering the web page.
	When we are ready, we will do a res.render(....), which means to respond the URL (/search) with a JADE page (search.jade) and several variables attaching to it.
	
	Now open the JADE file (views/search.jade); finally, here we are, some html kind of stuff here. JADE is basically some template for HTML. how to interpret those? a quick and easy way, go to [html2jade](http://html2jade.org/) , copy the jade file content to the right text box, and it will show the HTML content on the left side.
	
	Ok, here is the question -- how do we render those javascript Array in HTML code and handler user interactions dynamically?
	
	
	
	
	