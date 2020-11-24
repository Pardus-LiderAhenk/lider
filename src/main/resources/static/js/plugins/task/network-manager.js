/**
 * network-manager
 * DNS, hostname, hosts file, ip settings and opened port management
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

if (ref_network_manager) {
	connection.deleteHandler(ref_network_manager);
}

var scheduledParamNetworkManager = null;
var scheduledModalNetworkManagerOpened = false;
var pluginTask_NetworkManager = null;
var dnlist = [];
var newIsActive = true;
var newDns = null;
var newDomainName = null;
var newDnsType = null;
var newNetworkType = null;
var newNetAddress = null;
var newNetName = null;
var newNetmask = null;
var newGateway = null;
var selectDnsRow = null;
var selectHostRow = null;
var selectNetSettingsRow = null;
var selectPortRow = null;
var newHostIp = null;
var newServerName = null;
var getSettingSuccess = false; 
var ref_network_manager = connection.addHandler(networkManagerListener, null, 'message', null, null,  null);

$('#currentConfigurationTabTask').tab('show');
networkSettingsHideBtn();
setEnableOrDisableNerworkManagerForm(true);

function networkSettingsHideBtn() {
//	$("#updateMachineHostnameBtn").hide();
	$("#addHostBtn").hide();
	$('#deleteHostBtn').hide();
	$('#deleteNetworkSettingBtn').hide();
	$('#addNetworkSettingBtn').hide();
	$("#addDnsBtn").hide();
	$('#deleteDnsBtn').hide();
	$('#allowPortBtn').hide();
	$('#blockPortBtn').hide();
	$('#addNetworkForm').hide();
}

function setEnableOrDisableNerworkManagerForm(disabled) {
//	$("#machineHostname").prop("disabled", disabled);
	$("#definitionDnsForm").prop("disabled", disabled);
	$("#addDnsTypeSelect").prop("disabled", disabled);
	$("#definitionHostIpForm").prop("disabled", disabled);
	$("#definitionHostServerForm").prop("disabled", disabled);
}

if(selectedEntries){
	for (var i = 0; i < selectedEntries.length; i++) {
		dnlist.push(selectedEntries[i].distinguishedName);
	}
}

for (var n = 0; n < pluginTaskList.length; n++) {
	var pluginTask=pluginTaskList[n];
	if (pluginTask.page == 'network-manager') {
		pluginTask_NetworkManager=pluginTask;
	}
}

//Get network settings clicked button
$('#getNetworkSettingsBtn').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	var parameterMap = {};
	var commandId = "GET_NETWORK_INFORMATION";
	sendNetworkManagerTask(commandId, parameterMap);
});

$('#sendTaskCronNetworkManager').click(function(e){
	$('#scheduledTasksModal').modal('toggle');
	scheduledParam = null;
	scheduledModalNetworkManagerOpened = true;
});

$("#scheduledTasksModal").on('hidden.bs.modal', function(){
	if (scheduledModalNetworkManagerOpened) {
		scheduledParamNetworkManager = scheduledParam;
	}
	scheduledModalNetworkManagerOpened = false;
	defaultScheduleSelection();
});

function sendNetworkManagerTask(commandId, parameterMap) {
	if (pluginTask_NetworkManager) {
		pluginTask_NetworkManager.dnList=dnlist;
		pluginTask_NetworkManager.entryList=selectedEntries;
		pluginTask_NetworkManager.dnType="AHENK";
		pluginTask_NetworkManager.parameterMap=parameterMap;;
		pluginTask_NetworkManager.cronExpression = scheduledParamNetworkManager;
		pluginTask_NetworkManager.commandId = commandId;  		
		var params = JSON.stringify(pluginTask_NetworkManager);
	}
	var content = "Görev Gönderilecek, emin misiniz?";
	if (scheduledParamNetworkManager != null) {
		content = "Zamanlanmış görev gönderilecek, emin misiniz?";
	}
	$.confirm({
		title: 'Uyarı!',
		content: content,
		theme: 'light',
		buttons: {
			Evet: function () {
				var message = "Görev başarı ile gönderildi.. Lütfen bekleyiniz...";
				if (scheduledParamNetworkManager != null) {
					message = "Zamanlanmış görev başarı ile gönderildi. Zamanlanmış görev parametreleri:  "+ scheduledParamNetworkManager;
				}
				if (selectedEntries[0].type == "AHENK" && selectedRow.online == true && scheduledParamNetworkManager == null) {
					progress("divNetworkManager","progressNetworkManager",'show');
				}
				if (selectedEntries[0].type == "AHENK" && selectedRow.online == false) {
					$.notify("Görev başarı ile gönderildi, istemci çevrimiçi olduğunda uygulanacaktır.", "success");
				}
				if (selectedEntries[0].type == "GROUP") {
					var groupNotify = "Görev istemci grubuna başarı ile gönderildi.";
					if (scheduledParamNetworkManager != null) {
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
								$("#plugin-result-network-manager").html(message.bold());	
							}
						}   	
					},
					error: function(result) {
						$.notify(result, "error");
					}
				});
				scheduledParamNetworkManager = null;
			},
			Hayır: function () {
			}
		}
	});
}

function networkManagerListener(msg) {
	var to = msg.getAttribute('to');
	var from = msg.getAttribute('from');
	var type = msg.getAttribute('type');
	var elems = msg.getElementsByTagName('body');

	if (type == "chat" && elems.length > 0) {
		var body = elems[0];
		var data=Strophe.xmlunescape(Strophe.getText(body));
		var xmppResponse=JSON.parse(data);
		var responseMessage = xmppResponse.result.responseMessage;
		var clsId = xmppResponse.commandClsId;
		var responseDn = xmppResponse.commandExecution.dn;
		var selectedDn = selectedEntries[0]["attributes"].entryDN;
		if(xmppResponse.result.responseCode == "TASK_PROCESSED" || xmppResponse.result.responseCode == "TASK_ERROR") {
			if (clsId == "GET_NETWORK_INFORMATION" || clsId == "ADD_DNS" || clsId == "ADD_DOMAIN" || clsId == "ADD_NETWORK" || clsId == "ALLOW_PORT" || clsId == "BLOCK_PORT" || clsId == "CHANGE_HOSTNAME" || clsId == "DELETE_DOMAIN"
				|| clsId == "DELETE_HOST" || clsId == "DELETE_DNS" || clsId == "DELETE_NETWORK" || clsId == "ADD_HOST") {
				if (selectedEntries[0].type == "AHENK") {
					progress("divNetworkManager","progressNetworkManager",'hide');
					if (responseDn == selectedDn) {
						if (xmppResponse.result.responseCode == "TASK_PROCESSED") {
							setEnableOrDisableNerworkManagerForm(false);
							var arrg = JSON.parse(xmppResponse.result.responseDataStr);
							$('#networkManagerHelp').html("");
							//	$('#updateHostnameHelp').html("Bilgisayar adını değiştirmek için Bilgisayar Adını Güncelle butonuna tıklayınız.");
							$('#dnsSettingHelp').html("Silmek istediğiniz DNS kaydını seçerek DNS Sil butonuna ya da yeni bir DNS kaydı eklemek için formu doldurarak DNS Ekle butonuna tıklayınız.");
							$('#hostSettingHelp').html("Silmek istediğiniz Sunucu(Host) kaydını seçerek Sunucu Sil butonuna ya da yeni bir sunucu(host) eklemek için formu doldurarak Sunucu Ekle butonuna tıklayınız.");
							$('#deleteNetworkSettingHelp').html("Silmek istediğiniz ağ ayarını seçerek Ağ Ayarı Sil butonuna ya da yeni ağ ayarı eklemek için formu doldurarak Yeni Ağ Ayarı Ekle butonuna tıklayınız.");
							$('#portsHelp').html("İzin Vermek / Engellemek istediğiniz portu seçerek İzin Ver / Engelle butonuna tıklayınız.");

							if (clsId == "GET_NETWORK_INFORMATION") {
								networkSettingsHideBtn();
								clearNetworkData();
								$("#currentNetworkInterfaces").html(arrg.interfaces);
								$("#currentHosts").html(arrg.hosts);
//								$("#machineHostname").val(arrg.machine_hostname);
								hostManagement(arrg);
								dnsManagement(arrg);
								interfacesManagement(arrg);
								portManagement(arrg);
								getSettingSuccess = true;
								showTab();

							} else if (clsId == "ADD_DNS" || clsId == "ADD_DOMAIN") {
								if (newIsActive == true) {
									newIsActive = "Evet";
								}else {
									newIsActive = "Hayır";
								}

								var html = '<tr>';
								html += '<td>' + newDns + '</td>';
								html += '<td>' + newDnsType + '</td>';
								html += '<td>' + newIsActive + '</td>';
								html += '</tr>';

								$("#dnsSettingsBody").append(html);
								$("#definitionDnsForm").val("");
								newIsActive = true;
								newDns = null;
								newDnsType = null;

							} else if (clsId == "DELETE_DNS" || clsId == "DELETE_DOMAIN") {
								selectDnsRow.remove();
								selectDnsRow = null;

							} else if (clsId == "ADD_HOST") {
								if (newIsActive == true) {
									newIsActive = "Evet";
								}else {
									newIsActive = "Hayır";
								}

								var html = '<tr>';
								html += '<td>' + newHostIp + '</td>';
								html += '<td>' + newServerName + '</td>';
								html += '<td>' + newIsActive + '</td>';
								html += '</tr>';

								$("#hostsSettingsBody").append(html);
								$("#definitionHostServerForm").val("");
								$("#definitionHostIpForm").val("");
								newIsActive = true;
								newHostIp = null;
								newServerName = null;

							} else if (clsId == "DELETE_HOST") {
								selectHostRow.remove();
								selectHostRow = null;

							} else if (clsId == "ADD_NETWORK") {
								if (newIsActive == true) {
									newIsActive = "Evet";
								}else {
									newIsActive = "Hayır";
								}
								var html = '<tr>';
								html += '<td>' + newNetName + '</td>';
								html += '<td>' + newNetAddress + '</td>';
								html += '<td>' + newNetworkType + '</td>';
								html += '<td>' + newIsActive + '</td>';
								html += '</tr>';
								$("#networkSettingsBody").append(html);
								newNetworkType = null;
								newNetAddress = null;
								newNetName = null;
								newIsActive = true;
								$("#networkAddress").val("");
								$("#networkName").val("");
								$("#networkNetmask").val("");
								$("#networkGateway").val("");

							} else if (clsId == "DELETE_NETWORK") {
								selectNetSettingsRow.remove();
								selectNetSettingsRow = null;

							} else if (clsId == "ALLOW_PORT") {
								var rowIndex = selectPortRow.index();
								$('#portSettingsBody tr:eq('+ rowIndex +') td:eq(3)').text("Açık");
								$('#portSettingsBody tr:eq('+ rowIndex +') td:eq(4)').text("Açık");
								selectPortRow.removeClass('networksettingsselect');
								$('#portButtonGrp').hide();
								selectPortRow = null;

							} else if (clsId == "BLOCK_PORT") {
								var input = selectPortRow.closest("tr")[0].children[3];
								var output = selectPortRow.closest("tr")[0].children[4].textContent;
								var rowIndex = selectPortRow.index();
								$('#portSettingsBody tr:eq('+ rowIndex +') td:eq(3)').text("Kapalı");
								$('#portSettingsBody tr:eq('+ rowIndex +') td:eq(4)').text("Kapalı");
								selectPortRow.removeClass('networksettingsselect');
								$('#portButtonGrp').hide();
								selectPortRow = null;
							}
							$.notify(responseMessage, "success");
							$("#plugin-result-network-manager").html("");

						}else {
							$.notify(responseMessage, "error");
//							$("#plugin-result-network-manager").html(("HATA: " + responseMessage).fontcolor("red"));
						}
					} else {
						$("#plugin-result-network-manager").html("");
					}
				}
			}
		}
	}
//	we must return true to keep the handler alive. returning false would remove it after it finishes.
	return true;
}

//show button by active tab
function showTab() {
	if ($('#currentConfigurationTabTask').hasClass('active')) {
		networkSettingsHideBtn();
//		$("#updateMachineHostnameBtn").show();
	} 
	if ($('#dnsTabBtn').hasClass('active')) {
		networkSettingsHideBtn();
		$("#addDnsBtn").show();
	}
	if ($('#hostsTabBtn').hasClass('active')) {
		networkSettingsHideBtn();
		$("#addHostBtn").show();
	}
	if ($('#networkTabBtn').hasClass('active')) {
		networkSettingsHideBtn();
		$("#addNetworkSettingBtn").show();
		$('#addNetworkForm').show();
	}
	if ($('#portTabBtn').hasClass('active')) {
		networkSettingsHideBtn();
	}
}

//if network data(forms and tables) not empty clear all data function
function clearNetworkData() {
	if ($("#networkSettingsBody tr")){
		$("#networkSettingsBody tr").remove(); 
	}
	if ($("#portSettingsBody tr")){
		$("#portSettingsBody tr").remove(); 
	}
	if ($("#hostsSettingsBody tr")){
		$("#hostsSettingsBody tr").remove(); 
	}
	if ($("#dnsSettingsBody tr")){
		$("#dnsSettingsBody tr").remove(); 
	}
	$("#currentNetworkInterfaces").html("");
	$("#currentHosts").html("");
//	$("#machineHostname").val("");
}

//configured HOST file
function hostManagement(arrg) {
	var hostList = arrg.hosts.split("\n");
	for (var i = 0; i < hostList.length; i++) {
		var parserHost = hostList[i].split(/(\s+)/).filter( function(e) { return e.trim().length > 0; } );
		if (parserHost.length > 0) {
			if (parserHost[0][0].match(/[0-9]/g) || parserHost[0].match(/#[0-9]/g)) {
				var ipAddr = parserHost[0];
				var domainName = parserHost[1];
				var hostActive = "Evet"
					if (parserHost[0].match(/#[0-9]/g)) {
						ipAddr = parserHost[0].replace(/#/g, " ");
						hostActive = "Hayır";
					}

				var html = '<tr>';
				html += '<td>' + ipAddr + '</td>';
				html += '<td>' + domainName + '</td>';
				html += '<td>' + hostActive + '</td>';
				html += '</tr>';
				$("#hostsSettingsBody").append(html);
			}
		}
	}
}

//configured resolv.conf file (DNS)
function dnsManagement(arrg) {
	var dnsList = arrg.dns.split("\n");
	for (var i = 0; i < dnsList.length; i++) {
		var parserDns = dnsList[i].split(/(\s+)/).filter( function(e) { return e.trim().length > 0; } );
		if (parserDns[1] != null) {
			var dnsName = parserDns[1];
			var dnsType = parserDns[0];
			if (parserDns[0].match(/#nameserver/g) || parserDns[0].match(/#search/g)) {
				dnsType = parserDns[0].replace(/#/g, " ");
			}
			if (parserDns[0].match(/nameserver/g) || parserDns[0].match(/search/g)) {
				var dnsActive = "Evet";
				if (parserDns[0].match(/#nameserver/g) || parserDns[0].match(/#search/g)) {
					dnsActive = "Hayır";
				}

				var html = '<tr>';
				html += '<td>' + dnsName + '</td>';
				html += '<td>' + dnsType + '</td>';
				html += '<td>' + dnsActive + '</td>';
				html += '</tr>';
				$("#dnsSettingsBody").append(html);
			}
		}
	}
}

//configured interfaces file
function interfacesManagement(arrg) {
	var interfacesList = arrg.interfaces.split("\n");
	for (var i = 0; i < interfacesList.length; i++) {
		if (interfacesList[i].includes("iface")) {
			var parserInterface = interfacesList[i].split(/(\s+)/).filter( function(e) { return e.trim().length > 0; } );
			var networkName = parserInterface[1];
			var networkType = parserInterface[3].toUpperCase();
			var networkStatus = parserInterface[0];
			var networkActive = "Evet";
			if (networkStatus.match(/#/g)) {
				networkActive = "Hayır";
			}
			var networkAddress = null;
			if (networkName != "lo" && networkType == "STATIC") {
				var networkAddressLine = interfacesList[i+1];
				var parserAdress = networkAddressLine.split(/(\s+)/).filter( function(e) { return e.trim().length > 0; } );
				networkAddress = parserAdress[parserAdress.length - 1];
			}

			var html = '<tr>';
			html += '<td>' + networkName + '</td>';
			html += '<td>' + networkAddress + '</td>';
			html += '<td>' + networkType + '</td>';
			html += '<td>' + networkActive + '</td>';
			html += '</tr>';
			$("#networkSettingsBody").append(html);
		}
	}
}

//port management
function portManagement(arrg) {
	var portList = arrg.port.split("\n");
	for (var i = 0; i < portList.length; i++) {
		var parserPort = portList[i].split(/(\s+)/).filter( function(e) { return e.trim().length > 0; } );
		var serviceName = parserPort[0];
		var protocol = parserPort[1];
		var portNumber = parserPort[2];
		var inputStatus = "Açık";
		var outputStatus = "Açık";

		if (parserPort[3] == "Blocked" || parserPort[3] == "blocked") {
			inputStatus = "Kapalı";
		}
		if (parserPort[4] == "Blocked" || parserPort[4] == "blocked") {
			outputStatus = "Kapalı";
		}
		var html = '<tr>';
		html += '<td>' + serviceName + '</td>';
		html += '<td>' + protocol + '</td>';
		html += '<td>' + portNumber + '</td>';
		html += '<td>' + inputStatus + '</td>';
		html += '<td>' + outputStatus + '</td>';
		html += '</tr>';
		$("#portSettingsBody").append(html);
	}
}
//Tabs button actions
$('#currentConfTabBtn').click(function() {
	if (getSettingSuccess) {
		clearTabsSettings();
		networkSettingsHideBtn();
//		$("#updateMachineHostnameBtn").show();
	}
});

$('#dnsTabBtn').click(function() {
	if (getSettingSuccess) {
		clearTabsSettings();
		networkSettingsHideBtn();
		$("#addDnsBtn").show();
	}
});

$('#hostsTabBtn').click(function() {
	if (getSettingSuccess) {
		clearTabsSettings();
		networkSettingsHideBtn();
		$("#addHostBtn").show();
	}
});

$('#networkTabBtn').click(function() {
	if (getSettingSuccess) {
		clearTabsSettings();
		networkSettingsHideBtn();
		$('#addNetworkSettingBtn').show();
		$('#addNetworkForm').show();
	}
});

$('#portTabBtn').click(function() {
	if (getSettingSuccess) {
		networkSettingsHideBtn();
		clearTabsSettings();
	}
});

function clearTabsSettings() {
	if (selectDnsRow) {
		selectDnsRow.removeClass('networksettingsselect');	
	}
	if (selectHostRow) {
		selectHostRow.removeClass('networksettingsselect');
	}
	if (selectNetSettingsRow) {
		selectNetSettingsRow.removeClass('networksettingsselect');
	}
	if (selectPortRow) {
		selectPortRow.removeClass('networksettingsselect');
	}
	selectDnsRow = null;
	selectHostRow = null;
	selectNetSettingsRow = null;
	selectPortRow = null;
}

//Selected tables actions
$('#dnsSettingsTable').on('click', 'tbody tr', function(event) {
	if($(this).hasClass('networksettingsselect')){
		$(this).removeClass('networksettingsselect');
		$('#deleteDnsBtn').hide();
		selectDnsRow = null;
	} else {
		$(this).addClass('networksettingsselect').siblings().removeClass('networksettingsselect');
		$('#deleteDnsBtn').show();
		selectDnsRow = $(this);
	}
});

$('#hostsSettingsTable').on('click', 'tbody tr', function(event) {
	if($(this).hasClass('networksettingsselect')){
		$(this).removeClass('networksettingsselect');
		$('#deleteHostBtn').hide();
		selectHostRow = null;
	} else {
		$(this).addClass('networksettingsselect').siblings().removeClass('networksettingsselect');
		$('#deleteHostBtn').show();
		selectHostRow = $(this);
	}
});

$('#networkSettingsTable').on('click', 'tbody tr', function(event) {
	if($(this).hasClass('networksettingsselect')){
		$(this).removeClass('networksettingsselect');
		$('#deleteNetworkSettingBtn').hide();
		selectNetSettingsRow = null;
	} else {
		$(this).addClass('networksettingsselect').siblings().removeClass('networksettingsselect');
		$('#deleteNetworkSettingBtn').show();
		selectNetSettingsRow = $(this);
	}
});

$('#portSettingsTable').on('click', 'tbody tr', function(event) {
	if($(this).hasClass('networksettingsselect')){
		$(this).removeClass('networksettingsselect');
		$('#allowPortBtn').hide();
		$('#blockPortBtn').hide();
	} else {
		$(this).addClass('networksettingsselect').siblings().removeClass('networksettingsselect');
		$('#allowPortBtn').show();
		$('#blockPortBtn').show();
		selectPortRow = $(this);
	}
});

$('#addDnsTypeSelect').change(function(){
	if ($(this).val() == "nameserver") {
		$('#definitionDnsForm').attr("placeholder", "İP Adresi Tanımla (192.168.*.*)");
	} else {
		$('#definitionDnsForm').attr("placeholder", "Alan Adı Tanımla (liderahenk.org)");
	}
});

$('#networkType').change(function(){
	if ($(this).val() == "STATIC") {
		$("#networkNameGrp").show();
		$("#networkAddressGrp").show();
		$("#networkNetmaskGrp").show();
		$("#networkGatewayGrp").show();
	} else {
		$("#networkNameGrp").show();
		$("#networkAddressGrp").hide();
		$("#networkNetmaskGrp").hide();
		$("#networkGatewayGrp").hide();
	}
});

//$('#updateMachineHostnameBtn').click(function(e){
//if (selectedEntries.length == 0 ) {
//$.notify("Lütfen istemci seçiniz.", "error");
//return;
//}
//if ($("#machineHostname").val() != "") {
//var parameterMap = {
//"hostname":$("#machineHostname").val()
//};
//var commandId = "CHANGE_HOSTNAME";
//sendNetworkManagerTask(commandId, parameterMap);
//} else {
//$.notify("Bilgisayar adı boş bırakılamaz.", "warn");
//}
//});

//DNS Button actions ------------->> START
$('#addDnsBtn').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	if ($("#definitionDnsForm").val() != "") {
		newDnsType = $("#addDnsTypeSelect").val();
		if (newDnsType == "nameserver") {
			newDns = $("#definitionDnsForm").val();
			var parameterMap = {
					"ip": newDns,
					"is_active": newIsActive
			};
			var commandId = "ADD_DNS";
		} else {
			newDns = $("#definitionDnsForm").val();
			var parameterMap = {
					"domain": newDns,
			};
			var commandId = "ADD_DOMAIN";
		}
		sendNetworkManagerTask(commandId, parameterMap);
	} else {
		$.notify("İP Adresi/Alan Adı boş bırakılamaz.", "warn");
	}
});

$('#deleteDnsBtn').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	var selectDnsName = selectDnsRow.closest("tr")[0].children[0].textContent;
	var selectDnsActive = selectDnsRow.closest("tr")[0].children[2].textContent;
	var selectDnsType = selectDnsRow.closest("tr")[0].children[1].textContent;
	if (selectDnsType == "nameserver") {
		var isActive = false;
		if (selectDnsActive == "Evet") {
			isActive = true;
		}
		var parameterMap = {
				"ip": selectDnsName,
				"is_active": isActive
		}
		var commandId = "DELETE_DNS";
	} else {
		var parameterMap = {
				"domain": selectDnsName
		}
		var commandId = "DELETE_DOMAIN";
	}
	sendNetworkManagerTask(commandId, parameterMap);
	$('#deleteDnsBtn').hide();
});
//DNS Button actions --------->> STOP

//HOSTS Button actions ------------->> START
$('#addHostBtn').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	if ($("#definitionHostIpForm").val() != "" && $("#definitionHostServerForm").val() != "") {
		newHostIp = $("#definitionHostIpForm").val();
		newServerName = $("#definitionHostServerForm").val();
		var parameterMap = {
				"ip": newHostIp,
				"hostname": newServerName,
				"is_active": newIsActive
		};
		var commandId = "ADD_HOST";
		sendNetworkManagerTask(commandId, parameterMap);
	} else {
		$.notify("İP Adresi ve Sunucu Adı boş bırakılamaz.", "warn");
	}
});

$('#deleteHostBtn').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	var selectHostIp = selectHostRow.closest("tr")[0].children[0].textContent;
	var selectHostActive = selectHostRow.closest("tr")[0].children[2].textContent;
	var selectHostname = selectHostRow.closest("tr")[0].children[1].textContent;

	var isActive = false;
	if (selectHostActive == "Evet") {
		isActive = true;
	}
	var parameterMap = {
			"ip": selectHostIp,
			"hostname": selectHostname,
			"is_active": isActive
	}
	var commandId = "DELETE_HOST";
	sendNetworkManagerTask(commandId, parameterMap);
	$('#deleteHostBtn').hide();
});
//HOSTS Button actions --------->> STOP

//NETWORK SETTING Button actions ------------->> START
$('#addNetworkSettingBtn').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	var commandId = "ADD_NETWORK";
	newNetworkType = $("#networkType :selected").val();
	if (newNetworkType == "STATIC") {
		if ($("#networkName").val() != "" && $("#networkAddress").val() != "" && $("#networkNetmask").val() != "" && $("#networkGateway").val() != ""){
			newNetAddress = $("#networkAddress").val();
			newNetName = $("#networkName").val();
			newNetmask = $("#networkNetmask").val();
			newGateway = $("#networkGateway").val();

			var parameterMap = {
					"ip": newNetAddress,
					"name": newNetName,
					"is_active": newIsActive,
					"netmask": newNetmask,
					"gateway": newGateway,
					"type": newNetworkType
			};
			sendNetworkManagerTask(commandId, parameterMap);

		} else {
			$.notify("Ağ Adı, İP Adresi, Netmask ve Gateway boş bırakılamaz.", "warn");
		}
	} else {
		if ($("#networkName").val() != ""){
			newNetName = $("#networkName").val();

			var parameterMap = {
					"ip": null,
					"name": newNetName,
					"is_active": newIsActive,
					"netmask": null,
					"gateway": null,
					"type": newNetworkType
			};
			sendNetworkManagerTask(commandId, parameterMap);
		} else {
			$.notify("Ağ Adı boş bırakılamaz.", "warn");
		}
	}
});

$('#deleteNetworkSettingBtn').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	var selectNetAddress = selectNetSettingsRow.closest("tr")[0].children[1].textContent;
	var selectNetName = selectNetSettingsRow.closest("tr")[0].children[0].textContent;
	var selectNetActive = selectNetSettingsRow.closest("tr")[0].children[3].textContent;
	var selectNetType = selectNetSettingsRow.closest("tr")[0].children[2].textContent;

	var isActive = false;
	if (selectNetActive == "Evet") {
		isActive = true;
	}
	var parameterMap = {
			"ip": selectNetAddress,
			"name": selectNetName,
			"is_active": isActive,
			"type": selectNetType.toLowerCase()
	}
	var commandId = "DELETE_NETWORK";
	sendNetworkManagerTask(commandId, parameterMap);
	$('#deleteNetworkSettingBtn').hide();
});
//NETWORK SETTING Button actions --------->> STOP

//ALLOW PORT Button actions
$('#allowPortBtn').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	var port = selectPortRow.closest("tr")[0].children[2].textContent;
	var parameterMap = {
			"ports": port,
	}
	var commandId = "ALLOW_PORT";
	sendNetworkManagerTask(commandId, parameterMap);
});

//BLOCK PORT Button actions
$('#blockPortBtn').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	var port = selectPortRow.closest("tr")[0].children[2].textContent;
	var parameterMap = {
			"ports": port,
	}
	var commandId = "BLOCK_PORT";
	sendNetworkManagerTask(commandId, parameterMap);
});
