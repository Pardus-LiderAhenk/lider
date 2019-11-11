package tr.org.lider.plugins;

import java.util.ArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import tr.org.lider.utils.CommandResultImpl;
import tr.org.lider.utils.CommandResultStatus;
import tr.org.lider.utils.ICommand;
import tr.org.lider.utils.ICommandContext;
import tr.org.lider.utils.ICommandResult;


/*
 * plugin.name = conky
plugin.version = 1.0.0
plugin.description = Lider Conky Plugin
plugin.machine.oriented = true
plugin.user.oriented = true
plugin.policy.plugin = true
plugin.task.plugin = true
plugin.uses.file.transfer = false
plugin.x.based = false
 */

@Component
public class ConkyCommand implements ICommand {

	private Logger logger = LoggerFactory.getLogger(ConkyCommand.class);

	@Override
	public ICommandResult execute(ICommandContext context) {
		
		logger.debug("Execute method working.");
		
		ICommandResult commandResult = new CommandResultImpl(CommandResultStatus.OK, new ArrayList<String>(), this);
		return commandResult;
	}

	@Override
	public ICommandResult validate(ICommandContext context) {
		return new CommandResultImpl(CommandResultStatus.OK, null, this, null);
	}

	@Override
	public String getCommandId() {
		return "EXECUTE_CONKY";
	}

	@Override
	public Boolean executeOnAgent() {
		return true;
	}
	
	@Override
	public String getPluginName() {
		return "conky";
	}

	@Override
	public String getPluginVersion() {
		return "1.0.0";
	}

	
}