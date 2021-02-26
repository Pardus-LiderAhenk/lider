package tr.org.lider.services;

import java.util.ArrayList;
import java.util.List;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.RoleImpl;
import tr.org.lider.repositories.RoleRepository;

@Service
public class RoleService {

	@Autowired
	RoleRepository roleRepository;

	@PostConstruct
	public void init() throws Exception {
		roleRepository.deleteAll();
		List<RoleImpl> roleList = new ArrayList<>();
		roleList.add(new RoleImpl("Konsol Yetkisi(Konsol Erişim Yetkisi)", "ROLE_USER", 0));
		roleList.add(new RoleImpl("İstemci Yönetimi", "ROLE_COMPUTERS", 10));
		
		roleList.add(new RoleImpl("Kullanıcı İşlemleri", "ROLE_USERS", 20));
		roleList.add(new RoleImpl("AD Senkronizasyon", "ROLE_AD_SYNC", 30));
		
		roleList.add(new RoleImpl("Kullanıcı Grup Yönetimi", "ROLE_USER_GROUPS", 40));
		roleList.add(new RoleImpl("İstemci Grup Yönetimi", "ROLE_COMPUTER_GROUPS", 50));
		roleList.add(new RoleImpl("Kullanıcı Yetkilendirme(Sudo)", "ROLE_SUDO_GROUPS", 60));
		roleList.add(new RoleImpl("Politika Yönetimi", "ROLE_POLICY", 70));
		
		roleList.add(new RoleImpl("Detaylı İstemci Raporu", "ROLE_AGENT_INFO", 80));
		roleList.add(new RoleImpl("Çalıştırılan Görevler Raporu", "ROLE_EXECUTED_TASK", 82));
		roleList.add(new RoleImpl("Sistem Güncesi Raporu", "ROLE_OPERATION_LOG", 84));
		
		roleList.add(new RoleImpl("Arayüz Erişim Ayarları", "ROLE_CONSOLE_ACCESS_SETTINGS", 90));
		roleList.add(new RoleImpl("Sunucu Ayarları", "ROLE_SERVER_SETTINGS", 95));
		roleList.add(new RoleImpl("Sistem Gözlemcisi Tanımları", "ROLE_CONKY_DEFINITION", 100));
		roleList.add(new RoleImpl("Betik Tanımları", "ROLE_SCRIPT_DEFINITION", 110));
		roleList.add(new RoleImpl("ETA Mesaj Tanımları", "ROLE_ETA_MESSAGE_DEFINITION", 120));
		roleList.add(new RoleImpl("Kayıt Şablonları", "ROLE_REGISTRATION_TEMPLATE", 130));
		

		roleList.add(new RoleImpl("Tüm Yetkiler(Admin)", "ROLE_ADMIN", 140));
		roleRepository.saveAll(roleList);
	}

	public RoleImpl saveRole(RoleImpl role) {
		return roleRepository.save(role);
	}

	public List<RoleImpl> getRoles() {
		return roleRepository.findAllByOrderByOrderNumberAsc();
	}

}
