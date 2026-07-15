import React from 'react';

export default function ReviewTags({ tags, onChange }) {
    const predefinedTags = [
        "Safe Driver", "Friendly", "Clean Vehicle", 
        "Professional", "Late Arrival", "Fast Ride", 
        "Great Music", "Good Conversation", "Smooth Ride"
    ];

    const toggleTag = (tag) => {
        if (tags.includes(tag)) {
            onChange(tags.filter(t => t !== tag));
        } else {
            onChange([...tags, tag]);
        }
    };

    return (
        <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#ccc' }}>Highlights</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {predefinedTags.map(tag => (
                    <span 
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`tag-badge ${tags.includes(tag) ? 'selected' : ''}`}
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
}
