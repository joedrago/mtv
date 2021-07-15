// Generated by CoffeeScript 2.5.1
(function() {
  var cacheOpinions, filterDatabase, filterGetUserFromNickname, filterOpinions, filterServerOpinions, generateList, getData, iso8601, now, parseDuration, setServerDatabases;

  filterDatabase = null;

  filterOpinions = {};

  filterServerOpinions = null;

  filterGetUserFromNickname = null;

  iso8601 = require('iso8601-duration');

  now = function() {
    return Math.floor(Date.now() / 1000);
  };

  parseDuration = function(s) {
    return iso8601.toSeconds(iso8601.parse(s));
  };

  setServerDatabases = function(db, opinions, getUserFromNickname) {
    filterDatabase = db;
    filterServerOpinions = opinions;
    return filterGetUserFromNickname = getUserFromNickname;
  };

  getData = function(url) {
    return new Promise(function(resolve, reject) {
      var xhttp;
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        var entries;
        if ((this.readyState === 4) && (this.status === 200)) {
          try {
            // Typical action to be performed when the document is ready:
            entries = JSON.parse(xhttp.responseText);
            return resolve(entries);
          } catch (error) {
            return resolve(null);
          }
        }
      };
      xhttp.open("GET", url, true);
      return xhttp.send();
    });
  };

  cacheOpinions = async function(filterUser) {
    if (filterOpinions[filterUser] == null) {
      filterOpinions[filterUser] = (await getData(`/info/opinions?user=${encodeURIComponent(filterUser)}`));
      if (filterOpinions[filterUser] == null) {
        return soloFatalError(`Cannot get user opinions for ${filterUser}`);
      }
    }
  };

  generateList = async function(filterString, sortByArtist = false) {
    var allAllowed, command, durationInSeconds, e, filter, filterFunc, filterOpinion, filterUser, i, id, idLookup, isMatch, j, k, len, len1, len2, matches, negated, pieces, property, rawFilters, ref, since, soloFilters, soloUnshuffled, someException, substring;
    soloFilters = null;
    if ((filterString != null) && (filterString.length > 0)) {
      soloFilters = [];
      rawFilters = filterString.split(/\r?\n/);
      for (i = 0, len = rawFilters.length; i < len; i++) {
        filter = rawFilters[i];
        filter = filter.trim();
        if (filter.length > 0) {
          soloFilters.push(filter);
        }
      }
      if (soloFilters.length === 0) {
        // No filters
        soloFilters = null;
      }
    }
    console.log("Filters:", soloFilters);
    if (filterDatabase != null) {
      console.log("Using cached database.");
    } else {
      console.log("Downloading database...");
      filterDatabase = (await getData("/info/playlist"));
      if (filterDatabase == null) {
        return null;
      }
    }
    soloUnshuffled = [];
    if (soloFilters != null) {
      for (id in filterDatabase) {
        e = filterDatabase[id];
        e.allowed = false;
        e.skipped = false;
      }
      allAllowed = true;
      for (j = 0, len1 = soloFilters.length; j < len1; j++) {
        filter = soloFilters[j];
        pieces = filter.split(/ +/);
        negated = false;
        property = "allowed";
        if (pieces[0] === "skip") {
          property = "skipped";
          pieces.shift();
        } else if (pieces[0] === "and") {
          property = "skipped";
          negated = !negated;
          pieces.shift();
        }
        if (pieces.length === 0) {
          continue;
        }
        if (property === "allowed") {
          allAllowed = false;
        }
        substring = pieces.slice(1).join(" ");
        idLookup = null;
        if (matches = pieces[0].match(/^!(.+)$/)) {
          negated = !negated;
          pieces[0] = matches[1];
        }
        command = pieces[0].toLowerCase();
        switch (command) {
          case 'artist':
          case 'band':
            substring = substring.toLowerCase();
            filterFunc = function(e, s) {
              return e.artist.toLowerCase().indexOf(s) !== -1;
            };
            break;
          case 'title':
          case 'song':
            substring = substring.toLowerCase();
            filterFunc = function(e, s) {
              return e.title.toLowerCase().indexOf(s) !== -1;
            };
            break;
          case 'added':
            filterFunc = function(e, s) {
              return e.nickname === s;
            };
            break;
          case 'untagged':
            filterFunc = function(e, s) {
              return Object.keys(e.tags).length === 0;
            };
            break;
          case 'tag':
            substring = substring.toLowerCase();
            filterFunc = function(e, s) {
              return e.tags[s] === true;
            };
            break;
          case 'recent':
          case 'since':
            console.log(`parsing '${substring}'`);
            try {
              durationInSeconds = parseDuration(substring);
            } catch (error) {
              someException = error;
              // soloFatalError("Cannot parse duration: #{substring}")
              console.log(`Duration parsing exception: ${someException}`);
              return null;
            }
            console.log(`Duration [${substring}] - ${durationInSeconds}`);
            since = now() - durationInSeconds;
            filterFunc = function(e, s) {
              return e.added > since;
            };
            break;
          case 'love':
          case 'like':
          case 'bleh':
          case 'hate':
            filterOpinion = command;
            filterUser = substring;
            if (filterServerOpinions) {
              filterUser = filterGetUserFromNickname(filterUser);
              filterFunc = function(e, s) {
                var ref;
                return ((ref = filterServerOpinions[e.id]) != null ? ref[filterUser] : void 0) === filterOpinion;
              };
            } else {
              await cacheOpinions(filterUser);
              filterFunc = function(e, s) {
                var ref;
                return ((ref = filterOpinions[filterUser]) != null ? ref[e.id] : void 0) === filterOpinion;
              };
            }
            break;
          case 'none':
            filterOpinion = void 0;
            filterUser = substring;
            if (filterServerOpinions) {
              filterUser = filterGetUserFromNickname(filterUser);
              filterFunc = function(e, s) {
                var ref;
                return ((ref = filterServerOpinions[e.id]) != null ? ref[filterUser] : void 0) === filterOpinion;
              };
            } else {
              await cacheOpinions(filterUser);
              filterFunc = function(e, s) {
                var ref;
                return ((ref = filterOpinions[filterUser]) != null ? ref[e.id] : void 0) === filterOpinion;
              };
            }
            break;
          case 'full':
            substring = substring.toLowerCase();
            filterFunc = function(e, s) {
              var full;
              full = e.artist.toLowerCase() + " - " + e.title.toLowerCase();
              return full.indexOf(s) !== -1;
            };
            break;
          case 'id':
          case 'ids':
            idLookup = {};
            ref = pieces.slice(1);
            for (k = 0, len2 = ref.length; k < len2; k++) {
              id = ref[k];
              if (id.match(/^#/)) {
                break;
              }
              idLookup[id] = true;
            }
            filterFunc = function(e, s) {
              return idLookup[e.id];
            };
            break;
          default:
            // skip this filter
            continue;
        }
        if (idLookup != null) {
          for (id in idLookup) {
            e = filterDatabase[id];
            if (e == null) {
              continue;
            }
            isMatch = true;
            if (negated) {
              isMatch = !isMatch;
            }
            if (isMatch) {
              e[property] = true;
            }
          }
        } else {
          for (id in filterDatabase) {
            e = filterDatabase[id];
            isMatch = filterFunc(e, substring);
            if (negated) {
              isMatch = !isMatch;
            }
            if (isMatch) {
              e[property] = true;
            }
          }
        }
      }
      for (id in filterDatabase) {
        e = filterDatabase[id];
        if ((e.allowed || allAllowed) && !e.skipped) {
          soloUnshuffled.push(e);
        }
      }
    } else {
// Queue it all up
      for (id in filterDatabase) {
        e = filterDatabase[id];
        soloUnshuffled.push(e);
      }
    }
    if (sortByArtist) {
      soloUnshuffled.sort(function(a, b) {
        if (a.artist.toLowerCase() < b.artist.toLowerCase()) {
          return -1;
        }
        if (a.artist.toLowerCase() > b.artist.toLowerCase()) {
          return 1;
        }
        if (a.title.toLowerCase() < b.title.toLowerCase()) {
          return -1;
        }
        if (a.title.toLowerCase() > b.title.toLowerCase()) {
          return 1;
        }
        return 0;
      });
    }
    return soloUnshuffled;
  };

  module.exports = {
    setServerDatabases: setServerDatabases,
    generateList: generateList
  };

}).call(this);