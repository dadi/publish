module.exports = function(min, max) {
  return Math.ceil(min - 1 + (max - min + 1) * Math.random())
}
