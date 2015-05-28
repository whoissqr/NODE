##A Single-page application for database access using Node.js

This is a rather straightforward Node.js project. It receives user input through web form and connects to a PostgreSQL database to retrieve some data using AJAX backend, and displays data in chart (Dimple) and tabular (Datatables) form in browser.

The project source code can be found here: [NODE](https://github.com/whoissqr/NODE)

The page http://localhost:3000/search will present a search box and a 'Submit' button upon page load.

![The blank page](https://github.com/whoissqr/NODE/blob/master/pic/blank_search.jpg)

User only need to key in few characters, the search box will pop up a number of hints by matching this partial string with database retrieved information,

![typeahead](https://github.com/whoissqr/NODE/blob/master/pic/Typeahead_lot.jpg)

When 'Submit' button is clicked, user input is sent back to AJAX (implemented using Node.js) and data is returned in JSON format and presented in tabular and chart form.

![Data shown in table](https://github.com/whoissqr/NODE/blob/master/pic/table.jpg)

![Data shown in table 2](https://cloud.githubusercontent.com/assets/4846507/6773618/960f97bc-d14e-11e4-8896-afba8f9c3105.jpg)

![Data shown in chart](https://cloud.githubusercontent.com/assets/4846507/6773617/960009be-d14e-11e4-9985-7dd17944cc69.jpg)

#####Why NODEJS?<br>
https://github.com/whoissqr/NODE/wiki/Why-Nodejs%3F

#####Modules used and environment setup<br>
https://github.com/whoissqr/NODE/wiki/working-environment-setup

#####Walk through the code<br>
https://github.com/whoissqr/NODE/wiki/A-Single-page-application-implementation-to-display-data-from-PostgreSQL-using-Node.js

#####How to run nested database queries in parallel?<br>
https://github.com/whoissqr/NODE/wiki/note:-how-to-run-nested-database-queries-in-parallel

#####how to run a few unrelated task in parallel in NODEJS?<br>
https://github.com/whoissqr/NODE/wiki/how-to-run-a-few-unrelated-task-in-parallel-in-NODEJS

#####how to accelerate web page loading using Materialized View?
https://github.com/whoissqr/NODE/wiki/FAQ:-accelerate-web-page-loading-using-Materialized-View
