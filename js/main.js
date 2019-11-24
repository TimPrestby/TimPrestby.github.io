$(document).ready(function(){
  //Allow for smooth scrolling//
  document.getElementById("intro").addEventListener("click", smoothScroll);
  
  function smoothScroll(){
    document.querySelector('#intro').scrollIntoView({ 
        behavior: 'smooth' 
    })
  };

  //Determine the filename for cover to work
  var url = window.location.href;
  var filename = url.substring(url.lastIndexOf('/')+1);

  if(filename == "index.html" || url == "https://timprestby.github.io/" || url == "https://timprestby.github.io/index"){
    //Create scroll monitor to change header//
    var introWatcher = scrollMonitor.create($('.arrow'), 1);
    introWatcher.exitViewport(function (){
    $("nav").addClass('fixed');
  });

  } else {
    $("nav").addClass('fixed');
  };

});

