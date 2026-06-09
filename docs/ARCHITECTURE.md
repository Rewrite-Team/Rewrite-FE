# Re:write Frontend Architecture

## 1. Architecture Goal

Re:write 프론트엔드는 자기소개서 작성, AI 첨삭, 키워드 분석, AI 면접을 하나의 작성물 흐름 안에서 연결하는 애플리케이션이다.

아키텍처의 목표는 다음과 같다.

- 라우팅은 Next.js App Router가 담당한다.
- 화면 조립은 `app`과 `widgets`에서 담당한다.
- 사용자 액션 단위의 기능은 `features`에 둔다.
- 도메인 데이터와 도메인 UI는 `entities`에 둔다.
- 전역 공통 자원은 `shared`에 둔다.
- 레이어 간 의존 방향은 현재 ESLint boundaries 설정을 따른다.

```txt
app
-> widgets
-> features
-> entities
-> shared
```

하위 레이어는 상위 레이어를 import하지 않는다.

## 2. Current Folder Baseline

현재 프로젝트는 Feature-Sliced Design 계열 구조를 이미 가지고 있다.

```txt
src/
├── app/
│   ├── (public)/
│   └── (private)/
├── widgets/
├── features/
├── entities/
└── shared/
    ├── assets/
    ├── constants/
    ├── providers/
    ├── styles/
    ├── types/
    └── utils/
```

## 3. Route Architecture

현재 폴더 구조는 자기소개서 상세 하위에 키워드 분석과 AI 면접을 두는 형태다.

```txt
src/app/
├── (public)/
│   └── page.tsx
└── (private)/
    ├── layout.tsx
    └── writing/
        ├── page.tsx
        ├── create/
        │   ├── step1/page.tsx
        │   ├── step2/page.tsx
        │   ├── step3/page.tsx
        │   └── step4/page.tsx
        └── [id]/
            ├── page.tsx
            ├── keyword-analysis/
            │   ├── page.tsx
            │   └── result/page.tsx
            └── interview/
                ├── page.tsx
                └── session/page.tsx
```

`app` 라우트 파일은 가능한 얇게 유지한다. 데이터 조회, 화면 상태, 액션 로직은 `widgets`, `features`, `entities`로 내린다.

## 4. Layer Responsibility

### app

Next.js 라우팅, 레이아웃, 메타데이터, 서버/클라이언트 경계 설정을 담당한다.

```txt
app/
├── layout.tsx
├── (public)/
│   └── page.tsx
└── (private)/
    ├── layout.tsx
    └── writing/
        ├── page.tsx
        ├── create/
        │   ├── step1/page.tsx
        │   ├── step2/page.tsx
        │   ├── step3/page.tsx
        │   └── step4/page.tsx
        └── [id]/
            ├── page.tsx
            ├── keyword-analysis/
            │   ├── page.tsx
            │   └── result/page.tsx
            └── interview/
                ├── page.tsx
                └── session/page.tsx
```

원칙:

- 페이지 컴포넌트는 화면을 직접 길게 구현하지 않는다.
- 페이지는 `widgets`를 조립하는 진입점으로 사용한다.
- 인증이 필요한 영역은 `(private)` 레이아웃에서 공통 처리한다.
- Next.js API 사용 시 현재 프로젝트에 설치된 Next.js 버전을 기준으로 공식 문서를 확인한 뒤 적용한다.
- 에러 메시지나 API 동작이 버전에 의존하는 경우 `node_modules/next/dist/docs/`의 관련 문서를 참고한다.

### widgets

페이지를 구성하는 큰 화면 블록을 담당한다.

권장 구조:

```txt
widgets/
├── common/
├── landing/
├── cover-letter/
├── keyword-analysis/
└── interview/
```

`shared/ui`는 작은 공통 UI를 담당하고, `widgets/common`은 여러 화면에서 재사용되는 큰 조립 단위를 담당한다. 
여러 페이지에서 쓰이더라도 특정 도메인에 강하게 묶인 widget은 `common`이 아니라 해당 도메인 폴더에 둔다.

### features

