'use client';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Select,
  Card,
  CardBody,
  Heading,
} from '@chakra-ui/react';
import { useState } from 'react';

interface SearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  loading?: boolean;
}

export interface SearchFilters {
  textContains: string;
  hashtag: string;
  username: string;
  dateFrom: string;
  dateTo: string;
  language: string;
}

export default function SearchForm({ onSearch, loading = false }: SearchFormProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    textContains: '',
    hashtag: '',
    username: '',
    dateFrom: '',
    dateTo: '',
    language: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      textContains: '',
      hashtag: '',
      username: '',
      dateFrom: '',
      dateTo: '',
      language: '',
    };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <Heading size="md" color="brand.600">
              Search Twitter/X Data
            </Heading>

            <FormControl>
              <FormLabel>Text Contains</FormLabel>
              <Input
                placeholder="Search tweet content..."
                value={filters.textContains}
                onChange={(e) => setFilters({ ...filters, textContains: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Hashtag</FormLabel>
              <Input
                placeholder="Enter hashtag (without #)"
                value={filters.hashtag}
                onChange={(e) => setFilters({ ...filters, hashtag: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Username</FormLabel>
              <Input
                placeholder="Enter Twitter username"
                value={filters.username}
                onChange={(e) => setFilters({ ...filters, username: e.target.value })}
              />
            </FormControl>

            <HStack spacing={4}>
              <FormControl>
                <FormLabel>From Date</FormLabel>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>To Date</FormLabel>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                />
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>Language</FormLabel>
              <Select
                placeholder="All languages"
                value={filters.language}
                onChange={(e) => setFilters({ ...filters, language: e.target.value })}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="zh">Chinese</option>
                <option value="ar">Arabic</option>
                <option value="hi">Hindi</option>
                <option value="ru">Russian</option>
              </Select>
            </FormControl>

            <HStack spacing={4}>
              <Button
                type="submit"
                colorScheme="brand"
                size="lg"
                flex={1}
                isLoading={loading}
              >
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleReset}
              >
                Reset
              </Button>
            </HStack>
          </VStack>
        </form>
      </CardBody>
    </Card>
  );
}
