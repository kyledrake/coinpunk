module.exports = function stripcolorcodes(strWithColors){
  return strWithColors.replace(/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]/g, '');
}
