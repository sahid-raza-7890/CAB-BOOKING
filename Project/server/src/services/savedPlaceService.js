const SavedPlace = require('../models/SavedPlace');

class SavedPlaceService {
    static async _emitUpdate(userId, io) {
        if (io) {
            io.emit(`saved_places_${userId}`, { event: 'savedPlaceUpdated' });
        }
    }

    static async createPlace(userId, data, io) {
        // Enforce singleton for Home / Work
        if (data.type === 'Home' || data.type === 'Work') {
            const existing = await SavedPlace.findOne({ userId, type: data.type });
            if (existing) {
                throw new Error(`A ${data.type} location already exists. Please update or delete it first.`);
            }
        }

        const newPlace = new SavedPlace({
            userId,
            label: data.label,
            address: data.address,
            formattedAddress: data.formattedAddress,
            latitude: data.latitude,
            longitude: data.longitude,
            placeId: data.placeId,
            icon: data.icon,
            color: data.color,
            isDefault: data.isDefault,
            type: data.type,
            source: data.source || 'Manual',
            metadata: data.metadata
        });

        // If setting as default, unset others
        if (data.isDefault) {
            await SavedPlace.updateMany({ userId }, { isDefault: false });
        }

        await newPlace.save();
        await this._emitUpdate(userId, io);
        return newPlace;
    }

    static async updatePlace(placeId, userId, data, io) {
        const place = await SavedPlace.findOne({ _id: placeId, userId });
        if (!place) throw new Error("Saved place not found or unauthorized");

        if (data.type && (data.type === 'Home' || data.type === 'Work') && data.type !== place.type) {
            const existing = await SavedPlace.findOne({ userId, type: data.type });
            if (existing) {
                throw new Error(`A ${data.type} location already exists. Please delete it first.`);
            }
        }

        const updatableFields = ['label', 'address', 'formattedAddress', 'latitude', 'longitude', 'placeId', 'icon', 'color', 'isDefault', 'type', 'source', 'metadata'];
        updatableFields.forEach(field => {
            if (data[field] !== undefined) {
                place[field] = data[field];
            }
        });

        if (data.isDefault) {
            await SavedPlace.updateMany({ userId }, { isDefault: false });
        }

        await place.save();
        await this._emitUpdate(userId, io);
        return place;
    }

    static async deletePlace(placeId, userId, io) {
        const result = await SavedPlace.findOneAndDelete({ _id: placeId, userId });
        if (!result) throw new Error("Saved place not found or unauthorized");
        await this._emitUpdate(userId, io);
        return { success: true };
    }

    static async getPlaces(userId) {
        // Exclude recent ones if we want them separate, or return all
        // We'll return everything except Recent types by default for the main list, 
        // or just return all and let frontend filter. Let's return all.
        return await SavedPlace.find({ userId, type: { $ne: 'Recent' } }).sort({ createdAt: -1 });
    }

    static async getRecentPlaces(userId) {
        return await SavedPlace.find({ userId, type: 'Recent' }).sort({ createdAt: -1 }).limit(10);
    }

    static async saveRecentPlace(userId, data, io) {
        // Find if this exact place was recently visited, update timestamp if so
        // Using placeId or coordinates as fuzzy match
        let existing = null;
        if (data.placeId) {
            existing = await SavedPlace.findOne({ userId, type: 'Recent', placeId: data.placeId });
        }

        if (existing) {
            existing.createdAt = new Date();
            await existing.save();
            await this._emitUpdate(userId, io);
            return existing;
        }

        const newRecent = new SavedPlace({
            userId,
            label: data.label || 'Recent Location',
            address: data.address,
            formattedAddress: data.formattedAddress,
            latitude: data.latitude,
            longitude: data.longitude,
            placeId: data.placeId,
            icon: 'fa-clock-rotate-left',
            type: 'Recent',
            source: data.source || 'RideHistory'
        });

        await newRecent.save();

        // Enforce max 10 recent places
        const recentCount = await SavedPlace.countDocuments({ userId, type: 'Recent' });
        if (recentCount > 10) {
            const oldest = await SavedPlace.find({ userId, type: 'Recent' }).sort({ createdAt: 1 }).limit(recentCount - 10);
            const idsToDelete = oldest.map(doc => doc._id);
            await SavedPlace.deleteMany({ _id: { $in: idsToDelete } });
        }

        await this._emitUpdate(userId, io);
        return newRecent;
    }

    static async setDefault(placeId, userId, io) {
        await SavedPlace.updateMany({ userId }, { isDefault: false });
        const place = await SavedPlace.findOne({ _id: placeId, userId });
        if (!place) throw new Error("Saved place not found");
        
        place.isDefault = true;
        await place.save();
        await this._emitUpdate(userId, io);
        return place;
    }
}

module.exports = SavedPlaceService;
