/**
 * When page loaing getting compters from LDAP and ldap computers tree fill out on the treegrid that used jqxTreeGrid api..
 * also plugin task tables load on start.
 * 
 * M. Edip YILDIZ
 * 
 */

// generic variables
var selectedRow= null;
var selectedRowDataFromDB= null;
var baseRootDnComputer=null;
var selectedEntries = []; 
var selectedAgentGroupDN = "";
var selectedOUDN = "";
var treeGridHolderDiv= "computerTreeDiv";
var pluginTaskList=null;
var systemSettings=null;
var historyData = null;
var treeGridIdGlob = null;

var selectedRowForMovingEntry;

// when page loading getting system page info package and service management page hide
setSystemPluginPage();
$("#systemPage").show();
$("#packageManagementPage").hide();
$("#serviceManagementPage").hide();
$("#scriptManagementPage").hide();
$("#securityAndNetworkManagementPage").hide();
$("#dropdownButton").hide();
$("#agentOnlineStatus").hide()
$("#selectedAgentList").hide();
$("#btnRenameAgent").hide();
$("#domainUserName").val(user_name);
//$("#domainUserPassword").val(password);

$("#moveAgent").hide();
$("#deleteAgent").hide();
$("#btnAddOu").hide();
$("#btnDeleteOu").hide();
$("#updateAgentInfo").hide();

/*
 * create user tree select, check and uncheck action functions can be implemented if required
 * params div, onlyFolder, use Checkbox, select action , check action, uncheck action
 */
createComputerTree('lider/computer/getComputers',treeGridHolderDiv, false, false,
		// row select
		function(row, rootDnComputer){
			selectedRow=row;
			baseRootDnComputer=rootDnComputer;
			addSelectedEntryToTable(selectedRow)
			if(selectedRow.online ==false){
				$('#deleteAgent').hide();
			}
		},
		//check action
		function(checkedRows, row){
		
		},
		//uncheck action
		function(unCheckedRows, row){
		
		},
		// post tree created
		function(rootComputer , treeGridId){
			$('#'+ treeGridId).jqxTreeGrid('selectRow', rootComputer);
			$('#'+ treeGridId).jqxTreeGrid('expandRow', rootComputer);
			computerTreeCreated=true;
			treeGridIdGlob=treeGridId;
		}
);

