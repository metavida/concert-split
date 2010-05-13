// In case I forget to comment out a console.log line.
if(typeof(window.console) == 'undefined') {
  window.console = {log:function(){}};
} else if(typeof(window.console.log) == 'undefined') {
  window.console.log = function(){};
}

jQuery(document).ready(function($) {
  $('#no_js').hide();
  $('#has_jas').show();
  
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
		$.getJSON(tree_url + (data.commits[0].tree) +'?callback=?', function(show_data) {
			//console.log(show_data);
			$.each(show_data.tree, function(concert) {
				concert = show_data.tree[concert];
				if(concert.type == 'tree') {
				  songs_el.append('<h3>'+ concert.name +'</h3><ul></ul>');
				  songs_el.find('h3').last().append(loading_el);
				  var ul_el = songs_el.find('ul').last();
  				
  				// Loop over directories for a single show, which should be individual concerts.
  				waiting_on++;
  				$.getJSON(tree_url + concert.sha +"?callback=?", function(concert_data) {
  				  sort_f = function(a, b) { try {
  				    a = a.name.match(/\d+-\d+-\d/)[0];
  				    b = b.name.match(/\d+-\d+-\d/)[0];
  				    console.log(a);
    				  console.log(b);
    				  console.log('----');
  				    if(a > b)
  				      return 1;
  				    else if(a < b)
    				    return -1;
    				  else
    				    return 0;
  				  } catch(err) { return 0; } };
  				  concert_data = concert_data.tree.sort(sort_f);
  				  console.log(concert_data);
  					$.each(concert_data, function(concert) {
  					  console.log(concert);
  						concert = concert_data[concert];
  						console.log(concert);
  						if(concert.type == 'tree') {
  						  
  						  // Get the details for this concert.
  						  waiting_on++;
  						  $.getJSON(tree_url + concert.sha +"?callback=?", function(file_data) {
  						    //console.log(file_data);
  						    var has_labels = false,
  						      set_sha = '';
            			$.each(file_data.tree, function(file) {
            			  file = file_data.tree[file];
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
