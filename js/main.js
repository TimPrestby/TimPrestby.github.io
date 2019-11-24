$(document).ready(function(){
  //Allow for smooth scrolling//
  document.getElementById("intro").addEventListener("click", smoothScroll);
  
  function smoothScroll(){
    document.querySelector('#intro').scrollIntoView({ 
        behavior: 'smooth' 
    })
  }

  //Determine the filename for cover and to work
  var url = window.location.pathname;
  var filename = url.substring(url.lastIndexOf('/')+1);
  var fullURL = window.location.href

  if(filename == "index.html" || fullURL == "https://timprestby.github.io/" ){
    //Create scroll monitor to change header//
    var introWatcher = scrollMonitor.create($('.arrow'), 1);
    introWatcher.exitViewport(function (){
    $("nav").addClass('fixed');
  });

  } else {
    $("nav").addClass('fixed');
  }

});

