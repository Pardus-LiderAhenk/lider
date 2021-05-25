package tr.org.lider.repositories;

import java.util.List;

import org.springframework.stereotype.Repository;

import tr.org.lider.entities.RoleImpl;

@Repository
public interface RoleRepository extends BaseJpaRepository<RoleImpl, Long>{
	List<RoleImpl> findAllByName(String name);
	RoleImpl findByName(String name);
	Long countByName(String name);
	List<RoleImpl> findAllByOrderByOrderNumberAsc();
}

