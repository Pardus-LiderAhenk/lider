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
	
	
	/*
	 * 	private static final String EXECUTED_DEVICE_TASKS = 
			"SELECT c.task, ce, c.commandOwnerUid "
			+ "FROM CommandImpl c "
			+ "LEFT OUTER JOIN c.commandExecutions ce "
			+ "LEFT OUTER JOIN c.task t "
			+ "WHERE ce.uid =:uidClean "
			+ "AND c.task IS NOT NULL "
			+ "AND c.uidListJsonString LIKE :uid   "
			+ "ORDER BY c.createDate DESC";
	 */
//	@Query("SELECT c FROM CommandImpl c LEFT OUTER JOIN "
//			+ "c.commandExecutions ce on c.id=ce.command WHERE ce.dn = ?1")
	@Query("SELECT c.task, ce, c.commandOwnerUid, c.id "
			+ "FROM CommandImpl c "
			+ "LEFT OUTER JOIN c.commandExecutions ce "
			+ "LEFT OUTER JOIN c.task t "
			+ "WHERE ce.dn =?1 "
			+ "AND c.task IS NOT NULL "
			+ "ORDER BY c.createDate DESC")
	List<Object[]> test(String dn);
}
