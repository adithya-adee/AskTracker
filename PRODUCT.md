# VoteHub - Reddit-Style Mobile App

## Overview

VoteHub is a community-driven mobile application inspired by Reddit. It allows users to sign in using Google, view global and personalized content feeds, and create posts with tags, text, and images. The personalized feed adapts based on user-selected interests and behavior.

## Features

### Core Features

- **Google Authentication** using Supabase Auth
- **Global Feed**: Chronologically ordered posts from all users
- **Personalized Feed**: Posts matched to user’s followed tags
- **Create Post**: Title, Description, Tags, Author, Timestamp, Optional Location and Images

### Bonus Features

- **Upvote / Bookmark Support**
- **Supabase Storage for Image Uploads**
- **Strong typing via TypeScript**
- **Modular folder structure**

## Entities & Relationships

- `users`: Registered users with basic profile data
- `posts`: User-created content
- `tags`: Free-form tags used in posts
- `user_tags`: Many-to-many relationship between users and tags (interests)
- `post_tags`: Many-to-many between posts and tags

## Feed Logic

- **Global Feed**: All posts sorted by `created_at`
- **Personalized Feed**: Based on `user_tags` → fetch all posts tagged with any followed tag

## Tech Stack

- **Frontend**: React Native (Expo)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: Zustand (optional)
- **Icons/Components**: Lucide / ShadCN (optional)

## Architecture Tradeoffs

- **Supabase RLS** for securing per-user data
- **Simple personalization** via user-tag matching due to 2-day constraint
- **No communities** to reduce complexity
- **Pre-seeded dummy posts** to populate feed initially
