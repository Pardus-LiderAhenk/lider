package tr.org.lider.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.RegistrationTemplateImpl;
import tr.org.lider.repositories.RegistrationTemplateRepository;

@Service
public class RegistrationTemplateService {

	@Autowired
	RegistrationTemplateRepository registrationTemplateRepository;

	public List<RegistrationTemplateImpl> findAll() {
        return registrationTemplateRepository.findAll();
	}
	
	public List<RegistrationTemplateImpl> findAllOrderByUnitLength() {
        return registrationTemplateRepository.findAllOrderByUnitIdLength();
	}
	
	public Optional<RegistrationTemplateImpl> findRegistrationTemplateByID(Long id) {
        return registrationTemplateRepository.findById(id);
	}
	
	public RegistrationTemplateImpl addRegistrationTemplate(RegistrationTemplateImpl template) {
		return registrationTemplateRepository.save(template);
	}
	
	public RegistrationTemplateImpl editRegistrationTemplate(RegistrationTemplateImpl template) {
		return registrationTemplateRepository.save(template);
	}
	
	public void delete(Long id) {
		registrationTemplateRepository.deleteById(id);
	}
}