//getting some setting params to use
getConfigurationParams();
function getConfigurationParams() {
	$.ajax({ 
	    type: 'GET', 
	    url: "/lider/settings/configurations",
	    dataType: 'json',
	    success: function (data) { 
	    	if(data != null) {
	    		//set ldap configuration
	    		systemSettings=data;
	    	}
	    },
	    error: function (data, errorThrown) {
	    	$.notify("Ayarlar getirilirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
	    }
	});
}

$(document).ready(function() {
	//to see compputer state listen connection
	connection.addHandler(onPresence2, null, "presence");
});

function onPresence2(presence)
{
	
	var ptype = $(presence).attr('type');
	var from = $(presence).attr('from');
	var jid_id = jid_to_id(from);
	var name = jid_to_name(from);
	var source = jid_to_source(from);
	
	if (ptype === 'subscribe') {
		$.notify("subscribe","warn");
	} 
	else if (ptype !== 'error') {
		//OFFLine state
		if (ptype === 'unavailable') {
			if(computerTreeCreated){
				var row = $('#'+ treeGridIdGlob).jqxTreeGrid('getRow', name);
				row.online=false;
				$('#'+ treeGridIdGlob).jqxTreeGrid('updateRow',  row.name , {name:name});
				
				if(selectedRow.name==name){
					$("#agentOnlineStatus").attr("class","badge badge-danger");
					$("#agentOnlineStatus").html("Çevrimdışı");
				}
			}
		} else {
			if(computerTreeCreated){
				var row = $('#'+ treeGridIdGlob).jqxTreeGrid('getRow', name);
				row.online=true;
				$('#'+ treeGridIdGlob).jqxTreeGrid('updateRow', row.name , {name:name});
				if(selectedRow.name==name){
					$("#agentOnlineStatus").attr("class","badge badge-success");
					$("#agentOnlineStatus").html("Çevrimiçi");
				}
			}
		}
	}
	return true;
}

/**
 * open page buttons start
 */
$('#btn-system').click(function() {
	setSystemPluginPage();
});

$('#btn-package').click(function() {
	setPackagePluginPage();
});
$('#btn-service').click(function() {
	setServicePluginPage();
});

$('#btn-script').click(function() {
	setScriptPluginPage();
});
$('#btn-ssh').click(function() {
	setShhPage();
});

$('#btn-securityAndNetwork').click(function() {
	setSecurityAndNetworkPluginPage();
});

$('#btn-taskHistory').click(function() {
	setTaskHistoryPage()
	
});
$('#btn-installAhenk').click(function() {
	setInstallAhenkPage();
});

$('#btnOnlineAgent').click(function() {

});

$('#selectedAgentInfo').click(function(e){
	$('#entryLdapInfoDN').html(selectedRow.name)
	var html = '<table class="table table-striped table-bordered " id="attrTable">';
	html += '<thead>';
	html += '<tr>';
	html += '<th style="width: 40%">Öznitelik</th>';
	html += '<th style="width: 60%">Değer</th>';
	html += '</tr>';
	html += '</thead>';
	renamedList = renameAndOrderAttributeList(selectedRow.attributesMultiValues);
	for (var key in renamedList) {
		if (renamedList.hasOwnProperty(key)) {
			if(renamedList[key].length > 1) {
				for(var i = 0; i< renamedList[key].length; i++) {
					html += '<tr>';
					html += '<td>' + key + '</td>';
					html += '<td>' + renamedList[key][i] + '</td>'; 
					html += '</tr>';
				}
			} else {
				html += '<tr>';
				html += '<td>' + key + '</td>';
				html += '<td>' + renamedList[key] + '</td>';
				html += '</tr>';
			}
		}
	}

	html += '</table>';
	
	$('#entryLdapInfoHolder').html(html);
});


/**
 * open page buttons end
 */

$('#getTaskHistoryBtn').click(function() {
	taskHistory()
});
$('#btnSSHConnect').click(function() {
	SHHConnect()
});

$('#btnTotalAgentRefresh').click(function(e){
	getAllAndOnlineAgents(selectedRow.distinguishedName)
});

$('#btnCheckSsh').click(function() {
	var host=$('#ahenkIp4Install').val();
	var user=$('#sshUserName4Install').val();
	var password=$('#sshPassword4Install').val();
	
	if(host == ''){
		$.notify("Lütfen bağlanılacak IP adresi giriniz.", "error");
		return;
	}
	if(user == ''){
		$.notify("Lütfen SSH kullanıcı adı giriniz.", "error");
		return;
	}
	if(password == ''){
		$.notify("Lütfen SSH parola giriniz.", "error");
		return;
	}
	
	checkSshConnection(host,user,password)
});

$('#btnInstallAhenk').click(function() {
	
	var host=$('#ahenkIp4Install').val();
	var user=$('#sshUserName4Install').val();
	var password=$('#sshPassword4Install').val();
	var repoName=systemSettings.ahenkRepoAddress;
	var repoKey=systemSettings.ahenkRepoKeyAddress;
	
	if(repoName == null){
		$.notify("Lütfen Repo addresini kontrol ediniz.", "error");
		return;
	}
	
	if(repoKey == null){
		$.notify("Lütfen Repo addresini kontrol ediniz.", "error");
		return;
	}
	
	
	var repoKeyArr=repoKey.split('/');
	var repoKeyName= repoKeyArr[repoKeyArr.length-1]
	
	if(host == ''){
		$.notify("Lütfen bağlanılacak IP adresi giriniz.", "error");
		return;
	}
	if(user == ''){
		$.notify("Lütfen SSH kullanıcı adı giriniz.", "error");
		return;
	}
	if(password == ''){
		$.notify("Lütfen SSH parola giriniz.", "error");
		return;
	}
	
	
//	var cmdGetKeyring='sudo wget http://'+repoAddr+'/liderahenk-archive-keyring.asc && sudo apt-key add liderahenk-archive-keyring.asc &&  sudo rm liderahenk-archive-keyring.asc '
	var cmdGetKeyring='sudo wget '+repoKey +' && sudo apt-key add '+repoKeyName+' &&  sudo rm '+repoKeyName;
//	var cmdSetSourcesListPardus= 'sudo printf "\ndeb [arch=amd64] http://'+repoAddr+'/liderahenk-test testing main" | sudo tee -a /etc/apt/sources.list';
//	var cmdSetSourcesListPardus= 'sudo printf "\n'+repoName+'" | sudo tee -a /etc/apt/sources.list'
	var cmdInstallAddRepoTool= 'sudo apt install -y software-properties-common gnupg';
	var cmdSetSourcesListPardus= 'sudo add-apt-repository "'+repoName+'"';
	var cmdUpdate= 'sudo apt update'
	var cmdInstallAhenk= 'sudo apt install -y ahenk'
	
	function cbResult(result){
		$.notify("Ahenk Kurulumu başarı ile gerçekleşti.", "success");
	}
	
	function cbInstallAhenk(result){
		setShhLog("Ahenk kurulumu başlatılıyor....")
		executeRemoteSshCommand(host,user, password,cmdInstallAhenk,cbResult)
	}
		
	function cbUpdate(result){
		setShhLog("Repo update ediliyor....")
		executeRemoteSshCommand(host,user, password,cmdUpdate,cbInstallAhenk)
	}
		
	function setSourceList(result) {
		setShhLog("Repo kurulumu başlatıldı....")
		executeRemoteSshCommand(host,user, password,cmdSetSourcesListPardus,cbUpdate)
	}
	
	function cbSetAddRepoTool(result){
		setShhLog("Repo tool kuruluyor....")
		executeRemoteSshCommand(host,user, password,cmdInstallAddRepoTool,setSourceList)
	}
	setShhLog("Repo keyring ayarlanıyor....")
	executeRemoteSshCommand(host,user, password,cmdGetKeyring,cbSetAddRepoTool)
});

$('#btnRegisterAhenk').click(function() {
	var host=$('#ahenkIp4Install').val();
	var user=$('#sshUserName4Install').val();
	var password=$('#sshPassword4Install').val();
	var domainUserName=$('#domainUserName').val();
	var domainUserPassword=$('#domainUserPassword').val();
	var domainName=$('#domainName').val();
	
	if(host == ''){
		$.notify("Lütfen bağlanılacak IP adresi giriniz.", "error");
		return;
	}
	if(user == ''){
		$.notify("Lütfen SSH kullanıcı adı giriniz.", "error");
		return;
	}
	if(password == ''){
		$.notify("Lütfen SSH parola giriniz.", "error");
		return;
	}
	if(domainUserName == ''){
		$.notify("Lütfen Domain Kullanıcı Adı giriniz.", "error");
		return;
	}
	if(domainUserPassword == ''){
		$.notify("Lütfen Domain Kullanıcı Parola giriniz.", "error");
		return;
	}
	
	//var cmdRegisterAhenk= 'sudo /usr/bin/python3 /usr/share/ahenk/ahenkd.py start '+ systemSettings.xmppHost + ' '+ domainUserName + ' ' + domainUserPassword + ' ' + domainName;
	
	var cmdUpdate= 'sudo apt update'
	var cmdInstallAhenk= 'sudo apt install -y ahenk'
	var cmdStopAhenk= 'sudo systemctl stop ahenk.service';
	var cmdRegisterAhenk= 'sudo /usr/bin/python3 /usr/share/ahenk/ahenkd.py start '+ systemSettings.xmppHost + ' '+ domainUserName + ' ' + domainUserPassword;

	function cbResultRegister(result){
		setShhLog("Ahenk Lider MYS sistemine başarı ile kaydedildi.")
		setShhLog("Ahenk yeniden başlatılıyor.Uzak Bağlantı koparılacaktır.")
		$.notify("Kayıt başarı ile gerçekleşti.", "success");
	}
	function cbRegisterAhenk(result) {
		setShhLog("Ahenk Lider MYS sistemine kaydediliyor..")
		executeRemoteSshCommand(host,user, password,cmdRegisterAhenk,cbResultRegister)
	}
	
	function cbStopAhenk(result) {
		setShhLog("Ahenk güncellemesi yapılıyor..")
		executeRemoteSshCommand(host,user, password,cmdStopAhenk,cbRegisterAhenk)
	}
	
	function cbInstallAhenk(result) {
		setShhLog("Ahenk güncellemesi yapılıyor..")
		executeRemoteSshCommand(host,user, password,cmdInstallAhenk,cbStopAhenk)
	}
	
	setShhLog("Güncellemeler çekiliyor..")
	executeRemoteSshCommand(host,user, password,cmdUpdate,cbInstallAhenk)
	
});

$('#btnClearRemoteSshLog').click(function() {
	$('#installAhenkLog').html("");
});

function setSystemPluginPage() {
	showPageAndHideOthers('systemPage')
	
	$.ajax({
		type : 'POST',
		url : 'getPluginTaskList',
		dataType : 'json',
		success : function(data) {
			pluginTaskList = data;

			for (var i = 0; i < pluginTaskList.length; i++) {
				var pluginTask = pluginTaskList[i];
				if(pluginTask.page == 'resource-usage'){
					$.ajax({
						type : 'POST',
						url : 'getPluginTaskHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res2) {
							$('#resource-usage').html(res2);

						}
					});
				}
				if(pluginTask.page == 'manage-root'){
					$.ajax({
						type : 'POST',
						url : 'getPluginTaskHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res1) {
							$('#manage-root').html(res1);

						}
					});
				}
				if(pluginTask.page == 'end-sessions'){
					$.ajax({
						type : 'POST',
						url : 'getPluginTaskHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res1) {
							$('#end-sessions').html(res1);
						}
					});
				}
				if(pluginTask.page == 'conky'){
					$.ajax({
						type : 'POST',
						url : 'getPluginTaskHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res1) {
							$('#conky').html(res1);
						}
					});
				}
				if(pluginTask.page == 'eta-notify'){
					$.ajax({
						type : 'POST',
						url : 'getPluginTaskHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res1) {
							$('#eta-notify').html(res1);
						}
					});
				}
				if(pluginTask.page == 'file-management'){
					$.ajax({
						type : 'POST',
						url : 'getPluginTaskHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res1) {
							$('#file-management').html(res1);
						}
					});
				}
				if(pluginTask.page == 'local-user'){
					$.ajax({
						type : 'POST',
						url : 'getPluginTaskHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res1) {
							$('#local-user').html(res1);
						}
					});
				}
				if(pluginTask.page == 'ldap-login'){
					$.ajax({
						type : 'POST',
						url : 'getPluginTaskHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res1) {
							$('#ldap-login').html(res1);
						}
					});
				}
				if(pluginTask.page == 'xmessage'){
					$.ajax({
						type : 'POST',
						url : 'getPluginTaskHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res1) {
							$('#xmessage').html(res1);
						}
					});
				}
				if(pluginTask.page == 'file-transfer'){
					$.ajax({
						type : 'POST',
						url : 'getPluginTaskHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res1) {
							$('#file-transfer').html(res1);
						}
					});
				}
				if(pluginTask.page == 'remote-access'){
					$.ajax({
						type : 'POST',
						url : 'getPluginTaskHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res1) {
							$('#remote-access').html(res1);
						}
					});
				}
