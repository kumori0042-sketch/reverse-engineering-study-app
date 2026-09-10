# 오늘의 역기획

PM/서비스기획 취준생을 위한 매일 반복형 역기획 학습 앱. 검증된 기업 케이스 하나 + 분석 노트 + AI의 되묻는 피드백.

**🔗 Live: [reverseengineeringstudyapp.vercel.app](https://reverseengineeringstudyapp.vercel.app)**
**📝 Maker story: [Disquiet 포스트](https://disquiet.io/products/0f22c5c3-7692-448e-85d8-485b7a8598f0)**
**📓 Case study: [8일의 기록 — 시장조사부터 반응 0건까지](https://claude.ai/code/artifact/5db5e871-4dd1-40d7-bfb0-1e003d6f33b6)**

## 배경

역기획 스터디는 PM/서비스기획 취준생에게 사실상 유일한 자체 포트폴리오 제작 수단이지만, 기존 방법은 5주 코호트(30~40만원)나 수백만원짜리 강의, 아니면 완전 혼자 하는 것뿐이었다. 시장조사(경쟁사 실사, 페이크도어 가격 테스트) → MVP 설계·구현 → 배포 → 채널 공유까지 1인 프로젝트로 직접 진행했다.

## 구조

순수 정적 사이트 (백엔드 없음). BYOK 방식으로 AI 비용을 사용자가 직접 부담하므로 서버가 필요 없다.

- `index.html` — 온보딩(목표 선택 → API 키 등록) + 메인 앱(오늘의 케이스 / 내 포트폴리오 / 설정)
- `styles.css` — 디자인 시스템 (라이트/다크 자동 대응)
- `data.js` — 기업 케이스 데이터. 월 1회 리서치로 검증 후 갱신. **AI가 사실을 지어내지 않도록, 여기 값은 항상 사람이 검증한 값만 넣는다.**
- `app.js` — 앱 로직 (날짜 기반 케이스 선택, localStorage 저장, Gemini API 호출)

## AI 연결 (BYOK)

사용자가 [Google AI Studio](https://aistudio.google.com/apikey)에서 무료로 발급받은 Gemini API 키를 브라우저에 직접 입력한다. 키는 `localStorage`에만 저장되며, 우리 서버는 존재하지 않으므로 어디로도 전송되지 않는다 — 브라우저에서 Google API로 직접 호출.

## 로컬 실행

```bash
python -m http.server 5500
```
그 다음 `http://localhost:5500` 접속.

## 배포

정적 파일뿐이라 Vercel/Netlify/GitHub Pages 아무 곳에나 그대로 올리면 된다. 빌드 스텝 없음.

## v1 범위 밖 (다음 버전 후보)

- 5인 그룹 매칭 (현재는 솔로 학습만)
- 콘텐츠 자동 검증 파이프라인 (현재는 수동 리서치로 `data.js` 갱신)
- 유료 크레딧 / 가격 정책 (WTP 인터뷰 데이터 확보 후 설계 예정)
- 클라우드 동기화 (현재는 기기별 localStorage만 — 브라우저 캐시 삭제 시 데이터 유실)
