import React, { useState } from 'react';
import { Phone, X, Delete, ArrowRight, Shield, Radio, MessageSquare } from 'lucide-react';
import './UssdSimulatorModal.css';

export default function UssdSimulatorModal({ isOpen, onClose, initialHash = 'GAV-26-AD447B' }) {
  const [activeTab, setActiveTab] = useState('ussd'); // 'ussd' | 'sms'
  const [dialInput, setDialInput] = useState('*384*26#');
  const [screenState, setScreenState] = useState('idle'); // 'idle' | 'menu' | 'enter_hash' | 'case_result' | 'dpp_status' | 'legal_aid' | 'sms_view'
  const [caseHashInput, setCaseHashInput] = useState(initialHash);
  const [screenText, setScreenText] = useState('');
  const [inputVal, setInputVal] = useState('');

  if (!isOpen) return null;

  const handleDial = () => {
    if (dialInput.trim() === '*384*26#' || dialInput.includes('384')) {
      setScreenState('menu');
      setScreenText(
        `FEDERAL REPUBLIC OF NIGERIA\nGAVEL USSD PORTAL (*384*26#)\n\n1. Check Case Remand Clock\n2. Check DPP Legal Advice\n3. Emergency Legal Aid (LACON)\n4. About ACJA 28-Day Law\n0. Exit\n\nReply with option:`
      );
      setInputVal('');
    } else {
      setScreenText('Invalid USSD Code.\nDial *384*26# for GAVEL National Case Ledger.');
    }
  };

  const handleMenuSubmit = (e) => {
    if (e) e.preventDefault();
    const choice = inputVal.trim();

    if (screenState === 'menu') {
      if (choice === '1') {
        setScreenState('enter_hash');
        setScreenText('GAVEL CASE TRACKER\nEnter 10-char Case Hash ID:\n(e.g. GAV-26-AD447B)\n\nReply with Hash ID:');
        setInputVal('');
      } else if (choice === '2') {
        setScreenState('dpp_status');
        setScreenText(
          'DPP ADVICE RADAR:\nActive files awaiting advice:\n- Lagos: 184 cases (Avg 58d)\n- FCT: 92 cases (Avg 44d)\n- Rivers: 110 cases (Avg 62d)\n\n0. Back to Main Menu'
        );
        setInputVal('');
      } else if (choice === '3') {
        setScreenState('legal_aid');
        setScreenText(
          'LEGAL AID COUNCIL OF NIGERIA (LACON)\nToll-Free Remand Helpline:\n0800-42835-4357\nFree representation for indigent detainees.\n\n0. Back'
        );
        setInputVal('');
      } else if (choice === '4') {
        setScreenState('menu');
        setScreenText(
          'ACJA 2015 SECTION 296:\nMaximum lawful pre-trial remand is 28 days without renewed judicial order.\nIndefinite detention is illegal.\n\n0. Back'
        );
        setInputVal('');
      } else if (choice === '0') {
        setScreenState('idle');
        setScreenText('');
      }
    } else if (screenState === 'enter_hash') {
      const hash = (choice || caseHashInput).toUpperCase();
      setScreenState('case_result');
      setScreenText(
        `REMAND STATUS: ${hash}\nStatus: OVERDUE (+14 Days)\nDays Detained: 42 Days\nLegal Limit: 28 Days\nCourt: Ikeja High Court 3\nStage: DPP Advice Pending\nFile: Lagos MoJ Registry\nCounsel: Assigned (LACON)\n\n0. Main Menu`
      );
      setInputVal('');
    } else if (choice === '0') {
      setScreenState('menu');
      setScreenText(
        `FEDERAL REPUBLIC OF NIGERIA\nGAVEL USSD PORTAL (*384*26#)\n\n1. Check Case Remand Clock\n2. Check DPP Legal Advice\n3. Emergency Legal Aid (LACON)\n4. About ACJA 28-Day Law\n0. Exit\n\nReply with option:`
      );
      setInputVal('');
    }
  };

  const handleKeypadPress = (val) => {
    if (screenState === 'idle') {
      setDialInput((prev) => prev + val);
    } else {
      setInputVal((prev) => prev + val);
    }
  };

  const handleBackspace = () => {
    if (screenState === 'idle') {
      setDialInput((prev) => prev.slice(0, -1));
    } else {
      setInputVal((prev) => prev.slice(0, -1));
    }
  };

  const handleEndCall = () => {
    setScreenState('idle');
    setScreenText('');
    setInputVal('');
    setDialInput('*384*26#');
  };

  return (
    <div className="ussd-modal-backdrop" onClick={onClose}>
      <div className="ussd-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Top Control Bar */}
        <div className="ussd-modal-header">
          <div className="ussd-modal-title">
            <Radio size={18} className="text-cyan animate-pulse" />
            <span>Simulated 2G Feature Phone Terminal (USSD / SMS)</span>
          </div>
          <button type="button" className="ussd-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Civic Context Notice */}
        <div className="ussd-context-banner">
          <Shield size={14} className="text-cyan flex-shrink-0" />
          <span>
            <strong>Civic Accessibility Design:</strong> Over 60% of detainees' families in Nigeria use non-smartphone 2G feature phones without mobile data. This terminal simulates accessing GAVEL's live ledger via GSM networks (MTN, Airtel, Glo, 9mobile).
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="ussd-tab-bar">
          <button
            type="button"
            className={`ussd-tab-btn ${activeTab === 'ussd' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('ussd')}
          >
            <Phone size={14} />
            <span>USSD Dial Code (*384*26#)</span>
          </button>
          <button
            type="button"
            className={`ussd-tab-btn ${activeTab === 'sms' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('sms')}
          >
            <MessageSquare size={14} />
            <span>SMS Shortcode (30122)</span>
          </button>
        </div>

        {activeTab === 'ussd' ? (
          /* Phone Shell Simulator */
          <div className="feature-phone-shell">
            <div className="phone-brand-mark">NOKIA / KaiOS 2G</div>

            {/* LCD Monochrome Screen */}
            <div className="phone-lcd-screen">
              <div className="lcd-status-bar">
                <span>📶 MTN-NG 2G</span>
                <span>🔋 94%</span>
              </div>

              {screenState === 'idle' ? (
                <div className="lcd-idle-view">
                  <div className="lcd-dial-text">{dialInput || ' '}</div>
                  <div className="lcd-idle-hint">Press CALL to dial GAVEL USSD</div>
                </div>
              ) : (
                <div className="lcd-session-view">
                  <pre className="lcd-session-text">{screenText}</pre>
                  <form onSubmit={handleMenuSubmit} className="lcd-input-form">
                    <input
                      type="text"
                      className="lcd-input-field"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      placeholder="Type number or hash..."
                      autoFocus
                    />
                    <button type="submit" className="lcd-send-btn">
                      SEND
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Quick Demo Fill Buttons */}
            {screenState === 'enter_hash' && (
              <div className="lcd-quick-fills">
                <span className="quick-label">Tap to insert sample:</span>
                <button
                  type="button"
                  className="quick-hash-chip"
                  onClick={() => setInputVal('GAV-26-AD447B')}
                >
                  GAV-26-AD447B (Overdue)
                </button>
                <button
                  type="button"
                  className="quick-hash-chip"
                  onClick={() => setInputVal('GAV-26-8A3F9')}
                >
                  GAV-26-8A3F9 (Compliant)
                </button>
              </div>
            )}

            {/* Physical Keypad */}
            <div className="phone-keypad">
              <div className="keypad-call-row">
                <button
                  type="button"
                  className="key-btn key-call"
                  onClick={screenState === 'idle' ? handleDial : handleMenuSubmit}
                  title="Call / Send"
                >
                  CALL / OK
                </button>
                <button
                  type="button"
                  className="key-btn key-clear"
                  onClick={handleBackspace}
                  title="Clear character"
                >
                  <Delete size={14} />
                </button>
                <button
                  type="button"
                  className="key-btn key-end"
                  onClick={handleEndCall}
                  title="End Session"
                >
                  END
                </button>
              </div>

              <div className="keypad-grid">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    className="key-btn key-num"
                    onClick={() => handleKeypadPress(k)}
                  >
                    <span>{k}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* SMS Simulator View */
          <div className="sms-simulator-view">
            <div className="sms-instructions">
              <h4>SMS Inquiry Format:</h4>
              <p>Text <code>GAVEL &lt;CASE-HASH-ID&gt;</code> to <strong>30122</strong> (Toll-Free in Nigeria)</p>
            </div>

            <div className="sms-chat-bubble out">
              <span className="sms-time">You &bull; Just now</span>
              <p>GAVEL {caseHashInput}</p>
            </div>

            <div className="sms-chat-bubble in">
              <span className="sms-time">GAVEL-30122 &bull; Automated Remand Alert</span>
              <p>
                <strong>[GAVEL STATUTORY ALERT]</strong><br />
                Case Hash: {caseHashInput}<br />
                Custody: 42 Days (ACJA 28-day limit exceeded by 14 days).<br />
                Stage: DPP Advice Pending.<br />
                Court: Ikeja High Court 3.<br />
                Counsel: Legal Aid Council Assigned.<br />
                Need help? Call LACON free: 0800-42835-4357.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