사용자가 실행하는 액션 단위 기능을 담당한다.

권장 구조:

```txt
features/
├── auth/
├── cover-letter/
├── review-version/
├── keyword-analysis/
```

원칙:

- 버튼 클릭, 폼 제출, 모달 확인 같은 사용자 액션은 `features`에 둔다.
- API mutation, optimistic update, form validation은 해당 feature 내부에 둔다.
- 여러 페이지에서 같은 액션을 쓰면 feature로 유지하고 widget에서 재사용한다.

### entities

도메인 모델, 도메인 API, 도메인 UI를 담당한다.

권장 구조:

```txt
entities/
├── user/
│   ├── api/
│   ├── model/
│   └── ui/
├── cover-letter/
│   ├── api/
│   ├── model/
│   └── ui/
├── review-version/
│   ├── api/
│   ├── model/
│   └── ui/
├── keyword-analysis/
│   ├── api/
│   ├── model/
│   └── ui/
├── interview/
│   ├── api/
│   ├── model/
│   └── ui/
└── llm-job/
    ├── api/
    ├── model/
    └── ui/
```

| Entity | 역할 |
|---|---|
| `user` | 로그인 사용자, 프로필, 접근 권한 |
| `cover-letter` | 자기소개서 기본 정보, 우대사항, 문항, 답변, 제출 상태 |
| `review-version` | AI 첨삭 버전, 선택 버전, 최종 작성본 |
| `keyword-analysis` | 키워드 빈도, 워드 클라우드 데이터, 분석 상태 |
| `interview` | 면접 세션, 질문, 대화방, 메시지, 피드백 |
| `llm-job` | AI 작업 상태, 스트림 진행 상태 |

라우트는 사용자 언어에 맞춰 `/writing`을 유지하지만, 코드 내부 도메인은 백엔드 리소스에 맞춰 `cover-letter`를 사용한다.

백엔드 리소스와 프론트 entity의 대응은 다음을 기준으로 한다.

| Backend API | Frontend entity |
|---|---|
| `/user/me`, `/auth/*` | `user`, `features/auth/*` |
| `/cover-letters/*` | `cover-letter` |
| `/cover-letters/{coverLetterId}/review-versions/*` | `review-version` |
| `/cover-letters/{coverLetterId}/keyword-analysis/*` | `keyword-analysis` |
| `/cover-letters/{coverLetterId}/interview`, `/interviews/*`, `/interview-threads/*` | `interview` |
| `/llm-jobs/*` | `llm-job` |

### shared

비즈니스 도메인에 종속되지 않는 공통 자원을 담당한다.

권장 구조:

```txt
shared/
├── assets/
├── ui/
├── api/
├── lib/
├── hooks/
├── stores/
├── constants/
├── providers/
├── styles/
├── types/
└── utils/
```

역할:

| 폴더 | 역할 |
|---|---|
| `assets` | 이미지, 아이콘, 로고, lottie, 폰트 같은 정적 자원 |
| `ui` | Button, Input, Modal처럼 도메인을 모르는 공통 UI |
| `api` | HTTP client, 공통 request/response 처리, 공통 API error |
| `lib` | 외부 라이브러리 설정, adapter, 인스턴스 생성 로직 |
| `hooks` | 도메인을 모르는 공통 React hook |
| `stores` | 앱 전역에서 공유되는 최소한의 전역 store |
| `constants` | route, query key, 공통 상수 |
| `providers` | QueryProvider처럼 앱 전역 Provider |
| `styles` | global CSS, token, font, style utility |
| `types` | 전역 타입 선언, 외부 모듈 타입 보강 |
| `utils` | 순수 함수 형태의 공통 유틸 |

원칙:

- `shared/ui`는 도메인 문구나 도메인 로직을 알지 않는다.
- `shared/api`는 HTTP 클라이언트, 공통 에러 처리, 인증 헤더 주입만 담당한다.
- `shared/constants/queryKey.ts`는 도메인별 query key factory로 확장한다.
- `shared/hooks`는 특정 entity나 feature를 모르는 hook만 둔다.
- `shared/stores`는 앱 전체에서 필요한 상태에만 사용하고, 도메인 상태는 entity 또는 feature에 둔다.
- `shared/lib`는 라이브러리 연결과 adapter를 담당하고, 단순 순수 함수는 `shared/utils`에 둔다.

