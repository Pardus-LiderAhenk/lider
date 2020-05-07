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
		return policyRepository.findAll();
//		Boolean deleted = false;
//		List<PolicyImpl> policies = policyRepository.findByPolicyByDeleted(deleted);
//		return policies;
	}
	
	public PolicyImpl add(PolicyImpl policy) {
		policy.setPolicyVersion(policy.getId()+"-"+1);
		policyRepository.save(policy);
		return policy;
	}

	public PolicyImpl del(PolicyImpl policy) {
		policyRepository.deleteById(policy.getId());
		return policy;
	}
	
	public PolicyImpl update(PolicyImpl policy) {
		policy.setModifyDate(new Date());
		return policyRepository.save(policy);
	}
}