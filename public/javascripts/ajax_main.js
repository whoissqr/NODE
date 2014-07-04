$(document).ready(function() {
		$('#testTimeTable1').dataTable();
		var deviceList = new Array();
		jQuery.each(devPkg, function(name, value) {
				deviceList.push(name.toUpperCase());
		});

		//now sort them based on 3rd char, which is the family char
		//within same dev family, sort by 2nd char
		deviceList.sort(function(a,b){
				if(a[2] == b[2])
						return (a[1] < b[1]? -1:1);
				else
						return (a[2] < b[2]? -1:1);
		});
		console.log(deviceList);

		//assign optGroup based on 3rd char (family char)
		//except for device with non-numerical 3rd char, they are lump sum to 'Easy Path' family instead
		var preFamily = -1;
		var doneGrouping = false;
		for(idx in deviceList){
				var currentDev = deviceList[idx];
				var currFamily = currentDev[2];
				if(!doneGrouping){
						if(currFamily!=preFamily){
								if(currFamily<=7)
								{				
									$("#device").append('<optgroup label=\'== '+currFamily+' series ==\''+'</optgroup>');	
								}
								else
								{
									$("#device").append('<optgroup label=\'== Easy Path ==\'</optgroup>');	
									doneGrouping = true;
								}
								preFamily = currFamily;
						}
				}
				$("#device").append('<option>'+deviceList[idx]+'</option>');
		}
});

$(function() {
		//send test time query using AJAX to url 'queryTT'
		$("#btn_query").click(function(e){
			e.preventDefault();
			//console.log('btn_query clicked');
			var params = $("#queryForm").serializeArray();;
			//console.log("params: " + params);

			$.ajax({
				type: 'GET',
				data: {jsonParams:JSON.stringify(params)},
				contentType: 'application/json',
				url: 'queryTT',						
				success: function(response) {
					console.log('success');			
					document.getElementById("ttResult").innerHTML=response;	
					$('#testTimeTable1').dataTable();			
				},
				error: function(response) { // if error occured
					console.log('error: ' + JSON.stringify(response));
				}
			});
		});		

		//update availabe package selection based on user selected device id
		$("#device").change(function() {
			var selectedDev=$('#device :selected').text();
			var pkgList = devPkg[selectedDev];
			$("#packageGrp").empty();
			$("#packageGrp").append('<option>-</option>');
			for (var i = 0; i < pkgList.length; i++) {			
				$("#packageGrp").append('<option>'+pkgList[i]+'</option>');
			}
		});		

});