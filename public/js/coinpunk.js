var coinpunk = {};

$.ajax('../config.json', {
  async: false,
  complete: function(resp) {
    coinpunk.config = resp.responseJSON;
  }
});
