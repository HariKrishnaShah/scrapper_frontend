'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Center, Spinner } from '@chakra-ui/react';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <Box minH="100vh" bg="gray.50">
      <Center h="100vh">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Center>
    </Box>
  );
}
