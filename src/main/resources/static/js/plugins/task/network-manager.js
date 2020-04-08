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
var newDnsIsActive = true;
var newDns = null;
var newDomainName = null;
var newDnsType = null;
var selectDnsRow = null;
var ref_network_manager = connection.addHandler(networkManagerListener, null, 'message', null, null,  null);

$('#currentConfigurationTabTask').tab('show');
$('#deleteDnsBtn').hide();
$("#updateMachineHostnameBtn").prop('disabled', true);
//$("#addDnsBtn").prop('disabled', true);

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
							$("#plugin-result-network-manager").html(message.bold());
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
		if(xmppResponse.result.responseCode == "TASK_PROCESSED" || xmppResponse.result.responseCode == "TASK_ERROR") {
			if (clsId == "GET_NETWORK_INFORMATION" || clsId == "ADD_DNS" || clsId == "ADD_DOMAIN" || clsId == "ADD_NETWORK" || clsId == "ALLOW_PORT" || clsId == "BLOCK_PORT" || clsId == "CHANGE_HOSTNAME" || clsId == "DELETE_DOMAIN"
				|| clsId == "DELETE_HOST" || clsId == "DELETE_DNS" || clsId == "DELETE_NETWORK" || clsId == "ADD_HOST") {

				if (xmppResponse.result.responseCode == "TASK_PROCESSED") {
					var arrg = JSON.parse(xmppResponse.result.responseDataStr);
					if (clsId == "GET_NETWORK_INFORMATION") {
						$("#updateMachineHostnameBtn").prop('disabled', false);
						$("#addDnsBtn").prop('disabled', false);
						clearNetworkData();
						$("#currentNetworkInterfaces").html(arrg.interfaces);
						$("#currentHosts").html(arrg.hosts);
						$("#machineHostname").val(arrg.machine_hostname);
						hostManagement(arrg);
						dnsManagement(arrg);
						interfacesManagement(arrg);
						portManagement(arrg);
						$.notify(responseMessage, "success");
						$("#plugin-result-network-manager").html("");
					} else if (clsId == "ADD_DNS" || clsId == "ADD_DOMAIN") {
						if (newDnsIsActive == true) {
							newDnsIsActive = "Evet";
						}else {
							newDnsIsActive = "Hayır";
						}

						var html = '<tr>';
						html += '<td>' + newDns + '</td>';
						html += '<td>' + newDnsType + '</td>';
						html += '<td>' + newDnsIsActive + '</td>';
						html += '</tr>';

						$("#dnsSettingsBody").append(html);
						$("#definitionDnsForm").val("");
						newDnsIsActive = true;
						newDns = null;
						newDnsType = null;
						$.notify(responseMessage, "success");
						$("#plugin-result-network-manager").html("");
					} else if (clsId == "DELETE_DNS" || clsId == "DELETE_DOMAIN") {
						selectDnsRow.remove();
						selectDnsRow = null;
						$.notify(responseMessage, "success");
						$("#plugin-result-network-manager").html("");
					}
				}else {
					$.notify(responseMessage, "error");
					$("#plugin-result-network-manager").html(("HATA: " + responseMessage).fontcolor("red"));
				}
			}
		}
	}
//	we must return true to keep the handler alive. returning false would remove it after it finishes.
	return true;
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
	$("#machineHostname").val("");
}

//configured hosts file
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
			var networkType = parserInterface[3];
			var networkStatus = parserInterface[0];
			var networkActive = "Evet";
			if (networkStatus.match(/#/g)) {
				networkActive = "Hayır";
			}
			var networkAddress = null;
			if (networkName != "lo" && networkType == "static") {
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
	} else {
		$(this).addClass('networksettingsselect').siblings().removeClass('networksettingsselect');

		var customerId = $(this).find("td:first").html();    
//		alert(customerId)
	}
});

$('#networkSettingsTable').on('click', 'tbody tr', function(event) {
	if($(this).hasClass('networksettingsselect')){
		$(this).removeClass('networksettingsselect');
	} else {
		$(this).addClass('networksettingsselect').siblings().removeClass('networksettingsselect');
		var customerId = $(this).find("td:first").html();    
//		alert(customerId)
	}
});

$('#portSettingsTable').on('click', 'tbody tr', function(event) {
	if($(this).hasClass('networksettingsselect')){
		$(this).removeClass('networksettingsselect');
	} else {
		$(this).addClass('networksettingsselect').siblings().removeClass('networksettingsselect');
		var customerId = $(this).find("td:first").html();    
//		alert(customerId)
	}
});

$('#addDnsTypeSelect').change(function(){
	if ($(this).val() == "nameserver") {
		$('#definitionDnsForm').attr("placeholder", "İP Adresi Tanımla (192.168.*.*)");
	} else {
		$('#definitionDnsForm').attr("placeholder", "Alan Adı Tanımla (liderahenk.org)");
	}
});

$('#updateMachineHostnameBtn').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	if ($("#machineHostname").val() != "") {
		var parameterMap = {
				"hostname":$("#machineHostname").val()
		};
		var commandId = "CHANGE_HOSTNAME";
		sendNetworkManagerTask(commandId, parameterMap);
	} else {
		$.notify("Bilgisayar adı boş bırakılamaz.", "warn");
	}
});

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
					"is_active": newDnsIsActive
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

