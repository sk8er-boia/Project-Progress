/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Circle, Sparkles, HelpCircle, Home } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { Steps } from 'intro.js-react';
import 'intro.js/introjs.css';

type ProjectStatus = 
  | 'Longlist 추천 완료'
  | 'Longlist 미팅 완료'
  | '후보자 서치 중'
  | '후보자 추천 완료'
  | '후보자 인터뷰 중'
  | '후보자 최종 인터뷰 중'
  | '후보자 최종 합격'
  | '후보자 입사 대기 중'
  | '후보자 출근 완료';

type PeFirmStatus = 'PE' | '지주사' | '기타';

const PE_FIRM_OPTIONS: PeFirmStatus[] = ['PE', '지주사', '기타'];

type CollaborationStatus = '개별' | '공플1' | '공플2(AM)' | '공플2(AM/PM)' | '공플2(PM/RM)' | '공플2(RM)';

const COLLABORATION_OPTIONS: CollaborationStatus[] = ['개별', '공플1', '공플2(AM)', '공플2(AM/PM)', '공플2(PM/RM)', '공플2(RM)'];

const STATUS_OPTIONS: ProjectStatus[] = [
  'Longlist 추천 완료', 'Longlist 미팅 완료', '후보자 서치 중',
  '후보자 추천 완료', '후보자 인터뷰 중', '후보자 최종 인터뷰 중',
  '후보자 최종 합격', '후보자 입사 대기 중', '후보자 출근 완료'
];

type SuccessStatus = 'none' | 'success' | 'failure';

interface Note {
  id: number;
  text: string;
  date: string;
}

