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
hideAndShowPolicyButton(false);

function getPolicyList() {
	$.ajax({
		type : 'POST',
		url : '/policy/list',
		dataType : 'json',
		success : function(data) {
			policyList = data;
			createPolicyTable();
		}
	});
}

function createPolicyTable() {

	if ($("#policyListEmptyInfo").length > 0) {
		$("#policyListEmptyInfo").remove();
	}

	if (policyTable) {
		policyTable.clear();
		policyTable.destroy();
		policyTable = null;
	}

	if(policyList != null && policyList.length > 0) {
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
	} else {
		$('#policyListBody').html('<tr id="policyListEmptyInfo"><td colspan="3" class="text-center">Politika bulunamadı.</td></tr>');
	}
}

//clicked on policy list table 
$('#policyListTable tbody').on( 'click', 'tr', function () {
	if (policyProfileTable) {
		policyProfileTable.clear();
		policyProfileTable.destroy();
		policyProfileTable = null;
		policyProfileList = [];
	}
	if (policyTable) {
		if ( $(this).hasClass('selected') ) {
			$(this).removeClass('selected');
			$("#policyNameForm").val("");
			$("#policyDescriptionForm").val("");
			createPolicyChart(null);
			hideAndShowPolicyButton(false);
			selectedPolicyId = null;
			policyProfileList = [];
		} else {
			policyTable.$('tr.selected').removeClass('selected');
			$(this).addClass('selected');
			selectedPolicyId = $(this).attr('id');
			hideAndShowPolicyButton(true);
			getSelectedPolicyData();
		}
	}
});

//get detail for selected policy
function getSelectedPolicyData() {
	for (var i = 0; i < policyList.length; i++) {
		if (policyList[i].id == selectedPolicyId) {
			$("#policyNameForm").val(policyList[i].label);
			$("#policyDescriptionForm").val(policyList[i].description);

			const profilesOfPolicy = policyList[i].profiles;
			policyProfileList = profilesOfPolicy;
			createProfileTableOfPolicy();
		}
	}
}

//created profile table for detail of selected policy or added profile
function createProfileTableOfPolicy() {
	if ($("#profileListEmptyInfo").length > 0) {
		$("#profileListEmptyInfo").remove();
	}
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
			$("#profileListBody").append(newRow);
			chartLabelList.push(pluginOfProfile);
		}
		policyProfileTable = $('#policyProfileTable').DataTable( {
			"scrollY": "200px",
			"scrollX": false,
			"searching": false,
			"paging": false,
			"scrollCollapse": true,
			"oLanguage": {
				"sSearch": "Ara:",
				"sInfo": "Toplam ayar sayısı: _TOTAL_",
				"sInfoEmpty": "Gösterilen ayar sayısı: 0",
				"sZeroRecords" : "Ayar bulunamadı",
				"sInfoFiltered": " - _MAX_ kayıt arasından",
			},
		} );
	} else {
		$('#profileListBody').html('<tr id="profileListEmptyInfo"><td colspan="3" class="text-center">Lütfen ayar ekleyiniz.</td></tr>');
	}
	createPolicyChart(chartLabelList);
}

//added profile of plugins to selected policy or new created policy
function addProfileToPolicy(profile) {
	if (policyProfileList.length > 0) {
		if (checkedPluginOfProfile(profile) == false) {
			policyProfileList.push(profile);
			createProfileTableOfPolicy();
			$.notify("Ayar başarıyla eklendi.", "success");
		} else {
			$.notify("Bir politikada aynı özelliğe ait birden fazla ayar olamaz.", "warn");
		}
	} else {
		policyProfileList.push(profile);
		createProfileTableOfPolicy();
		$.notify("Ayar başarıyla eklendi.", "success");
	}
}

//checked profile for added new profile 
function checkedPluginOfProfile(profile) {
	var isExist = false;
	for (var i = 0; i < policyProfileList.length; i++) {
		if (profile.plugin.id == policyProfileList[i].plugin.id) {
			isExist = true;
		}
	}
	return isExist;
}

