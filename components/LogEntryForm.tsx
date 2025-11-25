import React, { useState } from 'react';
import { LogEntry, LogStatus, Shift } from '../types';
import { Save, X } from 'lucide-react';

interface LogEntryFormProps {
  onSave: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  onCancel: () => void;
}

export const LogEntryForm: React.FC<LogEntryFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    operatorName: '',
    shift: Shift.MORNING,
    systemName: '',
    operationType: 'Routine Check',
    description: '',
    status: LogStatus.NORMAL,
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">บันทึกการปฏิบัติงานใหม่</h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Operator Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ปฏิบัติงาน</label>
            <input
              required
              type="text"
              name="operatorName"
              value={formData.operatorName}
              onChange={handleChange}
              placeholder="เช่น นายสมชาย ใจดี"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Shift */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">เวร/กะ</label>
            <select
              name="shift"
              value={formData.shift}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              {Object.values(Shift).map(shift => (
                <option key={shift} value={shift}>{shift}</option>
              ))}
            </select>
          </div>

          {/* System Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ระบบ/เครื่องจักร</label>
            <input
              required
              type="text"
              name="systemName"
              value={formData.systemName}
              onChange={handleChange}
              placeholder="เช่น Server Farm A, Database Cluster"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Operation Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ประเภทงาน</label>
            <select
              name="operationType"
              value={formData.operationType}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="Routine Check">ตรวจสอบประจำวัน (Routine Check)</option>
              <option value="Batch Job">รันงานประมวลผล (Batch Job)</option>
              <option value="Maintenance">บำรุงรักษา (Maintenance)</option>
              <option value="Incident Response">แก้ไขเหตุขัดข้อง (Incident Response)</option>
              <option value="Backup/Restore">สำรอง/กู้คืนข้อมูล (Backup/Restore)</option>
              <option value="Other">อื่นๆ</option>
            </select>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">สถานะการทำงาน</label>
          <div className="flex flex-wrap gap-4">
             {Object.values(LogStatus).map((status) => (
                <label key={status} className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg border cursor-pointer transition-all
                  ${formData.status === status 
                    ? status === LogStatus.CRITICAL ? 'bg-red-50 border-red-500 text-red-700' 
                    : status === LogStatus.WARNING ? 'bg-amber-50 border-amber-500 text-amber-700'
                    : 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}
                `}>
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={formData.status === status}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <div className={`w-3 h-3 rounded-full 
                    ${status === LogStatus.NORMAL ? 'bg-green-500' 
                    : status === LogStatus.WARNING ? 'bg-amber-500' 
                    : status === LogStatus.CRITICAL ? 'bg-red-500' 
                    : 'bg-indigo-500'}`} 
                  />
                  <span>{status}</span>
                </label>
             ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียดการปฏิบัติงาน</label>
          <textarea
            required
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="อธิบายผลลัพธ์การทำงาน หรือปัญหาที่พบ..."
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">หมายเหตุเพิ่มเติม (Optional)</label>
          <input
            type="text"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="รหัส Ticket, หมายเลขอ้างอิง, etc."
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors flex items-center shadow-md shadow-blue-200"
          >
            <Save className="w-4 h-4 mr-2" />
            บันทึกข้อมูล
          </button>
        </div>
      </form>
    </div>
  );
};
