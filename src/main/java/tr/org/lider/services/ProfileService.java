package tr.org.lider.services;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.ProfileImpl;
import tr.org.lider.repositories.ProfileRepository;

@Service
public class ProfileService {

	@Autowired
	private ProfileRepository profileRepository;

	public List<ProfileImpl> list(){
		return profileRepository.findAll();
	}

	public ProfileImpl add(ProfileImpl file) {
		return profileRepository.save(file);
	}

	public ProfileImpl del(ProfileImpl file) {
		profileRepository.deleteById(file.getId());
		return file;
	}
	
	public ProfileImpl update(ProfileImpl file) {
		file.setModifyDate(new Date());
		return profileRepository.save(file);
	}
}