'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  VStack,
  Card,
  CardBody,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  HStack,
  Textarea,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface Topic {
  topic_id: string;
  query: string;
  run_at: string;
  tweet_count: number;
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [sampleData, setSampleData] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadTopics();
    }
  }, [user, authLoading, router]);

  const loadTopics = async () => {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('run_at', { ascending: false })
      .limit(10);

    if (error) {
      toast({
        title: 'Failed to load topics',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else {
      setTopics(data || []);
    }
  };

  const handleIngestSampleData = async () => {
    if (!sampleData.trim()) {
      toast({
        title: 'No data provided',
        description: 'Please enter sample data in JSON format',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const tweets = JSON.parse(sampleData);

      if (!Array.isArray(tweets)) {
        throw new Error('Data must be an array of tweets');
      }

      const topicResult = await supabase
        .from('topics')
        .insert({
          query: query || 'Manual Import',
          tweet_count: tweets.length,
        })
        .select()
        .single();

      if (topicResult.error) throw topicResult.error;

      for (const tweet of tweets) {
        const userResult = await supabase
          .from('twitter_users')
          .upsert({
            user_id: tweet.user_id,
            username: tweet.username,
            display_name: tweet.display_name,
            created_at: tweet.user_created_at || new Date().toISOString(),
            followers_count: tweet.followers_count || 0,
            verified: tweet.verified || false,
          }, { onConflict: 'user_id' })
          .select()
          .single();

        if (userResult.error && userResult.error.code !== '23505') {
          console.error('User insert error:', userResult.error);
          continue;
        }

        const tweetResult = await supabase
          .from('tweets')
          .upsert({
            tweet_id: tweet.tweet_id,
            user_id: tweet.user_id,
            text: tweet.text,
            created_at: tweet.created_at,
            lang: tweet.lang || 'en',
            like_count: tweet.like_count || 0,
            retweet_count: tweet.retweet_count || 0,
            reply_count: tweet.reply_count || 0,
            quote_count: tweet.quote_count || 0,
          }, { onConflict: 'tweet_id' })
          .select()
          .single();

        if (tweetResult.error && tweetResult.error.code !== '23505') {
          console.error('Tweet insert error:', tweetResult.error);
          continue;
        }

        if (tweet.hashtags && Array.isArray(tweet.hashtags)) {
          for (const tag of tweet.hashtags) {
            await supabase.from('hashtags').insert({
              tweet_id: tweet.tweet_id,
              tag: tag.replace('#', ''),
            });
          }
        }

        await supabase.from('tweet_topics').insert({
          topic_id: topicResult.data.topic_id,
          tweet_id: tweet.tweet_id,
        });
      }

      toast({
        title: 'Data ingested successfully',
        description: `${tweets.length} tweets have been imported`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setSampleData('');
      setQuery('');
      loadTopics();
    } catch (error: any) {
      toast({
        title: 'Ingestion failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    const sample = [
      {
        tweet_id: `${Date.now()}_1`,
        user_id: 'user_1',
        username: 'techguru',
        display_name: 'Tech Guru',
        text: 'Just deployed my new web app using Next.js and Supabase! The developer experience is amazing. #webdev #nextjs #supabase',
        created_at: new Date().toISOString(),
        lang: 'en',
        like_count: 245,
        retweet_count: 58,
        reply_count: 32,
        quote_count: 12,
        followers_count: 15000,
        verified: true,
        hashtags: ['webdev', 'nextjs', 'supabase']
      },
      {
        tweet_id: `${Date.now()}_2`,
        user_id: 'user_2',
        username: 'datascientist',
        display_name: 'Data Scientist',
        text: 'Machine learning models are getting more accurate every day. The future of AI is incredibly exciting! #AI #MachineLearning #DataScience',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        lang: 'en',
        like_count: 512,
        retweet_count: 123,
        reply_count: 67,
        quote_count: 45,
        followers_count: 28000,
        verified: true,
        hashtags: ['AI', 'MachineLearning', 'DataScience']
      },
      {
        tweet_id: `${Date.now()}_3`,
        user_id: 'user_3',
        username: 'codewizard',
        display_name: 'Code Wizard',
        text: 'TypeScript + React is such a powerful combination. Strong typing catches so many bugs before runtime! #TypeScript #React #JavaScript',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        lang: 'en',
        like_count: 189,
        retweet_count: 42,
        reply_count: 18,
        quote_count: 8,
        followers_count: 8500,
        verified: false,
        hashtags: ['TypeScript', 'React', 'JavaScript']
      }
    ];
    setSampleData(JSON.stringify(sample, null, 2));
  };

  if (authLoading) {
    return null;
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Card>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading size="md" color="brand.600">
                  Ingest Tweet Data
                </Heading>

                <FormControl>
                  <FormLabel>Query/Topic Name</FormLabel>
                  <Input
                    placeholder="e.g., AI trends, Web development, etc."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Sample Data (JSON Array)</FormLabel>
                  <Textarea
                    placeholder='[{"tweet_id": "123", "user_id": "456", "username": "example", ...}]'
                    value={sampleData}
                    onChange={(e) => setSampleData(e.target.value)}
                    rows={12}
                    fontFamily="monospace"
                    fontSize="sm"
                  />
                </FormControl>

                <HStack spacing={4}>
                  <Button
                    colorScheme="brand"
                    onClick={handleIngestSampleData}
                    isLoading={loading}
                    flex={1}
                  >
                    Ingest Data
                  </Button>
                  <Button
                    variant="outline"
                    onClick={generateSampleData}
                  >
                    Generate Sample
                  </Button>
                </HStack>

                <Box p={4} bg="blue.50" borderRadius="md">
                  <Text fontSize="sm" color="gray.700">
                    <strong>Note:</strong> In a production environment, this would connect to the Twitter/X API
                    to fetch real tweets. For now, you can use the sample data generator or provide your own JSON data.
                  </Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="brand.600">
                  Recent Ingestion Topics
                </Heading>

                {topics.length === 0 ? (
                  <Text color="gray.600" textAlign="center" py={8}>
                    No topics yet. Start by ingesting some data above.
                  </Text>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Query</Th>
                        <Th>Run Date</Th>
                        <Th isNumeric>Tweets</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {topics.map((topic) => (
                        <Tr key={topic.topic_id}>
                          <Td>
                            <Badge colorScheme="brand" fontSize="sm" px={3} py={1}>
                              {topic.query}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontSize="sm">
                              {format(new Date(topic.run_at), 'MMM d, yyyy h:mm a')}
                            </Text>
                          </Td>
                          <Td isNumeric>
                            <Text fontWeight="semibold">{topic.tweet_count}</Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}
