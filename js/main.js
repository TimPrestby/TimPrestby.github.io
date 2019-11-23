$(document).ready(function(){
  //Allow for smooth scrolling//
  document.getElementById("intro").addEventListener("click", smoothScroll);
  
  function smoothScroll(){
    document.querySelector('#intro').scrollIntoView({ 
        behavior: 'smooth' 
    })
  }

  //Determine the filename to trigger cover page
  var url = window.location.pathname;
  var filename = url.substring(url.lastIndexOf('/')+1);

  if(filename == "about.html"){
    $("nav").addClass('fixed');
    
  } else {

    //Create scroll monitor to change header//
    var introWatcher = scrollMonitor.create($('.arrow'), 1);
    introWatcher.exitViewport(function (){
    $("nav").addClass('fixed');
    });

  }

});

