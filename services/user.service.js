// services/auth.service.js
const User = require('../models/User');
const { hashPassword, comparePassword, generateResetToken } = require('../utils/helpers');
const { sendEmail } = require('../utils/email');

class AuthService {
  async register(userData) {
    const { email, password, role = 'student', class: classId } = userData;

    const existing = await User.findOne({ email });
    if (existing) throw new Error('User already exists with this email.');

    const hashedPassword = await hashPassword(password);
    const user = new User({
      name: userData.name,
      email,
      password: hashedPassword,
      role,
      class: classId
    });

    return await user.save();
  }

  async login(email, password) {
    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user) throw new Error('Invalid credentials.');

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials.');

    return user;
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Email not found.');

    const resetToken = generateResetToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    return resetToken;
  }

  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) throw new Error('Token invalid or expired.');

    user.password = await hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return user;
  }

  async updateProfile(userId, updates) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found.');

    if (updates.email && updates.email !== user.email) {
      const existing = await User.findOne({ email: updates.email });
      if (existing) throw new Error('Email already in use.');
    }

    Object.assign(user, updates);
    return await user.save();
  }

  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }
}

module.exports = new AuthService();