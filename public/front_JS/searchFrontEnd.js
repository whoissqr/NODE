var factoryArray = [];

factoryArray.push('XAP');
factoryArray.push('KYEC');
factoryArray.push('SPIL');
factoryArray.push('ATK');

$(document).ready(function() {	
		//init the div components
		initPage();

		//--- front end twitter typeahead handler for search engine ---
		var houndFactory = new Bloodhound({
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			local: $.map(factoryArray, function(state) { return { value: state }; })
		});

		var houndLotID = new Bloodhound({
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			local: $.map(recentLotArray, function(state) { return { value: state }; })
		});

		var houndTesterID = new Bloodhound({
			datumTokenizer: function(d) {
				var test = Bloodhound.tokenizers.whitespace(d.value);
				$.each(test,function(k,v){
					i = 0;
					while( (i+1) < v.length ){
						test.push(v.substr(i,v.length));
						i++;
					}
				})
				return test;
			},
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			local: $.map(testerArray, function(state) { return { value: state }; })
		});

		var houndHandlerID = new Bloodhound({
			datumTokenizer: function(d) {
				var test = Bloodhound.tokenizers.whitespace(d.value);
				$.each(test,function(k,v){
					i = 0;
					while( (i+1) < v.length ){
						test.push(v.substr(i,v.length));
						i++;
					}
				})
				return test;
			},
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			local: $.map(handlerArray, function(state) { return { value: state }; })
		});

		var houndDeviceID = new Bloodhound({
			datumTokenizer: function(d) {
				var test = Bloodhound.tokenizers.whitespace(d.value);
				$.each(test,function(k,v){
					i = 0;
					while( (i+1) < v.length ){
						test.push(v.substr(i,v.length));
						i++;
					}
				})
				return test;
			},
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			local: $.map(deviceArray, function(state) { return { value: state }; })
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
			displayKey: 'value',			
			source: houndDeviceID.ttAdapter(),
			templates: {
				empty: ['<div class="empty-message">', '', '</div>'].join('\n'),
				suggestion: Handlebars.compile('<p>Device: <strong>{{value}}</strong></p>')
			}
		},		
		{
			displayKey: 'value',
			source: houndLotID.ttAdapter(),
			templates: {
				empty: ['<div class="empty-message">', '', '</div>'].join('\n'),
				suggestion: Handlebars.compile('<p>Lot ID: <strong>{{value}}</strong></p>')
			}
		},
		{
			displayKey: 'value',
			source: houndFactory.ttAdapter(),
			templates: {
				empty: ['<div class="empty-message">', '', '</div>'].join('\n'),
				suggestion: Handlebars.compile('<p>Factory: <strong>{{value}}</strong></p>')
			}
		}
		);
});

function getTesterFromFactory(factory){
	var factoryTestersArray = [];
	var factoryKey;
	switch(factory.toUpperCase()){
		case 'XAP':   factoryKey = 'XAP'; break;
		case 'KYEC':  factoryKey = 'KYEC'; break;
		case 'SPIL':  factoryKey = 'T'; break; 
		case 'ATK':   factoryKey = 'K3'; break;
	}
	for(tester of testerArray)
	{
		if(tester.toUpperCase().indexOf(factoryKey)==0)
		{
			factoryTestersArray.push(tester);
		}
	}
	return factoryTestersArray;
}

var today = new Date(2015, 2, 26);	//March 26, //month is zero based
var startDate = new Date(today -  1000 * 60 * 60 * 24 * 7); //Date is in millisecs;
var endDate = today;

