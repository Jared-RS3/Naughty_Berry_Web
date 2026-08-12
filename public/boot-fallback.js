// Safety net: the app clears #boot as it takes over, but if the bundle never
// runs at all this stops the boot screen sealing the page shut. Kept as a file
// rather than inline so the Content-Security-Policy can be `script-src 'self'`
// with no hash to keep in sync.
setTimeout(function () {
  var b = document.getElementById('boot')
  if (b) b.remove()
}, 12000)
