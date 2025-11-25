import React, { useState } from 'react';
import { LayoutDashboard, FileText, PlusCircle, LogOut } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { LogEntryForm } from './components/LogEntryForm';
import { LogHistory } from './components/LogHistory';
import { LogEntry, LogStatus, Shift, AIAnalysisResult } from './types';
import { analyzeLogs } from './services/geminiService';

// Mock Data for Initial State (Includes current day and past days)
const MOCK_LOGS: LogEntry[] = [
  // Today's logs
  {
    id: '1',
    timestamp: new Date().toISOString(),
    operatorName: 'สมชาย ใจดี',
    shift: Shift.MORNING,
    systemName: 'Server Room A AirCon',
    operationType: 'Routine Check',
    description: 'อุณหภูมิห้องปกติ 22 องศา ความชื้น 45%',
    status: LogStatus.NORMAL
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    operatorName: 'วิชัย มุ่งมั่น',
    shift: Shift.MORNING,
    systemName: 'Database Cluster DB-01',
    operationType: 'Maintenance',
    description: 'พบบันทึก Error Log connection timeout จำนวนมากในช่วง 10:00 - 10:15 ได้ทำการ Restart Service แล้ว',
    status: LogStatus.WARNING,
    notes: 'Ticket #IT-8821'
  },
  // Previous days in the month
  {
    id: '3',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    operatorName: 'สมชาย ใจดี',
    shift: Shift.NIGHT,
    systemName: 'Backup System',
    operationType: 'Backup/Restore',
    description: 'Backup ประจำวันเสร็จสิ้นสมบูรณ์',
    status: LogStatus.NORMAL
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    operatorName: 'สมศักดิ์ รักงาน',
    shift: Shift.AFTERNOON,
    systemName: 'Network Switch Core-01',
    operationType: 'Incident Response',
    description: 'Port 24 Flapping, เปลี่ยนสาย LAN แล้วอาการปกติ',
    status: LogStatus.WARNING
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
    operatorName: 'วิชัย มุ่งมั่น',
    shift: Shift.MORNING,
    systemName: 'Web Server Farm',
    operationType: 'Routine Check',
    description: 'Load Balancer ทำงานปกติ CPU Usage เฉลี่ย 40%',
    status: LogStatus.NORMAL
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 86400000 * 15).toISOString(), // 15 days ago
    operatorName: 'สมชาย ใจดี',
    shift: Shift.NIGHT,
    systemName: 'UPS System',
    operationType: 'Maintenance',
    description: 'เปลี่ยนแบตเตอรี่ UPS ตัวที่ 2 ตามรอบบำรุงรักษา',
    status: LogStatus.MAINTENANCE
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'new'>('dashboard');
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);
  
  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dailyReport, setDailyReport] = useState<AIAnalysisResult | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<AIAnalysisResult | null>(null);

  const handleAddLog = (newLogData: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog: LogEntry = {
      ...newLogData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    setLogs([newLog, ...logs]);
    setActiveTab('dashboard');
    // Clear today's report as data changed, but keep monthly report until regenerated
    setDailyReport(null);
  };

  const handleAnalyze = async (period: 'daily' | 'monthly') => {
    setIsAnalyzing(true);
    try {
      const now = new Date();
      let targetLogs: LogEntry[] = [];
      
      if (period === 'daily') {
        targetLogs = logs.filter(log => new Date(log.timestamp).toDateString() === now.toDateString());
      } else {
        targetLogs = logs.filter(log => {
          const d = new Date(log.timestamp);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
      }
      
      const result = await analyzeLogs(targetLogs, period);
      
      if (period === 'daily') {
        setDailyReport(result);
      } else {
        setMonthlyReport(result);
      }
    } catch (error) {
      console.error("Failed to analyze", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FileText className="text-white h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">OpsLog AI</h1>
              <p className="text-xs text-slate-500">ระบบบันทึกการปฏิบัติงานพนักงานคุมเครื่อง</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="hidden md:flex items-center text-sm text-slate-600">
                <span className="font-medium mr-2">หัวหน้าแผนก:</span> คุณธีรภัทร
             </div>
             <button className="text-slate-400 hover:text-slate-600">
                <LogOut className="h-5 w-5" />
             </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
        
        {/* Sidebar Navigation (Desktop) / Tabs (Mobile) */}
        <nav className="hidden md:block w-64 flex-shrink-0 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
          >
            <LayoutDashboard size={20} />
            <span>ภาพรวม (Dashboard)</span>
          </button>
          <button 
            onClick={() => setActiveTab('new')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'new' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
          >
            <PlusCircle size={20} />
            <span>บันทึกงานใหม่</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
          >
            <FileText size={20} />
            <span>ประวัติทั้งหมด</span>
          </button>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 flex justify-around z-40">
           <button onClick={() => setActiveTab('dashboard')} className={`p-2 rounded-full ${activeTab === 'dashboard' ? 'text-blue-600 bg-blue-50' : 'text-slate-500'}`}><LayoutDashboard size={24} /></button>
           <button onClick={() => setActiveTab('new')} className={`p-2 rounded-full ${activeTab === 'new' ? 'text-blue-600 bg-blue-50' : 'text-slate-500'}`}><PlusCircle size={24} /></button>
           <button onClick={() => setActiveTab('history')} className={`p-2 rounded-full ${activeTab === 'history' ? 'text-blue-600 bg-blue-50' : 'text-slate-500'}`}><FileText size={24} /></button>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <Dashboard 
              logs={logs} 
              onGenerateReport={handleAnalyze} 
              isAnalyzing={isAnalyzing}
              dailyReport={dailyReport}
              monthlyReport={monthlyReport}
            />
          )}
          
          {activeTab === 'new' && (
            <LogEntryForm 
              onSave={handleAddLog} 
              onCancel={() => setActiveTab('dashboard')} 
            />
          )}

          {activeTab === 'history' && (
            <LogHistory logs={logs} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;