//clicked on policy profile list
$('#policyProfileTable tbody').on( 'click', 'tr', function () {
	if (policyProfileTable) {
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
	}
});

//find index for selected row id
function findIndexInPolicyAndProfileList(listName, id) {
	var index = -1;
	for (var i = 0; i < listName.length; i++) { 
		if (listName[i]["id"] == id) {
			index = i;
		}
	}
	return index;
}

//checked policy name 
function checkedPolicyName(label) {
	var isExist = false;
	for (var i = 0; i < policyList.length; i++) {
		if (label == policyList[i].label) {
			isExist = true;
		}
	}
	return isExist;
}

//remove selected profile from  policyProfileList
$("#removeProfileBtn").click(function(e){
	var index = findIndexInPolicyAndProfileList(policyProfileList, selectedProfileId);
	if (index > -1) {
		policyProfileList.splice(index, 1);
//		$("#"+ selectedProfileId +"").closest("tr").remove();
		$('#removeProfileBtn').hide();
		createProfileTableOfPolicy();
		selectedProfileId = null;
	}
});

//save policy to database
$("#policyAddBtn").click(function(e){

	var label = $('#policyNameForm').val();
	var description = $('#policyDescriptionForm').val();
	if (policyProfileList.length > 0) {
		if (label != "") {
			if (checkedPolicyName(label) == false) {
				var params = {
						"label": label,
						"description": description,
						"profiles": policyProfileList
				};

				$.ajax({
					type : 'POST',
					url : '/policy/add',
					data: JSON.stringify(params),
					contentType: "application/json",
					dataType : 'json',
					success : function(data) {
						if(data != null) {
							$.notify("Politika başarıyla kaydedildi.", "success");
							policyList.push(data);
							createPolicyTable();
							EmptyProfileTableOfPolicy();
						} 
					},
					error: function (data, errorThrown) {
						$.notify("Politika kaydedilirken hata oluştu. ", "error");
					},
				});
			} else {
				$.notify("Politika adı aynı olamaz. ", "warn");
			}
		} else {
			$.notify("Lütfen politika adı giriniz. ", "warn");
		}
	} else {
		$.notify("Politika oluşturmak için en az bir adet ayar seçilmelidir. ", "warn");
	}
});

//deleted selected policy from database
$("#policyDelBtn").click(function(e){
	var params = {
			"id": selectedPolicyId,
	};

	$.ajax({
		type : 'POST',
		url : '/policy/del',
		data: JSON.stringify(params),
		contentType: "application/json",
		dataType : 'json',
		success : function(data) {
			if(data != null) {
				$.notify("Politika başarıyla silindi.", "success");
				var index = findIndexInPolicyAndProfileList(policyList, selectedPolicyId);
				if (index > -1) {
					policyList.splice(index, 1);
					createPolicyTable();
					hideAndShowPolicyButton(false);
					EmptyProfileTableOfPolicy();
				}
			} 
		},
		error: function (data, errorThrown) {
			$.notify("Politika silinirken hata oluştu. ", "error");
		},
	});
});

//enabled selected policy from database
$("#policyActiveBtn").click(function(e){
	var params = {
			"id": selectedPolicyId,
			"active": true
	};

	var index = findIndexInPolicyAndProfileList(policyList, selectedPolicyId);
	var isActive = policyList[index].active;
	if (isActive == false) {
		$.ajax({
			type : 'POST',
			url : '/policy/active',
			data: JSON.stringify(params),
			contentType: "application/json",
			dataType : 'json',
			success : function(data) {
				if(data != null) {
					$.notify("Politika başarıyla aktif edildi.", "success");
					if (index > -1) {
						policyList.splice(index, 1);
						hideAndShowPolicyButton(false);
						policyList.push(data);
						createPolicyTable();
						EmptyProfileTableOfPolicy();
					}
				} 
			},
			error: function (data, errorThrown) {
				$.notify("Politika aktif edilirken hata oluştu. ", "error");
			},
		});
	} else {
		$.notify("Politika zaten aktif ", "warn");
	}
});

