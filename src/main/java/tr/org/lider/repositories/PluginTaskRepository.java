package tr.org.lider.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import tr.org.lider.entities.PluginProfile;
import tr.org.lider.entities.PluginTask;


public interface PluginTaskRepository extends BaseJpaRepository<PluginTask, Long>{
	
	List<PluginTask> findByState(int state);
	List<PluginTask> findByPage(String page);
	List<PluginTask> findByCommandId(String commandId);
}
