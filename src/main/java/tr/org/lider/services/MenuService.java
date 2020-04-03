package tr.org.lider.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.MenuImpl;
import tr.org.lider.repositories.MenuRepository;

/**
 * Service for adding all menu items statically and init it when application starts
 * 
 * @author <a href="mailto:hasan.kara@pardus.org.tr">Hasan Kara</a>
 * 
 */

@Service
public class MenuService {

	@Autowired
	MenuRepository menuRepository;
	
	private static Logger logger = LoggerFactory.getLogger(MenuService.class);
	
	private List<MenuImpl> menuList;
	
	public void init() throws Exception {
		logger.info("Menu service initialization is started");
		
		menuList = new  ArrayList<>();
		menuList.add(new MenuImpl("İstemci Yönetimi", "computers", ""));
		menuList.add(new MenuImpl("Kullanıcı Yönetimi", "users", ""));
		menuList.add(new MenuImpl("Grup Yönetimi", "groups", ""));
		menuList.add(new MenuImpl("Kullanıcı Grup Yönetimi", "user_groups", "groups"));
		menuList.add(new MenuImpl("İstemci Grup Yönetimi", "computer_groups", "groups"));
		menuList.add(new MenuImpl("Kullanıcı Yetkilendirme(Sudo)", "sudo_groups", "groups"));
		menuList.add(new MenuImpl("Raporlar", "reports", ""));
		menuList.add(new MenuImpl("Detaylı İstemci Raporu", "agent_info", "reports"));
		menuList.add(new MenuImpl("Tanımlar", "definitions", ""));
		menuList.add(new MenuImpl("Betik Tanımları", "script_definitions", "definitions"));
		menuList.add(new MenuImpl("ETA Mesaj Tanımları", "eta_definitions", "definitions"));
		menuList.add(new MenuImpl("Conky Tanımları", "conky_definitions", "definitions"));
		menuList.add(new MenuImpl("Kayıt Şablonları", "registration_templates", "definitions"));
		menuList.add(new MenuImpl("Ayarlar", "settings", ""));
		
		if(menuRepository.count() != 0) {
			//check if there is difference between db and menuList
			//if there are deleted entries find deleted list 
			//and delete them from database
			List<String> menuPageNameList = new ArrayList<>();
			for (int i = 0; i < menuList.size(); i++) {
				menuPageNameList.add(menuList.get(i).getMenuPageName());
			}
			List<MenuImpl> deletedMenuList = menuRepository.findAllByMenuPageNameNotIn(menuPageNameList);
			if(deletedMenuList.size() > 0) {
				for (int i = 0; i < deletedMenuList.size(); i++) {
					menuRepository.delete(deletedMenuList.get(i));
				}
			}
			
			//if there are newly added menu item that does not exists in database
			//find them and add to database
			List<MenuImpl> allMenuListInDB = menuRepository.findAll();
			for (int i = 0; i < menuList.size(); i++) {
				Boolean isMenuExistsInDB = false;
				for (int j = 0; j < allMenuListInDB.size(); j++) {
					if(menuList.get(i).getMenuPageName().equals(allMenuListInDB.get(j).getMenuPageName())) {
						isMenuExistsInDB = true;
						break;
					}
				}
				if(isMenuExistsInDB == false) {
					menuRepository.save(menuList.get(i));
				}
			}
			
			//if only menuName or parentMenuPageName is changed, edit that on db
			//if menu page name is changed that will be add to db as new record because it is unique
			for (int i = 0; i < menuList.size(); i++) {
				List<MenuImpl> mList = menuRepository.findAllByMenuNameAndParentMenuPageName(menuList.get(i).getMenuName(), menuList.get(i).getParentMenuPageName());
				//menuName or parentMenuPageName has been changed update them on db
				if(mList != null && mList.size() == 0) {
					Optional<MenuImpl> m = menuRepository.findAllByMenuPageName(menuList.get(i).getMenuPageName());
					if(m.isPresent()) {
						m.get().setMenuName(menuList.get(i).getMenuName());
						m.get().setParentMenuPageName(menuList.get(i).getParentMenuPageName());
						menuRepository.save(m.get());
					}
				}
			}
		} else {
			//no menu is added to db add menuList arraylist to db
			menuRepository.saveAll(menuList);
		}
	}
	
	public List<MenuImpl> getMenuList() {
		return menuRepository.findAll();
	}
}
