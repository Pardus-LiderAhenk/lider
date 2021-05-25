package tr.org.lider.services;

import java.util.Date;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.CommandImpl;
import tr.org.lider.repositories.ExecutedTaskCriteriaBuilder;

@Service
public class ExecutedTaskReportService {
	
	@Autowired
	ExecutedTaskCriteriaBuilder executedTaskCB;
	
	public Page<CommandImpl> findAllCommandsFiltered(int pageNumber, int pageSize, Optional<String> taskCommand,
			Optional<Date> startDate, Optional<Date> endDate) {

		Page<CommandImpl> commands = executedTaskCB.filterCommands(
				pageNumber, pageSize, taskCommand, startDate, endDate);

		return commands;
	}
}
