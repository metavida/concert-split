// In case I forget to comment out a console.log line.
if(typeof(window.console) == 'undefined') {
  window.console = {log:function(){}};
} else if(typeof(window.console.log) == 'undefined') {
  window.console.log = function(){};
}

(function() {
  // GitHub URLs relating to the concert-split project.
  var root_url    = 'https://api.github.com/repos/metavida/concert-split/',
      commits_url = root_url + 'commits?sha=master',
      tree_url    = root_url + 'git/trees/master',
      blob_url    = root_url + 'git/blobs';

CSP = {
  // A global counter... the number of AJAX requests we're still waiting on
  // before the page render is considered complete.
  waitingOn: 0,
  
  // When triggerd by a link's event, show an iframe pointing at the link's href
  showTutorialVideo: function(event) {
    event.stopPropagation();
    opts = CSP.innerWidthAndHeight(0.582); // The video is 1280x745
    $.extend(opts, {href:$(this).attr('href'), iframe:true});
    $.colorbox(opts);
    return false;
  },
  
  // When triggered, show a dialog asking the user to use their browser's "Save As"
  // feature instead of a simple click.
  showDownloadPrompt: function(event) {
    event.stopPropagation();
    $.colorbox({innerWidth:400, innerHeight:150, inline:true, href:'#download_prompt'});
    return false;
  },
  
  // When triggered from a concert link, show a dialog containing the "Set List"
  // blob relating to that concert.
  showSetlist: function(event) {
    event.stopPropagation();
    
    var opts = CSP.innerWidthAndHeight(),
      setlist_el = $(this),
      content = setlist_el.data('content'),
      sha = setlist_el.data('sha');
    if(content) {
      $.extend(opts, {html:'<pre>' + $.base64.decode(content) + '</pre>'});
      $.colorbox(opts);
    } else if (sha) {
      CSP.getJSON(blob_url + '/' + sha + '?callback=?', function(blob_data) {
        setlist_el.data('content', blob_data.content.replace(/\n/g, ''));
        $.extend(opts, {html:'<pre>' + $.base64.decode(setlist_el.data('content')) + '</pre>'});
        $.colorbox(opts);
      });
    }
    return false;
  },
  
  // Hilight the area of HTML that the current URL anchor referrs to
  hilightCurrentAnchor: function() {
    var klass = 'current';
    // We need a setTimeout because the URL doesn't update until after the onclick events finish.
    setTimeout(function() {
      var anchor = window.location.href.match(/#(.+)/);
      if(anchor) $('a[name='+anchor[1]+']').next('div').addClass(klass);
    }, 1);
    setTimeout(function() { $('.'+klass).removeClass(klass); }, 2000);
  },
  
  // Return a Hash containing width & height values for $.colorbox based on
  // the current dimensions of the browser viewport.
  innerWidthAndHeight: function(ratio) {
    var thisWidth = $(window).width() - 100,
      thisHeight = $(window).height() - 100;
    if(ratio && thisWidth * ratio > thisHeight)
      thisWidth = thisHeight / ratio;
    return {innerWidth:thisWidth, innerHeight:thisHeight};
  },
  
  // Expire the local cache if all of the following conditions are met.
  // 1) The cache was populated a while back.
  // 2) The tree_root's git hash has changed.
  expireCache: function() {
    var last_update = $.jStorage.get('last_update'),
      last_sha = $.jStorage.get('last_sha'),
      last_week = (new Date).getTime() - 604800000;
    
    if(last_update && last_update > last_week) {
      // If the last update was within a week then the cache is fresh.
      $(document).trigger('cache_is_fresh');
      
    } else {
      // If the last update to the cache is from a while back, check
      // GitHub to see if there have been any recent commits.
      
      CSP.waitingOn++;
      $.getJSON(commits_url, function(data) {
        CSP.waitingOn--;
        var current_sha = data[0].sha;

        if(last_sha == current_sha) {
          // If there haven't been any commits since last we checked
          // don't do anything. It's safe to update the last_update
          // value because we did confirm no new changes as of today.
        } else {
          // If there was a new commit, flush the cache & record the
          // sha of this latest commit.
          $.jStorage.flush();
          $.jStorage.set('last_sha', current_sha);
        }
        // The last time we made confirmed that the cache was freesh
        // was right now.
        $.jStorage.set('last_update', (new Date).getTime());
        
        $(document).trigger('cache_is_fresh');
      });
    }
  },
  
  renderConcertTree: function() {
    var blob_url = 'https://github.com/api/v2/json/blob/show/metavida/concert-split/',
      concerts_el = $('#concerts'),
      loading_el = $('#concerts_loading'),
      html = '';
    
    CSP.getJSON(tree_url + '?callback=?', function(show_data) {
      data_tree = show_data.tree;
      $.each(show_data.tree, function(show) {
        show = show_data.tree[show];
        if(show.type == 'tree') {
          concerts_el.append('<h3>'+ show.path +'</h3><ul></ul>');
          concerts_el.find('h3').last().append(loading_el);
          var ul_el = concerts_el.find('ul').last();

          // Loop over directories for a single show, which should be individual concerts.
          CSP.getJSON(show.url + "?callback=?", function(concert_data) {
            sort_f = function(a, b) { try {
              a = a.path.match(/\d+-\d+-\d/)[0];
              b = b.path.match(/\d+-\d+-\d/)[0];
              if(a > b)
                return -1;
              else if(a < b)
                return 1;
              else
                return 0;
            } catch(err) { return 0; } };
            concert_data = concert_data.tree.sort(sort_f);
            $.each(concert_data, function(concert) {
              concert = concert_data[concert];
              if(concert.type == 'tree') {
                // Add a placeholder li (to preserve order)
                ul_el.append('<li id="concert_'+concert.sha+'" data-sha="'+concert.sha+'"></li>');

                // Get the details for this concert.
                CSP.getJSON(concert.url +"?callback=?", function(file_data) {
                  var label_sha = false,
                    set_sha = false,
                    li_el = ul_el.find('li#concert_'+concert.sha);
                  $.each(file_data.tree, function(file) {
                    file = file_data.tree[file];
                    if(file.type == 'blob') {
                      if(file.path.match(/Audacity Labels/i)) {
                        label_sha = file.sha;
                      } else if(file.path.match(/Set List/i)) {
                        set_sha = file.sha;
                      }
                    }
                  });
                  if(label_sha) {
                    li_el.append('<a href="'+ blob_url + label_sha +'" class="audacity_labels" data-sha="'+label_sha+'">'+ concert.path + '</a>');
                    //if(set_sha)
                    //  li_el.append(' (<a href="'+ blob_url + set_sha +'" class="set_list" data-sha="'+set_sha+'">view set list</a>)');
                    $(li_el).find('a').click(CSP.showDownloadPrompt);
                  } else if(set_sha) {
                    li_el.append(concert.path);
                    li_el.append(' (<a href="#contribute" class="set_list" data-sha="'+set_sha+'">awaiting timestamps</a>)');
                  } else {
                    li_el.append(concert.path);
                    li_el.append(' (<a href="#contribute" class="brand_new">awaiting timestamps</a>)');
                  }
                });
              }
            });
          });
        }
      });
    });
    
    $('#concerts .set_list').click(CSP.showSetlist);
  },
  
  getJSON: function(url, callback) {
    CSP.waitingOn++;
    var cached_data = $.jStorage.get(url),
        with_data = function(data) {
          try { callback(data); } catch(err) {}
          CSP.waitingOn--;
        };
    if(cached_data) {
      with_data(cached_data);
    } else {
      $.getJSON(url, function(data) {
        data = data.data;
        if(data.url)
          $.jStorage.set(data.url + '?callback=?', data);
        with_data(data);
      });
    }
  }
};
})();

$(document).bind('cache_is_fresh', function() {
  $(document).ready(function() {
    CSP.renderConcertTree();
  });
});
CSP.expireCache();

$(document).ready(function() {
  $('#no_js').hide();
  $('#has_js').show();
  $("#intro_video").click(CSP.showTutorialVideo);
  
  var loading_el = $('#concerts_loading'),
      waiting_id = setInterval(function() {
        if(CSP.waitingOn == 0) {
          clearInterval(waiting_id);
          loading_el.hide();
      
          $('a[href*=#]').click(CSP.hilightCurrentAnchor);
        }
      }, 100);
  
  CSP.hilightCurrentAnchor();
});
