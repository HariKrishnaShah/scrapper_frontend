/*
  # Twitter/X Data Schema

  ## Overview
  This migration creates the complete database schema for storing and querying Twitter/X data,
  including users, tweets, hashtags, topics, and their relationships.

  ## New Tables

  ### 1. `twitter_users`
  Stores Twitter user information
  - `user_id` (text, primary key) - Twitter user ID
  - `username` (text, unique) - Twitter handle
  - `display_name` (text) - User's display name
  - `created_at` (timestamptz) - When the Twitter account was created
  - `followers_count` (integer) - Number of followers
  - `verified` (boolean) - Verification status
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `tweets`
  Stores individual tweets
  - `tweet_id` (text, primary key) - Twitter tweet ID
  - `user_id` (text, foreign key) - References twitter_users
  - `text` (text) - Tweet content
  - `created_at` (timestamptz) - When the tweet was created
  - `lang` (text) - Language code
  - `like_count` (integer) - Number of likes
  - `retweet_count` (integer) - Number of retweets
  - `reply_count` (integer) - Number of replies
  - `quote_count` (integer) - Number of quotes
  - `ingested_at` (timestamptz) - When the tweet was stored in our database

  ### 3. `hashtags`
  Stores hashtags associated with tweets
  - `id` (uuid, primary key) - Auto-generated ID
  - `tweet_id` (text, foreign key) - References tweets
  - `tag` (text) - The hashtag (without #)
  - `created_at` (timestamptz) - Timestamp

  ### 4. `topics`
  Stores search topics/queries used for ingestion
  - `topic_id` (uuid, primary key) - Auto-generated ID
  - `query` (text) - The search query used
  - `run_at` (timestamptz) - When the query was executed
  - `tweet_count` (integer) - Number of tweets fetched

  ### 5. `tweet_topics`
  Junction table linking tweets to topics
  - `id` (uuid, primary key) - Auto-generated ID
  - `topic_id` (uuid, foreign key) - References topics
  - `tweet_id` (text, foreign key) - References tweets
  - Unique constraint on (topic_id, tweet_id)

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Authenticated users can read all data
  - Only authenticated users can insert/update data
  - Separate policies for read and write operations

  ## Indexes
  - Create indexes on frequently queried columns for performance
  - Full-text search indexes on tweet text
  - Indexes on user_id, created_at, and hashtag tags
*/

-- Create twitter_users table
CREATE TABLE IF NOT EXISTS twitter_users (
  user_id text PRIMARY KEY,
  username text UNIQUE NOT NULL,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL,
  followers_count integer DEFAULT 0,
  verified boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- Create tweets table
CREATE TABLE IF NOT EXISTS tweets (
  tweet_id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES twitter_users(user_id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz NOT NULL,
  lang text,
  like_count integer DEFAULT 0,
  retweet_count integer DEFAULT 0,
  reply_count integer DEFAULT 0,
  quote_count integer DEFAULT 0,
  ingested_at timestamptz DEFAULT now()
);

-- Create hashtags table
CREATE TABLE IF NOT EXISTS hashtags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tweet_id text NOT NULL REFERENCES tweets(tweet_id) ON DELETE CASCADE,
  tag text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
  topic_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  run_at timestamptz DEFAULT now(),
  tweet_count integer DEFAULT 0
);

-- Create tweet_topics junction table
CREATE TABLE IF NOT EXISTS tweet_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES topics(topic_id) ON DELETE CASCADE,
  tweet_id text NOT NULL REFERENCES tweets(tweet_id) ON DELETE CASCADE,
  UNIQUE(topic_id, tweet_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tweets_user_id ON tweets(user_id);
CREATE INDEX IF NOT EXISTS idx_tweets_created_at ON tweets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tweets_lang ON tweets(lang);
CREATE INDEX IF NOT EXISTS idx_hashtags_tweet_id ON hashtags(tweet_id);
CREATE INDEX IF NOT EXISTS idx_hashtags_tag ON hashtags(tag);
CREATE INDEX IF NOT EXISTS idx_tweet_topics_topic_id ON tweet_topics(topic_id);
CREATE INDEX IF NOT EXISTS idx_tweet_topics_tweet_id ON tweet_topics(tweet_id);

-- Create full-text search index on tweet text
CREATE INDEX IF NOT EXISTS idx_tweets_text_search ON tweets USING gin(to_tsvector('english', text));

-- Enable Row Level Security
ALTER TABLE twitter_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweet_topics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for twitter_users
CREATE POLICY "Anyone can view twitter users"
  ON twitter_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert twitter users"
  ON twitter_users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update twitter users"
  ON twitter_users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for tweets
CREATE POLICY "Anyone can view tweets"
  ON tweets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert tweets"
  ON tweets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tweets"
  ON tweets FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for hashtags
CREATE POLICY "Anyone can view hashtags"
  ON hashtags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert hashtags"
  ON hashtags FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for topics
CREATE POLICY "Anyone can view topics"
  ON topics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert topics"
  ON topics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update topics"
  ON topics FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for tweet_topics
CREATE POLICY "Anyone can view tweet_topics"
  ON tweet_topics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert tweet_topics"
  ON tweet_topics FOR INSERT
  TO authenticated
  WITH CHECK (true);