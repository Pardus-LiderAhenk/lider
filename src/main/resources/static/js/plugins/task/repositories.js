/**
 * Task is packages-sources and repositeries
 * This task get REPOSITORIES from agents. This task is used add and delete repository 
 * Tuncay Çolak
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

var ref=connection.addHandler(resourceUsageListener, null, 'message', null, null,  null);
$("#entrySize").html(selectedEntries.length);
var deletedItems = [];
var addedItems = [];	
var dnlist=[]

for (var i = 0; i < selectedEntries.length; i++) {
	dnlist.push(selectedEntries[i].distinguishedName);
}
selectedPluginTask.dnList=dnlist;
selectedPluginTask.parameterMap={};
selectedPluginTask.entryList=selectedEntries;
selectedPluginTask.dnType="AHENK";
var params = JSON.stringify(selectedPluginTask);
console.log(selectedPluginTask.commandId);

// get REPOSITORIES from agent when page opened. This action default parameterMap is null. CommanID is REPOSITORIES
$.ajax({
      type: "POST",
      url: "/lider/task/execute",
      headers: {
          'Content-Type':'application/json',
          'username':'${sessionScope.userName}',
          'password':'${sessionScope.userPassword}',
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

function resourceUsageListener(msg) {
	var num;
    var to = msg.getAttribute('to');
    var from = msg.getAttribute('from');
    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('body');
    
    if (type == "chat" && elems.length > 0) {
    	var body = elems[0];
    	var data=Strophe.xmlunescape(Strophe.getText(body));
    	var xmppResponse=JSON.parse(data);
//					    	console.log(xmppResponse.commandClsId)
    	var arrg = JSON.parse(xmppResponse.result.responseDataStr);
		var repo_addr = arrg["packageSource"].split("\n");
		$("#plugin-result").html(xmppResponse.result.responseMessage);
		
		var html = '<table class="table table-striped table-bordered" id="repoListTable">';
		html += '<thead>';
		html += '<tr>';
		html += '<th style="width: 5%">No</th>';
		html += '<th style="width: 90%">Depo Adresleri</th>';
		html += '<th style="width: 5%">Sil</th>';
		html += '</thead>';
		for (var i = 0; i < repo_addr.length ; i++){
			num = i+1;
			console.log("--->> "+repo_addr[i]);
			if(repo_addr[i] != ""){
				var editButtonId = "editButtonId"+i;
				var selectId = "selectId"+i;
				html += '<tr>';
				html += '<td>'+ num +'</td>';
	            html += '<td class="repoAdrr">'+ repo_addr[i] +'</td>';
	            html += '<td><button type="button" class="btn-shadow btn btn-info deleteRepo" title="Sil"><i class="fa fa-times"></i></button></td>';
	            html += '</tr>';
			}				  								
		}				
		html += '</table>';
		$('#repositoriesList').html(html);
		
    	$('.deleteRepo').click(function(e){
			var row = $(this).parents("tr");   // Find the row
			var repo = row.find(".repoAdrr").text(); // Find the repository		
    		row.remove();
    		deletedItems.push(repo); // append repo to deletedItems list
    		
		});
    	
    	$('#addRepo').click(function(e){
    		var newRow = $("<tr>");
	        var cols = "";
	        var counter = 0;
	        var asd = "list-"+counter;
	        cols += '<td>'+num+'</td>';
	        cols += '<td class="repoAdrr">' + asd +'</td>';
	        cols += '<td><button type="button" class="btn-shadow btn btn-info deleteRepo" title="Sil"><i class="fa fa-times"></i></button></td>';
	        newRow.append(cols);
	        $("#repoListTable").append(newRow);
	        addedItems.push(asd);
	        alert(addedItems);
	        counter++;
	        
		});
    	
    	
    	$('#sendTask').click(function(e){
    		if(deletedItems.length != 0 || deletedItems.length != 0){
    			// commandId is PACKAGE_SOURCES. This command id is used to add and delete repositories
	    		selectedPluginTask.commandId = "PACKAGE_SOURCES";  		
	    		selectedPluginTask.parameterMap={"deletedItems":deletedItems, "addedItems":addedItems};
	    		var params = JSON.stringify(selectedPluginTask);
	    		console.log(params);
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
    		else{
    			alert("Lütfen görev göndermek için işlem seçiniz. Ekle veya Sil işlemi yapınız.")
    		}			    		
		});
    	selectedPluginTask.commandId = "REPOSITORIES";
    }
    // we must return true to keep the handler alive. returning false would remove it after it finishes.
    return true;
}

$('#closePage').click(function(e){
	$('#pluginHtmpPageModal').modal('hide');
	connection.deleteHandler(ref);
});