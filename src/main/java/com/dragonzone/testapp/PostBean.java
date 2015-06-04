package com.dragonzone.testapp;

import java.io.Serializable;
import java.util.List;
import javax.faces.bean.ManagedBean;
import javax.faces.bean.ViewScoped;

@ManagedBean
@ViewScoped
public class PostBean implements Serializable {
	private static final long serialVersionUID = -7982186421655724490L;
	private List<Book> bookList;

	private String url;
	private String search;

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}


    public String getSearch() {
		return search;
	}

	public void setSearch(String search) {
		this.search = search;
	}

	public List<Book> getBookList() {
		return bookList;
	}

	public void setBookList(List<Book> bookList) {
		this.bookList = bookList;
	}
}
