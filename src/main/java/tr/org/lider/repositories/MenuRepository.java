package tr.org.lider.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import tr.org.lider.entities.MenuImpl;

@Repository
public interface MenuRepository extends BaseJpaRepository<MenuImpl, Long>{
	public Optional<MenuImpl> findAllByMenuPageName(String menuPageName);
	public List<MenuImpl> findAllByMenuNameAndMenuPageName(String menuName, String menuPageName);
	public List<MenuImpl> findAllByMenuPageNameNotIn(List<String> menuPageNameList);
	public List<MenuImpl> findAllByMenuNameAndParentMenuPageName(String menuName, String parentMenuPageName);
}

