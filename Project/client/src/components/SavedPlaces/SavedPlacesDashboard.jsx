import React, { useState, useEffect, useContext } from 'react';
import { AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext';
import savedPlaceService from '../../services/savedPlaceService';
import SavedPlaceList from './SavedPlaceList';
import SavedPlaceModal from './SavedPlaceModal';
import RecentPlaces from './RecentPlaces';
import Skeleton from './Skeleton';

export default function SavedPlacesDashboard() {
    const { user, authenticated } = useContext(AuthContext);
    const [places, setPlaces] = useState([]);
    const [recentPlaces, setRecentPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPlace, setEditingPlace] = useState(null);

    useEffect(() => {
        if (!authenticated || !user) return;
        fetchData();

        const socket = io('http://localhost:5000');
        const userId = user.userId || user.id;
        socket.emit('register', userId);
        
        const roomName = `saved_places_${userId}`;
        socket.on(roomName, (payload) => {
            if (payload.event === 'savedPlaceUpdated') {
                fetchData();
            }
        });

        return () => {
            socket.off(roomName);
            socket.disconnect();
        };
    }, [authenticated, user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [placesRes, recentRes] = await Promise.all([
                savedPlaceService.getPlaces(),
                savedPlaceService.getRecentPlaces()
            ]);
            setPlaces(placesRes.data || []);
            setRecentPlaces(recentRes.data || []);
        } catch (error) {
            console.error("Failed to fetch locations:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (formData) => {
        try {
            if (editingPlace) {
                await savedPlaceService.updatePlace(editingPlace._id, formData);
            } else {
                await savedPlaceService.createPlace(formData);
            }
            setModalOpen(false);
            setEditingPlace(null);
            // Socket will trigger refetch, but we can also optimistically fetch here
            fetchData();
        } catch (error) {
            alert(error.message || "Failed to save location");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this location?")) return;
        try {
            await savedPlaceService.deletePlace(id);
            fetchData();
        } catch (error) {
            alert("Failed to delete location");
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await savedPlaceService.setDefault(id);
            fetchData();
        } catch (error) {
            alert("Failed to set default location");
        }
    };

    const openCreateModal = () => {
        setEditingPlace(null);
        setModalOpen(true);
    };

    const openEditModal = (place) => {
        setEditingPlace(place);
        setModalOpen(true);
    };

    return (
        <div className="saved-places-container">
            <div className="saved-places-header">
                <h1><i className="fa-solid fa-map-location-dot"></i> Saved Places</h1>
                <button className="btn-primary" onClick={openCreateModal}>
                    <i className="fa-solid fa-plus"></i> Add New
                </button>
            </div>

            <div className="saved-places-grid">
                <div className="glass-panel">
                    <h2 className="section-title"><i className="fa-solid fa-star"></i> Favorite Locations</h2>
                    {loading ? (
                        <Skeleton />
                    ) : (
                        <SavedPlaceList 
                            places={places} 
                            onEdit={openEditModal} 
                            onDelete={handleDelete} 
                            onSetDefault={handleSetDefault}
                        />
                    )}
                </div>

                <div className="glass-panel" style={{ alignSelf: 'start' }}>
                    <h2 className="section-title"><i className="fa-solid fa-clock-rotate-left"></i> Recent Places</h2>
                    {loading ? (
                        <Skeleton count={3} />
                    ) : (
                        <RecentPlaces places={recentPlaces} onSaveAsFavorite={openEditModal} />
                    )}
                </div>
            </div>

            <AnimatePresence>
                {modalOpen && (
                    <SavedPlaceModal 
                        initialData={editingPlace}
                        onClose={() => setModalOpen(false)} 
                        onSubmit={handleSave} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
