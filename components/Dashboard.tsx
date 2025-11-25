import React, { useState, useMemo } from 'react';
import { LogEntry, LogStatus, AIAnalysisResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AlertCircle, CheckCircle, Activity, Server, Calendar, BarChart2 } from 'lucide-react';

interface DashboardProps {
  logs: LogEntry[];
  onGenerateReport: (period: 'daily' | 'monthly') => void;
  isAnalyzing: boolean;
  dailyReport: AIAnalysisResult | null;
  monthlyReport: AIAnalysisResult | null;
}

const COLORS = {
  [LogStatus.NORMAL]: '#10B981', // Green
  [LogStatus.WARNING]: '#F59E0B', // Amber
  [LogStatus.CRITICAL]: '#EF4444', // Red
  [LogStatus.MAINTENANCE]: '#6366F1', // Indigo
};

export const Dashboard: React.FC<DashboardProps> = ({ logs, onGenerateReport, isAnalyzing, dailyReport, monthlyReport }) => {
  const [period, setPeriod] = useState<'daily' | 'monthly'>('daily');

  const filteredLogs = useMemo(() => {
    const now = new Date();
    return logs.filter(log => {
      const logDate = new Date(log.timestamp);
      if (period === 'daily') {
        return logDate.toDateString() === now.toDateString();
      } else {
        return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
      }
    });
  }, [logs, period]);

  const currentReport = period === 'daily' ? dailyReport : monthlyReport;

  const statusCounts = filteredLogs.reduce((acc, log) => {
    acc[log.status] = (acc[log.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const totalLogs = filteredLogs.length;
  const criticalCount = statusCounts[LogStatus.CRITICAL] || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
             <BarChart2 className="w-6 h-6 text-indigo-600" />
             ภาพรวมการทำงาน (Dashboard)
           </h2>
           <p className="text-sm text-slate-500 mt-1">
             {period === 'daily' ? 'แสดงข้อมูลเฉพาะวันนี้' : 'แสดงข้อมูลสรุปประจำเดือนนี้'}
           </p>
        </div>
        
        <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex">
          <button
            onClick={() => setPeriod('daily')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              period === 'daily' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            รายวัน (Daily)
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              period === 'monthly' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            รายเดือน (Monthly)
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">{period === 'daily' ? 'งานวันนี้' : 'งานเดือนนี้'}</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalLogs}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-full text-green-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">สถานะปกติ</p>
            <h3 className="text-2xl font-bold text-slate-800">{statusCounts[LogStatus.NORMAL] || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-red-100 rounded-full text-red-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">เหตุขัดข้อง</p>
            <h3 className="text-2xl font-bold text-slate-800">{criticalCount}</h3>
          </div>
        </div>

         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
            <Server size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">ระบบที่บันทึก</p>
            <h3 className="text-2xl font-bold text-slate-800">{new Set(filteredLogs.map(l => l.systemName)).size}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">สัดส่วนสถานะ ({period === 'daily' ? 'วันนี้' : 'เดือนนี้'})</h3>
          <div className="h-64">
             {totalLogs > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name as LogStatus] || '#ccc'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
             ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                    ไม่มีข้อมูล
                </div>
             )}
          </div>
        </div>

        {/* AI Insight Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Gemini AI</span> 
              <span>สรุปผล{period === 'daily' ? 'ประจำวัน' : 'ประจำเดือน'}</span>
            </h3>
            <button 
              onClick={() => onGenerateReport(period)}
              disabled={isAnalyzing || filteredLogs.length === 0}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังวิเคราะห์...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  {currentReport ? 'สร้างรายงานใหม่' : 'สร้างรายงาน'}
                </>
              )}
            </button>
          </div>

          <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-200 transition-all">
             {currentReport ? (
                <div className="space-y-4 animate-fade-in">
                   <div>
                      <h4 className="font-semibold text-slate-700 mb-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        บทสรุปผู้บริหาร:
                      </h4>
                      <p className="text-slate-600 text-sm leading-relaxed">{currentReport.summary}</p>
                   </div>
                   {currentReport.issuesFound && currentReport.issuesFound.length > 0 && (
                      <div>
                         <h4 className="font-semibold text-red-600 mb-1 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {period === 'daily' ? 'สิ่งที่ต้องระวัง:' : 'แนวโน้มปัญหาที่พบ:'}
                         </h4>
                         <ul className="list-disc list-inside text-sm text-slate-600 bg-white p-3 rounded border border-slate-100">
                            {currentReport.issuesFound.map((issue: string, idx: number) => (
                               <li key={idx} className="mb-1 last:mb-0">{issue}</li>
                            ))}
                         </ul>
                      </div>
                   )}
                   <div>
                       <h4 className="font-semibold text-blue-600 mb-1 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          ข้อเสนอแนะ:
                       </h4>
                       <p className="text-slate-600 text-sm">{currentReport.recommendations}</p>
                   </div>
                </div>
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm py-8">
                   <Server className="w-12 h-12 mb-3 text-slate-200" />
                   <p>กดปุ่ม "สร้างรายงาน" เพื่อให้ AI วิเคราะห์ Log {period === 'daily' ? 'ของวันนี้' : 'ของเดือนนี้'}</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};