/* 
	 lastW will be 7 days from Now; 
	 lastM will be 30 days from Now;
	 period selction is 7AM on startDate to 7AM on endDate.
	 */
	 function getSearchPeriod(){
	 	if(!$('input[name=timeBtnGrp]').is(':checked'))	{ return true; }

	 	var selectedValue = $('input[name=timeBtnGrp]:checked').val();

	 	if(selectedValue=='lastW') 
	 	{
	 		startDate = new Date(today -  1000 * 60 * 60 * 24 * 7);
	 		endDate = today;
	 		startDate = new Date(startDate - startDate.getTimezoneOffset()*1000 * 60);
	 		endDate = new Date(endDate - endDate.getTimezoneOffset()*1000 * 60);
	 	}
	 	else if(selectedValue=='lastM') 
	 	{
	 		startDate = new Date(today -  1000 * 60 * 60 * 24 * 30);
	 		endDate = today;
	 		startDate = new Date(startDate - startDate.getTimezoneOffset()*1000 * 60);
	 		endDate = new Date(endDate - endDate.getTimezoneOffset()*1000 * 60);
	 	}
	 	else
	 	{
	 		startDate = $('#startDT').datepicker( "getDate" );
	 		endDate = $('#endDT').datepicker( "getDate" );

	 		if(startDate==null){
	 			$('#msgArea').val('Please select start date.');
	 			return false;
	 		}

	 		if(endDate==null){
	 			$('#msgArea').val('Please select end date.');
	 			return false;
	 		}

	 		startDate = new Date(startDate - startDate.getTimezoneOffset()*1000 * 60 + 1000 * 60 * 60 * 7);
	 		endDate = new Date(endDate - endDate.getTimezoneOffset()*1000 * 60 + 1000 * 60 * 60 * 7);

	 		if(!validateDatePicked()) return false;
	 	}

	 	startDate = startDate.toISOString().slice(0, 19).replace('T', ' ');
	 	endDate = endDate.toISOString().slice(0, 19).replace('T', ' ');
	 	console.log(startDate + ' --- ' + endDate);

	 	return true;
	 }

	 function resetTimeBtnGroup(){
	 	$('input[name=timeBtnGrp]').prop('checked', false);
	 	$('#startDT').datepicker( "setDate", null);
	 	$('#endDT').datepicker( "setDate", null);
	 }

	 function validateDatePicked(){
	 	if(!$('input[name=timeBtnGrp]').is(':checked'))	{ return true; }

	 	if(startDate > today) {
	 		$('#msgArea').val('[' + startDate.toDateString() + '] is a future date.');
	 		return false;
	 	}

	 	if(startDate >= endDate){
	 		$('#msgArea').val('Error: Start date [' + startDate.toDateString() + '] is earlier than End date [' + endDate.toDateString() + '].');
	 		return false;
	 	}

	 	var timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
	 	var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
	 	if(diffDays>60){
	 		$('#msgArea').val('Error: Date range must be less than 60 days.');
	 		return false;
	 	}

	 	return true;
	 }

	 $(function() {
	//--- action handler for date time selection button group ---
	$('input[name=timeBtnGrp]').click(function(e){			
		var selectedValue = $('input[name=timeBtnGrp]:checked').val();
		
		if( (selectedValue=='lastW') || (selectedValue=='lastM') ) 
		{
			console.log(selectedValue +' selected');
			$('#startDT').prop("disabled", true);
			$('#endDT').prop("disabled", true);
		}else if(selectedValue=='period')
		{
			$('#startDT').prop("disabled", false);
			$('#endDT').prop("disabled", false);
		}else 
		{
		}			
	});

	// --- front end AJAX handler for universal query
	$("#btn_search_query").click(function(e){
		e.preventDefault();

		console.log('btn_search_query clicked');
		$('#custom-templates .tt-dropdown-menu').hide();  //retract the drop down suggestions if necessary

		$('#msgArea').val('');
		
		var params = {};
		var userInput = $("#keystr").val().toUpperCase().trim();
		params['value'] = userInput;			
		if($.inArray(userInput, recentLotArray)!=-1) 
		{
			params['type'] = 'lotid';
			resetTimeBtnGroup();
			$('#msgArea').val('searching for LotID [' + userInput + ']');
		}
		else if($.inArray(userInput, testerArray)!=-1) 
		{
			params['type'] = 'testerid';
			if(!$('input[name=timeBtnGrp]').is(':checked'))
			{
				$('#lastW').prop("checked", true);
			}
			$('#msgArea').val('searching for testerid [' + userInput + '] ...');
		}
		else if($.inArray(userInput, handlerArray)!=-1) 
		{
			params['type'] = 'handlerid';
			if(!$('input[name=timeBtnGrp]').is(':checked'))
			{
				$('#lastM').prop("checked", true);
			}		
			$('#msgArea').val('searching for handlerid [' + userInput + '] ...');
		}
		else if($.inArray(userInput, deviceArray)!=-1) 
		{
			params['type'] = 'deviceid';
			resetTimeBtnGroup();
			$('#msgArea').val('searching for deviceid [' + userInput + '] ...');
		}
		else if($.inArray(userInput, factoryArray)!=-1) 
		{ 
			params['type'] = 'factory'; 
			params['testers'] = getTesterFromFactory(params['value']);
			resetTimeBtnGroup();
			$('#msgArea').val('searching for factory [' + userInput + '] ...');
		}
		else if($.isNumeric(userInput))
		{
			params['type'] = 'lotid';
			resetTimeBtnGroup();
			$('#msgArea').val('searching for LotID [' + userInput + '] ...');
		}
		else if(userInput.indexOf("OEE")>=0)
		{
			params['type'] = 'OEE';
			var instr = userInput.trim();
			instr = instr.replace(/\s{2,}/g, ' ');	//replace all consecutive white spaces to single space

			var insplit = instr.split(' ');
			if(insplit[0]=='OEE') params['factory'] = insplit[1].toUpperCase();
			else if(insplit[1] =='OEE') params['factory'] = insplit[0].toUpperCase();
			else {}

				console.log('type = ' + params['type']);
			console.log('factory = ' + params['factory']);
			resetTimeBtnGroup();
		}
		else
		{
			//user input is not recognized.
			params['type'] = 'error';
			$('#msgArea').val('Input [' + userInput + '] is a not valid keyword.');
		}

		if(!getSearchPeriod()) {
			console.log('date range not possible.');
			$('#ttResult').hide();
			return;
		}
		if($('input[name=timeBtnGrp]').is(':checked'))	{
			$('#msgArea').val( $('#msgArea').val() + '\nFrom ' + startDate + '\nTo ' + endDate + '.\n');
		}

		params['startDate'] = startDate;
		params['endDate'] = endDate;

		
		$.ajax({
			url: 'universalQuery',	 //routed to search_AJAX.js
			type: 'GET',
			data: {jsonParams:JSON.stringify(params)},
			contentType: 'application/json',
			success: function(reply) {
				if(!reply) console.log('reply is null.');
				console.log('Processing AJAX response...:');

				resetEverything();

				//for lotid based query result display to datatable
				if(params['type'] == 'lotid')
				{
					var columns = [
					{"sTitle": "Lotstartdt",	"mData": "lotstartdt"}, 
					{"sTitle": "FTC",			"mData": "ftc"}, 
					{"sTitle": "Tester",		"mData": "testerid"}, 
					{"sTitle": "Handler",		"mData": "handlerid"}, 
					{"sTitle": "LotSize",		"mData": "xamsqty"}, 
					{"sTitle": "Testprogname",	"mData": "testprogname"}, 
					{"sTitle": "Testgroup",	  	"mData": "testgroup"}, 
					{"sTitle": "Speed",			"mData": "speedgrade"}, 
					{"sTitle": "Temperature",	"mData": "temperature"},  
					{"sTitle": "Loadboard",		"mData": "loadboardid"}
					];
					//refer to table property: http://legacy.datatables.net/ref
					var otable = $('#ttResult').html('<table class="display"></table>').children('table').dataTable({
						"destroy":true,
						"aoColumns": columns,
						"aaData": reply['aaData'],
						"aaSorting":[],
						"iDisplayLength": 100													
					});		
					$('#lotid').text(reply['lotinfo']['lotid']);
					$('#grade').text(reply['lotinfo']['testgrade']);
					$('#dev').text(reply['lotinfo']['deviceid']);
					$('#pkg').text(reply['lotinfo']['packageid']);
					$('#factory').text(reply['lotinfo']['factory']);
					$('#lotid').show();
					$('#grade').show();
					$('#dev').show();
					$('#pkg').show();
					$('#ttResult').show();
				}

				//for tester id based query result display to datatable
				if(params['type'] == 'testerid')
				{
					var columns = [
					{"sTitle": "Date",			"mData": "lotstartdt"}, 
					{"sTitle": "FTC",			"mData": "ftc"}, 
					{"sTitle": "LotID",			"mData": "lotid"}, 
					{"sTitle": "Device",		"mData": "deviceid"}, 
					{"sTitle": "Package",		"mData": "packageid"},
					{"sTitle": "Tester",		"mData": "testerid"},  
					{"sTitle": "Handler",		"mData": "handlerid"}, 
					{"sTitle": "loadboard",		"mData": "loadboardid"}
					];
					//[ref] refer to table property: http://legacy.datatables.net/ref
					var otable = $('#ttResult').html('<table class="display"></table>').children('table').dataTable({
						"destroy":true,
						"aoColumns": columns,
						"aaData": reply['aaData'],
						"aaSorting":[],
						"iDisplayLength": 100
					});		
					$('#factory').text(reply['lotinfo']['factory']);
					$('#tester').text(reply['lotinfo']['testerid']);
					$('#factory').show();								
					$('#tester').show();
					$('#ttResult').show();
				}

				//for handler id based query result display to datatable
				if(params['type'] == 'handlerid')
				{
					var columns = [
					{"sTitle": "Date",			"mData": "lotstartdt"}, 
					{"sTitle": "LotID",			"mData": "lotid"},
					{"sTitle": "LotSize",		"mData": "qty"}, 
					{"sTitle": "Tester",		"mData": "testerid"}, 
					{"sTitle": "Handler",		"mData": "handlerid"},
					{"sTitle": "Device",		"mData": "deviceid"}, 
					{"sTitle": "Package",		"mData": "packageid"}, 
					{"sTitle": "Loadboard",	"mData": "loadboardid"}
					];
					//[ref] refer to table property: http://legacy.datatables.net/ref
					var otable = $('#ttResult').html('<table class="display"></table>').children('table').dataTable({
						"destroy":true,
						"aoColumns": columns,
						"aaData": reply['aaData'],
						"aaSorting":[],
						"iDisplayLength": 100													
					});		
					$('#handler').text(reply['lotinfo']['handlerid']);
					$('#handler').show();
					$('#ttResult').show();
				}

				if(params['type'] == 'deviceid')
				{
					var columns = [
					{"sTitle": "Testerid",	"mData": "testerid"}, 
					{"sTitle": "From",		"mData": "startDt"}, 
					{"sTitle": "To",		"mData": "endDt"}, 
					{"sTitle": "Quantity",	"mData": "qty"}
					];
					//[ref] refer to table property: http://legacy.datatables.net/ref
					var otable = $('#ttResult').html('<table class="display"></table>').children('table').dataTable({
						"destroy":true,
						"aoColumns": columns,
						"aaData": reply['aaData'],
						"aaSorting":[],
						"iDisplayLength": 100
					});		
					$('#dev').text(reply['lotinfo']['deviceid']);
					$('#dev').show();
					$('#ttResult').show();
				}

				if(params['type'] == 'factory')
				{
					var columns = [
					{"sTitle": "Testerid",		"mData": "testername"},
					{"sTitle": "Handlerid",		"mData": "handlerid"}, 
					{"sTitle": "packageid",		"mData": "packageid"},  
					{"sTitle": "Loadboardid",	"mData": "loadboardid"},  
					{"sTitle": "Status",		"mData": "category"}
					];
					//[ref] refer to table property: http://legacy.datatables.net/ref
					var otable = $('#ttResult').html('<table class="display"></table>').children('table').dataTable({
						"destroy":true,
						"aoColumns": columns,
						"aaData": reply['aaData'],
						"iDisplayLength": 100,
						"bAutoWidth": false
					});		
					$('#factory').text(params['value']);
					$('#factory').show();
					$('#ttResult').show();
				}

				if(params['type'] == 'OEE')
				{
					hideInfoButtonGroup();

					//plot the chart
					var svgW = 700;
					var svgH = 320;

					var svg_total = dimple.newSvg("#ChartTab1", svgW, svgH);
					plotTimeSlotBarChart_by_Dimple(reply['forGraph'], "TOTAL", svg_total, "Down time distribution overall", "Percentage");
					$('#ChartTab1').appendTo("#OEE_total");

					var svg_xoee_line = dimple.newSvg("#ChartTab2", svgW, svgH);
					plotXOEELineChart_by_Dimple(reply['forGraph'], "TOTAL", svg_xoee_line, "Weekly xOEE%", "xOEE%");
					$('#ChartTab2').appendTo("#OEE_weekly");

					var svg_93k = dimple.newSvg("#ChartTab3", svgW, svgH);
					plotTimeSlotBarChart_by_Dimple(reply['forGraph'], "93K", svg_93k, "Down time [A93K]", "Percentage");
					$('#ChartTab3').appendTo("#OEE_93k");
					
					var svg_t2k = dimple.newSvg("#ChartTab4", svgW, svgH);
					plotTimeSlotBarChart_by_Dimple(reply['forGraph'], "T2K", svg_t2k, "Down time [T2K]", "Percentage");
					$('#ChartTab4').appendTo("#OEE_t2k");

					$('#tabs').append('<div id="ChartTab1">');
					$('#tabs').append('<div id="ChartTab2">');
					$('#tabs').append('<div id="ChartTab3">');
					$('#tabs').append('<div id="ChartTab4">');


					$('#OEE_93k').show();
					$('#OEE_t2k').show();
					$('#OEE_total').show();
					$('#OEE_weekly').show();
					$($("#tabs").find("li")[1]).show();
					$($("#tabs").find('#Graph')).show();

					//plot the table
					var tableContent = JSON.parse(reply['forTable']);
					var columns = [
					{"sTitle": "Week",		"mData": "ww"},
					{"sTitle": "Tester",	"mData": "platform"},
					{"sTitle": "EarnH",		"mData": "earnhour"},
					{"sTitle": "RT",		"mData": "rthour"}, 
					{"sTitle": "Verify",	"mData": "verifyhour"},  
					{"sTitle": "QCE",		"mData": "qcehour"},  
					{"sTitle": "Setup",		"mData": "setup"},
					{"sTitle": "Down",		"mData": "down"},
					{"sTitle": "PM",		"mData": "pm"},
					{"sTitle": "Others",	"mData": "others"},
					{"sTitle": "MTE",		"mData": "mte"},
					{"sTitle": "PTE",		"mData": "pte"},
					{"sTitle": "IDLE",		"mData": "idle"},
					{"sTitle": "Shutdown",	"mData": "shutdown"},
					{"sTitle": "Unknown",	"mData": "unknown"},
					{"sTitle": "xOEE",		"mData": "xoee"}
					];
					//[ref] refer to table property: http://legacy.datatables.net/ref
					var otable = $('#ttResult').html('<table class="display"></table>').children('table').dataTable({
						"destroy":true,
						"aoColumns": columns,
						"aaData": tableContent,
						"iDisplayLength": 100,
						"bAutoWidth": false
					});	
					$('#ttResult').show();
				}
			},
			error: function(response) { // if error occured
				console.log('error: ' + JSON.stringify(response));
			}
		});
});
});

