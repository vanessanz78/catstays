# Deloraine Cattery Source Indexing Brief

Source URL: https://delorainecattery.com/
Captured for: CatStayys imported-site preview intelligence
Captured date: 2026-06-27
Source status: Original website and user-provided screenshots are the reference for indexing, metatagging, cataloging, template planning, chatbot answers, and UAT.

## Purpose

This document is the durable source brief for how Deloraine Cattery should be indexed and transformed into CatStayys templates. It is not a visual template spec. The selected template is a flexible visual guide, while this source index preserves the intent, hierarchy, content relationships, media relationships, buttons, forms, FAQs, reviews, and chatbot knowledge that must survive the redesign.

The key problem to avoid is a preview that is technically filled but editorially repetitive. The generated site must not keep repeating the same phrase, same image, or same sentiment across hero, about, facilities, rooms, footer, and care sections. It should first understand the source site, then plan the new page.

## Source Evidence Reviewed

Original website screenshots supplied by Vanessa on 2026-06-27 cover these source areas:

- Home hero and navigation
- Choose Deloraine Cattery / care promise
- Facilities and premium accommodation features
- Rooms: Private Rooms, Indoor Rooms, Communal Room
- Gallery: Happy Cats at Deloraine, 23-image carousel
- Services and additional services
- About Deloraine Cattery, Paul and Vanessa Wilson, owner story, commitment
- Location, map, directions, visual landmarks, GPS link
- Reviews and testimonials
- FAQs
- Contact details, online booking prompt, and enquiry form
- Footer, quick links, contact info, social links, virtual tour

The screenshot image files themselves were not committed here because they are bulky local artifacts. The live source URL and this structured source index are the durable GitHub reference.

## Indexing Model

Every crawl should create four linked records: page, section, media asset, and interaction.

### Page Record

Required fields:

- `source_url`
- `page_path`
- `page_title`
- `nav_label`
- `primary_intent`
- `secondary_intents`
- `source_priority`
- `crawl_timestamp`
- `raw_text_hash`
- `visible_text`
- `chatbot_indexable`

### Section Record

Required fields:

- `source_url`
- `page_path`
- `section_anchor`
- `source_heading`
- `source_subheading`
- `source_body`
- `source_items`
- `section_intent`
- `semantic_category`
- `audience_question_answered`
- `recommended_template_roles`
- `associated_media_ids`
- `associated_cta_ids`
- `dedupe_cluster_id`
- `importance_score`
- `chatbot_indexable`
- `display_indexable`

### Media Asset Record

Required fields:

- `asset_url`
- `source_url`
- `source_page_path`
- `nearby_heading`
- `nearby_text`
- `alt_text`
- `caption`
- `visual_category`
- `semantic_category`
- `associated_section_id`
- `associated_entity`
- `contains_text`
- `is_logo`
- `is_map_or_directional`
- `is_virtual_tour`
- `is_owner_photo`
- `is_room_photo`
- `is_gallery_photo`
- `is_facility_photo`
- `do_not_use_as_hero`
- `hero_candidate_score`
- `display_priority`
- `image_fingerprint`
- `near_duplicate_group_id`
- `allowed_template_roles`
- `disallowed_template_roles`

### Interaction Record

Required fields:

- `source_url`
- `page_path`
- `interaction_type`
- `label`
- `destination`
- `intent`
- `required_fields`
- `template_role`
- `chatbot_actionability`

Interaction types include navigation links, buttons, booking links, external links, social links, virtual tour embeds, maps, form fields, dropdowns, date inputs, and chatbot entry points.

## Source Content Inventory

### Global Header

Category: navigation, brand identity

Content:

- Logo mark: black cat silhouette
- Brand: Deloraine Cattery
- Navigation: Home, Book Now, Facilities, Services, FAQs, Contact

Intent:

- Establish business identity and primary pathways.
- Preserve booking access throughout the redesigned template.

Template guidance:

- Keep clear primary booking CTA.
- Do not treat logo as general media or hero image.
- Logo is brand asset only.

### Home Hero

Category: hero, brand promise, booking CTA

Source content:

- Heading: Deloraine Cattery
- Subheading: Your cats home away from home
- Primary buttons: View Our Services, Book Now
- Image: exterior Deloraine Cattery building at dusk/evening

Intent:

- Immediate identity, emotional reassurance, and booking/service exploration.
- Exterior image establishes real place and trust.

Template guidance:

- Use the exterior dusk building as a high-confidence hero/facility image if it is not text-heavy.
- Do not repeat the same hero promise verbatim in About, Why Choose, footer, and facilities.
- The hero can say one concise promise; later sections should add new information.

