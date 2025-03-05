import { Todo } from '../entities/Todo.js';

/**
 * Todo 유스케이스 클래스
 * Clean Architecture의 유스케이스 계층에 해당
 * 애플리케이션의 비즈니스 로직을 구현
 */
export class TodoUseCases {
  /**
   * TodoUseCases 생성자
   * @param {TodoRepository} todoRepository - Todo 저장소 인터페이스
   */
  constructor(todoRepository) {
    this.todoRepository = todoRepository;
  }

  /**
   * 새로운 Todo 항목 생성
   * @param {string} title - Todo 제목
   * @param {string} description - Todo 설명
   * @param {Date|string|null} dueDate - Todo 마감일
   * @param {string} status - Todo 상태
   * @returns {Promise<Todo>} 생성된 Todo 항목
   */
  async createTodo(title, description = '', dueDate = null, status = '미완료') {
    if (!title || title.trim() === '') {
      throw new Error('제목은 필수 항목입니다.');
    }

    const todo = new Todo({
      title,
      description,
      dueDate,
      status
    });
    
    await this.todoRepository.save(todo);
    return todo;
  }

  /**
   * Todo 항목 업데이트
   * @param {string} id - 업데이트할 Todo ID
   * @param {Object} todoData - 업데이트할 데이터
   * @returns {Promise<Todo>} 업데이트된 Todo 항목
   */
  async updateTodo(id, todoData) {
    const todo = await this.todoRepository.getById(id);
    if (!todo) {
      return null;
    }

    todo.update(todoData);
    await this.todoRepository.save(todo);
    return todo;
  }

  /**
   * Todo 항목 삭제
   * @param {string} id - 삭제할 Todo ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async deleteTodo(id) {
    const todo = await this.todoRepository.getById(id);
    if (!todo) {
      return false;
    }
    
    return await this.todoRepository.delete(id);
  }

  /**
   * ID로 Todo 항목 조회
   * @param {string} id - 조회할 Todo ID
   * @returns {Promise<Todo>} 조회된 Todo 항목
   */
  async getTodoById(id) {
    const todo = await this.todoRepository.getById(id);
    if (!todo) {
      return null;
    }
    return todo;
  }

  /**
   * 모든 Todo 항목 조회
   * @returns {Promise<Array<Todo>>} Todo 항목 배열
   */
  async getAllTodos() {
    return await this.todoRepository.getAll();
  }

  /**
   * 상태별 Todo 항목 조회
   * @param {string} status - 조회할 상태
   * @returns {Promise<Array<Todo>>} 해당 상태의 Todo 항목 배열
   */
  async getTodosByStatus(status) {
    return await this.todoRepository.getByStatus(status);
  }

  /**
   * Todo 항목 검색
   * @param {string} query - 검색 쿼리
   * @returns {Promise<Array<Todo>>} 검색 결과 Todo 항목 배열
   */
  async searchTodos(query) {
    if (!query || query.trim() === '') {
      return await this.getAllTodos();
    }
    return await this.todoRepository.search(query);
  }

  /**
   * 마감일 기준으로 Todo 항목 정렬
   * @param {Array<Todo>} todos - 정렬할 Todo 항목 배열
   * @param {boolean} ascending - 오름차순 정렬 여부
   * @returns {Array<Todo>} 정렬된 Todo 항목 배열
   */
  sortTodosByDueDate(todos, ascending = true) {
    return [...todos].sort((a, b) => {
      // null 마감일은 항상 뒤로
      if (!a.dueDate) return ascending ? 1 : -1;
      if (!b.dueDate) return ascending ? -1 : 1;
      
      // 마감일 비교
      return ascending 
        ? a.dueDate.getTime() - b.dueDate.getTime()
        : b.dueDate.getTime() - a.dueDate.getTime();
    });
  }
}
