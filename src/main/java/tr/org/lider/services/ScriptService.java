package tr.org.lider.services;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.ScriptFile;
import tr.org.lider.repositories.ScriptRepository;

@Service
public class ScriptService {

	@Autowired
	private ScriptRepository scriptRepository;

	public List<ScriptFile> list(){
		return scriptRepository.findAll();
	}

	public ScriptFile add(ScriptFile file) {
		return scriptRepository.save(file);
	}

	public ScriptFile del(ScriptFile file) {
		scriptRepository.deleteById(file.getId());
		return file;
	}
	
	public ScriptFile update(ScriptFile file) {
		file.setModifyDate(new Date());
		return scriptRepository.save(file);
	}
}