package tr.org.lider.repositories;

import java.util.Optional;

import tr.org.lider.entities.ForgotPasswordImpl;

public interface ForgotPasswordRepository extends BaseJpaRepository<ForgotPasswordImpl, Long>{
	public Optional<ForgotPasswordImpl> findByUsername(String username);
	public Optional<ForgotPasswordImpl> findByResetUID(String uuid);
	public void deleteByUsername(String username);
}

