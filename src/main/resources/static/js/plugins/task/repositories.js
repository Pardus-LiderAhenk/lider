/**
 * Task is packages-sources and repositeries
 * This task get REPOSITORIES from agents. This task is used add and delete repository 
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

if (ref) {
	connection.deleteHandler(ref);
}

var ref=connection.addHandler(repositoryListener, null, 'message', null, null,  null);
$("#entrySize").html(selectedEntries.length);
var deletedItems = [];
var addedItems = [];
var dnlist = []
var table;

for (var i = 0; i < selectedEntries.length; i++) {
	dnlist.push(selectedEntries[i].distinguishedName);
}
selectedPluginTask.dnList=dnlist;
selectedPluginTask.parameterMap={};
selectedPluginTask.entryList=selectedEntries;
selectedPluginTask.dnType="AHENK";

//get REPOSITORIES from agent when page opened. This action default parameterMap is null. CommanID is REPOSITORIES
getRepositories()

function getRepositories() {
	selectedPluginTask.commandId = "REPOSITORIES";
	selectedPluginTask.parameterMap={};
	var params = JSON.stringify(selectedPluginTask);
	sendRepositoryTask(params);
}

function sendRepositoryTask(params){

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
			console.log("rest response")
			console.log(res)
			if(res.status=="OK"){		    		
				$("#plugin-result").html("Görev başarı ile gönderildi.. Lütfen bekleyiniz...");
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
					table.clear().draw();
					table.destroy();
				}
				for (var i = 0; i < repo_addr.length ; i++){
					var newRow = $("<tr>");
					if(repo_addr[i] != ""){
						var html = '<td><span class="cb-package-name">'
							+ '<input type="checkbox" name="repo-addr" value="' +  repo_addr[i] +'">'
							+ '<label for="checkbox1"></label>'
							+ '</span>'
							+ '</td>'
							html += '<td class="repoAdrr">'+ repo_addr[i] +'</td>';
						newRow.append(html);
						$("#repositoriesListTable").append(newRow);
					}				  								
				}
				createTable();
				$("#plugin-result").html("");
				$.notify(responseMessage, "success");
				$('#repository-info').html('<small style="color:red;">Silmek istediğiniz repo/ları seçerek Sil butonunda tıklayınız. Depo eklemek için Depo Adresi tanımlayarak Ekle butonuna tıklayınız. Çalıştır ya da Zamanlı Çalıştır butonuna tıklayarak Sil ve/veya Ekle görevini gönderiniz.</small>');

			}else {
				createTable();
				$("#plugin-result").html(("HATA:" + responseMessage).fontcolor("red"));
				$.notify(responseMessage, "error");
			}
		}
		// we must return true to keep the handler alive. returning false would remove it after it finishes.
		return true;
	}
}

function createTable() {

	table = $('#repositoriesListTable').DataTable( {
		"scrollY": "600px",
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

$('#deleteRepo').click(function(e){
	$('input:checkbox[name=repo-addr]').each(function() {
		var selectRepoAddr = $(this).val();
		if($(this).is(':checked')) {
			if(deletedItems.includes(selectRepoAddr) != true ){
				deletedItems.push(selectRepoAddr);
			}
		}
		else {
			if(deletedItems.includes(selectRepoAddr)){
				for(var i in deletedItems){
					if(deletedItems[i] == selectRepoAddr){
						deletedItems.splice(i,1);
						break;
					}
				}
			}
		}
	});
	if($('input:checkbox[name=repo-addr]').is(':checked')) {
		$('input:checkbox[name=repo-addr]:checked').closest("tr").remove();
	}
	else {
		$.notify("Lütfen silmek için depo adresi seçiniz.", "warn")
	}
});

function addRepoAddr(repoAddr){
	var newRow = $("<tr>");
	var cols = "";
	cols += '<td><span class="cb-package-name">'
		+ '<input type="checkbox" name="repo-addr" value="' +  repoAddr +'">'
		+ '<label for="checkbox1"></label>'
		+ '</span>'
		+ '</td>'
		cols += '<td class="repoAdrr">' + repoAddr +'</td>';
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

$('#sendTask-'+ selectedPluginTask.page).click(function(e){
	if(addedItems.length != 0 || deletedItems.length != 0){
		// commandId is PACKAGE_SOURCES. This command id is used to add and delete repositories
		selectedPluginTask.commandId = "PACKAGE_SOURCES";  		
		selectedPluginTask.parameterMap={"deletedItems":deletedItems, "addedItems":addedItems};
		var params = JSON.stringify(selectedPluginTask);
		sendRepositoryTask(params);
		deletedItems = [];
		addedItems = [];
	}
	else{
		$.notify("Lütfen Ekle veya Sil işleminden sonra Çalıştır butonuna tıklayınız.","warn");
	}
});

$('#sendTaskCron-'+ selectedPluginTask.page).click(function(e){
	if (addedItems.length != 0 || deletedItems.length != 0) {
		alert("Zamanlı Çalıştır");
	} 
	else {
		$.notify("Lütfen Ekle veya Sil işleminden sonra Zamanlı Çalıştır butonuna tıklayınız.","warn");
	}
});

$('#closePage-'+ selectedPluginTask.page).click(function(e){
	connection.deleteHandler(ref);	
});