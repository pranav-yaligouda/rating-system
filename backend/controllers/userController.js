import { Store, Rating } from '../models/index.js';
import { Op } from 'sequelize';

export const getAllStores = async (req, res) => {
    try {
        const { search, sortBy = 'name', order = 'ASC' } = req.query;
        const userId = req.user.id;

        const allowedSortColumns = ['name', 'address', 'createdAt'];
        const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'name';
        const safeOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        const where = {};
        if(search) {
            where[Op.or] = [
                {name: {[Op.like]: `%${search}%`} },
                {address: {[Op.like]: `%${search}%`}}
            ];
        }

        const stores = await Store.findAll({
            where,
            order: [[safeSortBy, safeOrder]],
            include: [{model: Rating, as: 'ratings', attributes: ['value', 'userId']}]
        });

        const storeWithData = stores.map(store => {
            const ratings = store.ratings || [];
            const avgRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.value, 0 ) / ratings.length
            : null;
            const userRatingObj = ratings.find(r => r.userId === userId);
            const userRating = userRatingObj ? userRatingObj.value : null;

            return {
                id: store.id,
                name: store.name,
                address: store.address,
                averageRating: avgRating ? parseFloat(avgRating.toFixed(2)) : null,
                userRating,
                canRate: true
            };
        });
        res.json(storeWithData);
    } catch(error){
        console.error('error fetching stores', error);
        res.status(500).json({ message: 'Server error fetching stores'});
    }
};


export const submitRating = async (req, res) => {
    try{
        const {storeId, value} = req.body;
        const userId = req.user.id;

        if(!storeId || !value) {
            return res.status(400).json({ message: 'storeId and rating value are required'});
        }

        if(value < 1  || value > 5) {
            return res.status(400).json({message:'Rating value must be between 1 amd 5'});
        }

        const store = await Store.findByPk(storeId);
        if(!store) {
            return res.status(400).json({message: 'store not found'});
        }

        const existingRating = await Rating.findOne({ where: {userId, storeId} });
        if(existingRating) {
            return res.status(409).json({message:"You have already rated this store. use PUT to update"});
        }

        const rating = await Rating.create({ userId, storeId, value});
        res.status(201).json({message: 'Rating submitted successfully', rating});

    }catch(error) {
        console.error('error submiting rating', error);
        res.status(500).json({ message: 'Server error while submit'});
    }
};

export const updateRating = async (req, res) => {
    try {
        const { storeId } = req.params;
        const { value } = req.body;
        const userId = req.user.id;

        if(!value || value<1 || value>5) {
            return res.status(400).json({message: 'value should be between 1 to 5'});
        }

        const rating = await Rating.findOne({ where: { userId, storeId}});
        if(!rating){
            return res.status(404).json({message: 'No existing rating found for this store'});
        }

        rating.value = value;
        await rating.save();
        res.json({message: 'rating updated successfully', rating});
    } catch (error) {
        console.error('Error to update rating:', error);
        res.status(500).json({message: 'Server error updating rating'});
    }
};