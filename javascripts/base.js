jQuery(document).ready(function($) {
	d = '';
	var url = "http://github.com/api/v2/json/commits/list/metavida/concert-split/master?callback=?";
	$.getJSON(url, function(data) {
		console.log(data);
		url = "http://github.com/api/v2/json/tree/show/metavida/concert-split/"+ (data.commits[0].tree) +"?callback=?";
		$.getJSON(url, function(data) {
			console.log(data);
			$.each(data.tree, function(concert) {
				concert = data.tree[concert];
				if(!concert.name.match(/^\./)) {
					$('#songs').append("<div>"+concert.name+"</div>").show();
				}
				
				url = "http://github.com/api/v2/json/tree/show/metavida/concert-split/"+ concert.name +"/"+ concert.sha +"?callback=?";
				console.log(url);
				$.getJSON(url, function(data) {
					$.each(data.tree, function(concert) {
						concert = data.tree[concert];
						if(!concert.name.match(/^\./)) {
							$('#songs').append("<div>"+concert.name+"</div>").show();
						}
					});
				});
				
			});
		});
	});

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
