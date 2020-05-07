/**
 * Policy management. This page created, list, deleted, updated policy and detail selected policy
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
var policyProfileTable = null;
var policyProfileList = [];
var selectedProfileId = null;
var selectedPolicyId = null;

getPolicyList();
getProfilPages();
createPolicyChart(null);
createProfileTableOfPolicy(null);
hideAndShowPolicyButton(false);

function getPolicyList() {
	$.ajax({
		type : 'POST',
		url : '/policy/list',
		dataType : 'json',
		success : function(data) {
			if(data != null && data.length > 0) {
				policyList = data;
				console.log(data)
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
	if (policyProfileTable) {
		policyProfileTable.clear();
		policyProfileTable.destroy();
		policyProfileTable = null;
		policyProfileList = [];
	}
	if ( $(this).hasClass('selected') ) {
		$(this).removeClass('selected');
		$("#policyNameForm").val("");
		$("#policyDescriptionForm").val("");
		createPolicyChart(null);
		createProfileTableOfPolicy();
		hideAndShowPolicyButton(false);
		selectedPolicyId = null;
	} else {
		policyTable.$('tr.selected').removeClass('selected');
		$(this).addClass('selected');
		selectedPolicyId = $(this).attr('id');
		getSelectedPolicyData();
		createProfileTableOfPolicy();
		hideAndShowPolicyButton(true);
	}
});

function getSelectedPolicyData() {
	for (var i = 0; i < policyList.length; i++) {
		if (policyList[i].id == selectedPolicyId) {
			$("#policyNameForm").val(policyList[i].label);
			$("#policyDescriptionForm").val(policyList[i].description);
			var  profiles = policyList[i].profiles;
			if (profiles != null && profiles.length > 0) {
				for (var i = 0; i < profiles.length; i++) {
					policyProfileList.push(profiles[i]);
				}
			}
			console.log(policyProfileList)
//			createProfileTableOfPolicy();
		}
	}
}

function createProfileTableOfPolicy() {
	if (policyProfileTable) {
		policyProfileTable.clear();
		policyProfileTable.destroy();
		policyProfileTable = null;
	}
	var chartLabelList = [];

	if(policyProfileList != null && policyProfileList.length > 0) {
		for (var i = 0; i < policyProfileList.length; i++) {
			var profileId = policyProfileList[i].id;
			var profileName = policyProfileList[i].label;
			var profileDescription =  policyProfileList[i].description;
			var pluginOfProfile = policyProfileList[i].plugin.name;

			var newRow = $("<tr id="+ profileId +">");
			var html = '<td>'+ profileName +'</td>';

			html += '<td>'+ profileDescription +'</td>';
			html += '<td>'+ pluginOfProfile +'</td>';
			newRow.append(html);
			$("#policyProfileTable").append(newRow);
			chartLabelList.push(pluginOfProfile);

		}
	}
	createPolicyChart(chartLabelList);

	policyProfileTable = $('#policyProfileTable').DataTable( {
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

//added profile of plugins to selected policy or new created policy
function addProfileToPolicy(profile) {
	if (policyProfileList.length > 0) {
		if (checkedPluginOfProfile(profile) == false) {
			policyProfileList.push(profile);
			createProfileTableOfPolicy();
			$.notify("Profil başarıyla eklendi.", "success");
		} else {
			$.notify("Bir politikada aynı eklentiye ait birden fazla profil olamaz.", "warn");
		}
	} else {
		policyProfileList.push(profile);
		createProfileTableOfPolicy();
		$.notify("Profil başarıyla eklendi.", "success");
	}
}

function checkedPluginOfProfile(profile) {
	var isExist = false;
	for (var i = 0; i < policyProfileList.length; i++) {
		if (profile.plugin.id == policyProfileList[i].plugin.id) {
			isExist = true;
		}
	}
	return isExist;
}

$('#policyProfileTable tbody').on( 'click', 'tr', function () {
	if ( $(this).hasClass('selected') ) {
		$(this).removeClass('selected');
		$('#removeProfileBtn').hide();
		selectedProfileId = null;
	} else {
		policyProfileTable.$('tr.selected').removeClass('selected');
		$(this).addClass('selected');
		selectedProfileId = $(this).attr('id');
		$('#removeProfileBtn').show();
	}
});

function findIndexInPolicyProfileList() {
	var index = -1;
	for (var i = 0; i < policyProfileList.length; i++) { 
		if (policyProfileList[i]["id"] == selectedProfileId) {
			index = i;
		}
	}
	return index;
}

//remove selected profile from  policyProfileList
$("#removeProfileBtn").click(function(e){
	var index = findIndexInPolicyProfileList();
	if (index > -1) {
		policyProfileList.splice(index, 1);
//		$("#"+ selectedProfileId +"").closest("tr").remove();
		createProfileTableOfPolicy();
		selectedProfileId = null;
	}
});

//save policy to database
$("#addPolicyBtn").click(function(e){
	
	var label = $('#policyNameForm').val();
	var description = $('#policyDescriptionForm').val();
//	var profilesListId = [];
//	for (var i = 0; i < policyProfileList.length; i++) {
//		profilesListId.push(policyProfileList[i].id);
//		
//	}
	var params = {
			"label": label,
			"description": description,
			"profiles": policyProfileList
	};
	console.log(params)
	
	$.ajax({
		type : 'POST',
		url : '/policy/add',
		data: JSON.stringify(params),
		contentType: "application/json",
		dataType : 'json',
		success : function(data) {
			console.log(data)
			if(data != null) {
				$.notify("Politika başarıyla kaydedildi.", "success");
//				profileList.push(data);
//				scriptProfileTable.clear().draw();
//				scriptProfileTable.destroy();
//				createScriptProfileTable();
//				$('#scriptProfileNameForm').val("");
//				$('#scriptProfileDescriptionForm').val("");
			} 
		},
		error: function (data, errorThrown) {
			$.notify("Politika kaydedilirken hata oluştu. ", "error");
			console.log(errorThrown)
		},
	});
	
});


// load profile pages when on clicked profile management 
function getProfilPages() {
	$.ajax({
		type : 'POST',
		url : 'getPluginProfileList',
		dataType : 'json',
		success : function(data) {
			pluginProfileList = data;

			for (var i = 0; i < pluginProfileList.length; i++) {
				var pluginProfile = pluginProfileList[i];
				if(pluginProfile.page == 'conky-profile'){
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
			for (var i = 0; i < pluginProfileList.length; i++) {
				var pluginProfile = pluginProfileList[i];
				if(pluginProfile.page == 'browser-profile'){
					$.ajax({
						type : 'POST',
						url : 'getPluginProfileHtmlPage',
						data : 'id=' + pluginProfile.id + '&name=' + pluginProfile.name	+ '&page=' + pluginProfile.page + '&description=' + pluginProfile.description,
						dataType : 'text',
						success : function(result) {
							$('#browser-profile').html(result);
						}
					});
				}
			}
			for (var i = 0; i < pluginProfileList.length; i++) {
				var pluginProfile = pluginProfileList[i];
				if(pluginProfile.page == 'disk-quota-profile'){
					$.ajax({
						type : 'POST',
						url : 'getPluginProfileHtmlPage',
						data : 'id=' + pluginProfile.id + '&name=' + pluginProfile.name	+ '&page=' + pluginProfile.page + '&description=' + pluginProfile.description,
						dataType : 'text',
						success : function(result) {
							$('#disk-quota-profile').html(result);
						}
					});
				}
			}
			for (var i = 0; i < pluginProfileList.length; i++) {
				var pluginProfile = pluginProfileList[i];
				if(pluginProfile.page == 'login-manager-profile'){
					$.ajax({
						type : 'POST',
						url : 'getPluginProfileHtmlPage',
						data : 'id=' + pluginProfile.id + '&name=' + pluginProfile.name	+ '&page=' + pluginProfile.page + '&description=' + pluginProfile.description,
						dataType : 'text',
						success : function(result) {
							$('#login-manager-profile').html(result);
						}
					});
				}
			}
			for (var i = 0; i < pluginProfileList.length; i++) {
				var pluginProfile = pluginProfileList[i];
				if(pluginProfile.page == 'rsyslog-profile'){
					$.ajax({
						type : 'POST',
						url : 'getPluginProfileHtmlPage',
						data : 'id=' + pluginProfile.id + '&name=' + pluginProfile.name	+ '&page=' + pluginProfile.page + '&description=' + pluginProfile.description,
						dataType : 'text',
						success : function(result) {
							$('#rsyslog-profile').html(result);
						}
					});
				}
			}
			for (var i = 0; i < pluginProfileList.length; i++) {
				var pluginProfile = pluginProfileList[i];
				if(pluginProfile.page == 'usb-profile'){
					$.ajax({
						type : 'POST',
						url : 'getPluginProfileHtmlPage',
						data : 'id=' + pluginProfile.id + '&name=' + pluginProfile.name	+ '&page=' + pluginProfile.page + '&description=' + pluginProfile.description,
						dataType : 'text',
						success : function(result) {
							$('#usb-profile').html(result);
						}
					});
				}
			}
			for (var i = 0; i < pluginProfileList.length; i++) {
				var pluginProfile = pluginProfileList[i];
				if(pluginProfile.page == 'user-privilege-profile'){
					$.ajax({
						type : 'POST',
						url : 'getPluginProfileHtmlPage',
						data : 'id=' + pluginProfile.id + '&name=' + pluginProfile.name	+ '&page=' + pluginProfile.page + '&description=' + pluginProfile.description,
						dataType : 'text',
						success : function(result) {
							$('#user-privileg-profile').html(result);
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
		$('#policyUpdateBtn').show();
		$('#addPolicyBtn').hide();
	} else {
		$('#policyDisableBtn').hide();
		$('#policyEnableBtn').hide();
		$('#policyDelBtn').hide();
		$('#policyUpdateBtn').hide();
		$('#addPolicyBtn').show();
		$('#removeProfileBtn').hide();
	}
}