function plotTimeSlotBarChart_by_Dimple(dataSource, platform, svg, chartTitle, ytitle){
	dataSource = JSON.parse(dataSource);
	var data = jQuery.grep(dataSource, function( n, i ) {
		return	((n.platform.toUpperCase()==platform) 
			&& (n.category.toUpperCase()!=="MTE") 
			&& (n.category.toUpperCase()!=="PTE")
			&& (n.category.toUpperCase()!=="IDLE")
			&& (n.category.toUpperCase()!=="MFGHOUR")
			&& (n.category.toUpperCase()!=="XOEE")
			);
	});

	var c = new dimple.chart(svg, data);
	c.setBounds(85, 45, 400, 250);						 //x,y, width, height
	var xaxis = c.addCategoryAxis("x", ["ww"]);
	var yaxis = c.addPctAxis("y", "hours");			
	c.addSeries(["hours", "category"], dimple.plot.bar);
	var clegend = c.addLegend(540, 60, 50, 200, "right");	//x,y, width, height
	yaxis.addOrderRule("hours");						
	c.draw();
	yaxis.titleShape.text(ytitle);
	//dimple fix, adjust the title text for yaxis, otherwise it will overlap with yaxis tickers
	yaxis.titleShape.attr("y", "150");
	xaxis.titleShape.attr("y", "320");
	//dimple fix, see https://github.com/PMSI-AlignAlytics/dimple/issues/34
	clegend.shapes.selectAll("text").attr("dy", "8");  

	svg.append("text")
	.attr("x", c._xPixels() + c._widthPixels() / 2)
	.attr("y", c._yPixels() - 20)
	.style("text-anchor", "middle")
	.style("font-family", "sans-serif")
	.style("font-weight", "bold")
	.text(chartTitle);
}