//				if(pluginTask.page == 'screenshot'){
//					$.ajax({
//						type : 'POST',
//						url : 'getPluginTaskHtmlPage',
//						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
//						dataType : 'text',
//						success : function(res1) {
//							$('#screenshot').html(res1);
//						}
//					});
//				}
			}
		}
	});
}

function setPackagePluginPage() {
	showPageAndHideOthers('packageManagementPage')

	for (var i = 0; i < pluginTaskList.length; i++) {
		var pluginTask = pluginTaskList[i];
		if(pluginTask.page == 'package-management'){
			$.ajax({
				type : 'POST',
				url : 'getPluginTaskHtmlPage',
				data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
				dataType : 'text',
				success : function(res2) {
					$('#package-management').html(res2);
				}
			});
		}
		
		if(pluginTask.page == 'packages'){
			$.ajax({
				type : 'POST',
				url : 'getPluginTaskHtmlPage',
				data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
				dataType : 'text',
				success : function(res2) {
					$('#packages').html(res2);
				}
			});
		}
		
		if(pluginTask.page == 'repositories'){
			$.ajax({
				type : 'POST',
				url : 'getPluginTaskHtmlPage',
				data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
				dataType : 'text',
				success : function(res2) {
					$('#repositories').html(res2);
				}
			});
		}
		if(pluginTask.page == 'application-restriction'){
			$.ajax({
				type : 'POST',
				url : 'getPluginTaskHtmlPage',
				data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
				dataType : 'text',
				success : function(res2) {
					$('#application-restriction').html(res2);
				}
			});
		}
	}
}

function setServicePluginPage() {
	showPageAndHideOthers('serviceManagementPage')
	
	for (var i = 0; i < pluginTaskList.length; i++) {
		var pluginTask = pluginTaskList[i];
		if(pluginTask.page == 'service-list'){
			$.ajax({
				type : 'POST',
				url : 'getPluginTaskHtmlPage',
				data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
				dataType : 'text',
				success : function(res2) {
					$('#service-list').html(res2);
				}
			});
		}
	}
}

function setScriptPluginPage() {
	showPageAndHideOthers('scriptManagementPage')
	
	for (var i = 0; i < pluginTaskList.length; i++) {
		var pluginTask = pluginTaskList[i];
		if(pluginTask.page == 'execute-script'){
			$.ajax({
				type : 'POST',
				url : 'getPluginTaskHtmlPage',
				data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
				dataType : 'text',
				success : function(res2) {
					$('#execute-script').html(res2);
				}
			});
		}
	}
	
}

function setSecurityAndNetworkPluginPage() {
	showPageAndHideOthers('securityAndNetworkManagementPage')

	for (var i = 0; i < pluginTaskList.length; i++) {
		var pluginTask = pluginTaskList[i];
		if(pluginTask.page == 'network-manager'){
			$.ajax({
				type : 'POST',
				url : 'getPluginTaskHtmlPage',
				data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
				dataType : 'text',
				success : function(res2) {
					$('#network-manager').html(res2);
				}
			});
		}
		if(pluginTask.page == 'usb-management'){
			$.ajax({
				type : 'POST',
				url : 'getPluginTaskHtmlPage',
				data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
				dataType : 'text',
				success : function(res2) {
					$('#usb-management').html(res2);
				}
			});
		}
	}
}
function setTaskHistoryPage() {
	showPageAndHideOthers('taskHistoryPage')
}

function setShhPage() {
	showPageAndHideOthers('sshPage')
}

function setInstallAhenkPage() {
	$('#repoAddr').val(systemSettings.ahenkRepoAddress);
	showPageAndHideOthers('installAhenkPage')
}

function executedTaskDetailClicked(executionDate, commandClsId, taskId, commandExecutionResultID) {
	var parameterMap = null;
	$.each(historyData, function(index, command) {
		if (command.task.id == taskId) {
			parameterMap = command.task.parameterMap;
		}
	});

	if (commandExecutionResultID != "NA") {
		var params = {
				"id" : commandExecutionResultID
		};
		$.ajax({ 
			type: 'POST', 
			url: "/command/commandexecutionresult",
			dataType: 'json',
			data: params,
			success: function (data) { 
				if(data != null) {
					if(data.responseDataStr != null) {
						var tableContent = '<tr><th style="width: 35%">Görev Adı</th><td style="width: 65%">' + commandClsId + '</td></tr>';
						if(data.responseCode == "TASK_PROCESSED" || data.responseCode == "TASK_ERROR") {
							if(data.responseCode == "TASK_PROCESSED") {
								tableContent += '<tr><th>Çalıştırma Sonucu</th><td>' + 'Başarılı' + '</td></tr>';
							} else if(data.responseCode == "TASK_ERROR") {
								tableContent += '<tr><th>Çalıştırma Sonucu</th><td>' + 'Hata Oluştu' + '</td></tr>';
							}

							var rawEndDate = data.createDate;
							var year = rawEndDate.substring(0,4);
							var month = rawEndDate.substring(5,7);
							var day = rawEndDate.substring(8,10);
							var time = rawEndDate.substring(11,19);
							executionTime = day + '.' + month + '.' + year + ' ' + time;
							tableContent += '<tr><th>Oluşturulma Tarihi</th><td>' + executionDate + '</td></tr>';
							tableContent += '<tr><th>Çalıştırılma Tarihi</th><td>' + executionTime + '</td></tr>';
							if(parameterMap != null) {
								tableContent += '<tr><th colspan="100%"><h6>Gönderilen Görev Parametreleri</h6></th></tr>';
								Object.keys(parameterMap).forEach(function(key){
									tableContent += '<tr><th>' + key + '</th><td>' + parameterMap[key] + '</td></tr>';
								});
//								$.each(parameterMap, function(key, value){
//								tableContent += '<tr><th>' + key + '</th><td>' + value + '</td></tr>';
//								});
							}
							if(data.responseDataStr != null && data.responseDataStr != "" && data.responseDataStr != "?") {
								tableContent += '<tr><th colspan="100%"><h6>Görev Çalıştırılması Sonucunda Kaydedilen Veriler</h6></th></tr>';
								$.each(jQuery.parseJSON( data.responseDataStr ), function(key, value){
									tableContent += '<tr><th>' + key + '</th><td>' + value + '</td></tr>';
								});
							}
						} else {
							tableContent += '<tr><th>Çalıştırma Sonucu</th><td>' + 'Gönderildi' + '</td></tr>';
							tableContent += '<tr><th>Oluşturulma Tarihi</th><td>' + executionDate + '</td></tr>';
							tableContent += '<tr><th>Çalıştırılma Tarihi</th><td>' + '-' + '</td></tr>';
							tableContent += '<tr><th>Görev İçeriği</th><td>' + '-' + '</td></tr>';
						}
						tableContent += '<tr><th>Ahenkten Gelen Mesaj</th><td>' + data.responseMessage + '</td></tr>';

						$("#executedTaskDetailTable").empty();
						$('#executedTaskDetailTable').append(tableContent);
					}
				} else {
					$.notify("No results found.", "error");
				}
			},
			error: function (data, errorThrown) {
				$.notify("Something went wrong.", "error");
			}
		});
	} else {
		var tableContent = '<tr><th style="width: 35%">Görev Adı</th><td style="width: 65%">' + commandClsId + '</td></tr>';
		if(parameterMap != null) {
			tableContent += '<tr><th colspan="100%"><h6>Görev Parametreleri</h6></th></tr>';
			Object.keys(parameterMap).forEach(function(key){
				tableContent += '<tr><th>' + key + '</th><td>' + parameterMap[key] + '</td></tr>';
			});
			$("#executedTaskDetailTable").empty();
			$('#executedTaskDetailTable').append(tableContent);
//			$.each(parameterMap, function(key, value){
//			tableContent += '<tr><th>' + key + '</th><td>' + value + '</td></tr>';
//			});
		}
	}
}

