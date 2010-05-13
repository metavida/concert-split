// In case I forget to comment out a console.log line.
if(typeof(window.console) == 'undefined') {
  window.console = {log:function(){}};
} else if(typeof(window.console.log) == 'undefined') {
  window.console.log = function(){};
}

jQuery(document).ready(function($) {
  $('#no_js').hide();
  
	var commit_url = 'http://github.com/api/v2/json/commits/list/metavida/concert-split/master?callback=?',
	  tree_url = 'http://github.com/api/v2/json/tree/show/metavida/concert-split/',
	  blob_url = 'http://github.com/api/v2/json/blob/show/metavida/concert-split/',
	  songs_el = $('#songs'),
	  loading_el = $('#songs_loading'),
	  html = '',
	  waiting_on_a = 0;
	waiting_on = 0;
	
	// Get the most recent commit so we know the SHA of the root tree
	waiting_on++;
	$.getJSON(commit_url, function(data) {
		//console.log(data);
		
		// Loop over the list of root directories, which should NPR shows.
		waiting_on++;
		$.getJSON(tree_url + (data.commits[0].tree) +'?callback=?', function(data) {
			//console.log(data);
			$.each(data.tree, function(concert) {
				concert = data.tree[concert];
				if(concert.type == 'tree') {
				  songs_el.append('<h2>'+ concert.name +'</h2><ul></ul>');
				  songs_el.find('h2').last().append(loading_el);
				  var ul_el = songs_el.find('ul').last();
  				
  				// Loop over directories for a single show, which should be individual concerts.
  				waiting_on++;
  				$.getJSON(tree_url + concert.sha +"?callback=?", function(data) {
  				  //console.log(data);
  					$.each(data.tree.sort(), function(concert) {
  						concert = data.tree[concert];
  						if(concert.type == 'tree') {
  						  
  						  // Get the details for this concert.
  						  waiting_on++;
  						  $.getJSON(tree_url + concert.sha +"?callback=?", function(data) {
  						    //console.log(data);
  						    var has_labels = false,
  						      set_sha = '';
            			$.each(data.tree, function(file) {
            			  file = data.tree[file];
  						      if(file.type == 'blob') {
  						        if(file.name.match(/Audacity Labels/i)) {
    						        has_labels = file.sha;
  						        } else if(file.name.match(/Set List/i)) {
  						          set_sha = file.sha;
  						        }
  						      }
                  });
                  if(has_labels && set_sha) {
                    html = '<li><a href="'+ blob_url + has_labels +'">'+ concert.name + '</a>';
                    //html += ' (<a href="'+ blob_url + set_sha +'">view set list</a>)';
                    html += '</li>';
					        } else {
					          html = '<li class="no_labels">'+ concert.name;
					          html += ' (awaiting set list)';
					          html += '</li>';
					        }
					        ul_el.append(html);
                waiting_on--;
                });
  						}
  					});
  				waiting_on--;
  				});
				}
			});
		waiting_on--;
		});
	waiting_on--;
	});
	
	var waiting_id = setInterval(function() {
	  if(waiting_on == 0) {
	    clearInterval(waiting_id);
	    loading_el.hide();
	  }
	}, 100);
});
