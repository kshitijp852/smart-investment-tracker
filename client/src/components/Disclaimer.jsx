import React, { useState } from 'react';

export default function Disclaimer() {
  const [accepted, setAccepted] = useState(localStorage.getItem('disclaimerAccepted') === 'true');

  const handleAccept = () => {
    localStorage.setItem('disclaimerAccepted', 'true');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="disclaimer-overlay">
      <div className="disclaimer-modal">
        <h2 className="disclaimer-title">⚠️ Important Disclaimer</h2>
        
        <div className="disclaimer-content">
          <h3>Investment Advisory Notice</h3>
          <p>
            <strong>SmartInvest</strong> is an educational and informational platform only. 
            We are <strong>NOT</strong> SEBI registered investment advisors.
          </p>

          <h3>No Financial Advice</h3>
          <ul>
            <li>The recommendations provided are for <strong>educational purposes only</strong></li>
            <li>This is <strong>NOT financial advice</strong></li>
            <li>We do <strong>NOT</strong> recommend buying or selling any specific securities</li>
            <li>Past performance does <strong>NOT</strong> guarantee future results</li>
          </ul>

          <h3>Investment Risks</h3>
          <ul>
            <li>All investments involve risk, including potential loss of principal</li>
            <li>Mutual fund investments are subject to market risks</li>
            <li>Returns are not guaranteed and may vary</li>
            <li>Please read all scheme-related documents carefully</li>
          </ul>

          <h3>Your Responsibility</h3>
          <ul>
            <li>Consult a SEBI registered investment advisor before investing</li>
            <li>Conduct your own research and due diligence</li>
            <li>Understand your risk tolerance and investment goals</li>
            <li>Review fund documents and KYC requirements</li>
          </ul>

          <h3>Data Accuracy</h3>
          <p>
            While we strive for accuracy, we do not guarantee the completeness or 
            accuracy of information. Data may be delayed or contain errors.
          </p>

          <h3>Beta Version Notice</h3>
          <p>
            This is a <strong>BETA version</strong>. Features may change without notice. 
            Use at your own risk.
          </p>

          <div className="disclaimer-footer">
            <p>
              By clicking "I Understand", you acknowledge that you have read and 
              understood this disclaimer and agree to use this platform for 
              educational purposes only.
            </p>
          </div>
        </div>

        <div className="disclaimer-actions">
          <button className="btn-accept" onClick={handleAccept}>
            ✓ I Understand and Accept
          </button>
        </div>

        <p className="disclaimer-note">
          For investment advice, please consult a SEBI registered advisor.
        </p>
      </div>
    </div>
  );
}
