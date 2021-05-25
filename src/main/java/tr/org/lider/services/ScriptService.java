package tr.org.lider.services;

import java.util.Date;
import java.util.List;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.OperationType;
import tr.org.lider.entities.ScriptTemplate;
import tr.org.lider.entities.ScriptType;
import tr.org.lider.repositories.ScriptRepository;

@Service
public class ScriptService {
	

	@Autowired
	private ScriptRepository scriptRepository;
	
	@Autowired
	private OperationLogService operationLogService;
	
	@PostConstruct
	private void init() {
		if (scriptRepository.count() == 0) {
			ScriptType  scriptType = ScriptType.getType(1);
			String label = "Dosya Oluştur";
			String contents = "#!/bin/bash\n" + 
					"touch /tmp/test.txt";
			scriptRepository.save(new ScriptTemplate(scriptType, label, contents, new Date(), null));
		}
	}

	public List<ScriptTemplate> list(){
		return scriptRepository.findAll();
	}

	public ScriptTemplate add(ScriptTemplate file) {
		ScriptTemplate scriptFile = scriptRepository.save(file);
		try {
			operationLogService.saveOperationLog(OperationType.CREATE, "Betik Tanımı oluşturuldu.", file.getContents().getBytes());
		} catch (Exception e) {
			e.printStackTrace();
		}
		return scriptFile;
	}

	public ScriptTemplate del(ScriptTemplate file) {
		ScriptTemplate existFile = scriptRepository.findOne(file.getId());
		scriptRepository.deleteById(file.getId());
		try {
			operationLogService.saveOperationLog(OperationType.DELETE, "Betik Tanımı silindi.", existFile.getContents().getBytes());
		} catch (Exception e) {
			e.printStackTrace();
		}
		return file;
	}
	
	public ScriptTemplate update(ScriptTemplate file) {
		file.setModifyDate(new Date());
		ScriptTemplate scriptFile = scriptRepository.save(file);
		try {
			operationLogService.saveOperationLog(OperationType.UPDATE, "Betik Tanımı güncellendi.", file.getContents().getBytes());
		}catch (Exception e) {
			e.printStackTrace();
		}
		return scriptFile;
	}
}