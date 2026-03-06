import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Shield, Zap } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 py-4 px-8 flex justify-between items-center">
        <div className="text-xl font-bold text-indigo-600">Project Progress</div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
          채용 프로젝트 관리를 <br />
          <span className="text-indigo-600">가장 스마트하게</span>
        </h1>
        <p className="text-lg text-gray-600 mb-10 max-w-2xl">
          컨설턴트별 프로젝트 진행 현황을 한눈에 파악하고, AI를 활용하여 주간 하이라이트를 자동으로 생성하세요. 
          데이터 백업/복구 기능으로 안전하게 관리할 수 있습니다.
        </p>
        
        <Link 
          to="/dashboard" 
          className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
        >
          무료로 시작하기 <ArrowRight size={20} />
        </Link>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-left">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-indigo-100 w-12 h-12 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
              <CheckCircle size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">직관적인 진행 현황</h3>
            <p className="text-gray-600">고객사별, 컨설턴트별로 프로젝트를 그룹핑하여 한눈에 진행 상태를 파악할 수 있습니다.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center text-green-600 mb-4">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI 주간 요약</h3>
            <p className="text-gray-600">이번 주에 업데이트된 프로젝트 진행 사항을 Gemini AI가 자동으로 요약해 줍니다.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-4">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">안전한 데이터 관리</h3>
            <p className="text-gray-600">모든 데이터는 브라우저에 저장되며, 파일로 백업하고 복구할 수 있어 안전합니다.</p>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 text-center text-gray-500 text-sm">
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
