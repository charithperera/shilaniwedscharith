$(document).ready(function() {

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
  var $weather = $(".weather");
  var $rsvp = $(".rsvp");
  var $stay = $(".stay");
  var $story = $(".story");
  var $bridal = $(".bridal");
  var $day = $(".day");
  var $stay = $(".stay");
  var $instagram = $(".instagram");
  var $loading = $('.loading');

  $logo.mouseover(function() { $(this).attr("src", 'img/scgold.png'); })
  $logo.mouseout(function() { $(this).attr("src", 'img/sc.png');})
  $countdown.text(getDays() + " Days");
  $pinBoxes.keyup(movePinCursor);
  $formPin.submit(pinSubmission);
  $formRsvp.submit(submitRsvp);
  $bridalSpotlight.click(showModal);

  $(".navbar-brand").on('click', function(e) { scrollToSection($(".header")) } );
  $(".nav-story").on('click', function(e) { scrollToSection($story); });
  $(".nav-rsvp").on('click', function(e) {
    scrollToSection($rsvp);
    $pinBoxes.first().focus();
    $pinBoxes.first().select();
  });
  $(".nav-bridal").on('click', function(e) { scrollToSection($bridal); });
  $(".nav-day").on('click', function(e) { scrollToSection($day); });
  $(".nav-stay").on('click', function(e) { scrollToSection($stay); });
  $(".nav-instagram").on('click', function(e) { scrollToSection($instagram); });

  var feed = getFeed();
  feed.run();
  getWeather();
  new WOW().init();

  $(document)
    .ajaxStart(function () {
      $loading.show();
    })
    .ajaxStop(function () {
      $loading.hide();
    });

  $(".bg-reveal").delay(1500).slideUp(1000)

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
    var nextFridayMoment = getNextFriday();
    var nextSaturdayMoment = getNextSaturday();
    var getNextSundayMoment = getNextSunday();

    data.forEach(function(day) {
      if (day.date.day() == nextFridayMoment.day()) {
        renderFriday(day);
      }
      else if (day.date.day() == nextSaturdayMoment.day()) {
          renderSaturday(day);
      }
      else if (day.date.day() == getNextSundayMoment.day()) {
        renderSunday(day);
      }
    });
  }

  function renderSaturday(data) {
    $(".weather-saturday h4").text(data.date.format('dddd Do of MMM'));
    $('.weather-saturday i').addClass(getWeatherClass(data.type));
    $(".weather-saturday .weather-description").text(data.description);
    $(".weather-saturday .day-temp").text(data.day);
    $(".weather-saturday .low-temp").text(data.min);
    $(".weather-saturday .high-temp").text(data.max);
  }

  function renderFriday(data) {
    $(".weather-friday h5").text(data.date.format('dddd Do of MMM'));
    $(".weather-friday .weather-description").text(data.description);
    $(".weather-friday .day-temp").text(data.day);
    $(".weather-friday .low-temp").text(data.min);
    $(".weather-friday .high-temp").text(data.max);
  }

  function renderSunday(data) {
    $(".weather-sunday h5").text(data.date.format('dddd Do of MMM'));
    $(".weather-sunday .weather-description").text(data.description);
    $(".weather-sunday .day-temp").text(data.day);
    $(".weather-sunday .low-temp").text(data.min);
    $(".weather-sunday .high-temp").text(data.max);
  }

  function getWeatherClass(type) {
    switch (type) {
      case "Thunderstorm":
        return "wi wi-thunderstorm"
      case "Drizzle":
        return "wi wi-sprinkle"
      case "Rain":
        return "wi wi-rain"
      case "Snow":
        return "wi wi-snow"
      case "Atmosphere":
        return "wi wi-fog"
      case "Clear":
        return "wi wi-day-sunny"
      case "Clouds":
        return "wi wi-cloudy"
      case "Extreme":
        return "wi wi-hail"
      case "Additional":
        return "wi wi-storm-warning"
      default:
        return "wi wi-na"
    }
  }

  function buildWeatherData(dataDays) {
    var data = []
    dataDays.forEach(function(day) {
      var newDay = {
        date: moment.unix(day.dt),
        min: day.temp.min,
        max: day.temp.max,
        day: day.temp.day,
        type: day.weather[0].main,
        description: day.weather[0].description
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
      url: 'https://shilaniwedscharith.herokuapp.com/submitrsvp',
      method: 'post',
      data: $(this).serialize()
    })
    .done(function(resp) {
      $guests.fadeOut();
      scrollToSection($rsvp);
      $rsvpSuccess.fadeIn();
    })
    .fail(function(err) {
      $serverError.fadeIn();
      scrollToSection($rsvp);
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
      url: 'https://shilaniwedscharith.herokuapp.com/getinvitation',
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
          applyStyles();
          populateFields(guest);
        })
        var submitButton = '<input type="submit" class="btn-submit" value="Submit">'
        $formRsvp.append(submitButton);
        $guests.fadeIn();
        scrollToSection($(".btn-pin"));
      }
      else {
        $invalidPin.fadeIn();
        scrollToSection($rsvp);
      }
    })
    .fail(function(err) {
      $serverError.fadeIn();
      scrollToSection($rsvp);
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
    key = e.which || e.keyCode || 0;

    if (key === 37) {
      $(this).prev('.pin-box').focus();
      $(this).prev('.pin-box').select();
    }
    else if (key === 39 || $(this).val() !== "") {
      $(this).next('.pin-box').focus();
      $(this).next('.pin-box').select();
    }
    else if (key === 8) {
      $(this).val("");
      $(this).prev('.pin-box').focus();
      $(this).prev('.pin-box').select();
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
        '<h4>' + guest.name + '</h4>',
      '</div>',
      '<div class="col-xs-12">',
        '<label>',
          '<input type="radio" name="' + guest.guest_id + '-attending" value="yes" required>',
          'Attending',
        '</label>',
        '<label>',
          '<input type="radio" name="' + guest.guest_id + '-attending" value="no" required>',
          'Not Attending',
        '</label>',
      '</div>',
      '<div class="col-xs-12">',
        '<p>Dietery Requests</p>',
        '<textarea maxlength="160" name="' + guest.guest_id + '-diet"></textarea>',
      '</div>',
    '</div>'
    ].join("\n");
    $formRsvp.append(guestsDiv);
  }

  function applyStyles() {
    $(".guest textarea").addClass("guest-textarea");
    $(".guest textarea").addClass("no-focus");
    $(".guest p").css("margin", "10px 0 0 0");
  }



  function getDays() {
    var now = moment(); //todays date
    var end = moment("2017-09-09"); // another date
    var duration = moment.duration(now.diff(end));
    var days = duration.asDays();
    return Math.floor(Math.abs(days));
  }

  function scrollToSection(section) {
    $('html, body').animate({ scrollTop: section.offset().top }, 500);
  }

  function getNextSaturday() {
    var dayINeed = 6
    if (moment().isoWeekday() <= dayINeed) {
      return moment().isoWeekday(dayINeed);
    } else {
      return moment().add(1, 'weeks').isoWeekday(dayINeed);
    }
  }

  function getNextFriday() {
    var dayINeed = 5
    if (moment().isoWeekday() <= dayINeed) {
      return moment().isoWeekday(dayINeed);
    } else {
      return moment().add(1, 'weeks').isoWeekday(dayINeed);
    }
  }

  function getNextSunday() {
    var dayINeed = 7
    if (moment().isoWeekday() <= dayINeed) {
      return moment().isoWeekday(dayINeed);
    } else {
      return moment().add(1, 'weeks').isoWeekday(dayINeed);
    }
  }

  function getFeed() {
    return new Instafeed({
        get: 'tagged',
        tagName: 'shilaniwedscharith',
        template: '<li class="list-group-item wow fadeIn"><a target="_blank" href="{{link}}"><img src="{{image}}" /></a></li>',
        accessToken: '3077885031.ba4c844.9ac96e9e5e104be4ad14ebf31d2c0ca9',
        sortBy: 'most-recent'
    });
  }

})
