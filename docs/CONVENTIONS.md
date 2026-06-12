# Conventions

이 문서는 Re:write 프론트엔드 코드 작성 규칙을 정의한다.

Git 커밋, 브랜치, PR 운영 규칙은 `docs/GIT_WORKFLOW.md`를 따른다.

## 1. Naming

### Directory

디렉토리명은 `kebab-case`를 사용한다.

```txt
user-profile
writing-detail
keyword-analysis
```

### File

| 대상 | 규칙 | 예시 |
|---|---|---|
| 일반 TS/JS 파일 | `camelCase` | `formatDate.ts`, `apiService.ts` |
| 컴포넌트 파일 | `PascalCase` | `Button.tsx`, `WritingCard.tsx` |
| asset 파일 | `kebab-case` | `ic-arrow-left.svg`, `img-main-logo.png` |

숫자가 들어가는 파일명은 `01`, `02`, `03`처럼 두 자리로 맞춘다.

### Asset

아이콘, 이미지, 로고는 용량이 큰 경우 경량화한다.

```txt
SVG: 아이콘, 로고, 단순한 일러스트
PNG: 투명 이미지, UI 요소, SVG로 표현하기 애매한 이미지
```

아이콘 에셋은 이름만 보고 용도를 알 수 있게 작성한다.

```txt
ic-arrow-left.svg
ic-back.svg
img-empty-writing.png
```

asset 폴더의 외부 공개는 `index.ts`에서 관리한다.

## 2. Function And Variable

페이지와 컴포넌트 함수는 `PascalCase`를 사용한다.

페이지 컴포넌트명에는 `Page`를 붙인다.

```tsx
export default function WritingPage() {
  return null;
}
```

컴포넌트 외 일반 함수는 화살표 함수를 사용한다.

```ts
const formatDate = () => {};

export const getWritingList = () => {};
```

변수와 함수는 `camelCase`를 사용한다.

이벤트 핸들러는 `handle + 동사` 형태를 사용한다. prop으로 내릴 때는 `on + 동사` 형태를 사용한다.

```tsx
const handleClick = () => {};

<Button onClick={handleClick} />
```

Boolean 변수는 질문 형태의 접두사를 사용한다.

```ts
const isLoading = true;
const isModalOpen = false;
const hasToken = true;
const hasError = false;
```

상수는 `UPPER_SNAKE_CASE`를 사용한다.

```ts
const API_BASE_URL = 'https://api.example.com';
const MAX_WRITING_CARD_COUNT = 9;
```

`cva` 같은 스타일 상수는 `camelCase`를 사용한다.

```ts
const buttonVariants = cva('');
```

## 3. Import And Export

파일 import 시 절대경로 별칭을 사용한다.

```ts
import { Button } from '@/shared/ui/button';
```

상대경로가 같은 slice 내부에서 짧게 끝나는 경우를 제외하고 `../../` 형태의 깊은 import는 피한다.

각 slice 단위에서 외부 공개 API는 `index.ts`로 관리한다.

```txt
entities/writing/index.ts
features/writing/delete-writing/index.ts
```

외부 모듈은 해당 slice의 `index.ts`를 통해 접근한다.

```ts
import { WritingCard } from '@/entities/writing';
import { DeleteWritingButton } from '@/features/writing/delete-writing';
```

`export *`는 사용하지 않는다. 공개할 항목을 명시적으로 export한다.

```ts
export { WritingCard } from './ui/WritingCard';
export type { Writing } from './model/types';
```

## 4. TypeScript

객체 형태의 props와 모델은 `interface`를 우선 사용한다.

```ts
interface WritingCardProps {
  title: string;
  companyName: string;
}
```

다음 경우에는 `type`을 사용한다.

- primitive alias
- union
- tuple
- function type
- overload
- mapped type
- conditional type
- type guard

```ts
type WritingStatus = 'draft' | 'editing' | 'completed' | 'failed';
type ClickHandler = () => void;
```

기존 컴포넌트의 props를 확장할 때는 `ComponentProps` 방식을 사용할 수 있다.

```ts
import type { ComponentProps } from 'react';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary';
}
```

## 5. React

페이지와 컴포넌트 단위는 함수 선언식을 사용한다.

```tsx
export default function Page() {}

export function Button() {}
```

컴포넌트 내부에서만 사용하는 보조 함수는 화살표 함수를 사용한다.

```tsx
const getButtonLabel = () => '저장';
```

페이지 컴포넌트는 `app` 라우트 파일에서 얇게 유지하고, 실제 화면 조립은 `widgets`로 내린다.

공통 UI는 `shared/ui`, 도메인 UI는 `entities/*/ui`, 사용자 액션 UI는 `features/*`, 페이지 조립 UI는 `widgets/*`에 둔다.

## 6. State Management

서버 상태는 TanStack Query를 사용한다.

query key는 한 파일에서 관리한다.

```txt
src/shared/constants/queryKey.ts
```

Zustand는 전역 상태가 필요할 때만 사용한다.

