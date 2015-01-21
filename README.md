NODE
====

#sample CRUD application using NODEJS with PostgreSQL


This is an extremely simple NODEJS application built on top of Express. It connects to a PostgreSQL server and display some database rows in 
graphical (d3.js) or tabular (Datatable) form .

#What do you need?
1. NODES itself. 
2. A good editor -- I am using Sublime myself; I highlight this as you might need 'tab conscious' editor to work well with jade.
3. You can use 'express' for web server.
4. You can use 'pg-query' for database interface to PostgresSQL.
5. You can use 'async' for asynchronous database queries.
6. You can use 'd3' to visualize your data.
7. You can use 'jQuery' for tabs, tables, form implementation in web pages.
8. A good debugger 
	- The simplest one, google chrome. When you load a page in chrome tab, just right click and select 'Inspect element', and here you go.
	- Another one, Firebug, a google chrome plugin. I installed this one, and it seems powerful, but I haven't used it much yet. No comment.

#How to read those bunch of code?

Some basic understanding about Express folder structure is helpful. To me, most frequently access folder are 

- app.json-- This is like an entry point.
- routes  -- Well, those are where the page URL being routed to.
- public  -- This contains all the front end resources. I created a subfolder called public/front_JS to store all my own JavaScript code to differentiate with
				public/javascripts which i used to store all the downloaded JavaScript libraries. (well, they should be in CDNs instead, but the sake of intranet, err...)  	   
- views -- All those JADE files.
- config.json -- This is where I store DB login credentials.
- packge.json -- This is where Express configures the back end JavaScript modules.

Ok, let me start with an example, I have a page called http://localhost:3000/search
You will see these two lines of code somewhere in [app.js](https://github.com/whoissqr/NODE/blob/master/app.js):

```JavaScript
var search = require('./routes/search');    //line 1
app.use('/search', search);                 //line 2
```

Line 2 above is matching URL with route, and line 1 is defining the file path ('./routes/search') for the route.

Then let's open routes/search.js, we will find the below code snippet

```JavaScript
router.get('/', function(req, res) {
	......              //prepare data before http response
	res.render('search', 	testerArray:testerArray, 
							handlerArray:handlerArray, 
							deviceArray:deviceArray, 
							recentLotArray:recentLotArray
	});								
});
module.exports = router;
```
OK, what we are doing here is pretty much simple -- we need to prepare some data before we actually rendering the web page.
When we are ready, we will do a res.render(....), which means to respond the URL (/search) with a JADE page (search.jade) and several variables attaching to it.

Now open the JADE file (views/search.jade); finally, here we are, some html kind of stuff here. JADE is basically some template for HTML. how to interpret those? a quick and easy way, go to [html2jade](http://html2jade.org/) , copy the jade file content to the right text box, and it will show the HTML content on the left side.  

Ok, here is the question -- how do we render those javascript Array in HTML code and handler user interactions dynamically?
	
	
	
	
	