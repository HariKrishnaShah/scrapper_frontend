'use client';

import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardBody,
  Text,
  Badge,
  HStack,
  VStack,
  Button,
  Heading,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { format } from 'date-fns';

export interface Tweet {
  tweet_id: string;
  text: string;
  created_at: string;
  lang: string;
  like_count: number;
  retweet_count: number;
  reply_count: number;
  quote_count: number;
  twitter_users: {
    username: string;
    display_name: string;
    verified: boolean;
  };
  hashtags: Array<{ tag: string }>;
}

interface TweetsTableProps {
  tweets: Tweet[];
  loading?: boolean;
  page: number;
  onPageChange: (page: number) => void;
  hasMore: boolean;
}

export default function TweetsTable({
  tweets,
  loading = false,
  page,
  onPageChange,
  hasMore,
}: TweetsTableProps) {
  if (loading) {
    return (
      <Card>
        <CardBody>
          <Center py={20}>
            <VStack spacing={4}>
              <Spinner size="xl" color="brand.500" thickness="4px" />
              <Text color="gray.600">Loading tweets...</Text>
            </VStack>
          </Center>
        </CardBody>
      </Card>
    );
  }

  if (tweets.length === 0) {
    return (
      <Card>
        <CardBody>
          <Center py={20}>
            <VStack spacing={2}>
              <Heading size="md" color="gray.600">
                No tweets found
              </Heading>
              <Text color="gray.500">
                Try adjusting your search filters
              </Text>
            </VStack>
          </Center>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <Heading size="md" color="brand.600">
            Search Results ({tweets.length} tweets)
          </Heading>

          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>User</Th>
                  <Th>Tweet</Th>
                  <Th>Hashtags</Th>
                  <Th>Date</Th>
                  <Th>Lang</Th>
                  <Th isNumeric>Engagement</Th>
                </Tr>
              </Thead>
              <Tbody>
                {tweets.map((tweet) => (
                  <Tr key={tweet.tweet_id}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Text fontWeight="semibold">
                            {tweet.twitter_users.display_name}
                          </Text>
                          {tweet.twitter_users.verified && (
                            <Badge colorScheme="blue">Verified</Badge>
                          )}
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          @{tweet.twitter_users.username}
                        </Text>
                      </VStack>
                    </Td>
                    <Td maxW="400px">
                      <Text noOfLines={3}>{tweet.text}</Text>
                    </Td>
                    <Td>
                      <HStack spacing={2} flexWrap="wrap">
                        {tweet.hashtags.slice(0, 3).map((hashtag, idx) => (
                          <Badge key={idx} colorScheme="brand" fontSize="xs">
                            #{hashtag.tag}
                          </Badge>
                        ))}
                        {tweet.hashtags.length > 3 && (
                          <Badge fontSize="xs">+{tweet.hashtags.length - 3}</Badge>
                        )}
                      </HStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {format(new Date(tweet.created_at), 'MMM d, yyyy')}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {format(new Date(tweet.created_at), 'h:mm a')}
                      </Text>
                    </Td>
                    <Td>
                      <Badge>{tweet.lang?.toUpperCase()}</Badge>
                    </Td>
                    <Td isNumeric>
                      <VStack align="end" spacing={1}>
                        <Text fontSize="sm">❤️ {tweet.like_count}</Text>
                        <Text fontSize="sm">🔄 {tweet.retweet_count}</Text>
                        <Text fontSize="sm">💬 {tweet.reply_count}</Text>
                      </VStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          <HStack justify="space-between">
            <Button
              onClick={() => onPageChange(page - 1)}
              isDisabled={page === 1}
              variant="outline"
            >
              Previous
            </Button>
            <Text color="gray.600">Page {page}</Text>
            <Button
              onClick={() => onPageChange(page + 1)}
              isDisabled={!hasMore}
              variant="outline"
            >
              Next
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
}
