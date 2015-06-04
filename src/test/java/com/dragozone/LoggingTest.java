package com.dragozone;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LoggingTest {
	static Logger LOGGER = LoggerFactory.getLogger(LoggingTest.class);

	@Test
	public void test() {
		for (int i = 0; i < 10; i++) {
			if (i % 2 == 0) {
				LOGGER.info("Hello {}", i);
			} else {
				LOGGER.debug("I am on index {}", i);
			}
		}
	}

}
