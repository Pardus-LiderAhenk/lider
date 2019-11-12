$(document).ready(function() {
		connection = new Strophe.Connection(BOSH_SERVICE);
		connection.connect(username, password, onConnect);
		
		$('#rosterListModal').on('show.bs.modal',function(event) {
			showRosterList();
		});
		
		$('#onlineEntryListModal').on('show.bs.modal',	function(event) {
			showOnlineEntryList();
		});
		
		$('#logout').on('click', function() {
				
			 connection.disconnect();
		});
});


function showRosterList(){
	
	var html = '<table class="table table-striped table-bordered " id="rosterListTable">';
    for (var i = 0; i < rosterList.length ; i++) {
    	var roster=rosterList[i];
        	html += '<tr>';
            html += '<td>' + roster.item_name + '</td>';
         /*    html += '<td>' + roster.id + '</td>';
            html += '<td>' + roster.jid + '</td>'; */
            html += '</tr>';
    }
    html += '</table>';
    $('#rosterListHolder').html(html);
}

function showOnlineEntryList(){
	
	var html = '<table class="table table-striped table-bordered " id="onlineEntryListTable">';
	
	html += '<thead>';
	
	html += '<tr>';
	html += '<th>JID</th>';
	html += '<th>Kaynak</th>';
	html += '</tr>';
	html += '</thead>';
    
    for (var i = 0; i < onlineEntryList.length ; i++) {
    	
    	var entry=onlineEntryList[i];
    	
        	html += '<tr>';
            html += '<td>' + entry.jid + '</td>';
            html += '<td>' + entry.source + '</td>';
         /*    html += '<td>' + roster.id + '</td>';
            html += '<td>' + roster.jid + '</td>'; */
            
       		 
            html += '</tr>';
    }
    html += '</table>';
    
    $('#onlineEntryListHolder').html(html);
}

function onConnect(status)
{
   if (status == Strophe.Status.CONNECTING) {
 	/* log('Strophe is connecting.'); */
     } 
   else if (status == Strophe.Status.CONNFAIL) {
 	log('Sunucuya bağlanırken hata oluştu.');
 	$('#connect').get(0).value = 'connect';
     } 
   else if (status == Strophe.Status.DISCONNECTING) {
 	log('Sunucu bağlantısı koparılmaktadır.');
     } 
   else if (status == Strophe.Status.DISCONNECTED) {
 	log('Sunucu bağlantısı koparıldı.');
 	$('#connect').get(0).value = 'connect';
     } 
   else if (status == Strophe.Status.CONNECTED) {
 	log('Sunucu ile bağlantı kuruldu.');
 	log('Mesaj göndermek için kullanıcı adım: ' + connection.jid );

 	connection.addHandler(onMessage, null, 'message', null, null,  null); 
 	
	var iq = $iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'});
    
	connection.sendIQ(iq, onRoster);
	
	Gab.connection.addHandler(onRosterChanged, "jabber:iq:roster", "iq", "set");

	//connection.send($pres().tree());
	
   }
}

function onRoster(iq)
{
	$(iq).find('item').each(function () {
        var jid = $(this).attr('jid');
        var name = $(this).attr('name') || jid;

        // transform jid into an id
        var jid_id = jid_to_id(jid);
        
        
       rosterList.push({id :jid_id, item_name: name, jid: jid });
        
        

        /* var contact = $("<li id='" + jid_id + "'>" +
                        "<div class='roster-contact offline'>" +
                        "<div class='roster-name'>" +
                        name +
                        "</div><div class='roster-jid'>" +
                        jid +
                        "</div></div></li>"); */

        //insert_contact(contact);
                        
                      
        
    });
	
	$('#rosterListSize').html(rosterList.length);

    // set up presence handler and send initial presence
    connection.addHandler(onPresence, null, "presence");
    connection.send($pres().tree());
}