## 5. Slice Internal Structure

각 slice는 필요할 때만 폴더를 만든다. 모든 slice에 모든 폴더를 강제로 만들지 않는다.

권장 기본형:

```txt
slice-name/
├── api/
├── model/
├── ui/
├── lib/
└── index.ts
```

역할:

| 폴더 | 역할 |
|---|---|
| `api` | 서버 통신 함수, query/mutation 옵션 |
| `model` | 타입, 상태, schema, 도메인 계산 |
| `ui` | slice 전용 UI 컴포넌트 |
| `lib` | 해당 slice 내부에서만 쓰는 유틸 |
| `index.ts` | 외부 공개 API |

외부에서는 slice 내부 경로를 직접 import하지 않고 `index.ts`를 통해 import한다.

```ts
import { CoverLetterCard } from '@/entities/cover-letter';
import { DeleteCoverLetterButton } from '@/features/cover-letter/delete-cover-letter';
```

## 6. Data Flow

서버 상태는 TanStack Query를 기준으로 관리한다.

```txt
Page
-> Widget
-> Feature
-> Entity API
-> shared/api
-> Backend
```

조회:

```txt
widget 또는 entity ui
-> entity api query option
-> shared api client
```

변경:

```txt
feature
-> mutation
-> entity api
-> query invalidation
```

권장 query key 구조:

```ts
export const queryKey = {
  coverLetter: {
    all: ['cover-letter'] as const,
    list: (params: CoverLetterListParams) => ['cover-letter', 'list', params] as const,
    detail: (coverLetterId: string) => ['cover-letter', 'detail', coverLetterId] as const,
  },
  reviewVersion: {
    list: (coverLetterId: string) => ['review-version', coverLetterId, 'list'] as const,
    detail: (coverLetterId: string, versionId: string) =>
      ['review-version', coverLetterId, 'detail', versionId] as const,
  },
  keywordAnalysis: {
    latest: (coverLetterId: string) => ['keyword-analysis', coverLetterId, 'latest'] as const,
  },
  interview: {
    current: (coverLetterId: string) => ['interview', coverLetterId, 'current'] as const,
    questions: (interviewSessionId: string) =>
      ['interview', interviewSessionId, 'questions'] as const,
    messages: (threadId: string) => ['interview-thread', threadId, 'messages'] as const,
  },
  llmJob: {
    detail: (jobId: string) => ['llm-job', jobId] as const,
  },
};
```

## 7. Main Screen Composition

### Landing

```txt
app/(public)/page.tsx
-> widgets/landing/landing-page
-> shared/ui/button, shared/assets/logos
```

### Writing List

```txt
app/(private)/writing/page.tsx
-> widgets/cover-letter/cover-letter-list
-> entities/cover-letter/ui/CoverLetterCard
-> features/cover-letter/create-cover-letter
```

### Writing Create

```txt
app/(private)/writing/create/step*/page.tsx
-> widgets/cover-letter/cover-letter-create-step
-> features/cover-letter/update-basic-info
-> features/cover-letter/update-preferences
-> features/cover-letter/update-questions
-> features/cover-letter/submit-cover-letter
-> entities/cover-letter/model
-> shared/ui/input, shared/ui/textarea, shared/ui/button
```

### Writing Detail

```txt
app/(private)/writing/[id]/page.tsx
-> widgets/cover-letter/cover-letter-detail
-> widgets/cover-letter/cover-letter-side-menu
-> entities/cover-letter
-> entities/review-version
-> features/review-version/save-final-version
-> features/review-version/request-ai-review
-> features/cover-letter/delete-cover-letter
```

### Keyword Analysis

```txt
app/(private)/writing/[id]/keyword-analysis/page.tsx
-> widgets/keyword-analysis/keyword-analysis-dashboard
-> entities/keyword-analysis
-> features/keyword-analysis/request-keyword-analysis
```

