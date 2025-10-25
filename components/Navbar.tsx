'use client';

import {
  Box,
  Flex,
  Button,
  HStack,
  Text,
  useToast,
  Container,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Logout failed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Logged out successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      router.push('/login');
    }
  };

  return (
    <Box bg="white" borderBottom="1px" borderColor="gray.200" py={4}>
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold" color="brand.600">
            Twitter/X Query
          </Text>

          {user && (
            <HStack spacing={4}>
              <Text color="gray.600">{user.email}</Text>
              <Button
                variant="outline"
                colorScheme="brand"
                onClick={() => router.push('/dashboard')}
              >
                Dashboard
              </Button>
              <Button
                variant="outline"
                colorScheme="brand"
                onClick={() => router.push('/admin')}
              >
                Admin
              </Button>
              <Button colorScheme="red" onClick={handleLogout}>
                Logout
              </Button>
            </HStack>
          )}
        </Flex>
      </Container>
    </Box>
  );
}
