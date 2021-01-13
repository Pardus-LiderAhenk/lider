package tr.org.lider.services;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.NotifyTemplate;
import tr.org.lider.entities.OperationType;
import tr.org.lider.repositories.NotifyRepository;

@Service
public class NotifyService {

	@Autowired
	private NotifyRepository notifyRepository;
	
	@Autowired
	private OperationLogService operationLogService;

	public List<NotifyTemplate> list(){
		return notifyRepository.findAll();
	}

	public NotifyTemplate add(NotifyTemplate file) {
		operationLogService.saveOperationLog(OperationType.CREATE, "ETA Mesaj Tanımı oluşturuldu.", file.getContents().getBytes());
		return notifyRepository.save(file);
	}

	public NotifyTemplate del(NotifyTemplate file) {
		NotifyTemplate existNotify = notifyRepository.findOne(file.getId());
		operationLogService.saveOperationLog(OperationType.CREATE, "ETA Mesaj Tanımı silindi.", existNotify.getContents().getBytes());
		notifyRepository.deleteById(file.getId());
		return file;
	}
	
	public NotifyTemplate update(NotifyTemplate file) {
		file.setModifyDate(new Date());
		operationLogService.saveOperationLog(OperationType.CREATE, "ETA Mesaj Tanımı güncellendi.", file.getContents().getBytes());
		return notifyRepository.save(file);
	}
}