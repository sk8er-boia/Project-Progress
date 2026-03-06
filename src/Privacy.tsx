import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-3xl w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft size={20} /> 뒤로 가기
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">개인정보처리방침</h1>
        
        <div className="prose prose-sm text-gray-700 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. 개인정보의 수집 및 이용 목적</h2>
            <p>
              "Project Progress"(이하 "서비스")는 이용자의 어떠한 개인정보도 수집, 저장, 전송하지 않습니다. 
              모든 데이터는 이용자의 브라우저 로컬 스토리지에만 안전하게 저장되며, 서비스 제공자는 이에 접근할 수 없습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. 수집하는 개인정보 항목</h2>
            <p>
              본 서비스는 회원가입 절차가 없으며, 이름, 이메일, 연락처 등 어떠한 개인정보도 수집하지 않습니다.<br />
              이용자가 입력하는 프로젝트 정보, 컨설턴트명, 고객사 정보 등은 이용자의 기기에만 저장됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. 개인정보의 보유 및 이용 기간</h2>
            <p>
              본 서비스는 개인정보를 수집하지 않으므로, 보유 및 이용 기간이 존재하지 않습니다.<br />
              이용자가 브라우저의 캐시 및 로컬 스토리지를 삭제하거나, 기기를 초기화할 경우 저장된 데이터는 영구적으로 삭제됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. 제3자 제공 및 위탁</h2>
            <p>
              본 서비스는 이용자의 데이터를 수집하지 않으므로, 제3자에게 제공하거나 처리를 위탁하지 않습니다.<br />
              단, 이용자가 "이번 주 요약 생성 (AI)" 기능을 사용할 경우, 이용자가 입력한 데이터는 요약 생성을 위해 
              Google Gemini API로 전송될 수 있습니다. 이 과정에서 발생하는 데이터 처리는 Google의 개인정보처리방침을 따릅니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. 이용자의 권리와 행사 방법</h2>
            <p>
              이용자는 언제든지 브라우저 설정을 통해 로컬 스토리지에 저장된 데이터를 삭제함으로써 
              서비스 이용을 중단하고 데이터를 파기할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. 개인정보 보호책임자 및 담당자 안내</h2>
            <p>
              본 서비스는 개인정보를 수집하지 않으나, 서비스 이용과 관련된 문의사항이 있으신 경우 아래 연락처로 문의해 주시기 바랍니다.<br />
              <br />
              - 이메일: <a href="mailto:jerry@briskyoung.com" className="text-indigo-600 hover:underline">jerry@briskyoung.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. 부칙</h2>
            <p>본 개인정보처리방침은 2026년 3월 6일부터 적용됩니다.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
