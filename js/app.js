$(document).ready(function() {

  $logo = $('.navbar-header .navbar-brand img');
  $countdown = $(".countdown");
  $pinBoxes = $('.pin-box');
  $guests = $(".guests");
  $formPin = $("#form-pin");
  $formRsvp = $("#form-rsvp");
  $invalidPin = $(".invalid-pin");
  $rsvpSuccess = $(".rsvp-success");
  $serverError = $(".server-error");

  $logo.mouseover(function() { $(this).attr("src", 'img/scgold.png'); })
  $logo.mouseout(function() { $(this).attr("src", 'img/sc.png');})
  $countdown.text(getDays() + " Days");
  $pinBoxes.keyup(movePinCursor);
  $formPin.submit(pinSubmission);
  $formRsvp.submit(submitRsvp);

  function submitRsvp(e) {
    e.preventDefault();
    $.ajax({
      url: 'http://localhost:3000/submitrsvp',
      method: 'post',
      data: $(this).serialize()
    })
    .done(function(resp) {
      $guests.fadeOut();
      $rsvpSuccess.fadeIn();
    })
  }

  function pinSubmission(e) {
    e.preventDefault();
    $formRsvp.empty();
    $guests.fadeOut();
    $invalidPin.fadeOut();
    $rsvpSuccess.fadeOut();
    $serverError.fadeOut();

    $.ajax({
      url: 'http://localhost:3000/getinvitation',
      method: 'get',
      data: {
        pin: getPin()
      }
    })
    .done(function(resp) {
      if (resp.result === "Found") {
        var guests = resp.guests;
        guests.forEach(function(guest) {
          renderGuest(guest);
          populateFields(guest);
        })
        var submitButton = '<input type="submit" class="btn-submit" value="Submit">'
        $formRsvp.append(submitButton);
        $guests.fadeIn();
        scrollToSection($formRsvp);
      }
      else {
        $invalidPin.fadeIn();
      }
    })
    .fail(function(err) {
      $serverError.fadeIn();
    })
  }

  function getPin(e) {
    var pin = '';
    $pinBoxes.each(function() {
      pin += ($(this).val());
    })
    return +pin;
  }

  function movePinCursor(e) {
    if ($(this).val() === "") {
      $(this).prev('.pin-box').focus();
    }
    else {
      $(this).next('.pin-box').focus();
    }
  }

  function populateFields(guest) {
    if (guest.attend === "yes") {
      $(":radio[name=" + guest.guest_id + "-attending]").filter(':radio[value=yes]')[0].checked = true;
      // $("textarea[name=" + guest.guest_id + "-diet]").first().hide();
    }
    else if (guest.attend === "no") {
      $(":radio[name=" + guest.guest_id + "-attending]").filter(':radio[value=no]')[0].checked = true
      // $("textarea[name=" + guest.guest_id + "-diet]").first().hide();
    }
    $("textarea[name=" + guest.guest_id + "-diet]").first().val(guest.diet);
  }

  function renderGuest(guest) {
    var guestsDiv = [
    '<div class="form-group row guest">',
      '<div class="col-xs-12">',
        '<p>' + guest.first_name + ' ' + guest.last_name + '</p>',
      '</div>',
      '<div class="col-xs-12">',
        '<label>',
          '<input type="radio" name="' + guest.guest_id + '-attending" value="yes">',
          'Attending',
        '</label>',
        '<label>',
          '<input type="radio" name="' + guest.guest_id + '-attending" value="no">',
          'Not Attending',
        '</label>',
      '</div>',
      '<div class="col-xs-12">',
        '<textarea name="' + guest.guest_id + '-diet" placeholder="Please enter your dietery requirements"></textarea>',
      '</div>',
    '</div>'
    ].join("\n");
    $formRsvp.append(guestsDiv);
  }

  function getDays() {
    var now = moment(); //todays date
    var end = moment("2017-09-09"); // another date
    var duration = moment.duration(now.diff(end));
    var days = duration.asDays();
    return Math.floor(Math.abs(days));
  }

  function scrollToSection(section) {
    $('html, body').animate({ scrollTop: section.offset().top }, 1000);
  }
})