### Interview

```txt
app/(private)/writing/[id]/interview/session/page.tsx
-> widgets/interview/interview-room
-> entities/interview
-> features/interview/send-interview-message
-> features/interview/voice-answer-input
```

## 8. Component Policy

공통 컴포넌트는 `shared/ui`에 둔다.

PRD 기준 우선순위:

```txt
shared/ui/
├── badge/
├── button/
├── input/
├── link-button/
├── modal/
├── page-header/
├── textarea/
└── title/
```

도메인 컴포넌트는 entity 또는 widget에 둔다.

```txt
entities/cover-letter/ui/CoverLetterCard
entities/cover-letter/ui/CoverLetterStatusBadge
entities/review-version/ui/ReviewVersionList
entities/keyword-analysis/ui/KeywordBarChart
entities/interview/ui/InterviewMessage
```

기준:

- 여러 도메인에서 쓰면 `shared/ui`
- 특정 도메인 데이터 타입을 알면 `entities/*/ui`
- 여러 feature/entity를 조립하면 `widgets`
- 사용자 액션이 중심이면 `features`

## 9. State Policy

상태는 성격별로 분리한다.

| 상태 | 위치 |
|---|---|
| 서버에서 온 데이터 | TanStack Query |
| 폼 입력 중인 값 | 해당 feature 또는 widget local state |
| URL로 표현 가능한 값 | route params 또는 search params |
| 모달 열림/닫힘 | feature 또는 widget local state |
| 전역 Provider | `shared/providers` |

작성 Step 데이터는 페이지 이동 사이에 유지되어야 하므로 다음 중 하나로 결정한다.

- 서버 임시 저장이 있으면 draft API와 query cache 사용
- 서버 임시 저장이 없으면 create flow 전용 store 또는 storage adapter 사용

## 10. API Policy

API 함수는 도메인 entity에 둔다.

```txt
entities/cover-letter/api/
├── getCoverLetterList.ts
├── getCoverLetterDetail.ts
├── createCoverLetter.ts
├── updateCoverLetterQuestions.ts
└── deleteCoverLetter.ts
```

`features`는 API를 직접 정의하지 않고 entity API를 사용해 사용자 액션을 완성한다.

```txt
features/cover-letter/delete-cover-letter/
├── ui/DeleteCoverLetterButton.tsx
├── model/useDeleteCoverLetter.ts
└── index.ts
```

## 11. Testing Policy

현재 Jest, Testing Library, Storybook이 설정되어 있다.

권장 테스트 기준:

| 대상 | 테스트 |
|---|---|
| `shared/utils` | unit test |
| `shared/ui` | Storybook, interaction/a11y |
| `entities/model` | unit test |
| `features` | interaction test |
| 주요 widget | integration test |

파일 위치는 구현 파일 옆에 둔다.

```txt
shared/styles/utils/cn.ts
shared/styles/utils/cn.test.ts
```

## 12. Naming Convention

권장 규칙:

- 컴포넌트: `PascalCase`
- 훅: `usePascalCase`
- API 함수: 동사 + 도메인명
- 폴더명: kebab-case
- 타입: `PascalCase`
- query key: 도메인 기준 factory

예시:

```txt
CoverLetterCard.tsx
useDeleteCoverLetter.ts
getCoverLetterDetail.ts
cover-letter-detail/
CoverLetterStatus
```

## 13. Implementation Order

PRD 기준 구현 순서는 다음이 적절하다.

1. `shared/ui` 기본 컴포넌트
2. `entities/cover-letter` 모델, 타입, 카드 UI
3. `widgets` 기본 구조 정리
4. `/writing` 목록 화면
5. `/writing/create/step1~4` 작성 플로우
6. `/writing/[id]` 상세, 첨삭 버전 관리, 삭제
7. `/writing/[id]/keyword-analysis`
8. `/writing/[id]/interview`

이 순서는 공통 기반을 먼저 만들고, 자기소개서 도메인을 중심으로 AI 기능을 확장하기 위한 순서다.
