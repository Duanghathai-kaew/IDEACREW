-- Demo seed for full profile page data.
-- Change target_user_id if needed.

with target as (
  select 'e68cc396-34e4-4a9f-aa8b-8819c07812ca'::uuid as target_user_id
)
update public.profiles p
set
  name = 'ธนากร อินทร์สุข',
  email = coalesce(nullif(p.email, ''), 'thanakorn@cstu.ac.th'),
  headline = 'Content Creator | Creative Strategy',
  status = 'พร้อมร่วมงาน',
  faculty = 'คณะเทคโนโลยีสารสนเทศ',
  major = 'สาขาเทคโนโลยีมัลติมีเดีย',
  year = 'ชั้นปีที่ 2',
  student_id = '64123456',
  phone = '091-234-5678',
  location = 'กรุงเทพฯ',
  bio = 'สนใจการสร้างคอนเทนต์เชิงสร้างสรรค์และการสื่อสารแบรนด์ผ่านสื่อดิจิทัล ชอบทำงานเป็นทีมและเรียนรู้สิ่งใหม่ๆ',
  skills = array[
    'Creative Design',
    'Video Editing',
    'Photography',
    'Content Writing',
    'Social Media',
    'Brand Story'
  ]::text[],
  interests = array[
    'Motion Design',
    'Public Speaking',
    'Podcast',
    'UX Writing'
  ]::text[]
from target t
where p.id = t.target_user_id;

with target as (
  select 'e68cc396-34e4-4a9f-aa8b-8819c07812ca'::uuid as target_user_id
)
delete from public.profile_links l
using target t
where l.user_id = t.target_user_id;

with target as (
  select 'e68cc396-34e4-4a9f-aa8b-8819c07812ca'::uuid as target_user_id
)
insert into public.profile_links (user_id, link_type, label, url, sort_order)
select t.target_user_id, v.link_type, v.label, v.url, v.sort_order
from target t
cross join (
  values
    ('portfolio', 'Behance', 'https://behance.net/thanakorn', 1),
    ('portfolio', 'Google Drive', 'https://drive.google.com/thanakorn', 2),
    ('portfolio', 'Notion', 'https://notion.so/thanakorn', 3),
    ('social', 'Facebook', 'https://facebook.com/thanakorn', 1),
    ('social', 'Instagram', 'https://instagram.com/thanakorn', 2),
    ('social', 'LinkedIn', 'https://linkedin.com/in/thanakorn', 3),
    ('social', 'TikTok', 'https://tiktok.com/@thanakorn', 4)
) as v(link_type, label, url, sort_order);

with target as (
  select 'e68cc396-34e4-4a9f-aa8b-8819c07812ca'::uuid as target_user_id
)
delete from public.profile_projects pp
using target t
where pp.user_id = t.target_user_id;

with target as (
  select 'e68cc396-34e4-4a9f-aa8b-8819c07812ca'::uuid as target_user_id
)
insert into public.profile_projects (
  user_id,
  title,
  role,
  year,
  description,
  tags,
  sort_order
)
select
  t.target_user_id,
  v.title,
  v.role,
  v.year,
  v.description,
  v.tags::text[],
  v.sort_order
from target t
cross join (
  values
    (
      'ถ่ายภาพงาน Freshy Night 2024',
      'ช่างภาพ',
      '2024',
      'ถ่ายภาพบรรยากาศงานและจัดทำอัลบั้มภาพสำหรับประชาสัมพันธ์',
      array['Photography', 'Event'],
      1
    ),
    (
      'คอนเทนต์รีลส์ Open House 2024',
      'Content Creator',
      '2024',
      'วางสคริปต์และตัดต่อวิดีโอสั้นสำหรับ TikTok/Instagram',
      array['Video', 'Social'],
      2
    )
) as v(title, role, year, description, tags, sort_order);
