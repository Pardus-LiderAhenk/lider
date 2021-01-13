package tr.org.lider.services;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.OperationType;
import tr.org.lider.entities.PolicyImpl;
import tr.org.lider.entities.ProfileImpl;
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
	private OperationLogService operationLogService;
	
	public List<ProfileImpl> list(){
		return profileRepository.findAll();
	}

	public ProfileImpl add(ProfileImpl profile) {
		ProfileImpl existProfile = profileRepository.save(profile);
		try {
			operationLogService.saveOperationLog(OperationType.CREATE, "Ayar(profil) oluşturuldu.", existProfile.getProfileDataBlob(), null, null, existProfile.getId());
		} catch (Exception e) {
			e.printStackTrace();
		}
		return existProfile;
	}

	public ProfileImpl del(ProfileImpl profile) {
		ProfileImpl existProfile = findProfileByID(profile.getId());
		existProfile.setDeleted(true);
		existProfile.setModifyDate(new Date());
		try {
			operationLogService.saveOperationLog(OperationType.DELETE, "Ayar(profil) silindi.", existProfile.getProfileDataBlob(), null, null, existProfile.getId());
		} catch (Exception e) {
			e.printStackTrace();
		}
		return profileRepository.save(existProfile);
	}
	
	public ProfileImpl update(ProfileImpl profile) {
		ProfileImpl existProfile = findProfileByID(profile.getId());
		existProfile.setModifyDate(new Date());
		existProfile.setLabel(profile.getLabel());
		existProfile.setDescription(profile.getDescription());
		existProfile.setProfileData(profile.getProfileData());
		try {
			operationLogService.saveOperationLog(OperationType.UPDATE, "Ayar(profil) güncellendi.", existProfile.getProfileDataBlob(), null, null, existProfile.getId());
		} catch (Exception e) {
			e.printStackTrace();
		}
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