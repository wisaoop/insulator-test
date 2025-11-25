import { GoogleGenAI } from "@google/genai";
import { LogEntry, AIAnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeLogs = async (logs: LogEntry[], period: 'daily' | 'monthly' = 'daily'): Promise<AIAnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  if (logs.length === 0) {
    return {
      summary: `ไม่พบข้อมูลบันทึกการทำงานสำหรับ${period === 'daily' ? 'วันนี้' : 'เดือนนี้'}`,
      issuesFound: [],
      recommendations: "รอข้อมูลเพิ่มเติม"
    };
  }

  const logsText = JSON.stringify(logs.map(log => ({
    time: new Date(log.timestamp).toLocaleString('th-TH'),
    operator: log.operatorName,
    system: log.systemName,
    task: log.operationType,
    status: log.status,
    details: log.description,
    notes: log.notes
  })));

  let systemInstruction = '';
  
  if (period === 'daily') {
    systemInstruction = `
      คุณเป็นผู้ช่วยอัจฉริยะสำหรับหัวหน้าแผนก IT Operations หน้าที่ของคุณคือวิเคราะห์ Log การทำงานของพนักงานคุมเครื่อง (Computer Operators) ประจำวัน
      เน้นสรุปเหตุการณ์ที่เพิ่งเกิดขึ้น สถานะล่าสุด และปัญหาเร่งด่วนที่ต้องจัดการทันที
    `;
  } else {
    systemInstruction = `
      คุณเป็นผู้ช่วยอัจฉริยะสำหรับหัวหน้าแผนก IT Operations หน้าที่ของคุณคือวิเคราะห์ Log การทำงานประจำเดือน (Monthly Summary)
      หน้าที่ของคุณคือ:
      1. สรุปภาพรวมปริมาณงานและเสถียรภาพของระบบตลอดทั้งเดือน
      2. วิเคราะห์แนวโน้ม (Trends) เช่น ช่วงเวลาที่มักเกิดปัญหา หรือระบบที่ขัดข้องบ่อย
      3. ระบุปัญหาที่เกิดขึ้นซ้ำซาก (Recurring Issues)
      4. ให้ข้อเสนอแนะเชิงกลยุทธ์ หรือแผนบำรุงรักษา
    `;
  }

  const prompt = `
    ${systemInstruction}
    
    ข้อมูล Logs (JSON):
    ${logsText}

    กรุณาวิเคราะห์และตอบกลับเป็นรูปแบบ JSON โดยไม่ต้องมี Markdown code block ครอบ ดังนี้:
    {
      "summary": "บทสรุปผู้บริหารแบบกระชับ (ภาษาไทย)",
      "issuesFound": ["รายการปัญหาที่พบ (ถ้ามี), สิ่งผิดปกติ, หรือแนวโน้มปัญหาที่น่ากังวล"],
      "recommendations": "ข้อเสนอแนะสำหรับการปรับปรุง หรือการป้องกันปัญหาในอนาคต"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      summary: "เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูล",
      issuesFound: ["System Error"],
      recommendations: "กรุณาลองใหม่อีกครั้ง"
    };
  }
};