### Choose Deloraine Cattery

Category: trust, reasons to choose, facility proof

Source content:

- Heading: Choose Deloraine Cattery
- Body: purpose-built cat boarding facility designed with cats in mind; care and planning; security and comfort amenities; peaceful rural setting
- Feature cards:
  - 5-Star Facility: purpose-built cat boarding facility, finest accommodation and care at affordable prices
  - Safe & Secure: double door systems, amplimesh security screens, alarms, raised concrete floors, insulated heated building
  - On-Site Care: animal-loving people live on site, welcoming short and long term stays in peaceful rural setting

Intent:

- Explain why this business is trustworthy.
- Communicate safety, purpose-built design, and human presence.

Template guidance:

- Use this content once as trust proof, not repeatedly as hero/about/facilities text.
- If template has both `whyChoose` and `facilities`, split the ideas:
  - `whyChoose`: human trust, on-site care, peace of mind
  - `facilities`: physical building, security, climate, routines

### Facilities

Category: facilities, accommodation infrastructure, daily care

Source content:

- Heading: Our Facilities
- Body: state-of-the-art boarding facilities designed for comfort, safety, and well-being; stress-free environment
- Premium accommodations:
  - Security Features: double door systems, amplimesh screens, alarms, secure doors/windows/outdoor areas
  - Climate Controlled: insulated building, heated during winter months, raised concrete floors for hygiene
  - Alarm Systems: alarms in and around the facility for safety and security
  - Daily Care Routine: clean rooms each morning; wipe surfaces; change litter trays and food dishes; sweep/mop all areas; secure hallway walks for social interaction; twice daily feeding; medicine administration available at additional charge
- Image association: kittens/cats inside accommodation; facility room photos

Intent:

- Demonstrate operational quality and safety.
- Explain the concrete features behind the care promise.

Template guidance:

- Facilities section should use facility-specific copy, not generic hero/about copy.
- Facility imagery should include rooms, exterior, secure mesh, or cats in accommodation.
- Text should be compressed for top-level design, but full details must remain indexed for chatbot and possibly accordions.

### Rooms

Category: rooms, accommodation products, pricing

Source content:

- Heading: Our Rooms
- Body: range of boarding options designed to provide comfort, safety, and care

Room: Private Rooms

- Price: $20.00 (1 cat), $36 (2 cats), $54 (3 cats), per day; GST additional if applicable
- Description: private rooms with indoor living area and 24-hour access to fully secure private verandah, suitable for up to three cats from the same family
- Features: indoor living area; 24-hour access to secure verandah; climbing frames and chairs; bird watching opportunities; daily room cleaning; twice daily feeding
- CTA: Book This Service
- Image association: cats in secure room/verandah area

Room: Indoor Rooms

- Price: $20.00 (1 cat), $36 (2 cats), per day; GST additional if applicable
- Description: indoor-only rooms suitable for up to two cats from the same family, with window views and option for communal room access
- Features: indoor accommodation; window views; secure environment; optional communal room access; daily cleaning; medicine administration available
- CTA: Book This Service
- Image association: cats on cat tree/inside room

Room: Communal Room

- Price: $20.00 (1 cat), $36 (2 cats), per day; GST additional if applicable
- Description: large communal room for multiple cats to share indoor and outdoor areas together on neutral territory
- Features: shared indoor and outdoor areas; social interaction with other cats; secure observation period; neutral territory environment; move to private room if needed
- CTA: Book This Service
- Image association: cats in communal indoor/outdoor room

Intent:

- Sell concrete accommodation options with pricing and features.
- Help customers choose appropriate room type.

Template guidance:

- Preserve all room types, prices, and key differentiators.
- Use each room's associated image, not the same facility exterior repeatedly.
- If the visual template only has three cards, map exactly to Private, Indoor, and Communal.
- Do not invent room types or generic suite copy when real room data exists.

### Gallery

Category: gallery, social proof, atmosphere, media pool

Source content:

- Heading: Happy Cats at Deloraine
- Body: See our beautiful facilities and the cats who love staying with us
- Carousel contains 23 photos
- Example caption: Gorgeous Tortoiseshell Guest
- Visible thumbnails include multiple cats, guest cats, cats in rooms, cats with people, accommodation/window/mesh images

Intent:

- Show real guest cats, warmth, trust, and facility variety.
- Provide a large image pool for the template.

Template guidance:

