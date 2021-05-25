package tr.org.lider.repositories;

import java.util.List;

import tr.org.lider.entities.UserSessionImpl;



public interface AgentUserSessionRepository extends BaseJpaRepository<UserSessionImpl, Long>{

	List<UserSessionImpl> findByUsername(String username);
}

