import User from "./User.js";
import Store from "./Store.js";
import Rating from "./Rating.js";


// ---------- User = Rating (one-to-many) ----------
User.hasMany(Rating, { foreignKey: 'userId', as: 'ratings' });
Rating.belongsTo(User, { foreignKey: 'userId', as: 'user'});

// ---------- Store = Rating (one-to-many) ----------
Store.hasMany(Rating, { foreignKey: 'storeId', as: 'ratings'});
Rating.belongsTo(Store, { foreignKey: 'storeId', as: 'store'});

// ---------- Store Owner relationship (one-to-many) ----------
// A user (with role='owner') can own many stores
// Each store belongs to one owner
Store.belongsTo(User, {foreignKey: 'ownerId', as: 'owner'});
User.hasMany(Store, {foreignKey:  'ownerId', as: 'ownedStores'});

export { User, Store, Rating};