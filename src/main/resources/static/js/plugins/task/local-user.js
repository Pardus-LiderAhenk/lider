/**
 * 	EXECUTE SCRIPT definition and task module
 * This page Script definition. Get script templates from database. Save script and edit, delete registered scripts
 * This task allows registered scripts to run on the agent
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
var ref_local_user=connection.addHandler(localUserListener, null, 'message', null, null,  null);

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

//Execute Local User
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
					console.log(arrg.users)
					var users = arrg.users;

					for (var j = 0; j < users.length; j++) {
						var username = users[j]["user"];
						var isActive = "Hayır";
						var isDesktopWritePermission = "Hayır";
						var isKioskMode = "Hayır";
						
						if (users[j]["is_active"] == "true") {
							isActive = "Evet";
						}
						if (users[j]["is_desktop_write_permission_exists"] == "true") {
							isDesktopWritePermission = "Evet";
							
						}
						if (users[j]["is_kiosk_mode_on"] == "true") {
							isKioskMode = "Evet";
							
						}

						var newRow = $("<tr>");
						var html = '<td>'+ username +'</td>';
						html += '<td>'+ isActive +'</td>';
						html += '<td>'+ isDesktopWritePermission +'</td>';
						html += '<td>'+ isKioskMode +'</td>';

						newRow.append(html);
						$("#locaUsersTable").append(newRow);
					}
					createLocalUsersTable();

					$.notify(responseMessage, "success");
					$("#plugin-result-local-user").html("");
				}
				else {
					$.notify(responseMessage, "error");
					$("#plugin-result-local-user").html(("HATA: " + responseMessage).fontcolor("red"));
				}
			}
		}
	}
	// we must return true to keep the handler alive. returning false would remove it after it finishes.
	return true;
}

function createLocalUsersTable() {
	tableLocalUser = $('#locaUsersTable').DataTable( {
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

$('#sendTaskGetLocalUsers').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}

	if(pluginTask_LocalUser){
		pluginTask_LocalUser.dnList=dnlist;
		pluginTask_LocalUser.entryList=selectedEntries;
		pluginTask_LocalUser.dnType="AHENK";
		pluginTask_LocalUser.parameterMap={};
		pluginTask_LocalUser.cronExpression = scheduledParamLocalUser;
		pluginTask_LocalUser.commandId = "GET_USERS";  		
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
				if (tableLocalUser) {
					tableLocalUser.clear().draw();
					tableLocalUser.destroy();
				}
				sendLocalUserTask(params);
				scheduledParamLocalUser = null;
			},
			Hayır: function () {
			}
		}
	});
});

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