var LINKS = window.SITE.links;
var DEPARTURE = window.SITE.departure;
try {
  var box = document.getElementById("links");
  LINKS.forEach(function (l, i) {
    var a = document.createElement("a");
    a.className = "link" + (l.main ? " main" : "");
    a.href = l.url;
    if (/^https?:/.test(l.url)) { a.target = "_blank"; a.rel = "noopener"; }
    a.innerHTML = '<span class="n">0' + (i + 1) + '</span><span class="t"><b></b><span></span></span><span class="a">↗</span>';
    a.querySelector("b").textContent = l.title;
    a.querySelector(".t span").textContent = l.desc;
    box.appendChild(a);
  });
  document.getElementById("y").textContent = new Date().getFullYear();

  var target = new Date(DEPARTURE).getTime();
  function pad(n){ return n < 10 ? "0" + n : "" + n; }
  function tick() {
    var diff = target - Date.now();
    if (diff <= 0) {
      document.getElementById("clock").style.display = "none";
      document.getElementById("msg").textContent = "Já estou na estrada";
      document.getElementById("msg2").textContent = "Vem comigo acompanhar cada passo.";
      clearInterval(timer);
      return;
    }
    var s = Math.floor(diff / 1000);
    document.getElementById("cd").textContent = pad(Math.floor(s / 86400));
    document.getElementById("ch").textContent = pad(Math.floor(s % 86400 / 3600));
    document.getElementById("cm").textContent = pad(Math.floor(s % 3600 / 60));
    document.getElementById("cs").textContent = pad(s % 60);
  }
  var timer = setInterval(tick, 1000);
  tick();
} catch (e) { console.error(e); }
