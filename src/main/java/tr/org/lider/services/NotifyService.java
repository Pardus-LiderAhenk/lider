package tr.org.lider.services;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.NotifyTemplate;
import tr.org.lider.repositories.NotifyRepository;

@Service
public class NotifyService {

	@Autowired
	private NotifyRepository notifyRepository;

	public List<NotifyTemplate> list(){
		return notifyRepository.findAll();
	}

	public NotifyTemplate add(NotifyTemplate file) {
		return notifyRepository.save(file);
	}

	public NotifyTemplate del(NotifyTemplate file) {
		notifyRepository.deleteById(file.getId());
		return file;
	}
	
	public NotifyTemplate update(NotifyTemplate file) {
		file.setModifyDate(new Date());
		return notifyRepository.save(file);
	}
}