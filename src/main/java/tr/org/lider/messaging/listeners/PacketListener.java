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
package tr.org.lider.messaging.listeners;

import org.jivesoftware.smack.SmackException.NotConnectedException;
import org.jivesoftware.smack.StanzaListener;
import org.jivesoftware.smack.filter.StanzaFilter;
import org.jivesoftware.smack.packet.Stanza;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Listens to all packets that can be used for log (or debug) purposes.
 * 
 */
public class PacketListener implements StanzaListener, StanzaFilter {

	private Logger logger = LoggerFactory.getLogger(PacketListener.class);

	@Override
	public void processPacket(Stanza packet) throws NotConnectedException {
		try {
			logger.debug("Packet received: {}", packet.toXML());
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}
	}

	@Override
	public boolean accept(Stanza stanza) {
		return true;
	}

}
