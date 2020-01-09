/**
 * Task is packages-sources and repositeries
 * This task get REPOSITORIES from agents. This task is used add and delete repository 
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

var ref=connection.addHandler(getPackagesListener, null, 'message', null, null,  null);
$("#entrySize").html(selectedEntries.length);
var deletedItems = [];
var addedItems = [];
var dnlist = []

for (var i = 0; i < selectedEntries.length; i++) {
	dnlist.push(selectedEntries[i].distinguishedName);
}
selectedPluginTask.dnList=dnlist;
selectedPluginTask.parameterMap={};
selectedPluginTask.entryList=selectedEntries;
selectedPluginTask.dnType="AHENK";
selectedPluginTask.commandId = "INSTALLED_PACKAGES";
var params = JSON.stringify(selectedPluginTask);

// get REPOSITORIES from agent when page opened. This action default parameterMap is null. CommanID is REPOSITORIES

sendRepositoryTask(params);
console.log(params);

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
	        /* $('#closePage').click(); */
	      },
	      error: function(result) {
	        alert(result);
	      }
	    });
}

function getPackagesListener(msg) {
	var num;
    var to = msg.getAttribute('to');
    var from = msg.getAttribute('from');
    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('body');
    
    if (type == "chat" && elems.length > 0) {
    	var body = elems[0];
    	var data=Strophe.xmlunescape(Strophe.getText(body));
    	var xmppResponse=JSON.parse(data);
    	var arrg = JSON.parse(xmppResponse.result.responseDataStr);
		if(xmppResponse.commandClsId =='INSTALLED_PACKAGES'){
			var params = {
				    "id" : xmppResponse.result.id
			};
			alert(xmppResponse.result.id)
				$.ajax({
					 	type: 'POST', 
					    url: "/command/commandexecutionresult",
					    dataType: 'json',
					    data: params,
					    success: function(data) {
					    	if(data != null) {
						    	if(data.responseDataStr != null) {
						    		console.log(data.responseDataStr);
						    	}
						    }
					       
					    },
				       error: function(result) {
				        alert(result);
				      }
				    });
		}
    }
    // we must return true to keep the handler alive. returning false would remove it after it finishes.
    return true;
}

$('#sendTask-'+ selectedPluginTask.page).click(function(e){
	if(addedItems.length != 0 || deletedItems.length != 0){
		// commandId is PACKAGE_SOURCES. This command id is used to add and delete repositories
		selectedPluginTask.commandId = "PACKAGE_SOURCES";
		selectedPluginTask.parameterMap={"deletedItems":deletedItems, "addedItems":addedItems};
		var params = JSON.stringify(selectedPluginTask);
//		console.log(params);
		sendRepositoryTask(params);
		
		deletedItems = [];
		addedItems = [];
	}
	else{
		$.notify("Lütfen görev göndermek için işlem seçiniz. Ekle veya Sil işlemi yapınız.","warn");
	}
	selectedPluginTask.commandId = "REPOSITORIES";
});


function repositoryChecked() {
	$('input:checkbox[name=repo-addr]').each(function() {
		var selectRepoAddr = $(this).val();
	    if($(this).is(':checked')) {
	    	if(deletedItems.includes(selectRepoAddr) != true ){
	    		deletedItems.push(selectRepoAddr);
//	    		console.log(deletedItems);
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
}

$('#deleteRepo').click(function(e){
	if($('input:checkbox[name=repo-addr]').is(':checked')) {
		$('input:checkbox[name=repo-addr]:checked').closest("tr").remove();
//		console.log(deletedItems);
	}
	else {
		$.notify("Lütfen silmek için depo adresi seçiniz.", "warn")
	}
});


$('#sendTaskCron-'+ selectedPluginTask.page).click(function(e){
	alert("Zamanlı Çalıştır")
});

$('#closePagePlugin').click(function(e){
	connection.deleteHandler(ref);
});