$(document).ready(function() {		
		//--- front end AJAX handler for search engine ---
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
		}

		);
});