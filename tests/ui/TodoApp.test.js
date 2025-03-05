/**
 * TodoApp 컴포넌트 테스트
 */
import { TodoApp } from '../../src/ui/components/TodoApp.js';
import { TodoUseCases } from '../../src/usecases/TodoUseCases.js';
import { MockTodoRepository } from '../mocks/MockTodoRepository.js';
import { Todo, TodoStatus } from '../../src/entities/Todo.js';

// DOM 요소 생성 헬퍼 함수
function createDomElements() {
  // 필요한 DOM 요소 생성
  document.body.innerHTML = `
    <div id="app">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <h1 id="app-title">할 일 관리</h1>
            <div class="dark-mode-toggle">
              <button id="dark-mode-toggle" class="btn btn-sm">
                <i class="bi bi-moon"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div class="row mt-4">
          <div class="col-md-6">
            <div class="input-group mb-3">
              <input type="text" id="search-input" class="form-control" placeholder="검색...">
              <button id="search-button" class="btn btn-outline-secondary">검색</button>
            </div>
          </div>
          <div class="col-md-6">
            <div class="btn-group float-end" role="group">
              <button id="filter-all" class="btn btn-outline-primary active">전체</button>
              <button id="filter-todo" class="btn btn-outline-primary">미완료</button>
              <button id="filter-in-progress" class="btn btn-outline-primary">진행 중</button>
              <button id="filter-done" class="btn btn-outline-primary">완료</button>
            </div>
          </div>
        </div>
        
        <div class="row mt-3">
          <div class="col-12">
            <div class="btn-group float-end mb-3">
              <button id="sort-due-date-asc" class="btn btn-outline-secondary">마감일 ↑</button>
              <button id="sort-due-date-desc" class="btn btn-outline-secondary">마감일 ↓</button>
            </div>
          </div>
        </div>
        
        <div class="row">
          <div class="col-12">
            <ul id="todo-list" class="list-group"></ul>
          </div>
        </div>
        
        <div class="row mt-4">
          <div class="col-12">
            <button id="add-todo-button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#todo-modal">
              할 일 추가
            </button>
          </div>
        </div>
      </div>
      
      <div class="modal fade" id="todo-modal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="todo-modal-title">할 일 추가</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="todo-form">
                <input type="hidden" id="todo-id">
                <div class="mb-3">
                  <label for="todo-title" class="form-label">제목</label>
                  <input type="text" class="form-control" id="todo-title" required>
                </div>
                <div class="mb-3">
                  <label for="todo-description" class="form-label">설명</label>
                  <textarea class="form-control" id="todo-description" rows="3"></textarea>
                </div>
                <div class="mb-3">
                  <label for="todo-due-date" class="form-label">마감일</label>
                  <input type="date" class="form-control" id="todo-due-date">
                </div>
                <div class="mb-3">
                  <label for="todo-status" class="form-label">상태</label>
                  <select class="form-select" id="todo-status">
                    <option value="TODO">미완료</option>
                    <option value="IN_PROGRESS">진행 중</option>
                    <option value="DONE">완료</option>
                  </select>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
              <button type="button" class="btn btn-primary" id="save-todo-button">저장</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Modal 클래스 모의 구현
class ModalMock {
  constructor(element) {
    this.element = element;
    this.isShown = false;
  }
  
  show() {
    this.isShown = true;
    this.element.classList.add('show');
    this.element.style.display = 'block';
  }
  
  hide() {
    this.isShown = false;
    this.element.classList.remove('show');
    this.element.style.display = 'none';
  }
}

// Bootstrap Modal 모의 구현
global.bootstrap = {
  Modal: jest.fn().mockImplementation((element) => new ModalMock(element))
};

describe('TodoApp', () => {
  let todoApp;
  let mockRepository;
  let todoUseCases;
  let mockModal;
  
  beforeEach(() => {
    // DOM 요소 생성
    createDomElements();
    
    // 모의 저장소 및 유스케이스 생성
    mockRepository = new MockTodoRepository();
    todoUseCases = new TodoUseCases(mockRepository);
    
    // TodoApp 인스턴스 생성
    todoApp = new TodoApp(todoUseCases);
    
    // 모달 모의 객체 생성
    const modalElement = document.getElementById('todo-modal');
    mockModal = new ModalMock(modalElement);
    todoApp.todoModal = mockModal;
  });
  
  afterEach(() => {
    // 테스트 후 정리
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });
  
  describe('초기화', () => {
    test('TodoApp이 올바르게 초기화되어야 한다', () => {
      // When
      todoApp.init();
      
      // Then
      expect(todoApp.todoUseCases).toBe(todoUseCases);
      expect(todoApp.todoList).toBe(document.getElementById('todo-list'));
      expect(todoApp.todoForm).toBe(document.getElementById('todo-form'));
      expect(todoApp.searchInput).toBe(document.getElementById('search-input'));
      expect(todoApp.currentFilter).toBe('all');
    });
  });
  
  describe('할 일 렌더링', () => {
    test('할 일 목록을 렌더링할 수 있어야 한다', async () => {
      // Given
      const todo1 = new Todo({
        title: '할 일 1',
        description: '설명 1',
        dueDate: new Date('2025-12-31')
      });
      
      const todo2 = new Todo({
        title: '할 일 2',
        description: '설명 2',
        dueDate: new Date('2025-11-30'),
        status: TodoStatus.IN_PROGRESS
      });
      todo2.status = TodoStatus.IN_PROGRESS;
      
      await mockRepository.save(todo1);
      await mockRepository.save(todo2);
      
      // When
      todoApp.init();
      await todoApp.renderTodos();
      
      // Then
      const todoItems = document.querySelectorAll('#todo-list .list-group-item');
      expect(todoItems.length).toBe(2);
      
      // 첫 번째 할 일 항목 확인
      expect(todoItems[0].querySelector('.todo-title').textContent).toBe(todo1.title);
      expect(todoItems[0].querySelector('.todo-description').textContent).toBe(todo1.description);
      
      // 두 번째 할 일 항목 확인
      expect(todoItems[1].querySelector('.todo-title').textContent).toBe(todo2.title);
      expect(todoItems[1].querySelector('.todo-description').textContent).toBe(todo2.description);
    });
  });
  
  describe('할 일 추가', () => {
    test('새로운 할 일을 추가할 수 있어야 한다', async () => {
      // Given
      todoApp.init();
      
      // 폼 데이터 설정
      document.getElementById('todo-title').value = '새로운 할 일';
      document.getElementById('todo-description').value = '새로운 설명';
      document.getElementById('todo-due-date').value = '2025-12-31';
      document.getElementById('todo-status').value = 'TODO';
      
      // When
      const saveButton = document.getElementById('save-todo-button');
      saveButton.click();
      
      // Then
      const todos = await todoUseCases.getAllTodos();
      expect(todos.length).toBe(1);
      expect(todos[0].title).toBe('새로운 할 일');
      expect(todos[0].description).toBe('새로운 설명');
      expect(todos[0].dueDate).toEqual(new Date('2025-12-31'));
      expect(todos[0].status).toBe(TodoStatus.TODO);
    });
  });
  
  describe('할 일 수정', () => {
    test('기존 할 일을 수정할 수 있어야 한다', async () => {
      // Given
      const todo = new Todo({
        title: '원래 할 일',
        description: '원래 설명',
        dueDate: new Date('2025-12-31')
      });
      
      await mockRepository.save(todo);
      todoApp.init();
      await todoApp.renderTodos();
      
      // 수정 버튼 클릭 시뮬레이션
      const editButton = document.querySelector(`.edit-todo[data-id="${todo.id}"]`);
      editButton.click();
      
      // 폼 데이터 수정
      document.getElementById('todo-title').value = '수정된 할 일';
      document.getElementById('todo-description').value = '수정된 설명';
      document.getElementById('todo-due-date').value = '2026-01-15';
      document.getElementById('todo-status').value = 'IN_PROGRESS';
      
      // When
      const saveButton = document.getElementById('save-todo-button');
      saveButton.click();
      
      // Then
      const updatedTodo = await todoUseCases.getTodoById(todo.id);
      expect(updatedTodo.title).toBe('수정된 할 일');
      expect(updatedTodo.description).toBe('수정된 설명');
      expect(updatedTodo.dueDate).toEqual(new Date('2026-01-15'));
      expect(updatedTodo.status).toBe(TodoStatus.IN_PROGRESS);
    });
  });
  
  describe('할 일 삭제', () => {
    test('할 일을 삭제할 수 있어야 한다', async () => {
      // Given
      const todo = new Todo({
        title: '삭제할 할 일',
        description: '설명',
        dueDate: new Date('2025-12-31')
      });
      
      await mockRepository.save(todo);
      todoApp.init();
      await todoApp.renderTodos();
      
      // 삭제 전 확인
      let todos = await todoUseCases.getAllTodos();
      expect(todos.length).toBe(1);
      
      // 삭제 버튼 클릭 시뮬레이션
      const deleteButton = document.querySelector(`.delete-todo[data-id="${todo.id}"]`);
      
      // window.confirm 모의 구현
      const originalConfirm = window.confirm;
      window.confirm = jest.fn().mockReturnValue(true);
      
      // When
      deleteButton.click();
      
      // Then
      todos = await todoUseCases.getAllTodos();
      expect(todos.length).toBe(0);
      
      // 원래 함수 복원
      window.confirm = originalConfirm;
    });
  });
  
  describe('필터링', () => {
    test('상태별로 할 일을 필터링할 수 있어야 한다', async () => {
      // Given
      const todo1 = new Todo({
        title: '할 일 1',
        description: '설명 1',
        dueDate: new Date('2025-12-31')
      });
      
      const todo2 = new Todo({
        title: '할 일 2',
        description: '설명 2',
        dueDate: new Date('2025-11-30')
      });
      todo2.status = TodoStatus.IN_PROGRESS;
      
      const todo3 = new Todo({
        title: '할 일 3',
        description: '설명 3',
        dueDate: new Date('2025-10-31')
      });
      todo3.status = TodoStatus.DONE;
      
      await mockRepository.save(todo1);
      await mockRepository.save(todo2);
      await mockRepository.save(todo3);
      
      todoApp.init();
      
      // 초기 상태 확인 (전체)
      await todoApp.renderTodos();
      let todoItems = document.querySelectorAll('#todo-list .list-group-item');
      expect(todoItems.length).toBe(3);
      
      // When - 미완료 필터 클릭
      const todoFilterButton = document.getElementById('filter-todo');
      todoFilterButton.click();
      
      // Then
      todoItems = document.querySelectorAll('#todo-list .list-group-item');
      expect(todoItems.length).toBe(1);
      expect(todoItems[0].querySelector('.todo-title').textContent).toBe(todo1.title);
      
      // When - 진행 중 필터 클릭
      const inProgressFilterButton = document.getElementById('filter-in-progress');
      inProgressFilterButton.click();
      
      // Then
      todoItems = document.querySelectorAll('#todo-list .list-group-item');
      expect(todoItems.length).toBe(1);
      expect(todoItems[0].querySelector('.todo-title').textContent).toBe(todo2.title);
      
      // When - 완료 필터 클릭
      const doneFilterButton = document.getElementById('filter-done');
      doneFilterButton.click();
      
      // Then
      todoItems = document.querySelectorAll('#todo-list .list-group-item');
      expect(todoItems.length).toBe(1);
      expect(todoItems[0].querySelector('.todo-title').textContent).toBe(todo3.title);
      
      // When - 전체 필터 클릭
      const allFilterButton = document.getElementById('filter-all');
      allFilterButton.click();
      
      // Then
      todoItems = document.querySelectorAll('#todo-list .list-group-item');
      expect(todoItems.length).toBe(3);
    });
  });
  
  describe('검색', () => {
    test('할 일을 검색할 수 있어야 한다', async () => {
      // Given
      const todo1 = new Todo({
        title: '프로젝트 계획 작성',
        description: '팀 회의 준비',
        dueDate: new Date('2025-12-31')
      });
      
      const todo2 = new Todo({
        title: '이메일 확인',
        description: '프로젝트 관련 이메일 확인',
        dueDate: new Date('2025-11-30')
      });
      
      const todo3 = new Todo({
        title: '보고서 작성',
        description: '월간 보고서 작성',
        dueDate: new Date('2025-10-31')
      });
      
      await mockRepository.save(todo1);
      await mockRepository.save(todo2);
      await mockRepository.save(todo3);
      
      todoApp.init();
      await todoApp.renderTodos();
      
      // 초기 상태 확인
      let todoItems = document.querySelectorAll('#todo-list .list-group-item');
      expect(todoItems.length).toBe(3);
      
      // When - 검색어 입력 및 검색 버튼 클릭
      const searchInput = document.getElementById('search-input');
      const searchButton = document.getElementById('search-button');
      
      searchInput.value = '프로젝트';
      searchButton.click();
      
      // Then
      todoItems = document.querySelectorAll('#todo-list .list-group-item');
      expect(todoItems.length).toBe(2);
      expect(todoItems[0].querySelector('.todo-title').textContent).toBe(todo1.title);
      expect(todoItems[1].querySelector('.todo-title').textContent).toBe(todo2.title);
      
      // When - 다른 검색어로 검색
      searchInput.value = '보고서';
      searchButton.click();
      
      // Then
      todoItems = document.querySelectorAll('#todo-list .list-group-item');
      expect(todoItems.length).toBe(1);
      expect(todoItems[0].querySelector('.todo-title').textContent).toBe(todo3.title);
      
      // When - 검색어 지우고 검색
      searchInput.value = '';
      searchButton.click();
      
      // Then
      todoItems = document.querySelectorAll('#todo-list .list-group-item');
      expect(todoItems.length).toBe(3);
    });
  });
  
  describe('정렬', () => {
    test('마감일 기준으로 할 일을 정렬할 수 있어야 한다', async () => {
      // Given
      const todo1 = new Todo({
        title: '할 일 1',
        description: '설명 1',
        dueDate: new Date('2025-12-31')
      });
      
      const todo2 = new Todo({
        title: '할 일 2',
        description: '설명 2',
        dueDate: new Date('2025-11-30')
      });
      
      const todo3 = new Todo({
        title: '할 일 3',
        description: '설명 3',
        dueDate: new Date('2025-10-31')
      });
      
      await mockRepository.save(todo1);
      await mockRepository.save(todo2);
      await mockRepository.save(todo3);
      
      todoApp.init();
      await todoApp.renderTodos();
      
      // When - 마감일 오름차순 정렬
      const sortAscButton = document.getElementById('sort-due-date-asc');
      sortAscButton.click();
      
      // Then
      let todoItems = document.querySelectorAll('#todo-list .list-group-item');
      expect(todoItems.length).toBe(3);
      expect(todoItems[0].querySelector('.todo-title').textContent).toBe(todo3.title);
      expect(todoItems[1].querySelector('.todo-title').textContent).toBe(todo2.title);
      expect(todoItems[2].querySelector('.todo-title').textContent).toBe(todo1.title);
      
      // When - 마감일 내림차순 정렬
      const sortDescButton = document.getElementById('sort-due-date-desc');
      sortDescButton.click();
      
      // Then
      todoItems = document.querySelectorAll('#todo-list .list-group-item');
      expect(todoItems.length).toBe(3);
      expect(todoItems[0].querySelector('.todo-title').textContent).toBe(todo1.title);
      expect(todoItems[1].querySelector('.todo-title').textContent).toBe(todo2.title);
      expect(todoItems[2].querySelector('.todo-title').textContent).toBe(todo3.title);
    });
  });
});
