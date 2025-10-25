'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import SearchForm, { SearchFilters } from '@/components/SearchForm';
import TweetsTable, { Tweet } from '@/components/TweetsTable';
import { supabase } from '@/lib/supabase';

const ITEMS_PER_PAGE = 20;

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const searchTweets = async (filters: SearchFilters, pageNum: number = 1) => {
    setLoading(true);
    setCurrentFilters(filters);
    setPage(pageNum);

    try {
      let query = supabase
        .from('tweets')
        .select(`
          *,
          twitter_users (
            username,
            display_name,
            verified
          ),
          hashtags (
            tag
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((pageNum - 1) * ITEMS_PER_PAGE, pageNum * ITEMS_PER_PAGE - 1);

      if (filters.textContains) {
        query = query.ilike('text', `%${filters.textContains}%`);
      }

      if (filters.username) {
        const { data: users } = await supabase
          .from('twitter_users')
          .select('user_id')
          .ilike('username', `%${filters.username}%`);

        if (users && users.length > 0) {
          const userIds = users.map(u => u.user_id);
          query = query.in('user_id', userIds);
        } else {
          setTweets([]);
          setHasMore(false);
          setLoading(false);
          return;
        }
      }

      if (filters.hashtag) {
        const { data: hashtagData } = await supabase
          .from('hashtags')
          .select('tweet_id')
          .ilike('tag', `%${filters.hashtag}%`);

        if (hashtagData && hashtagData.length > 0) {
          const tweetIds = hashtagData.map(h => h.tweet_id);
          query = query.in('tweet_id', tweetIds);
        } else {
          setTweets([]);
          setHasMore(false);
          setLoading(false);
          return;
        }
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', new Date(filters.dateFrom).toISOString());
      }

      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDate.toISOString());
      }

      if (filters.language) {
        query = query.eq('lang', filters.language);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      setTweets(data || []);
      setHasMore(count ? count > pageNum * ITEMS_PER_PAGE : false);
    } catch (error: any) {
      toast({
        title: 'Search failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setTweets([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (currentFilters) {
      searchTweets(currentFilters, newPage);
    }
  };

  if (authLoading) {
    return null;
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <SearchForm onSearch={(filters) => searchTweets(filters, 1)} loading={loading} />
          <TweetsTable
            tweets={tweets}
            loading={loading}
            page={page}
            onPageChange={handlePageChange}
            hasMore={hasMore}
          />
        </VStack>
      </Container>
    </Box>
  );
}
