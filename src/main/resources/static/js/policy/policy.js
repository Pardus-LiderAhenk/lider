/**
 * When page loaing getting compters from LDAP and ldap computers tree fill out on the treegrid that used jqxTreeGrid api..
 * also plugin task tables load on start.
 * 
 * M. Edip YILDIZ
 * 
 */

// generic variables
var selectedEntries = []; 
var selectedAgentGroupDN = "";
var selectedOUDN = "";
var pluginTaskList=null;

// when page loading getting system page info package and service management page hide
setSystemPluginPage();
$("#systemPagePolicy").show();
$("#scriptManagementPage").hide();
$("#securityAndNetworkManagementPage").hide();

$('#btn-system-policy').click(function() {
	setSystemPluginPage();
});

$('#btn-script-policy').click(function() {
	setScriptPluginPage();
});

$('#btn-securityAndNetwork').click(function() {
	setSecurityAndNetworkPluginPage();
});

function setSystemPluginPage() {

	$("#systemPagePolicy").show();
	$("#scriptManagementPage").hide();
	$("#securityAndNetworkManagementPage").hide();
	$.ajax({
		type : 'POST',
		url : 'getPluginProfileList',
		dataType : 'json',
		success : function(data) {
			pluginTaskList = data;

			for (var i = 0; i < pluginTaskList.length; i++) {
				var pluginTask = pluginTaskList[i];
				if(pluginTask.page == 'conky-policy'){
					$.ajax({
						type : 'POST',
						url : 'getPluginProfileHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res1) {
							$('#conky-policy').html(res1);
						}
					});
				}
			}
		}
	});
}



function setScriptPluginPage() {
	$("#systemPagePolicy").hide();
	$("#scriptManagementPage").show();
	$("#securityAndNetworkManagementPage").hide();
	
	for (var i = 0; i < pluginTaskList.length; i++) {
		var pluginTask = pluginTaskList[i];
		if(pluginTask.page == 'execute-script-policy'){
			$.ajax({
				type : 'POST',
				url : 'getPluginProfileHtmlPage',
				data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
				dataType : 'text',
				success : function(res2) {
					$('#execute-script-policy').html(res2);
				}
			});
		}
	}
	
}

function setSecurityAndNetworkPluginPage() {
	$("#systemPagePolicy").hide();
	$("#scriptManagementPage").hide();
	$("#securityAndNetworkManagementPage").show();
	
	for (var i = 0; i < pluginTaskList.length; i++) {
		var pluginTask = pluginTaskList[i];
		if(pluginTask.page == 'network-manager'){
			$.ajax({
				type : 'POST',
				url : 'getPluginProfileHtmlPage',
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
				url : 'getPluginProfileHtmlPage',
				data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
				dataType : 'text',
				success : function(res2) {
					$('#usb-management').html(res2);
				}
			});
		}
	}
}


