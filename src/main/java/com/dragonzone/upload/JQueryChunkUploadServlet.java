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
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class JQueryChunkUploadServlet extends HttpServlet {
	private static Logger logger = LoggerFactory.getLogger(JQueryChunkUploadServlet.class);
	private static final long serialVersionUID = 3447685998419256747L;
	private static final String RESP_SUCCESS = "{\"jsonrpc\" : \"2.0\", \"result\" : \"success\", \"id\" : \"id\"}";
	private static final String RESP_ERROR = "{\"jsonrpc\" : \"2.0\", \"error\" : {\"code\": 101, \"message\": \"Failed to open input stream.\"}, \"id\" : \"id\"}";
	public static final String JSON = "application/json";
	public static final int BUF_SIZE = 2 * 1024;
	public static final String FileDir = "c:/tmp/uploads/";

	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		File uploadedFile = null;
		String responseString = RESP_SUCCESS;

		if (ServletFileUpload.isMultipartContent(req)) {
			ServletFileUpload upload = new ServletFileUpload();
			try {
				FileItemIterator iter = upload.getItemIterator(req);
				while (iter.hasNext()) {
					FileItemStream item = iter.next();
					InputStream in = item.openStream();
					File dstFile = new File(FileDir);
					if (!dstFile.exists()) {
						dstFile.mkdirs();
					}

					File dst = new File(dstFile.getPath() + "/" + item.getName());

					//saveUploadFile(input, dst);
					try (OutputStream out = new BufferedOutputStream(new FileOutputStream(dst, dst.exists()), BUF_SIZE)) {
						IOUtils.copy(in, out);
					}	
					uploadedFile = dst;
				}
			} catch (Exception e) {
				responseString = RESP_ERROR;
				e.printStackTrace();
			}
		} else { // Not a multi-part MIME request.
			responseString = RESP_ERROR;
		}

		logger.info("Uploaded filename: " + uploadedFile.getAbsolutePath());
		
		resp.setContentType(JSON);
		byte[] responseBytes = responseString.getBytes();
		resp.setContentLength(responseBytes.length);
		ServletOutputStream output = resp.getOutputStream();
		output.write(responseBytes);
		output.flush();
	}
}
