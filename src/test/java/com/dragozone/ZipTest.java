package com.dragozone;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.StringWriter;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

import org.apache.commons.codec.binary.Base64;
import org.junit.Before;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.dragonzone.util.MyGZIPOutputStream;

import junit.framework.Assert;

/**
 * Tests various zip api & base64 to see which one can zip texts the best.
 * This is useful if you sending large texts over http & compressing it.
 */
public class ZipTest {
	static Logger LOGGER = LoggerFactory.getLogger(ZipTest.class);

	private static final String TEST_STRING = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";

	@Before
	public void before() {
		LOGGER.info("TEST_STRING: {}", TEST_STRING);
		LOGGER.info("Length: {}", TEST_STRING.length());
	}

	@Test
	public void myGzipTest() throws IOException {
		LOGGER.info("MyGZIP TEST...");

		ByteArrayOutputStream baos = new ByteArrayOutputStream();

		MyGZIPOutputStream zos = new MyGZIPOutputStream(baos, 1024);
		zos.write(TEST_STRING.getBytes());
		zos.close();
		LOGGER.info("Done Zipping...");

		byte[] base64Enc = Base64.encodeBase64(baos.toByteArray());
		String base64EncStr = new String(base64Enc);

		LOGGER.info("base64Enc: {}", base64EncStr);
		LOGGER.info("Length: {}", base64EncStr.length());
		LOGGER.info("Ratio: {}%", (((float)base64EncStr.length() / TEST_STRING.length()) * 100));

		byte[] base64Decoded = Base64.decodeBase64(base64EncStr);

		ByteArrayInputStream bais = new ByteArrayInputStream(base64Decoded);
		GZIPInputStream zis = new GZIPInputStream(bais);

		StringWriter sw = new StringWriter();

		byte[] buffer = new byte[1024];
		int bytes_read;
		while ((bytes_read = zis.read(buffer)) > 0) {
			sw.write(new String(buffer), 0, bytes_read);
		}
		sw.close();
		zis.close();

		String decodedStr = sw.toString();
		LOGGER.info("Decoded: {}", decodedStr);

		Assert.assertEquals(TEST_STRING, decodedStr);
	}

	@Test
	public void gzipTest() throws IOException {
		LOGGER.info("GZIP TEST...");

		ByteArrayOutputStream baos = new ByteArrayOutputStream();

		GZIPOutputStream zos = new GZIPOutputStream(baos, 1024);
		zos.write(TEST_STRING.getBytes());
		zos.close();
		LOGGER.info("Done Zipping...");

		byte[] base64Enc = Base64.encodeBase64(baos.toByteArray());
		String base64EncStr = new String(base64Enc);

		LOGGER.info("base64Enc: {}", base64EncStr);
		LOGGER.info("Length: {}", base64EncStr.length());
		LOGGER.info("Ratio: {}%", (((float)base64EncStr.length() / TEST_STRING.length()) * 100));

		byte[] base64Decoded = Base64.decodeBase64(base64EncStr);

		ByteArrayInputStream bais = new ByteArrayInputStream(base64Decoded);
		GZIPInputStream zis = new GZIPInputStream(bais);

		StringWriter sw = new StringWriter();

		byte[] buffer = new byte[1024];
		int bytes_read;
		while ((bytes_read = zis.read(buffer)) > 0) {
			sw.write(new String(buffer), 0, bytes_read);
		}
		sw.close();
		zis.close();

		String decodedStr = sw.toString();
		LOGGER.info("Decoded: {}", decodedStr);

		Assert.assertEquals(TEST_STRING, decodedStr);
	}

	@Test
	public void zipTest() throws IOException {
		LOGGER.info("ZIP TEST...");

		ByteArrayOutputStream baos = new ByteArrayOutputStream();

		ZipOutputStream zos = new ZipOutputStream(baos);
		ZipEntry ze = new ZipEntry("my.txt");
		zos.putNextEntry(ze);
		zos.write(TEST_STRING.getBytes());
		zos.closeEntry();
		zos.close();

		LOGGER.info("Done Zipping...");

		byte[] base64Enc = Base64.encodeBase64(baos.toByteArray());
		String base64EncStr = new String(base64Enc);

		LOGGER.info("base64Enc: {}", base64EncStr);
		LOGGER.info("Length: {}", base64EncStr.length());
		LOGGER.info("Ratio: {}%", (((float)base64EncStr.length() / TEST_STRING.length()) * 100));

		byte[] base64Decoded = Base64.decodeBase64(base64EncStr);

		ByteArrayInputStream bais = new ByteArrayInputStream(base64Decoded);
		ZipInputStream zis = new ZipInputStream(bais);
		zis.getNextEntry();

		StringWriter sw = new StringWriter();

		byte[] buffer = new byte[1024];
		int bytes_read;
		while ((bytes_read = zis.read(buffer)) > 0) {
			sw.write(new String(buffer), 0, bytes_read);
		}
		sw.close();
		zis.close();

		String decodedStr = sw.toString();
		LOGGER.info("Decoded: {}", decodedStr);

		Assert.assertEquals(TEST_STRING, decodedStr);
	}

}