- The crawler must extract all gallery images, not just the first selected carousel image.
- Gallery images should be saved with carousel index, caption if visible, thumbnail/full image URL, and visual category.
- Gallery images can support other sections only when their context matches, but the gallery itself should retain a wide selection.
- Reuse controls must prevent the same gallery image appearing repeatedly in hero, about, facilities, rooms, and gallery.

### Services

Category: add-on services, pricing, care operations

Source content:

Additional Services heading:

- Body: comprehensive range of additional services to ensure each cat receives specialized care during their stay

Service cards:

- Daily Brush Service: $2 per day; recommended for long-haired cats prone to matting; done in evenings when cats are relaxed; features include professional grooming, prevents matting, evening service, reduces stress
- Medicine Administration: $2 per day; Vanessa trained as a pharmacy technician; injections, oral medications, tablets, topical treatments; insulin injections, oral medications, topical treatments, professional care
- Electric Blanket Setup: $10 surcharge; comfort for mature cats with electrical appliances; equipment must be tested and tagged; comfort for senior cats, safety tested equipment, temperature control, extra warmth
- Pickup & Drop-off Service: $35 one way / $50 round trip; within 10km radius; free service for senior citizens over 65 without transport; 10km radius, your cage or ours, senior citizen discount, convenient scheduling
- Airport Service: $50 per trip; pickup/dropoff to Onerahi Airport; for relocating families; Onerahi Airport service, flight schedule coordination, advance booking, travel convenience
- Flea & Worm Treatment: $100 per treatment; only when necessary for comfort; professional treatment, health monitoring, comfort focused, veterinary grade products
- Out of Hours Service: $35 surcharge; flexible pickup/dropoff outside regular hours by mutual agreement; flexible timing, by appointment, convenience fee, mutual agreement required
- Veterinary Transport: $35 surcharge; transport to and from veterinary clinic if medical attention is required; emergency transport, professional care, clinic coordination, health priority
- Professional Grooming: contact for pricing; partnership with Fancy Felines Cat Grooming for medical-grade matting removal without sedation; medical grade grooming, no sedation, specialist partnership, professional care

Intent:

- Preserve upsell and operational service details.
- Help chatbot answer pricing and service questions accurately.

Template guidance:

- Services must not be collapsed into generic `Cat boarding` and `Photo updates` when real detailed services exist.
- If template space is limited, show top 3-6 services and make the rest available in an expandable section or chatbot.
- Pricing must remain accurate and attached to the correct service.

### About Paul and Vanessa Wilson

Category: owner story, human trust, family context

Source content:

- Heading: About Deloraine Cattery
- Subheading: Over 20 years of trusted cat care and boarding services
- Section heading: About Paul and Vanessa Wilson
- Copy themes:
  - Paul and Vanessa love animals; taking on Deloraine Cattery feels natural
  - Paul grew up on a farm; Vanessa always had cats and dogs as part of the family
  - They have children Isabella, Mia, Kaia, and Harlo and want to share their love of animals through supervised interaction
  - Family pets include Blaise, Raffy, and other context about cats/dog
  - Income/property support from Deloraine Cattery and Deloraine Cottage
  - Temporary accommodation link: Deloraine Cottage
  - Vanessa's guided healing work is mentioned as external personal context
- Image association: Paul and Vanessa photo

Intent:

- Build personal trust and explain the people behind the care.
- This is the correct source for the About section in redesigned templates.

Template guidance:

- About section must use the owner story and associated Paul/Vanessa photo, not generic facility text.
- If the selected template has an owner/people section, this content is high priority.
- Personal external links may be preserved as secondary links or omitted from visible design if not relevant, but remain indexed for source traceability.

### Commitment

Category: values, reassurance, trust proof

Source content:

- Heading: Our Commitment
- Cards:
  - Compassionate Care: every cat receives individual attention and love from family who understand feline needs
  - Safety & Security: highest standards of safety, cleanliness, and security for peace of mind
  - Family Commitment: every cat treated like their own, updates keep families connected during stay

Intent:

- Reinforce values after owner story.

Template guidance:

- Can become a compact trust band.
- Avoid repeating identical `safe and secure` copy already used in facilities; rewrite as values and outcomes.

### Location

Category: location, directions, practical visit info

Source content:

- Heading: Our Location
- Full address: 50 Konini Street, Abbey Caves, Whangarei
- Distance to Airport: 5 minutes to Onerahi Airport
- Distance to City: 5 minutes to Whangarei CBD
- Driving Directions from Whangarei City:
  1. Head along Riverside Drive towards Onerahi
  2. Take the second street on the left past the BP Petrol Station
  3. Turn left onto Mackesy Road at the Big Fish bus stop
  4. Keep going on Mackesy Road until it becomes Konini Street
  5. We are number 50 Konini Street, approximately 1.3km from Riverside Drive
