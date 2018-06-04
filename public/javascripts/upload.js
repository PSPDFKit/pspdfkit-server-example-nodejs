(function() {
  // Upload Form
  var form = document.querySelectorAll('form[action="/upload"]')[0];
  var input = form.querySelectorAll('input[type="file"]')[0];

  input.addEventListener("change", function(e) {
    if (e.target.files.length > 0) {
      form.submit();
      form.setAttribute("disabled", true);
    }
  });
})();
