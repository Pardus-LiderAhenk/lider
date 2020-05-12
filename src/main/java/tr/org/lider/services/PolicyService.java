package tr.org.lider.services;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.PolicyImpl;
import tr.org.lider.repositories.PolicyRepository;

/**
 * Service for getting policy parameters from database and added, updated and deleted policy to database.
 * 
 * @author <a href="mailto:tuncay.colak@tubitak.gov.tr">Tuncay ÇOLAK</a>
 * 
 */

@Service
public class PolicyService {

	@Autowired
	private PolicyRepository policyRepository;

	public List<PolicyImpl> list( ){
		Boolean deleted = false;
		return policyRepository.findAllByDeleted(deleted);
	}

	public PolicyImpl add(PolicyImpl policy) {
		policy.setCommandOwnerUid(null);
		PolicyImpl existPolicy = policyRepository.save(policy);
		existPolicy.setPolicyVersion(existPolicy.getId()+"-"+ 1);
		return policyRepository.save(existPolicy);
	}

	public PolicyImpl del(PolicyImpl policy) {
		PolicyImpl existPolicy = policyRepository.findOne(policy.getId());
		existPolicy.setDeleted(true);
		existPolicy.setModifyDate(new Date());
		return policyRepository.save(existPolicy);
	}

	public PolicyImpl update(PolicyImpl policy) {
		PolicyImpl existPolicy = policyRepository.findOne(policy.getId());
		existPolicy.setLabel(policy.getLabel());
		existPolicy.setDescription(policy.getDescription());
		existPolicy.setProfiles(policy.getProfiles());
		String oldVersion = existPolicy.getPolicyVersion().split("-")[1];
		Integer newVersion = new Integer(oldVersion) + 1;
		existPolicy.setPolicyVersion(policy.getId() + "-" + newVersion);
		existPolicy.setModifyDate(new Date());
		return policyRepository.save(existPolicy);
	}

	public PolicyImpl active(PolicyImpl policy) {
		PolicyImpl existPolicy = policyRepository.findOne(policy.getId());
		existPolicy.setActive(true);
		existPolicy.setModifyDate(new Date());
		return policyRepository.save(existPolicy);
	}

	public PolicyImpl passive(PolicyImpl policy) {
		PolicyImpl existPolicy = policyRepository.findOne(policy.getId());
		existPolicy.setActive(false);
		existPolicy.setModifyDate(new Date());
		return policyRepository.save(existPolicy);
	}

	public PolicyImpl findPolicyByID(Long id) {
		return policyRepository.findOne(id);
	}

	public PolicyImpl updateVersion(PolicyImpl policy) {
		String oldVersion = policy.getPolicyVersion().split("-")[1];
		Integer newVersion = new Integer(oldVersion) + 1;
		policy.setPolicyVersion(policy.getId() + "-" + newVersion);
		policy.setModifyDate(new Date());
		return policyRepository.save(policy);
	}
}