- Visual landmarks:
  - Big Fish Bus Stop: turn left at Mackesy Road here
  - Our Driveway: look for sign at 50 Konini Street
- GPS CTA: 50 Konini Street, Abbey Caves, Whangarei; click for Google Maps directions
- Media: illustrated map with cat and directions; landmark photos

Intent:

- Help visitors find the property.
- Provide confidence around rural setting and proximity.

Template guidance:

- Map/direction images contain text and are not hero images.
- They should be kept in location or directions sections only.
- Chatbot must index location, distances, and directions.

### Reviews

Category: social proof, testimonials

Source content:

- Heading: What Our Clients Say
- Body: hear from families who trust us with their cats
- Review list includes dated testimonials and star ratings
- Example visible review: Monkey had a great stay and came back happy and chatty; enjoyed pats and extra eye wipes
- Additional visible reviews from April/May 2026 include repeat-stay confidence, easy dropoff/pickup, online portal, kittens staying two weeks, cat door learning, happy cats, recommendations

Intent:

- Social proof and reassurance.

Template guidance:

- Existing preview carousel behavior is appropriate.
- Reviews should remain as reviews, not be rewritten as marketing copy.
- Chatbot should be able to summarize review sentiment but not fabricate review details.

### FAQs

Category: support content, objections, chatbot knowledge

Source content:

Visible FAQ questions include:

- Is there a discount for long term boarding?
- Do you still offer an NDHB discount?
- Do you offer discounts if I have more than one cat?
- Do you offer a delivery service?
- Can I visit my cat while they are in the cattery?
- Our cats have never stayed in a cattery, will they be alright?

Intent:

- Answer booking objections and support questions.
- Reduce visible page clutter if moved into footer/chatbot.

Template guidance:

- FAQs can be displayed in footer, compact accordion, or chatbot, but must be fully indexed.
- Chatbot should answer from these source records and cite/display related policy details where possible.

### Contact and Booking

Category: conversion, enquiry, booking, contact details

Source content:

Contact details:

- Location: 50 Konini St, Abbey Caves, Whangarei
- Grounds: 2.5 acres of peaceful park-like grounds
- Phone/Text: 021 463 616
- Email: enquiry@delorainecattery.com
- Open Hours by appointment only:
  - Mon-Sat: 9:00am - 10:30am
  - Mon-Sun: 4:30pm - 6:00pm
  - Closed Sunday mornings
- Social links: Facebook, Instagram

Contact form:

- Online booking prompt: Make a booking online to see availability or complete the form below
- Fields: First Name, Last Name, Email Address, Phone Number, Service Needed, Cat's Name, Breed, Check-in Date, Check-out Date, Preferred Drop-off Time, Preferred Pick-up Time, Message
- Message guidance: cat appearance, personality, temperament, special needs, dietary requirements, and other details to provide best care
- Button: Send Message

Intent:

- Capture booking and enquiry details.
- Route customers to online booking when possible.

Template guidance:

- Preserve contact details and hours accurately.
- Form fields should map to CatStayys enquiry/booking form where supported.
- Online booking link should be preserved as a primary or secondary CTA.
- Chatbot should answer contact/hours questions and guide users to booking/enquiry.

### Footer

Category: utility navigation, trust closure

Source content:

- Deloraine Cattery footer description: exceptional boarding and care services for cats with over 20 years of experience in feline hospitality and comfort
- Quick Links: Home, Services, Facilities, Book Now, Virtual Tour
- Information: About Us, Contact, Boarding Policies, FAQs
- Open Hours: by appointment only, same hours as contact section
- Contact Info: address, phone, email
- Social links: Facebook, Instagram, YouTube
- Copyright: 2002 Deloraine Cattery. Premium Cat Boarding Facility

Intent:

- Utility, discovery, contact, and trust closure.

Template guidance:

- Footer can carry repeated essentials like phone/email/hours, but should not repeat long hero/about marketing copy.
- Links must remain available if supported by the template.

## Template Planning Rules

The template is a malleable visual model, not a rigid content structure. Before rendering, the AI planner must create a section plan.

Required plan outputs:

- `template_id`
- `source_site_id`
- `section_plan[]`
- `media_assignment[]`
- `copy_assignment[]`
- `omitted_or_delegated_content[]`
- `repetition_risk_report[]`
- `missing_content_report[]`
- `chatbot_index_scope[]`

### Section Plan Fields

Each planned section should include:

