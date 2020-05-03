/**
 * Policy management. This page create, list, delete, update policy and detail selected policy
 * 
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

//generic variables
var selectedEntries = []; 
var pluginProfileList = null;
var policyList = null;
var policyTable = null;
var profileTable = null;
var profileList = null;

getPolicyList();
getProfileList();
getProfilPages();
createPolicyChart(null);
createProfileTable(null);
hideAndShowPolicyButton(false);

function getPolicyList() {
	showPageAndHideOthers('policyPage');

	$.ajax({
		type : 'POST',
		url : '/policy/list',
		dataType : 'json',
		success : function(data) {
			if(data != null && data.length > 0) {
				policyList = data;
				for (var i = 0; i < policyList.length; i++) {
					var policyId = policyList[i].id;
					var policyName = policyList[i].label;
					var policyDescription = policyList[i].description;
					var policyStatus = "Aktif";
					if (policyList[i].active == false) {
						policyStatus = "Pasif";
					}
					if (policyList[i].deleted == false) {
						var newRow = $("<tr id="+ policyId +">");
						var html = '<td>'+ policyName +'</td>';
						html += '<td>'+ policyDescription +'</td>';
						html += '<td>'+ policyStatus +'</td>';
						newRow.append(html);
						$("#policyListTable").append(newRow);
					}
				}
			}

			policyTable = $('#policyListTable').DataTable( {
				"scrollY": "200px",
				"scrollX": false,
				"paging": false,
				"scrollCollapse": true,
				"oLanguage": {
					"sSearch": "Politika Ara:",
					"sInfo": "Toplam politika sayısı: _TOTAL_",
					"sInfoEmpty": "Gösterilen politika sayısı: 0",
					"sZeroRecords" : "Politika bulunamadı",
					"sInfoFiltered": " - _MAX_ kayıt arasından",
				},
			} );
		}
	});
}

$('#policyListTable tbody').on( 'click', 'tr', function () {
	if (profileTable) {
		profileTable.clear();
		profileTable.destroy();
		profileTable = null;
	}

	if ( $(this).hasClass('selected') ) {
		$(this).removeClass('selected');
		$("#policyNameForm").val("");
		$("#policyDescriptionForm").val("");
		createPolicyChart(null);
		createProfileTable(null);
		hideAndShowPolicyButton(false);
	} else {

		policyTable.$('tr.selected').removeClass('selected');
		$(this).addClass('selected');
		var selectedPolicyId = policyTable.rows('.selected').data()[0].DT_RowId;
		getSelectedPolicyData(selectedPolicyId);
		hideAndShowPolicyButton(true);

	}
});

function getSelectedPolicyData(policyId) {
	for (var i = 0; i < policyList.length; i++) {
		if (policyList[i].id == policyId) {
			$("#policyNameForm").val(policyList[i].label);
			$("#policyDescriptionForm").val(policyList[i].description);
			var  profilesOfSelectedPolicy = policyList[i].profiles;
			createProfileTable(profilesOfSelectedPolicy);

		}
	}

}

function createProfileTable(profilesOfSelectedPolicy) {
	var chartLabelList = [];
	if(profilesOfSelectedPolicy != null && profilesOfSelectedPolicy.length > 0) {
		for (var i = 0; i < profilesOfSelectedPolicy.length; i++) {
			var profileId = profilesOfSelectedPolicy[i].id;
			var profileName = profilesOfSelectedPolicy[i].label;
			var profileDescription =  profilesOfSelectedPolicy[i].description;
			var pluginOfProfile = profilesOfSelectedPolicy[i].plugin.name;

			var newRow = $("<tr id="+ profileId +">");
			var html = '<td>'+ profileName +'</td>';
			html += '<td>'+ profileDescription +'</td>';
			html += '<td>'+ pluginOfProfile +'</td>';
			newRow.append(html);
			$("#profileListTable").append(newRow);
			chartLabelList.push(pluginOfProfile);

		}
		createPolicyChart(chartLabelList);
	}

	profileTable = $('#profileListTable').DataTable( {
		"scrollY": "200px",
		"scrollX": false,
		"searching": false,
		"paging": false,
		"scrollCollapse": true,
		"oLanguage": {
			"sSearch": "Profil Ara:",
			"sInfo": "Toplam profil sayısı: _TOTAL_",
			"sInfoEmpty": "Gösterilen profil sayısı: 0",
			"sZeroRecords" : "Profil bulunamadı",
			"sInfoFiltered": " - _MAX_ kayıt arasından",
		},
	} );
}

function getProfileList() {

	$.ajax({
		type : 'POST',
		url : '/profile/list',
		dataType : 'json',
		success : function(data) {
			if(data != null && data.length > 0) {
				profileList = data;
//				for (var i = 0; i < policyList.length; i++) {
//				var policyId = policyList[i].id;
//				var policyName = policyList[i].label;
//				var policyDescription = policyList[i].description;
//				var policyStatus = "Aktif";
//				if (policyList[i].active == false) {
//				policyStatus = "Pasif";
//				}
//				if (policyList[i].deleted == false) {
//				var newRow = $("<tr id="+ policyId +">");
//				var html = '<td>'+ policyName +'</td>';
//				html += '<td>'+ policyDescription +'</td>';
//				html += '<td>'+ policyStatus +'</td>';
//				newRow.append(html);
//				$("#policyListTable").append(newRow);
//				}
//				}
			}

//			profileTable = $('#policyListTable').DataTable( {
//			"scrollY": "200px",
//			"scrollX": false,
//			"paging": false,
//			"scrollCollapse": true,
//			"oLanguage": {
//			"sSearch": "Politika Ara:",
//			"sInfo": "Toplam politika sayısı: _TOTAL_",
//			"sInfoEmpty": "Gösterilen politika sayısı: 0",
//			"sZeroRecords" : "Politika bulunamadı",
//			"sInfoFiltered": " - _MAX_ kayıt arasından",
//			},
//			} );
		}
	});


}

function getProfilPages() {
//	showPageAndHideOthers('profilePage');
	$.ajax({
		type : 'POST',
		url : 'getPluginProfileList',
		dataType : 'json',
		success : function(data) {
			pluginProfileList = data;

			for (var i = 0; i < pluginProfileList.length; i++) {
				var pluginProfile = pluginProfileList[i];
				if(pluginProfile.page == 'conky-policy'){
					$.ajax({
						type : 'POST',
						url : 'getPluginProfileHtmlPage',
						data : 'id=' + pluginProfile.id + '&name=' + pluginProfile.name	+ '&page=' + pluginProfile.page + '&description=' + pluginProfile.description,
						dataType : 'text',
						success : function(result) {
							$('#conky-profile').html(result);
						}
					});
				}
			}
			for (var i = 0; i < pluginProfileList.length; i++) {
				var pluginProfile = pluginProfileList[i];
				if(pluginProfile.page == 'execute-script-profile'){
					$.ajax({
						type : 'POST',
						url : 'getPluginProfileHtmlPage',
						data : 'id=' + pluginProfile.id + '&name=' + pluginProfile.name	+ '&page=' + pluginProfile.page + '&description=' + pluginProfile.description,
						dataType : 'text',
						success : function(result) {
							$('#execute-script-profile').html(result);
						}
					});
				}
			}
		}
	});
}

function createPolicyChart(chartLabelList) {
	var data = [];
	var display = true;
	if (chartLabelList != null && chartLabelList.length > 0) {
		for (var i = 0; i < chartLabelList.length; i++) {
			var rate = (1/chartLabelList.length).toFixed(2);
			data.push(rate);
		}
	} else {
		data = [50, 50];
		chartLabelList = ["Boş", "Boş"];
		display = false;
	}


	var diskChart = document.getElementById("policyInfoChart").getContext('2d');
	systemChart2 = new Chart(diskChart, {
		type: 'doughnut',
		data: {
			labels: chartLabelList,
			datasets: [{
				data: data,
				backgroundColor: ["#F7464A", "#46BFBD", "#FDB45C", "#949FB1", "#4D5360"],
				hoverBackgroundColor: ["#FF5A5E", "#5AD3D1", "#FFC870", "#A8B3C5", "#616774"]
			}]
		},
		options: {
			responsive: true,
			legend: {
				display: display
			},
			title: {
				display: true,
				text: 'Politika içinde bulunan profil sayısı'
			}
		}
	});
}

function hideAndShowPolicyButton(select) {
	if (select == true) {
		$('#policyDisableBtn').show();
		$('#policyEnableBtn').show();
		$('#policyDelBtn').show();
	} else {
		$('#policyDisableBtn').hide();
		$('#policyEnableBtn').hide();
		$('#policyDelBtn').hide();
	}
	
	
	
	
}



