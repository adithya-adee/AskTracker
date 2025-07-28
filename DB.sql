-- Users
create table users (
    id uuid primary key references auth.users (id) on delete cascade,
    username text not null,
    avatar_url text,
    created_at timestamp default now()
);

-- Posts
create table posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references users (id) on delete cascade,
  title text not null,
  description text not null,
  created_at timestamp default now(),
  location text,
  image_urls text[],
  upvotes integer default 0
);

-- Tags
create table tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

-- Post-Tag Mapping
create table post_tags (
  post_id uuid references posts (id) on delete cascade,
  tag_id uuid references tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

-- User Interests (Followed Tags)
create table user_tags (
  user_id uuid references users (id) on delete cascade,
  tag_id uuid references tags (id) on delete cascade,
  primary key (user_id, tag_id)
);

-- Bookmarks (Optional Bonus)
create table bookmarks (
  user_id uuid references users (id) on delete cascade,
  post_id uuid references posts (id) on delete cascade,
  created_at timestamp default now(),
  primary key (user_id, post_id)
);
