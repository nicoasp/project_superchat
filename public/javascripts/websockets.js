$(document).ready(function(){
  var socket = io.connect('http://localhost:3000');

  $('.sidebar-nav').on('click', 'a', function(e){
    socket.emit('show messages', $(this).text());
    socket.emit('join room', $(this).text());
    var activeRoom = $('#roommessages h2').text();
    if (activeRoom) {
      socket.emit('leave room', activeRoom);
    }
  })

  socket.on('show messages', function(roomObj){
    showRooms();
    initializeRoom(roomObj.roomName);

    $list = $('#roommessages ul');

    for (let i=0; i<roomObj.messages.length; i++) {
      addMessage($list, roomObj.messages[i]);
    }
  })

  socket.on('join room', function(roomObj){
    var roomName = roomObj.roomName;
    $(`.${roomName} p`).text(`${roomObj.number} members`);
  })

  socket.on('leave room', function(roomObj){
    var roomName = roomObj.roomName;
    $(`.${roomName} p`).text(`${roomObj.number} members`);
  })

  $('#submit-message').click(function(e){
    e.preventDefault();
    var body = $('#new-message').val();
    var roomName = $('#roommessages h2').text();
    var author = $("#logged-in-user").text();
    $('#new-message').val('');
    socket.emit('new message', {body, author, roomName});
  })

  socket.on('new message', function(messageObj){
    var activeRoom = $('#roommessages h2').text();
    if (activeRoom === messageObj.roomName) {
      $parent = $('#roommessages ul');
      var message = {
        author: messageObj.author,
        body: messageObj.body
      }
      addMessage($parent, message)
    }
  })

  $('#create-room-submit').keypress(function(e){
    if(e.which == 13){
      e.preventDefault();
      var roomName = $('#create-room input').val();
      socket.emit('create room', roomName);
    }
  })

  socket.on('create room', function(roomName){
    //
    $newA = $('<a>')
      .addClass('room')
      .attr('href', '#')
      .text(roomName);
    $newDiv = $('<div>')
      .addClass(roomName);
    $newLi = $('<li>');
    $newDiv.append($newA);
    $newLi.append($newDiv);
    $('.sidebar-nav').append($newLi);
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
  $('#message-form').removeClass('hidden');
}

function initializeRoom(roomName){
  var $roomName = $('<h2></h2>')
  .text(roomName);
  $room = $('#roommessages');
  $room.html('');
  $room.append($roomName);
  $room.append('<ul></ul>');
}


