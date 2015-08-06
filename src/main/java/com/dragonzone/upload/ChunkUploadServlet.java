package com.dragonzone.upload;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.fileupload.util.Streams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ChunkUploadServlet extends HttpServlet {
	private static Logger logger = LoggerFactory.getLogger(ChunkUploadServlet.class);
	private static final long serialVersionUID = 3447685998419256747L;
	private static final String RESP_SUCCESS = "{\"jsonrpc\" : \"2.0\", \"result\" : \"success\", \"id\" : \"id\"}";
	private static final String RESP_ERROR = "{\"jsonrpc\" : \"2.0\", \"error\" : {\"code\": 101, \"message\": \"Failed to open input stream.\"}, \"id\" : \"id\"}";
	public static final String JSON = "application/json";
	public static final int BUF_SIZE = 2 * 1024;
	public static final String FileDir = "c:/tmp/uploads/";

	private int chunk;
	private int chunks;
	private String name;
	private String user;
	private String time;

	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		logger.debug("In doGet");
		doPost(req, resp);
	}
	
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		String responseString = RESP_SUCCESS;
		boolean isMultipart = ServletFileUpload.isMultipartContent(req);

		if (isMultipart) {
			ServletFileUpload upload = new ServletFileUpload();
			try {
				FileItemIterator iter = upload.getItemIterator(req);
				while (iter.hasNext()) {
					FileItemStream item = iter.next();
					InputStream input = item.openStream();
					// Handle a form field.
					if (item.isFormField()) {
						String fileName = item.getFieldName();
						String value = Streams.asString(input);
						if ("name".equals(fileName)) {
							this.name = value;
							logger.debug("name: " + name);
						} else if ("chunks".equals(fileName)) {
							this.chunks = Integer.parseInt(value);
							logger.debug("chunks:" + chunks);
						} else if ("chunk".equals(fileName)) {
							this.chunk = Integer.parseInt(value);
							logger.debug("chunk: " + chunk);
						} else if ("user".equals(fileName)) {
							this.user = value;
							logger.debug("user: " + user);
						} else if ("time".equals(fileName)) {
							this.time = value;
							logger.debug("time: " + time);
						}
					} else { // Handle a multi-part MIME encoded file.
						File dstFile = new File(FileDir);
						if (!dstFile.exists()) {
							dstFile.mkdirs();
						}

						File dst = new File(dstFile.getPath() + "/" + this.name);

						saveUploadFile(input, dst);
					}
				}
			} catch (Exception e) {
				responseString = RESP_ERROR;
				e.printStackTrace();
			}
		} else { // Not a multi-part MIME request.
			responseString = RESP_ERROR;
		}

		if (this.chunk == this.chunks - 1) {
			logger.info("Uploaded filename: " + this.name);
		}
		resp.setContentType(JSON);
		byte[] responseBytes = responseString.getBytes();
		resp.setContentLength(responseBytes.length);
		ServletOutputStream output = resp.getOutputStream();
		output.write(responseBytes);
		output.flush();
	}

	private void saveUploadFile(InputStream input, File dst) throws IOException {
		OutputStream out = null;
		try {
			if (dst.exists()) {
				out = new BufferedOutputStream(new FileOutputStream(dst, true), BUF_SIZE);
			} else {
				out = new BufferedOutputStream(new FileOutputStream(dst), BUF_SIZE);
			}
			byte[] buffer = new byte[BUF_SIZE];
			int len = 0;
			while ((len = input.read(buffer)) > 0) {
				out.write(buffer, 0, len);
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			if (null != input) {
				try {
					input.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
			if (null != out) {
				try {
					out.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
	}
}
