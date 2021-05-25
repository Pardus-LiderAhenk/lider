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
package tr.org.lider.messaging.subscribers;

import tr.org.lider.messaging.messages.ILiderMessage;
import tr.org.lider.messaging.messages.RegistrationMessageImpl;

/**
 * Agent registration interface, any bundle - exposing an implementation of this
 * interface as a service - will be notified of messages received by underlying
 * messaging system.
 *
 */
public interface IRegistrationSubscriber {

	/**
	 * Handle agent registration (and unregistration) according to underlying
	 * system.
	 * 
	 * @param message
	 * @return
	 * @throws Exception
	 * 
	 */
	ILiderMessage messageReceived(RegistrationMessageImpl message) throws Exception;

	/**
	 * Optional method which can be used to send another message to agent
	 * immediately after the registration process completes.
	 * 
	 * @return
	 * @throws Exception
	 */
	ILiderMessage postRegistration() throws Exception;

}
