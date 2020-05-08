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

	public List<PolicyImpl> list( ){
		Boolean deleted = false;
		List<PolicyImpl> policies = policyRepository.findAllByDeleted(deleted);
		return policies;
	}
	
	public PolicyImpl add(PolicyImpl policy) {
		policyRepository.save(policy);
		return policy;
	}

	public PolicyImpl del(PolicyImpl policy) {
//		policyRepository.deleteById(policy.getId());
		policyRepository.save(policy);
		return policy;
	}
	
	public PolicyImpl update(PolicyImpl policy) {
		policy.setModifyDate(new Date());
		return policyRepository.save(policy);
	}
	
	public PolicyImpl active(PolicyImpl policy) {
		policyRepository.save(policy);
		return policy;
	}
	
	public PolicyImpl findPolicyByID(Long id) {
		return policyRepository.findOne(id);
	}
}