$(document).ready(function(){
  $('.sidebar-nav').on('click', 'a', function(e){
    $('.room').removeClass('selected');
    console.log(e.target);
    $(e.target).addClass('selected');
  })

  $('#create-new-channel').click(function(){
    $('.new-channel-form').toggleClass('hidden');
  });

   $('#create-new-dm').click(function(){
    $('.users-header').toggleClass('hidden');
    $('.user-list').toggleClass('hidden');
  })
})