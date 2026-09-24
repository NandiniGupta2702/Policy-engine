/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from './types';
import { PolicyOSApiClient } from './lib/api';
import { ToastProvider } from './components/ui/Toast';
import { AppShell } from './components/layout/AppShell';
import { LoginScreen } from './components/screens/LoginScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { PoliciesScreen } from './components/screens/PoliciesScreen';
import { PolicyDetailScreen } from './components/screens/PolicyDetailScreen';
import { UploadPolicyScreen } from './components/screens/UploadPolicyScreen';
import { RuleReviewScreen } from './components/screens/RuleReviewScreen';
import { ClaimsEvaluationScreen } from './components/screens/ClaimsEvaluationScreen';
import { DecisionRecordScreen } from './components/screens/DecisionRecordScreen';
import { ReplayLabScreen } from './components/screens/ReplayLabScreen';
import { VersionHistoryScreen } from './components/screens/VersionHistoryScreen';
import { AuditTrailScreen } from './components/screens/AuditTrailScreen';
import { AdminScreen } from './components/screens/AdminScreen';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return PolicyOSApiClient.getCurrentUser();
  });

  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');
  const [screenParams, setScreenParams] = useState<any>({});

  // Sync state if user changes
  const handleNavigate = (screen: string, params?: any) => {
    setCurrentScreen(screen);
    setScreenParams(params || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    PolicyOSApiClient.logout();
    setCurrentUser(null);
    setCurrentScreen('dashboard');
    setScreenParams({});
  };

  const handleRoleSwitched = (user: User) => {
    setCurrentUser(user);
    // If switched from admin screen and new role is PO/FC, navigate to dashboard
    if (currentScreen === 'admin' && user.role !== 'ADMIN') {
      setCurrentScreen('dashboard');
    }
  };

  const renderScreen = () => {
    if (!currentUser) return null;

    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'policies':
        return <PoliciesScreen currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'policy_detail':
        return (
          <PolicyDetailScreen 
            currentUser={currentUser} 
            policyId={screenParams.policyId} 
            onNavigate={handleNavigate} 
          />
        );
      case 'upload':
        return <UploadPolicyScreen currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'rule_review':
        return (
          <RuleReviewScreen 
            currentUser={currentUser} 
            ruleId={screenParams.ruleId} 
            onNavigate={handleNavigate} 
          />
        );
      case 'claims':
        return <ClaimsEvaluationScreen currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'decision_records':
        return <ClaimsEvaluationScreen currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'decision_detail':
        return (
          <DecisionRecordScreen 
            currentUser={currentUser} 
            claimId={screenParams.claimId} 
            onNavigate={handleNavigate} 
          />
        );
      case 'replay':
        return (
          <ReplayLabScreen 
            currentUser={currentUser} 
            ruleId={screenParams.ruleId} 
            onNavigate={handleNavigate} 
          />
        );
      case 'version_history':
        return (
          <VersionHistoryScreen 
            currentUser={currentUser} 
            policyId={screenParams.policyId} 
            onNavigate={handleNavigate} 
          />
        );
      case 'audit':
        return <AuditTrailScreen currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'admin':
        return (
          <AdminScreen 
            currentUser={currentUser} 
            onNavigate={handleNavigate} 
            onLogout={handleLogout} 
          />
        );
      default:
        return <DashboardScreen currentUser={currentUser} onNavigate={handleNavigate} />;
    }
  };

  return (
    <ToastProvider>
      {!currentUser ? (
        <LoginScreen onLoginSuccess={user => setCurrentUser(user)} />
      ) : (
        <AppShell
          currentUser={currentUser}
          currentScreen={currentScreen}
          screenParams={screenParams}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onRoleSwitched={handleRoleSwitched}
        >
          {renderScreen()}
        </AppShell>
      )}
    </ToastProvider>
  );
}
