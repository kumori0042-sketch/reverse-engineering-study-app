// 검증된 사실만 담는다 — AI는 여기서 "오늘의 컷"만 고를 뿐, 사실을 지어내지 않는다.
// 월 1회 리서치 갱신 주기. 각 항목의 출처를 반드시 남길 것.
const COMPANIES = [
  {
    id: "toss",
    name: "토스 (비바리퍼블리카)",
    category: "국내 스타트업",
    pricing: "소비자는 무료. 대출비교 등은 중개 수수료 기반 — 저축은행 '햇살론 특례' 상품 중개 수수료를 최근 인하 발표.",
    revenue: "2026년 상반기 연결 영업수익 1조8,928억원(전년比 +53.2%), 순이익 2,328억원(+120.2%). 슈퍼앱 매출이 전체의 70.3% 차지.",
    features: "토스뱅크·토스페이먼츠·토스플레이스 등 계열사로 하나의 앱 안에 금융 생태계를 통합하는 슈퍼앱 전략.",
    recentIssue: "2026년 미국 나스닥 직상장을 준비 중.",
    cuts: [
      "슈퍼앱은 왜 하나의 앱에 모든 걸 넣으려 할까? 이게 유저에게 정말 좋은 선택일까, 아니면 락인 전략일까?",
      "중개 수수료를 인하한다는 발표, 상생일까 아니면 규제 압박에 대한 방어일까?"
    ],
    sources: [
      { title: "sidae.com", url: "https://www.sidae.com/article/2026081418243575774" },
      { title: "ibtomato.com", url: "https://www.ibtomato.com/ExternalView.aspx?type=1&no=19270" }
    ]
  },
  {
    id: "daangn",
    name: "당근 (당근마켓)",
    category: "국내 스타트업",
    pricing: "이용자는 무료. 광고주 대상 '당근비즈니스'(디스플레이·검색광고)로만 과금.",
    revenue: "매출의 99% 이상이 광고. 2024년 매출 1,892억원(2022년 500억원 대비 3배+), 광고주 수 +37%·집행 광고 수 +52%.",
    features: "중고거래 → 동네생활 → 알바 → 부동산 → 중고차로 순차 확장. 체류시간이 가장 긴 '동네생활' 탭에 광고 노출을 집중.",
    recentIssue: "해외 사업은 아직 뚜렷한 수익 모델이 없다는 지적 — 매출 구조가 광고에 극단적으로 편중된 점이 리스크로 거론됨.",
    cuts: [
      "매출 99%가 광고인 회사, 이 구조는 위험한 걸까 당연한 걸까? 대안이 있다면 뭘까?",
      "왜 하필 '동네생활' 탭을 키웠을까? 중고거래 앱이 커뮤니티 탭에 투자하는 이유는?"
    ],
    sources: [
      { title: "pointe.co.kr", url: "https://www.pointe.co.kr/news/articleView.html?idxno=77877" },
      { title: "mstacc.com", url: "https://blog.mstacc.com/columns/business-analysis/8271" }
    ]
  },
  {
    id: "notion",
    name: "Notion",
    category: "해외 서비스",
    pricing: "Free $0 / Plus 월 $10~12 / Business 월 $20~24 / Enterprise 별도. 2025.5.13부로 $10 AI 애드온을 없애고 Business 요금제에 AI를 전면 통합.",
    revenue: "시트 기반 구독(SaaS). Free/Plus는 제한적 AI만 제공해 상위 요금제 업셀을 유도. Custom Agents는 $10/1,000크레딧 별도 과금.",
    features: "문서·위키·DB를 하나로 묶은 올인원 워크스페이스 + AI 에이전트.",
    recentIssue: "AI를 '애드온'에서 '요금제 자체 번들'로 바꾼 대표적 가격 정책 피벗 사례.",
    cuts: [
      "잘 팔리던 AI 애드온을 왜 없앴을까? 번들로 바꾸면 회사에 어떤 이득이 있을까?",
      "AI를 가장 비싼 요금제에만 몰아넣은 이유는? 저가 요금제 유저는 무엇을 잃었을까?"
    ],
    sources: [
      { title: "costbench.com", url: "https://costbench.com/software/ai-productivity/notion-ai/" },
      { title: "flowith.io", url: "https://flowith.io/blog/notion-ai-pricing-10-month-addon-worth-it/" }
    ]
  },
  {
    id: "duolingo",
    name: "Duolingo",
    category: "해외 서비스",
    pricing: "Free / Super / Max(약 월 $30, 연 $167.99). Max의 GPT-4 기반 'Explain My Answer'·'Roleplay'를 2026년 초 일부 언어권에서 무료로 전환.",
    revenue: "구독(Super/Max) + 무료 티어 광고.",
    features: "게이미피케이션 기반 언어학습 + AI 튜터.",
    recentIssue: "2025년 'AI-first' 선언 후 구독 취소를 언급하는 소비자 반발이 커지자 CEO가 입장을 일부 철회. 정규직 해고는 없었으나 계약직은 약 10% 감축.",
    cuts: [
      "'AI 최우선' 선언이 왜 역풍을 맞았을까? 같은 메시지를 다르게 전달했다면 반응이 달랐을까?",
      "돈 받던 프리미엄 기능을 갑자기 무료로 푸는 진짜 이유는 뭘까?"
    ],
    sources: [
      { title: "fortune.com", url: "https://fortune.com/2025/06/09/duolingo-ceo-surprised-backlash-ai-first-company-announcement/" },
      { title: "dealnews.com", url: "https://www.dealnews.com/features/duolingo/cost/" }
    ]
  },
  {
    id: "naverpay",
    name: "네이버페이",
    category: "대기업 신사업",
    pricing: "소비자 무료, 가맹점 대상 결제수수료. 영세 가맹점 수수료는 2021·2022·2025년 세 차례 인하, 2026년에도 7번째 상생 지원 진행.",
    revenue: "가맹점 결제수수료 + 예약/주문 서비스 수수료.",
    features: "8월 31일부로 매장결제를 음식점까지 확대, 삼성페이와 연동해 온·오프라인 통합 결제 제공.",
    recentIssue: "음식점 예약 취소·노쇼 발생 시 동일 결제수단으로 취소수수료를 청구하는 정책을 신설.",
    cuts: [
      "노쇼 수수료는 누구를 보호하기 위한 정책일까? 소비자·점주·플랫폼 중 누가 이득일까?",
      "상생 지원을 7번이나 반복하는 이유는? 매번 '지원'이라는 프레임을 쓰는 이유는?"
    ],
    sources: [
      { title: "newspim.com", url: "https://www.newspim.com/news/view/20260825000761" },
      { title: "navercorp.com", url: "https://www.navercorp.com/media/pressReleasesDetail?seq=34985" }
    ]
  },
  {
    id: "kakaopay",
    name: "카카오페이",
    category: "대기업 신사업",
    pricing: "소비자 무료, 가맹점 결제수수료 + 금융 자회사(증권·손보) 상품 수익.",
    revenue: "2026년 상반기 처음으로 금융서비스 매출 비중이 결제 매출을 넘어 전체의 50%+. 순이익 843억원(+195.9%), 카카오페이증권 매출 1,219억원(+86%).",
    features: "오프라인 가맹점 65만+ 개 확보, 자산관리 에이전트 '금융비서 1.0' 베타 준비, 차세대 결제 프로토콜 x402 재단 참여.",
    recentIssue: "쿠팡의 범용 간편결제 시장 진출 예고로 경쟁이 한층 치열해질 전망.",
    cuts: [
      "결제 앱이 왜 증권사·보험사가 됐을까? '결제'와 '금융' 중 어느 쪽이 진짜 본업이 된 걸까?",
      "쿠팡이 들어오면 카카오페이는 무엇으로 방어할까? 이미 손에 쥔 자산은 뭘까?"
    ],
    sources: [
      { title: "bizwatch.co.kr", url: "https://news.bizwatch.co.kr/article/finance/2026/08/04/0044" },
      { title: "dailyinvest.kr", url: "http://www.dailyinvest.kr/news/articleView.html?idxno=70693" }
    ]
  }
];
