const User = require('../models/User');
const Conversation = require('../models/Conversation');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const keys = 'secret'; // Ideally, this should be stored in an environment variable

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });
    if (user) {
      return res.status(400).json({ message: 'Username already existed.' });
    }

    const newUser = new User({ // Ensure 'new' keyword is used for model instantiation
      username: username,
      password: password
    });

    bcrypt.genSalt(10, async (err, salt) => {
      if (err) {
        console.error('Error generating salt:', err);
        return res.status(500).json({ message: 'Server error during password encryption' });
      }

      bcrypt.hash(newUser.password, salt, async (err, hash) => {
        if (err) {
          console.error('Error hashing password:', err);
          return res.status(500).json({ message: 'Server error during password encryption' });
        }

        newUser.password = hash;

        try {
          const savedUser = await newUser.save();
          // Add your conversation creation logic here, if necessary
          // ...

          res.status(200).json({ user: savedUser });
        } catch (err) {
          console.error('Error saving user:', err);
          res.status(500).json({ message: 'Server error during user registration' });
        }
      });
    });
  } catch (err) {
    console.error('Error in registration:', err);
    res.status(500).json({ message: 'Server error during user registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(404).json({ message: 'Wrong Username or Password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Wrong Username or Password.' });
    }

    const payload = { id: user._id, username: user.username };

    jwt.sign(payload, keys, { expiresIn: 36000 }, (err, token) => {
      if (err) {
        console.error('Error signing token:', err);
        return res.status(500).json({ message: 'Server error during token generation' });
      }
      res.status(200).json({ user: payload, token: token });
    });
  } catch (err) {
    console.error('Error in login:', err);
    res.status(500).json({ message: 'Server error during user login' });
  }
};
