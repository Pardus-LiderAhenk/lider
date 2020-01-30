/**
* Task is end-sessions task
* this task terminates open user sessions on clients
* Tuncay ÇOLAK
* tuncay.colak@tubitak.gov.tr
* 
* http://www.liderahenk.org/
* 
*/

if (ref) {
	connection.deleteHandler(ref);
}

var ref=connection.addHandler(endSessionsListener, null, 'message', null, null,  null);
$("#entrySize").html(selectedEntries.length);		
var dnlist=[]
for (var i = 0; i < selectedEntries.length; i++) {
	dnlist.push(selectedEntries[i].distinguishedName);
}

selectedPluginTask.dnList=dnlist;
selectedPluginTask.parameterMap={};
selectedPluginTask.entryList=selectedEntries;
selectedPluginTask.dnType="AHENK";
console.log(selectedPluginTask);
var params = JSON.stringify(selectedPluginTask);

function endSessionsListener(msg) {
    var to = msg.getAttribute('to');
    var from = msg.getAttribute('from');
    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('body');
    
    if (type == "chat" && elems.length > 0) {
    	var body = elems[0];
    	var data=Strophe.xmlunescape(Strophe.getText(body));
    	var xmppResponse=JSON.parse(data);
		if(xmppResponse.commandClsId == "MANAGE"){
			if (xmppResponse.result.responseCode == "TASK_PROCESSED" || xmppResponse.result.responseCode == "TASK_ERROR") {
				if (xmppResponse.result.responseCode == "TASK_PROCESSED") {
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

$('#sendTask-'+ selectedPluginTask.page).click(function(e){
	
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
	  	  $.notify(result, "error");
	    }
	});
});

//scheduled task to be added 
$('#sendTaskCron-'+ selectedPluginTask.page).click(function(e){
	alert("Zamanlı Çalıştır")
});

$('#closePage-'+ selectedPluginTask.page).click(function(e){
	connection.deleteHandler(ref);	
});

