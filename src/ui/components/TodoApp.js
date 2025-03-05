/**
 * TodoApp 컴포넌트
 * 전체 앱의 UI 로직을 관리하는 클래스
 */
export class TodoApp {
  /**
   * TodoApp 생성자
   * @param {TodoUseCases} todoUseCases - Todo 유스케이스 인스턴스
   */
  constructor(todoUseCases) {
    this.todoUseCases = todoUseCases;
    this.currentFilter = 'all';
    this.currentSort = 'dueDate';
    this.todos = [];
    
    // DOM 요소 참조
    this.todoListElement = document.getElementById('todoList');
    this.todoForm = document.getElementById('todoForm');
    this.searchInput = document.getElementById('searchInput');
    this.searchButton = document.getElementById('searchButton');
    this.filterButtons = document.querySelectorAll('[data-filter]');
    this.sortOptions = document.querySelectorAll('[data-sort]');
    this.darkModeToggle = document.getElementById('darkModeToggle');
    
    // 모달 요소 참조
    this.todoDetailModal = new bootstrap.Modal(document.getElementById('todoDetailModal'));
    this.todoDetailForm = document.getElementById('todoDetailForm');
    this.todoDetailId = document.getElementById('todoDetailId');
    this.todoDetailTitle = document.getElementById('todoDetailTitle');
    this.todoDetailDescription = document.getElementById('todoDetailDescription');
    this.todoDetailDueDate = document.getElementById('todoDetailDueDate');
    this.todoDetailStatus = document.getElementById('todoDetailStatus');
    this.todoSaveButton = document.getElementById('todoSaveButton');
    this.todoDeleteButton = document.getElementById('todoDeleteButton');
    
    // 이벤트 리스너 설정
    this.setupEventListeners();
    
    // 초기 데이터 로드
    this.loadTodos();
    
    // 다크 모드 설정
    this.setupDarkMode();
  }
  
  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    // Todo 폼 제출 이벤트
    this.todoForm.addEventListener('submit', this.handleTodoFormSubmit.bind(this));
    