interface Project {
  id: number;
  collaborator: string;
  peFirm: PeFirmStatus;
  customer: string;
  positionName: string;
  startDate: string;
  status: ProjectStatus;
  collaboration: CollaborationStatus;
  expectedRevenue: string;
  expectedJoinDate: string;
  notes: Note[];
  successStatus: SuccessStatus;
  isArchived: boolean;
}

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState<Omit<Project, 'id' | 'notes'>>({
    collaborator: '', peFirm: 'PE', customer: '', positionName: '',
    startDate: new Date().toISOString().split('T')[0], status: '후보자 서치 중', collaboration: '개별', expectedRevenue: '', expectedJoinDate: '',
    successStatus: 'none',
    isArchived: false
  });
  const [newNote, setNewNote] = useState('');
  const [highlight, setHighlight] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [selectedConsultant, setSelectedConsultant] = useState<string>('전체');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPendingData, setImportPendingData] = useState<Project[] | null>(null);
  const [stepsEnabled, setStepsEnabled] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addProject = () => {
    setProjects([...projects, { ...newProject, id: Date.now(), notes: newNote ? [{ id: Date.now(), text: newNote, date: new Date().toLocaleDateString() }] : [] }]);
    setNewProject({
      collaborator: '', peFirm: 'PE', customer: '', positionName: '',
      startDate: new Date().toISOString().split('T')[0], status: '후보자 서치 중', collaboration: '개별', expectedRevenue: '', expectedJoinDate: '',
      successStatus: 'none',
      isArchived: false
    });
    setNewNote('');
  };

  const addNoteToProject = (projectId: number, noteText: string) => {
    if (!noteText) return;
    setProjects(projects.map(p => p.id === projectId ? { ...p, notes: [...p.notes, { id: Date.now(), text: noteText, date: new Date().toLocaleDateString() }] } : p));
  };

  const exportData = () => {
    const data = JSON.stringify(projects);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projects_backup.json';
    a.click();
  };

  const importData = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setImportPendingData(data);
        setShowImportModal(true);
      } catch (error) {
        alert('파일을 읽는 중 오류가 발생했습니다.');
      }
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const generateWeeklyHighlight = async (keyToUse?: string) => {
    const currentKey = typeof keyToUse === 'string' ? keyToUse : apiKey;
    if (!currentKey) {
      setShowApiKeyModal(true);
      return;
    }
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: currentKey });
      
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const recentUpdates = projects.map(p => {
        const recentNotes = p.notes.filter(n => new Date(n.date) >= oneWeekAgo);
        if (recentNotes.length > 0) {
          return `프로젝트 [${p.customer} - ${p.positionName}]:\n` + recentNotes.map(n => `- ${n.date}: ${n.text}`).join('\n');
        }
        return null;
      }).filter(Boolean).join('\n\n');

      if (!recentUpdates) {
        setHighlight('이번 주에 업데이트된 내용이 없습니다.');
        setIsGenerating(false);
        return;
      }

      const prompt = `다음은 이번 주 채용 프로젝트의 주요 업데이트 내용입니다. 이 내용을 바탕으로 주간 Highlight를 요약해서 작성해주세요. 각 프로젝트별로 핵심적인 진척 사항을 간결하게 정리해주세요.\n\n${recentUpdates}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setHighlight(response.text || '');
    } catch (error) {
      console.error('Failed to generate highlight:', error);
      alert('요약 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 매주 금요일 18시에 자동 요약 생성 알림 (선택적 구현, 여기서는 버튼으로 수동 생성도 지원)
  useEffect(() => {
    const checkTime = setInterval(() => {
      const now = new Date();
      if (now.getDay() === 5 && now.getHours() === 18 && now.getMinutes() === 0) {
        generateWeeklyHighlight();
      }
    }, 60000);
    return () => clearInterval(checkTime);
  }, [projects]);

  const uniqueConsultants = Array.from(new Set(projects.map(p => p.collaborator))).filter(Boolean);
  const filteredProjects = selectedConsultant === '전체' ? projects : projects.filter(p => p.collaborator === selectedConsultant);

  const activeProjects = filteredProjects.filter(p => !p.isArchived);
  const archivedProjects = filteredProjects.filter(p => p.isArchived);

  const renderProjectRow = (p: Project, isArchive: boolean) => (
    <tr key={p.id} className={`border-b hover:bg-gray-50 ${isArchive ? 'opacity-70' : ''}`}>
      <td className="p-3">
        <div className="flex flex-col gap-2 items-center">
          <button onClick={() => {
            const nextStatus: SuccessStatus = p.successStatus === 'none' ? 'success' : p.successStatus === 'success' ? 'failure' : 'none';
            setProjects(projects.map(proj => proj.id === p.id ? { ...proj, successStatus: nextStatus } : proj));
          }}>
            {p.successStatus === 'success' ? <CheckCircle className="text-green-500" size={16} /> :
             p.successStatus === 'failure' ? <XCircle className="text-red-500" size={16} /> :
             <Circle className="text-gray-300" size={16} />}
          </button>
          {!isArchive ? (
            <button 
              onClick={() => setProjects(projects.map(proj => proj.id === p.id ? { ...proj, isArchived: true } : proj))}
              className="text-[9px] bg-gray-200 text-gray-700 px-1 py-0.5 rounded hover:bg-gray-300 text-center leading-tight w-full"
            >
              Archive<br/>보내기
            </button>
          ) : (
            <button 
              onClick={() => setProjects(projects.map(proj => proj.id === p.id ? { ...proj, isArchived: false } : proj))}
              className="text-[9px] bg-blue-100 text-blue-700 px-1 py-0.5 rounded hover:bg-blue-200 text-center leading-tight w-full"
            >
              진행중<br/>보내기
            </button>
          )}
        </div>
      </td>
      <td className="p-3 text-xs leading-tight">{p.collaborator.split(' ').join('\n')}</td>
      <td className="p-3">
        <select className="border p-1 rounded text-[10px] w-full" value={p.peFirm} onChange={e => {
          const newPeFirm = e.target.value as PeFirmStatus;
          setProjects(projects.map(proj => proj.id === p.id ? { ...proj, peFirm: newPeFirm } : proj));
        }}>
          {PE_FIRM_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </td>
      <td className="p-3 text-xs">{p.customer}</td>
      <td className="p-3 text-xs w-32">{p.positionName}</td>
      <td className="p-3 text-xs w-28">{p.startDate}</td>
      <td className="p-3 w-40">
        <span className={`px-2 py-1 rounded-full text-[10px] font-medium block whitespace-nowrap ${
          ['Longlist 추천 완료', 'Longlist 미팅 완료'].includes(p.status) ? 'bg-orange-100 text-orange-800' :
          ['후보자 추천 완료', '후보자 인터뷰 중', '후보자 최종 인터뷰 중'].includes(p.status) ? 'bg-green-100 text-green-800' :
          p.status === '후보자 최종 합격' ? 'bg-yellow-100 text-yellow-800' :
          ['후보자 입사 대기 중', '후보자 출근 완료'].includes(p.status) ? 'bg-gray-100 text-gray-800' :
          'bg-blue-50 text-blue-700'
        }`}>
          {p.status}
        </span>
      </td>
      <td className="p-3">
        <select className="border p-1 rounded text-[10px] w-full" value={p.status} onChange={e => {
          const newStatus = e.target.value as ProjectStatus;
          setProjects(projects.map(proj => proj.id === p.id ? { ...proj, status: newStatus } : proj));
        }}>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </td>
      <td className="p-3">
        <select className="border p-1 rounded text-[10px] w-full" value={p.collaboration} onChange={e => {
          const newCollaboration = e.target.value as CollaborationStatus;
          setProjects(projects.map(proj => proj.id === p.id ? { ...proj, collaboration: newCollaboration } : proj));
        }}>
          {COLLABORATION_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </td>
      <td className="p-3 text-xs">{p.expectedRevenue.split(' ').join('\n')}</td>
      <td className="p-3 text-[10px] w-20">
        <input type="date" className="border p-1 rounded text-[10px] w-full" value={p.expectedJoinDate} onChange={e => {
          const newJoinDate = e.target.value;
          setProjects(projects.map(proj => proj.id === p.id ? { ...proj, expectedJoinDate: newJoinDate } : proj));
        }} />
      </td>
      <td className="p-3">
        <div className="text-xs text-gray-600 mb-1 max-h-20 overflow-y-auto">
          {p.notes.map(n => <div key={n.id}>[{n.date}] {n.text}</div>)}
        </div>
        <div className="flex gap-1">
          <input id={`note-${p.id}`} className="border p-1 rounded text-xs w-full" placeholder="추가 Note" />
          <button onClick={() => {
            const input = document.getElementById(`note-${p.id}`) as HTMLInputElement;
            addNoteToProject(p.id, input.value);
            input.value = '';
          }} className="bg-green-600 text-white px-2 py-1 rounded text-xs">추가</button>
        </div>
      </td>
    </tr>
  );

  const renderTable = (data: Project[], isArchive: boolean = false) => {
    const isGrouped = selectedConsultant !== '전체';
    let renderRows: JSX.Element[] = [];

    if (isGrouped) {
      const groupedData = data.reduce((acc, curr) => {
        if (!acc[curr.customer]) acc[curr.customer] = [];
        acc[curr.customer].push(curr);
        return acc;
      }, {} as Record<string, Project[]>);

      Object.entries(groupedData).forEach(([customer, projs]) => {
        renderRows.push(
          <tr key={`group-${customer}`} className="bg-indigo-50/80 border-b border-indigo-100">
            <td colSpan={12} className="p-2 px-3 font-bold text-indigo-900 text-xs">
              🏢 고객사: {customer || '미지정'} <span className="text-indigo-600 font-normal ml-1">({projs.length}건)</span>
            </td>
          </tr>
        );
        projs.forEach(p => {
          renderRows.push(renderProjectRow(p, isArchive));
        });
      });
    } else {
      renderRows = data.map(p => renderProjectRow(p, isArchive));
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto mb-8">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="p-3 w-16">구분</th>
              <th className="p-3 w-20">컨설턴트</th>
              <th className="p-3 w-20">형태</th>
              <th className="p-3 w-32">고객사</th>
              <th className="p-3 w-32">포지션명</th>
              <th className="p-3 w-28">시작일</th>
              <th className="p-3 w-40">현재 STATUS</th>
              <th className="p-3 w-12">상태 변경</th>
              <th className="p-3 w-20">협업<br/>상태</th>
              <th className="p-3 w-20">매출액<br/>(만원)</th>
              <th className="p-3 w-20 text-xs">입사일<br/>(예정)</th>
              <th className="p-3 w-64">진행사항 Note</th>
            </tr>
          </thead>
          <tbody>
            {renderRows.length > 0 ? renderRows : (
              <tr>
                <td colSpan={12} className="p-8 text-center text-gray-500">
                  {isArchive ? '보관된 프로젝트가 없습니다.' : '진행 중인 프로젝트가 없습니다.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const steps = [
    {
      element: '.step-filter',
      intro: '컨설턴트별로 프로젝트를 필터링할 수 있습니다. 특정 컨설턴트를 선택하면 고객사별로 그룹핑되어 표시됩니다.',
      position: 'bottom',
    },
    {
      element: '.step-add',
      intro: '새로운 프로젝트를 추가하고, 기존 데이터를 백업하거나 복구할 수 있습니다.',
      position: 'bottom',
    },
    {
      element: '.step-highlight',
      intro: 'Gemini AI를 활용하여 이번 주에 업데이트된 내용을 자동으로 요약할 수 있습니다.',
      position: 'top',
    },
    {
      element: '.step-table',
      intro: '진행 중인 프로젝트 목록입니다. 상태를 변경하거나 노트를 추가하고, 완료된 프로젝트는 Archive로 보낼 수 있습니다.',
      position: 'top',
    }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Steps
        enabled={stepsEnabled}
        steps={steps}
        initialStep={0}
        onExit={() => setStepsEnabled(false)}
        options={{
          nextLabel: '다음',
          prevLabel: '이전',
          doneLabel: '완료',
          showProgress: true,
        }}
      />
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">프로젝트 진행 현황</h1>
        <div className="flex items-center gap-3">
          <Link 
            to="/"
            className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
          >
            <Home size={16} /> 처음 화면으로
          </Link>
          <button 
            onClick={() => setStepsEnabled(true)}
            className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
          >
            <HelpCircle size={16} /> 가이드 보기
          </button>
        </div>
      </div>
      
      <div className="flex gap-4 mb-8 step-filter">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex-1 flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">컨설턴트 필터:</label>
          <select 
            className="border p-1.5 rounded text-sm w-48" 
            value={selectedConsultant} 
            onChange={e => setSelectedConsultant(e.target.value)}
          >
            <option value="전체">전체</option>
            {uniqueConsultants.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm mb-8 border border-gray-200 step-add">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-md font-semibold">새 프로젝트 추가</h2>
          <div className="flex gap-2">
            <button onClick={exportData} className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200">데이터 백업</button>
            <button onClick={() => fileInputRef.current?.click()} className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200">데이터 복구</button>
            <input type="file" ref={fileInputRef} onChange={importData} className="hidden" accept=".json" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 text-sm">
          <input placeholder="담당 컨설턴트명" className="border p-1.5 rounded" value={newProject.collaborator} onChange={e => setNewProject({...newProject, collaborator: e.target.value})} />
          <select className="border p-1.5 rounded" value={newProject.peFirm} onChange={e => setNewProject({...newProject, peFirm: e.target.value as PeFirmStatus})}>
            {PE_FIRM_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input placeholder="고객사" className="border p-1.5 rounded" value={newProject.customer} onChange={e => setNewProject({...newProject, customer: e.target.value})} />
          <input placeholder="포지션명" className="border p-1.5 rounded" value={newProject.positionName} onChange={e => setNewProject({...newProject, positionName: e.target.value})} />
          <input type="date" className="border p-1.5 rounded" value={newProject.startDate} onChange={e => setNewProject({...newProject, startDate: e.target.value})} />
          <select className="border p-1.5 rounded" value={newProject.status} onChange={e => setNewProject({...newProject, status: e.target.value as ProjectStatus})}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="border p-1.5 rounded" value={newProject.collaboration} onChange={e => setNewProject({...newProject, collaboration: e.target.value as CollaborationStatus})}>
            {COLLABORATION_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input placeholder="매출액 (만원)" className="border p-1.5 rounded" value={newProject.expectedRevenue} onChange={e => setNewProject({...newProject, expectedRevenue: e.target.value})} />
          <input type="date" className="border p-1.5 rounded" value={newProject.expectedJoinDate} onChange={e => setNewProject({...newProject, expectedJoinDate: e.target.value})} />
          <input placeholder="진행사항 Note" className="border p-1.5 rounded col-span-2" value={newNote} onChange={e => setNewNote(e.target.value)} />
          <button onClick={addProject} className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700">프로젝트 추가</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm mb-8 border border-gray-200 step-highlight">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-md font-semibold">주간 Highlight</h2>
          <button 
            onClick={() => generateWeeklyHighlight()} 
            disabled={isGenerating}
            className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded text-sm hover:bg-indigo-100 disabled:opacity-50 transition-colors"
          >
            <Sparkles size={16} />
            {isGenerating ? '요약 생성 중...' : '이번 주 요약 생성 (AI)'}
          </button>
        </div>
        <textarea 
          className="w-full border p-3 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors" 
          rows={5} 
          value={highlight} 
          onChange={e => setHighlight(e.target.value)} 
          placeholder="이번 주 주요 업데이트 내용을 입력하세요. '이번 주 요약 생성' 버튼을 누르면 AI가 자동으로 요약해줍니다." 
        />
      </div>

      <div className="step-table">
        <h2 className="text-xl font-bold mb-4 text-gray-800">진행 중인 프로젝트</h2>
        {renderTable(activeProjects, false)}
      </div>

      <h2 className="text-xl font-bold mb-4 text-gray-800 mt-12">Archive (성사/미성사 완료)</h2>
      {renderTable(archivedProjects, true)}

      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h3 className="text-lg font-bold mb-2 text-gray-900">Gemini API Key 입력</h3>
            <p className="text-sm text-gray-600 mb-4">
              AI 분석을 위해 Gemini API 키가 필요합니다.<br/>
              입력하신 키는 브라우저 로컬 스토리지에 안전하게 저장됩니다.
            </p>
            <input
              type="password"
              className="w-full border p-2 rounded mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="API Key를 입력하세요"
              value={tempApiKey}
              onChange={e => setTempApiKey(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && tempApiKey.trim()) {
                  const key = tempApiKey.trim();
                  localStorage.setItem('gemini_api_key', key);
                  setApiKey(key);
                  setShowApiKeyModal(false);
                  generateWeeklyHighlight(key);
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowApiKeyModal(false)} 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                취소
              </button>
              <button 
                onClick={() => {
                  if (tempApiKey.trim()) {
                    const key = tempApiKey.trim();
                    localStorage.setItem('gemini_api_key', key);
                    setApiKey(key);
                    setShowApiKeyModal(false);
                    generateWeeklyHighlight(key);
                  }
                }} 
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                저장 및 요약 생성
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && importPendingData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[500px]">
            <h3 className="text-lg font-bold mb-4 text-gray-900">데이터 복구 및 취합</h3>
            <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm text-gray-700">
              <p className="font-semibold mb-1">가져온 데이터에 포함된 컨설턴트:</p>
              <p className="text-blue-600 font-medium">
                {Array.from(new Set(importPendingData.map(p => p.collaborator))).filter(Boolean).join(', ') || '없음'}
              </p>
              <p className="mt-2 text-xs text-gray-500">총 {importPendingData.length}개의 프로젝트가 발견되었습니다.</p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  const importedConsultants = new Set(importPendingData.map(p => p.collaborator));
                  const keptProjects = projects.filter(p => !importedConsultants.has(p.collaborator));
                  setProjects([...keptProjects, ...importPendingData]);
                  setShowImportModal(false);
                  setImportPendingData(null);
                }}
                className="w-full text-left p-3 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="font-bold text-blue-800 text-sm">해당 컨설턴트 데이터 업데이트 (추천)</div>
                <div className="text-xs text-blue-600 mt-1">기존 데이터 중 위 컨설턴트들의 데이터만 덮어쓰고, 나머지 컨설턴트 데이터는 유지하며 취합합니다.</div>
              </button>
              
              <button 
                onClick={() => {
                  const newData = importPendingData.map(p => ({...p, id: Date.now() + Math.random()}));
                  setProjects([...projects, ...newData]);
                  setShowImportModal(false);
                  setImportPendingData(null);
                }}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-bold text-gray-800 text-sm">기존 데이터에 모두 추가</div>
                <div className="text-xs text-gray-600 mt-1">기존 데이터를 유지한 채 가져온 모든 프로젝트를 새롭게 추가합니다. (중복 발생 가능)</div>
              </button>

              <button 
                onClick={() => {
                  setProjects(importPendingData);
                  setShowImportModal(false);
                  setImportPendingData(null);
                }}
                className="w-full text-left p-3 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <div className="font-bold text-red-800 text-sm">전체 데이터 초기화 후 복구</div>
                <div className="text-xs text-red-600 mt-1">현재 화면의 모든 데이터를 삭제하고 가져온 데이터로 완전히 교체합니다.</div>
              </button>
            </div>

            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => {
                  setShowImportModal(false);
                  setImportPendingData(null);
                }} 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
        <div className="flex justify-center gap-6 mb-4">
          <Link to="/terms" className="hover:text-gray-800 transition-colors">이용약관</Link>
          <Link to="/privacy" className="hover:text-gray-800 transition-colors">개인정보처리방침</Link>
          <a href="mailto:jerry@briskyoung.com" className="hover:text-gray-800 transition-colors">문의하기</a>
        </div>
        <p>Copyright 2026. Project Progress. All rights reserved.</p>
      </footer>
    </div>
  );
}
