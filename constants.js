// Generated by CoffeeScript 2.5.1
(function() {
  module.exports = {
    opinions: {
      love: true,
      like: true,
      meh: true,
      bleh: true,
      hate: true
    },
    goodOpinions: { // don't skip these
      love: true,
      like: true
    },
    weakOpinions: { // skip these if we all agree
      meh: true
    },
    badOpinions: { // skip these
      bleh: true,
      hate: true
    },
    opinionOrder: [
      'love',
      'like',
      'meh',
      'bleh',
      'hate' // always in this specific order
    ]
  };

}).call(this);
