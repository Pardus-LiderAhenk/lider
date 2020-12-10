/**
 *  manage-root
 *  This task changes the client's root password.
 *  Tuncay ÇOLAK
 *  tuncay.colak@tubitak.gov.tr

 *  http://www.liderahenk.org/ 
 */

if (ref_manage_root) {
	connection.deleteHandler(ref_manage_root);
}

var lockRootUser = "";
var rootPassword;
var lowerCase = "abcdefghijklmnopqrstuvwxyz";
var upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var digits = "0123456789";
var splChars = "+=.@*!";
var showPasswordClicked=false;
var scheduledParamManageRoot = null;
var scheduledModalManageRootOpened = false;
var dnlist=[]
var ref_manage_root=connection.addHandler(manageRootListener, null, 'message', null, null,  null);

if(selectedEntries){
	for (var i = 0; i < selectedEntries.length; i++) {
		dnlist.push(selectedEntries[i].distinguishedName);
	}
}
for (var n = 0; n < pluginTaskList.length; n++) {
	var pluginTask=pluginTaskList[n];
	if (pluginTask.page == 'manage-root') {
		pluginTask_ManageRoot=pluginTask;
	}
}

function contains(rootPassword, allowedChars) {
	for (i = 0; i < rootPassword.length; i++) {
		var char = rootPassword.charAt(i);
		if (allowedChars.indexOf(char) >= 0){
			return true;
		}
	}
	return false;
}

function sendRootTask(params) {
	var content = "Görev Gönderilecek, emin misiniz?";
	if (scheduledParamManageRoot != null) {
		content = "Zamanlanmış görev gönderilecek, emin misiniz?";
	}
	$.confirm({
		title: 'Uyarı!',
		content: content,
		theme: 'light',
		buttons: {
			Evet: function () {
				var message = "Görev başarı ile gönderildi.. Lütfen bekleyiniz...";
				if (scheduledParamManageRoot != null) {
					message = "Zamanlanmış görev başarı ile gönderildi. Zamanlanmış görev parametreleri:  "+ scheduledParamManageRoot;
				}
				
				if (selectedEntries[0].type == "AHENK" && selectedRow.online == true && scheduledParamManageRoot == null) {
					progress("manageRootDiv","progressManageRoot",'show');
				}
				if (selectedEntries[0].type == "AHENK" && selectedRow.online == false) {
					$.notify("Görev başarı ile gönderildi, istemci çevrimiçi olduğunda uygulanacaktır.", "success");
				}
				if (selectedEntries[0].type == "GROUP") {
					var groupNotify = "Görev istemci grubuna başarı ile gönderildi.";
					if (scheduledParamManageRoot != null) {
						groupNotify = "Zamanlanmış görev istemci grubuna başarı ile gönderildi.";
					}
					$.notify(groupNotify, "success");
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
							if (selectedEntries[0].type == "AHENK" && selectedRow.online == true) {
								$("#plugin-result-manage-root").html(message.bold());	
							}
						}   	
						/* $('#closePage').click(); */
					},
					error: function(result) {
						$.notify(result, "error");
					}
				});
				scheduledParamManageRoot = null;
			},
			Hayır: function () {
			}
		}
	});
}

function manageRootListener(msg) {
	var to = msg.getAttribute('to');
	var from = msg.getAttribute('from');
	var type = msg.getAttribute('type');
	var elems = msg.getElementsByTagName('body');

	if (type == "chat" && elems.length > 0) {
		var body = elems[0];
		var data=Strophe.xmlunescape(Strophe.getText(body));
		var xmppResponse=JSON.parse(data);
		var responseMessage = xmppResponse.result.responseMessage;
		if(xmppResponse.commandClsId == "SET_ROOT_PASSWORD"){
			if (selectedEntries[0].type == "AHENK") {
				progress("manageRootDiv","progressManageRoot",'hide');
				if (xmppResponse.result.responseCode != "TASK_ERROR") {
					$("#plugin-result-manage-root").html("");
					$.notify(responseMessage, "success");
				} else {
//					$("#plugin-result-manage-root").html(xmppResponse.result.responseMessage);
					$.notify(responseMessage, "error");
				}
			}
		}						 
	}
	// we must return true to keep the handler alive. returning false would remove it after it finishes.
	return true;
}

