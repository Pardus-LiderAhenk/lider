package tr.org.lider.services;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.ConkyTemplate;
import tr.org.lider.repositories.ConkyRepository;

@Service
public class ConkyService {

	@Autowired
	private ConkyRepository conkyRepository;

	public List<ConkyTemplate> list(){
		return conkyRepository.findAll();
	}

	public ConkyTemplate add(ConkyTemplate file) {
		return conkyRepository.save(file);
	}

	public ConkyTemplate del(ConkyTemplate file) {
		conkyRepository.deleteById(file.getId());
		return file;
	}
	
	public ConkyTemplate update(ConkyTemplate file) {
		file.setModifyDate(new Date());
		return conkyRepository.save(file);
	}
}