function plotXOEELineChart_by_Dimple(dataSource, platform, svg, chartTitle, ytitle){
	dataSource = JSON.parse(dataSource);
	var data = jQuery.grep(dataSource, function( n, i ) {
		return		(n.category.toUpperCase()=="XOEE");
	});

	var c = new dimple.chart(svg, data);
	c.setBounds(85, 45, 400, 250);
	var xaxis = c.addCategoryAxis("x", "ww");
	var yaxis = c.addMeasureAxis("y", "hours");
	c.addSeries("platform", dimple.plot.line);
	var clegend = c.addLegend(540, 60, 50, 200, "right");
	yaxis.overrideMin = 30;
	c.draw();
	yaxis.titleShape.text(ytitle);
	yaxis.titleShape.attr("y", "150");
	xaxis.titleShape.attr("y", "320");
	
	clegend.shapes.selectAll("text").attr("dy", "8"); 

	svg.append("text")
	.attr("x", c._xPixels() + c._widthPixels() / 2)
	.attr("y", c._yPixels() - 20)
	.style("text-anchor", "middle")
	.style("font-family", "sans-serif")
	.style("font-weight", "bold")
	.text(chartTitle);
}

function hideInfoButtonGroup(){
	$('.infoButton').css("display", "none");
}

function showInfoButtonGroup(){
	$('.infoButton').removeAttr("display");
}

