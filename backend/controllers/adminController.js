import { User, Store, Rating} from '../models/index.js';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { validatePassword } from '../utils/passwordValidator.js';

export  const getDashboardStats = async (req, res) => {
    try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();
    res.json({ totalUsers, totalStores, totalRatings});
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Server error fetching stats'});
    }
};

export const getAllUsers = async (req, res) => {
    try {
    const {name, email, address, role, sortBy =  'name', order ='ASC'} = req.query;
    
    // allowed columns for sorting
    const allowedSortColumns = [ 'name', 'email', 'address', 'role', 'createdAt'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'name';
    const safeOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const where = {};
    if(name) where.name = { [Op.like]: `%${name}%`};
    if(email) where.email = { [Op.like]: `%${email}%`};
    if(address) where.address ={ [Op.like]: `%${address}%`};
    
    if(role) {
        where.role = role;
    } else {
        where.role = { [Op.in]: ['admin', 'normal']};
    }

    const users = await User.findAll({
        where,
        order: [[ safeSortBy, safeOrder]],
        attributes: { exclude: ['password'] }
    });
    res.json(users);
    } catch (error) {
        console.error('Get all users error');
        res.status(500).json({ message: 'Server error fetching users'});
    }
};

export const creatUser = async (req, res) => {
    try {
        const { name , email, password, address, role } = req.body;

        //Validations (same as registration but role is required)
        if (!name || !email || !password || !address || !role) {
            return res.status(400).json({ message: 'All fields are required ( name email password address role)'});
        }

        if (name.length < 20 || name.length > 60) {
            return res.status(400).json({ message: 'name should be between 20 to 60 characters'});
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Enter a valid email address'});
        }

        if(!validatePassword(password)) {
            return res.status(400).json({
                message: 'Password must be 8-16 characters, include at least one uppercase letter and one special character (!@#$%^&*).'
            });
        }

        if (address.length > 400) {
            return res.status(400).json({ message: 'Address cannot exceed 400 characters'});
        }

        if (!['admin', 'normal', 'owner'].includes(role)){
            return res.status(400).json({ message: 'Role must be admin , normal or owner'});
        }

        //Check email uniqueness
        const existingUser = await User.findOne({ where: {email} });
        if(existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            address,
            role
        });

        res.status(200).json({
            message: 'User Created Successfully',
            user : {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                address: newUser.address,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Create user error', error);
        res.status(500).json({ message: 'Server error creating user'});
    }
};

export const getAllStores = async (req, res) => {
    try {
        const {name, email, address, sortBy = 'name', order = 'ASC' } = req.body;

        const allowedSortColumns = ['name','email','address','createdAt'];
        const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'name';
        const safeOrder = order.toUpperCase() === 'DESC' ? 'DESC' :'ASC';

        const where = {};
        if(name) where.name= {[Op.like]: `%${name}%`};
        if(email) where.email = {[Op.like]: `%${email}`};
        if(address) where.address = {[Op.like]: `%${address}%`};

        const stores = await Store.findAll({
            where,
            order: [[safeSortBy, safeOrder]],
            include: [{ model: Rating, as: 'ratings', attributes: ['value']}]
        });

        //Compute average rating for each store
        const storeWithRating = stores.map(store => {
            const ratings = store.ratings || [];
            const avgRating = ratings.length > 0 
            ? ratings.reduce((sum, r) => sum + r.value,0) / ratings.length
            : null;
            return {
                id: store.id,
                name: store.name,
                email: store.email,
                address: store.address,
                ownerId: store.ownerId,
                createdAt: store.createdAt,
                updatedAt: store.updatedAt,
                averageRating: avgRating ? parseFloat(avgRating.toFixed(2)) : null,
                totalRatings: ratings.length
            };
        });

        res.json(storeWithRating);
    } catch (error){
        console.error('Get all stores error',error);
        res.status(500).json({message: 'server error fetching stores'});
    }
};


export const addStore = async (req, res) => {
    try {
        const { name, email, address, ownerId} = req.body;

        if(!name || !email || !address || !ownerId) {
            return res.status(400).json({ message: 'All fields are required name email address ownerId'});
        }

        //Validate owner exists and has role 'owner'
        const owner = await User.findByPk(ownerId);
        if(!owner) {
            return res.status(404).json({ message: 'Owner user not found.'});
        }
        if(owner.role !== 'owner') {
            return res.status(400).json({ message: 'The specified user is not a store owner'});
        }

        //Email uniqueness
        const existingStore = await Store.findOne({ where: {email}});
        if (existingStore) {
            return res.status(400).json({ message: 'A store with this email already exists'});
        }

        const newStore = await Store.create({
            name,
            email,
            address,
            ownerId
        });

        res.status(201).json({
            message: 'store created successfully',
            store: newStore
        });

    } catch (error) {
        console.error('Add store error:', error);
        res.status(500).json({ message: 'Server error adding store'});
    }
};