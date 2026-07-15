import React, { useContext } from 'react';
import NotificationEmpty from './NotificationEmpty';
import { AdminContext } from '../../../context/AdminContext';

const NotificationTemplates = () => {
  const { templates: ctxTemplates } = useContext(AdminContext);
  const templates = ctxTemplates || [];
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Templates</h2>
        <button className="glass-btn">Create Template</button>
      </div>
      
      {templates.length === 0 ? (
        <NotificationEmpty message="No templates found. Create one to get started." />
      ) : (
        <div className="glass-panel" style={{ padding: '0' }}>
          {templates.map(t => (
            <div key={t._id || t.id} className="list-item">
              <div>
                <h4 style={{ margin: '0 0 4px 0' }}>{t.title || t.name || 'Untitled Template'}</h4>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                  {t.channel || 'All Channels'} • {t.audience || 'All Users'}
                </div>
              </div>
              <div>
                <button className="glass-btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>Use</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationTemplates;