//disabled selected policy from database
$("#policyPassiveBtn").click(function(e){
	var params = {
			"id": selectedPolicyId,
			"active": false
	};

	var index = findIndexInPolicyAndProfileList(policyList, selectedPolicyId);
	var isActive = policyList[index].active;
	if (isActive == true) {
		$.ajax({
			type : 'POST',
			url : '/policy/passive',
			data: JSON.stringify(params),
			contentType: "application/json",
			dataType : 'json',
			success : function(data) {
				if(data != null) {
					$.notify("Politika başarıyla pasif edildi.", "success");
					if (index > -1) {
						policyList.splice(index, 1);
						hideAndShowPolicyButton(false);
						policyList.push(data);
						createPolicyTable();
						EmptyProfileTableOfPolicy();
					}
				} 
			},
			error: function (data, errorThrown) {
				$.notify("Politika pasif edilirken hata oluştu. ", "error");
			},
		});
	} else {
		$.notify("Politika zaten pasif ", "warn");
	}
});

//updated selected policy from database
$("#policyUpdateBtn").click(function(e){
	var index = findIndexInPolicyAndProfileList(policyList, selectedPolicyId);
	var label = $('#policyNameForm').val();
	var description = $('#policyDescriptionForm').val();

	existLabel = null;
	for (var i = 0; i < policyList.length; i++) {
		if (selectedPolicyId == policyList[i].id) {
			existLabel = policyList[i].label;
		}
	}
	if (label == "") {
		$.notify("Lütfen politika adı giriniz. ", "warn");
		return;
	}
	if (label != existLabel) {
		if (checkedPolicyName(label) == true) {
			$.notify("Politika adı aynı olamaz. ", "warn");
			return;
		}
	}
	if (!policyProfileList.length > 0) {
		$.notify("Politika güncellemek için en az bir adet ayar seçilmelidir. ", "warn");
		return;
	}
	var params = {
			"id": selectedPolicyId,
			"label": label,
			"description": description,
			"profiles": policyProfileList
	};

	$.ajax({
		type : 'POST',
		url : '/policy/update',
		data: JSON.stringify(params),
		contentType: "application/json",
		dataType : 'json',
		success : function(data) {
			if(data != null) {
				$.notify("Politika başarıyla güncellendi.", "success");
				policyList.splice(index, 1);
				policyList.push(data);
				createPolicyTable();
				EmptyProfileTableOfPolicy();
			} 
		},
		error: function (data, errorThrown) {
			$.notify("Politika güncellenirken hata oluştu. ", "error");
		},
	});
});

//refresh policy list
$("#policyRefreshBtn").click(function(e){
	policyList = null;
	getPolicyList();
	hideAndShowPolicyButton(false);
	EmptyProfileTableOfPolicy();
});

function EmptyProfileTableOfPolicy() {
	selectedPolicyId = null;
	selectedProfileId = null;
	policyProfileList = [];
	$('#policyNameForm').val("");
	$('#policyDescriptionForm').val("");
	createProfileTableOfPolicy();
}

//created chart for selected policy detail
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
	new Chart(diskChart, {
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
				text: 'Politika içindeki ayar sayısı'
			}
		}
	});
}

function hideAndShowPolicyButton(select) {
	if (select == true) {
		$('#policyPassiveBtn').show();
		$('#policyActiveBtn').show();
		$('#policyDelBtn').show();
		$('#policyUpdateBtn').show();
		$('#policyAddBtn').hide();
		$("#profileListBody").empty();
	} else {
		$('#profileListBody').html('<tr id="profileListEmptyInfo"><td colspan="3" class="text-center">Lütfen Politika seçiniz veya Ayar ekleyiniz.</td></tr>');
		$('#policyPassiveBtn').hide();
		$('#policyActiveBtn').hide();
		$('#policyDelBtn').hide();
		$('#policyUpdateBtn').hide();
		$('#policyAddBtn').show();
		$('#removeProfileBtn').hide();
	}
}

//load profile pages when on clicked policy management 
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
