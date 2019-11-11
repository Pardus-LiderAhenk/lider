package tr.org.lider.repositories;

import java.util.List;

import tr.org.lider.entities.AgentImpl;



public interface AgentRepository extends BaseJpaRepository<AgentImpl, Long>{
	
	List<AgentImpl> findByJid(String jid);
}
