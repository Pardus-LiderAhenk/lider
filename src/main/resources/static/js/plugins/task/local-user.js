/**
 * LOCAL USER task module
 * This page get local users from agent. Edit, delete, active or passive and change password for selected local user 
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

if (ref_local_user) {
	connection.deleteHandler(ref_local_user);
}
var scheduledParamLocalUser = null;
var scheduledModalLocalUserOpened = false;
var dnlist = [];
var pluginTask_LocalUser = null;
var tableLocalUser = null;
var groupsSelectBox = null;
var users = [];
var allGroups = [];
var selectUserName = null;
var ref_local_user=connection.addHandler(localUserListener, null, 'message', null, null,  null);

var lowerCase = "abcdefghijklmnopqrstuvwxyz";
var upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var digits = "0123456789";
var splChars = "+=.@*!";


//$("#localUserForm").hide();
$("#sendTaskEditLocalUser").hide();
$("#sendTaskDeleteLocalUser").hide();
$("#sendTaskAddLocalUser").hide();

createGroupsSelectBox();

for (var n = 0; n < pluginTaskList.length; n++) {
	var pluginTask=pluginTaskList[n];
	if (pluginTask.page == 'local-user') {
		pluginTask_LocalUser=pluginTask;
	}
}

if (selectedEntries) {
	for (var i = 0; i < selectedEntries.length; i++) {
		dnlist.push(selectedEntries[i].distinguishedName);
	}
}

function localUserListener(msg) {
	var to = msg.getAttribute('to');
	var from = msg.getAttribute('from');
	var type = msg.getAttribute('type');
	var elems = msg.getElementsByTagName('body');

	if (type == "chat" && elems.length > 0) {
		var body = elems[0];
		var data=Strophe.xmlunescape(Strophe.getText(body));
		var xmppResponse=JSON.parse(data);
		var responseMessage = xmppResponse.result.responseMessage;
		if(xmppResponse.result.responseCode == "TASK_PROCESSED" || xmppResponse.result.responseCode == "TASK_ERROR") {
			if (xmppResponse.commandClsId == "GET_USERS") {
				var arrg = JSON.parse(xmppResponse.result.responseDataStr);
				if (xmppResponse.result.responseCode == "TASK_PROCESSED") {
					users = arrg.users;
					allGroups = arrg["all_groups"];
					for (var j = 0; j < users.length; j++) {
						var username = users[j]["user"];
						var home = users[j]["home"];
						var groups = users[j]["groups"];
						var isActive = "Pasif";
						if (users[j]["is_active"] == "true") {
							isActive = "Aktif";
						}
						var newRow = $("<tr id="+ username +">");
						var html = '<td>'+ username +'</td>';
						html += '<td>'+ isActive +'</td>';
						html += '<td>'+ home +'</td>';
						newRow.append(html);
						$("#localUsersTable").append(newRow);
					}
					createLocalUsersTable();
					defaultAllGroups();
					defaultSettings();
					$("#localUserForm").show();
					$("#sendTaskAddLocalUser").show();
					$.notify(responseMessage, "success");
					$("#plugin-result-local-user").html("");
				}
				else {
					$.notify(responseMessage, "error");
					$("#plugin-result-local-user").html(("HATA: " + responseMessage).fontcolor("red"));
				}
			}
			if (xmppResponse.commandClsId == "EDIT_USER" || xmppResponse.commandClsId == "ADD_USER" || xmppResponse.commandClsId == "DELETE_USER") {
				if (xmppResponse.result.responseCode == "TASK_PROCESSED") {
					$.notify(responseMessage, "success");
					$("#plugin-result-local-user").html("");
					if (tableLocalUser) {
						tableLocalUser.clear().draw();
						tableLocalUser.destroy();
//						$("#localUserForm").hide();
					}
					sendLocalUserTask(getUsers());

				}else {
					$.notify(responseMessage, "error");
					$("#plugin-result-local-user").html(("HATA: " + responseMessage).fontcolor("red"));
				}
			}
		}
	}
	// we must return true to keep the handler alive. returning false would remove it after it finishes.
	return true;
}

//confirm function for send task local user   
function sendLocalUserTaskConfirm(commandId, parameterMap) {
	if(pluginTask_LocalUser){
		pluginTask_LocalUser.dnList=dnlist;
		pluginTask_LocalUser.entryList=selectedEntries;
		pluginTask_LocalUser.dnType="AHENK";
		pluginTask_LocalUser.parameterMap=parameterMap;
		pluginTask_LocalUser.cronExpression = scheduledParamLocalUser;
		pluginTask_LocalUser.commandId = commandId;;  		
		var params = JSON.stringify(pluginTask_LocalUser);
	}
	var content = "Görev Gönderilecek, emin misiniz?";
	if (scheduledParamLocalUser != null) {
		content = "Zamanlanmış görev gönderilecek, emin misiniz?";
	}
	$.confirm({
		title: 'Uyarı!',
		content: content,
		theme: 'light',
		buttons: {
			Evet: function () {
				if (commandId == "GET_USERS") {
					if (tableLocalUser) {
						tableLocalUser.clear().draw();
						tableLocalUser.destroy();
//						$("#localUserForm").hide();
					}
				}
				sendLocalUserTask(params);
				scheduledParamLocalUser = null;
			},
			Hayır: function () {
			}
		}
	});
}

//Send task for Local User
function sendLocalUserTask(params) {
	var message = "Görev başarı ile gönderildi.. Lütfen bekleyiniz...";
	if (scheduledParamLocalUser != null) {
		message = "Zamanlanmış görev başarı ile gönderildi. Zamanlanmış görev parametreleri:  "+ scheduledParamLocalUser;
	}
	$.ajax({
		type: "POST",
		url: "/lider/task/execute",
		headers: {
			'Content-Type':'application/json',
		}, 
		data: params,
		contentType: "application/json",
		dataType: "json",
		converters: {
			'text json': true
		},
		success: function(result) {
			var res = jQuery.parseJSON(result);
			if(res.status=="OK"){		    		
				$("#plugin-result-local-user").html(message.bold());
			}   	
		},
		error: function(result) {
			$.notify(result, "error");
		}
	});
}

function userNameFocus() {
	$("#localUserHomeDirectory").val("/home/"+ $("#localUserName").val() +"");
}

function getUsers() {
	if(pluginTask_LocalUser){
		pluginTask_LocalUser.dnList=dnlist;
		pluginTask_LocalUser.entryList=selectedEntries;
		pluginTask_LocalUser.dnType="AHENK";
		pluginTask_LocalUser.parameterMap={};
		pluginTask_LocalUser.cronExpression = scheduledParamLocalUser;
		pluginTask_LocalUser.commandId = "GET_USERS";  		
		var params = JSON.stringify(pluginTask_LocalUser);
		return params
	}
}

function defaultAllGroups() {
	for (var i = 0; i < allGroups.length; i++) {
		var groupName = allGroups[i];
		$('#localUserOfGroups').append($('<option>', {
			id: groupName,
			value : groupName,
			text: groupName,
		}));
	}
	if (groupsSelectBox) {
		$("#localUserOfGroups").multiselect('destroy');
	}
	createGroupsSelectBox();
}

function createGroupsSelectBox() {
	groupsSelectBox = $('#localUserOfGroups').multiselect({
		includeSelectAllOption: true,
		selectAllText: 'Tümünü Seç',
		allSelectedText: 'Tümü seçildi',
		nSelectedText: ' - Grup seçildi',
		nonSelectedText: 'Grup seçiniz...    ',
		maxHeight: 250,
		buttonWidth: '250px',
		enableFiltering: true,
		filterPlaceholder: 'Grup ara...',
		buttonClass: 'btn btn-info',
		inheritClass: true,
		templates: {
			button: '<button type="button" class="multiselect dropdown-toggle btn btn-light" data-toggle="dropdown">Grup Seçiniz...</button>',
		},
	});
}

function createLocalUsersTable() {
	tableLocalUser = $('#localUsersTable').DataTable( {
		"scrollY": "500px",
		"paging": false,
		"scrollCollapse": true,
		"oLanguage": {
			"sLengthMenu": 'Görüntüle <select>'+
			'<option value="20">20</option>'+
			'<option value="30">30</option>'+
			'<option value="40">40</option>'+
			'<option value="50">50</option>'+
			'<option value="-1">Tümü</option>'+
			'</select> kayıtları',
			"sSearch": "Kullanıcı Ara:",
			"sInfo": "Toplam Kullanıcı sayısı: _TOTAL_",
			"sInfoEmpty": "Gösterilen Kullanıcı sayısı: 0",
			"sZeroRecords" : "Kullanıcı bulunamadı",
			"sInfoFiltered": " - _MAX_ kullanıcı arasından",
		},
	} );
}

function defaultSettings() {
	$("#localUserName").val("");
	$("#localUserNewPassword").val("");
	$("#localUserVerifyPassword").val("");
	$("#localUserHomeDirectory").val("");
	$('#localUserActiveSb').val("true").change();
	$("#desktopWritePermissionCb").prop( "checked", false );
	$("#kioskModeCb").prop( "checked", false );
	$('#localUserOfGroups').multiselect("deselectAll", false).multiselect("refresh");
	$("#sendTaskAddLocalUser").show();
	$("#sendTaskEditLocalUser").hide();
	$("#sendTaskDeleteLocalUser").hide();
	selectUserName = null;
}

$('#localUsersTable tbody').on( 'click', 'tr', function () {
	if ( $(this).hasClass('selected') ) {
		$(this).removeClass('selected');
		defaultSettings();
	}else {
		$('#localUserOfGroups').multiselect("deselectAll", false).multiselect("refresh");
		$("#sendTaskAddLocalUser").hide();
		$("#sendTaskEditLocalUser").show();
		$("#sendTaskDeleteLocalUser").show();
		tableLocalUser.$('tr.selected').removeClass('selected');
		$(this).addClass('selected');
		var rowData = tableLocalUser.rows('.selected').data()[0];
		var selUserName = $(this).attr('id');
		selectUserName = selUserName;

		for (var i = 0; i < users.length; i++) {
			if (users[i]["user"] == selUserName) {
				$("#localUserName").val(users[i]["user"]);
				$("#localUserHomeDirectory").val(users[i]["home"]);
				var groupList = users[i]["groups"];
				userOfGroup=groupList.split(", ");

				for (var j = 0; j < userOfGroup.length; j++) {
					$('#localUserOfGroups').multiselect('select', [""+ userOfGroup[j] +""], true);
				}
				$("#localUserOfGroups").multiselect("refresh");

				if (users[i]["is_active"] == "true") {
					$('#localUserActiveSb').val("true").change();
				}else {
					$('#localUserActiveSb').val("false").change();
				}

				if (users[i]["is_desktop_write_permission_exists"] == "true") {
					$("#desktopWritePermissionCb").prop( "checked", true );
				}else {
					$("#desktopWritePermissionCb").prop( "checked", false );
				}

				if (users[i]["is_kiosk_mode_on"] == "true") {
					$("#kioskModeCb").prop( "checked", true );
				}else {
					$("#kioskModeCb").prop( "checked", false );
				}
			}
		}
	}
});

//START -->> generate local user password
function contains(userPassword, allowedChars) {
	for (i = 0; i < userPassword.length; i++) {
		var char = userPassword.charAt(i);
		if (allowedChars.indexOf(char) >= 0){
			return true;
		}
	}
	return false;
}

function generateLocalUserPassword() {
	var userPassword = $("#localUserNewPassword").val();
	var ucaseFlag = contains(userPassword, upperCase);
	var lcaseFlag = contains(userPassword, lowerCase);
	var digitsFlag = contains(userPassword, digits);
	var splCharsFlag = contains(userPassword, splChars);

	if(userPassword.length>=8 && ucaseFlag && lcaseFlag && digitsFlag && splCharsFlag){
		return true;
	}else {
		return false;
	}
}
//STOP -->> generate local user password

//get local users when clicked buttons
$('#sendTaskGetLocalUsers').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	var parameterMap = {};
	sendLocalUserTaskConfirm("GET_USERS", parameterMap);
});

//edit selected user when clicked button
$('#sendTaskEditLocalUser').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	var allVal=$("#localUserOfGroups").val();
	var groups = allVal.join(',');
	var desktopWritePer = false;
	if ($('#desktopWritePermissionCb').is(':checked')) {
		desktopWritePer = "true";
	}
	var kioskMode = false;
	if ($('#kioskModeCb').is(':checked')) {
		kioskMode = "true";
	}

	var parameterMap={
			"username": selectUserName,
			"new_username": $("#localUserName").val(),
			"password": $("#localUserNewPassword").val(),
			"desktop_write_permission": "true",
			"active": $("#localUserActiveSb").val().toString(),
			"groups": groups,
			"kiosk_mode": "true",
			"home": $("#localUserHomeDirectory").val()
	};
	if ($("#localUserName").val() != "" && $("#localUserHomeDirectory").val() != "") {
		if (generateLocalUserPassword()) {
			if ($("#localUserNewPassword").val() == $("#localUserVerifyPassword").val()) {
				sendLocalUserTaskConfirm("EDIT_USER", parameterMap);
			}else {
				$.notify("Parola uyuşmamaktadır.","warn");
			}
		}else {
			$.notify("Parola en az 8 karakter olmalıdır. En az bir büyük harf, küçük harf, sayı ve karakter içermelidir.","warn");
		}
	}else {
		$.notify("Lütfen kullanıcı adını ve ev dizinini giriniz.", "warn");
	}
});

//add new local user when clicked button 
$('#sendTaskAddLocalUser').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	var allVal=$("#localUserOfGroups").val();
	var groups = allVal.join(',');
	var desktopWritePer = false;
	if ($('#desktopWritePermissionCb').is(':checked')) {
		desktopWritePer = "true";
	}
	var kioskMode = false;
	if ($('#kioskModeCb').is(':checked')) {
		kioskMode = "true";
	}
	var parameterMap={
			"username": $("#localUserName").val(),
			"password": $("#localUserNewPassword").val(),
			"desktop_write_permission": "true",
			"active": $("#localUserActiveSb").val().toString(),
			"groups": groups,
			"kiosk_mode": "true",
			"home": $("#localUserHomeDirectory").val()
	};
	if ($("#localUserName").val() != "" && $("#localUserHomeDirectory").val() != "") {
		if (generateLocalUserPassword()) {
			if ($("#localUserNewPassword").val() == $("#localUserVerifyPassword").val()) {
				sendLocalUserTaskConfirm("ADD_USER", parameterMap);
			}else {
				$.notify("Parola uyuşmamaktadır.","warn");
			}

		}else {
			$.notify("Parola en az 8 karakter olmalıdır. En az bir büyük harf, küçük harf, sayı ve karakter içermelidir.","warn");
		}

	}else {
		$.notify("Lütfen kullanıcı adını ve ev dizinini giriniz.", "warn");
	}
});

//delete selected user when button
$('#sendTaskDeleteLocalUser').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	$.confirm({
		title: 'Uyarı!',
		content: "Kullanıcı ev dizinini de silmek istiyorsanız EVET, istemiyorsanız HAYIR butonuna tıklayınız.",
		theme: 'light',
		buttons: {
			Evet: function () {
				var parameterMap={
						"username": $("#localUserName").val(),
						"delete_home": true,
						"home": $("#localUserHomeDirectory").val()
				};
				sendLocalUserTaskConfirm("DELETE_USER", parameterMap);
			},
			Hayır: function () {
				var parameterMap={
						"username": $("#localUserName").val(),
						"delete_home": false,
						"home": $("#localUserHomeDirectory").val()
				};
				sendLocalUserTaskConfirm("DELETE_USER", parameterMap);
			}
		}
	});
});

//show modal for scheduledParamLocalUser
$('#sendTaskCronLocalUser').click(function(e){
	$('#scheduledTasksModal').modal('toggle');
	scheduledParam = null;
	scheduledModalLocalUserOpened = true;
});

$("#scheduledTasksModal").on('hidden.bs.modal', function(){
	if (scheduledModalLocalUserOpened) {
		scheduledParamLocalUser = scheduledParam;
	}
	scheduledModalLocalUserOpened = false;
	defaultScheduleSelection();
});