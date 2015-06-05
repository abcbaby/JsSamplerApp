package com.dragonzone.testapp;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

import javax.faces.bean.ManagedBean;
import javax.faces.bean.ManagedProperty;
import javax.faces.bean.RequestScoped;

import org.springframework.web.client.RestTemplate;

import com.dragonzone.jsf.util.MessageUtil;

@ManagedBean
@RequestScoped
public class PostControlBean {

	// private String baseURL = "http://jsonplaceholder.typicode.com";
	private String baseURL = "http://localhost:8888";
    @ManagedProperty("#{restTemplate}")
    private RestTemplate restTemplate;
	@ManagedProperty("#{postBean}")
	private PostBean postBean;
	@ManagedProperty(value = "#{param.id}")
	private String id;

	public void preLoadPage() {
		postBean.setBookList(fetchBooks(id));
	}
    
	public List<Book> fetchBooks(String search) {
		Book[] books = search == null 
				? restTemplate.getForObject(baseURL + "/rest/books", Book[].class) 
				: restTemplate.getForObject(baseURL + "/rest/books?id={id}", Book[].class, search);
		List<Book> bookList = new ArrayList<>();
		for (Book book : books) {
			bookList.add(book);
		}
		return bookList;
	}
	
	public void search() {
		postBean.setBookList(fetchBooks(postBean.getSearch()));
	}

	public void convertHtml() {
		try {
			String PHANTOMJSAPPLICATION = "C:/phantomjs-2.0.0-windows/bin/phantomjs.exe";
			String PHANTOMJSSCRIPT = "C:/workspaces/TestApp/src/main/webapp/rasterize.js";
			String HTML_FILE_PATH = "http://www.mkyong.com/spring3/spring-3-hello-world-example/";
			String OUTPUT_FILE_PATH = "c:/tmp/jsf-out.pdf";

			String url = postBean.getUrl() == null ? HTML_FILE_PATH : postBean
					.getUrl();

			String[] cmdArray = { PHANTOMJSAPPLICATION, PHANTOMJSSCRIPT, url,
					OUTPUT_FILE_PATH, " Letter" };
			String[] envParam = { "-Dhttp.proxyHost=firewall",
					"-Dhttp.proxyPort=80" };

			System.out.println("Executing native cmd: "
					+ Arrays.toString(cmdArray) + "; env var: "
					+ Arrays.toString(envParam));

			Process process = Runtime.getRuntime().exec(cmdArray, envParam);

			if (process.waitFor(10, TimeUnit.SECONDS)) {
				MessageUtil.addInfoMessageByString("File out to: "
						+ OUTPUT_FILE_PATH);
			} else {
				MessageUtil
						.addErrorMessageByString("Time out; Command have not done processing!");
			}
		} catch (Exception e) {
			MessageUtil.addErrorMessageByString("Error!");
			e.printStackTrace();
		}
	}

	/**
	 * @param postBean
	 *            the postBean to set
	 */
	public void setPostBean(PostBean postBean) {
		this.postBean = postBean;
	}

	/**
	 * @param id
	 *            the id to set
	 */
	public void setId(String id) {
		this.id = id;
	}

	public void setRestTemplate(RestTemplate restTemplate) {
		this.restTemplate = restTemplate;
	}
}
