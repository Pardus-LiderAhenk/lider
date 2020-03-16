/**
 * packages-sources and repositories
 * This task get REPOSITORIES from agents. This task is used add and delete repository 
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

if (ref_repositories) {
	connection.deleteHandler(ref_repositories);
}
var scheduledParamRepositories = null;
var scheduledModalRepositoriesOpened = false;
var deletedItems = [];
var addedItems = [];
var dnlist = [];
var tableRepositories;
var pluginTask_Repositories = null;
var ref_repositories=connection.addHandler(repositoryListener, null, 'message', null, null,  null);

for (var i = 0; i < selectedEntries.length; i++) {
	dnlist.push(selectedEntries[i].distinguishedName);
}

for (var n = 0; n < pluginTaskList.length; n++) {
	var pluginTask=pluginTaskList[n];
	if (pluginTask.page == 'repositories') {
		pluginTask_Repositories=pluginTask;
	}
}
pluginTask_Repositories.dnList=dnlist;
pluginTask_Repositories.entryList=selectedEntries;
pluginTask_Repositories.dnType="AHENK";

//get REPOSITORIES from agent when page opened. This action default parameterMap is null. CommanID is REPOSITORIES

$('#sendTaskGetRepositories').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}

	if(pluginTask_Repositories){
		pluginTask_Repositories.commandId = "REPOSITORIES";
		pluginTask_Repositories.parameterMap={};
		pluginTask_Repositories.cronExpression = scheduledParamRepositories;
		var params = JSON.stringify(pluginTask_Repositories);

		var content = "Görev Gönderilecek, emin misiniz?";
		if (scheduledParamRepositories != null) {
			content = "Zamanlanmış görev gönderilecek, emin misiniz?";
		}
		$.confirm({
			title: 'Uyarı!',
			content: content,
			theme: 'light',
			buttons: {
				Evet: function () {

					if (tableRepositories) {
						tableRepositories.clear().draw();
						tableRepositories.destroy();
					}
					sendRepositoryTask(params);
					deletedItems = [];
					addedItems = [];
					scheduledParamRepositories = null;
				},
				Hayır: function () {
				}
			}
		});

	}
});

function sendRepositoryTask(params){
	var message = "Görev başarı ile gönderildi.. Lütfen bekleyiniz...";
	if (scheduledParamRepositories != null) {
		message = "Zamanlanmış görev başarı ile gönderildi. Zamanlanmış görev parametreleri:  "+ scheduledParamRepositories;
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
				$("#plugin-result-repositories").html(message.bold());
			}   	
		},
		error: function(result) {
			$.notify(result, "error");
		}
	});
}

function repositoryListener(msg) {
	var to = msg.getAttribute('to');
	var from = msg.getAttribute('from');
	var type = msg.getAttribute('type');
	var elems = msg.getElementsByTagName('body');

	if (type == "chat" && elems.length > 0) {
		var body = elems[0];
		var data=Strophe.xmlunescape(Strophe.getText(body));
		var xmppResponse=JSON.parse(data);
		var responseMessage = xmppResponse.result.responseMessage;
		if (xmppResponse.commandClsId == "REPOSITORIES" || xmppResponse.commandClsId == "PACKAGE_SOURCES") {
			if(xmppResponse.result.responseCode == "TASK_PROCESSED") {

				var arrg = JSON.parse(xmppResponse.result.responseDataStr);
				var repo_addr = arrg["packageSource"].split("\n");

				if (xmppResponse.commandClsId == "PACKAGE_SOURCES") {
					tableRepositories.clear().draw();
					tableRepositories.destroy();
				}
				for (var i = 0; i < repo_addr.length ; i++){
					var newRow = $("<tr>");
					if(repo_addr[i] != ""){
						var html = '<td class="repoAdrr">'+ repo_addr[i] +'</td>';
						html += '<td class="text-center"><button id="' + repo_addr[i] +'" type="button" onclick="repoChecked(this)" title="Kaldır" value="' + repo_addr[i] +'" class="btn-shadow btn btn-info"><i class="fa fa-trash-alt"></i></button></td>';
						newRow.append(html);
						$("#repositoriesListTable").append(newRow);
					}				  								
				}
				createRepositorieTable();
				$("#plugin-result-repositories").html("");
				$.notify(responseMessage, "success");
				$('#repository-info').html('<small>Depo eklemek için Depo Adresi tanımlayarak Ekle butonuna tıklayınız. Silmek istediğiniz depo adresini Sil butonuna tıklayarak listeden silebilirsiniz. Çalıştır butonuna tıklayarak Sil ve/veya Ekle görevini gönderiniz.</small>');

			}else {
				createRepositorieTable();
				$("#plugin-result-repositories").html(("HATA:" + responseMessage).fontcolor("red"));
				$.notify(responseMessage, "error");
			}
		}
		// we must return true to keep the handler alive. returning false would remove it after it finishes.
		return true;
	}
}

function createRepositorieTable() {

	tableRepositories = $('#repositoriesListTable').DataTable( {
		"scrollY": "500px",
		"paging": false,
		"searching": false,
		"scrollCollapse": true,
//		"info": false,
		"oLanguage": {
			"sLengthMenu": 'Görüntüle <select>'+
			'<option value="20">20</option>'+
			'<option value="30">30</option>'+
			'<option value="40">40</option>'+
			'<option value="50">50</option>'+
			'<option value="-1">Tümü</option>'+
			'</select> kayıtları',
			"sSearch": "Depo Ara:",
			"sInfo": "Toplam depo sayısı: _TOTAL_",
			"sInfoEmpty": "Gösterilen depo sayısı: 0",
			"sZeroRecords" : "Depo bulunamadı",
			"sInfoFiltered": " - _MAX_ depo arasından",
		},
	} );
}

function repoChecked(select) {
	var selectRepoAddr = select.value;
	deletedItems.push(selectRepoAddr);
	$(select).closest("tr").remove();
}

function addRepoAddr(repoAddr){
	var newRow = $("<tr>");
	var cols = "";
	cols += '<td class="repoAdrr">' + repoAddr +'</td>';
	cols += '<td class="text-center"><button id="' + repoAddr +'" type="button" onclick="removeRepoAddedItems(this)" title="Kaldır" value="' + repoAddr +'" class="btn-shadow btn btn-info"><i class="fa fa-trash-alt"></i></button></td>';
	newRow.append(cols);
	$("#repositoriesListTable").append(newRow);
	addedItems.push(repoAddr);
	$("#inputRepoAddrId").val("");
}

$('#addRepoButtonId').click(function(e){
	var repoAddr = $("#inputRepoAddrId").val();
	if (repoAddr != "") {
		addRepoAddr(repoAddr);
	} else {
		$.notify("Lütfen eklemek istediğiniz depo adresini tanımlayınız.", "warn")
	}
});

function removeRepoAddedItems(select) {
	var selRepoAddr = select.value;
	$(select).closest("tr").remove();
	if(addedItems.includes(selRepoAddr)){
		for(var i in addedItems){
			if(addedItems[i] == selRepoAddr){
				addedItems.splice(i,1);
				break;
			}
		}
	}
}

$('#sendTaskCronRepositories').click(function(e){
	$('#scheduledTasksModal').modal('toggle');
	scheduledParam = null;
	scheduledModalRepositoriesOpened = true;
});

$("#scheduledTasksModal").on('hidden.bs.modal', function(){
	if (scheduledModalRepositoriesOpened) {
		scheduledParamRepositories = scheduledParam;
	}
	scheduledModalRepositoriesOpened = false;
	defaultScheduleSelection();
});

$('#sendTaskRepositories').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	if(pluginTask_Repositories){
		if(addedItems.length != 0 || deletedItems.length != 0){
			// commandId is PACKAGE_SOURCES. This command id is used to add and delete repositories
			pluginTask_Repositories.commandId = "PACKAGE_SOURCES";  		
			pluginTask_Repositories.parameterMap={"deletedItems":deletedItems, "addedItems":addedItems};
			pluginTask_Repositories.cronExpression = scheduledParamRepositories;
			var params = JSON.stringify(pluginTask_Repositories);

			var content = "Görev Gönderilecek, emin misiniz?";
			if (scheduledParamRepositories != null) {
				content = "Zamanlanmış görev gönderilecek, emin misiniz?";
			}
			$.confirm({
				title: 'Uyarı!',
				content: content,
				theme: 'light',
				buttons: {
					Evet: function () {
						sendRepositoryTask(params);
						deletedItems = [];
						addedItems = [];
						scheduledParamRepositories = null;
					},
					Hayır: function () {
					}
				}
			});
		}
		else{
			$.notify("Lütfen Ekle ve/veya Sil işleminden sonra Çalıştır butonuna tıklayınız.","warn");
		}
	}

});
