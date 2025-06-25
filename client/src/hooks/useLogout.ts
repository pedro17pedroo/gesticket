import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      // Force reload to login page
      window.location.href = '/';
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to login
      window.location.href = '/';
    },
  });
}