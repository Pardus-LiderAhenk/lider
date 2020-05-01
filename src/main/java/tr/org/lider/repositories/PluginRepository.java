package tr.org.lider.repositories;

import java.util.List;
import java.util.Optional;

import tr.org.lider.entities.PluginImpl;


/**
 *
 */
public interface PluginRepository extends BaseJpaRepository<PluginImpl, Long>{

	List<PluginImpl> findByNameAndVersion(String name, String version);
	List<PluginImpl> findByName(String name);
	
}
