import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

// Utility function to generate a unique user ID
function generateUserId(existingUsers) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Filter and check for valid userId
    const matchingIds = existingUsers
        .map(user => user.userId)
        .filter(userId => userId && userId.startsWith(randomPart)); // Ensure userId is not undefined
    if (matchingIds.length > 0) {
        return generateUserId(existingUsers); // Recursively call if collision occurs
    }
    return randomPart;
}

// Insert a new user
export async function insertUser(req, res) {
  try {
    const { fullName, emailAdress, contactNumber, password, address, userType, activeStatus } = req.body;
    const profileImage = req.file;

    // Validate input
    if (!fullName || !emailAdress || !contactNumber || !password || !address || !userType || !profileImage) {
      return res.status(400).json({ message: 'All fields, including profile image, are required.' });
    }

    const filePath = path.resolve('dataUser.json');

    // Ensure file exists or create it
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
    }

    const existingUsers = JSON.parse(fs.readFileSync(filePath, 'utf8')) || [];
    const userId = generateUserId(existingUsers);

    const currentDate = new Date().toISOString(); // Set current date

    // Hash the password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = {
      userId,
      fullName,
      emailAdress,
      contactNumber,
      password: hashedPassword, // Store the hashed password
      address,
      userType,
      activeStatus: true,
      profileImage: profileImage.path, // Store file path
      registrationDate: currentDate,   // Add current date
    };

    console.log("user --->", newUser);

    existingUsers.push(newUser);
    fs.writeFileSync(filePath, JSON.stringify(existingUsers, null, 2), 'utf8');

    res.status(200).json({ message: 'User added successfully', user: newUser }); // Send complete user object
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Login User
export async function loginUser(req, res) {
  try {
    const { emailAdress, password } = req.body;

    const filePath = path.resolve('dataUser.json');
    let existingData = [];
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      existingData = JSON.parse(fileData) || [];
    }

    const user = existingData.find((user) => user.emailAdress === emailAdress);

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
console.log("Provided password:", password);
console.log("Stored hashed password:", user.password);
console.log("Password comparison result:", isPasswordValid);

if (!isPasswordValid) {
  return res.status(400).json({ message: 'Invalid email or password' });
}

    if (!user.activeStatus) {
      return res.status(403).json({ message: 'Your account is not active. Please contact Support Team.' });
    }

    // Exclude the password from session data
    req.session.user = {
      userId: user.userId,
      fullName: user.fullName,
      emailAdress: user.emailAdress,
      contactNumber: user.contactNumber,
      userType: user.userType,
      profileImage: user.profileImage,
      address: user.address,
    };
    console.log("req.session.user --->", req.session.user);

    res.status(200).json({ message: 'Login successful', user: req.session.user });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: error.message || 'Something went wrong' });
  }
}

// Logout User
export async function logoutUser(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Failed to log out' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logged out successfully' });
  });
}

// Get All Users
export async function getAllUser(req, res) {
  try {
    const filePath = path.resolve('dataUser.json');
    let existingData = [];
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      existingData = JSON.parse(fileData) || [];
    }
    res.status(200).json({ users: existingData });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Get User By ID
export async function getUserById(req, res) {
  try {
    const { userId } = req.params;
    console.log("userId ---> ", userId);
    
    const filePath = path.resolve('dataUser.json');
    let existingData = [];
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      existingData = JSON.parse(fileData) || [];
    }

    const user = existingData.find((user) => user.userId === userId);
    console.log("user ---> ", user);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Update User
export async function updateUser(req, res) {
  try {
    const { userId } = req.params;
    console.log('Incoming userId:', userId);
    console.log('Request body:', req.body);

    const filePath = path.resolve('dataUser.json');
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return res.status(404).json({ message: 'No users found to update' });
    }

    const existingUsers = JSON.parse(fs.readFileSync(filePath, 'utf8')) || [];
    console.log('Existing Users:', existingUsers);

    const userIndex = existingUsers.findIndex((user) => user.userId === userId);
    if (userIndex === -1) {
      console.error(`User with ID ${userId} not found`);
      return res.status(404).json({ message: `User with ID ${userId} not found` });
    }

    const updatedUser = {
      ...existingUsers[userIndex],
      ...req.body, // Merge request body into the existing user data
    };

    existingUsers[userIndex] = updatedUser;
    fs.writeFileSync(filePath, JSON.stringify(existingUsers, null, 2), 'utf8');
    console.log('Updated User:', updatedUser);

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Delete User
export async function deleteUser(req, res) {
  try {
    const { userId } = req.params;

    const filePath = path.resolve('dataUser.json');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'No users found to delete' });
    }

    const existingUsers = JSON.parse(fs.readFileSync(filePath, 'utf8')) || [];
    const updatedUsers = existingUsers.filter((user) => user.userId !== userId);

    if (existingUsers.length === updatedUsers.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    fs.writeFileSync(filePath, JSON.stringify(updatedUsers, null, 2), 'utf8');
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}