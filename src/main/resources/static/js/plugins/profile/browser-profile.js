/**
 * Browser Profile, general settings, proxy settings and manage browser browserPreferences
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

var browserProfileList = null;
var selectBrowserProfile = false;
var browserPluginImpl = null;
var selectedBrowserProfileId = null;
var itemList = [];
var preferencesList = {};

//---->>> START <<<--- Browser Preference Names
var browserPreferences = {
//		General preference
		checkDefaultBrowser: "browser.shell.checkDefaultBrowser",
		homePage: "browser.startup.homepage",
		pageMode: "browser.startup.page",
		useDownloadDir: "browser.download.useDownloadDir",
		downloadDir: "browser.download.dir",
		useCustomDownloadDir: "browser.download.folderList",
		openNewWindow: "browser.link.open_newwindow",
		warnOnClose: "browser.tabs.warnOnClose",
		warnOnOpen: "browser.tabs.warnOnOpen",
		restoreOnDemand: "browser.sessionstore.restore_on_demand",
		loadInBackground: "browser.tabs.loadInBackground",
		enableXpInstall: "xpinstall.enabled",
		//Proxy preference
		proxyType: "network.proxy.type",
		httpProxy: "network.proxy.http",
		httpPort: "network.proxy.http_port",
		useThisServerForAllProtocols: "network.proxy.share_proxy_settings",
		sslProxy: "network.proxy.ssl",
		sslPort: "network.proxy.ssl_port",
		ftpProxy: "network.proxy.ftp",
		ftpPort: "network.proxy.ftp_port",
		socksProxy: "network.proxy.socks",
		socksPort: "network.proxy.socks_port",
		socksVersion: "network.proxy.socks_version",
		remoteDns: "network.proxy.socks_remote_dns",
		autoProxyConfigUrl: "network.proxy.autoconfig_url",
		dontPromptForAuth: "network.automatic-ntlm-auth.allow-proxies",
		noProxyOn: "network.proxy.no_proxies_on",
		//Privacy preference
		dontWantToBeTracked: "privacy.donottrackheader.enabled",
		rememberBrowsingDownloadHistory: "places.history.enabled",
		rememberSearchFormHistory: "browser.formfill.enable",
		acceptCookiesFromSites: "network.cookie.cookieBehavior",
		clearHistoryOnClose: "privacy.sanitize.sanitizeOnShutdown",
		suggestHistory: "browser.urlbar.suggest.history",
		suggestBookmarks: "browser.urlbar.suggest.bookmark",
		suggestOpenTabs: "browser.urlbar.suggest.openpage",
		keepCookiesUntil: "network.cookie.lifetimePolicy",
};

getBrowserProfileList();
hideAndShowBrowserProfileButton();
$("#browserGeneralSettingsTab").tab('show');
createBrowserPreferenceTable();

for (var i = 0; i < pluginProfileList.length; i++) {
	if(pluginProfileList[i].page == 'browser-profile'){
		browserPluginImpl = pluginProfileList[i].plugin;
	}
}

//get browser profile list
function getBrowserProfileList() {
	var params = {
			"name" : "browser"
	};
	$.ajax({
		type : 'POST',
		url : '/profile/list',
		data: params,
		dataType : 'json',
		success : function(data) {
			browserProfileList = data;
			createBrowserProfileTable();
		}
	});
}

//created browser profile table
function createBrowserProfileTable() {
	hideAndShowBrowserProfileButton();
	defaultBrowserSetting();
	if ($("#browserProfileListEmptyInfo").length > 0) {
		$("#browserProfileListEmptyInfo").remove();
	}

	if(browserProfileList != null && browserProfileList.length > 0) {
		var profile = "";
		for (var i = 0; i < browserProfileList.length; i++) {
			var profileId = browserProfileList[i].id;
			var profileName = browserProfileList[i].label;
			var profileDescription = browserProfileList[i].description;
			var profileCreateDate = browserProfileList[i].createDate;
			var profileOfPlugin = browserProfileList[i].plugin.name;
			var profileDeleted = browserProfileList[i].deleted;
			if (profileDeleted == false) {

				profile += "<tr id="+ profileId +">";
				profile += '<td>'+ profileName +'</td>';
				profile += '<td>'+ profileDescription +'</td>';
				profile += '<td>'+ profileCreateDate +'</td>';
				profile += '</tr>';
			}
		}
		$('#browserProfileBody').html(profile);
	} else {
		$('#browserProfileBody').html('<tr id="browserProfileListEmptyInfo"><td colspan="3" class="text-center">Tarayıcı ayarı bulunamadı.</td></tr>');
	}
}

$('#browserProfileTable').on('click', 'tbody tr', function(event) {
	if(browserProfileList != null && browserProfileList.length > 0) {
		defaultBrowserSetting();
		if($(this).hasClass('policysettings')){

			$(this).removeClass('policysettings');
			selectBrowserProfile = false;
			selectedBrowserProfileId = null;
			hideAndShowBrowserProfileButton();
		} else {
			$(this).addClass('policysettings').siblings().removeClass('policysettings');
			selectedBrowserProfileId = $(this).attr('id');
			selectBrowserProfile = true;
			hideAndShowBrowserProfileButton();
			showDetailSelectedBrowserProfile();
		}
	}
});

function showDetailSelectedBrowserProfile() {
	for (var i = 0; i < browserProfileList.length; i++) {
		if (selectedBrowserProfileId == browserProfileList[i].id) {
			$('#browserProfileNameForm').val(browserProfileList[i].label);
			$('#browserProfileDescriptionForm').val(browserProfileList[i].description);
			if (browserProfileList[i].profileData.preferences) {
				itemList = browserProfileList[i].profileData.preferences;
				createBrowserPreferenceTable();
				loadPreference();
			}
		}
	}
}

function loadPreference() {
	var prefList = Object.keys(browserPreferences);
	for (var j = 0; j < itemList.length; j++) {
		if (browserPreferences.homePage == itemList[j].preferenceName) {
			$("#homePage").val(itemList[j].value);
		}
		if (browserPreferences.pageMode == itemList[j].preferenceName) {
			$('#pageMode').val(itemList[j].value).change();
		}
		if (browserPreferences.useDownloadDir == itemList[j].preferenceName && itemList[j].value == "true") {
			$("#downloadRadioBtn1").prop("checked", true);
		}
		if (browserPreferences.downloadDir == itemList[j].preferenceName) {
			$("#downloadDirectory").val(itemList[j].value);
		}
		if (browserPreferences.openNewWindow == itemList[j].preferenceName && itemList[j].value == "3") {
			$("#openNewWindow").prop("checked", true);
		}
		if (browserPreferences.proxyType == itemList[j].preferenceName) {
			$('#proxyType').val(itemList[j].value).change();
		}
		if (browserPreferences.httpProxy == itemList[j].preferenceName) {
			$("#httpProxy").val(itemList[j].value);
		}
		if (browserPreferences.httpPort == itemList[j].preferenceName) {
			$("#httpPort").val(itemList[j].value);
		}
		if (browserPreferences.sslProxy == itemList[j].preferenceName) {
			$("#sslProxy").val(itemList[j].value);
		}
		if (browserPreferences.sslPort == itemList[j].preferenceName) {
			$("#sslPort").val(itemList[j].value);
		}
		if (browserPreferences.ftpProxy == itemList[j].preferenceName) {
			$("#ftpProxy").val(itemList[j].value);
		}
		if (browserPreferences.ftpPort == itemList[j].preferenceName) {
			$("#ftpPort").val(itemList[j].value);
		}
		if (browserPreferences.socksProxy == itemList[j].preferenceName) {
			$("#socksProxy").val(itemList[j].value);
		}
		if (browserPreferences.socksPort == itemList[j].preferenceName) {
			$("#socksPort").val(itemList[j].value);
		}
		if (browserPreferences.socksVersion == itemList[j].preferenceName) {
			$('#socksVersion').val(itemList[j].value).change();
		}
		if (browserPreferences.noProxyOn == itemList[j].preferenceName) {
			$('#noProxyOn').val(itemList[j].value);
		}
		if (browserPreferences.autoProxyConfigUrl == itemList[j].preferenceName) {
			$('#autoProxyConfigUrl').val(itemList[j].value);
		}
		if (browserPreferences.acceptCookiesFromSites == itemList[j].preferenceName) {
			if (itemList[j].value != "2") {
				$("#acceptCookiesFromSites").prop("checked", true);
				$("#acceptThirdPartyCookies").prop("disabled", false);
			}
			$('#acceptThirdPartyCookies').val(itemList[j].value).change();
		}
		if (browserPreferences.keepCookiesUntil == itemList[j].preferenceName) {
			if (itemList[j].value != "0") {
				$("#acceptCookiesFromSites").prop("checked", true);
				$("#keepCookiesUntil").prop("disabled", false);
			}
			$('#keepCookiesUntil').val(itemList[j].value).change();
		}
		for (var i = 0; i < prefList.length; i++) {
			var key = prefList[i];
			if (browserPreferences[key] == itemList[j].preferenceName && itemList[j].value == "true") {
				$("#"+ key).prop("checked", true);
			}
			if (browserPreferences.loadInBackground == itemList[j].preferenceName && itemList[j].value == "true") {
				$("#loadInBackground").prop("checked", false);
			}
			if (browserPreferences.loadInBackground == itemList[j].preferenceName && itemList[j].value == "false") {
				$("#loadInBackground").prop("checked", true);
			}
			if (browserPreferences.enableXpInstall == itemList[j].preferenceName && itemList[j].value == "true") {
				$("#enableXpInstall").prop("checked", false);
			}
			if (browserPreferences.enableXpInstall == itemList[j].preferenceName && itemList[j].value == "false") {
				$("#enableXpInstall").prop("checked", true);
			}
		}
	}
}

function defaultBrowserSetting() {
	$('#browserProfileNameForm').val("");
	$('#browserProfileDescriptionForm').val("");
	$('#preferenceName').val("");
	$('#preferenceValue').val("");
	$('#pageMode').val("1").change();
	$('#homePage').val("");
	$('#downloadDirectory').val("");
	$(".firefox-cb:checkbox").prop("checked", false);
	$("#downloadRadioBtn2").prop("checked", true);
	$(".proxy-settings").prop("disabled", true);
	$(".proxy-settings").val("");
	$('#socksVersion').val("4").change();
	$('#proxyType').val("0").change();
	$('#noProxyOn').val("localhost, 127.0.0.1");
	$("#acceptThirdPartyCookies").prop("disabled", true);
	$("#keepCookiesUntil").prop("disabled", true);
	$('#acceptThirdPartyCookies').val("2").change();
	$('#keepCookiesUntil').val("0").change();
	itemList = [];
	preferencesList = {};
	createBrowserPreferenceTable();
}

function hideAndShowBrowserProfileButton() {
	if (selectBrowserProfile == false) {
		$("#browserProfileDel").hide();
		$("#browserProfileUpdate").hide();
		$("#browserProfileAddToPolicy").hide();
		$("#browserProfileSave").show();
	} else {
		$("#browserProfileDel").show();
		$("#browserProfileUpdate").show();
		$("#browserProfileAddToPolicy").show();
		$("#browserProfileSave").hide();
	}
}

//get browserPreferences for browser profile
function getBrowserProfileData() {
	itemList = [];
//	general preference
	$("#checkDefaultBrowser").is(':checked') ? addToPreferences(browserPreferences.checkDefaultBrowser, "true") : addToPreferences(browserPreferences.checkDefaultBrowser, "false");
	addToPreferences(browserPreferences.pageMode, $('#pageMode :selected').val());
	if ($("#homePage").val() != "") {
		addToPreferences(browserPreferences.homePage, $("#homePage").val());
	}
	if ($("#downloadRadioBtn1").is(':checked')) {
		addToPreferences(browserPreferences.useDownloadDir, "true");
		addToPreferences(browserPreferences.useCustomDownloadDir, "2");
		addToPreferences(browserPreferences.downloadDir, $("#downloadDirectory").val());
	} else {
		addToPreferences(browserPreferences.useDownloadDir, "false");
		addToPreferences(browserPreferences.useCustomDownloadDir, "1");
	}
	$("#openNewWindow").is(':checked') ? addToPreferences(browserPreferences.openNewWindow, "3") : addToPreferences(browserPreferences.openNewWindow, "2");
	$("#warnOnClose").is(':checked') ? addToPreferences(browserPreferences.warnOnClose, "true") : addToPreferences(browserPreferences.warnOnClose, "false");
	$("#warnOnOpen").is(':checked') ? addToPreferences(browserPreferences.warnOnOpen, "true") : addToPreferences(browserPreferences.warnOnOpen, "false");
	$("#restoreOnDemond").is(':checked') ? addToPreferences(browserPreferences.restoreOnDemand, "true") : addToPreferences(browserPreferences.restoreOnDemand, "false");
	$("#loadInBackground").is(':checked') ? addToPreferences(browserPreferences.loadInBackground, "false") : addToPreferences(browserPreferences.loadInBackground, "true");
	$("#enableXpInstall").is(':checked') ? addToPreferences(browserPreferences.enableXpInstall, "false") : addToPreferences(browserPreferences.enableXpInstall, "true");

//	proxy preference
	var type = $('#proxyType').val();
	addToPreferences(browserPreferences.proxyType, type);
	$("#useThisServerForAllProtocols").is(':checked') ? addToPreferences(browserPreferences.useThisServerForAllProtocols, "true") : addToPreferences(browserPreferences.useThisServerForAllProtocols, "false");
	if (type != "0") {
		$("#dontPromptForAuth").is(':checked') ? addToPreferences(browserPreferences.dontPromptForAuth, "true") : addToPreferences(browserPreferences.dontPromptForAuth, "false");
		$("#remoteDns").is(':checked') ? addToPreferences(browserPreferences.remoteDns, "true") : addToPreferences(browserPreferences.remoteDns, "false");
	}
	if (type == "1") {
		if ($('#httpProxy').val() != "" && $('#httpProxy').val() != null) {
			addToPreferences(browserPreferences.httpProxy, $('#httpProxy').val());
		}
		if ($('#httpPort').val() != "" && $('#httpPort').val() != null) {
			addToPreferences(browserPreferences.httpPort, $('#httpPort').val());
		}
		if ($('#sslProxy').val() != "" && $('#sslProxy').val() != null) {
			addToPreferences(browserPreferences.sslProxy, $('#sslProxy').val());
		}
		if ($('#sslPort').val() != "" && $('#sslPort').val() != null) {
			addToPreferences(browserPreferences.sslPort, $('#sslPort').val());
		}
		if ($('#ftpProxy').val() != "" && $('#ftpProxy').val() != null) {
			addToPreferences(browserPreferences.ftpProxy, $('#ftpProxy').val());
		}
		if ($('#ftpPort').val() != "" && $('#ftpPort').val() != null) {
			addToPreferences(browserPreferences.ftpPort, $('#ftpPort').val());
		}
		if ($('#socksProxy').val() != "" && $('#socksProxy').val() != null) {
			addToPreferences(socksProxy, $('#socksProxy').val());
		}
		if ($('#socksPort').val() != "" && $('#socksPort').val() != null) {
			addToPreferences(browserPreferences.socksPort, $('#socksPort').val());
		}
		addToPreferences(browserPreferences.socksVersion, $('#socksVersion :selected').val());
		$("#remoteDns").is(':checked') ? addToPreferences(browserPreferences.remoteDns, "true") : addToPreferences(browserPreferences.remoteDns, "false");
		if ($('#noProxyOn').val() != "" && $('#noProxyOn').val() != null) {
			addToPreferences(browserPreferences.noProxyOn, $('#noProxyOn').val());
		}
	}
	if (type == "2") {
		if ($('#autoProxyConfigUrl').val() != "" && $('#autoProxyConfigUrl').val() != null) {
			addToPreferences(browserPreferences.autoProxyConfigUrl, $('#autoProxyConfigUrl').val());
		}
	}

	// privacy preference
	$("#dontWantToBeTracked").is(':checked') ? addToPreferences(browserPreferences.dontWantToBeTracked, "true") : addToPreferences(browserPreferences.dontWantToBeTracked, "false");
	$("#rememberBrowsingDownloadHistory").is(':checked') ? addToPreferences(browserPreferences.rememberBrowsingDownloadHistory, "true") : addToPreferences(browserPreferences.rememberBrowsingDownloadHistory, "false");
	$("#rememberSearchFormHistory").is(':checked') ? addToPreferences(browserPreferences.rememberSearchFormHistory, "true") : addToPreferences(browserPreferences.rememberSearchFormHistory, "false");
	addToPreferences(browserPreferences.acceptCookiesFromSites, $('#acceptThirdPartyCookies').val());
	addToPreferences(browserPreferences.keepCookiesUntil, $('#keepCookiesUntil').val());
	$("#clearHistoryOnClose").is(':checked') ? addToPreferences(clearHistoryOnClose, "true") : addToPreferences(browserPreferences.clearHistoryOnClose, "false");
	$("#suggestHistory").is(':checked') ? addToPreferences(browserPreferences.suggestHistory, "true") : addToPreferences(browserPreferences.suggestHistory, "false");
	$("#suggestBookmarks").is(':checked') ? addToPreferences(browserPreferences.suggestBookmarks, "true") : addToPreferences(browserPreferences.suggestBookmarks, "false");
	$("#suggestOpenTabs").is(':checked') ? addToPreferences(browserPreferences.suggestOpenTabs, "true") : addToPreferences(browserPreferences.suggestOpenTabs, "false");

	preferencesList.preferences = itemList;
	return preferencesList;
}

function addToPreferences(name, value) {
	var preference = {
			"preferenceName" : name,
			"value" : value
	};
	itemList.push(preference);
}

$("input[type='radio'][name='customDownloadRadioBtn']").change(function(){
	if ($("#downloadRadioBtn1").is(':checked')) {
		$("#downloadDirectory").prop("disabled", false);
	} else {
		$("#downloadDirectory").prop("disabled", true);
		$("#downloadDirectory").val("");
	}
});

$("#proxyType").change(function(){
	$(".proxy-settings:text").val("");
	var type =  $(this).val();
	if (type == "0") {
		$(".proxy-settings").val("");
		$("#httpProxy").prop("disabled", true);
		$("#httpPort").prop("disabled", true);
		$("#useThisServerForAllProtocols").prop("disabled", true);
		$("#sslProxy").prop("disabled", true);
		$("#sslPort").prop("disabled", true);
		$("#ftpProxy").prop("disabled", true);
		$("#ftpPort").prop("disabled", true);
		$("#socksProxy").prop("disabled", true);
		$("#socksPort").prop("disabled", true);
		$("#socksVersion").prop("disabled", true);
		$("#remoteDns").prop("disabled", true);
		$("#noProxyOn").prop("disabled", true);
		$("#autoProxyConfigUrl").prop("disabled", true);
		$("#dontPromptForAuth").prop("disabled", true);
	} else if (type == "1") {
		$("#httpProxy").prop("disabled", false);
		$("#httpPort").prop("disabled", false);
		$("#useThisServerForAllProtocols").prop("disabled", false);
		$("#sslProxy").prop("disabled", false);
		$("#sslPort").prop("disabled", false);
		$("#ftpProxy").prop("disabled", false);
		$("#ftpPort").prop("disabled", false);
		$("#socksProxy").prop("disabled", false);
		$("#socksPort").prop("disabled", false);
		$("#socksVersion").prop("disabled", false);
		$("#remoteDns").prop("disabled", false);
		$("#noProxyOn").prop("disabled", false);
		$("#autoProxyConfigUrl").prop("disabled", true);
		$("#dontPromptForAuth").prop("disabled", false);
	} else if (type == "2") {
		$("#httpProxy").prop("disabled", true);
		$("#httpPort").prop("disabled", true);
		$("#useThisServerForAllProtocols").prop("disabled", true);
		$("#sslProxy").prop("disabled", true);
		$("#sslPort").prop("disabled", true);
		$("#ftpProxy").prop("disabled", true);
		$("#ftpPort").prop("disabled", true);
		$("#socksProxy").prop("disabled", true);
		$("#socksPort").prop("disabled", true);
		$("#socksVersion").prop("disabled", true);
		$("#remoteDns").prop("disabled", false);
		$("#noProxyOn").prop("disabled", true);
		$("#autoProxyConfigUrl").prop("disabled", false);
		$("#dontPromptForAuth").prop("disabled", false);
	} else if (type == "3") {
		$("#httpProxy").prop("disabled", true);
		$("#httpPort").prop("disabled", true);
		$("#useThisServerForAllProtocols").prop("disabled", true);
		$("#sslProxy").prop("disabled", true);
		$("#sslPort").prop("disabled", true);
		$("#ftpProxy").prop("disabled", true);
		$("#ftpPort").prop("disabled", true);
		$("#socksProxy").prop("disabled", true);
		$("#socksPort").prop("disabled", true);
		$("#socksVersion").prop("disabled", true);
		$("#remoteDns").prop("disabled", false);
		$("#noProxyOn").prop("disabled", true);
		$("#autoProxyConfigUrl").prop("disabled", true);
		$("#dontPromptForAuth").prop("disabled", false);
	} else {
		$("#httpProxy").prop("disabled", true);
		$("#httpPort").prop("disabled", true);
		$("#useThisServerForAllProtocols").prop("disabled", true);
		$("#sslProxy").prop("disabled", true);
		$("#sslPort").prop("disabled", true);
		$("#ftpProxy").prop("disabled", true);
		$("#ftpPort").prop("disabled", true);
		$("#socksProxy").prop("disabled", true);
		$("#socksPort").prop("disabled", true);
		$("#socksVersion").prop("disabled", true);
		$("#remoteDns").prop("disabled", false);
		$("#noProxyOn").prop("disabled", true);
		$("#autoProxyConfigUrl").prop("disabled", true);
		$("#dontPromptForAuth").prop("disabled", false);
	}
});

$('#acceptCookiesFromSites').click(function(e){
	if($(this).is(':checked')){
		$("#acceptThirdPartyCookies").prop("disabled", false);
		$("#keepCookiesUntil").prop("disabled", false);
	} else {
		$("#acceptThirdPartyCookies").prop("disabled", true);
		$("#keepCookiesUntil").prop("disabled", true);
	}
});

$("#addPreferenceBtn").click(function(e){
	var preferenceName = $('#preferenceName').val();
	var preferenceValue = $('#preferenceValue').val();
	if (preferenceName != "" && preferenceValue != "") {
		addToPreferences(preferenceName, preferenceValue);
		createBrowserPreferenceTable();
		$('#preferenceName').val("");
		$('#preferenceValue').val("");
	} else {
		$.notify("Özellik adı ve değer girilmelidir.", "warn");
	}
});

//created preference table
function createBrowserPreferenceTable() {

	if ($("#browserPreferenceBodyEmptyInfo").length > 0) {
		$("#browserPreferenceBodyEmptyInfo").remove();
	}
	if(itemList != null && itemList.length > 0) {
		var html = "";
		for (var i = 0; i < itemList.length; i++) {
			var prefName = itemList[i].preferenceName;
			var prefValue = itemList[i].value;
			var id = itemList[i].preferenceName;

			html += '<tr>';
			html += '<td>'+ prefName +'</td>';
			html += '<td>'+ prefValue +'</td>';
			html += '<td class="text-center"><button type="button" id='+ id +' onclick="deletePreference(this)" title="Kaldır" class="btn btn-sm btn-outline-danger"><i class="pe-7s-trash"></i></button></td>';
			html += '</tr>';
		}
		$('#browserPreferenceBody').html(html);
	} else {
		$('#browserPreferenceBody').html('<tr id="browserPreferenceBodyEmptyInfo"><td colspan="3" class="text-center">Firefox özellikleri bulunamadı</td></tr>');
	}
}

//delete preference from Browser Preference Table 
function deletePreference(select) {
	var i = select.parentNode.parentNode.rowIndex;
	document.getElementById("browserPreferenceTable").deleteRow(i);
	var index = -1;
	for (var i = 0; i < itemList.length; i++) {
		if (itemList[i].preferenceName == select.id) {
			index = i;
			if (index > -1) {
				itemList.splice(index, 1);
			}
		}
	}
	if(itemList == null || itemList.length == 0) {
		$('#browserPreferenceBody').html('<tr id="browserPreferenceBodyEmptyInfo"><td colspan="3" class="text-center">Firefox özellikleri bulunamadı</td></tr>');
	}
}

/*
 * Browser Preference Table -->> STOP
 */

