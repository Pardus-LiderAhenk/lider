package tr.org.lider.repositories;

import java.util.List;

import tr.org.lider.entities.PluginProfile;;


public interface PluginProfileRepository extends BaseJpaRepository<PluginProfile, Long>{
	
	List<PluginProfile> findByState(int state);
	List<PluginProfile> findByPage(String page);
}
