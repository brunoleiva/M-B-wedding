insert into public.weddings (
  id, slug, first_name, second_name, event_at, timezone, city, hero_title, hero_subtitle, hero_image_path, is_published
) values (
  '11111111-1111-4111-8111-111111111111',
  'm-b-wedding',
  'Maysa',
  'Bruno',
  '2027-12-17 16:00:00-03',
  'America/Sao_Paulo',
  'São Paulo',
  'Maysa & Bruno',
  'Estamos contando os dias para celebrar esse momento com vocês.',
  '/images/hero-placeholder.svg',
  true
) on conflict (id) do nothing;

insert into public.site_sections (wedding_id, key, label, is_enabled, sort_order) values
('11111111-1111-4111-8111-111111111111', 'story', 'Nossa história', true, 10),
('11111111-1111-4111-8111-111111111111', 'gallery', 'Fotos', true, 20),
('11111111-1111-4111-8111-111111111111', 'wedding', 'O casamento', true, 30),
('11111111-1111-4111-8111-111111111111', 'gifts', 'Presentes', true, 40),
('11111111-1111-4111-8111-111111111111', 'rsvp', 'RSVP', true, 50),
('11111111-1111-4111-8111-111111111111', 'messages', 'Recados', true, 60),
('11111111-1111-4111-8111-111111111111', 'faq', 'FAQ', true, 70)
on conflict (wedding_id, key) do nothing;

insert into public.story_events (wedding_id, year_label, title, description, sort_order) values
('11111111-1111-4111-8111-111111111111', '2019', 'Nos conhecemos', 'Uma conversa despretensiosa virou o começo da nossa história favorita.', 10),
('11111111-1111-4111-8111-111111111111', '2023', 'Nossa grande viagem', 'Descobrimos novos lugares e a certeza de que queríamos continuar lado a lado.', 20),
('11111111-1111-4111-8111-111111111111', '2026', 'O pedido', 'Um sim cheio de emoção, planos e gente querida torcendo por nós.', 30),
('11111111-1111-4111-8111-111111111111', '2027', 'O casamento', 'O capítulo que queremos escrever cercados pelas pessoas que fazem parte de nós.', 40);

insert into public.venues (wedding_id, kind, name, starts_at, address, description) values
('11111111-1111-4111-8111-111111111111', 'both', 'Local a definir', '2027-12-17 16:00:00-03', '', 'Em breve compartilharemos os detalhes do local.');

insert into public.schedule_events (wedding_id, starts_at, title, sort_order) values
('11111111-1111-4111-8111-111111111111', '2027-12-17 15:30:00-03', 'Chegada dos convidados', 10),
('11111111-1111-4111-8111-111111111111', '2027-12-17 16:00:00-03', 'Cerimônia', 20),
('11111111-1111-4111-8111-111111111111', '2027-12-17 17:30:00-03', 'Coquetel', 30),
('11111111-1111-4111-8111-111111111111', '2027-12-17 18:30:00-03', 'Jantar', 40),
('11111111-1111-4111-8111-111111111111', '2027-12-17 20:00:00-03', 'Festa', 50);

insert into public.gift_categories (id, wedding_id, name, slug, sort_order) values
('21111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'Lua de mel', 'lua-de-mel', 10)
on conflict (id) do nothing;

insert into public.gifts (wedding_id, category_id, slug, title, description, amount_cents, is_featured, sort_order) values
('11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-111111111111', 'cafe-da-manha', 'Café da manhã dos recém-casados', 'Um começo de dia caprichado na lua de mel.', 5000, false, 10),
('11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-111111111111', 'jantar-romantico', 'Jantar romântico', 'Uma noite especial para guardar na memória.', 15000, true, 20),
('11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-111111111111', 'passeio-especial', 'Passeio especial', 'Uma experiência nova durante a viagem.', 25000, false, 30),
('11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-111111111111', 'diaria-lua-de-mel', 'Uma diária da lua de mel', 'Ajude a deixar a viagem ainda mais inesquecível.', 70000, true, 40);

insert into public.guest_groups (id, wedding_id, display_name, max_extra_guests) values
('31111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'Família Silva', 1);

insert into public.guests (wedding_id, guest_group_id, full_name, kind, rsvp_status) values
('11111111-1111-4111-8111-111111111111', '31111111-1111-4111-8111-111111111111', 'João Silva', 'adult', 'pending'),
('11111111-1111-4111-8111-111111111111', '31111111-1111-4111-8111-111111111111', 'Maria Silva', 'adult', 'attending'),
('11111111-1111-4111-8111-111111111111', '31111111-1111-4111-8111-111111111111', 'Pedro Silva', 'child', 'pending');

insert into public.faqs (wedding_id, question, answer, sort_order) values
('11111111-1111-4111-8111-111111111111', 'Que horas devo chegar?', 'Sugerimos chegar com 30 minutos de antecedência.', 10),
('11111111-1111-4111-8111-111111111111', 'Qual é o traje?', 'Traje social. Pedimos apenas que evitem branco e off-white.', 20),
('11111111-1111-4111-8111-111111111111', 'Existe estacionamento?', 'Os detalhes de estacionamento serão publicados na seção de informações.', 30);

insert into public.guest_messages (wedding_id, guest_name, message, status) values
('11111111-1111-4111-8111-111111111111', 'Ana', 'Que alegria celebrar esse momento com vocês!', 'approved'),
('11111111-1111-4111-8111-111111111111', 'Carlos', 'Que venha um dia inesquecível!', 'pending');

insert into public.song_suggestions (wedding_id, song, artist, suggested_by, status) values
('11111111-1111-4111-8111-111111111111', 'September', 'Earth, Wind & Fire', 'Marina', 'approved'),
('11111111-1111-4111-8111-111111111111', 'Signed, Sealed, Delivered', 'Stevie Wonder', 'Paulo', 'pending');
