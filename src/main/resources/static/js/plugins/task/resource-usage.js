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


var scheduledModalResourceUsageOpened=false;
var usageMemory = 50;
var freeMemory = 50;
var usageDisk = 50;
var freeDisk = 50;
var cpu_actual1 = 50;
var cpu_advertised1 = 50;
var systemChart1;
var systemChart2;
var systemChart3;

scheduledParamResUsage=null;
var refResUsage=connection.addHandler(resourceUsageListener, null, 'message', null, null,  null); 

var pluginTask_ResourceUsage=null

for (var n = 0; n < pluginTaskList.length; n++) {
	var pluginTask=pluginTaskList[n];
	if(pluginTask.page == 'resource-usage')
	{
		pluginTask_ResourceUsage=pluginTask;
	}
}

createCharts();

function getResourceUsage(){
	var dnlist=[]
	for (var i = 0; i < selectedEntries.length; i++) {
		dnlist.push(selectedEntries[i].distinguishedName);
	}

	if(pluginTask_ResourceUsage){
		pluginTask_ResourceUsage.commandId='RESOURCE_INFO_FETCHER'
			pluginTask_ResourceUsage.dnList=dnlist;
		pluginTask_ResourceUsage.parameterMap={};
		pluginTask_ResourceUsage.entryList=selectedEntries;
		pluginTask_ResourceUsage.dnType="AHENK";
		pluginTask_ResourceUsage.cronExpression = scheduledParamResUsage;

		var params = JSON.stringify(pluginTask_ResourceUsage);

		var message = "Görev başarı ile gönderildi.. Lütfen bekleyiniz...";
		if (scheduledParamResUsage != null) {
			message = "Zamanlanmış görev başarı ile gönderildi. Zamanlanmış görev parametreleri: "+ scheduledParamResUsage;
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
	if (scheduledParamResUsage != null) {
		content = "Zamanlanmış görev gönderilecek, emin misiniz?";
	}
	$.confirm({
		title: 'Uyarı!',
		content: content,
		theme: 'light',
		buttons: {
			Evet: function () {
				console.log(scheduledParamResUsage)
//				getResourceUsage();
				scheduledParamResUsage=null;
			},
			Hayır: function () {
			}
		}
	});
});

$('#sendTaskCron-resource-usage').click(function(e){
	$('#scheduledTasksModal').modal('toggle');
	scheduledModalResourceUsageOpened=true;
});


$("#scheduledTasksModal").on('hidden.bs.modal', function(){
	
	if(scheduledModalResourceUsageOpened){
		scheduledParamResUsage=scheduledParam;
	}
	scheduledModalResourceUsageOpened=false;
	defaultScheduleSelection();
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

					usageMemory = (arrg["Usage"]/arrg["Total Memory"]*100).toFixed(2);
					freeMemory = (100 - usageMemory).toFixed(2);
					usageDisk = (arrg["Usage Disc"]/arrg["Total Disc"]*100).toFixed(2);
					freeDisk = (100 - usageDisk).toFixed(2);
//					cpu_actual = arrg["CPU Actual Hz"];
//					cpu_advertised = arrg["CPU Advertised Hz"];
					systemChart1.destroy();
					systemChart2.destroy();
//					systemChart3.destroy();

					createCharts();

				} else {
					$("#plugin-result-resource-usage").html(("HATA: "+ xmppResponse.result.responseMessage).fontcolor("red"));
					$.notify(xmppResponse.result.responseMessage, "error");
				}
			}
		}						 
	}
	// we must return true to keep the handler alive. returning false would remove it after it finishes.
	return true;
}

function createCharts() {
	var memoryChart = document.getElementById("memoryInfoChart").getContext('2d');
	systemChart1 = new Chart(memoryChart, {
		type: 'doughnut',
		data: {
			labels: ["Kullanılan", "Boş"],
			datasets: [{
				data: [usageMemory, freeMemory],
				backgroundColor: ["#F7464A", "#46BFBD", "#FDB45C", "#949FB1", "#4D5360"],
				hoverBackgroundColor: ["#FF5A5E", "#5AD3D1", "#FFC870", "#A8B3C5", "#616774"]
			}]
		},
		options: {
			responsive: true,
			legend: {
				display: false
			},
			title: {
				display: true,
				text: 'Bellek Kullanımı (%)'
			}
		}
	});

	var diskChart = document.getElementById("diskInfoChart").getContext('2d');
	systemChart2 = new Chart(diskChart, {
		type: 'doughnut',
		data: {
			labels: ["Kullanılan", "Boş"],
			datasets: [{
				data: [usageDisk, freeDisk],
				backgroundColor: ["#F7464A", "#46BFBD", "#FDB45C", "#949FB1", "#4D5360"],
				hoverBackgroundColor: ["#FF5A5E", "#5AD3D1", "#FFC870", "#A8B3C5", "#616774"]
			}]
		},
		options: {
			responsive: true,
			legend: {
				display: false
			},
			title: {
				display: true,
				text: 'Disk Kullanımı (%)'
			}
		}
	});

//	var processorChart = document.getElementById("processorInfoChart").getContext('2d');
//	systemChart3 = new Chart(processorChart, {
//	type: 'doughnut',
//	data: {
//	labels: ["Gerçek Frekans(GHz)", "Beklenen Frekans(GHz)"],
//	datasets: [{
//	data: [cpu_actual1, cpu_advertised1],
//	backgroundColor: ["#F7464A", "#46BFBD", "#FDB45C", "#949FB1", "#4D5360"],
//	hoverBackgroundColor: ["#FF5A5E", "#5AD3D1", "#FFC870", "#A8B3C5", "#616774"]
//	}]
//	},
//	options: {
//	responsive: true,
//	legend: {
//	display: false
//	}
//	}
//	});

}

