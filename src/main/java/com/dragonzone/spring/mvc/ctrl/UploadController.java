package com.dragonzone.spring.mvc.ctrl;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.fileupload.util.Streams;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/video")
public class UploadController {
	private static final Logger logger = LoggerFactory.getLogger(UploadController.class);

	private static final String RESP_SUCCESS = "{\"jsonrpc\" : \"2.0\", \"result\" : \"success\", \"id\" : \"id\"}";
	private static final String RESP_ERROR = "{\"jsonrpc\" : \"2.0\", \"error\" : {\"code\": 101, \"message\": \"Failed to open input stream.\"}, \"id\" : \"id\"}";
	public static final String JSON = "application/json";
	public static final int BUF_SIZE = 2 * 1024;
	//public static final String FileDir = System.getProperty("java.io.tmpdir");
	public static final String FileDir = "c:/tmp/uploads/";

	@RequestMapping(value = "/assemble", method = RequestMethod.GET)
	protected void doGet(HttpServletRequest req, HttpServletResponse resp,
			@RequestParam(value = "filename", required = true) String filename)
			throws ServletException, IOException {
		logger.debug("In doGet");
		File dstFile = new File(FileDir);
		File uploadedFile = new File(dstFile.getPath() + "/" + filename);
		buildChunks(uploadedFile);
	}

	@RequestMapping(value = "/upload", method = RequestMethod.POST)
	public void uploadVideo(final HttpServletRequest req, final HttpServletResponse resp) throws Exception {
		int chunk = -1;
		int chunks = -1;
		String name = null;
		
		String responseString = RESP_SUCCESS;
		boolean isMultipart = ServletFileUpload.isMultipartContent(req);

		if (isMultipart) {
			ServletFileUpload upload = new ServletFileUpload();
			try {
				FileItemIterator iter = upload.getItemIterator(req);
				while (iter.hasNext()) {
					FileItemStream item = iter.next();
					InputStream in = item.openStream();
					// Handle a form field.
					if (item.isFormField()) {
						String fieldName = item.getFieldName();
						String value = Streams.asString(in);
						if ("name".equals(fieldName)) {
							name = value;
							logger.debug("name: {}", name);
						} else if ("chunks".equals(fieldName)) {
							chunks = Integer.parseInt(value);
							logger.debug("chunks: {}", chunks);
						} else if ("chunk".equals(fieldName)) {
							chunk = Integer.parseInt(value);
							logger.debug("chunk: {}", chunk);
						} else if ("id".equals(fieldName)) {
							logger.debug("id: {}", value);
						}
					} else { // Handle a multi-part MIME encoded file.
						File dstFile = new File(FileDir);
						if (!dstFile.exists()) {
							dstFile.mkdirs();
						}

						File dst = new File(dstFile.getPath() + "/" + name + "." + chunk); // create each upload separately and use get to build as 1 file

						try {
							try (OutputStream out = new BufferedOutputStream(new FileOutputStream(dst, dst.exists()), BUF_SIZE)) {
								IOUtils.copy(in, out);
							}	
						} catch (Exception e) {
							dst.delete();
							logger.error("User may have aborted upload, so delete this chunk, file: {}", dst.getAbsoluteFile());
						}
					}
				}
			} catch (Exception e) {
				responseString = RESP_ERROR;
				e.printStackTrace();
			}
		} else { // Not a multi-part MIME request.
			responseString = RESP_ERROR;
		}

		if (chunk == chunks - 1) {
			logger.info("Uploaded filename: " + 	name);
		}
		resp.setContentType(JSON);
		byte[] responseBytes = responseString.getBytes();
		resp.setContentLength(responseBytes.length);
		ServletOutputStream output = resp.getOutputStream();
		output.write(responseBytes);
		output.flush();
	}

