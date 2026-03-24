alter table public.tool_request_comments
add column if not exists parent_comment_id uuid references public.tool_request_comments (id) on delete cascade;

create index if not exists tool_request_comments_parent_comment_id_idx
on public.tool_request_comments (parent_comment_id);

drop policy if exists "Authenticated users can create request comments" on public.tool_request_comments;
create policy "Authenticated users can create request comments"
on public.tool_request_comments
for insert
to authenticated
with check (
  auth.uid() = author_id
  and exists (
    select 1
    from public.tool_requests request_post
    where request_post.id = tool_request_comments.request_id
  )
  and (
    parent_comment_id is null
    or exists (
      select 1
      from public.tool_request_comments parent_comment
      where parent_comment.id = tool_request_comments.parent_comment_id
        and parent_comment.request_id = tool_request_comments.request_id
    )
  )
);

drop policy if exists "Users can update their own request comments" on public.tool_request_comments;
create policy "Users can update their own request comments"
on public.tool_request_comments
for update
to authenticated
using (auth.uid() = author_id)
with check (
  auth.uid() = author_id
  and (
    parent_comment_id is null
    or exists (
      select 1
      from public.tool_request_comments parent_comment
      where parent_comment.id = tool_request_comments.parent_comment_id
        and parent_comment.request_id = tool_request_comments.request_id
    )
  )
);