function resetEverything(){
	$('#ttResult').empty();
	$('#OEE_93k').empty();
	$('#OEE_t2k').empty();
	$('#OEE_total').empty();
	$('#OEE_weekly').empty();
	
	$('#ttResult').hide();
	$('#OEE_93k').hide();
	$('#OEE_t2k').hide();
	$('#OEE_total').hide();
	$('#OEE_weekly').hide();

	$('#factory').hide();
	$('#tester').hide();
	$('#handler').hide();
	$('#lotid').hide();
	$('#grade').hide();
	$('#dev').hide();
	$('#pkg').hide();

	$($("#tabs").find("li")[1]).hide();		//hide graph tab
	$($("#tabs").find('#Graph')).hide();

	var index = $('#tabs a[href="#Data"]').parent().index();
	$("#tabs").tabs("option", "active", index);		//select the 1st tab pane

	$('#infoBtnSection').show();
	$('#resultSection').show();

	showInfoButtonGroup();
}

function initPage(){
	//init the NAV area (left side of page)
	$(".datepicker").datepicker();
	$('#startDT').prop("disabled", true);
	$('#endDT').prop("disabled", true);
	$( "#tabs" ).tabs({
		event: "mouseover"
	});

	//reset the data in main area
	resetEverything();

	//hide the information buttons and tabs div
	$('#infoBtnSection').hide();
	$('#resultSection').hide();


	if ( (recentLotArray.length==0)	||
		(deviceArray.length==0)	||
		(handlerArray.length==0)	||
		(testerArray.length==0) 	)
	{
		$('#msgArea').val('Database connection error.');
	}
}

var DBG;
