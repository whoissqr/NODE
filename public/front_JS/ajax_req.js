var deviceList = new Array();

$(document).ready(function() {		
		jQuery.each(devPkg, function(name, value) {
				deviceList.push(name.toUpperCase());
		});
		deviceList.sort();

		//initialize the data table object
		$('#ttResult').dataTable();
		$("#family").val(0);
});

$(function() {
		// --- update device ID list based on selected device family
		$("#family").change(function() {   		
				var selectedFamily=$('#family :selected').val();
				//console.log('family btn clicked with ' + selectedFamily);
				$("#deviceGrp").empty();
				for(idx in deviceList){
						var currentDev = deviceList[idx];
						if(currentDev[2]==selectedFamily){
								$("#deviceGrp").append('<option>'+currentDev+'</option>');	
						}
						//for special case of EasyPath (3rd letter of device id is alphabetical)
						if(selectedFamily==999){
							console.log(currentDev[2]);
							if(isNaN(currentDev[2]))	{
								$("#deviceGrp").append('<option>'+currentDev+'</option>');	
							}
						}			
				}
				//trigger a device selection
				$("#device").val(0);
		});	

		// --- update availabe package combobox items based on user selected device id ---
		$("#device").change(function() {
			var selectedDev=$('#device :selected').text();
			var pkgList = devPkg[selectedDev];
			$("#packageGrp").empty();
			$("#packageGrp").append('<option>-</option>');
			for (var i = 0; i < pkgList.length; i++) {			
				$("#packageGrp").append('<option>'+pkgList[i]+'</option>');
			}
		});		

		// --- front end AJAX handler for test time query in page /TT ---
		$("#btn_tt_query").click(function(e){
			e.preventDefault();
			//console.log('btn_ftc_query clicked');
			var params = $("#queryForm").serializeArray();;
			//console.log("params: " + params);

			$.ajax({
				url: 'queryTT',	
				type: 'GET',
				data: {jsonParams:JSON.stringify(params)},
				contentType: 'application/json',									
				success: function(json) {
						console.log('success:');			
						$('#ttResult').dataTable().fnClearTable();
						var table = $('#ttResult').dataTable({
								"destroy":true,
								"aoColumns": [
										{ "mData": "device" },
										{ "mData": "testprog" },
										{ "mData": "package" },
										{ "mData": "testgrade" },
										{ "mData": "testgroup" },
										{ "mData": "SCD" },
										{ "mData": "Temp" },
										{ "mData": "qtyin" },
										{ "mData": "qtyout" },
										{ "mData": "testtime" }
								]
						} );
						table.fnAddData(json['aaData']);								
				},
				error: function(response) { // if error occured
					console.log('error: ' + JSON.stringify(response));
				}
			});
		});		

		//--- front end AJAX handler for insertion history in page /ftc ---
		$("#btn_ftc_query").click(function(e){
			e.preventDefault();
			//console.log('btn_ftc_query clicked');
			var params = $("#queryForm").serializeArray();;
			//console.log("params: " + params);

			$.ajax({
				url: 'queryFTC',	
				type: 'GET',
				data: {jsonParams:JSON.stringify(params)},
				contentType: 'application/json',									
				success: function(json) {
						console.log('success:');			
						$('#ttResult').dataTable().fnClearTable();
						var table = $('#ttResult').dataTable({
								"destroy":true,
								"aoColumns": [
										{ "mData": "device" },
										{ "mData": "package" },
										{ "mData": "lotid" },
										{ "mData": "scd" },
										{ "mData": "testgrade" },
										{ "mData": "startDate" },
										{ "mData": "endDate" },
										{ "mData": "FTC-seq" },
								]
						} );
						table.fnAddData(json['aaData']);								
				},
				error: function(response) { // if error occured
					console.log('error: ' + JSON.stringify(response));
				}
			});
		});		

});