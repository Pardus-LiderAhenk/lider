/**
 *  manage-root
 *  This task changes the client's root password.
 *  Tuncay ÇOLAK
 *  tuncay.colak@tubitak.gov.tr

 *  http://www.liderahenk.org/ 
 */

if (ref) {
	connection.deleteHandler(ref);
}
scheduledParam = null;
var ref=connection.addHandler(manageRootListener, null, 'message', null, null,  null);

$("#entrySize").html(selectedEntries.length);		
var dnlist=[]
for (var i = 0; i < selectedEntries.length; i++) {
	dnlist.push(selectedEntries[i].distinguishedName);
}
selectedPluginTask.dnList=dnlist;
selectedPluginTask.parameterMap={};
selectedPluginTask.entryList=selectedEntries;
selectedPluginTask.dnType="AHENK";
var params = JSON.stringify(selectedPluginTask);

var lockRootUser = "";
var rootPassword;

var lowerCase = "abcdefghijklmnopqrstuvwxyz";
var upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var digits = "0123456789";
var splChars = "+=.@*!";

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
	if (scheduledParam != null) {
		content = "Zamanlanmış görev gönderilecek, emin misiniz?";
	}
	$.confirm({
		title: 'Uyarı!',
		content: content,
		theme: 'light',
		buttons: {
			Evet: function () {
				var message = "Görev başarı ile gönderildi.. Lütfen bekleyiniz...";
				if (scheduledParam != null) {
					message = "Zamanlanmış görev başarı ile gönderildi. Zamanlanmış görev parametreleri:  "+ scheduledParam;
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
							$("#plugin-result").html(message.bold());
						}   	
						/* $('#closePage').click(); */
					},
					error: function(result) {
						$.notify(result, "error");
					}
				});
				scheduledParam = null;
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
		if(xmppResponse.commandClsId == "SET_ROOT_PASSWORD"){
			if (xmppResponse.result.responseCode != "TASK_ERROR") {
				$("#plugin-result").html("");
				$.notify(xmppResponse.result.responseMessage, "success");
			} else {
				$("#plugin-result").html(xmppResponse.result.responseMessage);
				$.notify(xmppResponse.result.responseMessage, "error");
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

	if(ucaseFlag2 && lcaseFlag2 && digitsFlag2 && splCharsFlag2){
		$("#inputRootPassword").val(pwd);
	}

	while (ucaseFlag2 == false || lcaseFlag2 == false || digitsFlag2 == false || splCharsFlag2 == false) {
		var pwd = generatePassword();
		var ucaseFlag2 = contains(pwd, upperCase);
		var lcaseFlag2 = contains(pwd, lowerCase);
		var digitsFlag2 = contains(pwd, digits);
		var splCharsFlag2 = contains(pwd, splChars);
	}
	$("#inputRootPassword").val(pwd);
	$("#inputRootPasswordConfirm").val(pwd);
});

function generatePassword(){
	var length = 8; //root password min length
	var chars = "abcdefghijklmnopqrstuvwxyz+=.@*!ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
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
		lockRootUser = true;
	}
	else{
		$("#inputRootPassword").prop("disabled", false);
		$("#inputRootPasswordConfirm").prop("disabled", false);
		$("#generateRootPassword").prop('disabled', false);
		lockRootUser = "";
	}
});

$('#sendTask-'+ selectedPluginTask.page).click(function(e){
	var entry=onlineEntryList[0];
	var rootEntity = entry.jid;
	rootPassword = $("#inputRootPassword").val();
	rootPasswordConfirm = $("#inputRootPasswordConfirm").val();
	selectedPluginTask.commandId = "SET_ROOT_PASSWORD";
	selectedPluginTask.parameterMap={"RootPassword":rootPassword, "lockRootUser":lockRootUser, "rootEntity":rootEntity};
	selectedPluginTask.cronExpression = scheduledParam;
	var params = JSON.stringify(selectedPluginTask);
	if(lockRootUser != true){
		var ucaseFlag = contains(rootPassword, upperCase);
		var lcaseFlag = contains(rootPassword, lowerCase);
		var digitsFlag = contains(rootPassword, digits);
		var splCharsFlag = contains(rootPassword, splChars);
		if(rootPassword.length>=8 && ucaseFlag && lcaseFlag && digitsFlag && splCharsFlag){
			if (rootPassword == rootPasswordConfirm) {
				sendRootTask(params);
			}else {
				$.notify("Parola uyuşmamaktadır.","warn");
			}
		}
		else{
			$.notify("Parola en az 8 karakter olmalıdır. En az bir büyük harf, küçük harf, sayı ve karakter içermelidir.","warn");
		}
	}
	else{
		sendRootTask(params);
	}
});

$('#closePage-'+ selectedPluginTask.page).click(function(e){
	connection.deleteHandler(ref);
	scheduledParam = null;
});

