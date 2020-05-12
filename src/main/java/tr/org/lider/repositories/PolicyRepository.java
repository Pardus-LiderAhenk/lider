package tr.org.lider.repositories;

import java.util.List;

import tr.org.lider.entities.PolicyImpl;

public interface PolicyRepository extends BaseJpaRepository<PolicyImpl, Long>{

	List<PolicyImpl> findAllByDeleted(Boolean deleted);

}
