
// Handlebars helpers
Handlebars.registerHelper('textColor', function (hexColor) {
	return isDarkColor(hexColor) ? 'white' : 'black';
});	

Handlebars.registerHelper('addDivider', function (index) {
	return index == 0 ? "" : "<li class=\"divider\"></li>";
});	

Handlebars.registerHelper('getProperties', function (obj) {
	var strArray = []; // use array instead of string concat for performance
	strArray.push('<tr>');
	strArray.push('<td>Node ID</td>');
	strArray.push('<td>');
	strArray.push(obj['id']);
	strArray.push('</td>');
	strArray.push('</tr>');
	if (_.startsWith(obj['image'], "data:")) {
		strArray.push('<tr>');
		strArray.push('<td>Image</td>');
		strArray.push('<td><img src="');
		strArray.push(obj['image']);
		strArray.push('" height="200px" width="200px"></td>');
		strArray.push('</tr>');
	}
	_.forIn(obj.values, function(value, key) {
		if (key === "imageContent") {
			strArray.push('<tr>');
			strArray.push('<td>More Image(s):</td>');
			strArray.push('<td>');
			if (typeof value === 'string') {
				strArray.push('<img src="');
				strArray.push(value);
				strArray.push('" height="200px" width="200px">');
			} else {
				_.forEach(value, function(it) {
					strArray.push('<img src="');
					strArray.push(it);
					strArray.push('" height="200px" width="200px"><br/>');
				})
			}
			strArray.push('</td>');
			strArray.push('</tr>');
		} else {
			var name = _.startCase(key);
			strArray.push('<tr>');
			strArray.push('<td>');
			strArray.push(name);
			strArray.push('</td>');
			strArray.push('<td>');
			if (key === linkAnalysisVar.docId) {
				// need to split since this may be a resolved nodes
				var sources;
				if (_.isArray(value)) { // e.g. imageContent
					sources = value;
				} else {
					sources = value.split(linkAnalysisVar.mergePropertySeparator); 
				}
				_.forEach(sources, function(item, i) {
					if (i !== 0) {
						strArray.push(linkAnalysisVar.mergePropertySeparator);
						strArray.push(" ");
					}
					strArray.push("<a target='_blank' href='/search/document/");
					strArray.push(item);
					strArray.push("'>");
					strArray.push(item);
					strArray.push("</a>");
				});
			} else {
				strArray.push(value);
			}
			strArray.push('</td>');
			strArray.push('</tr>');;
		}
	})
	
	return strArray.join("");
});	
	        		
Handlebars.registerHelper('seeAlsoSingleTerm', function(seeAlsoItem, options) {
	return seeAlsoItem.displayValue.search(" ") === -1
		? options.fn(this)
		: options.inverse(this);
});

Handlebars.registerHelper('ifEqual', function(item1, item2, options) {
	return item1 === item2
		? options.fn(this)
		: options.inverse(this);
});

Handlebars.registerHelper("formatDate", function(datetime) {
	return new Date(datetime).toLocaleString();
});
