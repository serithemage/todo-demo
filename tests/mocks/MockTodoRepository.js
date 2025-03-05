/**
 * TodoRepository의 모의(Mock) 구현체
 */
import { TodoRepository } from '../../src/usecases/repositories/TodoRepository.js';

export class MockTodoRepository extends TodoRepository {
  constructor() {
    super();
    this.todos = [];
  }
  
  async getById(id) {
    return this.todos.find(todo => todo.id === id) || null;
  }
  
  async getAll() {
    return [...this.todos];
  }
  
  async getByStatus(status) {
    return this.todos.filter(todo => todo.status === status);
  }
  
  async save(todo) {
    const index = this.todos.findIndex(t => t.id === todo.id);
    if (index >= 0) {
      this.todos[index] = todo;
    } else {
      this.todos.push(todo);
    }
    return todo;
  }
  
  async delete(id) {
    const index = this.todos.findIndex(todo => todo.id === id);
    if (index >= 0) {
      this.todos.splice(index, 1);
      return true;
    }
    return false;
  }
  
  async search(query) {
    if (!query) return [...this.todos];
    
    const lowerQuery = query.toLowerCase();
    return this.todos.filter(todo => 
      (todo.title && todo.title.toLowerCase().includes(lowerQuery)) || 
      (todo.description && todo.description.toLowerCase().includes(lowerQuery))
    );
  }
}
