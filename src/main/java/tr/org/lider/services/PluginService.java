package tr.org.lider.services;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tr.org.lider.entities.PluginImpl;
import tr.org.lider.entities.PluginProfile;
import tr.org.lider.entities.PluginTask;
import tr.org.lider.repositories.PluginProfileRepository;
import tr.org.lider.repositories.PluginRepository;
import tr.org.lider.repositories.PluginTaskRepository;


/**
 * Service for plugin, plugin_task and plugin_profile manage.
 * 
 * @author <a href="mailto:tuncay.colak@tubitak.gov.tr">Tuncay ÇOLAK</a>
 * 
 */

@Service
public class PluginService {

	@Autowired
	private PluginRepository pluginRepository;	

	@Autowired
	private PluginTaskRepository pluginTaskRepository;

	@Autowired
	private PluginProfileRepository pluginProfileRepository;

	@PostConstruct
	private void init() {
		
//		insert plugins to c_plugin table 
		List<PluginImpl> pluginList = new ArrayList<>();
		List<PluginImpl> pluginList2 = new ArrayList<>();

		//		PluginImpl(String name(1), String version(2), String description(3), boolean active(4), boolean deleted(5), boolean machineOriented(6), boolean userOriented(7),
		//		boolean policyPlugin(8), boolean taskPlugin(9), boolean usesFileTransfer(10), boolean xBased(11))

		pluginList.add(new PluginImpl("conky", "1.0.0", "Conky mesajı", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("resource-usage", "1.0.0", "Kaynak Kullanıcı", true, false, true, false, false, true, false, false));
		pluginList.add(new PluginImpl("package-manager", "1.0.0", "Paket yönetimi", true, false, true, true, true, true, true, false));
		pluginList.add(new PluginImpl("manage-root", "1.0.0", "Root parola yönetimi", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("login-manager", "1.0.0", "Oturum yönetimi", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("service", "1.0.0", "Servis yönetimi", true, false, true, true, true, true, true, false));
		pluginList.add(new PluginImpl("script", "1.0.0", "Betik çalıştır", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("notify", "1.0.0", "ETA bilgilendirme mesajı", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("file-management", "1.0.0", "Betik çalıştır", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("local-user", "1.0.0", "Yerel kullanıcı yönetimi", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("system-restriction", "1.0.0", "Kullanıcı ve uygulama kısıtlamaları yönetimi", true, false, true, true, true, true, true, false));
		pluginList.add(new PluginImpl("ldap-login", "1.0.0", "LDAP ve AD oturum açma ve iptal etme ayarları", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("network-manager", "1.0.0", "Ağ yönetimi", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("usb", "1.0.0", "USB yöneitim", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("network-inventory", "1.0.0", "Dosya paylaşımı ve ağ taraması(nmap)", true, false, true, true, true, true, true, false));
		pluginList.add(new PluginImpl("remote-access", "1.0.0", "Uzak masaüstü", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("browser", "1.0.0", "Tarayıcı yönetimi", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("disk-quota", "1.0.0", "Kota yönetimi", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("rsyslog", "1.0.0", "Log yönetimi", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("sudoers", "1.0.0", "Uygulama kurma yetkilendirme", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("user-privilege", "1.0.0", "Kullanıcı yetkilendierme ve kısıtlaması", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("ldap", "1.0.0", "Ahenk silme ve taşıma işlemleri", true, false, true, true, false, true, false, false));
		pluginList.add(new PluginImpl("screenshot", "1.0.0", "Ekran görüntüsü", true, false, true, true, true, true, true, false));
		
		
		for (int i = 0; i < pluginList.size(); i++) {
			if (findPluginByName(pluginList.get(i).getName()).isEmpty()) {
				pluginList2.add(pluginList.get(i));
			}
		}
		pluginRepository.saveAll(pluginList2);
		
//		insert plugin_task to c_plugin_task table
		List<PluginTask> pluginTaskList = new ArrayList<>();
		List<PluginTask> pluginTaskList2 = new ArrayList<>();
		
//		String name(1), String page(2), String description(3), String command_id(4), Boolean is_multi(5), PluginImpl plugin_id(6), Integer state(7)
		
		pluginTaskList.add(new PluginTask("Conky Mesajı Gönder", "conky", "İstemciye dinamik olarak conky mesajı gönderir", "EXECUTE_CONKY", true, findPluginIdByName("conky"), 1));
		pluginTaskList.add(new PluginTask("Anlık Mesaj Gönder", "xmessage", "İstemciye anlık olarak mesaj gönderir", "EXECUTE_XMESSAGE", true, findPluginIdByName("conky"), 1));
		pluginTaskList.add(new PluginTask("Kaynak Kullanımı", "resource-usage", "Anlık kaynak kullanımı bilgilerini getirir", "RESOURCE_INFO_FETCHER", false, findPluginIdByName("resource-usage"), 1));
		pluginTaskList.add(new PluginTask("Root Parolası Yönetimi", "manage-root", "Root parolasını değiştirir veya root kullanıcısını kilitler", "SET_ROOT_PASSWORD", true, findPluginIdByName("manage-root"), 1));
		pluginTaskList.add(new PluginTask("Paket Depo Yönetimi", "repositories", "İstemcide bulunan paket depolarını yönetir", "REPOSITORIES", false, findPluginIdByName("package-manager"), 1));
		pluginTaskList.add(new PluginTask("Oturum ve Güç Yönetimi", "end-sessions", "İstemcide bulunan açık oturumları sonlandırır, istemciyi kapatır veya yeniden başlatır", "MANAGE", true, findPluginIdByName("login-manager"), 1));
		pluginTaskList.add(new PluginTask("İstemci Paketlerini Listele ve Kaldır", "package-management", "İstemciye bulunan yüklü paketleri listeler ve kaldırır", "PACKAGE_MANAGEMENT", false, findPluginIdByName("package-manager"), 1));
		pluginTaskList.add(new PluginTask("Paket Kur veya Kaldır", "packages", "İstenilen paket deposundan istemciye paket kurar", "PACKAGES", true, findPluginIdByName("package-manager"), 1));
		pluginTaskList.add(new PluginTask("Servis Yönetimi", "service-list", "İstemciye bulunan servisleri listeler ve yönetir", "SERVIS_LIST", false, findPluginIdByName("service"), 1));
		pluginTaskList.add(new PluginTask("Betik Çalıştır", "execute-script", "İstemcide betik çalıştırı", "EXECUTE_SCRIPT", true, findPluginIdByName("script"), 1));
		pluginTaskList.add(new PluginTask("ETA Mesaj Gönder", "eta-notify", "ETA mesaj gönderir", "ETA_NOTIFY", true, findPluginIdByName("notify"), 0));
		pluginTaskList.add(new PluginTask("Dosya Yönetimi", "file-management", "İstemciye bulunan dosya içeriğini getirir ve düzenler veya istemcide istenilen dosyayı oluşturur", "GET_FILE_CONTENT", false, findPluginIdByName("file-management"), 1));
		pluginTaskList.add(new PluginTask("Uygulama Sınırlı Erişim Yönetimi", "application-restriction", "ETA uygulama kısıtlama", "APPLICATION_RESTRICTION", false, findPluginIdByName("system-restriction"), 0));
		pluginTaskList.add(new PluginTask("Yerel Kullanıcı Yönetimi", "local-user", "İstemciye bulunan yerel kullanıcıları listeler ve yönetir", "GET_USERS", false, findPluginIdByName("local-user"), 1));
		pluginTaskList.add(new PluginTask("İstemci Oturum Açma Ayarları", "ldap-login", "İstemcinin oturum açma ayarlarını yönetir", "EXECUTE_LDAP_LOGIN", true, findPluginIdByName("ldap-login"), 1));
		pluginTaskList.add(new PluginTask("Ağ Yönetimi", "network-manager", "İstemcinin ağ ayarlarını yönetir", "GET_NETWORK_INFORMATION", false, findPluginIdByName("network-manager"), 1));
		pluginTaskList.add(new PluginTask("USB Yönetimi", "usb-management", "İstemcideki aygıtları yönetir", "MANAGE_USB", true, findPluginIdByName("usb"), 1));
		pluginTaskList.add(new PluginTask("Dosya Paylaşımı", "file-transfer", "20 MB kadar dosya paylaşımı sağlar", "MULTIPLE-FILE-TRANSFER", true, findPluginIdByName("network-inventory"), 1));
		pluginTaskList.add(new PluginTask("Uzak Masaüstü", "remote-access", "İstemciye uzak masaüstü erişimi sağlar", "SETUP-VNC-SERVER", false, findPluginIdByName("remote-access"), 1));
		pluginTaskList.add(new PluginTask("Ekran Görüntüsü Al", "screenshot", "İstemcide oturum açmış olan kullanıcının ekran görüntüsünü alır", "TAKE-SCREENSHOT", false, findPluginIdByName("screenshot"), 0));
		
		for (int i = 0; i < pluginTaskList.size(); i++) {
			if (findPluginTaskByPage(pluginTaskList.get(i).getPage()).isEmpty()) {
				pluginTaskList2.add(pluginTaskList.get(i));
			}
		}
		pluginTaskRepository.saveAll(pluginTaskList2);
		
//		insert plugin_profile to c_plugin_profile table
		List<PluginProfile> pluginProfileList = new ArrayList<>();
		List<PluginProfile> pluginProfileList2 = new ArrayList<>();
		
//		String name(1), String page(2), String description(3), String command_id(4), PluginImpl plugin_id(5), Integer state(6)
		pluginProfileList.add(new PluginProfile("Conky Mesaj Profili", "conky-profile", "Conky politika profili", "EXECUTE_CONKY", findPluginIdByName("conky"), 1));
		pluginProfileList.add(new PluginProfile("Betik Profili", "execute-script-profile", "Betik politika profili", "EXECUTE_SCRIPT", findPluginIdByName("script"), 1));
		pluginProfileList.add(new PluginProfile("Ağ Tarayıcı Profili", "browser-profile", "Ağ tarayıcı politika profili", "BROWSER", findPluginIdByName("browser"), 1));
		pluginProfileList.add(new PluginProfile("Disk Kota Profili", "disk-quota-profile", "Disk kota politika profili", "GET_QUOTA", findPluginIdByName("disk-quota"), 1));
		pluginProfileList.add(new PluginProfile("Oturum Yönetimi Profili", "login-manager-profile", "Oturum yönetimi politika profili", "MANAGE", findPluginIdByName("login-manager"), 1));
		pluginProfileList.add(new PluginProfile("Rsyslog Profili", "rsyslog-profile", "Rsyslog politika profili", "CONFIGURE_RSYSLOG", findPluginIdByName("rsyslog"), 1));
		pluginProfileList.add(new PluginProfile("USB Profili", "usb-profile", "USB politika profili", "MANAGE-USB", findPluginIdByName("usb"), 1));
		pluginProfileList.add(new PluginProfile("Kullanıcı Ayrıcalıkları Profili", "user-privilege-profile", "Kullanıcı Ayrıcalıkları Profili", "USER-PRIVILEGE", findPluginIdByName("user-privilege"), 1));
		
		for (int i = 0; i < pluginProfileList.size(); i++) {
			if (findPluginProfileByPage(pluginProfileList.get(i).getPage()).isEmpty()) {
				pluginProfileList2.add(pluginProfileList.get(i));
			}
		}
		pluginProfileRepository.saveAll(pluginProfileList2);
	}
	
	public PluginImpl findPluginIdByName(String name) {
		List<PluginImpl> plugin =  pluginRepository.findByName(name);
		return plugin.get(0);
	}

	public List<PluginImpl> findAllPlugins() {
		List<PluginImpl> pluginList=new ArrayList<>();
		pluginRepository.findAll().forEach(pluginList::add);
		return pluginList ;
	}

	public PluginImpl getPlugin(Long id) {
		return pluginRepository.findOne(id);
	}

	public PluginImpl addPlugin(PluginImpl pluginImpl) {
		return pluginRepository.save(pluginImpl);
	}

	public void deletePlugin(PluginImpl pluginImpl) {
		pluginRepository.delete(pluginImpl);
	}

	public PluginImpl updatePlugin(PluginImpl pluginImpl) {
		return 	pluginRepository.save(pluginImpl);
	}

	public List<PluginImpl> findPluginByNameAndVersion(String name, String version) {
		return pluginRepository.findByNameAndVersion(name, version);
	}

	public List<PluginTask> findAllPluginTask() {
		return pluginTaskRepository.findByState(1);
	}

	public List<PluginProfile> findAllPluginProfile() {
		return pluginProfileRepository.findByState(1);
	}

	public List<PluginImpl>findPluginByName(String name) {
		return pluginRepository.findByName(name);
	}
	
	public List<PluginTask> findPluginTaskByPage(String page) {
		return pluginTaskRepository.findByPage(page);
	}
	
	public List<PluginProfile> findPluginProfileByPage(String page) {
		return pluginProfileRepository.findByPage(page);
	}
}
