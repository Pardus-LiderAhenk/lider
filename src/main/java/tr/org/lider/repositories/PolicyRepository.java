package tr.org.lider.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.Query;

import tr.org.lider.entities.PolicyImpl;

public interface PolicyRepository extends BaseJpaRepository<PolicyImpl, Long>{

	List<PolicyImpl> findAllByDeleted(Boolean deleted);
	
	@Query("SELECT pol, ce, c "
			+ "FROM CommandImpl c "
			+ "INNER JOIN c.commandExecutions ce "
			+ "INNER JOIN c.policy pol "
			+ "WHERE ce.dn =?1 "
			+ "AND c.policy IS NOT NULL "
			+ "ORDER BY c.createDate DESC")
	List<Object[]> findPoliciesByGroupDn(String groupDn);
}
