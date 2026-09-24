import React, { useState, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  FileText, 
  CheckSquare, 
  FileCheck, 
  History, 
  RotateCcw, 
  FileSpreadsheet, 
  Settings, 
  LogOut, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Bell, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { User, UserRole, AsyncJob } from '../../types';
import { PolicyOSApiClient } from '../../lib/api';
import { CommandPalette } from '../CommandPalette';
import { useToast } from '../ui/Toast';

interface AppShellProps {
  currentUser: User;
  currentScreen: string;
  screenParams?: any;
  onNavigate: (screen: string, params?: any) => void;
  onLogout: () => void;
  onRoleSwitched: (user: User) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentUser,
  currentScreen,
  screenParams,
  onNavigate,
  onLogout,
  onRoleSwitched,
  children
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [jobsOpen, setJobsOpen] = useState(false);
  const [workspace, setWorkspace] = useState('Acme Corp Global HQ');
  const [jobs, setJobs] = useState<AsyncJob[]>([]);
  const [candidateCount, setCandidateCount] = useState(0);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const toast = useToast();

  // Periodic polling for async jobs and rule review counts
  useEffect(() => {
    const updateData = () => {
      // Check if user is revoked on every tick
      const users = PolicyOSApiClient.getUsers();
      const me = users.find(u => u.id === currentUser.id);
      if (me && me.status === 'revoked') {
        toast.error('Session Revoked', 'Your user account access was revoked by an administrator.');
        onLogout();
        return;
      }

      const currentJobs = PolicyOSApiClient.getJobs();
      setJobs(currentJobs);

      const rules = PolicyOSApiClient.getRules();
      const pending = rules.filter(r => r.status === 'CANDIDATE').length;
      setCandidateCount(pending);
    };

    updateData();
    const timer = setInterval(updateData, 4000);
    return () => clearInterval(timer);
  }, [currentUser.id, onLogout, toast]);

  const runningJobs = jobs.filter(j => j.status === 'RUNNING');

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: SlidersHorizontal,
      roles: ['FC', 'PO', 'ADMIN']
    },
    {
      id: 'policies',
      label: 'Policies & Extractions',
      icon: FileText,
      roles: ['FC', 'PO', 'ADMIN']
    },
    {
      id: 'rule_review',
      label: 'Rule Review (Maker-Checker)',
      icon: CheckSquare,
      badge: candidateCount > 0 ? `${candidateCount}` : undefined,
      badgeColor: 'amber',
      roles: ['FC', 'PO', 'ADMIN']
    },
    {
      id: 'claims',
      label: 'Claims Evaluation',
      icon: FileCheck,
      roles: ['FC', 'PO', 'ADMIN']
    },
    {
      id: 'decision_records',
      label: 'Decision Records',
      icon: FileSpreadsheet,
      roles: ['FC', 'PO', 'ADMIN']
    },
    {
      id: 'replay',
      label: 'Replay Lab',
      icon: RotateCcw,
      roles: ['FC', 'ADMIN']
    },
    {
      id: 'version_history',
      label: 'Version Lineage',
      icon: History,
      roles: ['FC', 'PO', 'ADMIN']
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: ShieldCheck,
      roles: ['FC', 'ADMIN']
    },
    {
      id: 'admin',
      label: 'Admin & Limits',
      icon: Settings,
      roles: ['ADMIN']
    }
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(currentUser.role));

  const handleSwitchUserRole = (targetRole: UserRole) => {
    const user = PolicyOSApiClient.loginAs(targetRole);
    onRoleSwitched(user);
    setRoleMenuOpen(false);
    toast.info(`Switched Active Role to ${targetRole}`, `Now acting with permissions of ${user.name}`);
  };

  const getBreadcrumbTitle = () => {
    switch (currentScreen) {
      case 'dashboard': return 'Operational Overview';
      case 'policies': return 'Policy Repository & AST';
      case 'policy_detail': return `Policy: ${screenParams?.policyCode || 'Detail'}`;
      case 'upload': return 'Ingest Source Document';
      case 'rule_review': return 'Maker-Checker Queue';
      case 'claims': return 'Deterministic Claim Adjudication';
      case 'decision_records': return 'Immutable Audit Records';
      case 'decision_detail': return `Decision: ${screenParams?.claimNumber || 'Record'}`;
      case 'replay': return 'Historical Replay Lab';
      case 'version_history': return 'Policy Version Lineage';
      case 'audit': return 'Cryptographic Event Audit Log';
      case 'admin': return 'User Access & System Limits';
      default: return 'Overview';
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F8F9FA] text-[#191919] overflow-hidden select-none">
      {/* Sidebar */}
      <aside 
        className={`bg-[#111315] text-[#ECECED] flex flex-col border-r border-[#242629] transition-all duration-200 z-30 shrink-0 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Brand Lockup */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-[#242629]">
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-[#9EF01A] rounded-[4px] flex items-center justify-center font-mono font-bold text-black text-xs">
                P
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-sm text-white">PolicyOS</span>
                <span className="text-[10px] font-mono text-neutral-400">Deterministic Engine</span>
              </div>
            </div>
          ) : (
            <div className="w-6 h-6 bg-[#9EF01A] rounded-[4px] flex items-center justify-center font-mono font-bold text-black text-xs mx-auto">
              P
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-neutral-400 hover:text-white p-1 rounded-[4px] hover:bg-[#202326] transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {!collapsed && (
            <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              Navigation
            </div>
          )}

          {filteredNav.map(item => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id || 
              (item.id === 'policies' && currentScreen === 'policy_detail') ||
              (item.id === 'decision_records' && currentScreen === 'decision_detail');

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-[4px] text-xs font-medium transition-colors relative group ${
                  isActive
                    ? 'bg-[#202326] text-white font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#1A1D20]'
                }`}
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#9EF01A] rounded-r-[2px]" />
                )}
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#9EF01A]' : 'text-neutral-400 group-hover:text-neutral-200'}`} />
                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-[3px]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Role & Workspace Footprint */}
        <div className="p-3 border-t border-[#242629] bg-[#0E1012]">
          {!collapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span className="font-mono uppercase text-[10px] text-neutral-400">Current Role</span>
                <span className={`px-1.5 py-0.5 font-mono text-[10px] font-bold rounded-[3px] ${
                  currentUser.role === 'FC' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : currentUser.role === 'PO'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                }`}>
                  {currentUser.role === 'FC' ? 'FINANCE CONTROLLER' : currentUser.role === 'PO' ? 'POLICY OWNER' : 'ADMIN'}
                </span>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-[4px] object-cover border border-[#2B2D31]"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-neutral-400 truncate">{currentUser.email}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-[4px] object-cover border border-[#2B2D31]"
                title={`${currentUser.name} (${currentUser.role})`}
              />
            </div>
          )}
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-[#E5E5E3] flex items-center justify-between px-6 z-20 shrink-0">
          {/* Breadcrumb Trail */}
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="font-medium text-neutral-700">PolicyOS</span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-semibold text-neutral-900 tracking-tight">{getBreadcrumbTitle()}</span>
          </div>

          {/* Right Header Zone */}
          <div className="flex items-center gap-3">
            {/* Workspace selector */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-[4px]">
              <Building2 className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={workspace}
                onChange={e => setWorkspace(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer text-xs font-medium text-neutral-800"
              >
                <option value="Acme Corp Global HQ">Acme Corp Global HQ</option>
                <option value="Acme APAC Pte Ltd">Acme APAC Pte Ltd</option>
                <option value="Acme India Pvt Ltd">Acme India Pvt Ltd</option>
              </select>
            </div>

            {/* Quick Command Palette trigger */}
            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1 text-xs text-neutral-500 bg-neutral-100 hover:bg-neutral-200/70 border border-neutral-200 rounded-[4px] transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search & Actions</span>
              <kbd className="text-[10px] font-mono text-neutral-400 border border-neutral-300 px-1 py-0.2 rounded-[2px] bg-white">
                ⌘K
              </kbd>
            </button>

            {/* In-Flight Async Jobs Monitor */}
            <div className="relative">
              <button
                onClick={() => setJobsOpen(!jobsOpen)}
                className={`relative p-1.5 rounded-[4px] border transition-colors ${
                  runningJobs.length > 0
                    ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                }`}
                title="Async Job Queue Monitor"
              >
                {runningJobs.length > 0 ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                ) : (
                  <Bell className="w-4 h-4 text-neutral-500" />
                )}
                {runningJobs.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                )}
              </button>

              {/* Jobs Dropdown */}
              {jobsOpen && (
                <div 
                  className="absolute right-0 mt-2 w-80 bg-white border border-[#E5E5E3] rounded-md shadow-xl p-3 z-50 animate-in fade-in"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 mb-2">
                    <span className="text-xs font-semibold text-neutral-900">Background Job Center</span>
                    <span className="text-[10px] font-mono text-neutral-400">{jobs.length} total</span>
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto">
                    {jobs.map(j => (
                      <div key={j.id} className="p-2 bg-neutral-50 border border-neutral-200 rounded-[4px] text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-neutral-900 truncate max-w-[180px]">{j.title}</span>
                          {j.status === 'RUNNING' && (
                            <span className="text-[10px] font-mono text-amber-600 flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              {j.progress}%
                            </span>
                          )}
                          {j.status === 'COMPLETED' && (
                            <span className="text-[10px] font-mono text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Done
                            </span>
                          )}
                        </div>

                        {j.status === 'RUNNING' && (
                          <div className="mt-1.5">
                            <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden">
                              <div
                                className="bg-[#84CC16] h-1 transition-all duration-300"
                                style={{ width: `${j.progress}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
                              <span className="truncate">{j.currentStage}</span>
                              <span>~{j.estimatedRemainingSeconds}s</span>
                            </div>
                          </div>
                        )}

                        {j.resultSummary && (
                          <div className="mt-1 text-[11px] text-neutral-600 font-mono">
                            {j.resultSummary}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setJobsOpen(false)}
                    className="w-full mt-2 py-1 text-center text-[11px] text-neutral-500 hover:text-neutral-800"
                  >
                    Close Job Center
                  </button>
                </div>
              )}
            </div>

            {/* Interactive Role Switcher for Test Driving */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-800 bg-[#E8F8CE] border border-[#BCE87E] rounded-[4px] hover:bg-[#DCF5B8] transition-colors"
                title="Switch role instantly to test permissions"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#235805]" />
                <span className="font-semibold text-[#235805]">
                  {currentUser.role === 'FC' ? 'FC (Controller)' : currentUser.role === 'PO' ? 'PO (Owner)' : 'Admin'}
                </span>
                <ChevronDown className="w-3 h-3 text-[#235805]" />
              </button>

              {roleMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white border border-[#E5E5E3] rounded-md shadow-xl p-2 z-50 text-xs"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="px-2 py-1 text-[10px] font-mono uppercase text-neutral-400">
                    Switch Test Persona
                  </div>
                  <div className="space-y-1 mt-1">
                    <button
                      onClick={() => handleSwitchUserRole('FC')}
                      className={`w-full flex items-center justify-between p-2 rounded-[4px] text-left transition-colors ${
                        currentUser.role === 'FC' ? 'bg-[#F3F4F6] font-semibold text-neutral-900' : 'hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div>
                        <div>Sarah Jenkins (FC)</div>
                        <div className="text-[10px] text-neutral-500">Maker-Checker approvals & replay</div>
                      </div>
                      {currentUser.role === 'FC' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </button>

                    <button
                      onClick={() => handleSwitchUserRole('PO')}
                      className={`w-full flex items-center justify-between p-2 rounded-[4px] text-left transition-colors ${
                        currentUser.role === 'PO' ? 'bg-[#F3F4F6] font-semibold text-neutral-900' : 'hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div>
                        <div>Alex Chen (PO)</div>
                        <div className="text-[10px] text-neutral-500">Uploads policies & views extractions</div>
                      </div>
                      {currentUser.role === 'PO' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </button>

                    <button
                      onClick={() => handleSwitchUserRole('ADMIN')}
                      className={`w-full flex items-center justify-between p-2 rounded-[4px] text-left transition-colors ${
                        currentUser.role === 'ADMIN' ? 'bg-[#F3F4F6] font-semibold text-neutral-900' : 'hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div>
                        <div>Marcus Vance (Admin)</div>
                        <div className="text-[10px] text-neutral-500">User revocations & system limits</div>
                      </div>
                      {currentUser.role === 'ADMIN' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-[4px] transition-colors"
              title="Sign out (redirects to login)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onNavigate={onNavigate}
        onSwitchRole={handleSwitchUserRole}
      />
    </div>
  );
};
