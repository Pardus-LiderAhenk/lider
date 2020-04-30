package tr.org.lider.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import tr.org.lider.entities.PluginProfile;;



public interface PluginProfileRepository extends BaseJpaRepository<PluginProfile, Long>{
	
	List<PluginProfile> findByState(int state);
}
