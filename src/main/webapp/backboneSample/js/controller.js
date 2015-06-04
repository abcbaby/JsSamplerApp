var BooksController = Backbone.Marionette.Controller.extend({
    initialize: function (options) {
        var self = this;

        // Hook up the add book event
        sampleApp.on("bookAdd", function (book) {
            self.AddBook(book);
        });

        // Hook up the delete book event
        sampleApp.on("bookDelete", function (book) {
            self.DeleteBook(book);
        });

        // Hook up the edit book event
        sampleApp.on("bookEdit", function (book) {
            self.UpdateBook(book);
        });
    },

    ShowBooksList: function (options) {
        this.collection = new BooksCollection();
        var self = this;
        this.collection.fetch({
            success: function (books) {
                var booksView = new BooksCollectionView({ collection: self.collection });

                options.region.show(booksView);
            }
        });
    },

    ShowAddBookView: function (options) {
        var addBookView = new AddBookView();

        options.region.show(addBookView);
    },

    AddBook: function (book) {
        var BookToSave = book;
        var self = this;
        var myModal = $("#myModal");

        if (BookToSave.isValid()) {
	        BookToSave.save(null, {
//	        	url: "/rest/book/save", // define this if you want to override default
	            success: function (model, respose, options) {
	                console.log("The model has been saved to the server");
	                self.collection.push(model);
	                myModal.modal('hide');
	            },
	            error: function (model, xhr, options) {
	                console.log("Something went wrong while saving the model");
	                myModal.modal('show');
	            }
	        });
		} else {
			myModal.modal('show');
        }
    },

    DeleteBook: function (book) {
        var BookToDelete = book;
        var self = this;

        BookToDelete.id = BookToDelete.get("id");
        BookToDelete.destroy({
            success: function (model, respose, options) {
                console.log("The model has deleted the server");
                self.collection.remove(model);
            },
            error: function (model, xhr, options) {
                console.log("Something went wrong while deleting the model");
            }
        });
    },

    UpdateBook: function (book) {
        var BookToUpdate = book;
        var self = this;
        var myModal = $("#myModal");

        BookToUpdate.id = BookToUpdate.get("id");
        if (BookToUpdate.isValid()) {
        	BookToUpdate.save(null, {
	            success: function (model, respose, options) {
	                console.log("The model has been saved to the server");
	                self.collection.push(model, { merge: true });
	                myModal.modal('hide');
	            },
	            error: function (model, xhr, options) {
	                console.log("Something went wrong while saving the model");
	                myModal.modal('show');
	            }
	        });
		} else {
			myModal.modal('show');
        }
    }
});