function dropdownButtonClicked(operation) {
	if(operation == "addToExistingGroup") {
		getModalContent("modals/computer/addtoexistinggroup", function content(data){
			$('#genericModalHeader').html("Seçili İstemcileri Gruba Ekle");
			$('#genericModalBodyRender').html(data);
			generateAddToExistingGroupTreeGrid();
			$("#addToExistingGroupButtonDiv").hide();

		});
	} else if(operation == "addToNewGroup") {
		getModalContent("modals/computer/addtonewgroup", function content(data){
			$('#genericModalHeader').html("Seçili İstemcileri Gruba Ekle");
			$('#genericModalBodyRender').html(data);
			generateAddToNewGroupTreeGrid();

		});
	}
}

function generateAddToExistingGroupTreeGrid() {
	createComputerTree('lider/computer_groups/agentGroups','existingTreeGrid', false, false,
			// row select
			function(row, rootDnComputer){
		if(row.type == "GROUP"){
			$("#addToExistingGroupButtonDiv").show();
		} else {
			$("#addToExistingGroupButtonDiv").hide();
		}
	},
	//check action
	function(checkedRows, row){

	},
	//uncheck action
	function(unCheckedRows, row){

	}
	);
}

function generateAddToNewGroupTreeGrid() {

	createComputerTree('lider/computer_groups/agentGroups','newTreeGridDiv', false, false,
			// row select
			function(row, rootDnComputer){
		selectedOUDN = row.distinguishedName;
	},
	//check action
	function(checkedRows, row){

	},
	//uncheck action
	function(unCheckedRows, row){

	}
	);
}

function btnAddToExistingGroupClicked() {
	var selectedAgentDN = [];
	for(var i = 0; i < selectedEntries.length; i++) {
		selectedAgentDN.push(selectedEntries[i].distinguishedName);
	}
	var selected = $("#selectGroupDN").children("option:selected").val();
	if(selectedAgentDN.length > 0) {
		var params = {
				"groupDN" : selectedAgentGroupDN,
				"checkedList": selectedAgentDN
		};
		$.ajax({ 
			type: 'POST', 
			url: "/lider/computer/group/existing",
			dataType: 'json',
			data: params,
			success: function (data) { 
				$.notify("Seçili istemciler gruba başarıyla eklendi", "success");
				$('#genericModal').trigger('click');
			},
			error: function (data, errorThrown) {
				$.notify("Seçili istemciler gruba eklenirken hata oluştu.", "error");
			}
		});
	}
}

function btnAddToNewGroupClicked() {
	var groupName = $('input[name=newAgentGroupName]').val();
	if(groupName != "") {
		var selectedAgentDN = [];
		for(var i = 0; i < selectedEntries.length; i++) {
			selectedAgentDN.push(selectedEntries[i].distinguishedName);
		}
		var params = {
				"selectedOUDN" : selectedOUDN,
				"groupName": $('input[name=newAgentGroupName]').val(),
				"checkedList": selectedAgentDN
		};

		$.ajax({ 
			type: 'POST', 
			url: "/lider/computer/createNewAgentGroup",
			dataType: 'json',
			data: params,
			success: function (data) { 
				$.notify("Yeni grup oluşturuldu ve istemciler gruba eklendi.", "success");
				$('#genericModal').trigger('click');
			},
			error: function (data, errorThrown) {
				$.notify("Yeni grup oluşturulurken hata oluştu." + $('input[name=newAgentGroupName]').val() + " oluşturulamadı.", "error");
			}
		});
	} else {
		$.notify("Lütfen grup adı giriniz.", "error");
	}

}
function rbGroupsChange(status) {
	if(status == "existingGroup") {
		$("#newGroupInput").hide();
		$("#existingGroupInput").show();
		$("#submitGroup").attr("onclick","addAgentsToExistingGroup()");
		$('#submitGroup').text('İstemcileri Seçili Gruba Ekle');
	} else {
		$("#existingGroupInput").hide();
		$("#newGroupInput").show();
		$("#submitGroup").attr("onclick","addNewGroup()");
		$('#submitGroup').text('Yeni Grup Oluştur');
	}
}

function createAgentGroupClicked () {
	if(selectedEntries.length > 0) {
		$.ajax({ 
			type: 'GET', 
			url: '/lider/computer_groups/agentGroups',
			dataType: 'json',
			success: function (data) { 
				//choose existing radio button when modal is reopened
				$("#rbExistingGroup").prop("checked", true);
				$("#rbNewGroup").prop("checked", false);
				$('#groupName').val('');
				$("#newGroupInput").hide();
				$("#existingGroupInput").show();
				$("#submitGroup").attr("onclick","addAgentsToExistingGroup()");
				$('#submitGroup').text('İstemcileri Seçili Gruba Ekle');

				if(data.length > 0) {
					var options = $("#selectGroupDN");
					options.empty();
					$.each(data, function(index, element) {
						if(element.childEntries.length > 0) {
							$('#selectGroupDN').append('<option value="">Grup Seç</option>');
							$.each(element.childEntries, function(j, child) {
								options.append(new Option(child.name, child.distinguishedName));
							});
						}
					});
				}
			},
			error: function (data, errorThrown) {
				$.notify("Something went wrong.", "error");
			}
		});
	}
	else {
		$.notify("Lütfen en az bir istemci seçiniz.", "error");
	}
}

function addAgentsToExistingGroup() {
	var selectedAgentDN = [];
	for(var i = 0; i < selectedEntries.length; i++) {
		selectedAgentDN.push(selectedEntries[i].distinguishedName);
	}
	var selected = $("#selectGroupDN").children("option:selected").val();
	if(selected != "") {
		var params = {
				"groupDN" : $("#selectGroupDN").children("option:selected").val(),
				"checkedList": selectedAgentDN
		};
		$.ajax({ 
			type: 'POST', 
			url: "/lider/computer/group/existing",
			dataType: 'json',
			data: params,
			success: function (data) { 
				$.notify("Selected gents are added to group successfully.", "success");
			},
			error: function (data, errorThrown) {
				$.notify("Something went wrong.", "error");
			}
		});
	}
}

function addNewGroup() {
	var selectedAgentDN = [];
	for(var i = 0; i < selectedEntries.length; i++) {
		selectedAgentDN.push(selectedEntries[i].distinguishedName);
	}
	var params = {
			"groupName" : $('input[name=groupName]').val(),
			"checkedList": selectedAgentDN
	};
	$.ajax({ 
		type: 'POST', 
		url: "/lider/computer/createNewAgentGroup",
		dataType: 'json',
		data: params,
		success: function (data) { 
			$.notify("Group is created and agents are added to group successfully.", "success");
		},
		error: function (data, errorThrown) {
			$.notify("Error occured while adding new group. Group Name " + $('input[name=groupName]').val() + " could not be added.", "error");
		}
	});
}

