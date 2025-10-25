'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Link as ChakraLink,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'Login failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Welcome back!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push('/dashboard');
    }

    setLoading(false);
  };

  return (
    <Box minH="100vh" bg="gray.50" py={20}>
      <Container maxW="md">
        <Card>
          <CardBody>
            <VStack spacing={8} align="stretch">
              <VStack spacing={2}>
                <Heading size="xl" color="brand.600">
                  Twitter/X Query System
                </Heading>
                <Text color="gray.600">Sign in to your account</Text>
              </VStack>

              <form onSubmit={handleLogin}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      size="lg"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Password</FormLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      size="lg"
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    width="full"
                    isLoading={loading}
                  >
                    Sign In
                  </Button>

                  <Text color="gray.600">
                    Don&apos;t have an account?{' '}
                    <ChakraLink as={Link} href="/signup" color="brand.600" fontWeight="semibold">
                      Sign up
                    </ChakraLink>
                  </Text>
                </VStack>
              </form>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
}
