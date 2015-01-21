var factoryArray = new Array();
factoryArray.push('XAP');
factoryArray.push('KYEC');
factoryArray.push('SPIL');
factoryArray.push('ATK');

$(document).ready(function() {	
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

$(function() {
		// --- front end AJAX handler for universal query [lotid]
		$("#btn_search_query").click(function(e){
			e.preventDefault();
			console.log('btn_search_query clicked');
			var params = {};
			var userInput = $("#keystr").val().toUpperCase();
			params['value'] = userInput;			
			if($.inArray(userInput, recentLotArray)!=-1) params['type'] = 'lotid';
			else if($.inArray(userInput, testerArray)!=-1) params['type'] = 'testerid';
			else if($.inArray(userInput, handlerArray)!=-1) params['type'] = 'handlerid';
			else if($.inArray(userInput, deviceArray)!=-1) params['type'] = 'deviceid';
			else if($.inArray(userInput, factoryArray)!=-1) 
			{ 
				params['type'] = 'factory'; 
				params['testers'] = getTesterFromFactory(params['value']);
			}
			else if($.isNumeric(userInput)) params['type'] = 'lotid';

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
									{"sTitle": "lotstartdt",	"mData": "lotstartdt"}, 
									{"sTitle": "ftc",					"mData": "ftc"}, 
									{"sTitle": "tester",			"mData": "testerid"}, 
									{"sTitle": "handler",			"mData": "handlerid"}, 
									{"sTitle": "qty",					"mData": "xamsqty"}, 
									{"sTitle": "testprogname","mData": "testprogname"}, 
									{"sTitle": "testgroup",	  "mData": "testgroup"}, 
									{"sTitle": "speed",				"mData": "speedgrade"}, 
									{"sTitle": "temperature",	"mData": "temperature"}, 
									{"sTitle": "masknum",			"mData": "masknum"}, 
									{"sTitle": "loadboard",		"mData": "loadboardid"}
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
									{"sTitle": "device",		"mData": "deviceid"}, 
									{"sTitle": "package",		"mData": "packageid"}, 
									{"sTitle": "handler",		"mData": "handlerid"}, 
									{"sTitle": "masknum",		"mData": "masknum"}, 
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
									{"sTitle": "Tester",			"mData": "testerid"}, 
									{"sTitle": "device",		"mData": "deviceid"}, 
									{"sTitle": "package",		"mData": "packageid"}, 
									{"sTitle": "masknum",		"mData": "masknum"}, 
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
									{"sTitle": "Maskset",			"mData": "masknum"}, 
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
