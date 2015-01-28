
#A sample CRUD webpage using Node.js and TypeAhead

This is a rather straightforward Node.js project. It accepts user text input and connects to a PostgreSQL server to retrieve some database rows, and display the data in graphical (d3.js) or tabular (Datatables) form.

##What does it do?

The project source code can be found here: [NODE](https://github.com/whoissqr/NODE)

The page http://localhost:3000/search will show a text input box and a 'Submit' button upon page load.

![The blank page](https://github.com/whoissqr/NODE/blob/master/pic/blank_search.jpg)

When user keys in few characters, the Twitter typeahead library will prompt user with multiple hints from a few different data sources based on string partial matching,

![typeahead](https://github.com/whoissqr/NODE/blob/master/pic/Typeahead_lot.jpg)

When 'Submit' button is clicked, form data is sumbitted to backend Node.js and returned using AJAX and row data is presented in tabular forms (jquery.dataTables.min.js)

![Data shown in table](https://github.com/whoissqr/NODE/blob/master/pic/table.jpg)

##Tools and setup

1. NODES itself. 
2. A good text editor -- I am using Sublime myself; I highlight this as you might need 'tab conscious' editor to work well with jade.
3. Install misc Node.js open source libraries. Don't re-invent the wheels!

  | NODE libs  | description |
  | :------------ |:------------|
  | [express](http://expressjs.com/)       | Fast, unopinionated, minimalist web framework for Node.js                                                               |
  | [pg-query](https://github.com/brianc/node-pg-query)      | database interface to PostgresSQL                                                                     |
  | [async](https://github.com/caolan/async)         | Async is a utility module which provides straight-forward, powerful functions for working with asynchronous JavaScript.  |
  | [d3](http://d3js.org/)           | A JavaScript library for manipulating documents based on data.                                                                 |  
  | [lodash](https://lodash.com/)        | A utility library delivering consistency, customization, performance, & extras.                                            | 
  | [jquery](http://jquery.com/)        | A fast, small, and feature-rich JavaScript library.                                                                         | 
  | [node-windows](https://github.com/coreybutler/node-windows)  | A library which helps to wrap Node.js server in windows service form. | 
  | [typeahea.js](http://twitter.github.io/typeahead.js/) | a flexible JavaScript library that provides a strong foundation for building robust typeaheads. |
  | [DataTables](http://www.datatables.net/) | DataTables is a plug-in for the jQuery Javascript library, which adds interaction control to any HTML table. |

4. A good debugger 
	- The simplest one, google chrome. When you load a page in chrome tab, just right click and select 'Inspect element', and here you go.

##How does it work together?

Some basic understanding about Express folder structure is helpful. Over here, the most frequently accessed files and folders are 

- app.json-- This is like an entry point to the code.
- routes  -- Well, this is where the page URL being routed to.
- public  -- This contains all the front end resources. I created a subfolder called public/front_JS to store all my own JavaScript code to differentiate with
				public/javascripts folder which is created by Express by default and I used to store all the downloaded JavaScript libraries. (well, they could be put in CDNs instead, but the sake of intranet, err...)  	   
- views -- All those Jade files.
- config.json -- This is where I store my database login credentials.
- packge.json -- This is where Express configures the back end JavaScript modules.

**Ok, let me start with the URL**, http://localhost:3000/search
You will see these two lines of code somewhere in [app.js](https://github.com/whoissqr/NODE/blob/master/app.js):

```JavaScript
var search = require('./routes/search');    //line 1
app.use('/search', search);                 //line 2
```

Line 2 here is matching URL with route, and line 1 is defining the file path [routes/search.js](https://github.com/whoissqr/NODE/blob/master/routes/search.js) for the route.

**Then let's open [routes/search.js](https://github.com/whoissqr/NODE/blob/master/routes/search.js)** to take a look, we will find the below code snippet

```JavaScript
router.get('/', function(req, res) {
	...						//prepare data before http response
	res.render('search', 	testerArray:testerArray, 
							handlerArray:handlerArray, 
							deviceArray:deviceArray, 
							recentLotArray:recentLotArray
	});								
});
module.exports = router;
```
OK, what we are doing here is pretty simple - we prepare some data and then render the web form to prompt user for input;
res.render(....), is to respond the URL (/search) with a Jade page [search.jade](https://github.com/whoissqr/NODE/blob/master/views/search.jade) and several variables attaching to it.

**Now open the Jade file [views/search.jade](https://github.com/whoissqr/NODE/blob/master/views/search.jade)**; finally, here we are, some html kind of stuff. Jade is basically some template for HTML. how to interpret those? a quick and easy way, go to [html2jade](http://html2jade.org/), copy the jade file content to the text box on the right, and you will see the corresponding HTML content on the left.

Ok, here is the question -- how do we use those javascript Array in HTML code and handler user interactions dynamically?

First, we need to expose the variable to some front end logic writtent in JavaScript. We do this in Jade; here is the code snippet; 
```JavaScript
script(src='/front_JS/searchFrontEnd.js')   //front end logic in JavaScript

script(type='text/javascript').
  var recentLotArray =!{JSON.stringify(recentLotArray)};     
  var testerArray =!{JSON.stringify(testerArray)};           
  var handlerArray =!{JSON.stringify(handlerArray)};         
  var deviceArray =!{JSON.stringify(deviceArray)};           
```
	
**Then, let's open [/front_JS/searchFrontEnd.js](https://github.com/whoissqr/NODE/blob/master/public/front_JS/searchFrontEnd.js)** to examine the front end logic for form submission. [Let's leave TypeAhead implementation to the later since it is relatively a standalone topic.]
```JavaScript
$(function() {
    // --- front end AJAX handler for universal query [lotid]
    $("#btn_search_query").click(function(e){
      e.preventDefault();
      ...
      params['value'] = userInput;  
      if($.inArray(userInput, recentLotArray)!=-1) params['type'] = 'lotid';
      else if
      ...
      else if($.isNumeric(userInput)) params['type'] = 'lotid';

      $.ajax({
        url: 'universalQuery',   //routed to index.js
        type: 'GET',
        data: {jsonParams:JSON.stringify(params)},
        contentType: 'application/json',                  
        success: function(reply) {
            console.log('AJAX reply success:');   
            //for lotid based query result display to datatable
            if(params['type'] == 'lotid')
            {
                //render data in jQuery table form
                .......  
                $('#lotid').text(reply['lotinfo']['lotid']);
                ...
                $('#pkg').show();
            }
```
Overhere, we define a AJAX routine inside the button (#btn_search_query) handler. The text input is processed and stored in a JavaScript object (param[]) and forwarded to universalQuery in [index.js](https://github.com/whoissqr/NODE/blob/master/routes/index.js).

**Let's look at the AJAX request handler in [index.js](https://github.com/whoissqr/NODE/blob/master/routes/index.js)**, 
```JavaScript
/* AJAX handler for universal query */
router.get('/universalQuery', function(req, res) {

  var theUrl = url.parse( req.url );
  var queryObj = queryString.parse( theUrl.query );
  var params = JSON.parse( queryObj.jsonParams );

  query.connectionParameters = config.mprsConnStr;     
  console.log(params['type']);
  
  switch(params['type']){
       case 'lotid':  
            var sqlstr = 'select lotstartdt, ftc, lotid, deviceid, packageid, testprogname, testgrade, testgroup, temperature, testerid, handlerid, numofsite, masknum, soaktime, xamsqty, scd, speedgrade, loadboardid, checksum from lotintro';
            sqlstr +=  ' where UPPER(lotid)=\'' + params['value'] + '\'  order by lotstartdt';  
            getDataFromLotID(sqlstr, function(d) {
              res.json(d);
            });
            break;
            ....
  }
});
```

**Then how do we query the database using the sql string?**
```JavaScript
function getDataFromLotID(sqlstr, cb) {
		console.log(sqlstr);
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
					rowArray['lotstartdt'] = rows[i].lotstartdt.getFullYear() +'-'+ monStart +'-'+ rows[i].lotstartdt.getDate();
					lotinfo['lotid'] = rows[i].lotid;
					lotinfo['deviceid'] = rows[i].deviceid;
					...

					rowArray['handlerid'] = rows[i].handlerid;
					rowArray['numofsite'] = rows[i].numofsite;
					rowArray['masknum'] = rows[i].masknum;
					...				
					aaData.push(rowArray);
				}
				data['aaData'] = aaData;	
				data['lotinfo']	= lotinfo;
				cb(data);
		});
}
```

If the AJAX request is successfully processed, the database result set will be returned as a JSON object ('reply'); Here is how the data is rendered in table form.
```JavaScript
var columns = [
  {"sTitle": "lotstartdt",  "mData": "lotstartdt"}, 
  {"sTitle": "ftc",         "mData": "ftc"}, 
  {"sTitle": "tester",      "mData": "testerid"}, 
  {"sTitle": "handler",     "mData": "handlerid"}, 
  {"sTitle": "qty",         "mData": "xamsqty"}, 
  {"sTitle": "testprogname","mData": "testprogname"}, 
  {"sTitle": "testgroup",   "mData": "testgroup"}, 
  {"sTitle": "speed",       "mData": "speedgrade"}, 
  {"sTitle": "temperature", "mData": "temperature"}, 
  {"sTitle": "masknum",     "mData": "masknum"}, 
  {"sTitle": "loadboard",   "mData": "loadboardid"}
];
//refer to table property: http://legacy.datatables.net/ref
var otable = $('#ttResult').html('<table class="display"></table>').children('table').dataTable({
	          "destroy":true,
	          "aoColumns": columns,
	          "aaData": reply['aaData'],
	          "aaSorting":[],
	          "iDisplayLength": 100                         
});
```

**Ok, back to the question, how do we implement a typeahead for the text input field?**
Before page is loaded, we already made a trip to the database server and cached a few data arrays in JavaScript.
```JavaScript
script(src='/front_JS/searchFrontEnd.js')   //front end logic in JavaScript

script(type='text/javascript').
  var recentLotArray =!{JSON.stringify(recentLotArray)};     
  var testerArray =!{JSON.stringify(testerArray)};           
  var handlerArray =!{JSON.stringify(handlerArray)};         
  var deviceArray =!{JSON.stringify(deviceArray)};           
```

They are basically the data sources which we are going to map user input against.
```JavaScript
$(document).ready(function() {  
    //--- front end twitter typeahead handler for search engine ---
    var houndFactory = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: $.map(factoryArray, function(state) { return { value: state }; })
    });

    var houndLotID = new Bloodhound({
    ...
    });

    var houndTesterID = new Bloodhound({
    ...
    });

    var houndHandlerID = new Bloodhound({
    ...
    });

    var houndDeviceID = new Bloodhound({
    ...
    });
     
    houndLotID.initialize();
    houndTesterID.initialize();
    houndHandlerID.initialize();
    houndDeviceID.initialize();
    houndFactory.initialize();
     
    $('#custom-templates .typeahead').typeahead({
      hint: false,
      highlight: true,
      minLength: 1
    },
    {
      displayKey: 'value',      
      source: houndTesterID.ttAdapter(),
      templates: {
            empty: ['<div class="empty-message">', '', '</div>'].join('\n'),
            suggestion: Handlebars.compile('<p>Tester: <strong>{{value}}</strong></p>')
      }
    },
    {
      displayKey: 'value',      
      source: houndHandlerID.ttAdapter(),
      templates: {
            empty: ['<div class="empty-message">', '', '</div>'].join('\n'),
            suggestion: Handlebars.compile('<p>Handler: <strong>{{value}}</strong></p>')
      }
    },
    {
      ...
    },    
    {
      ...
    },
    {
      ...
    }
    );
});
```