function addSelectedEntryToTable(row,rootDnComputer){
	if(row.type=="AHENK"){
//		var indexx=$.grep(selectedEntries, function(item){
//			return item.entryUUID == row.entryUUID;
//		}).length

		data={}
		data.type=row.type;
		data.entryUUID=row.entryUUID;
		data.name=row.name;
		data.online=row.online;
		data.uid=row.uid;
		data.distinguishedName=row.distinguishedName;
		data.cn=row.cn;
		data.attributes=row.attributes;
		/**
		 * selected entries should be one element 
		 */
		selectedEntries=[]
		selectedEntries.push(data);
		showSelectedEntries();
		$("#selectedAgentDN").text(selectedRow.distinguishedName);
		$("#selectedAgentDNSSH").text("DN : "+selectedRow.distinguishedName);
		$("#moveAgent").show();
		$("#deleteAgent").show();
		$("#btnRenameAgent").show();
		$("#selectedAgentInfo").html(selectedRow.name); 
		$("#btnAddOu").hide();
		$("#btnDeleteOu").hide();
		$("#updateAgentInfo").show();
	}
//	else if(row.type=="ORGANIZATIONAL_UNIT"){
//		
//		$("#agentDn").html(getEntryFolderName(selectedRow.distinguishedName));
//		
//	}
	else{
		$('#selectedAgentInfo').prop('title', row.distinguishedName);
		$("#agentStatusIcon").html('<i class="fa fa-toggle-off"></i> Durum');
		$("#btnRenameAgent").hide();
		$("#moveAgent").hide();
		$("#deleteAgent").hide();
		selectedEntries=[]
		$("#selectedAgentInfo").html("Lütfen İstemci Seçiniz."); 
		$("#selectedAgentInfo").html(selectedRow.ou); 
		$("#agentOnlineStatus").hide()
		$("#agentHostname").html("");
		$("#agentIpAddr").html("");
		$("#agentMac").html("");
		$("#agentCreateDate").html("");
		$("#agentOsName").html("");
//		$("#agentUsername").html("");
		$("#agentProcessor").html("");
		$("#agentOsName").html("");
		$("#agentPhase").html("");
		$("#userDomain").html("");
		$("#agentDn").html("");
		$("#updateAgentInfo").hide();
		$("#selectedAgentDN").text("");
		$("#selectedAgentDNSSH").text("");
		$("#selectedAgentDNSSHIP").text("");
		$("#agentDn").html(getEntryFolderName(selectedRow.distinguishedName));
		getAllAndOnlineAgents(selectedRow.distinguishedName);
		$("#btnAddOu").show();
		$("#btnDeleteOu").show();
		$("#agentVersion").html("");
	}
}

