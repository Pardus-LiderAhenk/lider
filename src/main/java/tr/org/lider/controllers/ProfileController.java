package tr.org.lider.controllers;

import java.util.Date;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import tr.org.lider.entities.PluginImpl;
import tr.org.lider.entities.ProfileImpl;
import tr.org.lider.services.PluginService;
import tr.org.lider.services.ProfileService;

/**
 * 
 * Return the profiles, saved, edited and deleted profile
 * @author <a href="mailto:tuncay.colak@tubitak.gov.tr">Tuncay ÇOLAK</a>
 *
 */

@Secured({"ROLE_ADMIN", "ROLE_COMPUTERS" })
@RestController
@RequestMapping("/profile")
public class ProfileController {

	Logger logger = LoggerFactory.getLogger(ProfileController.class);


	@Autowired
	private ProfileService profileService;

	@Autowired
	private PluginService pluginService;

	//	//	get script templates
	//	@RequestMapping(method=RequestMethod.POST ,value = "/list", produces = MediaType.APPLICATION_JSON_VALUE)
	//	public List<ProfileImpl> profileList() {
	//
	//		return profileService.list();
	//	}

	//return profile detail by plugin name and by deleted is false
	@RequestMapping(method=RequestMethod.POST ,value = "/list", produces = MediaType.APPLICATION_JSON_VALUE)
	public List<ProfileImpl> findAgentByJIDRest(@RequestParam (value = "name") String name) {
		List<PluginImpl> plugin = pluginService.findPluginByName(name);
		Long pluginId = plugin.get(0).getId();
		return profileService.findProfileByPluginIDAndDeletedFalse(pluginId);
	}
	
	//	save profile by plugin id (get plugin id by plugin name)
	@RequestMapping(method=RequestMethod.POST ,value = "/add", produces = MediaType.APPLICATION_JSON_VALUE)
	public ProfileImpl profileAdd(@RequestBody ProfileImpl params){
		try {
			List<PluginImpl> plugin = pluginService.findPluginByName(params.getPluginName());
			params.setPlugin(plugin.get(0));
			return profileService.add(params);
		} catch (DataAccessException e) {
			logger.error("Error saving profile: " + e.getCause().getMessage());
			return null;
		}
	}
	
//	delete profile by id (deleted value is changed to true)
	@RequestMapping(method=RequestMethod.POST ,value = "/del", produces = MediaType.APPLICATION_JSON_VALUE)
	public ProfileImpl profileDel(@RequestBody ProfileImpl profile){
		try {
			ProfileImpl existProfile = profileService.findProfileByID(profile.getId());
		
			profile.setPlugin(existProfile.getPlugin());
			profile.setDeleted(true);
			profile.setDescription(existProfile.getDescription());
			profile.setLabel(existProfile.getLabel());
			profile.setProfileData(existProfile.getProfileData());
			profile.setModifyDate(new Date());
			
			return profileService.del(profile);
		} catch (DataAccessException e) {
			logger.error("Error delete profile: " + e.getCause().getMessage());
			return null;
		}
	}
}
