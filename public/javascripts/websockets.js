$(document).ready(function(){
  var socket = io.connect('http://localhost:3000');

  $('.sidebar-nav').on('click', '.room', function(e){
    socket.emit('show messages', $(this).text());
    socket.emit('join room', $(this).text());
    var activeRoom = $('.messages-header h2').text();
    if (activeRoom) {
      socket.emit('leave room', activeRoom);
    }
  })

  $('.sidebar-nav').on('click', '.user', function(e){
    var author = $("#current-user").text();
    socket.emit('create private room', author, $(this).text());
  })

  socket.on('show messages', function(roomObj){
    showRooms();
    initializeRoom(roomObj.roomName);

    $list = $('#roommessages ul');

    for (let i=0; i<roomObj.messages.length; i++) {
      addMessage($list, roomObj.messages[i]);
    }
  })

  socket.on('create private room', function(roomObj){
    var user1 = roomObj.user1;
    var user2 = roomObj.user2;
    var activeUser = $("#current-user").text();
    var nameToAdd = (activeUser === user1) ? user2 : user1;

    $newA = $('<a>')
      .addClass('user')
      .attr('href', '#')
      .text(nameToAdd);
    $newDiv = $('<div>')
      .addClass(nameToAdd);
    $newLi = $('<li>')
      .addClass('dm-list');
    $newDiv.append($newA);
    $newLi.append($newDiv);
    $('.dm-header').after($newLi);
    $('.users-header').toggleClass('hidden');
    $('.user-list').toggleClass('hidden');

  })

  socket.on('join room', function(roomObj){
    var roomName = roomObj.roomName;
    var activeRoom = $('.messages-header h2').text();
    if (roomObj.roomName === activeRoom) {
      $('#room-members').text(`${roomObj.number} members`);
    }
  })

  socket.on('leave room', function(roomObj){
    var roomName = roomObj.roomName;
    var activeRoom = $('.messages-header h2').text();
    if (roomObj.roomName === activeRoom) {
      $('#room-members').text(`${roomObj.number} members`);
    }
  })

  $('#new-message').keypress(function(e){
    if(e.which == 13){
      e.preventDefault();
      var body = $('#new-message').val();
      var roomName = $('.messages-header h2').text();
      var author = $("#current-user").text();
      $('#new-message').val('');
      socket.emit('new message', {body, author, roomName});
    }
  })

  socket.on('new message', function(messageObj){
    var activeRoom = $('.messages-header h2').text();
    if (activeRoom === messageObj.roomName) {
      $parent = $('#roommessages ul');
      var message = {
        author: messageObj.author,
        body: messageObj.body
      }
      addMessage($parent, message)
      $("#roomMessages").scrollTop(500);
    }
  })

  $('#create-room-submit').keypress(function(e){
    if(e.which == 13){
      e.preventDefault();
      var roomName = $('#create-room input').val();
      $('#create-room input').val('');
      socket.emit('create room', roomName);
    }
  })

  socket.on('create room', function(roomName){
    $newA = $('<a>')
      .addClass('room')
      .attr('href', '#')
      .text(roomName);
    $newDiv = $('<div>')
      .addClass(roomName);
    $newLi = $('<li>')
      .addClass('room-list');
    $newDiv.append($newA);
    $newLi.append($newDiv);
    $('.dm-header').before($newLi);
    $('.new-channel-form').toggleClass('hidden');
  })



})

function addMessage(parent, message) {
  var $author = $('<h4></h4>')
  .text(message.author);
  var $body = $('<p></p>')
  .text(message.body);
  var $messageDiv = $('<div></div>')
  .append($author)
  .append($body);
  var $messageLi = $('<li class="list-group-item"></li>')
  .append($messageDiv);

  parent.append($messageLi);
}

function showRooms(){
  $('#roommessages').removeClass('hidden');
  $('.messages-header').removeClass('hidden');
  $('#message-form').removeClass('hidden');
}

function initializeRoom(roomName){
  var $navbarTitle = $('.messages-header h2');
  $navbarTitle.text(roomName)
  var $room = $('#roommessages');
  $room.html('');
  $room.append('<ul id="roomMessages"></ul>');
}


