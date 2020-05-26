/**
 * Login Manager Profile 
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

var loginManagerProfileList = null;
var selectLoginManProfile = false;
var loginManagerPluginImpl = null;
var days = [];
var selectedLoginManagerProfileId = null;

getProfileList();
hideAndShowLoginManagerProfileButton();
getCurrentDate();

for (var i = 0; i < pluginProfileList.length; i++) {
	if(pluginProfileList[i].page == 'login-manager-profile'){
		loginManagerPluginImpl = pluginProfileList[i].plugin;
	}
}

//get login manager profile list
function getProfileList() {
	var params = {
			"name" : "login-manager"
	};
	$.ajax({
		type : 'POST',
		url : '/profile/list',
		data: params,
		dataType : 'json',
		success : function(data) {
			loginManagerProfileList = data;
			createLoginManagerProfileTable();
		}
	});
}

function getCurrentDate() {
	var date = new Date();
	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();

	if (day < 10) {
		day = "0" + day;
	}
	if (month < 10) {
		month = "0" + month;
	}
	var currentDate = year + "-" + month + "-" + day;
	$("#lastAvailabilityDate").val(currentDate);

	var hour = date.getHours();
	if (hour < 10) {
		hour = "0" + hour;
	}
	var minute = date.getMinutes();
	if (minute < 10) {
		minute = "0" + minute;
	}
	var currentTime = hour + ':' + minute;
	$("#loginManagerStartTime").val(currentTime);
	$("#loginManagerEndTime").val(currentTime);
}

$('#loginManagerProfileTable').on('click', 'tbody tr', function(event) {
	if(loginManagerProfileList != null && loginManagerProfileList.length > 0) {
		defaultLoginManagerSetting();
		if($(this).hasClass('policysettings')){
			$(this).removeClass('policysettings');
			selectLoginManProfile = false;
			selectedLoginManagerProfileId = null;
			hideAndShowLoginManagerProfileButton();
		} else {
			$(this).addClass('policysettings').siblings().removeClass('policysettings');
			selectedLoginManagerProfileId = $(this).attr('id');
			selectLoginManProfile = true;
			hideAndShowLoginManagerProfileButton();
			showDetailSelectedLoginManagerProfile();
		}
	}
});

function showDetailSelectedLoginManagerProfile() {
	for (var i = 0; i < loginManagerProfileList.length; i++) {
		if (selectedLoginManagerProfileId == loginManagerProfileList[i].id) {
			$('#loginManagerProfileNameForm').val(loginManagerProfileList[i].label);
			$('#loginManagerProfileDescriptionForm').val(loginManagerProfileList[i].description);
			$("#lastAvailabilityDate").val(loginManagerProfileList[i].profileData['last-date']);
			$("#loginManagerStartTime").val(loginManagerProfileList[i].profileData['start-time']);
			$("#loginManagerEndTime").val(loginManagerProfileList[i].profileData['end-time']);
			$('#notifyBeforeLogout').val(loginManagerProfileList[i].profileData.duration).change();
			days = loginManagerProfileList[i].profileData.days;
			setDaysOfProfile(days);
		}
	}
} 

function setDaysOfProfile(days) {
	var currentDaysIdList = ["mondayCb", "tuesdayCb", "wednesdayCb", "thursdayCb", "fridayCb", "saturdayCb", "sundayCb"];
	for (var i = 0; i < currentDaysIdList.length; i++) {
		for (var j = 0; j < days.length; j++) {
			if ($("#"+ currentDaysIdList[i]).val() == days[j]) {
				$("#"+ currentDaysIdList[i]).prop('checked', true);
			}
		}
	}
}

function defaultLoginManagerSetting() {
	$('#loginManagerProfileNameForm').val("");
	$('#loginManagerProfileDescriptionForm').val("");
	getCurrentDate();
	days = [];
	$('.days').prop('checked', false);
	$('#notifyBeforeLogout').val("1").change();
}

function hideAndShowLoginManagerProfileButton() {
	if (selectLoginManProfile == false) {
		$("#loginManagerProfileDel").hide();
		$("#loginManagerProfileUpdate").hide();
		$("#loginManagerProfileAddToPolicy").hide();
		$("#loginManagerProfileSave").show();
	} else {
		$("#loginManagerProfileDel").show();
		$("#loginManagerProfileUpdate").show();
		$("#loginManagerProfileAddToPolicy").show();
		$("#loginManagerProfileSave").hide();
	}
}

//onclick days check box
function changeDay(select) {
	var day = select.value;
	if(select.checked) {
		days.push(day);
	} else {
		var index = findIndexDayList(day);
		if (index > -1) {
			days.splice(index, 1);
		}
	}
}

//return unselect day index
function findIndexDayList(day) {
	var index = -1;
	for (var i = 0; i < days.length; i++) { 
		if (days[i] == day) {
			index = i;
		}
	}
	return index;
}

//created login manager profile table
function createLoginManagerProfileTable() {
	hideAndShowLoginManagerProfileButton();
	defaultLoginManagerSetting();
	if ($("#LoginManagerProfleListEmptyInfo").length > 0) {
		$("#LoginManagerProfleListEmptyInfo").remove();
	}

	if(loginManagerProfileList != null && loginManagerProfileList.length > 0) {
		var profile = "";
		for (var i = 0; i < loginManagerProfileList.length; i++) {
			var profileId = loginManagerProfileList[i].id;
			var profileName = loginManagerProfileList[i].label;
			var profileDescription = loginManagerProfileList[i].description;
			var profileCreateDate = loginManagerProfileList[i].createDate;
			var profileOfPlugin = loginManagerProfileList[i].plugin.name;
			var profileDeleted = loginManagerProfileList[i].deleted;
			if (profileDeleted == false) {

				profile += "<tr id="+ profileId +">";
				profile += '<td>'+ profileName +'</td>';
				profile += '<td>'+ profileDescription +'</td>';
				profile += '<td>'+ profileCreateDate +'</td>';
				profile += '</tr>';

			}
		}
		$('#loginManagerProfileBody').html(profile);
	} else {
		$('#loginManagerProfileBody').html('<tr id="LoginManagerProfleListEmptyInfo"><td colspan="3" class="text-center">Oturum yönetimi ayarı bulunamadı.</td></tr>');
	}
}

//save login manager profile
$("#loginManagerProfileSave").click(function(e){
	var label = $('#loginManagerProfileNameForm').val();
	var description = $('#loginManagerProfileDescriptionForm').val();

	var profileData = {
			"days": days,
			"start-time": $("#loginManagerStartTime").val(),
			"end-time": $("#loginManagerEndTime").val(),
			"last-date": $("#lastAvailabilityDate").val(),
			"duration": $("#notifyBeforeLogout").val()
	};

	if (label != "") {
		if (checkedProfileName(label) == false) {
			var params = {
					"label": label,
					"description": description,
					"profileData": profileData,
					"plugin": loginManagerPluginImpl
			};
			$.ajax({
				type : 'POST',
				url : '/profile/add',
				data: JSON.stringify(params),
				dataType : 'json',
				contentType: "application/json",
				success : function(data) {
					if(data != null) {
						$.notify("Oturum yönetimi ayarı başarıyla kaydedildi.", "success");
						loginManagerProfileList.push(data);
						createLoginManagerProfileTable();
					} 
				},
				error: function (data, errorThrown) {
					$.notify("Oturum yönetimi ayarı kaydedilirken hata oluştu. ", "error");
				},
			});
		} else {
			$.notify("Ayar adı aynı olamaz.", "warn");
		}
	} else {
		$.notify("Lütfen ayar adı giriniz.", "warn");
	}
});

//delete selected login manager profile
$("#loginManagerProfileDel").click(function(e){
	if (selectLoginManProfile == true) {
		var params = {
				"id": selectedLoginManagerProfileId,
		};

		$.ajax({
			type : 'POST',
			url : '/profile/del',
			data: JSON.stringify(params),
			dataType : 'json',
			contentType: "application/json",
			success : function(data) {
				if(data != null) {
					$.notify("Oturum yönetimi ayarı başarıyla silindi.", "success");
					var index = findIndexInLoginManagerProfileList(selectedLoginManagerProfileId);
					if (index > -1) {
						loginManagerProfileList.splice(index, 1);
					}
					selectedLoginManagerProfileId = null;
					selectLoginManProfile = false;
					createLoginManagerProfileTable();
				} 
			},
			error: function (data, errorThrown) {
				$.notify("Oturum yönetimi ayarı silinirken hata oluştu.", "error");
			},
		});
	} else {
		$.notify("Lütfen silmek için ayar seçiniz.", "warn");
	}
});

function findIndexInLoginManagerProfileList(id) {
	var index = -1;
	for (var i = 0; i < loginManagerProfileList.length; i++) { 
		if (loginManagerProfileList[i]["id"] == id) {
			index = i;
		}
	}
	return index;
}

function checkedProfileName(label) {
	var isExist = false;
	for (var i = 0; i < loginManagerProfileList.length; i++) {
		if (label == loginManagerProfileList[i].label) {
			isExist = true;
		}
	}
	return isExist;
}

//added select profile to general profile table profileListTable
$("#loginManagerProfileAddToPolicy").click(function(e){
	for (var i = 0; i < loginManagerProfileList.length; i++) {
		if (selectedLoginManagerProfileId == loginManagerProfileList[i].id) {
			addProfileToPolicy(loginManagerProfileList[i]);
		}
	}
});

//updated select profile
$("#loginManagerProfileUpdate").click(function(e){

	var label = $('#loginManagerProfileNameForm').val();
	var description = $('#loginManagerProfileDescriptionForm').val();

	var existLabel = null;
	for (var i = 0; i < loginManagerProfileList.length; i++) {
		if (selectedLoginManagerProfileId == loginManagerProfileList[i].id) {
			existLabel = loginManagerProfileList[i].label;
		}
	}
	var profileData = {
			"days": days,
			"start-time": $("#loginManagerStartTime").val(),
			"end-time": $("#loginManagerEndTime").val(),
			"last-date": $("#lastAvailabilityDate").val(),
			"duration": $("#notifyBeforeLogout").val()
	};

	if (label != "") {
		if (label != existLabel) {
			if (checkedProfileName(label) == true) {
				$.notify("Ayar adı aynı olamaz.", "warn");
				return
			}
		}

		var params = {
				"id": selectedLoginManagerProfileId,
				"label": label,
				"description": description,
				"profileData": profileData
		};
		$.ajax({
			type : 'POST',
			url : '/profile/update',
			data: JSON.stringify(params),
			dataType : 'json',
			contentType: "application/json",
			success : function(data) {
				if(data != null) {
					$.notify("Oturum yönetimi ayarı başarıyla güncellendi.", "success");
					var index = findIndexInLoginManagerProfileList(selectedLoginManagerProfileId);
					if (index > -1) {
						loginManagerProfileList.splice(index, 1);
					}
					loginManagerProfileList.push(data);
					selectedLoginManagerProfileId = null;
					selectLoginManProfile = false;
					createLoginManagerProfileTable();
				} 
			},
			error: function (data, errorThrown) {
				$.notify("Oturum yönetimi ayarı güncellenirken hata oluştu.", "error");
			},
		});
	} else {
		$.notify("Lütfen ayar adı giriniz.", "warn");
	}
});