//save browser profile
$("#browserProfileSave").click(function(e){
	var label = $('#browserProfileNameForm').val();
	var description = $('#browserProfileDescriptionForm').val();
	if (label != "") {
		if (checkedProfileName(label) == false) {
			var params = {
					"label": label,
					"description": description,
					"profileData": getBrowserProfileData(),
					"plugin": browserPluginImpl
			};
			$.ajax({
				type : 'POST',
				url : '/profile/add',
				data: JSON.stringify(params),
				dataType : 'json',
				contentType: "application/json",
				success : function(data) {
					if(data != null) {
						$.notify("İnternet tarayıcı ayarı başarıyla kaydedildi.", "success");
						browserProfileList.push(data);
						createBrowserProfileTable();
					}
				},
				error: function (data, errorThrown) {
					$.notify("İnternet tarayıcı ayarı kaydedilirken hata oluştu. ", "error");
				},
			});
		} else {
			$.notify("Ayar adı aynı olamaz.", "warn");
		}
	} else {
		$.notify("Lütfen ayar adı giriniz.", "warn");
	}
});

//delete selected browser profile
$("#browserProfileDel").click(function(e){
	if (selectBrowserProfile == true) {
		var params = {
				"id": selectedBrowserProfileId,
		};

		$.ajax({
			type : 'POST',
			url : '/profile/del',
			data: JSON.stringify(params),
			dataType : 'json',
			contentType: "application/json",
			success : function(data) {
				if(data != null) {
					$.notify("İnternet tarayıcı ayarı başarıyla silindi.", "success");
					var index = findIndexBrowserProfile(selectedBrowserProfileId);
					if (index > -1) {
						browserProfileList.splice(index, 1);
					}
					selectedBrowserProfileId = null;
					selectBrowserProfile = false;
					createBrowserProfileTable();
				} 
			},
			error: function (data, errorThrown) {
				$.notify("İnternet tarayıcı ayarı silinirken hata oluştu.", "error");
			},
		});
	} else {
		$.notify("Lütfen silmek için ayar seçiniz.", "warn");
	}
});