다음 상태는 local state를 우선한다.

- input 입력값
- 모달 열림/닫힘
- 접기/펼치기
- 현재 탭

## 7. API

API 함수명은 `get`, `create`, `update`, `delete`를 기준으로 작성한다.

```ts
getWritingList();
getWritingDetail();
createWriting();
updateWriting();
deleteWriting();
```

API 함수는 가능하면 entity의 `api` 폴더에 둔다.

```txt
entities/writing/api/getWritingList.ts
entities/writing/api/createWriting.ts
```

feature는 entity API를 사용해 사용자 액션을 완성한다.

## 8. Comment

주석은 단순 설명보다 **작성 이유와 의도**를 중심으로 작성한다.

공통 훅과 공통 컴포넌트에는 되도록 TSDoc을 작성한다.
TSDoc에는 컴포넌트 또는 훅의 역할, 사용하는 상황, 주요 props, 사용 시 주의사항, 간단한 사용 예시를 포함한다.

TSDoc은 다음 구조를 기준으로 작성한다.

- 첫 줄에는 `## 컴포넌트명` 또는 `## 훅 이름`처럼 문서에서 식별하기 쉬운 제목을 작성한다.
- `@description` 아래에 역할과 사용 상황을 작성한다.
- 설명량이 많거나 내용 성격이 나뉘는 경우 `### 주요 내용`, `### 주의할 점`, `### 접근성`처럼 하위 제목으로 구분한다.
- `@param`은 타입만으로 알기 어려운 의도, 접근성 연결, 제어 방식이 있을 때 작성한다.
- `@example`에는 실제 사용 흐름에 가까운 예시를 작성한다.

단, 타입만으로 충분히 알 수 있는 내용을 반복해서 길게 작성하지 않는다.

````tsx
interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  closeOnOverlayClick?: boolean;
  children: React.ReactNode;
  onClose: () => void;
}

/**
 * ## Modal
 *
 * @description
 * 사용자의 확인이나 추가 행동이 필요한 상황에서 사용하는 공통 Modal 컴포넌트입니다.
 *
 * ### 주요 내용
 *
 * 삭제 확인, AI 첨삭 재요청, 작성 취소 확인처럼 사용자의 선택이 필요한 흐름에서 사용합니다.
 * 단순 안내 메시지만 필요한 경우에는 Modal보다 Toast 또는 Inline Message 사용을 우선합니다.
 *
 * `open` 값으로 표시 여부를 제어하는 controlled 컴포넌트입니다.
 * 닫기 버튼 클릭 시 `onClose`를 실행하며, `closeOnOverlayClick`이 true이면 오버레이 클릭 시에도 닫을 수 있습니다.
 *
 * ### 주의할 점
 *
 * 접근성을 위해 `title`은 필수로 전달합니다.
 * Modal 내부에는 사용자가 다음 행동을 선택할 수 있는 버튼을 최소 1개 이상 제공하는 것을 권장합니다.
 *
 * @param open - Modal 표시 여부
 * @param title - Modal의 제목. 접근성 이름으로 사용됩니다.
 * @param description - 제목 아래에 표시되는 보조 설명
 * @param closeOnOverlayClick - 오버레이 클릭으로 닫을 수 있는지 여부
 * @param children - Modal 본문에 표시할 콘텐츠
 * @param onClose - Modal 닫기 요청 시 실행되는 함수
 *
 * @example
 * ```tsx
 * <Modal
 *   open={isOpen}
 *   title="AI 첨삭을 다시 받을까요?"
 *   description="기존 첨삭 결과는 새 결과로 대체됩니다."
 *   closeOnOverlayClick={false}
 *   onClose={closeModal}
 * >
 *   <Button onClick={requestFeedback}>다시 받기</Button>
 *   <Button variant="secondary" onClick={closeModal}>
 *     취소
 *   </Button>
 * </Modal>
 * ```
 */
export function Modal({
  open,
  title,
  description,
  closeOnOverlayClick = true,
  children,
  onClose,
}: ModalProps) {
  if (!open) return null;

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleOverlayClick}
    >
      <div>
        <h2 id="modal-title">{title}</h2>
        {description && <p>{description}</p>}

        <div>{children}</div>

        <button type="button" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}
````

작업 메모 주석은 다음 접두사를 사용한다.

```ts
// TODO: 에러 처리 추가
// BUG: 로그인 시 토큰 갱신 안 됨
// NOTE: 이 훅은 클라이언트 컴포넌트에서만 사용
// OPTIMIZE: 목록 렌더링 최적화 필요
// INFO: 이 값은 백엔드에서 내려줌
```


## 9. Code Style

magic number는 사용하지 않고 상수로 분리한다.

```ts
const WRITING_PAGE_SIZE = 9;
```

Early Return을 우선한다.

```ts
if (!writing) {
  return null;
}
```

중첩을 최소화하고 Guard Clause를 사용한다.

```ts
if (!hasToken) {
  return redirect('/');
}

if (!writingId) {
  return notFound();
}
```
