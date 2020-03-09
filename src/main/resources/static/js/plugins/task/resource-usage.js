/**
 * resource-usage
 *  This page get info resource usage from agents
 *  Tuncay ÇOLAK
 *  tuncay.colak@tubitak.gov.tr

 *  http://www.liderahenk.org/ 
 */

if (refResUsage) {
	connection.deleteHandler(refResUsage);
}
scheduledParam=null;
var refResUsage=connection.addHandler(resourceUsageListener, null, 'message', null, null,  null); 

var pluginTask_ResourceUsage=null



for (var n = 0; n < pluginTaskList.length; n++) {
		var pluginTask=pluginTaskList[n];
		if(pluginTask.page == 'resource-usage')
		{
			pluginTask_ResourceUsage=pluginTask;
		}
}


function getResourceUsage(){
	var dnlist=[]
	for (var i = 0; i < selectedEntries.length; i++) {
		dnlist.push(selectedEntries[i].distinguishedName);
		alert(selectedEntries[i].distinguishedName)
	}
	
	if(pluginTask_ResourceUsage){
		
		pluginTask_ResourceUsage.commandId='RESOURCE_INFO_FETCHER'
		pluginTask_ResourceUsage.dnList=dnlist;
		pluginTask_ResourceUsage.parameterMap={};
		pluginTask_ResourceUsage.entryList=selectedEntries;
		pluginTask_ResourceUsage.dnType="AHENK";
		pluginTask_ResourceUsage.cronExpression = scheduledParam;
		
		var params = JSON.stringify(pluginTask_ResourceUsage);
		
		var message = "Görev başarı ile gönderildi.. Lütfen bekleyiniz...";
		if (scheduledParam != null) {
				message = "Zamanlanmış görev başarı ile gönderildi. Zamanlanmış görev parametreleri: "+ scheduledParam;
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
						$("#plugin-result-resource-usage").html(message.bold());
					}   	
					/* $('#closePage').click(); */
				},
				error: function(result) {
					$.notify(result, "error");
				}
			});
	}
}

$('#sendTask-resource-usage').click(function(e){
	if(selectedEntries.length ==0 ){
		$.notify("Lütfen İstemci Seçiniz", "error");
		return;
	}
	
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
				getResourceUsage();
				scheduledParam=null;
			},
			Hayır: function () {
			}
		}
	});
});

function resourceUsageListener(msg) {
	var to = msg.getAttribute('to');
	var from = msg.getAttribute('from');
	var type = msg.getAttribute('type');
	var elems = msg.getElementsByTagName('body');
	
	if (type == "chat" && elems.length > 0) {
		var body = elems[0];
		var data=Strophe.xmlunescape(Strophe.getText(body));
		var xmppResponse=JSON.parse(data);
		if(xmppResponse.commandClsId == "RESOURCE_INFO_FETCHER"){
			if (xmppResponse.result.responseCode == "TASK_PROCESSED" || xmppResponse.result.responseCode == "TASK_ERROR") {
				if (xmppResponse.result.responseCode == "TASK_PROCESSED") {
					var arrg = JSON.parse(xmppResponse.result.responseDataStr);
					var phase = "";
					if(arrg["Phase"]){
						phase = arrg["Phase"]
					}
					else {
						phase = "Faz Bilgisi Alınamadı"
					}
					$("#system").html(arrg["System"]);
					$("#release").html(arrg["Release"]);
					$("#version").html(arrg["Version"]);
					$("#machine").html(arrg["Machine"]);
					$("#processor").html(arrg["Processor"]);
					$("#phase").html(phase);
					$("#physical_core_count").html(arrg["CPU Physical Core Count"]);
					$("#logical_core_count").html(arrg["CPU Logical Core Count"]);
					$("#cpu_advertised").html(arrg["CPU Advertised Hz"]);
					$("#cpu_actual").html(arrg["CPU Actual Hz"]);
					$("#total_memory").html(arrg["Total Memory"]+" MB");
					$("#usage_memory").html(arrg["Usage"]+" MB");
					$("#device").html(arrg["Device"]);
					$("#total_disk").html(arrg["Total Disc"]+" MB");
					$("#usage_disk").html(arrg["Usage Disc"]+" MB");
					$("#plugin-result-resource-usage").html("");
					$.notify(xmppResponse.result.responseMessage, "success");

				} else {
					$("#plugin-result").html(("HATA: "+ xmppResponse.result.responseMessage).fontcolor("red"));
					$.notify(xmppResponse.result.responseMessage, "error");
				}
			}
		}						 
	}
	// we must return true to keep the handler alive. returning false would remove it after it finishes.
	return true;
}

//$('#closePage-'+ selectedPluginTask.page).click(function(e){
//	connection.deleteHandler(ref);
//	scheduledParam=null;
//});