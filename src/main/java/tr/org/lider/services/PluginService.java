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

		pluginList.add(new PluginImpl("conky", "1.0.0", "Masaüstü mesaj yönetimi", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("resource-usage", "1.0.0", "Kaynak kullanımı", true, false, true, false, false, true, false, false));
		pluginList.add(new PluginImpl("package-manager", "1.0.0", "Paket yönetimi", true, false, true, true, true, true, true, false));
		pluginList.add(new PluginImpl("manage-root", "1.0.0", "Root parola yönetimi", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("login-manager", "1.0.0", "Oturum yönetimi", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("service", "1.0.0", "Servis yönetimi", true, false, true, true, true, true, true, false));
		pluginList.add(new PluginImpl("script", "1.0.0", "Betik çalıştır", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("notify", "1.0.0", "ETA bilgilendirme mesajı", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("file-management", "1.0.0", "Dosya Yönetimi", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("local-user", "1.0.0", "Yerel kullanıcı yönetimi", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("system-restriction", "1.0.0", "Kullanıcı ve uygulama kısıtlamaları yönetimi", true, false, true, true, true, true, true, false));
		pluginList.add(new PluginImpl("ldap-login", "1.0.0", "LDAP oturum açma ve iptal etme ayarları", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("network-manager", "1.0.0", "Ağ yönetimi", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("usb", "1.0.0", "I/O yönetimi", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("network-inventory", "1.0.0", "Dosya paylaşımı", true, false, true, true, true, true, true, false));
		pluginList.add(new PluginImpl("remote-access", "1.0.0", "Uzak masaüstü", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("browser", "1.0.0", "Tarayıcı yönetimi", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("disk-quota", "1.0.0", "Kota yönetimi", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("rsyslog", "1.0.0", "Log yönetimi", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("sudoers", "1.0.0", "Uygulama kurma yetkilendirme", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("user-privilege", "1.0.0", "Kullanıcı yetkilendierme ve kısıtlaması", true, false, true, true, true, true, false, false));
		pluginList.add(new PluginImpl("ldap", "1.0.0", "İstemci silme, ad değiştirme ve taşıma işlemleri", true, false, true, true, false, true, false, false));
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
//		conky plugin tasks
		pluginTaskList.add(new PluginTask("Sistem Gözlemcisi Görevi", "conky", "İstemciye dinamik olarak conky mesajı gönderir veya kaldırır", "EXECUTE_CONKY", true, findPluginIdByName("conky"), 1));
		pluginTaskList.add(new PluginTask("Anlık Mesaj Gönder", "xmessage", "İstemciye anlık olarak mesaj gönderir", "EXECUTE_XMESSAGE", true, findPluginIdByName("conky"), 1));
//		disk-quota plugin task
//		pluginTaskList.add(new PluginTask("Kota Bilgileri Görüntüle", "get-quota", "Kota bilgilerini görüntüler", "GET_QUOTA", false, findPluginIdByName("disk-quota"), 0));
//		file-management plugin tasks
		pluginTaskList.add(new PluginTask("Dosya İçeriği Görüntüle", "file-management", "İstemcide bulunan dosya içeriğini getirir", "GET_FILE_CONTENT", false, findPluginIdByName("file-management"), 1));
		pluginTaskList.add(new PluginTask("Dosya İçeriği Düzenle", "write-to-file", "İstemcide belirtilen dosyanın içeriğini düzenler", "WRITE_TO_FILE", false, findPluginIdByName("file-management"), 0));
//		ldap-login plugin tasks
		pluginTaskList.add(new PluginTask("OpenLDAP Oturum Açma Ayarları Uygula", "ldap-login", "İstemcide OpenLDAP ayarlarını uygular", "EXECUTE_LDAP_LOGIN", true, findPluginIdByName("ldap-login"), 1));
		pluginTaskList.add(new PluginTask("AD Oturum Açma Ayarları Uygula", "ad-login", "İstemcide AD ayarlarını uygular", "EXECUTE_AD_LOGIN", true, findPluginIdByName("ldap-login"), 0));
		pluginTaskList.add(new PluginTask("Oturum Açma Ayarları İptal Et", "cancel-ldap-login", "İstemcinin oturum açma ayarlarını iptal eder", "EXECUTE_CANCEL_LDAP_LOGIN", true, findPluginIdByName("ldap-login"), 0));
//		ldap plugin tasks
		pluginTaskList.add(new PluginTask("İstemci Sil", "delete-agent", "İstemciyi siler", "DELETE_AGENT", true, findPluginIdByName("ldap"), 0));
		pluginTaskList.add(new PluginTask("İstemci Taşı", "move-agent", "İstemciyi taşır", "MOVE_AGENT", true, findPluginIdByName("ldap"), 0));
		pluginTaskList.add(new PluginTask("İstemci Adını Değiştir", "rename-agent", "İstemci adını değiştirir", "RENAME_AGENT", true, findPluginIdByName("ldap"), 0));
//		local-user plugin tasks
		pluginTaskList.add(new PluginTask("Yerel Kullanıcıları Listele", "local-user", "İstemciye bulunan yerel kullanıcıları listeler", "GET_USERS", false, findPluginIdByName("local-user"), 1));
		pluginTaskList.add(new PluginTask("Yerel Kullanıcı Ekle", "add-local-user", "İstemciye yerel kullanıcı ekler", "ADD_USER", false, findPluginIdByName("local-user"), 0));
		pluginTaskList.add(new PluginTask("Yerel Kullanıcı Sil", "delete-local-user", "İstemcide bulunan seçilen yerel kullanıcıyı siler", "DELETE_USER", false, findPluginIdByName("local-user"), 0));
		pluginTaskList.add(new PluginTask("Yerel Kullanıcı Düzenle", "edit-local-user", "İstemcide bulunan seçilen yerel kullanıcı düzenler", "EDIT_USER", false, findPluginIdByName("local-user"), 0));
//		login-manager plugin tasks
		pluginTaskList.add(new PluginTask("Oturumları Sonlandır", "end-sessions", "İstemcide bulunan açık oturumları sonlandırır", "MANAGE", true, findPluginIdByName("login-manager"), 1));
		pluginTaskList.add(new PluginTask("İstemciyi Yeniden Başlat", "machine-restart", "İstemciyi yeniden başlatır", "MACHINE_RESTART", true, findPluginIdByName("login-manager"), 0));
		pluginTaskList.add(new PluginTask("İstemciyi Kapat", "machine-shutdown", "İstemciyi kapatır", "MACHINE_SHUTDOWN", true, findPluginIdByName("login-manager"), 0));
//		manage-root plugin task
		pluginTaskList.add(new PluginTask("Root Parolası Değiştir veya Kilitle", "manage-root", "Root parolasını değiştirir veya root kullanıcısını kilitler", "SET_ROOT_PASSWORD", true, findPluginIdByName("manage-root"), 1));
//		network-inventory plugin tasks
		pluginTaskList.add(new PluginTask("Dosya Paylaşımı", "file-transfer", "20 MB kadar dosya paylaşımı sağlar", "MULTIPLE-FILE-TRANSFER", true, findPluginIdByName("network-inventory"), 1));
//		network-manager plugin tasks
		pluginTaskList.add(new PluginTask("Ağ Bilgilerini Getir", "network-manager", "İstemcinin ağ bilgilerini getirir", "GET_NETWORK_INFORMATION", false, findPluginIdByName("network-manager"), 1));
		pluginTaskList.add(new PluginTask("DNS Kaydı Ekle", "add-dns", "İstemciye DNS kaydı ekler", "ADD_DNS", false, findPluginIdByName("network-manager"), 0));
		pluginTaskList.add(new PluginTask("Alan Adı Ekle", "add-domain", "İstemciye alan adı ekler", "ADD_DOMAIN", false, findPluginIdByName("network-manager"), 0));
		pluginTaskList.add(new PluginTask("Sunucu(Host) Ekle", "add-host", "İstemciye sunucu kaydı ekler", "ADD_HOST", false, findPluginIdByName("network-manager"), 0));
		pluginTaskList.add(new PluginTask("Ağ Ayarı Ekle", "add-network", "Yeni ağ ayarı ekler", "ADD_NETWORK", false, findPluginIdByName("network-manager"), 0));
		pluginTaskList.add(new PluginTask("Port İzin Ver", "allow-port", "Seçilen porta izin verir", "ALLOW_PORT", false, findPluginIdByName("network-manager"), 0));
//		pluginTaskList.add(new PluginTask("İstemci Adı Değiştir", "change-hostname", "İstemci adını değiştirir", "CHANGE_HOSTNAME", false, findPluginIdByName("network-manager"), 0));
		pluginTaskList.add(new PluginTask("DNS Kaydı Sil", "delete-dns", "İstemcide DNS kaydı siler", "DELETE_DNS", false, findPluginIdByName("network-manager"), 0));
		pluginTaskList.add(new PluginTask("Alan Adı Sil", "delete-domain", "İstemcide bulunan alan adını siler", "DELETE_DOMAIN", false, findPluginIdByName("network-manager"), 0));
		pluginTaskList.add(new PluginTask("Sunucu(Host) Sil", "delete-host", "İstemcide bulunan sunucu kaydını siler", "DELETE_HOST", false, findPluginIdByName("network-manager"), 0));
		pluginTaskList.add(new PluginTask("Ağ Ayarı Sil", "delete-network", "İstemcide bulunan ağ ayarını siler", "DELETE_NETWORK", false, findPluginIdByName("network-manager"), 0));
		pluginTaskList.add(new PluginTask("Port Engelle", "block-port", "Seçilen portu engeller", "BLOCK_PORT", false, findPluginIdByName("network-manager"), 0));
//		package management plugin tasks
		pluginTaskList.add(new PluginTask("Paket Depolarını Getir", "repositories", "İstemcide bulunan paket depolarını listeler", "REPOSITORIES", false, findPluginIdByName("package-manager"), 1));
		pluginTaskList.add(new PluginTask("Paket Deposu Ekle veya Sil", "package-sources", "İstemcide bulunan paket deposunu siler veya yeni depo ekler", "PACKAGE_SOURCES", false, findPluginIdByName("package-manager"), 0));
		pluginTaskList.add(new PluginTask("Paket Kaldır", "package-management", "İstemcide bulunan paket veya paketleri kaldırır", "PACKAGE_MANAGEMENT", false, findPluginIdByName("package-manager"), 1));
		pluginTaskList.add(new PluginTask("Paket Kur veya Kaldır", "packages", "İstenilen paket deposundan istemciye paket kurar veya seçilen paket veya paketleri kaldırır", "PACKAGES", true, findPluginIdByName("package-manager"), 1));
		pluginTaskList.add(new PluginTask("İsmcideki Paketleri Listele", "installed-packages", "İstemcide bulunan paketleri listeler", "INSTALLED_PACKAGES", false, findPluginIdByName("package-manager"), 0));
//		pluginTaskList.add(new PluginTask("Paket Kontrol Et", "check-package", "Paket kontrol eder", "CHECK_PACKAGE", false, findPluginIdByName("package-manager"), 0));
//		remote-access plugin task 
		pluginTaskList.add(new PluginTask("Uzak Masaüstü", "remote-access", "İstemciye uzak masaüstü erişimi sağlar", "SETUP-VNC-SERVER", false, findPluginIdByName("remote-access"), 1));
//		resource-usage plugin tasks
		pluginTaskList.add(new PluginTask("Kaynak Kullanımı", "resource-usage", "Anlık kaynak kullanımı bilgilerini getirir", "RESOURCE_INFO_FETCHER", false, findPluginIdByName("resource-usage"), 1));
		pluginTaskList.add(new PluginTask("İstemci Bilgilerini Güncelle", "agent-info", "İstemci bilgilerini günceller", "AGENT_INFO", false, findPluginIdByName("resource-usage"), 0));
//		pluginTaskList.add(new PluginTask("Kaynak Kullanımı İzle", "resource-info-alert", "Kaynak kullanımını izle", "RESOURCE_INFO_ALERT", false, findPluginIdByName("resource-usage"), 0));
//		script plugin task
		pluginTaskList.add(new PluginTask("Betik Çalıştır", "execute-script", "İstemcide betik çalıştırır", "EXECUTE_SCRIPT", true, findPluginIdByName("script"), 1));
//		service plugin tasks
		pluginTaskList.add(new PluginTask("Servisleri Yönet", "service-list", "İstemcide bulunan servisleri yönetir", "SERVICE_LIST", false, findPluginIdByName("service"), 1));
		pluginTaskList.add(new PluginTask("Servisleri Listele", "get-services", "İstemcide bulunan servisleri listeler", "GET_SERVICES", false, findPluginIdByName("service"), 0));
//		pluginTaskList.add(new PluginTask("Servisleri İzle", "service-management", "İstemcide bulunan servisleri izler", "SERVICE_MANAGEMENT", false, findPluginIdByName("service"), 0));
		pluginTaskList.add(new PluginTask("USB Yönetimi", "usb-management", "İstemcideki aygıtları yönetir", "MANAGE_USB", true, findPluginIdByName("usb"), 1));
		pluginTaskList.add(new PluginTask("ETA Mesajı Gönder", "eta-notify", "ETA mesaj gönderir", "ETA_NOTIFY", true, findPluginIdByName("notify"), 0));
		pluginTaskList.add(new PluginTask("Uygulama Sınırlı Erişim Yönetimi", "application-restriction", "ETA uygulama kısıtlama", "APPLICATION_RESTRICTION", false, findPluginIdByName("system-restriction"), 0));
		pluginTaskList.add(new PluginTask("ETA-Uygulama Listeleme", "installed-application", "ETA uygulama listeleme", "INSTALLED_APPLICATIONS", false, findPluginIdByName("system-restriction"), 0));
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
		pluginProfileList.add(new PluginProfile("Sistem Gözlemcisi Ayarı", "conky-profile", "Sistem gözlemcisi politika ayarı", "EXECUTE_CONKY", findPluginIdByName("conky"), 1));
		pluginProfileList.add(new PluginProfile("Betik Ayarı", "execute-script-profile", "Betik politika ayarı", "EXECUTE_SCRIPT", findPluginIdByName("script"), 1));
		pluginProfileList.add(new PluginProfile("Ağ Tarayıcı Ayarı", "browser-profile", "Ağ tarayıcı politika ayarı", "BROWSER", findPluginIdByName("browser"), 1));
		pluginProfileList.add(new PluginProfile("Disk Kota Ayarı", "disk-quota-profile", "Disk kota politika ayarı", "GET_QUOTA", findPluginIdByName("disk-quota"), 1));
		pluginProfileList.add(new PluginProfile("Oturum Yönetimi Ayarı", "login-manager-profile", "Oturum yönetimi politika ayarı", "MANAGE", findPluginIdByName("login-manager"), 1));
		pluginProfileList.add(new PluginProfile("Rsyslog Ayarı", "rsyslog-profile", "Rsyslog politika ayarı", "CONFIGURE_RSYSLOG", findPluginIdByName("rsyslog"), 1));
		pluginProfileList.add(new PluginProfile("USB Ayarı", "usb-profile", "USB politika ayarı", "MANAGE-USB", findPluginIdByName("usb"), 1));
		pluginProfileList.add(new PluginProfile("Kullanıcı Ayrıcalıkları Ayarı", "user-privilege-profile", "Kullanıcı ayrıcalıkları ayarı", "USER-PRIVILEGE", findPluginIdByName("user-privilege"), 1));
		
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
