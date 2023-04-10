var mongoose = require('mongoose');
var Schema = mongoose.Schema;

userSchema = new Schema( {
	id: Number,
	email: String,
	username: String,
	password: String,
	passwordConf: String,
	profileimg: String,
	googleId: String,
    thumbnail: String
}),

User = mongoose.model('User', userSchema);


blacklistjwt = new Schema( {
	
	token: String

}),

Blacklistjwt = mongoose.model('BlackList', blacklistjwt);

module.exports = {User, Blacklistjwt}