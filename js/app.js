$(document).ready(function() {

  $logo = $('.navbar-header .navbar-brand img');
  $countdown = $(".countdown");
  $pinBoxes = $('.pin-box');
  $guests = $(".guests");
  $formPin = $("#form-pin")

  $logo.mouseover(function() { $(this).attr("src", 'img/scgold.png'); })
  $logo.mouseout(function() { $(this).attr("src", 'img/sc.png');})
  $countdown.text(getDays() + " Days");
  $pinBoxes.keyup(movePinCursor);
  $formPin.submit(pinSubmission);

  function pinSubmission(e) {
    e.preventDefault();
    $.ajax({
      url: 'http://localhost:3000/getinvitation',
      method: 'get'
    })
    .done(function(resp) {
      debugger
    });
  }

  function movePinCursor(e) {
    if ($(this).val() === "") {
      $(this).prev('.pin-box').focus();
    }
    else {
      $(this).next('.pin-box').focus();
    }
  }

  function getDays() {
    var now = moment(); //todays date
    var end = moment("2017-09-09"); // another date
    var duration = moment.duration(now.diff(end));
    var days = duration.asDays();
    return Math.floor(Math.abs(days));
  }
})
