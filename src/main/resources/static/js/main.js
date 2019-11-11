$('.tree').treegrid();

var selectedEntries = []; // make a global to make for different selected entries

$("#subentryDiv").hide();

$('#selectedEntryListModal').on('show.bs.modal', function(event) {

	showSelectedEntries();
	
});


$('#addSelectedEntry').on('click',
				function() {
					var rowCount = $('#subEntryDivTable tr').filter(':has(:checkbox:checked)').length;

					if (rowCount > 0) {

						$('#subEntryDivTable tr').filter(':has(:checkbox:checked)').each(
										function(i) {

											if (jQuery.inArray(this.id,	selectedEntries) == -1) {
												
												if(this.id!=""){
													selectedEntries.push(this.id);
												}

											}

										});
						$('#selectedEntrySize').html(selectedEntries.length);

					}

				});

			$('.ldapTreeItem').on('click',	function(e) {

					var uid = $(this).data("id");
					var type = $(this).data("type");
					var parent = $(this).data("parent");
					var name = $(this).text();
					/*
					 * alert(uid) alert(type) alert(parent) alert(name)
					 */

					if(type === null) return;
					
					$("#subentryDiv").show();

					/*
					 * $('#mainArea').load('task', function(){
					 * $(this).find('a').click(function(){ alert('hey'); }); });
					 */

					/* $('#mainArea').load("task"); */

					$.ajax({
								type : 'POST',
								url : 'getOuDetails',
								data : 'uid=' + uid + '&type=' + type
										+ '&name=' + name + '&parent=' + parent,
								dataType : 'text',
								success : function(data) {

									/*
									 * $('#mainArea').html("");
									 * $('#mainArea').append(data);
									 * 
									 */
									var selectedEntry = jQuery.parseJSON(data);

									$('#selectedEntryHeader').html("")
									$('#selectedEntryHeader').html(selectedEntry.parentName)
									
									childEntryList=selectedEntry.childEntries;

									
									loadChildEntries();

								}
							});

					/*
					 * $.get("task", function(data, status){
					 * $('#mainArea').html(""); $('#mainArea').append(data);
					 * $('#uidName').append(uid +" "+type);
					 * 
					 * });
					 */
				});

$('.sendTaskButton').click(function() {
	var page = $(this).data('page');
	var name = $(this).data('name');
	var description = $(this).data('description');
	var id = $(this).data('id');

	
	$.ajax({
		type : 'POST',
		url : 'getPluginHtmlPage',
		data : 'id=' + id + '&name=' + name
				+ '&page=' + page + '&description=' + description,
		dataType : 'text',
		success : function(data) {

			$('#pluginHtmpPageModal').modal('show');
			$('#pluginPageRender').html(data);
			
		}
	});
	
	
	

	
});


$('#textTaskSearch').keyup(function() {
	
	var txt=$('#textTaskSearch').val();
	 $("#pluginTaskTable > tbody > tr").filter(function() {
		 $(this).toggle($(this).text().indexOf(txt) > -1)
	 });

			
});

function showSelectedEntries() {

	var html = '<table class="table table-striped table-bordered " id="selectedEntry4TaskTables">';

	for (var i = 0; i < selectedEntries.length; i++) {

		html += '<tr>';

		html += '<td>' + selectedEntries[i] + '</td>';

		html += '<td> <button class="btn btn-xs btn-default removeEntry" type="button" id="' +selectedEntries[i]+ '" data-id="'+ selectedEntries[i]+'" title="Kaldir"> <img src="img/remove.png"></img> </button>  </td>';

		html += '</tr>';
	}
	html += '</table>';

	$('#selectedEntriesHolder').html(html);
	
	$('.removeEntry').on('click', function(e) {
		var uid = $(this).data("id");

		selectedEntries.splice($.inArray(uid, selectedEntries), 1);
		showSelectedEntries();
		$('#selectedEntrySize').html(selectedEntries.length);
	});
}


