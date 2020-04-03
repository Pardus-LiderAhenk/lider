package tr.org.lider.services;

import java.util.List;
import java.util.Optional;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.RoleImpl;
import tr.org.lider.repositories.RoleRepository;

@Service
public class RoleService {

	@Autowired
	RoleRepository roleRepository;
	
	@Autowired
	MenuService menuService;
	
	@PostConstruct
	public void init() throws Exception {
		menuService.init();
		if(roleRepository.countByName("ROLE_ADMIN") == 0) {
			roleRepository.save(new RoleImpl("ROLE_ADMIN", null));
		}
		
		if(roleRepository.countByName("ROLE_USER") == 0) {
			roleRepository.save(new RoleImpl("ROLE_USER", null));
			
		}
		if(roleRepository.countByName("ROLE_HASAN") == 0) {
			roleRepository.save(new RoleImpl("ROLE_HASAN", menuService.getMenuList()));
			
		} 
	}
	
	public RoleImpl saveRole(RoleImpl role) {
		return roleRepository.save(role);
	}
	
	public Boolean deleteRole(Long id) {
		Optional<RoleImpl> entry = roleRepository.findById(id);
		if(entry.isPresent()) {
			RoleImpl role = entry.get();
			if(!role.getName().equals("ROLE_ADMIN") && !role.getName().equals("ROLE_USER")) {
				role.setMenus(null);
				roleRepository.save(role);
				roleRepository.deleteById(id);
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}
	
	public RoleImpl findRoleByName(String roleName) {
		List<RoleImpl> listRole = roleRepository.findAllByName(roleName);
		if(listRole != null && listRole.size() > 0) {
			return listRole.get(0);
		} else {
			return null;
		}
	}
	
	public List<RoleImpl> getRoles() {
		return roleRepository.findAll();
	}
	
}