function onRosterChanged(iq) {
    $(iq).find('item').each(function () {
        var sub = $(this).attr('subscription');
        var jid = $(this).attr('jid');
        var name = $(this).attr('name') || jid;
        var jid_id =jid_to_id(jid);
        $.notify("subscription  :" +sub +" jid : "+ jid+ " name : "+ name,"warn");

      /*   if (sub === 'remove') {
            // contact is being removed
            $('#' + jid_id).remove();
        } else {
            // contact is being added or modified
            var contact_html = "<li id='" + jid_id + "'>" +
                "<div class='" + 
                ($('#' + jid_id).attr('class') || "roster-contact offline") +
                "'>" +
                "<div class='roster-name'>" +
                name +
                "</div><div class='roster-jid'>" +
                jid +
                "</div></div></li>";

            if ($('#' + jid_id).length > 0) {
                $('#' + jid_id).replaceWith(contact_html);
            } else {
                Gab.insert_contact(contact_html);
            }
        } */
    });

    return true;
}

function onPresence(presence)
{
	 	var ptype = $(presence).attr('type');
        var from = $(presence).attr('from');
        var jid_id = jid_to_id(from);
        var name = jid_to_name(from);
        var source = jid_to_source(from);
        
       if (ptype === 'subscribe') {
            // populate pending_subscriber, the approve-jid span, and
            // open the dialog
            /* Gab.pending_subscriber = from;
            $('#approve-jid').text(Strophe.getBareJidFromJid(from));
            $('#approve_dialog').dialog('open'); */
            
    	   $.notify("subscribe","warn");
            
        } else if (ptype !== 'error') {
           
            if (ptype === 'unavailable') {
               
            	$.notify(name+" offline..",{className: 'error',position:"right bottom"}  );
            	
            	for (var i =0; i < onlineEntryList.length; i++){
            		   if (onlineEntryList[i].from === from && onlineEntryList[i].source ===source) {
            			   onlineEntryList.splice(i,1);
            		      break;
            		   }
            	}
               	 
               	// onlineEntryList.splice($.inArray(from, onlineEntryList), 1);
				  $('#onlineEntryListSize').html(onlineEntryList.length);
				  
				  loadChildEntries();
                
            } else {
            	$.notify(name+" online..", {className: 'success',position:"right bottom"}  );
            	
            	 var isExist=false;
            	
            	 for (i = 0; i < onlineEntryList.length; i++) {
            		var online=onlineEntryList[i];
            		if(online.source==source){
            			isExist=true;
            		}
            		
            	}
            	
            	if (isExist==false) {
					onlineEntryList.push({'from':from, 'jid':jid_id, 'name':name, 'source':source  });
				}
            	
            	loadChildEntries();
            }
        }

       $('#onlineEntryListSize').html(onlineEntryList.length);
        // reset addressing for user since their presence changed
        /* var jid_id = Gab.jid_to_id(from);
        $('#chat-' + jid_id).data('jid', Strophe.getBareJidFromJid(from));  */

       
        return true;
	
}

function jid_to_id(jid) {
    return Strophe.getBareJidFromJid(jid);
       /*  .replace("@", "-")
        .replace(".", "-") */
}

function jid_to_name(jid) {
   return jid.substr(0, jid.indexOf('@'));
}

function jid_to_source(jid) {
   return jid.substr(jid.indexOf('/')+1,jid.length );
}

function onMessage(msg) {
	
    var to = msg.getAttribute('to');
    var from = msg.getAttribute('from');
    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('body');
    
    if (type == "chat" && elems.length > 0) {
	
    	var body = elems[0];
    	var resul={"name":"edip","age":30};

    	// 	var data=  JSON.stringify(resul);
    	
    	var data=Strophe.xmlunescape(Strophe.getText(body));
    	// var sss = jQuery.parseJSON(body);

    	// log('Mesaj Alındı:  ' + data.pluginName );
	
    	var ee=JSON.parse(data);
		log('Data : ' +   ee.type );
		log('from : ' +   from );
	    
			var reply = $msg({to: from, from: to, type: 'chat'}).cnode(Strophe.copyElement(body));
			connection.send(reply.tree());
		
		//	 log('Mesaj Gönderildi. ' + from + ' : ' + Strophe.getText(body));
		
    }

    // we must return true to keep the handler alive.  
    // returning false would remove it after it finishes.
    return true;
}

function log(msg) 
{
    $('#log').append('<div></div>').append(document.createTextNode(msg));
}
