// In case I forget to comment out a console.log line.
if(typeof(window.console) == 'undefined') {
  window.console = {log:function(){}};
} else if(typeof(window.console.log) == 'undefined') {
  window.console.log = function(){};
}

function innerWidthAndHeight(ratio) {
  var thisWidth = $(window).width() - 100,
    thisHeight = $(window).height() - 100;
  if(ratio && thisWidth * ratio > thisHeight)
    thisWidth = thisHeight / ratio;
  return {innerWidth:thisWidth, innerHeight:thisHeight};
}

jQuery(document).ready(function($) {
  $('#no_js').hide();
  $('#has_js').show();
  
  show_tutorial_video = function(event) {
    event.stopPropagation();
    opts = innerWidthAndHeight(0.582); // The video is 1280x745
    $.extend(opts, {href:$(this).attr('href'), iframe:true});
    $.colorbox(opts);
    return false;
  };
  $("#intro_video").click(show_tutorial_video);
  
  show_setlist = function(event) {
    event.stopPropagation();
    opts = innerWidthAndHeight();
    $.extend(opts, {href:$(this).attr('href'), iframe:true});
    $.colorbox(opts);
    return false;
  };
  
  hilight_current_anchor();
});

// Hilight the area of HTML that the current URL anchor referrs to
function hilight_current_anchor() {
  var klass = 'current';
  // We need a setTimeout because the URL doesn't update until after the onclick events finish.
  setTimeout(function() {
    var anchor = window.location.href.match(/#(.+)/);
    if(anchor) $('a[name='+anchor[1]+']').next('div').addClass(klass);
  }, 1);
  setTimeout(function() { $('.'+klass).removeClass(klass); }, 2000);
}
