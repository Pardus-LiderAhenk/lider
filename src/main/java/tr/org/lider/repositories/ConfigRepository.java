package tr.org.lider.repositories;

import java.util.Optional;

import tr.org.lider.entities.ConfigImpl;

public interface ConfigRepository extends BaseJpaRepository<ConfigImpl, Long>{
	Optional<ConfigImpl> findByName(String name);
	Optional<ConfigImpl> findByValue(String value);
	Optional<ConfigImpl> findByNameAndValue(String name, String value);
	void deleteByName(String name);
}

