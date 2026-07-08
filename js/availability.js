/* KinStay Massanutten — live availability calendar
   Greys out nights that are booked on Airbnb/VRBO by reading their iCal feeds.

   IMPORTANT (privacy): the raw Airbnb/VRBO iCal URLs contain guest data (reservation
   confirmation codes + last-4 phone digits) and must NOT be placed in this file — it ships
   to the public site. Instead, deploy the small Cloudflare Worker in the README, which holds
   the feed URLs server-side, strips everything except the booked dates, and adds CORS headers.
   Then set CONFIG.endpoint to the Worker URL below. See README → "Live availability calendar". */
(function () {
  "use strict";

  var CONFIG = {
    // How many months to show, starting with the current month.
    months: 3,

    // URL of your Cloudflare Worker (returns merged, sanitized iCal with CORS headers).
    // Leave empty until deployed — the calendar then shows a graceful fallback.
    endpoint: "https://kinstay-cal.kinstay.workers.dev"
  };

  var el = document.getElementById("availabilityCalendar");
  if (!el) return;

  var MS_DAY = 86400000;

  function iso(d) {
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }

  // Collect booked date strings ("YYYY-MM-DD") from every VEVENT.
  // DTEND is exclusive per the spec, so the check-out day stays available.
  function parseICS(text, booked) {
    text = text.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, ""); // unfold folded lines
    var lines = text.split(/\r\n|\n|\r/);
    var start = null, end = null, inEvent = false;
    function toDate(v) {
      var m = v.match(/(\d{4})(\d{2})(\d{2})/);
      return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
    }
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (line.indexOf("BEGIN:VEVENT") === 0) { inEvent = true; start = end = null; }
      else if (line.indexOf("END:VEVENT") === 0) {
        if (start && end) {
          for (var t = start.getTime(); t < end.getTime(); t += MS_DAY) booked[iso(new Date(t))] = true;
        } else if (start) { booked[iso(start)] = true; }
        inEvent = false;
      } else if (inEvent) {
        if (line.indexOf("DTSTART") === 0) start = toDate(line.split(":").pop());
        else if (line.indexOf("DTEND") === 0) end = toDate(line.split(":").pop());
      }
    }
  }

  function render(booked, msg, statusClass, showAvail) {
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var wd = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    var html =
      '<div class="cal-status ' + (statusClass || "") + '">' +
        '<span class="cal-legend">' +
          '<span><i class="cal-dot avail"></i>Available</span>' +
          '<span><i class="cal-dot booked"></i>Booked</span>' +
        '</span>' +
        '<span class="cal-msg">' + msg + '</span>' +
      '</div><div class="cal-months">';

    for (var m = 0; m < CONFIG.months; m++) {
      var d = new Date(today.getFullYear(), today.getMonth() + m, 1);
      html += '<div class="cal-month"><h4>' +
        d.toLocaleString("en-US", { month: "long", year: "numeric" }) +
        '</h4><div class="cal-grid">';
      for (var w = 0; w < 7; w++) html += '<div class="cal-wd">' + wd[w] + '</div>';
      for (var b = 0; b < d.getDay(); b++) html += '<div class="cal-day empty"></div>';
      var daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      for (var day = 1; day <= daysInMonth; day++) {
        var cur = new Date(d.getFullYear(), d.getMonth(), day);
        var cls = "cal-day";
        if (cur < today) cls += " past";
        else if (booked[iso(cur)]) cls += " booked";
        else if (showAvail) cls += " available";
        html += '<div class="' + cls + '">' + day + '</div>';
      }
      html += '</div></div>';
    }
    el.innerHTML = html + '</div>';
  }

  if (!CONFIG.endpoint) {
    render({}, "Confirm your dates on Airbnb or VRBO below.", "", false);
    return;
  }

  render({}, "Loading live availability…", "", false);
  var booked = {};
  fetch(CONFIG.endpoint)
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(function (t) {
      parseICS(t, booked);
      render(booked, "Synced from our Airbnb & VRBO calendars.", "", true);
    })
    .catch(function () {
      render(booked, "Couldn't load live availability — please use the Airbnb/VRBO links below.", "error", false);
    });
})();
