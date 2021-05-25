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

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Akkaya</a>
 * @author <a href="mailto:caner.feyzullahoglu@agem.com.tr">Caner
 *         Feyzullahoglu</a>
 *
 */
public class FileCopyUtils {

	private static Logger logger = LoggerFactory.getLogger(FileCopyUtils.class);

	private static String DEFAULT_PORT = "22";

	public byte[] copyFile(String host, Integer port, String username, String password, String filePath,
			String destPath) throws IOException, InterruptedException {
		if (host == null || username == null || filePath == null || destPath == null) {
			throw new IllegalArgumentException(
					"Host, username, file path and destination path parameters cannot be null.");
		}

		// Create directory if not exists
		ProcessBuilder builder = new ProcessBuilder("mkdir", "-p", destPath);
		Process process = builder.start();
		InputStream errorStream = process.getErrorStream();
		int exitValue = process.waitFor();
		if (exitValue != 0) {
			String errorMessage = read(errorStream);
			System.out.println("Unexpected error occurred during execution: " + errorMessage);
			return null;
		}
		logger.info("Created target directory");

		// Copy file
		String[] cmd = new String[] { "/usr/bin/rsync", "-az",
				"--rsh=/usr/bin/sshpass -p " + password + " /usr/bin/ssh -p " + (port != null ? port : DEFAULT_PORT)
						+ " -oUserKnownHostsFile=/dev/null -oPubkeyAuthentication=no -oStrictHostKeyChecking=no -l "
						+ username,
				username + "@" + host + ":" + filePath, destPath };
		logger.info(cmd.toString());
		builder = new ProcessBuilder(cmd);
		process = builder.start();

		errorStream = process.getErrorStream();
		exitValue = process.waitFor();
		if (exitValue != 0) {
			String errorMessage = read(errorStream);
			logger.error("Unexpected error occurred during execution: {}", errorMessage);
			return null;
		}

		// Find path of the copied file
		String filename = Paths.get(filePath).getFileName().toString();
		String path = destPath;
		if (!path.endsWith("/"))
			path += "/";
		path += filename;

		File file = new File(path);
		byte[] data = read(file);
		logger.debug("File bytes received: {}", data.length);

		return data;
	}

	/**
	 * Converts the given byte array to a file and sends it to remote machine.
	 * Returns the absolute path of sent file at remote machine.
	 * 
	 * @param host
	 * @param port
	 * @param username
	 * @param password
	 * @param fileAsByteArr
	 * @param destPath
	 * @return the absolute path of sent file at remote machine.
	 * @throws IOException
	 * @throws InterruptedException
	 * 
	 * @author Caner Feyzullahoglu
	 */
	public String sendFile(String host, Integer port, String username, String password, byte[] fileAsByteArr,
			String destPath) throws IOException, InterruptedException {
		if (host == null || username == null || fileAsByteArr == null || destPath == null) {
			throw new IllegalArgumentException(
					"Host, username, file byte array and destination path parameters cannot be null.");
		}

		// Write to file from byte array
		File file = write(fileAsByteArr);

		logger.info("destPath: " + destPath);
		// Copy file
		String[] cmd = new String[] {"/usr/bin/rsync", "-az","--rsh=/usr/bin/sshpass -p " + password + " /usr/bin/ssh -p " + (port != null ? port : DEFAULT_PORT)
						+ " -oUserKnownHostsFile=/dev/null -oPubkeyAuthentication=no -oStrictHostKeyChecking=no -l "
						+ username ,
				file.getAbsolutePath(), username + "@" + host + ":" + destPath };

		// Create directory if not exists
		ProcessBuilder builder = new ProcessBuilder(cmd);
		Process process = builder.start();
		InputStream errorStream = process.getErrorStream();
		int exitValue = process.waitFor();
		if (exitValue != 0) {
			String errorMessage = read(errorStream);
			logger.error("Unexpected error occurred during execution: {}", errorMessage);
		}

		if (destPath.endsWith(File.separator)) {
			return destPath + file.getName();
		} else {
			return destPath + File.separator + file.getName();
		}
	}

	/**
	 * 
	 * @param file
	 * @return
	 * @throws IOException
	 */
	private static byte[] read(File file) throws IOException {
		byte[] buffer = new byte[(int) file.length()];
		InputStream ios = null;
		try {
			ios = new FileInputStream(file);
			if (ios.read(buffer) == -1) {
				throw new IOException("EOF reached while trying to read the whole file");
			}
		} finally {
			try {
				if (ios != null)
					ios.close();
			} catch (IOException e) {
			}
		}
		return buffer;
	}

	/**
	 * 
	 * @param inputStream
	 * @return
	 * @throws IOException
	 */
	private static String read(InputStream inputStream) throws IOException {
		ByteArrayOutputStream result = new ByteArrayOutputStream();
		byte[] buffer = new byte[1024];
		int length;
		while ((length = inputStream.read(buffer)) != -1) {
			result.write(buffer, 0, length);
		}
		return result.toString("UTF-8");
	}

	/**
	 * 
	 * @param fileAsByteArr
	 * @return created file
	 * @throws IOException
	 */
	private static File write(byte[] fileAsByteArr) throws IOException {

		FileOutputStream fileOutputStream = null;
		String filePath;
		File file;

		try {
			// Get md5 of file
			String md5OfFile = getMD5ofFile(fileAsByteArr);
			filePath = System.getProperty("java.io.tmpdir") + "/" + md5OfFile;

			file = new File(filePath);

			fileOutputStream = new FileOutputStream(file);
			fileOutputStream.write(fileAsByteArr);

			return file;

		} catch (FileNotFoundException e) {
			e.printStackTrace();
			return null;
		} finally {
			if (fileOutputStream != null) {
				try {
					fileOutputStream.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}

	}

	private static String getMD5ofFile(byte[] inputBytes) {

		MessageDigest digest;
		String result = null;
		try {
			digest = MessageDigest.getInstance("MD5");
			byte[] hashBytes = digest.digest(inputBytes);

			final StringBuilder builder = new StringBuilder();
			for (byte b : hashBytes) {
				builder.append(String.format("%02x", b));
			}
			result = builder.toString();
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}

		return result;
	}

}
