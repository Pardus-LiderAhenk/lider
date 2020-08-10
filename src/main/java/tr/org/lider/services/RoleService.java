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
		roleList.add(new RoleImpl("Kullanıcı Yönetimi", "ROLE_USERS", 10));
		roleList.add(new RoleImpl("İstemci Yönetimi", "ROLE_COMPUTERS", 20));
		roleList.add(new RoleImpl("Kullanıcı Grup Yönetimi", "ROLE_USER_GROUPS", 30));
		roleList.add(new RoleImpl("İstemci Grup Yönetimi", "ROLE_COMPUTER_GROUPS", 40));
		roleList.add(new RoleImpl("Kullanıcı Yetkilendirme(Sudo)", "ROLE_SUDO_GROUPS", 50));
		roleList.add(new RoleImpl("Detaylı İstemci Raporu", "ROLE_AGENT_INFO", 60));
		roleList.add(new RoleImpl("Betik Tanımları", "ROLE_SCRIPT_DEFINITION", 70));
		roleList.add(new RoleImpl("ETA Mesaj Tanımları", "ROLE_NOTIFY_DEFINITION", 80));
		roleList.add(new RoleImpl("Sistem Gözlemcisi Tanımları", "ROLE_CONKY_DEFINITION", 90));
		roleList.add(new RoleImpl("Kayıt Şablonları", "ROLE_REGISTRATION_TEMPLATE", 100));
		roleList.add(new RoleImpl("Ayarlar", "ROLE_SETTINGS", 110));
		roleList.add(new RoleImpl("Tüm Yetkiler(Admin)", "ROLE_ADMIN", 120));
		roleRepository.saveAll(roleList);
	}

	public RoleImpl saveRole(RoleImpl role) {
		return roleRepository.save(role);
	}

	public List<RoleImpl> getRoles() {
		return roleRepository.findAllByOrderByOrderNumberAsc();
	}

}