$('#generateRootPassword').click(function(e){
	var pwd = generatePassword();
	var ucaseFlag2 = contains(pwd, upperCase);
	var lcaseFlag2 = contains(pwd, lowerCase);
	var digitsFlag2 = contains(pwd, digits);
	var splCharsFlag2 = contains(pwd, splChars);

	if(ucaseFlag2 && lcaseFlag2 && digitsFlag2){
		$("#inputRootPassword").val(pwd);
	}
	while (ucaseFlag2 == false || lcaseFlag2 == false || digitsFlag2 == false) {
		var pwd = generatePassword();
		var ucaseFlag2 = contains(pwd, upperCase);
		var lcaseFlag2 = contains(pwd, lowerCase);
		var digitsFlag2 = contains(pwd, digits);
//		var splCharsFlag2 = contains(pwd, splChars);
	}
	$("#inputRootPassword").val(pwd);
	$("#inputRootPasswordConfirm").val(pwd);

//	$("#inputRootPassword").attr("type","text");
//	$("#inputRootPasswordConfirm").attr("type","text");
});

$('.showPassword').click(function(e){
	if(showPasswordClicked==false){
		$("#inputRootPassword").attr("type","text");
		$("#inputRootPasswordConfirm").attr("type","text");
		showPasswordClicked=true;
	}
	else if(showPasswordClicked==true){
		$("#inputRootPassword").attr("type","password");
		$("#inputRootPasswordConfirm").attr("type","password");
		showPasswordClicked=false;
	}
});

function generatePassword(){
	var length = 6; //root password min length
	var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	var password = "";
	for (var x = 0; x < length; x++) {
		var i = Math.floor(Math.random() * chars.length);
		password += chars.charAt(i);
	}
	return password;
}

$('#lockRootUserButton').click(function(e){
	if($(this).is(':checked')){
		$("#inputRootPassword").prop("disabled", true);
		$("#inputRootPasswordConfirm").prop("disabled", true);
		$("#generateRootPassword").prop('disabled', true);
		$("#inputRootPassword").val("");
		$("#inputRootPasswordConfirm").val("");
		$("#rootPasswordImage").attr("src","images/lock-solid.svg");
		lockRootUser = true;
	}
	else{
		$("#inputRootPassword").prop("disabled", false);
		$("#inputRootPasswordConfirm").prop("disabled", false);
		$("#generateRootPassword").prop('disabled', false);
		$("#rootPasswordImage").attr("src","images/unlock-solid.svg");
		lockRootUser = "";
	}
});

$('#sendTaskCron-manage-root').click(function(e){
	$('#scheduledTasksModal').modal('toggle');
	scheduledParam = null;
	scheduledModalManageRootOpened = true;
});

$("#scheduledTasksModal").on('hidden.bs.modal', function(){
	if (scheduledModalManageRootOpened) {
		scheduledParamManageRoot = scheduledParam;
	}
	scheduledModalManageRootOpened = false;
	defaultScheduleSelection();
});

$('#sendTask-manage-root').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}

	if(pluginTask_ManageRoot){
		pluginTask_ManageRoot.dnList=dnlist;
		pluginTask_ManageRoot.entryList=selectedEntries;
		pluginTask_ManageRoot.dnType="AHENK";
	}

	var rootEntity = user_name;
	rootPassword = $("#inputRootPassword").val();
	rootPasswordConfirm = $("#inputRootPasswordConfirm").val();
	pluginTask_ManageRoot.commandId = "SET_ROOT_PASSWORD";
	pluginTask_ManageRoot.parameterMap={"RootPassword":rootPassword, "lockRootUser":lockRootUser, "rootEntity":rootEntity};
	pluginTask_ManageRoot.cronExpression = scheduledParamManageRoot;
	var params = JSON.stringify(pluginTask_ManageRoot);
	if(lockRootUser != true){
		var ucaseFlag = contains(rootPassword, upperCase);
		var lcaseFlag = contains(rootPassword, lowerCase);
		var digitsFlag = contains(rootPassword, digits);
//		var splCharsFlag = contains(rootPassword, splChars);
		var splCharsFlag = contains(rootPassword, "*");
		if (splCharsFlag) {
			$.notify("Parola * içermemelidir.","warn");
			return;
		}
		if(rootPassword.length>=6 && ucaseFlag && lcaseFlag && digitsFlag){
			if (rootPassword == rootPasswordConfirm) {
				sendRootTask(params);
			}else {
				$.notify("Parola uyuşmamaktadır.","warn");
			}
		}
		else{
			$.notify("Parola en az 6 karakter olmalıdır. En az bir büyük harf, küçük harf ve sayı içermelidir.","warn");
		}
	}
	else{
		sendRootTask(params);
	}
});