- `template_section_role`
- `source_section_ids`
- `content_intent`
- `primary_message`
- `secondary_points`
- `assigned_media_ids`
- `cta_ids`
- `visible_priority`
- `fallback_strategy`
- `omit_if_empty`
- `chatbot_delegation`

### Media Assignment Rules

- Do not reuse the same image fingerprint in adjacent major sections.
- Do not use the same exterior building image for hero, about, why choose, facilities, and owner story.
- Use owner photo only for owner/about content.
- Use map/directions image only for location content.
- Use room images only for rooms unless also valid for gallery.
- Use gallery images to add variety, but keep the gallery itself rich.
- Do not use text-heavy graphics, logos, maps, social cards, or screenshots as hero images.
- If a section has no matching image, adapt the layout rather than filling with stock imagery.

### Copy Assignment Rules

- No identical sentence should appear in more than one major visible section, except phone/email/address where utility repetition is acceptable.
- No same sentiment should be repeated as the main paragraph in hero, about, why choose, facilities, and footer.
- The planner should cluster source text into semantic ideas first, then assign each idea once.
- Copy may be summarized or rewritten for fit, but must preserve source intent and factual claims.
- Pricing, policies, hours, and contact details must not be creatively rewritten.

### Missing Content Rules

If a template slot expects data that does not exist:

- Do not invent fake content.
- Do not insert generic stock text.
- Choose one of:
  - omit the section
  - collapse the layout
  - use a nearby source category if semantically appropriate
  - delegate to chatbot/footer
  - render a compact alternate section

## AI Intelligence Workflow

Recommended pipeline:

1. Crawl and scrape the full public site.
2. Extract visible text, structured data, forms, links, buttons, embeds, and media.
3. Build source records for pages, sections, media, and interactions.
4. Use deterministic metadata first: URLs, headings, alt text, captions, DOM adjacency, file names, page path, and link text.
5. Use OpenAI classification to infer semantic categories, section intent, image purpose, copy purpose, CTA purpose, and chatbot scope.
6. Cluster repeated copy and repeated sentiments.
7. Fingerprint and group near-duplicate photos.
8. Generate a template section plan.
9. Assign copy and images by intent, not by slot order.
10. Run QA checks for repetition, missing source content, wrong image pairing, hero text-overlay risk, and unsupported fake fallbacks.
11. Render the preview from the plan.
12. Save the source index and plan so the chatbot and future edits use the same facts.

## Chatbot Index Scope

The chatbot should index the entire source site, not only the visible redesigned page. Include:

- Business identity and address
- Phone, email, social links
- Opening hours and appointment rules
- Booking/enquiry process
- Room types, prices, and features
- Service prices and conditions
- Facility safety/security/climate/routine details
- About owner story and commitment
- Location directions, airport/city distances, landmarks
- Reviews and review sentiment
- FAQs and policies
- Virtual tour availability
- External links such as online booking where available

The chatbot should answer from source records and should not invent prices, policies, discounts, availability, or medical claims. If the information is not in the source index, it should say it does not have that detail and offer the contact/booking path.

## QA Checklist For Deloraine Editorial Preview

A generated Editorial preview should pass these checks:

- Hero uses Deloraine Cattery identity plus one concise promise.
- Hero image is a real Deloraine image and not a text-heavy graphic.
- About section uses Paul and Vanessa owner story and owner photo.
- Why Choose section uses trust reasons without repeating hero copy.
- Facilities section uses physical facility details and suitable facility imagery.
- Rooms section includes Private Rooms, Indoor Rooms, and Communal Room with correct prices/features and matching images.
- Services section includes real additional services, not generic placeholder services.
- Gallery uses the broad 23-image source gallery or as many as the crawler can extract.
- Reviews remain in a testimonial/review component.
- FAQs are indexed and available through footer/chatbot or a compact accordion.
- Location preserves address, map/directions, distances, and landmarks.
- Contact form preserves booking/enquiry fields and contact details.
- No major marketing paragraph is duplicated across multiple visible sections.
- No same photo appears repeatedly across hero/about/facilities/owner/rooms unless intentionally reused and noted.
- Any omitted content is listed in `omitted_or_delegated_content` with reason and chatbot/footer availability.

## Implementation Notes

This brief should feed the next implementation pass in CatStayys:

- Expand the imported-site database table or JSON payload to store section records, media records, interaction records, and planned template records.
- Add an OpenAI-backed planner step after scrape and before preview rendering.
- Use the source index as the knowledge base for the chatbot.
- Treat fallback stock photos and fallback generic copy as allowed only for synthetic demos, not real imported websites.
- Store source evidence and planned assignments so future previews are repeatable and debuggable.
