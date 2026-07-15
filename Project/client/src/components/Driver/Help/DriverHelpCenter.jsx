import React, { useState } from 'react';

const DriverHelpCenter = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    { question: 'How do I update my vehicle documents?', answer: 'Go to your Profile, select Vehicle, and tap on "Upload Documents". Ensure the pictures are clear.' },
    { question: 'When do I get paid?', answer: 'Earnings are transferred to your linked bank account every Tuesday by end of day.' },
    { question: 'What to do in case of an accident?', answer: 'Ensure safety first, call emergency services if needed, and report the incident immediately via the "Emergency" button in the app.' },
    { question: 'How is my rating calculated?', answer: 'Your rating is an average of the last 500 trips rated by passengers.' }
  ];

  const glassStyle = {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '24px',
    color: '#fff',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
  };

  const containerStyle = {
    backgroundColor: '#0F172A',
    minHeight: '100vh',
    padding: '40px 20px',
    fontFamily: 'system-ui, sans-serif'
  };

  const accentColor = '#FFD21F';

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ color: accentColor, marginBottom: '24px', fontSize: '2rem', fontWeight: 'bold' }}>Help Center</h1>

        <div style={{ ...glassStyle, marginBottom: '24px' }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.5rem' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                style={{ 
                  background: 'rgba(15, 23, 42, 0.6)', 
                  borderRadius: '8px', 
                  overflow: 'hidden'
                }}
              >
                <button 
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    textAlign: 'left',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  {faq.question}
                  <span style={{ color: accentColor }}>{activeFaq === index ? '−' : '+'}</span>
                </button>
                {activeFaq === index && (
                  <div style={{ padding: '0 16px 16px 16px', color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.5' }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...glassStyle, textAlign: 'center', padding: '32px 24px' }}>
          <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.5rem' }}>Need more help?</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '24px' }}>Our support team is available 24/7 to assist you.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button style={{
              background: 'transparent',
              color: accentColor,
              border: `2px solid ${accentColor}`,
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem'
            }}>Call Support</button>
            <button style={{
              background: accentColor,
              color: '#0F172A',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem'
            }}>Chat with us</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverHelpCenter;
