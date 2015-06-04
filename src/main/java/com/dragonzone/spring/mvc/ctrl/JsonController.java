package com.dragonzone.spring.mvc.ctrl;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.dragonzone.testapp.Book;
import com.dragonzone.testapp.Post;

@Controller
@RequestMapping("/rest")
public class JsonController {
    
    List<Book> bookList;
    
    {
    	bookList = getBookList();
    }
    
    @RequestMapping(value = "/books/reset", method = RequestMethod.GET)
    public @ResponseBody String resetBookInJSON() {
    	bookList = null;
    	bookList = getBookList();
    	return "All data have been reset.";
    }
    
    @RequestMapping(value = "/book", method = { RequestMethod.POST, RequestMethod.PUT })
    @ResponseStatus(HttpStatus.CREATED)
    public @ResponseBody Book createBookInJSON(@RequestBody Book book) {
		book.setId("id" + (bookList.size() + 1));
		bookList.add(book);
		return book;
    }
    
    @RequestMapping(value = "/book/{id}", method = RequestMethod.PUT )
    public @ResponseBody Book updateBookInJSON(@PathVariable String id, @RequestBody Book book) {
		int index = -1;
		for (int i = 0; i < bookList.size(); i++) {
			Book b = bookList.get(i);
			if (b.getId().equals(book.getId())) {
				index = i;
				break;
			}
		}
		
		if (index != -1) {
			bookList.set(index, book);
		}
    	return book;
    }
    
    @RequestMapping(value = "/book/{id}", method = RequestMethod.GET)
    public @ResponseBody Book getBookInJSON(@PathVariable String id) {
    	Book book = null;
    	for (Book b : bookList) {
			if (id.equals(b.getId())) {
				book = b;
				break;
			}
		}
    	return book;
    }
    
    @RequestMapping(value = "/book/{id}", method = RequestMethod.DELETE)
    @ResponseStatus(HttpStatus.OK)
    public @ResponseBody Book deleteBookInJSON(@PathVariable String id) {
		int index = -1;
		for (int i = 0; i < bookList.size(); i++) {
			Book b = bookList.get(i);
			if (id.equals(b.getId())) {
				index = i;
				break;
			}
		}
		
    	Book deletedBook = null;
		if (index != -1) {
			deletedBook = bookList.remove(index);
		}
		
		// backbone.js expects the deleted object to be return; otherwise it will throw an error
		return deletedBook;
    }
    
    @RequestMapping(value = "/books", method = RequestMethod.GET)
    @ResponseStatus(HttpStatus.OK)
    public @ResponseBody List<Book> getBooksInJSON(@RequestParam(value="id", required=false) String id) {
    	List<Book> bList;
    	
    	if (id == null) {
    		bList = bookList;
    	} else {
    		bList = new ArrayList<>();
        	for (Book book : bookList) {
    			if (book.getId().contains(id)) {
    				bList.add(book);
    			}
    		}
    	}
    	return bList;
    }
    
    private List<Book> getBookList() {
    	if (bookList == null) {
    		bookList = new ArrayList<>();
    		int min = 100;
    		int max = 200;
    		Random random = new Random();
    		int total = random.nextInt(max - min + 1) + min;
    		for (int i = 1; i <= total; i++) {
				bookList.add(new Book("id" + i, "Book Title " + i, "Description section" + i));
			}
    	}
    	return bookList;
    }
    
    public void convertHtml() {
    	try {
        	System.setProperty("http.proxyHost", "firewall");
        	System.setProperty("http.proxyPort", "80");
        	String PHANTOMJSAPPLICATION = "C:/phantomjs-2.0.0-windows/bin/phantomjs.exe";
        	String PHANTOMJSSCRIPT = "C:/workspaces/TestApp/src/main/webapp/rasterize.js";
            String HTML_FILE_PATH = "http://www.mkyong.com/spring3/spring-3-hello-world-example/";
            String OUTPUT_FILE_PATH = "c:/tmp/jsf-out.pdf";
            
            String[] cmdArray = {PHANTOMJSAPPLICATION, PHANTOMJSSCRIPT, HTML_FILE_PATH, OUTPUT_FILE_PATH, " Letter"};
            String[] envParam = {"-Dhttp.proxyHost=firewall", "http.proxyPort=80" };
     
            System.out.println("Executing native cmd: " + Arrays.toString(cmdArray) + "; env var: " + Arrays.toString(envParam));
            
            Process process = Runtime.getRuntime().exec(cmdArray, envParam);
            
            if (!process.waitFor(10, TimeUnit.SECONDS)){
                System.out.println("Time out; Command have not done processing!");
            }
			
		} catch (Exception e) {
			e.printStackTrace();
		}
    }
}
