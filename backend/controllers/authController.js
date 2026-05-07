import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { validatePassword } from '../utils/passwodValidator.js';
import { generateToken } from '../utils/generateToken.js';


export const register = async (req, res) => {
    try{
        const {name, email, password, address} = req.body;
        
        //Validation
        if(!name || !email || !password || !address) {
            return res.status(400).json({ message: 'All fields are required.'});
        }

        //Name length (20-60) -also enforced by model
        if(name.length < 20 || name.length > 60) {
            return res.status(400).json({ message: 'Name must be between 20 to 60 characters'});
        }

        //Email  format - model will also validate, but early check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address'});
        }

        //Password strength
        if(!validatePassword(password)) {
            return res.status(400).json({ 
                message: 'Password must be 8-16 characters, include at least one uppercase letter and one special character (!@#$%^&*).'})
        }

        //address length (max 400)
        if(address.length > 400) {
            return res.status(400).json({message: 'Address cannot exceed 400 characters.'});
        }

        //check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if(existingUser) {
            return res.status(409).json({ message: 'User with this email already exists'});
        }

        //Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        //Creation of user role focused to normal
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            address,
            role: 'normal'
        });

        //Generate Token
        const token = generateToken(user);

        // Return user info (excluding  password) + token
        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role
            }
        });
    } catch (err){
        console.error('Registraion error:', error);
        res.status(500).json({message: 'Server error during registration'});
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if(!email || !password ) {
            return res.status(400).json({message: 'Email and password are required.'});
        }


        //Find user by email
        const user = await User.findOne({ where: {email} });
        if(!user) {
            res.status(401).json({message: 'Invalid email'});
        }

        //Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            res.status(401).json({message: 'Invalid password'});
        }

        //Generate token
        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role
            }
        });
    } catch(error){
        console.error('Login error: ', error);
        res.status(500).json({ message: 'Server error during login.'})
    }
};


export const updatePassword = async (req, res ) => {
    try {
        const { currentPassword, newPassword} = req.body;
        const userId = req.user.id; // for authenticateToken middleware

        if(!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required'});
        }

        //Validate new password strength
        if(!validatePassword(newPassword)) {
            return  res.status(400).json({
                message: 'New password must be 8-16 characters, include at least one uppercase letter and one special character (!@#$%^&*).'
            });
        }

        //Fetch user with  password 
        const user  = await user.findByPk(userId);
        if(!user){
            return res.status(400).json({message: 'User not found'});
        }

        //verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if(!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect.'});
        }

        //Hash and save new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        res.json({message: 'Password updated successfully'});

    } catch(error){
        console.error('Update password error:', error);
        res.status(500).json({message: 'Server error while updating password'});
    }
};
