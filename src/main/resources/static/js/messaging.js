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

function objToString (obj) {
	var str = '';
	for (var p in obj) {
		if (obj.hasOwnProperty(p)) {
			str += p + '::' + obj[p] + '\n';
		}
	}
	return str;
}

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

function onConnect(status)
{
	if (status == Strophe.Status.CONNECTING) {
		/* log('Strophe is connecting.'); */
		log('Mesajlaşma Servisine bağlanıyor...',"INFO");
//		$.notify("Sunucuya bağlanıyor..",{className: 'success',position:"right top"}  );
	} 
	else if (status == Strophe.Status.CONNFAIL) {
		log('Mesajlaşma Servisine bağlanırken hata oluştu.',"ERROR");
		$.notify("Sunucuya Bağlanırken Hata Oluştu. Lütfen Bağlantı bilgilerini kontrol ediniz.","error");
		//$('#connect').get(0).value = 'connect';
		logout()
	} 
	else if (status == Strophe.Status.DISCONNECTING) {
		log('Mesajlaşma Servisi bağlantısı koparılmaktadır.',"INFO");
//		$.notify("Mesajlaşma Servisi bağlantısı koparılmaktadır.","warn");
	} 
	else if (status == Strophe.Status.DISCONNECTED) {
		log('Mesajlaşma Servisi bağlantısı koparıldı.',"INFO");
		//$('#connect').get(0).value = 'connect';
		$.notify("Sunucuya Bağlanırken Hata Oluştu. Lütfen Bağlantı bilgilerini kontrol ediniz.","error");
		logout()
	} 
	else if (status == Strophe.Status.CONNECTED) {
		log('Mesajlaşma Servisi ile bağlantı kuruldu.',"SUCCESS");
//		$.notify("Mesajlaşma Servisine bağlanıldı....","success");
//		log('Mesaj göndermek için kullanıcı adım: ' + connection.jid );
		connection.addHandler(onMessage, null, 'message', null, null,  null); 
		var iq = $iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'});
		connection.sendIQ(iq, onRoster);
		connection.addHandler(onRosterChanged, "jabber:iq:roster", "iq", "set");
//		connection.send($pres().tree());
		connection.send($pres().tree());
	}
	else{
		log('Sunucuya ulaşılamıyor.');
		$.notify("Sunucuya Bağlanırken Hata Oluştu. Lütfen Bağlantı bilgilerini kontrol ediniz.","error");
	}
	
//	if(connection.connected == false){
//		$.notify("Mesajlaşma Sunucusuna Bağlanırken Hata Oluştu. Lütfen XMPP Sunucusunu kontrol ediniz.","error");
//		
	
//	
//	}
	
}

function logout() {
	$.notify("Mesajlaşma Sunucusuna Bağlanırken Hata Oluştu. Lütfen XMPP Sunucusunu kontrol ediniz.","error");
	$.ajax({
		type : 'POST',
		url : 'logout',
		dataType : 'text',
		success : function(data) {
			$('#mainHtmlContent').html(data);
		},
		error : function(data, errorThrown) {
			console.log(data);
		}
	});
	
}

function onRoster(iq)
{
	$(iq).find('item').each(function () {
		var jid = $(this).attr('jid');
		var name = $(this).attr('name') || jid;

		// transform jid into an id
		var jid_id = jid_to_id(jid);


		//rosterList.push({id :jid_id, item_name: name, jid: jid });


		/* var contact = $("<li id='" + jid_id + "'>" +
                        "<div class='roster-contact offline'>" +
                        "<div class='roster-name'>" +
                        name +
                        "</div><div class='roster-jid'>" +
                        jid +
                        "</div></div></li>"); */

		//insert_contact(contact);
	});

	//$('#rosterListSize').html(rosterList.length);

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
		
		$.notify("Registration yapılıyor..Kayıt defteri güncelleniyor..Kayıt id : "+ jid+ " Ad : "+ name,"success");

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

		$.notify("subscribe","warn");

	} else if (ptype !== 'error') {
		//OFFLine state
		if (ptype === 'unavailable') {

//			$.notify(name+" offline..",{className: 'error',position:"left bottom"}  );
			log(name+" çevrimdışı oldu.","ERROR");
			for (var i =0; i < onlineEntryList.length; i++){

				if (onlineEntryList[i].from === from && onlineEntryList[i].source === source) {
					onlineEntryList.splice(i,1);
					break;
				}
			}
		} else {
//			$.notify(name+" online..", {className: 'success',position:"left bottom"}  );
			log(name+" çevrimiçi oldu.","SUCCESS");
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
		}
	}
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
		var data=Strophe.xmlunescape(Strophe.getText(body));
		var ret=JSON.parse(data);
//		console.log(ret)

		log("Gelen Cevap : "+ret.result.responseMessage, "INFO");
		var reply = $msg({to: from, from: to, type: 'chat'}).cnode(Strophe.copyElement(body));
		connection.send(reply.tree());
	}
	return true;
}

function log(msg, type) 
{
	if(type == null){
		type="INFO"
	}
	var d = new Date();
	var h = d.getHours();
	var n = d.getMinutes();
	var message=h+":"+n+" | ["+ type + "] | "+msg;
	var color="blue";

	if(type=="SUCCESS"){
		color="green";
	}
	else if(type=="ERROR"){
		color="red";
	}
	else if(type=="INFO"){
		color="blue";
	}

	$('#logger').append('<span style="color: ' + color + '">'+message+'</span>');    
	$('#logger').append('<br>');    
}