	private void buildChunks(File uploadedFile) throws IOException {
		File dstFile = new File(FileDir);
		
		int chunk = 0;
		File srcFile = new File(dstFile.getPath() + "/" + uploadedFile.getName() + "." + chunk++);

		while (srcFile.exists()) {
			
			try (OutputStream out = new BufferedOutputStream(new FileOutputStream(uploadedFile, true), BUF_SIZE);
				 BufferedInputStream in = new BufferedInputStream(new FileInputStream(srcFile))) {
				IOUtils.copy(in, out);
			}	
			
			srcFile = new File(dstFile.getPath() + "/" + uploadedFile.getName() + "." + chunk++);
		}
	}

/* CODE SAMPLE: DO NOT DELETE THIS; IT'S A ALT. WAY OF GETTING DATA MULTIPART WHEN THE ABOVE DOES NOT WORK	
	@RequestMapping(value = "/assemble", method = RequestMethod.GET)
	protected void doGet(@RequestParam(value = "filename", required = true) String filename,
			@RequestParam(value = "total", required = true) int totalChunks) {
		File dstFile = new File(FileDir);
		File uploadedFile = new File(dstFile.getPath() + "/" + filename);
		buildChunks(uploadedFile, totalChunks);
	}

	private void buildChunks(File uploadedFile, int totalChunks) {
		File dstFile = new File(FileDir);
		
		for (int i = 1; i <= totalChunks; i++) {
			final File srcFile = new File(dstFile.getPath() + "/" + uploadedFile.getName() + "." + i + "-" + totalChunks);
			
			if (srcFile.exists()) {
				try (OutputStream out = new BufferedOutputStream(new FileOutputStream(uploadedFile, true), BUF_SIZE);
					 BufferedInputStream in = new BufferedInputStream(new FileInputStream(srcFile))) {
					IOUtils.copy(in, out);
				} catch (Exception e) {
					logger.error("Error with chunk file: " + srcFile.getAbsolutePath());
					break;
				}
			} else {
				logger.error("Chunk file does not exists: " + srcFile.getAbsolutePath());
				break;
			}
		}
	}

	@RequestMapping(value = "/upload", method = RequestMethod.POST)
	public void uploader(final HttpServletRequest req, final HttpServletResponse resp) throws Exception {

		logger.debug(">>>>>..... Inside {}.{}", this.getClass().getSimpleName(), "uploadVideo");
		
		String responseString = null; 
		MultipartHttpServletRequest multiRequest = (MultipartHttpServletRequest) req;
		
		String id = null;
		String name = null;
		int chunk = -1;
		int chunks = -1;
		if (req.getContentType().toLowerCase(Locale.getDefault()).startsWith("multipart")) {
			for (Enumeration e = multiRequest.getParameterNames(); e.hasMoreElements();) {
				final String fieldName = (String) e.nextElement();
				final String value = multiRequest.getParameter(fieldName);
				switch (fieldName) {
				case "id":
					id = value;
					break;
				case "name":
					name = value;
					break;
				case "chunks":
					chunks = Integer.parseInt(value);
					break;
				case "chunk":
					chunk = Integer.parseInt(value);
					break;
				}				
			}
			final Map<String, MultipartFile> files = multiRequest.getFileMap();
			for (MultipartFile file : files.values()) {	        	
				final File dstFile = new File(FileDir);
				if (!dstFile.exists()) {
					dstFile.mkdirs();
				}

				final File dst = new File(dstFile.getPath() + "/" + name + "."
						+ (chunk + 1) + "-" + chunks); 

				try {
					try (OutputStream out = new BufferedOutputStream(new FileOutputStream(dst, dst.exists()),
							BUF_SIZE)) {
						IOUtils.copy(file.getInputStream(), out);
						logger.debug("Chunk File: " + dst.getAbsolutePath());
					}
				} catch (final Exception e) {
					dst.delete();
					responseString = String.format(RESP_ERROR, dst.getAbsoluteFile());
					logger.error("User may have aborted upload, so delete this chunk, file: {}", dst
							.getAbsoluteFile());
				}
				logger.info("name: " + file.getName());
			}	
		}

		if (chunk == chunks - 1) {
			logger.info("Uploaded filename: " + name);
		}

		if (responseString == null) {
			responseString = String.format(RESP_SUCCESS, id);
		}

		resp.setContentType(JSON);
		final byte[] responseBytes = responseString.getBytes();
		resp.setContentLength(responseBytes.length);
		final ServletOutputStream output = resp.getOutputStream();
		output.write(responseBytes);
		output.flush();
	}
 */	
}
