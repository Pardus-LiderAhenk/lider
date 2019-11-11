package tr.org.lider.repositories;

import java.util.List;

import tr.org.lider.entities.CommandImpl;
import tr.org.lider.entities.TaskImpl;

/**
 *
 */
public interface CommandRepository extends BaseJpaRepository<CommandImpl, Long>{

	List<CommandImpl> findByTask(TaskImpl task );
}
