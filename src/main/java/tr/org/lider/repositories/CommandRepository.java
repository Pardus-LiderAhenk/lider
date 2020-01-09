package tr.org.lider.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.Query;

import tr.org.lider.entities.CommandImpl;
import tr.org.lider.entities.TaskImpl;

/**
 *
 */
public interface CommandRepository extends BaseJpaRepository<CommandImpl, Long>{

	List<CommandImpl> findByTask(TaskImpl task );
	List<CommandImpl> findAllByDnListJsonStringContaining(String dnListJsonString);

	@Query("SELECT c.task, ce, c.commandOwnerUid, c.id "
			+ "FROM CommandImpl c "
			+ "LEFT OUTER JOIN c.commandExecutions ce "
			+ "LEFT OUTER JOIN c.task t "
			+ "WHERE ce.dn =?1 "
			+ "AND c.task IS NOT NULL "
			+ "ORDER BY c.createDate DESC")
	List<Object[]> findCommandsOfAgent(String dn);
}
