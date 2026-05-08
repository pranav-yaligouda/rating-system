import { Store, Rating, User} from '../models/index.js';

//Helper function to get store owned by the current user
const getOwnerStore = async (ownerId) => {
    const store = await Store.findOne({where: {ownerId} });
    if(!store) throw new Error ('You do not own any store');
    return store;
};

export const getAverageRating = async (req, res) => {
    try {
        const store = await getOwnerStore(req.user.id);
        const ratings = await Rating.findAll({where: {storeId: store.id},attributes: ['value'] });
        const avg = ratings.length> 0
        ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
        :null;
        res.json({ averageRating:  avg? parseFloat(avg.toFixed(2)) : null, totalRatings: ratings.length});

    }catch (error) {
        console.error('error fetching average:', error);
        res.status(error.message ==='You do not own any store' ? 404 : 500).json({message: error.message || 'server error'});
    }
};

export const getStoreRatings = async (req, res) => {
    try {
        const store = await getOwnerStore(req.user.id);
        const ratings = await Rating.findAll({
            where: {storeId: store.id},
            include: [{model: User , as: 'user', attributes: ['id','name', 'email']}],
            order: [['createdAt', 'DESC']]
        });
        const result = ratings.map(r => ({
            userName: r.user.name,
            userEmail: r.user.email,
            rating: r.value,
            ratedAt: r.createdAt
        }));
        res.json(result);
    } catch(error) {
        console.error('Get store ratings error:', error);
    res.status(error.message === 'You do not own any store' ? 404 : 500)
       .json({ message: error.message || 'Server error.' });
    }
};