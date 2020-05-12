package tr.org.lider.services;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sun.xml.bind.v2.TODO;

import tr.org.lider.entities.PolicyImpl;
import tr.org.lider.entities.ProfileImpl;
import tr.org.lider.repositories.PolicyRepository;
import tr.org.lider.repositories.ProfileRepository;
import tr.org.lider.repositories.PolicyProfileRepository;

/**
 * Service for getting profile parameters from database and added, updated and deleted profile to database.
 * 
 * @author <a href="mailto:tuncay.colak@tubitak.gov.tr">Tuncay ÇOLAK</a>
 * 
 */

@Service
public class ProfileService {
	
	@Autowired
	private PolicyService policyService;

	@Autowired
	private ProfileRepository profileRepository;
	
	@Autowired
	private PolicyProfileRepository policyProfileRepository;
	
	@Autowired
	private PolicyRepository policyRepository;

	public List<ProfileImpl> list(){
		return profileRepository.findAll();
	}

	public ProfileImpl add(ProfileImpl profile) {
		return profileRepository.save(profile);
	}

	public ProfileImpl del(ProfileImpl profile) {
		ProfileImpl existProfile = findProfileByID(profile.getId());
		existProfile.setDeleted(true);
		existProfile.setModifyDate(new Date());
		return profileRepository.save(existProfile);
	}
	
	public ProfileImpl update(ProfileImpl profile) {
		ProfileImpl existProfile = findProfileByID(profile.getId());
		existProfile.setModifyDate(new Date());
		existProfile.setLabel(profile.getLabel());
		existProfile.setDescription(profile.getDescription());
		existProfile.setProfileData(profile.getProfileData());
		
		List<PolicyImpl> policies = policyProfileRepository.findAllByProfileId(profile.getId());
	
		for (PolicyImpl policy : policies) {
			policyService.updateVersion(policy);
		}
		return profileRepository.save(existProfile);
	}
	
	public ProfileImpl findProfileByID(Long id) {
		return profileRepository.findOne(id);
	}
	
	public List<ProfileImpl> findProfileByPluginID(Long pluginId) {
		return profileRepository.findByPluginId(pluginId);
	}
	
	public List<ProfileImpl> findProfileByPluginIDAndDeletedFalse(Long pluginId) {
		Boolean deleted = false;
		return profileRepository.findByPluginIdAndDeleted(pluginId, deleted);
	}
}