import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
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

        <h1 className="text-3xl font-bold text-gray-900 mb-8">이용약관</h1>
        
        <div className="prose prose-sm text-gray-700 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제 1 조 (목적)</h2>
            <p>
              본 약관은 "PROJECT PROGRESS"(이하 "서비스")가 제공하는 모든 기능 및 서비스의 이용과 관련하여, 
              서비스 제공자와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제 2 조 (용어의 정의)</h2>
            <p>
              1. "이용자"란 본 약관에 따라 서비스를 이용하는 자를 말합니다.<br />
              2. "서비스"란 이용자가 프로젝트 진행 현황을 관리하고 데이터를 저장, 백업, 복구할 수 있는 웹 애플리케이션을 의미합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제 3 조 (서비스의 제공 및 변경)</h2>
            <p>
              1. 서비스는 이용자가 입력한 데이터를 브라우저 로컬 스토리지에 저장하는 방식으로 제공됩니다.<br />
              2. 서비스 제공자는 운영상, 기술상의 필요에 따라 제공하고 있는 서비스의 전부 또는 일부를 변경할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제 4 조 (데이터의 관리 및 책임)</h2>
            <p>
              1. 이용자가 입력한 데이터는 이용자의 기기(브라우저)에만 저장되며, 서비스 제공자의 서버로 전송되거나 수집되지 않습니다.<br />
              2. 기기 분실, 브라우저 캐시 삭제, 기타 이용자의 부주의로 인한 데이터 유실에 대해 서비스 제공자는 어떠한 책임도 지지 않습니다.<br />
              3. 이용자는 주기적으로 "데이터 백업" 기능을 이용하여 데이터를 안전하게 보관할 책임이 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제 5 조 (AI 기능의 이용)</h2>
            <p>
              1. 서비스 내 AI 요약 기능은 Google Gemini API를 활용합니다.<br />
              2. AI 기능 이용 시 이용자가 입력한 API Key는 브라우저 로컬 스토리지에 저장되며, 서비스 제공자는 이를 수집하거나 열람할 수 없습니다.<br />
              3. AI가 생성한 결과물의 정확성, 신뢰성에 대해 서비스 제공자는 보증하지 않으며, 결과물 활용에 따른 책임은 이용자에게 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제 6 조 (면책조항)</h2>
            <p>
              1. 서비스 제공자는 천재지변, 통신 장애, 기타 불가항력적인 사유로 인해 서비스를 제공할 수 없는 경우 책임이 면제됩니다.<br />
              2. 서비스 제공자는 무료로 제공되는 서비스 이용과 관련하여 이용자에게 발생한 어떠한 손해에 대해서도 책임을 지지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">부칙</h2>
            <p>본 약관은 2026년 3월 6일부터 시행됩니다.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
