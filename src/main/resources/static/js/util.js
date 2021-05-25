/**
 * rename and order attribute key values
 * Hasan Kara
 * @param attributeList
 * @returns attributeList
 */

var ctrlKeyDown = false;

function keydown(e) {
	if ((e.which || e.keyCode) == 116
			|| ((e.which || e.keyCode) == 82 && ctrlKeyDown)) {
		// Pressing F5 or Ctrl+R
		e.preventDefault();
	} else if ((e.which || e.keyCode) == 17) {
		// Pressing only Ctrl
		ctrlKeyDown = true;
	}
};

function keyup(e) {
	// Key up Ctrl
	if ((e.which || e.keyCode) == 17)
		ctrlKeyDown = false;
};

$(document).ready(function(){
	   $('#liderVersion').html(liderVersion)
	   //disable f5 refresh button for strophe connection
	   $(document).on("keydown", keydown);
	   $(document).on("keyup", keyup);
});

function progress(contentDiv,progressDiv,state){
		if(state=='show'){
			$('#'+contentDiv).fadeTo(200,0.1);
	  		$('#'+progressDiv).show();
	  		$('#'+progressDiv).fadeTo(200,1);
	  		
		}
		else if(state=='hide'){
			$('#'+progressDiv).hide();
		    $('#'+contentDiv).fadeTo(200,1);
		}
		$('#btnCancelProgress').remove();
		var html='<button id="btnCancelProgress" class="btn pull-right" style="margin: 5px;" > <i class="nav-link-icon fas fa-window-close"> </i> </button>';
		$('#'+progressDiv).append(html);
		$('#btnCancelProgress').click(function(e){
			$('#'+progressDiv).hide();
			$('#'+contentDiv).fadeTo(200,1);
		});
}

function progressForLoad(contentDiv,state){
	var progressDiv= contentDiv+'progressBar';
	var progressBarHtml=
		' <div id="'+progressDiv+'"  style="display: none;  width: 100%; height: 100%;  left: 0px; position:absolute ;  text-align: center;"> '+
		'   	<div style="position:absolute; top: -50%; left: 30%;" > '+
		'   		<img src="img/LoadingPage.gif" width="50" height="50" /> <span> <b> Lütfen Bekleyiniz... </b> </span> '+ 
		'   	</div> '+
		' </div>';
	
	$('#'+contentDiv).append(progressBarHtml);
	
	if(state=='show'){
		$('#'+contentDiv).fadeTo(200,0.1);
		$('#'+progressDiv).show();
		$('#'+progressDiv).fadeTo(200,1);
		
	}
	else if(state=='hide'){
		$('#'+progressDiv).hide();
		$('#'+contentDiv).fadeTo(200,1);
	}
	$('#btnCancelProgress').remove();
	var html='<button id="btnCancelProgress" class="btn pull-right" style="margin: 5px;" > <i class="nav-link-icon fas fa-window-close"> </i> </button>';
	$('#'+progressDiv).append(html);
	$('#btnCancelProgress').click(function(e){
		$('#'+progressDiv).hide();
		$('#'+contentDiv).fadeTo(200,1);
	});
}

function renameAndOrderAttributeList(attributeList) {
	var newAttributeList = [];
	var addedAttributes = [];
	var orderedList = {
			"objectClass" : "Nesne Sınıfı",
			"memberOf" : "Üye Grubu",
			"cn" : "Ad",
			"ou" : "Grup Adı",
			"sn" : "Soyad",
			"uid" : "Kimlik",
			"homeDirectory" : "Ev Dizini",
			"entryDN" : "Kayıt DN",
			"description" : "Açıklama",
			"createTimestamp": "Oluşturulma Tarihi",
			"modifyTimestamp": "Düzenlenme Tarihi",
			"creatorsName": "Oluşturan Kişi",
			"member": "member",
			"o": "Son Oturum Açan Kullanıcı"
	};
	for (var k in orderedList) {
		if(attributeList.hasOwnProperty(k)) {
			//console.log(orderedList[k] + " : " + attributeList[k]);
			newAttributeList[orderedList[k]] = attributeList[k];
			addedAttributes[k] = "";
		}
	}

	//adds attribute and values to list if they dont have values in orderedList
//	for (var k in attributeList) {
//		if(addedAttributes.hasOwnProperty(k)) {
//		} else {
//			newAttributeList[k] = attributeList[k];
//		}
//	}

	return newAttributeList;
}