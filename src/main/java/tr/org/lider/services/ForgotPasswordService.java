package tr.org.lider.services;

import java.util.Optional;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.ForgotPasswordImpl;
import tr.org.lider.repositories.ForgotPasswordRepository;

@Service
public class ForgotPasswordService {

	@Autowired
	private ForgotPasswordRepository forgotPasswordRepository;
	
	
	public ForgotPasswordImpl save(ForgotPasswordImpl forgotPasswordImpl) {
		return forgotPasswordRepository.save(forgotPasswordImpl);
	}
	
	public Optional<ForgotPasswordImpl> findAllByUsername(String username) {
		return forgotPasswordRepository.findByUsername(username);
	}
	
	public Optional<ForgotPasswordImpl> findAllByUUID(String uuid) {
		return forgotPasswordRepository.findByResetUID(uuid);
	}
	
	@Transactional
	public void deleteByUsername(String username) {
		forgotPasswordRepository.deleteByUsername(username);
	}
}
