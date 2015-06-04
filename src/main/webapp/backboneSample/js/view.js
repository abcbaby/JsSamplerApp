var ModalRegion = Marionette.Region.extend({
    constructor: function() {
        Marionette.Region.prototype.constructor.apply(this, arguments);
 
        this._ensureElement();
        this.$el.on('hidden', {region:this}, function(event) {
            event.data.region.close();
        });
    },
 
    onShow: function() {
        this.$el.modal('show');
    },
 
    onClose: function() {
        this.$el.modal('hide');
    }
});

var ActionEditView = Backbone.Marionette.ItemView.extend({
    template: "#editBookView",
    
    events: {
		'change input' : 'inputChanges',
        'click #btnAddBook': "addBook",
        'click #btnEditBook': "editBook"
    },
	
	inputChanges : function(e) { // sync view w/ model
		this.model.set(e.target.name, e.target.value);
	},
    
	addBook: function () {
	    sampleApp.trigger("bookAdd", this.model);
	},
	
    editBook: function() {
	    sampleApp.trigger("bookEdit", this.model);
    }
});

var BookView = Backbone.Marionette.ItemView.extend({
    tagName: 'tr',
    template: "#bookView",
    
    initialize: function() {
        this.listenTo(this.model, "change", this.render);
    },

    events: {
        'click #btnDeleteBook': "deleteBook",
    	'click #btnOpenEditBook': "openEditBook"
    },
    
    templateHelpers: function(){
        var modelIndex = this.model.collection.indexOf(this.model);
        return {
            index: modelIndex
        };
    },
    
    openEditBook: function(event) {
    	var sourceName = $(event.currentTarget).data('document-id');
    	var book = new Book({id: sourceName});
    	book.fetch({
    		async: false,
    		success: function() {
    	    	var modal = new ModalRegion({el:'#myModal'});
    	    	var view = new ActionEditView({model: book});
    	    	 
    	    	modal.show(view);    	
    		}
    	});
    },

    deleteBook: function() {
        if(confirm("Are you sure you want to delete this book")) {
            sampleApp.trigger("bookDelete", this.model);
        }
    }

});

var BooksCollectionView = Backbone.Marionette.CollectionView.extend({
//	itemView: BookView,
    childView: BookView,
    tagName: 'table',
});

var AddBookView = Backbone.Marionette.ItemView.extend({
    template: "#addBookView",
    events: {
        'click #btnOpenAddBook': "openAddBook"
    },
    
    openAddBook: function() {
    	var modal = new ModalRegion({el:'#myModal'});
    	var view = new ActionEditView({model: new Book()});
    	 
    	$('#myModal').on('shown.bs.modal', function () {
    	    $("[name='title']").focus();
    	})
    	modal.show(view); 
    }

});