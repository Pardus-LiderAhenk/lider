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

/**
 * 
 * <p>
 * This is the interface for server-side plugin command implementations. Any
 * class implementing this interface can deploy a new command to the server.
 * ServiceRouterImpl directs RestRequestImpl to the appropriate command if
 * exists according to respective properties.
 * </p>
 * <br/>
 * 
 * <p>
 * ServiceRouterImpl tries to find the appropriate command via
 * ServiceRegistryImpl which keeps ICommand instances according to some specific
 * key format. This format consist of these properties: <br/>
 * 
 * {PLUGIN_NAME}:{PLUGIN_VERSION}:{COMMAND_ID}
 * 
 * The first two properties are the plugin name and plugin version respectively,
 * and the third property is a unique identifier of the command for its plugin.
 * </p>
 *
 * 
 */
public interface ICommand {

	/**
	 * Any custom plugin command should implement this method and return a
	 * non-null {@link ICommandResult}, A command may access to IAuthService,
	 * ILdapService and more plugin services provided by the core system to do
	 * its necessary job.
	 * 
	 * @return command result {@link ICommandResult}
	 * @throws Exception 
	 */
	ICommandResult execute(ICommandContext context) throws Exception;

	/**
	 * Any custom plugin command should implement this method and return a
	 * non-null {@link ICommandResult}, It should check whether the arguments
	 * are valid.
	 * 
	 * @return command result {@link ICommandResult}
	 */
	ICommandResult validate(ICommandContext context);

	/**
	 * 
	 * @return id of the plugin implementing this command.
	 */
	String getPluginName();

	/**
	 * 
	 * @return version of the plugin implementing this command.
	 */
	String getPluginVersion();

	/**
	 * Unique identifier of this command.
	 * 
	 * @return
	 */
	String getCommandId();

	/**
	 * @return true if this command needs agent interaction to fulfill its job,
	 *         false otherwise.
	 */
	Boolean executeOnAgent();

}
