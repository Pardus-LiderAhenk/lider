package tr.org.lider.services;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.ScriptTemp;
import tr.org.lider.repositories.ScriptRepository;

@Service
public class ScriptService {

	@Autowired
	private ScriptRepository scriptRepository;

	public List<ScriptTemp> list(){
		return scriptRepository.findAll();
	}

	public ScriptTemp add(ScriptTemp file) {
		return scriptRepository.save(file);
	}

	public ScriptTemp del(ScriptTemp file) {
		scriptRepository.deleteById(file.getId());
		return file;
	}
	
	public ScriptTemp update(ScriptTemp file) {
		file.setModifyDate(new Date());
		return scriptRepository.save(file);
	}
}