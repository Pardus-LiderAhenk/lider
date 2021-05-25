package tr.org.lider.repositories;

import java.util.List;

import tr.org.lider.entities.ProfileImpl;

public interface ProfileRepository extends BaseJpaRepository<ProfileImpl, Long>{
	List<ProfileImpl> findByPluginId(Long plugin);
	List<ProfileImpl> findByPluginIdAndDeleted(Long plugin_id, Boolean deleted);
	
}
