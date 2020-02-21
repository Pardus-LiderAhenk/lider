package tr.org.lider.services;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.NotifyTemp;
import tr.org.lider.repositories.NotifyRepository;

@Service
public class NotifyService {

	@Autowired
	private NotifyRepository notifyRepository;

	public List<NotifyTemp> list(){
		return notifyRepository.findAll();
	}

	public NotifyTemp add(NotifyTemp file) {
		return notifyRepository.save(file);
	}

	public NotifyTemp del(NotifyTemp file) {
		notifyRepository.deleteById(file.getId());
		return file;
	}
	
	public NotifyTemp update(NotifyTemp file) {
		file.setModifyDate(new Date());
		return notifyRepository.save(file);
	}
}