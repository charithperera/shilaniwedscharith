$(document).ready(function() {

  // openWeather API a1a4085162cabcaa54f5f85f642060c8
  // http://api.openweathermap.org/data/2.5/forecast/city?id=524901&APPID=a1a4085162cabcaa54f5f85f642060c8

  var $logo = $('.navbar-header .navbar-brand img');
  var $countdown = $(".countdown");
  var $pinBoxes = $('.pin-box');
  var $guests = $(".guests");
  var $formPin = $("#form-pin");
  var $formRsvp = $("#form-rsvp");
  var $invalidPin = $(".invalid-pin");
  var $rsvpSuccess = $(".rsvp-success");
  var $serverError = $(".server-error");
  var $bridalSpotlight = $(".bridal figure");

  $logo.mouseover(function() { $(this).attr("src", 'img/scgold.png'); })
  $logo.mouseout(function() { $(this).attr("src", 'img/sc.png');})
  $countdown.text(getDays() + " Days");
  $pinBoxes.keyup(movePinCursor);
  $formPin.submit(pinSubmission);
  $formRsvp.submit(submitRsvp);
  $bridalSpotlight.click(showModal);

  getWeather();

  function getWeather() {
    $.ajax({
      url: 'http://api.openweathermap.org/data/2.5/forecast/daily?q={Brisbane},{AU}&cnt={7}&units=metric&APPID=a1a4085162cabcaa54f5f85f642060c8',
      method: 'get'
    })
    .done(function(resp) {
      var forecastData = buildWeatherData(resp.list);
      renderWeather(forecastData);
    });
  }

  function renderWeather(data) {
    var nextSaturdayMoment = getNextSaturday();
    var nextSaturdayWeather = data.filter(function(day) {
      return day.date.day() == nextSaturdayMoment.day();
    });
    debugger;
  }

  function buildWeatherData(dataDays) {
    var data = []
    dataDays.forEach(function(day) {
      var newDay = {
        date: moment.unix(day.dt),
        min: day.temp.min,
        max: day.temp.max,
        day: day.temp.day,
        type: day.weather[0].main
      }
      data.push(newDay);
    });

    return data;
  }

  function showModal(e) {
    var personName = $(this).find("figcaption").text();
    $('#modal' + personName +'').modal();
  }


  function submitRsvp(e) {
    e.preventDefault();
    $serverError.fadeOut();
    $.ajax({
      url: 'http://localhost:3000/submitrsvp',
      method: 'post',
      data: $(this).serialize()
    })
    .done(function(resp) {
      $guests.fadeOut();
      $rsvpSuccess.fadeIn();
    })
    .fail(function(err) {
      $serverError.fadeIn();
      scrollToSection($(".rsvp"));
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
        scrollToSection($(".rsvp"));
      }
      else {
        $invalidPin.fadeIn();
        scrollToSection($(".rsvp"));
      }
    })
    .fail(function(err) {
      $serverError.fadeIn();
      scrollToSection($(".rsvp"));
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
      '<input type="hidden" name="pin" value="' +  getPin() + '" />',
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

  function getNextSaturday() {
    var dayINeed = 6
    if (moment().isoWeekday() <= dayINeed) {
      return moment().isoWeekday(dayINeed);
    } else {
      return moment().add(1, 'weeks').isoWeekday(dayINeed);
    }
  }
})
