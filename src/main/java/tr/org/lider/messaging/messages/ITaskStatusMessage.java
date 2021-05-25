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
package tr.org.lider.messaging.messages;

import java.util.Map;

import tr.org.lider.messaging.enums.ContentType;
import tr.org.lider.messaging.enums.StatusCode;

/**
 * Interface for task status messages. This kind of message is sent after task
 * execution.
 * 
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Akkaya</a>
 * 
 */
public interface ITaskStatusMessage extends IAgentMessage {

	/**
	 * 
	 * @return
	 */
	Long getTaskId();

	/**
	 * 
	 * @return
	 */
	StatusCode getResponseCode();

	/**
	 * 
	 * @return
	 */
	String getResponseMessage();

	/**
	 * 
	 * @return
	 */
	Map<String, Object> getResponseData();

	/**
	 * 
	 * @return indicate content type of response data.
	 */
	ContentType getContentType();

}
