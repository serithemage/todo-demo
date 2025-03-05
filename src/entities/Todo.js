/**
 * Todo 상태 열거형
 * @type {Object}
 */
export const TodoStatus = {
  TODO: '미완료',
  IN_PROGRESS: '진행 중',
  DONE: '완료'
};

/**
 * Todo 항목 엔티티 클래스
 * Clean Architecture의 엔티티 계층에 해당
 */
export class Todo {
  /**
   * Todo 항목 생성자
   * @param {number|null} id - Todo 항목의 고유 식별자 (새 항목인 경우 null)
   * @param {string} title - Todo 항목의 제목
   * @param {string} description - Todo 항목의 설명
   * @param {Date|string|null} dueDate - Todo 항목의 마감일
   * @param {string} status - Todo 항목의 상태 (TodoStatus 값 중 하나)
   */
  constructor(id = null, title, description = '', dueDate = null, status = TodoStatus.TODO) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.dueDate = dueDate instanceof Date ? dueDate : dueDate ? new Date(dueDate) : null;
    this.status = status;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Todo 항목의 상태를 변경
   * @param {string} newStatus - 새로운 상태 (TodoStatus 값 중 하나)
   */
  changeStatus(newStatus) {
    if (Object.values(TodoStatus).includes(newStatus)) {
      this.status = newStatus;
      this.updatedAt = new Date();
    } else {
      throw new Error(`유효하지 않은 상태: ${newStatus}`);
    }
  }

  /**
   * Todo 항목이 완료되었는지 확인
   * @returns {boolean} 완료 여부
   */
  isCompleted() {
    return this.status === TodoStatus.DONE;
  }

  /**
   * Todo 항목이 마감일이 지났는지 확인
   * @returns {boolean} 마감일 초과 여부
   */
  isOverdue() {
    if (!this.dueDate) return false;
    return this.dueDate < new Date() && this.status !== TodoStatus.DONE;
  }

  /**
   * Todo 항목을 일반 객체로 변환 (데이터베이스 저장용)
   * @returns {Object} 일반 객체 형태의 Todo 항목
   */
  toObject() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * 일반 객체로부터 Todo 인스턴스 생성
   * @param {Object} obj - Todo 데이터를 포함한 객체
   * @returns {Todo} Todo 인스턴스
   */
  static fromObject(obj) {
    const todo = new Todo(
      obj.id,
      obj.title,
      obj.description,
      obj.dueDate,
      obj.status
    );
    todo.createdAt = new Date(obj.createdAt);
    todo.updatedAt = new Date(obj.updatedAt);
    return todo;
  }

  /**
   * Todo 항목 업데이트
   * @param {Object} todoData - 업데이트할 Todo 데이터
   * @param {string} [todoData.title] - Todo 제목
   * @param {string} [todoData.description] - Todo 설명
   * @param {Date} [todoData.dueDate] - Todo 마감일
   * @param {string} [todoData.status] - Todo 상태
   */
  update(todoData) {
    if (todoData.title !== undefined) {
      this.title = todoData.title;
    }
    
    if (todoData.description !== undefined) {
      this.description = todoData.description;
    }
    
    if (todoData.dueDate !== undefined) {
      this.dueDate = todoData.dueDate;
    }
    
    if (todoData.status !== undefined) {
      this.status = todoData.status;
    }
    
    this.updatedAt = new Date();
  }
  
  /**
   * Todo 항목을 JSON으로 변환
   * @returns {Object} JSON 객체
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate ? this.dueDate.toISOString() : null,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
}
