# Todo 웹 앱

## 프로젝트 개요

이 프로젝트는 웹 브라우저에서 작동하는 클라이언트 측 Todo 앱입니다. 사용자는 할 일을 추가, 수정, 삭제하고 상태를 관리할 수 있습니다. 이 앱은 SOLID 원칙, Clean Architecture 및 TDD 방법론을 적용하여 개발되었습니다.

## 주요 기능

- 할 일 추가, 수정, 삭제
- 할 일 상태 관리 (미완료, 진행 중, 완료)
- 마감일 기준 정렬
- 상태별 필터링
- 검색 기능
- 다크 모드 지원
- 반응형 디자인
- 오프라인 지원

## 기술 스택

- **프론트엔드**: 바닐라 JavaScript
- **UI 프레임워크**: Bootstrap 5
- **데이터베이스**: Dexie.js (IndexedDB 래퍼)

## 아키텍처

이 프로젝트는 Clean Architecture 패턴을 따르며 다음과 같은 계층 구조로 구성되어 있습니다:

1. **엔티티 계층 (Entities)**
   - Todo 항목의 핵심 비즈니스 규칙과 데이터 구조

2. **유스케이스 계층 (Use Cases)**
   - 애플리케이션의 비즈니스 로직
   - Todo 항목 추가, 수정, 삭제, 조회, 필터링 등의 기능

3. **인터페이스 어댑터 계층 (Interface Adapters)**
   - 유스케이스와 외부 프레임워크/도구 간의 변환
   - 데이터베이스 어댑터, 프레젠터 등

4. **프레임워크 및 드라이버 계층 (Frameworks & Drivers)**
   - 데이터베이스(Dexie.js), UI 프레임워크(Bootstrap) 등 외부 도구

### 아키텍처 다이어그램

```mermaid
graph TD
    subgraph "UI 계층"
        UI[TodoApp.js]
    end
    
    subgraph "프레임워크 및 드라이버 계층"
        DB[TodoDatabase.js]
    end
    
    subgraph "인터페이스 어댑터 계층"
        Repo[DexieTodoRepository.js]
    end
    
    subgraph "유스케이스 계층"
        UC[TodoUseCases.js]
        RepoInterface[TodoRepository.js]
    end
    
    subgraph "엔티티 계층"
        Entity[Todo.js]
    end
    
    UI --> UC
    UC --> RepoInterface
    UC --> Entity
    Repo --> RepoInterface
    Repo --> DB
    Repo --> Entity
    
    style UI fill:#f9f,stroke:#333,stroke-width:2px
    style DB fill:#bbf,stroke:#333,stroke-width:2px
    style Repo fill:#bfb,stroke:#333,stroke-width:2px
    style UC fill:#fbb,stroke:#333,stroke-width:2px
    style RepoInterface fill:#fbb,stroke:#333,stroke-width:2px
    style Entity fill:#ff9,stroke:#333,stroke-width:2px
```

### 주요 시퀀스 다이어그램

#### 할 일 추가 시퀀스

```mermaid
sequenceDiagram
    participant User
    participant UI as TodoApp.js
    participant UC as TodoUseCases.js
    participant Entity as Todo.js
    participant Repo as DexieTodoRepository.js
    participant DB as TodoDatabase.js
    
    User->>UI: 할 일 정보 입력 및 추가 버튼 클릭
    UI->>UC: createTodo(title, description, dueDate)
    UC->>Entity: new Todo(null, title, description, dueDate, 'TODO')
    Entity-->>UC: 새로운 Todo 객체
    UC->>Repo: save(todo)
    Repo->>DB: table('todos').add(todo.toJSON())
    DB-->>Repo: 생성된 Todo ID
    Repo-->>UC: 저장된 Todo 객체
    UC-->>UI: 저장된 Todo 객체
    UI->>UI: 화면에 새 할 일 표시
    UI-->>User: 할 일 추가 완료 확인
```

#### 할 일 검색 시퀀스

```mermaid
sequenceDiagram
    participant User
    participant UI as TodoApp.js
    participant UC as TodoUseCases.js
    participant Repo as DexieTodoRepository.js
    participant DB as TodoDatabase.js
    
    User->>UI: 검색어 입력
    UI->>UC: searchTodos(query)
    UC->>Repo: search(query)
    Repo->>DB: table('todos').toArray()
    DB-->>Repo: 모든 Todo 항목
    Repo->>Repo: 검색어로 필터링
    Repo-->>UC: 필터링된 Todo 객체 배열
    UC-->>UI: 필터링된 Todo 객체 배열
    UI->>UI: 검색 결과 표시
    UI-->>User: 검색 결과 확인
```

#### 할 일 상태 변경 시퀀스

```mermaid
sequenceDiagram
    participant User
    participant UI as TodoApp.js
    participant UC as TodoUseCases.js
    participant Entity as Todo.js
    participant Repo as DexieTodoRepository.js
    participant DB as TodoDatabase.js
    
    User->>UI: 할 일 상태 변경 (체크박스 클릭)
    UI->>UC: updateTodo(id, {status: newStatus})
    UC->>Repo: getById(id)
    Repo->>DB: table('todos').get(id)
    DB-->>Repo: Todo 데이터
    Repo-->>UC: Todo 객체
    UC->>Entity: todo.update({status: newStatus})
    Entity-->>UC: 업데이트된 Todo 객체
    UC->>Repo: save(updatedTodo)
    Repo->>DB: table('todos').update(id, updatedTodo.toJSON())
    DB-->>Repo: 업데이트 성공
    Repo-->>UC: 업데이트된 Todo 객체
    UC-->>UI: 업데이트된 Todo 객체
    UI->>UI: 화면에 변경된 상태 표시
    UI-->>User: 상태 변경 완료 확인
```

## 프로젝트 구조

```
todo-demo/
├── docs/                  # 문서
│   ├── 요건정의_질문.md
│   ├── 세부설계.md
│   └── 작업목록.md
├── src/
│   ├── entities/          # 엔티티 계층
│   │   └── Todo.js
│   ├── usecases/          # 유스케이스 계층
│   │   ├── TodoUseCases.js
│   │   └── repositories/
│   │       └── TodoRepository.js
│   ├── adapters/          # 인터페이스 어댑터 계층
│   │   └── repositories/
│   │       └── DexieTodoRepository.js
│   ├── frameworks/        # 프레임워크 및 드라이버 계층
│   │   └── database/
│   │       └── TodoDatabase.js
│   ├── ui/                # UI 컴포넌트
│   │   ├── components/
│   │   │   └── TodoApp.js
│   │   └── styles.css
│   └── app.js             # 앱 진입점
└── index.html             # 메인 HTML 파일
```

## 시작하기

1. 저장소를 클론합니다.
2. `index.html` 파일을 웹 브라우저에서 엽니다.

## 개발 원칙

### SOLID 원칙

- **단일 책임 원칙 (SRP)**: 각 클래스는 하나의 책임만 가짐
- **개방-폐쇄 원칙 (OCP)**: 확장에는 열려있고, 수정에는 닫혀있는 구조
- **리스코프 치환 원칙 (LSP)**: 상위 타입 객체를 하위 타입 객체로 대체 가능
- **인터페이스 분리 원칙 (ISP)**: 클라이언트는 사용하지 않는 인터페이스에 의존하지 않음
- **의존성 역전 원칙 (DIP)**: 고수준 모듈은 저수준 모듈에 의존하지 않고, 둘 다 추상화에 의존

### TDD (테스트 주도 개발)

- 테스트를 먼저 작성하고 구현하는 방식으로 개발
- 단위 테스트, 통합 테스트, E2E 테스트 포함

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.
