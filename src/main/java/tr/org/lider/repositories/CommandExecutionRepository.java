package tr.org.lider.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.Query;

import tr.org.lider.entities.CommandExecutionImpl;

/**
 *
 */
public interface CommandExecutionRepository extends BaseJpaRepository<CommandExecutionImpl, Long>{
	
	
	@Query("SELECT DISTINCT ce FROM CommandImpl c INNER JOIN "
			+ "c.commandExecutions ce INNER JOIN c.task t WHERE ce.uid = ?1 AND t.id = ?2")
	List<CommandExecutionImpl> findCommandExecutionByTaskAndUid(String uid, Long taskId);

}
