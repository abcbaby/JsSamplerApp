var Book = Backbone.Model.extend({
    defaults: {
        id: "",
        title: ""
    },    
    
    initialize : function() {
    	this.url;
    },
    
    urlRoot: '/rest/book',

	url : function () {
		var url = this.urlRoot;
		if (this.get("id")) {
			url = url + "/" + this.get("id");
		}
		return url;
	},
    
	validate : function () {
		var hasErrors = false;
		var errMesg = '';
		var changes = this.attributes;
		if (changes.title == null || changes.title.trim() == "") {
			errMesg += "Title is required.\n";
			hasErrors = true;
		}
		if (hasErrors) {
			alert(errMesg);
		}
		return hasErrors;
	}
});

var BooksCollection = Backbone.Collection.extend({
    model: Book,

    url: '/rest/books'
});