    // 검색 이벤트
    this.searchButton.addEventListener('click', this.handleSearch.bind(this));
    this.searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        this.handleSearch();
      }
    });
    
    // 필터 버튼 이벤트
    this.filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        this.currentFilter = button.dataset.filter;
        this.applyFiltersAndSort();
      });
    });
    
    // 정렬 옵션 이벤트
    this.sortOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        this.sortOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        this.currentSort = option.dataset.sort;
        this.applyFiltersAndSort();
      });
    });
    
    // 모달 저장 버튼 이벤트
    this.todoSaveButton.addEventListener('click', this.handleTodoSave.bind(this));
    
    // 모달 삭제 버튼 이벤트
    this.todoDeleteButton.addEventListener('click', this.handleTodoDelete.bind(this));
    
    // 다크 모드 토글 이벤트
    this.darkModeToggle.addEventListener('click', this.toggleDarkMode.bind(this));
  }
  
  /**
   * Todo 목록 로드
   */
  async loadTodos() {
    try {
      this.todos = await this.todoUseCases.getAllTodos();
      this.applyFiltersAndSort();
    } catch (error) {
      this.showError('Todo 목록을 불러오는 중 오류가 발생했습니다.', error);
    }
  }
  
  /**
   * 필터와 정렬 적용
   */
  applyFiltersAndSort() {
    let filteredTodos = [...this.todos];
    
    // 필터 적용
    if (this.currentFilter !== 'all') {
      filteredTodos = filteredTodos.filter(todo => todo.status === this.currentFilter);
    }
    
    // 정렬 적용
    if (this.currentSort === 'dueDate') {
      filteredTodos = this.todoUseCases.sortTodosByDueDate(filteredTodos, true);
    } else if (this.currentSort === 'createdAt') {
      filteredTodos = filteredTodos.sort((a, b) => 
        b.createdAt.getTime() - a.createdAt.getTime()
      );
    }
    
    this.renderTodoList(filteredTodos);
  }
  
  /**
   * Todo 목록 렌더링
   * @param {Array<Todo>} todos - 렌더링할 Todo 항목 배열
   */
  renderTodoList(todos) {
    this.todoListElement.innerHTML = '';
    
    if (todos.length === 0) {
      this.todoListElement.innerHTML = `
        <div class="alert alert-info">
          표시할 할 일이 없습니다.
        </div>
      `;
      return;
    }
    
    todos.forEach(todo => {
      const todoItem = document.createElement('div');
      todoItem.className = `list-group-item todo-item ${todo.isCompleted() ? 'completed' : ''}`;
      todoItem.dataset.id = todo.id;
      
      // 마감일 형식 변환
      const formattedDueDate = todo.dueDate 
        ? todo.dueDate.toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        : '마감일 없음';
      
      // 상태에 따른 클래스
      let statusClass = '';
      if (todo.status === '미완료') statusClass = 'todo';
      else if (todo.status === '진행 중') statusClass = 'in-progress';
      else if (todo.status === '완료') statusClass = 'done';
      
      todoItem.innerHTML = `
        <div class="d-flex w-100 justify-content-between align-items-center">
          <div class="form-check">
            <input class="form-check-input todo-check" type="checkbox" 
              ${todo.isCompleted() ? 'checked' : ''} data-id="${todo.id}">
            <label class="form-check-label todo-title">${todo.title}</label>
          </div>
          <div class="btn-group">
            <button class="btn btn-sm btn-outline-primary todo-edit" data-id="${todo.id}">
              수정
            </button>
          </div>
        </div>
        <p class="mb-1 text-truncate">${todo.description}</p>
        <div class="d-flex justify-content-between">
          <small class="todo-due-date ${todo.isOverdue() ? 'text-danger' : ''}">
            ${todo.isOverdue() ? '⚠️ ' : ''}${formattedDueDate}
          </small>
          <small class="todo-status ${statusClass}">${todo.status}</small>
        </div>
      `;
      
      // 할 일 항목 클릭 이벤트
      todoItem.querySelector('.todo-edit').addEventListener('click', () => {
        this.openTodoDetail(todo.id);
      });
      
      // 체크박스 클릭 이벤트
      todoItem.querySelector('.todo-check').addEventListener('change', (e) => {
        this.handleStatusToggle(todo.id, e.target.checked);
      });
      
      this.todoListElement.appendChild(todoItem);
    });
  }
  
  /**
   * Todo 폼 제출 처리
   * @param {Event} e - 폼 제출 이벤트
   */
  async handleTodoFormSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('todoTitle').value.trim();
    const description = document.getElementById('todoDescription').value.trim();
    const dueDateStr = document.getElementById('todoDueDate').value;
    const dueDate = dueDateStr ? new Date(dueDateStr) : null;
    const status = document.getElementById('todoStatus').value;
    
    try {
      await this.todoUseCases.createTodo(title, description, dueDate, status);
      this.todoForm.reset();
      await this.loadTodos();
      this.showSuccess('할 일이 추가되었습니다.');
    } catch (error) {
      this.showError('할 일을 추가하는 중 오류가 발생했습니다.', error);
    }
  }
  
  /**
   * 검색 처리
   */
  async handleSearch() {
    const query = this.searchInput.value.trim();
    
    try {
      this.todos = await this.todoUseCases.searchTodos(query);
      this.applyFiltersAndSort();
      
      if (query && this.todos.length === 0) {
        this.showInfo(`"${query}"에 대한 검색 결과가 없습니다.`);
      }
    } catch (error) {
      this.showError('검색 중 오류가 발생했습니다.', error);
    }
  }
  
  /**
   * Todo 상세 정보 모달 열기
   * @param {number} id - Todo ID
   */
  async openTodoDetail(id) {
    try {
      const todo = await this.todoUseCases.getTodoById(id);
      
      this.todoDetailId.value = todo.id;
      this.todoDetailTitle.value = todo.title;
      this.todoDetailDescription.value = todo.description;
      
      if (todo.dueDate) {
        const year = todo.dueDate.getFullYear();
        const month = String(todo.dueDate.getMonth() + 1).padStart(2, '0');
        const day = String(todo.dueDate.getDate()).padStart(2, '0');
        this.todoDetailDueDate.value = `${year}-${month}-${day}`;
      } else {
        this.todoDetailDueDate.value = '';
      }
      
      this.todoDetailStatus.value = todo.status;
      
      this.todoDetailModal.show();
    } catch (error) {
      this.showError('할 일 정보를 불러오는 중 오류가 발생했습니다.', error);
    }
  }
  
  /**
   * Todo 저장 처리
   */
  async handleTodoSave() {
    const id = parseInt(this.todoDetailId.value);
    const title = this.todoDetailTitle.value.trim();
    const description = this.todoDetailDescription.value.trim();
    const dueDateStr = this.todoDetailDueDate.value;
    const dueDate = dueDateStr ? new Date(dueDateStr) : null;
    const status = this.todoDetailStatus.value;
    
    try {
      await this.todoUseCases.updateTodo(id, { title, description, dueDate, status });
      this.todoDetailModal.hide();
      await this.loadTodos();
      this.showSuccess('할 일이 업데이트되었습니다.');
    } catch (error) {
      this.showError('할 일을 업데이트하는 중 오류가 발생했습니다.', error);
    }
  }
  
  /**
   * Todo 삭제 처리
   */
  async handleTodoDelete() {
    const id = parseInt(this.todoDetailId.value);
    
    if (confirm('정말로 이 할 일을 삭제하시겠습니까?')) {
      try {
        await this.todoUseCases.deleteTodo(id);
        this.todoDetailModal.hide();
        await this.loadTodos();
        this.showSuccess('할 일이 삭제되었습니다.');
      } catch (error) {
        this.showError('할 일을 삭제하는 중 오류가 발생했습니다.', error);
      }
    }
  }
  
  /**
   * 상태 토글 처리
   * @param {number} id - Todo ID
   * @param {boolean} isChecked - 체크박스 상태
   */
  async handleStatusToggle(id, isChecked) {
    try {
      const status = isChecked ? '완료' : '미완료';
      await this.todoUseCases.updateTodo(id, { status });
      await this.loadTodos();
    } catch (error) {
      this.showError('상태를 변경하는 중 오류가 발생했습니다.', error);
    }
  }
  
  /**
   * 다크 모드 설정
   */
  setupDarkMode() {
    // 사용자 선호도 확인
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedMode = localStorage.getItem('darkMode');
    
    if (savedMode === 'true' || (savedMode === null && prefersDarkMode)) {
      document.body.classList.add('dark-mode');
      this.updateDarkModeButton(true);
    }
  }
  
  /**
   * 다크 모드 토글
   */
  toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    this.updateDarkModeButton(isDarkMode);
  }
  
  /**
   * 다크 모드 버튼 업데이트
   * @param {boolean} isDarkMode - 다크 모드 상태
   */
  updateDarkModeButton(isDarkMode) {
    if (isDarkMode) {
      this.darkModeToggle.innerHTML = '<i class="bi bi-sun"></i> 라이트 모드';
      this.darkModeToggle.classList.remove('btn-outline-secondary');
      this.darkModeToggle.classList.add('btn-outline-light');
    } else {
      this.darkModeToggle.innerHTML = '<i class="bi bi-moon"></i> 다크 모드';
      this.darkModeToggle.classList.remove('btn-outline-light');
      this.darkModeToggle.classList.add('btn-outline-secondary');
    }
  }
  
  /**
   * 성공 메시지 표시
   * @param {string} message - 메시지
   */
  showSuccess(message) {
    alert(message);
  }
  
  /**
   * 정보 메시지 표시
   * @param {string} message - 메시지
   */
  showInfo(message) {
    alert(message);
  }
  
  /**
   * 오류 메시지 표시
   * @param {string} message - 메시지
   * @param {Error} error - 오류 객체
   */
  showError(message, error) {
    console.error(error);
    alert(`${message}\n${error.message}`);
  }
}
