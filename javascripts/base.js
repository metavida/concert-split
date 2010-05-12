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
	  html = '',
	  waiting_on_a = 0;
	waiting_on = 0;
	
	waiting_on++;
	$.getJSON(commit_url, function(data) {
		console.log(data);
		
		waiting_on++;
		$.getJSON(tree_url + (data.commits[0].tree) +'?callback=?', function(data) {
			console.log(data);
			$.each(data.tree, function(concert) {
				concert = data.tree[concert];
				if(concert.type == 'tree') {
				  html = '<h2>'+ concert.name +'</h2>';
				  html += '<ul>';
  				//console.log(concert.name + '=>' + concert.sha);
  				waiting_on++;
  				$.getJSON(tree_url + concert.sha +"?callback=?", function(data) {
  				  //console.log(data);
  					$.each(data.tree, function(concert) {
  						concert = data.tree[concert];
  						if(concert.type == 'tree') {
  						  console.log(concert.name + '=>' + concert.sha);
  						  waiting_on++;
  						  $.getJSON(tree_url + concert.sha +"?callback=?", function(data) {
  						    console.log(data);
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
                    html += '<li><a href="'+ blob_url + has_labels +'">'+ concert.name + '</a>';
                    //html += ' (<a href="'+ blob_url + set_sha +'">view set list</a>)';
                    html += '</li>';
					        } else {
					          html += '<li class="no_labels">'+ concert.name;
					          html += ' (awaiting set list)';
					          html += '</li>';
					        }
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
	    html += '</ul>';
    	$('#songs').append(html).show();
	  }
	}, 100);

  //$.each($('.post.link.github h3 a'), function() {
  //  var post = $(this).parents(".post");
  //  var url = $(this).attr('href');
  //  var segments = url.split('/');
  //  var repo = segments.pop();
  //  var username = segments.pop();
  //  $.getJSON("http://github.com/api/v2/json/repos/show/"+username+"/"+repo+"?callback=?", function(data){
  //    var repo_data = data.repository;
  //    if(repo_data) {
  //      var watchers_link = $('<a>').addClass('watchers').attr('href', url+'/watchers').text(repo_data.watchers);
  //      var forks_link = $('<a>').addClass('forks').attr('href', url+'/network').text(repo_data.forks);
  //      var comment_link = post.find('.meta .comment-count');
  //      comment_link.after(watchers_link);
  //      comment_link.after(forks_link);
  //    }
  //  });
  //});
});
