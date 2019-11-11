/*
*
*    Copyright © 2015-2016 Tübitak ULAKBIM
*
*    This file is part of Lider Ahenk.
*
*    Lider Ahenk is free software: you can redistribute it and/or modify
*    it under the terms of the GNU General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    (at your option) any later version.
*
*    Lider Ahenk is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU General Public License for more details.
*
*    You should have received a copy of the GNU General Public License
*    along with Lider Ahenk.  If not, see <http://www.gnu.org/licenses/>.
*/
package tr.org.lider.utils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class CommandResultImpl implements ICommandResult {

	private CommandResultStatus status;
	private List<String> messages;
	private ICommand command;
	private Map<String, Object> resultMap = new HashMap<String, Object>(0);
	
	public CommandResultImpl() {
		// TODO Auto-generated constructor stub
	}

	public CommandResultImpl(CommandResultStatus status, List<String> messages, ICommand command) {
		this.status = status;
		this.messages = messages;
		this.command = command;
	}

	public CommandResultImpl(CommandResultStatus status, List<String> messages, ICommand command,
			Map<String, Object> resultMap) {
		this.status = status;
		this.messages = messages;
		this.command = command;
		this.resultMap = resultMap;
	}

	@Override
	public CommandResultStatus getStatus() {
		return status;
	}

	@Override
	public List<String> getMessages() {
		return messages;
	}

	@Override
	public ICommand getCommand() {
		return command;
	}

	@Override
	public Map<String, Object> getResultMap() {
		return resultMap;
	}

	@Override
	public String toString() {
		return "CommandResultImpl [status=" + status + ", messages=" + messages + ", command=" + command
				+ ", resultMap=" + resultMap + "]";
	}
}