function loadChildEntries(){
	
	$('#subEntryDivTable').empty();

	var table = '<table id="subEntryTable" class="table table-sm table-border table-striped table-order"  >';

	table += '<thead>';

	table += '<tr>';
	table += '<th> <input type="checkbox" name="checkAll" id="checkAll"/> </th>';
	table += '<th></th>';
	table += '<th>Name</th>';
	table += '<th></th>';
	table += '</tr>';
	table += '</thead>';
	table += '<tbody>';
	
	for (i = 0; i < childEntryList.length; i++) {

		var rep = childEntryList[i];
		
		var isOnline=false;
		
		for (var k =0; k < onlineEntryList.length; k++){
    		  var on=onlineEntryList[k];
				if(on.name==rep.uid){
					isOnline=true;
				}
		
    	}

		var row = '<tr class="tr-order" id= "'
				+ rep.distinguishedName
				+ '"  >';

		row += ' <td class="td-order" style="text-align: left; vertical-align: middle;">';

		row += ' <input id="checkBox" class="selectedEntryCheckbox" type="checkbox" name="selectedEntry" value="'+ rep.uid + '" />';

		row += ' </td>';
		
		var imagePath="";
		if(rep.type=='USER')
		{imagePath="checked-user-32.png";}
		else if(rep.type=='AHENK' && isOnline==true)
			{imagePath="pardus_online.png";}
		else if(rep.type=='AHENK' && isOnline==false)
			{imagePath="pardus_offline.png";}

		row += '<td class="td-order" style="text-align: left; vertical-align: middle;">  <img src="img/'+imagePath +'"></img> </td>';

		row += '<td class="td-order" style="text-align: left; vertical-align: middle;">'
			+ rep.uid + '</td>';

		row += '<td style="text-align: left; vertical-align: middle;" >'
		row += '<div class="btn-group">  <button class="btn btn-xs btn-default" type="button" data-html="true" data-toggle="modal"  data-target="#attributeModal" data-id='
				+ rep.name
				+ ' data-dn='
				+ rep.distinguishedName
				+ ' data-uuid='
				+ rep.entryUUID
				+ '  title="Özellikler"> <img src="img/information.png"></img> </button>';
		row += '</td>'

		row += '</tr>'

		table += row;
	}

	table += '</tbody>';
	table += '</table>';

	$('#subEntryDivTable').append(table);
	
	$('#checkAll').click(function() {
		$('.selectedEntryCheckbox').prop('checked', this.checked);
	});

	$('#attributeModal').on('show.bs.modal',
					function(event) {
						var button = $(event.relatedTarget) 
						var modal = $(this)

						var id = button.data('id') 
						var distinguishedName = button.data('dn') 
						var uuid = button.data('uuid') 

						var dn = "";
						for (k = 0; k < childEntryList.length; k++) {

							var res = childEntryList[k];

							if (uuid == res.entryUUID) {

								dn = res.distinguishedName;

								var tableAtt = '<table id="subeEntryAttrTable"  >';
								tableAtt += '<caption>Özellikler</caption>';
								tableAtt += '<thead>';

								tableAtt += '<tr>';
								tableAtt += '<th>Key</th>';
								tableAtt += '<th>Value</th>';
								tableAtt += '</thead>';
								tableAtt += '<tbody>';

								for ( var key in res.attributes) {
									var rowAttr = '<tr class="tr-order">';
									rowAttr += '<td class="td-order" style="text-align: left; vertical-align: middle;">'
											+ key
											+ '</td>';
									rowAttr += '<td class="td-order" style="text-align: left; vertical-align: middle;" >'
											+ res.attributes[key]
											+ '</td>';

									rowAttr += '</tr>';
									tableAtt += rowAttr;
								}

								tableAtt += '</tbody>';
								tableAtt += '</table>';

								modal.find('#attributes_attributes').html("");
								modal.find('#attributes_attributes').append(tableAtt);

							}
						}

						modal.find('#attributes_dn').html("")
						modal.find('#attributes_dn').html("DN = "+ dn)

					});
	
	
	$('#textSubEntrySearch').keyup(function() {
		
		var txt=$('#textSubEntrySearch').val();
		 $("#subEntryTable > tbody > tr").filter(function() {
			 $(this).toggle($(this).text().indexOf(txt) > -1)
		 });

				
	});
	
	
}

