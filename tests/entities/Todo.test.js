/**
 * Todo 엔티티 테스트
 */
import { Todo, TodoStatus } from '../../src/entities/Todo.js';

describe('Todo 엔티티', () => {
  test('새로운 Todo 객체가 올바르게 생성되어야 한다', () => {
    // Given
    const title = '테스트 할 일';
    const description = '테스트 설명';
    const dueDate = new Date('2025-12-31');
    
    // When
    const todo = new Todo({
      title,
      description,
      dueDate
    });
    
    // Then
    expect(todo.id).toBeDefined();
    expect(todo.title).toBe(title);
    expect(todo.description).toBe(description);
    expect(todo.dueDate).toBe(dueDate);
    expect(todo.status).toBe(TodoStatus.TODO);
    expect(todo.createdAt).toBeInstanceOf(Date);
    expect(todo.updatedAt).toBeInstanceOf(Date);
  });
  
  test('Todo 상태를 변경할 수 있어야 한다', () => {
    // Given
    const todo = new Todo({
      title: '테스트 할 일',
      description: '테스트 설명',
      dueDate: new Date('2025-12-31')
    });
    
    // When
    todo.status = TodoStatus.IN_PROGRESS;
    
    // Then
    expect(todo.status).toBe(TodoStatus.IN_PROGRESS);
    
    // When
    todo.status = TodoStatus.DONE;
    
    // Then
    expect(todo.status).toBe(TodoStatus.DONE);
  });
  
  test('Todo 속성을 업데이트할 수 있어야 한다', () => {
    // Given
    const todo = new Todo({
      title: '원래 제목',
      description: '원래 설명',
      dueDate: new Date('2025-12-31')
    });
    
    const updatedTitle = '수정된 제목';
    const updatedDescription = '수정된 설명';
    const updatedDueDate = new Date('2026-01-15');
    
    // When
    todo.update({
      title: updatedTitle,
      description: updatedDescription,
      dueDate: updatedDueDate,
      status: TodoStatus.IN_PROGRESS
    });
    
    // Then
    expect(todo.title).toBe(updatedTitle);
    expect(todo.description).toBe(updatedDescription);
    expect(todo.dueDate).toBe(updatedDueDate);
    expect(todo.status).toBe(TodoStatus.IN_PROGRESS);
    expect(todo.updatedAt).toBeInstanceOf(Date);
  });
  
  test('Todo 객체를 JSON으로 변환할 수 있어야 한다', () => {
    // Given
    const title = '테스트 할 일';
    const description = '테스트 설명';
    const dueDate = new Date('2025-12-31');
    const todo = new Todo({
      title,
      description,
      dueDate
    });
    
    // When
    const todoJson = todo.toJSON();
    
    // Then
    expect(todoJson).toEqual({
      id: todo.id,
      title,
      description,
      dueDate: dueDate.toISOString(),
      status: TodoStatus.TODO,
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString()
    });
  });
});
