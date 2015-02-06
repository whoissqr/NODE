var factoryArray = new Array();
factoryArray.push('XAP');
factoryArray.push('KYEC');
factoryArray.push('SPIL');
factoryArray.push('ATK');

$(document).ready(function() {	
		$(".datepicker").datepicker();
		$('#startDT').prop("disabled", true);
		$('#endDT').prop("disabled", true);

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
		var factoryTestersArray = new Array();
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

var today = new Date();
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

		// --- front end AJAX handler for universal query [lotid]
		$("#btn_search_query").click(function(e){
			e.preventDefault();

			console.log('btn_search_query clicked');
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
				url: 'universalQuery',	 //routed to index.js
				type: 'GET',
				data: {jsonParams:JSON.stringify(params)},
				contentType: 'application/json',									
				success: function(reply) {
						console.log('AJAX reply success:');		
						//for lotid based query result display to datatable
						if(params['type'] == 'lotid')
						{
								var columns = [
									{"sTitle": "Lotstartdt",	"mData": "lotstartdt"}, 
									{"sTitle": "FTC",					"mData": "ftc"}, 
									{"sTitle": "Tester",			"mData": "testerid"}, 
									{"sTitle": "Handler",			"mData": "handlerid"}, 
									{"sTitle": "LotSize",			"mData": "xamsqty"}, 
									{"sTitle": "Testprogname","mData": "testprogname"}, 
									{"sTitle": "Testgroup",	  "mData": "testgroup"}, 
									{"sTitle": "Speed",				"mData": "speedgrade"}, 
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
								$('#tester').hide();
								$('#handler').hide();
								$('#grade').show();
								$('#lotid').show();
								$('#dev').show();
								$('#pkg').show();
						}

						//for tester id based query result display to datatable
						if(params['type'] == 'testerid')
						{
								var columns = [
									{"sTitle": "Date",			"mData": "lotstartdt"}, 
									{"sTitle": "LotID",			"mData": "lotid"}, 
									{"sTitle": "Device",		"mData": "deviceid"}, 
									{"sTitle": "Package",		"mData": "packageid"},
									{"sTitle": "Tester",		"mData": "testerid"},  
									{"sTitle": "Handler",		"mData": "handlerid"}, 
									{"sTitle": "loadboard",	"mData": "loadboardid"}
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
								$('#tester').show();
								$('#handler').hide();
								$('#grade').hide();
								$('#lotid').hide();
								$('#dev').hide();
								$('#pkg').hide();
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
								$('#factory').hide();
								$('#tester').hide();
								$('#handler').show();
								$('#grade').hide();
								$('#lotid').hide();
								$('#dev').hide();
								$('#pkg').hide();
						}

						if(params['type'] == 'deviceid')
						{
								var columns = [
									{"sTitle": "Testerid",	"mData": "testerid"}, 
									{"sTitle": "From",			"mData": "startDt"}, 
									{"sTitle": "To",				"mData": "endDt"}, 
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
								$('#factory').hide();
								$('#tester').hide();
								$('#handler').hide();
								$('#grade').hide();
								$('#lotid').hide();
								$('#dev').show();
								$('#pkg').hide();
						}

						if(params['type'] == 'factory')
						{
								var columns = [
									{"sTitle": "Testerid",		"mData": "testername"},
									{"sTitle": "Handlerid",		"mData": "handlerid"}, 
									{"sTitle": "packageid",		"mData": "packageid"},  
									{"sTitle": "Loadboardid",	"mData": "loadboardid"},  
									{"sTitle": "Status",			"mData": "category"},
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
								$('#tester').hide();
								$('#handler').hide();
								$('#grade').hide();
								$('#lotid').hide();
								$('#dev').hide();
								$('#pkg').hide();
						}

						$('#ttResult').show();
				},
				error: function(response) { // if error occured
					console.log('error: ' + JSON.stringify(response));
				}
			});
		});		

});

