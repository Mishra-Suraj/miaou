
var langs = exports.all = {
	en: { pgname:'english' },
	fr: { pgname:'french' },
	it: { pgname:'italian' }
};
exports.legal; // codes of the languages proposed in room creation / filtering

exports.configure = function(conf){
	exports.legal = {};
	for (var key in langs) {
		var lang = langs[key];
		lang.name = lang.pgname[0].toUpperCase() + lang.pgname.slice(1);
		if (!conf.langs || ~conf.langs.indexOf(key)) exports.legal[key] = lang;
	}
	console.log('Legal langs:', exports.legal);
	return this;
}
