import React, { useState, useMemo } from 'react';
import { LogEntry, LogStatus } from '../types';
import { Search, Filter, AlertTriangle, Check, Clock } from 'lucide-react';

interface LogHistoryProps {
  logs: LogEntry[];
}

export const LogHistory: React.FC<LogHistoryProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.systemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.operatorName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, searchTerm, statusFilter]);

  const getStatusBadge = (status: LogStatus) => {
    switch (status) {
      case LogStatus.NORMAL:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" /> ปกติ</span>;
      case LogStatus.WARNING:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><Clock className="w-3 h-3 mr-1" /> เฝ้าระวัง</span>;
      case LogStatus.CRITICAL:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" /> วิกฤต</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">อื่นๆ</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full animate-fade-in">
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-bold text-slate-800">ประวัติการบันทึก</h3>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="ค้นหา (ระบบ, ผู้บันทึก...)" 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select 
              className="pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">สถานะทั้งหมด</option>
              {Object.values(LogStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100 sticky top-0">
            <tr>
              <th className="px-6 py-3 font-medium">เวลา / กะ</th>
              <th className="px-6 py-3 font-medium">ผู้ปฏิบัติงาน</th>
              <th className="px-6 py-3 font-medium">ระบบ</th>
              <th className="px-6 py-3 font-medium">รายละเอียด</th>
              <th className="px-6 py-3 font-medium">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id} className="bg-white border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-slate-900">{new Date(log.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleDateString('th-TH')}</div>
                    <div className="text-xs text-slate-500 mt-1">{log.shift.split(' ')[0]}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
                    {log.operatorName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-800 font-medium">{log.systemName}</div>
                    <div className="text-xs text-slate-500">{log.operationType}</div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="line-clamp-2 text-slate-600">{log.description}</p>
                    {log.notes && <span className="text-xs text-slate-400 italic">Note: {log.notes}</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(log.status)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  ไม่พบข้อมูลตามเงื่อนไขที่ระบุ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
