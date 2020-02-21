package tr.org.lider.services;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.NotifyFile;
import tr.org.lider.repositories.NotifyRepository;

@Service
public class NotifyService {

	@Autowired
	private NotifyRepository notifyRepository;

	public List<NotifyFile> list(){
		return notifyRepository.findAll();
	}

	public NotifyFile add(NotifyFile file) {
		return notifyRepository.save(file);
	}

	public NotifyFile del(NotifyFile file) {
		notifyRepository.deleteById(file.getId());
		return file;
	}
	
	public NotifyFile update(NotifyFile file) {
		file.setModifyDate(new Date());
		return notifyRepository.save(file);
	}
}