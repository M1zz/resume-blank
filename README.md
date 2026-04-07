# Resume Builder — 나만의 이력서

모듈로 이야기를 쓰고, 레이아웃에 자유롭게 배치하는 이력서 빌더입니다.

🔗 **Live**: `https://<your-username>.github.io/resume-blank/`

---

## 사용 방법

| 단계 | 탭 | 내용 |
|---|---|---|
| 1 | 👤 기본 정보 | 이름, 직함, 연락처 입력 |
| 2 | 📝 내 이야기 | 모듈(경력/프로젝트/기술 등) 작성 |
| 3 | 🗂 레이아웃 | 모듈을 메인/사이드 컬럼에 배치 |
| 4 | 🎨 스타일 | 헤더 색상, 컬럼 비율 선택 |
| 5 | 내보내기 | PDF 출력 또는 MD 다운로드 |

---

## 모듈 타입

| 아이콘 | 타입 | 설명 |
|---|---|---|
| 💬 | 요약 · 소개 | 자유로운 소개 문단 |
| 💼 | 경력 | 회사명, 직책, 기간, 불릿 리스트 |
| 🛠️ | 프로젝트 | 이름, 스택, 팀 구성, 링크, 내용 |
| ⚡ | 기술 스택 | 그룹명 + 기술 칩 목록 |
| 🎓 | 학력 | 학교, 전공, 기간 |
| 🏅 | 활동 · 수상 | 활동명, 내용, 기간 |
| ✦ | 커스텀 블록 | 제목 + 자유 항목 (칩 형태) |

---

## 레이아웃

- **드래그 앤 드롭**: 모듈을 미배치 풀 ↔ 메인/사이드 컬럼 간 이동
- **순서 조정**: ↑↓ 버튼으로 컬럼 내 순서 변경
- **배치 해제**: ✕ 버튼으로 미배치 풀로 복귀
- **컬럼 비율**: 2:1 / 1.5:1 / 1:1 선택

---

## GitHub Pages 배포

```bash
git init
git remote add origin https://github.com/<username>/resume-blank.git
git add .
git commit -m "init"
git push -u origin main
# → GitHub Settings > Pages > Source: main / (root)
```

---

## 프로젝트 구조

```
resume-blank/
├── index.html       # 앱 진입점
├── css/style.css    # 라이트 모드 디자인 시스템
├── js/
│   ├── data.js      # 모듈 타입, 프리셋, localStorage
│   ├── render.js    # 이력서 HTML/MD 렌더러
│   └── app.js       # 상태 관리, CRUD, DnD, 이벤트
└── README.md
```

데이터는 `localStorage`에 자동 저장됩니다 — 새로고침해도 유지됩니다.

---

Zero dependencies · Vanilla HTML/CSS/JS
