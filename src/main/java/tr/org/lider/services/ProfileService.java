package tr.org.lider.services;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mysql.cj.log.Log;

import tr.org.lider.entities.PluginImpl;
import tr.org.lider.entities.ProfileImpl;
import tr.org.lider.repositories.ProfileRepository;

/**
 * Service for getting profile parameters from database and added, updated and deleted profile to database.
 * 
 * @author <a href="mailto:tuncay.colak@tubitak.gov.tr">Tuncay ÇOLAK</a>
 * 
 */

@Service
public class ProfileService {

	@Autowired
	private ProfileRepository profileRepository;

	public List<ProfileImpl> list(){
		return profileRepository.findAll();
	}

	public ProfileImpl add(ProfileImpl profile) {
		profileRepository.save(profile);
		return profile;
	}

	public ProfileImpl del(ProfileImpl profile) {
//		profileRepository.deleteById(profile.getId());
		profileRepository.save(profile);
		return profile;
	}
	
	public ProfileImpl update(ProfileImpl profile) {
		profile.setModifyDate(new Date());
		return profileRepository.save(profile);
	}
	
	public ProfileImpl findProfileByID(Long id) {
		return profileRepository.findOne(id);
	}
	
	public List<ProfileImpl> findProfileByPluginID(Long pluginId) {
		return profileRepository.findByPluginId(pluginId);
	}
	
	public List<ProfileImpl> findProfileByPluginIDAndDeletedFalse(Long pluginId) {
		Boolean deleted = false;
		List<ProfileImpl> profile = profileRepository.findByPluginIdAndDeleted(pluginId, deleted);
		return profile;
	}
}