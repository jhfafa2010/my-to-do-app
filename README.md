# my-to-do-app

순수 HTML/CSS/바닐라 JavaScript로 만든 독립적인 단일 페이지 앱 모음입니다. 별도의 빌드 도구, 패키지 매니저, 테스트 러너 없이 브라우저에서 바로 실행됩니다.

## 앱 목록

### TO-DO — 할 일 관리 앱
- 할 일 추가/삭제/완료 체크, 필터(전체/진행중/완료), 완료 항목 일괄 삭제
- 상태는 `localStorage`에 저장되어 새로고침해도 유지됩니다

### FXCONVETER — 환율 변환 앱
- USD, EUR, KRW, JPY 간 환율 변환
- [exchangerate-api.com](https://www.exchangerate-api.com/) 무료 API로 실시간 환율 조회
- 통화 스왑 버튼 제공

### SNAKE — 스네이크 게임
- 방향키로 조작하는 간단한 스네이크 게임

## 실행 방법

빌드나 서버 설정 없이 각 폴더의 `index.html`을 브라우저로 열면 됩니다.

```powershell
Start-Process TO-DO\index.html
Start-Process FXCONVETER\index.html
Start-Process SNAKE\index.html
```

## 폴더 구조

```
TO-DO/         할 일 관리 앱 (index.html, main.js, style.css)
FXCONVETER/    환율 변환 앱 (index.html, main.js, style.css)
SNAKE/         스네이크 게임 (index.html, main.js, style.css)
```

각 앱은 코드, 상태, 스타일을 공유하지 않는 완전히 독립된 프로젝트입니다.