function showSelectedEntries() {

	$("#selectedAgentList").show();

	var html= '<button class="btn btn-outline-light" > <span id="btnAgent" > </span> </button> ';
	html += ' <button type="button" aria-haspopup="true" aria-expanded="false" data-toggle="dropdown" class="dropdown-toggle-split dropdown-toggle btn btn-light"> '
	html += ' <span class="sr-only">Toggle Dropdown</span></button>'
	html += ' <div tabindex="-1" role="menu" aria-hidden="true" class="dropdown-menu" >'
	var dnVal=""
			for (var i = 0; i < selectedEntries.length; i++) {
					var selDn = selectedEntries[0].distinguishedName
					dnVal=selectedEntries[0].name;
					var dn=selectedEntries[i].name;
					html +='<button type="button" tabindex="0" class="dropdown-item"> ' +dn+' </button>'
			}
	html += ' </div> '	 
	$('#selectedAgentList').html(html);
	$("#selectedAgentInfo").html(dnVal);
	$('#selectedAgentInfo').prop('title', selDn);
	
//	if(selectedEntries[0].type=='AHENK')
//	{
//		$("#agent_image").attr("src","img/person.png");
//	}
	
	$("#agentOnlineStatus").show()
	if(selectedEntries[0].online)
	{
		$("#agentOnlineStatus").attr("class","badge badge-success");
		$("#agentOnlineStatus").html("Çevrimiçi");
		$("#agentStatusIcon").html('<i class="fas fa-toggle-on"></i> Durum');
	}
	else{
		$("#agentOnlineStatus").attr("class","badge badge-danger");
		$("#agentOnlineStatus").html("Çevrimdışı");
		$("#agentStatusIcon").html('<i class="fa fa-toggle-off"></i> Durum');
	}
	
	var agentJid = selectedEntries[0]['attributes'].uid;
	var params = {
			"agentJid" : agentJid
	};
	
	$("#agentHostname").html("");
	$("#agentIpAddr").html("");
	$("#agentMac").html("");
	$("#agentCreateDate").html("");
	$("#agentOsName").html("");
//	$("#agentUsername").html("");
	$("#agentProcessor").html("");
	$("#agentOsName").html("");
	$("#agentPhase").html("");
	$("#userDomain").html("");
	$("#agentDn").html("");
	$("#agentVersion").html("");
	
	$.ajax({ 
		type: 'POST', 
		url: 'select_agent_info/detail',
		data: params,
		dataType: 'json',
		success: function (data) {
			selectedRowDataFromDB=data;
			
			var ipAddress= selectedRowDataFromDB.ipAddresses.replace(/\'/g, '');
			
			$("#selectedAgentDNSSHIP").val(ipAddress);
			if(data.properties.length > 0) {
				$("#agentVersion").html("Bilinmiyor");
				$.each(data.properties, function(index, element) {

					if (element.propertyName == "os.name") {
						$("#agentOsName").html(element.propertyValue);
					}
					if (element.propertyName == "processor") {
						$("#agentProcessor").html(element.propertyValue);
					}
//					if (element.propertyName == "sessions.userNames") {
//						$("#agentUsername").html(element.propertyValue);
//					}
					if (element.propertyName == "os.name") {
						$("#agentOsName").html(element.propertyValue);
					}
					if (element.propertyName == "agentVersion") {
						$("#agentVersion").html(element.propertyValue);
					}
//					if (element.propertyName == "phase") {
//						var phase = "Faz bilgisi alınamadı"
//						if (element.propertyValue){
//							phase = element.propertyValue;
//							$("#agentPhase").html(phase);
//						}
//					}
				});
				userDomain = data.userDirectoryDomain;
				if (userDomain == "NONE") {
					userDomain = "Bilinmiyor";
				}
				$("#agentHostname").html(data.hostname);
				$("#agentIpAddr").html(data.ipAddresses);
				$("#agentMac").html(data.macAddresses);
				$("#agentCreateDate").html(data.createDate);
				$("#userDomain").html(userDomain);
				$('#agentDn').html(getEntryFolderName(selDn));
				
			} else {
				$("#agentHostname").html("");
				$("#agentIpAddr").html("");
				$("#agentMac").html("");
				$("#agentCreateDate").html("");
				$("#agentOsName").html("");
//				$("#agentUsername").html("");
				$("#agentProcessor").html("");
				$("#agentOsName").html("");
				$("#userDomain").html("");
				$("#agentDn").html("");
				$("#agentVersion").html("");
			}
		}
	});
}

function taskHistory() {
	if(selectedRow==null){
		var trElement = '<tr><td colspan="5" class="text-center">Görev tarihçesini görüntelemek için sadece bir adet istemci seçiniz.</td></tr>';
		$("#taskHistoryTable").empty();
		$('#taskHistoryTable').append(trElement);
		$('#selectedAgentInfoSection').hide();
	}
	else {
//		var selectedRowData=checkedRows[checkedRows.length-1];
		$('#selectedAgentInfoSection').show();
		$("#selectedAgentDN").text(selectedRow.distinguishedName);
		var params = {
				"dn" : selectedRow.distinguishedName
		};
		$.ajax({ 
			type: 'POST', 
			url: "/command",
			dataType: 'json',
			data: params,
			success: function (data) { 
				if(data.length > 0) {
					var trElement = "";
					historyData = data;
					$.each(data, function(index, command) {
						var executionResult = "";
						var executionTime = "-";
						trElement += '<tr>';
						trElement += '<td>' + command.task.plugin.name + '</td>';
						if(command.commandExecutions[0].commandExecutionResults.length > 0) {
							executionResult = command.commandExecutions[0].commandExecutionResults[0].responseCode;
							executionTime = command.commandExecutions[0].commandExecutionResults[0].createDate;

							if(executionResult == "TASK_PROCESSED") {
								trElement += '<td>' + '<div class="badge p-1 m-0 badge-success">Başarılı</div>' + '</td>';
							} else {
								trElement += '<td>' + '<div class="badge p-1 m-0 badge-danger">Hata oluştu</div>' + '</td>';
							}
						} else {
							trElement += '<td>' + '<div class="badge p-1 m-0 badge-info">Gönderildi</div>' + '</td>';
						}

						trElement += '<td>' + command.commandOwnerUid  + '</td>';

						var createDate = command.commandExecutions[0].createDate;

						trElement += '<td>' + createDate + '</td>';
						trElement += '<td>' + executionTime + '</td>';
						
						if(executionResult == "TASK_PROCESSED" || executionResult == "TASK_ERROR") {
							var taskId = command.task.id;
							trElement += '<td class="text-center"><a href="#executedTaskDetail" class="btn btn-sm text-center p-0 m-0" '
								+ 'onclick="executedTaskDetailClicked('
								+ '\'' + createDate + '\', '
								+ '\'' + command.task.commandClsId + '\', '
								+ '\'' + taskId + '\', '
								+ '\'' + command.commandExecutions[0].commandExecutionResults[0].id + '\')" data-id="' 
								+ command.commandExecutions[0].commandExecutionResults[0].id
								+ '" data-toggle="modal" data-target="#executedTaskDetail">'
								+ '<i class="fa fa-info-circle fa-lg" aria-hidden="true"></i>'
								+ '</a></td></tr>';
						} else {
							var taskId = command.task.id;
							var commandExecutionResultsId = "NA";
							trElement += '<td class="text-center"><a href="#executedTaskDetail" class="btn btn-sm text-center p-0 m-0" '
								+ 'onclick="executedTaskDetailClicked('
								+ '\'' + createDate + '\', '
								+ '\'' + command.task.commandClsId + '\', '
								+ '\'' + taskId + '\', '
								+ '\'' + commandExecutionResultsId + '\')" data-id="' 
								+ commandExecutionResultsId
								+ '" data-toggle="modal" data-target="#executedTaskDetail">'
								+ '<i class="fa fa-info-circle fa-lg" aria-hidden="true"></i>'
								+ '</a></td></tr>';
						}
					});
					$("#taskHistoryTable").empty();
					$('#taskHistoryTable').append(trElement);
				} else {
					$("#taskHistoryTable").empty();
					var trElement = '<tr><td colspan="5" class="text-center">Bu ahenk üzerinde henüz bir görev çalıştırılmamıştır.</td></tr>';
					$('#taskHistoryTable').append(trElement);
				}
			},
			error: function (data, errorThrown) {
				$.notify("Something went wrong.", "error");
			}
		});
	}
}

function showPageAndHideOthers(showPageId){
	var historyData = null;
	var trElement = '<tr><td colspan="5" class="text-center">Görev tarihçesini görüntelemek için sadece bir adet istemci seçiniz.</td></tr>';
	$("#taskHistoryTable").empty();
	$('#taskHistoryTable').append(trElement);
	$('#selectedAgentInfoSection').hide();
	$("#systemPage").hide();
	$("#packageManagementPage").hide();
	$("#serviceManagementPage").hide();
	$("#scriptManagementPage").hide();
	$("#securityAndNetworkManagementPage").hide();
	$("#taskHistoryPage").hide();
	$("#sshPage").hide();
	$("#installAhenkPage").hide();
	
	$('#' +showPageId).show();
}

function SHHConnect(){
	
	var sshUserName=$("#sshUserName").val();
	var sshUserPassword=$("#sshUserPassword").val();
	var ip=$("#selectedAgentDNSSHIP").val();
	if(ip.includes(",")){
		$.notify("Lütfen IP adresini kontrol ediniz.", "warn");
		return;
	}
	if(sshUserName=="" | sshUserPassword ==""){
		$.notify("Lütfen kullanıcı adı veya parola giriniz.", "warn");
		return;
	}
	var params = {
			"protocol" : "ssh",
			"host" : ip,
			"port": "22",
			"password": sshUserPassword,
			"username": sshUserName
	};
	
	$.ajax({
		type: 'POST', 
		url: "/sendremote",
		data: params,
		success: function(data) {
			displaySSHConnection();
		},
		error: function (jqXHR, textStatus, errorThrown) {

		}
	});
}

function displaySSHConnection() {
	$('#sshDisplay').show()
	$('#btnSSHConnect').prop( "disabled", true );
	 // Get display div from document
    var display = document.getElementById("sshDisplay");

    // Instantiate client, using an HTTP tunnel for communications.
    var guac = new Guacamole.Client(
        new Guacamole.HTTPTunnel("tunnel")
    );

    // Add client to display div
    display.append(guac.getDisplay().getElement());
    
    // Error handler
    guac.onerror = function(error) {
    	$.notify("SSH bağlantısında hata oluştu", "warn");
    };
    // Connect
    guac.connect();
   
    
    // Disconnect on close
    window.onunload = function() {
        guac.disconnect();
    }
    
    var mouse = new Guacamole.Mouse(guac.getDisplay().getElement());
    
    
    mouse.onmousedown = 
        mouse.onmouseup   =
        mouse.onmousemove = function(mouseState) {
            guac.sendMouseState(mouseState);
        };
    // Keyboard
    var keyboard = new Guacamole.Keyboard(document);

    keyboard.onkeydown = function (keysym) {
        guac.sendKeyEvent(1, keysym);
    };

    keyboard.onkeyup = function (keysym) {
        guac.sendKeyEvent(0, keysym);
    };
    
//    $("#sshUserName").click(function(e) {
//
//        // called when textfield is clicked (so it must be focussed)
//
//        keyboard.onkeydown = null;
//        keyboard.onkeyup = null;
//
//    }).on("blur", function(e) {
//
//    // called when textfield it is unfocussed
//
//        keyboard.onkeydown = function(keysym) {
//            guac.sendKeyEvent(1, keysym);
//        };
//        keyboard.onkeyup = function(keysym) {
//            guac.sendKeyEvent(0, keysym);
//        };
//
//    });
    
    $('#btnSSHDisconnect').click(function(e){
    	 keyboard.onkeydown = null;
         keyboard.onkeyup = null;
		 
         guac.disconnect();
		 $('#sshDisplay').html("")
		 $('#btnSSHConnect').prop( "disabled", false );
    });
    
    $('.dizin').click(function(e){
    	keyboard.onkeydown = null;
    	keyboard.onkeyup = null;
    	
    	guac.disconnect();
    	$('#sshDisplay').html("")
    });
    
    $('.computerActions').click(function(e){
    	keyboard.onkeydown = null;
    	keyboard.onkeyup = null;
    });
    
    $('#btn-ssh').click(function(e){
    	  keyboard.onkeydown = function (keysym) {
    	        guac.sendKeyEvent(1, keysym);
    	    };

    	    keyboard.onkeyup = function (keysym) {
    	        guac.sendKeyEvent(0, keysym);
    	    };
    });
}

function executeRemoteSshCommand(host,user, password,command, callback) {
	var params = {
			"command" : command,
			"host" : host,
			"password": password,
			"username": user
	};
	$.ajax({
		type: 'POST', 
		url: "/remoteSsh/executeSshCommand",
		data: params,
		success: function(data) {
			setShhLog(data)
			callback("OK")
		},
		error: function (jqXHR, textStatus, errorThrown) {
		}
	});
}

function checkSshConnection(host,user, password) {
	var params = {
			"host" : host,
			"username" : user,
			"password": password
	};
	$.ajax({
		type: 'POST', 
		url: "/remoteSsh/checkSSHConnection",
		data: params,
		success: function(data) {
			if(data==1){
				$.notify("Bağlantı başarı ile sağlandı.", "success");
				setShhLog("Bağlantı başarı ile sağlandı.")
			}
			else if(data==0){
				$.notify("Bağlantı başarısız. Lütfen bağlantınızı kontrol ediniz. Bağlantı kurulacak istemcide SSH kurulu olduğuna emin olunuz.");
				setShhLog("Bağlantı başarısız. Lütfen bağlantınızı kontrol ediniz. Bağlantı kurulacak istemcide SSH kurulu olduğuna emin olunuz.")
			}
		},
		error: function (jqXHR, textStatus, chechkSshConnectionerrorThrown) {
		}
	});
}

function setShhLog(message){
	var d = new Date();
	var day = d.getDate();
	var month = (d.getMonth()+1);
	var year = d.getFullYear();
	var h = d.getHours();
	var minu = d.getMinutes();
	var sec = d.getSeconds();
	$('#installAhenkLog').append(day+'/'+month+'/'+year+' '+h+':'+ minu+ ':'+ sec)
	$('#installAhenkLog').append("\n")
	$('#installAhenkLog').append(message)
	$('#installAhenkLog').append("\n")
	$('#installAhenkLog').append("---------------------------------------------------------")
	$('#installAhenkLog').append("\n")
}

function getAllAndOnlineAgents(searchDn) {
	progress("computerTreeOnlineInfo","progressComputerTreeInfo",'show')
	
	var params = {
				"searchDn" : searchDn,
		};
	$.ajax({
		type: 'POST', 
		url: "/lider/computer/getAgentList",
		dataType: 'json',
		data: params,
		success: function(data) {
			progress("computerTreeOnlineInfo","progressComputerTreeInfo",'hide')
			$('#btnTotalAgent').append("")
			$('#btnOnlineAgent').append("")
			$('#btnTotalAgent').html("Toplam İstemci Sayısı :"+data.agentListSize)
			$('#btnOnlineAgent').html("Çevrimiçi İstemci Sayısı :"+data.onlineAgentList.length)
			
		},
		error: function (jqXHR, textStatus, chechkSshConnectionerrorThrown) {
		}
	});
}

///**
// * getting all agent size and online agent list for show on page
// * @param presence
// * @returns
// */
//getAllAgents();

function getEntryFolderName(selDn) {
	var dnArr=selDn.split(",");
	var ous=""
	for(i=0; i<dnArr.length; i++){
		var dn=dnArr[i];
		if(dn.startsWith("ou")){
			var arr= dn.split("=");
			if(arr.length>0){
				if(arr[1] != 'Ahenkler'){
					ous += arr[1]
					if(i < dnArr.length){
						ous +=" "
					}
				}
			}
		}
	}
	return ous;
}

/*
 * function for opening modal for dn selection to search
 */
function btnSelectDNFromTreeClicked() {
	getModalContent("modals/agent_info/select_ou", function content(data){
		$('#genericModalHeader').html("Arama için bi klasör seçiniz");
		$('#genericModalBodyRender').html(data);
		generateTreeForOUSelection();
	});
}

/*
 * create user tree select, check and uncheck action functions can be implemented if required
 * params div, onlyFolder, use Checkbox, select action , check action, uncheck action
 */
function generateTreeForOUSelection() {
	createComputerTree('lider/computer/getComputers','treeGridHolderDiv', true, false,
		// row select
		function(row, rootDnComputer){
			selectedRowForMovingEntry = row
			if(row.type == "ORGANIZATIONAL_UNIT")
				$('#btnSelectOUForSearch').prop("disabled", false); 
			else 
				$('#btnSelectOUForSearch').prop("disabled", true); 
		},
		//check action
		function(checkedRows, row){
		
		},
		//uncheck action
		function(unCheckedRows, row){
		
		}
	);
}

/*
 * function for opening modal for renaming computer(hostname)
 */
function btnRenameAgentClicked() {
	getModalContent("modals/computer/renameComputer", function content(data){
		$('#genericModalHeader').html("İstemci adını değiştirme");
		$('#genericModalBodyRender').html(data);
	});
}

/*
* update hostname on Lider database and send task to change it on ahenk
*/
function btnSaveRenameEntryClicked() {
	if( $('#newHostname').val() == "" ) {
		$.notify("Yeni istemci adı boş bırakılamaz", "error");
	}
	var params = {
			"agentDN" : selectedRow.distinguishedName,
			"cn": selectedRow.cn,
			"newHostname": $('#newHostname').val()
	};
	$.ajax({ 
		type: 'POST', 
		url: '/lider/computer/rename/agent',
		dataType: 'json',
		data: params,
		success: function (data) {
			$.notify("İstemci adı başarıyla değiştirildi.", "success");
			$('#genericModal').trigger('click');
			$('#menuBtnComputers').trigger('click');
		},
		error: function (jqXHR, textStatus, errorThrown) {
			if(jqXHR.status == 409) {
				$.notify("Aynı isme sahip başka istemci bulunmaktadır. Lütfen başka isim seçiniz.", "error");
			} else {
				$.notify("İstemci adı değiştirilirken hata oluştu.", "error");
			}
		}
	});
}

function btnUseSelectedOUClicked() {
	if( selectedRow.parent.distinguishedName == selectedRowForMovingEntry.distinguishedName ) {
		$.notify("Kayıt aynı yere taşınamaz.", "error");
	} else {
		var params = {
				"sourceDN" : selectedRow.distinguishedName,
				"sourceCN": selectedRow.cn,
				"destinationDN": selectedRowForMovingEntry.distinguishedName
		};
		$.ajax({ 
			type: 'POST', 
			url: '/lider/computer/move/agent',
			dataType: 'json',
			data: params,
			success: function (data) {
				$.notify("Kayıt taşındı.", "success");
				$('#genericModal').trigger('click');
				$('#menuBtnComputers').trigger('click');
			},
			error: function (data, errorThrown) {
				$.notify("Kayıt taşınırken hata oluştu.", "error");
			}
		});
	}	
}

$('#deleteAgent').click(function(e){
	if(selectedEntries.length ==0 ){
		$.notify("Lütfen İstemci Seçiniz", "error");
		return;
	}

	var content = "Bu istemciyi silmek istediğinizden emin misiniz ? <br> Silme işlemi geri alınamaz ve " +
			"bu işlem sonucunda veritabanında ve LDAP'ta bu istemciye ait tüm bilgiler silinecektir. Ayrıca istemci domainden çıkarılacaktır.";
	$.confirm({
		title: 'Uyarı!',
		content: content,
		theme: 'light',
		buttons: {
			Evet: function () {
				deleteAgent();
			},
			Hayır: function () {
			}
		}
	});
});

function deleteAgent() {
	var params = {
			"agentDN" : selectedRow.distinguishedName,
			"agentUID" : selectedRow.cn
	};
	$.ajax({ 
		type: 'POST', 
		url: '/lider/computer/delete/agent',
		dataType: 'json',
		data: params,
		success: function (data) {
			$.notify("Kayıt silindi.", "success");
			$('#menuBtnComputers').trigger('click');
		},
		error: function (data, errorThrown) {
			$.notify("Kayıt silinirken hata oluştu.", "error");
		}
	});
}


$('#btnAddOu').on('click',function(event) {
	if(selectedRow==null){
		$.notify("Lütfen Klasör Seçiniz","warn");
	}
	else{
		getModalContent("modals/computer/addOuModal", function content(data){
				$('#genericModalHeader').html("Klasör Yönetimi")
				$('#genericModalBodyRender').html(data);
				$('#ouInfo').html(selectedRow.ou +"/");
				$('#addOu').on('click', function (event) {
						var parentDn=selectedRow.distinguishedName; 
						var parentName= selectedRow.ou;
						var parentEntryUUID= selectedRow.entryUUID;
						var ouName= $('#ouName').val();
						$.ajax({
							type : 'POST',
							url : 'lider/user/addOu',
							data: 'parentName='+parentDn +'&ou='+ouName,
							dataType : 'json',
							success : function(data) {
								$.notify("Klasör Başarı İle Eklendi.", "success");
								$('#genericModal').trigger('click');
								$('#menuBtnComputers').trigger('click');
							}
						});
				});
			} 
		);
	}
});

//Create ou for selected parent node. Ou modal will be open for all releated pages..
$('#btnDeleteOu').on('click',function(event) {
	getModalContent("modals/computer/deleteOuModal", function content(data){
		$('#genericModalHeader').html("Klasör Sil")
		$('#genericModalBodyRender').html(data);
		
		$('#deleteOuBtn').on('click', function (event) {
			deleteUserOu(selectedRow)
		});
	} 
	);
});

function deleteUserOu(row) {
	var dnList = [];
	dnList.push({
			distinguishedName :row.distinguishedName, 
			entryUUID: row.entryUUID, 
			name: row.name,
			type: row.type,
			uid: row.uid
		});
    $.ajax({
		type : 'POST',
		url : 'lider/computer/deleteComputerOu',
		data : JSON.stringify(dnList),
		dataType: "json",
		contentType: "application/json",
		success : function(ldapResult) {
			if(ldapResult){
				$.notify("Klasör başarı ile silindi.",{className: 'success',position:"right top"}  );
				$('#genericModal').trigger('click');
				$('#menuBtnComputers').trigger('click');
			}
			else{
				$.notify("Seçilen klasörün alt klasör veya istemcileri bulunamkatdır. Silme işlemi için klasör boş olmalıdır.",{className: 'warn',position:"right top"}  );
				$('#genericModal').trigger('click');
			}
			
		},
	    error: function (data, errorThrown) {
			$.notify("Silme İşleminde Hata Oluştu.", "error");
		}
	});  
}

function jid_to_id(jid) {
	return Strophe.getBareJidFromJid(jid);
	/*  .replace("@", "-")
        .replace(".", "-") */
}

function jid_to_name(jid) {
	return jid.substr(0, jid.indexOf('@'));
}

function jid_to_source(jid) {
	return jid.substr(jid.indexOf('/')+1,jid.length );
}

//function addRoster() {
//	$.ajax({
//		type: 'POST', 
//		url: "/lider/computer/addRoster",
//		success: function(data) {
//			console.log(data)
//		},
//		error: function (jqXHR, textStatus, chechkSshConnectionerrorThrown) {
//		}
//	});
//	
//}

$('#updateAgentInfo').click(function(e){
	if(selectedEntries.length ==0 ){
		$.notify("Lütfen İstemci Seçiniz", "error");
		return;
	}

	var content = "İstemci bilgilerini güncellemek istiyor musunuz?";
	$.confirm({
		title: 'Uyarı!',
		content: content,
		theme: 'light',
		buttons: {
			Evet: function () {
				progress("divAgentInfo","progressAgentInfo",'show');
				getAgentInfo();
			},
			Hayır: function () {
			}
		}
	});
});

function getAgentInfo() {
	var params = {
			"agentDN" : selectedRow.distinguishedName,
	};
	$.ajax({ 
		type: 'POST', 
		url: '/lider/computer/get_agent_info',
		dataType: 'json',
		data: params,
		success: function (data) {
			refUpdateAgentInfo = connection.addHandler(updateAgentInfoListener, null, 'message', null, null,  null);
		},
		error: function (data, errorThrown) {
			$.notify("Ahenk bilgileri güncellenirken hata oluştu.", "error");
		}
	});
}

function updateAgentInfoListener(msg) {
	var to = msg.getAttribute('to');
	var from = msg.getAttribute('from');
	var type = msg.getAttribute('type');
	var elems = msg.getElementsByTagName('body');

	if (type == "chat" && elems.length > 0) {
		var body = elems[0];
		var data=Strophe.xmlunescape(Strophe.getText(body));
		var xmppResponse=JSON.parse(data);
		var responseDn = xmppResponse.commandExecution.dn;
		var selectedDn = selectedEntries[0]["attributes"].entryDN;
		if(xmppResponse.commandClsId == "AGENT_INFO"){
			if (xmppResponse.result.responseCode == "TASK_PROCESSED" || xmppResponse.result.responseCode == "TASK_ERROR") {
				progress("divAgentInfo","progressAgentInfo",'hide');
				if (responseDn == selectedDn) {
					if (xmppResponse.result.responseCode == "TASK_PROCESSED") {
						var arrg = JSON.parse(xmppResponse.result.responseDataStr);
						if (refUpdateAgentInfo) {
							connection.deleteHandler(refUpdateAgentInfo);
						}
						updateAgentInfo(arrg);

					} else {
						$.notify(xmppResponse.result.responseMessage, "error");
					}
				}
			}
		}						 
	}
	// we must return true to keep the handler alive. returning false would remove it after it finishes.
	return true;
}

function updateAgentInfo(arrg) {
	var params = {
			"ipAddresses": arrg.ipAddresses,
			"hostname": arrg.hostname,
			"agentVersion": arrg.agentVersion,
			"macAddresses": arrg.macAddresses,
			"agentUid" : selectedRow.uid,
	};

	$.ajax({ 
		type: 'POST', 
		url: '/lider/computer/update_agent_info',
		dataType: 'json',
		data: params,
		success: function (data) {
			if (data == true) {
				$("#agentHostname").html(arrg.hostname);
				$("#agentIpAddr").html(arrg.ipAddresses);
				$("#agentMac").html(arrg.macAddresses);
				$("#agentVersion").html(arrg.agentVersion);
				$.notify("Ahenk bilgileri güncellendi.", "success");
			} else {
				$.notify("Ahenk bilgileri güncellenirken hata oluştu.", "error");
			}
		},
		error: function (data, errorThrown) {
			$.notify("Ahenk bilgileri güncellenirken hata oluştu.", "error");
		}
	});
}