function findIndexBrowserProfile(id) {
	var index = -1;
	for (var i = 0; i < browserProfileList.length; i++) { 
		if (browserProfileList[i]["id"] == id) {
			index = i;
		}
	}
	return index;
}

function checkedProfileName(label) {
	var isExist = false;
	for (var i = 0; i < browserProfileList.length; i++) {
		if (label == browserProfileList[i].label) {
			isExist = true;
		}
	}
	return isExist;
}

//added select profile to general profile table profileListTable
$("#browserProfileAddToPolicy").click(function(e){
	for (var i = 0; i < browserProfileList.length; i++) {
		if (selectedBrowserProfileId == browserProfileList[i].id) {
			addProfileToPolicy(browserProfileList[i]);
		}
	}
});

//updated selected browser profile
$("#browserProfileUpdate").click(function(e){
	var label = $('#browserProfileNameForm').val();
	var description = $('#browserProfileDescriptionForm').val();
	var existLabel = null;
	for (var i = 0; i < browserProfileList.length; i++) {
		if (selectedBrowserProfileId == browserProfileList[i].id) {
			existLabel = browserProfileList[i].label;
		}
	}
	if (label != "") {
		if (label != existLabel) {
			if (checkedProfileName(label) == true) {
				$.notify("Ayar adı aynı olamaz.", "warn");
				return
			}
		}
		var params = {
				"id": selectedBrowserProfileId,
				"label": label,
				"description": description,
				"profileData": getBrowserProfileData(),
		};
		$.ajax({
			type : 'POST',
			url : '/profile/update',
			data: JSON.stringify(params),
			dataType : 'json',
			contentType: "application/json",
			success : function(data) {
				if(data != null) {
					$.notify("İnternet tarayıcı ayarı başarıyla güncellendi.", "success");
					var index = findIndexBrowserProfile(selectedBrowserProfileId);
					if (index > -1) {
						browserProfileList.splice(index, 1);
					}
					browserProfileList.push(data);
					selectedBrowserProfileId = null;
					selectBrowserProfile = false;
					createBrowserProfileTable();
				} 
			},
			error: function (data, errorThrown) {
				$.notify("İnternet tarayıcı ayarı güncellenirken hata oluştu.", "error");
			},
		});
	} else {
		$.notify("Lütfen ayar adı giriniz.", "warn");
	}
});
