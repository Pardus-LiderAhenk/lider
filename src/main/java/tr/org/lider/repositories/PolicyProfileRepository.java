package tr.org.lider.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.Query;

import tr.org.lider.entities.PolicyImpl;

public interface PolicyProfileRepository extends BaseJpaRepository<PolicyImpl, Long>{
	
	@Query(value = "SELECT p FROM PolicyImpl p LEFT JOIN p.profiles s WHERE s.id = ?1")
	List<PolicyImpl> findAllByProfileId(Long id);
}
