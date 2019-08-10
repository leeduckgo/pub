const User = require('./sequelize/user');
const Profile = require('./sequelize/profile');

const packProfile = profile => ({
  name: profile.name,
  avatar: profile.avatar,
  bio: profile.bio,
})

exports.get = async id => {
  const [user, profile] = await Promise.all([
    User.findOne({
      id
    }),
    Profile.findOne({
      userId: id
    }),
  ]);
  return {
    ...user.toJSON(),
    ...packProfile(profile.toJSON())
  }
}