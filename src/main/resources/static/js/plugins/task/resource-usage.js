/**
 * resource-usage
 *  This page get info resource usage from agents
 *  Tuncay ÇOLAK
 *  tuncay.colak@tubitak.gov.tr

 *  http://www.liderahenk.org/ 
 */

if (ref) {
	connection.deleteHandler(ref);
}

var ref=connection.addHandler(resourceUsageListener, null, 'message', null, null,  null); 
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
getResourceUsage();

function getResourceUsage(){
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
				$("#plugin-result").html("Görev başarı ile gönderildi.. Lütfen bekleyiniz...");
			}   	
			/* $('#closePage').click(); */
		},
		error: function(result) {
			$.notify(result, "error");
		}
	});
}

$('#sendTask-'+ selectedPluginTask.page).click(function(e){
	getResourceUsage();
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
					$("#plugin-result").html("");
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

$('#sendTaskCron-'+ selectedPluginTask.page).click(function(e){
	alert("Zamanlı Çalıştır")
});

$('#closePage-'+ selectedPluginTask.page).click(function(e){
	connection.deleteHandler(ref);	
});