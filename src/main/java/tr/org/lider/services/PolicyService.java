package tr.org.lider.services;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.PolicyImpl;
import tr.org.lider.repositories.PolicyRepository;

@Service
public class PolicyService {

	@Autowired
	private PolicyRepository policyRepository;

	public List<PolicyImpl> list(){
		return policyRepository.findAll();
	}
	
	public PolicyImpl add(PolicyImpl file) {
		return policyRepository.save(file);
	}

	public PolicyImpl del(PolicyImpl file) {
		policyRepository.deleteById(file.getId());
		return file;
	}
	
	public PolicyImpl update(PolicyImpl file) {
		file.setModifyDate(new Date());
		return policyRepository.save(file);
	}
}