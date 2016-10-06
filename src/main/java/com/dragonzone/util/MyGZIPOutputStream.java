package com.dragonzone.util;

import java.io.IOException;
import java.io.OutputStream;
import java.util.zip.Deflater;
import java.util.zip.GZIPOutputStream;

/**
 * Uses GZIPOutputStream but with best compression technique instead of default.
 */
public class MyGZIPOutputStream extends GZIPOutputStream {

	public MyGZIPOutputStream(OutputStream out) throws IOException {
		super(out);
		setLevel(Deflater.BEST_COMPRESSION);
	}

	public MyGZIPOutputStream(OutputStream out, int size) throws IOException {
		super(out, size);
		setLevel(Deflater.BEST_COMPRESSION);
	}

	public void setLevel(int level) {
		def.setLevel(level);
	}
}
