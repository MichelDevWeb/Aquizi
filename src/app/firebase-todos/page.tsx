'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/firebase-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createDocument, updateDocument, deleteDocument } from '@/lib/firestore/firestore-utils';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firestore/firestore-config';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  userId: string;
  createdAt: any;
}

const FirebaseTodosPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user && !loading) {
      router.push('/firebase-auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    // Set up real-time listener for todos
    const q = query(
      collection(db, 'todos'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const todosList: Todo[] = [];
      querySnapshot.forEach((doc) => {
        todosList.push({ id: doc.id, ...doc.data() } as Todo);
      });
      setTodos(todosList);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching todos:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim() || !user) return;

    try {
      await createDocument<Omit<Todo, 'id'>>('todos', {
        text: newTodo,
        completed: false,
        userId: user.uid,
        createdAt: new Date()
      });
      setNewTodo('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    try {
      await updateDocument<Partial<Todo>>('todos', todo.id, {
        completed: !todo.completed
      });
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteDocument('todos', id);
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col flex-1 p-8">
      <h1 className="text-3xl font-bold mb-6">Firebase Todos</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Todo</CardTitle>
          <CardDescription>Create a new todo item</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddTodo} className="flex gap-2">
            <Input
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Enter a new todo..."
              className="flex-1"
            />
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Todos</CardTitle>
          <CardDescription>Manage your todo items</CardDescription>
        </CardHeader>
        <CardContent>
          {todos.length === 0 ? (
            <p>No todos yet. Add one above!</p>
          ) : (
            <ul className="space-y-2">
              {todos.map((todo) => (
                <li key={todo.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleTodo(todo)}
                      className="w-4 h-4"
                    />
                    <span className={todo.completed ? 'line-through text-gray-500' : ''}>
                      {todo.text}
                    </span>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDeleteTodo(todo.id)}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FirebaseTodosPage; 