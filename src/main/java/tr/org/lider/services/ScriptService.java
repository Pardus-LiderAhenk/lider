package tr.org.lider.services;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.ScriptTemplate;
import tr.org.lider.repositories.ScriptRepository;

@Service
public class ScriptService {

	@Autowired
	private ScriptRepository scriptRepository;

	public List<ScriptTemplate> list(){
		return scriptRepository.findAll();
	}

	public ScriptTemplate add(ScriptTemplate file) {
		return scriptRepository.save(file);
	}

	public ScriptTemplate del(ScriptTemplate file) {
		scriptRepository.deleteById(file.getId());
		return file;
	}
	
	public ScriptTemplate update(ScriptTemplate file) {
		file.setModifyDate(new Date());
		return scriptRepository.save(file);
	}
}